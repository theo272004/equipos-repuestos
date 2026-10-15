// Arma las dos paginas del gemelo con los datos, el CSS y el script:
//   gemelo-ms235.html         visor 3D (three.js): navegacion tipo CAD, simulacion, fisica
//   gemelo-ms235-lamina.html  lamina isometrica (Anatomy): ligera, 8 vistas fijas
//
//   node pagina.mjs                 -> salida/index.html y salida/lamina.html (vista previa)
//   node pagina.mjs --repo <ruta>   -> <repo>/gemelo-ms235*.html + <repo>/assets/gemelo/ms235/
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PIEZAS, DESARME, LECTURA } from "./piezas.mjs";
import { esMs235, piezaDeIntervencion } from "./clasificar.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARGS = process.argv.slice(2);
const REPO = ARGS.includes("--repo") ? ARGS[ARGS.indexOf("--repo") + 1] : null;
const REMOTO = "https://theo272004.github.io/equipos-repuestos/";
const THREE_VER = "0.160.0";

const lee = (...p) => readFileSync(join(HERE, ...p), "utf8");
const datos = JSON.parse(lee("salida", "datos-ms235.json"));
const meta = JSON.parse(lee("salida", "vistas", "vistas.json"));
const kitCss = lee("kit", "iso.css");

const PAG_3D = REPO ? "gemelo-ms235.html" : "index.html";
const PAG_LAMINA = REPO ? "gemelo-ms235-lamina.html" : "lamina.html";

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
  cableado: datos.cableado,
  fallas: datos.fallas,
  repuestos: datos.repuestos,
  tareas: datos.tareas,
  historial: datos.historial,
  catalogoPiezas: datos.catalogoPiezas || {},
  base: REPO ? "" : null,
  remoto: REMOTO,
  app: REPO ? "index.html" : `${REMOTO}index.html`,
  dirVistas: REPO ? "assets/gemelo/ms235/" : "vistas/",
  // GitHub Pages guarda 10 min en cache: cada construccion pide sus archivos con su marca.
  version: new Date().toISOString().replace(/\D/g, "").slice(0, 12),
};

const CLASIFICAR = `{ esMs235: ${esMs235.toString()}, piezaDeIntervencion: ${piezaDeIntervencion.toString()} }`;
const comun = lee("web", "comun.js").replace("__DATOS__", () => JSON.stringify(D).replace(/<\/script/gi, "<\\/script")).replace("__CLASIFICAR__", () => CLASIFICAR);

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
  tema: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  marcha: '<path d="M7 5v14l11-7Z"/>',
  simular: '<path d="M7 5v14l11-7Z"/>',
  detener: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
  aristas: '<path d="M4 7 12 3l8 4v10l-8 4-8-4Z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  orto: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 4v16"/>',
  medir: '<path d="M3 17 17 3l4 4L7 21Z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
  seccion: '<path d="M3 7 12 3l9 4-9 4Z"/><path d="M3 12l9 4 9-4" stroke-dasharray="2 2"/><path d="M3 17l9 4 9-4"/>',
  arbol: '<path d="M4 5h6M4 12h6M4 19h6M14 5h6M14 12h6M14 19h6"/>',
  colores: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.6"/><circle cx="12" cy="7.5" r="1.6"/><circle cx="16" cy="10" r="1.6"/><path d="M12 21c-1.5-2 0-4 2-4h2a4 4 0 0 0 4-4"/>',
  cables: '<path d="M4 20c0-6 4-6 4-11V4M12 20v-7c0-3 4-3 4-6V4M20 20c0-4-3-5-3-8"/><circle cx="8" cy="4" r="1.2"/><circle cx="16" cy="4" r="1.2"/>',
  armario: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M12 3v18M10 12h0M14 12h0"/>',
  pantallaCompleta: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  pantallaSalir: '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>',
  enfocar: '<circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  plano: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  almacen: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  callouts: '<circle cx="12" cy="9" r="6"/><path d="m12 15-3 6h6l-3-6Z"/><circle cx="12" cy="9" r="1.8"/>',
  sop: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
};
const btn = (accion, texto, { pri = false, mostrarTexto = false, titulo } = {}) =>
  `<button type="button" class="gm-btn${pri ? " gm-btn--pri" : ""}" data-accion="${accion}" aria-label="${titulo ?? texto}" title="${titulo ?? texto}"><svg viewBox="0 0 24 24" aria-hidden="true">${ico[accion]}</svg>${mostrarTexto ? `<span class="gm-btn__txt">${texto}</span>` : ""}</button>`;

