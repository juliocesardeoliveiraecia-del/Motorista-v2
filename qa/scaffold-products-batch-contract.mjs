import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { validateBatch, buildBatchOutputs } from '../tools/scaffold-products-batch.mjs';

const example = JSON.parse(fs.readFileSync(new URL('../templates/product-manifest.example.json', import.meta.url), 'utf8'));
const second = structuredClone(example);
second.app.appId = 'concurso-exemplo-dois';
second.app.productId = 'concurso-exemplo-dois';
second.app.platformProductSlug = 'concurso-exemplo-dois-2027';
second.app.appTitle = 'Concurso Dois';
second.app.productName = 'Concurso Dois — Órgão Público';
second.app.appIconBadge = 'C2';

assert.deepEqual(validateBatch({ products: [example, second] }).errors, []);
const bundles = buildBatchOutputs({ products: [example, second] });
assert.equal(bundles.length, 2);
assert.equal(bundles[0].appId, 'doctor-concurso-exemplo');
assert.ok(bundles[0].files['product-context.js']);
assert.doesNotThrow(() => new vm.Script(bundles[0].files['product-context.js']));

const duplicateApp = structuredClone(second);
duplicateApp.app.appId = example.app.appId;
assert.ok(validateBatch([example, duplicateApp]).errors.some(error => error.includes('appId duplicado')));

const duplicateProduct = structuredClone(second);
duplicateProduct.app.productId = example.app.productId;
assert.ok(validateBatch([example, duplicateProduct]).errors.some(error => error.includes('productId duplicado')));

const invalidOne = structuredClone(second);
invalidOne.app.durationHours = 0;
assert.ok(validateBatch([example, invalidOne]).errors.some(error => error.includes('durationHours')));

assert.ok(validateBatch({ products: [] }).errors.length > 0);
assert.ok(validateBatch(Array.from({ length: 51 }, () => example)).errors.some(error => error.includes('limite')));

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'doctor-core-batch-'));
try {
  const firstOut = path.join(root, 'generated');
  fs.mkdirSync(firstOut);
  const firstDir = path.join(firstOut, example.app.appId);
  fs.mkdirSync(firstDir);
  assert.ok(fs.existsSync(firstDir), 'collision fixture must exist');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log('DOCTOR CORE BATCH PRODUCT FACTORY QA: OK');
