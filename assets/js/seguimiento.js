// ============================================================================
//  SEGUIMIENTO DEL MANTENIMIENTO: de la inspección al cambio hecho
// ============================================================================
//  El flujo del taller, de principio a fin:
//    1. Se inspecciona un equipo (uno al día, más o menos) con la lista de qué
//       revisar que sale de su manual.
//    2. Lo que se encuentra queda como hallazgos: una pieza para cambiar, algo
//       mecánico, eléctrico, desgaste… Lo menor se resuelve ahí mismo.
//    3. Para cada pieza se mira si hay en almacén; si no, se pide.
//    4. Lo mayor se programa para un día de mantenimiento.
//    5. Se hace, y cada pieza cambiada queda en el historial de cambios, que es
//       de donde sale cada cuánto hay que volver a cambiarla.
//
//  No guarda nada aparte: todo sale de las inspecciones (con sus hallazgos),
//  las solicitudes de almacén y los cambios registrados. Lo único que escribe
//  es en la propia inspección: la fecha programada, qué hallazgo se hizo y si
//  se cierra.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);
  const TIPOS = { pieza: "Pieza", mecanica: "Mecánica", electrica: "Eléctrica", desgaste: "Desgaste", otro: "Otro" };
  const ETAPAS = { repuesto: "Esperando repuesto", listo: "Listo para intervenir", programado: "Programado", hecho: "Hecho" };
  const vista = { etapa: "", abiertos: new Set() };

  // ----------------------------------------------------------- equipos
  const planEquipos = () => (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || [];
  const planEq = (cod) => planEquipos().find((e) => e.c === cod);
  const nombreEq = (cod) => { const e = planEq(cod); return e ? e.n : cod; };
  function fichaDe(cod) {
    if (typeof machines === "undefined") return null;
    return machines.find((m) => { const e = typeof equipoDeMachine === "function" ? equipoDeMachine(m) : null; return (e && e.c === cod) || m.equipoCod === cod; }) || null;
  }
  // Nombre del equipo en el Registro diario ("Blister 2") -> código del plan
  function codDeNombre(nombre) {
    const cat = window.MTTO && window.MTTO.catalogo ? window.MTTO.catalogo.equipos.find((x) => x.eq === nombre) : null;
    if (!cat || !cat.fi || typeof machines === "undefined") return "";
    const m = machines.find((x) => x.id === cat.fi);
    const e = m && typeof equipoDeMachine === "function" ? equipoDeMachine(m) : null;
    return (e && e.c) || (m && m.equipoCod) || "";
  }

  // ----------------------------------------------------- cada hallazgo
  function existencia(cod) {
    const inv = window.INVENTARIO;
    if (!cod || !inv || !inv.cargado) return null;
    const a = inv.de(inv.norm(cod));
    return a ? Number(a.exist) || 0 : 0;
  }
  // Una solicitud de almacén hecha después de la inspección que lleva esa pieza
  function solicitudDe(cod, desde) {
    const inv = window.INVENTARIO;
    const norm = (c) => (inv ? inv.norm(c) : String(c || "").trim());
    const sols = window.almSolicitudes ? window.almSolicitudes() : [];
    return sols.filter((s) => s && s.fecha >= desde && ["emitida", "entregada"].includes(s.estado || "emitida") && (s.lineas || []).some((l) => norm(l.cod) === norm(cod)))
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))[0] || null;
  }
  // Hecho: marcado en el seguimiento, o hay un cambio registrado de esa pieza después de la inspección
  const todosLosCambios = () => (typeof cambiosEventos === "function" ? cambiosEventos() : typeof cambios !== "undefined" ? cambios : []);
  function hechoDe(i, p) {
    if (p.hecho) return p.hecho;
    if (!p.cod) return "";
    // Solo cuenta un cambio posterior a la inspección, o uno registrado desde ella:
    // el mismo día pueden haberse cambiado otras posiciones con el mismo código
    // (las correas de la Blister 2 del 3 de septiembre) y esta seguir pendiente.
    const c = todosLosCambios().filter((x) => x && !x.marca && x.eq === i.eq && x.cod === p.cod && (x.fecha > i.fecha || x.insp === i.id)).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))[0];
    return c ? c.fecha : "";
  }
  function estadoHallazgo(i, p) {
    const hecho = hechoDe(i, p);
    if (hecho) return { k: "hecho", txt: `Hecho el ${N.fmt.corta(hecho)}`, hecho };
    const esPieza = !!p.cod || (p.tipo || "pieza") === "pieza";
    if (!esPieza) return { k: "listo", txt: "No necesita repuesto" };
    const sol = p.cod ? solicitudDe(p.cod, i.fecha) : null;
    if (sol && sol.estado === "entregada") return { k: "listo", txt: "Almacén lo entregó", sol };
    if (sol) return { k: "pedido", txt: `Pedido el ${N.fmt.corta(sol.fecha)}`, sol };
    if (!p.cod) return { k: "revisar", txt: "Falta el código para buscarlo" };
    const n = existencia(p.cod);
    if (n === null) return { k: "revisar", txt: "Sin inventario cargado" };
    if (n > 0) return { k: "listo", txt: `Hay ${N.fmt.num(n)} en almacén` };
    return { k: "falta", txt: "No hay en almacén" };
  }

  // ----------------------------------------------------- cada trabajo
  // Un trabajo es una inspección con sus hallazgos, y su etapa sale de ellos.
  function trabajos() {
    const hace30 = N.sumaDias(N.hoy(), -30);
    return (typeof inspecciones !== "undefined" ? inspecciones : []).filter(Boolean).map((i) => {
      const hs = (i.piezas || []).map((p, idx) => ({ p, idx, e: estadoHallazgo(i, p) }));
      const pend = hs.filter((h) => h.e.k !== "hecho");
      const cerrada = (i.estado || "abierta") === "cerrada";
      let etapa;
      if ((hs.length && !pend.length) || cerrada) etapa = "hecho";
      else if (i.programado) etapa = "programado";
      else if (pend.some((h) => ["falta", "pedido", "revisar"].includes(h.e.k))) etapa = "repuesto";
      else etapa = "listo";
      const ultimo = hs.map((h) => h.e.hecho || "").sort().pop() || i.fecha;
      return { i, hs, pend, etapa, cerrada, ultimo };
    // Solo las inspecciones con hallazgos son trabajos; las hechas se ven 30 días
    }).filter((t) => t.hs.length && (t.etapa !== "hecho" || t.ultimo >= hace30))
      .sort((a, b) => (a.i.programado || "9999").localeCompare(b.i.programado || "9999") || String(b.i.fecha).localeCompare(String(a.i.fecha)));
  }

  // --------------------------------------- qué equipo inspeccionar hoy
  // Los que más fallan últimamente y hace más que no se inspeccionan
  function sugerencias() {
    const hoy = N.hoy();
    const S = window.MTTO_STORE;
    const fallas = new Map();
    if (S) S.registros().filter((r) => r && !r.borrado && r.f >= N.sumaDias(hoy, -14) && r.cat === "Máquina" && r.tp === "Correctivo")
      .forEach((r) => { const c = codDeNombre(r.eq); if (c) fallas.set(c, (fallas.get(c) || 0) + 1); });
    const ultimaInsp = new Map();
    (typeof inspecciones !== "undefined" ? inspecciones : []).forEach((i) => { if (i && i.eq && (!ultimaInsp.has(i.eq) || i.fecha > ultimaInsp.get(i.eq))) ultimaInsp.set(i.eq, i.fecha); });
    const abiertas = new Set(trabajos().filter((t) => t.etapa !== "hecho").map((t) => t.i.eq));
    return [...fallas.entries()].filter(([c]) => !abiertas.has(c)).map(([c, n]) => {
      const u = ultimaInsp.get(c);
      const dias = u ? N.diasEntre(u, hoy) : 999;
      return { c, n, u, puntos: n * 3 + Math.min(dias, 90) / 10 };
    }).sort((a, b) => b.puntos - a.puntos).slice(0, 3);
  }

  // ------------------------------------------------------------ pintar
  // Lo que se cambió en ese equipo desde la inspección (o desde unos días antes:
  // lo que se cambió en la misma parada se anota a veces con fecha del día previo)
  function cambiosDesde(eq, fecha) {
    const desde = N.sumaDias(fecha, -2);
    return todosLosCambios().filter((c) => c && c.eq === eq && c.fecha >= desde && c.cod)
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  }
  // En qué posición de la máquina fue un cambio (sellado, troqueladora…)
  function posicionDe(c) {
    if (c.ubicacion) return c.ubicacion;
    if (!c.ubic) return "";
    for (const g of window.COMPONENTES_SEGUIDOS || []) { const it = (g.items || []).find((x) => x.id === c.ubic); if (it) return it.ubicacion || ""; }
    return "";
  }
  const parrafos = (txt) => String(txt || "").split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => `<p>${esc(l)}</p>`).join("");

  // Todo lo de un trabajo en una tarjeta: lo que dijo la inspección, lo que
  // se cambió, lo que falta (con su repuesto), qué pedir y el cuadro de piezas
  // del equipo por posición. Es la misma en el Seguimiento y en la ficha.
  // op.cuadro: incluir el cuadro por posición (la ficha ya lo muestra arriba).
  function htmlTrabajo(t, op = {}) {
    const { i, hs, pend, etapa } = t;
    const conCuadro = op.cuadro !== false;
    const listos = hs.filter((h) => h.e.k === "listo" || h.e.k === "hecho").length;
    const paso = (on, hecho, txt, sub) => `<li class="${hecho ? "is-hecho" : on ? "is-on" : ""}"><i>${hecho ? ic("check", "ic--sm") : ""}</i><span><b>${txt}</b>${sub ? `<small>${sub}</small>` : ""}</span></li>`;
    const faltan = hs.filter((h) => h.e.k === "falta");
    const hechos = cambiosDesde(i.eq, i.fecha);
    const cuadro = conCuadro && typeof compBloques === "function" ? compBloques(i.eq) : "";
    const abierto = op.abierto || vista.abiertos.has(i.id);

    const fila = (h) => `<li class="sg-h is-${h.e.k}">
        <span class="sg-h__tipo">${esc(TIPOS[h.p.tipo || "pieza"] || "Pieza")}</span>
        <span class="sg-h__txt"><b>${esc(h.p.d || h.p.cod || "Hallazgo")}</b><small>${[h.p.cod, h.p.q ? `${h.p.q} und.` : "", h.p.urgencia === "alta" ? "cambiar ya" : ""].filter(Boolean).map(esc).join(" · ")}</small></span>
        <span class="sg-h__est is-${h.e.k}"><i></i>${esc(h.e.txt)}</span>
        <span class="sg-h__acc">
          ${h.e.k === "falta" || h.e.k === "revisar" ? `<button class="ux-btn ux-btn--sm" type="button" data-sg="pedir" data-id="${esc(i.id)}" data-i="${h.idx}">Pedir</button>` : ""}
          ${h.e.sol ? `<button class="ux-btn ux-btn--sm" type="button" data-sg="sol" data-v="${esc(h.e.sol.id)}">Ver pedido</button>` : ""}
          ${h.e.k !== "hecho" ? `<button class="ux-btn ux-btn--sm" type="button" data-sg="hecho" data-id="${esc(i.id)}" data-i="${h.idx}">${ic("check", "ic--sm")}Hecho</button>`
            : h.p.hecho ? `<button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-sg="deshacer" data-id="${esc(i.id)}" data-i="${h.idx}">Deshacer</button>` : ""}
        </span>
      </li>`;

    return `<article class="sg-card is-${etapa}" id="sg-${esc(i.id)}">
      <header class="sg-card__head">
        <div>
          <h3>${op.sinEquipo ? `Trabajo de la inspección del ${esc(N.fmt.corta(i.fecha))}` : `<button type="button" class="sg-eq" data-sg="ficha" data-v="${esc(i.eq)}">${esc(nombreEq(i.eq))}</button>`}</h3>
          <p>${op.sinEquipo ? "" : `Inspección del ${esc(N.fmt.corta(i.fecha))}`}${i.quien ? `${op.sinEquipo ? "" : " · "}${esc(i.quien)}` : ""}</p>
        </div>
        <span class="sg-etapa is-${etapa}">${ETAPAS[etapa]}</span>
      </header>
      <ol class="sg-pasos">
        ${paso(false, true, "Inspeccionado", N.fmt.corta(i.fecha))}
        ${paso(etapa === "repuesto", etapa !== "repuesto", "Repuestos", hs.length ? `${listos} de ${hs.length} listos` : "")}
        ${paso(etapa === "listo", !!i.programado || etapa === "hecho", "Programado", i.programado ? N.fmt.corta(i.programado) : "")}
        ${paso(false, etapa === "hecho", "Hecho", etapa === "hecho" ? N.fmt.corta(t.ultimo) : pend.length ? `faltan ${pend.length}` : "")}
      </ol>

      <div class="sg-bloques">
        <section class="sg-bloque">
          <h4>Lo que dice la inspección</h4>
          ${i.hallazgos || i.revisado ? `<div class="sg-texto">${i.hallazgos ? parrafos(i.hallazgos) : ""}${i.revisado ? `<p class="sg-texto__rev"><b>Se revisó:</b> ${esc(String(i.revisado).replace(/\n+/g, " · "))}</p>` : ""}</div>`
            : `<p class="sg-vacio">Sin notas. <button class="ux-link" type="button" data-sg="editar" data-id="${esc(i.id)}">Completar la inspección</button></p>`}
        </section>
        <section class="sg-bloque">
          <h4>Lo que se cambió <span>${hechos.length}</span></h4>
          ${hechos.length ? `<ul class="sg-cambios">${hechos.map((c) => { const pos = posicionDe(c); return `<li><span class="sg-cambios__f">${esc(N.fmt.corta(c.fecha))}</span><span><b>${esc(pos || c.d || c.cod)}</b><small>${[pos ? c.d : "", c.cod, c.q ? `${c.q} und.` : "", c.quien].filter(Boolean).map(esc).join(" · ")}</small></span></li>`; }).join("")}</ul>`
            : '<p class="sg-vacio">Todavía no hay cambios registrados desde esta inspección.</p>'}
        </section>
      </div>

      <section class="sg-bloque">
        <h4>Lo que falta hacer <span>${pend.length}</span></h4>
        ${hs.length ? `<ul class="sg-hs">${hs.slice().sort((a, b) => (a.e.k === "hecho") - (b.e.k === "hecho")).map(fila).join("")}</ul>`
          : `<p class="sg-vacio">No se anotaron hallazgos. <button class="ux-link" type="button" data-sg="editar" data-id="${esc(i.id)}">Agregar hallazgos</button></p>`}
        ${faltan.length ? `<div class="sg-pedir"><span>${ic("almacen", "ic--sm")}<b>${faltan.length}</b> ${faltan.length === 1 ? "pieza no hay" : "piezas no hay"} en almacén</span><button class="ux-btn ux-btn--sm ux-btn--primary" type="button" data-sg="pedir-todo" data-id="${esc(i.id)}">Pedir ${faltan.length === 1 ? "la pieza" : `las ${faltan.length}`} en una solicitud</button></div>` : ""}
      </section>

      ${cuadro ? `<details class="sg-cuadro" ${abierto ? "open" : ""} data-sg-det="${esc(i.id)}"><summary>Piezas del equipo por posición</summary><div class="sg-cuadro__in">${cuadro}</div></details>` : ""}

      <footer class="sg-card__pie">
        ${etapa !== "hecho" ? `<label class="sg-prog">${ic("calendario", "ic--sm")}Día del mantenimiento<input type="date" data-sg="programar" data-id="${esc(i.id)}" value="${esc(i.programado || "")}" aria-label="Día del mantenimiento"></label>` : ""}
        <span class="sg-pie__acc">
          <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-sg="editar" data-id="${esc(i.id)}">Editar inspección</button>
          ${!t.cerrada && hs.length && !pend.length ? `<button class="ux-btn ux-btn--sm ux-btn--primary" type="button" data-sg="cerrar" data-id="${esc(i.id)}">Cerrar trabajo</button>` : ""}
        </span>
      </footer>
    </article>`;
  }

  function render() {
    const raiz = document.getElementById("sgRoot");
    if (!raiz) return;
    const todos = trabajos();
    const cuenta = (k) => todos.filter((t) => t.etapa === k).length;
    // "Abiertos": lo que falta por hacer y lo ya hecho que nadie ha cerrado todavía
    const abierto = (t) => t.etapa !== "hecho" || !t.cerrada;
    const lista = todos.filter((t) => (vista.etapa ? t.etapa === vista.etapa : abierto(t)));
    const sug = sugerencias();
    raiz.innerHTML = `
      <div class="section-bar">
        <div><h2>Seguimiento del mantenimiento</h2></div>
        <div class="section-actions"><button class="button button--dark" type="button" data-sg="nueva">${ic("mas", "ic--sm")} Nueva inspección</button></div>
      </div>
      ${sug.length ? `<section class="sg-hoy">
        <h3>${ic("insp")}Para inspeccionar hoy</h3>
        <div class="sg-hoy__lista">${sug.map((s) => `<button type="button" class="sg-sug" data-sg="inspeccionar" data-v="${esc(s.c)}">
          <b>${esc(nombreEq(s.c))}</b>
          <small>${s.n} ${s.n === 1 ? "falla" : "fallas"} en 14 días · ${s.u ? `última inspección el ${esc(N.fmt.corta(s.u))}` : "nunca inspeccionado"}</small>
          <span>Inspeccionar ${ic("der", "ic--sm")}</span>
        </button>`).join("")}</div>
      </section>` : ""}
      <div class="sg-etapas" role="tablist">
        <button type="button" class="${!vista.etapa ? "is-on" : ""}" data-sg="etapa" data-v=""><b>${todos.filter(abierto).length}</b>Abiertos</button>
        ${Object.entries(ETAPAS).map(([k, t]) => `<button type="button" class="${vista.etapa === k ? "is-on" : ""} is-${k}" data-sg="etapa" data-v="${k}"><b>${cuenta(k)}</b>${t}${k === "hecho" ? " (30 días)" : ""}</button>`).join("")}
      </div>
      ${lista.length ? `<div class="sg-lista">${lista.map(htmlTrabajo).join("")}</div>`
        : `<div class="ux-empty"><span class="ux-empty__ico">${ic("check")}</span><h4>${vista.etapa ? "Nada en esta etapa" : "No hay trabajos abiertos"}</h4><p>Cada inspección con hallazgos aparece aquí hasta que se hace todo.</p></div>`}`;
    insignias(todos);
  }

  function insignias(todos = trabajos()) {
    const n = todos.filter((t) => t.etapa !== "hecho" || !t.cerrada).length;
    window.SHELL?.insignia("sbMtto", n);
    window.SHELL?.insignia("mbMtto", n);
  }

  // ----------------------------------------------------------- acciones
  const inspDe = (id) => (typeof inspecciones !== "undefined" ? inspecciones.find((x) => x.id === id) : null);
  function guardar() { if (typeof saveInsp === "function") saveInsp(); repintar(); window.renderInspIfVisible?.(); }

  // Hecho: si es una pieza con código, además queda en el historial de cambios
  function marcarHecho(i, idx) {
    const p = (i.piezas || [])[idx];
    if (!p) return;
    const hoy = N.hoy();
    p.hecho = hoy;
    let cambio = null;
    if (p.cod && typeof cambios !== "undefined") {
      cambio = { id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), eq: i.eq, cod: p.cod, d: p.d || "", fecha: hoy,
        q: parseInt(p.q, 10) || 1, quien: N.usuario.get() || "", nota: `Hallazgo de la inspección del ${i.fecha}`, insp: i.id, createdAt: new Date().toISOString() };
      cambios.push(cambio);
      if (typeof saveCambios === "function") saveCambios();
    }
    i.editadoAt = new Date().toISOString();
    guardar();
    window.SHELL?.toast(`Hecho: <b>${esc(p.d || p.cod)}</b>${cambio ? " · quedó en el historial de cambios" : ""}`, { accion: { txt: "Deshacer", fn: () => deshacer(i.id, idx, cambio && cambio.id) } });
  }
  // Se busca la inspección por id: la nube puede haber reemplazado el objeto
  // entre el "Hecho" y el "Deshacer".
  function deshacer(idInsp, idx, idCambio) {
    const i = inspDe(idInsp);
    const p = i && (i.piezas || [])[idx];
    if (!p) return;
    delete p.hecho;
    // El cambio que registró este seguimiento (el de hoy de esa inspección) también se quita
    if (typeof cambios !== "undefined") {
      const antes = cambios.length;
      cambios = cambios.filter((c) => !(c && (c.id === idCambio || (!idCambio && c.insp === i.id && c.cod === p.cod))));
      if (cambios.length !== antes && typeof saveCambios === "function") saveCambios();
    }
    guardar();
  }

  function repintar() { render(); if (typeof renderFichaSiVisible === "function") renderFichaSiVisible(); }
  let enlazado = false;
  function enlazar() {
    if (enlazado) return;
    enlazado = true;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("#sgRoot [data-sg], .sg-card [data-sg]");
      if (!b || b.tagName === "INPUT") return;
      const a = b.dataset.sg;
      const i = b.dataset.id ? inspDe(b.dataset.id) : null;
      if (a === "etapa") { vista.etapa = b.dataset.v; render(); }
      else if (a === "nueva") window.inspAbrirForm?.();
      else if (a === "inspeccionar") window.inspAbrirForm?.(b.dataset.v);
      else if (a === "editar" && i) window.inspEditar?.(i.id);
      else if (a === "ficha") { const f = fichaDe(b.dataset.v); if (f) window.openDetail?.(f.id); else window.goPlan?.(b.dataset.v); }
      else if (a === "sol") window.goSolicitudes?.({ solicitud: b.dataset.v });
      else if (a === "pedir" && i) {
        const p = (i.piezas || [])[+b.dataset.i];
        window.goAlmacen?.({ q: (p && (p.cod || p.d)) || "", destino: nombreEq(i.eq), nota: `Inspección del ${i.fecha}` });
      }
      else if (a === "pedir-todo" && i) {
        const faltan = (i.piezas || []).filter((p) => p.cod && estadoHallazgo(i, p).k === "falta");
        window.almPedirVarias?.({ lineas: faltan.map((p) => ({ cod: p.cod, cant: parseInt(p.q, 10) || 1, desc: p.d })), destino: nombreEq(i.eq), nota: `Inspección del ${i.fecha}` });
      }
      else if (a === "hecho" && i) marcarHecho(i, +b.dataset.i);
      else if (a === "deshacer" && i) deshacer(i.id, +b.dataset.i);
      else if (a === "cerrar" && i) { i.estado = "cerrada"; i.editadoAt = new Date().toISOString(); guardar(); window.SHELL?.toast("Trabajo cerrado"); }
    });
    document.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.sg !== "programar") return;
      const i = inspDe(t.dataset.id);
      if (!i) return;
      if (t.value) i.programado = t.value; else delete i.programado;
      i.editadoAt = new Date().toISOString();
      guardar();
      if (t.value) window.SHELL?.toast(`Mantenimiento de ${esc(nombreEq(i.eq))} programado para el ${esc(N.fmt.corta(t.value))}`);
    });
    // Recordar qué cuadros de piezas quedaron abiertos al repintar
    document.addEventListener("toggle", (e) => {
      const d = e.target;
      if (!d.dataset || !d.dataset.sgDet) return;
      if (d.open) vista.abiertos.add(d.dataset.sgDet); else vista.abiertos.delete(d.dataset.sgDet);
    }, true);
  }

  function esVisible() { return document.getElementById("seguimientoView")?.classList.contains("is-active"); }
  let t = null;
  function renderSiVisible() { clearTimeout(t); t = setTimeout(() => { if (esVisible()) render(); else insignias(); }, 150); }

  function goSeguimiento(op) {
    views.seguimiento = views.seguimiento || document.getElementById("seguimientoView");
    if (op && op.etapa !== undefined) vista.etapa = op.etapa;
    setView("seguimiento");
    render();
    enlazar();
    saveUiState({ activeView: "seguimiento" });
    window.scrollTo({ top: 0, behavior: "auto" });
    // La misma tarjeta puede estar también en una ficha: se busca dentro del Seguimiento
    if (op && op.id) setTimeout(() => document.querySelector(`#sgRoot [id="${CSS.escape("sg-" + op.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }

  window.goSeguimiento = goSeguimiento;
  window.segRenderSiVisible = renderSiVisible;
  window.SEGUIMIENTO = { trabajos, estadoHallazgo, sugerencias, nombreEq, htmlTrabajo, enlazar };
  views.seguimiento = document.getElementById("seguimientoView");
  enlazar();
  window.addEventListener("DOMContentLoaded", () => setTimeout(insignias, 1500));
})();
