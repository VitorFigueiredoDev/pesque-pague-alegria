/* Editor de logo: usa tabela e bucket existentes, sem migração SQL. */
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('site-logo-form');
  if (!form) return;
  const db = window.db, key = 'site_logo_url';
  const fileInput = document.getElementById('site-logo-file');
  const preview = document.getElementById('site-logo-preview');
  const img = document.getElementById('site-logo-preview-img');
  const feedback = document.getElementById('site-logo-feedback');
  const save = document.getElementById('site-logo-save');
  const reset = document.getElementById('site-logo-reset');
  let previous = '';
  const say = (value, error=false) => { feedback.textContent = value; feedback.style.color = error ? '#ff9b8b' : '#a8e0b5'; };
  const show = url => { previous = url || ''; preview.hidden = !url; if(url) img.src = url; else img.removeAttribute('src'); window.applySiteLogo?.(url); };
  try {
    const {data,error} = await db.from('site_content_settings').select('value').eq('key',key).maybeSingle();
    if(error) throw error;
    show(data?.value || '');
  } catch(e) { say('Não foi possível carregar a logo: '+e.message,true); }
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (file.type !== 'image/png' || file.size > 2*1024*1024) return say('Use PNG de até 2 MB.',true);
    const url = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(url);
    img.src = url; preview.hidden = false;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const file = fileInput.files?.[0];
    if(!file || file.type !== 'image/png' || file.size > 2*1024*1024) return say('Selecione um PNG válido de até 2 MB.',true);
    save.disabled = true; save.textContent = 'Enviando...';
    const path = `logos/site-${Date.now()}-${Math.random().toString(36).slice(2,10)}.png`;
    try {
      const {error:uploadError} = await db.storage.from('galeria').upload(path,file,{contentType:'image/png',upsert:false});
      if(uploadError) throw uploadError;
      const url = db.storage.from('galeria').getPublicUrl(path).data.publicUrl;
      const {error:saveError} = await db.from('site_content_settings').upsert({key,value:url,updated_at:new Date().toISOString()},{onConflict:'key'});
      if(saveError) { await db.storage.from('galeria').remove([path]); throw saveError; }
      show(url); fileInput.value = ''; say('Logo publicada! Atualize as páginas do site para conferir.');
    } catch(e) {say('Erro ao publicar logo: '+e.message,true);}
    finally {save.disabled=false;save.textContent='Enviar e aplicar logo ↗';}
  });
  reset.addEventListener('click', async () => {
    if(!confirm('Restaurar o ícone original do site?'))return;
    reset.disabled=true;
    try {
      const {error}=await db.from('site_content_settings').upsert({key,value:'',updated_at:new Date().toISOString()},{onConflict:'key'});
      if(error) throw error;
      show('');fileInput.value='';say('Ícone original restaurado.');
    } catch(e) {say('Erro ao restaurar: '+e.message,true);}
    finally {reset.disabled=false;}
  });
});
