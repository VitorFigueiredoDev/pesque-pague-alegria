document.addEventListener("DOMContentLoaded", async () => {
  const db = window.db;
  const lock = document.getElementById("admin-lock");
  const lockMessage = document.getElementById("admin-lock-message");
  const dashboard = document.getElementById("dashboard");
  const status = document.getElementById("admin-status");
  const html = value => String(value ?? "").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]);
  const message = (text, good=false) => {status.hidden=false;status.textContent=text;status.classList.toggle("success",good);};
  const preview = (text, count=110) => (text || "").length>count ? text.slice(0,count)+"..." : (text || "");
  const sections = {horarios:"Horários",valores:"Valores",noturna:"Pesca noturna",equipamentos:"Aluguel",regras:"Regras",preservacao:"Preservação (legado: não exibida)"};
  const photosEl = document.getElementById("admin-gallery-list");
  const infosEl = document.getElementById("admin-info-list");
  const fishEl = document.getElementById("admin-fish-list");
  let photos=[], infos=[], fish=[], partners=[];
  const partnersEl = document.getElementById("admin-partner-list");

  if(!db) {lockMessage.textContent = "Conexão com Supabase indisponível. Recarregue quando estiver conectado."; document.querySelector(".loading-ring").hidden=true;return;}
  try {
    const {data:{user},error:userError} = await db.auth.getUser();
    if(userError || !user) {location.replace("login.html");return;}
    const {data:permission,error:permissionError} = await db.from("site_admins").select("user_id").eq("user_id",user.id).maybeSingle();
    if(permissionError) throw new Error("Não foi possível verificar sua permissão: "+permissionError.message);
    if(!permission) {lockMessage.textContent = "Acesso não autorizado. Esta conta não consta como administradora no banco.";document.querySelector(".loading-ring").hidden=true;return;}
    document.getElementById("admin-email").textContent = user.email || "Administrador";
    lock.hidden=true;dashboard.hidden=false;
  } catch(error) {lockMessage.textContent=error.message;document.querySelector(".loading-ring").hidden=true;return;}
  document.getElementById("logout").addEventListener("click", async () => {await db.auth.signOut();location.replace("login.html");});

  function renderOverview() {
    const groups = [
      ["photos",photos],["infos",infos],["fish",fish],["partners",partners]
    ];
    groups.forEach(([key,records]) => {
      const total=document.getElementById(`stat-${key}`);
      const published=document.getElementById(`stat-${key}-published`);
      if(total) total.textContent=String(records.length);
      if(published) published.textContent=`${records.filter(item=>item.published).length} publicados · ${records.filter(item=>!item.published).length} ocultos`;
    });
  }
  async function reloadOverview() {
    const refresh=document.getElementById("overview-refresh");
    if(refresh){refresh.disabled=true;refresh.textContent="Atualizando...";}
    const sources=[
      ["gallery_images","photos"],["site_information","infos"],
      ["fish_species","fish"],["site_partners","partners"]
    ];
    try {
      const result=await Promise.all(sources.map(async ([table,key])=>{
        const {data,error}=await db.from(table).select("published");
        if(error) throw new Error(`${table}: ${error.message}`);
        return [key,data||[]];
      }));
      result.forEach(([key,rows])=>{
        document.getElementById(`stat-${key}`).textContent=String(rows.length);
        document.getElementById(`stat-${key}-published`).textContent=`${rows.filter(r=>r.published).length} publicados · ${rows.filter(r=>!r.published).length} ocultos`;
      });
    } catch(error) {message("Falha ao atualizar os indicadores: "+error.message);}
    finally {if(refresh){refresh.disabled=false;refresh.textContent="Atualizar números ↻";}}
  }
  document.getElementById("overview-refresh")?.addEventListener("click",reloadOverview);
  document.querySelectorAll("[data-go-tab]").forEach(button=>button.addEventListener("click",()=>{
    document.querySelector(`.dashboard-tab[data-tab="${button.dataset.goTab}"]`)?.click();
    document.querySelector(".dashboard-main")?.scrollIntoView({behavior:"smooth",block:"start"});
  }));
  document.querySelectorAll(".dashboard-tab").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".dashboard-tab").forEach(tab => {tab.classList.toggle("active",tab===btn);tab.setAttribute("aria-selected",String(tab===btn));});
    document.querySelectorAll(".dashboard-panel").forEach(panel => {panel.hidden=panel.id !== `tab-${btn.dataset.tab}`;panel.classList.toggle("active",!panel.hidden);});
    status.hidden=true;
    if(btn.dataset.tab==="resumo") reloadOverview();
  }));

  async function loadPhotos(){
    const {data,error} = await db.from("gallery_images").select("id,title,description,image_url,storage_path,published,created_at").order("created_at",{ascending:false});
    if(error) throw error;
    photos = data || [];photosEl.replaceChildren();
    if(!photos.length){photosEl.innerHTML='<p class="admin-dim">Ainda não há fotos cadastradas.</p>';return;}
    photos.forEach(photo => {
      const div=document.createElement("article");div.className="admin-gallery-card";
      const titleText=(photo.title || "").trim();
      const descriptionText=(photo.description || "").trim();
      const infoText=descriptionText ? ` · ${html(preview(descriptionText,75))}` : "";
      div.innerHTML=`<img alt="Prévia da fotografia cadastrada" loading="lazy" src="${/^https:\/\//i.test(photo.image_url) ? html(photo.image_url) : ''}"><div class="admin-gallery-body"><h4>${titleText ? html(titleText) : '<span class="gallery-no-title">Foto sem título</span>'}</h4><p>${photo.published ? '● Publicada' : '○ Oculta'}${infoText}</p><div class="admin-row-actions"><button type="button" data-action="edit" aria-expanded="false">Editar texto</button><button type="button" data-action="toggle">${photo.published ? 'Ocultar' : 'Publicar'}</button><button type="button" class="danger-button" data-action="delete">Excluir</button></div></div>`;
      const editButton=div.querySelector('[data-action="edit"]');
      const body=div.querySelector('.admin-gallery-body');
      const form=document.createElement("form");
      form.className="admin-gallery-edit-form";
      form.hidden=true;
      const uniqueId=`gallery-edit-${String(photo.id).replace(/[^a-zA-Z0-9-]/g,"")}`;
      form.innerHTML=`<label for="${uniqueId}-title">Título (opcional)</label><input id="${uniqueId}-title" type="text" maxlength="120" placeholder="Sem título"><label for="${uniqueId}-description">Descrição (opcional)</label><textarea id="${uniqueId}-description" rows="3" maxlength="500" placeholder="Sem descrição"></textarea><small>Deixe ambos vazios para mostrar somente a imagem no site.</small><p class="gallery-edit-error" role="alert" hidden></p><div class="admin-row-actions"><button type="submit" class="gallery-save-button">Salvar alterações</button><button type="button" data-edit-cancel>Cancelar</button></div>`;
      const titleField=form.querySelector('input');
      const descField=form.querySelector('textarea');
      const errorEl=form.querySelector('.gallery-edit-error');
      titleField.value=photo.title || "";
      descField.value=photo.description || "";
      body.append(form);
      const setEditing=active=>{
        form.hidden=!active;
        editButton.setAttribute("aria-expanded",String(active));
        editButton.textContent=active?"Fechar edição":"Editar texto";
        if(active)titleField.focus();
      };
      editButton.addEventListener("click",()=>setEditing(form.hidden));
      form.querySelector('[data-edit-cancel]').addEventListener("click",()=>{
        titleField.value=photo.title || "";
        descField.value=photo.description || "";
        errorEl.hidden=true;
        setEditing(false);
        editButton.focus();
      });
      form.addEventListener("submit",async e=>{
        e.preventDefault();
        const saveButton=form.querySelector('.gallery-save-button');
        errorEl.hidden=true;
        saveButton.disabled=true;
        saveButton.textContent="Salvando...";
        try{
          const {error:updateError}=await db.from("gallery_images").update({
            title:titleField.value.trim(),
            description:descField.value.trim()
          }).eq("id",photo.id);
          if(updateError)throw updateError;
          await loadPhotos();
          message("Título e descrição da fotografia atualizados com sucesso.",true);
        }catch(err){
          errorEl.textContent="Não foi possível salvar: "+err.message;
          errorEl.hidden=false;
          saveButton.disabled=false;
          saveButton.textContent="Salvar alterações";
        }
      });
      div.querySelector('[data-action="toggle"]').addEventListener("click",async()=>{
        try {const {error}=await db.from("gallery_images").update({published:!photo.published}).eq("id",photo.id);if(error)throw error;await loadPhotos();message("Publicação atualizada.",true);}catch(e){message(e.message);}
      });
      div.querySelector('[data-action="delete"]').addEventListener("click",async()=>{
        if(!confirm(`Excluir definitivamente esta foto${titleText ? ` (“${titleText}”)` : ""}?`))return;
        try {
          const {error}=await db.from("gallery_images").delete().eq("id",photo.id);if(error)throw error;
          // Não remover objetos do Storage se a foto tiver sido cadastrada sem storage_path.
          let storageError=null;
          if(photo.storage_path){const result=await db.storage.from("galeria").remove([photo.storage_path]);storageError=result.error;}
          await loadPhotos();message(storageError ? "Registro excluído. Não foi possível limpar o arquivo do Storage: "+storageError.message : "Foto excluída.",!storageError);
        }catch(e){message(e.message);}
      });
      photosEl.append(div);
    });
  }
  document.getElementById("gallery-form").addEventListener("submit",async event=>{
    event.preventDefault();const btn=document.getElementById("gallery-submit");const file=document.getElementById("gallery-file").files[0];
    if(!file)return message("Selecione uma foto.");
    const allowed={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
    if(!allowed[file.type])return message("Formato não aceito. Use JPG, PNG ou WebP.");
    if(file.size>6*1024*1024)return message("A imagem deve ter no máximo 6 MB.");
    btn.disabled=true;btn.textContent="Enviando foto...";
    const path=`galeria/${Date.now()}-${Math.random().toString(36).slice(2,12)}.${allowed[file.type]}`;
    try{
      const {error:uploadError}=await db.storage.from("galeria").upload(path,file,{contentType:file.type,upsert:false});
      if(uploadError)throw uploadError;
      const {data:url}=db.storage.from("galeria").getPublicUrl(path);
      const {error:insertError}=await db.from("gallery_images").insert({title:document.getElementById("gallery-title").value.trim(),description:document.getElementById("gallery-description").value.trim(),image_url:url.publicUrl,storage_path:path,published:document.getElementById("gallery-published").checked});
      if(insertError){await db.storage.from("galeria").remove([path]);throw insertError;}
      event.target.reset();document.getElementById("gallery-published").checked=true;
      await loadPhotos();message("Foto enviada e cadastrada com sucesso.",true);
    }catch(e){message("Não foi possível publicar a foto: "+e.message);}finally{btn.disabled=false;btn.textContent="Enviar fotografia ↗";}
  });

  function resetInfo(){document.getElementById("info-form").reset();document.getElementById("info-id").value="";document.getElementById("info-submit").textContent="Salvar informação ↗";}
  document.getElementById("info-cancel").addEventListener("click",resetInfo);
  async function loadInfos(){
    const {data,error}=await db.from("site_information").select("*").order("section").order("display_order");if(error)throw error;infos=data||[];
    infosEl.replaceChildren();if(!infos.length){infosEl.innerHTML='<p class="admin-dim">Nenhuma informação cadastrada.</p>';return;}
    infos.forEach(item=>{
      // Os dados históricos de horários permanecem no Supabase, mas são substituídos pela programação semanal.
      if(item.section==="horarios" || item.section==="noturna")return;
      const div=document.createElement("article");div.className="admin-list-item";
      div.innerHTML=`<div><small>${html(sections[item.section]||item.section)} · ${item.published?'PUBLICADA':'OCULTA'} · ORDEM ${html(item.display_order)}</small><h4>${html(item.title)}</h4><p>${html(preview(item.content,240))}</p></div><div class="admin-row-actions"><button type="button" data-action="edit">Editar</button><button type="button" data-action="delete" class="danger-button">Excluir</button></div>`;
      div.querySelector('[data-action="edit"]').addEventListener("click",()=>{
        document.getElementById("info-id").value=item.id;
        document.getElementById("info-section").value=item.section;
        document.getElementById("info-title").value=item.title;
        document.getElementById("info-content").value=item.content;
        document.getElementById("info-order").value=item.display_order??0;
        document.getElementById("info-published").checked=item.published;
        document.getElementById("info-submit").textContent="Atualizar informação ↗";
        document.getElementById("info-form").scrollIntoView({behavior:"smooth",block:"start"});
      });
      div.querySelector('[data-action="delete"]').addEventListener("click",async()=>{
        if(!confirm(`Excluir a informação “${item.title}”?`))return;
        try{const {error}=await db.from("site_information").delete().eq("id",item.id);if(error)throw error;await loadInfos();resetInfo();message("Informação excluída.",true);}catch(e){message(e.message);}
      });
      infosEl.append(div);
    });
  }
  document.getElementById("info-form").addEventListener("submit",async event=>{
    event.preventDefault();const id=document.getElementById("info-id").value;
    const payload={section:document.getElementById("info-section").value,title:document.getElementById("info-title").value.trim(),content:document.getElementById("info-content").value.trim(),display_order:Number(document.getElementById("info-order").value)||0,published:document.getElementById("info-published").checked,updated_at:new Date().toISOString()};
    try {const result=id?await db.from("site_information").update(payload).eq("id",id):await db.from("site_information").insert(payload);if(result.error)throw result.error;resetInfo();await loadInfos();message("Informação salva com sucesso.",true);}catch(e){message(e.message);}
  });

  // Aviso público de proibições — texto editável, protegido pela RLS já existente.
  const prohibitionForm=document.getElementById("fish-prohibition-form");
  const prohibitionInput=document.getElementById("fish-prohibition-input");
  const prohibitionFeedback=document.getElementById("fish-prohibition-feedback");
  const defaultProhibition="Não são permitidos anzóis com fisga, linhas multifilamento, alicates metálicos de contenção, bebidas de fora ou caixas térmicas trazidas pelos visitantes.";
  async function loadProhibitionAdmin(){
    try{
      const {data,error}=await db.from("site_content_settings").select("value").eq("key","fish_prohibited_notice").maybeSingle();
      if(error)throw error;
      prohibitionInput.value=data?.value || defaultProhibition;
    }catch(error){prohibitionInput.value=defaultProhibition;prohibitionFeedback.textContent="Execute primeiro o SQL do patch 7: "+error.message;}
  }
  prohibitionForm.addEventListener("submit",async event=>{
    event.preventDefault();
    const value=prohibitionInput.value.trim();
    if(!value)return;
    const btn=document.getElementById("fish-prohibition-submit");btn.disabled=true;
    try{
      const {error}=await db.from("site_content_settings").upsert({key:"fish_prohibited_notice",value,updated_at:new Date().toISOString()},{onConflict:"key"});
      if(error)throw error;
      prohibitionFeedback.textContent="Aviso salvo e publicado na página de peixes.";
      message("Aviso de proibições atualizado.",true);
    }catch(error){prohibitionFeedback.textContent="Erro ao salvar: "+error.message;message("Erro ao salvar proibições: "+error.message);}
    finally{btn.disabled=false;}
  });
  await loadProhibitionAdmin();

  function resetFish(){document.getElementById("fish-form").reset();document.getElementById("fish-id").value="";}
  document.getElementById("fish-cancel").addEventListener("click",resetFish);
  async function loadFish(){
    const {data,error}=await db.from("fish_species").select("*").order("display_order",{ascending:true});if(error)throw error;fish=data||[];
    fishEl.replaceChildren();if(!fish.length){fishEl.innerHTML='<p class="admin-dim">Nenhuma espécie cadastrada. Cadastre uma acima.</p>';return;}
    fish.forEach(item=>{
      const div=document.createElement("article");div.className="admin-list-item";
      div.innerHTML=`<div><small>${item.published?'PUBLICADA':'OCULTA'} · ORDEM ${html(item.display_order)}</small><h4>${html(item.title)}</h4><p>${html(preview(item.description,240))}</p></div><div class="admin-row-actions"><button type="button" data-action="edit">Editar</button><button type="button" data-action="delete" class="danger-button">Excluir</button></div>`;
      div.querySelector('[data-action="edit"]').addEventListener("click",()=>{
        document.getElementById("fish-id").value=item.id;
        document.getElementById("fish-name").value=item.title;
        document.getElementById("fish-description").value=item.description||"";
        document.getElementById("fish-bait").value=item.recommended_bait||"";
        document.getElementById("fish-hook").value=item.recommended_hook||"";
        document.getElementById("fish-time").value=item.best_fishing_time||"";
        document.getElementById("fish-weather").value=item.best_weather||"";
        document.getElementById("fish-order").value=item.display_order||0;
        document.getElementById("fish-url").value=item.image_url||"";
        document.getElementById("fish-published").checked=item.published;
        document.getElementById("fish-form").scrollIntoView({behavior:"smooth",block:"start"});
      });
      div.querySelector('[data-action="delete"]').addEventListener("click",async()=>{
        if(!confirm(`Excluir “${item.title}” do catálogo?`))return;
        try{const {error}=await db.from("fish_species").delete().eq("id",item.id);if(error)throw error;await loadFish();resetFish();message("Espécie excluída.",true);}catch(e){message(e.message);}
      });
      fishEl.append(div);
    });
  }
  document.getElementById("fish-form").addEventListener("submit",async event=>{
    event.preventDefault();const id=document.getElementById("fish-id").value;
    const title=document.getElementById("fish-name").value.trim();
    const url=document.getElementById("fish-url").value.trim();
    if(url && !/^https:\/\//i.test(url))return message("A foto precisa ter uma URL HTTPS.");
    const slug=title.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    const payload={title,description:document.getElementById("fish-description").value.trim(),
      recommended_bait:document.getElementById("fish-bait").value.trim(),
      recommended_hook:document.getElementById("fish-hook").value.trim(),
      best_fishing_time:document.getElementById("fish-time").value.trim(),
      best_weather:document.getElementById("fish-weather").value.trim(),
      image_url:url||null,display_order:Number(document.getElementById("fish-order").value)||0,published:document.getElementById("fish-published").checked};
    if(!id)payload.slug=slug || `especie-${Date.now()}`;
    try{const result=id?await db.from("fish_species").update(payload).eq("id",id):await db.from("fish_species").insert(payload);if(result.error)throw result.error;resetFish();await loadFish();message("Espécie salva com sucesso.",true);}catch(e){message("Não foi possível salvar: "+e.message);}
  });

  // PARCEIROS / PATROCINADORES
  function resetPartner(){
    document.getElementById("partner-form").reset();
    document.getElementById("partner-id").value="";
    document.getElementById("partner-order").value="0";
    document.getElementById("partner-submit").textContent="Salvar parceiro ↗";
    document.getElementById("partner-logo-preview").hidden=true;
    document.getElementById("partner-preview-image").removeAttribute("src");
  }
  document.getElementById("partner-logo-file").addEventListener("change", event => {
    const file=event.target.files[0];
    const box=document.getElementById("partner-logo-preview");
    const img=document.getElementById("partner-preview-image");
    if(img.dataset.objectUrl) {URL.revokeObjectURL(img.dataset.objectUrl); delete img.dataset.objectUrl;}
    if(file && ["image/jpeg","image/png","image/webp"].includes(file.type)) {
      const url=URL.createObjectURL(file); img.src=url;img.dataset.objectUrl=url;box.hidden=false;
    } else {img.removeAttribute("src");box.hidden=true;}
  });
  document.getElementById("partner-cancel").addEventListener("click",resetPartner);
  function validHttps(url){
    if(!url)return true;
    try {return new URL(url).protocol === "https:";}catch{return false;}
  }
  async function loadPartners(){
    const {data,error}=await db.from("site_partners").select("id,name,logo_url,website_url,description,display_order,published").order("display_order",{ascending:true}).order("name",{ascending:true});
    if(error)throw error;
    partners=data||[];
    partnersEl.replaceChildren();
    if(!partners.length){partnersEl.innerHTML='<p class="admin-dim">Nenhum parceiro cadastrado ainda.</p>';return;}
    partners.forEach(item=>{
      const div=document.createElement("article");div.className="admin-list-item partner-list-item";
      const url=validHttps(item.logo_url)?item.logo_url:null;
      div.innerHTML=`<div class="partner-list-detail">${url ? `<img class="partner-list-logo" src="${html(url)}" alt="Logotipo de ${html(item.name)}" loading="lazy">` : '<span class="partner-logo-empty" aria-hidden="true">◇</span>'}<div><small>${item.published?'PUBLICADO':'OCULTO'} · ORDEM ${html(item.display_order)}</small><h4>${html(item.name)}</h4><p>${html(preview(item.description,130))}</p>${validHttps(item.website_url)&&item.website_url?`<a class="partner-web-link" target="_blank" rel="noopener noreferrer" href="${html(item.website_url)}">Visitar site ↗</a>`:''}</div></div><div class="admin-row-actions"><button type="button" data-action="edit">Editar</button><button type="button" data-action="toggle">${item.published?'Ocultar':'Publicar'}</button><button type="button" class="danger-button" data-action="delete">Excluir</button></div>`;
      div.querySelector('[data-action="edit"]').addEventListener("click",()=>{
        document.getElementById("partner-id").value=item.id;
        document.getElementById("partner-name").value=item.name;
        document.getElementById("partner-logo").value=item.logo_url||"";
        document.getElementById("partner-site").value=item.website_url||"";
        document.getElementById("partner-description").value=item.description||"";
        document.getElementById("partner-order").value=item.display_order??0;
        document.getElementById("partner-published").checked=item.published;
        document.getElementById("partner-logo-file").value="";
        const img=document.getElementById("partner-preview-image");
        if(img.dataset.objectUrl){URL.revokeObjectURL(img.dataset.objectUrl);delete img.dataset.objectUrl;}
        if(validHttps(item.logo_url) && item.logo_url) {img.src=item.logo_url;document.getElementById("partner-logo-preview").hidden=false;}
        else {img.removeAttribute("src");document.getElementById("partner-logo-preview").hidden=true;}
        document.getElementById("partner-submit").textContent="Atualizar parceiro ↗";
        document.getElementById("partner-form").scrollIntoView({behavior:"smooth",block:"start"});
      });
      div.querySelector('[data-action="toggle"]').addEventListener("click",async()=>{
        try {const {error}=await db.from("site_partners").update({published:!item.published}).eq("id",item.id);if(error)throw error;await loadPartners();message("Visibilidade do parceiro atualizada.",true);}catch(e){message(e.message);}
      });
      div.querySelector('[data-action="delete"]').addEventListener("click",async()=>{
        if(!confirm(`Excluir o parceiro “${item.name}”?`))return;
        try {const {error}=await db.from("site_partners").delete().eq("id",item.id);if(error)throw error;resetPartner();await loadPartners();message("Parceiro excluído.",true);}catch(e){message(e.message);}
      });
      partnersEl.append(div);
    });
  }
  document.getElementById("partner-form").addEventListener("submit",async event=>{
    event.preventDefault();
    const id=document.getElementById("partner-id").value;
    const name=document.getElementById("partner-name").value.trim();
    const typedLogo=document.getElementById("partner-logo").value.trim();
    const website_url=document.getElementById("partner-site").value.trim();
    const file=document.getElementById("partner-logo-file").files[0];
    const existing=partners.find(item=>item.id===id);
    if(!validHttps(typedLogo)||!validHttps(website_url))return message("Os links devem usar HTTPS.");
    if(!name)return message("Informe o nome do parceiro.");
    const allowed={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
    if(file && !allowed[file.type])return message("Formato de logotipo inválido. Use JPG, PNG ou WebP.");
    if(file && file.size>4*1024*1024)return message("O logotipo deve ter no máximo 4 MB.");
    const btn=document.getElementById("partner-submit");btn.disabled=true;btn.textContent=file?"Enviando logotipo...":"Salvando parceiro...";
    let uploadedPath=null;
    try {
      let logo_url=typedLogo || (existing?.logo_url ?? null);
      if(file) {
        uploadedPath=`parceiros/${Date.now()}-${Math.random().toString(36).slice(2,12)}.${allowed[file.type]}`;
        const {error:uploadError}=await db.storage.from("galeria").upload(uploadedPath,file,{contentType:file.type,upsert:false});
        if(uploadError)throw uploadError;
        const {data:publicData}=db.storage.from("galeria").getPublicUrl(uploadedPath);
        logo_url=publicData.publicUrl;
      }
      const payload={name,logo_url,website_url:website_url||null,description:document.getElementById("partner-description").value.trim(),display_order:Number(document.getElementById("partner-order").value)||0,published:document.getElementById("partner-published").checked};
      const result=id?await db.from("site_partners").update(payload).eq("id",id):await db.from("site_partners").insert(payload);
      if(result.error)throw result.error;
      uploadedPath=null;
      resetPartner();await loadPartners();message("Parceiro e logotipo salvos com sucesso.",true);
    }catch(e){
      if(uploadedPath)await db.storage.from("galeria").remove([uploadedPath]);
      message("Não foi possível salvar: "+e.message);
    }finally{btn.disabled=false;btn.textContent=id?"Atualizar parceiro ↗":"Salvar parceiro ↗";}
  });

  for(const [fn,label] of [[loadPhotos,"fotos"],[loadInfos,"informações"],[loadFish,"espécies"],[loadPartners,"parceiros"]]){
    try{await fn();}catch(error){console.warn(`Falha ao carregar ${label}`,error);message(`Não foi possível carregar ${label}: ${error.message}. Confira se o SQL de configuração foi executado.`);}
  }

  // BANNERS — gerenciamento. O slider público será integrado na etapa 4.3.
  const bannerList = document.getElementById("admin-banner-list");
  const bannerForm = document.getElementById("banner-form");
  let banners = [];
  const bannerFields = {
    id:document.getElementById("banner-id"),title:document.getElementById("banner-title"),
    description:document.getElementById("banner-description"),order:document.getElementById("banner-order"),
    file:document.getElementById("banner-file"),image:document.getElementById("banner-image-url"),
    mobileFile:document.getElementById("banner-mobile-file"),mobileImage:document.getElementById("banner-mobile-image-url"),
    buttonText:document.getElementById("banner-button-text"),buttonUrl:document.getElementById("banner-button-url"),
    published:document.getElementById("banner-published"),submit:document.getElementById("banner-submit")
  };
  const bannerPreview = document.getElementById("banner-preview-image");
  const bannerPreviewBox = document.getElementById("banner-preview-box");
  const bannerMobilePreview=document.getElementById("banner-mobile-preview-image");
  const bannerMobilePreviewBox=document.getElementById("banner-mobile-preview-box");
  function imageHttps(url) {try{return new URL(url).protocol === "https:";}catch{return false;}}
  function safeBannerLink(input) {
    if(!input)return true;
    if(input.startsWith("/") && !input.startsWith("//"))return true;
    if(/^(?:pages\/|index\.html(?:#|$)|#)[a-zA-Z0-9_./#?=&%-]*$/.test(input))return true;
    return imageHttps(input);
  }
  function clearBannerPreview(){
    if(bannerPreview.dataset.blob){URL.revokeObjectURL(bannerPreview.dataset.blob);delete bannerPreview.dataset.blob;}
    bannerPreview.removeAttribute("src");bannerPreviewBox.hidden=true;
  }
  function showBannerPreview(url,blob=false){clearBannerPreview();if(!url)return;bannerPreview.src=url;bannerPreviewBox.hidden=false;if(blob)bannerPreview.dataset.blob=url;}
  function clearMobileBannerPreview(){
    if(bannerMobilePreview.dataset.blob){URL.revokeObjectURL(bannerMobilePreview.dataset.blob);delete bannerMobilePreview.dataset.blob;}
    bannerMobilePreview.removeAttribute("src");bannerMobilePreviewBox.hidden=true;
  }
  function showMobileBannerPreview(url,blob=false){clearMobileBannerPreview();if(!url)return;bannerMobilePreview.src=url;bannerMobilePreviewBox.hidden=false;if(blob)bannerMobilePreview.dataset.blob=url;}
  function resetBanner(){bannerForm.reset();bannerFields.id.value="";bannerFields.order.value="0";bannerFields.published.checked=true;bannerFields.submit.textContent="Salvar banner ↗";clearBannerPreview();clearMobileBannerPreview();}
  document.getElementById("banner-cancel").addEventListener("click",resetBanner);
  bannerFields.file.addEventListener("change",()=>{
    const file=bannerFields.file.files[0];
    if(file && ["image/jpeg","image/png","image/webp"].includes(file.type))showBannerPreview(URL.createObjectURL(file),true);
    else if(imageHttps(bannerFields.image.value.trim()))showBannerPreview(bannerFields.image.value.trim());
    else clearBannerPreview();
  });
  bannerFields.image.addEventListener("input",()=>{
    if(bannerFields.file.files.length)return;
    const url=bannerFields.image.value.trim();
    if(imageHttps(url))showBannerPreview(url); else clearBannerPreview();
  });
  bannerFields.mobileFile.addEventListener("change",()=>{
    const file=bannerFields.mobileFile.files[0];
    if(file && ["image/jpeg","image/png","image/webp"].includes(file.type))showMobileBannerPreview(URL.createObjectURL(file),true);
    else if(imageHttps(bannerFields.mobileImage.value.trim()))showMobileBannerPreview(bannerFields.mobileImage.value.trim());
    else clearMobileBannerPreview();
  });
  bannerFields.mobileImage.addEventListener("input",()=>{
    if(bannerFields.mobileFile.files.length)return;
    const url=bannerFields.mobileImage.value.trim();
    if(imageHttps(url))showMobileBannerPreview(url);else clearMobileBannerPreview();
  });
  async function loadBanners(){
    const {data,error}=await db.from("home_banners").select("id,title,description,image_url,mobile_image_url,button_text,button_url,display_order,published").order("display_order",{ascending:true}).order("created_at",{ascending:true});
    if(error)throw error;
    banners=data||[];bannerList.replaceChildren();
    if(!banners.length){bannerList.innerHTML='<p class="admin-dim">Ainda não há banners cadastrados.</p>';return;}
    banners.forEach(item=>{
      const article=document.createElement("article");article.className="admin-list-item banner-admin-item";
      const url=imageHttps(item.image_url)?item.image_url:"";
      article.innerHTML=`<div class="banner-list-detail">${url?`<img src="${html(url)}" alt="" loading="lazy">`:""}<div><small>${item.published?"PUBLICADO":"OCULTO"} · ORDEM ${html(item.display_order)}</small><h4>${html(item.title?.trim() || "Arte sem título")}</h4><p>${html(preview(item.description,110))}</p><small>${item.mobile_image_url?"✓ Arte mobile cadastrada":"Sem arte mobile: usa imagem desktop"}</small></div></div><div class="admin-row-actions"><button type="button" data-action="edit">Editar</button><button type="button" data-action="toggle">${item.published?"Ocultar":"Publicar"}</button><button type="button" data-action="delete" class="danger-button">Excluir</button></div>`;
      article.querySelector('[data-action="edit"]').addEventListener("click",()=>{
        bannerFields.id.value=item.id;bannerFields.title.value=item.title||"";bannerFields.description.value=item.description||"";
        bannerFields.image.value=item.image_url||"";bannerFields.file.value="";
        bannerFields.mobileImage.value=item.mobile_image_url||"";bannerFields.mobileFile.value="";
        bannerFields.buttonText.value=item.button_text||"";bannerFields.buttonUrl.value=item.button_url||"";
        bannerFields.order.value=item.display_order??0;bannerFields.published.checked=item.published;
        bannerFields.submit.textContent="Atualizar banner ↗";showBannerPreview(url);
        showMobileBannerPreview(imageHttps(item.mobile_image_url)?item.mobile_image_url:"");
        bannerForm.scrollIntoView({behavior:"smooth",block:"start"});
      });
      article.querySelector('[data-action="toggle"]').addEventListener("click",async()=>{
        try{const {error}=await db.from("home_banners").update({published:!item.published}).eq("id",item.id);if(error)throw error;await loadBanners();message("Visibilidade do banner atualizada.",true);}catch(e){message(e.message);}
      });
      article.querySelector('[data-action="delete"]').addEventListener("click",async()=>{
        if(!confirm(`Excluir o banner “${item.title?.trim() || "Arte sem título"}”?`))return;
        try{const {error}=await db.from("home_banners").delete().eq("id",item.id);if(error)throw error;resetBanner();await loadBanners();message("Banner excluído do banco.",true);}catch(e){message(e.message);}
      });
      bannerList.append(article);
    });
  }
  bannerForm.addEventListener("submit",async event=>{
    event.preventDefault();
    const id=bannerFields.id.value;
    const title=bannerFields.title.value.trim();
    const file=bannerFields.file.files[0];
    const providedImage=bannerFields.image.value.trim();
    const mobileFile=bannerFields.mobileFile.files[0];
    const providedMobileImage=bannerFields.mobileImage.value.trim();
    const buttonUrl=bannerFields.buttonUrl.value.trim();
    if(providedImage && !imageHttps(providedImage))return message("A imagem deve ter uma URL HTTPS.");
    if(providedMobileImage && !imageHttps(providedMobileImage))return message("A imagem mobile deve ter uma URL HTTPS.");
    if(!safeBannerLink(buttonUrl))return message("Destino inválido. Use HTTPS ou um caminho interno do site.");
    const allowed={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
    if(file && !allowed[file.type])return message("Use uma imagem JPG, PNG ou WebP.");
    if(mobileFile && !allowed[mobileFile.type])return message("A arte mobile deve ser JPG, PNG ou WebP.");
    if(mobileFile && mobileFile.size>6*1024*1024)return message("A arte mobile não pode ultrapassar 6 MB.");
    if(file && file.size>6*1024*1024)return message("Imagem maior que 6 MB.");
    if(!file && !providedImage)return message("A imagem é obrigatória. Envie um arquivo ou informe uma URL HTTPS.");
    bannerFields.submit.disabled=true;bannerFields.submit.textContent=(file||mobileFile)?"Enviando imagens...":"Salvando banner...";
    let uploadPaths=[];
    try{
      let image_url=providedImage;
      let mobile_image_url=providedMobileImage||null;
      if(file){
        const uploadPath=`banners/${Date.now()}-${Math.random().toString(36).slice(2,12)}.${allowed[file.type]}`;
        const {error:uploadError}=await db.storage.from("galeria").upload(uploadPath,file,{contentType:file.type,upsert:false});
        if(uploadError)throw uploadError;
        uploadPaths.push(uploadPath);
        image_url=db.storage.from("galeria").getPublicUrl(uploadPath).data.publicUrl;
      }
      if(mobileFile){
        const mobilePath=`banners/mobile-${Date.now()}-${Math.random().toString(36).slice(2,12)}.${allowed[mobileFile.type]}`;
        const {error:uploadError}=await db.storage.from("galeria").upload(mobilePath,mobileFile,{contentType:mobileFile.type,upsert:false});
        if(uploadError)throw uploadError;
        uploadPaths.push(mobilePath);
        mobile_image_url=db.storage.from("galeria").getPublicUrl(mobilePath).data.publicUrl;
      }
      const payload={title,description:bannerFields.description.value.trim(),image_url,mobile_image_url,button_text:bannerFields.buttonText.value.trim()||null,button_url:buttonUrl||null,display_order:Number(bannerFields.order.value)||0,published:bannerFields.published.checked};
      const result=id?await db.from("home_banners").update(payload).eq("id",id):await db.from("home_banners").insert(payload);
      if(result.error)throw result.error;
      uploadPaths=[];resetBanner();await loadBanners();message("Banner salvo com sucesso.",true);
    }catch(e){
      if(uploadPaths.length)await db.storage.from("galeria").remove(uploadPaths);
      message("Erro ao salvar banner: "+e.message+(String(e.message).includes("mobile_image_url")?" — Execute a migração SQL do Patch 8.4 antes de salvar.":""));
    }
    finally{bannerFields.submit.disabled=false;bannerFields.submit.textContent=bannerFields.id.value?"Atualizar banner ↗":"Salvar banner ↗";}
  });
  try{await loadBanners();}catch(error){message("Falha ao carregar banners: "+error.message);}

  renderOverview();

});
