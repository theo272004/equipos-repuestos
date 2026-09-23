// ============================================================================
//  ALMACEN: buscar repuestos en el RE356 y llenar la solicitud DAD-010A
// ============================================================================
//  El buscador junta en una sola lista:
//    - Lo que hay en almacen (reporte RE356 de MiPortal, via assets/js/inventario.js)
//    - Las piezas del plan de mantenimiento, aunque almacen no las tenga
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
  const vista = { q: "", filtro: "", limite: 60, aviso: null, trabajando: "", todo: false };
  let borrador = cargar(BORRADOR, null) || nuevoBorrador();
  let historial = cargar(HISTORIAL, []);
  let cache = { inv: null, lista: [] };

  function cargar(k, def) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? def; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function nuevoBorrador(base) {
    // Lo que no cambia de una solicitud a otra se conserva: quien pide, su area.
    const b = base || {};
    return {
      tipo: b.tipo || "consumo", fecha: hoy(),
      area: b.area || "", departamento: b.departamento || "", destino: "",
      alistadoPor: "", solicitadoPor: b.solicitadoPor || "", autorizadoPor: "",
      observaciones: "", lineas: [],
    };
  }
  function guardarBorrador() { guardar(BORRADOR, borrador); }
  function causaDesc(code) {
    const c = String(code || "").trim().toUpperCase();
    const hit = c && (window.CAUSA_CODES || []).find((x) => String(x.code).toUpperCase() === c);
    return hit ? hit.desc : "";
  }

  // ------------------------------------------------------------------------
  //  La lista en la que se busca
  // ------------------------------------------------------------------------
  function planEquipos() { return (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || []; }

  function universo() {
    const inv = window.INVENTARIO ? window.INVENTARIO.todo : {};
    if (cache.inv === inv && cache.lista.length) return cache.lista;
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

    const items = [];
    Object.values(inv).forEach((a) => items.push({
      cod: a.cod, desc: a.desc || descPlan.get(a.cod) || "", um: a.um || "", exist: a.exist,
      min: a.min, sitios: (a.sitios || []).filter((s) => s.alm || s.ub), ub: a.ub || "",
      enBodega: true, equipos: uso.get(a.cod) || [],
    }));
    uso.forEach((equipos, cod) => {
      if (inv[cod]) return;
      items.push({ cod, desc: descPlan.get(cod) || "", um: "", exist: null, min: null, sitios: [], ub: "", enBodega: false, equipos });
    });
    items.forEach((it) => {
      it.hay = planPlain([it.cod, it.desc, it.ub, it.sitios.map((s) => `${s.alm}/${s.ub} ${s.alm} ${s.ub}`).join(" "), it.equipos.map((e) => `${e.n} ${e.c}`).join(" ")].join(" "));
      it.bajoMin = it.enBodega && it.min > 0 && (it.exist ?? 0) < it.min;
    });
    cache = { inv, lista: items };
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
    if (vista.filtro === "stock") lista = lista.filter((it) => it.exist > 0);
    if (vista.filtro === "plan") lista = lista.filter((it) => it.equipos.length);
    if (vista.filtro === "min") lista = lista.filter((it) => it.bajoMin);
    const eqs = tokens.length && !vista.todo ? equiposQueCoinciden(tokens) : [];
    if (eqs.length) {
      const cods = new Set(eqs.map((e) => e.c));
      lista = lista.filter((it) => it.equipos.some((e) => cods.has(e.c)));
    } else if (tokens.length) lista = lista.filter((it) => tokens.every((t) => it.hay.includes(t)));
    else if (!vista.filtro) return { lista: [], eqs };
    const peso = (it) => (planPlain(it.cod) === q ? 0 : planPlain(it.cod).startsWith(q) ? 1 : 2) * 10 + (it.exist > 0 ? 0 : it.enBodega ? 1 : 2);
    return { lista: lista.slice().sort((a, b) => peso(a) - peso(b) || String(a.desc).localeCompare(String(b.desc))), eqs };
  }

  // ------------------------------------------------------------------------
  //  Pintar
  // ------------------------------------------------------------------------
  function render() {
    const raiz = document.getElementById("almRoot");
    if (!raiz) return;
    raiz.innerHTML = `
      <div class="section-bar">
        <div>
          <p class="eyebrow">Almac&eacute;n</p>
          <h2>Buscar repuestos y pedirlos</h2>
        </div>
      </div>
      <div id="almFuente">${htmlFuente()}</div>
      <div class="alm-grid">
        <div class="alm-main">
          <div class="pl-filters">
            <input type="search" id="almQ" value="${esc(vista.q)}" placeholder="C&oacute;digo, descripci&oacute;n, estante o equipo (ej. rodamiento 6204, R01/Z0505, blisteadora 2)&hellip;" aria-label="Buscar en almac&eacute;n" autocomplete="off">
          </div>
          <div class="alm-chips" id="almChips">${htmlChips()}</div>
          <div id="almResultados">${htmlResultados()}</div>
        </div>
        <aside class="alm-side" id="almSolicitud">${htmlSolicitud()}</aside>
      </div>
      <div id="almHistorial">${htmlHistorial()}</div>`;
    const q = document.getElementById("almQ");
    q.addEventListener("input", () => { vista.q = q.value; vista.limite = 60; vista.todo = false; pintarResultados(); });
  }

  function pintarResultados() {
    const r = document.getElementById("almResultados");
    if (r) r.innerHTML = htmlResultados();
    const c = document.getElementById("almChips");
    if (c) c.innerHTML = htmlChips();
  }
  function pintarSolicitud() { const s = document.getElementById("almSolicitud"); if (s) s.innerHTML = htmlSolicitud(); }
  function pintarHistorial() { const h = document.getElementById("almHistorial"); if (h) h.innerHTML = htmlHistorial(); }
  function pintarFuente() { const f = document.getElementById("almFuente"); if (f) f.innerHTML = htmlFuente(); }

  function htmlFuente() {
    const inv = window.INVENTARIO;
    const hay = inv && inv.cargado;
    const f = inv ? inv.frescura() : { estado: "sin-datos", texto: "" };
    const archivo = inv && inv.fuente === "archivo";
    const aviso = vista.aviso ? `<p class="alm-aviso alm-aviso--${vista.aviso.tipo}" role="status">${vista.aviso.html}</p>` : "";
    const trabajando = vista.trabajando ? `<p class="alm-aviso alm-aviso--info" role="status">${esc(vista.trabajando)}</p>` : "";
    return `
      <div class="alm-fuente">
        <span class="pl-inv pl-inv--${hay ? f.estado : "sin-datos"}">${hay ? `${esc(f.texto)} &middot; ${inv.estado.articulos} art&iacute;culos` : "Sin reporte de almac&eacute;n cargado"}</span>
        <label class="pl-reg alm-cargar" title="El reporte RE356 de MiPortal, exportado con Generar Excel. Se lee en este equipo y no se sube a ning&uacute;n sitio.">
          Cargar reporte RE356&hellip;<input type="file" accept=".xls,.xlsx" data-alm="archivo" hidden>
        </label>
        ${archivo ? `<button class="pl-reg" type="button" data-alm="olvidar" title="Volver a lo que suba el puente de MiPortal">Quitar el archivo</button>` : ""}
      </div>
      ${hay ? "" : `<p class="pl-note">En MiPortal abre el reporte <strong>RE356</strong>, pulsa <strong>Generar Excel</strong> (si no, sale en PDF) y c&aacute;rgalo aqu&iacute;. Mientras tanto se busca solo en las piezas del plan, sin existencias.</p>`}
      ${trabajando}${aviso}`;
  }

  function htmlChips() {
    const lista = universo();
    const n = { stock: lista.filter((i) => i.exist > 0).length, plan: lista.filter((i) => i.equipos.length).length, min: lista.filter((i) => i.bajoMin).length };
    const chip = (id, txt, cant) => `<button type="button" class="alm-chip ${vista.filtro === id ? "is-on" : ""}" data-alm="filtro" data-v="${id}">${txt} <span>${cant}</span></button>`;
    return chip("stock", "Con existencia", n.stock) + chip("plan", "Piezas del plan", n.plan) + (n.min ? chip("min", "Bajo el m&iacute;nimo", n.min) : "");
  }

  function donde(it) {
    if (!it.sitios.length) return it.enBodega ? esc(it.ub || "—") : '<span class="pl-soft">no est&aacute; en almac&eacute;n</span>';
    return it.sitios.map((s) => `<span class="alm-sitio">${esc(s.alm)}/${esc(s.ub)}${it.sitios.length > 1 ? ` <b>${fmt(s.exist)}</b>` : ""}</span>`).join(" ");
  }
  function usadoEn(it) {
    if (!it.equipos.length) return '<span class="pl-soft">&mdash;</span>';
    const primeros = it.equipos.slice(0, 2).map((e) => esc(e.n)).join("<br>");
    return primeros + (it.equipos.length > 2 ? `<br><span class="pl-soft">y ${it.equipos.length - 2} m&aacute;s</span>` : "");
  }
  const fmt = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString("es-CO"));

  function htmlResultados() {
    const tokens = planTokens(vista.q);
    if (!tokens.length && !vista.filtro) {
      return `<div class="pl-empty"><h3>Escribe lo que buscas</h3><p>Por c&oacute;digo, por nombre de la pieza, por estante (R01/Z0505) o por el equipo que la usa.</p></div>`;
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
        <td>${planMark(it.desc, tokens) || "&mdash;"}${it.bajoMin ? ` <span class="pl-tag pl-tag--warn" title="M&iacute;nimo de almac&eacute;n: ${fmt(it.min)}">bajo el m&iacute;nimo</span>` : ""}</td>
        <td>${esc(it.um) || "&mdash;"}</td>
        <td class="pl-num"><strong>${fmt(it.exist)}</strong></td>
        <td class="alm-donde">${donde(it)}</td>
        <td class="pl-num">${it.min ? fmt(it.min) : "&mdash;"}</td>
        <td class="alm-uso">${usadoEn(it)}</td>
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

  function htmlSolicitud() {
    const b = borrador;
    const campo = (k, etiqueta, extra = "") => `<label>${etiqueta}<input data-alm-campo="${k}" value="${esc(b[k])}" ${extra}></label>`;
    const lineas = b.lineas.map((l, i) => {
      const it = universo().find((x) => x.cod === l.cod);
      const sitios = it ? it.sitios : [];
      const elegido = sitios.find((s) => `${s.alm}|${s.ub}` === l.sitio);
      const disp = elegido ? elegido.exist : it ? it.exist : null;
      const pasa = b.tipo !== "devolucion" && disp !== null && disp !== undefined && Number(l.cant) > disp;
      return `
        <tr>
          <td class="pl-code">${esc(l.cod)}</td>
          <td class="alm-sol-desc">${esc(l.desc) || "&mdash;"}${it && !it.enBodega ? '<br><span class="pl-tag pl-tag--warn">no est&aacute; en almac&eacute;n</span>' : ""}</td>
          <td><input class="pl-edit pl-edit--num alm-cant" type="number" min="0" step="any" inputmode="decimal" value="${esc(l.cant)}" data-alm-linea="${i}" data-k="cant" aria-label="Cantidad"> ${esc(l.um)}
            ${pasa ? `<span class="alm-pasa" title="Hay ${fmt(disp)} en ese sitio">hay ${fmt(disp)}</span>` : ""}</td>
          <td>${sitios.length > 1
            ? `<select class="alm-sitio-sel" data-alm-linea="${i}" data-k="sitio" aria-label="De qu&eacute; estante">${sitios.map((s) => `<option value="${esc(s.alm + "|" + s.ub)}" ${`${s.alm}|${s.ub}` === l.sitio ? "selected" : ""}>${esc(s.alm)}/${esc(s.ub)} &middot; ${fmt(s.exist)}</option>`).join("")}</select>`
            : esc(l.sitio ? l.sitio.replace("|", "/") : "—")}</td>
          <td><button class="alm-x" type="button" data-alm="quitar" data-cod="${esc(l.cod)}" aria-label="Quitar ${esc(l.cod)}">&times;</button></td>
        </tr>
        <tr class="alm-sol-sub">
          <td colspan="5">
            <label>Trans.<input class="pl-edit" id="alm-trans-${i}" value="${esc(l.trans)}" data-alm-linea="${i}" data-k="trans" autocomplete="off"></label>
            <label>C&oacute;digo causa<input class="pl-edit" id="alm-causa-${i}" value="${esc(l.causa)}" data-alm-linea="${i}" data-k="causa" list="almCausasLista" autocomplete="off" title="${esc(causaDesc(l.causa))}"></label>
          </td>
        </tr>`;
    }).join("");
    return `
      <div class="alm-sol">
        <div class="alm-sol__head">
          <h3>Solicitud de materiales</h3>
          <span class="pl-tag pl-tag--n" title="El formato DAD-010A tiene ${RENGLONES} renglones">${b.lineas.length}/${RENGLONES}</span>
        </div>
        <p class="pl-soft">Formato oficial DAD-010A &middot; Edici&oacute;n 1. Se llena el mismo archivo, solo con los datos.</p>
        ${b.ot ? `<p class="alm-aviso alm-aviso--info">Para la orden <strong>${esc(b.ot.numero || "de trabajo")}</strong>: queda enlazada a ella.</p>` : ""}
        <datalist id="almCausasLista">${(window.CAUSA_CODES || []).map((x) => `<option value="${esc(x.code)}">${esc(x.desc)}</option>`).join("")}</datalist>
        <div class="alm-tipo" role="radiogroup" aria-label="Tipo de solicitud">
          ${Object.entries(TIPOS).map(([k, t]) => `<label class="alm-chip ${b.tipo === k ? "is-on" : ""}"><input type="radio" name="almTipo" value="${k}" ${b.tipo === k ? "checked" : ""} data-alm-campo="tipo">${t}</label>`).join("")}
        </div>
        <div class="tk-form alm-form">
          <div class="tk-row2">${campo("fecha", "Fecha", 'type="date"')}${campo("area", "&Aacute;rea", 'placeholder="Mantenimiento"')}</div>
          <div class="tk-row2">${campo("departamento", "Departamento")}${campo("destino", "Destino", 'placeholder="Equipo o lugar"')}</div>
          <div class="tk-row2">${campo("solicitadoPor", "Solicitado por")}${campo("alistadoPor", "Alistado por", 'placeholder="Lo llena almac&eacute;n"')}</div>
        </div>
        ${b.lineas.length ? `
          <div class="pl-tablewrap alm-sol-wrap">
            <table class="pl-table alm-sol-table">
              <thead><tr><th>C&oacute;digo</th><th>Descripci&oacute;n</th><th>Cant.</th><th>Sacar de</th><th></th></tr></thead>
              <tbody>${lineas}</tbody>
            </table>
          </div>` : `<p class="pl-empty alm-sol-vacia">Busca a la izquierda y pulsa <strong>Pedir</strong> en cada pieza.</p>`}
        <label class="alm-obs">Observaciones
          <textarea rows="2" maxlength="${OBS_MAX}" data-alm-campo="observaciones">${esc(b.observaciones)}</textarea>
          <span class="pl-soft" id="almObsCuenta">${(b.observaciones || "").length}/${OBS_MAX}</span>
        </label>
        <div class="alm-acciones">
          <button class="button button--dark" type="button" data-alm="emitir" ${b.lineas.length ? "" : "disabled"}>Descargar el formato lleno</button>
          ${b.lineas.length ? `<button class="pl-reg" type="button" data-alm="vaciar">Vaciar</button>` : ""}
        </div>
      </div>`;
  }

  function htmlHistorial() {
    if (!historial.length) return "";
    const filas = historial.slice(0, 15).map((s) => `
      <tr>
        <td>${esc(s.fecha)}</td>
        <td>${esc(TIPOS[s.tipo] || s.tipo || "")}</td>
        <td>${esc(s.destino) || "&mdash;"}</td>
        <td class="pl-num">${(s.lineas || []).length}</td>
        <td>${esc(s.solicitadoPor) || "&mdash;"}</td>
        <td class="pl-num"><button class="pl-reg" type="button" data-alm="redescargar" data-id="${esc(s.id)}">Descargar</button>
          <button class="pl-reg" type="button" data-alm="copiar" data-id="${esc(s.id)}" title="Empezar una solicitud nueva con estas mismas piezas">Repetir</button></td>
      </tr>`).join("");
    return `
      <h3 class="alm-hist-titulo">Solicitudes hechas</h3>
      <div class="pl-tablewrap"><table class="pl-table alm-hist">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Destino</th><th class="pl-num">Art&iacute;culos</th><th>Solicit&oacute;</th><th></th></tr></thead>
        <tbody>${filas}</tbody>
      </table></div>`;
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
    const it = universo().find((x) => x.cod === cod);
    // Por defecto se saca del estante que mas tiene.
    const mejor = it && it.sitios.length ? it.sitios.slice().sort((a, b) => b.exist - a.exist)[0] : null;
    // Trans. y Codigo causa son de cada articulo: se dejan vacios para que no
    // se arrastre sin querer el de la pieza anterior a una que no le toca.
    // Si la solicitud sale de una orden de trabajo, el codigo de causa de la
    // orden es el punto de partida de cada renglon (se puede cambiar).
    borrador.lineas.push({ cod, desc: it ? it.desc : "", um: it ? it.um : "", cant: 1, sitio: mejor ? `${mejor.alm}|${mejor.ub}` : "", trans: "", causa: (borrador.ot && borrador.ot.causa) || "" });
    guardarBorrador();
    pintarSolicitud(); pintarResultados();
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
      const r = window.INVENTARIO.cargarLocal(filas, { archivo: archivo.name });
      cache = { inv: null, lista: [] };
      vista.trabajando = "";
      avisar("ok", `Le&iacute; <strong>${r.articulos.toLocaleString("es-CO")}</strong> art&iacute;culos de <strong>${esc(archivo.name)}</strong> (hoja ${esc(d.hoja)}); ${d.coincidenPlan} son piezas del plan. Queda solo en este equipo.`
        + (r.guardado ? "" : " <strong>Ojo:</strong> no cupo en la memoria del navegador; al recargar la p&aacute;gina habr&aacute; que cargarlo otra vez."));
      pintarResultados(); pintarSolicitud();
    } catch (e) {
      vista.trabajando = "";
      avisar("error", "No pude leer el reporte: " + esc(e.message || e));
    }
  }

  function datosFormato(s) {
    return {
      tipo: s.tipo, fecha: s.fecha, area: s.area, departamento: s.departamento, destino: s.destino,
      alistadoPor: s.alistadoPor, solicitadoPor: s.solicitadoPor, autorizadoPor: s.autorizadoPor,
      observaciones: s.observaciones,
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
      const registro = JSON.parse(JSON.stringify({ ...b, id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), createdAt: new Date().toISOString() }));
      registrar(registro);
      borrador = nuevoBorrador(b);
      guardarBorrador();
      vista.trabajando = "";
      avisar("ok", `Listo: <strong>${esc(nombre)}</strong>. &Aacute;brelo en Excel e impr&iacute;melo. La solicitud queda en la lista de abajo y en el Diario.`);
      pintarSolicitud(); pintarResultados(); pintarHistorial();
    } catch (e) {
      vista.trabajando = "";
      avisar("error", "No se pudo llenar el formato: " + esc(e.message || e));
    }
  }

  // Las solicitudes se comparten con el taller igual que las tareas.
  function registrar(s) {
    historial = [s, ...historial.filter((x) => x.id !== s.id)];
    guardar(HISTORIAL, historial);
    const cloud = window.CLOUD;
    if (cloud && cloud.enabled && cloud.db) {
      cloud.db.collection("solicitudes").doc(s.id).set(s).catch((e) => console.error("[Solicitudes] guardar nube:", e));
    }
    window.diarioRenderSiVisible?.();
  }

  function suscribir() {
    const cloud = window.CLOUD;
    if (!(cloud && cloud.enabled && cloud.db)) return;
    cloud.db.collection("solicitudes").onSnapshot((snap) => {
      const remoto = [];
      snap.forEach((d) => remoto.push(d.data()));
      historial = remoto.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      guardar(HISTORIAL, historial);
      if (esVisible()) pintarHistorial();
      window.diarioRenderSiVisible?.();
    }, (err) => console.error("[Solicitudes] onSnapshot:", err));
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
      else if (accion === "vaciar") { if (window.confirm("¿Vaciar la solicitud?")) { borrador = nuevoBorrador(borrador); guardarBorrador(); pintarSolicitud(); pintarResultados(); } }
      else if (accion === "olvidar") { window.INVENTARIO.olvidarLocal(); cache = { inv: null, lista: [] }; vista.aviso = null; render(); }
      else if (accion === "redescargar") {
        const s = historial.find((x) => x.id === b.dataset.id);
        if (s) descargarFormato(s).catch((err) => avisar("error", "No se pudo llenar el formato: " + esc(err.message || err)));
      } else if (accion === "copiar") {
        const s = historial.find((x) => x.id === b.dataset.id);
        if (!s) return;
        if (borrador.lineas.length && !window.confirm("La solicitud que estás llenando se reemplaza. ¿Seguir?")) return;
        borrador = { ...nuevoBorrador(s), tipo: s.tipo, destino: s.destino, lineas: JSON.parse(JSON.stringify(s.lineas || [])) };
        guardarBorrador(); pintarSolicitud(); pintarResultados();
        document.getElementById("almSolicitud")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    raiz.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.alm === "archivo") { leerArchivo(t.files && t.files[0]); t.value = ""; return; }
      if (t.dataset.almCampo === "tipo") { borrador.tipo = t.value; guardarBorrador(); pintarSolicitud(); return; }
      if (t.dataset.almLinea !== undefined && t.dataset.k === "sitio") {
        borrador.lineas[+t.dataset.almLinea].sitio = t.value; guardarBorrador(); pintarSolicitud();
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
    // Al salir de la cantidad si se repinta: para avisar si pide mas de lo que hay.
    raiz.addEventListener("focusout", (e) => { if (e.target.dataset && e.target.dataset.k === "cant") pintarSolicitud(); });
  }

  function esVisible() { return document.getElementById("almacenView")?.classList.contains("is-active"); }

  // ------------------------------------------------------------------------
  //  Entrada
  // ------------------------------------------------------------------------
  function goAlmacen() {
    views.almacen = views.almacen || document.getElementById("almacenView");
    setView("almacen");
    render();
    enlazar();
    saveUiState({ activeView: "almacen" });
    window.scrollTo({ top: 0, behavior: "auto" });
    setTimeout(() => document.getElementById("almQ")?.focus(), 30);
  }

  window.goAlmacen = goAlmacen;
  window.almRenderSiVisible = () => { if (!esVisible()) return; cache = { inv: null, lista: [] }; pintarFuente(); pintarResultados(); pintarSolicitud(); };
  window.almSolicitudes = () => historial;
  window.almTipos = TIPOS;
  // Desde una orden de trabajo: solicitud nueva dirigida a su equipo y enlazada.
  window.almNuevaParaOT = (ot) => {
    if (borrador.lineas.length && !(borrador.ot && borrador.ot.id === ot.id)
      && !window.confirm("La solicitud que estabas llenando se reemplaza por una para esta orden. \u00bfSeguir?")) return;
    if (!(borrador.ot && borrador.ot.id === ot.id)) borrador = { ...nuevoBorrador(borrador), destino: ot.destino || "", tipo: "consumo", ot: { id: ot.id, numero: ot.numero, causa: ot.causa || "" } };
    guardarBorrador();
    goAlmacen();
  };

  views.almacen = document.getElementById("almacenView");
  document.querySelector('[data-nav-view="almacen"]')?.addEventListener("click", goAlmacen);
  suscribir();
})();
