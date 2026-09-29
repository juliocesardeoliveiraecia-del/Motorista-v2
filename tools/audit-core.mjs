import fs from 'node:fs';
import assert from 'node:assert/strict';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const content = fs.readFileSync(new URL('../content.js', import.meta.url), 'utf8');

assert.equal(index.includes('start-simulado-partial'), false, 'simulado parcial ainda pode ser iniciado');
assert.equal(index.includes('r.score >= 60'), false, 'pontuação mínima está hardcoded em 60');
assert.equal(index.includes('selected === q.correct'), false, 'renderização/progresso usa comparação direta sem contrato');
assert.equal(index.includes('selected !== q.correct'), false, 'caderno de erros usa comparação direta sem contrato');
assert.ok(index.includes('DoctorQuestionContract.audit(q, optionIndex, EXAM_CONFIG.contentVersion)'), 'resposta do simulado não passa pelo contrato');
assert.ok(index.includes('DoctorQuestionContract.version(q).questionVersionId'), 'prática não verifica versão da questão');
assert.ok(index.includes('q.reviewStatus === \'approved\''), 'gate de publicação ausente');
assert.ok(index.includes("reviewStatus:'pending_review'"), 'questões IA não entram explicitamente em revisão');
assert.equal(index.includes('_extractRadarSearchResults'), false, 'Radar antigo de busca web do app ainda está ativo');
assert.ok(index.includes('/rest/v1/rpc/get_radar_feed'), 'Radar não está consumindo RPC central');
const questionBlocks = [...content.matchAll(/reviewStatus\s*:\s*["']approved["']/g)].length;
assert.ok(questionBlocks >= 32, 'baseline de questões aprovadas inferior ao esperado');
console.log('PASS: auditoria estática do Core — avaliação, publicação, simulado e Radar.');
