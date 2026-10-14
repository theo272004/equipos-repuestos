// A que conjunto de la MS235 va cada intervencion del chat. La pagina del
// gemelo inlinea estas mismas funciones para clasificar mtto-data.js en vivo,
// asi que no pueden usar nada de fuera.

export function esMs235(r) {
  return /ms\s?235|schm?u+c?k+e?r|smu+c?k+e?r|smoker/i.test(`${r.eq} ${r.de}`);
}

export function piezaDeIntervencion(r) {
  const texto = `${r.de ?? ""} ${r.ac ?? ""}`.toLowerCase();
  const reglas = [
    [/guarda|resguardo|puerta|euchner/, "resguardos"],
    [/mordaz|plancha|sellad|soldad|sufridera|membrana|pesta[ñn]a|resistenc|temperatura/, "soldadura"],
    [/cuchill|cortar|corte /, "corte"],
    [/dosific|bloque|tolva|carga m[ií]n|carga m[aá]x|estrella|tornillo sin fin|peso/, "dosificacion"],
    [/banda|lona|cinta|transportador|ca[ií]da de sobres/, "salida"],
    [/pinza|toma de sobre|carro/, "pinzas"],
    [/bobina|empalme|desbobin/, "bobina"],
    [/fotoc|muesca|descentr|centrad/, "fotocelula"],
    [/arrastre|rodillo|rulo/, "arrastre"],
    [/cadena|aceite|volant|motor principal/, "motor"],
    [/codific|lote/, "soldadura"],
    [/pantalla|hmi|alarma/, "hmi"],
    [/tablero|el[eé]ctric|cable|contactor|breaker|variador|sensor/, "armario"],
    [/polea|pi[ñn][oó]n|correa/, "salida"],
    [/rodamiento|cojinete/, "motor"],
  ];
  for (const [re, pieza] of reglas) if (re.test(texto)) return pieza;
  const porClase = {
    "Sellado / mordazas": "soldadura",
    "Corte / troquel": "corte",
    "Dosificación / peso / llenado": "dosificacion",
    "Arrastre / paso / fotocelda": "arrastre",
    "Transmisión (rodamientos, correas, ejes)": "motor",
    "Codificado / impresión / etiquetas": "soldadura",
    "Eléctrico (protecciones y cableado)": "armario",
    "Control / HMI / variadores": "hmi",
    "Motores / bombas / agitadores": "motor",
    "Neumática / vacío": "pinzas",
  };
  return porClase[r.fa] ?? "bastidor";
}
