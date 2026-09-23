#!/usr/bin/env node
// RESPALDO DE LA BASE DE DATOS DE LA APP (Firestore)
// ===================================================
// Hoy cualquiera que abra la app puede borrar o cambiar datos (las reglas de
// Firestore estan abiertas y el repositorio es publico). Este script guarda una
// copia completa cada noche para poder volver atras.
//
// La copia va CIFRADA (AES-256-GCM, clave derivada con scrypt) porque se guarda
// como artefacto de GitHub Actions y el repositorio es publico: sin la clave
// (secret RESPALDO_CLAVE) el archivo no se puede leer.
//
//   node scripts/respaldo.mjs exportar respaldo.bin      baja todo y lo cifra
//   node scripts/respaldo.mjs ver respaldo.bin           que hay dentro
//   node scripts/respaldo.mjs restaurar respaldo.bin     ENSAYO: dice que escribiria
//   node scripts/respaldo.mjs restaurar respaldo.bin --aplicar [--coleccion tareas]
//
// Variables: RESPALDO_CLAVE (obligatoria), FIREBASE_PROJECT_ID, FIREBASE_API_KEY.
//
// Restaurar vuelve a escribir los documentos tal como estaban en la copia. No
// borra nada que se haya creado despues: si alguien borro tareas, vuelven; si
// alguien creo tareas nuevas despues de la copia, se quedan.

import { readFile, writeFile } from "node:fs/promises";
import { gzipSync, gunzipSync } from "node:zlib";
import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from "node:crypto";
import { pathToFileURL } from "node:url";

// "inventario" no entra: son 5.000 articulos que se regeneran solos desde el
// RE356 de MiPortal. Todo lo demas lo escribe la gente y no se puede rehacer.
export const COLECCIONES = ["tareas", "cambios", "datos", "inspecciones", "solicitudes", "bitacora", "inventario_meta"];

const MAGIA = Buffer.from("RESP1");

// ------------------------------------------------------------ Firestore <-> JSON
// El REST de Firestore envuelve cada valor con su tipo. Las tareas llevan
// listas (pasos) y objetos (el cierre de la OT), asi que hay que ir a fondo.
export function deFirestore(v) {
  if (v === null || v === undefined) return null;
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(deFirestore);
  if ("mapValue" in v) return camposAJson(v.mapValue.fields || {});
  return null;
}
export function camposAJson(fields) {
  const o = {};
  for (const [k, v] of Object.entries(fields || {})) o[k] = deFirestore(v);
  return o;
}
export function aFirestore(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(aFirestore) } };
  if (typeof v === "object") return { mapValue: { fields: jsonACampos(v) } };
  return { stringValue: String(v) };
}
export function jsonACampos(o) {
  const f = {};
  for (const [k, v] of Object.entries(o || {})) if (v !== undefined) f[k] = aFirestore(v);
  return f;
}

// ------------------------------------------------------------ cifrado
export function cifrar(objeto, clave) {
  if (!clave) throw new Error("Falta la clave del respaldo (RESPALDO_CLAVE).");
  const sal = randomBytes(16);
  const iv = randomBytes(12);
  const llave = scryptSync(clave, sal, 32);
  const c = createCipheriv("aes-256-gcm", llave, iv);
  const datos = Buffer.concat([c.update(gzipSync(Buffer.from(JSON.stringify(objeto)))), c.final()]);
  return Buffer.concat([MAGIA, sal, iv, c.getAuthTag(), datos]);
}
export function descifrar(buf, clave) {
  if (!clave) throw new Error("Falta la clave del respaldo (RESPALDO_CLAVE).");
  if (!buf.subarray(0, MAGIA.length).equals(MAGIA)) throw new Error("Este archivo no es un respaldo de la app.");
  let p = MAGIA.length;
  const sal = buf.subarray(p, (p += 16));
  const iv = buf.subarray(p, (p += 12));
  const tag = buf.subarray(p, (p += 16));
  const d = createDecipheriv("aes-256-gcm", scryptSync(clave, sal, 32), iv);
  d.setAuthTag(tag);
  try {
    return JSON.parse(gunzipSync(Buffer.concat([d.update(buf.subarray(p)), d.final()])).toString("utf8"));
  } catch (e) {
    throw new Error("No se pudo abrir el respaldo: la clave no es la correcta o el archivo esta danado.");
  }
}

