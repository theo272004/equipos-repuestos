// ============================================================================
//  ORDENES DE TRABAJO
// ============================================================================
//  Las "tareas" pasan a ser ordenes de trabajo (OT) de verdad. Ademas de lo que
//  ya tenian (maquina, prioridad, pasos, avisos por Telegram) registran:
//    - el tipo: correctiva (falla), preventiva, mejora
//    - si el equipo esta DETENIDO, desde cuando y hasta cuando
//    - al cerrarla: la falla, su causa, el trabajo hecho, quien lo hizo y cuantas
//      horas-hombre, el codigo de causa (centro de costo) y los repuestos usados
//  Con eso salen los indicadores (assets/js/indicadores.js): cuanto tiempo se
//  pierde por fallas, cuanto se tarda en reparar, cada cuanto falla cada equipo.
//
//  Se guardan en la misma coleccion "tareas" y con los mismos campos de antes,
//  solo se anaden campos: el bot de Telegram (scripts/bot-updates.mjs) sigue
//  creando y cerrando tareas igual. Una OT cerrada desde Telegram queda sin el
//  detalle del cierre y la tarjeta ofrece completarlo.
//
//  Los repuestos usados se anotan tambien en el historial de cambios del plan
//  de mantenimiento: asi la frecuencia real de cada pieza se mide sola, sin
//  tener que registrar el cambio dos veces.
// ============================================================================

const OT_TIPOS = {
  correctiva: { txt: "Correctiva", largo: "Correctiva (falla)" },
  preventiva: { txt: "Preventiva", largo: "Preventiva" },
  mejora: { txt: "Mejora", largo: "Mejora" },
  otra: { txt: "Otra", largo: "Otra" },
};

// Para poder contar las fallas por causa, la causa se elige de una lista corta.
const OT_CAUSAS = [
  "Desgaste normal", "Falta de lubricación", "Ajuste o calibración", "Falla eléctrica o electrónica",
  "Operación incorrecta", "Material o insumo", "Suciedad o contaminación", "Rotura o fatiga",
  "Diseño o instalación", "Sin causa identificada",
];

// ---------------------------------------------------------------- utilidades
// Las horas se guardan como las escribe el campo datetime-local del navegador
// ("2026-09-23T10:32"), en la hora del equipo que lo registra: la planta.
function otAhoraLocal() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function otMs(v) { const t = Date.parse(v || ""); return Number.isFinite(t) ? t : null; }

// El equipo sigue parado: la orden lo dice y todavia no se anoto el arranque.
function otEquipoParado(t) { return !!(t && t.paro && t.paroInicio && !t.paroFin && t.status !== "hecha"); }

// Cuanto duro (o lleva) la parada. Si la orden se cerro sin anotar el arranque
// (por ejemplo desde Telegram), se toma la hora del cierre.
function otParadaMs(t) {
  if (!t || !t.paro) return 0;
  const ini = otMs(t.paroInicio);
  if (ini === null) return 0;
  const fin = otMs(t.paroFin) ?? (t.status === "hecha" ? otMs(t.doneAt) : Date.now());
  return fin !== null && fin > ini ? fin - ini : 0;
}

function otDuracion(ms) {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  if (h < 24) return m ? `${h} h ${m} min` : `${h} h`;
  const d = Math.floor(h / 24), hh = h % 24;
  return hh ? `${d} d ${hh} h` : `${d} d`;
}

function otFechaHora(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v || "");
  return m ? `${m[3]}/${m[2]} ${m[4]}:${m[5]}` : "";
}

