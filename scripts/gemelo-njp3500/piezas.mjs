// Los conjuntos del gemelo de la NJP-3500: en qué se desarma, qué dice el manual de cada
// uno, en qué páginas está y hacia dónde sale al desarmar.
//
// Las páginas son las del PDF manuales/njp3500/NJP3500-manual-fabricante.pdf (la página
// impresa es la del PDF menos 4: la vista general es la p.27 del PDF y lleva impreso "23").
// Los números entre paréntesis del nombre son los de la vista general (p.27).
//
// Mundo en milímetros: x a la derecha del operador, y hacia el operador (frente de la
// máquina), z hacia arriba. El centro del bastidor está en x = 0, y = 0.

export const PIEZAS = {
  bastidor: {
    nombre: "Bastidor, mesa y carenado",
    corto: "carcasa bronce · mesa de inox · 1435 × 1248 × 1960 mm",
    desc: "Estructura de la máquina: zócalo con patas niveladoras, cuatro columnas redondeadas, mesa de trabajo de inox donde van montadas las estaciones, techo y paneles traseros. Arriba la parte de trabajo; abajo la transmisión.",
    paginas: [27, 24, 33],
    mover: [0, 0, 0],
  },
  paneles: {
    nombre: "Tapas de la transmisión",
    corto: "panel frontal y laterales del cuerpo inferior",
    desc: "Tapas del cuerpo inferior. El manual pide abrir la puerta lateral de la transmisión para meter el volante en el eje del motor y girar la máquina a mano (p.115).",
    paginas: [27, 115],
    mover: [0, 620, 0],
  },
  resguardos: {
    nombre: "Ventanas y puertas de seguridad",
    corto: "puertas de vidrio con tiradores · ventanas laterales",
    desc: "Puertas delanteras y ventanas laterales transparentes para ver el trabajo. Si se abre un dispositivo de protección de la zona de trabajo, la máquina se detiene (7.1, p.21).",
    paginas: [21, 27],
    mover: [0, 720, 0],
  },
  hmi: {
    nombre: "Pantalla táctil y señalización (9)",
    corto: "Siemens SMART 1000 IE V3 10\" · baliza de 3 colores",
    desc: "Pantalla táctil Siemens SMART 1000 IE V3 de 10\" en caja de inox sobre brazo, con marcha, parada y paro de emergencia. Desde ella se arranca, se sube la tolva, se abren las cápsulas y se para (p.30). La baliza de tres colores va en la esquina del techo (foto).",
    paginas: [30, 127],
    mover: [520, 160, 0],
  },
  tolva_capsulas: {
    nombre: "Tolva de cápsulas y compuerta (1)",
    corto: "tolva de cápsulas vacías · compuerta regulable",
    desc: "Recibe las cápsulas vacías. La compuerta, subida o bajada con su tuerca, regula cuántas caen a la zona de descarga: lo normal es que se llene hasta la mitad (1.4.1, p.37-38).",
    paginas: [38, 118, 44],
    mover: [0, 0, 620],
  },
  carga: {
    nombre: "Dispositivo de carga de cápsulas (2)",
    corto: "dos grupos de tubos de carga · peine · tirantes y balancín",
    desc: "Los tubos de carga bajan una cápsula por golpe, el peine y los empujadores las ponen con la tapa arriba y las meten en el molde. Esta máquina lleva dos grupos de carga que trabajan a la vez (p.120). Lo mueven un tirante superior, un tirante inferior y un balancín desde las levas.",
    paginas: [44, 40, 43, 120],
    mover: [-300, 360, 260],
  },
  vacio: {
    nombre: "Separación por vacío",
    corto: "asiento de succión bajo el molde · holgura 1,8-2,5 mm",
    desc: "Bajo la estación de carga, el asiento de succión sube contra el molde inferior y el vacío separa el cuerpo de la tapa. En reposo la holgura entre asiento y molde es 1,8-2,5 mm (1.4.4, p.49-52). El vacío lo da la bomba de anillo líquido SK, regulada entre 0,02 y 0,04 MPa (p.85).",
    paginas: [52, 50, 85, 86],
    mover: [-160, 300, -60],
  },
  torreta: {
    nombre: "Plato giratorio y moldes (10)",
    corto: "12 estaciones · molde superior e inferior · 25 alojamientos",
    desc: "El plato de estaciones gira a pasos. En cada estación hay un molde superior (tapas) y uno inferior (cuerpos) de 25 alojamientos; el inferior sale hacia fuera para pasar bajo la dosificación. La holgura entre molde superior e inferior se calibra a 0,2-0,3 mm (1.4.5, p.54-55).",
    paginas: [55, 54, 97],
    mover: [0, 0, 330],
  },
  dosificacion: {
    nombre: "Dispositivo de llenado (11)",
    corto: "disco dosificador · plato de cobre · 5 golpes de compactación",
    desc: "El polvo cae al disco dosificador; cinco módulos de punzones lo compactan en tacos y el sexto los pasa al cuerpo de la cápsula. Holgura disco-plato de cobre 0,05-0,15 mm (p.61); bloqueador de polvo 0,05-0,1 mm (p.65).",
    paginas: [59, 64, 116, 61, 65],
    mover: [480, -40, 260],
  },
  polvo: {
    nombre: "Caja del motor de alimentación y tolva de polvo (8)",
    corto: "motor y reductor · agitador · tornillo sinfín · detector de nivel",
    desc: "El polvo se echa en la tolva; el agitador y el tornillo sinfín, movidos por el motor y el reductor de la caja, lo llevan parejo al llenado. El detector capacitivo de nivel va a 18-28 mm del disco (1.4.8 y 1.4.17, p.67 y p.92).",
    paginas: [92, 67],
    mover: [380, -120, 560],
  },
  rechazo: {
    nombre: "Dispositivo de rechazo (6)",
    corto: "cámara de aire · empujador · agujas inferiores",
    desc: "Saca las cápsulas que no se separaron y las manda al depósito. Holgura de 1,5-2 mm entre empujador y molde superior y de 1-1,5 mm entre cámara de aire y molde superior (1.4.10, p.71-72).",
    paginas: [72],
    mover: [120, -300, 200],
  },
  cierre: {
    nombre: "Dispositivo de cierre (5)",
    corto: "placa superior · punzones de cierre · tirante inferior",
    desc: "Los punzones suben y cierran la tapa sobre el cuerpo lleno contra la placa superior. La distancia a la placa es el largo de la cápsula cerrada (1.4.11, p.74-75).",
    paginas: [75],
    mover: [-160, -300, 200],
  },
  descarga: {
    nombre: "Dispositivo de descarga (4)",
    corto: "agujas de expulsión · canal de salida a la izquierda",
    desc: "Las agujas suben 1-2 mm sobre el molde superior y empujan la cápsula terminada al canal de salida. En el retorno deben quedar 1,5-2 mm bajo el molde inferior (1.4.12, p.77-78).",
    paginas: [78],
    mover: [-420, 0, 140],
  },
  limpieza: {
    nombre: "Dispositivo de limpieza (3)",
    corto: "soplado y aspiración de los moldes",
    desc: "Limpia los alojamientos antes de volver a cargar: sopla y aspira el polvo hacia el colector. Si los filtros o tubos se tapan, aparece ruido anormal (1.4.16, p.89-90).",
    paginas: [90, 78],
    mover: [-380, 220, 200],
  },
  transmision: {
    nombre: "Parte de transmisión (7)",
    corto: "motor SEW R57 · cadena con tensor · árbol de 5 levas",
    desc: "El motorreductor SEW R57DRS112M4 mueve por cadena el árbol de levas: alimentación, succión, dosificación, descarga y cierre (p.81). El tensor de la cadena se ajusta con su eje y tuerca (1.4.14, p.83). El volante va en el eje trasero del motor para girar a mano.",
    paginas: [81, 83, 115, 131],
    mover: [0, 460, 0],
  },
};

// Orden del desarme: sale primero lo que tapa a los demás.
export const DESARME = ["resguardos", "paneles", "hmi", "tolva_capsulas", "polvo", "carga", "limpieza", "rechazo", "cierre", "descarga", "dosificacion", "torreta", "vacio", "transmision", "bastidor"];

// Orden de lectura: el camino de la cápsula y después lo que la mueve y la protege.
export const LECTURA = ["tolva_capsulas", "carga", "vacio", "torreta", "polvo", "dosificacion", "rechazo", "cierre", "descarga", "limpieza", "transmision", "hmi", "bastidor", "paneles", "resguardos"];