const m = datos.maquina;
const fechaCorta = (f) => (f ? f.split("-").reverse().join("/") : "");
const cabecera = (otra, textoOtra) => `
<header class="gm-cab">
  <a class="gm-cab__volver" href="${D.app}?v=detail&amp;id=ms235" target="_top">← Ficha de la MS235</a>
  <div>
    <h1 class="gm-cab__titulo">Gemelo virtual · ${m.nombre}</h1>
    <div class="gm-cab__sub">${datos.ref} · ${m.area} · ${m.sede}</div>
  </div>
  <div class="gm-cab__fin">
    <a class="gm-chip" href="${otra}">${textoOtra}</a>
    <span class="gm-chip" title="Historial del chat de mantenimiento" data-chat-hasta>chat hasta ${fechaCorta(datos.mtto.hasta)}</span>
    ${btn("tema", "Cambiar tema claro u oscuro")}
  </div>
</header>`;
const leyenda = `
    <div class="gm-dock gm-leyenda" id="gmDock" aria-label="Conjuntos mecánicos de la máquina">
      <div class="gm-dock__cab">
        <div class="gm-dock__info">
          <svg class="gm-dock__icono" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <span class="gm-dock__tit">Conjuntos mecánicos</span>
          <span class="gm-dock__badge">16 según manual</span>
          <span class="gm-dock__actual" id="gmDockActual" hidden></span>
        </div>
        <div class="gm-dock__nav">
          <button type="button" class="gm-dock__nav-btn" data-dock-scroll="izq" title="Desplazar conjuntos hacia la izquierda" aria-label="Anterior conjunto">‹</button>
          <button type="button" class="gm-dock__nav-btn" data-dock-scroll="der" title="Desplazar conjuntos hacia la derecha" aria-label="Siguiente conjunto">›</button>
        </div>
        <div class="gm-dock__acciones">
          <button type="button" class="gm-dock__toggle" id="gmDockToggle" title="Minimizar / expandir dock de conjuntos" aria-expanded="true">
            <span class="gm-dock__toggle-txt">Ocultar</span>
            <svg class="gm-dock__chevron" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </div>
      <div class="gm-dock__cuerpo">
        <div class="gm-partes" id="gmPartesTrack"></div>
      </div>
    </div>`;
const panel = `
  <aside class="gm-panel" aria-label="Datos de la pieza">
    <div class="gm-panel__cab"></div>
    <div class="gm-panel__cuerpo"></div>
  </aside>`;
const visor = `
<div class="gm-visor" hidden role="dialog" aria-label="Lámina">
  <div class="gm-visor__img"><img alt=""></div>
  <div class="gm-visor__lado"></div>
  <button type="button" class="gm-btn gm-visor__cerrar" style="background:var(--gm-card)" aria-label="Cerrar">✕</button>
</div>
<div class="gm-oculto" aria-live="polite" data-vivo></div>`;
const leyCalor = `<div class="gm-calor-ley" aria-hidden="true">menos <i style="background:#fde8c9"></i><i style="background:#fbc98e"></i><i style="background:#f59a5b"></i><i style="background:#e8613a"></i> más intervenciones</div>`;

