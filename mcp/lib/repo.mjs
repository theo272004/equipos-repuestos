// Los datos que viajan con el repositorio (plan de mantenimiento, compras, reportes del
// chat, componentes seguidos…) se leen del sitio publicado y se evalúan en un contexto
// aislado, igual que en el navegador. Así el MCP dice lo mismo que la app, sin copiar datos.
// También se carga compras.js de la app, para no reescribir sus reglas.

import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DATOS = ["assets/js/mtto-data.js", "assets/js/reportes-data.js", "assets/js/turnos-data.js", "assets/js/centros-costo.js", "assets/js/reglas-pendientes.js", "assets/equipos.js", "assets/js/compras-data.js", "assets/js/componentes-registro.js"];
const LOGICA = ["assets/js/compras.js", "assets/js/cambios-piezas.js"];

const CO = 5 * 3600e3;
export const hoyCO = () => process.env.MCP_HOY || new Date(Date.now() - CO).toISOString().slice(0, 10);
export const plano = (v) => String(v ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
export const diasEntre = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);
export const sumaDias = (iso, n) => new Date(Date.parse(iso + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);

async function leerArchivo(ruta) {
  if (config.datosLocal) return readFile(join(config.datosLocal, ruta), "utf8");
  try {
    const r = await fetch(config.datosUrl + ruta, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`${r.status}`);
    return await r.text();
  } catch (e) {
    // Sin red o sitio caído: lo que trae esta copia del repositorio
    return readFile(join(RAIZ, ruta), "utf8");
  }
}

// Lo mínimo que compras.js y cambios-piezas.js esperan del navegador
function crearContexto(estado) {
  const fmtCorta = (iso) => { const [, m, d] = String(iso || "").split("-").map(Number); return m ? `${d} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][m - 1]}` : ""; };
  const N = {
    esc: (v) => String(v ?? ""), plano, hoy: hoyCO, diasEntre, sumaDias,
    fmt: { corta: fmtCorta, fecha: fmtCorta, fechaLarga: fmtCorta, num: (n) => Number(n || 0).toLocaleString("es-CO") },
  };
  const ctx = { console, window: {}, views: {}, document: { getElementById: () => null }, setView() {}, saveUiState() {}, localStorage: undefined };
  ctx.window.NUCLEO = N;
  ctx.window.IC = () => "";
  ctx.window.scrollTo = () => {};
  ctx.window.MTTO_STORE = { registros: () => estado.registros };
  ctx.window.INVENTARIO = {
    get cargado() { return estado.inventario != null; },
    norm: (c) => String(c || "").trim(),
    de: (c) => (estado.inventario ? estado.inventario.get(String(c).trim()) : null),
  };
  // Cambios de piezas: los de la nube + los del registro del repositorio (como la app)
  ctx.cambiosEventos = () => {
    const propios = estado.cambios.filter((c) => c && !c.marca && c.cod);
    const ya = new Set(propios.filter((c) => c.ubic).map((c) => c.ubic + "|" + c.fecha));
    const reg = [];
    (ctx.window.COMPONENTES_SEGUIDOS || []).forEach((g) => (g.items || []).forEach((it) => (it.cambios || []).forEach((c) => reg.push({
      id: `reg-${it.id}-${c.fecha}`, eq: g.eq, cod: it.cod, d: it.d, fecha: c.fecha, q: 1, quien: "",
      nota: it.ubicacion + (c.nota ? " · " + c.nota : "") + (c.fuente ? " (" + c.fuente + ")" : ""), ubic: it.id, registro: true,
    }))));
    return propios.concat(reg.filter((e) => !ya.has(e.ubic + "|" + e.fecha)));
  };
  vm.createContext(ctx);
  return ctx;
}

let cache = null;
// estado: lo que cambia entre consultas (lo llena nube.mjs antes de calcular)
export const estadoVivo = { registros: [], cambios: [], inventario: null };

export async function cargarRepo() {
  if (cache && Date.now() - cache.t < config.ttl.repo) return cache.v;
  if (cache && cache.pend) return cache.pend;
  const pend = (async () => {
    const ctx = crearContexto(estadoVivo);
    const textos = await Promise.all([...DATOS, ...LOGICA].map(async (f) => [f, await leerArchivo(f)]));
    for (const [f, t] of textos) {
      try { vm.runInContext(t, ctx, { filename: f }); } catch (e) { console.error(`No se pudo evaluar ${f}:`, e.message); }
    }
    // equipos.js define window.EQUIPOS_PLAN; algunos archivos usan const globales: se leen igual vía window
    const v = { W: ctx.window, ctx, cargado: new Date().toISOString() };
    cache = { t: Date.now(), v };
    return v;
  })();
  cache = { ...(cache || { t: 0 }), pend };
  try { return await pend; } finally { if (cache && cache.pend === pend) delete cache.pend; }
}
