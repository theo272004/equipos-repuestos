// ============================================================================
//  NÚCLEO COMPARTIDO de las vistas nuevas (Inicio, Pendientes, Presupuesto,
//  Ajustes) y de lo que antes se repetía en cada módulo:
//
//    - Fechas y horas de Bogotá, el turno en curso y el formato en español.
//    - Pesos colombianos, números y porcentajes.
//    - Quién usa la app en este equipo (su nombre queda en cada registro).
//    - Una colección de Firestore con respaldo en el navegador: si la nube no
//      está o sus reglas no dejan, lo escrito se guarda aquí y se sube después.
//    - El estado de permisos de cada colección, para avisar con claridad
//      cuando la nube rechaza algo (antes solo quedaba en la consola).
// ============================================================================

(function () {
  const CO = 5 * 3600e3; // Colombia: UTC-5 fijo, sin horario de verano
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const MESES_C = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const plano = (v) => String(v ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  const uid = (p = "x") => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ------------------------------------------------------------------ tiempo
  const ahoraCO = () => new Date(Date.now() - CO);
  const hoy = () => ahoraCO().toISOString().slice(0, 10);
  const horaCO = () => ahoraCO().getUTCHours();
  const sumaDias = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const diaCO = (iso) => { const t = Date.parse(iso || ""); return Number.isFinite(t) ? new Date(t - CO).toISOString().slice(0, 10) : ""; };
  const horaDe = (iso) => { const t = Date.parse(iso || ""); return Number.isFinite(t) ? new Date(t - CO).toISOString().slice(11, 16) : ""; };
  const diasEntre = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);

  // El turno que está corriendo: de día de 8:00 a 20:00; el de noche empieza a
  // las 20:00 y termina a las 8:00 del día siguiente, y lleva la fecha en que empezó.
  function turnoEnCurso() {
    const h = horaCO();
    if (h >= 8 && h < 20) return { fecha: hoy(), turno: "Día", clave: "dia" };
    if (h >= 20) return { fecha: hoy(), turno: "Noche", clave: "noche" };
    return { fecha: sumaDias(hoy(), -1), turno: "Noche", clave: "noche" };
  }
  // El último turno que ya terminó (el que debería tener su reporte).
  function turnoAnterior() {
    const t = turnoEnCurso();
    if (t.turno === "Día") return { fecha: sumaDias(t.fecha, -1), turno: "Noche", clave: "noche" };
    return { fecha: t.fecha, turno: "Día", clave: "dia" };
  }
  function saludo() {
    const h = horaCO();
    return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  }

  // ----------------------------------------------------------------- formato
  const fmt = {
    fecha(iso) {
      const [a, m, d] = String(iso || "").split("-").map(Number);
      if (!a || !m || !d) return iso || "";
      return `${DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${d} de ${MESES[m - 1]}`;
    },
    fechaLarga(iso) {
      const [a] = String(iso || "").split("-");
      return `${fmt.fecha(iso)} de ${a}`;
    },
    corta(iso) {
      const [, m, d] = String(iso || "").split("-").map(Number);
      return m && d ? `${d} ${MESES_C[m - 1]}` : iso || "";
    },
    mes(ym) {
      const [a, m] = String(ym || "").split("-").map(Number);
      return m ? `${MESES[m - 1]} ${a}` : ym || "";
    },
    mesCorto(ym) {
      const [, m] = String(ym || "").split("-").map(Number);
      return m ? MESES_C[m - 1] : "";
    },
    num(n, dec = 0) {
      if (n === null || n === undefined || n === "" || !Number.isFinite(Number(n))) return "—";
      return Number(n).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    },
    // $ 1.234.567 — en tablero se usa la forma corta: $ 12,4 M
    dinero(n) {
      if (n === null || n === undefined || !Number.isFinite(Number(n))) return "—";
      return "$ " + Math.round(Number(n)).toLocaleString("es-CO");
    },
    dineroCorto(n) {
      const v = Number(n) || 0;
      const a = Math.abs(v);
      if (a >= 1e9) return `$ ${(v / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mil M`;
      if (a >= 1e6) return `$ ${(v / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`;
      if (a >= 1e3) return `$ ${(v / 1e3).toLocaleString("es-CO", { maximumFractionDigits: 0 })} mil`;
      return `$ ${Math.round(v).toLocaleString("es-CO")}`;
    },
    pct(x, dec = 0) {
      if (!Number.isFinite(x)) return "—";
      return (x * 100).toLocaleString("es-CO", { maximumFractionDigits: dec, minimumFractionDigits: dec }) + " %";
    },
    // "hace 3 h", "ayer", "hace 5 días"
    relativo(iso) {
      const t = Date.parse(iso || "");
      if (!Number.isFinite(t)) return "";
      const s = Math.round((Date.now() - t) / 1000);
      if (s < 60) return "hace un momento";
      if (s < 3600) return `hace ${Math.round(s / 60)} min`;
      if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
      const d = Math.round(s / 86400);
      return d === 1 ? "ayer" : d < 31 ? `hace ${d} días` : `hace ${Math.round(d / 30)} ${Math.round(d / 30) === 1 ? "mes" : "meses"}`;
    },
    dias(n) { return n === 0 ? "hoy" : n === 1 ? "1 día" : `${n} días`; },
    plural(n, uno, varios) { return `${fmt.num(n)} ${n === 1 ? uno : varios || uno + "s"}`; },
  };

  // --------------------------------------------------------------- personas
  const K_USUARIO = "fc-usuario";
  const usuario = {
    get() {
      try { return localStorage.getItem(K_USUARIO) || localStorage.getItem("mtto-registrado-por") || ""; } catch (e) { return ""; }
    },
    set(n) {
      try { localStorage.setItem(K_USUARIO, String(n || "").trim()); } catch (e) {}
      emitir("usuario");
    },
  };
  function iniciales(n) {
    const p = String(n || "").trim().split(/\s+/).filter(Boolean);
    return ((p[0] || "")[0] || "") + ((p[1] || "")[0] || "") || "··";
  }
  // Mismo color para la misma persona en toda la app
  function tono(n) {
    let h = 0;
    for (const c of String(n || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return (h % 6) + 1;
  }
  // "Diego Temporal" / "Sergio Vergara Electricista" -> "Diego", "Sergio Vergara"
  function nombreCorto(n) {
    const p = String(n || "").replace(/\+?\d[\d\s]{6,}/g, "").trim().split(/\s+/).filter((x) => !/^(temporal|electricista|mec[aá]nico|mtto)$/i.test(x));
    return p.slice(0, 2).join(" ") || String(n || "");
  }

  // ------------------------------------------------------------- eventos
  const oyentes = {};
  function on(tema, f) { (oyentes[tema] = oyentes[tema] || new Set()).add(f); return () => oyentes[tema].delete(f); }
  function emitir(tema, dato) { (oyentes[tema] || []).forEach((f) => { try { f(dato); } catch (e) { console.error("[Núcleo]", tema, e); } }); }

  // ----------------------------------------------------------------- nube
  const nube = () => { const c = window.CLOUD; return c && c.enabled && c.db ? c : null; };
  // Estado de cada colección: "ok" | "denegado" | "error" | "sin-nube"
  const permisos = {};
  function marcar(col, estado, detalle) {
    const antes = permisos[col] && permisos[col].estado;
    permisos[col] = { estado, detalle: detalle || "", t: Date.now() };
    if (antes !== estado) emitir("permisos", { col, estado });
  }
  const esDenegado = (e) => e && (e.code === "permission-denied" || /permission/i.test(String(e.message || "")));

  // Colección con respaldo en el navegador. Borrar es marcar "borrado": nada se
  // pierde por un toque equivocado y la nube no necesita permiso de borrar.
  function coleccion(nombre, opciones = {}) {
    const K = opciones.local || `fc-col-${nombre}-v1`;
    let docs = leerLocal(K);
    let conectado = false;
    const avisos = new Set();

    function leerLocal(k) { try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch (e) { return {}; } }
    function persistir() { try { localStorage.setItem(K, JSON.stringify(docs)); } catch (e) { console.warn("[Núcleo] sin espacio para", nombre); } }
    function avisar() { avisos.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); emitir(nombre); }
    const limpio = (d) => { const { _pend, ...r } = d; return JSON.parse(JSON.stringify(r)); };

    function subir(d) {
      const c = nube();
      if (!c) { marcar(nombre, "sin-nube"); return Promise.resolve(false); }
      return c.db.collection(nombre).doc(d.id).set(limpio(d))
        .then(() => {
          if (docs[d.id] && docs[d.id].updatedAt === d.updatedAt) { delete docs[d.id]._pend; persistir(); }
          marcar(nombre, "ok");
          return true;
        })
        .catch((e) => { marcar(nombre, esDenegado(e) ? "denegado" : "error", e && e.code); console.warn(`[Núcleo] ${nombre}:`, e && e.code); return false; });
    }
    function guardar(d) {
      const doc = { ...d, id: d.id || uid(opciones.prefijo || "d"), updatedAt: new Date().toISOString() };
      if (!doc.createdAt) doc.createdAt = doc.updatedAt;
      if (!doc.por) doc.por = usuario.get();
      doc._pend = 1;
      docs[doc.id] = doc;
      persistir();
      avisar();
      subir(doc);
      return doc;
    }
    // Muchos documentos de una vez (una importación): un solo aviso y la nube
    // por lotes de 400, que es lo que Firestore acepta en una escritura.
    function guardarVarios(lista) {
      const ahora = new Date().toISOString();
      const quien = usuario.get();
      const nuevos = lista.map((d) => ({ ...d, id: d.id || uid(opciones.prefijo || "d"), updatedAt: ahora, createdAt: d.createdAt || ahora, por: d.por || quien, _pend: 1 }));
      nuevos.forEach((d) => { docs[d.id] = d; });
      persistir();
      avisar();
      const c = nube();
      if (!c) { marcar(nombre, "sin-nube"); return Promise.resolve(nuevos); }
      const lotes = [];
      for (let i = 0; i < nuevos.length; i += 400) lotes.push(nuevos.slice(i, i + 400));
      return lotes.reduce((p, lote) => p.then(() => {
        const b = c.db.batch();
        lote.forEach((d) => b.set(c.db.collection(nombre).doc(d.id), limpio(d)));
        return b.commit().then(() => {
          lote.forEach((d) => { if (docs[d.id] && docs[d.id].updatedAt === d.updatedAt) delete docs[d.id]._pend; });
          persistir();
          marcar(nombre, "ok");
        });
      }), Promise.resolve()).catch((e) => { marcar(nombre, esDenegado(e) ? "denegado" : "error", e && e.code); }).then(() => nuevos);
    }
    function actualizar(id, cambios) {
      const previo = docs[id] || { id };
      return guardar({ ...previo, ...cambios, id });
    }
    function borrar(id) { if (docs[id]) actualizar(id, { borrado: true }); }
    function lista() { return Object.values(docs).filter((d) => d && !d.borrado); }
    function get(id) { const d = docs[id]; return d && !d.borrado ? d : null; }

    function suscribir() {
      const c = nube();
      if (!c) { marcar(nombre, "sin-nube"); return; }
      let q = c.db.collection(nombre);
      c.db && q.onSnapshot({ includeMetadataChanges: true }, (snap) => {
        conectado = !snap.metadata.fromCache;
        const m = {};
        snap.forEach((s) => { const v = s.data() || {}; v.id = v.id || s.id; m[v.id] = v; });
        // Lo que este equipo guardó y la nube aún no confirma se conserva y se reintenta
        Object.values(docs).forEach((d) => {
          if (!d || !d._pend) return;
          const r = m[d.id];
          if (!r || (r.updatedAt || "") < (d.updatedAt || "")) { m[d.id] = d; if (conectado) subir(d); }
        });
        docs = m;
        persistir();
        if (conectado) marcar(nombre, "ok");
        avisar();
      }, (e) => {
        conectado = false;
        marcar(nombre, esDenegado(e) ? "denegado" : "error", e && e.code);
        console.warn(`[Núcleo] leer ${nombre}:`, e && e.code);
        avisar();
      });
    }

    return {
      nombre, guardar, guardarVarios, actualizar, borrar, lista, get, suscribir,
      alCambiar(f) { avisos.add(f); return () => avisos.delete(f); },
      get conectado() { return conectado; },
      get pendientesDeSubir() { return Object.values(docs).filter((d) => d && d._pend).length; },
    };
  }

  // Prueba de lectura de una colección: sirve para el diagnóstico de Ajustes
  // y para el indicador de conexión de la barra superior.
  function probar(col) {
    const c = nube();
    if (!c) { marcar(col, "sin-nube"); return Promise.resolve("sin-nube"); }
    // Directo al servidor: con la copia local, un get() normal respondería
    // desde el celular aunque la nube rechace la colección.
    return c.db.collection(col).limit(1).get({ source: "server" })
      .then(() => { marcar(col, "ok"); return "ok"; })
      .catch((e) => { const est = esDenegado(e) ? "denegado" : "error"; marcar(col, est, e && e.code); return est; });
  }

  // Librerías que solo hacen falta a veces (leer o escribir un Excel): se
  // descargan la primera vez que se usan y quedan para el resto de la visita.
  const cargando = {};
  function cargarScript(url, global) {
    if (window[global]) return Promise.resolve(window[global]);
    if (!cargando[url]) {
      cargando[url] = new Promise((ok, mal) => {
        const s = document.createElement("script");
        s.src = url;
        s.async = true;
        s.onload = () => (window[global] ? ok(window[global]) : mal(new Error("No se cargó " + global)));
        s.onerror = () => { delete cargando[url]; mal(new Error("No se pudo descargar la librería. Hace falta internet la primera vez.")); };
        document.head.appendChild(s);
      });
    }
    return cargando[url];
  }
  const XLSX = () => cargarScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", "XLSX");

  // Descarga un archivo generado en el navegador
  function descargar(nombre, contenido, tipo) {
    const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  // Colecciones que usa la app y para qué: lo lee Ajustes y lo repite
  // firestore.rules. Si se añade una colección nueva, va aquí y en las reglas.
  const COLECCIONES = [
    { id: "tareas", uso: "Tareas y recordatorios (también las crea el bot)" },
    { id: "inspecciones", uso: "Inspecciones de planta" },
    { id: "cambios", uso: "Historial de cambios de repuestos del plan" },
    { id: "datos", uso: "Código interno y existencias corregidas a mano" },
    { id: "inventario", uso: "Existencias y precios del RE356 (MiPortal)" },
    { id: "inventario_meta", uso: "Fecha de la última carga del inventario" },
    { id: "mtto_registros", uso: "Novedades del Registro diario" },
    { id: "mtto_estados", uso: "Estado de los equipos por turno" },
    { id: "solicitudes", uso: "Solicitudes de materiales (DAD-010A)" },
    { id: "bitacora", uso: "Notas del Diario del taller" },
    { id: "seguimiento", uso: "Estado de cada pendiente (en curso, cerrado…)" },
    { id: "presupuesto", uso: "Presupuesto y reparto por centro de costo" },
    { id: "movimientos", uso: "Gastos cargados al presupuesto" },
    { id: "inventario_cargas", uso: "Historial de cargas del inventario" },
    { id: "reportes_turno", uso: "Reportes llenados en el formulario" },
    { id: "bot", uso: "Estado del bot de Telegram (avisos ya enviados)" },
  ];

  window.NUCLEO = {
    CO, MESES, MESES_C, DIAS, esc, plano, uid,
    ahoraCO, hoy, horaCO, sumaDias, diaCO, horaDe, diasEntre, turnoEnCurso, turnoAnterior, saludo,
    fmt, usuario, iniciales, tono, nombreCorto,
    on, emitir, nube, coleccion, probar, marcar, permisos, COLECCIONES,
    cargarScript, XLSX, descargar,
  };
})();
