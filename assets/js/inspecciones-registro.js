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
  },
  {
    id: "insp-20260802-141328042-consolidado-r200",
    eq: "141328042",
    fecha: "2026-08-02",
    tipo: "parada",
    quien: "",
    revisado: "1. Bombo y puerta frontal: interior del bombo y juntas perimetrales de la puerta.\n2. Brazo OptiArm: caja motorizada, husillo, movimiento manual del brazo, transmisión por correa y sistema tensor.\n3. Tapa del sistema de transmisión del OptiArm: fijaciones y roscas.\n4. Eje del OptiArm: levantamiento de medidas.\n5. Pistolas de pulverización.\n6. Sonda Optris CT.\n7. Reductor Bonfiglioli del giro del bombo: nivel de aceite, fugas, retenes y juntas externas.\n8. Motor de giro del bombo: fijación y conexiones eléctricas.\n9. Sistema de filtros y captación de polvo: presión diferencial.\n10. Filtros de la CTA: G4, F9 y H13.\n11. Sistema de lavado WIP: prueba de ciclo completo.\n12. Calentador de agua del WIP.\n13. Reductor Bonfiglioli de la bomba peristáltica.\n14. Motor de la bomba peristáltica.\n15. Distancia anilla–tubo del brazo OptiArm (referencia 4–5 mm).",
    hallazgos: "CONFORME\n· Interior del bombo en buen estado general, sin anomalías visibles relevantes.\n· Husillo del OptiArm correctamente lubricado, con buena presencia de grasa. Movimiento manual del brazo correcto.\n· Reductor Bonfiglioli del giro del bombo: nivel de aceite correcto en la mirilla, sin fugas, retenes y juntas externas sin pérdidas.\n· Motor de giro del bombo: fijaciones y conexiones eléctricas en buen estado.\n· Filtros de la CTA dentro de rango: G4 3 Pa, F9 25 Pa, H13 21 Pa.\n· Pistolas de pulverización y sonda Optris CT: sin falla que exija reemplazo, solo requieren limpieza.\n\nHALLAZGOS\n· Juntas perimetrales de la puerta frontal del bombo deterioradas, con pérdida de capacidad de sellado. Se determina su reemplazo.\n· Transmisión del OptiArm: correa desgastada y rodamiento del rodillo tensor desgastado. El tensor se reemplaza por un 6201 ZZ.\n· Tapa de la transmisión del OptiArm con fijación deficiente: faltaban 3 espárragos y 1 tornillo, una de las tapas estaba fijada con silicona y había tornillos sujetos con silicona en lugar de instalados en sus roscas. Compromete la fijación y la protección del conjunto.\n· Captación de polvo con presión diferencial elevada: ~515 Pa con el ventilador al 60 %, junto con las alarmas AL122 registradas previamente.\n· WIP: durante el ciclo de lavado se detectó presencia de agua en la zona inferior derecha.\n· Calentador de agua del WIP: marcas y escurrimiento de humedad en la zona inferior del conjunto. No se pudo establecer el punto exacto de origen durante la inspección.\n\nRESUELTO EN LA INTERVENCIÓN\n· Limpieza de los filtros del captador: los valores de presión se normalizaron y el sistema quedó dentro de lo esperado. No requiere cambio de filtros por ahora.\n· Se fabricaron los 3 espárragos y el tornillo que faltaban en la tapa del OptiArm.\n· Se levantaron las medidas del eje del OptiArm y se elaboró el plano, código 742002060.\n· Prueba del sistema WIP: el operario ejecutó el ciclo, el lavado funcionó correctamente y la máquina quedó bien lavada al finalizar.\n\nPENDIENTE\n· Montar correctamente la tapa del OptiArm, verificar el estado de las roscas y eliminar la silicona como método de fijación.\n· Fabricar el eje 742002060.\n· Definir dimensiones y fabricar la junta de la tapa del OptiArm, de unos 3 mm de espesor.\n· Localizar el origen de la fuga de agua del WIP: revisar conexiones, juntas, válvulas y drenajes del calentador.\n· Completar la inspección del reductor de la bomba peristáltica: nivel de aceite, fugas y especificación y cantidad de lubricante antes de intervenir.\n· Completar la identificación del motor de la bomba peristáltica: ubicación, fijaciones y conexiones eléctricas.\n· Medir la distancia anilla–tubo del OptiArm. No se localizó el punto exacto durante la inspección. Valor de referencia 4–5 mm.",
    piezas: [
      { cod: "", d: "Juntas perimetrales de la puerta del bombo — fabricar o solicitar según las dimensiones de las existentes", q: "1", urgencia: "alta" },
      { cod: "741203247", d: "Correa dentada 285L paso 9,5 mm TIP 075 A=3/4\" — transmisión del OptiArm", q: "1", urgencia: "alta" },
      { cod: "741901010", d: "Rodamiento de bola 6201 ZZ — rodillo tensor del OptiArm", q: "1", urgencia: "alta" },
      { cod: "742002060", d: "Eje del OptiArm — plano elaborado, pendiente de fabricación", q: "1", urgencia: "media" },
      { cod: "", d: "Junta de la tapa de transmisión del OptiArm — unos 3 mm de espesor, faltan dimensiones", q: "1", urgencia: "media" }
    ],
    estado: "abierta",
    createdAt: "2026-08-02T00:00:00.000Z"
  }
];
