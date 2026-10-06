// ============================================================================
//  REQUISICIONES DE COMPRA (reporte RE355 de MiPortal)
// ============================================================================
//  El RE356 dice lo que hay en el estante; el RE355 dice lo que ya está pedido
//  y todavía no llega. Con los dos, Almacén puede contestar lo que de verdad
//  importa al pedir: ¿hay?, ¿viene en camino?, ¿cuándo llega?, ¿se atrasó?, y
//  sobre todo ¿qué falta que nadie ha pedido?
//
//  Se carga igual que el inventario: en Almacén, "Cargar reporte", con el
//  Excel del RE355 (la app reconoce cuál de los dos es). Lo lee
//  assets/js/lector-requisiciones.mjs y aquí se guarda, compacto:
//    - en este navegador (localStorage), para que funcione sin señal
//    - en la nube, para que lo vea todo el taller. Va en la colección
//      "inventario_meta" (que las reglas ya permiten), en uno o dos documentos
//      de texto: "req-estado" con el sello y "req-0", "req-1"... con los datos.
//      Cada visita lee solo el sello (1 lectura) y baja los datos únicamente
//      cuando alguien cargó un RE355 nuevo.
//
//  Qué se guarda por código: las líneas abiertas (requisición, OC, estado,
//  fechas, cuánto falta por llegar, almacén y quién lo pidió) y el último
//  pedido del año, abierto o cerrado. No trae precios.
// ============================================================================

