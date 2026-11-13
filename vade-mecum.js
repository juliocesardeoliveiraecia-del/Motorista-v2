/* Vade-Mécum Doctor — biblioteca e pesquisa exclusivamente locais.
 * Nenhuma consulta externa, redirecionamento ou API de busca é usada neste módulo.
 * Os textos integrais serão adicionados como pacotes oficiais versionados.
 */
(function(global){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9§º°]+/g,' ').trim();
  const documents=[
    {id:"BR-CF-1988",title:"Constituição Federal",officialTitle:"Constituição da República Federativa do Brasil de 1988",category:"Constituição",cover:"constitution",symbol:"§",subtitle:"CONSTITUIÇÃO",description:"A base constitucional do ordenamento jurídico brasileiro.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/atividade-legislativa/legislacao/constituicao1988",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ADCT-1988",title:"ADCT",officialTitle:"Ato das Disposições Constitucionais Transitórias",category:"Constituição",cover:"adct",symbol:"§",subtitle:"CONSTITUIÇÃO",description:"Disposições transitórias da Constituição Federal.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/atividade-legislativa/legislacao/constituicao1988",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"INT-UDHR-1948-PT",title:"Declaração Universal dos Direitos Humanos",officialTitle:"Declaração Universal dos Direitos Humanos",category:"Direitos Humanos",cover:"human",symbol:"⚖",subtitle:"DIREITOS HUMANOS",description:"Documento internacional com 30 artigos sobre direitos e liberdades fundamentais.",source:"Nações Unidas no Brasil",sourceUrl:"https://brasil.un.org/pt-br/66717-declaracao-universal-dos-direitos-humanos",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CTB-1997",title:"Código de Trânsito Brasileiro",officialTitle:"Lei nº 9.503, de 23 de setembro de 1997",category:"Trânsito e Mobilidade",cover:"traffic",symbol:"CTB",subtitle:"TRÂNSITO E MOBILIDADE",description:"Legislação central para a formação do motorista.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CP-1940",title:"Código Penal",officialTitle:"Decreto-Lei nº 2.848, de 7 de dezembro de 1940",category:"Direito Penal",cover:"law",symbol:"⚖",subtitle:"DIREITO PENAL",description:"Parte geral e parte especial do Código Penal.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CPP-1941",title:"Código de Processo Penal",officialTitle:"Decreto-Lei nº 3.689, de 3 de outubro de 1941",category:"Processo Penal",cover:"law",symbol:"⚖",subtitle:"PROCESSO PENAL",description:"Normas do processo penal brasileiro.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-LEP-1984",title:"Lei de Execução Penal",officialTitle:"Lei nº 7.210, de 11 de julho de 1984",category:"Direito Penal",cover:"law",symbol:"⚖",subtitle:"DIREITO PENAL",description:"Execução das penas e direitos das pessoas privadas de liberdade.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/leis/l7210.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ECA-1990",title:"Estatuto da Criança e do Adolescente",officialTitle:"Lei nº 8.069, de 13 de julho de 1990",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Proteção integral de crianças e adolescentes.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/leis/l8069compilado.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CC-2002",title:"Código Civil",officialTitle:"Lei nº 10.406, de 10 de janeiro de 2002",category:"Direito Civil",cover:"law",symbol:"⚖",subtitle:"DIREITO CIVIL",description:"Normas gerais das relações civis.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CDC-1990",title:"Código de Defesa do Consumidor",officialTitle:"Lei nº 8.078, de 11 de setembro de 1990",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Direitos e proteção do consumidor.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-LMP-2006",title:"Lei Maria da Penha",officialTitle:"Lei nº 11.340, de 7 de agosto de 2006",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Mecanismos de prevenção e enfrentamento da violência doméstica e familiar.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ESTATUTO-IDOSO-2003",title:"Estatuto da Pessoa Idosa",officialTitle:"Lei nº 10.741, de 1º de outubro de 2003",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Direitos assegurados às pessoas idosas.",source:"Presidência da República — Planalto",sourceUrl:"https://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"INT-MANDELA-2015-PT",title:"Regras de Mandela",officialTitle:"Regras Mínimas das Nações Unidas para o Tratamento de Presos",category:"Direitos Humanos",cover:"human",symbol:"⚖",subtitle:"DIREITOS HUMANOS",description:"Padrões internacionais para o tratamento de pessoas presas.",source:"Nações Unidas / UNODC",sourceUrl:"https://www.unodc.org/documents/justice-and-prison-reform/Nelson_Mandela_Rules-P-ebook.pdf",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null}
  ];
  // Um pacote oficial local pode ser incorporado futuramente sem alterar a interface.
  const supplied=Array.isArray(global.DOCTOR_VADE_MECUM_DOCUMENTS)?global.DOCTOR_VADE_MECUM_DOCUMENTS:[];
  supplied.forEach(incoming=>{
    const target=documents.find(doc=>doc.id===incoming.id);
    if(!target||typeof incoming.content!=='string'||!incoming.content.trim())return;
    target.content=incoming.content;
    target.version=incoming.version||null;
    target.status=incoming.status||'Texto local disponível';
    target.lastVerifiedAt=incoming.lastVerifiedAt||null;
  });
  let activeDocument=null;
  let lastQuery='';
  const coverMarkup=doc=>'<div class="vade-book-cover '+esc(doc.cover)+'"><span class="vade-cover-kicker">BIBLIOTECA DOCTOR · TEXTO OFICIAL</span><span class="vade-cover-symbol">'+esc(doc.symbol)+'</span><div><div class="vade-cover-title">'+esc(doc.title)+'</div><div class="vade-cover-subtitle">'+esc(doc.subtitle)+'</div></div></div>';
  const bookMarkup=doc=>'<article class="vade-book">'+coverMarkup(doc)+'<div class="vade-book-info"><strong>'+esc(doc.title)+'</strong><p>'+esc(doc.description)+'</p><span class="vade-book-status">'+(doc.content?'Texto local disponível':'Conteúdo em preparação')+'</span><button class="vade-open" type="button" data-vade-open="'+esc(doc.id)+'">'+(doc.content?'Abrir leitura':'Ver detalhes')+'</button></div></article>';
  function render(){
    return '<section class="vade-library">'+
      '<button class="btn btn-ghost btn-sm" id="vade-back" type="button">← Voltar</button>'+
      '<header class="vade-hero"><div class="vade-hero-top"><div class="vade-emblem" aria-hidden="true">§</div><div><div class="vade-eyebrow">BIBLIOTECA JURÍDICA DIGITAL</div><h2>Vade-Mécum Doctor</h2><div style="font-size:10px;color:#dce7f4">Lei seca. Conhecimento na fonte.</div></div></div><p>Leia, consulte e estude normas, leis, códigos e constituições sem sair do aplicativo. O texto oficial é a base; explicações e resumos nunca o substituem.</p><span class="vade-promise">ACERVO GRATUITO · FONTES OFICIAIS</span></header>'+
      '<form class="card vade-search" id="vade-search-form"><label for="vade-query">Pesquisar dentro da biblioteca</label><div class="vade-search-row"><input id="vade-query" type="search" minlength="2" maxlength="180" placeholder="Ex.: art. 5º, CTB, direitos fundamentais..." autocomplete="off"><button type="submit" aria-label="Pesquisar na biblioteca">⌕</button></div><p class="vade-search-note">A pesquisa consulta somente os textos e documentos armazenados no aplicativo. Não envia você para outros sites.</p></form>'+
      '<div id="vade-status" class="legal-search-status" role="status" aria-live="polite">Acervo inicial organizado. Os textos integrais estão sendo preparados para leitura local e uso offline.</div><div id="vade-results" class="vade-results" aria-live="polite"></div><div id="vade-reader"></div>'+
      '<div class="vade-shelf-title">Constituição e organização do Estado</div><div class="vade-grid">'+documents.filter(d=>d.category==='Constituição').map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Trânsito e mobilidade</div><div class="vade-grid">'+documents.filter(d=>d.category==='Trânsito e Mobilidade').map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Códigos e legislação penal</div><div class="vade-grid">'+documents.filter(d=>['Direito Penal','Processo Penal'].includes(d.category)).map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Direito civil e legislação especial</div><div class="vade-grid">'+documents.filter(d=>['Direito Civil','Legislação Especial'].includes(d.category)).map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Direitos humanos e documentos internacionais</div><div class="vade-grid">'+documents.filter(d=>d.category==='Direitos Humanos').map(bookMarkup).join('')+'</div>'+
      '<p class="legal-search-disclaimer">Cada obra exibirá sua fonte oficial, versão e data da última verificação. A biblioteca não substitui a consulta ao edital do concurso.</p></section>';
  }
  function showDocument(id){
    const doc=documents.find(item=>item.id===id);
    if(!doc)return;
    activeDocument=id;
    const reader=document.getElementById('vade-reader');
    if(!reader)return;
    if(!doc.content){
      reader.innerHTML='<section class="card vade-reader"><div class="legal-search-result-index">OBRA CATALOGADA · TEXTO INTEGRAL EM PREPARAÇÃO</div><h3>'+esc(doc.title)+'</h3><p>'+esc(doc.officialTitle)+'</p><p>Fonte oficial prevista: '+esc(doc.source)+'.</p><div class="vade-empty">Estamos preparando a cópia integral oficial, a navegação por artigos e a versão offline desta obra. Ela só será liberada para leitura quando o texto for capturado, conferido e validado. Nenhum resumo ou link externo será apresentado como substituto da lei seca.</div><button type="button" class="btn btn-ghost btn-sm" id="vade-close-reader" style="margin-top:12px">Fechar</button></section>';
    }else{
      reader.innerHTML='<section class="card vade-reader"><div class="legal-search-result-index">LEI SECA · TEXTO ARMAZENADO NO APLICATIVO</div><h3>'+esc(doc.title)+'</h3><p>'+esc(doc.officialTitle)+' · '+esc(doc.source)+(doc.version?' · '+esc(doc.version):'')+'</p><div class="vade-reader-text">'+esc(doc.content)+'</div><button type="button" class="btn btn-ghost btn-sm" id="vade-close-reader" style="margin-top:12px">Fechar leitura</button></section>';
    }
    document.getElementById('vade-close-reader')?.addEventListener('click',()=>{activeDocument=null;reader.innerHTML='';});
    reader.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function search(query){
    const q=normalize(query);
    if(q.length<2)return [];
    const terms=q.split(/\s+/).filter(Boolean);
    return documents.map(doc=>{
      const text=normalize([doc.title,doc.officialTitle,doc.category,doc.description,doc.content].join(' '));
      const hits=terms.filter(term=>text.includes(term)).length;
      const exact=text.includes(q);
      const score=(exact?20:0)+hits*4+(doc.content&&normalize(doc.content).includes(q)?20:0);
      return {doc,score,hits};
    }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).map(item=>item.doc);
  }
  function bind(UI){
    document.getElementById('vade-back')?.addEventListener('click',()=>UI.back());
    document.querySelectorAll('[data-vade-open]').forEach(button=>button.addEventListener('click',()=>showDocument(button.getAttribute('data-vade-open'))));
    const form=document.getElementById('vade-search-form'),input=document.getElementById('vade-query'),status=document.getElementById('vade-status'),results=document.getElementById('vade-results');
    form?.addEventListener('submit',event=>{
      event.preventDefault();
      const query=input.value.trim();
      if(query.length<2){status.textContent='Digite pelo menos dois caracteres para pesquisar.';return;}
      lastQuery=query;
      const found=search(query);
      results.innerHTML='';
      if(!found.length){status.textContent='Nenhuma ocorrência encontrada nos documentos armazenados neste aplicativo. Quando o acervo integral estiver sincronizado, a busca percorrerá o texto dos artigos.';return;}
      status.textContent=found.length+' documento(s) correspondente(s) no catálogo local.';
      results.innerHTML=found.map(doc=>'<article class="vade-result"><button type="button" data-vade-result="'+esc(doc.id)+'"><strong>'+esc(doc.title)+'</strong><small>'+esc(doc.category)+' · '+(doc.content?'texto local pesquisável':'texto integral em preparação')+'</small></button></article>').join('');
      results.querySelectorAll('[data-vade-result]').forEach(button=>button.addEventListener('click',()=>showDocument(button.getAttribute('data-vade-result'))));
    });
  }
  global.DoctorVadeMecum={render,bind,search,showDocument,getCatalog:()=>documents.map(({content,...metadata})=>({...metadata,hasLocalText:!!content}))};
})(window);
