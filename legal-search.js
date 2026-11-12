/* Doctor Search — indexa o conteúdo real do Core e combina busca local com legislação oficial. */
(function(global){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const legalTerms=/\b(lei|leis|art(?:igo)?s?\.?|decreto|decretos|resolu[cç][aã]o|resolu[cç][oõ]es|estatuto|c[oó]digo|ctb|constitui[cç][aã]o|cf\s*88|emenda|portaria|norma|normas|regulamento|regimento|instru[cç][aã]o normativa|medida provis[oó]ria|direito|legisla[cç][aã]o|tr[aâ]nsito|servidor|licita[cç][aã]o|administra[cç][aã]o p[uú]blica|penal|constitucional|eleitoral|tribut[aá]rio|ambiental|consumidor|educa[cç][aã]o|sa[uú]de|previd[eê]ncia|trabalho|improbidade|seguran[cç]a p[uú]blica|dire[cç][aã]o defensiva|processo administrativo|direitos humanos|crime|contraven[cç][aã]o|compet[eê]ncia|responsabilidade civil|poder de pol[ií]cia|licenciamento|habilita[cç][aã]o|infra[cç][oõ]es|penalidade|servidor p[uú]blico|lei seca)\b/i;
  const isLegalQuery=q=>legalTerms.test(q);
  const flatten=(v,depth=0)=>{if(v==null||depth>4)return '';if(typeof v==='string'||typeof v==='number')return String(v);if(Array.isArray(v))return v.slice(0,60).map(x=>flatten(x,depth+1)).join(' ');if(typeof v==='object')return Object.values(v).map(x=>flatten(x,depth+1)).join(' ');return '';};
  function searchLocal(query){
    const state=global.Store?.state||{},subjects=Array.isArray(global.SUBJECTS)?global.SUBJECTS:[],questions=Array.isArray(global.QUESTIONS)?global.QUESTIONS:[],pool=[];
    const add=(type,title,content,source,id)=>{
      const body=String(content||'').trim();if(body.length<2)return;
      pool.push({type,title:String(title||type),content:body,source,id,local:true});
    };
    subjects.forEach(s=>add('Matéria',s.name,[s.name,s.description,s.topics||[],s.id].flat().filter(Boolean).join(' · '),'Edital e matérias do concurso',s.id));
    const subjectName=id=>subjects.find(s=>s.id===id)?.name||id||'Conteúdo do concurso';
    const indexQuestion=(q,i,origin)=>{
      if(!q||typeof q!=='object')return;
      const title='Questão — '+subjectName(q.subjectId||q.subject);
      const content=[q.text,q.question,q.enunciado,q.options,q.alternatives,q.explanations,q.topic,q.tags].map(flatten).filter(Boolean).join('\n');
      add('Questão',title,content,origin,q.id||i);
    };
    questions.forEach((q,i)=>indexQuestion(q,i,'Banco oficial de questões do aplicativo'));
    (Array.isArray(state.aiQuestions)?state.aiQuestions:[]).forEach((q,i)=>indexQuestion(q,i,'Questões adicionais salvas no Doctor'));
    (Array.isArray(state.notes)?state.notes:[]).forEach((n,i)=>add('Anotação',n.title||'Anotação '+(i+1),[n.title,n.body,n.content,n.text,n.tags,n.folderId].map(flatten).join('\n'),'Caderno Doctor',n.id||i));
    Object.entries(state.flashcards||{}).forEach(([subject,cards])=>(Array.isArray(cards)?cards:[]).forEach((c,i)=>add('Flashcard',c.front||'Flashcard',[c.front,c.back,c.tags].map(flatten).join('\n'),'Flashcards · '+subjectName(subject),c.id||i)));
    (Array.isArray(state.recordings)?state.recordings:[]).forEach((r,i)=>add('Gravação',r.title||r.name||'Gravação '+(i+1),[r.title,r.name,r.description,r.transcription,r.transcript,r.notes,r.subjectId].map(flatten).join('\n'),'Gravador Doctor',r.id||i));
    (Array.isArray(state.essays)?state.essays:[]).forEach((e,i)=>add('Redação',e.title||'Redação '+(i+1),[e.title,e.body,e.text,e.feedback,e.theme].map(flatten).join('\n'),'Redação Doctor',e.id||i));
    if(state.essayDraft)add('Rascunho de redação',state.essayDraft.title||'Redação em andamento',[state.essayDraft.title,state.essayDraft.body].join('\n'),'Redação Doctor');
    (Array.isArray(state.radar?.items)?state.radar.items:[]).forEach((r,i)=>add('Radar Doctor',r.title||'Notícia', [r.title,r.summary,r.description,r.content,r.source].map(flatten).join('\n'),'Radar Doctor',r.id||i));
    (Array.isArray(state.simulados)?state.simulados:[]).forEach((sim,i)=>add('Simulado',sim.title||sim.name||'Simulado '+(i+1),flatten(sim),'Simulados salvos',sim.id||i));
    const needle=normalize(query),tokens=needle.split(/\s+/).filter(t=>t.length>1);
    const scored=pool.map((r,index)=>{
      const title=normalize(r.title),hay=normalize(r.title+' '+r.content+' '+r.source);
      const hits=tokens.filter(t=>hay.includes(t)).length;
      const exact=hay.includes(needle),titleHits=tokens.filter(t=>title.includes(t)).length;
      const score=(exact?30:0)+(tokens.length&&hits===tokens.length?12:0)+hits*3+titleHits*2;
      return {r,index,score,hits};
    }).filter(x=>x.score>0 && (tokens.length<=1||x.hits>=Math.max(1,Math.ceil(tokens.length*.5)))).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,25).map(x=>({...x.r,date:new Date().toISOString()}));
    return {records:scored,total:scored.length,source:'Conteúdo do seu Doctor',retrievedAt:new Date().toISOString(),readingMode:'local'};
  }
  function recordsFromXml(xml){
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.querySelector('parsererror'))throw new Error('A base jurídica retornou uma resposta que não pôde ser interpretada.');
    return Array.from(doc.getElementsByTagNameNS('*','record')).map(node=>{
      const values={};Array.from(node.getElementsByTagNameNS('*','*')).forEach(el=>{const key=(el.localName||'').toLowerCase();(values[key]||(values[key]=[])).push((el.textContent||'').trim());});
      const first=(...keys)=>{for(const k of keys){const v=values[k];if(v?.length)return v[0];}return '';};
      return {title:first('title')||'Norma jurídica sem título catalogado',identifier:first('identifier'),date:first('date'),type:first('type'),publisher:first('publisher'),description:first('description'),subjects:values.subject||[]};
    });
  }
  async function search({query}){
    const q=String(query||'').trim();if(q.length<2)throw new Error('Digite pelo menos 2 caracteres para pesquisar.');
    const local=searchLocal(q);
    const articleMatch=q.match(/\b(?:art(?:igo)?\.?\s*)(\d{1,3})\s*(?:º|°|o)?/i);
    const constitutionMatch=/constitui[cç][aã]o|\bcf\s*\/?\s*88\b/i.test(q);
    if(articleMatch&&constitutionMatch){
      try{
        const article=Number(articleMatch[1]),response=await fetch('/api/legal-search?mode=read&document=cf88&article='+article,{headers:{Accept:'application/json'},cache:'no-store'}),data=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(data.error||'Não foi possível carregar o texto oficial da Constituição.');
        return {records:[{title:data.document+' — Art. '+data.article,content:data.content,source:data.source+' · Texto obtido em '+new Date(data.retrievedAt).toLocaleString('pt-BR'),date:data.retrievedAt,type:'Texto oficial integral'}],total:1,source:data.source,retrievedAt:data.retrievedAt,readingMode:'in-app'};
      }catch(error){if(local.records.length)return {...local,notice:'A fonte oficial da Constituição não respondeu. Exibindo os materiais locais encontrados.'};throw error;}
    }
    if(!isLegalQuery(q))return local;
    try{
      const params=new URLSearchParams({q,scope:'all',type:'all'}),response=await fetch('/api/legal-search?'+params.toString(),{headers:{Accept:'application/xml, text/xml'},cache:'no-store'});
      if(!response.ok){const body=await response.text();let message='A base LexML está temporariamente indisponível (HTTP '+response.status+').';try{message=JSON.parse(body).error||message;}catch(_){}throw new Error(message);}
      const xml=await response.text();if(/<!doctype html|captcha|verificação de segurança/i.test(xml.slice(0,1200)))throw new Error('A base LexML solicitou uma verificação temporária.');
      const legal=recordsFromXml(xml),combined=[...local.records,...legal.map(r=>({...r,local:false}))];
      const unique=combined.filter((r,i,a)=>a.findIndex(x=>normalize(x.title)===normalize(r.title))===i).slice(0,30);
      return {records:unique,total:unique.length,source:'Doctor + LexML Brasil',retrievedAt:new Date().toISOString(),notice:local.records.length?'Resultados do conteúdo do aplicativo e do acervo jurídico.':''};
    }catch(error){if(local.records.length)return {...local,notice:'O acervo jurídico online está indisponível no momento. Estes são os resultados encontrados no conteúdo do aplicativo.'};throw error;}
  }
  function officialUrl(r){const urn=(r.identifier||'').match(/urn:lex:[^\s]+/i)?.[0];return urn?'https://www.lexml.gov.br/urn/'+encodeURIComponent(urn):'https://www.lexml.gov.br/';}
  global.DoctorLegalSearch={search,searchLocal,esc,isLegalQuery,officialUrl};
})(window);
