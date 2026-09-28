// Textos que manda el bot. Formato HTML de Telegram: <b>, <i>, <code>, <a>.
// Cortos y con lo importante primero: se leen en el celular, en planta.

import { esc, fechaCorta, pesos, corto, URL_APP, sumaDias } from "./datos-app.mjs";

const url = (v, extra = "") => `${URL_APP}?v=${v}${extra}`;
const pct = (x) => `${Math.round((x || 0) * 100)} %`;
const icoPend = (p) => (p.prioridad === "alta" ? "🔴" : p.estado === "espera" ? "🟠" : "⚪");

// Botones con enlace a la app y al formulario, debajo de los mensajes
export function botonesApp(extra = []) {
  return {
    inline_keyboard: [
      ...extra,
      [{ text: "📋 Pendientes", url: url("pendientes") }, { text: "📝 Reporte de turno", url: `${URL_APP}reporte.html` }],
      [{ text: "🏠 Abrir la app", url: URL_APP }],
    ],
  };
}
export const MENU = {
  inline_keyboard: [
    [{ text: "📊 Así va el día", callback_data: "m|hoy" }, { text: "📋 Pendientes", callback_data: "m|pend" }],
    [{ text: "🔧 Equipos parados", callback_data: "m|parados" }, { text: "👷 Quién está de turno", callback_data: "m|turno" }],
    [{ text: "💰 Presupuesto", callback_data: "m|pres" }, { text: "📦 Cómo pedir un repuesto", callback_data: "m|pedir" }],
    [{ text: "📝 Llenar reporte de turno", url: `${URL_APP}reporte.html` }],
  ],
};

// Una novedad en una línea: equipo, cómo quedó y un título corto del texto
function lineaNovedad(r, pan) {
  const txt = pan && pan.titulo ? pan.titulo(r) : String(r.de || "").replace(/\s+/g, " ").slice(0, 110);
  const est = r.ef === "Pendiente" || r.ef === "Operativo con pendiente" || r.frep ? " ⚠️" : r.ef === "Operativo" ? " ✅" : "";
  const eq = /^no identificado$/i.test(r.eq || "") ? "" : `<b>${esc(r.eq)}</b>${est} — `;
  return `• ${eq}${esc(txt)}${eq ? "" : est}`;
}

function bloqueParados(pan) {
  const filas = [];
  Object.entries(pan.estados).forEach(([s, e]) => {
    e.mantenimiento.forEach((x) => filas.push(`• ${esc(x.eq)} <i>(${esc(s)})</i>${x.p ? " — " + esc(x.p) : ""}`));
    e.montaje.forEach((x) => filas.push(`• ${esc(x.eq)} <i>(${esc(s)}, montaje)</i>`));
  });
  const prod = Object.values(pan.estados).reduce((a, e) => a + e.produccion.length, 0);
  const tot = Object.values(pan.estados).reduce((a, e) => a + e.total, 0);
  return { filas, prod, tot };
}

function bloqueTurno(pan, t) {
  const q = pan.turnoAhora || {};
  return Object.values(q).map((s) => `${esc(s.sede)}: ${s.gente.length ? s.gente.map((g) => esc(g.nombre.split(" ").slice(0, 2).join(" "))).join(", ") : "—"}`).join("\n");
}

function bloquePendientes(pan, n = 6) {
  const p = pan.pendientes;
  const alta = p.filter((x) => x.prioridad === "alta").length;
  const esp = p.filter((x) => x.estado === "espera").length;
  const top = p.slice(0, n).map((x) => `${icoPend(x)} ${x.eq ? `<b>${esc(x.eq)}</b>: ` : ""}${esc(x.titulo)}${x.edad > 2 ? ` <i>(${x.edad} d)</i>` : ""}`);
  return { resumen: `${p.length} abiertos · ${alta} de prioridad alta · ${esp} esperando repuesto`, top };
}

