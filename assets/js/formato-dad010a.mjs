// ============================================================================
//  DAD-010A · SOLICITUD DE MATERIALES (Edicion 1, vigente desde 01/10/2022)
// ============================================================================
//  Rellena EL ARCHIVO OFICIAL (assets/formatos/DAD-010A.xlsx), no una copia.
//  Es un documento controlado: lleva codigo, edicion y fecha de vigencia, asi
//  que lo que sale de aqui tiene que ser ese mismo formato con los datos
//  escritos, igual que si alguien lo hubiera llenado a mano en Excel.
//
//  Por eso no se usa ninguna libreria que "abra y vuelva a guardar" el Excel:
//  esas reescriben estilos, figuras e impresion y el resultado ya no es el
//  original. Aqui se abre el .xlsx como lo que es (un zip de XML) y solo se
//  cambian las celdas vacias donde van los datos, CONSERVANDO SU ESTILO. Logos,
//  bordes, anchos, margenes, area de impresion y escala quedan intactos.
//
//  Las casillas TRASLADO / CONSUMO / DEVOLUCION no son celdas: son rectangulos
//  dibujados. Se marcan escribiendo una X dentro del rectangulo, que es lo que
//  haria una persona en Excel.
//
//  Si algun dia sale la Edicion 2 y se mueve algo, este modulo se niega a
//  rellenar (comprueba las etiquetas antes de escribir) en vez de poner los
//  datos en la casilla equivocada de un formato oficial.
//
//  ALMACENES DISTINTOS, HOJAS DISTINTAS. Almacen no recibe en una misma hoja
//  articulos de almacenes distintos. La solicitud sale de un almacen principal
//  (el elegido, o el que surte mas renglones); lo que solo hay en otro almacen
//  va en otra hoja del mismo archivo, que es el formato completo (logos,
//  casillas, impresion) con la misma cabecera. Lo que no tiene almacen se
//  queda en la hoja principal. Con un solo almacen el archivo es exactamente
//  el de siempre, con su hoja "DAD-010A".
//
//  Lo usan la app (vista Almacen) y la prueba de scripts/portal-bridge/test.
// ============================================================================

export const RENGLONES = 20;          // filas 13 a 32 del formato
const PRIMERA_FILA = 13;

// Donde va cada dato. Son las celdas de arriba a la izquierda de cada casilla
// combinada del formato (las demas celdas de la combinacion no se tocan).
const CELDAS = {
  fecha: "L4", area: "B6", departamento: "K6", destino: "C8", alistadoPor: "K8",
  solicitadoPor: "A34", autorizadoPor: "E34",
  observaciones1: "D35", observaciones2: "A36",
};
const COLUMNAS = { cod: "A", desc: "C", trans: "G", causa: "H", lote: "J", um: "L", cant: "M", alm: "O", ub: "P" };

// Lo que TIENE que decir el formato en estas celdas para que sea el esperado.
const ETIQUETAS = {
  K4: "FECHA", A6: "AREA", J6: "DEPARTAMENTO", A8: "DESTINO", J8: "ALISTADO POR",
  A10: "CODIGO DEL ARTICULO", C10: "DESCRIPCION DEL ARTICULO", G10: "TRANS", H10: "CODIGO CAUSA",
  J10: "REGISTRO / LOTE", L10: "U / M", M10: "CANTIDAD", M12: "SOLIC", O10: "ALM", P10: "UBIC",
  A33: "SOLICITADO POR", E33: "AUTORIZADO POR", A35: "OBSERVACIONES",
  A4: "TRASLADO", E4: "CONSUMO", F4: "DEVOLUCION",
};

const sinTildes = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();

