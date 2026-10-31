/* Logo global configurável, carregada do Supabase com fallback ao ícone original. */
(() => {
  const KEY = 'site_logo_url';
  function validLogo(value) {
    try { const u = new URL(value); return u.protocol === 'https:' && u.hostname.length > 0 ? u.href : ''; }
    catch { return ''; }
  }
  function apply(url) {
    document.querySelectorAll('.brand').forEach(brand => {
      const img = brand.querySelector('.brand-logo-uploaded');
      const mark = brand.querySelector('.brand-mark');
      if (!img || !mark) return;
      if (!url) { img.hidden = true; img.removeAttribute('src'); mark.hidden = false; brand.classList.remove('brand-has-logo'); return; }
      img.onerror = () => { img.hidden = true; mark.hidden = false; brand.classList.remove('brand-has-logo'); };
      img.onload = () => { img.hidden = false; mark.hidden = true; brand.classList.add('brand-has-logo'); };
      img.src = url;
    });
  }
  async function load() {
    if (!window.db) return;
    try {
      const {data,error} = await window.db.from('site_content_settings').select('value').eq('key',KEY).maybeSingle();
      if (error) throw error;
      apply(validLogo(data?.value));
    } catch(e) { console.warn('Logo personalizada indisponível:', e.message); }
  }
  window.applySiteLogo = apply;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
