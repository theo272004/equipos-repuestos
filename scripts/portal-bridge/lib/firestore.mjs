// Sube el inventario a Firestore por REST, igual que scripts/send-reminders.mjs.
// Se escribe en su propia coleccion "inventario", una ficha por codigo interno,
// y NO se toca "datos": ahi esta lo que la gente corrige a mano en la tabla y
// eso siempre le gana al portal (ver assets/js/inventario.js).

const LOTE = 400; // el limite de un commit son 500 escrituras

export class Firestore {
  constructor({ projectId, apiKey }) {
    if (!projectId) throw new Error("Falta el projectId de Firebase.");
    this.projectId = projectId;
    this.apiKey = apiKey || "";
    this.base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  }

  get qs() { return this.apiKey ? `key=${encodeURIComponent(this.apiKey)}` : ""; }

  async #pedir(url, opciones) {
    const r = await fetch(url, opciones);
    if (!r.ok) {
      const cuerpo = await r.text().catch(() => "");
      throw new Error(`Firestore respondio ${r.status}: ${cuerpo.slice(0, 400)}`);
    }
    return r.json();
  }

  // Trae la coleccion entera, pagina a pagina.
  async leerColeccion(coleccion) {
    const docs = new Map();
    let token = "";
    do {
      const url = `${this.base}/${coleccion}?pageSize=300&${this.qs}${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`;
      const j = await this.#pedir(url);
      for (const d of j.documents || []) docs.set(d.name.split("/").pop(), plano(d.fields || {}));
      token = j.nextPageToken || "";
    } while (token);
    return docs;
  }

  async escribir(writes) {
    let hechas = 0;
    for (let i = 0; i < writes.length; i += LOTE) {
      const lote = writes.slice(i, i + LOTE);
      await this.#pedir(`${this.base}:commit?${this.qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writes: lote }),
      });
      hechas += lote.length;
      process.stdout.write(`   subidas ${hechas}/${writes.length}\r`);
    }
    if (writes.length) process.stdout.write(" ".repeat(40) + "\r");
    return hechas;
  }

  upsert(coleccion, id, datos) {
    const fields = typado(datos);
    return {
      update: { name: `projects/${this.projectId}/databases/(default)/documents/${coleccion}/${encodeURIComponent(id)}`, fields },
      updateMask: { fieldPaths: Object.keys(fields) },
    };
  }

  borrar(coleccion, id) {
    return { delete: `projects/${this.projectId}/databases/(default)/documents/${coleccion}/${encodeURIComponent(id)}` };
  }
}

function typado(o) {
  const f = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === null || v === undefined) f[k] = { nullValue: null };
    else if (typeof v === "number") f[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (typeof v === "boolean") f[k] = { booleanValue: v };
    else f[k] = { stringValue: String(v) };
  }
  return f;
}

function plano(fields) {
  const o = {};
  for (const [k, v] of Object.entries(fields)) {
    if ("integerValue" in v) o[k] = Number(v.integerValue);
    else if ("doubleValue" in v) o[k] = Number(v.doubleValue);
    else if ("booleanValue" in v) o[k] = v.booleanValue;
    else if ("nullValue" in v) o[k] = null;
    else o[k] = v.stringValue ?? "";
  }
  return o;
}
