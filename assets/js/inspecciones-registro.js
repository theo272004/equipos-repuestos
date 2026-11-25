// Registro de inspecciones de planta pasadas a limpio.
//
// Aqui quedan escritos los reportes de inspeccion que se hacen en papel o se
// pasan por el grupo, para que la pagina los muestre siempre: en la vista
// "Inspecciones" y dentro de la ficha de cada equipo (pestana Repuestos y
// mantenimiento). A diferencia de las que se anotan con el boton "Nueva
// inspeccion" —que viven en el navegador y en la nube—, estas viajan con el
// repositorio, asi que las ve cualquiera que abra el sitio, aunque entre por
// primera vez o desde otro celular.
//
// Como anotar una nueva:
//   - "id"       identificador estable, no se repite ni se cambia nunca:
//                insp-AAAAMMDD-<codigo de equipo>-<asunto en pocas palabras>
//   - "eq"       codigo interno del equipo, tal como esta en assets/equipos.js
//   - "fecha"    AAAA-MM-DD (la del reporte)
//   - "tipo"     rutina | parada | correctiva | arranque
//   - "quien"    quien reviso; vacio si el reporte no lo dice
//   - "revisado" que se miro
//   - "hallazgos" que se encontro y que se hizo
//   - "piezas"   solo lo que queda PENDIENTE de cambiar (sale marcado en la
//                tabla de repuestos del equipo hasta que se registre el cambio):
//                { cod, d, q, urgencia: alta | media | baja }
//   - "estado"   "abierta" si queda trabajo pendiente, "cerrada" si no
//
window.INSPECCIONES_REGISTRO = [
  {
    id: "insp-20261124-blister8-formado-avance",
    eq: "Blíster 8",
    fecha: "2026-11-24",
    tipo: "parada",
    quien: "Luis Miguel (Lucho) · Grupo 4-3",
    revisado: "Estación de formado, seguidor de leva, sistema mecánico de avance (bujes/rodamientos), plancha porta-espárrago, tiempos mecánicos y eléctricos, formación, paso y sellado.",
    hallazgos: "Se bajó la estación de formado y se cambió el seguidor de leva que se encontraba partido. Se bajó el sistema mecánico de avance encontrando bujes totalmente desgastados, los cuales se reemplazaron por rodamientos. Se instaló todo, se tomaron tiempos mecánicos y eléctricos, se enhebró y se tomó formación, paso y sellado; el equipo quedó en velocidad 30 listo para limpieza. Nota del turno anterior: la plancha porta-espárrago tiene un orificio adelantado que ha partido espárragos repetidamente.",
    piezas: [
      { cod: "", d: "Rectificar plancha porta-espárrago en mecanizado (orificio adelantado que parte espárragos)", q: "1", urgencia: "alta", tipo: "mecanica" }
    ],
    fotos: [],
    estado: "abierta",
    createdAt: "2026-11-24T21:18:00.000Z"
  },
  {
    id: "insp-20261120-blister8-sellado",
    eq: "Blíster 8",
    fecha: "2026-11-20",
    tipo: "parada",
    quien: "Alexander Algarín · Grupo 4-1",
    revisado: "Estación de sellado, rodamientos lineales, anillos seeger, tiempo mecánico, formatería, parámetros de soplado/temperatura y túnel de calefacción.",
    hallazgos: "El 19/11 se bajó la estación de sellado para subir rodamientos lineales e instalar anillos seeger, encontrando pistas exteriores de rodamientos partidos en los bordes. El 20/11 se retiraron las piezas reparadas de mecanizado (extracción y montaje en prensa hidráulica CNC), se armó y lubricó la estación de sellado, se ubicó tiempo mecánico, se montó formatería, se ajustaron parámetros de soplado/temperatura y se calibró túnel de calefacción. Equipo entregado operativo.",
    piezas: [],
    fotos: [],
    estado: "cerrada",
    createdAt: "2026-11-20T07:34:00.000Z"
  },
  {
    id: "insp-20261120-141328043-captador",
    eq: "141328043",
    fecha: "2026-11-20",
    tipo: "rutina",
    quien: "Alexander Algarín · Grupo 4-1",
    revisado: "Captador de polvo (8 filtros cilíndricos), mermas y área técnica del Recubridor R400.",
    hallazgos: "Se limpiaron los 8 filtros cilíndricos del captador de polvo bajados en el turno anterior, se recogió y retiró la merma hasta el centro de acopio y se realizó limpieza y organización completa del área técnica.",
    piezas: [],
    fotos: [],
    estado: "cerrada",
    createdAt: "2026-11-20T07:34:00.000Z"
  },
  {
    id: "insp-20261115-17365011-fillomatic",
    eq: "17365011",
    fecha: "2026-11-15",
    tipo: "correctiva",
    quien: "Miguel De la Hoz · Grupo 4-2",
    revisado: "Sistema Fill-O-Matic (piñones de transmisión) y cargador de la Tableteadora Fette 2020-2.",
    hallazgos: "Se revisó el Fill-O-Matic encontrando 2 piñones con maltrato; se reemplazaron por piñones nuevos de stock y se entregó la pieza óptima. Nota del 16/11: el cargador se atascó y partió el fusible mecánico del Fill-O-Matic en dos ocasiones seguidas.",
    piezas: [
      { cod: "", d: "Revisar causa de atasco en cargador y verificar stock de fusibles mecánicos Fill-O-Matic", q: "2", urgencia: "alta", tipo: "mecanica" }
    ],
    fotos: [],
    estado: "abierta",
    createdAt: "2026-11-15T22:29:00.000Z"
  },
  {
    id: "insp-20261110-blister9-sellado",
    eq: "Blíster 9",
    fecha: "2026-11-10",
    tipo: "parada",
    quien: "Jhon Pájaro · Grupo 4-1",
    revisado: "Estación de sellado completa: rodamientos lineales, roscas M6 de sujeción de leva, eje seguidor de leva, resorte y tiempo mecánico.",
    hallazgos: "Intervención de 9 horas por problemas de filtración. Se bajó la estación de sellado, se cambiaron los rodamientos lineales, se repararon las roscas M6 de sujeción de la leva y se reemplazó el rodamiento del eje seguidor de leva junto con el resorte. Se armó y montó nuevamente en equipo, se ubicó tiempo mecánico, se realizaron pruebas OK y se entregó a producción.",
    piezas: [],
    fotos: [],
    estado: "cerrada",
    createdAt: "2026-11-10T19:43:00.000Z"
  },
  {
    id: "insp-20261110-17334017-cuchillas",
    eq: "17334017",
    fecha: "2026-11-10",
    tipo: "parada",
    quien: "Diego Chacón / Jhon Pájaro",
    revisado: "Bloque de corte Schmucker MS235: cuchillas verticales, rodamientos, resortes, limpiadores y tornillería de fijación.",
    hallazgos: "Se realizó mantenimiento al sistema de corte: se cambiaron las cuchillas verticales y sus rodamientos, se desmontaron cuchillas del bloque para afilar y limpiar, se engrasaron resortes, se voltearon limpiadores y se cambiaron 2 tornillos de fijación. Equipo entregado operativo.",
    piezas: [
      { cod: "", d: "Enviar a mecanizado juego de cuchillas de repuesto para afilado", q: "1", urgencia: "media", tipo: "mecanica" }
    ],
    fotos: [],
    estado: "abierta",
    createdAt: "2026-11-10T19:43:00.000Z"
  },
  {
    id: "insp-20261110-17303007-agitador",
    eq: "17303007",
    fecha: "2026-11-10",
    tipo: "parada",
    quien: "Oscar Hernández · Sede 2",
    revisado: "Motor agitador, chumacera, cuñas y campana de Tanque de Fabricación #2 (Sede 2).",
    hallazgos: "Se bajó el motor del agitador, se cambió la chumacera y las cuñas, se limpió la campana y se realizaron pruebas a 1800 rpm. Entregado operativo a supervisora.",
    piezas: [],
    fotos: [],
    estado: "cerrada",
    createdAt: "2026-11-10T20:46:00.000Z"
  },
  {
    id: "insp-20261109-17332002-tablero-sellado",
    eq: "17332002",
    fecha: "2026-11-09",
    tipo: "parada",
    quien: "Luis Miguel (Lucho) · Grupo 4-3",
    revisado: "Tablero eléctrico principal (tornillería y componentes eléctricos) y estación de sellado de Blíster 2.",
    hallazgos: "Se realizó mantenimiento preventivo al tablero eléctrico con ajuste de tornillería y limpieza de componentes eléctricos. Adicionalmente se armó y montó la estación de sellado, se cuadraron tiempos y quedó formando.",
    piezas: [],
    fotos: [],
    estado: "cerrada",
    createdAt: "2026-11-09T08:17:00.000Z"
  },
  {
    id: "insp-20261108-17332005-sellado-general",
    eq: "17332005",
    fecha: "2026-11-08",
    tipo: "parada",
    quien: "Alfonso Orozco / Samith Sanjuán · Sede 2",
    revisado: "Estación de sellado (camisa de rodamiento, seguidor de leva), electroválvula, mangueras de refrigeración/aire comprimido, cableado y lubricación general de Blíster 5.",
    hallazgos: "El 01/11 se desarmó la estación de sellado para corregir desplazamiento de rodamiento: se instaló anillo seeger en la camisa del rodamiento y se aplicó trabador de rosca al tornillo del seguidor de leva. El 08/11 se instalaron canaletas, se fijó la electroválvula, se organizaron mangueras de refrigeración, aire comprimido y cableado con amarres plásticos, y se realizó limpieza y lubricación general del equipo.",
    piezas: [],
    fotos: [],
    estado: "cerrada",
    createdAt: "2026-11-08T21:24:00.000Z"
  },
  {
    id: "insp-20261108-5101001-rodamientos",
    eq: "5101001",
    fecha: "2026-11-08",
    tipo: "parada",
    quien: "Alfonso Orozco / Samith Sanjuán · Sede 2",
    revisado: "Bomba de agua fría #25 (Sede 2): rodamientos, acople, carcasa, presión (manómetro 0–100 psi) y parte eléctrica.",
    hallazgos: "Se desmontó la bomba #25 por ruido anormal en rodamientos (dejando operando la #26). Se reemplazaron los rodamientos, se aplicó pintura azul, se acopló y conectó en sitio y el 19/11 se instaló manómetro 0–100 psi. ALERTA 24/11: la bomba presentó cortocircuito y quedó fuera de servicio (Sede 2 operando sin redundancia, solo con Bomba #26).",
    piezas: [
      { cod: "", d: "Diagnóstico eléctrico/rebobinado de Bomba #25 tras cortocircuito del 24/11 (Sede 2 sin respaldo de agua fría)", q: "1", urgencia: "alta", tipo: "electrica" }
    ],
    fotos: [],
    estado: "abierta",
    createdAt: "2026-11-08T21:24:00.000Z"
  },
  {
    id: "insp-20261108-17333009-limpieza-mecanica",
    eq: "17333009",
    fecha: "2026-11-08",
    tipo: "rutina",
    quien: "Grupo 4-2",
    revisado: "Sistema mecánico general, recolectores y sistema de lubricación por goteo de NJP 3.",
    hallazgos: "Se realizó limpieza integral de los recolectores, suministros del sistema de lubricación por goteo y limpieza total del sistema mecánico de la encapsuladora.",
    piezas: [],
    fotos: [],
    estado: "cerrada",
    createdAt: "2026-11-08T21:32:00.000Z"
  },
  {
    id: "insp-20261104-130378001-captador-filtros",
    eq: "130378001",
    fecha: "2026-11-04",
    tipo: "parada",
    quien: "Alexander Algarín / Jhon Pájaro / Diego Chacón",
    revisado: "Captador de polvo, blower, filtros Herding (20 uds), estructura porta-filtros, válvula de vapor by-pass y piso técnico WIP de Huttlin 400.",
    hallazgos: "Mantenimiento mayor entre el 29/10 y el 04/11: retiro de 18 filtros usados para destrucción, lavado profundo de captador de polvo y blower con alcohol, aire comprimido e hidrolavadora, reparación de roscas y cambio de tornillería de porta-filtros, instalación de 20 filtros Herding nuevos y cambio de válvula de vapor by-pass en piso técnico. Se probó 60 min en vacío sin alarmas y se entregó para limpieza profunda. Seguimiento posterior: se reportó fuga en válvula de vapor 1\" en piso técnico WIP (11/11) y fuga en el módulo de filtrado de la unidad de mantenimiento FRL del captador (15/11).",
    piezas: [
      { cod: "", d: "Válvula de vapor 1\" (piso técnico WIP — presenta fuga reportada el 11/11)", q: "1", urgencia: "alta", tipo: "pieza" },
      { cod: "", d: "Unidad de mantenimiento (FRL) del captador de polvo (fuga en módulo de filtrado reportada el 15/11)", q: "1", urgencia: "alta", tipo: "pieza" }
    ],
    fotos: [],
    estado: "abierta",
    createdAt: "2026-11-04T20:06:00.000Z"
  },
  {
    id: "insp-20261102-130378002-filtros-manga",
    eq: "130378002",
    fecha: "2026-11-02",
    tipo: "parada",
    quien: "Miguel De la Hoz / Yesid Anaya / Luis Miguel",
    revisado: "Filtros de manga (6 uds), porta-filtros, captador de polvo y tablero principal de proceso de Huttlin 600.",
    hallazgos: "Se reemplazaron los 6 filtros de manga del equipo y se soldó tornillo en porta-filtro. En intervenciones posteriores (07/11, 21/11 y 24/11) se realizó limpieza del captador de polvo y mantenimiento con ajuste de tornillería al tablero principal de proceso.",
    piezas: [],
    fotos: [],
    estado: "cerrada",
    createdAt: "2026-11-02T21:35:00.000Z"
  },
  {
    id: "insp-20260902-17333007-torreta",
    eq: "17333007",
    fecha: "2026-09-02",
    tipo: "parada",
    quien: "",
    revisado: "Torreta: desmontaje y verificación del estado de los rodamientos. Transmisión. Tablero eléctrico y cableado en contactores. Rectificadores.",
    hallazgos: "Se desmontó la torreta y se verificó el estado de los rodamientos, encontrándose en buen estado (OK). Se realizó limpieza y engrase general de la torreta. Se limpió el tablero eléctrico y se ajustó el cableado en contactores. Se realizó limpieza de la transmisión, la cual presentaba acumulación de producto. Se fabricó rosca M6 para los rectificadores, debido a que la rosca original se encontraba desgastada.",
    piezas: [],
    estado: "cerrada",
    createdAt: "2026-09-02T00:00:00.000Z"
  },
  {
    id: "insp-20260903-17332002-correas",
    eq: "17332002",
    fecha: "2026-09-03",
    tipo: "parada",
    quien: "",
    revisado: "Inspección y mantenimiento general del equipo: correas de sellado, accionamiento principal/reductor, moldeo/soplado y corte/troqueladora. Tablero eléctrico.",
    hallazgos: "Se realizó cambio de 3 correas por desgaste: 2 correas 741203124, correspondientes a sellado y accionamiento principal/reductor, y 1 correa 741203123, correspondiente a moldeo/soplado. Queda pendiente el cambio de la correa de corte/troqueladora 741203124, la cual queda marcada en rojo para la próxima intervención. Se realizó limpieza del tablero eléctrico.",
    piezas: [
      { cod: "741203124", d: "Correa dentada T20/1460 — corte/troqueladora (marcada en rojo para la próxima intervención)", q: "1", urgencia: "media" }
    ],
    estado: "abierta",
    createdAt: "2026-09-03T00:00:00.000Z"
  },
  {
    id: "insp-20260904-17334017-brazo-dosificador",
    eq: "17334017",
    fecha: "2026-09-04",
    tipo: "rutina",
    quien: "",
    revisado: "Brazo del sistema dosificador y sus componentes: estado y funcionamiento del mecanismo.",
    hallazgos: "Se realizó mantenimiento al brazo del sistema dosificador. Se efectuó limpieza y lubricación general del brazo y sus componentes, verificando el estado y funcionamiento del mecanismo. Sin novedades.",
    piezas: [],
    estado: "cerrada",
    createdAt: "2026-09-04T00:00:00.000Z"
  },
  {
    id: "insp-20260804-17332009-mantenimiento-general",
    eq: "17332009",
    fecha: "2026-08-04",
    tipo: "parada",
    quien: "",
    revisado: "Mantenimiento general del equipo: filtros de bomba, paletas de grafito, resortes de la plancha de formado, engranajes de los tornillos sin fin, mangueras de enfriamiento y racor, sensores fotoeléctricos.",
    hallazgos: "Se realizó limpieza de filtros de bomba y revisión de las paletas de grafito. Se cambiaron los resortes de la plancha de formado. Se realizó limpieza y lubricación de los engranajes de los tornillos sin fin. Se cambiaron las mangueras de enfriamiento y se realizó cambio de racor. Se calibraron los sensores fotoeléctricos del equipo.",
    piezas: [],
    estado: "cerrada",
    createdAt: "2026-08-04T00:00:00.000Z"
  }
];
