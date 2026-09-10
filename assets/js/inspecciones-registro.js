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
