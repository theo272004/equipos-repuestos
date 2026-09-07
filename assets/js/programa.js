// ======================================================================
//  PROGRAMA ANUAL DE MANTENIMIENTO PREVENTIVO
//
//  Pasa a la aplicacion los dos formatos de papel:
//
//  - DMM-173B, el programa anual: que equipo toca en que semana del anio.
//    Los datos salen de window.PROGRAMA_ANUAL (scripts/gen-programa-anual.py).
//  - DMM-160L, la rutina: la lista de actividades que se firma al ejecutar.
//
//  Lo que la hoja de papel no puede hacer y aqui si:
//
//  - La lista de actividades no es siempre la generica. Si el equipo tiene
//    ficha con plan sacado de su propio manual -la MT-1100 con sus 46 tareas,
//    la GKF con 47, la Integra con 80-, la rutina se arma con ESAS tareas, con
//    su frecuencia y su criterio de aceptacion. El papel solo tenia una lista
//    fija por tipo de maquina.
//  - El estado deja de ser una casilla en blanco y pasa a ser una respuesta
//    con significado: hecho, ajustado, cambiado, no aplica o hay que
//    programarlo. Lo que se marca "programar" queda contado aparte.
//  - Vencido se calcula solo, comparando la semana programada con hoy.
//  - Las horas-hombre se suman solas.
//
//  Se guarda igual que las inspecciones: en el navegador y, si hay nube
//  configurada, en la coleccion "mantenimientos".
// ======================================================================

const progKey = "equipos-mantenimientos-v1";
let mantenimientos = progLoad();
let progKnownIds = new Set();
const progNube = { conectado: false, error: "" };
const progVista = { mes: "", q: "", soloPendientes: false };
let progForm = null;

const PROG_ESTADOS = {
  ok: "Hecho, sin novedad",
  ajustado: "Ajustado",
  cambiado: "Se cambio la pieza",
  na: "No aplica",
  programar: "Hay que programarlo"
};

// Actividades de base para un equipo que no tiene ni rutina en papel ni plan
// propio en su ficha. Es el minimo que el formato DMM pide en cualquier maquina.
const PROG_BASE = [
  "Inspeccionar estado de estructura y pintura",
  "Revisar ajuste de conexiones electricas",
  "Revisar fugas en conexiones y tuberias",
  "Limpieza general del equipo",
  "Lubricar partes mecanicas",
  "Verificar funcionamiento de motor",
  "Verificar dispositivos de seguridad y protecciones"
];

function progDatos() { return window.PROGRAMA_ANUAL || null; }
function progLoad() { try { return JSON.parse(localStorage.getItem(progKey) || "[]"); } catch { return []; } }
function progSaveLocal() { try { localStorage.setItem(progKey, JSON.stringify(mantenimientos)); } catch (e) {} }
function progSave() {
  progSaveLocal();
  if (cloud.enabled && cloud.db) progSync();
  progRenderIfVisible();
  renderFichaSiVisible();
}

function progSync() {
  try {
    const col = cloud.db.collection("mantenimientos");
    const batch = cloud.db.batch();
    const ids = new Set();
    mantenimientos.forEach((m) => { ids.add(m.id); batch.set(col.doc(m.id), JSON.parse(JSON.stringify(m))); });
    progKnownIds.forEach((id) => { if (!ids.has(id)) batch.delete(col.doc(id)); });
    progKnownIds = ids;
    batch.commit().catch((e) => { progNube.error = e && e.code ? e.code : "error"; console.error("[Mantenimientos] guardar nube:", e); });
  } catch (e) { console.error("[Mantenimientos] progSync:", e); }
}

function progSubscribe() {
  if (!(cloud.enabled && cloud.db)) return;
  cloud.db.collection("mantenimientos").onSnapshot({ includeMetadataChanges: true }, (snap) => {
    const remoto = [];
    snap.forEach((d) => remoto.push(d.data()));
    mantenimientos = remoto;
    progKnownIds = new Set(remoto.map((m) => m.id));
    progNube.conectado = !snap.metadata.fromCache;
    progNube.error = "";
    progSaveLocal();
    progRenderIfVisible();
    renderFichaSiVisible();
  }, (err) => {
    progNube.conectado = false;
    progNube.error = err && err.code ? err.code : "error";
    console.error("[Mantenimientos] onSnapshot:", err);
  });
}

