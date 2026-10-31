document.addEventListener("DOMContentLoaded", () => {
  const defaults = ["Pirarara","Pintado","Jundiá","Cachapira","Pacu caranha","Tambacu","Patinga","Tambaqui","Dourado","Matrinxã","Piau açu","Trairão","Tilápia Saint Peter"];
  const standard = "Espécie citada no material do pesqueiro. Consulte a equipe para confirmar disponibilidade, modalidades e orientações específicas de pesca.";
  let species = defaults.map((title, i) => ({title, description:standard, display_order:i+1}));
  const grid = document.getElementById("fish-grid");
  const search = document.getElementById("fish-search");
  const counter = document.getElementById("fish-count");
  const sort = document.getElementById("fish-sort");
  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const dialog = document.getElementById("fish-dialog");
  const closeButton = document.getElementById("fish-dialog-close");
  const nameEl = document.getElementById("fish-dialog-title");
  const textEl = document.getElementById("fish-dialog-description");
  const imageContainer = document.getElementById("fish-dialog-image-container");
  const tips = {
    recommended_bait: document.getElementById("fish-dialog-bait"),
    recommended_hook: document.getElementById("fish-dialog-hook"),
    best_fishing_time: document.getElementById("fish-dialog-time"),
    best_weather: document.getElementById("fish-dialog-weather")
  };
  const prohibition = document.getElementById("fish-prohibition-text");
  if (!grid || !search || !dialog) return;
  let previousFocus = null;
  const fishArt = `<svg viewBox="0 0 260 140" aria-hidden="true"><path d="M49 74c-15-25-35-31-43-34 6 30 6 45 0 67 24-8 35-22 43-33Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M45 70C92 19 185 19 239 68c-45 56-143 56-194 2Z" fill="none" stroke="currentColor" stroke-width="5"/><path d="M108 37 133 10l21 26M112 108l20 18 18-20" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="206" cy="63" r="5" fill="currentColor"/><path d="M224 80c-7-1-14-4-20-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
  function openFish(fish) {
    previousFocus = document.activeElement;
    nameEl.textContent = fish.title;
    textEl.textContent = fish.description || standard;
    Object.entries(tips).forEach(([key, el]) => { if(el) el.textContent = fish[key]?.trim() || "Consulte a equipe"; });
    imageContainer.replaceChildren();
    if (fish.image_url && /^https:\/\//i.test(fish.image_url)) {
      const img = document.createElement("img");
      img.src = fish.image_url; img.className = "fish-dialog-image"; img.alt = `Foto de ${fish.title}`;
      imageContainer.append(img);
    }
    dialog.hidden = false; document.body.classList.add("modal-open"); closeButton.focus();
  }
  function closeFish() {
    dialog.hidden = true; document.body.classList.remove("modal-open");previousFocus?.focus();
  }
  function render() {
    const term = normalize(search.value.trim());
    const filtered = species.filter(f => normalize(`${f.title} ${f.description || ""}`).includes(term));
    if (sort?.value === "az") filtered.sort((a,b) => a.title.localeCompare(b.title,"pt-BR"));
    if (sort?.value === "za") filtered.sort((a,b) => b.title.localeCompare(a.title,"pt-BR"));
    counter.textContent = `${filtered.length} ${filtered.length === 1 ? 'ESPÉCIE' : 'ESPÉCIES'} NO CATÁLOGO`;
    grid.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("div"); empty.className = "empty-state span-all";
      empty.innerHTML = '<span class="empty-symbol">⌕</span><h3>Nenhuma espécie encontrada</h3><p>Tente outro nome na busca.</p>';
      grid.append(empty); return;
    }
    filtered.forEach((fish, index) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "fish-card";
      const cover = document.createElement("div"); cover.className = "fish-cover";
      if (fish.image_url && /^https:\/\//i.test(fish.image_url)) {
        const img = document.createElement("img"); img.src = fish.image_url; img.alt = ""; img.loading = "lazy"; img.decoding="async"; cover.append(img);
      } else cover.innerHTML = fishArt;
      const content = document.createElement("div");content.className = "fish-card-content";
      const h3 = document.createElement("h3");h3.textContent = fish.title;
      const p = document.createElement("p");p.textContent = "Conheça esta espécie ↗";
      const arrow = document.createElement("span");arrow.className = "fish-card-arrow";arrow.textContent = "↗";
      content.append(h3, p); button.append(cover, content, arrow);
      button.addEventListener("click", () => openFish(fish)); grid.append(button);
    });
  }
  closeButton.addEventListener("click", closeFish);
  dialog.addEventListener("click", ev => {if(ev.target === dialog) closeFish();});
  document.addEventListener("keydown", ev => {
    if(dialog.hidden) return;
    if(ev.key === "Escape") closeFish();
    if(ev.key === "Tab") {
      const focusable = [...dialog.querySelectorAll("button,a[href]")];
      const index = focusable.indexOf(document.activeElement);
      if(ev.shiftKey && index === 0){ev.preventDefault();focusable.at(-1).focus();}
      else if(!ev.shiftKey && index === focusable.length-1){ev.preventDefault();focusable[0].focus();}
    }
  });
  search.addEventListener("input", render);
  sort?.addEventListener("change", render);
  render();
  async function fetchSpecies(){
    if(!window.db) return;
    try {
      let {data,error} = await window.db.from("fish_species")
        .select("title,description,image_url,display_order,recommended_bait,recommended_hook,best_fishing_time,best_weather").eq("published",true).order("display_order",{ascending:true});
      // Permite usar os peixes antigos antes de executar a migração.
      if (error && /(?:column|recommended_bait|recommended_hook|PGRST204|42703)/i.test(error.message || "")) {
        ({data,error} = await window.db.from("fish_species")
          .select("title,description,image_url,display_order").eq("published",true).order("display_order",{ascending:true}));
      }
      if (error) {if (error.code !== "42P01" && error.code !== "PGRST205") console.warn("Catálogo remoto indisponível:",error.message);return;}
      if(data?.length){species = data;render();}
    } catch (error) {console.warn("Catálogo offline; exibindo espécies padrão.", error.message);}
  }
  fetchSpecies();
  async function loadProhibition(){
    if(!window.db || !prohibition)return;
    try{
      const {data,error}=await window.db.from("site_content_settings").select("value").eq("key","fish_prohibited_notice").maybeSingle();
      if(error) throw error;
      if(data && typeof data.value === "string") prohibition.textContent=data.value.trim() || "Consulte as proibições vigentes com a equipe do pesqueiro.";
    }catch(error){console.warn("Aviso de proibições indisponível:",error.message);}
  }
  loadProhibition();
});
