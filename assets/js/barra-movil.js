// ============================================================================
//  BARRA INFERIOR EN EL CELULAR
// ============================================================================
//  En pantallas angostas (ver .mx-mbar en assets/css/mtto.css) los accesos más
//  usados quedan abajo, al alcance del pulgar. Cada botón pulsa el botón
//  equivalente del menú lateral, así no se duplica la navegación; "Más" abre
//  el menú completo con el resto de secciones.
// ============================================================================

(function () {
  const barra = document.getElementById("mxMbar");
  const menu = document.getElementById("sideNav");
  if (!barra || !menu) return;

  const destino = {
    home: () => menu.querySelector("[data-nav-home]"),
    registro: () => menu.querySelector('[data-nav-view="registro"]'),
    indicadores: () => menu.querySelector('[data-nav-view="indicadores"]'),
    reportes: () => menu.querySelector('[data-nav-view="reportes"]'),
  };

  barra.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mb]");
    if (!b) return;
    if (b.dataset.mb === "mas") { document.getElementById("navBurger")?.click(); return; }
    destino[b.dataset.mb]?.()?.click();
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  // El botón activo sigue a la sección visible (setView marca el menú lateral).
  function sincronizar() {
    let activo = "";
    Object.entries(destino).forEach(([k, f]) => { if (f()?.classList.contains("is-active")) activo = k; });
    barra.querySelectorAll("[data-mb]").forEach((b) => {
      const on = b.dataset.mb === activo || (b.dataset.mb === "mas" && !activo);
      b.classList.toggle("is-on", on);
      if (b.dataset.mb !== "mas") b.setAttribute("aria-current", on ? "page" : "false");
    });
  }
  new MutationObserver(sincronizar).observe(menu, { subtree: true, attributes: true, attributeFilter: ["class"] });
  sincronizar();
})();
