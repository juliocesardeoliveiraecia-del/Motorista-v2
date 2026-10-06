import fs from 'node:fs';
import vm from 'node:vm';

const contextSource=fs.readFileSync('product-context.js','utf8');
const contentSource=fs.readFileSync('product-content.js','utf8');

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(contextSource+'\nthis.__CTX={EXAM_CONFIG};',sandbox);
vm.runInContext(contentSource+'\nthis.__DATA={SUBJECTS,QUESTIONS};',sandbox);

const {EXAM_CONFIG}=sandbox.__CTX;
const {SUBJECTS,QUESTIONS}=sandbox.__DATA;
const errors=[];
const warnings=[];

const fail=(msg)=>errors.push(msg);
const warn=(msg)=>warnings.push(msg);

if(!EXAM_CONFIG?.productId) fail('Product Context sem productId.');
if(!EXAM_CONFIG?.contentVersion) fail('Product Context sem contentVersion.');
if(!Array.isArray(SUBJECTS)||!SUBJECTS.length) fail('Nenhuma matéria configurada.');
if(!Array.isArray(QUESTIONS)||!QUESTIONS.length) fail('Nenhuma questão configurada.');

const subjectIds=new Set(SUBJECTS.map(s=>s.id));
const questionIds=new Set();
const signatures=new Set();

for(const [i,q] of (QUESTIONS||[]).entries()){
  const where='questão '+(q?.id||('#'+i));
  if(!q?.id) fail(where+': id ausente.');
  else if(questionIds.has(q.id)) fail(where+': id duplicado.');
  else questionIds.add(q.id);
  if(!subjectIds.has(q?.subjectId)) fail(where+': matéria inexistente.');
  if(typeof q?.text!=='string'||q.text.trim().length<20) fail(where+': enunciado inválido.');
  const n=Number(EXAM_CONFIG.alternativesPerQuestion||4);
  if(!Array.isArray(q?.options)||q.options.length!==n) fail(where+': quantidade de alternativas incompatível com o contexto.');
  if(!Number.isInteger(q?.correct)||q.correct<0||q.correct>=n) fail(where+': gabarito fora do intervalo.');
  if(!Array.isArray(q?.explanations)||q.explanations.length!==n) fail(where+': explicações desalinhadas.');
  const opts=(q?.options||[]).map(x=>String(x).trim().toLowerCase());
  if(new Set(opts).size!==opts.length) fail(where+': alternativas duplicadas.');
  if(opts.some(x=>!x)) fail(where+': alternativa vazia.');
  const sig=[q.text,...opts].join('|').replace(/\s+/g,' ').trim().toLowerCase();
  if(signatures.has(sig)) fail(where+': duplicata de conteúdo.');
  signatures.add(sig);
}

const distribution=(SUBJECTS||[]).map(s=>({id:s.id,have:(QUESTIONS||[]).filter(q=>q.subjectId===s.id).length,need:Number(s.officialQuestions||0)}));
for(const d of distribution){
  if(d.have<d.need) warn('Distribuição incompleta para '+d.id+': '+d.have+'/'+d.need+'. O simulado oficial deve permanecer bloqueado.');
}

console.log(JSON.stringify({
  productId:EXAM_CONFIG.productId,
  contentVersion:EXAM_CONFIG.contentVersion,
  subjects:SUBJECTS.length,
  questions:QUESTIONS.length,
  distribution,
  errors,
  warnings
},null,2));

if(errors.length) process.exit(1);
