// Visor 3D de la NJP-3500 (three.js): navegación tipo CAD, selección por conjunto y por
// pieza, desarme por conjuntos, vista por dentro y las páginas del manual de cada conjunto.
//
// Mundo del modelo en mm: x a la derecha del operador, y hacia el operador, z arriba.
// En three.js: X = x, Y = z (arriba), Z = y (hacia la cámara de frente).
// Ese cambio de ejes invierte la mano de los triángulos: todos los materiales son de dos
// caras y las normales se calculan después, así la luz cae bien.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const T = (p) => new THREE.Vector3(p[0], p[2], p[1]);
const PARAM = new URLSearchParams(location.search);
// Dentro de la ficha de la app (iframe) no hace falta la cabecera
if (PARAM.has("embed") || window.self !== window.top) document.body.classList.add("nj-embed");

const lienzo = $(".nj-lienzo");
const escenaEl = $(".nj-escena");
const cargando = $(".nj-cargando");
const etiqueta = $(".nj-etiqueta");

// ───────────── Render, cámara, luces ─────────────
const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camara = new THREE.PerspectiveCamera(30, 1, 20, 40000);
const controles = new OrbitControls(camara, lienzo);
controles.enableDamping = true;
controles.dampingFactor = 0.12;
controles.screenSpacePanning = true;
controles.zoomToCursor = true;
controles.maxPolarAngle = Math.PI * 0.53;
controles.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
controles.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

const luzHemi = new THREE.HemisphereLight(0xffffff, 0x5b6573, 0.6);
scene.add(luzHemi);
const sol = new THREE.DirectionalLight(0xffffff, 2.0);
sol.position.set(1500, 3200, 2600);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -1800, right: 1800, top: 1800, bottom: -1800, near: 100, far: 9000 });
sol.shadow.bias = -0.0002;
sol.shadow.normalBias = 1.5;
scene.add(sol);
const contraluz = new THREE.DirectionalLight(0xdbeafe, 1.1);
contraluz.position.set(-2400, 2600, -2600);
scene.add(contraluz);
const relleno = new THREE.DirectionalLight(0xfff7ed, 0.7);
relleno.position.set(-2000, 1200, 2200);
scene.add(relleno);

const suelo = new THREE.Mesh(new THREE.PlaneGeometry(14000, 14000), new THREE.ShadowMaterial({ opacity: 0.22 }));
suelo.rotation.x = -Math.PI / 2;
suelo.receiveShadow = true;
scene.add(suelo);
const rejilla = new THREE.GridHelper(8000, 80, 0x9aa2ab, 0xc9cfd5);
rejilla.material.transparent = true;
rejilla.material.opacity = 0.35;
rejilla.position.y = 0.5;
scene.add(rejilla);
const raiz = new THREE.Group();
scene.add(raiz);

// Claro por defecto, como la app y la MS235; el botón del tema lo cambia.
function oscuro() {
  return document.documentElement.dataset.theme === "dark";
}
function tema3d() {
  const o = oscuro();
  scene.background = new THREE.Color(o ? 0x0f1318 : 0xeef2f6);
  rejilla.material.color = new THREE.Color(o ? 0x222b36 : 0xc9cfd5);
  suelo.material.opacity = o ? 0.4 : 0.22;
  luzHemi.intensity = o ? 0.45 : 0.6;
  pedir();
}

