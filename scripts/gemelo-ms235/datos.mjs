// Datos del gemelo de la MS235, sacados de la app equipos-repuestos:
// grupos del catalogo Schmucker S4220003 (laminas, piezas, procedimientos),
// sensores del esquema ES4220003, ficha de la maquina (repuestos, fallas,
// tareas) y el historial del chat de mantenimiento.
// Uso: node datos.mjs <ruta del repo equipos-repuestos>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { PIEZAS } from "./piezas.mjs";
import { piezaDeIntervencion, esMs235 } from "./clasificar.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = process.argv[2];
if (!REPO) throw new Error("falta la ruta del repo equipos-repuestos");

const js = (file) => readFileSync(join(REPO, "assets/js", file), "utf8");
const ventana = (file) => {
  const window = {};
  vm.runInNewContext(js(file), { window });
  return window;
};

const MEC = ventana("ms235-mecanico.js").MS235_MEC;
const SENSORES = ventana("ms235-sensores.js").MS235_SENSORES;
const MTTO = ventana("mtto-data.js").MTTO;

// initialMachines vive dentro de un script de la app que toca el DOM: se corta el arreglo y se evalua solo.
const fuente = js("machines-data.js");
const desde = fuente.indexOf("[", fuente.indexOf("const initialMachines"));
let hondo = 0;
let hasta = desde;
for (; hasta < fuente.length; hasta++) {
  if (fuente[hasta] === "[") hondo++;
  else if (fuente[hasta] === "]" && !--hondo) break;
}
const MAQUINA = vm.runInNewContext(`(${fuente.slice(desde, hasta + 1)})`).find((m) => m.id === "ms235");

const piezaDeCodigo = {};
for (const [id, p] of Object.entries(PIEZAS)) for (const cod of p.codigos) piezaDeCodigo[cod] ??= id;

// Sensores: por sigla primero, si no por zona del esquema.
const SENSOR_SIGLA = { "B18.3": "motor", "B25.8": "motor", "B29.6": "desbobinado", "B29.7": "desbobinado", "B30.10": "fotocelula", "B42.2": "dosificacion", "B42.5": "dosificacion", "B42.6": "dosificacion" };
const SENSOR_ZONA = {
  "Planchas soldantes": "soldadura",
  "Motor principal": "motor",
  "Bobina y desbobinado": "bobina",
  "Arrastre de papel": "fotocelula",
  "Portabobinas y centrado": "bobina",
  "Corte de papel": "corte",
  Dosificacion: "dosificacion",
  "Dosificacion (2.o cassette)": "dosificacion",
  "Cierre de planchas": "soldadura",
  "Temperatura de planchas": "soldadura",
  "Soldadura y dosis": "soldadura",
  "Expulsion / rechazo": "salida",
};
const sensores = SENSORES.map((s) => ({ ...s, pieza: SENSOR_SIGLA[s.sigla] ?? SENSOR_ZONA[s.zona] ?? "armario" }));

// Fallas diagnosticables de la ficha: una falla puede tocar varios conjuntos.
const FALLA_PIEZAS = [
  [/toma de sobres/i, ["pinzas"]],
  [/resistencias|el[eé]ctrico/i, ["armario", "soldadura"]],
  [/soldadura/i, ["soldadura"]],
  [/corte/i, ["corte"]],
  [/foto-centrado|fotoc/i, ["fotocelula", "arrastre"]],
  [/dosificaci/i, ["dosificacion"]],
  [/transporte/i, ["salida", "motor"]],
];
const fallas = MAQUINA.failureModes.map((f) => ({
  ...f,
  piezas: (FALLA_PIEZAS.find(([re]) => re.test(f.probableSystem)) ?? [null, ["bastidor"]])[1],
}));

