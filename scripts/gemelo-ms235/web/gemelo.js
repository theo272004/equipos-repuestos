// Gemelo de la MS235: giro por vistas, desarme con resortes (como el Raptor
// de Anatomy), seleccion por conjunto o sensor y el panel con los datos.
const D = __DATOS__;
const NS = "http://www.w3.org/2000/svg";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const quieto = matchMedia("(prefers-reduced-motion: reduce)");

const raiz = $(".gm");
const escena = $(".gm-escena");
const svg = $(".gm-svg");
const camaraG = $(".gm-camara");
const cargando = $(".gm-cargando");
const etiqueta = $(".gm-etiqueta");
const lectura = $("[data-lectura]");
const pista = $("[data-pista]");
const vivo = $("[data-vivo]");
const panelCab = $(".gm-panel__cab");
const panelCuerpo = $(".gm-panel__cuerpo");
const pasoTxt = $("[data-paso]");

const IDS = Object.keys(D.piezas);
const PASOS = D.desarme.filter((id) => id !== "bastidor");
const NUM = Object.fromEntries(D.lectura.map((id, i) => [id, i + 1]));
const NOMBRE_VISTA = (az) => {
  const a = ((az % 360) + 360) % 360;
  const nombres = ["derecha", "frente-derecha", "frente", "frente-izquierda", "izquierda", "atrás-izquierda", "atrás", "atrás-derecha"];
  return nombres[Math.round(a / 45) % 8];
};

// ───────────── Historial: snapshot del build, o en vivo desde mtto-data.js ─────────────
const clasificar = __CLASIFICAR__;
let historial = D.historial;
const porPieza = (lista) => lista.reduce((m, x) => ((m[x.pieza] = (m[x.pieza] ?? 0) + 1), m), {});
let fallasPorPieza = porPieza(historial);

async function historialEnVivo() {
  if (!D.base && D.base !== "") return;
  try {
    await new Promise((ok, mal) => {
      const s = document.createElement("script");
      s.src = `${D.base}assets/js/mtto-data.js?v=${Date.now().toString(36).slice(0, -3)}`;
      s.onload = ok;
      s.onerror = mal;
      document.head.appendChild(s);
    });
    const regs = window.MTTO?.hist?.registros;
    if (!Array.isArray(regs)) return;
    const nuevos = regs.filter(clasificar.esMs235).map((r) => ({ id: r.id, f: r.f, hr: r.hr, t: r.t, s: r.s, fa: r.fa, ac: r.ac, de: r.de, min: r.min, ef: r.ef, frep: r.frep, tec: r.tec, pieza: clasificar.piezaDeIntervencion(r) }));
    if (nuevos.length) {
      historial = nuevos;
      D.mtto = { desde: window.MTTO.desde, hasta: window.MTTO.hasta, generado: window.MTTO.generado };
      fallasPorPieza = porPieza(historial);
      const chip = $("[data-chat-hasta]");
      if (chip && D.mtto.hasta) chip.textContent = `chat hasta ${D.mtto.hasta.split("-").reverse().join("/")}`;
      pintarCalor();
      pintarLeyenda();
      pintarPanel();
    }
  } catch {
    /* fuera de la app: se queda el historial del build */
  }
}

// ───────────── Resortes del desarme (uno por conjunto) ─────────────
const resorte = Object.fromEntries(IDS.map((id) => [id, { x: 0, v: 0, target: 0, pending: null }]));
let reloj = 0;
let paso = 0; // 0 = armada; PASOS.length = desarmada

function irAPaso(n, { seleccionar = true, inmediato = false } = {}) {
  n = Math.max(0, Math.min(PASOS.length, n));
  if (n > 0 && marcha) {
    marcha = false;
    tMarcha = 0;
  }
  const antes = paso;
  paso = n;
  if (inmediato) {
    PASOS.forEach((id, i) => Object.assign(resorte[id], { x: i < n ? 1 : 0, v: 0, target: i < n ? 1 : 0, pending: null }));
    if (infoActual) colocar(infoActual);
  }
  // Al abrir sale primero el de fuera; al cerrar vuelve primero el ultimo que salio.
  const cambian = PASOS.filter((id, i) => (i < n ? 1 : 0) !== resorte[id].target || resorte[id].pending);
  const orden = n >= antes ? cambian : [...cambian].reverse();
  let i = 0;
  for (const id of orden) {
    const meta = PASOS.indexOf(id) < n ? 1 : 0;
    if (resorte[id].target === meta && !resorte[id].pending) continue;
    resorte[id].pending = { value: meta, at: reloj + (quieto.matches ? 0 : i++ * D.spring.stagger) };
  }
  if (seleccionar) {
    const id = n > 0 && n < PASOS.length ? PASOS[n - 1] : null;
    if (n === 0 || n === PASOS.length) seleccionar_(null);
    else seleccionar_(id === "resguardos" && sinResguardos ? null : id);
  }
  actualizarMandos();
  if (!camara.manual) apuntarCamara(inmediato);
  correr();
}

function avanzarResortes(dt) {
  let moviendo = false;
  const { stiffness: K, damping: C, substeps } = D.spring;
  for (const id of IDS) {
    const r = resorte[id];
    if (r.pending && reloj >= r.pending.at) {
      r.target = r.pending.value;
      r.pending = null;
    }
    if (r.pending) moviendo = true;
    if (quieto.matches) {
      r.x = r.target;
      r.v = 0;
      continue;
    }
    const h = dt / substeps;
    for (let s = 0; s < substeps; s++) {
      const a = K * (r.target - r.x) - C * r.v;
      r.v += a * h;
      r.x += r.v * h;
    }
    if (Math.abs(r.target - r.x) < 1e-4 && Math.abs(r.v) < 1e-4) {
      r.x = r.target;
      r.v = 0;
    } else moviendo = true;
  }
  return moviendo;
}

// ───────────── Vistas ─────────────
const vistas = new Map();
let actual = -1;
let infoActual = null; // la vista visible ya cargada (el bucle no espera promesas)

function cargarVista(i) {
  if (vistas.has(i)) return vistas.get(i);
  const promesa = fetch(`${D.dirVistas}vista-${i}.svg?v=${D.version}`)
    .then((r) => {
      if (!r.ok) throw new Error(`vista ${i}: ${r.status}`);
      return r.text();
    })
    .then((texto) => {
      const meta = D.vistas[i];
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "gm-vista");
      g.setAttribute("data-fuera", "");
      g.innerHTML = texto;
      camaraG.appendChild(g);
      const maquina = $(".g-maquina", g);
      const nodos = $$(".it", maquina).map((el, idx) => {
        const m = el.dataset.m.split(",").map(Number);
        return {
          el,
          idx,
          pieza: el.dataset.piece,
          ride: el.dataset.ride || el.dataset.piece,
          sensor: el.dataset.sensor || null,
          k: Number(el.dataset.k),
          lift: m[0] * meta.V[0] + m[1] * meta.V[1] + m[2] * meta.V[2],
          dx: m[0] * meta.EX[0] + m[1] * meta.EY[0] + m[2] * meta.EZ[0],
          dy: m[0] * meta.EX[1] + m[1] * meta.EY[1] + m[2] * meta.EZ[1],
          tx: 0,
          ty: 0,
          ciclo: el.dataset.ciclo ? el.dataset.ciclo.split(",").map((v, j) => (j ? Number(v) : v)) : null,
          op: 1,
        };
      });
      // Caja en pantalla de cada conjunto armado, para encuadrar la camara
      // (getBBox mide igual aunque la vista este oculta con visibility).
      const cajas = {};
      for (const n of nodos) {
        let b;
        try {
          b = n.el.getBBox();
        } catch {
          continue;
        }
        if (!b.width && !b.height) continue;
        const c = (cajas[n.pieza] ??= { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, dx: n.dx, dy: n.dy, ride: n.ride });
        c.x0 = Math.min(c.x0, b.x);
        c.y0 = Math.min(c.y0, b.y);
        c.x1 = Math.max(c.x1, b.x + b.width);
        c.y1 = Math.max(c.y1, b.y + b.height);
      }
      const info = { i, g, maquina, nodos, orden: nodos.map((_, k) => k), cajas, meta };
      marcarNodos(info);
      return info;
    });
  vistas.set(i, promesa);
  return promesa;
}

