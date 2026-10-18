// ============================================================================
//  PESTAÑA "GEMELO 3D" DE LA FICHA
//  Solo se muestra en las máquinas con un gemelo verificado: que se parece a la
//  máquina real, sale de su propio manual y no tiene piezas flotando (auditoría
//  de contactos en 0). Hoy: Schmucker MS235 (scripts/gemelo-ms235, gemelo-ms235.html).
// ============================================================================

(function () {
  "use strict";

  // Por id o código de equipo; nunca por el nombre.
  const GEMELO_POR_ID = {
    ms235: "ms235",
    "eq-17334017": "ms235"
  };

  const GEMELOS = {
    ms235: {
      pagina: "gemelo-ms235.html",
      lamina: "gemelo-ms235-lamina.html",
      titulo: "Gemelo 3D Schmucker MS235",
      resumen: "1.846 piezas · 841 tornillos · 0 piezas flotantes · esquema eléctrico ES4220003",
      atajos: [
        ["Dosificador S4G72200210", "pieza=dosificacion&pestana=despiece"],
        ["Soldadura", "pieza=soldadura&pestana=despiece"],
        ["Corte horizontal S4A19100720", "pieza=corte&pestana=despiece"],
        ["Motor y correa S4A12100110", "pieza=motor&pestana=despiece"],
        ["Armario y cableado", "armario=1&cables=1"],
        ["Desarmar", "paso=16"]
      ]
    }
  };

  function getTwinArchetype(machine) {
    if (!machine) return null;
    if (GEMELO_POR_ID[machine.id]) return GEMELO_POR_ID[machine.id];
    if (machine.equipoCod && GEMELO_POR_ID["eq-" + machine.equipoCod]) return GEMELO_POR_ID["eq-" + machine.equipoCod];
    return null;
  }

  function hasGemelo3D(machine) {
    return !!GEMELOS[getTwinArchetype(machine)];
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  window.g3dNavMs235Iframe = function (query) {
    const iframe = document.getElementById("g3dMs235Iframe");
    const g = GEMELOS[iframe && iframe.dataset.gemelo];
    if (!iframe || !g) return;
    iframe.src = query === "lamina" ? g.lamina : `${g.pagina}?modo=3d${query ? "&" + query : ""}`;
  };

  function renderGemelo3DPanel(machine) {
    const id = getTwinArchetype(machine);
    const g = GEMELOS[id];
    if (!g) return "";
    return `
      <div class="g3d-shell" id="g3dShell" data-g3d-machine="${esc(machine.id)}">
        <div class="g3d-ms235-wrap">
          <div class="g3d-ms235-bar">
            <div class="g3d-badge-row">
              <span class="g3d-live-pill"><span class="g3d-live-dot"></span> ${esc(g.titulo)}</span>
              <span class="g3d-arch-tag">${esc(g.resumen)}</span>
            </div>
            <div class="g3d-tool-group">
              <button type="button" class="g3d-btn g3d-btn--primary" onclick="window.g3dNavMs235Iframe('')">Vista 3D completa</button>
              ${g.atajos.map(([t, q]) => `<button type="button" class="g3d-btn" onclick="window.g3dNavMs235Iframe('${q}')">${esc(t)}</button>`).join("")}
              <button type="button" class="g3d-btn" onclick="window.g3dNavMs235Iframe('lamina')">Lámina</button>
              <a class="g3d-btn g3d-btn--accent" href="${g.pagina}?modo=3d" target="_blank" rel="noopener">Pantalla completa</a>
            </div>
          </div>
          <div class="g3d-ms235-frame-box">
            <iframe id="g3dMs235Iframe" data-gemelo="${id}" src="${g.pagina}?modo=3d" title="${esc(g.titulo)}" loading="eager"></iframe>
          </div>
        </div>
      </div>
    `;
  }

  // El gemelo vive en su propia página (iframe): no hay escena que crear ni liberar aquí.
  function initGemelo3DForMachine() {}
  function disposeActiveTwin() {}

  window.g3dJumpToTab = function (tabId) {
    const btn = document.querySelector(`#guideTabs [data-profile-tab="${tabId}"]`);
    if (btn) btn.click();
  };

  window.GEMELO_3D = {
    hasGemelo3D,
    getTwinArchetype,
    renderGemelo3DPanel,
    initGemelo3DForMachine,
    disposeActiveTwin
  };
})();
