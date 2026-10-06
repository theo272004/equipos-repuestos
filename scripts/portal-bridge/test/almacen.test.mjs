// Recorre en un navegador de verdad lo que hace un tecnico en Almacen y Diario:
//   cargar un RE356 -> buscar por equipo -> pedir -> descargar el DAD-010A
//   -> ver la solicitud en el Diario -> dejar una nota -> que todo quepa en un celular.
// Y el maestro de articulos (RE356R): buscar un codigo que no esta ni en el
// plan ni en el estante, recorrer una familia, cargar un RE356R sin estantes
// sin perder los que ya se sabian, y las sugerencias de codigo en la ficha.
// Fabrica su propio RE356 (con codigos reales del plan) para no depender de datos
// de la empresa en el repositorio.
//
//   cd /ruta/al/repo && python3 -m http.server 8777 &
//   node test/almacen.test.mjs
//
// CHROME_PATH permite apuntar a un Chromium ya instalado. Las librerias que la
// app baja de cdnjs se sirven aqui desde node_modules (mismas versiones).
import { chromium } from "playwright";
import xlsx from "xlsx";
import JSZip from "jszip";
import { readFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cargarPlan } from "../lib/plan.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const NM = join(AQUI, "..", "node_modules");
const SALIDA = join(AQUI, "..", "salida");
const URL_APP = process.env.APP_URL || "http://localhost:8777/index.html";
await mkdir(SALIDA, { recursive: true });

const fallos = [];
const ok = (c, m) => { if (!c) fallos.push(m); };

// --- un RE356 de prueba: las piezas de la Blisteadora #2 y algunas de otros equipos ---
const { equipos } = await cargarPlan();
const b2 = equipos.find((e) => e.c === "17332002");
const codsB2 = [...new Set(b2.r.map((r) => String(r.cod).trim().toUpperCase()).filter((c) => c && c !== "N/A"))];
const otros = equipos.filter((e) => e.c !== "17332002").flatMap((e) => e.r.map((r) => String(r.cod).trim().toUpperCase())).filter((c) => c && c !== "N/A" && !codsB2.includes(c)).slice(0, 30);
const filas = [["CODIGO", "DESCRIPCION", "U/M", "PRECIO UNIT", "CODIGO_MRP", "TAMAÑO_LOTE", "STOCK_MINIMO", "DIAS_APROV", "CONSUMO_MES", "EXISTENCIA", "ALMACEN", "UBICACION"]];
// Cada 7 codigos uno de compra automatica (M); los demas se piden a mano (N)
[...codsB2, ...otros].forEach((c, i) => filas.push([c, `PIEZA ${c}`, "UN", 1000, i % 7 === 0 ? "M" : "N", 1, i % 5 === 0 ? 9 : 1, 30, 0.2, (i % 6) + 1, "R0" + ((i % 3) + 1), `M0${100 + i}`]));
filas.push([codsB2[0], `PIEZA ${codsB2[0]}`, "UN", 1000, "N", 1, 1, 30, 0.2, 7, "R04", "B0204"]); // segundo estante
const libro = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(libro, xlsx.utils.aoa_to_sheet(filas), "RE356");
const rutaRe = join(SALIDA, "re356-prueba.xls");
xlsx.writeFile(libro, rutaRe, { bookType: "biff8" });

// --- el maestro que usa la app, para saber que esperar ---
const maestro = JSON.parse(await readFile(join(AQUI, "..", "..", "..", "assets", "data", "maestro-almacen.json"), "utf8"));
const enPlan = new Set(equipos.flatMap((e) => e.r.map((r) => String(r.cod).trim().toUpperCase())));
const enRe = new Set(filas.slice(1).map((f) => f[0]));
// Un codigo de mantenimiento que solo esta en el maestro y tiene plazo de compra
const soloMaestro = maestro.items.find(([c, , , f, dias]) => !enPlan.has(c) && !enRe.has(c) && dias > 0 && maestro.familias[f][1] === "mtto" && /^\d{9}$/.test(c));
const famRod = maestro.familias.findIndex((f) => /^Rodamientos/.test(f[0]));
const nRod = maestro.items.filter((x) => x[3] === famRod).length;

