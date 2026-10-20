const assert = require('node:assert/strict');
const path = require('node:path');
const qualityPath = path.join(__dirname, '..', 'doctor-core-quality.js');
const realSetTimeout = global.setTimeout;

function loadQuality(windowObject) {
  delete require.cache[require.resolve(qualityPath)];
  global.setTimeout = () => 0;
  global.window = windowObject;
  require(qualityPath);
  return windowObject.DOCTOR_CORE_AUDIT;
}
function q(id,subjectId,text,correct=0,reviewStatus='APROVAR',contextVersion='test-v1') {
  return {id,subjectId,text,options:['Alternativa A','Alternativa B','Alternativa C','Alternativa D'],correct,
    explanations:['Explicação A','Explicação B','Explicação C','Explicação D'],
    reviewedByDoctor:reviewStatus==='pending'?false:true,reviewStatus,contextVersion};
}
const subjects = [
  {id:'a',name:'Matéria A',officialQuestions:2,points:1},
  {id:'b',name:'Matéria B',officialQuestions:1,points:2}
];
const rules = {questionCount:3,optionCount:4,scoring:{correct:'subject-weight'}};
function runAudit({questions,session}) {
  const windowObject={SUBJECTS:subjects,QUESTIONS:questions,ExamRules:rules,EXAM_CONFIG:{contentVersion:'test-v1'},
    DOCTOR_CORE_RUNTIME:{Quiz:{session},Store:{state:{},save(){}}}};
  return loadQuality(windowObject);
}
try {
  const valid=[
    q('q1','a','Enunciado suficientemente longo para testar a questão um'),
    q('q2','a','Enunciado suficientemente longo para testar a questão dois',1),
    q('q3','b','Enunciado suficientemente longo para testar a questão três',2)
  ];
  {
    const report=runAudit({questions:valid,session:{type:'simulado',questions:valid}});
    assert.equal(report.structuralOk,true);
    assert.equal(report.completeForOfficialSimulado,true);
    assert.equal(report.simulado.ok,true);
    assert.equal(report.publishable,true);
  }
  {
    const duplicated=[...valid,q('q4','a',valid[0].text,3)];
    const report=runAudit({questions:duplicated,session:{type:'simulado',questions:duplicated}});
    assert.equal(report.duplicateFingerprints.length,1,'same stem/options must be duplicate even with different IDs/gabarito');
    assert.equal(report.simulado.ok,false,'wrong count/distribution/duplicate must fail');
  }
  {
    const invalid=valid.map((item,i)=>i===0?{...item,correct:8}:item);
    const report=runAudit({questions:invalid,session:{type:'simulado',questions:invalid}});
    assert.equal(report.invalid.length,1,'out-of-range answer key must be rejected');
    assert.equal(report.simulado.ok,false);
  }
  {
    const pending=valid.map((item,i)=>i===0?{...item,reviewedByDoctor:false,reviewStatus:'pending'}:item);
    const report=runAudit({questions:pending,session:{type:'simulado',questions:pending}});
    assert.equal(report.publishable,false,'unreviewed content must not be publishable');
    assert.equal(report.simulado.ok,false,'unreviewed content must not enter a simulado');
  }
  {
    const incomplete=valid.slice(0,2);
    const report=runAudit({questions:incomplete,session:{type:'simulado',questions:incomplete}});
    assert.equal(report.completeForOfficialSimulado,false);
    assert.equal(report.simulado.ok,false,'short exam must fail the contract');
  }
  {
    const approved=q('approved','a','Questão aprovada com contexto vigente');
    const pending=q('pending','a','Questão sem aprovação editorial',0,'pending');
    const pool=[approved,pending];
    const integrity={assertDeliverable(){return {ok:true};}};
    const quiz={session:null,poolFor(id){return pool.filter(x=>x.subjectId===id);},
      pickFreshQuestion(){return pending;},isAnsweredAnywhere(){return false;},shuffle(a){return a;},
      resumableSimulado(){return null;},clearPersisted(){}};
    const store={state:{questionIntegrity:{quarantinedIds:[]}},save(){},getWrongQuestions(){return pool.map(question=>({question}));}};
    loadQuality({SUBJECTS:[{id:'a',name:'A',officialQuestions:1,points:1}],QUESTIONS:pool,
      ExamRules:{questionCount:1,optionCount:4,scoring:{correct:'subject-weight'}},
      EXAM_CONFIG:{contentVersion:'test-v1'},DoctorQuestionIntegrity:integrity,Quiz:quiz,Store:store});
    assert.equal(integrity.assertDeliverable(approved).ok,true);
    assert.equal(integrity.assertDeliverable(pending).reason,'question-not-reviewed');
    assert.deepEqual(quiz.poolFor('a').map(x=>x.id),['approved']);
    assert.equal(quiz.pickFreshQuestion('todas').id,'approved');
    assert.deepEqual(store.getWrongQuestions().map(x=>x.question.id),['approved']);
  }
  console.log('Doctor Core Quality Gate: all tests passed');
} finally {
  global.setTimeout = realSetTimeout;
  delete global.window;
}
