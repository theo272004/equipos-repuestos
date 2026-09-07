// ======================================================================
//  CATALOGO DE ALMACEN
//
//  Hasta ahora la aplicacion solo conocia los 423 codigos que cuelgan de una
//  maquina en el plan. El extracto del portal (RE356) trae 5.145, asi que
//  4.986 de ellos no se podian ni buscar: si necesitabas un rodamiento 6202 y
//  no estaba en el plan de tu maquina, no habia forma de dar con su codigo.
//
//  Esta vista es ese buscador. Dice de cada cosa su codigo, la descripcion
//  oficial de almacen, cuanta habia, en que estante, la unidad, el precio y
//  cuantos dias tarda en llegar si hay que pedirla.
//
//  Dos cosas se repiten a proposito en la interfaz, porque cambian como hay
//  que leer lo que sale:
//   - Es un EXTRACTO. Que un codigo no aparezca aqui NO quiere decir que no
//     exista; quiere decir que no venia en este archivo.
//   - No trae fecha de corte. La existencia se muestra como "lo que decia el
//     portal", nunca como el stock de hoy.
// ======================================================================

const almVista = { q: "", fam: "", soloPlan: false, soloStock: false, limite: 60 };

function almDatos() { return window.ALMACEN || null; }

// El catalogo se guarda como filas para que pese menos; esto le vuelve a poner
// nombre a cada columna, una sola vez, la primera que se usa.
let _almItems = null;
function almItems() {
  const A = almDatos();
  if (!A) return [];
  if (!_almItems) {
    const i = Object.fromEntries(A.cols.map((c, n) => [c, n]));
    _almItems = A.items.map((r) => ({
      c: r[i.c], d: r[i.d], um: r[i.um], ex: r[i.ex], ubi: r[i.ubi] || [],
      f: A.familias[r[i.f]], pr: r[i.pr], min: r[i.min], dias: r[i.dias],
      cons: r[i.cons], enPlan: !!r[i.p]
    }));
  }
  return _almItems;
}

function almBuscar(cod) {
  return almItems().find((x) => x.c === String(cod || "").trim()) || null;
}

function almFiltradas() {
  const tokens = planTokens(almVista.q);
  return almItems().filter((x) => {
    if (almVista.fam && x.f !== almVista.fam) return false;
    if (almVista.soloPlan && !x.enPlan) return false;
    if (almVista.soloStock && !x.ex) return false;
    if (!tokens.length) return true;
    const hay = planPlain(x.c + " " + x.d + " " + x.ubi.join(" "));
    return tokens.every((t) => hay.includes(t));
  });
}

function almRenderIfVisible() {
  if (document.getElementById("almView")?.classList.contains("is-active")) renderAlmacen();
}

