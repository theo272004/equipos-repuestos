// Visor 3D de la MS235 (three.js): navegacion tipo CAD, seleccion por pieza y
// por parte, desarme, corte de seccion, medicion, simulacion del ciclo con
// fisica de los sobres (cannon-es) y senales de los sensores.
//
// Mundo del modelo: x a la derecha del operador, y hacia el operador, z arriba,
// en unidades de 4 mm. En three.js: X = x, Y = z (arriba), Z = y (hacia el operador).

const T = (p) => new THREE.Vector3(p[0], p[2], p[1]);
const lienzo = $(".g3-lienzo");
const escena3 = $(".gm-escena");
const cargando = $(".gm-cargando");
const etiqueta = $(".gm-etiqueta");
const lectura = $("[data-lectura]");
const pista = $("[data-pista]");
const pasoTxt = $("[data-paso]");
const quieto3 = quieto;

// ───────────── Render, camara y controles ─────────────
const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camPersp = new THREE.PerspectiveCamera(32, 1, 2, 8000);
const camOrto = new THREE.OrthographicCamera(-1, 1, 1, -1, -8000, 8000);
let camara = camPersp;
const controles = new OrbitControls(camara, lienzo);
controles.enableDamping = true;
controles.dampingFactor = 0.12;
controles.screenSpacePanning = true;
controles.zoomToCursor = true;
controles.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
controles.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
const ayudaVista = new ViewHelper(camara, lienzo);
ayudaVista.center = controles.target;

const luzHemi = new THREE.HemisphereLight(0xffffff, 0x8a8f96, 0.55);
scene.add(luzHemi);
const sol = new THREE.DirectionalLight(0xffffff, 1.6);
sol.position.set(500, 900, 700);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -600, right: 600, top: 600, bottom: -600, near: 10, far: 2500 });
sol.shadow.bias = -0.0004;
scene.add(sol);
const suelo = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.ShadowMaterial({ opacity: 0.18 }));
suelo.rotation.x = -Math.PI / 2;
suelo.receiveShadow = true;
scene.add(suelo);
const rejilla = new THREE.GridHelper(2400, 60, 0x9aa2ab, 0xc9cfd5);
rejilla.material.transparent = true;
rejilla.material.opacity = 0.35;
rejilla.position.y = 0.05;
scene.add(rejilla);

function tema3d() {
  const oscuro = document.body.dataset.theme === "dark";
  scene.background = new THREE.Color(oscuro ? 0x14171b : 0xeef1f4);
  rejilla.material.color = new THREE.Color(oscuro ? 0x2b3138 : 0xc9cfd5);
  suelo.material.opacity = oscuro ? 0.35 : 0.18;
  luzHemi.intensity = oscuro ? 0.4 : 0.55;
  pedirCuadro();
}

// ───────────── Materiales ─────────────
const planosCorte = [];
const M = (o) => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, clippingPlanes: planosCorte, ...o });
const MAT = {
  hi: M({ color: 0xd3d8de, metalness: 0.62, roughness: 0.3 }),
  mid: M({ color: 0xa9b0b8, metalness: 0.58, roughness: 0.4 }),
  lo: M({ color: 0x7c838c, metalness: 0.5, roughness: 0.52 }),
  pintado: M({ color: 0xd9dbd7, metalness: 0.05, roughness: 0.62 }),
  oscuro: M({ color: 0x2b2e33, metalness: 0.2, roughness: 0.55 }),
  motor: M({ color: 0x5a7189, metalness: 0.35, roughness: 0.45 }),
  papel: M({ color: 0xf5f2ea, metalness: 0, roughness: 0.92 }),
  bobina: M({ color: 0xf0ece0, metalness: 0, roughness: 0.85 }),
  lona: M({ color: 0x46524c, metalness: 0, roughness: 0.85 }),
  negro: M({ color: 0x232528, metalness: 0.1, roughness: 0.7 }),
  aislante: M({ color: 0x9a7b4f, metalness: 0, roughness: 0.75 }),
  cobre: M({ color: 0xb87333, metalness: 0.75, roughness: 0.35 }),
  valvula: M({ color: 0x2f62a6, metalness: 0.15, roughness: 0.45 }),
  sensor: M({ color: 0xb59d67, metalness: 0.7, roughness: 0.3 }),
  pantalla: M({ color: 0x0c1826, metalness: 0.1, roughness: 0.2, emissive: 0x153a66, emissiveIntensity: 0.6 }),
  seta: M({ color: 0xd32626, metalness: 0.1, roughness: 0.45 }),
  vidrio: new THREE.MeshPhysicalMaterial({ color: 0xd9eeff, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: planosCorte }),
  led: new THREE.MeshStandardMaterial({ color: 0x2e7d32, emissive: 0x43d65a, emissiveIntensity: 0.35, clippingPlanes: planosCorte }),
  ledOn: new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0xffa000, emissiveIntensity: 2.2, clippingPlanes: planosCorte }),
  perno: M({ color: 0x8c939b, metalness: 0.8, roughness: 0.28 }),
};
const ARISTA = new THREE.LineBasicMaterial({ color: 0x1f2328, transparent: true, opacity: 0.32, clippingPlanes: planosCorte });
const ARISTA_SEL = new THREE.LineBasicMaterial({ color: 0x1f6feb, transparent: true, opacity: 0.9, clippingPlanes: planosCorte });

function materialDe(it) {
  const n = it.n;
  if (it.c === "vidrio" || it.c === "vidrio-vaso") return MAT.vidrio;
  if (it.c === "papel") return MAT.papel;
  if (it.c === "bobina") return MAT.bobina;
  if (it.c === "lona") return MAT.lona;
  if (it.c === "sensor") return MAT.sensor;
  if (it.c === "pantalla") return MAT.pantalla;
  if (it.c === "seta") return MAT.seta;
  if (it.c === "cable" || it.c === "correa" || it.c === "cadena") return MAT.negro;
  if (/motor(-[a-z]+)?$|motor-bornes|\.motor-|-bornes$/.test(n) && !/eje-motor|polea-motor|pie-motor|escuadra-motor|soporte-motor/.test(n)) return MAT.motor;
  if (/armario\.(cuerpo|zocalo)|hmi\.panel|carter\.(trasera|tapa)/.test(n)) return MAT.pintado;
  if (/electrovalvula/.test(n)) return MAT.valvula;
  if (/bobina-ev|bisagra|muelle-gas|manilla|tirador|euchner|pata-disco/.test(n)) return MAT.oscuro;
  if (/aislante/.test(n)) return MAT.aislante;
  if (/resistencia/.test(n)) return MAT.cobre;
  if (/membrana|fieltro|ventilador/.test(n)) return MAT.oscuro;
  return MAT[it.t] ?? MAT.mid;
}

// Variantes por estado (resaltado, seleccionado, fantasma, mapa de fallas), en cache.
const variantes = new Map();
const CALOR = [null, 0xfde8c9, 0xfbc98e, 0xf59a5b, 0xe8613a];
function variante(base, tipo) {
  const clave = `${base.uuid}|${tipo}`;
  let m = variantes.get(clave);
  if (m) return m;
  m = base.clone();
  m.clippingPlanes = planosCorte;
  if (tipo === "hover") Object.assign(m, { emissive: new THREE.Color(0x1f6feb), emissiveIntensity: 0.22 });
  else if (tipo === "sel") Object.assign(m, { emissive: new THREE.Color(0x1f6feb), emissiveIntensity: 0.38 });
  else if (tipo === "parte") Object.assign(m, { emissive: new THREE.Color(0x4f9bff), emissiveIntensity: 0.9 });
  else if (tipo === "fantasma") Object.assign(m, { transparent: true, opacity: 0.07, depthWrite: false });
  else if (tipo.startsWith("calor")) {
    const nivel = Number(tipo.slice(5));
    if (nivel > 0) m.color = new THREE.Color(CALOR[nivel]);
    else m.color = new THREE.Color(0xe6e9ec);
    Object.assign(m, { metalness: 0.1, roughness: 0.7 });
  }
  variantes.set(clave, m);
  return m;
}