// ───────── Pagina 3D ─────────
const cuerpo3d = `${cabecera(PAG_LAMINA, "Ver como lámina")}
<main class="gm">
  <section class="gm-tarjeta" aria-label="Modelo 3D de la máquina">
    <div class="g3-barra" role="toolbar" aria-label="Herramientas">
      <div class="gm-grupo">${btn("arbol", "Árbol de piezas", { mostrarTexto: true })}</div>
      <div class="gm-grupo g3-vistas">${[["iso", "Iso"], ["frente", "Frente"], ["atras", "Atrás"], ["izquierda", "Izq."], ["derecha", "Der."], ["arriba", "Arriba"]].map(([k, t]) => `<button type="button" class="gm-btn" data-vista3="${k}" title="Vista ${t}">${t}</button>`).join("")}</div>
      <div class="gm-grupo">${btn("orto", "Proyección ortográfica")}${btn("aristas", "Aristas")}${btn("seccion", "Corte de sección")}${btn("medir", "Medir")}</div>
      <div class="gm-grupo">${btn("resguardos", "Resguardos y acrílicos")}${btn("calor", "Mapa de fallas")}${btn("aislar", "Aislar la pieza elegida")}${btn("colores", "Un color por conjunto")}</div>
      <div class="gm-grupo">${btn("callouts", "Llamadas", { mostrarTexto: true, titulo: "Llamadas y códigos de plano en 3D" })}${btn("sop", "Guía SOP", { mostrarTexto: true, titulo: "Procedimiento guiado de calibración y mantenimiento" })}</div>
      <div class="gm-grupo">${btn("cables", "Cableado", { mostrarTexto: true, titulo: "Ver el recorrido de los cables del esquema" })}${btn("armario", "Abrir el armario eléctrico")}</div>
      <span class="gm-sep"></span>
      <div class="gm-grupo">
        ${btn("panel", "Ficha técnica", { mostrarTexto: true, titulo: "Ver u ocultar panel de repuestos y datos" })}
        ${btn("pantallaCompleta", "Pantalla completa", { titulo: "Pantalla completa (F)" })}
      </div>
    </div>
    <div class="gm-escena g3-escena" tabindex="0" role="application" aria-label="MS235 en 3D. Clic izquierdo y arrastrar gira, clic derecho mueve, rueda acerca. Flechas giran, Mayúscula y flechas mueven, F enfoca la selección, espacio simula, D desarma, Escape quita la selección.">
      <canvas class="g3-lienzo" aria-hidden="true"></canvas>
      <div class="gm-cargando">Cargando la máquina en 3D…</div>
      <!-- Capa de llamadas del plano 3D (Callouts) -->
      <div class="g3-callouts" id="g3Callouts" aria-hidden="true"></div>
      <!-- Guía interactiva paso a paso de calibración y mantenimiento (SOP Wizard) -->
      <div class="g3-sop" id="g3Sop" hidden>
        <div class="g3-sop__cab">
          <div class="g3-sop__info">
            <span class="g3-sop__badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> SOP 3D</span>
            <h3 class="g3-sop__tit" data-sop-tit></h3>
            <span class="g3-sop__tavola" data-sop-tavola></span>
          </div>
          <div class="g3-sop__acciones-top">
            <select class="g3-sop__selector" data-sop-sel title="Cambiar procedimiento de calibración"></select>
            <button type="button" class="g3-sop__cerrar" data-sop-act="cerrar" title="Cerrar guía interactiva (Esc)">✕</button>
          </div>
        </div>
        <div class="g3-sop__pasos-track" data-sop-stepper></div>
        <div class="g3-sop__cuerpo">
          <div class="g3-sop__paso-header">
            <span class="g3-sop__num" data-sop-paso-num></span>
            <h4 class="g3-sop__paso-tit" data-sop-paso-tit></h4>
          </div>
          <p class="g3-sop__desc" data-sop-paso-desc></p>
          <div class="g3-sop__herramientas" data-sop-tools></div>
        </div>
        <div class="g3-sop__footer">
          <button type="button" class="g3-sop__btn" data-sop-act="ant">← Anterior</button>
          <div class="g3-sop__puntos" data-sop-puntos></div>
          <button type="button" class="g3-sop__btn g3-sop__btn--pri" data-sop-act="sig">Siguiente paso →</button>
        </div>
      </div>
      <!-- HUD de selección contextual directa -->
      <div class="g3-hud" id="g3Hud" hidden>
        <div class="g3-hud__top">
          <div class="g3-hud__info">
            <div class="g3-hud__etiquetas">
              <span class="g3-hud__badge" data-hud-conjunto></span>
              <span class="g3-hud__chip" data-hud-codigo hidden></span>
              <span class="g3-hud__chip g3-hud__chip--almacen" data-hud-almacen hidden></span>
              <span class="g3-hud__chip g3-hud__chip--tavola" data-hud-tavola hidden></span>
            </div>
            <h3 class="g3-hud__tit" data-hud-titulo></h3>
            <p class="g3-hud__sub" data-hud-sub></p>
          </div>
          <button type="button" class="g3-hud__cerrar" data-hud-act="cerrar" aria-label="Quitar selección" title="Quitar selección (Esc)">✕</button>
        </div>
        <div class="g3-hud__acts">
          <button type="button" class="g3-hud__btn" data-hud-act="enfocar" title="Centrar y enfocar en esta pieza (F)">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ico.enfocar}</svg><span>Enfocar</span>
          </button>
          <button type="button" class="g3-hud__btn" data-hud-act="aislar" title="Aislar esta pieza">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ico.aislar}</svg><span data-hud-aislar-txt>Aislar</span>
          </button>
          <button type="button" class="g3-hud__btn" data-hud-act="plano" data-hud-btn-plano hidden title="Abrir lámina del plano técnico S4220003">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ico.plano}</svg><span>Ver lámina</span>
          </button>
          <button type="button" class="g3-hud__btn" data-hud-act="almacen" data-hud-btn-almacen hidden title="Consultar stock en Almacén interno">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ico.almacen}</svg><span>Almacén ERP</span>
          </button>
          <button type="button" class="g3-hud__btn" data-hud-act="sop" data-hud-btn-sop hidden title="Iniciar procedimiento guiado de calibración (SOP)">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ico.sop}</svg><span>Guía SOP</span>
          </button>
          <button type="button" class="g3-hud__btn g3-hud__btn--pri" data-hud-act="panel" title="Ver ficha técnica, láminas y repuestos">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ico.panel}</svg><span>Ficha y despiece</span>
          </button>
        </div>
      </div>
      <div class="g3-arbol"><input type="search" placeholder="Buscar pieza…" aria-label="Buscar pieza"><ul class="g3-arbol__lista"></ul></div>
      <div class="g3-seccion" hidden>Corte en <button type="button" data-eje="x" aria-pressed="true">X</button><button type="button" data-eje="y" aria-pressed="false">Y</button><button type="button" data-eje="z" aria-pressed="false">Z</button><input type="range" min="0" max="100" value="50" data-rango-seccion aria-label="Posición del corte"><button type="button" data-invertir>Invertir</button></div>
      <div class="g3-medida" hidden></div>
      ${leyCalor}
      <span class="gm-esq gm-esq--pista" data-pista></span>
      <span class="gm-esq gm-esq--lec" data-lectura></span>
      <div class="gm-etiqueta" role="tooltip"></div>
      <div class="gm-mandos">
        <div class="gm-grupo g3-sim">${btn("simular", "Simular", { mostrarTexto: true, titulo: "Simular el ciclo de la máquina" })}${btn("detener", "Detener simulación")}<input type="range" min="0" max="359" value="0" data-rango-angulo aria-label="Ángulo de máquina"><span class="g3-angulo" data-angulo>  0°</span><select data-cpm aria-label="Velocidad">${[10, 20, 35, 50, 65, 75].map((v) => `<option value="${v}"${v === 50 ? " selected" : ""}>${v} c/min</option>`).join("")}</select><span class="g3-contador" data-contador></span></div>
        <div class="gm-grupo">${btn("desarmar", "Desarmar", { pri: true, mostrarTexto: true })}${btn("antes", "Paso anterior (armar)")}<span class="gm-paso" data-paso>0/0</span>${btn("despues", "Siguiente paso (desarmar)")}</div>
        <span class="gm-sep"></span>
        <div class="gm-grupo">${btn("menos", "Alejar")}${btn("encuadrar", "Encuadrar")}${btn("mas", "Acercar")}</div>
      </div>
    </div>
    <div class="g3-senales" hidden><canvas aria-label="Diagrama de fases y señales"></canvas><p>Ciclo simulado. Anclas reales: cierre de planchas a 30° (Calibrado p.20) y cuchilla rotativa de una vuelta por ciclo (p.23). Las pinzas van por leva (el esquema no les da válvula) y dejan la fila en el deslizadero de expulsión (S52.9) bajo los láser B52. Las demás ventanas son aproximadas; no son lecturas del PLC.</p></div>
    ${leyenda}
  </section>
  ${panel}
</main>${visor}`;

