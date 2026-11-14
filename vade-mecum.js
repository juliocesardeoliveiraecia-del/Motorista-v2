/* Vade-Mécum Doctor — biblioteca e pesquisa exclusivamente locais.
 * Nenhuma consulta externa, redirecionamento ou API de busca é usada neste módulo.
 * Os textos integrais serão adicionados como pacotes oficiais versionados.
 */
(function(global){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9§º°]+/g,' ').trim();
  const documents=[
    {id:"BR-CF-1988",title:"Constituição Federal",officialTitle:"Constituição da República Federativa do Brasil de 1988",category:"Constituição",cover:"constitution",symbol:"§",subtitle:"CONSTITUIÇÃO",description:"A base constitucional do ordenamento jurídico brasileiro.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ADCT-1988",title:"ADCT",officialTitle:"Ato das Disposições Constitucionais Transitórias",category:"Constituição",cover:"adct",symbol:"§",subtitle:"CONSTITUIÇÃO",description:"Disposições transitórias da Constituição Federal.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/conadc/1988/constituicao.adct-1988-5-outubro-1988-322234-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"INT-UDHR-1948-PT",title:"Declaração Universal dos Direitos Humanos",officialTitle:"Declaração Universal dos Direitos Humanos",category:"Direitos Humanos",cover:"human",symbol:"⚖",subtitle:"DIREITOS HUMANOS",description:"Documento internacional com 30 artigos sobre direitos e liberdades fundamentais.",source:"OHCHR — Nações Unidas",sourceUrl:"https://www.ohchr.org/en/UDHR/Documents/UDHR_Translations/por.pdf",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CTB-1997",title:"Código de Trânsito Brasileiro",officialTitle:"Lei nº 9.503, de 23 de setembro de 1997",category:"Trânsito e Mobilidade",cover:"traffic",symbol:"CTB",subtitle:"TRÂNSITO E MOBILIDADE",description:"Legislação central para a formação do motorista.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/1997/lei-9503-23-setembro-1997-372348-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CP-1940",title:"Código Penal",officialTitle:"Decreto-Lei nº 2.848, de 7 de dezembro de 1940",category:"Direito Penal",cover:"law",symbol:"⚖",subtitle:"DIREITO PENAL",description:"Parte geral e parte especial do Código Penal.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-2848-7-dezembro-1940-412868-normaatualizada-pe.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CPP-1941",title:"Código de Processo Penal",officialTitle:"Decreto-Lei nº 3.689, de 3 de outubro de 1941",category:"Processo Penal",cover:"law",symbol:"⚖",subtitle:"PROCESSO PENAL",description:"Normas do processo penal brasileiro.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-3689-3-outubro-1941-322206-normaatualizada-pe.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-LEP-1984",title:"Lei de Execução Penal",officialTitle:"Lei nº 7.210, de 11 de julho de 1984",category:"Direito Penal",cover:"law",symbol:"⚖",subtitle:"DIREITO PENAL",description:"Execução das penas e direitos das pessoas privadas de liberdade.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/1980-1987/lei-7210-11-julho-1984-356938-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ECA-1990",title:"Estatuto da Criança e do Adolescente",officialTitle:"Lei nº 8.069, de 13 de julho de 1990",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Proteção integral de crianças e adolescentes.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/1990/lei-8069-13-julho-1990-372211-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CC-2002",title:"Código Civil",officialTitle:"Lei nº 10.406, de 10 de janeiro de 2002",category:"Direito Civil",cover:"law",symbol:"⚖",subtitle:"DIREITO CIVIL",description:"Normas gerais das relações civis.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/2002/lei-10406-10-janeiro-2002-432893-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CDC-1990",title:"Código de Defesa do Consumidor",officialTitle:"Lei nº 8.078, de 11 de setembro de 1990",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Direitos e proteção do consumidor.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-LMP-2006",title:"Lei Maria da Penha",officialTitle:"Lei nº 11.340, de 7 de agosto de 2006",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Mecanismos de prevenção e enfrentamento da violência doméstica e familiar.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/2006/lei-11340-7-agosto-2006-545133-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ESTATUTO-IDOSO-2003",title:"Estatuto da Pessoa Idosa",officialTitle:"Lei nº 10.741, de 1º de outubro de 2003",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Direitos assegurados às pessoas idosas.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/2003/lei-10741-1-outubro-2003-497511-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"INT-MANDELA-2015-PT",title:"Regras de Mandela",officialTitle:"Regras Mínimas das Nações Unidas para o Tratamento de Presos",category:"Direitos Humanos",cover:"human",symbol:"⚖",subtitle:"DIREITOS HUMANOS",description:"Padrões internacionais para o tratamento de pessoas presas.",source:"UNODC — Nações Unidas",sourceUrl:"https://www.unodc.org/documents/justice-and-prison-reform/Nelson_Mandela_Rules-P-ebook.pdf",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-MANUAL-REDACAO-PR-2018",title:"Manual de Redação da Presidência da República",officialTitle:"Manual de Redação da Presidência da República — 3ª edição, revista, atualizada e ampliada",category:"Redação Oficial",cover:"law",symbol:"✍",subtitle:"REDAÇÃO OFICIAL",description:"Padrões de comunicações oficiais, linguagem administrativa e elaboração de atos normativos.",source:"Presidência da República — Casa Civil / Centro de Estudos Jurídicos",sourceUrl:"https://www.gov.br/cidades/pt-br/midia/documentos/pdf/manualderedacao.pdf",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null}
  ];
  // Student sync accepts only published, hash-verified packages; failed updates never replace local last-known-good text.
  // Legal packages are stored per document in IndexedDB; no shell-wide pre-cache of the entire legal corpus.
  // Server-side read policies are consolidated; the legal sync module never widens student access.
  // Scheduled source checks create candidates only; they never auto-publish a legal update.
  // Daily runs use ETag/Last-Modified; the weekly run performs a full source fetch.
  // CTB source uses the Câmara's current updated HTML text, never the metadata landing page itself.
  // Other compiled Brazilian laws follow the same official updated-HTML resolver and title verification.
  // Each source-specific title matcher is validated before a candidate can enter the private bucket.
  // All Brazilian statutes now point directly at the official updated HTML version.
  // UN PDFs are extracted with PDF.js and rechecked byte-for-byte before editorial publication.
  // PDF text is accepted only when the complete expected article/rule range is present.
  // Constitution and ADCT revision gates follow the latest amendment applicable to each text separately.
  const LOCAL_DB_NAME='doctor-vade-mecum-offline-v1';
  const LOCAL_STORE='documents';
  function openLocalDb(){
    return new Promise((resolve,reject)=>{
      if(!global.indexedDB){reject(new Error('Armazenamento offline não disponível neste navegador.'));return;}
      const request=global.indexedDB.open(LOCAL_DB_NAME,1);
      request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(LOCAL_STORE))db.createObjectStore(LOCAL_STORE,{keyPath:'document_id'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Falha ao abrir biblioteca offline.'));
    });
  }
  function requestResult(request){
    return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('Falha no armazenamento offline.'));});
  }
  async function readLocalDocuments(){
    const db=await openLocalDb();
    try{const tx=db.transaction(LOCAL_STORE,'readonly');return await requestResult(tx.objectStore(LOCAL_STORE).getAll());}
    finally{db.close();}
  }
  async function saveLocalDocument(record){
    const db=await openLocalDb();
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(LOCAL_STORE,'readwrite');
        tx.objectStore(LOCAL_STORE).put(record);
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error||new Error('Não foi possível salvar a versão offline.'));
        tx.onabort=()=>reject(tx.error||new Error('Gravação offline cancelada.'));
      });
    }finally{db.close();}
  }
  function applyLocalDocument(record){
    const target=documents.find(doc=>doc.id===record.document_id);
    if(!target||typeof record.content!=='string'||!record.content.trim())return false;
    target.content=record.content;
    target.version=record.version_label||record.version_id||null;
    target.lastVerifiedAt=record.published_at||null;
    target.source=record.authority||target.source;
    target.sourceUrl=record.source_url||target.sourceUrl;
    target.status='Texto oficial validado · disponível offline';
    const status=document.querySelector('[data-vade-book-status="'+esc(target.id)+'"]');
    if(status)status.textContent='Disponível offline · '+(target.lastVerifiedAt?'publicada em '+new Date(target.lastVerifiedAt).toLocaleDateString('pt-BR'):'versão publicada');
    const button=document.querySelector('[data-vade-open="'+esc(target.id)+'"]');
    if(button)button.textContent='Abrir leitura';
    return true;
  }
  async function hydrateLocalDocuments(){
    try{const records=await readLocalDocuments();records.forEach(applyLocalDocument);return records.length;}
    catch(_){return 0;}
  }
  async function digestText(value){
    const bytes=new TextEncoder().encode(value);
    const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
    const digest=await global.crypto.subtle.digest('SHA-256',buffer);
    return Array.from(new Uint8Array(digest)).map(byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  async function syncPublishedDocuments(){
    if(!global.navigator?.onLine)return {offline:true,downloaded:0,unchanged:0};
    const bridge=global.DOCTOR_PLATFORM_BRIDGE;
    if(!bridge?.getAuthenticatedClient)throw new Error('Valide seu acesso online para sincronizar a biblioteca jurídica.');
    const client=await bridge.getAuthenticatedClient();
    const {data:catalog,error:catalogError}=await client.from('legal_documents')
      .select('document_id,display_title,authority,official_source_url,current_version_id')
      .eq('is_active',true);
    if(catalogError)throw catalogError;
    const current=(catalog||[]).filter(item=>item.current_version_id);
    if(!current.length)return {published:0,downloaded:0,unchanged:0};
    const versionIds=current.map(item=>item.current_version_id);
    const {data:versions,error:versionsError}=await client.from('legal_document_versions')
      .select('id,document_id,version_label,source_url,source_retrieved_at,published_at,content_sha256,storage_path,status')
      .in('id',versionIds).eq('status','published');
    if(versionsError)throw versionsError;
    const versionById=new Map((versions||[]).map(item=>[item.id,item]));
    let downloaded=0,unchanged=0;
    for(const doc of current){
      const version=versionById.get(doc.current_version_id);
      if(!version||!version.storage_path)continue;
      const localRecords=await readLocalDocuments();
      const existing=localRecords.find(item=>item.document_id===doc.document_id);
      if(existing?.version_id===version.id){unchanged++;continue;}
      const {data:file,error:fileError}=await client.storage.from('legal-library').download(version.storage_path);
      if(fileError||!file)throw fileError||new Error('Pacote jurídico não disponível no armazenamento privado.');
      const pack=JSON.parse(await file.text());
      if(pack.document_id!==doc.document_id||typeof pack.normalized_text!=='string'||!pack.normalized_text.trim())throw new Error('Pacote jurídico inconsistente: '+doc.document_id);
      const actualHash=await digestText(pack.normalized_text);
      if(actualHash!==version.content_sha256||actualHash!==pack.sha256_text)throw new Error('A integridade do texto não confere. A cópia offline anterior foi preservada.');
      if(pack.source?.url!==version.source_url)throw new Error('A origem registrada no pacote não confere com a versão publicada.');
      const record={
        document_id:doc.document_id,version_id:version.id,version_label:version.version_label,
        content:pack.normalized_text,sha256:actualHash,authority:doc.authority,
        source_url:version.source_url,published_at:version.published_at||null
      };
      await saveLocalDocument(record);
      applyLocalDocument(record);
      downloaded++;
    }
    return {published:current.length,downloaded,unchanged};
  }
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
  const bookMarkup=doc=>'<article class="vade-book">'+coverMarkup(doc)+'<div class="vade-book-info"><strong>'+esc(doc.title)+'</strong><p>'+esc(doc.description)+'</p><span class="vade-book-status" data-vade-book-status="'+esc(doc.id)+'">'+(doc.content?'Texto local disponível':'Conteúdo em preparação')+'</span><button class="vade-open" type="button" data-vade-open="'+esc(doc.id)+'">'+(doc.content?'Abrir leitura':'Ver detalhes')+'</button></div></article>';
  function render(){
    return '<section class="vade-library">'+
      '<button class="btn btn-ghost btn-sm" id="vade-back" type="button">← Voltar</button>'+
      '<header class="vade-hero"><div class="vade-hero-top"><div class="vade-emblem" aria-hidden="true">§</div><div><div class="vade-eyebrow">BIBLIOTECA JURÍDICA DIGITAL</div><h2>Vade-Mécum Doctor</h2><div style="font-size:10px;color:#dce7f4">Lei seca. Conhecimento na fonte.</div></div></div><p>Leia, consulte e estude normas, leis, códigos e constituições sem sair do aplicativo. O texto oficial é a base; explicações e resumos nunca o substituem.</p><span class="vade-promise">ACERVO GRATUITO · FONTES OFICIAIS</span></header>'+
      '<form class="card vade-search" id="vade-search-form"><label for="vade-query">Pesquisar dentro da biblioteca</label><div class="vade-search-row"><input id="vade-query" type="search" minlength="2" maxlength="180" placeholder="Ex.: art. 5º, CTB, direitos fundamentais..." autocomplete="off"><button type="submit" aria-label="Pesquisar na biblioteca">⌕</button></div></form>'+
      '<div id="vade-admin-panel" hidden></div><div id="vade-results" class="vade-results" aria-live="polite"></div><div id="vade-reader"></div>'+
      '<div class="vade-shelf-title">Constituição e organização do Estado</div><div class="vade-grid">'+documents.filter(d=>d.category==='Constituição').map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Trânsito e mobilidade</div><div class="vade-grid">'+documents.filter(d=>d.category==='Trânsito e Mobilidade').map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Códigos e legislação penal</div><div class="vade-grid">'+documents.filter(d=>['Direito Penal','Processo Penal'].includes(d.category)).map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Direito civil e legislação especial</div><div class="vade-grid">'+documents.filter(d=>['Direito Civil','Legislação Especial'].includes(d.category)).map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Direitos humanos e documentos internacionais</div><div class="vade-grid">'+documents.filter(d=>d.category==='Direitos Humanos').map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Redação oficial e comunicação administrativa</div><div class="vade-grid">'+documents.filter(d=>d.category==='Redação Oficial').map(bookMarkup).join('')+'</div>'+
      '<p class="legal-search-disclaimer">Cada obra exibirá sua fonte oficial, versão e data da última verificação. A biblioteca não substitui a consulta ao edital do concurso.</p></section>';
  }
  function showDocument(id){
    const doc=documents.find(item=>item.id===id);
    if(!doc)return;
    // A leitura é uma subetapa da biblioteca: o voltar do app deve retornar ao catálogo,
    // sem encerrar o Vade-Mécum. Reutiliza o histórico do Doctor Core, sem criar outra rota.
    if(!global.history?.state?.vadeReader){
      const previousState=global.history?.state||{};
      global.history?.pushState?.({
        ...previousState,
        doctorCore:true,
        view:'legalSearch',
        navIndex:Number(previousState.navIndex)||0,
        vadeReader:true
      },'',global.location?.href);
    }
    activeDocument=id;
    const reader=document.getElementById('vade-reader');
    if(!reader)return;
    if(!doc.content){
      reader.innerHTML='<section class="card vade-reader"><div class="legal-search-result-index">OBRA CATALOGADA · TEXTO INTEGRAL EM PREPARAÇÃO</div><h3>'+esc(doc.title)+'</h3><p>'+esc(doc.officialTitle)+'</p><p>Fonte oficial prevista: '+esc(doc.source)+'.</p><div class="vade-empty">Estamos preparando a cópia integral oficial, a navegação por artigos e a versão offline desta obra. Ela só será liberada para leitura quando o texto for capturado, conferido e validado. Nenhum resumo ou link externo será apresentado como substituto da lei seca.</div><button type="button" class="btn btn-ghost btn-sm" id="vade-close-reader" style="margin-top:12px">← Voltar à biblioteca</button></section>';
    }else{
      reader.innerHTML='<section class="card vade-reader"><div class="legal-search-result-index">LEI SECA · TEXTO ARMAZENADO NO APLICATIVO</div><h3>'+esc(doc.title)+'</h3><p>'+esc(doc.officialTitle)+' · '+esc(doc.source)+(doc.version?' · '+esc(doc.version):'')+(doc.lastVerifiedAt?' · publicada em '+esc(new Date(doc.lastVerifiedAt).toLocaleString('pt-BR')):'')+'</p><div class="vade-reader-text">'+esc(doc.content)+'</div><button type="button" class="btn btn-ghost btn-sm" id="vade-close-reader" style="margin-top:12px">← Voltar à biblioteca</button></section>';
    }
    document.getElementById('vade-close-reader')?.addEventListener('click',()=>{
      if(global.history?.state?.vadeReader){global.history.back();return;}
      activeDocument=null;
      reader.innerHTML='';
    });
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
    const syncStatus=document.getElementById('vade-status');
    const syncButton=document.getElementById('vade-sync');
    const sync=async()=>{
      if(syncButton)syncButton.disabled=true;
      if(syncStatus)syncStatus.textContent='Verificando versões oficiais publicadas...';
      try{
        const localCount=await hydrateLocalDocuments();
        const result=await syncPublishedDocuments();
        if(syncStatus){
          if(result.offline)syncStatus.textContent=localCount+' documento(s) disponível(is) offline. Sem conexão; nenhuma cópia local foi alterada.';
          else if(!result.published)syncStatus.textContent=localCount+' documento(s) disponível(is) offline. Ainda não há textos integrais publicados no acervo central.';
          else syncStatus.textContent=result.downloaded+' nova(s) versão(ões) baixada(s); '+result.unchanged+' já estavam atualizadas. '+localCount+' documento(s) local(is) recuperado(s).';
        }
      }catch(error){
        if(syncStatus)syncStatus.textContent='Não foi possível sincronizar agora. As versões offline já armazenadas foram preservadas. '+String(error?.message||'');
      }finally{if(syncButton)syncButton.disabled=false;}
    };
    syncButton?.addEventListener('click',sync);

    const adminButton=document.getElementById('vade-admin-review');
    const adminPanel=document.getElementById('vade-admin-panel');
    let adminClient=null;
    async function invokeEditorial(body){
      if(!adminClient)throw new Error('Sessão administrativa não validada.');
      const {data,error}=await adminClient.functions.invoke('legal-library-publish',{body});
      if(error)throw error;
      if(data?.error)throw new Error(data.error);
      return data;
    }
    async function loadEditorialQueue(){
      if(!adminClient||!adminPanel)return;
      adminPanel.hidden=false;
      adminPanel.innerHTML='<section class="card" style="padding:16px;margin:12px 0"><strong>Carregando versões para revisão...</strong></section>';
      const {data:rows,error}=await adminClient.from('legal_document_versions')
        .select('id,document_id,version_label,source_url,source_retrieved_at,content_sha256,status,change_summary')
        .in('status',['candidate','in_review','approved'])
        .order('source_retrieved_at',{ascending:false}).limit(40);
      if(error)throw error;
      const titleById=new Map(documents.map(doc=>[doc.id,doc.title]));
      adminPanel.innerHTML='<section class="card" style="padding:16px;margin:12px 0;border:1px solid var(--border-color,#d9dee7)">'+
        '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><strong>Revisão editorial do Vade-Mécum</strong><p style="margin:5px 0;color:var(--text-secondary,#667085);font-size:13px">A validação em lote confere pacote original, hash, extração integral, fonte oficial, título e marcadores de completude. Só publica documentos aprovados por todos os testes.</p></div><button type="button" class="btn btn-ghost btn-sm" id="vade-admin-refresh">Atualizar fila</button></div>'+
        '<div style="margin-top:10px;padding:12px;border:1px solid var(--border-color,#d9dee7);border-radius:10px"><button type="button" class="btn btn-primary btn-sm" id="vade-admin-validate-publish">Validar e publicar documentos aptos</button><p style="font-size:11px;color:var(--text-secondary,#667085);margin:7px 0 0">Processa as versões mais recentes de cada documento. Uma falha não bloqueia os demais; nada é publicado sem confirmação administrativa.</p><div id="vade-admin-batch-status" aria-live="polite" style="font-size:12px;margin-top:8px"></div></div>'+
        ((rows||[]).length?'<div style="display:grid;gap:8px;margin-top:12px">'+rows.map(row=>'<article data-status="'+esc(row.status)+'" style="padding:10px;border:1px solid var(--border-color,#d9dee7);border-radius:10px"><strong>'+esc(titleById.get(row.document_id)||row.document_id)+'</strong><div style="font-size:12px;color:var(--text-secondary,#667085);margin:4px 0">'+esc(row.status)+' · '+esc(row.version_label||'versão candidata')+' · '+esc(row.source_retrieved_at?new Date(row.source_retrieved_at).toLocaleString('pt-BR'):'data não informada')+'</div><div style="font-size:11px;word-break:break-all;color:var(--text-secondary,#667085)">SHA-256: '+esc(row.content_sha256)+'</div><a href="'+esc(row.source_url)+'" target="_blank" rel="noopener noreferrer" style="font-size:12px">Abrir fonte oficial</a><div style="margin-top:8px"><button type="button" class="btn btn-outline btn-sm" data-vade-preview="'+esc(row.id)+'">Pré-visualizar e revisar</button></div></article>').join('')+'</div>':'<p style="margin-top:12px">Não há versões candidatas ou aprovadas aguardando decisão.</p>')+
        '<div id="vade-admin-preview" style="margin-top:14px"></div></section>';
      document.getElementById('vade-admin-refresh')?.addEventListener('click',()=>loadEditorialQueue().catch(showEditorialError));
      adminPanel.querySelectorAll('[data-vade-preview]').forEach(button=>button.addEventListener('click',()=>openEditorialPreview(button.getAttribute('data-vade-preview')).catch(showEditorialError)));
    }
    function validateLegalText(documentId,text){
/* Vade-Mécum Doctor — biblioteca e pesquisa exclusivamente locais.
 * Nenhuma consulta externa, redirecionamento ou API de busca é usada neste módulo.
 * Os textos integrais serão adicionados como pacotes oficiais versionados.
 */
(function(global){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9§º°]+/g,' ').trim();
  const documents=[
    {id:"BR-CF-1988",title:"Constituição Federal",officialTitle:"Constituição da República Federativa do Brasil de 1988",category:"Constituição",cover:"constitution",symbol:"§",subtitle:"CONSTITUIÇÃO",description:"A base constitucional do ordenamento jurídico brasileiro.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ADCT-1988",title:"ADCT",officialTitle:"Ato das Disposições Constitucionais Transitórias",category:"Constituição",cover:"adct",symbol:"§",subtitle:"CONSTITUIÇÃO",description:"Disposições transitórias da Constituição Federal.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/conadc/1988/constituicao.adct-1988-5-outubro-1988-322234-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"INT-UDHR-1948-PT",title:"Declaração Universal dos Direitos Humanos",officialTitle:"Declaração Universal dos Direitos Humanos",category:"Direitos Humanos",cover:"human",symbol:"⚖",subtitle:"DIREITOS HUMANOS",description:"Documento internacional com 30 artigos sobre direitos e liberdades fundamentais.",source:"OHCHR — Nações Unidas",sourceUrl:"https://www.ohchr.org/en/UDHR/Documents/UDHR_Translations/por.pdf",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CTB-1997",title:"Código de Trânsito Brasileiro",officialTitle:"Lei nº 9.503, de 23 de setembro de 1997",category:"Trânsito e Mobilidade",cover:"traffic",symbol:"CTB",subtitle:"TRÂNSITO E MOBILIDADE",description:"Legislação central para a formação do motorista.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/1997/lei-9503-23-setembro-1997-372348-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CP-1940",title:"Código Penal",officialTitle:"Decreto-Lei nº 2.848, de 7 de dezembro de 1940",category:"Direito Penal",cover:"law",symbol:"⚖",subtitle:"DIREITO PENAL",description:"Parte geral e parte especial do Código Penal.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-2848-7-dezembro-1940-412868-normaatualizada-pe.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CPP-1941",title:"Código de Processo Penal",officialTitle:"Decreto-Lei nº 3.689, de 3 de outubro de 1941",category:"Processo Penal",cover:"law",symbol:"⚖",subtitle:"PROCESSO PENAL",description:"Normas do processo penal brasileiro.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/declei/1940-1949/decreto-lei-3689-3-outubro-1941-322206-normaatualizada-pe.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-LEP-1984",title:"Lei de Execução Penal",officialTitle:"Lei nº 7.210, de 11 de julho de 1984",category:"Direito Penal",cover:"law",symbol:"⚖",subtitle:"DIREITO PENAL",description:"Execução das penas e direitos das pessoas privadas de liberdade.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/1980-1987/lei-7210-11-julho-1984-356938-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ECA-1990",title:"Estatuto da Criança e do Adolescente",officialTitle:"Lei nº 8.069, de 13 de julho de 1990",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Proteção integral de crianças e adolescentes.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/1990/lei-8069-13-julho-1990-372211-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CC-2002",title:"Código Civil",officialTitle:"Lei nº 10.406, de 10 de janeiro de 2002",category:"Direito Civil",cover:"law",symbol:"⚖",subtitle:"DIREITO CIVIL",description:"Normas gerais das relações civis.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/2002/lei-10406-10-janeiro-2002-432893-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-CDC-1990",title:"Código de Defesa do Consumidor",officialTitle:"Lei nº 8.078, de 11 de setembro de 1990",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Direitos e proteção do consumidor.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-LMP-2006",title:"Lei Maria da Penha",officialTitle:"Lei nº 11.340, de 7 de agosto de 2006",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Mecanismos de prevenção e enfrentamento da violência doméstica e familiar.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/2006/lei-11340-7-agosto-2006-545133-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-ESTATUTO-IDOSO-2003",title:"Estatuto da Pessoa Idosa",officialTitle:"Lei nº 10.741, de 1º de outubro de 2003",category:"Legislação Especial",cover:"law",symbol:"⚖",subtitle:"LEGISLAÇÃO ESPECIAL",description:"Direitos assegurados às pessoas idosas.",source:"Câmara dos Deputados",sourceUrl:"https://www2.camara.leg.br/legin/fed/lei/2003/lei-10741-1-outubro-2003-497511-normaatualizada-pl.html",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"INT-MANDELA-2015-PT",title:"Regras de Mandela",officialTitle:"Regras Mínimas das Nações Unidas para o Tratamento de Presos",category:"Direitos Humanos",cover:"human",symbol:"⚖",subtitle:"DIREITOS HUMANOS",description:"Padrões internacionais para o tratamento de pessoas presas.",source:"UNODC — Nações Unidas",sourceUrl:"https://www.unodc.org/documents/justice-and-prison-reform/Nelson_Mandela_Rules-P-ebook.pdf",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null},
    {id:"BR-MANUAL-REDACAO-PR-2018",title:"Manual de Redação da Presidência da República",officialTitle:"Manual de Redação da Presidência da República — 3ª edição, revista, atualizada e ampliada",category:"Redação Oficial",cover:"law",symbol:"✍",subtitle:"REDAÇÃO OFICIAL",description:"Padrões de comunicações oficiais, linguagem administrativa e elaboração de atos normativos.",source:"Presidência da República — Casa Civil / Centro de Estudos Jurídicos",sourceUrl:"https://www.gov.br/cidades/pt-br/midia/documentos/pdf/manualderedacao.pdf",status:'Fonte oficial catalogada · texto integral em preparação',content:'',version:null}
  ];
  // Student sync accepts only published, hash-verified packages; failed updates never replace local last-known-good text.
  // Legal packages are stored per document in IndexedDB; no shell-wide pre-cache of the entire legal corpus.
  // Server-side read policies are consolidated; the legal sync module never widens student access.
  // Scheduled source checks create candidates only; they never auto-publish a legal update.
  // Daily runs use ETag/Last-Modified; the weekly run performs a full source fetch.
  // CTB source uses the Câmara's current updated HTML text, never the metadata landing page itself.
  // Other compiled Brazilian laws follow the same official updated-HTML resolver and title verification.
  // Each source-specific title matcher is validated before a candidate can enter the private bucket.
  // All Brazilian statutes now point directly at the official updated HTML version.
  // UN PDFs are extracted with PDF.js and rechecked byte-for-byte before editorial publication.
  // PDF text is accepted only when the complete expected article/rule range is present.
  // Constitution and ADCT revision gates follow the latest amendment applicable to each text separately.
  const LOCAL_DB_NAME='doctor-vade-mecum-offline-v1';
  const LOCAL_STORE='documents';
  function openLocalDb(){
    return new Promise((resolve,reject)=>{
      if(!global.indexedDB){reject(new Error('Armazenamento offline não disponível neste navegador.'));return;}
      const request=global.indexedDB.open(LOCAL_DB_NAME,1);
      request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(LOCAL_STORE))db.createObjectStore(LOCAL_STORE,{keyPath:'document_id'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Falha ao abrir biblioteca offline.'));
    });
  }
  function requestResult(request){
    return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error('Falha no armazenamento offline.'));});
  }
  async function readLocalDocuments(){
    const db=await openLocalDb();
    try{const tx=db.transaction(LOCAL_STORE,'readonly');return await requestResult(tx.objectStore(LOCAL_STORE).getAll());}
    finally{db.close();}
  }
  async function saveLocalDocument(record){
    const db=await openLocalDb();
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(LOCAL_STORE,'readwrite');
        tx.objectStore(LOCAL_STORE).put(record);
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error||new Error('Não foi possível salvar a versão offline.'));
        tx.onabort=()=>reject(tx.error||new Error('Gravação offline cancelada.'));
      });
    }finally{db.close();}
  }
  function applyLocalDocument(record){
    const target=documents.find(doc=>doc.id===record.document_id);
    if(!target||typeof record.content!=='string'||!record.content.trim())return false;
    target.content=record.content;
    target.version=record.version_label||record.version_id||null;
    target.lastVerifiedAt=record.published_at||null;
    target.source=record.authority||target.source;
    target.sourceUrl=record.source_url||target.sourceUrl;
    target.status='Texto oficial validado · disponível offline';
    const status=document.querySelector('[data-vade-book-status="'+esc(target.id)+'"]');
    if(status)status.textContent='Disponível offline · '+(target.lastVerifiedAt?'publicada em '+new Date(target.lastVerifiedAt).toLocaleDateString('pt-BR'):'versão publicada');
    const button=document.querySelector('[data-vade-open="'+esc(target.id)+'"]');
    if(button)button.textContent='Abrir leitura';
    return true;
  }
  async function hydrateLocalDocuments(){
    try{const records=await readLocalDocuments();records.forEach(applyLocalDocument);return records.length;}
    catch(_){return 0;}
  }
  async function digestText(value){
    const bytes=new TextEncoder().encode(value);
    const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
    const digest=await global.crypto.subtle.digest('SHA-256',buffer);
    return Array.from(new Uint8Array(digest)).map(byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  async function syncPublishedDocuments(){
    if(!global.navigator?.onLine)return {offline:true,downloaded:0,unchanged:0};
    const bridge=global.DOCTOR_PLATFORM_BRIDGE;
    if(!bridge?.getAuthenticatedClient)throw new Error('Valide seu acesso online para sincronizar a biblioteca jurídica.');
    const client=await bridge.getAuthenticatedClient();
    const {data:catalog,error:catalogError}=await client.from('legal_documents')
      .select('document_id,display_title,authority,official_source_url,current_version_id')
      .eq('is_active',true);
    if(catalogError)throw catalogError;
    const current=(catalog||[]).filter(item=>item.current_version_id);
    if(!current.length)return {published:0,downloaded:0,unchanged:0};
    const versionIds=current.map(item=>item.current_version_id);
    const {data:versions,error:versionsError}=await client.from('legal_document_versions')
      .select('id,document_id,version_label,source_url,source_retrieved_at,published_at,content_sha256,storage_path,status')
      .in('id',versionIds).eq('status','published');
    if(versionsError)throw versionsError;
    const versionById=new Map((versions||[]).map(item=>[item.id,item]));
    let downloaded=0,unchanged=0;
    for(const doc of current){
      const version=versionById.get(doc.current_version_id);
      if(!version||!version.storage_path)continue;
      const localRecords=await readLocalDocuments();
      const existing=localRecords.find(item=>item.document_id===doc.document_id);
      if(existing?.version_id===version.id){unchanged++;continue;}
      const {data:file,error:fileError}=await client.storage.from('legal-library').download(version.storage_path);
      if(fileError||!file)throw fileError||new Error('Pacote jurídico não disponível no armazenamento privado.');
      const pack=JSON.parse(await file.text());
      if(pack.document_id!==doc.document_id||typeof pack.normalized_text!=='string'||!pack.normalized_text.trim())throw new Error('Pacote jurídico inconsistente: '+doc.document_id);
      const actualHash=await digestText(pack.normalized_text);
      if(actualHash!==version.content_sha256||actualHash!==pack.sha256_text)throw new Error('A integridade do texto não confere. A cópia offline anterior foi preservada.');
      if(pack.source?.url!==version.source_url)throw new Error('A origem registrada no pacote não confere com a versão publicada.');
      const record={
        document_id:doc.document_id,version_id:version.id,version_label:version.version_label,
        content:pack.normalized_text,sha256:actualHash,authority:doc.authority,
        source_url:version.source_url,published_at:version.published_at||null
      };
      await saveLocalDocument(record);
      applyLocalDocument(record);
      downloaded++;
    }
    return {published:current.length,downloaded,unchanged};
  }
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
  const bookMarkup=doc=>'<article class="vade-book">'+coverMarkup(doc)+'<div class="vade-book-info"><strong>'+esc(doc.title)+'</strong><p>'+esc(doc.description)+'</p><span class="vade-book-status" data-vade-book-status="'+esc(doc.id)+'">'+(doc.content?'Texto local disponível':'Conteúdo em preparação')+'</span><button class="vade-open" type="button" data-vade-open="'+esc(doc.id)+'">'+(doc.content?'Abrir leitura':'Ver detalhes')+'</button></div></article>';
  function render(){
    return '<section class="vade-library">'+
      '<button class="btn btn-ghost btn-sm" id="vade-back" type="button">← Voltar</button>'+
      '<header class="vade-hero"><div class="vade-hero-top"><div class="vade-emblem" aria-hidden="true">§</div><div><div class="vade-eyebrow">BIBLIOTECA JURÍDICA DIGITAL</div><h2>Vade-Mécum Doctor</h2><div style="font-size:10px;color:#dce7f4">Lei seca. Conhecimento na fonte.</div></div></div><p>Leia, consulte e estude normas, leis, códigos e constituições sem sair do aplicativo. O texto oficial é a base; explicações e resumos nunca o substituem.</p><span class="vade-promise">ACERVO GRATUITO · FONTES OFICIAIS</span></header>'+
      '<form class="card vade-search" id="vade-search-form"><label for="vade-query">Pesquisar dentro da biblioteca</label><div class="vade-search-row"><input id="vade-query" type="search" minlength="2" maxlength="180" placeholder="Ex.: art. 5º, CTB, direitos fundamentais..." autocomplete="off"><button type="submit" aria-label="Pesquisar na biblioteca">⌕</button></div></form>'+
      '<div id="vade-admin-panel" hidden></div><div id="vade-results" class="vade-results" aria-live="polite"></div><div id="vade-reader"></div>'+
      '<div class="vade-shelf-title">Constituição e organização do Estado</div><div class="vade-grid">'+documents.filter(d=>d.category==='Constituição').map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Trânsito e mobilidade</div><div class="vade-grid">'+documents.filter(d=>d.category==='Trânsito e Mobilidade').map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Códigos e legislação penal</div><div class="vade-grid">'+documents.filter(d=>['Direito Penal','Processo Penal'].includes(d.category)).map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Direito civil e legislação especial</div><div class="vade-grid">'+documents.filter(d=>['Direito Civil','Legislação Especial'].includes(d.category)).map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Direitos humanos e documentos internacionais</div><div class="vade-grid">'+documents.filter(d=>d.category==='Direitos Humanos').map(bookMarkup).join('')+'</div>'+
      '<div class="vade-shelf-title">Redação oficial e comunicação administrativa</div><div class="vade-grid">'+documents.filter(d=>d.category==='Redação Oficial').map(bookMarkup).join('')+'</div>'+
      '<p class="legal-search-disclaimer">Cada obra exibirá sua fonte oficial, versão e data da última verificação. A biblioteca não substitui a consulta ao edital do concurso.</p></section>';
  }
  function showDocument(id){
    const doc=documents.find(item=>item.id===id);
    if(!doc)return;
    // A leitura é uma subetapa da biblioteca: o voltar do app deve retornar ao catálogo,
    // sem encerrar o Vade-Mécum. Reutiliza o histórico do Doctor Core, sem criar outra rota.
    if(!global.history?.state?.vadeReader){
      const previousState=global.history?.state||{};
      global.history?.pushState?.({
        ...previousState,
        doctorCore:true,
        view:'legalSearch',
        navIndex:Number(previousState.navIndex)||0,
        vadeReader:true
      },'',global.location?.href);
    }
    activeDocument=id;
    const reader=document.getElementById('vade-reader');
    if(!reader)return;
    if(!doc.content){
      reader.innerHTML='<section class="card vade-reader"><div class="legal-search-result-index">OBRA CATALOGADA · TEXTO INTEGRAL EM PREPARAÇÃO</div><h3>'+esc(doc.title)+'</h3><p>'+esc(doc.officialTitle)+'</p><p>Fonte oficial prevista: '+esc(doc.source)+'.</p><div class="vade-empty">Estamos preparando a cópia integral oficial, a navegação por artigos e a versão offline desta obra. Ela só será liberada para leitura quando o texto for capturado, conferido e validado. Nenhum resumo ou link externo será apresentado como substituto da lei seca.</div><button type="button" class="btn btn-ghost btn-sm" id="vade-close-reader" style="margin-top:12px">← Voltar à biblioteca</button></section>';
    }else{
      reader.innerHTML='<section class="card vade-reader"><div class="legal-search-result-index">LEI SECA · TEXTO ARMAZENADO NO APLICATIVO</div><h3>'+esc(doc.title)+'</h3><p>'+esc(doc.officialTitle)+' · '+esc(doc.source)+(doc.version?' · '+esc(doc.version):'')+(doc.lastVerifiedAt?' · publicada em '+esc(new Date(doc.lastVerifiedAt).toLocaleString('pt-BR')):'')+'</p><div class="vade-reader-text">'+esc(doc.content)+'</div><button type="button" class="btn btn-ghost btn-sm" id="vade-close-reader" style="margin-top:12px">← Voltar à biblioteca</button></section>';
    }
    document.getElementById('vade-close-reader')?.addEventListener('click',()=>{
      if(global.history?.state?.vadeReader){global.history.back();return;}
      activeDocument=null;
      reader.innerHTML='';
    });
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
    const syncStatus=document.getElementById('vade-status');
    const syncButton=document.getElementById('vade-sync');
    const sync=async()=>{
      if(syncButton)syncButton.disabled=true;
      if(syncStatus)syncStatus.textContent='Verificando versões oficiais publicadas...';
      try{
        const localCount=await hydrateLocalDocuments();
        const result=await syncPublishedDocuments();
        if(syncStatus){
          if(result.offline)syncStatus.textContent=localCount+' documento(s) disponível(is) offline. Sem conexão; nenhuma cópia local foi alterada.';
          else if(!result.published)syncStatus.textContent=localCount+' documento(s) disponível(is) offline. Ainda não há textos integrais publicados no acervo central.';
          else syncStatus.textContent=result.downloaded+' nova(s) versão(ões) baixada(s); '+result.unchanged+' já estavam atualizadas. '+localCount+' documento(s) local(is) recuperado(s).';
        }
      }catch(error){
        if(syncStatus)syncStatus.textContent='Não foi possível sincronizar agora. As versões offline já armazenadas foram preservadas. '+String(error?.message||'');
      }finally{if(syncButton)syncButton.disabled=false;}
    };
    syncButton?.addEventListener('click',sync);

    const adminButton=document.getElementById('vade-admin-review');
    const adminPanel=document.getElementById('vade-admin-panel');
    let adminClient=null;
    async function invokeEditorial(body){
      if(!adminClient)throw new Error('Sessão administrativa não validada.');
      const {data,error}=await adminClient.functions.invoke('legal-library-publish',{body});
      if(error)throw error;
      if(data?.error)throw new Error(data.error);
      return data;
    }
    async function loadEditorialQueue(){
      if(!adminClient||!adminPanel)return;
      adminPanel.hidden=false;
      adminPanel.innerHTML='<section class="card" style="padding:16px;margin:12px 0"><strong>Carregando versões para revisão...</strong></section>';
      const {data:rows,error}=await adminClient.from('legal_document_versions')
        .select('id,document_id,version_label,source_url,source_retrieved_at,content_sha256,status,change_summary')
        .in('status',['candidate','in_review','approved'])
        .order('source_retrieved_at',{ascending:false}).limit(40);
      if(error)throw error;
      const titleById=new Map(documents.map(doc=>[doc.id,doc.title]));
      adminPanel.innerHTML='<section class="card" style="padding:16px;margin:12px 0;border:1px solid var(--border-color,#d9dee7)">'+
        '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><strong>Revisão editorial do Vade-Mécum</strong><p style="margin:5px 0;color:var(--text-secondary,#667085);font-size:13px">A validação em lote confere pacote original, hash, extração integral, fonte oficial, título e marcadores de completude. Só publica documentos aprovados por todos os testes.</p></div><button type="button" class="btn btn-ghost btn-sm" id="vade-admin-refresh">Atualizar fila</button></div>'+
        '<div style="margin-top:10px;padding:12px;border:1px solid var(--border-color,#d9dee7);border-radius:10px"><button type="button" class="btn btn-primary btn-sm" id="vade-admin-validate-publish">Validar e publicar documentos aptos</button><p style="font-size:11px;color:var(--text-secondary,#667085);margin:7px 0 0">Processa as versões mais recentes de cada documento. Uma falha não bloqueia os demais; nada é publicado sem confirmação administrativa.</p><div id="vade-admin-batch-status" aria-live="polite" style="font-size:12px;margin-top:8px"></div></div>'+
        ((rows||[]).length?'<div style="display:grid;gap:8px;margin-top:12px">'+rows.map(row=>'<article data-status="'+esc(row.status)+'" style="padding:10px;border:1px solid var(--border-color,#d9dee7);border-radius:10px"><strong>'+esc(titleById.get(row.document_id)||row.document_id)+'</strong><div style="font-size:12px;color:var(--text-secondary,#667085);margin:4px 0">'+esc(row.status)+' · '+esc(row.version_label||'versão candidata')+' · '+esc(row.source_retrieved_at?new Date(row.source_retrieved_at).toLocaleString('pt-BR'):'data não informada')+'</div><div style="font-size:11px;word-break:break-all;color:var(--text-secondary,#667085)">SHA-256: '+esc(row.content_sha256)+'</div><a href="'+esc(row.source_url)+'" target="_blank" rel="noopener noreferrer" style="font-size:12px">Abrir fonte oficial</a><div style="margin-top:8px"><button type="button" class="btn btn-outline btn-sm" data-vade-preview="'+esc(row.id)+'">Pré-visualizar e revisar</button></div></article>').join('')+'</div>':'<p style="margin-top:12px">Não há versões candidatas ou aprovadas aguardando decisão.</p>')+
        '<div id="vade-admin-preview" style="margin-top:14px"></div></section>';
      document.getElementById('vade-admin-refresh')?.addEventListener('click',()=>loadEditorialQueue().catch(showEditorialError));
      adminPanel.querySelectorAll('[data-vade-preview]').forEach(button=>button.addEventListener('click',()=>openEditorialPreview(button.getAttribute('data-vade-preview')).catch(showEditorialError)));
    }
    function validateLegalText(documentId,text){
      const checks={        'BR-MANUAL-REDACAO-PR-2018':[/MANUAL DE REDAÇÃO DA PRESIDÊNCIA DA REPÚBLICA/i,/3\\s*(?:ª|a)\\s*EDIÇÃO/i,/COMUNICAÇÕES OFICIAIS/i,/ATOS NORMATIVOS/i],

        'BR-CF-1988':[/CONSTITUIÇÃO DA REPÚBLICA FEDERATIVA DO BRASIL/i, /Art\.?\s*1º/i, /EMENDA CONSTITUCIONAL Nº 141|EC Nº 141/i],
        'BR-ADCT-1988':[/ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS/i, /Art\.?\s*1º/i, /EMENDA CONSTITUCIONAL Nº 136|EC Nº 136/i],
        'BR-CTB-1997':[/CÓDIGO DE TRÂNSITO BRASILEIRO|LEI Nº 9\.503/i, /Art\.?\s*1º/i],
        'BR-CP-1940':[/CÓDIGO PENAL|DECRETO-LEI Nº 2\.848/i, /Art\.?\s*1º/i],
        'BR-CPP-1941':[/CÓDIGO DE PROCESSO PENAL|DECRETO-LEI Nº 3\.689|3\.689/i, /Art\.?\s*1º/i],
        'BR-LEP-1984':[/LEI DE EXECUÇÃO PENAL|LEI Nº 7\.210/i, /Art\.?\s*1º/i],
        'BR-ECA-1990':[/ESTATUTO DA CRIANÇA E DO ADOLESCENTE|LEI Nº 8\.069|8\.069/i, /Art\.?\s*1º/i],
        'BR-CC-2002':[/CÓDIGO CIVIL|LEI Nº 10\.406/i, /Art\.?\s*1º/i],
        'BR-CDC-1990':[/CÓDIGO DE DEFESA DO CONSUMIDOR|LEI Nº 8\.078|8\.078/i, /Art\.?\s*1º/i],
        'BR-LMP-2006':[/LEI MARIA DA PENHA|LEI Nº 11\.340|11\.340/i, /Art\.?\s*1º/i],
        'BR-ESTATUTO-IDOSO-2003':[/ESTATUTO DA PESSOA IDOSA|LEI Nº 10\.741/i, /Art\.?\s*1º/i],
        'INT-UDHR-1948-PT':[/DECLARAÇÃO UNIVERSAL DOS DIREITOS HUMANOS/i, /ARTIGO\s+1\b/i, /ARTIGO\s+30\b/i],
        'INT-MANDELA-2015-PT':[/REGRAS MÍNIMAS DAS NAÇÕES UNIDAS|REGRAS DE MANDELA/i, /REGRA\s+1\b/i, /REGRA\s+122\b/i]
      };
      if(!text||text.length<1200)throw new Error('Texto integral abaixo do mínimo de segurança.');
      const required=checks[documentId];
      if(!required)throw new Error('Documento sem regra de validação estrutural cadastrada.');
      for(const pattern of required)if(!pattern.test(text))throw new Error('Falhou a validação de título, artigo inicial ou marcador de completude para '+documentId+'.');
      return true;
    }
    async function readVerifiedFullText(versionId){
      let offset=0,fullText='',metadata=null;
      do{
        const result=await invokeEditorial({action:'preview',version_id:versionId,offset,limit:80000});
        if(result.integrity_verified!==true)throw new Error('Integridade SHA-256 não confirmada.');
        if(result.offset!==offset||typeof result.preview_text!=='string')throw new Error('Resposta de pré-visualização incompleta ou fora de sequência.');
        metadata=result;
        fullText+=result.preview_text;
        offset=result.next_offset;
      }while(offset!==null);
      if(!metadata||fullText.length!==metadata.total_chars)throw new Error('A leitura integral não atingiu o total de caracteres informado.');
      return {text:fullText,metadata};
    }
    async function validateAndPublishEligible(){
      const status=document.getElementById('vade-admin-batch-status');
      const button=document.getElementById('vade-admin-validate-publish');
      if(!adminClient)throw new Error('Sessão administrativa não validada.');
      const {data:rows,error}=await adminClient.from('legal_document_versions')
        .select('id,document_id,status,source_retrieved_at')
        .in('status',['candidate','approved'])
        .order('source_retrieved_at',{ascending:false}).limit(40);
      if(error)throw error;
      const latestByDocument=new Map();
      for(const row of rows||[])if(!latestByDocument.has(row.document_id))latestByDocument.set(row.document_id,row);
      const eligible=[...latestByDocument.values()];
      if(!eligible.length){if(status)status.textContent='Não há versões candidatas ou aprovadas para validar.';return;}
      if(!global.confirm('Validar a integridade e os marcadores legais das '+eligible.length+' versões mais recentes e publicar automaticamente apenas as que passarem? A ação será registrada no histórico editorial.'))return;
      button.disabled=true;
      const results=[];
      try{
        for(let i=0;i<eligible.length;i++){
          const row=eligible[i];
          if(status)status.textContent='Validando '+(i+1)+' de '+eligible.length+': '+row.document_id+'...';
          try{
            const verified=await readVerifiedFullText(row.id);
            validateLegalText(row.document_id,verified.text);
            const note='Validação automatizada concluída: fonte oficial permitida; pacote original e extração integral reproduzida; SHA-256 conferido; título e marcadores estruturais obrigatórios encontrados. Publicação autorizada pelo administrador.';
            if(row.status==='candidate'){
              await invokeEditorial({action:'approve',version_id:row.id,review_note:note});
            }
            const published=await invokeEditorial({action:'publish',version_id:row.id,review_note:note});
            results.push({document_id:row.document_id,ok:true,message:published.note||'Publicado'});
          }catch(error){
            results.push({document_id:row.document_id,ok:false,message:error?.message||String(error)});
          }
        }
      }finally{
        button.disabled=false;
      }
      await loadEditorialQueue();
      const done=results.filter(item=>item.ok).length;
      const failed=results.length-done;
      const summary='Validação concluída: '+done+' publicado(s), '+failed+' bloqueado(s). '+results.filter(item=>!item.ok).map(item=>item.document_id+': '+item.message).join(' | ');
      const target=document.getElementById('vade-admin-batch-status');
      if(target)target.textContent=summary;
      else adminPanel.insertAdjacentHTML('beforeend','<p id="vade-admin-batch-status">'+esc(summary)+'</p>');
    }
    function showEditorialError(error){
      const target=document.getElementById('vade-admin-preview')||adminPanel;
      if(target)target.innerHTML='<div class="vade-empty">Não foi possível concluir a revisão: '+esc(error?.message||String(error))+'</div>';
    }
    async function openEditorialPreview(versionId){
      const target=document.getElementById('vade-admin-preview');
      if(!target)return;
      target.innerHTML='<p>Verificando bytes originais, extração e SHA-256...</p>';
      let offset=0, nextOffset=0, totalChars=0, fullText='', metadata=null, currentStatus='candidate';
      const rowButton=adminPanel.querySelector('[data-vade-preview="'+CSS.escape(versionId)+'"]');
      const row=rowButton?.closest('article');
      currentStatus=row?.getAttribute('data-status')||'candidate';
      async function loadChunk(next){
        const result=await invokeEditorial({action:'preview',version_id:versionId,offset:next,limit:80000});
        if(result.integrity_verified!==true)throw new Error('A verificação de integridade não foi confirmada.');
        metadata=result;
        offset=result.offset;
        nextOffset=result.next_offset;
        totalChars=result.total_chars;
        fullText+=result.preview_text||'';
        renderPreview();
      }
      function renderPreview(){
        const complete=nextOffset===null;
        const noteValue=document.getElementById('vade-review-note')?.value||'';
        target.innerHTML='<div style="border-top:1px solid var(--border-color,#d9dee7);padding-top:12px">'+
          '<strong>Pré-visualização verificada · '+esc(titleByIdFor(versionId))+'</strong>'+
          '<p style="font-size:12px;color:var(--text-secondary,#667085);word-break:break-all">Fonte: '+esc(metadata.source_url)+'<br>SHA-256 do texto: '+esc(metadata.content_sha256)+'<br>SHA-256 da origem: '+esc(metadata.source_sha256)+'<br>Formato: '+esc(metadata.source_format)+' · '+totalChars.toLocaleString('pt-BR')+' caracteres</p>'+
          '<div style="max-height:360px;overflow:auto;border:1px solid var(--border-color,#d9dee7);border-radius:8px;padding:10px;white-space:pre-wrap;font:12px/1.55 ui-monospace,monospace">'+esc(fullText)+'</div>'+
          '<p style="font-size:12px;margin:8px 0">'+(complete?'Leitura integral carregada.':'Trecho carregado até '+fullText.length.toLocaleString('pt-BR')+' de '+totalChars.toLocaleString('pt-BR')+' caracteres.')+'</p>'+
          (complete?'':'<button type="button" class="btn btn-outline btn-sm" id="vade-preview-next">Carregar próximo trecho</button>')+
          '<label style="display:block;margin-top:12px;font-size:13px">Nota da revisão / justificativa<textarea id="vade-review-note" rows="3" style="display:block;width:100%;margin-top:6px;padding:10px;border:1px solid var(--border-color,#d9dee7);border-radius:8px;background:var(--surface,#fff);color:inherit" placeholder="Registre o que foi conferido: atualização, integridade, fonte e vigência...">'+esc(noteValue)+'</textarea></label>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'+
          (currentStatus==='approved'?'<button type="button" class="btn btn-primary btn-sm" id="vade-publish-version" '+(!complete?'disabled':'')+'>Publicar para os alunos</button>':'<button type="button" class="btn btn-primary btn-sm" id="vade-approve-version" '+(!complete?'disabled':'')+'>Aprovar revisão</button><button type="button" class="btn btn-ghost btn-sm" id="vade-reject-version" '+(!complete?'disabled':'')+'>Rejeitar candidata</button>')+
          '</div><p style="font-size:11px;color:var(--text-secondary,#667085);margin-top:8px">A publicação só acontece após aprovação explícita. A versão anterior, quando existir, será preservada no histórico.</p></div>';
        document.getElementById('vade-preview-next')?.addEventListener('click',()=>loadChunk(nextOffset).catch(showEditorialError));
        document.getElementById('vade-approve-version')?.addEventListener('click',()=>decide('approve').catch(showEditorialError));
        document.getElementById('vade-reject-version')?.addEventListener('click',()=>decide('reject').catch(showEditorialError));
        document.getElementById('vade-publish-version')?.addEventListener('click',()=>decide('publish').catch(showEditorialError));
      }
      function titleByIdFor(id){
        const row=adminPanel.querySelector('[data-vade-preview="'+CSS.escape(id)+'"]')?.closest('article');
        return row?.querySelector('strong')?.textContent||id;
      }
      async function decide(action){
        const note=document.getElementById('vade-review-note')?.value?.trim()||'';
        if(note.length<5)throw new Error('Escreva uma justificativa de pelo menos cinco caracteres.');
        if(action==='publish'&&!global.confirm('Confirmar publicação desta versão para os alunos?'))return;
        target.innerHTML='<p>Registrando decisão editorial com nova conferência de integridade...</p>';
        const result=await invokeEditorial({action,version_id:versionId,review_note:note});
        target.innerHTML='<div class="vade-empty">'+esc(result.note||'Decisão registrada.')+'</div>';
        await loadEditorialQueue();
        if(action==='approve'){
          const nextButton=adminPanel.querySelector('[data-vade-preview="'+CSS.escape(versionId)+'"]');
          nextButton?.click();
        }
      }
      await loadChunk(0);
    }
    async function initializeEditorialAccess(){
      try{
        const bridge=global.DOCTOR_PLATFORM_BRIDGE;
        if(!bridge?.getAuthenticatedClient)return;
        const client=await bridge.getAuthenticatedClient();
        const {data,error}=await client.rpc('is_admin');
        if(error||data!==true)return;
        adminClient=client;
        if(adminButton)adminButton.hidden=false;
      }catch(_){}
    }
    adminPanel?.addEventListener('click',event=>{
      if(event.target?.id==='vade-admin-validate-publish')validateAndPublishEligible().catch(showEditorialError);
    });
    adminButton?.addEventListener('click',()=>{
      if(!adminPanel)return;
      if(!adminPanel.hidden){adminPanel.hidden=true;return;}
      loadEditorialQueue().catch(showEditorialError);
    });
    initializeEditorialAccess();
    hydrateLocalDocuments().then(count=>{
      if(syncStatus&&count)syncStatus.textContent=count+' documento(s) oficial(is) disponível(is) offline. Verificando atualizações...';
      sync().catch(()=>{});
    });
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
