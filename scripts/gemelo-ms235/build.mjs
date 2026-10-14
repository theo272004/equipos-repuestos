// Construye el gemelo de la MS235: una vista SVG por cada angulo de giro,
// con el orden de pintado medido por el kit de Anatomy para la maquina
// armada, desarmada y en cada paso del desarme.
//
//   node build.mjs              todas las vistas
//   node build.mjs --vista=0    solo una (para iterar rapido)
//   node build.mjs --rapido     menos estados de desarme al ordenar
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as A from "./kit/audit.mjs";
import { construir, COTAS, CARRILES } from "./modelo.mjs";
import { PIEZAS, DESARME, LECTURA } from "./piezas.mjs";
import { esMs235, piezaDeIntervencion } from "./clasificar.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "salida");
mkdirSync(join(OUT, "vistas"), { recursive: true });
const ARGS = process.argv.slice(2);
const SOLO = ARGS.find((a) => a.startsWith("--vista="))?.split("=")[1];
const RAPIDO = ARGS.includes("--rapido");

const W = 1400;
const H = 1000;
const ELEVACION = 30;
// Ocho pasos de 45°, empezando por el frente-derecha (donde estan el HMI y la salida).
export const VISTAS = [58, 103, 148, 193, 238, 283, 328, 13];
const SPRING = { stagger: 0.045, stiffness: 64, damping: 14.2, substeps: 4 };

const t0 = Date.now();
const reloj = () => `${((Date.now() - t0) / 1000).toFixed(1)} s`;

// Pasada 0: limites de cada conjunto en el mundo, armado y desarmado.
function limites() {
  const P = k.fitProjection([[0, 0, 0], [1, 1, 1]], W, H, { azimuth: VISTAS[0], elevation: ELEVACION });
  const R = A.recorder(P, { order: DESARME, spring: SPRING });
  const { pernos } = construir(P, R);
  escena(R, pernos);
  const caja = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  const armado = structuredClone(caja);
  const crecer = (c, p) => p.forEach((v, i) => ((c.min[i] = Math.min(c.min[i], v)), (c.max[i] = Math.max(c.max[i], v))));
  const todo = structuredClone(caja);
  for (const item of R.items) {
    for (const shape of item.shapes) {
      const b = A.boundsOf(shape);
      const mov = item.ride === "film" ? [0, 0, 0] : PIEZAS[item.ride].mover;
      crecer(armado, b.min);
      crecer(armado, b.max);
      crecer(todo, b.min);
      crecer(todo, b.max);
      crecer(todo, b.min.map((v, i) => v + mov[i]));
      crecer(todo, b.max.map((v, i) => v + mov[i]));
    }
  }
  return { armado, todo, items: R.items.length };
}

