// ============================================================================
//  LECTOR DE REPORTES DEL CHAT
// ============================================================================
//  Convierte un reporte de turno pegado del grupo "Mtto Medicamentos" en filas
//  para el Registro diario: el estado de cada equipo y una novedad por bloque.
//  Es el mismo ETL de etl_chat_whatsapp.py (carpeta farmacap): las expresiones
//  llegan tal cual en window.MTTO.reglas, así que las dos lecturas coinciden.
//  Aquí solo se sugiere; la practicante revisa y completa antes de guardar.
// ============================================================================

(function () {
  const R = (window.MTTO && window.MTTO.reglas) || null;
  if (!R) return;

  const re = (p) => new RegExp(p);
  const reG = (p) => new RegExp(p, "g");
  const EQUIPOS = R.equipos.map(([p, n]) => [reG(p), n]);
  const AREAS = R.areas.map(([a, p]) => [a, re(p)]);
  const lista = (xs) => xs.map(([n, p]) => [n, re(p)]);
  const TIPOS = lista(R.tipos), FALLAS = lista(R.fallas), ACCIONES = lista(R.acciones), ESTADOS = lista(R.estados);
  const VERBO = re(R.verbo), ENCABEZADO = re(R.encabezado), SEPARADOR = re(R.separador), CAB_NOV = re(R.cabNovedades);
  const DURACION = reG(R.duracion);
  const F = { pend: re(R.pendiente), oper: re(R.operativo), rep: re(R.repuesto), ext: re(R.externa), opr: re(R.operador), sede2: re(R.sede2) };

  function norm(t) {
    return String(t || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[*_•∆>\[\]~`"“”]/g, " ")
      .replace(/[ \t]+/g, " ");
  }

  function buscarEquipos(t) {
    const hall = [];
    for (const [pat, nombre] of EQUIPOS) {
      pat.lastIndex = 0;
      let m;
      while ((m = pat.exec(t))) {
        if (m[0] === "") { pat.lastIndex++; continue; }
        const g = m.slice(1).filter(Boolean);
        const n = nombre.includes("{}") ? (g.length ? nombre.replace("{}", g[0]) : nombre.replace(" {}", " (sin especificar)").replace("{}", "")) : nombre;
        hall.push([m.index, -(m[0].length), n, m.index + m[0].length]);
      }
    }
    hall.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return hall.map(([s, , n, e]) => [s, e, n]);
  }

  function areaDe(eq) {
    for (const [a, p] of AREAS) if (p.test(eq)) return a;
    return "Infraestructura";
  }
  const esServicio = (eq) => ["Servicios industriales", "Infraestructura"].includes(areaDe(eq));

  // "Marzio" sin número en un reporte de la Sede 2 es la Marzio 2: es la única
  // que hay allá. Un equipo "sin especificar" se aclara cuando en esa sede solo
  // hay uno de esa familia; si hay varios, se deja como está.
  const CATALOGO = (window.MTTO && window.MTTO.catalogo && window.MTTO.catalogo.equipos) || [];
  function porSede(eq, sede) {
    const m = /^(.*) \(sin especificar\)$/.exec(eq || "");
    if (!m) return eq;
    const unicos = CATALOGO.filter((x) => x.s === sede && x.eq.startsWith(m[1] + " "));
    return unicos.length === 1 ? unicos[0].eq : eq;
  }
  const etiquetas = (t, reglas) => reglas.filter(([, p]) => p.test(t)).map(([n]) => n);

  function minutos(t) {
    let total = 0;
    DURACION.lastIndex = 0;
    let m;
    while ((m = DURACION.exec(t))) {
      if (m[3] || m[4]) { total += Number(m[3] || m[4]); continue; }
      const crudo = m[1].replace(",", ".");
      const [h, mm] = crudo.split(".");
      if (mm && mm.length === 2 && Number(mm) < 60) total += Number(h) * 60 + Number(mm);
      else total += Number(crudo) * 60;
      if (m[2]) total += Number(m[2]);
    }
    return total > 0 && total <= 720 ? Math.round(total) : null;
  }

  function lineaEstado(tn) {
    const t = tn.trim().replace(/^[ :-]+|[ :-]+$/g, "");
    const eqs = buscarEquipos(t);
    if (!eqs.length || eqs[0][0] > 3) return null;
    const [, e, nombre] = eqs[0];
    if (esServicio(nombre)) return null;
    let resto = t.slice(e).replace(/^[ :#-]+|[ :#-]+$/g, "").trim();
    if (/^\d+\s*[:\-]/.test(resto)) resto = resto.replace(/^\d+\s*[:\-]\s*/, "");
    if (resto.length > 45 || /\bSE\s+[A-Z]{3,}|LLAMAD|ATIENDE|RECIBE|\bPOR\b.*\bQUE\b/.test(resto)) return null;
    return [nombre, resto];
  }

  function clasificarEstado(valor) {
    if (!valor.replace(/[ .:-]/g, "")) return "Sin dato";
    for (const [n, p] of ESTADOS) if (p.test(valor)) return n;
    return "Producción";
  }

  function segmentar(msg) {
    const lineas = String(msg).split("\n");
    const normal = lineas.map(norm);
    let idxCab = normal.findIndex((t) => CAB_NOV.test(t));
    if (idxCab < 0) idxCab = null;
    const siguiente = (i) => {
      for (let j = i + 1; j < normal.length; j++) if (normal[j].trim() && !SEPARADOR.test(normal[j])) return normal[j].trim();
      return "";
    };
    const estados = [], novedad = [];
    lineas.forEach((orig, i) => {
      const tn = normal[i];
      if (idxCab === null || i < idxCab) {
        const le = lineaEstado(tn);
        if (le) {
          const sig = siguiente(i);
          const eqSig = buscarEquipos(sig);
          const titulo = !le[1] && VERBO.test(sig) && !(eqSig.length && eqSig[0][0] <= 2);
          if (!titulo) { estados.push(le); return; }
        }
      }
      if (idxCab !== null && i === idxCab) { novedad.push(["", ""]); return; }
      novedad.push([orig.trim(), tn.trim()]);
    });

    const bloques = [];
    let cur = [];
    for (const [orig, tn] of novedad) {
      if (!tn || SEPARADOR.test(tn)) { if (cur.length) { bloques.push(cur); cur = []; } continue; }
      if (ENCABEZADO.test(tn) && tn.length < 50 && !VERBO.test(tn)) continue;
      const eqs = buscarEquipos(tn);
      const empieza = eqs.length && eqs[0][0] <= 2;
      if (empieza && cur.length && cur.some((x) => VERBO.test(x[1]))) { bloques.push(cur); cur = []; }
      cur.push([orig, tn]);
    }
    if (cur.length) bloques.push(cur);

    const fus = [];
    for (const b of bloques) {
      const tn = b.map((x) => x[1]).join(" ");
      DURACION.lastIndex = 0;
      const soloTiempo = !VERBO.test(tn) && DURACION.test(tn) && tn.length < 40;
      if (soloTiempo && fus.length) fus[fus.length - 1].push(...b);
      else fus.push(b);
    }
    const final = [];
    let arrastre = [];
    for (const b of fus) {
      const tn = b.map((x) => x[1]).join(" ");
      if (!VERBO.test(tn) && buscarEquipos(tn).length && tn.length < 45) { arrastre.push(...b); continue; }
      final.push([...arrastre, ...b]);
      arrastre = [];
    }
    return { estados, bloques: final.filter((b) => VERBO.test(b.map((x) => x[1]).join(" "))) };
  }

  const RE_AVERIA_FISICA = /PARTID|ROT[OA]|QUEMAD|FISUR|REVENTAD|SULFATAD|DESPRENDID|EN\s*CORTO|SE\s+CAMBIA\s+(?:RESORTE|SENSOR|CORREA|RESISTENCIA|VALVULA|RODAMIENTO|CUCHILLA|CABLE|BOBINA|RETEN|ORING|EMPAQUE|ESP[AÁ]RRAGO)|CORREA\s+PARTIDA|AGITADOR.*PARTIDO|ROSCAS?\s+MAL[AS]?|ROSCAS?\s+QUEDADA|EXTRAE\s+ROSCA|EJE\s+(?:PARTIDO|PEGADO|TORCIDO)|DISCO\s+DURO|SE\s+SUELDA|SE\s+EMBOBINA|SE\s+RECTIFICA|VASTAGO\s+RAYADO|VALVULA.*PEGADA|BOMBA.*TRABADA|MOTOR.*QUEMADO/;
  const RE_OPERACIONAL = /OPERARI[AO]\s+NUEV[AO]|\bINDUCCION\b|SE\s+(?:LE\s+)?ENSENA|SE\s+(?:LE\s+)?EXPLICA|\bCAPACITA\w*|\bAYUDA\s+(?:AL?\s+)?OPERA|\bCOLABORA\s+(?:AL?\s+)?OPERA|\bAPOYO\s+(?:AL?\s+)?OPERA|SE\s+APOYA\s+EN\s+(?:MONTAJE|CUADRE|ARRANQUE)|PROBLEMAS?\s+DE\s+CUADRE|FALTA\s+DE\s+EXPERIENCIA|NO\s+SAB[IÍ]AN\s+C[OÓ]MO|SE\s+CUADRA\s+(?:LOTE|SALIDA\s+DE\s+ETIQUETA|ALTURA|VELOCIDAD|SOBRE|PASO|ARRASTRE|PESTANA|FORMATO|PESO|ESTERAS?)|LOTE\s+(?:BORROS[OA]|TORCID[OA]|CORRID[OA]|ILEGIBLE|RAYAD[OA]|DESALINEAD[OA])|ARRUGA\s+EN\s+(?:LA\s+)?ETIQUETA|ETIQUETA\s+TORCIDA|CENTRADO\s+DE\s+(?:IMPRESION|LAMINADO)|MUESTRA\s+DE\s+SACHET|MONTAJE\s+DE\s+FORMATO|DESATASCA\s+(?:BLISTER|CAPSULAS?)|BLISTER\s+ATASCADO|CAPSULAS?\s+ATASCADAS?|SE\s+DESATASCA|NO\s+DABA\s+CON\s+EL\s+PESO|SE\s+CALIBRA\s+PESO|P[EÉ]RDIDA\s+CONSTANTE\s+DE\s+PASO|POR\s+CONDICIONES\s+SE\s+ADECUA/;
  const RE_SERVICIOS = /\bCOMPRESOR\b|\bCOMPRESORES\b|\bAIRE\s+COMPRIMIDO\b|\bPRESION\s+DE\s+TRABAJO\b|\bCHILLER\b|\bAGUA\s+HELADA\b|\bAGUA\s+FRIA\b|\bREFRIGERACION\b|\bBOMBA\s+DE\s+VACIO\b|\bSUBESTACION\b|\bCORTE\s+DE\s+ENERGIA\b|\bPLANTA\s+DE\s+AGUA\b|\bSISTEMA\s+DE\s+VACIO\b/;
  const RE_LOCATIVO = /\bESCLUSA\b|\bPUERTA\s+DE\s+(?:PERSONAL|ACCESO|PASILLO|ESCLUSA)\b|\bVENTANA\b|\bTECHO\b|\bPISO\b|\bDESAGUE\b|\bSIFON\b|\bLUMINARIA\b|\bLAMPARA\b|\bBOMBILLO\b|\bCANALETA\b|\bCORTINA\s+DE\s+AIRE\b|\bMUEBLE\b|\bSILLA\b|\bMESA\b/;
  const RE_PREVENTIVO = /\bMP\b|\bMANTENIMIENTO\s+PREVENTIVO\b|\bPARADA\s+PROGRAMADA\b|\bRUTINA\s+DE\s+(?:LUBRICACION|ENGRASE|INSPECCION)\b|\bLIMPIEZA\s+PROGRAMADA\b|\bCAMBIO\s+PROGRAMADO\b/;
  const RE_CORRECTIVO = /\bFALLA\b|\bDANO\b|\bDANAD\w*|\bPARTID\w*|\bROT[OA]S?\b|\bQUEMAD\w*|NO\s+(?:ARRANCA|SELLA|CORTA|DOSIFICA|DESTAPA|CALIENTA|FUNCIONA|PRENDE|GIRA)|\bSIN\s+REFRIGERACION\b|\bALARMA\b|\bFUGA\b|\bATASC\w*|\bATACAD\w*|\bTRABAD\w*|\bPEGAD\w*|\bDESALINEAD\w*|\bDESCALIBRAD\w*|\bDESGASTAD\w*|\bMALTRAT\w*|\bSUELT\w*|\bFLOJ\w*|\bVIBRACION\b|\bRUIDO\b|SE\s+REPARA|SE\s+CAMBIA|SE\s+CORRIGE|SE\s+AJUSTA\s+SENSOR|\bPURGA\b/;

  function clasificarNovedad(eq, ar, tn) {
    const esEquipoProd = /BLISTER|FETTE|HUTTLIN|BOSH|NJP|MARZIO|RIMEK|STICK|MT11|CL\s*[1234]|CENTRO\s*LIQUIDOS|ENVASADORA|ETIQUETADORA|BOMBO|MEZCLADOR|PILOTLAB|GB\s*100|MB\s*432|MB\s*451|EVO|INTEGRA|MS\s*235|CB\s*550|RECUBRIDOR|TAMIZADORA|GRANULADOR|MICRONIZADOR/i.test(eq || "");
    if (RE_LOCATIVO.test(tn) && (!esEquipoProd || /ESCLUSA/i.test(tn))) {
      return { cat: "Locativo", tp: "Mejora / fabricación" };
    }
    if (RE_SERVICIOS.test(tn) || ar === "Servicios industriales" || /BOMBA\s+DE\s+VACIO/i.test(tn)) {
      const esFalla = /DANAD|FALLA|ALARM|FUGA|NO\s+ARRANCA|DISPARAD|SIN\s+PRESION|POR\s+DEBAJO|SE\s+DANA|SIN\s+REFRIGERACION|PEGAD/i.test(tn);
      return { cat: esEquipoProd && esFalla ? "Máquina" : "Apoyo crítico", tp: esFalla ? "Correctivo" : "Otro" };
    }
    if (RE_PREVENTIVO.test(tn) && !/LLAMADO\s+POR\s+(?:FALLA|DANO|PARADA)/i.test(tn)) {
      return { cat: "Preventivo", tp: "Preventivo" };
    }
    if (RE_OPERACIONAL.test(tn) && !RE_AVERIA_FISICA.test(tn)) {
      return { cat: "Operacional", tp: "Apoyo a producción" };
    }
    if (RE_CORRECTIVO.test(tn) || RE_AVERIA_FISICA.test(tn)) {
      return { cat: "Máquina", tp: "Correctivo" };
    }
    const tipos = etiquetas(tn, TIPOS);
    const tp = tipos.find((t) => t !== "Correctivo" || !/LLAMAD/i.test(tn)) || tipos[0] || "Otro";
    return { cat: categoria(ar, tp, tn), tp };
  }

  function categoria(area, tipo, tn) {
    if (area === "Servicios industriales" || F.ext.test(tn)) return "Apoyo crítico";
    if (area === "Infraestructura") return "Locativo";
    if (tipo === "Preventivo") return "Preventivo";
    if (tipo === "Apoyo a producción" || F.opr.test(tn)) return "Operacional";
    return "Máquina";
  }

  function detectarSede(tnTodo) {
    const head = tnTodo.split("\n").slice(0, 5).join(" ");
    if (/\b(?:SEDE|SD)\s*2\b|\bVIA\s*40\b|\bPLANTA\s*2\b/.test(head)) return "Sede 2";
    if (/\b(?:SEDE|SD)\s*4\b/.test(head)) return "Sede 4";
    const esSede4Exclusivo = /\b(?:HUTTLIN|FETTE|BOSCH|BOSHC|NJP\s*[13]|INTEGRA|MB\s*432|SCHMUCKER|MS\s*235|CB\s*550|MARZIO\s*[145]|CL\s*[34]|R200|R400)\b/.test(tnTodo);
    const esSede2Firma = /\b(?:C(?:ENTRO)?\s*(?:DE\s*)?LIQUIDOS?\s*1|CL\s*1|ENVASAD\w*\s*1)\b/.test(tnTodo) ||
      (/\bGB\s*100\b/.test(tnTodo) && /\b(?:BLISTER\s*5|B5|RONCHI|CD\s*40)\b/.test(tnTodo));
    if (esSede2Firma && !esSede4Exclusivo) return "Sede 2";
    return F.sede2.test(tnTodo) ? "Sede 2" : "Sede 4";
  }

  // Lee un mensaje (o varios pegados seguidos) y devuelve lo que encontró.
  function leer(texto) {
    const limpio = String(texto || "")
      .replace(/^\s*\d{1,2}\/\d{1,2}\/\d{4},? \d{1,2}:\d{2}\s?[ap]\.?\s?m\.? - [^:\n]+: /gim, "")
      .replace(/<Se editó este mensaje\.>/g, "");
    const tnTodo = norm(limpio);
    const sede = detectarSede(tnTodo);
    const { estados, bloques } = segmentar(limpio);
    const vistos = new Set();
    let previo = null;
    const novedades = [];
    for (const b of bloques) {
      const texto = b.map((x) => x[0]).join("\n").replace(/[*_]/g, "").trim();
      const tn = b.map((x) => x[1]).join(" ");
      const clave = tn.replace(/\W+/g, "").slice(0, 160);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      const eqs = buscarEquipos(tn.slice(0, 70)).length ? buscarEquipos(tn.slice(0, 70)) : buscarEquipos(tn);
      let eq = eqs.length ? eqs[0][2] : "No identificado";
      if (!eqs.length && previo && (/^\s*[•\-*]/.test(b[0][0]) || /^\s*(?:NOTA|OTRO\s+LLAMAD|SE\s+ATIENDE\s+NUEVAMENTE|NUEVAMENTE|TAMBI[EÉ]N|ESTADO\s+FINAL|PENDIENTE\s+TURNO|EL\s+CAMBIO\s+DE|SE\s+HACE\s+PRESENCIA)/i.test(b[0][0].trim()))) eq = previo;
      eq = porSede(eq, sede);
      previo = eq;
      const ar = areaDe(eq);
      const cl = clasificarNovedad(eq, ar, tn);
      const fallas = etiquetas(tn, FALLAS);
      const pend = F.pend.test(tn), oper = F.oper.test(tn);
      novedades.push({
        eq, ar, tp: cl.tp,
        cat: cl.cat,
        fa: fallas[0] || (cl.cat === "Operacional" ? "Ajuste operacional / formato" : ""),
        ac: etiquetas(tn, ACCIONES).join(" | "),
        min: minutos(tn),
        ef: pend && oper ? "Operativo con pendiente" : pend ? "Pendiente" : "Operativo",
        frep: F.rep.test(tn) ? 1 : 0,
        de: texto,
      });
    }
    return {
      sede,
      estados: estados.map(([eq, valor]) => ({ eq, producto: valor ? valor.charAt(0) + valor.slice(1).toLowerCase() : "", estado: clasificarEstado(valor) })),
      novedades,
    };
  }

  window.MTTO_LECTOR = { leer, norm, buscarEquipos, areaDe, minutos, porSede, detectarSede };
})();