function marcarNodos(v) {
  const sel = seleccion.pieza;
  for (const n of v.nodos) {
    if (sel && n.pieza === sel) n.el.setAttribute("data-on", "");
    else n.el.removeAttribute("data-on");
    if (seleccion.sensor && n.sensor === seleccion.sensor) n.el.setAttribute("data-sensor-on", "");
    else n.el.removeAttribute("data-sensor-on");
    const c = nivelCalor(n.pieza);
    if (c === null) n.el.removeAttribute("data-c");
    else n.el.setAttribute("data-c", String(c));
  }
}

// ───────────── Ciclo de la maquina (simulado) ─────────────
// 50 ciclos/min y 6 sobres por ciclo: mordazas cierran, cuchilla corta, pinzas bajan, la cinta avanza.
const PERIODO = 1.2;
let marcha = false;
let tMarcha = 0;
const suave = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const pulso = (u, a, b, c, d) => suave(a, b, u) * (1 - suave(c, d, u));
function desplazamientoCiclo(n) {
  if (!n.ciclo || (!marcha && tMarcha === 0)) return null;
  const u = (tMarcha / PERIODO) % 1;
  const [tipo, a, b, c] = n.ciclo;
  if (tipo === "cinta") {
    const x0 = a;
    let x = x0 + ((tMarcha / PERIODO) * 50) % 250;
    if (x > 282) x -= 250;
    return { off: [x - x0, 0, 0], op: suave(40, 62, x) * (1 - suave(268, 290, x)) };
  }
  const f = tipo === "mordaza" ? pulso(u, 0.16, 0.28, 0.46, 0.58) : tipo === "cuchilla" ? pulso(u, 0.56, 0.6, 0.63, 0.7) : pulso(u, 0.62, 0.74, 0.86, 0.98);
  return { off: [a * f, b * f, c * f], op: 1 };
}

function colocar(v) {
  const M = v.meta;
  for (const n of v.nodos) {
    const s = n.ride === "film" ? 0 : resorte[n.ride].x;
    let tx = n.dx * s;
    let ty = n.dy * s;
    n.cl = 0;
    const c = n.ciclo ? desplazamientoCiclo(n) : null;
    if (c) {
      const [ox, oy, oz] = c.off;
      tx += ox * M.EX[0] + oy * M.EY[0] + oz * M.EZ[0];
      ty += ox * M.EX[1] + oy * M.EY[1] + oz * M.EZ[1];
      n.cl = ox * M.V[0] + oy * M.V[1] + oz * M.V[2];
      if (Math.abs(c.op - n.op) > 0.01) {
        n.op = c.op;
        n.el.style.opacity = c.op < 0.995 ? c.op.toFixed(3) : "";
      }
    } else if (n.ciclo && n.op !== 1) {
      n.op = 1;
      n.el.style.opacity = "";
    }
    if (Math.abs(tx - n.tx) > 0.02 || Math.abs(ty - n.ty) > 0.02) {
      n.tx = tx;
      n.ty = ty;
      if (Math.abs(tx) < 0.02 && Math.abs(ty) < 0.02) n.el.removeAttribute("transform");
      else n.el.setAttribute("transform", `translate(${tx.toFixed(2)} ${ty.toFixed(2)})`);
    }
    if (n.pieza === "film") {
      const o = Math.max(0, 1 - resorte.film.x * 1.6);
      n.el.style.opacity = o < 0.999 ? o.toFixed(3) : "";
      n.el.style.display = o < 0.01 ? "none" : "";
    }
  }
  const clave = (n) => n.k + (n.ride === "film" ? 0 : n.lift * resorte[n.ride].x) + (n.cl || 0);
  const orden = v.nodos.map((n) => n.idx).sort((a, b) => clave(v.nodos[a]) - clave(v.nodos[b]));
  let cambio = false;
  for (let j = 0; j < orden.length; j++) if (orden[j] !== v.orden[j]) { cambio = true; break; }
  if (cambio) {
    const frag = document.createDocumentFragment();
    for (const j of orden) frag.appendChild(v.nodos[j].el);
    v.maquina.appendChild(frag);
    v.orden = orden;
  }
}

async function mostrarVista(i, { suave = true } = {}) {
  i = ((i % D.vistas.length) + D.vistas.length) % D.vistas.length;
  if (i === actual) return;
  cargando.hidden = vistas.has(i);
  let nueva;
  try {
    nueva = await cargarVista(i);
  } catch (e) {
    cargando.textContent = "No se pudo cargar la vista. Ábrela desde la app o un servidor (no como archivo).";
    cargando.hidden = false;
    console.error(e);
    return;
  }
  cargando.hidden = true;
  const anterior = actual >= 0 ? await vistas.get(actual) : null;
  // Mantener lo que se miraba: si hay zoom sobre una pieza, se sigue mirando esa pieza.
  const foco = camara.manual ? focoActual(anterior) : null;
  actual = i;
  infoActual = nueva;
  colocar(nueva);
  nueva.g.removeAttribute("data-fuera");
  if (!suave || quieto.matches) nueva.g.style.transition = "none";
  if (anterior && anterior !== nueva) anterior.g.setAttribute("data-fuera", "");
  requestAnimationFrame(() => (nueva.g.style.transition = ""));
  if (foco) centrarEn(foco.pieza, foco.zoom, true);
  else if (!camara.manual) apuntarCamara(!anterior);
  $$(".gm-brujula button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.vista) === i)));
  decir();
  // Precargar las vecinas para que el giro sea inmediato.
  for (const j of [i + 1, i - 1]) cargarVista(((j % D.vistas.length) + D.vistas.length) % D.vistas.length).catch(() => {});
  correr();
}

const girar = (paso) => mostrarVista(actual + paso);

// ───────────── Camara (viewBox) ─────────────
const camara = { x: 0, y: 0, w: D.W, h: D.H, meta: null, manual: false };

function aspecto() {
  const r = escena.getBoundingClientRect();
  return r.width / Math.max(1, r.height);
}
function ajustar(rect, margen = 0.06) {
  let [x, y, w, h] = rect;
  x -= w * margen;
  y -= h * margen;
  w *= 1 + 2 * margen;
  h *= 1 + 2 * margen;
  // dejar sitio abajo para los mandos
  h += 90 * (h / Math.max(300, escena.clientHeight));
  const a = aspecto();
  if (w / h > a) {
    const nh = w / a;
    y -= (nh - h) / 2;
    h = nh;
  } else {
    const nw = h * a;
    x -= (nw - w) / 2;
    w = nw;
  }
  return { x, y, w, h };
}

function encuadre(v) {
  // Union de las cajas de los conjuntos visibles, movidas a donde van a quedar.
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [pieza, c] of Object.entries(v.cajas)) {
    if (pieza === "film") continue;
    if (pieza === "resguardos" && sinResguardos) continue;
    const r = resorte[c.ride];
    const s = r.pending ? r.pending.value : r.target;
    const ox = c.dx * s;
    const oy = c.dy * s;
    x0 = Math.min(x0, c.x0 + ox);
    y0 = Math.min(y0, c.y0 + oy);
    x1 = Math.max(x1, c.x1 + ox);
    y1 = Math.max(y1, c.y1 + oy);
  }
  if (!isFinite(x0)) return ajustar(D.vistas[v.i].armado);
  return ajustar([x0, y0, x1 - x0, y1 - y0]);
}