// Repuestos de la ficha (30 unificados + lista 2 anos + armario QE1).
const REPUESTO_SISTEMA = {
  "Eléctrico / Soldadura": "armario",
  "Eléctrico / Control": "armario",
  "Motriz / Control": "armario",
  Sellado: "soldadura",
  "Banda transportadora": "salida",
  Foil: "film",
  Dosificación: "dosificacion",
  "Cadena / Lubricación": "motor",
  Transmisión: "motor",
  Corte: "corte",
  Soldadura: "soldadura",
  "Soldadura / Neumática": "soldadura",
  "Transmisión / Válvula": "dosificacion",
  Eléctrico: "armario",
  "Arrastre de papel": "arrastre",
  Transporte: "arrastre",
  "Alimentación de bobina": "bobina",
  "Eléctrico / Armario QE1": "armario",
  "Formado y foto-centrado": "bobina",
  "Eléctrico / Mandos y neumática": "armario",
};
const REPUESTO_NOMBRE = [
  [/euchner/i, "resguardos"],
  [/muesca/i, "fotocelula"],
  [/expulsi/i, "salida"],
  [/bobina|empalme|portabobina/i, "bobina"],
  [/nivel|carga m/i, "dosificacion"],
  [/limpia cuchilla|feltro/i, "corte"],
];
const repuestos = MAQUINA.spareParts.map((p) => {
  const porNombre = REPUESTO_NOMBRE.find(([re]) => re.test(`${p.name} ${p.reference ?? ""} ${p.function ?? ""}`));
  const pieza = (p.system.startsWith("Eléctrico / Sensores") || p.system === "Transporte") && porNombre ? porNombre[1] : REPUESTO_SISTEMA[p.system] ?? porNombre?.[1] ?? "armario";
  const codigo = (p.reference ?? "").match(/\b(7\d{8}|\d{7}|[A-Z0-9][A-Z0-9._]{6,})\b/)?.[1] ?? "";
  return { nombre: p.name, sistema: p.system, ref: p.reference ?? "", funcion: p.function ?? "", criticidad: p.criticality ?? "", codigo, pieza };
});

