// Lee el reporte RE355 de MiPortal ("SEGUIMIENTO A REQUISICIONES") y lo deja
// resumido por codigo: lo que esta pedido y aun no llega, y el ultimo pedido
// que se hizo de cada articulo.
//
// Para que sirve en la app: el RE356 dice lo que hay en el estante, pero no si
// ya viene en camino. Sin esto, "bajo el minimo" no distingue entre lo que
// nadie ha pedido y lo que llega la semana que viene; y no se ve cuando el MRP
// (compra automatica, CODIGO_MRP = M) dejo de pedir algo.
//
// Como el lector del RE356, no importa nada: lo usa la app en el navegador y
// las pruebas en Node. Recibe la hoja ya convertida a matriz (sheet_to_json con
// header: 1).
//
// Una linea esta ABIERTA si su ESTADO LINEA no es CERRADA, ANULADA ni CERRADA
// POR COSTEAR, y todavia falta recibir algo (lo pedido u ordenado menos lo
// recibido). Una requisicion sin orden de compra ("RQ. Sin Aprob", "Plan en
// Firme Sin OC") cuenta como abierta: esta pedida, aunque compras no la haya
// movido.

const CERRADAS = new Set(["CERRADA", "ANULADA", "CERRADA POR COSTEAR"]);

const plano = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();

// El codigo, igual que en lector-inventario.mjs
function normCod(v) {
  if (v === null || v === undefined) return "";
  const s = String(v).trim().toUpperCase().replace(/\.0+$/, "").replace(/\s+/g, "");
  return s === "N/A" || s === "NA" || s === "-" ? "" : s;
}

function num(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  let s = String(v ?? "").trim().replace(/\s/g, "");
  if (!s) return 0;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// Las fechas vienen como 20260131 (numero o texto). Se guardan como 2026-01-31.
function fecha(v) {
  const s = String(v ?? "").trim().replace(/\.0+$/, "");
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(s) || /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
}

// Columnas por su titulo. El RE355 siempre las titula igual; si un dia cambian,
// el error dice cuales hay.
const COLUMNAS = {
  cod: ["CODIGO"],
  desc: ["DESCRIPCION"],
  mrp: ["MRP MPS", "MRP"],
  fp: ["FEC PEDIDO", "FECHA PEDIDO"],
  rq: ["NO REQUISICION", "REQUISICION"],
  req: ["REQUERIDO"],
  ord: ["ORDENADO"],
  rec: ["RECIBIDO"],
  usr: ["USUARIO"],
  alm: ["ALMAC", "ALMACEN"],
  est: ["ESTADO"],
  oc: ["ORD COMPRA", "ORDEN COMPRA"],
  fe: ["FEC ENTREGA", "FECHA ENTREGA"],
  cc: ["CENTRO DE COSTO"],
  estLinea: ["ESTADO LINEA"],
};
const IMPRESCINDIBLES = ["cod", "fp", "est", "estLinea", "rec"];

// ¿Esta matriz es un RE355? Devuelve la fila de cabecera y las columnas, o null.
export function esRE355(matriz) {
  for (let f = 0; f < Math.min(matriz.length, 15); f++) {
    const t = (matriz[f] || []).map(plano);
    const col = {};
    for (const [k, nombres] of Object.entries(COLUMNAS)) {
      const i = t.findIndex((x) => nombres.includes(x));
      if (i >= 0) col[k] = i;
    }
    if (IMPRESCINDIBLES.every((k) => k in col) && ("oc" in col || "rq" in col)) return { fila: f, col };
  }
  return null;
}

export function analizarRE355(matriz, { hoy = "" } = {}) {
  const cab = esRE355(matriz);
  if (!cab) throw new Error("No parece un RE355: faltan columnas como CODIGO, FEC PEDIDO, ESTADO, ESTADO LINEA u ORD COMPRA.");
  const { col } = cab;
  const v = (fila, k) => (k in col ? fila[col[k]] : "");
  const porCodigo = {};
  let lineas = 0, abiertas = 0, atrasadas = 0, desde = "", hasta = "";
  for (const fila of matriz.slice(cab.fila + 1)) {
    const cod = normCod(v(fila, "cod"));
    if (!cod) continue;
    lineas++;
    const fp = fecha(v(fila, "fp"));
    if (fp && (!desde || fp < desde)) desde = fp;
    if (fp && fp > hasta) hasta = fp;
    const estLinea = plano(v(fila, "estLinea"));
    const est = String(v(fila, "est") ?? "").trim();
    const pedido = Math.max(num(v(fila, "ord")), num(v(fila, "req")));
    const recibido = num(v(fila, "rec"));
    const falta = pedido - recibido;
    const rq = String(v(fila, "rq") ?? "").trim();
    const oc = String(v(fila, "oc") ?? "").trim();
    const reg = porCodigo[cod] || (porCodigo[cod] = { a: [], u: null, desc: "", mrp: "" });
    if (!reg.desc) reg.desc = String(v(fila, "desc") ?? "").replace(/\s+/g, " ").trim();
    const mrp = String(v(fila, "mrp") ?? "").trim().toUpperCase();
    if (mrp === "M" || (mrp === "N" && !reg.mrp)) reg.mrp = mrp;
    // El ultimo pedido del articulo, abierto o no: "se pidio el 3 de mayo y se cerro"
    if (fp && (!reg.u || fp >= reg.u.fp)) reg.u = { fp, rq, oc, est: estLinea ? String(v(fila, "estLinea")).trim() : est, q: pedido, rec: recibido };
    if (CERRADAS.has(estLinea) || falta <= 0) continue;
    const fe = fecha(v(fila, "fe"));
    abiertas++;
    if (hoy && fe && fe < hoy) atrasadas++;
    reg.a.push({ rq, oc, est, fp, fe, q: falta, alm: String(v(fila, "alm") ?? "").trim(), usr: String(v(fila, "usr") ?? "").trim() });
  }
  // Lo que llega antes, primero
  Object.values(porCodigo).forEach((r) => r.a.sort((x, y) => (x.fe || "9999").localeCompare(y.fe || "9999")));
  return { porCodigo, resumen: { lineas, abiertas, atrasadas, codigos: Object.keys(porCodigo).length, desde, hasta } };
}
