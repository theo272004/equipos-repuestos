#!/usr/bin/env node
// PUENTE MIPORTAL -> APP
// ======================
// Corre en un PC de la planta (el unico sitio desde donde se ve el portal), baja
// el Excel de inventario de MiPortal y sube las existencias a Firestore, que es
// de donde la app las lee. Ni la app ni GitHub Actions pueden hacer esto: la app
// va por HTTPS y el navegador le prohibe llamar a http://miportal:9010, y ademas
// el portal no expone CORS. Por eso el puente vive aqui dentro.
//
// Modos:
//   node bridge.mjs                     ciclo completo y automatico (el del cron)
//   node bridge.mjs --explorar          navegador visible: entras tu y bajas el reporte
//   node bridge.mjs --archivo x.xlsx    salta el portal y usa un Excel que ya tienes
//   node bridge.mjs --columnas          dice que columnas entendio y no sube nada
//   node bridge.mjs --dry-run           hace todo menos escribir en Firestore
//   node bridge.mjs --releer            compara leyendo el inventario entero de la nube
//                                       (normalmente solo lee lo cambiado desde la pasada anterior)
//
// Las credenciales van en .env, NUNCA en portal.config.json ni en el repo.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cargarPlan } from "./lib/plan.mjs";
import { leerInventario } from "./lib/excel.mjs";
import { Firestore } from "./lib/firestore.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "salida");

// ---------------------------------------------------------------- argumentos
const argv = process.argv.slice(2);
const tiene = (f) => argv.includes(f);
const valor = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };

const opts = {
  explorar: tiene("--explorar"),
  archivo: valor("--archivo"),
  columnas: tiene("--columnas"),
  dryRun: tiene("--dry-run") || tiene("--seco"),
  ayuda: tiene("--help") || tiene("-h"),
};

if (opts.ayuda) {
  console.log(await readFile(join(AQUI, "README.md"), "utf8").catch(() => "Lee scripts/portal-bridge/README.md"));
  process.exit(0);
}

