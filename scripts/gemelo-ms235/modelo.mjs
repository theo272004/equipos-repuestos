// La MS235 pieza por pieza. La misma geometria alimenta las laminas de
// Anatomy (SVG) y el visor 3D (three.js).
//
// Unidades de 4 mm: x a la derecha del operador, y hacia el operador, z arriba.
// La pared de la maquina esta en y = 0 (cara delantera). Detras: caja de
// transmision, desbobinado, portabobinas (bobina de 800 mm, hasta Ø500) y
// armario. Delante: guias, dosificacion, soldadura de 6 carriles, arrastre,
// cuchillas, pinzas y cinta de salida.
//
// construir(P, R) dibuja todo para una proyeccion y lo deja en el recorder R.
// Devuelve { pernos }: la tornilleria, que el visor 3D dibuja como instancias.
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as A from "./kit/audit.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";
import { PIEZAS } from "./piezas.mjs";

const X = [1, 0, 0];
const Y = [0, 1, 0];
const Z = [0, 0, 1];

// Cotas principales
export const COTAS = {
  base: { x: -196, y: -178, w: 392, d: 354, r: 3 }, // placa base del bastidor
  zBase: 10,
  hBase: 12,
  pared: { x0: -190, x1: 190, y0: -6, y1: 0, z0: 22, z1: 330 },
  caja: { y0: -100, y1: -6, z1: 300 }, // caja de transmision detras de la pared
  web: 100, // media banda: la bobina de 800 mm se parte en dos de 400 mm
  zWeb: 352, // altura del papel sobre la pared
  tira: { y0: 20, y1: 120 }, // la tira entre placas: 6 carriles de 66 mm
  carriles: 6,
};
const { tira } = COTAS;
const anchoCarril = (tira.y1 - tira.y0) / COTAS.carriles;
export const CARRILES = Array.from({ length: COTAS.carriles }, (_, i) => tira.y0 + anchoCarril * (i + 0.5));
const LIMITES = Array.from({ length: COTAS.carriles - 1 }, (_, i) => tira.y0 + anchoCarril * (i + 1));

