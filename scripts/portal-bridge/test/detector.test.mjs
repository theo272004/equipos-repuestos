// Fabrica un Excel parecido al que escupiria un portal Infor y comprueba que el
// lector lo entiende. No toca el portal ni Firestore.
import xlsx from "xlsx";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cargarPlan } from "../lib/plan.mjs";
import { leerInventario } from "../lib/excel.mjs";

const { codigos } = await cargarPlan();
// 1234.5 -> "1.234,50": punto para miles, coma para decimales.
const co = (n) => n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d)(?=,))/g, ".");

const delPlan = [...codigos].filter((c) => /^\d{9}$/.test(c)).slice(0, 40);

// Hoja 1: basura de parametros, como suelen traer estos reportes.
const params = [["Reporte generado por", "INABLER"], ["Usuario", "JPEREZ"], ["Fecha", "15/09/2026"]];

// Hoja 2: el reporte de verdad, con 4 filas de encabezado antes de la tabla.
const filas = [
  ["FARMACAPSULAS S.A.S."],
  ["INFORME DE EXISTENCIAS POR ALMACEN"],
  ["Fecha de corte: 15/09/2026"],
  [],
  // Titulos deliberadamente raros: ninguno se llama "CODIGO INTERNO"
  ["Item", "Descripcion del Articulo", "Alm.", "Localizacion", "Saldo Actual", "Vr. Unitario"],
];

// Piezas del plan, con numeros en formato colombiano y algun codigo como numero.
delPlan.forEach((cod, i) => {
  filas.push([
    i % 3 === 0 ? Number(cod) : cod,            // a veces Excel lo guarda como numero
    `REPUESTO DE PRUEBA ${i}`,
    "ALM01",
    `R0${(i % 4) + 1}/M0${100 + i}`,
    i % 7 === 0 ? "0" : `${(i % 5) + 1}`,
    co((i + 1) * 1000 + 0.5),                    // "1.000,50" estilo colombiano
  ]);
});

// El mismo codigo en un segundo almacen: las existencias deben sumarse.
filas.push([delPlan[0], "REPUESTO DE PRUEBA 0", "ALM02", "R09/Z0101", "4", co(1000.5)]);
// Fila sin codigo (subtotal), debe ignorarse.
filas.push(["", "TOTAL GENERAL", "", "", "999", ""]);
// Articulos que el plan no conoce: se guardan igual, son almacen.
filas.push(["999888777", "ARTICULO AJENO AL PLAN", "ALM01", "R01/A0101", "12", "5.000,00"]);

const libro = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(libro, xlsx.utils.aoa_to_sheet(params), "Parametros");
xlsx.utils.book_append_sheet(libro, xlsx.utils.aoa_to_sheet(filas), "Existencias");
const SALIDA = join(dirname(fileURLToPath(import.meta.url)), "..", "salida");
mkdirSync(SALIDA, { recursive: true });
const ruta = join(SALIDA, "reporte-falso.xlsx");
xlsx.writeFile(libro, ruta);

const { filas: out, diagnostico } = await leerInventario(ruta, codigos);
console.log(JSON.stringify(diagnostico, null, 2));

// --- comprobaciones ---
const fallos = [];
const ok = (c, m) => { if (!c) fallos.push(m); };
ok(diagnostico.hoja === "Existencias", `eligio la hoja ${diagnostico.hoja}`);
ok(diagnostico.filaCabecera === 5, `cabecera en fila ${diagnostico.filaCabecera}, esperaba 5 (la que se ve en Excel)`);
ok(diagnostico.codigoDetectadoPor === "contenido", `detecto el codigo por ${diagnostico.codigoDetectadoPor}`);
ok(diagnostico.columnas.exist === "Saldo Actual", `existencia -> ${diagnostico.columnas.exist}`);
ok(diagnostico.columnas.ub === "Localizacion", `ubicacion -> ${diagnostico.columnas.ub}`);
ok(diagnostico.columnas.pu === "Vr. Unitario", `precio -> ${diagnostico.columnas.pu}`);
ok(diagnostico.columnas.desc === "Descripcion del Articulo", `descripcion -> ${diagnostico.columnas.desc}`);
ok(diagnostico.coincidenPlan === delPlan.length, `coinciden ${diagnostico.coincidenPlan}, esperaba ${delPlan.length}`);
ok(out.length === delPlan.length + 1, `${out.length} articulos, esperaba ${delPlan.length + 1}`);

const primero = out.find((f) => f.cod === delPlan[0]);
ok(primero.exist === 0 + 4, `sumo existencias de 2 almacenes (0 en ALM01 + 4 en ALM02): dio ${primero?.exist}, esperaba 4`);
ok(String(primero.ub).includes("·"), `junto ubicaciones: ${primero?.ub}`);
ok(primero.pu === 1000.5, `precio colombiano: dio ${primero?.pu}, esperaba 1000.5`);
const numerico = out.find((f) => f.cod === delPlan[3]);
ok(numerico && numerico.cod === delPlan[3], `codigo guardado como numero se normalizo`);
ok(!out.some((f) => f.desc === "TOTAL GENERAL"), "la fila de subtotal se colo");

// --- el reporte equivocado ---
// Pasa de verdad: alguien exporta otra pantalla del portal y el puente se traga
// un Excel que no es. Tiene que negarse y decir por que, no subir basura.
const otro = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(otro, xlsx.utils.aoa_to_sheet([
  ["Orden", "Solicitante", "Estado"],
  ["OC-001", "J. PEREZ", "APROBADA"],
  ["OC-002", "M. GOMEZ", "PENDIENTE"],
]), "Requisiciones");
const rutaOtro = join(SALIDA, "reporte-equivocado.xlsx");
xlsx.writeFile(otro, rutaOtro);

let rechazado = "";
try { await leerInventario(rutaOtro, codigos); } catch (e) { rechazado = e.message; }
ok(rechazado, "acepto un reporte que no es de inventario");
ok(/codigos internos del plan/.test(rechazado), `rechazo el reporte pero sin explicar por que: ${rechazado.slice(0, 80)}`);

console.log(fallos.length ? "\nFALLOS:\n- " + fallos.join("\n- ") : "\nTodo correcto (reporte bueno y reporte equivocado).");
process.exit(fallos.length ? 1 : 0);
