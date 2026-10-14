// Lista los pares de piezas que se tapan mutuamente (ciclos) en una vista.
// node ciclos.mjs <azimut> [--desarme]   (con --desarme mide tambien los pasos del desarme)
import * as k from "./kit/iso-kit.mjs";
import * as A from "./kit/audit.mjs";
import { construir } from "./modelo.mjs";
import { DESARME } from "./piezas.mjs";
const az = Number(process.argv[2] ?? 58);
const P = k.fitProjection([[-220, -492, 0], [518, 275, 656], [-220, 275, 656], [518, -492, 0]], 1400, 1000, { azimuth: az, elevation: 30, pad: 30 });
const R = A.recorder(P, { order: DESARME, spring: process.argv.includes("--resortes") ? { stagger: 0.045, stiffness: 64, damping: 14.2, substeps: 4 } : {} });
construir(P, R);
for (let i = R.items.length - 1; i >= 0; i--) if (R.items[i].solo3d) R.items.splice(i, 1);
const SPRING = { stagger: 0.045, stiffness: 64, damping: 14.2, substeps: 4 };
const estados = process.argv.includes("--resortes")
  ? [...A.uniformStates(4), ...A.springStates(DESARME, { ...SPRING, stride: 12 }), ...A.prefixStates(DESARME, { shares: [0.35, 0.7, 1] })]
  : process.argv.includes("--desarme") ? [0, 1, ...A.prefixStates(DESARME, { shares: [0.35, 0.7, 1] })] : [0];
const s = A.settle(R, P, { states: estados, step: 0.6, least: 0.6 });
const c = s.solved.cycles ?? [];
console.log("items", R.items.length, "estados", estados.length, "ciclos", c.length, "descartadas", s.solved.dropped?.length);
const cuenta = new Map();
const base = (n) => n.replace(/#\d+$/, "").replace(/:\d+$/, "");
for (const x of c) {
  const key = [base(R.items[x.a]?.name ?? ""), base(R.items[x.b]?.name ?? "")].sort().join("  <->  ");
  const e = cuenta.get(key) ?? { n: 0, estados: new Set() };
  e.n++;
  e.estados.add(A.labelOf(estados[x.state] ?? x.state));
  cuenta.set(key, e);
}
[...cuenta.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 40).forEach(([k2, e]) => console.log(e.n, k2, "·", [...e.estados].slice(0, 4).join(" | ")));
