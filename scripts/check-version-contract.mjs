import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const index = read('index.html');
const config = read('production-config.js');
const version = JSON.parse(read('version.json'));
const sw = read('service-worker.js');
const context = read('product-context.js');

const configMatch = config.match(/version:\s*'([^']+)'/);
const inlineConfigMatch = index.match(/window\.DOCTOR_PRODUCTION_CONFIG\s*=\s*Object\.freeze\(\{[\s\S]*?version:\s*'([^']+)'/);
const cacheMatch = sw.match(/CACHE_NAME\s*=\s*'motorista-ipameri-v([^']+)'/);
const expected = version.version;
const errors = [];
if (!expected) errors.push('version.json não define version.');
if (configMatch?.[1] !== expected) errors.push(`production-config.js version=${configMatch?.[1]}; esperado ${expected}`);
if (inlineConfigMatch?.[1] !== expected) errors.push(`config inline do index.html version=${inlineConfigMatch?.[1]}; esperado ${expected}`);
if (cacheMatch?.[1] !== expected) errors.push(`Service Worker cache version=${cacheMatch?.[1]}; esperado ${expected}`);
if (!index.includes(`version.json?v=${expected}-`)) errors.push('index.html não consulta version.json com cache-busting da versão atual.');
if (!index.includes(`service-worker.js?v=${expected}`)) errors.push('index.html não registra o Service Worker com a versão atual.');
if (!index.includes(`doctor-core-quality.js?v=${expected}`)) errors.push('index.html não carrega doctor-core-quality.js com a versão atual.');
if (!context.includes(`coreVersion: '${expected}-core'`)) errors.push(`product-context.js não declara coreVersion ${expected}-core.`);

if (errors.length) {
  console.error('CONTRATO DE VERSÃO INVÁLIDO:');
  for (const error of errors) console.error('- ' + error);
  process.exit(1);
}
console.log('Contrato de versão consistente: ' + expected);
