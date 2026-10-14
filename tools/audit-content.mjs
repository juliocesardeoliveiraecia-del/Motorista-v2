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
const evaluatorSource = fs.readFileSync(new URL('../question-evaluation.js', import.meta.url), 'utf8');
vm.runInContext(evaluatorSource, sandbox, { timeout: 3000 });
vm.runInContext(source + '; globalThis.__DOCTOR_AUDIT__={SUBJECTS,QUESTIONS};', sandbox, { timeout: 3000 });
const { SUBJECTS, QUESTIONS } = sandbox.__DOCTOR_AUDIT__;
const answerContract = sandbox.DoctorAnswerContract;

const errors = [];
const warnings = [];
const norm = (v) => String(v ?? '').trim().replace(/\\s+/g, ' ').toLowerCase();
const subjectIds = new Set((SUBJECTS || []).map((s) => s.id));
const ids = new Set();

if (!Array.isArray(SUBJECTS) || !SUBJECTS.length) errors.push('Nenhuma matéria foi definida.');
if (!Array.isArray(QUESTIONS)) errors.push('QUESTIONS não é um array.');
if (!answerContract || typeof answerContract.evaluate !== 'function') errors.push('Contrato de avaliação compartilhado ausente.');

const fixture = { options: ['A','B','C','D'], correct: 2 };
const fixtureExpected = [false, false, true, false];
for (let selected = 0; selected < 4; selected += 1) {
  const result = answerContract?.evaluate(fixture, selected);
  if (!result?.ok || result.isCorrect !== fixtureExpected[selected] ||
      result.selected !== selected || result.correct !== 2) {
    errors.push(`Contrato de avaliação falhou para opção ${selected}.`);
  }
}
for (const selected of [-1, 4, 1.5, '2']) {
  if (answerContract?.evaluate(fixture, selected)?.ok !== false) {
    errors.push(`Contrato aceitou opção inválida: ${String(selected)}.`);
  }
}
if (!source.includes('DoctorAnswerContract.evaluate')) {
  errors.push('Runtime não usa o mesmo contrato de avaliação que a auditoria testa.');
}
if (!source.includes('question-evaluation.js')) {
  errors.push('Runtime não carrega o módulo de avaliação compartilhado.');
}

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
  if (typeof q.text !== 'string' || q.text.trim().length < 20) errors.push(`${q.id}: enunciado vazio/curto.`);
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`${q.id}: deve ter exatamente 4 alternativas.`);
  } else if (new Set(q.options.map(norm)).size !== 4) {
    errors.push(`${q.id}: alternativas duplicadas.`);
  }
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= 4) errors.push(`${q.id}: índice de gabarito inválido.`);
  if (!Array.isArray(q.explanations) || q.explanations.length !== 4 ||
      q.explanations.some((x) => !String(x ?? '').trim())) errors.push(`${q.id}: explicações desalinhadas/incompletas.`);

  // Exercita o MESMO contrato chamado pelo runtime; não duplica a expressão de correção.
  if (Array.isArray(q.options) && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length) {
    for (let selected = 0; selected < q.options.length; selected += 1) {
      const result = answerContract?.evaluate(q, selected);
      const expected = selected === q.correct;
      if (!result?.ok || result.isCorrect !== expected || result.selected !== selected || result.correct !== q.correct) {
        errors.push(`${q.id}: contrato real de avaliação divergiu na opção ${selected}.`);
      }
    }
  }

  const reviewed = q.reviewedByDoctor === true && ['approved', 'APROVAR'].includes(q.reviewStatus);
  const traceable = Boolean(String(q.sourceReference || '').trim() && String(q.contextVersionId || '').trim());
  if (!reviewed || !traceable) {
    const msg = `${q.id}: falta aprovação editorial independente e/ou rastreabilidade de fonte/contexto.`;
    (release ? errors : warnings).push(msg);
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
