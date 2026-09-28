// Los mismos datos y reglas que usa la app, para el bot de Telegram.
//
// Carga del repositorio (el checkout de GitHub Actions) el histórico del
// registro, los reportes del chat, los turnos, los centros de costo y las
// reglas de pendientes, y los junta con lo que hay en Firestore para armar
// "cómo va la planta": novedades, equipos parados, pendientes, reportes
// recibidos y presupuesto. Así el bot y la app dicen lo mismo.

import vm from "node:vm";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const URL_APP = process.env.APP_URL || "https://theo272004.github.io/equipos-repuestos/";
const CO = 5 * 3600e3;

export const hoyCO = () => new Date(Date.now() - CO).toISOString().slice(0, 10);
export const horaCO = () => new Date(Date.now() - CO).toISOString().slice(11, 16);
export const sumaDias = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const diaCO = (iso) => { const t = Date.parse(iso || ""); return Number.isFinite(t) ? new Date(t - CO).toISOString().slice(0, 10) : ""; };
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const fechaCorta = (iso) => { const [a, m, d] = String(iso).split("-").map(Number); return m ? `${DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${d} ${MESES[m - 1]}` : iso; };
export const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
export const plano = (v) => String(v ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
export const pesos = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e6) return `$ ${(v / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`;
  return `$ ${Math.round(v).toLocaleString("es-CO")}`;
};
export const corto = (nombre) => String(nombre || "").replace(/\+?\d[\d\s]{6,}/g, "").trim().split(/\s+/).filter((x) => !/^(temporal|electricista|mec[aá]nico)$/i.test(x)).slice(0, 2).join(" ");

// El turno que corre y el que acaba de terminar (día 8–20, noche 20–8)
export function turnoEnCurso() {
  const h = Number(horaCO().slice(0, 2));
  if (h >= 8 && h < 20) return { fecha: hoyCO(), turno: "Día", clave: "dia" };
  if (h >= 20) return { fecha: hoyCO(), turno: "Noche", clave: "noche" };
  return { fecha: sumaDias(hoyCO(), -1), turno: "Noche", clave: "noche" };
}
export function turnoAnterior(t = turnoEnCurso()) {
  return t.turno === "Día" ? { fecha: sumaDias(t.fecha, -1), turno: "Noche", clave: "noche" } : { fecha: t.fecha, turno: "Día", clave: "dia" };
}

// Carga los archivos de datos de la app en un contexto aislado
export function cargarDatosApp() {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  for (const f of ["assets/js/mtto-data.js", "assets/js/reportes-data.js", "assets/js/turnos-data.js", "assets/js/centros-costo.js", "assets/js/reglas-pendientes.js"]) {
    const ruta = join(RAIZ, f);
    if (existsSync(ruta)) vm.runInContext(readFileSync(ruta, "utf8"), ctx, { filename: f });
  }
  return ctx.window;
}

// Todo lo que el bot necesita de Firestore, en una sola lectura
export async function leerNube(db) {
  const [tareas, registros, estados, seguimiento, solicitudes, presupuesto, movimientos, reportes] = await Promise.all([
    db.listar("tareas"), db.listar("mtto_registros"), db.listar("mtto_estados"), db.listar("seguimiento"),
    db.listar("solicitudes"), db.listar("presupuesto"), db.listar("movimientos"), db.listar("reportes_turno"),
  ]);
  return { tareas, registros, estados, seguimiento, solicitudes, presupuesto, movimientos, reportes };
}

// Histórico del chat + lo registrado en la app (lo de la nube manda)
export function registrosCombinados(W, nube) {
  const m = new Map(((W.MTTO && W.MTTO.hist.registros) || []).map((r) => [r.id, r]));
  (nube.registros || []).forEach((r) => { if (!r || !r.id) return; if (r.borrado) m.delete(r.id); else m.set(r.id, r); });
  return [...m.values()];
}

