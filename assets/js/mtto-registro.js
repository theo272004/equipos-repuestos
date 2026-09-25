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

  function fechaLarga(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    const dow = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
    return `${dow} ${d} de ${MESES[m - 1]} de ${a}`;
  }
  const hm = (min) => (min == null || min === "" ? "" : min >= 60 ? `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, "0")} min` : `${Math.round(min)} min`);
  const esCorrectivo = (r) => r.tp === "Correctivo" && r.cat === "Máquina";
  const sinTiempo = (r) => esCorrectivo(r) && !(r.min > 0);

  function delDia() {
    return registros()
      .filter((r) => r.f === vista.fecha && (!vista.sede || r.s === vista.sede))
      .sort((a, b) => (a.t === b.t ? a.s.localeCompare(b.s) * -1 || (a.hi || a.hr || "").localeCompare(b.hi || b.hr || "") : a.t === "Día" ? -1 : 1));
  }

  function chip() {
    const c = cloud();
    const cls = !c ? "is-local" : conectado ? "is-online" : "is-offline";
    const pend = Object.values(nubeReg).filter((r) => r._pend).length + Object.values(nubeEst).filter((d) => d._pend).length;
    const txt = !c ? "Solo local" : conectado ? (pend ? `${pend} por subir` : "Conectado") : pend ? `Sin conexión · ${pend} por subir` : "Sin conexión";
    return `<span class="cloud-chip ${cls}" title="Sincronización con la nube"><span class="cloud-dot"></span><span class="cloud-chip__txt">${txt}</span></span>`;
  }

  function kpis(lista) {
    const corr = lista.filter(esCorrectivo);
    const hPar = lista.filter((r) => r.det !== "No" && r.min > 0).reduce((s, r) => s + r.min, 0);
    const pend = lista.filter((r) => r.ef === "Pendiente" || r.ef === "Operativo con pendiente").length;
    const st = lista.filter(sinTiempo).length;
    const k = (v, l, cls = "") => `<div class="mt-kpi ${cls}"><b>${v}</b><span>${l}</span></div>`;
    return `<div class="mt-kpis">
      ${k(lista.length, "novedades")}
      ${k(corr.length, "fallas de máquina")}
      ${k(hPar ? (hPar / 60).toFixed(1) + " h" : "0 h", "horas de parada")}
      ${k(pend, "con pendiente", pend ? "is-warn" : "")}
      ${k(st, "fallas sin hora de inicio/fin", st ? "is-bad" : "is-ok")}
    </div>`;
  }

  function cierre() {
    const filas = C.sedes.map((sede) => {
      const regs = registros().filter((r) => r.f === vista.fecha && r.s === sede);
      const paso = (ok, txt) => `<li class="${ok ? "is-ok" : ""}"><span class="mt-check">${ok ? "✓" : ""}</span>${txt}</li>`;
      const tDia = regs.some((r) => r.t === "Día") || !!nubeEst[`${vista.fecha}|Día|${sede}`];
      const tNoc = regs.some((r) => r.t === "Noche") || !!nubeEst[`${vista.fecha}|Noche|${sede}`];
      const est = C.turnos.every((t) => nubeEst[`${vista.fecha}|${t}|${sede}`]) || (vista.fecha <= M.hasta && regs.length > 0);
      const st = regs.filter(sinTiempo).length;
      return `<div class="mt-cierre__sede"><h4>${esc(sede)}</h4><ul>
        ${paso(tDia, "Reporte turno Día (8:00–20:00) cargado")}
        ${paso(tNoc, "Reporte turno Noche (20:00–8:00) cargado")}
        ${paso(est, "Estado de equipos de los dos turnos")}
        ${paso(regs.length > 0 && st === 0, st ? `${st} falla${st > 1 ? "s" : ""} sin hora de inicio/fin` : "Todas las fallas con horario")}
      </ul></div>`;
    }).join("");
    return `<section class="mt-card mt-cierre"><div class="mt-card__head"><h3>Cierre del día</h3><span class="pl-soft">lo que debe quedar listo antes de irse</span></div><div class="mt-cierre__grid">${filas}</div></section>`;
  }

  function badgeCat(r) {
    const c = { "Máquina": "maq", "Apoyo crítico": "apo", "Locativo": "loc", "Preventivo": "pre", "Operacional": "ope" }[r.cat] || "maq";
    return `<span class="mt-tag mt-tag--${c}">${esc(r.cat || "—")}</span>`;
  }
  function badgeEstado(ef) {
    const c = ef === "Operativo" ? "ok" : ef === "Pendiente" ? "bad" : ef === "Operativo con pendiente" ? "warn" : "neutro";
    return `<span class="mt-est mt-est--${c}">${esc(ef || "Sin cierre")}</span>`;
  }

  function tablaNovedades(lista) {
    if (!lista.length) {
      return `<div class="mt-vacio"><p><strong>No hay novedades registradas este día.</strong></p>
        <p class="pl-soft">Pega el reporte del chat o agrega la primera novedad.</p>
        <div class="mt-vacio__acc"><button class="button button--dark" type="button" data-mt="pegar">Pegar reporte del chat</button>
        <button class="button button--light" type="button" data-mt="nuevo">Nueva novedad</button></div></div>`;
    }
    return `<div class="mt-tabla-wrap"><table class="mt-tabla">
      <thead><tr><th>Turno</th><th>Equipo</th><th>Categoría</th><th>Qué pasó y qué se hizo</th><th>Horario</th><th>Estado</th><th></th></tr></thead>
      <tbody>${lista.map((r) => {
        const horario = r.hi && r.hf ? `${esc(r.hi)}–${esc(r.hf)}<small>${hm(r.min)}</small>` : r.min ? `<small>${hm(r.min)}</small>` : sinTiempo(r) ? `<span class="mt-falta">falta</span>` : `<span class="pl-soft">—</span>`;
        const origen = r.src === "chat" ? `<span class="mt-src" title="Cargado del chat">chat</span>` : "";
        return `<tr class="${r.src === "chat" ? "is-hist" : ""}">
          <td><strong>${esc(r.t)}</strong><small>${esc(r.s)}</small></td>
          <td><strong>${esc(r.eq)}</strong><small>${esc(r.ar || "")}</small></td>
          <td>${badgeCat(r)}<small>${esc(r.tp || "")}${r.fa ? " · " + esc(r.fa) : ""}</small></td>
          <td class="mt-desc"><p>${esc(r.de || "")}</p>${r.ac ? `<small>Acción: ${esc(r.ac)}</small>` : ""}${r.rep ? `<small>Repuesto: ${esc(r.rep)}</small>` : ""}${r.frep ? `<small class="mt-falta">Faltó repuesto</small>` : ""}</td>
          <td class="mt-hor">${horario}</td>
          <td>${badgeEstado(r.ef)}${r.tec ? `<small>${esc(r.tec)}</small>` : ""}${origen}</td>
          <td class="mt-acc"><button type="button" class="mt-ico" data-mt="editar" data-id="${esc(r.id)}" title="${r.src === "chat" ? "Completar" : "Editar"}">✎</button><button type="button" class="mt-ico" data-mt="borrar" data-id="${esc(r.id)}" title="Quitar">×</button></td>
        </tr>`;
      }).join("")}</tbody></table></div>`;
  }

  function panelEstados() {
    const sede = vista.sedeEst;
    const turno = vista.turnoEst;
    const { estados, guardado, doc } = estadosTurno(vista.fecha, turno, sede);
    const eqs = equiposSede(sede, true);
    const grupos = {};
    eqs.forEach((e) => (grupos[e.ar] = grupos[e.ar] || []).push(e));
    const prog = new Set(C.programado);
    const nProg = eqs.filter((e) => prog.has((estados[e.eq] || {}).e)).length;
    const seg = (campo, valores, actual) => `<div class="tn-seg">${valores.map((v) => `<button type="button" data-mt-est="${campo}" data-v="${esc(v)}" class="${v === actual ? "is-active" : ""}">${esc(v)}</button>`).join("")}</div>`;
    const opts = (sel) => C.estadosEquipo.map((v) => `<option ${v === sel ? "selected" : ""}>${esc(v)}</option>`).join("");
    return `<div class="mt-est-bar">
        ${seg("sedeEst", C.sedes, sede)} ${seg("turnoEst", C.turnos, turno)}
        <span class="mt-est-info">${guardado ? `Guardado${doc.por ? " por " + esc(doc.por) : ""}` : `<span class="mt-falta">Sin guardar</span> · propuesto con el último estado conocido`} · <strong>${nProg}</strong> de ${eqs.length} equipos programados = <strong>${nProg * (M.horasTurno || 12)} h</strong></span>
      </div>
      <form class="mt-est-form" data-mt-form="estados">
        <div class="mt-est-grid">${Object.entries(grupos).map(([ar, lista]) => `
          <fieldset><legend>${esc(ar)}</legend>${lista.map((e) => {
            const v = estados[e.eq] || { e: "Sin dato", p: "" };
            return `<div class="mt-est-fila mt-est-fila--${prog.has(v.e) ? "prog" : "no"}">
              <span>${esc(e.eq)}</span>
              <select name="e::${esc(e.eq)}">${opts(v.e)}</select>
              <input name="p::${esc(e.eq)}" value="${esc(v.p || "")}" placeholder="Producto" autocomplete="off">
            </div>`;
          }).join("")}</fieldset>`).join("")}
        </div>
        <div class="mt-est-save"><span class="pl-soft">Producción, Montaje y Mantenimiento cuentan ${M.horasTurno || 12} h de tiempo programado; Stand by y Limpieza no.</span>
          <button class="button button--dark" type="submit">Guardar estados del turno ${esc(turno)} · ${esc(sede)}</button></div>
      </form>`;
  }

  function pendientes() {
    const desde = sumaDias(hoy(), -45);
    const lista = registros()
      .filter((r) => (r.ef === "Pendiente" || r.ef === "Operativo con pendiente") && r.f >= desde && (!vista.sede || r.s === vista.sede))
      .sort((a, b) => b.f.localeCompare(a.f));
    if (!lista.length) return `<p class="pl-soft mt-vacio">Sin pendientes abiertos en los últimos 45 días.</p>`;
    return `<p class="pl-note">Novedades de los últimos 45 días que quedaron con trabajo pendiente. Cuando se resuelva, ábrela y cambia el <strong>Estado final</strong> a Operativo.</p>
      <div class="mt-tabla-wrap"><table class="mt-tabla"><thead><tr><th>Fecha</th><th>Equipo</th><th>Qué quedó pendiente</th><th>Estado</th><th></th></tr></thead><tbody>
      ${lista.map((r) => `<tr><td><button type="button" class="mt-link" data-mt="ir" data-v="${r.f}">${r.f.slice(8)}/${r.f.slice(5, 7)}</button><small>${esc(r.t)} · ${esc(r.s)}</small></td>
        <td><strong>${esc(r.eq)}</strong><small>${esc(r.ar || "")}</small></td><td class="mt-desc"><p>${esc(r.de)}</p></td><td>${badgeEstado(r.ef)}</td>
        <td class="mt-acc"><button type="button" class="mt-ico" data-mt="editar" data-id="${esc(r.id)}" title="Actualizar">✎</button></td></tr>`).join("")}
      </tbody></table></div>`;
  }

  function render() {
    const raiz = document.getElementById("registroRoot");
    if (!raiz) return;
    const lista = delDia();
    const segSede = `<div class="tn-seg">${["", ...C.sedes].map((s) => `<button type="button" data-mt="sede" data-v="${esc(s)}" class="${s === vista.sede ? "is-active" : ""}">${s || "Todas"}</button>`).join("")}</div>`;
    const tabs = [["novedades", `Novedades <span class="rp-count">${lista.length}</span>`], ["estados", "Estado de equipos"], ["pendientes", "Pendientes abiertos"]];
    raiz.innerHTML = `
      <div class="section-bar">
        <div><p class="eyebrow">Mantenimiento</p><h2>Registro diario</h2></div>
        <div class="section-actions">
          ${chip()}
          <button class="button button--light" type="button" data-mt="exportar">Exportar Excel</button>
          <button class="button button--light" type="button" data-mt="pegar">Pegar reporte del chat</button>
          <button class="button button--dark" type="button" data-mt="nuevo">+ Nueva novedad</button>
        </div>
      </div>
      ${ultimoFallo ? `<p class="pl-note mt-aviso">${esc(ultimoFallo)}</p>` : ""}
      <div class="mt-dia">
        <div class="mt-dia__nav">
          <button type="button" class="mt-ico" data-mt="dia" data-v="-1" aria-label="Día anterior">‹</button>
          <input type="date" value="${vista.fecha}" data-mt-campo="fecha" aria-label="Fecha">
          <button type="button" class="mt-ico" data-mt="dia" data-v="1" aria-label="Día siguiente">›</button>
          <button type="button" class="button button--light" data-mt="hoy">Hoy</button>
          <strong class="mt-dia__txt">${esc(fechaLarga(vista.fecha))}</strong>
        </div>
        ${segSede}
      </div>
      ${kpis(lista)}
      ${cierre()}
      <div class="mt-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-mt="tab" data-v="${k}" class="${vista.tab === k ? "is-active" : ""}">${l}</button>`).join("")}</div>
      <div class="mt-tabpanel">${vista.tab === "estados" ? panelEstados() : vista.tab === "pendientes" ? pendientes() : tablaNovedades(lista)}</div>
      <div class="tk-sheet-backdrop" id="mtSheetBackdrop" ${vista.editando ? "" : "hidden"} data-mt="cerrar"></div>
      <aside class="tk-sheet tk-sheet--ancha mt-sheet" ${vista.editando ? "" : "hidden"} aria-label="Novedad">${vista.editando ? formulario(vista.editando) : ""}</aside>
      <div class="tk-sheet-backdrop" ${vista.pegado ? "" : "hidden"} data-mt="cerrar-pegar"></div>
      <aside class="tk-sheet mt-sheet mt-sheet--pegar" ${vista.pegado ? "" : "hidden"} aria-label="Pegar reporte">${vista.pegado ? panelPegar() : ""}</aside>`;
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

  function formulario(r) {
    const nuevo = !r.id;
    const quien = localStorage.getItem(K_QUIEN) || "";
    return `<div class="tk-sheet__head"><h4>${nuevo ? "Nueva novedad" : r.src === "chat" ? "Completar novedad del chat" : "Editar novedad"}</h4>
        <button class="tk-sheet__close" type="button" data-mt="cerrar" aria-label="Cerrar">&times;</button></div>
      <form class="tk-form mt-form" data-mt-form="novedad">
        <div class="mt-row3">
          <label>Fecha<input type="date" name="f" value="${esc(r.f || vista.fecha)}" required></label>
          <label>Turno<select name="t">${opt(C.turnos, r.t || turnoActual())}</select></label>
          <label>Sede<select name="s" data-mt-sede>${opt(C.sedes, r.s || vista.sede || "Sede 4")}</select></label>
        </div>
        <label>Equipo *<select name="eq" required data-mt-eq>${optsEquipo(r.s || vista.sede || "Sede 4", r.eq)}</select></label>
        <div class="mt-row3">
          <label>Categoría de parada<select name="cat" data-mt-cat>${opt(C.categorias, r.cat || "Máquina")}</select></label>
          <label>Tipo de mantenimiento<select name="tp">${opt(C.tipos, r.tp || "Correctivo")}</select></label>
          <label>Sistema / modo de falla<select name="fa">${opt(C.fallas, r.fa, "—")}</select></label>
        </div>
        <p class="mt-ayuda" data-mt-ayuda>${esc(C.categoriasAyuda[r.cat || "Máquina"] || "")}</p>
        <label>Qué pasó (falla o trabajo) *<textarea name="de" rows="3" required placeholder="Ej. Mordaza de sellado no calienta, el blíster sale abierto">${esc(r.de || "")}</textarea></label>
        <label>Qué se hizo (acción)<input name="ac" value="${esc(r.ac || "")}" placeholder="Ej. Se cambia resistencia y se ajusta temperatura"></label>
        <div class="mt-row4">
          <label>Hora inicio<input type="time" name="hi" value="${esc(r.hi || "")}" data-mt-hora></label>
          <label>Hora fin<input type="time" name="hf" value="${esc(r.hf || "")}" data-mt-hora></label>
          <label>Minutos<input type="number" name="min" min="0" max="1440" step="1" value="${r.min != null ? Math.round(r.min) : ""}" data-mt-min></label>
          <label>¿Detuvo la máquina?<select name="det">${opt(["Sí", "No"], r.det || (r.src === "chat" ? "" : "Sí"), "Sin dato")}</select></label>
        </div>
        <p class="mt-ayuda">Con hora de inicio y fin los minutos se calculan solos (también si pasa de medianoche). Sin horario no hay disponibilidad ni MTTR.</p>
        <div class="mt-row3">
          <label>Estado final<select name="ef">${opt(C.estadosFinal, r.ef === "Sin cierre" ? "" : r.ef || "Operativo", r.ef === "Sin cierre" ? "Sin cierre" : undefined)}</select></label>
          <label>Repuesto usado<input name="rep" value="${esc(r.rep || "")}" placeholder="Código o descripción"></label>
          <label class="mt-check-l"><input type="checkbox" name="frep" ${r.frep ? "checked" : ""}> Faltó repuesto</label>
        </div>
        <div class="mt-row3">
          <label>Técnico<input name="tec" value="${esc(r.tec || "")}" placeholder="Quién atendió"></label>
          <label>OT / Solicitud<input name="ot" value="${esc(r.ot || "")}" placeholder="Opcional"></label>
          <label>Registrado por<input name="por" value="${esc(r.por || quien)}" placeholder="Tu nombre"></label>
        </div>
        <input type="hidden" name="id" value="${esc(r.id || "")}">
        <button class="button button--dark" type="submit">${nuevo ? "Guardar novedad" : "Guardar cambios"}</button>
        ${nuevo ? `<button class="button button--light" type="submit" name="otra" value="1">Guardar y agregar otra</button>` : ""}
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
    if (!p.resultado) {
      return `<div class="tk-sheet__head"><h4>Pegar reporte del chat</h4><button class="tk-sheet__close" type="button" data-mt="cerrar-pegar" aria-label="Cerrar">&times;</button></div>
        <form class="tk-form" data-mt-form="leer">
          <p class="mt-ayuda">Copia el reporte de turno completo en WhatsApp (mantener presionado → Copiar) y pégalo aquí. Se separan solos el estado de los equipos y cada novedad; después revisas y completas lo que falte.</p>
          <div class="mt-row3">
            <label>Fecha del turno<input type="date" name="f" value="${esc(p.f || vista.fecha)}"></label>
            <label>Turno<select name="t">${opt(C.turnos, p.t || turnoActual())}</select></label>
            <label>Técnico que reporta<input name="tec" value="${esc(p.tec || "")}" placeholder="Opcional"></label>
          </div>
          <label>Reporte<textarea name="txt" rows="12" required placeholder="*REPORTE DE TURNO GRUPO 1 SEDE 4*&#10;BIN: Acetaminofén&#10;BOSCH: Disponible&#10;…&#10;*NOVEDADES*&#10;NJP2: equipo atascado…">${esc(p.txt || "")}</textarea></label>
          <button class="button button--dark" type="submit">Leer reporte</button>
        </form>`;
    }
    const r = p.resultado;
    const filas = r.novedades.map((n, i) => `
      <div class="mt-pg-nov ${n.omitir ? "is-off" : ""}">
        <label class="mt-pg-sel"><input type="checkbox" data-pg="${i}" data-pgk="usar" ${n.omitir ? "" : "checked"}> Guardar</label>
        <div class="mt-pg-campos">
          <select data-pg="${i}" data-pgk="eq">${optsEquipo(r.sede, n.eq)}</select>
          <select data-pg="${i}" data-pgk="cat">${opt(C.categorias, n.cat)}</select>
          <select data-pg="${i}" data-pgk="tp">${opt(C.tipos, n.tp)}</select>
          <select data-pg="${i}" data-pgk="fa">${opt(C.fallas, n.fa, "Modo de falla…")}</select>
          <input type="time" data-pg="${i}" data-pgk="hi" value="${esc(n.hi || "")}" title="Hora inicio">
          <input type="time" data-pg="${i}" data-pgk="hf" value="${esc(n.hf || "")}" title="Hora fin">
          <input type="number" data-pg="${i}" data-pgk="min" value="${n.min ?? ""}" placeholder="min" title="Minutos">
          <select data-pg="${i}" data-pgk="ef">${opt(C.estadosFinal, n.ef)}</select>
        </div>
        <p class="mt-pg-txt">${esc(n.de)}</p>
      </div>`).join("");
    const nUsar = r.novedades.filter((n) => !n.omitir).length;
    return `<div class="tk-sheet__head"><h4>Revisar lo que se leyó</h4><button class="tk-sheet__close" type="button" data-mt="cerrar-pegar" aria-label="Cerrar">&times;</button></div>
      <div class="mt-pg-res">
        <p><strong>${esc(r.sede)}</strong> · turno <strong>${esc(p.t)}</strong> · ${esc(fechaLarga(p.f))}
          <select data-pg-sede>${opt(C.sedes, r.sede)}</select></p>
        <p>${r.estados.length} equipos con estado · ${r.novedades.length} novedades. Revisa el equipo, la categoría y, si el técnico lo dijo, la hora de inicio y fin.</p>
        ${r.estados.length ? `<label class="mt-check-l"><input type="checkbox" data-pg-est checked> Guardar también el estado de los ${r.estados.length} equipos para el turno ${esc(p.t)}</label>` : ""}
      </div>
      <div class="mt-pg-lista">${filas || `<p class="pl-soft">No se encontraron novedades en el texto.</p>`}</div>
      <div class="mt-pg-acc">
        <button class="button button--light" type="button" data-mt="pegar-volver">Volver al texto</button>
        <button class="button button--dark" type="button" data-mt="pegar-guardar">Guardar ${nUsar} novedad${nUsar === 1 ? "" : "es"}</button>
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
      const est = [];
      Object.values(nubeEst).sort((a, b) => (a.fecha + a.turno).localeCompare(b.fecha + b.turno)).forEach((d) =>
        Object.entries(d.estados || {}).forEach(([eq, v]) => est.push({ Fecha: d.fecha, Turno: d.turno, Sede: d.sede, Equipo: eq, Estado: v.e, Producto: v.p || "", "Horas programadas": C.programado.includes(v.e) ? M.horasTurno : 0, "Registrado por": d.por || "" })));
      const wb = X.utils.book_new();
      const ws = X.utils.json_to_sheet(filas);
      ws["!cols"] = [15, 11, 8, 9, 22, 22, 15, 18, 26, 60, 26, 10, 10, 11, 11, 11, 17, 22, 10, 18, 12, 15, 24].map((w) => ({ wch: w }));
      X.utils.book_append_sheet(wb, ws, "REGISTRO");
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet(est.length ? est : [{ Fecha: "", Turno: "", Sede: "", Equipo: "", Estado: "", Producto: "", "Horas programadas": "" }]), "ESTADO_EQUIPOS");
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
      else if (a === "hoy") { vista.fecha = hoy(); render(); }
      else if (a === "ir") { vista.fecha = b.dataset.v; vista.tab = "novedades"; render(); window.scrollTo({ top: 0 }); }
      else if (a === "sede") { vista.sede = b.dataset.v; if (b.dataset.v) vista.sedeEst = b.dataset.v; render(); }
      else if (a === "tab") { vista.tab = b.dataset.v; render(); }
      else if (a === "nuevo") { vista.editando = { s: vista.sede || "Sede 4" }; render(); }
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
    });
    raiz.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.mtCampo === "fecha" && t.value) { vista.fecha = t.value; render(); return; }
      if (t.matches("[data-mt-sede]")) { const f = t.form; f.elements.eq.innerHTML = optsEquipo(t.value, ""); return; }
      if (t.matches("[data-mt-cat]")) { const p = t.form.querySelector("[data-mt-ayuda]"); if (p) p.textContent = C.categoriasAyuda[t.value] || ""; return; }
      if (t.matches("[data-mt-hora]")) { const f = t.form; const m = minutosEntre(f.elements.hi.value, f.elements.hf.value); if (m != null) f.elements.min.value = m; return; }
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
        if (otra) raiz.querySelector(".mt-sheet [data-mt-eq]")?.focus();
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
    if (op && op.fecha) { vista.fecha = op.fecha; vista.tab = "novedades"; }
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