export function construir(P, R) {
  const V = G.viewOf(P);
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const Dots = (pts, style) => k.dotsSvg(pts.map(at), style);
  const seg = (a, b) => k.segment(a, b, P);
  const PERNOS = [];

  const moverDe = (pieza) => PIEZAS[pieza].mover;
  function put(pieza, ref, svg, { bias = 0, shapes = [], name, ride, sensor, disp, clase, tono, geo3d } = {}) {
    return R.put({ piece: pieza, ride: ride ?? pieza, at: ref, centro: ref, bias, svg, move: moverDe(ride ?? pieza), shapes, name: name ?? R.nameFor(`${pieza}.it`), sensor, disp, clase, tono, geo3d });
  }

  // Tornilleria sobre una cara: puntos en el mundo, normal hacia fuera y radio de cabeza.
  // En la lamina son puntos; en 3D, cabezas hexagonales instanciadas.
  function pernos(pieza, puntos, normal, { r = 1.2, ride, tipo = "hex" } = {}) {
    if (!puntos.length) return "";
    PERNOS.push({ pieza, ride: ride ?? pieza, n: normal, r, tipo, pts: puntos.map((p) => p.map((v) => +v.toFixed(2))) });
    return k.dotsSvg(puntos.map(at), { size: Math.min(0.6, 0.3 + r * 0.15), tone: "mid" });
  }
  // Pernos en el contorno de una cara rectangular de una caja.
  function pernosCara(pieza, [x0, y0, z0], [x1, y1, z1], cara, { paso = 24, margen = 4, r = 1.2, ride, solo = "contorno" } = {}) {
    const pts = [];
    const eje = cara[1];
    const sg = cara[0] === "+" ? 1 : -1;
    const fija = { x: sg > 0 ? x1 : x0, y: sg > 0 ? y1 : y0, z: sg > 0 ? z1 : z0 }[eje] + sg * 0.05;
    const [ua, ub] = { x: [[y0, y1], [z0, z1]], y: [[x0, x1], [z0, z1]], z: [[x0, x1], [y0, y1]] }[eje];
    const linea = (a0, a1) => {
      const n = Math.max(1, Math.round((a1 - a0 - 2 * margen) / paso));
      return Array.from({ length: n + 1 }, (_, i) => a0 + margen + ((a1 - a0 - 2 * margen) * i) / n);
    };
    const us = linea(ua[0], ua[1]);
    const vs = linea(ub[0], ub[1]);
    const mete = (u, v) => pts.push(eje === "x" ? [fija, u, v] : eje === "y" ? [u, fija, v] : [u, v, fija]);
    if (solo === "esquinas") for (const u of [us[0], us[us.length - 1]]) for (const v of [vs[0], vs[vs.length - 1]]) mete(u, v);
    else {
      for (const u of us) for (const v of [vs[0], vs[vs.length - 1]]) mete(u, v);
      for (const v of vs.slice(1, -1)) for (const u of [us[0], us[us.length - 1]]) mete(u, v);
    }
    const normal = eje === "x" ? [sg, 0, 0] : eje === "y" ? [0, sg, 0] : [0, 0, sg];
    return pernos(pieza, pts, normal, { r, ride });
  }

  // Caja alineada con los ejes: [x0,y0,z0] a [x1,y1,z1].
  function caja(pieza, [x0, y0, z0], [x1, y1, z1], { tone = "hi", r = 0.8, steps = 3, bevel = 0.5, inner = "", extra = "", name, bias, ride, crease, clase, lit, disp, sensor, tornillos } = {}) {
    const plan = { x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2) };
    const id = R.nameFor(name ?? `${pieza}.caja`);
    const paths = k.slabOf(plan, z0, z1 - z0, P, steps, bevel);
    const shape = R.solid(A.slab(plan, z0, z1 - z0, { name: id }, steps));
    let tor = "";
    for (const t of [tornillos].flat().filter(Boolean)) tor += pernosCara(pieza, [x0, y0, z0], [x1, y1, z1], t.cara, { ...t, ride });
    put(pieza, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], S(paths, { tone, inner, crease, className: clase, lit }) + extra + tor, { name: id, shapes: [shape], bias, ride, clase, tono: tone, disp, sensor });
    return { plan, z0, z1, id };
  }

  // Cilindro sobre un eje cualquiera, desde el punto o a lo largo de dir.
  function cil(pieza, o, dir, largo, radio, { tone = "hi", name, bias, ride, extra = "", inner = "", bevel = 0, sensor, disp, clase } = {}) {
    const F = G.frameAlong(o, G.unit3(dir));
    const id = R.nameFor(name ?? `${pieza}.cil`);
    const paths = G.disc(0, largo, radio, F, P, bevel ? { bevel } : {});
    const shape = R.solid(A.disc(F, 0, largo, radio, { name: id }));
    put(pieza, G.add3(o, G.mul3(F.a, largo / 2)), S(paths, { tone, inner, className: clase }) + extra, { name: id, shapes: [shape], bias, ride, sensor, disp, clase, tono: tone });
    return { F, id };
  }

  // Pieza torneada: perfil [[s, r], ...] sobre un marco.
  function torno(pieza, F, perfil, { tone = "hi", name, bias, ride, extra = "", inner = "", disp, clase } = {}) {
    const id = R.nameFor(name ?? `${pieza}.torno`);
    const paths = G.solidOf(perfil, F, P);
    const shape = R.solid(A.solid(F, perfil, { name: id }));
    const mid = (perfil[0][0] + perfil[perfil.length - 1][0]) / 2;
    put(pieza, G.add3(F.o, G.mul3(F.a, mid)), S(paths, { tone, inner, className: clase }) + extra, { name: id, shapes: [shape], bias, ride, tono: tone, disp, clase });
    return { F, id };
  }

  function bola(pieza, c, radio, { tone = "hi", name, bias, ride } = {}) {
    const id = R.nameFor(name ?? `${pieza}.bola`);
    const shape = R.solid(A.ball(c, radio, { name: id }));
    put(pieza, c, S(G.sphereOf(c, radio, P), { tone }), { name: id, shapes: [shape], bias, ride, tono: tone });
  }

  // Prisma de un poligono convexo en el plano (u, v) de F, extruido a lo largo de F.a.
  function prisma(pieza, F, poli, s0, s1, { tone = "hi", name, bias, ride, extra = "", clase, disp } = {}) {
    const id = R.nameFor(name ?? `${pieza}.prisma`);
    const paths = G.prismOf(F, poli, s0, s1, P);
    const shape = R.solid(A.prism(F, poli, s0, s1, { name: id }));
    const cu = poli.reduce((a, p) => a + p[0], 0) / poli.length;
    const cv = poli.reduce((a, p) => a + p[1], 0) / poli.length;
    const ref = G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.add3(G.mul3(F.u, cu), G.mul3(F.v, cv)));
    put(pieza, ref, S(paths, { tone, className: clase }) + extra, { name: id, shapes: [shape], bias, ride, clase, tono: tone, disp });
    return id;
  }
  // Prisma en el plano (y, z), extruido a lo largo de x: chapas laterales con forma.
  const chapaYZ = (pieza, poli, x0, x1, opts) => prisma(pieza, G.frameOf([0, 0, 0], X, Y, Z), poli, x0, x1, opts);
  // Prisma en el plano (x, z), extruido a lo largo de y.
  const chapaXZ = (pieza, poli, y0, y1, opts) => prisma(pieza, G.frameOf([0, 0, 0], Y, X, Z), poli, y0, y1, opts);

  // Eje partido entre los discos que lleva (levas, conos, ruedas): cada tramo se
  // ordena por su cuenta, asi el eje nunca queda a la vez delante y detras de un disco.
  function eje(pieza, o, dir, largo, radio, cortes, opts = {}) {
    const d = G.unit3(dir);
    const tramos = [];
    let s = 0;
    for (const [a, b] of [...cortes].sort((x, y) => x[0] - y[0])) {
      if (a > s + 0.01) tramos.push([s, a]);
      s = Math.max(s, b);
    }
    if (largo > s + 0.01) tramos.push([s, largo]);
    for (const [a, b] of tramos) cil(pieza, G.add3(o, G.mul3(d, a)), d, b - a, radio, opts);
  }

  // Barra entre dos puntos.
  function barra(pieza, p0, p1, radio, opts = {}) {
    const d = G.sub3(p1, p0);
    return cil(pieza, p0, d, G.len3(d), radio, opts);
  }

  // Biela entre dos rotulas: la varilla nace y muere en la superficie de cada bola.
  function biela(pieza, c0, r0, c1, r1, radio, opts = {}) {
    const d = G.unit3(G.sub3(c1, c0));
    const a = Math.sqrt(Math.max(0, r0 * r0 - radio * radio));
    const b = Math.sqrt(Math.max(0, r1 * r1 - radio * radio));
    bola(pieza, c0, r0, { name: `${pieza}.rotula`, ride: opts.ride });
    bola(pieza, c1, r1, { name: `${pieza}.rotula`, ride: opts.ride });
    barra(pieza, G.add3(c0, G.mul3(d, a)), G.sub3(c1, G.mul3(d, b)), radio, opts);
  }

  // Tubo o cable por una ruta; cada trozo se ordena por su cuenta.
  function tubo(pieza, puntos, radio, { tone = "mid", name, bias = 0, ride, curva = 3, maxLength = 24, limp = true, clase } = {}) {
    const id = R.nameFor(name ?? `${pieza}.tubo`);
    const ruta = curva ? G.fillet(puntos, Math.max(curva, radio * 2.6), 10, { P, tube: radio }) : puntos;
    R.route(id, ruta, radio, { piece: pieza, move: moverDe(ride ?? pieza), ride: ride ?? pieza, limp });
    tubePieces(ruta, radio, P, { maxLength }).forEach((parte, i) =>
      put(pieza, parte.mid, tubeSvg(parte, { tone }), { name: `${id}:${i}`, bias, ride, tono: tone, clase, shapes: [A.tube(parte.points, parte.radii)] }),
    );
  }

  // Lamina fina horizontal (papel) con planta poligonal a la altura z.
  function lamina(pieza, anillo, z, { tone = "hi", name, bias, clase = "papel", h = 0.6 } = {}) {
    const id = R.nameFor(name ?? `${pieza}.lamina`);
    const paths = k.extrude(anillo, z, h, P);
    const shape = R.solid(A.extruded(anillo, z, h, { name: id }));
    const cx = anillo.reduce((a, p) => a + p[0], 0) / anillo.length;
    const cy = anillo.reduce((a, p) => a + p[1], 0) / anillo.length;
    put(pieza, [cx, cy, z], S(paths, { tone, crease: "none", className: clase }), { name: id, shapes: [shape], bias, clase, tono: tone });
  }

  // Sensor inductivo o fotocelula: cuerpo roscado y punta encendida.
  function sensor(pieza, sigla, o, dir, { largo = 10, radio = 2.2, tone = "hi", ride } = {}) {
    const F = G.frameAlong(o, G.unit3(dir));
    const id = R.nameFor(`${pieza}.sensor.${sigla}`);
    const cuerpo = G.disc(0, largo, radio, F, P);
    const tuerca = G.disc(largo * 0.35, largo * 0.35 + 1.6, radio + 0.9, F, P);
    const punta = G.pointOf(F, largo, 0, 0);
    const svg = S(cuerpo, { tone }) + S(tuerca, { tone: "mid" }) + k.dotsSvg([at(punta)], { size: 0.9, tone: "lit" });
    const shapes = [R.solid(A.disc(F, 0, largo, radio, { name: id })), R.solid(A.disc(F, largo * 0.35, largo * 0.35 + 1.6, radio + 0.9, { name: `${id}.tuerca` }))];
    put(pieza, G.add3(o, G.mul3(F.a, largo / 2)), svg, { name: id, shapes, ride, sensor: sigla, tono: tone, clase: "sensor" });
  }

  // Lazo de cadena o correa entre dos ruedas, en un plano.
  function lazo([a1, b1], r1, [a2, b2], r2, plano, n = 16) {
    const ang = Math.atan2(b2 - b1, a2 - a1);
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = ang + Math.PI / 2 + (Math.PI * i) / n;
      pts.push(plano(a1 + r1 * Math.cos(t), b1 + r1 * Math.sin(t)));
    }
    for (let i = 0; i <= n; i++) {
      const t = ang - Math.PI / 2 + (Math.PI * i) / n;
      pts.push(plano(a2 + r2 * Math.cos(t), b2 + r2 * Math.sin(t)));
    }
    pts.push(pts[0]);
    return pts;
  }

  // Muelle helicoidal alrededor de un vastago: en la lamina, dos mitades de
  // espiral (atras y delante del vastago); en 3D, una helice de verdad.
  function muelle(pieza, o, dir, s0, s1, radio, vueltas, { name = `${pieza}.muelle`, ride } = {}) {
    const ax = G.unit3(dir);
    const lejos = G.unit3(G.mul3(G.sub3(V, G.mul3(ax, G.dot3(V, ax))), -1));
    const lado = G.unit3(G.cross3(ax, lejos));
    const corona = () => {
      const arco = (r, a0, a1) => Array.from({ length: 13 }, (_, i) => {
        const t = a0 + ((a1 - a0) * i) / 12;
        return [r * Math.cos(t), r * Math.sin(t)];
      });
      return [...arco(radio + 0.4, -Math.PI / 2, Math.PI / 2), ...arco(radio - 0.4, Math.PI / 2, -Math.PI / 2)];
    };
    // helice en el mundo, para la lamina
    const F0 = G.frameAlong(o, ax);
    const pts = [];
    const n = Math.round(vueltas * 24);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push(G.pointOf(F0, s0 + (s1 - s0) * t, radio, t * vueltas * Math.PI * 2));
    }
    const atras = [];
    const frente = [];
    let tramo = null;
    let lejosAhora = null;
    for (const p of pts) {
      const rel = G.sub3(p, G.add3(o, G.mul3(ax, G.dot3(G.sub3(p, o), ax))));
      const esLejos = G.dot3(rel, V) < 0;
      if (esLejos !== lejosAhora) {
        if (tramo && tramo.length > 1) (lejosAhora ? atras : frente).push(tramo);
        tramo = tramo ? [tramo[tramo.length - 1]] : [];
        lejosAhora = esLejos;
      }
      tramo.push(p);
    }
    if (tramo && tramo.length > 1) (lejosAhora ? atras : frente).push(tramo);
    const d = (lista) => lista.map((t) => k.pathOf(t.map(at))).join("");
    const Fa = G.frameOf(o, ax, lejos, lado);
    const Ff = G.frameOf(o, ax, G.mul3(lejos, -1), G.mul3(lado, -1));
    const medio = G.add3(o, G.mul3(ax, (s0 + s1) / 2));
    const geo3d = [{ k: "H", o, a: ax, r: radio, s0, s1, n: vueltas, rw: 0.45 }];
    put(pieza, G.add3(medio, G.mul3(lejos, radio * 0.7)), Ln(d(atras), { tone: "lo" }), { name: R.nameFor(`${name}-atras`), ride, tono: "hi", geo3d, shapes: [R.solid(A.prism(Fa, corona(), s0, s1, { name }))] });
    put(pieza, G.sub3(medio, G.mul3(lejos, radio * 0.7)), Ln(d(frente), { tone: "mid" }), { name: R.nameFor(`${name}-frente`), ride, tono: "hi", geo3d: [], shapes: [R.solid(A.prism(Ff, corona(), s0, s1, { name }))] });
  }

  // Motor electrico con aletas, tapa de ventilador y caja de bornes.
  function motorElectrico(pieza, o, dir, largo, radio, { name = `${pieza}.motor`, disp, ride, tone = "hi" } = {}) {
    const F = G.frameAlong(o, G.unit3(dir));
    const aletas = k.fadedSvg(G.ribsOf(F, largo * 0.12, largo * 0.8, radio, 22, P, { fade: [0.1, 0.55] }), { tone: "lo" });
    torno(pieza, F, [[0, radio * 0.75], [largo * 0.05, radio], [largo * 0.85, radio], [largo * 0.9, radio * 0.82], [largo, radio * 0.7]], { tone, name, extra: aletas, disp, ride });
    // caja de bornes arriba
    const arriba = Math.abs(F.a[2]) > 0.9 ? X : Z;
    const c = G.add3(G.add3(o, G.mul3(F.a, largo * 0.45)), G.mul3(arriba, radio));
    const lado = Math.abs(F.a[0]) > 0.9 ? Y : X;
    const h = radio * 0.45;
    const p0 = [c[0] - (lado === X ? radio * 0.5 : largo * 0.12), c[1] - (lado === Y ? radio * 0.5 : largo * 0.12), c[2] - 0.5];
    const p1 = [c[0] + (lado === X ? radio * 0.5 : largo * 0.12), c[1] + (lado === Y ? radio * 0.5 : largo * 0.12), c[2] + h];
    if (arriba === Z) caja(pieza, p0, p1, { tone: "mid", r: 1, name: `${name}-bornes`, ride });
  }

  // Tornilleria en circulo (bridas, tapas): en 3D cabezas; en la lamina puntos que se desvanecen.
  function pernosCirculo(pieza, F, s, r, n, { rCabeza = 1, ride } = {}) {
    const pts = Array.from({ length: n }, (_, i) => G.pointOf(F, s, r, (i / n) * Math.PI * 2 + 0.3));
    PERNOS.push({ pieza, ride: ride ?? pieza, n: F.a, r: rCabeza, tipo: "allen", pts: pts.map((p) => p.map((v) => +v.toFixed(2))) });
    return k.dotsSvg(G.dotsOf(F, s, r, n, P, { fade: [0.04, 0.42], phase: 0.3 }), { size: 0.45 });
  }

  const { base, zBase, hBase, pared, caja: cj, web: W, zWeb } = COTAS;
  const zPlaca = zBase + hBase; // 22: cara de arriba de la base

  // ───────────────────────── 1. BASTIDOR ─────────────────────────
  // Patas niveladoras (S4A11100110): disco, husillo y tuerca
  for (const [x, y] of [[-186, -168], [186, -168], [-186, -60], [186, -60], [-186, 60], [186, 60], [-186, 166], [186, 166]]) {
    cil("bastidor", [x, y, 0], Z, 2, 8, { tone: "lo", name: "bastidor.pata-disco" });
    cil("bastidor", [x, y, 2], Z, 6, 2.5, { tone: "mid", name: "bastidor.pata-husillo" });
    cil("bastidor", [x, y, 8], Z, 2, 4.2, { tone: "hi", name: "bastidor.pata-tuerca" });
  }
  {
    const grooves = Ln(k.planOutline(k.insetPlan(base, 6), zPlaca, P), { tone: "faint" });
    caja("bastidor", [base.x, base.y, zBase], [base.x + base.w, base.y + base.d, zPlaca], { tone: "mid", r: 3, steps: 6, bevel: 1.2, extra: grooves, name: "bastidor.base", tornillos: { cara: "+z", paso: 40, margen: 8, r: 1.6 } });
  }
  // Bandeja de goteo delante de la pared (abertura de la placa del catalogo)
  caja("bastidor", [-110, 146, zPlaca], [150, 170, zPlaca + 2], { tone: "lo", r: 2, name: "bastidor.bandeja", crease: "none" });

  // Pared de la maquina (A11.04), con bocas de los ejes y tornilleria de los grupos
  {
    const boc = [];
    const bocas = [[-150, 300, 9], [150, 300, 9], [0, 120, 13], [-120, 90, 8], [120, 90, 8], [-160, 200, 7], [160, 200, 7], [100, 250, 10], [-100, 250, 10], [0, 60, 9]];
    for (const [x, z, r] of bocas) boc.push(Ln(k.sideRing([x, pared.y1 + 0.05, z], r, "y", P, 28), { tone: "lo" }));
    caja("bastidor", [pared.x0, pared.y0, pared.z0], [pared.x1, pared.y1, pared.z1], { tone: "mid", r: 0.6, bevel: 0.8, extra: boc.join(""), name: "bastidor.pared", tornillos: { cara: "+y", paso: 30, margen: 6, r: 1.4 } });
    // tapas redondas de inspeccion (2A11100421 / 2A11100121)
    for (const [x, z, r] of [[-120, 90, 11], [120, 90, 11], [0, 60, 12]]) {
      const F = G.frameAlong([x, 0, z], Y);
      cil("bastidor", [x, 0, z], Y, 1.2, r, { tone: "hi", name: "bastidor.tapa-inspeccion", extra: pernosCirculo("bastidor", F, 1.2, r - 2, 6, { rCabeza: 0.8 }) });
    }
  }
  // Laterales de la caja de transmision, con rejillas
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? pared.x0 : pared.x1 - 6;
    const vent = [];
    for (let i = 0; i < 6; i++) {
      const z = 70 + i * 9;
      const x = s < 0 ? x0 - 0.05 : x0 + 6.05;
      vent.push(Ln(k.pathOf([at([x, -80, z]), at([x, -40, z]), at([x, -40, z + 3]), at([x, -80, z + 3])], true), { tone: "lo" }));
    }
    caja("bastidor", [x0, cj.y0, pared.z0], [x0 + 6, cj.y1, cj.z1], { tone: "mid", r: 0.6, bevel: 0.6, extra: vent.join(""), name: "bastidor.lateral", tornillos: { cara: s < 0 ? "-x" : "+x", paso: 40, margen: 5, r: 1.2 } });
  }
  // Placa CE en el lateral izquierdo
  caja("bastidor", [pared.x0 - 1, -90, 230], [pared.x0, -66, 248], {
    tone: "hi",
    r: 0.4,
    bevel: 0,
    extra: [234, 238, 242].map((z, i) => Ln(seg([pared.x0 - 1.05, -87, z], [pared.x0 - 1.05, -87 + [18, 12, 15][i], z]), { tone: "lo", free: true })).join(""),
    name: "bastidor.placa-ce",
    tornillos: { cara: "-x", solo: "esquinas", margen: 1.5, r: 0.6 },
  });
  // Viga superior con cajas de bornes (S4A11100721): las cajas X4x del esquema
  caja("bastidor", [-150, -8, pared.z1], [150, 2, pared.z1 + 4], { tone: "mid", r: 0.6, name: "bastidor.viga-bornes" });
  for (const [x, tag] of [[-144, "X49"], [124, "X47"]]) {
    caja("bastidor", [x, -10, pared.z1 + 4], [x + 20, 4, pared.z1 + 18], { tone: "hi", r: 1.2, bevel: 0.5, name: `bastidor.caja-bornes`, disp: tag, tornillos: { cara: "+z", solo: "esquinas", margen: 2, r: 0.7 } });
  }

  // ───────────────────────── 2. CARTER ─────────────────────────
  caja("carter", [pared.x0 + 6, cj.y0, cj.z1], [pared.x1 - 6, cj.y1, cj.z1 + 6], {
    tone: "mid",
    r: 1,
    bevel: 0.8,
    extra: Ln(k.planOutline(k.insetPlan({ x: pared.x0 + 6, y: cj.y0, w: 368, d: 94, r: 1 }, 5), cj.z1 + 6, P), { tone: "faint" }),
    name: "carter.tapa",
    tornillos: { cara: "+z", paso: 46, margen: 5, r: 1.2 },
  });
  {
    // Puerta trasera (A11.06) con bisagras, manilla y rejilla; marco fijo alrededor
    const yb = cj.y0 - 6;
    caja("carter", [pared.x0, yb, pared.z0], [pared.x1, cj.y0, cj.z1 + 6], {
      tone: "mid",
      r: 0.6,
      bevel: 0.8,
      extra: Ln(k.pathOf([at([-150, yb - 0.05, 34]), at([150, yb - 0.05, 34]), at([150, yb - 0.05, 292]), at([-150, yb - 0.05, 292])], true), { tone: "lo" }) +
        Array.from({ length: 8 }, (_, i) => Ln(k.pathOf([at([-120 + i * 12, yb - 0.05, 80]), at([-114 + i * 12, yb - 0.05, 80]), at([-114 + i * 12, yb - 0.05, 130]), at([-120 + i * 12, yb - 0.05, 130])], true), { tone: "lo" })).join(""),
      name: "carter.trasera",
      tornillos: { cara: "-y", paso: 50, margen: 5, r: 1.1 },
    });
    for (const z of [60, 160, 260]) cil("carter", [-152, yb - 3, z - 9], Z, 18, 2.4, { tone: "hi", name: "carter.bisagra" });
    caja("carter", [130, yb - 6, 140], [136, yb, 200], { tone: "hi", r: 1.5, name: "carter.manilla" });
    caja("carter", [128, yb - 2, 130], [138, yb, 140], { tone: "mid", r: 0.6, name: "carter.cerradura" });
  }
  // Muelle de gas de la tapa (2M01100214)
  biela("carter", [-150, cj.y0 - 9, 200], 2.8, [-150, cj.y0 - 14, 288], 2.8, 2.2, { tone: "hi", name: "carter.muelle-gas" });

  // ───────────────────────── 3. MOTOR Y CADENA ─────────────────────────
  {
    caja("motor", [-152, -80, zPlaca], [-62, -40, 58], { tone: "lo", r: 1, bevel: 0.6, name: "motor.bancada", tornillos: { cara: "+z", solo: "esquinas", margen: 4, r: 1.4 } });
    motorElectrico("motor", [-150, -60, 76], X, 52, 18, { name: "motor.motor", disp: "M25.1" });
    caja("motor", [-98, -84, 58], [-62, -36, 96], { tone: "mid", r: 2, bevel: 0.8, name: "motor.reductor", tornillos: { cara: "-y", solo: "esquinas", margen: 3, r: 1 } });
    cil("motor", [-62, -60, 76], X, 39, 3, { tone: "mid", name: "motor.eje-salida" });
    sensor("motor", "B25.8", [-80, -36, 86], Y, { largo: 8 });
  }
  // Carter de aceite de la cadena, con nivel y tapon de llenado
  {
    const nivel = Ln(k.sideRing([-40, -14.95, 40], 4, "y", P, 18), { tone: "mid" });
    caja("motor", [-60, -96, zPlaca], [20, -15, 56], { tone: "mid", r: 2, bevel: 0.8, extra: nivel, name: "motor.carter-aceite", tornillos: { cara: "+z", paso: 20, margen: 4, r: 0.9 } });
    cil("motor", [0, -30, 56], Z, 5, 4, { tone: "hi", name: "motor.tapon-llenado" });
  }
  // Ruedas de cadena y cadena en bano de aceite (plano x = -20)
  {
    const c1 = [-60, 76];
    const c2 = [-40, 236];
    cil("motor", [-23, c1[0], c1[1]], X, 6, 16, { tone: "hi", name: "motor.pinon" });
    cil("motor", [-23, c2[0], c2[1]], X, 6, 24, { tone: "hi", name: "motor.corona" });
    caja("motor", [-17, c2[0] - 2, c2[1] + 12], [-16, c2[0] + 2, c2[1] + 22], { tone: "lo", r: 0.2, bevel: 0, name: "motor.corona-marca" });
    tubo("motor", lazo(c1, 18, c2, 26, (y, z) => [-20, y, z], 18), 1.3, { tone: "mid", name: "motor.cadena", curva: 0, maxLength: 7, clase: "cadena" });
    // tensor de cadena
    cil("motor", [-20, -30, 150], X, 6, 6, { tone: "hi", name: "motor.tensor" });
  }
  // Eje de levas con levas, apoyado en los laterales
  const LEVAS = [-120, -60, 30, 90, 140];
  eje("motor", [-176, -40, 236], X, 352, 6, [...LEVAS.map((x) => [x - 4 + 176, x + 4 + 176]), [-23 + 176, -17 + 176]], { tone: "mid", name: "motor.eje-levas" });
  for (const x of LEVAS) cil("motor", [x - 4, -40, 242], X, 8, 20, { tone: "hi", name: "motor.leva" });
  for (const x of [-184, 176]) caja("motor", [x, -50, 224], [x + 8, -30, 248], { tone: "mid", r: 1, name: "motor.soporte-eje", tornillos: { cara: x < 0 ? "+x" : "-x", solo: "esquinas", margen: 3, r: 0.9 } });
  // Bomba y filtro DROPSA
  cil("motor", [30, -80, zPlaca], Z, 26, 7, { tone: "hi", name: "motor.dropsa-bomba" });
  cil("motor", [48, -80, zPlaca], Z, 20, 5, { tone: "mid", name: "motor.dropsa-filtro" });
  tubo("motor", [[30, -80, 48], [30, -80, 62], [10, -80, 62], [-10, -60, 62]], 0.9, { name: "motor.dropsa-tubo", tone: "mid" });
  // Volante manual en el lateral izquierdo (gira con el eje de levas; se queda con el bastidor al desarmar)
  {
    const F = G.frameAlong([pared.x0, -40, 236], [-1, 0, 0]);
    torno("motor", F, [[0, 5], [10, 5], [10, 26], [16, 26], [16, 8], [19, 8]], { tone: "hi", name: "motor.volante", ride: "bastidor", extra: pernosCirculo("motor", F, 16, 18, 6, { ride: "bastidor" }) });
    const mango = G.pointOf(F, 16, 20, 0.6);
    cil("motor", mango, [-1, 0, 0], 14, 2.4, { tone: "mid", name: "motor.volante-mango", ride: "bastidor" });
    sensor("motor", "B18.3", [pared.x0, -16, 262], [-1, 0, 0], { largo: 8, ride: "bastidor" });
  }

  // ───────────────────────── 4. PORTABOBINAS Y EMPALME ─────────────────────────
  // Dos ejes neumaticos D74 (S4A26100410): la bobina en uso y la de reserva para el empalme.
  const bob = { y: -215, z: 120, r: 62.5 };
  const res = { y: -250, z: 250, r: 58 };
  {
    caja("bobina", [-184, -304, 0], [130, -180, 8], { tone: "lo", r: 2, name: "bobina.base", tornillos: { cara: "+z", paso: 60, margen: 6, r: 1.6 } });
    // Columnas laterales (S4M16100110), chapas con forma en el plano y-z
    for (const s of [-1, 1]) {
      const [x0, x1] = s < 0 ? [-126, -120] : [120, 126];
      chapaYZ("bobina", [[-292, 8], [-184, 8], [-212, 300], [-268, 300]], x0, x1, { tone: "mid", name: "bobina.columna" });
      // alojamientos de rodamientos de los dos ejes
      for (const e of [bob, res]) cil("bobina", [s < 0 ? -136 : 126, e.y, e.z], X, 10, 14, { tone: "hi", name: "bobina.alojamiento", extra: pernosCirculo("bobina", G.frameAlong([s < 0 ? -136 : 136, e.y, e.z], [s, 0, 0]), 0, 10.5, 4, { rCabeza: 0.8 }) });
    }
    // travesaños entre columnas
    for (const [y, z] of [[-280, 20], [-200, 20]]) caja("bobina", [-120, y - 4, z - 4], [120, y + 4, z + 4], { tone: "mid", r: 1, name: "bobina.travesano" });
    // Caja de cadena y reductor del portabobinas (2M16100122 / 2M16100121) en la columna derecha
    caja("bobina", [126, -282, 30], [136, -196, 52], { tone: "mid", r: 3, steps: 5, bevel: 0.6, name: "bobina.caja-cadena", tornillos: { cara: "+x", paso: 18, margen: 3, r: 0.8 } });
    caja("bobina", [126, -300, 22], [146, -282, 60], { tone: "hi", r: 2, bevel: 0.6, name: "bobina.reductor-centrado", disp: "M31.1" });
    // los dos ejes con sus conos
    for (const [e, nombre] of [[bob, "bobina.eje"], [res, "bobina.eje-reserva"]]) {
      eje("bobina", [-146, e.y, e.z], X, 292, 9.25, [[0, 26], [146 - 112, 146 + 112], [266, 282]], { tone: "mid", name: nombre });
      cil("bobina", [-152, e.y, e.z], X, 6, 6, { tone: "hi", name: "bobina.valvula-inflado" });
      for (const s of [-1, 1]) {
        const C = G.frameAlong([s * (W + 12), e.y, e.z], [-s, 0, 0]);
        torno("bobina", C, [[0, 22], [6, 22], [6, 16], [12, 12]], { tone: "mid", name: "bobina.cono" });
      }
    }
    // Bobina en uso y bobina de reserva (800 mm de ancho)
    for (const [e, nombre] of [[bob, "bobina.bobina"], [res, "bobina.bobina-reserva"]]) {
      const F = G.frameAlong([-W, e.y, e.z], X);
      const capas = [26, 36, 46, 56].filter((r) => r < e.r).map((r) => Ln(G.circleOf(F, 2 * W + 0.05, r, P), { tone: "faint" })).join("");
      torno("bobina", F, [[0, 19], [0, e.r], [2 * W, e.r], [2 * W, 19]], { tone: "hi", name: nombre, extra: capas, clase: "bobina" });
    }
    // Motor de desbobinado con su brazo de correa (S4A26100920)
    {
      const F = G.frameOf([-146, bob.y, bob.z], X, [0, 0, -1], Y);
      prisma("bobina", F, G.stadium(15, 12, 72), 0, 9, { tone: "mid", name: "bobina.brazo-correa" });
      motorElectrico("bobina", [-146, bob.y, bob.z - 72], [-1, 0, 0], 30, 12, { name: "bobina.motor-desbobinado", disp: "M29.1" });
      caja("bobina", [-172, bob.y - 10, 8], [-150, bob.y + 10, bob.z - 84], { tone: "lo", r: 1, name: "bobina.pie-motor" });
    }
    // Sensores del portabobinas
    caja("bobina", [-50, -306, 8], [-44, -300, 150], { tone: "mid", r: 0.6, name: "bobina.poste-sensor" });
    sensor("bobina", "B29.8", [-47, -300, 140], [0, 1, -0.2], { largo: 10, radio: 3 });
    sensor("bobina", "B31.7", [128, bob.y + 14, bob.z - 18], [1, 0, 0], { largo: 7 });
    sensor("bobina", "B31.8", [-128, bob.y + 14, bob.z - 18], [-1, 0, 0], { largo: 7 });
    sensor("bobina", "B31.9", [128, bob.y - 14, bob.z - 18], [1, 0, 0], { largo: 7 });
  }

  // ───────────────────────── 5. DESBOBINADO ─────────────────────────
  // Marcos en L detras de la caja; rodillos entre ellos; mesa de empalme, balancin,
  // rodillo motorizado (S4A75100610) y cuchilla que parte la banda en dos.
  const yLeg = -176;
  {
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -112 : 106;
      caja("desbobinado", [x0, yLeg, zPlaca], [x0 + 6, yLeg + 6, 362], { tone: "mid", r: 0.6, bevel: 0.5, name: "desbobinado.marco-vertical" });
      caja("desbobinado", [x0, yLeg + 6, 344], [x0 + 6, -128, 362], { tone: "mid", r: 0.6, bevel: 0.5, name: "desbobinado.marco-alto", tornillos: { cara: s < 0 ? "-x" : "+x", paso: 14, margen: 3, r: 0.8 } });
    }
    caja("desbobinado", [-106, yLeg, 40], [106, yLeg + 6, 48], { tone: "lo", r: 0.6, name: "desbobinado.travesano" });
    const rod = (y, z, r = 5, name = "desbobinado.rodillo") => cil("desbobinado", [-106, y, z], X, 212, r, { tone: "hi", name });
    rod(-147.5, 200);
    rod(-150, 300);
    rod(-152, 346, 6, "desbobinado.rodillo-alto");
    // Rodillo motorizado de reenvio con su motor en escuadra (S4A75100610)
    rod(-160, 330, 6, "desbobinado.rodillo-motorizado");
    caja("desbobinado", [112, -170, 316], [118, -150, 344], { tone: "mid", r: 1, name: "desbobinado.escuadra-motor" });
    motorElectrico("desbobinado", [118, -160, 330], X, 30, 10, { name: "desbobinado.motor-arrastre", disp: "M30.1" });
    // Balancin de tension
    for (const x of [-104, 101]) barra("desbobinado", [x + 1.5, -150, 300], [x + 1.5, -164, 250], 2, { tone: "mid", name: "desbobinado.balancin" });
    cil("desbobinado", [-100, -164, 250], X, 200, 4.5, { tone: "hi", name: "desbobinado.rodillo-balancin" });
    sensor("desbobinado", "B29.6", [100, -146, 262], [-1, 0, 0], { largo: 7 });
    sensor("desbobinado", "B29.7", [100, -146, 240], [-1, 0, 0], { largo: 7 });
    // Mesa de empalme inclinada con su regla y carro de cuchilla (S4A26100110)
    {
      const F = G.frameOf([0, 0, 0], X, Y, Z);
      prisma("desbobinado", F, [[-170, 165], [-162, 165], [-156, 200], [-164, 200]], -104, 104, { tone: "hi", name: "desbobinado.regla-empalme" });
      barra("desbobinado", [-104, -167, 200], [-104, -200, 236], 2.4, { tone: "mid", name: "desbobinado.palanca-empalme" });
    }
    // Fotocelula de horquilla SICK del empalme en su corredera con escala (A95.13)
    caja("desbobinado", [105, -170, 168], [112, -154, 174], { tone: "mid", r: 0.5, name: "desbobinado.corredera-sick" });
    sensor("bobina", "B29.9", [94, -157, 171], [1, 0, 0], { largo: 6, radio: 2.6 });
    sensor("bobina", "B31.10", [-96, -150, 190], [0, 1, 0], { largo: 5, radio: 1.8 });
    // Cuchilla circular que parte la banda en dos y su rodillo contraste
    cil("desbobinado", [-106, -146, zWeb - 4], X, 212, 4, { tone: "mid", name: "desbobinado.contraste" });
    cil("desbobinado", [-1, -146, zWeb + 9], X, 2, 9, { tone: "hi", name: "desbobinado.cuchilla" });
    eje("desbobinado", [-106, -146, zWeb + 9], X, 212, 2, [[105, 107]], { tone: "mid", name: "desbobinado.eje-cuchilla" });
  }

  // ───────────────────────── 6. PAPEL ─────────────────────────
  {
    const vert = (y0, z0, y1, z1, name) => {
      const t = G.unit3([0, y1 - y0, z1 - z0]);
      const n = [0, -t[2] * 0.3, t[1] * 0.3];
      chapaYZ("film", [[y0 - n[1], z0 - n[2]], [y1 - n[1], z1 - n[2]], [y1 + n[1], z1 + n[2]], [y0 + n[1], z0 + n[2]]], -W, W, { tone: "hi", name, clase: "papel" });
    };
    vert(bob.y + bob.r, bob.z, -152.5, 200, "film.subida");
    vert(-152.5, 200, -168.5, 250, "film.balancin-a");
    vert(-168.5, 250, -155, 300, "film.balancin-b");
    vert(-155, 300, -166, 330, "film.motorizado");
    vert(-166, 330, -158, 346, "film.alto");
    lamina("film", [[-W, -152], [W, -152], [W, -146], [-W, -146]], zWeb, { name: "film.entera" });
  }
  // Cada media banda: barras A y B (2.a linea) detras, giro a 45° delante y bajada entre placas.
  // A: x + y = -132   B: x + y = -152   giro: de (-120, 20) a (-20, 120)
  const zA = zWeb;
  const z2 = zWeb - 7.4;
  const z3 = zWeb - 14.8;
  const z4 = zWeb - 22.2;
  const banda = (s) => {
    const anillo = (pts) => (s < 0 ? pts : pts.map(([x, y]) => [-x, y]).reverse());
    lamina("film", anillo([[-W, -146], [0, -146], [0, -132], [-W, -32]]), zA, { name: "film.media" });
    lamina("film", anillo([[-20, -132], [0, -132], [-W, -32], [-W - 20, -32]]), z2, { name: "film.desvio" });
    lamina("film", anillo([[-W - 20, -32], [-20, -132], [-20, 120], [-W - 20, 20]]), z3, { name: "film.lado" });
    lamina("film", anillo([[-W - 20, 20], [-14, 20], [-14, 120], [-20, 120]]), z4, { name: "film.giro" });
    const x0 = s * 10;
    const x1 = s * 0.9;
    chapaXZ("film", [[x0 - 0.3, 325], [x1 - 0.3, 300], [x1 + 0.3, 300], [x0 + 0.3, 325]], tira.y0, tira.y1, { tone: "hi", name: "film.bajada", clase: "papel" });
  };
  banda(-1);
  banda(1);
  caja("film", [-0.9, tira.y0, 176], [0.9, tira.y1, 300], { tone: "hi", r: 0, bevel: 0, steps: 1, name: "film.tira", clase: "papel" });
  for (const y of CARRILES) caja("film", [-0.9, y - anchoCarril / 2 + 0.6, 136], [0.9, y + anchoCarril / 2 - 0.6, 164], { tone: "hi", r: 0, bevel: 0, steps: 1, name: "film.sobre", clase: "papel" });

  // ───────────────────────── 7. GUIAS DE DESVIACION ─────────────────────────
  {
    const r = 3;
    const zbA = zA - 0.6 - r; // la banda pasa por encima de A
    const zbB = z2 - r - 0.3; // y por encima de B
    const zbT = z3 - r - 0.3; // y por encima de la de giro
    // Travesaño trasero sobre los marcos del desbobinado, travesaño delantero sobre los laterales
    for (const x of [-112, 106]) caja("guias", [x, -136, 362], [x + 6, -130, 368], { tone: "mid", r: 0.5, name: "guias.poste" });
    caja("guias", [-112, -136, 368], [112, -130, 374], { tone: "mid", r: 0.6, bevel: 0.5, name: "guias.travesano", tornillos: { cara: "+z", solo: "esquinas", margen: 2, r: 0.8 } });
    for (const x of [-190, 184]) caja("guias", [x, -25, cj.z1], [x + 6, -19, 368], { tone: "mid", r: 0.5, name: "guias.poste" });
    caja("guias", [-190, -25, 368], [190, -19, 374], { tone: "mid", r: 0.6, bevel: 0.5, name: "guias.travesano" });
    for (const s of [-1, 1]) {
      // A: del centro (voladizo) al travesaño delantero; B: igual, un nivel mas abajo
      barra("guias", [s * 3, -129, zbA], [s * 110, -22, zbA], r, { tone: "hi", name: "guias.barra-A" });
      caja("guias", [s * 110 - 2, -24, zbA + r], [s * 110 + 2, -20, 368], { tone: "mid", r: 0.4, name: "guias.colgante" });
      barra("guias", [s * 22, -130, zbB], [s * 130, -22, zbB], r, { tone: "hi", name: "guias.barra-B" });
      caja("guias", [s * 130 - 2, -24, zbB + r], [s * 130 + 2, -20, 368], { tone: "mid", r: 0.4, name: "guias.colgante" });
    }
    // Brazos delanteros desde la pared y travesaños delanteros
    const zF = 380;
    for (const x of [-170, 164]) {
      caja("guias", [x, 0, 300], [x + 6, 8, zF + 6], { tone: "mid", r: 0.6, name: "guias.mensula", tornillos: { cara: "+y", solo: "esquinas", margen: 2, r: 0.8 } });
      caja("guias", [x, 8, zF], [x + 6, 134, zF + 6], { tone: "mid", r: 0.6, bevel: 0.5, name: "guias.brazo" });
    }
    for (const y of [7, 128]) caja("guias", [-164, y, zF], [164, y + 6, zF + 6], { tone: "mid", r: 0.6, bevel: 0.5, name: "guias.travesano-delantero" });
    for (const s of [-1, 1]) {
      // Barra de giro a 45° (S4M17) colgada por sus extremos
      const p0 = [s * 124, 16];
      const p1 = [s * 20, 120];
      const dg = G.unit3([p1[0] - p0[0], p1[1] - p0[1], 0]);
      barra("guias", G.add3([p0[0], p0[1], zbT], G.mul3(dg, 2.5)), G.sub3([p1[0], p1[1], zbT], G.mul3(dg, 2.5)), 3.2, { tone: "hi", name: "guias.giro" });
      for (const [p, y] of [[p0, 10], [p1, 131]]) {
        caja("guias", [p[0] - 2, Math.min(p[1], y) - 1, zbT - 2], [p[0] + 2, Math.max(p[1], y) + 1, zbT + 4], { tone: "mid", r: 0.4, name: "guias.horquilla" });
        caja("guias", [p[0] - 2, y - 2, zbT + 4], [p[0] + 2, y + 2, zF], { tone: "mid", r: 0.4, name: "guias.colgante" });
      }
      // Rodillo de desvio que baja la banda (eje y)
      const xr = s * 14;
      cil("guias", [xr, 14, 325.5], Y, 112, 4, { tone: "hi", name: "guias.rodillo" });
      for (const y of [8, 126]) caja("guias", [xr - 3, y, 321], [xr + 3, y + 6, zF], { tone: "mid", r: 0.5, name: "guias.placa-rodillo" });
    }
  }

  // ───────────────────────── 8. FOTOCELULA ─────────────────────────
  {
    const zF = 380;
    caja("fotocelula", [80, 56, zF - 6], [164, 62, zF], { tone: "mid", r: 0.5, name: "fotocelula.brazo" });
    caja("fotocelula", [72, 54, 346], [88, 66, zF - 6], {
      tone: "hi",
      r: 1.2,
      bevel: 0.6,
      name: "fotocelula.cuerpo",
      extra: Ln(k.sideRing([80, 66.05, 362], 3.5, "y", P, 18), { tone: "mid" }),
      tornillos: { cara: "+y", solo: "esquinas", margen: 2, r: 0.6 },
    });
    sensor("fotocelula", "B30.10", [80, 60, 346], [0, 0, -1], { largo: 4, radio: 3 });
    tubo("fotocelula", [[88, 60, 368], [120, 60, 368], [164, 60, 371]], 0.7, { name: "fotocelula.cable", tone: "lo", curva: 0, clase: "cable" });
  }

  // ───────────────────────── 9. DOSIFICACION ─────────────────────────
  {
    caja("dosificacion", [-12, 16, 340], [12, 124, 352], { tone: "mid", r: 1.2, bevel: 0.6, name: "dosificacion.cassette", tornillos: { cara: "+z", paso: 24, margen: 3, r: 0.8 } });
    for (const y of CARRILES) cil("dosificacion", [0, y, 312], Z, 28, 2, { tone: "hi", name: "dosificacion.boquilla" });
    // Rasador (pettine) y sus sensores B42.x a los lados del cassette
    caja("dosificacion", [12, 20, 342], [18, 120, 350], { tone: "hi", r: 0.5, name: "dosificacion.rasador" });
    sensor("dosificacion", "B42.2", [18, 30, 346], X, { largo: 6 });
    sensor("dosificacion", "B42.6", [-12, 30, 346], [-1, 0, 0], { largo: 6 });
    sensor("dosificacion", "B42.5", [18, 110, 346], X, { largo: 6 });
    // Valvula estrella doble (eje y)
    const F = G.frameAlong([0, 18, 368], Y);
    torno("dosificacion", F, [[0, 10], [2, 16], [102, 16], [104, 10]], { tone: "hi", name: "dosificacion.estrella", inner: [26, 52, 78].map((s) => G.arcOf(F, s, 16, P)).join("") });
    for (const y of [14, 122]) cil("dosificacion", [0, y, 368], Y, 4, 18, { tone: "mid", name: "dosificacion.tapa-estrella", extra: pernosCirculo("dosificacion", G.frameAlong([0, y, 368], y < 50 ? [0, -1, 0] : Y), y < 50 ? 0 : 4, 14, 6, { rCabeza: 0.7 }) });
    cil("dosificacion", [0, 126, 368], Y, 9, 3, { tone: "mid", name: "dosificacion.eje-estrella" });
    cil("dosificacion", [0, 135, 368], Y, 5, 9, { tone: "hi", name: "dosificacion.polea" });
    caja("dosificacion", [24, 30, 352], [62, 36, 426], { tone: "mid", r: 1, bevel: 0.6, name: "dosificacion.soporte-motor", tornillos: { cara: "+y", solo: "esquinas", margen: 3, r: 0.8 } });
    motorElectrico("dosificacion", [48, 36, 412], Y, 90, 9, { name: "dosificacion.motor", disp: "M34.1", tone: "mid" });
    cil("dosificacion", [48, 126, 412], Y, 9, 2.5, { tone: "mid", name: "dosificacion.eje-motor" });
    cil("dosificacion", [48, 135, 412], Y, 5, 6, { tone: "hi", name: "dosificacion.polea-motor" });
    tubo("dosificacion", lazo([0, 368], 10.2, [48, 412], 7.2, (x, z) => [x, 137.5, z], 14), 0.9, { tone: "lo", name: "dosificacion.correa", curva: 0, maxLength: 6, clase: "correa" });
    // Tolva conica con mirilla y sensores de nivel
    const T = G.frameAlong([0, 70, 384], Z);
    torno("dosificacion", T, [[0, 10], [6, 10], [46, 50], [52, 50], [52, 48]], { tone: "hi", name: "dosificacion.tolva", inner: G.arcOf(T, 30, 34, P, { slope: 1 }) });
    const rT = (s) => 10 + (40 * (s - 6)) / 40 + 0.4;
    sensor("dosificacion", "B35.1", G.pointOf(T, 38, rT(38), 0.9), G.radialOf(T, 0.9), { largo: 8, radio: 3 });
    sensor("dosificacion", "B35.4", G.pointOf(T, 18, rT(18), 0.9), G.radialOf(T, 0.9), { largo: 8, radio: 3 });
    sensor("dosificacion", "B35A.1", G.pointOf(T, 38, rT(38), 2.4), G.radialOf(T, 2.4), { largo: 8, radio: 3 });
    sensor("dosificacion", "B35A.4", G.pointOf(T, 18, rT(18), 2.4), G.radialOf(T, 2.4), { largo: 8, radio: 3 });
    // Tubo A90 delante del cassette (posible aspiracion de polvo, por confirmar)
    cil("dosificacion", [-60, 140, 346], X, 120, 5, { tone: "mid", name: "dosificacion.tubo-a90" });
    for (const x of [-64, 60]) caja("dosificacion", [x, 134, 336], [x + 4, 146, 356], { tone: "mid", r: 0.6, name: "dosificacion.brida-a90" });
  }

  // ───────────────────────── 10. SOLDADURA ─────────────────────────
  {
    // La placa de anclaje (S4M15) queda atornillada a la pared al desarmar: arrastre y corte van montados en ella.
    caja("soldadura", [-74, 0, 160], [74, 6, 306], { tone: "mid", r: 1, bevel: 0.8, ride: "bastidor", name: "soldadura.placa-anclaje", tornillos: { cara: "+y", paso: 24, margen: 4, r: 1.2 } });
    for (const s of [-1, 1]) {
      const sx = (a, b) => (s < 0 ? [-b, -a] : [a, b]);
      const [p0, p1] = sx(1.2, 9);
      caja("soldadura", [p0, tira.y0 - 4, 230], [p1, tira.y1 + 4, 282], { tone: "hi", r: 0.4, bevel: 0.6, name: "soldadura.placa-soldante", tornillos: { cara: s < 0 ? "-x" : "+x", paso: 22, margen: 3, r: 0.7 } });
      // cartuchos calefactores (resistencias) que salen por delante
      for (const z of [240, 272]) cil("soldadura", [(p0 + p1) / 2, tira.y1 + 4, z], Y, 6, 1.6, { tone: "mid", name: "soldadura.resistencia" });
      const [i0, i1] = sx(9, 13);
      caja("soldadura", [i0, tira.y0 - 2, 232], [i1, tira.y1 + 2, 280], { tone: "lo", r: 0.3, name: "soldadura.aislante" });
      const [c0, c1] = sx(13, 32);
      caja("soldadura", [c0, tira.y0 - 6, 236], [c1, tira.y1 + 6, 276], { tone: "mid", r: 1, bevel: 0.8, name: "soldadura.porta-mordaza", tornillos: { cara: s < 0 ? "-x" : "+x", paso: 24, margen: 4, r: 1 } });
      const [b0, b1] = sx(58, 66);
      caja("soldadura", [b0, tira.y0 - 6, 232], [b1, tira.y1 + 6, 280], { tone: "mid", r: 1, bevel: 0.6, name: "soldadura.bloque-fijo", tornillos: { cara: s < 0 ? "-x" : "+x", paso: 30, margen: 4, r: 1 } });
      caja("soldadura", [b0, 6, 232], [b1, tira.y0 - 6, 280], { tone: "mid", r: 0.8, name: "soldadura.mensula" });
      const [m0, m1] = sx(66, 76);
      caja("soldadura", [m0, 50, 244], [m1, 90, 268], { tone: "hi", r: 4, steps: 6, bevel: 0.6, name: "soldadura.membrana" });
      cil("soldadura", [s * 76, 70, 256], [s, 0, 0], 4, 2.4, { tone: "mid", name: "soldadura.racor" });
      // tirantes con muelle (eje x) entre porta-mordaza y bloque fijo
      for (const y of [tira.y0 + 4, tira.y1 - 4]) {
        for (const z of [242, 270]) {
          cil("soldadura", [s * 32, y, z], [s, 0, 0], 26, 2.2, { tone: "hi", name: "soldadura.tirante" });
          muelle("soldadura", [s * 32, y, z], [s, 0, 0], 3, 23, 4, 5, { name: "soldadura.muelle" });
        }
      }
      tubo("soldadura", [[s * 5, tira.y0 - 4, 282], [s * 5, tira.y0 - 10, 296], [s * 20, 7, 296]], 0.6, { tone: "lo", name: "soldadura.pt100", clase: "cable" });
      sensor("soldadura", s < 0 ? "B40.1" : "B40.2", [s * 46, tira.y1 + 6, 278], [0, 0, 1], { largo: 7 });
      sensor("soldadura", s < 0 ? "B41.8" : "B41.4", [s * 5, tira.y0 - 4, 282], [0, 0, 1], { largo: 5, radio: 1.4 });
    }
    for (const s of [-1, 1]) caja("soldadura", [s < 0 ? -6 : 1.2, tira.y0 - 2, 284], [s < 0 ? -1.2 : 6, tira.y1 + 2, 300], { tone: "hi", r: 0.3, bevel: 0.4, name: "soldadura.placa-formado" });
    caja("soldadura", [16, tira.y1 + 6, 248], [30, tira.y1 + 14, 266], { tone: "hi", r: 1, bevel: 0.5, name: "soldadura.codificador", tornillos: { cara: "+y", solo: "esquinas", margen: 2, r: 0.6 } });
    cil("soldadura", [23, tira.y1 + 14, 257], Y, 5, 3.6, { tone: "mid", name: "soldadura.pomo-lote" });
    sensor("soldadura", "B40.8", [-30, 6, 296], [0, 1, 0], { largo: 8 });
    sensor("soldadura", "B18.2", [30, 6, 296], [0, 1, 0], { largo: 8 });
    caja("soldadura", [44, 6, 288], [60, 14, 300], { tone: "hi", r: 1, name: "soldadura.presostato", sensor: "B42.1" });
  }

  // ───────────────────────── 11. ARRASTRE ─────────────────────────
  {
    caja("arrastre", [-40, 6, 198], [40, 16, 226], { tone: "mid", r: 1, bevel: 0.6, name: "arrastre.placa", tornillos: { cara: "+y", solo: "esquinas", margen: 4, r: 1 } });
    for (const s of [-1, 1]) {
      cil("arrastre", [s * 7, 16, 212], Y, 5, 7, { tone: "mid", name: "arrastre.engranaje" });
      const F = G.frameAlong([s * 7, 22, 212], Y);
      const ranuras = LIMITES.map((y) => Ln(G.arcOf(F, y - 22, 6, P), { tone: "faint" })).join("");
      torno("arrastre", F, [[-1, 3], [0, 3], [0, 6], [104, 6], [104, 3], [106, 3]], { tone: "hi", name: "arrastre.rodillo", extra: ranuras });
    }
    barra("arrastre", [-26, 16, 226], [-26, 124, 226], 1.6, { tone: "mid", name: "arrastre.palanca" });
    caja("arrastre", [-30, 124, 210], [-22, 130, 228], { tone: "mid", r: 0.6, name: "arrastre.soporte-palanca" });
    muelle("arrastre", [-26, 128, 228], [0, 0, 1], 0, 14, 2.6, 6, { name: "arrastre.muelle-presion" });
  }

  // ───────────────────────── 12. CORTE ─────────────────────────
  {
    caja("corte", [-44, 6, 162], [28, 16, 198], { tone: "mid", r: 1, bevel: 0.6, name: "corte.placa", tornillos: { cara: "+y", solo: "esquinas", margen: 4, r: 1 } });
    eje("corte", [-14, 16, 190], Y, 112, 2.4, LIMITES.map((y) => [y - 16 - 0.6, y - 16 + 0.6]), { tone: "mid", name: "corte.eje-circulares" });
    for (const y of LIMITES) cil("corte", [-14, y - 0.6, 190], Y, 1.2, 13.2, { tone: "hi", name: "corte.circular" });
    cil("corte", [7, 16, 190], Y, 110, 6, { tone: "hi", name: "corte.contraste" });
    // Cuchilla horizontal ROTATIVA (Calibrado p.23): hoja sobre un eje que gira una vuelta por
    // ciclo contra la contracuchilla fija; leva y sensor B32.8 marcan el cero del motor M32.1.
    for (const y of [10, 126]) caja("corte", [-24, y, 156], [18, y + 6, 184], { tone: "mid", r: 0.8, bevel: 0.5, name: "corte.lateral-caja", tornillos: { cara: y < 50 ? "-y" : "+y", solo: "esquinas", margen: 3, r: 0.8 } });
    caja("corte", [-24, 16, 182], [-2.5, 126, 185], { tone: "mid", r: 0.6, name: "corte.tapa" });
    caja("corte", [2.5, 16, 182], [18, 126, 185], { tone: "mid", r: 0.6, name: "corte.tapa" });
    cil("corte", [-9, 16, 170], Y, 120, 3, { tone: "mid", name: "corte.eje-cuchilla" });
    caja("corte", [-9, 18, 169], [-1.2, 124, 171], { tone: "hi", r: 0.2, bevel: 0.2, name: "corte.cuchilla-rotativa" });
    caja("corte", [1, 16, 166], [9, tira.y1 + 4, 174], { tone: "hi", r: 0.3, bevel: 0.4, name: "corte.cuchilla-fija" });
    caja("corte", [9, 16, 164], [18, tira.y1 + 4, 176], { tone: "mid", r: 0.6, name: "corte.porta-fija", tornillos: { cara: "+x", paso: 20, margen: 3, r: 0.8 } });
    cil("corte", [-9, 132, 170], Y, 4, 8, { tone: "hi", name: "corte.leva" });
    caja("corte", [-9, 132, 177], [-5, 136, 179], { tone: "mid", r: 0.3, bevel: 0, name: "corte.leva-marca" });
    caja("corte", [9, tira.y1 + 4, 166], [16, tira.y1 + 6, 174], { tone: "lo", r: 0.5, name: "corte.fieltro" });
    motorElectrico("corte", [-9, -6, 170], [0, -1, 0], 24, 7, { name: "corte.motor", disp: "M32.1", tone: "mid", ride: "bastidor" });
    sensor("corte", "B32.8", [12, 134, 170], [-1, 0, 0], { largo: 8 });
  }

  // ───────────────────────── 13. PINZAS ─────────────────────────
  {
    caja("pinzas", [-50, 0, 88], [-38, 6, 160], { tone: "mid", r: 0.6, bevel: 0.5, name: "pinzas.guia", tornillos: { cara: "+y", paso: 24, margen: 4, r: 0.7 } });
    caja("pinzas", [-52, 6, 136], [-34, 18, 158], { tone: "hi", r: 1, bevel: 0.6, name: "pinzas.patin" });
    caja("pinzas", [-34, 12, 148], [-20, 130, 158], { tone: "mid", r: 1, bevel: 0.6, name: "pinzas.viga", tornillos: { cara: "+z", paso: 20, margen: 3, r: 0.7 } });
    caja("pinzas", [-34, 130, 148], [14, 134, 158], { tone: "mid", r: 0.6, name: "pinzas.placa-extremo" });
    caja("pinzas", [8, 16, 148], [14, 130, 158], { tone: "mid", r: 0.6, name: "pinzas.barra-derecha" });
    for (const y of CARRILES) {
      caja("pinzas", [-20, y - 4, 150], [-7, y + 4, 156], { tone: "mid", r: 0.4, name: "pinzas.brazo" });
      caja("pinzas", [-7, y - 5, 134], [-3, y + 5, 156], { tone: "hi", r: 0.4, bevel: 0.3, name: "pinzas.dedo" });
      caja("pinzas", [3, y - 5, 134], [8, y + 5, 156], { tone: "hi", r: 0.4, bevel: 0.3, name: "pinzas.dedo" });
    }
    cil("pinzas", [-72, 12, 92], Z, 40, 6, { tone: "hi", name: "pinzas.cilindro" });
    cil("pinzas", [-72, 12, 132], Z, 8, 2, { tone: "mid", name: "pinzas.vastago" });
    biela("pinzas", [-72, 12, 143], 3, [-55, 12, 147], 2.6, 1.6, { tone: "mid", name: "pinzas.biela" });
    caja("pinzas", [-80, 0, 84], [-64, 6, 96], { tone: "mid", r: 0.6, name: "pinzas.charnela" });
  }

  // ───────────────────────── 14. CINTA DE SALIDA ─────────────────────────
  {
    const x0 = -46;
    const x1 = 330;
    const zt = 100;
    const [ya, yb] = [20, 140];
    caja("salida", [x0, ya, zt - 2], [x1, yb, zt], { tone: "hi", r: 1, bevel: 0, steps: 2, name: "salida.lona", crease: "none", clase: "lona" });
    for (const y of [ya - 6, yb]) caja("salida", [x0 - 4, y, zt - 12], [x1 + 4, y + 6, zt + 4], { tone: "mid", r: 0.6, bevel: 0.6, name: "salida.larguero", tornillos: { cara: y < 50 ? "-y" : "+y", paso: 40, margen: 6, r: 0.9 } });
    for (const x of [x0 + 2, x1 - 2]) cil("salida", [x, ya, zt - 6], Y, yb - ya, 5, { tone: "hi", name: "salida.tambor" });
    for (const x of [150, 300]) for (const y of [ya - 6, yb]) caja("salida", [x, y, x < 196 ? zPlaca : 0], [x + 6, y + 6, zt - 12], { tone: "mid", r: 0.5, name: "salida.pata" });
    for (const x of [150, 300]) caja("salida", [x, ya, 46], [x + 6, yb, 52], { tone: "lo", r: 0.5, name: "salida.travesano" });
    motorElectrico("salida", [x1 - 2, yb + 14, zt - 6], Y, 22, 8, { name: "salida.motor", tone: "mid" });
    caja("salida", [x1 - 12, yb + 6, zt - 18], [x1 + 8, yb + 14, zt + 4], { tone: "mid", r: 1, name: "salida.reductor" });
    const carrilesCinta = Array.from({ length: 6 }, (_, i) => ya + ((yb - ya) / 6) * (i + 0.5));
    for (let i = 1; i < 6; i++) {
      const y = ya + ((yb - ya) / 6) * i;
      caja("salida", [40, y - 0.6, zt + 1], [300, y + 0.6, zt + 6], { tone: "mid", r: 0.3, bevel: 0, name: "salida.guia-carril" });
    }
    for (const x of [44, 290]) caja("salida", [x, ya, zt + 6], [x + 4, yb, zt + 8], { tone: "mid", r: 0.4, name: "salida.puente-guias" });
    for (const x of [60, 110, 160, 210, 260]) for (const y of carrilesCinta) caja("salida", [x, y - 7, zt], [x + 28, y + 7, zt + 1.4], { tone: "hi", r: 0.6, bevel: 0, name: "salida.sobre", clase: "papel" });
    for (const [i, x] of [[1, 240], [2, 252], [3, 264]]) sensor("salida", `B52.${i}`, [x, yb + 6, zt + 8], [0, -1, 0], { largo: 6, radio: 2.6 });
    // soplador de rechazo
    cil("salida", [276, yb + 6, zt + 8], [0, -1, 0], 6, 2.4, { tone: "mid", name: "salida.soplador" });
  }

  // ───────────────────────── 15. HMI ─────────────────────────
  {
    caja("hmi", [204, 154, 0], [222, 172, 4], { tone: "lo", r: 2, name: "hmi.base", tornillos: { cara: "+z", solo: "esquinas", margen: 2, r: 0.9 } });
    cil("hmi", [213, 163, 4], Z, 300, 5, { tone: "mid", name: "hmi.columna" });
    cil("hmi", [213, 163, 304], Z, 10, 7, { tone: "hi", name: "hmi.giro" });
    const F = G.frameOf([213, 163, 0], G.unit3([1, 0.6, 0]), G.unit3([-0.6, 1, 0]), Z);
    prisma("hmi", F, [[-5, 314], [5, 314], [5, 324], [-5, 324]], 0, 57, { tone: "mid", name: "hmi.brazo" });
    caja("hmi", [236, 196, 300], [316, 208, 362], {
      tone: "hi",
      r: 2,
      bevel: 0.8,
      name: "hmi.panel",
      extra: Ln(k.pathOf([at([242, 208.05, 306]), at([300, 208.05, 306]), at([300, 208.05, 356]), at([242, 208.05, 356])], true), { tone: "mid" }) + Dots([[308, 208.05, 350], [308, 208.05, 342], [308, 208.05, 334]], { size: 1, tone: "mid" }),
      tornillos: { cara: "+y", solo: "esquinas", margen: 2, r: 0.6 },
    });
    caja("hmi", [242, 208, 306], [300, 208.4, 356], { tone: "lo", r: 0, bevel: 0, steps: 1, name: "hmi.pantalla", clase: "pantalla" });
    cil("hmi", [308, 208, 316], Y, 4, 4.5, { tone: "hi", name: "hmi.seta", clase: "seta" });
  }

  // ───────────────────────── 16. ARMARIO ─────────────────────────
  {
    caja("armario", [200, -262, 0], [304, -112, 10], { tone: "lo", r: 1, name: "armario.zocalo" });
    const puerta = [];
    puerta.push(Ln(k.pathOf([at([304.05, -254, 20]), at([304.05, -120, 20]), at([304.05, -120, 290]), at([304.05, -254, 290])], true), { tone: "lo" }));
    for (let i = 0; i < 5; i++) {
      const z = 40 + i * 8;
      puerta.push(Ln(k.pathOf([at([304.05, -240, z]), at([304.05, -200, z]), at([304.05, -200, z + 3]), at([304.05, -240, z + 3])], true), { tone: "lo" }));
    }
    caja("armario", [202, -260, 10], [304, -114, 298], { tone: "mid", r: 1.2, bevel: 0.8, name: "armario.cuerpo", extra: puerta.join("") });
    for (const z of [40, 150, 260]) cil("armario", [306, -254, z], Z, 16, 2, { tone: "hi", name: "armario.bisagra" });
    cil("armario", [304, -140, 230], X, 4, 8, { tone: "hi", name: "armario.q013", disp: "Q01.3" });
    caja("armario", [304, -134, 120], [308, -128, 170], { tone: "hi", r: 1, name: "armario.manilla" });
    caja("armario", [190, -100, 296], [250, -90, 302], { tone: "lo", r: 0.6, name: "armario.bandeja" });
    caja("armario", [244, -114, 296], [250, -100, 302], { tone: "lo", r: 0.6, name: "armario.bandeja" });
    // ventiladores del armario (M02.4 / M02.5)
    for (const [z, tag] of [[230, "M02.4"], [60, "M02.5"]]) cil("armario", [202, -186, z], [-1, 0, 0], 3, 12, { tone: "hi", name: "armario.ventilador", disp: tag });
  }

  // ───────────────────────── 16b. NEUMATICA (lateral derecho) ─────────────────────────
  // Isla de electrovalvulas SMC: las 10 Y del esquema ES4220003. El reparto de mangueras
  // espera el esquema neumatico.
  {
    const x0 = pared.x1;
    const VALVULAS = ["Y10.8", "Y35.2", "Y40.5", "Y40.6", "Y40.7", "Y42.0", "Y42.3", "Y42.4", "Y42.7", "Y43.6"];
    caja("armario", [x0, -98, 120], [x0 + 4, -8, 214], { tone: "mid", r: 0.6, name: "armario.placa-neumatica", ride: "bastidor", tornillos: { cara: "+x", solo: "esquinas", margen: 3, r: 0.8 } });
    caja("armario", [x0 + 4, -96, 166], [x0 + 14, -14, 176], { tone: "mid", r: 0.6, name: "armario.colector", ride: "bastidor" });
    VALVULAS.forEach((tag, i) => {
      const y = -94 + i * 8;
      caja("armario", [x0 + 4, y, 176], [x0 + 15, y + 7, 198], { tone: "hi", r: 0.8, bevel: 0.4, name: "armario.electrovalvula", ride: "bastidor", disp: tag });
      cil("armario", [x0 + 15, y + 3.5, 192], X, 3, 2, { tone: "mid", name: "armario.bobina-ev", ride: "bastidor", disp: tag });
    });
    caja("armario", [x0 + 4, -60, 140], [x0 + 16, -48, 152], { tone: "hi", r: 1, name: "armario.regulador", ride: "bastidor" });
    torno("armario", G.frameAlong([x0 + 10, -54, 140], [0, 0, -1]), [[0, 5], [16, 4.2, 1], [20, 2.4, 1], [22, 0]], { tone: "hi", name: "armario.vaso-filtro", ride: "bastidor", clase: "vidrio-vaso" });
    cil("armario", [x0 + 10, -54, 152], Z, 4, 3.2, { tone: "mid", name: "armario.mano-regulador", ride: "bastidor" });
  }

  // ───────────────────────── 17. RESGUARDOS ─────────────────────────
  {
    const zt = 470;
    const postes = [[-196, 170], [190, 170], [-196, 8], [190, 8]];
    for (const [x, y] of postes) caja("resguardos", [x, y, zPlaca], [x + 6, y + 6, zt], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.poste" });
    caja("resguardos", [-196, 170, zt], [196, 176, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.travesano" });
    caja("resguardos", [-196, 8, zt], [196, 14, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.travesano" });
    for (const x of [-196, 190]) caja("resguardos", [x, 14, zt], [x + 6, 170, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.larguero" });
    // puertas y laterales de policarbonato (acrilicos) con perfiles y bisagras
    for (const [xa, xb] of [[-190, -2], [2, 190]]) {
      caja("resguardos", [xa, 172, 130], [xb, 174, 464], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.puerta", clase: "vidrio" });
      caja("resguardos", [xa, 171, 126], [xb, 175, 130], { tone: "mid", r: 0.4, name: "resguardos.perfil-puerta" });
      caja("resguardos", [xa, 171, 464], [xb, 175, 468], { tone: "mid", r: 0.4, name: "resguardos.perfil-puerta" });
      const xBis = xa < 0 ? xa + 2 : xb - 2;
      for (const z of [170, 420]) cil("resguardos", [xBis, 176, z], Z, 14, 1.6, { tone: "hi", name: "resguardos.bisagra" });
      caja("resguardos", [xa < 0 ? xb - 14 : xa + 4, 175, 340], [xa < 0 ? xb - 4 : xa + 14, 179, 400], { tone: "hi", r: 1.5, name: "resguardos.tirador" });
    }
    for (const x of [-195, 191]) caja("resguardos", [x, 14, 130], [x + 4, 170, 464], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.lateral", clase: "vidrio" });
    caja("resguardos", [-190, 14, 468], [190, 170, 470], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.techo", clase: "vidrio" });
    // interruptores de seguridad Euchner CTP (S08.x)
    caja("resguardos", [-8, 174, 300], [-2, 180, 316], { tone: "hi", r: 0.8, name: "resguardos.euchner", disp: "S08.3" });
    caja("resguardos", [2, 174, 300], [8, 180, 316], { tone: "hi", r: 0.8, name: "resguardos.euchner", disp: "S08.4" });
    caja("resguardos", [-202, 20, 300], [-196, 30, 316], { tone: "hi", r: 0.8, name: "resguardos.euchner", disp: "S08.1" });
    caja("resguardos", [196, 20, 300], [202, 30, 316], { tone: "hi", r: 0.8, name: "resguardos.euchner", disp: "S08.2" });
  }

  return { pernos: PERNOS };
}