// ───────────── Geometria desde la escena ─────────────
function geoPrisma(sh) {
  const [o, a, u, v] = [sh.o, sh.a, sh.u, sh.v];
  const P = (s, [x, y]) => T([o[0] + a[0] * s + u[0] * x + v[0] * y, o[1] + a[1] * s + u[1] * x + v[1] * y, o[2] + a[2] * s + u[2] * x + v[2] * y]);
  const ring = sh.p;
  const n = ring.length;
  const bot = ring.map((q) => P(sh.s[0], q));
  const top = ring.map((q) => P(sh.s[1], q));
  const pos = [];
  const tri = (A, B, C) => pos.push(A.x, A.y, A.z, B.x, B.y, B.z, C.x, C.y, C.z);
  const caras = THREE.ShapeUtils.triangulateShape(ring.map((q) => new THREE.Vector2(q[0], q[1])), []);
  for (const [i, j, k] of caras) {
    tri(top[i], top[j], top[k]);
    tri(bot[k], bot[j], bot[i]);
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    tri(bot[i], bot[j], top[j]);
    tri(bot[i], top[j], top[i]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
function geoTorno(sh) {
  const pts = sh.p;
  const rmax = Math.max(...pts.map((q) => q[1]));
  const seg = Math.max(14, Math.min(56, Math.round(8 + rmax * 1.6)));
  const bandas = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (a[1] < 1e-4 && b[1] < 1e-4) continue;
    if (Math.abs(a[0] - b[0]) < 1e-5 && Math.abs(a[1] - b[1]) < 1e-5) continue;
    bandas.push(new THREE.LatheGeometry([new THREE.Vector2(a[1], a[0]), new THREE.Vector2(b[1], b[0])], seg));
  }
  if (!bandas.length) return null;
  const g = mergeGeometries(bandas, false);
  const p = g.attributes.position;
  const [o, a, u, v] = [sh.o, sh.a, sh.u, sh.v];
  for (let i = 0; i < p.count; i++) {
    const lx = p.getX(i);
    const ly = p.getY(i);
    const lz = p.getZ(i);
    const w = [o[0] + a[0] * ly + u[0] * lx + v[0] * lz, o[1] + a[1] * ly + u[1] * lx + v[1] * lz, o[2] + a[2] * ly + u[2] * lx + v[2] * lz];
    p.setXYZ(i, w[0], w[2], w[1]);
  }
  g.computeVertexNormals();
  return g;
}
function geoTubo(sh) {
  const pts = sh.p.map(T);
  if (pts.length < 2) return null;
  const curva = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  return new THREE.TubeGeometry(curva, Math.max(2, pts.length * 2), sh.r[0] ?? 1, 8, false);
}
function geoHelice(sh) {
  const a = new THREE.Vector3(...sh.a).normalize();
  const u = new THREE.Vector3(Math.abs(a.x) < 0.9 ? 1 : 0, Math.abs(a.x) < 0.9 ? 0 : 1, 0).cross(a).normalize();
  const v = a.clone().cross(u);
  const pts = [];
  const n = Math.round(sh.n * 28);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ang = t * sh.n * Math.PI * 2;
    const w = new THREE.Vector3(...sh.o).addScaledVector(a, sh.s0 + (sh.s1 - sh.s0) * t).addScaledVector(u, sh.r * Math.cos(ang)).addScaledVector(v, sh.r * Math.sin(ang));
    pts.push(T([w.x, w.y, w.z]));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, sh.rw ?? 0.45, 6, false);
}
function geoDe(sh) {
  if (sh.k === "P") return geoPrisma(sh);
  if (sh.k === "L") return geoTorno(sh);
  if (sh.k === "B") return new THREE.SphereGeometry(sh.r, 20, 14).translate(sh.o[0], sh.o[2], sh.o[1]);
  if (sh.k === "T") return geoTubo(sh);
  if (sh.k === "H") return geoHelice(sh);
  return null;
}

// ───────────── Construccion de la maquina ─────────────
const grupos = {}; // por "ride": lo que se mueve junto al desarmar
const mallas = []; // todas las piezas
const porPiezaMallas = {};
const instancias = []; // tornilleria y sobres
let ESC = null;
let caja3 = new THREE.Box3();
const legible = (n) => n.replace(/^[a-z]+\./, "").replace(/[#:].*$/, "").replace(/-(atras|frente)$/, "").replace(/[.-]/g, " ");

function grupoDe(ride) {
  if (!grupos[ride]) {
    grupos[ride] = new THREE.Group();
    grupos[ride].name = ride;
    scene.add(grupos[ride]);
  }
  return grupos[ride];
}

function construirMaquina(esc) {
  ESC = esc;
  for (const it of esc.items) {
    const geos = it.g.map(geoDe).filter(Boolean);
    if (!geos.length) continue;
    let geo;
    if (geos.length === 1) geo = geos[0];
    else {
      const ng = geos.map((g) => (g.index ? g.toNonIndexed() : g));
      for (const g of ng) for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
      geo = mergeGeometries(ng, false);
    }
    const base = materialDe(it);
    const malla = new THREE.Mesh(geo, base);
    malla.castShadow = base !== MAT.vidrio && it.c !== "papel";
    malla.receiveShadow = true;
    malla.matrixAutoUpdate = false;
    malla.userData = { it, base, pieza: it.p, ride: it.r ?? it.p, parte: it.n.replace(/[#:].*$/, ""), sensor: it.s, disp: it.d, centro: it.m };
    if (base !== MAT.vidrio && it.c !== "papel" && it.c !== "cable" && it.c !== "correa" && it.c !== "cadena" && !/muelle/.test(it.n)) {
      const aristas = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), ARISTA);
      aristas.matrixAutoUpdate = false;
      aristas.raycast = () => {};
      malla.add(aristas);
      malla.userData.aristas = aristas;
    }
    // LED en la punta de los sensores
    if (it.s && it.g[0]?.k === "L") {
      const sh = it.g[0];
      const smax = Math.max(...sh.p.map((q) => q[0]));
      const punta = [sh.o[0] + sh.a[0] * smax, sh.o[1] + sh.a[1] * smax, sh.o[2] + sh.a[2] * smax];
      const led = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 8), MAT.led);
      led.position.copy(T(punta));
      led.updateMatrix();
      led.matrixAutoUpdate = false;
      malla.add(led);
      malla.userData.led = led;
    }
    grupoDe(malla.userData.ride).add(malla);
    mallas.push(malla);
    (porPiezaMallas[it.p] ??= []).push(malla);
  }
  // Tornilleria: cabezas hexagonales y allen como instancias, por conjunto
  const geoHex = new THREE.CylinderGeometry(1, 1, 0.7, 6);
  const geoAllen = new THREE.CylinderGeometry(1, 1, 0.8, 16);
  const arriba = new THREE.Vector3(0, 1, 0);
  const porClave = new Map();
  for (const pr of esc.pernos) {
    const clave = `${pr.ride}|${pr.pieza}|${pr.tipo}`;
    if (!porClave.has(clave)) porClave.set(clave, { ...pr, lista: [] });
    for (const p of pr.pts) porClave.get(clave).lista.push({ p, n: pr.n, r: pr.r });
  }
  for (const [, g] of porClave) {
    const im = new THREE.InstancedMesh(g.tipo === "allen" ? geoAllen : geoHex, MAT.perno, g.lista.length);
    const m4 = new THREE.Matrix4();
    g.lista.forEach(({ p, n, r }, i) => {
      const nn = T(n).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(arriba, nn);
      const pos = T(p).addScaledVector(nn, 0.35 * r);
      m4.compose(pos, q, new THREE.Vector3(r, r, r));
      im.setMatrixAt(i, m4);
    });
    im.castShadow = false;
    im.receiveShadow = true;
    im.userData = { pieza: g.pieza, ride: g.ride, base: MAT.perno, parte: `${g.pieza}.tornilleria`, tornillos: g.lista.length };
    grupoDe(g.ride).add(im);
    instancias.push(im);
    (porPiezaMallas[g.pieza] ??= []).push(im);
  }
  for (const g of Object.values(grupos)) g.updateMatrixWorld(true);
  caja3 = new THREE.Box3();
  for (const m of mallas) if (m.userData.pieza !== "resguardos") caja3.expandByObject(m);
  totalTornillos = esc.pernos.reduce((a, p) => a + p.pts.length, 0);
}
let totalTornillos = 0;

// ───────────── Encuadre ─────────────
const vistasFijas = {
  iso: [0.62, 0.42, 0.66],
  frente: [0, 0.18, 1],
  atras: [0, 0.18, -1],
  izquierda: [-1, 0.18, 0],
  derecha: [1, 0.18, 0],
  arriba: [0, 1, 0.0001],
};
let animCam = null;
function encuadrar(caja = caja3, dir = null, inmediato = false) {
  const c = caja.getCenter(new THREE.Vector3());
  const tam = caja.getSize(new THREE.Vector3()).length();
  const d = dir ? new THREE.Vector3(...dir).normalize() : camara.position.clone().sub(controles.target).normalize();
  const dist = (tam / (2 * Math.tan((camPersp.fov * Math.PI) / 360))) * 0.74;
  const destino = { pos: c.clone().addScaledVector(d, dist), target: c, zoom: (tam * 0.62) };
  if (inmediato || quieto3.matches) {
    camPersp.position.copy(destino.pos);
    controles.target.copy(destino.target);
    ajustarOrto(destino.zoom);
    controles.update();
  } else animCam = { t: 0, desde: { pos: camara.position.clone(), target: controles.target.clone() }, destino };
  pedirCuadro();
}
function ajustarOrto(alto) {
  const a = lienzo.clientWidth / Math.max(1, lienzo.clientHeight);
  camOrto.top = alto / 2;
  camOrto.bottom = -alto / 2;
  camOrto.left = (-alto * a) / 2;
  camOrto.right = (alto * a) / 2;
  camOrto.updateProjectionMatrix();
}
function cajaDe(pieza) {
  const b = new THREE.Box3();
  for (const m of porPiezaMallas[pieza] ?? []) if (m.visible) b.expandByObject(m);
  return b;
}
function centrarEn(pieza) {
  const b = cajaDe(pieza);
  if (!b.isEmpty()) encuadrar(b.expandByScalar(20));
}
function enfocarSeleccion() {
  if (seleccion.parte) {
    const b = new THREE.Box3();
    for (const m of mallas) if (m.userData.parte === seleccion.parte) b.expandByObject(m);
    if (!b.isEmpty()) return encuadrar(b.expandByScalar(15));
  }
  if (seleccion.pieza) return centrarEn(seleccion.pieza);
  encuadrar(cajaVisible());
}
function cajaVisible() {
  const b = new THREE.Box3();
  for (const m of mallas) if (m.visible && m.userData.pieza !== "film" && !(m.userData.pieza === "resguardos" && sinResguardos)) b.expandByObject(m);
  return b.isEmpty() ? caja3 : b;
}

// ───────────── Desarme (resortes por conjunto, como la lamina) ─────────────
const resorte = Object.fromEntries(IDS.map((id) => [id, { x: 0, v: 0, target: 0, pending: null }]));
let reloj = 0;
let paso = 0;
function irAPaso(n, { seleccionar = true, inmediato = false } = {}) {
  n = Math.max(0, Math.min(PASOS.length, n));
  if (n > 0 && sim.activa) pararSim();
  const antes = paso;
  paso = n;
  if (inmediato) PASOS.forEach((id, i) => Object.assign(resorte[id], { x: i < n ? 1 : 0, v: 0, target: i < n ? 1 : 0, pending: null }));
  const cambian = PASOS.filter((id, i) => (i < n ? 1 : 0) !== resorte[id].target || resorte[id].pending);
  const orden = n >= antes ? cambian : [...cambian].reverse();
  let i = 0;
  for (const id of orden) {
    const meta = PASOS.indexOf(id) < n ? 1 : 0;
    if (resorte[id].target === meta && !resorte[id].pending) continue;
    resorte[id].pending = { value: meta, at: reloj + (quieto3.matches ? 0 : i++ * D.spring.stagger) };
  }
  if (seleccionar) {
    const id = n > 0 && n < PASOS.length ? PASOS[n - 1] : null;
    seleccionar_(n === 0 || n === PASOS.length ? null : id === "resguardos" && sinResguardos ? null : id);
  }
  actualizarMandos();
  pedirCuadro();
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
    if (quieto3.matches) {
      r.x = r.target;
      r.v = 0;
      continue;
    }
    const h = dt / substeps;
    for (let s = 0; s < substeps; s++) {
      r.v += (K * (r.target - r.x) - C * r.v) * h;
      r.x += r.v * h;
    }
    if (Math.abs(r.target - r.x) < 1e-4 && Math.abs(r.v) < 1e-4) {
      r.x = r.target;
      r.v = 0;
    } else moviendo = true;
  }
  return moviendo;
}
function colocarGrupos() {
  for (const [ride, g] of Object.entries(grupos)) {
    const mov = ESC.piezas[ride]?.mover ?? [0, 0, 0];
    const s = ride === "film" ? 0 : resorte[ride]?.x ?? 0;
    g.position.copy(T(mov).multiplyScalar(s));
    g.updateMatrixWorld(true);
  }
  // el papel se desvanece al desarmar
  const o = Math.max(0, 1 - (resorte.film?.x ?? 0) * 1.6);
  if (grupos.film) grupos.film.visible = o > 0.02;
}

// ───────────── Simulacion del ciclo ─────────────
// Fases (fraccion de vuelta, 0..1 = 0..360°). Ancla real: Calibrado p.20, rueda de fase de la
// soldadura a 30° con el bloque en su maxima excursion (planchas cerradas). Cuchilla rotativa:
// una vuelta por ciclo, corte con la hoja enfrentada a la contracuchilla (Calibrado p.23).
// El resto de ventanas son aproximadas y se avisan en la pagina.
const FASES = {
  cierre: [0.9, 0.03, 0.14, 0.24], // empieza a cerrar, cerrada, empieza a abrir, abierta
  corte: 0.1,
  arrastre: [0.28, 0.62],
  dosis: [0.3, 0.55],
  pinzasBaja: [0.14, 0.27],
  suelta: 0.29,
  pinzasSube: [0.31, 0.5],
  agarra: [0.95, 0.02],
};
const PASO_SOBRE = 28; // largo del sobre: 112 mm
const sim = { activa: false, angulo: 0, cpm: 50, ciclos: 0, sobres: 0, ultimoU: 0 };
const suave = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const enVentana = (u, a, b) => (a <= b ? u >= a && u <= b : u >= a || u <= b);
function estadoCiclo(u) {
  const cierra = u >= FASES.cierre[0] ? suave(FASES.cierre[0], 1 + FASES.cierre[1], u) : suave(FASES.cierre[0] - 1, FASES.cierre[1], u);
  const abre = u < 0.5 ? suave(FASES.cierre[2], FASES.cierre[3], u) : 0;
  const fCierre = cierra * (1 - abre);
  const avance = suave(FASES.arrastre[0], FASES.arrastre[1], u); // 0..1 del paso de papel en este ciclo
  const dosis = suave(FASES.dosis[0], FASES.dosis[1], u);
  const baja = suave(FASES.pinzasBaja[0], FASES.pinzasBaja[1], u) * (1 - suave(FASES.pinzasSube[0], FASES.pinzasSube[1], u));
  const agarre = u >= FASES.agarra[0] || u <= FASES.suelta ? (u >= FASES.agarra[0] ? suave(FASES.agarra[0], 1, u) : 1 - suave(FASES.suelta - 0.02, FASES.suelta, u)) : 0;
  const cuchilla = ((u - FASES.corte + 1) % 1) * Math.PI * 2; // 0 rad = hoja enfrentada a la contracuchilla
  return { fCierre, avance, dosis, baja, agarre, cuchilla };
}

// Senales (encendidas en estas ventanas de la vuelta). Las B25.8 y B32.8 son ceros de motor.
const SENALES = [
  { tag: "B25.8", txt: "cero motor máquina", on: (u) => enVentana(u, 0.98, 0.02) },
  { tag: "Y40.6", txt: "cierre plancha izquierda", on: (u) => enVentana(u, 0.88, 0.16) },
  { tag: "Y40.7", txt: "cierre plancha derecha", on: (u) => enVentana(u, 0.88, 0.16) },
  { tag: "B40.1", txt: "plancha izq. cerrada", on: (u) => enVentana(u, 0.0, 0.15) },
  { tag: "B40.2", txt: "plancha der. cerrada", on: (u) => enVentana(u, 0.0, 0.15) },
  { tag: "B42.1", txt: "presión de soldadura", on: (u) => enVentana(u, 0.02, 0.14) },
  { tag: "Y10.8", txt: "descarga de presión", on: (u) => enVentana(u, 0.15, 0.22) },
  { tag: "B18.2", txt: "descarga presión planchas", on: (u) => enVentana(u, 0.17, 0.24) },
  { tag: "B32.8", txt: "cero motor corte", on: (u) => enVentana(u, 0.58, 0.64) },
  { tag: "M30.1", txt: "arrastre de papel", on: (u) => enVentana(u, FASES.arrastre[0], FASES.arrastre[1]) },
  { tag: "B30.10", txt: "lectura de muesca", on: (u) => enVentana(u, 0.57, 0.6) },
  { tag: "M34.1", txt: "dosificación (estrella)", on: (u) => enVentana(u, FASES.dosis[0], FASES.dosis[1]) },
  { tag: "B52.x", txt: "expulsión: sobre en la cinta", on: () => sobreEnExpulsion },
];
let sobreEnExpulsion = false;

// Que se mueve y como, por nombre de pieza. ejes y pivotes en el mundo del modelo.
function reglaAnim(m) {
  const n = m.userData.parte;
  const c = m.userData.centro ?? [0, 0, 0];
  const lado = Math.sign(c[0]) || 1;
  if (/^motor\.(eje-levas|leva|corona|volante)/.test(n)) return { rot: [1, 0, 0], p: [0, -40, 236], f: (e) => e.theta };
  if (n === "motor.pinon") return { rot: [1, 0, 0], p: [0, -60, 76], f: (e) => e.theta * 1.5 };
  if (/^arrastre\.(rodillo|engranaje)/.test(n)) return { rot: [0, 1, 0], p: [7 * lado, 0, 212], f: (e) => (-lado * e.papel) / 6 };
  if (/^corte\.(circular|eje-circulares)/.test(n)) return { rot: [0, 1, 0], p: [-14, 0, 190], f: (e) => e.papel / 13.2 };
  if (n === "corte.contraste") return { rot: [0, 1, 0], p: [7, 0, 190], f: (e) => -e.papel / 6 };
  if (/^corte\.(cuchilla-rotativa|eje-cuchilla|leva)/.test(n)) return { rot: [0, 1, 0], p: [-9, 0, 170], f: (e) => -e.cuchilla };
  if (/^desbobinado\.(rodillo|contraste)/.test(n)) {
    const r = n.includes("alto") || n.includes("motorizado") ? 6 : n.includes("balancin") ? 4.5 : n.includes("contraste") ? 4 : 5;
    return { rot: [1, 0, 0], p: [0, c[1], c[2]], f: (e) => -e.papel / r };
  }
  if (/^bobina\.(bobina|eje|cono)$/.test(n) && Math.abs(c[2] - 120) < 30) return { rot: [1, 0, 0], p: [0, -215, 120], f: (e) => -e.papel / 62.5 };
  if (n === "guias.rodillo") return { rot: [0, 1, 0], p: [c[0], 0, 325.5], f: (e) => (lado * e.papel) / 4 };
  if (/^dosificacion\.(estrella|eje-estrella|polea)$/.test(n)) return { rot: [0, 1, 0], p: [0, 0, 368], f: (e) => e.estrella };
  if (/^dosificacion\.(polea-motor|eje-motor)$/.test(n)) return { rot: [0, 1, 0], p: [48, 0, 412], f: (e) => e.estrella * 1.5 };
  if (n === "salida.tambor") return { rot: [0, 1, 0], p: [c[0], 0, 94], f: (e) => -e.cinta / 5 };
  if (/^soldadura\.(placa-soldante|aislante|porta-mordaza|tirante|codificador|pomo-lote|resistencia|pt100)/.test(n)) return { mov: (e) => [-lado * 3 * (1 - e.fCierre), 0, 0] };
  if (/^soldadura\.muelle/.test(n)) return { muelle: lado };
  if (/^pinzas\.(patin|viga|placa-extremo|barra-derecha|brazo|vastago|biela|rotula)/.test(n)) return { mov: (e) => [0, 0, -24 * e.baja] };
  if (n === "pinzas.dedo") return { mov: (e) => [-lado * 1.4 * (1 - e.agarre), 0, -24 * e.baja] };
  if (n === "film.sobre") return { sobre: true };
  if (n === "salida.sobre") return { oculto: true };
  if (/^desbobinado\.(balancin)/.test(n)) return { rot: [1, 0, 0], p: [0, -150, 300], f: (e) => Math.sin(e.theta * 1) * 0.03 };
  return null;
}
const animadas = [];
function prepararAnim() {
  for (const m of mallas) {
    const r = reglaAnim(m);
    if (!r) continue;
    if (r.sobre || r.oculto) m.userData.sim = true;
    animadas.push({ m, r, base: m.matrix.clone() });
  }
}
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _t1 = new THREE.Matrix4();
const _t2 = new THREE.Matrix4();
function aplicarAnim(e, activa) {
  for (const a of animadas) {
    const { m, r } = a;
    if (!activa) {
      m.matrix.identity();
      m.visible = m.userData.visibleBase !== false;
      m.updateMatrixWorld(true);
      continue;
    }
    if (r.rot) {
      const ang = r.f(e);
      const p = T(r.p);
      _q.setFromAxisAngle(T(r.rot).normalize(), ang);
      _t1.makeTranslation(-p.x, -p.y, -p.z);
      _t2.makeTranslation(p.x, p.y, p.z);
      m.matrix.copy(_t2).multiply(_m.makeRotationFromQuaternion(_q)).multiply(_t1);
    } else if (r.mov) {
      const [x, y, z] = r.mov(e);
      m.matrix.makeTranslation(x, z, y);
    } else if (r.muelle) {
      // el muelle se estira entre el bloque fijo (x = ±58) y el porta-mordaza
      const ancla = 58 * r.muelle;
      const k = (20 + 3 * (1 - e.fCierre)) / 20;
      _t1.makeTranslation(-ancla, 0, 0);
      _t2.makeTranslation(ancla, 0, 0);
      m.matrix.copy(_t2).multiply(_m.makeScale(k, 1, 1)).multiply(_t1);
    } else if (r.sobre) {
      // sobres colgando: bajan con el papel durante el arrastre, siguen a las pinzas y se sueltan
      const u = e.u;
      m.visible = m.userData.visibleBase !== false && (u > FASES.arrastre[0] || u < FASES.suelta);
      const subida = u >= FASES.arrastre[0] && u <= FASES.arrastre[1] ? (1 - e.avance) * PASO_SOBRE : 0;
      m.matrix.makeTranslation(0, subida - 24 * e.baja, 0);
    } else if (r.oculto) m.visible = false;
    m.updateMatrixWorld(true);
  }
}

// Fisica de los sobres: caen de las pinzas a la cinta y la cinta los lleva.
// cannon-es se carga aparte: si no llega, la simulacion sigue sin sobres sueltos.
let CANNON = null;
let cargandoCannon = null;
const cargarCannon = () => (cargandoCannon ??= import("cannon-es").then((m) => (CANNON = m)).catch((e) => console.warn("sin fisica:", e)));
let mundo = null;
const cuerpos = [];
let mallaSobres = null;
const MAX_SOBRES = 96;
const G_UNIDADES = 9810 / 4; // 9,81 m/s² en unidades de 4 mm
function iniciarFisica() {
  if (mundo || !CANNON) {
    if (!CANNON) cargarCannon().then(() => sim.activa && iniciarFisica());
    return;
  }
  mundo = new CANNON.World({ gravity: new CANNON.Vec3(0, -G_UNIDADES, 0) });
  mundo.broadphase = new CANNON.SAPBroadphase(mundo);
  mundo.allowSleep = false;
  const matSobre = new CANNON.Material("sobre");
  const matCinta = new CANNON.Material("cinta");
  mundo.addContactMaterial(new CANNON.ContactMaterial(matSobre, matCinta, { friction: 0.6, restitution: 0.05 }));
  mundo.addContactMaterial(new CANNON.ContactMaterial(matSobre, matSobre, { friction: 0.4, restitution: 0.05 }));
  const estatico = (centroMundo, medio) => {
    const b = new CANNON.Body({ mass: 0, material: matCinta, shape: new CANNON.Box(new CANNON.Vec3(medio[0], medio[2], medio[1])) });
    const c = T(centroMundo);
    b.position.set(c.x, c.y, c.z);
    mundo.addBody(b);
  };
  // cinta (x -46..330, y 20..140, arriba en z 100), guias de carril, suelo y largueros
  estatico([142, 80, 99], [188, 60, 1]);
  for (let i = 1; i < 6; i++) estatico([170, 20 + 20 * i, 103.5], [130, 0.6, 2.5]);
  estatico([142, 17, 98], [190, 3, 8]);
  estatico([142, 143, 98], [190, 3, 8]);
  const suelo = new CANNON.Body({ mass: 0, material: matCinta, shape: new CANNON.Plane() });
  suelo.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  mundo.addBody(suelo);
  mundo.matSobre = matSobre;
  const geo = new THREE.BoxGeometry(1.4, 28, 15);
  mallaSobres = new THREE.InstancedMesh(geo, MAT.papel, MAX_SOBRES);
  mallaSobres.count = 0;
  mallaSobres.castShadow = true;
  mallaSobres.frustumCulled = false;
  scene.add(mallaSobres);
}
function soltarSobres() {
  if (!mundo) return;
  for (const yc of ESC.carriles) {
    if (cuerpos.length >= MAX_SOBRES) {
      const viejo = cuerpos.shift();
      mundo.removeBody(viejo.b);
    }
    // sobre colgando: fino en x, ancho en y (carril), largo en z
    const b = new CANNON.Body({ mass: 0.004, material: mundo.matSobre, shape: new CANNON.Box(new CANNON.Vec3(0.7, 14, 7.5)), linearDamping: 0.05, angularDamping: 0.3 });
    const c = T([0, yc, 150 - 24]);
    b.position.set(c.x, c.y, c.z);
    b.velocity.set((Math.random() - 0.5) * 6, -20, 0);
    b.angularVelocity.set(0, 0, (Math.random() - 0.4) * 2);
    mundo.addBody(b);
    cuerpos.push({ b, t: 0 });
  }
  sim.sobres += ESC.carriles.length;
}
const _mo = new THREE.Matrix4();
function pasoFisica(dt) {
  if (!mundo) return;
  const vCinta = (50 / (60 / sim.cpm)) * 1; // 50 unidades por ciclo
  sobreEnExpulsion = false;
  for (let i = cuerpos.length - 1; i >= 0; i--) {
    const { b } = cuerpos[i];
    cuerpos[i].t += dt;
    const sobreCinta = b.position.y < 106 && b.position.y > 96 && b.position.x > -46 && b.position.x < 330 && b.position.z > 20 && b.position.z < 140;
    if (sobreCinta) {
      b.velocity.x += (vCinta - b.velocity.x) * Math.min(1, dt * 12);
      b.velocity.z *= 1 - Math.min(1, dt * 4);
    }
    if (b.position.x > 238 && b.position.x < 266 && sobreCinta) sobreEnExpulsion = true;
    if (b.position.y < 3 || cuerpos[i].t > 30) {
      mundo.removeBody(b);
      cuerpos.splice(i, 1);
    }
  }
  mundo.step(1 / 120, dt, 8);
  mallaSobres.count = cuerpos.length;
  cuerpos.forEach(({ b }, i) => {
    _mo.compose(new THREE.Vector3(b.position.x, b.position.y, b.position.z), new THREE.Quaternion(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w), new THREE.Vector3(1, 1, 1));
    mallaSobres.setMatrixAt(i, _mo);
  });
  mallaSobres.instanceMatrix.needsUpdate = true;
}
function limpiarFisica() {
  if (!mundo) return;
  for (const { b } of cuerpos) mundo.removeBody(b);
  cuerpos.length = 0;
  if (mallaSobres) mallaSobres.count = 0;
}

function pasoSim(dt) {
  const antes = sim.angulo;
  if (sim.activa && !sim.pausa) sim.angulo = (sim.angulo + dt * (sim.cpm / 60) * 360) % 360;
  const u = sim.angulo / 360;
  if (sim.activa && !sim.pausa) {
    const uA = antes / 360;
    const cruzo = (a, x, b) => (a <= b ? a < x && x <= b : a < x || x <= b);
    if (cruzo(uA, FASES.suelta, u)) soltarSobres();
    if (u < uA) sim.ciclos++;
  }
  const e = estadoCiclo(u);
  const vueltas = sim.ciclos + u;
  const avanceTotal = (sim.ciclos + (u >= FASES.arrastre[1] ? 1 : u >= FASES.arrastre[0] ? e.avance : 0)) * PASO_SOBRE;
  const ev = {
    u,
    theta: vueltas * Math.PI * 2,
    papel: avanceTotal,
    avance: e.avance,
    fCierre: e.fCierre,
    baja: e.baja,
    agarre: e.agarre,
    cuchilla: e.cuchilla,
    estrella: (sim.ciclos + e.dosis) * (Math.PI / 3),
    cinta: (sim.ciclos + u) * 50,
  };
  aplicarAnim(ev, true);
  if (sim.activa && !sim.pausa) pasoFisica(dt);
  // LEDs de los sensores que estan en el ciclo
  const on = new Set(SENALES.filter((s) => s.on(u)).map((s) => s.tag));
  for (const m of mallas) {
    const led = m.userData.led;
    if (!led) continue;
    const tag = m.userData.sensor;
    led.material = on.has(tag) || (tag?.startsWith("B52") && on.has("B52.x")) || /^B35/.test(tag) ? MAT.ledOn : MAT.led;
  }
  pintarSenales(u, on);
  const txt = $("[data-angulo]");
  if (txt) txt.textContent = `${sim.angulo.toFixed(0).padStart(3, " ")}°`;
  const rango = $("[data-rango-angulo]");
  if (rango && document.activeElement !== rango) rango.value = sim.angulo.toFixed(0);
  const cont = $("[data-contador]");
  if (cont) cont.textContent = `${sim.ciclos} ciclos · ${sim.sobres} sobres`;
}
function iniciarSim() {
  if (paso !== 0) irAPaso(0, { seleccionar: false, inmediato: true });
  sim.activa = true;
  sim.pausa = false;
  iniciarFisica();
  escena3.setAttribute("data-sim", "");
  $(".g3-senales").hidden = false;
  actualizarMandos();
  pedirCuadro();
}
function pararSim() {
  sim.activa = false;
  sim.pausa = false;
  aplicarAnim(null, false);
  limpiarFisica();
  for (const m of mallas) if (m.userData.led) m.userData.led.material = MAT.led;
  escena3.removeAttribute("data-sim");
  $(".g3-senales").hidden = true;
  actualizarMandos();
  pedirCuadro();
}

// Diagrama de fases con el cursor del angulo
function pintarSenales(u, on) {
  const cv = $(".g3-senales canvas");
  if (!cv || $(".g3-senales").hidden) return;
  const dpr = Math.min(2, devicePixelRatio);
  const w = cv.clientWidth;
  const fila = 17;
  const h = SENALES.length * fila + 22;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.height = `${h}px`;
  }
  const g = cv.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const oscuro = document.body.dataset.theme === "dark";
  g.fillStyle = oscuro ? "#15171a" : "#fbfbfa";
  g.fillRect(0, 0, w, h);
  const x0 = 190;
  const ancho = w - x0 - 12;
  g.font = "11px ui-monospace, Consolas, monospace";
  g.textBaseline = "middle";
  // escala de grados
  g.fillStyle = oscuro ? "#7d838c" : "#7c828b";
  for (let a = 0; a <= 360; a += 45) {
    const x = x0 + (a / 360) * ancho;
    g.fillText(`${a}°`, x - 8, 9);
    g.fillRect(x, 16, 1, h - 18);
  }
  SENALES.forEach((s, i) => {
    const y = 22 + i * fila;
    g.fillStyle = on.has(s.tag) ? "#e8613a" : oscuro ? "#b4b9c1" : "#4a4f57";
    g.fillText(`${s.tag} ${s.txt}`.slice(0, 30), 8, y + fila / 2);
    g.fillStyle = oscuro ? "#2a2d33" : "#e4e6e9";
    g.fillRect(x0, y + 4, ancho, fila - 8);
    g.fillStyle = s.tag.startsWith("Y") || s.tag.startsWith("M") ? "#1f6feb" : "#30a46c";
    for (let k = 0; k < 120; k++) {
      const uu = k / 120;
      if (s.tag !== "B52.x" && s.on(uu)) g.fillRect(x0 + uu * ancho, y + 4, ancho / 120 + 0.5, fila - 8);
    }
    if (s.tag === "B52.x" && on.has("B52.x")) g.fillRect(x0 + u * ancho - 3, y + 4, 6, fila - 8);
  });
  g.fillStyle = "#e8613a";
  g.fillRect(x0 + u * ancho - 1, 14, 2, h - 14);
}

