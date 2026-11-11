import fs from 'node:fs';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const query = source.match(/const rows=await this\._fetch\('products\?select=id,slug,status&slug=eq\.\s*'\+slug\+([^']*)'/);
const failures = [];
if (!query) failures.push('Radar precisa resolver o produto central pelo slug do produto atual.');
if (query?.[1]?.includes('status=eq.published')) failures.push('O produto atual em draft/maintenance deve continuar resolvível para homologação MASTER.');
if (!source.includes("const bridgedProductId=String(bridge?.productId||'').trim()")) failures.push('O Radar deve priorizar o UUID confirmado pela ponte autenticada da Plataforma.');
if (!source.includes('async loadCentral()')) failures.push('Cliente central do Radar não encontrado.');
console.log(JSON.stringify({ currentProductQuery: query?.[0] || null, failures }, null, 2));
if (failures.length) process.exit(1);