// Estado de cada equipo de proceso según el último turno registrado
export function estadosActuales(W, nube, sede) {
  const cat = (W.MTTO && W.MTTO.catalogo.equipos) || [];
  const proc = new Set(cat.filter((e) => e.s === sede && e.proc).map((e) => e.eq));
  const base = {};
  Object.entries((W.MTTO && W.MTTO.hist.ultimoEstado) || {}).forEach(([k, e]) => { const [s, eq] = k.split("|"); if (s === sede) base[eq] = { e, p: "" }; });
  (nube.estados || []).filter((d) => d.sede === sede).sort((a, b) => (a.fecha + (a.turno === "Día" ? 0 : 1)).localeCompare(b.fecha + (b.turno === "Día" ? 0 : 1)))
    .forEach((d) => Object.entries(d.estados || {}).forEach(([eq, v]) => { base[eq] = { e: v.e, p: v.p || "" }; }));
  const out = { produccion: [], mantenimiento: [], montaje: [], otros: [] };
  Object.entries(base).forEach(([eq, v]) => {
    if (!proc.has(eq)) return;
    if (v.e === "Producción") out.produccion.push(eq);
    else if (v.e === "Mantenimiento") out.mantenimiento.push({ eq, p: v.p });
    else if (v.e === "Montaje / cuadre") out.montaje.push({ eq, p: v.p });
    else out.otros.push(eq);
  });
  out.total = out.produccion.length + out.mantenimiento.length + out.montaje.length + out.otros.length;
  return out;
}

// ¿Llegó el reporte de ese turno en esa sede? (chat, formulario o registro)
export function reporteRecibido(W, nube, regs, fecha, turno, sede) {
  const desde = turno === "Día" ? `${fecha} 17:00` : `${sumaDias(fecha, 1)} 05:00`;
  const hasta = turno === "Día" ? `${sumaDias(fecha, 1)} 04:59` : `${sumaDias(fecha, 1)} 13:00`;
  const en = (f, h) => `${f} ${h || "00:00"}` >= desde && `${f} ${h || "00:00"}` <= hasta;
  const chat = (W.REPORTES_TURNO || []).filter((r) => r.sede === sede && en(r.fecha, r.hora)).pop();
  if (chat) return { ok: true, via: "chat", hora: chat.hora, autor: chat.autor };
  const form = (nube.reportes || []).find((r) => r.sede === sede && r.fecha === fecha && r.turno === turno);
  if (form) return { ok: true, via: "formulario", hora: new Date(Date.parse(form.createdAt) - CO).toISOString().slice(11, 16), autor: form.por };
  const reg = regs.filter((r) => r.s === sede && ((r.src === "chat" && en(r.f, r.hr)) || (r.src !== "chat" && r.t === turno && (r.f === fecha || (turno === "Noche" && r.f === sumaDias(fecha, 1)))))).pop();
  if (reg) return { ok: true, via: "registro", hora: reg.hr || "", autor: reg.tec || reg.por };
  return { ok: false };
}

// Pendientes abiertos con las mismas reglas de la app
export function pendientesAbiertos(W, nube, regs) {
  const hoy = hoyCO();
  const seg = new Map((nube.seguimiento || []).map((d) => [d.id, d]));
  const R = W.REGLAS_PEND;
  const lista = [];
  (R ? R.desdeRegistros(regs) : []).forEach((p) => lista.push(p));
  (nube.tareas || []).filter((t) => t.status !== "hecha").forEach((t) => lista.push({
    id: `tar:${t.id}`, origen: "tarea", titulo: t.title || "Tarea", eq: t.machineName && t.machineName !== "General / Otra" ? t.machineName : "",
    fecha: diaCO(t.createdAt), prioridad: { Alta: "alta", Media: "media", Baja: "baja" }[t.priority] || "media", estadoBase: t.status === "en-progreso" ? "curso" : /^falta pieza/i.test(t.title || "") ? "espera" : "abierto",
  }));
  (nube.solicitudes || []).filter((s) => s.estado === "pedido" || s.estado === "emitida").forEach((s) => lista.push({
    id: `sol:${s.id}`, origen: "solicitud", titulo: `${s.estado === "pedido" ? "Pedido" : "Solicitud"} de ${(s.lineas || []).length} artículos${s.destino ? " para " + s.destino : ""}`,
    eq: s.destino || "", fecha: s.fecha || diaCO(s.createdAt), prioridad: s.estado === "pedido" ? "alta" : "media", estadoBase: "espera",
  }));
  (nube.seguimiento || []).filter((d) => d.origen === "manual" && !d.borrado).forEach((d) => lista.push({
    id: d.id, origen: "manual", titulo: d.titulo || "Pendiente", eq: d.eq || "", sede: d.sede || "", fecha: d.fecha || diaCO(d.createdAt), prioridad: d.prioridad || "media", estadoBase: "abierto",
  }));
  return lista.map((p) => {
    const s = seg.get(p.id);
    const estado = (s && s.estado) || p.estadoBase;
    const edad = p.fecha ? Math.max(0, Math.round((Date.parse(hoy) - Date.parse(p.fecha)) / 864e5)) : 0;
    return { ...p, estado, prioridad: (s && s.prioridad) || p.prioridad, responsable: (s && s.responsable) || "", edad, antiguo: edad > 30 && !s };
  }).filter((p) => p.estado !== "cerrado" && !p.antiguo)
    .sort((a, b) => ({ alta: 0, media: 1, baja: 2 }[a.prioridad] - { alta: 0, media: 1, baja: 2 }[b.prioridad]) || String(b.fecha).localeCompare(String(a.fecha)));
}

