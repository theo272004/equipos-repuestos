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
  raiz.TURNOS = { roster, fijos: TN_FIJOS, soporte: TN_SUPPORT, ancla: ANCLA, ciclo: CICLO, bloque: BLOQUE, fases: TN_PHASE_BLOCKS, estadoDe, quienes, nombre, vigente };
})(typeof window !== "undefined" ? window : globalThis);
