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
renderer.toneMappingExposure = 1.24;

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

// ───────────── Iluminación Cinematográfica de Estudio ─────────────
const luzHemi = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.55);
scene.add(luzHemi);

// 1. Key Light (Luz Principal frontal-superior con sombras suaves PCF)
const sol = new THREE.DirectionalLight(0xffffff, 1.85);
sol.position.set(550, 950, 750);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -650, right: 650, top: 650, bottom: -650, near: 10, far: 2600 });
sol.shadow.bias = -0.00015;
sol.shadow.radius = 1.8;
scene.add(sol);

// 2. Rim / Edge Backlight (Contraluz metálico para destacar aristas, perfiles y acrílicos)
const luzContraluz = new THREE.DirectionalLight(0xdbeafe, 1.45);
luzContraluz.position.set(-650, 800, -750);
scene.add(luzContraluz);

// 3. Fill Light (Luz de Relleno para revelar detalles mecánicos internos y tolva)
const luzRelleno = new THREE.DirectionalLight(0xfefce8, 0.75);
luzRelleno.position.set(-500, 450, 600);
scene.add(luzRelleno);

// 4. Top Accent Light (Luz Cenital para mesa de empalme, tolva y techos)
const luzCenital = new THREE.DirectionalLight(0xfff7ed, 0.55);
luzCenital.position.set(0, 1400, 0);
scene.add(luzCenital);

// 5. Floor Bounce (Rebote suave del suelo industrial)
const luzSuelo = new THREE.DirectionalLight(0x64748b, 0.25);
luzSuelo.position.set(0, -600, 300);
scene.add(luzSuelo);

const suelo = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.ShadowMaterial({ opacity: 0.24 }));
suelo.rotation.x = -Math.PI / 2;
suelo.receiveShadow = true;
scene.add(suelo);
const rejilla = new THREE.GridHelper(2400, 60, 0x9aa2ab, 0xc9cfd5);
rejilla.material.transparent = true;
rejilla.material.opacity = 0.35;
rejilla.position.y = 0.05;
scene.add(rejilla);
// El modelo usa las coordenadas de la planta del esquema (x a la derecha, y hacia el frente,
// z arriba). Al pasarlas a three.js (y <-> z) la mano se invierte: el espejo en x la devuelve,
// y la maquina queda como la real (cinta, HMI y armario a la izquierda del operador).
const raiz = new THREE.Group();
raiz.name = "maquina";
raiz.scale.x = -1;
scene.add(raiz);
raiz.updateMatrixWorld(true);

// Retícula visual táctil al tocar una pieza
const reticulaMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, depthTest: false, transparent: true, opacity: 0.95 });
const reticulaGeo = new THREE.RingGeometry(1.0, 2.2, 28);
const reticulaMesh = new THREE.Mesh(reticulaGeo, reticulaMat);
reticulaMesh.visible = false;
raiz.add(reticulaMesh);
let reticulaT0 = 0;

function mostrarReticula(p) {
  if (!p) return;
  reticulaMesh.position.copy(raiz.worldToLocal(p.clone()));
  reticulaMesh.quaternion.copy(camara.quaternion);
  reticulaMesh.scale.set(0.6, 0.6, 0.6);
  reticulaMat.opacity = 0.95;
  reticulaMesh.visible = true;
  reticulaT0 = performance.now();
  pedirCuadro();
}

function animarReticula(ahora) {
  if (!reticulaMesh.visible) return;
  const trans = (ahora - reticulaT0) / 340;
  if (trans >= 1) {
    reticulaMesh.visible = false;
    return;
  }
  const s = 0.6 + trans * 1.8;
  reticulaMesh.scale.set(s, s, s);
  reticulaMat.opacity = Math.max(0, 0.95 * (1 - trans));
  reticulaMesh.quaternion.copy(camara.quaternion);
  pedirCuadro();
}

function tema3d() {
  const oscuro = document.body.dataset.theme === "dark";
  scene.background = new THREE.Color(oscuro ? 0x0f1318 : 0xf1f5f9);
  rejilla.material.color = new THREE.Color(oscuro ? 0x1e2630 : 0xcad4df);
  suelo.material.opacity = oscuro ? 0.38 : 0.20;
  luzHemi.intensity = oscuro ? 0.45 : 0.65;
  sol.intensity = oscuro ? 1.75 : 1.95;
  luzContraluz.intensity = oscuro ? 1.45 : 1.15;
  luzRelleno.intensity = oscuro ? 0.8 : 0.7;
  pedirCuadro();
}

// ───────────── Materiales PBR de Alta Fidelidad ─────────────
const planosCorte = [];
const M = (o) => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, clippingPlanes: planosCorte, ...o });
const MAT = {
  hi: M({ color: 0xdde3ea, metalness: 0.75, roughness: 0.22 }),
  mid: M({ color: 0xb4bdc7, metalness: 0.68, roughness: 0.28 }),
  lo: M({ color: 0x7e8996, metalness: 0.58, roughness: 0.40 }),
  pintado: M({ color: 0xdcdfda, metalness: 0.05, roughness: 0.52 }),
  oscuro: M({ color: 0x22252a, metalness: 0.25, roughness: 0.50 }),
  motor: M({ color: 0x1d4ed8, metalness: 0.45, roughness: 0.30 }),
  papel: M({ color: 0xfcfbf7, metalness: 0, roughness: 0.85 }),
  bobina: M({ color: 0xf5f1e6, metalness: 0, roughness: 0.82 }),
  lona: M({ color: 0x1a6b39, metalness: 0.02, roughness: 0.88 }),
  negro: M({ color: 0x1c1e21, metalness: 0.12, roughness: 0.65 }),
  aislante: M({ color: 0xc8964e, metalness: 0, roughness: 0.65 }),
  cobre: M({ color: 0xd8782f, metalness: 0.80, roughness: 0.24 }),
  valvula: M({ color: 0x2563eb, metalness: 0.22, roughness: 0.36 }),
  sensor: M({ color: 0xd6b25c, metalness: 0.82, roughness: 0.22 }),
  pantalla: M({ color: 0x090d16, metalness: 0.3, roughness: 0.16, emissive: 0x1d4ed8, emissiveIntensity: 0.55 }),
  seta: M({ color: 0xe3262a, metalness: 0.08, roughness: 0.35 }),
  vidrio: new THREE.MeshPhysicalMaterial({ color: 0xddf2ff, metalness: 0.02, roughness: 0.06, transmission: 0.82, ior: 1.49, thickness: 1.6, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: planosCorte }),
  led: new THREE.MeshStandardMaterial({ color: 0x2e7d32, emissive: 0x43d65a, emissiveIntensity: 0.35, clippingPlanes: planosCorte }),
  ledOn: new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0xffa000, emissiveIntensity: 2.2, clippingPlanes: planosCorte }),
  perno: M({ color: 0x939ba4, metalness: 0.85, roughness: 0.22 }),
  // materiales de la maquina real (fotos y manual Schmucker MS235)
  inox: M({ color: 0xdde3ea, metalness: 0.88, roughness: 0.20 }),
  alu: M({ color: 0xebf0f5, metalness: 0.78, roughness: 0.24 }),
  caliente: M({ color: 0xa85a32, metalness: 0.68, roughness: 0.32, emissive: 0x4a1805, emissiveIntensity: 0.35 }),
  fundicion: M({ color: 0x3e4550, metalness: 0.45, roughness: 0.50 }),
  bronce: M({ color: 0xc99742, metalness: 0.75, roughness: 0.28 }),
  laton: M({ color: 0xdfba4e, metalness: 0.82, roughness: 0.22 }),
  cromo: M({ color: 0xf8fafc, metalness: 0.98, roughness: 0.04 }),
  crema: M({ color: 0xf3e8cb, metalness: 0, roughness: 0.50 }),
  ptfe: M({ color: 0xf8f7f2, metalness: 0, roughness: 0.45 }),
  caucho: M({ color: 0x18191b, metalness: 0.05, roughness: 0.85 }),
  euchner: M({ color: 0xdc2626, metalness: 0.05, roughness: 0.35 }),
  m12: M({ color: 0x16a34a, metalness: 0.1, roughness: 0.40 }),
  harting: M({ color: 0x94a3b8, metalness: 0.35, roughness: 0.45 }),
  manguera: M({ color: 0x0284c7, metalness: 0.08, roughness: 0.34 }),
  conduit: M({ color: 0x8d949b, metalness: 0.25, roughness: 0.55 }),
  reten: M({ color: 0x2563eb, metalness: 0.1, roughness: 0.45 }),
  champan: M({ color: 0xa6906f, metalness: 0.72, roughness: 0.34 }),
  manillaVerde: M({ color: 0x0fa968, metalness: 0.15, roughness: 0.38 }),
  riel: M({ color: 0xc4c9ce, metalness: 0.82, roughness: 0.25 }),
  canaleta: M({ color: 0x9aa3ab, metalness: 0, roughness: 0.65 }),
  breaker: M({ color: 0xf4f4f0, metalness: 0, roughness: 0.5 }),
  rele: M({ color: 0x3d4a57, metalness: 0.05, roughness: 0.5 }),
  plc: M({ color: 0x9fa6ad, metalness: 0.15, roughness: 0.5 }),
  borne: M({ color: 0x8e979e, metalness: 0, roughness: 0.6 }),
  borneAzul: M({ color: 0x2563eb, metalness: 0.6, roughness: 0.6 }),
  borneTierra: M({ color: 0x65a30d, metalness: 0, roughness: 0.6 }),
  palanca: M({ color: 0x22252a, metalness: 0.1, roughness: 0.5 }),
  hiloAzul: M({ color: 0x1d4ed8, metalness: 0, roughness: 0.6 }),
  hiloNegro: M({ color: 0x18191b, metalness: 0, roughness: 0.6 }),
  hiloRojo: M({ color: 0xdc2626, metalness: 0, roughness: 0.6 }),
  amarillo: M({ color: 0xeab308, metalness: 0.05, roughness: 0.5 }),
  maneta: M({ color: 0xdc2626, metalness: 0.05, roughness: 0.40 }),
};
const ARISTA = new THREE.LineBasicMaterial({ color: 0x1f2328, transparent: true, opacity: 0.32, clippingPlanes: planosCorte });
const ARISTA_SEL = new THREE.LineBasicMaterial({ color: 0x1f6feb, transparent: true, opacity: 0.9, clippingPlanes: planosCorte });

