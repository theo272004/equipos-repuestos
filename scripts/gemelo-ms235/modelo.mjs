// La MS235 pieza por pieza, en el mundo del kit de Anatomy.
// Unidades de 4 mm: x a la derecha del operador, y hacia el operador, z arriba.
// La pared de la maquina esta en y = 0 (cara delantera); detras queda la caja
// de transmision, la bobina y el armario; delante, los grupos de formado.
//
// construir(P, R) dibuja todo para una proyeccion y lo deja en el recorder R.
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import * as A from "./kit/audit.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";
import { PIEZAS } from "./piezas.mjs";

const DEG = Math.PI / 180;
const X = [1, 0, 0];
const Y = [0, 1, 0];
const Z = [0, 0, 1];

// Cotas principales
export const COTAS = {
  piso: 0,
  base: { x: -196, y: -132, w: 392, d: 308, r: 3 }, // placa base del bastidor
  zBase: 10,
  hBase: 12,
  pared: { x0: -190, x1: 190, y0: -6, y1: 0, z0: 22, z1: 330 },
  caja: { y0: -100, y1: -6, z1: 300 }, // caja de transmision detras de la pared
  web: 66, // ancho de cada banda de papel (264 mm)
  zWeb: 352, // altura del papel sobre la pared
  tira: { y0: 30, y1: 96 }, // la tira de sobres entre placas (3 puestos de 22)
};

