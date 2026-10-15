// Pruebas con un Firestore falso en memoria: nunca se toca el de producción.
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
process.env.DATA_LOCAL_DIR = RAIZ;
process.env.MCP_TOKENS = "ana:llave-de-ana-0123456789,luis:llave-de-luis-0123456789";
process.env.MCP_HOY = "2026-10-15";
process.env.MCP_LIMITE_MINUTO = "1000";

const { crearServidor } = await import("../server.mjs");
const { usarCliente } = await import("../lib/nube.mjs");
const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
const { StreamableHTTPClientTransport } = await import("@modelcontextprotocol/sdk/client/streamableHttp.js");

// Firestore falso
const bd = new Map();
const col = (n) => { if (!bd.has(n)) bd.set(n, new Map()); return bd.get(n); };
const escrituras = [];
usarCliente({
  listar: async (n) => [...col(n).values()].map((d) => ({ ...d })),
  obtener: async (n, id) => col(n).get(id) || null,
  guardar: async (n, id, d) => { escrituras.push([n, id]); col(n).set(id, JSON.parse(JSON.stringify(d))); return true; },
  actualizar: async (n, id, c) => { escrituras.push([n, id]); col(n).set(id, { ...(col(n).get(id) || {}), ...c }); return true; },
});
col("inventario").set("741901004", { id: "741901004", cod: "741901004", desc: "RODAMIENTO DE BOLA REF 6206 ZZ", exist: 10, um: "UN", ub: "R04/F1", pu: 5000, sitios: JSON.stringify([{ alm: "R04", ub: "F1", exist: 10 }]) });
col("tareas").set("t1", { id: "t1", title: "Revisar chiller", status: "pendiente", priority: "Alta", createdAt: "2026-10-10T15:00:00Z" });

let servidor, url;
before(async () => { servidor = crearServidor(); await new Promise((r) => servidor.listen(0, r)); url = `http://127.0.0.1:${servidor.address().port}`; });
after(() => servidor.close());

async function conectar(token = "llave-de-ana-0123456789") {
  const c = new Client({ name: "prueba", version: "1" });
  await c.connect(new StreamableHTTPClientTransport(new URL(`${url}/mcp`), { requestInit: { headers: { Authorization: `Bearer ${token}` } } }));
  return c;
}
const texto = (r) => r.content[0].text;

