// Componentes que se siguen por posición: dónde va cada uno en la máquina,
// cuándo se cambió, cuándo se inspeccionó y cuándo se va a necesitar otra vez.
//
// Sale en la ficha del equipo, pestaña Mantenimiento, como un bloque por
// componente. Como las inspecciones de inspecciones-registro.js, esto viaja con
// el repositorio: lo ve cualquiera que abra el sitio. Los cambios que se anotan
// después desde el propio bloque («Registrar cambio») van a la nube como
// cualquier otro cambio de repuesto y se suman a estos.
//
// Cómo anotar:
//   - "eq"        código interno del equipo (assets/equipos.js)
//   - "titulo"    nombre del grupo de bloques (Correas, Rodamientos…)
//   - items[]:
//       "id"         estable, no se cambia nunca (se usa para unir los cambios
//                    que se registren después en esa misma posición)
//       "ubicacion"  dónde va en la máquina
//       "cod", "d"   código interno de almacén y descripción
//       "cambios"    [{ fecha: AAAA-MM-DD, nota, fuente }] de la más vieja a la más nueva
//       "pendiente"  { desde, nota } si quedó marcada para cambiar
//       "nota"       algo que conviene saber de esa posición
//
window.COMPONENTES_SEGUIDOS = [
  {
    eq: "17332002",
    titulo: "Correas",
    // Informe de mantenimiento del 3 de septiembre de 2026 (el Word decía
    // «Blister 3» y 7 de septiembre por error: fue la Blister 2, el día 3).
    informe: "insp-20260903-17332002-correas",
    items: [
      {
        id: "b2-correa-sellado",
        ubicacion: "Estación de sellado",
        cod: "741203124",
        d: "Correa dentada T20/1460",
        cambios: [{ fecha: "2026-09-03", nota: "Desgaste: agrietamiento y pérdida de tensión", fuente: "Informe de mantenimiento" }],
        nota: "En el plan del Excel la correa de sellado de esta máquina figura como 741203123 (T20/1880); en este cambio se montó la 741203124 (T20/1460). Conviene confirmar cuál lleva."
      },
      {
        id: "b2-correa-accionamiento",
        ubicacion: "Accionamiento principal (reductor)",
        cod: "741203124",
        d: "Correa dentada T20/1460",
        cambios: [{ fecha: "2026-09-03", nota: "Desgaste: agrietamiento y pérdida de tensión", fuente: "Informe de mantenimiento" }]
      },
      {
        id: "b2-correa-moldeo",
        ubicacion: "Estación de moldeo (soplado)",
        cod: "741203123",
        d: "Correa dentada T20/1880",
        cambios: [
          { fecha: "2025-07-14", nota: "Último cambio según el plan del Excel (formado)", fuente: "Plan de mantenimiento" },
          { fecha: "2026-09-03", nota: "Desgaste: agrietamiento y pérdida de tensión", fuente: "Informe de mantenimiento" }
        ]
      },
      {
        id: "b2-correa-troqueladora",
        ubicacion: "Estación de corte / troqueladora",
        cod: "741203124",
        d: "Correa dentada T20/1460",
        cambios: [],
        pendiente: { desde: "2026-09-03", nota: "Quedó marcada en rojo en el mantenimiento del 3 de septiembre para cambiarla en la próxima intervención." }
      }
    ]
  },
  {
    eq: "17332003",
    titulo: "Correas",
    // Cambio de septiembre de 2026 en la Blíster 3. La fecha sale del Excel de
    // mantenimiento del 8 de octubre (sistema motriz, ejecutado el 25-sep-2026).
    items: [
      {
        id: "b3-correa-corta-atras",
        ubicacion: "Sistema motriz · accionamiento principal (correa corta de atrás)",
        cod: "741203124",
        d: "Correa dentada T20/1460",
        cambios: [{
          fecha: "2026-09-25",
          nota: "Cambiada en el mantenimiento grande del 25 de septiembre, el mismo en que se cambiaron los rodamientos (6007 ZZ y de rodillo cilíndrico)",
          fuente: "Excel de mantenimiento (8 oct), sistema motriz"
        }],
        nota: "Ubicación por deducción, sin confirmar a la vista: el Excel de mantenimiento archiva este código en «Sistema motriz» (accionamiento principal; catálogo B1240, pág. 33, PN Uhlmann 901172) y la T20/1460 es la correa corta (la larga, de moldeo, es la T20/1880). El mismo código también sirve en sellado, perforación y troqueladora; si resultara ser una de ésas, se mueve esta posición. El manual (9.5.2, pág. 9-33) dice que esta correa la cambia el Servicio Técnico de Uhlmann."
      }
    ]
  }
  ,
  // Pendientes del 15 de octubre de 2026: bandas por cambiar. Los códigos del maestro
  // que aparecen en las notas son solo una pista; falta confirmar la referencia exacta.
  {
    eq: "17332003", nombre: "Blister 3", titulo: "Bandas",
    items: [
      {
        id: "b3-banda-troquel",
        ubicacion: "Banda transportadora del troquel",
        cod: "", d: "Banda transportadora sin fin (troquel)",
        cambios: [],
        pendiente: { desde: "2026-10-15", nota: "Cambiar la banda transportadora del troquel. Ya se le cambió la lona el 4 de octubre (reporte de turno)." },
        nota: "Falta el código. En el maestro hay 724001300 (banda MAT-02H 3.600×200 sin fin B1240) y la lona 724001280; confirmar cuál es."
      },
      {
        id: "b3-banda-transferencia",
        ubicacion: "Banda de transferencia",
        cod: "", d: "Banda de transferencia",
        cambios: [],
        pendiente: { desde: "2026-10-15", nota: "Cambiar la banda de transferencia." },
        nota: "Falta el código y la referencia."
      }
    ]
  },
  {
    eq: "17332005", nombre: "Blister 5", titulo: "Bandas",
    items: [
      {
        id: "b5-banda-troquel",
        ubicacion: "Banda del troquel",
        cod: "", d: "Banda del troquel",
        cambios: [],
        pendiente: { desde: "2026-10-15", nota: "Cambiar la banda del troquel." },
        nota: "Falta el código y la referencia."
      }
    ]
  },
  {
    eq: "17332002", nombre: "Blister 2", titulo: "Bandas",
    items: [
      {
        id: "b2-banda-transportadora",
        ubicacion: "Banda transportadora",
        cod: "", d: "Banda transportadora",
        cambios: [],
        pendiente: { desde: "2026-10-15", nota: "Cambiar la banda transportadora." },
        nota: "Falta el código. En el maestro hay 724001299 (banda MAT-02H 1.400×160 sin fin UPS300) y 741201010 (banda del troquel B2); confirmar cuál aplica."
      }
    ]
  }
];
