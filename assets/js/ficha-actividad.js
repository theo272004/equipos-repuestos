// ============================================================================
//  ACTIVIDAD DEL EQUIPO EN SU FICHA
// ============================================================================
//  La ficha técnica decía cómo es la máquina; ahora también dice qué le está
//  pasando: novedades y fallas del registro, pendientes abiertos, tareas y lo
//  que se ha gastado en ella. Cada cifra lleva a su sección ya filtrada.
//  El equipo del registro se encuentra por el campo "fi" del catálogo (el id
//  de la ficha) o por el nombre.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);

  // Nombres con que el registro diario llama a este equipo
  function nombresEnRegistro(m) {
    const cat = (window.MTTO && window.MTTO.catalogo.equipos) || [];
    const porFicha = cat.filter((e) => e.fi === m.id);
    if (porFicha.length) return porFicha;
    const n = N.plano(m.model || m.name);
    return cat.filter((e) => N.plano(e.eq) === n);
  }

  function pintar(id) {
    const caja = document.getElementById("fichaActividad");
    if (!caja) return;
    const m = typeof machines !== "undefined" ? machines.find((x) => x.id === id) : null;
    if (!m) { caja.innerHTML = ""; return; }
    const eqs = nombresEnRegistro(m);
    const nombres = new Set(eqs.map((e) => e.eq));
    const hoy = N.hoy();
    const desde = N.sumaDias(hoy, -30);
    const regs = window.MTTO_STORE ? window.MTTO_STORE.registros().filter((r) => nombres.has(r.eq) && !r.borrado) : [];
    const ult30 = regs.filter((r) => r.f >= desde);
    const fallas = ult30.filter((r) => r.tp === "Correctivo" && r.cat === "Máquina");
    const pend = window.PENDIENTES ? window.PENDIENTES.abiertos().filter((p) => p.fichaId === m.id || nombres.has(p.eqTxt || p.eq)) : [];
    const tareas = typeof tasks !== "undefined" ? tasks.filter((t) => t.machine === m.id && t.status !== "hecha") : [];
    let gasto = 0;
    if (window.PRESUPUESTO) {
      const nom = new Set([...nombres, m.model, m.name].filter(Boolean).map(N.plano));
      window.PRESUPUESTO.movimientos(Number(hoy.slice(0, 4))).forEach((x) => { if (nom.has(N.plano(x.equipo)) && Number.isFinite(x.valor)) gasto += x.valor; });
    }
    // El trabajo de mantenimiento abierto de este equipo (Mantenimiento → Seguimiento)
    const ePlan = typeof equipoDeMachine === "function" ? equipoDeMachine(m) : null;
    const cod = (ePlan && ePlan.c) || m.equipoCod || "";
    const trabajos = cod && window.SEGUIMIENTO ? window.SEGUIMIENTO.trabajos().filter((t) => t.i.eq === cod && t.etapa !== "hecho") : [];
    const ETAPA = { repuesto: "Esperando repuesto", listo: "Listo para intervenir", programado: "Programado" };
    if (!eqs.length && !pend.length && !tareas.length && !cod) { caja.innerHTML = ""; return; }
    const ultimas = regs.slice().sort((a, b) => (b.f + (b.hr || "")).localeCompare(a.f + (a.hr || ""))).slice(0, 4);
    const eqNombre = eqs[0] ? eqs[0].eq : m.model || m.name;
    const titulo = window.REGLAS_PEND ? (r) => window.REGLAS_PEND.tituloDe(r.de, r.eq) : (r) => r.de;
    caja.innerHTML = `<section class="ux-card fa-card">
      <div class="ux-card__head ux-card__head--tight"><div><h3 class="ux-card__title">${ic("reloj")}En planta <small>${eqs.length ? esc(eqs.map((e) => `${e.eq} · ${e.s}`).join(" · ")) : "sin registro diario"}</small></h3></div>
        <div class="ux-card__acts">
          <button class="ux-btn ux-btn--sm" type="button" data-fa="novedad">${ic("mas")}Anotar novedad</button>
          <button class="ux-btn ux-btn--sm" type="button" data-fa="pedir">${ic("almacen")}Pedir repuesto</button>
          ${cod ? `<button class="ux-btn ux-btn--sm" type="button" data-fa="inspeccionar" data-v="${esc(cod)}">${ic("insp")}Inspeccionar</button>` : ""}
        </div></div>
      <div class="fa-kpis">
        <button type="button" data-fa="indicadores"><b>${ult30.length}</b><span>novedades en 30 días</span></button>
        <button type="button" data-fa="indicadores"><b class="${fallas.length >= 5 ? "is-bad" : ""}">${fallas.length}</b><span>fallas de máquina</span></button>
        <button type="button" data-fa="pendientes"><b class="${pend.length ? "is-warn" : ""}">${pend.length}</b><span>pendientes abiertos</span></button>
        <button type="button" data-fa="tareas"><b>${tareas.length}</b><span>tareas sin cerrar</span></button>
        <button type="button" data-fa="presupuesto"><b>${esc(N.fmt.dineroCorto(gasto))}</b><span>gastado este año</span></button>
      </div>
      ${trabajos.map((t) => `<button type="button" class="fa-trabajo" data-fa="seguimiento" data-id="${esc(t.i.id)}">
          <span class="sg-etapa is-${t.etapa}">${ETAPA[t.etapa]}</span>
          <span><b>Trabajo de la inspección del ${esc(N.fmt.corta(t.i.fecha))}</b><small>${t.hs.length - t.pend.length} de ${t.hs.length} hechos${t.i.programado ? ` · mantenimiento el ${esc(N.fmt.corta(t.i.programado))}` : ""}</small></span>
          <span class="fa-trabajo__ir">Ver el trabajo ${ic("der", "ic--sm")}</span>
        </button>`).join("")}
      ${ultimas.length ? `<ul class="fa-ult">${ultimas.map((r) => `<li><button type="button" data-fa="reg" data-id="${esc(r.id)}"><span class="ux-mute ux-small">${esc(N.fmt.corta(r.f))}</span><span>${esc(titulo(r))}</span>${r.ef === "Pendiente" || r.frep ? `<span class="ux-pill ux-pill--warn"><i></i>pendiente</span>` : ""}</button></li>`).join("")}</ul>` : ""}
    </section>`;
    caja.dataset.eq = eqNombre;
    caja.dataset.sede = eqs[0] ? eqs[0].s : "";
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fa]");
    if (!b) return;
    const caja = document.getElementById("fichaActividad");
    const eq = caja.dataset.eq;
    const a = b.dataset.fa;
    if (a === "indicadores") window.goIndicadores?.({ eq });
    else if (a === "pendientes") { window.goPendientes?.(); setTimeout(() => { const q = document.querySelector("[data-pd-q]"); if (q) { q.value = eq; q.dispatchEvent(new Event("input", { bubbles: true })); } }, 60); }
    else if (a === "tareas") window.goTasks?.();
    else if (a === "presupuesto") window.goPresupuesto?.();
    else if (a === "novedad") window.goRegistro?.({ nueva: true, eq, s: caja.dataset.sede || undefined });
    else if (a === "pedir") window.goAlmacen?.({ q: eq, destino: eq });
    else if (a === "reg") window.goRegistro?.({ abrir: b.dataset.id });
    // El trabajo completo está en la pestaña Mantenimiento de esta misma ficha
    else if (a === "seguimiento") {
      document.querySelector('[data-profile-tab="maintenance"]')?.click();
      setTimeout(() => document.querySelector(`#detailView [id="${CSS.escape("sg-" + b.dataset.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return;
    }
    else if (a === "inspeccionar") { window.inspAbrirForm?.(b.dataset.v); return; }
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  // Cada vez que se abre una ficha se pinta su actividad
  const abrir = window.openDetail;
  if (typeof abrir === "function") {
    window.openDetail = function (id) {
      const r = abrir.apply(this, arguments);
      try { pintar(id); } catch (e) { console.error("[Ficha] actividad:", e); }
      return r;
    };
  }
  window.FICHA_ACTIVIDAD = { pintar };
})();
