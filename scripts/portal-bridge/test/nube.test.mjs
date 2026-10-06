// La app con una Firestore simulada (test/firebase-simulado.js): cuánto lee y
// qué escribe, sin tocar la nube de verdad. Dos contextos del navegador son dos
// equipos del taller que comparten la misma "nube", que vive aquí en Node.
//
//   - Abrir la app no escribe nada (ni la primera vez, ni al recargar).
//   - Guardar un dato sube ese documento y ningún otro.
//   - Un equipo con la copia vieja no pisa lo que otro acaba de cambiar
//     (datos de repuestos, y tareas que el bot marca como hechas).
//   - Un equipo que abre sin señal no siembra otra vez el historial de cambios
//     (revivía lo que alguien había borrado a propósito).
//   - Cuando el puente sube una carga nueva del RE356, la app baja solo los
//     artículos que cambiaron, y los agotados le llegan en 0.
//
//   cd /ruta/al/repo && python3 -m http.server 8777 &
//   node test/nube.test.mjs
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import xlsx from "xlsx";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const URL_APP = process.env.APP_URL || "http://localhost:8777/index.html";
const SIMULADO = await readFile(join(AQUI, "firebase-simulado.js"), "utf8");

const fallos = [];
const ok = (c, m) => { if (!c) fallos.push(m); };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------ la "nube"
const nube = new Map(); // coleccion -> Map(id -> datos)
const col = (c) => { if (!nube.has(c)) nube.set(c, new Map()); return nube.get(c); };
const lecturas = [];   // { equipo, col, n, como, filtros }
const escrituras = []; // { equipo, col, id, t }
const equipos = new Map(); // nombre -> { page, sinConexion, escuchas: Map(id -> { spec, ultimo }) , ultimaLlamada }

const S1 = "2026-09-28T10:00:00.000Z";
const S2 = "2026-09-29T10:00:00.000Z";
const cods = Array.from({ length: 20 }, (_, i) => String(100200300 + i));
cods.forEach((cod, i) => col("inventario").set(cod, { cod, desc: `PIEZA ${cod}`, exist: 5 + i, ub: `M0${100 + i}`, alm: "R01", um: "UN", min: 1, consumo: 0.2, sitios: JSON.stringify([{ alm: "R01", ub: `M0${100 + i}`, exist: 5 + i }]), actualizado: S1, fuente: "miportal", agotado: false }));
col("inventario_meta").set("estado", { actualizado: S1, articulos: cods.length, origen: "miportal" });
const tarea = (id, title) => ({ id, machine: "", machineName: "General / Otra", title, desc: "", priority: "Media", reporter: "Prueba", status: "pendiente", steps: [], createdAt: "2026-09-20T12:00:00.000Z" });
["t1", "t2", "t3"].forEach((id, i) => col("tareas").set(id, tarea(id, `Tarea de prueba ${i + 1}`)));
const DATO_A = "17332002|AAA", DATO_B = "17332002|BBB";
col("datos").set(encodeURIComponent(DATO_A), { id: DATO_A, exist: "3", actualizado: "2026-09-20T12:00:00.000Z" });
col("datos").set(encodeURIComponent(DATO_B), { id: DATO_B, exist: "7", actualizado: "2026-09-20T12:00:00.000Z" });
// El historial ya se sembró hace tiempo y alguien borró a propósito los eventos sembrados
col("cambios").set("__seed_ago2026", { id: "__seed_ago2026", marca: true, createdAt: "2026-08-26T00:00:00.000Z" });
col("cambios").set("ev1", { id: "ev1", eq: "17332002", cod: "AAA", fecha: "2026-09-10", q: 1, createdAt: "2026-09-10T00:00:00.000Z" });
col("inspecciones").set("i1", { id: "i1", eq: "17332002", tipo: "rutina", fecha: "2026-09-15", createdAt: "2026-09-15T00:00:00.000Z" });

