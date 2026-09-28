// Comprueba que el DAD-010A se rellena SIN alterar el formato oficial:
//   1. Todo archivo del .xlsx que no sea la hoja o el dibujo queda identico,
//      byte a byte (logos, estilos, tema, impresion...).
//   2. En la hoja solo cambian las celdas de datos, y cada una conserva su
//      estilo original.
//   3. En el dibujo solo cambia la casilla marcada.
//   4. Un formato de otra edicion (etiquetas movidas) se rechaza.
//   5. Varios almacenes: una hoja por almacen, cada una el formato completo
//      con solo sus renglones (almacen no recibe almacenes mezclados).
//   6. Si hay LibreOffice, se imprime a PDF/PNG en salida/ para mirarlo.
import JSZip from "jszip";
import xlsx from "xlsx";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rellenarDAD010A, RENGLONES, hojasPorAlmacen } from "../../../assets/js/formato-dad010a.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "salida");
const PLANTILLA = join(AQUI, "..", "..", "..", "assets", "formatos", "DAD-010A.xlsx");
await mkdir(SALIDA, { recursive: true });

const fallos = [];
const ok = (c, m) => { if (!c) fallos.push(m); };

const plantilla = await readFile(PLANTILLA);
const datos = {
  tipo: "consumo",
  fecha: "2026-09-23",
  area: "MANTENIMIENTO",
  departamento: "PRODUCCION SEDE 4",
  destino: "BLISTEADORA #2 UPS300R",
  alistadoPor: "",
  solicitadoPor: "J. PEREZ",
  autorizadoPor: "",
  observaciones: "Cambio preventivo de rodamientos en estacion de sellado; se devuelven las piezas retiradas al almacen para su disposicion final segun procedimiento.",
  // Un solo almacen: el archivo tiene que ser el de siempre, con su unica hoja.
  lineas: [
    { cod: "741901001", desc: "RODAMIENTO DE BOLA REF 6205 2RS", um: "UN", cant: 2, alm: "R01", ub: "Z0405" },
    { cod: "MCP013016", desc: "CLUTCH MOD. ORIGINAL - PIEZA 6", um: "UN", cant: 1, alm: "R01", ub: "L0102" },
    { cod: "090020008", desc: "ESTIBA DE MADERA CAMPANO DE 1.06 X 1.37", um: "UN", cant: 3, alm: "R01", ub: "SJ0412", causa: "07", trans: "CO" },
    { cod: "741908035", desc: "RODAMIENTO RODILLO CILINDR BLISTERS REF SL045012 <prueba & escape>", um: "UN", cant: 1, alm: "R01", ub: "B0204" },
  ],
};

const salida = await rellenarDAD010A(JSZip, plantilla, datos, "uint8array");
const rutaSalida = join(SALIDA, "DAD-010A-prueba.xlsx");
await writeFile(rutaSalida, salida);

// --- 1. todo lo que no es hoja ni dibujo, identico ---
const A = await JSZip.loadAsync(plantilla);
const B = await JSZip.loadAsync(salida);
const nombresA = Object.keys(A.files).filter((n) => !A.files[n].dir).sort();
const nombresB = Object.keys(B.files).filter((n) => !B.files[n].dir).sort();
ok(JSON.stringify(nombresA) === JSON.stringify(nombresB), `cambio la lista de archivos del xlsx: ${nombresA.length} vs ${nombresB.length}`);
const tocados = ["xl/worksheets/sheet1.xml", "xl/drawings/drawing1.xml"];
for (const n of nombresA) {
  if (tocados.includes(n)) continue;
  const a = Buffer.from(await A.file(n).async("uint8array"));
  const b = Buffer.from(await B.file(n).async("uint8array"));
  ok(a.equals(b), `el archivo interno ${n} cambio y no deberia`);
}

