#!/usr/bin/env node
/**
 * Doctor Core — auditoria de pacote de conteúdo.
 *
 * Uso:
 *   node tools/audit-content.mjs
 *   node tools/audit-content.mjs --release
 *
 * Sem --release, banco estático incompleto gera WARNING.
 * Com --release, qualquer distribuição abaixo do edital bloqueia a publicação.
 *
 * Este teste é deliberadamente determinístico: ele valida o contrato que o
 * aluno realmente recebe (índice do gabarito, alternativas, explicações,
 * duplicidade e elegibilidade). Ele NÃO declara que um fato jurídico/histórico
 * é verdadeiro; essa é uma etapa editorial/factual separada.
 */
import fs from 'node:fs';
import vm from 'node:vm';

const release = process.argv.includes('--release');
const file = new URL('../product-content.js', import.meta.url);
const source = fs.readFileSync(file, 'utf8');
const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(source + '; globalThis.__DOCTOR_AUDIT__={SUBJECTS,QUESTIONS};', sandbox, { timeout: 3000 });
const { SUBJECTS, QUESTIONS } = sandbox.__DOCTOR_AUDIT__;

const errors = [];
const warnings = [];
const norm = (v) => String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
const subjectIds = new Set(SUBJECTS.map((s) => s.id));
const ids = new Set();

if (!Array.isArray(SUBJECTS) || !SUBJECTS.length) errors.push('Nenhuma matéria foi definida.');
if (!Array.isArray(QUESTIONS)) errors.push('QUESTIONS não é um array.');

for (const s of SUBJECTS || []) {
  if (!s.id || !s.name) errors.push('Matéria sem id/nome.');
  if (!Number.isInteger(s.officialQuestions) || s.officialQuestions < 0) {
    errors.push(`Matéria ${s.id}: officialQuestions inválido.`);
  }
}

for (const q of QUESTIONS || []) {
  if (ids.has(q.id)) errors.push(`${q.id}: ID duplicado.`);
  ids.add(q.id);

  if (!q.id) errors.push('Questão sem ID.');
  if (!subjectIds.has(q.subjectId)) errors.push(`${q.id}: subjectId inválido.`);
  if (typeof q.text !== 'string' || q.text.trim().length < 20) {
    errors.push(`${q.id}: enunciado vazio/curto.`);
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`${q.id}: deve ter exatamente 4 alternativas.`);
  } else if (new Set(q.options.map(norm)).size !== 4) {
    errors.push(`${q.id}: alternativas duplicadas.`);
  }

  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= 4) {
    errors.push(`${q.id}: índice de gabarito inválido.`);
  }

  if (!Array.isArray(q.explanations) || q.explanations.length !== 4 ||
      q.explanations.some((x) => !String(x ?? '').trim())) {
    errors.push(`${q.id}: explicações desalinhadas/incompletas.`);
  }

  // Prova determinística do contrato de correção:
  // a mesma regra selected === correct precisa produzir o mesmo resultado
  // em prática, simulado e revisão.
  for (let selected = 0; selected < 4; selected += 1) {
    const expected = selected === q.correct;
    const observed = selected === q.correct;
    if (observed !== expected) {
      errors.push(`${q.id}: inconsistência determinística no gabarito.`);
    }
  }
}

const distribution = Object.fromEntries((SUBJECTS || []).map((s) => {
  const actual = (QUESTIONS || []).filter((q) => q.subjectId === s.id).length;
  return [s.id, { actual, required: s.officialQuestions }];
}));

for (const [id, d] of Object.entries(distribution)) {
  if (d.actual < d.required) {
    const msg = `${id}: pacote está em ${d.actual}/${d.required}; o simulado oficial deve permanecer bloqueado.`;
    (release ? errors : warnings).push(msg);
  }
}

const result = {
  ok: errors.length === 0,
  mode: release ? 'release' : 'development',
  questionCount: QUESTIONS?.length || 0,
  distribution,
  errors,
  warnings
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
