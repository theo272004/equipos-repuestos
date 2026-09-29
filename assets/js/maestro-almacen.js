// ============================================================================
//  MAESTRO DE ARTICULOS DE ALMACEN (reporte RE356R de MiPortal)
// ============================================================================
//  Todos los codigos que existen en la empresa (13.651 en el de septiembre de
//  2026), tengan existencia o no. Lo genera scripts/gen-maestro-almacen.py en
//  assets/data/maestro-almacen.json.
//
//  Para que sirve, ademas del RE356 que ya se carga en Almacen:
//    - Buscar el codigo de cualquier pieza aunque no este en el plan ni en el
//      estante (el RE356 no lista lo que esta en cero).
//    - Avisar en la ficha cuando un codigo del plan no existe en el maestro
//      (mal copiado, o un articulo que almacen no tiene creado).
//    - Proponer el codigo interno de un repuesto del manual que no lo tiene,
//      cruzando su referencia de fabricante con las descripciones del maestro:
//      "8-108-136-292" -> 741203262 CORREA DENTADA Z=150 1200-8M-30 8-108-136-292.
//
//  NO trae precios ni existencias (el repositorio es publico). Las existencias
//  siguen saliendo del RE356 (inventario.js).
//
//  Pesa ~1 MB (~220 KB comprimido), asi que no se baja al abrir la pagina:
//  se pide la primera vez que se abre Almacen o una ficha con repuestos.
// ============================================================================

