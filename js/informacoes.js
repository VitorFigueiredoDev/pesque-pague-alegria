document.addEventListener("DOMContentLoaded", async () => {
  const config = window.SITE_CONFIG || {};
  // Os links de aluguel abrem o WhatsApp com a espécie de equipamento no texto.
  // O número acompanha a configuração pública editada no painel, sem expor segredos.
  let rentalWhatsApp = config.whatsapp || "https://wa.me/553497902740";
  function rentalContactUrl(rawUrl, equipment) {
    const message = `Olá! Gostaria de consultar a disponibilidade e o valor do aluguel de ${equipment} no Pesque e Pague Alegria.`;
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "https:") throw Error("Protocolo inválido");
      const phone = parsed.hostname === "wa.me" ? parsed.pathname.replace(/\D/g, "") :
        ["api.whatsapp.com", "www.whatsapp.com"].includes(parsed.hostname) ? (parsed.searchParams.get("phone") || "").replace(/\D/g, "") : "";
      if (/^\d{10,15}$/.test(phone)) return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    } catch { /* Usa o número oficial de reserva. */ }
    return `https://wa.me/553497902740?text=${encodeURIComponent(message)}`;
  }
  window.updateRentalWhatsappLinks = (newUrl) => {
    if (typeof newUrl === "string" && newUrl) rentalWhatsApp = newUrl;
    document.querySelectorAll(".rental-link[data-equipment]").forEach(link => {
      link.href = rentalContactUrl(rentalWhatsApp, link.dataset.equipment);
    });
  };
  window.updateRentalWhatsappLinks();
  const contact = document.getElementById("contact-actions");
  if (contact) {
    const actions = [];
    for (const [kind, url] of [["whatsapp", config.whatsapp], ["instagram", config.instagram], ["maps", config.maps]]) {
      if (!url || !/^https:\/\//i.test(url)) continue;
      const action = window.createContactAction?.(kind, url);
      if (action) actions.push(action);
    }
    if (actions.length) { contact.className = "contact-actions"; contact.replaceChildren(...actions); }
  }
  if (!window.db) return; // Mantém dados estáticos disponíveis sem rede.
  try {
    const { data, error } = await window.db.from("site_information")
      .select("section,title,content,display_order").eq("published", true).order("display_order", {ascending: true});
    if (error) throw error;
    if (!data?.length) return;
    const of = section => data.filter(row => row.section === section);
    const html = value => String(value ?? "").replace(/[&<>"']/g, s => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[s]);

    // A programação semanal agora é mantida em weekly_fishing_hours.
    // Os itens antigos de "horarios" e "noturna" permanecem no banco como histórico,
    // mas não substituem mais o destaque público administrado pelo novo editor.


    const valores = of("valores");
    const price = valores.find(item => /pesca esportiva/i.test(item.title)) || valores[0];
    if (price) {
      const match = price.content.match(/R\$\s*([\d.,]+)/i);
      const amount = match ? Number(match[1].replace(/\./g," ").replace(/ /g, "").replace(",", ".")) : NaN;
      const formatted = Number.isFinite(amount) ? amount.toLocaleString("pt-BR", {minimumFractionDigits:2,maximumFractionDigits:2}) : null;
      if (formatted) {
        const [inteiro, dec] = formatted.split(",");
        document.getElementById("valores-container").innerHTML = `<span>${html(price.title)}</span><div class="price-big">R$ <strong>${html(inteiro)}</strong><small>,${html(dec)}</small></div><p>por vara</p><div class="price-rule">${html(price.content)}</div>`;
      } else {
        document.getElementById("valores-container").innerHTML = `<span>${html(price.title)}</span><p style="color:#111;font-size:25px;font-weight:800">${html(price.content)}</p>`;
      }
    }

    const aluguel = of("equipamentos");
    if (aluguel.length) document.getElementById("equipamentos-container").innerHTML = aluguel.map((item, i) =>
      `<article class="rental-card"><span class="rental-icon" aria-hidden="true">${i%2 ? "◉" : "⌁"}</span><h3>${html(item.title)}</h3><p>${html(item.content)}</p><a class="rental-link" href="${rentalContactUrl(rentalWhatsApp,item.title)}" data-equipment="${html(item.title)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar disponibilidade de ${html(item.title)} no WhatsApp">Consulte disponibilidade ↗</a></article>`).join("");
    window.updateRentalWhatsappLinks();

    const rules = of("regras");
    if (rules.length) document.getElementById("regras-container").innerHTML = rules.map(item =>
      `<article><span class="rule-point" aria-hidden="true">×</span><div><h3>${html(item.title)}</h3><p>${html(item.content)}</p></div></article>`).join("");

  } catch (error) {
    console.warn("Conteúdo remoto indisponível; exibindo informações padrão.", error.message);
  }
});
