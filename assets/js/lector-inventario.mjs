// Lee el Excel de inventario que exporta el portal y saca las columnas que
// importan, SIN depender de como se titulen.
//
// Por que no basta con mirar los titulos: cada reporte del portal los escribe a
// su manera ("EXISTENCIA", "SALDO", "CANT. DISPONIBLE"...), a veces la cabecera
// no esta en la primera fila porque arriba va el logo y la fecha del reporte, y
// a veces viene en una hoja que no es la primera. Asi que se usan dos pistas y
// manda la segunda:
//   1. El titulo de la columna, comparado con los nombres habituales.
//   2. EL CONTENIDO. La columna del codigo interno es la que mas valores tiene
//      en comun con los codigos que el plan ya conoce. Eso no se puede falsear
//      con un titulo raro, y es lo que hace que el puente aguante si manana el
//      portal renombra una columna.
// Lo que se detecte se puede fijar a mano en portal.config.json -> columnas.

// Este modulo no importa nada a proposito: lo usan tanto el puente de MiPortal
// (Node, scripts/portal-bridge) como la app en el navegador (vista Almacen, que
// deja cargar el RE356 directamente). Quien lo llama le pasa el libro ya abierto
// y las utilidades de SheetJS; asi la deteccion de columnas vive en un solo
// sitio y no puede pasar que el puente entienda el reporte de una forma y la
// app de otra.

// El codigo interno viaja de formas distintas segun de donde venga: el Excel del
// portal puede darlo como numero (741903002 -> "741903002"), con .0 pegado si
// alguien lo abrio y lo guardo, o relleno de espacios. Se compara siempre asi.
export function normCod(v) {
  if (v === null || v === undefined) return "";
  let s = String(v).trim().toUpperCase();
  if (!s || s === "N/A" || s === "NA" || s === "-") return "";
  s = s.replace(/\.0+$/, "");            // 741903002.0 -> 741903002
  if (/^\d+(\.\d+)?E\+?\d+$/i.test(s)) {   // notacion cientifica de Excel
    const n = Number(s);
    if (Number.isFinite(n)) s = BigInt(Math.round(n)).toString();
  }
  return s.replace(/\s+/g, "");
}

