// El maestro de artículos de almacén (assets/data/maestro-almacen.json, del
// reporte RE356R) para el bot: todos los códigos de la empresa, tengan
// existencia o no. Así /stock y /pedir encuentran el código de una pieza
// aunque el inventario no la liste (el RE356 no trae lo que está en cero).
// No trae existencias ni precios: eso sigue saliendo del inventario.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, plano } from "./datos-app.mjs";

let cache = null;
export function cargarMaestro(ruta = join(RAIZ, "assets", "data", "maestro-almacen.json")) {
  if (cache) return cache;
  try {
    const d = JSON.parse(readFileSync(ruta, "utf8"));
    const fams = d.familias || [];
    cache = (d.items || []).map(([cod, desc, um, fam, dias]) => ({ cod, desc, um, dias: dias || 0, otraArea: (fams[fam] || [])[1] === "otro", maestro: true }));
  } catch (e) {
    console.warn("[maestro] no se pudo leer:", e.message);
    cache = [];
  }
  return cache;
}

// Busca en el inventario y, si hace falta, en el maestro. Por código exacto
// primero; si no, por palabras. Primero lo que hay en el estante, luego lo que
// está en el inventario en cero y al final lo que solo sale en el maestro
// (lo de otras áreas, como laboratorio u oficina, lo último).
export function buscarEn(inventario, maestro, texto, limite = 8) {
  const q = plano(texto);
  const cod = q.replace(/\s+/g, "");
  const exacto = inventario.find((a) => plano(a.cod) === cod) || maestro.find((a) => plano(a.cod) === cod);
  if (exacto) return [exacto];
  const toks = q.split(" ").filter((t) => t.length > 1);
  if (!toks.length) return [];
  const pasa = (a) => { const h = plano(`${a.cod} ${a.desc} ${a.ub || ""}`); return toks.every((t) => h.includes(t)); };
  const enInv = inventario.filter(pasa);
  const ya = new Set(enInv.map((a) => a.cod));
  const delMaestro = maestro.filter((a) => !ya.has(a.cod) && pasa(a));
  const lugar = (a) => (a.maestro ? (a.otraArea ? 3 : 2) : Number(a.exist) > 0 ? 0 : 1);
  return [...enInv, ...delMaestro]
    .sort((a, b) => lugar(a) - lugar(b) || String(a.desc).localeCompare(String(b.desc)))
    .slice(0, limite);
}
