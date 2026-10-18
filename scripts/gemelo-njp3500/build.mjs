// Escena del visor 3D de la NJP-3500: cada pieza con sus formas exactas (las mismas que
// mide contactos.mjs), su material y la tornillería, más los datos de cada conjunto.
//
//   node build.mjs            -> assets/gemelo/njp3500/escena.json
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { construir, COTAS, ESTACIONES } from "./modelo.mjs";
import { PIEZAS, DESARME, LECTURA } from "./piezas.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const OUT = join(REPO, "assets", "gemelo", "njp3500");
mkdirSync(OUT, { recursive: true });

const { items, pernos } = construir();
const n = (v) => +v.toFixed(2);
const v3 = (p) => p.map(n);
const forma = (sh) => {
  if (sh.kind === "prism") return { k: "P", o: v3(sh.F.o), a: v3(sh.F.a), u: v3(sh.F.u), v: v3(sh.F.v), p: sh.poly.map(v3), s: [n(sh.s0), n(sh.s1)] };
  if (sh.kind === "body") return { k: "L", o: v3(sh.F.o), a: v3(sh.F.a), u: v3(sh.F.u), v: v3(sh.F.v), p: sh.poly.map(v3) };
  if (sh.kind === "ball") return { k: "B", o: v3(sh.o), r: n(sh.r) };
  if (sh.kind === "tube") return { k: "T", p: sh.points.map(v3), r: sh.radii.map(n) };
  return null;
};

// Página del manual: la del fabricante (PDF) y, si existe, la guiada en español.
const pagina = (p) => {
  const pp = String(p).padStart(3, "0");
  const es = `assets/njp3500_manual_es/pages/njp3500-manual-es-p${pp}.jpg`;
  return { p, img: `assets/gemelo/njp3500/manual/p${pp}.jpg`, es: existsSync(join(REPO, es)) ? es : null };
};

// La auditoría de montaje va con la escena: el visor la muestra tal cual.
const salida = execFileSync(process.execPath, [join(HERE, "contactos.mjs"), "--json"], { encoding: "utf8" });
const lineas = salida.trim().split(/\r?\n/);
const auditoria = JSON.parse(lineas.pop());
console.log(lineas.slice(0, 2).join("\n"));

const datos = {
  unidad_mm: 1,
  auditoria,
  maquina: { id: "njp3500", nombre: "Encapsuladora automática NJP-3500", fabricante: "Zhejiang Canaan Kaixinlong Technology", pdf: "manuales/njp3500/NJP3500-manual-fabricante.pdf" },
  cotas: COTAS,
  estaciones: ESTACIONES,
  piezas: Object.fromEntries(Object.entries(PIEZAS).map(([id, p]) => [id, { nombre: p.nombre, corto: p.corto, desc: p.desc, mover: p.mover, paginas: p.paginas.map(pagina) }])),
  desarme: DESARME,
  lectura: LECTURA,
  items: items.map((it) => {
    const out = { n: it.name, p: it.piece, g: it.geo3d ?? it.shapes.map(forma).filter(Boolean), m: it.centro };
    if (it.mat) out.ma = it.mat;
    if (it.clase) out.c = it.clase;
    if (it.sensor) out.s = it.sensor;
    if (it.sub) out.su = it.sub;
    if (it.mover) out.mv = it.mover;
    return out;
  }),
  pernos,
};
const txt = JSON.stringify(datos);
writeFileSync(join(OUT, "escena.json"), txt);
console.log(`escena: ${items.length} piezas, ${pernos.reduce((a, p) => a + p.pts.length, 0)} tornillos, ${(txt.length / 1024).toFixed(0)} KB`);
