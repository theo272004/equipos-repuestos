#!/usr/bin/env node
// Revisa assets/equipos.js (registro de equipos) y cuenta lo que se ve raro.
// Solo LEE: no cambia ningún archivo.
//
//   node scripts/validar-equipos.mjs            informe; sale con 0 aunque haya avisos
//   node scripts/validar-equipos.mjs --estricto sale con 1 si hay ERRORES (no avisos)
//   node scripts/validar-equipos.mjs --json     lo mismo, en JSON
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

export function validar(plan) {
  const errores = [];
  const avisos = [];
  const equipos = plan?.equipos ?? [];
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
    if (e.tipo === "URGENCIA" || e.cc === "0") avisos.push({ regla: "comodin", id: e.id, detalle: `${e.n} (cc="${e.cc}")` });
    const sinCod = (e.r || []).filter((r) => !r.cod).length;
    if (sinCod) avisos.push({ regla: "repuestos-sin-codigo", id: e.id, detalle: `${sinCod} fila(s) del plan sin código de almacén` });
  }

  const ccCorto = equipos.filter((e) => /^[A-Z0-9]{1,3}$/.test(e.cc || "")).length;
  const ccArea = equipos.filter((e) => String(e.cc || "").includes("·")).length;
  const resumen = {
    equipos: equipos.length,
    porUbicacion: cuenta(equipos, (e) => e.u),
    porTipo: cuenta(equipos, (e) => e.tipo),
    conRepuestos: equipos.filter((e) => (e.r || []).length).length,
    filasRepuestos: equipos.reduce((s, e) => s + (e.r || []).length, 0),
    ccComoCodigoCorto: ccCorto,
    ccComoAreaYZona: ccArea,
    ccOtro: equipos.length - ccCorto - ccArea,
  };
  return { resumen, errores, avisos };
}

function imprimir({ resumen, errores, avisos }) {
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
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
  const informe = validar(cargarRegistro(join(raiz, "assets", "equipos.js")));
  if (process.argv.includes("--json")) console.log(JSON.stringify(informe, null, 2));
  else imprimir(informe);
  if (process.argv.includes("--estricto") && informe.errores.length) process.exit(1);
}
