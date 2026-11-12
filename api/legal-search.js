// Server-side proxy for LexML SRU. No AI key, paid search API, or user token.
const LEGAL_QUERY=/\b(lei|leis|art(?:igo)?s?\.?|decreto|decretos|resolu[cç][aã]o|resolu[cç][oõ]es|estatuto|c[oó]digo|constitui[cç][aã]o|emenda|portaria|norma|normas|regulamento|regimento|instru[cç][aã]o normativa|medida provis[oó]ria|direito|legisla[cç][aã]o|tr[aâ]nsito|servidor|licita[cç][aã]o|administra[cç][aã]o p[uú]blica|penal|constitucional|eleitoral|tribut[aá]rio|ambiental|consumidor|educa[cç][aã]o|sa[uú]de|previd[eê]ncia|trabalho|improbidade|seguran[cç]a p[uú]blica|dire[cç][aã]o defensiva|processo administrativo|direitos humanos|crime|contraven[cç][aã]o|compet[eê]ncia|responsabilidade civil|poder de pol[ií]cia|licenciamento|habilita[cç][aã]o|infra[cç][oõ]es|penalidade|servidor p[uú]blico|c[oó]digo de [aá]guas|c[oó]digo florestal)\b/i;
function decodeHtmlEntities(value){
  const named={nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",ccedil:'ç',Ccedil:'Ç',atilde:'ã',Atilde:'Ã',aacute:'á',Aacute:'Á',eacute:'é',Eacute:'É',iacute:'í',oacute:'ó',Oacute:'Ó',uacute:'ú',Uacute:'Ú',ordm:'º',ordf:'ª',sect:'§',ndash:'–',mdash:'—',ldquo:'“',rdquo:'”',lsquo:'‘',rsquo:'’'};
  return String(value||'').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(all,entity)=>{
    if(entity[0]==='#'){const hex=entity[1]?.toLowerCase()==='x';const n=parseInt(entity.slice(hex?2:1),hex?16:10);return Number.isFinite(n)?String.fromCodePoint(n):' ';}
    return named[entity]??named[entity.toLowerCase()]??' ';
  });
}
function extractConstitutionArticle(html,article){
  const clean=String(html||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ');
  const ordinal=article===1?'[ºo°]?':'[ºo°]?';
  const startRe=new RegExp('Art\\.?\\s*'+article+ordinal+'(?![\\d])','i');
  const start=clean.search(startRe);
  if(start<0)return '';
  const nextRe=new RegExp('Art\\.?\\s*'+(article+1)+'[ºo°]?(?![\\d])','ig');
  nextRe.lastIndex=start+1;
  const next=nextRe.exec(clean);
  if(!next)return '';
  const fragment=clean.slice(start,next.index)
    .replace(/<br\s*\/?\s*>/gi,'\n')
    .replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi,'\n')
    .replace(/<li\b[^>]*>/gi,'• ')
    .replace(/<[^>]+>/g,' ');
  return decodeHtmlEntities(fragment).replace(/[\t\f\v ]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
async function readOfficialText(req,res){
  const document=String(req.query.document||'');
  const article=Number(req.query.article);
  if(document!=='cf88'||!Number.isInteger(article)||article<1||article>250)
    return res.status(400).json({error:'Documento ou artigo não suportado para leitura integrada.'});
  const url='https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm';
  try{
    const upstream=await fetch(url,{headers:{Accept:'text/html','User-Agent':'Doctor-Concursos-Legal-Reader/1.0'},signal:AbortSignal.timeout(12000)});
    if(!upstream.ok)return res.status(502).json({error:'A fonte oficial da Constituição está temporariamente indisponível.'});
    const html=await upstream.text();
    if(/captcha|verifica[cç][aã]o de seguran[cç]a|support id/i.test(html.slice(0,2500)))
      return res.status(503).json({error:'A fonte oficial está temporariamente protegida contra consultas automáticas. Tente novamente mais tarde.'});
    const content=extractConstitutionArticle(html,article);
    if(!content||content.length<40)return res.status(404).json({error:'Não foi possível localizar esse artigo no texto oficial retornado pelo Planalto.'});
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({document:'Constituição da República Federativa do Brasil de 1988',article,content,source:'Presidência da República — Planalto',sourceUrl:url,retrievedAt:new Date().toISOString(),readingMode:'official-text-in-app'});
  }catch(error){
    return res.status(502).json({error:error.name==='TimeoutError'?'A consulta à fonte oficial demorou demais. Tente novamente.':'Não foi possível obter o texto oficial agora.'});
  }
}
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Método não permitido.'});}
  if(String(req.query.mode||'')==='read')return readOfficialText(req,res);
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
