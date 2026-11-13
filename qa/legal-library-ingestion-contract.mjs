#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('supabase/functions/legal-library-sync/index.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261113170000_doctor_shared_legal_library.sql', 'utf8');

for (const phrase of [
  'userClient.auth.getUser(token)',
  'userClient.rpc("is_admin")',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ALLOWED_HOSTS',
  'new TextDecoder(charset).decode(rawBytes)',
  'sha256(source.rawBytes)',
  'source_html: source.html',
  'redirect: "follow"',
  'crypto.subtle.digest("SHA-256"',
  'status: "candidate"',
  'requires_editorial_review: true',
  'Nenhuma versão foi publicada automaticamente',
  'INT-MANDELA-2015-PT',
]) assert.ok(source.includes(phrase), 'missing ingestion safety contract: ' + phrase);

assert.ok(!/status:\s*"published"/.test(source), 'ingestion pipeline must never auto-publish a legal version');
assert.ok(!/current_version_id/.test(source), 'ingestion pipeline must not change the active published version');
assert.ok(!/openai|groq|grok|llm|generateText/i.test(source), 'official-source capture must not use AI providers');
assert.ok(migration.includes("status in ('candidate','in_review','approved','published','superseded','rejected','failed')"));
assert.ok(migration.includes("event_type in ('source_changed','candidate_created','review_requested','approved','published','source_unavailable','capture_failed')"));
console.log('[legal-library-ingestion-contract] PASS — admin-only capture, official-domain allowlist, hashes, candidate-only workflow and no AI dependency.');