async function apuntarCamara(inmediato = false) {
  if (actual < 0) return;
  const v = await vistas.get(actual);
  camara.meta = encuadre(v);
  camara.manual = false;
  escena.removeAttribute("data-zoom");
  if (inmediato) {
    Object.assign(camara, camara.meta);
    pintarCamara();
  }
  correr();
}

function pintarCamara() {
  svg.setAttribute("viewBox", `${camara.x.toFixed(2)} ${camara.y.toFixed(2)} ${camara.w.toFixed(2)} ${camara.h.toFixed(2)}`);
}

function avanzarCamara(dt) {
  if (!camara.meta) return false;
  const t = quieto.matches ? 1 : 1 - Math.exp(-dt / 0.16);
  let moviendo = false;
  for (const k of ["x", "y", "w", "h"]) {
    const d = camara.meta[k] - camara[k];
    if (Math.abs(d) > 0.05) {
      camara[k] += d * t;
      moviendo = true;
    } else camara[k] = camara.meta[k];
  }
  pintarCamara();
  return moviendo;
}

function aSvg(clientX, clientY) {
  const r = escena.getBoundingClientRect();
  return [camara.x + ((clientX - r.left) / r.width) * camara.w, camara.y + ((clientY - r.top) / r.height) * camara.h];
}

function zoomEn(factor, cx, cy) {
  const base = camara.meta ?? camara;
  const r = escena.getBoundingClientRect();
  const [px, py] = aSvg(cx ?? r.left + r.width / 2, cy ?? r.top + r.height / 2);
  const w = Math.max(40, Math.min(D.W * 1.6, base.w * factor));
  const h = w / aspecto();
  const fx = (px - base.x) / base.w;
  const fy = (py - base.y) / base.h;
  camara.meta = { x: px - fx * w, y: py - fy * h, w, h };
  camara.manual = true;
  escena.setAttribute("data-zoom", "");
  decir();
  correr();
}

function moverCamara(dxPx, dyPx) {
  const r = escena.getBoundingClientRect();
  const base = camara.meta ?? camara;
  const kx = base.w / r.width;
  camara.meta = { ...base, x: base.x - dxPx * kx, y: base.y - dyPx * kx };
  Object.assign(camara, { x: camara.meta.x, y: camara.meta.y });
  camara.manual = true;
  escena.setAttribute("data-zoom", "");
  pintarCamara();
}

function cajaPieza(v, pieza) {
  const c = v.cajas[pieza];
  if (!c) return null;
  const s = resorte[c.ride].x;
  return [c.x0 + c.dx * s, c.y0 + c.dy * s, c.x1 - c.x0, c.y1 - c.y0];
}
function focoActual(v) {
  if (!v || !seleccion.pieza) return null;
  const caja = cajaPieza(v, seleccion.pieza);
  if (!caja) return null;
  return { pieza: seleccion.pieza, zoom: (camara.meta ?? camara).w / Math.max(caja[2], caja[3] * aspecto()) };
}
async function centrarEn(pieza, zoom = null, conservar = false) {
  const v = await vistas.get(actual);
  const caja = cajaPieza(v, pieza);
  if (!caja) return;
  const r = ajustar(caja, 0.35);
  if (conservar && zoom) {
    const w = Math.max(r.w, Math.max(caja[2], caja[3] * aspecto()) * zoom);
    const h = w / aspecto();
    camara.meta = { x: caja[0] + caja[2] / 2 - w / 2, y: caja[1] + caja[3] / 2 - h / 2, w, h };
  } else camara.meta = r;
  camara.manual = true;
  escena.setAttribute("data-zoom", "");
  correr();
}

// ───────────── Bucle ─────────────
let corriendo = false;
let ultimo = 0;
function correr() {
  if (corriendo) return;
  corriendo = true;
  ultimo = performance.now();
  requestAnimationFrame(cuadro);
}
function cuadro(t) {
  const dt = Math.min(0.05, Math.max(0, (t - ultimo) / 1000));
  ultimo = t;
  reloj += dt;
  if (marcha) tMarcha += dt;
  const resortes = avanzarResortes(dt) || marcha;
  if (infoActual) colocar(infoActual);
  const cam = avanzarCamara(dt);
  const pendiente = IDS.some((id) => resorte[id].pending);
  if (resortes || cam || pendiente) requestAnimationFrame(cuadro);
  else {
    corriendo = false;
    decir();
  }
}
new ResizeObserver(() => {
  if (!camara.manual) apuntarCamara(true);
  else {
    const base = camara.meta ?? camara;
    const h = base.w / aspecto();
    camara.meta = { ...base, y: base.y + (base.h - h) / 2, h };
    Object.assign(camara, camara.meta);
    pintarCamara();
  }
}).observe(escena);

// ───────────── Seleccion ─────────────
const seleccion = { pieza: null, sensor: null, pestana: "resumen" };
let aislar = false;
let sinResguardos = true;
let calor = false;

function seleccionar_(pieza, { sensor = null, pestana } = {}) {
  if (pieza === "bastidor" && !sensor && seleccion.pieza === "bastidor") pieza = null;
  const cambia = pieza !== seleccion.pieza;
  seleccion.pieza = pieza;
  seleccion.sensor = sensor;
  if (pestana) seleccion.pestana = pestana;
  else if (cambia) seleccion.pestana = sensor ? "sensores" : "resumen";
  if (pieza) svg.setAttribute("data-foco", "");
  else svg.removeAttribute("data-foco");
  if (aislar && pieza) svg.setAttribute("data-aislar", "");
  else svg.removeAttribute("data-aislar");
  for (const p of vistas.values()) p.then(marcarNodos).catch(() => {});
  $$(".gm-parte").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pieza === pieza)));
  pintarPanel();
  decir();
}

function decir() {
  const meta = D.vistas[actual];
  if (!meta) return;
  const estado = marcha ? "en marcha (simulación) · 50 ciclos/min · 300 sobres/min" : paso === 0 ? "armada" : paso === PASOS.length ? "desarmada" : `paso ${paso} de ${PASOS.length}`;
  const zoom = camara.manual && camara.meta ? ` · zoom ×${(D.vistas[actual].armado[2] / camara.meta.w * 1.25).toFixed(1)}` : "";
  const texto = `vista ${actual + 1}/8 · ${NOMBRE_VISTA(meta.az)} · ${estado}${zoom}`;
  if (lectura.textContent !== texto) lectura.textContent = texto;
  const p = camara.manual ? "arrastra para mover · doble clic encuadra" : "arrastra para girar · rueda para acercar";
  if (pista.textContent !== p) pista.textContent = p;
}

