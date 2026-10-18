// La NJP-3500 pieza por pieza, en milímetros.
//
// x a la derecha del operador, y hacia el operador (frente), z arriba; el centro del
// bastidor en x = 0, y = 0 y el suelo en z = 0. De dónde sale cada cota está en el README.
//
// Fuentes: foto njp3500.png (proporciones, carcasa, posiciones de tolvas, HMI y baliza),
// manual del fabricante (PDF): p.24 medidas y datos, p.27 vista general, p.33 planta de la
// línea (posición del plato y del disco dosificador), y las láminas de cada conjunto.
//
// construir() devuelve { items, pernos }:
//   items: piezas con sus formas (las del kit de Anatomy: prism, body, ball, tube) y su
//          material; con ellas se audita el montaje y se dibuja el 3D.
//   pernos: tornillería, por grupos con su normal; el visor la dibuja como instancias.
import * as A from "../gemelo-ms235/kit/audit.mjs";
import * as G from "../gemelo-ms235/kit/lathe.mjs";
import { roundedPlan } from "../gemelo-ms235/kit/iso-kit.mjs";
import { PIEZAS } from "./piezas.mjs";

const X = [1, 0, 0];
const Y = [0, 1, 0];
const Z = [0, 0, 1];
const RAD = Math.PI / 180;

// ── Cotas principales ──
// Cuerpo 1435 × 1248 × 1960 mm (ficha comercial; el manual da 1555 × 1165 × 2040 con el brazo).
export const COTAS = {
  ancho: 1435,
  fondo: 1248,
  alto: 1960,
  mesa: 880, // cara de la mesa de trabajo: borde claro de la foto a 870 mm del suelo
  zocalo: [60, 140],
  columna: { x: 642, y: 549, r: 75 }, // esquinas redondeadas: la ventana llega casi al canto (foto)
  techo: 1865, // el techo es una franja de ~95 mm sobre la ventana (foto)
  plato: { c: [-160, -40], r: 326, estaciones: 12, alojamientos: 25 }, // planta p.33
  disco: { c: [340, -40], r: 240, rAloj: 175 }, // planta p.33: el disco pasa bajo el plato
};
const XB = COTAS.ancho / 2; // 717,5
const YB = COTAS.fondo / 2; // 624
const ZM = COTAS.mesa;
const CT = COTAS.plato.c;
const CD = COTAS.disco.c;
const RT = COTAS.plato.r;

// Estaciones del plato (gira en sentido horario visto desde arriba, p.33): ángulo en planta.
const ANG = (k) => 120 - 30 * k;
export const ESTACIONES = {
  carga: 0, // carga y separación por vacío (frente izquierda, bajo la tolva de cápsulas)
  dosificacion: 4, // el molde inferior pasa sobre el disco dosificador (derecha)
  rechazo: 6,
  cierre: 8,
  descarga: 10, // canal de salida por el lateral izquierdo (foto)
  limpieza: 11,
};

