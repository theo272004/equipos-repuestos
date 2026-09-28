// ============================================================================
//  FORMULARIO DE REPORTE DE TURNO
// ============================================================================
//  Cuatro pasos cortos, pensados para el celular:
//    1. El turno: quién reporta, sede, fecha, día o noche y quiénes estuvieron.
//    2. Cómo quedó cada equipo (parte del estado del turno anterior).
//    3. Las novedades: qué pasó, qué se hizo, cuánto tiempo y cómo quedó.
//    4. Revisar y enviar.
//
//  Al enviar se guarda lo mismo que registra la practicante en el Registro
//  diario (colecciones mtto_registros y mtto_estados) y el reporte completo
//  (reportes_turno), que el bot anuncia en el grupo de Telegram. Al final da
//  el texto listo para pegar en WhatsApp, con el formato de siempre.
//
//  Nada se pierde: el borrador se guarda en el celular mientras se escribe, y
//  si no hay señal el reporte queda en cola y se envía al volver a abrir.
//  ¿Ya estaba escrito en WhatsApp? Se pega y se leen equipos y novedades.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const M = window.MTTO;
  const C = M.catalogo;
  const esc = N.esc;
  const K_BORRADOR = "rf-borrador-v1";
  const K_COLA = "rf-cola-v1";

  const ICON = {
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    luna: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    der: '<path d="m9 18 6-6-6-6"/>',
    izq: '<path d="m15 18-6-6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    basura: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    pegar: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    copiar: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    compartir: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    alerta: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    nube: '<path d="M17.5 19a4.5 4.5 0 0 0 .45-8.98A6 6 0 0 0 6.3 9.5 4.5 4.5 0 0 0 7 19h10.5Z"/>',
  };
  const ic = (n, c = "") => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ""}</svg>`;

  const ESTADOS = [
    { v: "Producción", t: "Producción", c: "ok" },
    { v: "Stand by", t: "Stand by", c: "" },
    { v: "Limpieza", t: "Limpieza", c: "vio" },
    { v: "Montaje / cuadre", t: "Montaje", c: "acc" },
    { v: "Mantenimiento", t: "Mantto.", c: "bad" },
  ];
  const TIPOS = ["Correctivo", "Preventivo", "Apoyo a producción", "Mejora / fabricación"];
  const FINAL = [
    { v: "Operativo", t: "Operativo", c: "ok" },
    { v: "Operativo con pendiente", t: "Con pendiente", c: "warn" },
    { v: "Pendiente", t: "No quedó", c: "bad" },
  ];
  const DURACIONES = [15, 30, 60, 120, 240];

  // --------------------------------------------------------------- estado
  function turnoSugerido() {
    // El reporte se escribe al final del turno: de 18 a 22 h es el de día
    // que termina; de 6 a 10 h, el de noche que termina.
    const h = N.horaCO();
    if (h >= 18 && h < 22) return { fecha: N.hoy(), turno: "Día" };
    if (h >= 6 && h < 10) return { fecha: N.sumaDias(N.hoy(), -1), turno: "Noche" };
    const t = N.turnoEnCurso();
    return { fecha: t.fecha, turno: t.turno };
  }
  function nuevo() {
    const q = new URLSearchParams(location.search);
    const t = turnoSugerido();
    return {
      paso: 1,
      fecha: q.get("fecha") || t.fecha,
      turno: q.get("turno") || t.turno,
      sede: q.get("sede") || localStorage.getItem("rf-sede") || "Sede 4",
      por: N.usuario.get(),
      tecnicos: [],
      estados: {},
      estadosCargados: false,
      novedades: [],
      editando: null,
      q: "",
      soloCambios: false,
    };
  }
  let st;
  try { st = JSON.parse(localStorage.getItem(K_BORRADOR) || "null"); } catch (e) { st = null; }
  if (!st || !st.fecha) st = nuevo();
  let enviado = null;
  let pegando = false;
  const guardarBorrador = () => { try { localStorage.setItem(K_BORRADOR, JSON.stringify(st)); } catch (e) {} };

  const equiposSede = (proc) => C.equipos.filter((e) => e.s === st.sede && (!proc || e.proc));
  const areaDe = (eq) => (C.equipos.find((e) => e.s === st.sede && e.eq === eq) || C.equipos.find((e) => e.eq === eq) || {}).ar || (window.MTTO_LECTOR ? window.MTTO_LECTOR.areaDe(eq) : "");
  const claveTurno = (t) => (t === "Día" ? "dia" : "noche");
  const genteTurno = () => {
    const q = window.TURNOS ? window.TURNOS.quienes(st.fecha, claveTurno(st.turno)) : {};
    const s = q[st.sede === "Sede 4" ? "sede4" : "sede2"];
    return s ? s.gente.map((g) => g.nombre) : [];
  };

  // Estado de partida de cada equipo: el último conocido (histórico del chat
  // + lo registrado en la nube antes de este turno)
  async function cargarEstadosBase() {
    const base = {};
    Object.entries(M.hist.ultimoEstado || {}).forEach(([k, e]) => { const [s, eq] = k.split("|"); if (s === st.sede) base[eq] = { e, p: "" }; });
    const c = N.nube();
    if (c) {
      try {
        const snap = await c.db.collection("mtto_estados").where("sede", "==", st.sede).get();
        const orden = (d) => d.fecha + (d.turno === "Día" ? "0" : "1");
        const yo = st.fecha + (st.turno === "Día" ? "0" : "1");
        const docs = [];
        snap.forEach((d) => docs.push(d.data()));
        docs.filter((d) => orden(d) < yo).sort((a, b) => orden(a).localeCompare(orden(b)))
          .forEach((d) => Object.entries(d.estados || {}).forEach(([eq, v]) => { base[eq] = { e: v.e, p: v.p || "" }; }));
      } catch (e) { /* sin nube: se queda con el histórico */ }
    }
    return base;
  }
  async function prepararEstados() {
    if (st.estadosCargados) return;
    const base = await cargarEstadosBase();
    st.base = base;
    st.estados = {};
    equiposSede(true).forEach((e) => { const b = base[e.eq]; st.estados[e.eq] = { e: b && b.e !== "Sin dato" ? b.e : "Stand by", p: b ? b.p || "" : "" }; });
    st.estadosCargados = true;
    guardarBorrador();
  }

  // --------------------------------------------------------------- vistas
  const PASOS = ["Turno", "Equipos", "Novedades", "Enviar"];
  function barraPasos() {
    return `<nav class="rf-pasos" aria-label="Pasos">${PASOS.map((p, i) => `<button type="button" class="rf-paso ${st.paso === i + 1 ? "is-on" : ""} ${st.paso > i + 1 ? "is-hecho" : ""}" data-rf="paso" data-v="${i + 1}"><i>${st.paso > i + 1 ? ic("check") : i + 1}</i><span>${p}</span></button>`).join("")}</nav>`;
  }

  function paso1() {
    const gente = genteTurno();
    const todos = window.PENDIENTES ? [] : (() => {
      const T = window.TURNOS; const s = new Set();
      if (T) { Object.values(T.roster).forEach((sd) => sd.groups.forEach((g) => g.members.forEach((m) => s.add(T.nombre(m))))); T.soporte.forEach((x) => x.members.forEach((m) => s.add(m))); }
      return [...s].sort();
    })();
    if (!st.tecnicos.length && gente.length) st.tecnicos = gente.slice();
    return `<section class="ux-card rf-card">
      <h2 class="rf-h">¿Qué turno vas a reportar?</h2>
      <div class="ux-field"><span>Sede</span><div class="ux-seg rf-seg">${["Sede 4", "Sede 2"].map((s) => `<button type="button" class="${st.sede === s ? "is-on" : ""}" data-rf="sede" data-v="${s}">${s === "Sede 2" ? "Sede 2 (Vía 40)" : s}</button>`).join("")}</div></div>
      <div class="ux-row2">
        <label class="ux-field"><span>Fecha en que empezó el turno</span><input class="ux-input" type="date" data-rf-campo="fecha" value="${esc(st.fecha)}"></label>
        <div class="ux-field"><span>Turno</span><div class="ux-seg rf-seg">${["Día", "Noche"].map((t) => `<button type="button" class="${st.turno === t ? "is-on" : ""}" data-rf="turno" data-v="${t}">${ic(t === "Día" ? "sol" : "luna")}${t === "Día" ? "Día 8–20" : "Noche 20–8"}</button>`).join("")}</div></div>
      </div>
      <label class="ux-field"><span>Quién llena el reporte</span><input class="ux-input" data-rf-campo="por" list="rfGente" value="${esc(st.por)}" placeholder="Tu nombre" autocomplete="name"><datalist id="rfGente">${todos.map((n) => `<option value="${esc(n)}">`).join("")}</datalist></label>
      <div class="ux-field"><span>Técnicos del turno</span>
        <div class="ux-chips">${[...new Set([...gente, ...st.tecnicos])].map((n) => `<button type="button" class="ux-chip ${st.tecnicos.includes(n) ? "is-on" : ""}" data-rf="tecnico" data-v="${esc(n)}">${st.tecnicos.includes(n) ? ic("check") : ""}${esc(n.split(" ").slice(0, 2).join(" "))}</button>`).join("") || `<span class="ux-small ux-mute">No hay cuadro de turnos para esa sede y fecha.</span>`}</div>
        <small>Según el cuadro de turnos. Toca para quitar o poner.</small>
      </div>
    </section>
    <section class="ux-card rf-card rf-pegar">
      <div><h3 class="rf-h3">${ic("pegar")}¿Ya lo escribiste en WhatsApp?</h3><p class="ux-small ux-mute">Pégalo y se leen solos los equipos y las novedades. Después solo revisas.</p></div>
      <button class="ux-btn" type="button" data-rf="pegar">Pegar reporte</button>
    </section>`;
  }

  function paso2() {
    const eqs = equiposSede(true);
    const q = N.plano(st.q);
    const porArea = new Map();
    eqs.forEach((e) => {
      if (q && !N.plano(e.eq).includes(q)) return;
      const b0 = st.base && st.base[e.eq];
      const cambio = b0 && b0.e !== "Sin dato" && b0.e !== st.estados[e.eq]?.e;
      if (st.soloCambios && !cambio) return;
      if (!porArea.has(e.ar)) porArea.set(e.ar, []);
      porArea.get(e.ar).push(e);
    });
    const cuenta = {};
    Object.values(st.estados).forEach((v) => { cuenta[v.e] = (cuenta[v.e] || 0) + 1; });
    return `<section class="ux-card rf-card">
      <h2 class="rf-h">¿Cómo quedaron los equipos?</h2>
      <p class="ux-small ux-mute" style="margin:-4px 0 12px">Viene marcado como estaban en el turno anterior. Cambia solo lo que cambió; en Producción puedes escribir el producto.</p>
      <div class="rf-resumen">${ESTADOS.map((e) => `<span class="ux-pill ux-pill--${e.c || "line"}"><i></i>${e.t} ${cuenta[e.v] || 0}</span>`).join("")}</div>
      <div class="rf-filtro">
        <label class="ux-searchbox" style="flex:1">${ic("buscar")}<input class="ux-input" type="search" data-rf-campo="q" value="${esc(st.q)}" placeholder="Buscar equipo"></label>
        <button class="ux-chip ${st.soloCambios ? "is-on" : ""}" type="button" data-rf="solo-cambios">Solo lo que cambió</button>
      </div>
    </section>
    ${[...porArea.entries()].map(([ar, lista]) => `<section class="ux-card rf-card rf-area">
      <h3 class="rf-area__t">${esc(ar)}</h3>
      ${lista.map((e) => {
        const v = st.estados[e.eq] || { e: "Stand by", p: "" };
        const antes = st.base && st.base[e.eq] ? st.base[e.eq].e : "";
        return `<div class="rf-eq">
          <div class="rf-eq__n"><b>${esc(e.eq)}</b>${antes && antes !== v.e ? `<small>antes: ${esc(antes)}</small>` : ""}</div>
          <div class="rf-eq__op">${ESTADOS.map((s) => `<button type="button" class="rf-op rf-op--${s.c || "neutro"} ${v.e === s.v ? "is-on" : ""}" data-rf="estado" data-eq="${esc(e.eq)}" data-v="${esc(s.v)}">${s.t}</button>`).join("")}</div>
          ${v.e === "Producción" || v.e === "Mantenimiento" ? `<input class="ux-input rf-eq__p" data-rf-prod="${esc(e.eq)}" value="${esc(v.p)}" placeholder="${v.e === "Producción" ? "Producto (opcional)" : "Qué se le está haciendo (opcional)"}">` : ""}
        </div>`;
      }).join("")}
    </section>`).join("") || `<section class="ux-card rf-card"><p class="ux-mute">Nada coincide con la búsqueda.</p></section>`}`;
  }

  function tarjetaNovedad(n, i) {
    const f = FINAL.find((x) => x.v === n.ef) || FINAL[0];
    return `<article class="rf-nov">
      <div class="rf-nov__top"><b>${esc(n.eq)}</b><span class="ux-pill ux-pill--${f.c}"><i></i>${f.t}</span></div>
      <p>${esc(n.de)}</p>
      <div class="rf-nov__pie"><span class="ux-small ux-mute">${esc(n.tp)}${n.min ? ` · ${n.min >= 60 ? (n.min / 60).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " h" : n.min + " min"}` : ""}${n.det ? " · paró la máquina" : ""}${n.frep ? " · falta repuesto" : ""}</span>
        <span><button class="ux-btn ux-btn--sm ux-btn--ghost" type="button" data-rf="editar" data-v="${i}">${ic("editar")}Editar</button><button class="ux-btn ux-btn--sm ux-btn--ghost ux-btn--danger" type="button" data-rf="quitar" data-v="${i}" aria-label="Quitar">${ic("basura")}</button></span></div>
    </article>`;
  }

  function paso3() {
    return `<section class="ux-card rf-card">
      <h2 class="rf-h">Novedades del turno</h2>
      <p class="ux-small ux-mute" style="margin:-4px 0 12px">Cada falla, ajuste, apoyo o trabajo que se hizo. Si algo quedó pendiente, márcalo: aparece en Pendientes para el siguiente turno.</p>
      <div class="rf-novs">${st.novedades.map(tarjetaNovedad).join("") || `<div class="ux-empty" style="padding:18px"><p>Todavía no hay novedades. Si el turno fue tranquilo, puedes enviar el reporte así.</p></div>`}</div>
      <div class="rf-acc"><button class="ux-btn ux-btn--primary ux-btn--lg ux-btn--block" type="button" data-rf="nueva">${ic("mas")}Agregar novedad</button><button class="ux-btn ux-btn--block" type="button" data-rf="pegar">${ic("pegar")}Pegar reporte de WhatsApp</button></div>
    </section>`;
  }

  function editorNovedad() {
    const n = st.editando === "nueva" ? { eq: "", tp: "Correctivo", cat: "Máquina", de: "", min: null, det: false, ef: "Operativo", rep: "", frep: 0, pend: "" } : { ...st.novedades[st.editando] };
    const eqs = [...new Set(C.equipos.filter((e) => e.s === st.sede).map((e) => e.eq))].sort();
    return `<div class="ux-backdrop" data-rf="cerrar-ed"></div>
    <aside class="ux-sheet" role="dialog" aria-label="Novedad">
      <header class="ux-sheet__head"><div><h3>${st.editando === "nueva" ? "Nueva novedad" : "Editar novedad"}</h3><p>${esc(st.sede)} · turno de ${st.turno === "Día" ? "día" : "noche"}</p></div><button class="ux-x" type="button" data-rf="cerrar-ed" aria-label="Cerrar">${ic("x")}</button></header>
      <form class="ux-sheet__body ux-form" data-rf-form="novedad">
        <label class="ux-field"><span>Equipo *</span><input class="ux-input" name="eq" list="rfEqs" value="${esc(n.eq)}" required placeholder="Ej. Blister 3, Marzio 5, Iluminación…" autocomplete="off"><datalist id="rfEqs">${eqs.map((e) => `<option value="${esc(e)}">`).join("")}</datalist></label>
        <div class="ux-field"><span>Tipo</span><div class="ux-chips">${TIPOS.map((t) => `<label class="ux-chip rf-radio ${n.tp === t ? "is-on" : ""}"><input type="radio" name="tp" value="${esc(t)}" ${n.tp === t ? "checked" : ""}>${esc(t)}</label>`).join("")}</div></div>
        <div class="ux-field"><span>¿De dónde vino?</span><div class="ux-chips">${C.categorias.map((t) => `<label class="ux-chip rf-radio ${n.cat === t ? "is-on" : ""}" title="${esc((C.categoriasAyuda || {})[t] || "")}"><input type="radio" name="cat" value="${esc(t)}" ${n.cat === t ? "checked" : ""}>${esc(t)}</label>`).join("")}</div></div>
        <label class="ux-field"><span>Qué pasó y qué se hizo *</span><textarea class="ux-textarea" name="de" rows="4" required placeholder="Ej. Se atiende llamado porque el troquel se pegaba; se cambia y se lleva al taller.">${esc(n.de)}</textarea></label>
        <div class="ux-field"><span>¿Cuánto tiempo?</span><div class="ux-chips">${DURACIONES.map((m) => `<label class="ux-chip rf-radio ${Number(n.min) === m ? "is-on" : ""}"><input type="radio" name="minr" value="${m}" ${Number(n.min) === m ? "checked" : ""}>${m >= 60 ? m / 60 + " h" : m + " min"}</label>`).join("")}<input class="ux-input rf-min" type="number" min="0" step="5" name="min" value="${n.min && !DURACIONES.includes(Number(n.min)) ? esc(n.min) : ""}" placeholder="otro (min)"></div></div>
        <label class="rf-check"><input type="checkbox" name="det" ${n.det ? "checked" : ""}> La máquina estuvo parada por esto</label>
        <div class="ux-field"><span>¿Cómo quedó?</span><div class="ux-seg rf-seg">${FINAL.map((f) => `<label class="rf-radio-seg ${n.ef === f.v ? "is-on" : ""}"><input type="radio" name="ef" value="${esc(f.v)}" ${n.ef === f.v ? "checked" : ""}>${esc(f.t)}</label>`).join("")}</div></div>
        <label class="ux-field rf-pend ${n.ef === "Operativo" ? "ux-hide" : ""}"><span>¿Qué quedó pendiente?</span><input class="ux-input" name="pend" value="${esc(n.pend || "")}" placeholder="Ej. cambiar la correa cuando llegue el repuesto"></label>
        <div class="ux-row2">
          <label class="ux-field"><span>Repuesto usado o que se necesita</span><input class="ux-input" name="rep" value="${esc(n.rep || "")}" placeholder="Opcional"></label>
          <label class="rf-check" style="align-self:end;min-height:42px"><input type="checkbox" name="frep" ${n.frep ? "checked" : ""}> Falta el repuesto</label>
        </div>
      </form>
      <footer class="ux-sheet__foot"><button class="ux-btn" type="button" data-rf="cerrar-ed">Cancelar</button><button class="ux-btn ux-btn--primary" type="button" data-rf="guardar-nov">${ic("check")}Guardar novedad</button></footer>
    </aside>`;
  }

  function hojaPegar() {
    return `<div class="ux-backdrop" data-rf="cerrar-pegar"></div>
    <aside class="ux-sheet" role="dialog" aria-label="Pegar reporte">
      <header class="ux-sheet__head"><div><h3>Pegar reporte de WhatsApp</h3><p>Mantén presionado el mensaje en WhatsApp → Copiar, y pégalo aquí.</p></div><button class="ux-x" type="button" data-rf="cerrar-pegar" aria-label="Cerrar">${ic("x")}</button></header>
      <div class="ux-sheet__body"><textarea class="ux-textarea" data-rf-pegado rows="12" placeholder="*REPORTE DE TURNO GRUPO 1 SEDE 4*&#10;BOSCH: nifedipino&#10;NJP2: stand by&#10;…&#10;*NOVEDADES*&#10;BLISTER 3: se cambia troquel…" style="font-family:var(--mono);font-size:13px"></textarea></div>
      <footer class="ux-sheet__foot"><button class="ux-btn" type="button" data-rf="cerrar-pegar">Cancelar</button><button class="ux-btn ux-btn--primary" type="button" data-rf="leer">Leer reporte</button></footer>
    </aside>`;
  }

  function paso4() {
    const cambio = (eq, v) => st.base && st.base[eq] && st.base[eq].e !== "Sin dato" && st.base[eq].e !== v.e;
    const cambios = Object.entries(st.estados).filter(([eq, v]) => cambio(eq, v));
    const pend = st.novedades.filter((n) => n.ef !== "Operativo");
    const parados = Object.entries(st.estados).filter(([, v]) => v.e === "Mantenimiento");
    return `<section class="ux-card rf-card">
      <h2 class="rf-h">Revisa y envía</h2>
      <dl class="rf-rev">
        <div><dt>Turno</dt><dd>${esc(st.sede)} · ${st.turno === "Día" ? "día" : "noche"} del ${esc(N.fmt.fecha(st.fecha))}</dd></div>
        <div><dt>Reporta</dt><dd>${esc(st.por || "— falta tu nombre —")}</dd></div>
        <div><dt>Técnicos</dt><dd>${esc(st.tecnicos.map((n) => n.split(" ").slice(0, 2).join(" ")).join(", ") || "—")}</dd></div>
        <div><dt>Equipos</dt><dd>${Object.values(st.estados).filter((v) => v.e === "Producción").length} en producción · ${parados.length} en mantenimiento · ${cambios.length} cambiaron</dd></div>
        <div><dt>Novedades</dt><dd>${st.novedades.length}${pend.length ? ` · <b>${pend.length} con pendiente</b>` : ""}</dd></div>
      </dl>
      ${!st.por ? `<p class="ux-note ux-note--warn">${ic("alerta")}<span>Falta quién llena el reporte (paso 1).</span></p>` : ""}
      <button class="ux-btn ux-btn--primary ux-btn--lg ux-btn--block" type="button" data-rf="enviar" ${st.por ? "" : "disabled"}>${ic("check")}Enviar reporte</button>
      <p class="ux-small ux-mute" style="text-align:center;margin:10px 0 0">Queda en el Registro diario y en Pendientes, y se avisa en el grupo de Telegram.</p>
    </section>
    <section class="ux-card rf-card"><h3 class="rf-h3">Así se verá en WhatsApp</h3><pre class="rf-wa">${esc(textoWhatsApp())}</pre></section>`;
  }

  function pantallaEnviado() {
    const e = enviado;
    return `<section class="ux-card rf-card rf-listo">
      <span class="rf-listo__ico ${e.enCola ? "is-cola" : ""}">${ic(e.enCola ? "reloj" : "check", "ic--lg")}</span>
      <h2 class="rf-h">${e.enCola ? "Guardado en este celular" : "¡Reporte enviado!"}</h2>
      <p class="ux-mute">${e.enCola ? "No hay conexión con la nube ahora. Se enviará solo la próxima vez que abras este formulario con señal." : `${e.novedades} ${e.novedades === 1 ? "novedad quedó" : "novedades quedaron"} en el Registro diario. El bot lo anunciará en el grupo en unos minutos.`}</p>
      <div class="rf-acc">
        <button class="ux-btn ux-btn--primary ux-btn--lg ux-btn--block" type="button" data-rf="copiar-wa">${ic("copiar")}Copiar texto para WhatsApp</button>
        <a class="ux-btn ux-btn--block" href="https://wa.me/?text=${encodeURIComponent(e.texto)}" target="_blank" rel="noopener">${ic("compartir")}Compartir por WhatsApp</a>
        <a class="ux-btn ux-btn--block" href="./?v=registro&fecha=${encodeURIComponent(e.fecha)}">Ver en el Registro diario</a>
        <button class="ux-btn ux-btn--ghost ux-btn--block" type="button" data-rf="otro">Llenar otro reporte</button>
      </div>
    </section>`;
  }

  function render() {
    const raiz = document.getElementById("rfRoot");
    const cola = leerCola();
    if (enviado) { raiz.innerHTML = pantallaEnviado(); return; }
    const cuerpo = st.paso === 1 ? paso1() : st.paso === 2 ? paso2() : st.paso === 3 ? paso3() : paso4();
    raiz.innerHTML = `
      ${cola.length ? `<p class="ux-note ux-note--warn">${ic("nube")}<span>${cola.length} ${cola.length === 1 ? "reporte guardado" : "reportes guardados"} en este celular esperando conexión. <button class="ux-link" type="button" data-rf="reintentar">Enviar ahora</button></span></p>` : ""}
      <div class="rf-cab"><p class="ux-eyebrow">${ic(st.turno === "Día" ? "sol" : "luna")}${esc(st.sede)} · turno de ${st.turno === "Día" ? "día" : "noche"} · ${esc(N.fmt.corta(st.fecha))}</p>${barraPasos()}</div>
      <div class="rf-cuerpo">${cuerpo}</div>
      <div class="rf-nav">
        ${st.paso > 1 ? `<button class="ux-btn ux-btn--lg" type="button" data-rf="atras">${ic("izq")}Atrás</button>` : `<button class="ux-btn ux-btn--lg ux-btn--ghost" type="button" data-rf="empezar">Empezar de nuevo</button>`}
        ${st.paso < 4 ? `<button class="ux-btn ux-btn--primary ux-btn--lg" type="button" data-rf="siguiente">Siguiente${ic("der")}</button>` : ""}
      </div>
      <div id="rfHoja">${st.editando !== null && st.editando !== undefined ? editorNovedad() : pegando ? hojaPegar() : ""}</div>`;
  }

  // ------------------------------------------------------------ WhatsApp
  function textoWhatsApp() {
    const [a, m, d] = st.fecha.split("-");
    const l = [`*REPORTE DE TURNO ${st.turno === "Día" ? "DÍA" : "NOCHE"} · ${st.sede.toUpperCase()}*`, `*${d}/${m}/${a}*${st.por ? ` · ${st.por.split(" ").slice(0, 2).join(" ")}` : ""}`];
    if (st.tecnicos.length) l.push(`Técnicos: ${st.tecnicos.map((n) => n.split(" ").slice(0, 2).join(" ")).join(", ")}`);
    l.push("------------------------------", "", "*EQUIPOS*");
    Object.entries(st.estados).forEach(([eq, v]) => { if (v.e && v.e !== "Sin dato") l.push(`*•${eq.toUpperCase()}:* ${v.e === "Producción" ? v.p || "producción" : v.e.toLowerCase()}${v.e === "Mantenimiento" && v.p ? " — " + v.p : ""}`); });
    if (st.novedades.length) {
      l.push("", "*NOVEDADES*");
      st.novedades.forEach((n) => {
        const t = n.min ? ` (${n.min >= 60 ? (n.min / 60).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + " h" : n.min + " min"})` : "";
        const fin = n.ef === "Operativo" ? " Queda operativo." : n.ef === "Operativo con pendiente" ? ` Operativo, pendiente: ${n.pend || "ver detalle"}.` : ` ⚠ Pendiente: ${n.pend || "no quedó operativo"}.`;
        l.push(`*${n.eq.toUpperCase()}:* ${n.de.trim().replace(/\.$/, "")}.${t}${fin}${n.frep ? " (Falta repuesto" + (n.rep ? ": " + n.rep : "") + ")" : ""}`);
      });
    }
    return l.join("\n");
  }

  // --------------------------------------------------------------- enviar
  function leerCola() { try { return JSON.parse(localStorage.getItem(K_COLA) || "[]"); } catch (e) { return []; } }
  function guardarCola(c) { try { localStorage.setItem(K_COLA, JSON.stringify(c)); } catch (e) {} }

  function armarEnvio() {
    const ahora = new Date().toISOString();
    const rid = `rf-${st.fecha}-${st.turno === "Día" ? "d" : "n"}-${st.sede.replace(/\s/g, "")}-${Date.now().toString(36)}`;
    const regs = st.novedades.map((n, i) => ({
      id: `F${Date.now().toString(36)}${i}`, f: st.fecha, t: st.turno, s: st.sede, eq: n.eq, ar: areaDe(n.eq),
      cat: n.cat, tp: n.tp, fa: "", de: n.pend && n.ef !== "Operativo" ? `${n.de.trim()} Pendiente: ${n.pend}` : n.de.trim(), ac: "",
      hi: "", hf: "", min: n.min || null, det: n.det ? 1 : null, ef: n.ef, rep: n.rep || "", frep: n.frep ? 1 : 0,
      tec: st.tecnicos.join(", "), ot: "", por: st.por, src: "formulario", rid, createdAt: ahora, updatedAt: ahora,
    }));
    const estados = {};
    Object.entries(st.estados).forEach(([eq, v]) => { estados[eq] = { e: v.e, p: v.p || "" }; });
    const idEst = `${st.fecha}|${st.turno}|${st.sede}`;
    const docEstados = { id: idEst, fecha: st.fecha, turno: st.turno, sede: st.sede, estados, por: st.por, fuente: "formulario", updatedAt: ahora };
    const reporte = { id: rid, fecha: st.fecha, turno: st.turno, sede: st.sede, por: st.por, tecnicos: st.tecnicos, estados, novedades: regs.map((r) => ({ id: r.id, eq: r.eq, tp: r.tp, cat: r.cat, de: r.de, min: r.min, ef: r.ef, frep: r.frep })), texto: textoWhatsApp(), anunciado: false, createdAt: ahora };
    return { rid, regs, docEstados, reporte };
  }

  async function subir(envio) {
    const c = N.nube();
    if (!c || !navigator.onLine) throw new Error("sin conexión");
    const b = c.db.batch();
    const limpio = (o) => JSON.parse(JSON.stringify(o));
    b.set(c.db.collection("reportes_turno").doc(envio.rid), limpio(envio.reporte));
    b.set(c.db.collection("mtto_estados").doc(envio.docEstados.id.replace(/\|/g, "_").replace(/\s/g, "")), limpio(envio.docEstados));
    envio.regs.forEach((r) => b.set(c.db.collection("mtto_registros").doc(r.id), limpio(r)));
    // Si la nube no contesta en 8 s (señal mala), se deja en cola (Firestore
    // también lo guarda en el celular y lo sube solo cuando vuelve la señal)
    await Promise.race([b.commit(), new Promise((_, mal) => setTimeout(() => mal(new Error("tiempo agotado")), 8000))]);
  }

  // Para que la app en este mismo equipo lo muestre enseguida (y lo reintente)
  function copiarAlRegistroLocal(envio) {
    try {
      const reg = JSON.parse(localStorage.getItem("mtto-registros-v1") || "{}");
      envio.regs.forEach((r) => { reg[r.id] = { ...r, _pend: 1 }; });
      localStorage.setItem("mtto-registros-v1", JSON.stringify(reg));
      const est = JSON.parse(localStorage.getItem("mtto-estados-v1") || "{}");
      est[envio.docEstados.id] = { ...envio.docEstados, _pend: 1 };
      localStorage.setItem("mtto-estados-v1", JSON.stringify(est));
    } catch (e) {}
  }

  async function enviar() {
    const btn = document.querySelector('[data-rf="enviar"]');
    if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
    const envio = armarEnvio();
    N.usuario.set(st.por);
    let enCola = false;
    try { await subir(envio); } catch (e) {
      console.warn("[Formulario] sin nube:", e);
      guardarCola([...leerCola(), envio]);
      enCola = true;
    }
    copiarAlRegistroLocal(envio);
    enviado = { enCola, novedades: envio.regs.length, texto: envio.reporte.texto, fecha: st.fecha };
    localStorage.removeItem(K_BORRADOR);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function vaciarCola() {
    const cola = leerCola();
    if (!cola.length) return;
    const quedan = [];
    for (const envio of cola) { try { await subir(envio); } catch (e) { quedan.push(envio); } }
    guardarCola(quedan);
    if (quedan.length < cola.length) toast(`${cola.length - quedan.length} ${cola.length - quedan.length === 1 ? "reporte guardado se envió" : "reportes guardados se enviaron"}`);
    render();
  }

  function toast(txt, tipo = "ok") {
    const caja = document.getElementById("uxToasts");
    const t = document.createElement("div");
    t.className = `ux-toast ux-toast--${tipo}`;
    t.innerHTML = `${ic(tipo === "ok" ? "check" : "alerta")}<span>${txt}</span>`;
    caja.appendChild(t);
    setTimeout(() => { t.classList.add("is-out"); setTimeout(() => t.remove(), 260); }, 3500);
  }

  // ---------------------------------------------------------- pegar chat
  function leerPegado(texto) {
    const r = window.MTTO_LECTOR ? window.MTTO_LECTOR.leer(texto) : null;
    if (!r) return;
    if (r.sede && r.sede !== st.sede) { st.sede = r.sede; st.estadosCargados = false; }
    (r.estados || []).forEach((e) => { if (e.estado && e.estado !== "Sin dato") st.estados[e.eq] = { e: e.estado, p: e.estado === "Producción" ? e.producto || "" : "" }; });
    (r.novedades || []).forEach((n) => st.novedades.push({ eq: n.eq, tp: TIPOS.includes(n.tp) ? n.tp : "Correctivo", cat: n.cat || "Máquina", de: n.de, min: n.min || null, det: false, ef: n.ef || "Operativo", rep: "", frep: n.frep || 0, pend: "" }));
    toast(`Leí ${(r.estados || []).length} equipos y ${(r.novedades || []).length} novedades. Revísalas.`);
  }

  // --------------------------------------------------------------- eventos
  async function irAPaso(n) {
    if (n >= 2) await prepararEstados();
    st.paso = Math.max(1, Math.min(4, n));
    guardarBorrador();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-rf]");
    if (!b) return;
    const a = b.dataset.rf;
    const v = b.dataset.v;
    if (a === "paso") irAPaso(Number(v));
    else if (a === "siguiente") irAPaso(st.paso + 1);
    else if (a === "atras") irAPaso(st.paso - 1);
    else if (a === "sede") { st.sede = v; localStorage.setItem("rf-sede", v); st.estadosCargados = false; st.tecnicos = []; guardarBorrador(); render(); }
    else if (a === "turno") { st.turno = v; st.estadosCargados = false; st.tecnicos = []; guardarBorrador(); render(); }
    else if (a === "tecnico") { st.tecnicos = st.tecnicos.includes(v) ? st.tecnicos.filter((x) => x !== v) : [...st.tecnicos, v]; guardarBorrador(); render(); }
    else if (a === "estado") { st.estados[b.dataset.eq] = { e: v, p: v === "Producción" ? (st.estados[b.dataset.eq] || {}).p || "" : "" }; guardarBorrador(); render(); }
    else if (a === "solo-cambios") { st.soloCambios = !st.soloCambios; render(); }
    else if (a === "nueva") { st.editando = "nueva"; render(); setTimeout(() => document.querySelector('[data-rf-form="novedad"] [name="eq"]')?.focus(), 80); }
    else if (a === "editar") { st.editando = Number(v); render(); }
    else if (a === "quitar") { if (confirm("¿Quitar esta novedad?")) { st.novedades.splice(Number(v), 1); guardarBorrador(); render(); } }
    else if (a === "cerrar-ed") { st.editando = null; render(); }
    else if (a === "guardar-nov") {
      const f = document.querySelector('[data-rf-form="novedad"]');
      if (!f.reportValidity()) return;
      const d = new FormData(f);
      const min = Number(d.get("min")) || Number(d.get("minr")) || null;
      const n = { eq: String(d.get("eq")).trim(), tp: d.get("tp") || "Correctivo", cat: d.get("cat") || "Máquina", de: String(d.get("de")).trim(), min, det: !!d.get("det"), ef: d.get("ef") || "Operativo", pend: String(d.get("pend") || "").trim(), rep: String(d.get("rep") || "").trim(), frep: d.get("frep") ? 1 : 0 };
      if (st.editando === "nueva") st.novedades.push(n); else st.novedades[st.editando] = n;
      st.editando = null;
      guardarBorrador();
      render();
      toast("Novedad guardada");
    }
    else if (a === "pegar") { pegando = true; render(); setTimeout(() => document.querySelector("[data-rf-pegado]")?.focus(), 80); }
    else if (a === "cerrar-pegar") { pegando = false; render(); }
    else if (a === "leer") {
      const t = document.querySelector("[data-rf-pegado]").value;
      if (!t.trim()) return;
      await prepararEstados();
      leerPegado(t);
      if (!st.estadosCargados) await prepararEstados();
      pegando = false;
      st.paso = 3;
      guardarBorrador();
      render();
    }
    else if (a === "enviar") enviar();
    else if (a === "copiar-wa") navigator.clipboard?.writeText(enviado.texto).then(() => toast("Texto copiado: pégalo en el grupo"), () => prompt("Copia el texto:", enviado.texto));
    else if (a === "otro") { enviado = null; st = nuevo(); guardarBorrador(); render(); }
    else if (a === "empezar") { if (confirm("¿Borrar lo escrito y empezar de nuevo?")) { st = nuevo(); guardarBorrador(); render(); } }
    else if (a === "reintentar") vaciarCola();
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.rfCampo) {
      st[t.dataset.rfCampo] = t.value;
      if (t.dataset.rfCampo === "fecha") { st.estadosCargados = false; st.tecnicos = []; }
      guardarBorrador();
      if (t.dataset.rfCampo === "q") { clearTimeout(t._t); t._t = setTimeout(() => { render(); const q = document.querySelector('[data-rf-campo="q"]'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 250); }
    } else if (t.dataset.rfProd) { (st.estados[t.dataset.rfProd] = st.estados[t.dataset.rfProd] || { e: "Producción", p: "" }).p = t.value; guardarBorrador(); }
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.rfCampo === "fecha") render();
    if (t.form && t.form.matches('[data-rf-form="novedad"]') && t.type === "radio") {
      t.form.querySelectorAll(`input[name="${t.name}"]`).forEach((x) => x.closest("label").classList.toggle("is-on", x.checked));
      if (t.name === "minr") t.form.elements.min.value = "";
      if (t.name === "ef") t.form.querySelector(".rf-pend").classList.toggle("ux-hide", t.value === "Operativo");
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && (st.editando !== null || pegando)) { st.editando = null; pegando = false; render(); } });
  window.addEventListener("online", vaciarCola);

  st.editando = null;
  render();
  vaciarCola();
})();