function cumple(d, [campo, op, v]) {
  const x = d[campo];
  if (op === "==") return x === v;
  if (op === "!=") return x !== v;
  if (x === undefined || x === null) return false;
  if (op === ">") return x > v;
  if (op === ">=") return x >= v;
  if (op === "<") return x < v;
  if (op === "<=") return x <= v;
  if (op === "in") return v.includes(x);
  throw new Error("operador no simulado: " + op);
}
function resultado(spec) {
  if (spec.doc) { const d = col(spec.col).get(spec.doc); return d ? [{ id: spec.doc, data: d }] : []; }
  let docs = [...col(spec.col)].map(([id, data]) => ({ id, data })).filter((d) => (spec.filtros || []).every((f) => cumple(d.data, f)));
  if (spec.limite) docs = docs.slice(0, spec.limite);
  return docs;
}
const firma = (docs) => new Map(docs.map((d) => [d.id, JSON.stringify(d.data)]));
// Cada documento que el servidor entrega cuenta como una lectura (una consulta vacía, una)
function avisarEscuchas() {
  for (const [nombre, e] of equipos) {
    if (e.sinConexion) continue;
    for (const [id, es] of e.escuchas) {
      const docs = resultado(es.spec);
      const nueva = firma(docs);
      const cambiados = [...nueva].filter(([k, v]) => es.ultimo.get(k) !== v).length;
      const quitados = [...es.ultimo.keys()].filter((k) => !nueva.has(k)).length;
      if (!cambiados && !quitados && es.servidor) continue;
      es.ultimo = nueva;
      es.servidor = true;
      lecturas.push({ equipo: nombre, col: es.spec.col, n: cambiados, como: "escucha" });
      e.page.evaluate(([i, d]) => window.__fsPush && window.__fsPush(i, d), [id, docs]).catch(() => {});
    }
  }
}

async function prepararEquipo(nav, nombre) {
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
  // Playwright prueba primero la última ruta registrada: de lo general a lo concreto
  await ctx.route(/gstatic|googleapis|firebaseio|identitytoolkit/, (r) => r.abort());
  await ctx.route(/www\.gstatic\.com\/firebasejs\//, (r) => r.fulfill({ body: "", contentType: "text/javascript" }));
  await ctx.route(/www\.gstatic\.com\/firebasejs\/.*\/firebase-app-compat\.js/, (r) => r.fulfill({ body: SIMULADO, contentType: "text/javascript" }));
  await ctx.route("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", async (r) => r.fulfill({ body: await readFile(join(AQUI, "..", "node_modules", "xlsx", "dist", "xlsx.full.min.js")), contentType: "text/javascript" }));
  const e = { page: null, sinConexion: false, escuchas: new Map(), ultimaLlamada: Date.now(), enCola: [] };
  equipos.set(nombre, e);
  await ctx.exposeBinding("__fs", async (_src, op, arg) => {
    e.ultimaLlamada = Date.now();
    if (op === "olvidar") { e.escuchas.delete(arg.id); return {}; }
    if (op === "escuchar") {
      const spec = { col: arg.col, doc: arg.doc, filtros: arg.filtros, limite: arg.limite };
      const docs = resultado(spec);
      // Sin señal responde la copia local; el servidor llega al volver la señal
      e.escuchas.set(arg.id, { spec, ultimo: e.sinConexion ? new Map() : firma(docs), servidor: !e.sinConexion });
      if (e.sinConexion) return { sinConexion: true };
      lecturas.push({ equipo: nombre, col: arg.col, n: Math.max(1, docs.length), como: "escucha" });
      return { docs };
    }
    // Como la de verdad: sin señal lo escrito espera en el equipo y sube al reconectar
    if (op === "escribir" && e.sinConexion) await new Promise((listo) => e.enCola.push(listo));
    else if (e.sinConexion) return { error: "unavailable" };
    if (op === "leer") {
      const docs = resultado(arg);
      // limit(1) es la prueba de conexión de la barra superior, no una descarga
      lecturas.push({ equipo: nombre, col: arg.col, n: Math.max(1, docs.length), como: arg.limite === 1 ? "prueba" : "consulta", filtros: arg.filtros });
      return { docs };
    }
    if (op === "leerDoc") {
      lecturas.push({ equipo: nombre, col: arg.col, n: 1, como: "documento" });
      return { dato: col(arg.col).get(arg.id) || null };
    }
    if (op === "escribir") {
      for (const o of arg) {
        escrituras.push({ equipo: nombre, col: o.col, id: o.id, t: o.t });
        const c = col(o.col);
        if (o.t === "delete") c.delete(o.id);
        else if (o.t === "set") c.set(o.id, o.merge ? { ...(c.get(o.id) || {}), ...o.datos } : o.datos);
        else if (o.t === "update") { if (!c.has(o.id)) return { error: "not-found" }; c.set(o.id, { ...c.get(o.id), ...o.datos }); }
      }
      setTimeout(avisarEscuchas, 30);
      return {};
    }
    return { error: "unimplemented" };
  });
  const page = await ctx.newPage();
  e.page = page;
  page.on("pageerror", (x) => fallos.push(`${nombre}: error en la página: ${x.message}`));
  return e;
}

// Hasta que la app deja de hablar con la nube
async function calma(e, ms = 1500) {
  const t0 = Date.now();
  while (Date.now() - t0 < 20000) {
    await espera(250);
    if (Date.now() - e.ultimaLlamada > ms) return;
  }
}
// Al volver la señal, cada escucha recibe lo que se perdió
async function conectar(e, si) {
  e.sinConexion = !si;
  if (!si) return;
  e.enCola.splice(0).forEach((listo) => listo());
  await espera(50);
  avisarEscuchas();
}
const escritasDe = (nombre, desde = 0) => escrituras.slice(desde).filter((w) => w.equipo === nombre);
const leidasDe = (nombre, desde = 0, filtro = () => true) => lecturas.slice(desde).filter((l) => l.equipo === nombre && filtro(l)).reduce((s, l) => s + l.n, 0);
const lsDe = (e, clave) => e.page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), clave);

