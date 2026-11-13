#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const sync = fs.readFileSync('supabase/functions/legal-library-sync/index.ts', 'utf8');
const publish = fs.readFileSync('supabase/functions/legal-library-publish/index.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261113170000_doctor_shared_legal_library.sql', 'utf8');

for (const [name, source] of [['sync', sync], ['publish', publish]]) {
  assert.ok(source.includes('userClient.auth.getUser(token)'), name + ': valid user session is required');
  assert.ok(source.includes('userClient.rpc("is_admin")'), name + ': Doctor admin permission is required');
  assert.ok(source.includes('SUPABASE_SERVICE_ROLE_KEY'), name + ': service key must remain server-side');
}
assert.ok(sync.includes('status: "candidate"'), 'source capture must create candidate versions');
assert.ok(!/status:\s*"published"/.test(sync), 'source capture must never publish automatically');
assert.ok(sync.includes('ALLOWED_HOSTS'), 'source capture must enforce official host allowlist');
assert.ok(sync.includes('sha256(source.rawBytes)'), 'source capture must hash original bytes');
assert.ok(sync.includes('source_bytes_base64: encodeBase64(source.rawBytes)'), 'source package must preserve exact original bytes');
assert.ok(publish.includes('await digest(text)'), 'publication must verify the normalized text SHA-256');
assert.ok(publish.includes('await digest(sourceBytes)'), 'publication must verify the original source bytes SHA-256');
assert.ok(publish.includes('extractHtml(pack.source_html as string) !== text'), 'publication must reproduce extracted text from the original HTML');
assert.ok(publish.includes('userClient.rpc("publish_legal_document_version"'), 'publication must use the atomic RLS-protected RPC');
assert.ok(publish.includes('version.status !== "approved"'), 'publication must require prior editorial approval');
assert.ok(publish.includes('sourceMeta?.url !== version.source_url'), 'publication must verify source provenance');
assert.ok(migration.includes('update public.legal_documents'), 'publication must update the active document pointer');
assert.ok(migration.includes("set status = 'superseded'"), 'publication must preserve history by superseding the previous version');
console.log('[legal-library-ingestion-contract] PASS — admin-only capture/review, source integrity, approval gate and atomic publication.');