// ───────────── Seleccion y aspecto ─────────────
let aislar = false;
let sinResguardos = true;
let calor = false;
let aristasOn = true;
let hover = null; // { pieza, parte }
const ocultas = new Set(); // conjuntos apagados en el arbol

function aspecto() {
  for (const m of [...mallas, ...instancias]) {
    const { pieza, parte, base } = m.userData;
    const visible = !ocultas.has(pieza) && !(pieza === "resguardos" && sinResguardos);
    m.userData.visibleBase = visible;
    if (!sim.activa || !m.userData.sim) m.visible = visible;
    let mat = base;
    const sel = seleccion.pieza && pieza === seleccion.pieza;
    const esParte = seleccion.parte && parte === seleccion.parte;
    if (calor && base !== MAT.vidrio && pieza !== "film") mat = variante(base, `calor${nivelCalor(pieza) ?? 0}`);
    if (esParte) mat = variante(mat, "parte");
    else if (sel) mat = variante(mat, "sel");
    else if (seleccion.pieza && aislar) mat = variante(base, "fantasma");
    else if (hover && hover.pieza === pieza && !seleccion.pieza) mat = variante(mat, "hover");
    if (m.material !== mat) m.material = mat;
    const ar = m.userData.aristas;
    if (ar) {
      ar.visible = aristasOn && !(seleccion.pieza && aislar && !sel);
      ar.material = sel ? ARISTA_SEL : ARISTA;
    }
  }
  pedirCuadro();
}