export function construir(P, R) {
  const V = G.viewOf(P);
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const Dots = (pts, style) => k.dotsSvg(pts.map(at), style);
  const seg = (a, b) => k.segment(a, b, P);

  const moverDe = (pieza) => PIEZAS[pieza].mover;
  function put(pieza, ref, svg, { bias = 0, shapes = [], name, ride, sensor, clase } = {}) {
    return R.put({ piece: pieza, ride: ride ?? pieza, at: ref, centro: ref, bias, svg, move: moverDe(ride ?? pieza), shapes, name: name ?? R.nameFor(`${pieza}.it`), sensor, clase });
  }

  // Caja alineada con los ejes: [x0,y0,z0] a [x1,y1,z1].
  function caja(pieza, [x0, y0, z0], [x1, y1, z1], { tone = "hi", r = 0.8, steps = 3, bevel = 0.5, inner = "", extra = "", name, bias, ride, crease, clase, lit } = {}) {
    const plan = { x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2) };
    const id = R.nameFor(name ?? `${pieza}.caja`);
    const paths = k.slabOf(plan, z0, z1 - z0, P, steps, bevel);
    const shape = R.solid(A.slab(plan, z0, z1 - z0, { name: id }, steps));
    put(pieza, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], S(paths, { tone, inner, crease, className: clase, lit }) + extra, { name: id, shapes: [shape], bias, ride, clase });
    return { plan, z0, z1, id };
  }

  // Cilindro sobre un eje cualquiera, desde el punto o a lo largo de dir.
  function cil(pieza, o, dir, largo, radio, { tone = "hi", name, bias, ride, extra = "", inner = "", bevel = 0, sensor, clase } = {}) {
    const F = G.frameAlong(o, G.unit3(dir));
    const id = R.nameFor(name ?? `${pieza}.cil`);
    const paths = G.disc(0, largo, radio, F, P, bevel ? { bevel } : {});
    const shape = R.solid(A.disc(F, 0, largo, radio, { name: id }));
    put(pieza, G.add3(o, G.mul3(F.a, largo / 2)), S(paths, { tone, inner, className: clase }) + extra, { name: id, shapes: [shape], bias, ride, sensor, clase });
    return { F, id };
  }

  // Pieza torneada: perfil [[s, r], ...] sobre un marco.
  function torno(pieza, F, perfil, { tone = "hi", name, bias, ride, extra = "", inner = "" } = {}) {
    const id = R.nameFor(name ?? `${pieza}.torno`);
    const paths = G.solidOf(perfil, F, P);
    const shape = R.solid(A.solid(F, perfil, { name: id }));
    const mid = (perfil[0][0] + perfil[perfil.length - 1][0]) / 2;
    put(pieza, G.add3(F.o, G.mul3(F.a, mid)), S(paths, { tone, inner }) + extra, { name: id, shapes: [shape], bias, ride });
    return { F, id };
  }

  function bola(pieza, c, radio, { tone = "hi", name, bias, ride } = {}) {
    const id = R.nameFor(name ?? `${pieza}.bola`);
    const shape = R.solid(A.ball(c, radio, { name: id }));
    put(pieza, c, S(G.sphereOf(c, radio, P), { tone }), { name: id, shapes: [shape], bias, ride });
  }

  // Prisma de un poligono convexo en el plano (u, v) de F, extruido a lo largo de F.a.
  function prisma(pieza, F, poli, s0, s1, { tone = "hi", name, bias, ride, extra = "", clase } = {}) {
    const id = R.nameFor(name ?? `${pieza}.prisma`);
    const paths = G.prismOf(F, poli, s0, s1, P);
    const shape = R.solid(A.prism(F, poli, s0, s1, { name: id }));
    const cu = poli.reduce((a, p) => a + p[0], 0) / poli.length;
    const cv = poli.reduce((a, p) => a + p[1], 0) / poli.length;
    const ref = G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.add3(G.mul3(F.u, cu), G.mul3(F.v, cv)));
    put(pieza, ref, S(paths, { tone, className: clase }) + extra, { name: id, shapes: [shape], bias, ride, clase });
    return id;
  }

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

  // Biela entre dos rotulas: la varilla nace y muere en la superficie de cada bola.
  function biela(pieza, c0, r0, c1, r1, radio, opts = {}) {
    const d = G.unit3(G.sub3(c1, c0));
    const a = Math.sqrt(Math.max(0, r0 * r0 - radio * radio));
    const b = Math.sqrt(Math.max(0, r1 * r1 - radio * radio));
    bola(pieza, c0, r0, { name: `${pieza}.rotula`, ride: opts.ride });
    bola(pieza, c1, r1, { name: `${pieza}.rotula`, ride: opts.ride });
    barra(pieza, G.add3(c0, G.mul3(d, a)), G.sub3(c1, G.mul3(d, b)), radio, opts);
  }

  // Barra entre dos puntos.
  function barra(pieza, p0, p1, radio, opts = {}) {
    const d = G.sub3(p1, p0);
    return cil(pieza, p0, d, G.len3(d), radio, opts);
  }

  // Tubo o cable por una ruta; cada trozo se ordena por su cuenta.
  function tubo(pieza, puntos, radio, { tone = "mid", name, bias = 0, ride, curva = 3, maxLength = 24, limp = true } = {}) {
    const id = R.nameFor(name ?? `${pieza}.tubo`);
    const ruta = curva ? G.fillet(puntos, Math.max(curva, radio * 2.6), 10, { P, tube: radio }) : puntos;
    R.route(id, ruta, radio, { piece: pieza, move: moverDe(ride ?? pieza), ride: ride ?? pieza, limp });
    tubePieces(ruta, radio, P, { maxLength }).forEach((parte, i) =>
      put(pieza, parte.mid, tubeSvg(parte, { tone }), { name: `${id}:${i}`, bias, ride, shapes: [A.tube(parte.points, parte.radii)] }),
    );
  }

  // Lamina fina horizontal (papel) con planta poligonal a la altura z.
  function lamina(pieza, anillo, z, { tone = "hi", name, bias, clase = "papel", h = 0.6 } = {}) {
    const id = R.nameFor(name ?? `${pieza}.lamina`);
    const paths = k.extrude(anillo, z, h, P);
    const shape = R.solid(A.extruded(anillo, z, h, { name: id }));
    const cx = anillo.reduce((a, p) => a + p[0], 0) / anillo.length;
    const cy = anillo.reduce((a, p) => a + p[1], 0) / anillo.length;
    put(pieza, [cx, cy, z], S(paths, { tone, crease: "none", className: clase }), { name: id, shapes: [shape], bias, clase });
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
    put(pieza, G.add3(o, G.mul3(F.a, largo / 2)), svg, { name: id, shapes, ride, sensor: sigla });
  }

  // Lazo de cadena o correa entre dos ruedas, en un plano: [a, b] son las
  // coordenadas en ese plano y plano(a, b) las lleva al mundo.
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

  // Tornillos: puntos con anillo en una cara horizontal.
  const tornillosArriba = (puntos, z) => puntos.map(([x, y]) => Ln(k.ring(x, y, 1.6, z, P, 14), { tone: "lo" })).join("") + Dots(puntos.map(([x, y]) => [x, y, z]), { size: 0.45 });
  // Tornillos en una cara vertical normal a y (pared, placas).
  const tornillosFrente = (puntos, y) => Dots(puntos.map(([x, z]) => [x, y, z]), { size: 0.5 });
  const tornillosLado = (puntos, x) => Dots(puntos.map(([y, z]) => [x, y, z]), { size: 0.5 });

  const { base, zBase, hBase, pared, caja: cj, web: W, zWeb, tira } = COTAS;
  const zPlaca = zBase + hBase; // 22: cara de arriba de la base

  // ───────────────────────── 1. BASTIDOR ─────────────────────────
  // Patas niveladoras
  for (const [x, y] of [[-186, -122], [186, -122], [-186, 26], [186, 26], [-186, 166], [186, 166]]) {
    cil("bastidor", [x, y, 0], Z, 2, 8, { tone: "lo", name: "bastidor.pata-disco" });
    cil("bastidor", [x, y, 2], Z, 8, 4.5, { tone: "mid", name: "bastidor.pata" });
  }
  {
    const grooves = Ln(k.planOutline(k.insetPlan(base, 6), zPlaca, P), { tone: "faint" });
    const tor = tornillosArriba(k.corners(base, 12).map(([x, y]) => [x, y]), zPlaca);
    caja("bastidor", [base.x, base.y, zBase], [base.x + base.w, base.y + base.d, zPlaca], { tone: "mid", r: 3, steps: 6, bevel: 1.2, extra: grooves + tor, name: "bastidor.base" });
  }
  // Bandeja de goteo delante de la pared (abertura de la placa del catalogo)
  caja("bastidor", [-110, 120, zPlaca], [150, 160, zPlaca + 2], { tone: "lo", r: 2, name: "bastidor.bandeja", crease: "none" });

  // Pared de la maquina, con bocas de los ejes y tornillos de los grupos
  {
    const boc = [];
    const bocas = [
      [-150, 300, 9], [150, 300, 9], [0, 120, 13], [-120, 90, 8], [120, 90, 8], [-160, 200, 7], [160, 200, 7], [90, 250, 10],
    ];
    for (const [x, z, r] of bocas) boc.push(Ln(k.sideRing([x, pared.y1 + 0.05, z], r, "y", P, 28), { tone: "lo" }));
    const tor = [];
    for (let x = -180; x <= 180; x += 40) tor.push([x, pared.z1 - 6]);
    caja("bastidor", [pared.x0, pared.y0, pared.z0], [pared.x1, pared.y1, pared.z1], { tone: "mid", r: 0.6, bevel: 0.8, extra: boc.join("") + tornillosFrente(tor, pared.y1 + 0.05), name: "bastidor.pared" });
  }
  // Laterales de la caja de transmision
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? pared.x0 : pared.x1 - 6;
    const vent = [];
    for (let i = 0; i < 6; i++) {
      const z = 70 + i * 9;
      const x = s < 0 ? x0 - 0.05 : x0 + 6.05;
      vent.push(Ln(k.pathOf([at([x, -80, z]), at([x, -40, z]), at([x, -40, z + 3]), at([x, -80, z + 3])], true), { tone: "lo" }));
    }
    caja("bastidor", [x0, cj.y0, pared.z0], [x0 + 6, cj.y1, cj.z1], { tone: "mid", r: 0.6, bevel: 0.6, extra: vent.join(""), name: "bastidor.lateral" });
  }
  // Placa CE en el lateral izquierdo
  caja("bastidor", [pared.x0 - 1, -90, 230], [pared.x0, -66, 248], {
    tone: "hi",
    r: 0.4,
    bevel: 0,
    extra: [234, 238, 242].map((z, i) => Ln(seg([pared.x0 - 1.05, -87, z], [pared.x0 - 1.05, -87 + [18, 12, 15][i], z]), { tone: "lo", free: true })).join(""),
    name: "bastidor.placa-ce",
  });

  // ───────────────────────── 2. CARTER ─────────────────────────
  caja("carter", [pared.x0 + 6, cj.y0, cj.z1], [pared.x1 - 6, cj.y1, cj.z1 + 6], {
    tone: "mid",
    r: 1,
    bevel: 0.8,
    extra: Ln(k.planOutline(k.insetPlan({ x: pared.x0 + 6, y: cj.y0, w: 368, d: 94, r: 1 }, 5), cj.z1 + 6, P), { tone: "faint" }) + tornillosArriba([[-170, -92], [170, -92], [-170, -14], [170, -14]], cj.z1 + 6),
    name: "carter.tapa",
  });
  {
    const asa = [];
    asa.push(Ln(k.sideRing([0, cj.y0 - 6.05, 250], 6, "y", P, 20), { tone: "lo" }));
    for (let i = 0; i < 8; i++) {
      const x = -140 + i * 12;
      asa.push(Ln(k.pathOf([at([x, cj.y0 - 6.05, 80]), at([x + 6, cj.y0 - 6.05, 80]), at([x + 6, cj.y0 - 6.05, 130]), at([x, cj.y0 - 6.05, 130])], true), { tone: "lo" }));
    }
    caja("carter", [pared.x0, cj.y0 - 6, pared.z0], [pared.x1, cj.y0, cj.z1 + 6], { tone: "mid", r: 0.6, bevel: 0.8, extra: asa.join(""), name: "carter.trasera" });
  }
  // Muelle de gas de la tapa (2M01100214)
  biela("carter", [-150, cj.y0 - 9, 200], 2.8, [-150, cj.y0 - 14, 288], 2.8, 2.2, { tone: "hi", name: "carter.muelle-gas" });

  // ───────────────────────── 3. MOTOR Y CADENA ─────────────────────────
  {
    // Motor principal (eje x) con aletas, sobre su bancada
    caja("motor", [-152, -80, zPlaca], [-62, -40, 58], { tone: "lo", r: 1, bevel: 0.6, name: "motor.bancada" });
    const F = G.frameAlong([-150, -60, 76], X);
    const aletas = k.fadedSvg(G.ribsOf(F, 4, 40, 18, 22, P, { fade: [0.1, 0.55] }), { tone: "lo" });
    torno("motor", F, [[0, 14], [3, 18], [42, 18], [46, 14], [52, 6]], { tone: "hi", name: "motor.motor", extra: aletas });
    caja("motor", [-140, -70, 94], [-120, -50, 106], { tone: "mid", r: 1, name: "motor.caja-bornes" });
    caja("motor", [-98, -84, 58], [-62, -36, 96], { tone: "mid", r: 2, bevel: 0.8, name: "motor.reductor" });
    cil("motor", [-62, -60, 76], X, 39, 3, { tone: "mid", name: "motor.eje-salida" });
    sensor("motor", "B25.8", [-80, -36, 86], Y, { largo: 8 });
  }
  // Carter de aceite de la cadena
  {
    const nivel = Ln(k.sideRing([-40, -14.95, 40], 4, "y", P, 18), { tone: "mid" });
    caja("motor", [-60, -96, zPlaca], [20, -15, 56], { tone: "mid", r: 2, bevel: 0.8, extra: nivel, name: "motor.carter-aceite" });
  }
  // Ruedas de cadena y cadena en bano de aceite (plano x = -20)
  {
    const c1 = [-60, 76];
    const c2 = [-40, 236];
    cil("motor", [-23, c1[0], c1[1]], X, 6, 16, { tone: "hi", name: "motor.pinon" });
    cil("motor", [-23, c2[0], c2[1]], X, 6, 24, { tone: "hi", name: "motor.corona" });
    tubo("motor", lazo(c1, 18, c2, 26, (y, z) => [-20, y, z], 18), 1.3, { tone: "mid", name: "motor.cadena", curva: 0, maxLength: 7 });
  }
  // Eje de levas con levas, apoyado en los laterales
  const LEVAS = [-120, -60, 30, 90, 140];
  eje("motor", [-176, -40, 236], X, 352, 6, [...LEVAS.map((x) => [x - 4 + 176, x + 4 + 176]), [-23 + 176, -17 + 176]], { tone: "mid", name: "motor.eje-levas" });
  for (const x of LEVAS) cil("motor", [x - 4, -40, 236], X, 8, 20, { tone: "hi", name: "motor.leva" });
  for (const x of [-184, 176]) caja("motor", [x, -50, 224], [x + 8, -30, 248], { tone: "mid", r: 1, name: "motor.soporte-eje" });
  // Bomba y filtro DROPSA
  cil("motor", [30, -80, zPlaca], Z, 26, 7, { tone: "hi", name: "motor.dropsa-bomba" });
  cil("motor", [48, -80, zPlaca], Z, 20, 5, { tone: "mid", name: "motor.dropsa-filtro" });
  tubo("motor", [[30, -80, 48], [30, -80, 62], [10, -80, 62], [-10, -60, 62]], 0.9, { name: "motor.dropsa-tubo", tone: "mid" });
  // Volante manual en el lateral izquierdo (gira con el eje de levas; se queda con el bastidor al desarmar)
  {
    const F = G.frameAlong([pared.x0, -40, 236], [-1, 0, 0]);
    torno("motor", F, [[0, 5], [10, 5], [10, 26], [16, 26], [16, 8], [19, 8]], { tone: "hi", name: "motor.volante", ride: "bastidor", extra: k.dotsSvg(G.dotsOf(F, 16, 18, 6, P, { fade: [0.04, 0.42] }), { size: 0.45 }) });
    const mango = G.pointOf(F, 16, 20, 0.6);
    cil("motor", mango, [-1, 0, 0], 14, 2.4, { tone: "mid", name: "motor.volante-mango", ride: "bastidor" });
    sensor("motor", "B18.3", [pared.x0, -16, 262], [-1, 0, 0], { largo: 8, ride: "bastidor" });
  }

  // ───────────────────────── 4. PORTABOBINAS Y EMPALME ─────────────────────────
  const yEje = -178;
  const zEje = 122;
  const rBob = 62;
  {
    caja("bobina", [-104, -262, 0], [104, -134, 8], { tone: "lo", r: 2, name: "bobina.base", extra: tornillosArriba([[-96, -254], [96, -254], [-96, -142], [96, -142]], 8) });
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -100 : 92;
      caja("bobina", [x0, -196, 8], [x0 + 8, -160, zEje - 10], { tone: "mid", r: 1, bevel: 0.6, name: "bobina.montante" });
      // cojinete de soporte (S4A26100220)
      cil("bobina", [s < 0 ? -102 : 92, yEje, zEje], X, 10, 13, { tone: "hi", name: "bobina.cojinete" });
    }
    // Eje neumatico D74 con valvula de inflado
    eje("bobina", [-116, yEje, zEje], X, 232, 9.25, [[14, 24], [208, 218], [116 - W - 12, 116 + W + 12], [220, 226]], { tone: "mid", name: "bobina.eje" });
    cil("bobina", [-122, yEje, zEje], X, 6, 6, { tone: "hi", name: "bobina.valvula" });
    // Bobina de papel con nucleo
    const F = G.frameAlong([-W, yEje, zEje], X);
    const capas = [24, 34, 44, 54].map((r) => Ln(G.circleOf(F, 2 * W + 0.05, r, P), { tone: "faint" })).join("");
    torno("bobina", F, [[0, 19], [0, rBob], [2 * W, rBob], [2 * W, 19]], { tone: "hi", name: "bobina.bobina", extra: capas });
    for (const s of [-1, 1]) {
      const C = G.frameAlong([s * (W + 12), yEje, zEje], [-s, 0, 0]);
      torno("bobina", C, [[0, 22], [6, 22], [6, 16], [12, 12]], { tone: "mid", name: "bobina.cono" });
    }
    // Correa y freno del portabobinas (S4A26100920)
    cil("bobina", [104, yEje, zEje], X, 6, 15, { tone: "hi", name: "bobina.polea" });
    caja("bobina", [109, yEje - 6, 8], [115, yEje + 6, 28], { tone: "lo", r: 1, name: "bobina.soporte-freno" });
    cil("bobina", [100, yEje, 36], X, 14, 8, { tone: "mid", name: "bobina.freno" });
    tubo("bobina", lazo([yEje, zEje], 16.4, [yEje, 36], 9.4, (y, z) => [106, y, z], 14), 1.1, { tone: "lo", name: "bobina.correa", curva: 0, maxLength: 6 });
    // Mesa de empalme (S4M16100110) detras de la bobina
    caja("bobina", [-84, -258, 160], [84, -244, 164], { tone: "hi", r: 1, bevel: 0.6, name: "bobina.mesa-empalme", extra: Ln(seg([-80, -251, 164.05], [80, -251, 164.05]), { tone: "lo" }) });
    for (const x of [-80, 76]) caja("bobina", [x, -258, 8], [x + 4, -254, 160], { tone: "mid", r: 0.4, name: "bobina.poste-empalme" });
    caja("bobina", [-70, -250, 164], [70, -246, 169], { tone: "mid", r: 0.6, name: "bobina.pisador" });
    sensor("bobina", "B29.8", [-40, -244, 166], [0, 1, -0.35], { largo: 10, radio: 3 });
    sensor("bobina", "B29.9", [60, -248, 169], [0, 0, 1], { largo: 8, radio: 2.4 });
    sensor("bobina", "B31.7", [100, -160, zEje - 6], [0, 1, 0], { largo: 7 });
    sensor("bobina", "B31.8", [-100, -160, zEje - 6], [0, 1, 0], { largo: 7 });
  }

  // ───────────────────────── 5. DESBOBINADO ─────────────────────────
  // Marcos laterales en L detras de la caja, rodillos entre ellos.
  const yD = -122; // cara trasera de los marcos
  {
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -78 : 72;
      caja("desbobinado", [x0, yD, zPlaca], [x0 + 6, yD + 12, 358], { tone: "mid", r: 0.6, bevel: 0.5, name: "desbobinado.marco-vertical" });
      caja("desbobinado", [x0, yD + 12, 344], [x0 + 6, -102, 362], { tone: "mid", r: 0.6, bevel: 0.5, name: "desbobinado.marco-alto" });
    }
    caja("desbobinado", [-72, yD, 40], [72, yD + 6, 48], { tone: "lo", r: 0.6, name: "desbobinado.travesano" });
    const rod = (y, z, r = 5, name = "desbobinado.rodillo") => cil("desbobinado", [-72, y, z], X, 144, r, { tone: "hi", name });
    rod(-140, 200);
    rod(-128, 300);
    rod(-116, 351 - 6 + 1, 6, "desbobinado.rodillo-alto");
    // Balancin de tension con su rodillo
    for (const x of [-71, 66]) barra("desbobinado", [x + 2.5, -128, 300], [x + 2.5, -156, 252], 2, { tone: "mid", name: "desbobinado.balancin" });
    cil("desbobinado", [-66, -156, 252], X, 132, 4.5, { tone: "hi", name: "desbobinado.rodillo-balancin" });
    // Cuchilla circular que parte la banda en dos (sobre el papel, con rodillo contraste debajo)
    cil("desbobinado", [-72, -108, zWeb - 4], X, 144, 4, { tone: "mid", name: "desbobinado.contraste" });
    cil("desbobinado", [-1, -108, zWeb + 9], X, 2, 9, { tone: "hi", name: "desbobinado.cuchilla" });
    eje("desbobinado", [-72, -108, zWeb + 9], X, 144, 2, [[71, 73]], { tone: "mid", name: "desbobinado.eje-cuchilla" });
    sensor("desbobinado", "B29.6", [66, -140, 210], [-1, 0, 0], { largo: 7 });
    sensor("desbobinado", "B29.7", [66, -140, 190], [-1, 0, 0], { largo: 7 });
  }

  // ───────────────────────── 6. PAPEL ─────────────────────────
  // Sube de la bobina por los rodillos y pasa por encima de la pared.
  {
    const vert = (y0, z0, y1, z1, name) => {
      const F = G.frameOf([0, 0, 0], X, Y, Z);
      const t = G.unit3([0, y1 - y0, z1 - z0]);
      const n = [0, -t[2] * 0.3, t[1] * 0.3];
      prisma("film", F, [[y0 - n[1], z0 - n[2]], [y1 - n[1], z1 - n[2]], [y1 + n[1], z1 + n[2]], [y0 + n[1], z0 + n[2]]], -W, W, { tone: "hi", name, clase: "papel" });
    };
    vert(yEje + rBob * 0.2, zEje + rBob * 0.98, -145, 204, "film.subida");
    vert(-145, 204, -160.5, 252, "film.balancin-a");
    vert(-151.5, 252, -133, 300, "film.balancin-b");
    vert(-133, 300, -122, 352, "film.alto");
    // Banda entera hasta la cuchilla
    lamina("film", [[-W, -116], [W, -116], [W, -108], [-W, -108]], zWeb, { name: "film.entera" });
  }
  // Cada media banda: separadores (2.a linea), giro a 45° delante y bajada entre placas.
  const banda = (s) => {
    const sx = (x) => s * x;
    const anillo = (pts) => (s < 0 ? pts : pts.map(([x, y]) => [-x, y]).reverse());
    // tramo 1: de la cuchilla a la barra A
    lamina("film", anillo([[-W, -108], [0, -108], [0, -96], [-W, -30]]), zWeb, { name: "film.media" });
    // tramo 2: entre barras A y B (por debajo)
    lamina("film", anillo([[-75, -96], [0, -96], [-W, -30], [-141, -30]]), zWeb - 7.4, { name: "film.desvio" });
    // tramo 3: de la barra B hasta el giro delantero
    lamina("film", anillo([[-141, -30], [-75, -96], [-75, 96], [-141, 30]]), zWeb, { name: "film.lado" });
    // tramo 4: del giro al rodillo de desvio (por debajo de la barra)
    lamina("film", anillo([[-141, 30], [-14, 30], [-14, 96], [-75, 96]]), zWeb - 7.4, { name: "film.giro" });
    // bajada inclinada hasta la placa de formado
    const F = G.frameOf([0, 0, 0], Y, X, Z);
    const x0 = sx(-10);
    const x1 = sx(-0.9);
    prisma("film", F, [[x0 - 0.3, 340], [x1 - 0.3, 300], [x1 + 0.3, 300], [x0 + 0.3, 340]], tira.y0, tira.y1, { tone: "hi", name: "film.bajada", clase: "papel" });
  };
  banda(-1);
  banda(1);
  // Tira soldada que baja entre placas, rodillos y cuchillas
  caja("film", [-0.9, tira.y0, 176], [0.9, tira.y1, 300], { tone: "hi", r: 0, bevel: 0, steps: 1, name: "film.tira", clase: "papel" });
  // Fila de sobres ya cortados, sostenidos por las pinzas
  for (const y of [41, 63, 85]) caja("film", [-0.9, y - 10.4, 132], [0.9, y + 10.4, 164], { tone: "hi", r: 0, bevel: 0, steps: 1, name: "film.sobre", clase: "papel" });

  // ───────────────────────── 7. GUIAS DE DESVIACION ─────────────────────────
  {
    const zb = zWeb - 4; // eje de las barras
    // Travesanos detras de la pared (2.a linea, sobre los laterales de la caja)
    for (const y of [-97, -24]) {
      for (const x of [-190, 184]) caja("guias", [x, y - 3, cj.z1], [x + 6, y + 3, zWeb + 20], { tone: "mid", r: 0.6, name: "guias.poste" });
      caja("guias", [-190, y - 3, zWeb + 20], [190, y + 3, zWeb + 26], { tone: "mid", r: 0.6, bevel: 0.5, name: "guias.travesano" });
    }
    // Barras separadoras A y B a cada lado, colgadas de los travesanos
    const barraColgada = (p0, p1, colgarInicio = true) => {
      barra("guias", [p0[0], p0[1], zb], [p1[0], p1[1], zb], 3, { tone: "hi", name: "guias.barra" });
      for (const p of colgarInicio ? [p0, p1] : [p1]) caja("guias", [p[0] - 2, p[1] - 2, zb + 3], [p[0] + 2, p[1] + 2, zWeb + 20], { tone: "mid", r: 0.4, name: "guias.colgante" });
    };
    for (const s of [-1, 1]) {
      // la barra A nace en el centro, sobre el papel: va en voladizo desde fuera
      barraColgada([s * 2, -94], [s * 72, -24], false);
      barraColgada([s * 74, -97], [s * 147, -24]);
    }
    // Brazos delanteros desde la pared y travesanos delanteros
    for (const x of [-170, 164]) {
      caja("guias", [x, 0, 300], [x + 6, 8, zWeb + 20], { tone: "mid", r: 0.6, name: "guias.mensula" });
      caja("guias", [x, 8, zWeb + 14], [x + 6, 116, zWeb + 20], { tone: "mid", r: 0.6, bevel: 0.5, name: "guias.brazo" });
    }
    for (const y of [10, 110]) caja("guias", [-164, y, zWeb + 14], [164, y + 6, zWeb + 20], { tone: "mid", r: 0.6, bevel: 0.5, name: "guias.travesano-delantero" });
    // Barras de giro a 45° (S4M17)
    for (const s of [-1, 1]) {
      const p0 = [s * 147, 24];
      const p1 = [s * 69, 102];
      const dg = G.unit3([p1[0] - p0[0], p1[1] - p0[1], 0]);
      barra("guias", G.add3([p0[0], p0[1], zb], G.mul3(dg, 4.5)), G.sub3([p1[0], p1[1], zb], G.mul3(dg, 4.5)), 3.2, { tone: "hi", name: "guias.giro" });
      caja("guias", [p0[0] - 2, 14, zb + 3], [p0[0] + 2, 18, zWeb + 14], { tone: "mid", r: 0.4, name: "guias.colgante" });
      caja("guias", [p0[0] - 2, 16, zb - 2], [p0[0] + 2, p0[1] + 2, zb + 4], { tone: "mid", r: 0.4, name: "guias.horquilla" });
      caja("guias", [p1[0] - 2, 104, zb + 3], [p1[0] + 2, 108, zWeb + 14], { tone: "mid", r: 0.4, name: "guias.colgante" });
      caja("guias", [p1[0] - 2, p1[1] - 2, zb - 2], [p1[0] + 2, 108, zb + 4], { tone: "mid", r: 0.4, name: "guias.horquilla" });
      // Rodillo de desvio que baja la banda (eje y)
      const xr = s * 14;
      cil("guias", [xr, 22, 340], Y, 82, 4, { tone: "hi", name: "guias.rodillo" });
      for (const y of [16, 104]) caja("guias", [xr - 3, y, 336], [xr + 3, y + 6, zWeb + 14], { tone: "mid", r: 0.5, name: "guias.placa-rodillo" });
    }
  }

  // ───────────────────────── 8. FOTOCELULA ─────────────────────────
  {
    caja("fotocelula", [164, 60, zWeb + 20], [170, 72, zWeb + 34], { tone: "mid", r: 0.5, name: "fotocelula.soporte" });
    caja("fotocelula", [140, 60, zWeb + 30], [164, 72, zWeb + 34], { tone: "mid", r: 0.5, name: "fotocelula.brazo" });
    caja("fotocelula", [126, 58, zWeb + 6], [142, 74, zWeb + 30], {
      tone: "hi",
      r: 1.2,
      bevel: 0.6,
      name: "fotocelula.cuerpo",
      extra: Ln(k.sideRing([134, 74.05, zWeb + 18], 3.5, "y", P, 18), { tone: "mid" }),
    });
    sensor("fotocelula", "B30.10", [134, 66, zWeb + 6], [0, 0, -1], { largo: 4, radio: 3 });
    tubo("fotocelula", [[142, 66, zWeb + 26], [152, 66, zWeb + 26], [164, 66, zWeb + 26]], 0.7, { name: "fotocelula.cable", tone: "lo", curva: 0 });
  }

  // ───────────────────────── 9. DOSIFICACION ─────────────────────────
  {
    // Cassette desmontable bajo la estrella
    caja("dosificacion", [-12, 26, 362], [12, 100, 372], {
      tone: "mid",
      r: 1.2,
      bevel: 0.6,
      name: "dosificacion.cassette",
      extra: tornillosArriba([[-8, 32], [8, 32], [-8, 94], [8, 94]], 372),
    });
    // Boquillas entre las dos bandas, una por puesto
    for (const y of [41, 63, 85]) cil("dosificacion", [0, y, 312], Z, 50, 2.2, { tone: "hi", name: "dosificacion.boquilla" });
    // Valvula estrella doble (eje y)
    const F = G.frameAlong([0, 24, 388], Y);
    torno("dosificacion", F, [[0, 10], [2, 16], [78, 16], [80, 10]], {
      tone: "hi",
      name: "dosificacion.estrella",
      inner: [26, 52].map((s) => G.arcOf(F, s, 16, P)).join(""),
    });
    for (const y of [20, 104]) cil("dosificacion", [0, y, 388], Y, 4, 18, { tone: "mid", name: "dosificacion.tapa-estrella" });
    // Polea y correa dentada de la estrella, motorreductor
    cil("dosificacion", [0, 108, 388], Y, 5, 9, { tone: "hi", name: "dosificacion.polea" });
    caja("dosificacion", [20, 30, 372], [58, 36, 428], { tone: "mid", r: 1, bevel: 0.6, name: "dosificacion.soporte-motor" });
    caja("dosificacion", [12, 30, 362], [58, 36, 372], { tone: "mid", r: 0.8, name: "dosificacion.pie-motor" });
    cil("dosificacion", [44, 36, 414], Y, 72, 9, { tone: "mid", name: "dosificacion.motor" });
    cil("dosificacion", [44, 108, 414], Y, 5, 6, { tone: "hi", name: "dosificacion.polea-motor" });
    tubo("dosificacion", lazo([0, 388], 10.2, [44, 414], 7.2, (x, z) => [x, 110.5, z], 14), 0.9, { tone: "lo", name: "dosificacion.correa", curva: 0, maxLength: 6 });
    // Tolva conica y mirilla
    const T = G.frameAlong([0, 63, 404], Z);
    torno("dosificacion", T, [[0, 10], [6, 10], [40, 42], [46, 42], [46, 40]], { tone: "hi", name: "dosificacion.tolva", inner: G.arcOf(T, 26, 29, P, { slope: 32 / 34 }) });
    const rT = (s) => 10 + (32 * (s - 6)) / 34 + 0.4;
    sensor("dosificacion", "B35.1", G.pointOf(T, 34, rT(34), 0.9), G.radialOf(T, 0.9), { largo: 8, radio: 3 });
    sensor("dosificacion", "B35.4", G.pointOf(T, 16, rT(16), 0.9), G.radialOf(T, 0.9), { largo: 8, radio: 3 });
    sensor("dosificacion", "B35A.1", G.pointOf(T, 34, rT(34), 2.4), G.radialOf(T, 2.4), { largo: 8, radio: 3 });
    sensor("dosificacion", "B35A.4", G.pointOf(T, 16, rT(16), 2.4), G.radialOf(T, 2.4), { largo: 8, radio: 3 });
  }

  // ───────────────────────── 10. SOLDADURA ─────────────────────────
  {
    // Placa de anclaje (S4M15) sobre la pared
    // La placa de anclaje (S4M15) queda atornillada a la pared al desarmar: arrastre y corte van montados en ella.
    caja("soldadura", [-74, 0, 160], [74, 6, 306], {
      tone: "mid",
      r: 1,
      bevel: 0.8,
      ride: "bastidor",
      name: "soldadura.placa-anclaje",
      extra: tornillosFrente([[-68, 166], [68, 166], [-68, 300], [68, 300], [-68, 233], [68, 233]], 6.05),
    });
    for (const s of [-1, 1]) {
      const sx = (a, b) => (s < 0 ? [-b, -a] : [a, b]);
      // placa soldante caliente
      const [p0, p1] = sx(1.2, 9);
      caja("soldadura", [p0, tira.y0 - 4, 230], [p1, tira.y1 + 4, 282], {
        tone: "hi",
        r: 0.4,
        bevel: 0.6,
        name: "soldadura.placa-soldante",
        extra: Dots([[(p0 + p1) / 2, tira.y1 + 4.05, 240], [(p0 + p1) / 2, tira.y1 + 4.05, 272]], { size: 0.8, tone: "hi" }),
      });
      // aislante y porta-mordaza
      const [i0, i1] = sx(9, 13);
      caja("soldadura", [i0, tira.y0 - 2, 232], [i1, tira.y1 + 2, 280], { tone: "lo", r: 0.3, name: "soldadura.aislante" });
      const [c0, c1] = sx(13, 32);
      caja("soldadura", [c0, tira.y0 - 6, 236], [c1, tira.y1 + 6, 276], { tone: "mid", r: 1, bevel: 0.8, name: "soldadura.porta-mordaza" });
      // bloque fijo con la membrana (L=149) y su racor
      const [b0, b1] = sx(58, 66);
      caja("soldadura", [b0, tira.y0 - 6, 232], [b1, tira.y1 + 6, 280], { tone: "mid", r: 1, bevel: 0.6, name: "soldadura.bloque-fijo" });
      caja("soldadura", [b0, 6, 232], [b1, tira.y0 - 6, 280], { tone: "mid", r: 0.8, name: "soldadura.mensula" });
      const [m0, m1] = sx(66, 76);
      caja("soldadura", [m0, 44, 244], [m1, 82, 268], { tone: "hi", r: 4, steps: 6, bevel: 0.6, name: "soldadura.membrana" });
      cil("soldadura", [s * 76, 63, 256], [s, 0, 0], 4, 2.4, { tone: "mid", name: "soldadura.racor" });
      // guias y tirantes con muelle (eje x) entre porta-mordaza y bloque fijo
      for (const y of [tira.y0 + 2, tira.y1 - 2]) {
        for (const z of [242, 270]) {
          const xa = s * 32;
          const xb = s * 58;
          cil("soldadura", [xa, y, z], [s, 0, 0], 26, 2.2, { tone: "hi", name: "soldadura.tirante" });
          const c = k.coil(Math.min(xa, xb) + 3, Math.max(xa, xb) - 3, [y, z], 4, 5, "x", P);
          const ax = [s, 0, 0];
          const lejos = G.unit3(G.mul3(G.sub3(V, G.mul3(ax, G.dot3(V, ax))), -1));
          const lado = G.unit3(G.cross3(ax, lejos));
          // media corona (no medio disco): el tirante pasa por dentro sin tocarla
          const media = () => {
            const arco = (r, a0, a1) => Array.from({ length: 13 }, (_, i) => {
              const t = a0 + ((a1 - a0) * i) / 12;
              return [r * Math.cos(t), r * Math.sin(t)];
            });
            return [...arco(4.4, -Math.PI / 2, Math.PI / 2), ...arco(3.6, Math.PI / 2, -Math.PI / 2)];
          };
          const Fa = G.frameOf([xa, y, z], ax, lejos, lado);
          const Ff = G.frameOf([xa, y, z], ax, G.mul3(lejos, -1), G.mul3(lado, -1));
          put("soldadura", G.add3([s * 45, y, z], G.mul3(lejos, 3)), Ln(c.back, { tone: "lo" }), { name: R.nameFor("soldadura.muelle-atras"), shapes: [R.solid(A.prism(Fa, media(), 3, 23, { name: "soldadura.muelle" }))] });
          put("soldadura", G.sub3([s * 45, y, z], G.mul3(lejos, 3)), Ln(c.front, { tone: "mid" }), { name: R.nameFor("soldadura.muelle-frente"), shapes: [R.solid(A.prism(Ff, media(), 3, 23, { name: "soldadura.muelle" }))] });
        }
      }
      // sonda PT100 y su cable a la placa de anclaje
      tubo("soldadura", [[s * 5, tira.y0 - 4, 282], [s * 5, tira.y0 - 10, 296], [s * 20, 7, 296]], 0.6, { tone: "lo", name: "soldadura.pt100" });
      sensor("soldadura", s < 0 ? "B40.1" : "B40.2", [s * 46, tira.y1 + 6, 278], [0, 0, 1], { largo: 7 });
    }
    // Placa de formado sobre las mordazas
    for (const s of [-1, 1]) caja("soldadura", [s < 0 ? -6 : 1.2, tira.y0 - 2, 284], [s < 0 ? -1.2 : 6, tira.y1 + 2, 300], { tone: "hi", r: 0.3, bevel: 0.4, name: "soldadura.placa-formado" });
    // Codificador de lote (sufridera) en la mordaza derecha
    caja("soldadura", [16, tira.y1 + 6, 248], [30, tira.y1 + 14, 266], { tone: "hi", r: 1, bevel: 0.5, name: "soldadura.codificador" });
    cil("soldadura", [23, tira.y1 + 14, 257], Y, 5, 3.6, { tone: "mid", name: "soldadura.pomo-lote", extra: "" });
    sensor("soldadura", "B41.8", [-30, 6, 296], [0, 1, 0], { largo: 8 });
    sensor("soldadura", "B18.2", [30, 6, 296], [0, 1, 0], { largo: 8 });
  }

  // ───────────────────────── 11. ARRASTRE ─────────────────────────
  {
    caja("arrastre", [-40, 6, 198], [40, 16, 226], { tone: "mid", r: 1, bevel: 0.6, name: "arrastre.placa", extra: tornillosFrente([[-34, 202], [34, 202], [-34, 222], [34, 222]], 16.05) });
    for (const s of [-1, 1]) {
      cil("arrastre", [s * 7, 16, 212], Y, 5, 7, { tone: "mid", name: "arrastre.engranaje" });
      const F = G.frameAlong([s * 7, 22, 212], Y);
      const ranuras = [12, 34, 56].map((t) => Ln(G.arcOf(F, t + 8, 6, P), { tone: "faint" })).join("");
      torno("arrastre", F, [[-1, 3], [0, 3], [0, 6], [82, 6], [82, 3], [84, 3]], { tone: "hi", name: "arrastre.rodillo", extra: ranuras });
    }
    // palanca de presion con muelle
    barra("arrastre", [-26, 16, 226], [-26, 102, 226], 1.6, { tone: "mid", name: "arrastre.palanca" });
    caja("arrastre", [-30, 102, 210], [-22, 108, 228], { tone: "mid", r: 0.6, name: "arrastre.soporte-palanca" });
  }

  // ───────────────────────── 12. CORTE ─────────────────────────
  {
    caja("corte", [-44, 6, 162], [28, 16, 198], { tone: "mid", r: 1, bevel: 0.6, name: "corte.placa" });
    // Cuchillas circulares (separan los puestos) y rodillo contraste
    eje("corte", [-14, 16, 190], Y, 90, 2.4, [[52 - 16 - 0.6, 52 - 16 + 0.6], [74 - 16 - 0.6, 74 - 16 + 0.6]], { tone: "mid", name: "corte.eje-circulares" });
    for (const y of [52, 74]) cil("corte", [-14, y - 0.6, 190], Y, 1.2, 13.2, { tone: "hi", name: "corte.circular" });
    cil("corte", [7, 16, 190], Y, 90, 6, { tone: "hi", name: "corte.contraste" });
    // Cuchilla horizontal: fija a la derecha, movil a la izquierda en su carro
    caja("corte", [1, tira.y0 - 6, 166], [9, tira.y1 + 6, 174], { tone: "hi", r: 0.3, bevel: 0.4, name: "corte.cuchilla-fija" });
    caja("corte", [9, tira.y0 - 6, 164], [22, tira.y1 + 6, 176], { tone: "mid", r: 0.6, name: "corte.porta-fija" });
    caja("corte", [-10, tira.y0 - 6, 166], [-1, tira.y1 + 6, 174], { tone: "hi", r: 0.3, bevel: 0.4, name: "corte.cuchilla-movil" });
    caja("corte", [-26, tira.y0 - 6, 164], [-10, tira.y1 + 6, 176], { tone: "mid", r: 0.6, name: "corte.carro" });
    for (const y of [tira.y0 + 4, tira.y1 - 4]) cil("corte", [-26, y, 170], [-1, 0, 0], 18, 2, { tone: "hi", name: "corte.guia" });
    caja("corte", [-50, tira.y0 - 6, 162], [-44, tira.y1 + 6, 178], { tone: "mid", r: 0.6, name: "corte.tope" });
    caja("corte", [-50, 16, 162], [-44, tira.y0 - 6, 178], { tone: "mid", r: 0.6, name: "corte.mensula" });
    // Fieltro limpiacuchillas
    caja("corte", [9, tira.y1 + 6, 166], [16, tira.y1 + 10, 174], { tone: "lo", r: 0.5, name: "corte.fieltro" });
    sensor("corte", "B32.8", [-38, 16, 196], [0, 1, 0], { largo: 8 });
  }

  // ───────────────────────── 13. PINZAS ─────────────────────────
  {
    // Guia vertical en la pared y patin
    caja("pinzas", [-50, 0, 88], [-38, 6, 160], { tone: "mid", r: 0.6, bevel: 0.5, name: "pinzas.guia" });
    caja("pinzas", [-52, 6, 136], [-34, 18, 158], { tone: "hi", r: 1, bevel: 0.6, name: "pinzas.patin" });
    // Viga porta-pinzas y barra derecha unidas por placas de extremo
    caja("pinzas", [-34, 16, 148], [-20, 110, 158], { tone: "mid", r: 1, bevel: 0.6, name: "pinzas.viga" });
    caja("pinzas", [-34, 110, 148], [14, 114, 158], { tone: "mid", r: 0.6, name: "pinzas.placa-extremo" });
    caja("pinzas", [8, 20, 148], [14, 110, 158], { tone: "mid", r: 0.6, name: "pinzas.barra-derecha" });
    for (const y of [41, 63, 85]) {
      caja("pinzas", [-20, y - 5, 150], [-7, y + 5, 156], { tone: "mid", r: 0.4, name: "pinzas.brazo" });
      caja("pinzas", [-7, y - 6, 134], [-3, y + 6, 156], { tone: "hi", r: 0.4, bevel: 0.3, name: "pinzas.dedo" });
      caja("pinzas", [3, y - 6, 134], [8, y + 6, 156], { tone: "hi", r: 0.4, bevel: 0.3, name: "pinzas.dedo" });
    }
    // Cilindro neumatico (S4A08100610) con rotulas (S4A71100310)
    cil("pinzas", [-72, 12, 92], Z, 40, 6, { tone: "hi", name: "pinzas.cilindro", inner: "" });
    cil("pinzas", [-72, 12, 132], Z, 8, 2, { tone: "mid", name: "pinzas.vastago" });
    biela("pinzas", [-72, 12, 143], 3, [-55, 12, 147], 2.6, 1.6, { tone: "mid", name: "pinzas.biela" });
    caja("pinzas", [-80, 0, 84], [-64, 6, 96], { tone: "mid", r: 0.6, name: "pinzas.charnela" });
    tubo("pinzas", [[-78, 12, 100], [-90, 12, 100], [-90, 12, 70], [-90, 0, 70]], 0.9, { tone: "lo", name: "pinzas.aire" });
  }

  // ───────────────────────── 14. CINTA DE SALIDA ─────────────────────────
  {
    const x0 = -46;
    const x1 = 330;
    const zt = 100;
    caja("salida", [x0, 22, zt - 2], [x1, 104, zt], { tone: "hi", r: 1, bevel: 0, steps: 2, name: "salida.lona", crease: "none", extra: [40, 120, 200, 280].map((x) => Ln(seg([x, 22, zt + 0.05], [x, 104, zt + 0.05]), { tone: "faint" })).join("") });
    for (const y of [16, 104]) caja("salida", [x0 - 4, y, zt - 12], [x1 + 4, y + 6, zt + 4], { tone: "mid", r: 0.6, bevel: 0.6, name: "salida.larguero", extra: tornillosLado([[y + 3, zt - 4]].map(([a, b]) => [a, b]), x1 + 4.05) });
    for (const x of [x0 + 2, x1 - 2]) cil("salida", [x, 22, zt - 6], Y, 82, 5, { tone: "hi", name: "salida.tambor" });
    for (const x of [150, 300]) for (const y of [16, 104]) caja("salida", [x, y, x < 196 ? zPlaca : 0], [x + 6, y + 6, zt - 12], { tone: "mid", r: 0.5, name: "salida.pata" });
    for (const x of [150, 300]) caja("salida", [x, 22, 46], [x + 6, 104, 52], { tone: "lo", r: 0.5, name: "salida.travesano" });
    cil("salida", [x1 - 2, 118, zt - 6], Y, 24, 8, { tone: "mid", name: "salida.motor" });
    caja("salida", [x1 - 12, 110, zt - 18], [x1 + 8, 118, zt + 4], { tone: "mid", r: 1, name: "salida.reductor" });
    // guias de carril sobre la cinta, colgadas de los largueros
    for (const y of [51.5, 73.5]) caja("salida", [40, y - 0.6, zt + 1], [300, y + 0.6, zt + 6], { tone: "mid", r: 0.3, bevel: 0, name: "salida.guia-carril" });
    for (const x of [44, 290]) caja("salida", [x, 22, zt + 6], [x + 4, 104, zt + 8], { tone: "mid", r: 0.4, name: "salida.puente-guias" });
    // sobres sobre la cinta
    for (const x of [60, 110, 160, 210, 260]) for (const y of [30, 52, 74]) caja("salida", [x, y + 1, zt], [x + 22, y + 21, zt + 1.4], { tone: "hi", r: 0.6, bevel: 0, name: "salida.sobre" });
    // rechazo: fotocelulas laser y soplador
    sensor("salida", "B52.1", [240, 104, zt + 8], [0, -1, 0], { largo: 6, radio: 2.6 });
    sensor("salida", "B52.2", [250, 104, zt + 8], [0, -1, 0], { largo: 6, radio: 2.6 });
    sensor("salida", "B52.3", [260, 104, zt + 8], [0, -1, 0], { largo: 6, radio: 2.6 });
  }

  // ───────────────────────── 15. HMI ─────────────────────────
  {
    caja("hmi", [204, 154, 0], [222, 172, 4], { tone: "lo", r: 2, name: "hmi.base" });
    cil("hmi", [213, 163, 4], Z, 300, 5, { tone: "mid", name: "hmi.columna" });
    cil("hmi", [213, 163, 304], Z, 10, 7, { tone: "hi", name: "hmi.giro" });
    const F = G.frameOf([213, 163, 0], G.unit3([1, 0.6, 0]), G.unit3([-0.6, 1, 0]), Z);
    prisma("hmi", F, [[-5, 314], [5, 314], [5, 324], [-5, 324]], 0, 57, { tone: "mid", name: "hmi.brazo" });
    // pantalla Siemens IPC477E 15" mirando al operador
    caja("hmi", [236, 196, 300], [316, 208, 362], {
      tone: "hi",
      r: 2,
      bevel: 0.8,
      name: "hmi.panel",
      extra:
        Ln(k.pathOf([at([242, 208.05, 306]), at([300, 208.05, 306]), at([300, 208.05, 356]), at([242, 208.05, 356])], true), { tone: "mid" }) +
        Dots([[308, 208.05, 350], [308, 208.05, 342], [308, 208.05, 334]], { size: 1, tone: "mid" }),
    });
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
    cil("armario", [304, -140, 230], X, 4, 8, { tone: "hi", name: "armario.q013" });
    caja("armario", [304, -134, 120], [308, -128, 170], { tone: "hi", r: 1, name: "armario.manilla" });
    // bandeja de cables hasta la caja de transmision
    caja("armario", [190, -100, 296], [250, -90, 302], { tone: "lo", r: 0.6, name: "armario.bandeja" });
    caja("armario", [244, -114, 296], [250, -100, 302], { tone: "lo", r: 0.6, name: "armario.bandeja" });
  }


  // ───────────────────────── 16b. NEUMATICA (lateral derecho) ─────────────────────────
  {
    const x0 = pared.x1;
    caja("armario", [x0, -90, 150], [x0 + 4, -20, 210], { tone: "mid", r: 0.6, name: "armario.placa-neumatica", ride: "bastidor" });
    for (let i = 0; i < 4; i++) {
      const y = -84 + i * 14;
      caja("armario", [x0 + 4, y, 176], [x0 + 16, y + 10, 200], { tone: "hi", r: 0.8, bevel: 0.4, name: "armario.electrovalvula", ride: "bastidor" });
      cil("armario", [x0 + 16, y + 5, 194], X, 3, 2.2, { tone: "mid", name: "armario.bobina-ev", ride: "bastidor" });
    }
    caja("armario", [x0 + 4, -86, 166], [x0 + 14, -30, 176], { tone: "mid", r: 0.6, name: "armario.colector", ride: "bastidor" });
    // filtro regulador SMC AFM30 con su vaso
    caja("armario", [x0 + 4, -14, 186], [x0 + 16, -2, 198], { tone: "hi", r: 1, name: "armario.regulador", ride: "bastidor" });
    torno("armario", G.frameAlong([x0 + 10, -8, 186], [0, 0, -1]), [[0, 5], [16, 4.2, 1], [20, 2.4, 1], [22, 0]], { tone: "hi", name: "armario.vaso-filtro", ride: "bastidor" });
    cil("armario", [x0 + 10, -8, 198], Z, 4, 3.2, { tone: "mid", name: "armario.mano-regulador", ride: "bastidor" });
  }

  // ───────────────────────── 17. RESGUARDOS ─────────────────────────
  {
    const zt = 470;
    const postes = [[-196, 170], [190, 170], [-196, 8], [190, 8]];
    for (const [x, y] of postes) caja("resguardos", [x, y, zPlaca], [x + 6, y + 6, zt], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.poste" });
    caja("resguardos", [-196, 170, zt], [196, 176, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.travesano" });
    caja("resguardos", [-196, 8, zt], [196, 14, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.travesano" });
    for (const x of [-196, 190]) caja("resguardos", [x, 14, zt], [x + 6, 170, zt + 6], { tone: "mid", r: 0.8, bevel: 0.5, name: "resguardos.larguero" });
    // puertas de policarbonato (casi transparentes)
    caja("resguardos", [-190, 172, 130], [-2, 174, 464], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.puerta", clase: "vidrio" });
    caja("resguardos", [2, 172, 130], [190, 174, 464], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.puerta", clase: "vidrio" });
    for (const x of [-195, 191]) caja("resguardos", [x, 14, 130], [x + 4, 170, 464], { tone: "faint", r: 0, bevel: 0, steps: 1, name: "resguardos.lateral", clase: "vidrio" });
    // interruptores Euchner
    caja("resguardos", [-8, 174, 300], [-2, 180, 316], { tone: "hi", r: 0.8, name: "resguardos.euchner" });
    caja("resguardos", [2, 174, 300], [8, 180, 316], { tone: "hi", r: 0.8, name: "resguardos.euchner" });
  }
}
