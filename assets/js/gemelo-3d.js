// ============================================================================
//  GEMELO DIGITAL 3D Y SIMULADOR CINEMÁTICO INTERACTIVO
//  Cubre todos los equipos con manual en la biblioteca técnica:
//   1. NJP-3500 (Canaan)                  — Encapsuladora rotativa 10 est. (25 orificios)
//   2. NJP-1200C (eq-17333006/17333007)   — Encapsuladora rotativa 10 est. (9 orificios)
//   3. Bosch GKF 2600                     — Encapsuladora modular 12 est. doble línea
//   4. Schmucker MS235 (S4220003)         — Ensobradora 4 soldaduras (6 pistas)
//   5. Marchesini Integra 320 (M4160012)  — Línea blíster robotizada continua/fases
//   6. Uhlmann B 1240 (Blister 3)         — Línea blíster 31 estaciones con fácil-flex
//   7. Controlsa 114 RL                   — Puerta rápida autorreparable de laboratorio
//   8. Tecnomaco FX30 PRO STEP (19021)    — Impresora flexográfica rotativa de aluminio
//   9. Schmucker Stickpacker (S3240005)   — Envasadora vertical multipista Stick Pack
//  10. Hüttlin HDGC 400 (130378001)       — Granulador / recubridor de lecho fluido Diskjet
// ============================================================================