function seleccionar_(pieza, { sensor = null, pestana, parte = null } = {}) {
  const cambia = pieza !== seleccion.pieza;
  seleccion.pieza = pieza;
  seleccion.sensor = sensor;
  seleccion.parte = parte;
  if (pestana) seleccion.pestana = pestana;
  else if (cambia) seleccion.pestana = sensor ? "sensores" : "resumen";
  $$(".gm-parte").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pieza === pieza)));
  marcarArbol();
  aspecto();
  pintarPanel();
  decir();
}
function resaltarPieza(pieza) {
  hover = pieza ? { pieza } : null;
  aspecto();
}
function pintarCalor() {
  aspecto();
}
function mostrarSensor(s) {
  const m = mallas.find((x) => x.userData.sensor === s.sigla);
  if (!m) return;
  const i = PASOS.indexOf(s.pieza);
  if (i > 0 && paso < i && s.pieza !== "bastidor") irAPaso(i, { seleccionar: false });
  setTimeout(() => encuadrar(new THREE.Box3().setFromObject(m).expandByScalar(40)), 500);
}

// ───────────── Raton: seleccion, hover y medida ─────────────
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let abajo = null;
function tocadoEn(ev) {
  const r = lienzo.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camara);
  const objetos = [...mallas, ...instancias].filter((m) => m.visible && m.userData.base !== MAT.vidrio && m.material.opacity > 0.2);
  const hits = ray.intersectObjects(objetos, false).filter((h) => !planosCorte.length || planosCorte[0].distanceToPoint(h.point) >= 0);
  return hits[0] ?? null;
}
lienzo.addEventListener("pointerdown", (e) => {
  abajo = { x: e.clientX, y: e.clientY, t: performance.now() };
});
lienzo.addEventListener("pointerup", (e) => {
  if (!abajo) return;
  const movio = Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) > 5;
  abajo = null;
  if (movio || e.button !== 0) return;
  if (ayudaVista.handleClick(e)) {
    pedirCuadro();
    return;
  }
  const h = tocadoEn(e);
  if (medir.activo) return medirPunto(h);
  if (!h) return seleccionar_(null);
  const { pieza, parte, sensor } = h.object.userData;
  if (sensor) return seleccionar_(pieza, { sensor, pestana: "sensores", parte });
  // primer clic: el conjunto; segundo clic sobre el mismo conjunto: la parte
  if (seleccion.pieza === pieza && seleccion.parte !== parte) seleccionar_(pieza, { parte, pestana: seleccion.pestana });
  else if (seleccion.pieza === pieza && seleccion.parte === parte) seleccionar_(null);
  else seleccionar_(pieza);
});
lienzo.addEventListener("dblclick", (e) => {
  const h = tocadoEn(e);
  if (h) {
    const { pieza, parte } = h.object.userData;
    seleccionar_(pieza, { parte });
    enfocarSeleccion();
  } else encuadrar(cajaVisible());
});
let ultimoHover = 0;
lienzo.addEventListener("pointermove", (e) => {
  if (e.buttons) {
    etiqueta.removeAttribute("data-on");
    return;
  }
  const ahora = performance.now();
  if (ahora - ultimoHover < 50) return;
  ultimoHover = ahora;
  const h = tocadoEn(e);
  const pieza = h?.object.userData.pieza ?? null;
  if ((hover?.pieza ?? null) !== pieza) resaltarPieza(pieza);
  if (!h) return etiqueta.removeAttribute("data-on");
  const u = h.object.userData;
  const s = u.sensor ? D.sensores.find((x) => x.sigla === u.sensor) : null;
  const n = fallasPorPieza[u.pieza] ?? 0;
  const parte = u.tornillos ? `tornillería · ${u.tornillos} cabezas` : legible(u.parte);
  etiqueta.innerHTML = s
    ? `<b>${esc(s.sigla)}</b> · ${esc(s.f)}<small>${esc(s.marca)} ${esc(s.tipo)} · hilo ${esc(s.hilo)}</small>`
    : `<b>${esc(D.piezas[u.pieza]?.nombre ?? u.pieza)}</b><small>${esc(parte)}${u.disp ? ` · ${esc(u.disp)}` : ""}${n ? ` · ${n} intervenciones` : ""}</small>`;
  const r = escena3.getBoundingClientRect();
  etiqueta.style.left = `${e.clientX - r.left}px`;
  etiqueta.style.top = `${e.clientY - r.top}px`;
  etiqueta.setAttribute("data-on", "");
});
lienzo.addEventListener("pointerleave", () => {
  etiqueta.removeAttribute("data-on");
  if (hover) resaltarPieza(null);
});

