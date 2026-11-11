import fs from 'node:fs';

const content = fs.readFileSync(new URL('../product-content.js', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../supabase/migrations/20261111010740_motorista_content_registry_traceability.sql', import.meta.url), 'utf8');
const pairs = [...content.matchAll(/id:\s*'([^']+)',\s*subjectId:\s*'([^']+)'/g)].map(m => ({ id:m[1], subject:m[2] }));
const failures = [];
if (pairs.length !== 47) failures.push('O pacote estático mudou: revise a migração e atualize o registro de questões.');
for (const q of pairs) {
  const expected = `('${q.id}','doctor-${q.subject}')`;
  if (!migration.includes(expected)) failures.push('Questão sem registro na migração: ' + q.id);
}
for (const subject of ['portugues','rlm','realidade','especificos']) {
  if (!migration.includes(`'doctor-${subject}'`)) failures.push('Matéria sem registro: ' + subject);
}
if (!migration.includes("'pending'") || !migration.includes('pending_independent_review')) failures.push('A migração deve manter revisão editorial pendente.');
if (!migration.includes('question_traceability_product_question_id_uidx')) failures.push('Índice idempotente por produto e ID de questão ausente.');
if (!migration.includes('2026.1') || !migration.includes('last-edital-last-exam')) failures.push('Versão ou estágio de conteúdo não documentado.');
if (/review_status\s*=\s*'approved'/.test(migration)) failures.push('A migração não pode aprovar conteúdo automaticamente.');
console.log(JSON.stringify({ questions: pairs.length, failures }, null, 2));
if (failures.length) process.exit(1);
