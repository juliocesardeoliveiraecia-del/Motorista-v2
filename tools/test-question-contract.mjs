import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const contractSource = fs.readFileSync(new URL('../core/question-contract.js', import.meta.url), 'utf8');
const sandbox = { window: {}, console, Date };
vm.runInNewContext(contractSource, sandbox);
const C = sandbox.window.DoctorQuestionContract;
assert.ok(C, 'DoctorQuestionContract não carregou');

const base = {
  id: 'qa-test-1',
  subjectId: 'especificos',
  text: 'Questão de teste suficientemente longa para validar o contrato.',
  options: ['A', 'B', 'C', 'D'],
  correct: 2,
  explanations: ['E1', 'E2', 'E3', 'E4']
};

for (let i = 0; i < 4; i++) {
  const r = C.evaluate(base, i);
  assert.equal(r.ok, true);
  assert.equal(r.correct, i === base.correct, 'mapeamento de alternativa incorreto');
}

assert.equal(C.evaluate(base, -1).ok, false);
assert.equal(C.evaluate(base, 4).ok, false);

const a = C.audit(base, 2, 'ctx-v1');
assert.equal(a.ok, true);
assert.equal(a.correct, true);
assert.equal(a.selected, 2);
assert.equal(a.contextVersionId, 'ctx-v1');
assert.ok(a.questionVersionId.includes('@'));
assert.ok(a.contentHash);

const changed = {...base, options: ['A', 'B', 'C2', 'D']};
const v1 = C.version(base).questionVersionId;
const v2 = C.version(changed).questionVersionId;
assert.notEqual(v1, v2, 'alteração do conteúdo não gerou nova versão');

console.log('PASS: contrato de avaliação — A/B/C/D, limites, auditoria e versionamento.');
