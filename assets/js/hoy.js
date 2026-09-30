// ============================================================================
//  INICIO: ASÍ VA EL DÍA
// ============================================================================
//  La primera pantalla. Responde lo que hay que hacer al llegar, no lo que va
//  pasando en el día (eso está en Turno → Calendario y Registro):
//    - ¿Qué es urgente? Máquinas con fallas repetidas y pendientes de prioridad alta.
//    - ¿Qué mantenimiento toca? Piezas que ya toca cambiar, piezas que pidió una
//      inspección (y si hay en almacén o hay que pedirlas) y tareas del día.
//    - ¿Qué falta en el almacén? Pedidos, solicitudes sin entregar, piezas bajo
//      el mínimo, inventario por actualizar.
//    - ¿Quién está de turno y cómo están los equipos?
//  Todo lleva a su sección con el filtro ya puesto.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);
  const vista = { dia: "", sede: "", quien: false };

  const S = () => window.MTTO_STORE;

  // ¿Llegó el reporte de un turno? Se busca en el chat importado, en el
  // formulario de turno y en lo registrado a mano en el Registro diario.
  function reporteDe(fecha, turno, sede) {
    const desde = turno === "Día" ? `${fecha} 17:00` : `${N.sumaDias(fecha, 1)} 05:00`;
    const hasta = turno === "Día" ? `${N.sumaDias(fecha, 1)} 04:59` : `${N.sumaDias(fecha, 1)} 13:00`;
    const enRango = (f, h) => `${f} ${h || "00:00"}` >= desde && `${f} ${h || "00:00"}` <= hasta;
    const chat = (window.REPORTES_TURNO || []).filter((r) => r.sede === sede && enRango(r.fecha, r.hora));
    if (chat.length) { const r = chat[chat.length - 1]; return { ok: true, via: "chat", hora: r.hora, autor: r.autor, id: r.id }; }
    const form = (window.REPORTES_FORM ? window.REPORTES_FORM.lista() : []).filter((r) => r.sede === sede && r.fecha === fecha && r.turno === turno);
    if (form.length) return { ok: true, via: "formulario", hora: N.horaDe(form[0].createdAt), autor: form[0].por };
    // Novedades de esa sede escritas en la ventana del reporte (las del chat
    // llevan la hora del mensaje) o registradas a mano para ese turno.
    const siguiente = N.sumaDias(fecha, 1);
    const reg = S() ? S().registros().filter((r) => r.s === sede && !r.borrado && (
      (r.src === "chat" && enRango(r.f, r.hr)) ||
      (r.src !== "chat" && r.t === turno && (r.f === fecha || (turno === "Noche" && r.f === siguiente))))) : [];
    if (reg.length) {
      const r = reg[reg.length - 1];
      return { ok: true, via: "registro", hora: r.src === "chat" ? r.hr : N.horaDe(r.createdAt), autor: r.tec || r.por, fecha: r.f };
    }
    return { ok: false };
  }

  // Máquinas paradas por una falla: la última novedad de máquina de los últimos
  // tres días las dejó "Pendiente" y nadie ha anotado después que quedaron operativas.
  function paradasPorFalla() {
    if (!S()) return [];
    const hoy = N.hoy();
    const desde = N.sumaDias(hoy, -3);
    const ultima = new Map();
    S().registros().filter((r) => r && !r.borrado && r.f >= desde && r.cat === "Máquina" && !/no identificado|sin especificar/i.test(r.eq) && (!vista.sede || r.s === vista.sede))
      .sort((a, b) => (a.f + (a.hr || a.hi || "")).localeCompare(b.f + (b.hr || b.hi || "")))
      .forEach((r) => ultima.set(`${r.s}|${r.eq}`, r));
    return [...ultima.values()].filter((r) => r.ef === "Pendiente").sort((a, b) => (b.f + (b.hr || "")).localeCompare(a.f + (a.hr || "")));
  }

  function saludo() {
    const n = N.usuario.get();
    const primer = n ? n.split(/\s+/)[0] : "";
    return `${N.saludo()}${primer ? ", " + esc(primer) : ""}`;
  }

  // ----------------------------------------------------------------- piezas
  // Una cifra de la franja de arriba: nombre, número y una línea de detalle
  function kpi({ n, dec = 0, unidad = "", titulo, pie, tono = "", go, goQ }) {
    const val = Number(n) || 0;
    return `<button class="hy-stat ${tono}" type="button" ${go ? `data-hy="${go}"` : ""} ${goQ ? `data-q="${esc(goQ)}"` : ""}>
      <span class="hy-stat__t">${titulo}</span>
      <b class="hy-stat__n"><span data-n="${val}" data-dec="${dec}">${val.toLocaleString("es-CO", { maximumFractionDigits: dec, minimumFractionDigits: dec })}</span>${unidad ? `<small>${unidad}</small>` : ""}</b>
      <span class="hy-stat__s">${pie}</span>
    </button>`;
  }

  function tarjetaTurno() {
    const T = window.TURNOS;
    const t = N.turnoEnCurso();
    const quienes = T ? T.quienes(t.fecha, t.clave) : {};
    const bloque = (k, sede) => {
      const g = (quienes[k] && quienes[k].gente) || [];
      return `<div class="hy-sede">
        <div class="hy-sede__top"><b>${esc(quienes[k] ? quienes[k].sede : sede)}</b>
          <span class="ux-avs">${g.slice(0, 5).map((p) => `<span class="ux-av ux-av--${N.tono(p.nombre)}" title="${esc(p.nombre)}${p.fijo ? " · turno fijo" : ""}">${esc(N.iniciales(p.nombre).toUpperCase())}</span>`).join("")}</span></div>
        <p class="ux-small ux-mute" style="margin:2px 0 0">${g.length ? g.map((p) => esc(p.nombre.split(" ").slice(0, 2).join(" "))).join(", ") : "Sin personal en el cuadro"}</p>
      </div>`;
    };
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic(t.turno === "Día" ? "sol" : "luna")}En turno ahora</h2><p class="ux-card__sub">Turno de ${t.turno === "Día" ? "día · 8:00 a 20:00" : "noche · 20:00 a 8:00"}</p></div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="turnos">Cuadro ${ic("der", "ic--sm")}</button></div>
      <div class="ux-stack" style="gap:14px">${bloque("sede4", "Sede 4")}<hr class="ux-divider">${bloque("sede2", "Sede 2")}</div>
    </section>`;
  }


  function tarjetaFallas() {
    const hasta = N.hoy();
    const desde = N.sumaDias(hasta, -6);
    const regs = S() ? S().registros().filter((r) => r.f >= desde && r.f <= hasta && r.cat === "Máquina" && r.tp === "Correctivo" && !/no identificado|sin especificar/i.test(r.eq) && (!vista.sede || r.s === vista.sede)) : [];
    const m = new Map();
    regs.forEach((r) => m.set(r.eq, (m.get(r.eq) || 0) + 1));
    const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...top.map((x) => x[1]));
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("falla")}Más fallas esta semana</h2><p class="ux-card__sub">Correctivos de máquina, últimos 7 días</p></div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="indicadores">Indicadores ${ic("der", "ic--sm")}</button></div>
      ${top.length ? `<div class="ux-hbars">${top.map(([eq, n], i) => `<button class="ux-hbar" type="button" data-hy="eq" data-v="${esc(eq)}"><span class="ux-hbar__t">${esc(eq)}</span><span class="ux-hbar__v">${n} <small>${n === 1 ? "falla" : "fallas"}</small></span><span class="ux-progress ${i === 0 ? "ux-progress--bad" : "ux-progress--dark"}"><i style="width:${Math.round((n / max) * 100)}%"></i></span></button>`).join("")}</div>`
        : `<div class="ux-empty"><h4>Sin correctivos de máquina</h4><p>No hay fallas de máquina registradas en los últimos 7 días.</p></div>`}
    </section>`;
  }

  // ---------------------------------------------------------------- agenda
  // Lo que hay que hacer o revisar hoy, sacado de lo que la app ya sabe:
  // fallas que se repiten, pendientes urgentes, piezas que ya toca cambiar,
  // piezas que una inspección pidió (y si hay en almacén), tareas del día y
  // lo que falta en el almacén. Cada cosa lleva a donde se resuelve.
  const planEq = (cod) => ((window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || []).find((e) => e.c === cod || e.id === cod);
  const nombreEq = (cod) => { const e = planEq(cod); return e ? e.n : cod; };
  function existencia(cod) {
    const inv = window.INVENTARIO;
    if (!cod || !inv || !inv.cargado) return null;
    const a = inv.de(inv.norm(cod));
    return a ? Number(a.exist) || 0 : 0;
  }
  const hayTxt = (n) => (n === null ? "" : n > 0 ? `hay ${N.fmt.num(n)} en almacén` : "no hay en almacén");

  function agenda() {
    const hoy = N.hoy();
    const grupos = { urgente: [], mtto: [], almacen: [] };
    const S_ = S();
    // 0. Máquinas que siguen paradas por una falla
    paradasPorFalla().forEach((r) => grupos.urgente.push({
      tono: "bad", ico: "llave", t: `${r.eq} parada por falla${r.frep ? " · falta repuesto" : ""}`,
      s: `Desde el ${N.fmt.corta(r.f)}${r.hr ? " " + r.hr : ""} · ${String(r.de || "").replace(/\s+/g, " ").slice(0, 90)}`, acc: "Ver", hy: "reg", id: r.id,
    }));
    // 1. Máquinas con fallas repetidas en la semana
    if (S_) {
      const desde = N.sumaDias(hoy, -6);
      const m = new Map();
      S_.registros().filter((r) => r && !r.borrado && r.f >= desde && r.f <= hoy && r.cat === "Máquina" && r.tp === "Correctivo" && !/no identificado|sin especificar/i.test(r.eq) && (!vista.sede || r.s === vista.sede))
        .forEach((r) => { const x = m.get(r.eq) || { n: 0, ult: r }; x.n++; if ((r.f + (r.hr || "")) > (x.ult.f + (x.ult.hr || ""))) x.ult = r; m.set(r.eq, x); });
      [...m.entries()].filter(([, x]) => x.n >= 3).sort((a, b) => b[1].n - a[1].n).slice(0, 4).forEach(([eq, x]) => grupos.urgente.push({
        tono: "bad", ico: "falla", t: `${eq}: ${x.n} fallas en 7 días`, s: `Revisar la causa · la última: ${String(x.ult.de || "").replace(/\s+/g, " ").slice(0, 90)}`,
        acc: "Revisar", hy: "eq", v: eq,
      }));
    }
    // 2. Pendientes de prioridad alta
    const P = window.PENDIENTES;
    if (P) P.abiertos().filter((p) => p.prioridad === "alta" && (!vista.sede || !p.sede || p.sede === vista.sede))
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).slice(0, 5)
      .forEach((p) => grupos.urgente.push({ tono: p.estado === "espera" ? "warn" : "bad", ico: "pendientes", t: p.titulo, s: `${p.eq || "General"} · ${P.ESTADO_TXT[p.estado]}${p.edad ? ` · hace ${p.edad} d` : ""}`, acc: "Abrir", hy: "pend", id: p.id }));

    // 3. Piezas que ya toca cambiar (componentes seguidos por posición)
    const yaListadas = new Set();
    if (typeof compEstado === "function") (window.COMPONENTES_SEGUIDOS || []).forEach((g) => (g.items || []).forEach((it) => {
      const e = compEstado(g.eq, g, it);
      if (!["pendiente", "vencida", "pronto"].includes(e.estado)) return;
      const n = existencia(it.cod);
      if (it.cod) yaListadas.add(`${g.eq}|${it.cod}`);
      grupos.mtto.push({
        tono: e.estado === "pronto" ? "warn" : "bad", ico: "llave",
        t: `Cambiar ${it.ubicacion || it.d} · ${nombreEq(g.eq)}`,
        s: [e.estado === "pendiente" ? "Quedó pendiente" : e.estado === "vencida" ? `Tocaba el ${N.fmt.corta(e.proximo)}` : `Toca el ${N.fmt.corta(e.proximo)}`, it.d, hayTxt(n)].filter(Boolean).join(" · "),
        falta: n === 0, acc: n === 0 ? "Pedir" : "Ver", hy: n === 0 ? "pedir" : "ficha", v: g.eq, cod: it.cod,
      });
    }));
    // 4. Piezas que una inspección abierta marcó para cambiar y no se han hecho
    //    (el Seguimiento decide qué cuenta como hecho)
    const SGh = window.SEGUIMIENTO;
    (typeof inspecciones !== "undefined" ? inspecciones : []).filter((i) => i && (i.estado || "abierta") !== "cerrada").forEach((i) => (i.piezas || []).forEach((p) => {
      if (p.hecho || (SGh && SGh.estadoHallazgo(i, p).k === "hecho")) return;
      // La misma pieza ya salió como posición pendiente de esa máquina
      if (p.cod && yaListadas.has(`${i.eq}|${p.cod}`)) return;
      const n = existencia(p.cod);
      grupos.mtto.push({
        tono: p.urgencia === "alta" ? "bad" : p.urgencia === "baja" ? "" : "warn", ico: "insp",
        t: `${p.d || p.cod || "Pieza"} · ${nombreEq(i.eq)}`,
        s: [`Inspección del ${N.fmt.corta(i.fecha)}`, p.q ? `${p.q} und.` : "", hayTxt(n)].filter(Boolean).join(" · "),
        falta: n === 0, acc: n === 0 ? "Pedir" : "Ver", hy: n === 0 ? "pedir" : "seg", v: i.eq, cod: p.cod, id: i.id,
      });
    }));
    // 5. Mantenimientos programados para hoy (o que ya pasaron sin hacerse)
    //    y el equipo que conviene inspeccionar hoy
    const SG = window.SEGUIMIENTO;
    if (SG) {
      SG.trabajos().filter((t) => t.etapa === "programado" && t.i.programado <= hoy).forEach((t) => grupos.urgente.unshift({
        tono: "bad", ico: "calendario", t: `Mantenimiento ${t.i.programado === hoy ? "hoy" : "atrasado"}: ${nombreEq(t.i.eq)}`,
        s: `${t.pend.length} ${t.pend.length === 1 ? "cosa por hacer" : "cosas por hacer"}${t.i.programado < hoy ? ` · era el ${N.fmt.corta(t.i.programado)}` : ""}`, acc: "Abrir", hy: "seg", id: t.i.id,
      }));
      const s = SG.sugerencias()[0];
      if (s) grupos.mtto.unshift({ tono: "", ico: "insp", t: `Inspeccionar hoy: ${nombreEq(s.c)}`, s: `${s.n} fallas en 14 días · ${s.u ? `última inspección el ${N.fmt.corta(s.u)}` : "nunca inspeccionado"}`, acc: "Inspeccionar", hy: "inspeccionar", v: s.c });
    }
    // 6. Tareas con aviso para hoy o vencido
    if (typeof tasks !== "undefined") tasks.filter((x) => x.status !== "hecha" && x.remindNextAt && N.diaCO(x.remindNextAt) <= hoy).slice(0, 5)
      .forEach((x) => grupos.mtto.push({ tono: "", ico: "tareas", t: x.title || "Tarea", s: `${x.machineName && x.machineName !== "General / Otra" ? x.machineName + " · " : ""}aviso ${N.diaCO(x.remindNextAt) < hoy ? "vencido" : "de hoy"}`, acc: "Ver", hy: "tareas" }));

    // 7. Almacén
    const sols = window.almSolicitudes ? window.almSolicitudes() : [];
    const sinEntregar = sols.filter((s) => (s.estado || "emitida") === "emitida").length;
    const telegram = sols.filter((s) => s.estado === "pedido").length;
    if (telegram) grupos.almacen.push({ tono: "warn", ico: "telegram", t: `${telegram} ${telegram === 1 ? "pedido llegó" : "pedidos llegaron"} por Telegram`, s: "Pasarlos a una solicitud", acc: "Ver", hy: "almacen" });
    if (sinEntregar) grupos.almacen.push({ tono: "", ico: "almacen", t: `${sinEntregar} ${sinEntregar === 1 ? "solicitud" : "solicitudes"} sin entregar`, s: "Confirmar con almacén y marcarlas entregadas", acc: "Ver", hy: "historial" });
    const inv = window.INVENTARIO;
    let bajo = 0;
    if (inv && inv.cargado && window.EQUIPOS_PLAN) {
      const vistos = new Set();
      window.EQUIPOS_PLAN.equipos.forEach((eq) => (eq.r || []).forEach((r) => {
        const cod = inv.norm(typeof repCodigo === "function" ? repCodigo(eq, r) : r.cod);
        if (!cod || vistos.has(cod)) return;
        vistos.add(cod);
        const a = inv.de(cod);
        if (a && a.min > 0 && (a.exist ?? 0) < a.min) bajo++;
      }));
    }
    if (bajo) grupos.almacen.push({ tono: "warn", ico: "repuesto", t: `${bajo} piezas del plan bajo el mínimo`, s: "Revisar cuáles pedir", acc: "Ver", hy: "almacen-min" });
    const f = inv ? inv.frescura() : null;
    if (f && f.estado !== "fresco") grupos.almacen.push({ tono: "", ico: "subir", t: "Actualizar el inventario", s: f.estado === "sin-datos" ? "No hay reporte RE356 cargado" : `El RE356 es ${f.texto.replace(/^Inventario /, "").replace(/dias/, "días")}`, acc: "Cargar", hy: "almacen" });
    return grupos;
  }

  function tarjetaAgenda() {
    const g = agenda();
    const TIT = { urgente: "Urgente", mtto: "Mantenimiento y repuestos", almacen: "Almacén" };
    const total = Object.values(g).reduce((a, l) => a + l.length, 0);
    const MAX = 6;
    const fila = (x) => `<li><button class="hy-ag" type="button" data-hy="${x.hy}" ${x.v ? `data-v="${esc(x.v)}"` : ""} ${x.id ? `data-id="${esc(x.id)}"` : ""} ${x.cod ? `data-cod="${esc(x.cod)}"` : ""}>
        <span class="hy-ag__ico ${x.tono ? "is-" + x.tono : ""}">${ic(x.ico)}</span>
        <span class="hy-ag__txt"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span>
        <span class="hy-ag__acc ${x.falta ? "is-pedir" : ""}">${esc(x.acc)}</span>
      </button></li>`;
    return `<section class="ux-card hy-agenda">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("check")}Para hoy <small>${total ? `${total} por atender` : ""}</small></h2></div></div>
      ${total ? Object.entries(g).filter(([, l]) => l.length).map(([k, l]) => `<div class="hy-ag__grupo">
          <h3 class="hy-ag__t">${TIT[k]} <span>${l.length}</span></h3>
          <ul class="hy-ag__lista">${(vista.abierto === k ? l : l.slice(0, MAX)).map(fila).join("")}</ul>
          ${l.length > MAX && vista.abierto !== k ? `<button class="ux-link" type="button" data-hy="mas" data-v="${k}">Ver las ${l.length}</button>` : ""}
        </div>`).join("")
        : `<div class="ux-empty"><span class="ux-empty__ico">${ic("check")}</span><h4>Nada pendiente para hoy</h4></div>`}
    </section>`;
  }

  // Sin nombre guardado: un enlace discreto junto al saludo, no un recuadro.
  // Se abre en una línea al tocarlo.
  function quien() {
    if (N.usuario.get()) return "";
    if (!vista.quien) return `<button class="hy-quien-link" type="button" data-hy="quien">¿Quién eres?</button>`;
    const gente = window.PENDIENTES ? window.PENDIENTES.gente() : [];
    return `<form class="hy-quien__f" data-hy-form="quien"><input class="ux-input" name="n" list="hyGente" placeholder="Tu nombre" aria-label="Tu nombre" required autofocus><datalist id="hyGente">${gente.map((n) => `<option value="${esc(n)}">`).join("")}</datalist><button class="ux-btn ux-btn--primary ux-btn--sm" type="submit">Listo</button></form>`;
  }

  // ------------------------------------------------------------------ vista
  function render() {
    const raiz = document.getElementById("hoyRoot");
    if (!raiz) return;
    const hoy = N.hoy();
    const t = N.turnoEnCurso();
    const P = window.PENDIENTES;
    const ab = P ? P.abiertos().filter((p) => !vista.sede || !p.sede || p.sede === vista.sede) : [];
    const alta = ab.filter((p) => p.prioridad === "alta").length;
    const paradas = paradasPorFalla();
    const pres = window.PRESUPUESTO && window.PRESUPUESTO.resumen ? window.PRESUPUESTO.resumen() : null;
    const fallasSemana = S() ? S().registros().filter((r) => r && !r.borrado && r.f >= N.sumaDias(hoy, -6) && r.f <= hoy && r.cat === "Máquina" && r.tp === "Correctivo" && (!vista.sede || r.s === vista.sede)).length : 0;

    raiz.innerHTML = `<div class="ux-page ux-seq">
      <div class="ux-head">
        <div class="ux-head__txt">
          <p class="ux-eyebrow">${ic(t.turno === "Día" ? "sol" : "luna")}${esc(N.fmt.fechaLarga(hoy).replace(/^./, (c) => c.toUpperCase()))} · turno de ${t.turno === "Día" ? "día" : "noche"} en curso</p>
          <h1 class="ux-title">${saludo()}</h1>
          ${quien()}
        </div>
        <div class="ux-head__acts">
          <div class="ux-seg" aria-label="Sede">${["", "Sede 4", "Sede 2"].map((s) => `<button type="button" class="${vista.sede === s ? "is-on" : ""}" data-hy="sede" data-v="${s}">${s || "Las dos"}</button>`).join("")}</div>
        </div>
      </div>

      <div class="hy-stats hy-stats--4c">
        ${kpi({ n: ab.length, titulo: "Pendientes", pie: alta ? `<span class="hy-rojo">${alta} prioridad alta</span>` : "ninguno urgente", go: "pendientes" })}
        ${kpi({ n: paradas.length, titulo: "Paradas por falla", pie: paradas.length ? paradas.slice(0, 2).map((r) => esc(r.eq)).join(", ") + (paradas.length > 2 ? "…" : "") : "ninguna máquina parada", tono: paradas.length ? "is-bad" : "", go: "registro", goQ: hoy })}
        ${kpi({ n: fallasSemana, titulo: "Fallas de máquina", pie: "últimos 7 días", tono: fallasSemana ? "is-bad" : "", go: "indicadores" })}
        ${pres && pres.total
          ? kpi({ n: Math.round((pres.ejecutado / pres.total) * 1000) / 10, dec: 1, unidad: "%", titulo: "Presupuesto", pie: `${esc(N.fmt.dineroCorto(pres.disponible))} disponibles`, go: "presupuesto" })
          : kpi({ n: 0, unidad: "%", titulo: "Presupuesto", pie: "sin configurar", go: "presupuesto-config" })}
      </div>

      <div class="ux-grid ux-grid--main">
        ${tarjetaAgenda()}
        <div class="ux-stack">
          ${tarjetaFallas()}
          ${tarjetaTurno()}
        </div>
      </div>
    </div>`;
    window.SHELL?.animarNumeros(raiz);
  }

  function enlazar() {
    const raiz = document.getElementById("hoyRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const b = e.target.closest("[data-hy]");
      if (!b) return;
      const a = b.dataset.hy;
      const v = b.dataset.v;
      if (a === "quien") { vista.quien = true; render(); raiz.querySelector('[data-hy-form="quien"] input')?.focus(); return; }
      if (a === "sede") { vista.sede = v; render(); }
      else if (a === "dia") { vista.dia = v; render(); }
      else if (a === "registro") window.goRegistro?.({ fecha: v || b.dataset.q || N.hoy() });
      else if (a === "reg") window.goRegistro?.({ abrir: b.dataset.id });
      else if (a === "nueva") window.goRegistro?.({ nueva: true });
      else if (a === "rep") window.goReportes?.(b.dataset.id);
      else if (a === "pendientes") window.goPendientes?.();
      else if (a === "pend") window.goPendientes?.({ abrir: b.dataset.id });
      else if (a === "tareas") window.goTasks?.();
      else if (a === "turnos") window.goTurnos?.();
      else if (a === "eq") window.goIndicadores?.({ eq: v });
      else if (a === "indicadores") window.goIndicadores?.();
      else if (a === "almacen") window.goAlmacen?.();
      else if (a === "almacen-min") window.goAlmacen?.({ filtro: "min" });
      else if (a === "presupuesto") window.goPresupuesto?.();
      else if (a === "presupuesto-config") window.goPresupuesto?.({ configurar: true });
      else if (a === "mas") { vista.abierto = v; render(); return; }
      else if (a === "historial") window.goSolicitudes?.({ estado: "emitida" });
      else if (a === "insp") window.goInsp?.();
      else if (a === "seg") window.goSeguimiento?.({ id: b.dataset.id });
      else if (a === "inspeccionar") window.inspAbrirForm?.(v);
      else if (a === "pedir") window.goAlmacen?.({ q: b.dataset.cod || "", destino: nombreEq(v) });
      else if (a === "ficha") { const e = planEq(v); if (e && typeof machines !== "undefined" && machines.some((m) => m.id === e.id)) window.openDetail?.(e.id); else window.goPlan?.(v); }
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    raiz.addEventListener("submit", (e) => {
      const f = e.target.closest('[data-hy-form="quien"]');
      if (!f) return;
      e.preventDefault();
      const n = new FormData(f).get("n").toString().trim();
      if (!n) return;
      N.usuario.set(n);
      vista.quien = false;
      window.SHELL?.toast(`Listo, ${esc(n.split(" ")[0])}.`);
      render();
    });
  }

  function esVisible() { return document.getElementById("hoyView")?.classList.contains("is-active"); }
  let t = null;
  const repintar = () => { if (!esVisible()) return; clearTimeout(t); t = setTimeout(render, 200); };
  N.on("pendientes", repintar);
  N.on("presupuesto", repintar);
  N.on("usuario", repintar);
  window.MTTO_STORE?.alCambiar(repintar);

  function goHoy() {
    views.hoy = views.hoy || document.getElementById("hoyView");
    setView("hoy");
    render();
    enlazar();
    saveUiState({ activeView: "hoy" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  window.goHoy = goHoy;
  window.HOY = { reporteDe, paradasPorFalla };
  views.hoy = document.getElementById("hoyView");
})();
