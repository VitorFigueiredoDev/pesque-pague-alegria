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
  // Ações oficiais padronizadas: ícones SVG leves, sem bibliotecas externas.
  const contactIcons = {
    whatsapp: `<svg class="contact-btn-icon" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 .9A15 15 0 0 0 3 23.5L.9 31l7.8-2A15.1 15.1 0 1 0 16 .9Zm0 27.1a12 12 0 0 1-6.1-1.7l-.4-.2-4.6 1.2 1.2-4.5-.3-.4A12 12 0 1 1 16 28Zm6.6-9.1c-.4-.2-2.2-1.1-2.5-1.2-.4-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1-.4-.2-1.5-.5-2.9-1.8-1.1-1-1.8-2.2-2-2.6-.2-.4 0-.6.2-.8l.6-.7.4-.6c.1-.2 0-.5-.1-.7l-1.1-2.6c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.7.1-1 .5s-1.3 1.2-1.3 3c0 1.7 1.3 3.3 1.5 3.6.2.2 2.5 3.8 6.2 5.2.9.4 1.6.6 2.1.7.9.3 1.8.2 2.4.1.7-.1 2.2-1 2.5-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5Z"/></svg>`,
    instagram: `<svg class="contact-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.3"/><circle cx="12" cy="12" r="4.1"/><circle cx="18" cy="6.3" r="1" fill="currentColor" stroke="none"/></svg>`,
    maps: `<svg class="contact-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/></svg>`
  };
  window.createContactAction = (kind, url) => {
    const label = {whatsapp:"WhatsApp",instagram:"Instagram",maps:"Localização"}[kind];
    if (!label || !url) return null;
    const anchor = document.createElement("a");
    anchor.className = `btn ${kind === "whatsapp" ? "btn-orange" : "btn-outline"} contact-btn`;
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.innerHTML = `${contactIcons[kind]}<span>${label}</span>`;
    anchor.setAttribute("aria-label", `${label} (abre outra aba)`);
    return anchor;
  };
  const links = [
    ["home", "Início", href("index.html")],
    ["galeria", "Galeria", href("pages/galeria.html")],
    ["informacoes", "Informações", href("pages/informacoes.html")],
    ["peixes", "Peixes", href("pages/peixes.html")]
  ];
  const mark = `<svg viewBox="0 0 48 48" width="29" height="29" fill="none" aria-hidden="true"><path d="M5 24c10-13 25-15 35 0-10 15-25 13-35 0Z" stroke="currentColor" stroke-width="3.3" stroke-linejoin="round"/><circle cx="30" cy="22" r="2.3" fill="currentColor"/><path d="m6 24-4-8v16l4-8ZM15 24c5 5 9 7 15 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const brand = `<a class="brand" href="${href("index.html")}" aria-label="Pesque e Pague Alegria — início"><span class="brand-mark">${mark}</span><img class="brand-logo-uploaded" alt="" hidden><span class="brand-name"><small>PESQUE E PAGUE</small><strong>ALEGRIA<span>.</span></strong></span></a>`;
  const navItem = ([id, label, url]) => `<a href="${url}" ${id===current?'class="active" aria-current="page"':''}>${label}</a>`;
  // Desktop: Início | Galeria — LOGO — Peixes | Informações.
  // Mobile: todos os links ficam em um único menu acessível.
  const leftNav = [links[0], links[1]].map(navItem).join("");
  const rightNav = [links[3], links[2]].map(navItem).join("");
  const mobileNav = [links[0], links[1], links[3], links[2]].map(navItem).join("");
  const header = document.querySelector("#site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `<div class="header-inner container"><nav class="nav-links nav-links--desktop nav-links--left" aria-label="Navegação principal, lado esquerdo">${leftNav}</nav>${brand}<nav class="nav-links nav-links--desktop nav-links--right" aria-label="Navegação principal, lado direito">${rightNav}</nav><button id="menu-toggle" class="menu-toggle" type="button" aria-label="Abrir navegação" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button><nav class="nav-links nav-links--mobile" id="site-nav" aria-label="Navegação principal no celular">${mobileNav}</nav></div>`;
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
  // Botão de WhatsApp compartilhado pelas páginas públicas.
  // O link pode ser atualizado após carregar a configuração do Supabase.
  const floating = document.createElement("a");
  floating.className = "whatsapp-float";
  floating.href = config.whatsapp || "https://wa.me/553497902740";
  floating.target = "_blank";
  floating.rel = "noopener noreferrer";
  floating.title = "Conversar com o Pesque e Pague Alegria no WhatsApp";
  floating.setAttribute("aria-label", "Conversar no WhatsApp (abre outra aba)");
  floating.innerHTML = `<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 .9A15 15 0 0 0 3 23.5L.9 31l7.8-2A15.1 15.1 0 1 0 16 .9Zm0 27.1a12 12 0 0 1-6.1-1.7l-.4-.2-4.6 1.2 1.2-4.5-.3-.4A12 12 0 1 1 16 28Zm6.6-9.1c-.4-.2-2.2-1.1-2.5-1.2-.4-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1-.4-.2-1.5-.5-2.9-1.8-1.1-1-1.8-2.2-2-2.6-.2-.4 0-.6.2-.8l.6-.7.4-.6c.1-.2 0-.5-.1-.7l-1.1-2.6c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.7.1-1 .5s-1.3 1.2-1.3 3c0 1.7 1.3 3.3 1.5 3.6.2.2 2.5 3.8 6.2 5.2.9.4 1.6.6 2.1.7.9.3 1.8.2 2.4.1.7-.1 2.2-1 2.5-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5Z"/></svg><span class="whatsapp-float-label">Fale com a gente</span>`;
  document.body.append(floating);
  window.setWhatsAppFloatingLink = url => {
    if (typeof url !== "string") return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" && ["wa.me", "api.whatsapp.com", "www.whatsapp.com"].includes(parsed.hostname)) {
        floating.href = parsed.href;
      }
    } catch { /* Mantém o telefone padrão. */ }
  };

  const footer = document.querySelector("#site-footer");
  if (footer) {
    footer.className = "site-footer";
    const social = [config.instagram ? `<a href="${config.instagram}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>` : "", config.whatsapp ? `<a href="${config.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>` : ""].filter(Boolean).join("");
    footer.innerHTML = `<div class="container"><div class="footer-top"><div class="footer-about">${brand}<p>Um lugar para boas pescarias, bons encontros e histórias que merecem ser contadas.</p><span class="footer-slogan">MAIS QUE PESCA. É ALEGRIA.</span></div><div class="footer-links"><h3>Explore</h3>${links.map(([,label,url])=>`<a href="${url}">${label}</a>`).join("")}</div><div class="footer-links"><h3>Sua visita</h3><a href="${href("pages/informacoes.html")}#horarios">Horários</a><a href="${href("pages/informacoes.html")}#valores">Valores</a><a href="${href("pages/informacoes.html")}#regras">Regras</a><a href="${href("pages/informacoes.html")}#contato">Contato</a>${social}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Pesque e Pague Alegria. Todos os direitos reservados.</span><span>Feito para viver boas histórias <span class="orange">✳</span></span></div></div>`;
  }
})();
