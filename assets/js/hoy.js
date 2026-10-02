// ============================================================================
//  INICIO: ASÍ VA EL DÍA
// ============================================================================
//  La primera pantalla. Responde lo que hay que hacer al llegar, no lo que va
//  pasando en el día (eso está en Turno → Calendario y Registro):
//    - ¿Qué es urgente? Máquinas con fallas repetidas y pendientes de prioridad alta.
//    - ¿Qué mantenimiento toca? Piezas que ya toca cambiar, piezas que pidió una
//      inspección (y si hay en almacén o hay que pedirlas) y tareas del día.
//    - ¿Qué falta en el almacén? Pedidos, solicitudes sin entregar, piezas bajo
//      el mínimo, inventario por actualizar.
//    - ¿Quién está de turno y cómo están los equipos?
//  Todo lleva a su sección con el filtro ya puesto.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);
  const vista = { dia: "", sede: "", quien: false, sheet: null };

  const S = () => window.MTTO_STORE;

  // ¿Llegó el reporte de un turno? Se busca en el chat importado, en el
  // formulario de turno y en lo registrado a mano en el Registro diario.
  function reporteDe(fecha, turno, sede) {
    const desde = turno === "Día" ? `${fecha} 17:00` : `${N.sumaDias(fecha, 1)} 05:00`;
    const hasta = turno === "Día" ? `${N.sumaDias(fecha, 1)} 04:59` : `${N.sumaDias(fecha, 1)} 13:00`;
    const enRango = (f, h) => `${f} ${h || "00:00"}` >= desde && `${f} ${h || "00:00"}` <= hasta;
    const chat = (window.REPORTES_TURNO || []).filter((r) => r.sede === sede && enRango(r.fecha, r.hora));
    if (chat.length) { const r = chat[chat.length - 1]; return { ok: true, via: "chat", hora: r.hora, autor: r.autor, id: r.id }; }
    const form = (window.REPORTES_FORM ? window.REPORTES_FORM.lista() : []).filter((r) => r.sede === sede && r.fecha === fecha && r.turno === turno);
    if (form.length) return { ok: true, via: "formulario", hora: N.horaDe(form[0].createdAt), autor: form[0].por };
    // Novedades de esa sede escritas en la ventana del reporte (las del chat
    // llevan la hora del mensaje) o registradas a mano para ese turno.
    const siguiente = N.sumaDias(fecha, 1);
    const reg = S() ? S().registros().filter((r) => r.s === sede && !r.borrado && (
      (r.src === "chat" && enRango(r.f, r.hr)) ||
      (r.src !== "chat" && r.t === turno && (r.f === fecha || (turno === "Noche" && r.f === siguiente))))) : [];
    if (reg.length) {
      const r = reg[reg.length - 1];
      return { ok: true, via: "registro", hora: r.src === "chat" ? r.hr : N.horaDe(r.createdAt), autor: r.tec || r.por, fecha: r.f };
    }
    return { ok: false };
  }

  // Máquinas y servicios críticos parados por una falla o pendiente en los últimos 5 días
  function paradasPorFalla() {
    if (!S()) return [];
    const hoy = N.hoy();
    const desde = N.sumaDias(hoy, -5);
    const ultima = new Map();
    S().registros().filter((r) => r && !r.borrado && r.f >= desde && (r.cat === "Máquina" || r.cat === "Apoyo crítico" || /bomba de vac[íi]o|compresor|chiller/i.test(r.de || "")) && (!vista.sede || r.s === vista.sede))
      .sort((a, b) => (a.f + (a.hr || a.hi || "")).localeCompare(b.f + (b.hr || b.hi || "")))
      .forEach((r) => ultima.set(`${r.s}|${r.eq || r.de.slice(0, 30)}`, r));
    return [...ultima.values()].filter((r) => r.ef === "Pendiente" || r.frep === 1 || (/parada|fuera de servicio|averiada|bloqueada|se da[ñn]a.*pendiente/i.test(r.de || "") && r.ef !== "Operativo")).sort((a, b) => (b.f + (b.hr || "")).localeCompare(a.f + (a.hr || "")));
  }

  function saludo() {
    const n = N.usuario.get();
    const primer = n ? n.split(/\s+/)[0] : "";
    return `${N.saludo()}${primer ? ", " + esc(primer) : ""}`;
  }

  // ----------------------------------------------------------------- piezas
  // Una cifra de la franja de arriba: nombre, número y una línea de detalle
  function kpi({ n, dec = 0, unidad = "", titulo, pie, tono = "", go, goQ }) {
    const val = Number(n) || 0;
    return `<button class="hy-stat ${tono}" type="button" ${go ? `data-hy="${go}"` : ""} ${goQ ? `data-q="${esc(goQ)}"` : ""}>
      <span class="hy-stat__t">${titulo}</span>
      <b class="hy-stat__n"><span data-n="${val}" data-dec="${dec}">${val.toLocaleString("es-CO", { maximumFractionDigits: dec, minimumFractionDigits: dec })}</span>${unidad ? `<small>${unidad}</small>` : ""}</b>
      <span class="hy-stat__s">${pie}</span>
    </button>`;
  }

  function tarjetaTurno() {
    const T = window.TURNOS;
    const t = N.turnoEnCurso();
    const quienes = T ? T.quienes(t.fecha, t.clave) : {};
    const bloque = (k, sede) => {
      const g = (quienes[k] && quienes[k].gente) || [];
      return `<div class="hy-sede">
        <div class="hy-sede__top"><b>${esc(quienes[k] ? quienes[k].sede : sede)}</b>
          <span class="ux-avs">${g.slice(0, 5).map((p) => `<span class="ux-av ux-av--${N.tono(p.nombre)}" title="${esc(p.nombre)}${p.fijo ? " · turno fijo" : ""}">${esc(N.iniciales(p.nombre).toUpperCase())}</span>`).join("")}</span></div>
        <p class="ux-small ux-mute" style="margin:2px 0 0">${g.length ? g.map((p) => esc(p.nombre.split(" ").slice(0, 2).join(" "))).join(", ") : "Sin personal en el cuadro"}</p>
      </div>`;
    };
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic(t.turno === "Día" ? "sol" : "luna")}En turno ahora</h2><p class="ux-card__sub">Turno de ${t.turno === "Día" ? "día · 8:00 a 20:00" : "noche · 20:00 a 8:00"}</p></div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="turnos">Cuadro ${ic("der", "ic--sm")}</button></div>
      <div class="ux-stack" style="gap:14px">${bloque("sede4", "Sede 4")}<hr class="ux-divider">${bloque("sede2", "Sede 2")}</div>
    </section>`;
  }


  function tarjetaFallas() {
    const hasta = N.hoy();
    const desde = N.sumaDias(hasta, -6);
    const regs = S() ? S().registros().filter((r) => r.f >= desde && r.f <= hasta && r.cat === "Máquina" && r.tp === "Correctivo" && !/no identificado|sin especificar/i.test(r.eq) && (!vista.sede || r.s === vista.sede)) : [];
    const m = new Map();
    regs.forEach((r) => m.set(r.eq, (m.get(r.eq) || 0) + 1));
    const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...top.map((x) => x[1]));
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("falla")}Más fallas esta semana</h2><p class="ux-card__sub">Correctivos de máquina, últimos 7 días</p></div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="indicadores">Indicadores ${ic("der", "ic--sm")}</button></div>
      ${top.length ? `<div class="ux-hbars">${top.map(([eq, n], i) => `<button class="ux-hbar" type="button" data-hy="ver-fallas-eq" data-v="${esc(eq)}" title="Ver las ${n} fallas de ${esc(eq)}"><span class="ux-hbar__t">${esc(eq)}</span><span class="ux-hbar__v">${n} <small>${n === 1 ? "falla" : "fallas"}</small></span><span class="ux-progress ${i === 0 ? "ux-progress--bad" : "ux-progress--dark"}"><i style="width:${Math.round((n / max) * 100)}%"></i></span></button>`).join("")}</div>`
        : `<div class="ux-empty"><h4>Sin correctivos de máquina</h4><p>No hay fallas de máquina registradas en los últimos 7 días.</p></div>`}
    </section>`;
  }

  // ---------------------------------------------------------------- agenda
  // Lo que hay que hacer o revisar hoy, sacado de lo que la app ya sabe:
  // fallas que se repiten, pendientes urgentes, piezas que ya toca cambiar,
  // piezas que una inspección pidió (y si hay en almacén), tareas del día y
  // lo que falta en el almacén. Cada cosa lleva a donde se resuelve.
  const planEq = (cod) => ((window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || []).find((e) => e.c === cod || e.id === cod);
  const nombreEq = (cod) => { const e = planEq(cod); return e ? e.n : cod; };
  function existencia(cod) {
    const inv = window.INVENTARIO;
    if (!cod || !inv || !inv.cargado) return null;
    const a = inv.de(inv.norm(cod));
    return a ? Number(a.exist) || 0 : 0;
  }
  const hayTxt = (n) => (n === null ? "" : n > 0 ? `hay ${N.fmt.num(n)} en almacén` : "no hay en almacén");

  function agenda() {
    const hoy = N.hoy();
    const grupos = { urgente: [], mtto: [], almacen: [] };
    const S_ = S();
    // 0. Máquinas que siguen paradas por una falla
    paradasPorFalla().forEach((r) => grupos.urgente.push({
      tono: "bad", ico: "llave", t: `${r.eq} parada por falla${r.frep ? " · falta repuesto" : ""}`,
      s: `Desde el ${N.fmt.corta(r.f)}${r.hr ? " " + r.hr : ""} · ${String(r.de || "").replace(/\s+/g, " ").slice(0, 90)}`,
      acc: "Ver detalle", hy: "ver-evento", id: r.id, v: r.eq,
    }));
    // 1. Máquinas con fallas repetidas en la semana
    if (S_) {
      const desde = N.sumaDias(hoy, -6);
      const m = new Map();
      S_.registros().filter((r) => r && !r.borrado && r.f >= desde && r.f <= hoy && r.cat === "Máquina" && r.tp === "Correctivo" && !/no identificado|sin especificar/i.test(r.eq) && (!vista.sede || r.s === vista.sede))
        .forEach((r) => { const x = m.get(r.eq) || { n: 0, ult: r }; x.n++; if ((r.f + (r.hr || "")) > (x.ult.f + (x.ult.hr || ""))) x.ult = r; m.set(r.eq, x); });
      [...m.entries()].filter(([, x]) => x.n >= 3).sort((a, b) => b[1].n - a[1].n).slice(0, 4).forEach(([eq, x]) => grupos.urgente.push({
        tono: "bad", ico: "falla", t: `${eq}: ${x.n} fallas en 7 días`, s: `Revisar la causa · la última: ${String(x.ult.de || "").replace(/\s+/g, " ").slice(0, 90)}`,
        acc: "Ver fallas", hy: "ver-fallas-eq", v: eq,
      }));
    }
    // 2. Pendientes de prioridad alta
    const P = window.PENDIENTES;
    if (P) P.abiertos().filter((p) => p.prioridad === "alta" && (!vista.sede || !p.sede || p.sede === vista.sede))
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).slice(0, 5)
      .forEach((p) => grupos.urgente.push({ tono: p.estado === "espera" ? "warn" : "bad", ico: "pendientes", t: p.titulo, s: `${p.eq || "General"} · ${P.ESTADO_TXT[p.estado]}${p.edad ? ` · hace ${p.edad} d` : ""}`, acc: "Abrir", hy: "pend", id: p.id }));

    // 3. Piezas que ya toca cambiar (componentes seguidos por posición)
    const yaListadas = new Set();
    if (typeof compEstado === "function") (window.COMPONENTES_SEGUIDOS || []).forEach((g) => (g.items || []).forEach((it) => {
      const e = compEstado(g.eq, g, it);
      if (!["pendiente", "vencida", "pronto"].includes(e.estado)) return;
      const n = existencia(it.cod);
      if (it.cod) yaListadas.add(`${g.eq}|${it.cod}`);
      grupos.mtto.push({
        tono: e.estado === "pronto" ? "warn" : "bad", ico: "llave",
        t: `Cambiar ${it.ubicacion || it.d} · ${nombreEq(g.eq)}`,
        s: [e.estado === "pendiente" ? "Quedó pendiente" : e.estado === "vencida" ? `Tocaba el ${N.fmt.corta(e.proximo)}` : `Toca el ${N.fmt.corta(e.proximo)}`, it.d, hayTxt(n)].filter(Boolean).join(" · "),
        falta: n === 0, acc: n === 0 ? "Pedir" : "Ver", hy: n === 0 ? "pedir" : "ficha", v: g.eq, cod: it.cod,
      });
    }));
    // 4. Piezas que una inspección abierta marcó para cambiar y no se han hecho
    //    (el Seguimiento decide qué cuenta como hecho)
    const SGh = window.SEGUIMIENTO;
    (typeof inspecciones !== "undefined" ? inspecciones : []).filter((i) => i && (i.estado || "abierta") !== "cerrada").forEach((i) => (i.piezas || []).forEach((p) => {
      if (p.hecho || (SGh && SGh.estadoHallazgo(i, p).k === "hecho")) return;
      // La misma pieza ya salió como posición pendiente de esa máquina
      if (p.cod && yaListadas.has(`${i.eq}|${p.cod}`)) return;
      const n = existencia(p.cod);
      grupos.mtto.push({
        tono: p.urgencia === "alta" ? "bad" : p.urgencia === "baja" ? "" : "warn", ico: "insp",
        t: `${p.d || p.cod || "Pieza"} · ${nombreEq(i.eq)}`,
        s: [`Inspección del ${N.fmt.corta(i.fecha)}`, p.q ? `${p.q} und.` : "", hayTxt(n)].filter(Boolean).join(" · "),
        falta: n === 0, acc: n === 0 ? "Pedir" : "Ver", hy: n === 0 ? "pedir" : "seg", v: i.eq, cod: p.cod, id: i.id,
      });
    }));
    // 5. Mantenimientos programados para hoy (o que ya pasaron sin hacerse)
    //    y el equipo que conviene inspeccionar hoy
    const SG = window.SEGUIMIENTO;
    if (SG) {
      SG.trabajos().filter((t) => t.etapa === "programado" && t.i.programado <= hoy).forEach((t) => grupos.urgente.unshift({
        tono: "bad", ico: "calendario", t: `Mantenimiento ${t.i.programado === hoy ? "hoy" : "atrasado"}: ${nombreEq(t.i.eq)}`,
        s: `${t.pend.length} ${t.pend.length === 1 ? "cosa por hacer" : "cosas por hacer"}${t.i.programado < hoy ? ` · era el ${N.fmt.corta(t.i.programado)}` : ""}`, acc: "Abrir", hy: "seg", id: t.i.id,
      }));
      const s = SG.sugerencias()[0];
      if (s) grupos.mtto.unshift({
        tono: "", ico: "insp", t: `Inspeccionar hoy: ${nombreEq(s.c)}`,
        s: `${s.n} fallas en 14 días · ${s.u ? `última inspección el ${N.fmt.corta(s.u)}` : "nunca inspeccionado"}`,
        acc: "Ver fallas", hy: "ver-fallas-insp", v: s.c,
      });
    }
    // 6. Tareas con aviso para hoy o vencido
    if (typeof tasks !== "undefined") tasks.filter((x) => x.status !== "hecha" && x.remindNextAt && N.diaCO(x.remindNextAt) <= hoy).slice(0, 5)
      .forEach((x) => grupos.mtto.push({ tono: "", ico: "tareas", t: x.title || "Tarea", s: `${x.machineName && x.machineName !== "General / Otra" ? x.machineName + " · " : ""}aviso ${N.diaCO(x.remindNextAt) < hoy ? "vencido" : "de hoy"}`, acc: "Ver", hy: "tareas" }));

    // 7. Almacén
    const sols = window.almSolicitudes ? window.almSolicitudes() : [];
    const sinEntregar = sols.filter((s) => (s.estado || "emitida") === "emitida").length;
    const telegram = sols.filter((s) => s.estado === "pedido").length;
    if (telegram) grupos.almacen.push({ tono: "warn", ico: "telegram", t: `${telegram} ${telegram === 1 ? "pedido llegó" : "pedidos llegaron"} por Telegram`, s: "Pasarlos a una solicitud", acc: "Ver", hy: "almacen" });
    if (sinEntregar) grupos.almacen.push({ tono: "", ico: "almacen", t: `${sinEntregar} ${sinEntregar === 1 ? "solicitud" : "solicitudes"} sin entregar`, s: "Confirmar con almacén y marcarlas entregadas", acc: "Ver", hy: "historial" });
    const inv = window.INVENTARIO;
    let bajo = 0;
    if (inv && inv.cargado && window.EQUIPOS_PLAN) {
      const vistos = new Set();
      window.EQUIPOS_PLAN.equipos.forEach((eq) => (eq.r || []).forEach((r) => {
        const cod = inv.norm(typeof repCodigo === "function" ? repCodigo(eq, r) : r.cod);
        if (!cod || vistos.has(cod)) return;
        vistos.add(cod);
        const a = inv.de(cod);
        if (a && a.min > 0 && (a.exist ?? 0) < a.min) bajo++;
      }));
    }
    if (bajo) grupos.almacen.push({ tono: "warn", ico: "repuesto", t: `${bajo} piezas del plan bajo el mínimo`, s: "Revisar cuáles pedir", acc: "Ver", hy: "almacen-min" });
    const f = inv ? inv.frescura() : null;
    if (f && f.estado !== "fresco") grupos.almacen.push({ tono: "", ico: "subir", t: "Actualizar el inventario", s: f.estado === "sin-datos" ? "No hay reporte RE356 cargado" : `El RE356 es ${f.texto.replace(/^Inventario /, "").replace(/dias/, "días")}`, acc: "Cargar", hy: "almacen" });
    return grupos;
  }

  function tarjetaAgenda() {
    const g = agenda();
    const TIT = { urgente: "Urgente", mtto: "Mantenimiento y repuestos", almacen: "Almacén" };
    const total = Object.values(g).reduce((a, l) => a + l.length, 0);
    const MAX = 6;
    const fila = (x) => `<li><button class="hy-ag" type="button" data-hy="${x.hy}" ${x.v ? `data-v="${esc(x.v)}"` : ""} ${x.id ? `data-id="${esc(x.id)}"` : ""} ${x.cod ? `data-cod="${esc(x.cod)}"` : ""}>
        <span class="hy-ag__ico ${x.tono ? "is-" + x.tono : ""}">${ic(x.ico)}</span>
        <span class="hy-ag__txt"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span>
        <span class="hy-ag__acc ${x.falta ? "is-pedir" : ""}">${esc(x.acc)}</span>
      </button></li>`;
    return `<section class="ux-card hy-agenda">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("check")}Para hoy <small>${total ? `${total} por atender` : ""}</small></h2></div></div>
      ${total ? Object.entries(g).filter(([, l]) => l.length).map(([k, l]) => `<div class="hy-ag__grupo">
          <h3 class="hy-ag__t">${TIT[k]} <span>${l.length}</span></h3>
          <ul class="hy-ag__lista">${(vista.abierto === k ? l : l.slice(0, MAX)).map(fila).join("")}</ul>
          ${l.length > MAX && vista.abierto !== k ? `<button class="ux-link" type="button" data-hy="mas" data-v="${k}">Ver las ${l.length}</button>` : ""}
        </div>`).join("")
        : `<div class="ux-empty"><span class="ux-empty__ico">${ic("check")}</span><h4>Nada pendiente para hoy</h4></div>`}
    </section>`;
  }

  function buscarFichaId(eqNombre, sede) {
    if (!eqNombre) return null;
    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const neq = norm(eqNombre);
    if (typeof machines !== "undefined") {
      const direct = machines.find((m) => norm(m.id) === neq || norm(m.model) === neq || norm(m.name) === neq);
      if (direct) return direct.id;
    }
    const cat = (window.MTTO && window.MTTO.catalogo && window.MTTO.catalogo.equipos) || [];
    const enCat = cat.find((x) => (!sede || x.s === sede) && norm(x.eq) === neq) || cat.find((x) => norm(x.eq) === neq);
    if (enCat && enCat.fi) return enCat.fi;
    const plan = (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || [];
    const enPlan = plan.find((e) => norm(e.c) === neq || norm(e.n).includes(neq) || neq.includes(norm(e.n)));
    if (enPlan) {
      if (typeof machines !== "undefined") {
        const m = machines.find((x) => x.id === enPlan.id || x.equipoCod === enPlan.c);
        if (m) return m.id;
      }
      return enPlan.id || enPlan.c;
    }
    return null;
  }

  function irAFicha(eqNombre, sede) {
    const fid = buscarFichaId(eqNombre, sede);
    if (fid && typeof openDetail === "function" && typeof machines !== "undefined" && machines.some((m) => m.id === fid)) {
      openDetail(fid);
      return true;
    }
    const plan = (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || [];
    const enPlan = plan.find((e) => e.c === eqNombre || e.id === eqNombre || e.n.toLowerCase().includes((eqNombre || "").toLowerCase()));
    if (enPlan && window.goPlan) {
      window.goPlan(enPlan.c || enPlan.n);
      return true;
    }
    if (window.goIndicadores) {
      window.goIndicadores({ eq: eqNombre });
      return true;
    }
    return false;
  }

  function renderSheetEvento() {
    const r = S() ? S().registros().find((x) => x.id === vista.sheet.id) : null;
    if (!r) return "";
    return `<div class="mx-backdrop" data-hy-close="1"></div>
    <aside class="mx-sheet mx-sheet--ancha" role="dialog" aria-modal="true" aria-label="Detalle de parada">
      <header class="mx-sheet__head">
        <div>
          <p class="mx-eyebrow">${esc(r.s)} · ${esc(r.ar || "Área de proceso")} · Turno ${esc(r.t || "")}</p>
          <h3>${esc(r.eq)}</h3>
        </div>
        <button class="mx-iconbtn" type="button" data-hy-close="1" aria-label="Cerrar">${ic("x")}</button>
      </header>
      <div class="mx-form__body" style="padding:20px; display:flex; flex-direction:column; gap:16px;">
        <div class="ux-card" style="margin:0; background:var(--bg-elevated,#1e232d); border:1px solid var(--border-color,#333); padding:16px; border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="ux-pill ux-pill--bad" style="background:#dc262622; color:#ef4444; border:1px solid #ef444444; padding:4px 10px; border-radius:999px; font-weight:600; font-size:12px;">
                ${ic("falla", "ic--sm")} ${r.ef === "Pendiente" ? "Parada por falla · Pendiente" : r.ef || "Parada por falla"}
              </span>
              ${r.frep ? `<span class="ux-pill ux-pill--warn" style="background:#f59e0b22; color:#f59e0b; border:1px solid #f59e0b44; padding:4px 10px; border-radius:999px; font-weight:600; font-size:12px;">Falta repuesto</span>` : ""}
              <span class="ux-pill" style="background:#3b82f622; color:#60a5fa; border:1px solid #60a5fa44; padding:4px 10px; border-radius:999px; font-weight:600; font-size:12px;">
                ${esc(r.cat || "Máquina")} · ${esc(r.tp || "Correctivo")}
              </span>
            </div>
            <span style="font-size:13px; color:var(--text-muted,#888);">
              ${ic("calendario", "ic--sm")} ${N.fmt.corta(r.f)}${r.hr ? " " + r.hr : ""}
            </span>
          </div>

          <div style="margin-bottom:14px;">
            <h4 style="margin:0 0 6px 0; font-size:13px; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted,#888);">¿Qué pasó en la máquina?</h4>
            <p style="margin:0; font-size:15px; line-height:1.5; color:var(--text-main,#eee); background:rgba(0,0,0,0.18); padding:12px 14px; border-radius:8px; border-left:3px solid #ef4444;">
              ${esc(r.de || "Sin descripción de la novedad")}
            </p>
          </div>

          ${r.ac ? `<div style="margin-bottom:14px;">
            <h4 style="margin:0 0 6px 0; font-size:13px; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted,#888);">Acción realizada</h4>
            <p style="margin:0; font-size:14px; line-height:1.5; color:var(--text-main,#eee); background:rgba(0,0,0,0.18); padding:10px 14px; border-radius:8px; border-left:3px solid #10b981;">
              ${esc(r.ac)}
            </p>
          </div>` : ""}

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-top:14px; font-size:13px;">
            <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px;">
              <span style="color:var(--text-muted,#888); display:block; font-size:11px;">Técnico</span>
              <b>${esc(r.tec || "No registrado")}</b>
            </div>
            <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px;">
              <span style="color:var(--text-muted,#888); display:block; font-size:11px;">Tiempo de parada</span>
              <b>${r.min > 0 ? (r.min >= 60 ? `${Math.floor(r.min / 60)} h ${r.min % 60} min` : `${r.min} min`) : (r.hi ? `${r.hi} - ${r.hf || ""}` : "No cronometrado")}</b>
            </div>
            <div style="background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px;">
              <span style="color:var(--text-muted,#888); display:block; font-size:11px;">Repuesto</span>
              <b>${esc(r.rep || (r.frep ? "Faltó repuesto en planta" : "Sin repuesto requerido"))}</b>
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <h4 style="margin:4px 0; font-size:12px; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted,#888);">Acciones directas</h4>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="ux-btn ux-btn--primary" type="button" data-hy-go-ficha="${esc(r.eq)}" data-hy-sede="${esc(r.s)}">
              ${ic("ficha")} Ir a la ficha de la máquina
            </button>
            <button class="ux-btn ux-btn--ghost" type="button" data-hy="eq" data-v="${esc(r.eq)}">
              ${ic("grafica")} Ver historial y hoja de vida
            </button>
            <button class="ux-btn ux-btn--ghost" type="button" data-hy="reg-edit" data-id="${esc(r.id)}">
              ${ic("editar")} Completar / Editar registro
            </button>
          </div>
        </div>
      </div>
    </aside>`;
  }

  function renderSheetFallas() {
    const cod = vista.sheet.cod;
    const eqNom = vista.sheet.eqNom || (cod ? nombreEq(cod) : "");
    const hoy = N.hoy();
    const dias = vista.sheet.dias || 14;
    const desde = N.sumaDias(hoy, -dias);

    const cat = (window.MTTO && window.MTTO.catalogo && window.MTTO.catalogo.equipos) || [];
    const itemsCat = cat.filter((x) => x.fi === cod || (cod && x.fi === `eq-${cod}`) || x.eq.toLowerCase() === eqNom.toLowerCase());
    const eqNames = new Set([eqNom, ...itemsCat.map((x) => x.eq)].filter(Boolean).map((s) => s.toLowerCase()));

    const regs = S() ? S().registros().filter((r) => {
      if (!r || r.borrado || r.f < desde || r.f > hoy) return false;
      if (vista.sede && r.s && r.s !== vista.sede) return false;
      return eqNames.has(String(r.eq || "").toLowerCase());
    }).sort((a, b) => (b.f + (b.hr || "")).localeCompare(a.f + (a.hr || ""))) : [];

    const correctivos = regs.filter((r) => r.cat === "Máquina" && r.tp === "Correctivo");
    const operacionales = regs.filter((r) => r.cat === "Operacional" || r.tp === "Apoyo a producción");
    const criticos = regs.filter((r) => r.cat === "Apoyo crítico");

    return `<div class="mx-backdrop" data-hy-close="1"></div>
    <aside class="mx-sheet mx-sheet--ancha" role="dialog" aria-modal="true" aria-label="Eventos recientes del equipo">
      <header class="mx-sheet__head">
        <div>
          <p class="mx-eyebrow">Diagnóstico de eventos · Últimos ${dias} días (${N.fmt.corta(desde)} al ${N.fmt.corta(hoy)})</p>
          <h3>${esc(eqNom)}</h3>
        </div>
        <button class="mx-iconbtn" type="button" data-hy-close="1" aria-label="Cerrar">${ic("x")}</button>
      </header>
      <div class="mx-form__body" style="padding:20px; display:flex; flex-direction:column; gap:16px;">
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); padding:10px 14px; border-radius:10px;">
            <span style="font-size:11px; text-transform:uppercase; color:#ef4444; font-weight:700; display:block;">Averías de máquina</span>
            <b style="font-size:24px; color:#ef4444;">${correctivos.length}</b>
            <span style="font-size:11px; color:var(--text-muted,#888); display:block;">fallas mecánicas / eléctricas</span>
          </div>
          <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); padding:10px 14px; border-radius:10px;">
            <span style="font-size:11px; text-transform:uppercase; color:#f59e0b; font-weight:700; display:block;">Ajustes operacionales</span>
            <b style="font-size:24px; color:#f59e0b;">${operacionales.length}</b>
            <span style="font-size:11px; color:var(--text-muted,#888); display:block;">cuadre de lote / operario</span>
          </div>
          <div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.25); padding:10px 14px; border-radius:10px;">
            <span style="font-size:11px; text-transform:uppercase; color:#60a5fa; font-weight:700; display:block;">Servicios / Apoyo</span>
            <b style="font-size:24px; color:#60a5fa;">${criticos.length}</b>
            <span style="font-size:11px; color:var(--text-muted,#888); display:block;">aire, vacío, agua helada</span>
          </div>
          <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); padding:10px 14px; border-radius:10px;">
            <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted,#888); font-weight:700; display:block;">Total llamadas / paradas</span>
            <b style="font-size:24px;">${regs.length}</b>
            <span style="font-size:11px; color:var(--text-muted,#888); display:block;">en ${dias} días</span>
          </div>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${cod ? `<button class="ux-btn ux-btn--primary" type="button" data-hy-insp="${esc(cod)}">
            ${ic("insp")} Anotar inspección de este equipo
          </button>` : ""}
          <button class="ux-btn ux-btn--ghost" type="button" data-hy-go-ficha="${esc(eqNom)}">
            ${ic("ficha")} Ir a la ficha de la máquina
          </button>
          <button class="ux-btn ux-btn--ghost" type="button" data-hy="eq" data-v="${esc(eqNom)}">
            ${ic("grafica")} Hoja de vida completa
          </button>
        </div>

        <div>
          <h4 style="margin:8px 0 10px 0; font-size:13px; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted,#888);">
            Detalle cronológico de las ${regs.length} llamadas y paradas:
          </h4>
          ${regs.length ? `<div style="display:flex; flex-direction:column; gap:10px;">
            ${regs.map((r) => {
              const esMec = r.cat === "Máquina" && r.tp === "Correctivo";
              const esOpe = r.cat === "Operacional" || r.tp === "Apoyo a producción";
              const borderCol = esMec ? "#ef4444" : esOpe ? "#f59e0b" : "#3b82f6";
              const tagTxt = esMec ? "Avería de máquina" : esOpe ? "Soporte operacional / cuadre" : r.cat || "Novedad";
              const tagBg = esMec ? "rgba(239,68,68,0.15)" : esOpe ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)";
              const tagFg = esMec ? "#ef4444" : esOpe ? "#f59e0b" : "#60a5fa";
              return `<div class="ux-card" style="margin:0; padding:12px 14px; border-left:4px solid ${borderCol}; background:var(--bg-card,#181c24); border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; flex-wrap:wrap; gap:6px;">
                  <div style="display:flex; gap:8px; align-items:center;">
                    <span style="font-size:11px; font-weight:700; background:${tagBg}; color:${tagFg}; padding:2px 8px; border-radius:4px;">${tagTxt}</span>
                    <span style="font-size:12px; font-weight:600; color:var(--text-main,#eee);">${esc(N.fmt.corta(r.f))}${r.hr ? " " + r.hr : ""} · Turno ${esc(r.t || "")}</span>
                  </div>
                  <div style="font-size:12px; color:var(--text-muted,#888);">
                    ${r.tec ? `${ic("usuario", "ic--sm")}${esc(r.tec.split(" ")[0])}` : ""}
                    ${r.min > 0 ? ` · ${r.min >= 60 ? `${Math.floor(r.min / 60)}h ${r.min % 60}m` : `${r.min}m`}` : ""}
                  </div>
                </div>
                <p style="margin:0 0 6px 0; font-size:13.5px; line-height:1.45; color:var(--text-main,#eee);">${esc(r.de || "")}</p>
                ${r.ac ? `<p style="margin:0 0 4px 0; font-size:12.5px; color:#10b981; line-height:1.4;"><b>Acción:</b> ${esc(r.ac)}</p>` : ""}
                ${r.rep || r.frep ? `<p style="margin:0; font-size:12px; color:#f59e0b;"><b>Repuesto:</b> ${esc(r.rep || "Faltó repuesto en planta")}</p>` : ""}
              </div>`;
            }).join("")}
          </div>` : `<div class="ux-empty"><p>No se encontraron registros de este equipo en este periodo.</p></div>`}
        </div>

      </div>
    </aside>`;
  }

  function renderSheetParadas() {
    const paradas = paradasPorFalla();
    return `<div class="mx-backdrop" data-hy-close="1"></div>
    <aside class="mx-sheet mx-sheet--ancha" role="dialog" aria-modal="true" aria-label="Máquinas paradas por falla">
      <header class="mx-sheet__head">
        <div>
          <p class="mx-eyebrow">Diagnóstico de planta · Ventana de 5 días</p>
          <h3>Máquinas y servicios parados por falla (${paradas.length})</h3>
        </div>
        <button class="mx-iconbtn" type="button" data-hy-close="1" aria-label="Cerrar">${ic("x")}</button>
      </header>
      <div class="mx-form__body" style="padding:20px; display:flex; flex-direction:column; gap:14px;">
        ${paradas.length ? `<div style="display:flex; flex-direction:column; gap:12px;">
          ${paradas.map((r) => `
            <div class="ux-card" style="margin:0; padding:14px; background:var(--bg-elevated,#1e232d); border-left:4px solid #ef4444; border-radius:10px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                <div>
                  <h4 style="margin:0; font-size:16px;">${esc(r.eq)}</h4>
                  <small style="color:var(--text-muted,#888);">${esc(r.s)} · ${esc(r.ar || "Área")} · Desde ${N.fmt.corta(r.f)}${r.hr ? " " + r.hr : ""}</small>
                </div>
                <div style="display:flex; gap:6px;">
                  <button class="ux-btn ux-btn--sm ux-btn--primary" type="button" data-hy-go-ficha="${esc(r.eq)}" data-hy-sede="${esc(r.s)}">
                    ${ic("ficha")} Ir a la máquina
                  </button>
                  <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="ver-evento" data-id="${esc(r.id)}">
                    Ver detalle
                  </button>
                </div>
              </div>
              <p style="margin:0 0 6px 0; font-size:13.5px; line-height:1.45; color:var(--text-main,#eee);">${esc(r.de || "")}</p>
              ${r.ac ? `<p style="margin:0; font-size:12.5px; color:#10b981;"><b>Acción:</b> ${esc(r.ac)}</p>` : ""}
            </div>`).join("")}
        </div>` : `<div class="ux-empty"><p>No hay máquinas paradas registradas en los últimos 5 días.</p></div>`}
      </div>
    </aside>`;
  }

  function renderSheet() {
    if (!vista.sheet) return "";
    if (vista.sheet.tipo === "evento") return renderSheetEvento();
    if (vista.sheet.tipo === "fallas") return renderSheetFallas();
    if (vista.sheet.tipo === "paradas") return renderSheetParadas();
    return "";
  }

  // ------------------------------------------------------------------ vista
  function render() {
    const raiz = document.getElementById("hoyRoot");
    if (!raiz) return;
    const hoy = N.hoy();
    const t = N.turnoEnCurso();
    const P = window.PENDIENTES;
    const ab = P ? P.abiertos().filter((p) => !vista.sede || !p.sede || p.sede === vista.sede) : [];
    const alta = ab.filter((p) => p.prioridad === "alta").length;
    const paradas = paradasPorFalla();
    const pres = window.PRESUPUESTO && window.PRESUPUESTO.resumen ? window.PRESUPUESTO.resumen() : null;
    const fallasSemana = S() ? S().registros().filter((r) => r && !r.borrado && r.f >= N.sumaDias(hoy, -6) && r.f <= hoy && r.cat === "Máquina" && r.tp === "Correctivo" && (!vista.sede || r.s === vista.sede)).length : 0;

    raiz.innerHTML = `<div class="ux-page ux-seq">
      <div class="ux-head">
        <div class="ux-head__txt">
          <p class="ux-eyebrow">${ic(t.turno === "Día" ? "sol" : "luna")}${esc(N.fmt.fechaLarga(hoy).replace(/^./, (c) => c.toUpperCase()))} · turno de ${t.turno === "Día" ? "día" : "noche"} en curso</p>
          <h1 class="ux-title">${saludo()}</h1>
        </div>
        <div class="ux-head__acts">
          <div class="ux-seg" aria-label="Sede">${["", "Sede 4", "Sede 2"].map((s) => `<button type="button" class="${vista.sede === s ? "is-on" : ""}" data-hy="sede" data-v="${s}">${s || "Las dos"}</button>`).join("")}</div>
        </div>
      </div>

      <div class="hy-stats hy-stats--4c">
        ${kpi({ n: ab.length, titulo: "Pendientes", pie: alta ? `<span class="hy-rojo">${alta} prioridad alta</span>` : "ninguno urgente", go: "pendientes" })}
        ${kpi({ n: paradas.length, titulo: "Paradas por falla", pie: paradas.length ? paradas.slice(0, 2).map((r) => esc(r.eq)).join(", ") + (paradas.length > 2 ? "…" : "") : "ninguna máquina parada", tono: paradas.length ? "is-bad" : "", go: "paradas-modal" })}
        ${kpi({ n: fallasSemana, titulo: "Fallas de máquina", pie: "últimos 7 días", tono: fallasSemana ? "is-bad" : "", go: "indicadores" })}
        ${pres && pres.total
          ? kpi({ n: Math.round((pres.ejecutado / pres.total) * 1000) / 10, dec: 1, unidad: "%", titulo: "Presupuesto", pie: `${esc(N.fmt.dineroCorto(pres.disponible))} disponibles`, go: "presupuesto" })
          : kpi({ n: 0, unidad: "%", titulo: "Presupuesto", pie: "sin configurar", go: "presupuesto-config" })}
      </div>

      <div class="ux-grid ux-grid--main">
        ${tarjetaAgenda()}
        <div class="ux-stack">
          ${tarjetaFallas()}
          ${tarjetaTurno()}
        </div>
      </div>
    </div>
    ${renderSheet()}`;
    window.SHELL?.animarNumeros(raiz);
  }

  function enlazar() {
    const raiz = document.getElementById("hoyRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const btnCerrar = e.target.closest("[data-hy-close]");
      if (btnCerrar) {
        vista.sheet = null;
        render();
        return;
      }
      const btnGoFicha = e.target.closest("[data-hy-go-ficha]");
      if (btnGoFicha) {
        vista.sheet = null;
        irAFicha(btnGoFicha.dataset.hyGoFicha, btnGoFicha.dataset.hySede);
        return;
      }
      const btnInsp = e.target.closest("[data-hy-insp]");
      if (btnInsp) {
        vista.sheet = null;
        window.inspAbrirForm?.(btnInsp.dataset.hyInsp);
        return;
      }
      const b = e.target.closest("[data-hy]");
      if (!b) return;
      const a = b.dataset.hy;
      const v = b.dataset.v;
      if (a === "quien") { vista.quien = true; render(); raiz.querySelector('[data-hy-form="quien"] input')?.focus(); return; }
      if (a === "sede") { vista.sede = v; render(); }
      else if (a === "dia") { vista.dia = v; render(); }
      else if (a === "ver-evento") { vista.sheet = { tipo: "evento", id: b.dataset.id }; render(); }
      else if (a === "ver-fallas-insp") { vista.sheet = { tipo: "fallas", cod: v, dias: 14 }; render(); }
      else if (a === "ver-fallas-eq") { vista.sheet = { tipo: "fallas", eqNom: v, dias: 7 }; render(); }
      else if (a === "paradas-modal") { vista.sheet = { tipo: "paradas" }; render(); }
      else if (a === "reg-edit") { vista.sheet = null; window.goRegistro?.({ abrir: b.dataset.id }); }
      else if (a === "registro") window.goRegistro?.({ fecha: v || b.dataset.q || N.hoy() });
      else if (a === "reg") { vista.sheet = { tipo: "evento", id: b.dataset.id }; render(); }
      else if (a === "nueva") window.goRegistro?.({ nueva: true });
      else if (a === "rep") window.goReportes?.(b.dataset.id);
      else if (a === "pendientes") window.goPendientes?.();
      else if (a === "pend") window.goPendientes?.({ abrir: b.dataset.id });
      else if (a === "tareas") window.goTasks?.();
      else if (a === "turnos") window.goTurnos?.();
      else if (a === "eq") window.goIndicadores?.({ eq: v });
      else if (a === "indicadores") window.goIndicadores?.();
      else if (a === "almacen") window.goAlmacen?.();
      else if (a === "almacen-min") window.goAlmacen?.({ filtro: "min" });
      else if (a === "presupuesto") window.goPresupuesto?.();
      else if (a === "presupuesto-config") window.goPresupuesto?.({ configurar: true });
      else if (a === "mas") { vista.abierto = v; render(); return; }
      else if (a === "historial") window.goSolicitudes?.({ estado: "emitida" });
      else if (a === "insp") window.goInsp?.();
      else if (a === "seg") window.goSeguimiento?.({ id: b.dataset.id });
      else if (a === "inspeccionar") window.inspAbrirForm?.(v);
      else if (a === "pedir") window.goAlmacen?.({ q: b.dataset.cod || "", destino: nombreEq(v) });
      else if (a === "ficha") irAFicha(v);
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    raiz.addEventListener("submit", (e) => {
      const f = e.target.closest('[data-hy-form="quien"]');
      if (!f) return;
      e.preventDefault();
      const n = new FormData(f).get("n").toString().trim();
      if (!n) return;
      N.usuario.set(n);
      vista.quien = false;
      window.SHELL?.toast(`Listo, ${esc(n.split(" ")[0])}.`);
      render();
    });
  }

  function esVisible() { return document.getElementById("hoyView")?.classList.contains("is-active"); }
  let t = null;
  const repintar = () => { if (!esVisible()) return; clearTimeout(t); t = setTimeout(render, 200); };
  N.on("pendientes", repintar);
  N.on("presupuesto", repintar);
  N.on("usuario", repintar);
  window.MTTO_STORE?.alCambiar(repintar);

  function goHoy() {
    views.hoy = views.hoy || document.getElementById("hoyView");
    setView("hoy");
    render();
    enlazar();
    saveUiState({ activeView: "hoy" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  window.goHoy = goHoy;
  window.HOY = { reporteDe, paradasPorFalla };
  views.hoy = document.getElementById("hoyView");
})();