// ───────────── Materiales (de la foto y del manual) ─────────────
const M = (o) => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, ...o });
let texPlaca = null;
function texturaPlaca() {
  if (texPlaca) return texPlaca;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 112;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 112);
  g.addColorStop(0, "#e9ecef");
  g.addColorStop(1, "#c9ced3");
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 112);
  x.fillStyle = "#1f2937";
  x.font = "700 64px system-ui, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("NJP-3500", 256, 60);
  texPlaca = new THREE.CanvasTexture(c);
  texPlaca.colorSpace = THREE.SRGBColorSpace;
  return texPlaca;
}
// Pantalla del HMI: los mandos que muestra la foto del manual (p.30)
let texHmi = null;
function texturaHmi() {
  if (texHmi) return texHmi;
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 400;
  const x = c.getContext("2d");
  x.fillStyle = "#dfe7ef";
  x.fillRect(0, 0, 640, 400);
  x.fillStyle = "#1f4e8c";
  x.fillRect(0, 0, 640, 52);
  x.fillStyle = "#fff";
  x.font = "600 26px system-ui, sans-serif";
  x.textBaseline = "middle";
  x.fillText("NJP-3500", 18, 27);
  x.font = "20px system-ui, sans-serif";
  x.textAlign = "right";
  x.fillText("3500 cáps/min", 622, 27);
  x.textAlign = "center";
  const b = [["Marcha", "#1f9d55"], ["Tolva ↑", "#2f6fbf"], ["Abrir cáps.", "#2f6fbf"], ["Ventilador", "#2f6fbf"], ["Tolva ↓", "#2f6fbf"], ["Cerrar cáps.", "#2f6fbf"], ["Cargar cáps.", "#2f6fbf"], ["Parada", "#d0342c"]];
  b.forEach(([t, col], i) => {
    const cx = 30 + (i % 4) * 150;
    const cy = 90 + Math.floor(i / 4) * 140;
    x.fillStyle = col;
    x.beginPath();
    x.roundRect(cx, cy, 130, 110, 12);
    x.fill();
    x.fillStyle = "#fff";
    x.font = "600 22px system-ui, sans-serif";
    x.fillText(t, cx + 65, cy + 56);
  });
  texHmi = new THREE.CanvasTexture(c);
  texHmi.colorSpace = THREE.SRGBColorSpace;
  return texHmi;
}
const MAT = {
  carcasa: M({ color: 0x8a7460, metalness: 0.55, roughness: 0.36 }),
  zocalo: M({ color: 0x6f5d4c, metalness: 0.5, roughness: 0.45 }),
  galvanizado: M({ color: 0xaab2ba, metalness: 0.6, roughness: 0.45 }),
  inox: M({ color: 0xd9dee4, metalness: 0.85, roughness: 0.22 }),
  alu: M({ color: 0xe5e9ee, metalness: 0.7, roughness: 0.3 }),
  cromo: M({ color: 0xf3f6f9, metalness: 0.96, roughness: 0.08 }),
  pintado: M({ color: 0xeae9e6, metalness: 0.05, roughness: 0.6 }),
  vidrio: new THREE.MeshPhysicalMaterial({ color: 0xe3f1fb, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, clearcoat: 1, envMapIntensity: 1.2 }),
  negro: M({ color: 0x1c1e21, metalness: 0.15, roughness: 0.6 }),
  caucho: M({ color: 0x18191b, metalness: 0.05, roughness: 0.85 }),
  fundicion: M({ color: 0x4a525c, metalness: 0.45, roughness: 0.5 }),
  laton: M({ color: 0xd8b250, metalness: 0.85, roughness: 0.25 }),
  cobre: M({ color: 0xc8793f, metalness: 0.85, roughness: 0.28 }),
  ptfe: M({ color: 0xf6f5f0, metalness: 0, roughness: 0.45 }),
  motorSEW: M({ color: 0x3f8f8b, metalness: 0.3, roughness: 0.42 }),
  divisor: M({ color: 0x51606f, metalness: 0.35, roughness: 0.45 }),
  manguera: new THREE.MeshStandardMaterial({ color: 0xcfe3ee, metalness: 0, roughness: 0.3, transparent: true, opacity: 0.78, side: THREE.DoubleSide }),
  cadena: M({ color: 0x2b2f35, metalness: 0.7, roughness: 0.4 }),
  sensor: M({ color: 0xd6b25c, metalness: 0.82, roughness: 0.22 }),
  pantalla: M({ color: 0x0b1220, metalness: 0.2, roughness: 0.15, emissive: 0x2a6fd6, emissiveIntensity: 0.45 }),
  seta: M({ color: 0xd9262a, metalness: 0.05, roughness: 0.35 }),
  amarillo: M({ color: 0xf2c200, metalness: 0.05, roughness: 0.45 }),
  verde: M({ color: 0x16a34a, metalness: 0.05, roughness: 0.4 }),
  blanco: M({ color: 0xf2f3f0, metalness: 0.05, roughness: 0.45 }),
  luzRoja: M({ color: 0xc62828, roughness: 0.3, emissive: 0x6a0d0d, emissiveIntensity: 0.5 }),
  luzAmbar: M({ color: 0xef8f00, roughness: 0.3, emissive: 0x6a3a00, emissiveIntensity: 0.5 }),
  luzVerde: M({ color: 0x2fbf4a, roughness: 0.3, emissive: 0x2fd65a, emissiveIntensity: 1.0 }),
  placa: null,
};
const PERNO = M({ color: 0x9aa2ab, metalness: 0.85, roughness: 0.25 });
const ARISTA = new THREE.LineBasicMaterial({ color: 0x1f2328, transparent: true, opacity: 0.28 });

// Variantes por estado, en caché: resaltado, elegido, fantasma
const variantes = new Map();
function variante(base, tipo) {
  const k = `${base.uuid}|${tipo}`;
  let m = variantes.get(k);
  if (m) return m;
  m = base.clone();
  if (base.map) m.map = base.map;
  if (tipo === "hover") Object.assign(m, { emissive: new THREE.Color(0x1f6feb), emissiveIntensity: 0.22 });
  else if (tipo === "sel") Object.assign(m, { emissive: new THREE.Color(0x1f6feb), emissiveIntensity: 0.3 });
  else if (tipo === "parte") Object.assign(m, { emissive: new THREE.Color(0x4f9bff), emissiveIntensity: 0.85 });
  else if (tipo === "fantasma") Object.assign(m, { transparent: true, opacity: 0.08, depthWrite: false });
  variantes.set(k, m);
  return m;
}

