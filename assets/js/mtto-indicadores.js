// ============================================================================
//  CUADRO DE MANDO INTEGRAL · MANTENIMIENTO
// ============================================================================
//  Indicadores por sede, tipo de máquina y máquina con los datos del Registro
//  diario (window.MTTO_STORE). Funciona como un tablero de Power BI: casi todo
//  se puede tocar y filtra el resto (sede, tipo de máquina, máquina, modo de
//  falla, categoría, tipo de mantenimiento, semana, técnico, pendientes). Los
//  filtros activos salen como chips arriba y cada novedad abre su ficha, con
//  enlaces al Registro diario, al reporte original del chat y a la ficha
//  técnica del equipo.
//
//  Definiciones (las mismas de la hoja INDICADORES del Excel y del Power BI):
//   - Tiempo programado: 12 h por turno en que el equipo estuvo en Producción,
//     Montaje o Mantenimiento.
//   - Falla: novedad con categoría Máquina y tipo Correctivo.
//   - MTBF = tiempo programado / fallas.  MTTR = horas de las fallas con
//     horario / fallas con horario.
//   - Disponibilidad = 1 − horas de parada por falla de máquina / tiempo
//     programado. Solo se muestra si al menos la mitad de las fallas trae
//     horario (cobertura); si no, un 99 % sería engañoso.
// ============================================================================