// "Así va el día" (comando /hoy y botón del menú)
export function msgHoy(pan) {
  const l = [`📊 <b>Así va el día · ${esc(fechaCorta(pan.hoy))}</b>`, `Turno de ${pan.t.turno === "Día" ? "día (8:00–20:00)" : "noche (20:00–8:00)"}`, ""];
  const por = (s) => pan.regsHoy.filter((r) => r.s === s);
  l.push(`<b>Novedades hoy: ${pan.regsHoy.length}</b> (Sede 4: ${por("Sede 4").length} · Sede 2: ${por("Sede 2").length})`);
  pan.regsHoy.slice(-5).reverse().forEach((r) => l.push(lineaNovedad(r, pan)));
  const { filas, prod, tot } = bloqueParados(pan);
  l.push("", `<b>Equipos de proceso:</b> ${prod} de ${tot} en producción`);
  if (filas.length) l.push(...filas.slice(0, 6)); else l.push("Ninguno en mantenimiento ✅");
  const bp = bloquePendientes(pan, 5);
  l.push("", `<b>Pendientes:</b> ${bp.resumen}`, ...bp.top);
  Object.entries(pan.reportes).forEach(([s, r]) => l.push(r.ok ? `📝 ${esc(s)}: reporte del turno de ${pan.ant.turno === "Día" ? "día" : "noche"} ✓ ${esc(r.hora || "")}` : `⚠️ ${esc(s)}: falta el reporte del turno de ${pan.ant.turno === "Día" ? "día" : "noche"}`));
  if (pan.tareasHoy.length) l.push(`⏰ ${pan.tareasHoy.length} ${pan.tareasHoy.length === 1 ? "tarea toca" : "tareas tocan"} hoy`);
  if (pan.pedidos.length) l.push(`📦 ${pan.pedidos.length} ${pan.pedidos.length === 1 ? "pedido" : "pedidos"} de repuesto por atender en Almacén`);
  return l.join("\n");
}

// Parte de la mañana / de la tarde: el turno que acaba y lo que sigue
export function msgParte(pan, cual) {
  const ant = pan.ant;
  const desde = ant.turno === "Día" ? `${ant.fecha} 08:00` : `${ant.fecha} 20:00`;
  const hasta = ant.turno === "Día" ? `${ant.fecha} 20:00` : `${sumaDias(ant.fecha, 1)} 08:00`;
  // Novedades del turno: las del chat van con la hora del mensaje; las registradas, con su turno
  const delTurno = pan.regs.filter((r) => (r.t === ant.turno && (r.f === ant.fecha || (ant.turno === "Noche" && r.f === sumaDias(ant.fecha, 1) && (r.hr || "") < "13:00"))) || (`${r.f} ${r.hr || ""}` >= desde && `${r.f} ${r.hr || ""}` < hasta && r.src !== "chat"));
  const l = [`${cual === "am" ? "☀️" : "🌙"} <b>Parte de ${cual === "am" ? "la mañana" : "la noche"} · ${esc(fechaCorta(pan.hoy))}</b>`, ""];
  l.push(`<b>Turno de ${ant.turno === "Día" ? "día" : "noche"} que terminó</b> (${esc(fechaCorta(ant.fecha))})`);
  ["Sede 4", "Sede 2"].forEach((s) => {
    const d = delTurno.filter((r) => r.s === s);
    const rep = pan.reportes[s];
    l.push(`• ${esc(s)}: ${d.length} novedades · ${d.filter((r) => r.tp === "Correctivo").length} correctivas · ${rep.ok ? `reporte ✓ ${esc(rep.hora || "")}${rep.autor ? " (" + esc(corto(rep.autor)) + ")" : ""}` : "reporte ✗ <b>falta</b>"}`);
  });
  const importantes = delTurno.filter((r) => r.tp === "Correctivo" || r.ef === "Pendiente" || r.frep).slice(-6);
  if (importantes.length) { l.push("", "<b>Lo más importante</b>"); importantes.forEach((r) => l.push(lineaNovedad(r, pan))); }
  const { filas, prod, tot } = bloqueParados(pan);
  l.push("", `<b>Equipos:</b> ${prod} de ${tot} en producción${filas.length ? " · en mantenimiento:" : " ✅"}`);
  filas.slice(0, 6).forEach((f) => l.push(f));
  const bp = bloquePendientes(pan, 6);
  l.push("", `<b>Pendientes:</b> ${bp.resumen}`, ...bp.top);
  const extra = [];
  if (pan.tareasHoy.length) extra.push(`⏰ ${pan.tareasHoy.length} ${pan.tareasHoy.length === 1 ? "tarea con aviso" : "tareas con aviso"} para hoy`);
  if (pan.sinEntregar.length) extra.push(`📦 ${pan.sinEntregar.length} ${pan.sinEntregar.length === 1 ? "solicitud" : "solicitudes"} de almacén sin entregar`);
  if (pan.pedidos.length) extra.push(`🛒 ${pan.pedidos.length} ${pan.pedidos.length === 1 ? "pedido" : "pedidos"} desde Telegram por pasar a solicitud`);
  if (pan.presupuesto) extra.push(`💰 Presupuesto ${pan.presupuesto.anio}: ${pct(pan.presupuesto.ejecutado / pan.presupuesto.total)} ejecutado (lo esperado a hoy: ${pct(pan.presupuesto.esperado)})`);
  if (extra.length) l.push("", ...extra);
  l.push("", `👷 <b>En turno ahora</b>\n${bloqueTurno(pan)}`);
  return l.join("\n");
}