// Escena para el visor 3D: cada pieza con sus formas exactas (las mismas que mide el
// auditor de Anatomy), sus datos y la tornilleria.
function escena(R, pernos) {
  const n = (v) => +v.toFixed(2);
  const v3 = (p) => p.map(n);
  const forma = (sh) => {
    if (sh.kind === "prism") return { k: "P", o: v3(sh.F.o), a: v3(sh.F.a), u: v3(sh.F.u), v: v3(sh.F.v), p: sh.poly.map(v3), s: [n(sh.s0), n(sh.s1)] };
    if (sh.kind === "body") return { k: "L", o: v3(sh.F.o), a: v3(sh.F.a), u: v3(sh.F.u), v: v3(sh.F.v), p: sh.poly.map(v3) };
    if (sh.kind === "ball") return { k: "B", o: v3(sh.o), r: n(sh.r) };
    if (sh.kind === "tube") return { k: "T", p: sh.points.map(v3), r: sh.radii.map(n) };
    if (sh.kind === "box") return { k: "X", o: v3(sh.o), ax: sh.axes.map(v3), h: v3(sh.half) };
    return null;
  };
  const items = R.items.map((it) => {
    const geo = it.geo3d ? it.geo3d.map((g) => ({ ...g, o: g.o && v3(g.o), a: g.a && v3(g.a) })) : it.shapes.map(forma).filter(Boolean);
    const out = { n: it.name, p: it.piece, g: geo, m: v3(it.centro ?? [0, 0, 0]) };
    if (it.ride !== it.piece) out.r = it.ride;
    if (it.tono) out.t = it.tono;
    if (it.clase) out.c = it.clase;
    if (it.sensor) out.s = it.sensor;
    if (it.disp) out.d = it.disp;
    if (it.mat) out.ma = it.mat;
    if (it.puerta) out.pu = 1;
    if (it.solo3d) out.o3 = 1;
    return out;
  });
  const datos = {
    unidad_mm: 4,
    piezas: Object.fromEntries(Object.entries(PIEZAS).map(([id, p]) => [id, { mover: id === "film" ? [0, 0, 0] : p.mover }])),
    desarme: DESARME,
    cotas: COTAS,
    carriles: CARRILES,
    items,
    pernos,
  };
  writeFileSync(join(OUT, "escena.json"), JSON.stringify(datos));
  console.log("escena:", items.length, "piezas,", pernos.reduce((a, p) => a + p.pts.length, 0), "tornillos,", (JSON.stringify(datos).length / 1024).toFixed(0), "KB");
}

const esquinas = ({ min, max }) => {
  const out = [];
  for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) out.push([x, y, z]);
  return out;
};

const LIM = limites();
console.log("items", LIM.items, "armado", LIM.armado.min.map(Math.round), LIM.armado.max.map(Math.round), "desarmado", LIM.todo.min.map(Math.round), LIM.todo.max.map(Math.round));

// Una sola escala para todas las vistas, para que la maquina no cambie de tamano al girar.
const ESCALA = Math.min(...VISTAS.map((az) => k.fitProjection(esquinas(LIM.todo), W, H, { pad: 30, azimuth: az, elevation: ELEVACION }).scale));
function proyeccion(az) {
  const unit = { origin: [0, 0], scale: ESCALA, azimuth: az, elevation: ELEVACION };
  const pts = esquinas(LIM.todo).map((p) => k.iso(p, unit));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { origin: [W / 2 - (Math.min(...xs) + Math.max(...xs)) / 2, H / 2 - (Math.min(...ys) + Math.max(...ys)) / 2], scale: ESCALA, azimuth: az, elevation: ELEVACION };
}

const rectDe = (caja, P) => {
  const pts = esquinas(caja).map((p) => k.iso(p, P));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)].map((v) => Math.round(v));
};

