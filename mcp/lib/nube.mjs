// Firestore con caché: la cuota diaria es limitada (cada documento leído cuenta),
// así que las colecciones se guardan unos minutos, el inventario unas horas y las
// consultas de una sola pieza se leen directo.
import { crearCliente } from "../../scripts/lib/firestore-rest.mjs";
import { config } from "./config.mjs";
import { estadoVivo } from "./repo.mjs";

let db = null;
export const cliente = () => (db ||= crearCliente({ proyecto: config.proyecto, apiKey: config.apiKey, email: config.email, password: config.password }));
export const usarCliente = (c) => { db = c; cache.clear(); }; // para las pruebas

const cache = new Map(); // clave -> { t, v, pend }
async function conCache(clave, ttl, fn) {
  const c = cache.get(clave);
  if (c && c.v !== undefined && Date.now() - c.t < ttl) return c.v;
  if (c && c.pend) return c.pend;
  const pend = fn().then((v) => { cache.set(clave, { t: Date.now(), v }); return v; }, (e) => { cache.delete(clave); throw e; });
  cache.set(clave, { ...(c || { t: 0 }), pend });
  return pend;
}
export const invalidar = (...cols) => cols.forEach((c) => cache.delete("col:" + c));

export const coleccion = (nombre) => conCache("col:" + nombre, config.ttl.coleccion, () => cliente().listar(nombre));

// Inventario completo: un documento por código. Se baja entero muy de vez en cuando.
export const inventario = () => conCache("inv", config.ttl.inventario, async () => {
  const docs = await cliente().listar("inventario");
  return new Map(docs.filter((d) => d && d.cod).map((d) => [String(d.cod).trim(), d]));
});

// Una pieza, sin bajar todo el inventario
export const pieza = (cod) => conCache("cod:" + cod, config.ttl.codigo, async () => {
  const d = await cliente().obtener("inventario", String(cod).trim());
  if (d === undefined) throw new Error("No se pudo leer el inventario");
  return d;
});

// Todo lo que las herramientas de lectura necesitan, y deja listo el estado que usan
// compras.js y cambios-piezas.js (registros, cambios e inventario)
export async function cargarNube({ inv = true } = {}) {
  const [tareas, registros, estados, seguimiento, solicitudes, cambios, mapaInv] = await Promise.all([
    coleccion("tareas"), coleccion("mtto_registros"), coleccion("mtto_estados"), coleccion("seguimiento"),
    coleccion("solicitudes"), coleccion("cambios"), inv ? inventario().catch(() => null) : null,
  ]);
  estadoVivo.cambios = cambios;
  estadoVivo.inventario = mapaInv || null;
  return { tareas, registros, estados, seguimiento, solicitudes, cambios, presupuesto: [], movimientos: [], reportes: [] };
}

export async function escribir(col, id, datos) {
  const ok = await cliente().guardar(col, id, datos);
  if (!ok) throw new Error(`Firestore rechazó la escritura en ${col}`);
  invalidar(col);
  return true;
}
export const uid = (p = "x") => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
