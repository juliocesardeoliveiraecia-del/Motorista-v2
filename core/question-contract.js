/* Doctor Core — immutable question/attempt contract. Pure functions only. */
(function(){
  function stableText(v){return String(v??'').normalize('NFKC').replace(/\\s+/g,' ').trim();}
  function hash32(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16).padStart(8,'0');}
  function canonical(q){return JSON.stringify({id:stableText(q.id),subjectId:stableText(q.subjectId),text:stableText(q.text),options:(q.options||[]).map(stableText),correct:Number(q.correct),explanations:(q.explanations||[]).map(stableText)});}
  function version(q){const contentHash=hash32(canonical(q));return{questionVersionId:stableText(q.id)+'@'+contentHash,contentHash};}
  function evaluate(q,selected){if(!q||!Array.isArray(q.options)||!Number.isInteger(selected))return{ok:false,correct:false,reason:'invalid-answer'};if(selected<0||selected>=q.options.length)return{ok:false,correct:false,reason:'out-of-range'};return{ok:true,correct:selected===Number(q.correct)};}
  function audit(q,selected,contextVersionId){const e=evaluate(q,selected),v=version(q);return{...e,...v,questionId:q.id,selected,contextVersionId:contextVersionId||window.EXAM_CONFIG?.contentVersion||'unknown',evaluatedAt:new Date().toISOString()};}
  window.DoctorQuestionContract=Object.freeze({canonical,version,evaluate,audit});
})();
