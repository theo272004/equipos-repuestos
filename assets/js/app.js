// ── Edit Equipment Modal ─────────────────────────────────────────────────
      const editModalBackdrop = document.getElementById("editModalBackdrop");
      const editEquipmentForm = document.getElementById("editEquipmentForm");
      const closeEditModalBtn = document.getElementById("closeEditModal");
      const cancelEditModalBtn = document.getElementById("cancelEditModal");

      function openEditModal() {
        const machine = machines.find(m => m.id === selectedId);
        if (!machine) return;
        const f = editEquipmentForm;
        f.elements.name.value = machine.name ?? "";
        f.elements.model.value = machine.model ?? "";
        f.elements.area.value = machine.area ?? "";
        f.elements.location.value = machine.location ?? "";
        f.elements.status.value = machine.status ?? "Operativo";
        f.elements.criticality.value = machine.criticality ?? "Alta";
        f.elements.manufacturer.value = (machine.technicalData ?? {}).manufacturer ?? "";
        f.elements.brand.value = (machine.technicalData ?? {}).brand ?? "";
        f.elements.serialNumber.value = (machine.technicalData ?? {}).serialNumber ?? "";
        f.elements.year.value = (machine.technicalData ?? {}).year ?? "";
        f.elements["function"].value = (machine.technicalData ?? {}).function ?? "";
        f.elements.description.value = machine.description ?? "";
        f.elements.capacity.value = (machine.technicalData ?? {}).capacity ?? "";
        f.elements.dosingSystem.value = (machine.technicalData ?? {}).dosingSystem ?? "";
        f.elements.manual.value = machine.manual ?? "";
        editModalBackdrop.hidden = false;
        f.elements.name.focus();
      }

      function closeEditModal() {
        editModalBackdrop.hidden = true;
        editEquipmentForm.reset();
      }

      function handleEditSubmit(e) {
        e.preventDefault();
        const machine = machines.find(m => m.id === selectedId);
        if (!machine) return;
        const f = editEquipmentForm;
        machine.name = f.elements.name.value.trim() || machine.name;
        machine.model = f.elements.model.value.trim() || machine.model;
        machine.area = f.elements.area.value.trim() || machine.area;
        machine.location = f.elements.location.value.trim() || machine.location;
        machine.status = f.elements.status.value;
        machine.criticality = f.elements.criticality.value;
        machine.manual = f.elements.manual.value.trim() || machine.manual;
        machine.description = f.elements.description.value.trim() || machine.description;
        if (!machine.technicalData) machine.technicalData = {};
        machine.technicalData.manufacturer = f.elements.manufacturer.value.trim() || machine.technicalData.manufacturer;
        machine.technicalData.brand = f.elements.brand.value.trim() || machine.technicalData.brand;
        machine.technicalData.serialNumber = f.elements.serialNumber.value.trim() || machine.technicalData.serialNumber;
        machine.technicalData.year = f.elements.year.value.trim() || machine.technicalData.year;
        machine.technicalData["function"] = f.elements["function"].value.trim() || machine.technicalData["function"];
        machine.technicalData.capacity = f.elements.capacity.value.trim() || machine.technicalData.capacity;
        machine.technicalData.dosingSystem = f.elements.dosingSystem.value.trim() || machine.technicalData.dosingSystem;

        // Imagen nueva (opcional)
        const imgFile = f.elements.image.files[0];
        if (imgFile) {
          const reader = new FileReader();
          reader.onload = () => {
            machine.image = reader.result;
            renderProfile(machine);
            renderResults();
          };
          reader.readAsDataURL(imgFile);
        }

        // Persistir en localStorage
        const edits = JSON.parse(localStorage.getItem("machineProfileEdits") || "{}");
        edits[machine.id] = {
          name: machine.name, model: machine.model, area: machine.area,
          location: machine.location, status: machine.status, criticality: machine.criticality,
          manual: machine.manual, description: machine.description,
          technicalData: machine.technicalData
        };
        localStorage.setItem("machineProfileEdits", JSON.stringify(edits));

        closeEditModal();
        renderProfile(machine);
        renderResults();
      }

      closeEditModalBtn.addEventListener("click", closeEditModal);
      cancelEditModalBtn.addEventListener("click", closeEditModal);
      editModalBackdrop.addEventListener("click", (e) => { if (e.target === editModalBackdrop) closeEditModal(); });
      editEquipmentForm.addEventListener("submit", handleEditSubmit);
      editMachineBtn.addEventListener("click", openEditModal);

      // Cargar ediciones guardadas al inicio
      (function restoreProfileEdits() {
        const edits = JSON.parse(localStorage.getItem("machineProfileEdits") || "{}");
        for (const [mid, data] of Object.entries(edits)) {
          const machine = machines.find(m => m.id === mid);
          if (!machine) continue;
          if (data.name) machine.name = data.name;
          if (data.model) machine.model = data.model;
          if (data.area) machine.area = data.area;
          if (data.location) machine.location = data.location;
          if (data.status) machine.status = data.status;
          if (data.criticality) machine.criticality = data.criticality;
          if (data.manual) machine.manual = data.manual;
          if (data.description) machine.description = data.description;
          if (data.technicalData) {
            if (!machine.technicalData) machine.technicalData = {};
            Object.assign(machine.technicalData, data.technicalData);
          }
        }
      })();


      // ── Diagnostic Assistant ──────────────────────────────────────────────────
      const assistantPanel = document.getElementById("assistantPanel");
      const assistantMessages = document.getElementById("assistantMessages");
      const assistantInput = document.getElementById("assistantInput");
      const assistantApiSection = document.getElementById("assistantApiSection");
      const assistantApiKeyInput = document.getElementById("assistantApiKeyInput");
      let assistantMachine = null;

      const ASSISTANT_API_KEY = "assistant-anthropic-key";

      function populateMachineSelect(preferredId) {
        const select = document.getElementById("assistantMachineSelect");
        select.innerHTML = machines.map(m =>
          `<option value="${m.id}" ${m.id === preferredId ? "selected" : ""}>${m.model} — ${m.name}</option>`
        ).join("");
      }

      function openAssistant() {
        const preferredId = selectedId ?? machines[0]?.id ?? null;
        populateMachineSelect(preferredId);
        assistantMachine = preferredId ? machines.find(m => m.id === preferredId) ?? null : null;

        const apiKey = localStorage.getItem(ASSISTANT_API_KEY) ?? "";
        assistantApiKeyInput.value = apiKey ? "••••••••••••••" : "";

        if (assistantMessages.children.length === 0) {
          const welcome = `Hola. Selecciona el equipo en el menú de arriba y cuéntame qué problema tienes: puede ser una falla, un ajuste, mantenimiento o cualquier duda técnica.`;
          assistantMessages.innerHTML = `<div class="msg-assistant">${welcome}</div>`;
        }

        assistantPanel.classList.add("is-open");
        document.getElementById("navAssistant")?.classList.add("is-active");
        assistantInput.focus();
      }

      document.getElementById("assistantMachineSelect").addEventListener("change", (e) => {
        assistantMachine = machines.find(m => m.id === e.target.value) ?? null;
        if (assistantMachine) {
          assistantMessages.insertAdjacentHTML("beforeend",
            `<div class="msg-assistant">Cambié el contexto a <strong>${assistantMachine.model} — ${assistantMachine.name}</strong>. ¿Qué necesitas saber?</div>`);
          assistantMessages.scrollTop = assistantMessages.scrollHeight;
        }
      });

      function closeAssistant() {
        assistantPanel.classList.remove("is-open");
        document.getElementById("navAssistant")?.classList.remove("is-active");
      }

      // Palabras genéricas que no deben disparar una coincidencia de falla
      const ASSIST_STOPWORDS = new Set(["maquina","equipo","como","hace","pasa","tiene","esta","sale","problema","falla","ayuda","quiero","necesito","puede","para","con","del","los","las","una","por","que","esto","muy","hay","cual","donde","cuando"]);
      function assistWords(query) {
        return normalize(query).split(/\s+/).filter(w => w.length > 2 && !ASSIST_STOPWORDS.has(w));
      }

      function matchRuleResponse(query, machine) {
        if (!machine?.failureModes?.length) return null;
        const words = assistWords(query);
        if (!words.length) return null;
        let best = null, bestScore = 0;
        for (const f of machine.failureModes) {
          const haystack = normalize([
            f.name,
            ...(Array.isArray(f.symptoms) ? f.symptoms : [f.symptoms]),
            f.probableSystem,
            ...(Array.isArray(f.checks) ? f.checks : [f.checks]),
            f.correction ?? ""
          ].join(" "));
          const hits = words.filter(w => haystack.includes(w)).length;
          const score = hits / words.length;
          if (score > bestScore) { bestScore = score; best = f; }
        }
        // Umbral más alto: evita forzar una falla equivocada por una palabra suelta
        return bestScore >= 0.4 ? best : null;
      }

      // Búsqueda offline (sin IA) en mantenimiento, repuestos y códigos de causa
      function offlineKnowledge(query, machine) {
        const words = assistWords(query);
        if (!words.length) return "";
        const score = (text) => { const h = normalize(text); return words.filter(w => h.includes(w)).length; };
        const maint = (machine.maintenanceTasks ?? [])
          .map(t => ({ t, s: score(`${t.name} ${t.system} ${t.acceptance}`) }))
          .filter(x => x.s > 0).sort((a,b)=>b.s-a.s).slice(0,3);
        const spares = (machine.spareParts ?? [])
          .map(p => ({ p, s: score(`${p.name} ${p.system} ${p.reference ?? ""} ${p.function}`) }))
          .filter(x => x.s > 0).sort((a,b)=>b.s-a.s).slice(0,3);
        let html = "";
        if (maint.length) {
          html += `<div class="diag-symptoms">🛠️ Mantenimiento relacionado:</div><ul>` +
            maint.map(({t}) => `<li><strong>${t.name}</strong> — ${t.frequency} · ${t.acceptance}</li>`).join("") + `</ul>`;
        }
        if (spares.length) {
          html += `<div class="diag-symptoms">📦 Repuestos relacionados:</div><ul>` +
            spares.map(({p}) => `<li><strong>${p.name}</strong>${p.reference && p.reference !== "—" ? ` — ${p.reference}` : ""} · ${p.system}</li>`).join("") + `</ul>`;
        }
        // Códigos de causa (global) — si la query parece un código o contiene palabras de causa
        if (typeof window.searchCausa === "function") {
          const causaHits = window.searchCausa(query).slice(0, 5);
          if (causaHits.length) {
            html += `<div class="diag-symptoms">🏷️ Códigos de causa cercanos:</div><ul>` +
              causaHits.map(c => `<li><strong>${c.code}</strong> — ${c.desc}${c.categoria ? ` <span style="color:var(--muted)">(${c.categoria})</span>` : ""}</li>`).join("") + `</ul>`;
          }
          // Si el equipo tiene causaCod asignado, mostrarlo siempre que haya un hit o si la query menciona "causa"
          const qn = normalize(query);
          if (machine?.causaCod && (qn.includes("causa") || qn.includes(machine.causaCod.toLowerCase()) || causaHits.some(c => c.code === machine.causaCod))) {
            const mc = window.getCausaByCode ? window.getCausaByCode(machine.causaCod) : null;
            if (mc) html += `<div class="diag-symptoms">🔖 Código causa de este equipo:</div><ul><li><strong>${mc.code}</strong> — ${mc.desc} <span style="color:var(--muted)">(${mc.categoria})</span> — ver <code>manuales/_codigos-causa/</code></li></ul>`;
            else html += `<div class="diag-symptoms">🔖 Código causa de este equipo:</div><ul><li><strong>${machine.causaCod}</strong> — ${machine.causaDesc || ""}</li></ul>`;
          }
        }
        return html;
      }

      function buildMachineContext(machine) {
        const specs = machine.technicalData
          ? Object.entries(machine.technicalData).map(([k,v]) => `${k}: ${v}`).join("\n")
          : "";
        const failures = (machine.failureModes ?? []).map(f =>
          `• ${f.name} (${f.probableSystem}): síntomas: ${[].concat(f.symptoms).join(", ")}. Verificar: ${[].concat(f.checks).join(", ")}. Corrección: ${f.correction ?? "ver manual"}`
        ).join("\n");
        const tasks = (machine.maintenanceTasks ?? []).map(t =>
          `• ${t.name} — ${t.frequency} — ${t.acceptance}`
        ).join("\n");
        const guideIndex = buildGuideSearchIndex(machine);
        const guideContext = guideIndex.map(s => {
          const pagesNote = s.pages.length ? ` [manual pág. ${s.pages.join(", ")}]` : "";
          return `[${s.groupTitle} › ${s.sectionTitle}${pagesNote}]\n${s.plainText.slice(0, 600)}`;
        }).join("\n\n");
        return `=== ${machine.name} (${machine.model}) ===\n\nEspecificaciones:\n${specs}\n\nFallas conocidas:\n${failures}\n\nMantenimiento:\n${tasks}\n\nGuía técnica:\n${guideContext}`;
      }

      async function callAnthropicAI(userMessage, machine) {
        const apiKey = localStorage.getItem(ASSISTANT_API_KEY);
        if (!apiKey) return null;
        const systemPrompt = `Eres un técnico especialista en mantenimiento industrial. Respondes en español con precisión técnica absoluta. Tu respuesta debe permitir que cualquier persona — incluso sin experiencia previa — pueda resolver el problema paso a paso sin tener que consultar el manual.

REGLAS OBLIGATORIAS:
1. Responde SIEMPRE con pasos numerados (no bullets, no párrafos genéricos).
2. Cada paso debe incluir: (a) dónde exactamente localizar el componente, (b) cómo realizar la verificación o acción, (c) el valor o estado esperado con unidades exactas, (d) qué herramienta usar, (e) qué hacer si el valor está fuera de rango.
3. PROHIBIDO usar lenguaje vago: jamás escribas "verificar que esté bien", "comprobar el sistema", "revisar el componente". En su lugar: "mide con calibrador vernier la holgura entre X y Y — debe estar entre 1.8 y 2.5 mm".
4. Si el contexto técnico incluye páginas del manual, cítalas: "ver pág. 45".
5. Si el tema está en la guía técnica, menciona la sección: [Grupo › Sección].
6. Termina con una línea "Si el problema persiste:" con el siguiente paso de escalación.

CONTEXTO TÉCNICO DEL EQUIPO:
${buildMachineContext(machine)}`;
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
              "anthropic-dangerous-allow-browser": "true"
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 1100,
              system: systemPrompt,
              messages: [{ role: "user", content: userMessage }]
            })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return `Error de IA: ${err.error?.message ?? `HTTP ${res.status}`}. Revisa la API key en ⚙.`;
          }
          const data = await res.json();
          return data.content?.[0]?.text ?? null;
        } catch (e) {
          return `No se pudo conectar con la IA: ${e.message}`;
        }
      }

      function ruleResponseHtml(f, machine) {
        const symptoms = [].concat(f.symptoms).join(" · ");
        const stepsHtml = (f.steps ?? []).map((s, i) => {
          const specLine = s.spec ? `<div class="diag-step-spec">📏 <strong>Especificación:</strong> ${s.spec}</div>` : "";
          const toolLine = s.tool ? `<div class="diag-step-tool">🔧 <strong>Herramienta:</strong> ${s.tool}</div>` : "";
          const failLine = s.ifFail ? `<div class="diag-step-fail">⚠️ <strong>Si está fuera de rango:</strong> ${s.ifFail}</div>` : "";
          const fig = machine ? getStepFigure(machine, f.name, s.title) : null;
          const imgHtml = fig
            ? `<div class="diag-step-img" data-lightbox-src="${fig.src}" data-lightbox-caption="Manual pág. ${fig.page} · ${fig.title}">
                <img src="${fig.src}" alt="${fig.alt}" loading="lazy" onerror="this.closest('.diag-step-img').hidden=true">
                <span class="diag-step-img-caption">📷 Manual pág. ${fig.page} · ${fig.title}</span>
               </div>`
            : "";
          return `<li class="diag-step">
            <div class="diag-step-num">${i + 1}</div>
            <div class="diag-step-body">
              <div class="diag-step-title">${s.title}</div>
              ${s.where ? `<div class="diag-step-where">📍 ${s.where}</div>` : ""}
              <div class="diag-step-how">${s.how}</div>
              ${specLine}${toolLine}${failLine}${imgHtml}
            </div>
          </li>`;
        }).join("");
        const fallbackChecks = (f.steps ?? []).length === 0
          ? `<strong>Qué verificar:</strong><ul>${[].concat(f.checks).map(c => `<li>${c}</li>`).join("")}</ul>${f.correction ? `<strong>Corrección:</strong> ${f.correction}` : ""}`
          : "";
        return `<div class="diag-header"><strong>${f.name}</strong><span class="diag-system-tag">${f.probableSystem}</span></div>
          <div class="diag-symptoms">Síntomas: ${symptoms}</div>
          ${stepsHtml ? `<ol class="diag-steps">${stepsHtml}</ol>` : fallbackChecks}`;
      }

      function formatAiResponse(text) {
        // Inline markup
        let t = text
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>");
        // Split into lines, group into numbered list blocks and paragraphs
        const lines = t.split("\n");
        const output = [];
        let inOl = false, inUl = false;
        const closeList = () => {
          if (inOl) { output.push("</ol>"); inOl = false; }
          if (inUl) { output.push("</ul>"); inUl = false; }
        };
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) { closeList(); continue; }
          const olMatch = line.match(/^(\d+)\.\s+([\s\S]+)/);
          const ulMatch = line.match(/^[-•]\s+([\s\S]+)/);
          if (olMatch) {
            if (!inOl) { closeList(); output.push('<ol class="ai-steps">'); inOl = true; }
            output.push(`<li>${olMatch[2]}</li>`);
          } else if (ulMatch) {
            if (!inUl) { closeList(); output.push('<ul class="ai-list">'); inUl = true; }
            output.push(`<li>${ulMatch[1]}</li>`);
          } else {
            closeList();
            const isLabel = /^(Si el problema persiste|Nota:|Advertencia:|Precaución:)/i.test(line);
            output.push(isLabel ? `<p class="ai-escalation">${line}</p>` : `<p>${line}</p>`);
          }
        }
        closeList();
        return output.join("");
      }

      function buildGuideSearchIndex(machine) {
        const groups = GUIDE_GROUPS[machine.id];
        if (!groups) return [];
        const edits = loadMachineEdits();
        const sectionMap = Object.fromEntries((machine.guideSections ?? []).map(s => [s.id, s]));
        const index = [];
        for (const group of groups) {
          for (const id of group.ids) {
            const section = sectionMap[id];
            if (!section) continue;
            const rawContent = edits[machine.id]?.[section.id] ?? section.content ?? "";
            const plainText = rawContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            const pageRegex = /p[aá]g(?:ina)?\.?\s*(\d+(?:[-–]\d+)?)/gi;
            const pages = [];
            let pm;
            while ((pm = pageRegex.exec(plainText)) !== null) pages.push(pm[1]);
            index.push({
              sectionId: section.id,
              groupTitle: group.title,
              sectionTitle: section.title,
              text: normalize(plainText + " " + section.title + " " + group.title),
              pages: [...new Set(pages)],
              plainText
            });
          }
        }
        return index;
      }

      function findRelevantGuideSections(query, machine) {
        const index = buildGuideSearchIndex(machine);
        if (!index.length) return [];
        const words = normalize(query).split(/\s+/).filter(w => w.length > 2);
        if (!words.length) return [];
        const scored = index
          .map(entry => ({ ...entry, score: words.filter(w => entry.text.includes(w)).length / words.length }))
          .filter(e => e.score > 0);
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 3);
      }

      function renderGuideLinkChips(sections, machineId) {
        if (!sections.length) return "";
        const chips = sections.map(s => {
          const pagesLabel = s.pages.length ? ` · pág. ${s.pages.slice(0,2).join(", ")}` : "";
          return `<button class="guide-ref-chip" type="button" data-guide-nav="${machineId}::${s.sectionId}" title="${s.groupTitle} — ${s.sectionTitle}">${s.sectionTitle}${pagesLabel}</button>`;
        }).join("");
        return `<div class="assistant-guide-refs"><span class="guide-ref-label">📖 En la guía:</span>${chips}</div>`;
      }

      function navigateToGuideSection(machineId, sectionId) {
        const needsOpen = selectedId !== machineId;
        if (needsOpen) openDetail(machineId);
        const doScroll = () => {
          const docTab = guideTabs.querySelector('[data-profile-tab="documents"]') || guideTabs.querySelector('[data-profile-tab="summary"]');
          if (docTab && !docTab.classList.contains("is-active")) docTab.click();
        };
        if (needsOpen) setTimeout(doScroll, 180); else doScroll();
      }

      assistantMessages.addEventListener("click", e => {
        const chip = e.target.closest("[data-guide-nav]");
        if (!chip) return;
        const [navMachineId, sectionId] = chip.dataset.guideNav.split("::");
        navigateToGuideSection(navMachineId, sectionId);
      });

      async function sendAssistantMessage() {
        const query = assistantInput.value.trim();
        if (!query) return;
        assistantInput.value = "";

        assistantMessages.insertAdjacentHTML("beforeend", `<div class="msg-user">${query}</div>`);
        assistantMessages.insertAdjacentHTML("beforeend", `<div class="msg-typing" id="aTyping"><span></span><span></span><span></span></div>`);
        assistantMessages.scrollTop = assistantMessages.scrollHeight;

        let responseHtml = "";
        const ruleMatch = matchRuleResponse(query, assistantMachine);

        if (ruleMatch) {
          responseHtml = ruleResponseHtml(ruleMatch, assistantMachine);
          const apiKey = localStorage.getItem(ASSISTANT_API_KEY);
          if (apiKey && assistantMachine) {
            const aiText = await callAnthropicAI(query, assistantMachine);
            if (aiText) responseHtml = formatAiResponse(aiText);
          }
        } else if (assistantMachine) {
          const apiKey = localStorage.getItem(ASSISTANT_API_KEY);
          if (apiKey) {
            const aiText = await callAnthropicAI(query, assistantMachine);
            responseHtml = aiText
              ? formatAiResponse(aiText)
              : `<p>La IA no devolvió respuesta. Intenta de nuevo o describe el síntoma con más detalle.</p>`;
          } else {
            const offline = offlineKnowledge(query, assistantMachine);
            const guideRefs = findRelevantGuideSections(query, assistantMachine);
            if (offline) {
              responseHtml = `<p>Esto encontré en la ficha del equipo (sin IA):</p>${offline}<p style="color:var(--muted);font-size:0.85rem">Para un diagnóstico paso a paso por IA, configura tu API key en ⚙ (usa claude-haiku).</p>`;
            } else if (guideRefs.length) {
              responseHtml = `<p>No tengo una respuesta directa para eso, pero estas secciones de la guía pueden ayudarte 👇</p>`;
            } else {
              responseHtml = `<p>No encontré información sobre eso en la ficha. Prueba describiendo el síntoma, el sistema (vacío, dosificación, cierre…) o el repuesto. Para respuestas paso a paso por IA, configura tu API key en ⚙.</p>`;
            }
          }
        } else {
          responseHtml = "<p>Selecciona un equipo en el menú de arriba para que pueda ayudarte con diagnósticos específicos.</p>";
        }

        // Append guide section chips if the machine has a guide index
        if (assistantMachine) {
          const guideRefs = findRelevantGuideSections(query, assistantMachine);
          responseHtml += renderGuideLinkChips(guideRefs, assistantMachine.id);
        }

        document.getElementById("aTyping")?.remove();
        assistantMessages.insertAdjacentHTML("beforeend", `<div class="msg-assistant">${responseHtml}</div>`);
        assistantMessages.scrollTop = assistantMessages.scrollHeight;
      }

      // ── Image lightbox ────────────────────────────────────────────────────────
      const imgLightbox = document.getElementById("imgLightbox");
      const lightboxImg = document.getElementById("lightboxImg");
      const lightboxCaption = document.getElementById("lightboxCaption");
      function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption ?? "";
        imgLightbox.hidden = false;
        document.body.style.overflow = "hidden";
      }
      function closeLightbox() {
        imgLightbox.hidden = true;
        document.body.style.overflow = "";
        lightboxImg.src = "";
      }
      document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
      document.getElementById("lightboxBackdrop").addEventListener("click", closeLightbox);
      document.addEventListener("keydown", e => { if (e.key === "Escape" && !imgLightbox.hidden) closeLightbox(); });
      // Delegate clicks on thumbnails in the assistant messages
      assistantMessages.addEventListener("click", e => {
        const thumb = e.target.closest("[data-lightbox-src]");
        if (thumb) openLightbox(thumb.dataset.lightboxSrc, thumb.dataset.lightboxCaption);
      });

      // El botón del menú abre y cierra. Antes solo abría, así que volver a
      // pulsarlo no escondía el panel.
      document.getElementById("navAssistant")?.addEventListener("click", () => {
        if (assistantPanel.classList.contains("is-open")) closeAssistant();
        else openAssistant();
      });
      document.getElementById("closeAssistantBtn").addEventListener("click", closeAssistant);
      document.getElementById("assistantSendBtn").addEventListener("click", sendAssistantMessage);
      assistantInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); sendAssistantMessage(); } });
      document.getElementById("assistantSettingsBtn").addEventListener("click", () => {
        assistantApiSection.classList.toggle("visible");
      });
      document.getElementById("assistantSaveApiBtn").addEventListener("click", () => {
        const val = assistantApiKeyInput.value.trim();
        if (val && !val.startsWith("•")) {
          localStorage.setItem(ASSISTANT_API_KEY, val);
          assistantApiKeyInput.value = "••••••••••••••";
          assistantApiSection.classList.remove("visible");
          assistantMessages.insertAdjacentHTML("beforeend", `<div class="msg-assistant">✓ API key guardada. Ahora puedo responder preguntas libres usando IA.</div>`);
        }
      });

      // ── State restore ─────────────────────────────────────────────────────────
      const restoredState = loadUiState();
      if (typeof restoredState.currentQuery === "string") {
        currentQuery = restoredState.currentQuery;
      }
      if (typeof restoredState.selectedId === "string") {
        selectedId = restoredState.selectedId;
      }
      homeSearch.value = currentQuery;
      resultsSearch.value = currentQuery;

      // Enlace directo a una vista: index.html?v=hoy | pendientes | registro | plan…
      // Lo usan tareas.html, turnos.html, el formulario de turno y los enlaces
      // que manda el bot de Telegram. shell.js sabe abrir cada vista por su nombre.
      const pedido = new URLSearchParams(window.location.search);
      const vistaPedida = pedido.get("v");
      const ultima = restoredState.activeView;

      if (vistaPedida && window.SHELL && window.SHELL.puedeAbrir(vistaPedida, pedido)) {
        window.SHELL.abrirDesdeUrl(pedido);
      } else if (ultima === "detail" && selectedId && machines.some((machine) => machine.id === selectedId)) {
        openDetail(selectedId);
      } else if (ultima === "results" && currentQuery) {
        goResults({ keepSelection: true });
      } else if (ultima && window.SHELL && window.SHELL.puedeAbrir(ultima)) {
        window.SHELL.ir(ultima, { reemplazar: true });
      } else if (window.SHELL) {
        // Sin estado previo se abre el Inicio: así va el día en planta.
        window.SHELL.ir("hoy", { reemplazar: true });
      } else {
        goHome();
      }

      renderHome();

      // ── Panel de inicio ─────────────────────────────────────────────────────
      // La portada sigue siendo el buscador, pero debajo enseña de un vistazo
      // cómo va el registro: cuántos equipos hay, cuáles tienen ficha completa y
      // cuáles solo la básica, qué falta por documentar y qué trabajo está
      // abierto ahora mismo. Todo lleva a algún sitio: nada es decorativo.

      function homeResumen() {
        const total = machines.length;
        const completas = machines.filter((m) => !m.fromRegistry);
        const conManual = machines.filter((m) => (m.documents ?? []).some((d) => d.file));
        const conPlan = PLAN_EQUIPOS.filter((e) => e.r.length);
        const lineas = conPlan.reduce((n, e) => n + e.r.length, 0);
        const retrasados = conPlan.reduce((n, e) => n + e.r.filter((r) => (r.xls || {}).st === "RETRASADO").length, 0);
        const sinStock = conPlan.reduce((n, e) => n + e.r.filter((r) => {
          const v = datosRep[datoClave(e, r)];
          return Number(v && v.exist !== undefined ? v.exist : r.e) === 0;
        }).length, 0);
        const sinCodigo = conPlan.reduce((n, e) => n + e.r.filter((r) => !repCodigo(e, r)).length, 0);
        const tareasAbiertas = tasks.filter((t) => (t.status || "pendiente") !== "hecha").length;
        const inspAbiertas = inspecciones.filter((i) => (i.estado || "abierta") !== "cerrada").length;
        const piezasMarcadas = inspecciones
          .filter((i) => (i.estado || "abierta") !== "cerrada")
          .reduce((n, i) => n + (i.piezas || []).length, 0);
        const cambiosReg = cambiosEventos().length;
        return { total, completas, conManual, conPlan, lineas, retrasados, sinStock, sinCodigo, tareasAbiertas, inspAbiertas, piezasMarcadas, cambiosReg };
      }

      // Qué tiene cada ficha completa, para que se vea de un golpe qué le falta.
      function homeFichaTiene(m) {
        return [
          { k: "Manual", ok: (m.documents ?? []).some((d) => d.file) },
          { k: "Sistemas", ok: !!(m.systemAtlas || (m.systems ?? []).length) },
          { k: "Repuestos", ok: !!(m.spareParts ?? []).length || !!(equipoDeMachine(m)?.r.length) },
          { k: "Mantenimiento", ok: !!(m.maintenanceTasks ?? []).length },
          { k: "Fallas", ok: !!(m.failureModes ?? []).length || !!m.alarms },
          { k: "Despiece", ok: !!(typeof MACHINE_PARTS !== "undefined" && MACHINE_PARTS[m.id]) || !!(typeof MACHINE_TABLES !== "undefined" && MACHINE_TABLES[m.id]) },
          { k: "Plano", ok: !!m.schematic }
        ];
      }

      function homeKpi(n, label, hint, clase, accion, ico) {
        return `<button class="ux-kpi ${clase || ""}" type="button" onclick="${accion || "goResults()"}" title="${planEsc(hint)}">
          <span class="ux-kpi__top"><span class="ux-kpi__label"><span class="ux-kpi__ico">${window.IC ? IC(ico || "equipos") : ""}</span>${label}</span><span class="ux-kpi__go">${window.IC ? IC("flecha", "ic--sm") : ""}</span></span>
          <span class="ux-kpi__n" data-n="${n}">${Number(n).toLocaleString("es-CO")}</span>
          <span class="ux-kpi__foot">${planEsc(hint)}</span>
        </button>`;
      }

      // Portada de Fichas de equipos: cuánto está documentado, qué equipos ya
      // tienen ficha completa y cuáles conviene documentar primero. El trabajo
      // abierto del día (tareas, inspecciones) vive ahora en el Inicio.
      function renderHome() {
        const root = document.getElementById("homeDash");
        if (!root) return;
        const s = homeResumen();
        const basicas = s.total - s.completas.length;
        const ic = (n, c) => (window.IC ? IC(n, c) : "");

        const porDocumentar = s.conPlan
          .filter((e) => !machines.some((m) => m.id === e.id && !m.fromRegistry))
          .sort((a, b) => b.r.length - a.r.length)
          .slice(0, 8);
        const maxRep = Math.max(1, ...porDocumentar.map((e) => e.r.length));

        const mini = (n, label, accion, tono) => `<button class="eq-stat" type="button" onclick="${accion}"><b class="${tono || ""}">${Number(n).toLocaleString("es-CO")}</b><span>${label}</span></button>`;

        root.innerHTML = `
          <div class="ux-page ux-seq">
            <div class="ux-grid ux-grid--4 ux-grid--kpi">
              ${homeKpi(s.total, "Equipos en el registro", "Sede 4 y Planta 2 según los listados oficiales", "", "goResults()", "equipos")}
              ${homeKpi(s.completas.length, "Con ficha completa", "Manual leído, sistemas, repuestos, mantenimiento y fallas", "ux-kpi--ok", "goResults()", "check")}
              ${homeKpi(s.conPlan.length, "Con plan de repuestos", `${s.lineas.toLocaleString("es-CO")} líneas en el Excel de mantenimiento`, "ux-kpi--acc", "goPlan()", "plan")}
              ${homeKpi(s.sinStock, "Repuestos sin existencia", "Sin unidades en almacén según el plan o lo corregido a mano", "ux-kpi--bad", "planSetFilter('sinStock', true); goPlan();", "repuesto")}
            </div>

            <div class="eq-stats">
              ${mini(basicas, "solo con ficha básica", "goResults()", "")}
              ${mini(s.conManual.length, "con manual descargable", "goResults()", "")}
              ${mini(s.sinCodigo, "repuestos sin código interno", "goPlan()", "is-warn")}
              ${mini(s.retrasados, "retrasados según el Excel", "goPlan()", "is-bad")}
              ${mini(s.cambiosReg, "cambios de repuesto registrados", "goPlan()", "")}
            </div>

            <div class="ux-grid ux-grid--main">
              <section class="ux-card">
                <div class="ux-card__head">
                  <div><h2 class="ux-card__title">Equipos con ficha completa <small>${s.completas.length} de ${s.total}</small></h2>
                  <p class="ux-card__sub">Tienen el manual leído y la guía cargada: sistemas, repuestos, fallas y mantenimiento.</p></div>
                </div>
                <div class="eq-grid">
                  ${s.completas.map((m) => {
                    const tiene = homeFichaTiene(m);
                    const hechos = tiene.filter((t) => t.ok).length;
                    return `<button class="eq-card" type="button" onclick="openDetail('${planEsc(m.id)}')">
                      <span class="eq-card__img">${m.image ? `<img src="${planEsc(m.image)}" alt="" loading="lazy">` : ic("equipos", "ic--lg")}</span>
                      <span class="eq-card__body">
                        <span class="eq-card__n">${planEsc(m.model || m.name)}</span>
                        <span class="eq-card__s">${planEsc(m.name)}</span>
                        <span class="eq-card__tags">${tiene.map((t) => `<i class="${t.ok ? "is-ok" : ""}" title="${t.k}${t.ok ? "" : ": falta"}">${t.k}</i>`).join("")}</span>
                        <span class="ux-progress"><i style="width:${Math.round((hechos / tiene.length) * 100)}%"></i></span>
                      </span>
                    </button>`;
                  }).join("")}
                </div>
              </section>

              <section class="ux-card">
                <div class="ux-card__head">
                  <div><h2 class="ux-card__title">Qué documentar primero</h2>
                  <p class="ux-card__sub">Ya piden repuestos en el plan pero no tienen manual ni guía. Ordenados por cuántos repuestos mueven.</p></div>
                </div>
                ${porDocumentar.length ? `<div class="ux-hbars">
                  ${porDocumentar.map((e) => `<button class="ux-hbar" type="button" onclick="openDetail('${planEsc(e.id)}')" title="Código ${planEsc(e.c)}${e.u ? " · " + planEsc(e.u) : ""}">
                    <span class="ux-hbar__t">${planEsc(e.n)}</span>
                    <span class="ux-hbar__v">${e.r.length} <small>repuestos</small></span>
                    <span class="ux-progress"><i style="width:${Math.max(4, Math.round((e.r.length / maxRep) * 100))}%"></i></span>
                  </button>`).join("")}
                </div>` : '<div class="ux-empty"><h4>Todo documentado</h4><p>Todos los equipos con plan ya tienen ficha.</p></div>'}
              </section>
            </div>
          </div>`;
        if (window.SHELL) SHELL.animarNumeros(root);
      }
