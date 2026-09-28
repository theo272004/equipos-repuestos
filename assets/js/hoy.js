// ============================================================================
//  INICIO: ASÍ VA EL DÍA
// ============================================================================
//  La primera pantalla. Responde en un vistazo lo que se pregunta al llegar:
//    - ¿Qué ha pasado hoy? (novedades del registro, hora a hora)
//    - ¿Qué equipos están parados?
//    - ¿Quién está de turno y llegó el reporte del turno anterior?
//    - ¿Qué queda pendiente y qué es urgente?
//    - ¿Cómo va el almacén y el presupuesto?
//  Todo lleva a su sección con el filtro ya puesto.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);
  const vista = { dia: "", sede: "" };
  const CAT_TONO = { "Máquina": "bad", "Apoyo crítico": "warn", "Locativo": "vio", "Preventivo": "ok", "Operacional": "acc" };

  const S = () => window.MTTO_STORE;
  const regsDe = (f) => (S() ? S().registros().filter((r) => r && !r.borrado && r.f === f) : []);

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

  function estadoEquipos(sede) {
    if (!S()) return null;
    const t = N.turnoEnCurso();
    const { estados } = S().estadosTurno(t.fecha, t.turno, sede);
    const procesos = new Set(S().equiposSede(sede, true).map((e) => e.eq));
    const c = { "Producción": [], "Mantenimiento": [], "Montaje / cuadre": [], "Limpieza": [], "Stand by": [], "Sin dato": [] };
    Object.entries(estados || {}).forEach(([eq, v]) => { if (procesos.has(eq)) (c[v.e] || c["Sin dato"]).push({ eq, p: v.p }); });
    return c;
  }

  function saludo() {
    const n = N.usuario.get();
    const primer = n ? n.split(/\s+/)[0] : "";
    return `${N.saludo()}${primer ? ", " + esc(primer) : ""}`;
  }

  // ----------------------------------------------------------------- piezas
  function kpi({ n, dec = 0, pre = "", unidad = "", titulo, pie, ico, tono = "", go, goQ, extra = "" }) {
    const val = Number(n) || 0;
    return `<button class="ux-kpi ${tono}" type="button" ${go ? `data-hy="${go}"` : ""} ${goQ ? `data-q="${esc(goQ)}"` : ""}>
      <span class="ux-kpi__top"><span class="ux-kpi__label"><span class="ux-kpi__ico">${ic(ico)}</span>${titulo}</span><span class="ux-kpi__go">${ic("flecha", "ic--sm")}</span></span>
      <span class="ux-kpi__n"><span data-n="${val}" data-dec="${dec}" data-pre="${esc(pre)}">${pre}${val.toLocaleString("es-CO", { maximumFractionDigits: dec, minimumFractionDigits: dec })}</span>${unidad ? `<small>${unidad}</small>` : ""}</span>
      <span class="ux-kpi__foot">${pie}${extra}</span>
    </button>`;
  }

  function barrasDias(hasta, n = 14) {
    const dias = [];
    for (let i = n - 1; i >= 0; i--) dias.push(N.sumaDias(hasta, -i));
    const regs = S() ? S().registros() : [];
    const cuenta = dias.map((d) => regs.filter((r) => r.f === d && !r.borrado && (!vista.sede || r.s === vista.sede)).length);
    const max = Math.max(1, ...cuenta);
    const sel = vista.dia || N.hoy();
    return `<div class="ux-bars" style="min-height:170px">
      <div class="ux-bars__plot" style="min-height:140px">
        <div class="ux-bars__grid"><i></i><i></i><i></i><i></i></div>
        ${dias.map((d, i) => {
          const h = Math.round((cuenta[i] / max) * 100);
          return `<button class="ux-bar ${d === sel ? "is-hi" : ""}" type="button" data-hy="dia" data-v="${d}" style="--h:${h}%" aria-label="${esc(N.fmt.fecha(d))}: ${cuenta[i]} novedades">
            <span class="ux-bar__tip">${cuenta[i]} · ${esc(N.fmt.corta(d))}</span><i style="height:${Math.max(2, h)}%;animation-delay:${i * 25}ms"></i></button>`;
        }).join("")}
      </div>
      <div class="ux-bars__x">${dias.map((d) => `<span class="${d === sel ? "is-hi" : ""}">${Number(d.slice(8))}</span>`).join("")}</div>
    </div>`;
  }

  function lineaTiempo(fecha) {
    const regs = regsDe(fecha).filter((r) => !vista.sede || r.s === vista.sede)
      .sort((a, b) => ((b.hr || b.hi || "") + b.id).localeCompare((a.hr || a.hi || "") + a.id));
    if (!regs.length) {
      return `<div class="ux-empty"><span class="ux-empty__ico">${ic("registro")}</span><h4>Sin novedades registradas ${fecha === N.hoy() ? "todavía hoy" : "ese día"}</h4><p>Llegan con el reporte del chat o se anotan en el Registro diario o en el formulario de turno.</p>
        <div style="display:flex;gap:8px;margin-top:8px"><a class="ux-btn ux-btn--sm" href="reporte.html">${ic("formulario")}Formulario de turno</a><button class="ux-btn ux-btn--sm" type="button" data-hy="nueva">${ic("mas")}Anotar novedad</button></div></div>`;
    }
    return `<ul class="ux-tl hy-tl">${regs.slice(0, 8).map((r) => {
      const tono = CAT_TONO[r.cat] || "";
      const pend = r.ef === "Pendiente" || r.ef === "Operativo con pendiente" || r.frep;
      return `<li><span class="ux-tl__h">${esc(r.hr || r.hi || "—")}</span><span class="ux-tl__dot" style="--c:var(--${tono || "mute-2"})"><i></i></span>
        <button class="ux-tl__b hy-ev" type="button" data-hy="reg" data-id="${esc(r.id)}">
          <span class="hy-ev__top"><b>${esc(r.eq)}</b><span class="ux-pill ux-pill--${tono || "line"}">${esc(r.cat || "Novedad")}</span>${pend ? `<span class="ux-pill ux-pill--warn"><i></i>${r.frep ? "falta repuesto" : "pendiente"}</span>` : r.ef === "Operativo" ? `<span class="ux-pill ux-pill--ok"><i></i>operativo</span>` : ""}<span class="ux-small ux-mute">${esc(r.s)} · ${esc(r.t)}</span></span>
          <span class="hy-ev__d">${esc(String(r.de || "").replace(/\s+/g, " ").slice(0, 220))}</span>
          ${r.tec || r.por ? `<span class="ux-small ux-mute">${esc(N.nombreCorto(r.tec || r.por))}${r.min ? ` · ${r.min} min` : ""}</span>` : ""}
        </button></li>`;
    }).join("")}</ul>
    ${regs.length > 8 ? `<button class="ux-btn ux-btn--sm ux-btn--block" type="button" data-hy="registro" data-v="${fecha}">Ver las ${regs.length} novedades del día en el Registro</button>` : ""}`;
  }

  function tarjetaTurno() {
    const T = window.TURNOS;
    const t = N.turnoEnCurso();
    const ant = N.turnoAnterior();
    const quienes = T ? T.quienes(t.fecha, t.clave) : {};
    const bloque = (k, sede) => {
      const g = (quienes[k] && quienes[k].gente) || [];
      const rep = reporteDe(ant.fecha, ant.turno, sede);
      return `<div class="hy-sede">
        <div class="hy-sede__top"><b>${esc(quienes[k] ? quienes[k].sede : sede)}</b>
          <span class="ux-avs">${g.slice(0, 5).map((p) => `<span class="ux-av ux-av--${N.tono(p.nombre)}" title="${esc(p.nombre)}${p.fijo ? " · turno fijo" : ""}">${esc(N.iniciales(p.nombre).toUpperCase())}</span>`).join("")}</span></div>
        <p class="ux-small ux-mute" style="margin:2px 0 8px">${g.length ? g.map((p) => esc(p.nombre.split(" ").slice(0, 2).join(" "))).join(", ") : "Sin personal en el cuadro"}</p>
        ${rep.ok
          ? `<button class="hy-rep is-ok" type="button" data-hy="${rep.via === "chat" ? "rep" : "registro"}" data-id="${esc(rep.id || "")}" data-v="${esc(ant.fecha)}">${ic("check", "ic--sm")}<span>Reporte del turno de ${ant.turno === "Día" ? "día" : "noche"} recibido${rep.hora ? " a las " + esc(rep.hora) : ""}${rep.autor ? " · " + esc(N.nombreCorto(rep.autor)) : ""}</span></button>`
          : `<a class="hy-rep is-falta" href="reporte.html?sede=${encodeURIComponent(sede)}&fecha=${ant.fecha}&turno=${encodeURIComponent(ant.turno)}">${ic("alerta", "ic--sm")}<span>Falta el reporte del turno de ${ant.turno === "Día" ? "día" : "noche"} (${esc(N.fmt.corta(ant.fecha))}) · <b>llenarlo</b></span></a>`}
      </div>`;
    };
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic(t.turno === "Día" ? "sol" : "luna")}En turno ahora</h2><p class="ux-card__sub">Turno de ${t.turno === "Día" ? "día · 8:00 a 20:00" : "noche · 20:00 a 8:00"}</p></div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="turnos">Cuadro ${ic("der", "ic--sm")}</button></div>
      <div class="ux-stack" style="gap:14px">${bloque("sede4", "Sede 4")}<hr class="ux-divider">${bloque("sede2", "Sede 2")}</div>
    </section>`;
  }

  function tarjetaParados() {
    const sedes = vista.sede ? [vista.sede] : ["Sede 4", "Sede 2"];
    const filas = [];
    let prod = 0, total = 0;
    sedes.forEach((s) => {
      const c = estadoEquipos(s);
      if (!c) return;
      prod += c["Producción"].length;
      total += Object.values(c).reduce((a, l) => a + l.length, 0);
      c["Mantenimiento"].forEach((x) => filas.push({ ...x, s, e: "Mantenimiento" }));
      c["Montaje / cuadre"].forEach((x) => filas.push({ ...x, s, e: "Montaje / cuadre" }));
    });
    const pct = total ? prod / total : 0;
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("fabrica")}Equipos de proceso</h2><p class="ux-card__sub">Según el último estado registrado por turno</p></div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="estados">Estados ${ic("der", "ic--sm")}</button></div>
      <div class="hy-prod"><div class="ux-ring ux-ring--sm" style="--p:${Math.round(pct * 100)};--c:var(--ok)"><div><b>${Math.round(pct * 100)}%</b></div></div>
        <div><b class="ux-strong">${prod} de ${total}</b> en producción<div class="ux-small ux-mute">${filas.length ? `${filas.length} en mantenimiento o montaje` : "Ninguno en mantenimiento"}</div></div></div>
      ${filas.length ? `<ul class="ux-list">${filas.slice(0, 6).map((f) => `<li><button class="ux-row" type="button" data-hy="eq" data-v="${esc(f.eq)}"><span class="ux-row__ico ux-row__ico--${f.e === "Mantenimiento" ? "bad" : "acc"}">${ic(f.e === "Mantenimiento" ? "llave" : "capas")}</span><span><span class="ux-row__t">${esc(f.eq)}</span><span class="ux-row__s">${esc(f.e)}${f.p ? " · " + esc(f.p) : ""}</span></span><span class="ux-row__m">${esc(f.s)}</span></button></li>`).join("")}</ul>` : ""}
    </section>`;
  }

  function tarjetaPendientes() {
    const P = window.PENDIENTES;
    const ab = P ? P.abiertos().sort((a, b) => ({ alta: 0, media: 1, baja: 2 }[a.prioridad] - { alta: 0, media: 1, baja: 2 }[b.prioridad]) || String(b.fecha).localeCompare(String(a.fecha))) : [];
    const lista = ab.filter((p) => !vista.sede || !p.sede || p.sede === vista.sede).slice(0, 6);
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("pendientes")}Pendientes prioritarios <small>${ab.length} abiertos</small></h2><p class="ux-card__sub">Lo que quedó abierto en el chat, tareas, inspecciones y almacén</p></div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="pendientes">Tablero ${ic("der", "ic--sm")}</button></div>
      ${lista.length ? `<ul class="ux-list">${lista.map((p) => `<li><button class="ux-row" type="button" data-hy="pend" data-id="${esc(p.id)}">
        <span class="ux-row__ico ux-row__ico--${p.prioridad === "alta" ? "bad" : p.estado === "espera" ? "warn" : "acc"}">${ic(P.ORIGEN[p.origen].ico)}</span>
        <span><span class="ux-row__t">${esc(p.titulo)}</span><span class="ux-row__s">${esc(p.eq || "General")} · ${esc(P.ESTADO_TXT[p.estado])}${p.posibleCierre ? " · ¿ya resuelto?" : ""}</span></span>
        <span class="ux-row__m">${p.edad === 0 ? "hoy" : p.edad + " d"}</span></button></li>`).join("")}</ul>`
        : `<div class="ux-empty"><span class="ux-empty__ico">${ic("check")}</span><h4>Nada pendiente</h4><p>Cuando algo quede abierto en el registro aparecerá aquí.</p></div>`}
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
      ${top.length ? `<div class="ux-hbars">${top.map(([eq, n], i) => `<button class="ux-hbar" type="button" data-hy="eq" data-v="${esc(eq)}"><span class="ux-hbar__t">${esc(eq)}</span><span class="ux-hbar__v">${n} <small>${n === 1 ? "falla" : "fallas"}</small></span><span class="ux-progress ${i === 0 ? "ux-progress--bad" : "ux-progress--dark"}"><i style="width:${Math.round((n / max) * 100)}%"></i></span></button>`).join("")}</div>`
        : `<div class="ux-empty"><h4>Sin correctivos de máquina</h4><p>No hay fallas de máquina registradas en los últimos 7 días.</p></div>`}
    </section>`;
  }

  function tarjetaAlmacen() {
    const inv = window.INVENTARIO;
    const f = inv ? inv.frescura() : { estado: "sin-datos", texto: "Sin inventario" };
    const sols = window.almSolicitudes ? window.almSolicitudes() : [];
    const porEntregar = sols.filter((s) => s.estado !== "entregada" && s.estado !== "anulada" && s.estado !== "borrador");
    const pedidosBot = sols.filter((s) => s.estado === "pedido");
    // Piezas del plan bajo el mínimo o agotadas
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
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("almacen")}Almacén</h2><p class="ux-card__sub"><span class="ux-pill ux-pill--${f.estado === "fresco" ? "ok" : f.estado === "viejo" ? "warn" : "line"}"><i></i>${esc(f.texto)}</span></p></div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="almacen">Abrir ${ic("der", "ic--sm")}</button></div>
      <div class="hy-mini">
        <button type="button" data-hy="almacen"><b>${porEntregar.length}</b><span>solicitudes sin entregar</span></button>
        <button type="button" data-hy="almacen"><b class="${pedidosBot.length ? "is-warn" : ""}">${pedidosBot.length}</b><span>pedidos desde Telegram</span></button>
        <button type="button" data-hy="almacen-min"><b class="${bajo ? "is-bad" : ""}">${bajo}</b><span>piezas del plan bajo el mínimo</span></button>
      </div>
      ${f.estado !== "fresco" ? `<p class="ux-note ux-note--warn" style="margin-top:12px">${ic("info")}<span>El inventario tiene más de una semana. Carga el RE356 de MiPortal en Almacén para que existencias y precios estén al día.</span></p>` : ""}
    </section>`;
  }

  function tarjetaPresupuesto() {
    const P = window.PRESUPUESTO;
    const r = P && P.resumen ? P.resumen() : null;
    if (!r || !r.total) {
      return `<section class="ux-card">
        <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("presupuesto")}Presupuesto</h2><p class="ux-card__sub">Aún no se ha configurado el monto del año</p></div></div>
        <div class="ux-empty" style="padding:16px"><p>Pon el presupuesto del departamento y repártelo por centro de costo: cada solicitud de almacén se irá descontando sola.</p><button class="ux-btn ux-btn--sm ux-btn--primary" type="button" data-hy="presupuesto-config">${ic("presupuesto")}Configurar presupuesto</button></div>
      </section>`;
    }
    const pct = r.total ? r.ejecutado / r.total : 0;
    const esperado = r.fraccionAnio || 0;
    return `<section class="ux-card ux-card--link" data-hy="presupuesto">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("presupuesto")}Presupuesto ${esc(String(r.anio))}</h2><p class="ux-card__sub">${esc(N.fmt.dineroCorto(r.ejecutado))} de ${esc(N.fmt.dineroCorto(r.total))} ejecutado</p></div>
        <span class="ux-pill ux-pill--${pct > esperado + 0.05 ? "bad" : pct > esperado ? "warn" : "ok"}">${N.fmt.pct(pct)}</span></div>
      <div class="ux-progress ux-progress--lg ${pct > 1 ? "ux-progress--bad" : ""}"><i style="width:${Math.min(100, pct * 100)}%"></i></div>
      <div class="ux-legend" style="margin-top:10px"><span><i style="--c:var(--accent)"></i>Ejecutado</span><span>Lo esperado a hoy: ${N.fmt.pct(esperado)}</span><span>Este mes: ${esc(N.fmt.dineroCorto(r.mes))}</span></div>
    </section>`;
  }

  function tarjetaQuien() {
    if (N.usuario.get()) return "";
    const gente = window.PENDIENTES ? window.PENDIENTES.gente() : [];
    return `<section class="ux-card hy-quien">
      <div class="ux-card__head ux-card__head--tight"><div><h2 class="ux-card__title">${ic("usuario")}¿Quién está usando este equipo?</h2><p class="ux-card__sub">Tu nombre queda en lo que registres (novedades, pendientes, solicitudes). Solo se pregunta una vez.</p></div></div>
      <form class="hy-quien__f" data-hy-form="quien"><input class="ux-input" name="n" list="hyGente" placeholder="Escribe o elige tu nombre" required><datalist id="hyGente">${gente.map((n) => `<option value="${esc(n)}">`).join("")}</datalist><button class="ux-btn ux-btn--primary" type="submit">Guardar</button></form>
    </section>`;
  }

  // ------------------------------------------------------------------ vista
  function render() {
    const raiz = document.getElementById("hoyRoot");
    if (!raiz) return;
    const hoy = N.hoy();
    const t = N.turnoEnCurso();
    const dia = vista.dia || hoy;
    const regsHoy = regsDe(hoy).filter((r) => !vista.sede || r.s === vista.sede);
    const correctivos = regsHoy.filter((r) => r.tp === "Correctivo").length;
    const P = window.PENDIENTES;
    const ab = P ? P.abiertos().filter((p) => !vista.sede || !p.sede || p.sede === vista.sede) : [];
    const alta = ab.filter((p) => p.prioridad === "alta").length;
    let enMtto = 0, totalEq = 0;
    (vista.sede ? [vista.sede] : ["Sede 4", "Sede 2"]).forEach((s) => { const c = estadoEquipos(s); if (c) { enMtto += c["Mantenimiento"].length; totalEq += Object.values(c).reduce((a, l) => a + l.length, 0); } });
    const pres = window.PRESUPUESTO && window.PRESUPUESTO.resumen ? window.PRESUPUESTO.resumen() : null;
    const tareasHoy = typeof tasks !== "undefined" ? tasks.filter((x) => x.status !== "hecha" && x.remindNextAt && N.diaCO(x.remindNextAt) <= hoy).length : 0;

    raiz.innerHTML = `<div class="ux-page ux-seq">
      <div class="ux-head">
        <div class="ux-head__txt">
          <p class="ux-eyebrow">${ic(t.turno === "Día" ? "sol" : "luna")}${esc(N.fmt.fechaLarga(hoy).replace(/^./, (c) => c.toUpperCase()))} · turno de ${t.turno === "Día" ? "día" : "noche"} en curso</p>
          <h1 class="ux-title">${saludo()} <em>· así va el día</em></h1>
          <p class="ux-sub">Novedades, equipos parados, pendientes, almacén y presupuesto de las dos sedes. Toca cualquier cifra para ver el detalle.</p>
        </div>
        <div class="ux-head__acts">
          <div class="ux-seg" aria-label="Sede">${["", "Sede 4", "Sede 2"].map((s) => `<button type="button" class="${vista.sede === s ? "is-on" : ""}" data-hy="sede" data-v="${s}">${s || "Las dos"}</button>`).join("")}</div>
          <a class="ux-btn ux-btn--primary" href="reporte.html">${ic("formulario")}Reporte de turno</a>
        </div>
      </div>

      ${tarjetaQuien()}

      <div class="ux-grid ux-grid--5 ux-grid--kpi">
        ${kpi({ n: regsHoy.length, titulo: "Novedades hoy", pie: `${correctivos} correctivas · ${regsHoy.length - correctivos} otras`, ico: "registro", tono: "ux-kpi--dark", go: "registro", goQ: hoy })}
        ${kpi({ n: enMtto, unidad: `de ${totalEq}`, titulo: "Equipos en mantenimiento", pie: "Estado del turno en curso", ico: "llave", tono: enMtto ? "ux-kpi--bad" : "ux-kpi--ok", go: "estados" })}
        ${kpi({ n: ab.length, titulo: "Pendientes abiertos", pie: `<span class="ux-pill ux-pill--bad"><i></i>${alta} prioridad alta</span>`, ico: "pendientes", tono: "ux-kpi--warn", go: "pendientes" })}
        ${kpi({ n: tareasHoy, titulo: "Tareas para hoy", pie: "Con aviso vencido o de hoy", ico: "tareas", tono: "ux-kpi--vio", go: "tareas" })}
        ${pres && pres.total
          ? kpi({ n: Math.round((pres.ejecutado / pres.total) * 1000) / 10, dec: 1, unidad: "%", titulo: "Presupuesto ejecutado", pie: `${esc(N.fmt.dineroCorto(pres.disponible))} disponibles`, ico: "presupuesto", tono: "ux-kpi--acc", go: "presupuesto" })
          : kpi({ n: 0, titulo: "Presupuesto", pie: "Sin configurar · tócalo para empezar", ico: "presupuesto", tono: "ux-kpi--acc", go: "presupuesto-config" })}
      </div>

      <div class="ux-grid ux-grid--main">
        <section class="ux-card">
          <div class="ux-card__head">
            <div><h2 class="ux-card__title">${ic("reloj")}${dia === hoy ? "Lo que va del día" : "Novedades del " + esc(N.fmt.fecha(dia))}</h2><p class="ux-card__sub">Novedades por día en las últimas dos semanas; toca una barra para ver ese día</p></div>
            <div class="ux-card__acts">${dia !== hoy ? `<button class="ux-btn ux-btn--sm" type="button" data-hy="dia" data-v="">Hoy</button>` : ""}<button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="registro" data-v="${dia}">Registro ${ic("der", "ic--sm")}</button></div>
          </div>
          ${barrasDias(hoy)}
          <hr class="ux-divider" style="margin:14px 0 6px">
          ${lineaTiempo(dia)}
        </section>
        <div class="ux-stack">
          ${tarjetaTurno()}
          ${tarjetaParados()}
        </div>
      </div>

      <div class="ux-grid ux-grid--3">
        ${tarjetaPendientes()}
        ${tarjetaFallas()}
        <div class="ux-stack">${tarjetaAlmacen()}${tarjetaPresupuesto()}</div>
      </div>
    </div>`;
    window.SHELL?.animarNumeros(raiz);
  }

  function enlazar() {
    const raiz = document.getElementById("hoyRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-hy]");
      if (!b) return;
      const a = b.dataset.hy;
      const v = b.dataset.v;
      if (a === "sede") { vista.sede = v; render(); }
      else if (a === "dia") { vista.dia = v; render(); }
      else if (a === "registro") window.goRegistro?.({ fecha: v || b.dataset.q || N.hoy() });
      else if (a === "reg") window.goRegistro?.({ abrir: b.dataset.id });
      else if (a === "nueva") window.goRegistro?.({ nueva: true });
      else if (a === "rep") window.goReportes?.(b.dataset.id);
      else if (a === "estados") { window.goRegistro?.({ fecha: N.hoy() }); setTimeout(() => document.querySelector('[data-mt="tab"][data-v="estados"]')?.click(), 60); }
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
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    raiz.addEventListener("submit", (e) => {
      const f = e.target.closest('[data-hy-form="quien"]');
      if (!f) return;
      e.preventDefault();
      const n = new FormData(f).get("n").toString().trim();
      if (!n) return;
      N.usuario.set(n);
      window.SHELL?.toast(`Listo, ${esc(n.split(" ")[0])}. Tu nombre quedará en lo que registres.`);
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
  window.HOY = { reporteDe, estadoEquipos };
  views.hoy = document.getElementById("hoyView");
})();
