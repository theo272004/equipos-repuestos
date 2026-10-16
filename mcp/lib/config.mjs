// Toda la configuración sale del entorno (nada de claves en el código).
const env = process.env;

export const config = {
  puerto: Number(env.PORT || 8787),
  // Firestore de la app (la clave web es pública: la protegen las reglas, no el secreto)
  proyecto: env.FIREBASE_PROJECT || "mantenimiento-f405b",
  apiKey: env.FIREBASE_API_KEY || "AIzaSyBQzRHnGBX9TtxrOBoh5KX5dm6agguoSaQ",
  email: env.FIREBASE_EMAIL || "",
  password: env.FIREBASE_PASSWORD || "",
  // De dónde salen los datos que viajan con el repositorio (plan, compras, reportes…)
  datosUrl: (env.DATA_BASE_URL || "https://theo272004.github.io/equipos-repuestos/").replace(/\/?$/, "/"),
  datosLocal: env.DATA_LOCAL_DIR || "",
  appUrl: (env.APP_URL || "https://theo272004.github.io/equipos-repuestos/").replace(/\/?$/, "/"),
  // "nombre:token,nombre2:token2": cada persona con su llave
  tokens: parsearTokens(env.MCP_TOKENS),
  sinAutenticacion: env.MCP_SIN_AUTENTICACION === "1",
  limitePorMinuto: Number(env.MCP_LIMITE_MINUTO || 60),
  ttl: {
    coleccion: Number(env.TTL_COLECCION_S || 120) * 1000,
    inventario: Number(env.TTL_INVENTARIO_S || 12 * 3600) * 1000,
    codigo: Number(env.TTL_CODIGO_S || 60) * 1000,
    repo: Number(env.TTL_REPO_S || 600) * 1000,
  },
};

function parsearTokens(txt) {
  const m = new Map();
  String(txt || "").split(",").map((x) => x.trim()).filter(Boolean).forEach((par) => {
    const i = par.indexOf(":");
    if (i < 1) return;
    const nombre = par.slice(0, i).trim(), token = par.slice(i + 1).trim();
    if (nombre && token.length >= 16) m.set(token, nombre);
  });
  return m;
}