function goAlmacen() {
  setView("alm");
  renderAlmacen();
  saveUiState({ activeView: "alm" });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderAlmacen() {
  const root = document.getElementById("almRoot");
  const A = almDatos();
  if (!root) return;
  if (!A) {
    root.innerHTML = '<div class="pl-empty"><h3>El catálogo todavía no ha cargado</h3><p>Es un archivo grande y se descarga aparte. Espera un momento y vuelve a entrar.</p></div>';
    return;
  }
  const todas = almItems();
  const lista = almFiltradas();
  const mostrar = lista.slice(0, almVista.limite);
  const conStock = todas.filter((x) => x.ex).length;

  root.innerHTML = `
    <div class="section-bar">
      <div>
        <p class="eyebrow">Mantenimiento</p>
        <h2>Catálogo de almacén</h2>
      </div>
      <div class="section-actions">
        <span class="counter">${todas.length.toLocaleString("es-CO")} códigos &middot; ${A.enPlan} los usa nuestro plan</span>
        <a class="button button--light" href="${A.archivo.split("/").map(encodeURIComponent).join("/")}" target="_blank" rel="noopener">Descargar el extracto</a>
      </div>
    </div>
    <p class="pl-note">${planEsc(A.doc)}. Sirve para <strong>encontrar el código</strong> de algo que necesitas, aunque no cuelgue
      de ninguna máquina: de los ${todas.length.toLocaleString("es-CO")} códigos, solo <strong>${A.enPlan}</strong> están en nuestro plan de repuestos.</p>
    <p class="pl-note" style="border-left-color:#a3211d">
      <strong>Dos avisos.</strong> Es un <strong>extracto</strong>: que algo no aparezca aquí no quiere decir que no exista, sino que no venía en este archivo
      &mdash; de los ${A.delPlan} códigos que usa nuestro plan solo vienen ${A.enPlan}.
      Y el archivo <strong>no trae fecha de corte</strong>, así que la existencia es <em>lo que decía el portal</em>, no el stock de hoy: confírmalo antes de contar con una pieza.</p>

    <div class="pl-kpis">
      <div class="info-card"><span class="pl-kpi__n">${todas.length.toLocaleString("es-CO")}</span><span>Códigos en el extracto</span></div>
      <div class="info-card"><span class="pl-kpi__n">${conStock.toLocaleString("es-CO")}</span><span>Con existencia según el portal</span></div>
      <div class="info-card"><span class="pl-kpi__n">${A.enPlan}</span><span>Que usa nuestro plan</span></div>
      <div class="info-card"><span class="pl-kpi__n" style="color:#a3211d">${A.descuadres.length}</span><span>Con existencia distinta a la del plan</span></div>
    </div>

    <div class="tk-filters">
      <input type="search" id="almSearch" placeholder="Busca por código o descripción: rodamiento 6202, correa t5, contactor&hellip;"
        value="${planEsc(almVista.q)}" oninput="almSetFiltro('q', this.value)" aria-label="Buscar en el catálogo de almacén">
      <button class="pl-chk${almVista.soloPlan ? " is-on" : ""}" type="button"
        onclick="almSetFiltro('soloPlan', ${!almVista.soloPlan})">Solo lo de nuestro plan</button>
      <button class="pl-chk${almVista.soloStock ? " is-on" : ""}" type="button"
        onclick="almSetFiltro('soloStock', ${!almVista.soloStock})">Solo con existencia</button>
    </div>

    <div class="pl-filters" role="tablist" aria-label="Familia">
      <button class="pl-chk${almVista.fam ? "" : " is-on"}" type="button" onclick="almSetFiltro('fam','')">Todas las familias</button>
      ${A.familias.map((f) => {
        const n = todas.filter((x) => x.f === f).length;
        return `<button class="pl-chk${almVista.fam === f ? " is-on" : ""}" type="button" onclick="almSetFiltro('fam', ${JSON.stringify(f).replace(/"/g, "&quot;")})">
          ${planEsc(f)} <span class="pl-tag pl-tag--n">${n}</span></button>`;
      }).join("")}
    </div>

    <p class="pl-soft">${lista.length.toLocaleString("es-CO")} ${lista.length === 1 ? "resultado" : "resultados"}${lista.length > mostrar.length ? ` &middot; mostrando ${mostrar.length}` : ""}</p>

    ${mostrar.length ? `
      <div class="pl-tablewrap">
        <table class="pl-table alm-table">
          <thead><tr>
            <th>Código</th><th>Descripción</th><th>Familia</th>
            <th class="pl-num">Existencia</th><th>Dónde está</th><th class="pl-num">Días para pedir</th><th class="pl-num">Precio</th>
          </tr></thead>
          <tbody>${mostrar.map((x) => almFilaHtml(x, planTokens(almVista.q))).join("")}</tbody>
        </table>
      </div>
      ${lista.length > mostrar.length ? `<button class="pl-more" type="button" onclick="almMas()">Ver 60 más</button>` : ""}`
    : '<div class="pl-empty"><h3>Nada coincide</h3><p>Prueba con otra palabra, o quita los filtros. Recuerda que esto es un extracto: puede que exista y no venga aquí.</p></div>'}`;
}

function almFilaHtml(x, tokens) {
  const desc = (almDatos().descuadres || []).includes(x.c);
  return `<tr>
    <td class="pl-code">${planMark(x.c, tokens)}${x.enPlan ? '<span class="pl-tag pl-tag--ok" title="Este código ya está en el plan de alguna máquina">en el plan</span>' : ""}</td>
    <td class="pl-desc">${planMark(x.d, tokens)}${x.um ? `<span class="pl-obs">${planEsc(x.um)}</span>` : ""}</td>
    <td class="pl-soft">${planEsc(x.f)}</td>
    <td class="pl-num">${x.ex ? `<strong>${x.ex.toLocaleString("es-CO")}</strong>` : '<span class="pl-soft">0</span>'}${
      desc ? '<span class="pl-tag pl-tag--warn" title="El plan de la máquina dice otra cantidad. Confírmalo en el portal.">no cuadra</span>' : ""}</td>
    <td class="pl-soft">${x.ubi.length ? planMark(x.ubi.join(" · "), tokens) : "&mdash;"}</td>
    <td class="pl-num">${x.dias ? x.dias : "&mdash;"}</td>
    <td class="pl-num">${x.pr ? "$" + x.pr.toLocaleString("es-CO") : "&mdash;"}</td>
  </tr>`;
}

function almSetFiltro(k, v) {
  almVista[k] = v;
  almVista.limite = 60;
  renderAlmacen();
  if (k === "q") {
    const i = document.getElementById("almSearch");
    if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }
}
function almMas() { almVista.limite += 60; renderAlmacen(); }
