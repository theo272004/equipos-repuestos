// Datos del gemelo de la MS235, sacados de la app equipos-repuestos:
// grupos del catalogo Schmucker S4220003 (laminas, piezas, procedimientos),
// sensores del esquema ES4220003, ficha de la maquina (repuestos, fallas,
// tareas) y el historial del chat de mantenimiento.
// Uso: node datos.mjs <ruta del repo equipos-repuestos>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
};
mkdirSync(join(HERE, "salida"), { recursive: true });
writeFileSync(join(HERE, "salida", "datos-ms235.json"), JSON.stringify(datos));
const cuenta = (lista) => Object.entries(lista.reduce((m, x) => ((m[x.pieza] = (m[x.pieza] ?? 0) + 1), m), {})).map(([k, v]) => `${k}:${v}`).join(" ");
console.log("grupos", Object.keys(grupos).length, "sin pieza:", Object.entries(grupos).filter(([, g]) => !g.pieza).map(([c]) => c).join(" ") || "ninguno");
console.log("sensores", sensores.length, cuenta(sensores));
console.log("repuestos", repuestos.length, cuenta(repuestos));
console.log("tareas", tareas.length, cuenta(tareas));
console.log("historial", historial.length, cuenta(historial));
