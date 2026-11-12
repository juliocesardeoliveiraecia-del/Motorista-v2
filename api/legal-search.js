// Server-side proxy for LexML SRU. No AI key, paid search API, or user token.
const LEGAL_QUERY=/\b(lei|leis|art(?:igo)?s?\.?|decreto|decretos|resolu[cç][aã]o|resolu[cç][oõ]es|estatuto|c[oó]digo|constitui[cç][aã]o|emenda|portaria|norma|normas|regulamento|regimento|instru[cç][aã]o normativa|medida provis[oó]ria|direito|legisla[cç][aã]o|tr[aâ]nsito|servidor|licita[cç][aã]o|administra[cç][aã]o p[uú]blica|penal|constitucional|eleitoral|tribut[aá]rio|ambiental|consumidor|educa[cç][aã]o|sa[uú]de|previd[eê]ncia|trabalho|improbidade|seguran[cç]a p[uú]blica|dire[cç][aã]o defensiva|processo administrativo|direitos humanos|crime|contraven[cç][aã]o|compet[eê]ncia|responsabilidade civil|poder de pol[ií]cia|licenciamento|habilita[cç][aã]o|infra[cç][oõ]es|penalidade|servidor p[uú]blico|c[oó]digo de [aá]guas|c[oó]digo florestal)\b/i;
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Método não permitido.'});}
  const q=String(req.query.q||'').trim();
  if(q.length<3||q.length>180)return res.status(400).json({error:'A pesquisa deve ter entre 3 e 180 caracteres.'});
  if(!LEGAL_QUERY.test(q))return res.status(400).json({error:'Buscador exclusivo para legislação. Informe uma lei, artigo, estatuto, decreto, resolução ou assunto jurídico.'});
  const scope=String(req.query.scope||'all');
  if(!['all','federal','state','municipal'].includes(scope))return res.status(400).json({error:'Abrangência inválida.'});
  const type=String(req.query.type||'all');
  if(!['all','lei','decreto','resolu','estatuto','constitui','portaria'].includes(type))return res.status(400).json({error:'Tipo de norma inválido.'});
  const safe=q.replace(/"/g,' ');
  const cql='dc.title any "'+safe+'" or dc.subject any "'+safe+'" or dc.description any "'+safe+'"';
  const params=new URLSearchParams({operation:'searchRetrieve',version:'1.1',query:cql,startRecord:'1',maximumRecords:'30',recordSchema:'dc'});
  try{
    const upstream=await fetch('https://www.lexml.gov.br/busca/SRU?'+params.toString(),{headers:{Accept:'application/xml, text/xml','User-Agent':'Doctor-Concursos-Legal-Search/1.0'},signal:AbortSignal.timeout(12000)});
    if(!upstream.ok)return res.status(502).json({error:'A base LexML respondeu com HTTP '+upstream.status+'.'});
    const xml=await upstream.text();
    if(/<!doctype html|captcha|verifica[cç][aã]o de seguran[cç]a/i.test(xml.slice(0,1500)))return res.status(503).json({error:'A base LexML solicitou uma verificação temporária. Tente novamente mais tarde ou use o portal oficial.'});
    if(!/<(?:\w+:)?searchRetrieveResponse\b/i.test(xml))return res.status(502).json({error:'A base LexML retornou uma resposta inesperada.'});
    res.setHeader('Content-Type','application/xml; charset=utf-8');
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Doctor-Legal-Source','LexML Brasil');
    return res.status(200).send(xml);
  }catch(error){
    return res.status(502).json({error:error.name==='TimeoutError'?'A consulta ao LexML demorou demais. Tente novamente.':'Não foi possível conectar ao acervo LexML agora.'});
  }
};