// ------------------------------------------------------------ nube
function base(cfg) { return `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents`; }
const qs = (cfg) => (cfg.apiKey ? `key=${encodeURIComponent(cfg.apiKey)}` : "");

export async function exportar(cfg, fetchFn = fetch) {
  const salida = { app: "equipos-repuestos", proyecto: cfg.projectId, fecha: new Date().toISOString(), colecciones: {} };
  for (const col of COLECCIONES) {
    const docs = [];
    let token = "";
    do {
      const r = await fetchFn(`${base(cfg)}/${col}?pageSize=300&${qs(cfg)}${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`);
      if (!r.ok) throw new Error(`Firestore respondio ${r.status} al leer ${col}: ${(await r.text()).slice(0, 300)}`);
      const j = await r.json();
      for (const d of j.documents || []) docs.push({ _id: d.name.split("/").pop(), ...camposAJson(d.fields) });
      token = j.nextPageToken || "";
    } while (token);
    salida.colecciones[col] = docs;
  }
  return salida;
}

export function escrituras(respaldo, cfg, soloColeccion) {
  const w = [];
  for (const [col, docs] of Object.entries(respaldo.colecciones || {})) {
    if (soloColeccion && col !== soloColeccion) continue;
    for (const d of docs) {
      const { _id, ...campos } = d;
      w.push({ update: { name: `projects/${cfg.projectId}/databases/(default)/documents/${col}/${_id}`, fields: jsonACampos(campos) } });
    }
  }
  return w;
}

export async function restaurar(respaldo, cfg, { aplicar = false, coleccion = "" } = {}, fetchFn = fetch) {
  const w = escrituras(respaldo, cfg, coleccion);
  if (!aplicar) return { escritos: 0, pendientes: w.length };
  for (let i = 0; i < w.length; i += 400) {
    const r = await fetchFn(`${base(cfg)}:commit?${qs(cfg)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ writes: w.slice(i, i + 400) }) });
    if (!r.ok) throw new Error(`Firestore respondio ${r.status} al restaurar: ${(await r.text()).slice(0, 300)}`);
  }
  return { escritos: w.length, pendientes: 0 };
}

function resumen(r) {
  const filas = Object.entries(r.colecciones || {}).map(([c, d]) => `  ${c.padEnd(16)} ${String(d.length).padStart(5)}`);
  return `Respaldo del ${r.fecha} (proyecto ${r.proyecto})\n${filas.join("\n")}`;
}

// ------------------------------------------------------------ linea de comandos
async function main() {
  const [accion, archivo, ...resto] = process.argv.slice(2);
  const cfg = { projectId: process.env.FIREBASE_PROJECT_ID || "mantenimiento-f405b", apiKey: process.env.FIREBASE_API_KEY || "" };
  const clave = process.env.RESPALDO_CLAVE || "";
  const valor = (f) => { const i = resto.indexOf(f); return i >= 0 ? resto[i + 1] : ""; };

  if (!accion || !archivo) {
    console.log("Uso: node scripts/respaldo.mjs exportar|ver|restaurar <archivo> [--aplicar] [--coleccion X]");
    process.exit(1);
  }
  if (accion === "exportar") {
    if (!clave) {
      // En Actions: sin el secret no se hace nada, pero se dice claro.
      console.log("::warning::No hay RESPALDO_CLAVE configurada: no se hizo el respaldo. Agregala en Settings > Secrets and variables > Actions.");
      process.exit(0);
    }
    const r = await exportar(cfg);
    await writeFile(archivo, cifrar(r, clave));
    console.log(resumen(r));
    console.log(`\nGuardado y cifrado en ${archivo}`);
  } else if (accion === "ver") {
    console.log(resumen(descifrar(await readFile(archivo), clave)));
  } else if (accion === "restaurar") {
    const r = descifrar(await readFile(archivo), clave);
    const aplicar = resto.includes("--aplicar");
    const coleccion = valor("--coleccion");
    console.log(resumen(r));
    const res = await restaurar(r, cfg, { aplicar, coleccion });
    console.log(aplicar
      ? `\nRestaurados ${res.escritos} documentos${coleccion ? ` de ${coleccion}` : ""}.`
      : `\nENSAYO: se escribirian ${res.pendientes} documentos${coleccion ? ` de ${coleccion}` : ""}. Para hacerlo de verdad, anade --aplicar.`);
  } else {
    console.log(`No conozco la accion "${accion}".`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((e) => { console.error("[!] " + (e.message || e)); process.exit(1); });
}