// ───────────── Mandos ─────────────
function actualizarMandos() {
  pasoTxt.textContent = `${paso}/${PASOS.length}`;
  $("[data-accion=antes]").disabled = paso === 0;
  $("[data-accion=despues]").disabled = paso === PASOS.length;
  const des = $("[data-accion=desarmar]");
  const armada = paso === 0;
  des.querySelector(".gm-btn__txt").textContent = armada ? "Desarmar" : "Armar";
  des.setAttribute("aria-label", armada ? "Desarmar la máquina" : "Armar la máquina");
  $("[data-accion=resguardos]").setAttribute("aria-pressed", String(!sinResguardos));
  $("[data-accion=calor]").setAttribute("aria-pressed", String(calor));
  $("[data-accion=aislar]").setAttribute("aria-pressed", String(aislar));
  const bm = $("[data-accion=marcha]");
  bm.setAttribute("aria-pressed", String(marcha));
  bm.querySelector(".gm-btn__txt").textContent = marcha ? "Detener" : "En marcha";
}

const acciones = {
  marcha: () => {
    marcha = !marcha;
    if (marcha && paso !== 0) irAPaso(0, { seleccionar: false });
    if (!marcha) tMarcha = 0;
    actualizarMandos();
    decir();
    correr();
  },
  izq: () => girar(-1),
  der: () => girar(1),
  desarmar: () => irAPaso(paso === 0 ? PASOS.length : 0, { seleccionar: paso !== 0 }),
  antes: () => irAPaso(paso - 1),
  despues: () => irAPaso(paso + 1),
  mas: () => zoomEn(1 / 1.4),
  menos: () => zoomEn(1.4),
  encuadrar: () => apuntarCamara(),
  resguardos: () => {
    sinResguardos = !sinResguardos;
    if (sinResguardos) svg.setAttribute("data-sin-resguardos", "");
    else svg.removeAttribute("data-sin-resguardos");
    if (!camara.manual) apuntarCamara();
    actualizarMandos();
  },
  calor: () => {
    calor = !calor;
    if (calor) {
      svg.setAttribute("data-calor", "");
      escena.setAttribute("data-calor", "");
    } else {
      svg.removeAttribute("data-calor");
      escena.removeAttribute("data-calor");
    }
    actualizarMandos();
  },
  aislar: () => {
    aislar = !aislar;
    if (aislar && seleccion.pieza) svg.setAttribute("data-aislar", "");
    else svg.removeAttribute("data-aislar");
    actualizarMandos();
  },
  tema: () => {
    const oscuro = document.body.dataset.theme !== "dark";
    document.body.dataset.theme = oscuro ? "dark" : "light";
    document.documentElement.dataset.theme = oscuro ? "dark" : "light";
    try {
      localStorage.setItem("gm-tema", oscuro ? "dark" : "light");
    } catch {}
  },
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-accion]");
  if (b && acciones[b.dataset.accion]) {
    acciones[b.dataset.accion]();
    return;
  }
  const v = e.target.closest("[data-vista]");
  if (v) mostrarVista(Number(v.dataset.vista));
});

// ───────────── Puntero: girar, mover, zoom, seleccionar ─────────────
const punteros = new Map();
let gesto = null;
escena.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".gm-mandos, .gm-brujula")) return;
  escena.setPointerCapture(e.pointerId);
  punteros.set(e.pointerId, [e.clientX, e.clientY]);
  if (punteros.size === 2) {
    const [a, b] = [...punteros.values()];
    gesto = { tipo: "pellizco", d: Math.hypot(a[0] - b[0], a[1] - b[1]), c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
    return;
  }
  const mover = camara.manual || e.shiftKey || e.button === 1 || e.button === 2;
  gesto = { tipo: mover ? "mover" : "girar", x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, acum: 0, movio: false };
});
escena.addEventListener("pointermove", (e) => {
  if (!punteros.has(e.pointerId)) {
    pasar(e);
    return;
  }
  punteros.set(e.pointerId, [e.clientX, e.clientY]);
  if (!gesto) return;
  if (gesto.tipo === "pellizco" && punteros.size === 2) {
    const [a, b] = [...punteros.values()];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    zoomEn(gesto.d / d, c[0], c[1]);
    Object.assign(camara, camara.meta);
    moverCamara(c[0] - gesto.c[0], c[1] - gesto.c[1]);
    gesto.d = d;
    gesto.c = c;
    return;
  }
  const dx = e.clientX - gesto.x;
  const dy = e.clientY - gesto.y;
  gesto.x = e.clientX;
  gesto.y = e.clientY;
  if (Math.hypot(e.clientX - gesto.x0, e.clientY - gesto.y0) > 5) gesto.movio = true;
  if (!gesto.movio) return;
  escena.setAttribute("data-arrastre", gesto.tipo);
  ocultarEtiqueta();
  if (gesto.tipo === "mover") moverCamara(dx, dy);
  else {
    gesto.acum += dx;
    const umbral = Math.max(60, escena.clientWidth / 14);
    while (gesto.acum > umbral) {
      gesto.acum -= umbral;
      girar(-1);
    }
    while (gesto.acum < -umbral) {
      gesto.acum += umbral;
      girar(1);
    }
  }
});
const soltar = (e) => {
  if (!punteros.has(e.pointerId)) return;
  punteros.delete(e.pointerId);
  escena.removeAttribute("data-arrastre");
  if (gesto && !gesto.movio && gesto.tipo !== "pellizco" && e.type === "pointerup") tocar(e);
  if (punteros.size === 0) gesto = null;
};
escena.addEventListener("pointerup", soltar);
escena.addEventListener("pointercancel", soltar);
escena.addEventListener("contextmenu", (e) => e.preventDefault());
escena.addEventListener("wheel", (e) => {
  e.preventDefault();
  zoomEn(Math.exp(e.deltaY * 0.0016), e.clientX, e.clientY);
}, { passive: false });
escena.addEventListener("dblclick", (e) => {
  if (e.target.closest(".gm-mandos")) return;
  apuntarCamara();
});
escena.addEventListener("pointerleave", ocultarEtiqueta);

