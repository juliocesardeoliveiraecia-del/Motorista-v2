/* Buscador de Lei Seca Doctor — pesquisa jurídica independente da IA/GROQ. */
(function(global){
  'use strict';
  const ENDPOINT='https://www.lexml.gov.br/busca/SRU';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const legalTerms=/\\b(lei|leis|art(?:igo)?s?\\.?|decreto|decretos|resolu[cç][aã]o|resolu[cç][oõ]es|estatuto|c[oó]digo|constitui[cç][aã]o|emenda|portaria|norma|normas|regulamento|regimento|instru[cç][aã]o normativa|medida provis[oó]ria|direito|legisla[cç][aã]o|tr[aâ]nsito|servidor|licita[cç][aã]o|administra[cç][aã]o p[uú]blica|penal|constitucional|eleitoral|tribut[aá]rio|ambiental|consumidor|educa[cç][aã]o|sa[uú]de|previd[eê]ncia|trabalho|improbidade|seguran[cç]a p[uú]blica)\\b/i;
  function isLegalQuery(q){return legalTerms.test(q);}
  function scopeFilter(scope,record){
    if(scope==='all') return true;
    const id=(record.identifier||'').toLowerCase();
    const title=(record.title||'').toLowerCase();
    if(scope==='federal') return /urn:lex:br:federal|federal/.test(id+' '+title);
    if(scope==='state') return /urn:lex:br:[a-z]{2}:|estadual|estado de/.test(id+' '+title);
    if(scope==='municipal') return /urn:lex:br:[a-z]{2}:[^:]+:|municipal|munic[ií]pio|prefeitura|c[aâ]mara municipal/.test(id+' '+title);
    return true;
  }
  function recordsFromXml(xml){
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.querySelector('parsererror')) throw new Error('A base jurídica retornou uma resposta que não pôde ser interpretada.');
    return Array.from(doc.getElementsByTagNameNS('*','record')).map(node=>{
      const values={};
      Array.from(node.getElementsByTagNameNS('*','*')).forEach(el=>{
        const key=(el.localName||'').toLowerCase();
        if(!values[key]) values[key]=[];
        const value=(el.textContent||'').trim();
        if(value) values[key].push(value);
      });
      const first=(...keys)=>{for(const k of keys){const v=values[k];if(v?.length)return v[0];}return '';};
      const all=(...keys)=>keys.flatMap(k=>values[k]||[]);
      const identifier=first('identifier');
      return {title:first('title')||'Norma jurídica sem título catalogado',identifier,date:first('date'),type:first('type'),publisher:first('publisher'),description:first('description'),subjects:all('subject'),raw:node.textContent||''};
    });
  }
  async function search({query,scope='all',type='all',start=1}){
    const q=String(query||'').trim();
    if(q.length<3) throw new Error('Digite pelo menos 3 caracteres para pesquisar.');
    if(!isLegalQuery(q)) throw new Error('Este buscador é exclusivo para legislação. Informe uma lei, artigo, estatuto, decreto, resolução ou um assunto jurídico (por exemplo: trânsito, servidor público ou licitação).');
    const cql='dc.title any "'+q.replace(/"/g,' ')+'" or dc.subject any "'+q.replace(/"/g,' ')+'"';
    const params=new URLSearchParams({operation:'searchRetrieve',version:'1.1',query:cql,startRecord:String(start),maximumRecords:'30',recordSchema:'dc'});
    const response=await fetch(ENDPOINT+'?'+params.toString(),{headers:{Accept:'application/xml, text/xml'},cache:'no-store'});
    if(!response.ok) throw new Error('A base LexML está temporariamente indisponível (HTTP '+response.status+').');
    const xml=await response.text();
    if(/<!doctype html|captcha|verifica[cç][aã]o de seguran[cç]a/i.test(xml.slice(0,1200))) throw new Error('A base LexML solicitou uma verificação temporária. Use o acesso oficial abaixo para continuar a pesquisa.');
    let records=recordsFromXml(xml);
    if(scope!=='all') records=records.filter(r=>scopeFilter(scope,r));
    if(type!=='all') records=records.filter(r=>new RegExp(type,'i').test(r.type+' '+r.title));
    return {records,total:Number(new DOMParser().parseFromString(xml,'application/xml').getElementsByTagNameNS('*','numberOfRecords')[0]?.textContent||records.length),source:'LexML Brasil',retrievedAt:new Date().toISOString()};
  }
  function officialUrl(record){
    const urn=record.identifier.match(/urn:lex:[^\\s]+/i)?.[0];
    return urn?'https://www.lexml.gov.br/urn/'+encodeURIComponent(urn):'https://www.lexml.gov.br/';
  }
  global.DoctorLegalSearch={search,esc,officialUrl,isLegalQuery,endpoint:ENDPOINT};
})(window);
