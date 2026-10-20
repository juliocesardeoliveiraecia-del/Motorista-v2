/* Doctor Core Quality Gate — V1.2.0
 * Fail-closed runtime guard + structural contract audit.
 * Não substitui revisão factual/editorial independente.
 */
(function(){
  'use strict';
  const VERSION='1.2.0';
  const coreIntegrity=typeof DoctorQuestionIntegrity!=='undefined'?DoctorQuestionIntegrity:(window.DoctorQuestionIntegrity||null);
  const coreQuiz=typeof Quiz!=='undefined'?Quiz:(window.Quiz||null);
  const coreStore=typeof Store!=='undefined'?Store:(window.Store||null);
  const coreConfig=typeof EXAM_CONFIG!=='undefined'?EXAM_CONFIG:(window.EXAM_CONFIG||{});
  const coreAI=typeof DoctorAICore!=='undefined'?DoctorAICore:(window.DoctorAICore||null);
  const subjects=typeof SUBJECTS!=='undefined'?SUBJECTS:(Array.isArray(window.SUBJECTS)?window.SUBJECTS:[]);
  const questions=typeof QUESTIONS!=='undefined'?QUESTIONS:(Array.isArray(window.QUESTIONS)?window.QUESTIONS:[]);
  const rules=typeof ExamRules!=='undefined'?ExamRules:(window.ExamRules||{});
  const runtime={Quiz:coreQuiz,Store:coreStore,...(window.DOCTOR_CORE_RUNTIME||{})};

  function norm(v){return String(v==null?'':v).normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');}
  function fingerprint(q){
    const opts=Array.isArray(q?.options)?q.options.map(norm).sort():[];
    return [norm(q?.subjectId),norm(q?.text),...opts].join('¦');
  }
  function validAnswer(q){
    const n=Number(rules.optionCount||4);
    return Number.isInteger(q?.correct)&&q.correct>=0&&q.correct<n&&Array.isArray(q?.options)&&q.options.length===n;
  }
  function distributionFor(pool){
    return subjects.map(s=>{
      const have=pool.filter(q=>q?.subjectId===s.id).length;
      const need=Number(s.officialQuestions||0);
      return {id:s.id,name:s.name,have,need,missing:Math.max(0,need-have),excess:Math.max(0,have-need),exact:have===need};
    });
  }
  function findDuplicates(pool){
    const seen=new Map(),duplicates=[];
    pool.forEach(q=>{
      const fp=fingerprint(q);
      if(seen.has(fp))duplicates.push({id:q?.id||'(sem id)',duplicateOf:seen.get(fp),reason:'enunciado e alternativas repetidos, independentemente do ID/gabarito'});
      else seen.set(fp,q?.id||'(sem id)');
    });
    return duplicates;
  }
  function approved(q){
    const status=String(q?.reviewStatus||'').trim().toUpperCase();
    return !!q && q.reviewedByDoctor===true &&
      ['APROVAR','CORRIGIR','APPROVED','APPROVED_WITH_CORRECTION'].includes(status) &&
      String(q.contextVersion||'')===String(coreConfig.contentVersion||'');
  }

  // A revisão independente precisa ser compatível com a versão atual do Product Context.
  // Questões estáticas sem aprovação explícita ficam indisponíveis até revisão editorial.
  if(coreAI&&typeof coreAI.reviewQuestions==='function'&&!coreAI.__qualityGateReviewWrapped){
    const originalReview=coreAI.reviewQuestions.bind(coreAI);
    coreAI.reviewQuestions=async function(pool,subject){
      const result=await originalReview(pool,subject);
      if(!result?.ok||!Array.isArray(result.questions))return result;
      return {...result,questions:result.questions.map(q=>({...q,contextVersion:String(coreConfig.contentVersion||''),reviewedAt:q.reviewedAt||new Date().toISOString()}))};
    };
    coreAI.__qualityGateReviewWrapped=true;
  }
  if(coreIntegrity){
    coreIntegrity.isApprovedForDelivery=approved;
    if(typeof coreIntegrity.assertDeliverable==='function'&&!coreIntegrity.__qualityGateWrapped){
      const originalAssert=coreIntegrity.assertDeliverable.bind(coreIntegrity);
      coreIntegrity.assertDeliverable=function(q){
        const result=originalAssert(q);
        if(!result?.ok)return result;
        if(!approved(q))return {ok:false,reason:'question-not-reviewed',errors:['questão sem aprovação editorial independente para a versão atual do conteúdo']};
        return result;
      };
      coreIntegrity.__qualityGateWrapped=true;
    }
  }
  if(coreQuiz&&typeof coreQuiz.poolFor==='function'&&!coreQuiz.__qualityGatePoolWrapped){
    const originalPool=coreQuiz.poolFor.bind(coreQuiz);
    coreQuiz.poolFor=function(subjectId){return originalPool(subjectId).filter(q=>approved(q));};
    coreQuiz.__qualityGatePoolWrapped=true;
  }
  if(coreQuiz&&typeof coreQuiz.pickFreshQuestion==='function'&&!coreQuiz.__qualityGateFreshWrapped){
    coreQuiz.pickFreshQuestion=function(subjectId){
      const blocked=new Set(coreStore?.state?.questionIntegrity?.quarantinedIds||[]);
      const candidates=questions.filter(q=>(subjectId==='todas'||q?.subjectId===subjectId)&&!blocked.has(q?.id)&&approved(q)&&!this.isAnsweredAnywhere(q.id));
      return candidates.length?this.shuffle(candidates)[0]:null;
    };
    coreQuiz.__qualityGateFreshWrapped=true;
  }
  if(coreQuiz&&typeof coreQuiz.resumableSimulado==='function'&&!coreQuiz.__qualityGateResumeWrapped){
    const originalResume=coreQuiz.resumableSimulado.bind(coreQuiz);
    coreQuiz.resumableSimulado=function(){
      const saved=originalResume();
      if(saved&&(!Array.isArray(saved.questions)||!saved.questions.every(approved))){this.clearPersisted?.();return null;}
      return saved;
    };
    coreQuiz.__qualityGateResumeWrapped=true;
  }
  if(coreStore&&typeof coreStore.getWrongQuestions==='function'&&!coreStore.__qualityGateWrongWrapped){
    const originalWrong=coreStore.getWrongQuestions.bind(coreStore);
    coreStore.getWrongQuestions=function(subjectId){return originalWrong(subjectId).filter(entry=>approved(entry.question));};
    coreStore.__qualityGateWrongWrapped=true;
  }

  function auditBank(){
    const invalid=[],ids=new Set(),duplicateIds=[],pendingReview=[];
    questions.forEach(q=>{
      const errors=[];
      if(!q||typeof q!=='object'){invalid.push({id:'(sem id)',errors:['questão inválida']});return;}
      if(!norm(q.id))errors.push('id ausente');
      if(!subjects.some(s=>s.id===q.subjectId))errors.push('matéria inválida');
      if(norm(q.text).length<20)errors.push('enunciado vazio/curto');
      const n=Number(rules.optionCount||4);
      if(!Array.isArray(q.options)||q.options.length!==n)errors.push('alternativas inválidas');
      if(Array.isArray(q.options)){
        const opts=q.options.map(norm);
        if(opts.some(x=>!x))errors.push('alternativa vazia');
        if(new Set(opts).size!==opts.length)errors.push('alternativas duplicadas');
      }
      if(!validAnswer(q))errors.push('gabarito inválido ou incompatível com as alternativas');
      if(!Array.isArray(q.explanations)||q.explanations.length!==n)errors.push('explicações desalinhadas');
      if(Array.isArray(q.explanations)&&q.explanations.some(x=>!norm(x)))errors.push('explicação vazia');
      if(q.id&&ids.has(q.id))duplicateIds.push(q.id);
      if(q.id)ids.add(q.id);
      if(errors.length)invalid.push({id:q.id||'(sem id)',errors});
      if(!approved(q))pendingReview.push({id:q.id||'(sem id)',reviewStatus:q.reviewStatus||'pending',contextVersion:q.contextVersion||null});
    });
    const duplicateFingerprints=findDuplicates(questions);
    const distribution=distributionFor(questions);
    const expected=Number(rules.questionCount||0);
    const distributionExact=distribution.every(x=>x.exact)&&(!expected||questions.length===expected);
    const deliverable=questions.filter(q=>approved(q)&&!invalid.some(x=>x.id===q.id)&&!duplicateIds.includes(q.id)&&!duplicateFingerprints.some(x=>x.id===q.id));
    return {
      version:VERSION,auditedAt:new Date().toISOString(),totalQuestions:questions.length,
      expectedExamQuestions:expected,minimumBank:distribution.reduce((a,x)=>a+x.need,0),
      completeForOfficialSimulado:distributionExact,distributionExact,distribution,
      invalid,duplicateIds,duplicateFingerprints,pendingReview,
      deliverableCount:deliverable.length,
      publishable:distributionExact&&deliverable.length===questions.length&&!invalid.length&&!duplicateIds.length&&!duplicateFingerprints.length,
      structuralOk:!invalid.length&&!duplicateIds.length&&!duplicateFingerprints.length
    };
  }
  function auditSimulado(){
    const session=runtime.Quiz?.session;
    if(!session||session.type!=='simulado')return {ok:true,skipped:true,failures:[]};
    const pool=Array.isArray(session.questions)?session.questions:[];
    const failures=[];
    const expectedCount=Number(rules.questionCount||0);
    if(!pool.length)failures.push('simulado sem questões');
    if(expectedCount&&pool.length!==expectedCount)failures.push('quantidade de questões diferente do edital');
    const ids=pool.map(q=>norm(q?.id)).filter(Boolean);
    if(ids.length!==pool.length)failures.push('questão sem ID');
    if(new Set(ids).size!==ids.length)failures.push('IDs repetidos no simulado');
    if(pool.some(q=>!validAnswer(q)))failures.push('gabarito inválido ou alternativas incompatíveis');
    if(pool.some(q=>!subjects.some(s=>s.id===q?.subjectId)))failures.push('matéria não reconhecida');
    if(pool.some(q=>!approved(q)))failures.push('questão sem aprovação editorial/versionamento');
    const distribution=distributionFor(pool);
    if(distribution.some(x=>!x.exact))failures.push('distribuição por matéria diferente do edital');
    const duplicateFingerprints=findDuplicates(pool);
    if(duplicateFingerprints.length)failures.push('questões duplicadas no simulado');
    const expectedTotal=pool.reduce((sum,q)=>{
      const s=subjects.find(x=>x.id===q?.subjectId);
      return sum+(rules.scoring?.correct==='subject-weight'?Number(s?.points||0):Number(rules.scoring?.correct||0));
    },0);
    return {ok:failures.length===0,expectedTotal,actualCount:pool.length,expectedCount,distribution,duplicateFingerprints,failures};
  }
  const report=auditBank();
  report.simulado=auditSimulado();
  window.DOCTOR_CORE_AUDIT=report;
  try{
    if(runtime.Store?.state){
      runtime.Store.state.aiCore=runtime.Store.state.aiCore||{};
      runtime.Store.state.aiCore.qualityAudit=report;
      runtime.Store.save?.();
    }
  }catch(_){}
  setTimeout(()=>{
    try{
      const fresh=auditBank();
      fresh.simulado=auditSimulado();
      window.DOCTOR_CORE_AUDIT=fresh;
      if(runtime.Store?.state){
        runtime.Store.state.aiCore=runtime.Store.state.aiCore||{};
        runtime.Store.state.aiCore.qualityAudit=fresh;
        runtime.Store.save?.();
      }
    }catch(_){}
  },1000);
})();
