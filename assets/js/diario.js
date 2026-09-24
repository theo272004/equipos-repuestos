// ============================================================================
//  DIARIO: que se hizo cada dia, en un calendario
// ============================================================================
//  No pide que nadie apunte nada dos veces: junta lo que la app ya registra
//    - cambios de repuestos (Plan de mantenimiento -> Registrar)
//    - tareas creadas y terminadas
//    - inspecciones
//    - solicitudes de materiales (Almacen)
//  y le suma una nota libre por dia ("bitacora") para lo que no cabe en lo
//  anterior: lo que se hablo en el turno, lo que quedo pendiente, visitas.
//  Las notas se comparten con el taller igual que las tareas.
// ============================================================================

(function () {
  const NOTAS = "equipos-bitacora-v1";
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  const CLASES = {
    reporte: { txt: "Reportes", uno: "reporte", orden: 0 },
    cambio: { txt: "Cambios", uno: "cambio", orden: 1 },
    tarea: { txt: "Tareas", uno: "tarea", orden: 2 },
    insp: { txt: "Inspecciones", uno: "inspección", orden: 3 },
    sol: { txt: "Solicitudes", uno: "solicitud", orden: 4 },
    nota: { txt: "Notas", uno: "nota", orden: 5 },
  };

  let notas = cargar();
  const vista = { mes: "", dia: "" };

  function cargar() { try { return JSON.parse(localStorage.getItem(NOTAS) || "[]"); } catch (e) { return []; } }
  function guardarLocal() { try { localStorage.setItem(NOTAS, JSON.stringify(notas)); } catch (e) {} }
  const esc = (v) => planEsc(v);

  // Dia en Colombia de una marca de tiempo ISO: una tarea terminada a las 9 de
  // la noche en planta es de ese dia, no del siguiente en hora UTC.
  function diaCO(iso) {
    const t = Date.parse(iso || "");
    return Number.isFinite(t) ? new Date(t - CO_MS).toISOString().slice(0, 10) : "";
  }
  function horaCO(iso) {
    const t = Date.parse(iso || "");
    return Number.isFinite(t) ? new Date(t - CO_MS).toISOString().slice(11, 16) : "";
  }

  function nombreEquipo(ref) {
    if (!ref) return "";
    const eqs = (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || [];
    const e = eqs.find((x) => x.c === ref || x.id === ref);
    if (e) return e.n;
    const m = typeof machines !== "undefined" ? machines.find((x) => x.id === ref) : null;
    return m ? (m.model || m.name) : ref;
  }

  // Todo lo que paso, como una lista plana de eventos con su dia.
  function eventos() {
    const ev = [];
    // Resumen de los reportes de turno (lista completa en la sección Reportes)
    (window.reportesEventos ? window.reportesEventos() : []).forEach((r) => {
      if (!r || !r.dia) return;
      ev.push({ ...r, clase: "reporte" });
    });
    if (typeof cambios !== "undefined") cambios.forEach((c) => {
      if (!c || c.marca || !c.fecha) return;
      ev.push({ clase: "cambio", dia: c.fecha, hora: horaCO(c.createdAt), quien: c.quien,
        titulo: `${c.d || "Pieza"}${c.cod ? " (" + c.cod + ")" : ""}`,
        detalle: [nombreEquipo(c.eq), c.q ? `${c.q} und.` : "", c.nota].filter(Boolean).join(" · ") });
    });
    if (typeof tasks !== "undefined") tasks.forEach((t) => {
      if (!t) return;
      const maquina = t.machineName && t.machineName !== "General / Otra" ? t.machineName : "";
      if (t.createdAt) ev.push({ clase: "tarea", dia: diaCO(t.createdAt), hora: horaCO(t.createdAt), quien: t.reporter,
        titulo: `Nueva: ${t.title || "(sin título)"}`, detalle: [maquina, t.priority ? "prioridad " + t.priority.toLowerCase() : ""].filter(Boolean).join(" · ") });
      if (t.doneAt) ev.push({ clase: "tarea", dia: diaCO(t.doneAt), hora: horaCO(t.doneAt), quien: "",
        titulo: `Hecha: ${t.title || "(sin título)"}`, detalle: maquina, hecha: true });
    });
    if (typeof inspecciones !== "undefined") inspecciones.forEach((i) => {
      if (!i || !i.fecha) return;
      const piezas = (i.piezas || []).length;
      ev.push({ clase: "insp", dia: i.fecha, hora: horaCO(i.createdAt), quien: i.quien,
        titulo: `Inspección${i.tipo ? " " + i.tipo : ""}: ${nombreEquipo(i.eq)}`,
        detalle: [i.hallazgos, piezas ? `${piezas} ${piezas === 1 ? "pieza" : "piezas"} para cambiar` : "", i.estado === "cerrada" ? "cerrada" : ""].filter(Boolean).join(" · ") });
    });
    (window.almSolicitudes ? window.almSolicitudes() : []).forEach((s) => {
      if (!s || !s.fecha) return;
      const n = (s.lineas || []).length;
      const tipo = (window.almTipos && window.almTipos[s.tipo]) || s.tipo || "";
      ev.push({ clase: "sol", dia: s.fecha, hora: horaCO(s.createdAt), quien: s.solicitadoPor,
        titulo: `Solicitud de materiales${tipo ? " · " + tipo : ""}: ${n} ${n === 1 ? "artículo" : "artículos"}${s.destino ? " para " + s.destino : ""}`,
        detalle: (s.lineas || []).slice(0, 4).map((l) => `${l.cant} × ${l.desc || l.cod}`).join(" · ") + (n > 4 ? ` · y ${n - 4} más` : "") });
    });
    notas.forEach((n) => {
      if (!n || !n.fecha) return;
      ev.push({ clase: "nota", dia: n.fecha, hora: horaCO(n.createdAt), quien: n.quien, titulo: n.texto, detalle: "", id: n.id });
    });
    return ev;
  }

  function porDia(ev) {
    const m = new Map();
    ev.forEach((e) => { if (!m.has(e.dia)) m.set(e.dia, []); m.get(e.dia).push(e); });
    return m;
  }

  // ------------------------------------------------------------------------
  //  Pintar
  // ------------------------------------------------------------------------
  function render() {
    const raiz = document.getElementById("diarioRoot");
    if (!raiz) return;
    const hoy = bogotaToday();
    if (!vista.mes) vista.mes = hoy.slice(0, 7);
    if (!vista.dia) vista.dia = hoy;

    const [a, m] = vista.mes.split("-").map(Number);
    const dias = porDia(eventos());

    // Resumen del mes
    const delMes = [...dias.entries()].filter(([d]) => d.startsWith(vista.mes)).flatMap(([, e]) => e);
    const cuenta = (c) => delMes.filter((e) => e.clase === c).length;
    const kpis = Object.entries(CLASES).map(([k, c]) => `<div class="pl-kpi dy-kpi dy-kpi--${k}"><span class="pl-kpi__n">${cuenta(k)}</span><span class="pl-kpi__l">${c.txt}</span></div>`).join("");

    // Cuadricula: semanas de lunes a domingo
    const primero = new Date(Date.UTC(a, m - 1, 1));
    const offset = (primero.getUTCDay() + 6) % 7;
    const enMes = new Date(Date.UTC(a, m, 0)).getUTCDate();
    const celdas = [];
    for (let i = 0; i < offset; i++) celdas.push('<div class="dy-dia is-fuera" aria-hidden="true"></div>');
    for (let d = 1; d <= enMes; d++) {
      const iso = `${vista.mes}-${String(d).padStart(2, "0")}`;
      const ev = dias.get(iso) || [];
      const grupos = Object.keys(CLASES).map((k) => [k, ev.filter((e) => e.clase === k).length]).filter(([, n]) => n);
      const titulo = grupos.length ? grupos.map(([k, n]) => `${n} ${n === 1 ? CLASES[k].uno : CLASES[k].txt.toLowerCase()}`).join(", ") : "sin registros";
      celdas.push(`
        <button type="button" class="dy-dia ${iso === hoy ? "is-hoy" : ""} ${iso === vista.dia ? "is-sel" : ""} ${ev.length ? "" : "is-vacio"} ${iso > hoy ? "is-futuro" : ""}"
          data-dy="dia" data-v="${iso}" aria-label="${d} de ${MESES[m - 1]}: ${titulo}" aria-pressed="${iso === vista.dia}">
          <span class="dy-num">${d}</span>
          <span class="dy-marcas">${grupos.map(([k, n]) => `<span class="dy-k dy-k--${k}" title="${n} ${n === 1 ? CLASES[k].uno : CLASES[k].txt.toLowerCase()}">${n}</span>`).join("")}</span>
        </button>`);
    }

    raiz.innerHTML = `
      <div class="section-bar">
        <div>
          <p class="eyebrow">Seguimiento</p>
          <h2>Diario del taller</h2>
        </div>
      </div>
      <p class="pl-note">Lo que se hizo cada d&iacute;a, sin apuntarlo dos veces: los <strong>reportes de turno</strong>, los <strong>cambios de piezas</strong>, las <strong>tareas</strong>, las <strong>inspecciones</strong> y las <strong>solicitudes de materiales</strong> salen solos de donde ya se registran. Para todo lo dem&aacute;s, deja una <strong>nota del d&iacute;a</strong>.</p>
      <div class="pl-kpis dy-kpis">${kpis}</div>
      <div class="dy-grid">
        <div class="dy-cal">
          <div class="dy-cal__head">
            <button type="button" class="pl-reg" data-dy="mes" data-v="-1" aria-label="Mes anterior">&lsaquo;</button>
            <h3>${MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1)} ${a}</h3>
            <button type="button" class="pl-reg" data-dy="mes" data-v="1" aria-label="Mes siguiente">&rsaquo;</button>
            <button type="button" class="pl-reg" data-dy="hoy">Hoy</button>
          </div>
          <div class="dy-semana" aria-hidden="true">${DIAS.map((d) => `<span>${d.slice(0, 3)}</span>`).join("")}</div>
          <div class="dy-mes">${celdas.join("")}</div>
          <div class="dy-leyenda">${Object.entries(CLASES).map(([k, c]) => `<span><i class="dy-k dy-k--${k}"></i>${c.txt}</span>`).join("")}</div>
        </div>
        <aside class="dy-detalle" id="dyDetalle">${htmlDia(vista.dia, dias.get(vista.dia) || [])}</aside>
      </div>`;
  }

  function htmlDia(iso, ev) {
    const [a, m, d] = iso.split("-").map(Number);
    const fecha = new Date(Date.UTC(a, m - 1, d));
    const titulo = `${DIAS[(fecha.getUTCDay() + 6) % 7]} ${d} de ${MESES[m - 1]}`;
    const orden = ev.slice().sort((x, y) => CLASES[x.clase].orden - CLASES[y.clase].orden || String(x.hora).localeCompare(String(y.hora)));
    const lista = orden.length ? orden.map((e) => `
      <li class="dy-ev dy-ev--${e.clase}">
        <span class="dy-k dy-k--${e.clase}" aria-hidden="true"></span>
        <div>
          <p class="dy-ev__t">${e.clase === "reporte" ? `<button type="button" class="dy-ir-rep" data-dy="ir-reporte" data-id="${esc(e.id || "")}">${esc(e.titulo)}</button>` : esc(e.titulo)}</p>
          ${e.detalle ? `<p class="dy-ev__d">${esc(e.detalle)}</p>` : ""}
          <p class="dy-ev__m">${esc(CLASES[e.clase].uno)}${e.hora ? " · " + esc(e.hora) : ""}${e.quien ? " · " + esc(e.quien) : ""}
            ${e.clase === "nota" ? ` · <button type="button" class="dy-borrar" data-dy="borrar" data-id="${esc(e.id)}">borrar</button>` : ""}</p>
        </div>
      </li>`).join("") : `<li class="pl-soft dy-nada">Nada registrado este d&iacute;a.</li>`;
    return `
      <h3 class="dy-detalle__t">${titulo.charAt(0).toUpperCase() + titulo.slice(1)}</h3>
      <ul class="dy-lista">${lista}</ul>
      <form class="tk-form dy-nota" data-dy="nota">
        <label>Nota del d&iacute;a<textarea name="texto" rows="3" required placeholder="Qu&eacute; se hizo, qu&eacute; qued&oacute; pendiente, qui&eacute;n vino&hellip;"></textarea></label>
        <div class="tk-row2">
          <label>Qui&eacute;n<input name="quien" value="${esc(localStorage.getItem("equipos-bitacora-quien") || "")}" placeholder="Tu nombre"></label>
          <button class="button button--dark" type="submit">Guardar nota</button>
        </div>
      </form>`;
  }

  function pintarDia() {
    const d = document.getElementById("dyDetalle");
    if (!d) return;
    d.innerHTML = htmlDia(vista.dia, porDia(eventos()).get(vista.dia) || []);
  }

  // ------------------------------------------------------------------------
  //  Notas: se guardan en la nube igual que las tareas
  // ------------------------------------------------------------------------
  function guardarNota(n) {
    notas = [...notas.filter((x) => x.id !== n.id), n];
    guardarLocal();
    const cloud = window.CLOUD;
    if (cloud && cloud.enabled && cloud.db) cloud.db.collection("bitacora").doc(n.id).set(n).catch((e) => console.error("[Diario] guardar nota:", e));
  }
  function borrarNota(id) {
    notas = notas.filter((x) => x.id !== id);
    guardarLocal();
    const cloud = window.CLOUD;
    if (cloud && cloud.enabled && cloud.db) cloud.db.collection("bitacora").doc(id).delete().catch((e) => console.error("[Diario] borrar nota:", e));
  }
  function suscribir() {
    const cloud = window.CLOUD;
    if (!(cloud && cloud.enabled && cloud.db)) return;
    cloud.db.collection("bitacora").onSnapshot((snap) => {
      const remoto = [];
      snap.forEach((d) => remoto.push(d.data()));
      notas = remoto;
      guardarLocal();
      renderSiVisible();
    }, (err) => console.error("[Diario] onSnapshot:", err));
  }

  // ------------------------------------------------------------------------
  //  Eventos
  // ------------------------------------------------------------------------
  function enlazar() {
    const raiz = document.getElementById("diarioRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dy]");
      if (!b) return;
      const accion = b.dataset.dy;
      if (accion === "dia") { vista.dia = b.dataset.v; render(); if (window.innerWidth < 1000) document.getElementById("dyDetalle")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      else if (accion === "mes") {
        const [a, m] = vista.mes.split("-").map(Number);
        const f = new Date(Date.UTC(a, m - 1 + Number(b.dataset.v), 1));
        vista.mes = f.toISOString().slice(0, 7);
        render();
      } else if (accion === "hoy") { vista.mes = bogotaToday().slice(0, 7); vista.dia = bogotaToday(); render(); }
      else if (accion === "ir-reporte") { if (window.goReportes) window.goReportes(b.dataset.id); }
      else if (accion === "borrar") { if (window.confirm("¿Borrar esta nota?")) { borrarNota(b.dataset.id); render(); } }
    });
    raiz.addEventListener("submit", (e) => {
      const f = e.target.closest("[data-dy='nota']");
      if (!f) return;
      e.preventDefault();
      const texto = String(f.texto.value || "").trim();
      if (!texto) return;
      const quien = String(f.quien.value || "").trim();
      try { localStorage.setItem("equipos-bitacora-quien", quien); } catch (err) {}
      guardarNota({ id: "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), fecha: vista.dia, texto, quien, createdAt: new Date().toISOString() });
      render();
    });
  }

  function esVisible() { return document.getElementById("diarioView")?.classList.contains("is-active"); }
  function renderSiVisible() { if (esVisible()) render(); }

  function goDiario() {
    views.diario = views.diario || document.getElementById("diarioView");
    setView("diario");
    render();
    enlazar();
    saveUiState({ activeView: "diario" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  window.goDiario = goDiario;
  window.diarioRenderSiVisible = renderSiVisible;
  window.diarioEventos = eventos;   // para las pruebas

  views.diario = document.getElementById("diarioView");
  document.querySelector('[data-nav-view="diario"]')?.addEventListener("click", goDiario);
  suscribir();
})();
