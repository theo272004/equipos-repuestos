// ============================================================================
//  REGLAS PARA DETECTAR PENDIENTES EN EL REGISTRO DIARIO
// ============================================================================
//  Las usa la vista Pendientes (assets/js/pendientes.js) y el bot de Telegram
//  (scripts/lib/datos-app.mjs), para que los dos cuenten exactamente lo mismo.
//  No toca la página: recibe registros y devuelve pendientes.
// ============================================================================
(function (raiz) {
  // ----------------------------------------------------- reglas de texto
  // Frases del chat que dejan algo abierto. Se buscan solo en novedades que el
  // registro no cerró; las marcadas "Pendiente" ya vienen clasificadas.
  const RE_PEND = /(queda(?:ndo)?|qued[oó]) pendiente|pendiente (?:por|la|el|de|entregar|conexi|reparaci|montar|instalar|cambiar)|\bse requiere\b|\bse necesita(?:n)?\b|no se pudo|falta(?:n)? (?:montar|instalar|cambiar|conectar|repuesto|el|la|guarda|fijaci)|en espera de|esperando (?:repuesto|material|el|la)|fuera de servicio|sin repuesto|por conseguir|se debe (?:cambiar|reemplazar|reparar)/i;
  const RE_REP = /repuesto|rodamiento|correa|resorte|sensor|v[aá]lvula|motor|bobina|cilindro|empaque|mordaza|driver|balastro|breaker|contactor|rel[eé]\b|fusible|manguera|pieza/i;
  const RE_OK = /(queda|quedando|equipo) (?:ok|operativo|funcionando|habilitad[oa]|en funcionamiento)|se entrega (?:a|al) producci[oó]n|queda en producci[oó]n|opera normal/i;

  // Título corto y legible a partir del texto del chat:
  //   "Marzio se atiende llamado por problemas de sellado … no se pudo …"
  //     -> "Problemas de sellado · no se pudo"
  //   "Queda pendiente conexión en gabinete de control PLC." -> "Conexión en gabinete de control PLC"
  const cap = (x) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : x);
  const corta = (x, n) => (x.length > n ? x.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : x);
  function tituloDe(texto, eq) {
    let t = String(texto || "").replace(/\s+/g, " ").trim();
    const eqRe = String(eq || "").replace(/\s*\(sin especificar\)/i, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (eqRe) t = t.replace(new RegExp("^[-•*\\s]*" + eqRe + "\\s*[:#.-]?\\s*", "i"), "");
    t = t.replace(/^[-•*\s]+/, "").replace(/^[A-ZÁÉÍÓÚÑ0-9 #]{3,30}:\s*/, "");
    // El problema: "se atiende llamado por X"
    const prob = t.match(/(?:(?:se )?(?:atiende|recibe|entiende|atendi[oó])\s+(?:un\s+)?)?llamado\s+(?:por\s+qu[eé]|porque|por|debido a)\s+(?:(?:el|le) equipo\s+(?:estaba\s+)?|la m[aá]quina\s+)?(.{6,90}?)(?=[.,;]| se | y se |$)/i);
    // Lo que queda abierto: la cláusula que empieza en la señal
    const m = t.match(RE_PEND);
    let abierto = "";
    if (m) {
      abierto = t.slice(m.index).split(/[.;\n]/)[0]
        .replace(/^(?:queda(?:ndo)?|qued[oó])\s+pendiente\s*(?:por\s+|la\s+|el\s+|de\s+)?/i, "")
        .replace(/^pendiente\s*(?:por\s+|la\s+|el\s+|de\s+)?/i, "")
        .trim();
    }
    let titulo;
    if (prob) titulo = cap(prob[1].trim()) + (abierto && !prob[1].includes(abierto.slice(0, 15)) ? " · " + corta(abierto.toLowerCase(), 50) : "");
    else if (abierto) titulo = cap(abierto);
    else titulo = cap(t.split(/(?<=[.;])\s+/)[0] || t);
    return corta(titulo.replace(/\s*[,.;:]\s*$/, ""), 96);
  }

  const genericos = /^(no identificado|general.*)$/i;
  const sinFicha = /no identificado|sin especificar|general/i;

  function desdeRegistros(todos) {
    const regs = (todos || []).filter((r) => r && !r.borrado && r.f);
    // Para sugerir cierres: novedades posteriores del mismo equipo que lo dejan operativo
    const porEquipo = new Map();
    regs.forEach((r) => {
      if (!r.eq || sinFicha.test(r.eq)) return;
      const k = `${r.s}|${r.eq}`;
      if (!porEquipo.has(k)) porEquipo.set(k, []);
      porEquipo.get(k).push(r);
    });
    porEquipo.forEach((l) => l.sort((a, b) => (a.f + (a.hr || "")).localeCompare(b.f + (b.hr || ""))));

    const out = [];
    regs.forEach((r) => {
      const marcado = r.ef === "Pendiente" || r.ef === "Operativo con pendiente";
      const porTexto = !marcado && r.ef !== "Operativo" && RE_PEND.test(r.de || "");
      if (!marcado && !r.frep && !porTexto) return;
      // Mensajes sueltos del chat sin equipo ni trabajo concreto ("estamos pendientes…")
      if (/^no identificado$/i.test(r.eq || "") && String(r.de || "").length < 45 && !RE_REP.test(r.de || "") && !/requiere|necesita|falta|cambiar|reparar|instalar|montar|entregar/i.test(r.de || "")) return;
      const esp = !!r.frep || (/repuesto|material|pieza/i.test(r.de || "") && /espera|falta|sin |pedir|solicit|requiere|necesita/i.test(r.de || ""));
      let posibleCierre = null;
      const k = `${r.s}|${r.eq}`;
      if (porEquipo.has(k)) {
        const despues = porEquipo.get(k).find((x) => x.id !== r.id && (x.f + (x.hr || "")) > (r.f + (r.hr || "")) && (x.ef === "Operativo" || RE_OK.test(x.de || "")) && !RE_PEND.test(x.de || ""));
        if (despues) posibleCierre = { fecha: despues.f, texto: tituloDe(despues.de, despues.eq), id: despues.id, por: despues.tec || despues.por || "" };
      }
      out.push({
        id: `reg:${r.id}`,
        origen: "registro",
        ref: r.id,
        titulo: tituloDe(r.de, r.eq) || "Novedad pendiente",
        detalle: r.de || "",
        eq: genericos.test(r.eq || "") ? "" : r.eq || "",
        eqTxt: r.eq || "",
        sede: r.s || "",
        area: r.ar || "",
        fecha: r.f,
        hora: r.hr || r.hi || "",
        por: r.tec || r.por || "",
        prioridad: (r.ef === "Pendiente" && (r.det || r.cat === "Máquina")) || r.frep ? "alta" : r.ef === "Operativo con pendiente" || porTexto ? "media" : "media",
        estadoBase: esp ? "espera" : "abierto",
        confianza: marcado || r.frep ? "alta" : "media",
        repuesto: r.rep || (RE_REP.test(r.de || "") && esp ? "Revisar el texto" : ""),
        posibleCierre,
        rid: r.rid || "",
      });
    });
    return out;
  }


  raiz.REGLAS_PEND = { RE_PEND, RE_REP, RE_OK, tituloDe, desdeRegistros, genericos, sinFicha };
})(typeof window !== "undefined" ? window : globalThis);
