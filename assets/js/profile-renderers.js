function dt(machine, campo) {
        const v = (machine.technicalData ?? {})[campo];
        return (v === undefined || v === null || v === "") ? "Por registrar" : v;
      }

      function renderProfile(machine) {
        const eqPlan = equipoDeMachine(machine);
        const codigoEquipo = machine.equipoCod || eqPlan?.c || (machine.id.startsWith("eq-") ? machine.id.replace("eq-", "").replace("-s4", "").replace("-p2", "") : "—");

        const baseSpecs = machine.summarySpecs ?? [
          { label: "Capacidad", value: dt(machine, "capacity") },
          { label: "Tamaños de cápsula", value: dt(machine, "capsuleSizes") },
          { label: "Dosificación", value: dt(machine, "dosingSystem") },
          { label: "Potencia", value: dt(machine, "power") },
          { label: "Peso", value: dt(machine, "weight") },
          { label: "Dimensiones", value: dt(machine, "dimensions") }
        ];

        const technicalHighlights = [
          { label: "Código de equipo", value: codigoEquipo },
          ...baseSpecs.filter(s => s.label !== "Código de equipo")
        ];

        // Estandarización unificada de las pestañas para todas las máquinas
        // Misma estructura para todos los equipos, siempre en el mismo orden.
        // Una pestaña solo desaparece si no hay absolutamente nada que enseñar,
        // y las que antes estaban partidas en dos van juntas:
        //   Repuestos  = los del plan (con código interno) + los del manual
        //   Fallas y alarmas = registro de fallas + alarmas del HMI
        //   Despiece   = despiece interactivo + tabla de despiece
        const hayMec = mecTiene(machine);
        const hayDespiece = hayMec
          || (typeof MACHINE_PARTS !== "undefined" && MACHINE_PARTS[machine.id])
          || (typeof MACHINE_TABLES !== "undefined" && MACHINE_TABLES[machine.id]);
        const tabs = [
          ["summary", "Resumen"],
          ...(((machine.systems ?? []).length || machine.systemAtlas) ? [["systems", "Sistemas"]] : []),
          ["spares", "Repuestos"],
          ["maintenance", "Mantenimiento"],
          ["failures", "Fallas y alarmas"],
          ...(hayDespiece ? [["partsmap", "Despiece"]] : []),
          ...((machine.schematic || machine.schematicIndex) ? [["schematic", machine.schematicIndex && machine.schematicIndex.hojas.some((h) => h.plano === "despiece") ? "Planos y despiece" : machine.schematicIndex && machine.schematicIndex.hojas.some((h) => h.archivo) ? "Planos" : "Plano eléctrico"]] : []),
          ["documents", "Documentos"]
        ];

        detailTitle.textContent = machine.model;
        const causaTxt = machine.causaCod ? ` · Causa: ${machine.causaCod}${machine.causaDesc ? ` — ${machine.causaDesc}` : ""}` : "";
        detailSubtitle.textContent = `Código: ${codigoEquipo} · ${machine.name} · ${machine.area}${causaTxt}`;
        guideTabs.innerHTML = tabs.map(([id, label], index) =>
          `<button class="profile-tab ${index === 0 ? "is-active" : ""}" type="button" data-profile-tab="${id}">${label}</button>`
        ).join("");

        guidePanels.innerHTML = `
          <section class="profile-panel is-active" data-profile-panel="summary">
            <div class="summary-hero">
              <div class="summary-left-col">
                <div class="summary-hero__image">
                  ${machine.image ? `<img src="${machine.image}" alt="${machine.name}" />` : ""}
                </div>
                <div class="summary-card-under-img">
                  <h4>Datos técnicos clave</h4>
                  <div class="summary-kv-vertical">
                    ${technicalHighlights.map((item) => `<div><span>${item.label}:</span><strong>${item.value}</strong></div>`).join("")}
                  </div>
                </div>
              </div>
              <div class="summary-sections">
                <div class="summary-section">
                  <h4>Descripción y función principal</h4>
                  <p>${machine.description}</p>
                  <p><strong>Función principal:</strong> ${dt(machine, "function")}</p>
                </div>
                <div class="summary-section">
                  <h4>Identificación y estado</h4>
                  <div class="summary-kv">
                    <div><span>Código de equipo</span><strong>${codigoEquipo}${avisoCodigo(machine)}</strong></div>
                    <div><span>Modelo</span><strong>${machine.model}</strong></div>
                    <div><span>Área</span><strong>${machine.area}</strong></div>
                    <div><span>Ubicación</span><strong>${machine.location}</strong></div>
                    <div><span>Estado</span><strong>${machine.status}</strong></div>
                    <div><span>Criticidad</span><strong>${machine.criticality}</strong></div>
                    <div><span>Manual</span><strong>${(() => {
                      const doc = (machine.documents ?? []).find(d => d.file);
                      if (!doc) return machine.manual;
                      const href = doc.file.split("/").map(encodeURIComponent).join("/");
                      return `<a href="${href}" target="_blank" rel="noopener" class="download-link" style="color:#000;text-decoration:underline;font-weight:600;display:inline-flex;align-items:center;gap:4px">${rowIcon('download')} ${machine.manual}</a>`;
                    })()}</strong></div>
                  </div>
                </div>
                <div class="summary-section">
                  <h4>Fabricante y trazabilidad</h4>
                  <div class="summary-kv">
                    <div><span>Fabricante</span><strong>${dt(machine, "manufacturer")}</strong></div>
                    <div><span>Marca</span><strong>${dt(machine, "brand")}</strong></div>
                    <div><span>Serie</span><strong>${dt(machine, "serialNumber")}</strong></div>
                    <div><span>Año</span><strong>${dt(machine, "year")}</strong></div>
                    <div><span>Voltaje</span><strong>${dt(machine, "voltage")}</strong></div>
                    <div><span>Mantenimiento</span><strong>${machine.maintenance}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section class="profile-panel" data-profile-panel="systems">${renderSystemsPanel(machine)}</section>
          <section class="profile-panel" data-profile-panel="spares">${renderSparesPanel(machine)}</section>

          <section class="profile-panel" data-profile-panel="maintenance">
            <div id="inspMaquina">${renderInspMaquina(machine)}</div>
            ${(machine.maintenanceTasks ?? []).length ? '<div class="panel-split"></div>' + renderMaintenancePanel(machine) : ""}
            ${procDe(machine) ? '<div class="panel-split"></div>' + renderProcedimientosPanel(machine) : ""}
          </section>
          <section class="profile-panel" data-profile-panel="failures">
            ${machine.alarms ? renderAlarmsPanel(machine) + '<div class="panel-split"></div>' : ""}
            ${renderFailuresPanel(machine)}
          </section>
          <section class="profile-panel" data-profile-panel="documents">
            <div class="item-list">
              ${((machine.documents ?? []).length ? machine.documents : [
                { name: (machine.manual && machine.manual !== "Pendiente de cargar") ? `Manual de ${machine.name}` : `Ficha técnica y manual de ${machine.name}`, status: "Disponible en archivo de planta / biblioteca física", file: "" }
              ]).map((d) => {
                const isPending = d.status.includes("Pendiente");
                const href = d.file ? d.file.split("/").map(encodeURIComponent).join("/") : "";
                const titleHtml = d.file
                  ? `<a href="${href}" target="_blank" rel="noopener" class="download-link" style="color:#000;text-decoration:underline;font-weight:600;display:inline-flex;align-items:center;gap:6px">${rowIcon('download')} ${d.name}</a>`
                  : d.name;
                const badges = [{ label: isPending ? "Pendiente" : "Disponible", pending: isPending }];
                if (d.file) badges.push({ label: "PDF descargable" });
                return renderMiniCard(titleHtml, d.status, badges);
              }).join("")}
            </div>
          </section>
          ${(machine.schematic || machine.schematicIndex) ? `<section class="profile-panel" data-profile-panel="schematic">
            ${machine.schematic ? renderSchematicExplorer(machine) : renderSchematicIndex(machine)}
            ${machine.id === "ms235" && sensoresMS235().length ? '<div class="panel-split"></div>' + renderSensoresPanel() : ""}
          </section>` : ""}
          ${hayDespiece ? `<section class="profile-panel" data-profile-panel="partsmap">
            ${hayMec ? renderMecExplorer(machine) : ""}
            ${(typeof MACHINE_PARTS !== "undefined" && MACHINE_PARTS[machine.id]) ? renderPartsExplorer(machine) : ""}
            ${(typeof MACHINE_PARTS !== "undefined" && MACHINE_PARTS[machine.id] && typeof MACHINE_TABLES !== "undefined" && MACHINE_TABLES[machine.id]) ? '<div class="panel-split"></div>' : ""}
            ${(typeof MACHINE_TABLES !== "undefined" && MACHINE_TABLES[machine.id]) ? renderTablesExplorer(machine) : ""}
          </section>` : ""}

        `;
      }

      function renderEmptyState(query) {
        const title = query ? "No hay equipos con esa búsqueda" : "No hay equipos registrados";
        const message = query ? "Puedes registrar el equipo si todavía no existe en la biblioteca." : "Registra el primer equipo para comenzar.";
        return `<div class="empty-state"><div><h3>${title}</h3><p>${message}</p></div></div>`;
      }

      function renderResults() {
        const query = normalize(currentQuery);
        const filtered = getFilteredMachines();
        const selectedMachine = filtered.find((machine) => machine.id === selectedId) ?? null;

        resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "equipo" : "equipos"}`;
        resultTitle.textContent = query ? `Resultados para "${currentQuery}"` : "Todos los equipos";

        // Puente al plan de mantenimiento: muchos codigos internos pertenecen a equipos
        // que todavia no tienen ficha, asi que el buscador general avisa y lleva alli.
        const planHits = planCountFor(currentQuery);
        const bridge = planHits
          ? `<div class="pl-bridge">
               <span class="pl-bridge__txt"><strong>${planHits}</strong> ${planHits === 1 ? "l&iacute;nea" : "l&iacute;neas"} del <strong>plan de mantenimiento</strong> ${planHits === 1 ? "coincide" : "coinciden"} con esta b&uacute;squeda: equipo, sistema, c&oacute;digo interno, cantidad y existencias en almac&eacute;n.</span>
               <button class="button button--dark" type="button" data-q="${planEsc(currentQuery)}" onclick="goPlan(this.dataset.q)">Ver en el plan</button>
             </div>`
          : "";

        if (filtered.length === 0) {
          resultsList.innerHTML = bridge + renderEmptyState(query);
          renderPreview(null);
          return;
        }

        resultsList.innerHTML = bridge + filtered.map(renderResultItem).join("");
        renderPreview(selectedMachine);
      }

      // ======================================================================
      //  TAREAS PENDIENTES Y RECORDATORIOS
      //  Estaba en tareas.html, una pagina aparte con su propio diseno y sin el
      //  menu lateral. Se trae aqui tal cual (con los recordatorios de Telegram)
      //  y la version vieja y mas pobre que habia en este archivo desaparece.
      // ======================================================================
      function escapeHtml(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
      }

      const tasksKey = "equipos-tareas-v1";
      const cloud = window.CLOUD || { db: null, enabled: false, connected: false };
      cloud.connected = false; // se pone a true al recibir datos del servidor

      // ── Subir a la nube solo lo que cambió ──────────────────────────────────
      // Tareas, datos de repuestos, inspecciones y cambios guardan la lista
      // entera en el navegador. Antes, al guardar, se subía TODA la lista: un
      // celular con la copia de hace un rato pisaba lo que otro técnico (o el
      // bot, que marca tareas hechas y mueve recordatorios) acababa de cambiar,
      // y pasados 500 documentos Firestore rechazaba el lote entero y no se
      // guardaba nada. Ahora cada colección recuerda cómo estaba cada documento
      // en la nube ("visto": id -> firma) y solo sube los que difieren, y borra
      // solo los que se quitaron aquí. Los lotes van de 400.
      function firma(o) {
        const orden = (v) => (Array.isArray(v) ? v.map(orden) : v && typeof v === "object"
          ? Object.keys(v).sort().reduce((a, k) => { a[k] = orden(v[k]); return a; }, {}) : v);
        return JSON.stringify(orden(JSON.parse(JSON.stringify(o))));
      }
      function vistoDe(lista) { return new Map(lista.filter((d) => d && d.id).map((d) => [d.id, firma(d)])); }
      function subirCambiados(nombre, lista, visto, rutaDoc = (id) => id) {
        const col = cloud.db.collection(nombre);
        const ops = [];
        const ids = new Set();
        lista.forEach((d) => {
          if (!d || !d.id) return;
          ids.add(d.id);
          const f = firma(d);
          if (visto.get(d.id) !== f) ops.push({ id: d.id, dato: JSON.parse(JSON.stringify(d)), f });
        });
        visto.forEach((_, id) => { if (!ids.has(id)) ops.push({ id, borrar: true }); });
        ops.forEach((o) => { if (o.borrar) visto.delete(o.id); else visto.set(o.id, o.f); });
        for (let i = 0; i < ops.length; i += 400) {
          const lote = ops.slice(i, i + 400);
          const b = cloud.db.batch();
          lote.forEach((o) => { const ref = col.doc(rutaDoc(o.id)); if (o.borrar) b.delete(ref); else b.set(ref, o.dato); });
          // Si falla, se marca para reintentar en el próximo guardado
          b.commit().catch((e) => {
            console.error(`[${nombre}] guardar nube:`, e);
            lote.forEach((o) => visto.set(o.id, "reintentar"));
          });
        }
        return ops.length;
      }

      let tareasVisto = new Map();
      function loadTasks() { try { return JSON.parse(localStorage.getItem(tasksKey) || "[]"); } catch { return []; } }
      let tasks = loadTasks();
      function saveLocal() { try { localStorage.setItem(tasksKey, JSON.stringify(tasks)); } catch (e) {} }
      function saveTasks() { saveLocal(); if (cloud.enabled && cloud.db) cloudSync(); }

      // Las maquinas salen de la propia app, no de una copia en el navegador.
      function taskMachineName(id) { const m = machines.find((x) => x.id === id); return m ? (m.model || m.name) : "General / Otra"; }
      function machineOptions(sel) {
        return `<option value="">General / Otra</option>` + machines.map((m) => `<option value="${escapeHtml(m.id)}" ${sel === m.id ? "selected" : ""}>${escapeHtml(m.model || m.name)}</option>`).join("");
      }

      // Sube a Firestore las tareas que cambiaron aquí (y borra las que se quitaron)
      function cloudSync() {
        try { subirCambiados("tareas", tasks, tareasVisto); } catch (e) { console.error("[Tareas] cloudSync:", e); }
      }

      function cloudSubscribe() {
        if (!(cloud.enabled && cloud.db)) { updateCloudChip(); return; }
        cloud.db.collection("tareas").onSnapshot({ includeMetadataChanges: true }, (snap) => {
          cloud.connected = !snap.metadata.fromCache;
          const remote = [];
          snap.forEach((d) => remote.push(d.data()));
          tasks = remote;
          tareasVisto = vistoDe(remote);
          saveLocal();
          window.diarioRenderSiVisible?.();
          if (document.getElementById("tkList")) renderTasks(); else updateCloudChip();
        }, (err) => { console.error("[Tareas] onSnapshot:", err); cloud.connected = false; updateCloudChip(); });
      }

      function updateCloudChip() {
        const chip = document.getElementById("cloudChip");
        if (!chip) return;
        const txt = chip.querySelector(".cloud-chip__txt");
        chip.classList.remove("is-online", "is-offline", "is-local");
        if (!cloud.enabled) { chip.classList.add("is-local"); chip.title = "Solo en este dispositivo (sin nube)"; if (txt) txt.textContent = "Solo local"; }
        else if (cloud.connected) { chip.classList.add("is-online"); chip.title = "Conectado: sincronizado en la nube en tiempo real"; if (txt) txt.textContent = "Conectado"; }
        else { chip.classList.add("is-offline"); chip.title = "Sin conexión: se sincronizará al reconectar"; if (txt) txt.textContent = "Sin conexión"; }
      }

      function tuid() { return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

      function renderTasks() {
        const lista = document.getElementById("tkList");
        if (!lista) return;
        const c = { pendiente: 0, "en-progreso": 0, hecha: 0 };
        tasks.forEach((t) => { c[t.status] = (c[t.status] || 0) + 1; });
        document.getElementById("counterRow").innerHTML =
          `<span class="tk-stat tk-stat--pend"><span class="dot"></span><b>${c.pendiente}</b> pendientes</span>` +
          `<span class="tk-stat tk-stat--prog"><span class="dot"></span><b>${c["en-progreso"]}</b> en progreso</span>` +
          `<span class="tk-stat tk-stat--done"><span class="dot"></span><b>${c.hecha}</b> hechas</span>`;
        const order = { pendiente: 0, "en-progreso": 1, hecha: 2 };
        const fm = document.getElementById("filterMachine").value;
        const fs = document.getElementById("filterStatus").value;
        const list = tasks
          .filter((t) => (!fm || t.machine === fm) && (!fs || t.status === fs))
          .sort((a, b) => (order[a.status] - order[b.status]) || (b.createdAt || "").localeCompare(a.createdAt || ""));
        lista.innerHTML = list.length
          ? list.map(renderTaskCard).join("")
          : '<p class="tk-empty">No hay tareas todavía. Toca el botón <strong>Nueva tarea</strong> para crear la primera.</p>';
        updateCloudChip();
      }

      function renderTaskCard(t) {
        const steps = t.steps || [];
        const done = steps.filter((s) => s.done).length;
        const prCls = { Alta: "tk-pr--alta", Media: "tk-pr--media", Baja: "tk-pr--baja" }[t.priority] || "tk-pr--media";
        const stLabel = { pendiente: "Pendiente", "en-progreso": "En progreso", hecha: "Hecha" }[t.status] || t.status;
        const body = t.followPrompt
          ? `<div class="tk-follow">
               <span class="tk-follow__lbl">Antes de cerrar, ¿hay una tarea siguiente?</span>
               <input id="fu-${t.id}" placeholder="Ej. Reinstalar y calibrar (opcional)">
               <button class="button button--dark" type="button" onclick="taskFinish('${t.id}', true)">Crear y cerrar</button>
               <button class="button button--light" type="button" onclick="taskFinish('${t.id}', false)">Solo cerrar</button>
             </div>`
          : `<div class="tk-actions">
               ${t.status !== "hecha" ? `<button class="button button--light" type="button" onclick="taskSetStatus('${t.id}','${t.status === "pendiente" ? "en-progreso" : "pendiente"}')">${t.status === "pendiente" ? "Empezar" : "Pausar"}</button>` : ""}
               ${t.status !== "hecha" ? `<button class="button button--dark" type="button" onclick="taskComplete('${t.id}')">Completar</button>` : `<button class="button button--light" type="button" onclick="taskSetStatus('${t.id}','pendiente')">Reabrir</button>`}
               <button class="button button--light" type="button" onclick="taskAddStep('${t.id}')">+ paso</button>
               <button class="button button--light" type="button" onclick="openRemind('${t.id}')">${t.remindFreq ? "Aviso programado" : "Programar aviso"}</button>
               <button class="button button--light" type="button" onclick="taskDelete('${t.id}')">Eliminar</button>
             </div>`;
        return `<div class="tk-card tk-st--${t.status}">
          <div class="tk-card__top">
            <span class="tk-pr ${prCls}">${escapeHtml(t.priority)}</span>
            <strong class="tk-title">${escapeHtml(t.title)}</strong>
            <span class="system-badge">${escapeHtml(taskMachineName(t.machine))}</span>
            <span class="tk-status">${stLabel}</span>
          </div>
          ${t.desc ? `<p class="tk-desc">${escapeHtml(t.desc)}</p>` : ""}
          ${steps.length ? `<div class="tk-steps">${steps.map((s, i) => `<label class="tk-step ${s.done ? "is-done" : ""}"><input type="checkbox" ${s.done ? "checked" : ""} onchange="taskToggleStep('${t.id}', ${i})"> ${escapeHtml(s.text)}</label>`).join("")}<div class="tk-prog">${done}/${steps.length} pasos completados</div></div>` : ""}
          ${t.remindFreq ? (t.status === "hecha"
            ? `<div class="tk-remind tk-remind--off">Aviso en pausa &middot; la tarea está hecha. Si la reabres, vuelve a avisar.</div>`
            : `<div class="tk-remind">${escapeHtml(remindLabel(t))}</div>`) : ""}
          <div class="tk-meta">${t.reporter ? "por " + escapeHtml(t.reporter) + " · " : ""}${escapeHtml((t.createdAt || "").slice(0, 10))}${t.parent ? ` · seguimiento de: “${escapeHtml(t.parent)}”` : ""}</div>
          ${body}
        </div>`;
      }

      function taskSubmit(e) {
        e.preventDefault();
        const f = e.target;
        const steps = (f.steps.value || "").split("\n").map((s) => s.trim()).filter(Boolean).map((text) => ({ text, done: false }));
        tasks.unshift({ id: tuid(), machine: f.machine.value, machineName: taskMachineName(f.machine.value), title: f.title.value.trim(), desc: f.desc.value.trim(), priority: f.priority.value, reporter: f.reporter.value.trim(), status: "pendiente", steps, createdAt: new Date().toISOString() });
        saveTasks(); f.reset(); taskFormToggle(false); renderTasks();
      }
      function taskToggleStep(id, i) { const t = tasks.find((x) => x.id === id); if (t && t.steps[i]) { t.steps[i].done = !t.steps[i].done; if (t.status === "pendiente" && t.steps.some((s) => s.done)) t.status = "en-progreso"; saveTasks(); renderTasks(); } }
      function taskSetStatus(id, st) { const t = tasks.find((x) => x.id === id); if (t) { t.status = st; if (st === "hecha") t.doneAt = new Date().toISOString(); saveTasks(); renderTasks(); } }
      function taskAddStep(id) { const txt = window.prompt("Nuevo paso:"); if (txt && txt.trim()) { const t = tasks.find((x) => x.id === id); if (t) { (t.steps = t.steps || []).push({ text: txt.trim(), done: false }); saveTasks(); renderTasks(); } } }
      function taskComplete(id) { const t = tasks.find((x) => x.id === id); if (t) { t.followPrompt = true; renderTasks(); document.getElementById("fu-" + id)?.focus(); } }
      function taskFinish(id, createFollow) {
        const t = tasks.find((x) => x.id === id); if (!t) return;
        if (createFollow) { const fu = document.getElementById("fu-" + id); const title = fu && fu.value.trim(); if (title) tasks.unshift({ id: tuid(), machine: t.machine, title, desc: "", priority: t.priority, reporter: t.reporter, status: "pendiente", steps: [], createdAt: new Date().toISOString(), parent: t.title }); }
        delete t.followPrompt; t.status = "hecha"; t.doneAt = new Date().toISOString();
        saveTasks(); renderTasks();
      }
      function taskDelete(id) { if (window.confirm("¿Eliminar esta tarea?")) { tasks = tasks.filter((x) => x.id !== id); saveTasks(); renderTasks(); } }
      function taskExport() { const data = JSON.stringify(tasks, null, 2); try { navigator.clipboard?.writeText(data); } catch (e) {} window.prompt("Copia este texto para respaldar o compartir las tareas:", data); }
      function taskImport() { const txt = window.prompt("Pega el texto de tareas exportado (se agregan las que no existan):"); if (!txt) return; try { const arr = JSON.parse(txt); if (Array.isArray(arr)) { const ids = new Set(tasks.map((t) => t.id)); arr.forEach((t) => { if (t && t.id && !ids.has(t.id)) tasks.push(t); }); saveTasks(); renderTasks(); } } catch (e) { window.alert("El texto no es válido."); } }

      // Abre/cierra el panel flotante de nueva tarea
      let taskFormOpen = false;
      function taskFormToggle(force) {
        const open = (typeof force === "boolean") ? force : !taskFormOpen;
        taskFormOpen = open;
        const sheet = document.getElementById("tkSheet");
        const back = document.getElementById("tkSheetBackdrop");
        if (!sheet || !back) return;
        if (open) {
          const sel = document.getElementById("tkMachineSel");
          if (sel) sel.innerHTML = machineOptions("");
          back.hidden = false; sheet.hidden = false;
          setTimeout(() => sheet.querySelector('input[name="title"]')?.focus(), 60);
        } else { sheet.hidden = true; back.hidden = true; }
      }
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && taskFormOpen) taskFormToggle(false); });

      // ----- Recordatorios (los avisos que manda el bot de Telegram) -----
      const FREQ_LABEL = { once: "Una vez", daily: "Diario", weekly: "Semanal", monthly: "Mensual", everyN: "Cada N meses" };
      // Colombia es UTC-5 fijo (sin horario de verano). La hora elegida se interpreta
      // SIEMPRE como hora de Colombia, sin importar la zona del dispositivo.
      const CO_TZ = "America/Bogota";
      const CO_OFFSET = "-05:00";
      const CO_MS = 5 * 3600 * 1000;
      function bogotaToday() { return new Date(Date.now() - CO_MS).toISOString().slice(0, 10); }
      function bogotaDateStr(iso) { return new Date(new Date(iso).getTime() - CO_MS).toISOString().slice(0, 10); }
      function remindLabel(t) {
        if (!t.remindFreq) return "";
        const base = t.remindFreq === "everyN" ? `Cada ${t.remindEveryN || "?"} meses` : (FREQ_LABEL[t.remindFreq] || t.remindFreq);
        const next = t.remindNextAt ? new Date(t.remindNextAt) : null;
        const nice = next && !isNaN(next) ? next.toLocaleDateString("es", { day: "2-digit", month: "short", timeZone: CO_TZ }) + " " + (t.remindTime || "") : "";
        return `${base}${nice ? " · próx. " + nice.trim() : (t.remindTime ? " · " + t.remindTime : "")}`;
      }
      // Avanza un instante manteniendo la MISMA hora de Colombia
      function remindAdvance(freq, dt, everyN) {
        const t = dt.getTime();
        if (freq === "daily") return new Date(t + 86400000);
        if (freq === "weekly") return new Date(t + 7 * 86400000);
        if (freq === "monthly" || freq === "everyN") {
          const wall = new Date(t - CO_MS);
          wall.setUTCMonth(wall.getUTCMonth() + (freq === "monthly" ? 1 : (everyN || 1)));
          return new Date(wall.getTime() + CO_MS);
        }
        return null;
      }
      // Primer disparo (fecha+hora de Colombia -> ISO UTC). Para recurrentes, adelanta al futuro.
      function remindComputeNext(freq, dateStr, timeStr, everyN) {
        const d = dateStr || bogotaToday();
        const t = timeStr || "08:00";
        let dt = new Date(`${d}T${t}:00${CO_OFFSET}`);
        if (isNaN(dt)) return null;
        if (freq !== "once") {
          const now = new Date();
          let guard = 0;
          while (dt <= now && guard++ < 2000) {
            const nx = remindAdvance(freq, dt, everyN);
            if (!nx) break;
            dt = nx;
          }
        }
        return dt.toISOString();
      }

      let remindEditId = null;
      function openRemind(id) {
        const t = tasks.find((x) => x.id === id); if (!t) return;
        remindEditId = id;
        const form = document.getElementById("remindForm");
        form.freq.value = t.remindFreq || "";
        form.date.value = t.remindNextAt ? bogotaDateStr(t.remindNextAt) : bogotaToday();
        form.time.value = t.remindTime || "08:00";
        form.everyN.value = t.remindEveryN || 4;
        document.getElementById("remindRemoveBtn").hidden = !t.remindFreq;
        remindSyncFields();
        document.getElementById("remindBackdrop").hidden = false;
        document.getElementById("remindSheet").hidden = false;
      }
      function closeRemind() { remindEditId = null; document.getElementById("remindBackdrop").hidden = true; document.getElementById("remindSheet").hidden = true; }
      function remindSyncFields() {
        const form = document.getElementById("remindForm");
        const freq = form.freq.value;
        document.getElementById("remindEveryWrap").hidden = freq !== "everyN";
        const prev = document.getElementById("remindPreview");
        if (!freq) { prev.innerHTML = "Sin aviso: esta tarea no enviará notificación."; return; }
        const iso = remindComputeNext(freq, form.date.value, form.time.value, parseInt(form.everyN.value, 10) || 1);
        const next = iso ? new Date(iso) : null;
        const nstr = next ? next.toLocaleString("es", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit", timeZone: CO_TZ }) + " (Colombia)" : "—";
        const label = freq === "everyN" ? `cada ${form.everyN.value} meses` : (FREQ_LABEL[freq] || freq).toLowerCase();
        prev.innerHTML = `Se avisará <b>${label}</b>. Próximo aviso:<br><b>${nstr}</b>`;
      }
      function saveRemind(e) {
        e.preventDefault();
        const t = tasks.find((x) => x.id === remindEditId); if (!t) { closeRemind(); return; }
        const form = e.target;
        const freq = form.freq.value;
        if (!freq) { clearRemind(); return; }
        t.remindFreq = freq;
        t.remindTime = form.time.value || "08:00";
        t.remindNextAt = remindComputeNext(freq, form.date.value, form.time.value, parseInt(form.everyN.value, 10) || 1);
        if (freq === "everyN") t.remindEveryN = Math.max(1, parseInt(form.everyN.value, 10) || 1); else delete t.remindEveryN;
        if (!t.machineName) t.machineName = taskMachineName(t.machine);
        saveTasks(); closeRemind(); renderTasks();
      }
      function clearRemind() {
        const t = tasks.find((x) => x.id === remindEditId);
        if (t) { delete t.remindFreq; delete t.remindTime; delete t.remindNextAt; delete t.remindEveryN; saveTasks(); }
        closeRemind(); renderTasks();
      }
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !document.getElementById("remindSheet")?.hidden) closeRemind(); });

      function goTasks() {
        setView("tasks");
        const sel = document.getElementById("filterMachine");
        if (sel && !sel.options.length) {
          sel.innerHTML = `<option value="">Todas las máquinas</option>` + machines.map((m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.model || m.name)}</option>`).join("");
        }
        renderTasks();
        saveUiState({ activeView: "tasks" });
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      cloudSubscribe(); // arranca la sincronización en la nube en tiempo real (si hay config)

      // ======================================================================
      //  INSPECCIONES
      //  Lo que se revisa en planta: qué se miró, qué se encontró y qué piezas
      //  hay que cambiar. Cuelga del equipo, se ve en su ficha, y las piezas
      //  que marca salen señaladas en la tabla de repuestos hasta que se
      //  cambian de verdad y se registra el cambio.
      // ======================================================================
      const inspKey = "equipos-inspecciones-v1";
      const inspRegistroBorradasKey = "equipos-inspecciones-registro-borradas-v1";
      let inspecciones = loadInsp();
      let inspVisto = new Map();
      const inspNube = { conectado: false, error: "" };
      const inspFiltro = { q: "", eq: "", tipo: "", estado: "" };

      const INSP_TIPOS = {
        rutina: "Inspección de rutina",
        parada: "Parada programada",
        correctiva: "Revisión por falla",
        arranque: "Arranque o puesta a punto"
      };
      const INSP_URGENCIA = { alta: "Cambiar ya", media: "Programar", baja: "Vigilar" };

      // Reportes que vienen escritos en el repositorio (assets/js/inspecciones-registro.js).
      // Son los que se pasaron a limpio desde el papel: se ven apenas abre la pagina,
      // sin depender de lo que tenga guardado ese navegador ni de que haya nube. Se
      // suman a las que anota la gente; si alguien borra una aqui, se apunta el id
      // para que no reaparezca en ese navegador.
      function inspRegistro() { return Array.isArray(window.INSPECCIONES_REGISTRO) ? window.INSPECCIONES_REGISTRO : []; }
      function inspRegistroBorradas() {
        try { return new Set(JSON.parse(localStorage.getItem(inspRegistroBorradasKey) || "[]")); } catch { return new Set(); }
      }
      function inspRegistroAnotarBorrada(id) {
        if (!inspRegistro().some((i) => i.id === id)) return;
        const fuera = inspRegistroBorradas();
        fuera.add(id);
        try { localStorage.setItem(inspRegistroBorradasKey, JSON.stringify([...fuera])); } catch (e) {}
      }
      function inspConRegistro(lista) {
        const ya = new Set(lista.map((i) => i.id));
        const fuera = inspRegistroBorradas();
        const faltan = inspRegistro()
          .filter((i) => i && i.id && !ya.has(i.id) && !fuera.has(i.id))
          .map((i) => JSON.parse(JSON.stringify(i)));
        return faltan.length ? faltan.concat(lista) : lista;
      }

      function loadInsp() {
        let guardadas = [];
        try { guardadas = JSON.parse(localStorage.getItem(inspKey) || "[]"); } catch { guardadas = []; }
        return inspConRegistro(Array.isArray(guardadas) ? guardadas : []);
      }
      function saveInspLocal() { try { localStorage.setItem(inspKey, JSON.stringify(inspecciones)); } catch (e) {} }
      function saveInsp() {
        saveInspLocal();
        if (cloud.enabled && cloud.db) inspSync();
        renderInspIfVisible();
        renderFichaSiVisible();
        window.segRenderSiVisible?.();
      }

      function inspSync() {
        try { subirCambiados("inspecciones", inspecciones, inspVisto); } catch (e) { console.error("[Inspecciones] inspSync:", e); }
      }

      function inspSubscribe() {
        if (!(cloud.enabled && cloud.db)) return;
        cloud.db.collection("inspecciones").onSnapshot({ includeMetadataChanges: true }, (snap) => {
          const remoto = [];
          snap.forEach((d) => remoto.push(d.data()));
          inspVisto = vistoDe(remoto);
          inspecciones = inspConRegistro(remoto);
          window.diarioRenderSiVisible?.();
          inspNube.conectado = !snap.metadata.fromCache;
          inspNube.error = "";
          saveInspLocal();
          renderInspIfVisible();
          renderFichaSiVisible();
          window.segRenderSiVisible?.();
        }, (err) => { inspNube.conectado = false; inspNube.error = err && err.code ? err.code : "error"; console.error("[Inspecciones] onSnapshot:", err); });
      }

      function inspDeEquipo(eqCod) {
        return inspecciones.filter((i) => i.eq === eqCod).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
      }

      // Piezas que alguna inspección abierta marcó para cambiar, por código.
      function inspPendientesDe(eqCod) {
        const m = new Map();
        inspecciones.filter((i) => i.eq === eqCod && i.estado !== "cerrada").forEach((i) => {
          (i.piezas || []).forEach((p) => { if (p.cod) m.set(p.cod, { urgencia: p.urgencia, fecha: i.fecha }); });
        });
        return m;
      }

      function inspNombreEquipo(eqCod) {
        const eq = PLAN_EQUIPOS.find((e) => e.c === eqCod);
        return eq ? eq.n : eqCod;
      }

      // ----- Vista -----
      function renderInspIfVisible() {
        const v = document.getElementById("inspView");
        if (v && v.classList.contains("is-active")) renderInspecciones();
      }

      function inspFiltradas() {
        const tokens = planTokens(inspFiltro.q);
        return inspecciones
          .filter((i) => {
            if (inspFiltro.eq && i.eq !== inspFiltro.eq) return false;
            if (inspFiltro.tipo && i.tipo !== inspFiltro.tipo) return false;
            if (inspFiltro.estado && (i.estado || "abierta") !== inspFiltro.estado) return false;
            if (!tokens.length) return true;
            const hay = planPlain([inspNombreEquipo(i.eq), i.eq, i.quien, i.revisado, i.hallazgos,
              (i.piezas || []).map((p) => p.cod + " " + p.d).join(" ")].join(" "));
            return tokens.every((t) => hay.includes(t));
          })
          .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
      }

      function renderInspecciones() {
        const root = document.getElementById("inspRoot");
        if (!root) return;
        const lista = inspFiltradas();
        const abiertas = lista.filter((i) => (i.estado || "abierta") !== "cerrada").length;
        const piezas = lista.reduce((n, i) => n + (i.piezas || []).length, 0);
        const equipos = [...new Set(inspecciones.map((i) => i.eq))].sort((a, b) => inspNombreEquipo(a).localeCompare(inspNombreEquipo(b)));

        root.innerHTML = `
          <div class="section-bar">
            <div>
              <p class="eyebrow">Mantenimiento</p>
              <h2>Inspecciones</h2>
            </div>
            <div class="section-actions">
              <span class="counter">${lista.length} ${lista.length === 1 ? "inspección" : "inspecciones"} &middot; ${piezas} ${piezas === 1 ? "pieza" : "piezas"}</span>
              <button class="button button--dark" type="button" onclick="inspAbrirForm()">Nueva inspección</button>
            </div>
          </div>

          <div class="pl-kpis">
            <div class="pl-kpi"><span class="pl-kpi__n">${lista.length}</span><span class="pl-kpi__l">Inspecciones</span></div>
            <div class="pl-kpi pl-kpi--warn"><span class="pl-kpi__n">${abiertas}</span><span class="pl-kpi__l">Abiertas</span></div>
            <div class="pl-kpi"><span class="pl-kpi__n">${piezas}</span><span class="pl-kpi__l">Piezas marcadas</span></div>
            <div class="pl-kpi"><span class="pl-kpi__n">${equipos.length}</span><span class="pl-kpi__l">Equipos revisados</span></div>
          </div>

          <div class="pl-filters">
            <input type="search" id="inspSearch" placeholder="Buscar por equipo, hallazgo, pieza o persona&hellip;" value="${planEsc(inspFiltro.q)}" oninput="inspSetFiltro('q', this.value)" aria-label="Buscar inspecciones">
            <select onchange="inspSetFiltro('eq', this.value)" aria-label="Filtrar por equipo">
              <option value="">Todos los equipos</option>
              ${equipos.map((c) => `<option value="${planEsc(c)}" ${inspFiltro.eq === c ? "selected" : ""}>${planEsc(inspNombreEquipo(c))}</option>`).join("")}
            </select>
            <select onchange="inspSetFiltro('tipo', this.value)" aria-label="Filtrar por tipo">
              <option value="">Todos los tipos</option>
              ${Object.entries(INSP_TIPOS).map(([k, v]) => `<option value="${k}" ${inspFiltro.tipo === k ? "selected" : ""}>${planEsc(v)}</option>`).join("")}
            </select>
            <select onchange="inspSetFiltro('estado', this.value)" aria-label="Filtrar por estado">
              <option value="">Abiertas y cerradas</option>
              <option value="abierta" ${inspFiltro.estado === "abierta" ? "selected" : ""}>Solo abiertas</option>
              <option value="cerrada" ${inspFiltro.estado === "cerrada" ? "selected" : ""}>Solo cerradas</option>
            </select>
          </div>

          ${lista.length ? lista.map((i) => inspTarjeta(i, true)).join("") : '<div class="pl-empty"><h3>Todavía no hay inspecciones</h3><p>Toca <strong>Nueva inspección</strong> para anotar la primera.</p></div>'}`;
      }

      function inspTarjeta(i, conEquipo) {
        const cerrada = (i.estado || "abierta") === "cerrada";
        const piezas = i.piezas || [];
        return `
          <article class="in-card ${cerrada ? "is-cerrada" : ""}">
            <div class="in-card__top">
              <span class="in-fecha">${planEsc(i.fecha)}</span>
              <span class="in-tipo">${planEsc(INSP_TIPOS[i.tipo] || i.tipo || "Inspección")}</span>
              ${conEquipo ? `<button class="in-eq" type="button" onclick="inspIrAEquipo('${planEsc(i.eq)}')">${planEsc(inspNombreEquipo(i.eq))}</button>` : ""}
              <span class="in-estado ${cerrada ? "in-estado--cerrada" : ""}">${cerrada ? "Cerrada" : "Abierta"}</span>
            </div>
            ${i.revisado ? `<p class="in-bloque"><span class="in-lbl">Qué se revisó</span>${planEsc(i.revisado)}</p>` : ""}
            ${i.hallazgos ? `<p class="in-bloque"><span class="in-lbl">Qué se encontró</span>${planEsc(i.hallazgos)}</p>` : ""}
            ${piezas.length ? `<div class="in-piezas">
              <span class="in-lbl">Piezas para cambiar</span>
              ${piezas.map((p) => `<div class="in-pieza">
                <span class="pl-code">${planEsc(p.cod) || "&mdash;"}</span>
                <span class="in-pieza__d">${planEsc(p.d)}</span>
                ${p.q ? `<span class="in-pieza__q">${planEsc(p.q)} ud.</span>` : ""}
                <span class="in-urg in-urg--${planEsc(p.urgencia || "media")}">${planEsc(INSP_URGENCIA[p.urgencia] || "Programar")}</span>
              </div>`).join("")}
            </div>` : ""}
            <div class="in-card__pie">
              <span class="in-quien">${i.quien ? "Revisó " + planEsc(i.quien) : "Sin firmar"}</span>
              <span class="in-acciones">
                <button class="button button--light" type="button" onclick="inspEditar('${planEsc(i.id)}')">Editar</button>
                <button class="button button--light" type="button" onclick="inspCambiarEstado('${planEsc(i.id)}')">${cerrada ? "Reabrir" : "Cerrar"}</button>
                <button class="button button--light" type="button" onclick="inspBorrar('${planEsc(i.id)}')">Eliminar</button>
              </span>
            </div>
          </article>`;
      }

      function inspSetFiltro(k, v) {
        inspFiltro[k] = v;
        renderInspecciones();
        if (k === "q") { const c = document.getElementById("inspSearch"); if (c) { c.focus(); c.setSelectionRange(c.value.length, c.value.length); } }
      }

      function inspIrAEquipo(eqCod) {
        const eq = PLAN_EQUIPOS.find((e) => e.c === eqCod);
        if (!eq) return;
        openDetail(eq.id);
        const b = guideTabs.querySelector('[data-profile-tab="maintenance"]');
        if (b) b.click();
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      function inspCambiarEstado(id) {
        const i = inspecciones.find((x) => x.id === id);
        if (!i) return;
        i.estado = (i.estado || "abierta") === "cerrada" ? "abierta" : "cerrada";
        saveInsp();
        renderInspecciones();
      }

      function inspBorrar(id) {
        if (!window.confirm("¿Eliminar esta inspección?")) return;
        inspRegistroAnotarBorrada(id);
        inspecciones = inspecciones.filter((x) => x.id !== id);
        saveInsp();
        renderInspecciones();
      }

      // ----- Formulario (sirve para anotar una nueva y para editar una ya anotada) -----
      let inspPiezas = [];
      let inspEquipoFijo = "";
      let inspEditandoId = "";

      // Abre la hoja en blanco para anotar. Con "eqCod" ya viene elegido el equipo.
      function inspAbrirForm(eqCod) { inspAbrirHoja({ eqCod: eqCod || "" }); }

      // Abre la misma hoja con una inspeccion ya escrita, para corregirla.
      // Vale para cualquiera: las que anota la gente y las del registro del
      // repositorio. Al guardar, la corregida se queda en este navegador (y en
      // la nube, si esta configurada) por encima de la que trae el repositorio.
      function inspEditar(id) {
        const i = inspecciones.find((x) => x.id === id);
        if (!i) return;
        inspAbrirHoja({ registro: i });
      }

      function inspAbrirHoja({ eqCod = "", registro = null } = {}) {
        const form = document.getElementById("inspForm");
        const sel = document.getElementById("inspEqSel");
        if (!form || !sel) return;

        inspEditandoId = registro ? registro.id : "";
        inspEquipoFijo = registro ? registro.eq : eqCod;
        inspPiezas = registro ? (registro.piezas || []).map((p) => ({ ...p, cod: p.cod || "", d: p.d || "", q: p.q || "", urgencia: p.urgencia || "media", tipo: p.tipo || "pieza" })) : [];

        sel.innerHTML = PLAN_EQUIPOS.map((e) => `<option value="${planEsc(e.c)}">${planEsc(e.n)}</option>`).join("");
        form.reset();
        // Un equipo que ya no este en el listado oficial no debe perderse al editar.
        if (inspEquipoFijo && !PLAN_EQUIPOS.some((e) => e.c === inspEquipoFijo)) {
          sel.insertAdjacentHTML("afterbegin", `<option value="${planEsc(inspEquipoFijo)}">${planEsc(inspNombreEquipo(inspEquipoFijo))}</option>`);
        }
        if (inspEquipoFijo) sel.value = inspEquipoFijo;

        form.fecha.value = registro ? (registro.fecha || bogotaToday()) : bogotaToday();
        form.tipo.value = registro && INSP_TIPOS[registro.tipo] ? registro.tipo : "rutina";
        form.quien.value = registro ? (registro.quien || "") : "";
        form.revisado.value = registro ? (registro.revisado || "") : "";
        form.hallazgos.value = registro ? (registro.hallazgos || "") : "";
        form.estado.value = registro ? ((registro.estado || "abierta") === "cerrada" ? "cerrada" : "abierta") : "abierta";

        const titulo = document.getElementById("inspSheetTitulo");
        const boton = document.getElementById("inspSubmitBtn");
        const estadoWrap = document.getElementById("inspEstadoWrap");
        if (titulo) titulo.textContent = registro ? "Editar inspección" : "Anotar inspección";
        if (boton) boton.textContent = registro ? "Guardar cambios" : "Guardar inspección";
        if (estadoWrap) estadoWrap.hidden = !registro; // una nueva nace abierta

        inspPintarPiezas();
        inspPintarChecklist();
        document.getElementById("inspSheetBackdrop").hidden = false;
        document.getElementById("inspSheet").hidden = false;
      }

      function inspCerrarForm() {
        const s = document.getElementById("inspSheet");
        const b = document.getElementById("inspSheetBackdrop");
        if (s) s.hidden = true;
        if (b) b.hidden = true;
        inspEditandoId = "";
      }

      // Qué es cada hallazgo: una pieza para cambiar, o un trabajo sin repuesto
      const INSP_HALLAZGO = { pieza: "Cambio de pieza", mecanica: "Mecánica", electrica: "Eléctrica", desgaste: "Desgaste / ajuste", otro: "Otro" };

      // Qué revisar en el equipo elegido: las tareas del manual (ficha completa)
      // y las posiciones que se siguen en Mantenimiento. Marcar un punto lo
      // anota en "Qué se revisó".
      function inspPuntosDe(eqCod) {
        const m = machines.find((x) => { const e = equipoDeMachine(x); return (e && e.c === eqCod) || x.equipoCod === eqCod; });
        const puntos = [];
        ((m && m.maintenanceTasks) || []).forEach((t) => { if (t && t.name) puntos.push({ t: t.name, s: [t.system, t.frequency].filter(Boolean).join(" · ") }); });
        (window.COMPONENTES_SEGUIDOS || []).filter((g) => g.eq === eqCod).forEach((g) => (g.items || []).forEach((it) => puntos.push({ t: `${g.titulo}: ${it.ubicacion || it.d}`, s: it.d || "" })));
        return puntos;
      }
      function inspPintarChecklist() {
        const cont = document.getElementById("inspChecklist");
        const form = document.getElementById("inspForm");
        if (!cont || !form) return;
        const puntos = inspPuntosDe(form.eq.value);
        const hechos = new Set(String(form.revisado.value || "").split("\n").filter((l) => l.startsWith("✓ ")).map((l) => l.slice(2).trim()));
        cont.innerHTML = puntos.length
          ? `<details class="in-check__caja" ${hechos.size ? "open" : ""}><summary>Qué revisar en este equipo <span>${puntos.length} puntos</span></summary>
              <div class="in-check__lista">${puntos.map((p, i) => `<label class="in-check__p"><input type="checkbox" data-i="${i}" ${hechos.has(p.t) ? "checked" : ""} onchange="inspMarcarPunto(this)"><span><b>${planEsc(p.t)}</b>${p.s ? `<small>${planEsc(p.s)}</small>` : ""}</span></label>`).join("")}</div>
            </details>`
          : '<p class="pl-soft in-check__vacio">Este equipo aún no tiene puntos de revisión: salen de su manual cuando se carga la ficha completa.</p>';
        cont._puntos = puntos;
      }
      // Los puntos marcados van como líneas "✓ …" al principio de "Qué se revisó"
      function inspMarcarPunto(caja) {
        const form = document.getElementById("inspForm");
        const cont = document.getElementById("inspChecklist");
        if (!form || !cont) return;
        const marcados = [...cont.querySelectorAll("input[type=checkbox]:checked")].map((c) => "✓ " + cont._puntos[+c.dataset.i].t);
        const resto = String(form.revisado.value || "").split("\n").filter((l) => !l.startsWith("✓ ") && l.trim());
        form.revisado.value = [...marcados, ...resto].join("\n");
      }

      function inspAnadirPieza() {
        inspPiezas.push({ cod: "", d: "", q: "", urgencia: "media", tipo: "pieza" });
        inspPintarPiezas();
      }

      function inspQuitarPieza(i) { inspPiezas.splice(i, 1); inspPintarPiezas(); }

      function inspEditarPieza(i, campo, valor) { if (inspPiezas[i]) inspPiezas[i][campo] = valor; }

      function inspPintarPiezas() {
        const cont = document.getElementById("inspPiezas");
        if (!cont) return;
        cont.innerHTML = inspPiezas.length
          ? inspPiezas.map((p, i) => `<div class="in-fila in-fila--h">
              <select class="in-tipo" aria-label="Tipo de hallazgo" onchange="inspEditarPieza(${i}, 'tipo', this.value)">
                ${Object.entries(INSP_HALLAZGO).map(([k, v]) => `<option value="${k}" ${(p.tipo || "pieza") === k ? "selected" : ""}>${planEsc(v)}</option>`).join("")}
              </select>
              <input class="in-desc" placeholder="Qué hay que hacer o qué pieza" value="${planEsc(p.d)}" oninput="inspEditarPieza(${i}, 'd', this.value)">
              <input class="in-cod" placeholder="Código (si es pieza)" value="${planEsc(p.cod)}" oninput="inspEditarPieza(${i}, 'cod', this.value)">
              <input class="in-q" placeholder="Cant." value="${planEsc(p.q)}" oninput="inspEditarPieza(${i}, 'q', this.value)">
              <select class="in-urg" aria-label="Urgencia" onchange="inspEditarPieza(${i}, 'urgencia', this.value)">
                ${Object.entries(INSP_URGENCIA).map(([k, v]) => `<option value="${k}" ${p.urgencia === k ? "selected" : ""}>${planEsc(v)}</option>`).join("")}
              </select>
              <label class="in-ya" title="Algo menor que se resolvió en la misma inspección"><input type="checkbox" ${p.hecho ? "checked" : ""} onchange="inspEditarPieza(${i}, 'hecho', this.checked ? (this.form.fecha.value || bogotaToday()) : '')">Resuelto ya</label>
              <button type="button" class="in-quitar" onclick="inspQuitarPieza(${i})" aria-label="Quitar">&times;</button>
            </div>`).join("")
          : '<p class="pl-soft">Ninguno todavía. Si la revisión no encontró nada, déjalo vacío.</p>';
      }

      function inspGuardar(e) {
        e.preventDefault();
        const f = e.target;
        const fecha = String(f.fecha.value || "").slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { window.alert("Pon una fecha válida."); return; }
        if (!f.eq.value) { window.alert("Elige el equipo."); return; }

        const escrito = {
          eq: f.eq.value,
          fecha,
          tipo: f.tipo.value,
          quien: String(f.quien.value || "").trim(),
          revisado: String(f.revisado.value || "").trim(),
          hallazgos: String(f.hallazgos.value || "").trim(),
          piezas: inspPiezas.filter((p) => (p.cod || "").trim() || (p.d || "").trim()).map((p) => { const x = { ...p }; if (!x.hecho) delete x.hecho; return x; })
        };

        const editada = inspEditandoId ? inspecciones.find((x) => x.id === inspEditandoId) : null;
        if (inspEditandoId && !editada) { window.alert("Esa inspección ya no está; no se guardaron los cambios."); inspCerrarForm(); renderInspecciones(); return; }

        if (editada) {
          Object.assign(editada, escrito);
          editada.estado = f.estado.value === "cerrada" ? "cerrada" : "abierta";
          editada.editadoAt = new Date().toISOString();
        } else {
          inspecciones.unshift(Object.assign({
            id: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            estado: "abierta",
            createdAt: new Date().toISOString()
          }, escrito));
        }

        saveInsp();
        inspCerrarForm();
        renderInspecciones();
      }

      function goInsp() {
        setView("insp");
        renderInspecciones();
        saveUiState({ activeView: "insp" });
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !document.getElementById("inspSheet")?.hidden) inspCerrarForm();
      });

      inspSubscribe();

      // ======================================================================
      //  TURNOS DEL PERSONAL
      //  Tambien estaba suelto en turnos.html. Calcula la rotacion del ciclo de
      //  6 dias (2 dia, 2 noche, 2 descanso) a partir del cuadro de julio de 2026.
      // ======================================================================
      // Los datos de los turnos viven en assets/js/turnos-data.js (window.TURNOS).
      const TN_ROSTER = window.TURNOS.roster;
      const TN_FIJOS = window.TURNOS.fijos;
      const TN_SUPPORT = window.TURNOS.soporte;
      const TN_ANCHOR = window.TURNOS.ancla;
      const TN_CICLO = window.TURNOS.ciclo;
      const TN_BLOQUE = window.TURNOS.bloque;
      const TN_PHASE_BLOCKS = window.TURNOS.fases;
      const TN_INFO = {
        dia: { icon: "", label: "Día", cls: "tn--dia" },
        noche: { icon: "", label: "Noche", cls: "tn--noche" },
        descanso: { icon: "", label: "Descanso", cls: "tn--descanso" }
      };
      let tnSede = "sede4";
      let tnTurno = "todos";

      function tnEstadoDe(phase, dateStr) {
        const d = Date.parse(dateStr + "T00:00:00Z");
        const days = Math.floor((d - TN_ANCHOR) / 86400000);
        const n = ((days % TN_CICLO) + TN_CICLO) % TN_CICLO;
        return TN_PHASE_BLOCKS[phase][Math.floor(n / TN_BLOQUE)];
      }
      // Un miembro puede ser "Nombre" o { n, desde, hasta } (fechas AAAA-MM-DD, ambas opcionales).
      const tnNombre = (m) => (typeof m === "string" ? m : m.n);
      const tnVigente = (m, fecha) => typeof m === "string" || ((!m.desde || fecha >= m.desde) && (!m.hasta || fecha <= m.hasta));
      function tnIniciales(nombre) { const p = String(nombre).trim().split(/\s+/); return ((p[0] || "")[0] || "") + ((p[1] || "")[0] || ""); }

      function renderTurnos() {
        const campo = document.getElementById("tnFecha");
        if (!campo) return;
        const fecha = campo.value || bogotaToday();
        const d = new Date(fecha + "T12:00:00Z");
        document.getElementById("tnDatebar").innerHTML =
          d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).replace(/^\w/, (c) => c.toUpperCase()) +
          ` &nbsp;·&nbsp; <span>${escapeHtml(TN_ROSTER[tnSede].label)}</span>`;

        const buckets = { dia: [], noche: [], descanso: [] };
        TN_ROSTER[tnSede].groups.forEach((g) => {
          const members = g.members.filter((m) => tnVigente(m, fecha)).map(tnNombre);
          if (members.length) buckets[tnEstadoDe(g.phase, fecha)].push({ ...g, members });
        });

        const espBadge = (nombre) => {
          const esp = window.TURNOS?.especialidad?.(nombre) || { rol: "Mecánico", slug: "mec" };
          return `<span class="tn-tag tn-tag--${esp.slug}">${escapeHtml(esp.rol)}</span>`;
        };

        const grid = document.getElementById("tnShiftGrid");
        grid.innerHTML = ["dia", "noche", "descanso"].map((est) => {
          if (tnTurno !== "todos" && tnTurno !== est) return "";
          const info = TN_INFO[est];
          const groups = buckets[est];
          // Los de turno fijo van siempre en la tarjeta de día: trabajan de 8 a 20
          // todos los días laborables, no rotan con su grupo.
          const fijos = est === "dia" ? (TN_FIJOS[tnSede] || []).filter((f) => tnVigente({ n: f.nombre, desde: f.desde, hasta: f.hasta }, fecha)) : [];
          const rotan = groups.length
            ? groups.map((g) => `<div class="tn-group">${escapeHtml(g.name)}</div><ul class="tn-people">${g.members.map((m) => `<li><span class="tn-ini">${escapeHtml(tnIniciales(m).toUpperCase())}</span><span>${escapeHtml(m)} ${espBadge(m)}</span></li>`).join("")}</ul>`).join("")
            : "";
          const bloqueFijos = fijos.length
            ? `<div class="tn-group">Turno fijo</div><ul class="tn-people">${fijos.map((f) => `<li><span class="tn-ini">${escapeHtml(tnIniciales(f.nombre).toUpperCase())}</span><span>${escapeHtml(f.nombre)} ${espBadge(f.nombre)}<span class="tn-fijo">${escapeHtml(f.horario)} &middot; ${escapeHtml(f.grupo)}</span></span></li>`).join("")}</ul>`
            : "";
          const body = (rotan + bloqueFijos) || '<p class="tn-empty">—</p>';
          return `<section class="tn-card ${info.cls}"><div class="tn-head">${info.icon} ${info.label}</div><div class="tn-body">${body}</div></section>`;
        }).join("");
        const visibles = tnTurno === "todos" ? 3 : 1;
        grid.style.gridTemplateColumns = window.innerWidth <= 760 ? "1fr" : `repeat(${visibles}, minmax(0,1fr))`;
        grid.style.maxWidth = visibles === 1 ? "460px" : "none";

        // El personal de apoyo no rota: solo tiene sentido verlo con el turno de día.
        const soporte = document.getElementById("tnSupport");
        const mostrar = (tnTurno === "todos" || tnTurno === "dia");
        soporte.innerHTML = mostrar
          ? `<h3>Personal de apoyo · turno fijo</h3>
             <p class="tn-sub">Trabajan horario fijo de día (no rotan). Cubren ambas sedes.</p>
             <div class="tn-support-grid">${TN_SUPPORT.map((s) => `<div class="tn-support-item"><b>${escapeHtml(s.area)}</b><div>${s.members.map((m) => `${escapeHtml(m)} ${espBadge(m)}`).join("<br>")}</div></div>`).join("")}</div>`
          : "";
        soporte.hidden = !mostrar;
      }

      function goTurnos() {
        setView("turnos");
        const campo = document.getElementById("tnFecha");
        if (campo && !campo.value) campo.value = bogotaToday();
        renderTurnos();
        saveUiState({ activeView: "turnos" });
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      document.getElementById("tnSegSede")?.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        tnSede = b.dataset.sede;
        [...e.currentTarget.children].forEach((x) => x.classList.toggle("is-active", x === b));
        renderTurnos();
      });
      document.getElementById("tnSegTurno")?.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        tnTurno = b.dataset.turno;
        [...e.currentTarget.children].forEach((x) => x.classList.toggle("is-active", x === b));
        renderTurnos();
      });
      document.getElementById("tnFecha")?.addEventListener("change", renderTurnos);
      document.getElementById("tnHoyBtn")?.addEventListener("click", () => {
        const campo = document.getElementById("tnFecha");
        if (campo) campo.value = bogotaToday();
        renderTurnos();
      });
      window.addEventListener("resize", () => { if (document.getElementById("turnosView")?.classList.contains("is-active")) renderTurnos(); });



      // ======================================================================
      //  PLAN DE MANTENIMIENTO POR EQUIPO
      //  Catalogo importado del Excel de la empresa (assets/equipos.js):
      //  "MANTENIMIENTO POR SISTEMAS CON RESALTADOR.xlsm", hoja "PLAN MTTO".
      //  Del Excel se usa solo lo que es estable: equipo, sistema, actividad,
      //  codigo interno, repuesto, cantidad y existencia.
      //  Las columnas de frecuencia, ultimo/proximo mantenimiento y estado NO se
      //  muestran: esa frecuencia estaba puesta a mano y no reflejaba la planta.
      //  A partir de ahora la frecuencia se MIDE del historial de cambios reales.
      // ======================================================================
      const planFilter = { q: "", ub: "", act: "", sinStock: false, hist: "" };
      const planHistOpen = new Set();
      let planLimit = 15;

      // ----------------------------------------------------------------------
      //  Historial de cambios: la frecuencia se mide, no se hereda.
      //  Cada vez que una pieza se cambia o se solicita queda un evento con fecha.
      //  Con un evento todavia no hay frecuencia; con dos ya hay un intervalo real;
      //  con tres o mas, un promedio y una estimacion del proximo cambio.
      //  Se guarda en la nube (Firebase) igual que las tareas, para que lo que
      //  registre un tecnico lo vean todos; si no hay nube, queda en el navegador.
      // ----------------------------------------------------------------------
      // ----------------------------------------------------------------------
      //  LO QUE SE ESCRIBE A MANO EN LA TABLA DE REPUESTOS
      //  El código interno y la existencia no vienen fiables del Excel: el código
      //  falta en casi todos los equipos y la existencia es una foto vieja. Se
      //  dejan editables y lo que se escribe se guarda en la nube, igual que las
      //  tareas y el historial, para que lo vea todo el taller y no solo quien
      //  lo escribió.
      // ----------------------------------------------------------------------
      const datosKey = "equipos-datos-repuesto-v1";
      let datosRep = loadDatosRep();
      let datosVisto = new Map();
      const datosNube = { conectado: false, error: "" };

      function loadDatosRep() { try { return JSON.parse(localStorage.getItem(datosKey) || "{}"); } catch { return {}; } }
      function saveDatosLocal() { try { localStorage.setItem(datosKey, JSON.stringify(datosRep)); } catch (e) {} }

      // Clave estable de una fila: el código interno si lo tiene, y si no el
      // sistema y la descripción, que es lo único que no cambia entre importaciones.
      function datoClave(eq, r) { return eq.c + "|" + (r.cod || ("d:" + (r.s || "") + "·" + (r.d || "")).slice(0, 90)); }
      function datoDe(eq, r) { return datosRep[datoClave(eq, r)] || {}; }

      function guardarDato(clave, campo, valor) {
        const actual = datosRep[clave] || { id: clave };
        const limpio = String(valor ?? "").trim();
        if (limpio === "") delete actual[campo]; else actual[campo] = limpio;
        actual.id = clave;
        actual.actualizado = new Date().toISOString();
        if (Object.keys(actual).filter((k) => k !== "id" && k !== "actualizado").length === 0) delete datosRep[clave];
        else datosRep[clave] = actual;
        saveDatosLocal();
        if (cloud.enabled && cloud.db) datosSync();
      }

      function datosSync() {
        try { subirCambiados("datos", Object.values(datosRep), datosVisto, encodeURIComponent); } catch (e) { console.error("[Datos] datosSync:", e); }
      }

      function datosSubscribe() {
        if (!(cloud.enabled && cloud.db)) return;
        cloud.db.collection("datos").onSnapshot({ includeMetadataChanges: true }, (snap) => {
          const remoto = {};
          snap.forEach((d) => { const v = d.data(); if (v && v.id) remoto[v.id] = v; });
          datosRep = remoto;
          datosVisto = vistoDe(Object.values(remoto));
          datosNube.conectado = !snap.metadata.fromCache;
          datosNube.error = "";
          saveDatosLocal();
          renderFichaSiVisible();
        }, (err) => { datosNube.conectado = false; datosNube.error = err && err.code ? err.code : "error"; console.error("[Datos] onSnapshot:", err); });
      }

      // Lo que escribe el usuario manda sobre lo que traía el Excel.
      function repCodigo(eq, r) { return datoDe(eq, r).cod || r.cod || ""; }
      function repExistencia(eq, r) { const v = datoDe(eq, r).exist; return v === undefined ? "" : v; }

      // LA existencia de una pieza, con su procedencia. Antes cada sitio resolvia
      // esto por su cuenta ("lo escrito a mano, y si no lo del Excel"), repetido en
      // cuatro lugares y sin contar el portal. Ahora se decide aqui y una sola vez:
      //   mano (lo contado en el estante) > portal (MiPortal) > Excel (foto vieja)
      // Devuelve tambien de donde salio, para poder decirlo en pantalla: un numero
      // de almacen sin fecha al lado no se puede usar para decidir si pedir o no.
      function existenciaEfectiva(eq, r) {
        const manual = datoDe(eq, r).exist;
        if (manual !== undefined && String(manual).trim() !== "") {
          const n = Number(manual);
          return { v: Number.isFinite(n) ? n : 0, fuente: "mano" };
        }
        const cod = repCodigo(eq, r);
        const inv = cod && window.INVENTARIO ? window.INVENTARIO.de(cod) : null;
        if (inv && inv.exist !== null && inv.exist !== undefined) {
          return { v: Number(inv.exist) || 0, fuente: "portal", actualizado: inv.actualizado, ub: inv.ub, min: inv.min, consumo: inv.consumo };
        }
        // Hay inventario del portal, pero esta pieza no sale en el. No es lo mismo
        // que no tener portal: el reporte de repuestos no lista los articulos en
        // cero, asi que lo mas probable es que se haya agotado. Se sigue enseñando
        // la cifra del Excel porque es lo unico que hay, pero marcada aparte: dar
        // por buenas "28 paletas" de hace meses es peor que decir que no se sabe.
        if (window.INVENTARIO?.cargado) return { v: Number(r.e) || 0, fuente: "sin-registro" };
        return { v: Number(r.e) || 0, fuente: "excel" };
      }
      function existenciaDe(eq, r) { return existenciaEfectiva(eq, r).v; }

      function editarDato(input, clave, campo) {
        guardarDato(clave, campo, input.value);
        renderFichaSiVisible();
      }

      const cambiosKey = "equipos-cambios-v1";
      const CAMBIOS_SEED_ID = "__seed_ago2026";
      let cambios = loadCambios();
      let cambiosVisto = new Map();
      // Si el historial no llega a la nube hay que verlo en pantalla: si no, parece
      // compartido con el resto del taller y en realidad solo esta en este navegador.
      const cambiosNube = { conectado: false, error: "" };

      function loadCambios() { try { return JSON.parse(localStorage.getItem(cambiosKey) || "[]"); } catch { return []; } }
      function saveCambiosLocal() { try { localStorage.setItem(cambiosKey, JSON.stringify(cambios)); } catch (e) {} }
      function saveCambios() {
        saveCambiosLocal();
        if (cloud.enabled && cloud.db) cambiosSync();
        renderPlanIfVisible();
        window.segRenderSiVisible?.();
      }

      function cambiosSync() {
        try { subirCambiados("cambios", cambios, cambiosVisto); } catch (e) { console.error("[Cambios] cambiosSync:", e); }
      }

      function cambiosSubscribe() {
        if (!(cloud.enabled && cloud.db)) { cambiosSeedIfNeeded(); return; }
        cloud.db.collection("cambios").onSnapshot({ includeMetadataChanges: true }, (snap) => {
          const remote = [];
          snap.forEach((d) => remote.push(d.data()));
          cambios = remote;
          cambiosVisto = vistoDe(remote);
          window.diarioRenderSiVisible?.();
          cambiosNube.conectado = !snap.metadata.fromCache;
          cambiosNube.error = "";
          saveCambiosLocal();
          // Solo con la respuesta del servidor: la primera respuesta de un
          // navegador nuevo sale de su copia local, vacía, y sembraría otra vez
          // (y reviviría lo que alguien borró a propósito).
          if (!snap.metadata.fromCache) cambiosSeedIfNeeded();
          renderPlanIfVisible();
        }, (err) => {
          cambiosNube.conectado = false;
          cambiosNube.error = err && err.code ? err.code : "error";
          console.error("[Cambios] onSnapshot:", err);
          // Sin nube se siembra solo para verlo aquí, sin subir nada
          cambiosSeedIfNeeded({ soloLocal: true });
          renderPlanIfVisible();
        });
      }

      // La inspeccion de agosto de 2026 es el primer evento de las 13 piezas de la GKF 2600.
      // Se siembra una sola vez: queda una marca en la propia coleccion para que no vuelva
      // a sembrarse en otro dispositivo ni resucite lo que alguien borre a proposito.
      function cambiosSemilla() {
        const items = (typeof GKF_INSPECCION !== "undefined" ? GKF_INSPECCION.items : []) || [];
        return items.map((item) => {
          const cod = (typeof INTERNAL_CODES !== "undefined" && INTERNAL_CODES[item.r]) || "";
          if (!cod) return null;
          return {
            id: "seed-ago2026-" + cod,
            eq: "17333005",
            cod,
            ref: item.r,
            d: item.d,
            fecha: "2026-08-25",
            q: parseInt(item.q, 10) || 1,
            quien: "",
            nota: "Inspeccion de agosto de 2026 (primer cambio registrado)",
            createdAt: "2026-08-25T00:00:00.000Z"
          };
        }).filter(Boolean);
      }

      function cambiosSeedIfNeeded(op = {}) {
        if (cambios.some((c) => c.id === CAMBIOS_SEED_ID)) return;
        const semilla = cambiosSemilla();
        if (!semilla.length) return;
        const tengo = new Set(cambios.map((c) => c.id));
        semilla.forEach((ev) => { if (!tengo.has(ev.id)) cambios.push(ev); });
        cambios.push({ id: CAMBIOS_SEED_ID, marca: true, createdAt: new Date().toISOString() });
        if (op.soloLocal) { saveCambiosLocal(); return; }
        saveCambios();
      }

      function cambiosEventos() {
        const propios = cambios.filter((c) => c && c.id !== CAMBIOS_SEED_ID && c.cod);
        // Los del registro del repositorio (componentes-registro.js), salvo que
        // alguien ya haya anotado ese mismo cambio a mano
        const ya = new Set(propios.filter((c) => c.ubic).map((c) => c.ubic + "|" + c.fecha));
        return propios.concat(compEventosRegistro().filter((e) => !ya.has(e.ubic + "|" + e.fecha)));
      }

      // Historial de una pieza en una maquina, de la mas antigua a la mas reciente.
      // Se agrupa por codigo interno: es la unidad con la que se pide en almacen, asi que
      // si el mismo codigo aparece en dos sistemas de la maquina comparten historial.
      // Cambios registrados de piezas que el Excel no lista para ese equipo. Pasa con
      // 8 de las 13 de la inspeccion de agosto: son piezas reales, pero el plan no las tenia.
      function planSueltosDe(eq) {
        const enPlan = new Set(eq.r.map((r) => r.cod).filter(Boolean));
        const porCod = new Map();
        cambiosEventos()
          .filter((c) => c.eq === eq.c && !enPlan.has(c.cod))
          .forEach((c) => {
            if (!porCod.has(c.cod)) porCod.set(c.cod, []);
            porCod.get(c.cod).push(c);
          });
        return [...porCod.entries()]
          .map(([cod, lista]) => ({ cod, lista: lista.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))) }))
          .sort((a, b) => a.cod.localeCompare(b.cod));
      }

      function planCambiosDe(equipo, cod) {
        if (!cod) return [];
        return cambiosEventos()
          .filter((c) => c.eq === equipo && c.cod === cod)
          .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      }

      function planParseFecha(valor) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor || ""));
        return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : NaN;
      }
      function planDiasEntre(desde, hasta) { return Math.round((planParseFecha(hasta) - planParseFecha(desde)) / 86400000); }
      function planSumarDias(fecha, dias) {
        const t = planParseFecha(fecha);
        if (!isFinite(t)) return "";
        return new Date(t + dias * 86400000).toISOString().slice(0, 10);
      }
      function planFmtDias(dias) {
        if (!isFinite(dias)) return "";
        if (dias < 45) return `${dias} d\u00edas`;
        const meses = Math.round(dias / 30.44);
        if (meses < 24) return `${meses} meses`;
        return `${String(Math.round((dias / 365.25) * 10) / 10).replace(".", ",")} a\u00f1os`;
      }

      // Frecuencia observada: el promedio de los intervalos entre cambios consecutivos.
      function planMedicion(historial) {
        if (historial.length < 2) return null;
        const intervalos = [];
        for (let i = 1; i < historial.length; i++) intervalos.push(planDiasEntre(historial[i - 1].fecha, historial[i].fecha));
        const validos = intervalos.filter((d) => isFinite(d) && d > 0);
        if (!validos.length) return null;
        const prom = Math.round(validos.reduce((a, b) => a + b, 0) / validos.length);
        const ultimo = historial[historial.length - 1].fecha;
        return { prom, mediciones: validos.length, ultimo, proximo: planSumarDias(ultimo, prom) };
      }

      function planFreqLabel(f) { return f || ""; }
      function planEsc(v) { return String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

      // Igual que normalize() pero sin recortar los extremos, para que las posiciones
      // del texto original y las del texto normalizado sigan coincidiendo.
      function planPlain(value) {
        return String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      // Parte la busqueda en palabras: "rodamiento 6000" encuentra "RODAMIENTO DE BOLA REF 6000 ZZ".
      function planTokens(query) {
        return normalize(query).split(/\s+/).filter(Boolean);
      }

      // Resalta cada palabra buscada dentro del texto (escapando siempre el original).
      function planMark(text, tokens) {
        const raw = String(text ?? "");
        if (!tokens || !tokens.length || !raw) return planEsc(raw);
        const plain = planPlain(raw);
        const hits = [];
        tokens.forEach((token) => {
          let at = plain.indexOf(token);
          while (at >= 0) { hits.push([at, at + token.length]); at = plain.indexOf(token, at + token.length); }
        });
        if (!hits.length) return planEsc(raw);
        hits.sort((a, b) => a[0] - b[0]);
        const merged = [];
        hits.forEach((hit) => {
          const last = merged[merged.length - 1];
          if (last && hit[0] <= last[1]) last[1] = Math.max(last[1], hit[1]);
          else merged.push([hit[0], hit[1]]);
        });
        let out = "";
        let pos = 0;
        merged.forEach(([from, to]) => {
          out += planEsc(raw.slice(pos, from)) + '<span class="pl-hit">' + planEsc(raw.slice(from, to)) + "</span>";
          pos = to;
        });
        return out + planEsc(raw.slice(pos));
      }

      // Coincide si TODAS las palabras buscadas aparecen en algun campo de la linea.
      function planRowMatches(row, tokens) {
        if (!tokens.length) return true;
        const hay = planPlain([row.cod, row.d, row.s, row.a].join(" "));
        return tokens.every((token) => hay.includes(token));
      }

      // Devuelve [{ eq, rows }] aplicando la busqueda y los filtros de la barra.
      function planFiltered() {
        const tokens = planTokens(planFilter.q);
        const out = [];
        PLAN_EQUIPOS.forEach((eq) => {
          if (planFilter.ub && eq.u !== planFilter.ub) return;
          const eqHay = planPlain([eq.n, eq.c, eq.tipo].join(" "));
          const eqHit = tokens.length > 0 && tokens.every((token) => eqHay.includes(token));
          const rows = eq.r.filter((row) => {
            if (planFilter.act && row.a !== planFilter.act) return false;
            if (planFilter.sinStock && existenciaDe(eq, row) > 0) return false;
            if (planFilter.hist) {
              const historial = planCambiosDe(eq.c, row.cod);
              if (planFilter.hist === "con" && !historial.length) return false;
              if (planFilter.hist === "sin" && historial.length) return false;
              if (planFilter.hist === "medida" && !planMedicion(historial)) return false;
            }
            return eqHit || planRowMatches(row, tokens);
          });
          if (rows.length) out.push({ eq, rows });
        });
        return out;
      }

      // Chip de estado del historial: compartido, sin conexion o solo en este equipo.
      function planNubeChip() {
        if (!cloud.enabled) {
          return '<span class="pl-nube pl-nube--local" title="No hay configuraci\u00f3n de nube: el historial queda solo en este navegador">Historial solo en este equipo</span>';
        }
        if (cambiosNube.error) {
          return `<span class="pl-nube pl-nube--bad" title="La nube rechaz\u00f3 el historial (${planEsc(cambiosNube.error)}). Se est\u00e1 guardando solo en este navegador; hay que permitir la colecci\u00f3n &quot;cambios&quot; en las reglas de Firestore.">Historial sin compartir</span>`;
        }
        if (cambiosNube.conectado) {
          return '<span class="pl-nube pl-nube--ok" title="El historial se comparte en tiempo real con el resto del taller">Historial compartido</span>';
        }
        return '<span class="pl-nube pl-nube--wait" title="Sin conexi\u00f3n con la nube: se sincronizar\u00e1 al reconectar">Historial sin conexi\u00f3n</span>';
      }

      function renderPlanIfVisible() {
        const vista = document.getElementById("planView");
        if (vista && vista.classList.contains("is-active")) renderPlan();
        renderFichaSiVisible();
      }

      function renderPlan() {
        const root = document.getElementById("planRoot");
        if (!root) return;
        if (!EQ_DATA) {
          root.innerHTML = '<div class="pl-empty"><h3>No se pudo cargar el plan</h3><p>Falta el archivo <code>assets/equipos.js</code>. Recarga la p&aacute;gina; si sigue igual, avisa a mantenimiento.</p></div>';
          return;
        }

        const groups = planFiltered();
        const rows = groups.flatMap((g) => g.rows);
        const noStock = groups.reduce((n, g) => n + g.rows.filter((r) => existenciaDe(g.eq, r) === 0).length, 0);
        let conHistorial = 0;
        let conMedida = 0;
        groups.forEach(({ eq, rows: rr }) => rr.forEach((r) => {
          const historial = planCambiosDe(eq.c, r.cod);
          if (historial.length) conHistorial++;
          if (planMedicion(historial)) conMedida++;
        }));

        const acts = [...new Set(PLAN_EQUIPOS.flatMap((e) => e.r.map((r) => r.a)).filter(Boolean))].sort();
        const ubis = [...new Set(PLAN_EQUIPOS.map((e) => e.u).filter(Boolean))].sort();
        const shown = groups.slice(0, planLimit);
        const query = planTokens(planFilter.q);

        root.innerHTML = `
          <div class="section-bar">
            <div>
              <p class="eyebrow">Mantenimiento</p>
              <h2>Plan de mantenimiento por equipo</h2>
            </div>
            <div class="section-actions">
              ${planNubeChip()}
              <span class="counter">${groups.length} ${groups.length === 1 ? "equipo" : "equipos"} &middot; ${rows.length} ${rows.length === 1 ? "repuesto" : "repuestos"}</span>
              <button class="button button--light" type="button" onclick="planExport()">Exportar CSV</button>
            </div>
          </div>

          ${planAvisoInventario()}

          <div class="pl-kpis">
            <div class="pl-kpi"><span class="pl-kpi__n">${groups.length}</span><span class="pl-kpi__l">Equipos</span></div>
            <div class="pl-kpi"><span class="pl-kpi__n">${rows.length}</span><span class="pl-kpi__l">Repuestos</span></div>
            <div class="pl-kpi pl-kpi--stock"><span class="pl-kpi__n">${noStock}</span><span class="pl-kpi__l">Sin existencia</span></div>
            <div class="pl-kpi pl-kpi--ok"><span class="pl-kpi__n">${conHistorial}</span><span class="pl-kpi__l">Con cambios registrados</span></div>
            <div class="pl-kpi pl-kpi--warn"><span class="pl-kpi__n">${conMedida}</span><span class="pl-kpi__l">Con frecuencia medida</span></div>
          </div>

          <div class="pl-filters">
            <input type="search" id="planSearch" placeholder="Buscar equipo, c&oacute;digo interno, repuesto o sistema&hellip;" value="${planEsc(planFilter.q)}" oninput="planSetFilter('q', this.value)" aria-label="Buscar en el plan de mantenimiento">
            <select onchange="planSetFilter('ub', this.value)" aria-label="Filtrar por ubicaci&oacute;n">
              <option value="">Todas las ubicaciones</option>
              ${ubis.map((u) => `<option value="${planEsc(u)}" ${planFilter.ub === u ? "selected" : ""}>${planEsc(u)}</option>`).join("")}
            </select>
            <select onchange="planSetFilter('act', this.value)" aria-label="Filtrar por actividad">
              <option value="">Todas las actividades</option>
              ${acts.map((a) => `<option value="${planEsc(a)}" ${planFilter.act === a ? "selected" : ""}>${planEsc(a)}</option>`).join("")}
            </select>
            <select onchange="planSetFilter('hist', this.value)" aria-label="Filtrar por historial">
              <option value="">Con y sin historial</option>
              <option value="con" ${planFilter.hist === "con" ? "selected" : ""}>Solo con cambios registrados</option>
              <option value="medida" ${planFilter.hist === "medida" ? "selected" : ""}>Solo con frecuencia medida</option>
              <option value="sin" ${planFilter.hist === "sin" ? "selected" : ""}>Solo sin registrar todav&iacute;a</option>
            </select>
            <label class="pl-chk"><input type="checkbox" ${planFilter.sinStock ? "checked" : ""} onchange="planSetFilter('sinStock', this.checked)"> Solo sin existencia</label>
          </div>

          ${shown.length ? shown.map((g) => planEquipoCard(g, query)).join("") : '<div class="pl-empty"><h3>Nada coincide con ese filtro</h3><p>Prueba con el c&oacute;digo interno (9 d&iacute;gitos), el nombre del repuesto o el del equipo.</p></div>'}
          ${groups.length > shown.length ? `<button class="pl-more" type="button" onclick="planShowMore()">Ver ${groups.length - shown.length} equipos m&aacute;s</button>` : ""}`;
      }


      // Las inspecciones de este equipo, dentro de su ficha.
      // ── Componentes seguidos por posición (assets/js/componentes-registro.js) ──
      // Un bloque por posición (p. ej. cada correa de la Blister 2): dónde va,
      // qué código lleva, cuándo se cambió, cuándo se inspeccionó por última vez
      // y cuándo se va a necesitar otra, con de dónde sale ese estimado.
      function compGrupos(eqCod) { return (window.COMPONENTES_SEGUIDOS || []).filter((g) => g && g.eq === eqCod); }
      function compEventosRegistro() {
        const out = [];
        (window.COMPONENTES_SEGUIDOS || []).forEach((g) => (g.items || []).forEach((it) => (it.cambios || []).forEach((c) => out.push({
          id: `reg-${it.id}-${c.fecha}`, eq: g.eq, cod: it.cod, d: it.d, fecha: c.fecha, q: 1, quien: "",
          nota: it.ubicacion + (c.nota ? " · " + c.nota : "") + (c.fuente ? " (" + c.fuente + ")" : ""),
          ubic: it.id, registro: true
        }))));
        return out;
      }
      // "1A" cada año, "1B" cada dos (bienal), "6M" cada seis meses… como en el plan del Excel
      function compFreqDias(f) {
        const m = /^(\d+(?:[.,]\d+)?)\s*([AMB])$/i.exec(String(f || "").trim());
        if (!m) return 0;
        const n = Number(m[1].replace(",", "."));
        return Math.round(m[2].toUpperCase() === "M" ? n * 30.44 : m[2].toUpperCase() === "B" ? n * 730.5 : n * 365.25);
      }
      function compFreqTexto(dias) {
        if (dias >= 700) return `cada ${Math.round(dias / 365.25 * 10) / 10} años`.replace(".", ",");
        if (dias >= 330) return "cada año";
        return `cada ${Math.round(dias / 30.44)} meses`;
      }
      // Cuánto dura: lo medido entre los dos últimos cambios, y si no hay dos, lo
      // que dice el plan para ese código en esta máquina o en otra que lo use.
      function compVida(eqCod, it, fechas) {
        if (fechas.length >= 2) {
          const d = planDiasEntre(fechas[fechas.length - 2], fechas[fechas.length - 1]);
          if (isFinite(d) && d > 0) return { dias: d, base: `lo que duró la anterior (${planFmtDias(d)})`, corta: `la anterior duró ${planFmtDias(d)}` };
        }
        const eq = PLAN_EQUIPOS.find((e) => e.c === eqCod);
        const propia = eq && eq.r.find((r) => r.cod === it.cod && compFreqDias((r.xls || {}).f));
        if (propia) { const d = compFreqDias(propia.xls.f); return { dias: d, base: `la frecuencia del plan (${compFreqTexto(d)})`, corta: `plan: ${compFreqTexto(d)}` }; }
        for (const e of PLAN_EQUIPOS) {
          const r = e.r.find((x) => x.cod === it.cod && compFreqDias((x.xls || {}).f));
          if (r) { const d = compFreqDias(r.xls.f); return { dias: d, base: `la frecuencia del plan de ${e.n} para esta misma pieza (${compFreqTexto(d)})`, corta: `plan: ${compFreqTexto(d)}` }; }
        }
        return null;
      }
      function compUltimaInspeccion(eqCod, it, titulo) {
        const clave = planPlain(titulo || "").replace(/s$/, "");
        const i = inspDeEquipo(eqCod).find((x) => {
          const txt = planPlain([x.revisado, x.hallazgos, ...(x.piezas || []).map((p) => p.cod + " " + p.d)].join(" "));
          return txt.includes(it.cod) || (clave && txt.includes(clave));
        });
        return i ? i.fecha : "";
      }
      function compEstado(eqCod, g, it) {
        const propios = cambios.filter((c) => c && c.eq === eqCod && c.ubic === it.id).map((c) => c.fecha);
        const fechas = [...new Set([...(it.cambios || []).map((c) => c.fecha), ...propios])].filter(Boolean).sort();
        const ultimo = fechas[fechas.length - 1] || "";
        const vida = compVida(eqCod, it, fechas);
        const proximo = ultimo && vida ? planSumarDias(ultimo, vida.dias) : "";
        const hoy = new Date().toISOString().slice(0, 10);
        const pendiente = it.pendiente && !(ultimo && ultimo >= it.pendiente.desde);
        let estado = "al-dia";
        if (pendiente) estado = "pendiente";
        else if (!ultimo) estado = "sin-dato";
        else if (proximo && proximo <= hoy) estado = "vencida";
        else if (proximo && planDiasEntre(hoy, proximo) <= 60) estado = "pronto";
        return { fechas, ultimo, vida, proximo, estado, pendiente, insp: compUltimaInspeccion(eqCod, it, g.titulo) };
      }
      const COMP_ESTADOS = {
        pendiente: ["Pendiente", "bad"], vencida: ["Ya toca cambiarla", "bad"],
        pronto: ["Cambiar pronto", "warn"], "al-dia": ["Al día", "ok"], "sin-dato": ["Sin cambio registrado", "n"]
      };
      // Con año: el próximo cambio suele caer el año que viene
      function compFecha(f) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(f || ""));
        if (!m) return "&mdash;";
        return `${Number(m[3])} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][Number(m[2]) - 1]} ${m[1]}`;
      }
      // Un cuadro por grupo, como el del informe de mantenimiento: una fila por
      // posición, coloreada según el estado.
      function compBloques(eqCod) {
        const grupos = compGrupos(eqCod);
        if (!grupos.length) return "";
        const hoy = new Date().toISOString().slice(0, 10);
        return grupos.map((g) => {
          const filas = (g.items || []).map((it) => ({ it, e: compEstado(eqCod, g, it) }));
          const n = (k) => filas.filter((x) => x.e.estado === k).length;
          const resumen = [n("pendiente") + n("vencida") ? `${n("pendiente") + n("vencida")} por cambiar` : "", n("pronto") ? `${n("pronto")} pronto` : "", n("al-dia") ? `${n("al-dia")} al día` : ""].filter(Boolean).join(" · ");
          const notas = [];
          const cuerpo = filas.map(({ it, e }) => {
            let [txt, tono] = COMP_ESTADOS[e.estado];
            // Recién cambiada (como dice el informe) durante los primeros tres meses
            if (e.estado === "al-dia" && e.ultimo && planDiasEntre(e.ultimo, hoy) <= 90) txt = "Cambiada";
            const inv = window.INVENTARIO ? window.INVENTARIO.de(it.cod) : null;
            const hay = inv && inv.exist != null ? Number(inv.exist) : null;
            const marcas = [];
            if (e.pendiente && it.pendiente && it.pendiente.nota) { notas.push([it.ubicacion, it.pendiente.nota, "bad"]); marcas.push(notas.length); }
            if (it.nota) { notas.push([it.ubicacion, it.nota, "warn"]); marcas.push(notas.length); }
            const pedir = e.estado === "pendiente" || e.estado === "vencida" || e.estado === "pronto";
            return `<tr class="cmp-fila--${tono}">
              <td class="cmp-ubic" data-l="Ubicación"><strong>${planEsc(it.ubicacion)}</strong>${marcas.map((m) => `<sup class="cmp-ref">${m}</sup>`).join("")}</td>
              <td class="cmp-cod" data-l="Código"><span class="pl-code">${planEsc(it.cod)}</span>${hay !== null ? `<small>almacén: ${hay}</small>` : ""}</td>
              <td class="cmp-refd" data-l="Referencia">${planEsc(it.d)}</td>
              <td class="cmp-f" data-l="Último cambio">${e.ultimo ? compFecha(e.ultimo) : '<span class="pl-soft">sin registro</span>'}</td>
              <td class="cmp-f" data-l="Última inspección">${compFecha(e.insp)}</td>
              <td class="cmp-f" data-l="Se necesitará" title="${planEsc(e.vida && !e.pendiente ? "Estimado con " + e.vida.base : "")}">${e.pendiente ? "<strong>Ya</strong>" : compFecha(e.proximo)}${!e.pendiente && e.vida && e.proximo ? `<small>${planEsc(e.vida.corta)}</small>` : ""}</td>
              <td class="cmp-est-c" data-l="Estado"><span class="cmp-est-t cmp-est-t--${tono}">${txt}</span></td>
              <td class="cmp-acc-c">
                <button class="pl-reg" type="button" onclick="compRegistrar('${planEsc(eqCod)}', '${planEsc(it.id)}')" title="Registrar el cambio de la correa de ${planEsc(it.ubicacion)}">Registrar cambio</button>
                ${pedir ? `<button class="pl-reg" type="button" onclick="window.goAlmacen && window.goAlmacen({ q: '${planEsc(it.cod)}' })">Pedir</button>` : ""}
              </td>
            </tr>`;
          }).join("");
          return `
          <div class="panel-header-clean">
            <h3>${planEsc(g.titulo)}</h3>
            <p>${filas.length} posiciones${resumen ? " &middot; " + resumen : ""}. «Se necesitará» es un estimado y se corrige solo cada vez que se registra un cambio.</p>
          </div>
          <div class="pl-tablewrap cmp-wrap">
            <table class="cmp-tabla">
              <thead><tr><th>Ubicación</th><th>Código</th><th>Referencia</th><th>Último cambio</th><th>Última inspección</th><th>Se necesitará</th><th>Estado</th><th></th></tr></thead>
              <tbody>${cuerpo}</tbody>
            </table>
          </div>
          ${notas.length ? `<ol class="cmp-notas">${notas.map(([u, t, tono]) => `<li class="cmp-nota--${tono}"><strong>${planEsc(u)}:</strong> ${planEsc(t)}</li>`).join("")}</ol>` : ""}
          <div class="panel-split"></div>`;
        }).join("");
      }
      // Registrar el cambio de una posición: el mismo formulario que el plan,
      // pero el cambio queda atado a esa posición (sellado, troqueladora…)
      function compRegistrar(eqCod, id) {
        const g = compGrupos(eqCod).find((x) => (x.items || []).some((i) => i.id === id));
        const it = g && g.items.find((i) => i.id === id);
        const eq = PLAN_EQUIPOS.find((e) => e.c === eqCod);
        const sheet = document.getElementById("plSheet");
        const back = document.getElementById("plSheetBackdrop");
        const form = document.getElementById("plForm");
        if (!it || !sheet || !back || !form) return;
        planRegCtx = { eq: eqCod, cod: it.cod, d: it.d, q: 1, ubic: it.id, ubicacion: it.ubicacion };
        const what = document.getElementById("plSheetWhat");
        if (what) what.innerHTML = `<strong>${planEsc(it.cod)}</strong> &middot; ${planEsc(it.d)}<br><span class="pl-soft">${planEsc(eq ? eq.n : eqCod)} &middot; ${planEsc(it.ubicacion)}</span>`;
        form.reset();
        form.fecha.value = new Date().toISOString().slice(0, 10);
        form.q.value = 1;
        back.hidden = false;
        sheet.hidden = false;
        setTimeout(() => form.fecha.focus(), 60);
      }

      // Pestaña Mantenimiento de la ficha: primero el trabajo abierto (la misma
      // tarjeta del Seguimiento: inspección, cambios, lo que falta y qué pedir),
      // después el cuadro de piezas por posición y el historial de inspecciones.
      function renderInspMaquina(machine) {
        const eq = equipoDeMachine(machine);
        const cod = eq ? eq.c : (machine.equipoCod || "");
        const lista = cod ? inspDeEquipo(cod) : [];
        const SG = window.SEGUIMIENTO;
        const trabajos = cod && SG ? SG.trabajos().filter((t) => t.i.eq === cod && t.etapa !== "hecho") : [];
        const enTrabajo = new Set(trabajos.map((t) => t.i.id));
        const resto = lista.filter((i) => !enTrabajo.has(i.id));
        return `${trabajos.length ? `<div class="panel-header-clean"><h3>Trabajo de mantenimiento abierto</h3><p>Lo que dijo la inspección, lo que ya se cambió y lo que falta.</p></div>
            <div class="sg-lista">${trabajos.map((t) => SG.htmlTrabajo(t, { cuadro: false, sinEquipo: true })).join("")}</div><div class="panel-split"></div>` : ""}
          ${cod ? compBloques(cod) : ""}
          <div class="panel-header-clean">
            <h3>Historial de inspecciones</h3>
          </div>
          <div class="in-barra">
            <span class="counter">${lista.length} ${lista.length === 1 ? "inspección" : "inspecciones"}</span>
            ${cod ? `<button class="button button--dark" type="button" onclick="inspAbrirForm('${planEsc(cod)}')">Anotar inspección</button>` : ""}
          </div>
          ${resto.length ? resto.map((i) => inspTarjeta(i, false)).join("") : `<p class="pl-soft" style="padding:6px 2px 2px">${lista.length ? "La inspección abierta está arriba, en el trabajo de mantenimiento." : "Todavía no se ha anotado ninguna inspección de este equipo."}</p>`}`;
      }


      // Repinta la ficha abierta cuando cambia el historial, para no perder el sitio.
      function renderFichaSiVisible() {
        const vista = document.getElementById("detailView");
        if (!vista || !vista.classList.contains("is-active")) return;
        const machine = machines.find((m) => m.id === selectedId);
        if (!machine) return;
        const panel = document.querySelector('[data-profile-panel="spares"]');
        if (panel) panel.innerHTML = renderSparesPanel(machine);
        // Las inspecciones de la ficha viven en la pestana de mantenimiento: si se
        // anota, corrige, cierra o borra una, hay que repintarlas ahi tambien.
        const insp = document.getElementById("inspMaquina");
        if (insp) insp.innerHTML = renderInspMaquina(machine);
      }



      // Fila del indice: lo justo para decidir, y un botón que abre la ficha del equipo
      // en su pestaña de plan. El detalle vive en la máquina, no aquí.
      // Dice de cuando son las existencias que se estan mostrando. Sin esto, un
      // inventario que lleva tres semanas sin actualizarse se ve identico a uno
      // de esta manana, y alguien acaba pidiendo (o no pidiendo) una pieza por
      // un numero caducado.
      function planAvisoInventario() {
        const inv = window.INVENTARIO;
        if (!inv) return "";
        const f = inv.frescura();
        const n = inv.estado.articulos || 0;
        if (f.estado === "sin-datos") {
          return `<div class="pl-inv pl-inv--sin-datos" title="Las existencias que se ven salen del Excel del plan, que es una foto vieja. El puente de MiPortal todavia no ha subido nada.">Existencias del Excel &middot; sin datos de MiPortal</div>`;
        }
        const detalle = f.estado === "viejo"
          ? "Hace dias que el puente de MiPortal no sube nada. Revisa que el PC de planta lo siga corriendo."
          : "Existencias tal como las tiene MiPortal.";
        return `<div class="pl-inv pl-inv--${f.estado}" title="${planEsc(detalle)}">${planEsc(f.texto)} &middot; ${n} art&iacute;culo${n === 1 ? "" : "s"} de almac&eacute;n</div>`;
      }

      function planEquipoCard(group, query) {
        const eq = group.eq;
        const rows = group.rows;
        const noStock = rows.filter((r) => existenciaDe(eq, r) === 0).length;
        const conHist = rows.filter((r) => planCambiosDe(eq.c, r.cod).length).length;
        const conMedida = rows.filter((r) => planMedicion(planCambiosDe(eq.c, r.cod))).length;
        const machine = machines.find((m) => m.id === eq.id);
        const rica = machine && !machine.fromRegistry;
        return `
          <article class="pl-eq" id="pl-eq-${planEsc(eq.c)}">
            <button class="pl-eq__head" type="button" onclick="planAbrirEquipo('${planEsc(eq.id)}')" title="Abrir la ficha de este equipo">
              <span class="pl-eq__main">
                <span class="pl-eq__name">${planMark(eq.n, query)}</span>
                <span class="pl-eq__sub">C&oacute;digo de equipo ${planMark(eq.c, query)}${eq.u ? " &middot; " + planEsc(eq.u) : ""}${eq.cc ? " &middot; centro de costo " + planEsc(eq.cc) : ""}</span>
              </span>
              <span class="pl-eq__tags">
                ${rica ? '<span class="pl-tag pl-tag--link">Ficha completa</span>' : '<span class="pl-tag pl-tag--n">Ficha b&aacute;sica</span>'}
                ${conMedida ? `<span class="pl-tag pl-tag--warn">${conMedida} con frecuencia</span>` : ""}
                ${conHist ? `<span class="pl-tag pl-tag--ok">${conHist} con historial</span>` : ""}
                ${noStock ? `<span class="pl-tag pl-tag--n">${noStock} sin stock</span>` : ""}
                <span class="pl-tag pl-tag--n">${rows.length} repuesto${rows.length === 1 ? "" : "s"}</span>
              </span>
              <span class="pl-eq__go" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            </button>
          </article>`;
      }

      // Abre la ficha del equipo directamente en su pestaña de plan.
      function planAbrirEquipo(id) {
        openDetail(id);
        const boton = guideTabs.querySelector('[data-profile-tab="planparts"]');
        if (boton) boton.click();
        window.scrollTo({ top: 0, behavior: "auto" });
      }


      function planSetFilter(key, value) {
        planFilter[key] = value;
        planLimit = 15;
        renderPlan();
        if (key === "q") {
          const box = document.getElementById("planSearch");
          if (box) { box.focus(); box.setSelectionRange(box.value.length, box.value.length); }
        }
      }

      function planHistToggle(clave) {
        if (planHistOpen.has(clave)) planHistOpen.delete(clave); else planHistOpen.add(clave);
        renderPlan();
      }

      function planShowMore() { planLimit += 15; renderPlan(); }
      function planGoMachine(mid) { openDetail(mid); }

      // ----- Registrar un cambio -----
      let planRegCtx = null;
      function planRegistrar(equipo, cod) {
        const eq = PLAN_EQUIPOS.find((e) => e.c === equipo);
        const row = eq && eq.r.find((r) => r.cod === cod);
        if (!eq || !row) return;
        planRegCtx = { eq: equipo, cod, d: row.d, q: row.q };
        const sheet = document.getElementById("plSheet");
        const back = document.getElementById("plSheetBackdrop");
        const what = document.getElementById("plSheetWhat");
        const form = document.getElementById("plForm");
        if (!sheet || !back || !form) return;
        if (what) what.innerHTML = `<strong>${planEsc(cod)}</strong> &middot; ${planEsc(row.d)}<br><span class="pl-soft">${planEsc(eq.n)}${row.s ? " &middot; " + planEsc(row.s) : ""}</span>`;
        form.reset();
        form.fecha.value = new Date().toISOString().slice(0, 10);
        form.q.value = row.q || 1;
        back.hidden = false;
        sheet.hidden = false;
        setTimeout(() => form.fecha.focus(), 60);
      }

      function planSheetClose() {
        const sheet = document.getElementById("plSheet");
        const back = document.getElementById("plSheetBackdrop");
        if (sheet) sheet.hidden = true;
        if (back) back.hidden = true;
        planRegCtx = null;
      }

      function planSheetSubmit(e) {
        e.preventDefault();
        if (!planRegCtx) return planSheetClose();
        const f = e.target;
        const fecha = String(f.fecha.value || "").slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { window.alert("Pon una fecha v\u00e1lida."); return; }
        cambios.push({
          id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          eq: planRegCtx.eq,
          cod: planRegCtx.cod,
          d: planRegCtx.d,
          fecha,
          q: parseInt(f.q.value, 10) || 0,
          quien: String(f.quien.value || "").trim(),
          // Si es de una posición (bloques de Mantenimiento), el historial dice cuál
          nota: [planRegCtx.ubicacion || "", String(f.nota.value || "").trim()].filter(Boolean).join(" · "),
          ...(planRegCtx.ubic ? { ubic: planRegCtx.ubic, ubicacion: planRegCtx.ubicacion || "" } : {}),
          createdAt: new Date().toISOString()
        });
        planHistOpen.add(planRegCtx.eq + "|" + planRegCtx.cod);
        saveCambios();
        planSheetClose();
        renderPlan();
        renderFichaSiVisible();
      }

      function planBorrarCambio(id) {
        if (!window.confirm("\u00bfBorrar este registro de cambio?")) return;
        cambios = cambios.filter((c) => c.id !== id);
        saveCambios();
        renderPlan();
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !document.getElementById("plSheet")?.hidden) planSheetClose();
      });

      // Exporta lo que se esta viendo (con los filtros aplicados) como CSV para Excel.
      function planExport() {
        const head = ["C\u00f3digo equipo", "Equipo", "Ubicaci\u00f3n", "Sistema", "Actividad", "C\u00f3digo interno", "Repuesto", "Cantidad", "Existencia", "\u00daltimo cambio registrado", "Registros", "Frecuencia medida (d\u00edas)", "Frecuencia medida", "Pr\u00f3ximo estimado", "Observaciones"];
        const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const lines = [head.map(cell).join(";")];
        planFiltered().forEach(({ eq, rows }) => {
          rows.forEach((r) => {
            const historial = planCambiosDe(eq.c, r.cod);
            const med = planMedicion(historial);
            const ultimo = historial.length ? historial[historial.length - 1].fecha : "";
            lines.push([eq.c, eq.n, eq.u, r.s, r.a, r.cod, r.d, r.q, r.e, ultimo, historial.length,
              med ? med.prom : "", med ? planFmtDias(med.prom) : "", med ? med.proximo : "", r.o].map(cell).join(";"));
          });
        });
        const csv = "\ufeff" + lines.join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "plan-mantenimiento.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }

      // Abre la vista; si se pasa una busqueda, entra ya filtrada y con los equipos desplegados.
      function goPlan(query) {
        if (typeof query === "string") {
          planFilter.q = query;
          planLimit = 15;
        }
        setView("plan");
        renderPlan();
        saveUiState({ activeView: "plan" });
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      // Cuenta cuantas lineas del plan coinciden con lo que se busca en el buscador general.
      function planCountFor(query) {
        const tokens = planTokens(query);
        if (!tokens.length || normalize(query).length < 3) return 0;
        return PLAN_EQUIPOS.reduce((acc, eq) => {
          const eqHay = planPlain([eq.n, eq.c].join(" "));
          const eqHit = tokens.every((token) => eqHay.includes(token));
          return acc + eq.r.filter((row) => eqHit || planRowMatches(row, tokens)).length;
        }, 0);
      }

      cambiosSubscribe(); // historial de cambios en tiempo real (o local si no hay nube)
      datosSubscribe();   // código interno y existencias escritos a mano, compartidos
      window.INVENTARIO?.suscribir();  // existencias reales de almacén que sube el puente de MiPortal

      function setView(viewName) {
        Object.entries(views).forEach(([name, element]) => { if (element) element.classList.toggle("is-active", name === viewName); });
        // El menú lateral, la miga de pan, el historial del navegador y la
        // animación de entrada los lleva shell.js: aquí solo se cambia de vista.
        if (window.SHELL) window.SHELL.alCambiarVista(viewName);
      }

      function goResults({ keepSelection = false } = {}) {
        if (!keepSelection) { selectedId = null; }
        resultsSearch.value = currentQuery;
        setView("results");
        renderResults();
        saveUiState({ activeView: "results" });
      }

      function goHome() {
        setView("home");
        renderHome();
        // En el celular no se enfoca: abriría el teclado encima de la portada.
        if (window.matchMedia("(pointer: fine)").matches) homeSearch.focus({ preventScroll: true });
        saveUiState({ activeView: "home" });
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      function openDetail(machineId) {
        const machine = machines.find((item) => item.id === machineId);
        if (!machine) return;
        selectedId = machine.id;
        renderProfile(machine);
        setView("detail");
        saveUiState({ activeView: "detail" });
      }
      window.openDetail = openDetail;

      function openModal() {
        modalBackdrop.hidden = false;
        document.body.style.overflow = "hidden";
        equipmentForm.elements.name.focus();
      }

      function closeModal() {
        modalBackdrop.hidden = true;
        document.body.style.overflow = "";
        equipmentForm.reset();
      }

      async function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(equipmentForm);
        const image = await fileToDataUrl(formData.get("image"));
        const name = String(formData.get("name")).trim();
        const newId = crypto.randomUUID();
        machines.unshift({
          id: newId,
          name,
          model: name,
          current: "Equipo registrado",
          area: String(formData.get("area")).trim() || "Pendiente",
          location: String(formData.get("location")).trim() || "Pendiente",
          status: String(formData.get("status")).trim() || "Pendiente",
          criticality: String(formData.get("criticality")).trim() || "Pendiente",
          manual: String(formData.get("manual")).trim() || "Pendiente",
          maintenance: "Por completar",
          completion: 5,
          image,
          notes: String(formData.get("notes")).trim(),
          searchAliases: [],
          description: "Por completar.",
          technicalData: {
            function: "Por completar.",
            capacity: "Por confirmar",
            manufacturer: "Por confirmar",
            brand: "Por confirmar",
            serialNumber: "Por confirmar",
            year: "Por confirmar",
            voltage: "Por confirmar",
            power: "Por confirmar",
            weight: "Por confirmar",
            dimensions: "Por confirmar"
          },
          guideSections: [
            { id: `${newId}-gen`, title: "Identificación general", content: "<p>Completar con datos del equipo: función, tipo, fabricante, proceso.</p>" },
            { id: `${newId}-params`, title: "Parámetros técnicos", content: "<p>Completar con capacidad, potencia, dimensiones, voltaje, peso y condiciones de operación.</p>" },
            { id: `${newId}-install`, title: "Instalación y arranque", content: "<p>Completar con requisitos de instalación, comisionamiento y prueba inicial.</p>" },
            { id: `${newId}-proceso`, title: "Descripción del proceso", content: "<p>Completar con la secuencia de operación paso a paso.</p>" },
            { id: `${newId}-sistemas`, title: "Sistemas y componentes", content: "<p>Completar con subsistemas principales y sus componentes clave.</p>" },
            { id: `${newId}-ajustes`, title: "Ajustes y calibración", content: "<p>Completar con tolerancias, holguras y ajustes críticos del equipo.</p>" },
            { id: `${newId}-mant`, title: "Mantenimiento preventivo", content: "<p>Completar con el plan de mantenimiento preventivo por frecuencias.</p>" },
            { id: `${newId}-lub`, title: "Lubricación", content: "<p>Completar con puntos, productos y frecuencias de lubricación.</p>" },
            { id: `${newId}-fallas`, title: "Fallas comunes y diagnóstico", content: "<p>Completar con las fallas más frecuentes, síntomas y correcciones.</p>" },
            { id: `${newId}-seg`, title: "Seguridad y advertencias", content: "<p>Completar con los procedimientos de seguridad y LOTO del equipo.</p>" }
          ],
          spareParts: [],
          maintenanceTasks: [
            { name: "Inspección visual general", system: "General", frequency: "Diario", type: "Rutina", acceptance: "Sin fugas, ruidos ni alarmas." },
            { name: "Limpieza general", system: "General", frequency: "Semanal", type: "Preventivo", acceptance: "Sin polvo ni residuos de proceso." },
            { name: "Revisión de lubricación", system: "General", frequency: "Mensual", type: "Preventivo", acceptance: "Puntos de lubricación correctos." },
            { name: "Revisión de ajustes mecánicos", system: "General", frequency: "Mensual", type: "Preventivo", acceptance: "Sin tornillos flojos ni desgaste visible." }
          ],
          failureModes: [],
          documents: [
            { name: "Manual del fabricante", status: "Pendiente" },
            { name: "Plano eléctrico", status: "Pendiente" },
            { name: "Plano neumático/hidráulico", status: "Pendiente" },
            { name: "Placa técnica del equipo", status: "Pendiente" },
            { name: "Lista de repuestos originales", status: "Pendiente" },
            { name: "Programa de mantenimiento", status: "Pendiente" },
            { name: "Fotos del equipo instalado", status: "Pendiente" }
          ]
        });
        saveMachinesToStorage();
        currentQuery = name;
        selectedId = null;
        homeSearch.value = name;
        resultsSearch.value = name;
        closeModal();
        goResults();
      }

      // El buscador de Equipos filtra la lista mientras se escribe
      homeSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        currentQuery = homeSearch.value.trim();
        saveUiState();
        renderHome();
      });
      let homeEscribiendo = null;
      homeSearch.addEventListener("input", () => {
        clearTimeout(homeEscribiendo);
        homeEscribiendo = setTimeout(() => {
          const antes = currentQuery;
          currentQuery = homeSearch.value.trim();
          homeFiltro.limite = 60;
          // Las fichas con foto solo se ven sin búsqueda: al empezar o borrar se repinta todo
          if (!antes !== !currentQuery) renderHome(); else renderHomeLista();
          saveUiState();
        }, 120);
      });

      resultsSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        currentQuery = resultsSearch.value.trim();
        saveUiState();
        goResults();
      });


      resultsSearch.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); currentQuery = resultsSearch.value.trim(); saveUiState(); goResults(); }
      });

      resultsList.addEventListener("click", (event) => {
        const result = event.target.closest("[data-select-id]");
        if (!result) return;
        selectedId = result.dataset.selectId;
        saveUiState({ activeView: "results" });
        openDetail(selectedId);
      });

      resultsList.addEventListener("dblclick", (event) => {
        const result = event.target.closest("[data-select-id]");
        if (!result) return;
        openDetail(result.dataset.selectId);
      });

      previewPanel.addEventListener("click", (event) => {
        if (event.target.closest("a, .download-link")) return;
        const detailButton = event.target.closest("[data-open-detail]");
        const targetId = detailButton ? detailButton.dataset.openDetail : selectedId;
        if (targetId) {
          openDetail(targetId);
        }
      });

      previewPanel.addEventListener("dblclick", (event) => {
        if (selectedId) {
          openDetail(selectedId);
        }
      });

      // Tab switching for main profile tabs
      guideTabs.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-profile-tab]");
        if (tab) {
          const tabId = tab.dataset.profileTab;
          guideTabs.querySelectorAll(".profile-tab").forEach((button) => { button.classList.toggle("is-active", button === tab); });
          guidePanels.querySelectorAll(".profile-panel").forEach((panel) => { panel.classList.toggle("is-active", panel.dataset.profilePanel === tabId); });
        }
      });

      backToHome.addEventListener("click", goHome);
      backToResults.addEventListener("click", () => goResults({ keepSelection: true }));
      // Los botones del menú lateral los enlaza shell.js (data-go).

      modalOpeners.forEach((button) => button.addEventListener("click", openModal));
      modalClosers.forEach((button) => button.addEventListener("click", closeModal));
      equipmentForm.addEventListener("submit", handleSubmit);

      modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) closeModal(); });
      document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modalBackdrop.hidden) closeModal(); });

      // ── MS235: mapa de la maquina y despiece por grupos ─────────────────────
      // El plano electrico no sirve para enseniar donde esta cada pieza. Estas
      // vistas salen del catalogo de piezas de Schmucker: la misma maquina con
      // las llamadas de cada grupo en su sitio real, sacadas de las lineas guia
      // del PDF. Al tocar una llamada se abre el grupo: que es, como se le hace
      // mantenimiento (paginas en espaniol del manual de Calibrado) y su
      // despiece con todos los numeros de pieza.

      const mecState = { mid: "", mapa: 0, grupo: "", q: "", hoja: 0 };

      // Los datos de despiece de cada maquina, si los tiene. La MS235 fue la
      // primera; window.MS235_MEC se sigue leyendo para no romper nada.
      function mecDatos() {
        const reg = window.MEC_DATA || {};
        if (window.MS235_MEC && !reg.ms235) reg.ms235 = window.MS235_MEC;
        return reg;
      }
      function mecDeMaquina(mid) { return mecDatos()[mid] || null; }
      function mecTiene(machine) { return !!(machine && mecDeMaquina(machine.id)); }
      function mecData() { return mecDeMaquina(mecState.mid) || mecDeMaquina(selectedId); }

      function mecGrupoDe(cod) { const M = mecData(); return M && M.grupos[cod] ? M.grupos[cod] : null; }

      // Los grupos que no aparecen en ninguna vista se listan aparte para que no
      // se pierdan: el mapa solo trae las llamadas que dibujo el fabricante.
      function mecSueltos() {
        const M = mecData();
        if (!M) return [];
        const enMapa = new Set(M.mapas.flatMap((m) => m.hs.map((h) => h.cod)));
        return Object.keys(M.grupos).filter((c) => !enMapa.has(c)).sort();
      }

      function renderMecExplorer(machine) {
        if (mecState.mid !== machine.id) {
          mecState.mid = machine.id;
          mecState.mapa = 0; mecState.grupo = ""; mecState.q = ""; mecState.hoja = 0;
        }
        const M = mecData();
        if (!M) return "";
        const mapa = M.mapas[mecState.mapa] || M.mapas[0];
        const nGrupos = Object.keys(M.grupos).length;
        const nPiezas = new Set(Object.values(M.grupos).flatMap((g) => g.piezas)).size;
        const sueltos = mecSueltos();
        return `
          <div class="panel-header-clean">
            <h3>Despiece por grupos &mdash; d&oacute;nde est&aacute; cada pieza</h3>
            <p>${mapa.hs.length ? "La m&aacute;quina tal como la dibuj&oacute; el fabricante, con la llamada de cada grupo en su sitio. Toca una llamada del plano" : "Elige un grupo de la lista"}
               y se abre el grupo: qu&eacute; es, sus procedimientos de mantenimiento en espa&ntilde;ol y su despiece
               con todos los n&uacute;meros de pieza. Cat&aacute;logo ${planEsc(M.ref)} &middot;
               ${nGrupos} grupos &middot; ${nPiezas} referencias.</p>
          </div>
          <div class="mec-search">
            <input id="mecSearch" type="search" placeholder="Busca un n&uacute;mero de pieza (235.15.222, C261124075&hellip;) o un grupo" value="${planEsc(mecState.q)}" oninput="mecBuscar(this.value)">
          </div>
          <div id="mecHits">${mecHitsHtml()}</div>
          <div class="mec-body">
            <div class="mec-mapcol">
              ${M.mapas.length > 1 ? `<div class="mec-tabs">
                ${M.mapas.map((m, i) => `<button class="mec-tab ${i === mecState.mapa ? "is-active" : ""}" type="button" onclick="mecVerMapa(${i})">${planEsc(m.t)}</button>`).join("")}
              </div>` : ""}
              <div class="mec-map">
                <img src="${planEsc(mapa.img)}" alt="${planEsc(mapa.t)}" loading="lazy">
                ${mapa.hs.map((h) => {
                  const g = mecGrupoDe(h.cod);
                  return `<button class="mec-hs ${mecState.grupo === h.cod ? "is-active" : ""}" type="button"
                    style="left:${h.x}%;top:${h.y}%"
                    onclick="mecVerGrupo('${planEsc(h.cod)}')"
                    title="${planEsc(h.cod)} &middot; ${planEsc(g ? g.n : "sin despiece cargado")}"><span></span></button>`;
                }).join("")}
              </div>
              <p class="mec-legend">${mapa.hs.length ? mapa.hs.length + " llamadas en esta vista &middot; toca un punto" : "Vista general del equipo"}</p>
              ${sueltos.length ? `<details class="mec-otros" ${mapa.hs.length ? "" : "open"}><summary>${mapa.hs.length ? "Otros " + sueltos.length + " grupos sin llamada en el plano" : sueltos.length + " grupos del cat&aacute;logo"}</summary>
                ${sueltos.map((c) => `<button class="mec-otro ${mecState.grupo === c ? "is-active" : ""}" type="button" onclick="mecVerGrupo('${planEsc(c)}')">${planEsc(M.grupos[c].n)}<span>${planEsc(c)}</span></button>`).join("")}
              </details>` : ""}
            </div>
            <div class="mec-panel" id="mecPanel">${mecGrupoHtml()}</div>
          </div>`;
      }

      function mecRefresh() {
        const cont = document.querySelector('[data-profile-panel="partsmap"] .mec-body');
        const machine = machines.find((m) => m.id === selectedId);
        if (!machine) return;
        const wrap = document.querySelector('[data-profile-panel="partsmap"]');
        if (wrap) wrap.innerHTML = renderMecExplorer(machine);
      }
      function mecVerMapa(i) { mecState.mapa = i; mecRefresh(); }
      function mecVerGrupo(cod) {
        mecState.grupo = cod === mecState.grupo ? "" : cod;
        mecState.hoja = 0;
        mecRefresh();
        document.getElementById("mecPanel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      function mecVerHoja(i) { mecState.hoja = i; mecRefresh(); }
      function mecBuscar(v) {
        mecState.q = v;
        mecRefresh();
        const c = document.getElementById("mecSearch");
        if (c) { c.focus(); c.setSelectionRange(c.value.length, c.value.length); }
      }

      // Buscar una referencia y que diga en que grupo va: es la pregunta real
      // cuando alguien tiene la pieza en la mano y no sabe de donde salio.
      function mecHitsHtml() {
        const M = mecData();
        const q = normalize(mecState.q).replace(/[.\-\s]/g, "");
        if (!M || q.length < 3) return "";
        const hits = [];
        Object.entries(M.grupos).forEach(([cod, g]) => {
          if (normalize(g.n).includes(normalize(mecState.q)) || normalize(cod).includes(q)) hits.push({ cod, g, ref: "", grupo: true });
          g.piezas.forEach((p) => { if (normalize(p).replace(/[.\-\s]/g, "").includes(q)) hits.push({ cod, g, ref: p }); });
        });
        if (!hits.length) return `<p class="mec-nohit">Ninguna referencia ni grupo coincide con &laquo;${planEsc(mecState.q)}&raquo;.</p>`;
        return `<div class="mec-hits"><p class="mec-hits__t">${hits.length} coincidencia${hits.length === 1 ? "" : "s"}</p>
          ${hits.slice(0, 40).map((h) => `<button type="button" onclick="mecVerGrupo('${planEsc(h.cod)}')">
            <span class="mec-hit__r">${h.ref ? planEsc(h.ref) : planEsc(h.cod)}</span>
            <span class="mec-hit__g">${planEsc(h.g.n)}</span>
          </button>`).join("")}
          ${hits.length > 40 ? `<p class="pl-soft">y ${hits.length - 40} m&aacute;s&hellip;</p>` : ""}</div>`;
      }

      function mecGrupoHtml() {
        const M = mecData();
        if (!M) return "";
        const cod = mecState.grupo;
        if (!cod || !M.grupos[cod]) {
          return `<div class="mec-empty">
            <h4>Toca una llamada del plano</h4>
            <p>Cada punto azul es un grupo de la m&aacute;quina. Al tocarlo ver&aacute;s qu&eacute; es, sus procedimientos
               de mantenimiento con la figura del manual y su despiece completo, con el n&uacute;mero de pieza que va en el pedido.</p>
          </div>`;
        }
        const g = M.grupos[cod];
        const hoja = g.hojas[Math.min(mecState.hoja, g.hojas.length - 1)];
        return `<div class="mec-grupo">
          <div class="mec-grupo__head">
            <p class="eyebrow">${planEsc(cod)}</p>
            <h4>${planEsc(g.n)}</h4>
            <p>${planEsc(g.d)}</p>
            <span class="mec-fuente">Nombre seg&uacute;n: ${planEsc(g.fuente)}</span>
          </div>

          ${g.proc.length ? `<div class="mec-sec">
            <h5>Mantenimiento de este grupo &middot; ${g.proc.length} procedimiento${g.proc.length === 1 ? "" : "s"}</h5>
            <p class="pl-soft">Las p&aacute;ginas del manual de Calibrado, en italiano y espa&ntilde;ol, con su figura. Toca para ampliar.</p>
            <div class="mec-procs">
              ${g.proc.map((p) => `<figure class="mec-proc" onclick="openLightbox('${planEsc(p.img)}','${planEsc(p.t).replace(/'/g, "&#39;")} — manual de Calibrado, p. ${p.pg}')">
                <img src="${planEsc(p.img)}" alt="${planEsc(p.t)}" loading="lazy">
                <figcaption>${planEsc(p.t)}<span>p. ${p.pg}</span></figcaption>
              </figure>`).join("")}
            </div>
          </div>` : ""}

          ${g.hojas.length ? `<div class="mec-sec">
            <h5>Despiece &middot; ${g.hojas.length} l&aacute;mina${g.hojas.length === 1 ? "" : "s"}</h5>
            <div class="mec-hojas">
              ${g.hojas.map((h, i) => `<button class="mec-hoja ${i === Math.min(mecState.hoja, g.hojas.length - 1) ? "is-active" : ""}" type="button" onclick="mecVerHoja(${i})">${planEsc(h.tav || "lám. " + (i + 1))}<span>${(h.p || []).length} pz.</span></button>`).join("")}
            </div>
            ${hoja ? `<figure class="mec-lamina" onclick="openLightbox('${planEsc(hoja.img)}','${planEsc(hoja.tav)} — catálogo de piezas, p. ${hoja.pg}')">
              <img src="${planEsc(hoja.img)}" alt="Despiece ${planEsc(hoja.tav)}" loading="lazy">
              <figcaption>🔍 ${planEsc(hoja.tav)} &middot; p&aacute;gina ${hoja.pg} del cat&aacute;logo &mdash; toca para ampliar</figcaption>
            </figure>` : ""}
          </div>` : ""}

          ${g.piezas.length ? `<div class="mec-sec">
            <h5>Referencias de este grupo &middot; ${g.piezas.length}</h5>
            <p class="pl-soft">El c&oacute;digo interno se escribe tocando su celda; queda guardado en este navegador y se puede exportar.</p>
            <div class="pl-tablewrap">
              <table class="pl-table mec-table">
                <thead><tr><th>Referencia Schmucker</th><th>C&oacute;d. interno</th><th>L&aacute;mina</th></tr></thead>
                <tbody>${g.piezas.map((p) => {
                  const h = g.hojas.find((x) => (x.p || []).includes(p));
                  return `<tr><td class="sp-ref">${planEsc(p)}</td>${intCellHtml(p)}<td class="pl-soft">${h ? `<button class="mec-ir" type="button" onclick="mecVerHoja(${g.hojas.indexOf(h)})">${planEsc(h.tav)}</button>` : "&mdash;"}</td></tr>`;
                }).join("")}</tbody>
              </table>
            </div>
          </div>` : '<p class="pl-soft">Este grupo no tiene l&aacute;mina de despiece propia en el cat&aacute;logo; su mantenimiento s&iacute; est&aacute; en el manual de Calibrado.</p>'}
        </div>`;
      }

      // ── MS235: los 29 sensores del esquema ES4220003 ────────────────────────
      // Cuando falta un sensor en la maquina, la pregunta es siempre la misma:
      // cual iba ahi y que se pide. Esta tabla lo dice: la sigla del esquema, que
      // hace, la marca y el tipo, y el codigo Schmucker con el que se compra.

      const senVista = { q: "", zona: "" };

      function sensoresMS235() { return window.MS235_SENSORES || []; }

      function senBuscar(v) {
        senVista.q = v;
        senRefresh();
        const c = document.getElementById("senSearch");
        if (c) { c.focus(); c.setSelectionRange(c.value.length, c.value.length); }
      }
      function senZona(z) { senVista.zona = z === senVista.zona ? "" : z; senRefresh(); }
      function senRefresh() {
        const box = document.getElementById("senPanel");
        if (box) box.outerHTML = renderSensoresPanel();
      }

      function renderSensoresPanel() {
        const todos = sensoresMS235();
        if (!todos.length) return "";
        const tokens = planTokens(senVista.q);
        const zonas = {};
        todos.forEach((s) => { zonas[s.zona] = (zonas[s.zona] || 0) + 1; });
        const filas = todos.filter((s) => {
          if (senVista.zona && s.zona !== senVista.zona) return false;
          if (!tokens.length) return true;
          const hay = planPlain([s.sigla, s.f, s.marca, s.tipo, s.cod, s.hilo, s.zona].join(" "));
          return tokens.every((t) => hay.includes(t));
        });
        // Cuantos hay de cada modelo: es lo que interesa para tener repuesto en almacen.
        const modelos = {};
        todos.forEach((s) => { if (s.cod) modelos[s.cod] = modelos[s.cod] || { n: 0, marca: s.marca, tipo: s.tipo }; if (s.cod) modelos[s.cod].n++; });

        return `<div id="senPanel" class="pl-panel">
          <div class="panel-header-clean">
            <h3>Sensores de la m&aacute;quina &middot; esquema ES4220003</h3>
            <p>Los ${todos.length} sensores que lleva la MS235, con la <strong>sigla</strong> con la que salen en el esquema,
               qu&eacute; controla cada uno, la marca y el tipo, y el <strong>c&oacute;digo Schmucker</strong> con el que se pide.
               Si falta uno en la m&aacute;quina, aqu&iacute; se ve cu&aacute;l era y qu&eacute; hay que comprar.</p>
          </div>
          <div class="pl-filters">
            <input type="search" id="senSearch" placeholder="Buscar: sigla (B29.8), funci&oacute;n (bobina, planchas), marca o c&oacute;digo&hellip;" value="${planEsc(senVista.q)}" oninput="senBuscar(this.value)" aria-label="Buscar sensores">
            <span class="counter">${filas.length} de ${todos.length}</span>
          </div>
          <div class="spares-filter-tags">
            <button class="filter-tag-btn ${senVista.zona ? "" : "active"}" type="button" onclick="senZona('')">Todas las zonas</button>
            ${Object.keys(zonas).sort((a, b) => zonas[b] - zonas[a] || a.localeCompare(b)).map((z) =>
              `<button class="filter-tag-btn ${senVista.zona === z ? "active" : ""}" type="button" onclick="senZona('${planEsc(z).replace(/'/g, "&#39;")}')">${planEsc(z)} <span class="ftb-n">${zonas[z]}</span></button>`).join("")}
          </div>
          <div class="pl-tablewrap">
            <table class="pl-table sen-table">
              <thead><tr>
                <th>Sigla</th><th>Zona</th><th>Qu&eacute; controla</th><th>Marca</th><th>Tipo</th><th>C&oacute;d. Schmucker</th><th>Hilo</th>
              </tr></thead>
              <tbody>${filas.length ? filas.map((s) => `<tr>
                <td class="pl-code">${planMark(s.sigla, tokens)}</td>
                <td>${planEsc(s.zona)}</td>
                <td class="pl-desc">${planMark(s.f, tokens)}${s.nota ? `<span class="pl-obs">${planEsc(s.nota)}</span>` : ""}</td>
                <td>${s.marca ? `<span class="type-badge">${planEsc(s.marca)}</span>` : "&mdash;"}</td>
                <td class="sp-ref">${s.tipo ? planMark(s.tipo, tokens) : "&mdash;"}</td>
                <td class="sp-ref">${s.cod ? planMark(s.cod, tokens) : '<span class="pl-soft">v&eacute;ase esquema neum&aacute;tico</span>'}</td>
                <td class="pl-num">${planEsc(s.hilo) || "&mdash;"}</td>
              </tr>`).join("") : '<tr><td colspan="7" class="pl-soft" style="padding:18px;text-align:center">Ning&uacute;n sensor coincide con esa b&uacute;squeda.</td></tr>'}</tbody>
            </table>
          </div>
          <div class="sen-modelos">
            <p class="sen-modelos__t">Modelos distintos y cu&aacute;ntos lleva la m&aacute;quina de cada uno</p>
            <div class="sen-modelos__grid">
              ${Object.entries(modelos).sort((a, b) => b[1].n - a[1].n).map(([cod, m]) => `<div class="sen-mod">
                <span class="sen-mod__n">${m.n}&times;</span>
                <span class="sen-mod__t"><strong>${planEsc(m.marca)}</strong> ${planEsc(m.tipo)}</span>
                <span class="sen-mod__c">${planEsc(cod)}</span>
              </div>`).join("")}
            </div>
            ${(() => {
              const top = Object.entries(modelos).sort((a, b) => b[1].n - a[1].n)[0];
              if (!top || top[1].n < 3) return "";
              return `<p class="pl-soft">Un solo modelo cubre ${top[1].n} de las ${todos.length} posiciones (${planEsc(top[1].marca)} ${planEsc(top[1].tipo)}), as&iacute; que tener uno en almac&eacute;n resuelve buena parte de las fallas por sensor.</p>`;
            })()}
          </div>
        </div>`;
      }

      // ── Procedimientos del manual, con su figura ────────────────────────────
      // Las tareas de mantenimiento dicen QUÉ hay que hacer y cada cuánto. Esto
      // dice CÓMO: son las páginas del manual del fabricante, con el dibujo de la
      // operación y el texto en su idioma original y en español. Se agrupan por
      // zona de la máquina para no dar una lista de cien páginas sueltas.

      const procVista = { q: "", zona: "" };

      function procDe(machine) { return (window.PROC_DATA || {})[machine.id] || null; }

      function procBuscar(v) {
        procVista.q = v;
        procRefresh();
        const c = document.getElementById("procSearch");
        if (c) { c.focus(); c.setSelectionRange(c.value.length, c.value.length); }
      }
      function procZona(z) { procVista.zona = z === procVista.zona ? "" : z; procRefresh(); }
      function procRefresh() {
        const machine = machines.find((m) => m.id === selectedId);
        const box = document.getElementById("procPanel");
        if (box && machine) box.outerHTML = renderProcedimientosPanel(machine);
      }

      function renderProcedimientosPanel(machine) {
        const P = procDe(machine);
        if (!P) return "";
        const tokens = planTokens(procVista.q);
        const zonas = {};
        P.grupos.forEach((g) => { zonas[g.zona] = (zonas[g.zona] || 0) + g.proc.length; });
        const total = P.grupos.reduce((n, g) => n + g.proc.length, 0);

        const grupos = P.grupos
          .filter((g) => !procVista.zona || g.zona === procVista.zona)
          .map((g) => ({
            ...g,
            proc: g.proc.filter((p) => {
              if (!tokens.length) return true;
              const hay = planPlain([p.t, g.zona, g.cod].join(" "));
              return tokens.every((t) => hay.includes(t));
            })
          }))
          .filter((g) => g.proc.length);
        const vistos = grupos.reduce((n, g) => n + g.proc.length, 0);

        return `<div id="procPanel" class="pl-panel">
          <div class="panel-header-clean">
            <h3>C&oacute;mo se hace &middot; ${total} procedimientos del manual</h3>
            <p>Las p&aacute;ginas del manual del fabricante con la figura de cada operaci&oacute;n, agrupadas por zona de la
               m&aacute;quina. Toca una para ampliarla. ${planEsc(P.ref)}</p>
          </div>
          <div class="pl-filters">
            <input type="search" id="procSearch" placeholder="Buscar: limpieza, fase, cadena, rodillos, lubricaci&oacute;n&hellip;" value="${planEsc(procVista.q)}" oninput="procBuscar(this.value)" aria-label="Buscar procedimientos">
            <span class="counter">${vistos} de ${total}</span>
          </div>
          <div class="spares-filter-tags">
            <button class="filter-tag-btn ${procVista.zona ? "" : "active"}" type="button" onclick="procZona('')">Toda la m&aacute;quina</button>
            ${Object.keys(zonas).sort((a, b) => zonas[b] - zonas[a] || a.localeCompare(b)).map((z) =>
              `<button class="filter-tag-btn ${procVista.zona === z ? "active" : ""}" type="button" onclick="procZona('${planEsc(z).replace(/'/g, "&#39;")}')">${planEsc(z)} <span class="ftb-n">${zonas[z]}</span></button>`).join("")}
          </div>
          ${grupos.length ? grupos.map((g) => `<div class="proc-grupo">
            <p class="proc-grupo__t">${planEsc(g.zona)} <span>${planEsc(g.cod)} &middot; ${g.proc.length} p&aacute;gina${g.proc.length === 1 ? "" : "s"}</span></p>
            <div class="mec-procs">
              ${g.proc.map((p) => `<figure class="mec-proc" onclick="openLightbox('${planEsc(p.img)}','${planEsc(p.t).replace(/'/g, "&#39;")} — ${planEsc(g.zona).replace(/'/g, "&#39;")}, manual de Calibrado p. ${p.pg}')">
                <img src="${planEsc(p.img)}" alt="${planEsc(p.t)}" loading="lazy">
                <figcaption>${planMark(p.t, tokens)}<span>p. ${p.pg}</span></figcaption>
              </figure>`).join("")}
            </div>
          </div>`).join("") : '<p class="pl-soft" style="padding:14px 2px">Ning&uacute;n procedimiento coincide con esa b&uacute;squeda.</p>'}
        </div>`;
      }
