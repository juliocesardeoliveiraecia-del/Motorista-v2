#!/usr/bin/env node
import fs from 'node:fs';
const raw=fs.readFileSync(new URL('../content.js',import.meta.url),'utf8');
const qm=raw.match(/const QUESTIONS = ([\\s\\S]*?);\\nwindow\\.SUBJECTS/),sm=raw.match(/const SUBJECTS = ([\\s\\S]*?);\\nconst QUESTIONS/);
if(!qm||!sm)throw new Error('Content blocks not found');
const Q=Function('return '+qm[1])(),S=Function('return '+sm[1])();
const errors=[],ids=new Set();
for(const q of Q){if(ids.has(q.id))errors.push('ID duplicado: '+q.id);ids.add(q.id);if(!S.some(s=>s.id===q.subjectId))errors.push('Matéria inexistente: '+q.id);if(typeof q.text!=='string'||q.text.trim().length<20)errors.push('Enunciado inválido: '+q.id);if(!Array.isArray(q.options)||q.options.length!==4)errors.push('Alternativas != 4: '+q.id);if(!Number.isInteger(q.correct)||q.correct<0||q.correct>=4)errors.push('Gabarito inválido: '+q.id);if(!Array.isArray(q.explanations)||q.explanations.length!==4)errors.push('Explicações != 4: '+q.id);if(q.reviewStatus!=='approved')errors.push('Questão sem gate approved: '+q.id);if(!q.reviewCycle||!q.reviewedByDoctor||!q.sourceReference)errors.push('Rastreabilidade incompleta: '+q.id);if(new Set(q.options.map(x=>String(x).trim().toLowerCase())).size!==4)errors.push('Alternativas duplicadas: '+q.id);}
const required=S.reduce((n,s)=>n+s.officialQuestions,0);if(Q.length<Math.min(required,40))console.warn('WARNING: banco local tem '+Q.length+' questões; simulado oficial exige '+required+'. O Core não deve inventar conteúdo para preencher a prova.');
if(errors.length){console.error(errors.join('\\n'));process.exit(1);}console.log('PASS: '+Q.length+' questões; estrutura, gate de publicação e rastreabilidade OK.');