// --- 2. en la hoja solo cambian las celdas de datos, con su estilo ---
const hojaA = await A.file("xl/worksheets/sheet1.xml").async("string");
const hojaB = await B.file("xl/worksheets/sheet1.xml").async("string");
const celdas = (h) => new Map([...h.matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)].map((m) => [m[1], { s: (/\bs="(\d+)"/.exec(m[2]) || [])[1], cuerpo: m[3] || "" }]));
const cA = celdas(hojaA), cB = celdas(hojaB);
ok(cA.size === cB.size, `cambio el numero de celdas: ${cA.size} -> ${cB.size}`);
const cambiadas = [];
for (const [ref, a] of cA) {
  const b = cB.get(ref);
  if (!b) { fallos.push(`desaparecio la celda ${ref}`); continue; }
  ok(a.s === b.s, `la celda ${ref} perdio su estilo: s=${a.s} -> s=${b.s}`);
  if (a.cuerpo !== b.cuerpo) cambiadas.push(ref);
}
const esperadas = new Set(["L4", "B6", "K6", "C8", "A34", "D35", "A36"]);
datos.lineas.forEach((l, i) => { const f = 13 + i; for (const [k, c] of Object.entries({ cod: "A", desc: "C", trans: "G", causa: "H", um: "L", cant: "M", alm: "O", ub: "P" })) if (l[k] !== undefined && l[k] !== "") esperadas.add(c + f); });
const deMas = cambiadas.filter((r) => !esperadas.has(r));
const deMenos = [...esperadas].filter((r) => !cambiadas.includes(r));
ok(!deMas.length, `se escribio en celdas que no tocaba: ${deMas.join(", ")}`);
ok(!deMenos.length, `faltaron celdas por escribir: ${deMenos.join(", ")}`);
// el resto de la hoja (fuera de las celdas) identico: columnas, combinaciones, impresion
const sinCeldas = (h) => h.replace(/<sheetData>[\s\S]*<\/sheetData>/, "");
ok(sinCeldas(hojaA) === sinCeldas(hojaB), "cambio algo de la hoja fuera de las celdas (anchos, combinaciones, impresion)");
ok(/<c r="L4" s="47"><v>46288<\/v><\/c>/.test(hojaB), "la fecha no quedo como fecha de Excel (serie 46288 = 2026-09-23)");
ok(hojaB.includes("&lt;prueba &amp; escape&gt;"), "no se escaparon los caracteres especiales");
ok(/<c r="A15" s="23" t="inlineStr"><is><t xml:space="preserve">090020008<\/t>/.test(hojaB), "el codigo con ceros a la izquierda no quedo como texto");

// --- 3. en el dibujo solo aparece la X de CONSUMO ---
const dA = await A.file("xl/drawings/drawing1.xml").async("string");
const dB = await B.file("xl/drawings/drawing1.xml").async("string");
const xs = (dB.match(/<a:t>X<\/a:t>/g) || []).length;
ok(xs === 1, `esperaba una sola X en las casillas y hay ${xs}`);
const rect8 = /name="Rectangle 8"[\s\S]*?<\/xdr:twoCellAnchor>/.exec(dB)?.[0] || "";
ok(rect8.includes("<a:t>X</a:t>"), "la X no quedo en la casilla de CONSUMO (Rectangle 8)");
ok(dA.replace(/<a:r><a:rPr[^>]*>[\s\S]*?<a:t>X<\/a:t><\/a:r>/, "") === dA && dB.replace(/<a:r><a:rPr[^>]*>[\s\S]*?<a:t>X<\/a:t><\/a:r>/, "") === dA, "el dibujo cambio en algo mas que la X");

// --- 4. otra edicion se rechaza ---
const otra = await JSZip.loadAsync(plantilla);
const ss = await otra.file("xl/sharedStrings.xml").async("string");
otra.file("xl/sharedStrings.xml", ss.replace("DESTINO:", "PLANTA:"));
let rechazo = "";
try { await rellenarDAD010A(JSZip, await otra.generateAsync({ type: "uint8array" }), datos, "uint8array"); } catch (e) { rechazo = e.message; }
ok(/edicion/i.test(rechazo) && /A8/.test(rechazo), `un formato con etiquetas cambiadas se relleno igual: ${rechazo || "(sin error)"}`);

// --- y mas renglones de los que caben, tambien ---
let demasiadas = "";
try { await rellenarDAD010A(JSZip, plantilla, { lineas: Array.from({ length: RENGLONES + 1 }, (_, i) => ({ cod: "X" + i })) }, "uint8array"); } catch (e) { demasiadas = e.message; }
ok(/20 renglones/.test(demasiadas), `aceptó 21 renglones: ${demasiadas || "(sin error)"}`);

