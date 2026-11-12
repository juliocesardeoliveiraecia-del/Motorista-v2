/* Doctor Search — pesquisa local do conteúdo do aluno e encaminhamento jurídico sem IA. */
(function(global){
  'use strict';
  const ENDPOINT='https://www.lexml.gov.br/busca/SRU';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const legalTerms=/\b(lei|leis|art(?:igo)?s?\.?|decreto|decretos|resolu[cç][aã]o|resolu[cç][oõ]es|estatuto|c[oó]digo|constitui[cç][aã]o|emenda|portaria|norma|normas|regulamento|regimento|instru[cç][aã]o normativa|medida provis[oó]ria|direito|legisla[cç][aã]o|tr[aâ]nsito|servidor|licita[cç][aã]o|administra[cç][aã]o p[uú]blica|penal|constitucional|eleitoral|tribut[aá]rio|ambiental|consumidor|educa[cç][aã]o|sa[uú]de|previd[eê]ncia|trabalho|improbidade|seguran[cç]a p[uú]blica|dire[cç][aã]o defensiva|processo administrativo|direitos humanos|crime|contraven[cç][aã]o|compet[eê]ncia|responsabilidade civil|poder de pol[ií]cia|licenciamento|habilita[cç][aã]o|infra[cç][oõ]es|penalidade|servidor p[uú]blico|c[oó]digo de [aá]guas|c[oó]digo florestal)\b/i;
  function isLegalQuery(q){return legalTerms.test(q);}
  function collectText(value,depth=0){
    if(value==null||depth>3)return '';
    if(typeof value==='string'||typeof value==='number')return String(value);
    if(Array.isArray(value))return value.slice(0,30).map(v=>collectText(v,depth+1)).join(' ');
    if(typeof value==='object')return Object.entries(value).filter(([k])=>/^(text|title|name|front|back|body|description|question|explanation|summary|label|tags|subject|subjectName|content|transcription|transcript|topic)$/i.test(k)).map(([,v])=>collectText(v,depth+1)).join(' ');
    return '';
  }
  function searchLocal(query){
    const state=global.Store?.state||{},pool=[];
    const add=(type,title,content,source,id)=>{
      const text=String(content||'').trim();if(!text)return;
      pool.push({type,title:String(title||type),content:text,source,id,local:true});
    };
    (global.SUBJECTS||[]).forEach(s=>add('Matéria',s.name,[s.name,s.description,s.id].filter(Boolean).join(' · '),'Matérias do concurso',s.id));
    (global.QUESTIONS||[]).forEach((q,i)=>add('Questão',q.subjectName||q.subjectId||'Questão '+(i+1),collectText(q),'Banco de questões',q.id||i));
    (Array.isArray(state.notes)?state.notes:[]).forEach((n,i)=>add('Anotação',n.title||'Anotação '+(i+1),collectText(n),'Caderno Doctor',n.id||i));
    Object.entries(state.flashcards||{}).forEach(([subject,cards])=>(Array.isArray(cards)?cards:[]).forEach((c,i)=>add('Flashcard',c.front||'Flashcard',collectText(c),'Flashcards salvos · '+subject,c.id||i)));
    (Array.isArray(state.recordings)?state.recordings:[]).forEach((r,i)=>add('Gravação',r.title||r.name||'Gravação '+(i+1),collectText(r),'Gravador Doctor',r.id||i));
    (Array.isArray(state.essays)?state.essays:[]).forEach((e,i)=>add('Redação',e.title||'Redação '+(i+1),collectText(e),'Redação Doctor',e.id||i));
    (Array.isArray(state.radar?.items)?state.radar.items:[]).forEach((r,i)=>add('Radar Doctor',r.title||'Notícia',collectText(r),'Radar Doctor',r.id||i));
    const needle=normalize(query),tokens=needle.split(/\s+/).filter(Boolean);
    const scored=pool.map((r,index)=>{
      const hay=normalize(r.title+' '+r.content+' '+r.source);
      const hits=tokens.filter(t=>hay.includes(t)).length;
      const score=(hay.includes(needle)?10:0)+hits;
      return {r,index,score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,30).map(x=>({...x.r,date:new Date().toISOString()}));
    return {records:scored,total:scored.length,source:'Conteúdo disponível no seu Doctor',retrievedAt:new Date().toISOString(),readingMode:'local'};
  }
  function scopeFilter(scope,r){
    if(scope==='all')return true;
    const id=(r.identifier||'').toLowerCase(),title=(r.title||'').toLowerCase();
    if(scope==='federal')return /urn:lex:br:federal|federal/.test(id+' '+title);
    if(scope==='state')return /urn:lex:br:[a-z]{2}:|estadual|estado de/.test(id+' '+title);
    if(scope==='municipal')return /urn:lex:br:[a-z]{2}:[^:]+:|municipal|município|prefeitura|câmara municipal/.test(id+' '+title);
    return true;
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
  async function search({query,scope='all',type='all'}){
    const q=String(query||'').trim();if(q.length<2)throw new Error('Digite pelo menos 2 caracteres para pesquisar.');
    if(!isLegalQuery(q))return searchLocal(q);
    const articleMatch=q.match(/\b(?:art(?:igo)?\.?\s*)(\d{1,3})\s*(?:º|°|o)?/i);
    const constitutionMatch=/constitui[cç][aã]o|\bcf\s*\/?\s*88\b/i.test(q);
    if(articleMatch&&constitutionMatch){
      const article=Number(articleMatch[1]),response=await fetch('/api/legal-search?mode=read&document=cf88&article='+article,{headers:{Accept:'application/json'},cache:'no-store'}),data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'Não foi possível carregar o texto oficial da Constituição.');
      return {records:[{title:data.document+' — Art. '+data.article,content:data.content,source:data.source+' · Texto obtido em '+new Date(data.retrievedAt).toLocaleString('pt-BR'),date:data.retrievedAt,type:'Texto oficial integral'}],total:1,source:data.source,retrievedAt:data.retrievedAt,readingMode:'in-app'};
    }
    const params=new URLSearchParams({q,scope,type}),response=await fetch('/api/legal-search?'+params.toString(),{headers:{Accept:'application/xml, text/xml'},cache:'no-store'});
    if(!response.ok){const body=await response.text();let message='A base LexML está temporariamente indisponível (HTTP '+response.status+').';try{message=JSON.parse(body).error||message;}catch(_){}throw new Error(message);}
    const xml=await response.text();if(/<!doctype html|captcha|verificação de segurança/i.test(xml.slice(0,1200)))throw new Error('A base LexML solicitou uma verificação temporária. Tente novamente mais tarde.');
    let records=recordsFromXml(xml);if(scope!=='all')records=records.filter(r=>scopeFilter(scope,r));if(type!=='all')records=records.filter(r=>new RegExp(type,'i').test(r.type+' '+r.title));
    const doc=new DOMParser().parseFromString(xml,'application/xml'),total=Number(doc.getElementsByTagNameNS('*','numberOfRecords')[0]?.textContent||records.length);
    return {records,total,source:'LexML Brasil',retrievedAt:new Date().toISOString()};
  }
  function officialUrl(r){const urn=(r.identifier||'').match(/urn:lex:[^\s]+/i)?.[0];return urn?'https://www.lexml.gov.br/urn/'+encodeURIComponent(urn):'https://www.lexml.gov.br/';}
  global.DoctorLegalSearch={search,searchLocal,esc,isLegalQuery,officialUrl,endpoint:ENDPOINT};
})(window);
