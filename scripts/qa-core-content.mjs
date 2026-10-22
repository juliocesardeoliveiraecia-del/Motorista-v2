import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../product-content.js', import.meta.url), 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(source + '\n;globalThis.__doctorContent = { SUBJECTS, QUESTIONS };', sandbox, { timeout: 2000 });
const { SUBJECTS, QUESTIONS } = sandbox.__doctorContent;
const failures = [];
const warnings = [];
const norm = (v) => String(v ?? '').normalize('NFKC').trim().replace(/\\s+/g, ' ').toLocaleLowerCase('pt-BR');

assert.ok(Array.isArray(SUBJECTS), 'SUBJECTS precisa ser um array');
assert.ok(Array.isArray(QUESTIONS), 'QUESTIONS precisa ser um array');
assert.ok(QUESTIONS.length > 0, 'O banco não pode estar vazio');

const subjectIds = new Set();
for (const s of SUBJECTS) {
  if (!s?.id || subjectIds.has(s.id)) failures.push(`matéria com ID ausente/duplicado: ${s?.id ?? '(sem id)'}`);
  subjectIds.add(s?.id);
}

const ids = new Set();
const fingerprints = new Map();
let prefixAudited = 0;
for (const q of QUESTIONS) {
  const id = String(q?.id ?? '(sem id)');
  if (!q || typeof q !== 'object') { failures.push(`${id}: objeto de questão inválido`); continue; }
  if (!q.id || ids.has(q.id)) failures.push(`${id}: ID ausente ou duplicado`);
  ids.add(q.id);
  if (!subjectIds.has(q.subjectId)) failures.push(`${id}: subjectId não existe em SUBJECTS (${q.subjectId})`);
  if (norm(q.text).length < 20) failures.push(`${id}: enunciado vazio/curto`);
  if (!Array.isArray(q.options) || q.options.length < 2) failures.push(`${id}: alternativas ausentes`);
  const options = Array.isArray(q.options) ? q.options.map(norm) : [];
  if (options.some(x => !x)) failures.push(`${id}: alternativa vazia`);
  if (new Set(options).size !== options.length) failures.push(`${id}: alternativas duplicadas`);
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= options.length) failures.push(`${id}: índice de gabarito fora do intervalo`);
  if (!Array.isArray(q.explanations) || q.explanations.length !== options.length) {
    failures.push(`${id}: explicações não correspondem ao número de alternativas`);
  } else {
    q.explanations.forEach((e, i) => {
      if (!norm(e)) failures.push(`${id}: explicação vazia na alternativa ${i}`);
      const text = String(e ?? '').trim();
      if (/^(Correto|Errado)\\s*:/i.test(text)) {
        prefixAudited++;
        const expected = i === q.correct ? 'Correto' : 'Errado';
        const actual = text.match(/^(Correto|Errado)\\s*:/i)?.[1];
        if (actual.toLowerCase() !== expected.toLowerCase()) {
          failures.push(`${id}: explicação da alternativa ${i} diz "${actual}", mas o índice de gabarito indica "${expected}"`);
        }
      } else {
        warnings.push(`${id}: explicação da alternativa ${i} não usa prefixo padronizado; exige revisão editorial`);
      }
    });
  }
  const fp = [q.id, q.subjectId, q.text, ...options, q.correct, ...(Array.isArray(q.explanations) ? q.explanations.map(norm) : [])].join('¦');
  if (fingerprints.has(fp)) failures.push(`${id}: conteúdo duplicado de ${fingerprints.get(fp)}`);
  else fingerprints.set(fp, id);
}

const report = {
  bankQuestions: QUESTIONS.length,
  subjects: SUBJECTS.length,
  prefixAudited,
  warnings: warnings.length,
  failures: failures.length,
  failuresDetail: failures,
  warningsDetail: warnings.slice(0, 30)
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
