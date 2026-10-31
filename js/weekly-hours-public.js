/* Patch 7 — destaque público dos dias de pesca noturna (sem data fixa). */
document.addEventListener("DOMContentLoaded", async () => {
  if(!window.db)return;
  const days=["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"];
  const short=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  const readable=value=>String(value||"").slice(0,5).replace(":","h");
  const status=item=>item.is_closed?"Fechado":`${readable(item.opening_time)} às ${readable(item.closing_time)}`;
  const nightDays=arr=>arr.map(r=>days[r.day_of_week].replace("-feira","")).join(", ");
  try {
    const {data,error}=await window.db.from("weekly_fishing_hours").select("day_of_week,opening_time,closing_time,is_closed,night_fishing,night_note").order("day_of_week");
    if(error)throw error;
    if(!data || data.length!==7)return;
    const nights=data.filter(r=>r.night_fishing&&!r.is_closed);
    const hours=document.getElementById("horarios-container");
    if(hours){
      hours.replaceChildren();
      data.forEach(item=>{
        const row=document.createElement("div");row.className="hour-row"+(item.night_fishing&&!item.is_closed?" featured":"");
        const name=document.createElement("strong");name.textContent=days[item.day_of_week];
        const value=document.createElement("span");value.textContent=status(item);
        row.append(name,value);
        if(item.night_fishing&&!item.is_closed){const badge=document.createElement("small");badge.className="night-hour-badge";badge.textContent="☾ PESCA NOTURNA";row.append(badge);}
        hours.append(row);
      });
    }
    const nightDaysEl=document.getElementById("night-days");
    if(nightDaysEl)nightDaysEl.textContent=nights.length?nightDays(nights).toLocaleUpperCase("pt-BR"):"SEM PESCA NOTURNA AGENDADA";
    const nightList=document.getElementById("night-schedule-list");
    if(nightList){
      nightList.replaceChildren();
      nights.forEach(item=>{
        const row=document.createElement("div");row.className="night-schedule-item";
        const heading=document.createElement("strong");heading.textContent=days[item.day_of_week];
        const time=document.createElement("span");time.textContent=status(item);
        row.append(heading,time);
        if(item.night_note?.trim()){const note=document.createElement("small");note.textContent=item.night_note.trim();row.append(note);}
        nightList.append(row);
      });
      if(!nights.length){const message=document.createElement("p");message.textContent="Sem dias de pesca noturna confirmados. Consulte a equipe para novas datas.";nightList.append(message);}
    }
    const text=document.getElementById("noturna-container");
    if(text)text.textContent=nights.length?"Dias de horário estendido destacados acima. A programação, o jantar e os valores podem variar; confirme antes da visita.":"A programação de pesca noturna é atualizada pela equipe do pesqueiro.";
    const quick=document.getElementById("home-quick-night");
    if(quick)quick.textContent=nights.length?`${nightDays(nights)}: horário estendido`:"Consulte os horários da semana";
    const pill=document.getElementById("home-night-pill");
    if(pill)pill.textContent=nights.length?`☾ ${nightDays(nights).toLocaleUpperCase("pt-BR")} À NOITE`:"☾ PRÓXIMAS NOITES";
    const homeDetails=document.getElementById("home-night-chips");
    if(homeDetails){homeDetails.replaceChildren();nights.forEach(item=>{const chip=document.createElement("span");chip.textContent=`◷ ${short[item.day_of_week]} ${status(item)}`;homeDetails.append(chip);});if(!nights.length){const chip=document.createElement("span");chip.textContent="Programação a confirmar";homeDetails.append(chip);}}
    const faq=document.getElementById("home-faq-hours");
    if(faq)faq.textContent=data.map(r=>`${days[r.day_of_week]}: ${status(r)}${r.night_fishing&&!r.is_closed?" (pesca noturna)":""}`).join(". ")+". Consulte a programação antes de visitar.";
    // O último slide de reserva da Home só existe quando não há banners cadastrados.
    const fallbackSlide=document.getElementById("home-fallback-night-slide");
    if(fallbackSlide){const overline=fallbackSlide.querySelector(".hero-overline");const desc=fallbackSlide.querySelector(".hero-content p");if(overline)overline.textContent=nights.length?`${nightDays(nights).toLocaleUpperCase("pt-BR")} • PESCA NOTURNA`:"PESCA NOTURNA • PROGRAMAÇÃO";if(desc)desc.textContent=nights.length?`${nights.map(r=>`${days[r.day_of_week]} das ${readable(r.opening_time)} às ${readable(r.closing_time)}`).join(" • ")}. Consulte condições com a equipe.`:"Confira os próximos dias de pesca noturna com a equipe.";}
  }catch(error){console.warn("Programação semanal indisponível; mantendo horários de reserva:",error.message);}
});