// --- un RE356R: todos los codigos, sin ALMACEN ni UBICACION ---
const filasR = [["CODIGO", "DESCRIPCION", "U/M", "PRECIO_UNITARI", "CODIGO_MRP", "TAMAÑO_LOTE", "STOCK_MINIMO", "DIAS_APROV", "CONSUMO_MES", "EXISTENCIAS"]];
[...codsB2, ...otros].forEach((c, i) => filasR.push([c, `PIEZA ${c}`, "UN", 1000, "N", 1, 1, 30, 0.2, i === 1 ? 11 : 3]));
const libroR = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(libroR, xlsx.utils.aoa_to_sheet(filasR), "RE356R");
const rutaReR = join(SALIDA, "re356r-prueba.xls");
xlsx.writeFile(libroR, rutaReR, { bookType: "biff8" });

// --- un RE355 (requisiciones): lo pedido que aun no llega ---
// todos = codsB2 + otros, en el orden del RE356. i=0 (M, min 9, hay 1) y i=5 (N,
// min 9, hay 6) estan bajo el minimo. Al de i=5 se le pide lo que falta: deja de
// estar "por comprar" y pasa a "en camino", con la entrega vencida. El de i=0 no
// tiene pedido abierto (su ultimo se cerro): el MRP no lo pidio. El de i=10 (N,
// min 9) no se ha pedido nunca: comprar a mano.
const todos = [...codsB2, ...otros];
const filasQ = [["RE355 - SEGUIMIENTO A REQUISICIONES"], ["CODIGO", "DESCRIPCION", "MRP/MPS", "FEC PEDIDO", "No. REQUISICION", "REQUERIDO", "ORDENADO", "RECIBIDO", "U/M", "USUARIO", "INSTAL", "ALMAC", "ESTADO", "ORD COMPRA", "LINEA", "FEC ENTREGA", "CENTRO DE COSTO", "ESTADO LINEA"]];
filasQ.push([todos[5], "PIEZA", "N", 20260901, "3012345", 5, 5, 0, "UN", "PRUEBA", "FR", "R01", "OC Aprob", "240001", "1", "20260915", "", ""]);
filasQ.push([todos[0], "PIEZA", "M", 20260301, "PLAN CON OC", 9, 9, 9, "UN", "PRUEBA", "FR", "R01", "OC Aprob", "230001", "1", "20260320", "", "CERRADA"]);
filasQ.push([todos[3], "PIEZA", "N", 20260920, "3012399", 4, 0, 0, "UN", "PRUEBA", "FR", "R01", "RQ. Sin Aprob", "", "", "", "", ""]);
const libroQ = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(libroQ, xlsx.utils.aoa_to_sheet(filasQ), "RE355");
const rutaReQ = join(SALIDA, "re355-prueba.xls");
xlsx.writeFile(libroQ, rutaReQ, { bookType: "biff8" });

// --- navegador ---
const nav = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
await ctx.route("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", async (r) => r.fulfill({ body: await readFile(join(NM, "xlsx/dist/xlsx.full.min.js")), contentType: "text/javascript" }));
await ctx.route("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", async (r) => r.fulfill({ body: await readFile(join(NM, "jszip/dist/jszip.min.js")), contentType: "text/javascript" }));
await ctx.route(/gstatic|googleapis/, (r) => r.abort());   // sin nube: todo en local
const pg = await ctx.newPage();
const errores = [];
pg.on("pageerror", (e) => errores.push(e.message));
pg.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_/.test(m.text())) errores.push(m.text()); });

await pg.goto(URL_APP, { waitUntil: "load" });
await pg.evaluate(() => localStorage.clear());
await pg.reload({ waitUntil: "load" });
await pg.click('.sb [data-go="almacen"]');
await pg.waitForSelector("#almQ");

