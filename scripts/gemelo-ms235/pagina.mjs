// Arma la pagina del gemelo con los datos, el CSS y el script.
//   node pagina.mjs                      -> salida/index.html (vista previa, datos y laminas desde GitHub Pages)
//   node pagina.mjs --repo <ruta>        -> <repo>/gemelo-ms235.html + <repo>/assets/gemelo/ms235/
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PIEZAS, DESARME, LECTURA } from "./piezas.mjs";
import { esMs235, piezaDeIntervencion } from "./clasificar.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARGS = process.argv.slice(2);
const REPO = ARGS.includes("--repo") ? ARGS[ARGS.indexOf("--repo") + 1] : null;
const REMOTO = "https://theo272004.github.io/equipos-repuestos/";

const datos = JSON.parse(readFileSync(join(HERE, "salida", "datos-ms235.json"), "utf8"));
const meta = JSON.parse(readFileSync(join(HERE, "salida", "vistas", "vistas.json"), "utf8"));
const kitCss = readFileSync(join(HERE, "kit", "iso.css"), "utf8");
const css = readFileSync(join(HERE, "web", "gemelo.css"), "utf8");
const js = readFileSync(join(HERE, "web", "gemelo.js"), "utf8");

const D = {
  W: meta.W,
  H: meta.H,
  vistas: meta.vistas.map(({ indice, az, V, EX, EY, EZ, armado, todo }) => ({ indice, az, V, EX, EY, EZ, armado, todo })),
  spring: meta.SPRING,
  desarme: DESARME,
  lectura: LECTURA,
  piezas: Object.fromEntries(Object.entries(PIEZAS).map(([id, p]) => [id, { nombre: p.nombre, corto: p.corto, codigos: p.codigos, desc: p.desc }])),
  sensoresDibujados: meta.sensores ?? [],
  ref: datos.ref,
  maquina: datos.maquina,
  mtto: datos.mtto,
  grupos: datos.grupos,
  sensores: datos.sensores,
  fallas: datos.fallas,
  repuestos: datos.repuestos,
  tareas: datos.tareas,
  historial: datos.historial,
  base: REPO ? "" : null,
  remoto: REMOTO,
  app: REPO ? "index.html" : `${REMOTO}index.html`,
  dirVistas: REPO ? "assets/gemelo/ms235/" : "vistas/",
  // GitHub Pages guarda 10 min en cache: cada construccion pide las vistas con su marca.
  version: new Date().toISOString().replace(/\D/g, "").slice(0, 12),
};

const CLASIFICAR = `{ esMs235: ${esMs235.toString()}, piezaDeIntervencion: ${piezaDeIntervencion.toString()} }`;
const script = js.replace("__DATOS__", () => JSON.stringify(D).replace(/<\/script/gi, "<\\/script")).replace("__CLASIFICAR__", () => CLASIFICAR);

const ico = {
  izq: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v5h5"/>',
  der: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/>',
  desarmar: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  antes: '<path d="m18 15-6-6-6 6"/>',
  despues: '<path d="m6 9 6 6 6-6"/>',
  mas: '<circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M21 21l-4.3-4.3"/>',
  menos: '<circle cx="11" cy="11" r="7"/><path d="M8 11h6M21 21l-4.3-4.3"/>',
  encuadrar: '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>',
  resguardos: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/>',
  calor: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .5 2 1.5 3 2.5 3 0-3-1-5 0-8Z"/>',
  aislar: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  marcha: '<path d="M7 5v14l11-7Z"/>',
  tema: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};
const btn = (accion, texto, { pri = false, mostrarTexto = false, titulo } = {}) =>
  `<button type="button" class="gm-btn${pri ? " gm-btn--pri" : ""}" data-accion="${accion}" aria-label="${titulo ?? texto}" title="${titulo ?? texto}"><svg viewBox="0 0 24 24" aria-hidden="true">${ico[accion]}</svg>${mostrarTexto ? `<span class="gm-btn__txt">${texto}</span>` : ""}</button>`;