// ───────────── Geometría desde la escena ─────────────
function geoPrisma(sh) {
  const [o, a, u, v] = [sh.o, sh.a, sh.u, sh.v];
  const P = (s, [x, y]) => T([o[0] + a[0] * s + u[0] * x + v[0] * y, o[1] + a[1] * s + u[1] * x + v[1] * y, o[2] + a[2] * s + u[2] * x + v[2] * y]);
  const ring = sh.p;
  const n = ring.length;
  const bot = ring.map((q) => P(sh.s[0], q));
  const top = ring.map((q) => P(sh.s[1], q));
  const pos = [];
  const tri = (A, B, C) => pos.push(A.x, A.y, A.z, B.x, B.y, B.z, C.x, C.y, C.z);
  for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(ring.map((q) => new THREE.Vector2(q[0], q[1])), [])) {
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
  const seg = Math.max(16, Math.min(96, Math.round(12 + rmax * 0.35)));
  const bandas = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (a[1] < 1e-4 && b[1] < 1e-4) continue;
    if (Math.abs(a[0] - b[0]) < 1e-5 && Math.abs(a[1] - b[1]) < 1e-5) continue;
    const g = new THREE.LatheGeometry([new THREE.Vector2(a[1], a[0]), new THREE.Vector2(b[1], b[0])], seg);
    g.deleteAttribute("uv");
    bandas.push(g);
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
  const cerrado = pts[0].distanceTo(pts[pts.length - 1]) < 1e-3;
  if (cerrado) pts.pop();
  const curva = new THREE.CatmullRomCurve3(pts, cerrado, "centripetal");
  const r = sh.r[0] ?? 1;
  return new THREE.TubeGeometry(curva, Math.max(8, pts.length * 4), r, r > 10 ? 18 : 10, cerrado);
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
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, sh.rw ?? 1, 8, false);
}
function geoDe(sh) {
  if (sh.k === "P") return geoPrisma(sh);
  if (sh.k === "L") return geoTorno(sh);
  if (sh.k === "B") return new THREE.SphereGeometry(sh.r, 24, 16).translate(sh.o[0], sh.o[2], sh.o[1]);
  if (sh.k === "T") return geoTubo(sh);
  if (sh.k === "H") return geoHelice(sh);
  return null;
}
function soloPosicion(g) {
  const ng = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(ng.attributes)) if (k !== "position" && k !== "normal") ng.deleteAttribute(k);
  return ng;
}

