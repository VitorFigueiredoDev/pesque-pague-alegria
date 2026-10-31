document.addEventListener("DOMContentLoaded", async () => {
  const config = window.SITE_CONFIG || {};
  const contact = document.getElementById("contact-actions");
  if (contact) {
    const actions = [];
    for (const [label, url] of [["WhatsApp ↗", config.whatsapp], ["Instagram ↗", config.instagram], ["Localização ↗", config.maps]]) {
      if (!url || !/^https:\/\//i.test(url)) continue;
      const a = document.createElement("a");
      a.className = actions.length ? "btn btn-outline" : "btn btn-orange";
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = label;
      actions.push(a);
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

    const horarios = of("horarios");
    if (horarios.length) document.getElementById("horarios-container").innerHTML = horarios.map(item =>
      `<div class="hour-row ${/quarta/i.test(item.title) ? 'featured' : ''}"><strong>${html(item.title)}</strong><span>${html(item.content)}</span></div>`).join("");

    const night = of("noturna");
    if (night.length) document.getElementById("noturna-container").textContent = night.map(item => item.content).join(" ");

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
      `<article class="rental-card"><span class="rental-icon" aria-hidden="true">${i%2 ? "◉" : "⌁"}</span><small>${String(i+1).padStart(2,"0")} / ALUGUEL</small><h3>${html(item.title)}</h3><p>${html(item.content)}</p><strong>Consulte disponibilidade ↗</strong></article>`).join("");

    const rules = of("regras");
    if (rules.length) document.getElementById("regras-container").innerHTML = rules.map(item =>
      `<article><span class="rule-point" aria-hidden="true">×</span><div><h3>${html(item.title)}</h3><p>${html(item.content)}</p></div></article>`).join("");

    const care = of("preservacao");
    if (care.length) document.getElementById("preservacao-container").innerHTML = care.map((item, i) =>
      `<div class="care-step"><strong>${String(i+1).padStart(2,"0")}</strong><div><h3>${html(item.title)}</h3><p>${html(item.content)}</p></div></div>`).join("");
  } catch (error) {
    console.warn("Conteúdo remoto indisponível; exibindo informações padrão.", error.message);
  }
});