function itemEn(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  return el && el.closest ? el.closest(".it") : null;
}
function tocar(e) {
  const it = itemEn(e);
  if (!it) {
    seleccionar_(null);
    return;
  }
  const pieza = it.dataset.piece;
  const sensor = it.dataset.sensor || null;
  if (sensor) seleccionar_(pieza, { sensor, pestana: "sensores" });
  else seleccionar_(pieza === seleccion.pieza && !seleccion.sensor ? null : pieza);
}
let hoverPieza = null;
function pasar(e) {
  const it = itemEn(e);
  const pieza = it?.dataset.piece ?? null;
  if (pieza !== hoverPieza) {
    hoverPieza = pieza;
    for (const p of vistas.values())
      p.then((v) => v.nodos.forEach((n) => (n.pieza === pieza ? n.el.setAttribute("data-hover", "") : n.el.removeAttribute("data-hover")))).catch(() => {});
  }
  if (!it) {
    ocultarEtiqueta();
    return;
  }
  const r = escena.getBoundingClientRect();
  const s = it.dataset.sensor ? D.sensores.find((x) => x.sigla === it.dataset.sensor) : null;
  const n = fallasPorPieza[pieza] ?? 0;
  etiqueta.innerHTML = s
    ? `<b>${esc(s.sigla)}</b> · ${esc(s.f)}<small>${esc(s.marca)} ${esc(s.tipo)} · hilo ${esc(s.hilo)}</small>`
    : `<b>${esc(D.piezas[pieza].nombre)}</b><small>${esc(D.piezas[pieza].corto)}${n ? ` · ${n} intervenciones` : ""}</small>`;
  etiqueta.style.left = `${e.clientX - r.left}px`;
  etiqueta.style.top = `${e.clientY - r.top}px`;
  etiqueta.setAttribute("data-on", "");
}
function ocultarEtiqueta() {
  etiqueta.removeAttribute("data-on");
}

escena.addEventListener("keydown", (e) => {
  const k = e.key;
  if (k === "ArrowLeft") girar(-1);
  else if (k === "ArrowRight") girar(1);
  else if (k === "ArrowDown" || k === "]") irAPaso(paso + 1);
  else if (k === "ArrowUp" || k === "[") irAPaso(paso - 1);
  else if (k === "d" || k === "D") acciones.desarmar();
  else if (k === "+" || k === "=") zoomEn(1 / 1.4);
  else if (k === "-") zoomEn(1.4);
  else if (k === "0") apuntarCamara();
  else if (k === "Escape") seleccionar_(null);
  else return;
  e.preventDefault();
});

// ───────────── Mapa de fallas ─────────────
function nivelCalor(pieza) {
  if (pieza === "film" || pieza === "resguardos") return null;
  const n = fallasPorPieza[pieza] ?? 0;
  const max = Math.max(1, ...Object.entries(fallasPorPieza).filter(([p]) => p !== "film").map(([, v]) => v));
  if (!n) return 0;
  return Math.max(1, Math.min(4, Math.ceil((n / max) * 4)));
}
function pintarCalor() {
  for (const p of vistas.values()) p.then(marcarNodos).catch(() => {});
}

// ───────────── Leyenda ─────────────
function pintarLeyenda() {
  const lista = $(".gm-partes");
  lista.innerHTML = D.lectura
    .map((id) => {
      const n = fallasPorPieza[id] ?? 0;
      return `<button type="button" class="gm-parte" data-pieza="${id}" aria-pressed="${seleccion.pieza === id}"><span class="gm-parte__num">${String(NUM[id]).padStart(2, "0")}</span><span class="gm-parte__nom">${esc(D.piezas[id].nombre)}</span>${n ? `<span class="gm-parte__n" data-tono="${n >= 5 ? "warn" : ""}" title="intervenciones en el chat">${n}</span>` : ""}</button>`;
    })
    .join("");
}
$(".gm-partes").addEventListener("click", (e) => {
  const b = e.target.closest(".gm-parte");
  if (!b) return;
  const id = b.dataset.pieza;
  seleccionar_(seleccion.pieza === id ? null : id);
});
$(".gm-partes").addEventListener("mouseover", (e) => {
  const b = e.target.closest(".gm-parte");
  const pieza = b?.dataset.pieza ?? null;
  for (const p of vistas.values()) p.then((v) => v.nodos.forEach((n) => (n.pieza === pieza ? n.el.setAttribute("data-hover", "") : n.el.removeAttribute("data-hover")))).catch(() => {});
});

// ───────────── Panel ─────────────
const fecha = (f) => {
  if (!f) return "";
  const [a, m, d] = f.split("-");
  return `${d}/${m}/${a.slice(2)}`;
};
const url = (ruta) => `${D.base ?? D.remoto}${ruta}`;
const app = (params) => `${D.app}?${new URLSearchParams(params)}`;
const SIGLAS = new Set(D.sensores.map((s) => s.sigla));
const conSiglas = (texto) =>
  esc(texto).replace(/\b([BKYS]\d{1,2}A?\.\d{1,2})\b/g, (m) => (SIGLAS.has(m) ? `<button type="button" class="gm-sigla" data-sigla="${m}">${m}</button>` : m));

function sensoresDe(id) {
  return D.sensores.filter((s) => s.pieza === id);
}
function repuestosDe(id) {
  return D.repuestos.filter((r) => r.pieza === id);
}
function fallasDe(id) {
  return D.fallas.filter((f) => f.piezas.includes(id));
}
function tareasDe(id) {
  return D.tareas.filter((t) => t.pieza === id);
}
function historialDe(id) {
  return historial.filter((h) => h.pieza === id).sort((a, b) => (b.f + b.hr).localeCompare(a.f + a.hr));
}
function gruposDe(id) {
  const p = D.piezas[id];
  const out = [];
  for (const cod of p.codigos) {
    if (D.grupos[cod]) out.push([cod, D.grupos[cod]]);
    else {
      // sub-laminas (p. ej. la tapa del carter vive dentro de S4M01100110)
      for (const [gc, g] of Object.entries(D.grupos)) {
        const hojas = g.hojas.filter((h) => h.tav === cod);
        if (hojas.length) out.push([cod, { n: `${g.n} · lámina ${cod}`, d: "", fuente: g.fuente, hojas, piezas: hojas.flatMap((h) => h.p), proc: [] }]);
      }
    }
  }
  return out;
}

function pintarPanel() {
  if (seleccion.sensor) return panelSensor(seleccion.sensor);
  if (seleccion.pieza) return panelPieza(seleccion.pieza);
  panelResumen();
}

function cifras(lista) {
  return `<div class="gm-cifras">${lista.map(([n, t, pest, tono]) => `<button type="button" class="gm-cifra" ${pest ? `data-pestana="${pest}"` : ""} data-tono="${tono ?? ""}"><b>${n}</b><span>${t}</span></button>`).join("")}</div>`;
}

