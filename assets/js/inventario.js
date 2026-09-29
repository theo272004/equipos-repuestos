// ============================================================================
//  INVENTARIO REAL DE ALMACEN (reporte RE356 de MiPortal)
// ============================================================================
//  Llega por dos caminos:
//    - La nube: scripts/portal-bridge corre en un PC de planta, baja el RE356 y
//      lo deja en la coleccion "inventario" de Firestore. Lo ve todo el taller.
//    - Un archivo: en la vista Almacen se puede cargar el RE356 bajado a mano.
//      Se lee en el navegador y se queda SOLO en este equipo; no se sube nada.
//  Si hay de los dos, manda el mas reciente.
//
//  Por que la app no se lo pide directamente al portal: esta pagina va por
//  HTTPS y el navegador prohibe llamar a http://miportal:9010 (contenido
//  mixto), y ademas el portal no permite CORS. Por eso el portal empuja.
//
//  DE DONDE SALE UNA EXISTENCIA, por orden de mando (ver existenciaEfectiva):
//    1. Lo escrito a mano en la tabla  -> coleccion "datos"     (gana siempre)
//    2. Lo que dice el portal          -> este modulo
//    3. Lo que traia el Excel del plan -> assets/equipos.js (r.e)
//  El puente NO escribe nunca en "datos": una correccion hecha contando piezas
//  en el estante no se puede perder en la siguiente pasada.
// ============================================================================