function escXml(s) {
  return String(s ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function desXml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}

// Numero de serie de fecha de Excel (dias desde 1899-12-30). La casilla FECHA
// del formato tiene formato de fecha aaaa-mm-dd: si se le escribe texto, Excel
// no la reconoce como fecha.
function serialExcel(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  if (!m) return null;
  return Math.round((Date.UTC(+m[1], +m[2] - 1, +m[3]) - Date.UTC(1899, 11, 30)) / 86400000);
}

function textosCompartidos(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => desXml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")));
}

function textoCelda(hoja, compartidos, ref) {
  const m = new RegExp(`<c r="${ref}"([^>]*?)(?:/>|>([\\s\\S]*?)</c>)`).exec(hoja);
  if (!m || !m[2]) return "";
  const esCompartido = /\bt="s"/.test(m[1]);
  const v = /<v>([\s\S]*?)<\/v>/.exec(m[2]);
  if (esCompartido && v) return compartidos[Number(v[1])] || "";
  const t = /<t[^>]*>([\s\S]*?)<\/t>/.exec(m[2]);
  return t ? desXml(t[1]) : v ? v[1] : "";
}

// Escribe un valor en una celda que YA existe en la hoja, conservando su
// estilo (atributo s). Si la celda no existe, falla: significa que el formato
// no es el que se espera y es mejor no inventar.
function escribir(hoja, ref, valor) {
  if (valor === null || valor === undefined || valor === "") return hoja;
  // r="L4" seguido de comilla: no confunde L4 con L40.
  const m = new RegExp(`<c r="${ref}"([^>]*?)(?:/>|>[\\s\\S]*?</c>)`).exec(hoja);
  if (!m) throw new Error(`El formato no tiene la celda ${ref}: no es la edicion que se esperaba.`);
  // Se conserva todo (sobre todo s=, el estilo) menos el tipo, que se pone nuevo.
  const attrs = m[1].replace(/\s+t="[^"]*"/g, "").replace(/\s*\/$/, "");
  const celda = typeof valor === "number"
    ? `<c r="${ref}"${attrs}><v>${valor}</v></c>`
    : `<c r="${ref}"${attrs} t="inlineStr"><is><t xml:space="preserve">${escXml(valor)}</t></is></c>`;
  return hoja.slice(0, m.index) + celda + hoja.slice(m.index + m[0].length);
}

// Las observaciones van en dos lineas del formato. La primera (D35:N35) esta
// centrada y es mas corta porque empieza despues de la etiqueta: si se pasa,
// Excel la desborda por los dos lados y tapa la palabra OBSERVACIONES. Medido
// imprimiendo el formato real: caben unos 68 caracteres arriba y 100 abajo.
export const OBSERVACIONES_MAX = [68, 100];
export const OBSERVACIONES_TOTAL = OBSERVACIONES_MAX[0] + OBSERVACIONES_MAX[1];

function cortar(t, max) {
  if (t.length <= max) return [t, ""];
  const corte = t.lastIndexOf(" ", max);
  const i = corte > max * 0.5 ? corte : max;
  return [t.slice(0, i).trim(), t.slice(i).trim()];
}

function partirObservaciones(texto) {
  const t = String(texto || "").replace(/\s+/g, " ").trim();
  const [l1, resto] = cortar(t, OBSERVACIONES_MAX[0]);
  const [l2] = cortar(resto, OBSERVACIONES_MAX[1]);
  return [l1, l2];
}

// Las tres casillas son los rectangulos dibujados a la altura de la fila 4 del
// formato (fila 3 contando desde 0 en el dibujo empieza en la 2), de izquierda a
// derecha: TRASLADO, CONSUMO, DEVOLUCION.
function marcarCasilla(dibujo, tipo) {
  const orden = ["traslado", "consumo", "devolucion"];
  const i = orden.indexOf(tipo);
  if (i < 0) return dibujo;
  const anclas = [...dibujo.matchAll(/<xdr:twoCellAnchor[\s\S]*?<\/xdr:twoCellAnchor>/g)]
    .map((m) => {
      const a = m[0];
      const desde = /<xdr:from><xdr:col>(\d+)<\/xdr:col><xdr:colOff>(\d+)<\/xdr:colOff><xdr:row>(\d+)<\/xdr:row>/.exec(a);
      return { a, inicio: m.index, fila: desde ? +desde[3] : -1, x: desde ? +desde[1] * 1e7 + +desde[2] : 0, rect: /prst="rect"/.test(a) && /<xdr:sp\b/.test(a) && /<xdr:txBody>/.test(a) };
    })
    .filter((x) => x.rect && x.fila === 2)
    .sort((p, q) => p.x - q.x);
  if (anclas.length !== 3) throw new Error(`Esperaba 3 casillas (Traslado, Consumo, Devolucion) y el formato tiene ${anclas.length}: no es la edicion que se esperaba.`);
  const objetivo = anclas[i];
  const x = '<a:r><a:rPr lang="es-CO" sz="1200" b="1"><a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:latin typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>X</a:t></a:r>';
  const nuevo = objetivo.a.replace(/(<xdr:txBody>[\s\S]*?<a:p>(?:<a:pPr[^>]*\/>|<a:pPr[\s\S]*?<\/a:pPr>)?)/, `$1${x}`);
  if (nuevo === objetivo.a) throw new Error("No pude escribir en la casilla del tipo de solicitud.");
  return dibujo.slice(0, objetivo.inicio) + nuevo + dibujo.slice(objetivo.inicio + objetivo.a.length);
}

// ---------------------------------------------------------------------------
//  Hoja principal y hojas aparte
// ---------------------------------------------------------------------------
// La primera hoja es la del almacen principal: el que se pide (principal) o,
// si no, el que mas renglones tiene (a igualdad, el que sale primero). Ahi van
// tambien los renglones sin almacen (piezas que no estan en el inventario: el
// almacen lo pone quien despacha). Cada otro almacen va en su hoja, en el
// orden en que aparece en la solicitud. Dentro de cada hoja se respeta el
// orden de la solicitud.
export function hojasPorAlmacen(lineas, principal) {
  const lista = lineas || [];
  const clave = (l) => String(l.alm ?? "").trim().toUpperCase();
  const cuenta = new Map();
  lista.forEach((l) => { const a = clave(l); if (a) cuenta.set(a, (cuenta.get(a) || 0) + 1); });
  if (!cuenta.size) return [{ alm: "", lineas: lista }];
  const pedido = String(principal ?? "").trim().toUpperCase();
  const orden = [...cuenta.keys()];
  const primero = cuenta.has(pedido) ? pedido : orden.reduce((m, a) => (cuenta.get(a) > cuenta.get(m) ? a : m), orden[0]);
  return [primero, ...orden.filter((a) => a !== primero)].map((alm) => ({
    alm,
    lineas: lista.filter((l) => clave(l) === alm || (alm === primero && !clave(l))),
  }));
}

const HOJA = "DAD-010A";

// Nombre de pestaña valido en Excel: sin : \ / ? * [ ] ni comillas, y hasta 31 letras.
function nombresDeHojas(hojas) {
  const usados = new Set();
  return hojas.map((h) => {
    const base = (h.alm ? `${HOJA} ${h.alm}` : `${HOJA} sin ALM`).replace(/[:\\/?*[\]'"]/g, "-").slice(0, 31);
    let n = base, i = 2;
    while (usados.has(n)) n = `${base.slice(0, 28)} ${i++}`;
    usados.add(n);
    return n;
  });
}

// Copia la hoja del formato (con su dibujo y su configuracion de impresion)
// una vez por cada almacen de mas. La primera hoja es la original.
async function agregarHojas(zip, { ruta, rd, hojas, llenar, dibujo }) {
  const nombres = nombresDeHojas(hojas);
  let wb = await zip.file("xl/workbook.xml").async("string");
  let wbRels = await zip.file("xl/_rels/workbook.xml.rels").async("string");
  let tipos = await zip.file("[Content_Types].xml").async("string");
  const relsHojaRuta = ruta.replace(/worksheets\//, "worksheets/_rels/") + ".rels";
  const relsHoja = zip.file(relsHojaRuta) ? await zip.file(relsHojaRuta).async("string") : "";
  const relsDibujoRuta = rd ? rd.replace(/drawings\//, "drawings/_rels/") + ".rels" : "";
  const relsDibujo = relsDibujoRuta && zip.file(relsDibujoRuta) ? await zip.file(relsDibujoRuta).async("string") : "";

  // La hoja original pasa a llamarse con su almacen, y su area de impresion con ella.
  const antes = wb;
  wb = wb.replace(new RegExp(`(<sheet [^>]*name=")${HOJA}(")`), `$1${escXml(nombres[0])}$2`);
  if (wb === antes) throw new Error(`El formato no tiene la hoja "${HOJA}".`);
  wb = wb.split(`'${HOJA}'!`).join(`'${nombres[0]}'!`);
  const area = /<definedName name="_xlnm\.Print_Area" localSheetId="0">'[^']*'!([^<]+)<\/definedName>/.exec(wb);

  const libre = (prefijo, ext) => { let n = 1; while (zip.file(`${prefijo}${n}${ext}`)) n++; return n; };
  let sheetId = Math.max(0, ...[...wb.matchAll(/<sheet [^>]*sheetId="(\d+)"/g)].map((m) => +m[1]));
  let rId = Math.max(0, ...[...wbRels.matchAll(/Id="rId(\d+)"/g)].map((m) => +m[1]));
  let sheets = "", areas = "", rels = "", overrides = "";

  for (let k = 1; k < hojas.length; k++) {
    const nH = libre("xl/worksheets/sheet", ".xml");
    const rutaH = `xl/worksheets/sheet${nH}.xml`;
    // Solo una pestaña seleccionada (si no, Excel abre las hojas agrupadas y lo
    // que se escriba en una se escribe en todas) y un identificador propio.
    zip.file(rutaH, llenar(hojas[k].lineas)
      .replace(/\s+tabSelected="1"/, "")
      .replace(/xr:uid="\{([0-9A-Fa-f-]+)\}"/, (m, g) => `xr:uid="{${g.slice(0, -2)}${k.toString(16).toUpperCase().padStart(2, "0")}}"`));
    overrides += `<Override PartName="/${rutaH}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;

    let r = relsHoja;
    if (rd) {
      const nD = libre("xl/drawings/drawing", ".xml");
      zip.file(`xl/drawings/drawing${nD}.xml`, dibujo);
      if (relsDibujo) zip.file(`xl/drawings/_rels/drawing${nD}.xml.rels`, relsDibujo);
      r = r.replace(/Target="([^"]*drawings\/)[^"]+"/, `Target="$1drawing${nD}.xml"`);
      overrides += `<Override PartName="/xl/drawings/drawing${nD}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`;
    }
    const ps = /Target="([^"]*printerSettings\/)([^"]+)"/.exec(r);
    if (ps) {
      const nP = libre("xl/printerSettings/printerSettings", ".bin");
      zip.file(`xl/printerSettings/printerSettings${nP}.bin`, await zip.file("xl/printerSettings/" + ps[2]).async("uint8array"));
      r = r.replace(ps[0], `Target="${ps[1]}printerSettings${nP}.bin"`);
    }
    if (r) zip.file(`xl/worksheets/_rels/sheet${nH}.xml.rels`, r);

    rId++; sheetId++;
    sheets += `<sheet name="${escXml(nombres[k])}" sheetId="${sheetId}" r:id="rId${rId}"/>`;
    rels += `<Relationship Id="rId${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${nH}.xml"/>`;
    if (area) areas += `<definedName name="_xlnm.Print_Area" localSheetId="${k}">'${escXml(nombres[k])}'!${area[1]}</definedName>`;
  }

  wb = wb.replace("</sheets>", sheets + "</sheets>");
  if (area) wb = wb.replace(area[0], area[0] + areas);
  zip.file("xl/workbook.xml", wb);
  zip.file("xl/_rels/workbook.xml.rels", wbRels.replace("</Relationships>", rels + "</Relationships>"));
  zip.file("[Content_Types].xml", tipos.replace("</Types>", overrides + "</Types>"));
  await propiedades(zip, nombres, !!area);
}

// docProps/app.xml lista las hojas y las areas de impresion. Si no tiene la
// forma conocida se deja como estaba: Excel no depende de ella para abrir.
async function propiedades(zip, nombres, conAreas) {
  const f = zip.file("docProps/app.xml");
  if (!f) return;
  const x = await f.async("string");
  const hojasRe = /(<vt:lpstr>Hojas de c[^<]*<\/vt:lpstr><\/vt:variant><vt:variant><vt:i4>)\d+(<\/vt:i4>)/;
  const rangosRe = /(<vt:lpstr>Rangos con nombre<\/vt:lpstr><\/vt:variant><vt:variant><vt:i4>)\d+(<\/vt:i4>)/;
  const titulosRe = /<TitlesOfParts>[\s\S]*?<\/TitlesOfParts>/;
  if (!hojasRe.test(x) || !titulosRe.test(x) || (conAreas && !rangosRe.test(x))) return;
  const areas = conAreas ? nombres.map((n) => `'${n}'!Área_de_impresión`) : [];
  const items = [...nombres, ...areas].map((t) => `<vt:lpstr>${escXml(t)}</vt:lpstr>`);
  let y = x.replace(hojasRe, `$1${nombres.length}$2`).replace(titulosRe, `<TitlesOfParts><vt:vector size="${items.length}" baseType="lpstr">${items.join("")}</vt:vector></TitlesOfParts>`);
  if (conAreas) y = y.replace(rangosRe, `$1${nombres.length}$2`);
  zip.file("docProps/app.xml", y);
}

async function rutaHoja(zip, nombreHoja) {
  const wb = await zip.file("xl/workbook.xml").async("string");
  const rels = await zip.file("xl/_rels/workbook.xml.rels").async("string");
  const hoja = new RegExp(`<sheet [^>]*name="${nombreHoja}"[^>]*r:id="([^"]+)"`).exec(wb) || /<sheet [^>]*r:id="([^"]+)"/.exec(wb);
  const rel = new RegExp(`<Relationship [^>]*Id="${hoja[1]}"[^>]*Target="([^"]+)"`).exec(rels)
    || new RegExp(`<Relationship [^>]*Target="([^"]+)"[^>]*Id="${hoja[1]}"`).exec(rels);
  const destino = rel[1].replace(/^\//, "");
  return destino.startsWith("xl/") ? destino : "xl/" + destino;
}

async function rutaDibujo(zip, ruta) {
  const relsRuta = ruta.replace(/worksheets\//, "worksheets/_rels/") + ".rels";
  const f = zip.file(relsRuta);
  if (!f) return null;
  const rels = await f.async("string");
  const m = /Target="([^"]*drawings\/[^"]+)"/.exec(rels);
  return m ? "xl/drawings/" + m[1].split("/").pop() : null;
}

// Comprueba que el formato es el que se espera antes de escribir nada.
export async function verificarFormato(JSZip, plantilla) {
  const zip = await JSZip.loadAsync(plantilla);
  const ruta = await rutaHoja(zip, "DAD-010A");
  const hoja = await zip.file(ruta).async("string");
  const compartidos = textosCompartidos(await zip.file("xl/sharedStrings.xml")?.async("string"));
  const malas = Object.entries(ETIQUETAS).filter(([ref, esperado]) => !sinTildes(textoCelda(hoja, compartidos, ref)).startsWith(sinTildes(esperado)));
  if (malas.length) {
    throw new Error(
      "El formato DAD-010A no es la edicion que conoce la app (Edicion 1). No coinciden: " +
      malas.map(([ref, e]) => `${ref} deberia decir "${e}" y dice "${textoCelda(hoja, compartidos, ref)}"`).join("; ") +
      ". Hay que revisar las posiciones en assets/js/formato-dad010a.mjs antes de usarlo."
    );
  }
  return { zip, ruta, hoja };
}

// datos: { tipo: "traslado"|"consumo"|"devolucion"|"", fecha: "aaaa-mm-dd",
//   area, departamento, destino, alistadoPor, solicitadoPor, autorizadoPor,
//   observaciones, almacen (el principal, opcional),
//   lineas: [{ cod, desc, trans, causa, lote, um, cant, alm, ub }] }
// salida: "uint8array" (Node) o "blob" (navegador).
export async function rellenarDAD010A(JSZip, plantilla, datos, salida = "blob") {
  const lineas = (datos.lineas || []).filter((l) => l && (l.cod || l.desc));
  const hojas = hojasPorAlmacen(lineas, datos.almacen);
  const llena = hojas.find((h) => h.lineas.length > RENGLONES);
  if (llena) {
    throw new Error(`El formato tiene ${RENGLONES} renglones y ${hojas.length > 1 ? `el almacén ${llena.alm || "sin almacén"}` : "la solicitud"} trae ${llena.lineas.length}. Parte la solicitud en dos.`);
  }

  const { zip, ruta } = await verificarFormato(JSZip, plantilla);
  const base = await zip.file(ruta).async("string");

  // La cabecera es la misma en todas las hojas; cambian los renglones.
  const llenar = (lineasHoja) => {
    let hoja = base;
    const fecha = serialExcel(datos.fecha);
    hoja = escribir(hoja, CELDAS.fecha, fecha ?? datos.fecha);
    hoja = escribir(hoja, CELDAS.area, datos.area);
    hoja = escribir(hoja, CELDAS.departamento, datos.departamento);
    hoja = escribir(hoja, CELDAS.destino, datos.destino);
    hoja = escribir(hoja, CELDAS.alistadoPor, datos.alistadoPor);
    hoja = escribir(hoja, CELDAS.solicitadoPor, datos.solicitadoPor);
    hoja = escribir(hoja, CELDAS.autorizadoPor, datos.autorizadoPor);
    const [obs1, obs2] = partirObservaciones(datos.observaciones);
    hoja = escribir(hoja, CELDAS.observaciones1, obs1);
    hoja = escribir(hoja, CELDAS.observaciones2, obs2);

    lineasHoja.forEach((l, i) => {
      const fila = PRIMERA_FILA + i;
      for (const [campo, col] of Object.entries(COLUMNAS)) {
        let v = l[campo];
        if (campo === "cant") { const n = Number(v); v = v === "" || v === null || v === undefined ? "" : Number.isFinite(n) ? n : String(v); }
        else v = v === null || v === undefined ? "" : String(v).trim();
        hoja = escribir(hoja, col + fila, v);
      }
    });
    return hoja;
  };

  zip.file(ruta, llenar(hojas[0].lineas));

  const rd = await rutaDibujo(zip, ruta);
  if (datos.tipo && !rd) throw new Error("El formato no tiene las casillas dibujadas de Traslado / Consumo / Devolucion.");
  let dibujo = rd ? await zip.file(rd).async("string") : "";
  if (datos.tipo) {
    dibujo = marcarCasilla(dibujo, datos.tipo);
    zip.file(rd, dibujo);
  }

  if (hojas.length > 1) await agregarHojas(zip, { ruta, rd, hojas, llenar, dibujo });

  return zip.generateAsync({
    type: salida,
    compression: "DEFLATE",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