// ───────────── Nombres legibles ─────────────
const ACENTOS = {
  balancin: "balancín", camara: "cámara", aspiracion: "aspiración", succion: "succión", guia: "guía", modulo: "módulo",
  elevacion: "elevación", fijacion: "fijación", pinon: "piñón", arbol: "árbol", rotula: "rótula", regulacion: "regulación",
  capsulas: "cápsulas", presion: "presión", ambar: "ámbar", mastil: "mástil", sinfin: "sinfín", zocalo: "zócalo", vacio: "vacío",
  esparrago: "espárrago", izq: "izquierda", der: "derecha", tapa: "tapa", seta: "seta", emergencia: "emergencia",
};
function legible(n) {
  const b = n.replace(/^[^.]+\./, "").replace(/[#:].*$/, "");
  const t = b.split("-").map((w) => ACENTOS[w] ?? w).join(" ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// ───────────── Construcción de la máquina ─────────────
let ESC = null;
const mallas = [];
const porConj = {};
const grupos = {};
let caja3 = new THREE.Box3();
let totalTornillos = 0;
// Un grupo por conjunto; las piezas que salen hacia otro lado (tapas y ventanas laterales)
// van en un subgrupo con su propio vector de desarme.
const grupoDe = (id, mv = null) => {
  if (!grupos[id]) {
    grupos[id] = new THREE.Group();
    grupos[id].name = id;
    raiz.add(grupos[id]);
  }
  if (!mv) return grupos[id];
  const k = mv.join(",");
  let g = grupos[id].children.find((c) => c.userData.mv?.join(",") === k);
  if (!g) {
    g = new THREE.Group();
    g.userData.mv = mv;
    grupos[id].add(g);
  }
  return g;
};
function construir(esc) {
  ESC = esc;
  MAT.placa = M({ map: texturaPlaca(), metalness: 0.4, roughness: 0.4 });
  for (const it of esc.items) {
    const geos = it.g.map(geoDe).filter(Boolean);
    if (!geos.length) continue;
    const geo = geos.length === 1 ? geos[0] : mergeGeometries(geos.map(soloPosicion), false);
    const base = MAT[it.ma] ?? MAT.inox;
    const malla = new THREE.Mesh(geo, base);
    const vidrio = base === MAT.vidrio;
    malla.castShadow = !vidrio;
    malla.receiveShadow = !vidrio;
    malla.userData = { it, base, conj: it.p, parte: it.n.replace(/[#:].*$/, "") };
    if (!vidrio && it.c !== "cadena" && it.c !== "manguera" && !/alojamientos|peines|punzones|puntas|tubo-capsulas|sinfin|resorte/.test(it.n)) {
      const ar = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), ARISTA);
      ar.raycast = () => {};
      malla.add(ar);
      malla.userData.aristas = ar;
    }
    // la placa del modelo y la pantalla: la textura solo en la cara de delante
    if (it.ma === "placa" || it.ma === "pantalla") {
      const b = new THREE.Box3().setFromBufferAttribute(geo.attributes.position);
      const s = b.getSize(new THREE.Vector3());
      const c = b.getCenter(new THREE.Vector3());
      malla.material = MAT.inox;
      malla.userData.base = MAT.inox;
      const tex = it.ma === "placa" ? MAT.placa : M({ map: texturaHmi(), roughness: 0.25, metalness: 0, emissive: 0xffffff, emissiveMap: texturaHmi(), emissiveIntensity: 0.35 });
      if (it.ma === "pantalla") (malla.material = MAT.negro), (malla.userData.base = MAT.negro);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(s.x * 0.98, s.y * 0.92), tex);
      pl.position.set(c.x, c.y, b.max.z + 0.3);
      pl.raycast = () => {};
      malla.add(pl);
    }
    grupoDe(it.p, it.mv).add(malla);
    mallas.push(malla);
    (porConj[it.p] ??= []).push(malla);
  }
  // Tornillería: cabezas hexagonales o de allen, instanciadas por conjunto
  const geoHex = new THREE.CylinderGeometry(1, 1, 0.7, 6);
  const geoAllen = new THREE.CylinderGeometry(0.85, 0.85, 0.8, 18);
  const arriba = new THREE.Vector3(0, 1, 0);
  const porClave = new Map();
  for (const pr of esc.pernos) {
    const k = `${pr.pieza}|${pr.tipo}|${pr.mv ?? ""}`;
    if (!porClave.has(k)) porClave.set(k, { pieza: pr.pieza, tipo: pr.tipo, mv: pr.mv, lista: [] });
    for (const p of pr.pts) porClave.get(k).lista.push({ p, n: pr.n, r: pr.r });
  }
  for (const g of porClave.values()) {
    const im = new THREE.InstancedMesh(g.tipo === "allen" ? geoAllen : geoHex, PERNO, g.lista.length);
    const m4 = new THREE.Matrix4();
    g.lista.forEach(({ p, n, r }, i) => {
      const nn = T(n).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(arriba, nn);
      m4.compose(T(p).addScaledVector(nn, 0.35 * r), q, new THREE.Vector3(r, r, r));
      im.setMatrixAt(i, m4);
    });
    im.receiveShadow = true;
    im.userData = { conj: g.pieza, base: PERNO, perno: true, n: g.lista.length };
    grupoDe(g.pieza, g.mv).add(im);
    (porConj[g.pieza] ??= []).push(im);
    totalTornillos += g.lista.length;
  }
  raiz.updateMatrixWorld(true);
  caja3 = new THREE.Box3();
  for (const m of mallas) caja3.expandByObject(m);
}

// ───────────── Cámara: vistas y encuadre ─────────────
const VISTAS = {
  iso: [0.72, 0.42, 1],
  frente: [0, 0.08, 1],
  derecha: [1, 0.08, 0.001],
  izquierda: [-1, 0.08, 0.001],
  atras: [0, 0.08, -1],
  arriba: [0.001, 1, 0.02],
};
let animCam = null;
let encuadreInicial = null; // si la página carga oculta (iframe sin tamaño), se encuadra al tomar tamaño
function encuadrar(caja = caja3, dir = null, inmediato = false) {
  if (caja.isEmpty()) return;
  const r0 = escenaEl.getBoundingClientRect();
  if (r0.width < 2 || r0.height < 2) {
    encuadreInicial = [caja, dir];
    return;
  }
  const c = caja.getCenter(new THREE.Vector3());
  const d = (dir ? new THREE.Vector3(...dir) : camara.position.clone().sub(controles.target)).normalize();
  const tapa = !panel.hidden && getComputedStyle(panel).position === "absolute" ? panel.offsetWidth : 0;
  const asp = Math.max(0.3, (r0.width - tapa) / r0.height);
  // Distancia justa: cada esquina de la caja debe caer dentro del cuadro (con un 8 % de aire)
  const arriba = Math.abs(d.y) > 0.95 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
  const der = new THREE.Vector3().crossVectors(arriba, d).normalize();
  const sube = new THREE.Vector3().crossVectors(d, der);
  const tanV = Math.tan((camara.fov * Math.PI) / 360) * 0.92;
  const tanH = tanV * asp;
  let dist = 0;
  for (const x of [caja.min.x, caja.max.x])
    for (const y of [caja.min.y, caja.max.y])
      for (const z of [caja.min.z, caja.max.z]) {
        const v = new THREE.Vector3(x, y, z).sub(c);
        dist = Math.max(dist, v.dot(d) + Math.abs(v.dot(der)) / tanH, v.dot(d) + Math.abs(v.dot(sube)) / tanV);
      }
  const destino = c.clone().addScaledVector(d, dist);
  if (inmediato) {
    camara.position.copy(destino);
    controles.target.copy(c);
    controles.update();
    pedir();
    return;
  }
  animCam = { t: 0, p0: camara.position.clone(), p1: destino, c0: controles.target.clone(), c1: c };
  pedir();
}
function moverCamara(dt) {
  if (!animCam) return false;
  animCam.t = Math.min(1, animCam.t + dt / 0.6);
  const s = animCam.t * animCam.t * (3 - 2 * animCam.t);
  camara.position.lerpVectors(animCam.p0, animCam.p1, s);
  controles.target.lerpVectors(animCam.c0, animCam.c1, s);
  if (animCam.t >= 1) animCam = null;
  return true;
}
function cajaDe(id) {
  const b = new THREE.Box3();
  for (const m of porConj[id] ?? []) if (m.visible) b.expandByObject(m);
  return b;
}

// ───────────── Desarme por conjuntos ─────────────
const resorte = {};
let paso = 0;
function irAPaso(n, inmediato = false) {
  paso = Math.max(0, Math.min(ESC.desarme.length - 1, n));
  ESC.desarme.forEach((id, i) => {
    const r = (resorte[id] ??= { x: 0, v: 0 });
    r.meta = i < paso ? 1 : 0;
    if (inmediato) (r.x = r.meta), (r.v = 0);
  });
  $("[data-paso]").textContent = `${paso}/${ESC.desarme.length - 1}`;
  $("[data-accion=desarmar] .nj-btn__txt").textContent = paso ? "Armar" : "Desarmar";
  if (paso) {
    const ultimo = ESC.desarme[paso - 1];
    if (!seleccion.conj) mostrarPista(`Fuera: ${ESC.piezas[ultimo].nombre}`);
  }
  pedir();
}
function moverResortes(dt) {
  let activo = false;
  const k = 90;
  const c = 2 * Math.sqrt(k) * 0.95;
  ESC.desarme.forEach((id) => {
    const r = resorte[id];
    if (!r) return;
    const a = k * (r.meta - r.x) - c * r.v;
    r.v += a * dt;
    r.x += r.v * dt;
    if (Math.abs(r.meta - r.x) < 1e-4 && Math.abs(r.v) < 1e-4) (r.x = r.meta), (r.v = 0);
    else activo = true;
    const g = grupos[id];
    if (!g) return;
    g.position.copy(T(ESC.piezas[id].mover).multiplyScalar(r.x));
    // los subgrupos con vector propio: se resta el del conjunto y se suma el suyo
    for (const c of g.children) if (c.userData.mv) c.position.copy(T(c.userData.mv).sub(T(ESC.piezas[id].mover)).multiplyScalar(r.x));
  });
  return activo;
}

// ───────────── Selección, resaltado, aislar, por dentro ─────────────
const seleccion = { conj: null, parte: null };
let hover = null;
let aislado = false;
let porDentro = PARAM.has("dentro");
let conAristas = true;
const CARCASA = new Set(["resguardos", "paneles"]);
// Con un mecanismo elegido, las puertas y tapas se vuelven transparentes para verlo
const FUERA = new Set(["resguardos", "paneles", "bastidor", "hmi"]);
const mecanismo = () => seleccion.conj && !FUERA.has(seleccion.conj);
const carcasaFantasma = (conj) => conj !== seleccion.conj && ((CARCASA.has(conj) && (porDentro || mecanismo())) || (conj === "hmi" && mecanismo()));
// Encuadre de un conjunto: desde el frente, un poco hacia su lado y desde arriba (las columnas no tapan)
// Se encuadra lo que el conjunto tiene sobre la mesa (las bielas de abajo agrandan la caja de más),
// salvo los conjuntos que están abajo.
function cajaVista(id) {
  const arriba = new THREE.Box3();
  for (const m of porConj[id] ?? []) if (!m.isInstancedMesh && m.userData.it.m[2] > ESC.cotas.mesa) arriba.expandByObject(m);
  return arriba.isEmpty() ? cajaDe(id) : arriba;
}
function dirConj(id) {
  const c = cajaVista(id).getCenter(new THREE.Vector3());
  return [Math.sign(c.x) * 0.12, c.y < ESC.cotas.mesa ? 0.25 : 0.55, 1];
}
const encuadrarConj = (id) => encuadrar(cajaVista(id).expandByScalar(60), dirConj(id));
function pintar() {
  for (const m of [...mallas, ...Object.values(porConj).flat().filter((x) => x.isInstancedMesh)]) {
    const u = m.userData;
    let mat = u.base;
    const fantasma = (aislado && seleccion.conj && u.conj !== seleccion.conj) || carcasaFantasma(u.conj);
    if (fantasma) mat = u.base === MAT.vidrio ? u.base : variante(u.base, "fantasma");
    else if (seleccion.parte && u.parte === seleccion.parte) mat = variante(u.base, "parte");
    else if (seleccion.conj && u.conj === seleccion.conj) mat = variante(u.base, "sel");
    else if (hover && u.conj === hover) mat = variante(u.base, "hover");
    m.material = mat;
    if (u.aristas) u.aristas.visible = conAristas && !fantasma;
    m.castShadow = !fantasma && u.base !== MAT.vidrio && !u.perno;
  }
  pedir();
}
// En pantallas angostas (la ficha de la app) la ficha de datos tapa la máquina:
// queda cerrada y se abre al elegir un conjunto.
const estrecho = () => document.querySelector(".nj-main").clientWidth < 860;
function verPanel(ver) {
  if (panel.hidden === !ver) return;
  panel.hidden = !ver;
  $("[data-accion=panel]").setAttribute("aria-pressed", String(ver));
  ajustar();
}
function elegir(conj, { parte = null, centrar = false } = {}) {
  if (estrecho()) verPanel(!!conj);
  seleccion.conj = conj;
  seleccion.parte = parte;
  $$(".nj-conj").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.conj === conj)));
  if (!conj) aislado = false;
  $("[data-accion=aislar]").setAttribute("aria-pressed", String(aislado));
  panelDe(conj);
  pintar();
  if (centrar && conj) encuadrarConj(conj);
  const url = new URL(location.href);
  if (conj) url.searchParams.set("pieza", conj);
  else url.searchParams.delete("pieza");
  history.replaceState(null, "", url);
}

// ───────────── Panel ─────────────
const panel = $(".nj-panel");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function panelDe(id) {
  const cab = $(".nj-panel__cab", panel);
  const cuerpo = $(".nj-panel__cuerpo", panel);
  if (!id) {
    const A = ESC.auditoria;
    cab.innerHTML = `<h2>${esc(ESC.maquina.nombre)}</h2><p>${esc(ESC.maquina.fabricante)} · ${ESC.items.length} piezas · ${totalTornillos} tornillos</p>`;
    cuerpo.innerHTML = `
      <h3>Datos del manual (p.24)</h3>
      <dl class="nj-datos">
        <dt>Producción</dt><dd>3.500 cápsulas/min</dd>
        <dt>Alojamientos</dt><dd>25 por segmento</dd>
        <dt>Cápsulas</dt><dd>000# a 5#</dd>
        <dt>Potencia</dt><dd>10,5 kW</dd>
        <dt>Peso</dt><dd>2.200 kg</dd>
        <dt>Medidas</dt><dd>1555 × 1165 × 2040 mm (manual) · cuerpo 1435 × 1248 × 1960 mm (ficha)</dd>
      </dl>
      <h3>Auditoría de montaje</h3>
      <div class="nj-auditoria">
        <span class="nj-chip nj-chip--ok">${A.flotantes} piezas flotantes</span>
        <span class="nj-chip nj-chip--ok">${A.sinAsiento} tornillos sin asiento</span>
        <span class="nj-chip nj-chip--ok">${A.choques} choques entre conjuntos</span>
      </div>
      <h3>Conjuntos</h3>
      <ul class="nj-lista">${ESC.lectura.map((c) => `<li><button type="button" data-ir="${c}"><span>${esc(ESC.piezas[c].nombre)}</span><small>${(porConj[c] ?? []).filter((m) => !m.isInstancedMesh).length}</small></button></li>`).join("")}</ul>
      <p class="nj-aviso">Modelo hecho con la foto de la máquina y el manual del fabricante. Fiel a los conjuntos, su posición y su función; las cotas internas son aproximadas. Lo que no está en el manual se dice en la ficha de cada conjunto.</p>`;
    return;
  }
  const P = ESC.piezas[id];
  const partes = new Map();
  for (const m of porConj[id] ?? []) if (!m.isInstancedMesh) partes.set(m.userData.parte, (partes.get(m.userData.parte) ?? 0) + 1);
  const tor = (porConj[id] ?? []).filter((m) => m.isInstancedMesh).reduce((a, m) => a + m.count, 0);
  cab.innerHTML = `<h2>${esc(P.nombre)}</h2><p>${esc(P.corto)}</p><button type="button" class="nj-panel__cerrar" data-accion-panel="cerrar" aria-label="Quitar la selección">✕</button>`;
  cuerpo.innerHTML = `
    <p class="nj-desc">${esc(P.desc)}</p>
    <div class="nj-acciones">
      <button type="button" class="nj-btn" data-accion-panel="enfocar">Enfocar</button>
      <button type="button" class="nj-btn" data-accion-panel="aislar">${aislado ? "Ver todo" : "Aislar"}</button>
    </div>
    <h3>Páginas del manual</h3>
    <div class="nj-paginas">${P.paginas.map((g, i) => `<button type="button" class="nj-pag" data-lamina="${i}"><img loading="lazy" src="${g.img}" alt="Manual NJP-3500, página ${g.p}"><span>p.${g.p} del PDF</span></button>`).join("")}</div>
    <h3>Piezas (${[...partes.values()].reduce((a, b) => a + b, 0)} · ${tor} tornillos)</h3>
    <ul class="nj-lista">${[...partes.entries()].map(([p, n]) => `<li><button type="button" data-parte="${esc(p)}" aria-pressed="${seleccion.parte === p}"><span>${esc(legible(p))}</span><small>${n > 1 ? `×${n}` : ""}</small></button></li>`).join("")}</ul>`;
}
panel.addEventListener("click", (e) => {
  const ir = e.target.closest("[data-ir]");
  if (ir) return elegir(ir.dataset.ir, { centrar: true });
  const pa = e.target.closest("[data-parte]");
  if (pa) {
    const p = pa.dataset.parte;
    elegir(seleccion.conj, { parte: seleccion.parte === p ? null : p });
    return;
  }
  const lam = e.target.closest("[data-lamina]");
  if (lam) return abrirLamina(seleccion.conj, Number(lam.dataset.lamina));
  const acc = e.target.closest("[data-accion-panel]")?.dataset.accionPanel;
  if (acc === "cerrar") elegir(null);
  if (acc === "enfocar") encuadrarConj(seleccion.conj);
  if (acc === "aislar") accion("aislar");
});

// ───────────── Láminas del manual ─────────────
const lamina = $(".nj-lamina");
let laminaActual = null;
function abrirLamina(conj, i) {
  const lista = ESC.piezas[conj].paginas;
  i = (i + lista.length) % lista.length;
  laminaActual = { conj, i };
  const g = lista[i];
  $("img", lamina).src = g.img;
  $("img", lamina).alt = `Manual NJP-3500, página ${g.p}`;
  $("[data-lam-tit]", lamina).textContent = `${ESC.piezas[conj].nombre} · página ${g.p} del manual (${i + 1}/${lista.length})`;
  $("[data-lam-pdf]", lamina).href = `${ESC.maquina.pdf}#page=${g.p}`;
  const es = $("[data-lam-es]", lamina);
  es.hidden = !g.es;
  if (g.es) es.href = g.es;
  lamina.hidden = false;
}
lamina.addEventListener("click", (e) => {
  const a = e.target.closest("[data-lam]")?.dataset.lam;
  if (a === "cerrar" || e.target === lamina) lamina.hidden = true;
  if (a === "ant") abrirLamina(laminaActual.conj, laminaActual.i - 1);
  if (a === "sig") abrirLamina(laminaActual.conj, laminaActual.i + 1);
});

// ───────────── Puntero ─────────────
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function tocado(e) {
  const r = lienzo.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camara);
  const visibles = mallas.filter((m) => {
    const u = m.userData;
    if (u.base === MAT.vidrio && !(seleccion.conj === "resguardos")) return false;
    if (carcasaFantasma(u.conj)) return false;
    if (aislado && seleccion.conj && u.conj !== seleccion.conj) return false;
    return true;
  });
  return ray.intersectObjects(visibles, false)[0]?.object ?? null;
}
let abajo = null;
lienzo.addEventListener("pointerdown", (e) => (abajo = { x: e.clientX, y: e.clientY }));
lienzo.addEventListener("pointermove", (e) => {
  if (e.buttons) {
    etiqueta.style.display = "none";
    return;
  }
  const m = tocado(e);
  const nuevo = m?.userData.conj ?? null;
  if (m) {
    const r = escenaEl.getBoundingClientRect();
    etiqueta.style.display = "block";
    etiqueta.style.left = `${e.clientX - r.left}px`;
    etiqueta.style.top = `${e.clientY - r.top}px`;
    etiqueta.innerHTML = `${esc(legible(m.userData.parte))}<small>${esc(ESC.piezas[nuevo].nombre)}</small>`;
  } else etiqueta.style.display = "none";
  lienzo.style.cursor = m ? "pointer" : "";
  if (nuevo !== hover) {
    hover = nuevo;
    pintar();
  }
});
lienzo.addEventListener("pointerleave", () => {
  etiqueta.style.display = "none";
  if (hover) (hover = null), pintar();
});
lienzo.addEventListener("pointerup", (e) => {
  if (!abajo || Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) > 4) return;
  const m = tocado(e);
  if (!m) return elegir(null);
  const c = m.userData.conj;
  if (seleccion.conj === c) elegir(c, { parte: seleccion.parte === m.userData.parte ? null : m.userData.parte });
  else elegir(c);
});
lienzo.addEventListener("dblclick", (e) => {
  const m = tocado(e);
  if (m) encuadrar(new THREE.Box3().setFromObject(m).expandByScalar(150));
});

