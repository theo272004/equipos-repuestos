// Lo que el bot manda solo al grupo de Telegram. Lo ejecuta GitHub Actions
// cada ~5 min (ver .github/workflows/recordatorios.yml):
//
//   1. Recordatorios de tareas que "ya tocan" (remindNextAt <= ahora), con
//      botones para darlas por hechas o posponerlas.
//   2. Parte de la mañana (8:40) y de la noche (20:40): el turno que termina,
//      equipos parados, pendientes, almacén, presupuesto y quién entra.
//   3. Aviso si todavía falta el reporte del turno que terminó (9:30 y 21:30).
//   4. Resumen de la semana, los lunes a las 7:30.
//   5. Anuncio de cada reporte llenado en el formulario de turno.
//
// Lo ya enviado se anota en Firestore (colección "bot", documento "estado")
// para no repetirlo. Si esas reglas aún no están publicadas, se manda solo
// en la primera pasada tras la hora (ventana de 5 minutos).
//
// Secrets en GitHub (Settings → Secrets and variables → Actions):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
//   FIREBASE_EMAIL, FIREBASE_PASSWORD  (solo si se activa la "clave del taller")

import { crearCliente } from "./lib/firestore-rest.mjs";
import { tg, enviar, configurado } from "./lib/telegram.mjs";
import { cargarDatosApp, leerNube, panorama, hoyCO, horaCO, enTurno, esc } from "./lib/datos-app.mjs";
import { msgParte, msgFaltaReporte, msgSemana, msgNuevoReporte, botonesApp } from "./lib/mensajes.mjs";

const PROYECTO = process.env.FIREBASE_PROJECT_ID || "mantenimiento-f405b";
const db = crearCliente({ proyecto: PROYECTO, apiKey: process.env.FIREBASE_API_KEY || "", email: process.env.FIREBASE_EMAIL, password: process.env.FIREBASE_PASSWORD });

// Horarios (hora de Colombia). Cada uno se manda una vez, entre "desde" y "hasta".
// El turno de noche termina a las 8:00 y su reporte llega hacia las 8:30; el
// de día termina a las 20:00. El parte sale cuando ya debería estar el reporte.
const AGENDA = [
  { clave: "parte-am", desde: "08:40", hasta: "11:00", que: "parte", cual: "am" },
  { clave: "reporte-noche", desde: "09:30", hasta: "12:00", que: "falta-reporte" },
  { clave: "parte-pm", desde: "20:40", hasta: "23:00", que: "parte", cual: "pm" },
  { clave: "reporte-dia", desde: "21:30", hasta: "23:59", que: "falta-reporte" },
  { clave: "semana", desde: "07:30", hasta: "11:00", que: "semana", diaSemana: 1 },
];
// Sin memoria en la nube: solo en la primera pasada después de la hora
const VENTANA_SIN_MEMORIA_MIN = 5;

const str = (v) => (v == null ? "" : String(v));
const APP = process.env.APP_URL || "https://theo272004.github.io/equipos-repuestos/";
const esc2 = (s) => esc(s);

// ------------------------------------------------ 1. recordatorios de tareas
function avanzar(freq, desde, cadaN) {
  const d = new Date(desde);
  const paso = () => {
    if (freq === "daily") d.setDate(d.getDate() + 1);
    else if (freq === "weekly") d.setDate(d.getDate() + 7);
    else if (freq === "monthly") d.setMonth(d.getMonth() + 1);
    else if (freq === "everyN") d.setMonth(d.getMonth() + (cadaN || 1));
    else return false;
    return true;
  };
  if (!paso()) return null;
  const ahora = new Date();
  let g = 0;
  while (d <= ahora && g++ < 1000) paso();
  return d;
}

function msgTarea(f) {
  const ico = { Alta: "🔴", Media: "🟡", Baja: "⚪" }[str(f.priority)] || "🟡";
  const l = ["🔔 <b>Recordatorio de mantenimiento</b>", "", `${ico} <b>${esc2(str(f.title) || "(sin título)")}</b>`];
  const maq = str(f.machineName);
  if (maq && maq !== "General / Otra") l.push(`🛠 Máquina: ${esc2(maq)}`);
  if (str(f.priority)) l.push(`Prioridad: ${esc2(str(f.priority))}`);
  const st = { pendiente: "Pendiente", "en-progreso": "En progreso", hecha: "Hecha" }[str(f.status)] || str(f.status);
  if (st) l.push(`Estado: ${esc2(st)}`);
  if (str(f.remindTime)) l.push(`🕐 Programado: ${esc2(str(f.remindTime))} (Colombia)`);
  if (str(f.desc)) l.push("", esc2(str(f.desc)));
  return l.join("\n");
}
const tecladoTarea = (id) => ({
  inline_keyboard: [
    [{ text: "✅ Hecho", callback_data: `d:${id}` }],
    [{ text: "Posponer 1 día", callback_data: `p1:${id}` }, { text: "Posponer 1 semana", callback_data: `p7:${id}` }],
    [{ text: "Quitar aviso", callback_data: `m:${id}` }],
  ],
});

