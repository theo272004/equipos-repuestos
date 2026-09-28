// Atiende lo que la gente hace en Telegram: los botones y los comandos.
//
// CÓMO FUNCIONA, y por qué así:
// El sitio es estático (GitHub Pages) y no hay un servidor que reciba avisos
// al instante (webhook). Este script corre desde el mismo cron que manda los
// recordatorios y le pregunta a Telegram qué llegó ("getUpdates"). El precio
// es la latencia: un comando puede tardar hasta ~5 minutos en responderse.
// Para mantenimiento está bien; si algún día molesta, se cambia a webhook sin
// tocar la lógica de abajo.
//
// Para no repetir mensajes no hace falta guardar nada: al confirmar el último
// update, Telegram no vuelve a entregar los anteriores.

import { crearCliente } from "./lib/firestore-rest.mjs";
import { tg, enviar, configurado, CHAT } from "./lib/telegram.mjs";
import { cargarDatosApp, leerNube, panorama, hoyCO, turnoEnCurso, esc, plano, URL_APP } from "./lib/datos-app.mjs";
import { msgHoy, msgPendientes, msgParados, msgTurno, msgPresupuesto, AYUDA, MENU, botonesApp } from "./lib/mensajes.mjs";

const PROYECTO = process.env.FIREBASE_PROJECT_ID || "mantenimiento-f405b";
const db = crearCliente({ proyecto: PROYECTO, apiKey: process.env.FIREBASE_API_KEY || "", email: process.env.FIREBASE_EMAIL, password: process.env.FIREBASE_PASSWORD });

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const responder = (texto, teclado) => enviar(texto, teclado);

// Los datos se leen una sola vez por pasada, y solo si algún comando los pide
let cache = null;
async function datos() {
  if (!cache) {
    const W = cargarDatosApp();
    const nube = await leerNube(db);
    cache = { W, nube, pan: panorama(W, nube) };
  }
  return cache;
}
let inventario = null;
async function inv() {
  if (!inventario) inventario = await db.listar("inventario");
  return inventario;
}

// ---------------------------------------------------------------- menú de "/"
const COMANDOS = [
  { command: "menu", description: "Botones con todo lo que sé hacer" },
  { command: "hoy", description: "Así va el día: novedades, equipos, pendientes" },
  { command: "pendientes", description: "Lo que está abierto (toca ✅ para cerrar)" },
  { command: "parados", description: "Equipos en mantenimiento o montaje" },
  { command: "turno", description: "Quién está de turno" },
  { command: "stock", description: "Existencia de un repuesto en almacén" },
  { command: "pedir", description: "Pedir un repuesto a almacén" },
  { command: "falla", description: "Anotar una falla: /falla equipo: qué pasó" },
  { command: "pendiente", description: "Anotar un pendiente" },
  { command: "tarea", description: "Crear una tarea" },
  { command: "falta", description: "Anotar que hace falta un repuesto" },
  { command: "presupuesto", description: "Cómo va el gasto del año" },
  { command: "reporte", description: "Formulario de reporte de turno" },
  { command: "ayuda", description: "Ver qué puedo hacer" },
];
async function registrarMenu() {
  const actual = await tg("getMyCommands", {});
  const puestos = JSON.stringify((actual.result || []).map((c) => [c.command, c.description]));
  const nuestros = JSON.stringify(COMANDOS.map((c) => [c.command, c.description]));
  if (puestos === nuestros) return false;
  await tg("setMyCommands", { commands: COMANDOS });
  return true;
}

// ------------------------------------------------------------- acciones
async function crearTarea({ titulo, desc, prioridad, quien }) {
  const id = uid("t");
  const ok = await db.guardar("tareas", id, { id, machine: "", machineName: "General / Otra", title: titulo, desc: desc || "", priority: prioridad || "Media", reporter: quien || "", status: "pendiente", createdAt: new Date().toISOString(), steps: [] });
  return ok ? id : null;
}

