const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const qualitySource = fs.readFileSync(path.join(__dirname, '..', 'doctor-core-quality.js'), 'utf8');
function runAudit({subjects, questions, rules, session}){
  const window = {
    SUBJECTS: subjects,
    QUESTIONS: questions,
    ExamRules: rules,
    DOCTOR_CORE_RUNTIME: { Quiz: { session }, Store: { state: {}, save(){} } }
  };
  vm.runInNewContext(qualitySource, { window, setTimeout(){} });
  return window.DOCTOR_CORE_AUDIT;
}
const subjects = [
  {id:'a',name:'Matéria A',officialQuestions:2,points:1},
  {id:'b',name:'Matéria B',officialQuestions:1,points:2}
];
const rules = {questionCount:3,optionCount:4,scoring:{correct:'subject-weight'}};
const q = (id,subjectId,text,correct=0) => ({
  id,subjectId,text,
  options:['Alternativa A','Alternativa B','Alternativa C','Alternativa D'],
  correct,
  explanations:['Explicação A','Explicação B','Explicação C','Explicação D']
});
const valid = [q('q1','a','Enunciado suficientemente longo para testar a questão um'),q('q2','a','Enunciado suficientemente longo para testar a questão dois',1),q('q3','b','Enunciado suficientemente longo para testar a questão três',2)];

{
  const report=runAudit({subjects,questions:valid,rules,session:{type:'simulado',questions:valid}});
  assert.equal(report.structuralOk,true);
  assert.equal(report.completeForOfficialSimulado,true);
  assert.equal(report.simulado.ok,true);
}
{
  const duplicated=[...valid,q('q4','a',valid[0].text,3)];
  const report=runAudit({subjects,questions:duplicated,rules,session:{type:'simulado',questions:duplicated}});
  assert.equal(report.duplicateFingerprints.length,1,'same stem/options must be duplicate even with different IDs/gabarito');
  assert.equal(report.simulado.ok,false,'simulado with wrong count/distribution/duplicate must fail');
}
{
  const invalid=valid.map((item,i)=>i===0?{...item,correct:8}:item);
  const report=runAudit({subjects,questions:invalid,rules,session:{type:'simulado',questions:invalid}});
  assert.equal(report.invalid.length,1,'out-of-range answer key must be rejected');
  assert.equal(report.simulado.ok,false);
}
{
  const incomplete=valid.slice(0,2);
  const report=runAudit({subjects,questions:incomplete,rules,session:{type:'simulado',questions:incomplete}});
  assert.equal(report.completeForOfficialSimulado,false);
  assert.equal(report.simulado.ok,false,'short exam must fail the contract');
}
console.log('Doctor Core Quality Gate: all tests passed');
