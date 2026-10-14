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
import { POS, CABLEADO } from "./plano.mjs";

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
  // mat: material real para el visor 3D (inox, alu, caliente, fundicion, bronce, ptfe, caucho…)
  function put(pieza, ref, svg, { bias = 0, shapes = [], name, ride, sensor, disp, clase, tono, geo3d, solo3d, puerta, mat } = {}) {
    return R.put({ ...CTX, piece: pieza, ride: ride ?? pieza, at: ref, centro: ref, bias, svg, move: moverDe(ride ?? pieza), shapes, name: name ?? R.nameFor(`${pieza}.it`), sensor, disp, clase, tono, geo3d, solo3d, puerta, mat });
  }
  // Contexto del despiece: subconjunto, codigo del catalogo y desplazamientos (e1 subconjuntos, e2 piezas)
  let CTX = {};
  const con = (ctx, fn) => {
    const antes = CTX;
    CTX = { ...antes, ...ctx };
    try {
      fn();
    } finally {
      CTX = antes;
    }
  };

  // Tornilleria sobre una cara: puntos en el mundo, normal hacia fuera y radio de cabeza.
  // En la lamina son puntos; en 3D, cabezas hexagonales instanciadas.
  // parte: la pieza que los lleva, para que en la simulacion se muevan con ella
  function pernos(pieza, puntos, normal, { r = 1.2, ride, tipo = "hex", parte } = {}) {
    if (!puntos.length) return "";
    PERNOS.push({ pieza, ride: ride ?? pieza, parte, n: normal, r, tipo, e1: CTX.e1, e2: CTX.e2, pts: puntos.map((p) => p.map((v) => +v.toFixed(2))) });
    return k.dotsSvg(puntos.map(at), { size: Math.min(0.6, 0.3 + r * 0.15), tone: "mid" });
  }
  // Pernos en el contorno de una cara rectangular de una caja.
  function pernosCara(pieza, [x0, y0, z0], [x1, y1, z1], cara, { paso = 24, margen = 4, r = 1.2, ride, solo = "contorno", parte } = {}) {
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
    return pernos(pieza, pts, normal, { r, ride, parte });
  }

  // Caja alineada con los ejes: [x0,y0,z0] a [x1,y1,z1].
  function caja(pieza, [x0, y0, z0], [x1, y1, z1], { tone = "hi", r = 0.8, steps = 3, bevel = 0.5, inner = "", extra = "", name, bias, ride, crease, clase, lit, disp, sensor, tornillos, sinTornillos, solo3d, puerta, mat } = {}) {
    if (sinTornillos) tornillos = null;
    const plan = { x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2) };
    const id = R.nameFor(name ?? `${pieza}.caja`);
    const paths = k.slabOf(plan, z0, z1 - z0, P, steps, bevel);
    const shape = R.solid(A.slab(plan, z0, z1 - z0, { name: id }, steps));
    let tor = "";
    // Chapas y placas sin tornilleria declarada: cuatro o mas tornillos en la cara que mira
    // hacia fuera de la maquina (centro aproximado en [0, -40, 200]).
    if (tornillos === undefined && !clase && !solo3d && (tone === "mid" || tone === "lo")) {
      const dims = [x1 - x0, y1 - y0, z1 - z0];
      const t = dims.indexOf(Math.min(...dims));
      const otras = dims.filter((_, i) => i !== t);
      if (dims[t] <= 10 && Math.min(...otras) >= 18) {
        const ejeT = "xyz"[t];
        const centro = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2][t];
        const signo = centro >= [0, -40, 200][t] ? "+" : "-";
        const grande = Math.max(...otras) > 70;
        tornillos = grande ? { cara: signo + ejeT, paso: 36, margen: 4, r: 0.9 } : { cara: signo + ejeT, solo: "esquinas", margen: Math.min(4, Math.min(...otras) / 5), r: 0.8 };
      }
    }
    for (const t of [tornillos].flat().filter(Boolean)) tor += pernosCara(pieza, [x0, y0, z0], [x1, y1, z1], t.cara, { ...t, ride, parte: id });
    put(pieza, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], S(paths, { tone, inner, crease, className: clase, lit }) + extra + tor, { name: id, shapes: [shape], bias, ride, clase, tono: tone, disp, sensor, solo3d, puerta, mat });
    return { plan, z0, z1, id };
  }

  // Cilindro sobre un eje cualquiera, desde el punto o a lo largo de dir.
  function cil(pieza, o, dir, largo, radio, { tone = "hi", name, bias, ride, extra = "", inner = "", bevel = 0, sensor, disp, clase, solo3d, puerta, mat } = {}) {
    const F = G.frameAlong(o, G.unit3(dir));
    const id = R.nameFor(name ?? `${pieza}.cil`);
    const paths = G.disc(0, largo, radio, F, P, bevel ? { bevel } : {});
    const shape = R.solid(A.disc(F, 0, largo, radio, { name: id }));
    put(pieza, G.add3(o, G.mul3(F.a, largo / 2)), S(paths, { tone, inner, className: clase }) + extra, { name: id, shapes: [shape], bias, ride, sensor, disp, clase, tono: tone, solo3d, puerta, mat });
    return { F, id };
  }

  // Pieza torneada: perfil [[s, r], ...] sobre un marco.
  function torno(pieza, F, perfil, { tone = "hi", name, bias, ride, extra = "", inner = "", disp, clase, mat } = {}) {
    const id = R.nameFor(name ?? `${pieza}.torno`);
    const paths = G.solidOf(perfil, F, P);
    const shape = R.solid(A.solid(F, perfil, { name: id }));
    const mid = (perfil[0][0] + perfil[perfil.length - 1][0]) / 2;
    put(pieza, G.add3(F.o, G.mul3(F.a, mid)), S(paths, { tone, inner, className: clase }) + extra, { name: id, shapes: [shape], bias, ride, tono: tone, disp, clase, mat });
    return { F, id };
  }

  function bola(pieza, c, radio, { tone = "hi", name, bias, ride, mat, solo3d } = {}) {
    const id = R.nameFor(name ?? `${pieza}.bola`);
    const shape = R.solid(A.ball(c, radio, { name: id }));
    put(pieza, c, S(G.sphereOf(c, radio, P), { tone }), { name: id, shapes: [shape], bias, ride, tono: tone, mat, solo3d });
  }

  // Prisma de un poligono convexo en el plano (u, v) de F, extruido a lo largo de F.a.
  function prisma(pieza, F, poli, s0, s1, { tone = "hi", name, bias, ride, extra = "", clase, disp, mat } = {}) {
    const id = R.nameFor(name ?? `${pieza}.prisma`);
    const paths = G.prismOf(F, poli, s0, s1, P);
    const shape = R.solid(A.prism(F, poli, s0, s1, { name: id }));
    const cu = poli.reduce((a, p) => a + p[0], 0) / poli.length;
    const cv = poli.reduce((a, p) => a + p[1], 0) / poli.length;
    const ref = G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.add3(G.mul3(F.u, cu), G.mul3(F.v, cv)));
    put(pieza, ref, S(paths, { tone, className: clase }) + extra, { name: id, shapes: [shape], bias, ride, clase, tono: tone, disp, mat });
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
  // solo3d: cables y mangueras que solo dibuja el visor 3D (en la lamina no se ordenan)
  function tubo(pieza, puntos, radio, { tone = "mid", name, bias = 0, ride, curva = 3, maxLength = 24, limp = true, clase, solo3d, mat } = {}) {
    const id = R.nameFor(name ?? `${pieza}.tubo`);
    const ruta = curva ? G.fillet(puntos, Math.max(curva, radio * 2.6), 10, { P, tube: radio }) : puntos;
    if (!solo3d) R.route(id, ruta, radio, { piece: pieza, move: moverDe(ride ?? pieza), ride: ride ?? pieza, limp });
    tubePieces(ruta, radio, P, { maxLength: solo3d ? 400 : maxLength }).forEach((parte, i) =>
      put(pieza, parte.mid, tubeSvg(parte, { tone }), { name: `${id}:${i}`, bias, ride, tono: tone, clase, solo3d, mat, shapes: [A.tube(parte.points, parte.radii)] }),
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
  function muelle(pieza, o, dir, s0, s1, radio, vueltas, { name = `${pieza}.muelle`, ride, alambre = 0.45, mat, solo3d } = {}) {
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
    const geo3d = [{ k: "H", o, a: ax, r: radio, s0, s1, n: vueltas, rw: alambre }];
    put(pieza, G.add3(medio, G.mul3(lejos, radio * 0.7)), Ln(d(atras), { tone: "lo" }), { name: R.nameFor(`${name}-atras`), ride, tono: "hi", geo3d, mat, solo3d, shapes: [R.solid(A.prism(Fa, corona(), s0, s1, { name }))] });
    put(pieza, G.sub3(medio, G.mul3(lejos, radio * 0.7)), Ln(d(frente), { tone: "mid" }), { name: R.nameFor(`${name}-frente`), ride, tono: "hi", geo3d: [], solo3d, shapes: [R.solid(A.prism(Ff, corona(), s0, s1, { name }))] });
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
  function pernosCirculo(pieza, F, s, r, n, { rCabeza = 1, ride, parte } = {}) {
    const pts = Array.from({ length: n }, (_, i) => G.pointOf(F, s, r, (i / n) * Math.PI * 2 + 0.3));
    PERNOS.push({ pieza, ride: ride ?? pieza, parte, n: F.a, r: rCabeza, tipo: "allen", e1: CTX.e1, e2: CTX.e2, pts: pts.map((p) => p.map((v) => +v.toFixed(2))) });
    return k.dotsSvg(G.dotsOf(F, s, r, n, P, { fade: [0.04, 0.42], phase: 0.3 }), { size: 0.45 });
  }

  const { base, zBase, hBase, pared, caja: cj, web: W, zWeb } = COTAS;
  // [x, y] de la planta del esquema (ver plano.mjs), con un valor por defecto si falta.
  const pl = (tag, def) => POS[tag] ?? def;
  const zPlaca = zBase + hBase; // 22: cara de arriba de la base

  // ───────────────────────── 1. BASTIDOR ─────────────────────────
  // Patas niveladoras (S4A11100110): disco, husillo y tuerca
  for (const [x, y] of [[-186, -168], [186, -168], [-186, 166], [186, 166]]) {
    cil("bastidor", [x, y, 0], Z, 2, 8, { tone: "lo", name: "bastidor.pata-disco" });
    cil("bastidor", [x, y, 2], Z, 6, 2.5, { tone: "mid", name: "bastidor.pata-husillo" });
    cil("bastidor", [x, y, 8], Z, 2, 4.2, { tone: "hi", name: "bastidor.pata-tuerca" });
  }
  {
    const grooves = Ln(k.planOutline(k.insetPlan(base, 6), zPlaca, P), { tone: "faint" });
    caja("bastidor", [base.x, base.y, zBase], [base.x + base.w, base.y + base.d, zPlaca], { tone: "mid", r: 3, steps: 6, bevel: 1.2, extra: grooves, name: "bastidor.base", tornillos: { cara: "+z", paso: 40, margen: 8, r: 1.6 } });
  }
  // Bandeja de goteo delante de la pared (abertura de la placa del catalogo)
  // Tapa de la abertura de la base, pegada a la pared (035050305)
  caja("bastidor", [-110, 18, zPlaca], [125, 90, zPlaca + 1.5], { tone: "mid", r: 1, name: "bastidor.tapa-base", mat: "inox", tornillos: { cara: "+z", solo: "esquinas", margen: 3, r: 0.8 } });

  // Pared de la maquina (A11.04), con bocas de los ejes y tornilleria de los grupos
  {
    const boc = [];
    const bocas = [[0, 80, 19], [92, 107, 9], [-92, 107, 9], [55, 248, 9], [-55, 248, 9]];
    for (const [x, z, r] of bocas) boc.push(Ln(k.sideRing([x, pared.y1 + 0.05, z], r, "y", P, 28), { tone: "lo" }));
    caja("bastidor", [pared.x0, pared.y0, pared.z0], [pared.x1, pared.y1, pared.z1], { tone: "mid", r: 0.6, bevel: 0.8, extra: boc.join(""), name: "bastidor.pared", tornillos: { cara: "+y", paso: 30, margen: 6, r: 1.4 } });
    // tapas redondas de inspeccion (2A11100421 / 2A11100121)
    for (const [x, z, r] of [[0, 80, 19]]) {
      const F = G.frameAlong([x, 0, z], Y);
      cil("bastidor", [x, 0, z], Y, 1.2, r, { tone: "hi", name: "bastidor.tapa-inspeccion", mat: "inox", extra: pernosCirculo("bastidor", F, 1.2, r - 3, 4, { rCabeza: 0.9 }) });
    }
    // agujeros pasantes y ranura larga detras de las manivelas
    for (const x of [92, -92]) cil("bastidor", [x, 0, 107], Y, 0.3, 9, { tone: "lo", name: "bastidor.agujero", mat: "oscuro" });
    caja("bastidor", [-113, 0, 306.5], [113, 0.3, 318], { tone: "lo", r: 0, bevel: 0, steps: 1, name: "bastidor.ranura", mat: "oscuro" });
    // Botes neumaticos en la cara de la pared (03505R028 con presostato, 03505R029)
    for (const [x, racores] of [[115, 3], [-106, 2]]) {
      cil("bastidor", [x, 0, 204], Y, 12, 13.5, { tone: "hi", name: "bastidor.bote-neumatico", mat: "alu" });
      cil("bastidor", [x, 12, 204], Y, 2.2, 14.5, { tone: "mid", name: "bastidor.tapa-bote", mat: "inox", extra: pernosCirculo("bastidor", G.frameAlong([x, 14.2, 204], Y), 0, 12.5, 6, { rCabeza: 0.6 }) });
      for (let i = 0; i < racores; i++) cil("bastidor", [x - 5 + i * 5, 14.2, 207], Y, 2.6, 1.1, { tone: "hi", name: "bastidor.racor", mat: "laton" });
    }
    caja("bastidor", [131, 0, 196], [135, 10, 212], { tone: "mid", r: 0.4, name: "bastidor.escuadra-presostato", mat: "inox" });
    caja("bastidor", [131, 10, 198], [141, 18, 210], { tone: "hi", r: 1, name: "bastidor.presostato", mat: "alu" });
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
  caja("bastidor", [pared.x0 - 1, -40, 230], [pared.x0, -16, 248], {
    tone: "hi",
    r: 0.4,
    bevel: 0,
    extra: [234, 238, 242].map((z, i) => Ln(seg([pared.x0 - 1.05, -37, z], [pared.x0 - 1.05, -37 + [18, 12, 15][i], z]), { tone: "lo", free: true })).join(""),
    name: "bastidor.placa-ce",
    tornillos: { cara: "-x", solo: "esquinas", margen: 1.5, r: 0.6 },
  });
  // Viga superior con cajas de bornes (S4A11100721): las cajas X4x del esquema
  caja("bastidor", [-150, -8, pared.z1], [150, 2, pared.z1 + 4], { tone: "mid", r: 0.6, name: "bastidor.viga-bornes" });

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
    caja("carter", [130, yb - 6, 140], [136, yb, 200], { tone: "hi", r: 1.5, name: "carter.manilla" });
    caja("carter", [128, yb - 2, 130], [138, yb, 140], { tone: "mid", r: 0.6, name: "carter.cerradura" });
    for (const x of [-110, -55, 20, 75]) for (let i = 0; i < 5; i++) caja("carter", [x, yb - 0.6, 40 + i * 6], [x + 36, yb, 42.5 + i * 6], { tone: "lo", r: 0, bevel: 0, steps: 1, name: "carter.lama", mat: "oscuro" });
  }
  // Muelle de gas de la tapa (2M01100214)
  // Varilla del compas de la tapa (2M01100214) a lo largo del borde de arriba, con sus dos soportes
  cil("carter", [-140, cj.y0 + 3, cj.z1 + 7.1], X, 280, 1.1, { tone: "hi", name: "carter.varilla-compas", mat: "cromo" });
  for (const x of [-146, 140]) caja("carter", [x, cj.y0, cj.z1 + 6], [x + 6, cj.y0 + 6, cj.z1 + 10], { tone: "mid", r: 0.6, name: "carter.soporte-compas", mat: "inox" });

  // ───────────────────────── 3. MOTOR Y CADENA ─────────────────────────
  // Motor principal M25.1 donde lo pone la planta del esquema, reductor, cadena en bano
  // de aceite hasta el eje de levas, bomba DROPSA y volante con sus sensores B18.3 / B25.8.
  const [mx, my] = pl("M25.1", [-97, -26]);
  {
    caja("motor", [mx - 28, my - 20, zPlaca], [mx + 62, my + 14, 58], { tone: "lo", r: 1, bevel: 0.6, name: "motor.bancada", tornillos: { cara: "+z", solo: "esquinas", margen: 4, r: 1.4 } });
    motorElectrico("motor", [mx - 26, my, 76], X, 52, 18, { name: "motor.motor", disp: "M25.1" });
    caja("motor", [mx + 26, my - 20, 58], [mx + 62, my + 14, 96], { tone: "mid", r: 2, bevel: 0.8, name: "motor.reductor", tornillos: { cara: "-y", solo: "esquinas", margen: 3, r: 1 } });
    cil("motor", [mx + 62, my, 76], X, 17 - (mx + 62), 3, { tone: "mid", name: "motor.eje-salida" });
  }
  {
    const nivel = Ln(k.sideRing([10, -14.95, 40], 4, "y", P, 18), { tone: "mid" });
    caja("motor", [-10, -96, zPlaca], [50, -15, 56], { tone: "mid", r: 2, bevel: 0.8, extra: nivel, name: "motor.carter-aceite", tornillos: { cara: "+z", paso: 20, margen: 4, r: 0.9 } });
    cil("motor", [40, -30, 56], Z, 5, 4, { tone: "hi", name: "motor.tapon-llenado" });
  }
  // Ruedas de cadena y cadena en bano de aceite (plano x = 20)
  {
    const c1 = [my, 76];
    const c2 = [-40, 236];
    cil("motor", [17, c1[0], c1[1]], X, 6, 16, { tone: "hi", name: "motor.pinon" });
    cil("motor", [17, c2[0], c2[1]], X, 6, 24, { tone: "hi", name: "motor.corona" });
    caja("motor", [23, c2[0] - 2, c2[1] + 12], [24, c2[0] + 2, c2[1] + 22], { tone: "lo", r: 0.2, bevel: 0, name: "motor.corona-marca" });
    tubo("motor", lazo(c1, 18, c2, 26, (y, z) => [20, y, z], 18), 1.3, { tone: "mid", name: "motor.cadena", curva: 0, maxLength: 7, clase: "cadena" });
    cil("motor", [17, -21, 150], X, 6, 5, { tone: "hi", name: "motor.tensor" });
    caja("motor", [23, -24, 147], [25, -6, 153], { tone: "mid", r: 0.4, name: "motor.brazo-tensor" });
  }
  const LEVAS = [-120, -60, 50, 90, 140];
  eje("motor", [-176, -40, 236], X, 352, 6, [...LEVAS.map((x) => [x - 4 + 176, x + 4 + 176]), [17 + 176, 23 + 176]], { tone: "mid", name: "motor.eje-levas" });
  for (const x of LEVAS) cil("motor", [x - 4, -40, 242], X, 8, 20, { tone: "hi", name: "motor.leva" });
  for (const x of [-184, 176]) caja("motor", [x, -50, 224], [x + 8, -30, 248], { tone: "mid", r: 1, name: "motor.soporte-eje", tornillos: { cara: x < 0 ? "+x" : "-x", solo: "esquinas", margen: 3, r: 0.9 } });
  cil("motor", [62, -80, zPlaca], Z, 26, 7, { tone: "hi", name: "motor.dropsa-bomba" });
  cil("motor", [80, -80, zPlaca], Z, 20, 5, { tone: "mid", name: "motor.dropsa-filtro" });
  tubo("motor", [[62, -80, 48], [62, -80, 62], [40, -80, 62], [30, -60, 62], [30, -60, 56]], 0.9, { name: "motor.dropsa-tubo", tone: "mid" });
  // Volante manual DENTRO de la caja de transmision, junto a la correa del motor (Calibrado p.83):
  // se usa con la puerta trasera abierta. B18.3 lee su borde desde arriba y B25.8 va en el lateral.
  {
    const vy = -73;
    const F = G.frameAlong([pared.x0 + 6, vy, 236], [1, 0, 0]);
    torno("motor", F, [[0, 5], [10, 5], [10, 26], [16, 26], [16, 8], [19, 8]], { tone: "hi", name: "motor.volante", mat: "inox", extra: pernosCirculo("motor", F, 16, 18, 6, { parte: "motor.volante" }) });
    const mango = G.pointOf(F, 16, 20, 0.6);
    cil("motor", mango, [1, 0, 0], 14, 2.4, { tone: "mid", name: "motor.volante-mango", mat: "negro" });
    const [, sy] = pl("B18.3", [-173, -79]);
    void sy;
    caja("motor", [pared.x0 + 6, vy - 4, 201], [-168, vy + 4, 205], { tone: "mid", r: 0.4, name: "motor.escuadra-sensor", mat: "inox" });
    sensor("motor", "B18.3", [-171, vy, 205], [0, 0, 1], { largo: 4 });
    const [, zy] = pl("B25.8", [-171, -88]);
    sensor("motor", "B25.8", [pared.x0 + 6, zy, 200], [1, 0, 0], { largo: 8 });
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
    {
      // estadio entre los centros de los dos ejes (bobina en uso y de reserva), 40 de ancho
      const c1 = [bob.y, bob.z];
      const c2 = [res.y, res.z];
      const L = Math.hypot(c2[0] - c1[0], c2[1] - c1[1]);
      const d = [(c2[0] - c1[0]) / L, (c2[1] - c1[1]) / L];
      const a0 = Math.atan2(d[1], d[0]);
      const arco = ([cy, cz], desde) => Array.from({ length: 11 }, (_, i) => {
        const t = desde + (Math.PI * i) / 10;
        return [cy + 20 * Math.cos(t), cz + 20 * Math.sin(t)];
      });
      const poli = [...arco(c2, a0 - Math.PI / 2), ...arco(c1, a0 + Math.PI / 2)];
      chapaYZ("bobina", poli, -146, -136, { tone: "mid", name: "bobina.caja-cadena", mat: "inox" });
      // tensor de la cadena: bloque con su tornillo largo a un costado de la caja
      const n = [d[1], -d[0]];
      const m = [(c1[0] + c2[0]) / 2 + n[0] * 27, (c1[1] + c2[1]) / 2 + n[1] * 27];
      caja("bobina", [-146, m[0] - 7.5, m[1] - 7.5], [-134, m[0] + 7.5, m[1] + 7.5], { tone: "hi", r: 1, name: "bobina.tensor-cadena", mat: "fundicion", tornillos: { cara: "-x", solo: "esquinas", margen: 2, r: 0.6 } });
      cil("bobina", [-141, m[0] + 7.5, m[1]], Y, 12, 1.2, { tone: "hi", name: "bobina.tornillo-tensor", mat: "cromo" });
    }
    // Centrado de la bobina: motorreductor M31.1 y finales de carrera B31.7 / B31.8 / B31.9 (planta)
    {
      const [cx, cy] = pl("M31.1", [-172, -138]);
      caja("bobina", [cx - 12, cy - 12, zPlaca], [cx + 12, cy + 12, 56], { tone: "hi", r: 2, bevel: 0.6, name: "bobina.reductor-centrado" });
      motorElectrico("bobina", [cx, cy, 56], Z, 26, 8, { name: "bobina.motor-centrado", disp: "M31.1" });
      caja("bobina", [-166, -168, zPlaca], [-128, -164, 110], { tone: "mid", r: 0.6, name: "bobina.placa-finales" });
      for (const [tag, z] of [["B31.7", 100], ["B31.8", 86], ["B31.9", 72]]) sensor("bobina", tag, [pl(tag, [-150, -150])[0], -164, z], [0, 1, 0], { largo: 7 });
    }
    // los dos ejes con sus conos
    for (const [e, nombre] of [[bob, "bobina.eje"], [res, "bobina.eje-reserva"]]) {
      // tubo ranurado D74 que sujeta el nucleo de 3" (S4A26100410): solo asoma entre acoplamiento y brida
      eje("bobina", [-146, e.y, e.z], X, 292, 9.25, [[0, 38], [44.5, 292]], { tone: "mid", name: nombre, mat: "cromo" });
      cil("bobina", [-120, e.y, e.z], X, 12, 15, { tone: "hi", name: "bobina.acoplamiento", mat: "inox", extra: pernosCirculo("bobina", G.frameAlong([-108, e.y, e.z], X), 0, 11, 4, { rCabeza: 0.8, parte: "bobina.acoplamiento" }) });
      cil("bobina", [-101.5, e.y, e.z], X, 1.5, 22, { tone: "hi", name: "bobina.brida-eje", mat: "inox" });
      for (const [x0, x1] of [[100, 104], [107, 114], [117, 120]]) cil("bobina", [x0, e.y, e.z], X, x1 - x0, 5, { tone: "hi", name: "bobina.munon", mat: "cromo" });
      for (const x of [104, 114]) cil("bobina", [x, e.y, e.z], X, 3, 7, { tone: "mid", name: "bobina.casquillo-munon", mat: "bronce" });
      // valvula de inflado en la punta (en la bobina en uso, despues de la polea del brazo)
      const xv = e === bob ? -170 : -152;
      cil("bobina", [xv, e.y, e.z], X, 6, 6, { tone: "hi", name: "bobina.valvula-inflado", mat: "laton" });
      if (e === bob) cil("bobina", [-164, e.y, e.z], X, 6, 4, { tone: "mid", name: "bobina.punta-eje", mat: "cromo" });
    }
    // Bobina en uso y bobina de reserva (800 mm de ancho)
    for (const [e, nombre] of [[bob, "bobina.bobina"], [res, "bobina.bobina-reserva"]]) {
      const F = G.frameAlong([-W, e.y, e.z], X);
      const capas = [26, 36, 46, 56].filter((r) => r < e.r).map((r) => Ln(G.circleOf(F, 2 * W + 0.05, r, P), { tone: "faint" })).join("");
      torno("bobina", F, [[0, 9.6], [0, e.r], [2 * W, e.r], [2 * W, 9.6]], { tone: "hi", name: nombre, extra: capas, clase: "bobina" });
    }
    // Motor de desbobinado con su brazo de correa (S4A26100920)
    {
      const zm = bob.z + 70;
      const arco = (cz, r0, desde) => Array.from({ length: 11 }, (_, i) => [bob.y + r0 * Math.cos(desde + (Math.PI * i) / 10), cz + r0 * Math.sin(desde + (Math.PI * i) / 10)]);
      chapaYZ("bobina", [...arco(zm, 12, 0), ...arco(bob.z, 16, Math.PI)], -152, -146, { tone: "mid", name: "bobina.brazo-correa", mat: "inox" });
      cil("bobina", [-158, bob.y, bob.z], X, 6, 15, { tone: "hi", name: "bobina.polea-bobina", mat: "alu" });
      cil("bobina", [-158, bob.y, zm], X, 6, 5, { tone: "hi", name: "bobina.polea-motor", mat: "alu" });
      tubo("bobina", lazo([bob.y, bob.z], 15.6, [bob.y, zm], 5.6, (y, z) => [-155, y, z], 16), 0.8, { tone: "lo", name: "bobina.correa", curva: 0, maxLength: 7, clase: "correa" });
      motorElectrico("bobina", [-160, bob.y, zm], [-1, 0, 0], 26, 8, { name: "bobina.motor-freno" });
      // soporte de resortes M2A26100641 que toma la reaccion del brazo
      caja("bobina", [-164, -196, 8], [-158, -190, 184], { tone: "mid", r: 0.5, name: "bobina.poste-resortes", mat: "inox" });
      caja("bobina", [-164, -198, 184], [-152, -190, 196], { tone: "hi", r: 0.8, name: "bobina.corredera-resortes", mat: "alu" });
      for (const z of [187, 193]) muelle("bobina", [-155, bob.y + 12, z], Y, 0, 5, 1.4, 5, { name: "bobina.muelle-reaccion", alambre: 0.3, mat: "cromo" });
    }
    // Sensores del portabobinas
    // Control de bobina B29.8 y su conector X50 en un poste delante de la bobina (planta)
    {
      const [sx, sy] = pl("B29.8", [106, -144]);
      caja("bobina", [sx - 2, sy - 2, zPlaca], [sx + 2, sy + 2, 150], { tone: "mid", r: 0.6, name: "bobina.poste-sensor" });
      sensor("bobina", "B29.8", [sx, sy - 2, 140], [0, -1, 0], { largo: 10, radio: 3 });
      const [cx, cy] = pl("X50", [106, -143]);
      caja("bobina", [sx - 5, sy + 2, 104], [sx + 5, sy + 8, 116], { tone: "hi", r: 1, name: "bobina.conector", disp: "X50", clase: "conector", mat: "harting" });
      const [x0x, x0y] = pl("X0", [127, -161]);
      caja("armario", [x0x - 6, x0y - 6, zPlaca], [x0x + 6, x0y + 6, 34], { tone: "hi", r: 1, name: "armario.conector-x0", disp: "X0", clase: "conector", ride: "bastidor" });
    }
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
    rod(-158, 330, 6, "desbobinado.rodillo-motorizado");
    caja("desbobinado", [112, -168, 316], [118, -148, 344], { tone: "mid", r: 1, name: "desbobinado.escuadra-motor" });
    motorElectrico("desbobinado", [118, -158, 330], X, 30, 10, { name: "desbobinado.motor-reenvio" });
    // Balancin de tension
    for (const x of [-104, 101]) barra("desbobinado", [x + 1.5, -150, 300], [x + 1.5, -164, 250], 2, { tone: "mid", name: "desbobinado.balancin" });
    cil("desbobinado", [-100, -164, 250], X, 200, 4.5, { tone: "hi", name: "desbobinado.rodillo-balancin" });
    // Mesa de empalme inclinada con su regla y carro de cuchilla (S4A26100110)
    {
      const F = G.frameOf([0, 0, 0], X, Y, Z);
      prisma("desbobinado", F, [[-170, 165], [-162, 165], [-156, 200], [-164, 200]], -104, 104, { tone: "hi", name: "desbobinado.regla-empalme" });
      barra("desbobinado", [-104, -167, 200], [-104, -200, 236], 2.4, { tone: "mid", name: "desbobinado.palanca-empalme" });
    }
    // Fotocelula de horquilla SICK del empalme en su corredera con escala (A95.13)
    caja("desbobinado", [105, -170, 168], [112, -156, 174], { tone: "mid", r: 0.5, name: "desbobinado.corredera-sick", mat: "alu" });
    for (const [y0, y1] of [[-156, -154], [-151, -149]]) caja("desbobinado", [94, y0, 166], [112, y1, 176], { tone: "hi", r: 0.6, name: "desbobinado.horquilla-sick", mat: "harting" });
    caja("desbobinado", [112, -156, 166], [116, -149, 176], { tone: "hi", r: 0.6, name: "desbobinado.horquilla-sick", mat: "harting" });
    {
      const [ex, ey] = pl("B29.9", [-125, -107]);
      sensor("bobina", "B29.9", [ex, cj.y0 - 6, 200], [0, -1, 0], { largo: 8, radio: 2.6, ride: "carter" });
      const [fx, fy] = pl("B31.10", [108, -156]);
      caja("bobina", [108, -170, 186], [112, fy + 2, 194], { tone: "mid", r: 0.4, name: "bobina.soporte-fibra", ride: "desbobinado" });
      sensor("bobina", "B31.10", [Math.min(fx, 107.8), fy, 190], [-1, 0, 0], { largo: 5, radio: 1.8, ride: "desbobinado" });
    }
    // Cuchilla circular que parte la banda en dos y su rodillo contraste
    cil("desbobinado", [-106, -146, zWeb - 4], X, 212, 4, { tone: "mid", name: "desbobinado.contraste" });
    cil("desbobinado", [-1, -146, zWeb + 9], X, 2, 9, { tone: "hi", name: "desbobinado.cuchilla", mat: "cromo" });
    caja("desbobinado", [-106, -132, zWeb + 8], [106, -124, zWeb + 16], { tone: "mid", r: 0.8, bevel: 0.5, name: "desbobinado.viga-cuchilla", mat: "inox", tornillos: { cara: "+y", paso: 30, margen: 6, r: 0.7 } });
    caja("desbobinado", [2, -140, zWeb + 7], [8, -132, zWeb + 13], { tone: "hi", r: 0.5, name: "desbobinado.portacuchilla", mat: "alu" });
    muelle("desbobinado", [8, -136, zWeb + 10], X, 0, 10, 1.5, 6, { name: "desbobinado.muelle-cuchilla", alambre: 0.3, mat: "cromo" });
    caja("desbobinado", [18, -140, zWeb + 6], [22, -132, zWeb + 14], { tone: "mid", r: 0.4, name: "desbobinado.tope-muelle", mat: "inox" });
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
    vert(-155, 300, -164.3, 330, "film.motorizado");
    vert(-164.3, 330, -162.5, 334.5, "film.arco");
    vert(-162.5, 334.5, -158, 336.3, "film.arco");
    vert(-158, 336.3, -158, 346, "film.alto");
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
      // placa guia: la banda pasa por encima, da la vuelta en la barra y sigue por debajo
      const tri = [[-111.6, 22], [-16, 22], [-16, 117.6]];
      prisma("guias", G.frameOf([0, 0, 0], Z, X, Y), s < 0 ? tri : tri.map(([x, y]) => [-x, y]).reverse(), zbT - 0.6, zbT + 0.6, { tone: "hi", name: "guias.placa-guia", mat: "inox" });
      // Rodillo de desvio que baja la banda (eje y)
      const xr = s * 14;
      cil("guias", [xr, 14, 325.5], Y, 112, 4, { tone: "hi", name: "guias.rodillo" });
      for (const y of [8, 126]) caja("guias", [xr - 3, y, 321], [xr + 3, y + 6, zF], { tone: "mid", r: 0.5, name: "guias.placa-rodillo" });
    }
  }

  // ───────────────────────── 8. FOTOCELULA ─────────────────────────
  {
    const [fx, fy] = pl("B30.10", [148, 21]);
    caja("fotocelula", [fx + 6, fy - 3, 374], [164, fy + 3, 380], { tone: "mid", r: 0.5, name: "fotocelula.brazo" });
    caja("fotocelula", [fx - 6, fy - 6, 350], [fx + 6, fy + 6, 374], {
      tone: "hi",
      r: 1.2,
      bevel: 0.6,
      name: "fotocelula.cuerpo",
      extra: Ln(k.sideRing([fx, fy + 6.05, 362], 3.5, "y", P, 18), { tone: "mid" }),
      tornillos: { cara: "+y", solo: "esquinas", margen: 2, r: 0.6 },
    });
    sensor("fotocelula", "B30.10", [fx - 6, fy, 358], [-1, 0, 0], { largo: 4, radio: 3 });
    tubo("fotocelula", [[fx, fy, 380], [fx, fy, 382.5], [164, fy, 382.5]], 0.7, { name: "fotocelula.cable", tone: "lo", curva: 0, clase: "cable" });
  }

  // ───────────────────────── 9. DOSIFICACION ─────────────────────────
  // Tolva desplazada (sensores de nivel B35 en la planta), conducto a la valvula estrella,
  // cassette con boquillas por carril, rasador, motores M34.1 / M34A.1 y vibrador M37.1.
  {
    caja("dosificacion", [-12, 18, 340], [12, 122, 352], { tone: "mid", r: 1.2, bevel: 0.6, name: "dosificacion.cassette", tornillos: { cara: "+z", paso: 24, margen: 3, r: 0.8 } });
    for (const y of CARRILES) cil("dosificacion", [0, y, 312], Z, 28, 2, { tone: "hi", name: "dosificacion.boquilla" });
    caja("dosificacion", [12, 20, 342], [18, 120, 350], { tone: "hi", r: 0.5, name: "dosificacion.rasador" });
    const F = G.frameAlong([0, 18, 368], Y);
    torno("dosificacion", F, [[0, 10], [2, 16], [102, 16], [104, 10]], { tone: "hi", name: "dosificacion.estrella", inner: [26, 52, 78].map((s) => G.arcOf(F, s, 16, P)).join("") });
    for (const y of [14, 122]) cil("dosificacion", [0, y, 368], Y, 4, 18, { tone: "mid", name: "dosificacion.tapa-estrella", extra: pernosCirculo("dosificacion", G.frameAlong([0, y, 368], y < 50 ? [0, -1, 0] : Y), y < 50 ? 0 : 4, 14, 6, { rCabeza: 0.7 }) });
    caja("dosificacion", [-1, 126, 364], [1, 128, 372], { tone: "lo", r: 0.2, bevel: 0, name: "dosificacion.marca-estrella" });
    // Placa de motores sobre la estrella, con los dos motorreductores de la planta
    caja("dosificacion", [-14, 70, 384], [74, 94, 388], { tone: "mid", r: 0.8, name: "dosificacion.placa-motores", tornillos: { cara: "+z", solo: "esquinas", margen: 3, r: 0.8 } });
    for (const [tag, def] of [["M34.1", [5, 82]], ["M34A.1", [61, 82]]]) {
      const [x, y] = pl(tag, def);
      caja("dosificacion", [x - 7, y - 7, 388], [x + 7, y + 7, 398], { tone: "mid", r: 1, name: "dosificacion.reductor" });
      motorElectrico("dosificacion", [x, y, 398], Z, 26, 7, { name: "dosificacion.motor", disp: tag, tone: "mid" });
    }
    // Tolva conica con sus sensores de nivel (B35 de un lado, B35A del otro) y conducto a la estrella
    const [hx, hy0] = pl("B35.1", [57.5, 42.5]);
    const hy = hy0 + 5.5;
    const T = G.frameOf([hx, hy, 400], Z, X, Y);
    torno("dosificacion", T, [[0, 10], [6, 10], [46, 50], [52, 50], [52, 48]], { tone: "hi", name: "dosificacion.tolva", inner: G.arcOf(T, 30, 34, P, { slope: 1 }) });
    tubo("dosificacion", [[hx, hy, 400], [hx, hy, 394], [10, hy, 388], [4, hy, 385]], 5, { tone: "hi", name: "dosificacion.conducto", curva: 8 });
    const rT = (s) => 10 + (40 * (s - 6)) / 40 + 3.4;
    for (const [tag, s, ang] of [["B35.1", 12, -Math.PI / 2], ["B35.4", 40, -Math.PI / 2], ["B35A.1", 12, Math.PI / 2], ["B35A.4", 40, Math.PI / 2]]) sensor("dosificacion", tag, G.pointOf(T, s, rT(s), ang), G.radialOf(T, ang), { largo: 8, radio: 3 });
    // Vibrador M37.1 al lado del cassette
    const [vx, vy] = pl("M37.1", [-22, 112]);
    caja("dosificacion", [vx - 6, vy - 6, 340], [vx + 6, vy + 6, 352], { tone: "hi", r: 1.5, name: "dosificacion.vibrador", disp: "M37.1" });
    caja("dosificacion", [vx + 6, vy - 3, 343], [-12, vy + 3, 349], { tone: "mid", r: 0.4, name: "dosificacion.soporte-vibrador" });
    // Tubo A90 delante del cassette (posible aspiracion de polvo, por confirmar)
    cil("dosificacion", [-60, 140, 346], X, 120, 5, { tone: "mid", name: "dosificacion.tubo-a90" });
    for (const x of [-64, 60]) caja("dosificacion", [x, 134, 336], [x + 4, 146, 356], { tone: "mid", r: 0.6, name: "dosificacion.brida-a90" });
  }

  // ───────────────────────── 10. SOLDADURA ─────────────────────────
  // Grupo S4M14100110 (laminas t051-t064, t117-t119) y manual de Calibrado p.63-73.
  // Como funciona: detras de la pared, las dos levas del bastidor M2M14100351 empujan los tirantes
  // con resorte (00707R003); estos giran los ejes que salen por la pared a la cuna (235.21.227) de
  // cada mordaza; la cuna gira el arbol vertical (235.21.228) y el paralelogramo de bielas
  // (07P2R049 / 07P2R047: 3 bloques bisagra, bielas cortas y largas, juego 0,8 mm) lleva la placa
  // calefactora (S4A21100231) contra el papel, siempre paralela. El cuerpo de fundicion (03510R015 /
  // 03510R014) queda quieto; los cilindros con fuelle (2M14100317) separan las placas con aire.
  // Cada pieza lleva su subconjunto, su codigo y donde va en el despiece (e1: subconjuntos, e2: piezas).
  {
    const [Y0, Y1] = [tira.y0, tira.y1];
    con({ sub: "anclaje", e1: [0, 0, 0], e2: [0, 0, 0], cod: "S4M15100110" }, () => {
      caja("soldadura", [-74, 0, 160], [74, 6, 306], { tone: "mid", r: 1, bevel: 0.8, ride: "bastidor", name: "soldadura.placa-anclaje", mat: "inox", tornillos: { cara: "+y", paso: 24, margen: 4, r: 1.2 } });
    });
    for (const s of [-1, 1]) {
      const sx = (a, b) => (s < 0 ? [-b, -a] : [a, b]);
      const cara = s < 0 ? "-x" : "+x";
      const L = s > 0 ? "izq" : "der"; // con el espejo, +x del modelo es la izquierda de la maquina real
      const yc = (Y0 + Y1) / 2;
      const zc = 260;
      // ── placa calefactora S4A21100231 (se mueve con el paralelogramo) ──
      const PL = { sub: `plancha-${L}`, e1: [s * 28, 80, 55] };
      con({ ...PL, e2: [-s * 10, 0, 0], cod: "S4A21100231" }, () => {
        const [p0, p1] = sx(1.2, 4.2);
        for (let i = 0; i < 10; i++) caja("soldadura", [p0, Y0 - 4, 232 + i * 4.8], [p1, Y1 + 4, 236.4 + i * 4.8], { tone: "hi", r: 0.2, bevel: 0.2, steps: 1, name: "soldadura.placa-soldante", mat: "caliente", sinTornillos: true });
      });
      con({ ...PL, e2: [0, 0, 0], cod: "S4A21100231" }, () => {
        const [q0, q1] = sx(4.2, 12);
        caja("soldadura", [q0, Y0 - 6, 230], [q1, Y1 + 6, 282], { tone: "mid", r: 0.6, bevel: 0.5, name: "soldadura.bloque-calefactor", mat: "caliente", tornillos: { cara: "+z", paso: 18, margen: 4, r: 0.8 } });
      });
      con({ ...PL, e2: [0, -16, 0], cod: "S4A21100231" }, () => {
        caja("soldadura", [Math.min(s * 1.2, s * 12), Y0 - 10, 232], [Math.max(s * 1.2, s * 12), Y0 - 6, 280], { tone: "hi", r: 0.6, bevel: 0.4, name: "soldadura.tapa-ptfe", mat: "ptfe", sinTornillos: true });
      });
      const RES = s < 0 ? ["R41.1", "R41.1.1", "R41.1.2", "R41.1.3", "R41.1.4"] : ["R41.6", "R41.6.1", "R41.6.2", "R41.6.3", "R41.6.4"];
      con({ ...PL, e2: [0, 36, 0], cod: "E7423V1330A0" }, () => {
        RES.forEach((tag, i) => cil("soldadura", [s * 8, Y1 + 6, 236 + i * 8], Y, 4, 1.4, { tone: "mid", name: "soldadura.resistencia", disp: tag }));
      });
      con({ ...PL, e2: [0, 16, 6], cod: "035180201" }, () => {
        const [t0, t1] = sx(4.6, 11.6);
        caja("soldadura", [t0, Y1 + 6, 272], [t1, Y1 + 12, 282], { tone: "mid", r: 0.6, name: "soldadura.caja-bornes", mat: "inox", tornillos: { cara: "+y", solo: "esquinas", margen: 1.2, r: 0.5 } });
      });
      con({ ...PL, e2: [0, 22, 22], cod: "D716722030" }, () => {
        caja("soldadura", [Math.min(s * 5, s * 11), Y1 + 6.5, 282], [Math.max(s * 5, s * 11), Y1 + 11.5, 289], { tone: "hi", r: 0.8, name: "soldadura.harting", mat: "harting" });
      });
      con({ ...PL, e2: [0, 0, 12], cod: s > 0 ? "007160056" : "007160060" }, () => {
        const [l0, l1] = sx(1.2, 4.6);
        caja("soldadura", [l0, Y0 - 4, 282], [l1, Y1 + 4, 283.6], { tone: "hi", r: 0.2, bevel: 0, steps: 1, name: "soldadura.lamina", mat: "inox" });
      });
      for (const y of [Y0 + 10, Y0 + 60, Y1 - 8]) {
        con({ ...PL, e2: [0, 0, 18], cod: "S4A21100231" }, () => cil("soldadura", [s * 10, y, 282], Z, 2, 0.9, { tone: "hi", name: "soldadura.poste-muelle", mat: "inox" }));
        con({ ...PL, e2: [0, 0, 24], cod: "A531503305" }, () => muelle("soldadura", [s * 4.6, y, 282.8], [s, 0, 0], 0, 4.5, 0.55, 8, { name: "soldadura.muelle-lamina", alambre: 0.14, mat: "cromo" }));
      }
      con({ ...PL, e2: [0, 0, -14], cod: "S4A21100232" }, () => {
        caja("soldadura", [Math.min(s * 1.2, s * 12), Y0 - 4, 228.4], [Math.max(s * 1.2, s * 12), Y1 + 4, 230], { tone: "hi", r: 0.2, bevel: 0, steps: 1, name: "soldadura.placa-formato", mat: "inox" });
      });
      con({ ...PL, e2: [s * 12, 0, 0], cod: s > 0 ? "035180141" : "035180137" }, () => {
        const [i0, i1] = sx(12, 14);
        caja("soldadura", [i0, Y0 - 4, 232], [i1, Y1 + 4, 280], { tone: "lo", r: 0.3, name: "soldadura.aislante", sinTornillos: true });
      });

      // ── mordaza: cuerpo de fundicion, paralelogramo, arboles, capota o bandeja ──
      const MO = { sub: `mordaza-${L}`, e1: [s * 62, 30, 0] };
      con({ ...MO, e2: [0, 0, 0], cod: s > 0 ? "03510R015" : "03510R014" }, () => {
        const [c0, c1] = sx(24.8, 42);
        caja("soldadura", [c0, Y0 - 8, 228], [c1, Y1 + 8, 286], { tone: "mid", r: 1.2, bevel: 0.8, name: "soldadura.porta-mordaza", mat: "fundicion", tornillos: { cara, paso: 22, margen: 5, r: 1 } });
      });
      const ESTACIONES = [Y0 + 8, (Y0 + Y1) / 2, Y1 - 8];
      const ARBOLES = ["235.21.222", "235.21.237", "235.21.263"];
      ESTACIONES.forEach((y, i) => {
        // bloque bisagra en la espalda de la placa, con su pasador arriba y abajo
        con({ ...MO, e2: [-s * 12, 0, 0], cod: "235.21.268" }, () => caja("soldadura", [Math.min(s * 14, s * 19), y - 4, 248], [Math.max(s * 14, s * 19), y + 4, 264], { tone: "hi", r: 0.6, bevel: 0.4, name: "soldadura.bloque-bisagra", mat: "inox" }));
        con({ ...MO, e2: [-s * 12, 0, 22], cod: "235.21.242" }, () => cil("soldadura", [s * 16.5, y, 264], Z, 10, 1, { tone: "hi", name: "soldadura.pasador", mat: "cromo" }));
        con({ ...MO, e2: [-s * 12, 0, -20], cod: "235.21.242" }, () => cil("soldadura", [s * 16.5, y, 238], Z, 10, 1, { tone: "hi", name: "soldadura.pasador", mat: "cromo" }));
        // arbol vertical que atraviesa el cuerpo (el que se saca para desmontar la placa, Calibrado p.64)
        con({ ...MO, e2: [0, 0, 46], cod: ARBOLES[i] }, () => cil("soldadura", [s * 23, y - 6, 222], Z, 70, 1.8, { tone: "hi", name: "soldadura.arbol", mat: "cromo" }));
        con({ ...MO, e2: [0, 0, -14], cod: "C482253504" }, () => cil("soldadura", [s * 23, y - 6, 220], Z, 2, 2.8, { tone: "mid", name: "soldadura.tuerca-arbol", mat: "inox" }));
        // bielas cortas (235.21.269) arriba y abajo: del arbol al pasador
        const dl = Math.hypot(6.5, 6);
        const pa = [s * (23 - (6.5 / dl) * 2), y - 6 + (6 / dl) * 2];
        const pb = [s * (16.5 + (6.5 / dl) * 1.2), y - (6 / dl) * 1.2];
        con({ ...MO, e2: [0, 0, 30], cod: "235.21.269" }, () => barra("soldadura", [pa[0], pa[1], 273], [pb[0], pb[1], 273], 1.1, { tone: "mid", name: "soldadura.biela-corta", mat: "inox" }));
        con({ ...MO, e2: [0, 0, -26], cod: "235.21.269" }, () => barra("soldadura", [pa[0], pa[1], 239], [pb[0], pb[1], 239], 1.1, { tone: "mid", name: "soldadura.biela-corta", mat: "inox" }));
      });
      // bielas largas que unen las tres estaciones: 235.21.233 arriba, 235.21.232 abajo
      con({ ...MO, e2: [-s * 12, 0, 34], cod: "235.21.233" }, () => caja("soldadura", [Math.min(s * 15.6, s * 17.4), ESTACIONES[0] - 2, 274.1], [Math.max(s * 15.6, s * 17.4), ESTACIONES[2] + 2, 275.6], { tone: "hi", r: 0.3, name: "soldadura.biela-larga", mat: "inox" }));
      con({ ...MO, e2: [-s * 12, 0, -30], cod: "235.21.232" }, () => caja("soldadura", [Math.min(s * 15.6, s * 17.4), ESTACIONES[0] - 2, 236.4], [Math.max(s * 15.6, s * 17.4), ESTACIONES[2] + 2, 237.9], { tone: "hi", r: 0.3, name: "soldadura.biela-larga", mat: "inox" }));
      // cuna (235.21.227) sobre el cuerpo en el extremo de la pared, con su arbol (235.21.228)
      con({ ...MO, e2: [0, 0, 18], cod: "235.21.227" }, () => caja("soldadura", [Math.min(s * 26, s * 40), 12, 286], [Math.max(s * 26, s * 40), 26, 294], { tone: "hi", r: 1.5, bevel: 0.8, name: "soldadura.cuna", mat: "inox", tornillos: { cara: "+z", solo: "esquinas", margen: 2, r: 0.6 } }));
      con({ ...MO, e2: [0, 0, 30], cod: "235.21.228" }, () => cil("soldadura", [s * 33, 19, 294], Z, 6, 1.4, { tone: "hi", name: "soldadura.arbol-cuna", mat: "cromo" }));
      // izquierda: capota en cuna con lamas (235.21.366, Calibrado p.65); derecha: bandeja (235_21_266)
      if (s > 0) {
        con({ ...MO, e2: [s * 18, 0, 0], cod: "235.21.366" }, () => {
          chapaXZ("soldadura", [[42, 268], [48, 271.5], [48, 286], [42, 286]], Y0 + 2, Y1 - 12, { tone: "mid", name: "soldadura.capota", mat: "inox" });
          for (let i = 0; i < 4; i++) caja("soldadura", [48, Y0 + 14, 273.5 + i * 3], [48.8, Y1 - 24, 274.7 + i * 3], { tone: "lo", r: 0, bevel: 0, steps: 1, name: "soldadura.lama", mat: "oscuro" });
        });
      } else {
        con({ ...MO, e2: [s * 18, 0, 0], cod: "235_21_266" }, () => {
          chapaXZ("soldadura", [[-42, 286], [-46, 286], [-46, 268], [-42, 268]], Y0 + 2, Y1 - 12, { tone: "mid", name: "soldadura.bandeja", mat: "inox" });
          caja("soldadura", [-46.6, Y0 + 20, 276], [-46, Y1 - 30, 278], { tone: "lo", r: 0, bevel: 0, steps: 1, name: "soldadura.ranura-bandeja", mat: "oscuro" });
        });
      }
      con({ ...MO, e2: [s * 18, 8, 0], cod: "C652100840" }, () => cil("soldadura", [s * (s > 0 ? 45 : 44), Y1 - 12, 279], Y, 3, 1.8, { tone: "lo", name: "soldadura.pomo-capota", mat: "negro" }));

      // ── cilindro con fuelle 2M14100317: separa la placa con aire ──
      const CI = { sub: `cilindro-${L}`, e1: [s * 100, 20, 30] };
      con({ ...CI, e2: [-s * 12, 0, 0], cod: "235.21.545" }, () => caja("soldadura", [Math.min(s * 42, s * 48), yc - 4, zc - 4], [Math.max(s * 42, s * 48), yc + 4, zc + 4], { tone: "hi", r: 0.6, name: "soldadura.horquilla", mat: "inox", sinTornillos: true }));
      con({ ...CI, e2: [-s * 4, 0, 0], cod: "235.21.544" }, () => {
        const FF = G.frameAlong([s * 48, yc, zc], [s, 0, 0]);
        const perfil = [[0, 2.4]];
        for (let k2 = 0; k2 < 11; k2++) perfil.push([k2 * 2.5 + 0.6, 3.6], [k2 * 2.5 + 1.9, 2.8]);
        perfil.push([28, 2.8], [28, 2.4]);
        torno("soldadura", FF, perfil, { tone: "lo", name: "soldadura.fuelle", mat: "caucho" });
      });
      con({ ...CI, e2: [0, 0, 0], cod: "P117025125" }, () => {
        cil("soldadura", [s * 76, yc, zc], [s, 0, 0], 2.4, 5.6, { tone: "mid", name: "soldadura.cilindro-tapa", mat: "alu" });
        cil("soldadura", [s * 78.4, yc, zc], [s, 0, 0], 24, 5, { tone: "hi", name: "soldadura.cilindro", mat: "alu", disp: s < 0 ? "Y40.6" : "Y40.7" });
      });
      con({ ...CI, e2: [s * 10, 0, 0], cod: "P117025125" }, () => cil("soldadura", [s * 102.4, yc, zc], [s, 0, 0], 2.4, 5.6, { tone: "mid", name: "soldadura.cilindro-tapa", mat: "alu" }));
      con({ ...CI, e2: [s * 20, 0, 0], cod: "P011300025" }, () => caja("soldadura", [Math.min(s * 104.8, s * 109), yc - 3, zc - 6], [Math.max(s * 104.8, s * 109), yc + 3, zc + 3], { tone: "mid", r: 0.5, name: "soldadura.charnela-cilindro", mat: "inox" }));
      con({ ...CI, e2: [0, 0, 10], cod: "P117025125" }, () => { for (const x of [80, 100]) cil("soldadura", [s * x, yc, zc + 5], Z, 2.4, 1, { tone: "hi", name: "soldadura.racor", mat: "laton" }); });
      con({ ...CI, e2: [0, 0, -12], cod: "P011300025" }, () => caja("soldadura", [Math.min(s * 76, s * 109), yc - 6, zc - 11.6], [Math.max(s * 76, s * 109), yc + 6, zc - 5.4], { tone: "mid", r: 0.5, name: "soldadura.escuadra-cilindro", mat: "inox", tornillos: { cara: "-z", solo: "esquinas", margen: 2, r: 0.6 } }));
      con({ ...CI, e2: [0, -12, -12], cod: "P011300025" }, () => caja("soldadura", [Math.min(s * 105, s * 109), 0, zc - 11.6], [Math.max(s * 105, s * 109), yc - 6, zc - 5.4], { tone: "mid", r: 0.5, name: "soldadura.brazo-cilindro", mat: "inox" }));
      // mangueras de la valvula (Y40.6 / Y40.7) a los dos racores (solo 3D)
      const yv = s < 0 ? -66.5 : -58.5;
      for (const [k3, x] of [[0, 80], [1, 100]]) {
        const dy = k3 * 1.6;
        const ruta = s > 0
          ? [[199.5, yv + dy, 198], [199.5, yv + dy, 212], [194, -2 + dy, 226], [150, 36 + dy, 276], [s * x, 70 + dy, 274], [s * x, 70 + dy, 267.4]]
          : [[199.5, yv + dy, 198], [199.5, yv + dy, 212], [194, -2 + dy, 226], [150, 10 + dy, 300], [100, 9 + dy, 336], [-100, 9 + dy, 336], [-140, 12 + dy, 300], [s * x, 70 + dy, 274], [s * x, 70 + dy, 267.4]];
        tubo("soldadura", ruta, 0.6, { tone: "mid", name: "soldadura.manguera", clase: "manguera", curva: 5, solo3d: true, ride: "bastidor" });
      }
      // cable de calefaccion: del Harting de la placa al conector de la pared (X41 / X42), solo 3D
      const xc = pl(s < 0 ? "X41" : "X42", [s * 135, 18])[0];
      tubo("soldadura", [[s * 8, Y1 + 9, 289], [s * 8, Y1 + 9, 296], [s * 20, Y1 - 10, 310], [xc * 0.7, 40, 306], [xc, 12, 280], [xc, 5, 267]], 0.9, { tone: "lo", name: "soldadura.cable-calefaccion", clase: "cable", curva: 6, solo3d: true });
      // eje que sale de la pared a la cuna, con su brida (va con el bastidor de levas)
      con({ sub: "levas", e1: [0, -60, 70], e2: [0, 18, 0], cod: "M2M14100351" }, () => {
        cil("soldadura", [s * 33, 6, 291], Y, 1.6, 6, { tone: "hi", name: "soldadura.brida-cuna", mat: "inox", extra: pernosCirculo("soldadura", G.frameAlong([s * 33, 7.6, 291], Y), 0, 4.6, 4, { rCabeza: 0.6 }) });
        cil("soldadura", [s * 33, 7.6, 291], Y, 4.4, 2.6, { tone: "hi", name: "soldadura.eje-cuna", mat: "cromo" });
      });
    }
    // Puente 2M14100313: une por arriba los arboles de las dos cunas
    con({ sub: "puente", e1: [0, 10, 60], e2: [0, 0, 0], cod: "07920023" }, () => caja("soldadura", [-29.6, 12, 301], [29.6, 16, 304], { tone: "hi", r: 0.8, bevel: 0.5, name: "soldadura.puente", mat: "inox" }));
    con({ sub: "puente", e1: [0, 10, 60], e2: [0, 0, 8], cod: "C95BU00006" }, () => { for (const x of [-33, 33]) cil("soldadura", [x, 19, 300], Z, 5, 3.4, { tone: "mid", name: "soldadura.casquillo-puente", mat: "bronce" }); });
    // Placas de formado (el molde): guian las dos bandas a la tira entre las placas
    for (const s of [-1, 1]) con({ sub: "formado", e1: [0, 0, 90], e2: [s * 10, 0, 0], cod: "S4M14100110" }, () => caja("soldadura", [s < 0 ? -6 : 1.2, Y0 - 2, 284], [s < 0 ? -1.2 : 6, Y1 + 2, 300], { tone: "hi", r: 0.3, bevel: 0.4, name: "soldadura.placa-formado", mat: "inox" }));
    con({ sub: "codificador", e1: [36, 70, 10], e2: [0, 0, 0], cod: "S4M14100110" }, () => {
      caja("soldadura", [16, Y1 + 8, 248], [30, Y1 + 16, 266], { tone: "hi", r: 1, bevel: 0.5, name: "soldadura.codificador", tornillos: { cara: "+y", solo: "esquinas", margen: 2, r: 0.6 } });
      cil("soldadura", [23, Y1 + 16, 257], Y, 5, 3.6, { tone: "mid", name: "soldadura.pomo-lote" });
    });
    // Sensores: cierre B40.1 / B40.2, PT100 B41.x por la caja de bornes, bloqueo B40.8, presostato B42.1
    con({ sub: "sensores", e1: [0, 40, 24], e2: [0, 0, 0], cod: "B60122POC5" }, () => {
      for (const tag of ["B40.1", "B40.2"]) {
        const lado = Math.sign(pl(tag, [0, 0])[0]) || 1;
        caja("soldadura", [Math.min(lado * 52, lado * 58), Y1 + 10, 240], [Math.max(lado * 52, lado * 58), Y1 + 16, 248], { tone: "mid", r: 0.4, name: "soldadura.soporte-sensor", mat: "inox" });
        sensor("soldadura", tag, [lado * 52, Y1 + 13, 244], [-lado, 0, 0], { largo: 8 });
      }
      caja("soldadura", [-50, 6, 287], [-44, 26, 295], { tone: "mid", r: 0.4, name: "soldadura.soporte-sensor", mat: "inox" });
      sensor("soldadura", "B40.8", [-44, 19, 291], [1, 0, 0], { largo: 3 });
      caja("soldadura", [56, 6, 288], [70, 14, 300], { tone: "hi", r: 1, name: "soldadura.presostato", sensor: "B42.1" });
    });
    for (const tag of ["B41.4", "B41.8"]) {
      const lado = Math.sign(pl(tag, [0, 70])[0]) || 1;
      con({ sub: `plancha-${lado > 0 ? "izq" : "der"}`, e1: [lado * 28, 80, 55], e2: [0, 30, 4], cod: "D7911B600650" }, () => sensor("soldadura", tag, [lado * 8, Y1 + 12, 276], [0, 1, 0], { largo: 4, radio: 1.4 }));
    }
    // Marco frontal de aluminio con el borde almenado (foto), sobre dos montantes
    con({ sub: "marco", e1: [0, 70, -10], e2: [0, 0, 0], cod: "S4M15100110" }, () => {
      caja("soldadura", [-66, Y1 + 16, 229], [66, Y1 + 20, 241], { tone: "hi", r: 0.8, bevel: 0.6, name: "soldadura.marco-frontal", mat: "alu", tornillos: { cara: "+y", paso: 30, margen: 6, r: 0.9 } });
      for (const [x0, x1] of [[-66, -40], [-14, 14], [40, 66]]) caja("soldadura", [x0, Y1 + 16, 241], [x1, Y1 + 20, 249], { tone: "hi", r: 0.8, bevel: 0.6, name: "soldadura.marco-frontal", mat: "alu" });
      for (const s of [-1, 1]) caja("soldadura", [Math.min(s * 66, s * 70), Y1 + 16, zPlaca], [Math.max(s * 66, s * 70), Y1 + 20, 249], { tone: "mid", r: 0.5, name: "soldadura.montante-marco", mat: "alu" });
    });
    // Bastidor de levas de las planchas detras de la pared (M2M14100351; Calibrado p.70-73): caja de
    // fundicion 07P2R041 con reductor, eje 07950324 con dos levas partidas a 180°, palancas con rodillo
    // (07P2R043) y los dos tirantes con resorte (00707R003); sus ejes salen por la pared a las cunas.
    {
      const zL = 280;
      const yL = -41;
      const LV = { sub: "levas", e1: [0, -60, 70] };
      const o = { tone: "mid", r: 0.8, bevel: 0.5, mat: "fundicion", ride: "soldadura", solo3d: true };
      con({ ...LV, e2: [0, 0, -12], cod: "07P2R041" }, () => caja("soldadura", [-70, -60, 263], [70, -22, 266], { ...o, name: "soldadura.bastidor-levas" }));
      con({ ...LV, e2: [0, -14, 0], cod: "07P2R041" }, () => caja("soldadura", [-70, -60, 266], [70, -56, 297], { ...o, name: "soldadura.bastidor-levas" }));
      for (const x of [-70, 66]) con({ ...LV, e2: [x < 0 ? -14 : 14, 0, 0], cod: "07P2R041" }, () => caja("soldadura", [x, -56, 266], [x + 4, -22, 297], { ...o, name: "soldadura.bastidor-levas", tornillos: { cara: x < 0 ? "-x" : "+x", solo: "esquinas", margen: 3, r: 0.8 } }));
      con({ ...LV, e2: [30, 0, 0], cod: "IG27303030" }, () => caja("soldadura", [70, -52, 268], [86, -30, 292], { ...o, name: "soldadura.reductor-levas" }));
      con({ ...LV, e2: [42, 0, 0], cod: "235.21.064" }, () => cil("soldadura", [86, yL, zL], X, 10, 2.5, { tone: "hi", name: "soldadura.entrada-levas", mat: "cromo", ride: "soldadura", solo3d: true }));
      con({ ...LV, e2: [0, 0, 16], cod: "07950324" }, () => { for (const [x0, x1] of [[-66, -55], [-49, 49], [55, 66]]) cil("soldadura", [x0, yL, zL], X, x1 - x0, 3, { tone: "hi", name: "soldadura.eje-levas-planchas", mat: "cromo", ride: "soldadura", solo3d: true }); });
      for (const s of [-1, 1]) {
        con({ ...LV, e2: [s * 12, 0, 16], cod: s > 0 ? "07950333" : "235_21_066" }, () => cil("soldadura", [s < 0 ? -55 : 49, yL, zL + 3], X, 6, 12, { tone: "hi", name: "soldadura.leva-plancha", mat: "inox", ride: "soldadura", solo3d: true }));
        const x = s * 40;
        con({ ...LV, e2: [0, 0, 26], cod: "C066084208" }, () => { for (const y of [-52.6, -25.4]) bola("soldadura", [x, y, 290], 1.4, { tone: "hi", name: "soldadura.rotula-tirante", ride: "soldadura", mat: "cromo", solo3d: true }); });
        con({ ...LV, e2: [0, 0, 26], cod: "235.21.082" }, () => cil("soldadura", [x, -51.2, 290], Y, 24.4, 0.8, { tone: "hi", name: "soldadura.varilla-tirante", ride: "soldadura", mat: "cromo", solo3d: true }));
        con({ ...LV, e2: [0, 0, 32], cod: "060052508" }, () => muelle("soldadura", [x, -48, 290], Y, 0, 16, 2, 7, { name: "soldadura.muelle-tirante", ride: "soldadura", alambre: 0.35, mat: "cromo", solo3d: true }));
        con({ ...LV, e2: [0, 0, 20], cod: "07P2R043" }, () => caja("soldadura", [Math.min(s * 42.5, s * 49), -44, 286], [Math.max(s * 42.5, s * 49), -38, 289], { tone: "mid", r: 0.4, name: "soldadura.palanca-leva", mat: "inox", ride: "soldadura", solo3d: true }));
        con({ ...LV, e2: [0, 12, 12], cod: "07P2R045" }, () => caja("soldadura", [Math.min(s * 33, s * 41.4), -28, 287], [Math.max(s * 33, s * 41.4), -22, 293], { tone: "mid", r: 0.4, name: "soldadura.palanca-salida", mat: "inox", ride: "soldadura", solo3d: true }));
        con({ ...LV, e2: [0, 22, 12], cod: "M2M14100351" }, () => cil("soldadura", [s * 33, -22, 291], Y, 16, 2.6, { tone: "hi", name: "soldadura.eje-salida", mat: "cromo", ride: "soldadura", solo3d: true }));
      }
    }
  }

  // ───────────────────────── 11. ARRASTRE ─────────────────────────
  {
    caja("arrastre", [-40, 6, 198], [40, 16, 226], { tone: "mid", r: 1, bevel: 0.6, name: "arrastre.placa", tornillos: { cara: "+y", solo: "esquinas", margen: 4, r: 1 } });
    for (const s of [-1, 1]) {
      cil("arrastre", [s * 7, 16, 212], Y, 5, 7, { tone: "mid", name: "arrastre.engranaje" });
      eje("arrastre", [s * 7, 21, 212], Y, 107, 3, LIMITES.map((y) => [y - 2.5 - 21, y + 2.5 - 21]), { tone: "hi", name: "arrastre.rodillo", mat: "cromo" });
      for (const y of LIMITES) cil("arrastre", [s * 7, y - 2.5, 212], Y, 5, 6, { tone: "lo", name: "arrastre.rodillo-anillo", mat: "caucho" });
    }
    // Cajon extraible (07P0R008): guias laterales hasta la placa frontal (235.20.038) con su pomo
    // grande; maneta de la excentrica que abre los rodillos (235.20.324 + V703004030)
    for (const [x0, z0] of [[-30, 198], [26, 198], [-38, 222], [34, 222]]) caja("arrastre", [x0, 16, z0], [x0 + 4, 130, z0 + 4], { tone: "hi", r: 0.4, name: "arrastre.guia-cajon", mat: "inox" });
    caja("arrastre", [-38, 130, 196], [38, 134, 236], { tone: "hi", r: 1, bevel: 0.6, name: "arrastre.placa-frontal", mat: "inox", tornillos: { cara: "+y", solo: "esquinas", margen: 3, r: 0.8 } });
    cil("arrastre", [0, 134, 214], Y, 5, 9, { tone: "hi", name: "arrastre.pomo", mat: "negro" });
    caja("arrastre", [16, 134, 226], [30, 136, 230], { tone: "mid", r: 0.4, name: "arrastre.maneta-excentrica", mat: "inox" });
    cil("arrastre", [30, 134, 228], Y, 5, 1.6, { tone: "lo", name: "arrastre.pomo-maneta", mat: "negro" });
  }

  // ───────────────────────── 12. CORTE ─────────────────────────
  {
    caja("corte", [-44, 6, 162], [28, 16, 198], { tone: "mid", r: 1, bevel: 0.6, name: "corte.placa", tornillos: { cara: "+y", solo: "esquinas", margen: 4, r: 1 } });
    caja("corte", [-34, 16, 184], [-28, 124, 196], { tone: "mid", r: 0.6, bevel: 0.4, name: "corte.viga-cartuchos", mat: "inox", tornillos: { cara: "-x", paso: 26, margen: 4, r: 0.7 } });
    for (const y of LIMITES) {
      caja("corte", [-28, y - 3, 186], [-18, y + 3, 194], { tone: "hi", r: 0.8, bevel: 0.4, name: "corte.cartucho", mat: "alu" });
      muelle("corte", [-18, y, 190], X, 0, 7, 1.6, 6, { name: "corte.muelle-cartucho", alambre: 0.3, mat: "cromo" });
      for (const dy of [-1.5, 0.7]) caja("corte", [-11, y + dy, 188], [-4, y + dy + 0.8, 192], { tone: "hi", r: 0.2, bevel: 0, steps: 1, name: "corte.horquilla-cartucho", mat: "inox" });
      cil("corte", [-6, y - 0.5, 190], Y, 1, 5, { tone: "hi", name: "corte.disco-cartucho", mat: "cromo" });
      caja("corte", [-8, y - 1.4, 195], [-4, y + 1.4, 196.4], { tone: "lo", r: 0.3, bevel: 0, name: "corte.fieltro-cartucho", mat: "crema" });
    }
    eje("corte", [7, 16, 190], Y, 110, 3, LIMITES.map((y) => [y - 16 - 1, y - 16 + 1]), { tone: "mid", name: "corte.eje-contraste", mat: "cromo" });
    for (const y of LIMITES) cil("corte", [7, y - 1, 190], Y, 2, 6, { tone: "hi", name: "corte.anillo-contraste", mat: "inox" });
    // Cuchilla horizontal ROTATIVA (Calibrado p.23): hoja sobre un eje que gira una vuelta por
    // ciclo contra la contracuchilla fija; leva y sensor B32.8 marcan el cero del motor M32.1.
    for (const y of [10, 126]) caja("corte", [-24, y, 160], [18, y + 6, 176], { tone: "mid", r: 0.8, bevel: 0.5, name: "corte.lateral-caja", tornillos: { cara: y < 50 ? "-y" : "+y", solo: "esquinas", margen: 3, r: 0.8 } });
    cil("corte", [-9, 16, 170], Y, 110, 3, { tone: "mid", name: "corte.eje-cuchilla" });
    caja("corte", [-6, 18, 169], [-1.2, 124, 171], { tone: "hi", r: 0.2, bevel: 0.2, name: "corte.cuchilla-rotativa" });
    caja("corte", [1, 16, 166], [9, tira.y1 + 4, 174], { tone: "hi", r: 0.3, bevel: 0.4, name: "corte.cuchilla-fija" });
    caja("corte", [9, 16, 164], [18, tira.y1 + 4, 176], { tone: "mid", r: 0.6, name: "corte.porta-fija", tornillos: { cara: "+x", paso: 20, margen: 3, r: 0.8 } });
    cil("corte", [-9, 132, 170], Y, 4, 8, { tone: "hi", name: "corte.leva" });
    caja("corte", [-9, 132, 177], [-5, 136, 179], { tone: "mid", r: 0.3, bevel: 0, name: "corte.leva-marca" });
    caja("corte", [9, tira.y1 + 4, 166], [16, tira.y1 + 6, 174], { tone: "lo", r: 0.5, name: "corte.fieltro" });

    sensor("corte", "B32.8", [Math.max(4, pl("B32.8", [19, 124])[0]), 134, 170], [-1, 0, 0], { largo: 8 });
  }

  // ───────────────────────── 13. PINZAS ─────────────────────────
  // Toma de sobres (S4A08100610): el carro baja por su guia vertical con el cilindro y la biela de
  // juntas esfericas; cada carril tiene su par de dedos con goma que aprieta la fila antes del corte,
  // la baja y la suelta sobre el deslizadero de la cinta.
  {
    caja("pinzas", [-50, 0, 108], [-38, 6, 160], { tone: "mid", r: 0.6, bevel: 0.5, name: "pinzas.guia", mat: "inox", tornillos: { cara: "+y", paso: 24, margen: 4, r: 0.7 } });
    caja("pinzas", [-52, 6, 136], [-34, 18, 158], { tone: "hi", r: 1, bevel: 0.6, name: "pinzas.patin", mat: "bronce", tornillos: { cara: "+y", solo: "esquinas", margen: 2.5, r: 0.7 } });
    caja("pinzas", [-34, 12, 148], [-20, 130, 158], { tone: "mid", r: 1, bevel: 0.6, name: "pinzas.viga", mat: "alu", tornillos: { cara: "+z", paso: 20, margen: 3, r: 0.7 } });
    caja("pinzas", [-34, 130, 148], [14, 134, 158], { tone: "mid", r: 0.6, name: "pinzas.placa-extremo", mat: "alu" });
    caja("pinzas", [8, 16, 148], [14, 130, 158], { tone: "mid", r: 0.6, name: "pinzas.barra-derecha", mat: "alu" });
    for (const y of CARRILES) {
      caja("pinzas", [-20, y - 4, 150], [-7, y + 4, 156], { tone: "mid", r: 0.4, name: "pinzas.brazo", mat: "inox", tornillos: { cara: "+z", solo: "esquinas", margen: 1.2, r: 0.45 } });
      caja("pinzas", [-7, y - 5, 134], [-3, y + 5, 156], { tone: "hi", r: 0.4, bevel: 0.3, name: "pinzas.dedo", mat: "inox" });
      caja("pinzas", [3, y - 5, 134], [8, y + 5, 156], { tone: "hi", r: 0.4, bevel: 0.3, name: "pinzas.dedo", mat: "inox" });
      // gomas de agarre en la cara interior de cada dedo
      caja("pinzas", [-3, y - 4.5, 136], [-2.2, y + 4.5, 146], { tone: "lo", r: 0.2, bevel: 0, steps: 1, name: "pinzas.goma", mat: "caucho" });
      caja("pinzas", [2.2, y - 4.5, 136], [3, y + 4.5, 146], { tone: "lo", r: 0.2, bevel: 0, steps: 1, name: "pinzas.goma", mat: "caucho" });
    }
    cil("pinzas", [-72, 12, 92], Z, 40, 6, { tone: "hi", name: "pinzas.cilindro", mat: "alu" });
    cil("pinzas", [-72, 12, 132], Z, 8, 2, { tone: "mid", name: "pinzas.vastago", mat: "cromo" });
    biela("pinzas", [-72, 12, 143], 3, [-55, 12, 147], 2.6, 1.6, { tone: "mid", name: "pinzas.biela" });
    caja("pinzas", [-80, 0, 84], [-64, 6, 96], { tone: "mid", r: 0.6, name: "pinzas.charnela", mat: "inox" });
    for (const z of [100, 124]) cil("pinzas", [-72, 18, z], Y, 2.4, 1, { tone: "hi", name: "pinzas.racor", mat: "laton" });
  }

  // ───────────────────────── 14. CINTA DE SALIDA ─────────────────────────
  // Corre por debajo del corte y sale por el costado (planta B01: solo se ve el tramo de fuera).
  // Las pinzas sueltan la fila sobre el deslizadero de expulsion (S52.9 vigila su posicion), la
  // cinta (M96A.1) los saca y los laser B52.1-3 controlan cada pista al salir.
  {
    const x0 = -46;
    const x1 = 459;
    const zt = 100;
    const [ya, yb] = [16, 128];
    caja("salida", [x0, ya, zt - 2], [x1, yb, zt], { tone: "hi", r: 1, bevel: 0, steps: 2, name: "salida.lona", crease: "none", clase: "lona" });
    for (const y of [ya - 6, yb]) caja("salida", [x0 - 2, y, zt - 12], [x1 + 4, y + 6, zt + 4], { tone: "mid", r: 0.6, bevel: 0.6, name: "salida.larguero", mat: "inox", tornillos: { cara: y < 50 ? "-y" : "+y", paso: 40, margen: 6, r: 0.9 } });
    for (const x of [x0 + 5, x1 - 2]) cil("salida", [x, ya, zt - 6], Y, yb - ya, 5, { tone: "hi", name: "salida.tambor", mat: "inox" });
    // patas: dentro de la maquina sobre la base, fuera sobre el suelo
    for (const [x, z0] of [[-20, zPlaca], [150, zPlaca], [214, 0], [425, 0]]) for (const y of [ya - 6, yb]) caja("salida", [x, y, z0], [x + 6, y + 6, zt - 12], { tone: "mid", r: 0.5, name: "salida.pata", mat: "inox" });
    for (const x of [214, 425]) caja("salida", [x, ya, 46], [x + 6, yb, 52], { tone: "lo", r: 0.5, name: "salida.travesano", mat: "inox" });
    const [mx2] = pl("M96A.1", [411, 130]);
    caja("salida", [mx2 - 10, yb + 6, zt - 30], [mx2 + 10, yb + 14, zt - 6], { tone: "mid", r: 1, name: "salida.reductor" });
    motorElectrico("salida", [mx2, yb + 14, zt - 18], Y, 22, 8, { name: "salida.motor", disp: "M96A.1", tone: "mid" });
    // guias alineadas con los carriles del papel: cada sobre cae en su pista
    const carrilesCinta = CARRILES;
    for (let i = 1; i < 6; i++) {
      const y = tira.y0 + ((tira.y1 - tira.y0) / 6) * i;
      caja("salida", [30, y - 0.6, zt + 1], [440, y + 0.6, zt + 6], { tone: "mid", r: 0.3, bevel: 0, name: "salida.guia-carril", mat: "inox" });
    }
    for (const x of [26, 436]) caja("salida", [x, ya, zt + 6], [x + 4, yb, zt + 8], { tone: "mid", r: 0.4, name: "salida.puente-guias", mat: "inox" });
    for (const x of [70, 112, 250, 300, 360]) for (const y of carrilesCinta) caja("salida", [x, y - 7, zt], [x + 28, y + 7, zt + 1.4], { tone: "hi", r: 0.6, bevel: 0, name: "salida.sobre", clase: "papel" });
    // Deslizadero de expulsion bajo las pinzas, con sus bordes apoyados en los largueros
    chapaXZ("salida", [[-16, 114], [12, 104.5], [12, 103.5], [-16, 113]], ya, yb, { tone: "hi", name: "salida.deslizadero", mat: "inox" });
    for (const y of [ya - 4, yb]) chapaXZ("salida", [[-16, 104], [12, 104], [12, 107.5], [-16, 117]], y, y + 4, { tone: "mid", name: "salida.borde-deslizadero", mat: "inox" });
    caja("salida", [-4, yb + 6, 96], [0, yb + 10, 108], { tone: "mid", r: 0.3, name: "salida.escuadra-sensor" });
    sensor("salida", "S52.9", [-2, yb + 10, 110], [0, -1, 0], { largo: 4, radio: 1.8 });
    // Portico de los laser B52.1-3 al salir de la maquina
    for (const y of [ya - 12, yb + 6]) caja("salida", [199, y, zt - 12], [204, y + 6, zt + 26], { tone: "mid", r: 0.5, name: "salida.poste-puente", mat: "alu" });
    caja("salida", [199, ya - 12, zt + 22], [204, yb + 12, zt + 26], { tone: "mid", r: 0.4, name: "salida.puente-expulsion", mat: "alu", tornillos: { cara: "+z", solo: "esquinas", margen: 1.5, r: 0.5 } });
    for (const [i, def] of [[1, 61], [2, 74], [3, 91]]) sensor("salida", `B52.${i}`, [pl(`B52.${i}`, [201.5, def])[0], pl(`B52.${i}`, [201.5, def])[1], zt + 22], [0, 0, -1], { largo: 6, radio: 2.4 });
  }

  // ───────────────────────── 15. HMI ─────────────────────────
  // Brazo giratorio sujeto al lateral de la caja (planta B01) que entra por arriba en el panel
  // (S3A95100310): caja honda casi cuadrada, pantalla apaisada arriba, fila de 3 pulsadores y un
  // tapon abajo a la izquierda, seta abajo a la derecha y selector de llave en el costado.
  {
    const piv = [198, -46];
    const fin = [244, 201];
    caja("hmi", [190, piv[1] - 10, 288], [206, piv[1] + 10, 302], { tone: "mid", r: 1, name: "hmi.soporte", mat: "inox", tornillos: { cara: "+x", solo: "esquinas", margen: 3, r: 0.8 } });
    cil("hmi", [piv[0], piv[1], 302], Z, 14, 7, { tone: "hi", name: "hmi.giro", mat: "inox" });
    const d = G.unit3([fin[0] - piv[0], fin[1] - piv[1], 0]);
    const lado = G.unit3(G.cross3(Z, d));
    const F = G.frameOf([piv[0], piv[1], 0], d, lado, Z);
    prisma("hmi", F, [[-5, 316], [5, 316], [5, 326], [-5, 326]], 0, Math.hypot(fin[0] - piv[0], fin[1] - piv[1]) - 7, { tone: "mid", name: "hmi.brazo", mat: "alu" });
    cil("hmi", [fin[0], fin[1], 317.2], Z, 8.8, 7, { tone: "hi", name: "hmi.rotula", mat: "inox" });
    cil("hmi", [fin[0], fin[1], 316], Z, 1.2, 7, { tone: "mid", name: "hmi.brida", mat: "inox", extra: pernosCirculo("hmi", G.frameAlong([fin[0], fin[1], 317.2], Z), 0, 5.6, 6, { rCabeza: 0.5 }) });
    caja("hmi", [204, 190, 238], [284, 211, 316], { tone: "hi", r: 2, bevel: 0.8, name: "hmi.panel", disp: "A15.4", tornillos: { cara: "+y", solo: "esquinas", margen: 2, r: 0.6 } });
    caja("hmi", [210, 211, 276], [278, 211.4, 310], { tone: "lo", r: 0, bevel: 0, steps: 1, name: "hmi.pantalla", clase: "pantalla" });
    for (const [x, mat] of [[216, "negro"], [227, "m12"], [238, "negro"]]) cil("hmi", [x, 211, 256], Y, 1.6, 3.4, { tone: "hi", name: "hmi.pulsador", mat });
    cil("hmi", [249, 211, 256], Y, 0.8, 3.2, { tone: "mid", name: "hmi.tapon", mat: "inox" });
    cil("hmi", [270, 211, 252], Y, 0.6, 7, { tone: "hi", name: "hmi.aro-seta", mat: "amarillo" });
    cil("hmi", [270, 211.6, 252], Y, 4, 4.8, { tone: "hi", name: "hmi.seta", clase: "seta" });
    cil("hmi", [284, 200, 262], X, 2, 2.6, { tone: "hi", name: "hmi.selector-llave", mat: "harting" });
  }

  // ───────────────────────── 16. ARMARIO ─────────────────────────
  // Armario QE1 donde lo pone la planta. Puerta aparte (se abre en el visor 3D) y el
  // interior segun la disposicion B00 del esquema: placa de montaje, lateral y puerta.
  const AR = { x0: 198, x1: 290, y0: -298, y1: -102, z0: 10, z1: 298 };
  {
    caja("armario", [AR.x0 - 2, AR.y0 - 2, 0], [AR.x1 + 2, AR.y1 + 2, AR.z0], { tone: "lo", r: 1, name: "armario.zocalo" });
    // cuerpo hueco (fondo, costados, techo y piso): la puerta cierra el frente
    caja("armario", [AR.x0, AR.y0, AR.z0], [AR.x0 + 3, AR.y1, AR.z1], { tone: "mid", r: 1.2, bevel: 0.8, name: "armario.cuerpo", sinTornillos: true });
    for (const [y0, y1] of [[AR.y0, AR.y0 + 2], [AR.y1 - 2, AR.y1]]) caja("armario", [AR.x0 + 3, y0, AR.z0], [AR.x1 - 3, y1, AR.z1], { tone: "mid", r: 0.6, bevel: 0.5, name: "armario.cuerpo-lado", sinTornillos: true });
    caja("armario", [AR.x0 + 3, AR.y0 + 2, AR.z1 - 2], [AR.x1 - 3, AR.y1 - 2, AR.z1], { tone: "mid", r: 0.6, bevel: 0.5, name: "armario.cuerpo-techo", sinTornillos: true });
    caja("armario", [AR.x0 + 3, AR.y0 + 2, AR.z0], [AR.x1 - 3, AR.y1 - 2, AR.z0 + 2], { tone: "mid", r: 0.6, bevel: 0.5, name: "armario.cuerpo-piso", sinTornillos: true });
    const rejilla = [];
    for (let i = 0; i < 5; i++) {
      const z = 40 + i * 8;
      rejilla.push(Ln(k.pathOf([at([AR.x1 + 0.05, -240, z]), at([AR.x1 + 0.05, -200, z]), at([AR.x1 + 0.05, -200, z + 3]), at([AR.x1 + 0.05, -240, z + 3])], true), { tone: "lo" }));
    }
    caja("armario", [AR.x1 - 3, AR.y0 + 2, AR.z0 + 4], [AR.x1, AR.y1 - 2, AR.z1 - 4], { tone: "mid", r: 0.8, bevel: 0.6, name: "armario.puerta", extra: rejilla.join(""), puerta: true, sinTornillos: true });
    for (const z of [40, 150, 260]) cil("armario", [AR.x1 + 1, AR.y0 + 3, z], Z, 16, 2, { tone: "hi", name: "armario.bisagra" });
    caja("armario", [AR.x1, -140, 220], [AR.x1 + 1, -120, 240], { tone: "hi", r: 0.6, name: "armario.q013-placa", disp: "Q01.3", puerta: true, mat: "amarillo", sinTornillos: true });
    cil("armario", [AR.x1 + 1, -130, 230], X, 4, 7, { tone: "hi", name: "armario.q013", disp: "Q01.3", puerta: true, mat: "maneta" });
    caja("armario", [AR.x1 + 5, -138, 228], [AR.x1 + 8, -122, 232], { tone: "hi", r: 0.8, name: "armario.q013", disp: "Q01.3", puerta: true, mat: "maneta" });
    caja("armario", [AR.x1, -126, 120], [AR.x1 + 4, -120, 170], { tone: "hi", r: 1, name: "armario.manilla", puerta: true });
    caja("armario", [190, -112, 298], [232, -96, 304], { tone: "lo", r: 0.6, name: "armario.bandeja" });
    for (const [z, tag] of [[230, "M02.4"], [60, "M02.5"]]) cil("armario", [218, AR.y0, z], [0, -1, 0], 3, 12, { tone: "hi", name: "armario.ventilador", disp: tag });
    // Interior (solo en 3D): disposicion de la hoja B00 del esquema (pixeles de la imagen de 1500 de
    // ancho). Placa de montaje con rieles DIN y canaletas; cada aparato con su forma: interruptores
    // automaticos por polo con su palanca, contactor, reles, variadores, modulos Beckhoff con LEDs y
    // borneras borne a borne (azul de 0 V, verde y amarillo de tierra); hilos a la canaleta.
    const placa = (px, py) => [AR.y0 + 8 + ((px - 440) / 320) * (AR.y1 - AR.y0 - 16), AR.z1 - 10 - ((py - 150) / 740) * (AR.z1 - AR.z0 - 20)];
    const xp = AR.x0 + 6;
    const RIEL = 1.5;
    caja("armario", [AR.x0 + 3.5, AR.y0 + 6, AR.z0 + 6], [xp, AR.y1 - 6, AR.z1 - 6], { tone: "lo", r: 0, bevel: 0, name: "armario.placa-montaje", solo3d: true, sinTornillos: true, mat: "inox" });
    const o3 = { solo3d: true, sinTornillos: true, r: 0.25, bevel: 0.15, steps: 1 };
    const hilos = [];
    // aparato generico: base = cara de montaje en x, dir = +1 (placa) o -1 (puerta)
    function aparato(tag, tipo, [ya, yb, za, zb], base, dir, fondo, { puerta = false } = {}) {
      const X0 = (d0, d1) => [Math.min(base + dir * d0, base + dir * d1), Math.max(base + dir * d0, base + dir * d1)];
      const nm = `armario.${tag.toLowerCase()}`;
      const op = { ...o3, disp: tag, puerta, clase: "electrico" };
      const bx = (d0, d1, y0, y1, z0, z1, mat, extra = {}) => {
        const [x0, x1] = X0(d0, d1);
        caja("armario", [x0, y0, z0], [x1, y1, z1], { ...op, name: nm, mat, ...extra });
      };
      const h = zb - za;
      const zc = (za + zb) / 2;
      if (tipo === "automatico") {
        const n = Math.max(1, Math.round((yb - ya) / 4.4));
        const w = (yb - ya) / n;
        for (let i = 0; i < n; i++) {
          const y0 = ya + i * w + 0.1;
          const y1 = ya + (i + 1) * w - 0.1;
          bx(0, fondo * 0.72, y0, y1, za, zb, "breaker");
          bx(fondo * 0.72, fondo, y0, y1, zc - h * 0.2, zc + h * 0.2, "breaker");
          bx(fondo, fondo + 1.6, (y0 + y1) / 2 - 0.7, (y0 + y1) / 2 + 0.7, zc + h * 0.02, zc + h * 0.16, "palanca");
        }
        hilos.push([base, dir, fondo * 0.5, (ya + yb) / 2, zb, +1], [base, dir, fondo * 0.5, (ya + yb) / 2, za, -1]);
      } else if (tipo === "contactor") {
        bx(0, fondo * 0.8, ya, yb, za + h * 0.18, zb - h * 0.18, "breaker");
        bx(0, fondo * 0.6, ya, yb, za, za + h * 0.18, "rele");
        bx(0, fondo * 0.6, ya, yb, zb - h * 0.18, zb, "rele");
        bx(fondo * 0.8, fondo, ya + (yb - ya) * 0.25, yb - (yb - ya) * 0.25, zc - h * 0.12, zc + h * 0.12, "rele");
        hilos.push([base, dir, fondo * 0.4, (ya + yb) / 2, zb, +1], [base, dir, fondo * 0.4, (ya + yb) / 2, za, -1]);
      } else if (tipo === "rele") {
        bx(0, fondo, ya + 0.1, yb - 0.1, za, zb, "rele");
        bx(fondo, fondo + 0.4, (ya + yb) / 2 - 0.5, (ya + yb) / 2 + 0.5, zb - 3, zb - 2, "led");
        hilos.push([base, dir, fondo * 0.5, (ya + yb) / 2, zb, +1]);
      } else if (tipo === "plc") {
        bx(0, fondo, ya + 0.05, yb - 0.05, za, zb, "plc");
        bx(fondo, fondo + 0.6, ya + 0.4, yb - 0.4, za + h * 0.12, zb - h * 0.22, "borne");
        for (let k = 0; k < 2; k++) bx(fondo, fondo + 0.3, (ya + yb) / 2 - 0.4, (ya + yb) / 2 + 0.4, zb - 2.2 - k * 1.6, zb - 1.4 - k * 1.6, "led");
        hilos.push([base, dir, fondo * 0.6, (ya + yb) / 2, za, -1]);
      } else if (tipo === "variador") {
        bx(0, fondo * 0.85, ya + 0.2, yb - 0.2, za, zb, "rele");
        bx(fondo * 0.85, fondo, ya + 0.8, yb - 0.8, za + h * 0.08, zb - h * 0.08, "plc");
        bx(fondo, fondo + 0.3, ya + 1.6, yb - 1.6, zb - h * 0.28, zb - h * 0.14, "pantalla");
        hilos.push([base, dir, fondo * 0.4, (ya + yb) / 2, zb, +1], [base, dir, fondo * 0.4, (ya + yb) / 2, za, -1]);
      } else if (tipo === "bornes") {
        const n = Math.max(2, Math.round((yb - ya) / 1.5));
        const w = (yb - ya) / n;
        for (let i = 0; i < n; i++) {
          const mat = i < 2 ? "borneAzul" : i >= n - 2 ? "borneTierra" : "borne";
          bx(0, fondo, ya + i * w + 0.08, ya + (i + 1) * w - 0.08, za, zb, mat);
          if (i % 4 === 1) hilos.push([base, dir, fondo * 0.5, ya + (i + 0.5) * w, zb, +1]);
        }
      } else if (tipo === "fuente") {
        bx(0, fondo, ya, yb, za, zb, "plc");
        for (let k = 0; k < 6; k++) bx(fondo, fondo + 0.3, ya + 1, yb - 1, za + 2 + k * 2.2, za + 2.8 + k * 2.2, "rele");
        hilos.push([base, dir, fondo * 0.5, (ya + yb) / 2, zb, +1]);
      } else bx(0, fondo, ya, yb, za, zb, "plc");
    }
    const enPlaca = (tag, tipo, [a, b, c, dd], fondo, riel = true) => {
      const [ya2, za] = placa(a, dd);
      const [yb2, zb] = placa(c, b);
      aparato(tag, tipo, [Math.min(ya2, yb2), Math.max(ya2, yb2), Math.min(za, zb), Math.max(za, zb)], xp + (riel ? RIEL : 0), 1, fondo);
    };
    // rieles DIN (35 mm) y canaletas ranuradas entre filas
    for (const py of [203, 311, 399, 725, 853]) {
      const [, z] = placa(0, py);
      caja("armario", [xp, AR.y0 + 10, z - 1.75], [xp + RIEL, AR.y1 - 20, z + 1.75], { ...o3, name: "armario.riel-din", mat: "riel" });
    }
    const CANAL = [];
    for (const py of [162, 255, 362, 433, 625, 800, 886]) {
      const [, z] = placa(0, py);
      caja("armario", [xp, AR.y0 + 8, z - 3.5], [xp + 9, AR.y1 - 20, z + 3.5], { ...o3, name: "armario.canaleta", mat: "canaleta" });
      CANAL.push(z);
    }
    caja("armario", [xp, AR.y1 - 19, AR.z0 + 8], [xp + 9, AR.y1 - 10, AR.z1 - 8], { ...o3, name: "armario.canaleta", mat: "canaleta" });
    for (const [tag, x0p, x1p] of [["F01.3", 461, 489], ["F02.4", 500, 526], ["F19.1", 531, 542], ["F19A.1", 543, 553], ["F22.8.1", 564, 576], ["F24.1", 594, 619]]) enPlaca(tag, "automatico", [x0p, 182, x1p, 225], 11);
    enPlaca("KM44.4", "contactor", [694, 181, 719, 225], 13);
    ["K19.1", "K19.2", "K19.3", "K19.4", "K19.5", "K19A.1", "K19A.2", "K19A.3", "K19A.4", "K19A.5"].forEach((tag, i) => enPlaca(tag, "rele", [470 + i * 11.4, 282, 470 + (i + 1) * 11.4 - 1, 341], 11));
    enPlaca("A41.2", "variador", [622, 287, 633, 335], 13);
    enPlaca("A41.6", "variador", [643, 287, 653, 335], 13);
    enPlaca("X01", "bornes", [433, 383, 608, 415], 8);
    enPlaca("A24.2", "variador", [466, 451, 484, 564], 21, false);
    enPlaca("A24.3", "variador", [485, 451, 504, 564], 21, false);
    enPlaca("A24.4", "variador", [505, 451, 524, 564], 21, false);
    const plc = Object.values(CABLEADO.modulos_plc ?? {}).map((m) => m.tag);
    plc.forEach((tag, i) => enPlaca(tag, i === 0 ? "fuente" : "plc", [436 + (i * 160) / plc.length, 690, 436 + ((i + 1) * 160) / plc.length - 0.6, 761], i === 0 ? 14 : 12.5));
    for (const [tag, a2, b2] of [["K10.3", 605, 617], ["K10.4", 618, 630], ["K35.3", 641, 651], ["K35A.3", 652, 662]]) enPlaca(tag, "rele", [a2, 718, b2, 760], 11);
    enPlaca("X06", "bornes", [467, 839, 706, 868], 8);
    // Lateral interior (Q01.3, filtro Z01.2, toma X02.6) en el costado del armario hacia la maquina
    const lateral = (tag, [a2, b2, c2, dd]) => {
      const xa = AR.x0 + 8 + ((a2 - 772) / 94) * (AR.x1 - AR.x0 - 16);
      const xb = AR.x0 + 8 + ((c2 - 772) / 94) * (AR.x1 - AR.x0 - 16);
      const za = AR.z1 - 10 - ((dd - 150) / 740) * (AR.z1 - AR.z0 - 20);
      const zb = AR.z1 - 10 - ((b2 - 150) / 740) * (AR.z1 - AR.z0 - 20);
      caja("armario", [xa, AR.y1 - 14, za], [xb, AR.y1 - 2, zb], { ...o3, name: `armario.${tag.toLowerCase()}`, disp: tag, clase: "electrico", mat: tag.startsWith("Z") ? "plc" : "rele" });
    };
    lateral("Q01.3-int", [790, 297, 827, 335]);
    lateral("Z01.2", [790, 412, 851, 476]);
    lateral("X02.6", [806, 497, 834, 541]);
    // Cara interior de la puerta (gira con ella)
    const enPuerta = (tag, tipo, [a2, b2, c2, dd], fondo = 8) => {
      const ya2 = AR.y1 - 8 - ((a2 - 866) / 364) * (AR.y1 - AR.y0 - 16);
      const yb2 = AR.y1 - 8 - ((c2 - 866) / 364) * (AR.y1 - AR.y0 - 16);
      const za = AR.z1 - 10 - ((dd - 150) / 740) * (AR.z1 - AR.z0 - 20);
      const zb = AR.z1 - 10 - ((b2 - 150) / 740) * (AR.z1 - AR.z0 - 20);
      aparato(tag, tipo, [Math.min(ya2, yb2), Math.max(ya2, yb2), za, zb], AR.x1 - 3, -1, fondo, { puerta: true });
    };
    enPuerta("G04.1", "fuente", [926, 190, 969, 250], 12);
    ["F04.3", "F04.4", "F04.5", "F04.6", "F04.7", "F04.8"].forEach((tag, i) => enPuerta(tag, "automatico", [1022 + i * 8.3, 157, 1022 + (i + 1) * 8.3 - 0.8, 256], 8));
    ["F04.1", "F29.1", "F34.1", "F34A.1", "F37.1", "F96A.1"].forEach((tag, i) => enPuerta(tag, "automatico", [945 + i * 17, 367, 945 + (i + 1) * 17 - 1.5, 412], 8));
    enPuerta("X04", "bornes", [956, 482, 1037, 512], 7);
    enPuerta("X15", "bornes", [1062, 482, 1129, 512], 7);
    enPuerta("K31.5", "rele", [998, 563, 1003, 597], 8);
    enPuerta("K31.6", "rele", [1004, 563, 1009, 597], 8);
    enPuerta("A31.2", "variador", [1026, 560, 1071, 597], 10);
    ["A29.1", "A34.1", "A34A.1", "A37.1", "A96A.1"].forEach((tag, i) => enPuerta(tag, "variador", [933 + i * 29.4, 645, 933 + (i + 1) * 29.4 - 2, 734], 16));
    enPuerta("X07", "bornes", [928, 750, 1064, 765], 7);
    enPuerta("X08", "bornes", [907, 800, 1046, 810], 7);
    // hilos de cada aparato a la canaleta mas cercana (los de la puerta van por su manguera)
    hilos.forEach(([base, dir, d, y, z, sentido], i) => {
      if (dir < 0) return;
      const zs = CANAL.filter((c) => (sentido > 0 ? c > z : c < z));
      if (!zs.length) return;
      const zc2 = sentido > 0 ? Math.min(...zs) - 3.5 : Math.max(...zs) + 3.5;
      if (Math.abs(zc2 - z) < 0.6) return;
      const x = base + d;
      tubo("armario", [[x, y, z], [x, y, zc2]], 0.32, { name: "armario.hilo", curva: 0, solo3d: true, ride: "armario", mat: ["hiloNegro", "hiloAzul", "hiloRojo"][i % 3] });
    });
    // mazo de cables de la puerta (bisagra) y prensaestopas de la bandeja
    tubo("armario", [[AR.x1 - 14, AR.y0 + 2.5, 230], [AR.x1 - 7, AR.y0 + 6, 150], [AR.x1 - 4.5, AR.y0 + 10, 70]], 1.6, { name: "armario.mazo-puerta", curva: 20, solo3d: true, mat: "hiloNegro" });
    for (const y of [-110, -104]) cil("armario", [212, y, AR.z1 - 2], Z, 2, 1.6, { tone: "mid", name: "armario.prensaestopas", solo3d: true, mat: "harting" });
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
    const postes = [[-196, 170], [190, 170], [-196, 2], [190, 2]];
    for (const [x, y] of postes) caja("resguardos", [x, y, zPlaca], [x + 6, y + 6, zt], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.poste" });
    caja("resguardos", [-196, 170, zt], [196, 176, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.travesano" });
    caja("resguardos", [-196, 2, zt], [196, 8, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.travesano" });
    for (const x of [-196, 190]) caja("resguardos", [x, 8, zt], [x + 6, 170, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.larguero" });
    // puertas y laterales de policarbonato (acrilicos) con perfiles y bisagras
    for (const [xa, xb] of [[-190, -2], [2, 190]]) {
      caja("resguardos", [xa, 172, 130], [xb, 174, 464], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.puerta", clase: "vidrio" });
      caja("resguardos", [xa, 171, 126], [xb, 175, 130], { tone: "mid", r: 0.4, name: "resguardos.perfil-puerta" });
      caja("resguardos", [xa, 171, 464], [xb, 175, 468], { tone: "mid", r: 0.4, name: "resguardos.perfil-puerta" });
      const xBis = xa < 0 ? xa + 0.6 : xb - 0.6;
      for (const z of [170, 420]) cil("resguardos", [xBis, 175.2, z], Z, 14, 1.6, { tone: "hi", name: "resguardos.bisagra" });
      const xt = xa < 0 ? xb - 9 : xa + 9;
      tubo("resguardos", [[xt, 174, 346], [xt, 179, 348], [xt, 179, 392], [xt, 174, 394]], 1.2, { tone: "hi", name: "resguardos.tirador", curva: 2, mat: "inox" });
    }
    for (const x of [-195, 191]) caja("resguardos", [x, 8, 130], [x + 4, 170, 464], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.lateral", clase: "vidrio" });
    caja("resguardos", [-190, 8, 468], [190, 170, 470], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.techo", clase: "vidrio" });
    // Resguardo lateral alto del desbobinado (S4A95100110): placa base, dos paneles con dos ventanas
    // cada uno, pomos moleteados en las esquinas y tapa de arriba inclinada
    {
      const [xa, xb] = [176, 179];
      const [ya, yb] = [-176, -108];
      caja("resguardos", [166, ya, zPlaca], [190, yb, zPlaca + 2], { tone: "mid", r: 0.6, ride: "armario", name: "resguardos.panel-base", mat: "inox", tornillos: { cara: "+z", solo: "esquinas", margen: 3, r: 0.8 } });
      for (const [z0, z1] of [[24, 164], [166, 306]]) {
        for (const [y0, y1] of [[ya, ya + 4], [yb - 4, yb]]) caja("resguardos", [xa, y0, z0], [xb, y1, z1], { tone: "mid", r: 0.4, ride: "armario", name: "resguardos.panel-marco", mat: "inox" });
        for (const z of [z0, (z0 + z1) / 2 - 2, z1 - 4]) caja("resguardos", [xa, ya + 4, z], [xb, yb - 4, z + 4], { tone: "mid", r: 0.4, ride: "armario", name: "resguardos.panel-marco", mat: "inox" });
        for (const [w0, w1] of [[z0 + 4, (z0 + z1) / 2 - 2], [(z0 + z1) / 2 + 2, z1 - 4]]) caja("resguardos", [xa + 1.2, ya + 4, w0], [xa + 1.8, yb - 4, w1], { tone: "faint", r: 0, bevel: 0, steps: 1, ride: "armario", name: "resguardos.panel-vidrio", clase: "vidrio" });
        for (const y of [ya + 2, yb - 2]) for (const z of [z0 + 4, z1 - 4]) cil("resguardos", [xb, y, z], X, 2, 1.8, { tone: "lo", ride: "armario", name: "resguardos.panel-pomo", mat: "negro" });
      }
      chapaXZ("resguardos", [[166, 306], [186, 306], [186, 310], [172, 314], [166, 314]], ya, yb, { tone: "mid", ride: "armario", name: "resguardos.panel-tapa", mat: "inox" });
    }
    // interruptores de seguridad Euchner CTP (S08.x)
    // Frente (foto): caja de inox con mirilla delante del corte y, encima, la barra con los dos
    // Euchner CTP de las puertas delanteras (S08.3 / S08.4). Quedan en la maquina al quitar puertas.
    caja("resguardos", [-64, 136, 120], [-62, 162, 198], { tone: "mid", r: 0.4, name: "resguardos.caja-mirilla", mat: "inox" });
    caja("resguardos", [62, 136, 120], [64, 162, 198], { tone: "mid", r: 0.4, name: "resguardos.caja-mirilla", mat: "inox" });
    caja("resguardos", [-64, 162, 120], [64, 164, 136], { tone: "mid", r: 0.4, name: "resguardos.caja-mirilla", mat: "inox" });
    caja("resguardos", [-64, 162, 180], [64, 164, 198], { tone: "mid", r: 0.4, name: "resguardos.caja-mirilla", mat: "inox" });
    for (const [x0, x1] of [[-64, -50], [50, 64]]) caja("resguardos", [x0, 162, 136], [x1, 164, 180], { tone: "mid", r: 0.4, name: "resguardos.caja-mirilla", mat: "inox" });
    caja("resguardos", [-50, 162.5, 136], [50, 163.5, 180], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.mirilla", clase: "vidrio" });
    caja("resguardos", [-60, 150, 198], [60, 164, 202], { tone: "hi", r: 0.6, name: "resguardos.barra-euchner", mat: "alu", tornillos: { cara: "+z", paso: 30, margen: 6, r: 0.7 } });
    caja("resguardos", [-60, 160, 202], [60, 164, 224], { tone: "hi", r: 0.6, name: "resguardos.barra-euchner", mat: "alu" });
    for (const x of [-60, 56]) caja("resguardos", [x, 140, 198], [x + 4, 150, 231], { tone: "mid", r: 0.4, name: "resguardos.escuadra-euchner", mat: "alu" });
    for (const [tag, z] of [["S08.3", 213], ["S08.4", 203]]) {
      const [x] = pl(tag, [0, 163]);
      caja("resguardos", [x - 15, 164, z], [x + 15, 170, z + 9], { tone: "hi", r: 1, bevel: 0.5, name: "resguardos.euchner", disp: tag, mat: "euchner", tornillos: { cara: "+y", solo: "esquinas", margen: 1.5, r: 0.5 } });
      cil("resguardos", [x - 15, 167, z + 4.5], [-1, 0, 0], 3, 1.6, { tone: "hi", name: "resguardos.conector-m12", mat: "m12" });
      // actuador en la puerta, enganchado en la cabeza del interruptor
      caja("resguardos", [x + 8, 170, z + 1], [x + 14, 172, z + 8], { tone: "mid", r: 0.4, name: "resguardos.actuador", mat: "inox" });
    }
    const [, y81] = pl("S08.1", [-201, 144]);
    caja("resguardos", [-201, y81 - 15, 300], [-195, y81 + 15, 309], { tone: "hi", r: 1, name: "resguardos.euchner", disp: "S08.1", mat: "euchner" });
    caja("resguardos", [-201, y81 - 15, 287], [-195, y81 + 15, 296], { tone: "hi", r: 1, name: "resguardos.euchner", disp: "S08.5", mat: "euchner" });
    const [, y82] = pl("S08.2", [154, 115]);
    caja("resguardos", [195, y82 - 15, 300], [201, y82 + 15, 309], { tone: "hi", r: 1, name: "resguardos.euchner", disp: "S08.2", mat: "euchner" });
    const [, y87] = pl("S08.7", [143, 40]);
    caja("resguardos", [195, y87 - 4, 280], [201, y87 + 4, 292], { tone: "hi", r: 1.5, name: "resguardos.rfid", disp: "S08.7", mat: "euchner" });
  }

  // ───────────────────────── 17b. MANIVELAS DE LA PARED ─────────────────────────
  // Fila de 4 manivelas que salen del eje de levas por la pared (foto): disco de inox a ras,
  // placa ranurada color bronce con su rodamiento en la ranura (carrera regulable).
  for (const [x, z] of [[-96, 317], [-48, 317], [0, 317], [48, 317]]) {
    const F = G.frameAlong([x, 0, z], Y);
    cil("motor", [x, 0.3, z], Y, 1.4, 9, { tone: "hi", name: "motor.disco-manivela", mat: "inox", ride: "bastidor", extra: pernosCirculo("motor", G.frameAlong([x, 1.7, z], Y), 0, 7, 3, { rCabeza: 0.6, ride: "bastidor", parte: "motor.disco-manivela" }) });
    caja("motor", [x - 3, 1.7, z - 10], [x + 3, 3.7, z + 10], { tone: "mid", r: 0.6, bevel: 0.3, name: "motor.manivela", mat: "bronce", ride: "bastidor", tornillos: { cara: "+y", solo: "esquinas", margen: 1.2, r: 0.55 } });
    cil("motor", [x, 3.7, z + 6], Y, 3.2, 2.6, { tone: "hi", name: "motor.rodamiento-manivela", mat: "cromo", ride: "bastidor" });
    void F;
  }

  // ───────────────────────── 18. DISPOSITIVOS DEL ESQUEMA ─────────────────────────
  // Lo que la planta del esquema ES4220003 pone detras de la pared o en la maquina y no
  // tenia sitio arriba: servomotores M30.1 y M32.1, M29.1 con B29.6/B29.7, sensores del
  // dosificador B42.x, B18.2, conectores X, piloto H40.3 y transformador T22.8.
  {
    // Servos Beckhoff AM8041 dentro de su tapa de chapa, con reductor en angulo hacia la pared
    const [ax] = pl("M30.1", [-22, -45]);
    caja("arrastre", [ax - 6, -18, 206], [ax + 6, -6.5, 218], { tone: "mid", r: 1, name: "arrastre.reductor-angulo", mat: "alu", ride: "motor", tornillos: { cara: "-y", solo: "esquinas", margen: 2, r: 0.6 } });
    caja("arrastre", [ax - 54, -28, 199], [ax - 6, -6.5, 221], { tone: "hi", r: 1.2, bevel: 0.6, name: "arrastre.tapa-servo", mat: "inox", disp: "M30.1", ride: "motor", tornillos: { cara: "-y", solo: "esquinas", margen: 3, r: 0.7 } });
    caja("corte", [-15, -27, 164], [-3, -15, 176], { tone: "mid", r: 1, name: "corte.reductor-angulo", mat: "alu", ride: "motor", tornillos: { cara: "-y", solo: "esquinas", margen: 2, r: 0.6 } });
    cil("corte", [-9, -15, 170], Y, 9, 2.5, { tone: "mid", name: "corte.eje-cuchilla-atras", mat: "cromo", ride: "motor" });
    caja("corte", [-68, -36, 155], [-15, -6.5, 185], { tone: "hi", r: 1.2, bevel: 0.6, name: "corte.tapa-servo", mat: "inox", disp: "M32.1", ride: "motor", tornillos: { cara: "-y", solo: "esquinas", margen: 3, r: 0.7 } });
    const [ux, uy] = pl("M29.1", [162, -73]);
    motorElectrico("desbobinado", [ux - 4, uy + 16, 150], [0, -1, 0], 32, 10, { name: "desbobinado.motor", disp: "M29.1", ride: "motor" });
    caja("desbobinado", [ux - 18, uy - 4, 158], [ux - 12, uy + 4, 196], { tone: "mid", r: 0.4, name: "desbobinado.escuadra-sensores", ride: "motor" });
    sensor("desbobinado", "B29.6", [ux - 12, uy, 190], [1, 0, 0], { largo: 6, ride: "motor" });
    sensor("desbobinado", "B29.7", [ux - 12, uy, 176], [1, 0, 0], { largo: 6, ride: "motor" });
    for (const [tag, pieza, z] of [["B18.2", "soldadura", 262], ["B42.2", "dosificacion", 286], ["B42.5", "dosificacion", 286], ["B42.6", "dosificacion", 286]]) {
      const [x] = pl(tag, [0, -40]);
      sensor(pieza, tag, [x, -14, z], [0, 1, 0], { largo: 8, ride: "motor" });
    }
    // Conectores enchufables de la maquina (ILME, Harting, M12): no son cajas de bornes
    const conector = (tag, a, b, pieza = "armario", ride = "bastidor") => caja(pieza, a, b, { tone: "hi", r: 1, bevel: 0.4, name: `${pieza}.conector-${tag.toLowerCase()}`, disp: tag, ride, clase: "conector", sinTornillos: true });
    for (const tag of ["X41", "X42"]) {
      const [x] = pl(tag, [0, 19]);
      conector(tag, [x - 6, pared.y1, 236], [x + 6, pared.y1 + 10, 266]);
      caja("armario", [x - 7, pared.y1 + 10, 244], [x + 7, pared.y1 + 12, 258], { tone: "hi", r: 0.6, name: "armario.palanca-harting", mat: "inox", ride: "bastidor" });
    }
    for (const [tag, z] of [["X43", 194], ["X52", 254]]) {
      const [x] = pl(tag, [0, -20]);
      conector(tag, [x - 6, -14, z], [x + 6, pared.y0, z + 12]);
    }
    for (const [tag, z] of [["X46", 194], ["X31", 114]]) {
      const [, y] = pl(tag, [-176, -40]);
      conector(tag, [-184, y - 6, z], [-176, y + 6, z + 12]);
    }
    caja("guias", [-60, 134, 366], [104, 137, 380], { tone: "mid", r: 0.5, name: "guias.regleta-conectores", ride: "guias", mat: "alu" });
    for (const x of [-60, 101]) caja("guias", [x, 134, 380], [x + 3, 137, 386], { tone: "mid", r: 0.4, name: "guias.colgante-regleta", ride: "guias" });
    for (const tag of ["X44", "X45", "X47", "X48", "X49"]) {
      const [x] = pl(tag, [0, 142]);
      conector(tag, [x - 6, 137, 370], [x + 6, 145, 378], "guias", "guias");
    }
    {
      const [x, y] = pl("X53", [4, 102]);
      conector("X53", [x - 7, y - 4, 330], [x + 7, y + 4, 340], "dosificacion", "dosificacion");
      const [, y51] = pl("X51", [-201, 144]);
      conector("X51", [-201, y51 + 6, 270], [-195, y51 + 16, 282], "resguardos", "resguardos");
    }
    // Piloto amarillo H40.3 (fase de mando de plancha) y transformador T22.8 de las resistencias
    const [, hy] = pl("H40.3", [-199, -23]);
    cil("armario", [pared.x0, hy, 280], [-1, 0, 0], 4, 3, { tone: "hi", name: "armario.piloto", disp: "H40.3", clase: "piloto", ride: "bastidor" });
    const [tx, ty] = pl("T22.8", [-173, -101]);
    caja("armario", [Math.max(-184, tx - 14), Math.max(cj.y0 + 2, ty - 10), zPlaca], [Math.max(-184, tx - 14) + 30, Math.max(cj.y0 + 2, ty - 10) + 28, 70], { tone: "hi", r: 2, bevel: 0.6, name: "armario.transformador", disp: "T22.8", ride: "motor" });
  }

  return { pernos: PERNOS };
}
