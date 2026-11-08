#!/usr/bin/env node
/**
 * Doctor Core — batch product configuration factory.
 *
 * Dry run:
 *   node tools/scaffold-products-batch.mjs --batch-manifest ./products.batch.json
 *
 * Write isolated product configuration bundles:
 *   node tools/scaffold-products-batch.mjs --batch-manifest ./products.batch.json --out-root ./generated-products --apply
 *
 * Every product is validated before any output is written. Existing product
 * directories are never overwritten. Academic content and assets are not generated.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateManifest, buildOutputs } from './scaffold-product.mjs';

const MAX_PRODUCTS = 50;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateBatch(batch) {
  const errors = [];
  const products = Array.isArray(batch) ? batch : batch?.products;
  if (!Array.isArray(products) || products.length === 0) return { products: [], errors: ['batch precisa conter products com ao menos um manifesto'] };
  if (products.length > MAX_PRODUCTS) errors.push('batch excede o limite de ' + MAX_PRODUCTS + ' produtos por execução');

  const appIds = new Set();
  const productIds = new Set();
  for (let i = 0; i < products.length; i++) {
    const manifest = products[i];
    const prefix = 'products[' + i + ']';
    for (const error of validateManifest(manifest)) errors.push(prefix + ': ' + error);
    const appId = manifest?.app?.appId;
    const productId = manifest?.app?.productId;
    if (!SLUG.test(String(appId || ''))) continue;
    if (appIds.has(appId)) errors.push(prefix + ': appId duplicado no lote: ' + appId);
    appIds.add(appId);
    if (productIds.has(productId)) errors.push(prefix + ': productId duplicado no lote: ' + productId);
    productIds.add(productId);
  }
  return { products, errors };
}

export function buildBatchOutputs(batch) {
  const { products, errors } = validateBatch(batch);
  if (errors.length) throw new Error(errors.join('\n'));
  return products.map(manifest => ({
    appId: manifest.app.appId,
    productId: manifest.app.productId,
    files: buildOutputs(manifest)
  }));
}

function arg(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

async function main() {
  const input = arg('--batch-manifest');
  if (!input) {
    console.error('Uso: node tools/scaffold-products-batch.mjs --batch-manifest products.batch.json [--out-root ./generated-products] [--apply]');
    process.exit(2);
  }

  let batch;
  try {
    batch = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
  } catch (error) {
    console.error('Não foi possível ler o batch JSON:', error.message);
    process.exit(2);
  }

  let bundles;
  try {
    bundles = buildBatchOutputs(batch);
  } catch (error) {
    console.error('LOTE INVÁLIDO');
    for (const line of error.message.split('\n')) console.error('- ' + line);
    process.exit(1);
  }

  const apply = process.argv.includes('--apply');
  if (!apply) {
    console.log('LOTE VÁLIDO — prévia sem gravar arquivos:');
    for (const bundle of bundles) console.log('- ' + bundle.appId + ' (' + bundle.productId + '): ' + Object.keys(bundle.files).join(', '));
    console.log('Produtos validados: ' + bundles.length + '. Use --apply e --out-root para gravar.');
    return;
  }

  const outArg = arg('--out-root');
  if (!outArg) {
    console.error('--out-root é obrigatório com --apply.');
    process.exit(2);
  }

  const outRoot = path.resolve(outArg);
  const destinations = bundles.map(bundle => path.join(outRoot, bundle.appId));
  const collisions = destinations.filter(destination => fs.existsSync(destination));
  if (collisions.length) {
    console.error('Nenhum arquivo foi gravado. Diretórios já existentes:');
    for (const destination of collisions) console.error('- ' + destination);
    process.exit(2);
  }

  const created = [];
  try {
    fs.mkdirSync(outRoot, { recursive: true });
    for (let i = 0; i < bundles.length; i++) {
      const destination = destinations[i];
      fs.mkdirSync(destination, { recursive: false });
      created.push(destination);
      for (const [name, content] of Object.entries(bundles[i].files)) {
        fs.writeFileSync(path.join(destination, name), content, { encoding: 'utf8', flag: 'wx' });
      }
    }
  } catch (error) {
    for (const destination of created.reverse()) fs.rmSync(destination, { recursive: true, force: true });
    console.error('Falha ao gravar lote; diretórios criados nesta execução foram revertidos:', error.message);
    process.exit(1);
  }

  console.log('LOTE GERADO: ' + bundles.length + ' produtos em ' + outRoot);
  for (const bundle of bundles) console.log('- ' + bundle.appId + ': ' + Object.keys(bundle.files).join(', '));
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) main();