async function recordatorios(tareas) {
  const ahora = new Date();
  let enviados = 0;
  for (const f of tareas) {
    const freq = str(f.remindFreq);
    const prox = str(f.remindNextAt);
    if (!freq || !prox || str(f.status) === "hecha") continue;
    const cuando = new Date(prox);
    if (isNaN(cuando) || cuando > ahora) continue;
    const id = f._doc || f.id;
    const r = await tg("sendMessage", { chat_id: process.env.TELEGRAM_CHAT_ID, text: msgTarea(f), parse_mode: "HTML", disable_web_page_preview: true, reply_markup: tecladoTarea(id) });
    if (!r.ok) continue;
    enviados++;
    const sig = avanzar(freq, cuando, Number(f.remindEveryN) || 1);
    await db.actualizar("tareas", id, sig ? { remindNextAt: sig.toISOString() } : { remindFreq: "", remindNextAt: "" });
  }
  return enviados;
}

// ------------------------------------------------------- 2–4. la agenda
function tocaAhora(a, memoria, hoy, hm) {
  const dow = new Date(hoy + "T12:00:00Z").getUTCDay();
  if (a.diaSemana !== undefined && dow !== a.diaSemana) return false;
  if (hm < a.desde || hm > a.hasta) return false;
  const clave = `${a.clave}-${hoy}`;
  if (memoria) return !memoria[clave];
  // Sin memoria: solo en los primeros minutos de la ventana
  const [h, m] = a.desde.split(":").map(Number);
  const [h2, m2] = hm.split(":").map(Number);
  return (h2 * 60 + m2) - (h * 60 + m) < VENTANA_SIN_MEMORIA_MIN;
}

async function main() {
  if (!configurado()) { console.log("Sin TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID: nada que enviar."); return; }
  // Cada pasada lee lo mínimo (corre 288 veces al día y cada documento leído
  // cuenta en la cuota de Firebase, 50.000 al día en el plan gratuito): las
  // tareas con el recordatorio ya vencido, no todas, y el estado del bot. Leer
  // todas las tareas cada 5 minutos eran (número de tareas × 288) lecturas al
  // día. Todo lo demás solo cuando toca un parte o un aviso.
  const vencidas = await db.consultarRango("tareas", "remindNextAt", "2000-01-01", new Date().toISOString());
  // Si la consulta falla (p. ej. reglas viejas), se vuelve a leer todo como antes
  const tareas = vencidas === null ? await db.listar("tareas") : vencidas;
  const tareasEnviadas = await recordatorios(tareas);

  const hoy = hoyCO();
  const hm = horaCO();
  const est = await db.obtener("bot", "estado");
  const memoria = est === undefined ? null : ((est && est.enviados) || {});
  const nuevos = {};
  const pendientesAgenda = AGENDA.filter((a) => tocaAhora(a, memoria, hoy, hm));
  let pan = null;
  let W = null;
  if (pendientesAgenda.length) {
    W = cargarDatosApp();
    const nube = await leerNube(db);
    pan = panorama(W, nube);
  }

  for (const a of pendientesAgenda) {
    let ok = false;
    if (a.que === "parte") ok = await enviar(msgParte(pan, a.cual), botonesApp());
    else if (a.que === "semana") ok = await enviar(msgSemana(pan), botonesApp());
    else if (a.que === "falta-reporte") {
      ok = true;
      for (const [sede, r] of Object.entries(pan.reportes)) {
        if (r.ok) continue;
        const gente = ((enTurno(W, pan.ant.fecha, pan.ant.clave)[sede === "Sede 4" ? "sede4" : "sede2"]) || {}).gente || [];
        await enviar(msgFaltaReporte(sede, pan.ant, gente), { inline_keyboard: [[{ text: "📝 Llenar el reporte ahora", url: `${APP}reporte.html?sede=${encodeURIComponent(sede)}&fecha=${pan.ant.fecha}&turno=${encodeURIComponent(pan.ant.turno)}` }]] });
      }
    }
    if (ok) nuevos[`${a.clave}-${hoy}`] = new Date().toISOString();
  }

  // Reportes nuevos del formulario: solo los que aún no se anunciaron
  let anunciados = 0;
  for (const r of await db.consultar("reportes_turno", "anunciado", false, 20)) {
    if (r.borrado || Date.now() - Date.parse(r.createdAt || 0) > 2 * 864e5) { await db.actualizar("reportes_turno", r._doc, { anunciado: true }); continue; }
    const ok = await enviar(msgNuevoReporte(r), { inline_keyboard: [[{ text: "Ver en el Registro diario", url: `${APP}?v=registro&fecha=${r.fecha}` }]] });
    if (ok) { anunciados++; await db.actualizar("reportes_turno", r._doc, { anunciado: true }); }
  }

  if (memoria && Object.keys(nuevos).length) {
    const todo = { ...memoria, ...nuevos };
    const claves = Object.keys(todo).sort().slice(-80);
    await db.guardar("bot", "estado", { id: "estado", enviados: Object.fromEntries(claves.map((k) => [k, todo[k]])), actualizado: new Date().toISOString() });
  }
  console.log(`Listo ${hoy} ${hm}. Tareas avisadas: ${tareasEnviadas}. Agenda: ${Object.keys(nuevos).join(", ") || "nada"}. Reportes anunciados: ${anunciados}. Memoria: ${memoria ? "nube" : "ventana"}.`);
  console.log("Colecciones:", JSON.stringify(db.estado));
}

main().catch((e) => { console.error(e); process.exit(1); });