(function () {
  const M = window.MTTO;
  const S = window.MTTO_STORE;
  if (!M || !S) return;
  const C = M.catalogo;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const COB_MIN = 0.5;
  const POR_PAGINA = 20;
  const COLOR_CAT = { "Máquina": "#d92d20", "Apoyo crítico": "#f79009", "Locativo": "#7a5af8", "Preventivo": "#12b76a", "Operacional": "#2e90fa" };
  const META_GLOBAL = { disp: 0.92, mtbf: 48, mttr: 1.5 };

  // Filtros cruzados. eq es "Sede|Equipo" porque Blister 3 existe en las dos sedes.
  const FILTROS = {
    sede: { l: "Sede" }, area: { l: "Tipo de máquina" }, eq: { l: "Máquina", v: (x) => x.replace("|", " · ") },
    fa: { l: "Modo de falla" }, cat: { l: "Categoría" }, tp: { l: "Mantenimiento" },
    sem: { l: "Semana del", v: (x) => fechaCorta(x) }, tec: { l: "Técnico" }, pend: { l: "Estado", v: () => "Con pendiente" },
  };
  const qs = new URLSearchParams(window.location.search);
  const vista = { periodo: "todo", desde: M.desde, hasta: S.hoy(), f: {}, pagina: 0, abierto: "", orden: "fecha" };
  Object.keys(FILTROS).forEach((k) => { if (qs.get(k)) vista.f[k] = qs.get(k); });

  // ------------------------------------------------------------------------
  //  Cálculo
  // ------------------------------------------------------------------------
  function rango() {
    const h = S.hoy();
    const mes = h.slice(0, 7);
    const [a, m] = mes.split("-").map(Number);
    const mesAnt = new Date(Date.UTC(a, m - 2, 1)).toISOString().slice(0, 7);
    const finMes = (ym) => { const [y, n] = ym.split("-").map(Number); return new Date(Date.UTC(y, n, 0)).toISOString().slice(0, 10); };
    let [d, hh] = [M.desde, h];
    switch (vista.periodo) {
      case "mes": [d, hh] = [mes + "-01", h]; break;
      case "mesant": [d, hh] = [mesAnt + "-01", finMes(mesAnt)]; break;
      case "7": [d, hh] = [S.sumaDias(h, -6), h]; break;
      case "30": [d, hh] = [S.sumaDias(h, -29), h]; break;
      case "custom": [d, hh] = [vista.desde, vista.hasta]; break;
    }
    // la semana elegida recorta el periodo
    if (vista.f.sem) { d = d > vista.f.sem ? d : vista.f.sem; const fin = S.sumaDias(vista.f.sem, 6); hh = hh < fin ? hh : fin; }
    return [d, hh];
  }

  const esFalla = (r) => r.cat === "Máquina" && r.tp === "Correctivo";
  const conTiempo = (r) => r.min > 0;
  const paro = (r) => r.det !== "No" && r.min > 0;
  const esPend = (r) => r.ef === "Pendiente" || r.ef === "Operativo con pendiente";
  const claveEq = (r) => `${r.s}|${r.eq}`;
  const lunes = (iso) => { const t = new Date(iso + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7)); return t.toISOString().slice(0, 10); };

  function pasa(r, f, ignorar) {
    const no = (k) => ignorar && ignorar.includes(k);
    if (f.sede && !no("sede") && r.s !== f.sede) return false;
    if (f.area && !no("area") && r.ar !== f.area) return false;
    if (f.eq && !no("eq") && claveEq(r) !== f.eq) return false;
    if (f.fa && !no("fa") && (r.fa || "Sin clasificar") !== f.fa) return false;
    if (f.cat && !no("cat") && r.cat !== f.cat) return false;
    if (f.tp && !no("tp") && r.tp !== f.tp) return false;
    if (f.tec && !no("tec") && (r.tec || "Sin técnico") !== f.tec) return false;
    if (f.pend && !no("pend") && !esPend(r)) return false;
    return true;
  }

  function agregar(regs, tProg) {
    const fallas = regs.filter(esFalla);
    const fct = fallas.filter(conTiempo);
    const hFallas = fct.reduce((s, r) => s + r.min, 0) / 60;
    const hParMaq = regs.filter((r) => r.cat === "Máquina" && paro(r)).reduce((s, r) => s + r.min, 0) / 60;
    const porCat = {};
    C.categorias.forEach((c) => (porCat[c] = 0));
    regs.forEach((r) => { if (paro(r)) porCat[r.cat] = (porCat[r.cat] || 0) + r.min / 60; });
    const cob = fallas.length ? fct.length / fallas.length : null;
    return {
      tProg, n: regs.length, fallas: fallas.length, fct: fct.length, cob,
      hPar: Object.values(porCat).reduce((a, b) => a + b, 0), hParMaq, porCat,
      disp: tProg > 0 && cob != null && cob >= COB_MIN ? Math.max(0, 1 - hParMaq / tProg) : tProg > 0 && fallas.length === 0 ? 1 : null,
      mtbf: fallas.length ? tProg / fallas.length : tProg > 0 ? Infinity : null,
      mttr: fct.length ? hFallas / fct.length : null,
      pend: regs.filter(esPend).length,
      frep: regs.filter((r) => r.frep).length,
    };
  }

  function calcular() {
    const [d, h] = rango();
    const f = vista.f;
    const enPeriodo = S.registros().filter((r) => r.f >= d && r.f <= h);
    const regs = enPeriodo.filter((r) => pasa(r, f));
    const horas = S.horas();
    const tDe = (sede, eq) => Object.entries(horas[`${sede}|${eq}`] || {}).reduce((s, [x, v]) => (x >= d && x <= h ? s + v : s), 0);
    // el tiempo programado solo depende de dónde (sede, tipo, máquina), no del modo de falla
    const eqs = C.equipos.filter((e) => e.proc && (!f.sede || e.s === f.sede) && (!f.area || e.ar === f.area) && (!f.eq || `${e.s}|${e.eq}` === f.eq));
    const porEquipo = eqs.map((e) => {
      const rs = regs.filter((r) => r.s === e.s && r.eq === e.eq);
      return { ...e, k: `${e.s}|${e.eq}`, ...agregar(rs, tDe(e.s, e.eq)), regs: rs };
    });
    // con una máquina elegida, su sede y su tipo quedan implícitos
    const eqInfo = f.eq ? C.equipos.find((e) => `${e.s}|${e.eq}` === f.eq) : null;
    const areaEf = f.area || (eqInfo && eqInfo.ar);
    const sedeEf = f.sede || (f.eq && f.eq.split("|")[0]);
    const porArea = C.areasProceso.filter((ar) => !areaEf || ar === areaEf).map((ar) => {
      const es = porEquipo.filter((e) => e.ar === ar);
      const rs = regs.filter((r) => r.ar === ar);
      return { ar, meta: M.metas[ar], ...agregar(rs, es.reduce((s, e) => s + e.tProg, 0)), equipos: es, regs: rs };
    });
    const sedes = (sedeEf ? [sedeEf] : C.sedes).map((s) => {
      const es = porEquipo.filter((e) => e.s === s);
      const rs = regs.filter((r) => r.s === s);
      const a = agregar(rs.filter((r) => C.areasProceso.includes(r.ar)), es.reduce((x, e) => x + e.tProg, 0));
      a.porCat = agregar(rs, 0).porCat;
      a.n = rs.length;
      a.pend = rs.filter(esPend).length;
      return { s, ...a };
    });
    const total = agregar(regs.filter((r) => C.areasProceso.includes(r.ar)), porEquipo.reduce((s, e) => s + e.tProg, 0));
    total.porCat = agregar(regs, 0).porCat;
    total.n = regs.length;
    // para las gráficas de distribución: todo menos su propio filtro (así se ve la selección resaltada)
    const sin = (k) => enPeriodo.filter((r) => pasa(r, f, [k]));
    return { d, h, regs, porEquipo, porArea, sedes, total, sin };
  }

  // ------------------------------------------------------------------------
  //  Formato
  // ------------------------------------------------------------------------
  const nf = (v, dec = 1) => (v == null ? "—" : v === Infinity ? "∞" : v.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec }));
  const pct = (v, dec = 1) => (v == null ? "—" : (v * 100).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + " %");
  const hh = (v) => (v == null ? "—" : `${nf(v, v >= 100 ? 0 : 1)} h`);
  const fechaCorta = (iso) => `${Number(iso.slice(8))} ${MESES[Number(iso.slice(5, 7)) - 1].slice(0, 3)}`;
  function fechaLarga(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    const dow = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
    return `${dow} ${d} de ${MESES[m - 1]} de ${a}`;
  }
  // atributos para que un elemento filtre al hacer clic
  const fil = (k, v, extra = "") => `data-ki="filtro" data-k="${k}" data-v="${esc(v)}" ${extra} role="button" tabindex="0" title="Filtrar: ${esc(FILTROS[k].l)} = ${esc(FILTROS[k].v ? FILTROS[k].v(v) : v)}"`;
  const sel = (k, v) => (vista.f[k] === v ? "is-sel" : "");

  function estadoArea(a) {
    const m = a.meta || {};
    if (a.disp != null && a.fallas > 0) return a.disp >= m.disp ? "ok" : "bad";
    if (a.mtbf != null && a.fallas > 0) return a.mtbf >= m.mtbf ? "ok" : "bad";
    return a.tProg > 0 ? "ok" : "na";
  }
  const flecha = (ok) => (ok ? `<span class="ki-ok" aria-label="cumple">✓</span>` : `<span class="ki-bad" aria-label="no cumple">!</span>`);

  function metrica(label, valor, meta, cumple, sub, attrs = "") {
    const cls = cumple == null ? "" : cumple ? "is-ok" : "is-bad";
    return `<div class="ki-m ${cls} ${attrs ? "is-link" : ""}" ${attrs}><span class="ki-m__l">${label}</span><b>${valor}${cumple == null ? "" : flecha(cumple)}</b>${meta ? `<small>${meta}</small>` : ""}${sub ? `<small>${sub}</small>` : ""}</div>`;
  }

  // ------------------------------------------------------------------------
  //  Gráficos (SVG y HTML, sin librerías). Cada barra filtra.
  // ------------------------------------------------------------------------
  function barrasH(items, { k, fmt = (v) => nf(v, 0), color = "var(--ki-bar)", vacio = "Sin datos con estos filtros." } = {}) {
    if (!items.length) return `<p class="pl-soft ki-nada">${vacio}</p>`;
    const top = Math.max(...items.map((x) => x.v), 1);
    return `<ul class="ki-bars">${items.map((x) => {
      const attrs = k ? fil(k, x.key ?? x.l) : "";
      return `<li class="${k ? "is-link " + sel(k, x.key ?? x.l) : ""}" ${attrs}><span class="ki-bars__l" title="${esc(x.l)}">${esc(x.l)}</span><span class="ki-bars__t"><span style="width:${Math.max(2, (x.v / top) * 100).toFixed(1)}%;background:${typeof color === "function" ? color(x) : color}"></span></span><span class="ki-bars__v">${fmt(x.v)}</span></li>`;
    }).join("")}</ul>`;
  }

  function semanas(d, h) {
    const out = [];
    for (let s = lunes(d); s <= h; s = S.sumaDias(s, 7)) out.push(s);
    return out;
  }

  // Columnas (fallas por semana) + línea (horas de parada). Clic en una semana = filtro.
  function tendencia(regs, d, h, conClic = true) {
    const lista = semanas(d, h);
    if (lista.length < 2) return `<p class="pl-soft ki-nada">Periodo de una sola semana: la tendencia aparece al elegir un rango más largo.</p>`;
    const fal = Object.fromEntries(lista.map((s) => [s, 0]));
    const hor = Object.fromEntries(lista.map((s) => [s, 0]));
    regs.forEach((r) => { const s = lunes(r.f); if (s in fal) { if (esFalla(r)) fal[s]++; if (paro(r)) hor[s] += r.min / 60; } });
    const W = 640, H = 190, pl = 30, pr = 34, pt = 16, pb = 30;
    const iw = W - pl - pr, ih = H - pt - pb;
    const mf = Math.max(...Object.values(fal), 1), mh = Math.max(...Object.values(hor), 1);
    const bw = iw / lista.length;
    const x = (i) => pl + bw * i + bw / 2;
    const col = lista.map((s, i) => {
      const v = fal[s];
      const y = pt + ih - (v / mf) * ih;
      const a = conClic ? fil("sem", s) : "";
      return `<g class="ki-colg ${conClic ? "is-link" : ""} ${sel("sem", s)}" ${a}><rect x="${(x(i) - bw / 2).toFixed(1)}" y="${pt}" width="${bw.toFixed(1)}" height="${ih}" class="ki-hit"/><rect x="${(x(i) - bw * 0.3).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.6).toFixed(1)}" height="${(pt + ih - y).toFixed(1)}" rx="3" class="ki-col"/><title>Semana del ${fechaCorta(s)}: ${v} fallas · ${nf(hor[s])} h de parada</title><text x="${x(i).toFixed(1)}" y="${(y - 4).toFixed(1)}" class="ki-lbl" text-anchor="middle">${v || ""}</text></g>`;
    }).join("");
    const pts = lista.map((s, i) => [x(i), pt + ih - (hor[s] / mh) * ih]);
    const linea = `<polyline points="${pts.map(([a, b]) => a.toFixed(1) + "," + b.toFixed(1)).join(" ")}" class="ki-line"/>` +
      pts.map(([a, b], i) => `<circle cx="${a.toFixed(1)}" cy="${b.toFixed(1)}" r="3.5" class="ki-dot"><title>${nf(hor[lista[i]])} h de parada</title></circle>`).join("");
    const ejes = lista.map((s, i) => (lista.length > 12 && i % 2 ? "" : `<text x="${x(i).toFixed(1)}" y="${H - 10}" class="ki-ax" text-anchor="middle">${fechaCorta(s)}</text>`)).join("");
    return `<svg viewBox="0 0 ${W} ${H}" class="ki-svg" role="img" aria-label="Fallas y horas de parada por semana">
      <line x1="${pl}" y1="${pt + ih}" x2="${W - pr}" y2="${pt + ih}" class="ki-base"/>
      ${col}${linea}${ejes}
      <text x="${pl - 6}" y="${pt + 4}" class="ki-ax" text-anchor="end">${mf}</text>
      <text x="${W - pr + 6}" y="${pt + 4}" class="ki-ax">${nf(mh, 0)} h</text>
    </svg>
    <p class="ki-leyenda"><span class="ki-sw ki-sw--col"></span>Fallas de máquina <span class="ki-sw ki-sw--line"></span>Horas de parada registradas${conClic ? ` <span class="ki-tip">· toca una semana para filtrar</span>` : ""}</p>`;
  }

  function donaCategorias(regs) {
    const porCat = {};
    C.categorias.forEach((c) => (porCat[c] = { h: 0, n: 0 }));
    regs.forEach((r) => { if (!porCat[r.cat]) return; porCat[r.cat].n++; if (paro(r)) porCat[r.cat].h += r.min / 60; });
    const totH = Object.values(porCat).reduce((a, b) => a + b.h, 0);
    const totN = Object.values(porCat).reduce((a, b) => a + b.n, 0);
    const usarH = totH > 0;
    const tot = usarH ? totH : totN;
    if (!tot) return `<p class="pl-soft ki-nada">Sin novedades con estos filtros.</p>`;
    let ang = 0;
    const R = 52, r0 = 32, cx = 64, cy = 64;
    const arco = (a0, a1) => {
      const p = (a, rr) => [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
      const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r0), [x3, y3] = p(a0, r0);
      const g = a1 - a0 > Math.PI ? 1 : 0;
      return `M${x0} ${y0}A${R} ${R} 0 ${g} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${g} 0 ${x3} ${y3}Z`;
    };
    const seg = Object.entries(porCat).filter(([, v]) => (usarH ? v.h : v.n) > 0).map(([c, v]) => {
      const val = usarH ? v.h : v.n;
      const a0 = ang, a1 = ang + (val / tot) * Math.PI * 2 - (val === tot ? 0.0001 : 0);
      ang = a1;
      return `<path d="${arco(a0, a1)}" fill="${COLOR_CAT[c]}" class="is-link ${vista.f.cat && vista.f.cat !== c ? "is-dim" : ""}" ${fil("cat", c)}><title>${c}: ${usarH ? nf(val) + " h" : val + " novedades"}</title></path>`;
    }).join("");
    return `<div class="ki-dona"><svg viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="Distribución por categoría">${seg}<text x="64" y="62" text-anchor="middle" class="ki-dona__v">${usarH ? nf(tot, 0) : tot}</text><text x="64" y="78" text-anchor="middle" class="ki-ax">${usarH ? "horas" : "novedades"}</text></svg>
      <ul>${Object.entries(porCat).map(([c, v]) => `<li class="is-link ${sel("cat", c)}" ${fil("cat", c)}><span class="ki-sw" style="background:${COLOR_CAT[c]}"></span>${esc(c)}<b>${v.n}</b><em>${v.h ? nf(v.h) + " h" : "—"}</em></li>`).join("")}</ul></div>
      ${usarH ? "" : `<p class="ki-leyenda">Sin horas registradas: se reparte por número de novedades.</p>`}`;
  }

  function contar(regs, clave) {
    const m = {};
    regs.forEach((r) => { const k = clave(r); if (k) m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  }

  // Mapa de calor máquina × semana (fallas). Clic en una celda = máquina + semana.
  function mapaCalor(res) {
    const sems = semanas(res.d, res.h);
    const regs = res.regs.filter(esFalla);
    const porEq = {};
    regs.forEach((r) => { const k = claveEq(r); (porEq[k] = porEq[k] || { n: 0, s: {} }).n++; const s = lunes(r.f); porEq[k].s[s] = (porEq[k].s[s] || 0) + 1; });
    const filas = Object.entries(porEq).sort((a, b) => b[1].n - a[1].n).slice(0, 18);
    if (!filas.length || sems.length < 2) return `<p class="pl-soft ki-nada">Sin fallas para cruzar por semana con estos filtros.</p>`;
    const max = Math.max(...filas.flatMap(([, v]) => Object.values(v.s)), 1);
    const celda = (k, s, v) => {
      const a = v ? Math.min(1, 0.15 + (v / max) * 0.85) : 0;
      return `<td class="${v ? "is-link" : ""}" ${v ? `data-ki="celda" data-k="${esc(k)}" data-s="${s}" role="button" tabindex="0"` : ""} style="background:${v ? `rgba(217,45,32,${a.toFixed(2)})` : "#f8f9fb"};color:${a > 0.55 ? "#fff" : "#344054"}" title="${esc(k.replace("|", " · "))} · semana del ${fechaCorta(s)}: ${v} fallas">${v || ""}</td>`;
    };
    return `<div class="mt-tabla-wrap ki-calor-wrap"><table class="ki-calor"><thead><tr><th>Máquina</th>${sems.map((s) => `<th>${fechaCorta(s)}</th>`).join("")}<th>Total</th></tr></thead><tbody>
      ${filas.map(([k, v]) => `<tr><th class="is-link ${sel("eq", k)}" ${fil("eq", k)}>${esc(k.split("|")[1])}${res.porEquipo.length && !vista.f.sede ? ` <small>${esc(k.split("|")[0].replace("Sede ", "S"))}</small>` : ""}</th>${sems.map((s) => celda(k, s, v.s[s] || 0)).join("")}<td class="ki-calor__t">${v.n}</td></tr>`).join("")}
    </tbody></table></div><p class="ki-leyenda">Fallas de máquina por semana · toca una celda para ver esa máquina en esa semana, o el nombre para ver la máquina.</p>`;
  }

  // ------------------------------------------------------------------------
  //  Bloques
  // ------------------------------------------------------------------------
  function chips() {
    const act = Object.entries(vista.f).filter(([, v]) => v);
    if (!act.length) return `<p class="ki-chips ki-chips--vacio">Toca cualquier barra, fila, semana, categoría o máquina para filtrar todo el tablero.</p>`;
    return `<div class="ki-chips">${act.map(([k, v]) => `<button type="button" class="ki-chip" data-ki="quitar" data-k="${k}" title="Quitar filtro"><span>${esc(FILTROS[k].l)}:</span> ${esc(FILTROS[k].v ? FILTROS[k].v(v) : v)} <b>×</b></button>`).join("")}
      <button type="button" class="ki-chip ki-chip--limpiar" data-ki="limpiar">Quitar todos</button></div>`;
  }

  function bloqueSede(x) {
    const m = META_GLOBAL;
    return `<section class="ki-sede ${sel("sede", x.s)}">
      <header class="ki-head ki-head--${x.s === "Sede 4" ? "s4" : "s2"} is-link" ${fil("sede", x.s)}>${esc(x.s === "Sede 2" ? "Sede 2 · Vía 40" : x.s)}${vista.f.sede === x.s ? " · filtrada" : ""}</header>
      <div class="ki-sede__grid">
        ${metrica("Tiempo programado", hh(x.tProg), "equipos de proceso")}
        ${metrica("Horas de parada", hh(x.hPar), `${x.n} novedades`)}
        ${metrica("Disponibilidad", pct(x.disp), x.disp == null ? "faltan horarios" : `Objetivo ${pct(m.disp, 0)}`, x.disp == null ? null : x.disp >= m.disp)}
        ${metrica("MTBF", x.mtbf == null ? "—" : `${nf(x.mtbf)} h`, `Objetivo ≥ ${m.mtbf} h`, x.mtbf == null || !x.fallas ? null : x.mtbf >= m.mtbf)}
        ${metrica("MTTR", x.mttr == null ? "—" : `${nf(x.mttr, 2)} h`, `Objetivo ≤ ${nf(m.mttr)} h`, x.mttr == null ? null : x.mttr <= m.mttr)}
        ${metrica("Fallas de máquina", nf(x.fallas, 0), `${x.pend} con pendiente`, null, "", `data-ki="multi" data-set='${esc(JSON.stringify({ sede: x.s, cat: "Máquina", tp: "Correctivo" }))}' role="button" tabindex="0" title="Ver las fallas de ${esc(x.s)}"`)}
      </div>
    </section>`;
  }

  function tarjetaArea(a) {
    const st = estadoArea(a);
    const m = a.meta;
    const top = a.equipos.filter((e) => e.fallas > 0).sort((p, q) => q.fallas - p.fallas).slice(0, 6);
    const big = a.disp != null
      ? `<b class="ki-big ki-big--${a.disp >= m.disp ? "ok" : "bad"}">${pct(a.disp)}</b><small>Disponibilidad · objetivo ${pct(m.disp, 0)} (${a.disp - m.disp >= 0 ? "+" : ""}${nf((a.disp - m.disp) * 100)} pts)</small>`
      : `<b class="ki-big ki-big--na">${a.fallas}</b><small>fallas · disponibilidad sin datos (${a.cob == null ? "sin fallas" : pct(a.cob, 0) + " con horario"})</small>`;
    return `<article class="ki-area ki-area--${st} ${sel("area", a.ar)}">
      <header class="ki-head ki-head--${st} is-link" ${fil("area", a.ar)}>${esc(a.ar)} <span class="ki-head__mas">ver detalle ›</span></header>
      <div class="ki-area__body">
        <div class="ki-area__kpi is-link" ${fil("area", a.ar)}>
          ${big}
          <div class="ki-area__mini">
            ${metrica("MTBF", a.mtbf == null ? "—" : nf(a.mtbf), `≥ ${m.mtbf} h`, a.mtbf == null || a.fallas === 0 ? null : a.mtbf >= m.mtbf)}
            ${metrica("MTTR", a.mttr == null ? "—" : nf(a.mttr, 2), `≤ ${nf(m.mttr)} h`, a.mttr == null ? null : a.mttr <= m.mttr)}
          </div>
          <small class="ki-area__h">${hh(a.tProg)} programadas · ${hh(a.hPar)} de parada</small>
        </div>
        <div class="ki-area__bars">${barrasH(top.map((e) => ({ l: e.eq + (vista.f.sede ? "" : e.s === "Sede 2" ? " (S2)" : ""), key: e.k, v: e.fallas })), { k: "eq", color: st === "bad" ? "var(--ki-bad-bar)" : "var(--ki-ok-bar)", vacio: "Sin fallas." })}</div>
      </div>
    </article>`;
  }

  function topFallas(regs, n = 10) {
    const m = {};
    regs.filter(esFalla).forEach((r) => {
      const k = r.fa || "Sin clasificar";
      m[k] = m[k] || { k, n: 0, h: 0, eqs: {} };
      m[k].n++;
      if (paro(r)) m[k].h += r.min / 60;
      m[k].eqs[claveEq(r)] = (m[k].eqs[claveEq(r)] || 0) + 1;
    });
    const tot = regs.filter(esFalla).length || 1;
    const lista = Object.values(m).sort((a, b) => b.n - a.n).slice(0, n);
    if (!lista.length) return `<p class="pl-soft ki-nada">Sin fallas con estos filtros.</p>`;
    return `<table class="ki-tabla"><thead><tr><th>Modo de falla</th><th>Equipo más afectado</th><th>Fallas</th><th>Horas</th><th>% total</th></tr></thead><tbody>
      ${lista.map((x) => {
        const [eq, ne] = Object.entries(x.eqs).sort((a, b) => b[1] - a[1])[0];
        return `<tr class="is-link ${sel("fa", x.k)}" ${fil("fa", x.k)}><td>${esc(x.k)}</td><td><span class="ki-sub-link" ${fil("eq", eq)}>${esc(eq.split("|")[1])}</span> <small>(${ne})</small></td><td>${x.n}</td><td>${x.h ? nf(x.h) : "—"}</td><td><span class="ki-pbar"><span style="width:${((x.n / tot) * 100).toFixed(1)}%"></span></span>${pct(x.n / tot)}</td></tr>`;
      }).join("")}
    </tbody></table>`;
  }

  function tablaEquipos(es) {
    const filas = es.filter((e) => e.tProg > 0 || e.n > 0).sort((a, b) => b.fallas - a.fallas || b.n - a.n);
    if (!filas.length) return `<p class="pl-soft ki-nada">Sin datos.</p>`;
    return `<div class="mt-tabla-wrap"><table class="ki-tabla ki-tabla--eq"><thead><tr><th>Máquina</th><th>T. programado</th><th>Novedades</th><th>Fallas</th><th>H. parada</th><th>MTBF</th><th>MTTR</th><th>% disp.</th><th>Meta</th><th>Dif.</th><th>Pend.</th></tr></thead><tbody>
      ${filas.map((e) => {
        const m = M.metas[e.ar];
        const dif = e.disp == null ? null : e.disp - m.disp;
        return `<tr class="is-link ${sel("eq", e.k)}" ${fil("eq", e.k)}><td><strong>${esc(e.eq)}</strong>${vista.f.sede ? "" : `<small>${esc(e.s)}</small>`}</td><td>${hh(e.tProg)}</td><td>${e.n}</td>
          <td class="${e.fallas >= 10 ? "ki-hot" : ""}">${e.fallas}</td><td>${e.hPar ? nf(e.hPar) : "—"}</td>
          <td class="${e.fallas && e.mtbf < m.mtbf ? "ki-bad" : ""}">${e.mtbf == null ? "—" : nf(e.mtbf)}</td>
          <td class="${e.mttr != null && e.mttr > m.mttr ? "ki-bad" : ""}">${e.mttr == null ? "—" : nf(e.mttr, 2)}</td>
          <td>${e.disp == null ? `<span class="pl-soft" title="Menos de la mitad de las fallas tiene horario">s/d</span>` : pct(e.disp)}</td><td>${pct(m.disp, 0)}</td>
          <td class="${dif == null ? "" : dif >= 0 ? "ki-ok" : "ki-bad"}">${dif == null ? "—" : (dif >= 0 ? "+" : "") + nf(dif * 100) + " pts"}</td>
          <td>${e.pend || ""}</td></tr>`;
      }).join("")}</tbody></table></div>`;
  }

  function detalleArea(res) {
    const a = res.porArea.find((x) => x.ar === vista.f.area);
    if (!a || vista.f.eq) return "";
    const m = a.meta;
    return `<section class="ki-det" id="kiDetalle">
      <div class="ki-det__head">
        <button type="button" class="mt-ico" data-ki="quitar" data-k="area" aria-label="Quitar filtro">←</button>
        <h3>Vista en detalle · ${esc(a.ar)}</h3>
        <span class="pl-soft">${fechaCorta(res.d)} – ${fechaCorta(res.h)}${vista.f.sede ? " · " + esc(vista.f.sede) : ""}</span>
      </div>
      <div class="ki-det__grid">
        <aside class="ki-det__kpis">
          ${metrica("Disponibilidad", pct(a.disp), `Objetivo ${pct(m.disp, 0)}`, a.disp == null ? null : a.disp >= m.disp, a.cob == null ? "" : `${pct(a.cob, 0)} de fallas con horario`)}
          ${metrica("Horas de parada", hh(a.hPar), `${hh(a.tProg)} programadas`)}
          ${metrica("MTBF máquinas", a.mtbf == null ? "—" : `${nf(a.mtbf)} h`, `Objetivo ≥ ${m.mtbf} h`, a.mtbf == null || !a.fallas ? null : a.mtbf >= m.mtbf)}
          ${metrica("MTTR máquinas", a.mttr == null ? "—" : `${nf(a.mttr, 2)} h`, `Objetivo ≤ ${nf(m.mttr)} h`, a.mttr == null ? null : a.mttr <= m.mttr)}
          ${metrica("H. apoyo crítico", hh(a.porCat["Apoyo crítico"]), "aire, energía, agua, HVAC", null, "", fil("cat", "Apoyo crítico"))}
          ${metrica("H. operacional", hh(a.porCat["Operacional"]), "cuadres, formatos, operador", null, "", fil("cat", "Operacional"))}
          ${metrica("H. preventivo", hh(a.porCat["Preventivo"]), "paradas programadas", null, "", fil("cat", "Preventivo"))}
          ${metrica("Con pendiente", nf(a.pend, 0), `${a.frep} faltó repuesto`, null, "", fil("pend", "1"))}
        </aside>
        <div class="ki-det__main">
          <div class="ki-panel"><h4>Fallas y horas de parada por semana</h4>${tendencia(a.regs, res.d, res.h)}</div>
          <div class="ki-panel"><h4>Indicadores por máquina <small>toca una fila para ver la máquina</small></h4>${tablaEquipos(a.equipos)}</div>
          <div class="ki-panel"><h4>Top 10 de fallas en ${esc(a.ar.toLowerCase())}</h4>${topFallas(a.regs)}</div>
        </div>
      </div>
    </section>`;
  }

  // Hoja de vida de una máquina: todo lo que le pasó en el periodo.
  function detalleMaquina(res) {
    if (!vista.f.eq) return "";
    const [sede, nombre] = vista.f.eq.split("|");
    const e = res.porEquipo.find((x) => x.k === vista.f.eq);
    const info = C.equipos.find((x) => x.s === sede && x.eq === nombre) || {};
    const regs = res.regs;
    const a = e || { ...agregar(regs, 0), ar: info.ar || "" };
    const m = M.metas[a.ar] || META_GLOBAL;
    // reincidencias: mismo modo de falla en la misma máquina dentro de 7 días
    const fallas = regs.filter(esFalla).sort((p, q) => p.f.localeCompare(q.f));
    let reinc = 0;
    fallas.forEach((r, i) => { if (fallas.slice(0, i).some((p) => (p.fa || "") === (r.fa || "") && r.fa && (new Date(r.f) - new Date(p.f)) / 864e5 <= 7)) reinc++; });
    // calendario del periodo: horas programadas y novedades por día
    const horas = (S.horas()[vista.f.eq]) || {};
    const dias = [];
    for (let d = res.d; d <= res.h; d = S.sumaDias(d, 1)) dias.push(d);
    const porDia = {};
    regs.forEach((r) => { (porDia[r.f] = porDia[r.f] || { n: 0, f: 0 }).n++; if (esFalla(r)) porDia[r.f].f++; });
    const cal = dias.length <= 120 ? `<div class="ki-cal">${dias.map((d) => {
      const h = horas[d] || 0, x = porDia[d];
      const cls = x && x.f ? "is-falla" : h ? "is-prod" : "is-off";
      return `<button type="button" class="ki-cal__d ${cls}" data-ki="dia" data-v="${d}" title="${fechaLarga(d)}: ${h} h programadas${x ? ` · ${x.n} novedades (${x.f} fallas)` : ""}">${Number(d.slice(8))}${x ? `<i>${x.n}</i>` : ""}</button>`;
    }).join("")}</div><p class="ki-leyenda"><span class="ki-sw" style="background:#d1fadf"></span>En producción <span class="ki-sw" style="background:#fee4e2"></span>Con fallas <span class="ki-sw" style="background:#f2f4f7"></span>Parada / stand by · toca un día para abrirlo en el Registro diario</p>` : "";
    const ultimas = regs.slice().sort((p, q) => (q.f + (q.hi || q.hr || "")).localeCompare(p.f + (p.hi || p.hr || ""))).slice(0, 15);
    return `<section class="ki-det ki-det--maq" id="kiDetalle">
      <div class="ki-det__head">
        <button type="button" class="mt-ico" data-ki="quitar" data-k="eq" aria-label="Quitar filtro">←</button>
        <h3>Hoja de vida · ${esc(nombre)}</h3>
        <span class="pl-soft">${esc(sede)} · <span class="ki-sub-link" ${fil("area", a.ar)}>${esc(a.ar)}</span> · ${fechaCorta(res.d)} – ${fechaCorta(res.h)}</span>
        ${info.fi ? `<button type="button" class="button button--light ki-det__ficha" data-ki="ficha" data-v="${esc(info.fi)}">Ficha técnica, repuestos y manual ›</button>` : ""}
      </div>
      <div class="ki-det__grid">
        <aside class="ki-det__kpis">
          ${metrica("Disponibilidad", pct(a.disp), `Objetivo ${pct(m.disp, 0)}`, a.disp == null ? null : a.disp >= m.disp, a.cob == null ? "" : `${pct(a.cob, 0)} de fallas con horario`)}
          ${metrica("Tiempo programado", hh(a.tProg), `${Object.keys(horas).filter((d) => d >= res.d && d <= res.h).length} días con producción`)}
          ${metrica("Fallas", nf(a.fallas, 0), `${reinc} reincidencias (≤ 7 días)`, null, "", fil("cat", "Máquina"))}
          ${metrica("MTBF", a.mtbf == null ? "—" : `${nf(a.mtbf)} h`, `Objetivo ≥ ${m.mtbf} h`, a.mtbf == null || !a.fallas ? null : a.mtbf >= m.mtbf)}
          ${metrica("MTTR", a.mttr == null ? "—" : `${nf(a.mttr, 2)} h`, `Objetivo ≤ ${nf(m.mttr)} h`, a.mttr == null ? null : a.mttr <= m.mttr)}
          ${metrica("Horas de parada", hh(a.hPar), `${a.n} novedades`)}
          ${metrica("Con pendiente", nf(a.pend, 0), `${a.frep} faltó repuesto`, null, "", fil("pend", "1"))}
        </aside>
        <div class="ki-det__main">
          <div class="ki-duo ki-duo--in">
            <div class="ki-panel"><h4>Fallas y horas por semana</h4>${tendencia(regs, res.d, res.h)}</div>
            <div class="ki-panel"><h4>Modos de falla</h4>${barrasH(contar(regs.filter(esFalla), (r) => r.fa || "Sin clasificar").slice(0, 10), { k: "fa", color: "var(--ki-bad-bar)", vacio: "Sin fallas." })}</div>
          </div>
          ${cal ? `<div class="ki-panel"><h4>Calendario de la máquina</h4>${cal}</div>` : ""}
          <div class="ki-panel"><h4>Últimas novedades de la máquina <small>toca una para ver todo el detalle</small></h4>${listaNovedades(ultimas, false)}</div>
        </div>
      </div>
    </section>`;
  }

  function listaNovedades(lista, conCabecera = true) {
    if (!lista.length) return `<p class="pl-soft ki-nada">Sin novedades con estos filtros.</p>`;
    return `<div class="mt-tabla-wrap"><table class="ki-tabla ki-tabla--nov">${conCabecera ? `<thead><tr><th>Fecha</th><th>Máquina</th><th>Categoría · falla</th><th>Qué pasó</th><th>Duración</th><th>Estado</th></tr></thead>` : ""}<tbody>
      ${lista.map((r) => `<tr class="is-link ${vista.abierto === r.id ? "is-sel" : ""}" data-ki="abrir" data-id="${esc(r.id)}" role="button" tabindex="0">
        <td><strong>${fechaCorta(r.f)}</strong><small>${esc(r.t)} · ${esc(r.s)}</small></td>
        <td><strong>${esc(r.eq)}</strong><small>${esc(r.ar || "")}</small></td>
        <td><span class="ki-dotc" style="background:${COLOR_CAT[r.cat] || "#98a2b3"}"></span>${esc(r.cat)}<small>${esc(r.tp)}${r.fa ? " · " + esc(r.fa) : ""}</small></td>
        <td class="ki-nov__de">${esc((r.de || "").slice(0, 160))}${(r.de || "").length > 160 ? "…" : ""}</td>
        <td>${r.min > 0 ? nf(r.min / 60, 2) + " h" : esFalla(r) ? `<span class="mt-falta">sin horario</span>` : "—"}</td>
        <td><span class="mt-est mt-est--${r.ef === "Operativo" ? "ok" : r.ef === "Pendiente" ? "bad" : r.ef === "Operativo con pendiente" ? "warn" : "neutro"}">${esc(r.ef || "Sin cierre")}</span></td>
      </tr>`).join("")}
    </tbody></table></div>`;
  }

  function tablaFiltro(res) {
    const orden = {
      fecha: (a, b) => (b.f + (b.hi || b.hr || "")).localeCompare(a.f + (a.hi || a.hr || "")),
      duracion: (a, b) => (b.min || 0) - (a.min || 0),
      maquina: (a, b) => a.eq.localeCompare(b.eq) || b.f.localeCompare(a.f),
    }[vista.orden];
    const lista = res.regs.slice().sort(orden);
    const pags = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    vista.pagina = Math.min(vista.pagina, pags - 1);
    const trozo = lista.slice(vista.pagina * POR_PAGINA, (vista.pagina + 1) * POR_PAGINA);
    return `<div class="ki-panel ki-panel--nov" id="kiNovedades">
      <div class="ki-nov__head"><h4>Novedades del filtro <span class="rp-count">${lista.length}</span></h4>
        <label class="rp-filtro">Ordenar<select data-ki-campo="orden">${[["fecha", "Más recientes"], ["duracion", "Más largas"], ["maquina", "Por máquina"]].map(([k, l]) => `<option value="${k}" ${vista.orden === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <button type="button" class="button button--light" data-ki="exportar">Exportar esta selección</button>
      </div>
      ${listaNovedades(trozo)}
      ${pags > 1 ? `<div class="ki-pag"><button type="button" class="mt-ico" data-ki="pag" data-v="-1" ${vista.pagina === 0 ? "disabled" : ""}>‹</button><span>Página ${vista.pagina + 1} de ${pags}</span><button type="button" class="mt-ico" data-ki="pag" data-v="1" ${vista.pagina >= pags - 1 ? "disabled" : ""}>›</button></div>` : ""}
    </div>`;
  }

  // Ficha completa de una novedad (panel lateral).
  function panelNovedad() {
    const r = vista.abierto && S.registros().find((x) => x.id === vista.abierto);
    if (!r) return "";
    const info = C.equipos.find((x) => x.s === r.s && x.eq === r.eq) || {};
    const reporte = r.rid && Array.isArray(window.REPORTES_TURNO) && window.REPORTES_TURNO.some((x) => x.id === r.rid);
    const fila = (l, v) => (v || v === 0 ? `<div><dt>${l}</dt><dd>${v}</dd></div>` : "");
    const origen = { chat: "Chat WhatsApp (histórico)", "chat-pegado": "Reporte pegado del chat", "chat-editado": "Chat, completado en el registro", registro: "Registro directo" }[r.src] || r.src;
    return `<div class="tk-sheet-backdrop" data-ki="cerrar"></div>
    <aside class="tk-sheet tk-sheet--ancha ki-ficha" aria-label="Detalle de la novedad">
      <div class="tk-sheet__head"><h4>${esc(r.eq)} · ${fechaCorta(r.f)}</h4><button class="tk-sheet__close" type="button" data-ki="cerrar" aria-label="Cerrar">&times;</button></div>
      <p class="ki-ficha__sub">${esc(fechaLarga(r.f))} · turno ${esc(r.t)} · ${esc(r.s)}${r.hi ? ` · ${esc(r.hi)}–${esc(r.hf || "")}` : r.hr ? ` · reportado ${esc(r.hr)}` : ""}</p>
      <div class="ki-ficha__tags">
        <button type="button" class="mt-tag" style="background:${COLOR_CAT[r.cat]}22;color:${COLOR_CAT[r.cat]}" data-ki="filtro-y-cerrar" data-k="cat" data-v="${esc(r.cat)}">${esc(r.cat)}</button>
        <button type="button" class="mt-tag mt-tag--ope" data-ki="filtro-y-cerrar" data-k="tp" data-v="${esc(r.tp)}">${esc(r.tp)}</button>
        ${r.fa ? `<button type="button" class="mt-tag mt-tag--maq" data-ki="filtro-y-cerrar" data-k="fa" data-v="${esc(r.fa)}">${esc(r.fa)}</button>` : ""}
        <span class="mt-est mt-est--${r.ef === "Operativo" ? "ok" : r.ef === "Pendiente" ? "bad" : r.ef === "Operativo con pendiente" ? "warn" : "neutro"}">${esc(r.ef || "Sin cierre")}</span>
      </div>
      <h5>Qué pasó y qué se hizo</h5>
      <p class="ki-ficha__de">${esc(r.de || "")}</p>
      <dl class="ki-ficha__dl">
        ${fila("Acción", esc(r.ac || ""))}
        ${fila("Duración", r.min > 0 ? `${nf(r.min / 60, 2)} h (${Math.round(r.min)} min)` : "")}
        ${fila("¿Detuvo la máquina?", esc(r.det || ""))}
        ${fila("Repuesto usado", esc(r.rep || ""))}
        ${fila("Faltó repuesto", r.frep ? "Sí" : "")}
        ${fila("Técnico", r.tec ? `<span class="ki-sub-link" data-ki="filtro-y-cerrar" data-k="tec" data-v="${esc(r.tec)}">${esc(r.tec)}</span>` : "")}
        ${fila("OT / Solicitud", esc(r.ot || ""))}
        ${fila("Registrado por", esc(r.por || ""))}
        ${fila("Origen", esc(origen))}
        ${fila("Tipo de máquina", `<span class="ki-sub-link" data-ki="filtro-y-cerrar" data-k="area" data-v="${esc(r.ar)}">${esc(r.ar)}</span>`)}
      </dl>
      <div class="ki-ficha__acc">
        <button type="button" class="button button--dark" data-ki="filtro-y-cerrar" data-k="eq" data-v="${esc(claveEq(r))}">Hoja de vida de ${esc(r.eq)}</button>
        <button type="button" class="button button--light" data-ki="editar" data-id="${esc(r.id)}">${r.src === "chat" ? "Completar en el Registro" : "Editar en el Registro"}</button>
        ${reporte ? `<button type="button" class="button button--light" data-ki="reporte" data-v="${esc(r.rid)}">Reporte original del chat</button>` : ""}
        ${info.fi ? `<button type="button" class="button button--light" data-ki="ficha" data-v="${esc(info.fi)}">Ficha técnica del equipo</button>` : ""}
      </div>
    </aside>`;
  }

  // ------------------------------------------------------------------------
  //  Render
  // ------------------------------------------------------------------------
  function render() {
    const raiz = document.getElementById("indicadoresRoot");
    if (!raiz) return;
    const res = calcular();
    const t = res.total;
    const periodos = [["todo", `Desde ${fechaCorta(M.desde)}`], ["mes", "Este mes"], ["mesant", "Mes anterior"], ["30", "Últimos 30 días"], ["7", "Últimos 7 días"], ["custom", "Rango…"]];
    const tecs = contar(res.sin("tec"), (r) => r.tec || "Sin técnico").slice(0, 10);
    const tipos = contar(res.sin("tp"), (r) => r.tp);
    const maqs = res.porEquipo.filter((e) => e.fallas).sort((a, b) => b.fallas - a.fallas).slice(0, 12);
    raiz.innerHTML = `
      <div class="section-bar">
        <div><p class="eyebrow">Mantenimiento · FARMACAPSULAS</p><h2>Cuadro de mando integral</h2></div>
        <div class="section-actions">
          <button class="button button--light" type="button" data-ki="registro">Ir al registro diario</button>
        </div>
      </div>
      <div class="ki-filtros">
        <label class="rp-filtro">Periodo<select data-ki-campo="periodo">${periodos.map(([k, l]) => `<option value="${k}" ${vista.periodo === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        ${vista.periodo === "custom" ? `<label class="rp-filtro">Desde<input type="date" data-ki-campo="desde" value="${vista.desde}"></label><label class="rp-filtro">Hasta<input type="date" data-ki-campo="hasta" value="${vista.hasta}"></label>` : ""}
        <div class="tn-seg">${["", ...C.sedes].map((s) => `<button type="button" data-ki="sede" data-v="${esc(s)}" class="${s === (vista.f.sede || "") ? "is-active" : ""}">${s || "Todas las sedes"}</button>`).join("")}</div>
        <span class="ki-rango">${fechaCorta(res.d)} – ${fechaCorta(res.h)} · <a href="#kiNovedades" class="mt-link">${t.n} novedades</a></span>
      </div>
      ${chips()}
      ${t.cob != null && t.cob < COB_MIN ? `<p class="pl-note ki-cob"><strong>Solo el ${pct(t.cob, 0)} de las fallas de esta selección tiene hora de inicio y fin.</strong> Con eso se cuentan bien las fallas y el MTBF, pero la disponibilidad y el MTTR salen como “—” hasta que se registren los horarios. El histórico del chat casi nunca los trae; desde el Registro diario se piden siempre.</p>` : ""}

      <h3 class="ki-sec">Indicadores de desempeño por sede</h3>
      <div class="ki-sedes">${res.sedes.map(bloqueSede).join("")}</div>

      ${detalleMaquina(res)}

      <div class="ki-trio">
        <div class="ki-panel"><h4>Fallas y horas de parada por semana</h4>${tendencia(res.regs.filter((r) => C.areasProceso.includes(r.ar)), res.d, res.h)}</div>
        <div class="ki-panel"><h4>Novedades y horas por categoría</h4>${donaCategorias(res.sin("cat"))}</div>
        <div class="ki-panel"><h4>Tipo de mantenimiento</h4>${barrasH(tipos, { k: "tp", color: "#2e90fa" })}
          <h4 class="ki-h4-sep">Pendientes</h4>${barrasH([{ l: "Con trabajo pendiente", key: "1", v: res.sin("pend").filter(esPend).length }], { k: "pend", color: "var(--ki-warn)" })}</div>
      </div>

      <h3 class="ki-sec">Indicadores de desempeño por tipo de máquina <small>toca un tipo o una máquina</small></h3>
      <div class="ki-areas">${res.porArea.map(tarjetaArea).join("")}</div>
      ${detalleArea(res)}

      <div class="ki-trio">
        <div class="ki-panel"><h4>Top 10 de fallas</h4>${topFallas(res.sin("fa"))}</div>
        <div class="ki-panel"><h4>Máquinas con más fallas</h4>${barrasH(maqs.map((e) => ({ l: `${e.eq}${vista.f.sede ? "" : " · " + e.s.replace("Sede ", "S")}`, key: e.k, v: e.fallas, e })), { k: "eq", color: (x) => (x.e.mtbf < M.metas[x.e.ar].mtbf ? "var(--ki-bad-bar)" : "var(--ki-ok-bar)") })}
          <p class="ki-leyenda"><span class="ki-sw" style="background:var(--ki-bad-bar)"></span>MTBF bajo la meta <span class="ki-sw" style="background:var(--ki-ok-bar)"></span>Cumple</p></div>
        <div class="ki-panel"><h4>Técnicos que más atendieron</h4>${barrasH(tecs, { k: "tec", color: "#7a5af8" })}</div>
      </div>

      <div class="ki-panel ki-panel--calor"><h4>Mapa de calor · fallas por máquina y semana</h4>${mapaCalor(res)}</div>

      ${tablaFiltro(res)}

      <p class="ki-pie">Tiempo programado: 12 h por turno en que el equipo estuvo en Producción, Montaje o Mantenimiento (Estado de equipos). Falla = novedad de categoría Máquina y tipo Correctivo. MTBF = tiempo programado ÷ fallas · MTTR = horas de las fallas con horario ÷ esas fallas · Disponibilidad = 1 − horas de parada por falla ÷ tiempo programado (solo con ≥ 50 % de fallas con horario). Histórico del chat del ${fechaCorta(M.desde)} al ${fechaCorta(M.hasta)}.</p>
      ${panelNovedad()}`;
  }

  // ------------------------------------------------------------------------
  //  Eventos
  // ------------------------------------------------------------------------
  function ponerFiltro(k, v) {
    vista.f[k] = vista.f[k] === v ? "" : v; // tocar lo mismo otra vez lo quita
    if (!vista.f[k]) delete vista.f[k];
    // al elegir una máquina, su sede y tipo quedan implícitos
    if (k === "eq" && vista.f.eq) { delete vista.f.area; }
    vista.pagina = 0;
    render();
    const foco = (k === "area" || k === "eq") && vista.f[k] ? document.getElementById("kiDetalle") : null;
    if (foco) foco.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function exportarSeleccion() {
    try {
      if (!window.XLSX) await new Promise((ok, mal) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"; s.onload = ok; s.onerror = () => mal(new Error("No se pudo descargar la librería de Excel.")); document.head.appendChild(s); });
      const res = calcular();
      const X = window.XLSX;
      const wb = X.utils.book_new();
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet(res.regs.map((r) => ({ Fecha: r.f, Turno: r.t, Sede: r.s, Equipo: r.eq, "Tipo de máquina": r.ar, Categoría: r.cat, Mantenimiento: r.tp, "Modo de falla": r.fa, "Qué pasó": r.de, Acción: r.ac, "Duración (h)": r.min > 0 ? Math.round((r.min / 60) * 100) / 100 : "", "Estado final": r.ef, Técnico: r.tec || "" }))), "Novedades");
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet(res.porEquipo.filter((e) => e.tProg || e.n).map((e) => ({ Sede: e.s, Máquina: e.eq, "Tipo de máquina": e.ar, "Tiempo programado (h)": e.tProg, Novedades: e.n, Fallas: e.fallas, "Horas de parada": Math.round(e.hPar * 100) / 100, "MTBF (h)": e.mtbf === Infinity ? "" : e.mtbf, "MTTR (h)": e.mttr ?? "", Disponibilidad: e.disp ?? "", Pendientes: e.pend }))), "Por máquina");
      const filtros = Object.entries(vista.f).map(([k, v]) => ({ Filtro: FILTROS[k].l, Valor: FILTROS[k].v ? FILTROS[k].v(v) : v }));
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet([{ Filtro: "Periodo", Valor: `${res.d} a ${res.h}` }, ...filtros]), "Filtros");
      X.writeFile(wb, `Indicadores_Mtto_${S.hoy()}.xlsx`);
    } catch (e) { alert(e.message || String(e)); }
  }

  function enlazar() {
    const raiz = document.getElementById("indicadoresRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    const accion = (e) => {
      const b = e.target.closest("[data-ki]");
      if (!b || !raiz.contains(b)) return;
      e.stopPropagation();
      const a = b.dataset.ki;
      if (a === "filtro") ponerFiltro(b.dataset.k, b.dataset.v);
      else if (a === "filtro-y-cerrar") { vista.abierto = ""; vista.f[b.dataset.k] = ""; ponerFiltro(b.dataset.k, b.dataset.v); }
      else if (a === "multi") { const set = JSON.parse(b.dataset.set); Object.assign(vista.f, set); vista.pagina = 0; render(); document.getElementById("kiNovedades")?.scrollIntoView({ behavior: "smooth" }); }
      else if (a === "celda") { vista.f.eq = b.dataset.k; vista.f.sem = b.dataset.s; delete vista.f.area; vista.pagina = 0; render(); document.getElementById("kiDetalle")?.scrollIntoView({ behavior: "smooth" }); }
      else if (a === "quitar") { delete vista.f[b.dataset.k]; vista.pagina = 0; render(); }
      else if (a === "limpiar") { vista.f = {}; vista.pagina = 0; render(); }
      else if (a === "sede") { if (b.dataset.v) vista.f.sede = b.dataset.v; else delete vista.f.sede; vista.pagina = 0; render(); }
      else if (a === "abrir") { vista.abierto = b.dataset.id; render(); }
      else if (a === "cerrar") { vista.abierto = ""; render(); }
      else if (a === "pag") { vista.pagina += Number(b.dataset.v); render(); document.getElementById("kiNovedades")?.scrollIntoView({ block: "start" }); }
      else if (a === "dia") S.irA(b.dataset.v);
      else if (a === "editar") { vista.abierto = ""; window.goRegistro && window.goRegistro({ abrir: b.dataset.id }); }
      else if (a === "reporte") { vista.abierto = ""; window.goReportes && window.goReportes(b.dataset.v); }
      else if (a === "ficha") { vista.abierto = ""; if (typeof openDetail === "function") openDetail(b.dataset.v); }
      else if (a === "registro") window.goRegistro && window.goRegistro();
      else if (a === "exportar") exportarSeleccion();
    };
    raiz.addEventListener("click", accion);
    raiz.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-ki][role=button]")) { e.preventDefault(); accion(e); } if (e.key === "Escape" && vista.abierto) { vista.abierto = ""; render(); } });
    raiz.addEventListener("change", (e) => {
      const k = e.target.dataset.kiCampo;
      if (!k) return;
      vista[k] = e.target.value;
      vista.pagina = 0;
      render();
    });
  }

  function esVisible() { return document.getElementById("indicadoresView")?.classList.contains("is-active"); }

  // op: filtros de entrada, p. ej. { eq: "Sede 4|NJP 2" } o { fa: "Sellado / mordazas" }
  function goIndicadores(op) {
    if (op && typeof op === "object") { vista.f = {}; Object.entries(op).forEach(([k, v]) => { if (FILTROS[k] && v) vista.f[k] = v; }); vista.pagina = 0; }
    views.indicadores = views.indicadores || document.getElementById("indicadoresView");
    setView("indicadores");
    render();
    enlazar();
    saveUiState({ activeView: "indicadores" });
    const foco = op && (op.eq || op.area) ? document.getElementById("kiDetalle") : null;
    if (foco) foco.scrollIntoView({ block: "start" }); else window.scrollTo({ top: 0, behavior: "auto" });
  }

  window.goIndicadores = goIndicadores;
  window.mttoCalcular = calcular; // para pruebas
  views.indicadores = document.getElementById("indicadoresView");
  document.querySelector('[data-nav-view="indicadores"]')?.addEventListener("click", () => goIndicadores());
  S.alCambiar(() => { if (esVisible()) render(); });
})();