const vistas = [];
const SENSORES = [];
for (const [indice, az] of VISTAS.entries()) {
  if (SOLO !== undefined && Number(SOLO) !== indice) continue;
  const P = proyeccion(az);
  const R = A.recorder(P, { order: DESARME, spring: SPRING });
  construir(P, R);
  // El interior del armario solo existe en el visor 3D: en la lamina el armario va cerrado.
  for (let i = R.items.length - 1; i >= 0; i--) if (R.items[i].solo3d) R.items.splice(i, 1);
  for (const it of R.items) if (it.sensor) SENSORES.push(it.sensor);
  // Estados en que se mide quien tapa a quien: armada, desarmada, cada paso del
  // desarme (prefijos) y cuadros de los resortes reales al abrir y cerrar.
  const estados = RAPIDO
    ? [...A.uniformStates(4), ...A.prefixStates(DESARME, { shares: [0.5, 1] })]
    : [...A.uniformStates(4), ...A.springStates(DESARME, { ...SPRING, stride: 12 }), ...A.prefixStates(DESARME, { shares: [0.35, 0.7, 1] })];
  // Rejilla de 0,6 unidades del viewBox: la maquina es grande en pantalla y 0,25 tarda minutos por vista.
  const asentado = A.settle(R, P, { states: estados, step: 0.6, least: 0.6 });
  R.items.sort((a, b) => a.key - b.key);
  const V = A.cameraBasis(P).V;
  // Movimiento del ciclo de la maquina (boton "En marcha"): que se mueve y cuanto, en el mundo.
  const cicloDe = (item) => {
    const n = item.name.replace(/#\d+$/, "");
    const lado = Math.sign(item.centro?.[0] ?? 0) || 1;
    if (/^soldadura\.(placa-soldante|bloque-calefactor|tapa-ptfe|resistencia|caja-bornes|harting|aislante|porta-mordaza|casquillo|ret|horquilla|lamina|poste-muelle|muelle-lamina|codificador|pomo-lote)/.test(n)) return `mordaza,${lado * 3},0,0`;
    if (/^corte\.(cuchilla-movil|carro|guia)/.test(n)) return "cuchilla,8,0,0";
    if (/^pinzas\.(patin|viga|placa-extremo|barra-derecha|brazo|dedo|goma|vastago|biela|rotula)/.test(n) || n === "film.sobre") return "pinzas,0,0,-20";
    if (n === "salida.sobre") return `cinta,${(item.centro[0] - 11).toFixed(0)}`;
    return null;
  };
  const grupos = R.items.map((item, i) => {
    const m = item.move.map((v) => v.toFixed(1)).join(",");
    const ciclo = cicloDe(item);
    const extra = `${item.ride !== item.piece ? ` data-ride="${item.ride}"` : ""}${item.sensor ? ` data-sensor="${item.sensor}"` : ""}${item.clase ? ` data-clase="${item.clase}"` : ""}${ciclo ? ` data-ciclo="${ciclo}"` : ""}`;
    return `<g class="it" data-piece="${item.piece}"${extra} data-k="${item.key.toFixed(2)}" data-m="${m}" data-i="${i}">${item.svg}</g>`;
  });
  const unidad = (v) => {
    const o = k.iso([0, 0, 0], P);
    const p = k.iso(v, P);
    return [+(p[0] - o[0]).toFixed(4), +(p[1] - o[1]).toFixed(4)];
  };
  const svg = `<g class="g-maquina">${grupos.join("")}</g>`;
  writeFileSync(join(OUT, "vistas", `vista-${indice}.svg`), svg);
  vistas.push({
    indice,
    az,
    V: V.map((v) => +v.toFixed(5)),
    EX: unidad([1, 0, 0]),
    EY: unidad([0, 1, 0]),
    EZ: unidad([0, 0, 1]),
    armado: rectDe(LIM.armado, P),
    todo: rectDe(LIM.todo, P),
    kb: (svg.length / 1024).toFixed(0),
    items: R.items.length,
    ciclos: asentado.solved.cycles?.length ?? 0,
    descartadas: asentado.solved.dropped?.length ?? 0,
  });
  console.log(`vista ${indice} (${az}°): ${R.items.length} items, ${(svg.length / 1024).toFixed(0)} KB, ${estados.length} estados, ciclos ${asentado.solved.cycles?.length ?? 0}, reglas descartadas ${asentado.solved.dropped?.length ?? 0} · ${reloj()}`);
}

const sensores = [...new Set(SENSORES)];
const previo = (() => {
  try {
    return JSON.parse(readFileSync(join(OUT, "vistas", "vistas.json"), "utf8")).vistas;
  } catch {
    return [];
  }
})();
// Con --vista=N se conservan las demas vistas ya construidas.
const todas = [...previo.filter((v) => !vistas.some((n) => n.indice === v.indice)), ...vistas].sort((a, b) => a.indice - b.indice);
writeFileSync(join(OUT, "vistas", "vistas.json"), JSON.stringify({ W, H, ELEVACION, VISTAS, SPRING, DESARME, LECTURA, sensores, vistas: todas }, null, 1));
console.log("listo", reloj());