const nav = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
try {
  // 1. Un equipo nuevo abre la app: lee, pero no escribe nada
  const A = await prepararEquipo(nav, "A");
  let l0 = lecturas.length, w0 = escrituras.length;
  await A.page.goto(URL_APP, { waitUntil: "load" });
  ok(await A.page.evaluate(() => window.CLOUD && window.CLOUD.enabled === true), "la app no arrancó con la nube simulada");
  await calma(A);
  ok(escritasDe("A", w0).length === 0, `abrir la app escribió en la nube: ${JSON.stringify(escritasDe("A", w0))}`);
  const invPrimera = leidasDe("A", l0, (l) => l.col === "inventario" && l.como !== "prueba");
  ok(invPrimera === cods.length, `la primera vez debía bajar el inventario entero (${cods.length}), bajó ${invPrimera}`);
  console.log(`Equipo A abre por primera vez: ${leidasDe("A", l0)} lecturas (${invPrimera} del inventario), 0 escrituras`);

  // 2. Recargar: el inventario no se vuelve a bajar si el sello no cambió
  l0 = lecturas.length; w0 = escrituras.length;
  await A.page.reload({ waitUntil: "load" });
  await calma(A);
  ok(escritasDe("A", w0).length === 0, `recargar escribió en la nube: ${JSON.stringify(escritasDe("A", w0))}`);
  const invRecarga = leidasDe("A", l0, (l) => l.col === "inventario" && l.como !== "prueba");
  ok(invRecarga === 0, `al recargar volvió a bajar ${invRecarga} artículos del inventario`);
  console.log(`Equipo A recarga: ${leidasDe("A", l0)} lecturas (${invRecarga} del inventario), 0 escrituras`);

  // 3. Un segundo equipo
  const B = await prepararEquipo(nav, "B");
  w0 = escrituras.length;
  await B.page.goto(URL_APP, { waitUntil: "load" });
  await calma(B);
  ok(escritasDe("B", w0).length === 0, `el equipo B escribió al abrir: ${JSON.stringify(escritasDe("B", w0))}`);

  // 4. B se queda sin señal; A corrige un dato y sube solo ese documento
  await conectar(B, false);
  w0 = escrituras.length;
  await A.page.evaluate((k) => guardarDato(k, "cod", "111222333"), DATO_A);
  await calma(A, 800);
  const wA = escritasDe("A", w0);
  ok(wA.length === 1 && wA[0].col === "datos" && wA[0].id === encodeURIComponent(DATO_A), `guardar un dato debía escribir solo datos/${DATO_A}, escribió ${JSON.stringify(wA)}`);

  // 5. B, con la copia de antes, corrige otro dato; sube al volver la señal y no pisa el de A
  w0 = escrituras.length;
  await B.page.evaluate((k) => guardarDato(k, "exist", "9"), DATO_B);
  await calma(B, 800);
  ok(escritasDe("B", w0).length === 0, "sin señal no debía llegar nada a la nube");
  await conectar(B, true);
  await calma(B, 800);
  const wB = escritasDe("B", w0);
  ok(wB.length === 1 && wB[0].id === encodeURIComponent(DATO_B), `B debía escribir solo datos/${DATO_B}, escribió ${JSON.stringify(wB)}`);
  ok(col("datos").get(encodeURIComponent(DATO_A)).cod === "111222333", "B, con la copia vieja, borró el código que A acababa de guardar");
  ok(col("datos").get(encodeURIComponent(DATO_B)).exist === "9", "no llegó a la nube la existencia que corrigió B");

  // 6. Ya con señal, B ve lo de A
  const datosB = await lsDe(B, "equipos-datos-repuesto-v1");
  ok(datosB && datosB[DATO_A] && datosB[DATO_A].cod === "111222333", "al volver la señal B no vio el código que guardó A");

  // 7. Tareas: el bot marca t1 como hecha mientras B está sin señal; B cambia t2
  await conectar(B, false);
  col("tareas").set("t1", { ...col("tareas").get("t1"), status: "hecha", doneAt: new Date().toISOString(), doneBy: "bot" });
  avisarEscuchas();
  await espera(300);
  w0 = escrituras.length;
  ok(await B.page.evaluate(() => typeof taskSetStatus === "function"), "no se encontró taskSetStatus en la app");
  await B.page.evaluate(() => taskSetStatus("t2", "en-progreso"));
  await calma(B, 800);
  await conectar(B, true);
  await calma(B, 800);
  const wT = escritasDe("B", w0);
  ok(wT.length === 1 && wT[0].col === "tareas" && wT[0].id === "t2", `cambiar una tarea debía escribir solo tareas/t2, escribió ${JSON.stringify(wT)}`);
  ok(col("tareas").get("t1").status === "hecha", "B devolvió a pendiente la tarea que el bot había marcado como hecha");
  ok(col("tareas").get("t2").status === "en-progreso", "no llegó a la nube el cambio de B en t2");
  const tareasB = await lsDe(B, "equipos-tareas-v1");
  ok((tareasB || []).find((t) => t.id === "t1")?.status === "hecha", "al volver la señal B no vio la tarea que marcó el bot");

  // 8. El puente sube una carga nueva: dos existencias cambian y una pieza se agota
  const [c1, c2, c3] = cods;
  col("inventario").set(c1, { ...col("inventario").get(c1), exist: 99, actualizado: S2 });
  col("inventario").set(c2, { ...col("inventario").get(c2), exist: 1, actualizado: S2 });
  col("inventario").set(c3, { cod: c3, exist: 0, sitios: "[]", agotado: true, actualizado: S2, fuente: "miportal" });
  col("inventario_meta").set("estado", { ...col("inventario_meta").get("estado"), actualizado: S2 });
  l0 = lecturas.length; w0 = escrituras.length;
  avisarEscuchas();
  await calma(A, 1200);
  const consulta = lecturas.slice(l0).filter((l) => l.equipo === "A" && l.col === "inventario" && l.como !== "prueba");
  const invDelta = consulta.reduce((s, l) => s + l.n, 0);
  ok(invDelta === 3, `con la carga nueva debía bajar solo los 3 artículos cambiados, bajó ${invDelta}`);
  ok(consulta.every((l) => JSON.stringify(l.filtros) === JSON.stringify([["actualizado", ">", S1]])), `la consulta del inventario no fue "actualizado > sello anterior": ${JSON.stringify(consulta.map((l) => l.filtros))}`);
  const invA = await lsDe(A, "equipos-inventario-v1");
  const pc = (invA && invA.porCodigo) || {};
  ok(Object.keys(pc).length === cods.length, `tras la carga nueva A tiene ${Object.keys(pc).length} artículos, debían ser ${cods.length}`);
  ok(pc[c1] && pc[c1].exist === 99 && pc[c2] && pc[c2].exist === 1, "A no se enteró de las existencias nuevas");
  ok(pc[c3] && pc[c3].exist === 0 && pc[c3].desc === `PIEZA ${c3}`, "el agotado no quedó en 0 (o perdió su descripción)");
  ok(pc[cods[5]] && pc[cods[5]].exist === 10, "los artículos que no cambiaron se perdieron o cambiaron");
  ok(invA && invA.estado && invA.estado.sello === S2, "A no guardó el sello nuevo del inventario");
  ok(escritasDe("A", w0).length === 0 && escritasDe("B", w0).length === 0, "recibir la carga nueva escribió en la nube");
  console.log(`Carga nueva del puente (3 cambiados): A bajó ${invDelta} artículos`);

  // 9. Un equipo nuevo abre sin señal y después la recupera: no vuelve a sembrar el historial
  const C = await prepararEquipo(nav, "C");
  await conectar(C, false);
  w0 = escrituras.length;
  await C.page.goto(URL_APP, { waitUntil: "load" });
  await calma(C);
  await conectar(C, true);
  await calma(C);
  const wC = escritasDe("C", w0);
  ok(wC.length === 0, `el equipo que abrió sin señal escribió ${wC.length} documentos (${[...new Set(wC.map((w) => w.col))].join(", ")})`);
  ok(![...col("cambios").keys()].some((k) => k.startsWith("seed-ago2026-")), "revivieron en la nube los cambios sembrados que se habían borrado");

  // 10. Un RE356 cargado a mano en A queda guardado en la nube y le llega a B
  const SALIDA = join(AQUI, "..", "salida");
  await mkdir(SALIDA, { recursive: true });
  const re356 = async (nombre, filas) => {
    const libro = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(libro, xlsx.utils.aoa_to_sheet([["CODIGO", "DESCRIPCION", "U/M", "PRECIO UNIT", "CODIGO_MRP", "TAMAÑO_LOTE", "STOCK_MINIMO", "DIAS_APROV", "CONSUMO_MES", "EXISTENCIA", "ALMACEN", "UBICACION"], ...filas]), "RE356");
    const ruta = join(SALIDA, nombre);
    xlsx.writeFile(libro, ruta, { bookType: "biff8" });
    return ruta;
  };
  const NUEVO = "999000111";
  const filasRe = [...cods.slice(0, 18), NUEVO].map((c, i) => [c, `PIEZA ${c}`, "UN", 1000, "N", 1, 1, 30, 0.2, 40 + i, "R01", `M0${200 + i}`]);
  const rutaRe = await re356("re356-nube.xls", filasRe);
  // Los reportes se cargan en la ventana "Cargar reporte" de Almacén
  const cargar = async (E, ruta) => {
    await E.page.click('[data-alm="subir-abrir"] >> nth=0');
    await E.page.setInputFiles('input[data-up="archivo"]', ruta);
    await E.page.waitForSelector(".up__msg--ok, .up__msg--error", { timeout: 60000 });
    await E.page.click('.up__pie [data-up="cerrar"]');
  };
  await A.page.click('.sb [data-go="almacen"]');
  await A.page.waitForSelector("#almQ");
  w0 = escrituras.length;
  await cargar(A, rutaRe);
  await A.page.locator(".pl-inv", { hasText: "Guardado en la nube" }).waitFor({ timeout: 20000 }).catch(() => ok(false, "cargar un RE356 no dijo que quedo guardado en la nube"));
  await calma(A, 800); await calma(B, 800);
  const inv = col("inventario");
  ok(inv.get(NUEVO) && inv.get(NUEVO).exist === 58, "el RE356 cargado en A no quedo en la nube (falta el codigo nuevo)");
  ok(inv.get(cods[0]).exist === 40 && inv.get(cods[2]).exist === 42, "las existencias del RE356 cargado en A no quedaron en la nube");
  ok(inv.get(cods[18]).exist === 0 && inv.get(cods[19]).exist === 0, "lo que el RE356 ya no lista no quedo en 0 (agotado)");
  ok(col("inventario_meta").get("estado").actualizado > S2, "el sello del inventario no cambio con la carga de A");
  ok(escritasDe("A", w0).some((w) => w.col === "inventario_cargas"), "la carga no quedo registrada en inventario_cargas (Presupuesto)");
  const invB = await lsDe(B, "equipos-inventario-v1");
  ok(invB && invB.porCodigo[NUEVO] && invB.porCodigo[NUEVO].exist === 58 && invB.porCodigo[cods[19]].exist === 0, "el equipo B no recibio el inventario que cargo A");
  console.log(`RE356 cargado en A: ${escritasDe("A", w0).filter((w) => w.col === "inventario").length} artículos escritos; B lo recibió`);

  // 11. Un reporte parcial (3 códigos) no da por agotado todo lo demás
  const rutaParcial = await re356("re356-parcial.xls", cods.slice(0, 3).map((c, i) => [c, `PIEZA ${c}`, "UN", 1000, "N", 1, 1, 30, 0.2, 7 + i, "R01", "M0300"]));
  await cargar(A, rutaParcial);
  await A.page.locator(".pl-inv", { hasText: "(parcial)" }).waitFor({ timeout: 20000 }).catch(() => ok(false, "el reporte parcial no se marco como parcial"));
  await calma(A, 800);
  ok(inv.get(cods[10]).exist === 50 && inv.get(NUEVO).exist === 58, "un reporte parcial dejo en 0 lo que no traia");

  // 12. Un RE355 (requisiciones) cargado en A queda en la nube y le llega a B,
  //     que lo baja una sola vez: al recargar solo lee el sello.
  const libroQ = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(libroQ, xlsx.utils.aoa_to_sheet([
    ["RE355 - SEGUIMIENTO A REQUISICIONES"],
    ["CODIGO", "DESCRIPCION", "MRP/MPS", "FEC PEDIDO", "No. REQUISICION", "REQUERIDO", "ORDENADO", "RECIBIDO", "U/M", "USUARIO", "INSTAL", "ALMAC", "ESTADO", "ORD COMPRA", "LINEA", "FEC ENTREGA", "CENTRO DE COSTO", "ESTADO LINEA"],
    [cods[4], "PIEZA", "M", 20260920, "PLAN CON OC", 6, 6, 0, "UN", "PRUEBA", "FR", "R01", "OC Aprob", "241000", "1", "20261030", "", ""],
    [cods[5], "PIEZA", "N", 20260301, "3010999", 2, 2, 2, "UN", "PRUEBA", "FR", "R01", "OC Aprob", "230000", "1", "20260320", "", "CERRADA"],
  ]), "RE355");
  const rutaQ = join(SALIDA, "re355-nube.xls");
  xlsx.writeFile(libroQ, rutaQ, { bookType: "biff8" });
  w0 = escrituras.length; l0 = lecturas.length;
  await cargar(A, rutaQ);
  await calma(A, 800); await calma(B, 1200);
  const meta = col("inventario_meta");
  ok(meta.get("req-estado") && meta.get("req-estado").partes === 1 && meta.get("req-0") && meta.get("req-0").t.includes(cods[4]), "el RE355 cargado en A no quedo en la nube");
  const wQ = escritasDe("A", w0).filter((w) => w.col === "inventario_meta" && /^req-/.test(w.id));
  ok(wQ.length === 2, `subir el RE355 debia escribir 2 documentos (req-0 y req-estado), escribio ${wQ.length}`);
  const reqB = await lsDe(B, "equipos-requisiciones-v1");
  ok(reqB && reqB.datos && reqB.datos[cods[4]] && reqB.datos[cods[4]][2].length === 1 && reqB.estado.sello === meta.get("req-estado").actualizado, "el equipo B no recibio las requisiciones que cargo A");
  ok(await B.page.evaluate((c) => window.REQUISICIONES.de(c).camino, cods[4]) === 6, "en B la pieza pedida no sale con 6 en camino");
  ok(escritasDe("B", w0).length === 0, "recibir las requisiciones escribio desde B");
  l0 = lecturas.length;
  await B.page.reload({ waitUntil: "load" });
  await calma(B, 800);
  const reqRecarga = lecturas.slice(l0).filter((l) => l.equipo === "B" && l.col === "inventario_meta").reduce((s, l) => s + l.n, 0);
  ok(reqRecarga <= 2, `al recargar B volvio a bajar las requisiciones (${reqRecarga} lecturas de inventario_meta)`);
  console.log(`RE355 cargado en A: ${wQ.length} documentos escritos; B lo recibió`);

  console.log(`\nLecturas por equipo: ${[...equipos.keys()].map((n) => `${n} ${leidasDe(n)}`).join(", ")}. Escrituras: ${escrituras.length} (${escrituras.map((w) => `${w.equipo}:${w.col}/${decodeURIComponent(w.id)}`).join(", ")})`);
} finally {
  await nav.close();
}

if (fallos.length) {
  console.error(`\n${fallos.length} fallo(s):\n - ` + fallos.join("\n - "));
  process.exit(1);
}
console.log("\nNube simulada: todo bien.");
