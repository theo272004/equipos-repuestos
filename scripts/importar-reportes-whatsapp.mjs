// Importa los reportes de turno del export de WhatsApp del grupo
// "Mtto Medicamentos" y los deja en assets/js/reportes-data.js
// (window.REPORTES_TURNO), que es lo que consume la sección Reportes
// y el resumen del Diario.
//
// Uso:
//   node scripts/importar-reportes-whatsapp.mjs "ruta/al/chat.zip"
//   node scripts/importar-reportes-whatsapp.mjs "ruta/al/chat.txt"
//
// El id de cada reporte es determinista (fecha + hora del mensaje), así que
// volver a correr el script con un chat más largo solo agrega los nuevos.

import { readFileSync, writeFileSync, existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESDE = "2026-08-01";

// ------------------------------------------------------------------ entrada
function leerChat(ruta) {
  if (!existsSync(ruta)) throw new Error(`No existe: ${ruta}`);
  let txtPath = ruta;
  let tmp = null;
  if (/\.zip$/i.test(ruta)) {
    tmp = mkdtempSync(join(tmpdir(), "chat-mtto-"));
    execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${ruta.replace(/'/g, "''")}' -DestinationPath '${tmp.replace(/'/g, "''")}' -Force"`);
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
const RE_ENCABEZADO = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})(?:\s*[^-]{0,12})?\s+-\s+(.+?):\s*([\s\S]*)$/;

function parseMensajes(texto) {
  const lineas = texto.split("\n");
  const msgs = [];
  let actual = null;
  for (const linea of lineas) {
    const m = linea.match(RE_ENCABEZADO);
    if (m) {
      if (actual) msgs.push(actual);
      const [, d, mes, anio, hh, mm, autor, resto] = m;
      actual = {
        fecha: `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        hora: `${String(hh).padStart(2, "0")}:${mm}`,
        autor: autor.trim(),
        cuerpo: [resto],
      };
    } else if (actual) {
      actual.cuerpo.push(linea);
    }
  }
  if (actual) msgs.push(actual);
  return msgs.map((m) => ({ ...m, cuerpo: m.cuerpo.join("\n").replace(/\n{3,}/g, "\n\n").trim() }));
}

// ------------------------------------------------------------------ parseo
function esReporte(t) {
  const limpia = String(t || "").replace(/\*/g, "").replace(/\u00a0/g, " ");
  return /reporte\s+de\s+turno\b|reporte\s+maquinas\s+turno\b/i.test(limpia.slice(0, 400));
}

function detectarSede(cuerpo) {
  // Solo el encabezado: más abajo el texto habla de "traslado a sede 2" y eso
  // no hace que el reporte sea de Sede 2.
  const head = cuerpo.replace(/\*/g, "").split("\n").slice(0, 3).join(" ");
  if (/\bsede\s*2\b|\bsd\s*2\b/i.test(head)) return "Sede 2";
  return "Sede 4";
}

function detectarTurno(cuerpo) {
  const head = cuerpo.replace(/\*/g, "").slice(0, 400);
  const grupo = /grupo\s*#?\s*1|turno\s*#?\s*1/i.test(head) ? "Grupo 1" : "";
  const turno = /\bnoche\b/i.test(head) ? "Noche" : /\bd[ií]a\b/i.test(head) ? "Día" : "";
  return [grupo, turno].filter(Boolean).join(" · ");
}

const SKIP_EQUIPO = [
  /equipos\s+operativ/i,
  /equipos\s+operando/i,
  /^[\s>*_\-=#•·]+$/,
  /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/,
  /^\d{1,2}\/\d{1,2}\/\d{4}$/,
  /sede\s*\d/i,
  /^\s*sd\s*\d/i,
  /grupo\s*#?\s*\d/i,
  /^turno\b/i,
  /^\[?\s*area\s+de/i,
  /^[\s>*_\-=#]*s[oó]lidos?[\s\]#]*$/i,
  /^[\s>*_\-=#]*l[ií]quidos?[\s\]#]*$/i,
  /^l[ií]quido\s*$/i,
  /^s[oó]lidos?\s*$/i,
  /tanques?\s+de\s+fabricacion/i,
  /tanque\s+de\s+fabricaci/i,
  /preparaci[oó]n\s+de\s+solucion/i,
  /<se\s+edit/i,
  /^buen[oa]s?\b/i,
  /^reporte\b/i,
  /^20:\d{2}\s*-/,
];

const ES_PROSA = (l) =>
  /\bse\s+(atiende|realiza|monta|limpia|cambia|encuentra|entrega|repara|ajusta|reinicia|desarma|calibra|procede|detecta|observa|presenta|recibe|atiende|solicita|necesita|coloca|quita|arma|baja|sube|pone|deja|requete)\b/i.test(l) ||
  /\b(llamado|pendiente|qued[oó]\s|queda\s|se\s+env[ií]a|se\s+muestra|se\s+verifica)\b/i.test(l) && l.length > 40;

function limpiarLinea(l) {
  return l
    .replace(/\u00a0/g, " ")
    .replace(/^\s*[-•·]\s*/, "")
    .replace(/\*/g, "")
    .trim();
}

function parseLineaEquipo(l) {
  const conColon = l.match(/^([^:]{1,48}):\s*(.*)$/);
  if (conColon) {
    const equipo = conColon[1].trim().replace(/\s*>\s*$/, "").trim();
    const producto = conColon[2].trim().replace(/\s*>\s*$/, "").trim();
    if (!equipo || /^\d+$/.test(equipo)) return null;
    return { equipo, producto };
  }
  // Sin dos puntos: "BIN producto", "Blister 5 coltrin", "NJP 2 vitamina A..."
  const conNumero = l.match(/^(\D+?\s+\d+[A-Za-z#.\-]*)\s+(.+)$/);
  if (conNumero && conNumero[1].length <= 30) {
    return { equipo: conNumero[1].trim(), producto: conNumero[2].trim() };
  }
  const unaPalabraEq = l.match(/^([A-Za-zÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑ0-9#.\-]{1,20})\s+(.+)$/);
  if (unaPalabraEq && unaPalabraEq[2].split(/\s+/).length <= 14) {
    return { equipo: unaPalabraEq[1], producto: unaPalabraEq[2] };
  }
  if (l.length <= 32 && !/\s\s/.test(l)) {
    return { equipo: l, producto: "" };
  }
  return null;
}

function partirNovedades(raw) {
  const t = String(raw || "").replace(/\r/g, "").replace(/\u00a0/g, " ").trim();
  if (!t) return [];
  const lineas = t
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^[_=\-–—*#•·\s]+$/.test(l) && !/^noVEDADES?$/i.test(l.replace(/[^A-Za-z]/g, "")));
  if (!lineas.length) return [];
  const conEtiqueta = lineas.filter((l) => /^[-*]?[^:*\n]{1,48}\s*:\s*\S/.test(l));
  if (conEtiqueta.length >= 2 || (conEtiqueta.length >= 1 && lineas.length <= conEtiqueta.length + 2)) {
    return lineas;
  }
  const paras = t
    .split(/\n{2,}/)
    .map((s) => s.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  if (paras.length >= 2) return paras;
  // Párrafos pegados línea a línea: partir donde empieza un evento nuevo
  const trozos = [];
  let buf = "";
  for (const l of lineas) {
    const nuevo =
      !buf ||
      (/^[A-ZÁÉÍÓÚÑ0-9][A-Za-z0-9ÁÉÍÓÚÑ #/.\-]{1,30}\s/.test(l) && ES_PROSA(buf) && !ES_PROSA(l)) ||
      (ES_PROSA(l) && /^[A-ZÁÉÍÓÚÑ0-9]/.test(l) && buf.length > 120);
    if (nuevo && buf) { trozos.push(buf); buf = l; }
    else buf = buf ? `${buf} ${l}` : l;
  }
  if (buf) trozos.push(buf);
  return trozos.filter(Boolean);
}

function partirCuerpo(cuerpo) {
  const reNov =
    /(?:^|\n)[ \t]*(?:[-=_*•·\s]{0,120})\b(?:NOVEDADES?|NIVEDADES?|Novedades?|Nota)\b[ \t]*[:*]?[ \t]*/i;
  const m = reNov.exec(cuerpo);
  if (m) {
    return {
      bloqueEq: cuerpo.slice(0, m.index),
      bloqueNov: cuerpo.slice(m.index + m[0].length),
    };
  }
  // Sin marcador: los equipos van primero y donde empiece la prosa se corta.
  const lineas = cuerpo.split("\n");
  let corte = -1;
  for (let i = 0; i < lineas.length; i++) {
    const l = limpiarLinea(lineas[i]);
    if (!l) continue;
    if (SKIP_EQUIPO.some((re) => re.test(l))) continue;
    if (/^\d{1,2}:\d{2}\b/.test(l)) continue; // horario del turno: 8:00 a 20:00
    const conColonCorto = /^([^:]{1,40}):\s*\S/.test(l);
    // La prosa cierra la zona de equipos, salvo que la línea sea claramente
    // "Equipo: producto" (el producto puede decir "se ajusta…").
    if (ES_PROSA(l) && !conColonCorto) { corte = i; break; }
    const eq = parseLineaEquipo(l);
    if (!eq) { corte = i; break; }
  }
  if (corte < 0) return { bloqueEq: cuerpo, bloqueNov: "" };
  return {
    bloqueEq: lineas.slice(0, corte).join("\n"),
    bloqueNov: lineas.slice(corte).join("\n"),
  };
}

function parseEquipos(bloque) {
  const eqs = [];
  const vistos = new Set();
  for (const cruda of bloque.split("\n")) {
    const l = limpiarLinea(cruda);
    if (!l) continue;
    if (SKIP_EQUIPO.some((re) => re.test(l))) continue;
    if (/^\d{1,2}:\d{2}\b/.test(l)) continue;
    const eq = parseLineaEquipo(l);
    if (!eq) continue;
    const clave = `${eq.equipo.toLowerCase()}|${eq.producto.toLowerCase()}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    eqs.push(eq);
  }
  return eqs;
}

function parseReporte(msg) {
  let cuerpo = msg.cuerpo
    .replace(/<Se edit[óo] este mensaje\.?>/gi, "")
    .replace(/Se elimin[oó] este mensaje\.?/gi, "")
    .replace(/\u00a0/g, " ")
    .trim();
  if (!esReporte(cuerpo)) return null;

  const { bloqueEq, bloqueNov } = partirCuerpo(cuerpo);
  const equipos = parseEquipos(bloqueEq);
  const novedades = partirNovedades(bloqueNov);
  if (!equipos.length && !novedades.length) return null;

  const id = `rt-${msg.fecha.replace(/-/g, "")}-${msg.hora.replace(":", "")}`;
  return {
    id,
    fecha: msg.fecha,
    hora: msg.hora,
    autor: msg.autor,
    sede: detectarSede(cuerpo),
    turno: detectarTurno(cuerpo),
    equipos,
    novedades,
    texto: cuerpo,
  };
}

// ------------------------------------------------------------------ main
const arg = process.argv[2];
if (!arg) {
  console.error('Uso: node scripts/importar-reportes-whatsapp.mjs "chat.zip|chat.txt"');
  process.exit(1);
}

const texto = leerChat(arg);
const msgs = parseMensajes(texto);
const reportes = [];
const ids = new Set();
let candidatos = 0;
for (const m of msgs) {
  if (m.fecha < DESDE) continue;
  if (!esReporte(m.cuerpo)) continue;
  candidatos++;
  const r = parseReporte(m);
  if (!r) {
    console.warn(`  (no parseado) ${m.fecha} ${m.hora} ${m.autor} :: ${m.cuerpo.slice(0, 80).replace(/\n/g, " | ")}`);
    continue;
  }
  let id = r.id;
  let n = 2;
  while (ids.has(id)) id = `${r.id}-${n++}`;
  r.id = id;
  ids.add(id);
  reportes.push(r);
}

reportes.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

const salida = join(raiz, "assets", "js", "reportes-data.js");
const banner = `// Generado por scripts/importar-reportes-whatsapp.mjs — no editar a mano.\n// Reportes de turno del chat "Mtto Medicamentos" desde ${DESDE}.\n`;
writeFileSync(salida, `${banner}window.REPORTES_TURNO = ${JSON.stringify(reportes, null, 2)};\n`, "utf8");

const x4 = reportes.filter((r) => r.sede === "Sede 4").length;
const x2 = reportes.filter((r) => r.sede === "Sede 2").length;
const conEq = reportes.filter((r) => r.equipos.length).length;
const conNov = reportes.filter((r) => r.novedades.length).length;
console.log(`Candidatos: ${candidatos} · Importados: ${reportes.length} (Sede 4: ${x4}, Sede 2: ${x2}; con equipos: ${conEq}, con novedades: ${conNov})`);
if (reportes.length) console.log(`Desde ${reportes[0].fecha} hasta ${reportes.at(-1).fecha}`);
console.log(`→ ${salida}`);