// 0. el maestro de articulos llega solo al abrir Almacen
await pg.waitForFunction(() => window.MAESTRO && window.MAESTRO.listo, null, { timeout: 20000 });
ok(new RegExp(`maestro de ${maestro.total.toLocaleString("es-CO")} c`).test(await pg.textContent("#almFuente")), "no dice cuantos codigos trae el maestro");

// Cada reporte tiene su boton y su ventana: "Repuestos" (RE356) y "Requisiciones" (RE355)
async function cargarReporte(ruta, tipo = "re356") {
  await pg.click(`.section-actions [data-alm="subir-abrir"][data-tipo="${tipo}"]`);
  await pg.setInputFiles('input[data-up="archivo"]', ruta);
  await pg.waitForSelector(".up__msg--ok, .up__msg--error", { timeout: 60000 });
  const msg = (await pg.textContent(".up__msg")).replace(/\s+/g, " ").trim();
  await pg.click('.up__pie [data-up="cerrar"]');
  return msg;
}

// 1. cargar el reporte
const carga = await cargarReporte(rutaRe);
ok(/\d+ art.culos de re356-prueba/.test(carga), `no cargo el reporte: ${carga}`);
ok(await pg.locator('[data-alm="filtro"][data-v="pedir"]').count() === 0, "sin RE355 no se sabe que ya esta pedido: no deberia ofrecer \"Por comprar\"");

// 1a. cada ventana carga solo su reporte: cruzados, dicen donde van y no cargan nada
const cruzado1 = await cargarReporte(rutaReQ, "re356");
ok(/es el RE355/.test(cruzado1) && /Requisiciones RE355/.test(cruzado1), `el RE355 en la ventana de repuestos no dijo donde va: ${cruzado1}`);
ok(!(await pg.evaluate(() => window.REQUISICIONES.cargado)), "el RE355 entro por la ventana de repuestos");
const cruzado2 = await cargarReporte(rutaRe, "re355");
ok(/no es el RE355/.test(cruzado2) && /Repuestos RE356/.test(cruzado2), `el RE356 en la ventana de requisiciones no dijo donde va: ${cruzado2}`);
ok(/\d+ art.culos/.test(await pg.textContent("#almFuente")), "un archivo rechazado borro el inventario");

// 1b. el RE355: lo que viene en camino y lo que falta comprar
const cargaQ = await cargarReporte(rutaReQ, "re355");
ok(/Requisiciones de .*re355-prueba.* 2 l.neas sin llegar, 1 con la entrega vencida/.test(cargaQ), `no cargo el RE355 o conto mal lo abierto: ${cargaQ}`);
ok(/requisiciones de hoy \(2 sin llegar\)/.test(await pg.textContent("#almFuente")), "no dice de cuando son las requisiciones");
await pg.click('[data-alm="filtro"][data-v="camino"]');
const camino = await pg.$$eval(".alm-table tbody tr", (t) => t.map((x) => x.innerText.replace(/\s+/g, " ")));
ok(camino.length === 2 && camino.some((f) => f.includes(todos[5]) && /\+5 en camino/.test(f) && /OC 240001/.test(f) && /entrega vencida/.test(f)), `"En camino" no muestra el pedido atrasado de ${todos[5]}: ${camino.join(" | ")}`);
ok(camino.some((f) => f.includes(todos[3]) && /sin orden de compra/.test(f)), "no dice que la requisicion sin aprobar no tiene orden de compra");
await pg.click('[data-alm="filtro"][data-v="pedir"]');
const porComprar = await pg.$$eval(".alm-table tbody tr", (t) => t.map((x) => x.innerText.replace(/\s+/g, " ")));
const filaDe = (c) => porComprar.find((f) => f.includes(c)) || "";
ok(/el MRP no lo pidi/.test(filaDe(todos[0])) && /.ltimo pedido 1\/03\/2026 \(cerrada\)/.test(filaDe(todos[0])), `el codigo M bajo el minimo sin pedido no dice que el MRP no lo pidio: ${filaDe(todos[0])}`);
ok(/comprar a mano/.test(filaDe(todos[10])) && /no se ha pedido este a.o/.test(filaDe(todos[10])), `el codigo N bajo el minimo no dice comprar a mano: ${filaDe(todos[10])}`);
ok(!filaDe(todos[5]), "lo que ya viene en camino no deberia estar por comprar");
const [lista] = await Promise.all([pg.waitForEvent("download"), pg.click('[data-alm="lista-pedir"]')]);
const libroL = xlsx.read(await readFile(await lista.path()));
const filasL = xlsx.utils.sheet_to_json(libroL.Sheets["Por comprar"], { header: 1 });
const nComprar = Number((await pg.textContent(".alm-cuenta")).replace(/\D+art.*$/s, "").replace(/\D/g, ""));
ok(filasL.length === nComprar + 1 && filasL.some((f) => f[1] === todos[10] && /requisici/.test(f[0])), `la lista descargada no trae lo mismo que la pantalla (${filasL.length - 1} vs ${nComprar})`);
await pg.click('[data-alm="filtro"][data-v="pedir"]');

