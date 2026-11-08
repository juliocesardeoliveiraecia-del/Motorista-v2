import fs from 'node:fs';
import vm from 'node:vm';

const contextSource=fs.readFileSync('product-context.js','utf8');
const contentSource=fs.readFileSync('product-content.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const start=index.indexOf('const DoctorQuestionIntegrity = {');
const end=index.indexOf('\nconst Store =',start);
if(start<0||end<0)throw new Error('DoctorQuestionIntegrity source block not found');
const integritySource=index.slice(start,end);

const sandbox={window:{},console};
vm.createContext(sandbox);
vm.runInContext(contextSource+'\nglobalThis.__CONFIG=EXAM_CONFIG;',sandbox);
vm.runInContext(contentSource+'\nglobalThis.__DATA={SUBJECTS,QUESTIONS};',sandbox);
sandbox.EXAM_CONFIG=sandbox.__CONFIG;
sandbox.ExamRules={optionCount:4};
sandbox.SUBJECTS=sandbox.__DATA.SUBJECTS;
sandbox.QUESTIONS=sandbox.__DATA.QUESTIONS;
sandbox.Store={state:{answerMeta:{},answerLog:{},questionIntegrity:{quarantinedIds:[]}},save(){}};
vm.runInContext(integritySource+'\nglobalThis.__INTEGRITY=DoctorQuestionIntegrity;',sandbox);
const integrity=sandbox.__INTEGRITY;
const {QUESTIONS}=sandbox.__DATA;

function must(label,condition){if(!condition)throw new Error('FAIL: '+label);console.log('PASS:',label);}
must('Runtime integrity gate validates every static question',QUESTIONS.every(q=>integrity.validate(q).ok));
must('Every question is deliverable before quarantine',QUESTIONS.every(q=>integrity.assertDeliverable(q).ok));

const runtimeAnswersCorrect=QUESTIONS.every(q=>
  [0,1,2,3].every(selected=>{
    const result=integrity.answer(q,selected,'contract-test');
    return result.ok && result.evidence.isCorrect===(selected===q.correct);
  })
);
must('Runtime grading is correct for every question and all four options',runtimeAnswersCorrect);

const sample=QUESTIONS[0];
sandbox.Store.state.answerMeta[sample.id]={questionId:sample.id,selected:3,phase:'original'};
sandbox.Store.state.answerLog[sample.id]=3;
const original=JSON.stringify(sandbox.Store.state.answerMeta[sample.id]);
const review=integrity.answer(sample,0,'review');
must('Review attempt does not overwrite original answer evidence',review.ok && JSON.stringify(sandbox.Store.state.answerMeta[sample.id])===original && sandbox.Store.state.answerLog[sample.id]===3);
must('Invalid option is rejected',integrity.answer(sample,4,'practice').reason==='invalid-option');

sandbox.Store.state.questionIntegrity.quarantinedIds=[sample.id];
must('Quarantined question cannot be delivered',integrity.assertDeliverable(sample).reason==='question-quarantined');
sandbox.Store.state.questionIntegrity.quarantinedIds=[];
must('AI question without independent review is blocked',integrity.assertDeliverable({...sample,id:'ai-test',aiGenerated:true,reviewedByDoctor:false}).reason==='question-not-reviewed');
must('AI question after independent review is deliverable',integrity.assertDeliverable({...sample,id:'ai-test-reviewed',aiGenerated:true,reviewedByDoctor:true}).ok);
console.log('QUESTION ANSWER CONTRACT: OK');
