// ============================================================================
//  PRESUPUESTO DE MANTENIMIENTO POR CENTRO DE COSTO
// ============================================================================
//  El departamento maneja un monto al año y lo reparte en centros de costo
//  (S1 Mantenimiento Medicamentos, L0 Blisteado, SD Eléctrico…). Aquí se
//  configura ese reparto y se ve cuánto se ha gastado de cada uno.
//
//  De dónde sale cada gasto:
//    1. Solicitudes de almacén (DAD-010A): cada renglón de una solicitud de
//       consumo es una salida, valorizada con el precio unitario del RE356
//       (MiPortal) que había cuando se pidió. Queda en el historial solo.
//    2. Gastos anotados a mano: compras directas, servicios, ajustes.
//    3. Importados del RE355 (requisiciones del ERP) o de la plantilla Excel.
//
//  Colecciones: "presupuesto" (un documento por año con el total y el
//  reparto) y "movimientos" (los gastos anotados o importados).
//  Los precios del inventario vienen de assets/js/inventario.js.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);
  const PRES = N.coleccion("presupuesto", { prefijo: "y" });
  const MOVS = N.coleccion("movimientos", { prefijo: "m" });
  const CARGAS = N.coleccion("inventario_cargas", { prefijo: "c" });
  const CC = window.CENTROS_COSTO || { lista: [], equipos: {} };
  const CC_POR_COD = new Map(CC.lista.map((c) => [c.cod, c]));
  const TIPOS = { salida: "Salida de almacén", compra: "Compra / requisición", servicio: "Servicio", devolucion: "Devolución", ajuste: "Ajuste" };
  const ANIO_ACTUAL = Number(N.hoy().slice(0, 4));

  const vista = { anio: ANIO_ACTUAL, hoja: "", cc: "", carga: "", q: "", tipo: "", mes: "", limite: 40, imp: null };

  const nombreCC = (cod) => (CC_POR_COD.get(cod) || {}).nombre || (cod ? "Centro " + cod : "Sin centro de costo");
  const config = (anio) => PRES.get(String(anio || vista.anio));
  const precioDe = (cod) => { const a = window.INVENTARIO && window.INVENTARIO.de(cod); return a && Number(a.pu) > 0 ? Number(a.pu) : null; };

  // ------------------------------------------------------------ los gastos
  // Cada renglón de una solicitud es un movimiento. La devolución resta y el
  // traslado entre bodegas no es un gasto.
  function desdeSolicitudes() {
    const sols = window.almSolicitudes ? window.almSolicitudes() : [];
    const out = [];
    sols.forEach((s) => {
      if (!s || ["anulada", "borrador", "pedido", "atendido"].includes(s.estado) || s.tipo === "traslado") return;
      const signo = s.tipo === "devolucion" ? -1 : 1;
      (s.lineas || []).forEach((l, i) => {
        const pu = Number(l.pu) > 0 ? Number(l.pu) : precioDe(l.cod);
        const cant = Number(l.cant) || 0;
        out.push({
          id: `sol:${s.id}:${i}`, origen: "solicitud", ref: s.id,
          fecha: s.fecha || N.diaCO(s.createdAt), tipo: s.tipo === "devolucion" ? "devolucion" : "salida",
          cc: l.cc || s.cc || "", cod: l.cod, desc: l.desc || "", cant, um: l.um || "",
          pu, valor: pu ? signo * pu * cant : null, equipo: s.destino || "", por: s.solicitadoPor || s.por || "",
          estado: s.estado || "emitida", precioDe: Number(l.pu) > 0 ? "solicitud" : pu ? "inventario" : "",
        });
      });
    });
    return out;
  }
  function movimientos(anio) {
    const a = String(anio || vista.anio);
    const manuales = MOVS.lista().map((m) => ({ ...m, origen: m.origen || "manual", valor: m.valor === "" || m.valor === undefined ? null : Number(m.valor) }));
    return [...desdeSolicitudes(), ...manuales].filter((m) => String(m.fecha || "").startsWith(a));
  }
  const valorDe = (m) => (Number.isFinite(m.valor) ? m.valor : 0);

  function agregados(anio) {
    const movs = movimientos(anio);
    const cfg = config(anio);
    const porCC = new Map();
    const porMes = Array(12).fill(0);
    const porCod = new Map();
    const porEq = new Map();
    const porPersona = new Map();
    let ejecutado = 0, sinPrecio = 0, sinCC = 0;
    movs.forEach((m) => {
      const v = valorDe(m);
      ejecutado += v;
      if (!Number.isFinite(m.valor)) sinPrecio++;
      if (!m.cc) sinCC++;
      const mes = Number(String(m.fecha).slice(5, 7)) - 1;
      if (mes >= 0) porMes[mes] += v;
      const k = m.cc || "";
      if (!porCC.has(k)) porCC.set(k, { cc: k, valor: 0, n: 0 });
      porCC.get(k).valor += v; porCC.get(k).n++;
      if (m.cod) { const c = porCod.get(m.cod) || { cod: m.cod, desc: m.desc, valor: 0, cant: 0, n: 0 }; c.valor += v; c.cant += Number(m.cant) || 0; c.n++; porCod.set(m.cod, c); }
      if (m.equipo) { const e = porEq.get(m.equipo) || { eq: m.equipo, valor: 0, n: 0 }; e.valor += v; e.n++; porEq.set(m.equipo, e); }
      if (m.por) { const p = porPersona.get(m.por) || { n: m.por, valor: 0, c: 0 }; p.valor += v; p.c++; porPersona.set(m.por, p); }
    });
    const reparto = (cfg && cfg.reparto) || [];
    const filasCC = reparto.map((r) => ({ cc: r.cc, asignado: Number(r.valor) || 0, valor: (porCC.get(r.cc) || {}).valor || 0, n: (porCC.get(r.cc) || {}).n || 0 }));
    porCC.forEach((v, k) => { if (!reparto.some((r) => r.cc === k)) filasCC.push({ cc: k, asignado: 0, valor: v.valor, n: v.n, fuera: true }); });
    return { movs, ejecutado, sinPrecio, sinCC, porMes, porCod: [...porCod.values()].sort((a, b) => b.valor - a.valor), porEq: [...porEq.values()].sort((a, b) => b.valor - a.valor), porPersona: [...porPersona.values()].sort((a, b) => b.valor - a.valor), filasCC, cfg };
  }

  function fraccionAnio(anio) {
    if (anio < ANIO_ACTUAL) return 1;
    if (anio > ANIO_ACTUAL) return 0;
    const hoy = N.hoy();
    const ini = Date.parse(`${anio}-01-01T00:00:00Z`);
    const fin = Date.parse(`${anio + 1}-01-01T00:00:00Z`);
    return Math.min(1, Math.max(0, (Date.parse(hoy + "T12:00:00Z") - ini) / (fin - ini)));
  }

  // Lo que pregunta el Inicio
  function resumen() {
    const cfg = config(ANIO_ACTUAL);
    if (!cfg || !Number(cfg.total)) return null;
    const a = agregados(ANIO_ACTUAL);
    const mesActual = Number(N.hoy().slice(5, 7)) - 1;
    return { anio: ANIO_ACTUAL, total: Number(cfg.total), ejecutado: a.ejecutado, disponible: Number(cfg.total) - a.ejecutado, mes: a.porMes[mesActual], fraccionAnio: fraccionAnio(ANIO_ACTUAL) };
  }

  // Centro de costo sugerido para un equipo o destino: el que el DMM-229 le
  // asigna al activo, o el último que se usó con ese mismo destino.
  function ccSugerido(destino, codActivo) {
    if (codActivo && CC.equipos[codActivo]) return CC.equipos[codActivo];
    const d = N.plano(destino);
    if (!d) return "";
    const plan = window.EQUIPOS_PLAN ? window.EQUIPOS_PLAN.equipos : [];
    const eq = plan.find((e) => N.plano(e.n) === d || N.plano(e.c) === d);
    if (eq && CC.equipos[eq.c]) return CC.equipos[eq.c];
    const previo = [...movimientos(ANIO_ACTUAL), ...movimientos(ANIO_ACTUAL - 1)].filter((m) => m.cc && N.plano(m.equipo) === d).pop();
    return previo ? previo.cc : "";
  }

  // --------------------------------------------------------------- piezas
  const pctTono = (p, esperado) => (p > 1 ? "bad" : p > Math.max(0.9, esperado + 0.1) ? "warn" : "ok");
  const opcionesCC = (sel, soloReparto) => {
    const cfg = config();
    const rep = ((cfg && cfg.reparto) || []).map((r) => r.cc);
    const primero = rep.map((c) => CC_POR_COD.get(c) || { cod: c, nombre: nombreCC(c) });
    const resto = soloReparto ? [] : CC.lista.filter((c) => !rep.includes(c.cod)).sort((a, b) => (b.uso || 0) - (a.uso || 0) || a.cod.localeCompare(b.cod));
    return `<option value="">— Sin centro de costo —</option>${primero.length ? `<optgroup label="Del presupuesto">${primero.map((c) => `<option value="${esc(c.cod)}" ${sel === c.cod ? "selected" : ""}>${esc(c.cod)} · ${esc(c.nombre)}</option>`).join("")}</optgroup>` : ""}${resto.length ? `<optgroup label="Todos los centros">${resto.map((c) => `<option value="${esc(c.cod)}" ${sel === c.cod ? "selected" : ""}>${esc(c.cod)} · ${esc(c.nombre)}${c.uso ? ` (${c.uso})` : ""}</option>`).join("")}</optgroup>` : ""}`;
  };

  function graficaMeses(a, total) {
    const mensual = total ? total / 12 : 0;
    const max = Math.max(1, mensual * 1.15, ...a.porMes);
    const mesActual = vista.anio === ANIO_ACTUAL ? Number(N.hoy().slice(5, 7)) - 1 : -1;
    const linea = mensual ? `<div class="ux-bars__line" style="bottom:${(mensual / max) * 100}%"><span>${esc(N.fmt.dineroCorto(mensual))} / mes</span></div>` : "";
    return `<div class="ux-bars">
      <div class="ux-bars__plot" style="min-height:200px">
        <div class="ux-bars__grid"><i></i><i></i><i></i><i></i></div>
        <div style="position:absolute;inset:28px 0 0;pointer-events:none">${linea}</div>
        ${a.porMes.map((v, i) => {
          const h = Math.round((v / max) * 100);
          const cls = mensual && v > mensual ? "is-over" : i === mesActual ? "is-hi" : "";
          const ym = `${vista.anio}-${String(i + 1).padStart(2, "0")}`;
          return `<button class="ux-bar ${cls} ${vista.mes === ym ? "is-dark" : ""}" type="button" data-pp="mes" data-v="${ym}" style="--h:${h}%" aria-label="${esc(N.fmt.mes(ym))}: ${esc(N.fmt.dinero(v))}">
            <span class="ux-bar__tip">${esc(N.fmt.dineroCorto(v))}</span><i style="height:${Math.max(v ? 3 : 1, h)}%;animation-delay:${i * 30}ms"></i></button>`;
        }).join("")}
      </div>
      <div class="ux-bars__x">${N.MESES_C.map((m, i) => `<span class="${i === mesActual ? "is-hi" : ""}">${m}</span>`).join("")}</div>
    </div>`;
  }

  function filaCC(f, esperado) {
    const p = f.asignado ? f.valor / f.asignado : f.valor > 0 ? 2 : 0;
    const tono = f.asignado ? pctTono(p, esperado) : f.valor ? "bad" : "ok";
    return `<button class="pp-cc__row" type="button" data-pp="cc" data-v="${esc(f.cc)}">
      <span class="pp-cc__n"><b><span class="pp-cc__cod">${esc(f.cc || "—")}</span>${esc(nombreCC(f.cc))}</b><span>${f.n} ${f.n === 1 ? "movimiento" : "movimientos"}${f.fuera ? " · fuera del reparto" : ""}</span></span>
      <span class="ux-progress ux-progress--${tono}"><i style="width:${Math.min(100, p * 100)}%"></i></span>
      <span class="pp-cc__v">${esc(N.fmt.dineroCorto(f.valor))}<small>de ${f.asignado ? esc(N.fmt.dineroCorto(f.asignado)) : "sin asignar"}</small></span>
      <span class="pp-cc__p is-${tono}">${f.asignado ? N.fmt.pct(p) : "—"}</span>
    </button>`;
  }

  function tablaMovs(movs) {
    const q = N.plano(vista.q);
    let lista = movs.filter((m) => (!vista.tipo || m.tipo === vista.tipo) && (!vista.mes || String(m.fecha).startsWith(vista.mes)) && (!vista.cc || (m.cc || "") === vista.cc) && (!q || N.plano(`${m.cod} ${m.desc} ${m.equipo} ${m.por} ${m.cc} ${m.nota || ""}`).includes(q)));
    lista = lista.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    const total = lista.reduce((s, m) => s + valorDe(m), 0);
    return `<div class="ux-card ux-card--pad0">
      <div style="padding:16px 18px 12px" class="ux-stack">
        <div class="ux-card__head ux-card__head--tight" style="margin:0"><div><h2 class="ux-card__title">${ic("capas")}Movimientos <small>${lista.length} · ${esc(N.fmt.dinero(total))}</small></h2>
          <p class="ux-card__sub">Salidas de almacén, compras y servicios cargados al presupuesto de ${vista.anio}</p></div>
          <div class="ux-card__acts"><button class="ux-btn ux-btn--sm" type="button" data-pp="exportar">${ic("descargar")}Excel</button></div></div>
        <div class="pd-barra">
          <label class="ux-searchbox pd-buscar">${ic("buscar")}<input class="ux-input" type="search" data-pp-q value="${esc(vista.q)}" placeholder="Código, repuesto, equipo, persona…"></label>
          <select class="ux-select" style="width:auto" data-pp-f="tipo"><option value="">Todos los tipos</option>${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}" ${vista.tipo === k ? "selected" : ""}>${t}</option>`).join("")}</select>
          <select class="ux-select" style="width:auto" data-pp-f="mes"><option value="">Todo el año</option>${N.MESES.map((m, i) => { const ym = `${vista.anio}-${String(i + 1).padStart(2, "0")}`; return `<option value="${ym}" ${vista.mes === ym ? "selected" : ""}>${m}</option>`; }).join("")}</select>
          ${vista.cc || vista.mes || vista.tipo || vista.q ? `<button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-pp="limpiar">${ic("x")}Quitar filtros</button>` : ""}
        </div>
      </div>
      ${lista.length ? `<div style="overflow-x:auto;border-top:1px solid var(--line)"><table class="ux-table">
        <thead><tr><th>Fecha</th><th>Detalle</th><th>Centro</th><th>Equipo / destino</th><th>Quién</th><th class="r">Cant.</th><th class="r">Valor</th></tr></thead>
        <tbody>${lista.slice(0, vista.limite).map((m) => `<tr>
          <td class="ux-nowrap">${esc(N.fmt.corta(m.fecha))}</td>
          <td style="min-width:220px"><div class="ux-strong">${esc(m.desc || m.nota || TIPOS[m.tipo] || "—")}</div><div class="ux-small ux-mute">${m.cod ? `<span class="ux-mono">${esc(m.cod)}</span> · ` : ""}${esc(TIPOS[m.tipo] || m.tipo || "")}${m.origen === "solicitud" ? " · DAD-010A" : m.origen === "re355" ? ` · RQ ${esc(m.ref || "")}` : ""}</div></td>
          <td>${m.cc ? `<span class="pp-cc__cod" title="${esc(nombreCC(m.cc))}">${esc(m.cc)}</span>` : m.origen === "solicitud" ? `<button class="ux-pill ux-pill--warn" type="button" data-pp="asignar-sol" data-v="${esc(m.ref)}">asignar</button>` : `<button class="ux-pill ux-pill--warn" type="button" data-pp="editar" data-v="${esc(m.id)}">asignar</button>`}</td>
          <td class="ux-small">${esc(m.equipo || "—")}</td>
          <td class="ux-small">${esc(N.nombreCorto(m.por) || "—")}</td>
          <td class="r">${esc(N.fmt.num(m.cant))}</td>
          <td class="r ux-strong">${Number.isFinite(m.valor) ? esc(N.fmt.dinero(m.valor)) : m.origen === "solicitud" ? `<span class="ux-pill ux-pill--line" title="El inventario no trae precio para este código">sin precio</span>` : `<button class="ux-pill ux-pill--warn" type="button" data-pp="editar" data-v="${esc(m.id)}">poner valor</button>`}</td>
        </tr>`).join("")}</tbody></table></div>
      ${lista.length > vista.limite ? `<div style="padding:12px"><button class="ux-btn ux-btn--sm ux-btn--block" type="button" data-pp="mas">Ver ${Math.min(60, lista.length - vista.limite)} más (quedan ${lista.length - vista.limite})</button></div>` : ""}`
      : `<div class="ux-empty"><span class="ux-empty__ico">${ic("capas")}</span><h4>Sin movimientos ${vista.q || vista.mes || vista.cc || vista.tipo ? "con estos filtros" : "este año"}</h4><p>Se llenan solos con cada solicitud de almacén. También puedes anotar un gasto o importar el RE355.</p></div>`}
    </div>`;
  }

  function bloqueCargas() {
    const cargas = CARGAS.lista().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 8);
    const inv = window.INVENTARIO;
    const f = inv ? inv.frescura() : { texto: "Sin inventario" };
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("subir")}Cargas del inventario (RE356)</h2><p class="ux-card__sub">Quién subió cada reporte de almacén y qué salió entre una carga y la siguiente, valorizado.</p></div>
        <button class="ux-btn ux-btn--sm" type="button" data-pp="ir-almacen">${ic("subir")}Cargar RE356</button></div>
      <p class="ux-small" style="margin:-6px 0 12px"><span class="ux-pill ux-pill--${f.estado === "fresco" ? "ok" : "warn"}"><i></i>${esc(f.texto)}</span></p>
      ${cargas.length ? `<div class="pp-cargas">${cargas.map((c) => `<button class="pp-carga" type="button" data-pp="carga" data-v="${esc(c.id)}" style="font:inherit;text-align:left;cursor:pointer">
        <span class="ux-av ux-av--${N.tono(c.por)}">${esc(N.iniciales(c.por).toUpperCase())}</span>
        <span><b>${esc(N.fmt.fecha(N.diaCO(c.createdAt)))} · ${esc(N.horaDe(c.createdAt))}</b><small>${esc(c.por || "Alguien")} · ${esc(N.fmt.num(c.articulos))} artículos · inventario ${esc(N.fmt.dineroCorto(c.valorInventario))}</small></span>
        <span class="ux-right"><b class="ux-small">${c.salidas ? esc(N.fmt.dineroCorto(c.valorSalidas)) : "—"}</b><small>${c.salidas ? `${c.salidas} salidas` : c.primera ? "primera carga" : "sin salidas"}</small></span>
      </button>`).join("")}</div>`
      : `<div class="ux-empty" style="padding:16px"><p>Cuando alguien cargue el RE356 en Almacén quedará aquí: quién, cuándo, cuánto vale el inventario y qué salió desde la carga anterior.</p></div>`}
    </section>`;
  }

  function ranking(titulo, sub, ico, filas, etiqueta, accion) {
    const max = Math.max(1, ...filas.map((f) => Math.abs(f.valor)));
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic(ico)}${titulo}</h2><p class="ux-card__sub">${sub}</p></div></div>
      ${filas.length ? `<div class="ux-hbars">${filas.slice(0, 7).map((f, i) => `<button class="ux-hbar" type="button" ${accion ? `data-pp="${accion}" data-v="${esc(f.k)}"` : ""}>
        <span class="ux-hbar__t" title="${esc(f.t)}">${esc(f.t)}</span><span class="ux-hbar__v">${esc(N.fmt.dineroCorto(f.valor))} <small>${esc(f.s || "")}</small></span>
        <span class="ux-progress ${i === 0 ? "" : "ux-progress--dark"}"><i style="width:${Math.max(3, Math.round((Math.abs(f.valor) / max) * 100))}%"></i></span></button>`).join("")}</div>`
      : `<div class="ux-empty" style="padding:16px"><p>${etiqueta}</p></div>`}
    </section>`;
  }

  // --------------------------------------------------------------- vista
  function render() {
    const raiz = document.getElementById("presupuestoRoot");
    if (!raiz) return;
    const foco = document.activeElement && document.activeElement.matches("[data-pp-q]");
    const a = agregados(vista.anio);
    const cfg = a.cfg;
    const total = cfg ? Number(cfg.total) || 0 : 0;
    const esperado = fraccionAnio(vista.anio);
    const pct = total ? a.ejecutado / total : 0;
    const proyeccion = esperado > 0.02 ? a.ejecutado / esperado : null;
    const repartido = cfg ? (cfg.reparto || []).reduce((s, r) => s + (Number(r.valor) || 0), 0) : 0;
    const anios = [...new Set([ANIO_ACTUAL - 1, ANIO_ACTUAL, ANIO_ACTUAL + 1, ...PRES.lista().map((d) => Number(d.anio || d.id))])].filter(Boolean).sort();
    const mesActual = Number(N.hoy().slice(5, 7)) - 1;

    const cabecera = `<div class="ux-head">
      <div class="ux-head__txt">
        <p class="ux-eyebrow">${ic("presupuesto")}Almacén y costos</p>
        <h1 class="ux-title">Presupuesto de mantenimiento</h1>
      </div>
      <div class="ux-head__acts">
        <select class="ux-select" style="width:auto;min-height:40px" data-pp-anio aria-label="Año">${anios.map((y) => `<option value="${y}" ${y === vista.anio ? "selected" : ""}>${y}</option>`).join("")}</select>
        <button class="ux-btn" type="button" data-pp="importar">${ic("subir")}Importar</button>
        <button class="ux-btn" type="button" data-pp="configurar">${ic("ajustes")}Configurar</button>
        <button class="ux-btn ux-btn--primary" type="button" data-pp="gasto">${ic("mas")}Anotar gasto</button>
      </div>
    </div>`;

    if (!cfg || !total) {
      raiz.innerHTML = `<div class="ux-page ux-seq">${cabecera}
        <section class="ux-card" style="padding:28px">
          <div class="ux-grid ux-grid--main-r" style="align-items:center">
            <div class="ux-stack">
              <span class="ux-pill ux-pill--acc" style="width:fit-content">${ic("info")}Primera vez</span>
              <h2 style="margin:0;font-size:22px;letter-spacing:-0.02em">Configura el presupuesto de ${vista.anio} en tres pasos</h2>
              <ol class="aj-steps">
                <li><b>El monto total</b> que maneja el departamento este año.</li>
                <li><b>El reparto por centro de costo</b>: se proponen los que mantenimiento más usa en las requisiciones (S1, L0, R7, SD…).</li>
                <li><b>Listo</b>: cada solicitud de almacén se descuenta sola con su centro de costo. Puedes importar el RE355 para traer lo que ya se gastó.</li>
              </ol>
              <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="ux-btn ux-btn--primary ux-btn--lg" type="button" data-pp="configurar">${ic("presupuesto")}Configurar presupuesto</button><button class="ux-btn ux-btn--lg" type="button" data-pp="importar">${ic("subir")}Importar gastos primero</button></div>
            </div>
            <div class="ux-stack">
              ${a.movs.length ? `<div class="ux-note ux-note--acc">${ic("info")}<span>Ya hay <b>${a.movs.length}</b> movimientos de ${vista.anio} por <b>${esc(N.fmt.dinero(a.ejecutado))}</b>. Se descontarán en cuanto pongas el monto.</span></div>` : ""}
              <div class="ux-card ux-card--well">
                <p class="ux-card__title" style="margin-bottom:4px">${ic("capas")}Dónde carga mantenimiento sus requisiciones</p>
                <p class="ux-card__sub" style="margin-bottom:14px">Líneas del RE355 desde 2025, por centro de costo. Es la base para proponer el reparto.</p>
                <div class="ux-hbars">${(() => { const top = CC.lista.filter((c) => c.uso && c.tipo !== "proyecto").sort((x, y) => y.uso - x.uso).slice(0, 8); const mx = Math.max(1, ...top.map((c) => c.uso)); return top.map((c, i) => `<div class="ux-hbar"><span class="ux-hbar__t"><span class="pp-cc__cod">${esc(c.cod)}</span>${esc(c.nombre)}</span><span class="ux-hbar__v">${c.uso} <small>líneas</small></span><span class="ux-progress ${i ? "ux-progress--dark" : ""}"><i style="width:${Math.round((c.uso / mx) * 100)}%"></i></span></div>`).join(""); })()}</div>
              </div>
            </div>
          </div>
        </section>
        ${a.movs.length ? tablaMovs(a.movs) : ""}
        ${bloqueCargas()}
      </div><div id="ppHoja"></div>`;
      pintarHoja();
      window.SHELL?.animarNumeros(raiz);
      return;
    }

    const filasCC = a.filasCC.sort((x, y) => (y.asignado ? y.valor / y.asignado : 9) - (x.asignado ? x.valor / x.asignado : 9));
    const tonoProy = proyeccion == null ? "line" : proyeccion > total * 1.02 ? "bad" : proyeccion > total * 0.95 ? "warn" : "ok";
    raiz.innerHTML = `<div class="ux-page ux-seq">
      ${cabecera}
      <div class="pp-hero">
        <section class="pp-total">
          <div class="pp-total__top"><span class="pp-total__label">Ejecutado en ${vista.anio}</span><span class="ux-pill" style="background:rgba(255,255,255,.12);color:#fff">${N.fmt.pct(pct, 1)} del presupuesto</span></div>
          <p class="pp-total__n"><span data-n="${Math.round(a.ejecutado)}" data-pre="$ ">${esc(N.fmt.dinero(a.ejecutado))}</span> <small>de ${esc(N.fmt.dinero(total))}</small></p>
          <div class="pp-total__marca" style="--esp:${Math.round(esperado * 100)}%"><div class="ux-progress"><i style="width:${Math.min(100, pct * 100)}%"></i></div></div>
          <div class="pp-total__leg">
            <div><span>Disponible</span><b>${esc(N.fmt.dineroCorto(total - a.ejecutado))}</b></div>
            <div><span>Lo esperado a hoy <i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#fbbf24"></i></span><b>${esc(N.fmt.dineroCorto(total * esperado))}</b></div>
            <div><span>Este mes</span><b>${esc(N.fmt.dineroCorto(vista.anio === ANIO_ACTUAL ? a.porMes[mesActual] : 0))}</b></div>
          </div>
        </section>
        <div class="ux-grid ux-grid--2">
          <div class="ux-kpi ux-kpi--${tonoProy === "bad" ? "bad" : tonoProy === "warn" ? "warn" : "ok"}">
            <span class="ux-kpi__top"><span class="ux-kpi__label"><span class="ux-kpi__ico">${ic("tendencia")}</span>Si sigue este ritmo</span></span>
            <span class="ux-kpi__n" style="font-size:26px">${proyeccion == null ? "—" : esc(N.fmt.dineroCorto(proyeccion))}</span>
            <span class="ux-kpi__foot">${proyeccion == null ? "Aún es pronto para proyectar" : `cierra el año en ${N.fmt.pct(proyeccion / total)} del presupuesto`}</span>
          </div>
          <div class="ux-kpi ux-kpi--${repartido > total ? "bad" : repartido < total ? "warn" : "ok"}">
            <span class="ux-kpi__top"><span class="ux-kpi__label"><span class="ux-kpi__ico">${ic("capas")}</span>Repartido</span><button class="ux-link" type="button" data-pp="configurar">Ajustar</button></span>
            <span class="ux-kpi__n" style="font-size:26px">${N.fmt.pct(total ? repartido / total : 0)}</span>
            <span class="ux-kpi__foot">${repartido === total ? "Todo el monto está asignado" : repartido > total ? `Se asignó ${esc(N.fmt.dineroCorto(repartido - total))} de más` : `Quedan ${esc(N.fmt.dineroCorto(total - repartido))} sin repartir`} · ${(cfg.reparto || []).length} centros</span>
          </div>
          <button class="ux-kpi ux-kpi--${a.sinCC ? "warn" : "ok"}" type="button" data-pp="filtro-sincc">
            <span class="ux-kpi__top"><span class="ux-kpi__label"><span class="ux-kpi__ico">${ic("alerta")}</span>Sin centro de costo</span><span class="ux-kpi__go">${ic("filtro", "ic--sm")}</span></span>
            <span class="ux-kpi__n" style="font-size:26px">${a.sinCC}</span>
            <span class="ux-kpi__foot">${a.sinCC ? "Movimientos por asignar: no descuentan de ningún centro" : "Todo tiene su centro de costo"}</span>
          </button>
          <div class="ux-kpi ux-kpi--${a.sinPrecio ? "warn" : "ok"}">
            <span class="ux-kpi__top"><span class="ux-kpi__label"><span class="ux-kpi__ico">${ic("dinero")}</span>Sin precio</span></span>
            <span class="ux-kpi__n" style="font-size:26px">${a.sinPrecio}</span>
            <span class="ux-kpi__foot">${a.sinPrecio ? "El RE356 no trae precio para esos códigos (servicios u obra)" : "Todo está valorizado"}</span>
          </div>
        </div>
      </div>

      <div class="ux-grid ux-grid--main">
        <section class="ux-card">
          <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("grafica")}Gasto por mes</h2><p class="ux-card__sub">La línea es el presupuesto mensual (total ÷ 12). En rojo, los meses que lo pasaron. Toca un mes para filtrar los movimientos.</p></div>
            ${vista.mes ? `<button class="ux-btn ux-btn--sm" type="button" data-pp="mes" data-v="">Todo el año</button>` : ""}</div>
          ${graficaMeses(a, total)}
        </section>
        ${ranking("Lo que más cuesta", "Repuestos y servicios con más valor en el año", "repuesto", a.porCod.map((c) => ({ k: c.cod, t: c.desc || c.cod, valor: c.valor, s: `${N.fmt.num(c.cant)} u` })), "Todavía no hay repuestos valorizados.", "cod")}
      </div>

      <section class="ux-card">
        <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("capas")}Centros de costo <small>${filasCC.length}</small></h2><p class="ux-card__sub">Cuánto se ha gastado de lo asignado a cada uno. Verde: dentro de lo esperado · ámbar: cerca del límite · rojo: se pasó.</p></div>
          <button class="ux-btn ux-btn--sm" type="button" data-pp="configurar">${ic("editar")}Editar reparto</button></div>
        <div class="pp-cc__head"><span>Centro de costo</span><span>Avance</span><span>Gastado</span><span>%</span></div>
        <div class="pp-cc">${filasCC.map((f) => filaCC(f, esperado)).join("")}</div>
      </section>

      <div class="ux-grid ux-grid--3">
        ${ranking("Por equipo o destino", "Dónde se va el gasto", "fabrica", a.porEq.map((e) => ({ k: e.eq, t: e.eq, valor: e.valor, s: `${e.n} mov.` })), "Las solicitudes con destino aparecerán aquí.", "eq")}
        ${ranking("Por persona", "Quién pide o registra", "usuario", a.porPersona.map((p) => ({ k: p.n, t: p.n, valor: p.valor, s: `${p.c} mov.` })), "Aún no hay movimientos con nombre.", "persona")}
        ${bloqueCargas()}
      </div>

      ${tablaMovs(a.movs)}
    </div><div id="ppHoja"></div>`;
    pintarHoja();
    window.SHELL?.animarNumeros(raiz);
    if (foco) { const q = raiz.querySelector("[data-pp-q]"); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
  }

  // ---------------------------------------------------------------- hojas
  function hoja(titulo, sub, cuerpo, pie, ancha) {
    return `<div class="ux-backdrop" data-pp="cerrar"></div>
      <aside class="ux-sheet ${ancha ? "ux-sheet--wide" : ""}" role="dialog" aria-label="${esc(titulo)}">
        <header class="ux-sheet__head"><div><h3>${titulo}</h3>${sub ? `<p>${sub}</p>` : ""}</div><button class="ux-x" type="button" data-pp="cerrar" aria-label="Cerrar">${ic("x")}</button></header>
        <div class="ux-sheet__body">${cuerpo}</div>
        ${pie ? `<footer class="ux-sheet__foot">${pie}</footer>` : ""}
      </aside>`;
  }

  let borradorCfg = null;
  function hojaConfigurar() {
    const cfg = config() || {};
    if (!borradorCfg) {
      let reparto = (cfg.reparto || []).map((r) => ({ ...r }));
      if (!reparto.length) reparto = CC.lista.filter((c) => (c.uso || 0) >= 20 && c.tipo !== "proyecto").sort((a, b) => b.uso - a.uso).map((c) => ({ cc: c.cod, valor: 0 }));
      borradorCfg = { total: Number(cfg.total) || 0, reparto, notas: cfg.notas || "", q: "" };
    }
    const b = borradorCfg;
    const suma = b.reparto.reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const resta = b.total - suma;
    const sug = b.q.trim().length >= 1 ? CC.lista.filter((c) => !b.reparto.some((r) => r.cc === c.cod) && N.plano(`${c.cod} ${c.nombre}`).includes(N.plano(b.q))).slice(0, 12) : [];
    const cuerpo = `<form class="ux-form" data-pp-form="cfg" onsubmit="return false">
      <label class="ux-field"><span>Monto total de ${vista.anio}</span>
        <input class="ux-input" inputmode="numeric" data-pp-total value="${b.total ? esc(N.fmt.num(b.total)) : ""}" placeholder="Ej. 850.000.000" style="font-size:20px;font-weight:600;min-height:52px">
        <small>En pesos, sin decimales. Se reparte abajo por centro de costo.</small></label>
      <div class="ux-note ${resta < 0 ? "ux-note--bad" : resta > 0 ? "ux-note--warn" : "ux-note--ok"}">${ic(resta === 0 ? "check" : "info")}<span>${b.total ? (resta === 0 ? "Todo el monto quedó repartido." : resta > 0 ? `Quedan <b>${esc(N.fmt.dinero(resta))}</b> sin repartir.` : `Te pasaste por <b>${esc(N.fmt.dinero(-resta))}</b>.`) : "Escribe el monto total para ver cuánto falta por repartir."}</span></div>
      <div class="ux-field"><span>Reparto por centro de costo</span>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
          <button class="ux-btn ux-btn--sm" type="button" data-pp="cfg-igual">Repartir en partes iguales</button>
          <button class="ux-btn ux-btn--sm" type="button" data-pp="cfg-uso">Según las requisiciones de 2025–2026</button>
          <button class="ux-btn ux-btn--sm" type="button" data-pp="cfg-gasto">Según lo gastado el año anterior</button>
        </div>
        <div class="pp-dist">${b.reparto.map((r, i) => `<div class="pp-dist__row">
          <b title="${esc(nombreCC(r.cc))}"><span class="pp-cc__cod">${esc(r.cc)}</span>${esc(nombreCC(r.cc))}</b>
          <input class="ux-input" inputmode="numeric" data-pp-rep="${i}" value="${Number(r.valor) ? esc(N.fmt.num(r.valor)) : ""}" placeholder="0">
          <span class="pp-dist__pct">${b.total ? N.fmt.pct((Number(r.valor) || 0) / b.total, 1) : "—"}</span>
          <button class="ux-x" type="button" data-pp="cfg-quitar" data-v="${i}" aria-label="Quitar ${esc(r.cc)}" style="width:30px;height:30px">${ic("x", "ic--sm")}</button>
        </div>`).join("") || `<p class="ux-small ux-mute">Agrega centros de costo con el buscador de abajo.</p>`}</div>
      </div>
      <div class="ux-field"><span>Agregar un centro de costo</span>
        <label class="ux-searchbox">${ic("buscar")}<input class="ux-input" data-pp-ccq value="${esc(b.q)}" placeholder="Código o nombre: S1, blisteado, eléctrico…" autocomplete="off"></label>
        ${sug.length ? `<div class="pp-sug">${sug.map((c) => `<button type="button" data-pp="cfg-agregar" data-v="${esc(c.cod)}"><span class="pp-cc__cod">${esc(c.cod)}</span>${esc(c.nombre)}${c.uso ? `<span class="ux-small ux-mute" style="margin-left:auto">${c.uso} req.</span>` : ""}</button>`).join("")}</div>` : ""}
      </div>
      <label class="ux-field"><span>Notas</span><textarea class="ux-textarea" data-pp-notas rows="2" placeholder="De dónde sale el monto, aprobaciones, cambios…">${esc(b.notas)}</textarea></label>
    </form>`;
    const pie = `<span class="ux-mute">${cfg.updatedAt ? `Última edición ${esc(N.fmt.relativo(cfg.updatedAt))}${cfg.por ? " · " + esc(cfg.por) : ""}` : "Aún sin guardar"}</span>
      <button class="ux-btn" type="button" data-pp="cerrar">Cancelar</button><button class="ux-btn ux-btn--primary" type="button" data-pp="cfg-guardar">Guardar presupuesto</button>`;
    return hoja(`Presupuesto ${vista.anio}`, "El monto del año y cuánto le toca a cada centro de costo.", cuerpo, pie, true);
  }

  function hojaGasto(m) {
    const e = m || { fecha: N.hoy(), tipo: "compra", cant: 1 };
    const cuerpo = `<form class="ux-form" data-pp-form="gasto">
      <input type="hidden" name="id" value="${esc(e.id || "")}">
      <div class="ux-row2">
        <label class="ux-field"><span>Fecha</span><input class="ux-input" type="date" name="fecha" value="${esc(e.fecha)}" required></label>
        <label class="ux-field"><span>Tipo</span><select class="ux-select" name="tipo">${Object.entries(TIPOS).map(([k, t]) => `<option value="${k}" ${e.tipo === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      </div>
      <label class="ux-field"><span>Centro de costo</span><select class="ux-select" name="cc">${opcionesCC(e.cc || "")}</select></label>
      <label class="ux-field"><span>Qué se compró o se sacó *</span><input class="ux-input" name="desc" value="${esc(e.desc || "")}" required placeholder="Ej. Rodamiento 6204 2RS, servicio de rebobinado…"></label>
      <div class="ux-row3">
        <label class="ux-field"><span>Código</span><input class="ux-input ux-mono" name="cod" value="${esc(e.cod || "")}" placeholder="Opcional" data-pp-cod></label>
        <label class="ux-field"><span>Cantidad</span><input class="ux-input" type="number" step="any" min="0" name="cant" value="${esc(e.cant ?? 1)}"></label>
        <label class="ux-field"><span>Valor unitario</span><input class="ux-input" inputmode="numeric" name="pu" value="${e.pu ? esc(N.fmt.num(e.pu)) : ""}" placeholder="$"></label>
      </div>
      <p class="ux-small ux-mute" data-pp-precio style="margin:-6px 0 0"></p>
      <label class="ux-field"><span>Valor total</span><input class="ux-input" inputmode="numeric" name="valor" value="${Number.isFinite(Number(e.valor)) && e.valor !== null && e.valor !== "" ? esc(N.fmt.num(e.valor)) : ""}" placeholder="Se calcula con cantidad × valor unitario" style="font-weight:600"></label>
      <div class="ux-row2">
        <label class="ux-field"><span>Equipo o destino</span><input class="ux-input" name="equipo" value="${esc(e.equipo || "")}" list="ppDestinos" placeholder="Ej. Blister 3"></label>
        <label class="ux-field"><span>Requisición / OC</span><input class="ux-input" name="ref" value="${esc(e.ref || "")}" placeholder="Opcional"></label>
      </div>
      <datalist id="ppDestinos">${[...new Set(((window.MTTO && window.MTTO.catalogo.equipos) || []).map((x) => x.eq))].map((x) => `<option value="${esc(x)}">`).join("")}</datalist>
      <label class="ux-field"><span>Nota</span><textarea class="ux-textarea" name="nota" rows="2">${esc(e.nota || "")}</textarea></label>
    </form>`;
    const pie = `${e.id ? `<button class="ux-btn ux-btn--danger" type="button" data-pp="gasto-borrar" data-v="${esc(e.id)}">${ic("basura")}Quitar</button>` : `<span class="ux-mute">Queda a nombre de ${esc(N.usuario.get() || "quien use este equipo")}</span>`}
      <button class="ux-btn" type="button" data-pp="cerrar">Cancelar</button><button class="ux-btn ux-btn--primary" type="button" data-pp="gasto-guardar">${e.id ? "Guardar cambios" : "Anotar gasto"}</button>`;
    return hoja(e.id ? "Editar gasto" : "Anotar un gasto", "Compras directas, servicios o salidas que no pasaron por una solicitud de la app.", cuerpo, pie);
  }

  function hojaCC(cod) {
    const a = agregados(vista.anio);
    const f = a.filasCC.find((x) => x.cc === cod) || { cc: cod, asignado: 0, valor: 0, n: 0 };
    const movs = a.movs.filter((m) => (m.cc || "") === cod).sort((x, y) => String(y.fecha).localeCompare(String(x.fecha)));
    const porMes = Array(12).fill(0);
    movs.forEach((m) => { const i = Number(String(m.fecha).slice(5, 7)) - 1; if (i >= 0) porMes[i] += valorDe(m); });
    const max = Math.max(1, ...porMes);
    const p = f.asignado ? f.valor / f.asignado : 0;
    const cuerpo = `<div class="ux-stack">
      <div class="ux-grid ux-grid--3">
        <div class="ux-kpi"><span class="ux-kpi__label">Asignado</span><span class="ux-kpi__n" style="font-size:22px">${esc(N.fmt.dineroCorto(f.asignado))}</span></div>
        <div class="ux-kpi"><span class="ux-kpi__label">Gastado</span><span class="ux-kpi__n" style="font-size:22px">${esc(N.fmt.dineroCorto(f.valor))}</span><span class="ux-kpi__foot">${f.asignado ? N.fmt.pct(p) : "sin asignación"}</span></div>
        <div class="ux-kpi"><span class="ux-kpi__label">Disponible</span><span class="ux-kpi__n" style="font-size:22px">${esc(N.fmt.dineroCorto(f.asignado - f.valor))}</span></div>
      </div>
      <div class="ux-bars" style="min-height:130px"><div class="ux-bars__plot" style="min-height:110px"><div class="ux-bars__grid"><i></i><i></i><i></i></div>${porMes.map((v, i) => `<span class="ux-bar ${v ? "is-hi" : ""}" style="--h:${Math.round((v / max) * 100)}%"><span class="ux-bar__tip">${esc(N.fmt.dineroCorto(v))}</span><i style="height:${Math.max(1, Math.round((v / max) * 100))}%"></i></span>`).join("")}</div><div class="ux-bars__x">${N.MESES_C.map((m) => `<span>${m}</span>`).join("")}</div></div>
      <div class="ux-tablewrap"><table class="ux-table"><thead><tr><th>Fecha</th><th>Detalle</th><th>Equipo</th><th class="r">Valor</th></tr></thead><tbody>
        ${movs.slice(0, 80).map((m) => `<tr><td class="ux-nowrap">${esc(N.fmt.corta(m.fecha))}</td><td><div class="ux-strong">${esc(m.desc || m.nota || "—")}</div><div class="ux-small ux-mute">${esc(TIPOS[m.tipo] || "")}${m.cod ? " · " + esc(m.cod) : ""}${m.por ? " · " + esc(N.nombreCorto(m.por)) : ""}</div></td><td class="ux-small">${esc(m.equipo || "—")}</td><td class="r ux-strong">${Number.isFinite(m.valor) ? esc(N.fmt.dinero(m.valor)) : "—"}</td></tr>`).join("") || `<tr><td colspan="4" class="ux-mute">Sin movimientos en ${vista.anio}.</td></tr>`}
      </tbody></table></div>
    </div>`;
    const pie = `<button class="ux-btn" type="button" data-pp="filtro-cc" data-v="${esc(cod)}">${ic("filtro")}Ver en la tabla</button><button class="ux-btn ux-btn--primary" type="button" data-pp="gasto-cc" data-v="${esc(cod)}">${ic("mas")}Anotar gasto aquí</button>`;
    return hoja(`<span class="pp-cc__cod">${esc(cod || "—")}</span>${esc(nombreCC(cod))}`, `${f.n} movimientos en ${vista.anio}`, cuerpo, pie, true);
  }

  function hojaCarga(id) {
    const c = CARGAS.get(id);
    if (!c) return "";
    const lista = c.detalle || [];
    const cuerpo = `<div class="ux-stack">
      <div class="ux-grid ux-grid--3">
        <div class="ux-kpi"><span class="ux-kpi__label">Artículos</span><span class="ux-kpi__n" style="font-size:22px">${esc(N.fmt.num(c.articulos))}</span><span class="ux-kpi__foot">${esc(c.archivo || c.origen || "")}</span></div>
        <div class="ux-kpi"><span class="ux-kpi__label">Valor del inventario</span><span class="ux-kpi__n" style="font-size:22px">${esc(N.fmt.dineroCorto(c.valorInventario))}</span><span class="ux-kpi__foot">Piezas del plan: ${esc(N.fmt.dineroCorto(c.valorPlan))}</span></div>
        <div class="ux-kpi"><span class="ux-kpi__label">Salió desde la carga anterior</span><span class="ux-kpi__n" style="font-size:22px">${esc(N.fmt.dineroCorto(c.valorSalidas))}</span><span class="ux-kpi__foot">${c.salidas || 0} códigos bajaron · ${c.entradas || 0} subieron</span></div>
      </div>
      ${c.primera ? `<p class="ux-note">${ic("info")}<span>Es la primera carga registrada: a partir de la siguiente se verá qué salió entre una y otra.</span></p>` : ""}
      ${lista.length ? `<div class="ux-tablewrap"><table class="ux-table"><thead><tr><th>Código</th><th>Descripción</th><th class="r">Antes</th><th class="r">Ahora</th><th class="r">Salió</th><th class="r">Valor</th></tr></thead><tbody>
        ${lista.map((d) => `<tr><td class="ux-mono ux-small">${esc(d.cod)}</td><td>${esc(d.desc || "")}${d.plan ? ` <span class="ux-pill ux-pill--acc">plan</span>` : ""}</td><td class="r">${esc(N.fmt.num(d.antes))}</td><td class="r">${esc(N.fmt.num(d.ahora))}</td><td class="r ux-strong">${esc(N.fmt.num(d.dif))}</td><td class="r">${esc(N.fmt.dinero(d.valor))}</td></tr>`).join("")}
      </tbody></table></div>` : ""}
    </div>`;
    return hoja(`Carga del ${esc(N.fmt.fecha(N.diaCO(c.createdAt)))}`, `${esc(c.por || "Alguien")} · ${esc(N.horaDe(c.createdAt))}`, cuerpo, `<button class="ux-btn" type="button" data-pp="cerrar">Cerrar</button>`, true);
  }

  // ------------------------------------------------------- importar
  function hojaImportar() {
    const imp = vista.imp;
    let cuerpo;
    if (!imp || !imp.filas) {
      cuerpo = `<div class="ux-stack">
        <div class="ux-note ux-note--acc">${ic("info")}<span>Sirve para traer lo que ya se gastó: el <b>RE355</b> de requisiciones del ERP (el mismo <i>Requisiciones.xls</i>) o la <b>plantilla</b> de gastos. Se lee en este equipo; solo se guardan las líneas que elijas.</span></div>
        <label class="ux-card ux-card--well" style="display:grid;place-items:center;gap:8px;padding:32px;border-style:dashed;cursor:pointer;text-align:center">
          <span class="ux-empty__ico">${ic("subir")}</span><b>Elegir el archivo Excel</b><span class="ux-small ux-mute">RE355 (.xls / .xlsx) o la plantilla de gastos</span>
          <input type="file" accept=".xls,.xlsx,.csv" data-pp-archivo hidden>
        </label>
        ${imp && imp.trabajando ? `<p class="ux-note">${ic("reloj")}<span>${esc(imp.trabajando)}</span></p>` : ""}
        ${imp && imp.error ? `<p class="ux-note ux-note--bad">${ic("alerta")}<span>${esc(imp.error)}</span></p>` : ""}
        <button class="ux-btn" type="button" data-pp="plantilla">${ic("descargar")}Descargar la plantilla de gastos</button>
      </div>`;
      return hoja("Importar gastos", "Requisiciones del ERP o la plantilla de Excel", cuerpo, `<button class="ux-btn" type="button" data-pp="cerrar">Cancelar</button>`);
    }
    const usuarios = imp.usuarios;
    const sel = filasImport();
    const valor = sel.reduce((s, f) => s + (Number.isFinite(f.valor) ? f.valor : 0), 0);
    const conPrecio = sel.filter((f) => Number.isFinite(f.valor)).length;
    cuerpo = `<div class="ux-stack">
      <p class="ux-note ux-note--ok">${ic("check")}<span>Leí <b>${esc(N.fmt.num(imp.filas.length))}</b> líneas de <b>${esc(imp.archivo)}</b> (${imp.tipo === "re355" ? "RE355 de requisiciones" : "plantilla de gastos"}), del ${esc(N.fmt.corta(imp.desde))} al ${esc(N.fmt.corta(imp.hasta))}.</span></p>
      <div class="ux-row2">
        <label class="ux-field"><span>Año</span><select class="ux-select" data-pp-imp="anio">${imp.anios.map((y) => `<option ${String(imp.anio) === String(y) ? "selected" : ""}>${y}</option>`).join("")}</select></label>
        <label class="ux-field"><span>Centros de costo</span><select class="ux-select" data-pp-imp="soloRep"><option value="1" ${imp.soloRep ? "selected" : ""}>Solo los del reparto</option><option value="0" ${!imp.soloRep ? "selected" : ""}>Todos</option></select></label>
      </div>
      ${usuarios.length > 1 ? `<div class="ux-field"><span>Usuarios que hicieron la requisición</span><div class="ux-chips">${usuarios.slice(0, 40).map((u) => `<button type="button" class="ux-chip ${imp.usar.has(u.u) ? "is-on" : ""}" data-pp="imp-usuario" data-v="${esc(u.u)}">${esc(u.u)} <span class="ux-count">${u.n}</span></button>`).join("")}</div><small class="ux-small ux-mute">Vienen marcados los de mantenimiento. Toca para incluir o quitar.</small></div>` : ""}
      <div class="ux-grid ux-grid--3">
        <div class="ux-kpi"><span class="ux-kpi__label">Líneas a importar</span><span class="ux-kpi__n" style="font-size:24px">${esc(N.fmt.num(sel.length))}</span></div>
        <div class="ux-kpi"><span class="ux-kpi__label">Con precio</span><span class="ux-kpi__n" style="font-size:24px">${esc(N.fmt.num(conPrecio))}</span><span class="ux-kpi__foot">Precio del RE356 cargado</span></div>
        <div class="ux-kpi"><span class="ux-kpi__label">Valor estimado</span><span class="ux-kpi__n" style="font-size:24px">${esc(N.fmt.dineroCorto(valor))}</span></div>
      </div>
      ${imp.tipo === "re355" ? `<p class="ux-small ux-mute">El RE355 no trae precios: cada línea se valoriza con el precio unitario del inventario (RE356). Las que no tienen precio (servicios, obra) quedan marcadas para poner el valor a mano.</p>` : ""}
    </div>`;
    const pie = `<button class="ux-btn" type="button" data-pp="imp-otro">Otro archivo</button><button class="ux-btn ux-btn--primary" type="button" data-pp="imp-guardar" ${sel.length ? "" : "disabled"}>Importar ${esc(N.fmt.num(sel.length))} líneas</button>`;
    return hoja("Importar gastos", `${esc(imp.archivo)}`, cuerpo, pie, true);
  }

  function filasImport() {
    const imp = vista.imp;
    if (!imp || !imp.filas) return [];
    const cfg = config(imp.anio);
    const rep = new Set(((cfg && cfg.reparto) || []).map((r) => r.cc));
    return imp.filas.filter((f) => String(f.fecha).startsWith(String(imp.anio)) && (!imp.usuarios.length || imp.usar.has(f.usuario || "")) && (!imp.soloRep || !rep.size || rep.has(f.cc)));
  }

  async function leerImport(archivo) {
    vista.imp = { trabajando: `Leyendo ${archivo.name}…` };
    pintarHoja();
    try {
      const X = await N.XLSX();
      const libro = X.read(await archivo.arrayBuffer(), { type: "array", cellDates: false });
      const hojaX = libro.Sheets[libro.SheetNames[0]];
      const filas = X.utils.sheet_to_json(hojaX, { header: 1, raw: true, defval: "" });
      const normT = (v) => N.plano(v).toUpperCase();
      let cab = filas.findIndex((r) => r.some((c) => normT(c) === "CODIGO") && r.some((c) => normT(c).includes("CENTRO DE COSTO")));
      let tipo = "re355";
      if (cab < 0) { cab = filas.findIndex((r) => r.some((c) => normT(c) === "FECHA") && r.some((c) => normT(c).includes("CENTRO"))); tipo = "plantilla"; }
      if (cab < 0) throw new Error("No reconozco el archivo: no encuentro las columnas CODIGO y CENTRO DE COSTO (RE355) ni Fecha y Centro de costo (plantilla).");
      const h = filas[cab].map(normT);
      const col = (...nombres) => h.findIndex((x) => nombres.some((n) => x === n || x.startsWith(n)));
      const fechaDe = (v) => {
        if (typeof v === "number" && v > 19000000) { const s = String(Math.round(v)); return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`; }
        if (typeof v === "number") { const d = new Date(Math.round((v - 25569) * 864e5)); return d.toISOString().slice(0, 10); }
        const s = String(v || "").trim();
        let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0];
        m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
        m = s.match(/^(\d{4})(\d{2})(\d{2})$/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
        return "";
      };
      const numero = (v) => { if (typeof v === "number") return v; const s = String(v || "").replace(/[$\s]/g, ""); if (!s) return NaN; return Number(s.includes(",") && s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "")); };
      const out = [];
      if (tipo === "re355") {
        const c = { cod: col("CODIGO"), desc: col("DESCRIPCION"), fecha: col("FEC PEDIDO"), req: col("NO. REQUISICION", "NO REQUISICION"), reqd: col("REQUERIDO"), ord: col("ORDENADO"), um: col("U/M"), usr: col("USUARIO"), cc: col("CENTRO DE COSTO"), oc: col("ORD COMPRA"), lin: col("LINEA"), est: col("ESTADO LINEA") };
        filas.slice(cab + 1).forEach((r) => {
          const cod = String(r[c.cod] ?? "").trim();
          const fecha = fechaDe(r[c.fecha]);
          if (!cod || !fecha) return;
          const cant = numero(r[c.ord]) || numero(r[c.reqd]) || 0;
          const pu = precioDe(cod);
          const ccTxt = String(r[c.cc] || "");
          const cc = ccTxt.split(" - ")[0].trim();
          out.push({
            id: `rq-${String(r[c.req]).trim()}-${String(r[c.lin]).trim()}-${cod}`,
            fecha, tipo: /^51/.test(cod) ? "servicio" : "compra", origen: "re355", ref: String(r[c.req] || "").trim(),
            cc, cod, desc: String(r[c.desc] || "").trim(), cant, um: String(r[c.um] || "").trim(),
            pu, valor: pu ? pu * cant : null, usuario: String(r[c.usr] || "").trim(), por: String(r[c.usr] || "").trim(),
            nota: `${r[c.oc] ? "OC " + r[c.oc] : ""}${r[c.est] ? " · " + r[c.est] : ""}`.trim(), equipo: ccTxt.split(" - ").slice(1).join(" - ").trim(),
          });
        });
      } else {
        const c = { fecha: col("FECHA"), tipo: col("TIPO"), cc: col("CENTRO"), cod: col("CODIGO"), desc: col("DESCRIPCION"), cant: col("CANTIDAD"), pu: col("VALOR UNITARIO"), valor: col("VALOR TOTAL"), eq: col("EQUIPO"), por: col("SOLICITO", "QUIEN"), nota: col("NOTA") };
        filas.slice(cab + 1).forEach((r, i) => {
          const fecha = fechaDe(r[c.fecha]);
          const desc = String(r[c.desc] ?? "").trim();
          if (!fecha || !desc) return;
          const cant = numero(r[c.cant]) || 1;
          const pu = numero(r[c.pu]);
          let valor = numero(r[c.valor]);
          if (!Number.isFinite(valor) && Number.isFinite(pu)) valor = pu * cant;
          const t = N.plano(r[c.tipo]);
          out.push({
            id: `pl-${fecha}-${i}-${N.plano(desc).slice(0, 20).replace(/\W+/g, "")}`,
            fecha, tipo: t.startsWith("serv") ? "servicio" : t.startsWith("sal") ? "salida" : t.startsWith("dev") ? "devolucion" : t.startsWith("aj") ? "ajuste" : "compra", origen: "plantilla",
            cc: String(r[c.cc] || "").split(" - ")[0].split("·")[0].trim(), cod: String(r[c.cod] ?? "").trim(), desc, cant, pu: Number.isFinite(pu) ? pu : null, valor: Number.isFinite(valor) ? valor : null,
            equipo: String(r[c.eq] || "").trim(), por: String(r[c.por] || "").trim(), nota: String(r[c.nota] || "").trim(),
          });
        });
      }
      if (!out.length) throw new Error("El archivo no trae líneas con fecha y código.");
      const fechas = out.map((f) => f.fecha).sort();
      const anios = [...new Set(fechas.map((f) => f.slice(0, 4)))].sort().reverse();
      const cuenta = new Map();
      out.forEach((f) => cuenta.set(f.usuario || "", (cuenta.get(f.usuario || "") || 0) + 1));
      const usuarios = tipo === "re355" ? [...cuenta.entries()].filter(([u]) => u).map(([u, n]) => ({ u, n })).sort((a, b) => b.n - a.n) : [];
      // Usuarios de mantenimiento: los que más cargan a centros del reparto o a S1
      const cfg = config();
      const rep = new Set(((cfg && cfg.reparto) || []).map((r) => r.cc).concat(["S1", "SD", "SC", "SA"]));
      const usar = new Set(usuarios.filter((u) => {
        const suyas = out.filter((f) => f.usuario === u.u);
        return suyas.filter((f) => rep.has(f.cc)).length / suyas.length >= 0.3 && suyas.length >= 5;
      }).map((u) => u.u));
      vista.imp = { archivo: archivo.name, tipo, filas: out, desde: fechas[0], hasta: fechas[fechas.length - 1], anios, anio: anios.includes(String(vista.anio)) ? String(vista.anio) : anios[0], usuarios, usar, soloRep: !!(cfg && (cfg.reparto || []).length) };
    } catch (e) {
      vista.imp = { error: e.message || String(e) };
    }
    pintarHoja();
  }

  async function descargarPlantilla() {
    const X = await N.XLSX();
    const filas = [
      ["Fecha", "Tipo", "Centro de costo", "Código", "Descripción", "Cantidad", "Valor unitario", "Valor total", "Equipo o destino", "Solicitó", "Nota"],
      [N.hoy(), "Compra", "S1", "741901076", "Rodamiento de bola ref 6004 2RS", 4, 18500, "", "Blister 3", N.usuario.get() || "", "Ejemplo: borra esta fila"],
      [N.hoy(), "Servicio", "SD", "", "Rebobinado motor 5 HP", 1, "", 950000, "Marzio 5", "", ""],
    ];
    const ws = X.utils.aoa_to_sheet(filas);
    ws["!cols"] = [12, 12, 16, 14, 40, 10, 14, 14, 20, 18, 30].map((w) => ({ wch: w }));
    const cc = X.utils.aoa_to_sheet([["Código", "Centro de costo", "Líneas de requisición desde 2025"], ...CC.lista.map((c) => [c.cod, c.nombre, c.uso || ""])]);
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, ws, "Gastos");
    X.utils.book_append_sheet(wb, cc, "Centros de costo");
    X.writeFile(wb, "Plantilla gastos de mantenimiento.xlsx");
  }

  async function exportar() {
    const X = await N.XLSX();
    const a = agregados(vista.anio);
    const filas = [["Fecha", "Tipo", "Origen", "Centro de costo", "Nombre del centro", "Código", "Descripción", "Cantidad", "U/M", "Valor unitario", "Valor", "Equipo o destino", "Quién", "Referencia", "Nota"]];
    a.movs.sort((x, y) => String(x.fecha).localeCompare(String(y.fecha))).forEach((m) => filas.push([m.fecha, TIPOS[m.tipo] || m.tipo, m.origen, m.cc || "", nombreCC(m.cc), m.cod || "", m.desc || "", m.cant, m.um || "", m.pu || "", Number.isFinite(m.valor) ? m.valor : "", m.equipo || "", m.por || "", m.ref || "", m.nota || ""]));
    const res = [["Centro de costo", "Nombre", "Asignado", "Gastado", "Disponible", "% usado"], ...a.filasCC.map((f) => [f.cc, nombreCC(f.cc), f.asignado, f.valor, f.asignado - f.valor, f.asignado ? f.valor / f.asignado : ""])];
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(res), "Por centro de costo");
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(filas), "Movimientos");
    X.writeFile(wb, `Presupuesto mantenimiento ${vista.anio}.xlsx`);
  }

  function pintarHoja() {
    const h = document.getElementById("ppHoja");
    if (!h) return;
    let html = "";
    if (vista.hoja === "configurar") html = hojaConfigurar();
    else if (vista.hoja === "gasto") html = hojaGasto(vista.editando);
    else if (vista.hoja === "cc") html = hojaCC(vista.cc);
    else if (vista.hoja === "carga") html = hojaCarga(vista.carga);
    else if (vista.hoja === "importar") html = hojaImportar();
    h.innerHTML = html;
    document.body.classList.toggle("mx-lock", !!html);
  }
  function cerrarHoja() { vista.hoja = ""; vista.editando = null; borradorCfg = null; pintarHoja(); }

  const aNumero = (s) => { const n = Number(String(s || "").replace(/[^\d,-]/g, "").replace(/,/g, ".")); return Number.isFinite(n) ? Math.round(n) : 0; };

  function enlazar() {
    const raiz = document.getElementById("presupuestoRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.parentElement.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pp]");
      if (!b) return;
      const a = b.dataset.pp;
      const v = b.dataset.v;
      if (a === "cerrar") cerrarHoja();
      else if (a === "configurar") { vista.hoja = "configurar"; borradorCfg = null; pintarHoja(); }
      else if (a === "gasto") { vista.hoja = "gasto"; vista.editando = null; pintarHoja(); }
      else if (a === "gasto-cc") { vista.hoja = "gasto"; vista.editando = { fecha: N.hoy(), tipo: "compra", cant: 1, cc: v }; pintarHoja(); }
      else if (a === "editar") { const m = MOVS.get(v); if (m) { vista.hoja = "gasto"; vista.editando = { ...m }; pintarHoja(); } }
      else if (a === "importar") { vista.hoja = "importar"; vista.imp = null; pintarHoja(); }
      else if (a === "imp-otro") { vista.imp = null; pintarHoja(); }
      else if (a === "plantilla") descargarPlantilla().catch((er) => window.SHELL?.toast(esc(er.message), { tipo: "bad" }));
      else if (a === "exportar") exportar().catch((er) => window.SHELL?.toast(esc(er.message), { tipo: "bad" }));
      else if (a === "cc") { vista.hoja = "cc"; vista.cc = v; pintarHoja(); }
      else if (a === "carga") { vista.hoja = "carga"; vista.carga = v; pintarHoja(); }
      else if (a === "mes") { vista.mes = vista.mes === v ? "" : v; vista.limite = 40; render(); }
      else if (a === "filtro-cc") { vista.cc = v; vista.hoja = ""; render(); document.querySelector("[data-pp-q]")?.scrollIntoView({ block: "center" }); }
      else if (a === "filtro-sincc") { vista.cc = ""; vista.q = ""; vista.tipo = ""; render(); window.SHELL?.toast("Busca los que dicen «asignar» en la columna Centro"); document.querySelector("[data-pp-q]")?.scrollIntoView({ block: "center" }); }
      else if (a === "limpiar") { vista.cc = ""; vista.mes = ""; vista.tipo = ""; vista.q = ""; render(); }
      else if (a === "mas") { vista.limite += 60; render(); }
      else if (a === "cod") { vista.q = v; render(); document.querySelector("[data-pp-q]")?.scrollIntoView({ block: "center" }); }
      else if (a === "eq" || a === "persona") { vista.q = v; render(); document.querySelector("[data-pp-q]")?.scrollIntoView({ block: "center" }); }
      else if (a === "ir-almacen") window.goAlmacen?.();
      else if (a === "asignar-sol") window.goAlmacen?.({ solicitud: v });
      // configuración
      else if (a === "cfg-quitar") { borradorCfg.reparto.splice(Number(v), 1); pintarHoja(); }
      else if (a === "cfg-agregar") { borradorCfg.reparto.push({ cc: v, valor: 0 }); borradorCfg.q = ""; pintarHoja(); document.querySelector("[data-pp-ccq]")?.focus(); }
      else if (a === "cfg-igual" || a === "cfg-uso" || a === "cfg-gasto") {
        const b2 = borradorCfg;
        if (!b2.total) { window.SHELL?.toast("Primero escribe el monto total", { tipo: "warn" }); return; }
        let pesos = b2.reparto.map(() => 1);
        if (a === "cfg-uso") pesos = b2.reparto.map((r) => (CC_POR_COD.get(r.cc) || {}).uso || 0);
        if (a === "cfg-gasto") { const prev = agregados(vista.anio - 1); pesos = b2.reparto.map((r) => Math.max(0, ((prev.filasCC.find((f) => f.cc === r.cc) || {}).valor) || 0)); }
        const s = pesos.reduce((x, y) => x + y, 0);
        if (!s) { window.SHELL?.toast(a === "cfg-gasto" ? `No hay gastos de ${vista.anio - 1} para repartir` : "Sin datos para repartir", { tipo: "warn" }); return; }
        let acum = 0;
        b2.reparto.forEach((r, i) => { r.valor = i === b2.reparto.length - 1 ? b2.total - acum : Math.round((b2.total * pesos[i]) / s / 1000) * 1000; acum += r.valor; });
        pintarHoja();
      }
      else if (a === "cfg-guardar") {
        const b2 = borradorCfg;
        if (!b2.total) { window.SHELL?.toast("Escribe el monto total", { tipo: "warn" }); return; }
        PRES.guardar({ id: String(vista.anio), anio: vista.anio, total: b2.total, reparto: b2.reparto.filter((r) => r.cc).map((r) => ({ cc: r.cc, valor: Number(r.valor) || 0 })), notas: b2.notas, moneda: "COP" });
        window.SHELL?.toast(`Presupuesto ${vista.anio} guardado`);
        cerrarHoja();
        render();
        N.emitir("presupuesto");
      }
      // gasto
      else if (a === "gasto-guardar") {
        const f = document.querySelector('[data-pp-form="gasto"]');
        if (!f.reportValidity()) return;
        const d = Object.fromEntries(new FormData(f).entries());
        const cant = Number(d.cant) || 0;
        const pu = aNumero(d.pu) || null;
        let valor = d.valor ? aNumero(d.valor) : pu ? pu * cant : null;
        if (d.tipo === "devolucion" && valor > 0) valor = -valor;
        const previo = d.id ? MOVS.get(d.id) || {} : {};
        MOVS.guardar({ ...previo, id: d.id || undefined, fecha: d.fecha, tipo: d.tipo, origen: previo.origen || "manual", cc: d.cc, desc: d.desc.trim(), cod: d.cod.trim(), cant, pu, valor, equipo: d.equipo.trim(), ref: d.ref.trim(), nota: d.nota.trim() });
        window.SHELL?.toast(d.id ? "Gasto actualizado" : "Gasto anotado");
        cerrarHoja();
        render();
        N.emitir("presupuesto");
      }
      else if (a === "gasto-borrar") { if (confirm("¿Quitar este gasto del presupuesto?")) { MOVS.borrar(v); cerrarHoja(); render(); N.emitir("presupuesto"); } }
      // importación
      else if (a === "imp-usuario") { const s = vista.imp.usar; s.has(v) ? s.delete(v) : s.add(v); pintarHoja(); }
      else if (a === "imp-guardar") {
        const sel = filasImport();
        if (!sel.length) return;
        MOVS.guardarVarios(sel.map((f) => ({ ...f }))).then(() => { window.SHELL?.toast(`Importadas ${N.fmt.num(sel.length)} líneas`); N.emitir("presupuesto"); });
        cerrarHoja();
        render();
      }
    });
    raiz.parentElement.addEventListener("input", (e) => {
      const t = e.target;
      if (t.matches("[data-pp-q]")) { vista.q = t.value; vista.limite = 40; clearTimeout(raiz._t); raiz._t = setTimeout(render, 180); }
      else if (t.matches("[data-pp-total]")) { borradorCfg.total = aNumero(t.value); clearTimeout(raiz._t2); raiz._t2 = setTimeout(() => { const pos = t.selectionStart; pintarHoja(); const n = document.querySelector("[data-pp-total]"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (er) {} } }, 500); }
      else if (t.matches("[data-pp-rep]")) { borradorCfg.reparto[Number(t.dataset.ppRep)].valor = aNumero(t.value); }
      else if (t.matches("[data-pp-ccq]")) { borradorCfg.q = t.value; clearTimeout(raiz._t3); raiz._t3 = setTimeout(() => { pintarHoja(); const n = document.querySelector("[data-pp-ccq]"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 200); }
      else if (t.matches("[data-pp-notas]")) { borradorCfg.notas = t.value; }
      else if (t.matches("[data-pp-cod]")) {
        const pu = precioDe(t.value.trim());
        const a = window.INVENTARIO && window.INVENTARIO.de(t.value.trim());
        const p = document.querySelector("[data-pp-precio]");
        const f = t.form;
        if (a) {
          if (p) p.textContent = `${a.desc || ""} · existencia ${N.fmt.num(a.exist)}${pu ? " · precio del inventario " + N.fmt.dinero(pu) : ""}`;
          if (pu && f && !f.elements.pu.value) f.elements.pu.value = N.fmt.num(pu);
          if (f && !f.elements.desc.value && a.desc) f.elements.desc.value = a.desc;
        } else if (p) p.textContent = "";
      }
    });
    raiz.parentElement.addEventListener("focusout", (e) => { if (e.target.matches("[data-pp-rep]")) pintarHoja(); });
    raiz.parentElement.addEventListener("change", (e) => {
      const t = e.target;
      if (t.matches("[data-pp-anio]")) { vista.anio = Number(t.value); vista.mes = ""; render(); }
      else if (t.matches("[data-pp-f]")) { vista[t.dataset.ppF] = t.value; vista.limite = 40; render(); }
      else if (t.matches("[data-pp-archivo]")) { const f = t.files && t.files[0]; if (f) leerImport(f); }
      else if (t.matches("[data-pp-imp]")) { const k = t.dataset.ppImp; vista.imp[k] = k === "soloRep" ? t.value === "1" : t.value; pintarHoja(); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && esVisible() && vista.hoja) cerrarHoja(); });
  }

  function esVisible() { return document.getElementById("presupuestoView")?.classList.contains("is-active"); }
  let t = null;
  const repintar = () => { if (!esVisible() || vista.hoja) return; clearTimeout(t); t = setTimeout(render, 200); };
  PRES.alCambiar(() => { repintar(); N.emitir("presupuesto"); });
  MOVS.alCambiar(() => { repintar(); N.emitir("presupuesto"); });
  CARGAS.alCambiar(repintar);
  N.on("pendientes", repintar); // las solicitudes cambian con los pendientes

  function goPresupuesto(op) {
    views.presupuesto = views.presupuesto || document.getElementById("presupuestoView");
    setView("presupuesto");
    render();
    enlazar();
    if (op && op.configurar) { vista.hoja = "configurar"; borradorCfg = null; pintarHoja(); }
    if (op && op.gasto) { vista.hoja = "gasto"; vista.editando = null; pintarHoja(); }
    saveUiState({ activeView: "presupuesto" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  // Lo que usa Almacén al registrar una carga del RE356
  function registrarCarga(c) { return CARGAS.guardar(c); }
  function ultimaCarga() { return CARGAS.lista().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null; }

  // Los movimientos pueden ser cientos: se leen de la nube solo cuando se abre
  // Presupuesto o Almacén (cada lectura cuenta en el plan de Firebase). El
  // Inicio usa la última copia que quedó en este navegador.
  let conDatos = false;
  function asegurarDatos() {
    if (conDatos) return;
    conDatos = true;
    MOVS.suscribir();
    CARGAS.suscribir();
  }

  window.goPresupuesto = (op) => { asegurarDatos(); goPresupuesto(op); };
  window.PRESUPUESTO = { resumen, agregados, movimientos, config, nombreCC, ccSugerido, opcionesCC, precioDe, registrarCarga: (c) => { asegurarDatos(); return registrarCarga(c); }, ultimaCarga, asegurarDatos, TIPOS };
  views.presupuesto = document.getElementById("presupuestoView");
  PRES.suscribir();
})();