test("sin llave o con llave mala: 401", async () => {
  for (const h of [{}, { Authorization: "Bearer mala" }]) {
    const r = await fetch(`${url}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...h }, body: "{}" });
    assert.equal(r.status, 401);
  }
  assert.equal((await fetch(`${url}/health`)).status, 200);
});

test("la llave también vale en la ruta /t/<llave>/mcp", async () => {
  const c = new Client({ name: "p", version: "1" });
  await c.connect(new StreamableHTTPClientTransport(new URL(`${url}/t/llave-de-luis-0123456789/mcp`)));
  assert.ok((await c.listTools()).tools.length >= 14);
  await c.close();
});

test("lista las herramientas con sus anotaciones", async () => {
  const c = await conectar();
  const { tools } = await c.listTools();
  const por = Object.fromEntries(tools.map((t) => [t.name, t]));
  for (const n of ["resumen_planta", "equipos_a_atacar", "buscar_equipo", "buscar_repuesto", "estado_compra", "repuestos_por_llegar", "por_pedir", "cambios_de_piezas", "pendientes", "novedades", "historial_equipo", "personal_en_turno", "plan_mantenimiento"]) assert.equal(por[n].annotations.readOnlyHint, true, n);
  for (const n of ["anotar_pendiente", "actualizar_pendiente", "anotar_novedad", "registrar_cambio_pieza"]) assert.equal(por[n].annotations.readOnlyHint, false, n);
  await c.close();
});

test("lectura: compras igual que la app (531 abiertas, 78 atrasadas, 176 por pedir)", async () => {
  const c = await conectar();
  const r = await c.callTool({ name: "repuestos_por_llegar", arguments: { filtro: "atrasada", limite: 2 } });
  assert.match(texto(r), /"abiertas": 531/);
  assert.match(texto(r), /"atrasadas": 78/);
  const p = await c.callTool({ name: "por_pedir", arguments: { incluir_viejas: true, limite: 1 } });
  assert.match(texto(p), /"vigentes": \d+,\n "viejasSinActualizar": \d+/); // las cifras dependen del inventario falso
  await c.close();
});

test("lectura: equipo y cambios de piezas de la Blister 3", async () => {
  const c = await conectar();
  const b = await c.callTool({ name: "buscar_equipo", arguments: { texto: "blister 3" } });
  assert.match(texto(b), /17332003/);
  assert.doesNotMatch(texto(b), /Blister 30/);
  const k = await c.callTool({ name: "cambios_de_piezas", arguments: { equipo: "17332003" } });
  assert.match(texto(k), /Correas/);
  assert.match(texto(k), /2026-09-25/);
  await c.close();
});

test("lectura: equipos a atacar y repuesto con existencia", async () => {
  const c = await conectar();
  const e = await c.callTool({ name: "equipos_a_atacar", arguments: { periodo: "mes", limite: 3 } });
  assert.match(texto(e), /puntaje/);
  const rep = await c.callTool({ name: "buscar_repuesto", arguments: { texto: "741901004" } });
  assert.match(texto(rep), /"existencia": 10/);
  await c.close();
});

test("escritura: sin confirmar no guarda nada", async () => {
  const c = await conectar();
  const antes = escrituras.length;
  const r = await c.callTool({ name: "anotar_pendiente", arguments: { titulo: "Cambiar banda del troquel Blister 5", equipo: "Blister 5", prioridad: "alta" } });
  assert.match(texto(r), /VISTA PREVIA/);
  assert.equal(escrituras.length, antes);
  await c.close();
});

test("escritura: confirmando guarda a nombre de quien se conectó", async () => {
  const c = await conectar("llave-de-luis-0123456789");
  const r = await c.callTool({ name: "anotar_pendiente", arguments: { titulo: "Cambiar banda del troquel Blister 5", equipo: "Blister 5", prioridad: "alta", confirmar: true } });
  assert.match(texto(r), /GUARDADO/);
  const doc = [...col("seguimiento").values()][0];
  assert.equal(doc.creadoPor, "luis");
  assert.equal(doc.origen, "manual");
  assert.equal(doc.estado, "abierto");
  // y ahora aparece en los pendientes
  const p = await c.callTool({ name: "pendientes", arguments: { equipo: "banda troquel" } });
  assert.match(texto(p), /Cambiar banda del troquel Blister 5/);
  await c.close();
});

test("escritura: cerrar una tarea actualiza también la tarea", async () => {
  const c = await conectar();
  const r = await c.callTool({ name: "actualizar_pendiente", arguments: { id: "tar:t1", estado: "cerrado", nota: "Hecho", confirmar: true } });
  assert.match(texto(r), /GUARDADO/);
  assert.equal(col("tareas").get("t1").status, "hecha");
  assert.ok(col("tareas").get("t1").doneAt);
  assert.equal(col("seguimiento").get("tar:t1").estado, "cerrado");
  await c.close();
});

test("escritura: cambio de pieza (valida código y fecha)", async () => {
  const c = await conectar();
  const mala = await c.callTool({ name: "registrar_cambio_pieza", arguments: { equipo: "17332003", codigo: "999999999", confirmar: true } });
  assert.equal(mala.isError, true);
  const futura = await c.callTool({ name: "registrar_cambio_pieza", arguments: { equipo: "17332003", codigo: "741901004", fecha: "2030-01-01", confirmar: true } });
  assert.equal(futura.isError, true);
  const ok = await c.callTool({ name: "registrar_cambio_pieza", arguments: { equipo: "17332003", codigo: "741901004", fecha: "2026-10-14", cantidad: 2, confirmar: true } });
  assert.match(texto(ok), /GUARDADO/);
  const d = [...col("cambios").values()][0];
  assert.deepEqual([d.eq, d.cod, d.fecha, d.q, d.quien], ["17332003", "741901004", "2026-10-14", 2, "ana"]);
  await c.close();
});

test("escritura: novedad en un equipo de proceso; un equipo ambiguo se rechaza", async () => {
  const c = await conectar();
  const amb = await c.callTool({ name: "anotar_novedad", arguments: { equipo: "blister", detalle: "Se revisa la máquina por ruido en formado", turno: "Día", estado_al_cierre: "Operativo", confirmar: true } });
  assert.equal(amb.isError, true);
  assert.match(texto(amb), /varios equipos/);
  const sinSede = await c.callTool({ name: "anotar_novedad", arguments: { equipo: "17332003", detalle: "Se revisa la máquina por ruido en formado", turno: "Día", estado_al_cierre: "Operativo", confirmar: true } });
  assert.equal(sinSede.isError, true);
  assert.match(texto(sinSede), /dos sedes/);
  assert.equal(col("mtto_registros").size, 0);
  const ok = await c.callTool({ name: "anotar_novedad", arguments: { equipo: "17332003", sede: "Sede 2", detalle: "Se revisa la máquina por ruido en formado, sin novedad", turno: "Día", estado_al_cierre: "Operativo", minutos_paro: 20, confirmar: true } });
  assert.match(texto(ok), /GUARDADO/);
  const d = [...col("mtto_registros").values()][0];
  assert.equal(d.eq, "Blister 3");
  assert.equal(d.s, "Sede 2");
  assert.equal(d.ar, "Blisteado y estuchado");
  assert.equal(d.src, "mcp");
  assert.equal(d.por, "ana");
  await c.close();
});
