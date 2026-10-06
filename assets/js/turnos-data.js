// ============================================================================
//  TURNOS DEL PERSONAL DE MANTENIMIENTO
// ============================================================================
//  Grupos, integrantes y ciclo de rotación (6 días: 2 de día, 2 de noche, 2 de
//  descanso) sobre el cuadro de julio de 2026. Lo usan la vista Turnos, el
//  Inicio ("quién está ahora") y el bot de Telegram (/turno).
//
//  Para cambiar la rotación o el personal se edita SOLO este archivo.
//  Un integrante puede ser "Nombre" o { n, desde, hasta } (AAAA-MM-DD).
// ============================================================================
(function (raiz) {
  const roster = {
    sede4: {
      label: "Sede 4",
      groups: [
        { name: "Grupo Sede 4-1", phase: "dia", members: ["Alexander Alberto Algarín Pacheco", "Jhon Alexander Pájaro Ariza", "Leonardo Santos Ramírez", "José Luis Vargas Buitrago"] },
        { name: "Grupo Sede 4-2", phase: "noche", members: ["Bladimir Antonio Escorcia Santos", "Miguel Enrique De la Hoz Salcedo", "Andrés David Vega Ortiz", "Brayan Alexander Caro Mebarak"] },
        { name: "Grupo Sede 4-3", phase: "descanso", members: ["Luis Miguel Ruiz Bayuelo", "Diego Andrés Chacón Cano", "Yesid Alfredo Anaya Ramírez", "Heiner Alcides Velásquez Mosquera"] }
      ]
    },
    sede2: {
      label: "Sede 2 (Vía 40)",
      groups: [
        // Sergio rota con Alfonso desde el lunes 21 de septiembre de 2026 (antes, turno fijo en Sede 4).
        { name: "Grupo Vía 40-1", phase: "descanso", members: ["Alfonso Enrique Orozco Murillo", { n: "Sergio Alexander Vergara Aguirre", desde: "2026-09-21" }] },
        { name: "Grupo Vía 40-2", phase: "noche", members: ["Samith Arick Sanjuán Otálora"] },
        { name: "Grupo Vía 40-3", phase: "dia", members: ["Oscar Antonio Hernández Sarabia"] }
      ]
    }
  };
  // Hay quien figura dentro de un grupo pero no rota con él: hace turno fijo.
  // En el cuadro se le marca con "2" todos los días en vez de D/N/L.
  const TN_FIJOS = {
    sede4: [
      { nombre: "Sergio Alexander Vergara Aguirre", grupo: "Grupo Sede 4-2", horario: "8:00 a 20:00", hasta: "2026-09-20", nota: "Desde el 21/09/2026 rota en Sede 2 (Grupo Vía 40-1)." }
    ],
    sede2: []
  };

  // Cómo firma cada técnico en el chat "Mtto Medicamentos" (el nombre, o los 4
  // últimos dígitos del teléfono) y en qué grupo está. Con esto el importador
  // sabe de qué turno y de qué sede es un reporte aunque llegue tarde, con el
  // encabezado de otro turno o sin decir la sede: el reporte de la noche que
  // llega a las 9 de la mañana es de la noche anterior, no del día en que llegó.
  // Quien no está aquí (supervisores, electricistas de apoyo) se ubica por la hora.
  const TN_CHAT = {
    "alexander algarin": "Grupo Sede 4-1", "jhon": "Grupo Sede 4-1", "jair mesa": "Grupo Sede 4-1", "3481": "Grupo Sede 4-1", "4066": "Grupo Sede 4-1",
    "3014": "Grupo Sede 4-2", "bladimir": "Grupo Sede 4-2", "brayan": "Grupo Sede 4-2", "1867": "Grupo Sede 4-2",
    "lucho": "Grupo Sede 4-3", "diego temporal": "Grupo Sede 4-3", "heiner": "Grupo Sede 4-3", "2880": "Grupo Sede 4-3",
    "alfonsoorozco10": "Grupo Vía 40-1", "sergio vergara electricista": "Grupo Vía 40-1", "2941": "Grupo Vía 40-2", "0864": "Grupo Vía 40-3",
  };
  const claveChat = (autor) => {
    const s = String(autor || "").trim();
    const tel = s.match(/(\d{4})\s*$/);
    if (tel && /^\+?[\d\s.]+$|^t[eé]cnico\b/i.test(s)) return tel[1];
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^@/, "").replace(/\s+/g, " ");
  };
  // Grupo (y su sede y fase) de quien firma en el chat, o null si no se sabe.
  function grupoDeAutor(autor) {
    const nombre = TN_CHAT[claveChat(autor)];
    if (!nombre) return null;
    for (const [k, sede] of Object.entries(roster)) {
      const g = sede.groups.find((x) => x.name === nombre);
      if (g) return { grupo: g.name, sede: k === "sede2" ? "Sede 2" : "Sede 4", phase: g.phase };
    }
    return null;
  }

  const TN_SUPPORT = [
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

  const ANCLA = TN_ANCHOR, CICLO = TN_CICLO, BLOQUE = TN_BLOQUE;
  const nombre = (m) => (typeof m === "string" ? m : m.n);
  const vigente = (m, fecha) => typeof m === "string" || ((!m.desde || fecha >= m.desde) && (!m.hasta || fecha <= m.hasta));
  function estadoDe(fase, fecha) {
    const d = Date.parse(fecha + "T00:00:00Z");
    const dias = Math.floor((d - ANCLA) / 86400000);
    const n = ((dias % CICLO) + CICLO) % CICLO;
    return TN_PHASE_BLOCKS[fase][Math.floor(n / BLOQUE)];
  }
  // Quién trabaja en una fecha y turno ("dia" | "noche"), por sede.
  function quienes(fecha, turno) {
    const out = {};
    Object.entries(roster).forEach(([k, sede]) => {
      const gente = [];
      sede.groups.forEach((g) => {
        if (estadoDe(g.phase, fecha) !== turno) return;
        g.members.filter((m) => vigente(m, fecha)).forEach((m) => gente.push({ nombre: nombre(m), grupo: g.name }));
      });
      if (turno === "dia") (TN_FIJOS[k] || []).filter((f) => vigente({ n: f.nombre, desde: f.desde, hasta: f.hasta }, fecha))
        .forEach((f) => gente.push({ nombre: f.nombre, grupo: f.grupo, fijo: f.horario }));
      out[k] = { sede: sede.label, gente };
    });
    return out;
  }

  // Especialidad de cada técnico en planta:
  // - Electricistas: yesid, heiner, bladimir, brayan, oscar, sergio, leo
  // - Locativo: nestor
  // - Refrigeración: juan
  // - El resto son mecánicos (leiner, alexander, jhon, jose luis, miguel, etc.)
  function especialidad(nombre) {
    const s = String(nombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/nestor/i.test(s)) return { rol: "Locativo", slug: "loc" };
    if (/juan\s*carlos|estupi[nñ]an|refrigeraci/i.test(s)) return { rol: "Refrigeración", slug: "ref" };
    if (/yesid|heiner|bladimir|brayan|oscar|sergio|leonardo\s+santos|\bleo\b/i.test(s)) return { rol: "Electricista", slug: "elec" };
    return { rol: "Mecánico", slug: "mec" };
  }

  // De qué turno es un mensaje enviado el día `fecha` a la `hora` ("HH:MM").
  // El de día (8 a 20) se reporta esa tarde o noche; el de la noche (20 a 8),
  // a la mañana siguiente. `pista` es lo que dice el encabezado ("Día" o
  // "Noche"), que a veces viene copiado de otro reporte: si quien firma tiene
  // grupo, manda el turno que de verdad trabajó ese grupo.
  function turnoDelMensaje(fecha, hora, autor, pista) {
    const h = Number(String(hora || "").slice(0, 2)) || 0;
    const antes = new Date(Date.parse(fecha + "T00:00:00Z") - 864e5).toISOString().slice(0, 10);
    const porHora = h < 5 ? [["Día", antes], ["Noche", antes]] : h < 14 ? [["Noche", antes], ["Día", fecha]] : [["Día", fecha], ["Noche", antes]];
    const orden = pista ? [...porHora.filter((c) => c[0] === pista), ...porHora.filter((c) => c[0] !== pista)] : porHora;
    const g = grupoDeAutor(autor);
    const ok = g && orden.find(([t, f]) => estadoDe(g.phase, f) === (t === "Día" ? "dia" : "noche"));
    const [t, f] = ok || orden[0];
    return { turno: t, fecha: f, grupo: ok ? g.grupo : "", sede: g ? g.sede : "" };
  }

  raiz.TURNOS = { roster, fijos: TN_FIJOS, soporte: TN_SUPPORT, ancla: ANCLA, ciclo: CICLO, bloque: BLOQUE, fases: TN_PHASE_BLOCKS, estadoDe, quienes, nombre, vigente, especialidad, chat: TN_CHAT, grupoDeAutor, turnoDelMensaje };
})(typeof window !== "undefined" ? window : globalThis);
