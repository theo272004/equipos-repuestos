// Atiende lo que la gente hace en Telegram: los botones de los recordatorios y
// unos pocos comandos para no tener que abrir la web.
//
// CÓMO FUNCIONA, y por qué así:
// Telegram ofrece dos formas de recibir. Una es el webhook, que avisa al
// instante pero exige un servidor con HTTPS, y aquí no hay: el sitio es
// estático en GitHub Pages. La otra es preguntar cada tanto ("getUpdates"), que
// es lo que hace este script desde el mismo cron que ya envía los avisos. No
// hace falta montar nada nuevo.
//
// El precio es la latencia: un botón puede tardar hasta lo que tarde el cron
// (unos 5 minutos) en responder. Para mantenimiento no importa. Si algún día
// molesta, se cambia a webhook sin tocar la lógica de abajo.
//
// Para no repetir mensajes no hace falta guardar nada: al pedirle a Telegram
// los siguientes a partir de uno dado, da por confirmados todos los anteriores y
// no vuelve a mandarlos. Se piden sin marcador, se atienden, y al final se
// confirman. Si una pasada falla a medias, Telegram los guarda 24 h y se
// reintentan en la siguiente.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = String(process.env.TELEGRAM_CHAT_ID || "");
const PROJECT = process.env.FIREBASE_PROJECT_ID || "mantenimiento-f405b";
const APIKEY = process.env.FIREBASE_API_KEY || "";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const CO_MS = 5 * 3600 * 1000; // Colombia es UTC-5 fijo

const str = (v) => (v ? (v.stringValue ?? v.timestampValue ?? "") : "");
const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
const hoyBogota = () => new Date(Date.now() - CO_MS).toISOString().slice(0, 10);

// ---------------------------------------------------------------- Telegram
async function tg(metodo, cuerpo) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const j = await r.json();
  if (!j.ok) console.error(`Telegram ${metodo}:`, JSON.stringify(j));
  return j;
}

const responder = (texto) => tg("sendMessage", { chat_id: CHAT, text: texto, parse_mode: "HTML", disable_web_page_preview: true });

// ---------------------------------------------------------------- Firestore
async function leerTareas() {
  const r = await fetch(`${BASE}/tareas?pageSize=300&key=${APIKEY}`);
  if (!r.ok) { console.error("Firestore GET tareas:", r.status, await r.text()); return []; }
  return (await r.json()).documents || [];
}

