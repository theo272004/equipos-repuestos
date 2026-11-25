// Lo que el MCP sabe contestar. Todo devuelve datos simples (objetos y listas): la
// presentación en texto la hace tools.mjs. Las reglas son las de la app.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cargarRepo, hoyCO, plano, diasEntre, sumaDias, estadoVivo } from "./repo.mjs";
import { cargarNube, coleccion, inventario, pieza } from "./nube.mjs";
import { config } from "./config.mjs";
import { registrosCombinados, pendientesAbiertos, enTurno, estadosActuales, turnoEnCurso } from "../../scripts/lib/datos-app.mjs";

// ------------------------------------------------------------------ contexto
// Carga repo + nube y deja listo el estado que usan compras.js y cambios-piezas.js
export async function contexto({ inv = true } = {}) {
  const [repo, nube] = await Promise.all([cargarRepo(), cargarNube({ inv })]);
  const regs = registrosCombinados(repo.W, nube).filter((r) => r && !r.borrado);
  estadoVivo.registros = regs;
  return { W: repo.W, nube, regs, hoy: hoyCO() };
}

// ------------------------------------------------------------------ equipos
export function listaEquipos(W) {
  const cat = (W.MTTO && W.MTTO.catalogo.equipos) || [];
  const porFicha = new Map();
  cat.forEach((e) => { if (e.fi) { if (!porFicha.has(e.fi)) porFicha.set(e.fi, []); porFicha.get(e.fi).push(e); } });
  return ((W.EQUIPOS_PLAN && W.EQUIPOS_PLAN.equipos) || []).map((p) => {
    const reg = porFicha.get(p.id) || [];
    return { cod: p.c, nombre: p.n, sede: p.u, area: p.cc, tipo: p.tipo, nombresRegistro: reg.map((x) => x.eq), sedesRegistro: [...new Set(reg.map((x) => x.s))], plan: p };
  });
}

