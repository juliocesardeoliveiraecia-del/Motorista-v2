/* Buscador de Lei Seca Doctor — serviço independente de IA/GROQ. */
(function(global){
  'use strict';
  const ENDPOINT='https://www.lexml.gov.br/busca/SRU';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const legalTerms=/\b(lei|leis|art(?:igo)?s?\.?|decreto|decretos|resolu[cç][aã]o|resolu[cç][oõ]es|estatuto|c[oó]digo|constitui[cç][aã]o|emenda|portaria|norma|normas|regulamento|regimento|instru[cç][aã]o normativa|medida provis[oó]ria|direito|legisla[cç][aã]o|tr[aâ]nsito|servidor|licita[cç][aã]o|administra[cç][aã]o p[uú]blica|penal|constitucional|eleitoral|tribut[aá]rio|ambiental|consumidor|educa[cç][aã]o|sa[uú]de|previd[eê]ncia|trabalho|improbidade|seguran[cç]a p[uú]blica)\b/i;
  function isLegalQuery(q){return legalTerms.test(q);}
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
      const values={};
      Array.from(node.getElementsByTagNameNS('*','*')).forEach(el=>{
        const key=(el.localName||'').toLowerCase();(values[key]||(values[key]=[])).push((el.textContent||'').trim());
      });
      const first=(...keys)=>{for(const k of keys){const v=values[k];if(v?.length)return v[0];}return '';};
      return {title:first('title')||'Norma jurídica sem título catalogado',identifier:first('identifier'),date:first('date'),type:first('type'),publisher:first('publisher'),description:first('description'),subjects:values.subject||[]};
    });
  }
  async function search({query,scope='all',type='all',start=1}){
    const q=String(query||'').trim();
    if(q.length<3)throw new Error('Digite pelo menos 3 caracteres para pesquisar.');
    if(!isLegalQuery(q))throw new Error('Este buscador é exclusivo para legislação. Informe uma lei, artigo, estatuto, decreto, resolução ou assunto jurídico, como trânsito, servidor público ou licitação.');
    const params=new URLSearchParams({q,scope,type});
    const response=await fetch('/api/legal-search?'+params.toString(),{headers:{Accept:'application/xml, text/xml'},cache:'no-store'});
    if(!response.ok){
      const body=await response.text();let message='A base LexML está temporariamente indisponível (HTTP '+response.status+').';
      try{message=JSON.parse(body).error||message;}catch(_){}
      throw new Error(message);
    }
    const xml=await response.text();
    if(/<!doctype html|captcha|verificação de segurança/i.test(xml.slice(0,1200)))throw new Error('A base LexML solicitou uma verificação temporária. Use o acesso oficial abaixo para continuar.');
    let records=recordsFromXml(xml);
    if(scope!=='all')records=records.filter(r=>scopeFilter(scope,r));
    if(type!=='all')records=records.filter(r=>new RegExp(type,'i').test(r.type+' '+r.title));
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    const total=Number(doc.getElementsByTagNameNS('*','numberOfRecords')[0]?.textContent||records.length);
    return {records,total,source:'LexML Brasil',retrievedAt:new Date().toISOString()};
  }
  function officialUrl(r){
    const urn=(r.identifier||'').match(/urn:lex:[^\s]+/i)?.[0];
    return urn?'https://www.lexml.gov.br/urn/'+encodeURIComponent(urn):'https://www.lexml.gov.br/';
  }
  global.DoctorLegalSearch={search,esc,officialUrl,isLegalQuery,endpoint:ENDPOINT};
})(window);