function materialDe(it) {
  const n = it.n;
  if (it.ma && MAT[it.ma]) return MAT[it.ma];
  if (it.c === "manguera") return MAT.manguera;
  if (/cable-calefaccion/.test(n)) return MAT.conduit;
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
  // Piezas de acero inoxidable pulido / cepillado
  if (/^bastidor\.(pared|base|lateral|tapa-inspeccion|bandeja|viga)|^salida\.(larguero|pata|travesano|deslizadero|borde-deslizadero|bandeja)|^dosificacion\.tolva/.test(n)) return MAT.inox;
  if (/^resguardos\.tirador/.test(n)) return MAT.manillaVerde;
  if (/^resguardos\.(poste|travesano|larguero|perfil)/.test(n)) return MAT.champan;
  if (/^guias\.rodillo|^desbobinado\.rodillo(?!-motorizado)/.test(n)) return MAT.crema;
  // Acero templado rectificado cromo / guías / cuchillas de corte
  if (/^guias\.(giro|barra-A|barra-B)|^corte\.(cuchilla|eje|disco-cartucho|anillo)|^desbobinado\.cuchilla|^arrastre\.(rodillo|eje)|^pinzas\.(vastago|barra-derecha)|cilindro.*vastago/.test(n)) return MAT.cromo;
  if (/^bobina\.(cono|eje)/.test(n)) return MAT.alu;
  if (/^pinzas\.goma/.test(n)) return MAT.caucho;
  if (/^soldadura\.(placa-soldante|bloque-calefactor)/.test(n)) return MAT.caliente;
  if (/conector/.test(n)) return MAT.harting;
  if (/electrovalvula/.test(n)) return MAT.valvula;
  if (/bobina-ev|bisagra|muelle-gas|manilla|tirador|pata-disco/.test(n)) return MAT.oscuro;
  if (/euchner/.test(n)) return MAT.euchner;
  if (/aislante/.test(n)) return MAT.aislante;
  if (/resistencia/.test(n)) return MAT.cobre;
  if (/membrana|fieltro|ventilador/.test(n)) return MAT.oscuro;
  return MAT[it.t] ?? MAT.mid;
}

// Variantes por estado (resaltado, seleccionado, fantasma, mapa de fallas), en cache.
const variantes = new Map();
// "Colores": cada conjunto con su color, para distinguirlos de un vistazo
const COLOR_CONJUNTO = {
  bobina: 0xf2b134, desbobinado: 0xe8743b, guias: 0x9b59b6, fotocelula: 0xe84393, dosificacion: 0x00a8a8,
  soldadura: 0xd63031, arrastre: 0x6c5ce7, corte: 0xfd79a8, pinzas: 0x00b894, salida: 0x27ae60,
  motor: 0x0984e3, carter: 0x74b9ff, bastidor: 0xb2bec3, hmi: 0x2d3436, armario: 0xfdcb6e,
  resguardos: 0x81ecec, film: 0xf5f2ea,
};
let porConjunto = false;
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
  else if (tipo.startsWith("conj:")) Object.assign(m, { color: new THREE.Color(COLOR_CONJUNTO[tipo.slice(5)] ?? 0xb2bec3), metalness: 0.25, roughness: 0.48, map: null });
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

