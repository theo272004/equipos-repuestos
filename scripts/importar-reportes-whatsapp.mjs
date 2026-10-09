// Importa el export de WhatsApp del grupo "Mtto Medicamentos" y deja al día
// las dos cosas que la app lee del chat:
//
//   1. assets/js/reportes-data.js (window.REPORTES_TURNO): los reportes de
//      turno tal cual se enviaron, para la sección Reportes, el Calendario y
//      el "reporte recibido" del Inicio.
//   2. assets/js/mtto-data.js (window.MTTO.hist): el histórico del Registro
//      diario. Lo arma generar_registro_mtto.py (carpeta farmacap); este script
//      le AGREGA lo que el chat trae después del último mensaje que ya leyó,
//      con las mismas reglas (window.MTTO.reglas, las que usa mtto-lector.js
//      para "Pegar reporte"). Lo ya importado no se toca.
//
// Uso:
//   node scripts/importar-reportes-whatsapp.mjs "ruta/al/chat.zip"
//   node scripts/importar-reportes-whatsapp.mjs "ruta/al/chat.txt"
//   node scripts/importar-reportes-whatsapp.mjs "chat.zip" --solo-reportes
//
// Qué es un reporte y qué es una novedad (comprobado contra lo que tomó el
// script de Python del 1 de agosto al 28 de septiembre de 2026: las mismas 239
// entradas, sin faltar ninguna):
//   - Entrada: cualquier mensaje de un técnico que describe un trabajo (el
//     lector encuentra una novedad) o que lista el estado de dos o más equipos.
//     Los mensajes de los supervisores no son entradas.
//   - Reporte de turno: una entrada con cabecera de reporte ("Reporte de
//     turno", "Reporte turno", "SEDE 4 -- turno (día)"…) o que lista equipos.
//
// El export de WhatsApp puede venir con la hora en 12 h ("8:20 p. m."). Antes
// se leía sin la marca a. m./p. m. y los reportes de la noche quedaban a las
// 8 de la mañana; ahora se convierte a 24 h.

import { readFileSync, writeFileSync, existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import vm from "node:vm";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESDE = "2026-08-01";
// Quien escribe en el grupo para pedir, recordar o felicitar, no para reportar
const SUPERVISORES = /juan guilarte|fnegrete|estiven fuentes/i;

// ------------------------------------------------------------------ entrada
function leerChat(ruta) {
  if (!existsSync(ruta)) throw new Error(`No existe: ${ruta}`);
  let txtPath = ruta;
  let tmp = null;
  if (/\.zip$/i.test(ruta)) {
    tmp = mkdtempSync(join(tmpdir(), "chat-mtto-"));
    if (process.platform === "win32") {
      execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${ruta.replace(/'/g, "''")}' -DestinationPath '${tmp.replace(/'/g, "''")}' -Force"`);
    } else {
      execSync(`unzip -q -o "${ruta.replace(/"/g, '\\"')}" -d "${tmp}"`);
    }
    const txt = readdirSync(tmp).find((f) => f.toLowerCase().endsWith(".txt"));
    if (!txt) { rmSync(tmp, { recursive: true, force: true }); throw new Error("El ZIP no trae .txt"); }
    txtPath = join(tmp, txt);
  }
  const buf = readFileSync(txtPath);
  let texto;
  try {
    texto = new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    texto = new TextDecoder("windows-1252").decode(buf);
  }
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  return texto.replace(/\r\n/g, "\n");
}

// ------------------------------------------------------------------ mensajes
// "29/9/2026, 9:05 p. m. - Autor: texto" o "29/9/2026, 21:05 - Autor: texto"
const RE_ENCABEZADO = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})\s*(?:([ap])\.?\s*m\.?)?\s+-\s+([\s\S]*)$/i;