// ───────── Pagina lamina ─────────
const cuerpoLamina = `${cabecera(PAG_3D, "Ver en 3D")}
<main class="gm">
  <section class="gm-tarjeta" aria-label="Modelo de la máquina">
    <div class="gm-escena" tabindex="0" role="application" aria-label="MS235 en lámina isométrica. Flechas izquierda y derecha giran la máquina, arriba y abajo la desarman paso a paso, D la desarma toda, más y menos acercan, Escape quita la selección.">
      <svg class="gm-svg iso-svg" viewBox="0 0 ${D.W} ${D.H}" preserveAspectRatio="none" role="img" aria-label="Ensobradora Schmucker MS235 dibujada pieza por pieza."><g class="gm-camara"></g></svg>
      <div class="gm-cargando">Cargando la máquina…</div>
      <span class="gm-esq gm-esq--fig">Fig. MS235 · gemelo</span>
      <span class="gm-esq gm-esq--tit">Schmucker · S4220003</span>
      <div class="gm-brujula" aria-label="Vistas"></div>
      ${leyCalor}
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
    ${leyenda}
  </section>
  ${panel}
</main>${visor}`;

const pagina = ({ titulo, cuerpo, css, script, importmap = "" }) => `<!doctype html>
<html lang="es" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<meta name="description" content="Gemelo virtual de la ensobradora Schmucker MS235: la máquina pieza por pieza, con láminas del catálogo, sensores, repuestos e historial de mantenimiento.">
<style>${css}</style>
${importmap}
</head>
<body class="iso" data-theme="light">${cuerpo}
<script type="module">${script}</script>
</body>
</html>`;

