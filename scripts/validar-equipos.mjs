#!/usr/bin/env node
// Revisa assets/equipos.js (registro de equipos) y cuenta lo que se ve raro.
// Solo LEE: no cambia ningún archivo.
//
//   node scripts/validar-equipos.mjs            informe; sale con 0 aunque haya avisos
//   node scripts/validar-equipos.mjs --estricto sale con 1 si hay ERRORES (no avisos)
//   node scripts/validar-equipos.mjs --json     lo mismo, en JSON
//   node scripts/validar-equipos.mjs --listado DMM-179.csv
//        compara con el listado oficial (CSV con el código en alguna columna) y SOLO LISTA
//        los equipos del repositorio que no aparecen: nunca se quitan.
//
// Marcas que lleva el registro (no se borra nada):
//   evaluacion: true   no es una máquina (ej. «Invima»): no cuenta como equipo.
//   revision: "..."    el equipo queda «por confirmar».
//   noEnListado: true  sigue ACTIVO y cuenta en los totales, pero no aparece en el listado oficial
//                      DMM-179/179B (ej. las Marzio R-120, que tienen plan y novedades vigentes).
//   retirado: true     salió de la lista activa (fuera del listado oficial): no cuenta en los totales;
//                      se conserva en el registro y en assets/data/equipos-retirados.json.
// Los códigos se comparan sin ceros a la izquierda (04307001 = 4307001).
//
// ERROR = rompe algo (id repetido, código repetido dentro de la misma planta,
//         ubicación que no es SEDE 4 ni PLANTA 2).
// AVISO = conviene mirarlo, pero puede ser a propósito (código con otra longitud,
//         comodines, centro de costo mezclado con área).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const UBICACIONES = ["SEDE 4", "PLANTA 2"];
const TIPOS = ["PROCESO", "AUXILIAR", "URGENCIA"];

export function cargarRegistro(ruta) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(ruta, "utf8"), ctx);
  return ctx.window.EQUIPOS_PLAN;
}

export const sinCeros = (c) => String(c ?? "").trim().replace(/^0+(?=\d)/, "");

export function codigosDeListado(texto) {
  const set = new Set();
  for (const linea of String(texto).split(/\r?\n/)) {
    for (const celda of linea.split(/[,;\t]/)) {
      const t = celda.replace(/^"|"$/g, "").trim();
      if (/^\d{1,9}$/.test(t)) set.add(sinCeros(t));
    }
  }
  return set;
}

