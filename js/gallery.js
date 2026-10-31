document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("gallery-grid");
  const count = document.getElementById("gallery-count");
  const dialog = document.getElementById("lightbox");
  if (!grid || !count || !dialog) return;
  const image = document.getElementById("lightbox-image");
  const title = document.getElementById("lightbox-title");
  const description = document.getElementById("lightbox-description");
  let photos = [];
  let visiblePhotos = [];
  const search = document.getElementById("gallery-search");
  const sort = document.getElementById("gallery-sort");
  const clear = document.getElementById("gallery-clear");
  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  let current = 0;
  let previousFocus = null;
  function empty(message, detail = "") {
    grid.replaceChildren();
    const card = document.createElement("div");
    card.className = "empty-state span-all";
    card.innerHTML = '<span class="empty-symbol" aria-hidden="true">◈</span>';
    const heading = document.createElement("h3");
    heading.textContent = message;
    const p = document.createElement("p");
    p.textContent = detail;
    card.append(heading, p); grid.append(card);
  }
  function update() {
    const p = visiblePhotos[current];
    if (!p) return;
    image.src = p.image_url;
    image.alt = p.title || "Foto do pesqueiro";
    title.textContent = p.title || "Pescaria";
    description.textContent = p.description || "";
    document.getElementById("lightbox-index").textContent = `${current + 1} / ${visiblePhotos.length}`;
  }
  function open(index) {
    current = index;
    previousFocus = document.activeElement;
    update();
    dialog.hidden = false;
    document.body.classList.add("modal-open");
    document.getElementById("lightbox-close").focus();
  }
  function close() {
    dialog.hidden = true;
    image.removeAttribute("src");
    document.body.classList.remove("modal-open");
    previousFocus?.focus();
  }
  function change(step) { if (visiblePhotos.length) { current = (current + step + visiblePhotos.length) % visiblePhotos.length; update(); } }
  document.getElementById("lightbox-close").addEventListener("click", close);
  document.getElementById("lightbox-prev").addEventListener("click", () => change(-1));
  document.getElementById("lightbox-next").addEventListener("click", () => change(1));
  dialog.addEventListener("click", e => { if (e.target === dialog) close(); });
  document.addEventListener("keydown", e => {
    if (dialog.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") change(1);
    if (e.key === "ArrowLeft") change(-1);
    if (e.key === "Tab") {
      const focusable = [...dialog.querySelectorAll("button")];
      const i = focusable.indexOf(document.activeElement);
      if (e.shiftKey && i === 0) { e.preventDefault(); focusable.at(-1).focus(); }
      else if (!e.shiftKey && i === focusable.length-1) { e.preventDefault(); focusable[0].focus(); }
    }
  });
  function render() {
    const term = normalize(search?.value?.trim());
    visiblePhotos = photos.filter(photo => normalize(`${photo.title || ""} ${photo.description || ""}`).includes(term));
    if (sort?.value === "az") visiblePhotos.sort((a,b) => String(a.title || "").localeCompare(String(b.title || ""), "pt-BR"));
    if (sort?.value === "oldest") visiblePhotos.reverse();
    if (clear) clear.hidden = !term;
    count.textContent = `${visiblePhotos.length} de ${photos.length} ${photos.length === 1 ? "foto" : "fotos"}`;
    grid.replaceChildren();
    if (!visiblePhotos.length) {
      empty(term ? "Nenhuma foto encontrada" : "As próximas histórias vêm aí.", term ? "Tente buscar por outra palavra." : "Em breve, novos registros por aqui.");
      return;
    }
    visiblePhotos.forEach((photo, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gallery-photo";
      card.setAttribute("aria-label", `Ampliar foto: ${photo.title || "Registro de pescaria"}`);
      const img = document.createElement("img");
      img.src = photo.image_url;
      img.alt = photo.title || "Registro de pescaria";
      img.loading = "lazy";
      img.decoding = "async";
      const overlay = document.createElement("span");
      overlay.className = "gallery-photo-caption";
      overlay.textContent = photo.title || "Registro";
      const icon = document.createElement("span");
      icon.className = "gallery-photo-zoom";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "↗";
      card.append(img, overlay, icon);
      card.addEventListener("click", () => open(index));
      grid.append(card);
    });
  }
  search?.addEventListener("input", render);
  sort?.addEventListener("change", render);
  clear?.addEventListener("click", () => { search.value = ""; render(); search.focus(); });
  async function load() {
    if (!window.db) { count.textContent = "Indisponível"; empty("Galeria temporariamente indisponível", "Verifique sua conexão e recarregue a página."); return; }
    try {
      const { data, error } = await window.db.from("gallery_images").select("id,title,description,image_url,created_at").eq("published", true).order("created_at", { ascending: false });
      if (error) throw error;
      photos = (data || []).filter(item => /^https:\/\//i.test(item.image_url));
      count.textContent = `${photos.length} ${photos.length === 1 ? "foto publicada" : "fotos publicadas"}`;
      if (!photos.length) { empty("As próximas histórias vêm aí.", "Em breve, novos registros das pescarias e dos melhores momentos por aqui."); return; }
      render();
    } catch (error) {
      console.error("Não foi possível carregar a galeria:", error);
      count.textContent = "Erro de conexão";
      empty("Não conseguimos carregar as fotos.", "Confira a internet e tente novamente.");
    }
  }
  load();
});
