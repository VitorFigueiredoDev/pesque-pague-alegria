/* Patch 8.4 — Home: painel de edição do bloco "Pesca noturna" na aba Informações.
   Não altera a programação semanal: horários/chips continuam dinâmicos. */
document.addEventListener("DOMContentLoaded", () => {
  const form=document.getElementById("night-feature-form");
  if(!form)return;
  const db=window.db;
  const feedback=document.getElementById("night-feature-feedback");
  const submit=document.getElementById("night-feature-submit");
  const fields={
    home_night_title_first:"night-feature-title-first",
    home_night_title_second:"night-feature-title-second",
    home_night_description:"night-feature-description",
    home_night_image_caption:"night-feature-caption",
    home_night_badge:"night-feature-badge",
    home_night_button_text:"night-feature-button-text",
    home_night_button_url:"night-feature-button-url",
    home_night_image_url:"night-feature-image-url"
  };
  const keys=Object.keys(fields);
  const field=key=>document.getElementById(fields[key]);
  const fileInput=document.getElementById("night-feature-file");
  const img=document.getElementById("night-feature-preview-img");
  const preview=document.getElementById("night-feature-preview");
  let objectUrl=null;
  const say=(msg,isError=false)=>{feedback.textContent=msg;feedback.style.color=isError?"#ff9b8b":"#a8e0b5";};
  const https=url=>{try{return new URL(url).protocol==="https:";}catch{return false;}};
  function previewImage(url,isBlob=false){
    if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
    preview.hidden=!url;
    if(url)img.src=url;else img.removeAttribute("src");
    if(isBlob)objectUrl=url;
  }
  fileInput.addEventListener("change",()=>{
    const file=fileInput.files?.[0];
    if(file && ["image/jpeg","image/png","image/webp"].includes(file.type))previewImage(URL.createObjectURL(file),true);
    else if(https(field("home_night_image_url").value.trim()))previewImage(field("home_night_image_url").value.trim());
    else previewImage(null);
  });
  field("home_night_image_url").addEventListener("input",()=>{
    if(fileInput.files?.length)return;
    const url=field("home_night_image_url").value.trim();
    previewImage(https(url)?url:null);
  });
  async function load(){
    if(!db)return say("Conexão com o Supabase indisponível.",true);
    try{
      const {data,error}=await db.from("site_content_settings").select("key,value").in("key",keys);
      if(error)throw error;
      (data||[]).forEach(r=>{if(fields[r.key])field(r.key).value=r.value||"";});
      const url=field("home_night_image_url").value.trim();
      if(https(url))previewImage(url);
      say("Configurações do destaque carregadas.");
    }catch(error){say("Não foi possível carregar o destaque: "+error.message,true);}
  }
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!db)return say("Supabase indisponível.",true);
    const file=fileInput.files?.[0];
    const allowed={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"};
    if(file && (!allowed[file.type] || file.size>6*1024*1024))return say("Imagem inválida: use JPG, PNG ou WebP com até 6 MB.",true);
    const url=field("home_night_image_url").value.trim();
    if(url && !https(url))return say("A URL da fotografia precisa começar com HTTPS.",true);
    const link=field("home_night_button_url").value.trim();
    const safeInternal=/^(?:pages\/|index\.html|#)[a-zA-Z0-9_./#?=&%-]*$/;
    if(link && !https(link) && !(safeInternal.test(link)&&!link.includes("..")))return say("Link inválido. Use HTTPS ou pages/informacoes.html#noturna.",true);
    const text=field("home_night_button_text").value.trim();
    if(Boolean(text)!==Boolean(link))return say("Preencha texto e destino do botão juntos, ou deixe os dois vazios para manter o padrão.",true);
    submit.disabled=true;submit.textContent=file?"Enviando fotografia...":"Salvando destaque...";
    let uploadedPath=null;
    try{
      let imageUrl=url;
      if(file){
        uploadedPath=`destaques/noturna-${Date.now()}-${Math.random().toString(36).slice(2,11)}.${allowed[file.type]}`;
        const {error:uploadError}=await db.storage.from("galeria").upload(uploadedPath,file,{contentType:file.type,upsert:false});
        if(uploadError)throw uploadError;
        imageUrl=db.storage.from("galeria").getPublicUrl(uploadedPath).data.publicUrl;
      }
      const rows=keys.map(key=>({
        key,
        value:key==="home_night_image_url"?imageUrl:field(key).value.trim(),
        updated_at:new Date().toISOString()
      }));
      const {error}=await db.from("site_content_settings").upsert(rows,{onConflict:"key"});
      if(error)throw error;
      uploadedPath=null;
      field("home_night_image_url").value=imageUrl;
      fileInput.value="";
      if(https(imageUrl))previewImage(imageUrl);else previewImage(null);
      say("Destaque salvo! Atualize a página inicial para visualizar.");
    }catch(error){
      if(uploadedPath)await db.storage.from("galeria").remove([uploadedPath]);
      say("Erro ao salvar destaque: "+error.message,true);
    }finally{submit.disabled=false;submit.textContent="Salvar destaque da Home ↗";}
  });
  load();
});