// ---------------------------------------------------------- config y secretos
// .env a mano para no depender de nada: Node 20 solo lee --env-file en versiones
// recientes y este script tiene que arrancar igual en el PC que haya en planta.
async function cargarEnv() {
  const ruta = join(AQUI, ".env");
  if (!existsSync(ruta)) return;
  for (const linea of (await readFile(ruta, "utf8")).split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(linea);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

async function cargarConfig() {
  const ruta = join(AQUI, "portal.config.json");
  if (!existsSync(ruta)) {
    throw new Error(
      `No existe ${ruta}.\n` +
      `Copia portal.config.example.json a portal.config.json y ponle las URL de tu portal.`
    );
  }
  const cfg = JSON.parse(await readFile(ruta, "utf8"));
  cfg.portal = cfg.portal || {};
  cfg.portal.usuario = process.env.PORTAL_USUARIO || "";
  cfg.portal.clave = process.env.PORTAL_CLAVE || "";
  cfg.firebase = cfg.firebase || {};
  cfg.firebase.projectId = process.env.FIREBASE_PROJECT_ID || cfg.firebase.projectId || "mantenimiento-f405b";
  cfg.firebase.apiKey = process.env.FIREBASE_API_KEY || cfg.firebase.apiKey || "";
  return cfg;
}

// ------------------------------------------------------------------ el Excel
async function conseguirExcel(cfg) {
  if (opts.archivo) {
    const ruta = resolve(process.cwd(), opts.archivo);
    if (!existsSync(ruta)) throw new Error(`No encuentro el archivo ${ruta}`);
    console.log(`1. Excel: ${ruta} (me lo diste tu, no toco el portal)`);
    return ruta;
  }

  // Import perezoso: si solo vas a usar --archivo, no necesitas Playwright
  // instalado y el script tiene que funcionar igual.
  const { abrirNavegador, login, descargarReporte, explorar, evidencia } = await import("./lib/portal.mjs").catch((e) => {
    throw new Error(
      `Para hablar con el portal falta Playwright (${e.message}).\n` +
      `Instalalo con:  npm install && npx playwright install chromium\n` +
      `O salta el portal bajando el Excel a mano y usando:  node bridge.mjs --archivo reporte.xlsx`
    );
  });

  const { navegador, contexto } = await abrirNavegador({ visible: opts.explorar, descargas: cfg.portal });
  try {
    let descarga;
    if (opts.explorar) {
      console.log("1. Portal en modo explorar");
      ({ descarga } = await explorar(contexto, cfg.portal, SALIDA));
    } else {
      console.log("1. Portal");
      const pagina = await contexto.newPage();
      try {
        await login(pagina, cfg.portal, SALIDA);
        descarga = await descargarReporte(pagina, cfg.portal, SALIDA);
      } catch (e) {
        await evidencia(pagina, SALIDA, "error").catch(() => {});
        throw e;
      }
    }
    const destino = join(SALIDA, `inventario-${new Date().toISOString().slice(0, 10)}.xlsx`);
    await descarga.saveAs(destino);
    console.log(`   guardado en ${destino}`);
    return destino;
  } finally {
    await contexto.close().catch(() => {});
    await navegador.close().catch(() => {});
  }
}

// --------------------------------------------------------------------- main
async function main() {
  await mkdir(SALIDA, { recursive: true });
  await cargarEnv();
  const cfg = await cargarConfig();

  console.log("");
  console.log("Puente MiPortal -> app de equipos y repuestos");
  console.log("=============================================");

  const { codigos, lineas } = await cargarPlan();
  console.log(`0. Plan: ${lineas.length} lineas, ${codigos.size} codigos internos distintos que el portal puede refrescar.`);

  const rutaXlsx = await conseguirExcel(cfg);

  console.log("2. Leyendo el Excel");
  const { filas, diagnostico: d } = await leerInventario(rutaXlsx, codigos, {
    hoja: cfg.excel?.hoja,
    columnas: cfg.excel?.columnas,
  });

  console.log(`   hoja "${d.hoja}", cabecera en la fila ${d.filaCabecera}`);
  console.log(`   columna del codigo detectada por ${d.codigoDetectadoPor === "contenido" ? "su contenido (coincide con los codigos del plan)" : d.codigoDetectadoPor}`);
  for (const [campo, titulo] of Object.entries(d.columnas)) {
    console.log(`     ${campo.padEnd(6)} -> ${titulo ?? "(no la encontre)"}`);
  }
  console.log(`   ${filas.length} articulos leidos (${d.sinCodigo} filas sin codigo, ${d.duplicados} repetidos sumados por almacen)`);
  console.log(`   ${d.coincidenPlan} de ${codigos.size} codigos del plan vienen en este reporte`);

  if (!d.columnas.exist) {
    throw new Error(
      `Encontre el reporte pero no la columna de existencias, que es justo la que veniamos a buscar.\n` +
      `Columnas del Excel: ${d.titulosDisponibles.join(" | ")}\n` +
      `Pon la buena en portal.config.json -> excel.columnas.exist`
    );
  }
  if (d.coincidenPlan === 0) {
    throw new Error(
      `Lei ${filas.length} articulos pero ni uno solo coincide con los codigos internos del plan.\n` +
      `Suele ser que este es otro reporte, o que la columna del codigo no es la que creo ("${d.columnas.cod}").`
    );
  }

  if (opts.columnas) {
    console.log("\n(--columnas: hasta aqui llego, no subo nada)");
    console.log(`\nTitulos disponibles: ${d.titulosDisponibles.join(" | ")}`);
    return;
  }

  // ------------------------------------------------------- comparar y subir
  console.log("3. Comparando con lo que ya hay en la nube");
  const fs = new Firestore(cfg.firebase);
  // Leer la colección entera son ~5.000 lecturas de la cuota diaria de Firebase
  // (50.000 en el plan gratuito), y el puente corre varias veces al día. Así que
  // se guarda en salida/ lo que quedó en la nube tras cada pasada, y la
  // siguiente solo pide lo que cambió desde entonces (lo que haya subido la app
  // desde un archivo). Con --releer se lee todo otra vez.
  const COPIA = join(SALIDA, "nube-inventario.json");
  const inicio = new Date().toISOString();
  const guardada = tiene("--releer") ? null : await readFile(COPIA, "utf8").then(JSON.parse).catch(() => null);
  let actual;
  if (guardada && guardada.sello && guardada.docs) {
    actual = new Map(Object.entries(guardada.docs));
    const nuevos = await fs.leerCambiadosDesde("inventario", "actualizado", guardada.sello);
    nuevos.forEach((v, k) => actual.set(k, v));
    console.log(`   copia de la pasada anterior: ${actual.size} articulos; en la nube cambiaron ${nuevos.size} desde entonces`);
  } else {
    actual = await fs.leerColeccion("inventario");
    console.log(`   en la nube habia ${actual.size} articulos`);
  }
  const guardarCopia = () => writeFile(COPIA, JSON.stringify({ sello: inicio, docs: Object.fromEntries(actual) }), "utf8");

  const ahora = new Date().toISOString();
  const writes = [];
  const cambios = [];
  let iguales = 0;

  // Precios: NO se suben salvo que la config lo pida. Firestore de este proyecto
  // tiene reglas abiertas y la API key esta en la pagina publica, asi que todo lo
  // que se sube lo puede leer cualquiera que conozca el proyecto. Las existencias
  // hacen falta para la app; el precio de 5.000 articulos de almacen no, y es
  // informacion de compras de la empresa.
  const subirPrecios = cfg.firebase.subirPrecios === true;
  const CAMPOS = ["desc", "exist", "ub", "alm", "um", "min", "consumo", "mrp", "dias", "sitios", ...(subirPrecios ? ["pu"] : [])];

  for (const f of filas) {
    const previo = actual.get(f.cod);
    const nuevo = {
      cod: f.cod, desc: f.desc, exist: f.exist, ub: f.ub, alm: f.alm, um: f.um || "",
      min: f.min, consumo: f.consumo,
      // M = compra automatica, N = a mano; dias = plazo de aprovisionamiento
      mrp: f.mrp || "", dias: f.dias ?? null,
      // Firestore REST con campos planos: el desglose por sitio viaja como JSON.
      sitios: JSON.stringify(f.sitios || []),
      ...(subirPrecios ? { pu: f.pu } : {}),
    };
    // M/N y dias de compra solo cuentan si la nube ya los tenia: los articulos
    // subidos antes no los traen y la primera pasada los reescribiria todos
    // (y cada equipo bajaria el inventario entero). Mientras, salen del maestro.
    const yaTenia = (k) => !["mrp", "dias"].includes(k) || (previo[k] ?? "") !== "";
    const cambio = !previo || CAMPOS.some((k) => yaTenia(k) && (previo[k] ?? null) !== (nuevo[k] ?? null));
    if (!cambio) { iguales++; continue; }
    if (previo && (previo.exist ?? null) !== (nuevo.exist ?? null) && codigos.has(f.cod)) {
      cambios.push({ cod: f.cod, desc: f.desc, antes: previo.exist, ahora: nuevo.exist });
    }
    const doc = { ...nuevo, actualizado: ahora, fuente: "miportal", agotado: false };
    writes.push(fs.upsert("inventario", f.cod, doc));
    actual.set(f.cod, { ...(previo || {}), ...doc });
  }

  // Un articulo que ya no viene en el reporte se agoto (el RE356 no lista los
  // ceros). Se deja en 0 en vez de borrarlo: la app solo pide lo cambiado desde
  // su ultima copia, y un borrado no le llegaria; una existencia 0 si.
  const vienen = new Set(filas.map((f) => f.cod));
  const bajas = [...actual.keys()].filter((cod) => !vienen.has(cod) && Number(actual.get(cod).exist) !== 0);
  for (const cod of bajas) {
    const doc = { cod, exist: 0, sitios: "[]", agotado: true, actualizado: ahora, fuente: "miportal" };
    writes.push(fs.upsert("inventario", cod, doc));
    actual.set(cod, { ...actual.get(cod), ...doc });
  }

  console.log(`   ${writes.length - bajas.length} para crear o actualizar, ${iguales} sin cambios, ${bajas.length} agotados (quedan en 0)`);
  if (cambios.length) {
    console.log(`   movimientos en piezas del plan (${cambios.length}):`);
    for (const c of cambios.slice(0, 15)) {
      console.log(`     ${c.cod}  ${String(c.antes ?? "-").padStart(5)} -> ${String(c.ahora ?? "-").padStart(5)}   ${(c.desc || "").slice(0, 48)}`);
    }
    if (cambios.length > 15) console.log(`     ...y ${cambios.length - 15} mas (estan todos en el informe)`);
  }

  const informe = join(SALIDA, "ultimo-informe.json");
  await writeFile(informe, JSON.stringify({ fecha: ahora, origen: rutaXlsx, diagnostico: d, cambios, bajas, dryRun: opts.dryRun }, null, 2), "utf8");

  if (opts.dryRun) {
    console.log(`\n4. --dry-run: no escribi nada. El detalle quedo en ${informe}`);
    return;
  }

  console.log("4. Subiendo a Firestore");
  if (writes.length) {
    // El sello de la coleccion: la app lo usa para avisar si el inventario que
    // esta mostrando lleva dias sin refrescarse.
    writes.push(fs.upsert("inventario_meta", "estado", {
      actualizado: ahora,
      articulos: filas.length,
      coincidenPlan: d.coincidenPlan,
      origen: "miportal",
      hoja: d.hoja,
    }));
    await fs.escribir(writes);
    console.log(`   listo: ${writes.length} escrituras`);
  } else {
    console.log("   nada que subir, el portal dice lo mismo que la nube");
  }
  // Solo tras subir bien: si algo falla, la proxima pasada vuelve a comparar
  // con lo que diga la nube desde la copia anterior.
  await guardarCopia();
  console.log(`\nInforme: ${informe}`);
}

main().catch((e) => {
  console.error("\n[!] El puente se detuvo:\n");
  console.error(e.message || e);
  console.error(`\nSi hay capturas del fallo estan en ${SALIDA}`);
  process.exit(1);
});