// --- 5. varios almacenes: una hoja por almacen ---
const mezcla = {
  ...datos,
  lineas: [
    { cod: "741901001", desc: "RODAMIENTO DE BOLA REF 6205 2RS", um: "UN", cant: 2, alm: "R01", ub: "Z0405" },
    { cod: "MCP013016", desc: "CLUTCH MOD. ORIGINAL - PIEZA 6", um: "UN", cant: 1, alm: "R02", ub: "L0102" },
    { cod: "090020008", desc: "ESTIBA DE MADERA", um: "UN", cant: 3, alm: "F02", ub: "SJ0412", causa: "07", trans: "CO" },
    { cod: "741908035", desc: "RODAMIENTO SL045012", um: "UN", cant: 1, alm: "R04", ub: "B0204" },
    { cod: "741901076", desc: "RODAMIENTO 6204", um: "UN", cant: 4, alm: "R01", ub: "Z0505" },
    { cod: "", desc: "JUNTA DE LA PUERTA DEL BOMBO (sin codigo)", um: "UN", cant: 1, alm: "", ub: "" },
  ],
};
const hojas = hojasPorAlmacen(mezcla.lineas);
ok(hojas.map((h) => h.alm).join(",") === "R01,R02,F02,R04,", `reparto por almacen raro: ${hojas.map((h) => h.alm || "(sin)").join(",")}`);
const salidaM = await rellenarDAD010A(JSZip, plantilla, mezcla, "uint8array");
const rutaMezcla = join(SALIDA, "DAD-010A-varios-almacenes.xlsx");
await writeFile(rutaMezcla, salidaM);
const M = await JSZip.loadAsync(salidaM);
const nombresEsperados = ["DAD-010A R01", "DAD-010A R02", "DAD-010A F02", "DAD-010A R04", "DAD-010A sin ALM"];
const libroM = xlsx.read(salidaM, { type: "buffer" });
ok(JSON.stringify(libroM.SheetNames) === JSON.stringify(nombresEsperados), `hojas: ${libroM.SheetNames.join(" | ")}`);
const wbM = await M.file("xl/workbook.xml").async("string");
const relsM = await M.file("xl/_rels/workbook.xml.rels").async("string");
const tiposM = await M.file("[Content_Types].xml").async("string");
const sinCeldasNiMarcas = (h) => sinCeldas(h).replace(/\s+tabSelected="1"/, "").replace(/xr:uid="[^"]*"/, "");
let seleccionadas = 0;
for (const [i, nombre] of nombresEsperados.entries()) {
  const rid = new RegExp(`<sheet name="${nombre}" sheetId="\\d+" r:id="(rId\\d+)"`).exec(wbM)?.[1];
  const ruta = "xl/" + (new RegExp(`Id="${rid}"[^>]*Target="([^"]+)"`).exec(relsM) || [])[1];
  const hoja = await M.file(ruta)?.async("string");
  if (!hoja) { fallos.push(`la hoja ${nombre} no tiene archivo (${ruta})`); continue; }
  ok(tiposM.includes(`PartName="/${ruta}"`), `${ruta} no esta en [Content_Types].xml`);
  if (/tabSelected="1"/.test(hoja)) seleccionadas++;
  ok(sinCeldasNiMarcas(hoja) === sinCeldasNiMarcas(hojaA), `${nombre}: la hoja no es copia fiel del formato (anchos, combinaciones, impresion)`);
  ok(new RegExp(`<definedName name="_xlnm.Print_Area" localSheetId="${i}">'${nombre}'!\\$A\\$1:\\$P\\$41</definedName>`).test(wbM), `${nombre}: sin area de impresion propia`);
  const ws = libroM.Sheets[nombre];
  const v = (ref) => (ws[ref] ? String(ws[ref].v) : "");
  const suyas = hojas[i].lineas;
  suyas.forEach((l, j) => {
    ok(v("A" + (13 + j)) === l.cod && v("O" + (13 + j)) === l.alm && v("M" + (13 + j)) === String(l.cant), `${nombre}: renglon ${j + 1} = ${v("A" + (13 + j))}/${v("O" + (13 + j))}/${v("M" + (13 + j))}`);
  });
  ok(!v("A" + (13 + suyas.length)) && !v("C" + (13 + suyas.length)), `${nombre}: tiene renglones de mas`);
  ok(v("C8") === mezcla.destino && v("A34") === mezcla.solicitadoPor && hoja.includes('<c r="L4" s="47"><v>46288</v></c>'), `${nombre}: la cabecera no se repitio`);
  // su propio dibujo, con la X de CONSUMO, y su propia configuracion de impresion
  const rels = await M.file(ruta.replace("worksheets/", "worksheets/_rels/") + ".rels").async("string");
  const dib = "xl/drawings/" + /drawings\/([^"]+)"/.exec(rels)[1];
  const d = await M.file(dib).async("string");
  ok(/name="Rectangle 8"[\s\S]*?<a:t>X<\/a:t>/.test(d) && (d.match(/<a:t>X<\/a:t>/g) || []).length === 1, `${nombre}: la casilla de CONSUMO no quedo marcada en su dibujo`);
  ok(d.replace(/<a:r><a:rPr[^>]*>[\s\S]*?<a:t>X<\/a:t><\/a:r>/, "") === dA, `${nombre}: el dibujo no es copia fiel (logos, casillas)`);
  const ps = /printerSettings\/([^"]+)"/.exec(rels)?.[1];
  ok(ps && M.file("xl/printerSettings/" + ps), `${nombre}: sin configuracion de impresion`);
  ok(M.file(dib.replace("drawings/", "drawings/_rels/") + ".rels"), `${nombre}: el dibujo perdio sus imagenes`);
}
ok(seleccionadas === 1, `hay ${seleccionadas} pestañas seleccionadas: Excel las abriria agrupadas`);
const uids = [...wbM.matchAll(/r:id="(rId\d+)"/g)].length;
ok(uids === nombresEsperados.length, "sobran o faltan hojas en workbook.xml");
for (const n of ["xl/styles.xml", "xl/theme/theme1.xml", "xl/sharedStrings.xml", "xl/media/image1.png", "xl/media/image2.gif"]) {
  ok(Buffer.from(await A.file(n).async("uint8array")).equals(Buffer.from(await M.file(n).async("uint8array"))), `con varios almacenes cambio ${n}`);
}
// cada almacen tiene sus 20 renglones; 21 en uno solo no caben
let porAlmacen = "";
try { await rellenarDAD010A(JSZip, plantilla, { lineas: [...Array.from({ length: 15 }, (_, i) => ({ cod: "A" + i, alm: "R01" })), ...Array.from({ length: 15 }, (_, i) => ({ cod: "B" + i, alm: "R02" }))] }, "uint8array"); } catch (e) { porAlmacen = e.message; }
ok(!porAlmacen, `15 + 15 en dos almacenes deberian caber: ${porAlmacen}`);
let unoLleno = "";
try { await rellenarDAD010A(JSZip, plantilla, { lineas: [{ cod: "X", alm: "R02" }, ...Array.from({ length: RENGLONES + 1 }, (_, i) => ({ cod: "A" + i, alm: "R01" }))] }, "uint8array"); } catch (e) { unoLleno = e.message; }
ok(/20 renglones/.test(unoLleno) && /R01/.test(unoLleno), `aceptó 21 renglones de un mismo almacén: ${unoLleno || "(sin error)"}`);

// --- 6. imprimirlo, si hay LibreOffice ---
const imprimir = (ruta, nombre, esperadas) => {
  execFileSync("soffice", ["--headless", "--norestore", "--convert-to", "pdf", "--outdir", SALIDA, ruta], { stdio: "ignore", timeout: 120000, env: { ...process.env, HOME: SALIDA } });
  execFileSync("pdftoppm", ["-r", "100", "-png", "-singlefile", join(SALIDA, nombre + ".pdf"), join(SALIDA, nombre)], { stdio: "ignore" });
  const paginas = execFileSync("pdfinfo", [join(SALIDA, nombre + ".pdf")]).toString().match(/Pages:\s+(\d+)/)?.[1];
  ok(paginas === String(esperadas), `${nombre} impreso ocupa ${paginas} paginas, deberia ser ${esperadas}`);
  console.log(`impreso en ${join(SALIDA, nombre + ".png")} (${paginas} ${paginas === "1" ? "pagina" : "paginas"})`);
};
try {
  imprimir(rutaSalida, "DAD-010A-prueba", 1);
  imprimir(rutaMezcla, "DAD-010A-varios-almacenes", nombresEsperados.length);
} catch (e) { console.log("(sin LibreOffice: no se comprobo la impresion)"); }

console.log(`celdas escritas: ${cambiadas.length}`);
console.log(fallos.length ? "\nFALLOS:\n- " + fallos.join("\n- ") : "\nTodo correcto: formato intacto, solo datos.");
process.exit(fallos.length ? 1 : 0);