window.MAESTRO = (function () {
  const VERSION = (document.currentScript && new URL(document.currentScript.src).search) || "";
  const RUTA = "assets/data/maestro-almacen.json";

  let porCodigo = new Map();
  let lista = [];
  let familias = [];
  let meta = { fecha: "", total: 0 };
  let indice = null;       // referencias de fabricante -> codigos (se arma al primer uso)
  let promesa = null;
  let listo = false;
  let error = "";

  // Igual que INVENTARIO.norm: el codigo puede llegar como numero, con .0 o con espacios.
  function norm(v) {
    if (v === null || v === undefined) return "";
    const s = String(v).trim().toUpperCase().replace(/\s+/g, "").replace(/\.0+$/, "");
    return s === "N/A" || s === "NA" || s === "-" ? "" : s;
  }
  // Para comparar referencias de fabricante: solo letras y numeros.
  const alnum = (s) => String(s ?? "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Z0-9]+/g, "");

  function preparar(d) {
    familias = (d.familias || []).map(([nombre, grupo], i) => ({ i, nombre, grupo, n: 0 }));
    lista = (d.items || []).map(([cod, desc, um, fam, dias, min, mrp]) => {
      const f = familias[fam] || { nombre: "", grupo: "otro" };
      f.n = (f.n || 0) + 1;
      return { cod, desc, um, fam, famNombre: f.nombre, grupo: f.grupo, dias: dias || 0, min: min || 0, mrp: !!mrp };
    });
    porCodigo = new Map(lista.map((a) => [a.cod, a]));
    meta = { fecha: d.fecha || "", total: lista.length };
    indice = null;
    listo = true;
  }

  function repintar() {
    try {
      window.almRenderSiVisible?.();
      window.renderFichaSiVisible?.();
    } catch (e) { console.error("[Maestro] repintando:", e); }
  }

  // Se pide una sola vez; quien lo necesite llama cargar() y sigue pintando con
  // lo que haya. Al llegar se repinta lo que este a la vista.
  // Si fallo (sin internet), solo se vuelve a intentar cuando alguien lo pide
  // (entrar a Almacen o su boton "reintentar"): la ficha llama a cargar() cada
  // vez que se pinta, y el repintado del fallo la volveria a pintar sin fin.
  function cargar(opciones) {
    if (promesa) return promesa;
    if (error && !(opciones && opciones.reintentar)) return Promise.resolve(false);
    promesa = fetch(new URL(RUTA + VERSION, document.baseURI).href)
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((d) => { preparar(d); error = ""; repintar(); return true; })
      .catch((e) => {
        console.warn("[Maestro] no se pudo cargar:", e);
        error = e && e.message ? e.message : "error";
        promesa = null;          // que se pueda reintentar (sin internet la primera vez)
        repintar();              // para que Almacen ofrezca reintentar
        return false;
      });
    return promesa;
  }

  const de = (cod) => { const k = norm(cod); return k && listo ? porCodigo.get(k) || null : null; };

  // ---------------------------------------------------------------------------
  //  Codigos sugeridos por la referencia del fabricante
  // ---------------------------------------------------------------------------
  // Palabras de la descripcion del maestro que pueden ser una referencia: lo que
  // lleva numeros. Se guardan normalizadas ("8-108-136-292" -> "8108136292").
  function armarIndice() {
    const exacto = new Map();
    const largas = [];
    lista.forEach((a) => {
      a.desc.split(/[\s,;/()]+/).forEach((w) => {
        const t = alnum(w);
        if (t.length < 4 || !/\d/.test(t)) return;
        if (!exacto.has(t)) exacto.set(t, new Set());
        exacto.get(t).add(a.cod);
      });
    });
    exacto.forEach((cods, t) => { if (t.length >= 7) largas.push([t, cods]); });
    indice = { exacto, largas };
  }

  // Una "referencia" que valga la pena buscar. Las medidas y tensiones
  // (24VDC, 400W, 208-240, 20X35X10) salen en cientos de descripciones y no
  // identifican nada; los numeros de parte tienen 7+ cifras o mezclan letras
  // y cifras (HK2020, G3PJ-525B, E79624F00002, 8-104-237-405).
  const UNIDAD = /^\d+(?:[.,]\d+)?(?:V|VDC|VAC|W|KW|HP|A|MA|AH|MM|CM|M|MT|HZ|RPM|BAR|PSI|NM|KG|G|L|LT|ML|MM2|MIC|TR|BTU|UF|K|OHM)$/;
  function refsDe(texto) {
    const out = new Set();
    String(texto ?? "").split(/[\s,;·()/]+|\s[-–]\s/).forEach((w) => {
      const t = alnum(w);
      if (t.length < 6 || UNIDAD.test(t) || /^\d+X\d+(X\d+)?$/.test(t)) return;
      const cifras = (t.match(/\d/g) || []).length;
      const letras = t.length - cifras;
      if (letras === 0 ? cifras >= 7 : cifras >= 2 && letras >= 1) out.add(t);
    });
    return [...out];
  }

  const cacheSug = new Map();
  // texto: la referencia y el nombre de la pieza. Devuelve hasta 3 codigos,
  // primero los que coinciden con mas referencias. Una referencia que sale en
  // mas de 4 articulos no distingue nada y se descarta.
  function sugerir(texto, excluir) {
    if (!listo) return [];
    const k = String(texto ?? "");
    if (!cacheSug.has(k)) {
      if (!indice) armarIndice();
      const votos = new Map();
      refsDe(k).forEach((ref) => {
        let cods = indice.exacto.get(ref);
        let como = "exacta";
        if (!cods && ref.length >= 7) {
          cods = new Set();
          indice.largas.forEach(([t, cs]) => { if (t.includes(ref) || (t.length >= 8 && ref.includes(t))) cs.forEach((c) => cods.add(c)); });
          como = "parcial";
        }
        if (!cods || !cods.size || cods.size > 4) return;
        cods.forEach((c) => {
          const v = votos.get(c) || { n: 0, exacta: 0, refs: [] };
          v.n++; if (como === "exacta") v.exacta++; v.refs.push(ref);
          votos.set(c, v);
        });
      });
      cacheSug.set(k, [...votos.entries()]
        .sort((a, b) => b[1].n - a[1].n || b[1].exacta - a[1].exacta)
        .slice(0, 3)
        .map(([cod, v]) => ({ ...porCodigo.get(cod), por: v.refs })));
    }
    const ex = norm(excluir);
    return cacheSug.get(k).filter((s) => s.cod !== ex);
  }

  // Cuantos codigos nombran un modelo en la descripcion ("GKF2600", "MS235").
  // Se cuenta igual que busca Almacen (texto dentro de la descripcion), para
  // que el numero del enlace sea el que luego sale al buscar.
  const plano = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  function cuantosMencionan(texto) {
    if (!listo) return 0;
    const t = plano(texto);
    if (!t) return 0;
    let n = 0;
    lista.forEach((a) => { if ((a.plano || (a.plano = plano(a.desc))).includes(t)) n++; });
    return n;
  }

  // La palabra del modelo de un equipo que mas aparece en el maestro:
  // "Encapsuladora BOSCH GKF 2600" -> "GKF2600". Solo vale lo que mezcla
  // letras y cifras (un modelo), no las medidas ("350 KG", "1500LT").
  const cacheModelo = new Map();
  function modeloDe(...textos) {
    if (!listo) return null;
    const clave = textos.join("|");
    if (cacheModelo.has(clave)) return cacheModelo.get(clave);
    const cands = new Set();
    textos.filter(Boolean).forEach((txt) => {
      const ws = String(txt).split(/[\s·#,()/-]+/).filter(Boolean);
      ws.forEach((w, i) => { cands.add(alnum(w)); if (ws[i + 1]) cands.add(alnum(w + ws[i + 1])); });
    });
    let mejor = null;
    cands.forEach((c) => {
      if (c.length < 4 || !/\d/.test(c) || !/[A-Z]/.test(c) || UNIDAD.test(c)) return;
      const n = cuantosMencionan(c);
      if (n > 0 && n <= 400 && (!mejor || n > mejor.n)) mejor = { modelo: c, n };
    });
    cacheModelo.set(clave, mejor);
    return mejor;
  }

  return {
    cargar, de, norm, sugerir, refsDe, cuantosMencionan, modeloDe,
    get listo() { return listo; },
    get error() { return error; },
    get fecha() { return meta.fecha; },
    get total() { return meta.total; },
    get todos() { return lista; },
    get familias() { return familias; },
  };
})();