// Medir distancias entre dos puntos de la maquina
const medir = { activo: false, puntos: [], linea: null, marcas: [] };
const marcaGeo = new THREE.SphereGeometry(1.4, 12, 8);
const marcaMat = new THREE.MeshBasicMaterial({ color: 0xe8613a, depthTest: false });
function medirPunto(h) {
  if (!h) return;
  if (medir.puntos.length >= 2) limpiarMedida();
  medir.puntos.push(h.point.clone());
  const s = new THREE.Mesh(marcaGeo, marcaMat);
  s.position.copy(h.point);
  s.renderOrder = 10;
  scene.add(s);
  medir.marcas.push(s);
  if (medir.puntos.length === 2) {
    const g = new THREE.BufferGeometry().setFromPoints(medir.puntos);
    medir.linea = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xe8613a, depthTest: false }));
    medir.linea.renderOrder = 10;
    scene.add(medir.linea);
    const [a, b] = medir.puntos;
    const d = a.distanceTo(b) * ESC.unidad_mm;
    const dx = Math.abs(a.x - b.x) * ESC.unidad_mm;
    const dy = Math.abs(a.z - b.z) * ESC.unidad_mm;
    const dz = Math.abs(a.y - b.y) * ESC.unidad_mm;
    $(".g3-medida").innerHTML = `<b>${d.toFixed(0)} mm</b><small>Δx ${dx.toFixed(0)} · Δy ${dy.toFixed(0)} · Δz ${dz.toFixed(0)} mm · medida del modelo</small>`;
  } else $(".g3-medida").innerHTML = "<small>Toca el segundo punto</small>";
  pedirCuadro();
}
function limpiarMedida() {
  for (const s of medir.marcas) scene.remove(s);
  if (medir.linea) scene.remove(medir.linea);
  medir.puntos = [];
  medir.marcas = [];
  medir.linea = null;
}

