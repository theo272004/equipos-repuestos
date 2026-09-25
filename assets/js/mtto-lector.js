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

  function categoria(area, tipo, tn) {
    if (area === "Servicios industriales" || F.ext.test(tn)) return "Apoyo crítico";
    if (area === "Infraestructura") return "Locativo";
    if (tipo === "Preventivo") return "Preventivo";
    if (tipo === "Apoyo a producción" || F.opr.test(tn)) return "Operacional";
    return "Máquina";
  }

  // Lee un mensaje (o varios pegados seguidos) y devuelve lo que encontró.
  function leer(texto) {
    const limpio = String(texto || "")
      .replace(/^\s*\d{1,2}\/\d{1,2}\/\d{4},? \d{1,2}:\d{2}\s?[ap]\.?\s?m\.? - [^:\n]+: /gim, "")
      .replace(/<Se editó este mensaje\.>/g, "");
    const tnTodo = norm(limpio);
    const sede = F.sede2.test(tnTodo) ? "Sede 2" : "Sede 4";
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
      if (!eqs.length && previo && /^\s*[•\-*]/.test(b[0][0])) eq = previo;
      previo = eq;
      const ar = areaDe(eq);
      const tipos = etiquetas(tn, TIPOS);
      const tp = tipos[0] || "Otro";
      const fallas = etiquetas(tn, FALLAS);
      const pend = F.pend.test(tn), oper = F.oper.test(tn);
      novedades.push({
        eq, ar, tp,
        cat: categoria(ar, tp, tn),
        fa: fallas[0] || "",
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

  window.MTTO_LECTOR = { leer, norm, buscarEquipos, areaDe, minutos };
})();
