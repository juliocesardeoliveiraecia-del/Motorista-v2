#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

function extractConst(name) {
  const marker = 'const ' + name + ' =';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error('Não encontrei ' + marker);
  const open = html.indexOf('[', start);
  if (open < 0) throw new Error('Não encontrei array de ' + name);
  let depth = 0, quote = null, escaped = false;
  for (let i = open; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) return html.slice(open, i + 1);
    }
  }
  throw new Error('Array de ' + name + ' não foi fechado');
}

function parseArray(name) {
  return vm.runInNewContext('(' + extractConst(name) + ')', Object.create(null));
}

const subjects = parseArray('SUBJECTS');
const questions = parseArray('QUESTIONS');
const errors = [];
const warnings = [];
const ids = new Set();
const texts = new Set();
const subjectIds = new Set(subjects.map(s => s.id));

for (const q of questions) {
  if (!q || typeof q !== 'object') { errors.push('Questão inválida/não objeto'); continue; }
  if (!q.id) errors.push('Questão sem id');
  else if (ids.has(q.id)) errors.push('ID duplicado: ' + q.id);
  else ids.add(q.id);

  if (!subjectIds.has(q.subjectId)) errors.push(q.id + ': subjectId inexistente: ' + q.subjectId);
  if (!q.text || !q.text.trim()) errors.push(q.id + ': enunciado vazio');
  if (q.text && texts.has(q.text.trim())) warnings.push(q.id + ': enunciado duplicado');
  if (q.text) texts.add(q.text.trim());

  if (!Array.isArray(q.options)) errors.push(q.id + ': options não é array');
  else {
    if (q.options.length < 2) errors.push(q.id + ': menos de 2 alternativas');
    if (q.options.some(x => typeof x !== 'string' || !x.trim())) errors.push(q.id + ': alternativa vazia');
    const normalized = q.options.map(x => String(x).trim().toLowerCase());
    if (new Set(normalized).size !== normalized.length) warnings.push(q.id + ': alternativas duplicadas');
  }

  if (!Number.isInteger(q.correct)) errors.push(q.id + ': correct não é inteiro');
  else if (!Array.isArray(q.options) || q.correct < 0 || q.correct >= q.options.length)
    errors.push(q.id + ': correct fora do intervalo');

  if (!Array.isArray(q.explanations)) errors.push(q.id + ': explanations não é array');
  else {
    if (Array.isArray(q.options) && q.explanations.length !== q.options.length)
      errors.push(q.id + ': explanations/options com tamanhos diferentes');
    if (q.explanations.some(x => typeof x !== 'string' || !x.trim()))
      errors.push(q.id + ': explicação vazia');
  }

  if (!q.reviewStatus || !q.reviewedByDoctor)
    warnings.push(q.id + ': sem metadados explícitos de revisão/publicação');
}

const counts = Object.fromEntries(subjects.map(s => [s.id, questions.filter(q => q.subjectId === s.id).length]));
const official = Object.fromEntries(subjects.map(s => [s.id, s.officialQuestions ?? null]));

for (const s of subjects) {
  if (Number.isInteger(s.officialQuestions) && counts[s.id] < s.officialQuestions)
    warnings.push(s.id + ': banco local tem ' + counts[s.id] + ', edital exige ' + s.officialQuestions);
}

console.log(JSON.stringify({
  questions: questions.length,
  subjects: subjects.length,
  counts,
  official,
  errors,
  warnings,
  publicationGate: errors.length === 0 ? 'structurally_validated_only' : 'blocked'
}, null, 2));

process.exitCode = errors.length ? 1 : 0;
