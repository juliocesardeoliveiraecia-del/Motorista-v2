#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const required = ['data/legal-library/manifest.json','docs/VADE-MECUM-DOCTOR-ARCHITECTURE.md','tools/validate-legal-library.mjs','supabase/migrations/20261113170000_doctor_shared_legal_library.sql'];
const errors = [];
for (const file of required) if (!fs.existsSync(file)) errors.push('missing ' + file);
if (!errors.length) {
  const manifest = JSON.parse(fs.readFileSync(required[0], 'utf8'));
  const migration = fs.readFileSync(required[3], 'utf8');
  const ids = new Set(manifest.documents.map(d => d.document_id));
  for (const id of ['BR-CF-1988','BR-ADCT-1988','INT-UDHR-1948-PT','BR-CTB-1997']) if (!ids.has(id)) errors.push('missing initial document ' + id);
  const declaration = manifest.documents.find(d => d.document_id === 'INT-UDHR-1948-PT');
  if (declaration?.category !== 'human_rights_international_documents') errors.push('DUDH must be classified as an international human-rights document');
  if (!manifest.documents.every(d => d.status === 'planned')) errors.push('un-ingested content cannot be marked published/validated');
  if (!migration.includes('foreign key (document_id, current_version_id)')) errors.push('current version must belong to its legal document');
  if (!migration.includes('prevent_published_legal_version_mutation')) errors.push('published legal versions must be immutable');
  if (!migration.includes('publish_legal_document_version')) errors.push('atomic legal publication RPC is required');
  if (!migration.includes('security invoker')) errors.push('legal publication RPC must use caller permissions and RLS');
  if (!migration.includes('public.is_admin()')) errors.push('legal editorial actions must be restricted to Doctor admins');
  if (!migration.includes('status <> \'approved\'')) errors.push('only approved legal versions may be published');
  if (!migration.includes('as $' + String.fromCharCode(10) + 'begin') || !migration.includes('end;' + String.fromCharCode(10) + '$;')) errors.push('legal version trigger must use valid PostgreSQL dollar quoting');
  if ((migration.split('as $$').length - 1) !== 2 || (migration.split('$$;').length - 1) !== 2) errors.push('both PostgreSQL functions must use balanced dollar quoting');
  if (!migration.includes("new.status not in ('published','superseded')")) errors.push('published versions must not be reverted to editable states');
  if (!migration.includes('new.published_at is distinct from old.published_at')) errors.push('published timestamp must be immutable');
  if (!migration.includes("old.status in ('published','superseded')")) errors.push('published/superseded version protection is missing');
  if (!migration.includes('alter table public.legal_document_versions enable row level security')) errors.push('RLS must be enabled on legal versions');
  if (!migration.includes('revoke insert, update, delete on public.legal_documents, public.legal_document_versions from anon, authenticated')) errors.push('client roles must not write legal source records');
  const run = spawnSync(process.execPath, [required[2], required[0]], { encoding: 'utf8' });
  if (run.status !== 0) errors.push('manifest validator failed: ' + (run.stderr || run.stdout));
}
if (errors.length) {
  console.error('[legal-library-contract] FAILED');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
}
console.log('[legal-library-contract] PASS — initial catalog, source classification and publication gates.');
