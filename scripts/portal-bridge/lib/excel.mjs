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

import xlsx from "xlsx";
import { normCod } from "./plan.mjs";

const norm = (s) =>
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

    const elegir = (campo, filtro) => {
      const cands = cols
        .filter((x) => x.c !== colCod.c && x.llenos > 0 && (!filtro || filtro(x)))
        .map((x) => ({ x, p: puntajeTitulo(x.titulo, campo) }))
        .sort((a, b) => b.p - a.p);
      return cands.length && cands[0].p >= 0.6 ? cands[0].x : null;
    };

    const colExist = elegir("exist", (x) => x.ratioNum >= 0.7);
    const sel = {
      cod: colCod,
      desc: elegir("desc", (x) => x.largoMedio >= 4) || [...cols].filter((x) => x.c !== colCod.c).sort((a, b) => b.largoMedio - a.largoMedio)[0] || null,
      exist: colExist,
      ub: elegir("ub"),
      pu: elegir("pu", (x) => x.ratioNum >= 0.7),
      alm: elegir("alm"),
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

export async function leerInventario(rutaXlsx, codigosPlan, opciones = {}) {
  const libro = xlsx.readFile(rutaXlsx, { cellDates: false, raw: true });
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
    const matriz = xlsx.utils.sheet_to_json(libro.Sheets[nombre], { header: 1, defval: "", blankrows: true, raw: true });
    const a = analizarHoja(matriz, codigosPlan, forzadas);
    if (a && (!mejor || a.puntaje > mejor.puntaje)) mejor = { ...a, hoja: nombre };
  }

  if (!mejor) {
    throw new Error(
      `No reconoci ninguna hoja de ${rutaXlsx} como reporte de inventario.\n` +
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
    const exist = sel.exist ? numero(fila[sel.exist.c]) : NaN;
    const pu = sel.pu ? numero(fila[sel.pu.c]) : NaN;
    const reg = {
      cod,
      desc: String(fila[sel.desc?.c] ?? "").trim(),
      exist: Number.isFinite(exist) ? exist : null,
      ub: String(fila[sel.ub?.c] ?? "").trim(),
      pu: Number.isFinite(pu) ? pu : null,
      alm: String(fila[sel.alm?.c] ?? "").trim(),
    };
    // Un mismo codigo puede venir repetido, una fila por almacen: las existencias
    // se suman, que es el total que de verdad hay en planta.
    const previo = vistos.get(cod);
    if (previo) {
      duplicados++;
      if (reg.exist !== null) previo.exist = (previo.exist ?? 0) + reg.exist;
      if (!previo.desc && reg.desc) previo.desc = reg.desc;
      if (reg.ub && !String(previo.ub).split(" · ").includes(reg.ub)) previo.ub = previo.ub ? `${previo.ub} · ${reg.ub}` : reg.ub;
      if (previo.pu === null && reg.pu !== null) previo.pu = reg.pu;
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
