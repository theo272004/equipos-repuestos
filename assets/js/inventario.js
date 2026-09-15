// ============================================================================
//  INVENTARIO REAL DE ALMACEN (viene de MiPortal)
// ============================================================================
//  Lo llena scripts/portal-bridge, que corre en un PC de la planta: entra a
//  MiPortal, baja el Excel de existencias y lo deja en la coleccion
//  "inventario" de Firestore. Aqui solo se lee.
//
//  Por que no lo pide la app directamente al portal: esta pagina va por HTTPS y
//  el navegador prohibe que llame a http://miportal:9010 (contenido mixto), y
//  ademas el portal no permite CORS. Cualquier fetch desde aqui muere. Por eso
//  el portal empuja hacia Firestore y la app lee de Firestore.
//
//  DE DONDE SALE UNA EXISTENCIA, por orden de mando:
//    1. Lo escrito a mano en la tabla  -> coleccion "datos"     (gana siempre)
//    2. Lo que dice el portal          -> coleccion "inventario"
//    3. Lo que traia el Excel del plan -> assets/equipos.js (r.e)
//  El orden importa: si un tecnico cuenta las piezas en el estante y corrige el
//  numero, esa correccion no se puede perder en la siguiente pasada del puente.
//  Por eso el puente NO escribe nunca en "datos".
// ============================================================================

window.INVENTARIO = (function () {
  const cloud = window.CLOUD || { db: null, enabled: false };

  // Cache local para que la app abra con datos aunque arranque sin red.
  const CLAVE = "equipos-inventario-v1";
  let porCodigo = {};
  let estado = { actualizado: "", articulos: 0, conectado: false, error: "" };

  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || "{}");
    porCodigo = guardado.porCodigo || {};
    estado = { ...estado, ...(guardado.estado || {}) };
  } catch (e) {}

  function guardarLocal() {
    try { localStorage.setItem(CLAVE, JSON.stringify({ porCodigo, estado })); } catch (e) {}
  }

  // El codigo interno se normaliza igual que en el puente (lib/plan.mjs): el
  // Excel del portal a veces lo entrega como numero y el del plan como texto.
  function norm(v) {
    if (v === null || v === undefined) return "";
    const s = String(v).trim().toUpperCase().replace(/\s+/g, "").replace(/\.0+$/, "");
    return s === "N/A" || s === "NA" || s === "-" ? "" : s;
  }

  function de(cod) {
    const k = norm(cod);
    return k ? porCodigo[k] || null : null;
  }

  // Cuantos dias lleva el inventario sin refrescarse. La app lo usa para avisar:
  // una existencia de hace tres semanas se parece demasiado a la foto vieja del
  // Excel, y conviene que se note en pantalla en vez de darla por buena.
  function diasDesdeActualizacion() {
    if (!estado.actualizado) return null;
    const t = Date.parse(estado.actualizado);
    if (!Number.isFinite(t)) return null;
    return Math.floor((Date.now() - t) / 86400000);
  }

  function frescura() {
    const d = diasDesdeActualizacion();
    if (d === null) return { estado: "sin-datos", texto: "Sin inventario del portal" };
    if (d <= 1) return { estado: "fresco", texto: d === 0 ? "Inventario de hoy" : "Inventario de ayer" };
    if (d <= 7) return { estado: "fresco", texto: `Inventario de hace ${d} dias` };
    return { estado: "viejo", texto: `Inventario de hace ${d} dias` };
  }

  function repintar() {
    try {
      window.renderPlanIfVisible?.();
      window.renderFichaSiVisible?.();
    } catch (e) { console.error("[Inventario] repintando:", e); }
  }

  function suscribir() {
    if (!(cloud.enabled && cloud.db)) {
      console.log("[Inventario] Sin nube: se usa lo ultimo que quedo en este navegador.");
      return;
    }
    cloud.db.collection("inventario").onSnapshot({ includeMetadataChanges: true }, (snap) => {
      const nuevo = {};
      snap.forEach((doc) => {
        const v = doc.data() || {};
        const k = norm(v.cod || doc.id);
        if (k) nuevo[k] = { cod: k, desc: v.desc || "", exist: v.exist ?? null, ub: v.ub || "", pu: v.pu ?? null, alm: v.alm || "", min: v.min ?? null, consumo: v.consumo ?? null, actualizado: v.actualizado || "" };
      });
      porCodigo = nuevo;
      estado.articulos = Object.keys(nuevo).length;
      estado.conectado = !snap.metadata.fromCache;
      estado.error = "";
      guardarLocal();
      repintar();
    }, (err) => {
      estado.conectado = false;
      estado.error = err && err.code ? err.code : "error";
      console.error("[Inventario] onSnapshot:", err);
      repintar();
    });

    // Sello de la ultima pasada del puente: cuando corrio y cuantos articulos trajo.
    cloud.db.collection("inventario_meta").doc("estado").onSnapshot((doc) => {
      const v = doc.exists ? doc.data() : null;
      if (v) {
        estado.actualizado = v.actualizado || "";
        estado.origen = v.origen || "";
        guardarLocal();
        repintar();
      }
    }, (err) => console.error("[Inventario] meta:", err));
  }

  // Si hay inventario del portal cargado. Sirve para distinguir "el portal no
  // lista esta pieza" (probablemente agotada) de "todavia no hay portal".
  function cargado() { return Object.keys(porCodigo).length > 0; }

  return { de, norm, frescura, diasDesdeActualizacion, suscribir, get cargado() { return cargado(); }, get estado() { return estado; }, get todo() { return porCodigo; } };
})();