// ----- Fechas: la casilla del programa es una SEMANA ISO, no un dia -----

function progLunes(anio, sem) {
  // Lunes de la semana ISO: el 4 de enero siempre cae en la semana 1.
  const cuatro = new Date(Date.UTC(anio, 0, 4));
  const dow = cuatro.getUTCDay() || 7;
  const lunes1 = new Date(cuatro);
  lunes1.setUTCDate(cuatro.getUTCDate() - dow + 1);
  const d = new Date(lunes1);
  d.setUTCDate(lunes1.getUTCDate() + (sem - 1) * 7);
  return d;
}

function progSemanaDe(fecha) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow);
  const ini = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { anio: d.getUTCFullYear(), sem: Math.ceil(((d - ini) / 86400000 + 1) / 7) };
}

const PROG_MES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function progRango(anio, sem) {
  const l = progLunes(anio, sem);
  const v = new Date(l); v.setUTCDate(l.getUTCDate() + 4);
  const mismoMes = l.getUTCMonth() === v.getUTCMonth();
  return mismoMes
    ? `${l.getUTCDate()}–${v.getUTCDate()} de ${PROG_MES_CORTO[l.getUTCMonth()]}`
    : `${l.getUTCDate()} ${PROG_MES_CORTO[l.getUTCMonth()]} – ${v.getUTCDate()} ${PROG_MES_CORTO[v.getUTCMonth()]}`;
}

function progHoy() { return progSemanaDe(new Date()); }

// ----- Consultas -----

function progRegistros(cod, mes) {
  return mantenimientos.filter((m) => m && m.eq === cod && (!mes || m.mes === mes));
}
function progDeEquipo(cod) {
  return mantenimientos.filter((m) => m && m.eq === cod)
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
}

// Estado de una casilla del programa: ejecutado, vencido o pendiente.
function progEstado(cod, mes, sem) {
  const reg = progRegistros(cod, mes)[0];
  if (reg) return { k: "hecho", t: "Ejecutado " + progFechaCorta(reg.fecha), reg };
  const hoy = progHoy();
  const D = progDatos();
  if (D.anio < hoy.anio || (D.anio === hoy.anio && sem < hoy.sem)) return { k: "vencido", t: "Vencido" };
  if (D.anio === hoy.anio && sem === hoy.sem) return { k: "ahora", t: "Esta semana" };
  return { k: "pend", t: "Programado" };
}

function progFechaCorta(f) {
  const p = String(f || "").split("-");
  return p.length === 3 ? `${+p[2]} ${PROG_MES_CORTO[+p[1] - 1]}` : f || "";
}

// Casillas del mes elegido, cada una con su equipo y su estado.
function progFilasDelMes(mes) {
  const D = progDatos();
  if (!D) return [];
  const tokens = planTokens(progVista.q);
  return D.equipos
    .filter((e) => e.sem[mes])
    .map((e) => ({ e, sem: e.sem[mes], est: progEstado(e.c, mes, e.sem[mes]) }))
    .filter((r) => {
      if (progVista.soloPendientes && r.est.k === "hecho") return false;
      if (!tokens.length) return true;
      const hay = planPlain([r.e.n, r.e.c, r.e.tipo, r.e.u].join(" "));
      return tokens.every((t) => hay.includes(t));
    })
    .sort((a, b) => a.sem - b.sem || a.e.n.localeCompare(b.e.n));
}

// ----- Rutina: de donde salen las actividades de este equipo -----

function progRutinaPapel(cod) {
  const D = progDatos();
  return (D && D.rutinas || []).find((r) => r.equipos.includes(cod)) || null;
}

// La ficha de este equipo, si la tiene, para usar SU plan en vez del generico.
function progFichaDe(cod) {
  const m = (typeof machines !== "undefined" ? machines : []).find(
    (x) => String(x.equipoCod) === String(cod) && !x.fromRegistry && (x.maintenanceTasks || []).length);
  return m || null;
}