function panelResumen() {
  const m = D.maquina;
  const totalPiezas = Object.values(D.grupos).reduce((a, g) => a + (g.piezas?.length ?? 0), 0);
  panelCab.innerHTML = `
    <div class="gm-panel__migas">Gemelo virtual · ${esc(D.ref)}</div>
    <h2 class="gm-panel__tit">${esc(m.nombre)}</h2>
    <p class="gm-panel__sub">${esc(m.area)} · ${esc(m.sede)} · equipo ${esc(m.equipoCod)} · causa ${esc(m.causaCod)}</p>
    <div class="gm-panel__chips">${(m.resumen ?? []).map((s) => `<span class="gm-chip">${esc(s.label)} <b>${esc(s.value)}</b></span>`).join("")}</div>`;
  const ranking = Object.entries(fallasPorPieza).filter(([p]) => D.piezas[p]).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...ranking.map(([, n]) => n));
  panelCuerpo.innerHTML = `
    ${cifras([
      [Object.keys(D.grupos).length, "grupos del catálogo"],
      [totalPiezas.toLocaleString("es-CO"), "números de pieza"],
      [D.sensores.length, "sensores"],
      [historial.length, "intervenciones", null, "warn"],
    ])}
    <p class="gm-nota">Toca una pieza de la máquina o un conjunto de la lista para ver sus láminas, sensores, repuestos y el historial del chat. Desármala paso a paso con <b>▼</b> o toda de una con <b>Desarmar</b>.</p>
    <h3 class="gm-sec">Dónde falla · chat ${fecha(D.mtto.desde)}–${fecha(D.mtto.hasta)}</h3>
    <div class="gm-barras">${ranking
      .map(([p, n]) => `<button type="button" class="gm-barra" data-pieza="${p}"><span class="gm-barra__nom">${esc(D.piezas[p].nombre)}</span><span class="gm-barra__pista"><span class="gm-barra__llena" style="width:${((n / max) * 100).toFixed(0)}%"></span></span><span class="gm-barra__n">${n}</span></button>`)
      .join("")}</div>
    <h3 class="gm-sec">El recorrido del papel</h3>
    <ol class="gm-pasos">${["bobina", "desbobinado", "guias", "fotocelula", "dosificacion", "soldadura", "arrastre", "corte", "pinzas", "salida"].map((id) => `<li><a href="#" data-pieza="${id}">${esc(D.piezas[id].nombre)}</a> — ${esc(D.piezas[id].corto)}</li>`).join("")}</ol>
    <h3 class="gm-sec">Documentos</h3>
    <ul class="gm-lista">${(m.documentos ?? []).map((d) => `<li><a class="gm-fila gm-fila--boton" href="${url(d.file)}" target="_blank" rel="noopener"><span class="gm-fila__tit">${esc(d.name)}</span></a></li>`).join("")}</ul>
    <p class="gm-nota" style="margin-top:14px">Modelo 3D dibujado a partir del catálogo de piezas y el plano de disposición del esquema eléctrico: es fiel a los conjuntos y a su función, no a la cota exacta. Hecho con el kit <a href="https://github.com/wheresryan22/anatomy" target="_blank" rel="noopener">Anatomy</a> (MIT).</p>`;
}

function panelPieza(id) {
  const p = D.piezas[id];
  const grupos = gruposDe(id);
  const sens = sensoresDe(id);
  const reps = repuestosDe(id);
  const fal = fallasDe(id);
  const tar = tareasDe(id);
  const his = historialDe(id);
  const hojas = grupos.reduce((a, [, g]) => a + g.hojas.length, 0);
  const procs = grupos.flatMap(([cod, g]) => g.proc.map((pr) => ({ ...pr, cod })));
  const numPiezas = grupos.reduce((a, [, g]) => a + (g.piezas?.length ?? 0), 0);
  panelCab.innerHTML = `
    <div class="gm-panel__migas"><button type="button" data-volver>MS235</button> › conjunto ${String(NUM[id] ?? "").padStart(2, "0")}</div>
    <h2 class="gm-panel__tit">${esc(p.nombre)}</h2>
    <p class="gm-panel__sub">${esc(p.corto)}</p>
    <div class="gm-panel__chips">${p.codigos.map((c) => `<span class="gm-chip gm-chip--mono">${esc(c)}</span>`).join("")}${grupos.some(([, g]) => g.fuente === "por confirmar") ? '<span class="gm-chip" data-tono="warn">asignación por confirmar</span>' : ""}</div>`;
  const pestanas = [
    ["resumen", "Resumen", null],
    ["despiece", "Despiece", hojas],
    ["proc", "Procedimientos", procs.length],
    ["sensores", "Sensores", sens.length],
    ["repuestos", "Repuestos", reps.length],
    ["fallas", "Fallas", fal.length],
    ["historial", "Historial", his.length],
    ["tareas", "Tareas", tar.length],
  ].filter(([k, , n]) => k === "resumen" || n);
  if (!pestanas.some(([k]) => k === seleccion.pestana)) seleccion.pestana = "resumen";
  const barra = `<div class="gm-pestanas" role="tablist">${pestanas.map(([k, t, n]) => `<button type="button" class="gm-pestana" role="tab" data-pestana="${k}" aria-selected="${seleccion.pestana === k}">${t}${n ? `<small>${n}</small>` : ""}</button>`).join("")}</div>`;
  let cuerpo = "";
  const pest = seleccion.pestana;
  if (pest === "resumen") {
    cuerpo = `<p style="margin-top:12px">${esc(p.desc)}</p>
      ${cifras([
        [his.length, "intervenciones", "historial", his.length ? "warn" : ""],
        [sens.length, "sensores", "sensores"],
        [reps.length, "repuestos", "repuestos"],
        [hojas, "láminas", "despiece"],
      ])}
      ${his.length ? `<h3 class="gm-sec">Última intervención</h3>${filaHistorial(his[0])}` : ""}
      ${fal.length ? `<h3 class="gm-sec">Fallas que se diagnostican aquí</h3><ul class="gm-lista">${fal.map((f, i) => `<li><button type="button" class="gm-fila gm-fila--boton" data-pestana="fallas" data-falla="${i}"><span class="gm-fila__tit">${esc(f.name)}</span><div class="gm-fila__meta">${esc(f.status)}</div></button></li>`).join("")}</ul>` : ""}
      ${tar.length ? `<h3 class="gm-sec">Mantenimiento preventivo</h3><ul class="gm-lista">${tar.map(filaTarea).join("")}</ul>` : ""}
      ${numPiezas ? `<p class="gm-nota" style="margin-top:12px">${numPiezas} números de pieza en ${hojas} láminas del catálogo S4220003.</p>` : ""}
      <p style="margin-top:10px"><button type="button" class="gm-btn" data-accion-panel="centrar">Acercar a esta pieza</button> <button type="button" class="gm-btn" data-accion="aislar">Aislar</button></p>`;
  } else if (pest === "despiece") {
    cuerpo = grupos
      .map(([cod, g]) => `<h3 class="gm-sec">${esc(cod)} · ${esc(g.n)}</h3>${g.d ? `<p class="gm-nota">${esc(g.d)}</p>` : ""}
        <div class="gm-hojas">${g.hojas.map((h, i) => `<button type="button" class="gm-hoja" data-hoja="${esc(cod)}|${i}"><img loading="lazy" src="${url(h.img)}" alt="Lámina ${esc(h.tav)} página ${h.pg}"><span>${esc(h.tav)} · p.${h.pg}</span></button>`).join("")}</div>`)
      .join("");
  } else if (pest === "proc") {
    cuerpo = `<ul class="gm-lista" style="margin-top:12px">${procs.map((pr, i) => `<li><button type="button" class="gm-fila gm-fila--boton" data-proc="${i}"><div class="gm-fila__cab"><span class="gm-fila__tit">${esc(pr.t)}</span><span class="gm-fila__meta">p.${pr.pg}</span></div><div class="gm-fila__meta">${esc(pr.cod)} · Manual de Calibrado</div></button></li>`).join("")}</ul>`;
  } else if (pest === "sensores") {
    cuerpo = `<ul class="gm-lista" style="margin-top:12px">${sens.map(filaSensor).join("")}</ul><p class="gm-nota" style="margin-top:10px">Toca un sensor para encontrarlo en la máquina. Siglas y cables del esquema ES4220003.</p>`;
  } else if (pest === "repuestos") {
    cuerpo = `<ul class="gm-lista" style="margin-top:12px">${reps.map(filaRepuesto).join("")}</ul>`;
  } else if (pest === "fallas") {
    cuerpo = fal.map(bloqueFalla).join("");
  } else if (pest === "historial") {
    cuerpo = `<p class="gm-nota" style="margin-top:12px">${his.length} intervenciones del chat de mantenimiento asignadas a este conjunto por lo que dice el reporte.</p><ul class="gm-lista">${his.map((h) => `<li>${filaHistorial(h)}</li>`).join("")}</ul>`;
  } else if (pest === "tareas") {
    cuerpo = `<ul class="gm-lista" style="margin-top:12px">${tar.map(filaTarea).join("")}</ul>`;
  }
  panelCuerpo.innerHTML = barra + cuerpo;
  panelCuerpo.scrollTop = 0;
}

