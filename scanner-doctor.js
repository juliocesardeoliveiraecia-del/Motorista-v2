/* Scanner Doctor — armazenamento local privado (IndexedDB), sem envio automático. */
(function(){
  'use strict';
  const DB='doctor-scanner-local', STORE='scans', DB_VERSION=1;
  let currentPreviewUrl=null;
  function openDB(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)){reject(new Error('Este navegador não oferece armazenamento local compatível.'));return;}
      const req=indexedDB.open(DB,DB_VERSION);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)){const os=db.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});os.createIndex('createdAt','createdAt');}};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Falha ao abrir o armazenamento.'));
    });
  }
  async function allScans(){
    const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result.sort((a,b)=>b.createdAt-a.createdAt));req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});
  }
  async function saveScan(record){
    const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).add(record);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error||new Error('Não foi possível salvar a imagem.'))};});
  }
  async function deleteScan(id){
    const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(Number(id));tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>reject(tx.error);});
  }
  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function dateLabel(ts){return new Date(ts).toLocaleString('pt-BR');}
  window.Views=window.Views||{};
  Views.scannerDoctor=function(){return `
    <section class="tool-page scanner-page">
      <button class="btn btn-outline btn-sm" id="scanner-back">← Voltar</button>
      <div class="tool-hero" style="margin-top:12px">
        <div class="radar-live" style="color:var(--blue-mid)">📷 SCANNER DOCTOR</div>
        <h2>Scanner Doctor</h2>
        <p>Fotografe folhas, documentos e anotações. As imagens ficam salvas neste dispositivo, sem envio automático para a internet.</p>
      </div>
      <div class="card" style="margin-bottom:14px">
        <label for="scanner-title" style="display:block;font-weight:800;margin-bottom:6px">Nome do documento</label>
        <input id="scanner-title" type="text" maxlength="100" placeholder="Ex.: Resumo de Direito Constitucional" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);margin-bottom:12px">
        <label for="scanner-file" class="btn btn-primary btn-block" style="display:block;text-align:center">📸 Abrir câmera ou escolher imagem</label>
        <input id="scanner-file" type="file" accept="image/*" capture="environment" hidden>
        <p class="muted" style="margin-top:10px;font-size:12px">No celular, o navegador poderá oferecer a câmera traseira. Para várias páginas, fotografe e salve cada página separadamente.</p>
        <div id="scanner-preview-wrap" hidden style="margin-top:14px">
          <img id="scanner-preview" alt="Pré-visualização do documento" style="width:100%;max-height:65vh;object-fit:contain;background:#101820;border-radius:12px">
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            <button class="btn btn-primary" id="scanner-save">Salvar documento</button>
            <button class="btn btn-outline" id="scanner-discard">Descartar</button>
          </div>
        </div>
        <p id="scanner-status" role="status" aria-live="polite" style="margin-top:10px"></p>
      </div>
      <div class="section-title">Meus documentos salvos</div>
      <div id="scanner-list"><div class="card muted">Carregando documentos…</div></div>
    </section>`;
  };
  Views.bind=Views.bind||{};
  Views.bind.scannerDoctor=function(){
    document.getElementById('scanner-back')?.addEventListener('click',()=>UI.render('home'));
    const file=document.getElementById('scanner-file'),title=document.getElementById('scanner-title'),wrap=document.getElementById('scanner-preview-wrap'),img=document.getElementById('scanner-preview'),status=document.getElementById('scanner-status'),list=document.getElementById('scanner-list');
    let pendingBlob=null,pendingName='';
    function say(msg){if(status)status.textContent=msg;}
    function release(){if(currentPreviewUrl){URL.revokeObjectURL(currentPreviewUrl);currentPreviewUrl=null;}pendingBlob=null;pendingName='';if(wrap)wrap.hidden=true;if(file)file.value='';}
    async function renderList(){
      try{
        const items=await allScans();
        if(!items.length){list.innerHTML='<div class="card muted">Nenhum documento salvo ainda. Sua primeira digitalização aparecerá aqui.</div>';return;}
        list.innerHTML=items.map(x=>'<article class="card" style="margin-bottom:10px"><div style="display:flex;gap:12px;align-items:flex-start"><img src="'+URL.createObjectURL(x.blob)+'" alt="" style="width:84px;height:108px;object-fit:cover;border-radius:8px;background:#ddd"><div style="min-width:0;flex:1"><strong>'+esc(x.name)+'</strong><p class="muted" style="font-size:11px;margin-top:5px">'+esc(dateLabel(x.createdAt))+' · '+Math.max(1,Math.round(x.blob.size/1024))+' KB</p><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-outline btn-sm" data-download="'+x.id+'">Baixar</button><button class="btn btn-danger btn-sm" data-delete="'+x.id+'">Excluir</button></div></div></div></article>').join('');
        list.querySelectorAll('[data-download]').forEach(b=>b.addEventListener('click',async()=>{const x=items.find(i=>i.id===Number(b.dataset.download));if(!x)return;const u=URL.createObjectURL(x.blob);const a=document.createElement('a');a.href=u;a.download=(x.name||'documento').replace(/[^a-z0-9-_ ]/gi,'').trim().replace(/\s+/g,'-')+'.'+(x.blob.type.includes('png')?'png':'jpg');a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}));
        list.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Excluir este documento salvo neste dispositivo?'))return;try{await deleteScan(b.dataset.delete);await renderList();say('Documento excluído deste dispositivo.');}catch(e){say('Não foi possível excluir: '+e.message);}}));
      }catch(e){list.innerHTML='<div class="card">Não foi possível abrir os documentos salvos. Verifique o armazenamento do navegador.</div>';say(e.message);}
    }
    file?.addEventListener('change',()=>{
      release();const f=file.files?.[0];if(!f)return;
      if(!f.type.startsWith('image/')){say('Escolha um arquivo de imagem.');return;}
      if(f.size>20*1024*1024){say('A imagem excede 20 MB. Tire uma foto com resolução menor ou comprima o arquivo.');file.value='';return;}
      pendingBlob=f;pendingName=title.value.trim()||f.name.replace(/\.[^.]+$/,'')||'Documento sem título';currentPreviewUrl=URL.createObjectURL(f);img.src=currentPreviewUrl;wrap.hidden=false;say('Confira a imagem antes de salvar.');
    });
    document.getElementById('scanner-save')?.addEventListener('click',async()=>{
      if(!pendingBlob){say('Primeiro tire uma foto ou escolha uma imagem.');return;}
      const button=document.getElementById('scanner-save');button.disabled=true;
      try{await saveScan({name:(title.value.trim()||pendingName||'Documento').slice(0,100),blob:pendingBlob,createdAt:Date.now(),mimeType:pendingBlob.type});release();title.value='';say('Documento salvo neste dispositivo. Ele não foi enviado para a nuvem.');await renderList();}
      catch(e){say('Falha ao salvar: '+e.message+' Verifique o espaço disponível no dispositivo.');}
      finally{button.disabled=false;}
    });
    document.getElementById('scanner-discard')?.addEventListener('click',()=>{release();say('Pré-visualização descartada.');});
    renderList();
  };
})();