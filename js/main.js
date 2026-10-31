document.addEventListener("DOMContentLoaded", () => {
  // ETAPA 4.3 — banners publicados do Supabase; slides padrão permanecem como reserva.
  const hero = document.querySelector(".hero");
  const dotsContainer = document.getElementById("slider-dots");
  const counter = document.getElementById("hero-counter");
  const next = document.getElementById("next-slide");
  const previous = document.getElementById("prev-slide");
  const liveStatus = document.getElementById("hero-live-status");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let timer = null;
  let slides = [];

  function validImage(value) {
    if (typeof value !== "string") return null;
    try {
      const url = new URL(value.trim());
      return url.protocol === "https:" ? url.href : null;
    } catch { return null; }
  }
  function safeButtonPath(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    const raw = value.trim();
    // Caminhos internos simples ou destinos HTTPS. Bloqueia protocolos perigosos.
    if (/^https:\/\//i.test(raw)) return raw;
    if (/^(?:\.\/?|\.\.\/|\/)?[a-zA-Z0-9_-][a-zA-Z0-9_./?#=&%-]*$/.test(raw) &&
        !raw.includes("..") && !raw.startsWith("//") && !raw.includes("\\")) return raw;
    if (/^#[a-zA-Z][\w-]*$/.test(raw)) return raw;
    return null;
  }
  function makeBanner(item) {
    const imgUrl = validImage(item.image_url);
    const mobileImgUrl = validImage(item.mobile_image_url);
    if (!imgUrl) return null;
    const title = String(item.title || "").trim();
    const subtitle = String(item.description || "").trim();
    const buttonText = String(item.button_text || "").trim();
    const destination = safeButtonPath(item.button_url);
    const hasButton = Boolean(buttonText && destination);
    const onlyArtwork = !title && !subtitle && !hasButton;

    const slide = document.createElement("div");
    slide.className = onlyArtwork ? "hero-slide hero-slide-dynamic hero-slide-image-only" : "hero-slide hero-slide-dynamic";
    slide.style.setProperty("--banner-desktop", `url(${JSON.stringify(imgUrl)})`);
    if (mobileImgUrl) slide.style.setProperty("--banner-mobile", `url(${JSON.stringify(mobileImgUrl)})`);
    // Sem título, a arte continua acessível por uma descrição neutra do slide.
    if (onlyArtwork) {
      slide.setAttribute("aria-label", "Arte promocional do Pesque e Pague Alegria");
      slide.dataset.hasMobileArt = String(Boolean(mobileImgUrl));
      // Em telas pequenas a arte define a altura do banner, em vez de ficar
      // centralizada dentro de um painel alto com faixas vazias.
      const picture = document.createElement("picture");
      picture.className = "banner-art";
      if (mobileImgUrl) {
        const source = document.createElement("source");
        source.media = "(max-width: 767px)";
        source.srcset = mobileImgUrl;
        picture.append(source);
      }
      const image = document.createElement("img");
      image.src = imgUrl;
      image.alt = "Arte promocional do Pesque e Pague Alegria";
      image.decoding = "async";
      image.addEventListener("load", () => {
        if (slide.classList.contains("active")) updateMobileArtRatio();
      });
      picture.append(image);
      slide.append(picture);
    }

    if (!onlyArtwork) {
      const content = document.createElement("div");
      content.className = "hero-content";
      const overline = document.createElement("span");
      overline.className = "hero-overline";
      overline.textContent = "PESQUE E PAGUE ALEGRIA • DESTAQUES";
      content.append(overline);
      if (title) {
        const heading = document.createElement("h1");
        heading.textContent = title;
        content.append(heading);
      }
      if (subtitle) {
        const description = document.createElement("p");
        description.textContent = subtitle;
        content.append(description);
      }
      if (hasButton) {
        const actions = document.createElement("div");
        actions.className = "hero-actions";
        const link = document.createElement("a");
        link.className = "btn btn-orange";
        link.href = destination;
        link.textContent = buttonText + " ↗";
        if (/^https:\/\//i.test(destination)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        actions.append(link);
        content.append(actions);
      }
      slide.append(content);
    }
    return slide;
  }
  function updateMobileArtRatio() {
    if (!hero || !slides.length) return;
    const slide = slides[current];
    if (!slide.classList.contains("hero-slide-image-only")) {
      hero.style.removeProperty("--active-banner-aspect");
      return;
    }
    const image = slide.querySelector(".banner-art img");
    const fallback = slide.dataset.hasMobileArt === "true" ? "9 / 16" : "16 / 9";
    hero.style.setProperty("--active-banner-aspect",
      image?.naturalWidth && image?.naturalHeight
        ? `${image.naturalWidth} / ${image.naturalHeight}`
        : fallback);
  }
  function showSlide(index, announce = false) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.querySelectorAll("a").forEach(a => a.tabIndex = active ? 0 : -1);
    });
    dotsContainer.querySelectorAll("button").forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
      dot.setAttribute("aria-current", String(i === current));
    });
    updateMobileArtRatio();
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    if (announce && liveStatus) liveStatus.textContent = `Destaque ${current + 1} de ${slides.length}`;
  }
  function restartSlider() {
    clearInterval(timer);
    if (slides.length > 1 && !document.hidden && !prefersReducedMotion.matches) {
      timer = setInterval(() => showSlide(current + 1), 7000);
    }
  }
  function initializeSlider() {
    if (!hero || !dotsContainer || !counter || !next || !previous) return;
    slides = [...hero.querySelectorAll(".hero-slide")];
    current = 0;
    dotsContainer.replaceChildren();
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Mostrar destaque ${index + 1}`);
      dot.addEventListener("click", () => { showSlide(index, true); restartSlider(); });
      dotsContainer.append(dot);
    });
    const multiple = slides.length > 1;
    next.hidden = previous.hidden = !multiple;
    dotsContainer.hidden = !multiple;
    showSlide(0);
    restartSlider();
  }
  async function loadHomeBanners() {
    if (!hero || !window.db) return;
    try {
      const query = select => window.db.from("home_banners")
        .select(select)
        .eq("published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      let { data, error } = await query("title,description,image_url,mobile_image_url,button_text,button_url,display_order");
      if (error && /mobile_image_url|column/i.test(error.message || "")) {
        ({ data, error } = await query("title,description,image_url,button_text,button_url,display_order"));
      }
      if (error) throw error;
      if (!data?.length) return;
      const newSlides = data.map(makeBanner).filter(Boolean);
      if (!newSlides.length) return;
      // Só troca os slides padrão depois que os banners válidos estiverem preparados.
      hero.querySelectorAll(".hero-slide").forEach(el => el.remove());
      const vertical = hero.querySelector(".hero-vertical");
      newSlides.forEach(el => hero.insertBefore(el, vertical));
      initializeSlider();
    } catch (error) {
      console.warn("Banners indisponíveis; exibindo slides padrão:", error);
    }
  }
  if (hero && dotsContainer && counter && next && previous) {
    initializeSlider();
    // Evita trocar slides enquanto a pessoa lê ou usa os controles.
    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", restartSlider);
    hero.addEventListener("focusin", () => clearInterval(timer));
    hero.addEventListener("focusout", event => {
      if (!hero.contains(event.relatedTarget)) restartSlider();
    });
    // Arrastar para os lados muda o banner; rolagem vertical continua nativa.
    let touchStart = null;
    hero.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1 || event.target.closest(".hero-control-bar, a, button")) return;
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      clearInterval(timer);
    }, {passive: true});
    hero.addEventListener("touchend", (event) => {
      if (!touchStart) return;
      const end = event.changedTouches[0];
      const deltaX = end.clientX - touchStart.x;
      const deltaY = end.clientY - touchStart.y;
      touchStart = null;
      if (slides.length > 1 && Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        showSlide(current + (deltaX < 0 ? 1 : -1), true);
      }
      restartSlider();
    }, {passive: true});
    hero.addEventListener("touchcancel", () => { touchStart = null; restartSlider(); }, {passive: true});
    window.addEventListener("resize", updateMobileArtRatio, {passive: true});
    next.addEventListener("click", () => { showSlide(current + 1, true); restartSlider(); });
    previous.addEventListener("click", () => { showSlide(current - 1, true); restartSlider(); });
    document.addEventListener("visibilitychange", restartSlider);
    prefersReducedMotion.addEventListener?.("change", restartSlider);
    loadHomeBanners();
  }

  const faqs = [...document.querySelectorAll(".faq-item")];
  faqs.forEach((item, index) => {
    const btn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!btn || !answer) return;
    const id = `faq-answer-${index}`;
    answer.id = id;
    btn.setAttribute("aria-controls", id);
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const isOpening = !item.classList.contains("open");
      faqs.forEach(other => {
        other.classList.remove("open");
        other.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        const icon = other.querySelector(".faq-icon");
        if (icon) icon.textContent = "+";
      });
      if (isOpening) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        const icon = item.querySelector(".faq-icon");
        if (icon) icon.textContent = "−";
      }
    });
  });

  async function previewGallery() {
    const grid = document.getElementById("home-gallery");
    if (!grid) return;
    if (!window.db) return;
    const { data, error } = await window.db.from("gallery_images").select("title,image_url").eq("published", true).order("created_at", { ascending: false }).limit(3);
    if (error) { console.warn("Prévia da galeria indisponível:", error.message); return; }
    if (!data?.length) return;
    grid.innerHTML = "";
    for (const photo of data) {
      if (!/^https:\/\//i.test(photo.image_url)) continue;
      const card = document.createElement("a");
      card.className = "preview-photo";
      card.href = "pages/galeria.html";
      const img = document.createElement("img");
      img.src = photo.image_url;
      img.alt = photo.title || "Registro de pescaria";
      img.loading = "lazy";
      const label = document.createElement("span");
      label.textContent = photo.title || "Pescaria";
      card.append(img, label);
      grid.append(card);
    }
  }
  previewGallery().catch(console.error);

  // PARCEIROS PUBLICADOS — administrados pelo painel e exibidos na ordem escolhida.
  async function loadHomePartners() {
    const grid = document.getElementById("home-partners");
    if (!grid) return;
    const status = (message) => {
      const p = document.createElement("p");
      p.className = "partners-status";
      p.setAttribute("role", "status");
      p.textContent = message;
      grid.replaceChildren(p);
      grid.setAttribute("aria-busy", "false");
    };
    if (!window.db) {
      status("Os parceiros estão temporariamente indisponíveis.");
      return;
    }
    try {
      const { data, error } = await window.db.from("site_partners")
        .select("name,logo_url,website_url,description,display_order")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      if (!data?.length) {
        status("Em breve, conheça as marcas parceiras do Alegria.");
        return;
      }
      grid.replaceChildren();
      for (const item of data) {
        const link = typeof item.website_url === "string" && /^https:\/\//i.test(item.website_url.trim()) ? item.website_url.trim() : null;
        const logo = typeof item.logo_url === "string" && /^https:\/\//i.test(item.logo_url.trim()) ? item.logo_url.trim() : null;
        const card = document.createElement(link ? "a" : "article");
        card.className = "partner-card";
        if (link) {
          card.href = link;
          card.target = "_blank";
          card.rel = "noopener noreferrer";
          card.setAttribute("aria-label", `Visitar ${item.name}`);
        }
        const visual = document.createElement("div");
        visual.className = "partner-card-visual";
        if (logo) {
          const img = document.createElement("img");
          img.src = logo;
          img.alt = `Logo de ${item.name}`;
          img.loading = "lazy";
          img.decoding = "async";
          img.referrerPolicy = "no-referrer";
          img.addEventListener("error", () => {
            visual.replaceChildren();
            const mark = document.createElement("span");
            mark.className = "partner-card-monogram";
            mark.textContent = (item.name || "P").slice(0, 1).toLocaleUpperCase("pt-BR");
            visual.append(mark);
          }, { once: true });
          visual.append(img);
        } else {
          const mark = document.createElement("span");
          mark.className = "partner-card-monogram";
          mark.textContent = (item.name || "P").slice(0, 1).toLocaleUpperCase("pt-BR");
          visual.append(mark);
        }
        const name = document.createElement("h3");
        name.textContent = item.name || "Parceiro";
        const description = document.createElement("p");
        description.textContent = item.description || "Parceiro do Pesque e Pague Alegria";
        const footer = document.createElement("span");
        footer.className = "partner-card-footer";
        footer.textContent = link ? "CONHEÇA A MARCA ↗" : "PARCEIRO ALEGRIA ✳";
        card.append(visual, name, description, footer);
        grid.append(card);
      }
      grid.setAttribute("aria-busy", "false");
    } catch (error) {
      console.warn("Não foi possível carregar os parceiros:", error);
      status("Não foi possível carregar os parceiros no momento.");
    }
  }
  loadHomePartners();

});
