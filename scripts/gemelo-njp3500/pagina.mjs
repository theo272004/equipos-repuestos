// Arma gemelo-njp3500.html (raíz del repo) con web/visor.css y web/visor.js.
// La escena la pide la página a assets/gemelo/njp3500/escena.json (node build.mjs).
//
//   node pagina.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const THREE_VER = "0.160.0";
const lee = (...p) => readFileSync(join(HERE, ...p), "utf8");
// GitHub Pages guarda 10 min en caché: cada construcción pide la escena con su marca.
const VERSION = new Date().toISOString().replace(/\D/g, "").slice(0, 12);

const ico = {
  desarmar: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  antes: '<path d="m18 15-6-6-6 6"/>',
  despues: '<path d="m6 9 6 6 6-6"/>',
  encuadrar: '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>',
  dentro: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  aristas: '<path d="M4 7 12 3l8 4v10l-8 4-8-4Z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  aislar: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  tema: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>',
  completa: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
};
const btn = (accion, texto, { conTexto = false, pri = false, pulsado } = {}) =>
  `<button type="button" class="nj-btn${pri ? " nj-btn--pri" : ""}" data-accion="${accion}" title="${texto}" aria-label="${texto}"${pulsado !== undefined ? ` aria-pressed="${pulsado}"` : ""}><svg viewBox="0 0 24 24" aria-hidden="true">${ico[accion]}</svg>${conTexto ? `<span class="nj-btn__txt">${texto}</span>` : ""}</button>`;
const vistas = [["iso", "Iso"], ["frente", "Frente"], ["derecha", "Derecha"], ["izquierda", "Izquierda"], ["atras", "Atrás"], ["arriba", "Arriba"]];

const html = `<!doctype html>
<html lang="es" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gemelo NJP-3500</title>
<meta name="description" content="Gemelo 3D de la encapsuladora NJP-3500: la máquina por conjuntos, con las páginas del manual del fabricante de cada uno.">
<style>${lee("web", "visor.css")}</style>
<script type="importmap">${JSON.stringify({ imports: { three: `https://cdn.jsdelivr.net/npm/three@${THREE_VER}/build/three.module.js`, "three/addons/": `https://cdn.jsdelivr.net/npm/three@${THREE_VER}/examples/jsm/` } })}</script>
</head>
<body>
<header class="nj-cab">
  <a class="nj-cab__volver" href="index.html?v=detail&amp;id=njp3500" target="_top">← Ficha de la NJP-3500</a>
  <div>
    <h1 class="nj-cab__tit">Gemelo 3D · Encapsuladora NJP-3500</h1>
    <div class="nj-cab__sub">Canaan Kaixinlong · Sede 4 · Encapsulado</div>
  </div>
  <div class="nj-cab__fin">
    <span class="nj-chip nj-chip--ok">0 piezas flotantes · 0 tornillos sin asiento</span>
    ${btn("tema", "Cambiar tema claro u oscuro")}
  </div>
</header>
<main class="nj-main">
  <section class="nj-escena" tabindex="0" role="application" aria-label="NJP-3500 en 3D. Arrastrar gira, clic derecho mueve, rueda acerca. Clic en una pieza elige su conjunto; F enfoca, D desarma, flechas arriba y abajo desarman paso a paso, Escape quita la selección.">
    <canvas class="nj-lienzo" aria-hidden="true"></canvas>
    <div class="nj-cargando">Cargando la NJP-3500…</div>
    <div class="nj-barra" role="toolbar" aria-label="Herramientas">
      <div class="nj-grupo">${vistas.map(([k, t]) => `<button type="button" class="nj-btn" data-vista="${k}">${t}</button>`).join("")}</div>
      <div class="nj-grupo">${btn("desarmar", "Desarmar", { conTexto: true, pri: true })}${btn("antes", "Paso anterior (armar)")}<span class="nj-paso" data-paso>0/0</span>${btn("despues", "Siguiente paso (desarmar)")}</div>
      <div class="nj-grupo">${btn("dentro", "Ver por dentro", { conTexto: true, pulsado: false })}${btn("aislar", "Aislar el conjunto", { pulsado: false })}${btn("aristas", "Aristas", { pulsado: true })}${btn("encuadrar", "Encuadrar")}${btn("completa", "Pantalla completa")}</div>
      <span class="nj-sep"></span>
      <div class="nj-grupo">${btn("panel", "Ficha", { conTexto: true, pulsado: true })}</div>
    </div>
    <div class="nj-etiqueta" role="tooltip"></div>
    <div class="nj-pista" aria-live="polite"></div>
    <nav class="nj-dock" aria-label="Conjuntos de la máquina"></nav>
  </section>
  <aside class="nj-panel" aria-label="Datos del conjunto">
    <div class="nj-panel__cab"></div>
    <div class="nj-panel__cuerpo"></div>
  </aside>
</main>
<div class="nj-lamina" hidden role="dialog" aria-label="Página del manual">
  <div class="nj-lamina__barra"><b data-lam-tit></b><button type="button" data-lam="ant">← Anterior</button><button type="button" data-lam="sig">Siguiente →</button><a data-lam-es target="_blank" rel="noopener">Guía en español</a><a data-lam-pdf target="_blank" rel="noopener">Abrir el PDF</a><button type="button" data-lam="cerrar">✕ Cerrar</button></div>
  <div class="nj-lamina__img"><img alt=""></div>
</div>
<script type="module">
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
const VERSION = "${VERSION}";
${lee("web", "visor.js")}
</script>
</body>
</html>
`;
writeFileSync(join(REPO, "gemelo-njp3500.html"), html);
console.log("gemelo-njp3500.html", (html.length / 1024).toFixed(0), "KB");