// 2. buscar por equipo: solo sus piezas, y "2" no confunde con "320"
await pg.fill("#almQ", "blisteadora 2");
const codsVistos = await pg.$$eval(".alm-table tbody tr td.pl-code", (t) => t.map((x) => x.textContent.trim()));
ok(codsVistos.length === codsB2.length, `"blisteadora 2" trajo ${codsVistos.length} piezas, la Blisteadora #2 tiene ${codsB2.length}`);
ok(codsVistos.every((c) => codsB2.includes(c)), "trajo piezas que no son de la Blisteadora #2");
ok(await pg.locator("text=Piezas de").count() > 0, "no dijo de que equipo son las piezas");
await pg.click('button[data-alm="todo"]');
const enTodo = await pg.$$eval(".alm-table tbody tr", (t) => t.length);
ok(enTodo !== codsVistos.length, "el boton de buscar en todo el almacen no cambio la busqueda");

// 2b. un codigo que solo sale en el maestro se encuentra, con su plazo de compra
await pg.fill("#almQ", soloMaestro[0]);
const filaM = (await pg.textContent(".alm-table tbody tr")).replace(/\s+/g, " ");
ok(filaM.includes(soloMaestro[1].split(" ")[0]), `no encontro ${soloMaestro[0]} del maestro: ${filaM}`);
ok(filaM.includes(`compra: ${soloMaestro[4].toLocaleString("es-CO")} d`), `no dijo el plazo de compra de ${soloMaestro[0]}: ${filaM}`);
ok(/no est.{1,2} en almac/.test(filaM), "con inventario cargado, lo que solo esta en el maestro deberia decir que no esta en almacen");
// una familia entera, sin escribir nada
await pg.fill("#almQ", "");
await pg.selectOption('select[data-alm="fam"]', String(famRod));
ok((await pg.textContent(".alm-cuenta")).includes(nRod.toLocaleString("es-CO")), `la familia de rodamientos no trajo sus ${nRod} codigos`);
await pg.selectOption('select[data-alm="fam"]', "");

