/* Etapas 4.4–4.7: textos públicos e canais oficiais editados no painel. */
(() => {
  const allowed = new Set([
    "home_features_description", "home_night_description", "home_gallery_description", "home_visit_description",
    "contact_whatsapp", "contact_instagram", "contact_maps"
  ]);
  const safeUrl = (raw, kind) => {
    if (!raw || typeof raw !== "string") return null;
    try {
      const url = new URL(raw.trim());
      if (url.protocol !== "https:") return null;
      if (kind === "contact_whatsapp" && !/^(wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)$/.test(url.hostname)) return null;
      return url.href;
    } catch {return null;}
  };
  const fallback = window.SITE_CONFIG || {};
  const contactData = () => ({
    contact_whatsapp: fallback.whatsapp || "",
    contact_instagram: fallback.instagram || "",
    contact_maps: fallback.maps || ""
  });
  function apply(settings) {
    document.querySelectorAll("[data-site-setting]").forEach(node => {
      const key = node.dataset.siteSetting;
      if (allowed.has(key) && typeof settings[key] === "string" && settings[key].trim()) node.textContent = settings[key].trim();
    });
    const links = [
      ["contact_whatsapp","WhatsApp ↗"], ["contact_instagram","Instagram ↗"], ["contact_maps","Localização ↗"]
    ];
    const contact = document.getElementById("contact-actions");
    if (contact) {
      const actions = links.map(([key,label]) => {
        const url = safeUrl(settings[key], key);
        if (!url) return null;
        const a = document.createElement("a");
        a.className = key === "contact_whatsapp" ? "btn btn-orange" : "btn btn-outline";
        a.textContent = label; a.href = url; a.target="_blank"; a.rel="noopener noreferrer";
        return a;
      }).filter(Boolean);
      if (actions.length) {contact.className="contact-actions";contact.replaceChildren(...actions);}
    }
    const whatsapp = safeUrl(settings.contact_whatsapp, "contact_whatsapp");
    const headerCta = document.querySelector(".site-header .header-cta");
    if (whatsapp && headerCta) { headerCta.href=whatsapp;headerCta.target="_blank";headerCta.rel="noopener noreferrer"; }
    const footerLinks = document.querySelector(".footer-links:last-of-type");
    if (footerLinks) {
      footerLinks.querySelectorAll("[data-dynamic-contact]").forEach(node => node.remove());
      links.forEach(([key,label]) => {
        const url=safeUrl(settings[key],key);
        if(!url) return;
        const a=document.createElement("a");a.dataset.dynamicContact="true";
        a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=label;
        footerLinks.append(a);
      });
    }
    const mapPanel = document.querySelector(".map-inner");
    const maps = safeUrl(settings.contact_maps, "contact_maps");
    if (maps && mapPanel) {
      const desc=mapPanel.querySelector("p");
      if(desc)desc.textContent="Veja nossa localização no mapa e organize seu trajeto antes de sair.";
      const link=mapPanel.querySelector("a");
      if(link){link.href=maps;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Abrir localização ↗";}
    }
  }
  async function run() {
    const settings=contactData();
    if (window.db) {
      try {
        const {data,error}=await window.db.from("site_content_settings").select("key,value");
        if(error) throw error;
        (data||[]).forEach(row=>{if(allowed.has(row.key))settings[row.key]=row.value;});
      } catch(error) {console.warn("Configurações não carregadas; mantendo valores padrão:",error.message);}
    }
    apply(settings);
  }
  if(document.readyState === "loading")document.addEventListener("DOMContentLoaded",run);
  else run();
})();