const importmap = `<script type="importmap">${JSON.stringify({
  imports: {
    three: `https://cdn.jsdelivr.net/npm/three@${THREE_VER}/build/three.module.js`,
    "three/addons/": `https://cdn.jsdelivr.net/npm/three@${THREE_VER}/examples/jsm/`,
    "cannon-es": "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js",
  },
})}</script>`;
const imports3d = `import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ViewHelper } from "three/addons/helpers/ViewHelper.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
`;

const pag3d = pagina({
  titulo: "Gemelo MS235 3D",
  cuerpo: cuerpo3d,
  css: `${kitCss}\n${lee("web", "gemelo.css")}\n${lee("web", "visor3d.css")}`,
  script: `${imports3d}${comun}\n${lee("web", "visor3d.js")}`,
  importmap,
});
const pagLamina = pagina({
  titulo: "Gemelo MS235",
  cuerpo: cuerpoLamina,
  css: `${kitCss}\n${lee("web", "gemelo.css")}`,
  script: `${comun}\n${lee("web", "lamina.js")}`,
});

if (REPO) {
  const destino = join(REPO, "assets", "gemelo", "ms235");
  mkdirSync(destino, { recursive: true });
  for (const f of readdirSync(join(HERE, "salida", "vistas"))) if (/^vista-\d+\.svg$/.test(f)) copyFileSync(join(HERE, "salida", "vistas", f), join(destino, f));
  copyFileSync(join(HERE, "salida", "escena.json"), join(destino, "escena.json"));
  writeFileSync(join(REPO, PAG_3D), pag3d);
  writeFileSync(join(REPO, PAG_LAMINA), pagLamina);
  console.log("repo:", PAG_3D, `${(pag3d.length / 1024).toFixed(0)} KB ·`, PAG_LAMINA, `${(pagLamina.length / 1024).toFixed(0)} KB`);
} else {
  copyFileSync(join(HERE, "salida", "escena.json"), join(HERE, "salida", "vistas", "escena.json"));
  writeFileSync(join(HERE, "salida", PAG_3D), pag3d);
  writeFileSync(join(HERE, "salida", PAG_LAMINA), pagLamina);
  console.log("salida:", PAG_3D, `${(pag3d.length / 1024).toFixed(0)} KB ·`, PAG_LAMINA, `${(pagLamina.length / 1024).toFixed(0)} KB`);
}