// ───────────── Barra ─────────────
function accion(a) {
  if (a === "desarmar") irAPaso(paso ? 0 : ESC.desarme.length - 1);
  if (a === "antes") irAPaso(paso - 1);
  if (a === "despues") irAPaso(paso + 1);
  if (a === "encuadrar") encuadrar(paso ? caja3.clone().expandByScalar(600) : caja3);
  if (a === "dentro") {
    porDentro = !porDentro;
    $("[data-accion=dentro]").setAttribute("aria-pressed", String(porDentro));
    pintar();
  }
  if (a === "aristas") {
    conAristas = !conAristas;
    $("[data-accion=aristas]").setAttribute("aria-pressed", String(conAristas));
    pintar();
  }
  if (a === "aislar") {
    if (!seleccion.conj) return mostrarPista("Elige primero un conjunto");
    aislado = !aislado;
    $("[data-accion=aislar]").setAttribute("aria-pressed", String(aislado));
    panelDe(seleccion.conj);
    pintar();
  }
  if (a === "tema") {
    document.documentElement.dataset.theme = oscuro() ? "light" : "dark";
    tema3d();
  }
  if (a === "panel") verPanel(panel.hidden);
  if (a === "completa") {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-accion]");
  if (b) accion(b.dataset.accion);
  const v = e.target.closest("[data-vista]");
  if (v) encuadrar(paso ? caja3.clone().expandByScalar(600) : caja3, VISTAS[v.dataset.vista]);
  const c = e.target.closest(".nj-conj");
  if (c) elegir(seleccion.conj === c.dataset.conj ? null : c.dataset.conj, { centrar: seleccion.conj !== c.dataset.conj });
});
escenaEl.addEventListener("keydown", (e) => {
  if (e.key === "Escape") lamina.hidden ? elegir(null) : (lamina.hidden = true);
  else if (e.key === "f" || e.key === "F") seleccion.conj ? encuadrarConj(seleccion.conj) : accion("encuadrar");
  else if (e.key === "d" || e.key === "D") accion("desarmar");
  else if (e.key === "ArrowUp") accion("despues");
  else if (e.key === "ArrowDown") accion("antes");
  else return;
  e.preventDefault();
});
let pistaT = 0;
function mostrarPista(t) {
  const el = $(".nj-pista");
  el.textContent = t;
  clearTimeout(pistaT);
  pistaT = setTimeout(() => (el.textContent = ""), 2600);
}

