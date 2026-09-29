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
  }
];