// 3. pedir: la pieza con dos estantes sale por defecto del que mas tiene
await pg.fill("#almQ", codsB2[0]);
await pg.click('.alm-table button[data-alm="agregar"] >> nth=0');
await pg.fill("#almQ", codsB2[1]);
await pg.click('.alm-table button[data-alm="agregar"] >> nth=0');
await pg.click('#almPasos [data-alm="paso-llenar"]');   // paso 2: llenar la solicitud
const sitio = await pg.$eval('select[data-alm-linea="0"]', (s) => s.value).catch(() => "");
ok(sitio === "R04|B0204", `la pieza con dos estantes no salio del que mas tiene: ${sitio}`);
await pg.fill('input[data-alm-linea="0"][data-k="cant"]', "999");
await pg.locator('input[data-alm-linea="0"][data-k="cant"]').blur();
ok(await pg.locator(".alm-pasa").count() === 1, "no aviso que se piden mas de las que hay");
await pg.fill('input[data-alm-linea="0"][data-k="cant"]', "2");
await pg.locator('input[data-alm-linea="0"][data-k="cant"]').blur();
// Trans. y Codigo causa van por articulo: cada renglon con los suyos.
ok(await pg.locator('[data-alm-campo="trans"], [data-alm-campo="causa"]').count() === 0, "siguen los campos generales de Trans./Causa");
ok(await pg.isVisible("#alm-causa-0") && await pg.isVisible("#alm-causa-1"), "el codigo causa de cada pieza tiene que estar a la vista");
// "Igual en todas" copia el Trans. y la causa del primer renglon
await pg.fill("#alm-trans-0", "CO"); await pg.fill("#alm-causa-0", "07");
await pg.click('[data-alm="dad-todas"]');
ok(await pg.$eval("#alm-causa-1", (x) => x.value) === "07" && await pg.$eval("#alm-trans-1", (x) => x.value) === "CO", "Igual en todas no copio el Trans. y la causa");
// y cada una puede llevar el suyo
await pg.fill("#alm-trans-1", "TR"); await pg.fill("#alm-causa-1", "12");
await pg.fill('[data-alm-campo="destino"]', "BLISTEADORA #2");
await pg.fill('[data-alm-campo="solicitadoPor"]', "PRUEBA");
// las dos piezas salen de almacenes distintos (R04 y R02): dos hojas
ok(/Sale en 2 hojas/.test(await pg.textContent("#almSolicitud")), "no aviso que la solicitud sale en una hoja por almacen");

// 4. descargar el formato y mirar dentro
const [descarga] = await Promise.all([pg.waitForEvent("download"), pg.click('[data-alm="emitir"]')]);
const rutaXlsx = join(SALIDA, "almacen-test.xlsx");
await descarga.saveAs(rutaXlsx);
const zip = await JSZip.loadAsync(await readFile(rutaXlsx));
const hoja = await zip.file("xl/worksheets/sheet1.xml").async("string");
const hoja2 = await zip.file("xl/worksheets/sheet2.xml")?.async("string") || "";
const dibujo = await zip.file("xl/drawings/drawing1.xml").async("string");
const dibujo2 = await zip.file("xl/drawings/drawing2.xml")?.async("string") || "";
const libroDad = await zip.file("xl/workbook.xml").async("string");
ok(/<sheet name="DAD-010A R04"[^>]*\/><sheet name="DAD-010A R02"/.test(libroDad), "no salio una hoja por almacen (R04 y luego R02)");
ok(hoja.includes(`<c r="A13" s="23" t="inlineStr"><is><t xml:space="preserve">${codsB2[0]}</t>`), "el primer codigo no quedo en A13 con su estilo");
ok(hoja.includes(`<c r="M13" s="8"><v>2</v></c>`), "la cantidad no quedo en M13");
ok(hoja.includes('<c r="O13" s="18" t="inlineStr"><is><t xml:space="preserve">R04</t>'), "el almacen elegido no quedo en O13");
ok(!/<c r="A14"[^>]*t="inlineStr"/.test(hoja), "la hoja de R04 trae un renglon de otro almacen");
// dos X por hoja: la de Consumo y la de la empresa (Farmacapsulas, bajo el logo)
ok((dibujo.match(/<a:t>X<\/a:t>/g) || []).length === 2 && (dibujo2.match(/<a:t>X<\/a:t>/g) || []).length === 2, "las casillas de consumo y de la empresa no quedaron marcadas en las dos hojas");
const celda = (h, ref) => (new RegExp(`<c r="${ref}"[^>]*t="inlineStr"><is><t xml:space="preserve">([^<]*)<`).exec(h) || [])[1];
ok(celda(hoja, "G13") === "CO" && celda(hoja, "H13") === "07", `hoja R04: Trans./Causa = ${celda(hoja, "G13")}/${celda(hoja, "H13")}, esperaba CO/07`);
ok(celda(hoja2, "A13") === codsB2[1] && celda(hoja2, "O13") === "R02", `hoja R02: renglon 1 = ${celda(hoja2, "A13")}/${celda(hoja2, "O13")}`);
ok(celda(hoja2, "G13") === "TR" && celda(hoja2, "H13") === "12", `hoja R02: Trans./Causa = ${celda(hoja2, "G13")}/${celda(hoja2, "H13")}, esperaba TR/12`);
ok(celda(hoja2, "C8") === "BLISTEADORA #2", "la cabecera no se repitio en la segunda hoja");
ok(/^DAD-010A \d{4}-\d{2}-\d{2} BLISTEADORA 2\.xlsx$/.test(descarga.suggestedFilename()), `nombre de archivo raro: ${descarga.suggestedFilename()}`);
await pg.locator(".ux-toast", { hasText: "Descargado · 2 hojas (R04, R02)" }).waitFor({ timeout: 5000 }).catch(() => ok(false, "al descargar no salio el aviso corto con las dos hojas"));
ok(await pg.locator(".alm-aviso--ok", { hasText: "Ábrelo en Excel" }).count() === 0, "sigue el aviso largo al descargar");
ok(await pg.locator("#almSolicitud .alm-linea").count() === 0, "la solicitud no se vacio despues de descargarla");
await pg.evaluate(() => window.goSolicitudes());
await pg.waitForSelector("#solRoot .alm-hist");
ok(await pg.$$eval("#solRoot .alm-hist tbody tr", (t) => t.length) === 1, "la solicitud no quedo en el historial");
await pg.evaluate(() => window.goAlmacen());