// Busca repuestos en el inventario: por código exacto o por palabras
async function buscarRepuestos(texto) {
  const items = await inv();
  const q = plano(texto);
  const exacto = items.find((a) => plano(a.cod) === q.replace(/\s+/g, ""));
  if (exacto) return [exacto];
  const toks = q.split(" ").filter((t) => t.length > 1);
  if (!toks.length) return [];
  return items.filter((a) => { const h = plano(`${a.cod} ${a.desc} ${a.ub}`); return toks.every((t) => h.includes(t)); })
    .sort((a, b) => (Number(b.exist) > 0) - (Number(a.exist) > 0) || String(a.desc).localeCompare(String(b.desc)))
    .slice(0, 8);
}
const lineaRepuesto = (a) => `<code>${esc(a.cod)}</code> ${esc(a.desc || "")} — <b>${Number(a.exist) > 0 ? esc(a.exist) : "0"}</b> ${esc(a.um || "")}${a.ub ? " · " + esc(a.ub) : ""}${Number(a.min) > 0 && Number(a.exist) < Number(a.min) ? " ⚠️ bajo el mínimo" : ""}`;

async function crearPedido({ lineas, destino, quien, nota }) {
  const id = uid("s");
  const ok = await db.guardar("solicitudes", id, {
    id, tipo: "consumo", estado: "pedido", origen: "telegram", fecha: hoyCO(), destino: destino || "", solicitadoPor: quien || "", por: quien || "",
    lineas: lineas.map((l) => ({ cod: String(l.cod || ""), desc: l.desc || "", cant: Number(l.cant) || 1, um: l.um || "" })), nota: nota || "", createdAt: new Date().toISOString(),
  });
  return ok ? id : null;
}

// "/pedir 6204 x2 para Blister 3" -> { texto, cant, destino }
function leerPedido(txt) {
  let t = String(txt || "").trim();
  let destino = "";
  const para = t.match(/\s+para\s+(.+)$/i);
  if (para) { destino = para[1].trim(); t = t.slice(0, para.index).trim(); }
  let cant = 1;
  const c = t.match(/(?:^|\s)(?:x\s*)?(\d+(?:[.,]\d+)?)\s*(?:u|und|unidades)?$/i);
  if (c && t.slice(0, c.index).trim()) { cant = Number(c[1].replace(",", ".")); t = t.slice(0, c.index).trim(); }
  return { texto: t, cant, destino };
}

