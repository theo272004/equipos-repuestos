// Manda al grupo de Telegram un aviso escrito a mano (HTML de Telegram: <b>,
// <i>, <code>, <a>). Lo usa .github/workflows/aviso-telegram.yml: al fusionar
// un cambio de avisos/ultimo.html en master, el aviso sale solo.
//
// Uso: node scripts/enviar-aviso.mjs [avisos/ultimo.html]

import { readFileSync } from "node:fs";
import { enviar, configurado } from "./lib/telegram.mjs";
import { botonesApp } from "./lib/mensajes.mjs";

const ruta = process.argv[2] || "avisos/ultimo.html";
const texto = readFileSync(ruta, "utf8").trim();
if (!texto) { console.log(`${ruta} está vacío: no se manda nada`); process.exit(0); }
if (!configurado()) { console.error("Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID"); process.exit(1); }
const ok = await enviar(texto, botonesApp());
if (!ok) process.exit(1);
console.log(`Aviso enviado (${texto.length} caracteres)`);
