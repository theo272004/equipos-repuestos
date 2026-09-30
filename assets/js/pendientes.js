// ============================================================================
//  PENDIENTES Y SEGUIMIENTO
// ============================================================================
//  Antes lo abierto estaba repartido: una falla "queda pendiente" en el chat,
//  una tarea en Tareas, piezas marcadas en una inspección, una solicitud de
//  almacén sin entregar. Aquí se junta todo en un solo tablero:
//
//    Registro diario  -> novedades con estado "Pendiente", "Operativo con
//                        pendiente", falta de repuesto, o cuyo texto dice
//                        "queda pendiente", "se requiere", "no se pudo"…
//    Tareas           -> las que no están hechas
//    Inspecciones     -> abiertas con piezas por cambiar
//    Almacén          -> solicitudes pedidas y aún sin entregar
//    Anotados aquí    -> lo que alguien apunta directamente en el tablero
//
//  El estado de cada uno (por atender, en curso, esperando repuesto, resuelto),
//  quién lo lleva y las notas se guardan en la colección "seguimiento", sin
//  tocar el registro original. Si más tarde el mismo equipo aparece "operativo"
//  en el registro, se sugiere cerrarlo ("¿Ya se resolvió?").
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);
  const SEG = N.coleccion("seguimiento", { prefijo: "p" });

  const ESTADOS = [
    { id: "abierto", t: "Por atender", c: "var(--bad)" },
    { id: "curso", t: "En curso", c: "var(--accent)" },
    { id: "espera", t: "Esperando repuesto", c: "var(--warn)" },
    { id: "cerrado", t: "Resuelto", c: "var(--ok)" },
  ];
  const ESTADO_TXT = Object.fromEntries(ESTADOS.map((e) => [e.id, e.t]));
  const ORIGEN = {
    registro: { t: "Registro diario", ico: "registro", tono: "bad" },
    tarea: { t: "Tarea", ico: "tareas", tono: "vio" },
    inspeccion: { t: "Inspección", ico: "insp", tono: "info" },
    solicitud: { t: "Almacén", ico: "almacen", tono: "ok" },
    manual: { t: "Anotado aquí", ico: "editar", tono: "acc" },
  };
  const PRIORIDAD = { alta: { t: "Alta", tono: "bad" }, media: { t: "Media", tono: "warn" }, baja: { t: "Baja", tono: "" } };
  const DIAS_ANTIGUO = 30;

  // Las reglas de texto y cómo se convierte una novedad en pendiente viven en
  // assets/js/reglas-pendientes.js (las comparte el bot de Telegram).
  const { RE_PEND, RE_REP, RE_OK, tituloDe, desdeRegistros, genericos, sinFicha } = window.REGLAS_PEND;

  // --------------------------------------------------------- las fuentes
  const catalogo = () => (window.MTTO && window.MTTO.catalogo && window.MTTO.catalogo.equipos) || [];
  function fichaDe(eq, sede) {
    const e = catalogo().find((x) => x.eq === eq && (!sede || x.s === sede)) || catalogo().find((x) => x.eq === eq);
    const fi = e && e.fi;
    return fi && typeof machines !== "undefined" && machines.some((m) => m.id === fi) ? fi : "";
  }

  function desdeRegistro() {
    const S = window.MTTO_STORE;
    return S ? desdeRegistros(S.registros()) : [];
  }

  function desdeTareas() {
    if (typeof tasks === "undefined") return [];
    return tasks.filter((t) => t && t.id).map((t) => {
      const hecha = t.status === "hecha";
      const falta = /^falta pieza/i.test(t.title || "");
      return {
        id: `tar:${t.id}`,
        origen: "tarea",
        ref: t.id,
        titulo: t.title || "Tarea",
        detalle: [t.desc, (t.steps || []).length ? `${(t.steps || []).filter((s) => s.done).length}/${t.steps.length} pasos` : ""].filter(Boolean).join(" · "),
        eq: t.machine ? (typeof taskMachineName === "function" ? taskMachineName(t.machine) : t.machineName || "") : "",
        fichaId: t.machine || "",
        sede: "",
        fecha: N.diaCO(t.createdAt) || "",
        por: t.reporter || "",
        prioridad: { Alta: "alta", Media: "media", Baja: "baja" }[t.priority] || "media",
        estadoBase: hecha ? "cerrado" : falta ? "espera" : t.status === "en-progreso" ? "curso" : "abierto",
        cerradoEn: hecha ? N.diaCO(t.doneAt) : "",
        confianza: "alta",
        aviso: t.remindFreq && !hecha ? t.remindNextAt || "" : "",
      };
    });
  }

  function desdeInspecciones() {
    if (typeof inspecciones === "undefined") return [];
    return inspecciones.filter((i) => i && i.id && (i.piezas || []).length).map((i) => {
      const cerrada = i.estado === "cerrada";
      const urg = (i.piezas || []).some((p) => p.urgencia === "alta") ? "alta" : (i.piezas || []).some((p) => p.urgencia === "media") ? "media" : "baja";
      const nombre = typeof inspNombreEquipo === "function" ? inspNombreEquipo(i.eq) : i.eq;
      return {
        id: `insp:${i.id}`,
        origen: "inspeccion",
        ref: i.id,
        titulo: `Cambiar ${i.piezas.length} ${i.piezas.length === 1 ? "pieza" : "piezas"} en ${nombre}`,
        detalle: [i.hallazgos, (i.piezas || []).map((p) => `${p.desc || p.cod}${p.q ? " ×" + p.q : ""}`).join(", ")].filter(Boolean).join(" — "),
        eq: nombre || "",
        planCod: i.eq,
        sede: "",
        fecha: i.fecha || "",
        por: i.quien || "",
        prioridad: urg,
        estadoBase: cerrada ? "cerrado" : "espera",
        cerradoEn: cerrada ? i.fecha : "",
        confianza: "alta",
        repuesto: (i.piezas || []).map((p) => p.cod).filter(Boolean).join(", "),
      };
    });
  }

  function desdeSolicitudes() {
    const lista = window.almSolicitudes ? window.almSolicitudes() : [];
    return lista.filter((s) => s && s.id).map((s) => {
      const entregada = s.estado === "entregada" || s.estado === "anulada" || s.estado === "atendido";
      return {
        id: `sol:${s.id}`,
        origen: "solicitud",
        ref: s.id,
        titulo: `${s.estado === "pedido" ? "Pedido" : "Solicitud"} de ${(s.lineas || []).length} ${(s.lineas || []).length === 1 ? "artículo" : "artículos"}${s.destino ? " para " + s.destino : ""}`,
        detalle: (s.lineas || []).slice(0, 4).map((l) => `${l.desc || l.cod} ×${l.cant}`).join(", ") + ((s.lineas || []).length > 4 ? "…" : ""),
        eq: s.destino || "",
        sede: "",
        fecha: s.fecha || N.diaCO(s.createdAt) || "",
        por: s.solicitadoPor || s.por || "",
        prioridad: s.estado === "pedido" ? "alta" : "media",
        estadoBase: entregada ? "cerrado" : "espera",
        cerradoEn: entregada ? N.diaCO(s.entregadaEn || s.updatedAt) : "",
        confianza: "alta",
        repuesto: (s.lineas || []).map((l) => l.cod).join(", "),
      };
    });
  }

  function desdeManuales() {
    return SEG.lista().filter((d) => d.origen === "manual").map((d) => ({
      id: d.id,
      origen: "manual",
      ref: d.id,
      titulo: d.titulo || "Pendiente",
      detalle: d.detalle || "",
      eq: d.eq || "",
      sede: d.sede || "",
      fecha: d.fecha || N.diaCO(d.createdAt),
      por: d.creadoPor || d.por || "",
      prioridad: d.prioridad || "media",
      estadoBase: "abierto",
      confianza: "alta",
    }));
  }

  // ------------------------------------------------------- la lista final
  let cache = null;
  function calcular() {
    const hoy = N.hoy();
    const segs = new Map(SEG.lista().map((d) => [d.id, d]));
    const todos = [...desdeRegistro(), ...desdeTareas(), ...desdeInspecciones(), ...desdeSolicitudes(), ...desdeManuales()];
    todos.forEach((p) => {
      const s = segs.get(p.id) || (p.origen === "manual" ? segs.get(p.id) : null);
      p.seg = s || null;
      p.estado = (s && s.estado) || p.estadoBase;
      if (s && s.prioridad) p.prioridad = s.prioridad;
      p.responsable = (s && s.responsable) || "";
      if (p.estado === "cerrado" && !p.cerradoEn) p.cerradoEn = (s && N.diaCO(s.cerradoEn || s.updatedAt)) || p.fecha;
      p.edad = p.fecha ? Math.max(0, N.diasEntre(p.fecha, hoy)) : 0;
      p.antiguo = p.estado !== "cerrado" && p.edad > DIAS_ANTIGUO && !s;
      p.origenTxt = ORIGEN[p.origen].t;
      if (!p.fichaId) p.fichaId = p.eq && !sinFicha.test(p.eq) ? fichaDe(p.eqTxt || p.eq, p.sede) : "";
    });
    cache = todos;
    return todos;
  }
  function lista() { return cache || calcular(); }
  const abiertos = () => lista().filter((p) => p.estado !== "cerrado" && !p.antiguo);

  let t = null;
  function recalcular() {
    clearTimeout(t);
    t = setTimeout(() => {
      calcular();
      insignias();
      N.emitir("pendientes");
      if (esVisible()) render();
    }, 120);
  }
  function insignias() {
    const n = abiertos().length;
    window.SHELL?.insignia("sbPendientes", n);
    const tar = typeof tasks !== "undefined" ? tasks.filter((x) => x.status !== "hecha").length : 0;
    window.SHELL?.insignia("sbTareas", tar);
  }

  // Cambios en las fuentes: el registro avisa por su cuenta; tareas,
  // inspecciones y solicitudes repintan el Diario cuando cambian.
  window.MTTO_STORE?.alCambiar(recalcular);
  SEG.alCambiar(recalcular);
  (function engancharFuentes() {
    const d = window.diarioRenderSiVisible;
    window.diarioRenderSiVisible = function () { try { if (d) d.apply(this, arguments); } finally { recalcular(); } };
    ["renderTasks", "saveInsp"].forEach((fn) => {
      const o = window[fn];
      if (typeof o !== "function") return;
      window[fn] = function () { const r = o.apply(this, arguments); recalcular(); return r; };
    });
  })();

  // ---------------------------------------------------- cambiar el estado
  function ponerEstado(id, estado, nota) {
    const p = lista().find((x) => x.id === id);
    if (!p) return;
    const quien = N.usuario.get();
    // Las tareas llevan su propio estado: se sincroniza para que Tareas y el bot coincidan
    if (p.origen === "tarea" && typeof taskSetStatus === "function") {
      const st = { abierto: "pendiente", curso: "en-progreso", espera: "en-progreso", cerrado: "hecha" }[estado];
      if (st) taskSetStatus(p.ref, st);
    }
    if (p.origen === "inspeccion" && estado === "cerrado" && typeof inspCambiarEstado === "function") {
      const i = inspecciones.find((x) => x.id === p.ref);
      if (i && i.estado !== "cerrada") inspCambiarEstado(p.ref);
    }
    if (p.origen === "solicitud" && estado === "cerrado" && window.almMarcarEntregada) window.almMarcarEntregada(p.ref);
    const previo = SEG.get(id) || { id, origen: p.origen === "manual" ? "manual" : p.origen };
    const historial = [...(previo.historial || []), { t: new Date().toISOString(), estado, por: quien, nota: nota || "" }].slice(-30);
    SEG.guardar({ ...previo, id, estado, historial, cerradoEn: estado === "cerrado" ? new Date().toISOString() : "", ref: p.ref, titulo: previo.titulo || p.titulo, eq: previo.eq || p.eq, sede: previo.sede || p.sede });
    window.SHELL?.toast(`${esc(p.titulo.slice(0, 60))} → <b>${ESTADO_TXT[estado]}</b>`, { tipo: estado === "cerrado" ? "ok" : "ok", accion: { txt: "Deshacer", fn: () => ponerEstado(id, p.estado) } });
  }
  function guardarNota(id, nota, extra = {}) {
    const p = lista().find((x) => x.id === id);
    if (!p) return;
    const previo = SEG.get(id) || { id, origen: p.origen, estado: p.estado };
    const historial = nota ? [...(previo.historial || []), { t: new Date().toISOString(), estado: previo.estado || p.estado, por: N.usuario.get(), nota }].slice(-30) : previo.historial || [];
    SEG.guardar({ ...previo, ...extra, historial, ref: p.ref, titulo: previo.titulo || p.titulo, eq: previo.eq || p.eq });
  }
  function anotar({ titulo, detalle, eq, sede, prioridad }) {
    return SEG.guardar({ origen: "manual", titulo, detalle, eq, sede, prioridad: prioridad || "media", estado: "abierto", fecha: N.hoy(), creadoPor: N.usuario.get(), historial: [{ t: new Date().toISOString(), estado: "abierto", por: N.usuario.get(), nota: "Anotado" }] });
  }

  // ------------------------------------------------------------- la vista
  const vista = { modo: "tablero", q: "", sede: "", origen: "", filtro: "", antiguos: false, abierto: "", anotando: false };
  try { const m = localStorage.getItem("pd-modo"); if (m) vista.modo = m; } catch (e) {}

  function filtrados() {
    const q = N.plano(vista.q);
    const hoy = N.hoy();
    return lista().filter((p) => {
      if (p.estado === "cerrado" && (!p.cerradoEn || N.diasEntre(p.cerradoEn, hoy) > 7) && vista.filtro !== "cerrados") return false;
      if (p.antiguo && !vista.antiguos && vista.filtro !== "antiguos") return false;
      if (vista.filtro === "antiguos" && !p.antiguo) return false;
      if (vista.sede && p.sede && p.sede !== vista.sede) return false;
      if (vista.sede && !p.sede && p.origen === "registro") return false;
      if (vista.origen && p.origen !== vista.origen) return false;
      if (vista.filtro === "alta" && p.prioridad !== "alta") return false;
      if (vista.filtro === "espera" && p.estado !== "espera") return false;
      if (vista.filtro === "viejos" && !(p.edad > 7 && p.estado !== "cerrado")) return false;
      if (vista.filtro === "resueltos" && !(p.posibleCierre && p.estado !== "cerrado")) return false;
      if (q && !N.plano(`${p.titulo} ${p.detalle} ${p.eq} ${p.sede} ${p.por} ${p.responsable} ${p.origenTxt}`).includes(q)) return false;
      return true;
    }).sort((a, b) => ({ alta: 0, media: 1, baja: 2 }[a.prioridad] - { alta: 0, media: 1, baja: 2 }[b.prioridad]) || String(b.fecha).localeCompare(String(a.fecha)));
  }

  function tarjeta(p) {
    const o = ORIGEN[p.origen];
    const pr = PRIORIDAD[p.prioridad] || PRIORIDAD.media;
    const tono = p.estado !== "cerrado" && p.prioridad === "alta" ? "ux-tcard--bad" : p.estado !== "cerrado" && p.edad > 7 ? "ux-tcard--warn" : "";
    return `<button class="ux-tcard ${tono}" type="button" data-pd="abrir" data-id="${esc(p.id)}" draggable="true">
      <span class="ux-tcard__top">
        <span class="ux-pill ux-pill--${o.tono}">${ic(o.ico)}${esc(o.t)}</span>
        <span class="ux-small ux-mute" title="${esc(p.fecha)}">${p.estado === "cerrado" ? "resuelto" : p.edad === 0 ? "hoy" : `hace ${N.fmt.dias(p.edad)}`}</span>
      </span>
      <p class="ux-tcard__t">${esc(p.titulo)}</p>
      ${p.detalle && p.detalle !== p.titulo ? `<p class="ux-tcard__d">${esc(p.detalle)}</p>` : ""}
      ${p.posibleCierre && p.estado !== "cerrado" ? `<span class="pd-quiza">${ic("check", "ic--sm")}¿Ya se resolvió? ${esc(N.fmt.corta(p.posibleCierre.fecha))}</span>` : ""}
      <span class="ux-tcard__foot">
        <span>${ic("fabrica")}${esc(p.eq || "General")}${p.sede ? ` · ${esc(p.sede.replace("Sede ", "S"))}` : ""}</span>
        <span>${p.responsable ? `<span class="ux-av ux-av--${N.tono(p.responsable)}" title="${esc(p.responsable)}" style="width:22px;height:22px;font-size:9.5px;border:0">${esc(N.iniciales(p.responsable).toUpperCase())}</span>` : ""}<i class="pd-dot pd-dot--${p.prioridad}" title="Prioridad ${esc(pr.t)}"></i></span>
      </span>
    </button>`;
  }

  function kpis(todos) {
    const ab = todos.filter((p) => p.estado !== "cerrado" && !p.antiguo);
    const k = (id, n, t, s, ico, tono) => `<button class="ux-kpi ${tono} ${id && vista.filtro === id ? "is-sel" : ""}" type="button" data-pd="filtro" data-v="${id}">
      <span class="ux-kpi__top"><span class="ux-kpi__label"><span class="ux-kpi__ico">${ic(ico)}</span>${t}</span>${id && vista.filtro === id ? `<span class="ux-pill ux-pill--dark">Filtrado</span>` : `<span class="ux-kpi__go">${ic(id ? "filtro" : "flecha", "ic--sm")}</span>`}</span>
      <span class="ux-kpi__n" data-n="${n}">${N.fmt.num(n)}</span>
      <span class="ux-kpi__foot">${s}</span></button>`;
    const antiguos = todos.filter((p) => p.antiguo).length;
    return `<div class="ux-grid ux-grid--5 ux-grid--kpi">
      ${k("", ab.length, "Abiertos", `${ab.filter((p) => p.estado === "curso").length} en curso · ${ab.filter((p) => p.estado === "abierto").length} por atender`, "pendientes", "ux-kpi--dark")}
      ${k("alta", ab.filter((p) => p.prioridad === "alta").length, "Prioridad alta", "Máquina parada o falta un repuesto", "alerta", "ux-kpi--bad")}
      ${k("espera", ab.filter((p) => p.estado === "espera").length, "Esperando repuesto", "Piezas pedidas o por conseguir", "repuesto", "ux-kpi--warn")}
      ${k("viejos", ab.filter((p) => p.edad > 7).length, "Más de 7 días", "Conviene revisarlos en la reunión", "reloj", "ux-kpi--vio")}
      ${k("resueltos", ab.filter((p) => p.posibleCierre).length, "¿Ya resueltos?", "El registro muestra el equipo operativo después", "check", "ux-kpi--ok")}
    </div>
    ${antiguos && !vista.antiguos ? `<p class="ux-small ux-mute" style="margin:0">+${antiguos} del chat con más de ${DIAS_ANTIGUO} días sin seguimiento · <button class="ux-link" type="button" data-pd="antiguos">Revisarlos</button></p>` : ""}`;
  }

  function barraFiltros(todos) {
    const n = (o) => todos.filter((p) => p.origen === o && p.estado !== "cerrado" && (!p.antiguo || vista.antiguos)).length;
    return `<div class="pd-barra">
      <label class="ux-searchbox pd-buscar">${ic("buscar")}<input class="ux-input" type="search" data-pd-q value="${esc(vista.q)}" placeholder="Buscar por equipo, texto o persona…" aria-label="Buscar pendientes"></label>
      <div class="ux-seg" role="tablist" aria-label="Sede">${["", "Sede 4", "Sede 2"].map((s) => `<button type="button" class="${vista.sede === s ? "is-on" : ""}" data-pd="sede" data-v="${s}">${s || "Las dos sedes"}</button>`).join("")}</div>
      <div class="ux-seg" aria-label="Cómo ver">${[["tablero", "Tablero", "inicio"], ["lista", "Lista", "pendientes"]].map(([m, t, i]) => `<button type="button" class="${vista.modo === m ? "is-on" : ""}" data-pd="modo" data-v="${m}">${ic(i, "ic--sm")}${t}</button>`).join("")}</div>
    </div>
    <div class="ux-chips">
      <button type="button" class="ux-chip ${!vista.origen ? "is-on" : ""}" data-pd="origen" data-v="">Todo</button>
      ${Object.entries(ORIGEN).map(([k, o]) => `<button type="button" class="ux-chip ${vista.origen === k ? "is-on" : ""}" data-pd="origen" data-v="${k}">${ic(o.ico)}${o.t} <span class="ux-count">${n(k)}</span></button>`).join("")}
      ${vista.filtro || vista.antiguos ? `<button type="button" class="ux-chip" data-pd="limpiar">${ic("x")}Quitar filtros</button>` : ""}
    </div>`;
  }

  function tablero(items) {
    return `<div class="ux-board" data-pd-board>
      ${ESTADOS.map((e) => {
        const col = items.filter((p) => p.estado === e.id);
        return `<section class="ux-col" data-pd-col="${e.id}" style="--c:${e.c}">
          <header class="ux-col__head"><b><i></i>${e.t}</b><span class="ux-count">${col.length}</span></header>
          <div class="ux-col__body">${col.length ? col.slice(0, 60).map(tarjeta).join("") + (col.length > 60 ? `<p class="ux-small ux-mute" style="text-align:center">y ${col.length - 60} más: usa el buscador</p>` : "") : `<p class="pd-vacio">${e.id === "cerrado" ? "Lo resuelto en los últimos 7 días aparece aquí." : "Nada aquí."}</p>`}</div>
        </section>`;
      }).join("")}
    </div>`;
  }

  function tablaLista(items) {
    if (!items.length) return `<div class="ux-card"><div class="ux-empty"><span class="ux-empty__ico">${ic("check")}</span><h4>Nada pendiente con estos filtros</h4><p>Prueba quitando filtros o cambiando de sede.</p></div></div>`;
    return `<div class="ux-tablewrap"><table class="ux-table">
      <thead><tr><th>Pendiente</th><th>Equipo</th><th>Origen</th><th>Estado</th><th>Prioridad</th><th class="r">Días</th><th>Responsable</th></tr></thead>
      <tbody>${items.slice(0, 300).map((p) => `<tr data-pd="abrir" data-id="${esc(p.id)}" data-go-row>
        <td style="max-width:420px"><div class="ux-strong" style="white-space:normal">${esc(p.titulo)}</div>${p.posibleCierre && p.estado !== "cerrado" ? `<span class="pd-quiza">${ic("check", "ic--sm")}¿Ya se resolvió?</span>` : ""}</td>
        <td>${esc(p.eq || "General")}${p.sede ? `<div class="ux-small ux-mute">${esc(p.sede)}</div>` : ""}</td>
        <td><span class="ux-pill ux-pill--${ORIGEN[p.origen].tono}">${esc(p.origenTxt)}</span></td>
        <td>${esc(ESTADO_TXT[p.estado])}</td>
        <td><i class="pd-dot pd-dot--${p.prioridad}"></i> ${esc(PRIORIDAD[p.prioridad].t)}</td>
        <td class="r">${p.edad}</td>
        <td>${esc(p.responsable || "—")}</td>
      </tr>`).join("")}</tbody></table></div>`;
  }

  // Hoja de detalle: todo lo del pendiente y lo que se puede hacer con él
  function hoja(p) {
    const o = ORIGEN[p.origen];
    const personas = gente();
    const hist = (p.seg && p.seg.historial) || [];
    return `<div class="ux-backdrop" data-pd="cerrar"></div>
    <aside class="ux-sheet" role="dialog" aria-label="Pendiente">
      <header class="ux-sheet__head">
        <div style="min-width:0">
          <div class="ux-chips" style="margin-bottom:8px"><span class="ux-pill ux-pill--${o.tono}">${ic(o.ico)}${esc(o.t)}</span><span class="ux-pill ux-pill--${PRIORIDAD[p.prioridad].tono || "line"}"><i></i>Prioridad ${esc(PRIORIDAD[p.prioridad].t.toLowerCase())}</span>${p.confianza === "media" ? `<span class="ux-pill ux-pill--line" title="Detectado por el texto del chat">detectado en el texto</span>` : ""}</div>
          <h3>${esc(p.titulo)}</h3>
          <p>${esc(p.eq || "General")}${p.sede ? " · " + esc(p.sede) : ""} · ${p.fecha ? esc(N.fmt.fecha(p.fecha)) : ""}${p.hora ? " · " + esc(p.hora) : ""}${p.por ? " · reportó " + esc(N.nombreCorto(p.por)) : ""}</p>
        </div>
        <button class="ux-x" type="button" data-pd="cerrar" aria-label="Cerrar">${ic("x")}</button>
      </header>
      <div class="ux-sheet__body ux-stack">
        ${p.posibleCierre && p.estado !== "cerrado" ? `<div class="ux-note ux-note--ok">${ic("check")}<span><b>¿Ya se resolvió?</b> El ${esc(N.fmt.fecha(p.posibleCierre.fecha))}${p.posibleCierre.por ? ` (${esc(N.nombreCorto(p.posibleCierre.por))})` : ""} el registro dice: «${esc(p.posibleCierre.texto)}». <button class="ux-link" type="button" data-pd="estado" data-v="cerrado">Darlo por resuelto</button></span></div>` : ""}
        <div class="ux-field"><span>Estado</span>
          <div class="ux-seg pd-estados">${ESTADOS.map((e) => `<button type="button" class="${p.estado === e.id ? "is-on" : ""}" data-pd="estado" data-v="${e.id}"><i class="pd-dot" style="background:${e.c}"></i>${e.t}</button>`).join("")}</div>
        </div>
        <div class="ux-row2">
          <label class="ux-field"><span>Quién lo lleva</span>
            <input class="ux-input" list="pdGente" data-pd-resp value="${esc(p.responsable)}" placeholder="Nombre del técnico">
            <datalist id="pdGente">${personas.map((n) => `<option value="${esc(n)}">`).join("")}</datalist>
          </label>
          <label class="ux-field"><span>Prioridad</span>
            <select class="ux-select" data-pd-prio>${Object.entries(PRIORIDAD).map(([k, v]) => `<option value="${k}" ${p.prioridad === k ? "selected" : ""}>${v.t}</option>`).join("")}</select>
          </label>
        </div>
        ${p.detalle ? `<div class="ux-field"><span>Lo que se reportó</span><div class="pd-texto">${esc(p.detalle)}</div></div>` : ""}
        ${p.repuesto ? `<div class="ux-field"><span>Repuestos</span><div class="ux-small">${esc(p.repuesto)}</div></div>` : ""}
        <div class="ux-field"><span>Agregar una nota al seguimiento</span>
          <textarea class="ux-textarea" data-pd-nota rows="3" placeholder="Qué se hizo, qué falta, a quién se le pidió…"></textarea>
        </div>
        ${hist.length ? `<div class="ux-field"><span>Historial</span><ul class="ux-tl">${hist.slice().reverse().map((h) => `<li><span class="ux-tl__h">${esc(N.fmt.corta(N.diaCO(h.t)))}</span><span class="ux-tl__dot" style="--c:${(ESTADOS.find((e) => e.id === h.estado) || {}).c || "var(--mute-2)"}"><i></i></span><span class="ux-tl__b"><b class="ux-small">${esc(ESTADO_TXT[h.estado] || h.estado)}</b>${h.por ? `<span class="ux-small ux-mute"> · ${esc(h.por)}</span>` : ""}${h.nota ? `<div class="ux-small">${esc(h.nota)}</div>` : ""}</span></li>`).join("")}</ul></div>` : ""}
        <div class="pd-acciones">
          <button class="ux-btn ux-btn--sm" type="button" data-pd="origen-ver">${ic(o.ico)}Ver en ${esc(o.t)}</button>
          ${p.fichaId ? `<button class="ux-btn ux-btn--sm" type="button" data-pd="ficha">${ic("equipos")}Ficha del equipo</button>` : ""}
          ${p.eq ? `<button class="ux-btn ux-btn--sm" type="button" data-pd="indicadores">${ic("indicadores")}Historial de fallas</button>` : ""}
          <button class="ux-btn ux-btn--sm" type="button" data-pd="pedir">${ic("almacen")}Pedir repuesto</button>
          ${p.origen !== "tarea" ? `<button class="ux-btn ux-btn--sm" type="button" data-pd="a-tarea">${ic("tareas")}Convertir en tarea con aviso</button>` : ""}
        </div>
      </div>
      <footer class="ux-sheet__foot">
        <span class="ux-mute">${p.seg && p.seg.updatedAt ? "Actualizado " + esc(N.fmt.relativo(p.seg.updatedAt)) : "Sin seguimiento todavía"}</span>
        <button class="ux-btn" type="button" data-pd="cerrar">Cerrar</button>
        <button class="ux-btn ux-btn--primary" type="button" data-pd="guardar">Guardar</button>
      </footer>
    </aside>`;
  }

  function hojaAnotar() {
    const eqs = catalogo();
    return `<div class="ux-backdrop" data-pd="cerrar"></div>
    <aside class="ux-sheet" role="dialog" aria-label="Anotar pendiente">
      <header class="ux-sheet__head"><div><h3>Anotar un pendiente</h3><p>Para lo que no salió en el chat ni en el registro: una reparación por programar, algo que pidió producción, una compra.</p></div>
        <button class="ux-x" type="button" data-pd="cerrar" aria-label="Cerrar">${ic("x")}</button></header>
      <form class="ux-sheet__body ux-form" data-pd-form="anotar">
        <label class="ux-field"><span>Qué hay que hacer *</span><input class="ux-input" name="titulo" required placeholder="Ej. Cambiar correa de la Marzio 1"></label>
        <div class="ux-row2">
          <label class="ux-field"><span>Equipo</span><input class="ux-input" name="eq" list="pdEquipos" placeholder="Opcional"><datalist id="pdEquipos">${[...new Set(eqs.map((e) => e.eq))].map((e) => `<option value="${esc(e)}">`).join("")}</datalist></label>
          <label class="ux-field"><span>Sede</span><select class="ux-select" name="sede"><option value="">—</option><option>Sede 4</option><option>Sede 2</option></select></label>
        </div>
        <label class="ux-field"><span>Detalle</span><textarea class="ux-textarea" name="detalle" rows="3" placeholder="Lo que se sabe, repuestos, a quién avisar…"></textarea></label>
        <label class="ux-field"><span>Prioridad</span><select class="ux-select" name="prioridad"><option value="media">Media</option><option value="alta">Alta</option><option value="baja">Baja</option></select></label>
        <button class="ux-btn ux-btn--primary ux-btn--lg" type="submit">${ic("mas")}Anotar pendiente</button>
      </form>
    </aside>`;
  }

  function gente() {
    const T = window.TURNOS;
    if (!T) return [];
    const s = new Set();
    Object.values(T.roster).forEach((sd) => sd.groups.forEach((g) => g.members.forEach((m) => s.add(T.nombre(m)))));
    T.soporte.forEach((x) => x.members.forEach((m) => s.add(m)));
    return [...s].sort();
  }

  function render() {
    const raiz = document.getElementById("pendientesRoot");
    if (!raiz) return;
    const todos = lista();
    const items = filtrados();
    const foco = document.activeElement && document.activeElement.matches("[data-pd-q]");
    const abierto = vista.abierto ? todos.find((p) => p.id === vista.abierto) : null;
    raiz.innerHTML = `<div class="ux-page ux-seq">
      <div class="ux-head">
        <div class="ux-head__txt">
          <p class="ux-eyebrow">${ic("pendientes")}Seguimiento</p>
          <h1 class="ux-title">Pendientes</h1>
        </div>
        <div class="ux-head__acts">
          <button class="ux-btn" type="button" data-pd="copiar">${ic("copiar")}Copiar resumen</button>
          <button class="ux-btn ux-btn--primary" type="button" data-pd="anotar">${ic("mas")}Anotar pendiente</button>
        </div>
      </div>
      ${kpis(todos)}
      <div class="ux-stack">${barraFiltros(todos)}</div>
      ${vista.modo === "lista" ? tablaLista(items) : tablero(items)}
    </div>
    <div id="pdHoja">${abierto ? hoja(abierto) : vista.anotando ? hojaAnotar() : ""}</div>`;
    window.SHELL?.animarNumeros(raiz);
    if (foco) { const q = raiz.querySelector("[data-pd-q]"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }

  function pintarHoja() {
    const h = document.getElementById("pdHoja");
    if (!h) return;
    const p = vista.abierto ? lista().find((x) => x.id === vista.abierto) : null;
    h.innerHTML = p ? hoja(p) : vista.anotando ? hojaAnotar() : "";
    document.body.classList.toggle("mx-lock", !!(p || vista.anotando));
  }

  // Resumen en texto, para pegar en WhatsApp o Telegram
  function resumenTexto() {
    const ab = abiertos().sort((a, b) => ({ alta: 0, media: 1, baja: 2 }[a.prioridad] - { alta: 0, media: 1, baja: 2 }[b.prioridad]));
    const l = [`*PENDIENTES DE MANTENIMIENTO* — ${N.fmt.fecha(N.hoy())}`, `${ab.length} abiertos · ${ab.filter((p) => p.prioridad === "alta").length} de prioridad alta · ${ab.filter((p) => p.estado === "espera").length} esperando repuesto`, ""];
    ["Sede 4", "Sede 2", ""].forEach((s) => {
      const de = ab.filter((p) => (p.sede || "") === s);
      if (!de.length) return;
      l.push(`*${s || "General"}*`);
      de.slice(0, 25).forEach((p) => l.push(`${p.prioridad === "alta" ? "🔴" : p.estado === "espera" ? "🟠" : "⚪"} ${p.eq ? p.eq + ": " : ""}${p.titulo}${p.edad > 2 ? ` (${p.edad} d)` : ""}`));
      if (de.length > 25) l.push(`… y ${de.length - 25} más`);
      l.push("");
    });
    return l.join("\n").trim();
  }

  function enlazar() {
    const raiz = document.getElementById("pendientesRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pd]");
      if (!b) return;
      const a = b.dataset.pd;
      const p = vista.abierto ? lista().find((x) => x.id === vista.abierto) : null;
      if (a === "abrir") { vista.abierto = b.dataset.id; vista.anotando = false; pintarHoja(); }
      else if (a === "cerrar") { vista.abierto = ""; vista.anotando = false; pintarHoja(); }
      else if (a === "filtro") { vista.filtro = vista.filtro === b.dataset.v ? "" : b.dataset.v; render(); }
      else if (a === "sede") { vista.sede = b.dataset.v; render(); }
      else if (a === "origen") { vista.origen = b.dataset.v; render(); }
      else if (a === "modo") { vista.modo = b.dataset.v; try { localStorage.setItem("pd-modo", vista.modo); } catch (er) {} render(); }
      else if (a === "antiguos") { vista.antiguos = true; vista.filtro = "antiguos"; render(); }
      else if (a === "limpiar") { vista.filtro = ""; vista.antiguos = false; vista.origen = ""; vista.q = ""; render(); }
      else if (a === "anotar") { vista.anotando = true; vista.abierto = ""; pintarHoja(); setTimeout(() => raiz.querySelector('[name="titulo"]')?.focus(), 60); }
      else if (a === "copiar") {
        const txt = resumenTexto();
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => window.SHELL?.toast("Resumen copiado: pégalo en WhatsApp o Telegram"), () => window.prompt("Copia el resumen:", txt));
      }
      else if (!p) return;
      else if (a === "estado") { ponerEstado(p.id, b.dataset.v); vista.abierto = p.id; setTimeout(pintarHoja, 150); }
      else if (a === "guardar") {
        const nota = raiz.querySelector("[data-pd-nota]")?.value.trim() || "";
        const responsable = raiz.querySelector("[data-pd-resp]")?.value.trim() || "";
        const prioridad = raiz.querySelector("[data-pd-prio]")?.value || p.prioridad;
        guardarNota(p.id, nota, { responsable, prioridad });
        window.SHELL?.toast("Seguimiento guardado");
        vista.abierto = ""; pintarHoja();
      }
      else if (a === "origen-ver") { cerrarYIr(() => abrirOrigen(p)); }
      else if (a === "ficha") cerrarYIr(() => window.openDetail?.(p.fichaId));
      else if (a === "indicadores") cerrarYIr(() => window.goIndicadores?.({ eq: p.eqTxt || p.eq }));
      else if (a === "pedir") cerrarYIr(() => window.goAlmacen?.({ q: p.eq || "", destino: p.eq || "", nota: p.titulo }));
      else if (a === "a-tarea") {
        if (typeof tasks === "undefined") return;
        const id = typeof tuid === "function" ? tuid() : N.uid("t");
        const manana = new Date(Date.now() + 86400e3);
        tasks.unshift({ id, machine: p.fichaId || "", machineName: p.eq || "General / Otra", title: p.titulo, desc: `${p.detalle ? p.detalle + "\n" : ""}Viene de Pendientes (${p.origenTxt}, ${p.fecha}).`, priority: { alta: "Alta", media: "Media", baja: "Baja" }[p.prioridad], reporter: N.usuario.get(), status: "pendiente", steps: [], createdAt: new Date().toISOString(), remindFreq: "daily", remindTime: "07:30", remindNextAt: new Date(Date.UTC(manana.getUTCFullYear(), manana.getUTCMonth(), manana.getUTCDate(), 12, 30)).toISOString() });
        saveTasks();
        guardarNota(p.id, "Convertido en tarea con aviso diario por Telegram a las 7:30");
        window.SHELL?.toast("Tarea creada con aviso diario a las 7:30", { accion: { txt: "Ver", fn: () => window.goTasks?.() } });
        vista.abierto = ""; pintarHoja();
      }
    });
    raiz.addEventListener("input", (e) => {
      if (e.target.matches("[data-pd-q]")) { vista.q = e.target.value; clearTimeout(raiz._t); raiz._t = setTimeout(render, 160); }
    });
    raiz.addEventListener("submit", (e) => {
      const f = e.target.closest('[data-pd-form="anotar"]');
      if (!f) return;
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f).entries());
      if (!d.titulo.trim()) return;
      anotar({ titulo: d.titulo.trim(), detalle: d.detalle.trim(), eq: d.eq.trim(), sede: d.sede, prioridad: d.prioridad });
      vista.anotando = false;
      pintarHoja();
      window.SHELL?.toast("Pendiente anotado");
    });
    // Arrastrar tarjetas entre columnas
    let arrastrando = "";
    raiz.addEventListener("dragstart", (e) => {
      const c = e.target.closest(".ux-tcard[data-id]");
      if (!c) return;
      arrastrando = c.dataset.id;
      c.classList.add("is-drag");
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", arrastrando); } catch (er) {}
    });
    raiz.addEventListener("dragend", (e) => { e.target.closest?.(".ux-tcard")?.classList.remove("is-drag"); raiz.querySelectorAll(".ux-col.is-over").forEach((x) => x.classList.remove("is-over")); });
    raiz.addEventListener("dragover", (e) => {
      const col = e.target.closest("[data-pd-col]");
      if (!col || !arrastrando) return;
      e.preventDefault();
      raiz.querySelectorAll(".ux-col.is-over").forEach((x) => x !== col && x.classList.remove("is-over"));
      col.classList.add("is-over");
    });
    raiz.addEventListener("drop", (e) => {
      const col = e.target.closest("[data-pd-col]");
      if (!col || !arrastrando) return;
      e.preventDefault();
      const id = arrastrando;
      arrastrando = "";
      const p = lista().find((x) => x.id === id);
      if (p && p.estado !== col.dataset.pdCol) ponerEstado(id, col.dataset.pdCol);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && esVisible() && (vista.abierto || vista.anotando)) { vista.abierto = ""; vista.anotando = false; pintarHoja(); }
    });
  }

  function cerrarYIr(fn) { vista.abierto = ""; pintarHoja(); document.body.classList.remove("mx-lock"); fn(); }
  function abrirOrigen(p) {
    if (p.origen === "registro") window.goRegistro?.({ abrir: p.ref });
    else if (p.origen === "tarea") window.goTasks?.();
    else if (p.origen === "inspeccion") window.goInsp?.();
    else if (p.origen === "solicitud") window.goAlmacen?.();
    else render();
  }

  function esVisible() { return document.getElementById("pendientesView")?.classList.contains("is-active"); }

  function goPendientes(op) {
    views.pendientes = views.pendientes || document.getElementById("pendientesView");
    if (op && op.abrir) vista.abierto = op.abrir;
    if (op && op.filtro !== undefined) vista.filtro = op.filtro;
    if (op && op.sede !== undefined) vista.sede = op.sede;
    setView("pendientes");
    calcular();
    render();
    enlazar();
    pintarHoja();
    saveUiState({ activeView: "pendientes" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  window.goPendientes = goPendientes;
  window.PENDIENTES = { lista, abiertos, calcular, ponerEstado, anotar, resumenTexto, ORIGEN, ESTADOS, ESTADO_TXT, PRIORIDAD, tituloDe, fichaDe, gente };
  views.pendientes = document.getElementById("pendientesView");
  SEG.suscribir();
  setTimeout(() => { calcular(); insignias(); N.emitir("pendientes"); }, 0);
})();
