// Los conjuntos del gemelo de la MS235: en que se desarma, con que codigos del
// catalogo S4220003 se cruza y hacia donde sale cada uno al desarmar.
// Mundo en unidades de 4 mm: x a la derecha del operador, y hacia el operador
// (frente de la maquina), z hacia arriba. La pared de la maquina esta en y = 0.

export const PIEZAS = {
  bobina: {
    nombre: "Portabobinas y empalme",
    corto: "portabobinas · eje neumático Ø74 · bobina hasta Ø500",
    codigos: ["S4M16100110", "S4A26100410", "S4A26100920", "S4A26100220", "S4A92100720", "S4A95101310"],
    desc: "La bobina de papel va en el eje neumático Ø74 (S4A26100410) sobre dos cojinetes. La correa del portabobinas frena el desbobinado; la mesa de empalme une la bobina nueva sin parar la línea.",
    mover: [0, -260, 0],
  },
  desbobinado: {
    nombre: "Desbobinado, rodillos y cuchilla de corte",
    corto: "desbobinado · rodillos de reenvío · corte en dos bandas",
    codigos: ["S4A26100110", "S4A75100610"],
    desc: "Sube el papel desde la bobina por los rodillos de reenvío y desviación (S4A75100610), lo tensa con el balancín y lo parte en dos bandas con la cuchilla circular antes de pasarlo por encima de la pared.",
    mover: [0, -70, 130],
  },
  guias: {
    nombre: "Guías de desviación del papel",
    corto: "guías a 45° · llevan cada banda al centro",
    codigos: ["S4M17100110", "S4A27100110"],
    desc: "Dos barras a 45° giran cada banda de papel hacia el centro, y los rodillos de desviación la bajan entre las placas de formado: las dos bandas quedan cara a cara para formar el sobre.",
    mover: [0, 0, 160],
  },
  fotocelula: {
    nombre: "Fotocélula de lectura de muesca",
    corto: "lector de muescas Datalogic TLu 115 · B30.10",
    codigos: ["S4M95100110"],
    desc: "Lee la muesca impresa del papel y corrige la fase del arrastre para que la impresión quede centrada en cada sobre. Limpiar el objetivo cada semana (Calibrado p.86).",
    mover: [80, 60, 40],
  },
  dosificacion: {
    nombre: "Dosificación: tolva, válvula estrella y cassette",
    corto: "dosificación volumétrica · estrella doble S4G722",
    codigos: ["S4G72200210", "S4G71500310", "S4G71500410", "S4A90100110"],
    desc: "La tolva alimenta la válvula estrella doble (S4G72200210), que entrega una dosis por puesto al cassette desmontable; el producto cae entre las dos bandas antes de cerrar el sobre.",
    mover: [0, 0, 170],
  },
  soldadura: {
    nombre: "Soldadura: placas, mordazas y membrana",
    corto: "placas soldantes · KM44.4 · membrana L=149",
    codigos: ["S4M14100110", "S4M15100110", "S4A21100230"],
    desc: "Las placas soldantes, calentadas por resistencias que habilita el contactor KM44.4, cierran sobre las dos bandas con las mordazas. Los tirantes con muelle dan la presión y la membrana neumática la descarga.",
    mover: [0, 160, 0],
  },
  arrastre: {
    nombre: "Mando de arrastre del papel",
    corto: "rodillos de arrastre · paso del sobre",
    codigos: ["S4M12100110"],
    desc: "Los rodillos de arrastre tiran de la banda ya soldada un paso por ciclo. Su desgaste y su presión deciden si el paso es regular (Calibrado p.69).",
    mover: [0, 120, -10],
  },
  corte: {
    nombre: "Corte: cuchillas verticales y horizontal",
    corto: "cuchillas circulares · cuchilla horizontal fija + móvil",
    codigos: ["S4A19100720"],
    desc: "Las cuchillas circulares separan los puestos y la cuchilla horizontal (fija + móvil) corta cada fila de sobres. Verificar cada semana la distancia entre cuchillas (Calibrado p.23-24).",
    mover: [0, 100, -30],
  },
  pinzas: {
    nombre: "Toma de sobres y pinzas",
    corto: "carro de pinzas · 6 sobres en 3 puestos",
    codigos: ["S4A12100110", "S4A19100110", "S4A08100610", "S4A71100310"],
    desc: "El carro de pinzas toma los sobres cortados (6 por ciclo en 3 puestos) y los deja en la cinta de salida. Lo mueve un cilindro neumático con juntas esféricas de mando.",
    mover: [0, 150, -40],
  },
  salida: {
    nombre: "Cinta transportadora de salida",
    corto: "cinta de salida · rodamientos 6202 / 6003",
    codigos: ["S4A70200210", "S4A92100510"],
    desc: "Saca los sobres hacia el encajado. Revisar cada semana desgaste, tensión y centrado de la lona (Calibrado p.120-121).",
    mover: [180, 20, 0],
  },
  motor: {
    nombre: "Motor principal y cadena en baño de aceite",
    corto: "motor principal · cadena en baño de aceite · volante",
    codigos: ["S4M02100110"],
    desc: "Detrás de la pared: el motor principal mueve el eje de levas por una cadena que trabaja en baño de aceite, con bomba y filtro DROPSA. El volante permite girar la máquina a mano.",
    mover: [0, -40, 200],
  },
  carter: {
    nombre: "Cárter trasero y tapa",
    corto: "tapa trasera con muelle de gas",
    codigos: ["M2M01100242", "2M01100214"],
    desc: "Cierra la caja de transmisión por detrás y por arriba. La tapa sube con un muelle de gas (2M01100214) para llegar a la cadena y al filtro.",
    mover: [0, -50, 160],
  },
  bastidor: {
    nombre: "Bastidor y estructura",
    corto: "bastidor · pared de la máquina · base",
    codigos: ["S4M01100110"],
    desc: "La base, la pared donde van montados los grupos y la caja de transmisión. No se mueve.",
    mover: [0, 0, 0],
  },
  hmi: {
    nombre: "PC de la máquina (HMI)",
    corto: "Siemens IPC477E 15\" en brazo giratorio",
    codigos: ["S3A95100310"],
    desc: "Panel de operador en brazo giratorio: recetas, alarmas y fases. Revisar cada año la documentación del PC (Calibrado p.48).",
    mover: [60, 50, 110],
  },
  armario: {
    nombre: "Armario eléctrico e instalación",
    corto: "armario QE1 · PLC Beckhoff · 5× Lenze i550",
    codigos: ["S7A96100120", "S4A96100120", "S4A95100110"],
    desc: "Armario QE1: interruptor general Q01.3, PLC Beckhoff EtherCAT, cinco variadores Lenze i550 y el mando de resistencias (KM44.4, relés estáticos A41.x).",
    mover: [180, -40, 0],
  },
  resguardos: {
    nombre: "Resguardos y puertas",
    corto: "resguardos con interruptores Euchner",
    codigos: ["S4A11100110", "S4A11100420", "S4A11100610", "S4A11100720"],
    desc: "Marco de perfiles y puertas de policarbonato con interruptores de seguridad Euchner CTP. La asignación de los grupos A11 está por confirmar en el catálogo.",
    mover: [0, 0, 320],
  },
  film: {
    nombre: "Recorrido del papel",
    corto: "bobina → corte en dos bandas → guías → soldadura → corte → cinta",
    codigos: [],
    desc: "El papel sale de la bobina, se parte en dos bandas, cada banda gira 90° en su guía y bajan cara a cara entre las placas: se sueldan, se llenan, se arrastran y se cortan en sobres.",
    // El papel no se mueve: se desvanece al desarmar. Este vector solo lo saca del
    // camino al medir quien tapa a quien en los estados de desarme.
    mover: [0, 0, 3000],
  },
};

// Orden del desarme: sale primero lo que tapa a los demas.
export const DESARME = ["resguardos", "film", "salida", "hmi", "armario", "dosificacion", "fotocelula", "guias", "bobina", "desbobinado", "carter", "pinzas", "corte", "arrastre", "soldadura", "motor", "bastidor"];

// Orden de lectura: el camino del papel y despues lo que lo mueve y lo protege.
export const LECTURA = ["bobina", "desbobinado", "guias", "fotocelula", "dosificacion", "soldadura", "arrastre", "corte", "pinzas", "salida", "motor", "carter", "bastidor", "hmi", "armario", "resguardos"];
