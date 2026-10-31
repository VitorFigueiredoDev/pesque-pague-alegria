/* Patch 7 — programação semanal, editável por administrador autenticado. */
document.addEventListener("DOMContentLoaded", async () => {
  const root=document.getElementById("weekly-hours-form");
  if(!root)return;
  const db=window.db, grid=document.getElementById("weekly-hours-grid");
  const feedback=document.getElementById("weekly-hours-feedback");
  const submit=document.getElementById("weekly-hours-submit");
  const days=["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"];
  const defaults=days.map((_,day_of_week)=>({day_of_week,opening_time:day_of_week===0?null:"09:00",closing_time:day_of_week===0?null:[2,5].includes(day_of_week)?"22:00":"18:00",is_closed:day_of_week===0,night_fishing:[2,5].includes(day_of_week),night_note:day_of_week===2?"Jantar conforme divulgação.":""}));
  // O painel administrativo já valida a conta; RLS do Supabase é quem autoriza as gravações.
  function makeRow(item){
    const i=Number(item.day_of_week);
    const row=document.createElement("fieldset");row.className="weekly-day";row.dataset.day=i;
    const label=document.createElement("legend");label.textContent=days[i];row.append(label);
    row.innerHTML+=`<div class="weekly-day-controls"><label><span>Abre</span><input class="open-time" aria-label="Abertura ${days[i]}" type="time" required></label><label><span>Fecha</span><input class="close-time" aria-label="Fechamento ${days[i]}" type="time" required></label></div><div class="weekly-day-toggles"><label class="checkbox-line"><input class="is-closed" type="checkbox"> Fechado</label><label class="checkbox-line"><input class="is-night" type="checkbox"> ☾ Pesca noturna</label></div><label class="weekly-note-label">Informação adicional (opcional)<input class="night-note" maxlength="250" placeholder="Ex.: jantar incluso, consultar valores"></label>`;
    const open=row.querySelector(".open-time"), close=row.querySelector(".close-time");
    const closed=row.querySelector(".is-closed"),night=row.querySelector(".is-night");
    const note=row.querySelector(".night-note");
    const time=value=>String(value||"").slice(0,5);
    open.value=time(item.opening_time)||"09:00";close.value=time(item.closing_time)||"18:00";
    closed.checked=!!item.is_closed;night.checked=!!item.night_fishing;note.value=item.night_note||"";
    const sync=()=>{open.disabled=closed.checked;close.disabled=closed.checked;night.disabled=closed.checked;note.disabled=closed.checked||!night.checked;row.classList.toggle("is-night-row",!closed.checked&&night.checked);row.classList.toggle("is-closed-row",closed.checked);};
    closed.addEventListener("change",()=>{if(closed.checked)night.checked=false;sync();});
    night.addEventListener("change",()=>{if(night.checked && close.value==="18:00")close.value="22:00";else if(!night.checked && close.value==="22:00")close.value="18:00";sync();});
    sync();return row;
  }
  async function load(){
    if(!db){feedback.textContent="Supabase indisponível.";return;}
    try{
      const {data,error}=await db.from("weekly_fishing_hours").select("day_of_week,opening_time,closing_time,is_closed,night_fishing,night_note").order("day_of_week");
      if(error)throw error;
      const byDay=new Map((data||[]).map(item=>[item.day_of_week,item]));
      grid.replaceChildren(...defaults.map(item=>makeRow(byDay.get(item.day_of_week)||item)));
      feedback.textContent="Programação carregada. Quarta-feira e sábado aparecem como pesca noturna inicialmente; você pode desmarcar quando quiser.";
    }catch(error){grid.replaceChildren(...defaults.map(makeRow));feedback.textContent="Execute o arquivo SQL do patch 7 antes de salvar: "+error.message;}
  }
  root.addEventListener("submit",async event=>{
    event.preventDefault();if(!db)return;
    const rows=[...grid.querySelectorAll(".weekly-day")].map(el=>{
      const is_closed=el.querySelector(".is-closed").checked;
      return {day_of_week:Number(el.dataset.day),is_closed,opening_time:is_closed?null:el.querySelector(".open-time").value,closing_time:is_closed?null:el.querySelector(".close-time").value,night_fishing:!is_closed&&el.querySelector(".is-night").checked,night_note:el.querySelector(".night-note").value.trim(),updated_at:new Date().toISOString()};
    });
    if(rows.some(r=>!r.is_closed && (!r.opening_time||!r.closing_time||r.opening_time>=r.closing_time))){feedback.textContent="Corrija os horários: o fechamento deve ser depois da abertura.";return;}
    submit.disabled=true;submit.textContent="Salvando programação...";
    try{
      const {error}=await db.from("weekly_fishing_hours").upsert(rows,{onConflict:"day_of_week"});
      if(error)throw error;
      feedback.textContent="Programação salva! A Home e a página Informações exibem os novos dias e horários de pesca noturna.";
    }catch(error){feedback.textContent="Erro ao salvar: "+error.message;}
    finally{submit.disabled=false;submit.textContent="Salvar programação semanal ↗";}
  });
  await load();
});