function progActividades(cod) {
  const papel = progRutinaPapel(cod);
  if (papel) {
    return {
      origen: "papel", doc: papel.doc, archivo: papel.archivo,
      items: papel.actividades.map((a) => ({ a, nota: "" }))
    };
  }
  const ficha = progFichaDe(cod);
  if (ficha) {
    return {
      origen: "ficha", doc: `Plan del manual de ${ficha.name}`, mid: ficha.id,
      items: ficha.maintenanceTasks.map((t) => ({
        a: t.name,
        nota: [t.frequency, t.system].filter(Boolean).join(" · ")
      }))
    };
  }
  return { origen: "base", doc: "Lista base de mantenimiento preventivo",
           items: PROG_BASE.map((a) => ({ a, nota: "" })) };
}

// ----- Vista -----

function progRenderIfVisible() {
  if (document.getElementById("progView")?.classList.contains("is-active")) renderPrograma();
}

function goPrograma() {
  setView("prog");
  renderPrograma();
  saveUiState({ activeView: "prog" });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderPrograma() {
  const root = document.getElementById("progRoot");
  const D = progDatos();
  if (!root) return;
  if (!D) { root.innerHTML = '<div class="pl-empty"><h3>No se cargó el programa anual</h3></div>'; return; }

  if (!progVista.mes) {
    const m = D.meses[new Date().getMonth()];
    progVista.mes = D.equipos.some((e) => e.sem[m]) ? m : D.meses.find((x) => D.equipos.some((e) => e.sem[x]));
  }

  const total = D.equipos.reduce((n, e) => n + Object.keys(e.sem).length, 0);
  const hechos = D.equipos.reduce((n, e) => n + Object.keys(e.sem).filter((m) => progRegistros(e.c, m).length).length, 0);
  const vencidos = D.equipos.reduce((n, e) => n + Object.keys(e.sem)
    .filter((m) => progEstado(e.c, m, e.sem[m]).k === "vencido").length, 0);
  const hoy = progHoy();
  const estaSem = D.equipos.reduce((n, e) => n + Object.keys(e.sem)
    .filter((m) => e.sem[m] === hoy.sem && D.anio === hoy.anio).length, 0);

  const filas = progFilasDelMes(progVista.mes);
  const pendMes = filas.filter((r) => r.est.k !== "hecho").length;

  root.innerHTML = `
    <div class="section-bar">
      <div>
        <p class="eyebrow">Mantenimiento</p>
        <h2>Programa anual ${D.anio}</h2>
      </div>
      <div class="section-actions">
        <span class="counter">${D.equipos.length} equipos &middot; ${total} mantenimientos programados</span>
        <a class="button button--light" href="${D.archivo.split("/").map(encodeURIComponent).join("/")}" target="_blank" rel="noopener">Ver el formato en PDF</a>
      </div>
    </div>
    <p class="pl-note">${planEsc(D.doc)}. La casilla de cada mes es la <strong>semana</strong> del año en que toca, no el día.
      Al registrar un mantenimiento se llena la rutina de actividades: si el equipo tiene ficha con plan de su manual,
      se usan <strong>esas</strong> tareas; si no, la lista del formato en papel.</p>

    <div class="pl-kpis">
      <div class="info-card"><span class="pl-kpi__n">${total}</span><span>Programados en el año</span></div>
      <div class="info-card"><span class="pl-kpi__n" style="color:var(--ok,#116b3a)">${hechos}</span><span>Ejecutados y registrados</span></div>
      <div class="info-card"><span class="pl-kpi__n" style="color:#a3211d">${vencidos}</span><span>Vencidos sin registrar</span></div>
      <div class="info-card"><span class="pl-kpi__n">${estaSem}</span><span>Tocan esta semana (sem. ${hoy.sem})</span></div>
    </div>

    <div class="pl-filters" role="tablist" aria-label="Mes del programa">
      ${D.meses.map((m) => {
        const n = D.equipos.filter((e) => e.sem[m]).length;
        if (!n) return "";
        const pend = D.equipos.filter((e) => e.sem[m] && progEstado(e.c, m, e.sem[m]).k !== "hecho").length;
        return `<button class="pl-chk${m === progVista.mes ? " is-on" : ""}" type="button" role="tab"
          aria-selected="${m === progVista.mes}" onclick="progSetMes('${m}')">
          ${m.charAt(0) + m.slice(1).toLowerCase()} <span class="pl-tag pl-tag--n">${pend ? pend + " por hacer" : "al día"}</span></button>`;
      }).join("")}
    </div>

    <div class="tk-filters">
      <input type="search" id="progSearch" placeholder="Buscar equipo por nombre o código&hellip;"
        value="${planEsc(progVista.q)}" oninput="progSetFiltro('q', this.value)" aria-label="Buscar en el programa">
      <button class="pl-chk${progVista.soloPendientes ? " is-on" : ""}" type="button"
        onclick="progSetFiltro('soloPendientes', ${!progVista.soloPendientes})">Solo lo que falta</button>
    </div>

    <p class="pl-soft">${filas.length} ${filas.length === 1 ? "equipo" : "equipos"} en
      ${progVista.mes.charAt(0) + progVista.mes.slice(1).toLowerCase()} &middot; ${pendMes} por registrar</p>

    ${filas.length ? filas.map(progTarjeta).join("") :
      '<div class="pl-empty"><h3>Nada que mostrar</h3><p>Prueba con otro mes o quita el filtro.</p></div>'}
    ${renderDescuadres()}`;
}

function progTarjeta(r) {
  const D = progDatos();
  const cls = { hecho: "pl-tag--ok", vencido: "pl-tag--warn", ahora: "pl-tag--link", pend: "pl-tag--n" }[r.est.k];
  const ficha = progFichaDe(r.e.c);
  const papel = progRutinaPapel(r.e.c);
  return `
    <article class="pl-eq">
      <div class="pl-eq__head" style="cursor:default">
        <span class="pl-eq__main">
          <span class="pl-eq__name">${planEsc(r.e.n)}</span>
          <span class="pl-eq__sub">Código ${planEsc(r.e.c)} &middot; ${planEsc(r.e.tipo)} &middot; ${planEsc(r.e.u)}
            &middot; semana ${r.sem} (${progRango(D.anio, r.sem)})</span>
        </span>
        <span class="pl-eq__tags">
          <span class="pl-tag ${cls}">${planEsc(r.est.t)}</span>
          ${papel ? '<span class="pl-tag pl-tag--n">rutina DMM-160L</span>'
            : ficha ? `<span class="pl-tag pl-tag--link">plan del manual · ${ficha.maintenanceTasks.length} tareas</span>`
            : '<span class="pl-tag pl-tag--n">lista base</span>'}
        </span>
      </div>
      <div class="prog-eq__body">
        ${r.est.reg ? progResumenRegistro(r.est.reg) : ""}
        <button class="button ${r.est.reg ? "button--light" : "button--dark"}" type="button"
          onclick="progAbrirForm('${planEsc(r.e.c)}','${planEsc(progVista.mes)}',${r.sem})">
          ${r.est.reg ? "Registrar otro" : "Registrar mantenimiento"}</button>
        ${ficha ? `<button class="button button--light" type="button" onclick="openDetail('${ficha.id}')">Abrir la ficha</button>` : ""}
      </div>
    </article>`;
}

function progResumenRegistro(m) {
  const cuenta = (k) => (m.actividades || []).filter((a) => a.estado === k).length;
  const prog = cuenta("programar");
  return `
    <div class="pl-reg">
      <p class="pl-soft"><strong>${planEsc(progFechaCorta(m.fecha))}</strong>${m.quien ? " &middot; " + planEsc(m.quien) : ""}${m.turno ? " &middot; turno " + planEsc(m.turno) : ""}${m.hh ? " &middot; " + planEsc(String(m.hh)) + " HH" : ""}</p>
      <p class="pl-soft">${(m.actividades || []).length} actividades &middot; ${cuenta("ok")} sin novedad &middot; ${cuenta("ajustado")} ajustadas &middot; ${cuenta("cambiado")} con cambio de pieza${prog ? ` &middot; <strong style="color:#a3211d">${prog} para programar</strong>` : ""}</p>
      ${m.comentarios ? `<p class="pl-soft">${planEsc(m.comentarios)}</p>` : ""}
      ${m.programar ? `<p class="pl-soft"><strong>A programar:</strong> ${planEsc(m.programar)}</p>` : ""}
      <button class="pl-ev__x" type="button" title="Borrar este registro" onclick="progBorrar('${m.id}')">&times;</button>
    </div>`;
}

function progSetMes(m) { progVista.mes = m; renderPrograma(); }
function progSetFiltro(k, v) {
  progVista[k] = v;
  renderPrograma();
  if (k === "q") { const i = document.getElementById("progSearch"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
}

function progBorrar(id) {
  if (!window.confirm("¿Borrar este registro de mantenimiento?")) return;
  mantenimientos = mantenimientos.filter((m) => m.id !== id);
  progSave();
  renderPrograma();
}

// ----- Formulario de la rutina -----

function progAbrirForm(cod, mes, sem) {
  const D = progDatos();
  const eq = D.equipos.find((e) => e.c === cod);
  const rut = progActividades(cod);
  const hoy = new Date();
  progForm = {
    eq: cod, nombre: eq ? eq.n : cod, mes, sem, origen: rut.origen, doc: rut.doc,
    archivo: rut.archivo || "", mid: rut.mid || "",
    fecha: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`,
    items: rut.items.map((it) => ({ a: it.a, nota: it.nota, estado: "", hr: "", hh: "" }))
  };
  progPintarForm();
  document.getElementById("progSheetBackdrop").hidden = false;
  document.getElementById("progSheet").hidden = false;
}

function progCerrarForm() {
  progForm = null;
  document.getElementById("progSheetBackdrop").hidden = true;
  document.getElementById("progSheet").hidden = true;
}

function progPintarForm() {
  const c = document.getElementById("progFormRoot");
  if (!c || !progForm) return;
  const F = progForm;
  const D = progDatos();
  const fuente = F.origen === "papel"
    ? `Rutina del formato en papel. <a href="${F.archivo.split("/").map(encodeURIComponent).join("/")}" target="_blank" rel="noopener">${planEsc(F.doc)}</a>`
    : F.origen === "ficha"
      ? `Estas actividades salen del <strong>manual del fabricante</strong>, no de una lista generica: ${planEsc(F.doc)}.`
      : `Este equipo todavia no tiene rutina en papel ni plan en su ficha, asi que se usa la <strong>lista base</strong>. Añade lo que falte abajo.`;
  c.innerHTML = `
    <p class="pl-note"><strong>${planEsc(F.nombre)}</strong> &middot; código ${planEsc(F.eq)} &middot;
      programado en la semana ${F.sem} (${progRango(D.anio, F.sem)}) de ${F.mes.charAt(0) + F.mes.slice(1).toLowerCase()}.</p>
    <p class="pl-soft">${fuente}</p>
    <div class="tk-row2">
      <label>Fecha de ejecución<input type="date" id="progFecha" value="${F.fecha}" required></label>
      <label>Turno
        <select id="progTurno">
          <option value="">—</option><option>1</option><option>2</option><option>3</option>
        </select>
      </label>
    </div>
    <div class="tk-row2">
      <label>Realizado por<input id="progQuien" placeholder="Nombre de quien ejecuta"></label>
      <label>Horas de trabajo del equipo<input id="progHrMaq" inputmode="numeric" placeholder="Hr Máq al iniciar"></label>
    </div>

    <div class="in-piezas-campo">
      <span class="in-lbl">Actividades &middot; ${F.items.length}</span>
      <div class="prog-acts">
        ${F.items.map((it, i) => `
          <div class="prog-act">
            <div class="prog-act__t">
              <strong>${planEsc(it.a)}</strong>
              ${it.nota ? `<span class="pl-soft">${planEsc(it.nota)}</span>` : ""}
            </div>
            <select aria-label="Estado" onchange="progSetItem(${i},'estado',this.value)">
              <option value="">Sin marcar</option>
              ${Object.entries(PROG_ESTADOS).map(([k, v]) => `<option value="${k}"${it.estado === k ? " selected" : ""}>${v}</option>`).join("")}
            </select>
            <input aria-label="Hr Máq" inputmode="numeric" placeholder="Hr Máq" value="${planEsc(it.hr)}" oninput="progSetItem(${i},'hr',this.value)">
            <input aria-label="Horas hombre" inputmode="decimal" placeholder="HH" value="${planEsc(it.hh)}" oninput="progSetItem(${i},'hh',this.value)">
            <button type="button" class="pl-ev__x" title="Quitar" onclick="progQuitarItem(${i})">&times;</button>
          </div>`).join("")}
      </div>
      <button type="button" class="button button--light" onclick="progAnadirItem()">Añadir actividad</button>
    </div>

    <label>Comentarios<textarea id="progComentarios" rows="2" placeholder="Lo que se encontró, mediciones, observaciones&hellip;"></textarea></label>
    <label>Trabajos a programar<textarea id="progProgramar" rows="2" placeholder="Lo que queda pendiente y hay que programar&hellip;"></textarea></label>
    <p class="pl-soft" id="progTotales">${progTotales()}</p>
    <button class="button button--dark" type="button" onclick="progGuardar()">Guardar mantenimiento</button>`;
}

function progTotales() {
  const F = progForm;
  if (!F) return "";
  const hh = F.items.reduce((n, it) => n + (parseFloat(String(it.hh).replace(",", ".")) || 0), 0);
  const marcadas = F.items.filter((it) => it.estado).length;
  const prog = F.items.filter((it) => it.estado === "programar").length;
  return `${marcadas} de ${F.items.length} actividades marcadas &middot; total ${hh ? hh.toFixed(1).replace(/\.0$/, "") : 0} HH${prog ? ` &middot; ${prog} para programar` : ""}`;
}

function progSetItem(i, k, v) {
  if (!progForm || !progForm.items[i]) return;
  progForm.items[i][k] = v;
  const t = document.getElementById("progTotales");
  if (t) t.innerHTML = progTotales();
}
function progQuitarItem(i) { if (!progForm) return; progForm.items.splice(i, 1); progPintarForm(); }
function progAnadirItem() {
  if (!progForm) return;
  const txt = window.prompt("Actividad nueva:");
  if (txt && txt.trim()) { progForm.items.push({ a: txt.trim(), nota: "", estado: "", hr: "", hh: "" }); progPintarForm(); }
}

function progGuardar() {
  const F = progForm;
  if (!F) return;
  const fecha = String(document.getElementById("progFecha")?.value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { window.alert("Pon una fecha de ejecución válida."); return; }
  const marcadas = F.items.filter((it) => it.estado).length;
  if (!marcadas && !window.confirm("No marcaste ninguna actividad. ¿Guardar de todos modos?")) return;
  const hh = F.items.reduce((n, it) => n + (parseFloat(String(it.hh).replace(",", ".")) || 0), 0);
  mantenimientos.unshift({
    id: "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    eq: F.eq, anio: progDatos().anio, mes: F.mes, sem: F.sem,
    fecha,
    turno: document.getElementById("progTurno")?.value || "",
    quien: String(document.getElementById("progQuien")?.value || "").trim(),
    hrMaq: String(document.getElementById("progHrMaq")?.value || "").trim(),
    origen: F.origen, doc: F.doc,
    actividades: F.items.filter((it) => it.estado || it.hh || it.hr)
      .map((it) => ({ a: it.a, estado: it.estado, hr: it.hr, hh: it.hh })),
    hh: hh ? Number(hh.toFixed(2)) : 0,
    comentarios: String(document.getElementById("progComentarios")?.value || "").trim(),
    programar: String(document.getElementById("progProgramar")?.value || "").trim(),
    createdAt: new Date().toISOString()
  });
  progSave();
  progCerrarForm();
  renderPrograma();
}

// ----- Lo que se ve desde la ficha de la maquina -----
// Su calendario del anio y lo que ya se le registro, para no tener que ir al
// programa a saber cuando le toca.
function renderProgramaMaquina(machine) {
  const D = progDatos();
  const cod = String(machine.equipoCod || "");
  if (!D || !cod) return "";
  const eq = D.equipos.find((e) => e.c === cod);
  const hechos = progDeEquipo(cod);
  if (!eq && !hechos.length) return "";

  const casillas = eq ? D.meses.filter((m) => eq.sem[m]) : [];
  const pend = casillas.filter((m) => progEstado(cod, m, eq.sem[m]).k !== "hecho").length;

  return `
    <div class="panel-header-clean">
      <h3>Programa anual ${D.anio}</h3>
      <p>${eq
        ? `Este equipo est&aacute; en el programa oficial <strong>${casillas.length} ${casillas.length === 1 ? "vez" : "veces"}</strong> al a&ntilde;o${pend ? `, y ${pend} sin registrar` : ", todas registradas"}. La casilla de cada mes es la <strong>semana</strong>, no el d&iacute;a.`
        : "Este equipo no aparece en el programa anual DMM-173B, pero tiene mantenimientos registrados."}</p>
    </div>
    ${casillas.length ? `<div class="pl-filters">${casillas.map((m) => {
      const est = progEstado(cod, m, eq.sem[m]);
      const cls = { hecho: "pl-tag--ok", vencido: "pl-tag--warn", ahora: "pl-tag--link", pend: "pl-tag--n" }[est.k];
      return `<button class="pl-chk" type="button" onclick="progAbrirForm('${cod}','${m}',${eq.sem[m]})"
        title="Registrar el mantenimiento de ${m.toLowerCase()}">
        ${m.charAt(0) + m.slice(1).toLowerCase()} &middot; sem. ${eq.sem[m]}
        <span class="pl-tag ${cls}">${planEsc(est.t)}</span></button>`;
    }).join("")}</div>` : ""}
    ${hechos.length ? hechos.map(progResumenRegistro).join("") :
      '<p class="tk-empty">Todav&iacute;a no se ha registrado ning&uacute;n mantenimiento de este equipo.</p>'}`;
}

// ----- Descuadres entre el programa anual y el registro de repuestos -----
// Son dos listados oficiales distintos -DMM-173B y DMM-179- que deberian
// hablar de los mismos equipos y no lo hacen. Verlo cuesta poco y evita que un
// equipo se quede sin mantenimiento programado o sin plan de repuestos porque
// nadie cruzo las dos hojas.
function progDescuadres() {
  const D = progDatos();
  if (!D || typeof PLAN_EQUIPOS === "undefined") return null;
  const reg = new Set(PLAN_EQUIPOS.map((e) => String(e.c)));
  const prog = new Set(D.equipos.map((e) => e.c));
  return {
    soloPrograma: D.equipos.filter((e) => !reg.has(e.c)),
    soloRegistro: PLAN_EQUIPOS.filter((e) => !prog.has(String(e.c)) && e.r.length)
      .sort((a, b) => b.r.length - a.r.length)
  };
}

function renderDescuadres() {
  const d = progDescuadres();
  if (!d || (!d.soloPrograma.length && !d.soloRegistro.length)) return "";
  return `
    <div class="panel-split"></div>
    <div class="panel-header-clean">
      <h3>Descuadres con el registro de repuestos</h3>
      <p>El programa anual (DMM-173B) y el registro de repuestos (DMM-179) no listan los mismos equipos.
        Ninguno de los dos est&aacute; mal por s&iacute; solo, pero cada fila de aqu&iacute; es un equipo al que
        le falta una de las dos cosas.</p>
    </div>
    ${d.soloPrograma.length ? `
      <p class="pl-soft"><strong>${d.soloPrograma.length} en el programa anual que no est&aacute;n en el registro de repuestos.</strong>
        Tienen mantenimiento programado pero ninguna pieza asociada, as&iacute; que si hace falta un repuesto no hay de d&oacute;nde pedirlo.</p>
      <div class="pl-filters">${d.soloPrograma.map((e) =>
        `<span class="pl-chk">${planEsc(e.n)} <span class="pl-tag pl-tag--n">${planEsc(e.c)}</span></span>`).join("")}</div>` : ""}
    ${d.soloRegistro.length ? `
      <p class="pl-soft"><strong>${d.soloRegistro.length} con repuestos en el plan pero sin mantenimiento programado</strong>
        en todo el a&ntilde;o. Se les compran piezas pero no tienen fecha de revisi&oacute;n. Los diez con m&aacute;s peso:</p>
      <div class="pl-filters">${d.soloRegistro.slice(0, 10).map((e) =>
        `<span class="pl-chk">${planEsc(e.n)} <span class="pl-tag pl-tag--warn">${e.r.length} repuestos</span></span>`).join("")}</div>` : ""}`;
}
