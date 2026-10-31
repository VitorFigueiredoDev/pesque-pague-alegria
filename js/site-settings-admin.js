/* Etapa 4.4–4.7 — configurações públicas do site, acesso validado pelo backend/RLS. */
document.addEventListener("DOMContentLoaded", () => {
 const form=document.getElementById("site-settings-form");
 if(!form)return;
 const db=window.db;
 const keys=["home_features_description","home_gallery_description","home_visit_description","contact_whatsapp","contact_instagram","contact_maps"];
 const feedback=document.getElementById("site-settings-feedback");
 const button=document.getElementById("site-settings-submit");
 const input=key=>document.getElementById(`setting-${key}`);
 const tell=(msg,error=false)=>{feedback.textContent=msg;feedback.style.color=error?"#ff9b8b":"#a8e0b5";};
 const checkUrl=(value,key)=>{
   if(!value.trim())return true;
   try {
    const url=new URL(value.trim());
    if(url.protocol!=="https:")return false;
    if(key==="contact_whatsapp" && !/^(wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)$/.test(url.hostname))return false;
    return true;
   }catch{return false;}
 };
 async function load(){
   if(!db)return tell("Supabase indisponível.",true);
   try {
    const {data,error}=await db.from("site_content_settings").select("key,value").in("key",keys);
    if(error)throw error;
    (data||[]).forEach(row=>{if(input(row.key))input(row.key).value=row.value||"";});
    tell("Configurações carregadas.");
   }catch(error){tell("Execute primeiro o SQL das etapas 4.4–4.7: "+error.message,true);}
 }
 form.addEventListener("submit",async event=>{
   event.preventDefault();
   if(!db)return tell("Supabase indisponível.",true);
   const invalid=keys.find(k=>k.startsWith("contact_")&&!checkUrl(input(k).value,k));
   if(invalid)return tell("Confira o link em: "+input(invalid).previousElementSibling?.textContent,true);
   button.disabled=true;button.textContent="Salvando...";
   const rows=keys.map(key=>({key,value:input(key).value.trim(),updated_at:new Date().toISOString()}));
   try {
    const {error}=await db.from("site_content_settings").upsert(rows,{onConflict:"key"});
    if(error)throw error;
    tell("Personalizações salvas! Atualize a Home para conferir.");
   }catch(error){tell("Erro ao salvar: "+error.message,true);}
   finally{button.disabled=false;button.textContent="Salvar personalizações ↗";}
 });
 // Não busca registros antes de o painel ser desbloqueado; verificação do próprio Supabase/RLS protege a tabela.
 load();
});
