// ============================================================================
//  CUADRO DE MANDO INTEGRAL · MANTENIMIENTO
// ============================================================================
//  Indicadores por sede y por tipo de máquina con los datos del Registro
//  diario (window.MTTO_STORE): tiempo programado, horas de parada,
//  disponibilidad, MTBF, MTTR, modos de falla y horas perdidas por categoría.
//
//  Definiciones (las mismas de la hoja INDICADORES del Excel):
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

  const qs = new URLSearchParams(window.location.search);
  const vista = { periodo: "todo", desde: M.desde, hasta: S.hoy(), sede: qs.get("sede") || "", area: qs.get("area") || "" };

  // ------------------------------------------------------------------------
  //  Cálculo
  // ------------------------------------------------------------------------
  function rango() {
    const h = S.hoy();
    const mes = h.slice(0, 7);
    const [a, m] = mes.split("-").map(Number);
    const mesAnt = new Date(Date.UTC(a, m - 2, 1)).toISOString().slice(0, 7);
    const finMes = (ym) => { const [y, n] = ym.split("-").map(Number); return new Date(Date.UTC(y, n, 0)).toISOString().slice(0, 10); };
    switch (vista.periodo) {
      case "mes": return [mes + "-01", h];
      case "mesant": return [mesAnt + "-01", finMes(mesAnt)];
      case "7": return [S.sumaDias(h, -6), h];
      case "30": return [S.sumaDias(h, -29), h];
      case "custom": return [vista.desde, vista.hasta];
      default: return [M.desde, h];
    }
  }

  const esFalla = (r) => r.cat === "Máquina" && r.tp === "Correctivo";
  const conTiempo = (r) => r.min > 0;
  const paro = (r) => r.det !== "No" && r.min > 0;

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
      pend: regs.filter((r) => r.ef === "Pendiente" || r.ef === "Operativo con pendiente").length,
      frep: regs.filter((r) => r.frep).length,
    };
  }

  function calcular() {
    const [d, h] = rango();
    const regs = S.registros().filter((r) => r.f >= d && r.f <= h && (!vista.sede || r.s === vista.sede));
    const horas = S.horas();
    const tDe = (sede, eq) => Object.entries(horas[`${sede}|${eq}`] || {}).reduce((s, [f, v]) => (f >= d && f <= h ? s + v : s), 0);
    const eqs = C.equipos.filter((e) => e.proc && (!vista.sede || e.s === vista.sede));
    const porEquipo = eqs.map((e) => {
      const rs = regs.filter((r) => r.s === e.s && r.eq === e.eq);
      return { ...e, ...agregar(rs, tDe(e.s, e.eq)), regs: rs };
    });
    const porArea = C.areasProceso.map((ar) => {
      const es = porEquipo.filter((e) => e.ar === ar);
      const rs = regs.filter((r) => r.ar === ar);
      return { ar, meta: M.metas[ar], ...agregar(rs, es.reduce((s, e) => s + e.tProg, 0)), equipos: es, regs: rs };
    });
    const sedes = (vista.sede ? [vista.sede] : C.sedes).map((s) => {
      const es = porEquipo.filter((e) => e.s === s);
      const rs = regs.filter((r) => r.s === s);
      const rProc = rs.filter((r) => C.areasProceso.includes(r.ar));
      const a = agregar(rProc, es.reduce((x, e) => x + e.tProg, 0));
      a.porCat = agregar(rs, 0).porCat;
      a.n = rs.length;
      return { s, ...a };
    });
    const total = agregar(regs.filter((r) => C.areasProceso.includes(r.ar)), porEquipo.reduce((s, e) => s + e.tProg, 0));
    total.porCat = agregar(regs, 0).porCat;
    total.n = regs.length;
    return { d, h, regs, porEquipo, porArea, sedes, total };
  }

  // ------------------------------------------------------------------------
  //  Formato
  // ------------------------------------------------------------------------
  const nf = (v, dec = 1) => (v == null ? "—" : v === Infinity ? "∞" : v.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec }));
  const pct = (v, dec = 1) => (v == null ? "—" : (v * 100).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + " %");
  const hh = (v) => (v == null ? "—" : `${nf(v, v >= 100 ? 0 : 1)} h`);
  const fechaCorta = (iso) => `${Number(iso.slice(8))} ${MESES[Number(iso.slice(5, 7)) - 1].slice(0, 3)}`;

  // estado frente a la meta: ok | bad | na
  function estadoArea(a) {
    const m = a.meta || {};
    if (a.disp != null && a.fallas > 0) return a.disp >= m.disp ? "ok" : "bad";
    if (a.mtbf != null && a.fallas > 0) return a.mtbf >= m.mtbf ? "ok" : "bad";
    return a.tProg > 0 ? "ok" : "na";
  }
  const flecha = (ok) => (ok ? `<span class="ki-ok" aria-label="cumple">✓</span>` : `<span class="ki-bad" aria-label="no cumple">!</span>`);

  function metrica(label, valor, meta, cumple, sub) {
    const cls = cumple == null ? "" : cumple ? "is-ok" : "is-bad";
    return `<div class="ki-m ${cls}"><span class="ki-m__l">${label}</span><b>${valor}${cumple == null ? "" : flecha(cumple)}</b>${meta ? `<small>${meta}</small>` : ""}${sub ? `<small>${sub}</small>` : ""}</div>`;
  }

  // ------------------------------------------------------------------------
  //  Gráficos (SVG sin librerías)
  // ------------------------------------------------------------------------
  function barrasH(items, { valor = (x) => x.v, etiqueta = (x) => x.l, fmt = (v) => nf(v, 0), color = "var(--ki-bar)", max } = {}) {
    if (!items.length) return `<p class="pl-soft ki-nada">Sin datos en el periodo.</p>`;
    const top = max || Math.max(...items.map(valor), 1);
    return `<ul class="ki-bars">${items.map((x) => {
      const v = valor(x);
      return `<li><span class="ki-bars__l" title="${esc(etiqueta(x))}">${esc(etiqueta(x))}</span><span class="ki-bars__t"><span style="width:${Math.max(2, (v / top) * 100).toFixed(1)}%;background:${typeof color === "function" ? color(x) : color}"></span></span><span class="ki-bars__v">${fmt(v)}</span></li>`;
    }).join("")}</ul>`;
  }

  function semanas(d, h) {
    const lunes = (iso) => { const t = new Date(iso + "T12:00:00Z"); const w = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - w); return t.toISOString().slice(0, 10); };
    const out = [];
    for (let s = lunes(d); s <= h; s = S.sumaDias(s, 7)) out.push(s);
    return { lista: out, de: lunes };
  }

  // Columnas (fallas por semana) + línea (horas de parada)
  function tendencia(regs, d, h) {
    const { lista, de } = semanas(d, h);
    if (lista.length < 2) return `<p class="pl-soft ki-nada">Elige un periodo de al menos dos semanas para ver la tendencia.</p>`;
    const fal = Object.fromEntries(lista.map((s) => [s, 0]));
    const hor = Object.fromEntries(lista.map((s) => [s, 0]));
    regs.forEach((r) => { const s = de(r.f); if (s in fal) { if (esFalla(r)) fal[s]++; if (paro(r)) hor[s] += r.min / 60; } });
    const W = 640, H = 190, pl = 30, pr = 34, pt = 16, pb = 30;
    const iw = W - pl - pr, ih = H - pt - pb;
    const mf = Math.max(...Object.values(fal), 1), mh = Math.max(...Object.values(hor), 1);
    const bw = iw / lista.length;
    const x = (i) => pl + bw * i + bw / 2;
    const col = lista.map((s, i) => { const v = fal[s]; const y = pt + ih - (v / mf) * ih; return `<rect x="${(x(i) - bw * 0.3).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.6).toFixed(1)}" height="${(pt + ih - y).toFixed(1)}" rx="3" class="ki-col"><title>Semana del ${fechaCorta(s)}: ${v} fallas</title></rect><text x="${x(i).toFixed(1)}" y="${(y - 4).toFixed(1)}" class="ki-lbl" text-anchor="middle">${v || ""}</text>`; }).join("");
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
    <p class="ki-leyenda"><span class="ki-sw ki-sw--col"></span>Fallas de máquina por semana <span class="ki-sw ki-sw--line"></span>Horas de parada registradas</p>`;
  }

  function donaCategorias(porCat) {
    const colores = { "Máquina": "#d92d20", "Apoyo crítico": "#f79009", "Locativo": "#7a5af8", "Preventivo": "#12b76a", "Operacional": "#2e90fa" };
    const tot = Object.values(porCat).reduce((a, b) => a + b, 0);
    if (!tot) return `<p class="pl-soft ki-nada">Aún no hay horas de parada con horario en el periodo.</p>`;
    let ang = 0;
    const R = 52, r0 = 32, cx = 64, cy = 64;
    const arco = (a0, a1) => {
      const p = (a, rr) => [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
      const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r0), [x3, y3] = p(a0, r0);
      const g = a1 - a0 > Math.PI ? 1 : 0;
      return `M${x0} ${y0}A${R} ${R} 0 ${g} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${g} 0 ${x3} ${y3}Z`;
    };
    const seg = Object.entries(porCat).filter(([, v]) => v > 0).map(([c, v]) => {
      const a0 = ang, a1 = ang + (v / tot) * Math.PI * 2 - (v === tot ? 0.0001 : 0);
      ang = a1;
      return `<path d="${arco(a0, a1)}" fill="${colores[c]}"><title>${c}: ${nf(v)} h</title></path>`;
    }).join("");
    return `<div class="ki-dona"><svg viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="Horas de parada por categoría">${seg}<text x="64" y="62" text-anchor="middle" class="ki-dona__v">${nf(tot, 0)}</text><text x="64" y="78" text-anchor="middle" class="ki-ax">horas</text></svg>
      <ul>${Object.entries(porCat).map(([c, v]) => `<li><span class="ki-sw" style="background:${colores[c]}"></span>${esc(c)}<b>${nf(v)} h</b></li>`).join("")}</ul></div>`;
  }

  // ------------------------------------------------------------------------
  //  Bloques
  // ------------------------------------------------------------------------
  function bloqueSede(x) {
    const m = { disp: 0.92, mtbf: 48, mttr: 1.5 };
    return `<section class="ki-sede">
      <header class="ki-head ki-head--${x.s === "Sede 4" ? "s4" : "s2"}">${esc(x.s === "Sede 2" ? "Sede 2 · Vía 40" : x.s)}</header>
      <div class="ki-sede__grid">
        ${metrica("Tiempo programado", hh(x.tProg), "equipos de proceso")}
        ${metrica("Horas de parada", hh(x.hPar), `${x.n} novedades`)}
        ${metrica("Disponibilidad", pct(x.disp), x.disp == null ? "faltan horarios" : `Objetivo ${pct(m.disp, 0)}`, x.disp == null ? null : x.disp >= m.disp)}
        ${metrica("MTBF", x.mtbf == null ? "—" : `${nf(x.mtbf)} h`, `Objetivo ≥ ${m.mtbf} h`, x.mtbf == null ? null : x.mtbf >= m.mtbf)}
        ${metrica("MTTR", x.mttr == null ? "—" : `${nf(x.mttr, 2)} h`, `Objetivo ≤ ${nf(m.mttr)} h`, x.mttr == null ? null : x.mttr <= m.mttr)}
        ${metrica("Fallas de máquina", nf(x.fallas, 0), `${x.pend} con pendiente`)}
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
    return `<button type="button" class="ki-area ki-area--${st}" data-ki="area" data-v="${esc(a.ar)}">
      <header class="ki-head ki-head--${st}">${esc(a.ar)}</header>
      <div class="ki-area__body">
        <div class="ki-area__kpi">
          ${big}
          <div class="ki-area__mini">
            ${metrica("MTBF", a.mtbf == null ? "—" : nf(a.mtbf), `≥ ${m.mtbf} h`, a.mtbf == null || a.fallas === 0 ? null : a.mtbf >= m.mtbf)}
            ${metrica("MTTR", a.mttr == null ? "—" : nf(a.mttr, 2), `≤ ${nf(m.mttr)} h`, a.mttr == null ? null : a.mttr <= m.mttr)}
          </div>
          <small class="ki-area__h">${hh(a.tProg)} programadas · ${hh(a.hPar)} de parada</small>
        </div>
        <div class="ki-area__bars">${barrasH(top.map((e) => ({ l: e.eq + (vista.sede ? "" : e.s === "Sede 2" ? " (S2)" : ""), v: e.fallas })), { color: st === "bad" ? "var(--ki-bad-bar)" : "var(--ki-ok-bar)" })}</div>
      </div>
    </button>`;
  }

  function topFallas(regs, n = 10) {
    const m = {};
    regs.filter(esFalla).forEach((r) => {
      const k = r.fa || "Sin clasificar";
      m[k] = m[k] || { k, n: 0, h: 0, eqs: {} };
      m[k].n++;
      if (paro(r)) m[k].h += r.min / 60;
      m[k].eqs[r.eq] = (m[k].eqs[r.eq] || 0) + 1;
    });
    const tot = regs.filter(esFalla).length || 1;
    const lista = Object.values(m).sort((a, b) => b.n - a.n).slice(0, n);
    if (!lista.length) return `<p class="pl-soft ki-nada">Sin fallas en el periodo.</p>`;
    return `<table class="ki-tabla"><thead><tr><th>Modo de falla</th><th>Equipo más afectado</th><th>Fallas</th><th>Horas</th><th>% total</th></tr></thead><tbody>
      ${lista.map((x) => { const [eq, ne] = Object.entries(x.eqs).sort((a, b) => b[1] - a[1])[0]; return `<tr><td>${esc(x.k)}</td><td>${esc(eq)} <small>(${ne})</small></td><td>${x.n}</td><td>${x.h ? nf(x.h) : "—"}</td><td><span class="ki-pbar"><span style="width:${((x.n / tot) * 100).toFixed(1)}%"></span></span>${pct(x.n / tot)}</td></tr>`; }).join("")}
    </tbody></table>`;
  }

  function tablaEquipos(es) {
    const filas = es.filter((e) => e.tProg > 0 || e.n > 0).sort((a, b) => b.fallas - a.fallas || b.n - a.n);
    if (!filas.length) return `<p class="pl-soft ki-nada">Sin datos.</p>`;
    return `<div class="mt-tabla-wrap"><table class="ki-tabla ki-tabla--eq"><thead><tr><th>Máquina</th><th>T. programado</th><th>Novedades</th><th>Fallas</th><th>H. parada</th><th>MTBF</th><th>MTTR</th><th>% disp.</th><th>Meta</th><th>Dif.</th><th>Pend.</th></tr></thead><tbody>
      ${filas.map((e) => {
        const m = M.metas[e.ar];
        const dif = e.disp == null ? null : e.disp - m.disp;
        return `<tr><td><strong>${esc(e.eq)}</strong>${vista.sede ? "" : `<small>${esc(e.s)}</small>`}</td><td>${hh(e.tProg)}</td><td>${e.n}</td>
          <td class="${e.fallas >= 10 ? "ki-hot" : ""}">${e.fallas}</td><td>${e.hPar ? nf(e.hPar) : "—"}</td>
          <td class="${e.fallas && e.mtbf < m.mtbf ? "ki-bad" : ""}">${e.mtbf == null ? "—" : nf(e.mtbf)}</td>
          <td class="${e.mttr != null && e.mttr > m.mttr ? "ki-bad" : ""}">${e.mttr == null ? "—" : nf(e.mttr, 2)}</td>
          <td>${e.disp == null ? `<span class="pl-soft" title="Menos de la mitad de las fallas tiene horario">s/d</span>` : pct(e.disp)}</td><td>${pct(m.disp, 0)}</td>
          <td class="${dif == null ? "" : dif >= 0 ? "ki-ok" : "ki-bad"}">${dif == null ? "—" : (dif >= 0 ? "+" : "") + nf(dif * 100) + " pts"}</td>
          <td>${e.pend || ""}</td></tr>`;
      }).join("")}</tbody></table></div>`;
  }

  function detalle(res) {
    const a = res.porArea.find((x) => x.ar === vista.area);
    if (!a) return "";
    const m = a.meta;
    const recientes = a.regs.filter((r) => r.tp === "Correctivo").sort((p, q) => (q.f + (q.hi || q.hr || "")).localeCompare(p.f + (p.hi || p.hr || ""))).slice(0, 12);
    return `<section class="ki-det" id="kiDetalle">
      <div class="ki-det__head">
        <button type="button" class="mt-ico" data-ki="cerrar-area" aria-label="Volver">←</button>
        <h3>Vista en detalle · ${esc(a.ar)}</h3>
        <span class="pl-soft">${fechaCorta(res.d)} – ${fechaCorta(res.h)}${vista.sede ? " · " + esc(vista.sede) : ""}</span>
      </div>
      <div class="ki-det__grid">
        <aside class="ki-det__kpis">
          ${metrica("Disponibilidad", pct(a.disp), `Objetivo ${pct(m.disp, 0)}`, a.disp == null ? null : a.disp >= m.disp, a.cob == null ? "" : `${pct(a.cob, 0)} de fallas con horario`)}
          ${metrica("Horas de parada", hh(a.hPar), `${hh(a.tProg)} programadas`)}
          ${metrica("MTBF máquinas", a.mtbf == null ? "—" : `${nf(a.mtbf)} h`, `Objetivo ≥ ${m.mtbf} h`, a.mtbf == null || !a.fallas ? null : a.mtbf >= m.mtbf)}
          ${metrica("MTTR máquinas", a.mttr == null ? "—" : `${nf(a.mttr, 2)} h`, `Objetivo ≤ ${nf(m.mttr)} h`, a.mttr == null ? null : a.mttr <= m.mttr)}
          ${metrica("H. apoyo crítico", hh(a.porCat["Apoyo crítico"]), "aire, energía, agua, HVAC")}
          ${metrica("H. operacional", hh(a.porCat["Operacional"]), "cuadres, formatos, operador")}
          ${metrica("H. preventivo", hh(a.porCat["Preventivo"]), "paradas programadas")}
          ${metrica("Faltó repuesto", nf(a.frep, 0), `${a.pend} con pendiente`)}
        </aside>
        <div class="ki-det__main">
          <div class="ki-panel"><h4>Fallas y horas de parada por semana</h4>${tendencia(a.regs, res.d, res.h)}</div>
          <div class="ki-panel"><h4>Indicadores por máquina</h4>${tablaEquipos(a.equipos)}</div>
          <div class="ki-panel"><h4>Top 10 de fallas en ${esc(a.ar.toLowerCase())}</h4>${topFallas(a.regs)}</div>
          <div class="ki-panel"><h4>Últimas fallas atendidas</h4>
            <ul class="ki-rec">${recientes.map((r) => `<li><button type="button" class="mt-link" data-ki="ir" data-v="${r.f}">${fechaCorta(r.f)}</button><strong>${esc(r.eq)}</strong><span>${esc((r.de || "").slice(0, 170))}${(r.de || "").length > 170 ? "…" : ""}</span>${r.min ? `<em>${nf(r.min / 60)} h</em>` : ""}</li>`).join("") || `<li class="pl-soft">Sin correctivos en el periodo.</li>`}</ul>
          </div>
        </div>
      </div>
    </section>`;
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
    const cobTxt = t.cob == null ? "" : pct(t.cob, 0);
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
        <div class="tn-seg">${["", ...C.sedes].map((s) => `<button type="button" data-ki="sede" data-v="${esc(s)}" class="${s === vista.sede ? "is-active" : ""}">${s || "Todas las sedes"}</button>`).join("")}</div>
        <span class="ki-rango">${fechaCorta(res.d)} – ${fechaCorta(res.h)} · ${t.n} novedades</span>
      </div>
      ${t.cob != null && t.cob < COB_MIN ? `<p class="pl-note ki-cob"><strong>Solo el ${cobTxt} de las fallas de este periodo tiene hora de inicio y fin.</strong> Con eso se cuentan bien las fallas y el MTBF, pero la disponibilidad y el MTTR salen como “—” hasta que se registren los horarios. El histórico del chat casi nunca los trae; desde el Registro diario se piden siempre.</p>` : ""}

      <h3 class="ki-sec">Indicadores de desempeño por sede</h3>
      <div class="ki-sedes">${res.sedes.map(bloqueSede).join("")}</div>

      <div class="ki-duo">
        <div class="ki-panel"><h4>Fallas y horas de parada por semana</h4>${tendencia(res.regs.filter((r) => C.areasProceso.includes(r.ar)), res.d, res.h)}</div>
        <div class="ki-panel"><h4>Horas perdidas por categoría</h4>${donaCategorias(t.porCat)}</div>
      </div>

      <h3 class="ki-sec">Indicadores de desempeño por tipo de máquina <small>clic para ver el detalle</small></h3>
      <div class="ki-areas">${res.porArea.map(tarjetaArea).join("")}</div>
      ${detalle(res)}

      <div class="ki-duo">
        <div class="ki-panel"><h4>Top 10 de fallas de la planta</h4>${topFallas(res.regs)}</div>
        <div class="ki-panel"><h4>Máquinas con más fallas</h4>${barrasH(res.porEquipo.filter((e) => e.fallas).sort((a, b) => b.fallas - a.fallas).slice(0, 12).map((e) => ({ l: `${e.eq}${vista.sede ? "" : " · " + e.s.replace("Sede ", "S")}`, v: e.fallas, e })), { color: (x) => (x.e.mtbf < M.metas[x.e.ar].mtbf ? "var(--ki-bad-bar)" : "var(--ki-ok-bar)") })}
          <p class="ki-leyenda"><span class="ki-sw" style="background:var(--ki-bad-bar)"></span>MTBF por debajo de la meta <span class="ki-sw" style="background:var(--ki-ok-bar)"></span>Cumple</p></div>
      </div>
      <p class="ki-pie">Tiempo programado: 12 h por turno en que el equipo estuvo en Producción, Montaje o Mantenimiento (Estado de equipos). Falla = novedad de categoría Máquina y tipo Correctivo. MTBF = tiempo programado ÷ fallas · MTTR = horas de las fallas con horario ÷ esas fallas · Disponibilidad = 1 − horas de parada por falla ÷ tiempo programado (solo con ≥ 50 % de fallas con horario). Histórico del chat del ${fechaCorta(M.desde)} al ${fechaCorta(M.hasta)}.</p>`;
  }

  function enlazar() {
    const raiz = document.getElementById("indicadoresRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ki]");
      if (!b) return;
      const a = b.dataset.ki;
      if (a === "sede") { vista.sede = b.dataset.v; render(); }
      else if (a === "area") { vista.area = vista.area === b.dataset.v ? "" : b.dataset.v; render(); if (vista.area) document.getElementById("kiDetalle")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      else if (a === "cerrar-area") { vista.area = ""; render(); }
      else if (a === "ir") S.irA(b.dataset.v);
      else if (a === "registro") window.goRegistro && window.goRegistro();
    });
    raiz.addEventListener("change", (e) => {
      const k = e.target.dataset.kiCampo;
      if (!k) return;
      vista[k] = e.target.value;
      if (k === "periodo" && vista.periodo === "custom") { const [d, h] = [M.desde, S.hoy()]; vista.desde = vista.desde || d; vista.hasta = vista.hasta || h; }
      render();
    });
  }

  function esVisible() { return document.getElementById("indicadoresView")?.classList.contains("is-active"); }

  function goIndicadores() {
    views.indicadores = views.indicadores || document.getElementById("indicadoresView");
    setView("indicadores");
    render();
    enlazar();
    saveUiState({ activeView: "indicadores" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  window.goIndicadores = goIndicadores;
  window.mttoCalcular = calcular; // para pruebas
  views.indicadores = document.getElementById("indicadoresView");
  document.querySelector('[data-nav-view="indicadores"]')?.addEventListener("click", goIndicadores);
  S.alCambiar(() => { if (esVisible()) render(); });
})();
