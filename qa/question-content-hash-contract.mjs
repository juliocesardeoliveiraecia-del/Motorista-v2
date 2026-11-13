import fs from 'node:fs';

const content = fs.readFileSync(new URL('../product-content.js', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../supabase/migrations/20261113004310_motorista_question_content_hashes_2026_3.sql', import.meta.url), 'utf8');
const questionPart = content.slice(content.indexOf('const QUESTIONS = ['));
const blocks = [...questionPart.matchAll(/  \{\n    id:\s*'([^']+)',\s*subjectId:\s*'([^']+)',[\s\S]*?\n  \}/g)].map(m => ({ id:m[1], raw:m[0] }));
const failures = [];
if (blocks.length !== 47 || new Set(blocks.map(q => q.id)).size !== 47) failures.push('O pacote deve conter 47 blocos únicos.');
for (const q of blocks) {
  const sqlLiteral = "'" + q.raw.replace(/'/g, "''") + "'";
  if (!migration.includes(sqlLiteral)) failures.push('Bloco exato sem fingerprint na migração: ' + q.id);
}
if (!migration.includes("digest(convert_to(raw_content,'UTF8'),'sha256')")) failures.push('A migração deve gerar SHA-256.');
if (!migration.includes("'raw-question-block-v1'") || !migration.includes("'contentHash'")) failures.push('Metadados de hash ausentes.');
if (/review_status\s*=\s*'approved'/i.test(migration)) failures.push('A migração de hash não pode aprovar questões.');
console.log(JSON.stringify({ questions:blocks.length, failures }, null, 2));
if (failures.length) process.exit(1);
