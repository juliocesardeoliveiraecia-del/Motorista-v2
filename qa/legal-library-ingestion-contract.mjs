#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const sync = fs.readFileSync('supabase/functions/legal-library-sync/index.ts', 'utf8');
const publish = fs.readFileSync('supabase/functions/legal-library-publish/index.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261113170000_doctor_shared_legal_library.sql', 'utf8');
const schedule = fs.readFileSync('supabase/migrations/20261113200000_schedule_legal_library_monitoring.sql', 'utf8');
const manifest = JSON.parse(fs.readFileSync('data/legal-library/manifest.json', 'utf8'));
const batchSchedule = fs.readFileSync('supabase/migrations/20261113211500_batch_legal_library_cron_jobs.sql', 'utf8');

for (const [name, source] of [['sync', sync], ['publish', publish]]) {
  assert.ok(source.includes('userClient.auth.getUser(token)'), name + ': valid user session is required');
  assert.ok(source.includes('userClient.rpc("is_admin")'), name + ': Doctor admin permission is required');
  assert.ok(source.includes('SUPABASE_SERVICE_ROLE_KEY'), name + ': service key must remain server-side');
}
assert.ok(sync.includes('status: "candidate"'), 'source capture must create candidate versions');
assert.ok(sync.includes('verify_legal_library_cron_token'), 'scheduled calls must verify the Vault-only internal token');
assert.ok(sync.includes('If-None-Match'), 'daily checks must use conditional HTTP requests');
assert.ok(sync.includes('triggerType === "scheduled_daily"'), 'daily checks must be distinguishable from weekly full audits');
assert.ok(!/status:\s*"published"/.test(sync), 'source capture must never publish automatically');
assert.ok(sync.includes('ALLOWED_HOSTS'), 'source capture must enforce official host allowlist');
const brazilianLawIds = ['BR-CF-1988','BR-ADCT-1988','BR-CTB-1997','BR-CP-1940','BR-CPP-1941','BR-LEP-1984','BR-ECA-1990','BR-CC-2002','BR-CDC-1990','BR-LMP-2006','BR-ESTATUTO-IDOSO-2003'];
assert.ok(brazilianLawIds.every(id => manifest.documents.find(doc => doc.document_id === id)?.source?.url?.includes('normaatualizada')), 'all Brazilian law sources must point directly to updated official HTML');
assert.ok(sync.includes('expectedTitles'), 'each Brazilian code must be checked against its expected official title');
assert.ok(sync.includes('EC Nº 141'), 'Constitution capture must prove the current EC 141 revision');
assert.ok(sync.includes('EC Nº 136'), 'ADCT capture must prove its latest applicable EC 136 revision');
assert.ok(sync.includes('REGRA\\s+122'), 'Mandela PDF capture must prove the full 122-rule range');
assert.ok(sync.includes('sha256(source.rawBytes)'), 'source capture must hash original bytes');
assert.ok(sync.includes('source_bytes_base64: encodeBase64(source.rawBytes)'), 'source package must preserve exact original bytes');
assert.ok(publish.includes('await digest(text)'), 'publication must verify the normalized text SHA-256');
assert.ok(publish.includes('await digest(sourceBytes)'), 'publication must verify the original source bytes SHA-256');
assert.ok(sync.includes('extractPdfText(rawBytes)'), 'official PDF sources must be parsed as text, not OCR');
assert.ok(sync.includes('source_format: source.contentType.includes("pdf")'), 'source package must record HTML or PDF format');
assert.ok(publish.includes('await extractPdfText(sourceBytes)'), 'publication must reproduce PDF text from original bytes');
assert.ok(publish.includes('reproducedText !== text'), 'publication must reproduce the extracted text before approval');
assert.ok(publish.includes('userClient.rpc("publish_legal_document_version"'), 'publication must use the atomic RLS-protected RPC');
assert.ok(publish.includes('version.status !== "approved"'), 'publication must require prior editorial approval');
assert.ok(publish.includes('sourceMeta?.url !== version.source_url'), 'publication must verify source provenance');
assert.ok(migration.includes('update public.legal_documents'), 'publication must update the active document pointer');
assert.ok(migration.includes("set status = 'superseded'"), 'publication must preserve history by superseding the previous version');
assert.ok(schedule.includes('create extension if not exists pg_cron'), 'daily/weekly schedule must use Supabase Cron');
assert.ok(schedule.includes('create extension if not exists pg_net'), 'schedule must call the Edge Function asynchronously');
assert.ok(schedule.includes('vault.create_secret'), 'cron token must be generated and stored in Vault');
assert.ok(schedule.includes('doctor-legal-library-daily') && schedule.includes('doctor-legal-library-weekly'), 'both daily and weekly jobs must be registered');
assert.ok(schedule.includes('x-doctor-cron-token'), 'cron must send only the restricted internal token');
assert.ok(!schedule.includes('SUPABASE_SERVICE_ROLE_KEY'), 'service-role credentials must never be stored in the cron request');
assert.equal((batchSchedule.match(/net\.http_post\(/g) || []).length, 14, 'daily and weekly schedules must enqueue seven bounded batches each');
assert.ok(batchSchedule.includes('timeout_milliseconds := 120000'), 'bounded source batches must have sufficient HTTP timeout');
assert.ok(batchSchedule.includes('INT-MANDELA-2015-PT'), 'official Mandela PDF must be included in bounded scheduled checks');
assert.ok(manifest.documents.find(doc => doc.document_id === 'INT-UDHR-1948-PT')?.source?.url?.endsWith('.pdf'), 'DUDH must use the official Portuguese PDF source');
console.log('[legal-library-ingestion-contract] PASS — admin-only capture/review, source integrity, approval gate and atomic publication.');
