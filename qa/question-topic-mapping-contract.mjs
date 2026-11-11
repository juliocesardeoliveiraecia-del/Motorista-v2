import fs from 'node:fs';

const content = fs.readFileSync(new URL('../product-content.js', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../supabase/migrations/20261111011923_map_motorista_questions_to_topics.sql', import.meta.url), 'utf8');
const ids = [...content.matchAll(/id:\s*'([^']+)',\s*subjectId:\s*'([^']+)'/g)].map(m => m[1]);
const failures = [];
if (ids.length !== 47 || new Set(ids).size !== 47) failures.push('O pacote deve conter 47 IDs únicos.');
for (const id of ids) {
  const occurrences = [...migration.matchAll(new RegExp("\\('" + id + "',", 'g'))].length;
  if (occurrences !== 1) failures.push('A questão deve ter exatamente um vínculo de tópico: ' + id);
}
if (!migration.includes('manual_editorial_mapping_v1')) failures.push('Versão do mapeamento editorial ausente.');
if (!migration.includes('supplemental_pending_edital_alignment')) failures.push('Tópico complementar deve ficar identificado como pendente de alinhamento.');
if (!migration.includes("review_status='pending'")) failures.push('A migração deve preservar o estado editorial pendente.');
if (/SET\s+review_status\s*=\s*'approved'/i.test(migration)) failures.push('A migração não pode aprovar questões.');
console.log(JSON.stringify({ questionCount: ids.length, failures }, null, 2));
if (failures.length) process.exit(1);