export function msgPendientes(pan, filtro = "") {
  const f = String(filtro || "").toLowerCase();
  const lista = pan.pendientes.filter((p) => !f || `${p.eq} ${p.titulo} ${p.sede || ""}`.toLowerCase().includes(f));
  const top = lista.slice(0, 10);
  const l = [`📋 <b>Pendientes${filtro ? ` · «${esc(filtro)}»` : ""}</b>`, `${lista.length} abiertos · ${lista.filter((p) => p.prioridad === "alta").length} alta · ${lista.filter((p) => p.estado === "espera").length} esperando repuesto`, ""];
  top.forEach((p, i) => l.push(`${i + 1}. ${icoPend(p)} ${p.eq ? `<b>${esc(p.eq)}</b>: ` : ""}${esc(p.titulo)}${p.edad ? ` <i>· ${p.edad} d</i>` : ""}${p.responsable ? ` · 👤 ${esc(corto(p.responsable))}` : ""}`));
  if (lista.length > 10) l.push(`… y ${lista.length - 10} más en la app.`);
  if (!lista.length) l.push("Nada pendiente con ese filtro ✅");
  l.push("", "<i>Toca un número para darlo por resuelto.</i>");
  const botones = [];
  for (let i = 0; i < top.length; i += 5) botones.push(top.slice(i, i + 5).map((p, j) => ({ text: `✅ ${i + j + 1}`, callback_data: `pc|${p.id}`.slice(0, 64) })));
  return { texto: l.join("\n"), teclado: botonesApp(botones) };
}

export function msgParados(pan) {
  const { filas, prod, tot } = bloqueParados(pan);
  return [`🔧 <b>Equipos de proceso</b>`, `${prod} de ${tot} en producción`, "", filas.length ? filas.join("\n") : "Ninguno en mantenimiento ni montaje ✅"].join("\n");
}

export function msgTurno(W, pan) {
  const T = W.TURNOS;
  if (!T) return "No encuentro el cuadro de turnos.";
  const hoy = pan.hoy;
  const bloque = (fecha, clave) => Object.values(T.quienes(fecha, clave)).map((s) => `• ${esc(s.sede)}: ${s.gente.length ? s.gente.map((g) => esc(g.nombre.split(" ").slice(0, 2).join(" ")) + (g.fijo ? " (fijo)" : "")).join(", ") : "—"}`).join("\n");
  return [`👷 <b>Turnos · ${esc(fechaCorta(hoy))}</b>`, "", "☀️ <b>Día</b> (8:00–20:00)", bloque(hoy, "dia"), "", "🌙 <b>Noche</b> (20:00–8:00)", bloque(hoy, "noche"), "", `<i>Mañana de día:</i>\n${bloque(sumaDias(hoy, 1), "dia")}`].join("\n");
}

export function msgPresupuesto(pan) {
  const p = pan.presupuesto;
  if (!p) return "💰 Todavía no hay presupuesto configurado para este año. Se configura en la app: Presupuesto → Configurar.";
  const l = [`💰 <b>Presupuesto ${p.anio}</b>`, `${pesos(p.ejecutado)} de ${pesos(p.total)} · <b>${pct(p.ejecutado / p.total)}</b> ejecutado`, `Lo esperado a hoy: ${pct(p.esperado)} · disponible ${pesos(p.total - p.ejecutado)}`, ""];
  const alerta = p.centros.filter((c) => c.asignado && c.pct > Math.max(0.9, p.esperado + 0.1)).slice(0, 5);
  if (alerta.length) { l.push("<b>Centros cerca o por encima del límite</b>"); alerta.forEach((c) => l.push(`${c.pct > 1 ? "🔴" : "🟠"} ${esc(c.cc)}: ${pct(c.pct)} (${pesos(c.gastado)} de ${pesos(c.asignado)})`)); }
  else l.push("Ningún centro de costo va por encima de lo esperado ✅");
  return l.join("\n");
}

