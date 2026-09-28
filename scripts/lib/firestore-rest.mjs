// Firestore por REST para los scripts del bot (GitHub Actions).
// Convierte en los dos sentidos los valores de Firestore (mapas, listas,
// números…) y, si hay "clave del taller" (FIREBASE_EMAIL / FIREBASE_PASSWORD),
// inicia sesión para trabajar con las reglas protegidas.

export function aValor(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(aValor) } };
  if (typeof v === "object") return { mapValue: { fields: aCampos(v) } };
  return { stringValue: String(v) };
}
export function aCampos(o) {
  const f = {};
  for (const [k, v] of Object.entries(o || {})) if (v !== undefined) f[k] = aValor(v);
  return f;
}
export function deValor(v) {
  if (!v || typeof v !== "object") return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(deValor);
  if ("mapValue" in v) return deCampos(v.mapValue.fields || {});
  return null;
}
export function deCampos(f) {
  const o = {};
  for (const [k, v] of Object.entries(f || {})) o[k] = deValor(v);
  return o;
}

export function crearCliente({ proyecto, apiKey, email, password }) {
  const BASE = `https://firestore.googleapis.com/v1/projects/${proyecto}/databases/(default)/documents`;
  let token = null;
  let intentoAuth = false;
  const estado = {}; // coleccion -> "ok" | "denegado" | "error"

  async function autenticar() {
    if (intentoAuth || !email || !password) return;
    intentoAuth = true;
    try {
      const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      });
      const j = await r.json();
      if (j.idToken) token = j.idToken;
      else console.error("Firebase Auth:", j.error && j.error.message);
    } catch (e) { console.error("Firebase Auth:", e.message); }
  }
  const cab = () => ({ "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) });
  const url = (ruta, extra = "") => `${BASE}/${ruta}?key=${apiKey}${extra}`;

  async function listar(col) {
    await autenticar();
    const out = [];
    let pag = "";
    do {
      const r = await fetch(url(col, `&pageSize=300${pag ? "&pageToken=" + encodeURIComponent(pag) : ""}`), { headers: cab() });
      if (!r.ok) {
        estado[col] = r.status === 403 ? "denegado" : "error";
        if (r.status !== 403) console.error(`Firestore GET ${col}:`, r.status, (await r.text()).slice(0, 200));
        return out;
      }
      const j = await r.json();
      for (const d of j.documents || []) out.push({ ...deCampos(d.fields), id: (deCampos(d.fields).id) || d.name.split("/").pop(), _doc: d.name.split("/").pop() });
      pag = j.nextPageToken || "";
    } while (pag);
    estado[col] = "ok";
    return out;
  }

  async function obtener(col, id) {
    await autenticar();
    const r = await fetch(url(`${col}/${encodeURIComponent(id)}`), { headers: cab() });
    if (r.status === 404) { estado[col] = "ok"; return null; }
    if (!r.ok) { estado[col] = r.status === 403 ? "denegado" : "error"; return undefined; }
    estado[col] = "ok";
    const j = await r.json();
    return deCampos(j.fields);
  }

  // Crea o reemplaza el documento entero
  async function guardar(col, id, datos) {
    await autenticar();
    const r = await fetch(url(`${col}/${encodeURIComponent(id)}`), { method: "PATCH", headers: cab(), body: JSON.stringify({ fields: aCampos(datos) }) });
    if (!r.ok) { estado[col] = r.status === 403 ? "denegado" : "error"; console.error(`Firestore guardar ${col}/${id}:`, r.status, (await r.text()).slice(0, 200)); return false; }
    estado[col] = "ok";
    return true;
  }

  // Cambia solo algunos campos
  async function actualizar(col, id, cambios) {
    await autenticar();
    const mask = Object.keys(cambios).map((k) => `&updateMask.fieldPaths=${encodeURIComponent(k)}`).join("");
    const r = await fetch(url(`${col}/${encodeURIComponent(id)}`, mask), { method: "PATCH", headers: cab(), body: JSON.stringify({ fields: aCampos(cambios) }) });
    if (!r.ok) { estado[col] = r.status === 403 ? "denegado" : "error"; console.error(`Firestore actualizar ${col}/${id}:`, r.status, (await r.text()).slice(0, 200)); return false; }
    estado[col] = "ok";
    return true;
  }

  // Consulta con un filtro de igualdad: lee solo lo que coincide (cada
  // documento leído cuenta en la cuota diaria de Firebase).
  async function consultar(col, campo, valor, limite = 50) {
    await autenticar();
    const r = await fetch(`${BASE}:runQuery?key=${apiKey}`, {
      method: "POST",
      headers: cab(),
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: col }], where: { fieldFilter: { field: { fieldPath: campo }, op: "EQUAL", value: aValor(valor) } }, limit: limite } }),
    });
    if (!r.ok) { estado[col] = r.status === 403 ? "denegado" : "error"; return []; }
    estado[col] = "ok";
    const j = await r.json();
    return (j || []).filter((x) => x.document).map((x) => ({ ...deCampos(x.document.fields), _doc: x.document.name.split("/").pop() }));
  }

  return { listar, obtener, guardar, actualizar, consultar, estado };
}