// Numero legible y unico sin necesitar un servidor que lleve la cuenta:
// fecha + tres caracteres al azar. OT-260923-K7Q
function otNumero() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `OT-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

function otEquipoPlan(machineId) {
  const m = typeof machines !== "undefined" ? machines.find((x) => x.id === machineId) : null;
  return m && typeof equipoDeMachine === "function" ? equipoDeMachine(m) : null;
}

function otCausaDesc(code) {
  const c = String(code || "").trim().toUpperCase();
  const hit = (window.CAUSA_CODES || []).find((x) => String(x.code).toUpperCase() === c);
  return hit ? hit.desc : "";
}

// ---------------------------------------------------------------- nueva OT
function otParoToggle(cb) {
  const bloque = document.getElementById("tkParoDesde");
  const campo = document.getElementById("tkParoInicio");
  if (!bloque || !campo) return;
  bloque.hidden = !cb.checked;
  if (cb.checked && !campo.value) campo.value = otAhoraLocal();
}

function taskSubmit(e) {
  e.preventDefault();
  const f = e.target;
  const steps = (f.steps.value || "").split("\n").map((s) => s.trim()).filter(Boolean).map((text) => ({ text, done: false }));
  const paro = !!(f.paro && f.paro.checked);
  tasks.unshift({
    id: tuid(), numero: otNumero(), tipo: f.tipo ? f.tipo.value : "correctiva",
    machine: f.machine.value, machineName: taskMachineName(f.machine.value),
    title: f.title.value.trim(), desc: f.desc.value.trim(), priority: f.priority.value,
    reporter: f.reporter.value.trim(), status: paro ? "en-progreso" : "pendiente", steps,
    paro, paroInicio: paro ? (f.paroInicio.value || otAhoraLocal()) : "",
    createdAt: new Date().toISOString(),
  });
  saveTasks(); f.reset();
  const bloque = document.getElementById("tkParoDesde"); if (bloque) bloque.hidden = true;
  taskFormToggle(false); renderTasks();
}

// ---------------------------------------------------------------- tarjeta
function otTarjeta(t) {
  const steps = t.steps || [];
  const done = steps.filter((s) => s.done).length;
  const prCls = { Alta: "tk-pr--alta", Media: "tk-pr--media", Baja: "tk-pr--baja" }[t.priority] || "tk-pr--media";
  const stLabel = { pendiente: "Pendiente", "en-progreso": "En curso", hecha: "Cerrada" }[t.status] || t.status;
  const tipo = OT_TIPOS[t.tipo];
  const parado = otEquipoParado(t);
  const cerrada = t.status === "hecha";
  const c = t.cierre;

  let paro = "";
  if (parado) {
    paro = `<div class="ot-paro-strip"><strong>Equipo detenido</strong> desde ${escapeHtml(otFechaHora(t.paroInicio))} &middot; lleva ${escapeHtml(otDuracion(otParadaMs(t)))}</div>`;
  } else if (t.paro) {
    paro = `<div class="ot-paro-fin">Parada: <strong>${escapeHtml(otDuracion(otParadaMs(t)))}</strong> (${escapeHtml(otFechaHora(t.paroInicio))} &rarr; ${escapeHtml(otFechaHora(t.paroFin) || "cierre")})</div>`;
  }

  const repuestos = c && (c.repuestos || []).length
    ? c.repuestos.map((r) => `${escapeHtml(r.q)} &times; ${escapeHtml(r.d || r.cod)} <span class="ot-cod">${escapeHtml(r.cod)}</span>`).join("<br>") : "";
  const detalle = c ? `
    <dl class="ot-cierre">
      ${c.falla ? `<dt>Falla</dt><dd>${escapeHtml(c.falla)}</dd>` : ""}
      ${c.causaTipo || c.causaRaiz ? `<dt>Causa</dt><dd>${escapeHtml([c.causaTipo, c.causaRaiz].filter(Boolean).join(": "))}</dd>` : ""}
      <dt>Trabajo</dt><dd>${escapeHtml(c.trabajo || "")}</dd>
      ${c.tecnicos || c.hh ? `<dt>Hecho por</dt><dd>${escapeHtml(c.tecnicos || "")}${c.hh ? ` &middot; ${escapeHtml(c.hh)} h-h` : ""}</dd>` : ""}
      ${c.ccosto ? `<dt>C&oacute;d. causa</dt><dd><span class="ot-cod">${escapeHtml(c.ccosto)}</span> ${escapeHtml(otCausaDesc(c.ccosto))}</dd>` : ""}
      ${repuestos ? `<dt>Repuestos</dt><dd>${repuestos}</dd>` : ""}
    </dl>` : cerrada && t.tipo ? `<p class="ot-sin-cierre">Se cerr&oacute; sin anotar el trabajo hecho (por ejemplo, desde Telegram).</p>` : "";

  const solicitudes = (window.almSolicitudes ? window.almSolicitudes() : []).filter((s) => s.ot && s.ot.id === t.id);
  const sols = solicitudes.length ? `<div class="tk-meta">Solicitudes de materiales: ${solicitudes.map((s) => escapeHtml(s.fecha)).join(", ")}</div>` : "";

  const acciones = cerrada
    ? `<button class="button button--light" type="button" onclick="taskSetStatus('${t.id}','pendiente')">Reabrir</button>
       <button class="button button--light" type="button" onclick="taskComplete('${t.id}')">${c ? "Editar el cierre" : "Completar el cierre"}</button>
       <button class="button button--light" type="button" onclick="taskDelete('${t.id}')">Eliminar</button>`
    : `${t.status === "pendiente" ? `<button class="button button--light" type="button" onclick="taskSetStatus('${t.id}','en-progreso')">Empezar</button>` : `<button class="button button--light" type="button" onclick="taskSetStatus('${t.id}','pendiente')">Pausar</button>`}
       <button class="button button--dark" type="button" onclick="taskComplete('${t.id}')">Cerrar la orden</button>
       <button class="button button--light" type="button" onclick="taskAddStep('${t.id}')">+ paso</button>
       <button class="button button--light" type="button" onclick="otPedirRepuestos('${t.id}')">Pedir repuestos</button>
       <button class="button button--light" type="button" onclick="openRemind('${t.id}')">${t.remindFreq ? "Aviso programado" : "Programar aviso"}</button>
       <button class="button button--light" type="button" onclick="taskDelete('${t.id}')">Eliminar</button>`;

  return `<div class="tk-card tk-st--${t.status} ${parado ? "is-parado" : ""}">
    <div class="tk-card__top">
      <span class="ot-tipo ot-tipo--${escapeHtml(t.tipo || "tarea")}">${tipo ? tipo.txt : "Tarea"}</span>
      <span class="tk-pr ${prCls}">${escapeHtml(t.priority)}</span>
      <strong class="tk-title">${escapeHtml(t.title)}</strong>
      <span class="system-badge">${escapeHtml(taskMachineName(t.machine))}</span>
      <span class="tk-status">${stLabel}</span>
    </div>
    ${paro}
    ${t.desc ? `<p class="tk-desc">${escapeHtml(t.desc)}</p>` : ""}
    ${steps.length ? `<div class="tk-steps">${steps.map((s, i) => `<label class="tk-step ${s.done ? "is-done" : ""}"><input type="checkbox" ${s.done ? "checked" : ""} onchange="taskToggleStep('${t.id}', ${i})"> ${escapeHtml(s.text)}</label>`).join("")}<div class="tk-prog">${done}/${steps.length} pasos completados</div></div>` : ""}
    ${t.remindFreq ? (cerrada
      ? `<div class="tk-remind tk-remind--off">Aviso en pausa &middot; la orden est&aacute; cerrada. Si la reabres, vuelve a avisar.</div>`
      : `<div class="tk-remind">${escapeHtml(remindLabel(t))}</div>`) : ""}
    ${detalle}
    <div class="tk-meta">${t.numero ? `<span class="ot-cod">${escapeHtml(t.numero)}</span> &middot; ` : ""}${t.reporter ? "report&oacute; " + escapeHtml(t.reporter) + " &middot; " : ""}${escapeHtml((t.createdAt || "").slice(0, 10))}${t.parent ? ` &middot; seguimiento de: &ldquo;${escapeHtml(t.parent)}&rdquo;` : ""}</div>
    ${sols}
    <div class="tk-actions">${acciones}</div>
  </div>`;
}

// ---------------------------------------------------------------- cierre
let otCierreId = null;
let otCierreRepuestos = [];

function taskComplete(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  otCierreId = id;
  const c = t.cierre || {};
  otCierreRepuestos = JSON.parse(JSON.stringify(c.repuestos || []));
  const correctiva = !t.tipo || t.tipo === "correctiva";
  const eq = otEquipoPlan(t.machine);
  const recordado = (() => { try { return localStorage.getItem("equipos-ot-tecnicos") || ""; } catch (e) { return ""; } })();
  const panel = document.getElementById("otCierre");

  panel.innerHTML = `
    <div class="tk-sheet__head">
      <h4>Cerrar ${escapeHtml(t.numero || "la orden")}</h4>
      <button class="tk-sheet__close" type="button" onclick="otCerrarPanel()" aria-label="Cerrar">&times;</button>
    </div>
    <p class="pl-sheet__what">${escapeHtml(t.title)} &middot; ${escapeHtml(taskMachineName(t.machine))}</p>
    <form class="tk-form ot-form" id="otCierreForm" onsubmit="otGuardarCierre(event)">
      <label class="ot-paro"><input type="checkbox" name="paro" id="otParo" ${t.paro ? "checked" : ""} onchange="otCierreParo(this)"> El equipo estuvo detenido</label>
      <div id="otParoCampos" ${t.paro ? "" : "hidden"}>
        <div class="tk-row2">
          <label>Detenido desde<input type="datetime-local" name="paroInicio" id="otParoInicio" value="${escapeHtml(t.paroInicio || "")}" oninput="otCierreDuracion()"></label>
          <label>Arranc&oacute; de nuevo<input type="datetime-local" name="paroFin" id="otParoFin" value="${escapeHtml(t.paroFin || (t.paro ? otAhoraLocal() : ""))}" oninput="otCierreDuracion()"></label>
        </div>
        <p class="ot-dur" id="otDur"></p>
      </div>
      <label>${correctiva ? "Falla o s&iacute;ntoma" : "Qu&eacute; se encontr&oacute;"}<textarea name="falla" rows="2">${escapeHtml(c.falla ?? (correctiva ? t.desc || "" : ""))}</textarea></label>
      <div class="tk-row2">
        <label>Tipo de causa<select name="causaTipo"><option value="">&mdash;</option>${OT_CAUSAS.map((x) => `<option ${c.causaTipo === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
        <label>Causa ra&iacute;z<input name="causaRaiz" value="${escapeHtml(c.causaRaiz || "")}" placeholder="Por qu&eacute; pas&oacute;"></label>
      </div>
      <label>Trabajo realizado *<textarea name="trabajo" rows="3" required placeholder="Qu&eacute; se hizo, qu&eacute; se cambi&oacute;, c&oacute;mo qued&oacute;">${escapeHtml(c.trabajo || "")}</textarea></label>
      <div class="tk-row2">
        <label>T&eacute;cnicos<input name="tecnicos" value="${escapeHtml(c.tecnicos || recordado)}" placeholder="Qui&eacute;n lo hizo"></label>
        <label>Horas-hombre<input type="number" name="hh" min="0" step="0.25" inputmode="decimal" value="${escapeHtml(c.hh ?? "")}"></label>
      </div>
      <label>C&oacute;digo de causa (centro de costo)
        <input name="ccosto" id="otCcosto" list="otCausasLista" value="${escapeHtml(c.ccosto || "")}" autocomplete="off" oninput="otCcostoDesc()" placeholder="Escribe el c&oacute;digo o el nombre">
        <span class="pl-soft" id="otCcostoDesc">${escapeHtml(otCausaDesc(c.ccosto))}</span>
      </label>
      <fieldset class="ot-rep">
        <legend>Repuestos usados</legend>
        <div class="ot-rep__add">
          <input id="otRepCod" list="otRepLista" placeholder="C&oacute;digo o nombre de la pieza" autocomplete="off">
          <input id="otRepQ" type="number" min="0" step="any" value="1" aria-label="Cantidad">
          <button class="button button--light" type="button" onclick="otRepAgregar()">Agregar</button>
        </div>
        <ul class="ot-rep__lista" id="otRepUl"></ul>
        ${eq ? `<label class="ot-paro"><input type="checkbox" name="aHistorial" checked> Anotarlos en el historial de cambios de ${escapeHtml(eq.n)}</label>` : ""}
      </fieldset>
      ${t.status === "hecha" ? "" : `<label>Orden de seguimiento (opcional)<input name="seguimiento" placeholder="Ej. Reinstalar y calibrar la pieza reparada"></label>`}
      <p class="alm-aviso alm-aviso--error" id="otCierreError" hidden></p>
      <button class="button button--dark" type="submit">${t.status === "hecha" ? "Guardar el cierre" : "Cerrar la orden"}</button>
    </form>
    <datalist id="otCausasLista">${(window.CAUSA_CODES || []).map((x) => `<option value="${escapeHtml(x.code)}">${escapeHtml(x.desc)}</option>`).join("")}</datalist>
    <datalist id="otRepLista">${otOpcionesRepuestos(eq)}</datalist>`;

  otPintarRepuestos();
  otCierreDuracion();
  panel.hidden = false;
  document.getElementById("otCierreBackdrop").hidden = false;
  panel.querySelector("textarea[name='trabajo']")?.focus();
}

// Primero las piezas del plan de ese equipo, luego todo el almacen.
function otOpcionesRepuestos(eq) {
  const vistos = new Set();
  const out = [];
  const add = (cod, d) => { const k = String(cod || "").trim().toUpperCase(); if (!k || vistos.has(k)) return; vistos.add(k); out.push(`<option value="${escapeHtml(k)}">${escapeHtml(d || "")}</option>`); };
  if (eq) (eq.r || []).forEach((r) => add(typeof repCodigo === "function" ? repCodigo(eq, r) : r.cod, r.d));
  Object.values(window.INVENTARIO ? window.INVENTARIO.todo : {}).forEach((a) => add(a.cod, a.desc));
  return out.join("");
}

function otDescRepuesto(cod) {
  const inv = window.INVENTARIO && window.INVENTARIO.de(cod);
  if (inv && inv.desc) return inv.desc;
  for (const eq of (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || []) {
    const r = (eq.r || []).find((x) => String(x.cod || "").trim().toUpperCase() === cod);
    if (r && r.d) return r.d;
  }
  return "";
}

function otRepAgregar() {
  const campo = document.getElementById("otRepCod");
  const cant = document.getElementById("otRepQ");
  const cod = String(campo.value || "").trim().toUpperCase();
  const q = Number(cant.value);
  if (!cod) { campo.focus(); return; }
  if (!(q > 0)) { cant.focus(); return; }
  const previo = otCierreRepuestos.find((r) => r.cod === cod);
  if (previo) previo.q = Number(previo.q) + q;
  else otCierreRepuestos.push({ cod, d: otDescRepuesto(cod), q });
  campo.value = ""; cant.value = "1";
  otPintarRepuestos();
  campo.focus();
}

function otRepQuitar(i) { otCierreRepuestos.splice(i, 1); otPintarRepuestos(); }

function otPintarRepuestos() {
  const ul = document.getElementById("otRepUl");
  if (!ul) return;
  ul.innerHTML = otCierreRepuestos.length
    ? otCierreRepuestos.map((r, i) => `<li><span class="ot-cod">${escapeHtml(r.cod)}</span> ${escapeHtml(r.d || "")} <b>&times; ${escapeHtml(r.q)}</b> <button type="button" class="alm-x" onclick="otRepQuitar(${i})" aria-label="Quitar ${escapeHtml(r.cod)}">&times;</button></li>`).join("")
    : `<li class="pl-soft">Ninguno.</li>`;
}

function otCierreParo(cb) {
  document.getElementById("otParoCampos").hidden = !cb.checked;
  if (cb.checked) {
    const fin = document.getElementById("otParoFin");
    if (fin && !fin.value) fin.value = otAhoraLocal();
  }
  otCierreDuracion();
}

function otCierreDuracion() {
  const dur = document.getElementById("otDur");
  if (!dur) return;
  const ini = otMs(document.getElementById("otParoInicio")?.value);
  const fin = otMs(document.getElementById("otParoFin")?.value);
  dur.textContent = ini !== null && fin !== null ? (fin >= ini ? `Parada de ${otDuracion(fin - ini)}` : "El arranque es anterior a la parada.") : "";
  dur.classList.toggle("is-mal", ini !== null && fin !== null && fin < ini);
}

function otCcostoDesc() {
  const v = document.getElementById("otCcosto")?.value;
  const d = document.getElementById("otCcostoDesc");
  if (d) d.textContent = v ? otCausaDesc(v) || "No está en el listado de códigos de causa." : "";
}

function otCerrarPanel() {
  document.getElementById("otCierre").hidden = true;
  document.getElementById("otCierreBackdrop").hidden = true;
  otCierreId = null;
}

function otGuardarCierre(e) {
  e.preventDefault();
  const t = tasks.find((x) => x.id === otCierreId);
  if (!t) { otCerrarPanel(); return; }
  const f = e.target;
  const error = (msg) => { const p = document.getElementById("otCierreError"); p.textContent = msg; p.hidden = false; };

  // Si quedo algo escrito en el campo de repuestos sin pulsar Agregar, se agrega.
  if (document.getElementById("otRepCod")?.value.trim()) otRepAgregar();

  const paro = f.paro.checked;
  const ini = f.paroInicio.value, fin = f.paroFin.value;
  if (paro) {
    if (!ini || !fin) { error("Anota cuándo se detuvo el equipo y cuándo arrancó de nuevo."); return; }
    if (otMs(fin) < otMs(ini)) { error("El arranque no puede ser anterior a la parada."); return; }
  }
  const trabajo = f.trabajo.value.trim();
  if (!trabajo) { error("Escribe el trabajo realizado."); return; }

  const tecnicos = f.tecnicos.value.trim();
  try { localStorage.setItem("equipos-ot-tecnicos", tecnicos); } catch (err) {}
  const hh = f.hh.value === "" ? null : Number(f.hh.value);
  const yaCerrada = t.status === "hecha";

  t.paro = paro;
  t.paroInicio = paro ? ini : "";
  t.paroFin = paro ? fin : "";
  t.cierre = {
    falla: f.falla.value.trim(), causaTipo: f.causaTipo.value, causaRaiz: f.causaRaiz.value.trim(),
    trabajo, tecnicos, hh: Number.isFinite(hh) ? hh : null,
    ccosto: f.ccosto.value.trim().toUpperCase(), repuestos: otCierreRepuestos,
  };
  if (!yaCerrada) { t.status = "hecha"; t.doneAt = new Date().toISOString(); }

  // Repuestos -> historial de cambios del plan. Si se esta editando un cierre,
  // primero se retiran los que esta misma orden habia anotado, para no duplicar.
  const eq = otEquipoPlan(t.machine);
  if (eq && typeof cambios !== "undefined") {
    const antes = cambios.length;
    cambios = cambios.filter((x) => x.ot !== t.id);
    let cambiaron = cambios.length !== antes;
    if (f.aHistorial && f.aHistorial.checked) {
      const fecha = (paro && fin ? fin : otAhoraLocal()).slice(0, 10);
      otCierreRepuestos.forEach((r) => {
        cambios.push({
          id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          eq: eq.c, cod: r.cod, d: r.d, fecha, q: Number(r.q) || 0, quien: tecnicos,
          nota: `${t.numero || "OT"}: ${trabajo}`.slice(0, 160), ot: t.id, createdAt: new Date().toISOString(),
        });
      });
      cambiaron = cambiaron || otCierreRepuestos.length > 0;
    }
    if (cambiaron) saveCambios();
  }

  const seguimiento = f.seguimiento ? f.seguimiento.value.trim() : "";
  if (seguimiento) {
    tasks.unshift({
      id: tuid(), numero: otNumero(), tipo: t.tipo || "correctiva", machine: t.machine, machineName: t.machineName,
      title: seguimiento, desc: "", priority: t.priority, reporter: t.reporter, status: "pendiente", steps: [],
      paro: false, paroInicio: "", createdAt: new Date().toISOString(), parent: t.title,
    });
  }

  saveTasks();
  otCerrarPanel();
  renderTasks();
}

// ---------------------------------------------------------------- repuestos
// Abre Almacen con una solicitud nueva ya dirigida al equipo de la orden.
function otPedirRepuestos(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t || !window.almNuevaParaOT) return;
  window.almNuevaParaOT({ id: t.id, numero: t.numero || "", destino: taskMachineName(t.machine), causa: t.cierre ? t.cierre.ccosto : "" });
}

// Mientras haya un equipo detenido, el "lleva X min" se actualiza solo.
setInterval(() => {
  if (document.getElementById("tasksView")?.classList.contains("is-active") && tasks.some(otEquipoParado)
    && document.getElementById("otCierre")?.hidden !== false) renderTasks();
}, 60000);
