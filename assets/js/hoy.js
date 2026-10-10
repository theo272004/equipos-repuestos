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
  const vista = { dia: "", sede: "", quien: false, sheet: null, verTodo: false, expandTurno: { sede4: false, sede2: false } };

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

  // Máquinas y servicios críticos parados por una falla o pendiente en los últimos 5 días
  function paradasPorFalla() {
    if (!S()) return [];
    const hoy = N.hoy();
    const desde = N.sumaDias(hoy, -5);
    const ultima = new Map();
    S().registros().filter((r) => r && !r.borrado && r.f >= desde && (r.cat === "Máquina" || r.cat === "Apoyo crítico" || /bomba de vac[íi]o|compresor|chiller/i.test(r.de || "")) && (!vista.sede || r.s === vista.sede))
      .sort((a, b) => (a.f + (a.hr || a.hi || "")).localeCompare(b.f + (b.hr || b.hi || "")))
      .forEach((r) => ultima.set(`${r.s}|${r.eq || r.de.slice(0, 30)}`, r));
    return [...ultima.values()].filter((r) => r.ef === "Pendiente" || r.frep === 1 || (/parada|fuera de servicio|averiada|bloqueada|se da[ñn]a.*pendiente/i.test(r.de || "") && r.ef !== "Operativo")).sort((a, b) => (b.f + (b.hr || "")).localeCompare(a.f + (a.hr || "")));
  }

  function saludo() {
    const n = N.usuario.get();
    const primer = n ? n.split(/\s+/)[0] : "";
    return `${N.saludo()}${primer ? ", " + esc(primer) : ""}`;
  }

  // ----------------------------------------------------------------- piezas
  // Una cifra de la franja de arriba: nombre, número y una línea de detalle
  function kpi({ n, dec = 0, unidad = "", titulo, pie, tono = "", ico = "", go, goQ }) {
    const val = Number(n) || 0;
    return `<button class="hy-stat ${tono}" type="button" ${go ? `data-hy="${go}"` : ""} ${goQ ? `data-q="${esc(goQ)}"` : ""}>
      <span class="hy-stat__t">${ico ? ic(ico, "ic--sm") : ""}<span>${esc(titulo)}</span></span>
      <b class="hy-stat__n"><span data-n="${val}" data-dec="${dec}">${val.toLocaleString("es-CO", { maximumFractionDigits: dec, minimumFractionDigits: dec })}</span>${unidad ? `<small>${unidad}</small>` : ""}</b>
      ${pie ? `<span class="hy-stat__s">${pie}</span>` : ""}
    </button>`;
  }

  function rolTecnico(nombre) {
    const s = String(nombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/\bnestor\b|ardila/i.test(s)) return "Locativo";
    if (/\bjuan\b|estupinan/i.test(s)) return "Refrigeración";
    if (/\byesid\b|\bheiner\b|\bbladimir\b|\bbrayan\b|\boscar\b|\bsergio\b|\bleo\b|\bleonardo\b/i.test(s)) return "Electricista";
    return "Mecánico";
  }

  function tarjetaTurno() {
    const T = window.TURNOS;
    const t = N.turnoEnCurso();
    const quienes = T ? T.quienes(t.fecha, t.clave) : {};

    const bloque = (k, sedeLabel) => {
      const g = (quienes[k] && quienes[k].gente) || [];
      const abierto = !!(vista.expandTurno && vista.expandTurno[k]);
      const count = g.length;
      const countTxt = count === 1 ? "1 técnico" : `${count} técnicos`;

      return `<div class="hy-turno-sede ${abierto ? "is-open" : ""}">
        <button class="hy-turno-row" type="button" data-hy="toggle-turno" data-sede="${k}" aria-expanded="${abierto ? "true" : "false"}">
          <div class="hy-turno-row__t">
            <b>${esc(sedeLabel)}</b>
            <span class="ux-mute">· ${count ? countTxt : "Sin personal en cuadro"}</span>
          </div>
          <div class="hy-turno-row__end">
            <span class="ux-avs">${g.slice(0, 4).map((p) => `<span class="ux-av ux-av--${N.tono(p.nombre)}" title="${esc(p.nombre)}">${esc(N.iniciales(p.nombre).toUpperCase())}</span>`).join("")}</span>
            <span class="hy-turno-row__chev ${abierto ? "is-open" : ""}">${ic("abajo", "ic--sm")}</span>
          </div>
        </button>
        ${abierto && g.length ? `<ul class="hy-turno-detalle">
          ${g.map((p) => {
            const rol = rolTecnico(p.nombre);
            const rolCls = rol === "Electricista" ? "hy-rol--elec" : rol === "Refrigeración" ? "hy-rol--refr" : rol === "Locativo" ? "hy-rol--loc" : "hy-rol--mec";
            const corto = p.nombre.split(" ").slice(0, 2).join(" ");
            return `<li>
              <span class="ux-av ux-av--${N.tono(p.nombre)}">${esc(N.iniciales(p.nombre).toUpperCase())}</span>
              <div class="hy-turno-detalle__n">
                <b>${esc(corto)}</b>
                <small>${esc(p.nombre)}</small>
              </div>
              <span class="hy-rol ${rolCls}">${esc(rol)}</span>
            </li>`;
          }).join("")}
        </ul>` : ""}
      </div>`;
    };

    return `<section class="ux-card hy-turno-card">
      <div class="ux-card__head">
        <div>
          <h2 class="ux-card__title">${ic("turnos")}Personal en turno</h2>
          <p class="ux-card__sub">Turno de ${t.turno === "Día" ? "día · 8:00 a 20:00" : "noche · 20:00 a 8:00"}</p>
        </div>
      </div>
      <div class="hy-turno-list">
        ${bloque("sede4", "Sede 4")}
        <hr class="ux-divider" style="margin:4px 0">
        ${bloque("sede2", "Sede 2")}
      </div>
      <div class="hy-turno-foot">
        <button class="ux-link" type="button" data-hy="turnos">Ver cuadro completo →</button>
      </div>
    </section>`;
  }

  function tarjetaFallas() {
    const hasta = N.hoy();
    const desde = N.sumaDias(hasta, -6);
    const regs = S() ? S().registros().filter((r) => r.f >= desde && r.f <= hasta && r.cat === "Máquina" && r.tp === "Correctivo" && !/no identificado|sin especificar/i.test(r.eq) && (!vista.sede || r.s === vista.sede)) : [];
    const m = new Map();
    regs.forEach((r) => m.set(r.eq, (m.get(r.eq) || 0) + 1));
    const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const max = Math.max(1, ...top.map((x) => x[1]));
    return `<section class="ux-card hy-fallas-panel">
      <div class="ux-card__head">
        <div>
          <h2 class="ux-card__title">${ic("falla")}Equipos con más fallas</h2>
          <p class="ux-card__sub">Correctivos de máquina, últimos 7 días</p>
        </div>
        <button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-hy="indicadores">Indicadores ${ic("der", "ic--sm")}</button>
      </div>
      ${top.length ? `<div class="ux-hbars">${top.map(([eq, n]) => `<button class="ux-hbar" type="button" data-hy="ver-fallas-eq" data-v="${esc(eq)}" title="Ver las ${n} fallas de ${esc(eq)}"><span class="ux-hbar__t">${esc(eq)}</span><span class="ux-hbar__v">${n} <small>${n === 1 ? "falla" : "fallas"}</small></span><span class="ux-progress"><i style="width:${Math.round((n / max) * 100)}%"></i></span></button>`).join("")}</div>`
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

  // Siempre 3 equipos recomendados para inspeccionar basados en fallas recientes (14 días)
  function tresSugerencias(sede, excluir = new Set()) {
    const hoy = N.hoy();
    const desde = N.sumaDias(hoy, -14);
    const S_ = S();
    const result = [];
    const vistos = new Set();
    const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

    if (S_) {
      const regs = S_.registros().filter((r) => r && !r.borrado && r.f >= desde && r.f <= hoy && r.cat === "Máquina" && (!sede || r.s === sede) && r.eq && !/no identificado|sin especificar/i.test(r.eq));
      const m = new Map();
      regs.forEach((r) => {
        const k = r.eq.trim();
        const cur = m.get(k) || { eq: k, s: r.s, n: 0, ult: r.f, de: r.de || "" };
        cur.n++;
        if (r.f > cur.ult) { cur.ult = r.f; cur.de = r.de || cur.de; }
        m.set(k, cur);
      });
      const ordenados = [...m.values()].sort((a, b) => b.n - a.n || b.ult.localeCompare(a.ult));
      for (const item of ordenados) {
        if (result.length >= 3) break;
        const nk = norm(item.eq);
        if (excluir && excluir.has(nk)) continue;
        result.push(item);
        vistos.add(nk);
      }
    }

    if (result.length < 3) {
      const cat = (window.MTTO && window.MTTO.catalogo && window.MTTO.catalogo.equipos) || [];
      const deCat = cat.filter((e) => (!sede || e.s === sede) && !vistos.has(norm(e.eq)) && (!excluir || !excluir.has(norm(e.eq))));
      for (const e of deCat) {
        if (result.length >= 3) break;
        result.push({ eq: e.eq, s: e.s, n: 0, ult: "", de: "Equipo crítico del catálogo", fallback: true });
        vistos.add(norm(e.eq));
      }
    }

    if (result.length < 3) {
      const machList = typeof machines !== "undefined" ? machines : (window.machines || []);
      for (const m of machList) {
        if (result.length >= 3) break;
        const nom = m.model || m.name || m.id;
        const nk = norm(nom);
        if (!vistos.has(nk) && (!excluir || !excluir.has(nk))) {
          result.push({ eq: nom, s: sede || "Sede 4", n: 0, ult: "", de: "Inspección periódica", fallback: true });
          vistos.add(nk);
        }
      }
    }

    return result.slice(0, 3);
  }

  function agenda() {
    const hoy = N.hoy();
    const items = [];
    const S_ = S();

    // 0. Máquinas que siguen paradas por una falla (críticas en rojo)
    paradasPorFalla().forEach((r) => items.push({
      tono: "bad", ico: "llave", t: r.eq,
      s: `Parada por falla${r.frep ? " · falta repuesto" : ""} · ${N.fmt.corta(r.f)}`,
      acc: "Ver detalle", hy: "ver-evento", id: r.id, v: r.eq,
    }));

    // 1. Máquinas con fallas repetidas en la semana (≥ 3 fallas)
    if (S_) {
      const desde = N.sumaDias(hoy, -6);
      const m = new Map();
      S_.registros().filter((r) => r && !r.borrado && r.f >= desde && r.f <= hoy && r.cat === "Máquina" && r.tp === "Correctivo" && !/no identificado|sin especificar/i.test(r.eq) && (!vista.sede || r.s === vista.sede))
        .forEach((r) => { const x = m.get(r.eq) || { n: 0, ult: r }; x.n++; if ((r.f + (r.hr || "")) > (x.ult.f + (x.ult.hr || ""))) x.ult = r; m.set(r.eq, x); });
      [...m.entries()].filter(([, x]) => x.n >= 3).sort((a, b) => b[1].n - a[1].n).slice(0, 2).forEach(([eq, x]) => items.push({
        tono: "bad", ico: "llave", t: eq, s: `${x.n} fallas en 7 días · última: ${N.fmt.corta(x.ult.f)}`,
        acc: "Ver fallas", hy: "ver-fallas-eq", v: eq,
      }));
    }

    // 2. Pendiente de prioridad alta más urgente
    const P = window.PENDIENTES;
    if (P) P.abiertos().filter((p) => p.prioridad === "alta" && (!vista.sede || !p.sede || p.sede === vista.sede))
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).slice(0, 1)
      .forEach((p) => items.push({
        tono: p.estado === "espera" ? "warn" : "bad", ico: "pendientes",
        t: `${p.eq ? p.eq + ": " : ""}${p.titulo}`,
        s: `Pendiente de revisión · ${P.ESTADO_TXT[p.estado]}${p.edad ? ` · hace ${p.edad} d` : ""}`,
        acc: "Abrir", hy: "pend", id: p.id,
      }));

    // 3. Recomendación inteligente: SIEMPRE 3 equipos para inspeccionar (sin repetir los de arriba)
    const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    const yaEnItems = new Set(items.map((it) => norm(it.t)));
    tresSugerencias(vista.sede, yaEnItems).forEach((sug) => {
      items.push({
        tono: sug.n >= 5 ? "bad" : sug.n > 0 ? "warn" : "",
        ico: "insp",
        t: sug.eq,
        s: sug.n > 0 ? `Recomendado inspeccionar · ${sug.n} ${sug.n === 1 ? "falla" : "fallas"} en 14 días` : `Inspección programada · ${sug.s || "planta"}`,
        acc: "Ver fallas", hy: "ver-fallas-insp", v: sug.eq,
      });
    });

    // 4. Mantenimientos programados para hoy (o que ya pasaron sin hacerse)
    const SG = window.SEGUIMIENTO;
    if (SG) {
      SG.trabajos().filter((t) => t.etapa === "programado" && t.i.programado <= hoy).slice(0, 3).forEach((t) => items.push({
        tono: "bad", ico: "calendario", t: `Mantenimiento: ${nombreEq(t.i.eq)}`,
        s: `${t.pend.length} ${t.pend.length === 1 ? "tarea" : "tareas"} programadas${t.i.programado < hoy ? ` · era el ${N.fmt.corta(t.i.programado)}` : " hoy"}`,
        acc: "Abrir", hy: "seg", id: t.i.id,
      }));
    }

    // 5. Piezas que ya toca cambiar (componentes seguidos por posición)
    const yaListadas = new Set();
    if (typeof compEstado === "function") (window.COMPONENTES_SEGUIDOS || []).forEach((g) => (g.items || []).forEach((it) => {
      const e = compEstado(g.eq, g, it);
      if (!["pendiente", "vencida", "pronto"].includes(e.estado)) return;
      const n = existencia(it.cod);
      if (it.cod) yaListadas.add(`${g.eq}|${it.cod}`);
      items.push({
        tono: e.estado === "pronto" ? "warn" : "bad", ico: "repuesto",
        t: `Cambiar ${it.ubicacion || it.d} · ${nombreEq(g.eq)}`,
        s: [e.estado === "pendiente" ? "Quedó pendiente" : `Toca el ${N.fmt.corta(e.proximo)}`, hayTxt(n)].filter(Boolean).join(" · "),
        falta: n === 0, acc: n === 0 ? "Pedir" : "Ver", hy: n === 0 ? "pedir" : "ficha", v: g.eq, cod: it.cod,
      });
    }));

    // 6. Piezas que una inspección abierta marcó para cambiar y no se han hecho
    const SGh = window.SEGUIMIENTO;
    (typeof inspecciones !== "undefined" ? inspecciones : []).filter((i) => i && (i.estado || "abierta") !== "cerrada").forEach((i) => (i.piezas || []).forEach((p) => {
      if (p.hecho || (SGh && SGh.estadoHallazgo(i, p).k === "hecho")) return;
      if (p.cod && yaListadas.has(`${i.eq}|${p.cod}`)) return;
      const n = existencia(p.cod);
      items.push({
        tono: p.urgencia === "alta" ? "bad" : p.urgencia === "baja" ? "" : "warn", ico: "insp",
        t: `${p.d || p.cod || "Pieza"} · ${nombreEq(i.eq)}`,
        s: [`Inspección del ${N.fmt.corta(i.fecha)}`, hayTxt(n)].filter(Boolean).join(" · "),
        falta: n === 0, acc: n === 0 ? "Pedir" : "Ver", hy: n === 0 ? "pedir" : "seg", v: i.eq, cod: p.cod, id: i.id,
      });
    }));

    // 7. Tareas con aviso para hoy o vencido
    if (typeof tasks !== "undefined") tasks.filter((x) => x.status !== "hecha" && x.remindNextAt && N.diaCO(x.remindNextAt) <= hoy).slice(0, 3)
      .forEach((x) => items.push({
        tono: "", ico: "tareas", t: x.title || "Tarea",
        s: `${x.machineName && x.machineName !== "General / Otra" ? x.machineName + " · " : ""}aviso ${N.diaCO(x.remindNextAt) < hoy ? "vencido" : "de hoy"}`,
        acc: "Ver", hy: "tareas",
      }));

    // 8. Almacén relevante
    const sols = window.almSolicitudes ? window.almSolicitudes() : [];
    const sinEntregar = sols.filter((s) => (s.estado || "emitida") === "emitida").length;
    const telegram = sols.filter((s) => s.estado === "pedido").length;
    if (telegram) items.push({ tono: "warn", ico: "telegram", t: `${telegram} ${telegram === 1 ? "pedido llegó" : "pedidos llegaron"} por Telegram`, s: "Pasarlos a una solicitud", acc: "Ver", hy: "almacen" });
    if (sinEntregar) items.push({ tono: "", ico: "almacen", t: `${sinEntregar} ${sinEntregar === 1 ? "solicitud" : "solicitudes"} sin entregar`, s: "Confirmar con almacén", acc: "Ver", hy: "historial" });

    return items;
  }

  function tarjetaAgenda() {
    const items = agenda();
    const total = items.length;
    const MAX = 6;
    const visibles = vista.verTodo ? items : items.slice(0, MAX);
    const linkTxt = vista.verTodo ? "Ver menos" : (total === 10 ? "Ver las 10" : `Ver las ${total}`);

    const fila = (x) => `<li><button class="hy-ag ${x.tono ? "is-" + x.tono : ""}" type="button" data-hy="${x.hy}" ${x.v ? `data-v="${esc(x.v)}"` : ""} ${x.id ? `data-id="${esc(x.id)}"` : ""} ${x.cod ? `data-cod="${esc(x.cod)}"` : ""}>
        <span class="hy-ag__ico ${x.tono ? "is-" + x.tono : ""}">${ic(x.ico)}</span>
        <span class="hy-ag__txt">
          <b>${esc(x.t)}</b>
          <small>${esc(x.s)}</small>
        </span>
        <span class="hy-ag__chev">${ic("der", "ic--sm")}</span>
      </button></li>`;

    return `<section class="ux-card hy-agenda">
      <div class="ux-card__head">
        <div><h2 class="ux-card__title">${ic("check")}Trabajo prioritario</h2></div>
        ${total > MAX ? `<button class="ux-link" type="button" data-hy="toggle-agenda">${linkTxt}</button>` : ""}
      </div>
      ${total ? `<ul class="hy-ag__lista">${visibles.map(fila).join("")}</ul>`
        : `<div class="ux-empty"><span class="ux-empty__ico">${ic("check")}</span><h4>Nada pendiente para hoy</h4></div>`}
    </section>`;
  }

  function buscarFichaId(eqNombre, sede) {
    if (!eqNombre) return null;
    const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const neq = norm(eqNombre);
    const machList = typeof machines !== "undefined" ? machines : (window.machines || []);
    if (machList.length) {
      const direct = machList.find((m) => norm(m.id) === neq || norm(m.model) === neq || norm(m.name) === neq);
      if (direct) return direct.id;
    }
    const cat = (window.MTTO && window.MTTO.catalogo && window.MTTO.catalogo.equipos) || [];
    const enCat = cat.find((x) => (!sede || x.s === sede) && norm(x.eq) === neq) || cat.find((x) => norm(x.eq) === neq);
    if (enCat && enCat.fi) return enCat.fi;
    const plan = (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || [];
    const enPlan = plan.find((e) => norm(e.c) === neq || norm(e.n).includes(neq) || neq.includes(norm(e.n)));
    if (enPlan) {
      if (machList.length) {
        const m = machList.find((x) => x.id === enPlan.id || x.equipoCod === enPlan.c);
        if (m) return m.id;
      }
      return enPlan.id || enPlan.c;
    }
    return null;
  }

  function irAFicha(eqNombre, sede) {
    const fid = buscarFichaId(eqNombre, sede);
    const machList = typeof machines !== "undefined" ? machines : (window.machines || []);
    const abrir = window.openDetail || (typeof openDetail === "function" ? openDetail : null);
    if (fid && abrir && machList.some((m) => m.id === fid)) {
      abrir(fid);
      return true;
    }
    const plan = (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || [];
    const enPlan = plan.find((e) => e.c === eqNombre || e.id === eqNombre || e.n.toLowerCase().includes((eqNombre || "").toLowerCase()));
    if (enPlan && window.goPlan) {
      window.goPlan(enPlan.c || enPlan.n);
      return true;
    }
    if (window.goIndicadores) {
      window.goIndicadores({ eq: eqNombre, sede });
      return true;
    }
    return false;
  }

  function renderSheetEvento() {
    const r = S() ? S().registros().find((x) => x.id === vista.sheet.id) : null;
    if (!r) return "";
    const CAT_ICONS = {
      "Máquina": ["maq", "falla"],
      "Apoyo crítico": ["apo", "alerta"],
      "Locativo": ["loc", "edificio"],
      "Preventivo": ["pre", "check"],
      "Operacional": ["ope", "ajuste"]
    };
    const [cc, icn] = CAT_ICONS[r.cat] || ["maq", "falla"];
    const efc = r.ef === "Operativo" ? "ok" : r.ef === "Pendiente" ? "bad" : r.ef === "Operativo con pendiente" ? "warn" : "neutro";
    const durTxt = r.min > 0 ? (r.min >= 60 ? `${Math.floor(r.min / 60)}h ${r.min % 60}m` : `${r.min} min`) : (r.hi ? `${r.hi} - ${r.hf || ""}` : "Sin horario");
    const snap = (icono, valor, label, attrs = "") => `<div class="mx-snap ${attrs ? "is-link" : ""}" ${attrs}>${ic(icono)}<b>${valor}</b><span>${label}</span></div>`;
    const fila = (l, v) => (v ? `<div><dt>${l}</dt><dd>${v}</dd></div>` : "");

    return `<div class="mx-backdrop" data-hy-close="1"></div>
    <aside class="mx-sheet mx-sheet--ancha" role="dialog" aria-modal="true" aria-label="Detalle de parada">
      <header class="mx-sheet__head">
        <div>
          <p class="mx-eyebrow">${esc(r.s)} · ${esc(r.ar || "Área de proceso")} · Turno ${esc(r.t || "")}</p>
          <h3>${esc(r.eq)}</h3>
        </div>
        <button class="mx-iconbtn" type="button" data-hy-close="1" aria-label="Cerrar">${ic("x")}</button>
      </header>
      <div class="mx-form__body">
        <div class="mx-hero">
          <span class="mx-hero__ic mx-hero__ic--${cc}">${ic(icn)}</span>
          <p class="mx-hero__sub">${esc(r.s)} · ${esc(r.ar || "")} · Turno ${esc(r.t || "")}${r.hr ? " · " + esc(r.hr) : ""}</p>
          <div class="mx-hero__tags">
            <span class="mx-pill mx-pill--${cc}">${ic(icn)}${esc(r.cat || "Máquina")}</span>
            <span class="mx-pill mx-pill--ope">${esc(r.tp || "Correctivo")}</span>
            ${r.fa ? `<span class="mx-pill mx-pill--apo">${esc(r.fa)}</span>` : ""}
            <span class="mx-est mx-est--${efc}"><i></i>${esc(r.ef || "Sin cierre")}</span>
            ${r.frep ? `<span class="mx-pill mx-pill--apo">${ic("alerta")}Falta repuesto</span>` : ""}
          </div>
          <div class="mx-hero__acc">
            <button class="mx-btn mx-btn--primary mx-btn--sm" type="button" data-hy-go-ficha="${esc(r.eq)}" data-hy-sede="${esc(r.s)}">
              ${ic("ficha")} Ir a la ficha de la máquina
            </button>
            <button class="mx-btn mx-btn--ghost mx-btn--sm" type="button" data-hy="eq" data-v="${esc(r.eq)}">
              ${ic("grafica")} Hoja de vida completa
            </button>
            <button class="mx-btn mx-btn--ghost mx-btn--sm" type="button" data-hy="reg-edit" data-id="${esc(r.id)}">
              ${ic("editar")} Completar / Editar registro
            </button>
          </div>
        </div>

        <h5 class="mx-h5">Resumen del evento</h5>
        <div class="mx-snaps">
          ${snap("calendario", N.fmt.corta(r.f), `Turno ${esc(r.t || "")}${r.hr ? " · " + esc(r.hr) : ""}`)}
          ${snap("reloj", durTxt, r.min > 0 ? "tiempo parada" : "duración")}
          ${r.tec ? snap("usuario", esc(r.tec.split(" ")[0]), "técnico") : ""}
          ${snap("almacen", r.frep ? "Faltó repuesto" : (r.rep ? "Con repuesto" : "Sin repuesto"), "repuesto")}
        </div>

        <h5 class="mx-h5">¿Qué pasó en la máquina?</h5>
        <p class="mx-quote">${esc(r.de || "Sin descripción de la novedad")}</p>

        ${r.ac ? `<h5 class="mx-h5">Acción realizada</h5><p class="mx-quote" style="border-left-color:var(--mx-green,#12b76a);">${esc(r.ac)}</p>` : ""}

        <h5 class="mx-h5">Detalle técnico</h5>
        <dl class="mx-inset mx-inset--2">
          ${fila("Estado", esc(r.ef || "Sin cierre"))}
          ${fila("¿Detuvo equipo?", esc(r.det || (r.min > 0 ? "Sí" : "Sin dato")))}
          ${fila("Repuesto", esc(r.rep || (r.frep ? "Faltó repuesto en planta" : "No requerido")))}
          ${fila("Técnico", esc(r.tec || "Sin registrar"))}
          ${fila("Área de proceso", esc(r.ar || ""))}
          ${fila("Turno", esc(r.t || ""))}
        </dl>
      </div>
    </aside>`;
  }

  function renderSheetFallas() {
    const cod = vista.sheet.cod;
    const eqNom = vista.sheet.eqNom || (cod ? nombreEq(cod) : "");
    const hoy = N.hoy();
    const dias = vista.sheet.dias || 14;
    const desde = N.sumaDias(hoy, -dias);

    const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    const neq = norm(eqNom);
    const cat = (window.MTTO && window.MTTO.catalogo && window.MTTO.catalogo.equipos) || [];
    const itemsCat = cat.filter((x) => x.fi === cod || (cod && x.fi === `eq-${cod}`) || norm(x.eq) === neq);
    const eqNames = new Set([eqNom, cod, ...itemsCat.map((x) => x.eq)].filter(Boolean));
    const eqNorms = new Set([...eqNames].map(norm));

    const regs = S() ? S().registros().filter((r) => {
      if (!r || r.borrado || r.f < desde || r.f > hoy) return false;
      if (vista.sede && r.s && r.s !== vista.sede) return false;
      const rn = norm(r.eq);
      return eqNorms.has(rn) || [...eqNorms].some((en) => (en.length >= 4 && (rn.includes(en) || en.includes(rn))));
    }).sort((a, b) => (b.f + (b.hr || "")).localeCompare(a.f + (a.hr || ""))) : [];

    const correctivos = regs.filter((r) => r.cat === "Máquina" && r.tp === "Correctivo");
    const operacionales = regs.filter((r) => r.cat === "Operacional" || r.tp === "Apoyo a producción");
    const criticos = regs.filter((r) => r.cat === "Apoyo crítico");

    const snap = (icono, valor, label, attrs = "") => `<div class="mx-snap ${attrs ? "is-link" : ""}" ${attrs}>${ic(icono)}<b>${valor}</b><span>${label}</span></div>`;

    return `<div class="mx-backdrop" data-hy-close="1"></div>
    <aside class="mx-sheet mx-sheet--ancha" role="dialog" aria-modal="true" aria-label="Eventos recientes del equipo">
      <header class="mx-sheet__head">
        <div>
          <p class="mx-eyebrow">Diagnóstico de eventos · Últimos ${dias} días (${N.fmt.corta(desde)} al ${N.fmt.corta(hoy)})</p>
          <h3>${esc(eqNom)}</h3>
        </div>
        <button class="mx-iconbtn" type="button" data-hy-close="1" aria-label="Cerrar">${ic("x")}</button>
      </header>
      <div class="mx-form__body">
        
        <div class="mx-snaps">
          ${snap("falla", correctivos.length, "averías mecánicas / eléctricas")}
          ${snap("ajuste", operacionales.length, "ajustes operacionales / cuadres")}
          ${snap("alerta", criticos.length, "apoyo crítico / servicios")}
          ${snap("calendario", regs.length, `total llamadas en ${dias} días`)}
        </div>

        <div class="mx-hero__acc" style="justify-content:flex-start; margin: 12px 0 16px;">
          ${cod ? `<button class="mx-btn mx-btn--primary mx-btn--sm" type="button" data-hy-insp="${esc(cod)}">
            ${ic("insp")} Anotar inspección de este equipo
          </button>` : ""}
          <button class="mx-btn mx-btn--ghost mx-btn--sm" type="button" data-hy-go-ficha="${esc(eqNom)}">
            ${ic("ficha")} Ir a la ficha de la máquina
          </button>
          <button class="mx-btn mx-btn--ghost mx-btn--sm" type="button" data-hy="eq" data-v="${esc(eqNom)}">
            ${ic("grafica")} Hoja de vida completa
          </button>
        </div>

        <h5 class="mx-h5">Detalle cronológico de las ${regs.length} llamadas y paradas:</h5>
        ${regs.length ? `<div style="display:flex; flex-direction:column; gap:10px;">
          ${regs.map((r) => {
            const esMec = r.cat === "Máquina" && r.tp === "Correctivo";
            const esOpe = r.cat === "Operacional" || r.tp === "Apoyo a producción";
            const pillCls = esMec ? "mx-pill--maq" : esOpe ? "mx-pill--ope" : "mx-pill--apo";
            const tagTxt = esMec ? "Avería de máquina" : esOpe ? "Soporte operacional / cuadre" : r.cat || "Novedad";
            const efc = r.ef === "Operativo" ? "ok" : r.ef === "Pendiente" ? "bad" : r.ef === "Operativo con pendiente" ? "warn" : "neutro";
            return `<div class="mx-card" style="padding:14px;">
              <div class="mx-card__head" style="margin-bottom:8px;">
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <span class="mx-pill ${pillCls}">${tagTxt}</span>
                  <span class="mx-est mx-est--${efc}"><i></i>${esc(r.ef || "Sin cierre")}</span>
                  <small style="color:var(--mx-mute);">${esc(N.fmt.corta(r.f))}${r.hr ? " " + r.hr : ""} · Turno ${esc(r.t || "")}</small>
                </div>
                <div style="font-size:12px; color:var(--mx-mute);">
                  ${r.tec ? `${ic("usuario", "ic--sm")} ${esc(r.tec.split(" ")[0])}` : ""}
                  ${r.min > 0 ? ` · ${r.min >= 60 ? `${Math.floor(r.min / 60)}h ${r.min % 60}m` : `${r.min}m`}` : ""}
                </div>
              </div>
              <p class="mx-quote" style="margin-bottom:6px;">${esc(r.de || "")}</p>
              ${r.ac ? `<p style="margin:0 0 4px 0; font-size:12.5px; color:var(--mx-green,#12b76a); line-height:1.4;"><b>Acción:</b> ${esc(r.ac)}</p>` : ""}
              ${r.rep || r.frep ? `<p style="margin:0; font-size:12px; color:var(--mx-amber-d,#b54708);"><b>Repuesto:</b> ${esc(r.rep || "Faltó repuesto en planta")}</p>` : ""}
            </div>`;
          }).join("")}
        </div>` : `<div class="ux-empty"><p>No se encontraron registros de este equipo en este periodo.</p></div>`}
      </div>
    </aside>`;
  }

  function renderSheetParadas() {
    const paradas = paradasPorFalla();
    return `<div class="mx-backdrop" data-hy-close="1"></div>
    <aside class="mx-sheet mx-sheet--ancha" role="dialog" aria-modal="true" aria-label="Máquinas paradas por falla">
      <header class="mx-sheet__head">
        <div>
          <p class="mx-eyebrow">Diagnóstico de planta · Ventana de 5 días</p>
          <h3>Máquinas y servicios parados por falla (${paradas.length})</h3>
        </div>
        <button class="mx-iconbtn" type="button" data-hy-close="1" aria-label="Cerrar">${ic("x")}</button>
      </header>
      <div class="mx-form__body">
        ${paradas.length ? `<div style="display:flex; flex-direction:column; gap:12px;">
          ${paradas.map((r) => `
            <div class="mx-card" style="padding:14px; border-left:4px solid var(--mx-red,#d92d20);">
              <div class="mx-card__head" style="margin-bottom:8px;">
                <div>
                  <h4 style="margin:0; font-size:15px; font-weight:700;">${esc(r.eq)}</h4>
                  <small style="color:var(--mx-mute);">${esc(r.s)} · ${esc(r.ar || "Área")} · Desde ${N.fmt.corta(r.f)}${r.hr ? " " + r.hr : ""}</small>
                </div>
                <div style="display:flex; gap:6px;">
                  <button class="mx-btn mx-btn--primary mx-btn--sm" type="button" data-hy-go-ficha="${esc(r.eq)}" data-hy-sede="${esc(r.s)}">
                    ${ic("ficha")} Ir a la máquina
                  </button>
                  <button class="mx-btn mx-btn--ghost mx-btn--sm" type="button" data-hy="ver-evento" data-id="${esc(r.id)}">
                    Ver detalle
                  </button>
                </div>
              </div>
              <p class="mx-quote" style="margin-bottom:6px;">${esc(r.de || "")}</p>
              ${r.ac ? `<p style="margin:0; font-size:12.5px; color:var(--mx-green,#12b76a);"><b>Acción:</b> ${esc(r.ac)}</p>` : ""}
            </div>`).join("")}
        </div>` : `<div class="ux-empty"><p>No hay máquinas paradas registradas en los últimos 5 días.</p></div>`}
      </div>
    </aside>`;
  }

  function renderSheet() {
    if (!vista.sheet) return "";
    if (vista.sheet.tipo === "evento") return renderSheetEvento();
    if (vista.sheet.tipo === "fallas") return renderSheetFallas();
    if (vista.sheet.tipo === "paradas") return renderSheetParadas();
    return "";
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
        </div>
        <div class="ux-head__acts">
          <div class="ux-seg" aria-label="Sede">${["", "Sede 4", "Sede 2"].map((s) => `<button type="button" class="${vista.sede === s ? "is-on" : ""}" data-hy="sede" data-v="${s}">${s || "Las dos"}</button>`).join("")}</div>
        </div>
      </div>

      <div class="hy-stats hy-stats--4c">
        ${kpi({ ico: "pendientes", n: ab.length, titulo: "Pendientes", pie: alta ? `<span class="hy-rojo">${alta} prioridad alta</span>` : "ninguno urgente", go: "pendientes" })}
        ${kpi({ ico: "alerta", n: paradas.length, titulo: "Paradas", pie: paradas.length ? paradas.slice(0, 2).map((r) => esc(r.eq)).join(", ") + (paradas.length > 2 ? "…" : "") : "ninguna máquina parada", tono: paradas.length ? "is-bad" : "", go: "paradas-modal" })}
        ${kpi({ ico: "indicadores", n: fallasSemana, titulo: "Fallas / 7 días", pie: "últimos 7 días", tono: fallasSemana ? "is-bad" : "", go: "indicadores" })}
        ${pres && pres.total
          ? kpi({ ico: "presupuesto", n: Math.round((pres.ejecutado / pres.total) * 1000) / 10, dec: 1, unidad: "%", titulo: "Presupuesto", pie: `${esc(N.fmt.dineroCorto(pres.disponible))} disponibles`, go: "presupuesto" })
          : kpi({ ico: "presupuesto", n: 0, unidad: "%", titulo: "Presupuesto", pie: "sin configurar", go: "presupuesto-config" })}
      </div>

      <div class="ux-grid ux-grid--main">
        ${tarjetaAgenda()}
        <div class="ux-stack">
          ${tarjetaFallas()}
          ${tarjetaTurno()}
        </div>
      </div>
    </div>
    ${renderSheet()}`;
    window.SHELL?.animarNumeros(raiz);
  }

  function enlazar() {
    const raiz = document.getElementById("hoyRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", (e) => {
      const btnCerrar = e.target.closest("[data-hy-close]");
      if (btnCerrar) {
        vista.sheet = null;
        render();
        return;
      }
      const btnGoFicha = e.target.closest("[data-hy-go-ficha]");
      if (btnGoFicha) {
        vista.sheet = null;
        irAFicha(btnGoFicha.dataset.hyGoFicha, btnGoFicha.dataset.hySede);
        return;
      }
      const btnInsp = e.target.closest("[data-hy-insp]");
      if (btnInsp) {
        vista.sheet = null;
        window.inspAbrirForm?.(btnInsp.dataset.hyInsp);
        return;
      }
      const b = e.target.closest("[data-hy]");
      if (!b) return;
      const a = b.dataset.hy;
      const v = b.dataset.v;
      if (a === "toggle-agenda") { vista.verTodo = !vista.verTodo; render(); return; }
      if (a === "toggle-turno") {
        const s = b.dataset.sede;
        vista.expandTurno = vista.expandTurno || {};
        vista.expandTurno[s] = !vista.expandTurno[s];
        render();
        return;
      }
      if (a === "quien") { vista.quien = true; render(); raiz.querySelector('[data-hy-form="quien"] input')?.focus(); return; }
      if (a === "sede") { vista.sede = v; render(); }
      else if (a === "dia") { vista.dia = v; render(); }
      else if (a === "ver-evento") { vista.sheet = { tipo: "evento", id: b.dataset.id }; render(); }
      else if (a === "ver-fallas-insp") { vista.sheet = { tipo: "fallas", cod: v, eqNom: nombreEq(v) || v, dias: 14 }; render(); }
      else if (a === "ver-fallas-eq") { vista.sheet = { tipo: "fallas", eqNom: v, dias: 7 }; render(); }
      else if (a === "paradas-modal") { vista.sheet = { tipo: "paradas" }; render(); }
      else if (a === "reg-edit") { vista.sheet = null; window.goRegistro?.({ abrir: b.dataset.id }); }
      else if (a === "registro") window.goRegistro?.({ fecha: v || b.dataset.q || N.hoy() });
      else if (a === "reg") { vista.sheet = { tipo: "evento", id: b.dataset.id }; render(); }
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
      else if (a === "ficha") irAFicha(v);
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