// Presupuesto del año: lo configurado y lo gastado (solicitudes + movimientos)
export function presupuestoDelAnio(nube, anio = Number(hoyCO().slice(0, 4))) {
  const cfg = (nube.presupuesto || []).find((d) => String(d.anio || d.id) === String(anio));
  if (!cfg || !Number(cfg.total)) return null;
  let ejecutado = 0;
  const porCC = new Map();
  const sumar = (cc, v) => { ejecutado += v; porCC.set(cc || "", (porCC.get(cc || "") || 0) + v); };
  (nube.solicitudes || []).forEach((s) => {
    if (!String(s.fecha || "").startsWith(String(anio)) || ["anulada", "borrador", "pedido", "atendido"].includes(s.estado) || s.tipo === "traslado") return;
    const signo = s.tipo === "devolucion" ? -1 : 1;
    (s.lineas || []).forEach((l) => { if (Number(l.pu) > 0) sumar(l.cc || s.cc, signo * Number(l.pu) * (Number(l.cant) || 0)); });
  });
  (nube.movimientos || []).forEach((m) => { if (!m.borrado && String(m.fecha || "").startsWith(String(anio)) && Number.isFinite(Number(m.valor)) && m.valor !== null) sumar(m.cc, Number(m.valor)); });
  const ini = Date.parse(`${anio}-01-01T00:00:00Z`), fin = Date.parse(`${anio + 1}-01-01T00:00:00Z`);
  const esperado = Math.min(1, Math.max(0, (Date.parse(hoyCO() + "T12:00:00Z") - ini) / (fin - ini)));
  const centros = (cfg.reparto || []).map((r) => ({ cc: r.cc, asignado: Number(r.valor) || 0, gastado: porCC.get(r.cc) || 0 }))
    .map((c) => ({ ...c, pct: c.asignado ? c.gastado / c.asignado : 0 })).sort((a, b) => b.pct - a.pct);
  return { anio, total: Number(cfg.total), ejecutado, esperado, centros };
}

// Quién trabaja en una fecha y turno
export function enTurno(W, fecha, clave) {
  if (!W.TURNOS) return {};
  return W.TURNOS.quienes(fecha, clave);
}

export function panorama(W, nube) {
  const regs = registrosCombinados(W, nube);
  const hoy = hoyCO();
  const t = turnoEnCurso();
  const ant = turnoAnterior(t);
  const sedes = ["Sede 4", "Sede 2"];
  return {
    hoy, t, ant, regs,
    titulo: (r) => (W.REGLAS_PEND ? W.REGLAS_PEND.tituloDe(r.de, r.eq) : String(r.de || "")),
    regsHoy: regs.filter((r) => r.f === hoy),
    estados: Object.fromEntries(sedes.map((s) => [s, estadosActuales(W, nube, s)])),
    reportes: Object.fromEntries(sedes.map((s) => [s, reporteRecibido(W, nube, regs, ant.fecha, ant.turno, s)])),
    pendientes: pendientesAbiertos(W, nube, regs),
    tareasHoy: (nube.tareas || []).filter((x) => x.status !== "hecha" && x.remindNextAt && diaCO(x.remindNextAt) <= hoy),
    sinEntregar: (nube.solicitudes || []).filter((s) => s.estado === "emitida"),
    pedidos: (nube.solicitudes || []).filter((s) => s.estado === "pedido"),
    presupuesto: presupuestoDelAnio(nube),
    turnoAhora: enTurno(W, t.fecha, t.clave),
  };
}