// Texto libre ("blister 3", "17332002", "encapsuladora njp") → equipos candidatos, el mejor primero
export function resolverEquipo(W, texto, limite = 5) {
  const q = plano(texto);
  if (!q) return [];
  const todos = listaEquipos(W);
  const exacto = todos.filter((e) => e.cod === q.replace(/\s+/g, ""));
  if (exacto.length) return exacto;
  const toks = q.split(" ").filter(Boolean);
  const puntua = (e) => {
    const nombres = [e.nombre, ...e.nombresRegistro].map(plano);
    if (nombres.some((n) => n === q)) return 100;
    const hay = plano(`${e.nombre} ${e.nombresRegistro.join(" ")} ${e.area} ${e.cod}`);
    if (!toks.every((t) => hay.includes(t))) return 0;
    // "blister 3" no debe traer "blister 30": el número se busca como palabra entera
    const enteras = toks.every((t) => !/^\d+$/.test(t) || hay.split(/[^a-z0-9]+/).includes(t));
    if (!enteras) return 0;
    return 50 + (e.nombresRegistro.length ? 10 : 0) - hay.length / 200 + (nombres.some((n) => n.startsWith(q)) ? 20 : 0);
  };
  return todos.map((e) => ({ e, s: puntua(e) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, limite).map((x) => x.e);
}
export const resumenEquipo = (e) => ({ codigo: e.cod, nombre: e.nombre, sede: e.sede, area: e.area, nombreEnReportes: e.nombresRegistro.join(", ") || null });

// ------------------------------------------------------------------ fallas y equipos a atacar
const SIN_EQ = /no identificado|sin especificar/i;
const orden = (a, b) => (a.f + (a.hr || a.hi || "")).localeCompare(b.f + (b.hr || b.hi || ""));

export function rangoPeriodo(periodo, hoy) {
  if (periodo === "7") return { desde: sumaDias(hoy, -6), hasta: hoy };
  if (periodo === "30") return { desde: sumaDias(hoy, -29), hasta: hoy };
  if (periodo === "mes_pasado") {
    const fin = sumaDias(`${hoy.slice(0, 8)}01`, -1);
    return { desde: `${fin.slice(0, 8)}01`, hasta: fin };
  }
  return { desde: `${hoy.slice(0, 8)}01`, hasta: hoy }; // "mes"
}

export function paradasPorFalla(regs, hoy, sede) {
  const desde = sumaDias(hoy, -5);
  const ultima = new Map();
  regs.filter((r) => r.f >= desde && (r.cat === "Máquina" || r.cat === "Apoyo crítico" || /bomba de vac[íi]o|compresor|chiller/i.test(r.de || "")) && (!sede || r.s === sede))
    .sort(orden).forEach((r) => ultima.set(`${r.s}|${r.eq || String(r.de).slice(0, 30)}`, r));
  return [...ultima.values()].filter((r) => r.ef === "Pendiente" || r.frep === 1 || (/parada|fuera de servicio|averiada|bloqueada|se da[ñn]a.*pendiente/i.test(r.de || "") && r.ef !== "Operativo"));
}

// Mismo cálculo del Inicio de la app (assets/js/hoy.js → analisis)
export function analisis(regsTodos, { desde, hasta, hoy, sede }) {
  const regs = regsTodos.filter((r) => r.f >= desde && r.f <= hasta && (!sede || r.s === sede));
  const maq = regs.filter((r) => r.cat === "Máquina" && r.tp === "Correctivo" && !SIN_EQ.test(r.eq || ""));
  const paradas = new Set(paradasPorFalla(regsTodos, hoy, sede).map((r) => `${r.s}|${r.eq}`));
  const porEq = new Map();
  maq.forEach((r) => {
    const k = `${r.s}|${r.eq}`;
    const x = porEq.get(k) || { eq: r.eq, s: r.s, n: 0, min: 0, tipos: new Map() };
    x.n++; x.min += r.min || 0;
    if (r.fa && r.fa !== "Sin clasificar" && r.fa !== "Otra") x.tipos.set(r.fa, (x.tipos.get(r.fa) || 0) + 1);
    porEq.set(k, x);
  });
  const equipos = [...porEq.entries()].map(([k, x]) => {
    const ult = regs.filter((r) => r.eq === x.eq && r.s === x.s && r.cat === "Máquina").sort(orden).pop() || {};
    const parada = paradas.has(k);
    const estado = parada ? "Parada" : ult.ef === "Pendiente" ? "Pendiente" : ult.ef === "Operativo con pendiente" ? "Operativo con pendiente" : ult.ef === "Operativo" ? "Operativo" : "Sin cierre";
    const tipo = [...x.tipos.entries()].sort((a, b) => b[1] - a[1])[0];
    const score = (parada ? 50 : 0) + (estado === "Pendiente" ? 25 : estado === "Operativo con pendiente" ? 10 : 0) + (ult.frep ? 15 : 0) + x.n * 3 + x.min / 60;
    return { equipo: x.eq, sede: x.s, fallas: x.n, horasParo: Math.round((x.min / 60) * 10) / 10, estado, falloMasComun: tipo ? tipo[0] : null, ultimoRegistro: ult.f || null, ultimaNovedad: ult.de ? String(ult.de).slice(0, 220) : null, puntaje: Math.round(score * 10) / 10 };
  }).sort((a, b) => b.puntaje - a.puntaje || b.fallas - a.fallas);
  const tipos = new Map();
  let sinClasificar = 0;
  maq.forEach((r) => { if (!r.fa || r.fa === "Sin clasificar" || r.fa === "Otra") sinClasificar++; else tipos.set(r.fa, (tipos.get(r.fa) || 0) + 1); });
  const diasConDatos = new Set(regs.map((r) => r.f)).size || 1;
  return {
    desde, hasta, registros: regs.length, fallas: maq.length, fallasPorDia: Math.round((maq.length / diasConDatos) * 10) / 10,
    horasParoTotal: Math.round((regs.reduce((a, r) => a + (r.min || 0), 0) / 60) * 10) / 10,
    equipos, tipos: [...tipos.entries()].sort((a, b) => b[1] - a[1]).map(([tipo, n]) => ({ tipo, n })), sinClasificar,
    fallasMasLargas: maq.filter((r) => r.min > 0).sort((a, b) => b.min - a.min).slice(0, 5).map((r) => ({ fecha: r.f, equipo: r.eq, sede: r.s, horas: Math.round((r.min / 60) * 10) / 10, detalle: String(r.de || "").slice(0, 200) })),
  };
}

// ------------------------------------------------------------------ repuestos
let maestroCache = null;
async function maestro() {
  if (maestroCache) return maestroCache;
  const ruta = "assets/data/maestro-almacen.json";
  let txt;
  try {
    if (config.datosLocal) txt = await readFile(join(config.datosLocal, ruta), "utf8");
    else { const r = await fetch(config.datosUrl + ruta, { signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error(r.status); txt = await r.text(); }
  } catch { txt = await readFile(join(new URL("../../", import.meta.url).pathname, ruta), "utf8").catch(() => "{}"); }
  const d = JSON.parse(txt || "{}");
  const fams = d.familias || [];
  maestroCache = (d.items || []).map(([cod, desc, um, fam, dias]) => ({ cod, desc, um, otraArea: (fams[fam] || [])[1] === "otro" }));
  return maestroCache;
}

// Busca por código exacto o por palabras. Las existencias salen del inventario cargado
// (hasta 12 h de antigüedad) y, para los primeros resultados, de una lectura directa.
export async function buscarRepuestos(texto, limite = 8) {
  const q = plano(texto);
  const cod = q.replace(/\s+/g, "");
  const inv = [...((await inventario().catch(() => new Map())).values())];
  const mae = await maestro();
  const exactoInv = inv.find((a) => plano(a.cod) === cod);
  const exactoMae = mae.find((a) => plano(a.cod) === cod);
  let hallados;
  if (exactoInv || exactoMae) hallados = [exactoInv || { ...exactoMae, maestro: true }];
  else {
    const toks = q.split(" ").filter((t) => t.length > 1);
    if (!toks.length) return [];
    const pasa = (a) => { const h = plano(`${a.cod} ${a.desc} ${a.ub || ""}`); return toks.every((t) => h.includes(t)); };
    const enInv = inv.filter(pasa);
    const ya = new Set(enInv.map((a) => a.cod));
    const delMae = mae.filter((a) => !ya.has(a.cod) && pasa(a)).map((a) => ({ ...a, maestro: true }));
    const lugar = (a) => (a.maestro ? (a.otraArea ? 3 : 2) : Number(a.exist) > 0 ? 0 : 1);
    hallados = [...enInv, ...delMae].sort((a, b) => lugar(a) - lugar(b) || String(a.desc).localeCompare(String(b.desc))).slice(0, limite);
  }
  return hallados;
}

// Existencia al día de una pieza (lectura directa; si falla, lo que había en el inventario)
export async function existenciaVigente(a) {
  try { const d = await pieza(a.cod); return d || a; } catch { return a; }
}

export function sitiosDe(a) {
  try { return JSON.parse(a.sitios || "[]").map((s) => ({ bodega: s.alm, ubicacion: s.ub, existencia: s.exist })); } catch { return []; }
}

// ------------------------------------------------------------------ compras (compras.js de la app)
export const compraResumen = (e) => e && ({ etapa: e.t, resumen: e.texto, abierta: e.abierta, lineasAbiertas: e.n });
const lineaPlana = (l) => ({
  codigo: l.c, descripcion: l.d, etapa: (l.k || ""), oc: l.oc || null, requisicion: l.rq || null, proveedor: l.pv || null,
  pedida: l.fp || null, prometida: l.prom || l.ve || l.fe || null, atrasoDias: l.atraso || 0, ordenada: l.o ?? null, recibida: l.r ?? null, faltan: l.faltan ?? null, unidad: l.u || null,
});
export function repuestosPorLlegar(W, { filtro = "todo", q = "", limite = 25 }) {
  const C = W.COMPRAS;
  const ET = C.ET;
  const filtros = { todo: () => true, atrasada: (l) => l.k === "atrasada", camino: (l) => l.k === "camino" || l.k === "parcial", sin_avanzar: (l) => ["oc-aprobar", "rq-oc", "rq-aprobar", "plan"].includes(l.k) };
  const toks = plano(q).split(" ").filter(Boolean);
  const ls = C.lineas().filter((l) => l.k !== "llego" && (filtros[filtro] || filtros.todo)(l) && toks.every((t) => plano(`${l.c} ${l.d} ${l.pv} ${l.oc} ${l.rq}`).includes(t)))
    .sort((a, b) => ET[a.k].rank - ET[b.k].rank || (b.atraso || 0) - (a.atraso || 0) || String(a.prom || a.desde).localeCompare(String(b.prom || b.desde)));
  return { total: ls.length, lineas: ls.slice(0, limite).map((l) => ({ ...lineaPlana(l), etapa: ET[l.k].t })) };
}

export function porPedir(W, { incluirViejas = false, limite = 25 }) {
  const lista = W.COMPRAS.porPedir();
  const vigentes = lista.filter((x) => !x.viejo);
  const ver = (incluirViejas ? lista : vigentes).slice(0, limite).map((x) => ({
    equipo: x.eq, codigoEquipo: x.eqCod, sistema: x.sis, codigo: x.cod, descripcion: x.d, cantidadPorCambio: x.q, enAlmacen: x.hay,
    ultimoCambio: x.ultimo, proximoCambio: x.proximo, pedirAntesDe: x.pedir, plazoEntregaDias: x.plazo, diasParaVencer: x.vence, compra: compraResumen(x.est),
    excelSinActualizar: !!x.viejo,
  }));
  return { vigentes: vigentes.length, viejasSinActualizar: lista.length - vigentes.length, piezas: ver };
}

// ------------------------------------------------------------------ cambios de piezas
export function cambiosDePiezas(W, eq) {
  const m = { id: eq.plan.mid || eq.plan.id, name: eq.nombre, model: eq.nombre };
  return W.CAMBIOS_PIEZAS.piezasDe(m, eq.cod).map((p) => ({
    familia: p.familia, estado: p.estado, ultimoCambio: p.ultimo || null, proximoCambio: p.proximo || null, diasParaProximo: p.falta ?? null,
    vidaDias: p.vida || null, calculadoCon: p.base || null, excelSinActualizar: p.estado === "excel-viejo",
    cambiosRegistrados: (p.eventos || []).slice(0, 5).map((e) => ({ fecha: e.fecha, detalle: String(e.detalle || "").slice(0, 160), fuente: e.fuente, quien: e.quien || null })),
    piezasDelPlan: (p.plan || []).slice(0, 8).map((q) => ({ codigo: q.cod, descripcion: q.d, frecuencia: q.fq || null, ejecutadoExcel: q.ej || null, proximo: q.prox || null, estado: q.estado, enAlmacen: q.hay ?? null, compra: q.compra ? compraResumen(q.compra) : null, pedirAntesDe: q.pedir ? q.pedir.fecha : null })),
  }));
}

// ------------------------------------------------------------------ pendientes
export function pendientes(ctx, { eq = "", sede = "", limite = 30 }) {
  const toks = plano(eq).split(" ").filter(Boolean);
  const lista = pendientesAbiertos(ctx.W, ctx.nube, ctx.regs).filter((p) => (!sede || !p.sede || p.sede === sede) && toks.every((t) => plano(`${p.eq} ${p.titulo}`).includes(t)));
  return { total: lista.length, pendientes: lista.slice(0, limite).map((p) => ({ id: p.id, origen: p.origen, titulo: p.titulo, equipo: p.eq || null, sede: p.sede || null, prioridad: p.prioridad, estado: p.estado, desde: p.fecha || null, edadDias: p.edad, responsable: p.responsable || null })) };
}

// ------------------------------------------------------------------ mantenimientos / inspecciones
export function mantenimientosCombinados(W, nube) {
  const porId = new Map();
  const base = Array.isArray(W.INSPECCIONES_REGISTRO) ? W.INSPECCIONES_REGISTRO : [];
  base.forEach((i) => { if (i && i.id) porId.set(i.id, { ...i, fuente: "repositorio" }); });
  (nube.inspecciones || []).forEach((i) => { if (i && i.id) porId.set(i.id, { ...i, fuente: "nube" }); });
  return [...porId.values()].filter((i) => !i.borrado).sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")) || String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export function mantenimientos(W, nube, { equipo = "", estado = "", tipo = "", texto = "", desde = "", limite = 25 } = {}) {
  const eqMap = new Map(listaEquipos(W).map((e) => [e.cod, e.nombre]));
  const qEq = plano(equipo).split(" ").filter(Boolean);
  const qTxt = plano(texto).split(" ").filter(Boolean);
  const lista = mantenimientosCombinados(W, nube).filter((i) => {
    const nomEq = eqMap.get(i.eq) || i.eq || "";
    if (estado && (i.estado || "abierta") !== estado) return false;
    if (tipo && i.tipo !== tipo) return false;
    if (desde && String(i.fecha || "") < desde) return false;
    if (qEq.length && !qEq.every((t) => plano(`${i.eq} ${nomEq}`).includes(t))) return false;
    if (qTxt.length) {
      const hay = plano(`${i.eq} ${nomEq} ${i.quien} ${i.revisado} ${i.hallazgos} ${(i.piezas || []).map((p) => `${p.cod} ${p.d}`).join(" ")}`);
      if (!qTxt.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  return {
    total: lista.length,
    mantenimientos: lista.slice(0, limite).map((i) => ({
      id: i.id, fecha: i.fecha || null, equipoCodigo: i.eq || null, equipoNombre: eqMap.get(i.eq) || i.eq || null,
      tipo: i.tipo || "rutina", estado: i.estado || "abierta", quien: i.quien || null,
      revisado: i.revisado || "", hallazgos: i.hallazgos || "",
      piezasPendientes: (i.piezas || []).map((p) => ({ codigo: p.cod || null, descripcion: p.d || "", cantidad: p.q || null, urgencia: p.urgencia || "media", tipo: p.tipo || "pieza", hecho: p.hecho || null })),
      fotosCount: Array.isArray(i.fotos) ? i.fotos.length : 0,
      fuente: i.fuente,
    })),
  };
}

// ------------------------------------------------------------------ reportes de turno
export function reportesTurno(W, nube, { desde = "", hasta = "", sede = "", turno = "", texto = "", limite = 10 } = {}) {
  const porId = new Map();
  (Array.isArray(W.REPORTES_TURNO) ? W.REPORTES_TURNO : []).forEach((r) => { if (r && r.id) porId.set(r.id, r); });
  (nube.reportes || []).forEach((r) => { if (r && r.id) porId.set(r.id, r); });
  const q = plano(texto).split(" ").filter(Boolean);
  const lista = [...porId.values()].filter((r) => {
    const f = r.fecha || r.f || "";
    if (desde && f < desde) return false;
    if (hasta && f > hasta) return false;
    if (sede && plano(r.sede || r.s) !== plano(sede)) return false;
    if (turno && plano(r.turno || r.t) !== plano(turno)) return false;
    if (q.length && !q.every((t) => plano(`${r.autor || ""} ${r.texto || ""} ${r.sede || ""}`).includes(t))) return false;
    return true;
  }).sort((a, b) => String((b.fecha || b.f || "") + (b.hora || b.hr || "")).localeCompare(String((a.fecha || a.f || "") + (a.hora || a.hr || ""))));
  return {
    total: lista.length,
    reportes: lista.slice(0, limite).map((r) => ({
      id: r.id, fecha: r.fecha || r.f || null, hora: r.hora || r.hr || null,
      sede: r.sede || r.s || null, turno: r.turno || r.t || null, autor: r.autor || null,
      texto: String(r.texto || "").slice(0, 2200),
    })),
  };
}

// ------------------------------------------------------------------ centros de costo (DMM-229 / RE355)
const REGLAS_CC = [
  [/blister\s*#?\s*2|ups\s*300\s*r\b/i, "K9"],
  [/blister\s*#?\s*3|b1240/i, "X8"],
  [/blister\s*#?\s*4|integra\s*320/i, "CB"],
  [/blister\s*#?\s*5/i, "CM"],
  [/blister\s*#?\s*6|mb\s*432/i, "EF"],
  [/blister\s*#?\s*7|evo|mb\s*451/i, "GX"],
  [/blister\s*#?\s*[89]\b|blist/i, "L0"],
  [/gb\s*-?\s*100/i, "CA"],
  [/huttlin\s*600|hdgc\s*600/i, "HE"],
  [/huttlin\s*400|hdgc\s*400/i, "DM"],
  [/huttlin\s*40|pilot\s*lab/i, "DL"],
  [/schmucker|ms\s*235/i, "GU"],
  [/mt\s*1100|stick\s*pack/i, "DI"],
  [/marzio\s*#?\s*2\b/i, "FD"],
  [/marzio\s*#?\s*3\b/i, "FH"],
  [/marzio\s*#?\s*4\b/i, "GA"],
  [/marzio\s*#?\s*5\b/i, "GF"],
  [/marzio\s*#?\s*6\b/i, "GG"],
  [/marzio/i, "CD"],
  [/cb\s*550|sacheteadora\s*vertical/i, "EK"],
  [/colimatic/i, "L2"],
  [/r\s*-?\s*200\b/i, "EW"],
  [/r\s*-?\s*400\b/i, "HG"],
  [/fette\s*1010|fette\s*p1010/i, "Z9"],
  [/fette\s*2020[\s#-]*1\b|fette\s*p2020\b/i, "EX"],
  [/fette\s*2020[\s#-]*2\b|fette\s*2020\s*ii/i, "FY"],
  [/rimek/i, "FW"],
  [/ronchi/i, "K2"],
  [/bosch/i, "DU"],
  [/njp\s*#?\s*1\b|njp\s*-?\s*1200\b(?!.*2)/i, "DZ"],
  [/njp\s*#?\s*2\b|njp\s*-?\s*1200.*2/i, "EN"],
  [/njp\s*#?\s*3\b|njp\s*-?\s*3500/i, "K7"],
  [/envasad\w*\s*#?\s*1\b/i, "M0"],
  [/envasad\w*\s*#?\s*2\b/i, "FV"],
  [/envasad\w*\s*#?\s*3\b|ml\s*642/i, "FZ"],
  [/cl\s*#?\s*3|centro\s+l[ií]quidos?\s*#?\s*3/i, "EG"],
  [/cl\s*#?\s*[124]|centro\s+l[ií]quidos?/i, "M7"],
  [/bin\s*blender|mezclador.*400/i, "DS"],
  [/bomba.*agua\s*(fr[ií]a|helada|25|26)|chiller|uma\b|refrigeraci/i, "SA"],
  [/planta\s+de\s+agua|agua\s+purificada/i, "X2"],
  [/flexogr[aá]fica|tecnomaco|fx\s*30/i, "CC"],
  [/horno/i, "GB"],
];

export function centroCostoDeEquipo(W, textoEquipo) {
  const ccData = W.CENTROS_COSTO || { lista: [], equipos: {} };
  const porCod = new Map((ccData.lista || []).map((c) => [c.cod, c]));
  const candidatosEq = resolverEquipo(W, textoEquipo, 3);
  const eq = candidatosEq[0] || null;

  let sugerido = null;
  let motivo = "";

  // 1. Mapa oficial directo por código DMM (DMM-229)
  if (eq && ccData.equipos && ccData.equipos[eq.cod] && porCod.has(ccData.equipos[eq.cod])) {
    sugerido = porCod.get(ccData.equipos[eq.cod]);
    motivo = `Asignación directa oficial DMM-229 para el activo ${eq.cod}`;
  }
  // 2. Reglas explícitas por nombre de máquina
  if (!sugerido) {
    const muestra = plano(`${textoEquipo} ${eq ? eq.nombre + " " + eq.nombresRegistro.join(" ") : ""}`);
    for (const [rx, cod] of REGLAS_CC) {
      if (rx.test(muestra) && porCod.has(cod)) {
        sugerido = porCod.get(cod);
        motivo = `Correspondencia de máquina/línea en catálogo DMM-229 (${cod})`;
        break;
      }
    }
  }
  // 3. Búsqueda por tokens en lista oficial de centros de costo (ponderado por uso en ERP)
  const qToks = plano(`${textoEquipo} ${eq ? eq.area : ""}`).split(" ").filter((t) => t.length > 1);
  const scored = (ccData.lista || []).map((c) => {
    const h = plano(`${c.cod} ${c.nombre}`);
    const hits = qToks.filter((t) => h.includes(t)).length;
    return { c, score: hits * 20 + Math.min(c.uso || 0, 100) / 20 };
  }).filter((x) => x.score >= 20).sort((a, b) => b.score - a.score);

  if (!sugerido && scored.length) {
    sugerido = scored[0].c;
    motivo = "Coincidencia por nombre/área en catálogo RE355/DMM-229";
  }
  if (!sugerido && porCod.has("S1")) {
    sugerido = porCod.get("S1");
    motivo = "Centro de costo general de Mantenimiento Medicamentos (sin centro específico de máquina)";
  }

  const alternativas = [];
  const agregados = new Set(sugerido ? [sugerido.cod] : []);
  for (const x of scored.slice(0, 4)) {
    if (!agregados.has(x.c.cod)) { alternativas.push(x.c); agregados.add(x.c.cod); }
  }
  if (porCod.has("S1") && !agregados.has("S1")) { alternativas.push(porCod.get("S1")); agregados.add("S1"); }

  return {
    buscado: textoEquipo,
    equipo: eq ? resumenEquipo(eq) : null,
    centroCostoSugerido: sugerido ? { codigo: sugerido.cod, nombre: sugerido.nombre, tipo: sugerido.tipo || "operativo", usoErp: sugerido.uso || 0, motivo } : null,
    alternativas: alternativas.map((c) => ({ codigo: c.cod, nombre: c.nombre, usoErp: c.uso || 0 })),
  };
}

// ------------------------------------------------------------------ turno
export function personalEnTurno(W, fecha, clave) {
  const t = turnoEnCurso();
  const f = fecha || t.fecha, c = clave || t.clave;
  const q = enTurno(W, f, c);
  return { fecha: f, turno: c === "noche" ? "Noche" : "Día", personal: q };
}
export { estadosActuales, turnoEnCurso, diasEntre, sumaDias, hoyCO, coleccion };