const TAREA_PIEZA = [
  [/cadena/i, "motor"],
  [/arrastre/i, "arrastre"],
  [/soldadura/i, "soldadura"],
  [/gu[ií]as/i, "guias"],
  [/fotoc/i, "fotocelula"],
  [/foil|alimentaci/i, "hmi"],
  [/neum[aá]tica \(S4A081/i, "pinzas"],
  [/S4A121/i, "pinzas"],
  [/corte|S4A19100720/i, "corte"],
  [/portabobina/i, "bobina"],
  [/transporte/i, "salida"],
  [/el[eé]ctrico/i, "armario"],
  [/dosificaci/i, "dosificacion"],
];
const tareas = MAQUINA.maintenanceTasks.map((t) => ({
  nombre: t.name,
  sistema: t.system,
  frecuencia: t.frequency,
  tipo: t.type,
  criterio: t.acceptance,
  pieza: (TAREA_PIEZA.find(([re]) => re.test(t.system)) ?? [null, "bastidor"])[1],
}));

// Historial del chat: la descripcion manda; si no dice nada, la clase de falla.
// La pagina usa la misma funcion para leer mtto-data.js en vivo.
const historial = MTTO.hist.registros
  .filter(esMs235)
  .map((r) => ({ id: r.id, f: r.f, hr: r.hr, t: r.t, s: r.s, fa: r.fa, ac: r.ac, de: r.de, min: r.min, ef: r.ef, frep: r.frep, tec: r.tec, pieza: piezaDeIntervencion(r) }));

const grupos = {};
for (const [cod, g] of Object.entries(MEC.grupos)) grupos[cod] = { n: g.n, d: g.d, fuente: g.fuente, hojas: g.hojas, piezas: g.piezas, proc: g.proc ?? [], pieza: piezaDeCodigo[cod] ?? null };

// Cableado del esquema ES4220003 (ver cableado-LEEME.md): lo que el panel y el trazado 3D necesitan.
const CAB = JSON.parse(readFileSync(join(HERE, "cableado-ms235.json"), "utf8"));
const cableado = {
  dispositivos: Object.fromEntries(
    CAB.dispositivos.map((d) => [
      d.tag,
      {
        tipo: d.tipo,
        desc: d.descripcion,
        hilos: d.hilos ?? [],
        regletas: (d.regleta_armario ?? []).map((r) => ({ r: r.regleta, b: (r.bornes ?? []).map((b) => [b.borne, b.potencial ?? ""]) })),
        modulo: d.modulo ? { tag: d.modulo.tag, tipo: d.modulo.tipo, canal: d.modulo.canal ?? "", byte: d.modulo.byte, bit: d.modulo.bit, pin: d.modulo.pin } : null,
        modulos: (d.modulos ?? []).map((m) => ({ tag: m.tag, canal: m.canal ?? "", byte: m.byte, bit: m.bit, funcion: m.funcion ?? "" })),
        accion: d.accionamiento ? `${d.accionamiento.tag} · ${d.accionamiento.detalle ?? ""}` : "",
        cable: d.cable ?? "",
        conectores: (d.conectores ?? []).map((c) => (typeof c === "string" ? { tag: c, desc: "" } : { tag: c.tag ?? c.conector ?? "", desc: c.descripcion ?? "" })).filter((c) => c.tag),
        pines: d.pines_dispositivo ?? "",
        ruta: d.ruta ?? [],
        paginas: d.paginas ?? [],
        hojas: d.hojas ?? [],
        material: (d.lista_materiales?.items ?? []).map((i) => [i.marca, i.tipo, i.codigo].filter(Boolean).join(" · ")),
        confianza: d.confianza ?? "",
        notas: d.notas ?? "",
      },
    ]),
  ),
  modulos: Object.fromEntries(Object.values(CAB.modulos_plc ?? {}).map((m) => [m.tag, { tipo: m.tipo, desc: m.descripcion ?? "" }])),
  conectores: Object.fromEntries((CAB.cajas ?? []).map((c) => [c.tag, { desc: c.descripcion ?? "", clase: c.clase ?? "", dispositivos: c.dispositivos ?? [], conecta: c.conecta_a ?? "" }])),
  avisos: CAB.avisos_verificacion ?? [],
  notas: CAB.notas ?? [],
};

// ───────────── Catálogo Maestro Unificado de Piezas ─────────────
// Cruza las láminas del catálogo S4220003, los repuestos de la máquina y el maestro de almacén (13.671 artículos)
const maestroRuta = join(REPO, "assets/data/maestro-almacen.json");
let maestroItems = [];
if (existsSync(maestroRuta)) {
  try {
    const mData = JSON.parse(readFileSync(maestroRuta, "utf8"));
    maestroItems = (mData.items || []).map((it) => ({
      cod: it[0],
      desc: it[1],
      um: it[2],
      normDesc: it[1].toUpperCase().replace(/[^A-Z0-9]/g, ""),
    }));
  } catch (err) {
    console.warn("No se pudo leer maestro-almacen.json:", err.message);
  }
}

const buscarEnMaestro = (codigo) => {
  if (!codigo || codigo.length < 3) return null;
  const c1 = codigo.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const c2 = c1.replace(/O/g, "0");
  const c3 = c1.replace(/0/g, "O");
  let match = maestroItems.find((it) => it.cod === c1 || it.cod === c2);
  if (!match && c1.length >= 4) {
    match = maestroItems.find(
      (it) => it.normDesc.includes(c1) || it.normDesc.includes(c2) || it.normDesc.includes(c3)
    );
  }
  return match;
};

const catalogoPiezas = {};
// 1. Indexar desde las hojas de despiece de MEC.grupos
for (const [gCod, g] of Object.entries(MEC.grupos || {})) {
  for (const h of g.hojas || []) {
    for (const p of h.p || []) {
      const match = buscarEnMaestro(p);
      catalogoPiezas[p] = {
        cod: p,
        tavola: h.tav || gCod,
        pg: h.pg,
        img: h.img,
        grupoCod: gCod,
        grupoNom: g.n,
        pieza: grupos[gCod]?.pieza || piezaDeCodigo[gCod] || "soldadura",
        interno: match ? match.cod : null,
        descAlmacen: match ? match.desc : null,
        um: match ? match.um : "UN",
        procs: (g.proc || []).map((pr) => ({ pg: pr.pg, t: pr.t, img: pr.img })),
      };
    }
  }
}

// 2. Indexar desde los repuestos de la ficha
for (const r of repuestos) {
  if (r.codigo) {
    const match = buscarEnMaestro(r.codigo);
    const anterior = catalogoPiezas[r.codigo] || {};
    catalogoPiezas[r.codigo] = {
      cod: r.codigo,
      nombre: r.nombre,
      ref: r.ref,
      funcion: r.funcion,
      criticidad: r.criticidad,
      pieza: r.pieza,
      tavola: anterior.tavola || null,
      pg: anterior.pg || null,
      img: anterior.img || null,
      grupoCod: anterior.grupoCod || null,
      grupoNom: anterior.grupoNom || null,
      interno: anterior.interno || (match ? match.cod : /^\d{9}$/.test(r.codigo) ? r.codigo : null),
      descAlmacen: anterior.descAlmacen || (match ? match.desc : null),
      um: anterior.um || (match ? match.um : "UN"),
      procs: anterior.procs || [],
    };
  }
}

// 3. Indexar desde los sensores y dispositivos eléctricos
for (const s of sensores) {
  const match = buscarEnMaestro(s.sigla) || (s.tipo ? buscarEnMaestro(s.tipo) : null);
  const anterior = catalogoPiezas[s.sigla] || {};
  catalogoPiezas[s.sigla] = {
    cod: s.sigla,
    nombre: `${s.marca || ""} ${s.tipo || ""} (${s.sigla})`.trim(),
    ref: `${s.sigla} · ${s.f}`,
    funcion: s.f,
    pieza: s.pieza,
    tavola: anterior.tavola || null,
    pg: anterior.pg || null,
    img: anterior.img || null,
    grupoCod: anterior.grupoCod || null,
    grupoNom: anterior.grupoNom || null,
    interno: anterior.interno || (match ? match.cod : null),
    descAlmacen: anterior.descAlmacen || (match ? match.desc : null),
    um: anterior.um || "UN",
    procs: anterior.procs || [],
  };
}

// 4. Indexar desde escena.json si existe
const escenaRuta = join(REPO, "assets/gemelo/ms235/escena.json");
if (existsSync(escenaRuta)) {
  try {
    const escData = JSON.parse(readFileSync(escenaRuta, "utf8"));
    for (const it of escData.items || []) {
      if (!it.co) continue;
      if (!catalogoPiezas[it.co]) {
        const match = buscarEnMaestro(it.co);
        catalogoPiezas[it.co] = {
          cod: it.co,
          nombre: it.n ? it.n.replace(/[#:].*$/, "") : it.co,
          pieza: it.p,
          subensamble: it.su || null,
          tavola: it.co.startsWith("S4") || it.co.startsWith("2M") || it.co.startsWith("007") ? it.co : null,
          interno: match ? match.cod : null,
          descAlmacen: match ? match.desc : null,
          um: match ? match.um : "UN",
          procs: [],
        };
      } else if (!catalogoPiezas[it.co].interno) {
        const match = buscarEnMaestro(it.co);
        if (match) {
          catalogoPiezas[it.co].interno = match.cod;
          catalogoPiezas[it.co].descAlmacen = match.desc;
          catalogoPiezas[it.co].um = match.um;
        }
      }
    }
  } catch (err) {
    console.warn("No se pudo indexar items de escena.json:", err.message);
  }
}

const datos = {
  generado: new Date().toISOString().slice(0, 16).replace("T", " "),
  ref: MEC.ref,
  maquina: {
    nombre: MAQUINA.name,
    modelo: MAQUINA.model,
    equipoCod: MAQUINA.equipoCod,
    causaCod: MAQUINA.causaCod,
    area: MAQUINA.area,
    sede: MAQUINA.location,
    criticidad: MAQUINA.criticality,
    tecnicos: MAQUINA.technicalData,
    resumen: MAQUINA.summarySpecs,
    documentos: MAQUINA.documents,
  },
  mtto: { desde: MTTO.desde, hasta: MTTO.hasta, generado: MTTO.generado },
  grupos,
  sensores,
  fallas,
  repuestos,
  tareas,
  historial,
  cableado,
  catalogoPiezas,
};
mkdirSync(join(HERE, "salida"), { recursive: true });
writeFileSync(join(HERE, "salida", "datos-ms235.json"), JSON.stringify(datos));
const cuenta = (lista) => Object.entries(lista.reduce((m, x) => ((m[x.pieza] = (m[x.pieza] ?? 0) + 1), m), {})).map(([k, v]) => `${k}:${v}`).join(" ");
console.log("grupos", Object.keys(grupos).length, "sin pieza:", Object.entries(grupos).filter(([, g]) => !g.pieza).map(([c]) => c).join(" ") || "ninguno");
console.log("catalogoPiezas indexadas:", Object.keys(catalogoPiezas).length, "con codigo interno empresa:", Object.values(catalogoPiezas).filter(p => p.interno).length);
console.log("sensores", sensores.length, cuenta(sensores));
console.log("repuestos", repuestos.length, cuenta(repuestos));
console.log("tareas", tareas.length, cuenta(tareas));
console.log("historial", historial.length, cuenta(historial));
console.log("cableado", Object.keys(cableado.dispositivos).length, "dispositivos,", Object.keys(cableado.modulos).length, "modulos,", Object.keys(cableado.conectores).length, "conectores");
