// ============================================================================
//  CAMBIOS DE PIEZAS POR EQUIPO
// ============================================================================
//  Ordena los cambios de repuestos de cada máquina: qué pieza se cambió, cuándo,
//  y cuándo toca otra vez. Se arma con tres fuentes, sin escribir nada a mano:
//
//    1. Los reportes de turno y el Registro diario: cada novedad que dice «se
//       cambia…», «cambio de…», «se reemplaza…» y nombra una pieza.
//    2. Los cambios que se anotan en la ficha del equipo (colección "cambios",
//       con el botón Registrar del plan de repuestos).
//    3. El plan de mantenimiento del Excel: la fecha de la última ejecución y la
//       frecuencia de cada pieza (sirve de punto de partida mientras no haya un
//       cambio real anotado).
//
//  Una pieza es una «familia» (arandelas, rodamientos, resortes…) dentro de un
//  equipo. «Próximo cambio» = último cambio + lo que ha durado la pieza:
//    - con dos o más cambios reales: el promedio entre ellos;
//    - con uno solo: la frecuencia del plan para esa pieza, si la hay;
//    - sin ninguno: la fecha del Excel + su frecuencia.
//  Dos cambios de la misma pieza con menos de cinco días de diferencia cuentan
//  como uno (casi siempre es el mismo arreglo contado por dos turnos).
// ============================================================================