function parseMensajes(texto) {
  const msgs = [];
  let actual = null;
  for (const cruda of texto.split("\n")) {
    const linea = cruda.replace(/[  ]/g, " ");
    const m = linea.match(RE_ENCABEZADO);
    if (m) {
      if (actual) msgs.push(actual);
      const [, d, mes, anio, hh, mm, ap, resto] = m;
      let h = Number(hh);
      if (ap) h = (h % 12) + (ap.toLowerCase() === "p" ? 12 : 0);
      const i = resto.indexOf(": ");
      const conAutor = i > 0 && i < 60;
      actual = {
        fecha: `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        hora: `${String(h).padStart(2, "0")}:${mm}`,
        autor: conAutor ? resto.slice(0, i).trim() : "",
        cuerpo: [conAutor ? resto.slice(i + 2) : resto],
      };
    } else if (actual) {
      actual.cuerpo.push(cruda);
    }
  }
  if (actual) msgs.push(actual);
  return msgs
    .filter((m) => m.autor)
    .map((m) => ({ ...m, cuerpo: m.cuerpo.join("\n").replace(/\n{3,}/g, "\n\n").trim() }));
}

// Varios mensajes seguidos del mismo técnico en el mismo minuto son una sola entrada
function agrupar(msgs) {
  const out = [];
  for (const m of msgs) {
    const prev = out[out.length - 1];
    if (prev && prev.autor === m.autor && prev.fecha === m.fecha && prev.hora === m.hora) prev.cuerpo += "\n" + m.cuerpo;
    else out.push({ ...m });
  }
  return out;
}

const idDe = (m) => `rt-${m.fecha.replace(/-/g, "")}-${m.hora.replace(":", "")}`;
const limpiarCuerpo = (c) => c
  .replace(/<Se edit[óo] este mensaje\.?>/gi, "")
  .replace(/Se elimin[oó] este mensaje\.?/gi, "")
  .replace(/<Multimedia omitido>/gi, "")
  .replace(/ /g, " ")
  .trim();

// ------------------------------------------------------ reglas de la app
function cargarLector() {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  for (const f of ["assets/js/mtto-data.js", "assets/js/mtto-lector.js", "assets/js/reportes-data.js", "assets/js/turnos-data.js"]) {
    const ruta = join(raiz, f);
    if (existsSync(ruta)) vm.runInContext(readFileSync(ruta, "utf8"), ctx, { filename: f });
  }
  if (!ctx.window.MTTO_LECTOR) throw new Error("No cargó mtto-lector.js (¿falta window.MTTO.reglas?)");
  return ctx.window;
}

// ------------------------------------------------ reporte (para Reportes)
function cabeceraDeReporte(cuerpo) {
  const cab = cuerpo.replace(/[*_]/g, "").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 4).join(" ").toLowerCase();
  return /\breporte\b/.test(cab) || (/\bturno\b/.test(cab) && /(sede|grupo|d[ií]a|noche|\bsd\s*\d)/.test(cab));
}

// La sede la dice el encabezado ("Reporte turno sede 2"); si no la dice, es
// la de quien firma. Solo el encabezado: más abajo el texto habla de "traslado
// a sede 2" o "apoyo en planta 2" y eso no hace que el reporte sea de Sede 2.
function detectarSede(cuerpo, autor) {
  const norm = cuerpo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const head = norm.split("\n").slice(0, 5).join(" ");
  if (/\b(?:SEDE|SD)\s*2\b|\bVIA\s*40\b|\bPLANTA\s*2\b/.test(head)) return "Sede 2";
  if (/\b(?:SEDE|SD)\s*4\b/.test(head)) return "Sede 4";
  const esSede4Exclusivo = /\b(?:HUTTLIN|FETTE|BOSCH|BOSHC|NJP\s*[13]|INTEGRA|MB\s*432|SCHMUCKER|MS\s*235|CB\s*550|MARZIO\s*[145]|CL\s*[34]|R200|R400)\b/.test(norm);
  const esSede2Firma = /\b(?:C(?:ENTRO)?\s*(?:DE\s*)?LIQUIDOS?\s*1|CL\s*1|ENVASAD\w*\s*1)\b/.test(norm) ||
    (/\bGB\s*100\b/.test(norm) && /\b(?:BLISTER\s*5|B5|RONCHI|CD\s*40)\b/.test(norm));
  if (esSede2Firma && !esSede4Exclusivo) return "Sede 2";
  const g = TURNOS && TURNOS.grupoDeAutor(autor);
  return g ? g.sede : "Sede 4";
}

// Día (8 a 20) o noche (20 a 8) y la fecha en que EMPEZÓ ese turno: el
// reporte de la noche llega a la mañana siguiente y es de la noche anterior.
// Lo decide turnos-data.js con la hora del mensaje, lo que dice el encabezado
// y el grupo de quien firma (el turno que de verdad trabajó ese grupo).
function pistaDe(cuerpo) {
  const head = String(cuerpo || "").replace(/\*/g, "").slice(0, 400);
  return /\bnoche\b/i.test(head) ? "Noche" : /\bd[ií]as?\b|\bma[ñn]ana\b/i.test(head) ? "Día" : "";
}
function turnoReal(msg) {
  const pista = msg.pista !== undefined ? msg.pista : pistaDe(msg.cuerpo);
  if (TURNOS) return TURNOS.turnoDelMensaje(msg.fecha, msg.hora, msg.autor, pista);
  const turno = pista || (msg.hora < "14" ? "Noche" : "Día");
  return { turno, fecha: msg.fecha, grupo: "" };
}

// La etiqueta del reporte: el grupo que de verdad trabajó ese turno (según
// turnos-data.js y quien firma: "Grupo 4-3 · Noche"), el mismo que usa el
// Registro diario. Solo si no se sabe quién firma vale un "Grupo N" escrito en
// el encabezado. El "TURNO #2" de los encabezados de Sede 4 es el turno de
// producción, no el grupo de mantenimiento: antes salía como "Grupo 2" en
// reportes de los grupos 4-1 y 4-3.
function detectarTurno(msg) {
  const t = turnoReal(msg);
  const head = msg.cuerpo.replace(/\*/g, "").slice(0, 400);
  const escrito = (head.match(/grupo\s*#?\s*([1-3])\b/i) || [])[1];
  const grupo = t.grupo ? t.grupo.replace(/^Grupo Sede /, "Grupo ") : escrito ? `Grupo ${escrito}` : "";
  return [grupo, t.turno].filter(Boolean).join(" · ");
}

const SKIP_EQUIPO = [
  /equipos\s+operativ/i, /equipos\s+operando/i, /^[\s>*_\-=#•·]+$/,
  /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/, /^\d{1,2}\/\d{1,2}\/\d{4}$/,
  /sede\s*\d/i, /^\s*sd\s*\d/i, /grupo\s*#?\s*\d/i, /^turno\b/i, /^\[?\s*area\s+de/i,
  /^[\s>*_\-=#]*s[oó]lidos?[\s\]#]*$/i, /^[\s>*_\-=#]*l[ií]quidos?[\s\]#]*$/i, /^l[ií]quido\s*$/i, /^s[oó]lidos?\s*$/i,
  /tanques?\s+de\s+fabricacion/i, /tanque\s+de\s+fabricaci/i, /preparaci[oó]n\s+de\s+solucion/i,
  /<se\s+edit/i, /^buen[oa]s?\b/i, /^reporte\b/i, /^\d{1,2}:\d{2}\s*(a|-)\s*\d{1,2}:\d{2}/,
];

const ES_PROSA = (l) =>
  /\bse\s+(atiende|realiza|monta|limpia|cambia|encuentra|entrega|repara|ajusta|reinicia|desarma|calibra|procede|detecta|observa|presenta|recibe|solicita|necesita|coloca|quita|arma|baja|sube|pone|deja|requete|revisa)\b/i.test(l) ||
  (/\b(llamado|pendiente|qued[oó]\s|queda\s|se\s+env[ií]a|se\s+muestra|se\s+verifica)\b/i.test(l) && l.length > 40);

const limpiarLinea = (l) => l.replace(/ /g, " ").replace(/^\s*[-•·]\s*/, "").replace(/\*/g, "").trim();

function parseLineaEquipo(l) {
  const conColon = l.match(/^([^:]{1,48}):\s*(.*)$/);
  if (conColon) {
    const equipo = conColon[1].trim().replace(/\s*>\s*$/, "").trim();
    const producto = conColon[2].trim().replace(/\s*>\s*$/, "").trim();
    if (!equipo || /^\d+$/.test(equipo)) return null;
    return { equipo, producto };
  }
  const conNumero = l.match(/^(\D+?\s+#?\d+[A-Za-z#.\-]*)\s+(.+)$/);
  if (conNumero && conNumero[1].length <= 30) return { equipo: conNumero[1].trim(), producto: conNumero[2].trim() };
  const unaPalabraEq = l.match(/^([A-Za-zÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑ0-9#.\-]{1,20})\s+(.+)$/);
  if (unaPalabraEq && unaPalabraEq[2].split(/\s+/).length <= 14) return { equipo: unaPalabraEq[1], producto: unaPalabraEq[2] };
  if (l.length <= 32 && !/\s\s/.test(l)) return { equipo: l, producto: "" };
  return null;
}

function partirNovedades(raw) {
  const t = String(raw || "").replace(/\r/g, "").replace(/ /g, " ").trim();
  if (!t) return [];
  const lineas = t.split("\n").map((l) => l.trim())
    .filter((l) => l && !/^[_=\-–—*#•·\s]+$/.test(l) && !/^noVEDADES?$/i.test(l.replace(/[^A-Za-z]/g, "")));
  if (!lineas.length) return [];
  const conEtiqueta = lineas.filter((l) => /^[-*]?[^:*\n]{1,48}\s*:\s*\S/.test(l));
  if (conEtiqueta.length >= 2 || (conEtiqueta.length >= 1 && lineas.length <= conEtiqueta.length + 2)) return lineas;
  const paras = t.split(/\n{2,}/).map((s) => s.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
  if (paras.length >= 2) return paras;
  const trozos = [];
  let buf = "";
  for (const l of lineas) {
    const nuevo = !buf ||
      (/^[A-ZÁÉÍÓÚÑ0-9][A-Za-z0-9ÁÉÍÓÚÑ #/.\-]{1,30}\s/.test(l) && ES_PROSA(buf) && !ES_PROSA(l)) ||
      (ES_PROSA(l) && /^[A-ZÁÉÍÓÚÑ0-9]/.test(l) && buf.length > 120);
    if (nuevo && buf) { trozos.push(buf); buf = l; } else buf = buf ? `${buf} ${l}` : l;
  }
  if (buf) trozos.push(buf);
  return trozos.filter(Boolean);
}

function partirCuerpo(cuerpo) {
  const reNov = /(?:^|\n)[ \t]*(?:[-=_*•·\s]{0,120})\b(?:NOVEDADES?|NIVEDADES?|Novedades?|Nota)\b[ \t]*[:*]?[ \t]*/i;
  const m = reNov.exec(cuerpo);
  if (m) return { bloqueEq: cuerpo.slice(0, m.index), bloqueNov: cuerpo.slice(m.index + m[0].length) };
  const lineas = cuerpo.split("\n");
  let corte = -1;
  for (let i = 0; i < lineas.length; i++) {
    const l = limpiarLinea(lineas[i]);
    if (!l || SKIP_EQUIPO.some((re) => re.test(l)) || /^\d{1,2}:\d{2}\b/.test(l)) continue;
    const conColonCorto = /^([^:]{1,40}):\s*\S/.test(l);
    if (ES_PROSA(l) && !conColonCorto) { corte = i; break; }
    if (!parseLineaEquipo(l)) { corte = i; break; }
  }
  if (corte < 0) return { bloqueEq: cuerpo, bloqueNov: "" };
  return { bloqueEq: lineas.slice(0, corte).join("\n"), bloqueNov: lineas.slice(corte).join("\n") };
}

function parseEquipos(bloque) {
  const eqs = [];
  const vistos = new Set();
  for (const cruda of bloque.split("\n")) {
    const l = limpiarLinea(cruda);
    if (!l || SKIP_EQUIPO.some((re) => re.test(l)) || /^\d{1,2}:\d{2}\b/.test(l)) continue;
    const eq = parseLineaEquipo(l);
    if (!eq) continue;
    const clave = `${eq.equipo.toLowerCase()}|${eq.producto.toLowerCase()}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    eqs.push(eq);
  }
  return eqs;
}

function reporteDe(msg) {
  const cuerpo = limpiarCuerpo(msg.cuerpo);
  const { bloqueEq, bloqueNov } = partirCuerpo(cuerpo);
  return {
    id: idDe(msg),
    fecha: msg.fecha,
    hora: msg.hora,
    autor: msg.autor,
    sede: detectarSede(cuerpo, msg.autor),
    turno: detectarTurno({ ...msg, cuerpo }),
    fechaTurno: turnoReal({ ...msg, cuerpo }).fecha,
    equipos: parseEquipos(bloqueEq),
    novedades: partirNovedades(bloqueNov),
    texto: cuerpo,
  };
}

// ---------------------------------------- novedad (para el Registro diario)
// Mismo formato que generar_registro_mtto.py
const tecnico = (autor) => {
  const tel = autor.replace(/\D/g, "");
  if (/^\+?[\d\s]+$/.test(autor) && tel.length >= 7) return `Tecnico ...${tel.slice(-4)}`;
  return autor.replace(/^@/, "");
};

// Lo que el lector toma por novedad y no lo es: la línea de estado de una
// máquina ("Centro líquido 1: montaje orlistat", "PAILOT B: limpieza") y la
// charla del grupo ("ya se solucionó", despedidas). No son fallas ni trabajos.
const sinTilde = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
function esRuido(r) {
  const de = sinTilde(r.de);
  if (/^[^\n:]{1,40}(:|\n)\s*(montaje|limpieza|stand ?by|disponible|inspeccion|mtto|mantenimiento)\b[^\n]{0,45}$/.test(de) && !/\bse\s/.test(de)) return true;
  if (/viejo querido|se nos escapan|^ya se soluciono|^gracias\b|^buen(os|as)? (dias|tardes|noches)\b[^\n]{0,30}$/.test(de)) return true;
  return /no identificado/i.test(r.eq || "") && de.length < 25;
}

// ------------------------------------------------------------------ main
const args = process.argv.slice(2);
const arg = args.find((a) => !a.startsWith("--"));
if (!arg) {
  console.error('Uso: node scripts/importar-reportes-whatsapp.mjs "chat.zip|chat.txt" [--solo-reportes]');
  process.exit(1);
}
const soloReportes = args.includes("--solo-reportes");

const W = cargarLector();
const TURNOS = W.TURNOS || null;
const L = W.MTTO_LECTOR;
const MTTO = W.MTTO;
const R = MTTO.reglas;
const reOper = new RegExp(R.operativo), rePend = new RegExp(R.pendiente);

const msgs = agrupar(parseMensajes(leerChat(arg)).filter((m) => m.fecha >= DESDE));
const entradas = [];
for (const m of msgs) {
  if (SUPERVISORES.test(m.autor)) continue;
  const cuerpo = limpiarCuerpo(m.cuerpo);
  if (!cuerpo) continue;
  const lectura = L.leer(cuerpo);
  if (!lectura.novedades.length && lectura.estados.length < 2) continue;
  entradas.push({ msg: { ...m, cuerpo }, lectura });
}

// 1. Reportes de turno
const reportes = [];
const ids = new Set();
for (const { msg, lectura } of entradas) {
  if (!cabeceraDeReporte(msg.cuerpo) && lectura.estados.length < 2) continue;
  const r = reporteDe(msg);
  let id = r.id, n = 2;
  while (ids.has(id)) id = `${r.id}-${n++}`;
  r.id = id;
  ids.add(id);
  reportes.push(r);
}
// Lo que ya estaba y este export no trae (un export más corto) se conserva
(Array.isArray(W.REPORTES_TURNO) ? W.REPORTES_TURNO : []).forEach((r) => { if (r && r.id && !ids.has(r.id)) { ids.add(r.id); reportes.push(r); } });
reportes.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
const salidaRep = join(raiz, "assets", "js", "reportes-data.js");
writeFileSync(salidaRep,
  `// Generado por scripts/importar-reportes-whatsapp.mjs — no editar a mano.\n// Reportes de turno del chat "Mtto Medicamentos" desde ${DESDE}.\nwindow.REPORTES_TURNO = ${JSON.stringify(reportes, null, 2)};\n`, "utf8");
const x4 = reportes.filter((r) => r.sede === "Sede 4").length;
console.log(`Reportes de turno: ${reportes.length} (Sede 4: ${x4}, Sede 2: ${reportes.length - x4}) del ${reportes[0]?.fecha} al ${reportes.at(-1)?.fecha} → ${salidaRep}`);

// 2. Registro diario: se agrega lo posterior al último mensaje ya leído
if (!soloReportes) {
  const H = MTTO.hist;
  const ultimoLeido = H.registros.reduce((max, r) => (r.rid > max ? r.rid : max), "");
  const nuevas = entradas.filter(({ msg }) => idDe(msg) > ultimoLeido);
  let seq = H.registros.reduce((max, r) => Math.max(max, Number(r.id.split("-")[1]) || 0), 0);
  let agregadas = 0;
  let hasta = MTTO.hasta;
  for (const { msg, lectura } of nuevas) {
    const { turno: t, fecha: f } = turnoReal(msg);
    const sede = detectarSede(msg.cuerpo, msg.autor);
    if (f > hasta) hasta = f;
    if (msg.fecha > hasta) hasta = msg.fecha;
    for (const n of lectura.novedades) {
      if (esRuido({ de: n.de, eq: n.eq })) continue;
      seq++;
      const oper = reOper.test(L.norm(n.de)), pend = rePend.test(L.norm(n.de));
      H.registros.push({
        id: `H${f.replace(/-/g, "")}-${String(seq).padStart(4, "0")}`,
        f, hr: msg.hora, rid: idDe(msg), t, s: sede,
        eq: n.eq, ar: n.ar, cat: n.cat, tp: n.tp, fa: n.fa || "Sin clasificar", ac: n.ac,
        de: n.de, min: n.min, det: null,
        ef: pend && oper ? "Operativo con pendiente" : pend ? "Pendiente" : oper ? "Operativo" : "Sin cierre",
        frep: n.frep, tec: tecnico(msg.autor), src: "chat",
      });
      agregadas++;
    }
    // El estado de los equipos (producción, limpieza, stand by) ya no se lleva:
    // solo importan las fallas, así que hist.horas y ultimoEstado no se tocan.
  }
  // Lo ya importado se vuelve a ubicar con las mismas reglas: el reporte de la
  // noche que llegó en la mañana pasa a la noche anterior (y a su grupo), y la
  // sede es la del encabezado o la de quien firma, no la de una línea que dice
  // "apoyo en sede 2". Y se quita lo que no es novedad (estado, charla).
  const repPorId = new Map(reportes.map((r) => [r.id, r]));
  let reubicadas = 0;
  for (const r of H.registros) {
    if (r.src !== "chat" || !r.rid) continue;
    const m = /^rt-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(r.rid);
    if (!m) continue;
    const rep = repPorId.get(r.rid);
    const autor = rep ? rep.autor : r.tec;
    const x = turnoReal({ fecha: `${m[1]}-${m[2]}-${m[3]}`, hora: `${m[4]}:${m[5]}`, autor, pista: rep ? pistaDe(rep.texto) : "" });
    const s = rep ? rep.sede : (TURNOS && TURNOS.grupoDeAutor(autor) ? TURNOS.grupoDeAutor(autor).sede : r.s);
    if (x.fecha !== r.f || x.turno !== r.t || s !== r.s) { r.f = x.fecha; r.t = x.turno; r.s = s; reubicadas++; }
  }
  const antesRuido = H.registros.length;
  H.registros = H.registros.filter((r) => !(r.src === "chat" && esRuido(r)));
  const quitadas = antesRuido - H.registros.length;
  if (reubicadas || quitadas) console.log(`Registro diario: ${reubicadas} novedades reubicadas de turno o sede, ${quitadas} quitadas por no ser novedad`);
  // Lo ya importado también se aclara: "Marzio" en la Sede 2 es la Marzio 2
  let aclaradas = 0;
  for (const r of H.registros) {
    const eq = L.porSede ? L.porSede(r.eq, r.s) : r.eq;
    if (eq !== r.eq) { r.eq = eq; r.ar = L.areaDe(eq); aclaradas++; }
  }
  if (aclaradas) console.log(`Registro diario: ${aclaradas} novedades con equipo "sin especificar" aclarado por sede`);

  if (agregadas || nuevas.length || aclaradas || reubicadas || quitadas) {
    MTTO.hasta = hasta;
    MTTO.generado = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 16).replace("T", " ");
    const salidaM = join(raiz, "assets", "js", "mtto-data.js");
    const antes = readFileSync(salidaM, "utf8").split(/\r?\n/);
    const cab = antes.filter((l) => l.startsWith("//")).map((l) =>
      l.replace(/del \d{4}-\d{2}-\d{2} al \d{4}-\d{2}-\d{2}/, `del ${MTTO.desde} al ${MTTO.hasta}`));
    if (!cab.some((l) => l.includes("importar-reportes-whatsapp"))) cab.push("// Lo posterior al último import de Python lo agrega scripts/importar-reportes-whatsapp.mjs.");
    writeFileSync(salidaM, `${cab.join("\n")}\nwindow.MTTO = ${JSON.stringify(MTTO)};\n`, "utf8");
    console.log(`Registro diario: ${nuevas.length} mensajes nuevos → ${agregadas} novedades (total ${H.registros.length}, hasta ${MTTO.hasta}) → ${salidaM}`);
  } else {
    console.log("Registro diario: nada nuevo después del último mensaje leído.");
  }
}