// Corte de seccion
const seccion = { activa: false, eje: "x", pos: 0.5, invertir: false };
const planoCorte = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
function aplicarSeccion() {
  planosCorte.length = 0;
  if (seccion.activa) {
    const ejes = { x: [1, 0, 0], y: [0, 0, 1], z: [0, 1, 0] };
    const n = new THREE.Vector3(...ejes[seccion.eje]).multiplyScalar(seccion.invertir ? 1 : -1);
    const b = caja3;
    const k = { x: "x", y: "z", z: "y" }[seccion.eje];
    const v = b.min[k] + (b.max[k] - b.min[k]) * seccion.pos;
    planoCorte.normal.copy(n);
    planoCorte.constant = seccion.invertir ? -v : v;
    planosCorte.push(planoCorte);
  }
  for (const m of [...Object.values(MAT), ARISTA, ARISTA_SEL, ...variantes.values()]) m.needsUpdate = true;
  pedirCuadro();
}

// ───────────── Arbol de conjuntos y partes ─────────────
function pintarArbol() {
  const cont = $(".g3-arbol__lista");
  if (!cont) return;
  const filtro = ($(".g3-arbol input")?.value ?? "").toLowerCase();
  const html = D.lectura.concat(["film"]).map((id) => {
    const partes = new Map();
    for (const m of porPiezaMallas[id] ?? []) {
      const p = m.userData.tornillos ? `${id}.tornilleria` : m.userData.parte;
      partes.set(p, (partes.get(p) ?? 0) + (m.userData.tornillos ?? 1));
    }
    const nombre = D.piezas[id].nombre;
    const lista = [...partes.entries()].filter(([p]) => !filtro || legible(p).includes(filtro) || nombre.toLowerCase().includes(filtro));
    if (filtro && !lista.length) return "";
    const abierto = seleccion.pieza === id || filtro;
    return `<li class="g3-nodo" data-pieza="${id}">
      <div class="g3-nodo__cab"><button type="button" class="g3-ojo" data-ojo="${id}" aria-pressed="${!ocultas.has(id)}" title="Mostrar u ocultar">${ocultas.has(id) ? "◌" : "●"}</button><button type="button" class="g3-nodo__nom" data-elegir="${id}">${esc(nombre)}</button><span class="g3-nodo__n">${partes.size}</span></div>
      ${abierto ? `<ul>${lista.map(([p, n]) => `<li><button type="button" class="g3-hoja" data-elegir="${id}" data-parte="${esc(p)}" aria-pressed="${seleccion.parte === p}">${esc(p.endsWith(".tornilleria") ? "tornillería" : legible(p))}${n > 1 ? ` <small>×${n}</small>` : ""}</button></li>`).join("")}</ul>` : ""}
    </li>`;
  });
  cont.innerHTML = html.join("");
}
function marcarArbol() {
  pintarArbol();
}
$(".g3-arbol")?.addEventListener("click", (e) => {
  const ojo = e.target.closest("[data-ojo]");
  if (ojo) {
    const id = ojo.dataset.ojo;
    if (ocultas.has(id)) ocultas.delete(id);
    else ocultas.add(id);
    pintarArbol();
    aspecto();
    return;
  }
  const el = e.target.closest("[data-elegir]");
  if (!el) return;
  const id = el.dataset.elegir;
  const parte = el.dataset.parte;
  if (parte) {
    if (parte.endsWith(".tornilleria")) seleccionar_(id, { parte: null });
    else seleccionar_(id, { parte, pestana: seleccion.pestana });
    enfocarSeleccion();
  } else seleccionar_(seleccion.pieza === id && !seleccion.parte ? null : id);
});
$(".g3-arbol input")?.addEventListener("input", pintarArbol);