// 4b. se saca todo de un almacen si se puede: solo lo que no hay ahi va aparte
// codsB2[0] esta en R01 (1) y R04 (7); codsB2[3] solo en R01. Sola, la primera
// sale de R04 (tiene mas), pero con la segunda las dos caben en R01: una hoja.
await pg.click('#almPasos [data-alm="paso-buscar"]');
await pg.fill("#almQ", codsB2[0]);
await pg.click('.alm-table button[data-alm="agregar"] >> nth=0');
await pg.click('#almPasos [data-alm="paso-llenar"]');
ok(await pg.$eval('select[data-alm-linea="0"]', (x) => x.value) === "R04|B0204", "sola, la pieza con dos estantes deberia salir del que mas tiene");
// la segunda, con "Agregar por codigo" dentro de la solicitud
await pg.fill(".alm-agregar input", codsB2[3]);
await pg.press(".alm-agregar input", "Enter");
ok(await pg.locator("#almSolicitud .alm-linea").count() === 2, "agregar por codigo no sumo la pieza a la solicitud");
ok(await pg.$eval('select[data-alm-linea="0"]', (x) => x.value) === "R01|M0100", "no junto las dos piezas en R01, el almacen que tiene las dos");
// cantidad con los botones - y +
await pg.click('[data-alm="cant-mas"][data-i="1"]');
await pg.click('[data-alm="cant-mas"][data-i="1"]');
ok(await pg.$eval('input[data-alm-linea="1"][data-k="cant"]', (x) => x.value) === "3", "el boton + no subio la cantidad");
await pg.click('[data-alm="cant-menos"][data-i="1"]');
ok(await pg.$eval('input[data-alm-linea="1"][data-k="cant"]', (x) => x.value) === "2", "el boton - no bajo la cantidad");
ok(await pg.locator(".alm-hojas").count() === 0, "con todo en R01 no deberia avisar de mas hojas");
// cambiarlo a mano manda, y la que queda en otro almacen se marca
await pg.selectOption('select[data-alm-linea="0"]', "R04|B0204");
ok(/Sale en 2 hojas/.test(await pg.textContent(".alm-hojas").catch(() => "")), "sacar una pieza de otro almacen a mano no aviso de la segunda hoja");
ok(await pg.locator("#almSolicitud .pl-tag", { hasText: "otra hoja" }).count() === 1, "no marco la pieza que va en otra hoja");
// el almacen principal se puede fijar: R04 primero, lo que no hay ahi aparte
await pg.selectOption('select[data-alm-campo="almacen"]', "R04");
ok(/R04 \(1\) · R01 \(1\)/.test(await pg.textContent(".alm-hojas").catch(() => "")), `con R04 de principal: ${await pg.textContent(".alm-hojas").catch(() => "(sin aviso)")}`);
await pg.selectOption('select[data-alm-campo="almacen"]', "");
ok(await pg.$eval('select[data-alm-linea="0"]', (x) => x.value) === "R01|M0100" && await pg.locator(".alm-hojas").count() === 0, "al volver a automatico no junto todo en R01");
// 4b. la solicitud es el paso 2: dice cuantas piezas lleva y se puede volver
// al buscador sin perder nada
ok(/Llenar solicitud\s*2/.test(await pg.textContent("#almPasos")), "el paso 2 no dice cuantas piezas lleva la solicitud");
await pg.click('#almPasos [data-alm="paso-buscar"]');
ok(await pg.isVisible("#almQ") && /2 piezas elegidas/.test(await pg.textContent("#almCarrito")), "al volver al buscador no se ve lo elegido");
await pg.click('#almPasos [data-alm="paso-llenar"]');
ok(await pg.locator("#almSolicitud .alm-linea").count() === 2, "al volver al paso 2 se perdieron las piezas");
pg.once("dialog", (d) => d.accept());
await pg.click('[data-alm="vaciar"]');

