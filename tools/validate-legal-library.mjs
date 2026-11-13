#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2] || 'data/legal-library/manifest.json';
const errors = [];
const fail = (message) => errors.push(message);
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
} catch (error) {
  console.error('[legal-library] Cannot read/parse manifest: ' + error.message);
  process.exit(1);
}
if (manifest.schema_version !== 1) fail('schema_version must be 1');
if (manifest.library_id !== 'doctor-vade-mecum-br') fail('unexpected library_id');
if (manifest.access_policy !== 'free_official_sources_only') fail('free official sources only policy is required');
if (manifest.update_policy?.online_change_detection !== 'daily') fail('daily online change detection is required');
if (manifest.update_policy?.full_integrity_audit_days !== 7) fail('weekly full audit is required');
if (manifest.update_policy?.never_replace_last_valid_version_on_failure !== true) fail('last-known-good protection is required');
if (!Array.isArray(manifest.documents) || manifest.documents.length === 0) fail('documents must be a non-empty array');
const ids = new Set();
const slugs = new Set();
const categories = new Set(['constitution','codes_and_traffic','human_rights_international_documents','administrative_law','criminal_law','civil_law','special_legislation','local_legislation','other']);
const statuses = new Set(['planned','source_verified','ingested','validated','published','blocked']);
for (const [i, doc] of (manifest.documents || []).entries()) {
  const label = 'documents[' + i + ']';
  if (!doc.document_id || ids.has(doc.document_id)) fail(label + ': missing or duplicate document_id');
  if (doc.document_id) ids.add(doc.document_id);
  if (!doc.slug || slugs.has(doc.slug)) fail(label + ': missing or duplicate slug');
  if (doc.slug) slugs.add(doc.slug);
  if (!doc.official_title || !doc.display_title) fail(label + ': official and display titles are required');
  if (!categories.has(doc.category)) fail(label + ': unsupported category');
  if (!statuses.has(doc.status)) fail(label + ': unsupported status');
  if (!doc.source?.authority || !doc.source?.url) fail(label + ': official source authority and URL are required');
  try { if (new URL(doc.source.url).protocol !== 'https:') fail(label + ': source must use HTTPS'); }
  catch { fail(label + ': invalid source URL'); }
  if (doc.cover?.original_doctor_artwork_required !== true) fail(label + ': original Doctor cover artwork is required');
  if (doc.offline?.eligible !== true) fail(label + ': offline eligibility must be explicit');
  if (!Array.isArray(doc.versions)) fail(label + ': versions must be an array');
  for (const [v, version] of (doc.versions || []).entries()) {
    if (!version.version_id || !version.source_url || !version.captured_at || !version.sha256_raw) fail(label + '.versions[' + v + ']: incomplete immutable version metadata');
  }
}
for (const [i, collection] of (manifest.product_collections || []).entries()) {
  if (!collection.product_slug) fail('product_collections[' + i + ']: product_slug is required');
  for (const id of collection.document_ids || []) if (!ids.has(id)) fail('product_collections[' + i + ']: unknown document ' + id);
}
if (errors.length) {
  console.error('[legal-library] FAILED');
  errors.forEach(error => console.error(' - ' + error));
  process.exit(1);
}
console.log('[legal-library] PASS — ' + manifest.documents.length + ' catalog entries; ' + (manifest.product_collections || []).length + ' product collections.');
