// Comun a la lamina y al visor 3D: datos, historial en vivo, leyenda, panel y visor de laminas.
// La vista que lo usa define seleccionar_, centrarEn, mostrarSensor, pintarCalor, resaltarPieza y acciones.
const D = __DATOS__;
const NS = "http://www.w3.org/2000/svg";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const quieto = matchMedia("(prefers-reduced-motion: reduce)");

const panelCab = $(".gm-panel__cab");
const panelCuerpo = $(".gm-panel__cuerpo");
const IDS = Object.keys(D.piezas);
const PASOS = D.desarme.filter((id) => id !== "bastidor");
const NUM = Object.fromEntries(D.lectura.map((id, i) => [id, i + 1]));
const seleccion = { pieza: null, sensor: null, parte: null, disp: null, pestana: "resumen" };

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

// ───────────── Mapa de fallas ─────────────
function nivelCalor(pieza) {
  if (pieza === "film" || pieza === "resguardos") return null;
  const n = fallasPorPieza[pieza] ?? 0;
  const max = Math.max(1, ...Object.entries(fallasPorPieza).filter(([p]) => p !== "film").map(([, v]) => v));
  if (!n) return 0;
  return Math.max(1, Math.min(4, Math.ceil((n / max) * 4)));
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
$(".gm-partes").addEventListener("mouseover", (e) => resaltarPieza(e.target.closest(".gm-parte")?.dataset.pieza ?? null));
$(".gm-partes").addEventListener("mouseleave", () => resaltarPieza(null));

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
  if (seleccion.disp) return panelDispositivo(seleccion.disp);
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
    ${bloqueCableado(sigla)}
    <h3 class="gm-sec">Otros sensores del conjunto</h3><ul class="gm-lista">${sensoresDe(s.pieza).filter((x) => x.sigla !== sigla).map(filaSensor).join("")}</ul>`;
  panelCuerpo.scrollTop = 0;
}

// ───────────── Cableado (esquema ES4220003) ─────────────
const CABLES = D.cableado ?? { dispositivos: {}, modulos: {}, conectores: {}, avisos: [] };
const botonSigla = (t) => `<button type="button" class="gm-sigla" data-disp="${esc(t)}">${esc(t)}</button>`;
const direccion = (m) => (m && m.byte !== undefined && m.byte !== null ? `${m.byte}.${m.bit}` : "");
function bloqueCableado(tag) {
  const d = CABLES.dispositivos[tag];
  if (!d) return "";
  const avisos = (CABLES.avisos ?? []).filter((a) => JSON.stringify(a).includes(tag));
  const ruta = d.ruta.length ? d.ruta.map((t) => (t === "ARMARIO" ? '<span class="gm-chip">armario</span>' : botonSigla(t))).join(' <span class="gm-flecha">→</span> ') : "";
  const filas = [
    d.modulo ? ["Módulo", `${botonSigla(d.modulo.tag)} ${esc(d.modulo.tipo ?? "")}${d.modulo.canal ? ` · ${esc(d.modulo.canal)}` : ""}${direccion(d.modulo) ? ` · dirección <b class="gm-mono">${direccion(d.modulo)}</b>` : ""}`] : null,
    d.accion ? ["Accionamiento", esc(d.accion)] : null,
    d.regletas.length ? ["Bornes", d.regletas.map((r) => `${botonSigla(r.r)} ${r.b.map(([b, pot]) => `<span class="gm-mono">${esc(b)}</span>${pot ? ` (${esc(pot)})` : ""}`).join(", ")}`).join("<br>")] : null,
    d.hilos.length ? ["Hilos", `<span class="gm-mono">${d.hilos.map(esc).join(" · ")}</span>`] : null,
    d.cable ? ["Cable", esc(d.cable)] : null,
    d.conectores.length ? ["Conectores", d.conectores.map((c) => `${botonSigla(c.tag)}${c.desc ? ` ${esc(c.desc)}` : ""}`).join("<br>")] : null,
    d.pines ? ["Pines", `<span class="gm-mono">${esc(d.pines)}</span>`] : null,
    d.material.length ? ["Material", d.material.map((x) => esc(x)).join("<br>")] : null,
    d.paginas.length ? ["Esquema", `páginas ${d.paginas.join(", ")} · hojas ${d.hojas.map(esc).join(", ")}`] : null,
  ].filter(Boolean);
  return `<h3 class="gm-sec">Cableado</h3>
    ${ruta ? `<p class="gm-ruta">${ruta}</p>` : ""}
    <dl class="gm-datos">${filas.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
    ${d.notas ? `<p class="gm-nota">${esc(d.notas)}</p>` : ""}
    ${d.confianza && d.confianza !== "alta" ? `<p class="gm-nota"><span class="gm-chip" data-tono="warn">confianza ${esc(d.confianza)}</span> leído del esquema con dudas: verificar en la máquina.</p>` : ""}
    ${avisos.map((a) => `<p class="gm-nota"><span class="gm-chip" data-tono="warn">aviso</span> ${esc(typeof a === "string" ? a : a.texto ?? a.descripcion ?? JSON.stringify(a))}</p>`).join("")}
    ${typeof enfocarDispositivo === "function" ? `<p style="margin-top:8px"><button type="button" class="gm-btn" data-trazar="${esc(tag)}">Seguir el cable en 3D</button></p>` : ""}`;
}
function panelDispositivo(tag) {
  const d = CABLES.dispositivos[tag];
  const mod = CABLES.modulos[tag];
  const con = CABLES.conectores[tag];
  const pieza = seleccion.pieza ?? "armario";
  const titulo = d?.desc ?? mod?.desc ?? con?.desc ?? "";
  // lo que cuelga de un modulo, accionamiento o conector
  const conectados = Object.entries(CABLES.dispositivos).filter(([, x]) => x.modulo?.tag === tag || x.modulos.some((m) => m.tag === tag) || x.conectores.some((c) => c.tag === tag) || x.accion.startsWith(`${tag} `));
  panelCab.innerHTML = `
    <div class="gm-panel__migas"><button type="button" data-volver>MS235</button> › <button type="button" data-ir-pieza="${pieza}">${esc(D.piezas[pieza]?.nombre ?? pieza)}</button> › dispositivo</div>
    <h2 class="gm-panel__tit"><span class="gm-mono" style="font-size:16px">${esc(tag)}</span>${titulo ? ` · ${esc(titulo)}` : ""}</h2>
    <p class="gm-panel__sub">${esc(d?.tipo ?? mod?.tipo ?? con?.clase ?? "esquema eléctrico ES4220003")}</p>`;
  const orden = ([a, x], [b, y]) => (x.modulo?.byte ?? 0) - (y.modulo?.byte ?? 0) || (x.modulo?.bit ?? 0) - (y.modulo?.bit ?? 0) || a.localeCompare(b);
  panelCuerpo.innerHTML = `
    ${d ? bloqueCableado(tag) : ""}
    ${con?.conecta ? `<h3 class="gm-sec">Conecta</h3><p>${esc(con.conecta)}</p>` : ""}
    ${conectados.length ? `<h3 class="gm-sec">Conectado aquí · ${conectados.length}</h3><ul class="gm-lista">${conectados
      .sort(orden)
      .map(([t, x]) => `<li><button type="button" class="gm-fila gm-fila--boton" data-disp="${esc(t)}"><div class="gm-fila__cab"><span class="gm-fila__tit"><span class="gm-mono">${esc(t)}</span> · ${esc(x.desc)}</span><span class="gm-fila__meta gm-mono">${x.modulo?.tag === tag ? esc([direccion(x.modulo), x.modulo.canal].filter(Boolean).join(" · ")) : ""}</span></div></button></li>`)
      .join("")}</ul>${typeof enfocarDispositivo === "function" ? '<p class="gm-nota" style="margin-top:8px">En 3D se dibujan los cables de todo lo conectado.</p>' : ""}` : ""}
    ${!d && !conectados.length && !con ? '<p class="gm-nota" style="margin-top:8px">Componente del armario según la disposición B00 del esquema. Sin cableado de campo propio.</p>' : ""}`;
  panelCuerpo.scrollTop = 0;
}
function irADispositivo(tag) {
  if (typeof enfocarDispositivo === "function") return enfocarDispositivo(tag);
  const s = D.sensores.find((x) => x.sigla === tag);
  if (s) {
    seleccionar_(s.pieza, { sensor: tag, pestana: "sensores" });
    if (D.sensoresDibujados.includes(tag)) mostrarSensor(s);
    return;
  }
  seleccionar_(seleccion.pieza ?? "armario", { disp: tag });
}

// Clicks del panel
$(".gm-panel").addEventListener("click", (e) => {
  const t = e.target;
  const volver = t.closest("[data-volver]");
  if (volver) return seleccionar_(null);
  const tr = t.closest("[data-trazar]");
  if (tr) return enfocarDispositivo(tr.dataset.trazar);
  const di = t.closest("[data-disp]");
  if (di) return irADispositivo(di.dataset.disp);
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

