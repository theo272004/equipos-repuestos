// ============================================================================
//  CALENDARIO: todo lo que pasó cada día, en un solo lugar
// ============================================================================
//  No pide que nadie apunte nada dos veces: junta lo que la app ya registra
//    - novedades del Registro diario (y cuántas fueron fallas de máquina)
//    - reportes de turno del chat
//    - cambios de repuestos (Plan de mantenimiento -> Registrar)
//    - tareas creadas y terminadas
//    - inspecciones
//    - solicitudes de materiales (Almacén)
//  y le suma una nota libre por día ("bitácora") para lo que no cabe en lo
//  anterior. Al tocar un día se ve quién estuvo de turno y todo lo de ese día,
//  agrupado. Las notas se comparten con el taller igual que las tareas.
// ============================================================================

(function () {
  const NOTAS = "equipos-bitacora-v1";
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  // txt: plural · uno: singular · ir: a dónde lleva "ver todo"
  const CLASES = {
    novedad: { txt: "Novedades", uno: "novedad", orden: 0 },
    reporte: { txt: "Reportes", uno: "reporte", orden: 1 },
    insp: { txt: "Inspecciones", uno: "inspección", orden: 2 },
    prog: { txt: "Mantenimientos", uno: "mantenimiento programado", orden: 2.5 },
    tarea: { txt: "Tareas", uno: "tarea", orden: 3 },
    cambio: { txt: "Cambios de piezas", uno: "cambio", orden: 4 },
    sol: { txt: "Solicitudes", uno: "solicitud", orden: 5 },
    nota: { txt: "Notas", uno: "nota", orden: 6 },
  };

  let notas = cargar();
  const vista = { mes: "", dia: "", ocultas: new Set() };

  function cargar() { try { return JSON.parse(localStorage.getItem(NOTAS) || "[]"); } catch (e) { return []; } }
  function guardarLocal() { try { localStorage.setItem(NOTAS, JSON.stringify(notas)); } catch (e) {} }
  const esc = (v) => planEsc(v);
  const ic = (n, c) => (window.IC ? window.IC(n, c) : "");

  // Día en Colombia de una marca de tiempo ISO: una tarea terminada a las 9 de
  // la noche en planta es de ese día, no del siguiente en hora UTC.
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

  const esFalla = (r) => r.cat === "Máquina" && r.tp === "Correctivo";

  // Todo lo que pasó, como una lista plana de eventos con su día.
  function eventos() {
    const ev = [];
    const S = window.MTTO_STORE;
    if (S) S.registros().forEach((r) => {
      if (!r || r.borrado || !r.f) return;
      ev.push({ clase: "novedad", dia: r.f, hora: r.hr || r.hi || "", quien: /^chat/.test(r.src || "") ? "" : (r.tec || r.por || ""), falla: esFalla(r), id: r.id,
        titulo: `${r.eq || "Sin equipo"}${r.cat ? " · " + r.cat : ""}`,
        detalle: String(r.de || "").replace(/\s+/g, " ").slice(0, 180), sede: r.s || "", turno: r.t || "" });
    });
    // Resumen de los reportes de turno (lista completa en la pestaña Reportes)
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
        titulo: `${nombreEquipo(i.eq)}${i.tipo ? " · " + i.tipo : ""}`,
        detalle: [i.hallazgos, piezas ? `${piezas} ${piezas === 1 ? "pieza" : "piezas"} para cambiar` : "", i.estado === "cerrada" ? "cerrada" : ""].filter(Boolean).join(" · ") });
    });
    // Mantenimientos programados desde el Seguimiento
    if (typeof inspecciones !== "undefined") inspecciones.forEach((i) => {
      if (!i || !i.programado || (i.estado || "abierta") === "cerrada") return;
      const n = (i.piezas || []).filter((p) => !p.hecho).length;
      ev.push({ clase: "prog", dia: i.programado, hora: "", quien: "", id: i.id, prog: true,
        titulo: `Mantenimiento programado: ${nombreEquipo(i.eq)}`, detalle: n ? `${n} ${n === 1 ? "hallazgo" : "hallazgos"} de la inspección del ${i.fecha}` : "" });
    });
    (window.almSolicitudes ? window.almSolicitudes() : []).forEach((s) => {
      if (!s || !s.fecha || s.estado === "pedido" || s.estado === "atendido") return;
      const n = (s.lineas || []).length;
      const tipo = (window.almTipos && window.almTipos[s.tipo]) || s.tipo || "";
      ev.push({ clase: "sol", dia: s.fecha, hora: horaCO(s.createdAt), quien: s.solicitadoPor, id: s.id,
        titulo: `${tipo || "Solicitud"}: ${n} ${n === 1 ? "artículo" : "artículos"}${s.destino ? " para " + s.destino : ""}`,
        detalle: (s.lineas || []).slice(0, 4).map((l) => `${l.cant} × ${l.desc || l.cod}`).join(" · ") + (n > 4 ? ` · y ${n - 4} más` : "") });
    });
    notas.forEach((n) => {
      if (!n || !n.fecha) return;
      ev.push({ clase: "nota", dia: n.fecha, hora: horaCO(n.createdAt), quien: n.quien, titulo: n.texto, detalle: "", id: n.id });
    });
    return ev.filter((e) => !vista.ocultas.has(e.clase));
  }

  function porDia(ev) {
    const m = new Map();
    ev.forEach((e) => { if (!m.has(e.dia)) m.set(e.dia, []); m.get(e.dia).push(e); });
    return m;
  }
  const cuantos = (n, k) => `${n} ${n === 1 ? CLASES[k].uno : CLASES[k].txt.toLowerCase()}`;

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

    // Resumen del mes: una cifra por tipo
    const delMes = [...dias.entries()].filter(([d]) => d.startsWith(vista.mes)).flatMap(([, e]) => e);
    const cuenta = (c) => delMes.filter((e) => e.clase === c).length;
    const fallasMes = delMes.filter((e) => e.falla).length;
    const kpis = Object.entries(CLASES).filter(([k]) => !vista.ocultas.has(k)).map(([k, c]) =>
      `<div class="pl-kpi"><span class="pl-kpi__n">${cuenta(k).toLocaleString("es-CO")}</span><span class="pl-kpi__l">${c.txt}${k === "novedad" && fallasMes ? ` · <b class="cal-rojo">${fallasMes} fallas</b>` : ""}</span></div>`).join("");

    // Cuadrícula: semanas de lunes a domingo
    const primero = new Date(Date.UTC(a, m - 1, 1));
    const offset = (primero.getUTCDay() + 6) % 7;
    const enMes = new Date(Date.UTC(a, m, 0)).getUTCDate();
    const celdas = [];
    for (let i = 0; i < offset; i++) celdas.push('<div class="dy-dia is-fuera" aria-hidden="true"></div>');
    for (let d = 1; d <= enMes; d++) {
      const iso = `${vista.mes}-${String(d).padStart(2, "0")}`;
      const ev = dias.get(iso) || [];
      const grupos = Object.keys(CLASES).map((k) => [k, ev.filter((e) => e.clase === k).length]).filter(([, n]) => n);
      const fallas = ev.filter((e) => e.falla).length;
      const titulo = grupos.length ? grupos.map(([k, n]) => cuantos(n, k)).join(", ") : "sin registros";
      celdas.push(`
        <button type="button" class="dy-dia ${iso === hoy ? "is-hoy" : ""} ${iso === vista.dia ? "is-sel" : ""} ${ev.length ? "" : "is-vacio"} ${iso > hoy ? "is-futuro" : ""}"
          data-dy="dia" data-v="${iso}" aria-label="${d} de ${MESES[m - 1]}: ${titulo}" aria-pressed="${iso === vista.dia}">
          <span class="dy-num">${d}</span>
          <span class="dy-marcas">${fallas ? `<span class="dy-k dy-k--falla" title="${fallas} ${fallas === 1 ? "falla" : "fallas"} de máquina">${fallas}</span>` : ""}${grupos.map(([k, n]) => `<span class="dy-k dy-k--${k}" title="${cuantos(n, k)}">${n}</span>`).join("")}</span>
        </button>`);
    }
    const nombreMes = MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1);

    raiz.innerHTML = `
      <div class="section-bar">
        <div><h2>Calendario</h2></div>
      </div>
      <div class="pl-kpis dy-kpis">${kpis}</div>
      <div class="cal-filtros">${Object.entries(CLASES).map(([k, c]) => `<button type="button" class="ux-chip cal-chip ${vista.ocultas.has(k) ? "" : "is-on"}" data-dy="filtro" data-v="${k}" aria-pressed="${!vista.ocultas.has(k)}"><i class="dy-k dy-k--${k}"></i>${c.txt}</button>`).join("")}<span class="cal-leyenda"><i class="dy-k dy-k--falla"></i>Fallas de máquina</span></div>
      <div class="dy-grid">
        <div class="dy-cal">
          <div class="dy-cal__head">
            <h3>${nombreMes} ${a}</h3>
            <button type="button" class="ux-btn ux-btn--sm" data-dy="hoy">Hoy</button>
            <button type="button" class="ux-btn ux-btn--sm ux-btn--icon" data-dy="mes" data-v="-1" aria-label="Mes anterior">${ic("izq", "ic--sm")}</button>
            <button type="button" class="ux-btn ux-btn--sm ux-btn--icon" data-dy="mes" data-v="1" aria-label="Mes siguiente">${ic("der", "ic--sm")}</button>
          </div>
          <div class="dy-semana" aria-hidden="true">${DIAS.map((d) => `<span>${d.slice(0, 3)}</span>`).join("")}</div>
          <div class="dy-mes">${celdas.join("")}</div>
        </div>
        <aside class="dy-detalle" id="dyDetalle">${htmlDia(vista.dia, dias.get(vista.dia) || [])}</aside>
      </div>`;
  }

  // Quién estuvo de turno ese día (del cuadro de 6 días)
  function htmlTurno(iso) {
    const T = window.TURNOS;
    if (!T) return "";
    const fila = (clave, txt) => {
      const q = T.quienes(iso, clave);
      const partes = Object.values(q).filter((s) => s.gente.length).map((s) => `<span><b>${esc(s.sede)}:</b> ${s.gente.map((p) => esc(p.nombre.split(" ").slice(0, 2).join(" "))).join(", ")}</span>`);
      return partes.length ? `<div class="cal-turno__f"><span class="cal-turno__t">${ic(clave === "dia" ? "sol" : "luna", "ic--sm")}${txt}</span><div>${partes.join("")}</div></div>` : "";
    };
    const html = fila("dia", "Día") + fila("noche", "Noche");
    return html ? `<div class="cal-turno">${html}</div>` : "";
  }

  function htmlEvento(e) {
    const tituloHtml = e.clase === "reporte" ? `<button type="button" class="dy-ir-rep" data-dy="ir-reporte" data-id="${esc(e.id || "")}">${esc(e.titulo)}</button>`
      : e.clase === "sol" ? `<button type="button" class="dy-ir-rep" data-dy="ir-sol" data-id="${esc(e.id || "")}">${esc(e.titulo)}</button>`
      : e.prog ? `<button type="button" class="dy-ir-rep" data-dy="ir-seg" data-id="${esc(e.id || "")}">${esc(e.titulo)}</button>`
      : e.clase === "novedad" ? `<button type="button" class="dy-ir-rep" data-dy="ir-reg" data-id="${esc(e.id || "")}">${esc(e.titulo)}</button>`
      : esc(e.titulo);
    return `<li class="dy-ev dy-ev--${e.clase} ${e.falla ? "is-falla" : ""}">
        <span class="dy-ev__h">${esc(e.hora || "")}</span>
        <div>
          <p class="dy-ev__t">${tituloHtml}</p>
          ${e.detalle ? `<p class="dy-ev__d">${esc(e.detalle)}</p>` : ""}
          ${e.quien || e.sede || e.clase === "nota" ? `<p class="dy-ev__m">${[e.sede, e.turno, e.quien].filter(Boolean).map(esc).join(" · ")}
            ${e.clase === "nota" ? ` · <button type="button" class="dy-borrar" data-dy="borrar" data-id="${esc(e.id)}">borrar</button>` : ""}</p>` : ""}
        </div>
      </li>`;
  }

  function htmlDia(iso, ev) {
    const [a, m, d] = iso.split("-").map(Number);
    const fecha = new Date(Date.UTC(a, m - 1, d));
    const titulo = `${DIAS[(fecha.getUTCDay() + 6) % 7]} ${d} de ${MESES[m - 1]}`;
    const MAX = 6;
    const secciones = Object.keys(CLASES).map((k) => {
      const lista = ev.filter((e) => e.clase === k).sort((x, y) => String(y.hora).localeCompare(String(x.hora)));
      if (!lista.length) return "";
      const fallas = lista.filter((e) => e.falla).length;
      const abierta = vista.abierta === k;
      const ver = abierta ? lista : lista.slice(0, MAX);
      return `<section class="cal-sec">
        <h4><i class="dy-k dy-k--${k}"></i>${CLASES[k].txt} <span class="ux-mute">${lista.length}</span>${fallas ? ` <span class="cal-rojo">· ${fallas} ${fallas === 1 ? "falla" : "fallas"}</span>` : ""}</h4>
        <ul class="dy-lista">${ver.map(htmlEvento).join("")}</ul>
        ${lista.length > MAX && !abierta ? `<button type="button" class="ux-link" data-dy="abrir" data-v="${k}">Ver las ${lista.length}</button>` : ""}
        ${k === "novedad" ? ` <button type="button" class="ux-link" data-dy="ir-registro" data-v="${iso}">Abrir en el Registro</button>` : ""}
      </section>`;
    }).join("");
    return `
      <h3 class="dy-detalle__t">${titulo.charAt(0).toUpperCase() + titulo.slice(1)}</h3>
      ${htmlTurno(iso)}
      ${secciones || `<p class="pl-soft dy-nada">Nada registrado este día.</p>`}
      <form class="tk-form dy-nota" data-dy="nota">
        <label>Nota del día<textarea name="texto" rows="2" required placeholder="Qué se hizo, qué quedó pendiente, quién vino…"></textarea></label>
        <div class="tk-row2">
          <label>Quién<input name="quien" value="${esc(localStorage.getItem("equipos-bitacora-quien") || "")}" placeholder="Tu nombre"></label>
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
      if (accion === "dia") { vista.dia = b.dataset.v; vista.abierta = ""; render(); if (window.innerWidth < 1000) document.getElementById("dyDetalle")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      else if (accion === "mes") {
        const [a, m] = vista.mes.split("-").map(Number);
        const f = new Date(Date.UTC(a, m - 1 + Number(b.dataset.v), 1));
        vista.mes = f.toISOString().slice(0, 7);
        render();
      } else if (accion === "hoy") { vista.mes = bogotaToday().slice(0, 7); vista.dia = bogotaToday(); render(); }
      else if (accion === "filtro") { const k = b.dataset.v; if (vista.ocultas.has(k)) vista.ocultas.delete(k); else vista.ocultas.add(k); render(); }
      else if (accion === "abrir") { vista.abierta = b.dataset.v; pintarDia(); }
      else if (accion === "ir-reporte") { if (window.goReportes) window.goReportes(b.dataset.id); }
      else if (accion === "ir-seg") window.goSeguimiento?.({ id: b.dataset.id });
      else if (accion === "ir-sol") window.goSolicitudes?.({ solicitud: b.dataset.id });
      else if (accion === "ir-reg") window.goRegistro?.({ abrir: b.dataset.id });
      else if (accion === "ir-registro") window.goRegistro?.({ fecha: b.dataset.v });
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
  let t = null;
  window.MTTO_STORE?.alCambiar?.(() => { if (!esVisible()) return; clearTimeout(t); t = setTimeout(render, 250); });

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