export const norm = (s) =>
  String(s ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")   // quita tildes
    .toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();

// Nombres habituales de cada columna. Es solo una pista: si el contenido dice
// otra cosa, gana el contenido.
const TITULOS = {
  cod:   ["CODIGO", "CODIGO INTERNO", "COD", "ITEM", "ARTICULO", "CODIGO ARTICULO", "REFERENCIA", "MATERIAL", "SKU", "CODIGO MATERIAL"],
  desc:  ["DESCRIPCION", "DESCRIPCION ARTICULO", "NOMBRE", "DETALLE", "ARTICULO", "TEXTO BREVE"],
  exist: ["EXISTENCIA", "EXISTENCIAS", "SALDO", "STOCK", "DISPONIBLE", "CANTIDAD DISPONIBLE", "CANT DISPONIBLE", "CANTIDAD", "SALDO ACTUAL", "EXISTENCIA ACTUAL"],
  ub:    ["UBICACION", "LOCALIZACION", "POSICION", "BIN", "ESTANTE", "LOCACION"],
  pu:    ["PRECIO", "PRECIO UNITARIO", "COSTO", "COSTO UNITARIO", "COSTO PROMEDIO", "VALOR UNITARIO", "VR UNITARIO"],
  alm:   ["ALMACEN", "BODEGA", "DEPOSITO", "CENTRO"],
  um:    ["U M", "UM", "UNIDAD", "UNIDAD DE MEDIDA", "UND", "UNIDAD MEDIDA"],
  min:   ["STOCK MINIMO", "MINIMO", "EXISTENCIA MINIMA", "CANTIDAD MINIMA", "PUNTO DE REORDEN"],
  consumo: ["CONSUMO MES", "CONSUMO MENSUAL", "CONSUMO PROMEDIO", "CONSUMO"],
};

function puntajeTitulo(titulo, campo) {
  const t = norm(titulo);
  if (!t) return 0;
  let mejor = 0;
  for (const cand of TITULOS[campo]) {
    if (t === cand) mejor = Math.max(mejor, 1);
    else if (t.startsWith(cand) || cand.startsWith(t)) mejor = Math.max(mejor, 0.8);
    else if (t.includes(cand)) mejor = Math.max(mejor, 0.6);
  }
  return mejor;
}

const esNumero = (v) => {
  if (typeof v === "number") return Number.isFinite(v);
  const s = String(v ?? "").trim();
  if (!s) return false;
  return Number.isFinite(numero(s));
};

// El portal exporta en formato colombiano: 1.234,50 son mil doscientos treinta
// y cuatro con cincuenta, no uno coma dos. Si hay coma decimal, el punto es
// separador de miles y se quita.
export function numero(v) {
  if (typeof v === "number") return v;
  let s = String(v ?? "").trim().replace(/\s| /g, "");
  if (!s) return NaN;
  s = s.replace(/^\$/, "");
  const neg = /^\(.*\)$/.test(s);                  // (1.234) = negativo
  if (neg) s = s.slice(1, -1);
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return neg ? -n : n;
}

// Busca la fila de cabecera y las columnas dentro de una hoja ya convertida a
// matriz. Devuelve null si la hoja no parece un reporte de inventario.
function analizarHoja(matriz, codigosPlan, forzadas = {}) {
  const LIMITE_CABECERA = Math.min(matriz.length, 30);
  let mejor = null;

  for (let f = 0; f < LIMITE_CABECERA; f++) {
    const cabecera = matriz[f] || [];
    if (cabecera.filter((c) => String(c ?? "").trim()).length < 2) continue;
    const cuerpo = matriz.slice(f + 1).filter((fila) => fila.some((c) => String(c ?? "").trim()));
    if (!cuerpo.length) continue;

    const nCols = Math.max(cabecera.length, ...cuerpo.slice(0, 200).map((r) => r.length));
    const cols = [];
    for (let c = 0; c < nCols; c++) {
      const valores = cuerpo.map((fila) => fila[c]).filter((v) => String(v ?? "").trim() !== "");
      const codes = valores.map(normCod).filter(Boolean);
      // Que tanto se parece esta columna a la lista de codigos del plan.
      const aciertos = codes.filter((v) => codigosPlan.has(v)).length;
      cols.push({
        c,
        titulo: String(cabecera[c] ?? "").trim(),
        llenos: valores.length,
        ratioPlan: codes.length ? aciertos / codes.length : 0,
        aciertos,
        ratioNum: valores.length ? valores.filter(esNumero).length / valores.length : 0,
        largoMedio: valores.length ? valores.reduce((a, v) => a + String(v).trim().length, 0) / valores.length : 0,
      });
    }

    // --- codigo: manda el contenido ---
    const porPlan = [...cols].sort((a, b) => b.aciertos - a.aciertos || b.ratioPlan - a.ratioPlan)[0];
    let colCod = porPlan && porPlan.aciertos >= 5 ? porPlan : null;
    let codPor = colCod ? "contenido" : "";
    if (!colCod) {
      const porTit = [...cols].map((x) => ({ x, p: puntajeTitulo(x.titulo, "cod") })).sort((a, b) => b.p - a.p)[0];
      if (porTit && porTit.p >= 0.6) { colCod = porTit.x; codPor = "titulo"; }
    }
    if (!colCod) continue;

    // Una columna solo puede ser una cosa. Importa de verdad: el reporte de
    // repuestos trae "EXISTENCIA" y "STOCK_MINIMO" a la vez, y sin esto el
    // minimo podria quedarse con la columna de existencias (ambas empiezan por
    // "STOCK" en otros reportes) y el puente subiria el minimo como si fuera lo
    // que hay en el estante.
    const tomadas = new Set([colCod.c]);
    const elegir = (campo, filtro) => {
      const cands = cols
        .filter((x) => !tomadas.has(x.c) && x.llenos > 0 && (!filtro || filtro(x)))
        .map((x) => ({ x, p: puntajeTitulo(x.titulo, campo) }))
        .sort((a, b) => b.p - a.p);
      const elegida = cands.length && cands[0].p >= 0.6 ? cands[0].x : null;
      if (elegida) tomadas.add(elegida.c);
      return elegida;
    };

    // El orden importa: gana el que se elige antes, asi que primero lo esencial.
    const colExist = elegir("exist", (x) => x.ratioNum >= 0.7);
    const sel = {
      cod: colCod,
      exist: colExist,
      desc: elegir("desc", (x) => x.largoMedio >= 4) || [...cols].filter((x) => !tomadas.has(x.c)).sort((a, b) => b.largoMedio - a.largoMedio)[0] || null,
      ub: elegir("ub"),
      alm: elegir("alm"),
      pu: elegir("pu", (x) => x.ratioNum >= 0.7),
      min: elegir("min", (x) => x.ratioNum >= 0.7),
      consumo: elegir("consumo", (x) => x.ratioNum >= 0.7),
      um: elegir("um", (x) => x.largoMedio <= 6),
    };

    // Puntaje de la hoja+cabecera: lo que pesa es cuantos codigos del plan
    // aparecen de verdad, mas un extra por haber encontrado la existencia.
    const puntaje = colCod.aciertos * 10 + (colExist ? 200 : 0) + (sel.desc ? 20 : 0);
    if (!mejor || puntaje > mejor.puntaje) mejor = { filaCabecera: f, cuerpo, cols, sel, puntaje, codPor };
  }

  if (!mejor) return null;

  // Lo fijado a mano en la config manda sobre todo lo anterior.
  for (const [campo, titulo] of Object.entries(forzadas)) {
    if (!titulo || !(campo in mejor.sel)) continue;
    const col = mejor.cols.find((x) => norm(x.titulo) === norm(titulo));
    if (col) { mejor.sel[campo] = col; if (campo === "cod") mejor.codPor = "config"; }
    else throw new Error(`En columnas.${campo} pusiste "${titulo}", pero el Excel no tiene esa columna. Las que hay: ${mejor.cols.map((x) => x.titulo).filter(Boolean).join(" | ")}`);
  }
  return mejor;
}

// libro: lo que devuelve XLSX.read / XLSX.readFile. utils: XLSX.utils.
export function analizarLibro(libro, utils, codigosPlan, opciones = {}) {
  const nombreArchivo = opciones.nombre || "el archivo";
  const forzadas = opciones.columnas || {};
  const hojaPedida = opciones.hoja;

  const nombres = hojaPedida ? [hojaPedida] : libro.SheetNames;
  if (hojaPedida && !libro.SheetNames.includes(hojaPedida)) {
    throw new Error(`El Excel no tiene la hoja "${hojaPedida}". Tiene: ${libro.SheetNames.join(" | ")}`);
  }

  let mejor = null;
  for (const nombre of nombres) {
    // blankrows: true a proposito. Las filas vacias se descartan igual mas abajo,
    // pero conservarlas hace que "cabecera en la fila N" sea la fila que de verdad
    // se ve en Excel. Si se compactan, el numero que reporta el puente no coincide
    // con el que tiene delante quien esta revisando el archivo.
    const matriz = utils.sheet_to_json(libro.Sheets[nombre], { header: 1, defval: "", blankrows: true, raw: true });
    const a = analizarHoja(matriz, codigosPlan, forzadas);
    if (a && (!mejor || a.puntaje > mejor.puntaje)) mejor = { ...a, hoja: nombre };
  }

  if (!mejor) {
    throw new Error(
      `No reconoci ninguna hoja de ${nombreArchivo} como reporte de inventario.\n` +
      `Hojas: ${libro.SheetNames.join(" | ")}\n` +
      `Ninguna columna coincidio con los codigos internos del plan. Revisa que sea el reporte correcto, ` +
      `o fija las columnas a mano en portal.config.json -> columnas (usa --columnas para ver los titulos).`
    );
  }

  const { sel } = mejor;
  const filas = [];
  const vistos = new Map();
  let sinCodigo = 0, duplicados = 0;

  for (const fila of mejor.cuerpo) {
    const cod = normCod(fila[sel.cod.c]);
    if (!cod) { sinCodigo++; continue; }
    const num = (col) => { const n = col ? numero(fila[col.c]) : NaN; return Number.isFinite(n) ? n : null; };
    const alm = String(fila[sel.alm?.c] ?? "").trim();
    const sitio = String(fila[sel.ub?.c] ?? "").trim();
    const reg = {
      cod,
      desc: String(fila[sel.desc?.c] ?? "").trim(),
      exist: num(sel.exist),
      // El almacen y la ubicacion se juntan YA, fila a fila, en el mismo formato
      // que usa el plan ("R02/M0202"). Si se guardaran por separado, al fundir un
      // codigo que esta en varios sitios quedaria un solo almacen para todas las
      // ubicaciones y diria donde no es: "R04/B0204 · R01/Z0505" es la verdad,
      // "R04" + "B0204 · Z0505" es mentira a medias.
      ub: alm && sitio ? `${alm}/${sitio}` : sitio || alm,
      pu: num(sel.pu),
      min: num(sel.min),
      consumo: num(sel.consumo),
      um: String(fila[sel.um?.c] ?? "").trim(),
      alm,
      // Desglose por sitio. Hace falta para la solicitud de materiales: el
      // formato pide ALM. y UBIC. de UN sitio concreto, el de donde se va a
      // sacar la pieza, y no la lista de todos juntos.
      sitios: [{ alm, ub: sitio, exist: num(sel.exist) ?? 0 }],
    };
    // Un mismo codigo puede venir repetido, una fila por almacen: las existencias
    // se suman, que es el total que de verdad hay en planta.
    const previo = vistos.get(cod);
    if (previo) {
      duplicados++;
      if (reg.exist !== null) previo.exist = (previo.exist ?? 0) + reg.exist;
      if (!previo.desc && reg.desc) previo.desc = reg.desc;
      if (reg.ub && !String(previo.ub).split(" · ").includes(reg.ub)) previo.ub = previo.ub ? `${previo.ub} · ${reg.ub}` : reg.ub;
      // Precio, minimo y consumo son del articulo, no del almacen: no se suman,
      // se toma el primero que venga con dato.
      for (const k of ["pu", "min", "consumo"]) if (previo[k] === null && reg[k] !== null) previo[k] = reg[k];
      if (!previo.um && reg.um) previo.um = reg.um;
      // El reporte de inventarios repite el mismo estante una vez por lote: se
      // suma dentro del mismo sitio en vez de listarlo tres veces.
      const s0 = reg.sitios[0];
      const mismo = previo.sitios.find((x) => x.alm === s0.alm && x.ub === s0.ub);
      if (mismo) mismo.exist += s0.exist; else previo.sitios.push(s0);
    } else {
      vistos.set(cod, reg);
      filas.push(reg);
    }
  }

  return {
    filas,
    diagnostico: {
      hoja: mejor.hoja,
      filaCabecera: mejor.filaCabecera + 1,
      codigoDetectadoPor: mejor.codPor,
      columnas: Object.fromEntries(Object.entries(sel).map(([k, v]) => [k, v ? v.titulo || `(columna ${v.c + 1})` : null])),
      titulosDisponibles: mejor.cols.map((x) => x.titulo).filter(Boolean),
      leidas: mejor.cuerpo.length,
      sinCodigo,
      duplicados,
      coincidenPlan: filas.filter((f) => codigosPlan.has(f.cod)).length,
    },
  };
}