// 4c. una solicitud ya hecha se corrige y se vuelve a descargar: la misma, no otra
await pg.evaluate(() => window.goSolicitudes());
await pg.click('#solRoot .alm-hist details.alm-mas summary');
await pg.click('#solRoot .alm-hist button[data-alm="editar"]');
await pg.waitForSelector("#almSolicitud .alm-linea");
ok(/Corregir solicitud/.test(await pg.textContent("#almSolicitud")), "no abrio la solicitud para corregirla");
ok(await pg.locator("#almSolicitud .alm-linea").count() === 2, "la solicitud a corregir no trajo sus dos piezas");
await pg.fill('input[data-alm-linea="0"][data-k="cant"]', "5");
await pg.locator('input[data-alm-linea="0"][data-k="cant"]').blur();
await pg.click(`#almSolicitud button[data-alm="quitar"][data-cod="${codsB2[1]}"]`);
const [corregida] = await Promise.all([pg.waitForEvent("download"), pg.click('[data-alm="emitir"]')]);
const zipC = await JSZip.loadAsync(await readFile(await corregida.path()));
const hojaC = await zipC.file("xl/worksheets/sheet1.xml").async("string");
ok(hojaC.includes(`<c r="M13" s="8"><v>5</v></c>`) && !zipC.file("xl/worksheets/sheet2.xml"), "el formato corregido no trae la cantidad nueva o sigue con la hoja de la pieza quitada");
await pg.locator(".ux-toast", { hasText: "Solicitud corregida" }).waitFor({ timeout: 5000 }).catch(() => ok(false, "no dijo que la solicitud quedo corregida"));
await pg.evaluate(() => window.goSolicitudes());
await pg.waitForSelector("#solRoot .alm-hist");
ok(await pg.$$eval("#solRoot .alm-hist tbody tr", (t) => t.length) === 1, "corregir creo otra solicitud en vez de reemplazar la misma");
ok((await pg.textContent("#solRoot .alm-hist tbody tr td:nth-child(5)")).trim() === "1", "el historial no refleja la pieza quitada");
await pg.evaluate(() => window.goAlmacen());

// 5. todo sobrevive a recargar
await pg.reload({ waitUntil: "load" });
await pg.waitForSelector("#almQ");
ok(/solo en este equipo\) · \d+ art/.test(await pg.textContent(".alm-fresc")), "al recargar se perdio el inventario cargado");
ok(/requisiciones de hoy/.test(await pg.textContent(".alm-fresc")), "al recargar se perdieron las requisiciones");
ok(await pg.$eval('[data-alm-campo="solicitadoPor"]', (i) => i.value) === "PRUEBA", "no recordo quien solicita");

