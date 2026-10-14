// Auditoria de montaje: piezas que no tocan a ninguna otra (flotantes) y tornillos que no
// asientan en la cara de la pieza que los lleva.
//   node contactos.mjs            resumen
//   node contactos.mjs --todo     lista completa
import * as k from "./kit/iso-kit.mjs";
import * as A from "./kit/audit.mjs";
import { construir } from "./modelo.mjs";
import { DESARME } from "./piezas.mjs";

const TOL = 0.35;
const P = k.fitProjection([[-220, -492, 0], [518, 275, 656]], 1400, 1000, { azimuth: 58, elevation: 30, pad: 30 });
const R = A.recorder(P, { order: DESARME, spring: {} });
const { pernos } = construir(P, R);
const TODO = process.argv.includes("--todo");

const caja = (it) => {
  const b = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (const sh of it.shapes) {
    const bb = A.boundsOf(sh);
    for (let i = 0; i < 3; i++) {
      b.min[i] = Math.min(b.min[i], bb.min[i]);
      b.max[i] = Math.max(b.max[i], bb.max[i]);
    }
  }
  return b;
};
const tocan = (a, b, t = TOL) => [0, 1, 2].every((i) => a.min[i] - t <= b.max[i] && b.min[i] - t <= a.max[i]);
const base = (n) => n.replace(/[#:].*$/, "").replace(/-(atras|frente)$/, "");

const items = R.items.map((it) => ({ it, b: caja(it), n: base(it.name) }));
// el papel y los sobres de muestra pueden ir sueltos; el suelo (z = 0) cuenta como apoyo
const libres = /^film\.|^salida\.sobre$/;
const flotantes = [];
for (const a of items) {
  if (libres.test(a.n) || a.b.min[2] <= 0.5) continue;
  const vecino = items.some((b) => b !== a && tocan(a.b, b.b));
  if (!vecino) flotantes.push(a);
}

// tornillos: cada cabeza debe quedar sobre la superficie de su pieza (o de alguna de su conjunto)
const porParte = new Map();
for (const a of items) {
  if (!porParte.has(a.n)) porParte.set(a.n, []);
  porParte.get(a.n).push(a.b);
}
const enCaja = (p, b, t) => [0, 1, 2].every((i) => p[i] >= b.min[i] - t && p[i] <= b.max[i] + t);
const sueltos = [];
let total = 0;
for (const g of pernos) {
  const candidatas = g.parte ? porParte.get(base(g.parte)) ?? [] : items.filter((a) => a.it.piece === g.pieza).map((a) => a.b);
  for (const p of g.pts) {
    total++;
    if (!candidatas.some((b) => enCaja(p, b, 0.4))) sueltos.push({ g, p });
  }
}

console.log(`piezas ${items.length} · flotantes ${flotantes.length} · tornillos ${total} · tornillos sin asiento ${sueltos.length}`);
const agrupa = (lista, clave) => {
  const m = new Map();
  for (const x of lista) m.set(clave(x), (m.get(clave(x)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
for (const [n, c] of agrupa(flotantes, (a) => a.n).slice(0, TODO ? 999 : 40)) {
  const a = flotantes.find((x) => x.n === n);
  console.log(`  flota ${c > 1 ? `${c}× ` : ""}${n}  [${a.b.min.map(Math.round)}] .. [${a.b.max.map(Math.round)}]`);
}
for (const [n, c] of agrupa(sueltos, (x) => `${x.g.parte ?? x.g.pieza}`).slice(0, TODO ? 999 : 30)) {
  const x = sueltos.find((y) => `${y.g.parte ?? y.g.pieza}` === n);
  console.log(`  tornillo sin asiento ${c}× en ${n}  p.ej. [${x.p.map(Math.round)}]`);
}
