// ============================================================================
//  ESTRUCTURA DE LA APP: menú lateral, barra superior, barra del celular,
//  historial del navegador, búsqueda global (Ctrl + K), menú "Nuevo" y avisos.
// ============================================================================
//  Cada vista sigue teniendo su función go…() de siempre; aquí solo se sabe
//  cómo se llama cada una, a qué grupo pertenece y cómo abrirla. setView()
//  avisa a alCambiarVista() y desde ahí se marca el menú, se escribe la miga
//  de pan, se anima la entrada y se guarda en el historial, de modo que el
//  botón "atrás" del navegador o del celular vuelve a la vista anterior en
//  vez de salirse de la app.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;

  // Iconos de trazo (24 px), los mismos del menú lateral
  const ICONOS = {
    inicio: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    pendientes: '<rect x="3" y="4" width="6" height="6" rx="1.5"/><path d="m3.5 17 2 2 3.5-4"/><path d="M13 7h8M13 12h8M13 17h8"/>',
    registro: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 11h8M8 15h5"/>',
    reportes: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 8h8M8 12h5"/>',
    tareas: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    insp: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="11.5" cy="11.5" r="3.5"/><path d="m17 17-3-3"/>',
    turnos: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    equipos: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1M12 18h1M7 18h1"/>',
    plan: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    almacen: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12M6 14h12"/><rect x="6" y="10" width="12" height="12"/>',
    presupuesto: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    indicadores: '<path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/>',
    diario: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    formulario: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M10.4 12.6a2 2 0 0 1 3 3L8 21l-4 1 1-4Z"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5"/><path d="M4 13.5V6a2 2 0 0 1 2-2h2"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    der: '<path d="m9 18 6-6-6-6"/>',
    izq: '<path d="m15 18-6-6 6-6"/>',
    arriba: '<path d="m18 15-6-6-6 6"/>',
    abajo: '<path d="m6 9 6 6 6-6"/>',
    flecha: '<path d="M7 17 17 7M8 7h9v9"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alerta: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    repuesto: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    llave: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    falla: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    rayo: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    luna: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    telegram: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    nube: '<path d="M17.5 19a4.5 4.5 0 0 0 .45-8.98A6 6 0 0 0 6.3 9.5 4.5 4.5 0 0 0 7 19h10.5Z"/>',
    descargar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    subir: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    filtro: '<path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    dinero: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    tendencia: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    capas: '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    enlace: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    pausa: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    play: '<path d="m6 3 14 9-14 9V3z"/>',
    caja: '<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    ojo: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    basura: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    copiar: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    compartir: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    fabrica: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1M12 18h1M7 18h1"/>',
    escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    campana: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    grafica: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    puntos: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  };
  const ic = (n, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] || ""}</svg>`;

  // Vistas: nombre interno -> título, grupo del menú, icono y cómo abrirla
  // g: la sección del menú a la que pertenece; pt: el nombre corto de su pestaña
  const VISTAS = {
    hoy: { t: "Inicio", g: "Inicio", ico: "inicio", go: (o) => window.goHoy?.(o) },
    home: { t: "Equipos", pt: "Fichas", g: "Equipos", ico: "equipos", go: () => window.goHome?.() },
    results: { t: "Buscar equipos", g: "Equipos", nav: "home", ico: "equipos", oculta: true, go: () => window.goResults?.({ keepSelection: true }) },
    detail: { t: "Ficha del equipo", g: "Equipos", nav: "home", ico: "equipos", oculta: true, go: (o) => o && o.id && window.openDetail?.(o.id) },
    plan: { t: "Plan de mantenimiento", pt: "Plan de mantenimiento", g: "Equipos", ico: "plan", go: (o) => window.goPlan?.(o && o.q) },
    turnos: { t: "Personal en turno", pt: "Personal", g: "Turno", ico: "turnos", go: () => window.goTurnos?.() },
    registro: { t: "Registro diario", pt: "Registro", g: "Turno", ico: "registro", go: (o) => window.goRegistro?.(o) },
    reportes: { t: "Reportes de turno", pt: "Reportes", g: "Turno", ico: "reportes", go: (o) => window.goReportes?.(o && o.id) },
    diario: { t: "Calendario", pt: "Calendario", g: "Turno", ico: "calendario", go: () => window.goDiario?.() },
    seguimiento: { t: "Seguimiento del mantenimiento", pt: "Seguimiento", g: "Mantenimiento", ico: "llave", badge: "sbMtto", go: (o) => window.goSeguimiento?.(o) },
    insp: { t: "Inspecciones", pt: "Inspecciones", g: "Mantenimiento", ico: "insp", go: () => window.goInsp?.() },
    pendientes: { t: "Pendientes", pt: "Pendientes", g: "Mantenimiento", ico: "pendientes", badge: "sbPendientes", go: (o) => window.goPendientes?.(o) },
    tasks: { t: "Tareas", pt: "Tareas", g: "Mantenimiento", ico: "tareas", badge: "sbTareas", go: () => window.goTasks?.() },
    almacen: { t: "Almacén", pt: "Repuestos y solicitudes", g: "Almacén", ico: "almacen", go: (o) => window.goAlmacen?.(o) },
    presupuesto: { t: "Presupuesto", pt: "Presupuesto", g: "Almacén", ico: "presupuesto", go: (o) => window.goPresupuesto?.(o) },
    solicitudes: { t: "Historial de solicitudes", pt: "Historial", g: "Almacén", ico: "reloj", badge: "sbSolic", go: (o) => window.goSolicitudes?.(o) },
    indicadores: { t: "Indicadores", g: "Indicadores", ico: "indicadores", go: (o) => window.goIndicadores?.(o) },
    ajustes: { t: "Conexión y ajustes", g: "Ajustes", ico: "ajustes", go: () => window.goAjustes?.() },
  };
  // Pestañas de cada sección, en el orden de arriba (solo las vistas visibles)
  const PESTANAS = {};
  Object.entries(VISTAS).forEach(([k, v]) => { if (!v.oculta) (PESTANAS[v.g] = PESTANAS[v.g] || []).push(k); });
  const seccionDe = (v) => (VISTAS[v] || {}).g;
  const ALIAS = { inicio: "hoy", tareas: "tasks", inspecciones: "insp", equipos: "home", equipo: "detail", turno: "turnos", personal: "turnos", calendario: "diario", historial: "solicitudes", mantenimiento: "seguimiento" };
  const nombreVista = (v) => ALIAS[v] || v;

  let actual = null;
  let restaurando = false;
  let reemplazar = false;
  let entrandoHasta = 0;

  // ------------------------------------------------------------ navegación
  function alCambiarVista(v) {
    const info = VISTAS[v] || { t: v, g: "" };
    const marcar = info.nav || v;
    // En el menú y en la barra del celular se marca la sección; en las pestañas, la vista
    document.querySelectorAll(".sb [data-go], .mb [data-go]").forEach((b) => {
      const on = seccionDe(b.dataset.go) === info.g;
      b.classList.toggle(b.closest(".mb") ? "is-on" : "is-active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    pintarPestanas(info.g, marcar);
    const mas = document.querySelector('.mb [data-mb="mas"]');
    if (mas) mas.classList.toggle("is-on", !document.querySelector(".mb [data-go].is-on"));

    let titulo = info.t;
    let id;
    if (v === "detail" && typeof selectedId !== "undefined" && selectedId) {
      id = selectedId;
      const m = typeof machines !== "undefined" ? machines.find((x) => x.id === selectedId) : null;
      if (m) titulo = m.model || m.name;
    }
    const miga = document.getElementById("tbCrumb");
    if (miga) miga.innerHTML = `${info.g && info.g !== titulo ? `<span>${esc(info.g)}</span>${ic("der")}` : ""}<b>${esc(titulo)}</b>`;
    document.title = `${titulo} · Mantenimiento Farmacápsulas`;

    const el = typeof views !== "undefined" ? views[v] : null;
    if (el && (v !== actual || id)) {
      el.classList.remove("is-entering");
      void el.offsetWidth;
      el.classList.add("is-entering");
      entrandoHasta = Date.now() + 700;
      clearTimeout(el._salida);
      el._salida = setTimeout(() => el.classList.remove("is-entering"), 900);
    }

    const params = new URLSearchParams();
    params.set("v", v);
    if (id) params.set("id", id);
    const url = `${location.pathname}?${params.toString()}`;
    const estado = { v, id };
    if (!restaurando) {
      if (reemplazar || !history.state || !history.state.v) history.replaceState(estado, "", url);
      else if (v !== actual || (id && history.state.id !== id)) history.pushState(estado, "", url);
    }
    reemplazar = false;
    actual = v;
    cerrarMenuMovil();
    N.emitir("vista", v);
  }

  function ir(v, opciones = {}) {
    v = nombreVista(v);
    const info = VISTAS[v];
    if (!info) return false;
    if (opciones.reemplazar) reemplazar = true;
    try { info.go(opciones); } catch (e) { console.error("[Shell] abriendo", v, e); }
    return true;
  }
  // "detail" solo se puede abrir por URL si trae el id de un equipo que existe
  const puedeAbrir = (v, params) => {
    v = nombreVista(v);
    if (v === "detail") { const id = params && params.get && params.get("id"); return !!id && typeof machines !== "undefined" && machines.some((m) => m.id === id); }
    return !!VISTAS[v] && v !== "results";
  };

  // index.html?v=registro&fecha=2026-09-28, ?v=pendientes&id=…, ?v=equipo&id=…
  function abrirDesdeUrl(p) {
    const v = nombreVista(p.get("v"));
    reemplazar = true;
    const o = { id: p.get("id") || "", fecha: p.get("fecha") || "", q: p.get("q") || "" };
    if (v === "detail" && o.id && typeof openDetail === "function") { openDetail(o.id); return; }
    if (v === "registro") { window.goRegistro?.(o.fecha ? { fecha: o.fecha } : undefined); return; }
    if (v === "pendientes") { window.goPendientes?.(o.id ? { abrir: o.id } : undefined); return; }
    if (v === "almacen") { window.goAlmacen?.(o.q ? { q: o.q } : undefined); return; }
    ir(v, o);
  }

  window.addEventListener("popstate", (e) => {
    const s = e.state;
    if (!s || !s.v) return;
    restaurando = true;
    try {
      if (s.v === "detail" && s.id && typeof openDetail === "function") openDetail(s.id);
      else ir(s.v, { id: s.id });
    } finally { restaurando = false; }
  });

  // Clic en cualquier cosa con data-go="vista": menú, barra del celular, tarjetas
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (!b || b.tagName === "A" && b.getAttribute("href") && !b.getAttribute("href").startsWith("#")) return;
    e.preventDefault();
    const o = {};
    if (b.dataset.goId) o.id = b.dataset.goId;
    if (b.dataset.goQ) o.q = b.dataset.goQ;
    ir(b.dataset.go, o);
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  // --------------------------------------------------------- menú lateral
  const K_MIN = "ui-sb-min";
  const colapsar = document.getElementById("sbCollapse");
  function ponerMin(min) {
    document.body.classList.toggle("sb-min", min);
    try { localStorage.setItem(K_MIN, min ? "1" : "0"); } catch (e) {}
    if (colapsar) {
      colapsar.dataset.tip = min ? "Expandir menú" : "Contraer menú";
      const s = colapsar.querySelector("span");
      if (s) s.textContent = min ? "Expandir menú" : "Contraer menú";
    }
  }
  (function preferenciaInicial() {
    let guardado = null;
    try { guardado = localStorage.getItem(K_MIN); } catch (e) {}
    // En pantallas medianas arranca contraído, salvo que la persona lo haya abierto antes
    ponerMin(guardado === null ? window.innerWidth < 1280 && window.innerWidth >= 1024 : guardado === "1");
  })();
  colapsar?.addEventListener("click", () => ponerMin(!document.body.classList.contains("sb-min")));

  // Menú en el celular y tableta: sale como hoja
  let velo = null;
  function abrirMenuMovil() {
    document.body.classList.add("sb-open");
    document.getElementById("tbBurger")?.setAttribute("aria-expanded", "true");
    if (!velo) {
      velo = document.createElement("div");
      velo.className = "sb-scrim";
      velo.addEventListener("click", cerrarMenuMovil);
      document.body.appendChild(velo);
    }
  }
  function cerrarMenuMovil() {
    document.body.classList.remove("sb-open");
    document.getElementById("tbBurger")?.setAttribute("aria-expanded", "false");
    if (velo) { velo.remove(); velo = null; }
  }
  document.getElementById("tbBurger")?.addEventListener("click", () => (document.body.classList.contains("sb-open") ? cerrarMenuMovil() : abrirMenuMovil()));
  document.querySelector('.mb [data-mb="mas"]')?.addEventListener("click", () => (document.body.classList.contains("sb-open") ? cerrarMenuMovil() : abrirMenuMovil()));

  // Barra superior con borde al desplazarse
  const barra = document.getElementById("topBar");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { barra?.classList.toggle("is-scrolled", window.scrollY > 4); ticking = false; });
  }, { passive: true });

  // ------------------------------------------------------------ pestañas
  // Las secciones con más de una vista las enseñan como pestañas arriba.
  function pintarPestanas(sec, marcar) {
    const nav = document.getElementById("subNav");
    if (!nav) return;
    const lista = PESTANAS[sec] || [];
    nav.hidden = lista.length < 2;
    if (nav.hidden) { nav.innerHTML = ""; return; }
    nav.innerHTML = lista.map((k) => {
      const v = VISTAS[k];
      const n = v.badge ? cuentas[v.badge] : "";
      const on = k === marcar;
      return `<button type="button" data-go="${k}" class="${on ? "is-on" : ""}"${on ? ' aria-current="page"' : ""}>${esc(v.pt || v.t)}${n ? `<em>${esc(n)}</em>` : ""}</button>`;
    }).join("");
  }

  // ------------------------------------------------------------ insignias
  // Se recuerda cada número para poder ponerlo también en las pestañas.
  const cuentas = {};
  function insignia(id, n) {
    const txt = n ? (n > 99 ? "99+" : String(n)) : "";
    cuentas[id] = txt;
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
    const v = actual && VISTAS[actual];
    if (v) pintarPestanas(v.g, v.nav || actual);
  }

  // ---------------------------------------------------------------- avisos
  function toast(texto, op = {}) {
    const caja = document.getElementById("uxToasts");
    if (!caja) return;
    const t = document.createElement("div");
    const tipo = op.tipo || "ok";
    t.className = `ux-toast ux-toast--${tipo}`;
    t.setAttribute("role", "status");
    t.innerHTML = `${ic(tipo === "bad" ? "alerta" : tipo === "warn" ? "info" : "check")}<span>${texto}</span>${op.accion ? `<button type="button">${esc(op.accion.txt)}</button>` : ""}`;
    if (op.accion) t.querySelector("button").addEventListener("click", () => { op.accion.fn(); quitar(); });
    caja.appendChild(t);
    const quitar = () => { t.classList.add("is-out"); setTimeout(() => t.remove(), 260); };
    setTimeout(quitar, op.ms || 4200);
  }

  // ---------------------------------------------------- números animados
  // Solo al entrar a una vista: si cada repintado contara desde cero, cansaría.
  const entrando = () => Date.now() < entrandoHasta;
  function animarNumeros(raiz) {
    if (!raiz || !entrando() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    raiz.querySelectorAll("[data-n]").forEach((el) => {
      const fin = Number(el.dataset.n);
      if (!Number.isFinite(fin) || fin === 0) return;
      const dec = Number(el.dataset.dec || 0);
      const pre = el.dataset.pre || "";
      const t0 = performance.now();
      const dur = 750;
      const paso = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + (fin * e).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
  }

  // -------------------------------------------------------- menú "Nuevo"
  const ACCIONES = [
    { id: "novedad", t: "Novedad en el Registro diario", s: "Una falla, un ajuste o una parada", ico: "registro", tono: "bad", fn: () => window.goRegistro?.({ nueva: true }) },
    { id: "formulario", t: "Reporte de turno completo", s: "Formulario guiado para el turno", ico: "formulario", tono: "acc", fn: () => { location.href = "reporte.html"; } },
    { id: "tarea", t: "Tarea", s: "Algo por hacer, con aviso por Telegram", ico: "tareas", tono: "vio", fn: () => { window.goTasks?.(); setTimeout(() => window.taskFormToggle?.(true), 60); } },
    { id: "solicitud", t: "Solicitud de repuestos", s: "Buscar en almacén y llenar el DAD-010A", ico: "almacen", tono: "ok", fn: () => { window.goAlmacen?.(); } },
    { id: "inspeccion", t: "Inspección", s: "Lo que se revisó y lo que hay que cambiar", ico: "insp", tono: "info", fn: () => { window.goInsp?.(); setTimeout(() => window.inspAbrirForm?.(), 60); } },
    { id: "gasto", t: "Gasto en el presupuesto", s: "Compra directa, servicio o salida sin solicitud", ico: "presupuesto", tono: "warn", fn: () => window.goPresupuesto?.({ gasto: true }) },
  ];
  let menuNuevo = null;
  function cerrarMenuNuevo() { if (menuNuevo) { menuNuevo.remove(); menuNuevo = null; document.getElementById("tbNew")?.setAttribute("aria-expanded", "false"); } }
  function abrirMenuNuevo() {
    const b = document.getElementById("tbNew");
    if (!b) return;
    if (menuNuevo) { cerrarMenuNuevo(); return; }
    const r = b.getBoundingClientRect();
    menuNuevo = document.createElement("div");
    menuNuevo.className = "ux-menu";
    menuNuevo.setAttribute("role", "menu");
    menuNuevo.style.position = "fixed";
    menuNuevo.style.top = `${r.bottom + 8}px`;
    menuNuevo.style.right = `${Math.max(12, window.innerWidth - r.right)}px`;
    menuNuevo.style.width = "300px";
    menuNuevo.innerHTML = ACCIONES.map((a) => `<button type="button" role="menuitem" data-accion="${a.id}"><span class="ux-row__ico ux-row__ico--${a.tono}">${ic(a.ico)}</span><span><b style="font-weight:600">${esc(a.t)}</b><small>${esc(a.s)}</small></span></button>`).join("");
    menuNuevo.addEventListener("click", (e) => {
      const it = e.target.closest("[data-accion]");
      if (!it) return;
      cerrarMenuNuevo();
      ACCIONES.find((a) => a.id === it.dataset.accion)?.fn();
    });
    document.body.appendChild(menuNuevo);
    b.setAttribute("aria-expanded", "true");
    menuNuevo.querySelector("button")?.focus();
  }
  document.getElementById("tbNew")?.addEventListener("click", (e) => { e.stopPropagation(); abrirMenuNuevo(); });
  document.addEventListener("click", (e) => { if (menuNuevo && !menuNuevo.contains(e.target)) cerrarMenuNuevo(); });
  window.addEventListener("resize", cerrarMenuNuevo);

  // -------------------------------------------- búsqueda global (Ctrl + K)
  let paleta = null;
  const pal = { q: "", items: [], sel: 0 };

  function fuentes(q) {
    const t = N.plano(q);
    const toks = t.split(" ").filter(Boolean);
    const pasa = (txt) => { const h = N.plano(txt); return toks.every((k) => h.includes(k)); };
    const grupos = [];

    const acciones = ACCIONES.filter((a) => !t || pasa(`${a.t} ${a.s} nuevo nueva crear`)).map((a) => ({ ico: a.ico, tono: a.tono, t: a.t, s: a.s, k: "Crear", fn: a.fn }));
    const secciones = Object.entries(VISTAS).filter(([, v]) => !v.oculta).filter(([k, v]) => !t || pasa(`${v.t} ${v.g} ${k}`))
      .map(([k, v]) => ({ ico: v.ico, t: v.t, s: v.g, k: "Ir", fn: () => ir(k) }));
    if (!t) {
      grupos.push({ g: "Crear", items: acciones.slice(0, 4) });
      grupos.push({ g: "Secciones", items: secciones });
      return grupos;
    }
    if (secciones.length) grupos.push({ g: "Secciones", items: secciones.slice(0, 5) });

    if (typeof machines !== "undefined") {
      const eqs = machines.filter((m) => pasa([m.name, m.model, m.area, m.location, ...(m.searchAliases || [])].join(" "))).slice(0, 7)
        .map((m) => ({ ico: "equipos", t: m.model || m.name, s: [m.name !== m.model ? m.name : "", m.area].filter(Boolean).join(" · "), k: "Ficha", fn: () => window.openDetail?.(m.id) }));
      if (eqs.length) grupos.push({ g: "Equipos", items: eqs });
    }
    if (window.PENDIENTES) {
      const ps = window.PENDIENTES.lista().filter((p) => p.estado !== "cerrado" && pasa(`${p.titulo} ${p.eq} ${p.detalle}`)).slice(0, 5)
        .map((p) => ({ ico: "pendientes", tono: p.prioridad === "alta" ? "bad" : "warn", t: p.titulo, s: `${p.eq || "General"} · ${p.origenTxt}`, k: "Pendiente", fn: () => window.goPendientes?.({ abrir: p.id }) }));
      if (ps.length) grupos.push({ g: "Pendientes", items: ps });
    }
    if (window.INVENTARIO && toks.length && t.length >= 3) {
      const inv = window.INVENTARIO.todo || {};
      const res = [];
      for (const a of Object.values(inv)) {
        if (res.length >= 5) break;
        if (pasa(`${a.cod} ${a.desc}`)) res.push(a);
      }
      const rs = res.map((a) => ({ ico: "repuesto", tono: a.exist > 0 ? "ok" : "bad", t: a.desc || a.cod, s: `Código ${a.cod} · existencia ${N.fmt.num(a.exist)}${a.ub ? " · " + a.ub : ""}`, k: "Almacén", fn: () => window.goAlmacen?.({ q: String(a.cod) }) }));
      if (rs.length) grupos.push({ g: "Repuestos en almacén", items: rs });
    }
    if (Array.isArray(window.REPORTES_TURNO) && t.length >= 3) {
      const rep = window.REPORTES_TURNO.filter((r) => pasa(`${r.fecha} ${r.autor} ${r.sede} ${(r.novedades || []).join(" ")}`))
        .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)).slice(0, 4)
        .map((r) => ({ ico: "reportes", t: `Reporte ${N.fmt.corta(r.fecha)} · ${r.sede}`, s: `${N.nombreCorto(r.autor)} · ${(r.novedades || []).length} novedades`, k: "Reporte", fn: () => window.goReportes?.(r.id) }));
      if (rep.length) grupos.push({ g: "Reportes de turno", items: rep });
    }
    if (acciones.length) grupos.push({ g: "Crear", items: acciones });
    return grupos;
  }

  function pintarPaleta() {
    if (!paleta) return;
    const grupos = fuentes(pal.q);
    pal.items = grupos.flatMap((g) => g.items);
    pal.sel = Math.min(pal.sel, Math.max(0, pal.items.length - 1));
    let i = 0;
    const lista = paleta.querySelector(".ux-pal__list");
    lista.innerHTML = pal.items.length
      ? grupos.map((g) => `<div class="ux-pal__grp">${esc(g.g)}</div>${g.items.map((it) => {
        const n = i++;
        return `<button type="button" class="ux-pal__it ${n === pal.sel ? "is-on" : ""}" data-i="${n}"><span class="ux-row__ico ${it.tono ? "ux-row__ico--" + it.tono : ""}">${ic(it.ico)}</span><span><b>${esc(it.t)}</b>${it.s ? `<small>${esc(it.s)}</small>` : ""}</span><em>${esc(it.k)}</em></button>`;
      }).join("")}`).join("")
      : `<div class="ux-pal__vacio">Nada coincide con «${esc(pal.q)}». Prueba con el nombre del equipo, un código o una sección.</div>`;
    lista.querySelector(".is-on")?.scrollIntoView({ block: "nearest" });
  }
  function abrirPaleta(q = "") {
    if (paleta) return;
    cerrarMenuNuevo();
    pal.q = q; pal.sel = 0;
    const velo2 = document.createElement("div");
    velo2.className = "ux-backdrop";
    paleta = document.createElement("div");
    paleta.className = "ux-pal";
    paleta.setAttribute("role", "dialog");
    paleta.setAttribute("aria-label", "Buscar en la app");
    paleta.innerHTML = `
      <div class="ux-pal__in">${ic("buscar")}<input type="search" placeholder="Busca un equipo, repuesto, pendiente, reporte o sección…" autocomplete="off" aria-label="Buscar"><kbd class="ux-kbd">Esc</kbd></div>
      <div class="ux-pal__list" role="listbox"></div>
      <div class="ux-pal__foot"><span><kbd class="ux-kbd">↑</kbd><kbd class="ux-kbd">↓</kbd> moverse</span><span><kbd class="ux-kbd">Enter</kbd> abrir</span><span><kbd class="ux-kbd">Esc</kbd> cerrar</span></div>`;
    paleta._velo = velo2;
    document.body.append(velo2, paleta);
    const inp = paleta.querySelector("input");
    inp.value = q;
    inp.addEventListener("input", () => { pal.q = inp.value; pal.sel = 0; pintarPaleta(); });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); pal.sel = Math.min(pal.items.length - 1, pal.sel + 1); pintarPaleta(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); pal.sel = Math.max(0, pal.sel - 1); pintarPaleta(); }
      else if (e.key === "Enter") { e.preventDefault(); elegir(pal.sel); }
      else if (e.key === "Escape") { e.preventDefault(); cerrarPaleta(); }
    });
    paleta.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) elegir(Number(b.dataset.i)); });
    velo2.addEventListener("click", cerrarPaleta);
    pintarPaleta();
    setTimeout(() => inp.focus(), 10);
  }
  function elegir(i) {
    const it = pal.items[i];
    cerrarPaleta();
    if (it) { it.fn(); window.scrollTo({ top: 0, behavior: "auto" }); }
  }
  function cerrarPaleta() {
    if (!paleta) return;
    paleta._velo.remove();
    paleta.remove();
    paleta = null;
  }
  document.getElementById("tbSearch")?.addEventListener("click", () => abrirPaleta());
  document.addEventListener("keydown", (e) => {
    const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "") || document.activeElement?.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); paleta ? cerrarPaleta() : abrirPaleta(); }
    else if (e.key === "/" && !escribiendo && !paleta) { e.preventDefault(); abrirPaleta(); }
    else if (e.key === "Escape") { cerrarMenuNuevo(); cerrarMenuMovil(); cerrarPaleta(); }
  });

  // --------------------------------------------- estado de la conexión
  function pintarConexion() {
    const b = document.getElementById("tbSync");
    if (!b) return;
    const cloud = window.CLOUD && window.CLOUD.enabled;
    const estados = Object.values(N.permisos);
    const denegadas = Object.entries(N.permisos).filter(([, v]) => v.estado === "denegado").map(([k]) => k);
    const buenas = estados.filter((v) => v.estado === "ok").length;
    const cuota = estados.some((v) => /resource-exhausted/.test(v.detalle || ""));
    const conError = estados.filter((v) => v.estado === "error").length;
    let clase = "is-ok", txt = "En línea", tip = "Todo lo que se guarda llega a la nube y lo ve el taller.";
    if (!navigator.onLine) { clase = "is-bad"; txt = "Sin internet"; tip = "Lo que guardes queda en este equipo y se sube cuando vuelva la conexión."; }
    else if (!cloud) { clase = "is-warn"; txt = "Sin nube"; tip = "Firebase no está configurado: todo queda solo en este navegador."; }
    else if (cuota) { clase = "is-warn"; txt = "Cuota agotada"; tip = "Se agotaron las lecturas gratis de hoy en Firebase. La app sigue con la copia de este equipo; se reinicia hacia las 2 a. m."; }
    else if (denegadas.length) { clase = "is-warn"; txt = "Nube parcial"; tip = `La nube rechaza: ${denegadas.join(", ")}. Eso queda solo en este equipo hasta publicar las reglas (ver Conexión y ajustes).`; }
    else if (conError && !buenas) { clase = "is-bad"; txt = "Sin conexión"; tip = "No se pudo hablar con la nube. Lo que guardes queda en este equipo y se sube después."; }
    else if (!estados.length) { clase = ""; txt = "Conectando…"; }
    // Solo un punto: verde que late si todo va bien; el detalle queda en el título
    b.className = `tb__sync ${clase}`;
    b.innerHTML = "<i></i>";
    b.title = `${txt}. ${tip}`;
    b.setAttribute("aria-label", txt);
    insignia("sbAjustes", denegadas.length ? "!" : "");
  }
  N.on("permisos", pintarConexion);
  window.addEventListener("online", pintarConexion);
  window.addEventListener("offline", pintarConexion);
  document.getElementById("tbSync")?.addEventListener("click", () => ir("ajustes"));
  // Revisión discreta de permisos al abrir: así el aviso aparece aunque nadie
  // haya intentado guardar todavía.
  setTimeout(() => { N.COLECCIONES.forEach((c) => N.probar(c.id)); }, 1800);



  window.SHELL = {
    VISTAS, ICONOS, ic, ir, puedeAbrir, abrirDesdeUrl, alCambiarVista, toast, insignia, animarNumeros, abrirPaleta,
    get vista() { return actual; },
    entrando,
  };
  window.IC = ic;
})();
