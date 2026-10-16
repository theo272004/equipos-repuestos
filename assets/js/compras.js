// ============================================================================
//  COMPRAS DE REPUESTOS: POR LLEGAR, ESTADO DE CADA PIEZA Y CUÁNDO PEDIR
// ============================================================================
//  Con las requisiciones (RE355) y las órdenes de compra de MiPortal, que carga
//  scripts/importar-compras.py en assets/js/compras-data.js, la app contesta:
//
//    - ¿Esa pieza ya está pedida? ¿En qué va (sin aprobar, sin orden de compra,
//      en camino, atrasada, recibida)? → COMPRAS.estadoDe(código), que usan
//      Pendientes, Cambios de piezas y el Inicio.
//    - ¿Qué viene en camino y qué se atrasó? → la pantalla «Por llegar».
//    - ¿Cuándo hay que pedir? → próximo cambio menos lo que tarda en llegar esa
//      pieza (COMPRAS.plazo / pedirAntes) y la pestaña «Por pedir».
//
//  Ojo con lo que dicen los reportes: «FEC ENTREGA» y «VENCE» son fechas
//  PROMETIDAS por el proveedor. No traen cuándo llegó de verdad: solo la
//  cantidad recibida y si la línea ya se cerró. Por eso «Recibida» no lleva
//  fecha y los plazos son los prometidos, no los reales.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);
  const D = window.COMPRAS_DATA || { lineas: [] };

  const dias = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);
  const suma = (f, d) => new Date(Date.parse(f + "T12:00:00Z") + d * 864e5).toISOString().slice(0, 10);
  const hoy = () => N.hoy();
  const corta = (f) => (f ? N.fmt.corta(f) : "—");
  const num = (n) => Number(n || 0).toLocaleString("es-CO", { maximumFractionDigits: 2 });
  const pvCorto = (p) => String(p || "").replace(/\s+(S\.?A\.?S\.?|S\.?A\.?|LTDA\.?|SAS|INC|S\.?A\.?S)\s*$/i, "").replace(/\s+/g, " ").trim().toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()).slice(0, 30);

  // ------------------------------------------------------------ etapas
  // rank: lo que más urge primero. tono: bad/warn/ok como en el resto de la app.
  const ET = {
    atrasada: { t: "Atrasada", rank: 0, tono: "bad" },
    parcial: { t: "Llegó parcial", rank: 1, tono: "warn" },
    camino: { t: "En camino", rank: 2, tono: "ok" },
    "oc-aprobar": { t: "OC por aprobar", rank: 3, tono: "warn" },
    "rq-oc": { t: "Requisición sin OC", rank: 4, tono: "warn" },
    "rq-aprobar": { t: "Requisición sin aprobar", rank: 5, tono: "warn" },
    plan: { t: "Planeada (MRP)", rank: 6, tono: "" },
    llego: { t: "Recibida", rank: 9, tono: "ok" },
  };
  const CERRADAS = new Set(["CERRADA", "CERRADA POR COSTEAR"]);

  function etapa(l, hy) {
    if (l.el === "ANULADA" || l.eo === "ANULADA") return null;
    const ord = l.o || 0, rec = l.r || 0;
    if (CERRADAS.has(l.el)) return rec > 0 ? { k: "llego" } : null;
    if (l.oc) {
      if (ord > 0 && rec >= ord) return { k: "llego" };
      if (/pend/i.test(l.es || "")) return { k: "oc-aprobar", desde: l.fo || l.fp };
      const prom = l.ve || l.fe || "";
      if (prom && prom < hy) return { k: "atrasada", prom, atraso: dias(prom, hy) };
      return { k: rec > 0 ? "parcial" : "camino", prom };
    }
    if (/sin aprob/i.test(l.es || "")) return { k: "rq-aprobar", desde: l.fp };
    if (/firme/i.test(l.es || "")) return { k: "plan", desde: l.fp };
    return { k: "rq-oc", desde: l.fp };
  }

  // ------------------------------------------------------------ el modelo
  let cache = null;
  function modelo() {
    const hy = hoy();
    if (cache && cache.hy === hy) return cache;
    const lineas = [];
    const porCod = new Map();
    D.lineas.forEach((l) => {
      const e = etapa(l, hy);
      if (!e) return;
      const x = { ...l, k: e.k, prom: e.prom || "", atraso: e.atraso || 0, desde: e.desde || "" };
      x.edad = l.fp ? Math.max(0, dias(l.fp, hy)) : 0;
      x.faltan = l.oc ? Math.max(0, (l.o || 0) - (l.r || 0)) : l.q || 0;
      lineas.push(x);
      if (!porCod.has(l.c)) porCod.set(l.c, []);
      porCod.get(l.c).push(x);
    });
    porCod.forEach((a) => a.sort((p, q) => (q.fp || "").localeCompare(p.fp || "")));
    cache = { hy, lineas, porCod, plazos: calcularPlazos(lineas) };
    return cache;
  }

  // Plazo prometido (de pedir a la fecha de entrega) por código y en general
  function pct(a, p) { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; }
  function calcularPlazos(lineas) {
    const todos = [], porCod = new Map();
    lineas.forEach((l) => {
      const f = l.ve || l.fe;
      if (!l.oc || !l.fp || !f) return;
      const d = dias(l.fp, f);
      if (d < 0 || d > 120) return;
      todos.push(d);
      if (!porCod.has(l.c)) porCod.set(l.c, []);
      porCod.get(l.c).push(d);
    });
    return { general: todos.length ? { dias: pct(todos, 0.9), mediana: pct(todos, 0.5), n: todos.length } : { dias: 30, mediana: 15, n: 0 }, porCod };
  }
  function plazo(cod) {
    const m = modelo();
    const a = m.plazos.porCod.get(cod);
    if (a && a.length >= 3) return { dias: pct(a, 0.9), n: a.length, base: "este código" };
    if (a && a.length) return { dias: Math.max(...a), n: a.length, base: "este código" };
    return { dias: m.plazos.general.dias, n: m.plazos.general.n, base: "todas las compras" };
  }
  // Fecha límite para pedir: próximo cambio − lo que tarda − una semana de holgura
  function pedirAntes(proximo, cod) {
    if (!proximo) return null;
    const p = plazo(cod);
    return { fecha: suma(proximo, -(p.dias + 7)), plazo: p.dias, base: p.base };
  }

  // ------------------------------------------------------------ por pieza
  function textoLinea(l) {
    const pv = l.pv ? pvCorto(l.pv) : "";
    const oc = l.oc ? `OC ${l.oc}` : l.rq && /^\d+$/.test(l.rq) ? `Req. ${l.rq}` : "";
    switch (l.k) {
      case "atrasada": return { corto: `atrasada ${l.atraso} d`, texto: `Atrasada ${l.atraso} d: debía llegar el ${corta(l.prom)} · ${oc}${pv ? " · " + pv : ""}` };
      case "parcial": return { corto: "llegó parcial", texto: `Llegó parcial (${num(l.r)} de ${num(l.o)}) · ${oc}${pv ? " · " + pv : ""}${l.prom ? " · el resto, prometido para el " + corta(l.prom) : ""}` };
      case "camino": return { corto: `llega ${corta(l.prom)}`, texto: `En camino · ${oc}${pv ? " · " + pv : ""}${l.prom ? " · prometida para el " + corta(l.prom) : ""}` };
      case "oc-aprobar": return { corto: `OC sin aprobar ${l.edad} d`, texto: `La orden de compra ${l.oc} lleva ${l.edad} d sin aprobarse` };
      case "rq-oc": return { corto: `sin OC (${l.edad} d)`, texto: `Requisición ${l.rq || ""} aprobada, sin orden de compra hace ${l.edad} d` };
      case "rq-aprobar": return { corto: `req. sin aprobar ${l.edad} d`, texto: `Requisición ${l.rq || ""} sin aprobar hace ${l.edad} d` };
      case "plan": return { corto: `planeada ${l.edad} d`, texto: `Planeada por el MRP, aún sin orden de compra (hace ${l.edad} d)` };
      default: return { corto: "recibida", texto: `Ya llegó (${num(l.r)} ${l.u || "u."}) · ${oc}${pv ? " · " + pv : ""}` };
    }
  }
  const tonoLinea = (l) => ((l.k === "oc-aprobar" || l.k === "rq-aprobar" || l.k === "rq-oc") && l.edad > 30 ? "bad" : ET[l.k].tono);

  // Estado de compra de un código: lo abierto más urgente, o lo último recibido, o «sin pedido»
  function estadoDe(cod) {
    cod = String(cod || "").trim().toUpperCase();
    const m = modelo();
    const ls = m.porCod.get(cod) || [];
    const abiertas = ls.filter((l) => l.k !== "llego").sort((a, b) => ET[a.k].rank - ET[b.k].rank || (a.prom || a.desde || "").localeCompare(b.prom || b.desde || ""));
    const recibida = ls.find((l) => l.k === "llego") || null;
    if (abiertas.length) {
      const l = abiertas[0], t = textoLinea(l);
      return { k: l.k, abierta: true, tono: tonoLinea(l), t: ET[l.k].t, corto: t.corto, texto: t.texto + (abiertas.length > 1 ? ` (+${abiertas.length - 1} más)` : ""), linea: l, n: abiertas.length, recibida };
    }
    if (recibida) {
      const t = textoLinea(recibida);
      return { k: "llego", abierta: false, tono: "ok", t: ET.llego.t, corto: "ya llegó", texto: t.texto + ` · pedida el ${corta(recibida.fp)}`, linea: recibida, n: 0, recibida };
    }
    return { k: "sin-pedido", abierta: false, tono: "", t: "Sin pedido", corto: "sin pedido", texto: `Sin pedido en los reportes (desde el ${corta(D.desde)})`, linea: null, n: 0, recibida: null };
  }
  // «741203124, 724001253» → [{cod, estado}]
  function deCodigos(txt) {
    return String(txt || "").split(/[,;\s]+/).map((c) => c.trim()).filter((c) => /^(\d{9}|[A-Za-z]{3}\d{6})$/.test(c)).map((cod) => ({ cod, estado: estadoDe(cod) }));
  }

  // ------------------------------------------------------------ resumen
  function resumen() {
    const m = modelo();
    const ab = m.lineas.filter((l) => l.k !== "llego");
    const con = (...ks) => ab.filter((l) => ks.includes(l.k));
    const atras = con("atrasada");
    const sinAvance = con("oc-aprobar", "rq-oc", "rq-aprobar", "plan");
    // Cumplimiento: de lo que ya debía haber llegado (fecha prometida pasada), ¿cuánto llegó?
    const vencidas = m.lineas.filter((l) => l.oc && (l.ve || l.fe) && (l.ve || l.fe) < m.hy && l.k !== "oc-aprobar");
    const entregadas = vencidas.filter((l) => l.k === "llego").length;
    const pv = new Map();
    vencidas.forEach((l) => { const c = pv.get(l.pv) || { v: 0, e: 0 }; c.v++; if (l.k === "llego") c.e++; pv.set(l.pv, c); });
    return {
      abiertas: ab.length, conOC: con("atrasada", "parcial", "camino").length, atrasadas: atras.length,
      atrasoMed: atras.length ? pct(atras.map((l) => l.atraso), 0.5) : 0, atrasoMax: atras.length ? Math.max(...atras.map((l) => l.atraso)) : 0,
      sinAvance: sinAvance.length, sinAvance30: sinAvance.filter((l) => l.edad > 30).length,
      vencidas: vencidas.length, entregadas, cumple: vencidas.length ? Math.round((entregadas / vencidas.length) * 100) : 0,
      proveedores: [...pv.entries()].filter(([p, c]) => p && c.v >= 8).map(([p, c]) => ({ p, v: c.v, e: c.e, pct: Math.round((c.e / c.v) * 100) })).sort((a, b) => a.pct - b.pct || b.v - a.v),
    };
  }

  // -------------------------------------------------------- por pedir (plan)
  const freqDias = (f) => {
    const x = /^(\d+(?:[.,]\d+)?)\s*([AMB])$/i.exec(String(f || "").trim());
    if (!x) return 0;
    const n = Number(x[1].replace(",", ".")), u = x[2].toUpperCase();
    return Math.round(u === "M" ? n * 30.44 : u === "B" ? n * 730.5 : n * 365.25);
  };
  function existenciaDe(cod, plan) {
    const inv = window.INVENTARIO;
    if (inv && inv.cargado && typeof inv.de === "function") { const a = inv.de(inv.norm(cod)); if (a) return Number(a.exist) || 0; }
    return Number(plan) || 0;
  }
  // Piezas del plan cuyo próximo cambio se acerca (o ya pasó) y que nadie ha pedido
  function porPedir() {
    const hy = hoy();
    const plan = (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || [];
    const reales = typeof cambiosEventos === "function" ? cambiosEventos() : [];
    const ultimoReal = new Map();
    reales.forEach((c) => { const k = `${c.eq}|${c.cod}`; if (c.cod && c.fecha && (!ultimoReal.has(k) || c.fecha > ultimoReal.get(k))) ultimoReal.set(k, c.fecha); });
    const out = [], vistos = new Set();
    plan.forEach((e) => (e.r || []).forEach((r) => {
      const x = r.xls || {};
      const freq = freqDias(x.f);
      if (!r.cod || !freq || !x.ej) return;
      const k = `${e.c}|${r.cod}`;
      if (vistos.has(k)) return;
      vistos.add(k);
      const real = ultimoReal.get(k) || "";
      const ultimo = real && real > x.ej ? real : x.ej;
      const proximo = suma(ultimo, freq);
      const pa = pedirAntes(proximo, r.cod);
      if (pa.fecha > suma(hy, 14)) return;                 // todavía hay tiempo
      const est = estadoDe(r.cod);
      if (est.abierta) return;                              // ya está pedida
      const hay = existenciaDe(r.cod, r.e);
      if (hay >= (r.q || 1)) return;                        // hay en almacén
      out.push({ eq: e.n, eqCod: e.c, sis: r.s || "", cod: r.cod, d: r.d || "", q: r.q || 1, hay, ultimo, proximo, pedir: pa.fecha, plazo: pa.plazo, est, vence: dias(hy, proximo) });
    }));
    // Lo que venció hace más de 3 meses casi seguro ya se cambió y el Excel no se actualizó:
  // va al final, la más reciente primero; arriba, lo que de verdad se acerca o acaba de vencer
  out.forEach((x) => { x.viejo = x.vence < -90; });
  return out.sort((a, b) => (a.viejo ? 1 : 0) - (b.viejo ? 1 : 0) || (a.viejo ? b.proximo.localeCompare(a.proximo) : a.proximo.localeCompare(b.proximo)));
  }

  // ------------------------------------------------------------ pantalla
  const vista = { tab: "llegar", filtro: "todo", q: "", n: 60 };
  const kpi = ({ n, unidad = "", titulo, pie, tono = "", ico }) => `<div class="hy-stat ${tono}" style="cursor:default">
      <span class="hy-stat__t">${ico ? ic(ico, "ic--sm") : ""}<span>${esc(titulo)}</span></span>
      <b class="hy-stat__n"><span>${N.fmt.num(n)}</span>${unidad ? `<small>${unidad}</small>` : ""}</b>
      ${pie ? `<span class="hy-stat__s">${pie}</span>` : ""}</div>`;

  const FILTROS = [
    ["todo", "Todo lo abierto", (l) => true],
    ["atrasada", "Atrasadas", (l) => l.k === "atrasada"],
    ["camino", "En camino", (l) => l.k === "camino" || l.k === "parcial"],
    ["aprobar", "Sin avanzar", (l) => l.k === "oc-aprobar" || l.k === "rq-oc" || l.k === "rq-aprobar" || l.k === "plan"],
  ];

  function filas(r) {
    const m = modelo();
    const f = FILTROS.find((x) => x[0] === vista.filtro) || FILTROS[0];
    const q = N.plano(vista.q);
    return m.lineas.filter((l) => l.k !== "llego" && f[2](l) && (!q || N.plano(`${l.c} ${l.d} ${l.pv} ${l.cc} ${l.oc} ${l.rq} ${l.us}`).includes(q)))
      .sort((a, b) => ET[a.k].rank - ET[b.k].rank || (b.atraso || 0) - (a.atraso || 0) || b.edad - a.edad);
  }

  function tablaLlegar(r) {
    const ls = filas(r);
    const chips = FILTROS.map(([id, t, fn]) => `<button type="button" class="ux-chip ${vista.filtro === id ? "is-on" : ""}" data-cm="filtro" data-v="${id}">${t} <span class="ux-count">${modelo().lineas.filter((l) => l.k !== "llego" && fn(l)).length}</span></button>`).join("");
    const cuerpo = ls.slice(0, vista.n).map((l) => {
      const t = textoLinea(l);
      return `<tr data-cm="pieza" data-cod="${esc(l.c)}" data-go-row>
        <td style="max-width:340px"><div class="ux-strong" style="white-space:normal">${esc(l.d || l.c)}</div><div class="ux-small ux-mute">${esc(l.c)}</div></td>
        <td class="r" data-l="Falta">${num(l.faltan)}<div class="ux-small ux-mute">${esc(l.u || "")}${l.o && l.r ? ` · ${num(l.r)} de ${num(l.o)}` : ""}</div></td>
        <td data-l="Estado"><span class="hy-chip hy-chip--${tonoLinea(l) || "neutro"}"><i></i>${esc(ET[l.k].t)}</span><div class="ux-small ux-mute">${esc(t.corto)}</div></td>
        <td data-l="Orden">${l.oc ? `OC ${esc(l.oc)}` : l.rq && /^\d+$/.test(l.rq) ? `Req. ${esc(l.rq)}` : "—"}</td>
        <td data-l="Proveedor">${esc(l.pv ? pvCorto(l.pv) : "—")}</td>
        <td class="cm-f" data-l="Pedida">${esc(corta(l.fp))}<div class="ux-small ux-mute">hace ${l.edad} d</div></td>
        <td class="cm-f" data-l="Prometida">${l.prom ? esc(corta(l.prom)) : "—"}</td>
        <td style="max-width:200px" data-l="Para / pidió">${esc((l.cc || "").replace(/^[A-Z0-9-]+\s-\s/, "") || "—")}${l.us ? `<div class="ux-small ux-mute">${esc(l.us)}</div>` : ""}</td>
      </tr>`;
    }).join("");
    return `<div class="ux-chips cm-chips">${chips}</div>
      ${ls.length ? `<div class="ux-tablewrap"><table class="ux-table cm-tabla">
        <thead><tr><th>Pieza</th><th class="r">Falta</th><th>Estado</th><th>Orden</th><th>Proveedor</th><th>Pedida</th><th>Prometida</th><th>Para / pidió</th></tr></thead>
        <tbody>${cuerpo}</tbody></table></div>
        ${ls.length > vista.n ? `<div class="hy-eq__pie"><button class="ux-link" type="button" data-cm="mas">Ver ${Math.min(60, ls.length - vista.n)} más de ${ls.length - vista.n}</button></div>` : `<p class="ux-small ux-mute" style="margin-top:8px">${ls.length} ${ls.length === 1 ? "línea" : "líneas"}</p>`}`
        : `<div class="ux-card"><div class="ux-empty"><span class="ux-empty__ico">${ic("check")}</span><h4>Nada con este filtro</h4></div></div>`}`;
  }

  function tablaPedir() {
    const l = porPedir().filter((x) => !vista.q || N.plano(`${x.cod} ${x.d} ${x.eq}`).includes(N.plano(vista.q)));
    const cuerpo = l.slice(0, vista.n).map((x) => `<tr data-cm="pieza" data-cod="${esc(x.cod)}" data-go-row>
        <td style="max-width:320px"><div class="ux-strong" style="white-space:normal">${esc(x.d || x.cod)}</div><div class="ux-small ux-mute">${esc(x.cod)}</div></td>
        <td data-l="Equipo">${esc(x.eq)}${x.sis ? `<div class="ux-small ux-mute">${esc(x.sis)}</div>` : ""}</td>
        <td class="cm-f" data-l="Último cambio">${esc(corta(x.ultimo))}</td>
        <td class="cm-f" data-l="Próximo cambio"><b>${esc(corta(x.proximo))}</b><div class="ux-small ${x.vence < 0 ? "hy-rojo" : "ux-mute"}">${x.vence < 0 ? `venció hace ${-x.vence} d` : `en ${x.vence} d`}</div>${x.viejo ? `<div class="ux-small ux-mute" title="El plan dice que se cambió por última vez el ${esc(corta(x.ultimo))}. Si ya se cambió, anótalo en la ficha del equipo.">¿datos viejos?</div>` : ""}</td>
        <td class="cm-f" data-l="Pedir antes del"><b>${esc(corta(x.pedir))}</b><div class="ux-small ux-mute">tarda ~${x.plazo} d</div></td>
        <td class="r" data-l="En almacén">${num(x.hay)} <span class="ux-small ux-mute">de ${num(x.q)}</span></td>
        <td data-l="Compra"><span class="hy-chip hy-chip--${x.est.k === "llego" ? "ok" : "neutro"}"><i></i>${esc(x.est.k === "llego" ? "ya llegó una compra" : "sin pedido")}</span></td></tr>`).join("");
    return `<p class="ux-small ux-mute cm-nota">Piezas del plan de mantenimiento cuyo próximo cambio (última ejecución + frecuencia) está cerca o ya pasó, que no tienen una compra abierta y de las que hay menos en almacén de lo que pide el plan. «Pedir antes» = próximo cambio − lo que tarda en llegar esa pieza − 7 días. Las que vencieron hace más de 3 meses van al final: casi seguro ya se cambiaron y el Excel no se actualizó.</p>
      ${l.length ? `<div class="ux-tablewrap"><table class="ux-table cm-tabla"><thead><tr><th>Pieza</th><th>Equipo</th><th>Último cambio</th><th>Próximo cambio</th><th>Pedir antes del</th><th class="r">En almacén</th><th>Compra</th></tr></thead><tbody>${cuerpo}</tbody></table></div>
        ${l.length > vista.n ? `<div class="hy-eq__pie"><button class="ux-link" type="button" data-cm="mas">Ver más</button></div>` : `<p class="ux-small ux-mute" style="margin-top:8px">${l.length} ${l.length === 1 ? "pieza" : "piezas"}</p>`}`
        : `<div class="ux-card"><div class="ux-empty"><span class="ux-empty__ico">${ic("check")}</span><h4>No hay piezas por pedir</h4><p>Todo lo que se acerca ya está pedido o hay en almacén.</p></div></div>`}`;
  }

  function render() {
    const raiz = document.getElementById("comprasRoot");
    if (!raiz) return;
    if (!D.lineas.length) { raiz.innerHTML = `<div class="ux-page"><div class="ux-card"><div class="ux-empty"><h4>Todavía no hay compras cargadas</h4><p>Corre <code>scripts/importar-compras.py</code> con el RE355 y las órdenes de compra.</p></div></div></div>`; return; }
    const r = resumen();
    const porPedirN = vista.tab === "pedir" ? 0 : porPedir().length;
    raiz.innerHTML = `<div class="ux-page ux-seq">
      <div class="ux-head">
        <div class="ux-head__txt">
          <p class="ux-eyebrow">${ic("caja")}Compras de mantenimiento · del ${esc(corta(D.desde))} al ${esc(corta(D.hasta))} · cargado ${esc(String(D.generado || "").slice(0, 10))}</p>
          <h1 class="ux-title">Repuestos por llegar</h1>
        </div>
        <div class="ux-head__acts"><div class="ux-seg" aria-label="Vista">
          <button type="button" class="${vista.tab === "llegar" ? "is-on" : ""}" data-cm="tab" data-v="llegar">Por llegar</button>
          <button type="button" class="${vista.tab === "pedir" ? "is-on" : ""}" data-cm="tab" data-v="pedir">Por pedir</button></div></div>
      </div>
      <div class="hy-stats hy-stats--4c">
        ${kpi({ ico: "caja", n: r.conOC, titulo: "Con orden de compra", pie: `${r.abiertas} líneas abiertas en total` })}
        ${kpi({ ico: "alerta", n: r.atrasadas, titulo: "Atrasadas", tono: r.atrasadas ? "is-bad" : "", pie: r.atrasadas ? `atraso mediano ${r.atrasoMed} d · el peor ${r.atrasoMax} d` : "nada atrasado" })}
        ${kpi({ ico: "reloj", n: r.sinAvance, titulo: "Sin avanzar", tono: r.sinAvance30 ? "is-bad" : "", pie: `sin aprobar o sin orden · ${r.sinAvance30} llevan más de 30 d` })}
        ${kpi({ ico: "check", n: r.cumple, unidad: "%", titulo: "Entregado a tiempo", pie: `de ${r.vencidas} líneas cuya fecha ya pasó` })}
      </div>
      <p class="ux-small ux-mute cm-nota">${ic("alerta", "ic--sm")}<span>Las fechas son las <b>prometidas</b> por el proveedor. Los reportes de MiPortal no traen cuándo llegó cada cosa: solo cuánto se ha recibido y si la línea ya se cerró.</span></p>
      <div class="cm-barra">
        <input class="ux-input cm-buscar" type="search" data-cm="q" value="${esc(vista.q)}" placeholder="Buscar pieza, código, proveedor, equipo…" aria-label="Buscar">
      </div>
      <div id="cmCuerpo">${vista.tab === "pedir" ? tablaPedir() : tablaLlegar(r)}</div>
      ${vista.tab === "llegar" && r.proveedores.length ? `<section class="ux-card cm-prov"><div class="ux-card__head"><div><h2 class="ux-card__title">${ic("persona")}Cumplimiento por proveedor</h2><p class="ux-card__sub">De las líneas cuya fecha prometida ya pasó (proveedores con 8 o más)</p></div></div>
        <div class="hy-barras">${r.proveedores.slice(0, 8).map((p) => `<div class="hy-barra" style="cursor:default"><span class="hy-barra__t" title="${esc(p.p)}">${esc(pvCorto(p.p))}</span><span class="hy-barra__b"><i class="${p.pct < 85 ? "is-hot" : ""}" style="width:${p.pct}%"></i></span><b>${p.pct}%</b></div>`).join("")}</div></section>` : ""}
    </div>`;
  }

  // Solo se repinta la tabla al escribir en el buscador (así no se pierde el foco)
  function pintarCuerpo() {
    const c = document.getElementById("cmCuerpo");
    if (c) c.innerHTML = vista.tab === "pedir" ? tablaPedir() : tablaLlegar(resumen());
  }

  function enlazar() {
    const raiz = document.getElementById("comprasRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cm]");
      if (!b) return;
      const a = b.dataset.cm;
      if (a === "tab") { vista.tab = b.dataset.v; vista.n = 60; render(); }
      else if (a === "filtro") { vista.filtro = b.dataset.v; vista.n = 60; render(); }
      else if (a === "mas") { vista.n += 60; pintarCuerpo(); }
      else if (a === "pieza") window.goAlmacen?.({ q: b.dataset.cod });
    });
    raiz.addEventListener("input", (e) => {
      if (e.target.matches('[data-cm="q"]')) { vista.q = e.target.value; vista.n = 60; pintarCuerpo(); }
    });
  }

  function goCompras(op) {
    views.compras = views.compras || document.getElementById("comprasView");
    setView("compras");
    if (op && op.tab) vista.tab = op.tab;
    if (op && op.filtro) vista.filtro = op.filtro;
    render();
    enlazar();
    saveUiState({ activeView: "compras" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  window.goCompras = goCompras;
  window.COMPRAS = { estadoDe, deCodigos, existencia: existenciaDe, plazo, pedirAntes, resumen, porPedir, lineas: () => modelo().lineas, datos: D, ET };
  views.compras = document.getElementById("comprasView");
})();
