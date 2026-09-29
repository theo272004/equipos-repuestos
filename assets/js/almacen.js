// ============================================================================
//  ALMACEN: buscar repuestos en el RE356 y llenar la solicitud DAD-010A
// ============================================================================
//  El buscador junta en una sola lista:
//    - Lo que hay en almacen (reporte RE356 de MiPortal, via assets/js/inventario.js)
//    - Las piezas del plan de mantenimiento, aunque almacen no las tenga
//    - Todos los demas codigos de la empresa (maestro RE356R, via
//      assets/js/maestro-almacen.js), sin existencias: para encontrar el codigo
//      de una pieza aunque nadie la haya pedido nunca
//  y busca por codigo, descripcion, ubicacion y por el EQUIPO que las usa: escribir
//  "blisteadora 2" trae todas sus piezas con su existencia y su estante.
//
//  La solicitud de materiales se llena sobre el formato oficial DAD-010A
//  (assets/formatos/DAD-010A.xlsx) con assets/js/formato-dad010a.mjs, que solo
//  escribe los datos en las celdas y deja el formato intacto. Sale un Excel
//  para imprimir; y queda registrada para el Diario.
// ============================================================================

(function () {
  const CDN = {
    xlsx: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
    jszip: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  };
  const VERSION = (document.currentScript && new URL(document.currentScript.src).search) || "";
  const RENGLONES = 20;          // los que tiene el formato (filas 13 a 32)
  const OBS_MAX = 168;           // lo que cabe en las dos lineas de observaciones
  const BORRADOR = "equipos-solicitud-borrador-v1";
  const HISTORIAL = "equipos-solicitudes-v1";
  const TIPOS = { traslado: "Traslado", consumo: "Consumo", devolucion: "Devolución" };

  const esc = (v) => planEsc(v);
  const hoy = () => bogotaToday();
  const fechaCorta = (iso) => { const [a, m, d] = String(iso || "").split("-"); return d ? `${Number(d)}/${m}/${a}` : String(iso || ""); };
  const vista = { q: "", filtro: "", fam: "", limite: 60, aviso: null, trabajando: "", todo: false, histTodo: false, resaltar: "", mas: new Set() };
  // En pantalla ancha la solicitud se puede esconder para dar sitio a los resultados
  const CLAVE_SOL_OCULTA = "equipos-alm-sol-oculta";
  let borrador = cargar(BORRADOR, null) || nuevoBorrador();
  let historial = cargar(HISTORIAL, []);
  let cache = { inv: null, m: null, lista: [] };

  function cargar(k, def) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? def; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function nuevoBorrador(base) {
    // Lo que no cambia de una solicitud a otra se conserva: quien pide, su area.
    const b = base || {};
    return {
      tipo: b.tipo || "consumo", fecha: hoy(),
      area: b.area || "", departamento: b.departamento || "", destino: "",
      alistadoPor: "", solicitadoPor: b.solicitadoPor || (window.NUCLEO ? window.NUCLEO.usuario.get() : ""), autorizadoPor: "",
      // Centro de costo al que se carga la salida (presupuesto). Se sugiere
      // según el equipo de destino y se puede cambiar por renglón.
      cc: "",
      observaciones: "", lineas: [],
    };
  }
  function guardarBorrador() { guardar(BORRADOR, borrador); }

  // ------------------------------------------------------------------------
  //  La lista en la que se busca
  // ------------------------------------------------------------------------
  function planEquipos() { return (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || []; }

  function universo() {
    const inv = window.INVENTARIO ? window.INVENTARIO.todo : {};
    const M = window.MAESTRO && window.MAESTRO.listo ? window.MAESTRO : null;
    if (cache.inv === inv && cache.m === M && cache.lista.length) return cache.lista;
    const norm = window.INVENTARIO ? window.INVENTARIO.norm : (v) => String(v || "").trim().toUpperCase();

    // Que equipos usan cada codigo, segun el plan (con el codigo corregido a mano si lo hay).
    const uso = new Map();
    const descPlan = new Map();
    planEquipos().forEach((eq) => (eq.r || []).forEach((r) => {
      const cod = norm(typeof repCodigo === "function" ? repCodigo(eq, r) : r.cod);
      if (!cod) return;
      if (!uso.has(cod)) uso.set(cod, []);
      const lista = uso.get(cod);
      if (!lista.some((e) => e.c === eq.c)) lista.push({ c: eq.c, n: eq.n, id: eq.id });
      if (!descPlan.has(cod) && r.d) descPlan.set(cod, r.d);
    }));

    // Del maestro sale la descripcion oficial, la familia y el plazo de compra
    // de cualquier codigo, este o no en el estante.
    const de = (cod) => (M ? M.de(cod) : null);
    const items = [];
    Object.values(inv).forEach((a) => {
      const m = de(a.cod);
      items.push({
        cod: a.cod, desc: a.desc || (m && m.desc) || descPlan.get(a.cod) || "", um: a.um || (m && m.um) || "", exist: a.exist,
        min: a.min ?? (m && m.min) ?? null, sitios: (a.sitios || []).filter((s) => s.alm || s.ub), ub: a.ub || "",
        enBodega: true, equipos: uso.get(a.cod) || [], m,
      });
    });
    uso.forEach((equipos, cod) => {
      if (inv[cod]) return;
      const m = de(cod);
      items.push({ cod, desc: (m && m.desc) || descPlan.get(cod) || "", um: (m && m.um) || "", exist: null, min: (m && m.min) || null, sitios: [], ub: "", enBodega: false, equipos, m });
    });
    if (M) M.todos.forEach((m) => {
      if (inv[m.cod] || uso.has(m.cod)) return;
      items.push({ cod: m.cod, desc: m.desc, um: m.um, exist: null, min: m.min || null, sitios: [], ub: "", enBodega: false, equipos: [], m });
    });
    const porFam = new Map();
    items.forEach((it) => {
      const dp = descPlan.get(it.cod);
      it.hay = planPlain([it.cod, it.desc, dp && dp !== it.desc ? dp : "", it.ub, it.sitios.map((s) => `${s.alm}/${s.ub} ${s.alm} ${s.ub}`).join(" "), it.equipos.map((e) => `${e.n} ${e.c}`).join(" ")].join(" "));
      it.bajoMin = it.enBodega && it.min > 0 && (it.exist ?? 0) < it.min;
      it.fam = it.m ? it.m.fam : -1;
      it.otraArea = !!(it.m && it.m.grupo === "otro");
      // Un codigo del plan que el maestro no conoce: mal copiado o sin crear en almacen.
      it.noMaestro = !!(M && !it.m && it.equipos.length);
      porFam.set(it.fam, (porFam.get(it.fam) || 0) + 1);
    });
    cache = { inv, m: M, lista: items, porFam, porCod: new Map(items.map((it) => [it.cod, it])) };
    return items;
  }

  // Si lo que se escribe es el nombre de un equipo ("blisteadora 2", "njp 1200")
  // se traen SUS piezas, no todo lo que contenga esas letras. Se compara por
  // palabras enteras y los numeros tienen que ser iguales: si no, "2" coincide
  // con "Integra320" y "blisteadora 2" trae las piezas de todas las blisteadoras.
  const palabras = (txt) => planPlain(txt).split(/[^a-z0-9]+/).filter(Boolean);
  function equiposQueCoinciden(tokens) {
    const ts = tokens.flatMap((t) => t.split(/[^a-z0-9]+/)).filter(Boolean);
    if (!ts.length) return [];
    return planEquipos().filter((eq) => {
      const w = palabras(`${eq.n} ${eq.c}`);
      return ts.every((t) => (/^\d+$/.test(t) ? w.includes(t) : w.some((x) => x.startsWith(t))));
    });
  }

  function buscar() {
    const tokens = planTokens(vista.q);
    const q = normalize(vista.q).replace(/\s+/g, "");
    let lista = universo();
    if (vista.fam === "mtto") lista = lista.filter((it) => !it.otraArea);
    else if (vista.fam !== "") lista = lista.filter((it) => it.fam === Number(vista.fam));
    if (vista.filtro === "stock") lista = lista.filter((it) => it.exist > 0);
    if (vista.filtro === "plan") lista = lista.filter((it) => it.equipos.length);
    if (vista.filtro === "min") lista = lista.filter((it) => it.bajoMin);
    const eqs = tokens.length && !vista.todo ? equiposQueCoinciden(tokens) : [];
    if (eqs.length) {
      const cods = new Set(eqs.map((e) => e.c));
      lista = lista.filter((it) => it.equipos.some((e) => cods.has(e.c)));
    } else if (tokens.length) lista = lista.filter((it) => tokens.every((t) => it.hay.includes(t)));
    else if (!vista.filtro && (vista.fam === "" || vista.fam === "mtto")) return { lista: [], eqs };
    // Primero lo que hay, luego lo de almacen en cero, las piezas del plan, el
    // resto del maestro y al final lo de otras areas (laboratorio, oficina...).
    const lugar = (it) => (it.exist > 0 ? 0 : it.enBodega ? 1 : it.equipos.length ? 2 : it.otraArea ? 4 : 3);
    const peso = (it) => (planPlain(it.cod) === q ? 0 : planPlain(it.cod).startsWith(q) ? 1 : 2) * 10 + lugar(it);
    return { lista: lista.slice().sort((a, b) => peso(a) - peso(b) || String(a.desc).localeCompare(String(b.desc))), eqs };
  }

  // ------------------------------------------------------------------------
  //  Pintar
  // ------------------------------------------------------------------------
  function render() {
    const raiz = document.getElementById("almRoot");
    if (!raiz) return;
    const pendientesEntrega = historial.filter((s) => (s.estado || "emitida") === "emitida").length;
    raiz.innerHTML = `
      <div class="section-bar">
        <div>
          <p class="eyebrow">Almacén y costos</p>
          <h2>Buscar repuestos y pedirlos</h2>
        </div>
        <div class="section-actions">
          ${pendientesEntrega ? `<button class="button button--light" type="button" data-alm="ver-hist">${pendientesEntrega} sin entregar</button>` : ""}
          <button class="button button--light" type="button" data-alm="ir-presupuesto">Presupuesto</button>
        </div>
      </div>
      <div id="almFuente">${htmlFuente()}</div>
      <div id="almPedidos">${htmlPedidos()}</div>
      <div class="alm-grid ${cargar(CLAVE_SOL_OCULTA, false) ? "is-sol-oculta" : ""}" id="almGrid">
        <div class="alm-main">
          <div class="pl-filters">
            <input type="search" id="almQ" value="${esc(vista.q)}" placeholder="C&oacute;digo, descripci&oacute;n, estante o equipo (ej. rodamiento 6204, R01/Z0505, blisteadora 2)&hellip;" aria-label="Buscar en almac&eacute;n" autocomplete="off">
          </div>
          <div class="alm-chips" id="almChips">${htmlChips()}</div>
          <div id="almResultados">${htmlResultados()}</div>
        </div>
        <aside class="alm-side" id="almSolicitud">${htmlSolicitud()}</aside>
      </div>
      <button class="alm-sol-tab" id="almSolTab" type="button" data-alm="sol-mostrar" title="Mostrar la solicitud"></button>
      <div id="almHistorial">${htmlHistorial()}</div>
      <button class="alm-ir-sol" id="almIrSol" type="button" data-alm="ir-sol" hidden></button>`;
    const q = document.getElementById("almQ");
    q.addEventListener("input", () => { vista.q = q.value; vista.limite = 60; vista.todo = false; pintarResultados(); });
    // En el celular la solicitud queda debajo de los resultados: un botón
    // flotante lleva a ella, y se esconde cuando ya se está viendo.
    vista.solVisible = false;
    if (window.IntersectionObserver) {
      if (vista.obsSol) vista.obsSol.disconnect();
      vista.obsSol = new IntersectionObserver((es) => { vista.solVisible = es.some((e) => e.isIntersecting); pintarIrSol(); });
      vista.obsSol.observe(document.getElementById("almSolicitud"));
    }
    pintarIrSol();
  }

  function solOculta() { return !!document.getElementById("almGrid")?.classList.contains("is-sol-oculta"); }
  function ocultarSol(si) {
    document.getElementById("almGrid")?.classList.toggle("is-sol-oculta", si);
    guardar(CLAVE_SOL_OCULTA, si);
    pintarIrSol();
  }
  function verSol() {
    if (solOculta()) ocultarSol(false);
    document.getElementById("almSolicitud")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pintarIrSol() {
    const n = borrador.lineas.length;
    const t = document.getElementById("almSolTab");
    if (t) t.innerHTML = `<span aria-hidden="true">&lsaquo;</span> ${borrador.editando ? "Corrección" : "Solicitud"}${n ? ` <b>${n}</b>` : ""}`;
    const b = document.getElementById("almIrSol");
    if (!b) return;
    b.hidden = !n || vista.solVisible;
    b.innerHTML = `${borrador.editando ? "Corrección" : "Solicitud"} &middot; <b>${n}</b> ${n === 1 ? "pieza" : "piezas"} <span aria-hidden="true">&darr;</span>`;
  }

  function pintarResultados() {
    const r = document.getElementById("almResultados");
    if (r) r.innerHTML = htmlResultados();
    const c = document.getElementById("almChips");
    if (c) c.innerHTML = htmlChips();
  }
  function pintarSolicitud() { const s = document.getElementById("almSolicitud"); if (s) s.innerHTML = htmlSolicitud(); pintarIrSol(); }
  function pintarHistorial() { const h = document.getElementById("almHistorial"); if (h) h.innerHTML = htmlHistorial(); }
  function pintarFuente() { const f = document.getElementById("almFuente"); if (f) f.innerHTML = htmlFuente(); }

  function htmlFuente() {
    const inv = window.INVENTARIO;
    const hay = inv && inv.cargado;
    const f = inv ? inv.frescura() : { estado: "sin-datos", texto: "" };
    const archivo = inv && inv.fuente === "archivo";
    const aviso = vista.aviso ? `<p class="alm-aviso alm-aviso--${vista.aviso.tipo}" role="status">${vista.aviso.html}</p>` : "";
    const M = window.MAESTRO;
    const maestro = !M ? ""
      : M.listo ? `<span class="pl-inv pl-inv--maestro" title="Todos los códigos de la empresa (reporte RE356R de MiPortal), tengan existencia o no. No trae existencias, estantes ni precios.">Maestro: ${M.total.toLocaleString("es-CO")} c&oacute;digos &middot; ${esc(fechaCorta(M.fecha))}</span>`
      : M.error ? `<button class="pl-reg" type="button" data-alm="maestro" title="${esc(M.error)}">No baj&oacute; el maestro de art&iacute;culos &middot; reintentar</button>`
      : `<span class="pl-soft">Cargando el maestro de art&iacute;culos&hellip;</span>`;
    const trabajando = vista.trabajando ? `<p class="alm-aviso alm-aviso--info" role="status">${esc(vista.trabajando)}</p>` : "";
    const n = vista.nube;
    const nube = !n ? ""
      : n.estado === "subiendo" ? `<span class="pl-inv pl-inv--nube" role="status">${navigator.onLine === false ? "Sin conexi&oacute;n: se guarda en la nube al volver la se&ntilde;al" : "Guardando en la nube&hellip;"}</span>`
      : n.estado === "ok" ? `<span class="pl-inv pl-inv--fresco" role="status" title="${n.parcial ? "Reporte parcial: no se dio nada por agotado" : "Lo ven todos los equipos del taller"}">Guardado en la nube${n.parcial ? " (parcial)" : ""}</span>`
      : n.estado === "error" ? `<button class="pl-reg alm-nube-error" type="button" data-alm="subir-nube" title="${esc(n.motivo || "")}">No se guard&oacute; en la nube &middot; reintentar</button>`
      : ""; // sin nube: la etiqueta del inventario ya dice "solo en este equipo"
    // Un archivo cargado antes de que se guardara solo en la nube
    const sinSubir = !n && archivo && !inv.estado.enNube && window.CLOUD && window.CLOUD.enabled
      ? `<button class="pl-reg" type="button" data-alm="subir-nube" title="Para que lo vean los demás equipos y no se pierda">Guardar en la nube</button>` : "";
    return `
      <div class="alm-fuente">
        <span class="pl-inv pl-inv--${hay ? f.estado : "sin-datos"}">${hay ? `${esc(f.texto)} &middot; ${inv.estado.articulos} art&iacute;culos` : "Sin reporte de almac&eacute;n cargado"}</span>
        <label class="pl-reg alm-cargar" title="En MiPortal: reporte RE356 &rarr; Generar Excel. Queda guardado en la nube y lo ven todos los equipos del taller.">
          Cargar reporte RE356&hellip;<input type="file" accept=".xls,.xlsx" data-alm="archivo" hidden>
        </label>
        ${nube}${sinSubir}
        ${archivo && !(n && n.estado === "ok") && !inv.estado.enNube ? `<button class="pl-reg" type="button" data-alm="olvidar" title="Volver a lo que suba el puente de MiPortal">Quitar el archivo</button>` : ""}
        ${maestro}
      </div>
      ${trabajando}${aviso}`;
  }

  function htmlChips() {
    const lista = universo();
    const n = { stock: lista.filter((i) => i.exist > 0).length, plan: lista.filter((i) => i.equipos.length).length, min: lista.filter((i) => i.bajoMin).length };
    const chip = (id, txt, cant) => `<button type="button" class="alm-chip ${vista.filtro === id ? "is-on" : ""}" data-alm="filtro" data-v="${id}">${txt} <span>${cant}</span></button>`;
    return chip("stock", "Con existencia", n.stock) + chip("plan", "Piezas del plan", n.plan) + (n.min ? chip("min", "Bajo el m&iacute;nimo", n.min) : "") + htmlFamilias();
  }

  // Familias del maestro (salen de los digitos del codigo: 7419 rodamientos,
  // 7412 correas...). Para recorrer "todas las correas" sin saber como se
  // llaman, o para dejar fuera lo de laboratorio y oficina.
  function htmlFamilias() {
    const M = window.MAESTRO;
    if (!(M && M.listo)) return "";
    const cuenta = (i) => (cache.porFam && cache.porFam.get(i)) || 0;
    const fams = M.familias.filter((f) => cuenta(f.i)).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    const mtto = universo().filter((it) => !it.otraArea).length;
    const opt = (f) => `<option value="${f.i}" ${vista.fam === String(f.i) ? "selected" : ""}>${esc(f.nombre)} (${cuenta(f.i).toLocaleString("es-CO")})</option>`;
    return `<label class="alm-fam">
      <select data-alm="fam" aria-label="Familia de art&iacute;culos">
        <option value="" ${vista.fam === "" ? "selected" : ""}>Todas las familias</option>
        <option value="mtto" ${vista.fam === "mtto" ? "selected" : ""}>Solo mantenimiento (${mtto.toLocaleString("es-CO")})</option>
        <optgroup label="Mantenimiento">${fams.filter((f) => f.grupo !== "otro").map(opt).join("")}</optgroup>
        <optgroup label="Otras &aacute;reas">${fams.filter((f) => f.grupo === "otro").map(opt).join("")}</optgroup>
      </select></label>`;
  }

  function donde(it) {
    // Si no hay y toca comprarla, cuanto tarda (dias de aprovisionamiento del maestro).
    const plazo = !(it.exist > 0) && it.m && it.m.dias ? ` <span class="pl-soft alm-plazo" title="D&iacute;as de aprovisionamiento seg&uacute;n el maestro de art&iacute;culos">compra: ${fmt(it.m.dias)} d&iacute;as</span>` : "";
    if (!it.sitios.length) {
      if (it.enBodega) return esc(it.ub || "—") + plazo;
      const sabe = window.INVENTARIO && window.INVENTARIO.cargado;
      return `<span class="pl-soft">${sabe ? "no est&aacute; en almac&eacute;n" : "sin inventario cargado"}</span>${plazo}`;
    }
    return it.sitios.map((s) => `<span class="alm-sitio">${esc(s.alm)}/${esc(s.ub)}${it.sitios.length > 1 ? ` <b>${fmt(s.exist)}</b>` : ""}</span>`).join(" ") + plazo;
  }
  function usadoEn(it) {
    if (!it.equipos.length) return '<span class="pl-soft">&mdash;</span>';
    const primeros = it.equipos.slice(0, 2).map((e) => esc(e.n)).join("<br>");
    return primeros + (it.equipos.length > 2 ? `<br><span class="pl-soft">y ${it.equipos.length - 2} m&aacute;s</span>` : "");
  }
  const fmt = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString("es-CO"));

  function htmlResultados() {
    const tokens = planTokens(vista.q);
    if (!tokens.length && !vista.filtro && (vista.fam === "" || vista.fam === "mtto")) {
      return `<div class="pl-empty"><h3>Escribe lo que buscas</h3><p>Por c&oacute;digo, por nombre de la pieza, por estante (R01/Z0505) o por el equipo que la usa. O elige una familia para recorrerla entera.</p></div>`;
    }
    const { lista: res, eqs } = buscar();
    const deEquipo = eqs.length
      ? `<p class="alm-aviso alm-aviso--info">Piezas de <strong>${eqs.slice(0, 3).map((e) => esc(e.n)).join(", ")}${eqs.length > 3 ? ` y ${eqs.length - 3} equipos m&aacute;s` : ""}</strong>, seg&uacute;n el plan de mantenimiento.
          <button class="pl-reg" type="button" data-alm="todo">Buscar &laquo;${esc(vista.q)}&raquo; en todo el almac&eacute;n</button></p>`
      : vista.todo ? `<p class="pl-soft"><button class="pl-reg" type="button" data-alm="porEquipo">Ver solo las piezas del equipo</button></p>` : "";
    if (!res.length) return deEquipo + `<div class="pl-empty"><h3>Nada coincide</h3><p>Prueba con menos palabras o con el c&oacute;digo interno.</p></div>`;
    const enSol = new Set(borrador.lineas.map((l) => l.cod));
    const filas = res.slice(0, vista.limite).map((it) => `
      <tr class="${it.bajoMin ? "is-bajo" : ""} ${it.enBodega ? "" : "is-fuera-alm"}">
        <td class="alm-accion">${enSol.has(it.cod)
          ? `<button class="pl-reg is-on" type="button" data-alm="quitar" data-cod="${esc(it.cod)}" title="Quitar de la solicitud">Pedida &#10003;</button>`
          : `<button class="pl-reg" type="button" data-alm="agregar" data-cod="${esc(it.cod)}">Pedir</button>`}</td>
        <td class="pl-code">${planMark(it.cod, tokens)}</td>
        <td class="alm-desc">${planMark(it.desc, tokens) || "&mdash;"}${it.bajoMin ? ` <span class="pl-tag pl-tag--warn" title="M&iacute;nimo de almac&eacute;n: ${fmt(it.min)}">bajo el m&iacute;nimo</span>` : ""}${it.noMaestro ? ` <span class="pl-tag pl-tag--warn" title="El plan usa este c&oacute;digo pero no aparece en el maestro de art&iacute;culos de almac&eacute;n: puede estar mal copiado o no estar creado. Rev&iacute;salo con almac&eacute;n.">no est&aacute; en el maestro</span>` : ""}${it.m ? `<small class="alm-fam-txt">${esc(it.m.famNombre)}</small>` : ""}</td>
        <td class="alm-um" data-l="U/M">${esc(it.um) || "&mdash;"}</td>
        <td class="pl-num alm-exist" data-l="Exist."><strong>${fmt(it.exist)}</strong></td>
        <td class="alm-donde">${donde(it)}</td>
        <td class="pl-num alm-min ${it.min ? "" : "is-vacio"}" data-l="Mín.">${it.min ? fmt(it.min) : "&mdash;"}</td>
        <td class="alm-uso ${it.equipos.length ? "" : "is-vacio"}" data-l="Usado en">${usadoEn(it)}</td>
      </tr>`).join("");
    const mas = res.length > vista.limite ? `<button class="pl-reg alm-mas" type="button" data-alm="mas">Ver ${Math.min(60, res.length - vista.limite)} m&aacute;s (quedan ${res.length - vista.limite})</button>` : "";
    return `${deEquipo}
      <p class="pl-soft alm-cuenta">${res.length} ${res.length === 1 ? "art&iacute;culo" : "art&iacute;culos"}</p>
      <div class="pl-tablewrap">
        <table class="pl-table alm-table">
          <thead><tr><th></th><th>C&oacute;digo</th><th>Descripci&oacute;n</th><th>U/M</th><th class="pl-num">Exist.</th><th>D&oacute;nde</th><th class="pl-num">M&iacute;n.</th><th>Usado en</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>${mas}`;
  }

  // Precio y centro de costo: lo que conecta la solicitud con el presupuesto
  const P = () => window.PRESUPUESTO;
  const precio = (cod) => (P() ? P().precioDe(cod) : null);
  const peso = (n) => (window.NUCLEO ? window.NUCLEO.fmt.dinero(n) : "$ " + Math.round(n).toLocaleString("es-CO"));
  const pesoCorto = (n) => (window.NUCLEO ? window.NUCLEO.fmt.dineroCorto(n) : peso(n));
  // ------------------------------------------------------------------------
  //  De qué almacén sale cada pieza
  // ------------------------------------------------------------------------
  // Almacén no recibe en una misma hoja artículos de almacenes distintos. Así
  // que la solicitud sale de UN almacén principal: cada pieza se saca de ahí si
  // lo tiene, y solo lo que no hay ahí va en otra hoja del mismo formato. El
  // principal se elige solo (el que surte más renglones) o lo fija quien pide;
  // lo que alguien cambió a mano en "Sacar de" se respeta.
  const almDe = (l) => String(l.sitio || "").split("|")[0].trim().toUpperCase();
  const sinStock = (x) => x.exist !== null && x.exist !== undefined && Number(x.exist) <= 0;
  function itemDe(cod) { universo(); return cache.porCod ? cache.porCod.get(cod) : null; }

  // El almacén que puede surtir más renglones de la solicitud (a igualdad, el que más tiene).
  function almacenAuto(lineas) {
    const cuenta = new Map();
    lineas.forEach((l) => {
      const sitios = (itemDe(l.cod) || { sitios: [] }).sitios;
      const con = sitios.filter((x) => x.alm && !sinStock(x));
      const porAlm = new Map();
      (con.length ? con : sitios.filter((x) => x.alm)).forEach((x) => porAlm.set(x.alm, (porAlm.get(x.alm) || 0) + (Number(x.exist) || 0)));
      porAlm.forEach((ex, alm) => { const c = cuenta.get(alm) || { n: 0, ex: 0 }; c.n++; c.ex += ex; cuenta.set(alm, c); });
    });
    let mejor = "";
    cuenta.forEach((c, alm) => { const m = cuenta.get(mejor); if (!m || c.n > m.n || (c.n === m.n && c.ex > m.ex)) mejor = alm; });
    return mejor;
  }
  const almacenDe = (b) => b.almacen || almacenAuto(b.lineas);

  // Pone en cada renglón (salvo los cambiados a mano) el estante del almacén
  // principal que más tiene; si ahí no hay, el estante que más tiene de otro.
  function elegirSitios() {
    const principal = almacenDe(borrador);
    borrador.lineas.forEach((l) => {
      if (l.sitioManual) return;
      const sitios = (itemDe(l.cod) || { sitios: [] }).sitios;
      if (!sitios.length) return;
      const con = sitios.filter((x) => !sinStock(x));
      const pool = con.length ? con : sitios;
      const orden = (a, b) => (Number(b.exist) || 0) - (Number(a.exist) || 0);
      const x = pool.filter((y) => y.alm === principal).sort(orden)[0] || pool.slice().sort(orden)[0];
      l.sitio = `${x.alm}|${x.ub}`;
    });
  }

  // Mismo reparto que formato-dad010a.mjs (hojasPorAlmacen): la hoja del
  // principal primero, con lo que no tiene almacén; cada otro almacén aparte.
  function hojasDe(lineas, principal) {
    const cuenta = new Map();
    (lineas || []).forEach((l) => { const a = almDe(l); if (a) cuenta.set(a, (cuenta.get(a) || 0) + 1); });
    if (!cuenta.size) return [{ alm: "", n: (lineas || []).length }];
    const orden = [...cuenta.keys()];
    const p = String(principal || "").toUpperCase();
    const primero = cuenta.has(p) ? p : orden.reduce((m, a) => (cuenta.get(a) > cuenta.get(m) ? a : m), orden[0]);
    const sinAlm = (lineas || []).filter((l) => !almDe(l)).length;
    return [primero, ...orden.filter((a) => a !== primero)].map((alm) => ({ alm, n: cuenta.get(alm) + (alm === primero ? sinAlm : 0) }));
  }
  const listaHojas = (hs) => hs.map((h) => `${esc(h.alm || "sin almacén")} (${h.n})`).join(" · ");
  // El principal con el que se arman las hojas: el fijado, el que se usó al
  // emitirla (para volver a descargar una solicitud vieja igual) o el automático.
  const principalDe = (s) => s.almacen || s.almacenHoja || almacenAuto(s.lineas || []);

  // "Sacar de": el almacén principal. Solo se ofrece si hay de dónde elegir.
  // Códigos de causa y Trans. ya usados en solicitudes anteriores, para elegirlos rápido
  function usados(k) {
    const n = new Map();
    historial.forEach((x) => (x.lineas || []).forEach((l) => { const v = String(l[k] || "").trim(); if (v) n.set(v, (n.get(v) || 0) + 1); }));
    return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([v]) => `<option value="${esc(v)}">`).join("");
  }

  function htmlPrincipal(b) {
    const candidatos = new Map();
    b.lineas.forEach((l) => {
      const alms = new Set((itemDe(l.cod) || { sitios: [] }).sitios.filter((x) => x.alm && !sinStock(x)).map((x) => x.alm));
      alms.forEach((a) => candidatos.set(a, (candidatos.get(a) || 0) + 1));
    });
    if (candidatos.size < 2) return "";
    const auto = almacenAuto(b.lineas);
    const opts = [...candidatos.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
    return `<div class="alm-principal">
        <label title="Cada pieza sale de este almacén si lo tiene; lo que no, va en otra hoja">Sacar de
          <select data-alm-campo="almacen" aria-label="Almacén principal de la solicitud">
            <option value="" ${!b.almacen ? "selected" : ""}>${auto ? `Automático: ${esc(auto)}` : "Automático"}</option>
            ${opts.map(([a, n]) => `<option value="${esc(a)}" ${b.almacen === a ? "selected" : ""}>${esc(a)} &middot; tiene ${n} de ${b.lineas.length}</option>`).join("")}
          </select></label>
      </div>`;
  }

  function totalSolicitud(s) {
    let total = 0, sinPrecio = 0;
    (s.lineas || []).forEach((l) => {
      const pu = Number(l.pu) > 0 ? Number(l.pu) : precio(l.cod);
      if (pu) total += pu * (Number(l.cant) || 0); else sinPrecio++;
    });
    return { total, sinPrecio };
  }
  // Cuánto queda del centro de costo en el presupuesto del año
  function saldoCC(cc) {
    if (!cc || !P()) return null;
    const anio = Number(String(borrador.fecha || hoy()).slice(0, 4));
    const cfg = P().config(anio);
    const r = cfg && (cfg.reparto || []).find((x) => x.cc === cc);
    if (!r) return { fuera: true };
    const a = P().agregados(anio);
    const f = a.filasCC.find((x) => x.cc === cc) || { valor: 0 };
    return { asignado: Number(r.valor) || 0, gastado: f.valor, queda: (Number(r.valor) || 0) - f.valor };
  }

  function htmlSolicitud() {
    const b = borrador;
    const campo = (k, etiqueta, extra = "") => `<label>${etiqueta}<input data-alm-campo="${k}" value="${esc(b[k])}" ${extra}></label>`;
    const { total, sinPrecio } = totalSolicitud(b);
    const hs = hojasDe(b.lineas, principalDe(b));
    // Cada material es una tarjeta numerada, en el orden de los renglones del
    // formato: qué es, cuánto (con − y +), de dónde sale, cuánto vale y los
    // datos que pide el DAD-010A por renglón (Trans., código causa, centro).
    const lineas = b.lineas.map((l, i) => {
      const it = itemDe(l.cod);
      const aparte = hs.length > 1 && almDe(l) && almDe(l) !== hs[0].alm;
      const sitios = it ? it.sitios : [];
      const elegido = sitios.find((s) => `${s.alm}|${s.ub}` === l.sitio);
      const disp = elegido ? elegido.exist : it ? it.exist : null;
      const pasa = b.tipo !== "devolucion" && disp !== null && disp !== undefined && Number(l.cant) > disp;
      const pu = precio(l.cod);
      const de = sitios.length > 1
        ? `<select class="alm-sitio-sel" data-alm-linea="${i}" data-k="sitio" aria-label="De qué estante sale ${esc(l.cod)}">${sitios.map((s) => `<option value="${esc(s.alm + "|" + s.ub)}" ${`${s.alm}|${s.ub}` === l.sitio ? "selected" : ""}>${esc(s.alm)} / ${esc(s.ub)} &middot; hay ${fmt(s.exist)}</option>`).join("")}</select>`
        : `<span class="alm-linea__sitio">${l.sitio ? esc(l.sitio.replace("|", " / ")) : "&mdash;"}${disp !== null && disp !== undefined && elegido ? ` &middot; hay ${fmt(disp)}` : ""}</span>`;
      return `
        <li class="alm-linea ${aparte ? "is-aparte" : ""} ${pasa ? "is-pasa" : ""}" data-cod="${esc(l.cod)}">
          <div class="alm-linea__top">
            <span class="alm-linea__n" title="Renglón ${i + 1} del formato">${i + 1}</span>
            <div class="alm-linea__txt">
              <b>${esc(l.desc) || "Sin descripción"}</b>
              <span class="alm-linea__meta"><code>${esc(l.cod) || "sin código"}</code>${l.um ? ` &middot; ${esc(l.um)}` : ""}${it && !it.enBodega ? ' <span class="pl-tag pl-tag--warn">no está en almacén</span>' : ""}${aparte ? ` <span class="pl-tag pl-tag--n" title="No hay en ${esc(hs[0].alm)}: sale de ${esc(almDe(l))}, que va en otra hoja del formato">otra hoja &middot; ${esc(almDe(l))}</span>` : ""}</span>
            </div>
            <button class="alm-x" type="button" data-alm="quitar" data-cod="${esc(l.cod)}" aria-label="Quitar ${esc(l.desc || l.cod)}" title="Quitar de la solicitud">&times;</button>
          </div>
          <div class="alm-linea__mid">
            <div class="alm-stepper" role="group" aria-label="Cantidad de ${esc(l.cod)}">
              <button type="button" data-alm="cant-menos" data-i="${i}" aria-label="Uno menos" ${Number(l.cant) <= 1 ? "disabled" : ""}>&minus;</button>
              <input class="alm-cant" type="number" min="0" step="any" inputmode="decimal" value="${esc(l.cant)}" data-alm-linea="${i}" data-k="cant" aria-label="Cantidad">
              <button type="button" data-alm="cant-mas" data-i="${i}" aria-label="Uno más">+</button>
            </div>
            <label class="alm-linea__de"><span>Sacar de</span>${de}</label>
            <span class="alm-linea__valor" title="${pu ? "Precio unitario del RE356: " + esc(peso(pu)) : "El inventario no trae precio para este código"}">${pu ? esc(pesoCorto(pu * (Number(l.cant) || 0))) : '<span class="pl-soft">sin precio</span>'}</span>
          </div>
          ${pasa ? `<p class="alm-pasa">Pides ${fmt(l.cant)} y ${elegido ? `en ${esc(elegido.alm)} / ${esc(elegido.ub)}` : "en almacén"} hay ${fmt(disp)}.</p>` : ""}
          <div class="alm-linea__extra">
            <label>Trans.<input id="alm-trans-${i}" value="${esc(l.trans)}" data-alm-linea="${i}" data-k="trans" list="almTransUsados" autocomplete="off"></label>
            <label>Código causa<input id="alm-causa-${i}" value="${esc(l.causa)}" data-alm-linea="${i}" data-k="causa" list="almCausasUsadas" autocomplete="off"></label>
            ${i === 0 && b.lineas.length > 1 ? `<button class="alm-igual" type="button" data-alm="dad-todas" title="Copiar el Trans. y el código causa de este renglón a todos los demás">Igual en todas</button>` : ""}
          </div>
          ${P() ? `<details class="alm-linea__mas" ${l.cc || vista.mas.has(l.cod) ? "open" : ""}>
            <summary>Otro centro de costo</summary>
            <label class="alm-linea__cc" title="Si este renglón se carga a otro centro de costo">Centro<select data-alm-linea="${i}" data-k="cc"><option value="">el de la solicitud</option>${P().opcionesCC(l.cc || "", true).replace('<option value="">— Sin centro de costo —</option>', "")}</select></label>
          </details>` : ""}
        </li>`;
    }).join("");
    const saldo = saldoCC(b.cc);
    const avisoCC = !P() ? "" : !b.cc
      ? `<p class="alm-cc-nota is-warn">Sin centro de costo: esta salida no se descontará de ningún presupuesto.</p>`
      : saldo && saldo.fuera
        ? `<p class="alm-cc-nota is-warn">${esc(b.cc)} no está en el reparto del presupuesto de este año.</p>`
        : saldo
          ? `<p class="alm-cc-nota ${saldo.queda - total < 0 ? "is-bad" : ""}">De <b>${esc(b.cc)} · ${esc(P().nombreCC(b.cc))}</b> quedan <b>${esc(pesoCorto(saldo.queda))}</b>${total ? `; con esta solicitud quedarían <b>${esc(pesoCorto(saldo.queda - total))}</b>` : ""}.</p>`
          : "";
    return `
      <div class="alm-sol">
        <div class="alm-sol__head">
          <h3>${b.editando ? "Corregir solicitud" : "Solicitud de materiales"}</h3>
          <span class="pl-tag pl-tag--n" title="El formato DAD-010A tiene ${RENGLONES} renglones">${b.lineas.length}/${RENGLONES}</span>
          <button class="alm-sol-ocultar" type="button" data-alm="sol-ocultar" title="Esconder la solicitud para ver más resultados (no se pierde nada)">Ocultar <span aria-hidden="true">&rsaquo;</span></button>
        </div>
        ${b.editando ? `<p class="alm-cc-nota is-warn alm-editando">Est&aacute;s corrigiendo la solicitud del <b>${esc(b.editandoFecha || b.fecha)}</b>${b.editandoDestino ? ` para <b>${esc(b.editandoDestino)}</b>` : ""}. Al guardar se reemplaza esa misma (no se crea otra) y se descarga el formato corregido.</p>` : ""}
        <div class="alm-tipo" role="radiogroup" aria-label="Tipo de solicitud">
          ${Object.entries(TIPOS).map(([k, t]) => `<label class="alm-chip ${b.tipo === k ? "is-on" : ""}"><input type="radio" name="almTipo" value="${k}" ${b.tipo === k ? "checked" : ""} data-alm-campo="tipo">${t}</label>`).join("")}
        </div>

        <section class="alm-mat" aria-label="Materiales">
          <div class="alm-mat__head"><h4>Materiales</h4></div>
          <form class="alm-agregar" data-alm-form="agregar" autocomplete="off">
            <input type="search" name="q" enterkeyhint="done" placeholder="Código o nombre de la pieza" aria-label="Agregar material por código o nombre">
            <button class="button button--light" type="submit">Agregar</button>
          </form>
          ${b.lineas.length ? `${htmlPrincipal(b)}
            <ol class="alm-lineas">${lineas}</ol>
            <datalist id="almCausasUsadas">${usados("causa")}</datalist><datalist id="almTransUsados">${usados("trans")}</datalist>
            <div class="alm-mat__total"><span class="pl-soft">${sinPrecio ? `${sinPrecio} ${sinPrecio === 1 ? "renglón" : "renglones"} sin precio en el RE356` : "Valorizado con el precio del RE356"}</span><span>Total <strong>${esc(pesoCorto(total))}</strong></span></div>`
          : `<p class="alm-sol-vacia">Todavía no hay materiales. Búscalos y pulsa <strong>Pedir</strong>, o escribe el código aquí arriba.</p>`}
        </section>

        <h4 class="alm-datos-t">Datos de la solicitud</h4>
        <div class="tk-form alm-form">
          <div class="tk-row2">${campo("fecha", "Fecha", 'type="date"')}${campo("area", "Área", 'placeholder="Mantenimiento"')}</div>
          <div class="tk-row2">${campo("departamento", "Departamento")}${campo("destino", "Destino (equipo)", 'placeholder="Equipo o lugar" list="almDestinos"')}</div>
          <datalist id="almDestinos">${[...new Set(((window.MTTO && window.MTTO.catalogo.equipos) || []).map((x) => x.eq))].map((x) => `<option value="${esc(x)}">`).join("")}</datalist>
          ${P() ? `<label>Centro de costo<select data-alm-campo="cc">${P().opcionesCC(b.cc || "")}</select></label>${avisoCC}` : ""}
          <div class="tk-row2">${campo("solicitadoPor", "Solicitado por")}${campo("alistadoPor", "Alistado por", 'placeholder="Lo llena almacén"')}</div>
        </div>
        <label class="alm-obs">Observaciones
          <textarea rows="2" maxlength="${OBS_MAX}" data-alm-campo="observaciones">${esc(b.observaciones)}</textarea>
          <span class="pl-soft" id="almObsCuenta">${(b.observaciones || "").length}/${OBS_MAX}</span>
        </label>
        ${hs.length > 1 ? `<p class="alm-cc-nota alm-hojas">Sale en <b>${hs.length} hojas</b>: ${listaHojas(hs)}. Lo que no hay en ${esc(hs[0].alm)} va en otra hoja, porque almacén no recibe almacenes distintos en la misma.</p>` : ""}
        <div class="alm-acciones">
          <button class="button button--dark" type="button" data-alm="emitir" ${b.lineas.length ? "" : "disabled"}>${b.editando ? "Guardar la corrección y descargar" : "Descargar el formato lleno"}</button>
          ${b.editando ? `<button class="pl-reg" type="button" data-alm="vaciar">Cancelar la corrección</button>` : b.lineas.length ? `<button class="pl-reg" type="button" data-alm="vaciar">Vaciar</button>` : ""}
        </div>
      </div>`;
  }

  const ESTADOS_SOL = { emitida: "Pedida", entregada: "Entregada", anulada: "Anulada", pedido: "Pedido por Telegram", atendido: "Atendido" };
  function htmlHistorial() {
    const lista = historial.filter((s) => s.estado !== "pedido" && s.estado !== "atendido");
    if (!lista.length) return "";
    const filas = lista.slice(0, vista.histTodo ? 200 : 15).map((s) => {
      const { total } = totalSolicitud(s);
      const est = s.estado || "emitida";
      return `
      <tr class="${vista.resaltar === s.id ? "is-resaltada" : ""}" id="sol-${esc(s.id)}">
        <td class="ux-nowrap">${esc(s.fecha)}</td>
        <td>${esc(TIPOS[s.tipo] || s.tipo || "")}</td>
        <td>${esc(s.destino) || "&mdash;"}</td>
        <td>${s.cc ? `<span class="pp-cc__cod" title="${esc(P() ? P().nombreCC(s.cc) : "")}">${esc(s.cc)}</span>` : `<button class="pl-reg" type="button" data-alm="asignar-cc" data-id="${esc(s.id)}">asignar</button>`}</td>
        <td class="pl-num">${(s.lineas || []).length}</td>
        <td class="pl-num"><strong>${total ? esc(pesoCorto(total)) : "—"}</strong></td>
        <td>${esc(s.solicitadoPor) || "&mdash;"}</td>
        <td><span class="pl-tag ${est === "entregada" ? "pl-tag--ok" : est === "anulada" ? "pl-tag--n" : "pl-tag--warn"}">${esc(ESTADOS_SOL[est] || est)}</span></td>
        <td class="pl-num alm-hist-acc">
          ${est === "emitida" ? `<button class="pl-reg" type="button" data-alm="entregada" data-id="${esc(s.id)}" title="Almacén ya entregó las piezas">Entregada</button>` : ""}
          ${est !== "anulada" ? `<button class="pl-reg" type="button" data-alm="editar" data-id="${esc(s.id)}" title="Corregir piezas, cantidades, almacén o datos y volver a descargarla">Corregir</button>` : ""}
          <button class="pl-reg" type="button" data-alm="redescargar" data-id="${esc(s.id)}" title="Volver a descargar el formato (con una hoja aparte para lo que salga de otro almacén)">Descargar</button>
          <button class="pl-reg" type="button" data-alm="copiar" data-id="${esc(s.id)}" title="Empezar una solicitud nueva con estas mismas piezas">Repetir</button>
          ${est !== "anulada" && est !== "entregada" ? `<button class="pl-reg" type="button" data-alm="anular" data-id="${esc(s.id)}" title="No se usó: deja de contar en el presupuesto">Anular</button>` : ""}
        </td>
      </tr>`;
    }).join("");
    return `
      <h3 class="alm-hist-titulo">Solicitudes hechas <span class="pl-tag pl-tag--n">${lista.length}</span></h3>
      <div class="pl-tablewrap"><table class="pl-table alm-hist">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Destino</th><th>Centro</th><th class="pl-num">Art.</th><th class="pl-num">Valor</th><th>Solicitó</th><th>Estado</th><th></th></tr></thead>
        <tbody>${filas}</tbody>
      </table></div>
      ${lista.length > 15 && !vista.histTodo ? `<button class="pl-more" type="button" data-alm="hist-todo">Ver las ${lista.length} solicitudes</button>` : ""}`;
  }

  // Pedidos que llegan por Telegram (/pedir): se pasan a una solicitud con un toque
  function htmlPedidos() {
    const pedidos = historial.filter((s) => s.estado === "pedido");
    if (!pedidos.length) return "";
    return `<div class="alm-pedidos">
      <div class="alm-pedidos__head"><b>Pedidos que llegaron por Telegram</b><span class="pl-tag pl-tag--warn">${pedidos.length}</span></div>
      ${pedidos.map((s) => `<div class="alm-pedido">
        <div><strong>${(s.lineas || []).map((l) => `${esc(l.cant)} × ${esc(l.desc || l.cod)}`).join(", ")}</strong>
          <span class="pl-soft">${s.destino ? "Para " + esc(s.destino) + " · " : ""}${esc(s.solicitadoPor || "Alguien")} · ${esc(s.fecha)}${s.nota ? " · " + esc(s.nota) : ""}</span></div>
        <div class="alm-pedido__acc"><button class="button button--dark" type="button" data-alm="pedido-usar" data-id="${esc(s.id)}">Pasar a la solicitud</button><button class="pl-reg" type="button" data-alm="pedido-descartar" data-id="${esc(s.id)}">Descartar</button></div>
      </div>`).join("")}
    </div>`;
  }

  // ------------------------------------------------------------------------
  //  Acciones
  // ------------------------------------------------------------------------
  function avisar(tipo, html) { vista.aviso = { tipo, html }; pintarFuente(); }

  function agregar(cod) {
    if (borrador.lineas.some((l) => l.cod === cod)) return;
    if (borrador.lineas.length >= RENGLONES) {
      avisar("error", `El formato tiene ${RENGLONES} renglones y ya est&aacute;n llenos. Descarga esta solicitud y empieza otra.`);
      return;
    }
    const it = itemDe(cod);
    // Trans. y Codigo causa son de cada articulo: se dejan vacios para que no
    // se arrastre sin querer el de la pieza anterior a una que no le toca.
    // El estante lo pone elegirSitios: del almacen principal si lo tiene.
    borrador.lineas.push({ cod, desc: it ? it.desc : "", um: it ? it.um : "", cant: 1, sitio: "", trans: "", causa: "" });
    elegirSitios();
    guardarBorrador();
    pintarSolicitud(); pintarResultados();
    // Un solo aviso a la vez: si se piden varias seguidas no se apilan tapando la lista.
    document.querySelectorAll("#uxToasts [data-alm-aviso]").forEach((t) => t.remove());
    window.SHELL?.toast(`Renglón ${borrador.lineas.length}: <b>${esc(it ? it.desc || cod : cod)}</b>`, { accion: { txt: "Ver solicitud", fn: verSol } });
    const ultimo = document.getElementById("uxToasts")?.lastElementChild;
    if (ultimo) ultimo.dataset.almAviso = "1";
  }

  // "Agregar por código o nombre" dentro de la solicitud: un código exacto (o
  // una búsqueda con un solo resultado) entra directo; si hay varios, se
  // muestran en los resultados para elegir.
  function agregarPorTexto(txt) {
    const t = String(txt || "").trim();
    if (!t) return false;
    const norm = window.INVENTARIO ? window.INVENTARIO.norm : (v) => String(v || "").trim().toUpperCase();
    if (itemDe(norm(t))) { agregar(norm(t)); return true; }
    vista.q = t; vista.limite = 60; vista.todo = true;
    const caja = document.getElementById("almQ");
    if (caja) caja.value = t;
    const { lista } = buscar();
    if (lista.length === 1) { agregar(lista[0].cod); pintarResultados(); return true; }
    pintarResultados();
    document.getElementById("almResultados")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.SHELL?.toast(lista.length ? `Hay ${lista.length} que coinciden con «${esc(t)}»: pulsa <b>Pedir</b> en la que es.` : `Nada coincide con «${esc(t)}».`, { tipo: lista.length ? "ok" : "warn" });
    return false;
  }

  function quitar(cod) {
    borrador.lineas = borrador.lineas.filter((l) => l.cod !== cod);
    guardarBorrador();
    pintarSolicitud(); pintarResultados();
  }

  // Carga perezosa de las librerias: solo hacen falta al leer un Excel o llenar el formato.
  const cargando = {};
  function script(url, global) {
    if (window[global]) return Promise.resolve(window[global]);
    if (!cargando[url]) {
      cargando[url] = new Promise((ok, mal) => {
        const s = document.createElement("script");
        s.src = url; s.async = true;
        s.onload = () => (window[global] ? ok(window[global]) : mal(new Error("No se cargo " + global)));
        s.onerror = () => { delete cargando[url]; mal(new Error("No se pudo descargar " + url + ". Hace falta internet la primera vez.")); };
        document.head.appendChild(s);
      });
    }
    return cargando[url];
  }
  // Los modulos y el formato llevan la misma version (?v=) que este archivo en
  // index.html: si no, tras una actualizacion el navegador podria seguir usando
  // una copia vieja guardada en cache.
  const modulo = (ruta) => import(new URL(ruta + VERSION, document.baseURI).href);

  // Todo reporte que se carga queda en la nube: lo ven los demás equipos y no
  // se pierde si este navegador se borra. Sin señal queda en cola y sube solo.
  function guardarEnNube(filas) {
    if (!(window.CLOUD && window.CLOUD.enabled) || !window.INVENTARIO.subirNube) { vista.nube = { estado: "local" }; pintarFuente(); return; }
    vista.nube = { estado: "subiendo" };
    pintarFuente();
    window.INVENTARIO.subirNube(filas).then((r) => {
      vista.nube = r.ok ? { estado: "ok", parcial: r.parcial } : { estado: "error", motivo: r.motivo };
      pintarFuente();
    });
  }

  async function leerArchivo(archivo) {
    if (!archivo) return;
    vista.aviso = null; vista.trabajando = `Leyendo ${archivo.name}…`; pintarFuente();
    try {
      const [XLSX, lector] = await Promise.all([script(CDN.xlsx, "XLSX"), modulo("assets/js/lector-inventario.mjs")]);
      const libro = XLSX.read(await archivo.arrayBuffer(), { type: "array", cellDates: false, raw: true });
      const codigos = new Set();
      planEquipos().forEach((eq) => (eq.r || []).forEach((r) => { const c = lector.normCod(r.cod); if (c) codigos.add(c); }));
      const { filas, diagnostico: d } = lector.analizarLibro(libro, XLSX.utils, codigos, { nombre: archivo.name });
      if (!d.columnas.exist) throw new Error(`Encontré los códigos pero no la columna de existencias. Columnas: ${d.titulosDisponibles.join(", ")}`);
      // El RE356R (maestro de artículos) trae todos los códigos con su
      // existencia, pero no el estante. Cargado encima de un RE356, se conserva
      // dónde estaba cada cosa en vez de dejar "Dónde" en blanco. Si estaba en
      // varios estantes, el reparto entre ellos ya no se sabe: queda sin número.
      const sinEstantes = !d.columnas.ub && !d.columnas.alm;
      let conservados = 0;
      if (sinEstantes) {
        const antes = window.INVENTARIO.todo || {};
        filas.forEach((f) => {
          const a = antes[lector.normCod(f.cod)];
          const sitios = a ? (a.sitios || []).filter((x) => x.alm || x.ub) : [];
          if (!sitios.length) return;
          f.ub = a.ub || "";
          f.sitios = sitios.length === 1 ? [{ alm: sitios[0].alm, ub: sitios[0].ub, exist: f.exist ?? 0 }] : sitios.map((x) => ({ alm: x.alm, ub: x.ub, exist: null }));
          conservados++;
        });
      }
      // Antes de reemplazar el inventario: qué bajó desde la carga anterior.
      // Así queda el historial de lo que cada persona sube y de lo que salió.
      const previo = { ...(window.INVENTARIO.todo || {}) };
      const carga = resumenCarga(filas, previo, codigos, lector.normCod);
      const r = window.INVENTARIO.cargarLocal(filas, { archivo: archivo.name });
      window.PRESUPUESTO?.registrarCarga({ ...carga, archivo: archivo.name, origen: "archivo", hoja: d.hoja });
      vista.ultimaCarga = filas;
      cache = { inv: null, m: null, lista: [] };
      vista.trabajando = "";
      const peso2 = (n) => (window.NUCLEO ? window.NUCLEO.fmt.dineroCorto(n) : n);
      avisar("ok", `<strong>${r.articulos.toLocaleString("es-CO")}</strong> artículos de <strong>${esc(archivo.name)}</strong> · valorizado en <strong>${esc(peso2(carga.valorInventario))}</strong>`
        + (carga.primera ? "" : ` · bajaron <strong>${carga.salidas}</strong> códigos desde la carga anterior`)
        + (sinEstantes ? (conservados ? ` · sin estantes: conservé los de ${conservados.toLocaleString("es-CO")} códigos` : " · este reporte no trae estantes") : "")
        + (r.guardado ? "" : ". <strong>Ojo:</strong> no cupo en la memoria de este navegador"));
      guardarEnNube(filas);
      pintarResultados(); pintarSolicitud();
    } catch (e) {
      vista.trabajando = "";
      avisar("error", "No pude leer el reporte: " + esc(e.message || e));
    }
  }

  // Compara el RE356 nuevo con el que había: valor del inventario y lo que
  // salió (bajó la existencia o desapareció del reporte, que no lista ceros).
  function resumenCarga(filas, previo, codigosPlan, normCod) {
    let valorInventario = 0, valorPlan = 0, entradas = 0;
    const det = [];
    const nuevo = new Map();
    filas.forEach((f) => { const k = normCod(f.cod); if (k) nuevo.set(k, f); });
    nuevo.forEach((f, k) => {
      const pu = Number(f.pu) || 0;
      const v = (Number(f.exist) || 0) * pu;
      valorInventario += v;
      if (codigosPlan.has(k)) valorPlan += v;
      const a = previo[k];
      if (!a) return;
      const dif = (Number(a.exist) || 0) - (Number(f.exist) || 0);
      if (dif > 0) det.push({ cod: k, desc: f.desc || a.desc || "", antes: Number(a.exist) || 0, ahora: Number(f.exist) || 0, dif, pu: pu || Number(a.pu) || 0, valor: dif * (pu || Number(a.pu) || 0), plan: codigosPlan.has(k) });
      else if (dif < 0) entradas++;
    });
    Object.entries(previo).forEach(([k, a]) => {
      if (nuevo.has(k) || !(Number(a.exist) > 0)) return;
      det.push({ cod: k, desc: a.desc || "", antes: Number(a.exist), ahora: 0, dif: Number(a.exist), pu: Number(a.pu) || 0, valor: Number(a.exist) * (Number(a.pu) || 0), plan: codigosPlan.has(k), agotado: true });
    });
    det.sort((x, y) => y.valor - x.valor);
    return {
      articulos: nuevo.size, valorInventario, valorPlan, entradas, salidas: det.length,
      valorSalidas: det.reduce((s, d) => s + d.valor, 0), detalle: det.slice(0, 300),
      primera: !Object.keys(previo).length,
    };
  }

  function datosFormato(s) {
    return {
      tipo: s.tipo, fecha: s.fecha, area: s.area, departamento: s.departamento, destino: s.destino,
      alistadoPor: s.alistadoPor, solicitadoPor: s.solicitadoPor, autorizadoPor: s.autorizadoPor,
      observaciones: s.observaciones, almacen: principalDe(s),
      lineas: s.lineas.map((l) => {
        const [alm, ub] = String(l.sitio || "").split("|");
        return { cod: l.cod, desc: l.desc, um: l.um, cant: l.cant, alm: alm || "", ub: ub || "", trans: l.trans || "", causa: l.causa || "" };
      }),
    };
  }

  async function descargarFormato(s) {
    const [JSZip, formato, plantilla] = await Promise.all([
      script(CDN.jszip, "JSZip"),
      modulo("assets/js/formato-dad010a.mjs"),
      fetch(new URL("assets/formatos/DAD-010A.xlsx" + VERSION, document.baseURI)).then((r) => { if (!r.ok) throw new Error("No encuentro el formato DAD-010A.xlsx"); return r.arrayBuffer(); }),
    ]);
    const blob = await formato.rellenarDAD010A(JSZip, plantilla, datosFormato(s), "blob");
    const nombre = `DAD-010A ${s.fecha}${s.destino ? " " + s.destino.replace(/[\\/:*?"<>|#]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 40) : ""}.xlsx`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return nombre;
  }

  async function emitir() {
    const b = borrador;
    const faltan = [];
    if (!b.lineas.length) faltan.push("al menos una pieza");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.fecha || "")) faltan.push("la fecha");
    if (!b.tipo) faltan.push("si es traslado, consumo o devolución");
    const sinCant = b.lineas.filter((l) => !(Number(l.cant) > 0));
    if (sinCant.length) faltan.push(`la cantidad de ${sinCant.map((l) => l.cod).join(", ")}`);
    if (faltan.length) { avisar("error", "Falta " + faltan.map(esc).join(", ") + "."); return; }

    vista.aviso = null; vista.trabajando = "Llenando el formato…"; pintarFuente();
    try {
      const nombre = await descargarFormato(b);
      // El precio y el centro de costo quedan fijos en la solicitud: si mañana
      // cambia el precio en el RE356, lo que ya se pidió no se revaloriza.
      const lineas = b.lineas.map((l) => ({ ...l, pu: l.pu || precio(l.cod) || null, cc: l.cc || b.cc || "" }));
      const valor = totalSolicitud({ lineas }).total;
      const quien = window.NUCLEO ? window.NUCLEO.usuario.get() : "";
      const { editando, editandoFecha, editandoDestino, ...datos } = b;
      const original = editando ? historial.find((x) => x.id === editando) : null;
      // Una corrección reemplaza la misma solicitud: mismo id, misma fecha de
      // creación y mismo estado (si ya estaba entregada, sigue entregada).
      const registro = JSON.parse(JSON.stringify(original
        ? { ...original, ...datos, lineas, valor, almacenHoja: principalDe(b), corregidaEn: new Date().toISOString(), corregidaPor: quien }
        : { ...datos, lineas, valor, almacenHoja: principalDe(b), estado: "emitida", por: quien, id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), createdAt: new Date().toISOString() }));
      registrar(registro);
      borrador = nuevoBorrador(b);
      guardarBorrador();
      vista.trabajando = "";
      const hs = hojasDe(b.lineas, principalDe(b));
      vista.aviso = null;
      window.SHELL?.toast(`${original ? "Solicitud corregida · " : ""}Descargado${hs.length > 1 ? ` · ${hs.length} hojas (${hs.map((h) => esc(h.alm)).join(", ")})` : ""}`);
      pintarSolicitud(); pintarResultados(); pintarHistorial();
    } catch (e) {
      vista.trabajando = "";
      avisar("error", "No se pudo llenar el formato: " + esc(e.message || e));
    }
  }

  // Las solicitudes se comparten con el taller igual que las tareas.
  function registrar(s) {
    // Si ya estaba (una corrección, un cambio de estado) se reemplaza en su sitio.
    const i = historial.findIndex((x) => x.id === s.id);
    historial = i >= 0 ? historial.map((x, j) => (j === i ? s : x)) : [s, ...historial];
    guardar(HISTORIAL, historial);
    const cloud = window.CLOUD;
    if (cloud && cloud.enabled && cloud.db) {
      cloud.db.collection("solicitudes").doc(s.id).set(JSON.parse(JSON.stringify(s))).catch((e) => { console.error("[Solicitudes] guardar nube:", e); window.NUCLEO?.marcar("solicitudes", e && e.code === "permission-denied" ? "denegado" : "error"); });
    }
    window.diarioRenderSiVisible?.();
  }

  function suscribir() {
    const cloud = window.CLOUD;
    if (!(cloud && cloud.enabled && cloud.db)) return;
    cloud.db.collection("solicitudes").onSnapshot((snap) => {
      const remoto = [];
      snap.forEach((d) => remoto.push(d.data()));
      // Lo guardado aquí que la nube aún no tiene (reglas nuevas, sin conexión)
      // no se pierde: se conserva y se vuelve a subir.
      const ids = new Set(remoto.map((s) => s.id));
      const soloAqui = historial.filter((s) => s && s.id && !ids.has(s.id));
      soloAqui.forEach((s) => cloud.db.collection("solicitudes").doc(s.id).set(JSON.parse(JSON.stringify(s))).catch(() => {}));
      historial = [...remoto, ...soloAqui].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      guardar(HISTORIAL, historial);
      if (esVisible()) { pintarHistorial(); pintarPedidos(); }
      window.diarioRenderSiVisible?.();
    }, (err) => { console.error("[Solicitudes] onSnapshot:", err); window.NUCLEO?.marcar("solicitudes", err && err.code === "permission-denied" ? "denegado" : "error"); });
  }

  function pintarPedidos() { const p = document.getElementById("almPedidos"); if (p) p.innerHTML = htmlPedidos(); }

  // Cambia el estado de una solicitud (entregada, anulada…) y lo comparte
  function ponerEstado(id, estado, extra = {}) {
    const s = historial.find((x) => x.id === id);
    if (!s) return;
    const n = { ...s, ...extra, estado, updatedAt: new Date().toISOString() };
    if (estado === "entregada") n.entregadaEn = n.updatedAt;
    registrar(n);
    if (esVisible()) { pintarHistorial(); pintarPedidos(); }
  }

  // ------------------------------------------------------------------------
  //  Eventos (delegados: los codigos van en data-, nunca dentro de un onclick)
  // ------------------------------------------------------------------------
  function enlazar() {
    const raiz = document.getElementById("almRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";

    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-alm]");
      if (!b) return;
      const accion = b.dataset.alm;
      if (accion === "agregar") agregar(b.dataset.cod);
      else if (accion === "quitar") quitar(b.dataset.cod);
      else if (accion === "mas") { vista.limite += 60; pintarResultados(); }
      else if (accion === "todo" || accion === "porEquipo") { vista.todo = accion === "todo"; vista.limite = 60; pintarResultados(); }
      else if (accion === "filtro") { vista.filtro = vista.filtro === b.dataset.v ? "" : b.dataset.v; vista.limite = 60; pintarResultados(); }
      else if (accion === "emitir") emitir();
      else if (accion === "vaciar") { if (window.confirm(borrador.editando ? "¿Descartar la corrección? La solicitud queda como estaba." : "¿Vaciar la solicitud?")) { borrador = nuevoBorrador(borrador); guardarBorrador(); pintarSolicitud(); pintarResultados(); } }
      else if (accion === "maestro") { window.MAESTRO?.cargar({ reintentar: true }); pintarFuente(); }
      else if (accion === "ir-sol") verSol();
      else if (accion === "sol-ocultar") ocultarSol(true);
      else if (accion === "sol-mostrar") verSol();
      else if (accion === "cant-menos" || accion === "cant-mas") {
        const l = borrador.lineas[+b.dataset.i];
        if (!l) return;
        const n = Number(l.cant) || 0;
        l.cant = accion === "cant-mas" ? n + 1 : Math.max(1, n - 1);
        guardarBorrador(); pintarSolicitud();
      }
      else if (accion === "olvidar") { window.INVENTARIO.olvidarLocal(); cache = { inv: null, m: null, lista: [] }; vista.aviso = null; render(); }
      else if (accion === "redescargar") {
        const s = historial.find((x) => x.id === b.dataset.id);
        if (s) descargarFormato(s).catch((err) => avisar("error", "No se pudo llenar el formato: " + esc(err.message || err)));
      } else if (accion === "editar") {
        const s = historial.find((x) => x.id === b.dataset.id);
        if (!s) return;
        if (borrador.lineas.length && borrador.editando !== s.id && !window.confirm("La solicitud que estás llenando se reemplaza. ¿Seguir?")) return;
        // Se corrige la misma: conserva su id, su fecha de creación, su estado y
        // los precios con que se valorizó. Cada pieza sigue saliendo de donde
        // salía; si se cambia "Sacar de", se vuelve a repartir todo.
        const c = JSON.parse(JSON.stringify(s));
        borrador = {
          ...nuevoBorrador(c), tipo: c.tipo || "consumo", fecha: c.fecha || hoy(), area: c.area || "", departamento: c.departamento || "",
          destino: c.destino || "", alistadoPor: c.alistadoPor || "", solicitadoPor: c.solicitadoPor || "", autorizadoPor: c.autorizadoPor || "",
          cc: c.cc || "", observaciones: c.observaciones || "", almacen: c.almacen || "",
          lineas: (c.lineas || []).map((l) => ({ ...l, sitioManual: l.sitioManual || !!l.sitio })),
          editando: c.id, editandoFecha: c.fecha || "", editandoDestino: c.destino || "",
        };
        guardarBorrador(); pintarSolicitud(); pintarResultados();
        document.getElementById("almSolicitud")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (accion === "copiar") {
        const s = historial.find((x) => x.id === b.dataset.id);
        if (!s) return;
        if (borrador.lineas.length && !window.confirm("La solicitud que estás llenando se reemplaza. ¿Seguir?")) return;
        borrador = { ...nuevoBorrador(s), tipo: s.tipo, destino: s.destino, cc: s.cc || "", almacen: s.almacen || "", lineas: JSON.parse(JSON.stringify(s.lineas || [])).map((l) => ({ ...l, pu: null })) };
        elegirSitios();
        guardarBorrador(); pintarSolicitud(); pintarResultados();
        document.getElementById("almSolicitud")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      else if (accion === "entregada") { ponerEstado(b.dataset.id, "entregada"); window.SHELL?.toast("Solicitud marcada como entregada"); }
      else if (accion === "anular") { if (window.confirm("¿Anular la solicitud? Deja de contar en el presupuesto.")) { ponerEstado(b.dataset.id, "anulada"); } }
      else if (accion === "hist-todo") { vista.histTodo = true; pintarHistorial(); }
      else if (accion === "ver-hist") { vista.histTodo = true; pintarHistorial(); document.getElementById("almHistorial")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      else if (accion === "ir-presupuesto") window.goPresupuesto?.();
      else if (accion === "asignar-cc") {
        const s = historial.find((x) => x.id === b.dataset.id);
        if (!s) return;
        const sug = window.PRESUPUESTO ? window.PRESUPUESTO.ccSugerido(s.destino) : "";
        const cc = window.prompt(`Centro de costo para la solicitud del ${s.fecha}${s.destino ? " (" + s.destino + ")" : ""}.\nEscribe el código (ej. S1, L0, SD):`, sug || "");
        if (cc && cc.trim()) { ponerEstado(s.id, s.estado || "emitida", { cc: cc.trim().toUpperCase(), lineas: (s.lineas || []).map((l) => ({ ...l, cc: l.cc || cc.trim().toUpperCase() })) }); window.SHELL?.toast(`Cargada a ${esc(cc.trim().toUpperCase())}`); }
      }
      else if (accion === "pedido-usar") {
        const s = historial.find((x) => x.id === b.dataset.id);
        if (!s) return;
        (s.lineas || []).forEach((l) => {
          if (borrador.lineas.some((x) => x.cod === l.cod) || borrador.lineas.length >= RENGLONES) return;
          const it = itemDe(l.cod);
          borrador.lineas.push({ cod: l.cod || "", desc: l.desc || (it ? it.desc : ""), um: it ? it.um : "", cant: l.cant || 1, sitio: "", trans: "", causa: "" });
        });
        elegirSitios();
        if (!borrador.destino && s.destino) borrador.destino = s.destino;
        if (!borrador.cc && s.destino && window.PRESUPUESTO) borrador.cc = window.PRESUPUESTO.ccSugerido(s.destino);
        if (!borrador.observaciones && s.nota) borrador.observaciones = String(s.nota).slice(0, OBS_MAX);
        guardarBorrador();
        ponerEstado(s.id, "atendido");
        pintarSolicitud(); pintarResultados();
        window.SHELL?.toast("Pedido pasado a la solicitud: revisa cantidades y descarga el formato");
        document.getElementById("almSolicitud")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      else if (accion === "pedido-descartar") { if (window.confirm("¿Descartar este pedido?")) ponerEstado(b.dataset.id, "anulada"); }
      else if (accion === "dad-todas") {
        const [p0, ...resto] = borrador.lineas;
        if (!p0) return;
        resto.forEach((l) => { l.trans = p0.trans || ""; l.causa = p0.causa || ""; });
        guardarBorrador(); pintarSolicitud();
        window.SHELL?.toast(`Trans. y código causa iguales en los ${borrador.lineas.length} renglones`);
      }
      else if (accion === "subir-nube") guardarEnNube(vista.ultimaCarga || Object.values(window.INVENTARIO.todo || {}));
    });

    raiz.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.alm === "archivo") { leerArchivo(t.files && t.files[0]); t.value = ""; return; }
      if (t.dataset.alm === "fam") { vista.fam = t.value; vista.limite = 60; pintarResultados(); return; }
      if (t.dataset.almCampo === "tipo") { borrador.tipo = t.value; guardarBorrador(); pintarSolicitud(); return; }
      if (t.dataset.almCampo === "cc") { borrador.cc = t.value; guardarBorrador(); pintarSolicitud(); return; }
      if (t.dataset.almCampo === "almacen") {
        // Cambiar el principal vuelve a repartir todo, tambien lo tocado a mano.
        borrador.almacen = t.value;
        borrador.lineas.forEach((l) => { delete l.sitioManual; });
        elegirSitios(); guardarBorrador(); pintarSolicitud(); return;
      }
      if (t.dataset.almLinea !== undefined && (t.dataset.k === "sitio" || t.dataset.k === "cc")) {
        const l = borrador.lineas[+t.dataset.almLinea];
        l[t.dataset.k] = t.value;
        if (t.dataset.k === "sitio") l.sitioManual = true;
        guardarBorrador(); pintarSolicitud();
      }
    });

    // Lo que se escribe se guarda al momento pero sin repintar, para no perder el cursor.
    raiz.addEventListener("input", (e) => {
      const t = e.target;
      if (t.dataset.almCampo && t.dataset.almCampo !== "tipo") {
        borrador[t.dataset.almCampo] = t.value;
        guardarBorrador();
        if (t.dataset.almCampo === "observaciones") { const c = document.getElementById("almObsCuenta"); if (c) c.textContent = `${t.value.length}/${OBS_MAX}`; }
      } else if (t.dataset.almLinea !== undefined && ["cant", "trans", "causa"].includes(t.dataset.k)) {
        borrador.lineas[+t.dataset.almLinea][t.dataset.k] = t.value;
        guardarBorrador();
      }
    });
    // Recordar qué renglones tienen abiertos "Trans., causa y centro" al repintar
    raiz.addEventListener("toggle", (e) => {
      const d = e.target;
      if (!d.classList || !d.classList.contains("alm-linea__mas")) return;
      const cod = d.closest(".alm-linea")?.dataset.cod;
      if (cod) { if (d.open) vista.mas.add(cod); else vista.mas.delete(cod); }
    }, true);
    raiz.addEventListener("submit", (e) => {
      const f = e.target.closest("[data-alm-form]");
      if (!f) return;
      e.preventDefault();
      if (f.dataset.almForm === "agregar" && agregarPorTexto(f.q.value)) {
        // Para seguir agregando por código sin volver a tocar la casilla
        setTimeout(() => document.querySelector(".alm-agregar input")?.focus({ preventScroll: true }), 0);
      }
    });

    // Al salir de la cantidad si se repinta: para avisar si pide mas de lo que hay.
    raiz.addEventListener("focusout", (e) => {
      if (e.target.dataset && e.target.dataset.k === "cant") pintarSolicitud();
      // Al escribir el destino se propone el centro de costo de ese equipo
      if (e.target.dataset && e.target.dataset.almCampo === "destino" && !borrador.cc && window.PRESUPUESTO) {
        const cc = window.PRESUPUESTO.ccSugerido(borrador.destino);
        if (cc) { borrador.cc = cc; guardarBorrador(); pintarSolicitud(); }
      }
    });
  }

  function esVisible() { return document.getElementById("almacenView")?.classList.contains("is-active"); }

  // ------------------------------------------------------------------------
  //  Entrada
  // ------------------------------------------------------------------------
  // op: { q, filtro, destino, nota, solicitud } — así llegan Pendientes, la
  // búsqueda global, el Inicio y el presupuesto con lo que ya se sabe.
  function goAlmacen(op) {
    views.almacen = views.almacen || document.getElementById("almacenView");
    window.MAESTRO?.cargar({ reintentar: true });
    window.PRESUPUESTO?.asegurarDatos();
    if (op && typeof op === "object") {
      if (op.q !== undefined) { vista.q = String(op.q); vista.todo = false; vista.limite = 60; }
      if (op.filtro !== undefined) vista.filtro = op.filtro;
      if (op.destino && !borrador.destino) { borrador.destino = op.destino; if (!borrador.cc && window.PRESUPUESTO) borrador.cc = window.PRESUPUESTO.ccSugerido(op.destino); }
      if (op.nota && !borrador.observaciones) borrador.observaciones = String(op.nota).slice(0, OBS_MAX);
      if (op.solicitud) { vista.resaltar = op.solicitud; vista.histTodo = true; }
      guardarBorrador();
    }
    setView("almacen");
    render();
    enlazar();
    saveUiState({ activeView: "almacen" });
    window.scrollTo({ top: 0, behavior: "auto" });
    if (op && op.solicitud) setTimeout(() => document.getElementById("sol-" + op.solicitud)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    else if (window.matchMedia("(pointer: fine)").matches) setTimeout(() => document.getElementById("almQ")?.focus({ preventScroll: true }), 30);
  }

  window.goAlmacen = goAlmacen;
  window.almMarcarEntregada = (id) => ponerEstado(id, "entregada");
  window.almRenderSiVisible = () => { if (!esVisible()) return; cache = { inv: null, m: null, lista: [] }; pintarFuente(); pintarResultados(); pintarSolicitud(); };
  window.almSolicitudes = () => historial;
  window.almTipos = TIPOS;

  views.almacen = document.getElementById("almacenView");
  document.querySelector('[data-nav-view="almacen"]')?.addEventListener("click", goAlmacen);
  suscribir();
})();