// 5b. un RE356R (sin estantes) cargado encima no borra donde estaba cada cosa
const cargaR = await cargarReporte(rutaReR);
ok(/conserv.{1,2} los de/.test(cargaR), `no aviso que conservo los estantes: ${cargaR}`);
await pg.fill("#almQ", codsB2[1]);
const filaR = (await pg.textContent(".alm-table tbody tr")).replace(/\s+/g, " ");
ok(/R0\d\/M0\d+/.test(filaR) && filaR.includes("11"), `el RE356R borro el estante o no puso la existencia nueva: ${filaR}`);

// 6. Diario: la solicitud aparece sola y se puede dejar una nota
await pg.evaluate(() => window.goDiario());   // "Calendario", dentro de Turno
await pg.waitForSelector(".dy-mes");
ok(await pg.locator(".dy-ev--sol").count() === 1, "la solicitud no aparece en el Diario de hoy");
await pg.fill('.dy-nota textarea[name="texto"]', "Nota de prueba");
await pg.click('.dy-nota button[type="submit"]');
ok(await pg.locator(".dy-ev--nota").count() === 1, "la nota no se guardo");
ok(await pg.locator(".dy-dia.is-hoy .dy-k--nota").count() === 1, "el dia de hoy no marca la nota en el calendario");

// 7. en el celular nada se sale de la pantalla
await pg.setViewportSize({ width: 390, height: 844 });
ok(await pg.evaluate(() => document.documentElement.scrollWidth) <= 390, "el Diario se sale de la pantalla del celular");
await pg.evaluate(() => window.goAlmacen());
await pg.fill("#almQ", "blisteadora 2");
await pg.click('.alm-table button[data-alm="agregar"] >> nth=0');
ok(await pg.evaluate(() => document.documentElement.scrollWidth) <= 390, "Almacen se sale de la pantalla del celular");

// 8. ficha: el maestro propone codigos por la referencia del fabricante
await pg.setViewportSize({ width: 1440, height: 1000 });
await pg.evaluate(() => openDetail("gkf2600"));
await pg.click('[data-profile-tab="spares"]');
await pg.waitForSelector(".sp-sug", { timeout: 10000 });
const sug = await pg.$$eval(".sp-sug", (b) => b.map((x) => x.textContent));
ok(sug.includes("¿741203259?"), `no propuso la correa 8-108-148-303 (741203259): ${sug.join(", ")}`);
ok(/GKF2600/.test(await pg.textContent(".sp-maestro-modelo")), "no enlaza los codigos del maestro que mencionan la GKF2600");

// 9. Mantenimiento: las correas de la Blister 2 por posición, con la de troqueladora pendiente
await pg.evaluate(() => openDetail("eq-17332002"));
await pg.click('[data-profile-tab="maintenance"]');
await pg.waitForSelector(".cmp-tabla tbody tr");
const correas = await pg.$$eval(".cmp-tabla tbody tr", (c) => c.map((x) => x.innerText.replace(/\s+/g, " ")));
ok(correas.length === 4, `el cuadro de correas de la Blister 2 deberia tener 4 filas, tiene ${correas.length}`);
ok(correas.some((t) => /troqueladora.*Pendiente/.test(t)), "la correa de la troqueladora no sale pendiente");
ok(correas.some((t) => /moldeo.*3 sep 2026.*24 oct 2027/.test(t)), `la de moldeo no estima el proximo cambio con lo que duro la anterior: ${correas[2]}`);

ok(!errores.length, "errores en la consola: " + errores.join(" | "));
await nav.close();
console.log(fallos.length ? "FALLOS:\n- " + fallos.join("\n- ") : "Todo correcto (Almacen y Diario).");
process.exit(fallos.length ? 1 : 0);