function filaSensor(s) {
  const on = seleccion.sensor === s.sigla;
  return `<li><button type="button" class="gm-fila gm-fila--boton" data-sigla="${esc(s.sigla)}" style="${on ? "border-color:var(--gm-accent)" : ""}"><div class="gm-fila__cab"><span class="gm-fila__tit"><span class="gm-mono">${esc(s.sigla)}</span> · ${esc(s.f)}</span><span class="gm-fila__meta">hilo ${esc(s.hilo)}</span></div><div class="gm-fila__meta">${esc(s.den)} ${esc(s.marca)} ${esc(s.tipo)} · <span class="gm-mono">${esc(s.cod)}</span></div></button></li>`;
}
function filaRepuesto(r) {
  const interno = /^7\d{8}$/.test(r.codigo) || /^\d{7}$/.test(r.codigo);
  const enlace = r.codigo ? `<a href="${app({ v: "almacen", q: r.codigo })}" target="_top">buscar en almacén</a>` : "";
  return `<li class="gm-fila"><div class="gm-fila__cab"><span class="gm-fila__tit">${esc(r.nombre)}</span>${r.criticidad ? `<span class="gm-chip" data-tono="${r.criticidad === "Alta" ? "warn" : ""}">${esc(r.criticidad)}</span>` : ""}</div><div class="gm-fila__meta gm-mono">${esc(r.ref)}</div>${r.funcion ? `<div class="gm-fila__txt">${conSiglas(r.funcion)}</div>` : ""}${enlace ? `<div class="gm-fila__meta" style="margin-top:3px">${interno ? "código interno · " : ""}${enlace}</div>` : ""}</li>`;
}
function filaTarea(t) {
  return `<li class="gm-fila"><div class="gm-fila__cab"><span class="gm-fila__tit">${esc(t.nombre)}</span><span class="gm-chip" data-tono="acc">${esc(t.frecuencia)}</span></div><div class="gm-fila__txt">${esc(t.criterio)}</div><div class="gm-fila__meta">${esc(t.sistema)} · ${esc(t.tipo)}</div></li>`;
}
function filaHistorial(h) {
  const tono = /operativ/i.test(h.ef) ? "ok" : h.ef ? "warn" : "";
  return `<div class="gm-fila"><div class="gm-fila__cab"><span class="gm-fila__tit">${fecha(h.f)} · ${esc(h.t ?? "")}</span><span class="gm-chip" data-tono="${tono}">${esc(h.ef || "—")}</span></div><div class="gm-fila__meta">${esc(h.fa)}${h.min ? ` · ${h.min} min` : ""} · ${esc(h.tec ?? "")}</div><div class="gm-fila__txt" data-corto>${conSiglas(h.de)}</div><div class="gm-fila__meta" style="margin-top:3px"><a href="${app({ v: "registro", fecha: h.f })}" target="_top">ver en el registro diario</a></div></div>`;
}
function bloqueFalla(f) {
  return `<div class="gm-fila" style="margin-top:12px"><div class="gm-fila__tit">${esc(f.name)}</div><div class="gm-fila__meta">${esc(f.probableSystem)} · ${esc(f.status)}</div>
    ${f.symptoms?.length ? `<h3 class="gm-sec">Síntomas</h3><ul class="gm-pasos">${f.symptoms.map((s) => `<li>${conSiglas(s)}</li>`).join("")}</ul>` : ""}
    ${f.checks?.length ? `<h3 class="gm-sec">Qué revisar</h3><ul class="gm-pasos">${f.checks.map((s) => `<li>${conSiglas(s)}</li>`).join("")}</ul>` : ""}
    ${f.correction ? `<p class="gm-fila__txt" style="margin-top:8px">${conSiglas(f.correction)}</p>` : ""}
    ${f.steps?.length ? `<h3 class="gm-sec">Paso a paso</h3><ol class="gm-pasos">${f.steps.map((s) => `<li><b>${esc(s.title)}</b> — ${conSiglas(s.how ?? "")}${s.where ? `<div class="gm-fila__meta">${conSiglas(s.where)}</div>` : ""}</li>`).join("")}</ol>` : ""}
  </div>`;
}

function panelSensor(sigla) {
  const s = D.sensores.find((x) => x.sigla === sigla);
  if (!s) return panelPieza(seleccion.pieza);
  const dibujado = D.sensoresDibujados.includes(sigla);
  const his = historial.filter((h) => new RegExp(`\\b${sigla.replace(".", "\\.")}\\b`).test(h.de));
  const fal = D.fallas.filter((f) => JSON.stringify(f).includes(sigla));
  panelCab.innerHTML = `
    <div class="gm-panel__migas"><button type="button" data-volver>MS235</button> › <button type="button" data-ir-pieza="${s.pieza}">${esc(D.piezas[s.pieza].nombre)}</button> › sensor</div>
    <h2 class="gm-panel__tit"><span class="gm-mono" style="font-size:16px">${esc(s.sigla)}</span> · ${esc(s.f)}</h2>
    <p class="gm-panel__sub">${esc(s.zona)} · ${esc(s.den)}</p>
    <div class="gm-panel__chips"><span class="gm-chip">${esc(s.marca)} ${esc(s.tipo)}</span><span class="gm-chip gm-chip--mono">${esc(s.cod)}</span><span class="gm-chip">hilo ${esc(s.hilo)}</span>${dibujado ? "" : '<span class="gm-chip" data-tono="warn">no dibujado en el modelo</span>'}</div>`;
  panelCuerpo.innerHTML = `
    <p style="margin-top:4px">Según el esquema eléctrico ES4220003, el ${esc(s.den.toLowerCase())} <b>${esc(s.sigla)}</b> (${esc(s.marca)} ${esc(s.tipo)}) entra al PLC por el hilo <b>${esc(s.hilo)}</b>.${s.nota ? ` ${esc(s.nota)}` : ""}</p>
    ${D.repuestos.filter((r) => r.ref.includes(s.cod) || r.ref.includes(s.tipo)).map(filaRepuesto).join("") ? `<h3 class="gm-sec">Repuesto</h3><ul class="gm-lista">${D.repuestos.filter((r) => r.ref.includes(s.cod) || r.ref.includes(s.tipo)).map(filaRepuesto).join("")}</ul>` : ""}
    ${fal.length ? `<h3 class="gm-sec">Aparece en el diagnóstico de</h3><ul class="gm-lista">${fal.map((f) => `<li><button type="button" class="gm-fila gm-fila--boton" data-ir-pieza="${f.piezas[0]}" data-pestana="fallas"><span class="gm-fila__tit">${esc(f.name)}</span></button></li>`).join("")}</ul>` : ""}
    ${his.length ? `<h3 class="gm-sec">En el chat</h3><ul class="gm-lista">${his.map((h) => `<li>${filaHistorial(h)}</li>`).join("")}</ul>` : ""}
    <h3 class="gm-sec">Otros sensores del conjunto</h3><ul class="gm-lista">${sensoresDe(s.pieza).filter((x) => x.sigla !== sigla).map(filaSensor).join("")}</ul>`;
  panelCuerpo.scrollTop = 0;
}

