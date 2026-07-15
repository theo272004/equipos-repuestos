// Envía recordatorios de mantenimiento a un grupo de Telegram.
// Lo ejecuta GitHub Actions cada ~15 min (ver .github/workflows/recordatorios.yml).
// Lee las tareas de Firestore (reglas abiertas + API key pública), mira cuáles
// "ya tocan" (remindNextAt <= ahora) y manda el aviso; luego reprograma el siguiente.
//
// Secrets necesarios en GitHub (Settings -> Secrets and variables -> Actions):
//   TELEGRAM_BOT_TOKEN  -> token del bot (@BotFather)
//   TELEGRAM_CHAT_ID    -> id del grupo (número negativo, ej. -1001234567890)

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
const PROJECT = process.env.FIREBASE_PROJECT_ID || "mantenimiento-f405b";
const APIKEY = process.env.FIREBASE_API_KEY || "";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// ---- helpers de tipos Firestore REST ----
const str = (v) => (v ? (v.stringValue ?? v.timestampValue ?? "") : "");
const num = (v) => (v ? Number(v.integerValue ?? v.doubleValue ?? 0) : 0);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));

function advance(freq, from, everyN) {
  const d = new Date(from);
  const step = () => {
    if (freq === "daily") d.setDate(d.getDate() + 1);
    else if (freq === "weekly") d.setDate(d.getDate() + 7);
    else if (freq === "monthly") d.setMonth(d.getMonth() + 1);
    else if (freq === "everyN") d.setMonth(d.getMonth() + (everyN || 1));
    else return false;
    return true;
  };
  if (!step()) return null; // "once" u otro: no hay siguiente
  const now = new Date();
  let guard = 0;
  while (d <= now && guard++ < 1000) step();
  return d;
}

function buildMsg(f) {
  const prIcon = { Alta: "🔴", Media: "🟡", Baja: "⚪" }[str(f.priority)] || "🟡";
  const lines = [];
  lines.push("🔔 <b>Recordatorio de mantenimiento</b>");
  lines.push("");
  lines.push(`${prIcon} <b>${esc(str(f.title) || "(sin título)")}</b>`);
  const machine = str(f.machineName);
  if (machine && machine !== "General / Otra") lines.push(`🛠 Máquina: ${esc(machine)}`);
  if (str(f.priority)) lines.push(`Prioridad: ${esc(str(f.priority))}`);
  const st = { pendiente: "Pendiente", "en-progreso": "En progreso", hecha: "Hecha" }[str(f.status)] || str(f.status);
  if (st) lines.push(`Estado: ${esc(st)}`);
  if (str(f.remindTime)) lines.push(`🕐 Programado: ${esc(str(f.remindTime))} (Colombia)`);
  if (str(f.desc)) lines.push("", esc(str(f.desc)));
  return lines.join("\n");
}

async function sendTelegram(text) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  const j = await r.json();
  if (!j.ok) console.error("Telegram error:", JSON.stringify(j));
  return j.ok;
}

async function patchTask(id, freq, nextDate) {
  // "once" ya disparó -> se apaga (freq vacío). Recurrente -> nuevo remindNextAt.
  const fields = {};
  const mask = [];
  if (nextDate) {
    fields.remindNextAt = { stringValue: nextDate.toISOString() };
    mask.push("remindNextAt");
  } else {
    fields.remindFreq = { stringValue: "" };
    fields.remindNextAt = { stringValue: "" };
    mask.push("remindFreq", "remindNextAt");
  }
  const qs = mask.map((m) => `updateMask.fieldPaths=${m}`).join("&");
  const r = await fetch(`${BASE}/tareas/${id}?key=${APIKEY}&${qs}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!r.ok) console.error("Firestore PATCH error:", r.status, await r.text());
}

async function main() {
  if (!TOKEN || !CHAT) {
    console.log("Aún no hay TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID configurados. Nada que enviar.");
    return; // salir sin error para no ensuciar el historial de Actions
  }
  const res = await fetch(`${BASE}/tareas?pageSize=300&key=${APIKEY}`);
  if (!res.ok) { console.error("Firestore GET error:", res.status, await res.text()); process.exit(1); }
  const data = await res.json();
  const docs = data.documents || [];
  const now = new Date();
  let sent = 0;

  for (const doc of docs) {
    const f = doc.fields || {};
    const freq = str(f.remindFreq);
    const nextAtStr = str(f.remindNextAt);
    if (!freq || !nextAtStr) continue;
    const nextAt = new Date(nextAtStr);
    if (isNaN(nextAt) || nextAt > now) continue; // aún no toca
    if (str(f.status) === "hecha") continue; // no molestar con tareas ya hechas

    const ok = await sendTelegram(buildMsg(f));
    if (ok) {
      sent++;
      const id = doc.name.split("/").pop();
      await patchTask(id, freq, advance(freq, nextAt, num(f.remindEveryN)));
    }
  }
  console.log(`Listo. Recordatorios revisados: ${docs.length}. Enviados: ${sent}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