// Equipo del catálogo del registro que más se parece a lo escrito
function buscarEquipo(W, texto) {
  const cat = (W.MTTO && W.MTTO.catalogo.equipos) || [];
  const q = plano(texto).replace(/#/g, " ");
  const toks = q.split(/\s+/).filter(Boolean);
  let mejor = null, puntos = 0;
  for (const e of cat) {
    const h = plano(e.eq).replace(/#/g, " ");
    const p = toks.filter((t) => (/^\d+$/.test(t) ? h.split(/\s+/).includes(t) : h.includes(t))).length;
    if (p > puntos) { puntos = p; mejor = e; }
  }
  return puntos ? mejor : null;
}

// ---------------------------------------------------------------- botones
async function atenderBoton(cb) {
  const data = String(cb.data || "");
  const quien = cb.from?.first_name || "alguien";
  const aviso = async (txt) => tg("answerCallbackQuery", { callback_query_id: cb.id, text: txt });
  const quitarBotones = async () => { if (cb.message) await tg("editMessageReplyMarkup", { chat_id: cb.message.chat.id, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } }); };

  // Recordatorios de tareas (formato viejo "accion:id")
  const [accion, id] = data.split(":");
  if (["d", "p1", "p7", "m"].includes(accion) && id) {
    let txt = "";
    if (accion === "d") { await db.actualizar("tareas", id, { status: "hecha", doneAt: new Date().toISOString() }); txt = "Marcada como hecha"; }
    else if (accion === "p1" || accion === "p7") { const dias = accion === "p1" ? 1 : 7; await db.actualizar("tareas", id, { remindNextAt: new Date(Date.now() + dias * 864e5).toISOString() }); txt = dias === 1 ? "Pospuesta un día" : "Pospuesta una semana"; }
    else { await db.actualizar("tareas", id, { remindFreq: "", remindNextAt: "" }); txt = "Aviso retirado"; }
    await aviso(txt);
    await quitarBotones();
    await responder(`✔️ ${esc(txt)} · <i>${esc(quien)}</i>`);
    return;
  }

  const [tipo, ...resto] = data.split("|");
  const arg = resto.join("|");

  if (tipo === "m") {
    await aviso("");
    const { W, pan } = await datos();
    if (arg === "hoy") await responder(msgHoy(pan), botonesApp());
    else if (arg === "pend") { const m = msgPendientes(pan); await responder(m.texto, m.teclado); }
    else if (arg === "parados") await responder(msgParados(pan));
    else if (arg === "turno") await responder(msgTurno(W, pan));
    else if (arg === "pres") await responder(msgPresupuesto(pan));
    else if (arg === "pedir") await responder("📦 <b>Para pedir un repuesto</b>\n\nEscribe:\n<code>/pedir rodamiento 6204 x2 para Blister 3</code>\no con el código:\n<code>/pedir 741901076 2</code>\n\nSi hay varias piezas parecidas te muestro botones para elegir. El pedido llega a Almacén en la app, listo para pasar a la solicitud DAD-010A.\n\nPara solo mirar existencias: <code>/stock 6204</code>");
    return;
  }

  // Cerrar un pendiente desde /pendientes
  if (tipo === "pc" && arg) {
    const previo = (await db.obtener("seguimiento", arg)) || { id: arg, origen: arg.split(":")[0] };
    const historial = [...(previo.historial || []), { t: new Date().toISOString(), estado: "cerrado", por: quien, nota: "Cerrado desde Telegram" }].slice(-30);
    const ok = await db.guardar("seguimiento", arg, { ...previo, id: arg, estado: "cerrado", cerradoEn: new Date().toISOString(), historial, updatedAt: new Date().toISOString(), por: quien });
    // Si es una tarea, también se cierra la tarea
    if (ok && arg.startsWith("tar:")) await db.actualizar("tareas", arg.slice(4), { status: "hecha", doneAt: new Date().toISOString() });
    await aviso(ok ? "Resuelto ✅" : "No pude guardarlo");
    if (ok) await responder(`✅ Pendiente resuelto · <i>${esc(quien)}</i>`);
    return;
  }

  // Falla anotada desde Telegram que ya quedó operativa
  if (tipo === "fo" && arg) {
    const ok = await db.actualizar("mtto_registros", arg, { ef: "Operativo", updatedAt: new Date().toISOString() });
    await aviso(ok ? "Marcado operativo" : "No pude guardarlo");
    if (ok) { await quitarBotones(); await responder(`✅ Equipo operativo · <i>${esc(quien)}</i>`); }
    return;
  }

  // Elegir entre varias piezas para /pedir
  if (tipo === "pp" && arg) {
    const [tmp, idx] = arg.split("|");
    const doc = await db.obtener("bot", tmp);
    const op = doc && (doc.opciones || [])[Number(idx)];
    if (!op) { await aviso("Ese pedido ya no está"); return; }
    const pid = await crearPedido({ lineas: [{ ...op, cant: doc.cant }], destino: doc.destino, quien, nota: doc.nota });
    await aviso(pid ? "Pedido anotado" : "No pude guardarlo");
    if (pid) { await quitarBotones(); await responder(`📦 Pedido anotado: <b>${esc(doc.cant)} × ${esc(op.desc || op.cod)}</b>${doc.destino ? ` para ${esc(doc.destino)}` : ""}.\nYa aparece en Almacén → «Pedidos que llegaron por Telegram».`, { inline_keyboard: [[{ text: "Abrir Almacén", url: `${URL_APP}?v=almacen` }]] }); }
  }
}

// --------------------------------------------------------------- comandos
async function atenderComando(msg) {
  const texto = String(msg.text || "").trim();
  const quien = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") || "";
  const m = texto.match(/^\/(\w+)(?:@\w+)?\s*([\s\S]*)$/);
  if (!m) return;
  const comando = m[1].toLowerCase();
  const resto = m[2].trim();

  if (["ayuda", "help"].includes(comando)) return responder(AYUDA, MENU);
  if (["start", "menu", "menú"].includes(comando)) return responder("¿Qué necesitas? 👇", MENU);

  if (comando === "hoy") { const { pan } = await datos(); return responder(msgHoy(pan), botonesApp()); }
  if (comando === "pendientes") { const { pan } = await datos(); const r = msgPendientes(pan, resto); return responder(r.texto, r.teclado); }
  if (comando === "parados") { const { pan } = await datos(); return responder(msgParados(pan)); }
  if (comando === "turno" || comando === "turnos") { const { W, pan } = await datos(); return responder(msgTurno(W, pan)); }
  if (comando === "presupuesto") { const { pan } = await datos(); return responder(msgPresupuesto(pan), { inline_keyboard: [[{ text: "Ver el presupuesto", url: `${URL_APP}?v=presupuesto` }]] }); }
  if (comando === "reporte") return responder("📝 <b>Reporte de turno</b>\nLlénalo aquí: estado de los equipos y novedades. Queda en el Registro diario y lo aviso en el grupo.", { inline_keyboard: [[{ text: "📝 Abrir el formulario", url: `${URL_APP}reporte.html` }]] });

  if (comando === "stock") {
    if (!resto) return responder("Escríbelo así: <code>/stock rodamiento 6204</code> o <code>/stock 741901076</code>");
    const res = await buscarRepuestos(resto);
    if (!res.length) return responder(db.estado.inventario === "denegado" ? "No puedo leer el inventario (revisa las reglas de Firebase)." : `No encontré «${esc(resto)}» en el inventario.`);
    return responder([`📦 <b>Almacén · «${esc(resto)}»</b>`, "", ...res.map(lineaRepuesto), "", "<i>Para pedirlo: /pedir código cantidad para equipo</i>"].join("\n"));
  }

  if (comando === "pedir") {
    if (!resto) return responder("Escríbelo así: <code>/pedir rodamiento 6204 x2 para Blister 3</code>");
    const p = leerPedido(resto);
    const res = await buscarRepuestos(p.texto);
    if (res.length === 1) {
      const a = res[0];
      const id = await crearPedido({ lineas: [{ cod: a.cod, desc: a.desc, cant: p.cant, um: a.um }], destino: p.destino, quien, nota: resto });
      return responder(id ? `📦 Pedido anotado: <b>${esc(p.cant)} × ${esc(a.desc || a.cod)}</b> (<code>${esc(a.cod)}</code>)${p.destino ? ` para ${esc(p.destino)}` : ""}.\nHay ${esc(a.exist ?? "?")} ${esc(a.um || "")}${a.ub ? " en " + esc(a.ub) : ""}. Ya aparece en Almacén.` : "No pude guardar el pedido. Inténtalo otra vez en un momento.", id ? { inline_keyboard: [[{ text: "Abrir Almacén", url: `${URL_APP}?v=almacen` }]] } : undefined);
    }
    if (res.length > 1) {
      const tmp = uid("tmp-");
      const guardado = await db.guardar("bot", tmp, { id: tmp, opciones: res.slice(0, 6).map((a) => ({ cod: a.cod, desc: a.desc || "", um: a.um || "" })), cant: p.cant, destino: p.destino, nota: resto, t: new Date().toISOString() });
      if (!guardado) return responder([`Encontré varias piezas para «${esc(p.texto)}». Pide con el código:`, "", ...res.slice(0, 6).map(lineaRepuesto)].join("\n"));
      return responder([`¿Cuál de estas? (${esc(p.cant)} unidades${p.destino ? " para " + esc(p.destino) : ""})`, "", ...res.slice(0, 6).map((a, i) => `${i + 1}. ${lineaRepuesto(a)}`)].join("\n"), { inline_keyboard: res.slice(0, 6).map((a, i) => [{ text: `${i + 1}. ${String(a.desc || a.cod).slice(0, 40)}`, callback_data: `pp|${tmp}|${i}` }]) });
    }
    // No está en el inventario: se pide igual, con la descripción escrita
    const id = await crearPedido({ lineas: [{ cod: "", desc: p.texto, cant: p.cant }], destino: p.destino, quien, nota: resto });
    return responder(id ? `📦 No encontré «${esc(p.texto)}» en el inventario, pero lo anoté como pedido${p.destino ? ` para ${esc(p.destino)}` : ""}. En Almacén se le pone el código.` : "No pude guardar el pedido.");
  }

  if (comando === "falla") {
    const mm = resto.match(/^(.+?)[:\-–]\s*([\s\S]+)$/);
    if (!mm) return responder("Escríbelo así: <code>/falla Blister 3: se pega el PVC en el formado</code>");
    const { W } = await datos();
    const eq = buscarEquipo(W, mm[1]);
    const t = turnoEnCurso();
    const id = uid("T");
    const ahora = new Date();
    const hr = new Date(ahora.getTime() - 5 * 3600e3).toISOString().slice(11, 16);
    const ok = await db.guardar("mtto_registros", id, {
      id, f: t.fecha, t: t.turno, s: eq ? eq.s : "Sede 4", eq: eq ? eq.eq : mm[1].trim(), ar: eq ? eq.ar : "", cat: "Máquina", tp: "Correctivo", fa: "Sin clasificar",
      de: mm[2].trim(), ac: "", hi: hr, hr, min: null, det: null, ef: "Pendiente", frep: /repuesto|falta/i.test(mm[2]) ? 1 : 0, tec: quien, por: quien, src: "telegram",
      createdAt: ahora.toISOString(), updatedAt: ahora.toISOString(),
    });
    return responder(ok ? `🛠 Falla anotada en el Registro diario: <b>${esc(eq ? eq.eq : mm[1].trim())}</b>${eq ? ` (${esc(eq.s)})` : ""} — ${esc(mm[2].trim())}\nQueda como pendiente hasta que alguien la cierre.` : "No pude guardarla (revisa las reglas de Firebase).", ok ? { inline_keyboard: [[{ text: "✅ Ya quedó operativo", callback_data: `fo|${id}` }], [{ text: "Abrir el Registro", url: `${URL_APP}?v=registro&fecha=${t.fecha}` }]] } : undefined);
  }

  if (comando === "pendiente") {
    if (!resto) return responder("Escríbelo así: <code>/pendiente Cambiar correa de la Marzio 1</code>");
    const { W } = await datos();
    const eq = buscarEquipo(W, resto);
    const id = uid("p");
    const ok = await db.guardar("seguimiento", id, { id, origen: "manual", titulo: resto, eq: eq ? eq.eq : "", sede: eq ? eq.s : "", prioridad: "media", estado: "abierto", fecha: hoyCO(), creadoPor: quien, por: quien, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), historial: [{ t: new Date().toISOString(), estado: "abierto", por: quien, nota: "Anotado desde Telegram" }] });
    return responder(ok ? `📋 Pendiente anotado: <b>${esc(resto)}</b>${eq ? ` · ${esc(eq.eq)}` : ""}` : "No pude guardarlo (revisa las reglas de Firebase).");
  }

  if (comando === "tarea" || comando === "falta") {
    if (!resto) return responder(comando === "tarea" ? "Escríbelo así: <code>/tarea Cambiar rodamiento de la estación 3</code>" : "Escríbelo así: <code>/falta 741203262 correa dentada de la Bosch</code>");
    const esFalta = comando === "falta";
    const id = await crearTarea({ titulo: esFalta ? `Falta pieza: ${resto}` : resto, desc: `Anotado desde Telegram${quien ? " por " + quien : ""}.`, prioridad: esFalta ? "Alta" : "Media", quien });
    return responder(id ? `✔️ ${esFalta ? "Anotado el faltante" : "Tarea creada"}: <b>${esc(resto)}</b>\nYa aparece en Tareas y en Pendientes.` : "No pude guardarlo. Inténtalo otra vez en un momento.");
  }
}

// ---------------------------------------------------------------- principal
async function main() {
  if (!configurado()) { console.log("Sin TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID. Nada que atender."); return; }
  if (await registrarMenu()) console.log("Menú de comandos actualizado en Telegram.");

  const filtro = encodeURIComponent(JSON.stringify(["message", "callback_query"]));
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?timeout=0&limit=100&allowed_updates=${filtro}`);
  const j = await r.json();
  if (!j.ok) { console.error("getUpdates:", JSON.stringify(j)); return; }

  const updates = j.result || [];
  let ultimo = 0;
  let atendidos = 0;
  for (const u of updates) {
    ultimo = Math.max(ultimo, u.update_id);
    try {
      if (u.callback_query) {
        // Solo se obedece en el grupo configurado; lo de fuera se ignora
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
  if (ultimo) await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?timeout=0&limit=1&offset=${ultimo + 1}`);
  console.log(`Mensajes recibidos: ${updates.length}. Atendidos: ${atendidos}. Colecciones: ${JSON.stringify(db.estado)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
