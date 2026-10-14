import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(read('product-context.js') + '\n;globalThis.__config = EXAM_CONFIG;', context, { filename: 'product-context.js' });
vm.runInContext(read('product-content.js') + '\n;globalThis.__content = { SUBJECTS, QUESTIONS };', context, { filename: 'product-content.js' });
const { SUBJECTS, QUESTIONS } = context.__content;
const config = context.__config;
const failures = [];
const normalize = value => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
const seenIds = new Map();
const seenBodies = new Map();
for (const q of QUESTIONS) {
  const errors = [];
  if (!q || typeof q !== 'object') errors.push('questão inválida');
  if (!normalize(q?.id)) errors.push('ID ausente');
  if (!SUBJECTS.some(s => s.id === q?.subjectId)) errors.push('matéria desconhecida');
  if (normalize(q?.text).length < 20) errors.push('enunciado curto/vazio');
  if (!Array.isArray(q?.options) || q.options.length !== (config.examRules?.optionCount ?? 4)) errors.push('número de alternativas inválido');
  if (Array.isArray(q?.options) && (q.options.some(x => !normalize(x)) || new Set(q.options.map(normalize)).size !== q.options.length)) errors.push('alternativa vazia/duplicada');
  if (!Number.isInteger(q?.correct) || q.correct < 0 || q.correct >= (config.examRules?.optionCount ?? 4)) errors.push('gabarito fora do intervalo');
  if (!Array.isArray(q?.explanations) || q.explanations.length !== (config.examRules?.optionCount ?? 4) || q.explanations.some(x => !normalize(x))) errors.push('explicações ausentes/desalinhadas');
  if (Array.isArray(q?.explanations) && Number.isInteger(q?.correct) && q.correct >= 0 && q.correct < q.explanations.length) {
    if (/^(errado|incorreto|incorreta)\b/i.test(String(q.explanations[q.correct]).trim())) errors.push('explicação correta contradiz o gabarito');
    q.explanations.forEach((x, i) => { if (i !== q.correct && /^(correto|correta|alternativa correta)\b/i.test(String(x).trim())) errors.push('explicação incorreta rotulada como correta no índice ' + i); });
  }
  if (q?.id && seenIds.has(q.id)) errors.push('ID duplicado com ' + seenIds.get(q.id));
  else if (q?.id) seenIds.set(q.id, q.id);
  const body = [q?.subjectId, q?.text, ...(Array.isArray(q?.options) ? q.options : [])].map(normalize).join('¦');
  if (seenBodies.has(body)) errors.push('conteúdo duplicado com ' + seenBodies.get(body));
  else seenBodies.set(body, q?.id || '(sem ID)');
  if (errors.length) failures.push({ id: q?.id || '(sem ID)', errors });
}
const distribution = SUBJECTS.map(s => ({ subject: s.id, have: QUESTIONS.filter(q => q.subjectId === s.id).length, need: Number(s.officialQuestions || 0) }));
console.log(JSON.stringify({ core: config.coreVersion, product: config.productId, totalQuestions: QUESTIONS.length, distribution, structuralFailures: failures }, null, 2));
if (failures.length) process.exitCode = 1;