async function parchear(coleccion, id, campos) {
  const mask = Object.keys(campos).map((m) => `updateMask.fieldPaths=${m}`).join("&");
  const r = await fetch(`${BASE}/${coleccion}/${id}?key=${APIKEY}&${mask}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: campos }),
  });
  if (!r.ok) console.error("Firestore PATCH:", r.status, await r.text());
  return r.ok;
}

async function crearTarea({ titulo, desc, prioridad, quien }) {
  const id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const fields = {
    id: { stringValue: id },
    machine: { stringValue: "" },
    machineName: { stringValue: "General / Otra" },
    title: { stringValue: titulo },
    desc: { stringValue: desc || "" },
    priority: { stringValue: prioridad || "Media" },
    reporter: { stringValue: quien || "" },
    status: { stringValue: "pendiente" },
    createdAt: { stringValue: new Date().toISOString() },
  };
  const r = await fetch(`${BASE}/tareas?documentId=${id}&key=${APIKEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!r.ok) { console.error("Firestore POST tarea:", r.status, await r.text()); return null; }
  return id;
}

// ---------------------------------------------------------------- botones
async function atenderBoton(cb) {
  const [accion, id] = String(cb.data || "").split(":");
  const quien = cb.from?.first_name || "alguien";
  let aviso = "";

  if (accion === "d") {
    await parchear("tareas", id, {
      status: { stringValue: "hecha" },
      doneAt: { stringValue: new Date().toISOString() },
    });
    aviso = "Marcada como hecha";
  } else if (accion === "p1" || accion === "p7") {
    const dias = accion === "p1" ? 1 : 7;
    const proximo = new Date(Date.now() + dias * 86400000);
    await parchear("tareas", id, { remindNextAt: { stringValue: proximo.toISOString() } });
    aviso = dias === 1 ? "Pospuesta un día" : "Pospuesta una semana";
  } else if (accion === "m") {
    await parchear("tareas", id, {
      remindFreq: { stringValue: "" },
      remindNextAt: { stringValue: "" },
    });
    aviso = "Aviso retirado";
  } else {
    return;
  }

  await tg("answerCallbackQuery", { callback_query_id: cb.id, text: aviso });
  // Se quitan los botones del mensaje original: ya se decidió qué hacer.
  if (cb.message) {
    await tg("editMessageReplyMarkup", { chat_id: cb.message.chat.id, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
  }
  await responder(`✔️ ${esc(aviso)} · <i>${esc(quien)}</i>`);
}

// ---------------------------------------------------------------- comandos
const AYUDA = [
  "<b>Qué sé hacer</b>",
  "",
  "/tarea <i>lo que hay que hacer</i> — crea una tarea",
  "/falta <i>pieza o código</i> — anota que hace falta un repuesto",
  "/hoy — qué hay abierto y qué toca hoy",
  "",
  "En cada recordatorio tienes botones para darlo por hecho, posponerlo o quitarle el aviso.",
].join("\n");

async function atenderComando(msg) {
  const texto = String(msg.text || "").trim();
  const quien = msg.from?.first_name || "";
  const m = texto.match(/^\/(\w+)(?:@\w+)?\s*([\s\S]*)$/);
  if (!m) return;
  const [, comando, resto] = m;

  if (comando === "ayuda" || comando === "help" || comando === "start") {
    await responder(AYUDA);
    return;
  }

  if (comando === "tarea" || comando === "falta") {
    if (!resto.trim()) {
      await responder(comando === "tarea"
        ? "Escríbelo así: <code>/tarea Cambiar rodamiento de la estación 3</code>"
        : "Escríbelo así: <code>/falta 741203262 correa dentada de la Bosch</code>");
      return;
    }
    const esFalta = comando === "falta";
    const id = await crearTarea({
      titulo: esFalta ? `Falta pieza: ${resto.trim()}` : resto.trim(),
      desc: `Anotado desde Telegram${quien ? " por " + quien : ""}.`,
      prioridad: esFalta ? "Alta" : "Media",
      quien,
    });
    await responder(id
      ? `✔️ ${esFalta ? "Anotado el faltante" : "Tarea creada"}: <b>${esc(resto.trim())}</b>\nYa aparece en Tareas pendientes.`
      : "No pude guardarlo. Inténtalo otra vez en un momento.");
    return;
  }

  if (comando === "hoy") {
    const docs = await leerTareas();
    const abiertas = docs.map((d) => d.fields || {}).filter((f) => str(f.status) !== "hecha");
    const hoy = hoyBogota();
    const tocan = abiertas.filter((f) => {
      const n = str(f.remindNextAt);
      return n && new Date(n).getTime() - CO_MS <= new Date(hoy + "T23:59:59Z").getTime();
    });
    const linea = (f) => `• ${esc(str(f.title))}${str(f.machineName) && str(f.machineName) !== "General / Otra" ? " — " + esc(str(f.machineName)) : ""}`;
    const partes = [`<b>Hoy, ${hoy}</b>`, ""];
    partes.push(tocan.length ? `<b>Toca hoy o antes (${tocan.length})</b>\n${tocan.map(linea).join("\n")}` : "Nada programado para hoy.");
    partes.push("");
    partes.push(`<b>Abiertas en total: ${abiertas.length}</b>`);
    if (abiertas.length && abiertas.length <= 12) partes.push(abiertas.map(linea).join("\n"));
    await responder(partes.join("\n"));
    return;
  }
}

// ---------------------------------------------------------------- principal
async function main() {
  if (!TOKEN || !CHAT) {
    console.log("Sin TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID. Nada que atender.");
    return;
  }

  const filtro = encodeURIComponent(JSON.stringify(["message", "callback_query"]));
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?timeout=0&limit=100&allowed_updates=${filtro}`);
  const j = await r.json();
  if (!j.ok) { console.error("getUpdates:", JSON.stringify(j)); return; }

  const updates = j.result || [];
  let ultimo = 0;
  let atendidos = 0;

  for (const u of updates) {
    ultimo = Math.max(ultimo, u.update_id);
    try {
      if (u.callback_query) {
        // Solo se obedece en el chat configurado; lo que venga de fuera se ignora.
        if (String(u.callback_query.message?.chat?.id) !== CHAT) continue;
        await atenderBoton(u.callback_query);
        atendidos++;
      } else if (u.message && u.message.text) {
        if (String(u.message.chat?.id) !== CHAT) continue;
        if (!u.message.text.startsWith("/")) continue;
        await atenderComando(u.message);
        atendidos++;
      }
    } catch (e) {
      console.error("Error atendiendo update", u.update_id, e);
    }
  }

  // Confirmarlos para que Telegram no los vuelva a entregar.
  if (ultimo) await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?timeout=0&limit=1&offset=${ultimo + 1}`);
  console.log(`Mensajes recibidos: ${updates.length}. Atendidos: ${atendidos}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
