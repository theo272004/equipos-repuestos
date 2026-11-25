#!/usr/bin/env node
// Transporte stdio local para conectar el MCP directamente a Claude Desktop,
// Claude Code, Cursor, Antigravity o cualquier agente de escritorio sin subirlo
// a ningún servidor en la nube.
//
// Por defecto lee los datos del propio repositorio local (DATA_LOCAL_DIR) y
// sincroniza lecturas/escrituras con el Firestore de la app (mantenimiento-f405b).
// En stdio todo log debe ir a stderr para no ensuciar el canal JSON-RPC de stdout.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.DATA_LOCAL_DIR && !process.env.DATA_BASE_URL) {
  process.env.DATA_LOCAL_DIR = RAIZ;
}

const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
const { registrarHerramientas } = await import("./lib/tools.mjs");

const quien = (process.env.MCP_USUARIO || "Mateo Castro").trim();

const server = new McpServer(
  { name: "mantenimiento-medicamentos", version: "1.1.0" },
  {
    instructions:
      "Asistente de mantenimiento de planta (Sede 4 y Sede 2). " +
      "Usa siempre las herramientas de lectura para consultar datos reales de equipos, fallas, reportes, mantenimientos, repuestos, compras, turnos y centros de costo. " +
      "Nunca inventes códigos ni centros de costo. Para cualquier escritura (anotar pendiente, novedad, mantenimiento, tarea, cambio de pieza u OT de mecanizado), " +
      "llama primero con confirmar: false para mostrar la vista previa al usuario y solo usa confirmar: true cuando el usuario apruebe explícitamente.",
  }
);

registrarHerramientas(server, quien);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[MCP stdio] mantenimiento-medicamentos listo (usuario: ${quien}, repo: ${process.env.DATA_LOCAL_DIR || process.env.DATA_BASE_URL})`);
