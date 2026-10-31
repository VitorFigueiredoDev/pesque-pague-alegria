(() => {
  const root = document.body.dataset.root || ".";
  const href = (path) => `${root}/${path}`;
  const current = document.body.dataset.page || "home";
  const rawConfig = window.SITE_CONFIG || {};
  // Apenas URLs HTTPS de destinos esperados; nunca inserir valores não validados em HTML.
  const safeExternal = (value, kind) => {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "https:") return "";
      if (kind === "whatsapp" && !["wa.me", "api.whatsapp.com", "www.whatsapp.com"].includes(url.hostname)) return "";
      if (kind === "instagram" && !["instagram.com", "www.instagram.com"].includes(url.hostname)) return "";
      return url.href.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    } catch { return ""; }
  };
  const config = {
    whatsapp: safeExternal(rawConfig.whatsapp, "whatsapp"),
    instagram: safeExternal(rawConfig.instagram, "instagram"),
    maps: safeExternal(rawConfig.maps, "maps")
  };
  const links = [
    ["home", "Início", href("index.html")],
    ["galeria", "Galeria", href("pages/galeria.html")],
    ["informacoes", "Informações", href("pages/informacoes.html")],
    ["peixes", "Peixes", href("pages/peixes.html")]
  ];
  const mark = `<svg viewBox="0 0 48 48" width="29" height="29" fill="none" aria-hidden="true"><path d="M5 24c10-13 25-15 35 0-10 15-25 13-35 0Z" stroke="currentColor" stroke-width="3.3" stroke-linejoin="round"/><circle cx="30" cy="22" r="2.3" fill="currentColor"/><path d="m6 24-4-8v16l4-8ZM15 24c5 5 9 7 15 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const brand = `<a class="brand" href="${href("index.html")}" aria-label="Pesque e Pague Alegria — início"><span class="brand-mark">${mark}</span><span class="brand-name"><small>PESQUE E PAGUE</small><strong>ALEGRIA<span>.</span></strong></span></a>`;
  const nav = links.map(([id, label, url]) => `<a href="${url}" ${id===current?'class="active" aria-current="page"':''}>${label}</a>`).join("");
  const contactHref = config.whatsapp || `${href("pages/informacoes.html")}#contato`;
  const contactAttrs = config.whatsapp ? 'target="_blank" rel="noopener noreferrer"' : "";
  const header = document.querySelector("#site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `<div class="header-inner container">${brand}<nav class="nav-links" id="site-nav" aria-label="Navegação principal">${nav}</nav><a class="btn btn-orange header-cta" href="${contactHref}" ${contactAttrs}>Fale com a equipe <span aria-hidden="true">↗</span></a><button id="menu-toggle" class="menu-toggle" type="button" aria-label="Abrir navegação" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button></div>`;
    const btn = header.querySelector("#menu-toggle");
    const navEl = header.querySelector("#site-nav");
    const closeNav = () => { navEl.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); document.body.classList.remove("nav-open"); };
    btn.addEventListener("click", () => {
      const open = navEl.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });
    navEl.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeNav(); });
    document.addEventListener("click", event => { if(!header.contains(event.target)) closeNav(); });
  }
  const footer = document.querySelector("#site-footer");
  if (footer) {
    footer.className = "site-footer";
    const social = [config.instagram ? `<a href="${config.instagram}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>` : "", config.whatsapp ? `<a href="${config.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>` : ""].filter(Boolean).join("");
    footer.innerHTML = `<div class="container"><div class="footer-top"><div class="footer-about">${brand}<p>Um lugar para boas pescarias, bons encontros e histórias que merecem ser contadas.</p><span class="footer-slogan">MAIS QUE PESCA. É ALEGRIA.</span></div><div class="footer-links"><h3>Explore</h3>${links.map(([,label,url])=>`<a href="${url}">${label}</a>`).join("")}</div><div class="footer-links"><h3>Sua visita</h3><a href="${href("pages/informacoes.html")}#horarios">Horários</a><a href="${href("pages/informacoes.html")}#valores">Valores</a><a href="${href("pages/informacoes.html")}#regras">Regras</a><a href="${href("pages/informacoes.html")}#contato">Contato</a>${social}</div><div class="footer-accent" aria-hidden="true">A<span>.</span></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Pesque e Pague Alegria. Todos os direitos reservados.</span><span>Feito para viver boas histórias <span class="orange">✳</span></span></div></div>`;
  }
})();