// ───────────── Mandos ─────────────
function decir() {
  const estado = sim.activa ? `simulación · ${sim.cpm} ciclos/min` : paso === 0 ? "armada" : paso === PASOS.length ? "desarmada" : `paso ${paso} de ${PASOS.length}`;
  const sel = seleccion.parte ? ` · ${legible(seleccion.parte)}` : "";
  lectura.textContent = `${camara === camOrto ? "ortográfica" : "perspectiva"} · ${estado}${sel}`;
  pista.textContent = medir.activo ? "toca dos puntos para medir" : "clic izq. gira · der. mueve · rueda acerca · doble clic enfoca";
}
function actualizarMandos() {
  pasoTxt.textContent = `${paso}/${PASOS.length}`;
  $("[data-accion=antes]").disabled = paso === 0;
  $("[data-accion=despues]").disabled = paso === PASOS.length;
  $("[data-accion=desarmar] .gm-btn__txt").textContent = paso === 0 ? "Desarmar" : "Armar";
  $("[data-accion=resguardos]").setAttribute("aria-pressed", String(!sinResguardos));
  $("[data-accion=calor]").setAttribute("aria-pressed", String(calor));
  $("[data-accion=aislar]").setAttribute("aria-pressed", String(aislar));
  $("[data-accion=aristas]").setAttribute("aria-pressed", String(aristasOn));
  $("[data-accion=orto]").setAttribute("aria-pressed", String(camara === camOrto));
  $("[data-accion=medir]").setAttribute("aria-pressed", String(medir.activo));
  $("[data-accion=seccion]").setAttribute("aria-pressed", String(seccion.activa));
  const bs = $("[data-accion=simular]");
  bs.setAttribute("aria-pressed", String(sim.activa && !sim.pausa));
  bs.querySelector(".gm-btn__txt").textContent = sim.activa && !sim.pausa ? "Pausa" : "Simular";
  $(".g3-seccion").hidden = !seccion.activa;
  $(".g3-medida").hidden = !medir.activo;
  decir();
}
function cambiarCamara(orto) {
  const nueva = orto ? camOrto : camPersp;
  if (nueva === camara) return;
  if (orto) {
    camOrto.position.copy(camPersp.position);
    camOrto.quaternion.copy(camPersp.quaternion);
    const dist = camPersp.position.distanceTo(controles.target);
    ajustarOrto(2 * dist * Math.tan((camPersp.fov * Math.PI) / 360));
    camOrto.zoom = 1;
  } else {
    camPersp.position.copy(camOrto.position);
    const dir = camOrto.position.clone().sub(controles.target).normalize();
    const alto = (camOrto.top - camOrto.bottom) / camOrto.zoom;
    camPersp.position.copy(controles.target).addScaledVector(dir, alto / (2 * Math.tan((camPersp.fov * Math.PI) / 360)));
  }
  camara = nueva;
  controles.object = camara;
  ayudaVista.camera = camara;
  controles.update();
  pedirCuadro();
}
// Caja de lo visible con cada conjunto ya en su destino del desarme (para encuadrar antes de que llegue).
function cajaDestino() {
  const b = new THREE.Box3();
  for (const m of mallas) {
    const { pieza, ride } = m.userData;
    if (!m.userData.visibleBase && m.userData.visibleBase !== undefined) continue;
    if (pieza === "film" || (pieza === "resguardos" && sinResguardos)) continue;
    const r = resorte[ride];
    const meta = r ? (r.pending ? r.pending.value : r.target) : 0;
    const mb = new THREE.Box3().setFromObject(m);
    const desp = T(ESC.piezas[ride]?.mover ?? [0, 0, 0]).multiplyScalar(meta - (r?.x ?? 0));
    b.union(mb.translate(desp));
  }
  return b.isEmpty() ? caja3 : b;
}
const acciones = {
  desarmar: () => {
    irAPaso(paso === 0 ? PASOS.length : 0, { seleccionar: paso !== 0 });
    encuadrar(cajaDestino());
  },
  antes: () => irAPaso(paso - 1),
  despues: () => irAPaso(paso + 1),
  mas: () => zoom(1 / 1.3),
  menos: () => zoom(1.3),
  encuadrar: () => encuadrar(cajaVisible()),
  resguardos: () => {
    sinResguardos = !sinResguardos;
    aspecto();
    actualizarMandos();
  },
  calor: () => {
    calor = !calor;
    escena3.toggleAttribute("data-calor", calor);
    aspecto();
    actualizarMandos();
  },
  aislar: () => {
    aislar = !aislar;
    aspecto();
    actualizarMandos();
  },
  aristas: () => {
    aristasOn = !aristasOn;
    aspecto();
    actualizarMandos();
  },
  orto: () => {
    cambiarCamara(camara !== camOrto);
    actualizarMandos();
  },
  medir: () => {
    medir.activo = !medir.activo;
    if (!medir.activo) limpiarMedida();
    else $(".g3-medida").innerHTML = "<small>Toca el primer punto</small>";
    actualizarMandos();
    pedirCuadro();
  },
  seccion: () => {
    seccion.activa = !seccion.activa;
    aplicarSeccion();
    actualizarMandos();
  },
  simular: () => {
    if (!sim.activa) iniciarSim();
    else sim.pausa = !sim.pausa;
    actualizarMandos();
    pedirCuadro();
  },
  detener: () => {
    pararSim();
    sim.angulo = 0;
    sim.ciclos = 0;
    sim.sobres = 0;
  },
  arbol: () => {
    const a = $(".g3-arbol");
    a.toggleAttribute("data-abierto");
    $("[data-accion=arbol]").setAttribute("aria-pressed", String(a.hasAttribute("data-abierto")));
  },
  tema: () => {
    const oscuro = document.body.dataset.theme !== "dark";
    document.body.dataset.theme = oscuro ? "dark" : "light";
    document.documentElement.dataset.theme = oscuro ? "dark" : "light";
    try {
      localStorage.setItem("gm-tema", oscuro ? "dark" : "light");
    } catch {}
    tema3d();
  },
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-accion]");
  if (b && acciones[b.dataset.accion]) return acciones[b.dataset.accion]();
  const v = e.target.closest("[data-vista3]");
  if (v) encuadrar(cajaVisible(), vistasFijas[v.dataset.vista3]);
  const ej = e.target.closest("[data-eje]");
  if (ej) {
    seccion.eje = ej.dataset.eje;
    $$("[data-eje]").forEach((x) => x.setAttribute("aria-pressed", String(x === ej)));
    aplicarSeccion();
  }
  if (e.target.closest("[data-invertir]")) {
    seccion.invertir = !seccion.invertir;
    aplicarSeccion();
  }
});
$("[data-rango-seccion]")?.addEventListener("input", (e) => {
  seccion.pos = Number(e.target.value) / 100;
  aplicarSeccion();
});
$("[data-rango-angulo]")?.addEventListener("input", (e) => {
  if (!sim.activa) iniciarSim();
  sim.pausa = true;
  sim.angulo = Number(e.target.value);
  actualizarMandos();
  pedirCuadro();
});
$("[data-cpm]")?.addEventListener("change", (e) => {
  sim.cpm = Number(e.target.value);
  decir();
});
function zoom(f) {
  if (camara === camOrto) {
    camOrto.zoom /= f;
    camOrto.updateProjectionMatrix();
  } else {
    const d = camara.position.clone().sub(controles.target);
    camara.position.copy(controles.target).addScaledVector(d, f);
  }
  controles.update();
  pedirCuadro();
}
function orbitar(dAz, dEl) {
  const off = camara.position.clone().sub(controles.target);
  const sph = new THREE.Spherical().setFromVector3(off);
  sph.theta += dAz;
  sph.phi = Math.max(0.05, Math.min(Math.PI - 0.05, sph.phi + dEl));
  camara.position.copy(controles.target).add(new THREE.Vector3().setFromSpherical(sph));
  camara.lookAt(controles.target);
  controles.update();
  pedirCuadro();
}
function desplazar(dx, dy) {
  const dist = camara.position.distanceTo(controles.target);
  const paso = dist * 0.04;
  const der = new THREE.Vector3().setFromMatrixColumn(camara.matrix, 0).multiplyScalar(dx * paso);
  const arr = new THREE.Vector3().setFromMatrixColumn(camara.matrix, 1).multiplyScalar(dy * paso);
  camara.position.add(der).add(arr);
  controles.target.add(der).add(arr);
  controles.update();
  pedirCuadro();
}
escena3.addEventListener("keydown", (e) => {
  const k = e.key;
  const giro = (5 * Math.PI) / 180;
  if (k === "ArrowLeft") e.shiftKey ? desplazar(-1, 0) : orbitar(-giro, 0);
  else if (k === "ArrowRight") e.shiftKey ? desplazar(1, 0) : orbitar(giro, 0);
  else if (k === "ArrowUp") e.shiftKey ? desplazar(0, 1) : orbitar(0, -giro);
  else if (k === "ArrowDown") e.shiftKey ? desplazar(0, -1) : orbitar(0, giro);
  else if (k === "+" || k === "=") zoom(1 / 1.2);
  else if (k === "-") zoom(1.2);
  else if (k === "f" || k === "F") enfocarSeleccion();
  else if (k === "Home" || k === "0") encuadrar(cajaVisible(), vistasFijas.iso);
  else if (k === " ") acciones.simular();
  else if (k === "d" || k === "D") acciones.desarmar();
  else if (k === "]") irAPaso(paso + 1);
  else if (k === "[") irAPaso(paso - 1);
  else if (k === "m" || k === "M") acciones.medir();
  else if (k === "Escape") {
    if (medir.activo) acciones.medir();
    else seleccionar_(null);
  } else return;
  e.preventDefault();
});

