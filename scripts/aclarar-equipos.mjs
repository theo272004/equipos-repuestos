#!/usr/bin/env node
// Vuelve a leer, con las reglas actuales de assets/js/mtto-lector.js, los registros del chat que
// quedaron con equipo «No identificado» (p. ej. una «NOTA:» que seguía al párrafo de la Bosch).
// Cada uno se busca en su reporte de turno (por rid) y toma el equipo de la novedad igual a ella.
//   node scripts/aclarar-equipos.mjs            (aplica)
//   node scripts/aclarar-equipos.mjs --probar   (solo cuenta y muestra)
import vm from "node:vm";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const probar = process.argv.includes("--probar");
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ["mtto-data", "mtto-lector", "reportes-data", "turnos-data"]) vm.runInContext(readFileSync(join(raiz, "assets/js", f + ".js"), "utf8"), ctx, { filename: f });
const W = ctx.window, L = W.MTTO_LECTOR;
const reps = new Map(W.REPORTES_TURNO.map((r) => [r.id, r]));
const clave = (t) => L.norm(String(t || "")).replace(/\W+/g, "").slice(0, 120);

// «Cl encapsuladora…» no dice si es la CL3 o la CL4 y la lectura la toma por la bomba de vacío: se deja como está
const SALTAR = new Set(["H20260817-0390"]);
const porRid = new Map();
const pendientes = W.MTTO.hist.registros.filter((r) => r.src === "chat" && r.eq === "No identificado" && reps.has(r.rid) && !SALTAR.has(r.id));
let cambios = 0;
for (const r of pendientes) {
  if (!porRid.has(r.rid)) porRid.set(r.rid, L.leer(reps.get(r.rid).texto).novedades);
  const n = porRid.get(r.rid).find((x) => clave(x.de) === clave(r.de));
  if (!n || n.eq === "No identificado") continue;
  console.log(`${r.id}: «No identificado» → ${n.eq}  | ${String(r.de).replace(/\s+/g, " ").slice(0, 80)}`);
  Object.assign(r, { eq: n.eq, ar: n.ar, cat: n.cat, tp: n.tp, fa: n.fa || r.fa, ac: n.ac || r.ac });
  cambios++;
}
console.log(`${pendientes.length} registros sin equipo; aclarados: ${cambios}`);
if (probar || !cambios) process.exit(0);
const ruta = join(raiz, "assets/js/mtto-data.js");
const cab = readFileSync(ruta, "utf8").split(/\r?\n/).filter((l) => l.startsWith("//"));
writeFileSync(ruta, `${cab.join("\n")}\nwindow.MTTO = ${JSON.stringify(W.MTTO)};\n`, "utf8");
console.log("Escrito assets/js/mtto-data.js");
