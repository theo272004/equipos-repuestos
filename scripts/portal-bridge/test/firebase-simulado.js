// Firebase de mentira para las pruebas de navegador (nube.test.mjs).
// Se sirve en lugar de https://www.gstatic.com/firebasejs/.../firebase-app-compat.js
// y cubre solo lo que usa la app: colecciones, documentos, where/limit, get,
// onSnapshot, set/delete y lotes. Los datos no viven aquí sino en la prueba
// (Node), a la que se habla por window.__fs: así dos pestañas son dos equipos
// que comparten la misma "nube" y la prueba ve cada lectura y cada escritura.
//
// Como la de verdad con copia local (enablePersistence), cada escucha responde
// primero con lo que tiene guardado este navegador (fromCache: true) si tiene
// algo o si está sin conexión, y después con lo del servidor.
(function () {
  const CACHE = "__fs_simulado_cache";
  const cache = (() => { try { return JSON.parse(localStorage.getItem(CACHE) || "{}"); } catch (e) { return {}; } })();
  const guardarCache = () => { try { localStorage.setItem(CACHE, JSON.stringify(cache)); } catch (e) {} };

  const copia = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const escuchas = new Map();
  let sigId = 1;
  window.__fsPush = (id, docs) => { const e = escuchas.get(id); if (e) e(docs, false); };

  class DocSnap {
    constructor(ref, data, meta) { this.ref = ref; this.id = ref.id; this._d = data; this.exists = data != null; this.metadata = meta; }
    data() { return this._d == null ? undefined : copia(this._d); }
    get(campo) { return this._d == null ? undefined : copia(this._d[campo]); }
  }
  class QuerySnap {
    constructor(col, docs, meta) {
      this.docs = docs.map((d) => new DocSnap(new Doc(col, d.id), d.data, meta));
      this.size = this.docs.length;
      this.empty = !this.size;
      this.metadata = meta;
    }
    forEach(f) { this.docs.forEach(f); }
    docChanges() { return this.docs.map((doc) => ({ type: "added", doc })); }
  }
  const meta = (fromCache) => ({ fromCache, hasPendingWrites: false });
  const error = (code, msg) => Object.assign(new Error(msg || code), { code, name: "FirebaseError" });

  function escuchar(spec, alLlegar, a, b, c) {
    let opciones = {}, sig, mal;
    if (typeof a === "function") { sig = a; mal = b; }
    else if (a && typeof a.next === "function") { sig = a.next.bind(a); mal = a.error && a.error.bind(a); }
    else { opciones = a || {}; sig = b; mal = c; }
    const id = sigId++;
    const clave = JSON.stringify(spec);
    let vivo = true;
    const entregar = (docs, deCache) => {
      if (!vivo) return;
      if (!deCache) { cache[clave] = docs; guardarCache(); }
      try { sig(alLlegar(docs, meta(deCache))); } catch (e) { console.error(e); }
    };
    escuchas.set(id, entregar);
    const guardado = cache[clave];
    window.__fs("escuchar", { id, ...spec }).then((r) => {
      if (r.error) { if (mal) mal(error(r.error)); return; }
      if (r.sinConexion) { if (!(guardado && guardado.length)) entregar([], true); return; }
      entregar(r.docs, false);
    });
    // La copia local responde antes que el servidor
    if (guardado && guardado.length) Promise.resolve().then(() => entregar(guardado, true));
    void opciones;
    return () => { vivo = false; escuchas.delete(id); window.__fs("olvidar", { id }); };
  }

  class Query {
    constructor(col, filtros = [], limite = null) { this.col = col; this.filtros = filtros; this.limite = limite; }
    where(campo, op, valor) { return new Query(this.col, [...this.filtros, [campo, op, copia(valor)]], this.limite); }
    limit(n) { return new Query(this.col, this.filtros, n); }
    orderBy() { return this; }
    get spec() { return { col: this.col, filtros: this.filtros, limite: this.limite }; }
    get(op = {}) {
      return window.__fs("leer", { ...this.spec, source: op.source || "" }).then((r) => {
        if (r.error) throw error(r.error);
        return new QuerySnap(this.col, r.docs, meta(false));
      });
    }
    onSnapshot(a, b, c) { return escuchar(this.spec, (docs, m) => new QuerySnap(this.col, docs, m), a, b, c); }
  }
  class Coleccion extends Query {
    constructor(col) { super(col); this.id = col; }
    doc(id) { return new Doc(this.col, id == null ? Math.random().toString(36).slice(2, 12) : String(id)); }
  }
  class Doc {
    constructor(col, id) { this.col = col; this.id = id; this.path = `${col}/${id}`; }
    set(datos, op = {}) { return escribir([{ t: "set", col: this.col, id: this.id, datos: copia(datos), merge: !!op.merge }]); }
    update(datos) { return escribir([{ t: "update", col: this.col, id: this.id, datos: copia(datos) }]); }
    delete() { return escribir([{ t: "delete", col: this.col, id: this.id }]); }
    get() {
      return window.__fs("leerDoc", { col: this.col, id: this.id }).then((r) => {
        if (r.error) throw error(r.error);
        return new DocSnap(this, r.dato, meta(false));
      });
    }
    onSnapshot(a, b, c) {
      return escuchar({ col: this.col, doc: this.id }, (docs, m) => new DocSnap(this, docs[0] ? docs[0].data : null, m), a, b, c);
    }
  }
  function escribir(ops) {
    return window.__fs("escribir", ops).then((r) => { if (r.error) throw error(r.error); });
  }

  const db = {
    collection: (nombre) => new Coleccion(nombre),
    batch() {
      const ops = [];
      return {
        set(ref, datos, op = {}) { ops.push({ t: "set", col: ref.col, id: ref.id, datos: copia(datos), merge: !!op.merge }); return this; },
        update(ref, datos) { ops.push({ t: "update", col: ref.col, id: ref.id, datos: copia(datos) }); return this; },
        delete(ref) { ops.push({ t: "delete", col: ref.col, id: ref.id }); return this; },
        commit() { return ops.length > 500 ? Promise.reject(error("invalid-argument", "maximum 500 writes allowed per request")) : escribir(ops); },
      };
    },
    enablePersistence: () => Promise.resolve(),
    settings() {},
  };
  const auth = { currentUser: null, onAuthStateChanged(f) { setTimeout(() => f(null)); return () => {}; }, signOut: () => Promise.resolve(), signInWithEmailAndPassword: () => Promise.reject(error("auth/operation-not-allowed")) };
  const firestore = () => db;
  window.firebase = { initializeApp: () => ({}), firestore, auth: () => auth, apps: [] };
})();
