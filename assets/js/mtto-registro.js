// ============================================================================
//  REGISTRO DIARIO DE MANTENIMIENTO
// ============================================================================
//  Lo que la practicante llena cada día a partir del chat "Mtto Medicamentos":
//
//   - Novedades   (colección mtto_registros): una por intervención, con equipo,
//                 categoría de parada, tipo, modo de falla, hora de inicio/fin,
//                 si detuvo la máquina y cómo quedó.
//   - Estados     (colección mtto_estados): el estado de cada equipo en cada
//                 turno de 12 h. De ahí sale el tiempo programado.
//
//  El histórico desde agosto (window.MTTO.hist, generado del chat) se muestra
//  junto con lo registrado. Un registro histórico que se completa aquí se
//  guarda en la nube con el mismo id y reemplaza al del chat.
//
//  window.MTTO_STORE expone los datos ya combinados para el Cuadro de mando.
// ============================================================================

(function () {
  const M = window.MTTO;
  if (!M) return;
  const C = M.catalogo;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const COL_REG = "mtto_registros";
  const COL_EST = "mtto_estados";
  const K_REG = "mtto-registros-v1";
  const K_EST = "mtto-estados-v1";
  const K_QUIEN = "mtto-registrado-por";

  const hoy = () => new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10); // Bogotá
  const sumaDias = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const leerLocal = (k) => { try { return JSON.parse(localStorage.getItem(k) || "{}"); } catch { return {}; } };
  const guardarLocal = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const uid = () => "R" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // ------------------------------------------------------------------------
  //  Datos: histórico + nube (o este navegador si no hay nube)
  // ------------------------------------------------------------------------
  let nubeReg = leerLocal(K_REG);   // id -> registro
  let nubeEst = leerLocal(K_EST);   // "fecha|turno|sede" -> { fecha, turno, sede, estados: {eq: {e, p}} }
  let conectado = false;
  const cloud = () => { const c = window.CLOUD; return c && c.enabled && c.db ? c : null; };

  const HIST = new Map(M.hist.registros.map((r) => [r.id, r]));
  let cacheRegs = null;
  function registros() {
    if (cacheRegs) return cacheRegs;
    const m = new Map(HIST);
    Object.values(nubeReg).forEach((r) => { if (r && r.id) (r.borrado ? m.delete(r.id) : m.set(r.id, r)); });
    cacheRegs = [...m.values()];
    return cacheRegs;
  }
  function invalidar() { cacheRegs = null; cacheHoras = null; avisar(); }

  const equiposSede = (sede, soloProceso) => C.equipos.filter((e) => e.s === sede && (!soloProceso || e.proc));
  const areaDe = (sede, eq) => (C.equipos.find((e) => e.s === sede && e.eq === eq) || {}).ar
    || (window.MTTO_LECTOR ? window.MTTO_LECTOR.areaDe(eq) : "");

  // Estado de cada equipo en un turno: el guardado, o el del último turno
  // conocido (así un turno sin reporte no deja el equipo en cero).
  function estadosTurno(fecha, turno, sede) {
    const doc = nubeEst[`${fecha}|${turno}|${sede}`];
    if (doc) return { estados: doc.estados || {}, guardado: true, doc };
    return { estados: arrastre(fecha, turno, sede), guardado: false };
  }
  function arrastre(fecha, turno, sede) {
    const base = {};
    Object.entries(M.hist.ultimoEstado || {}).forEach(([k, e]) => {
      const [s, eq] = k.split("|");
      if (s === sede) base[eq] = { e, p: "" };
    });
    const previos = Object.values(nubeEst)
      .filter((d) => d.sede === sede && (d.fecha < fecha || (d.fecha === fecha && turno === "Noche" && d.turno === "Día")))
      .sort((a, b) => (a.fecha + (a.turno === "Día" ? 0 : 1)).localeCompare(b.fecha + (b.turno === "Día" ? 0 : 1)));
    previos.forEach((d) => Object.entries(d.estados || {}).forEach(([eq, v]) => { base[eq] = { e: v.e, p: v.p || "" }; }));
    return base;
  }

  // Horas programadas por "sede|equipo" y fecha.
  let cacheHoras = null;
  function horas() {
    if (cacheHoras) return cacheHoras;
    const out = {};
    const add = (k, f, h) => { if (!h) return; (out[k] = out[k] || {}); out[k][f] = (out[k][f] || 0) + h; };
    const prog = new Set(C.programado);
    const H = M.horasTurno || 12;
    const conDoc = new Set(Object.values(nubeEst).map((d) => `${d.fecha}|${d.sede}`));
    // histórico: solo los días en que no se volvió a registrar el estado
    Object.entries(M.hist.horas).forEach(([k, dias]) => {
      const sede = k.split("|")[0];
      Object.entries(dias).forEach(([f, h]) => { if (!conDoc.has(`${f}|${sede}`)) add(k, f, h); });
    });
    // desde el día siguiente al histórico hasta hoy, turno a turno
    const fin = hoy();
    for (const sede of C.sedes) {
      let f = sumaDias(M.hasta, 1);
      const procesos = new Set(equiposSede(sede, true).map((e) => e.eq));
      // también los días del histórico que se volvieron a registrar
      const reg = Object.values(nubeEst).filter((d) => d.sede === sede && d.fecha <= M.hasta).map((d) => d.fecha);
      const dias = [...new Set(reg)];
      for (; f <= fin; f = sumaDias(f, 1)) dias.push(f);
      for (const d of dias) {
        for (const t of C.turnos) {
          const { estados } = estadosTurno(d, t, sede);
          Object.entries(estados).forEach(([eq, v]) => { if (procesos.has(eq) && prog.has(v.e)) add(`${sede}|${eq}`, d, H); });
        }
      }
    }
    cacheHoras = out;
    return out;
  }

  // ------------------------------------------------------------------------
  //  Nube
  // ------------------------------------------------------------------------
  function guardarRegistro(r) {
    r.updatedAt = new Date().toISOString();
    r._pend = 1; // hasta que la nube confirme: no se pierde si la nube falla
    nubeReg[r.id] = r;
    guardarLocal(K_REG, nubeReg);
    invalidar();
    subirRegistro(r);
  }
  function subirRegistro(r) {
    const c = cloud();
    if (!c) return;
    const { _pend, ...limpio } = r;
    c.db.collection(COL_REG).doc(r.id).set(JSON.parse(JSON.stringify(limpio)))
      .then(() => { if (nubeReg[r.id] && nubeReg[r.id].updatedAt === r.updatedAt) { delete nubeReg[r.id]._pend; guardarLocal(K_REG, nubeReg); } })
      .catch((e) => fallo("guardar la novedad", e));
  }
  function borrarRegistro(id) {
    if (HIST.has(id)) {
      // del histórico no se borra: se marca para que deje de contar
      guardarRegistro({ id, borrado: true });
      return;
    }
    delete nubeReg[id];
    guardarLocal(K_REG, nubeReg);
    invalidar();
    const c = cloud();
    if (c) c.db.collection(COL_REG).doc(id).delete().catch((e) => fallo("borrar la novedad", e));
  }
  function guardarEstados(doc) {
    const id = `${doc.fecha}|${doc.turno}|${doc.sede}`;
    doc.id = id;
    doc.updatedAt = new Date().toISOString();
    doc._pend = 1;
    nubeEst[id] = doc;
    guardarLocal(K_EST, nubeEst);
    invalidar();
    subirEstados(doc);
  }
  function subirEstados(doc) {
    const c = cloud();
    if (!c) return;
    const { _pend, ...limpio } = doc;
    c.db.collection(COL_EST).doc(doc.id.replace(/\|/g, "_").replace(/\s/g, "")).set(JSON.parse(JSON.stringify(limpio)))
      .then(() => { const d = nubeEst[doc.id]; if (d && d.updatedAt === doc.updatedAt) { delete d._pend; guardarLocal(K_EST, nubeEst); } })
      .catch((e) => fallo("guardar los estados", e));
  }
  let ultimoFallo = "";
  function fallo(que, e) {
    console.error("[Registro] " + que + ":", e);
    ultimoFallo = `No se pudo ${que} en la nube (${e && e.code ? e.code : "error"}). Quedó guardado en este navegador.`;
    renderSiVisible();
  }
  function suscribir() {
    const c = cloud();
    if (!c) return;
    c.db.collection(COL_REG).onSnapshot({ includeMetadataChanges: true }, (snap) => {
      conectado = !snap.metadata.fromCache;
      const m = {};
      snap.forEach((d) => { const r = d.data(); if (r && r.id) m[r.id] = r; });
      // lo que este navegador guardó y la nube aún no confirmó: se conserva y se vuelve a subir
      Object.values(nubeReg).forEach((r) => {
        if (!r._pend) return;
        const remoto = m[r.id];
        if (!remoto || (remoto.updatedAt || "") < (r.updatedAt || "")) { m[r.id] = r; if (!snap.metadata.fromCache) subirRegistro(r); }
      });
      nubeReg = m;
      guardarLocal(K_REG, nubeReg);
      invalidar();
    }, (e) => { conectado = false; fallo("leer las novedades", e); });
    c.db.collection(COL_EST).onSnapshot((snap) => {
      const m = {};
      snap.forEach((d) => { const r = d.data(); if (r && r.fecha) { r.id = `${r.fecha}|${r.turno}|${r.sede}`; m[r.id] = r; } });
      Object.values(nubeEst).forEach((d) => {
        if (!d._pend) return;
        const remoto = m[d.id];
        if (!remoto || (remoto.updatedAt || "") < (d.updatedAt || "")) { m[d.id] = d; if (!snap.metadata.fromCache) subirEstados(d); }
      });
      nubeEst = m;
      guardarLocal(K_EST, nubeEst);
      invalidar();
    }, (e) => fallo("leer los estados", e));
  }

  const oyentes = new Set();
  function avisar() { renderSiVisible(); oyentes.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); }

  window.MTTO_STORE = {
    registros, horas, equiposSede, areaDe, estadosTurno, hoy, sumaDias,
    alCambiar: (f) => oyentes.add(f),
    irA: (fecha) => goRegistro({ fecha }),
  };

  // ------------------------------------------------------------------------
  //  Vista
  // ------------------------------------------------------------------------
  const vista = { fecha: hoy(), sede: "", tab: "novedades", turnoEst: "Día", sedeEst: "Sede 4", editando: null, pegado: null };
  const DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Iconos de trazo (24 px), del mismo estilo que el menú lateral.
  const ICON = {
    maquina: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    rayo: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>',
    edificio: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    personas: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    luna: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    falla: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    llave: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    borrar: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    pegar: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    descargar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    grafica: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    izq: '<path d="m15 18-6-6 6-6"/>',
    der: '<path d="m9 18 6-6-6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    repuesto: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/>',
    filtro: '<path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/>',
    chispa: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    capas: '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    ficha: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  };
  const ic = (n, cls = "") => `<svg class="mx-ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ""}</svg>`;
  window.MTTO_ICON = ic;
  const CAT = { "Máquina": ["maq", "maquina"], "Apoyo crítico": ["apo", "rayo"], "Locativo": ["loc", "edificio"], "Preventivo": ["pre", "escudo"], "Operacional": ["ope", "personas"] };
  window.MTTO_CAT = CAT;
  const EF = { "Operativo": "ok", "Operativo con pendiente": "warn", "Pendiente": "bad" };
  const EST_EQ = { "Producción": "ok", "Montaje / cuadre": "blue", "Mantenimiento": "bad", "Limpieza": "violet", "Stand by": "neutro", "Sin dato": "neutro" };

  function fechaLarga(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    const dow = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
    return `${dow} ${d} de ${MESES[m - 1]} de ${a}`;
  }
  const hm = (min) => (min == null || min === "" ? "" : min >= 60 ? `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, "0")} min` : `${Math.round(min)} min`);
  const esCorrectivo = (r) => r.tp === "Correctivo" && r.cat === "Máquina";
  const sinTiempo = (r) => esCorrectivo(r) && !(r.min > 0);
  const esPend = (r) => r.ef === "Pendiente" || r.ef === "Operativo con pendiente";

  function delDia() {
    return registros()
      .filter((r) => r.f === vista.fecha && (!vista.sede || r.s === vista.sede))
      .sort((a, b) => a.s.localeCompare(b.s) * -1 || (a.hi || a.hr || "").localeCompare(b.hi || b.hr || ""));
  }

  // ---------------- piezas visuales reutilizables ----------------
  const pend = () => Object.values(nubeReg).filter((r) => r._pend).length + Object.values(nubeEst).filter((d) => d._pend).length;
  function syncPill() {
    const c = cloud();
    const p = pend();
    const [cls, txt, tit] = !c ? ["local", "Solo en este navegador", "Sin conexión a la nube configurada"]
      : conectado ? (p ? ["warn", `${p} por subir`, "Conectado; hay cambios esperando subir"] : ["ok", "Sincronizado", "Todo guardado en la nube"])
      : ["bad", p ? `Sin nube · ${p} por subir` : "Sin conexión a la nube", "La nube no responde o no da permiso; se guarda en este navegador"];
    return `<span class="mx-sync mx-sync--${cls}" title="${tit}"><i></i>${txt}</span>`;
  }
  // barra segmentada tipo "12/32"
  function segBar(hechos, total, n = 20, cls = "") {
    if (!total) return `<span class="mx-segbar ${cls}">${Array.from({ length: n }, () => "<i></i>").join("")}</span>`;
    const on = Math.round((hechos / total) * n);
    return `<span class="mx-segbar ${cls}" role="img" aria-label="${hechos} de ${total}">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? "on" : ""}"></i>`).join("")}</span>`;
  }
  function anillo(p, color) {
    const r = 17, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p || 0));
    return `<svg class="mx-ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="${r}" class="mx-ring__bg"/><circle cx="22" cy="22" r="${r}" style="stroke:${color}" stroke-dasharray="${(v * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 22 22)"/></svg>`;
  }
  function miniBarras(vals, color) {
    const mx = Math.max(...vals, 1);
    return `<span class="mx-minibars" aria-hidden="true">${vals.map((v, i) => `<i style="height:${Math.max(8, (v / mx) * 100)}%;background:${color};opacity:${i === vals.length - 1 ? 1 : 0.45}"></i>`).join("")}</span>`;
  }
  window.MTTO_UI = { segBar, anillo, miniBarras, syncPill: () => syncPill() };

  // ---------------- cabecera ----------------
  function cabecera() {
    return `<header class="mx-head">
      <div class="mx-head__txt">
        <p class="mx-eyebrow">${ic("capas")}Mantenimiento · FARMACAPSULAS</p>
        <h2 class="mx-title">Registro diario</h2>
        <p class="mx-sub">Lo que pasó en planta, turno por turno. De aquí salen los indicadores.</p>
      </div>
      <div class="mx-head__acc">
        ${syncPill()}
        <button class="mx-btn mx-btn--ghost" type="button" data-mt="ver-ind">${ic("grafica")}<span>Indicadores</span></button>
        <button class="mx-btn mx-btn--ghost" type="button" data-mt="exportar">${ic("descargar")}<span>Exportar</span></button>
        <button class="mx-btn mx-btn--soft" type="button" data-mt="pegar">${ic("pegar")}<span>Pegar reporte</span></button>
        <button class="mx-btn mx-btn--primary" type="button" data-mt="nuevo">${ic("mas")}<span>Nueva novedad</span></button>
      </div>
    </header>`;
  }

  // ---------------- selector de día (semana) ----------------
  function tiraDias() {
    const d0 = new Date(vista.fecha + "T12:00:00Z");
    const lunes = sumaDias(vista.fecha, -((d0.getUTCDay() + 6) % 7));
    const dias = Array.from({ length: 7 }, (_, i) => sumaDias(lunes, i));
    const cuenta = {};
    registros().forEach((r) => { if (r.f >= dias[0] && r.f <= dias[6] && (!vista.sede || r.s === vista.sede)) cuenta[r.f] = (cuenta[r.f] || 0) + 1; });
    const [a, m] = vista.fecha.split("-").map(Number);
    const h = hoy();
    return `<section class="mx-card mx-dias" aria-label="Elegir día">
      <div class="mx-dias__top">
        <label class="mx-mes" title="Elegir otra fecha">${ic("calendario")}<span>${MESES[m - 1]} ${a}</span>${ic("der", "mx-ic--sm")}
          <input type="date" value="${vista.fecha}" data-mt-campo="fecha" aria-label="Elegir fecha"></label>
        <div class="mx-seg" role="group" aria-label="Sede">${["", ...C.sedes].map((s) => `<button type="button" data-mt="sede" data-v="${esc(s)}" class="${s === vista.sede ? "is-on" : ""}">${s || "Todas"}</button>`).join("")}</div>
        <div class="mx-dias__nav">
          <button class="mx-btn mx-btn--ghost mx-btn--sm" type="button" data-mt="hoy" ${vista.fecha === h ? "disabled" : ""}>Hoy</button>
          <button class="mx-iconbtn" type="button" data-mt="dia" data-v="-7" aria-label="Semana anterior">${ic("izq")}</button>
          <button class="mx-iconbtn" type="button" data-mt="dia" data-v="7" aria-label="Semana siguiente">${ic("der")}</button>
        </div>
      </div>
      <div class="mx-dias__row">${dias.map((d) => {
        const dd = new Date(d + "T12:00:00Z");
        const n = cuenta[d] || 0;
        return `<button type="button" class="mx-dia ${d === vista.fecha ? "is-on" : ""} ${d > h ? "is-fut" : ""} ${d === h ? "is-hoy" : ""}" data-mt="fecha" data-v="${d}" aria-pressed="${d === vista.fecha}">
          <span>${DOW[dd.getUTCDay()]}</span><b>${String(dd.getUTCDate()).padStart(2, "0")}</b><i>${n ? n : "·"}</i></button>`;
      }).join("")}</div>
      <p class="mx-dias__txt">${esc(fechaLarga(vista.fecha))}${vista.fecha === h ? " · hoy" : ""}</p>
    </section>`;
  }

  // ---------------- indicadores del día ----------------
  function kpis(lista) {
    const corr = lista.filter(esCorrectivo);
    const hPar = lista.filter((r) => r.det !== "No" && r.min > 0).reduce((s, r) => s + r.min, 0) / 60;
    const pnd = lista.filter(esPend).length;
    const st = lista.filter(sinTiempo).length;
    const porCat = C.categorias.map((c) => lista.filter((r) => r.cat === c).length);
    const dia = lista.filter((r) => r.t === "Día").length;
    const tile = (tono, icono, tit, valor, unidad, visual, pie = "") => `
      <article class="mx-tile mx-tile--${tono}">
        <header>${ic(icono)}<span>${tit}</span></header>
        <div class="mx-tile__body"><div><b>${valor}</b><small>${unidad}</small></div>${visual}</div>
        ${pie ? `<footer>${pie}</footer>` : ""}
      </article>`;
    return `<div class="mx-tiles">
      ${tile("blue", "capas", "Novedades", lista.length, `Día ${dia} · Noche ${lista.length - dia}`, miniBarras(porCat, "#2E90FA"))}
      ${tile("red", "falla", "Fallas de máquina", corr.length, "correctivos", anillo(lista.length ? corr.length / lista.length : 0, "#F04438"))}
      ${tile("amber", "reloj", "Horas de parada", hPar ? hPar.toLocaleString("es-CO", { maximumFractionDigits: 1 }) : "0", "horas registradas", anillo(Math.min(1, hPar / 24), "#F79009"))}
      ${tile("violet", "llave", "Con pendiente", pnd, pnd === 1 ? "novedad abierta" : "novedades abiertas", miniBarras([lista.filter((r) => r.ef === "Operativo").length, lista.filter((r) => r.ef === "Operativo con pendiente").length, lista.filter((r) => r.ef === "Pendiente").length], "#7A5AF8"))}
      ${tile(st ? "red" : "green", "check", "Fallas con horario", `${corr.length - st}<em>/${corr.length}</em>`, st ? `faltan ${st}` : corr.length ? "todas completas" : "sin fallas", "", segBar(corr.length - st, corr.length, 16, st ? "is-bad" : "is-ok"))}
    </div>`;
  }

  // ---------------- cierre del día (línea de tiempo) ----------------
  function cierre() {
    let listos = 0, total = 0;
    const sedes = C.sedes.map((sede) => {
      const regs = registros().filter((r) => r.f === vista.fecha && r.s === sede);
      const tDia = regs.some((r) => r.t === "Día") || !!nubeEst[`${vista.fecha}|Día|${sede}`];
      const tNoc = regs.some((r) => r.t === "Noche") || !!nubeEst[`${vista.fecha}|Noche|${sede}`];
      const est = C.turnos.every((t) => nubeEst[`${vista.fecha}|${t}|${sede}`]) || (vista.fecha <= M.hasta && regs.length > 0);
      const st = regs.filter(sinTiempo).length;
      const pasos = [
        ["Reporte turno Día", "8:00 – 20:00", tDia, `${regs.filter((r) => r.t === "Día").length} novedades`],
        ["Reporte turno Noche", "20:00 – 8:00", tNoc, `${regs.filter((r) => r.t === "Noche").length} novedades`],
        ["Estado de equipos", "los dos turnos", est, ""],
        ["Horarios completos", st ? `${st} falla${st > 1 ? "s" : ""} sin inicio y fin` : "inicio y fin de cada falla", regs.length > 0 && st === 0, ""],
      ];
      let activo = false;
      const items = pasos.map(([t, sub, ok, extra], i) => {
        total++; if (ok) listos++;
        const estado = ok ? "done" : !activo ? ((activo = true), "active") : "pending";
        const pill = { done: "Listo", active: "Sigue", pending: "Pendiente" }[estado];
        return `<li class="mx-step mx-step--${estado}"><span class="mx-step__dot">${estado === "done" ? ic("check") : i + 1}</span>
          <div><p><b>${t}</b><span class="mx-mini mx-mini--${estado}">${estado === "active" ? "<i></i>" : ""}${pill}</span></p><small>${esc(sub)}</small></div>
          <em>${extra}</em></li>`;
      }).join("");
      return `<div class="mx-cierre__sede"><h4>${esc(sede)}</h4><ol class="mx-steps">${items}</ol></div>`;
    }).join("");
    const pct = total ? Math.round((listos / total) * 100) : 0;
    const completo = listos === total;
    return `<section class="mx-card mx-cierre">
      <header class="mx-card__head"><div><h3>Cierre del día</h3><p>Lo que debe quedar listo antes de irse</p></div>
        <span class="mx-pill ${completo ? "mx-pill--ok" : "mx-pill--apo"}"><i></i>${completo ? "Completo" : "En curso"}</span></header>
      <div class="mx-cierre__grid">${sedes}</div>
      <footer class="mx-cierre__foot">
        <div class="mx-over"><div class="is-ok"><b>${listos}</b><span>Listos</span></div><div class="is-act"><b>${total - listos ? 1 : 0}</b><span>Siguiente</span></div><div><b>${Math.max(0, total - listos - 1)}</b><span>Pendientes</span></div></div>
        <div class="mx-progress"><span style="width:${pct}%"></span></div>
        <p class="mx-progress__txt"><span>${esc(fechaLarga(vista.fecha))}</span><span>${pct}% completo</span></p>
      </footer>
    </section>`;
  }

  // ---------------- tarjeta de novedad ----------------
  function tarjeta(r, conFecha = false) {
    const [cc, icn] = CAT[r.cat] || CAT["Máquina"];
    const horario = r.hi && r.hf ? `${esc(r.hi)} – ${esc(r.hf)}` : r.min > 0 ? hm(r.min) : sinTiempo(r) ? `<span class="mx-falta">Falta horario</span>` : "—";
    return `<article class="mx-nov ${r.src === "chat" ? "is-hist" : ""}">
      <div class="mx-nov__top">
        <span class="mx-pill mx-pill--${cc}">${ic(icn)}${esc(r.cat || "—")}</span>
        ${r.src === "chat" ? `<span class="mx-tag" title="Cargado del chat de WhatsApp">${ic("chat")}Chat</span>` : ""}
        ${conFecha ? `<button type="button" class="mx-tag mx-tag--link" data-mt="ir" data-v="${r.f}">${ic("calendario")}${Number(r.f.slice(8))} ${MESES[Number(r.f.slice(5, 7)) - 1].slice(0, 3)}</button>` : ""}
        <div class="mx-nov__acc">
          <button type="button" class="mx-iconbtn mx-iconbtn--sm" data-mt="editar" data-id="${esc(r.id)}" title="${r.src === "chat" ? "Completar" : "Editar"}" aria-label="${r.src === "chat" ? "Completar" : "Editar"}">${ic("editar")}</button>
          <button type="button" class="mx-iconbtn mx-iconbtn--sm" data-mt="borrar" data-id="${esc(r.id)}" title="Quitar" aria-label="Quitar">${ic("borrar")}</button>
        </div>
      </div>
      <button type="button" class="mx-nov__eq" data-mt="ver-eq" data-v="${esc(r.s + "|" + r.eq)}" title="Ver hoja de vida de ${esc(r.eq)}">${esc(r.eq || "Sin equipo")}</button>
      <p class="mx-nov__meta">${esc(r.s)} · ${esc(r.ar || "Sin tipo")} · turno ${esc(r.t)}</p>
      <p class="mx-nov__de">${esc(r.de || "")}</p>
      <dl class="mx-inset">
        <div><dt>${ic("falla")}Modo de falla</dt><dd>${r.fa ? `<button type="button" class="mx-link" data-mt="ver-fa" data-v="${esc(r.fa)}">${esc(r.fa)}</button>` : "—"}</dd></div>
        <div><dt>${ic("llave")}Mantenimiento</dt><dd>${esc(r.tp || "—")}</dd></div>
        <div><dt>${ic("reloj")}Horario</dt><dd>${horario}</dd></div>
        ${r.tec ? `<div><dt>${ic("usuario")}${/^chat(-pegado)?$/.test(r.src) ? "Reportó" : "Técnico"}</dt><dd>${esc(r.tec)}</dd></div>` : ""}
      </dl>
      <footer class="mx-nov__foot">
        <span class="mx-est mx-est--${EF[r.ef] || "neutro"}"><i></i>${esc(r.ef || "Sin cierre")}</span>
        ${r.min > 0 ? `<span class="mx-chip">${ic("reloj")}${hm(r.min)}</span>` : ""}
        ${r.frep ? `<span class="mx-chip mx-chip--bad">${ic("repuesto")}Faltó repuesto</span>` : ""}
      </footer>
    </article>`;
  }

  function tablero(lista) {
    if (!lista.length) {
      return `<div class="mx-empty">${ic("chispa", "mx-ic--lg")}<h4>No hay novedades registradas este día</h4>
        <p>Pega el reporte del chat y se llena solo, o agrega la primera novedad a mano.</p>
        <div><button class="mx-btn mx-btn--primary" type="button" data-mt="pegar">${ic("pegar")}Pegar reporte del chat</button>
        <button class="mx-btn mx-btn--ghost" type="button" data-mt="nuevo">${ic("mas")}Nueva novedad</button></div></div>`;
    }
    return `<div class="mx-board">${C.turnos.map((t) => {
      const items = lista.filter((r) => r.t === t);
      const st = items.filter(sinTiempo).length;
      return `<section class="mx-col mx-col--${t === "Día" ? "dia" : "noche"}">
        <header class="mx-col__head">
          <span class="mx-col__ic">${ic(t === "Día" ? "sol" : "luna")}</span>
          <div><h3>Turno ${t} <span class="mx-count">${items.length}</span></h3><small>${t === "Día" ? "8:00 – 20:00" : "20:00 – 8:00"}${st ? ` · <b class="mx-falta">${st} sin horario</b>` : ""}</small></div>
          <button type="button" class="mx-iconbtn" data-mt="nuevo" data-t="${t}" aria-label="Nueva novedad en el turno ${t}" title="Nueva novedad en este turno">${ic("mas")}</button>
        </header>
        <div class="mx-col__list">${items.map((r) => tarjeta(r)).join("") || `<p class="mx-col__vacio">Sin novedades en este turno.</p>`}</div>
      </section>`;
    }).join("")}</div>`;
  }

  // ---------------- estado de equipos ----------------
  function panelEstados() {
    const sede = vista.sedeEst;
    const turno = vista.turnoEst;
    const { estados, guardado, doc } = estadosTurno(vista.fecha, turno, sede);
    const eqs = equiposSede(sede, true);
    const grupos = {};
    eqs.forEach((e) => (grupos[e.ar] = grupos[e.ar] || []).push(e));
    const prog = new Set(C.programado);
    const nProg = eqs.filter((e) => prog.has((estados[e.eq] || {}).e)).length;
    const opts = (sel) => C.estadosEquipo.map((v) => `<option ${v === sel ? "selected" : ""}>${esc(v)}</option>`).join("");
    return `<div class="mx-card mx-est-top">
        <div class="mx-seg" role="group" aria-label="Sede">${C.sedes.map((s) => `<button type="button" data-mt-est="sedeEst" data-v="${esc(s)}" class="${s === sede ? "is-on" : ""}">${esc(s)}</button>`).join("")}</div>
        <div class="mx-seg" role="group" aria-label="Turno">${C.turnos.map((t) => `<button type="button" data-mt-est="turnoEst" data-v="${esc(t)}" class="${t === turno ? "is-on" : ""}">${ic(t === "Día" ? "sol" : "luna")}${esc(t)}</button>`).join("")}</div>
        <div class="mx-est-sum">
          <p><b>${nProg}</b> de ${eqs.length} equipos programados · <b>${nProg * (M.horasTurno || 12)} h</b></p>
          ${segBar(nProg, eqs.length, 24, "is-ok")}
          <small>${guardado ? `${ic("check", "mx-ic--sm")}Guardado${doc.por ? " por " + esc(doc.por) : ""}` : `<span class="mx-falta">Sin guardar</span> · propuesto con el último estado conocido`}</small>
        </div>
      </div>
      <form class="mx-estform" data-mt-form="estados">
        <div class="mx-est__grid">${Object.entries(grupos).map(([ar, lista]) => `
          <section class="mx-group"><header class="mx-group__head"><h4>${esc(ar)}</h4><span class="mx-count">${lista.filter((e) => prog.has((estados[e.eq] || {}).e)).length}/${lista.length}</span></header>
            <div class="mx-group__list">${lista.map((e) => {
              const v = estados[e.eq] || { e: "Sin dato", p: "" };
              return `<div class="mx-eqrow mx-eqrow--${EST_EQ[v.e] || "neutro"}">
                <span class="mx-eqrow__n">${esc(e.eq)}</span>
                <label class="mx-selpill"><i></i><select name="e::${esc(e.eq)}" data-mt-estsel aria-label="Estado de ${esc(e.eq)}">${opts(v.e)}</select></label>
                <input class="mx-input mx-input--sm" name="p::${esc(e.eq)}" value="${esc(v.p || "")}" placeholder="Producto" autocomplete="off" aria-label="Producto en ${esc(e.eq)}">
              </div>`;
            }).join("")}</div></section>`).join("")}
        </div>
        <div class="mx-savebar"><span>Producción, Montaje y Mantenimiento cuentan ${M.horasTurno || 12} h de tiempo programado; Stand by y Limpieza no.</span>
          <button class="mx-btn mx-btn--primary" type="submit">${ic("check")}Guardar turno ${esc(turno)} · ${esc(sede)}</button></div>
      </form>`;
  }

  function pendientes() {
    const desde = sumaDias(hoy(), -45);
    const lista = registros().filter((r) => esPend(r) && r.f >= desde && (!vista.sede || r.s === vista.sede)).sort((a, b) => b.f.localeCompare(a.f));
    if (!lista.length) return `<div class="mx-empty">${ic("check", "mx-ic--lg")}<h4>Sin pendientes abiertos</h4><p>No hay novedades con trabajo pendiente en los últimos 45 días.</p></div>`;
    return `<p class="mx-note">${ic("llave")}Novedades de los últimos 45 días que quedaron con trabajo pendiente. Cuando se resuelva, ábrela y marca <b>Operativo</b>.</p>
      <div class="mx-grid-cards">${lista.map((r) => tarjeta(r, true)).join("")}</div>`;
  }

  function render() {
    const raiz = document.getElementById("registroRoot");
    if (!raiz) return;
    const lista = delDia();
    const tabs = [["novedades", "Novedades", lista.length], ["estados", "Estado de equipos", ""], ["pendientes", "Pendientes abiertos", registros().filter((r) => esPend(r) && r.f >= sumaDias(hoy(), -45)).length]];
    raiz.innerHTML = `<div class="mx-canvas">
      ${cabecera()}
      ${ultimoFallo ? `<p class="mx-note mx-note--bad">${ic("falla")}${esc(ultimoFallo)}</p>` : ""}
      ${tiraDias()}
      ${kpis(lista)}
      ${cierre()}
      <nav class="mx-tabs" role="tablist" aria-label="Secciones del registro">${tabs.map(([k, l, n]) => `<button type="button" role="tab" aria-selected="${vista.tab === k}" data-mt="tab" data-v="${k}" class="${vista.tab === k ? "is-on" : ""}">${l}${n !== "" ? `<span class="mx-count">${n}</span>` : ""}</button>`).join("")}</nav>
      <div class="mx-tabpanel">${vista.tab === "estados" ? panelEstados() : vista.tab === "pendientes" ? pendientes() : tablero(lista)}</div>
    </div>
    <div class="mx-backdrop" ${vista.editando ? "" : "hidden"} data-mt="cerrar"></div>
    <aside class="mx-sheet" ${vista.editando ? "" : "hidden"} aria-label="Novedad" role="dialog" aria-modal="true">${vista.editando ? formulario(vista.editando) : ""}</aside>
    <div class="mx-backdrop" ${vista.pegado ? "" : "hidden"} data-mt="cerrar-pegar"></div>
    <aside class="mx-sheet mx-sheet--ancha" ${vista.pegado ? "" : "hidden"} aria-label="Pegar reporte" role="dialog" aria-modal="true">${vista.pegado ? panelPegar() : ""}</aside>`;
    document.body.classList.toggle("mx-lock", !!(vista.editando || vista.pegado));
  }

  // ------------------------------------------------------------------------
  //  Formulario de una novedad
  // ------------------------------------------------------------------------
  const opt = (vals, sel, vacio) => (vacio !== undefined ? `<option value="">${vacio}</option>` : "") + vals.map((v) => `<option ${v === sel ? "selected" : ""}>${esc(v)}</option>`).join("");
  function optsEquipo(sede, sel) {
    const grupos = {};
    equiposSede(sede).forEach((e) => (grupos[e.ar] = grupos[e.ar] || []).push(e.eq));
    const hay = Object.values(grupos).some((l) => l.includes(sel));
    return `<option value="">Elegir equipo…</option>` +
      Object.entries(grupos).map(([ar, l]) => `<optgroup label="${esc(ar)}">${l.map((eq) => `<option ${eq === sel ? "selected" : ""}>${esc(eq)}</option>`).join("")}</optgroup>`).join("") +
      (sel && !hay ? `<option selected>${esc(sel)}</option>` : "");
  }
  const radio = (name, val, sel, contenido, extra = "") => `<label class="mx-opt ${extra}"><input type="radio" name="${name}" value="${esc(val)}" ${val === sel ? "checked" : ""}${name === "cat" ? " data-mt-cat" : ""}${name === "s" ? " data-mt-sede" : ""}><span class="mx-opt__box">${contenido}</span></label>`;
  const durTxt = (min) => (min > 0 ? `${ic("reloj")}Duración: <b>${hm(min)}</b>` : `${ic("reloj")}Con hora de inicio y fin la duración se calcula sola, también si pasa de medianoche.`);

  function formulario(r) {
    const nuevo = !r.id;
    const quien = localStorage.getItem(K_QUIEN) || "";
    const s = r.s || vista.sede || "Sede 4";
    const t = r.t || turnoActual();
    const cat = r.cat || "Máquina";
    const tp = r.tp || "Correctivo";
    const ef = r.ef || "Operativo";
    const det = r.det || (r.src === "chat" ? "" : "Sí");
    const efs = [...C.estadosFinal, ...(ef === "Sin cierre" ? ["Sin cierre"] : [])];
    const enNube = cloud() && conectado;
    return `<header class="mx-sheet__head">
        <div><p class="mx-eyebrow">${nuevo ? "Nueva novedad" : r.src === "chat" ? "Completar novedad del chat" : "Editar novedad"}</p>
          <h3>${nuevo ? "¿Qué pasó en planta?" : esc(r.eq || "Novedad")}</h3></div>
        <button class="mx-iconbtn" type="button" data-mt="cerrar" aria-label="Cerrar">${ic("x")}</button>
      </header>
      <form class="mx-form" data-mt-form="novedad">
        <div class="mx-form__body">
          <fieldset class="mx-fs"><legend>Cuándo y dónde</legend>
            <div class="mx-grid2">
              <label class="mx-field"><span>Fecha</span><input class="mx-input" type="date" name="f" value="${esc(r.f || vista.fecha)}" required></label>
              <div class="mx-field"><span>Sede</span><div class="mx-seg mx-seg--full">${C.sedes.map((x) => radio("s", x, s, esc(x), "mx-opt--seg")).join("")}</div></div>
            </div>
            <div class="mx-turnos">${C.turnos.map((x) => radio("t", x, t, `${ic(x === "Día" ? "sol" : "luna")}<b>Turno ${x}</b><small>${x === "Día" ? "8:00 – 20:00" : "20:00 – 8:00"}</small>`, "mx-opt--card")).join("")}</div>
            <label class="mx-field"><span>Equipo *</span><select class="mx-input" name="eq" required data-mt-eq>${optsEquipo(s, r.eq)}</select></label>
          </fieldset>

          <fieldset class="mx-fs"><legend>Qué tipo de parada fue</legend>
            <div class="mx-cats">${C.categorias.map((c) => { const [cc, icn] = CAT[c]; return radio("cat", c, cat, `${ic(icn)}<b>${c}</b>`, `mx-opt--cat mx-opt--${cc}`); }).join("")}</div>
            <p class="mx-help" data-mt-ayuda>${esc(C.categoriasAyuda[cat] || "")}</p>
            <div class="mx-field"><span>Tipo de mantenimiento</span><div class="mx-chips">${C.tipos.map((x) => radio("tp", x, tp, esc(x), "mx-opt--chip")).join("")}</div></div>
            <label class="mx-field"><span>Sistema / modo de falla</span><select class="mx-input" name="fa">${opt(C.fallas, r.fa, "Elegir…")}</select></label>
          </fieldset>

          <fieldset class="mx-fs"><legend>Qué pasó y qué se hizo</legend>
            <label class="mx-field"><span>Qué pasó *</span><textarea class="mx-input" name="de" rows="3" required placeholder="Ej. Mordaza de sellado no calienta, el blíster sale abierto">${esc(r.de || "")}</textarea></label>
            <label class="mx-field"><span>Qué se hizo</span><input class="mx-input" name="ac" value="${esc(r.ac || "")}" placeholder="Ej. Se cambia resistencia y se ajusta temperatura"></label>
          </fieldset>

          <fieldset class="mx-fs"><legend>Tiempo de la parada</legend>
            <div class="mx-grid3">
              <label class="mx-field"><span>Hora inicio</span><input class="mx-input" type="time" name="hi" value="${esc(r.hi || "")}" data-mt-hora></label>
              <label class="mx-field"><span>Hora fin</span><input class="mx-input" type="time" name="hf" value="${esc(r.hf || "")}" data-mt-hora></label>
              <label class="mx-field"><span>Minutos</span><input class="mx-input" type="number" name="min" min="0" max="1440" step="1" value="${r.min != null ? Math.round(r.min) : ""}" data-mt-min></label>
            </div>
            <p class="mx-help mx-dur" data-mt-dur>${durTxt(r.min)}</p>
            <div class="mx-field"><span>¿Detuvo la máquina?</span><div class="mx-seg mx-seg--full">${[["Sí", "Sí, estuvo parada"], ["No", "No, siguió operando"], ["", "Sin dato"]].map(([v, l]) => radio("det", v, det, l, "mx-opt--seg")).join("")}</div></div>
          </fieldset>

          <fieldset class="mx-fs"><legend>Cómo quedó</legend>
            <div class="mx-chips">${efs.map((x) => radio("ef", x, ef, `<i class="mx-dot mx-dot--${EF[x] || "neutro"}"></i>${esc(x)}`, "mx-opt--chip")).join("")}</div>
            <div class="mx-grid2">
              <label class="mx-field"><span>Repuesto usado</span><input class="mx-input" name="rep" value="${esc(r.rep || "")}" placeholder="Código o descripción"></label>
              <label class="mx-switch"><input type="checkbox" name="frep" ${r.frep ? "checked" : ""}><span class="mx-switch__ui" aria-hidden="true"></span><span><b>Faltó repuesto</b><small>No había en almacén o hubo que improvisar</small></span></label>
            </div>
          </fieldset>

          <fieldset class="mx-fs"><legend>Quién</legend>
            <div class="mx-grid3">
              <label class="mx-field"><span>Técnico</span><input class="mx-input" name="tec" value="${esc(r.tec || "")}" placeholder="Quién atendió"></label>
              <label class="mx-field"><span>OT / Solicitud</span><input class="mx-input" name="ot" value="${esc(r.ot || "")}" placeholder="Opcional"></label>
              <label class="mx-field"><span>Registrado por</span><input class="mx-input" name="por" value="${esc(r.por || quien)}" placeholder="Tu nombre"></label>
            </div>
          </fieldset>
          <input type="hidden" name="id" value="${esc(r.id || "")}">
        </div>
        <footer class="mx-form__foot">
          <span class="mx-savenote"><i class="${enNube ? "is-ok" : "is-warn"}"></i>${enNube ? "Se guarda en la nube" : "Se guarda en este navegador"}</span>
          <div>
            <button class="mx-btn mx-btn--ghost" type="button" data-mt="cerrar">Cancelar</button>
            ${nuevo ? `<button class="mx-btn mx-btn--soft" type="submit" name="otra" value="1">Guardar y otra</button>` : ""}
            <button class="mx-btn mx-btn--primary" type="submit">${ic("check")}${nuevo ? "Guardar" : "Guardar cambios"}</button>
          </div>
        </footer>
      </form>`;
  }

  function turnoActual() { const h = new Date(Date.now() - 5 * 3600e3).getUTCHours(); return h >= 8 && h < 20 ? "Día" : "Noche"; }
  function minutosEntre(hi, hf) {
    if (!hi || !hf) return null;
    const [a, b] = hi.split(":").map(Number), [c, d] = hf.split(":").map(Number);
    let m = c * 60 + d - (a * 60 + b);
    if (m < 0) m += 1440;
    return m;
  }

  function leerFormulario(f) {
    const g = (n) => String(f.elements[n]?.value ?? "").trim();
    const id = g("id");
    const previo = id ? registros().find((r) => r.id === id) : null;
    const s = g("s"), eq = g("eq");
    const hi = g("hi"), hf = g("hf");
    const minTxt = g("min");
    const min = minutosEntre(hi, hf) ?? (minTxt === "" ? null : Number(minTxt));
    const por = g("por");
    try { localStorage.setItem(K_QUIEN, por); } catch {}
    return {
      ...(previo || {}),
      id: id || uid(),
      f: g("f"), t: g("t"), s, eq, ar: areaDe(s, eq),
      cat: g("cat"), tp: g("tp"), fa: g("fa"), de: g("de"), ac: g("ac"),
      hi, hf, min, det: g("det") || null, ef: g("ef") || (previo ? previo.ef : "Operativo"),
      rep: g("rep"), frep: f.elements.frep?.checked ? 1 : 0, tec: g("tec"), ot: g("ot"), por,
      src: previo && previo.src === "chat" ? "chat-editado" : previo ? previo.src : "registro",
      createdAt: (previo && previo.createdAt) || new Date().toISOString(),
    };
  }

  // ------------------------------------------------------------------------
  //  Pegar un reporte del chat
  // ------------------------------------------------------------------------
  function panelPegar() {
    const p = vista.pegado;
    const cab = (eyebrow, titulo) => `<header class="mx-sheet__head"><div><p class="mx-eyebrow">${eyebrow}</p><h3>${titulo}</h3></div>
      <button class="mx-iconbtn" type="button" data-mt="cerrar-pegar" aria-label="Cerrar">${ic("x")}</button></header>`;
    if (!p.resultado) {
      return `${cab("Pegar reporte del chat", "Copia el reporte y pégalo aquí")}
        <form class="mx-form" data-mt-form="leer">
          <div class="mx-form__body">
            <ol class="mx-howto"><li><b>1</b>En WhatsApp, mantén presionado el reporte y toca <i>Copiar</i>.</li><li><b>2</b>Pégalo abajo y toca <i>Leer reporte</i>.</li><li><b>3</b>Revisa equipo, categoría y horario de cada novedad.</li></ol>
            <div class="mx-grid3">
              <label class="mx-field"><span>Fecha del turno</span><input class="mx-input" type="date" name="f" value="${esc(p.f || vista.fecha)}"></label>
              <div class="mx-field"><span>Turno</span><div class="mx-seg mx-seg--full">${C.turnos.map((x) => radio("t", x, p.t || turnoActual(), `${ic(x === "Día" ? "sol" : "luna")}${x}`, "mx-opt--seg")).join("")}</div></div>
              <label class="mx-field"><span>Técnico que reporta</span><input class="mx-input" name="tec" value="${esc(p.tec || "")}" placeholder="Opcional"></label>
            </div>
            <label class="mx-field"><span>Reporte</span><textarea class="mx-input mx-input--mono" name="txt" rows="12" required placeholder="*REPORTE DE TURNO GRUPO 1 SEDE 4*&#10;BIN: Acetaminofén&#10;BOSCH: Disponible&#10;…&#10;*NOVEDADES*&#10;NJP2: equipo atascado…">${esc(p.txt || "")}</textarea></label>
          </div>
          <footer class="mx-form__foot"><span class="mx-savenote"><i class="is-ok"></i>Nada se guarda hasta que lo revises</span>
            <div><button class="mx-btn mx-btn--ghost" type="button" data-mt="cerrar-pegar">Cancelar</button><button class="mx-btn mx-btn--primary" type="submit">${ic("chispa")}Leer reporte</button></div></footer>
        </form>`;
    }
    const r = p.resultado;
    const nUsar = r.novedades.filter((n) => !n.omitir).length;
    const filas = r.novedades.map((n, i) => {
      const [cc, icn] = CAT[n.cat] || CAT["Máquina"];
      return `<article class="mx-pg ${n.omitir ? "is-off" : ""}">
        <header><label class="mx-switch mx-switch--sm"><input type="checkbox" data-pg="${i}" data-pgk="usar" ${n.omitir ? "" : "checked"}><span class="mx-switch__ui" aria-hidden="true"></span><span><b>${n.omitir ? "No se guarda" : "Guardar"}</b></span></label>
          <span class="mx-pill mx-pill--${cc}">${ic(icn)}${esc(n.cat)}</span>${n.min ? `<span class="mx-chip">${ic("reloj")}${hm(n.min)}</span>` : ""}</header>
        <p class="mx-pg__txt">${esc(n.de)}</p>
        <div class="mx-pg__campos">
          <label class="mx-field"><span>Equipo</span><select class="mx-input mx-input--sm" data-pg="${i}" data-pgk="eq">${optsEquipo(r.sede, n.eq)}</select></label>
          <label class="mx-field"><span>Categoría</span><select class="mx-input mx-input--sm" data-pg="${i}" data-pgk="cat">${opt(C.categorias, n.cat)}</select></label>
          <label class="mx-field"><span>Mantenimiento</span><select class="mx-input mx-input--sm" data-pg="${i}" data-pgk="tp">${opt(C.tipos, n.tp)}</select></label>
          <label class="mx-field"><span>Modo de falla</span><select class="mx-input mx-input--sm" data-pg="${i}" data-pgk="fa">${opt(C.fallas, n.fa, "Elegir…")}</select></label>
          <label class="mx-field"><span>Inicio</span><input class="mx-input mx-input--sm" type="time" data-pg="${i}" data-pgk="hi" value="${esc(n.hi || "")}"></label>
          <label class="mx-field"><span>Fin</span><input class="mx-input mx-input--sm" type="time" data-pg="${i}" data-pgk="hf" value="${esc(n.hf || "")}"></label>
          <label class="mx-field"><span>Min</span><input class="mx-input mx-input--sm" type="number" data-pg="${i}" data-pgk="min" value="${n.min ?? ""}"></label>
          <label class="mx-field"><span>Estado final</span><select class="mx-input mx-input--sm" data-pg="${i}" data-pgk="ef">${opt(C.estadosFinal, n.ef)}</select></label>
        </div>
      </article>`;
    }).join("");
    return `${cab("Revisar lo que se leyó", `${r.novedades.length} novedades · ${r.estados.length} equipos con estado`)}
      <div class="mx-form">
        <div class="mx-form__body">
          <div class="mx-pg-res">
            <span class="mx-chip">${ic("calendario")}${esc(fechaLarga(p.f))}</span>
            <span class="mx-chip">${ic(p.t === "Día" ? "sol" : "luna")}Turno ${esc(p.t)}</span>
            <label class="mx-selpill mx-selpill--sede"><select data-pg-sede aria-label="Sede">${opt(C.sedes, r.sede)}</select></label>
          </div>
          ${r.estados.length ? `<label class="mx-switch"><input type="checkbox" data-pg-est ${p.guardarEstados === false ? "" : "checked"}><span class="mx-switch__ui" aria-hidden="true"></span><span><b>Guardar también el estado de los ${r.estados.length} equipos</b><small>Para el turno ${esc(p.t)} de ${esc(r.sede)}; así se calcula el tiempo programado.</small></span></label>` : ""}
          <div class="mx-pg-lista">${filas || `<div class="mx-empty"><h4>No se encontraron novedades en el texto</h4><p>Revisa que el reporte tenga la parte de NOVEDADES.</p></div>`}</div>
        </div>
        <footer class="mx-form__foot"><span class="mx-savenote"><i class="is-ok"></i>${nUsar} de ${r.novedades.length} seleccionadas</span>
          <div><button class="mx-btn mx-btn--ghost" type="button" data-mt="pegar-volver">${ic("izq")}Volver al texto</button>
          <button class="mx-btn mx-btn--primary" type="button" data-mt="pegar-guardar">${ic("check")}Guardar ${nUsar} novedad${nUsar === 1 ? "" : "es"}</button></div></footer>
      </div>`;
  }

  function guardarPegado() {
    const p = vista.pegado;
    const r = p.resultado;
    const quien = localStorage.getItem(K_QUIEN) || "";
    let n = 0;
    r.novedades.forEach((x) => {
      if (x.omitir) return;
      const min = minutosEntre(x.hi, x.hf) ?? (x.min === "" || x.min == null ? null : Number(x.min));
      guardarRegistro({
        id: uid() + n, f: p.f, t: p.t, s: r.sede, eq: x.eq, ar: areaDe(r.sede, x.eq),
        cat: x.cat, tp: x.tp, fa: x.fa || "", de: x.de, ac: x.ac || "", hi: x.hi || "", hf: x.hf || "", min,
        det: null, ef: x.ef, rep: "", frep: x.frep || 0, tec: p.tec || "", ot: "", por: quien,
        src: "chat-pegado", createdAt: new Date().toISOString(),
      });
      n++;
    });
    if (r.estados.length && p.guardarEstados !== false) {
      const base = estadosTurno(p.f, p.t, r.sede).estados;
      const estados = { ...base };
      r.estados.forEach((e) => { if (e.estado !== "Sin dato") estados[e.eq] = { e: e.estado, p: e.estado === "Producción" ? e.producto : "" }; });
      guardarEstados({ fecha: p.f, turno: p.t, sede: r.sede, estados, por: quien, fuente: "chat-pegado" });
    }
    vista.fecha = p.f;
    vista.pegado = null;
    render();
  }

  // ------------------------------------------------------------------------
  //  Exportar a Excel (mismas columnas que Registro_Mantenimiento_Diario.xlsx)
  // ------------------------------------------------------------------------
  function cargarXLSX() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise((ok, mal) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = () => ok(window.XLSX);
      s.onerror = () => mal(new Error("No se pudo descargar la librería de Excel (hace falta internet)."));
      document.head.appendChild(s);
    });
  }
  async function exportar() {
    try {
      const X = await cargarXLSX();
      const regs = registros().slice().sort((a, b) => (a.f + a.t).localeCompare(b.f + b.t));
      const filas = regs.map((r) => ({
        ID: r.id, Fecha: r.f, Turno: r.t, Sede: r.s, Equipo: r.eq, "Tipo de máquina": r.ar,
        "Categoría de parada": r.cat, "Tipo de mantenimiento": r.tp, "Sistema / modo de falla": r.fa,
        "Qué pasó (falla)": r.de, "Qué se hizo (acción)": r.ac, "Hora inicio": r.hi || "", "Hora fin": r.hf || "",
        "Minutos reportados": r.min ?? "", "Duración (h)": r.min > 0 ? Math.round((r.min / 60) * 100) / 100 : "",
        "¿Detuvo la máquina?": r.det || "", "Estado final": r.ef, "Repuesto usado": r.rep || "",
        "¿Faltó repuesto?": r.frep ? "Sí" : "No", "Técnico": r.tec || "", "OT / Solicitud": r.ot || "",
        "Registrado por": r.por || "", Fuente: r.src === "chat" ? "Chat WhatsApp (histórico)" : r.src === "chat-pegado" ? "Chat WhatsApp" : r.src === "chat-editado" ? "Chat WhatsApp (completado)" : "Registro directo",
      }));
      // Estado de equipos: los turnos registrados tal cual y, para el resto de
      // días (histórico y turnos sin registrar), las horas programadas por día.
      const est = [];
      const conDoc = new Set();
      Object.values(nubeEst).sort((a, b) => (a.fecha + a.turno).localeCompare(b.fecha + b.turno)).forEach((d) => {
        conDoc.add(`${d.fecha}|${d.sede}`);
        Object.entries(d.estados || {}).forEach(([eq, v]) => est.push({ Fecha: d.fecha, Turno: d.turno, Sede: d.sede, Equipo: eq, Estado: v.e, Producto: v.p || "", "Horas programadas": C.programado.includes(v.e) ? M.horasTurno : 0, "Tipo de máquina": areaDe(d.sede, eq), Fuente: "Registro diario" }));
      });
      Object.entries(horas()).forEach(([k, dias]) => {
        const [sede, eq] = k.split("|");
        Object.entries(dias).forEach(([f, h]) => { if (!conDoc.has(`${f}|${sede}`)) est.push({ Fecha: f, Turno: "Día y noche", Sede: sede, Equipo: eq, Estado: "Producción", Producto: "", "Horas programadas": h, "Tipo de máquina": areaDe(sede, eq), Fuente: f <= M.hasta ? "Chat (histórico)" : "Estimado (último estado conocido)" }); });
      });
      est.sort((a, b) => a.Fecha.localeCompare(b.Fecha) || a.Sede.localeCompare(b.Sede) || a.Equipo.localeCompare(b.Equipo));
      const wb = X.utils.book_new();
      const ws = X.utils.json_to_sheet(filas);
      ws["!cols"] = [15, 11, 8, 9, 22, 22, 15, 18, 26, 60, 26, 10, 10, 11, 11, 11, 17, 22, 10, 18, 12, 15, 24].map((w) => ({ wch: w }));
      X.utils.book_append_sheet(wb, ws, "REGISTRO");
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet(est), "ESTADO_EQUIPOS");
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet(C.equipos.map((e) => ({ Sede: e.s, Equipo: e.eq, Clave: `${e.s}|${e.eq}`, "Tipo de máquina": e.ar, "De proceso": e.proc ? "Sí" : "No", Criticidad: "", "Horas por turno": M.horasTurno }))), "EQUIPOS");
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet(Object.entries(M.metas).map(([ar, m]) => ({ "Tipo de máquina": ar, "Meta disponibilidad": m.disp, "Meta MTBF (h)": m.mtbf, "Meta MTTR (h)": m.mttr }))), "METAS");
      X.writeFile(wb, `Registro_Mantenimiento_${hoy()}.xlsx`);
    } catch (e) {
      alert(e.message || String(e));
    }
  }

  // ------------------------------------------------------------------------
  //  Eventos
  // ------------------------------------------------------------------------
  function enlazar() {
    const raiz = document.getElementById("registroRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-mt]");
      if (!b) {
        const s = e.target.closest("[data-mt-est]");
        if (s) { vista[s.dataset.mtEst] = s.dataset.v; render(); }
        return;
      }
      const a = b.dataset.mt;
      if (a === "dia") { vista.fecha = sumaDias(vista.fecha, Number(b.dataset.v)); render(); }
      else if (a === "fecha") { vista.fecha = b.dataset.v; render(); }
      else if (a === "hoy") { vista.fecha = hoy(); render(); }
      else if (a === "ir") { vista.fecha = b.dataset.v; vista.tab = "novedades"; render(); window.scrollTo({ top: 0 }); }
      else if (a === "sede") { vista.sede = b.dataset.v; if (b.dataset.v) vista.sedeEst = b.dataset.v; render(); }
      else if (a === "tab") { vista.tab = b.dataset.v; render(); }
      else if (a === "nuevo") { vista.editando = { s: vista.sede || "Sede 4", ...(b.dataset.t ? { t: b.dataset.t } : {}) }; render(); raiz.querySelector(".mx-sheet [data-mt-eq]")?.focus(); }
      else if (a === "editar") { vista.editando = { ...(registros().find((r) => r.id === b.dataset.id) || {}) }; render(); }
      else if (a === "borrar") {
        const r = registros().find((x) => x.id === b.dataset.id);
        if (r && confirm(`¿Quitar la novedad de ${r.eq} del ${r.f}?${r.src === "chat" ? "\n(Viene del chat: deja de contar en los indicadores.)" : ""}`)) { borrarRegistro(r.id); render(); }
      }
      else if (a === "cerrar") { vista.editando = null; render(); }
      else if (a === "pegar") { vista.pegado = { f: vista.fecha, t: turnoActual() }; render(); raiz.querySelector('[data-mt-form="leer"] textarea')?.focus(); }
      else if (a === "cerrar-pegar") { vista.pegado = null; render(); }
      else if (a === "pegar-volver") { vista.pegado.resultado = null; render(); }
      else if (a === "pegar-guardar") guardarPegado();
      else if (a === "exportar") exportar();
      else if (a === "ver-eq") window.goIndicadores && window.goIndicadores({ eq: b.dataset.v });
      else if (a === "ver-fa") window.goIndicadores && window.goIndicadores({ fa: b.dataset.v });
      else if (a === "ver-ind") window.goIndicadores && window.goIndicadores();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !esVisible() || !(vista.editando || vista.pegado)) return;
      vista.editando = null; vista.pegado = null; render();
    });
    raiz.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.mtCampo === "fecha" && t.value) { vista.fecha = t.value; render(); return; }
      if (t.matches("[data-mt-sede]")) { const f = t.form; f.elements.eq.innerHTML = optsEquipo(t.value, ""); return; }
      if (t.matches("[data-mt-cat]")) { const p = t.form.querySelector("[data-mt-ayuda]"); if (p) p.textContent = C.categoriasAyuda[t.value] || ""; return; }
      if (t.matches("[data-mt-hora], [data-mt-min]")) {
        const f = t.form;
        const m = t.matches("[data-mt-min]") ? Number(t.value) || null : minutosEntre(f.elements.hi.value, f.elements.hf.value);
        if (m != null && !t.matches("[data-mt-min]")) f.elements.min.value = m;
        const d = f.querySelector("[data-mt-dur]");
        if (d) d.innerHTML = durTxt(m);
        return;
      }
      if (t.matches("[data-mt-estsel]")) { const fila = t.closest(".mx-eqrow"); if (fila) fila.className = `mx-eqrow mx-eqrow--${EST_EQ[t.value] || "neutro"}`; return; }
      if (t.matches("[data-pg-sede]")) { vista.pegado.resultado.sede = t.value; render(); return; }
      if (t.matches("[data-pg-est]")) { vista.pegado.guardarEstados = t.checked; return; }
      if (t.dataset.pg != null) {
        const n = vista.pegado.resultado.novedades[Number(t.dataset.pg)];
        const k = t.dataset.pgk;
        if (k === "usar") { n.omitir = !t.checked; render(); return; }
        n[k] = t.value;
        if (k === "eq") n.ar = areaDe(vista.pegado.resultado.sede, t.value);
        if (k === "hi" || k === "hf") { const m = minutosEntre(n.hi, n.hf); if (m != null) { n.min = m; render(); } }
      }
    });
    raiz.addEventListener("submit", (e) => {
      const f = e.target;
      const tipo = f.dataset.mtForm;
      if (!tipo) return;
      e.preventDefault();
      if (tipo === "novedad") {
        const r = leerFormulario(f);
        guardarRegistro(r);
        vista.fecha = r.f;
        const otra = e.submitter && e.submitter.name === "otra";
        vista.editando = otra ? { f: r.f, t: r.t, s: r.s, por: r.por } : null;
        render();
        if (otra) raiz.querySelector(".mx-sheet [data-mt-eq]")?.focus();
      } else if (tipo === "leer") {
        const txt = f.elements.txt.value;
        const res = window.MTTO_LECTOR.leer(txt);
        res.novedades.forEach((n) => { if (n.eq === "No identificado" || !equiposSede(res.sede).some((x) => x.eq === n.eq)) n.eq = n.eq === "No identificado" ? "" : n.eq; });
        vista.pegado = { f: f.elements.f.value, t: f.elements.t.value, tec: f.elements.tec.value.trim(), txt, resultado: res, guardarEstados: true };
        render();
      } else if (tipo === "estados") {
        const estados = {};
        [...f.elements].forEach((el) => {
          if (!el.name) return;
          const [k, eq] = el.name.split("::");
          if (!eq) return;
          estados[eq] = estados[eq] || { e: "Sin dato", p: "" };
          if (k === "e") estados[eq].e = el.value;
          if (k === "p") estados[eq].p = el.value.trim();
        });
        guardarEstados({ fecha: vista.fecha, turno: vista.turnoEst, sede: vista.sedeEst, estados, por: localStorage.getItem(K_QUIEN) || "", fuente: "registro" });
        render();
      }
    });
  }

  function esVisible() { return document.getElementById("registroView")?.classList.contains("is-active"); }
  function renderSiVisible() { if (esVisible()) render(); }

  function goRegistro(op) {
    document.body.classList.remove("mx-lock");
    if (op && op.fecha) { vista.fecha = op.fecha; vista.tab = "novedades"; }
    if (op && op.abrir) {
      const r = registros().find((x) => x.id === op.abrir);
      if (r) { vista.fecha = r.f; vista.tab = "novedades"; vista.editando = { ...r }; }
    }
    views.registro = views.registro || document.getElementById("registroView");
    setView("registro");
    render();
    enlazar();
    saveUiState({ activeView: "registro" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  window.goRegistro = goRegistro;
  views.registro = document.getElementById("registroView");
  document.querySelector('[data-nav-view="registro"]')?.addEventListener("click", () => goRegistro());
  suscribir();
})();
