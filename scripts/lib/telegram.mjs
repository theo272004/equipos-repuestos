// Llamadas a la API de Telegram que usan los dos scripts del bot.
export const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const CHAT = String(process.env.TELEGRAM_CHAT_ID || "");

export async function tg(metodo, cuerpo) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const j = await r.json().catch(() => ({ ok: false }));
  if (!j.ok) console.error(`Telegram ${metodo}:`, JSON.stringify(j).slice(0, 300));
  return j;
}

// Telegram corta en 4096 caracteres: se parte por líneas si hace falta
export async function enviar(texto, teclado, chat = CHAT) {
  const partes = [];
  let actual = "";
  for (const linea of String(texto).split("\n")) {
    if ((actual + "\n" + linea).length > 3900) { partes.push(actual); actual = linea; } else actual = actual ? actual + "\n" + linea : linea;
  }
  if (actual) partes.push(actual);
  let ultimo = null;
  for (let i = 0; i < partes.length; i++) {
    ultimo = await tg("sendMessage", { chat_id: chat, text: partes[i], parse_mode: "HTML", disable_web_page_preview: true, reply_markup: i === partes.length - 1 && teclado ? teclado : undefined });
  }
  return ultimo && ultimo.ok;
}

export const configurado = () => !!(TOKEN && CHAT);
