/* PATCH 8.2 — navegação com fade, respeitando acessibilidade e links externos. */
(() => {
  "use strict";
  const body = document.body;
  if (!body || !body.hasAttribute("data-page")) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let leaving = false;

  // Ao restaurar página do cache do navegador, retira o estado de saída.
  window.addEventListener("pageshow", () => {
    leaving = false;
    body.classList.remove("page-exiting");
  });

  document.addEventListener("click", event => {
    if (leaving || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        reducedMotion.matches) return;

    const anchor = event.target.closest?.("a[href]");
    if (!anchor || anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")) return;

    let destination;
    try { destination = new URL(anchor.href, document.baseURI); }
    catch { return; }

    const current = window.location;
    // Não intercepta WhatsApp, links externos, âncoras da mesma página nem arquivos.
    if (!/^https?:$/.test(destination.protocol) || destination.origin !== current.origin) return;
    if (destination.pathname === current.pathname && destination.search === current.search) return;
    if (!destination.pathname.endsWith(".html") && !destination.pathname.endsWith("/")) return;

    event.preventDefault();
    leaving = true;
    body.classList.add("page-exiting");
    // Usa assign para preservar o histórico do navegador e o botão Voltar.
    window.setTimeout(() => window.location.assign(destination.href), 190);
  });
})();