export function msgFaltaReporte(sede, t, gente) {
  return [`⚠️ <b>Falta el reporte del turno de ${t.turno === "Día" ? "día" : "noche"} · ${esc(sede)}</b>`, `(${esc(fechaCorta(t.fecha))})`, "", gente && gente.length ? `Estuvieron de turno: ${gente.map((g) => esc(g.nombre.split(" ").slice(0, 2).join(" "))).join(", ")}.` : "", "Se puede llenar en el formulario (2 minutos) o pegarlo en el chat de WhatsApp como siempre."].filter(Boolean).join("\n");
}

export function msgSemana(pan) {
  const hasta = pan.hoy;
  const desde = sumaDias(hasta, -7);
  const sem = pan.regs.filter((r) => r.f >= desde && r.f < hasta);
  const corr = sem.filter((r) => r.tp === "Correctivo" && r.cat === "Máquina" && !/no identificado|sin especificar/i.test(r.eq));
  const m = new Map();
  corr.forEach((r) => m.set(r.eq, (m.get(r.eq) || 0) + 1));
  const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const viejos = pan.pendientes.filter((p) => p.edad > 7);
  const l = [`🗓 <b>Resumen de la semana</b> (${esc(fechaCorta(desde))} – ${esc(fechaCorta(sumaDias(hasta, -1)))})`, "", `${sem.length} novedades · ${sem.filter((r) => r.tp === "Correctivo").length} correctivas · ${sem.filter((r) => r.tp === "Preventivo").length} preventivas`];
  if (top.length) { l.push("", "<b>Equipos con más fallas de máquina</b>"); top.forEach(([eq, n], i) => l.push(`${i + 1}. ${esc(eq)} — ${n}`)); }
  l.push("", `<b>Pendientes con más de 7 días:</b> ${viejos.length}`);
  viejos.slice(0, 5).forEach((p) => l.push(`${icoPend(p)} ${p.eq ? esc(p.eq) + ": " : ""}${esc(p.titulo)} <i>(${p.edad} d)</i>`));
  if (pan.presupuesto) l.push("", `💰 Presupuesto: ${pct(pan.presupuesto.ejecutado / pan.presupuesto.total)} ejecutado (esperado ${pct(pan.presupuesto.esperado)})`);
  return l.join("\n");
}

export function msgNuevoReporte(r) {
  const nov = (r.novedades || []).length;
  const pend = (r.novedades || []).filter((n) => n.ef && n.ef !== "Operativo").length;
  const l = [`📝 <b>Reporte de turno · ${esc(r.sede)} · ${r.turno === "Día" ? "día" : "noche"}</b>`, `${esc(fechaCorta(r.fecha))} · por ${esc(corto(r.por || "alguien"))} (formulario)`, "", `${nov} novedades${pend ? ` · ${pend} con pendiente` : ""}`];
  (r.novedades || []).slice(0, 8).forEach((n) => l.push(`• <b>${esc(n.eq)}</b>${n.ef && n.ef !== "Operativo" ? " ⚠️" : " ✅"} — ${esc(String(n.de || "").slice(0, 100))}`));
  const parados = Object.entries(r.estados || {}).filter(([, v]) => v && v.e === "Mantenimiento").map(([eq]) => eq);
  if (parados.length) l.push("", `🔧 En mantenimiento: ${parados.map(esc).join(", ")}`);
  return l.join("\n");
}

export const AYUDA = [
  "<b>Qué sé hacer</b>",
  "",
  "/menu — botones con todo lo de abajo",
  "/hoy — así va el día: novedades, equipos parados, pendientes",
  "/pendientes <i>[equipo]</i> — lo que está abierto; toca ✅ para cerrarlo",
  "/parados — equipos en mantenimiento o montaje",
  "/turno — quién está de turno hoy y mañana",
  "/stock <i>pieza o código</i> — existencia y estante en almacén",
  "/pedir <i>pieza o código</i> <i>[cantidad]</i> <i>[para equipo]</i> — pide un repuesto; llega a Almacén",
  "/falla <i>equipo</i>: <i>qué pasó</i> — anota una falla en el Registro diario",
  "/pendiente <i>lo que hay que hacer</i> — anota un pendiente",
  "/tarea <i>lo que hay que hacer</i> — crea una tarea",
  "/falta <i>pieza</i> — anota que falta un repuesto",
  "/presupuesto — cómo va el gasto del año",
  "/reporte — enlace al formulario de turno",
  "",
  "Todos los días a las 8:40 y 20:40 mando el parte del turno que terminó, y aviso si falta algún reporte.",
].join("\n");
