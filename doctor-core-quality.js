/* Doctor Core Quality Gate — V1.0 */
(function(){
  'use strict';
  const VERSION='1.0.0';
  const runtime=window.DOCTOR_CORE_RUNTIME||{};
  const subjects=window.SUBJECTS||[];
  const questions=window.QUESTIONS||[];
  const rules=window.ExamRules||{};

  function norm(v){return String(v==null?'':v).trim().replace(/\s+/g,' ').toLowerCase();}
  function fingerprint(q){return [q?.id,q?.subjectId,q?.text,...(Array.isArray(q?.options)?q.options:[]),q?.correct,...(Array.isArray(q?.explanations)?q.explanations:[])].map(norm).join('¦');}

  function auditBank(){
    const invalid=[],ids=new Set(),fps=new Set(),duplicateIds=[],duplicateFingerprints=[];
    questions.forEach(q=>{
      const errors=[];
      if(!q||typeof q!=='object')errors.push('questão inválida');
      if(!norm(q?.id))errors.push('id ausente');
      if(!subjects.some(s=>s.id===q?.subjectId))errors.push('matéria inválida');
      if(norm(q?.text).length<20)errors.push('enunciado vazio/curto');
      const n=Number(rules.optionCount||4);
      if(!Array.isArray(q?.options)||q.options.length!==n)errors.push('alternativas inválidas');
      if(Array.isArray(q?.options)){
        const opts=q.options.map(norm);
        if(opts.some(x=>!x))errors.push('alternativa vazia');
        if(new Set(opts).size!==opts.length)errors.push('alternativas duplicadas');
      }
      if(!Number.isInteger(q?.correct)||q.correct<0||q.correct>=n)errors.push('gabarito inválido');
      if(!Array.isArray(q?.explanations)||q.explanations.length!==n)errors.push('explicações desalinhadas');
      if(Array.isArray(q?.explanations)&&q.explanations.some(x=>!norm(x)))errors.push('explicação vazia');
      if(q?.id&&ids.has(q.id))duplicateIds.push(q.id);
      if(q?.id)ids.add(q.id);
      const fp=fingerprint(q);
      if(fps.has(fp))duplicateFingerprints.push(q?.id||'(sem id)');
      fps.add(fp);
      if(errors.length)invalid.push({id:q?.id||'(sem id)',errors});
    });
    const distribution=subjects.map(s=>{
      const have=questions.filter(q=>q?.subjectId===s.id).length;
      const need=Number(s.officialQuestions||0);
      return {id:s.id,name:s.name,have,need,missing:Math.max(0,need-have)};
    });
    return {
      version:VERSION,auditedAt:new Date().toISOString(),
      totalQuestions:questions.length,
      expectedExamQuestions:Number(rules.questionCount||0),
      minimumBank:distribution.reduce((a,x)=>a+x.need,0),
      completeForOfficialSimulado:distribution.every(x=>x.missing===0),
      distribution,invalid,duplicateIds,duplicateFingerprints,
      structuralOk:!invalid.length&&!duplicateIds.length&&!duplicateFingerprints.length
    };
  }

  function auditSimulado(){
    const session=runtime.Quiz?.session;
    if(!session||session.type!=='simulado')return {ok:true,skipped:true};
    const expected=(session.questions||[]).reduce((sum,q)=>{
      const s=subjects.find(x=>x.id===q?.subjectId);
      return sum+(rules.scoring?.correct==='subject-weight'?Number(s?.points||0):Number(rules.scoring?.correct||0));
    },0);
    return {ok:true,expectedTotal:expected};
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

  // Reaudita depois do carregamento inicial, sem interferir no fluxo de resposta.
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