// ───────────── Bucle ─────────────
let pendiente = false;
let ultimo = performance.now();
function pedir() {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(cuadro);
}
function cuadro(ahora) {
  pendiente = false;
  const dt = Math.min(0.05, (ahora - ultimo) / 1000);
  ultimo = ahora;
  const a = moverCamara(dt);
  const b = ESC ? moverResortes(dt) : false;
  const c = controles.update();
  renderer.render(scene, camara);
  if (a || b || c) pedir();
}
controles.addEventListener("change", pedir);
function ajustar() {
  const r = escenaEl.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return;
  renderer.setSize(r.width, r.height, false);
  // Con la ficha superpuesta (pantalla angosta) el centro de la vista se corre a la parte libre
  const tapa = !panel.hidden && getComputedStyle(panel).position === "absolute" ? panel.offsetWidth : 0;
  camara.aspect = (r.width + tapa) / r.height;
  if (tapa) camara.setViewOffset(r.width + tapa, r.height, tapa, 0, r.width, r.height);
  else camara.clearViewOffset();
  camara.updateProjectionMatrix();
  if (encuadreInicial) {
    const [caja, dir] = encuadreInicial;
    encuadreInicial = null;
    encuadrar(caja, dir, true);
  }
  pedir();
}
new ResizeObserver(ajustar).observe(escenaEl);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", tema3d);

