import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../product-content.js', import.meta.url), 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(source + String.fromCharCode(10) + ';globalThis.__doctorContent = { SUBJECTS, QUESTIONS };', sandbox, { timeout: 2000 });
const { SUBJECTS, QUESTIONS } = sandbox.__doctorContent;
const failures = [];
const warnings = [];
const norm = (v) => String(v ?? '').normalize('NFKC').trim().split(/\s+/).join(' ').toLocaleLowerCase('pt-BR');

if (!Array.isArray(SUBJECTS)) throw new Error('SUBJECTS precisa ser um array');
if (!Array.isArray(QUESTIONS) || QUESTIONS.length === 0) throw new Error('QUESTIONS precisa ser um array não vazio');

const subjectIds = new Set();
for (const subject of SUBJECTS) {
  if (!subject?.id || subjectIds.has(subject.id)) failures.push('matéria com ID ausente/duplicado: ' + (subject?.id ?? '(sem id)'));
  subjectIds.add(subject?.id);
}

const ids = new Set();
const fingerprints = new Map();
let explanationLabelsChecked = 0;

for (const q of QUESTIONS) {
  const id = String(q?.id ?? '(sem id)');
  if (!q || typeof q !== 'object') { failures.push(id + ': objeto de questão inválido'); continue; }
  if (!q.id || ids.has(q.id)) failures.push(id + ': ID ausente ou duplicado');
  ids.add(q.id);
  if (!subjectIds.has(q.subjectId)) failures.push(id + ': matéria não existe em SUBJECTS (' + q.subjectId + ')');
  if (norm(q.text).length < 20) failures.push(id + ': enunciado vazio/curto');

  const options = Array.isArray(q.options) ? q.options : [];
  if (options.length < 2) failures.push(id + ': alternativas ausentes');
  const normalizedOptions = options.map(norm);
  if (normalizedOptions.some(x => !x)) failures.push(id + ': alternativa vazia');
  if (new Set(normalizedOptions).size !== normalizedOptions.length) failures.push(id + ': alternativas duplicadas');
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= options.length) failures.push(id + ': índice de gabarito fora do intervalo');

  if (!Array.isArray(q.explanations) || q.explanations.length !== options.length) {
    failures.push(id + ': explicações não correspondem ao número de alternativas');
  } else {
    q.explanations.forEach((explanation, index) => {
      const text = String(explanation ?? '').trim();
      if (!norm(text)) failures.push(id + ': explicação vazia na alternativa ' + index);
      const startsCorrect = text.toLocaleLowerCase('pt-BR').startsWith('correto:');
      const startsWrong = text.toLocaleLowerCase('pt-BR').startsWith('errado:');
      if (startsCorrect || startsWrong) {
        explanationLabelsChecked++;
        const shouldBeCorrect = index === q.correct;
        if (shouldBeCorrect && !startsCorrect) failures.push(id + ': gabarito aponta alternativa ' + index + ', mas a explicação começa como Errado');
        if (!shouldBeCorrect && !startsWrong) failures.push(id + ': distrator ' + index + ' não está rotulado como Errado');
      } else {
        warnings.push(id + ': explicação ' + index + ' sem rótulo textual padronizado; exige revisão editorial');
      }
    });
  }

  const fingerprint = [q.id, q.subjectId, q.text, ...normalizedOptions, q.correct, ...(Array.isArray(q.explanations) ? q.explanations.map(norm) : [])].join('¦');
  if (fingerprints.has(fingerprint)) failures.push(id + ': conteúdo duplicado de ' + fingerprints.get(fingerprint));
  else fingerprints.set(fingerprint, id);
}

console.log(JSON.stringify({
  bankQuestions: QUESTIONS.length,
  subjects: SUBJECTS.length,
  explanationLabelsChecked,
  warnings: warnings.length,
  failures: failures.length,
  failuresDetail: failures,
  warningsDetail: warnings.slice(0, 30)
}, null, 2));

if (failures.length) process.exitCode = 1;
