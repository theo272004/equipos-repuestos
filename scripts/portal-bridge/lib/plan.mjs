// Lee los codigos internos que ya conoce el plan (assets/equipos.js).
// Sirven para dos cosas:
//   1. Adivinar cual columna del Excel es la del codigo interno: la buena es la
//      que mas se parece a esta lista, no la que tenga cierto titulo.
//   2. Saber, al final, cuantas piezas del plan quedaron con existencia fresca.

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RUTA_PLAN = join(AQUI, "..", "..", "..", "assets", "equipos.js");

// equipos.js es un .js que asigna un objeto literal JSON a window.EQUIPOS_PLAN.
// No se importa como modulo (no exporta nada y depende de window): se recorta
// desde la primera llave hasta la ultima y se parsea como JSON.
export async function cargarPlan(ruta = RUTA_PLAN) {
  const texto = await readFile(ruta, "utf8");
  const ini = texto.indexOf("{");
  const fin = texto.lastIndexOf("}");
  if (ini < 0 || fin < ini) throw new Error(`No pude leer el plan en ${ruta}: no encontre el objeto JSON.`);
  const plan = JSON.parse(texto.slice(ini, fin + 1));
  const equipos = plan.equipos || [];
  const lineas = [];
  for (const eq of equipos) {
    for (const r of eq.r || []) {
      lineas.push({ equipo: eq.c, nombre: eq.n, cod: normCod(r.cod), desc: r.d || "", exist: r.e ?? 0, ub: r.ub || "" });
    }
  }
  const codigos = new Set(lineas.map((l) => l.cod).filter(Boolean));
  return { plan, equipos, lineas, codigos };
}

// El codigo interno viaja de formas distintas segun de donde venga: el Excel del
// portal puede darlo como numero (741903002 -> "741903002"), con .0 pegado si
// alguien lo abrio y lo guardo, o con espacios. Se compara siempre normalizado.
export function normCod(v) {
  if (v === null || v === undefined) return "";
  let s = String(v).trim().toUpperCase();
  if (!s || s === "N/A" || s === "NA" || s === "-") return "";
  s = s.replace(/\.0+$/, "");            // 741903002.0 -> 741903002
  if (/^\d+E\+?\d+$/i.test(s)) {          // notacion cientifica de Excel
    const n = Number(s);
    if (Number.isFinite(n)) s = String(BigInt(Math.round(n)));
  }
  return s.replace(/\s+/g, "");
}
