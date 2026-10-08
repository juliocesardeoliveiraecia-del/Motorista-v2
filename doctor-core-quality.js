/* Doctor Core Quality Gate — V1.0
 * Camada genérica de produção em massa.
 * Não contém conteúdo de concurso. Só valida contratos, banco e execução.
 */
(function(){
  'use strict';

  const VERSION = '1.0.0';

  function normalize(v){
    return String(v == null ? '' : v).trim().replace(/\s+/g,' ').toLowerCase();
  }

  function fingerprint(q){
    return [
      q?.id, q?.subjectId, q?.text,
      ...(Array.isArray(q?.options) ? q.options : []),
      q?.correct,
      ...(Array.isArray(q?.explanations) ? q.explanations : [])
    ].map(normalize).join('¦');
  }

  function auditBank(){
    const subjects = Array.isArray(window.SUBJECTS) ? window.SUBJECTS : [];
    const questions = Array.isArray(window.QUESTIONS) ? window.QUESTIONS : [];
    const invalid = [];
    const duplicateIds = [];
    const duplicateFingerprints = [];
    const ids = new Set();
    const fps = new Set();

    questions.forEach((q) => {
      const errors = [];
      if(!q || typeof q !== 'object') errors.push('questão inválida');
      if(!String(q?.id || '').trim()) errors.push('id ausente');
      if(!subjects.some(s => s.id === q?.subjectId)) errors.push('matéria inválida');
      if(normalize(q?.text).length < 20) errors.push('enunciado vazio/curto');
      if(!Array.isArray(q?.options) || q.options.length !== Number(window.ExamRules?.optionCount || 4)) errors.push('alternativas inválidas');
      if(Array.isArray(q?.options)){
        const opts = q.options.map(normalize);
        if(opts.some(Boolean) === false || opts.some(x => !x)) errors.push('alternativa vazia');
        if(new Set(opts).size !== opts.length) errors.push('alternativas duplicadas');
      }
      if(!Number.isInteger(q?.correct) || q.correct < 0 || q.correct >= Number(window.ExamRules?.optionCount || 4)) errors.push('gabarito inválido');
      if(!Array.isArray(q?.explanations) || q.explanations.length !== Number(window.ExamRules?.optionCount || 4)) errors.push('explicações desalinhadas');
      if(Array.isArray(q?.explanations) && q.explanations.some(x => !normalize(x))) errors.push('explicação vazia');

      if(q?.id && ids.has(q.id)) duplicateIds.push(q.id);
      if(q?.id) ids.add(q.id);

      const fp = fingerprint(q);
      if(fps.has(fp)) duplicateFingerprints.push(q?.id || '(sem id)');
      fps.add(fp);

      if(errors.length) invalid.push({id:q?.id || '(sem id)', errors});
    });

    const distribution = subjects.map(s => {
      const have = questions.filter(q => q?.subjectId === s.id).length;
      const need = Number(s.officialQuestions || 0);
      return {id:s.id,name:s.name,have,need,missing:Math.max(0,need-have)};
    });

    const expected = Number(window.ExamRules?.questionCount || 0);
    const minimumBank = distribution.reduce((sum,x)=>sum+x.need,0);
    const completeForOfficialSimulado = distribution.every(x => x.missing === 0);

    return {
      version: VERSION,
      auditedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      expectedExamQuestions: expected,
      minimumBank,
      completeForOfficialSimulado,
      distribution,
      invalid,
      duplicateIds,
      duplicateFingerprints,
      structuralOk: invalid.length === 0 && duplicateIds.length === 0 && duplicateFingerprints.length === 0
    };
  }

  function verifyEvidence(q, ev, selected){
    if(!q || !ev) return {ok:false,reason:'missing-evidence'};
    const current = fingerprint(q);
    if(ev.questionFingerprint !== current) return {ok:false,reason:'question-changed'};
    if(Number.isInteger(selected) && ev.selected !== selected) return {ok:false,reason:'selected-mismatch'};
    if(ev.isCorrect !== (ev.selected === ev.correct)) return {ok:false,reason:'correctness-mismatch'};
    return {ok:true};
  }

  function auditResult(result, session){
    if(!result || !session) return {ok:false,reason:'missing-result-or-session'};
    const expectedTotal = (session.questions || []).reduce((sum,q) => {
      const s = (window.SUBJECTS || []).find(x => x.id === q?.subjectId);
      return sum + (window.ExamRules?.scoring?.correct === 'subject-weight'
        ? Number(s?.points || 0)
        : Number(window.ExamRules?.scoring?.correct || 0));
    },0);
    const errors=[];
    if(result.total !== expectedTotal) errors.push('denominador do simulado divergente');
    if(result.score < 0 || result.score > result.total) errors.push('pontuação fora do intervalo');
    if(result.bySubject){
      (window.SUBJECTS || []).forEach(s=>{
        const expected = (session.questions || []).filter(q=>q?.subjectId===s.id).length;
        if(Number(result.bySubject[s.id]?.total || 0)!==expected) errors.push('total por matéria divergente: '+s.id);
      });
    }
    return {ok:errors.length===0,errors,expectedTotal};
  }

  function persistReport(report){
    try{
      if(window.DOCTOR_CORE_RUNTIME?.Store?.state){
        window.DOCTOR_CORE_RUNTIME?.Store.state.aiCore = window.DOCTOR_CORE_RUNTIME?.Store.state.aiCore || {};
        window.DOCTOR_CORE_RUNTIME?.Store.state.aiCore.qualityAudit = report;
        window.DOCTOR_CORE_RUNTIME?.Store.save?.();
      }
    }catch(_){}
  }

  const API = {
    VERSION,
    fingerprint,
    auditBank,
    verifyEvidence,
    auditResult,
    run(){
      const report = auditBank();
      persistReport(report);
      window.DOCTOR_CORE_AUDIT = report;
      return report;
    }
  };

  window.DoctorCoreQuality = API;

  // Segurança adicional: depois de cada resposta, confira a evidência antes
  // de permitir que a UI considere a resposta válida.
  if(window.DOCTOR_CORE_RUNTIME?.Quiz){
    const wrap = (name) => {
      const original = window.DOCTOR_CORE_RUNTIME?.Quiz[name];
      if(typeof original !== 'function' || original.__doctorQualityWrapped) return;
      const wrapped = function(...args){
        const before = API.fingerprint(window.DOCTOR_CORE_RUNTIME?.Quiz.currentQuestion?.(args[0]) || null);
        const result = original.apply(this,args);
        if(result?.ok && result.evidence){
          const q = window.DOCTOR_CORE_RUNTIME?.Quiz.currentQuestion?.(args[0]);
          const check = API.verifyEvidence(q,result.evidence,result.evidence.selected);
          if(!check.ok){
            try{ window.DOCTOR_CORE_RUNTIME?.Store.state.answerMeta[q.id] = null; window.DOCTOR_CORE_RUNTIME?.Store.save(); }catch(_){}
            return {ok:false,reason:'quality-gate-'+check.reason};
          }
          if(before && before !== result.evidence.questionFingerprint) return {ok:false,reason:'quality-gate-question-changed'};
        }
        return result;
      };
      wrapped.__doctorQualityWrapped = true;
      window.DOCTOR_CORE_RUNTIME?.Quiz[name] = wrapped;
    };
    wrap('answerFeedQuestion');
    wrap('answerCurrent');
    wrap('answerReviewQuestion');
  }

  // Auditoria inicial e uma segunda execução após o Core terminar de montar a UI.
  try{ API.run(); }catch(_){}
  window.setTimeout(()=>{ try{ API.run(); }catch(_){} }, 0);
})();
