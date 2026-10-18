// Auditoría de montaje de la NJP-3500.
//
// 1. Igual que la MS235 (scripts/gemelo-ms235/contactos.mjs): piezas cuya caja no toca la de
//    ninguna otra (flotantes) y tornillos que no asientan en la pieza que los lleva.
// 2. Más estricta: contacto real. Se muestrea la superficie de cada pieza y se mide la
//    distancia a la superficie de las vecinas con el sdf del kit de Anatomy. Una pieza sin
//    ningún punto a menos de 1,5 mm de otra está suelta aunque su caja toque a otra.
// 3. Choques entre conjuntos: puntos de una pieza más de 2 mm dentro de una pieza de otro
//    conjunto (al desarmar se notarían).
//
//   node contactos.mjs           resumen
//   node contactos.mjs --todo    lista completa
import * as A from "../gemelo-ms235/kit/audit.mjs";
import { construir } from "./modelo.mjs";

const TODO = process.argv.includes("--todo");
const TOL_CAJA = 1.4; // la de la MS235 (0,35 unidades de 4 mm)
const TOL = 1.5;
const HONDO = 2;
const { items, pernos } = construir();

const base = (n) => n.replace(/[#:].*$/, "");
const tocan = (a, b, t) => [0, 1, 2].every((i) => a.min[i] - t <= b.max[i] && b.min[i] - t <= a.max[i]);
const enSuelo = (it) => it.caja.min[2] <= 0.5;

// ── 1. criterio de cajas (MS235) ──
const flotCaja = items.filter((a) => !enSuelo(a) && !items.some((b) => b !== a && tocan(a.caja, b.caja, TOL_CAJA)));
const porParte = new Map();
for (const it of items) {
  if (!porParte.has(base(it.name))) porParte.set(base(it.name), []);
  porParte.get(base(it.name)).push(it);
}
const enCaja = (p, b, t) => [0, 1, 2].every((i) => p[i] >= b.min[i] - t && p[i] <= b.max[i] + t);
const sdfDe = (it, p) => Math.min(...it.shapes.map((s) => A.sdf(s, p)));
let totalT = 0;
const sinAsiento = [];
const sinAsientoReal = [];
for (const g of pernos) {
  const cand = g.parte ? porParte.get(base(g.parte)) ?? [] : items.filter((a) => a.piece === g.pieza);
  for (const p of g.pts) {
    totalT++;
    if (!cand.some((b) => enCaja(p, b.caja, 0.4 * 4))) sinAsiento.push({ g, p });
    // la cabeza debe quedar sobre la superficie: distancia real a la pieza < 1,5 mm
    else if (!cand.some((b) => Math.abs(sdfDe(b, p)) <= TOL)) sinAsientoReal.push({ g, p, d: Math.min(...cand.map((b) => Math.abs(sdfDe(b, p)))) });
  }
}

// ── 2. contacto real ──
const TAU = Math.PI * 2;
function muestras(sh, paso) {
  const out = [];
  const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  if (sh.kind === "prism") {
    const { F, poly, s0, s1 } = sh;
    const P = (s, x, y) => add3(add3(F.o, mul3(F.a, s)), add3(mul3(F.u, x), mul3(F.v, y)));
    const ns = Math.max(1, Math.ceil((s1 - s0) / paso));
    for (let i = 0; i < poly.length; i++) {
      const [x0, y0] = poly[i];
      const [x1, y1] = poly[(i + 1) % poly.length];
      const ne = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / paso));
      for (let e = 0; e < ne; e++) for (let k = 0; k <= ns; k++) out.push(P(s0 + ((s1 - s0) * k) / ns, x0 + ((x1 - x0) * e) / ne, y0 + ((y1 - y0) * e) / ne));
    }
    const xs = poly.map((q) => q[0]);
    const ys = poly.map((q) => q[1]);
    const [xa, xb, ya, yb] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    for (let x = xa; x <= xb; x += paso)
      for (let y = ya; y <= yb; y += paso)
        for (const s of [s0, s1]) {
          const p = P(s, x, y);
          if (A.sdf(sh, p) <= 0.01) out.push(p);
        }
  } else if (sh.kind === "body") {
    const { F, poly } = sh;
    for (let i = 0; i < poly.length; i++) {
      const [sa, ra] = poly[i];
      const [sb, rb] = poly[(i + 1) % poly.length];
      const ne = Math.max(1, Math.ceil(Math.hypot(sb - sa, rb - ra) / paso));
      for (let e = 0; e <= ne; e++) {
        const s = sa + ((sb - sa) * e) / ne;
        const r = ra + ((rb - ra) * e) / ne;
        const na = Math.max(1, Math.ceil((TAU * r) / paso));
        for (let k = 0; k < na; k++) {
          const t = (TAU * k) / na;
          out.push(add3(add3(F.o, mul3(F.a, s)), add3(mul3(F.u, r * Math.cos(t)), mul3(F.v, r * Math.sin(t)))));
        }
      }
    }
  } else if (sh.kind === "ball") {
    const n = Math.max(12, Math.ceil((4 * Math.PI * sh.r * sh.r) / (paso * paso)));
    for (let i = 0; i < n; i++) {
      const z = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - z * z);
      const t = i * 2.399963;
      out.push([sh.o[0] + sh.r * r * Math.cos(t), sh.o[1] + sh.r * r * Math.sin(t), sh.o[2] + sh.r * z]);
    }
  } else if (sh.kind === "tube") {
    const { points, radii } = sh;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const L = Math.hypot(...d) || 1;
      const ax = d.map((v) => v / L);
      const h = Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
      let u = [h[1] * ax[2] - h[2] * ax[1], h[2] * ax[0] - h[0] * ax[2], h[0] * ax[1] - h[1] * ax[0]];
      const lu = Math.hypot(...u);
      u = u.map((v) => v / lu);
      const v = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]];
      const r = radii[i];
      const nl = Math.max(1, Math.ceil(L / paso));
      const na = Math.max(6, Math.ceil((TAU * r) / paso));
      for (let k = 0; k <= nl; k++)
        for (let j = 0; j < na; j++) {
          const t = (TAU * j) / na;
          out.push(add3(add3(a, mul3(d, k / nl)), add3(mul3(u, r * Math.cos(t)), mul3(v, r * Math.sin(t)))));
        }
    }
  }
  return out;
}
const area = (it) => {
  const e = it.caja.max.map((v, i) => Math.max(1, v - it.caja.min[i]));
  return 2 * (e[0] * e[1] + e[1] * e[2] + e[0] * e[2]);
};
for (const it of items) {
  const paso = Math.max(2, Math.sqrt(area(it) / 6000));
  it.pts = it.shapes.flatMap((s) => muestras(s, paso));
  it.paso = paso;
}
const tocaReal = (a, b, t) => {
  if (!tocan(a.caja, b.caja, t + a.paso)) return false;
  for (const p of a.pts) if (enCaja(p, b.caja, t) && sdfDe(b, p) <= t + a.paso * 0.25) return true;
  for (const p of b.pts) if (enCaja(p, a.caja, t) && sdfDe(a, p) <= t + b.paso * 0.25) return true;
  return false;
};
const sueltas = items.filter((a) => !enSuelo(a) && !items.some((b) => b !== a && tocaReal(a, b, TOL)));