window.INVENTARIO = (function () {
  const cloud = window.CLOUD || { db: null, enabled: false };

  const CLAVE_NUBE = "equipos-inventario-v1";
  const CLAVE_LOCAL = "equipos-inventario-local-v1";
  const vacio = () => ({ porCodigo: {}, estado: { actualizado: "", articulos: 0, origen: "" } });

  let nube = vacio();
  let local = vacio();
  let conexion = { conectado: false, error: "" };

  function leer(clave) {
    try { const g = JSON.parse(localStorage.getItem(clave) || "{}"); return { porCodigo: g.porCodigo || {}, estado: { ...vacio().estado, ...(g.estado || {}) } }; }
    catch (e) { return vacio(); }
  }
  function guardar(clave, dato) {
    try { localStorage.setItem(clave, JSON.stringify(dato)); return true; }
    catch (e) { console.warn("[Inventario] no cupo en el almacenamiento del navegador:", e); return false; }
  }
  nube = leer(CLAVE_NUBE);
  local = leer(CLAVE_LOCAL);

  // El codigo interno se normaliza igual que en el lector (lector-inventario.mjs):
  // el Excel del portal a veces lo entrega como numero y el plan como texto.
  function norm(v) {
    if (v === null || v === undefined) return "";
    const s = String(v).trim().toUpperCase().replace(/\s+/g, "").replace(/\.0+$/, "");
    return s === "N/A" || s === "NA" || s === "-" ? "" : s;
  }

  function sitiosDe(v) {
    if (Array.isArray(v)) return v;
    try { const a = JSON.parse(v || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }

  function registro(v, cod) {
    return {
      cod, desc: v.desc || "", exist: v.exist ?? null, ub: v.ub || "", alm: v.alm || "", um: v.um || "",
      min: v.min ?? null, consumo: v.consumo ?? null, pu: v.pu ?? null,
      sitios: sitiosDe(v.sitios), actualizado: v.actualizado || "",
    };
  }

  // Manda el conjunto mas reciente de los dos que haya.
  function activo() {
    const tN = Date.parse(nube.estado.actualizado) || 0;
    const tL = Date.parse(local.estado.actualizado) || 0;
    const hayN = Object.keys(nube.porCodigo).length > 0;
    const hayL = Object.keys(local.porCodigo).length > 0;
    if (hayL && (!hayN || tL > tN)) return local;
    return nube;
  }

  function de(cod) {
    const k = norm(cod);
    return k ? activo().porCodigo[k] || null : null;
  }

  function diasDesdeActualizacion() {
    const t = Date.parse(activo().estado.actualizado);
    return Number.isFinite(t) ? Math.floor((Date.now() - t) / 86400000) : null;
  }

  // Una existencia de hace tres semanas se parece demasiado a la foto vieja del
  // Excel: la app lo avisa en vez de darla por buena.
  function frescura() {
    const d = diasDesdeActualizacion();
    if (d === null) return { estado: "sin-datos", texto: "Sin inventario del portal" };
    const cuando = d === 0 ? "de hoy" : d === 1 ? "de ayer" : `de hace ${d} dias`;
    const donde = activo() === local ? " (archivo cargado en este equipo)" : "";
    return { estado: d <= 7 ? "fresco" : "viejo", texto: `Inventario ${cuando}${donde}` };
  }

  function repintar() {
    try {
      window.renderPlanIfVisible?.();
      window.renderFichaSiVisible?.();
      window.almRenderSiVisible?.();
    } catch (e) { console.error("[Inventario] repintando:", e); }
  }

  // Carga un RE356 ya leido (filas de lector-inventario.mjs). Solo local.
  function cargarLocal(filas, meta = {}) {
    const porCodigo = {};
    const ahora = new Date().toISOString();
    filas.forEach((f) => { const k = norm(f.cod); if (k) porCodigo[k] = registro({ ...f, actualizado: ahora }, k); });
    local = { porCodigo, estado: { actualizado: ahora, articulos: Object.keys(porCodigo).length, origen: "archivo", archivo: meta.archivo || "" } };
    const cupo = guardar(CLAVE_LOCAL, local);
    repintar();
    return { articulos: local.estado.articulos, guardado: cupo };
  }

  // Sube a la nube un RE356 cargado en este equipo, para que lo vea todo el
  // taller (lo mismo que hace el puente de MiPortal). Solo escribe los códigos
  // que cambiaron y marca en 0 los que el reporte ya no lista (agotados).
  async function subirNube(filas) {
    if (!(cloud.enabled && cloud.db)) return { ok: false, motivo: "no hay nube configurada" };
    const ahora = new Date().toISOString();
    const quien = window.NUCLEO ? window.NUCLEO.usuario.get() : "";
    const cambios = [];
    const vistos = new Set();
    filas.forEach((f) => {
      const k = norm(f.cod);
      if (!k || vistos.has(k)) return;
      vistos.add(k);
      const prev = nube.porCodigo[k];
      const reg = { cod: k, desc: f.desc || "", exist: f.exist ?? null, ub: f.ub || "", alm: f.alm || "", um: f.um || "", min: f.min ?? null, consumo: f.consumo ?? null, pu: f.pu ?? null, sitios: JSON.stringify(f.sitios || []), actualizado: ahora, fuente: "app", agotado: false };
      if (!prev || prev.exist !== reg.exist || prev.pu !== reg.pu || prev.ub !== reg.ub || prev.min !== reg.min) cambios.push(reg);
    });
    Object.values(nube.porCodigo).forEach((a) => {
      if (!vistos.has(a.cod) && Number(a.exist) > 0) cambios.push({ cod: a.cod, exist: 0, actualizado: ahora, fuente: "app", agotado: true });
    });
    try {
      for (let i = 0; i < cambios.length; i += 400) {
        const b = cloud.db.batch();
        cambios.slice(i, i + 400).forEach((c) => b.set(cloud.db.collection("inventario").doc(c.cod), c, { merge: true }));
        await b.commit();
      }
      await cloud.db.collection("inventario_meta").doc("estado").set({ actualizado: ahora, articulos: vistos.size, origen: "app", por: quien }, { merge: true });
      return { ok: true, cambios: cambios.length };
    } catch (e) {
      console.error("[Inventario] subir:", e);
      return { ok: false, motivo: e && e.code === "permission-denied" ? "la nube no deja escribir el inventario (revisa las reglas en Conexión y ajustes)" : (e && e.message) || "error" };
    }
  }

  function olvidarLocal() {
    local = vacio();
    try { localStorage.removeItem(CLAVE_LOCAL); } catch (e) {}
    repintar();
  }

  // El inventario tiene más de 5.000 artículos. Antes se escuchaba la colección
  // entera en cada visita: 5.000 lecturas por persona y por recarga, y el plan
  // gratuito de Firebase da 50.000 al día. Ahora se escucha solo el sello de
  // la última carga (1 lectura) y la colección se baja completa únicamente
  // cuando ese sello cambia; mientras tanto se usa la copia de este navegador.
  //
  // Y cuando cambia, no se baja entera: cada artículo guarda en "actualizado"
  // cuándo se subió, así que con copia aquí se piden solo los que cambiaron
  // después de la carga anterior (una carga del RE356 suele mover unos cientos,
  // no 5.000). Los agotados no se borran de la nube: quedan con existencia 0,
  // para que esta consulta también se entere de ellos.
  let bajando = false;
  function bajarColeccion(sello) {
    if (bajando) return;
    bajando = true;
    const previo = nube.estado.sello || "";
    const hayCopia = Object.keys(nube.porCodigo).length > 0;
    const soloCambios = hayCopia && previo && sello && sello > previo;
    const col = cloud.db.collection("inventario");
    (soloCambios ? col.where("actualizado", ">", previo).get() : col.get()).then((snap) => {
      const porCodigo = soloCambios ? { ...nube.porCodigo } : {};
      snap.forEach((doc) => {
        const v = doc.data() || {};
        const k = norm(v.cod || doc.id);
        if (!k) return;
        const r = registro({ ...(porCodigo[k] || {}), ...v }, k);
        // Un agotado conserva dónde estaba, pero ya sin nada en ningún estante
        if (Number(v.exist) === 0) r.sitios = r.sitios.map((s) => ({ ...s, exist: 0 }));
        porCodigo[k] = r;
      });
      nube.porCodigo = porCodigo;
      nube.estado.articulos = Object.keys(porCodigo).length;
      nube.estado.origen = "miportal";
      nube.estado.actualizado = sello || nube.estado.actualizado;
      nube.estado.sello = sello || "";
      conexion = { conectado: true, error: "" };
      guardar(CLAVE_NUBE, nube);
      window.NUCLEO?.marcar("inventario", "ok");
      repintar();
    }).catch((err) => {
      conexion = { conectado: false, error: err && err.code ? err.code : "error" };
      console.error("[Inventario] leer:", err);
      repintar();
    }).finally(() => { bajando = false; });
  }

  function suscribir() {
    if (!(cloud.enabled && cloud.db)) {
      console.log("[Inventario] Sin nube: se usa lo ultimo que quedo en este navegador.");
      return;
    }
    // Sello de la última carga (puente de MiPortal o archivo compartido desde la app)
    cloud.db.collection("inventario_meta").doc("estado").onSnapshot((doc) => {
      const v = doc.exists ? doc.data() : null;
      const sello = (v && v.actualizado) || "";
      const hayCopia = Object.keys(nube.porCodigo).length > 0;
      conexion = { conectado: true, error: "" };
      if (!hayCopia || (sello && sello !== nube.estado.sello)) bajarColeccion(sello);
      else repintar();
    }, (err) => {
      conexion = { conectado: false, error: err && err.code ? err.code : "error" };
      console.error("[Inventario] meta:", err);
      // Sin sello no se sabe si cambió: solo se baja si este navegador no tiene copia
      if (!Object.keys(nube.porCodigo).length && err && err.code !== "resource-exhausted") bajarColeccion("");
      repintar();
    });
  }

  return {
    de, norm, frescura, diasDesdeActualizacion, suscribir, cargarLocal, olvidarLocal, subirNube,
    // Hay inventario cargado: distingue "el portal no lista esta pieza"
    // (probablemente agotada) de "todavia no hay portal".
    get cargado() { return Object.keys(activo().porCodigo).length > 0; },
    get estado() { return { ...activo().estado, ...conexion, articulos: Object.keys(activo().porCodigo).length }; },
    get todo() { return activo().porCodigo; },
    get fuente() { const a = activo(); return Object.keys(a.porCodigo).length ? (a === local ? "archivo" : "nube") : ""; },
  };
})();