const m = datos.maquina;
const fechaCorta = (f) => (f ? f.split("-").reverse().join("/") : "");
const body = `
<header class="gm-cab">
  <a class="gm-cab__volver" href="${D.app}?v=detail&amp;id=ms235" target="_top">← Ficha de la MS235</a>
  <div>
    <h1 class="gm-cab__titulo">Gemelo virtual · ${m.nombre}</h1>
    <div class="gm-cab__sub">${datos.ref} · ${m.area} · ${m.sede}</div>
  </div>
  <div class="gm-cab__fin">
    <span class="gm-chip" title="Historial del chat de mantenimiento" data-chat-hasta>chat hasta ${fechaCorta(datos.mtto.hasta)}</span>
    ${btn("tema", "Cambiar tema claro u oscuro")}
  </div>
</header>
<main class="gm">
  <section class="gm-tarjeta" aria-label="Modelo de la máquina">
    <div class="gm-escena" tabindex="0" role="application" aria-label="MS235 en tres dimensiones. Flechas izquierda y derecha giran la máquina, arriba y abajo la desarman paso a paso, D la desarma toda, más y menos acercan, Escape quita la selección.">
      <svg class="gm-svg iso-svg" viewBox="0 0 ${D.W} ${D.H}" preserveAspectRatio="none" role="img" aria-label="Ensobradora Schmucker MS235 dibujada pieza por pieza: bastidor y pared, caja de transmisión con motor y cadena, portabobinas y desbobinado detrás, guías de desviación, dosificación con tolva y válvula estrella, mordazas de soldadura, rodillos de arrastre, cuchillas, pinzas, cinta de salida, HMI y armario eléctrico."><g class="gm-camara"></g></svg>
      <div class="gm-cargando">Cargando la máquina…</div>
      <span class="gm-esq gm-esq--fig">Fig. MS235 · gemelo</span>
      <span class="gm-esq gm-esq--tit">Schmucker · S4220003</span>
      <div class="gm-brujula" aria-label="Vistas"></div>
      <div class="gm-calor-ley" aria-hidden="true">menos <i style="background:#fde8c9"></i><i style="background:#fbc98e"></i><i style="background:#f59a5b"></i><i style="background:#e8613a"></i> más intervenciones</div>
      <span class="gm-esq gm-esq--pista" data-pista></span>
      <span class="gm-esq gm-esq--lec" data-lectura></span>
      <div class="gm-etiqueta" role="tooltip"></div>
      <div class="gm-mandos">
        <div class="gm-grupo">${btn("izq", "Girar a la izquierda")}${btn("der", "Girar a la derecha")}</div>
        <div class="gm-grupo">${btn("marcha", "En marcha", { mostrarTexto: true, titulo: "Simular el ciclo de la máquina" })}</div>
        <div class="gm-grupo">${btn("desarmar", "Desarmar", { pri: true, mostrarTexto: true })}${btn("antes", "Paso anterior (armar)")}<span class="gm-paso" data-paso>0/0</span>${btn("despues", "Siguiente paso (desarmar)")}</div>
        <span class="gm-sep"></span>
        <div class="gm-grupo">${btn("resguardos", "Resguardos")}${btn("calor", "Mapa de fallas")}${btn("aislar", "Aislar la pieza elegida")}</div>
        <div class="gm-grupo">${btn("menos", "Alejar")}${btn("encuadrar", "Encuadrar")}${btn("mas", "Acercar")}</div>
      </div>
    </div>
    <div class="gm-leyenda">
      <div class="gm-leyenda__tit">Conjuntos <span style="text-transform:none;letter-spacing:0">· en el orden del papel · el número es de intervenciones en el chat</span></div>
      <div class="gm-partes"></div>
    </div>
  </section>
  <aside class="gm-panel" aria-label="Datos de la pieza">
    <div class="gm-panel__cab"></div>
    <div class="gm-panel__cuerpo"></div>
  </aside>
</main>
<div class="gm-visor" hidden role="dialog" aria-label="Lámina">
  <div class="gm-visor__img"><img alt=""></div>
  <div class="gm-visor__lado"></div>
  <button type="button" class="gm-btn gm-visor__cerrar" style="background:var(--gm-card)" aria-label="Cerrar">✕</button>
</div>
<div class="gm-oculto" aria-live="polite" data-vivo></div>`;

const page = `<!doctype html>
<html lang="es" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gemelo MS235</title>
<meta name="description" content="Gemelo virtual de la ensobradora Schmucker MS235: la máquina pieza por pieza, con láminas del catálogo, sensores, repuestos e historial de mantenimiento.">
<style>${kitCss}\n${css}</style>
</head>
<body class="iso" data-theme="light">${body}
<script type="module">${script}</script>
</body>
</html>`;

if (REPO) {
  const destino = join(REPO, "assets", "gemelo", "ms235");
  mkdirSync(destino, { recursive: true });
  for (const f of readdirSync(join(HERE, "salida", "vistas"))) if (/^vista-\d+\.svg$/.test(f)) copyFileSync(join(HERE, "salida", "vistas", f), join(destino, f));
  writeFileSync(join(REPO, "gemelo-ms235.html"), page);
  console.log("repo:", join(REPO, "gemelo-ms235.html"), `${(page.length / 1024).toFixed(0)} KB`);
} else {
  writeFileSync(join(HERE, "salida", "index.html"), page);
  console.log("salida/index.html", `${(page.length / 1024).toFixed(0)} KB`);
}