// Montaje conectado: desde el suelo, por contactos reales, se debe llegar a todas las piezas.
const vecinos = new Map(items.map((it) => [it, []]));
for (let i = 0; i < items.length; i++)
  for (let j = i + 1; j < items.length; j++)
    if (tocaReal(items[i], items[j], TOL)) {
      vecinos.get(items[i]).push(items[j]);
      vecinos.get(items[j]).push(items[i]);
    }
const visto = new Set(items.filter(enSuelo));
const cola = [...visto];
while (cola.length) for (const v of vecinos.get(cola.pop())) if (!visto.has(v)) (visto.add(v), cola.push(v));
const islas = items.filter((it) => !visto.has(it));

// ── 3. choques entre conjuntos ──
const choques = [];
for (let i = 0; i < items.length; i++)
  for (let j = i + 1; j < items.length; j++) {
    const a = items[i];
    const b = items[j];
    if (a.piece === b.piece || !tocan(a.caja, b.caja, -HONDO)) continue;
    let peor = 0;
    for (const p of a.pts) if (enCaja(p, b.caja, 0)) peor = Math.min(peor, sdfDe(b, p));
    for (const p of b.pts) if (enCaja(p, a.caja, 0)) peor = Math.min(peor, sdfDe(a, p));
    if (peor < -HONDO) choques.push({ a: a.name, b: b.name, d: peor });
  }

console.log(`piezas ${items.length} · flotantes ${flotCaja.length} · tornillos ${totalT} · tornillos sin asiento ${sinAsiento.length}`);
console.log(`contacto real: sueltas ${sueltas.length} · fuera del montaje ${islas.length} · tornillos separados de su cara ${sinAsientoReal.length} · choques entre conjuntos ${choques.length}`);
const lim = TODO ? 9999 : 30;
for (const a of flotCaja.slice(0, lim)) console.log(`  flota ${a.name}  [${a.caja.min.map(Math.round)}] .. [${a.caja.max.map(Math.round)}]`);
for (const x of sinAsiento.slice(0, lim)) console.log(`  tornillo sin asiento en ${x.g.parte ?? x.g.pieza}  [${x.p.map(Math.round)}]`);
for (const a of sueltas.slice(0, lim)) console.log(`  suelta ${a.name}  [${a.caja.min.map(Math.round)}] .. [${a.caja.max.map(Math.round)}]`);
for (const a of islas.slice(0, lim)) console.log(`  fuera del montaje ${a.name}`);
for (const x of sinAsientoReal.slice(0, lim)) console.log(`  tornillo a ${x.d.toFixed(1)} mm de ${x.g.parte}  [${x.p.map(Math.round)}]`);
for (const c of choques.sort((x, y) => x.d - y.d).slice(0, lim)) console.log(`  choque ${c.a} <-> ${c.b}  ${c.d.toFixed(1)} mm`);
if (process.argv.includes("--json")) console.log(JSON.stringify({ piezas: items.length, flotantes: flotCaja.length, tornillos: totalT, sinAsiento: sinAsiento.length, sueltas: sueltas.length, islas: islas.length, choques: choques.length }));
