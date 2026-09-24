// ============================================================================
//  REPORTES DE TURNO: los reportes completos del chat "Mtto Medicamentos"
// ============================================================================
//  Vienen de assets/js/reportes-data.js (window.REPORTES_TURNO), que genera
//  scripts/importar-reportes-whatsapp.mjs con el export del chat de WhatsApp.
//  Aquí solo se listan, se filtran y se abren a pantalla completa. El Diario
//  toma de la misma lista el resumen de cada día.
// ============================================================================

(function () {
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const esc = (v) => planEsc(v);

  const vista = { mes: "", sede: "", q: "", abierto: "" };

  function todos() {
    return Array.isArray(window.REPORTES_TURNO) ? window.REPORTES_TURNO : [];
  }

  function fechaLarga(iso) {
    const [a, m, d] = String(iso).split("-").map(Number);
    if (!a) return iso || "";
    const f = new Date(Date.UTC(a, m - 1, d));
    const dow = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][f.getUTCDay()];
    return `${dow} ${d} de ${MESES[m - 1]} de ${a}`;
  }

  function filtrados() {
    const q = vista.q.trim().toLowerCase();
    return todos()
      .filter((r) => {
        if (vista.mes && !r.fecha.startsWith(vista.mes)) return false;
        if (vista.sede && r.sede !== vista.sede) return false;
        if (!q) return true;
        const heno = [
          r.fecha, r.autor, r.sede, r.turno, r.texto,
          ...(r.equipos || []).map((e) => `${e.equipo} ${e.producto}`),
          ...(r.novedades || []),
        ].join(" ").toLowerCase();
        return heno.includes(q);
      })
      .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  }

  function mesesDisponibles() {
    const set = new Set(todos().map((r) => r.fecha.slice(0, 7)));
    return [...set].sort().reverse();
  }

  function badge(r) {
    const sede = `<span class="rp-badge rp-badge--sede">${esc(r.sede)}</span>`;
    const turno = r.turno ? `<span class="rp-badge rp-badge--turno">${esc(r.turno)}</span>` : "";
    return sede + turno;
  }

  function resumenFila(r) {
    const eq = (r.equipos || []).length;
    const nov = (r.novedades || []).length;
    const partes = [];
    if (eq) partes.push(`${eq} ${eq === 1 ? "equipo" : "equipos"}`);
    if (nov) partes.push(`${nov} ${nov === 1 ? "novedad" : "novedades"}`);
    return partes.join(" · ") || "sin detalle";
  }

  function htmlDetalle(r) {
    if (!r) return `<p class="pl-soft">Elige un reporte de la lista.</p>`;
    const eqs = (r.equipos || []).length
      ? `<table class="rp-table">
          <thead><tr><th>Equipo</th><th>Producto / estado</th></tr></thead>
          <tbody>${r.equipos.map((e) => `<tr><td><strong>${esc(e.equipo)}</strong></td><td>${esc(e.producto || "—")}</td></tr>`).join("")}</tbody>
        </table>`
      : `<p class="pl-soft">Este reporte no trae lista de equipos operando; va centrado en las novedades.</p>`;
    const novs = (r.novedades || []).length
      ? `<ul class="rp-nov">${r.novedades.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`
      : `<p class="pl-soft">Sin novedades registradas en el mensaje.</p>`;
    return `
      <div class="rp-det__head">
        <div>
          <p class="eyebrow">Reporte de turno</p>
          <h3>${esc(fechaLarga(r.fecha))}${r.hora ? ` · ${esc(r.hora)}` : ""}</h3>
          <p class="rp-det__meta">${badge(r)} <span>${esc(r.autor)}</span></p>
        </div>
        <button type="button" class="button button--light" data-rp="cerrar">Cerrar</button>
      </div>
      <section class="rp-block">
        <h4>Equipos operando <span class="rp-count">${(r.equipos || []).length}</span></h4>
        ${eqs}
      </section>
      <section class="rp-block">
        <h4>Novedades <span class="rp-count">${(r.novedades || []).length}</span></h4>
        ${novs}
      </section>
      <section class="rp-block">
        <h4>Mensaje original</h4>
        <pre class="rp-original">${esc(r.texto)}</pre>
      </section>`;
  }

  function render() {
    const raiz = document.getElementById("reportesRoot");
    if (!raiz) return;
    if (!vista.mes) {
      const ms = mesesDisponibles();
      vista.mes = ms[0] || "";
    }
    if (!vista.abierto && window.__rpFoco) {
      vista.abierto = window.__rpFoco;
      window.__rpFoco = "";
    }

    const lista = filtrados();
    const sel = lista.find((r) => r.id === vista.abierto) || todos().find((r) => r.id === vista.abierto) || null;

    const optsMes = mesesDisponibles()
      .map((m) => {
        const [a, n] = m.split("-").map(Number);
        const label = `${MESES[n - 1]} ${a}`;
        return `<option value="${m}" ${m === vista.mes ? "selected" : ""}>${label}</option>`;
      })
      .join("");

    const filas = lista.length
      ? lista
          .map(
            (r) => `
        <button type="button" class="rp-item ${r.id === vista.abierto ? "is-sel" : ""}" data-rp="abrir" data-id="${esc(r.id)}">
          <span class="rp-item__fecha">${esc(r.fecha.slice(8))}/${esc(r.fecha.slice(5, 7))}</span>
          <span class="rp-item__cuerpo">
            <span class="rp-item__tit">${badge(r)} <strong>${esc(r.autor)}</strong></span>
            <span class="rp-item__res">${esc(resumenFila(r))}</span>
          </span>
        </button>`
          )
          .join("")
      : `<li class="pl-soft dy-nada">No hay reportes con esos filtros.</li>`;

    raiz.innerHTML = `
      <div class="section-bar">
        <div>
          <p class="eyebrow">Turnos</p>
          <h2>Reportes de turno</h2>
        </div>
        <div class="section-actions">
          <span class="counter">${lista.length} reportes</span>
        </div>
      </div>
      <p class="pl-note">Los reportes que llegan al chat <strong>Mtto Medicamentos</strong>, tal cual se enviaron: equipos operando, novedades del turno y el mensaje original. Se importan desde el export de WhatsApp con <code>scripts/importar-reportes-whatsapp.mjs</code>.</p>
      <div class="rp-filtros">
        <label class="rp-filtro">Mes
          <select data-rp-campo="mes">${optsMes}</select>
        </label>
        <label class="rp-filtro">Sede
          <select data-rp-campo="sede">
            <option value="" ${!vista.sede ? "selected" : ""}>Todas</option>
            <option value="Sede 4" ${vista.sede === "Sede 4" ? "selected" : ""}>Sede 4</option>
            <option value="Sede 2" ${vista.sede === "Sede 2" ? "selected" : ""}>Sede 2</option>
          </select>
        </label>
        <label class="rp-filtro rp-filtro--buscar">Buscar
          <input type="search" data-rp-campo="q" value="${esc(vista.q)}" placeholder="Equipo, producto, novedad, autor…" />
        </label>
      </div>
      <div class="rp-grid">
        <ul class="rp-lista">${filas}</ul>
        <aside class="rp-det" id="rpDet">${htmlDetalle(sel)}</aside>
      </div>`;
  }

  function enlazar() {
    const raiz = document.getElementById("reportesRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-rp]");
      if (!b) return;
      if (b.dataset.rp === "abrir") {
        vista.abierto = b.dataset.id;
        render();
        if (window.innerWidth < 1000) document.getElementById("rpDet")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (b.dataset.rp === "cerrar") {
        vista.abierto = "";
        render();
      }
    });
    raiz.addEventListener("change", (e) => {
      const t = e.target;
      if (!t.dataset.rpCampo) return;
      vista[t.dataset.rpCampo] = t.value;
      if (t.dataset.rpCampo !== "q") vista.abierto = "";
      render();
    });
    let t = null;
    raiz.addEventListener("input", (e) => {
      if (e.target.dataset.rpCampo !== "q") return;
      clearTimeout(t);
      const val = e.target.value;
      t = setTimeout(() => {
        vista.q = val;
        render();
        const inp = raiz.querySelector('[data-rp-campo="q"]');
        if (inp) { inp.focus(); inp.setSelectionRange(val.length, val.length); }
      }, 200);
    });
  }

  function esVisible() { return document.getElementById("reportesView")?.classList.contains("is-active"); }

  function goReportes(foco) {
    views.reportes = views.reportes || document.getElementById("reportesView");
    if (foco) { vista.abierto = foco; vista.mes = String(foco).slice(0, 7) || vista.mes; vista.sede = ""; vista.q = ""; }
    setView("reportes");
    render();
    enlazar();
    saveUiState({ activeView: "reportes" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  window.goReportes = goReportes;
  window.reportesEventos = function () {
    // Resumen para el Diario: un evento por reporte, sin el texto completo.
    return todos().map((r) => ({
      clase: "reporte",
      dia: r.fecha,
      hora: r.hora || "",
      quien: r.autor,
      id: r.id,
      titulo: `Reporte de turno · ${r.sede}${r.turno ? " · " + r.turno : ""}`,
      detalle: resumenFila(r),
    }));
  };
  window.reportesRenderSiVisible = () => { if (esVisible()) render(); };

  views.reportes = document.getElementById("reportesView");
  document.querySelector('[data-nav-view="reportes"]')?.addEventListener("click", () => goReportes());
})();