function grupoDe(ride) {
  if (!grupos[ride]) {
    grupos[ride] = new THREE.Group();
    grupos[ride].name = ride;
    raiz.add(grupos[ride]);
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
    // los de una pieza que se mueve en la simulacion van en su propio grupo, para moverlos con ella
    const parte = pr.parte?.replace(/[#:].*$/, "") ?? null;
    const centro = pr.pts.reduce((a, p) => a.map((v, i) => v + p[i] / pr.pts.length), [0, 0, 0]);
    const mueve = parte && reglaAnim({ userData: { parte, centro } }) ? `${parte}|${Math.sign(centro[0])}` : "";
    const exp = pr.e1 || pr.e2 ? `|${pr.e1}|${pr.e2}|${Math.sign(centro[0])}` : "";
    const clave = `${pr.ride}|${pr.pieza}|${pr.tipo}|${mueve}${exp}`;
    if (!porClave.has(clave)) porClave.set(clave, { ...pr, parteMov: mueve ? parte : null, centros: [], lista: [] });
    porClave.get(clave).centros.push(centro);
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
    im.matrixAutoUpdate = false;
    const centro = g.centros.reduce((a, c) => a.map((v, i) => v + c[i] / g.centros.length), [0, 0, 0]);
    im.userData = { pieza: g.pieza, ride: g.ride, base: MAT.perno, parte: g.parteMov ?? `${g.pieza}.tornilleria`, centro, tornillos: g.lista.length, perno: true, e1: g.e1, e2: g.e2 };
    grupoDe(g.ride).add(im);
    instancias.push(im);
    (porPiezaMallas[g.pieza] ??= []).push(im);
  }
  armarPuerta();
  raiz.updateMatrixWorld(true);
  caja3 = new THREE.Box3();
  for (const m of mallas) if (m.userData.pieza !== "resguardos") caja3.expandByObject(m);
  totalTornillos = esc.pernos.reduce((a, p) => a + p.pts.length, 0);
}
let totalTornillos = 0;

// Puerta del armario: sus piezas (y lo montado en su cara interior) giran sobre la bisagra.
const puerta = { grupo: null, ang: 0, meta: 0 };
function armarPuerta() {
  const suyas = mallas.filter((m) => m.userData.it.pu);
  if (!suyas.length) return;
  const caja = new THREE.Box3();
  for (const m of suyas.filter((x) => x.userData.parte === "armario.puerta")) {
    m.geometry.computeBoundingBox();
    caja.union(m.geometry.boundingBox);
  }
  const bisagra = new THREE.Vector3(caja.max.x, 0, caja.min.z);
  puerta.grupo = new THREE.Group();
  puerta.grupo.name = "puerta-armario";
  puerta.grupo.position.copy(bisagra);
  const dentro = new THREE.Group();
  dentro.position.copy(bisagra).negate();
  puerta.grupo.add(dentro);
  for (const m of suyas) dentro.add(m);
  grupoDe("armario").add(puerta.grupo);
}
function abrirArmario(abrir = puerta.meta === 0) {
  puerta.meta = abrir ? 1.85 : 0;
  if (quieto3.matches) puerta.ang = puerta.meta;
  actualizarMandos();
  pedirCuadro();
}
function moverPuerta(dt) {
  if (!puerta.grupo) return false;
  const falta = puerta.meta - puerta.ang;
  if (Math.abs(falta) < 0.002) {
    if (puerta.ang !== puerta.meta) {
      puerta.ang = puerta.meta;
      puerta.grupo.rotation.y = puerta.ang;
      if (cableado.vista) pintarCables();
    }
    return false;
  }
  puerta.ang += falta * Math.min(1, dt * 5);
  puerta.grupo.rotation.y = puerta.ang;
  return true;
}

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
  if (n !== paso) setTimeout(pintarCables, 0);
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
// Las pinzas toman la fila colgada antes del corte, la bajan y la sueltan sobre el deslizadero:
// la cinta corre por debajo del corte y sale por el costado.
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
const BAJADA = 20;
const sim = { activa: false, angulo: 0, cpm: 50, ciclos: 0, sobres: 0, ultimoU: 0 };
const suave = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const enVentana = (u, a, b) => (a <= b ? u >= a && u <= b : u >= a || u <= b);
function estadoCiclo(u) {
  // cierra de cierre[0] a cierre[1] (pasando por 0°), abre de cierre[2] a cierre[3] y queda abierta
  const [c0, c1, a0, a1] = FASES.cierre;
  const fCierre = u >= c0 ? suave(c0, 1 + c1, u) : u < c1 ? suave(c0 - 1, c1, u) : 1 - suave(a0, a1, u);
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
  { tag: "Pinzas", txt: "toma de sobres: baja y suelta", on: (u) => enVentana(u, FASES.pinzasBaja[0], FASES.pinzasSube[1]) },
  { tag: "B52.x", txt: "expulsión: sobre bajo el láser", on: () => sobreEnExpulsion },
];
let sobreEnExpulsion = false;

// Que se mueve y como, por nombre de pieza. ejes y pivotes en el mundo del modelo.
function reglaAnim(m) {
  const n = m.userData.parte;
  const c = m.userData.centro ?? [0, 0, 0];
  const lado = Math.sign(c[0]) || 1;
  if (/^motor\.volante/.test(n)) return { rot: [1, 0, 0], p: [0, -70, 236], f: (e) => e.theta };
  if (/^motor\.(eje-levas|leva|corona)/.test(n)) return { rot: [1, 0, 0], p: [0, -40, 236], f: (e) => e.theta };
  if (n === "motor.pinon") return { rot: [1, 0, 0], p: [0, -60, 76], f: (e) => e.theta * 1.5 };
  if (/^arrastre\.(rodillo|engranaje)/.test(n)) return { rot: [0, 1, 0], p: [7 * lado, 0, 212], f: (e) => (-lado * e.papel) / 6 };
  // discos de los cartuchos: locos, giran por contacto con los anillos del eje de contraste
  if (n === "corte.disco-cartucho") return { rot: [0, 1, 0], p: [-6, 0, 190], f: (e) => e.papel / 5 };
  if (/^corte\.(eje-contraste|anillo-contraste)/.test(n)) return { rot: [0, 1, 0], p: [7, 0, 190], f: (e) => -e.papel / 6 };
  if (/^corte\.(cuchilla-rotativa|eje-cuchilla|leva)/.test(n)) return { rot: [0, 1, 0], p: [-9, 0, 170], f: (e) => -e.cuchilla };
  // la cuchilla del desbobinado gira con el papel; el rodillo del balancin oscila con sus brazos
  if (/^desbobinado\.(cuchilla|eje-cuchilla)/.test(n)) return { rot: [1, 0, 0], p: [0, -146, 361], f: (e) => -e.papel / 9 };
  if (n === "desbobinado.rodillo-balancin") return { rot: [1, 0, 0], p: [0, -150, 300], f: (e) => Math.sin(e.theta * 1) * 0.03 };
  if (/^desbobinado\.(rodillo|contraste)/.test(n)) {
    const r = n.includes("alto") || n.includes("motorizado") ? 6 : n.includes("balancin") ? 4.5 : n.includes("contraste") ? 4 : 5;
    return { rot: [1, 0, 0], p: [0, c[1], c[2]], f: (e) => -e.papel / r };
  }
  if (/^bobina\.(bobina|eje|cono)$/.test(n) && Math.abs(c[2] - 120) < 30) return { rot: [1, 0, 0], p: [0, -215, 120], f: (e) => -e.papel / 62.5 };
  if (n === "guias.rodillo") return { rot: [0, 1, 0], p: [c[0], 0, 325.5], f: (e) => (lado * e.papel) / 4 };
  if (/^dosificacion\.(estrella|eje-estrella|polea)$/.test(n)) return { rot: [0, 1, 0], p: [0, 0, 368], f: (e) => e.estrella };
  if (/^dosificacion\.(polea-motor|eje-motor)$/.test(n)) return { rot: [0, 1, 0], p: [48, 0, 412], f: (e) => e.estrella * 1.5 };
  if (n === "salida.tambor") return { rot: [0, 1, 0], p: [c[0], 0, 94], f: (e) => -e.cinta / 5 };
  // apertura de la placa (unidades de 4 mm): la leva la abre 2,5 por ciclo; el aire de los cilindros, 6 mas
  const apertura = (e) => 2.5 * (1 - e.fCierre) + 6 * manual.mordazas;
  const abre = (e) => [lado * apertura(e), 0, 0];
  // la placa calefactora y su varillaje avanzan paralelos (el cuerpo de fundicion no se mueve)
  if (/^soldadura\.(placa-soldante|bloque-calefactor|tapa-ptfe|resistencia|caja-bornes|harting|aislante|lamina|poste-muelle|placa-formato|sensor\.B41|bloque-bisagra|pasador|biela-larga)/.test(n)) return { mov: abre };
  // bielas cortas: giran sobre su arbol vertical (x = ±23) lo que pide el avance del pasador
  if (n === "soldadura.biela-corta") {
    const est = [28, 70, 112].reduce((a, b) => (Math.abs(b - (c[1] + 3)) < Math.abs(a - (c[1] + 3)) ? b : a));
    return { rot: [0, 0, 1], p: [lado * 23, est - 6, 0], f: (e) => (lado * apertura(e)) / 6 };
  }
  // cuna: oscila sobre el eje que sale de la pared
  if (n === "soldadura.cuna") return { rot: [0, 1, 0], p: [lado * 33, 0, 291], f: (e) => lado * 0.05 * apertura(e) };
  // fuelle del cilindro: fijo a la tapa del cilindro (x = ±76); el aire recoge el vastago y lo comprime
  if (n === "soldadura.fuelle") return { escala: { ancla: [76 * lado, 0, 0], k: () => 1 - 0.3 * manual.mordazas, mov: () => [0, 0, 0] } };
  // bastidor de levas: las dos levas giran con la maquina y los resortes de los tirantes se comprimen al cerrar
  if (n === "soldadura.leva-plancha") return { rot: [1, 0, 0], p: [0, -41, 280], f: (e) => e.theta };
  if (/^soldadura\.muelle-tirante/.test(n)) return { escala: { eje: "y", ancla: [0, -48, 0], k: (e) => 1 + 0.12 * (1 - e.fCierre), mov: () => [0, 0, 0] } };
  // resortes de la lamina: viajan con la plancha y se estiran un poco al apretar
  if (/^soldadura\.muelle-lamina/.test(n)) return { escala: { ancla: [9.1 * lado, 0, 0], k: (e) => 1 - 0.08 * (1 - e.fCierre), mov: abre } };
  // manivelas de la pared: giran con el eje de levas
  if (/^motor\.(disco-manivela|manivela|rodamiento-manivela)/.test(n)) return { rot: [0, 1, 0], p: [c[0], 0, 317], f: (e) => e.theta };
  if (/^pinzas\.(patin|viga|placa-extremo|barra-derecha|brazo|vastago|biela|rotula)/.test(n)) return { mov: (e) => [0, 0, -BAJADA * e.baja] };
  // los dedos se abren hacia afuera (lejos del papel) y cierran sobre la fila
  if (/^pinzas\.(dedo|goma)/.test(n)) return { mov: (e) => [lado * 1.4 * (1 - e.agarre), 0, -BAJADA * e.baja] };
  if (n === "film.sobre") return { sobre: true };
  if (n === "salida.sobre") return { oculto: true };
  if (/^desbobinado\.(balancin)/.test(n)) return { rot: [1, 0, 0], p: [0, -150, 300], f: (e) => Math.sin(e.theta * 1) * 0.03 };
  return null;
}
// ───────────── Despiece a profundidad (por ahora, el grupo de soldadura) ─────────────
// t = 0 armado, 1 subconjuntos separados (e1), 2 cada pieza separada (e2).
const despiece = { pieza: null, t: 0, meta: 0 };
const SUBCONJUNTOS = {
  "plancha-izq": ["Placa calefactora izquierda", "S4A21100230", "S4A21100231"],
  "plancha-der": ["Placa calefactora derecha", "S4A21100230", "S4A21100231"],
  "mordaza-izq": ["Mordaza izquierda: cuerpo, paralelogramo y capota", "S4M14100110", "M2M14100346"],
  "mordaza-der": ["Mordaza derecha: cuerpo, paralelogramo y bandeja", "S4M14100110", "M2M14100354"],
  "cilindro-izq": ["Cilindro con fuelle izquierdo", "S4M14100110", "2M14100317"],
  "cilindro-der": ["Cilindro con fuelle derecho", "S4M14100110", "2M14100317"],
  levas: ["Bastidor de levas y tirantes con resorte", "S4M14100110", "M2M14100351"],
  puente: ["Puente entre las cunas", "S4M14100110", "2M14100313"],
  formado: ["Placas de formado (molde)", "S4M14100110", "S4M14100110"],
  anclaje: ["Placa de anclaje", "S4M15100110", "S4M15100110"],
  marco: ["Marco frontal", "S4M15100110", "S4M15100110"],
  codificador: ["Codificador de lote", "S4M14100110", "S4M14100110"],
  sensores: ["Sensores del sellado", "S4M14100110", "S4M14100110"],
};
const tieneDespiece = (pieza) => !!pieza && mallas.some((m) => m.userData.pieza === pieza);
const despieceCurado = (pieza) => mallas.some((m) => m.userData.pieza === pieza && m.userData.it.e1);
// despiece automatico: cada pieza se aleja del centro del conjunto (nivel 1 poco, nivel 2 mas)
function prepararDespieceAuto(pieza) {
  const propias = [...mallas, ...instancias].filter((m) => m.userData.pieza === pieza);
  const caja = new THREE.Box3();
  const centros = new Map();
  for (const m of propias) {
    let c;
    if (m.isInstancedMesh) c = T(m.userData.centro ?? [0, 0, 0]);
    else {
      m.geometry.computeBoundingBox();
      c = m.geometry.boundingBox.getCenter(new THREE.Vector3());
    }
    centros.set(m, c);
    caja.expandByPoint(c);
  }
  const centro = caja.getCenter(new THREE.Vector3());
  const tam = caja.getSize(new THREE.Vector3()).length() || 1;
  for (const m of propias) {
    const d = centros.get(m).clone().sub(centro);
    // un poco mas hacia arriba y hacia el frente, para que no se tapen
    d.y += 0.15 * d.length();
    m.userData.autoExp = d.multiplyScalar(Math.min(1.2, 120 / tam));
  }
}
function desplazamientoDespiece(u, t) {
  const e1 = u.e1 ?? u.it?.e1;
  const e2 = u.e2 ?? u.it?.e2;
  if (!e1 && !e2) return u.autoExp && !despiece.curado ? u.autoExp.clone().multiplyScalar(t * 0.6) : null;
  const a = Math.min(1, t);
  const b = Math.max(0, t - 1);
  const v = [0, 1, 2].map((i) => (e1?.[i] ?? 0) * a + (e2?.[i] ?? 0) * b);
  return T(v);
}
function pintarDespiece() {
  const t = despiece.t;
  for (const m of [...mallas, ...instancias]) {
    const u = m.userData;
    if (u.pieza !== despiece.pieza) continue;
    const d = desplazamientoDespiece(u, t);
    if (d) {
      m.matrix.makeTranslation(d.x, d.y, d.z);
      m.updateMatrixWorld(true);
    } else if (u.it?.o3 && /^(soldadura\.(manguera|cable-calefaccion))/.test(u.parte)) m.visible = t < 0.02 && u.visibleBase !== false;
  }
}
function despiezar(nivel) {
  const pieza = seleccion.pieza;
  if (!pieza || !tieneDespiece(pieza)) return;
  // si habia otro conjunto desarmado, vuelve a su sitio
  if (despiece.pieza && despiece.pieza !== pieza) {
    despiece.t = 0;
    pintarDespiece();
  }
  despiece.curado = despieceCurado(pieza);
  if (!despiece.curado) prepararDespieceAuto(pieza);
  if (sim.activa) pararSim();
  for (const k of Object.keys(manualMeta)) manualMeta[k] = manual[k] = 0;
  if (paso !== 0) irAPaso(0, { seleccionar: false, inmediato: true });
  aplicarAnim(null, false);
  despiece.pieza = pieza;
  despiece.meta = nivel;
  if (quieto3.matches) despiece.t = nivel;
  aislar = nivel > 0;
  aspecto();
  // encuadre del grupo ya desarmado
  const b = new THREE.Box3();
  for (const m of mallas) {
    if (m.userData.pieza !== pieza || !m.visible) continue;
    const caja = new THREE.Box3().setFromObject(m);
    const d = desplazamientoDespiece(m.userData, nivel);
    if (d) caja.translate(d.multiply(raiz.scale));
    b.union(caja);
  }
  if (!b.isEmpty()) encuadrar(b.expandByScalar(15));
  pintarPanel();
  pintarBarraDespiece();
  pedirCuadro();
}
// barra flotante en la escena para desarmar lo elegido
const barraDespiece = document.createElement("div");
barraDespiece.className = "g3-despiece";
barraDespiece.hidden = true;
escena3.appendChild(barraDespiece);
function pintarBarraDespiece() {
  const pieza = seleccion.pieza;
  if (!pieza || !tieneDespiece(pieza)) {
    barraDespiece.hidden = true;
    return;
  }
  barraDespiece.hidden = false;
  const nivel = despiece.pieza === pieza ? despiece.meta : 0;
  const curado = despieceCurado(pieza);
  barraDespiece.innerHTML = `<span class="g3-despiece__tit">${esc(D.piezas[pieza]?.nombre ?? pieza)}</span>
    <button type="button" data-despiece="${nivel > 0 ? 0 : curado ? 1 : 2}" aria-pressed="${nivel > 0}">${nivel > 0 ? "Armar" : "Desarmar"}</button>
    ${curado ? `<button type="button" data-despiece="1" aria-pressed="${nivel === 1}">Subconjuntos</button><button type="button" data-despiece="2" aria-pressed="${nivel === 2}">Pieza por pieza</button>` : ""}
    <input type="range" min="0" max="200" value="${Math.round(nivel * 100)}" data-rango-despiece aria-label="Cuánto se desarma">`;
}
barraDespiece.addEventListener("click", (e) => {
  const b = e.target.closest("[data-despiece]");
  if (b) despiezar(Number(b.dataset.despiece));
});
barraDespiece.addEventListener("input", (e) => {
  const rg = e.target.closest("[data-rango-despiece]");
  if (!rg) return;
  const v = Number(rg.value) / 100;
  if (despiece.pieza !== seleccion.pieza || despiece.meta === 0) despiezar(v);
  despiece.meta = v;
  aislar = v > 0;
  pedirCuadro();
});
function moverDespiece(dt) {
  if (despiece.pieza === null) return false;
  const falta = despiece.meta - despiece.t;
  if (Math.abs(falta) < 0.002) {
    if (despiece.t !== despiece.meta) {
      despiece.t = despiece.meta;
      pintarDespiece();
    }
    if (despiece.t === 0) {
      despiece.pieza = null;
      aplicarAnim(null, false);
    }
    return false;
  }
  despiece.t += falta * Math.min(1, dt * 3);
  pintarDespiece();
  return true;
}
// datos para el panel: subconjuntos con sus piezas y codigos
function despieceDe(pieza) {
  if (!tieneDespiece(pieza)) return null;
  if (!despieceCurado(pieza)) {
    const piezas = new Map();
    for (const m of mallas) if (m.userData.pieza === pieza) piezas.set(legible(m.userData.parte), (piezas.get(legible(m.userData.parte)) ?? 0) + 1);
    return { nivel: despiece.pieza === pieza ? despiece.meta : 0, auto: true, subs: [{ id: "", nombre: "Piezas del conjunto", piezas: [...piezas.entries()].map(([nm, n]) => [nm, "", n]) }] };
  }
  const subs = new Map();
  for (const m of mallas) {
    const it = m.userData.it;
    if (m.userData.pieza !== pieza || !it.su) continue;
    if (!subs.has(it.su)) subs.set(it.su, new Map());
    const nombre = legible(m.userData.parte);
    const lista = subs.get(it.su);
    const clave = `${nombre}|${it.co ?? ""}`;
    lista.set(clave, (lista.get(clave) ?? 0) + 1);
  }
  return {
    nivel: despiece.pieza === pieza ? despiece.meta : 0,
    subs: [...subs.entries()].map(([id, piezas]) => ({ id, nombre: SUBCONJUNTOS[id]?.[0] ?? id, grupo: SUBCONJUNTOS[id]?.[1], lamina: SUBCONJUNTOS[id]?.[2], piezas: [...piezas.entries()].map(([k, n]) => [...k.split("|"), n]) })),
  };
}
function elegirSubconjunto(id) {
  seleccion.sub = seleccion.sub === id ? null : id;
  aspecto();
  pintarPanel();
}

// ───────────── Movimientos a mano (mantenimiento) y simular un solo conjunto ─────────────
// Cada uno va de 0 (como esta dibujado) a 1 (abierto) con un resorte suave.
const manual = { puertas: 0, cajon: 0, brazoHmi: 0, mordazas: 0 };
const manualMeta = { ...manual };
const MOVIMIENTOS = {
  resguardos: [["puertas", "Abrir las puertas", "Cerrar las puertas"]],
  arrastre: [["cajon", "Sacar el cajón de arrastre", "Meter el cajón"]],
  hmi: [["brazoHmi", "Girar el brazo del panel", "Volver el brazo"]],
  soldadura: [["mordazas", "Separar las placas (aire)", "Juntar las placas"]],
  armario: [["armario", "Abrir la puerta", "Cerrar la puerta"]],
};
const hayManual = () => Object.values(manual).some((v) => v > 0.001) || Object.values(manualMeta).some((v) => v > 0);
const _q2 = new THREE.Quaternion();
// giro alrededor de un eje vertical del modelo (z) por un punto (x, y); el espejo invierte el signo
function giroVertical([px, py], ang) {
  const c = T([px, py, 0]);
  _t1.makeTranslation(-c.x, 0, -c.z);
  _t2.makeTranslation(c.x, 0, c.z);
  return new THREE.Matrix4().copy(_t2).multiply(new THREE.Matrix4().makeRotationFromQuaternion(_q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -ang))).multiply(_t1);
}
function reglaManual(m) {
  const n = m.userData.parte;
  const c = m.userData.centro ?? [0, 0, 0];
  if (/^resguardos\.(puerta|perfil-puerta|bisagra|tirador|actuador)/.test(n)) {
    // cada puerta gira hacia fuera sobre su bisagra (x = ±189,4)
    const lado = Math.sign(c[0]) || 1;
    return () => giroVertical([lado * 189.4, 175.2], -lado * 1.75 * manual.puertas);
  }
  if (/^arrastre\.(guia-cajon|placa-frontal|pomo|maneta-excentrica|pomo-maneta|rodillo|rodillo-anillo|engranaje)/.test(n)) return () => new THREE.Matrix4().makeTranslation(0, 0, 70 * manual.cajon);
  if (/^hmi\.(brazo|rotula|brida|panel|pantalla|pulsador|tapon|aro-seta|seta|selector-llave)/.test(n)) return () => giroVertical([198, -46], -0.7 * manual.brazoHmi);
  return null;
}
const reposo = () => ({ u: 0, theta: 0, papel: 0, avance: 0, fCierre: 1 - manual.mordazas, baja: 0, agarre: 1, cuchilla: 0, estrella: 0, cinta: 0, reposo: true });
function moverManual(dt) {
  let mueve = false;
  for (const k of Object.keys(manual)) {
    const d = manualMeta[k] - manual[k];
    if (Math.abs(d) < 0.002) {
      if (manual[k] !== manualMeta[k]) (manual[k] = manualMeta[k]), (mueve = true);
      continue;
    }
    manual[k] = quieto3.matches ? manualMeta[k] : manual[k] + d * Math.min(1, dt * 3.5);
    mueve = true;
  }
  if (mueve && !sim.activa) aplicarAnim(hayManual() ? reposo() : null, hayManual());
  return mueve;
}
function movimientosDe(pieza) {
  const lista = (MOVIMIENTOS[pieza] ?? []).map(([k, abrir, cerrar]) => [k, (k === "armario" ? puerta.meta > 0 : manualMeta[k] > 0) ? cerrar : abrir]);
  if (animadas.some((a) => a.r && a.m.userData.pieza === pieza)) lista.push(["solo", sim.activa && sim.solo === pieza ? "Detener la simulación" : "Simular solo este conjunto"]);
  return lista;
}
function moverPieza(k) {
  if (k === "armario") abrirArmario();
  else if (k === "solo") simularSolo(seleccion.pieza);
  else {
    manualMeta[k] = manualMeta[k] > 0 ? 0 : 1;
    if (k === "puertas" && sinResguardos) acciones.resguardos();
  }
  pintarPanel();
  pedirCuadro();
}
function simularSolo(pieza) {
  if (sim.activa && sim.solo === pieza) {
    sim.solo = null;
    pararSim();
    aislar = false;
    aspecto();
    return;
  }
  sim.solo = pieza;
  aislar = true;
  if (!sim.activa) iniciarSim();
  else sim.pausa = false;
  aspecto();
  actualizarMandos();
}

const animadas = [];
function prepararAnim() {
  for (const m of [...mallas, ...instancias.filter((i) => i.userData.perno)]) {
    const r = reglaAnim(m);
    const manualDe = reglaManual(m);
    if (!r && !manualDe) continue;
    if (r && (r.sobre || r.oculto)) m.userData.sim = true;
    animadas.push({ m, r, manual: manualDe, base: m.matrix.clone() });
  }
}
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _t1 = new THREE.Matrix4();
const _t2 = new THREE.Matrix4();
function aplicarAnim(e, activa) {
  for (const a of animadas) {
    const { m } = a;
    if (!activa) {
      m.matrix.identity();
      m.visible = m.userData.visibleBase !== false;
      m.updateMatrixWorld(true);
      continue;
    }
    // "simular solo este conjunto": lo demas queda quieto
    const r = sim.activa && sim.solo && m.userData.pieza !== sim.solo ? null : a.r;
    if (!r) {
      m.matrix.identity();
      if (m.userData.sim) m.visible = m.userData.visibleBase !== false;
    } else if (r.rot) {
      const ang = r.f(e);
      const p = T(r.p);
      _q.setFromAxisAngle(T(r.rot).normalize(), ang);
      _t1.makeTranslation(-p.x, -p.y, -p.z);
      _t2.makeTranslation(p.x, p.y, p.z);
      m.matrix.copy(_t2).multiply(_m.makeRotationFromQuaternion(_q)).multiply(_t1);
    } else if (r.mov) {
      const [x, y, z] = r.mov(e);
      m.matrix.makeTranslation(x, z, y);
    } else if (r.escala) {
      // escala a lo largo de x (o de y del modelo) con un extremo fijo: resortes y fuelles
      const [mx, my, mz] = r.escala.mov(e);
      const a = T(r.escala.ancla);
      const k = r.escala.k(e);
      if (r.escala.eje === "y") {
        _t1.makeTranslation(0, 0, -a.z);
        _t2.makeTranslation(mx, mz, a.z + my);
        m.matrix.copy(_t2).multiply(_m.makeScale(1, 1, k)).multiply(_t1);
      } else {
        _t1.makeTranslation(-a.x, 0, 0);
        _t2.makeTranslation(a.x + mx, mz, my);
        m.matrix.copy(_t2).multiply(_m.makeScale(k, 1, 1)).multiply(_t1);
      }
    } else if (r.muelle) {
      // el muelle se estira entre el bloque fijo (x = ±58) y el porta-mordaza
      const ancla = 58 * r.muelle;
      const k = (20 + 3 * (1 - e.fCierre)) / 20;
      _t1.makeTranslation(-ancla, 0, 0);
      _t2.makeTranslation(ancla, 0, 0);
      m.matrix.copy(_t2).multiply(_m.makeScale(k, 1, 1)).multiply(_t1);
    } else if (r.sobre) {
      // fila colgando bajo la cuchilla: baja con el papel durante el arrastre, sigue a las pinzas
      // y al soltarla pasa a ser cuerpos con fisica
      const u = e.u;
      m.visible = m.userData.visibleBase !== false && (u >= FASES.arrastre[0] || u < FASES.suelta);
      const subida = u >= FASES.arrastre[0] && u <= FASES.arrastre[1] ? (1 - e.avance) * PASO_SOBRE : 0;
      m.matrix.makeTranslation(0, subida - BAJADA * e.baja, 0);
    } else if (r.oculto) m.visible = !!e.reposo && m.userData.visibleBase !== false;
    if (a.manual) m.matrix.premultiply(a.manual());
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
  // la banda arrastra imponiendo su velocidad (pasoFisica): su contacto no debe frenar. Con la masa
  // de un sobre (4 g) y la gravedad en unidades de 4 mm, cannon frena de mas aun con mu = 0,03.
  mundo.addContactMaterial(new CANNON.ContactMaterial(matSobre, matCinta, { friction: 0, restitution: 0.05 }));
  mundo.addContactMaterial(new CANNON.ContactMaterial(matSobre, matSobre, { friction: 0.4, restitution: 0.05 }));
  const estatico = (centroMundo, medio) => {
    const b = new CANNON.Body({ mass: 0, material: matCinta, shape: new CANNON.Box(new CANNON.Vec3(medio[0], medio[2], medio[1])) });
    const c = T(centroMundo);
    b.position.set(c.x, c.y, c.z);
    mundo.addBody(b);
  };
  // cinta bajo el corte hasta el costado (x -46..459, y 16..128, arriba en z 100), guias y largueros
  estatico([206.5, 72, 99], [252.5, 56, 1]);
  const [p0, p1] = [ESC.cotas.tira.y0, ESC.cotas.tira.y1];
  for (let i = 1; i < 6; i++) estatico([240, p0 + ((p1 - p0) / 6) * i, 104], [200, 0.6, 2]);
  estatico([207.5, 13, 96], [255.5, 3, 8]);
  estatico([207.5, 131, 96], [255.5, 3, 8]);
  // deslizadero de expulsion bajo las pinzas: rampa de (-16, z 112) a (16, z 101.5) con sus bordes
  {
    const ang = Math.atan2(-9.5, 28);
    // inox liso: los sobres resbalan hasta la banda (la goma de la banda si los arrastra)
    const matRampa = new CANNON.Material("rampa");
    mundo.addContactMaterial(new CANNON.ContactMaterial(matSobre, matRampa, { friction: 0, restitution: 0.02 }));
    const rampa = new CANNON.Body({ mass: 0, material: matRampa, shape: new CANNON.Box(new CANNON.Vec3(14.8, 0.5, 56)) });
    const c = T([-2, 72, 108.75]);
    rampa.position.set(c.x, c.y, c.z);
    rampa.quaternion.setFromEuler(0, 0, ang);
    mundo.addBody(rampa);
    for (const y of [14, 130]) estatico([0, y, 110], [16, 2, 6]);
  }
  const suelo = new CANNON.Body({ mass: 0, material: matCinta, shape: new CANNON.Plane() });
  suelo.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  mundo.addBody(suelo);
  mundo.matSobre = matSobre;
  const geo = new THREE.BoxGeometry(1.4, 28, 13.6);
  mallaSobres = new THREE.InstancedMesh(geo, MAT.papel, MAX_SOBRES);
  mallaSobres.count = 0;
  mallaSobres.castShadow = true;
  mallaSobres.frustumCulled = false;
  raiz.add(mallaSobres);
}
// Al soltar las pinzas, la fila pasa a ser cuerpos con fisica que caen al deslizadero.
function soltarSobres() {
  if (!mundo) return;
  for (const yc of ESC.carriles) {
    if (cuerpos.length >= MAX_SOBRES) {
      const viejo = cuerpos.shift();
      mundo.removeBody(viejo.b);
    }
    // sobre colgando: fino en x, ancho en y (carril), largo en z
    const b = new CANNON.Body({ mass: 0.004, material: mundo.matSobre, shape: new CANNON.Box(new CANNON.Vec3(0.7, 14, 6.8)), linearDamping: 0.05, angularDamping: 0.6 });
    const c = T([0, yc, 150 - BAJADA]);
    b.position.set(c.x, c.y, c.z);
    b.velocity.set((Math.random() - 0.5) * 3, -12, 0);
    b.angularVelocity.set(0, 0, -1.2 - Math.random() * 0.6);
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
    const sobreCinta = b.position.y < 104 && b.position.y > 96 && b.position.x > 13 && b.position.x < 459 && b.position.z > 16 && b.position.z < 128;
    if (sobreCinta) {
      b.velocity.x += (vCinta - b.velocity.x) * Math.min(1, dt * 12);
      b.velocity.z *= 1 - Math.min(1, dt * 4);
    }
    if (b.position.x > 194 && b.position.x < 210 && sobreCinta) sobreEnExpulsion = true;
    if (b.position.y < 3 || b.position.x > 470 || cuerpos[i].t > 30) {
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
    fCierre: Math.min(e.fCierre, 1 - manual.mordazas),
    baja: e.baja,
    agarre: e.agarre,
    cuchilla: e.cuchilla,
    estrella: (sim.ciclos + e.dosis) * (Math.PI / 3),
    cinta: (sim.ciclos + u) * 50,
  };
  aplicarAnim(ev, true);
  // Simulación térmica dinámica de las mordazas y placas soldantes (Calibrado p.20)
  if (MAT.caliente) {
    MAT.caliente.emissiveIntensity = 0.28 + 0.62 * ev.fCierre;
  }
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
  if (despiece.pieza) {
    despiece.meta = despiece.t = 0;
    despiece.pieza = null;
    aislar = false;
    aplicarAnim(null, false);
  }
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
  sim.solo = null;
  aplicarAnim(hayManual() ? reposo() : null, hayManual());
  limpiarFisica();
  if (MAT.caliente) MAT.caliente.emissiveIntensity = 0.35;
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
let sinResguardos = false;
let calor = false;
let aristasOn = true;
let hover = null; // { pieza, parte }
const ocultas = new Set(); // conjuntos apagados en el arbol

function aspecto() {
  for (const m of [...mallas, ...instancias]) {
    const { pieza, parte, base } = m.userData;
    // el boton de resguardos quita puertas, acrilicos y su marco; la caja con mirilla y los Euchner quedan
    const enMarco = /^resguardos\.(puerta|perfil|bisagra|tirador|lateral|techo|poste|travesano|larguero|actuador|panel)/.test(parte) || (/^resguardos\.(euchner|rfid|conector)/.test(parte) && Math.abs(m.userData.centro?.[0] ?? 0) > 150);
    const visible = !ocultas.has(pieza) && !(sinResguardos && enMarco);
    m.userData.visibleBase = visible;
    if (!sim.activa || !m.userData.sim) m.visible = visible;
    let mat = base;
    const sel = seleccion.pieza && pieza === seleccion.pieza;
    const esParte = (seleccion.parte && parte === seleccion.parte && (!seleccion.disp || m.userData.disp === seleccion.disp)) || (cableado.marcados.size && cableado.marcados.has(m.userData.disp)) || (seleccion.sub && m.userData.it?.su === seleccion.sub);
    if (porConjunto && base !== MAT.vidrio && base !== MAT.pantalla && pieza !== "film") mat = variante(base, `conj:${pieza}`);
    if (calor && base !== MAT.vidrio && pieza !== "film") mat = variante(base, `calor${nivelCalor(pieza) ?? 0}`);
    // en el despiece el conjunto se ve con sus materiales reales (lo demas queda en fantasma)
    const enDespiece = despiece.pieza === pieza && despiece.meta > 0;
    if (esParte) mat = variante(mat, "parte");
    else if (sel && !enDespiece) mat = variante(mat, "sel");
    else if (seleccion.pieza && aislar && !sel) mat = variante(base, "fantasma");
    else if (hover && hover.pieza === pieza && !seleccion.pieza) mat = variante(mat, "hover");
    if (m.material !== mat) m.material = mat;
    const ar = m.userData.aristas;
    if (ar) {
      ar.visible = aristasOn && !(seleccion.pieza && aislar && !sel);
      ar.material = (esParte || (sel && !seleccion.parte)) && !enDespiece ? ARISTA_SEL : ARISTA;
    }
  }
  pedirCuadro();
}

function pintarHud() {
  const hud = document.getElementById("g3Hud");
  if (!hud) return;
  if (!seleccion.pieza) {
    hud.hidden = true;
    return;
  }
  const p = D.piezas[seleccion.pieza];
  const uParte = seleccion.parte ? legible(seleccion.parte) : null;
  const s = seleccion.sensor ? D.sensores.find((x) => x.sigla === seleccion.sensor) : null;
  const dc = seleccion.disp ? (CAB.dispositivos[seleccion.disp] ?? CAB.modulos[seleccion.disp] ?? CAB.conectores[seleccion.disp]) : null;
  const colHex = COLOR_CONJUNTO[seleccion.pieza] ? `#${new THREE.Color(COLOR_CONJUNTO[seleccion.pieza]).getHexString()}` : "#1f6feb";

  hud.style.setProperty("--hud-conj-color", colHex);
  const badge = hud.querySelector("[data-hud-conjunto]");
  if (badge) badge.textContent = `${String(NUM[seleccion.pieza] || "").padStart(2, "0")} ${p?.nombre || seleccion.pieza}`;

  const chipCod = hud.querySelector("[data-hud-codigo]");
  const cod = s ? s.sigla : dc ? seleccion.disp : p?.codigos?.[0];
  if (chipCod) {
    if (cod) {
      chipCod.textContent = cod;
      chipCod.hidden = false;
    } else {
      chipCod.hidden = true;
    }
  }

  const tit = hud.querySelector("[data-hud-titulo]");
  if (tit) {
    tit.textContent = s ? `${s.sigla} · ${s.f}` : dc ? `${seleccion.disp} · ${dc.desc || dc.tipo || ""}` : (uParte || p?.nombre || seleccion.pieza);
  }

  const sub = hud.querySelector("[data-hud-sub]");
  if (sub) {
    const n = fallasPorPieza[seleccion.pieza] ?? 0;
    const txts = [];
    if (uParte && p) txts.push(p.corto || p.nombre);
    if (s) txts.push(`${s.marca} ${s.tipo} · hilo ${s.hilo}`);
    if (n) txts.push(`${n} ${n === 1 ? "intervención" : "intervenciones"}`);
    sub.textContent = txts.join(" · ") || p?.desc || "";
  }

  const aislarTxt = hud.querySelector("[data-hud-aislar-txt]");
  if (aislarTxt) {
    aislarTxt.textContent = aislar ? "Ver todo" : "Aislar";
  }

  hud.hidden = false;
}

function abrirPanelDatos() {
  const gm = document.querySelector(".gm");
  if (gm) {
    gm.classList.remove("is-sin-panel");
    if (document.fullscreenElement || gm.classList.contains("is-maximizada")) {
      gm.classList.add("has-panel-abierto");
    }
    redimensionar();
  }
  const pan = document.querySelector(".gm-panel");
  if (pan) {
    pan.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  actualizarMandos();
}

function togglePanel() {
  const gm = document.querySelector(".gm");
  if (!gm) return;
  const esFs = document.fullscreenElement || gm.classList.contains("is-maximizada");
  if (esFs) {
    gm.classList.toggle("has-panel-abierto");
  } else {
    gm.classList.toggle("is-sin-panel");
    redimensionar();
  }
  actualizarMandos();
}

function togglePantallaCompleta() {
  const tarjeta = document.querySelector(".gm-tarjeta");
  const gm = document.querySelector(".gm");
  if (!tarjeta) return;

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else if (tarjeta.requestFullscreen) {
    tarjeta.requestFullscreen().catch(() => {
      gm?.classList.toggle("is-maximizada");
      redimensionar();
      actualizarMandos();
    });
  } else {
    gm?.classList.toggle("is-maximizada");
    redimensionar();
    actualizarMandos();
  }
}

document.addEventListener("fullscreenchange", () => {
  actualizarMandos();
  redimensionar();
});

document.getElementById("g3Hud")?.addEventListener("click", (e) => {
  const b = e.target.closest("[data-hud-act]");
  if (!b) return;
  const act = b.dataset.hudAct;
  if (act === "cerrar") {
    seleccionar_(null);
  } else if (act === "enfocar") {
    enfocarSeleccion();
  } else if (act === "aislar") {
    aislar = !aislar;
    aspecto();
    actualizarMandos();
    pintarHud();
  } else if (act === "panel") {
    abrirPanelDatos();
  }
});

function seleccionar_(pieza, { sensor = null, pestana, parte = null, disp = null } = {}) {
  const cambia = pieza !== seleccion.pieza;
  seleccion.pieza = pieza;
  seleccion.sensor = sensor;
  seleccion.parte = parte;
  if (cambia) seleccion.sub = null;
  seleccion.disp = sensor ? null : disp;
  if (pestana) seleccion.pestana = pestana;
  else if (cambia) seleccion.pestana = sensor ? "sensores" : "resumen";
  pintarCables();
  $$(".gm-parte").forEach((b) => {
    const activo = b.dataset.pieza === pieza;
    b.setAttribute("aria-pressed", String(activo));
    b.classList.toggle("es-activo", activo);
  });
  if (typeof actualizarDockEstado === "function") actualizarDockEstado();
  marcarArbol();
  aspecto();
  pintarPanel();
  pintarBarraDespiece();
  pintarHud();
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

// ───────────── Cableado del esquema ES4220003 ─────────────
// Recorrido aproximado: del dispositivo a sus conectores, por la pared a la canaleta de la caja
// de transmision, por la bandeja al armario y, dentro, a la regleta y al modulo o accionamiento.
// Las puntas (dispositivo, conector, regleta, modulo) son las del esquema; el camino entre ellas
// es orientativo: el esquema no dibuja canaletas.
const CAB = D.cableado ?? { dispositivos: {}, modulos: {}, conectores: {} };
const cableado = { vista: false, grupo: new THREE.Group(), marcados: new Set() };
cableado.grupo.name = "cables";
raiz.add(cableado.grupo);
const COLOR_CABLE = { sensor: 0x1a7f37, motor: 0xd1491f, valvula: 0x0969da, seguridad: 0xbf8700 };
const matCable = new Map();
function materialCable(tipo, fuerte) {
  const clave = `${tipo}|${fuerte}`;
  // el cable seguido se ve a traves de la maquina (como rayos X); el resto, solo donde se ve
  if (!matCable.has(clave)) matCable.set(clave, new THREE.MeshBasicMaterial({ color: COLOR_CABLE[tipo] ?? 0x8250df, transparent: true, opacity: fuerte ? 0.95 : 0.55, depthTest: !fuerte, depthWrite: !fuerte, clippingPlanes: planosCorte }));
  return matCable.get(clave);
}
const tipoCable = (tag) => {
  const t = CAB.dispositivos[tag]?.tipo ?? "";
  if (/motor/.test(t)) return "motor";
  if (/valv|electrov/.test(t) || /^Y/.test(tag)) return "valvula";
  if (/^S08|seguridad/.test(tag + t)) return "seguridad";
  return "sensor";
};
// centro de un dispositivo en coordenadas del modelo, con la puerta y el desarme como esten
function centroModelo(tag) {
  const ms = mallas.filter((m) => m.userData.disp === tag || m.userData.sensor === tag);
  if (!ms.length) return null;
  const b = new THREE.Box3();
  for (const m of ms) b.expandByObject(m);
  const c = raiz.worldToLocal(b.getCenter(new THREE.Vector3()));
  return [c.x, c.z, c.y];
}
const enArmario = (tag) => mallas.some((m) => (m.userData.disp === tag || m.userData.sensor === tag) && (m.userData.it.o3 || m.userData.it.pu));
function rutaDe(tag) {
  const d = CAB.dispositivos[tag];
  const p0 = centroModelo(tag);
  if (!p0) return null;
  const pts = [p0];
  const vias = new Set([...(d?.conectores ?? []).map((c) => c.tag), ...(d?.ruta ?? []).filter((t) => /^X\d/.test(t) && !/^X0[0-9]$/.test(t))]);
  for (const c of vias) {
    const pc = centroModelo(c);
    if (pc) pts.push(pc);
  }
  if (!enArmario(tag)) {
    const [x, y, z] = pts[pts.length - 1];
    if (y > 180 && x > 150) pts.push([x, y, 300], [198, -46, 300], [198, -96, 301], [214, -104, 301], [214, -112, 292]);
    else if (x > 196 && y > -100) pts.push([x, y, 84], [204, y, 84], [204, -96, 84], [244, -96, 84], [244, -112, 84]);
    else {
      if (y > 0) pts.push([x, 3, z], [x, -10, z]);
      else if (y < -100) pts.push([x, y, 26], [x, -96, 26]);
      const xd = Math.max(-182, Math.min(182, x));
      pts.push([xd, -52, pts[pts.length - 1][2]], [xd, -52, 292], [182, -52, 292], [194, -52, 301], [194, -104, 301], [214, -104, 301], [214, -112, 292]);
    }
  }
  // dentro del armario, por la canaleta delante de la placa: regleta (X06, X01…) y modulo o accionamiento
  const DX = 232;
  const destinos = [...(d?.regletas ?? []).map((r) => r.r), d?.modulo?.tag].filter(Boolean);
  for (const t of destinos) {
    const pt = centroModelo(t);
    if (!pt) continue;
    const u = pts[pts.length - 1];
    pts.push([DX, u[1], u[2]], [DX, u[1], pt[2]], [DX, pt[1], pt[2]], pt);
  }
  // quitar puntos repetidos
  return pts.filter((p, i) => !i || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) > 0.5);
}
function tuboCable(pts, radio, mat) {
  const camino = new THREE.CurvePath();
  for (let i = 1; i < pts.length; i++) camino.add(new THREE.LineCurve3(T(pts[i - 1]), T(pts[i])));
  const geo = new THREE.TubeGeometry(camino, Math.max(8, pts.length * 6), radio, 6, false);
  const malla = new THREE.Mesh(geo, mat);
  malla.raycast = () => {};
  malla.renderOrder = mat.depthTest ? 2 : 20;
  return malla;
}
function pintarCables() {
  raiz.updateMatrixWorld(true);
  const g = cableado.grupo;
  for (const c of [...g.children]) {
    g.remove(c);
    c.geometry.dispose();
  }
  cableado.marcados.clear();
  if (!ESC || paso !== 0) return pedirCuadro();
  const elegido = seleccion.sensor ?? seleccion.disp;
  if (cableado.vista)
    for (const tag of Object.keys(CAB.dispositivos)) {
      if (tag === elegido) continue;
      const pts = rutaDe(tag);
      if (pts && pts.length > 1) g.add(tuboCable(pts, 0.45, materialCable(tipoCable(tag), false)));
    }
  if (elegido && CAB.dispositivos[elegido]) {
    const pts = rutaDe(elegido);
    if (pts && pts.length > 1) g.add(tuboCable(pts, 1.1, materialCable(tipoCable(elegido), true)));
    const d = CAB.dispositivos[elegido];
    for (const t of [d.modulo?.tag, ...d.regletas.map((r) => r.r), ...d.conectores.map((c) => c.tag)].filter(Boolean)) cableado.marcados.add(t);
  }
  // un modulo o conector elegido: los cables de lo que tiene conectado
  if (elegido && (CAB.modulos[elegido] || CAB.conectores[elegido] || /^A\d/.test(elegido))) {
    for (const [tag, d] of Object.entries(CAB.dispositivos)) {
      const usa = d.modulo?.tag === elegido || d.modulos.some((m) => m.tag === elegido) || d.conectores.some((c) => c.tag === elegido) || d.accion.startsWith(`${elegido} `);
      if (!usa) continue;
      const pts = rutaDe(tag);
      if (pts && pts.length > 1) g.add(tuboCable(pts, 0.8, materialCable(tipoCable(tag), true)));
      cableado.marcados.add(tag);
    }
  }
  pedirCuadro();
}
// Ir a un dispositivo por su sigla (desde el panel o la URL): lo elige, abre el armario si
// esta dentro y encuadra el recorrido de su cable.
function enfocarDispositivo(tag, { abrir = true } = {}) {
  const m = mallas.find((x) => x.userData.disp === tag || x.userData.sensor === tag);
  const s = D.sensores.find((x) => x.sigla === tag);
  if (paso !== 0) irAPaso(0, { seleccionar: false, inmediato: true });
  if (s) seleccionar_(s.pieza, { sensor: tag, pestana: "sensores", parte: m?.userData.parte ?? null });
  else seleccionar_(m?.userData.pieza ?? "armario", { parte: m?.userData.parte ?? null, disp: tag });
  const d = CAB.dispositivos[tag];
  const alArmario = enArmario(tag) || (d && [d.modulo?.tag, ...d.regletas.map((r) => r.r)].some((t) => t && enArmario(t)));
  if (abrir && alArmario && puerta.meta === 0) abrirArmario(true);
  setTimeout(() => {
    const pts = rutaDe(tag);
    const b = new THREE.Box3();
    if (pts) for (const p of pts) b.expandByPoint(raiz.localToWorld(T(p)));
    else if (m) b.setFromObject(m);
    // si el cable llega al armario se mira desde atras y arriba, donde se ven armario y caja
    if (!b.isEmpty()) encuadrar(b.expandByScalar(25), pts && alArmario ? [-0.42, 0.72, -0.56] : null);
    pintarCables();
  }, quieto3.matches ? 0 : 420);
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
  if (!h) {
    if (seleccion.pieza) seleccionar_(null);
    return;
  }
  mostrarReticula(h.point);
  const { pieza, parte, sensor, disp } = h.object.userData;
  if (sensor) return seleccionar_(pieza, { sensor, pestana: "sensores", parte });
  if (disp && (CAB.dispositivos[disp] || CAB.modulos[disp] || CAB.conectores[disp])) return seleccionar_(pieza, { parte, disp });

  if (seleccion.pieza === pieza && seleccion.parte === parte) {
    seleccionar_(null);
  } else {
    // Selección directa de la pieza y componente al primer toque
    seleccionar_(pieza, { parte, pestana: seleccion.pestana || "resumen" });
  }
});
lienzo.addEventListener("dblclick", (e) => {
  const h = tocadoEn(e);
  if (h) {
    const { pieza, parte } = h.object.userData;
    mostrarReticula(h.point);
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
  const dc = u.disp ? CAB.dispositivos[u.disp] ?? CAB.modulos[u.disp] ?? CAB.conectores[u.disp] : null;
  etiqueta.innerHTML = s
    ? `<b>${esc(s.sigla)}</b> · ${esc(s.f)}<small>${esc(s.marca)} ${esc(s.tipo)} · hilo ${esc(s.hilo)}</small>`
    : dc
    ? `<b>${esc(u.disp)}</b> · ${esc(dc.desc || dc.tipo || "")}<small>${esc(D.piezas[u.pieza]?.nombre ?? u.pieza)}${dc.modulo ? ` · ${esc(dc.modulo.tag)}` : ""}</small>`
    : `<b>${esc(D.piezas[u.pieza]?.nombre ?? u.pieza)}</b><small>${esc(parte)}${u.it?.co ? ` · <span class="gm-mono">${esc(u.it.co)}</span>` : ""}${u.disp ? ` · ${esc(u.disp)}` : ""}${n ? ` · ${n} intervenciones` : ""}</small>`;
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
  for (const m of [...Object.values(MAT), ARISTA, ARISTA_SEL, ...variantes.values(), ...matCable.values()]) m.needsUpdate = true;
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
  $("[data-accion=cables]")?.setAttribute("aria-pressed", String(cableado.vista));
  $("[data-accion=colores]")?.setAttribute("aria-pressed", String(porConjunto));
  $("[data-accion=armario]")?.setAttribute("aria-pressed", String(puerta.meta > 0));
  const bs = $("[data-accion=simular]");
  bs.setAttribute("aria-pressed", String(sim.activa && !sim.pausa));
  bs.querySelector(".gm-btn__txt").textContent = sim.activa && !sim.pausa ? "Pausa" : "Simular";
  $(".g3-seccion").hidden = !seccion.activa;
  $(".g3-medida").hidden = !medir.activo;
  const esFs = !!document.fullscreenElement || document.querySelector(".gm")?.classList.contains("is-maximizada");
  const btnFs = $("[data-accion=pantallaCompleta]");
  if (btnFs) {
    btnFs.setAttribute("aria-pressed", String(esFs));
    btnFs.title = esFs ? "Salir de pantalla completa (F / Esc)" : "Pantalla completa (F)";
  }
  const gm = document.querySelector(".gm");
  const panelOn = gm && (!gm.classList.contains("is-sin-panel") || gm.classList.contains("has-panel-abierto"));
  $("[data-accion=panel]")?.setAttribute("aria-pressed", String(panelOn));
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
    desp.x *= raiz.scale.x;
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
  enfocar: () => enfocarSeleccion(),
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
  colores: () => {
    porConjunto = !porConjunto;
    escena3.toggleAttribute("data-conjuntos", porConjunto);
    $$(".gm-parte").forEach((b) => b.style.setProperty("--conj", porConjunto ? `#${new THREE.Color(COLOR_CONJUNTO[b.dataset.pieza] ?? 0xb2bec3).getHexString()}` : ""));
    aspecto();
    actualizarMandos();
  },
  cables: () => {
    cableado.vista = !cableado.vista;
    if (cableado.vista && paso !== 0) irAPaso(0, { seleccionar: false });
    pintarCables();
    actualizarMandos();
  },
  armario: () => abrirArmario(),
  arbol: () => {
    const a = $(".g3-arbol");
    a.toggleAttribute("data-abierto");
    $("[data-accion=arbol]").setAttribute("aria-pressed", String(a.hasAttribute("data-abierto")));
  },
  pantallaCompleta: () => togglePantallaCompleta(),
  panel: () => togglePanel(),
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
  else if (k === "f" || k === "F") {
    if (seleccion.pieza) enfocarSeleccion();
    else togglePantallaCompleta();
  }
  else if (k === "Home" || k === "0") encuadrar(cajaVisible(), vistasFijas.iso);
  else if (k === " ") acciones.simular();
  else if (k === "d" || k === "D") acciones.desarmar();
  else if (k === "]") irAPaso(paso + 1);
  else if (k === "[") irAPaso(paso - 1);
  else if (k === "m" || k === "M") acciones.medir();
  else if ((k === "e" || k === "E") && seleccion.pieza) despiezar(despiece.pieza === seleccion.pieza && despiece.meta > 0 ? 0 : despieceCurado(seleccion.pieza) ? 2 : 2);
  else if (k === "Escape") {
    if (medir.activo) acciones.medir();
    else if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (document.querySelector(".gm")?.classList.contains("is-maximizada")) {
      document.querySelector(".gm")?.classList.remove("is-maximizada");
      redimensionar();
      actualizarMandos();
    } else if (seleccion.pieza) {
      seleccionar_(null);
    }
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
    if (moverPuerta(dt)) sigue = true;
    if (moverManual(dt)) sigue = true;
    if (moverDespiece(dt)) sigue = true;
    if (IDS.some((id) => resorte[id].pending)) sigue = true;
    colocarGrupos();
    if (sim.activa) {
      pasoSim(dt);
      sigue = true;
    }
  }
  if (reticulaMesh && reticulaMesh.visible) {
    animarReticula(t);
    sigue = true;
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
    if (Q.get("resguardos") === "0") acciones.resguardos();
    if (Q.get("calor") === "1") acciones.calor();
    if (Q.get("colores") === "1") acciones.colores();
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
    if (Q.get("armario") === "1") abrirArmario(true);
    if (Q.get("cables") === "1") acciones.cables();
    if (Q.has("disp")) enfocarDispositivo(Q.get("disp"), { abrir: Q.get("armario") !== "0" });
    pedirCuadro();
  })
  .catch((e) => {
    cargando.textContent = "No se pudo cargar la máquina 3D. Ábrela desde la app o un servidor.";
    console.error(e);
  });
historialEnVivo();

window.gemelo = { irAPaso, seleccionar: seleccionar_, despiezar, despiece, barraDespiece, moverPieza, simularSolo, manual, enfocarDispositivo, abrirArmario, rutaDe, avanzar: (seg) => { if (!sim.activa) iniciarSim(); for (let i = 0; i < seg * 60; i++) pasoSim(1 / 60); pedirCuadro(); return { ...sim, cuerpos: cuerpos.length, sobreCinta: cuerpos.filter(({ b }) => b.position.y < 106 && b.position.y > 96).length, enX: cuerpos.map(({ b }) => [b.position.x, b.position.y, b.position.z].map(Math.round).join(",")) }; }, fisica: () => ({ mundo, cuerpos }), render: () => { try { cuadro(performance.now()); return "ok " + JSON.stringify(renderer.info.render) + " cam " + camara.position.toArray().map(Math.round) + " obj " + controles.target.toArray().map(Math.round) + " mallas " + mallas.length + " visibles " + mallas.filter((m) => m.visible).length + " raiz " + raiz.children.length + " caja " + JSON.stringify(caja3) + " mat0 " + (mallas[0] && mallas[0].material.type) + " grupos " + Object.values(grupos).filter((g) => g.visible).length; } catch (e) { return "ERR " + e.message + " " + String(e.stack).slice(0, 300); } }, centrar: centrarEn, mirar: (pos, obj) => { animCam = null; camara.position.set(...pos); controles.target.set(...obj); controles.update(); pedirCuadro(); }, encuadrar: (v) => encuadrar(cajaVisible(), vistasFijas[v]), sim, iniciarSim, pararSim, estado: () => ({ paso, seleccion, sim: { ...sim }, mallas: mallas.length, tornillos: totalTornillos, camara: camara.position.toArray().map(Math.round), objetivo: controles.target.toArray().map(Math.round), puerta: puerta.ang }) };