(function () {
  const N = window.NUCLEO;
  const esc = N ? N.esc : (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ic = (n, c) => (window.IC ? window.IC(n, c) : "");

  const plano = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // [nombre, expresión sobre el texto sin tildes]
  const FAMILIAS = [
    ["Arandelas cóncavas", /\barandelas? concavas?\b/],
    ["Arandelas", /\barandelas?\b(?! concav)/],
    ["Rodamientos", /\brodamientos?\b|\brulimanes\b|\brulimán\b|\bbaleros?\b/],
    ["Correas", /\bcorreas?\b/],
    ["Resortes", /\bresortes?\b|\bmuelles?\b/],
    ["Racores y mangueras", /\bracor(es)?\b|\bmangueras?\b|\bneplos?\b|\bunion(es)? neumatic/],
    ["Reflector / palpador", /\breflector(es)?\b|\breflectivos?\b|\bpalpador(es)?\b/],
    ["Sensores y fotoceldas", /\bsensor(es)?\b|\bfotoceldas?\b|\bfoto ?celda\b|\bfinales? de carrera\b|\bdetector(es)?\b/],
    ["Válvulas y electroválvulas", /\belectrovalvulas?\b|\bvalvulas?\b|\bsolenoides?\b/],
    ["O-rings, sellos y juntas", /\bo[- ]?rings?\b|\boring\b|\bsellos? mecanic\w*\b|\bempaques?\b|\bjuntas?\b|\bretenedor(es)?\b|\bretenes?\b|\bsellos?\b/],
    ["Rodillos", /\brodillos?\b|\bpolea(s)?\b/],
    ["Ejes y levas", /\bejes?\b|\bleva(s)?\b|\bseguidor(es)? de leva\b|\bbujes?\b|\bbujes\b|\bcasquillos?\b/],
    ["Tornillería y espárragos", /\bporta ?herramientas?\b|\bprisioneros?\b|\besparragos?\b|\btornillos?\b|\bpernos?\b|\bchavetas?\b|\btuercas?\b/],
    ["Bandas, lonas y cadenas", /\bbandas?\b|\blonas?\b|\bcadenas?\b|\bpinones?\b|\bpiñones?\b|\bcremalleras?\b|\bcorona\b/],
    ["Cuchillas y troqueles", /\bcuchillas?\b|\btroquel(es)?\b|\bpunzon(es)?\b|\bmatrices?\b|\bagujas?\b/],
    ["Resistencias y calefacción", /\bresistencias?\b|\btermocuplas?\b|\bcartuchos?\b|\bpt100\b|\bplacas? calentadoras?\b/],
    ["Eléctrico (switch, contactor, cable)", /\bswitch\b|\bswich\b|\bseccionador(es)?\b|\bcontactor(es)?\b|\bbreaker\b|\bguardamotor\b|\bguarda motor\b|\brele(s)?\b|\bfusibles?\b|\bbornera\b|\bcables?\b|\bclavijas?\b|\bpulsador(es)?\b|\bvariador(es)?\b|\btarjeta\b|\bfuente\b/],
    ["Motores y bombas", /\bmotor(es)?\b|\bmotorreductor(es)?\b|\breductor(es)?\b|\bbombas?\b|\bimpulsor(es)?\b|\bturbina\b/],
    ["Filtros", /\bfiltros?\b|\bmalla(s)?\b|\btamiz(es)?\b|\bcartucho de filtro\b/],
    ["Cilindros y neumática", /\bcilindros?\b|\bvastagos?\b|\bamortiguadores?\b|\bventosas?\b|\bbomba de vacio\b/],
    ["Codificado / etiquetas", /\bcodificador(a|as)?\b|\bcinta (de )?transferencia\b|\bcabezal de impresion\b|\bribbon\b/],
    ["Discos y formatos", /\bdiscos?\b|\bformatos?\b|\bbloques?\b|\bboquillas?\b|\bdosificador(es)?\b/],
  ];

  // Lo que se cambia de rutina y no es una pieza de la máquina
  const NO_PIEZA = /\bpvc\b|\bfoil\b|\baluminio\b|\blaminad[oa]s?\b|\blote\b|\bturno\b|\bproducto\b|\bparametros?\b|\bformato de\b|\bcambio de formato\b|\bde formato\b|\bpelicula\b|\bbobina de\b|\betiquetas?\b(?! de)|\buniforme\b|\bcambio de (lote|producto|turno|estuche|formato)\b/;
  const VERBO = /\b(se\s+cambi(?:a|an|o|aron|ó)|cambi(?:o|os)\s+de|se\s+reemplaz(?:a|an|o|aron|ó)|reemplazo\s+de|se\s+sustituy(?:e|en|o|eron)|se\s+coloc(?:a|an|o|aron|ó)\s+(?:nuev\w+|repuesto\w*)|se\s+instal(?:a|an|o|aron|ó)\s+(?:nuev\w+|repuesto\w*)|se\s+reponen?|se\s+repone|cambiaron|cambiamos|se\s+cambian)\b/;

  // Un mismo mensaje puede decir varios cambios: se parte por oraciones y por «y se …»
  function clausulas(texto) {
    return String(texto || "")
      .replace(/\s+/g, " ")
      .split(/(?<=[.;])\s+|\s*\|\s*|\s+(?=se\s+(?:cambi|reemplaz|coloc|instal))/i)
      .map((c) => c.trim())
      .filter(Boolean);
  }

  // Máquinas nombradas dentro de un texto: si una frase habla de otra máquina, no es de ésta
  const MAQUINAS = /\b(blister ?\d?|uhlmann|huttlin|fette|bosch|njp ?\d?|marzio ?\d?|integra|rimek|schmucker|colimatic|ms ?235|cb ?550|mb ?4\d\d|r ?[24]00|mt ?1100|pilot ?lab|estuchadora|envasadora|centro liquidos|cl ?\d|gb ?100|bin|bombo)\b/g;
  const fichaMaq = (t) => new Set((plano(t).match(MAQUINAS) || []).map((x) => x.replace(/\s+/g, "")));
  const PARA = /\s+(?:y\s+)?(?:se\s+)?(?:calibr|ajust|limpi|lubric|prueb|arm|mont|deja|entreg|quit|retir|revis|alin|posicion|conect|regul|verific|dej|encuentr|realiz|desmont|ubic|cuadr|apret|queda|quedo|queda|por que|porque|debido|ya que|por fuga|por desgaste|en mal estado|se encontr)/;

  // [{ familia, detalle }] para un texto del registro. "eq" es la máquina del registro:
  // una frase que nombra otra máquina se salta.
  function cambiosEn(texto, eq) {
    const out = [];
    const propias = fichaMaq(eq || "");
    clausulas(texto).forEach((cl) => {
      const t = plano(cl);
      const m = VERBO.exec(t);
      if (!m) return;
      const nombradas = fichaMaq(cl);
      if (propias.size && nombradas.size && ![...nombradas].some((x) => propias.has(x) || [...propias].some((y) => x.startsWith(y) || y.startsWith(x)))) return;
      // «cambio de formato», «se cambia pvc»: no son piezas
      const lista = t.slice(m.index + m[0].length, m.index + m[0].length + 90);
      if (/^\s*(de\s+)?(formato|lote|producto|turno|parametros?)\b/.test(lista)) return;
      // El objeto llega hasta la próxima acción («… y se calibra»)
      const objeto = lista.split(PARA)[0];
      const hallados = [];
      FAMILIAS.forEach(([nombre, re]) => {
        const r = re.exec(objeto);
        if (r && !(NO_PIEZA.test(objeto) && !re.test(objeto.replace(NO_PIEZA, "")))) hallados.push({ nombre, i: r.index, fin: r.index + r[0].length });
      });
      hallados.sort((x, y) => x.i - y.i);
      // La pieza principal va primero; las demás solo si forman una lista («cajas, guardamotor y clavija»)
      hallados.forEach((h, k) => {
        if (k > 0) { const entre = objeto.slice(hallados[0].fin, h.i); if (h.i - hallados[0].i > 60 || !/,| y | e /.test(entre)) return; }
        out.push({ familia: h.nombre, detalle: cl.replace(/\s*[.;]+$/, "") });
      });
    });
    // Una pieza una vez por mensaje
    const vistos = new Set();
    return out.filter((c) => (vistos.has(c.familia) ? false : vistos.add(c.familia)));
  }

  // "9M", "1A", "2B": cada 9 meses, cada año, cada dos años (como el Excel)
  function freqDias(f) {
    const m = /^(\d+(?:[.,]\d+)?)\s*([AMB])$/i.exec(String(f || "").trim());
    if (!m) return 0;
    const n = Number(m[1].replace(",", "."));
    const u = m[2].toUpperCase();
    return Math.round(u === "M" ? n * 30.44 : u === "B" ? n * 730.5 : n * 365.25);
  }
  const familiaDe = (d) => { const t = plano(d); const f = FAMILIAS.find(([, re]) => re.test(t)); return f ? f[0] : ""; };
  const nombrePieza = (d) => { const w = String(d || "").toLowerCase().replace(/\s+/g, " ").trim().split(" ").slice(0, 3).join(" "); return w ? w.charAt(0).toUpperCase() + w.slice(1) : ""; };
  const dif = (a, b) => Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 864e5);
  const suma = (f, d) => new Date(new Date(f + "T12:00:00Z").getTime() + d * 864e5).toISOString().slice(0, 10);

  const corto = (t) => { const x = String(t || "").replace(/\s+/g, " ").trim(); return x.length > 150 ? x.slice(0, 147).replace(/\s+\S*$/, "") + "…" : x; };
  function fmtDias(d) {
    if (!isFinite(d)) return "";
    if (d < 45) return `${d} días`;
    const m = Math.round(d / 30.44);
    return m < 24 ? `${m} meses` : `${String(Math.round((d / 365.25) * 10) / 10).replace(".", ",")} años`;
  }
  const fechaTxt = (f) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f || "");
    return m ? `${Number(m[3])} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][Number(m[2]) - 1]} ${m[1]}` : "—";
  };
  const haceTxt = (f, hoy) => {
    const d = dif(f, hoy);
    if (d <= 0) return "hoy";
    if (d === 1) return "ayer";
    return d < 60 ? `hace ${d} días` : `hace ${fmtDias(d)}`;
  };

  // ------------------------------------------------------------ cálculo
  // Nombres con que el Registro diario llama a una máquina (por el id de su ficha)
  function nombresDe(m) {
    const cat = (window.MTTO && window.MTTO.catalogo && window.MTTO.catalogo.equipos) || [];
    const porFicha = cat.filter((e) => e.fi === m.id);
    const lista = porFicha.length ? porFicha : cat.filter((e) => plano(e.eq).replace(/\W/g, "") === plano(m.model || m.name).replace(/\W/g, ""));
    return new Set(lista.map((e) => e.eq));
  }

  function planDe(eqCod) {
    const P = (window.EQUIPOS_PLAN && window.EQUIPOS_PLAN.equipos) || [];
    return P.find((e) => e.c === eqCod) || null;
  }

  // Todo lo que se sabe de un equipo → [{ familia, eventos[], ... }]
  // m: la máquina de la ficha; eqCod: su código interno del plan
  function piezasDe(m, eqCod) {
    const hoy = N ? N.hoy() : new Date().toISOString().slice(0, 10);
    const nombres = nombresDe(m);
    const filas = new Map();
    const fila = (fam) => { if (!filas.has(fam)) filas.set(fam, { familia: fam, eventos: [], plan: [] }); return filas.get(fam); };

    // 1. Reportes de turno y Registro diario
    const S = window.MTTO_STORE;
    (S ? S.registros() : []).forEach((r) => {
      if (!r || r.borrado || !nombres.has(r.eq)) return;
      cambiosEn(r.de, r.eq).forEach((c) => fila(c.familia).eventos.push({ fecha: r.f, fuente: "reporte", detalle: c.detalle, quien: r.tec || r.por || "", id: r.id }));
    });

    // 2. Cambios anotados en la ficha (colección "cambios")
    // Los anotados en la ficha y los del registro del repositorio (componentes-registro.js)
    const registrados = typeof cambiosEventos === "function" ? cambiosEventos() : (typeof cambios !== "undefined" ? cambios : []);
    const plan = eqCod ? planDe(eqCod) : null;
    registrados.filter((c) => c && c.eq === eqCod && c.cod && !c.marca).forEach((c) => {
      const row = plan && plan.r.find((r) => r.cod === c.cod);
      const dsc = c.d || (row && row.d) || "";
      const fam = familiaDe(dsc) || nombrePieza(dsc) || "Otras piezas";
      fila(fam).eventos.push({ fecha: c.fecha, fuente: "anotado", detalle: `${c.d || c.cod}${c.q ? ` × ${c.q}` : ""}${c.nota ? " · " + c.nota : ""}`, quien: c.quien || "", cod: c.cod });
    });

    // 3. Plan del Excel: última ejecución y frecuencia de cada pieza
    if (plan) plan.r.forEach((r) => {
      if (!r.cod) return;
      const fam = familiaDe(r.d) || nombrePieza(r.d) || `Pieza ${r.cod}`;
      const f = fila(fam);
      f.plan.push({ cod: r.cod, d: r.d, q: r.q, freq: freqDias((r.xls || {}).f), fq: (r.xls || {}).f || "", ej: (r.xls || {}).ej || "", px: (r.xls || {}).px || "" });
    });

    const res = [];
    filas.forEach((f) => {
      // Cambios reales, sin duplicados de la misma semana
      const reales = f.eventos.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
      const unicos = [];
      reales.forEach((e) => {
        const prev = unicos[unicos.length - 1];
        if (prev && dif(prev.fecha, e.fecha) < 5) { prev.otros = (prev.otros || 0) + 1; if (e.fuente === "anotado") prev.fuente = e.fuente; return; }
        unicos.push({ ...e });
      });
      const fechasPlan = f.plan.map((p) => p.ej).filter(Boolean).sort();
      const baseExcel = fechasPlan[fechasPlan.length - 1] || "";
      const freqPlan = f.plan.map((p) => p.freq).filter(Boolean).sort((a, b) => a - b)[0] || 0;
      const fq = (f.plan.find((p) => p.freq && p.freq === freqPlan) || {}).fq || "";

      // Lo medido: promedio entre los cambios reales (el Excel no cuenta, es una fecha de plan)
      let medida = 0;
      if (unicos.length >= 2) {
        const gaps = []; for (let i = 1; i < unicos.length; i++) gaps.push(dif(unicos[i - 1].fecha, unicos[i].fecha));
        medida = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
      }
      // Manda el plan; solo si la pieza se está cambiando mucho antes (menos del 60 %) manda lo medido
      const antes = medida && freqPlan && medida < freqPlan * 0.6;
      let vida = 0, base = "";
      if (medida && (!freqPlan || antes)) {
        vida = medida;
        base = unicos.length === 2 ? `lo que duró la anterior (${fmtDias(medida)})` : `el promedio de ${unicos.length - 1} cambios anteriores (${fmtDias(medida)})`;
        if (antes) base += `, mucho menos de lo que dice el plan (${fq})`;
      } else if (freqPlan) {
        vida = freqPlan;
        base = `la frecuencia del plan (${fq}) desde ${unicos.length ? "el último cambio" : "la última ejecución del Excel"}`;
      }
      // Último cambio: el más reciente entre los reportes y la fecha del Excel
      const ultimoReal = unicos.length ? unicos[unicos.length - 1].fecha : "";
      const ultimo = [ultimoReal, baseExcel].filter(Boolean).sort().pop() || "";
      // Cada código del plan con su propia fecha del Excel: el grupo se juzga por el más urgente
      const partes = f.plan.map((q) => {
        const prox = q.ej && q.freq ? suma(q.ej, q.freq) : "";
        const falta = prox ? dif(hoy, prox) : null;
        const est = !q.ej ? "sin-dato" : !prox ? "sin-frecuencia" : falta < 0 ? "vencida" : falta <= Math.max(14, Math.round(q.freq * 0.2)) ? "pronto" : "al-dia";
        return { ...q, prox, falta, estado: est };
      });
      const cand = partes.filter((q) => q.prox).map((q) => ({ prox: q.prox, d: q.d, cod: q.cod }));
      // Lo medido solo manda cuando la pieza se cambia mucho antes que el plan, o cuando no hay plan
      if (ultimo && vida && (antes || !partes.some((q) => q.prox))) cand.push({ prox: suma(ultimo, vida), d: antes ? "lo medido" : "", cod: "" });
      cand.sort((x, y) => x.prox.localeCompare(y.prox));
      const proximo = cand.length ? cand[0].prox : "";
      const mas = cand.length ? cand[0] : null;
      const vencidas = partes.filter((q) => q.estado === "vencida").length;
      const medidaPrimero = !!(mas && mas.d === "lo medido");
      let estado = "sin-dato";
      if (proximo) {
        const falta = dif(hoy, proximo);
        estado = falta < 0 ? "vencida" : falta <= Math.max(14, Math.round((vida || 365) * 0.2)) ? "pronto" : "al-dia";
      } else if (ultimo) estado = "sin-frecuencia";
      res.push({
        familia: f.familia, eventos: unicos.slice().reverse(), todos: f.eventos.length,
        plan: partes, vencidas, mas: medidaPrimero ? null : mas, baseExcel, ultimo, vida, base, proximo, estado, freqPlan, fq,
        dias: ultimo ? dif(ultimo, hoy) : null, falta: proximo ? dif(hoy, proximo) : null,
        deExcel: !!(baseExcel && ultimo === baseExcel && baseExcel > ultimoReal), vidaMedida: !!(medida && (!freqPlan || antes)), nCambios: unicos.length,
      });
    });
    const peso = { vencida: 0, pronto: 1, "sin-frecuencia": 2, "al-dia": 3, "sin-dato": 4 };
    return res.sort((a, b) => peso[a.estado] - peso[b.estado] || (a.proximo || "9").localeCompare(b.proximo || "9") || (b.ultimo || "").localeCompare(a.ultimo || ""));
  }

  // ------------------------------------------------------------ pantalla
  const ESTADOS = {
    vencida: ["Ya toca", "bad"], pronto: ["Cambiar pronto", "warn"], "al-dia": ["Al día", "ok"],
    "sin-frecuencia": ["Sin frecuencia", ""], "sin-dato": ["Sin cambios", ""],
  };
  const FUENTE = { reporte: "Reporte de turno", anotado: "Anotado en la ficha" };

  function htmlFicha(m, eqCod) {
    const hoy = N ? N.hoy() : new Date().toISOString().slice(0, 10);
    const piezas = piezasDe(m, eqCod);
    const conCambio = piezas.filter((p) => p.nCambios > 0);
    if (!piezas.length) return "";
    const ultimos = conCambio.flatMap((p) => p.eventos.map((e) => ({ ...e, familia: p.familia }))).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 8);
    const ult30 = ultimos.filter((e) => dif(e.fecha, hoy) <= 30).length;
    const porCambiar = piezas.filter((p) => p.estado === "vencida" || p.estado === "pronto").length;
    const nSin = piezas.filter((p) => p.estado === "sin-dato").length;

    const filas = piezas.filter((p) => p.estado !== "sin-dato" || p.plan.length).map((p) => {
      const [txt, tono] = ESTADOS[p.estado];
      const codigos = p.plan.length ? `<small>${p.plan.length} ${p.plan.length === 1 ? "código" : "códigos"} del plan</small>` : "";
      const hist = p.eventos.length ? `<ul class="cp-hist">${p.eventos.map((e) => `<li><b>${esc(fechaTxt(e.fecha))}</b><span>${esc(corto(e.detalle))}${e.otros ? ` <small>(+${e.otros} reporte${e.otros > 1 ? "s" : ""} del mismo arreglo)</small>` : ""}</span><small>${esc(FUENTE[e.fuente] || "")}${e.quien ? " · " + esc(e.quien) : ""}</small></li>`).join("")}</ul>` : `<p class="cp-vacio">Todavía no hay un cambio real de esta pieza en los reportes${p.baseExcel ? `. El Excel dice que se hizo el ${esc(fechaTxt(p.baseExcel))}` : ""}.</p>`;
      const [, tonoP] = ESTADOS[p.estado];
      const partesHtml = p.plan.length ? `<table class="cp-partes"><thead><tr><th>Código</th><th>Pieza del plan</th><th>Último (Excel)</th><th>Frecuencia</th><th>Próximo</th><th></th></tr></thead><tbody>${p.plan.slice().sort((x, y) => (x.prox || "9").localeCompare(y.prox || "9")).map((q) => {
        const [t2, tono2] = ESTADOS[q.estado];
        return `<tr><td>${esc(q.cod)}</td><td>${esc(corto(q.d || "—"))}${q.q > 1 ? ` <small>× ${q.q}</small>` : ""}</td><td>${q.ej ? esc(fechaTxt(q.ej)) : "—"}</td><td>${esc(q.fq || "—")}</td><td>${q.prox ? esc(fechaTxt(q.prox)) : "—"}</td><td><span class="cp-chip cp-chip--${tono2 || "n"}">${esc(t2)}</span></td></tr>`;
      }).join("")}</tbody></table>` : "";
      const proxTxt = p.proximo
        ? `<b>${esc(fechaTxt(p.proximo))}</b><small>${p.falta < 0 ? `venció hace ${esc(fmtDias(-p.falta))}` : `en ${esc(fmtDias(p.falta))}`}</small>${p.mas && p.plan.length > 1 && p.mas.d ? `<small>${esc(corto(p.mas.d).slice(0, 34))}</small>` : ""}`
        : `<span class="cp-mute">—</span>`;
      return `<tr class="cp-fila cp-fila--${tono || "n"}">
        <td class="cp-pieza"><details><summary><b>${esc(p.familia)}</b>${codigos}</summary>
          <div class="cp-det">${hist}${partesHtml}${p.base ? `<p class="cp-base">Lo medido: ${esc(p.base)}.</p>` : ""}</div></details></td>
        <td class="cp-f" data-l="Último cambio">${p.ultimo ? `<b>${esc(fechaTxt(p.ultimo))}</b><small>${esc(haceTxt(p.ultimo, hoy))}${p.deExcel ? " · según el Excel" : ""}</small>` : '<span class="cp-mute">sin registro</span>'}</td>
        <td class="cp-n" data-l="Cambios">${p.nCambios || "—"}</td>
        <td class="cp-f" data-l="Dura">${p.vida ? `<b>${esc(fmtDias(p.vida))}</b><small>${p.vidaMedida ? "medido" : "plan"}${p.vidaMedida && p.freqPlan ? ` · plan ${esc(p.fq)}` : ""}</small>` : '<span class="cp-mute">—</span>'}</td>
        <td class="cp-f" data-l="Próximo cambio">${proxTxt}</td>
        <td class="cp-e" data-l="Estado"><span class="cp-chip cp-chip--${tono || "n"}"${p.estado === "sin-frecuencia" ? ' title="Con un segundo cambio se calcula cuánto dura y cuándo toca el siguiente"' : ""}>${esc(txt)}${p.vencidas && p.plan.length > 1 ? ` (${p.vencidas} de ${p.plan.length})` : ""}</span></td>
      </tr>`;
    }).join("");

    return `<section class="cp-card">
      <div class="panel-header-clean">
        <h3>Cambios de piezas</h3>
        <p>Se arma solo con los reportes de turno, lo que se anota en la ficha y el plan del Excel. «Próximo cambio» se calcula con lo que ha durado cada pieza; se corrige solo con cada cambio nuevo.</p>
      </div>
      <div class="cp-kpis">
        <div><b>${conCambio.length}</b><span>${conCambio.length === 1 ? "pieza con cambios" : "piezas con cambios"} registrados</span></div>
        <div><b>${ult30}</b><span>cambios en los últimos 30 días</span></div>
        <div class="${porCambiar ? "is-bad" : ""}"><b>${porCambiar}</b><span>por cambiar (vencidas o pronto)</span></div>
      </div>
      ${ultimos.length ? `<h4 class="cp-h4">Últimos cambios</h4>
        <ol class="cp-ult">${ultimos.map((e) => `<li><time>${esc(fechaTxt(e.fecha))}</time><b>${esc(e.familia)}</b><span>${esc(corto(e.detalle))}</span></li>`).join("")}</ol>` : ""}
      <h4 class="cp-h4">Calendario por pieza</h4>
      <div class="pl-tablewrap cp-wrap"><table class="cp-tabla">
        <thead><tr><th>Pieza</th><th>Último cambio</th><th>Cambios</th><th>Dura</th><th>Próximo cambio</th><th>Estado</th></tr></thead>
        <tbody>${filas}</tbody></table></div>
      ${nSin ? `<p class="cp-pie">${nSin} ${nSin === 1 ? "pieza del plan no tiene" : "piezas del plan no tienen"} fecha ni frecuencia: aparecen cuando un reporte diga que se cambiaron.</p>` : ""}
    </section><div class="panel-split"></div>`;
  }

  window.CAMBIOS_PIEZAS = { cambiosEn, piezasDe, htmlFicha, FAMILIAS };
})();
