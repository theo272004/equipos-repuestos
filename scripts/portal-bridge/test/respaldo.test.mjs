// El respaldo: exportar (con paginas y campos anidados, como el cierre de una OT),
// cifrar, abrir con la clave buena, negarse con la mala, y que restaurar
// devuelva exactamente lo que habia.
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exportar, cifrar, descifrar, restaurar, escrituras, camposAJson, jsonACampos, COLECCIONES } from "../../respaldo.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const fallos = [];
const ok = (c, m) => { if (!c) fallos.push(m); };

const ot = {
  id: "t1", title: "Atasco en sellado", status: "hecha", paro: true, paroInicio: "2026-09-23T08:00", paroFin: "2026-09-23T10:00",
  steps: [{ text: "Desmontar", done: true }, { text: "Cambiar rodamiento", done: false }],
  cierre: { trabajo: "Cambio de rodamiento", hh: 1.5, ccosto: "E8", repuestos: [{ cod: "741903002", d: "RODAMIENTO", q: 2 }] },
  vacio: null,
};
// Firestore falsa: tareas en dos paginas.
const nube = { tareas: [ot, { id: "t2", title: "Otra", status: "pendiente", steps: [] }], bitacora: [{ id: "n1", texto: "Nota", fecha: "2026-09-23" }] };
const cfg = { projectId: "p", apiKey: "k" };
const commits = [];
const fetchFalso = async (url, op) => {
  if (op && op.method === "POST") { commits.push(JSON.parse(op.body)); return { ok: true, json: async () => ({}) }; }
  const col = /documents\/([a-z_]+)\?/.exec(url)[1];
  const docs = nube[col] || [];
  const pagina2 = url.includes("pageToken=sig");
  const lote = col === "tareas" ? (pagina2 ? docs.slice(1) : docs.slice(0, 1)) : docs;
  return { ok: true, json: async () => ({
    documents: lote.map((d) => ({ name: `projects/p/databases/(default)/documents/${col}/${d.id}`, fields: jsonACampos(d) })),
    ...(col === "tareas" && !pagina2 ? { nextPageToken: "sig" } : {}),
  }) };
};

const r = await exportar(cfg, fetchFalso);
ok(r.colecciones.tareas.length === 2, `no siguio la paginacion: ${r.colecciones.tareas.length} tareas`);
ok(COLECCIONES.every((c) => Array.isArray(r.colecciones[c])), "faltan colecciones en el respaldo");
const t1 = r.colecciones.tareas.find((d) => d._id === "t1");
ok(JSON.stringify({ ...t1, _id: undefined }) === JSON.stringify({ ...ot, _id: undefined }), `el cierre de la OT no sobrevivio al respaldo: ${JSON.stringify(t1)}`);

const bin = cifrar(r, "clave-buena");
ok(!bin.toString("latin1").includes("Atasco"), "el respaldo no esta cifrado: se lee el texto");
ok(JSON.stringify(descifrar(bin, "clave-buena")) === JSON.stringify(r), "descifrar no devuelve lo mismo");
let mala = "";
try { descifrar(bin, "otra-clave"); } catch (e) { mala = e.message; }
ok(/clave/.test(mala), `con la clave mala no se nego bien: ${mala || "(abrio!)"}`);

const ensayo = await restaurar(r, cfg, {}, fetchFalso);
ok(ensayo.pendientes === 3 && commits.length === 0, "el ensayo escribio en la nube");
await restaurar(r, cfg, { aplicar: true, coleccion: "tareas" }, fetchFalso);
const escritas = commits.flatMap((c) => c.writes);
ok(escritas.length === 2 && escritas.every((w) => w.update.name.includes("/tareas/")), "restaurar una coleccion toco otras");
const vuelta = camposAJson(escritas.find((w) => w.update.name.endsWith("/t1")).update.fields);
ok(JSON.stringify(vuelta) === JSON.stringify(ot), `lo restaurado no es igual al original: ${JSON.stringify(vuelta)}`);
ok(escrituras(r, cfg).length === 3, "escrituras() no cuenta todos los documentos");

// Sin clave, en Actions, no falla: avisa y sale bien.
const salida = execFileSync("node", [join(AQUI, "..", "..", "respaldo.mjs"), "exportar", "/dev/null"], { env: { ...process.env, RESPALDO_CLAVE: "" } }).toString();
ok(/RESPALDO_CLAVE/.test(salida), "sin clave no avisa");

console.log(fallos.length ? "FALLOS:\n- " + fallos.join("\n- ") : "Todo correcto (respaldo cifrado y restauracion).");
process.exit(fallos.length ? 1 : 0);
