#!/usr/bin/env node
// Recorre la carpeta de respaldos (una carpeta por equipo: manuales, planos,
// catálogos de repuestos) y PROPONE a qué equipo del registro pertenece cada una.
// Solo lee nombres de archivos: no abre, copia, mueve ni borra nada. NO sube manuales al
// repositorio (es público): de cada archivo solo guarda la ruta RELATIVA a la carpeta de
// respaldos y su tipo (manual, plano, repuestos, foto, otro). Nunca la ruta absoluta del PC.
//
//   node scripts/indexar-respaldos.mjs "C:\Users\...\Documents\Respaldos"
//   node scripts/indexar-respaldos.mjs <carpeta> --salida propuesta.json --csv propuesta.csv
//
// Salida (por defecto ./respaldos-propuesta.json, FUERA de assets/ a propósito):
//   carpetas[]: { carpeta, archivos, porTipo, candidatos[{id,codigo,nombre,ubicacion,puntaje}], estado }
//   estado "sugerido" (un candidato claro) | "ambiguo" | "sin-candidato"; todo queda
//   "por confirmar": un humano decide el vínculo. Los PDF van a manuales/ solo cuando se acuerde.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import vm from "node:vm";
import { join, extname, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

function cargarRegistro(ruta) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(ruta, "utf8"), ctx);
  return ctx.window.EQUIPOS_PLAN;
}

const TIPOS = [
  ["repuestos", /repuest|recambio|spare|catalog|despiece|parts/i],
  ["plano", /plano|esquema|diagrama|p&id|p & i|wiring|electric|neumatic/i],
  ["manual", /manual|instruc|operaci|usuario|manejo|mantenim/i],
  ["foto", /\.(jpe?g|png|heic|webp)$/i],
];

// Minúsculas, sin tildes y con letras y números separados ("Integra320" = "integra 320")
export const plano = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/([a-z])(\d)/g, "$1 $2").replace(/(\d)([a-z])/g, "$1 $2").replace(/[^a-z0-9]+/g, " ").trim();
const FUERA = new Set(["de", "del", "la", "el", "y", "en", "con", "para", "no", "n", "equipo", "maquina"]);
export const palabras = (t) => plano(t).split(" ").filter((w) => w && !FUERA.has(w));

export function tipoDeArchivo(nombre) {
  for (const [tipo, re] of TIPOS) if (re.test(nombre)) return tipo;
  return "otro";
}

export function candidatos(carpeta, equipos, max = 3) {
  const a = new Set(palabras(carpeta));
  if (!a.size) return [];
  return equipos
    .map((e) => {
      const b = new Set(palabras(e.n + " " + (e.nOriginal || "")));
      const comun = [...a].filter((w) => b.has(w)).length;
      // el código completo como palabra suelta en el nombre de la carpeta pesa mucho (solo códigos de 6+ dígitos)
      const cod = String(e.c).length >= 6 && plano(carpeta).split(" ").includes(String(e.c)) ? 1 : 0;
      return { id: e.id, codigo: e.c, nombre: e.n, ubicacion: e.u, puntaje: Math.round(((comun / a.size) * 0.7 + cod) * 100) / 100 };
    })
    .filter((x) => x.puntaje >= 0.5)
    .sort((x, y) => y.puntaje - x.puntaje)
    .slice(0, max);
}

export function estadoDe(c) {
  if (!c.length) return "sin-candidato";
  if (c.length === 1 || c[0].puntaje - c[1].puntaje >= 0.25) return "sugerido";
  return "ambiguo";
}

function archivosDe(dir, base, acc = []) {
  for (const f of readdirSync(dir).sort()) {
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) archivosDe(p, base, acc);
    else acc.push({ nombre: f, ruta: relative(base, p).split(sep).join("/"), ext: extname(f).toLowerCase(), bytes: st.size });
  }
  return acc;
}

export function indexar(raiz, equipos) {
  const carpetas = readdirSync(raiz).filter((d) => statSync(join(raiz, d)).isDirectory()).sort();
  return carpetas.map((c) => {
    const archivos = archivosDe(join(raiz, c), raiz);
    const porTipo = {};
    for (const f of archivos) porTipo[tipoDeArchivo(f.nombre)] = (porTipo[tipoDeArchivo(f.nombre)] || 0) + 1;
    const cand = candidatos(c, equipos);
    const lista = archivos.map((f) => ({ ruta: f.ruta, tipo: tipoDeArchivo(f.nombre) })); // solo ruta relativa + tipo
    return { carpeta: c, lista, archivos: archivos.length, bytes: archivos.reduce((s, f) => s + f.bytes, 0), porTipo, candidatos: cand, estado: estadoDe(cand) };
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const val = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
  const raiz = args.find((a) => !a.startsWith("--") && a !== val("--salida") && a !== val("--csv"));
  if (!raiz) { console.error("Uso: node scripts/indexar-respaldos.mjs <carpeta de respaldos> [--salida x.json] [--csv x.csv]"); process.exit(1); }
  const dir = join(dirname(fileURLToPath(import.meta.url)), "..");
  const equipos = cargarRegistro(join(dir, "assets", "equipos.js")).equipos;
  const res = indexar(raiz, equipos);
  const salida = val("--salida") || "respaldos-propuesta.json";
  // «raiz» no se guarda: es una ruta del PC. Las rutas de cada archivo son relativas a esa carpeta.
  writeFileSync(salida, JSON.stringify({ generado: new Date().toISOString().slice(0, 10), rutasRelativasA: "Respaldos", carpetas: res }, null, 2));
  if (val("--csv")) {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const filas = res.map((r) => [r.carpeta, r.archivos, r.estado, r.candidatos[0]?.codigo, r.candidatos[0]?.ubicacion, r.candidatos[0]?.nombre, r.candidatos[0]?.puntaje].map(q).join(","));
    writeFileSync(val("--csv"), "\ufeff" + ["carpeta,archivos,estado,codigo_sugerido,ubicacion,nombre_sugerido,puntaje", ...filas].join("\n") + "\n");
  }
  const cuenta = (e) => res.filter((r) => r.estado === e).length;
  console.log(`${res.length} carpetas · sugeridas ${cuenta("sugerido")} · ambiguas ${cuenta("ambiguo")} · sin candidato ${cuenta("sin-candidato")}`);
  console.log(`Escrito: ${salida} (solo rutas relativas y tipo; no se copió ni se tocó ningún archivo)`);
}
