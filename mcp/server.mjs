// Servidor MCP de la app de mantenimiento (Streamable HTTP, sin sesiones).
// Cada persona entra con su llave: Authorization: Bearer <token>  o  /t/<token>/mcp
import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { config } from "./lib/config.mjs";
import { registrarHerramientas } from "./lib/tools.mjs";

const INSTRUCCIONES = `Asistente de mantenimiento de Farmacápsulas (Sede 4 y Sede 2/Planta 2). Responde en español de Colombia, claro y sin tecnicismos.
- Para preguntas generales empieza por resumen_planta; para '¿qué equipo falla más / cuál atacamos?' usa equipos_a_atacar.
- Las fechas de compras (FEC ENTREGA, VENCE) son las PROMETIDAS por el proveedor, no las de llegada real. El Excel del plan suele estar desactualizado: una pieza 'vencida' hace más de 90 días casi siempre ya se cambió.
- Las herramientas de escritura (anotar_pendiente, actualizar_pendiente, anotar_novedad, registrar_cambio_pieza) NO guardan hasta que confirmar sea true. Primero haz la vista previa, muéstrasela a la persona y solo guarda si dice que sí. Nunca anotes nada que no te hayan pedido.`;

const crear = (quien) => {
  const s = new McpServer({ name: "mantenimiento", version: "1.0.0" }, { instructions: INSTRUCCIONES });
  registrarHerramientas(s, quien);
  return s;
};

// --- autenticación y límite de uso
const iguales = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
function quienEs(req, url) {
  if (config.sinAutenticacion && !config.tokens.size) return "anónimo";
  const m = /^\/t\/([^/]+)\/mcp$/.exec(url.pathname);
  const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || "");
  const candidato = (m && decodeURIComponent(m[1])) || (bearer && bearer[1].trim()) || "";
  if (!candidato) return null;
  for (const [token, nombre] of config.tokens) if (iguales(token, candidato)) return nombre;
  return null;
}
const usos = new Map(); // nombre -> [marcas de tiempo]
function dentroDelLimite(nombre) {
  const ahora = Date.now(), v = (usos.get(nombre) || []).filter((t) => ahora - t < 60000);
  v.push(ahora); usos.set(nombre, v);
  return v.length <= config.limitePorMinuto;
}

const json = (res, code, obj, extra = {}) => { res.writeHead(code, { "Content-Type": "application/json", ...extra }); res.end(JSON.stringify(obj)); };
const LIMITE_CUERPO = 1024 * 1024;
function leerCuerpo(req) {
  return new Promise((ok, mal) => {
    let n = 0; const partes = [];
    req.on("data", (c) => { n += c.length; if (n > LIMITE_CUERPO) { mal(Object.assign(new Error("Cuerpo demasiado grande"), { code: 413 })); req.destroy(); } else partes.push(c); });
    req.on("end", () => { try { ok(partes.length ? JSON.parse(Buffer.concat(partes).toString("utf8")) : undefined); } catch { mal(Object.assign(new Error("JSON inválido"), { code: 400 })); } });
    req.on("error", mal);
  });
}

export function crearServidor() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    try {
      if (url.pathname === "/health" || url.pathname === "/") return json(res, 200, { ok: true, servicio: "mantenimiento-mcp" });
      if (!/^\/(t\/[^/]+\/)?mcp$/.test(url.pathname)) return json(res, 404, { error: "No existe" });
      const quien = quienEs(req, url);
      if (!quien) return json(res, 401, { error: "Falta o no es válida la llave de acceso" }, { "WWW-Authenticate": 'Bearer realm="mantenimiento"' });
      if (!dentroDelLimite(quien)) return json(res, 429, { error: "Demasiadas consultas seguidas, espera un minuto" }, { "Retry-After": "30" });
      // Sin sesiones: cada petición se atiende sola (no se pierde nada si el servicio se reinicia)
      if (req.method !== "POST") return json(res, 405, { jsonrpc: "2.0", error: { code: -32000, message: "Usa POST" }, id: null }, { Allow: "POST" });
      const cuerpo = await leerCuerpo(req);
      const servidor = crear(quien);
      const transporte = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      res.on("close", () => { transporte.close(); servidor.close(); });
      await servidor.connect(transporte);
      await transporte.handleRequest(req, res, cuerpo);
    } catch (e) {
      console.error("[mcp]", e.message);
      if (!res.headersSent) json(res, e.code === 413 || e.code === 400 ? e.code : 500, { jsonrpc: "2.0", error: { code: -32603, message: e.code ? e.message : "Error interno" }, id: null });
    }
  });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  if (!config.tokens.size && !config.sinAutenticacion) {
    console.error("Falta MCP_TOKENS (formato «nombre:llave,otro:llave», llaves de 16+ caracteres). Para probar sin llaves en local: MCP_SIN_AUTENTICACION=1.");
    process.exit(1);
  }
  crearServidor().listen(config.puerto, () => console.log(`MCP de mantenimiento escuchando en :${config.puerto} (${config.tokens.size} llaves)`));
}