export function validar(plan, listadoOficial = null, idsRespaldados = null) {
  const errores = [];
  const avisos = [];
  const todos = plan?.equipos ?? [];
  const evaluaciones = todos.filter((e) => e.evaluacion);
  const retirados = todos.filter((e) => e.retirado);
  const equipos = todos.filter((e) => !e.evaluacion && !e.retirado);
  const noEnListado = equipos.filter((e) => e.noEnListado).map((e) => ({ id: e.id, detalle: `${e.c} · ${e.n} (${e.u}) — activo, pero no está en el listado oficial` }));
  // Cada retirado debe tener su copia completa en assets/data/equipos-retirados.json (para poder reactivarlo)
  if (idsRespaldados) for (const e of retirados) if (!idsRespaldados.has(e.id)) errores.push({ regla: "retirado-sin-respaldo", id: e.id, detalle: `${e.n}: falta su copia en equipos-retirados.json` });
  const porConfirmar = equipos.filter((e) => e.revision).map((e) => ({ id: e.id, detalle: `${e.n}: ${e.revision}` }));
  const fueraDeListado = listadoOficial
    ? equipos.filter((e) => !listadoOficial.has(sinCeros(e.c))).map((e) => ({ id: e.id, detalle: `${e.c} · ${e.n} (${e.u}) — no está en el listado oficial` }))
    : null;
  const cuenta = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});

  const porId = cuenta(equipos, (e) => e.id);
  for (const [id, n] of Object.entries(porId)) if (n > 1) errores.push({ regla: "id-repetido", id, detalle: `${n} equipos con el mismo id` });

  const porCodUbic = cuenta(equipos, (e) => `${e.c}|${e.u}`);
  for (const [k, n] of Object.entries(porCodUbic)) if (n > 1) errores.push({ regla: "codigo-repetido-misma-planta", id: k, detalle: `${n} equipos con el mismo código en la misma ubicación` });

  const porCod = {};
  for (const e of equipos) (porCod[e.c] ||= []).push(e);
  for (const [c, lista] of Object.entries(porCod)) {
    const ubic = new Set(lista.map((e) => e.u));
    if (lista.length > 1 && ubic.size > 1) avisos.push({ regla: "codigo-en-varias-plantas", id: c, detalle: lista.map((e) => `${e.id} (${e.u}) ${e.n}`).join(" | ") });
  }

  for (const e of equipos) {
    if (!UBICACIONES.includes(e.u)) errores.push({ regla: "ubicacion-desconocida", id: e.id, detalle: `u="${e.u}" · ${e.n}` });
    if (!TIPOS.includes(e.tipo)) avisos.push({ regla: "tipo-desconocido", id: e.id, detalle: `tipo="${e.tipo}"` });
    if (!/^\d{7,9}$/.test(String(e.c))) avisos.push({ regla: "codigo-fuera-de-formato", id: e.id, detalle: `c="${e.c}" (se esperan 7 a 9 dígitos) · ${e.n}` });
    const sinCod = (e.r || []).filter((r) => !r.cod).length;
    if (sinCod) avisos.push({ regla: "repuestos-sin-codigo", id: e.id, detalle: `${sinCod} fila(s) del plan sin código de almacén` });
  }

  const ccCorto = equipos.filter((e) => /^[A-Z0-9]{1,3}$/.test(e.cc || "")).length;
  const ccArea = equipos.filter((e) => String(e.cc || "").includes("·")).length;
  const resumen = {
    equipos: equipos.length,
    activosFueraDelListado: noEnListado.length,
    retiradosAparte: retirados.map((e) => `${e.c} · ${e.n} (${e.u})`),
    evaluacionesAparte: evaluaciones.map((e) => e.n),
    porConfirmar: porConfirmar.length,
    porUbicacion: cuenta(equipos, (e) => e.u),
    porTipo: cuenta(equipos, (e) => e.tipo),
    conRepuestos: equipos.filter((e) => (e.r || []).length).length,
    filasRepuestos: equipos.reduce((s, e) => s + (e.r || []).length, 0),
    ccComoCodigoCorto: ccCorto,
    ccComoAreaYZona: ccArea,
    ccOtro: equipos.length - ccCorto - ccArea,
  };
  return { resumen, errores, avisos, porConfirmar, noEnListado, fueraDeListado };
}

function imprimir({ resumen, errores, avisos, porConfirmar, noEnListado, fueraDeListado }) {
  console.log("Resumen:", JSON.stringify(resumen, null, 2));
  const grupo = (tit, lista) => {
    console.log(`\n${tit}: ${lista.length}`);
    const por = {};
    for (const x of lista) (por[x.regla] ||= []).push(x);
    for (const [regla, xs] of Object.entries(por)) {
      console.log(`  · ${regla} (${xs.length})`);
      for (const x of xs.slice(0, 8)) console.log(`      ${x.id}: ${x.detalle}`);
      if (xs.length > 8) console.log(`      … y ${xs.length - 8} más`);
    }
  };
  grupo("ERRORES", errores);
  grupo("AVISOS", avisos);
  grupo("ACTIVOS MARCADOS «NO ESTÁ EN EL LISTADO OFICIAL»", noEnListado.map((x) => ({ ...x, regla: "no-en-listado" })));
  grupo("POR CONFIRMAR", porConfirmar.map((x) => ({ ...x, regla: "revision" })));
  if (fueraDeListado) grupo("NO ESTÁ EN EL LISTADO OFICIAL (solo informativo, no se quita nada)", fueraDeListado.map((x) => ({ ...x, regla: "fuera-de-listado" })));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
  const i = process.argv.indexOf("--listado");
  const listado = i > 0 ? codigosDeListado(readFileSync(process.argv[i + 1], "utf8")) : null;
  let respaldo = null;
  try { respaldo = new Set(JSON.parse(readFileSync(join(raiz, "assets", "data", "equipos-retirados.json"), "utf8")).retirados.map((e) => e.id)); } catch {}
  const informe = validar(cargarRegistro(join(raiz, "assets", "equipos.js")), listado, respaldo);
  if (process.argv.includes("--json")) console.log(JSON.stringify(informe, null, 2));
  else imprimir(informe);
  if (process.argv.includes("--estricto") && informe.errores.length) process.exit(1);
}
