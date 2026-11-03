/* Patch 9.1 — recuperação de imagens antigas no mesmo bucket público.
   Mantém objetos originais (rollback); atualiza apenas URLs em linhas autorizadas. */
document.addEventListener('DOMContentLoaded', () => {
  const button=document.getElementById('optimize-existing-images');
  const status=document.getElementById('optimize-existing-status');
  const db=window.db;
  if (!button || !status) return;
  const report=text=>{status.textContent=text;};
  const ownStorageUrl=url=>{
    try {
      const parsed=new URL(url);
      const expected=new URL(db.supabaseUrl);
      return parsed.protocol==='https:' && parsed.origin===expected.origin &&
        parsed.pathname.startsWith('/storage/v1/object/public/galeria/') &&
        /\.(?:png|jpe?g|webp)$/i.test(parsed.pathname);
    } catch {return false;}
  };
  async function list(){
    const [gallery,banners,settings]=await Promise.all([
      db.from('gallery_images').select('id,image_url,storage_path'),
      db.from('home_banners').select('id,image_url,mobile_image_url'),
      db.from('site_content_settings').select('key,value').in('key',['site_logo_url','home_night_image_url'])
    ]);
    for(const result of [gallery,banners,settings]) if(result.error)throw result.error;
    const tasks=[];
    for(const row of gallery.data||[])tasks.push({table:'gallery_images',id:row.id,col:'image_url',url:row.image_url,kind:'gallery'});
    for(const row of banners.data||[]){
      tasks.push({table:'home_banners',id:row.id,col:'image_url',url:row.image_url,kind:'banner'});
      if(row.mobile_image_url)tasks.push({table:'home_banners',id:row.id,col:'mobile_image_url',url:row.mobile_image_url,kind:'bannerMobile'});
    }
    for(const row of settings.data||[])if(row.value)tasks.push({table:'site_content_settings',id:row.key,col:'value',url:row.value,kind:row.key==='site_logo_url'?'logo':'night'});
    return tasks.filter(task=>ownStorageUrl(task.url));
  }
  async function optimizeOne(task){
    // Salva um objeto novo, sem sobrescrever (nem excluir) o original.
    const response=await fetch(task.url,{mode:'cors',cache:'no-store'});
    if(!response.ok)throw Error(`Imagem indisponível (HTTP ${response.status}).`);
    const blob=await response.blob();
    if(blob.size>20*1024*1024)throw Error('Imagem maior que 20 MB; ignorada.');
    const input=new File([blob],`imagem.${blob.type.split('/')[1]||'png'}`,{type:blob.type});
    const optimized=await window.AlegriaImages.optimize(input,task.kind);
    if(!optimized.changed)return {saved:0,changed:false};
    const prefix={gallery:'galeria',banner:'banners',bannerMobile:'banners',logo:'logos',night:'destaques'}[task.kind];
    const path=`${prefix}/otimizado-91-${Date.now()}-${Math.random().toString(36).slice(2,12)}.${window.AlegriaImages.ext(optimized.file)}`;
    const {error:uploadError}=await db.storage.from('galeria').upload(path,optimized.file,{contentType:optimized.file.type,cacheControl:"31536000",upsert:false});
    if(uploadError)throw uploadError;
    const newUrl=db.storage.from('galeria').getPublicUrl(path).data.publicUrl;
    // A condição de URL evita pisar em uma edição feita durante a execução.
    let update;
    if(task.table==='gallery_images'){
      update=db.from(task.table).update({image_url:newUrl,storage_path:path}).eq('id',task.id).eq('image_url',task.url).select('id');
    } else if(task.table==='home_banners'){
      update=db.from(task.table).update({[task.col]:newUrl}).eq('id',task.id).eq(task.col,task.url).select('id');
    } else {
      update=db.from(task.table).update({value:newUrl,updated_at:new Date().toISOString()}).eq('key',task.id).eq('value',task.url).select('key');
    }
    const {data,error}=await update;
    if(error || !data?.length){await db.storage.from('galeria').remove([path]);throw Error(error?.message||'O registro mudou durante a otimização; ignorado.');}
    return {saved:optimized.originalBytes-optimized.bytes,changed:true};
  }
  button.addEventListener('click',async()=>{
    if(!db)return report('Supabase indisponível.');
    let tasks;
    try{
      // Defesa adicional: somente administradores efetivos podem executar.
      const {data:{user},error:userError}=await db.auth.getUser();
      if(userError||!user)throw Error('Faça login novamente.');
      const {data:permission,error:permissionError}=await db.from('site_admins').select('user_id').eq('user_id',user.id).maybeSingle();
      if(permissionError||!permission)throw Error('Esta conta não tem permissão administrativa.');
      tasks=await list();
    }catch(e){return report('Não foi possível preparar a otimização: '+e.message);}
    if(!tasks.length)return report('Não há imagens elegíveis no Storage do pesqueiro. URLs externas são ignoradas.');
    if(!confirm(`Otimizar ${tasks.length} imagem(ns) armazenada(s) no Supabase? As originais serão mantidas. Isso pode consumir armazenamento extra até você limpar as antigas manualmente.`))return;
    button.disabled=true;
    let changed=0,skipped=0,failed=0,saved=0;
    const failures=[];
    for(let i=0;i<tasks.length;i++){
      report(`Otimizando ${i+1} de ${tasks.length} • ${changed} atualizada(s), ${failed} erro(s)...`);
      try {
        const result=await optimizeOne(tasks[i]);
        if(result.changed){changed++;saved+=result.saved;}else skipped++;
      }catch(e){failed++;if(failures.length<3)failures.push(e.message);console.warn('Falha ao otimizar imagem',tasks[i].url,e);}
    }
    report(`Concluído: ${changed} imagem(ns) otimizada(s), ${skipped} sem ganho suficiente, ${failed} falha(s). Economia estimada por carregamento: ${window.AlegriaImages.readable(saved)}.${failures.length?' Erros: '+failures.join('; '):''} Recarregue o site para conferir.`);
    button.disabled=false;
  });
});
