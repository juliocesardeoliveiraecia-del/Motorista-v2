#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';

const migration = fs.readFileSync('supabase/migrations/20261113170000_doctor_shared_legal_library.sql', 'utf8');
const hardening = fs.readFileSync('supabase/migrations/20261113195000_harden_legal_library_policies_and_indexes.sql', 'utf8');
const db = new PGlite();

try {
  const bootstrap = [
    'create role anon;',
    'create role authenticated;',
    'create role service_role;',
    'create schema auth;',
    'create schema storage;',
    "create function auth.uid() returns uuid language sql stable as $$ select '11111111-1111-4111-8111-111111111111'::uuid $$;",
    'create function public.is_admin() returns boolean language sql stable as $$ select true $$;',
    'create table storage.buckets (id text primary key, name text not null, public boolean not null default false, file_size_limit bigint, allowed_mime_types text[]);',
    'create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text not null, name text not null);',
    'alter table storage.objects enable row level security;'
  ].join('\n');
  await db.exec(bootstrap);
  await db.exec(migration);
  await db.exec(hardening);

  const tables = await db.query("select table_name from information_schema.tables where table_schema='public' and table_name in ('legal_documents','legal_document_versions','legal_update_runs','legal_change_events')");
  assert.equal(tables.rows.length, 4, 'all four legal library tables must be created');

  const bucket = await db.query("select id, public from storage.buckets where id='legal-library'");
  assert.equal(bucket.rows.length, 1, 'private legal bucket must be created');
  assert.equal(bucket.rows[0].public, false, 'legal bucket must remain private');

  const selectPolicies = await db.query("select count(*)::int as count from pg_policies where schemaname='public' and tablename='legal_document_versions' and cmd='SELECT'");
  assert.equal(selectPolicies.rows[0].count, 1, 'published and admin reads must share one permissive policy');
  const fkIndexes = await db.query("select count(*)::int as count from pg_indexes where schemaname='public' and indexname in ('legal_events_run_id_idx','legal_events_version_id_idx','legal_documents_current_version_fk_idx')");
  assert.equal(fkIndexes.rows[0].count, 3, 'all legal foreign keys must have covering indexes');
  const triggerFunction = await db.query("select proconfig from pg_proc where proname='prevent_published_legal_version_mutation'");
  assert.ok(String(triggerFunction.rows[0].proconfig).includes('search_path=public, pg_temp'), 'trigger function must have a fixed search_path');

  const docs = await db.query("select count(*)::int as count from public.legal_documents");
  assert.equal(docs.rows[0].count, 13, 'initial catalog must seed thirteen documents');

  const old = await db.query(
    "insert into public.legal_document_versions (document_id,version_label,source_url,content_sha256,storage_path,status) values ('BR-CTB-1997',$1,$2,$3,$4,'published') returning id",
    ['old-version','https://www.planalto.gov.br/old','a'.repeat(64),'BR-CTB-1997/old.json']
  );
  const oldId = old.rows[0].id;
  await db.query("update public.legal_documents set current_version_id=$1 where document_id='BR-CTB-1997'", [oldId]);

  const candidate = await db.query(
    "insert into public.legal_document_versions (document_id,version_label,source_url,content_sha256,storage_path,status) values ('BR-CTB-1997',$1,$2,$3,$4,'approved') returning id",
    ['new-version','https://www.planalto.gov.br/new','b'.repeat(64),'BR-CTB-1997/new.json']
  );
  const newId = candidate.rows[0].id;
  const published = await db.query("select public.publish_legal_document_version($1,'integration test') as result", [newId]);
  assert.equal(published.rows[0].result.status, 'published');

  const current = await db.query("select current_version_id from public.legal_documents where document_id='BR-CTB-1997'");
  assert.equal(current.rows[0].current_version_id, newId, 'document pointer must switch to new version');

  const statuses = await db.query("select id,status from public.legal_document_versions where id=$1 or id=$2", [oldId,newId]);
  const statusById = new Map(statuses.rows.map(row => [row.id,row.status]));
  assert.equal(statusById.get(oldId), 'superseded', 'previous version must be preserved as superseded');
  assert.equal(statusById.get(newId), 'published', 'new version must become published');

  const events = await db.query("select count(*)::int as count from public.legal_change_events where event_type='published'");
  assert.equal(events.rows[0].count, 1, 'publication event must be recorded');
  console.log('[legal-library-migration-contract] PASS — migrations execute, private bucket/catalog are created, RLS is consolidated, FK indexes exist, and publication is atomic.');
} finally {
  await db.close();
}
