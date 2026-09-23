// ============================================================================
//  INDICADORES DE MANTENIMIENTO
// ============================================================================
//  Salen solos de las ordenes de trabajo (assets/js/ordenes.js). Nadie los
//  calcula a mano: si las OT se cierran con la parada y la causa, esto se llena.
//
//  Definiciones (las de siempre en mantenimiento, dichas en pantalla tambien):
//    - Falla: OT correctiva con el equipo detenido.
//    - Horas detenido: tiempo de parada por fallas dentro del periodo. Una
//      parada que empezo antes del periodo cuenta solo la parte de dentro.
//    - MTTR (tiempo medio de reparacion): cuanto dura en promedio una parada
//      por falla, de las que ya terminaron.
//    - MTBF (tiempo medio entre fallas): horas de operacion del periodo sin
//      contar las paradas, dividido entre el numero de fallas.
//    - Disponibilidad: 1 - horas detenido por fallas / horas de operacion.
//  Las horas de operacion se calculan con las horas por dia que se indiquen
//  (24 por defecto): con dos turnos de 8 horas hay que poner 16.
// ============================================================================

(function () {
  const PREF = "equipos-kpi-v1";
  const vista = cargar();

  function cargar() {
    try { return { dias: 90, horasDia: 24, ...JSON.parse(localStorage.getItem(PREF) || "{}") }; }
    catch (e) { return { dias: 90, horasDia: 24 }; }
  }
  function guardar() { try { localStorage.setItem(PREF, JSON.stringify(vista)); } catch (e) {} }
  const esc = (v) => planEsc(v);
  const HORA = 3600000;
  const num = (n, dec = 1) => (n === null || n === undefined || !Number.isFinite(n) ? "—" : n.toLocaleString("es-CO", { maximumFractionDigits: dec, minimumFractionDigits: 0 }));
  const horas = (ms) => ms / HORA;

  function ordenes() { return typeof tasks !== "undefined" ? tasks : []; }

  // Intervalo de parada de una OT: [inicio, fin]. Si sigue parada, hasta ahora.
  function intervalo(t) {
    if (!t.paro) return null;
    const ini = otMs(t.paroInicio);
    if (ini === null) return null;
    const fin = otMs(t.paroFin) ?? (t.status === "hecha" ? otMs(t.doneAt) : Date.now());
    return fin !== null && fin > ini ? { ini, fin, terminada: otMs(t.paroFin) !== null || t.status === "hecha" } : null;
  }

  function calcular() {
    const ahora = Date.now();
    const todas = ordenes();
    const primera = Math.min(...todas.map((t) => Date.parse(t.createdAt || "") || ahora), ahora);
    const desde = vista.dias ? ahora - vista.dias * 24 * HORA : primera;
    const diasPeriodo = Math.max((ahora - desde) / (24 * HORA), 1 / 24);
    const horasOperacion = diasPeriodo * vista.horasDia;
    const recorte = (iv) => Math.max(0, Math.min(iv.fin, ahora) - Math.max(iv.ini, desde));
    const enPeriodo = (ms) => ms !== null && ms >= desde && ms <= ahora;

    const porEquipo = new Map();
    const fila = (t) => {
      const k = t.machine || "_";
      if (!porEquipo.has(k)) porEquipo.set(k, { id: k, nombre: taskMachineName(t.machine), fallas: 0, msFalla: 0, msPlan: 0, duraciones: [], abiertas: 0, hh: 0, ots: 0 });
      return porEquipo.get(k);
    };

    let fallas = 0, msFalla = 0, msPlan = 0, hh = 0, prev = 0, corr = 0, sinDetalle = 0;
    const duraciones = [];
    const causas = new Map();
    const repuestos = new Map();
    const abiertas = [];

    todas.forEach((t) => {
      const correctiva = t.tipo === "correctiva";
      const iv = intervalo(t);
      const creada = Date.parse(t.createdAt || "");
      const cerrada = t.status === "hecha" ? Date.parse(t.doneAt || "") : null;
      const tocaPeriodo = enPeriodo(creada) || enPeriodo(cerrada) || (iv && recorte(iv) > 0);

      if (t.status !== "hecha") abiertas.push(t);
      if (!tocaPeriodo && t.status === "hecha") return;
      const f = fila(t);
      f.ots++;
      if (t.status !== "hecha") f.abiertas++;

      if (iv) {
        const ms = recorte(iv);
        if (correctiva) {
          f.msFalla += ms; msFalla += ms;
          if (enPeriodo(iv.ini)) {
            f.fallas++; fallas++;
            if (iv.terminada) { f.duraciones.push(iv.fin - iv.ini); duraciones.push(iv.fin - iv.ini); }
          }
        } else { f.msPlan += ms; msPlan += ms; }
      }

      if (enPeriodo(cerrada)) {
        if (t.tipo === "preventiva") prev++;
        if (correctiva) corr++;
        const c = t.cierre;
        if (!c && t.tipo) sinDetalle++;
        if (c) {
          if (Number(c.hh) > 0) { hh += Number(c.hh); f.hh += Number(c.hh); }
          if (correctiva) { const k = c.causaTipo || "Sin clasificar"; causas.set(k, (causas.get(k) || 0) + 1); }
          (c.repuestos || []).forEach((r) => {
            const x = repuestos.get(r.cod) || { cod: r.cod, d: r.d, q: 0, ots: 0 };
            x.q += Number(r.q) || 0; x.ots++; if (!x.d && r.d) x.d = r.d;
            repuestos.set(r.cod, x);
          });
        }
      }
    });

    const media = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
    const equipos = [...porEquipo.values()].map((e) => ({
      ...e,
      mttr: media(e.duraciones) === null ? null : horas(media(e.duraciones)),
      mtbf: e.fallas ? (horasOperacion - horas(e.msFalla)) / e.fallas : null,
      disp: Math.max(0, 1 - horas(e.msFalla) / horasOperacion),
    })).sort((a, b) => b.msFalla - a.msFalla || b.fallas - a.fallas || b.ots - a.ots);

    return {
      desde, diasPeriodo, horasOperacion, fallas, hDetenido: horas(msFalla), hPlan: horas(msPlan),
      mttr: media(duraciones) === null ? null : horas(media(duraciones)), hh, prev, corr, sinDetalle,
      equipos, causas: [...causas.entries()].sort((a, b) => b[1] - a[1]),
      repuestos: [...repuestos.values()].sort((a, b) => b.q - a.q).slice(0, 10),
      abiertas: abiertas.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
      detenidos: abiertas.filter(otEquipoParado),
    };
  }

  // ------------------------------------------------------------------------
  function render() {
    const raiz = document.getElementById("kpiRoot");
    if (!raiz) return;
    const k = calcular();
    const hayOT = ordenes().some((t) => t.tipo);
    const periodo = (d, txt) => `<option value="${d}" ${vista.dias === d ? "selected" : ""}>${txt}</option>`;
    const antig = (t) => Math.floor((Date.now() - (Date.parse(t.createdAt || "") || Date.now())) / (24 * HORA));
    const viejas = k.abiertas.filter((t) => antig(t) > 7).length;
    const pctPrev = k.prev + k.corr ? Math.round((k.prev / (k.prev + k.corr)) * 100) : null;
    const maxH = Math.max(...k.equipos.map((e) => horas(e.msFalla)), 0);
    const maxC = Math.max(...k.causas.map((c) => c[1]), 0);

    raiz.innerHTML = `
      <div class="section-bar">
        <div>
          <p class="eyebrow">Mantenimiento</p>
          <h2>Indicadores</h2>
        </div>
        <div class="kpi-ctrl">
          <label>Periodo <select id="kpiDias">${periodo(30, "30 d&iacute;as")}${periodo(90, "90 d&iacute;as")}${periodo(365, "Un a&ntilde;o")}${periodo(0, "Todo")}</select></label>
          <label title="Con dos turnos de 8 horas, 16. Se usa para la disponibilidad y el MTBF.">Horas de operaci&oacute;n por d&iacute;a <input id="kpiHoras" type="number" min="1" max="24" step="1" value="${esc(vista.horasDia)}"></label>
        </div>
      </div>

      ${hayOT ? "" : `<p class="pl-note">Estos indicadores salen de las <strong>&oacute;rdenes de trabajo</strong>. Cuando una falla pare un equipo, abre una orden <strong>correctiva</strong> marcando <em>El equipo est&aacute; detenido</em>, y al cerrarla anota cu&aacute;ndo arranc&oacute;, la causa y los repuestos. Desde la primera orden cerrada, esto se llena solo.</p>`}

      ${k.detenidos.length ? `<div class="ot-paro-strip kpi-detenidos"><strong>${k.detenidos.length} ${k.detenidos.length === 1 ? "equipo detenido" : "equipos detenidos"} ahora:</strong> ${k.detenidos.map((t) => `${esc(taskMachineName(t.machine))} (${esc(otDuracion(otParadaMs(t)))})`).join(", ")}</div>` : ""}

      <div class="kpi-row">
        <div class="kpi-tile kpi-tile--hero">
          <span class="kpi-tile__l">Horas detenido por fallas</span>
          <span class="kpi-tile__n">${num(k.hDetenido)} h</span>
          <span class="kpi-tile__s">${k.fallas} ${k.fallas === 1 ? "falla" : "fallas"} en ${num(k.diasPeriodo, 0)} d&iacute;as${k.hPlan ? ` &middot; ${num(k.hPlan)} h de parada planificada aparte` : ""}</span>
        </div>
        <div class="kpi-tile"><span class="kpi-tile__l">MTTR</span><span class="kpi-tile__n">${k.mttr === null ? "&mdash;" : num(k.mttr) + " h"}</span><span class="kpi-tile__s">Tiempo medio de reparaci&oacute;n</span></div>
        <div class="kpi-tile"><span class="kpi-tile__l">&Oacute;rdenes abiertas</span><span class="kpi-tile__n">${k.abiertas.length}</span><span class="kpi-tile__s">${viejas ? `${viejas} con m&aacute;s de 7 d&iacute;as` : "Ninguna con m&aacute;s de 7 d&iacute;as"}</span></div>
        <div class="kpi-tile"><span class="kpi-tile__l">Preventivo</span><span class="kpi-tile__n">${pctPrev === null ? "&mdash;" : pctPrev + " %"}</span><span class="kpi-tile__s">${k.prev} preventivas y ${k.corr} correctivas cerradas</span></div>
        <div class="kpi-tile"><span class="kpi-tile__l">Horas-hombre</span><span class="kpi-tile__n">${num(k.hh)}</span><span class="kpi-tile__s">Anotadas al cerrar</span></div>
      </div>

      <h3 class="kpi-h">Por equipo</h3>
      ${k.equipos.length ? `
      <div class="pl-tablewrap">
        <table class="pl-table kpi-table">
          <thead><tr><th>Equipo</th><th class="pl-num">Fallas</th><th>Horas detenido por fallas</th><th class="pl-num">MTTR</th><th class="pl-num">MTBF</th><th class="pl-num">Disponibilidad</th><th class="pl-num">Parada planif.</th><th class="pl-num">Abiertas</th></tr></thead>
          <tbody>${k.equipos.map((e) => {
            const h = horas(e.msFalla);
            return `<tr>
              <td>${esc(e.nombre)}</td>
              <td class="pl-num">${e.fallas}</td>
              <td class="kpi-barcell" title="${esc(e.nombre)}: ${num(h)} h detenido por fallas">
                <span class="kpi-bar" style="width:${maxH ? Math.max((h / maxH) * 100, h ? 2 : 0) : 0}%"></span><span class="kpi-bar__v">${num(h)} h</span></td>
              <td class="pl-num">${e.mttr === null ? "&mdash;" : num(e.mttr) + " h"}</td>
              <td class="pl-num">${e.mtbf === null ? '<span class="pl-soft">sin fallas</span>' : num(e.mtbf, 0) + " h"}</td>
              <td class="pl-num">${num(e.disp * 100, 1)} %</td>
              <td class="pl-num">${e.msPlan ? num(horas(e.msPlan)) + " h" : "&mdash;"}</td>
              <td class="pl-num">${e.abiertas || "&mdash;"}</td>
            </tr>`;
          }).join("")}</tbody>
        </table>
      </div>` : `<p class="pl-soft">Ninguna orden en este periodo.</p>`}
      <p class="pl-soft kpi-nota">Disponibilidad y MTBF sobre ${num(k.horasOperacion, 0)} h de operaci&oacute;n (${num(k.diasPeriodo, 0)} d&iacute;as &times; ${esc(vista.horasDia)} h). Cuenta solo la parada por fallas; la preventiva va aparte.${k.sinDetalle ? ` ${k.sinDetalle} ${k.sinDetalle === 1 ? "orden se cerr&oacute;" : "&oacute;rdenes se cerraron"} sin anotar el trabajo y no aportan causa ni repuestos.` : ""}</p>

      <div class="kpi-dos">
        <section>
          <h3 class="kpi-h">Por qu&eacute; fallan</h3>
          ${k.causas.length ? `<ul class="kpi-causas">${k.causas.map(([c, n]) => `
            <li title="${esc(c)}: ${n} ${n === 1 ? "falla" : "fallas"}"><span class="kpi-causas__t">${esc(c)}</span>
              <span class="kpi-causas__b"><span class="kpi-bar" style="width:${(n / maxC) * 100}%"></span></span><span class="kpi-causas__n">${n}</span></li>`).join("")}</ul>`
            : `<p class="pl-soft">A&uacute;n no hay correctivas cerradas con causa en este periodo.</p>`}
        </section>
        <section>
          <h3 class="kpi-h">Repuestos m&aacute;s usados</h3>
          ${k.repuestos.length ? `<div class="pl-tablewrap"><table class="pl-table kpi-rep">
            <thead><tr><th>C&oacute;digo</th><th>Pieza</th><th class="pl-num">Cant.</th><th class="pl-num">&Oacute;rdenes</th></tr></thead>
            <tbody>${k.repuestos.map((r) => `<tr><td class="pl-code">${esc(r.cod)}</td><td>${esc(r.d) || "&mdash;"}</td><td class="pl-num">${num(r.q)}</td><td class="pl-num">${r.ots}</td></tr>`).join("")}</tbody>
          </table></div>` : `<p class="pl-soft">A&uacute;n no hay repuestos anotados en cierres de este periodo.</p>`}
        </section>
      </div>

      ${k.abiertas.length ? `
      <h3 class="kpi-h">&Oacute;rdenes abiertas, de la m&aacute;s antigua</h3>
      <ul class="kpi-abiertas">${k.abiertas.slice(0, 8).map((t) => `
        <li><span class="ot-tipo ot-tipo--${esc(t.tipo || "tarea")}">${esc((OT_TIPOS[t.tipo] || { txt: "Tarea" }).txt)}</span>
          <strong>${esc(t.title)}</strong> <span class="pl-soft">${esc(taskMachineName(t.machine))} &middot; hace ${antig(t)} ${antig(t) === 1 ? "d&iacute;a" : "d&iacute;as"}${otEquipoParado(t) ? " &middot; equipo detenido" : ""}</span></li>`).join("")}</ul>` : ""}`;

    document.getElementById("kpiDias").addEventListener("change", (e) => { vista.dias = Number(e.target.value); guardar(); render(); });
    document.getElementById("kpiHoras").addEventListener("change", (e) => {
      const h = Number(e.target.value);
      if (h >= 1 && h <= 24) { vista.horasDia = h; guardar(); render(); } else e.target.value = vista.horasDia;
    });
  }

  function esVisible() { return document.getElementById("indicadoresView")?.classList.contains("is-active"); }

  function goIndicadores() {
    views.indicadores = views.indicadores || document.getElementById("indicadoresView");
    setView("indicadores");
    render();
    saveUiState({ activeView: "indicadores" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  window.goIndicadores = goIndicadores;
  window.kpiRenderSiVisible = () => { if (esVisible()) render(); };
  window.kpiCalcular = calcular;   // para las pruebas
  views.indicadores = document.getElementById("indicadoresView");
  document.querySelector('[data-nav-view="indicadores"]')?.addEventListener("click", goIndicadores);
})();