// Clicks del panel
$(".gm-panel").addEventListener("click", (e) => {
  const t = e.target;
  const volver = t.closest("[data-volver]");
  if (volver) return seleccionar_(null);
  const ir = t.closest("[data-ir-pieza]");
  if (ir) return seleccionar_(ir.dataset.irPieza, { pestana: ir.dataset.pestana });
  const sig = t.closest("[data-sigla]");
  if (sig) {
    const s = D.sensores.find((x) => x.sigla === sig.dataset.sigla);
    if (s) {
      seleccionar_(s.pieza, { sensor: s.sigla, pestana: "sensores" });
      if (D.sensoresDibujados.includes(s.sigla)) mostrarSensor(s);
    }
    return;
  }
  const pz = t.closest("[data-pieza]");
  if (pz) {
    e.preventDefault();
    return seleccionar_(pz.dataset.pieza);
  }
  const pe = t.closest("[data-pestana]");
  if (pe) {
    seleccion.pestana = pe.dataset.pestana;
    return pintarPanel();
  }
  const hoja = t.closest("[data-hoja]");
  if (hoja) {
    const [cod, i] = hoja.dataset.hoja.split("|");
    const g = gruposDe(seleccion.pieza).find(([c]) => c === cod)?.[1];
    if (g) abrirVisor(g.hojas[Number(i)], g, cod);
    return;
  }
  const pr = t.closest("[data-proc]");
  if (pr) {
    const procs = gruposDe(seleccion.pieza).flatMap(([cod, g]) => g.proc.map((x) => ({ ...x, cod })));
    const x = procs[Number(pr.dataset.proc)];
    if (x) abrirVisor({ img: x.img, pg: x.pg, tav: x.cod, p: [] }, { n: x.t }, x.cod, true);
    return;
  }
  const ac = t.closest("[data-accion-panel]");
  if (ac && ac.dataset.accionPanel === "centrar" && seleccion.pieza) centrarEn(seleccion.pieza);
});

async function mostrarSensor(s) {
  if (!seleccion.pieza) return;
  const v = await vistas.get(actual);
  const n = v?.nodos.find((x) => x.sensor === s.sigla);
  if (!n) return;
  // Si el conjunto esta tapado por otros, se desarma hasta sacarlo.
  const i = PASOS.indexOf(s.pieza);
  if (i > 0 && paso < i && s.pieza !== "bastidor") irAPaso(i, { seleccionar: false });
  setTimeout(async () => {
    const b = n.el.getBBox();
    const r = ajustar([b.x + n.tx - 40, b.y + n.ty - 40, b.width + 80, b.height + 80], 0);
    camara.meta = r;
    camara.manual = true;
    escena.setAttribute("data-zoom", "");
    correr();
  }, 420);
}

// Visor de laminas
const visor = $(".gm-visor");
function abrirVisor(hoja, grupo, cod, proc = false) {
  $(".gm-visor__img img", visor).src = url(hoja.img);
  $(".gm-visor__img img", visor).alt = `${cod} página ${hoja.pg}`;
  const piezas = hoja.p ?? [];
  $(".gm-visor__lado", visor).innerHTML = `<div class="gm-panel__migas">${proc ? "Manual de Calibrado" : "Catálogo de piezas S4220003"} · p.${hoja.pg}</div>
    <h3 class="gm-panel__tit" style="font-size:16px">${esc(grupo.n ?? cod)}</h3>
    <p class="gm-panel__sub gm-mono">${esc(hoja.tav ?? cod)}</p>
    ${piezas.length ? `<h4 class="gm-sec">${piezas.length} números de pieza en esta lámina</h4><div class="gm-codigos">${piezas.map((c) => `<a href="${app({ v: "almacen", q: c })}" target="_top" title="Buscar en almacén">${esc(c)}</a>`).join("")}</div><p class="gm-nota" style="margin-top:10px">Toca un número para buscarlo en el Almacén de la app.</p>` : ""}
    <p style="margin-top:14px"><a href="${url(hoja.img)}" target="_blank" rel="noopener">Abrir la imagen sola</a></p>`;
  visor.hidden = false;
  $(".gm-visor__cerrar", visor).focus();
}
visor.addEventListener("click", (e) => {
  if (e.target === visor || e.target.closest(".gm-visor__cerrar") || e.target.closest(".gm-visor__img") && e.target.tagName !== "IMG") visor.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !visor.hidden) visor.hidden = true;
});

// ───────────── Arranque ─────────────
const Q0 = new URLSearchParams(location.search);
try {
  const t = Q0.get("tema") || localStorage.getItem("gm-tema");
  if (t) {
    document.body.dataset.theme = t;
    document.documentElement.dataset.theme = t;
  }
} catch {}
svg.setAttribute("data-sin-resguardos", "");
pintarLeyenda();
pintarPanel();
actualizarMandos();
$(".gm-brujula").innerHTML = D.vistas.map((v, i) => `<button type="button" data-vista="${i}" aria-pressed="false" title="Vista ${NOMBRE_VISTA(v.az)}">${i + 1}</button>`).join("");
// Enlaces directos: ?vista=2&pieza=soldadura&paso=6&calor=1&resguardos=1&acercar=1&sensor=B40.1&pestana=historial
const Q = new URLSearchParams(location.search);
const inicial = Number(Q.get("vista") ?? 0) || 0;
mostrarVista(inicial, { suave: false }).then(() => {
  if (Q.get("resguardos") === "1") acciones.resguardos();
  if (Q.get("calor") === "1") acciones.calor();
  if (Q.get("marcha") === "1") acciones.marcha();
  if (Q.has("ciclo")) {
    // cuadro fijo del ciclo (0 a 1), para capturas
    tMarcha = Number(Q.get("ciclo")) * PERIODO + PERIODO * 0.0001;
    if (infoActual) colocar(infoActual);
  }
  if (Q.has("paso")) irAPaso(Number(Q.get("paso")) || 0, { seleccionar: !Q.has("pieza"), inmediato: true });
  const sensorUrl = D.sensores.find((s) => s.sigla === Q.get("sensor"));
  if (sensorUrl) {
    seleccionar_(sensorUrl.pieza, { sensor: sensorUrl.sigla, pestana: "sensores" });
    mostrarSensor(sensorUrl);
  } else if (D.piezas[Q.get("pieza")]) {
    seleccionar_(Q.get("pieza"), { pestana: Q.get("pestana") ?? undefined });
    if (Q.get("acercar") === "1") setTimeout(() => centrarEn(Q.get("pieza")), Q.has("paso") ? 900 : 0);
  }
});
historialEnVivo();

// Gancho para pruebas y para la app: window.gemelo.irAPaso(16), .girar(1), .seleccionar("soldadura")
window.gemelo = { irAPaso, girar, seleccionar: seleccionar_, estado: () => ({ paso, actual, reloj, corriendo, resorte: Object.fromEntries(IDS.map((id) => [id, { ...resorte[id] }])) }) };
