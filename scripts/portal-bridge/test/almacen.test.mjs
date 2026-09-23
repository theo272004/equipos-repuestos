// Recorre en un navegador de verdad lo que hace un tecnico en Almacen y Diario:
//   cargar un RE356 -> buscar por equipo -> pedir -> descargar el DAD-010A
//   -> ver la solicitud en el Diario -> dejar una nota -> que todo quepa en un celular.
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
[...codsB2, ...otros].forEach((c, i) => filas.push([c, `PIEZA ${c}`, "UN", 1000, "N", 1, i % 5 === 0 ? 9 : 1, 30, 0.2, (i % 6) + 1, "R0" + ((i % 3) + 1), `M0${100 + i}`]));
filas.push([codsB2[0], `PIEZA ${codsB2[0]}`, "UN", 1000, "N", 1, 1, 30, 0.2, 7, "R04", "B0204"]); // segundo estante
const libro = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(libro, xlsx.utils.aoa_to_sheet(filas), "RE356");
const rutaRe = join(SALIDA, "re356-prueba.xls");
xlsx.writeFile(libro, rutaRe, { bookType: "biff8" });

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
await pg.click('[data-nav-view="almacen"]');
await pg.waitForSelector("#almQ");

// 1. cargar el reporte
await pg.setInputFiles('input[data-alm="archivo"]', rutaRe);
await pg.waitForSelector(".alm-aviso--ok, .alm-aviso--error", { timeout: 60000 });
const carga = (await pg.textContent(".alm-aviso")).trim();
ok(/Le.{1,2} \d/.test(carga) && /RE356/.test(carga), `no cargo el reporte: ${carga}`);

// 2. buscar por equipo: solo sus piezas, y "2" no confunde con "320"
await pg.fill("#almQ", "blisteadora 2");
const codsVistos = await pg.$$eval(".alm-table tbody tr td.pl-code", (t) => t.map((x) => x.textContent.trim()));
ok(codsVistos.length === codsB2.length, `"blisteadora 2" trajo ${codsVistos.length} piezas, la Blisteadora #2 tiene ${codsB2.length}`);
ok(codsVistos.every((c) => codsB2.includes(c)), "trajo piezas que no son de la Blisteadora #2");
ok(await pg.locator("text=Piezas de").count() > 0, "no dijo de que equipo son las piezas");
await pg.click('button[data-alm="todo"]');
const enTodo = await pg.$$eval(".alm-table tbody tr", (t) => t.length);
ok(enTodo !== codsVistos.length, "el boton de buscar en todo el almacen no cambio la busqueda");

// 3. pedir: la pieza con dos estantes sale por defecto del que mas tiene
await pg.fill("#almQ", codsB2[0]);
await pg.click('.alm-table button[data-alm="agregar"] >> nth=0');
await pg.fill("#almQ", codsB2[1]);
await pg.click('.alm-table button[data-alm="agregar"] >> nth=0');
const sitio = await pg.$eval('select[data-alm-linea="0"]', (s) => s.value).catch(() => "");
ok(sitio === "R04|B0204", `la pieza con dos estantes no salio del que mas tiene: ${sitio}`);
await pg.fill('input[data-alm-linea="0"][data-k="cant"]', "999");
await pg.locator('input[data-alm-linea="0"][data-k="cant"]').blur();
ok(await pg.locator(".alm-pasa").count() === 1, "no aviso que se piden mas de las que hay");
await pg.fill('input[data-alm-linea="0"][data-k="cant"]', "2");
await pg.locator('input[data-alm-linea="0"][data-k="cant"]').blur();
await pg.fill('[data-alm-campo="destino"]', "BLISTEADORA #2");
await pg.fill('[data-alm-campo="solicitadoPor"]', "PRUEBA");

// 4. descargar el formato y mirar dentro
const [descarga] = await Promise.all([pg.waitForEvent("download"), pg.click('[data-alm="emitir"]')]);
const rutaXlsx = join(SALIDA, "almacen-test.xlsx");
await descarga.saveAs(rutaXlsx);
const zip = await JSZip.loadAsync(await readFile(rutaXlsx));
const hoja = await zip.file("xl/worksheets/sheet1.xml").async("string");
const dibujo = await zip.file("xl/drawings/drawing1.xml").async("string");
ok(hoja.includes(`<c r="A13" s="23" t="inlineStr"><is><t xml:space="preserve">${codsB2[0]}</t>`), "el primer codigo no quedo en A13 con su estilo");
ok(hoja.includes(`<c r="M13" s="8"><v>2</v></c>`), "la cantidad no quedo en M13");
ok(hoja.includes('<c r="O13" s="18" t="inlineStr"><is><t xml:space="preserve">R04</t>'), "el almacen elegido no quedo en O13");
ok((dibujo.match(/<a:t>X<\/a:t>/g) || []).length === 1, "la casilla de consumo no quedo marcada");
ok(/^DAD-010A \d{4}-\d{2}-\d{2} BLISTEADORA 2\.xlsx$/.test(descarga.suggestedFilename()), `nombre de archivo raro: ${descarga.suggestedFilename()}`);
await pg.waitForSelector(".alm-aviso--ok");
ok(await pg.$$eval(".alm-hist tbody tr", (t) => t.length) === 1, "la solicitud no quedo en el historial");
ok(await pg.$$eval("#almSolicitud tbody tr", (t) => t.length) === 0, "la solicitud no se vacio despues de descargarla");

// 5. todo sobrevive a recargar
await pg.reload({ waitUntil: "load" });
await pg.waitForSelector("#almQ");
ok(/archivo cargado/.test(await pg.textContent(".pl-inv")), "al recargar se perdio el inventario cargado");
ok(await pg.$eval('[data-alm-campo="solicitadoPor"]', (i) => i.value) === "PRUEBA", "no recordo quien solicita");

// 6. Diario: la solicitud aparece sola y se puede dejar una nota
await pg.click('[data-nav-view="diario"]');
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

ok(!errores.length, "errores en la consola: " + errores.join(" | "));
await nav.close();
console.log(fallos.length ? "FALLOS:\n- " + fallos.join("\n- ") : "Todo correcto (Almacen y Diario).");
process.exit(fallos.length ? 1 : 0);