export function construir() {
  const items = [];
  const pernos = [];
  const usados = new Map();
  const nombre = (base) => {
    const n = (usados.get(base) ?? 0) + 1;
    usados.set(base, n);
    return n === 1 ? base : `${base}#${n}`;
  };
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

  // Una pieza: varias formas que se dibujan juntas y se auditan como una sola.
  function put(pieza, base, formas, { mat = "inox", clase, sensor, geo3d, mover } = {}) {
    if (!PIEZAS[pieza]) throw new Error(`conjunto desconocido ${pieza}`);
    const id = nombre(`${pieza}.${base}`);
    const caja = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    for (const f of formas) {
      const b = A.boundsOf(f);
      for (let i = 0; i < 3; i++) {
        caja.min[i] = Math.min(caja.min[i], b.min[i]);
        caja.max[i] = Math.max(caja.max[i], b.max[i]);
      }
    }
    items.push({ name: id, piece: pieza, shapes: formas, geo3d, mat, clase, sensor, sub: CTX.sub, mover: mover ?? CTX.mover, caja, centro: caja.min.map((v, i) => +((v + caja.max[i]) / 2).toFixed(1)) });
    return id;
  }

  // ── Formas ──
  // Caja con las aristas verticales redondeadas (radio r).
  const fCaja = ([x0, y0, z0], [x1, y1, z1], r = 0) => A.slab({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, {}, r > 30 ? 10 : 4);
  const caja = (pieza, base, a, b, { r = 0, ...o } = {}) => put(pieza, base, [fCaja(a, b, r)], o);
  // Prisma de un polígono en el plano (u, v) de un marco, entre s0 y s1 a lo largo de F.a.
  const fPrisma = (F, poli, s0, s1) => A.prism(F, poli, s0, s1);
  const prisma = (pieza, base, F, poli, s0, s1, o) => put(pieza, base, [fPrisma(F, poli, s0, s1)], o);
  // Cilindro desde o a lo largo de dir.
  const fCil = (o, dir, largo, r) => A.disc(G.frameAlong(o, G.unit3(dir)), 0, largo, r);
  const cil = (pieza, base, o, dir, largo, r, o2) => put(pieza, base, [fCil(o, dir, largo, r)], o2);
  const fVert = ([x, y], z0, z1, r) => fCil([x, y, z0], Z, z1 - z0, r);
  const vert = (pieza, base, xy, z0, z1, r, o) => put(pieza, base, [fVert(xy, z0, z1, r)], o);
  // Pieza torneada: perfil [[s, r], ...] desde el eje; o una cáscara (polígono cerrado sin eje).
  const torno = (pieza, base, o, dir, perfil, op) => put(pieza, base, [A.solid(G.frameAlong(o, G.unit3(dir)), perfil)], op);
  const cascara = (pieza, base, o, dir, anillo, op) => put(pieza, base, [A.body(G.frameAlong(o, G.unit3(dir)), anillo)], op);
  const barraF = (p0, p1, r) => fCil(p0, G.sub3(p1, p0), G.len3(G.sub3(p1, p0)), r);
  const barra = (pieza, base, p0, p1, r, o) => put(pieza, base, [barraF(p0, p1, r)], o);
  const bola = (pieza, base, c, r, o) => put(pieza, base, [A.ball(c, r)], o);
  function tubo(pieza, base, puntos, r, { curva = 3, ...o } = {}) {
    const ruta = curva ? G.fillet(puntos, Math.max(curva, r * 2.6), 10) : puntos;
    return put(pieza, base, [A.tube(ruta, r)], o);
  }

  // Marco de una estación del plato: u tangente (sentido de giro), v radial hacia fuera.
  function marcoEst(k, radio = RT) {
    const a = ANG(k) * RAD;
    const v = [Math.cos(a), Math.sin(a), 0];
    const u = [Math.sin(a), -Math.cos(a), 0]; // horario
    const o = [CT[0] + radio * v[0], CT[1] + radio * v[1], 0];
    const en = (uu, vv, z = 0) => [o[0] + u[0] * uu + v[0] * vv, o[1] + u[1] * uu + v[1] * vv, z];
    // caja en ejes (u, v, z) de la estación
    const fC = ([u0, v0, z0], [u1, v1, z1]) => A.prism({ o: [o[0], o[1], 0], a: Z, u, v }, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], z0, z1);
    return { a, u, v, o, en, fC };
  }

  // ── Tornillería ──
  function tornillos(pieza, parte, puntos, normal, { r = 5, tipo = "hex" } = {}) {
    if (!puntos.length) return;
    const mv = items.find((it) => it.name === parte)?.mover;
    pernos.push({ pieza, ride: pieza, parte, n: normal, r, tipo, ...(mv ? { mv } : {}), pts: puntos.map((p) => p.map((v) => +v.toFixed(2))) });
  }
  // En círculo sobre una cara horizontal (normal +z o -z).
  const enCirculo = (c, radio, n, z, fase = 0) => Array.from({ length: n }, (_, i) => {
    const t = fase * RAD + (i * 2 * Math.PI) / n;
    return [c[0] + radio * Math.cos(t), c[1] + radio * Math.sin(t), z];
  });
  // En las esquinas de una cara rectangular de una caja alineada.
  function esquinas(pieza, parte, [x0, y0, z0], [x1, y1, z1], cara, { m = 15, r = 5, tipo } = {}) {
    const eje = cara[1];
    const sg = cara[0] === "+" ? 1 : -1;
    const fija = { x: sg > 0 ? x1 : x0, y: sg > 0 ? y1 : y0, z: sg > 0 ? z1 : z0 }[eje];
    const [ua, ub] = { x: [[y0, y1], [z0, z1]], y: [[x0, x1], [z0, z1]], z: [[x0, x1], [y0, y1]] }[eje];
    const pts = [];
    for (const a of [ua[0] + m, ua[1] - m]) for (const b of [ub[0] + m, ub[1] - m]) pts.push(eje === "x" ? [fija, a, b] : eje === "y" ? [a, fija, b] : [a, b, fija]);
    const n = eje === "x" ? [sg, 0, 0] : eje === "y" ? [0, sg, 0] : [0, 0, sg];
    tornillos(pieza, parte, pts, n, { r, tipo });
  }

  // Sector de corona en planta (polígono), centro c, radios r0..r1, ángulos a0..a1 (grados).
  const sector = (c, r0, r1, a0, a1, pasos = 8) => {
    const out = [];
    for (let i = 0; i <= pasos; i++) {
      const t = (a0 + ((a1 - a0) * i) / pasos) * RAD;
      out.push([c[0] + r1 * Math.cos(t), c[1] + r1 * Math.sin(t)]);
    }
    for (let i = pasos; i >= 0; i--) {
      const t = (a0 + ((a1 - a0) * i) / pasos) * RAD;
      out.push([c[0] + r0 * Math.cos(t), c[1] + r0 * Math.sin(t)]);
    }
    return out;
  };
  const SUELO = { o: [0, 0, 0], a: Z, u: X, v: Y };
  // Chapas y vidrios entre las columnas redondas: el borde sigue el arco de la columna, así
  // la chapa apoya en ella sin meterse. Frente/atrás: franja en y (signo sy); lados: en x.
  const Cc = COTAS.columna;
  const arcoCol = (t) => Cc.x - Math.sqrt(Math.max(0, Cc.r * Cc.r - (t - Cc.y) ** 2));
  const arcoColY = (t) => Cc.y - Math.sqrt(Math.max(0, Cc.r * Cc.r - (t - Cc.x) ** 2));
  function franjaFrente(sy, ya, yb, x0 = null, x1 = null, n = 8) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const y = yb - ((yb - ya) * i) / n;
      pts.push([x1 ?? arcoCol(y), sy * y]);
    }
    for (let i = 0; i <= n; i++) {
      const y = ya + ((yb - ya) * i) / n;
      pts.push([x0 ?? -arcoCol(y), sy * y]);
    }
    return pts;
  }
  function franjaLado(sx, xa, xb, y0 = null, y1 = null, n = 8) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = xb - ((xb - xa) * i) / n;
      pts.push([sx * x, y1 ?? arcoColY(x)]);
    }
    for (let i = 0; i <= n; i++) {
      const x = xa + ((xb - xa) * i) / n;
      pts.push([sx * x, y0 ?? -arcoColY(x)]);
    }
    return pts;
  }
  const chapa = (pieza, base, poli, z0, z1, o) => put(pieza, base, [A.prism(SUELO, poli, z0, z1)], o);
  // Puntos (alojamientos) sobre una cara horizontal: discos negros muy finos.
  const alojamientos = (puntos, z, r) => puntos.map(([x, y]) => A.disc({ o: [x, y, z], a: Z, u: X, v: Y }, 0, 0.8, r));
  const arcoPuntos = (c, radio, a0, a1, n) => Array.from({ length: n }, (_, i) => {
    const t = (a0 + ((a1 - a0) * i) / Math.max(1, n - 1)) * RAD;
    return [c[0] + radio * Math.cos(t), c[1] + radio * Math.sin(t)];
  });

  // ════════════════ BASTIDOR ════════════════
  const C = COTAS.columna;
  con({ sub: "bast-base" }, () => {
    // Patas niveladoras (foto: tacos negros en las cuatro esquinas)
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) {
        const xy = [sx * 600, sy * 500];
        vert("bastidor", "pata-taco", xy, 0, 22, 42, { mat: "caucho" });
        vert("bastidor", "pata-esparrago", xy, 22, 60, 12, { mat: "cromo" });
        put("bastidor", "pata-tuerca", [A.prism({ o: [xy[0], xy[1], 0], a: Z, u: X, v: Y }, Array.from({ length: 6 }, (_, i) => [22 * Math.cos((i * Math.PI) / 3), 22 * Math.sin((i * Math.PI) / 3)]), 40, 52)], { mat: "cromo" });
      }
    caja("bastidor", "zocalo", [-700, -606, 60], [700, 606, 140], { r: 110, mat: "zocalo" });
    caja("bastidor", "piso", [-690, -596, 140], [690, 596, 160], { r: 100, mat: "galvanizado" });
  });
  con({ sub: "bast-columnas" }, () => {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) vert("bastidor", "columna", [sx * C.x, sy * C.y], 140, COTAS.techo, C.r, { mat: "carcasa" });
  });
  con({ sub: "bast-mesa" }, () => {
    // Mesa de trabajo de inox: el filo claro entre el cuerpo inferior y la ventana (foto)
    caja("bastidor", "mesa", [-722, -630, ZM - 20], [722, 630, ZM], { r: 80, mat: "inox" });
    caja("bastidor", "techo", [-722, -630, COTAS.techo], [722, 630, COTAS.alto], { r: 80, mat: "carcasa" });
    // Vigas del techo entre columnas
    chapa("bastidor", "viga-frente", franjaFrente(1, 606, 624), 1845, COTAS.techo, { mat: "carcasa" });
    chapa("bastidor", "viga-atras", franjaFrente(-1, 606, 624), 1845, COTAS.techo, { mat: "carcasa" });
    for (const sx of [-1, 1]) chapa("bastidor", "viga-lado", franjaLado(sx, 697, 717), 1845, COTAS.techo, { mat: "carcasa" });
    // Fondo de la zona de trabajo (se ve claro detrás de las tolvas en la foto)
    chapa("bastidor", "fondo-trabajo", franjaFrente(-1, 610, 624), ZM, 1845, { mat: "pintado" });
    chapa("bastidor", "tapa-atras", franjaFrente(-1, 604, 624), 160, ZM - 20, { mat: "carcasa" });
    // Lateral izquierdo bajo la ventana, abierto donde sale el canal de cápsulas (foto: repisa a la izquierda)
    chapa("bastidor", "faja-izq", franjaLado(-1, 697, 717, null, -95), ZM, 1080, { mat: "carcasa" });
    chapa("bastidor", "faja-izq", franjaLado(-1, 697, 717, 15, null), ZM, 1080, { mat: "carcasa" });
    caja("bastidor", "faja-izq-dintel", [-717, -95, 1062], [-697, 15, 1080], { mat: "carcasa" });
    // Placa del modelo en la viga del frente (foto: arriba a la derecha)
    caja("bastidor", "placa-modelo", [330, 630, 1888], [520, 633, 1936], { mat: "placa" });
  });
  tornillos("bastidor", "bastidor.placa-modelo", [[340, 633, 1912], [510, 633, 1912]], [0, 1, 0], { r: 3, tipo: "allen" });

  // ════════════════ TAPAS DE LA TRANSMISIÓN ════════════════
  con({ sub: "tapas" }, () => {
    const fr = chapa("paneles", "tapa-frente", franjaFrente(1, 604, 624), 160, ZM - 20, { mat: "carcasa" });
    for (const sx of [-1, 1]) cil("paneles", "cerradura", [sx * 520, 624, 790], Y, 9, 15, { mat: "cromo" });
    esquinas("paneles", fr, [-575, 604, 160], [575, 624, ZM - 20], "+y", { m: 22, r: 4.5, tipo: "allen" });
    for (const sx of [-1, 1]) {
      const p = [sx > 0 ? 697 : -717, -470, 160];
      const q = [sx > 0 ? 717 : -697, 470, ZM - 20];
      const t = chapa("paneles", "tapa-lado", franjaLado(sx, 697, 717), 160, ZM - 20, { mat: "carcasa", mover: [sx * 560, 0, 0] });
      esquinas("paneles", t, p, q, sx > 0 ? "+x" : "-x", { m: 22, r: 4.5, tipo: "allen" });
      cil("paneles", "cerradura", [sx * 717, 380, 790], [sx, 0, 0], 9, 15, { mat: "cromo", mover: [sx * 560, 0, 0] });
    }
  });

  // ════════════════ VENTANAS Y PUERTAS ════════════════
  con({ sub: "puertas" }, () => {
    for (const sx of [-1, 1]) {
      const x0 = sx > 0 ? 3 : -575;
      const x1 = sx > 0 ? 575 : -3;
      chapa("resguardos", "puerta-vidrio", franjaFrente(1, 610, 618, sx > 0 ? 3 : null, sx > 0 ? null : -3), ZM + 10, 1840, { mat: "vidrio", clase: "vidrio" });
      // Tirador vertical negro junto al centro (vista general p.27)
      const xt = sx * 70;
      cil("resguardos", "tirador", [xt, 648, 1260], Z, 300, 11, { mat: "negro" });
      for (const z of [1290, 1530]) cil("resguardos", "tirador-pie", [xt, 618, z], Y, 30, 8, { mat: "negro" });
      // Bisagras contra la columna
      for (const z of [1000, 1700]) vert("resguardos", "bisagra", [sx * 590, 622], z, z + 60, 10, { mat: "negro" });
    }
  });
  con({ sub: "ventanas" }, () => {
    chapa("resguardos", "ventana-der", franjaLado(1, 702, 712), ZM + 5, 1845, { mat: "vidrio", clase: "vidrio", mover: [620, 0, 0] });
    chapa("resguardos", "ventana-izq", franjaLado(-1, 702, 712), 1080, 1845, { mat: "vidrio", clase: "vidrio", mover: [-620, 0, 0] });
  });

  // ════════════════ PLATO GIRATORIO Y MOLDES ════════════════
  const NE = COTAS.plato.estaciones;
  con({ sub: "plato-base" }, () => {
    const brida = torno("torreta", "brida", [CT[0], CT[1], ZM], Z, [[0, 170], [20, 170], [20, 120]], { mat: "inox" });
    tornillos("torreta", brida, enCirculo(CT, 148, 8, ZM + 20, 22.5), [0, 0, 1], { r: 6 });
    torno("torreta", "manguito", [CT[0], CT[1], ZM + 20], Z, [[0, 112], [80, 112], [80, 96], [100, 96]], { mat: "inox" });
    torno("torreta", "soporte-plato", [CT[0], CT[1], ZM + 120], Z, [[0, 262], [22, 262]], { mat: "inox" });
  });
  con({ sub: "plato-moldes" }, () => {
    for (let k = 0; k < NE; k++) {
      const a = ANG(k);
      const E = marcoEst(k);
      // brazo inferior del soporte y molde inferior encima
      put("torreta", "brazo-inferior", [E.fC([-20, -76, ZM + 120], [20, -14, ZM + 142])], { mat: "inox" });
      const inf = put("torreta", "molde-inferior", [A.prism(SUELO, sector(CT, RT - 26, RT + 26, a - 11, a + 11), ZM + 142, ZM + 170)], { mat: "inox" });
      const sup = put("torreta", "molde-superior", [A.prism(SUELO, sector(CT, RT - 26, RT + 26, a - 11, a + 11), ZM + 172, ZM + 200)], { mat: "inox" });
      put("torreta", "brazo-superior", [E.fC([-20, -76, ZM + 200], [20, -14, ZM + 218])], { mat: "inox" });
      // 25 alojamientos en dos filas (p.24: 25 por segmento)
      const bocas = [...arcoPuntos(CT, RT - 11, a - 9, a + 9, 13), ...arcoPuntos(CT, RT + 11, a - 8.3, a + 8.3, 12)];
      put("torreta", "alojamientos", alojamientos(bocas, ZM + 200, 5.2), { mat: "negro" });
      tornillos("torreta", sup, [E.en(-30, -20, ZM + 200), E.en(30, -20, ZM + 200)].map(([x, y]) => [x, y, ZM + 200]), [0, 0, 1], { r: 4, tipo: "allen" });
      tornillos("torreta", inf, [-28, 28].map((uu) => E.en(uu, 26, ZM + 156)), E.v, { r: 3.6, tipo: "allen" });
    }
  });
  con({ sub: "plato-guias" }, () => {
    for (let i = 0; i < 4; i++) {
      const t = (45 + 90 * i) * RAD;
      vert("torreta", "columna-guia", [CT[0] + 200 * Math.cos(t), CT[1] + 200 * Math.sin(t)], ZM + 142, ZM + 200, 14, { mat: "cromo" });
    }
    vert("torreta", "nucleo", CT, ZM + 142, ZM + 200, 90, { mat: "inox" });
    torno("torreta", "bastidor-guias", [CT[0], CT[1], ZM + 200], Z, [[0, 272], [18, 272]], { mat: "inox" });
    const tapa = torno("torreta", "caja-levas", [CT[0], CT[1], ZM + 218], Z, [[0, 150], [46, 150], [52, 140], [52, 92], [72, 92], [76, 84], [76, 0]], { mat: "inox" });
    tornillos("torreta", tapa, enCirculo(CT, 120, 6, ZM + 270, 0), [0, 0, 1], { r: 5, tipo: "allen" });
    vert("torreta", "pomo", CT, ZM + 294, ZM + 312, 26, { mat: "negro" });
  });

  // ════════════════ CARGA DE CÁPSULAS (estación 0) ════════════════
  const EC = marcoEst(ESTACIONES.carga);
  const Hc = { z0: ZM + 300, z1: ZM + 590 }; // caja del mecanismo de carga (p.44)
  con({ sub: "carga-caja" }, () => {
    put("carga", "placa-fondo", [EC.fC([-150, -110, Hc.z0], [150, -100, Hc.z1])], { mat: "oscuro" });
    for (const s of [-1, 1]) put("carga", "placa-lado", [EC.fC([s > 0 ? 140 : -150, -100, Hc.z0], [s > 0 ? 150 : -140, 160, Hc.z1])], { mat: "inox" });
    const techo = put("carga", "placa-techo", [EC.fC([-150, -110, Hc.z1 - 10], [150, 160, Hc.z1])], { mat: "inox" });
    put("carga", "placa-base", [EC.fC([-150, -110, Hc.z0], [150, 160, Hc.z0 + 10])], { mat: "inox" });
    tornillos("carga", techo, [[-130, -90], [130, -90], [-130, 140], [130, 140]].map(([uu, vv]) => EC.en(uu, vv, Hc.z1)), [0, 0, 1], { r: 4.5, tipo: "allen" });
    // dos postes hasta la mesa, fuera del plato
    for (const s of [-1, 1]) {
      const [x, y] = EC.en(s * 125, 140);
      vert("carga", "poste", [x, y], ZM, Hc.z0, 18, { mat: "cromo" });
      const pie = vert("carga", "pie-poste", [x, y], ZM, ZM + 12, 34, { mat: "inox" });
      tornillos("carga", pie, enCirculo([x, y], 26, 3, ZM + 12, 30), [0, 0, 1], { r: 4 });
    }
  });
  con({ sub: "carga-tubos" }, () => {
    // Dos grupos de tubos de carga que trabajan a la vez (p.120)
    for (const s of [-1, 1]) {
      put("carga", "grupo-tubos", [EC.fC([s > 0 ? 6 : -62, -10, ZM + 236], [s > 0 ? 62 : -6, 30, Hc.z1 - 10])], { mat: "alu" });
      const tubos = [];
      for (let i = 0; i < 6; i++) {
        const uu = s * (14 + i * 8.5);
        tubos.push(fCil(EC.en(uu, 34, ZM + 236), Z, 300, 3.4));
      }
      put("carga", "tubo-capsulas", tubos, { mat: "cromo" });
    }
    // Corredera orientadora (定向滑动组件) y peine
    put("carga", "corredera", [EC.fC([-80, -40, Hc.z0 + 10], [80, -24, Hc.z0 + 46])], { mat: "alu" });
    put("carga", "peine", [EC.fC([-70, -10, ZM + 210], [70, 42, ZM + 236])], { mat: "alu" });
    // Eje del balancín superior y palanca (p.44)
    const pE = EC.en(-140, 60, Hc.z1 - 60);
    const qE = EC.en(140, 60, Hc.z1 - 60);
    barra("carga", "eje-balancin", pE, qE, 12, { mat: "cromo" });
    put("carga", "palanca", [EC.fC([-5, 30, Hc.z1 - 86], [5, 120, Hc.z1 - 52])], { mat: "fundicion" });
  });
  con({ sub: "carga-tirantes" }, () => {
    // Tirantes superiores: de la caja a la mesa; bajo la mesa el tirante inferior y el balancín
    for (const s of [-1, 1]) {
      const [x, y] = EC.en(s * 100, 80);
      vert("carga", "tirante-superior", [x, y], ZM, Hc.z1 - 60, 7, { mat: "cromo" });
    }
  });

  // ════════════════ TOLVA DE CÁPSULAS ════════════════
  const ejeTc = EC.en(0, 30);
  con({ sub: "tolva-c" }, () => {
    const comp = put("tolva_capsulas", "compuerta", [EC.fC([-48, -10, Hc.z1], [48, 70, Hc.z1 + 40])], { mat: "inox" });
    tornillos("tolva_capsulas", comp, [[-36, 0], [36, 0], [-36, 60], [36, 60]].map(([uu, vv]) => EC.en(uu, vv, Hc.z1 + 40)), [0, 0, 1], { r: 3.5, tipo: "allen" });
    vert("tolva_capsulas", "tuerca-ajuste", EC.en(0, 78), Hc.z1 + 6, Hc.z1 + 34, 9, { mat: "laton" });
    const z0 = Hc.z1 + 40;
    // Cáscara: cuello, cono y cilindro, con 2,5 mm de pared (foto: tolva cónica izquierda)
    const ext = [[0, 40], [30, 40], [170, 168], [255, 168], [260, 174]];
    const int = [[260, 171], [256, 165.5], [172, 165.5], [32, 37.5], [0, 37.5]];
    cascara("tolva_capsulas", "tolva", [ejeTc[0], ejeTc[1], z0], Z, [...ext, ...int], { mat: "inox" });
    // Soporte de la tolva hasta el techo de la caja (料斗支架, p.118)
    for (const s of [-1, 1]) {
      put("tolva_capsulas", "soporte", [EC.fC([s * 118 - 6, 10, Hc.z1], [s * 118 + 6, 50, z0 + 110])], { mat: "inox" });
    }
  });

  // ════════════════ SEPARACIÓN POR VACÍO (bajo la carga) ════════════════
  con({ sub: "vacio-asiento" }, () => {
    const asiento = put("vacio", "asiento-succion", [EC.fC([-62, -8, ZM + 105], [62, 26, ZM + 140])], { mat: "inox" });
    put("vacio", "peines-succion", alojamientos([...arcoPuntos(CT, RT + 5, ANG(0) - 9, ANG(0) + 9, 13), ...arcoPuntos(CT, RT + 17, ANG(0) - 8.3, ANG(0) + 8.3, 12)], ZM + 140, 3), { mat: "negro" });
    put("vacio", "pie-asiento", [EC.fC([-40, -2, ZM + 60], [40, 22, ZM + 105])], { mat: "alu" });
    for (const s of [-1, 1]) vert("vacio", "guia", EC.en(s * 28, 10), ZM, ZM + 60, 8, { mat: "cromo" });
    tornillos("vacio", asiento, [-48, 48].map((uu) => EC.en(uu, 26, ZM + 122)), EC.v, { r: 3.5, tipo: "allen" });
    // Toma de vacío: de la cara exterior del asiento, baja por la mesa y sale por detrás
    const p0 = EC.en(0, 26, ZM + 122);
    const p1 = EC.en(0, 70, ZM + 122);
    const p2 = EC.en(0, 70, ZM - 60);
    tubo("vacio", "manguera-vacio", [p0, p1, [p1[0], p1[1], ZM + 10]], 13, { mat: "manguera", clase: "manguera", curva: 40 });
    vert("vacio", "pasamuros", [p1[0], p1[1]], ZM, ZM + 10, 22, { mat: "laton" });
    vert("vacio", "pasamuros", [p1[0], p1[1]], ZM - 30, ZM - 20, 22, { mat: "laton" });
    tubo("vacio", "manguera-vacio", [[p1[0], p1[1], ZM - 30], [p1[0], p1[1], 700], [p1[0], -300, 700], [p1[0], -584, 700]], 13, { mat: "manguera", clase: "manguera", curva: 40 });
    cil("vacio", "racor-vacio", [p1[0], -604, 700], [0, 1, 0], 22, 22, { mat: "laton" });
  });

  // ════════════════ DISPOSITIVO DE LLENADO ════════════════
  const D = COTAS.disco;
  const zD = { base: [ZM, ZM + 60], cobre: [ZM + 60, ZM + 70], disco: [ZM + 70, ZM + 100] };
  con({ sub: "llenado-disco" }, () => {
    torno("dosificacion", "base-disco", [CD[0], CD[1], ZM], Z, [[0, 222], [60, 222]], { mat: "inox" });
    for (const t of [30, 150, 270]) {
      const r = t * RAD;
      const c = [CD[0] + 232 * Math.cos(r), CD[1] + 232 * Math.sin(r)];
      const bl = put("dosificacion", "bloque-ajuste", [A.prism({ o: [c[0], c[1], 0], a: Z, u: [Math.cos(r), Math.sin(r), 0], v: [-Math.sin(r), Math.cos(r), 0] }, [[-12, -26], [16, -26], [16, 26], [-12, 26]], ZM + 4, ZM + 52)], { mat: "alu" });
      tornillos("dosificacion", bl, [[c[0] + 8 * Math.cos(r), c[1] + 8 * Math.sin(r), ZM + 52]], [0, 0, 1], { r: 6 });
    }
    torno("dosificacion", "plato-cobre", [CD[0], CD[1], zD.cobre[0]], Z, [[0, 232], [10, 232]], { mat: "cobre" });
    const disco = torno("dosificacion", "disco-dosificador", [CD[0], CD[1], zD.disco[0]], Z, [[0, D.r], [30, D.r]], { mat: "inox" });
    // Seis grupos de alojamientos: cinco de compactación y el de paso al molde (hacia el plato)
    for (let g = 0; g < 6; g++) {
      const a = g * 60;
      put("dosificacion", "alojamientos-disco", alojamientos([...arcoPuntos(CD, D.rAloj - 10, a - 9, a + 9, 13), ...arcoPuntos(CD, D.rAloj + 10, a - 8.3, a + 8.3, 12)], zD.disco[1], 4.2), { mat: "negro" });
    }
    const tapa = torno("dosificacion", "tapa-presion", [CD[0], CD[1], zD.disco[1]], Z, [[0, 86], [14, 86], [16, 80], [16, 0]], { mat: "inox" });
    tornillos("dosificacion", tapa, enCirculo(CD, 52, 3, zD.disco[1] + 16, 90), [0, 0, 1], { r: 8, tipo: "allen" }); // 3 M12 (p.115)
    for (const t of [90, 210, 330]) {
      const r = t * RAD;
      put("dosificacion", "rascador", [A.prism({ o: [CD[0], CD[1], 0], a: Z, u: [Math.cos(r), Math.sin(r), 0], v: [-Math.sin(r), Math.cos(r), 0] }, [[86, -6], [145, -6], [145, 6], [86, 6]], zD.disco[1], zD.disco[1] + 10)], { mat: "ptfe" });
    }
    // Aro de polvo alrededor del disco (bajo el molde inferior que pasa por encima)
    cascara("dosificacion", "aro-polvo", [CD[0], CD[1], zD.disco[1]], Z, [[0, 214], [0, 242], [18, 242], [18, 214]], { mat: "inox" });
    // Bloqueador de polvo antes del paso al molde (1.4.7, p.65)
    put("dosificacion", "bloqueador-polvo", [A.prism(SUELO, sector(CD, 150, 214, 140, 160), zD.disco[1] + 0.1, zD.disco[1] + 18)], { mat: "ptfe" });
  });
  const zP = [ZM + 200, ZM + 225]; // placa de posicionado: módulos encima, punzones debajo (p.116)
  const zMod = [zP[1], ZM + 325];
  con({ sub: "llenado-modulos" }, () => {
    for (const s of [-1, 1]) {
      const c = [CD[0], CD[1] + s * 290];
      // la columna pasa por un casquillo de la mesa y sigue abajo hasta el yugo
      vert("dosificacion", "columna-llenado", c, ZM, zP[1] + 18, 30, { mat: "cromo" });
      vert("dosificacion", "columna-llenado", c, ZM - 380, ZM - 20, 30, { mat: "cromo" });
      const cq = vert("dosificacion", "casquillo-columna", c, ZM, ZM + 22, 46, { mat: "laton" });
      tornillos("dosificacion", cq, enCirculo(c, 38, 3, ZM + 22, 0), [0, 0, 1], { r: 3.5, tipo: "allen" });
      const n = vert("dosificacion", "tuerca-columna", c, zP[1], zP[1] + 18, 44, { mat: "inox" });
      tornillos("dosificacion", n, enCirculo(c, 34, 4, zP[1] + 18, 45), [0, 0, 1], { r: 4, tipo: "allen" });
    }
    // Placa de posicionado con la muesca por donde pasa el plato (p.116)
    const RN = 362;
    const placa = Array.from({ length: 72 }, (_, i) => {
      const t = (i * 5 + 2.5) * RAD;
      const p = [CD[0] + 330 * Math.cos(t), CD[1] + 330 * Math.sin(t)];
      const d = Math.hypot(p[0] - CT[0], p[1] - CT[1]);
      return d >= RN ? p : [CT[0] + ((p[0] - CT[0]) * RN) / d, CT[1] + ((p[1] - CT[1]) * RN) / d];
    });
    put("dosificacion", "placa-posicionado", [A.prism(SUELO, placa, zP[0], zP[1])], { mat: "inox" });
    for (const g of [0, 60, 120, 240, 300]) {
      const r = g * RAD;
      const u = [-Math.sin(r), Math.cos(r), 0];
      const v = [Math.cos(r), Math.sin(r), 0];
      const F = { o: [CD[0], CD[1], 0], a: Z, u, v };
      const mod = put("dosificacion", "modulo-llenado", [A.prism(F, [[-56, D.rAloj - 34], [56, D.rAloj - 34], [56, D.rAloj + 34], [-56, D.rAloj + 34]], zMod[0], zMod[1])], { mat: "alu" });
      // tapa del módulo con su ventana (p.106) y el bloque de cobre que guía los punzones bajo la placa
      put("dosificacion", "ventana-modulo", [A.prism(F, [[-34, D.rAloj + 34], [34, D.rAloj + 34], [34, D.rAloj + 36], [-34, D.rAloj + 36]], zMod[0] + 22, zMod[1] - 22)], { mat: "negro" });
      put("dosificacion", "bloque-cobre", [A.prism(F, [[-52, D.rAloj - 22], [52, D.rAloj - 22], [52, D.rAloj + 22], [-52, D.rAloj + 22]], zP[0] - 14, zP[0])], { mat: "laton" });
      // punzones (填充杆): dos filas bajo el módulo
      const punzones = [];
      for (const [rr, n, ab] of [[D.rAloj - 10, 13, 9], [D.rAloj + 10, 12, 8.3]])
        for (const [x, y] of arcoPuntos([0, 0], rr, g - ab, g + ab, n)) punzones.push(A.disc({ o: [CD[0] + x, CD[1] + y, ZM + 118], a: Z, u: X, v: Y }, 0, zP[0] - 14 - (ZM + 118), 2.6));
      put("dosificacion", "punzones", punzones, { mat: "cromo" });
      // pomo de apriete del módulo sobre la placa (固紧螺栓, p.116)
      const pc = [CD[0] + D.rAloj * Math.cos(r), CD[1] + D.rAloj * Math.sin(r)];
      vert("dosificacion", "pomo-modulo", pc, zMod[1], zMod[1] + 10, 14, { mat: "cromo" });
      vert("dosificacion", "pomo-modulo", pc, zMod[1] + 10, zMod[1] + 30, 26, { mat: "negro" });
      tornillos("dosificacion", mod, [-44, 44].map((uu) => [CD[0] + u[0] * uu + v[0] * (D.rAloj - 34), CD[1] + u[1] * uu + v[1] * (D.rAloj - 34), zP[1] + 12]), v.map((x) => -x), { r: 3.5, tipo: "allen" });
    }
    // Yugo bajo la mesa: une las dos columnas y sube y baja los punzones (leva 3)
    caja("dosificacion", "yugo", [CD[0] - 34, CD[1] - 320, ZM - 380], [CD[0] + 34, CD[1] + 320, ZM - 362], { mat: "fundicion" });
  });

  // ════════════════ TOLVA DE POLVO Y CAJA DEL MOTOR ════════════════
  const zT = { tubo: zP[1], cono: ZM + 540, cil: ZM + 720, top: ZM + 865 };
  const caja8 = { a: [190, -340, zT.top], b: [640, 20, zT.top + 90] };
  con({ sub: "polvo-tolva" }, () => {
    // Cuerpo de alimentación (cilindro gris bajo el cono en la foto), cono y boca
    const ext = [[0, 66], [zT.cono - zT.tubo, 66], [zT.cono - zT.tubo + 10, 72], [zT.cil - zT.tubo, 165], [zT.top - zT.tubo, 165]];
    const int = [[zT.top - zT.tubo, 162.5], [zT.cil - zT.tubo + 2, 162.5], [zT.cono - zT.tubo + 12, 69.5], [zT.cono - zT.tubo, 63.5], [0, 63.5]];
    cascara("polvo", "tolva-polvo", [CD[0], CD[1], zT.tubo], Z, [...ext, ...int], { mat: "inox" });
    // abrazadera del tubo de salida sobre la placa
    const ab = torno("polvo", "brida-salida", [CD[0], CD[1], zT.tubo], Z, [[0, 92], [14, 92], [14, 66]], { mat: "inox" });
    tornillos("polvo", ab, enCirculo(CD, 80, 6, zT.tubo + 14, 30), [0, 0, 1], { r: 3.5, tipo: "allen" });
    // tornillo sinfín (输送螺杆) y su eje, y el agitador (搅拌架)
    put("polvo", "eje-sinfin", [fVert(CD, zT.tubo + 20, caja8.a[2], 10)], { mat: "cromo" });
    put("polvo", "sinfin", [A.disc({ o: [CD[0], CD[1], 0], a: Z, u: X, v: Y }, zT.tubo + 40, zT.cono + 60, 34)], { mat: "cromo", geo3d: [{ k: "H", o: [CD[0], CD[1], 0], a: [0, 0, 1], s0: zT.tubo + 40, s1: zT.cono + 60, r: 26, n: 9, rw: 4 }] });
    for (const t of [0, 180]) {
      const r = t * RAD;
      const base = [CD[0] + 12 * Math.cos(r), CD[1] + 12 * Math.sin(r)];
      const abajo = [CD[0] + 60 * Math.cos(r), CD[1] + 60 * Math.sin(r), zT.cono + 40];
      const arriba = [CD[0] + 150 * Math.cos(r), CD[1] + 150 * Math.sin(r), zT.cil + 40];
      barra("polvo", "agitador", [base[0], base[1], zT.cono + 40], abajo, 5, { mat: "cromo" });
      barra("polvo", "agitador", abajo, arriba, 5, { mat: "cromo" });
      barra("polvo", "agitador", arriba, [base[0], base[1], zT.cil + 40], 5, { mat: "cromo" });
    }
  });
  con({ sub: "polvo-caja" }, () => {
    const [a, b] = [caja8.a, caja8.b];
    caja("polvo", "caja-fondo", a, [b[0], b[1], a[2] + 10], { mat: "inox" });
    for (const [p, q] of [
      [[a[0], a[1], a[2] + 10], [b[0], a[1] + 8, b[2] - 8]],
      [[a[0], b[1] - 8, a[2] + 10], [b[0], b[1], b[2] - 8]],
      [[a[0], a[1] + 8, a[2] + 10], [a[0] + 8, b[1] - 8, b[2] - 8]],
      [[b[0] - 8, a[1] + 8, a[2] + 10], [b[0], b[1] - 8, b[2] - 8]],
    ])
      caja("polvo", "caja-pared", p, q, { mat: "inox" });
    const tapa = caja("polvo", "caja-tapa", [a[0], a[1], b[2] - 8], b, { mat: "inox" });
    esquinas("polvo", tapa, [a[0], a[1], b[2] - 8], b, "+z", { m: 16, r: 4, tipo: "allen" });
    // motor y reductor dentro de la caja (p.92)
    const ym = -150;
    cil("polvo", "motor-polvo", [420, ym, a[2] + 46], X, 150, 32, { mat: "motorSEW" });
    caja("polvo", "pie-motor", [430, ym - 30, a[2] + 10], [560, ym + 30, a[2] + 14], { mat: "fundicion" });
    cil("polvo", "acople", [395, ym, a[2] + 46], X, 25, 16, { mat: "cromo" });
    caja("polvo", "reductor", [CD[0] - 50, CD[1] - 150, a[2] + 10], [CD[0] + 55, CD[1] + 30, a[2] + 82], { mat: "motorSEW" });
    // columna de elevación con su resorte (升降套 y 压缩弹簧) hasta la mesa
    const cl = [605, -300];
    vert("polvo", "columna-elevacion", cl, ZM, a[2], 30, { mat: "alu" });
    const pie = vert("polvo", "pie-columna", cl, ZM, ZM + 16, 56, { mat: "inox" });
    tornillos("polvo", pie, enCirculo(cl, 44, 4, ZM + 16, 45), [0, 0, 1], { r: 4.5 });
    put("polvo", "resorte", [fVert(cl, a[2] - 150, a[2], 36)], { mat: "cromo", geo3d: [{ k: "H", o: [cl[0], cl[1], 0], a: [0, 0, 1], s0: a[2] - 150, s1: a[2], r: 38, n: 11, rw: 3 }] });
    cil("polvo", "tornillo-fijacion", [cl[0] + 30, cl[1], ZM + 300], X, 22, 9, { mat: "negro" });
  });
  con({ sub: "polvo-nivel" }, () => {
    // Detector capacitivo de nivel: a 18-28 mm del disco (1.4.8, p.67)
    const c = [CD[0], CD[1] + 110];
    put("polvo", "soporte-detector", [fCaja([c[0] - 14, c[1] - 14, ZM + 168], [c[0] + 14, c[1] + 14, zP[0]])], { mat: "alu" });
    put("polvo", "detector-nivel", [fVert(c, ZM + 123, ZM + 168, 9)], { mat: "sensor", clase: "sensor", sensor: "nivel-polvo" });
  });

  // ════════════════ ESTACIONES ALREDEDOR DEL PLATO ════════════════
  // Poste exterior con brazo hasta el dispositivo de arriba
  function posteBrazo(pieza, E, zTop, { v0 = 20 } = {}) {
    const [x, y] = E.en(0, 122);
    vert(pieza, "poste", [x, y], ZM, zTop, 15, { mat: "cromo" });
    const pie = vert(pieza, "pie-poste", [x, y], ZM, ZM + 12, 30, { mat: "inox" });
    tornillos(pieza, pie, enCirculo([x, y], 23, 3, ZM + 12, 90), [0, 0, 1], { r: 3.5 });
    put(pieza, "brazo", [E.fC([-14, v0, zTop - 22], [14, 136, zTop])], { mat: "alu" });
  }
  // Mecanismo de abajo: bloque de agujas bajo el molde, columnas guía, tirante y rótula
  function agujasAbajo(pieza, E, { nombre = "bloque-agujas" } = {}) {
    const b = put(pieza, nombre, [E.fC([-52, -6, ZM + 70], [52, 26, ZM + 138])], { mat: "alu" });
    const ag = [];
    for (let i = 0; i < 9; i++) ag.push(fCil(E.en(-40 + i * 10, 10, ZM + 138), Z, 2, 2.4));
    put(pieza, "puntas", ag, { mat: "cromo" });
    for (const s of [-1, 1]) vert(pieza, "columna-guia", E.en(s * 36, 10), ZM, ZM + 70, 10, { mat: "cromo" });
    tornillos(pieza, b, [-40, 40].map((uu) => E.en(uu, 26, ZM + 104)), E.v, { r: 3.5, tipo: "allen" });
    const [x, y] = E.en(0, 10);
    vert(pieza, "tirante-inferior", [x, y], ZM - 280, ZM - 20, 7, { mat: "cromo" });
    return [x, y];
  }

  // Rechazo (estación 6): cámara de aire arriba (1.4.10, p.72)
  const ER = marcoEst(ESTACIONES.rechazo);
  con({ sub: "rechazo" }, () => {
    const cam = put("rechazo", "camara-aire", [ER.fC([-55, -8, ZM + 203], [55, 24, ZM + 250])], { mat: "alu" });
    put("rechazo", "empujador", [ER.fC([-30, -6, ZM + 250], [30, 16, ZM + 268])], { mat: "inox" });
    tornillos("rechazo", cam, [-44, 44].map((uu) => ER.en(uu, 24, ZM + 228)), ER.v, { r: 3.5, tipo: "allen" });
    posteBrazo("rechazo", ER, ZM + 250);
    mangueraAbajo("rechazo", "manguera-rechazo", ER, ZM + 268, 14, [[ER.en(0, 160)[0], -584]]);
  });
  const varRechazo = agujasAbajoCon("rechazo", ER);

  // Cierre (estación 8): placa superior y punzones de cierre (1.4.11, p.75)
  const EK = marcoEst(ESTACIONES.cierre);
  con({ sub: "cierre" }, () => {
    const pl = put("cierre", "placa-superior", [EK.fC([-60, -8, ZM + 203], [60, 30, ZM + 216])], { mat: "inox" });
    tornillos("cierre", pl, [-46, 46].map((uu) => EK.en(uu, 8, ZM + 216)), [0, 0, 1], { r: 4, tipo: "allen" });
    put("cierre", "regulacion", [EK.fC([-14, 2, ZM + 216], [14, 30, ZM + 240])], { mat: "laton" });
    posteBrazo("cierre", EK, ZM + 240, { v0: 26 });
  });
  const varCierre = agujasAbajoCon("cierre", EK, "punzones-cierre");

  // Descarga (estación 10): agujas abajo y canal de salida por el lateral izquierdo (p.78)
  const EDs = marcoEst(ESTACIONES.descarga);
  con({ sub: "descarga" }, () => {
    put("descarga", "mano-salida", [EDs.fC([-44, -10, ZM + 206], [44, 32, ZM + 210])], { mat: "inox" });
    const o = [-516, CT[1], ZM + 206];
    const fin = [-840, CT[1], ZM + 100];
    const a = G.unit3(G.sub3(fin, o));
    const v = G.unit3(G.cross3(Y, a));
    const F = { o, a, u: Y, v };
    put("descarga", "canal-salida", [A.prism(F, [[-46, 0], [46, 0], [46, 36], [42, 36], [42, 4], [-42, 4], [-42, 36], [-46, 36]], 0, G.len3(G.sub3(fin, o)))], { mat: "inox" });
    // apoyo del canal sobre la mesa
    const zc = o[2] + (fin[2] - o[2]) * ((-620 - o[0]) / (fin[0] - o[0]));
    vert("descarga", "apoyo-canal", [-620, CT[1]], ZM, zc + 2, 14, { mat: "cromo" });
    const pie = vert("descarga", "pie-apoyo", [-620, CT[1]], ZM, ZM + 12, 28, { mat: "inox" });
    tornillos("descarga", pie, enCirculo([-620, CT[1]], 21, 3, ZM + 12, 0), [0, 0, 1], { r: 3.5 });
  });
  const varDescarga = agujasAbajoCon("descarga", EDs, "agujas-salida");

  // Limpieza (estación 11): soplado arriba y aspiración al colector (p.90)
  const EL = marcoEst(ESTACIONES.limpieza);
  con({ sub: "limpieza" }, () => {
    const bq = put("limpieza", "boquilla-soplado", [EL.fC([-50, -8, ZM + 203], [50, 24, ZM + 240])], { mat: "alu" });
    tornillos("limpieza", bq, [-40, 40].map((uu) => EL.en(uu, 24, ZM + 222)), EL.v, { r: 3.5, tipo: "allen" });
    posteBrazo("limpieza", EL, ZM + 240);
    const asp = put("limpieza", "aspiracion", [EL.fC([-50, -6, ZM + 80], [50, 26, ZM + 138])], { mat: "alu" });
    for (const s of [-1, 1]) vert("limpieza", "columna-guia", EL.en(s * 36, 10), ZM, ZM + 80, 10, { mat: "cromo" });
    tornillos("limpieza", asp, [-40, 40].map((uu) => EL.en(uu, 26, ZM + 110)), EL.v, { r: 3.5, tipo: "allen" });
    mangueraAbajo("limpieza", "manguera-polvo", EL, ZM + 240, 16, [[-540, 150], [-540, -584]]);
  });

  // Manguera de un dispositivo de arriba al colector: sube, sale hacia fuera del plato, baja
  // por un pasamuros de la mesa y va por dentro del cuerpo hasta la pared trasera.
  function mangueraAbajo(pieza, nombre, E, zSale, r, recorrido) {
    const [x, y] = E.en(0, 5);
    const [xf, yf] = E.en(0, 160);
    const zA = zSale + 40;
    tubo(pieza, nombre, [[x, y, zSale], [x, y, zA], [xf, yf, zA], [xf, yf, ZM + 10]], r, { mat: "manguera", clase: "manguera", curva: 36 });
    vert(pieza, "pasamuros", [xf, yf], ZM, ZM + 10, r + 9, { mat: "laton" });
    vert(pieza, "pasamuros", [xf, yf], ZM - 30, ZM - 20, r + 9, { mat: "laton" });
    const ruta = [[xf, yf, ZM - 30], [xf, yf, 720], ...recorrido.map(([a, b]) => [a, b, 720])];
    tubo(pieza, nombre, ruta, r, { mat: "manguera", clase: "manguera", curva: 50 });
    const fin = ruta[ruta.length - 1];
    cil(pieza, "racor", [fin[0], -604, 720], [0, 1, 0], 20, r + 8, { mat: "laton" });
  }

  function agujasAbajoCon(pieza, E, nombreBloque) {
    let xy;
    con({ sub: `${pieza}-abajo` }, () => (xy = agujasAbajo(pieza, E, nombreBloque ? { nombre: nombreBloque } : {})));
    return xy;
  }

  // ════════════════ TRANSMISIÓN ════════════════
  const zA = 455; // árbol de levas
  const yA = -100;
  con({ sub: "trans-motor" }, () => {
    // Motorreductor SEW R57DRS112M4 (p.115 y lista p.127), eje paralelo al árbol
    const ym = 200;
    const zm = 262;
    const pie = caja("transmision", "pie-reductor", [60, ym - 80, 160], [210, ym + 80, 176], { mat: "motorSEW" });
    esquinas("transmision", pie, [60, ym - 80, 160], [210, ym + 80, 176], "+z", { m: 14, r: 6 });
    caja("transmision", "reductor", [70, ym - 70, 176], [210, ym + 70, 352], { r: 18, mat: "motorSEW" });
    cil("transmision", "motor-principal", [210, ym, zm], X, 250, 92, { mat: "motorSEW" });
    cil("transmision", "tapa-ventilador", [460, ym, zm], X, 40, 88, { mat: "motorSEW" });
    caja("transmision", "caja-bornes", [280, ym - 46, zm + 90], [380, ym + 46, zm + 150], { r: 6, mat: "motorSEW" });
    cil("transmision", "eje-salida", [30, ym, zm], X, 40, 22, { mat: "cromo" });
    cil("transmision", "eje-trasero", [500, ym, zm], X, 60, 14, { mat: "cromo" });
    // volante de mano en el eje trasero (accesorio, p.115)
    put("transmision", "volante", [A.ring(G.frameAlong([560, ym, zm], X), 0, 14, 84, 100), A.disc(G.frameAlong([560, ym, zm], X), 0, 14, 26), barraF([567, ym, zm + 20], [567, ym, zm + 86], 7), barraF([567, ym - 18, zm - 10], [567, ym - 75, zm - 43], 7), barraF([567, ym + 18, zm - 10], [567, ym + 75, zm - 43], 7)], { mat: "fundicion" });
    cil("transmision", "manivela", [574, ym, zm + 92], X, 40, 9, { mat: "negro" });
  });
  // Cadena entre el piñón del motor y la rueda del árbol (plano x = 40)
  const xc = 40;
  const r1 = 70;
  const r2 = 112;
  const c1 = [200, 262];
  const c2 = [yA, zA];
  con({ sub: "trans-cadena" }, () => {
    for (const d of [-8, 8]) cil("transmision", "pinon-motor", [xc + d - 6, c1[0], c1[1]], X, 12, r1, { mat: "cromo" });
    cil("transmision", "rueda-arbol", [xc - 14, c2[0], c2[1]], X, 28, r2, { mat: "cromo" });
    // lazo: tangentes exteriores entre dos círculos
    const dx = c2[0] - c1[0];
    const dy = c2[1] - c1[1];
    const L = Math.hypot(dx, dy);
    const base = Math.atan2(dy, dx);
    const b = Math.acos((r1 - r2) / L);
    const pts = [];
    const n = 18;
    for (let i = 0; i <= n; i++) {
      const t = base + b + ((2 * Math.PI - 2 * b) * i) / n;
      pts.push([xc, c1[0] + r1 * Math.cos(t), c1[1] + r1 * Math.sin(t)]);
    }
    for (let i = 0; i <= n; i++) {
      const t = base - b + (2 * b * i) / n;
      pts.push([xc, c2[0] + r2 * Math.cos(t), c2[1] + r2 * Math.sin(t)]);
    }
    pts.push(pts[0]);
    put("transmision", "cadena", [A.tube(pts, 6)], { mat: "cadena", clase: "cadena" });
    // tensor bajo el tramo de abajo (1.4.14, p.83)
    const t1 = base - b;
    const pa = [c1[0] + r1 * Math.cos(t1), c1[1] + r1 * Math.sin(t1)];
    const pb = [c2[0] + r2 * Math.cos(t1), c2[1] + r2 * Math.sin(t1)];
    const m = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
    const nrm = [Math.cos(t1), Math.sin(t1)];
    const ct = [m[0] + nrm[0] * 50, m[1] + nrm[1] * 50];
    cil("transmision", "pinon-tensor", [xc - 6, ct[0], ct[1]], X, 12, 44, { mat: "cromo" });
    cil("transmision", "eje-tensor", [xc - 6, ct[0], ct[1]], [-1, 0, 0], 64, 10, { mat: "cromo" });
    const sop = caja("transmision", "soporte-tensor", [xc - 100, ct[0] - 30, 160], [xc - 70, ct[0] + 30, ct[1] + 24], { mat: "fundicion" });
    tornillos("transmision", sop, [[xc - 100, ct[0], ct[1]]], [-1, 0, 0], { r: 9 });
  });
  con({ sub: "trans-arbol" }, () => {
    cil("transmision", "arbol-levas", [-620, yA, zA], X, 1220, 30, { mat: "cromo" });
    for (const x of [-600, 300, 580]) {
      const ped = caja("transmision", "pedestal", [x - 40, yA - 60, 160], [x + 40, yA + 60, 400], { mat: "fundicion" });
      const so = caja("transmision", "soporte-rodamiento", [x - 36, yA - 60, 400], [x + 36, yA + 60, 500], { r: 10, mat: "fundicion" });
      esquinas("transmision", so, [x - 36, yA - 60, 400], [x + 36, yA + 60, 500], "+z", { m: 12, r: 6 });
      void ped;
    }
  });
  // Cinco levas (p.81-82): alimentación, succión, dosificación, descarga y cierre
  const LEVAS = { alimentacion: -460, succion: -380, cierre: -300, descarga: -540, dosificacion: 200 };
  const zSeg = 592;
  con({ sub: "trans-levas" }, () => {
    for (const [nom, x] of Object.entries(LEVAS)) {
      put("transmision", `leva-${nom}`, [A.disc({ o: [x - 13, yA, zA + 20], a: X, u: Y, v: Z }, 0, 26, 95), A.disc(G.frameAlong([x - 20, yA, zA], X), 0, 40, 46)], { mat: "fundicion" });
      cil("transmision", "rodillo", [x - 15, yA, zSeg], X, 30, 22, { mat: "cromo" });
    }
  });
  // Balancines (摆杆) desde cada rodillo hasta el tirante de su estación
  // El balancín va al costado del rodillo (lado +1 o -1), sujeto a su eje.
  const balancin = (pieza, x, destino, lado = 1) => {
    const p0 = [x + lado * 27, yA, zSeg];
    const p1 = [destino[0], destino[1], zSeg];
    barra(pieza, "balancin", p0, p1, 12, { mat: "fundicion" });
    bola(pieza, "rotula", [destino[0], destino[1], zSeg], 15, { mat: "cromo" });
  };
  con({ sub: "carga-abajo" }, () => {
    const [x, y] = EC.en(-100, 80);
    vert("carga", "tirante-inferior", [x, y], zSeg, ZM - 20, 7, { mat: "cromo" });
    balancin("carga", LEVAS.alimentacion, [x, y]);
  });
  con({ sub: "vacio-abajo" }, () => {
    const [x, y] = EC.en(0, 10);
    vert("vacio", "tirante-inferior", [x, y], zSeg, ZM - 20, 7, { mat: "cromo" });
    balancin("vacio", LEVAS.succion, [x, y]);
  });
  con({ sub: "cierre-abajo" }, () => balancin("cierre", LEVAS.cierre, varCierre, -1));
  con({ sub: "descarga-abajo" }, () => balancin("descarga", LEVAS.descarga, varDescarga));
  // El rechazo cuelga de la leva de descarga: el manual nombra 5 levas y ninguna de rechazo
  con({ sub: "rechazo-abajo" }, () => balancin("rechazo", LEVAS.dosificacion, varRechazo, -1));
  con({ sub: "llenado-abajo" }, () => {
    const dest = [CD[0], -230];
    balancin("dosificacion", LEVAS.dosificacion, dest);
    vert("dosificacion", "biela-yugo", dest, ZM - 362, zSeg, 9, { mat: "cromo" });
  });
  // Divisores de levas (RU180DF bajo el plato, RU140DF bajo el disco; lista p.128)
  con({ sub: "trans-divisores" }, () => {
    const dv = caja("transmision", "divisor-plato", [CT[0] - 100, CT[1] - 100, zA + 30], [CT[0] + 100, CT[1] + 100, ZM - 120], { r: 12, mat: "divisor" });
    torno("transmision", "brida-divisor", [CT[0], CT[1], ZM - 120], Z, [[0, 84], [12, 84], [12, 60], [100, 60]], { mat: "inox" });
    tornillos("transmision", "transmision.brida-divisor", enCirculo(CT, 72, 6, ZM - 108, 30), [0, 0, 1], { r: 5 });
    void dv;
    caja("transmision", "divisor-disco", [CD[0] - 90, CD[1] - 90, ZM - 260], [CD[0] + 90, CD[1] + 90, ZM - 120], { r: 12, mat: "divisor" });
    torno("transmision", "brida-divisor", [CD[0], CD[1], ZM - 120], Z, [[0, 74], [12, 74], [12, 54], [100, 54]], { mat: "inox" });
  });

  // ════════════════ PANTALLA TÁCTIL Y BALIZA ════════════════
  const yb = COTAS.columna.y; // el brazo sale de la columna delantera derecha
  con({ sub: "hmi-brazo" }, () => {
    const zb = 1330;
    const fl = cil("hmi", "brida-brazo", [717, yb, zb], X, 16, 52, { mat: "alu" });
    tornillos("hmi", fl, [[733, yb + 34, zb + 34], [733, yb - 34, zb + 34], [733, yb + 34, zb - 34], [733, yb - 34, zb - 34]], [1, 0, 0], { r: 4.5, tipo: "allen" });
    cil("hmi", "brazo", [733, yb, zb], X, 60, 32, { mat: "blanco" });
    vert("hmi", "rotula-brazo", [790, yb], zb - 50, zb + 50, 46, { mat: "blanco" });
    tubo("hmi", "brazo", [[836, yb, zb], [1000, yb, zb], [1070, yb, zb], [1070, yb, 1385]], 32, { mat: "blanco", curva: 60 });
  });
  con({ sub: "hmi-caja" }, () => {
    // Caja de ~540 × 460 mm (foto: 38 % del ancho de la máquina), pantalla arriba y mandos abajo
    const a = [850, yb - 64, 1380];
    const b = [1390, yb + 46, 1840];
    const yf = b[1];
    const xm = (a[0] + b[0]) / 2;
    const cj = caja("hmi", "caja-pantalla", a, b, { r: 14, mat: "alu" });
    esquinas("hmi", cj, a, b, "+y", { m: 14, r: 4, tipo: "allen" });
    caja("hmi", "marco-pantalla", [xm - 200, yf, 1560], [xm + 200, yf + 4, 1812], { mat: "negro" });
    caja("hmi", "pantalla", [xm - 180, yf + 4, 1578], [xm + 180, yf + 6, 1794], { mat: "pantalla", clase: "pantalla" });
    // mandos (foto: verde, blanco, negro y seta roja)
    for (const [dx, mat, nom] of [[-150, "verde", "pulsador-marcha"], [-80, "blanco", "pulsador-rearme"], [-10, "negro", "pulsador-parada"]]) {
      cil("hmi", "aro-pulsador", [xm + dx, yf, 1470], Y, 6, 22, { mat: "cromo" });
      cil("hmi", nom, [xm + dx, yf + 6, 1470], Y, 10, 15, { mat });
    }
    cil("hmi", "collar-seta", [xm + 130, yf, 1470], Y, 6, 42, { mat: "amarillo" });
    cil("hmi", "cuerpo-seta", [xm + 130, yf + 6, 1470], Y, 14, 18, { mat: "negro" });
    torno("hmi", "seta-emergencia", [xm + 130, yf + 20, 1470], Y, [[0, 30], [12, 30], [16, 24], [16, 0]], { mat: "seta", clase: "seta" });
    vert("hmi", "prensaestopa", [xm + 40, yb - 10], 1362, 1380, 12, { mat: "negro" });
    // asa vertical en el costado derecho de la caja (foto)
    const ya = yb - 10;
    for (const z of [1480, 1740]) cil("hmi", "pie-asa", [b[0], ya, z], X, 34, 9, { mat: "alu" });
    vert("hmi", "asa", [b[0] + 34 + 11, ya], 1460, 1760, 11, { mat: "alu" });
  });

  con({ sub: "baliza" }, () => {
    const c = [-650, 560];
    vert("hmi", "base-baliza", c, COTAS.alto, COTAS.alto + 14, 32, { mat: "negro" });
    vert("hmi", "mastil-baliza", c, COTAS.alto + 14, COTAS.alto + 70, 10, { mat: "cromo" });
    let z = COTAS.alto + 70;
    for (const [mat, nom] of [["luzVerde", "luz-verde"], ["luzAmbar", "luz-ambar"], ["luzRoja", "luz-roja"]]) {
      vert("hmi", nom, c, z, z + 48, 30, { mat });
      z += 48;
    }
    vert("hmi", "tapa-baliza", c, z, z + 12, 30, { mat: "negro" });
    tornillos("hmi", "hmi.base-baliza", enCirculo(c, 24, 3, COTAS.alto + 14, 0), [0, 0, 1], { r: 2.5, tipo: "allen" });
  });

  return { items, pernos };
}
