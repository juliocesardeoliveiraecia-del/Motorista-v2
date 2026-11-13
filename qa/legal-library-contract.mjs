#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const required = ['data/legal-library/manifest.json','docs/VADE-MECUM-DOCTOR-ARCHITECTURE.md','tools/validate-legal-library.mjs'];
const errors = [];
for (const file of required) if (!fs.existsSync(file)) errors.push('missing ' + file);
if (!errors.length) {
  const manifest = JSON.parse(fs.readFileSync(required[0], 'utf8'));
  const ids = new Set(manifest.documents.map(d => d.document_id));
  for (const id of ['BR-CF-1988','BR-ADCT-1988','INT-UDHR-1948-PT','BR-CTB-1997']) if (!ids.has(id)) errors.push('missing initial document ' + id);
  const declaration = manifest.documents.find(d => d.document_id === 'INT-UDHR-1948-PT');
  if (declaration?.category !== 'human_rights_international_documents') errors.push('DUDH must be classified as an international human-rights document');
  if (!manifest.documents.every(d => d.status === 'planned')) errors.push('un-ingested content cannot be marked published/validated');
  const run = spawnSync(process.execPath, [required[2], required[0]], { encoding: 'utf8' });
  if (run.status !== 0) errors.push('manifest validator failed: ' + (run.stderr || run.stdout));
}
if (errors.length) {
  console.error('[legal-library-contract] FAILED');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
}
console.log('[legal-library-contract] PASS — initial catalog, source classification and publication gates.');