// ───────────── Arranque ─────────────
fetch(`assets/gemelo/njp3500/escena.json?v=${VERSION}`)
  .then((r) => r.json())
  .then((datos) => {
    construir(datos);
    $(".nj-dock").innerHTML = datos.lectura.map((c) => `<button type="button" class="nj-conj" data-conj="${c}" aria-pressed="false"><b>${esc(datos.piezas[c].nombre)}</b><span>manual p.${datos.piezas[c].paginas.map((g) => g.p).join(", ")}</span></button>`).join("");
    tema3d();
    ajustar();
    encuadrar(caja3, VISTAS[PARAM.get("vista")] ?? VISTAS.iso, true);
    // ?cam=x,y,z,tx,ty,tz en mm del modelo (para capturas)
    const cam = PARAM.get("cam")?.split(",").map(Number);
    if (cam?.length === 6 && cam.every(Number.isFinite)) {
      camara.position.copy(T(cam.slice(0, 3)));
      controles.target.copy(T(cam.slice(3)));
      controles.update();
    }
    if (PARAM.get("panel") === "0" || estrecho()) verPanel(false);
    irAPaso(Number(PARAM.get("paso")) || 0, true);
    $("[data-accion=dentro]").setAttribute("aria-pressed", String(porDentro));
    const pz = PARAM.get("pieza");
    elegir(pz && datos.piezas[pz] ? pz : null, { centrar: !!pz });
    cargando.remove();
    document.body.dataset.listo = "1";
  })
  .catch((e) => {
    cargando.textContent = `No se pudo cargar el modelo: ${e.message}`;
    console.error(e);
  });

// Atajos de la ficha de la app: llegan por mensaje (no se recarga la máquina).
// { gemelo: "njp3500", query: "pieza=carga&dentro=1" }; query vacía vuelve a la vista inicial.
window.addEventListener("message", (e) => {
  if (e.origin !== location.origin || e.data?.gemelo !== "njp3500" || !ESC) return;
  const q = new URLSearchParams(e.data.query || "");
  porDentro = q.has("dentro");
  $("[data-accion=dentro]").setAttribute("aria-pressed", String(porDentro));
  aislado = false;
  irAPaso(Number(q.get("paso")) || 0);
  const pz = q.get("pieza");
  elegir(pz && ESC.piezas[pz] ? pz : null);
  if (pz && ESC.piezas[pz] && !q.get("vista")) encuadrarConj(pz);
  else encuadrar(pz && ESC.piezas[pz] ? cajaDe(pz) : paso ? caja3.clone().expandByScalar(600) : caja3, VISTAS[q.get("vista")] ?? VISTAS.iso);
});

// Para revisar desde la consola (capturas y pruebas)
window.njp = { THREE, scene, camara, controles, renderer, mallas, porConj, grupos, irAPaso, elegir, encuadrar, VISTAS, get caja() { return caja3; }, pedir };
