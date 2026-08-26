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
        const hayDespiece = (typeof MACHINE_PARTS !== "undefined" && MACHINE_PARTS[machine.id])
          || (typeof MACHINE_TABLES !== "undefined" && MACHINE_TABLES[machine.id]);
        const tabs = [
          ["summary", "Resumen"],
          ...(((machine.systems ?? []).length || machine.systemAtlas) ? [["systems", "Sistemas"]] : []),
          ...((eqPlan || (machine.spareParts ?? []).length) ? [["spares", "Repuestos"]] : []),
          ...((machine.maintenanceTasks ?? []).length ? [["maintenance", "Mantenimiento"]] : []),
          ["failures", "Fallas y alarmas"],
          ...(hayDespiece ? [["partsmap", "Despiece"]] : []),
          ...(machine.schematic ? [["schematic", "Plano eléctrico"]] : []),
          ["documents", "Documentos"]
        ];

        detailTitle.textContent = machine.model;
        detailSubtitle.textContent = `Código: ${codigoEquipo} · ${machine.name} · ${machine.area}`;
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
                    <div><span>Código de equipo</span><strong>${codigoEquipo}</strong></div>
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
          <section class="profile-panel" data-profile-panel="spares">
            ${eqPlan ? renderPlanPanel(eqPlan) : ""}
            ${(machine.spareParts ?? []).length && eqPlan ? '<div class="panel-split"></div>' : ""}
            ${renderSparesPanel(machine)}
          </section>

          <section class="profile-panel" data-profile-panel="maintenance">
            ${renderMaintenancePanel(machine)}
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
          ${machine.schematic ? `<section class="profile-panel" data-profile-panel="schematic">${renderSchematicExplorer(machine)}</section>` : ""}
          ${hayDespiece ? `<section class="profile-panel" data-profile-panel="partsmap">
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
      let cloudKnownIds = new Set();
      function loadTasks() { try { return JSON.parse(localStorage.getItem(tasksKey) || "[]"); } catch { return []; } }
      let tasks = loadTasks();
      function saveLocal() { try { localStorage.setItem(tasksKey, JSON.stringify(tasks)); } catch (e) {} }
      function saveTasks() { saveLocal(); if (cloud.enabled && cloud.db) cloudSync(); }

      // Las maquinas salen de la propia app, no de una copia en el navegador.
      function taskMachineName(id) { const m = machines.find((x) => x.id === id); return m ? (m.model || m.name) : "General / Otra"; }
      function machineOptions(sel) {
        return `<option value="">General / Otra</option>` + machines.map((m) => `<option value="${escapeHtml(m.id)}" ${sel === m.id ? "selected" : ""}>${escapeHtml(m.model || m.name)}</option>`).join("");
      }

      // Sube el estado actual a Firestore (upsert de lo presente + borra lo que ya no esta)
      function cloudSync() {
        try {
          const col = cloud.db.collection("tareas");
          const batch = cloud.db.batch();
          const ids = new Set();
          tasks.forEach((t) => { ids.add(t.id); batch.set(col.doc(t.id), JSON.parse(JSON.stringify(t))); });
          cloudKnownIds.forEach((id) => { if (!ids.has(id)) batch.delete(col.doc(id)); });
          cloudKnownIds = ids;
          batch.commit().catch((e) => console.error("[Tareas] guardar nube:", e));
        } catch (e) { console.error("[Tareas] cloudSync:", e); }
      }

      function cloudSubscribe() {
        if (!(cloud.enabled && cloud.db)) { updateCloudChip(); return; }
        cloud.db.collection("tareas").onSnapshot({ includeMetadataChanges: true }, (snap) => {
          cloud.connected = !snap.metadata.fromCache;
          const remote = [];
          snap.forEach((d) => remote.push(d.data()));
          tasks = remote;
          cloudKnownIds = new Set(remote.map((t) => t.id));
          saveLocal();
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
      //  TURNOS DEL PERSONAL
      //  Tambien estaba suelto en turnos.html. Calcula la rotacion del ciclo de
      //  6 dias (2 dia, 2 noche, 2 descanso) a partir del cuadro de julio de 2026.
      // ======================================================================
      const TN_ROSTER = {
        sede4: {
          label: "Sede 4",
          groups: [
            { name: "Grupo Sede 4-1", phase: "dia", members: ["Alexander Alberto Algarín Pacheco", "Jhon Alexander Pájaro Ariza", "Leonardo Santos Ramírez", "Jair Mesa Rincón", "José Luis Vargas Buitrago"] },
            { name: "Grupo Sede 4-2", phase: "noche", members: ["Bladimir Antonio Escorcia Santos", "Miguel Enrique De la Hoz Salcedo", "Andrés David Vega Ortiz", "Brayan Alexander Caro Mebarak"] },
            { name: "Grupo Sede 4-3", phase: "descanso", members: ["Luis Miguel Ruiz Bayuelo", "Diego Andrés Chacón Cano", "Yesid Alfredo Anaya Ramírez", "Heiner Alcides Velásquez Mosquera"] }
          ]
        },
        sede2: {
          label: "Sede 2 (Vía 40)",
          groups: [
            { name: "Grupo Vía 40-1", phase: "descanso", members: ["Alfonso Enrique Orozco Murillo"] },
            { name: "Grupo Vía 40-2", phase: "noche", members: ["Samith Arick Sanjuán Otálora"] },
            { name: "Grupo Vía 40-3", phase: "dia", members: ["Oscar Antonio Hernández Sarabia"] }
          ]
        }
      };
      // Hay quien figura dentro de un grupo pero no rota con él: hace turno fijo.
      // En el cuadro se le marca con "2" todos los días en vez de D/N/L.
      const TN_FIJOS = {
        sede4: [
          { nombre: "Sergio Alexander Vergara Aguirre", grupo: "Grupo Sede 4-2", horario: "8:00 a 20:00", nota: "Pasará a rotar con su grupo; falta confirmar la fecha." }
        ],
        sede2: []
      };

      const TN_SUPPORT = [
        { area: "Eléctrico", members: ["Jaime Villa Pérez"] },
        { area: "Locativo / Infraestructura", members: ["Néstor Ardila Esparza"] },
        { area: "Preventivo", members: ["Alexi Alexander Arroyo De Moya", "Leiner Andrés Montañez Rodríguez"] },
        { area: "Refrigeración", members: ["Juan Carlos Estupiñán De la Cruz"] }
      ];
      const TN_ANCHOR = Date.UTC(2026, 6, 1); // ancla del ciclo: 1 de julio de 2026
      const TN_CICLO = 6;
      const TN_BLOQUE = 2;
      const TN_PHASE_BLOCKS = {
        dia: ["dia", "noche", "descanso"],
        noche: ["noche", "descanso", "dia"],
        descanso: ["descanso", "dia", "noche"]
      };
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
        TN_ROSTER[tnSede].groups.forEach((g) => { buckets[tnEstadoDe(g.phase, fecha)].push(g); });

        const grid = document.getElementById("tnShiftGrid");
        grid.innerHTML = ["dia", "noche", "descanso"].map((est) => {
          if (tnTurno !== "todos" && tnTurno !== est) return "";
          const info = TN_INFO[est];
          const groups = buckets[est];
          // Los de turno fijo van siempre en la tarjeta de día: trabajan de 8 a 20
          // todos los días laborables, no rotan con su grupo.
          const fijos = est === "dia" ? (TN_FIJOS[tnSede] || []) : [];
          const rotan = groups.length
            ? groups.map((g) => `<div class="tn-group">${escapeHtml(g.name)}</div><ul class="tn-people">${g.members.map((m) => `<li><span class="tn-ini">${escapeHtml(tnIniciales(m).toUpperCase())}</span>${escapeHtml(m)}</li>`).join("")}</ul>`).join("")
            : "";
          const bloqueFijos = fijos.length
            ? `<div class="tn-group">Turno fijo</div><ul class="tn-people">${fijos.map((f) => `<li><span class="tn-ini">${escapeHtml(tnIniciales(f.nombre).toUpperCase())}</span><span>${escapeHtml(f.nombre)}<span class="tn-fijo">${escapeHtml(f.horario)} &middot; ${escapeHtml(f.grupo)}</span></span></li>`).join("")}</ul>`
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
             <div class="tn-support-grid">${TN_SUPPORT.map((s) => `<div class="tn-support-item"><b>${escapeHtml(s.area)}</b><div>${s.members.map(escapeHtml).join("<br>")}</div></div>`).join("")}</div>`
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
      let datosKnownIds = new Set();
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
        try {
          const col = cloud.db.collection("datos");
          const batch = cloud.db.batch();
          const ids = new Set();
          Object.values(datosRep).forEach((d) => { ids.add(d.id); batch.set(col.doc(encodeURIComponent(d.id)), JSON.parse(JSON.stringify(d))); });
          datosKnownIds.forEach((id) => { if (!ids.has(id)) batch.delete(col.doc(encodeURIComponent(id))); });
          datosKnownIds = ids;
          batch.commit().catch((e) => { datosNube.error = e && e.code ? e.code : "error"; console.error("[Datos] guardar nube:", e); });
        } catch (e) { console.error("[Datos] datosSync:", e); }
      }

      function datosSubscribe() {
        if (!(cloud.enabled && cloud.db)) return;
        cloud.db.collection("datos").onSnapshot({ includeMetadataChanges: true }, (snap) => {
          const remoto = {};
          snap.forEach((d) => { const v = d.data(); if (v && v.id) remoto[v.id] = v; });
          datosRep = remoto;
          datosKnownIds = new Set(Object.keys(remoto));
          datosNube.conectado = !snap.metadata.fromCache;
          datosNube.error = "";
          saveDatosLocal();
          renderFichaSiVisible();
        }, (err) => { datosNube.conectado = false; datosNube.error = err && err.code ? err.code : "error"; console.error("[Datos] onSnapshot:", err); });
      }

      // Lo que escribe el usuario manda sobre lo que traía el Excel.
      function repCodigo(eq, r) { return datoDe(eq, r).cod || r.cod || ""; }
      function repExistencia(eq, r) { const v = datoDe(eq, r).exist; return v === undefined ? "" : v; }

      function editarDato(input, clave, campo) {
        guardarDato(clave, campo, input.value);
        renderFichaSiVisible();
      }

      const cambiosKey = "equipos-cambios-v1";
      const CAMBIOS_SEED_ID = "__seed_ago2026";
      let cambios = loadCambios();
      let cambiosKnownIds = new Set();
      // Si el historial no llega a la nube hay que verlo en pantalla: si no, parece
      // compartido con el resto del taller y en realidad solo esta en este navegador.
      const cambiosNube = { conectado: false, error: "" };

      function loadCambios() { try { return JSON.parse(localStorage.getItem(cambiosKey) || "[]"); } catch { return []; } }
      function saveCambiosLocal() { try { localStorage.setItem(cambiosKey, JSON.stringify(cambios)); } catch (e) {} }
      function saveCambios() {
        saveCambiosLocal();
        if (cloud.enabled && cloud.db) cambiosSync();
        renderPlanIfVisible();
      }

      function cambiosSync() {
        try {
          const col = cloud.db.collection("cambios");
          const batch = cloud.db.batch();
          const ids = new Set();
          cambios.forEach((c) => { ids.add(c.id); batch.set(col.doc(c.id), JSON.parse(JSON.stringify(c))); });
          cambiosKnownIds.forEach((id) => { if (!ids.has(id)) batch.delete(col.doc(id)); });
          cambiosKnownIds = ids;
          batch.commit().catch((e) => {
            cambiosNube.conectado = false;
            cambiosNube.error = e && e.code ? e.code : "error";
            console.error("[Cambios] Error guardando en la nube:", e);
            renderPlanIfVisible();
          });
        } catch (e) { console.error("[Cambios] cambiosSync:", e); }
      }

      function cambiosSubscribe() {
        if (!(cloud.enabled && cloud.db)) { cambiosSeedIfNeeded(); return; }
        cloud.db.collection("cambios").onSnapshot({ includeMetadataChanges: true }, (snap) => {
          const remote = [];
          snap.forEach((d) => remote.push(d.data()));
          cambios = remote;
          cambiosKnownIds = new Set(remote.map((c) => c.id));
          cambiosNube.conectado = !snap.metadata.fromCache;
          cambiosNube.error = "";
          saveCambiosLocal();
          cambiosSeedIfNeeded();
          renderPlanIfVisible();
        }, (err) => {
          cambiosNube.conectado = false;
          cambiosNube.error = err && err.code ? err.code : "error";
          console.error("[Cambios] onSnapshot:", err);
          cambiosSeedIfNeeded();
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

      function cambiosSeedIfNeeded() {
        if (cambios.some((c) => c.id === CAMBIOS_SEED_ID)) return;
        const semilla = cambiosSemilla();
        if (!semilla.length) return;
        const tengo = new Set(cambios.map((c) => c.id));
        semilla.forEach((ev) => { if (!tengo.has(ev.id)) cambios.push(ev); });
        cambios.push({ id: CAMBIOS_SEED_ID, marca: true, createdAt: new Date().toISOString() });
        saveCambios();
      }

      function cambiosEventos() { return cambios.filter((c) => c && c.id !== CAMBIOS_SEED_ID && c.cod); }

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
            if (planFilter.sinStock && row.e > 0) return false;
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
        const noStock = rows.filter((r) => r.e === 0).length;
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

          <p class="pl-note">
            Los <strong>${PLAN_EQUIPOS.length} equipos</strong> de la planta, del Excel de la empresa (hoja <strong>PLAN MTTO</strong>, corte ${planEsc(EQ_DATA.corte)}).
            <strong>Elige un equipo</strong> y se abre su ficha con todo lo suyo: repuestos, c&oacute;digo interno, existencias e historial.
            Los que todav&iacute;a no tienen manual ni despiece salen como <em>ficha b&aacute;sica</em> y se les va a&ntilde;adiendo.
            <strong>La frecuencia no viene del Excel: se mide.</strong> Cada cambio que se registra acerca la pieza a tener su frecuencia real.
          </p>

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

      // Buscador y orden por columna del plan de cada ficha, al estilo de una hoja
      // de cálculo: se busca por código, repuesto, sistema o actividad, y se ordena
      // pulsando la cabecera.
      const fichaPlan = { q: "", orden: "", dir: 1 };

      function fichaPlanFilas(eq) {
        const tokens = planTokens(fichaPlan.q);
        let filas = eq.r.filter((r) => planRowMatches(r, tokens));
        const col = fichaPlan.orden;
        if (col) {
          const valor = (r) => {
            if (col === "q" || col === "e") return r[col];
            if (col === "ultimo") { const hh = planCambiosDe(eq.c, r.cod); return hh.length ? hh[hh.length - 1].fecha : ""; }
            if (col === "freq") { const m = planMedicion(planCambiosDe(eq.c, r.cod)); return m ? m.prom : -1; }
            return planPlain(r[col] || "");
          };
          filas = [...filas].sort((a, b) => {
            const va = valor(a), vb = valor(b);
            if (typeof va === "number" && typeof vb === "number") return (va - vb) * fichaPlan.dir;
            return String(va).localeCompare(String(vb)) * fichaPlan.dir;
          });
        }
        return filas;
      }

      function fichaPlanOrdenar(col) {
        if (fichaPlan.orden === col) fichaPlan.dir = -fichaPlan.dir;
        else { fichaPlan.orden = col; fichaPlan.dir = 1; }
        renderFichaSiVisible();
      }

      function fichaPlanBuscar(valor) {
        fichaPlan.q = valor;
        renderFichaSiVisible();
        const caja = document.getElementById("fichaPlanSearch");
        if (caja) { caja.focus(); caja.setSelectionRange(caja.value.length, caja.value.length); }
      }

      function fichaPlanTh(col, etiqueta, clase) {
        const activa = fichaPlan.orden === col;
        const flecha = activa ? (fichaPlan.dir === 1 ? " \u2191" : " \u2193") : "";
        return `<th class="${clase || ""} pl-th-sort ${activa ? "is-sorted" : ""}" onclick="fichaPlanOrdenar('${col}')" title="Ordenar por ${etiqueta}">${etiqueta}${flecha}</th>`;
      }

      // Todo lo que hace falta para el mantenimiento de UN equipo, dentro de su ficha.
      function renderPlanPanel(eq) {
        const total = eq.r.length;
        const sinStock = eq.r.filter((r) => r.e === 0).length;
        const conHist = eq.r.filter((r) => planCambiosDe(eq.c, r.cod).length).length;
        const conMedida = eq.r.filter((r) => planMedicion(planCambiosDe(eq.c, r.cod))).length;
        const filas = fichaPlanFilas(eq);
        const tokens = planTokens(fichaPlan.q);
        // Las piezas que el Excel no listaba pero sí se han cambiado ya no van
        // en un apartado aparte: son parte de los repuestos del equipo.
        const sueltas = planSueltosDe(eq).map(({ cod, lista }) => ({
          s: "", a: "", cod, d: (lista[lista.length - 1].d || ""), q: lista[lista.length - 1].q || 0, e: 0, o: "", fuera: true
        })).filter((r) => planRowMatches(r, tokens));
        return `<div class="pl-panel">
          <div class="panel-header-clean">
            <h3>Plan de mantenimiento &middot; c&oacute;digo de equipo ${planEsc(eq.c)}</h3>
            <p>Los repuestos de este equipo con el <strong>c&oacute;digo interno</strong> con el que se piden en almac&eacute;n.
               La frecuencia no viene del Excel: se mide de los cambios que se van registrando aqu&iacute;.</p>
          </div>
          <div class="pl-kpis">
            <div class="pl-kpi"><span class="pl-kpi__n">${total}</span><span class="pl-kpi__l">Repuestos</span></div>
            <div class="pl-kpi pl-kpi--stock"><span class="pl-kpi__n">${sinStock}</span><span class="pl-kpi__l">Sin existencia</span></div>
            <div class="pl-kpi pl-kpi--ok"><span class="pl-kpi__n">${conHist}</span><span class="pl-kpi__l">Con cambios registrados</span></div>
            <div class="pl-kpi pl-kpi--warn"><span class="pl-kpi__n">${conMedida}</span><span class="pl-kpi__l">Con frecuencia medida</span></div>
          </div>
          <div class="pl-filters">
            <input type="search" id="fichaPlanSearch" placeholder="Buscar en este equipo: c&oacute;digo interno, repuesto, sistema&hellip;" value="${planEsc(fichaPlan.q)}" oninput="fichaPlanBuscar(this.value)" aria-label="Buscar en el plan de este equipo">
            <span class="counter">${filas.length + sueltas.length} de ${eq.r.length + planSueltosDe(eq).length}</span>
          </div>
          <div class="pl-tablewrap">
            <table class="pl-table">
              <thead><tr>
                ${fichaPlanTh("s", "Sistema")}${fichaPlanTh("a", "Actividad")}${fichaPlanTh("cod", "C\u00f3d. interno")}${fichaPlanTh("d", "Repuesto")}
                ${fichaPlanTh("q", "Cant.", "pl-num")}${fichaPlanTh("e", "Exist.", "pl-num")}
                ${fichaPlanTh("ultimo", "\u00daltimo cambio")}${fichaPlanTh("freq", "Frecuencia medida")}<th></th>
              </tr></thead>
              <tbody>${(filas.length + sueltas.length) ? [...filas, ...sueltas].map((r) => planRowHtml(eq, r, tokens)).join("") : '<tr><td colspan="9" class="pl-soft" style="padding:18px;text-align:center">Nada coincide con esa b&uacute;squeda en este equipo.</td></tr>'}</tbody>
            </table>
          </div>
          </div>`;
      }

      // Repinta la ficha abierta cuando cambia el historial, para no perder el sitio.
      function renderFichaSiVisible() {
        const vista = document.getElementById("detailView");
        if (!vista || !vista.classList.contains("is-active")) return;
        const machine = machines.find((m) => m.id === selectedId);
        if (!machine) return;
        const panel = document.querySelector('[data-profile-panel="spares"] .pl-panel');
        const eq = equipoDeMachine(machine);
        if (panel && eq) panel.innerHTML = renderPlanPanel(eq);
      }

      function planSueltosHtml(eq) {
        const sueltos = planSueltosDe(eq);
        if (!sueltos.length) return "";
        return `<div class="pl-sueltos">
          <p class="pl-sueltos__t">Cambios registrados que el Excel no tiene en el plan de este equipo</p>
          <p class="pl-sueltos__n">${sueltos.length} ${sueltos.length === 1 ? "pieza" : "piezas"} con cambios reales pero sin l&iacute;nea en el cat&aacute;logo importado. Su frecuencia se mide igual.</p>
          ${sueltos.map(({ cod, lista }) => {
            const med = planMedicion(lista);
            const ultimo = lista[lista.length - 1];
            return `<div class="pl-ev">
              <span class="pl-code">${planEsc(cod)}</span>
              <span class="pl-ev__d">${planEsc(ultimo.d || "")}</span>
              <span class="pl-ev__f">${planEsc(ultimo.fecha)}</span>
              <span class="pl-ev__i">${med ? "cada " + planEsc(planFmtDias(med.prom)) : lista.length + (lista.length === 1 ? " registro" : " registros")}</span>
              <button class="pl-reg" type="button" onclick="planRegistrarSuelto('${planEsc(eq.c)}','${planEsc(cod)}')">Registrar</button>
            </div>`;
          }).join("")}
        </div>`;
      }

      // Registrar otro cambio de una pieza que no esta en el catalogo del Excel.
      function planRegistrarSuelto(equipo, cod) {
        const eq = PLAN_EQUIPOS.find((e) => e.c === equipo);
        const previo = cambiosEventos().filter((c) => c.eq === equipo && c.cod === cod).slice(-1)[0];
        if (!eq || !previo) return;
        planRegCtx = { eq: equipo, cod, d: previo.d || "", q: previo.q || 1 };
        const sheet = document.getElementById("plSheet");
        const back = document.getElementById("plSheetBackdrop");
        const what = document.getElementById("plSheetWhat");
        const form = document.getElementById("plForm");
        if (!sheet || !back || !form) return;
        if (what) what.innerHTML = `<strong>${planEsc(cod)}</strong> &middot; ${planEsc(previo.d || "")}<br><span class="pl-soft">${planEsc(eq.n)} &middot; sin l&iacute;nea en el Excel</span>`;
        form.reset();
        form.fecha.value = new Date().toISOString().slice(0, 10);
        form.q.value = previo.q || 1;
        back.hidden = false;
        sheet.hidden = false;
        setTimeout(() => form.fecha.focus(), 60);
      }

      // Fila del indice: lo justo para decidir, y un botón que abre la ficha del equipo
      // en su pestaña de plan. El detalle vive en la máquina, no aquí.
      function planEquipoCard(group, query) {
        const eq = group.eq;
        const rows = group.rows;
        const noStock = rows.filter((r) => r.e === 0).length;
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

      function planRowHtml(eq, r, query) {
        const historial = planCambiosDe(eq.c, r.cod);
        const medicion = planMedicion(historial);
        const ultimo = historial.length ? historial[historial.length - 1].fecha : "";
        const clave = datoClave(eq, r);
        const abierto = planHistOpen.has(clave);
        const freq = medicion
          ? `<strong>cada ${planEsc(planFmtDias(medicion.prom))}</strong><span class="pl-obs">${medicion.mediciones} ${medicion.mediciones === 1 ? "intervalo medido" : "intervalos medidos"} &middot; pr&oacute;ximo hacia ${planEsc(medicion.proximo)}</span>`
          : historial.length === 1
            ? '<span class="pl-soft">1 registro &mdash; falta otro para medirla</span>'
            : '<span class="pl-soft">sin registrar</span>';
        const fila = `<tr class="${historial.length ? "" : "is-nuevo"} ${r.fuera ? "is-fuera" : ""}">
          <td>${planMark(r.s, query) || "&mdash;"}</td>
          <td>${planEsc(r.a) || "&mdash;"}</td>
          <td class="pl-code"><input class="pl-edit pl-edit--cod" value="${planEsc(repCodigo(eq, r))}" placeholder="—" title="Código interno con el que se pide en almacén. Se comparte con todo el taller." onchange="editarDato(this, '${planEsc(clave)}', 'cod')"></td>
          <td class="pl-desc">${planMark(r.d, query) || "&mdash;"}${r.o ? `<span class="pl-obs">${planEsc(r.o)}</span>` : ""}</td>
          <td class="pl-num">${r.q || "&mdash;"}</td>
          <td class="pl-num"><input class="pl-edit pl-edit--num" value="${planEsc(repExistencia(eq, r))}" placeholder="—" title="${r.e ? "El Excel decía " + r.e + ". " : ""}Escribe la existencia real; se comparte con todo el taller." onchange="editarDato(this, '${planEsc(clave)}', 'exist')"></td>
          <td class="pl-loc">${ultimo ? planEsc(ultimo) : "&mdash;"}${historial.length ? `<button class="pl-hist-btn" type="button" onclick="planHistToggle('${planEsc(clave)}')">${historial.length} ${historial.length === 1 ? "registro" : "registros"}</button>` : ""}</td>
          <td class="pl-freq">${freq}</td>
          <td class="pl-num">${repCodigo(eq, r) ? `<button class="pl-reg" type="button" onclick="planRegistrar('${planEsc(eq.c)}','${planEsc(repCodigo(eq, r))}')" title="Registrar un cambio de esta pieza">Registrar</button>` : ""}</td>
        </tr>`;
        if (!abierto || !historial.length) return fila;
        return fila + `<tr class="pl-histrow"><td colspan="9">
          <div class="pl-hist">
            <span class="pl-hist__t">Cambios registrados de ${planEsc(r.cod)}</span>
            ${historial.map((ev, i) => {
              const prev = i > 0 ? planDiasEntre(historial[i - 1].fecha, ev.fecha) : null;
              return `<div class="pl-ev">
                <span class="pl-ev__f">${planEsc(ev.fecha)}</span>
                <span class="pl-ev__d">${ev.q ? planEsc(ev.q) + " ud. " : ""}${planEsc(ev.quien) || ""}${ev.nota ? (ev.quien ? " &middot; " : "") + planEsc(ev.nota) : ""}</span>
                ${prev !== null && isFinite(prev) ? `<span class="pl-ev__i">+${planEsc(planFmtDias(prev))}</span>` : '<span class="pl-ev__i">1.&ordm;</span>'}
                <button class="pl-ev__x" type="button" onclick="planBorrarCambio('${planEsc(ev.id)}')" title="Borrar este registro">&times;</button>
              </div>`;
            }).join("")}
          </div></td></tr>`;
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
          nota: String(f.nota.value || "").trim(),
          createdAt: new Date().toISOString()
        });
        planHistOpen.add(planRegCtx.eq + "|" + planRegCtx.cod);
        saveCambios();
        planSheetClose();
        renderPlan();
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

      function setView(viewName) {
        Object.entries(views).forEach(([name, element]) => { element.classList.toggle("is-active", name === viewName); });
        navHome.classList.toggle("is-active", viewName === "home");
        navSearch.classList.toggle("is-active", viewName === "results" || viewName === "detail");
        if (navTasks) navTasks.classList.toggle("is-active", viewName === "tasks");
        if (navPlan) navPlan.classList.toggle("is-active", viewName === "plan");
        if (navTurnos) navTurnos.classList.toggle("is-active", viewName === "turnos");
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
        homeSearch.focus();
        saveUiState({ activeView: "home" });
      }

      function openDetail(machineId) {
        const machine = machines.find((item) => item.id === machineId);
        if (!machine) return;
        selectedId = machine.id;
        renderProfile(machine);
        setView("detail");
        saveUiState({ activeView: "detail" });
      }

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

      homeSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        currentQuery = homeSearch.value.trim();
        saveUiState();
        goResults();
      });

      resultsSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        currentQuery = resultsSearch.value.trim();
        saveUiState();
        goResults();
      });

      homeSearch.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); currentQuery = homeSearch.value.trim(); saveUiState(); goResults(); }
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
      navHome.addEventListener("click", goHome);
      navSearch.addEventListener("click", () => goResults({ keepSelection: true }));
      navTasks.addEventListener("click", () => goTasks());
      if (navPlan) navPlan.addEventListener("click", () => goPlan());
      if (navTurnos) navTurnos.addEventListener("click", () => goTurnos());

      // Menú hamburguesa (celular): abrir/cerrar el menú desplegable
      const navBurger = document.getElementById("navBurger");
      const navBackdrop = document.getElementById("navBackdrop");
      const sideNav = document.getElementById("sideNav");
      function setMenu(open){
        if (!sideNav || !navBurger || !navBackdrop) return;
        sideNav.classList.toggle("is-open", open);
        navBurger.classList.toggle("is-open", open);
        navBurger.setAttribute("aria-expanded", open ? "true" : "false");
        navBackdrop.hidden = !open;
      }
      navBurger && navBurger.addEventListener("click", () => setMenu(!sideNav.classList.contains("is-open")));
      navBackdrop && navBackdrop.addEventListener("click", () => setMenu(false));
      sideNav && sideNav.querySelectorAll(".side-nav__button").forEach(b => b.addEventListener("click", () => setMenu(false)));
      document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
      modalOpeners.forEach((button) => button.addEventListener("click", openModal));
      modalClosers.forEach((button) => button.addEventListener("click", closeModal));
      equipmentForm.addEventListener("submit", handleSubmit);

      modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) closeModal(); });
      document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modalBackdrop.hidden) closeModal(); });