window.REQUISICIONES = (function () {
  const cloud = window.CLOUD || { db: null, enabled: false };
  const CLAVE = "equipos-requisiciones-v1";
  const CORTE = 500000;            // caracteres por documento de la nube (el límite es 1 MB)
  const hoy = () => new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);

  let porCodigo = {};
  let estado = { actualizado: "", archivo: "", por: "", lineas: 0, abiertas: 0, codigos: 0, desde: "", hasta: "", enNube: "", sello: "" };
  let nube = { estado: "", motivo: "" };

  // ---------------------------------------------------- formato compacto
  // { cod: [mrp, ultimo, abiertas] }, con ultimo = [fp, rq, oc, est, q, rec]
  // y cada abierta = [rq, oc, est, fp, fe, q, alm, usr]. Con nombres de campo
  // ocuparía el doble y no cabría en un documento de la nube.
  function comprimir(pc) {
    const out = {};
    Object.entries(pc).forEach(([cod, r]) => {
      const u = r.u ? [r.u.fp, r.u.rq, r.u.oc, r.u.est, r.u.q, r.u.rec] : 0;
      out[cod] = [r.mrp || "", u, (r.a || []).map((l) => [l.rq, l.oc, l.est, l.fp, l.fe, l.q, l.alm, l.usr])];
    });
    return out;
  }
  function expandir(c) {
    const out = {};
    Object.entries(c || {}).forEach(([cod, [mrp, u, a]]) => {
      out[cod] = {
        mrp: mrp || "",
        u: u ? { fp: u[0], rq: u[1], oc: u[2], est: u[3], q: u[4], rec: u[5] } : null,
        a: (a || []).map(([rq, oc, est, fp, fe, q, alm, usr]) => ({ rq, oc, est, fp, fe, q, alm, usr })),
      };
    });
    return out;
  }

  function leer() {
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (g && g.datos) { porCodigo = expandir(g.datos); estado = { ...estado, ...(g.estado || {}) }; }
    } catch (e) { /* sin copia: se espera a la nube o a que alguien cargue el RE355 */ }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify({ estado, datos: comprimir(porCodigo) })); return true; }
    catch (e) { console.warn("[Requisiciones] no cupo en el navegador:", e); return false; }
  }
  leer();

  function repintar() {
    try { window.almRenderSiVisible?.(); window.renderFichaSiVisible?.(); }
    catch (e) { console.error("[Requisiciones] repintando:", e); }
  }

  const norm = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).trim().toUpperCase().replace(/\s+/g, "").replace(/\.0+$/, "");
    return s === "N/A" || s === "NA" || s === "-" ? "" : s;
  };

  // Lo que importa de un código, ya calculado:
  //   camino:   unidades pedidas que aún no llegan
  //   atrasada: alguna línea abierta ya pasó su fecha de entrega
  //   sinOC:    está pedido, pero ninguna línea tiene orden de compra aprobada
  //   proxima:  la línea que llega primero
  //   ultimo:   el último pedido del año, abierto o cerrado
  function de(cod) {
    const r = porCodigo[norm(cod)];
    if (!r) return null;
    const h = hoy();
    const a = r.a || [];
    const camino = a.reduce((s, l) => s + (Number(l.q) || 0), 0);
    return {
      camino, lineas: a, mrp: r.mrp || "", ultimo: r.u || null,
      atrasada: a.some((l) => l.fe && l.fe < h),
      sinOC: a.length > 0 && !a.some((l) => /OC Aprob/i.test(l.est)),
      proxima: a.find((l) => l.fe) || a[0] || null,
    };
  }

  // Carga un RE355 ya leído (analizarRE355). Queda aquí y se manda a la nube.
  function cargar(res, meta = {}) {
    porCodigo = res.porCodigo || {};
    estado = { ...estado, ...res.resumen, actualizado: new Date().toISOString(), archivo: meta.archivo || "", por: window.NUCLEO ? window.NUCLEO.usuario.get() : "", enNube: "" };
    const cupo = guardar();
    repintar();
    return { ...res.resumen, guardado: cupo };
  }

  async function subirNube() {
    if (!(cloud.enabled && cloud.db)) { nube = { estado: "local" }; return { ok: false, motivo: "no hay nube configurada" }; }
    nube = { estado: "subiendo" };
    repintar();
    try {
      const texto = JSON.stringify(comprimir(porCodigo));
      const partes = [];
      for (let i = 0; i < texto.length; i += CORTE) partes.push(texto.slice(i, i + CORTE));
      const col = cloud.db.collection("inventario_meta");
      await Promise.all(partes.map((t, i) => col.doc(`req-${i}`).set({ t, i })));
      const sello = estado.actualizado;
      const { lineas, abiertas, codigos, desde, hasta, archivo, por } = estado;
      await col.doc("req-estado").set({ actualizado: sello, partes: partes.length, lineas, abiertas, codigos, desde, hasta, archivo, por });
      estado.enNube = sello; estado.sello = sello;
      guardar();
      nube = { estado: "ok" };
      repintar();
      return { ok: true, partes: partes.length };
    } catch (e) {
      console.error("[Requisiciones] subir:", e);
      nube = { estado: "error", motivo: e && e.code === "permission-denied" ? "la nube no deja escribir (revisa las reglas en Conexión y ajustes)" : e && e.code === "resource-exhausted" ? "se acabó la cuota diaria de Firebase" : (e && e.message) || "error" };
      repintar();
      return { ok: false, motivo: nube.motivo };
    }
  }

  // Solo se baja cuando alguien cargó un RE355 más nuevo que el de aquí.
  let bajando = false;
  function bajar(meta) {
    if (bajando) return;
    bajando = true;
    const col = cloud.db.collection("inventario_meta");
    const n = Math.max(1, Number(meta.partes) || 1);
    Promise.all(Array.from({ length: n }, (_, i) => col.doc(`req-${i}`).get()))
      .then((docs) => {
        const texto = docs.map((d) => (d.exists ? d.data().t || "" : "")).join("");
        porCodigo = expandir(JSON.parse(texto));
        const { lineas = 0, abiertas = 0, codigos = 0, desde = "", hasta = "", archivo = "", por = "" } = meta;
        estado = { ...estado, lineas, abiertas, codigos, desde, hasta, archivo, por, actualizado: meta.actualizado, enNube: meta.actualizado, sello: meta.actualizado };
        guardar();
        repintar();
      })
      .catch((e) => console.error("[Requisiciones] leer:", e))
      .finally(() => { bajando = false; });
  }

  function suscribir() {
    if (!(cloud.enabled && cloud.db)) return;
    cloud.db.collection("inventario_meta").doc("req-estado").onSnapshot((doc) => {
      const v = doc.exists ? doc.data() : null;
      if (!v || !v.actualizado) return;
      // Manda el más reciente: si aquí se cargó uno después, no se pisa.
      if (v.actualizado === estado.sello || v.actualizado <= (estado.actualizado || "")) return;
      bajar(v);
    }, (e) => console.warn("[Requisiciones] sello:", e && e.code));
  }

  // De cuándo es la información, para decirlo en Almacén.
  function frescura() {
    const t = Date.parse(estado.actualizado);
    if (!Number.isFinite(t)) return { estado: "sin-datos", texto: "" };
    const d = Math.floor((Date.now() - t) / 86400000);
    return { estado: d <= 7 ? "fresco" : "viejo", texto: d === 0 ? "de hoy" : d === 1 ? "de ayer" : `de hace ${d} días` };
  }

  return {
    de, cargar, subirNube, suscribir, frescura, norm,
    get cargado() { return Object.keys(porCodigo).length > 0; },
    get estado() { return { ...estado }; },
    get nube() { return { ...nube }; },
    get todo() { return porCodigo; },
  };
})();
