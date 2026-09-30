// ============================================================================
//  CONEXIÓN Y AJUSTES
// ============================================================================
//  Todo lo que antes había que preguntarle a quien montó la app:
//    - Quién usa este equipo (su nombre queda en lo que registra).
//    - Si la nube (Firebase) acepta cada colección, y qué hacer si no.
//    - La "clave del taller" opcional para proteger los datos.
//    - Qué hace el bot de Telegram solo y qué comandos entiende.
//    - El enlace y el código QR del formulario de reporte de turno.
//    - De cuándo son los datos del chat y cómo se actualizan.
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N.esc;
  const ic = (n, c) => window.IC(n, c);
  const URL_APP = "https://theo272004.github.io/equipos-repuestos/";
  const CONSOLA = "https://console.firebase.google.com/project/mantenimiento-f405b/firestore/rules";
  const SECRETOS = "https://github.com/theo272004/equipos-repuestos/settings/secrets/actions";
  const vista = { probando: false };

  const TXT_ESTADO = { ok: "Funciona", denegado: "La nube la rechaza", error: "Error al conectar", "sin-nube": "Sin nube" };
  function marcaEstado(e) {
    const clase = e === "ok" ? "is-ok" : e === "denegado" ? "is-bad" : e ? "is-warn" : "";
    return `<span class="aj-est ${clase}" title="${esc(TXT_ESTADO[e] || "Sin probar")}">${ic(e === "ok" ? "check" : e === "denegado" ? "x" : e ? "alerta" : "reloj")}</span>`;
  }

  function cardUsuario() {
    const n = N.usuario.get();
    const gente = window.PENDIENTES ? window.PENDIENTES.gente() : [];
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("usuario")}Quién usa este equipo</h2><p class="ux-card__sub">Tu nombre queda en lo que registres: novedades, pendientes, solicitudes y gastos.</p></div>
        ${n ? `<span class="ux-av ux-av--${N.tono(n)}" style="width:40px;height:40px;font-size:14px">${esc(N.iniciales(n).toUpperCase())}</span>` : ""}</div>
      <form class="hy-quien__f" data-aj-form="usuario"><input class="ux-input" name="n" list="ajGente" value="${esc(n)}" placeholder="Escribe o elige tu nombre"><datalist id="ajGente">${gente.map((g) => `<option value="${esc(g)}">`).join("")}</datalist><button class="ux-btn ux-btn--primary" type="submit">Guardar</button></form>
    </section>`;
  }

  function cardNube() {
    const cloud = window.CLOUD && window.CLOUD.enabled;
    const filas = N.COLECCIONES.map((c) => {
      const p = N.permisos[c.id];
      return `<div class="aj-col__row">${marcaEstado(p && p.estado)}<span><code>${esc(c.id)}</code><small>${esc(c.uso)}</small></span><span class="ux-small ${p && p.estado === "ok" ? "ux-mute" : ""}">${p ? esc(TXT_ESTADO[p.estado] || p.estado) + (p.detalle && p.estado !== "ok" && p.estado !== "denegado" ? ` (${esc(p.detalle)})` : "") : "sin probar"}</span></div>`;
    }).join("");
    const denegadas = N.COLECCIONES.filter((c) => (N.permisos[c.id] || {}).estado === "denegado");
    const cuota = Object.values(N.permisos).some((p) => /resource-exhausted/.test(p.detalle || ""));
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("nube")}Nube (Firebase)</h2><p class="ux-card__sub">${cloud ? "Proyecto <b>mantenimiento-f405b</b>. Cada colección es un tipo de dato que se comparte con todo el taller." : "Firebase no está configurado: todo queda solo en este navegador."}</p></div>
        <button class="ux-btn ux-btn--sm" type="button" data-aj="probar" ${vista.probando ? "disabled" : ""}>${ic("reloj", "ic--sm")}${vista.probando ? "Probando…" : "Probar de nuevo"}</button></div>
      ${cuota ? `<div class="ux-note ux-note--warn" style="margin-bottom:12px">${ic("alerta")}<span><b>Se agotó la cuota gratis de hoy.</b> El plan gratuito de Firebase permite 50.000 lecturas al día; se reinicia a medianoche de EE. UU. (≈ 2:00 a. m. en Colombia). Mientras tanto la app sigue con la copia de este equipo y guarda lo nuevo para subirlo después.</span></div>` : ""}
      ${denegadas.length ? `<div class="ux-note ux-note--bad" style="margin-bottom:12px">${ic("alerta")}<span>La nube rechaza <b>${denegadas.length}</b> ${denegadas.length === 1 ? "colección" : "colecciones"} (${denegadas.map((c) => esc(c.id)).join(", ")}). Lo de ahí se guarda <b>solo en este equipo</b> y no lo ve el resto del taller. Se arregla publicando las reglas nuevas (dos minutos):</span></div>
        <ol class="aj-steps" style="margin-bottom:14px">
          <li>Toca <b>Copiar las reglas</b>.</li>
          <li>Abre la <a class="ux-link" href="${CONSOLA}" target="_blank" rel="noopener">consola de Firebase → Firestore → Reglas</a> con la cuenta dueña del proyecto.</li>
          <li>Borra lo que hay, pega y pulsa <b>Publicar</b>. Vuelve aquí y toca <b>Probar de nuevo</b>.</li>
        </ol>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px"><button class="ux-btn ux-btn--primary" type="button" data-aj="copiar-reglas">${ic("copiar")}Copiar las reglas</button><a class="ux-btn" href="${CONSOLA}" target="_blank" rel="noopener">${ic("enlace")}Abrir la consola de Firebase</a></div>` : ""}
      <div class="aj-col">${filas}</div>
    </section>`;
  }

  function cardClave() {
    const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
    const u = auth && auth.currentUser;
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("escudo")}Clave del taller <small>opcional</small></h2>
        <p class="ux-card__sub">Hoy cualquiera que conozca el proyecto de Firebase puede leer los datos. Con una clave compartida del taller solo entra quien la tenga (se pide una vez por celular). Primero hay que activarla en Firebase: ver <a class="ux-link" href="https://github.com/theo272004/equipos-repuestos/blob/master/docs/FIREBASE.md" target="_blank" rel="noopener">docs/FIREBASE.md</a>.</p></div></div>
      ${!auth ? `<p class="ux-small ux-mute">La librería de inicio de sesión no cargó (¿sin internet?).</p>`
        : u ? `<div class="ux-note ux-note--ok">${ic("check")}<span>Este equipo tiene la clave del taller (<b>${esc(u.email || "cuenta del taller")}</b>).</span></div><div style="margin-top:10px"><button class="ux-btn ux-btn--sm ux-btn--danger" type="button" data-aj="salir">Quitar la clave de este equipo</button></div>`
        : `<form class="ux-form" data-aj-form="clave" style="max-width:520px"><div class="ux-row2"><label class="ux-field"><span>Correo del taller</span><input class="ux-input" name="email" type="email" autocomplete="username" placeholder="taller@…" required></label><label class="ux-field"><span>Clave</span><input class="ux-input" name="clave" type="password" autocomplete="current-password" required></label></div><div><button class="ux-btn" type="submit">${ic("escudo")}Guardar la clave en este equipo</button></div><p class="ux-small ux-mute" data-aj-msg></p></form>`}
    </section>`;
  }

  function cardBot() {
    const cmds = [
      ["/menu", "Botones con todo lo demás"], ["/hoy", "Así va el día"], ["/pendientes", "Lo abierto; ✅ para cerrar"], ["/parados", "Equipos en mantenimiento"],
      ["/turno", "Quién está de turno"], ["/stock 6204", "Existencia y estante"], ["/pedir 6204 x2 para Blister 3", "Pedido a Almacén"],
      ["/falla Blister 3: se pega el PVC", "Falla al Registro diario"], ["/pendiente …", "Anotar un pendiente"], ["/tarea …", "Crear una tarea"],
      ["/falta …", "Falta un repuesto"], ["/presupuesto", "Cómo va el gasto"], ["/reporte", "Enlace al formulario"],
    ];
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("telegram")}Bot de Telegram</h2><p class="ux-card__sub">Corre en GitHub cada ~5 minutos; un comando puede tardar hasta 5 minutos en responderse.</p></div>
        <a class="ux-btn ux-btn--sm" href="${SECRETOS}" target="_blank" rel="noopener">${ic("ajustes", "ic--sm")}Secretos en GitHub</a></div>
      <div class="ux-grid ux-grid--2">
        <div class="ux-stack" style="gap:8px">
          <p class="ux-label">Lo que manda solo</p>
          <ul class="ux-tl">
            <li><span class="ux-tl__h">8:40</span><span class="ux-tl__dot" style="--c:var(--warn)"><i></i></span><span class="ux-tl__b ux-small"><b>Parte de la mañana</b>: el turno de noche, equipos parados, pendientes, almacén, presupuesto y quién entra.</span></li>
            <li><span class="ux-tl__h">9:30</span><span class="ux-tl__dot" style="--c:var(--bad)"><i></i></span><span class="ux-tl__b ux-small"><b>Falta el reporte</b> de alguna sede, con botón al formulario.</span></li>
            <li><span class="ux-tl__h">20:40</span><span class="ux-tl__dot" style="--c:var(--accent)"><i></i></span><span class="ux-tl__b ux-small"><b>Parte de la noche</b>: el turno de día.</span></li>
            <li><span class="ux-tl__h">21:30</span><span class="ux-tl__dot" style="--c:var(--bad)"><i></i></span><span class="ux-tl__b ux-small"><b>Falta el reporte</b> del turno de día.</span></li>
            <li><span class="ux-tl__h">Lun 7:30</span><span class="ux-tl__dot" style="--c:var(--vio)"><i></i></span><span class="ux-tl__b ux-small"><b>Resumen de la semana</b>: fallas por equipo y pendientes viejos.</span></li>
            <li><span class="ux-tl__h">Siempre</span><span class="ux-tl__dot" style="--c:var(--ok)"><i></i></span><span class="ux-tl__b ux-small"><b>Recordatorios de tareas</b> (Hecho / Posponer) y <b>cada reporte del formulario</b> apenas se envía.</span></li>
          </ul>
        </div>
        <div><p class="ux-label" style="margin:0 0 6px">Lo que entiende</p>${cmds.map(([c, d]) => `<div class="aj-cmd"><code>${esc(c)}</code><span>${esc(d)}</span></div>`).join("")}</div>
      </div>
    </section>`;
  }

  function cardFormulario() {
    const url = `${URL_APP}reporte.html`;
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("formulario")}Formulario de reporte de turno</h2><p class="ux-card__sub">Para que la practicante o los técnicos llenen el turno sin exportar el chat: estado de cada equipo y novedades. Queda en el Registro diario, en Pendientes, y el bot lo anuncia en el grupo. Al final da el texto listo para pegar en WhatsApp.</p></div></div>
      <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
        <div class="aj-qr" id="ajQr" aria-label="Código QR del formulario"></div>
        <div class="ux-stack" style="gap:8px;min-width:240px;flex:1">
          <code class="ux-small" style="word-break:break-all">${esc(url)}</code>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a class="ux-btn ux-btn--primary" href="reporte.html">${ic("formulario")}Abrir el formulario</a>
            <button class="ux-btn" type="button" data-aj="copiar-form">${ic("copiar")}Copiar enlace</button>
            <a class="ux-btn" href="https://wa.me/?text=${encodeURIComponent("Formulario de reporte de turno de mantenimiento: " + url)}" target="_blank" rel="noopener">${ic("compartir")}Enviar por WhatsApp</a>
          </div>
          <p class="ux-small ux-mute">Imprime el código QR y pégalo en el taller: se escanea con la cámara del celular.</p>
        </div>
      </div>
    </section>`;
  }

  function cardDatos() {
    const M = window.MTTO || {};
    const R = Array.isArray(window.REPORTES_TURNO) ? window.REPORTES_TURNO : [];
    const ult = R.length ? R.map((r) => r.fecha + " " + r.hora).sort().pop() : "";
    const inv = window.INVENTARIO ? window.INVENTARIO.frescura() : { texto: "—" };
    return `<section class="ux-card">
      <div class="ux-card__head"><div><h2 class="ux-card__title">${ic("capas")}De cuándo son los datos</h2><p class="ux-card__sub">Lo que viene del chat de WhatsApp se importa con los scripts del repositorio; lo demás llega en vivo por la nube.</p></div></div>
      <div class="aj-col">
        <div class="aj-col__row">${marcaEstado("ok")}<span>Histórico del chat en el Registro diario<small>${esc(M.desde || "")} a ${esc(M.hasta || "")} · generado ${esc(M.generado || "")}</small></span><span class="ux-small">${esc(N.fmt.num((M.hist && M.hist.registros.length) || 0))} novedades</span></div>
        <div class="aj-col__row">${marcaEstado("ok")}<span>Reportes de turno del chat<small>último: ${esc(ult)}</small></span><span class="ux-small">${R.length} reportes</span></div>
        <div class="aj-col__row">${marcaEstado(inv.estado === "fresco" ? "ok" : "error")}<span>Inventario del almacén (RE356)<small>${esc(inv.texto)}</small></span><button class="ux-btn ux-btn--sm" type="button" data-go="almacen">Cargar</button></div>
      </div>
      <details style="margin-top:12px"><summary class="ux-small ux-strong" style="cursor:pointer">Cómo actualizar lo del chat</summary>
        <ol class="aj-steps" style="margin-top:12px"><li>En WhatsApp: grupo <b>Mtto Medicamentos</b> → Más → Exportar chat → sin archivos.</li><li>En el PC: <code>node scripts/importar-reportes-whatsapp.mjs "chat.zip"</code>. Actualiza los reportes de turno y agrega al Registro diario las novedades nuevas (solo lo posterior a la última importación).</li><li>Subir los cambios del repositorio. Con el formulario de turno esto hace falta cada vez menos.</li></ol>
      </details>
    </section>`;
  }

  function render() {
    const raiz = document.getElementById("ajustesRoot");
    if (!raiz) return;
    raiz.innerHTML = `<div class="ux-page ux-seq">
      <div class="ux-head"><div class="ux-head__txt"><p class="ux-eyebrow">${ic("ajustes")}Configuración</p><h1 class="ux-title">Conexión y ajustes</h1></div></div>
      <div class="ux-grid ux-grid--main">
        <div class="ux-stack">${cardNube()}${cardBot()}</div>
        <div class="ux-stack">${cardUsuario()}${cardFormulario()}${cardClave()}${cardDatos()}</div>
      </div>
    </div>`;
    pintarQR();
  }

  async function pintarQR() {
    const caja = document.getElementById("ajQr");
    if (!caja) return;
    try {
      const QR = await N.cargarScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js", "QRCode");
      caja.innerHTML = "";
      new QR(caja, { text: `${URL_APP}reporte.html`, width: 134, height: 134, correctLevel: QR.CorrectLevel.M });
    } catch (e) { caja.innerHTML = `<span class="ux-small ux-mute">Sin QR (sin internet)</span>`; }
  }

  async function probarTodo() {
    vista.probando = true;
    render();
    await Promise.all(N.COLECCIONES.map((c) => N.probar(c.id)));
    vista.probando = false;
    render();
    const mal = N.COLECCIONES.filter((c) => (N.permisos[c.id] || {}).estado !== "ok").length;
    window.SHELL?.toast(mal ? `${mal} ${mal === 1 ? "colección no funciona" : "colecciones no funcionan"} todavía` : "Todo funciona en la nube", { tipo: mal ? "warn" : "ok" });
  }

  function enlazar() {
    const raiz = document.getElementById("ajustesRoot");
    if (!raiz || raiz.dataset.enlazado) return;
    raiz.dataset.enlazado = "1";
    raiz.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-aj]");
      if (!b) return;
      const a = b.dataset.aj;
      if (a === "probar") probarTodo();
      else if (a === "copiar-reglas") {
        try {
          const txt = await fetch("firestore.rules", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error(); return r.text(); });
          await navigator.clipboard.writeText(txt);
          window.SHELL?.toast("Reglas copiadas: pégalas en la consola de Firebase y publica");
        } catch (er) { window.open("firestore.rules", "_blank"); }
      } else if (a === "copiar-form") {
        navigator.clipboard?.writeText(`${URL_APP}reporte.html`).then(() => window.SHELL?.toast("Enlace copiado"));
      } else if (a === "salir") {
        if (confirm("¿Quitar la clave del taller de este equipo?")) window.firebase.auth().signOut().then(() => location.reload());
      }
    });
    raiz.addEventListener("submit", (e) => {
      const f = e.target;
      if (f.matches('[data-aj-form="usuario"]')) {
        e.preventDefault();
        const n = new FormData(f).get("n").toString().trim();
        N.usuario.set(n);
        window.SHELL?.toast(n ? `Listo, ${esc(n.split(" ")[0])}` : "Nombre borrado");
        render();
      } else if (f.matches('[data-aj-form="clave"]')) {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(f).entries());
        const msg = f.querySelector("[data-aj-msg]");
        msg.textContent = "Comprobando…";
        window.firebase.auth().signInWithEmailAndPassword(d.email.trim(), d.clave)
          .then(() => { msg.textContent = "Listo. Recargando…"; setTimeout(() => location.reload(), 600); })
          .catch((er) => { msg.textContent = er && er.code === "auth/invalid-credential" ? "Correo o clave incorrectos." : "No se pudo: " + ((er && er.message) || er); });
      }
    });
  }

  function esVisible() { return document.getElementById("ajustesView")?.classList.contains("is-active"); }
  N.on("permisos", () => { if (esVisible() && !vista.probando) render(); });

  function goAjustes() {
    views.ajustes = views.ajustes || document.getElementById("ajustesView");
    setView("ajustes");
    render();
    enlazar();
    saveUiState({ activeView: "ajustes" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  window.goAjustes = goAjustes;
  views.ajustes = document.getElementById("ajustesView");
})();
