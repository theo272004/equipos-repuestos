// Vista lamina (Anatomy): giro por vistas SVG, desarme con resortes, ciclo simulado.
// Gemelo de la MS235: giro por vistas, desarme con resortes (como el Raptor
// de Anatomy), seleccion por conjunto o sensor y el panel con los datos.
const raiz = $(".gm");
const escena = $(".gm-escena");
const svg = $(".gm-svg");
const camaraG = $(".gm-camara");
const cargando = $(".gm-cargando");
const etiqueta = $(".gm-etiqueta");
const lectura = $("[data-lectura]");
const pista = $("[data-pista]");
const vivo = $("[data-vivo]");
const pasoTxt = $("[data-paso]");

const NOMBRE_VISTA = (az) => {
  const a = ((az % 360) + 360) % 360;
  const nombres = ["derecha", "frente-derecha", "frente", "frente-izquierda", "izquierda", "atrás-izquierda", "atrás", "atrás-derecha"];
  return nombres[Math.round(a / 45) % 8];
};

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

function pintarCalor() {
  for (const p of vistas.values()) p.then(marcarNodos).catch(() => {});
}

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

function resaltarPieza(pieza) {
  for (const p of vistas.values()) p.then((v) => v.nodos.forEach((n) => (n.pieza === pieza ? n.el.setAttribute("data-hover", "") : n.el.removeAttribute("data-hover")))).catch(() => {});
}