(function () {
  "use strict";

  // Mapa de ID de máquina o código a arquetipo 3D
  const ARCHETYPE_BY_ID = {
    njp3500: "njp3500",
    "eq-17333009": "njp3500",
    "eq-17333006": "njp1200",
    "eq-17333007": "njp1200",
    njp1200: "njp1200",
    gkf2600: "gkf2600",
    "eq-17333005": "gkf2600",
    ms235: "ms235",
    "eq-17334017": "ms235",
    integra320: "integra320",
    "eq-17332004": "integra320",
    "eq-17332008": "integra320",
    "eq-17332009": "integra320",
    blister3: "blister3",
    "eq-17332003": "blister3",
    "eq-17332002": "blister3",
    "eq-17332005": "blister3",
    controlsa114rl: "controlsa114rl",
    "eq-16336008": "fx30prostep",
    "eq-16336009": "fx30prostep",
    fx30prostep: "fx30prostep",
    "eq-17334008": "stickpack",
    "eq-17334015": "stickpack",
    "eq-17334016": "stickpack",
    "eq-17334018": "stickpack",
    stickpack: "stickpack",
    "eq-130378001": "hdgc400",
    "eq-16372001": "hdgc400",
    "eq-130378002": "hdgc400",
    hdgc400: "hdgc400",
    "eq-125334003": "ml642",
    ml642: "ml642"
  };

  function getTwinArchetype(machine) {
    if (!machine) return null;
    if (ARCHETYPE_BY_ID[machine.id]) return ARCHETYPE_BY_ID[machine.id];
    if (machine.equipoCod && ARCHETYPE_BY_ID["eq-" + machine.equipoCod]) {
      return ARCHETYPE_BY_ID["eq-" + machine.equipoCod];
    }
    const text = [machine.id, machine.name, machine.model].join(" ").toLowerCase();
    if (text.includes("njp-3500") || text.includes("njp3500")) return "njp3500";
    if (text.includes("njp-1200") || text.includes("njp 1200") || text.includes("njp1200")) return "njp1200";
    if (text.includes("gkf") || text.includes("bosch")) return "gkf2600";
    if (text.includes("ms235") || text.includes("bustinatrice")) return "ms235";
    if (text.includes("integra") || text.includes("mb432") || text.includes("mb451")) return "integra320";
    if (text.includes("b 1240") || text.includes("b1240") || text.includes("ups300") || text.includes("blister")) return "blister3";
    if (text.includes("controlsa") || text.includes("114 rl") || text.includes("114rl")) return "controlsa114rl";
    if (text.includes("flexografica") || text.includes("fx30") || text.includes("tecnomaco")) return "fx30prostep";
    if (text.includes("stick pack") || text.includes("stickpack") || text.includes("s3240005")) return "stickpack";
    if (text.includes("huttlin") || text.includes("hüttlin") || text.includes("hdgc") || text.includes("lecho fluido")) return "hdgc400";
    if (text.includes("ml642") || text.includes("ml 642") || text.includes("m6210005") || text.includes("125334003")) return "ml642";
    return null;
  }

  function hasGemelo3D(machine) {
    return !!getTwinArchetype(machine);
  }

  // --------------------------------------------------------------------------
  //  ESPECIFICACIONES DE ESTACIONES, TELEMETRÍA Y CINEMÁTICA POR ARQUETIPO
  // --------------------------------------------------------------------------
  const TWIN_SPECS = {
    njp3500: {
      title: "Gemelo 3D · Encapsuladora Rotativa Canaan NJP-3500",
      subtitle: "Torreta intermitente de 10 estaciones · 25 orificios por segmento · 3500 cáps/min · 5 etapas de apisonado (tamping)",
      cycleLabel: "Ciclo de indexado de torreta (0°–360° · 10 pasos de 36°)",
      defaultCam: { theta: 0.72, phi: 1.05, radius: 13.5, target: [0, 1.2, 0] },
      telemetry: [
        { k: "Velocidad nominal", v: "3500 cáps/min", unit: "140 golpes/min" },
        { k: "Vacío separación", v: "-0.045 MPa", unit: "rango -0.02 a -0.06 MPa" },
        { k: "Holgura disco dosif.", v: "0.06 mm", unit: "tol. 0.05–0.10 mm" },
        { k: "Aire limpieza Est. 10", v: "0.35 MPa", unit: "soplado + aspiración" }
      ],
      stations: [
        {
          id: "est1-2",
          num: "E1–E2",
          name: "Alimentación, orientación y separación por vacío",
          pos: [-2.1, 2.3, 1.55],
          cam: { theta: -0.6, phi: 1.05, radius: 8.5, target: [-1.8, 1.8, 1.2] },
          systemMatch: "Alimentación",
          summary: "Las cápsulas vacías bajan desde la tolva cónica por 25 tubos guía; las horquillas rectificadoras orientan siempre el cuerpo hacia abajo y la zapata de vacío inferior (-0.02 a -0.06 MPa) succiona el cuerpo al segmento inferior mientras la tapa queda en el superior.",
          params: [
            ["Vacío de separación", "-0.02 a -0.06 MPa (bomba anillo líquido SK-3)"],
            ["Orificios por molde", "25 alojamientos en doble arco"],
            ["Holgura zapata vacío", "≤ 0.05 mm bajo el segmento inferior"],
            ["Alineación bujes molde", "Concentricidad ≤ 0.02 mm con galga patrón"]
          ],
          adjustments: [
            "Ajustar altura del asiento de succión de vacío en PMI sin frenar la torreta.",
            "Verificar que los dedos orientadores centren la cápsula sin abollar la cúpula."
          ]
        },
        {
          id: "est3-5",
          num: "E3–E5",
          name: "Dosificación por disco y 5 estaciones de compactación (Tamping)",
          pos: [2.25, 2.55, 0.2],
          cam: { theta: 1.15, phi: 1.02, radius: 8.8, target: [2.0, 2.0, 0.2] },
          systemMatch: "Dosificación",
          summary: "El segmento inferior se desplaza radialmente bajo la cámara de polvo. Cinco grupos de 25 punzones apisonan el polvo progresivamente dentro del disco dosificador formando el taco (slug) y en el 5.º golpe lo transfieren al cuerpo de la cápsula.",
          params: [
            ["Etapas de apisonado", "5 cabezales de 25 punzones (Tamping 1 a 5)"],
            ["Holgura disco / anillo", "0.05 a 0.10 mm (crítico contra fuga de polvo)"],
            ["Control de nivel", "Sensor capacitivo en tolva → tornillo sinfín"],
            ["Holgura bloqueador polvo", "1.8 a 2.5 mm"]
          ],
          adjustments: [
            "Graduar la profundidad de los punzones 1–5 en las columnas roscadas según el peso neto objetivo.",
            "Medir con galga de espesores la separación entre el disco dosificador y la placa base."
          ]
        },
        {
          id: "est6-7",
          num: "E6–E7",
          name: "Estación de reserva y rechazo de cápsulas no abiertas",
          pos: [0.3, 2.15, -2.35],
          cam: { theta: 2.85, phi: 1.0, radius: 8.2, target: [0.2, 1.8, -2.0] },
          systemMatch: "Rechazo",
          summary: "En la estación 7, un peine de 25 varillas inferiores sube a través del molde superior: si una cápsula no se separó en E1–E2, la empuja hacia arriba y la tobera de vacío la aspira hacia el depósito de rechazo.",
          params: [
            ["Criterio de rechazo", "Cápsula entera alojada en molde superior"],
            ["Transporte de rechazo", "Succión neumática a ciclón lateral"],
            ["Sincronía de varillas", "Subida centrada con torreta detenida"]
          ],
          adjustments: [
            "Verificar con volante manual que las 25 varillas entren centradas sin rozar las paredes del molde superior."
          ]
        },
        {
          id: "est8",
          num: "E8",
          name: "Cierre y bloqueo de cápsulas (Locking)",
          pos: [-1.75, 2.35, -1.65],
          cam: { theta: -2.3, phi: 1.02, radius: 8.2, target: [-1.5, 1.9, -1.4] },
          systemMatch: "Cierre",
          summary: "Una vez que la leva retrae el segmento inferior alineándolo bajo el superior, los 25 pines inferiores empujan el cuerpo lleno dentro de la tapa contra la placa superior de contrapresión hasta el clic de bloqueo.",
          params: [
            ["Longitud cerrada", "Ajustable por tornillo micrométrico superior según formato (#00–#5)"],
            ["Alineación segmentos", "Retorno radial en Est. 7/8 guiado por seguidor de leva"],
            ["Defecto típico", "Telescopado o abolladura por exceso de carrera"]
          ],
          adjustments: [
            "Calibrar la altura de la placa superior y la carrera del pin inferior midiendo con pie de rey la longitud total cerrada."
          ]
        },
        {
          id: "est9-10",
          num: "E9–E10",
          name: "Expulsión de producto terminado y limpieza de moldes",
          pos: [-2.45, 2.2, 0.1],
          cam: { theta: -1.45, phi: 1.05, radius: 8.2, target: [-2.1, 1.8, 0.0] },
          systemMatch: "Descarga",
          summary: "En Est. 9 los 25 pines de expulsión elevan las cápsulas cerradas hacia la rampa de salida; en Est. 10 agujas de aire comprimido y succión limpian los alojamientos del molde antes de iniciar el nuevo ciclo.",
          params: [
            ["Presión soplado Est. 10", "0.3 a 0.4 MPa (aire seco y filtrado)"],
            ["Aspiración colector", "Filtro de mangas con sacudido periódico"],
            ["Salida", "Rampa inoxidable hacia pulidora / detector de metales"]
          ],
          adjustments: [
            "Limpiar diariamente los 25 alojamientos de cada segmento con alcohol isopropílico."
          ]
        },
        {
          id: "drive-cam",
          num: "LEVAS",
          name: "Caja indexadora y árbol de levas inferior (Interior)",
          pos: [0, 0.65, 0],
          cam: { theta: 0.55, phi: 1.32, radius: 9.5, target: [0, 0.6, 0] },
          systemMatch: "Transmisión",
          summary: "En el pedestal inferior se alojan el motor principal con variador, la caja indexadora intermitente de 10 estaciones y las levas de ranura que accionan las columnas de tamping, separación, cierre y expulsión.",
          params: [
            ["Indexador principal", "Indexador de levas en baño de aceite"],
            ["Seguidores de leva", "Rodamientos de agujas serie KR / CF"],
            ["Modo Rayos X", "Activa 'Rayos X' arriba para ver las levas girando bajo la mesa"]
          ],
          adjustments: [
            "Revisar nivel de aceite en mirilla del indexador y engrasar pistas de levas interiores según tabla del manual."
          ]
        }
      ]
    },

    njp1200: {
      title: "Gemelo 3D · Encapsuladora Automática NJP-1200C",
      subtitle: "Torreta intermitente de 10 estaciones · 9 orificios por molde · 1200 cáps/min · Polvo (5 apisonados) + Pellets (Est. 3)",
      cycleLabel: "Ciclo de indexado NJP-1200C (0°–360° · 10 estaciones)",
      defaultCam: { theta: 0.68, phi: 1.05, radius: 12.5, target: [0, 1.15, 0] },
      telemetry: [
        { k: "Capacidad", v: "1200 cáps/min", unit: "9 agujeros/molde" },
        { k: "Vacío Est. 1", v: "-0.04 MPa", unit: "rango -0.02 a -0.06 MPa" },
        { k: "Potencia total", v: "5.75 kW", unit: "380/220 V · 900 kg" },
        { k: "Dimensiones", v: "1020×860×1970 mm", unit: "compacta" }
      ],
      stations: [
        {
          id: "n12-est1",
          num: "E1–E2",
          name: "Estación 1 y 2 · Alimentación, vacío y bajada de molde inferior",
          pos: [-1.85, 2.2, 1.35],
          cam: { theta: -0.6, phi: 1.04, radius: 7.8, target: [-1.6, 1.8, 1.1] },
          systemMatch: "Estación 1",
          summary: "Alimenta 9 cápsulas por golpe desde la tolva superior, las orienta con horquilla vertical/horizontal, separa cuerpo y tapa con vacío (-0.02 a -0.06 MPa) y en Est. 2 la leva desciende y saca radialmente el molde inferior.",
          params: [
            ["Orificios por segmento", "9 alojamientos en línea"],
            ["Vacío separación", "-0.02 a -0.06 MPa"],
            ["Concentricidad moldes", "Calibrada con galga patrón en las 10 estaciones"]
          ],
          adjustments: [
            "Ajustar tope de horquilla horizontal para que la cápsula caiga con el cuerpo hacia abajo (Manual p.8-12).",
            "Nivelar zapata de vacío a ≤ 0.05 mm de la cara inferior del segmento."
          ]
        },
        {
          id: "n12-est3",
          num: "E3",
          name: "Estación 3 · Dosificador de pellets de liberación lenta",
          pos: [0.4, 2.35, 2.1],
          cam: { theta: 0.2, phi: 1.0, radius: 7.6, target: [0.3, 1.9, 1.8] },
          systemMatch: "Estación 3",
          summary: "Permite dosificar microgránulos o pellets de liberación controlada directamente en los 9 cuerpos abiertos antes de la estación de polvo.",
          params: [
            ["Dosificación", "Corredera volumétrica de 9 cámaras"],
            ["Aplicación", "Pellets / microgránulos opcionales (Manual p.6)"]
          ],
          adjustments: [
            "Calibrar volumen de cámara de la corredera según peso objetivo de pellets."
          ]
        },
        {
          id: "n12-est4",
          num: "E4–E5",
          name: "Estación 4 · Anillo dosificador y 5 punzones de tamping",
          pos: [2.05, 2.45, 0.15],
          cam: { theta: 1.2, phi: 1.02, radius: 8.2, target: [1.8, 1.9, 0.1] },
          systemMatch: "Estación 4",
          summary: "Los 5 brazos de tamping (9 punzones cada uno) compactan el polvo en el disco dosificador y en la 5.ª estación transfieren el taco compacto a los 9 cuerpos de cápsula.",
          params: [
            ["Compresiones", "5 etapas progresivas (Tamping 1 a 5)"],
            ["Holgura disco / base", "0.05 a 0.10 mm (Manual p.19)"],
            ["Sensor de polvo", "Capacitivo en cámara dosificadora"]
          ],
          adjustments: [
            "Ajustar penetración de los 5 soportes graduados según densidad del polvo (Manual p.16-22)."
          ]
        },
        {
          id: "n12-est6-8",
          num: "E6–E8",
          name: "Estación 6, 7 y 8 · Rechazo, retorno de molde y cierre",
          pos: [-0.9, 2.25, -1.9],
          cam: { theta: 2.6, phi: 1.02, radius: 8.0, target: [-0.7, 1.8, -1.6] },
          systemMatch: "Estación 6",
          summary: "Est. 6 aspira cápsulas no abiertas; Est. 7 retrae el molde inferior alineándolo con el superior; Est. 8 bloquea cuerpo y tapa a la longitud cerrada exacta.",
          params: [
            ["Rechazo Est. 6", "Peine de 9 pines + cabezal de succión superior"],
            ["Cierre Est. 8", "Placa superior de contrapresión con ajuste micrométrico"]
          ],
          adjustments: [
            "Ajustar longitud cerrada en Est. 8 con micrómetro para evitar cápsulas sueltas o abolladas (Manual p.24-25)."
          ]
        },
        {
          id: "n12-est9-10",
          num: "E9–E10",
          name: "Estación 9 y 10 · Expulsión de cápsulas y limpieza por vacío",
          pos: [-2.15, 2.15, -0.15],
          cam: { theta: -1.5, phi: 1.05, radius: 7.8, target: [-1.8, 1.8, -0.1] },
          systemMatch: "Estación 9",
          summary: "Est. 9 empuja las 9 cápsulas llenas hacia la rampa de salida; Est. 10 limpia los orificios del molde por soplado y aspiración.",
          params: [
            ["Expulsión Est. 9", "Peine de 9 pasadores verticales"],
            ["Limpieza Est. 10", "Cabezal de soplado y aspiración de polvo residual"]
          ],
          adjustments: [
            "Verificar alineación de los 9 pasadores de expulsión y limpieza con calibre."
          ]
        },
        {
          id: "n12-cam",
          num: "INDEX",
          name: "Indexador RU100 y árbol de levas inferior",
          pos: [0, 0.6, 0],
          cam: { theta: 0.6, phi: 1.32, radius: 8.8, target: [0, 0.6, 0] },
          systemMatch: "Transmisión",
          summary: "Motor principal de 1.5 kW con variador e indexador de levas en baño de aceite bajo la mesa principal.",
          params: [
            ["Motor principal", "1.5 kW con variador de frecuencia"],
            ["Lubricación", "Baño de aceite en caja indexadora + grasa en levas"]
          ],
          adjustments: [
            "Comprobar tensión de correa trapezoidal y nivel de aceite en mirilla (Manual p.29-35)."
          ]
        }
      ]
    },

    gkf2600: {
      title: "Gemelo 3D · Encapsuladora Modular Bosch GKF 2600",
      subtitle: "Carrusel de 12 estaciones en 2 líneas paralelas (18 cáps/ciclo) · Servotecnología PacDrive + Seguridad ABB PLUTO",
      cycleLabel: "Ciclo carrusel Bosch 12 estaciones (0°–360° · paso 30°)",
      defaultCam: { theta: 0.65, phi: 1.04, radius: 14.2, target: [0, 1.25, 0] },
      telemetry: [
        { k: "Formato carrusel", v: "12 est. · 2×9 orif.", unit: "18 cáps/golpe" },
        { k: "Presión tamping", v: "2.4 bar", unit: "manómetros 0–6 bar" },
        { k: "Sensores cierre", v: "IFS 5036 OK", unit: "contrasoporte Est. 9" },
        { k: "Seguridad PLUTO", v: "Canal 1/2 OK", unit: "ABB Safety Bus" }
      ],
      stations: [
        {
          id: "gkf-est1-2",
          num: "E1–E2",
          name: "Estaciones 1 y 2 · Alimentación doble línea, vacío y ASB",
          pos: [-2.2, 2.4, 1.6],
          cam: { theta: -0.65, phi: 1.02, radius: 8.8, target: [-1.9, 1.9, 1.3] },
          systemMatch: "Alimentación",
          summary: "Dos estaciones de alimentación en paralelo (18 cápsulas por golpe) con rectificación, separación por vacío y sistema ASB de despeje automático de atascos por soplado.",
          params: [
            ["Disposición", "2 hileras paralelas × 9 agujeros = 18 cápsulas/ciclo"],
            ["Sistema ASB", "Soplado automático ante cápsula defectuosa en guía"],
            ["Sensores nivel", "Capacitivos Omron E2K en tolvas de cápsulas"]
          ],
          adjustments: [
            "Calibrar la zapata de vacío inferior y verificar el disparo neumático del ASB."
          ]
        },
        {
          id: "gkf-est5",
          num: "E5",
          name: "Estación 5 · Cámara de dosificación por compactación (5 campanas)",
          pos: [2.45, 2.55, 0.4],
          cam: { theta: 1.15, phi: 1.0, radius: 9.0, target: [2.1, 2.0, 0.3] },
          systemMatch: "Dosificación",
          summary: "Módulo intercambiable Bosch de polvo con disco dosificador, 5 estaciones de apisonado con campanas neumáticas y manómetros individuales (0–6 bar) y rascador de precisión.",
          params: [
            ["Compresiones", "5 estaciones de punzones dobles (2×9) con amortiguación neumática"],
            ["Instrumentación", "Manómetros WIKA 0–6 bar (213.53.050) por estación"],
            ["Sensores tolva", "Capacitivos KAS-80-26/113 en cámara de producto"]
          ],
          adjustments: [
            "Ajustar altura de disco dosificador, presión de las 5 campanas neumáticas y penetración de punzones."
          ]
        },
        {
          id: "gkf-est6-8",
          num: "E6 / E8",
          name: "Estaciones 6 y 8 · Módulos de pellets y microcomprimidos",
          pos: [1.3, 2.35, -2.1],
          cam: { theta: 2.35, phi: 1.02, radius: 8.6, target: [1.1, 1.9, -1.8] },
          systemMatch: "Pellets",
          summary: "Estaciones modulares para dosificación combinada de pellets, microtabletas o líquidos junto con las estaciones ópticas/inductivas de control 3, 4 y 7.",
          params: [
            ["Estaciones ópticas", "Est. 3, 4 y 7 supervisan apertura y presencia"],
            ["Rechazo Est. 7", "Aspiración selectiva de cápsulas no abiertas"]
          ],
          adjustments: [
            "Sincronizar correderas de pellets y verificar limpieza de sensores ópticos."
          ]
        },
        {
          id: "gkf-est9",
          num: "E9",
          name: "Estación 9 · Cierre con contrasoporte y sensores IFS 5036",
          pos: [-1.45, 2.4, -2.0],
          cam: { theta: -2.4, phi: 1.02, radius: 8.4, target: [-1.2, 1.9, -1.7] },
          systemMatch: "Cierre",
          summary: "Cierra las 18 cápsulas simultáneamente mediante barras inferiores y cabezal de contrasoporte superior vigilado por dos sensores inductivos ifm IFS 5036.",
          params: [
            ["Sensores contrasoporte", "2× ifm IFS 5036 (P/N 8-075-888-799)"],
            ["Barras de cierre", "Doble hilera con ajuste fino de longitud cerrada"]
          ],
          adjustments: [
            "Verificar distancia de conmutación de los sensores IFS 5036 y cota de cierre según formato."
          ]
        },
        {
          id: "gkf-est10-12",
          num: "E10–E12",
          name: "Estaciones 10, 11 y 12 · Expulsión monocápsula y limpieza",
          pos: [-2.45, 2.25, -0.15],
          cam: { theta: -1.5, phi: 1.04, radius: 8.4, target: [-2.1, 1.8, -0.1] },
          systemMatch: "Expulsión",
          summary: "Est. 10 y 11 expulsan individualmente las cápsulas conformes hacia producción y las defectuosas al canal de descarte; Est. 12 limpia los segmentos de 18 orificios.",
          params: [
            ["Clasificación", "Expulsión selectiva monocápsula (OK / Rechazo)"],
            ["Limpieza Est. 12", "Soplado y aspiración de moldes superiores e inferiores"]
          ],
          adjustments: [
            "Inspeccionar desgaste de casquillos guía igus XFM y seguidores de leva INA KR/PAE."
          ]
        },
        {
          id: "gkf-servo",
          num: "SERVO",
          name: "Accionamiento PacDrive, levas inferiores y PLC PLUTO",
          pos: [0, 0.65, 0],
          cam: { theta: 0.5, phi: 1.3, radius: 10.0, target: [0, 0.65, 0] },
          systemMatch: "Accionamiento",
          summary: "Bancada inferior hermética con servomotores ELAU/Schneider PacDrive, reductores planetarios Neugart PLN, encoder absoluto SICK AFS60 y bus de seguridad ABB PLUTO.",
          params: [
            ["Servocontrol", "ELAU / Schneider SH + Neugart PLN + SICK AFS60"],
            ["Seguridad", "PLC ABB PLUTO con interruptores de puerta TV10S"]
          ],
          adjustments: [
            "Ejecutar kit de mantenimiento preventivo Bosch por horas de servicio (2.500 h / 5.000 h)."
          ]
        }
      ]
    },

    ms235: {
      title: "Gemelo 3D · Ensobradora Schmucker / Marchesini MS235 (S4220003)",
      subtitle: "Bustinatrice de 4 soldaduras en 6 pistas · PLC Beckhoff EtherCAT · Planchas soldantes KM44.4 + SSR A41.2/A41.6",
      cycleLabel: "Fase de ciclo MS235 — Fasatura (0°–360°)",
      defaultCam: { theta: 0.55, phi: 1.08, radius: 15.5, target: [0, 1.1, 0] },
      telemetry: [
        { k: "Contactor KM44.4", v: "CERRADO (IN2=1)", unit: "hilo 4407 / 4408 OK" },
        { k: "Temp. Planchas S4M141", v: "165 °C / 165 °C", unit: "SSR A41.2 · A41.6" },
        { k: "Formato activo", v: "6 pistas", unit: "corte + soldadura" },
        { k: "PLC Beckhoff", v: "EtherCAT RUN", unit: "5× Lenze i550" }
      ],
      stations: [
        {
          id: "ms-bobina",
          num: "G1",
          name: "Portabobinas neumático y guía de banda (S4A26100410)",
          pos: [-4.8, 1.35, 0],
          cam: { theta: -0.35, phi: 1.08, radius: 8.5, target: [-4.5, 1.2, 0] },
          systemMatch: "Desbobinado",
          summary: "Soporta la bobina madre de complejo termosellable (Ø máx. 500 mm, núcleo Ø74 mm), controla la tensión mediante balancín y centra el film con el actuador lineal y los sensores B29.8 / B29.9.",
          params: [
            ["Grupo Schmucker", "S4A26100410 (Calibrado p.86-105)"],
            ["Sensores de bobina", "Fin bobina B29.7 · Centrado B29.8 / B29.9 · Balancín B29.2"],
            ["Freno / Tracción", "Motor controlado por variador Lenze i550"]
          ],
          adjustments: [
            "Calibrar posición de los sensores de borde B29.8/B29.9 y presión de bloqueo neumático del eje."
          ]
        },
        {
          id: "ms-fotocelula",
          num: "G2",
          name: "Fotocélula de taca y corte longitudinal 6 pistas (S4M951 / S4M121)",
          pos: [-2.3, 1.65, 0],
          cam: { theta: 0.1, phi: 1.05, radius: 8.0, target: [-2.2, 1.5, 0] },
          systemMatch: "Corte longitudinal",
          summary: "La fotocélula S4M95100110 (B30.2) lee la marca impresa para sincronizar el paso, mientras las cuchillas circulares S4M12100110 dividen la banda y la pliegan en 6 pistas paralelas.",
          params: [
            ["Fotocélula registro", "S4M95100110 — Fasatura p.29 (sensor B30.2)"],
            ["Corte longitudinal", "Grupo S4M12100110 — rulos de arrastre y láminas (p.65-70)"],
            ["Pistas", "6 canales simétricos"]
          ],
          adjustments: [
            "Regular ángulo de fase de lectura de fotocélula (p.29) y presión de los rulos de arrastre S4M121."
          ]
        },
        {
          id: "ms-dosif",
          num: "G3",
          name: "Dosificación volumétrica: Doble casete y estrella (S4G715 / S4G722)",
          pos: [-0.2, 2.85, 0],
          cam: { theta: 0.35, phi: 0.98, radius: 8.8, target: [-0.1, 2.4, 0] },
          systemMatch: "Dosificación",
          summary: "Doble tolva superior de acero inoxidable que alimenta el dosificador volumétrico de doble casete oscilante (S4G71500260) y estrella rotativa (S4G72200150) descargando por 6 tubos de caída.",
          params: [
            ["Doble casete", "Grupo S4G71500260 (Calibrado p.123-134)"],
            ["Estrella rotativa", "Grupo S4G72200150 (Calibrado p.135-149)"],
            ["Sensores nivel", "Capacitivos en tolvas de producto"]
          ],
          adjustments: [
            "Ajustar carrera telescópica de los casetes según peso por sobre y verificar fase de descarga antes del cierre de planchas."
          ]
        },
        {
          id: "ms-planchas",
          num: "G4",
          name: "Planchas soldantes y circuito térmico KM44.4 (S4M14100110)",
          pos: [0.3, 1.45, 0],
          cam: { theta: 0.45, phi: 1.08, radius: 7.8, target: [0.3, 1.35, 0] },
          systemMatch: "Soldadura",
          summary: "Las mordazas calefactoras derecha e izquierda sellan los 4 lados de los 6 sobres simultáneamente. Habilitadas por el contactor general KM44.4 (bobina hilo 4407 desde A12.9 OUT11, confirmación hilo 4408 a A12.4 IN2) y moduladas por los SSR Omron A41.2 y A41.6.",
          params: [
            ["Grupo mecánico", "S4M14100110 — Fasatura p.28 · Mantenimiento p.71-81"],
            ["Habilitación potencia", "Contactor KM44.4 + magnetotérmicos F19.1 / F19A.1 (10 A)"],
            ["Control térmico", "SSR A41.2 (plancha der.) y A41.6 (plancha izq.) + relés corriente K19.x"],
            ["Presión cierre", "Membrana neumática con filtro regulador"]
          ],
          adjustments: [
            "Engrasar guías de planchas con grasa de alta temperatura (p.71-75) y verificar paralelismo de mordazas con papel carbón."
          ]
        },
        {
          id: "ms-cuchillas",
          num: "G5",
          name: "Grupo cuchillas de corte transversal (S4A19100720)",
          pos: [2.1, 1.15, 0],
          cam: { theta: 0.55, phi: 1.1, radius: 7.5, target: [2.0, 1.1, 0] },
          systemMatch: "Corte transversal",
          summary: "Cuchilla rotativa y contracuchilla fija que cortan transversalmente la tira de 6 sobres en fase exacta con la apertura de las planchas soldantes.",
          params: [
            ["Grupo Schmucker", "S4A19100720 — Fasatura p.31-32 · Mantenimiento p.106-114"],
            ["Sincronización", "Corte centrado en la franja horizontal entre sobres"]
          ],
          adjustments: [
            "Ajustar interferencia de corte entre lama móvil y fija (p.108-112) y verificar ángulo de fasatura (p.31)."
          ]
        },
        {
          id: "ms-salida",
          num: "G6",
          name: "Cinta de salida de 6 pistas y transferencia (S4A19100110)",
          pos: [4.3, 0.9, 0],
          cam: { theta: 0.75, phi: 1.08, radius: 8.2, target: [4.0, 0.9, 0] },
          systemMatch: "Transporte",
          summary: "Recibe las filas de 6 sobres cortados y los transporta ordenadamente hacia la salida de línea o estuchadora.",
          params: [
            ["Grupo Schmucker", "S4A19100110 (Calibrado p.115-122)"],
            ["Accionamiento", "Banda motorizada con ajuste de tensión en rodillo de reenvío"]
          ],
          adjustments: [
            "Centrar y tensar la banda transportadora (p.118) e inspeccionar desgaste de guías separadoras de pistas."
          ]
        }
      ]
    },

    integra320: {
      title: "Gemelo 3D · Línea Blíster Robotizada Marchesini Integra 320 (M4160012)",
      subtitle: "Termoformado en balconada · Alimentación planetaria · Visión SEA Vision Harlequin · Sellado · Corte y Tambor Cicloidal",
      cycleLabel: "Ciclo sincronizado de línea Integra 320 (0°–360°)",
      defaultCam: { theta: 0.45, phi: 1.08, radius: 17.5, target: [0, 1.1, 0] },
      telemetry: [
        { k: "Precalentamiento", v: "128 °C", unit: "placas M4M30101640" },
        { k: "Termoformado", v: "6.0 bar", unit: "estación M4M35101810" },
        { k: "Visión Harlequin", v: "99.8% OK", unit: "cámara SEA Vision" },
        { k: "Sellado aluminio", v: "195 °C", unit: "estación M4M60101840" }
      ],
      stations: [
        {
          id: "int-pvc",
          num: "S1",
          name: "Desbobinador PVC y mesa de empalme por vacío (M4M251 / M4A223)",
          pos: [-6.0, 1.1, 0],
          cam: { theta: -0.35, phi: 1.08, radius: 8.5, target: [-5.6, 1.1, 0] },
          systemMatch: "Desbobinado",
          summary: "Alimenta la bobina de film formador PVC/PVDC (M4M25100930) con reserva de bucle y mesa de empalme con regleta de vacío (M4A22300630) para cambio rápido de bobina.",
          params: [
            ["Desbobinador PVC", "Grupo M4M25100930 (Calibrado p.89)"],
            ["Mesa de unión", "Grupo M4A22300630 con sujeción por vacío (p.107)"]
          ],
          adjustments: [
            "Verificar cierre de válvulas de vacío en la mesa de empalme y tensión del brazo bailarín."
          ]
        },
        {
          id: "int-formado",
          num: "S2",
          name: "Precalentamiento y estación de termoformado (M4M301 / M4M351)",
          pos: [-3.4, 1.45, 0],
          cam: { theta: -0.15, phi: 1.05, radius: 8.2, target: [-3.3, 1.35, 0] },
          systemMatch: "Termoformado",
          summary: "Las placas calefactoras M4M30101640 ablandan el PVC y el molde M4M35101810 conforma los alvéolos tridimensionales mediante aire comprimido y enfriamiento por agua glicolada.",
          params: [
            ["Precalentamiento", "M4M30101640 (p.43-49) — apertura automática en parada"],
            ["Termoformado", "M4M35101810 (p.50-56) — soplado + refrigeración Chiller #4"],
            ["Arrastre film", "Pinza servocontrolada M4M70100750"]
          ],
          adjustments: [
            "Calibrar puesta en fase de apertura de molde y pinza de arrastre (manual de Calibrado p.21-30)."
          ]
        },
        {
          id: "int-carga",
          num: "S3",
          name: "Alimentador vibratorio y cepillos planetarios (M4G062 / M4G121)",
          pos: [-0.8, 2.1, 0],
          cam: { theta: 0.1, phi: 1.0, radius: 8.2, target: [-0.8, 1.7, 0] },
          systemMatch: "Alimentación",
          summary: "La tolva y plato vibratorio M4G06200970 dosifican el producto hacia la cajonera donde los cepillos rotativos y planetarios M4G12101050 alojan los comprimidos/cápsulas en cada alvéolo.",
          params: [
            ["Vibrador producto", "M4G06200970 (p.118-121)"],
            ["Cepillos carga", "M4G12101050 (p.122-128) — altura regulable sobre la banda"]
          ],
          adjustments: [
            "Ajustar altura de los cepillos a 0.5–1.0 mm sobre la banda formada sin rayar el PVC."
          ]
        },
        {
          id: "int-vision-sellado",
          num: "S4",
          name: "Visión SEA Vision Harlequin y sellado con aluminio (M4A523 / M4M601)",
          pos: [1.7, 1.9, 0],
          cam: { theta: 0.3, phi: 1.02, radius: 8.2, target: [1.7, 1.6, 0] },
          systemMatch: "Sellado",
          summary: "La cámara SEA Vision Harlequin (M4A52302020) inspecciona el 100% de los alvéolos; acto seguido el desbobinador superior entrega el aluminio de cobertura y la estación M4M60101840 lo termosella contra el PVC.",
          params: [
            ["Inspección óptica", "SEA Vision Harlequin M4A52302020 (color, forma y presencia)"],
            ["Estación sellado", "M4M60101840 (p.57-68) — presión neumática y control térmico"],
            ["Desbobinador Alu", "M4M45101130 con centrado de impresión"]
          ],
          adjustments: [
            "Verificar uniformidad del moleteado de sellado con prueba de vacío (azul de metileno) y centrado de cámara."
          ]
        },
        {
          id: "int-corte",
          num: "S5",
          name: "Perforación, codificado y troquelado de blísters (M4M65100380)",
          pos: [4.0, 1.5, 0],
          cam: { theta: 0.5, phi: 1.05, radius: 8.2, target: [3.9, 1.4, 0] },
          systemMatch: "Troquelado",
          summary: "Realiza el precorte (perforación), estampado en frío de lote/vencimiento y el troquelado final del contorno del blíster, enviando el esqueleto sobrante a la cizalla/rebobinador de recorte.",
          params: [
            ["Grupo troquelado", "M4M65100380 (Calibrado p.69-82)"],
            ["Estampado y precorte", "Integrado en línea antes del punzón de corte"]
          ],
          adjustments: [
            "Centrar el paso del troquel respecto a los alvéolos con el volante de registro longitudinal."
          ]
        },
        {
          id: "int-tambor",
          num: "S6",
          name: "Tambor cicloidal de vacío y cinta dentada a Robocombi (M4M182 / M4G751)",
          pos: [6.0, 1.35, 0],
          cam: { theta: 0.75, phi: 1.05, radius: 8.5, target: [5.7, 1.25, 0] },
          systemMatch: "Transferencia",
          summary: "El tambor rotativo cicloidal con ventosas de vacío (M4M18200910) extrae los blísters buenos del troquel (descartando los rechazados por Harlequin) y los deposita en los casilleros de la cinta dentada M4G75102320 hacia la estuchadora.",
          params: [
            ["Tambor transferencia", "M4M18200910 — puesta en fase con troquel y cinta (p.28-35)"],
            ["Cinta salida", "M4G75102320 sincronizada con Robocombi / MA260"]
          ],
          adjustments: [
            "Calibrar fase del brazo de ventosas del tambor cicloidal en el punto de toma (troquel) y depósito (cinta)."
          ]
        }
      ]
    },

    blister3: {
      title: "Gemelo 3D · Línea Blíster Uhlmann B 1240 (Máquina 0591812)",
      subtitle: "31 componentes en 5.12 m · Moldeo por levas · Cepillo inclinado · Impresora UV HAPA easyFLEX · Control TouchControl",
      cycleLabel: "Ciclo árbol electrónico de levas Uhlmann B 1240 (0°–360°)",
      defaultCam: { theta: 0.42, phi: 1.08, radius: 18.5, target: [0, 1.15, 0] },
      telemetry: [
        { k: "Calentamiento +062", v: "132 °C", unit: "2 zonas Pt100" },
        { k: "Impresora HAPA +095", v: "UV Lista", unit: "easyFLEX en línea" },
        { k: "Sellado +100 / +110", v: "200 °C / 16 °C", unit: "Chiller 14–18 °C" },
        { k: "Seguridad PLUTO +994", v: "OK", unit: "17 A · 220 V · 60 Hz" }
      ],
      stations: [
        {
          id: "b3-unwind",
          num: "P16–P9",
          name: "Desbobinadora de moldeo (+053), péndulo y calentamiento (+062/+065)",
          pos: [-6.4, 1.3, 0],
          cam: { theta: -0.35, phi: 1.06, radius: 8.8, target: [-6.0, 1.25, 0] },
          systemMatch: "Desbobinado",
          summary: "La bobina de PVC/Alu (pos. 16, Ø máx. 600 mm) pasa por el péndulo compensador (pos. 13), detección de empalme (+053) y entra a la estación de calentamiento de 2 zonas con apertura neumática (+062/+065, pos. 9).",
          params: [
            ["Ancho máx. lámina", "155 mm · Profundidad de moldeo máx. 12 mm"],
            ["Sensores temperatura", "Sondas Pt100 en placas superiores e inferiores (+062)"],
            ["Protección térmica", "Apertura automática de placas al detener la máquina (+065)"]
          ],
          adjustments: [
            "Limpiar placas de calentamiento con cepillo de latón en caliente y verificar presión de contacto."
          ]
        },
        {
          id: "b3-forming",
          num: "P8–P6",
          name: "Estación de moldeo por levas (+070), pinza servo (+080) y bucle (P6)",
          pos: [-3.5, 1.45, 0],
          cam: { theta: -0.15, phi: 1.04, radius: 8.5, target: [-3.4, 1.35, 0] },
          systemMatch: "Moldeo",
          summary: "La mesa inferior accionada por leva cierra el molde (+070, pos. 8) y conforma los alvéolos con preestiramiento y aire comprimido (6–8 bar). La pinza servo (+080, pos. 7) indexa la banda hacia el bucle compensador (pos. 6).",
          params: [
            ["Accionamiento moldeo", "Leva mecánica + servomotor principal (+023)"],
            ["Avance post-moldeo", "Servoaccionamiento +080 con péndulo de compensación +119"],
            ["Detección de fisuras", "Control de poros/pinholes en film +321"]
          ],
          adjustments: [
            "Lubricar columnas y leva de la estación de moldeo cada 250 h con Klüberlub BE 41-542 / Klübersynth UH1 14-151."
          ]
        },
        {
          id: "b3-feeding",
          num: "P3–P5",
          name: "Canal vibrador (+520), alimentación por cepillado (+530) y cámara (+302)",
          pos: [-0.6, 2.0, 0],
          cam: { theta: 0.1, phi: 1.0, radius: 8.5, target: [-0.6, 1.65, 0] },
          systemMatch: "Alimentación",
          summary: "El producto baja desde la tolva (pos. 2) por el canal vibrador (+520, pos. 3) hacia la caja de cepillado (+530, pos. 4), pasa por el cepillo inclinado (+590, pos. 5), la tapa de seguridad (+322) y la cámara VisioChrom Micro (+302, pos. 29).",
          params: [
            ["Alimentación", "Caja de cepillos +530/531 + cepillo rotativo inclinado +590"],
            ["Control de llenado", "Cámara VisioChrom Micro +302 con luz transmitida"],
            ["Seguridad", "Tapa de seguridad +322 antes del sellado"]
          ],
          adjustments: [
            "Ajustar amplitud del canal vibrador y altura de los rodillos cepillo sobre la pista guía."
          ]
        },
        {
          id: "b3-hapa",
          num: "P28–P26",
          name: "Desbobinadora de cubierta (+090), Impresora UV HAPA easyFLEX (+095) y registro (+330)",
          pos: [1.8, 2.6, 0],
          cam: { theta: 0.28, phi: 0.96, radius: 8.8, target: [1.8, 2.1, 0] },
          systemMatch: "Impresión",
          summary: "Desbobina el aluminio de cubierta (pos. 28), lo imprime en línea mediante el módulo flexográfico UV HAPA easyFLEX (+095, pos. 27) y controla la presencia y el centrado de imagen de impresión (+330 / +334, pos. 26).",
          params: [
            ["Impresora en línea", "HAPA easyFLEX UV (+095, hoja 58 del plano)"],
            ["Control de taco", "Estiramiento de lámina para registro de impresión (+330)"]
          ],
          adjustments: [
            "Limpiar rodillo entintador y cliché del módulo HAPA easyFLEX y verificar curado UV."
          ]
        },
        {
          id: "b3-sealing",
          num: "P25–P23",
          name: "Estación de sellado por levas (+100), refrigeración (+110) y avance (+082)",
          pos: [3.2, 1.5, 0],
          cam: { theta: 0.42, phi: 1.05, radius: 8.4, target: [3.1, 1.4, 0] },
          systemMatch: "Sellado",
          summary: "Sella la lámina de cubierta contra la banda moldeada mediante prensa accionada por leva (+100, pos. 25), enfría la unión en la estación refrigerada por agua (+110, pos. 24) y tracciona con la pinza servo post-sellado (+082, pos. 23).",
          params: [
            ["Agua refrigeración", "Entrada 14–18 °C · 3–4 bar (+810 conexión chiller)"],
            ["Avance post-sellado", "Servomotor +082 sincronizado con el paso de troquelado"]
          ],
          adjustments: [
            "Verificar huella de sellado con papel carbón y caudal de agua fría en placas +110."
          ]
        },
        {
          id: "b3-punching",
          num: "P22–P18",
          name: "Perforación (P22), troquelado (+140), bobinadora recorte (+170) y expulsión (+150/+160)",
          pos: [5.8, 1.5, 0],
          cam: { theta: 0.68, phi: 1.05, radius: 8.8, target: [5.5, 1.4, 0] },
          systemMatch: "Troquelado",
          summary: "Perfora (pos. 22) y troquela los blísters (+140, pos. 21), enrolla el recorte sobrante arriba (+170, pos. 19), transfiere los blísters con el mecanismo de inmersión por vacío, descarta los no conformes (+150, pos. 20) y entrega los buenos a la cinta (+160, pos. 18).",
          params: [
            ["Troquelado", "Prensa de corte +140 hasta 400 golpes/min"],
            ["Rechazo y transferencia", "Compuerta de rechazo +150 y pala mecánica +160"]
          ],
          adjustments: [
            "Inspeccionar filo de punzón y matriz de corte y verificar vacío en ventosas del mecanismo de inmersión."
          ]
        }
      ]
    },

    controlsa114rl: {
      title: "Gemelo 3D · Puerta Rápida Autorreparable CONTROLSA 114 RL",
      subtitle: "Lona PVC M2 con botones laterales · Recuperadores blancos de reinserción · Barrera + Célula de tambor · Cuadro binario S1–S5",
      cycleLabel: "Ciclo de maniobra apertura / espera / cierre (0°–360°)",
      defaultCam: { theta: 0.48, phi: 1.12, radius: 11.5, target: [0, 1.8, 0] },
      hasImpactSim: true,
      telemetry: [
        { k: "Entradas S1..S5", v: "0 1 0 0 0", unit: "S2 ABRIR activo · S5=0" },
        { k: "Barrera seguridad", v: "HAZ LIBRE", unit: "emisor/receptor OK" },
        { k: "Célula de tambor", v: "NORMAL", unit: "desenrollado vigilado" },
        { k: "Estado de guías", v: "EN GUÍA (OK)", unit: "botones en perfil C" }
      ],
      stations: [
        {
          id: "ctrl-lona",
          num: "S1",
          name: "Lona de PVC, botones laterales y guías autorreparables",
          pos: [0, 1.7, 0.15],
          cam: { theta: 0.35, phi: 1.12, radius: 7.5, target: [0, 1.6, 0] },
          systemMatch: "Lona",
          summary: "Lona flexible de poliéster recubierto de PVC con mirilla transparente y botones guía laterales. Ante un impacto de carretilla o sobrepresión, los botones salen del perfil sin romper la lona.",
          params: [
            ["Resistencia al viento", "Clase 2 (norma EN 13241-1)"],
            ["Guiado lateral", "Botones remachados en ambos bordes de la lona"],
            ["Falla por falta de botones", "La puerta sube y baja constantemente (apartado 6.4 p.19)"]
          ],
          adjustments: [
            "Revisión trimestral de los botones laterales bajando la lona en modo manual (Manual p.15).",
            "Reponer de inmediato si faltan botones consecutivos."
          ]
        },
        {
          id: "ctrl-recuperador",
          num: "S2",
          name: "Recuperadores superiores de plástico blanco (Reinserción)",
          pos: [-1.45, 3.15, 0.2],
          cam: { theta: -0.45, phi: 0.98, radius: 6.2, target: [-1.2, 2.9, 0] },
          systemMatch: "Lona",
          summary: "Piezas blancas situadas en la boca superior de las guías laterales. Cuando la lona se sale tras un golpe y se sube hasta arriba, los recuperadores reintroducen automáticamente los botones dentro de ambas guías.",
          params: [
            ["Ubicación", "Parte superior de ambos montantes laterales (Manual p.17-18)"],
            ["Procedimiento 6.2", "Pasar a modo manual (SUBIR+BAJAR 3 s), subir por encima del recuperador y reencauzar"]
          ],
          adjustments: [
            "Pulsa el botón 'Simular Impacto y Autorreparación' en la barra superior para ver en 3D cómo sale la lona y vuelve a entrar por los recuperadores blancos."
          ]
        },
        {
          id: "ctrl-seguridad",
          num: "S3",
          name: "Barrera fotoeléctrica inferior y célula de tambor superior",
          pos: [1.45, 0.65, 0.25],
          cam: { theta: 0.55, phi: 1.18, radius: 6.8, target: [0.5, 0.9, 0] },
          systemMatch: "Seguridad",
          summary: "Doble protección: la barrera fotoeléctrica a ~30 cm del suelo impide el cierre o invierte el giro si se corta el haz; la célula de tambor arriba supervisa todo el descenso y revierte si la lona encuentra un obstáculo al desenrollar.",
          params: [
            ["Barrera inferior", "Emisor/receptor enfrentados en los montantes (Manual p.16)"],
            ["Célula de tambor", "Detecta holgura o atasco de la lona dentro del cajón superior"]
          ],
          adjustments: [
            "Limpiar trimestralmente los ópticos con paño seco y probar la inversión de giro sujetando suavemente la bolsa inferior (p.15-16)."
          ]
        },
        {
          id: "ctrl-motor",
          num: "S4",
          name: "Tambor de enrollado, correa y motor con freno desbloqueable",
          pos: [1.55, 3.55, 0],
          cam: { theta: 0.65, phi: 0.95, radius: 6.8, target: [1.1, 3.3, 0] },
          systemMatch: "Motorización",
          summary: "El motor mueve el tambor superior mediante correa de transmisión. En caso de corte eléctrico el freno bloquea el motor; se abre retirando la tapa frontal, accionando la palanca de desbloqueo y girando con llave Allen (apartado 7, p.21).",
          params: [
            ["Transmisión", "Motorreductor con freno + correa dentada al tambor"],
            ["Respaldo opcional", "SAI con cambio de baterías cada 2 años (p.14)"]
          ],
          adjustments: [
            "Revisión anual de tensión de correa, desgaste de poleas y palanca de desbloqueo de freno."
          ]
        },
        {
          id: "ctrl-cuadro",
          num: "S5",
          name: "Cuadro eléctrico Controlsa, botonera y diagnóstico binario (S1–S5)",
          pos: [2.15, 1.55, 0.35],
          cam: { theta: 0.7, phi: 1.1, radius: 6.2, target: [1.9, 1.5, 0.2] },
          systemMatch: "Control eléctrico",
          summary: "Armario con placa electrónica Controlsa, magnetotérmico de 10 A, seta de emergencia y pantalla de diagnóstico MENU → ESTADO → ENTRADAS (S1 Paro, S2 Abrir, S3 Doble altura, S4 Bajar cadena, S5 Paro emergencia).",
          params: [
            ["Lectura binaria", "S1=Paro · S2=Abrir · S3=Doble altura · S4=Cadena · S5=Emergencia"],
            ["Ejemplo bloqueo 10001", "S1=1 y S5=1 → Paro de emergencia enclavado (Manual p.12-13)"]
          ],
          adjustments: [
            "Para salir de modo manual: pulsar y desenclavar la seta de emergencia como rearme (Manual p.7)."
          ]
        }
      ]
    },

    fx30prostep: {
      title: "Gemelo 3D · Impresora Flexográfica Tecnomaco FX30 PRO STEP (19021)",
      subtitle: "Impresión rotativa de aluminio de blíster · Anilox cerámico R2 + Racla B3 · Cirel servo R3 (M3) · Secado V1 (2 kW)",
      cycleLabel: "Ciclo rotativo de impresión y secado (0°–360°)",
      defaultCam: { theta: 0.52, phi: 1.06, radius: 11.2, target: [0, 1.15, 0] },
      telemetry: [
        { k: "Velocidad banda", v: "24 m/min", unit: "máx. 30 m/min" },
        { k: "Ancho folia Alu", v: "280 mm máx.", unit: "freno P6 regulado" },
        { k: "Secador V1", v: "2.0 kW ON", unit: "aire caliente 85 °C" },
        { k: "Servo Cirel M3", v: "SINCRONIZADO", unit: "paso Ø47/60/47.9 mm" }
      ],
      stations: [
        {
          id: "fx-e1",
          num: "E1 / P6",
          name: "Eje desbobinador E1, freno mecánico P6 y rodillos guía R6",
          pos: [-2.4, 0.95, 0.4],
          cam: { theta: -0.45, phi: 1.08, radius: 6.8, target: [-2.1, 0.95, 0.3] },
          systemMatch: "Desbobinador E1",
          summary: "Soporta el rollo de aluminio virgen en el mandril expansible E1 y regula la tensión de desbobinado con el pomo de freno mecánico P6 antes de subir por los rodillos guía R6.",
          params: [
            ["Diámetro máx. bobina", "300 mm · Ancho máx. 280 mm"],
            ["Regulación tensión", "Freno mecánico P6 ajustable según espesor de folia"]
          ],
          adjustments: [
            "Regular el freno P6 para evitar arrugas o rotura del aluminio durante el arranque (Manual p.48-52)."
          ]
        },
        {
          id: "fx-ink",
          num: "B1–R1–R2",
          name: "Cubeta de tinta B1, rodillo goma R1, anilox cerámico R2 y racla B3",
          pos: [-0.85, 1.85, 0.45],
          cam: { theta: -0.2, phi: 1.0, radius: 6.5, target: [-0.7, 1.75, 0.3] },
          systemMatch: "Grupo entintador",
          summary: "El rodillo engomado R1 toma tinta de la bandeja B1 y alimenta al rodillo cerámico inciso (anilox) R2; la cuchilla racla B3 con tornillos de bronce raspa el exceso dejando solo la tinta de los alveolos.",
          params: [
            ["Ajuste R1–R2", "Pomos micrométricos P1 y P5"],
            ["Dosificación", "Rodillo cerámico anilox R2 + cuchilla racla B3"]
          ],
          adjustments: [
            "Limpiar el anilox R2 y la cubeta B1 inmediatamente al terminar el lote para evitar que la tinta seque en las celdas (Manual p.82)."
          ]
        },
        {
          id: "fx-cirel",
          num: "R3 / R4",
          name: "Cilindro portacliché Cirel R3 (Servo M3) y rodillo contraste R4",
          pos: [0.15, 1.85, 0.45],
          cam: { theta: 0.15, phi: 1.0, radius: 6.5, target: [0.1, 1.75, 0.3] },
          systemMatch: "Grupo de impresión",
          summary: "El servomotor paso a paso M3 mueve el cilindro portacliché R3 (diámetros 47, 60 o 47.9 mm) transfiriendo la imagen al aluminio que apoya sobre el rodillo de contraste R4.",
          params: [
            ["Cilindros R3", "Ø 47 mm, Ø 60 mm y Ø 47.9 mm intercambiables"],
            ["Ajuste de presión", "Pomos superiores P2 y P3 (contacto 'beso' flexo)"]
          ],
          adjustments: [
            "Ajustar en paralelo los pomos P2 y P3 hasta lograr impresión nítida en ambos bordes sin aplastar el fotopolímero (Manual p.60-66)."
          ]
        },
        {
          id: "fx-dryer",
          num: "V1 / R5",
          name: "Termoventilador de secado V1 (2 kW) y rodillo tractor R5 (M1)",
          pos: [1.45, 2.1, 0.35],
          cam: { theta: 0.45, phi: 1.0, radius: 6.8, target: [1.3, 1.85, 0.2] },
          systemMatch: "Secado",
          summary: "La banda recién impresa atraviesa la campana de aire caliente del termoventilador V1 (2 kW) y es arrastrada a velocidad constante por el rodillo tractor R5 (motor brushless M1 y pomo P4).",
          params: [
            ["Potencia secador V1", "2.0 kW con soplador integrado"],
            ["Tracción banda", "Motor brushless M1 + rodillo presor R5 (pomo P4)"]
          ],
          adjustments: [
            "Verificar que el flujo de aire caliente V1 seque completamente la tinta antes de tocar el rodillo tractor R5."
          ]
        },
        {
          id: "fx-e2",
          num: "E2 / Q1",
          name: "Eje rebobinador brushless E2 (M2) y panel táctil HMI Q1",
          pos: [2.2, 0.95, 0.4],
          cam: { theta: 0.65, phi: 1.08, radius: 6.8, target: [1.9, 1.05, 0.3] },
          systemMatch: "Tracción principal",
          summary: "El motor brushless M2 rebobina la bobina de aluminio ya impresa y seca en el eje E2 con par controlado desde la pantalla táctil Q1.",
          params: [
            ["Accionamiento E2", "Motor brushless M2 sincronizado con M1"],
            ["Interfaz operador", "Pantalla táctil HMI Q1 + seta de emergencia Q2"]
          ],
          adjustments: [
            "Alinear los conos del eje rebobinador E2 con el desbobinador E1 para obtener un rollo telescópicamente recto."
          ]
        }
      ]
    },

    stickpack: {
      title: "Gemelo 3D · Envasadora Stick Pack Schmucker S3240005",
      subtitle: "Multipista vertical para líquidos · Tubos formadores S3M141 · Bombas con cabezal silicona · Orugas S3A191 · Mordazas S3M142",
      cycleLabel: "Ciclo de formado, dosificación y corte Stick Pack (0°–360°)",
      defaultCam: { theta: 0.58, phi: 1.08, radius: 13.5, target: [0, 1.6, 0] },
      telemetry: [
        { k: "Soldadura vertical", v: "172 °C", unit: "barras S3M14100320" },
        { k: "Soldadura horiz.", v: "168 °C", unit: "mordazas S3M14200320" },
        { k: "Dosif. líquidos", v: "SIN GOTEO", unit: "cilindros S3A92301220" },
        { k: "Sensores stick", v: "6/6 OK", unit: "ópticos S3A92400910" }
      ],
      stations: [
        {
          id: "sp-unwind",
          num: "G1",
          name: "Portabobina S3A26100420 y cuchillas longitudinales S3A26101910",
          pos: [0, 2.5, -1.6],
          cam: { theta: 2.5, phi: 1.05, radius: 8.5, target: [0, 2.2, -1.2] },
          systemMatch: "Desbobinado",
          summary: "Desbobina el film laminado, regula la tensión con balancín y corta longitudinalmente la banda madre en tiras individuales mediante el grupo de cuchillas S3A26101910.",
          params: [
            ["Grupo portabobina", "S3A26100420 (Calibrado p.87-101)"],
            ["Corte longitudinal", "S3A26101910 (Calibrado p.102-109)"]
          ],
          adjustments: [
            "Verificar separación transversal entre portacuchillas S3A26101910 para que el solape de cada stick sea simétrico."
          ]
        },
        {
          id: "sp-pumps",
          num: "G2",
          name: "Cabezales de bombas de líquido y cilindros antigoteo (S3A92301220)",
          pos: [0, 3.45, 0.2],
          cam: { theta: 0.4, phi: 0.95, radius: 7.8, target: [0, 3.1, 0.1] },
          systemMatch: "Dosificación",
          summary: "Bombas sanitarias superiores con mangueras de silicona que inyectan la dosis exacta de líquido por dentro de los tubos formadores; los cilindros neumáticos S3A92301220 cierran la boquilla al instante para no contaminar la soldadura.",
          params: [
            ["Grupo boquillas", "S3A92301220 (Calibrado p.111-114)"],
            ["Elemento dosificador", "Tubo de silicona calibrado en cabezal de bomba"]
          ],
          adjustments: [
            "Reemplazar tubos de silicona y juntas de los cilindros de cierre S3A92301220 según procedimiento de págs. 111-114."
          ]
        },
        {
          id: "sp-vertical",
          num: "G3",
          name: "Tubos formadores, soldadura vertical (S3M14100320) y enfriamiento (S3A92300310)",
          pos: [0, 2.35, 0.55],
          cam: { theta: 0.35, phi: 1.05, radius: 7.5, target: [0, 2.2, 0.4] },
          systemMatch: "Tubos formadores",
          summary: "Los cuellos conformadores envuelven cada tira en torno a su tubo metálico; las barras calefactoras verticales S3M14100320 sellan la aleta longitudinal y los tubos S3A92300310 la enfrían con aire.",
          params: [
            ["Soldadura vertical", "S3M14100320 (Calibrado p.69-77)"],
            ["Enfriamiento stick", "S3A92300310 (Calibrado p.110)"]
          ],
          adjustments: [
            "Engrasar articulaciones y regular paralelismo y presión de apoyo de las barras verticales contra los tubos formadores."
          ]
        },
        {
          id: "sp-orugas",
          num: "G4",
          name: "Orugas de arrastre (S3A19100330) y mordazas horizontales (S3M14200320)",
          pos: [0, 1.35, 0.65],
          cam: { theta: 0.45, phi: 1.1, radius: 7.5, target: [0, 1.3, 0.4] },
          systemMatch: "Orugas de arrastre",
          summary: "Las correas dentadas tipo oruga S3A19100330 arrastran los tubos formados hacia abajo, mientras las mordazas horizontales S3M14200320 cierran en fase para sellar el fondo y la cabeza de cada stick.",
          params: [
            ["Orugas de arrastre", "S3A19100330 (Calibrado p.85-86)"],
            ["Soldadura horizontal", "S3M14200320 — Fasatura p.26 · Mantenimiento p.78-84"]
          ],
          adjustments: [
            "Regular cierre de las orugas S3A19100330 para arrastrar sin aplastar el tubo y verificar puesta en fase de mordazas (p.26)."
          ]
        },
        {
          id: "sp-corte",
          num: "G5",
          name: "Cuchillas transversales (S3M11100110) y sensores de presencia (S3A92400910)",
          pos: [0, 0.65, 0.75],
          cam: { theta: 0.55, phi: 1.15, radius: 7.2, target: [0, 0.7, 0.5] },
          systemMatch: "Cuchillas de corte",
          summary: "El grupo de cuchillas S3M11100110 separa individualmente los sticks terminados y las fotocélulas S3A92400910 confirman la salida de cada pista hacia la rampa de descarga.",
          params: [
            ["Grupo cuchillas", "S3M11100110 — Fasatura p.25 · Mantenimiento p.62-68"],
            ["Sensores presencia", "S3A92400910 (Calibrado p.115)"]
          ],
          adjustments: [
            "Calibrar fase de corte (p.25) para que la cuchilla actúe en el centro de la soldadura horizontal."
          ]
        }
      ]
    },

    hdgc400: {
      title: "Gemelo 3D · Lecho Fluido Hüttlin HDGC 400 (P&ID 15-19552-V-06)",
      subtitle: "Plato toroidal Diskjet · 3 Sellos inflables · Bombas Watson-Marlow 313X2A ATEX · 18 Filtros Herding con Blowback",
      cycleLabel: "Ciclo fluidización, atomización tangencial y pulso Herding (0°–360°)",
      defaultCam: { theta: 0.62, phi: 1.06, radius: 14.5, target: [0, 1.85, 0] },
      telemetry: [
        { k: "Caudal aire UMA", v: "4200 m³/h · 62 °C", unit: "Sipart PS2 6DR5010" },
        { k: "Sellos inflables", v: "3/3 SELLADOS", unit: "Bowl · Diskjet · Filtro" },
        { k: "Bombas ATEX", v: "Watson-Marlow ON", unit: "cabezal 313X2A" },
        { k: "Filtros Herding", v: "ΔP 11.4 mbar", unit: "18× D00T030185" }
      ],
      stations: [
        {
          id: "hd-ahu",
          num: "P1",
          name: "UMA de aire de proceso y posicionadores Siemens Sipart PS2",
          pos: [-3.3, 1.35, 0],
          cam: { theta: -0.5, phi: 1.08, radius: 8.5, target: [-2.8, 1.35, 0] },
          systemMatch: "UMA de proceso",
          summary: "Acondiciona el aire de entrada (prefiltración, deshumidificación, calentamiento con válvulas moduladas por posicionadores electropneumáticos Siemens Sipart PS2 6DR5010 y filtración terminal) hacia el plenum inferior.",
          params: [
            ["Posicionadores", "Siemens Sipart PS2 6DR5010-0NG00-0AA0 (cód. interno 740678)"],
            ["Plano de referencia", "P&ID 15-19552-V-06"]
          ],
          adjustments: [
            "Verificar carrera 0–100% de las válvulas con autocalibración Sipart PS2 y diferencial de prefiltros."
          ]
        },
        {
          id: "hd-diskjet",
          num: "P2",
          name: "Plenum inferior, plato toroidal Diskjet y sello inflable D00T019236",
          pos: [0, 0.75, 0],
          cam: { theta: 0.45, phi: 1.18, radius: 7.8, target: [0, 0.85, 0] },
          systemMatch: "Plato Diskjet",
          summary: "El aire caliente entra por las ranuras inclinadas del plato Diskjet imprimando un giro helicoidal toroidal al lecho de producto. La brida inferior se hermetiza con el sello neumático inflable D00T019236.",
          params: [
            ["Sello inflable Diskjet", "P/N D00T019236 — Cód. interno 741841"],
            ["Principio Hüttlin", "Corriente tangencial sin zonas muertas en el fondo"]
          ],
          adjustments: [
            "Inspeccionar el labio del sello inflable D00T019236 y limpiar las ranuras del plato Diskjet tras cada campaña."
          ]
        },
        {
          id: "hd-bowl",
          num: "P3",
          name: "Recipiente de producto (Bowl), mirilla y sello inflable D00T019028",
          pos: [0, 1.75, 0],
          cam: { theta: 0.35, phi: 1.08, radius: 7.8, target: [0, 1.75, 0] },
          systemMatch: "Plato Diskjet",
          summary: "Cuerpo cónico de acero inoxidable donde circula la nube fluidizada de gránulos/pellets visible por la mirilla frontal. Sellado contra la cámara de expansión mediante el sello inflable D00T019028.",
          params: [
            ["Sello inflable Bowl", "P/N D00T019028 — Cód. interno 741840"],
            ["Sonda producto", "Termopar PT100 inmerso en el lecho fluido"]
          ],
          adjustments: [
            "Activa el modo 'Rayos X' arriba para ver en el interior el vórtice toroidal de partículas y los conos de atomización."
          ]
        },
        {
          id: "hd-spray",
          num: "P4",
          name: "Bombas peristálticas Watson-Marlow 313X2A ATEX y boquillas tangenciales",
          pos: [2.5, 1.15, 1.1],
          cam: { theta: 0.95, phi: 1.1, radius: 7.8, target: [1.5, 1.2, 0.6] },
          systemMatch: "Sistema de atomización",
          summary: "El carro de dosificación bombea la solución aglutinante o de recubrimiento mediante cabezales peristálticos Watson-Marlow 313X2A ATEX hacia las boquillas tangenciales montadas en el plato Diskjet.",
          params: [
            ["Cabezal peristáltico", "Watson-Marlow 313X2A ATEX — Cód. interno 741848 (2 uds.)"],
            ["Boquillas Hüttlin", "Tres componentes: líquido + aire de atomización + microclima"]
          ],
          adjustments: [
            "Verificar presión de aire de atomización y microclima y estado de las mangueras de silicona en los cabezales 313X2A."
          ]
        },
        {
          id: "hd-herding",
          num: "P5",
          name: "Cámara superior con 18 filtros Herding (D00T030185) y pulsos Blowback",
          pos: [0, 3.25, 0],
          cam: { theta: 0.5, phi: 0.96, radius: 8.5, target: [0, 3.1, 0] },
          systemMatch: "Cámara de filtros",
          summary: "Aloja 18 elementos filtrantes rígidos de placas sinterizadas Herding (D00T030185) sellados con el sello de carcasa D00T017051. Un colector superior dispara pulsos de aire comprimido (blowback) que devuelven los finos al lecho.",
          params: [
            ["Elementos filtrantes", "18× Herding P/N D00T030185 — Cód. interno 741856"],
            ["Sello carcasa filtro", "P/N D00T017051 — Cód. interno 741838"],
            ["O-Ring filtro", "P/N D00T017635 (Vitón FDA) — Cód. interno 741842"]
          ],
          adjustments: [
            "Vigilar la presión diferencial ΔP de filtros y el disparo secuencial de las válvulas de pulso."
          ]
        }
      ]
    },

    ml642: {
      title: "Gemelo 3D · Llenadora-Tapadora de Frascos Marchesini ML642 (M6210005)",
      subtitle: "Dosificación por jeringas y válvulas cerámicas (M6A717) · Celdas de carga · Vibradores REOVIB · Tapado subtapa y roscado (M6A195 / M6A291)",
      cycleLabel: "Ciclo rotativo e indexado de llenado y tapado ML642 (0°–360°)",
      defaultCam: { theta: 0.48, phi: 1.06, radius: 14.8, target: [0, 1.35, 0] },
      telemetry: [
        { k: "PLC Beckhoff", v: "TwinSAFE OK", unit: "EL6910 · EM6210005" },
        { k: "Dosificación", v: "Celdas OK", unit: "jeringas M6G91401111" },
        { k: "Vibradores REO", v: "3/3 ACTIVOS", unit: "A73.1 · A73.6 · A83.1" },
        { k: "Red neumática", v: "6.0 bar · 215 NL/m", unit: "esquema WM6210005" }
      ],
      stations: [
        {
          id: "ml-infeed",
          num: "S1",
          name: "Cinta de entrada, sinfín separador y fotocélulas Wenglor (B30.1–B30.5)",
          pos: [-4.2, 1.15, 0.3],
          cam: { theta: -0.38, phi: 1.08, radius: 8.2, target: [-3.8, 1.1, 0.2] },
          systemMatch: "Transporte",
          summary: "Recibe los frascos vacíos por la cinta transportadora accionada por variador Lenze i550 (A27.1), los separa al paso mediante sinfín y estrella de entrada y verifica presencia con fotocélulas de espejo Wenglor P1KL002 (B30.1, B30.3, B30.5).",
          params: [
            ["Variador cinta", "Lenze i550 0.55 kW (A27.1 / A41.1) + tarjeta seguridad SM PU01 (cód. 732402094)"],
            ["Detección frascos", "Fotocélulas Wenglor P1KL002 (Marchesini E32029824214 · plano Z-ZDIST.3 p.89)"]
          ],
          adjustments: [
            "Ajustar guías laterales de entrada al diámetro del frasco y verificar alineación de las fotocélulas Wenglor P1KL002."
          ]
        },
        {
          id: "ml-dosing",
          num: "S2",
          name: "Tina con mezclador, jeringas M6G91401111, válvulas cerámicas M6A71700810 y celdas de carga",
          pos: [-1.6, 1.85, 0],
          cam: { theta: -0.1, phi: 1.02, radius: 8.0, target: [-1.5, 1.55, 0] },
          systemMatch: "Dosificación",
          summary: "La tina superior de acero inoxidable con agitador alimenta el grupo de jeringas dosificadoras (M6G91401111) y válvulas cerámicas rotativas (M6A71700810). Las cánulas descienden dentro de los frascos controladas por motor de mando y motor de regulación con verificación ponderal por celdas de carga.",
          params: [
            ["Válvula cerámica", "Marchesini 120100061 (grupo M6A71700810, p.149) — Cód. almacén 724004053"],
            ["Empaque válvula", "Marchesini 120100141 (p.149) — Cód. almacén 724004054"],
            ["Empaque jeringa", "Marchesini R39081221A (jeringa M6G91401111, p.194) — Cód. almacén 724004055"],
            ["Tenaza cánula", "Soporte 01620R010 (cód. 724004050) + Pin A015002804 (cód. 724004051)"]
          ],
          adjustments: [
            "Inspeccionar estanqueidad de empaques R39081221A y 120100141 para evitar goteo y calibrar cero de celdas de carga."
          ]
        },
        {
          id: "ml-subcap",
          num: "S3",
          name: "Alimentación vibratoria REOVIB (A73.1/A73.6) y cabezal de preroscado / subtapa (M6A17102244)",
          pos: [0.6, 1.95, -0.2],
          cam: { theta: 0.18, phi: 1.0, radius: 8.2, target: [0.5, 1.6, -0.1] },
          systemMatch: "Tapado",
          summary: "Las tazas vibratorias controladas por tarjetas REO REOVIB MFS 268 orientan las subtapas/goteros y las entregan al cabezal de preroscado e inserción (grupo M6A17102244).",
          params: [
            ["Control vibradores", "Tarjetas REO REOVIB MFS 268 (A73.1, A73.6, A83.1 — plano Z-ZDIST.2 p.88)"],
            ["Cabezal preroscado", "Grupo M6A17102244 · Tapa cabezal 120220062 (p.93) — Cód. almacén 724004049"],
            ["Sensores inductivos", "Selet B60122P0C5 PNP (B18.2, B18.4, B25.8, B25.9) — Cód. almacén 724001324"]
          ],
          adjustments: [
            "Regular amplitud de vibración en REOVIB MFS 268 para flujo continuo sin atascos en la rampa de caída."
          ]
        },
        {
          id: "ml-capping",
          num: "S4",
          name: "Torreta de tapado roscado (M6A29101161) y mandriles de torque de 3 patas (M6A19501012)",
          pos: [2.4, 1.75, 0.2],
          cam: { theta: 0.42, phi: 1.04, radius: 7.8, target: [2.2, 1.5, 0.1] },
          systemMatch: "Tapado",
          summary: "El cabezal de roscado (M6A29101161) montado sobre cojinetes de rodillos INA NKIS50 toma la tapa mediante el mandril de 3 patas (M6A19501012) y aplica el par de cierre programado a cada frasco.",
          params: [
            ["Mandril 3 patas", "Marchesini M6A19501012 (p.99) — Cód. almacén 721604002"],
            ["Pinza de torque", "Pinza de mandril de torque — Cód. almacén 724004017"],
            ["Tapa cabezal roscado", "Marchesini 155180141 (grupo M6A29101161, p.124) — Cód. almacén 724004052"],
            ["Rodamiento cabezal", "Cojinete INA NKIS50 (C280006082, p.79/123) — Cód. almacén 724001378"]
          ],
          adjustments: [
            "Verificar estado de las pinzas de torque (724004017), holgura del cojinete NKIS50 (724001378) y par de apriete con torquímetro."
          ]
        },
        {
          id: "ml-outfeed",
          num: "S5",
          name: "Expulsión de rechazos, salida y control Beckhoff EtherCAT / SIMATIC IPC677D",
          pos: [4.3, 1.35, 0.3],
          cam: { theta: 0.68, phi: 1.08, radius: 8.4, target: [3.8, 1.25, 0.2] },
          systemMatch: "Eléctrico",
          summary: "Separa automáticamente los frascos con peso fuera de tolerancia o sin tapa/subtapa (fotocélula B85.1) y entrega los frascos conformes. Gobernada por PLC Beckhoff con seguridad TwinSAFE EL6910 y Panel PC Siemens SIMATIC IPC677D.",
          params: [
            ["Seguridad PLC", "Módulo Beckhoff EL6910-0000 TwinSAFE (Z-ZDIST.1 p.87)"],
            ["HMI / Panel PC", "Siemens SIMATIC IPC677D 6AV7260-3DM42-0XX6 (Z-ZDIST.2 p.88)"],
            ["Esquemas oficiales", "Eléctrico EM6210005 (97 hojas) · Neumático WM6210005 (26 hojas)"]
          ],
          adjustments: [
            "Comprobar desvío de frascos rechazados con prueba de reto y verificar presión de red de 6.0 bar ±0.5 en unidad FRL."
          ]
        }
      ]
    }
  };

  // --------------------------------------------------------------------------
  //  ESTADO DEL MOTOR 3D ACTIVO
  // --------------------------------------------------------------------------
  let activeCtx = null;

  function disposeActiveTwin() {
    if (!activeCtx) return;
    if (activeCtx.rafId) cancelAnimationFrame(activeCtx.rafId);
    if (activeCtx.ro) activeCtx.ro.disconnect();
    if (activeCtx.renderer) {
      activeCtx.renderer.dispose();
    }
    activeCtx = null;
  }

  // --------------------------------------------------------------------------
  //  DIAGRAMAS DE FASE / LEVAS (0°–360°) Y MATRIZ PLC I/O INDUSTRIAL
  // --------------------------------------------------------------------------
  function getCamTimingZones(arch, spec) {
    const custom = {
      njp3500: [
        { stIdx: 0, label: "Alimentación y Apertura por Vacío", start: 0, end: 72, color: "#0284c7" },
        { stIdx: 1, label: "Apisonado en 5 Golpes (Tamping) y Transferencia", start: 72, end: 180, color: "#2563eb" },
        { stIdx: 2, label: "Rechazo de No Abiertas (Est. 6–7)", start: 180, end: 252, color: "#7c3aed" },
        { stIdx: 3, label: "Cierre / Bloqueo Lc (Est. 8)", start: 252, end: 288, color: "#059669" },
        { stIdx: 4, label: "Expulsión y Soplado (Est. 9–10)", start: 288, end: 360, color: "#d97706" }
      ],
      njp1200: [
        { stIdx: 0, label: "Alimentación y Vacío SK-1.5B", start: 0, end: 72, color: "#0284c7" },
        { stIdx: 1, label: "Dosificador Pellets (Est. 3)", start: 72, end: 108, color: "#0d9488" },
        { stIdx: 2, label: "Disco Dosificador y 5 Punzones", start: 108, end: 216, color: "#2563eb" },
        { stIdx: 3, label: "Rechazo Est. 6 y Cierre Est. 8", start: 216, end: 288, color: "#059669" },
        { stIdx: 4, label: "Expulsión Est. 9 y Aspiración Est. 10", start: 288, end: 360, color: "#d97706" }
      ],
      gkf2600: [
        { stIdx: 0, label: "Rectificado y Apertura Vacío (Est. 1–2)", start: 0, end: 60, color: "#0284c7" },
        { stIdx: 1, label: "Est. 3 ASB 100% / Microtabletas", start: 60, end: 110, color: "#0d9488" },
        { stIdx: 2, label: "Est. 5 Prensado de Tacos (5 Barras)", start: 110, end: 210, color: "#2563eb" },
        { stIdx: 3, label: "Est. 8–9 Purga y Cierre Servo", start: 210, end: 290, color: "#059669" },
        { stIdx: 4, label: "Est. 10–12 Expulsión, Clasificación KKE y Limpieza", start: 290, end: 360, color: "#d97706" }
      ],
      ms235: [
        { stIdx: 0, label: "Desbobinado y Lazo (G1)", start: 0, end: 90, color: "#0284c7" },
        { stIdx: 1, label: "Corte Multipista y Doblado (G2)", start: 40, end: 140, color: "#0d9488" },
        { stIdx: 2, label: "Descarga Casete Oscilante y Estrella (G3)", start: 95, end: 210, color: "#2563eb" },
        { stIdx: 3, label: "Cierre Planchas Soldantes KM44.4 (G4)", start: 185, end: 305, color: "#dc2626" },
        { stIdx: 4, label: "Corte Transversal y Salida 6 Pistas (G5–G6)", start: 295, end: 360, color: "#059669" }
      ],
      integra320: [
        { stIdx: 0, label: "Desbobinado PVC y Empalme Vacío (S1)", start: 0, end: 60, color: "#0284c7" },
        { stIdx: 1, label: "Precalentamiento y Termoformado 6 bar (S2)", start: 45, end: 145, color: "#ea580c" },
        { stIdx: 2, label: "Alimentación Planetaria de Producto (S3)", start: 120, end: 215, color: "#2563eb" },
        { stIdx: 3, label: "Visión Harlequin + Sellado Alu 195 °C (S4)", start: 195, end: 285, color: "#dc2626" },
        { stIdx: 4, label: "Troquelado y Tambor Cicloidal Vacío (S5–S6)", start: 270, end: 360, color: "#059669" }
      ],
      blister3: [
        { stIdx: 0, label: "Desbobinado +053 y Calentamiento +062", start: 0, end: 65, color: "#ea580c" },
        { stIdx: 1, label: "Moldeo por Leva +070 y Pinza +080", start: 55, end: 145, color: "#0284c7" },
        { stIdx: 2, label: "Cepillado +530/+590 y VisioChrom +302", start: 130, end: 210, color: "#2563eb" },
        { stIdx: 3, label: "HAPA easyFLEX UV +095 y Sellado +100", start: 195, end: 290, color: "#dc2626" },
        { stIdx: 4, label: "Troquelado +140, Rechazo +150 y Pala +160", start: 275, end: 360, color: "#059669" }
      ],
      controlsa114rl: [
        { stIdx: 0, label: "Orden Apertura S2=1 y Ascenso Rápido", start: 0, end: 110, color: "#0284c7" },
        { stIdx: 1, label: "Paso por Recuperadores Superiores", start: 90, end: 165, color: "#0d9488" },
        { stIdx: 2, label: "Temporización Abierta + Vigilancia Barrera", start: 165, end: 245, color: "#2563eb" },
        { stIdx: 3, label: "Descenso Vigilado por Célula de Tambor", start: 245, end: 335, color: "#d97706" },
        { stIdx: 4, label: "Cierre Hermético y Reposo S1..S5", start: 335, end: 360, color: "#059669" }
      ],
      fx30prostep: [
        { stIdx: 0, label: "Desbobinado E1 y Freno P6", start: 0, end: 80, color: "#0284c7" },
        { stIdx: 1, label: "Entintado Cubeta B1 -> R1 -> Anilox R2 + Racla B3", start: 65, end: 175, color: "#7c3aed" },
        { stIdx: 2, label: "Transferencia Cliché Cirel R3 (Servo M3) / R4", start: 155, end: 255, color: "#2563eb" },
        { stIdx: 3, label: "Secado Aire Caliente V1 (2 kW) y Tractor R5", start: 235, end: 315, color: "#ea580c" },
        { stIdx: 4, label: "Rebobinado Brushless E2 (M2)", start: 295, end: 360, color: "#059669" }
      ],
      stickpack: [
        { stIdx: 0, label: "Desbobinado y Corte Longitudinal 6 Pistas (G1)", start: 0, end: 80, color: "#0284c7" },
        { stIdx: 1, label: "Conformado Tubular y Soldadura Vertical (G3)", start: 65, end: 175, color: "#ea580c" },
        { stIdx: 2, label: "Inyección Bombas Líquido + Antigoteo (G2)", start: 150, end: 250, color: "#2563eb" },
        { stIdx: 3, label: "Arrastre Orugas y Mordazas Horizontales (G4)", start: 230, end: 315, color: "#dc2626" },
        { stIdx: 4, label: "Cuchillas Transversales y Descarga (G5)", start: 300, end: 360, color: "#059669" }
      ],
      hdgc400: [
        { stIdx: 0, label: "Acondicionamiento Aire UMA + Sipart PS2 (P1)", start: 0, end: 85, color: "#0284c7" },
        { stIdx: 1, label: "Fluidización Toroidal Plato Diskjet (P2)", start: 65, end: 175, color: "#0d9488" },
        { stIdx: 2, label: "Suspensión en Bowl y Control PT100 (P3)", start: 145, end: 245, color: "#2563eb" },
        { stIdx: 3, label: "Atomización Tangencial Watson-Marlow ATEX (P4)", start: 215, end: 305, color: "#7c3aed" },
        { stIdx: 4, label: "Filtración Herding D00T030185 + Pulso Blowback (P5)", start: 285, end: 360, color: "#d97706" }
      ],
      ml642: [
        { stIdx: 0, label: "Entrada Frascos y Sinfín Separador (S1)", start: 0, end: 75, color: "#0284c7" },
        { stIdx: 1, label: "Inmersión Cánulas y Dosificación Cerámica (S2)", start: 60, end: 175, color: "#2563eb" },
        { stIdx: 2, label: "Alimentación REOVIB e Inserción Subtapa (S3)", start: 160, end: 245, color: "#0d9488" },
        { stIdx: 3, label: "Roscado con Mandril 3 Patas y Torque (S4)", start: 230, end: 315, color: "#7c3aed" },
        { stIdx: 4, label: "Control Peso, Rechazo y Salida (S5)", start: 300, end: 360, color: "#059669" }
      ]
    };
    return custom[arch] || spec.stations.map((st, i, arr) => ({
      stIdx: i,
      label: st.name.split("·")[0].trim(),
      start: Math.round((i / arr.length) * 360),
      end: Math.round(((i + 1) / arr.length) * 360),
      color: "#2563eb"
    }));
  }

  function getPlcSignalsForArchetype(arch) {
    const signals = {
      njp3500: [
        { tag: "INV-M1", desc: "Variador motor principal (3.7 kW)", addr: "AI0 / DO0", val: "48.2 Hz · 9.4 A" },
        { tag: "VAC-PT1", desc: "Transductor vacío apertura cápsulas", addr: "PI-101", val: "-0.048 MPa" },
        { tag: "CAP-B1", desc: "Sensor capacitivo nivel tolva cápsulas", addr: "DI-04", val: "NIVEL OK (1)" },
        { tag: "POW-B2", desc: "Sensor nivel polvo en anillo dosificador", addr: "DI-05", val: "CARGADO (1)" },
        { tag: "CAM-ENC", desc: "Encoder absoluto eje indexador 83DS", addr: "HSC-0", val: "SINCRONIZADO" },
        { tag: "DOOR-S1", desc: "Circuito enclavamiento guardas acrílicas", addr: "SAFE-IN", val: "CERRADO (1)" }
      ],
      njp1200: [
        { tag: "VFD-U1", desc: "Inversor principal NJP-1200C", addr: "MODBUS-1", val: "1200 cáp/min" },
        { tag: "SK-1.5B", desc: "Bomba vacío anillo líquido", addr: "KM2 / PT1", val: "-0.045 MPa" },
        { tag: "PEL-S3", desc: "Compuerta dosificadora pellets Est. 3", addr: "DO-06", val: "HABILITADA" },
        { tag: "TAMP-P5", desc: "Torreta 5 punzones apisonado", addr: "ENC-360", val: "FASE OK" },
        { tag: "DUST-M3", desc: "Aspirador ciclónico Est. 10", addr: "KM3", val: "21.3 m³/h ON" },
        { tag: "EMG-S0", desc: "Paro emergencia y puertas", addr: "DI-00", val: "ARMADO (1)" }
      ],
      gkf2600: [
        { tag: "SRV-M01", desc: "Servomotor principal Bosch Rexroth", addr: "SERCOS-1", val: "200 ciclos/min" },
        { tag: "ASB-B12", desc: "Sensores ópticos antibloqueo Est. 3", addr: "DI-12..29", val: "18/18 LIBRES" },
        { tag: "TAMP-SG", desc: "Celdas galgas fuerza compactación Est. 5", addr: "AI-01..05", val: "145 N (Nominal)" },
        { tag: "KKE-NET", desc: "Balanza control en proceso KKE", addr: "ETH-KKE", val: "CV 0.82% OK" },
        { tag: "VAC-B24", desc: "Vacío zapata separación cápsulas", addr: "AI-08", val: "-620 mbar" },
        { tag: "AIR-P1", desc: "Presión neumática red FRL", addr: "DI-31", val: "6.4 bar OK" }
      ],
      ms235: [
        { tag: "KM44.4", desc: "Contactor potencia planchas soldantes", addr: "A12.9 OUT11", val: "CERRADO (4407)" },
        { tag: "CONF-4408", desc: "Confirmación contactor KM44.4 a PLC", addr: "A12.4 IN2", val: "HIGH (24 VDC)" },
        { tag: "SSR-A41.2", desc: "Relé estado sólido plancha derecha", addr: "PID-T1", val: "175.0 °C (PWM)" },
        { tag: "SSR-A41.6", desc: "Relé estado sólido plancha izquierda", addr: "PID-T2", val: "175.2 °C (PWM)" },
        { tag: "K19.1", desc: "Relé monitoreo corriente resistencias", addr: "A12.4 IN6", val: "CORRIENTE OK" },
        { tag: "ENC-FAS", desc: "Árbol virtual fasatura cuchilla/planchas", addr: "AXIS-01", val: "SINCRONIZADO" }
      ],
      integra320: [
        { tag: "TC-M4M301", desc: "Placas precalentamiento PVC", addr: "AI-TC1", val: "128.0 °C" },
        { tag: "FORM-P2", desc: "Presión soplado termoformado M4M351", addr: "PI-204", val: "6.0 bar" },
        { tag: "SEA-VIS", desc: "Cámara SEA Vision Harlequin M4A523", addr: "GIGE-01", val: "99.8% APROB." },
        { tag: "TC-M4M601", desc: "Rodillo/placa sellado aluminio", addr: "AI-TC4", val: "195.0 °C" },
        { tag: "DRUM-VAC", desc: "Tambor cicloidal transferencia M4M182", addr: "SRV-06", val: "-0.65 bar SYNC" },
        { tag: "CHILL-04", desc: "Retorno agua enfriamiento moldes", addr: "TI-109", val: "15.4 °C OK" }
      ],
      blister3: [
        { tag: "+062-PT100", desc: "Calentamiento superior/inferior 2 zonas", addr: "+062 AI", val: "132.0 °C" },
        { tag: "+070-SRV", desc: "Servo estación de moldeo por levas", addr: "+070 AX1", val: "FASE OK" },
        { tag: "+302-CAM", desc: "Inspección VisioChrom Micro llenado", addr: "+302 ETH", val: "100% OK" },
        { tag: "+095-UV", desc: "Módulo impresora UV HAPA easyFLEX", addr: "+095 DO", val: "LÁMPARA LISTA" },
        { tag: "+100/+110", desc: "Sellado +100 y agua fría +110", addr: "+100 TC", val: "200 °C / 16 °C" },
        { tag: "+994-PLUTO", desc: "PLC de seguridad ABB Jokab PLUTO", addr: "+994 BUS", val: "RUN · 0 FALLAS" }
      ],
      controlsa114rl: [
        { tag: "ENT-S1", desc: "Entrada S1: Pulsador de PARO", addr: "S1 (Bit 1)", val: "0 (Reposo)" },
        { tag: "ENT-S2", desc: "Entrada S2: Orden ABRIR puerta", addr: "S2 (Bit 2)", val: "1 (Pulso ciclo)" },
        { tag: "ENT-S3/S4", desc: "S3 Doble altura / S4 Bajar cadena", addr: "S3..S4", val: "0 / 0" },
        { tag: "ENT-S5", desc: "Entrada S5: Seta PARO EMERGENCIA", addr: "S5 (Bit 5)", val: "0 (Desenclavada)" },
        { tag: "BARR-INF", desc: "Barrera fotoeléctrica inferior (30 cm)", addr: "PHOTO-1", val: "HAZ LIBRE (OK)" },
        { tag: "CEL-TAMB", desc: "Célula vigilancia desenrollado tambor", addr: "PHOTO-2", val: "NORMAL (OK)" }
      ],
      fx30prostep: [
        { tag: "INV-U1", desc: "Variador velocidad motor tractor M1", addr: "U1 (Esquema)", val: "24.0 m/min" },
        { tag: "BRUSH-M2", desc: "Motor brushless rebobinador E2", addr: "M2 DRIVE", val: "PAR CONSTANTE" },
        { tag: "STEP-M3", desc: "Motor paso a paso cilindro Cirel R3", addr: "M3 SYNC", val: "EN REGISTRO" },
        { tag: "DRY-V1", desc: "Soplante y calefactor secado tinta 2 kW", addr: "V1 / KM4", val: "85 °C ACTIVO" },
        { tag: "BRAKE-P6", desc: "Freno mecánico desbobinador E1", addr: "P6 MAN", val: "TENSIÓN OK" },
        { tag: "HMI-Q1", desc: "Panel operador Q1 y emergencias", addr: "Q1 PLC", val: "CICLO AUTO" }
      ],
      stickpack: [
        { tag: "PUMP-G2", desc: "Bombas dosificadoras líquido 6 pistas", addr: "S3A923", val: "6/6 PISTAS OK" },
        { tag: "VALV-AG", desc: "Cilindros obturadores antigoteo", addr: "YV-01..06", val: "SINCRONIZADOS" },
        { tag: "TC-VERT", desc: "Barras soldadura vertical S3M14100320", addr: "TC-01..06", val: "168 °C OK" },
        { tag: "TC-HORZ", desc: "Mordazas horizontales S3M14200320", addr: "TC-07..08", val: "174 °C OK" },
        { tag: "ORUG-G4", desc: "Orugas arrastre motorizadas S3A191", addr: "SRV-PULL", val: "PASO EXACTO" },
        { tag: "CUT-G5", desc: "Cuchillas transversales S3M11100110", addr: "YV-CUT", val: "EN FASE" }
      ],
      hdgc400: [
        { tag: "SIPART-PS2", desc: "Posicionador Siemens 6DR5010 (Cód. 740678)", addr: "AO-4..20mA", val: "64% Apertura" },
        { tag: "SEAL-3X", desc: "Sellos inflables Bowl/Diskjet/Filtro", addr: "PI-301..303", val: "2.2 bar SELLADO" },
        { tag: "WM-313X2A", desc: "Cabezales Watson-Marlow ATEX (741848)", addr: "DRV-SPRAY", val: "42 RPM ON" },
        { tag: "DP-HERDING", desc: "ΔP 18 filtros Herding D00T030185", addr: "PDI-402", val: "11.4 mbar" },
        { tag: "PT100-BED", desc: "Temperatura producto en Bowl Diskjet", addr: "TI-201", val: "44.8 °C" },
        { tag: "BLOWBACK", desc: "Secuencia válvulas pulso limpieza", addr: "YV-501..506", val: "PULSO ACTIVO" }
      ],
      ml642: [
        { tag: "EL6910", desc: "Módulo seguridad Beckhoff TwinSAFE", addr: "Z-ZDIST.1", val: "SAFE RUN OK" },
        { tag: "LENZE-i550", desc: "Variadores A27.1 / A41.1 + SM PU01", addr: "ETHERCAT", val: "SINCRONIZADOS" },
        { tag: "REOVIB-268", desc: "Controladores vibradores A73.1/A73.6/A83.1", addr: "Z-ZDIST.2", val: "3/3 EN FASE" },
        { tag: "B30.1..5", desc: "Fotocélulas espejo Wenglor P1KL002", addr: "Z-ZDIST.3", val: "FRASCOS OK" },
        { tag: "SELET-PNP", desc: "Detectores inductivos B18.2/B25.8/B35.9", addr: "Cód. 724001324", val: "ACTIVOS (1)" },
        { tag: "IPC677D", desc: "Panel PC Siemens SIMATIC operador", addr: "ETH-HMI", val: "RECETA ACTIVA" }
      ]
    };
    return signals[arch] || [];
  }

  function getStationSpareParts(machine, st) {
    const manualSpares = (machine.spareParts ?? []).map((sp) => ({
      code: sp.cod ? `Cód. ${sp.cod}` : (sp.code || sp.partNumber || sp.reference || "OEM"),
      name: sp.name || sp.description || "Repuesto de manual",
      system: sp.system || sp.category || "",
      qty: sp.qty || sp.quantity || ""
    }));
    const eq = typeof equipoDeMachine === "function" ? equipoDeMachine(machine) : null;
    const planSpares = (eq?.r ?? []).map((r) => ({
      code: r.cod ? `Cód. ${r.cod}` : (r.ref || "PLANTA"),
      name: r.d || "Repuesto catalogado",
      system: r.s || "",
      qty: r.c ? `${r.c} ${r.u || "UN"}` : ""
    }));
    const all = [...manualSpares, ...planSpares];
    if (!all.length) return [];

    const matchWords = `${st.systemMatch || ""} ${st.name || ""} ${st.summary || ""}`
      .toLowerCase()
      .split(/[^a-záéíóúñ0-9]+/)
      .filter((w) => w.length >= 4);

    const matched = all.filter((item) => {
      const hay = `${item.name} ${item.system} ${item.code}`.toLowerCase();
      return matchWords.some((w) => hay.includes(w.slice(0, 5)));
    });

    return (matched.length ? matched : all).slice(0, 5);
  }

  // --------------------------------------------------------------------------
  //  RENDERIZADO DEL PANEL HTML DE LA PESTAÑA "GEMELO 3D"
  // --------------------------------------------------------------------------
  function renderGemelo3DPanel(machine) {
    const arch = getTwinArchetype(machine);
    if (!arch || !TWIN_SPECS[arch]) {
      return `<div class="empty-state"><div><h3>Gemelo 3D en preparación</h3><p>Este equipo aún no tiene modelo cinemático 3D asignado.</p></div></div>`;
    }
    const spec = TWIN_SPECS[arch];
    const failures = machine.failureModes ?? [];
    const timingZones = getCamTimingZones(arch, spec);
    const plcSignals = getPlcSignalsForArchetype(arch);

    return `
      <div class="g3d-shell" id="g3dShell" data-g3d-machine="${machine.id}" data-g3d-arch="${arch}">
        <div class="g3d-header">
          <div class="g3d-header__titles">
            <div class="g3d-badge-row">
              <span class="g3d-live-pill"><span class="g3d-live-dot"></span> GEMELO DIGITAL CAD / SCADA EN TIEMPO REAL</span>
              <span class="g3d-arch-tag">Manual integrado · ${spec.stations.length} estaciones cinemáticas · Telemetría PLC</span>
            </div>
            <h3>${spec.title}</h3>
            <p>${spec.subtitle}</p>
          </div>
          <div class="g3d-telemetry" id="g3dTelemetryBar">
            ${spec.telemetry.map((t, idx) => `
              <div class="g3d-tele-card" data-tele-idx="${idx}">
                <span class="g3d-tele-k">${t.k}</span>
                <strong class="g3d-tele-v">${t.v}</strong>
                <span class="g3d-tele-u">${t.unit}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Barra de herramientas del simulador 3D -->
        <div class="g3d-toolbar">
          <div class="g3d-tool-group">
            <button type="button" class="g3d-btn g3d-btn--primary" id="g3dPlayBtn" onclick="window.g3dTogglePlay()">
              <span id="g3dPlayIcon">⏸</span> <span id="g3dPlayTxt">Pausar</span>
            </button>
            <label class="g3d-speed-lbl">
              Velocidad
              <select id="g3dSpeedSel" onchange="window.g3dSetSpeed(this.value)">
                <option value="0.25">0.25× (Cámara lenta)</option>
                <option value="0.5">0.5× (Ajuste fino)</option>
                <option value="1" selected>1.0× (Nominal)</option>
                <option value="1.5">1.5× (Rápido)</option>
                <option value="2">2.0× (Máxima)</option>
              </select>
            </label>
          </div>

          <div class="g3d-tool-group g3d-phase-group">
            <label for="g3dPhaseRange" class="g3d-phase-lbl">
              <span>Volante manual / Fase:</span>
              <strong id="g3dPhaseVal">0°</strong>
            </label>
            <input type="range" id="g3dPhaseRange" min="0" max="360" value="0" step="1" oninput="window.g3dScrubPhase(this.value)" title="${spec.cycleLabel}">
          </div>

          <div class="g3d-tool-group">
            <button type="button" class="g3d-btn" id="g3dXrayBtn" onclick="window.g3dToggleXray()" title="Transparentar carcasas y ver levas/mecanismos internos">
              🔍 Rayos X
            </button>
            <button type="button" class="g3d-btn" id="g3dCutBtn" onclick="window.g3dToggleCutaway()" title="Plano de corte seccional CAD para inspeccionar el interior">
              🔪 Corte Seccional
            </button>
            <button type="button" class="g3d-btn" id="g3dExplodeBtn" onclick="window.g3dToggleExplode()" title="Separar conjuntos mecánicos en vista explotada">
              🧩 Vista Explotada
            </button>
            <button type="button" class="g3d-btn" onclick="window.g3dResetCamera()" title="Restablecer cámara orbital">
              🎯 Centrar 3D
            </button>
            <button type="button" class="g3d-btn" id="g3dFullscreenBtn" onclick="window.g3dToggleFullscreen()" title="Expandir Gemelo Digital a pantalla completa">
              ⛶ Pantalla Completa
            </button>
            ${spec.hasImpactSim ? `
              <button type="button" class="g3d-btn g3d-btn--accent" id="g3dImpactBtn" onclick="window.g3dTriggerDoorImpact()">
                💥 Simular Impacto y Autorreparación
              </button>
            ` : ""}
          </div>

          <div class="g3d-tool-group g3d-fault-group">
            <label class="g3d-fault-lbl">
              ⚠️ Simular falla del manual:
              <select id="g3dFaultSel" onchange="window.g3dSelectFault(this.value)">
                <option value="">✓ Operación normal (Sin fallas activas)</option>
                ${failures.map((f, i) => `<option value="${i}">⚡ ${f.name} (${f.probableSystem})</option>`).join("")}
              </select>
            </label>
          </div>
        </div>

        <!-- Selector rápido de estaciones -->
        <div class="g3d-station-bar" id="g3dStationBar">
          <button type="button" class="g3d-st-chip is-active" data-st-chip="all" onclick="window.g3dFocusStation('all')">
            Vista General (${spec.stations.length} estaciones)
          </button>
          ${spec.stations.map((st) => `
            <button type="button" class="g3d-st-chip" data-st-chip="${st.id}" onclick="window.g3dFocusStation('${st.id}')">
              <span class="g3d-st-chip__num">${st.num}</span> ${st.name.split("·").pop().trim()}
            </button>
          `).join("")}
        </div>

        <!-- Área principal: Lienzo WebGL 3D + Inspector Técnico Lateral -->
        <div class="g3d-workspace">
          <div class="g3d-left-col">
            <div class="g3d-viewport" id="g3dViewport">
              <canvas id="g3dCanvas"></canvas>
              <div class="g3d-hud-top">
                <span class="g3d-andon-pill" id="g3dAndonStatus">
                  <span class="g3d-andon-lamp is-green" id="g3dLampG"></span>
                  <span class="g3d-andon-lamp" id="g3dLampA"></span>
                  <span class="g3d-andon-lamp" id="g3dLampR"></span>
                  <strong id="g3dAndonText">TORRETA ANDON: RUN AUTOMÁTICO</strong>
                </span>
                <span class="g3d-cycle-readout" id="g3dCycleReadout">Ángulo maestro: 0° · Ciclo 100%</span>
              </div>
              <div class="g3d-pins" id="g3dPinsOverlay"></div>
              <div class="g3d-hud-bottom">
                <span>🖱️ Arrastra: rotar 360° · Rueda: zoom CAD · Clic der./Shift: desplazar · Clic en pieza 3D o pin: inspeccionar estación</span>
                <span class="g3d-hud-cam-btns">
                  <button type="button" onclick="window.g3dSetCameraPreset('iso')">Isométrica</button>
                  <button type="button" onclick="window.g3dSetCameraPreset('front')">Frente</button>
                  <button type="button" onclick="window.g3dSetCameraPreset('top')">Planta</button>
                  <button type="button" onclick="window.g3dSetCameraPreset('side')">Lateral</button>
                </span>
              </div>
            </div>

            <!-- Diagrama Industrial de Sincronismo y Levas (0° - 360°) + Matriz PLC I/O -->
            <div class="g3d-scada-deck">
              <div class="g3d-timing-card">
                <div class="g3d-timing-head">
                  <div>
                    <strong>📐 Diagrama de Sincronismo y Levas (0°–360°)</strong>
                    <span>Haz clic en cualquier punto de la barra para posicionar el volante manual en ese ángulo exacto</span>
                  </div>
                  <span class="g3d-timing-angle" id="g3dTimingBadge">Fase actual: 0°</span>
                </div>
                <div class="g3d-timing-ruler">
                  <span>0°</span><span>45°</span><span>90°</span><span>135°</span><span>180°</span><span>225°</span><span>270°</span><span>315°</span><span>360°</span>
                </div>
                <div class="g3d-timing-tracks" id="g3dTimingTracks" onclick="window.g3dClickTimingBar(event)">
                  <div class="g3d-timing-cursor" id="g3dTimingCursor" style="left: 0%;"></div>
                  ${timingZones.map((z) => {
                    const leftPct = ((z.start / 360) * 100).toFixed(2);
                    const widthPct = (((z.end - z.start) / 360) * 100).toFixed(2);
                    const stId = spec.stations[z.stIdx]?.id || spec.stations[0].id;
                    return `
                      <div class="g3d-timing-row" onclick="event.stopPropagation(); window.g3dScrubPhase(${Math.round((z.start + z.end) / 2)}); window.g3dFocusStation('${stId}')">
                        <span class="g3d-timing-lbl">${z.label}</span>
                        <div class="g3d-timing-bar-bg">
                          <div class="g3d-timing-bar-fill" style="left:${leftPct}%; width:${widthPct}%; background:${z.color};">
                            <span>${z.start}°–${z.end}°</span>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>

              <div class="g3d-plc-card">
                <div class="g3d-timing-head">
                  <div>
                    <strong>🖧 Monitor de Señales PLC / Sensores e Instrumentación en Vivo</strong>
                    <span>Variables de campo vinculadas al esquema eléctrico y P&ID del manual</span>
                  </div>
                  <span class="g3d-plc-scan">SCAN: 12 ms · ONLINE</span>
                </div>
                <div class="g3d-plc-grid" id="g3dPlcGrid">
                  ${plcSignals.map((sig, idx) => `
                    <div class="g3d-plc-item" data-plc-idx="${idx}">
                      <div class="g3d-plc-top">
                        <span class="g3d-plc-led is-on" data-plc-led="${idx}"></span>
                        <strong class="g3d-plc-tag">${sig.tag}</strong>
                        <code class="g3d-plc-addr">${sig.addr}</code>
                      </div>
                      <div class="g3d-plc-desc">${sig.desc}</div>
                      <div class="g3d-plc-val" data-plc-val="${idx}">${sig.val}</div>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>

          <aside class="g3d-inspector" id="g3dInspector">
            ${renderStationInspectorHtml(machine, spec, spec.stations[0], null)}
          </aside>
        </div>
      </div>
    `;
  }

  function renderStationInspectorHtml(machine, spec, st, activeFault) {
    if (!st) st = spec.stations[0];
    const sparesCount = (machine.spareParts ?? []).length + (typeof equipoDeMachine === "function" && equipoDeMachine(machine) ? equipoDeMachine(machine).r.length : 0);
    const maintCount = (machine.maintenanceTasks ?? []).length;
    const stationSpares = getStationSpareParts(machine, st);

    let faultBanner = "";
    if (activeFault) {
      const stepsHtml = (activeFault.steps ?? []).map((s, idx) => `
        <li class="g3d-fault-step">
          <strong>${idx + 1}. ${s.title}</strong>
          ${s.where ? `<div class="g3d-fault-meta">📍 ${s.where}</div>` : ""}
          <div>${s.how}</div>
          ${s.spec ? `<div class="g3d-fault-spec">📏 Valor esperado: <b>${s.spec}</b></div>` : ""}
          ${s.tool ? `<div class="g3d-fault-tool">🔧 Herramienta: ${s.tool}</div>` : ""}
        </li>
      `).join("");

      faultBanner = `
        <div class="g3d-fault-box">
          <div class="g3d-fault-box__head">
            <span>🚨 MODO SIMULACIÓN DE FALLA ACTIVO</span>
            <button type="button" onclick="window.g3dSelectFault('')">Restaurar normal</button>
          </div>
          <h4>${activeFault.name}</h4>
          <p class="g3d-fault-sys">Sistema afectado: <strong>${activeFault.probableSystem}</strong></p>
          <p class="g3d-fault-sym"><strong>Síntomas en máquina:</strong> ${[].concat(activeFault.symptoms).join(" · ")}</p>
          ${stepsHtml ? `<ol class="g3d-fault-steps">${stepsHtml}</ol>` : `
            <p class="g3d-fault-sym"><strong>Verificaciones:</strong> ${[].concat(activeFault.checks).join(" · ")}</p>
          `}
        </div>
      `;
    }

    return `
      ${faultBanner}
      <div class="g3d-insp-card">
        <div class="g3d-insp-head">
          <span class="g3d-insp-badge">${st.num}</span>
          <div>
            <h4>${st.name}</h4>
            <span class="g3d-insp-sub">Subconjunto mecánico seleccionado · Sistema: <b>${st.systemMatch || "General"}</b></span>
          </div>
        </div>
        <p class="g3d-insp-desc">${st.summary}</p>

        <div class="g3d-insp-section">
          <h5>📐 Parámetros de diseño y cotas del manual</h5>
          <div class="g3d-param-list">
            ${(st.params || []).map(([k, v]) => `
              <div class="g3d-param-row">
                <span>${k}</span>
                <strong>${v}</strong>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="g3d-insp-section">
          <h5>🔧 Regulación, fasatura y puntos críticos en planta</h5>
          <ul class="g3d-adj-list">
            ${(st.adjustments || []).map((a) => `<li>${a}</li>`).join("")}
          </ul>
        </div>

        ${stationSpares.length ? `
          <div class="g3d-insp-section">
            <h5>🔩 Repuestos OEM / Almacén vinculados a esta estación</h5>
            <div class="g3d-spare-mini-list">
              ${stationSpares.map((sp) => `
                <div class="g3d-spare-mini-item">
                  <code>${sp.code}</code>
                  <span>${sp.name}</span>
                  ${sp.qty ? `<b>${sp.qty}</b>` : ""}
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div class="g3d-insp-actions">
          <button type="button" class="button button--light" onclick="window.g3dJumpToTab('systems')">
            Ver en Sistemas
          </button>
          <button type="button" class="button button--light" onclick="window.g3dJumpToTab('spares')">
            Repuestos (${sparesCount})
          </button>
          <button type="button" class="button button--light" onclick="window.g3dJumpToTab('maintenance')">
            Mantenimiento (${maintCount})
          </button>
          <button type="button" class="button button--light" onclick="window.g3dJumpToTab('failures')">
            Fallas y Alarmas
          </button>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  //  MATERIALES INDUSTRIALES ESTÁNDAR (THREE.JS)
  // --------------------------------------------------------------------------
  function createIndustrialMaterials(THREE) {
    return {
      steel: new THREE.MeshStandardMaterial({ color: 0xd4dbe2, metalness: 0.72, roughness: 0.26 }),
      darkSteel: new THREE.MeshStandardMaterial({ color: 0x3b444f, metalness: 0.65, roughness: 0.36 }),
      brushedAlu: new THREE.MeshStandardMaterial({ color: 0xe6ebf0, metalness: 0.55, roughness: 0.32 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xd4a238, metalness: 0.78, roughness: 0.24 }),
      copper: new THREE.MeshStandardMaterial({ color: 0xc86d44, metalness: 0.75, roughness: 0.28 }),
      bluePaint: new THREE.MeshStandardMaterial({ color: 0x1d5fa7, metalness: 0.28, roughness: 0.42 }),
      whitePlastic: new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.05, roughness: 0.32 }),
      blackRubber: new THREE.MeshStandardMaterial({ color: 0x1e242b, metalness: 0.08, roughness: 0.78 }),
      greenBelt: new THREE.MeshStandardMaterial({ color: 0x16805c, metalness: 0.1, roughness: 0.58 }),
      capsuleRed: new THREE.MeshStandardMaterial({ color: 0xd93829, metalness: 0.15, roughness: 0.28 }),
      capsuleWhite: new THREE.MeshStandardMaterial({ color: 0xf4f6f8, metalness: 0.1, roughness: 0.28 }),
      pvcFilm: new THREE.MeshPhysicalMaterial({ color: 0xcce8ff, transparent: true, opacity: 0.58, roughness: 0.2, metalness: 0.05 }),
      aluFoil: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2, side: THREE.DoubleSide }),
      thermalHot: new THREE.MeshStandardMaterial({ color: 0xe04f26, emissive: 0x8a1c00, emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.35 }),
      glassGuard: new THREE.MeshPhysicalMaterial({ color: 0xdcf0ff, transparent: true, opacity: 0.24, roughness: 0.12, metalness: 0.05, depthWrite: false }),
      casingMat: new THREE.MeshStandardMaterial({ color: 0xdfe5ec, metalness: 0.5, roughness: 0.36, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
      laserBeam: new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0.8 }),
      ledGreen: new THREE.MeshStandardMaterial({ color: 0x16c76a, emissive: 0x16c76a, emissiveIntensity: 0.9 }),
      ledAmber: new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.15 }),
      ledRed: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.1 }),
      hazardYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.15, roughness: 0.5 })
    };
  }

  function tagStation(obj, stId, explodeVec) {
    obj.userData.stationId = stId;
    if (explodeVec) {
      obj.userData.basePos = obj.position.clone();
      obj.userData.explodeVec = explodeVec;
    }
    obj.traverse((child) => {
      child.userData.stationId = stId;
    });
    return obj;
  }

  // --------------------------------------------------------------------------
  //  CONSTRUCTORES PROCEDURALES DE CADA MÁQUINA 3D
  // --------------------------------------------------------------------------

  // 1 & 2. NJP-3500 y NJP-1200C (Encapsuladoras rotativas de 10 estaciones)
  function buildNjpTwin(THREE, mats, is1200) {
    const root = new THREE.Group();
    const anim = { tampingPins: [], capsuleSegs: [], camShaft: null, ejectedCaps: [], powderAuger: null };
    const scaleR = is1200 ? 0.86 : 1.0;

    // Pedestal inferior (contiene caja indexadora y árbol de levas)
    const baseGroup = new THREE.Group();
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.2 * scaleR, 0.22, 5.2 * scaleR), mats.darkSteel);
    plinth.position.y = 0.11;
    baseGroup.add(plinth);

    const cabinet = new THREE.Mesh(new THREE.CylinderGeometry(2.55 * scaleR, 2.65 * scaleR, 1.35, 8), mats.casingMat);
    cabinet.position.y = 0.88;
    cabinet.userData.isCasing = true;
    baseGroup.add(cabinet);

    // Mecanismo interno bajo la mesa (visible en Rayos X / Explotado)
    const camSystem = new THREE.Group();
    camSystem.position.y = 0.78;
    const indexBox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 1.4), mats.bluePaint);
    camSystem.add(indexBox);

    const mainMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.75, 16), mats.darkSteel);
    mainMotor.rotation.z = Math.PI / 2;
    mainMotor.position.set(-1.25, -0.15, 0.6);
    camSystem.add(mainMotor);

    const camShaft = new THREE.Group();
    const shaftBar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.4 * scaleR, 16), mats.steel);
    shaftBar.rotation.z = Math.PI / 2;
    camShaft.add(shaftBar);
    for (let i = -2; i <= 2; i++) {
      const camDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24), mats.brass);
      camDisc.rotation.z = Math.PI / 2;
      camDisc.position.set(i * 0.62 * scaleR, (i % 2) * 0.06, 0);
      camShaft.add(camDisc);
    }
    camSystem.add(camShaft);
    anim.camShaft = camShaft;
    tagStation(camSystem, is1200 ? "n12-cam" : "drive-cam", new THREE.Vector3(0, -0.9, 0));
    root.add(camSystem);

    // Mesa principal inoxidable
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(5.1 * scaleR, 0.16, 5.1 * scaleR), mats.steel);
    tableTop.position.y = 1.62;
    baseGroup.add(tableTop);
    root.add(baseGroup);

    // Cabina acrílica superior con columnas inoxidables
    const guardGroup = new THREE.Group();
    guardGroup.position.y = 2.85;
    const acrylic = new THREE.Mesh(new THREE.CylinderGeometry(2.55 * scaleR, 2.55 * scaleR, 2.3, 8, 1, true), mats.glassGuard);
    guardGroup.add(acrylic);
    const roofCap = new THREE.Mesh(new THREE.CylinderGeometry(2.6 * scaleR, 2.6 * scaleR, 0.12, 8), mats.steel);
    roofCap.position.y = 1.2;
    guardGroup.add(roofCap);
    guardGroup.userData.basePos = guardGroup.position.clone();
    guardGroup.userData.explodeVec = new THREE.Vector3(0, 1.5, 0);
    root.add(guardGroup);

    // Torreta rotativa central de 10 estaciones
    const turretGroup = new THREE.Group();
    turretGroup.position.y = 1.95;
    const turretHub = new THREE.Mesh(new THREE.CylinderGeometry(1.15 * scaleR, 1.25 * scaleR, 0.52, 20), mats.brushedAlu);
    turretGroup.add(turretHub);
    const turretCap = new THREE.Mesh(new THREE.CylinderGeometry(0.85 * scaleR, 0.85 * scaleR, 0.18, 20), mats.brass);
    turretCap.position.y = 0.32;
    turretGroup.add(turretCap);

    // 10 segmentos superiores e inferiores
    const segRadius = 1.62 * scaleR;
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const segHolder = new THREE.Group();
      segHolder.rotation.y = -ang;

      const upperSeg = new THREE.Mesh(new THREE.BoxGeometry(0.44 * scaleR, 0.1, 0.56 * scaleR), mats.steel);
      upperSeg.position.set(segRadius, 0.18, 0);
      segHolder.add(upperSeg);

      const lowerSeg = new THREE.Mesh(new THREE.BoxGeometry(0.44 * scaleR, 0.1, 0.56 * scaleR), mats.brass);
      lowerSeg.position.set(segRadius, 0.02, 0);
      segHolder.add(lowerSeg);

      // Cápsulas representativas en el segmento
      const capRow = new THREE.Group();
      for (let c = -1; c <= 1; c++) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.14, 8), mats.capsuleRed);
        cap.position.set(segRadius, 0.24, c * 0.14);
        capRow.add(cap);
      }
      segHolder.add(capRow);

      turretGroup.add(segHolder);
      anim.capsuleSegs.push({ holder: segHolder, upperSeg, lowerSeg, capRow, index: i, baseR: segRadius });
    }
    root.add(turretGroup);
    anim.turret = turretGroup;

    // Estación 1–2: Tolva de cápsulas, tubos de caída y zapata de vacío
    const st1Group = new THREE.Group();
    st1Group.position.set(-1.75 * scaleR, 2.2, 1.25 * scaleR);
    const capHopper = new THREE.Mesh(new THREE.ConeGeometry(0.65 * scaleR, 0.95, 20), mats.steel);
    capHopper.rotation.x = Math.PI;
    capHopper.position.y = 1.05;
    st1Group.add(capHopper);
    const feedBlock = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.55), mats.brushedAlu);
    feedBlock.position.y = 0.3;
    st1Group.add(feedBlock);
    const vacShoe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), mats.copper);
    vacShoe.position.y = -0.32;
    st1Group.add(vacShoe);
    tagStation(st1Group, is1200 ? "n12-est1" : "est1-2", new THREE.Vector3(-0.9, 0.6, 0.7));
    root.add(st1Group);

    // Si es NJP-1200C: Estación 3 de Pellets
    if (is1200) {
      const pelletGroup = new THREE.Group();
      pelletGroup.position.set(0.35, 2.4, 1.85);
      const pHopper = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.18, 0.65, 16), mats.steel);
      pHopper.position.y = 0.45;
      pelletGroup.add(pHopper);
      const pSlide = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.38), mats.brass);
      pelletGroup.add(pSlide);
      tagStation(pelletGroup, "n12-est3", new THREE.Vector3(0.3, 0.6, 0.9));
      root.add(pelletGroup);
    }

    // Estación 3–5 (o 4 en 1200): Disco dosificador + Tolva de polvo + 5 punzones de apisonado (Tamping)
    const tampGroup = new THREE.Group();
    tampGroup.position.set(2.05 * scaleR, 2.0, 0.15);
    const dosingBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.92 * scaleR, 0.92 * scaleR, 0.32, 24), mats.copper);
    dosingBowl.position.y = -0.1;
    tampGroup.add(dosingBowl);

    const powderHopper = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * scaleR, 0.25 * scaleR, 0.95, 20), mats.steel);
    powderHopper.position.set(0.35, 0.95, 0.35);
    tampGroup.add(powderHopper);

    const tampBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.75 * scaleR, 0.75 * scaleR, 0.14, 20), mats.bluePaint);
    tampBridge.position.y = 0.72;
    tampGroup.add(tampBridge);

    for (let p = 0; p < 5; p++) {
      const a = ((p - 2) / 5) * Math.PI * 1.15;
      const pinHolder = new THREE.Group();
      pinHolder.position.set(Math.cos(a) * 0.58 * scaleR, 0.45, Math.sin(a) * 0.58 * scaleR);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.65, 12), mats.steel);
      pinHolder.add(rod);
      const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.16, 12), mats.brass);
      gauge.position.y = 0.28;
      pinHolder.add(gauge);
      tampGroup.add(pinHolder);
      anim.tampingPins.push(pinHolder);
    }
    tagStation(tampGroup, is1200 ? "n12-est4" : "est3-5", new THREE.Vector3(1.1, 0.6, 0.2));
    root.add(tampGroup);
    anim.tampGroup = tampGroup;

    // Estación 6–7: Rechazo de cápsulas no abiertas
    const rejGroup = new THREE.Group();
    rejGroup.position.set(0.2, 2.2, -1.95 * scaleR);
    const rejHead = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.45), mats.bluePaint);
    rejGroup.add(rejHead);
    const rejPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 12), mats.steel);
    rejPipe.position.set(0, 0.45, -0.25);
    rejPipe.rotation.x = -0.5;
    rejGroup.add(rejPipe);
    tagStation(rejGroup, is1200 ? "n12-est6-8" : "est6-7", new THREE.Vector3(0.2, 0.5, -1.0));
    root.add(rejGroup);

    // Estación 8: Cierre de cápsulas (Locking)
    const lockGroup = new THREE.Group();
    lockGroup.position.set(-1.45 * scaleR, 2.35, -1.45 * scaleR);
    const lockCol = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.85, 16), mats.steel);
    lockGroup.add(lockCol);
    const lockPlate = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.52), mats.brass);
    lockPlate.position.y = -0.18;
    lockGroup.add(lockPlate);
    const lockKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16), mats.darkSteel);
    lockKnob.position.y = 0.48;
    lockGroup.add(lockKnob);
    tagStation(lockGroup, is1200 ? "n12-est6-8" : "est8", new THREE.Vector3(-0.8, 0.6, -0.8));
    root.add(lockGroup);
    anim.lockPlate = lockPlate;

    // Estación 9–10: Expulsión y limpieza + rampa de descarga
    const outGroup = new THREE.Group();
    outGroup.position.set(-2.1 * scaleR, 2.1, 0.05);
    const outHood = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 0.85), mats.steel);
    outGroup.add(outHood);
    const chute = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.36), mats.brushedAlu);
    chute.position.set(-0.65, -0.22, 0.15);
    chute.rotation.z = 0.38;
    outGroup.add(chute);

    for (let k = 0; k < 4; k++) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 10), mats.capsuleRed);
      c.rotation.z = Math.PI / 2;
      c.position.set(-0.35 - k * 0.2, -0.1 - k * 0.08, 0.15);
      outGroup.add(c);
      anim.ejectedCaps.push({ mesh: c, offset: k * 0.25 });
    }
    tagStation(outGroup, is1200 ? "n12-est9-10" : "est9-10", new THREE.Vector3(-1.1, 0.4, 0));
    root.add(outGroup);

    // Auxiliares laterales: Bomba de vacío SK y Colector de polvo
    const auxGroup = new THREE.Group();
    auxGroup.position.set(3.55 * scaleR, 0, -1.4);
    const dustTower = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 2.3, 18), mats.steel);
    dustTower.position.y = 1.15;
    auxGroup.add(dustTower);
    const vacPump = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.85, 16), mats.bluePaint);
    vacPump.rotation.z = Math.PI / 2;
    vacPump.position.set(0, 0.42, 1.35);
    auxGroup.add(vacPump);
    tagStation(auxGroup, is1200 ? "n12-est1" : "est1-2", new THREE.Vector3(1.2, 0, -0.6));
    root.add(auxGroup);

    return {
      root,
      update(phaseRad, dt, state) {
        // Indexado intermitente de 10 estaciones (60% giro, 40% reposo por cada paso de 36°)
        const totalSteps = 10;
        const stepSpan = (Math.PI * 2) / totalSteps;
        const rawStep = (phaseRad / stepSpan);
        const stepIdx = Math.floor(rawStep);
        const frac = rawStep - stepIdx;
        const smoothFrac = frac < 0.55 ? 0.5 - 0.5 * Math.cos((frac / 0.55) * Math.PI) : 1.0;
        const indexedAngle = (stepIdx + smoothFrac) * stepSpan;

        anim.turret.rotation.y = indexedAngle;
        if (anim.camShaft) anim.camShaft.rotation.x = phaseRad * 2;

        // Movimiento vertical de los 5 punzones de apisonado (tamping) durante el reposo de la torreta
        const stroke = Math.sin(phaseRad * 5);
        anim.tampingPins.forEach((pin, idx) => {
          pin.position.y = 0.45 + Math.sin(phaseRad * 5 + idx * 0.35) * 0.16;
        });
        if (anim.lockPlate) {
          anim.lockPlate.position.y = -0.18 + Math.sin(phaseRad * 5) * 0.08;
        }

        // Movimiento radial de los segmentos inferiores (salen en E2–E6 y vuelven en E7)
        anim.capsuleSegs.forEach((seg) => {
          const worldAng = (seg.index * stepSpan + indexedAngle) % (Math.PI * 2);
          const normA = (worldAng + Math.PI * 2) % (Math.PI * 2);
          const isOut = normA > 1.1 && normA < 3.6;
          const targetR = seg.baseR + (isOut ? 0.24 * scaleR : 0);
          seg.lowerSeg.position.x += (targetR - seg.lowerSeg.position.x) * 0.2;
        });

        // Cápsulas saliendo por la rampa en Estación 9
        anim.ejectedCaps.forEach((c) => {
          const p = ((phaseRad / (Math.PI * 2)) * 2 + c.offset) % 1;
          c.mesh.position.x = -0.25 - p * 0.85;
          c.mesh.position.y = -0.06 - p * 0.34;
        });
      }
    };
  }

  // 3. BOSCH GKF 2600 (Encapsuladora modular 12 estaciones doble línea)
  function buildGkf2600Twin(THREE, mats) {
    const root = new THREE.Group();
    const anim = { turret: null, bells: [], closeHead: null, servoShaft: null };

    // Bancada Bosch inoxidable
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.55, 4.8), mats.casingMat);
    base.position.y = 0.78;
    base.userData.isCasing = true;
    root.add(base);

    const table = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.16, 4.9), mats.steel);
    table.position.y = 1.62;
    root.add(table);

    // Accionamiento servo PacDrive interno
    const servoGroup = new THREE.Group();
    servoGroup.position.set(0, 0.75, 0);
    const servoBox = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.6), mats.darkSteel);
    servoGroup.add(servoBox);
    const mainShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 4.2, 18), mats.brass);
    mainShaft.rotation.z = Math.PI / 2;
    servoGroup.add(mainShaft);
    anim.servoShaft = mainShaft;
    tagStation(servoGroup, "gkf-servo", new THREE.Vector3(0, -0.95, 0));
    root.add(servoGroup);

    // Cerramiento de seguridad con puertas PLUTO
    const guard = new THREE.Mesh(new THREE.BoxGeometry(5.9, 2.35, 4.7), mats.glassGuard);
    guard.position.y = 2.88;
    guard.userData.basePos = guard.position.clone();
    guard.userData.explodeVec = new THREE.Vector3(0, 1.6, 0);
    root.add(guard);

    // Carrusel de 12 estaciones en doble hilera (2×9 orificios)
    const turret = new THREE.Group();
    turret.position.y = 1.95;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.45, 0.54, 24), mats.steel);
    turret.add(hub);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const seg = new THREE.Group();
      seg.rotation.y = -a;
      const topBlock = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.11, 0.48), mats.brushedAlu);
      topBlock.position.set(1.85, 0.18, 0);
      seg.add(topBlock);
      const botBlock = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.11, 0.48), mats.brass);
      botBlock.position.set(1.85, 0.02, 0);
      seg.add(botBlock);
      turret.add(seg);
    }
    root.add(turret);
    anim.turret = turret;

    // Estación 1 y 2: Doble tolva de cápsulas + ASB
    const st12 = new THREE.Group();
    st12.position.set(-2.0, 2.35, 1.4);
    for (let h = 0; h < 2; h++) {
      const hop = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.25, 0.95, 18), mats.steel);
      hop.position.set(h * 0.65 - 0.3, 0.85, h * 0.35);
      st12.add(hop);
    }
    const asbBlock = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 0.75), mats.bluePaint);
    asbBlock.position.y = 0.15;
    st12.add(asbBlock);
    tagStation(st12, "gkf-est1-2", new THREE.Vector3(-1.0, 0.6, 0.8));
    root.add(st12);

    // Estación 5: Cámara de compactación con 5 campanas neumáticas y manómetros WIKA
    const st5 = new THREE.Group();
    st5.position.set(2.3, 2.25, 0.35);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.42, 24), mats.steel);
    st5.add(pot);
    for (let b = 0; b < 5; b++) {
      const ang = ((b - 2) / 5) * Math.PI * 1.1;
      const bell = new THREE.Group();
      bell.position.set(Math.cos(ang) * 0.65, 0.55, Math.sin(ang) * 0.65);
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.58, 16), mats.brushedAlu);
      bell.add(cyl);
      const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16), mats.whitePlastic);
      gauge.rotation.x = Math.PI / 2;
      gauge.position.set(0, 0.18, 0.15);
      bell.add(gauge);
      st5.add(bell);
      anim.bells.push(bell);
    }
    tagStation(st5, "gkf-est5", new THREE.Vector3(1.2, 0.6, 0.2));
    root.add(st5);

    // Estaciones 6 y 8: Módulos de pellets / microtabletas
    const st68 = new THREE.Group();
    st68.position.set(1.2, 2.3, -1.9);
    const pelletUnit = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.65), mats.steel);
    st68.add(pelletUnit);
    tagStation(st68, "gkf-est6-8", new THREE.Vector3(0.7, 0.5, -1.0));
    root.add(st68);

    // Estación 9: Cierre con contrasoporte y sensores IFS 5036
    const st9 = new THREE.Group();
    st9.position.set(-1.35, 2.35, -1.85);
    const closeHead = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.65), mats.brass);
    st9.add(closeHead);
    const sensor1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12), mats.bluePaint);
    sensor1.position.set(-0.2, 0.3, 0);
    st9.add(sensor1);
    const sensor2 = sensor1.clone();
    sensor2.position.set(0.2, 0.3, 0);
    st9.add(sensor2);
    anim.closeHead = closeHead;
    tagStation(st9, "gkf-est9", new THREE.Vector3(-0.8, 0.6, -0.9));
    root.add(st9);

    // Estaciones 10–12: Expulsión monocápsula y limpieza + Brazo HMI Bosch
    const st10 = new THREE.Group();
    st10.position.set(-2.25, 2.15, -0.15);
    const ejUnit = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.9), mats.steel);
    st10.add(ejUnit);
    const dualChute = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.45), mats.brushedAlu);
    dualChute.position.set(-0.65, -0.18, 0);
    dualChute.rotation.z = 0.32;
    st10.add(dualChute);
    tagStation(st10, "gkf-est10-12", new THREE.Vector3(-1.2, 0.4, 0));
    root.add(st10);

    return {
      root,
      update(phaseRad) {
        const stepSpan = (Math.PI * 2) / 12;
        const raw = phaseRad / stepSpan;
        const idx = Math.floor(raw);
        const frac = raw - idx;
        const smooth = frac < 0.55 ? 0.5 - 0.5 * Math.cos((frac / 0.55) * Math.PI) : 1.0;
        anim.turret.rotation.y = (idx + smooth) * stepSpan;
        if (anim.servoShaft) anim.servoShaft.rotation.x = phaseRad * 3;
        anim.bells.forEach((b, i) => {
          b.position.y = 0.55 + Math.sin(phaseRad * 6 + i * 0.4) * 0.14;
        });
        if (anim.closeHead) {
          anim.closeHead.position.y = Math.sin(phaseRad * 6) * 0.1;
        }
      }
    };
  }

  // 4. SCHMUCKER MS235 (Ensobradora 4 soldaduras de 6 pistas)
  function buildMs235Twin(THREE, mats) {
    const root = new THREE.Group();
    const anim = { reel: null, cassettes: null, jawL: null, jawR: null, knife: null, sachets: [] };

    // Bastidor longitudinal Schmucker
    const frame = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.4, 2.2), mats.casingMat);
    frame.position.set(-0.2, 0.7, 0);
    frame.userData.isCasing = true;
    root.add(frame);

    // G1: Portabobina neumático S4A26100410
    const g1 = new THREE.Group();
    g1.position.set(-4.8, 1.35, 0);
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.35, 28), mats.aluFoil);
    reel.rotation.x = Math.PI / 2;
    g1.add(reel);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.5, 16), mats.bluePaint);
    core.rotation.x = Math.PI / 2;
    g1.add(core);
    anim.reel = reel;
    tagStation(g1, "ms-bobina", new THREE.Vector3(-1.3, 0, 0));
    root.add(g1);

    // G2: Fotocélula S4M951 y corte longitudinal 6 pistas S4M121
    const g2 = new THREE.Group();
    g2.position.set(-2.3, 1.65, 0);
    for (let r = 0; r < 3; r++) {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.45, 16), mats.steel);
      roller.rotation.x = Math.PI / 2;
      roller.position.set((r - 1) * 0.55, (r % 2) * 0.35, 0);
      g2.add(roller);
    }
    const photocell = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), mats.bluePaint);
    photocell.position.set(-0.35, 0.48, 0.45);
    g2.add(photocell);
    // 6 cuchillas circulares
    for (let k = -2.5; k <= 2.5; k += 1) {
      const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16), mats.brass);
      blade.rotation.x = Math.PI / 2;
      blade.position.set(0.55, 0.2, k * 0.2);
      g2.add(blade);
    }
    tagStation(g2, "ms-fotocelula", new THREE.Vector3(-0.5, 0.7, 0));
    root.add(g2);

    // G3: Dosificador volumétrico doble casete y estrella (S4G715 / S4G722)
    const g3 = new THREE.Group();
    g3.position.set(-0.2, 2.75, 0);
    for (let h = -1; h <= 1; h += 2) {
      const hop = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.95, 20), mats.steel);
      hop.rotation.x = Math.PI;
      hop.position.set(0, 0.55, h * 0.42);
      g3.add(hop);
    }
    const cassetteBox = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.38, 1.45), mats.brass);
    g3.add(cassetteBox);
    anim.cassettes = cassetteBox;
    for (let t = -2.5; t <= 2.5; t += 1) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.05, 10), mats.steel);
      tube.position.set(0, -0.6, t * 0.2);
      g3.add(tube);
    }
    tagStation(g3, "ms-dosif", new THREE.Vector3(0, 1.2, 0));
    root.add(g3);

    // G4: Planchas soldantes S4M14100110 (calentadas por KM44.4 + A41.2/A41.6)
    const g4 = new THREE.Group();
    g4.position.set(0.3, 1.45, 0);
    const jawMat = mats.thermalHot.clone();
    const jawL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.78, 1.45), jawMat);
    jawL.position.x = -0.18;
    const jawR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.78, 1.45), jawMat);
    jawR.position.x = 0.18;
    g4.add(jawL, jawR);
    anim.jawL = jawL;
    anim.jawR = jawR;
    anim.jawMat = jawMat;
    tagStation(g4, "ms-planchas", new THREE.Vector3(0, 0.5, 0.9));
    root.add(g4);

    // G5: Grupo cuchillas de corte transversal S4A19100720
    const g5 = new THREE.Group();
    g5.position.set(2.1, 1.15, 0);
    const knife = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 1.48), mats.brass);
    g5.add(knife);
    anim.knife = knife;
    tagStation(g5, "ms-cuchillas", new THREE.Vector3(0.5, 0.5, 0));
    root.add(g5);

    // G6: Cinta de salida de 6 pistas S4A19100110 con sobres animados
    const g6 = new THREE.Group();
    g6.position.set(4.1, 0.9, 0);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.14, 1.42), mats.greenBelt);
    g6.add(belt);
    for (let row = 0; row < 4; row++) {
      const rowGrp = new THREE.Group();
      for (let lane = -2.5; lane <= 2.5; lane += 1) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.16), mats.whitePlastic);
        s.position.set(0, 0.09, lane * 0.2);
        rowGrp.add(s);
      }
      g6.add(rowGrp);
      anim.sachets.push({ grp: rowGrp, offset: row * 0.25 });
    }
    tagStation(g6, "ms-salida", new THREE.Vector3(1.2, 0, 0));
    root.add(g6);

    return {
      root,
      update(phaseRad, dt, state) {
        if (anim.reel) anim.reel.rotation.z = -phaseRad * 0.5;
        const closeWave = Math.max(0, Math.sin(phaseRad));
        if (anim.jawL && anim.jawR) {
          const gap = 0.26 - closeWave * 0.14;
          anim.jawL.position.x = -gap;
          anim.jawR.position.x = gap;
        }
        // Si hay falla simulada en KM44.4 o planchas, apaga el brillo térmico
        if (anim.jawMat) {
          const faultCold = state.activeFault && /telerruptor|km44|plancha|temperatura/i.test(state.activeFault.name);
          anim.jawMat.emissiveIntensity = faultCold ? 0.05 : 0.45 + 0.25 * closeWave;
        }
        if (anim.cassettes) {
          anim.cassettes.position.x = Math.sin(phaseRad) * 0.12;
        }
        if (anim.knife) {
          anim.knife.rotation.z = phaseRad;
        }
        anim.sachets.forEach((s) => {
          const p = ((phaseRad / (Math.PI * 2)) + s.offset) % 1;
          s.grp.position.x = -1.2 + p * 2.4;
        });
      }
    };
  }

  // 5 & 6. MARCHESINI INTEGRA 320 y UHLMANN B 1240 (Líneas de blíster termoformado)
  function buildBlisterLineTwin(THREE, mats, isB1240) {
    const root = new THREE.Group();
    const anim = { pvcReel: null, aluReel: null, formPress: null, sealPress: null, punchPress: null, transferDrum: null, blisters: [], brushes: [] };

    const length = isB1240 ? 14.2 : 13.4;
    const balconyFrame = new THREE.Mesh(new THREE.BoxGeometry(length, 1.35, 1.5), mats.casingMat);
    balconyFrame.position.set(0, 0.72, -0.35);
    balconyFrame.userData.isCasing = true;
    root.add(balconyFrame);

    // Banda continua de film a lo largo de la máquina
    const web = new THREE.Mesh(new THREE.BoxGeometry(length - 2.2, 0.025, 0.65), mats.pvcFilm);
    web.position.set(-0.3, 1.42, 0.35);
    root.add(web);

    // S1: Desbobinador PVC y mesa de empalme
    const s1 = new THREE.Group();
    s1.position.set(isB1240 ? -6.4 : -6.0, 1.05, 0.35);
    const pvcReel = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.68, 28), mats.pvcFilm);
    pvcReel.rotation.x = Math.PI / 2;
    s1.add(pvcReel);
    const spliceTable = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.35, 0.78), mats.brass);
    spliceTable.position.set(1.15, 0.35, 0);
    s1.add(spliceTable);
    anim.pvcReel = pvcReel;
    tagStation(s1, isB1240 ? "b3-unwind" : "int-pvc", new THREE.Vector3(-1.3, 0, 0));
    root.add(s1);

    // S2: Precalentamiento y estación de termoformado
    const s2 = new THREE.Group();
    s2.position.set(isB1240 ? -3.5 : -3.4, 1.45, 0.35);
    const heater = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.24, 0.8), mats.thermalHot);
    heater.position.set(-0.9, 0.14, 0);
    s2.add(heater);
    const formUpper = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.36, 0.85), mats.bluePaint);
    formUpper.position.set(0.35, 0.28, 0);
    const formLower = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.36, 0.85), mats.steel);
    formLower.position.set(0.35, -0.28, 0);
    s2.add(formUpper, formLower);
    anim.formPress = formLower;
    tagStation(s2, isB1240 ? "b3-forming" : "int-formado", new THREE.Vector3(0, 0.7, 0.6));
    root.add(s2);

    // S3: Alimentador vibratorio y cajonera de cepillos planetarios/inclinados
    const s3 = new THREE.Group();
    s3.position.set(-0.7, 1.85, 0.35);
    const vibBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.42, 0.55, 24), mats.steel);
    vibBowl.position.set(-0.2, 0.72, -0.25);
    s3.add(vibBowl);
    const feederBox = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.32, 0.82), mats.brushedAlu);
    feederBox.position.y = -0.18;
    s3.add(feederBox);
    for (let b = -1; b <= 1; b++) {
      const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.68, 16), mats.brass);
      brush.rotation.x = isB1240 ? Math.PI / 2 : 0;
      brush.position.set(b * 0.38, -0.02, 0);
      s3.add(brush);
      anim.brushes.push(brush);
    }
    tagStation(s3, isB1240 ? "b3-feeding" : "int-carga", new THREE.Vector3(0, 1.1, 0));
    root.add(s3);

    // Si es Uhlmann B 1240: Unidad HAPA easyFLEX UV en la parte superior
    if (isB1240) {
      const hapa = new THREE.Group();
      hapa.position.set(1.8, 2.55, 0.35);
      const lidReel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.68, 24), mats.aluFoil);
      lidReel.rotation.x = Math.PI / 2;
      lidReel.position.set(-0.55, 0.35, 0);
      hapa.add(lidReel);
      const hapaUnit = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 0.82), mats.bluePaint);
      hapa.add(hapaUnit);
      anim.aluReel = lidReel;
      tagStation(hapa, "b3-hapa", new THREE.Vector3(0, 1.3, 0));
      root.add(hapa);
    }

    // S4: Cámara de visión (SEA Vision / VisioChrom) + Sellado con aluminio
    const s4 = new THREE.Group();
    s4.position.set(isB1240 ? 3.1 : 1.7, 1.65, 0.35);
    const camHood = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.68, 0.78), mats.darkSteel);
    camHood.position.set(-0.85, 0.15, 0);
    s4.add(camHood);
    if (!isB1240) {
      const aluReel = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.68, 24), mats.aluFoil);
      aluReel.rotation.x = Math.PI / 2;
      aluReel.position.set(0.2, 0.88, 0);
      s4.add(aluReel);
      anim.aluReel = aluReel;
    }
    const sealHead = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.38, 0.85), mats.thermalHot);
    sealHead.position.set(0.35, 0.08, 0);
    s4.add(sealHead);
    anim.sealPress = sealHead;
    tagStation(s4, isB1240 ? "b3-sealing" : "int-vision-sellado", new THREE.Vector3(0, 0.8, 0.6));
    root.add(s4);

    // S5: Perforación, codificado y prensa de troquelado
    const s5 = new THREE.Group();
    s5.position.set(isB1240 ? 5.2 : 4.0, 1.5, 0.35);
    const punchBridge = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.9), mats.steel);
    s5.add(punchBridge);
    const punchRam = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.78), mats.brass);
    s5.add(punchRam);
    const scrapWinder = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.68, 20), mats.aluFoil);
    scrapWinder.rotation.x = Math.PI / 2;
    scrapWinder.position.set(0.3, 0.95, 0);
    s5.add(scrapWinder);
    anim.punchPress = punchRam;
    tagStation(s5, isB1240 ? "b3-punching" : "int-corte", new THREE.Vector3(0.6, 0.8, 0));
    root.add(s5);

    // S6: Tambor cicloidal / transferencia por vacío y cinta de salida
    const s6 = new THREE.Group();
    s6.position.set(6.0, 1.35, 0.35);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.72, 16), mats.bluePaint);
    drum.rotation.x = Math.PI / 2;
    drum.position.set(-0.35, 0.15, 0);
    s6.add(drum);
    anim.transferDrum = drum;

    const outBelt = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 0.68), mats.greenBelt);
    outBelt.position.set(0.65, -0.15, 0);
    s6.add(outBelt);
    for (let b = 0; b < 3; b++) {
      const bl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.45), mats.aluFoil);
      bl.position.set(0.1 + b * 0.45, -0.05, 0);
      s6.add(bl);
      anim.blisters.push({ mesh: bl, offset: b * 0.33 });
    }
    tagStation(s6, isB1240 ? "b3-punching" : "int-tambor", new THREE.Vector3(1.2, 0, 0));
    root.add(s6);

    return {
      root,
      update(phaseRad) {
        if (anim.pvcReel) anim.pvcReel.rotation.z = -phaseRad * 0.4;
        if (anim.aluReel) anim.aluReel.rotation.z = -phaseRad * 0.6;
        const pressWave = Math.sin(phaseRad * 2);
        if (anim.formPress) anim.formPress.position.y = -0.28 + Math.max(0, pressWave) * 0.14;
        if (anim.sealPress) anim.sealPress.position.y = 0.08 - Math.max(0, pressWave) * 0.12;
        if (anim.punchPress) anim.punchPress.position.y = Math.sin(phaseRad * 2 + 0.5) * 0.14;
        if (anim.transferDrum) anim.transferDrum.rotation.z = -phaseRad * 2;
        anim.brushes.forEach((b, i) => {
          b.rotation.y = phaseRad * (i % 2 === 0 ? 3 : -3);
        });
        anim.blisters.forEach((bl) => {
          const p = ((phaseRad / (Math.PI * 2)) + bl.offset) % 1;
          bl.mesh.position.x = -0.1 + p * 1.45;
        });
      }
    };
  }

  // 7. CONTROLSA 114 RL (Puerta rápida autorreparable de laboratorio)
  function buildControlsaTwin(THREE, mats) {
    const root = new THREE.Group();
    const anim = { curtain: null, buttons: [], drum: null, beam: null, ledG: null, ledR: null };

    // Pórtico y montantes laterales de aluminio con guías en C
    const frameGroup = new THREE.Group();
    for (let s = -1; s <= 1; s += 2) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.5, 0.28), mats.brushedAlu);
      post.position.set(s * 1.45, 1.75, 0);
      frameGroup.add(post);
    }
    root.add(frameGroup);

    // S2: Recuperadores blancos en la parte superior de las guías (Manual p.17)
    const recGroup = new THREE.Group();
    for (let s = -1; s <= 1; s += 2) {
      const rec = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.22), mats.whitePlastic);
      rec.position.set(s * 1.32, 3.15, 0.08);
      recGroup.add(rec);
    }
    tagStation(recGroup, "ctrl-recuperador", new THREE.Vector3(-0.8, 0.4, 0.5));
    root.add(recGroup);

    // S4: Cajón superior, tambor de enrollado y motor con freno
    const motorGroup = new THREE.Group();
    motorGroup.position.set(0, 3.55, 0);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.52, 0.52), mats.casingMat);
    hood.userData.isCasing = true;
    motorGroup.add(hood);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.75, 20), mats.steel);
    drum.rotation.z = Math.PI / 2;
    motorGroup.add(drum);
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.58, 16), mats.bluePaint);
    motor.position.set(1.75, -0.1, 0);
    motorGroup.add(motor);
    anim.drum = drum;
    tagStation(motorGroup, "ctrl-motor", new THREE.Vector3(0, 0.9, 0));
    root.add(motorGroup);

    // S1: Lona flexible de PVC con mirilla y botones laterales
    const curtainGroup = new THREE.Group();
    const curtainMat = new THREE.MeshStandardMaterial({ color: 0x1d5fa7, roughness: 0.45, metalness: 0.1, side: THREE.DoubleSide });
    const curtain = new THREE.Mesh(new THREE.BoxGeometry(2.68, 3.2, 0.04), curtainMat);
    curtain.position.y = 1.6;
    curtainGroup.add(curtain);

    const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.05), mats.pvcFilm);
    windowStrip.position.y = 1.75;
    curtainGroup.add(windowStrip);

    // Botones laterales de guiado
    for (let h = 0.25; h <= 3.0; h += 0.35) {
      for (let s = -1; s <= 1; s += 2) {
        const btn = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), mats.brass);
        btn.position.set(s * 1.36, h, 0);
        curtainGroup.add(btn);
        anim.buttons.push(btn);
      }
    }
    anim.curtain = curtainGroup;
    tagStation(curtainGroup, "ctrl-lona", new THREE.Vector3(0, 0, 0.8));
    root.add(curtainGroup);

    // S3: Barrera fotoeléctrica inferior + célula de tambor
    const secGroup = new THREE.Group();
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.75, 8), mats.laserBeam);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0, 0.48, 0.12);
    secGroup.add(beam);
    for (let s = -1; s <= 1; s += 2) {
      const cell = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.1), mats.blackRubber);
      cell.position.set(s * 1.34, 0.48, 0.12);
      secGroup.add(cell);
    }
    anim.beam = beam;
    tagStation(secGroup, "ctrl-seguridad", new THREE.Vector3(0, -0.4, 0.6));
    root.add(secGroup);

    // S5: Cuadro eléctrico Controlsa y semáforos
    const ctrlGroup = new THREE.Group();
    ctrlGroup.position.set(2.1, 1.5, 0.18);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.68, 0.26), mats.steel);
    ctrlGroup.add(box);
    const eStop = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), mats.ledRed);
    eStop.rotation.x = Math.PI / 2;
    eStop.position.set(0, -0.15, 0.15);
    ctrlGroup.add(eStop);
    const ledG = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), mats.ledGreen);
    ledG.position.set(-0.1, 0.2, 0.14);
    const ledR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), mats.ledRed);
    ledR.position.set(0.1, 0.2, 0.14);
    ctrlGroup.add(ledG, ledR);
    anim.ledG = ledG;
    anim.ledR = ledR;
    tagStation(ctrlGroup, "ctrl-cuadro", new THREE.Vector3(0.9, 0, 0.4));
    root.add(ctrlGroup);

    return {
      root,
      update(phaseRad, dt, state) {
        // Modo especial de simulación de impacto y reinserción por los recuperadores blancos
        if (state.doorImpactPhase > 0) {
          state.doorImpactPhase += dt * 0.35;
          const p = state.doorImpactPhase;
          if (p < 1.0) {
            // 1. Impacto: la parte inferior de la lona se sale hacia adelante fuera de las guías
            anim.curtain.rotation.x = -Math.sin(p * Math.PI * 0.5) * 0.26;
            anim.curtain.scale.y = 0.85;
            anim.curtain.position.y = 3.35 * (1 - 0.85);
          } else if (p < 2.2) {
            // 2. Subida en modo manual hasta los recuperadores blancos superiores
            const u = (p - 1.0) / 1.2;
            const openAmt = 0.15 + u * 0.78;
            anim.curtain.scale.y = 1 - openAmt;
            anim.curtain.position.y = 3.35 * openAmt;
            anim.curtain.rotation.x = -0.26 * (1 - u);
          } else if (p < 3.2) {
            // 3. Descenso ya reinsertada dentro de ambas guías
            const d = (p - 2.2) / 1.0;
            const openAmt = 0.93 * (1 - d);
            anim.curtain.scale.y = 1 - openAmt;
            anim.curtain.position.y = 3.35 * openAmt;
            anim.curtain.rotation.x = 0;
          } else {
            state.doorImpactPhase = 0;
            anim.curtain.rotation.x = 0;
          }
          return;
        }

        // Ciclo automático normal: abrir -> esperar -> cerrar
        const openRatio = 0.45 + 0.42 * Math.sin(phaseRad);
        const hScale = Math.max(0.12, 1 - openRatio);
        anim.curtain.scale.y = hScale;
        anim.curtain.position.y = 3.35 * (1 - hScale);
        anim.curtain.rotation.x = (state.activeFault && /fuera de gu/i.test(state.activeFault.name)) ? -0.22 : 0;
        if (anim.drum) anim.drum.rotation.x = phaseRad * 2;
      }
    };
  }

  // 8. TECNOMACO FX30 PRO STEP (Impresora flexográfica rotativa matrícula 19021)
  function buildFx30Twin(THREE, mats) {
    const root = new THREE.Group();
    const anim = { e1: null, e2: null, r1: null, r2: null, r3: null, r4: null, r5: null };

    // Bancada vertical en balconada inoxidable (820×900×950 mm)
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.7, 1.3), mats.casingMat);
    cabinet.position.set(0, 1.35, -0.35);
    cabinet.userData.isCasing = true;
    root.add(cabinet);

    // E1: Eje desbobinador con freno P6 y rodillos R6
    const e1Grp = new THREE.Group();
    e1Grp.position.set(-2.1, 0.85, 0.45);
    const e1Reel = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.65, 28), mats.aluFoil);
    e1Reel.rotation.x = Math.PI / 2;
    e1Grp.add(e1Reel);
    const brakeP6 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.82, 16), mats.bluePaint);
    brakeP6.rotation.x = Math.PI / 2;
    e1Grp.add(brakeP6);
    anim.e1 = e1Reel;
    tagStation(e1Grp, "fx-e1", new THREE.Vector3(-1.0, -0.3, 0.5));
    root.add(e1Grp);

    // Grupo entintador: Cubeta B1, Rodillo goma R1, Anilox cerámico R2 y Racla B3
    const inkGrp = new THREE.Group();
    inkGrp.position.set(-0.85, 1.85, 0.45);
    const trayB1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.26, 0.75), mats.steel);
    trayB1.position.set(-0.2, -0.25, 0);
    inkGrp.add(trayB1);
    const r1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.68, 20), mats.blackRubber);
    r1.rotation.x = Math.PI / 2;
    r1.position.set(-0.25, -0.05, 0);
    const r2Anilox = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.68, 24), mats.darkSteel);
    r2Anilox.rotation.x = Math.PI / 2;
    r2Anilox.position.set(0.15, 0.05, 0);
    const doctorB3 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.72), mats.brass);
    doctorB3.position.set(0.05, 0.28, 0);
    inkGrp.add(r1, r2Anilox, doctorB3);
    anim.r1 = r1;
    anim.r2 = r2Anilox;
    tagStation(inkGrp, "fx-ink", new THREE.Vector3(-0.5, 0.5, 0.7));
    root.add(inkGrp);

    // Grupo impresión: Cilindro portacliché Cirel R3 (M3) y contraste R4
    const printGrp = new THREE.Group();
    printGrp.position.set(0.2, 1.85, 0.45);
    const r3Cirel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.68, 24), mats.copper);
    r3Cirel.rotation.x = Math.PI / 2;
    r3Cirel.position.set(-0.18, 0.08, 0);
    const r4Contrast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.68, 24), mats.steel);
    r4Contrast.rotation.x = Math.PI / 2;
    r4Contrast.position.set(0.25, 0.08, 0);
    printGrp.add(r3Cirel, r4Contrast);
    anim.r3 = r3Cirel;
    anim.r4 = r4Contrast;
    tagStation(printGrp, "fx-cirel", new THREE.Vector3(0.2, 0.6, 0.7));
    root.add(printGrp);

    // Secador por aire caliente V1 (2 kW) y rodillo tractor R5 (M1)
    const dryerGrp = new THREE.Group();
    dryerGrp.position.set(1.4, 2.05, 0.45);
    const blowerV1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.48, 0.75), mats.thermalHot);
    blowerV1.position.y = 0.22;
    const r5Tractor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.68, 20), mats.brass);
    r5Tractor.rotation.x = Math.PI / 2;
    r5Tractor.position.set(0.35, -0.25, 0);
    dryerGrp.add(blowerV1, r5Tractor);
    anim.r5 = r5Tractor;
    tagStation(dryerGrp, "fx-dryer", new THREE.Vector3(0.7, 0.7, 0.5));
    root.add(dryerGrp);

    // E2: Rebobinador brushless (M2) y HMI Q1
    const e2Grp = new THREE.Group();
    e2Grp.position.set(2.05, 0.9, 0.45);
    const e2Reel = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.65, 28), mats.aluFoil);
    e2Reel.rotation.x = Math.PI / 2;
    const hmiQ1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.15), mats.bluePaint);
    hmiQ1.position.set(0.1, 1.35, 0.25);
    e2Grp.add(e2Reel, hmiQ1);
    anim.e2 = e2Reel;
    tagStation(e2Grp, "fx-e2", new THREE.Vector3(1.0, -0.2, 0.5));
    root.add(e2Grp);

    return {
      root,
      update(phaseRad) {
        if (anim.e1) anim.e1.rotation.z = -phaseRad;
        if (anim.e2) anim.e2.rotation.z = -phaseRad;
        if (anim.r1) anim.r1.rotation.z = phaseRad * 2;
        if (anim.r2) anim.r2.rotation.z = -phaseRad * 2;
        if (anim.r3) anim.r3.rotation.z = phaseRad * 2;
        if (anim.r4) anim.r4.rotation.z = -phaseRad * 2;
        if (anim.r5) anim.r5.rotation.z = -phaseRad * 2;
      }
    };
  }

  // 9. SCHMUCKER STICKPACKER S3240005 (Envasadora vertical multipista de líquidos)
  function buildStickpackTwin(THREE, mats) {
    const root = new THREE.Group();
    const anim = { reel: null, vertBars: null, jawsF: null, jawsB: null, knife: null, sticks: [] };

    const tower = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.6, 1.8), mats.casingMat);
    tower.position.set(0, 1.8, -0.35);
    tower.userData.isCasing = true;
    root.add(tower);

    // G1: Portabobina trasero S3A26100420 y corte longitudinal S3A26101910
    const g1 = new THREE.Group();
    g1.position.set(0, 2.35, -1.55);
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 1.9, 28), mats.aluFoil);
    reel.rotation.z = Math.PI / 2;
    g1.add(reel);
    anim.reel = reel;
    tagStation(g1, "sp-unwind", new THREE.Vector3(0, 0.3, -1.2));
    root.add(g1);

    // G2: Cabezales de bombas de líquido y cilindros antigoteo S3A92301220
    const g2 = new THREE.Group();
    g2.position.set(0, 3.55, 0.25);
    const manifold = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.32, 0.55), mats.steel);
    g2.add(manifold);
    for (let lane = -2.5; lane <= 2.5; lane += 1) {
      const pumpHead = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 14), mats.bluePaint);
      pumpHead.rotation.x = Math.PI / 2;
      pumpHead.position.set(lane * 0.36, 0.15, 0.25);
      g2.add(pumpHead);
    }
    tagStation(g2, "sp-pumps", new THREE.Vector3(0, 1.1, 0.3));
    root.add(g2);

    // G3: 6 Tubos formadores y barras de soldadura vertical S3M14100320
    const g3 = new THREE.Group();
    g3.position.set(0, 2.35, 0.55);
    for (let lane = -2.5; lane <= 2.5; lane += 1) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.65, 14), mats.steel);
      tube.position.set(lane * 0.36, 0, 0);
      g3.add(tube);
    }
    const vertBar = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.85, 0.14), mats.thermalHot);
    vertBar.position.z = 0.16;
    g3.add(vertBar);
    anim.vertBars = vertBar;
    tagStation(g3, "sp-vertical", new THREE.Vector3(0, 0.4, 0.9));
    root.add(g3);

    // G4: Orugas de arrastre S3A19100330 y mordazas horizontales S3M14200320
    const g4 = new THREE.Group();
    g4.position.set(0, 1.35, 0.55);
    for (let lane = -2.5; lane <= 2.5; lane += 1) {
      const oruga = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.26), mats.greenBelt);
      oruga.position.set(lane * 0.36, 0.22, 0);
      g4.add(oruga);
    }
    const jawF = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.24, 0.18), mats.thermalHot);
    jawF.position.set(0, -0.18, 0.16);
    const jawB = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.24, 0.18), mats.thermalHot);
    jawB.position.set(0, -0.18, -0.16);
    g4.add(jawF, jawB);
    anim.jawsF = jawF;
    anim.jawsB = jawB;
    tagStation(g4, "sp-orugas", new THREE.Vector3(0, -0.2, 0.9));
    root.add(g4);

    // G5: Cuchillas transversales S3M11100110 y rampa de sticks
    const g5 = new THREE.Group();
    g5.position.set(0, 0.65, 0.65);
    const knife = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.22), mats.brass);
    g5.add(knife);
    anim.knife = knife;

    const stickRow = new THREE.Group();
    for (let lane = -2.5; lane <= 2.5; lane += 1) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.32, 10), mats.whitePlastic);
      st.position.set(lane * 0.36, -0.28, 0.1);
      stickRow.add(st);
    }
    g5.add(stickRow);
    anim.sticks.push(stickRow);
    tagStation(g5, "sp-corte", new THREE.Vector3(0, -0.8, 0.9));
    root.add(g5);

    return {
      root,
      update(phaseRad) {
        if (anim.reel) anim.reel.rotation.x = phaseRad * 0.5;
        const clamp = Math.max(0, Math.sin(phaseRad));
        if (anim.vertBars) anim.vertBars.position.z = 0.22 - clamp * 0.08;
        if (anim.jawsF && anim.jawsB) {
          const zGap = 0.22 - clamp * 0.11;
          anim.jawsF.position.z = zGap;
          anim.jawsB.position.z = -zGap;
        }
        if (anim.knife) anim.knife.position.z = Math.sin(phaseRad * 2) * 0.08;
        anim.sticks.forEach((row) => {
          const p = (phaseRad / (Math.PI * 2)) % 1;
          row.position.y = -p * 0.45;
        });
      }
    };
  }

  // 10. HÜTTLIN HDGC 400 (Lecho fluido farmacéutico con plato Diskjet y filtros Herding)
  function buildHdgc400Twin(THREE, mats) {
    const root = new THREE.Group();
    const anim = { particles: [], filters: [], pumpRotor: null, seals: [] };

    // P1: UMA de proceso + posicionadores Siemens Sipart PS2
    const ahu = new THREE.Group();
    ahu.position.set(-3.2, 1.15, 0);
    const ahuBox = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.5, 1.4), mats.brushedAlu);
    ahu.add(ahuBox);
    const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.8, 16), mats.steel);
    duct.rotation.z = Math.PI / 2;
    duct.position.set(1.6, -0.35, 0);
    ahu.add(duct);
    const sipart = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.24), mats.bluePaint);
    sipart.position.set(1.3, 0.05, 0.25);
    ahu.add(sipart);
    tagStation(ahu, "hd-ahu", new THREE.Vector3(-1.3, 0, 0));
    root.add(ahu);

    // P2: Plenum inferior y plato toroidal Diskjet con sello inflable D00T019236
    const p2 = new THREE.Group();
    p2.position.set(0, 0.65, 0);
    const plenum = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 0.85, 28), mats.steel);
    p2.add(plenum);
    const diskjet = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.12, 28), mats.brass);
    diskjet.position.y = 0.46;
    p2.add(diskjet);
    const sealDisk = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.055, 12, 32), mats.bluePaint);
    sealDisk.rotation.x = Math.PI / 2;
    sealDisk.position.y = 0.48;
    p2.add(sealDisk);
    anim.seals.push(sealDisk);
    tagStation(p2, "hd-diskjet", new THREE.Vector3(0, -0.7, 0));
    root.add(p2);

    // P3: Recipiente de producto (Bowl) + sello inflable D00T019028 + nube de partículas fluidizadas
    const p3 = new THREE.Group();
    p3.position.set(0, 1.75, 0);
    const bowlShell = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 0.98, 1.35, 28), mats.casingMat);
    bowlShell.userData.isCasing = true;
    p3.add(bowlShell);

    const sightGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 20), mats.pvcFilm);
    sightGlass.rotation.x = Math.PI / 2;
    sightGlass.position.set(0, 0.05, 1.12);
    p3.add(sightGlass);

    const sealBowl = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.06, 12, 32), mats.bluePaint);
    sealBowl.rotation.x = Math.PI / 2;
    sealBowl.position.y = 0.68;
    p3.add(sealBowl);
    anim.seals.push(sealBowl);

    // Nube toroidal de gránulos en suspensión dentro del Bowl
    for (let i = 0; i < 42; i++) {
      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), mats.brass);
      const a = (i / 42) * Math.PI * 2;
      const r = 0.35 + (i % 5) * 0.13;
      pMesh.position.set(Math.cos(a) * r, (i % 7) * 0.14 - 0.42, Math.sin(a) * r);
      p3.add(pMesh);
      anim.particles.push({ mesh: pMesh, baseA: a, baseR: r, speed: 1.5 + (i % 4) * 0.4, phase: i * 0.5 });
    }
    tagStation(p3, "hd-bowl", new THREE.Vector3(0, 0, 0.9));
    root.add(p3);

    // P4: Skid de bombas peristálticas Watson-Marlow 313X2A ATEX
    const p4 = new THREE.Group();
    p4.position.set(2.35, 0.85, 0.95);
    const skid = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 0.85), mats.steel);
    p4.add(skid);
    const pumpHead = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.22, 18), mats.bluePaint);
    pumpHead.rotation.x = Math.PI / 2;
    pumpHead.position.set(-0.2, 0.25, 0.48);
    p4.add(pumpHead);
    anim.pumpRotor = pumpHead;
    tagStation(p4, "hd-spray", new THREE.Vector3(1.1, 0, 0.7));
    root.add(p4);

    // P5: Cámara superior de filtros sinterizados Herding (D00T030185) + Blowback
    const p5 = new THREE.Group();
    p5.position.set(0, 3.25, 0);
    const topHousing = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.28, 1.65, 28), mats.casingMat);
    topHousing.userData.isCasing = true;
    p5.add(topHousing);

    const sealFilter = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.055, 12, 32), mats.bluePaint);
    sealFilter.rotation.x = Math.PI / 2;
    sealFilter.position.y = 0.82;
    p5.add(sealFilter);
    anim.seals.push(sealFilter);

    // Corona de cartuchos Herding en el interior
    for (let f = 0; f < 8; f++) {
      const a = (f / 8) * Math.PI * 2;
      const cart = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.05, 0.36), mats.whitePlastic);
      cart.position.set(Math.cos(a) * 0.72, 0, Math.sin(a) * 0.72);
      cart.rotation.y = -a;
      p5.add(cart);
      anim.filters.push(cart);
    }
    tagStation(p5, "hd-herding", new THREE.Vector3(0, 1.2, 0));
    root.add(p5);

    return {
      root,
      update(phaseRad) {
        if (anim.pumpRotor) anim.pumpRotor.rotation.z = -phaseRad * 3;
        anim.particles.forEach((pt) => {
          const a = pt.baseA + phaseRad * pt.speed;
          const swirl = Math.sin(phaseRad * 3 + pt.phase);
          const r = pt.baseR + swirl * 0.14;
          pt.mesh.position.x = Math.cos(a) * r;
          pt.mesh.position.z = Math.sin(a) * r;
          pt.mesh.position.y = Math.cos(phaseRad * 3 + pt.phase) * 0.42;
        });
        const pulseIdx = Math.floor((phaseRad / (Math.PI * 2)) * anim.filters.length) % anim.filters.length;
        anim.filters.forEach((f, idx) => {
          f.scale.x = idx === pulseIdx ? 1.25 : 1.0;
        });
      }
    };
  }

  // 11. MARCHESINI ML642 (Llenadora-tapadora automática de frascos M6210005)
  function buildMl642Twin(THREE, mats) {
    const root = new THREE.Group();
    const anim = { bottles: [], syringes: null, nozzles: null, subCapHead: null, capChucks: [], mixer: null };

    // Bancada monoblock inoxidable con guardas de policarbonato
    const base = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.95, 2.3), mats.casingMat);
    base.position.set(0, 0.48, 0);
    base.userData.isCasing = true;
    root.add(base);

    const guard = new THREE.Mesh(new THREE.BoxGeometry(9.2, 1.85, 2.15), mats.glassGuard);
    guard.position.set(0, 1.88, 0);
    guard.userData.basePos = guard.position.clone();
    guard.userData.explodeVec = new THREE.Vector3(0, 1.4, 0);
    root.add(guard);

    // S1: Cinta de entrada, sinfín separador y fotocélulas Wenglor B30.1–B30.5
    const s1 = new THREE.Group();
    s1.position.set(-3.9, 1.05, 0.35);
    const conveyor = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.12, 0.38), mats.greenBelt);
    conveyor.position.set(3.9, -0.02, 0);
    s1.add(conveyor);
    const auger = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.5, 16), mats.bluePaint);
    auger.rotation.z = Math.PI / 2;
    auger.position.set(0.3, 0.12, 0.24);
    s1.add(auger);
    const starIn = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 18), mats.whitePlastic);
    starIn.position.set(1.25, 0.12, -0.15);
    s1.add(starIn);
    tagStation(s1, "ml-infeed", new THREE.Vector3(-1.1, 0, 0.6));
    root.add(s1);

    // Hilera de frascos farmacéuticos en tránsito por la línea
    for (let i = 0; i < 12; i++) {
      const btl = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 14), mats.copper);
      body.position.y = 0.16;
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 12), mats.whitePlastic);
      neck.position.y = 0.36;
      btl.add(body, neck);
      btl.position.set(-4.2 + i * 0.72, 1.06, 0.35);
      root.add(btl);
      anim.bottles.push({ group: btl, idx: i });
    }

    // S2: Tina de producto con mezclador, jeringas M6G91401111 y válvulas cerámicas M6A71700810
    const s2 = new THREE.Group();
    s2.position.set(-1.6, 1.55, -0.15);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.56, 0.95, 24), mats.steel);
    tank.position.set(0, 0.48, -0.45);
    s2.add(tank);
    const mixerMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.36, 14), mats.bluePaint);
    mixerMotor.position.set(0, 1.12, -0.45);
    s2.add(mixerMotor);
    anim.mixer = mixerMotor;

    const syringeBank = new THREE.Group();
    for (let k = -1.5; k <= 1.5; k += 1) {
      const syr = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.52, 14), mats.steel);
      syr.position.set(k * 0.28, -0.05, 0.1);
      const valve = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), mats.whitePlastic);
      valve.position.set(k * 0.28, 0.24, 0.1);
      syringeBank.add(syr, valve);
    }
    s2.add(syringeBank);
    anim.syringes = syringeBank;

    const nozzleBar = new THREE.Group();
    const barBeam = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.18), mats.brass);
    nozzleBar.add(barBeam);
    for (let k = -1.5; k <= 1.5; k += 1) {
      const canula = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.42, 10), mats.steel);
      canula.position.set(k * 0.28, -0.22, 0);
      nozzleBar.add(canula);
    }
    nozzleBar.position.set(0, 0.35, 0.5);
    s2.add(nozzleBar);
    anim.nozzles = nozzleBar;
    tagStation(s2, "ml-dosing", new THREE.Vector3(-0.4, 0.8, -0.6));
    root.add(s2);

    // S3: Alimentadores vibratorios REOVIB MFS 268 y cabezal preroscado / subtapa M6A17102244
    const s3 = new THREE.Group();
    s3.position.set(0.6, 1.55, -0.15);
    const bowlSub = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.46, 0.34, 24), mats.brushedAlu);
    bowlSub.position.set(-0.1, 0.55, -0.48);
    s3.add(bowlSub);
    const preCapHead = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.62, 18), mats.brass);
    preCapHead.position.set(0.15, 0.25, 0.45);
    s3.add(preCapHead);
    anim.subCapHead = preCapHead;
    tagStation(s3, "ml-subcap", new THREE.Vector3(0.2, 0.9, -0.6));
    root.add(s3);

    // S4: Torreta de tapado roscado M6A29101161 y mandriles de 3 patas M6A19501012
    const s4 = new THREE.Group();
    s4.position.set(2.35, 1.65, 0.1);
    const bowlCap = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.5, 0.38, 24), mats.brushedAlu);
    bowlCap.position.set(0.35, 0.52, -0.62);
    s4.add(bowlCap);
    const turretCol = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.95, 20), mats.steel);
    turretCol.position.set(-0.1, 0.15, 0.1);
    s4.add(turretCol);

    for (let c = 0; c < 3; c++) {
      const a = (c / 3) * Math.PI * 2;
      const chuck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.45, 14), mats.bluePaint);
      chuck.position.set(-0.1 + Math.cos(a) * 0.35, 0.05, 0.1 + Math.sin(a) * 0.35);
      s4.add(chuck);
      anim.capChucks.push({ mesh: chuck, baseA: a });
    }
    tagStation(s4, "ml-capping", new THREE.Vector3(0.8, 0.8, 0.5));
    root.add(s4);

    // S5: Salida, expulsión de rechazos y consola Siemens SIMATIC IPC677D + armario Beckhoff
    const s5 = new THREE.Group();
    s5.position.set(4.15, 1.35, 0.25);
    const rejectGate = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.35), mats.brass);
    rejectGate.position.set(-0.4, -0.18, 0.25);
    s5.add(rejectGate);
    const ipcPanel = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.48, 0.12), mats.bluePaint);
    ipcPanel.position.set(0.25, 0.55, 0.65);
    ipcPanel.rotation.y = -0.35;
    s5.add(ipcPanel);
    tagStation(s5, "ml-outfeed", new THREE.Vector3(1.2, 0.2, 0.6));
    root.add(s5);

    return {
      root,
      update(phaseRad) {
        if (anim.mixer) anim.mixer.rotation.y = phaseRad * 3;
        const plunge = Math.sin(phaseRad * 2);
        if (anim.nozzles) anim.nozzles.position.y = 0.32 + plunge * 0.14;
        if (anim.subCapHead) {
          anim.subCapHead.position.y = 0.24 - Math.max(0, Math.sin(phaseRad * 2)) * 0.14;
          anim.subCapHead.rotation.y = phaseRad * 4;
        }
        anim.capChucks.forEach((ch, idx) => {
          const a = ch.baseA + phaseRad;
          ch.mesh.position.x = -0.1 + Math.cos(a) * 0.35;
          ch.mesh.position.z = 0.1 + Math.sin(a) * 0.35;
          ch.mesh.position.y = 0.05 + Math.sin(phaseRad * 3 + idx) * 0.1;
          ch.mesh.rotation.y = -phaseRad * 5;
        });
        const shift = ((phaseRad / (Math.PI * 2)) % 1) * 0.72;
        anim.bottles.forEach((b) => {
          b.group.position.x = -4.2 + b.idx * 0.72 + shift;
        });
      }
    };
  }

  // --------------------------------------------------------------------------
  //  PERIFÉRICOS INDUSTRIALES 3D COMUNES (TORRETA ANDON, FRL NEUMÁTICO, PISO)
  // --------------------------------------------------------------------------
  function buildIndustrialPeripherals(THREE, mats, bbox) {
    const group = new THREE.Group();
    const maxX = Math.max(2.6, bbox.max.x + 0.85);
    const maxY = Math.max(2.6, bbox.max.y);
    const minZ = Math.min(-1.2, bbox.min.z - 0.55);

    // Losa de piso industrial epóxico + franja amarilla de demarcación de seguridad
    const slabW = Math.max(8, (bbox.max.x - bbox.min.x) + 3.4);
    const slabD = Math.max(5.6, (bbox.max.z - bbox.min.z) + 3.0);
    const floorSlab = new THREE.Mesh(
      new THREE.BoxGeometry(slabW, 0.06, slabD),
      new THREE.MeshStandardMaterial({ color: 0x162032, metalness: 0.2, roughness: 0.75 })
    );
    floorSlab.position.y = -0.03;
    floorSlab.receiveShadow = true;
    group.add(floorSlab);

    // Perímetro amarillo de seguridad industrial en el piso
    const borderMat = mats.hazardYellow;
    const bThick = 0.09;
    const frontStrip = new THREE.Mesh(new THREE.BoxGeometry(slabW, 0.01, bThick), borderMat);
    frontStrip.position.set(0, 0.005, slabD / 2 - bThick / 2);
    const backStrip = new THREE.Mesh(new THREE.BoxGeometry(slabW, 0.01, bThick), borderMat);
    backStrip.position.set(0, 0.005, -slabD / 2 + bThick / 2);
    const leftStrip = new THREE.Mesh(new THREE.BoxGeometry(bThick, 0.01, slabD), borderMat);
    leftStrip.position.set(-slabW / 2 + bThick / 2, 0.005, 0);
    const rightStrip = new THREE.Mesh(new THREE.BoxGeometry(bThick, 0.01, slabD), borderMat);
    rightStrip.position.set(slabW / 2 - bThick / 2, 0.005, 0);
    group.add(frontStrip, backStrip, leftStrip, rightStrip);

    // Torreta luminosa Andon tricolor (Rojo / Ámbar / Verde) montada sobre mástil inoxidable
    const andonGroup = new THREE.Group();
    andonGroup.position.set(maxX * 0.72, maxY, 0);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.75, 12), mats.steel);
    mast.position.y = 0.35;
    andonGroup.add(mast);

    const baseCap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16), mats.darkSteel);
    baseCap.position.y = 0.72;
    andonGroup.add(baseCap);

    const greenLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.16, 18), mats.ledGreen);
    greenLamp.position.y = 0.84;
    const amberLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.16, 18), mats.ledAmber);
    amberLamp.position.y = 1.01;
    const redLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.16, 18), mats.ledRed);
    redLamp.position.y = 1.18;
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.05, 18), mats.darkSteel);
    topCap.position.y = 1.29;
    andonGroup.add(greenLamp, amberLamp, redLamp, topCap);

    const andonLight = new THREE.PointLight(0x16c76a, 0.9, 6);
    andonLight.position.set(0, 1.05, 0);
    andonGroup.add(andonLight);
    group.add(andonGroup);

    // Unidad neumática FRL (Filtro-Regulador-Lubricador + Manómetro + Isla de válvulas)
    const frlGroup = new THREE.Group();
    frlGroup.position.set(-maxX * 0.65, 1.05, minZ);
    const manifoldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.48, 0.12), mats.brushedAlu);
    frlGroup.add(manifoldPlate);
    for (let i = -1; i <= 1; i++) {
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.34, 14), mats.bluePaint);
      bowl.position.set(i * 0.2, 0, 0.1);
      frlGroup.add(bowl);
    }
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16), mats.whitePlastic);
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(0, 0.08, 0.19);
    frlGroup.add(gauge);
    group.add(frlGroup);

    return {
      group,
      greenLamp,
      amberLamp,
      redLamp,
      andonLight
    };
  }

  // --------------------------------------------------------------------------
  //  INICIALIZADOR DE ESCENA WEBGL THREE.JS + CÁMARA ORBITAL + HOTSPOTS
  // --------------------------------------------------------------------------
  function initGemelo3DForMachine(machine) {
    disposeActiveTwin();
    const arch = getTwinArchetype(machine);
    const spec = arch && TWIN_SPECS[arch];
    const canvas = document.getElementById("g3dCanvas");
    const viewport = document.getElementById("g3dViewport");
    const pinsOverlay = document.getElementById("g3dPinsOverlay");
    if (!spec || !canvas || !viewport || typeof window.THREE === "undefined") return;

    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1220);
    scene.fog = new THREE.FogExp2(0x0b1220, 0.015);

    const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 140);

    // Iluminación de estudio industrial con sombras suaves
    const hemi = new THREE.HemisphereLight(0xe2f1ff, 0x1e293b, 0.92);
    scene.add(hemi);
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.22);
    dir1.position.set(11, 18, 13);
    dir1.castShadow = true;
    dir1.shadow.mapSize.width = 1024;
    dir1.shadow.mapSize.height = 1024;
    dir1.shadow.camera.near = 1;
    dir1.shadow.camera.far = 45;
    const dCam = 12;
    dir1.shadow.camera.left = -dCam;
    dir1.shadow.camera.right = dCam;
    dir1.shadow.camera.top = dCam;
    dir1.shadow.camera.bottom = -dCam;
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x60a5fa, 0.58);
    dir2.position.set(-14, 9, -11);
    scene.add(dir2);

    const dir3 = new THREE.DirectionalLight(0xfde68a, 0.28);
    dir3.position.set(0, 6, 14);
    scene.add(dir3);

    // Piso técnico con retícula CAD
    const grid = new THREE.GridHelper(28, 28, 0x334155, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    const mats = createIndustrialMaterials(THREE);

    // Plano de corte seccional CAD (activo cuando state.cutaway = true)
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.18);

    // Construir el modelo 3D según el arquetipo
    let modelBuilder;
    if (arch === "njp3500") modelBuilder = buildNjpTwin(THREE, mats, false);
    else if (arch === "njp1200") modelBuilder = buildNjpTwin(THREE, mats, true);
    else if (arch === "gkf2600") modelBuilder = buildGkf2600Twin(THREE, mats);
    else if (arch === "ms235") modelBuilder = buildMs235Twin(THREE, mats);
    else if (arch === "integra320") modelBuilder = buildBlisterLineTwin(THREE, mats, false);
    else if (arch === "blister3") modelBuilder = buildBlisterLineTwin(THREE, mats, true);
    else if (arch === "controlsa114rl") modelBuilder = buildControlsaTwin(THREE, mats);
    else if (arch === "fx30prostep") modelBuilder = buildFx30Twin(THREE, mats);
    else if (arch === "stickpack") modelBuilder = buildStickpackTwin(THREE, mats);
    else if (arch === "hdgc400") modelBuilder = buildHdgc400Twin(THREE, mats);
    else if (arch === "ml642") modelBuilder = buildMl642Twin(THREE, mats);

    // Habilitar proyección y recepción de sombras en todas las piezas 3D
    modelBuilder.root.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = !obj.userData.isCasing;
        obj.receiveShadow = true;
      }
    });

    scene.add(modelBuilder.root);

    // Calcular caja envolvente para posicionar periféricos industriales (Andon, FRL, losa)
    const bbox = new THREE.Box3().setFromObject(modelBuilder.root);
    const peripherals = buildIndustrialPeripherals(THREE, mats, bbox);
    scene.add(peripherals.group);

    // Crear los pines flotantes 3D->2D en el overlay
    pinsOverlay.innerHTML = spec.stations.map((st) => `
      <button type="button" class="g3d-pin" data-pin-id="${st.id}" onclick="window.g3dFocusStation('${st.id}')">
        <span class="g3d-pin__num">${st.num}</span>
        <span class="g3d-pin__lbl">${st.name.split("·")[0].trim()}</span>
      </button>
    `).join("");

    const defCam = spec.defaultCam;
    const state = {
      machine,
      arch,
      spec,
      THREE,
      renderer,
      scene,
      camera,
      mats,
      clipPlane,
      peripherals,
      model: modelBuilder,
      playing: true,
      speed: 1.0,
      phaseDeg: 0,
      xray: false,
      cutaway: false,
      exploded: false,
      explodeProgress: 0,
      selectedStationId: spec.stations[0].id,
      activeFault: null,
      faultStationId: null,
      doorImpactPhase: 0,
      camCur: { theta: defCam.theta, phi: defCam.phi, radius: defCam.radius, target: new THREE.Vector3(...defCam.target) },
      camGoal: { theta: defCam.theta, phi: defCam.phi, radius: defCam.radius, target: new THREE.Vector3(...defCam.target) },
      drag: { active: false, pan: false, x: 0, y: 0, moved: false }
    };
    activeCtx = state;

    // Control orbital por puntero y selección por Raycaster
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    canvas.addEventListener("pointerdown", (e) => {
      state.drag.active = true;
      state.drag.pan = e.button === 2 || e.shiftKey;
      state.drag.x = e.clientX;
      state.drag.y = e.clientY;
      state.drag.moved = false;
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!state.drag.active) return;
      const dx = e.clientX - state.drag.x;
      const dy = e.clientY - state.drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) state.drag.moved = true;
      state.drag.x = e.clientX;
      state.drag.y = e.clientY;

      if (state.drag.pan) {
        const panScale = state.camGoal.radius * 0.0015;
        state.camGoal.target.x -= dx * panScale;
        state.camGoal.target.y += dy * panScale;
      } else {
        state.camGoal.theta -= dx * 0.0075;
        state.camGoal.phi = Math.max(0.22, Math.min(1.48, state.camGoal.phi - dy * 0.0065));
      }
    });

    canvas.addEventListener("pointerup", (e) => {
      const wasClick = !state.drag.moved;
      state.drag.active = false;
      if (wasClick && e.button === 0) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(modelBuilder.root.children, true);
        const hit = hits.find((h) => h.object?.userData?.stationId);
        if (hit) {
          window.g3dFocusStation(hit.object.userData.stationId);
        }
      }
    });

    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      state.camGoal.radius = Math.max(4.0, Math.min(30, state.camGoal.radius * factor));
    }, { passive: false });

    const resize = () => {
      if (!viewport.clientWidth) return;
      const w = viewport.clientWidth;
      const h = Math.max(440, viewport.clientHeight || 520);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    state.ro = new ResizeObserver(resize);
    state.ro.observe(viewport);
    resize();

    // Bucle de animación en tiempo real
    let lastTime = performance.now();
    const projVec = new THREE.Vector3();

    function animate(now) {
      if (activeCtx !== state) return;
      state.rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (state.playing) {
        state.phaseDeg = (state.phaseDeg + dt * 52 * state.speed) % 360;
        const degInt = Math.round(state.phaseDeg);
        const slider = document.getElementById("g3dPhaseRange");
        const valEl = document.getElementById("g3dPhaseVal");
        if (slider) slider.value = String(degInt);
        if (valEl) valEl.textContent = degInt + "°";
      }

      // Actualizar cursor del diagrama de sincronismo 0°–360° y lectura HUD
      const degRounded = Math.round(state.phaseDeg);
      const cursorEl = document.getElementById("g3dTimingCursor");
      const badgeEl = document.getElementById("g3dTimingBadge");
      const readoutEl = document.getElementById("g3dCycleReadout");
      if (cursorEl) cursorEl.style.left = ((state.phaseDeg / 360) * 100).toFixed(2) + "%";
      if (badgeEl) badgeEl.textContent = `Fase actual: ${degRounded}°`;
      if (readoutEl) {
        const speedPct = Math.round(state.speed * 100);
        readoutEl.textContent = `Ángulo maestro: ${degRounded}° · Vel: ${speedPct}%`;
      }

      // Actualizar Torreta Andon 3D y HUD superior según estado (Normal / Pausa Manual / Falla)
      const blink = Math.sin(now * 0.012) > 0;
      const hasFault = !!state.activeFault;
      mats.ledGreen.emissiveIntensity = (!hasFault && state.playing) ? 1.1 : 0.08;
      mats.ledAmber.emissiveIntensity = (!hasFault && !state.playing) ? 1.0 : 0.08;
      mats.ledRed.emissiveIntensity = hasFault ? (blink ? 1.5 : 0.2) : 0.08;
      if (peripherals.andonLight) {
        if (hasFault) {
          peripherals.andonLight.color.setHex(0xef4444);
          peripherals.andonLight.intensity = blink ? 1.5 : 0.25;
        } else if (state.playing) {
          peripherals.andonLight.color.setHex(0x16c76a);
          peripherals.andonLight.intensity = 0.85;
        } else {
          peripherals.andonLight.color.setHex(0xf59e0b);
          peripherals.andonLight.intensity = 0.75;
        }
      }

      const lampG = document.getElementById("g3dLampG");
      const lampA = document.getElementById("g3dLampA");
      const lampR = document.getElementById("g3dLampR");
      const andonTxt = document.getElementById("g3dAndonText");
      if (lampG && lampA && lampR && andonTxt) {
        lampG.classList.toggle("is-green", !hasFault && state.playing);
        lampA.classList.toggle("is-amber", !hasFault && !state.playing);
        lampR.classList.toggle("is-red", hasFault);
        if (hasFault) {
          andonTxt.textContent = `ALARMA ACTIVA: ${state.activeFault.name.toUpperCase()}`;
        } else if (state.playing) {
          andonTxt.textContent = "TORRETA ANDON: RUN AUTOMÁTICO";
        } else {
          andonTxt.textContent = "MODO JOG / VOLANTE MANUAL";
        }
      }

      // Interpolación suave de vista explotada
      const targetExplode = state.exploded ? 1 : 0;
      state.explodeProgress += (targetExplode - state.explodeProgress) * 0.12;
      modelBuilder.root.traverse((obj) => {
        if (obj.userData.basePos && obj.userData.explodeVec) {
          obj.position.copy(obj.userData.basePos).addScaledVector(obj.userData.explodeVec, state.explodeProgress);
        }
      });

      // Actualizar cinemática de la máquina
      const phaseRad = (state.phaseDeg * Math.PI) / 180;
      modelBuilder.update(phaseRad, dt, state);

      // Interpolación suave de cámara orbital
      state.camCur.theta += (state.camGoal.theta - state.camCur.theta) * 0.14;
      state.camCur.phi += (state.camGoal.phi - state.camCur.phi) * 0.14;
      state.camCur.radius += (state.camGoal.radius - state.camCur.radius) * 0.14;
      state.camCur.target.lerp(state.camGoal.target, 0.14);

      const sinPhi = Math.sin(state.camCur.phi);
      camera.position.set(
        state.camCur.target.x + state.camCur.radius * sinPhi * Math.sin(state.camCur.theta),
        state.camCur.target.y + state.camCur.radius * Math.cos(state.camCur.phi),
        state.camCur.target.z + state.camCur.radius * sinPhi * Math.cos(state.camCur.theta)
      );
      camera.lookAt(state.camCur.target);

      renderer.render(scene, camera);

      // Proyectar pines 3D sobre la vista 2D
      const w = viewport.clientWidth;
      const h = viewport.clientHeight;
      spec.stations.forEach((st) => {
        const pin = pinsOverlay.querySelector(`[data-pin-id="${st.id}"]`);
        if (!pin) return;
        projVec.set(st.pos[0], st.pos[1], st.pos[2]);
        projVec.project(camera);
        if (projVec.z > 1) {
          pin.style.display = "none";
          return;
        }
        const x = (projVec.x * 0.5 + 0.5) * w;
        const y = (-projVec.y * 0.5 + 0.5) * h;
        pin.style.display = "inline-flex";
        pin.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        pin.classList.toggle("is-selected", state.selectedStationId === st.id);
        pin.classList.toggle("is-fault", state.faultStationId === st.id);
      });
    }

    state.rafId = requestAnimationFrame(animate);
  }

  // --------------------------------------------------------------------------
  //  ACCIONES INTERACTIVAS DE LA BARRA DE HERRAMIENTAS 3D
  // --------------------------------------------------------------------------
  window.g3dTogglePlay = function () {
    if (!activeCtx) return;
    activeCtx.playing = !activeCtx.playing;
    const icon = document.getElementById("g3dPlayIcon");
    const txt = document.getElementById("g3dPlayTxt");
    if (icon) icon.textContent = activeCtx.playing ? "⏸" : "▶️";
    if (txt) txt.textContent = activeCtx.playing ? "Pausar" : "Reanudar";
  };

  window.g3dSetSpeed = function (val) {
    if (!activeCtx) return;
    activeCtx.speed = parseFloat(val) || 1.0;
  };

  window.g3dScrubPhase = function (deg) {
    if (!activeCtx) return;
    activeCtx.playing = false;
    activeCtx.phaseDeg = ((parseFloat(deg) || 0) % 360 + 360) % 360;
    const icon = document.getElementById("g3dPlayIcon");
    const txt = document.getElementById("g3dPlayTxt");
    const valEl = document.getElementById("g3dPhaseVal");
    const slider = document.getElementById("g3dPhaseRange");
    if (icon) icon.textContent = "▶️";
    if (txt) txt.textContent = "Reanudar";
    if (valEl) valEl.textContent = Math.round(activeCtx.phaseDeg) + "°";
    if (slider) slider.value = String(Math.round(activeCtx.phaseDeg));
  };

  window.g3dClickTimingBar = function (evt) {
    if (!activeCtx) return;
    const tracks = document.getElementById("g3dTimingTracks");
    if (!tracks) return;
    const rect = tracks.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (evt.clientX - rect.left) / rect.width));
    window.g3dScrubPhase(Math.round(ratio * 360));
  };

  window.g3dToggleXray = function () {
    if (!activeCtx) return;
    activeCtx.xray = !activeCtx.xray;
    activeCtx.mats.casingMat.opacity = activeCtx.xray ? 0.16 : 1.0;
    activeCtx.mats.casingMat.depthWrite = !activeCtx.xray;
    activeCtx.mats.glassGuard.opacity = activeCtx.xray ? 0.06 : 0.24;
    document.getElementById("g3dXrayBtn")?.classList.toggle("is-active", activeCtx.xray);
  };

  window.g3dToggleCutaway = function () {
    if (!activeCtx) return;
    activeCtx.cutaway = !activeCtx.cutaway;
    const planes = activeCtx.cutaway ? [activeCtx.clipPlane] : [];
    activeCtx.model.root.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material.clippingPlanes = planes;
        obj.material.needsUpdate = true;
      }
    });
    document.getElementById("g3dCutBtn")?.classList.toggle("is-active", activeCtx.cutaway);
  };

  window.g3dToggleFullscreen = function () {
    const shell = document.getElementById("g3dShell");
    if (!shell) return;
    if (!document.fullscreenElement) {
      shell.requestFullscreen?.().catch(() => {
        shell.classList.toggle("is-fullscreen");
      });
    } else {
      document.exitFullscreen?.();
    }
  };

  window.g3dToggleExplode = function () {
    if (!activeCtx) return;
    activeCtx.exploded = !activeCtx.exploded;
    document.getElementById("g3dExplodeBtn")?.classList.toggle("is-active", activeCtx.exploded);
  };

  window.g3dResetCamera = function () {
    if (!activeCtx) return;
    const d = activeCtx.spec.defaultCam;
    activeCtx.camGoal.theta = d.theta;
    activeCtx.camGoal.phi = d.phi;
    activeCtx.camGoal.radius = d.radius;
    activeCtx.camGoal.target.set(...d.target);
  };

  window.g3dSetCameraPreset = function (preset) {
    if (!activeCtx) return;
    const d = activeCtx.spec.defaultCam;
    activeCtx.camGoal.target.set(...d.target);
    if (preset === "iso") {
      activeCtx.camGoal.theta = d.theta;
      activeCtx.camGoal.phi = d.phi;
      activeCtx.camGoal.radius = d.radius;
    } else if (preset === "front") {
      activeCtx.camGoal.theta = 0;
      activeCtx.camGoal.phi = 1.22;
      activeCtx.camGoal.radius = d.radius * 0.92;
    } else if (preset === "top") {
      activeCtx.camGoal.theta = 0;
      activeCtx.camGoal.phi = 0.25;
      activeCtx.camGoal.radius = d.radius * 1.05;
    } else if (preset === "side") {
      activeCtx.camGoal.theta = Math.PI / 2;
      activeCtx.camGoal.phi = 1.18;
      activeCtx.camGoal.radius = d.radius * 0.95;
    }
  };

  window.g3dTriggerDoorImpact = function () {
    if (!activeCtx) return;
    activeCtx.doorImpactPhase = 0.01;
    window.g3dFocusStation("ctrl-recuperador");
  };

  window.g3dFocusStation = function (stId) {
    if (!activeCtx) return;
    document.querySelectorAll("[data-st-chip]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.stChip === stId);
    });
    if (stId === "all") {
      window.g3dResetCamera();
      return;
    }
    const st = activeCtx.spec.stations.find((s) => s.id === stId);
    if (!st) return;
    activeCtx.selectedStationId = st.id;
    if (st.cam) {
      activeCtx.camGoal.theta = st.cam.theta;
      activeCtx.camGoal.phi = st.cam.phi;
      activeCtx.camGoal.radius = st.cam.radius;
      activeCtx.camGoal.target.set(...st.cam.target);
    }
    const insp = document.getElementById("g3dInspector");
    if (insp) {
      insp.innerHTML = renderStationInspectorHtml(activeCtx.machine, activeCtx.spec, st, activeCtx.activeFault);
    }
  };

  window.g3dSelectFault = function (idxStr) {
    if (!activeCtx) return;
    const sel = document.getElementById("g3dFaultSel");
    if (sel && sel.value !== String(idxStr)) sel.value = String(idxStr);

    if (idxStr === "" || idxStr === null || idxStr === undefined) {
      activeCtx.activeFault = null;
      activeCtx.faultStationId = null;
      document.querySelectorAll("[data-plc-led]").forEach((el) => {
        el.classList.remove("is-fault");
        el.classList.add("is-on");
      });
      const curSt = activeCtx.spec.stations.find((s) => s.id === activeCtx.selectedStationId) || activeCtx.spec.stations[0];
      const insp = document.getElementById("g3dInspector");
      if (insp) insp.innerHTML = renderStationInspectorHtml(activeCtx.machine, activeCtx.spec, curSt, null);
      return;
    }

    const fault = (activeCtx.machine.failureModes ?? [])[Number(idxStr)];
    if (!fault) return;
    activeCtx.activeFault = fault;

    // Resaltar señal PLC afectada en rojo
    document.querySelectorAll("[data-plc-led]").forEach((el, i) => {
      const isFaultLed = i === (Number(idxStr) % 6);
      el.classList.toggle("is-fault", isFaultLed);
      el.classList.toggle("is-on", !isFaultLed);
    });

    // Encontrar la estación 3D que corresponde al sistema de la falla
    const sysText = (fault.probableSystem + " " + fault.name).toLowerCase();
    const matchedSt = activeCtx.spec.stations.find((st) => {
      const m = (st.systemMatch + " " + st.name).toLowerCase();
      return sysText.split(/\s+/).some((w) => w.length >= 4 && m.includes(w.slice(0, 5)));
    }) || activeCtx.spec.stations[0];

    activeCtx.faultStationId = matchedSt.id;
    window.g3dFocusStation(matchedSt.id);
  };

  window.g3dJumpToTab = function (tabId) {
    const btn = document.querySelector(`#guideTabs [data-profile-tab="${tabId}"]`);
    if (btn) btn.click();
  };

  // Exportar API global
  window.GEMELO_3D = {
    hasGemelo3D,
    getTwinArchetype,
    renderGemelo3DPanel,
    initGemelo3DForMachine,
    disposeActiveTwin
  };
})();