// ───────────── Bucle de render (solo cuando algo cambia) ─────────────
let pendiente = false;
let ultimo = performance.now();
function pedirCuadro() {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(cuadro);
}
controles.addEventListener("change", pedirCuadro);
function cuadro(t) {
  pendiente = false;
  const dt = Math.min(0.05, Math.max(0, (t - ultimo) / 1000));
  ultimo = t;
  reloj += dt;
  let sigue = false;
  if (ESC) {
    if (avanzarResortes(dt)) sigue = true;
    if (IDS.some((id) => resorte[id].pending)) sigue = true;
    colocarGrupos();
    if (sim.activa) {
      pasoSim(dt);
      sigue = true;
    }
  }
  if (animCam) {
    animCam.t = Math.min(1, animCam.t + dt / 0.55);
    const k = suave(0, 1, animCam.t);
    camara.position.lerpVectors(animCam.desde.pos, animCam.destino.pos, k);
    controles.target.lerpVectors(animCam.desde.target, animCam.destino.target, k);
    if (camara === camOrto) ajustarOrto(animCam.destino.zoom);
    if (animCam.t >= 1) animCam = null;
    sigue = true;
  }
  if (controles.update()) sigue = true;
  if (ayudaVista.animating) {
    ayudaVista.update(dt);
    sigue = true;
  }
  renderer.clear();
  renderer.render(scene, camara);
  renderer.autoClear = false;
  ayudaVista.render(renderer);
  renderer.autoClear = true;
  if (sigue) pedirCuadro();
}
function redimensionar() {
  const w = lienzo.clientWidth;
  const h = lienzo.clientHeight;
  renderer.setSize(w, h, false);
  camPersp.aspect = w / Math.max(1, h);
  camPersp.updateProjectionMatrix();
  const alto = camOrto.top - camOrto.bottom || 600;
  ajustarOrto(alto);
  pedirCuadro();
}
new ResizeObserver(redimensionar).observe(lienzo);

// ───────────── Arranque ─────────────
const Q = new URLSearchParams(location.search);
if (Q.get("solo") === "1") {
  document.body.setAttribute("data-solo", "");
  ayudaVista.render = () => {};
}
try {
  const t = Q.get("tema") || localStorage.getItem("gm-tema");
  if (t) {
    document.body.dataset.theme = t;
    document.documentElement.dataset.theme = t;
  }
} catch {}
tema3d();
pintarLeyenda();
pintarPanel();
redimensionar();
fetch(`${D.dirVistas}escena.json?v=${D.version}`)
  .then((r) => {
    if (!r.ok) throw new Error(`escena: ${r.status}`);
    return r.json();
  })
  .then((esc) => {
    construirMaquina(esc);
    prepararAnim();
    cargando.hidden = true;
    encuadrar(caja3, vistasFijas[Q.get("vista")] ?? vistasFijas.iso, true);
    if (Q.get("orto") === "1") cambiarCamara(true);
    aspecto();
    pintarArbol();
    actualizarMandos();
    if (Q.get("resguardos") === "1") acciones.resguardos();
    if (Q.get("calor") === "1") acciones.calor();
    if (Q.has("paso")) {
      irAPaso(Number(Q.get("paso")) || 0, { seleccionar: !Q.has("pieza"), inmediato: true });
      colocarGrupos();
      encuadrar(cajaVisible(), vistasFijas[Q.get("vista")] ?? vistasFijas.iso, true);
    }
    if (Q.has("seccion")) {
      seccion.activa = true;
      seccion.eje = Q.get("seccion") || "x";
      seccion.pos = Number(Q.get("pos") ?? 50) / 100;
      aplicarSeccion();
      actualizarMandos();
    }
    const sensorUrl = D.sensores.find((s) => s.sigla === Q.get("sensor"));
    if (sensorUrl) {
      seleccionar_(sensorUrl.pieza, { sensor: sensorUrl.sigla, pestana: "sensores" });
      mostrarSensor(sensorUrl);
    } else if (D.piezas[Q.get("pieza")]) {
      seleccionar_(Q.get("pieza"), { pestana: Q.get("pestana") ?? undefined });
      if (Q.get("acercar") === "1") centrarEn(Q.get("pieza"));
    }
    if (Q.has("angulo")) {
      iniciarSim();
      sim.pausa = true;
      sim.angulo = Number(Q.get("angulo"));
      actualizarMandos();
    } else if (Q.get("sim") === "1") iniciarSim();
    if (Q.get("arbol") === "1") acciones.arbol();
    pedirCuadro();
  })
  .catch((e) => {
    cargando.textContent = "No se pudo cargar la máquina 3D. Ábrela desde la app o un servidor.";
    console.error(e);
  });
historialEnVivo();

window.gemelo = { irAPaso, seleccionar: seleccionar_, encuadrar: (v) => encuadrar(cajaVisible(), vistasFijas[v]), sim, iniciarSim, pararSim, estado: () => ({ paso, seleccion, sim: { ...sim }, mallas: mallas.length, tornillos: totalTornillos }) };
