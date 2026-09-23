// Ordenes de trabajo e indicadores, en un navegador de verdad y con una nube
// simulada (un Firestore falso en memoria, inyectado antes de que cargue la app):
//   1. Dos tecnicos a la vez: guardar una OT no pisa lo que otro guardo.
//   2. Abrir una correctiva con el equipo detenido, verla parada, cerrarla con
//      falla, causa, codigo de causa y repuestos.
//   3. Los repuestos quedan en el historial de cambios del plan, y al editar el
//      cierre no se duplican.
//   4. Indicadores: horas detenido, MTTR, causas, repuestos.
//   5. Diario, "Pedir repuestos" hacia Almacen, cierre desde Telegram, celular.
//
//   cd /ruta/al/repo && python3 -m http.server 8777 &
//   node test/ot.test.mjs
import { chromium } from "playwright";

const URL_APP = process.env.APP_URL || "http://localhost:8777/index.html";
const fallos = [];
const ok = (c, m) => { if (!c) fallos.push(m); };

// ---------------------------------------------------------------- nube falsa
const NUBE_FALSA = () => {
  const store = {};
  const oyentes = {};        // coleccion -> [cb]
  const oyentesDoc = {};     // "col/id" -> [cb]
  window.__store = store;
  window.__escrituras = [];
  const copia = (x) => JSON.parse(JSON.stringify(x));
  const snap = (col) => {
    const docs = Object.entries(store[col] || {}).map(([id, d]) => ({ id, exists: true, data: () => copia(d) }));
    return { forEach: (f) => docs.forEach(f), docs, metadata: { fromCache: false } };
  };
  const avisar = (col) => {
    setTimeout(() => {
      (oyentes[col] || []).forEach((cb) => cb(snap(col)));
      Object.entries(oyentesDoc).forEach(([k, cbs]) => { const [c, id] = k.split("/"); if (c === col) cbs.forEach((cb) => cb({ exists: !!(store[c] || {})[id], data: () => copia(store[c][id]) })); });
    }, 0);
  };
  const escribir = (col, id, d) => { (store[col] = store[col] || {})[id] = copia(d); window.__escrituras.push({ op: "set", col, id }); };
  const borrar = (col, id) => { if (store[col]) delete store[col][id]; window.__escrituras.push({ op: "del", col, id }); };
  // Otro tecnico escribe en la nube y esta pestana TODAVIA no se entero.
  window.__escribirSinAvisar = (col, id, d) => { (store[col] = store[col] || {})[id] = copia(d); };
  window.__escribirYAvisar = (col, id, d) => { (store[col] = store[col] || {})[id] = copia(d); avisar(col); };
  window.__sembrar = (col, docs) => { store[col] = store[col] || {}; docs.forEach((d) => (store[col][d.id] = copia(d))); };
  const db = {
    collection(col) {
      return {
        doc(id) {
          return {
            _col: col, _id: id,
            set(d) { escribir(col, id, d); avisar(col); return Promise.resolve(); },
            delete() { borrar(col, id); avisar(col); return Promise.resolve(); },
            onSnapshot(cb) { const k = `${col}/${id}`; (oyentesDoc[k] = oyentesDoc[k] || []).push(cb); setTimeout(() => cb({ exists: !!(store[col] || {})[id], data: () => copia(store[col][id]) }), 0); return () => {}; },
          };
        },
        onSnapshot(a, b) { const cb = typeof a === "function" ? a : b; (oyentes[col] = oyentes[col] || []).push(cb); setTimeout(() => cb(snap(col)), 0); return () => {}; },
      };
    },
    batch() {
      const ops = [];
      return {
        set(ref, d) { ops.push(["set", ref, d]); },
        delete(ref) { ops.push(["del", ref]); },
        commit() {
          const cols = new Set();
          ops.forEach(([op, ref, d]) => { cols.add(ref._col); op === "set" ? escribir(ref._col, ref._id, d) : borrar(ref._col, ref._id); });
          cols.forEach(avisar);
          return Promise.resolve();
        },
      };
    },
  };
  window.firebase = { initializeApp() {}, firestore() { return db; } };
};

const nav = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.route(/gstatic|googleapis|cdnjs/, (r) => r.abort());
await ctx.addInitScript(NUBE_FALSA);
const pg = await ctx.newPage();
const errores = [];
pg.on("pageerror", (e) => errores.push(e.message));
pg.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_/.test(m.text())) errores.push(m.text()); });
pg.on("dialog", (d) => d.accept());

await pg.goto(URL_APP, { waitUntil: "domcontentloaded" });
await pg.evaluate(() => { localStorage.clear(); });
// Una tarea que ya estaba en la nube, de otro tecnico. Se siembra antes de
// que la app se suscriba.
await pg.addInitScript(() => {
  const sembrar = () => window.__sembrar && window.__sembrar("tareas", [{ id: "tAjena", title: "Revisar compresor", status: "pendiente", priority: "Media", machine: "", machineName: "General / Otra", createdAt: "2026-09-01T12:00:00.000Z", steps: [] }]);
  sembrar();
});
await pg.reload({ waitUntil: "load" });
await pg.waitForFunction(() => window.CLOUD && window.CLOUD.enabled);
await pg.click("[data-nav-tasks]");
await pg.waitForFunction(() => document.getElementById("tkList")?.textContent.includes("Revisar compresor"));

// Maquina con plan: la Blisteadora #2
const maquina = await pg.evaluate(() => machines.find((m) => equipoDeMachine(m)?.c === "17332002")?.id);
ok(!!maquina, "no encontre la ficha de la Blisteadora #2");
const piezaPlan = await pg.evaluate(() => EQUIPOS_PLAN.equipos.find((e) => e.c === "17332002").r.find((r) => r.cod && /^\d{9}$/.test(r.cod)).cod);

// ---------------------------------------------------------------- 1. dos tecnicos
await pg.evaluate(() => { window.__escribirSinAvisar("tareas", "tAjena", { id: "tAjena", title: "Revisar compresor", status: "hecha", doneAt: "2026-09-23T10:00:00.000Z", priority: "Media", machine: "", machineName: "General / Otra", createdAt: "2026-09-01T12:00:00.000Z", steps: [] }); window.__escrituras.length = 0; });

// ---------------------------------------------------------------- 2. abrir una correctiva con parada
const haceDosHoras = await pg.evaluate(() => { const d = new Date(Date.now() - 2 * 3600000); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; });
await pg.click("#tkFab");
await pg.selectOption("#tkTipo", "correctiva");
await pg.selectOption("#tkMachineSel", maquina);
await pg.fill('#tkForm input[name="title"]', "Atasco en estacion de sellado");
await pg.fill('#tkForm textarea[name="desc"]', "La banda se detiene y salta la alarma de temperatura");
await pg.fill('#tkForm input[name="reporter"]', "OPERARIO");
await pg.check("#tkParo");
ok(await pg.isVisible("#tkParoInicio"), "al marcar 'detenido' no aparecio la hora de parada");
await pg.fill("#tkParoInicio", haceDosHoras);
await pg.click('#tkForm button[type="submit"]');
await pg.waitForTimeout(150);

const escr = await pg.evaluate(() => window.__escrituras.filter((e) => e.col === "tareas"));
ok(escr.length === 1 && escr[0].id !== "tAjena", `al guardar la OT se escribieron ${escr.length} tareas: ${escr.map((e) => e.id).join(", ")} (solo debia ser la nueva)`);
ok(await pg.evaluate(() => window.__store.tareas.tAjena.status) === "hecha", "se piso la tarea que otro tecnico acababa de cerrar");

const otId = await pg.evaluate(() => Object.values(window.__store.tareas).find((t) => t.title === "Atasco en estacion de sellado")?.id);
const ot = await pg.evaluate((id) => window.__store.tareas[id], otId);
ok(ot && ot.tipo === "correctiva" && ot.paro && ot.paroInicio === haceDosHoras && /^OT-\d{6}-[A-Z0-9]{3}$/.test(ot.numero), `la OT no quedo bien en la nube: ${JSON.stringify(ot)}`);
ok(ot && ot.status === "en-progreso", "una OT con el equipo detenido deberia arrancar en curso");
await pg.waitForFunction(() => document.querySelector(".tk-card.is-parado"));
const franja = await pg.textContent(".tk-card.is-parado .ot-paro-strip");
ok(/Equipo detenido/.test(franja) && /lleva 2 h/.test(franja), `la tarjeta no dice cuanto lleva parado: ${franja}`);
ok(/1\s*equipo detenido/.test(await pg.textContent("#counterRow")), "el contador no muestra el equipo detenido");
const primera = await pg.$eval("#tkList .tk-card", (c) => c.classList.contains("is-parado"));
ok(primera, "la OT con equipo detenido no sale la primera");

// La portada lo dice antes que nada.
await pg.evaluate(() => goHome());
await pg.waitForTimeout(100);
ok(/1 equipo detenido/.test(await pg.textContent(".hd-detenidos").catch(() => "")), "la portada no avisa del equipo detenido");
await pg.click("[data-nav-tasks]");

// ---------------------------------------------------------------- 3. cerrarla
await pg.click(".tk-card.is-parado >> text=Cerrar la orden");
await pg.waitForSelector("#otCierre:not([hidden])");
ok(/Parada de 2 h/.test(await pg.textContent("#otDur")), `el panel no calcula la parada: ${await pg.textContent("#otDur")}`);
ok(await pg.$eval('#otCierreForm textarea[name="falla"]', (t) => t.value) === "La banda se detiene y salta la alarma de temperatura", "la falla no viene prellenada con la descripcion");
await pg.selectOption('#otCierreForm select[name="causaTipo"]', "Desgaste normal");
await pg.fill('#otCierreForm input[name="causaRaiz"]', "Rodamiento del rodillo de sellado gastado");
await pg.fill('#otCierreForm textarea[name="trabajo"]', "Se cambio el rodamiento y se ajusto la tension de la banda");
await pg.fill('#otCierreForm input[name="tecnicos"]', "J. PEREZ");
await pg.fill('#otCierreForm input[name="hh"]', "1.5");
await pg.fill("#otCcosto", "e8");
await pg.dispatchEvent("#otCcosto", "input");
ok(/DIRECCI/.test(await pg.textContent("#otCcostoDesc")), `el codigo de causa E8 no muestra su descripcion: ${await pg.textContent("#otCcostoDesc")}`);
ok(await pg.$$eval("#otCausasLista option", (o) => o.length) > 300, "no estan los codigos de causa oficiales para elegir");
await pg.fill("#otRepCod", piezaPlan);
await pg.fill("#otRepQ", "2");
await pg.click("#otCierre >> text=Agregar");
ok(/× 2/.test(await pg.textContent("#otRepUl")), "no se agrego el repuesto");
await pg.evaluate(() => { window.__escrituras.length = 0; });
await pg.click('#otCierreForm button[type="submit"]');
await pg.waitForSelector("#otCierre", { state: "hidden" });
await pg.waitForTimeout(150);

const cerrada = await pg.evaluate((id) => window.__store.tareas[id], otId);
ok(cerrada.status === "hecha" && cerrada.doneAt && cerrada.paroFin, "la OT no quedo cerrada con su fin de parada");
ok(cerrada.cierre && cerrada.cierre.causaTipo === "Desgaste normal" && cerrada.cierre.ccosto === "E8" && cerrada.cierre.hh === 1.5, `el cierre no guardo bien: ${JSON.stringify(cerrada.cierre)}`);
const cambiosOT = await pg.evaluate((id) => Object.values(window.__store.cambios || {}).filter((c) => c.ot === id), otId);
ok(cambiosOT.length === 1 && cambiosOT[0].cod === piezaPlan && cambiosOT[0].q === 2 && cambiosOT[0].eq === "17332002", `el repuesto no quedo en el historial de cambios del plan: ${JSON.stringify(cambiosOT)}`);
ok(/Desgaste normal/.test(await pg.textContent("#tkList")), "la tarjeta cerrada no muestra la causa");

// Editar el cierre: cambiar el repuesto no debe dejar el viejo en el historial
await pg.click(`#tkList .tk-card:has-text("Atasco en estacion") >> text=Editar el cierre`);
await pg.waitForSelector("#otCierre:not([hidden])");
await pg.click("#otRepUl .alm-x");
await pg.fill("#otRepCod", "999000111");
await pg.click("#otCierre >> text=Agregar");
await pg.click('#otCierreForm button[type="submit"]');
await pg.waitForTimeout(150);
const cambiosOT2 = await pg.evaluate((id) => Object.values(window.__store.cambios || {}).filter((c) => c.ot === id).map((c) => c.cod), otId);
ok(JSON.stringify(cambiosOT2) === JSON.stringify(["999000111"]), `al editar el cierre el historial quedo: ${JSON.stringify(cambiosOT2)}`);

// ---------------------------------------------------------------- 4. indicadores
await pg.click('[data-nav-view="indicadores"]');
await pg.waitForSelector(".kpi-row");
const k = await pg.evaluate(() => { const r = window.kpiCalcular(); return { fallas: r.fallas, h: r.hDetenido, mttr: r.mttr, hh: r.hh, causas: r.causas, rep: r.repuestos.map((x) => x.cod), eq: r.equipos[0]?.nombre, disp: r.equipos[0]?.disp }; });
ok(k.fallas === 1, `fallas = ${k.fallas}, esperaba 1`);
ok(Math.abs(k.h - 2) < 0.05 && Math.abs(k.mttr - 2) < 0.05, `horas detenido/MTTR = ${k.h}/${k.mttr}, esperaba 2/2`);
ok(k.hh === 1.5, `horas-hombre = ${k.hh}`);
ok(k.causas.length === 1 && k.causas[0][0] === "Desgaste normal", `causas: ${JSON.stringify(k.causas)}`);
ok(k.rep.includes("999000111"), "el repuesto no aparece entre los mas usados");
ok(/Blisteadora/.test(k.eq || ""), `el equipo con mas parada no es la Blisteadora: ${k.eq}`);
ok(k.disp < 1 && k.disp > 0.99, `disponibilidad fuera de rango: ${k.disp}`);
ok(/^2/.test((await pg.textContent(".kpi-tile--hero .kpi-tile__n")).trim()), "la cifra destacada no muestra las 2 horas");
await pg.fill("#kpiHoras", "16"); await pg.dispatchEvent("#kpiHoras", "change");
const disp16 = await pg.evaluate(() => window.kpiCalcular().equipos[0].disp);
ok(disp16 < k.disp, "con menos horas de operacion la disponibilidad deberia bajar");
await pg.screenshot({ path: "salida/indicadores.png", fullPage: true });

// ---------------------------------------------------------------- 5. diario, almacen, telegram
await pg.click('[data-nav-view="diario"]');
await pg.waitForSelector(".dy-mes");
const dia = await pg.textContent("#dyDetalle");
ok(/OT correctiva OT-\d{6}-\w{3} cerrada/.test(dia) && /parada de 2 h/.test(dia), `el Diario no muestra la OT cerrada con su parada`);

await pg.click("[data-nav-tasks]");
await pg.click("#tkFab");
await pg.selectOption("#tkTipo", "preventiva");
await pg.selectOption("#tkMachineSel", maquina);
await pg.fill('#tkForm input[name="title"]', "Lubricacion mensual");
await pg.click('#tkForm button[type="submit"]');
await pg.click(`#tkList .tk-card:has-text("Lubricacion mensual") >> text=Pedir repuestos`);
await pg.waitForSelector("#almacenView.is-active");
ok(/Para la orden/.test(await pg.textContent("#almSolicitud")), "Almacen no dice para que orden es la solicitud");
ok(/Blisteadora/i.test(await pg.$eval('[data-alm-campo="destino"]', (i) => i.value)), "el destino no quedo con el equipo de la orden");

// Telegram cierra una OT sin detalle
const prevId = await pg.evaluate(() => Object.values(window.__store.tareas).find((t) => t.title === "Lubricacion mensual").id);
await pg.evaluate((id) => { const t = { ...window.__store.tareas[id], status: "hecha", doneAt: new Date().toISOString() }; window.__escribirYAvisar("tareas", id, t); }, prevId);
await pg.click("[data-nav-tasks]");
await pg.waitForFunction(() => document.getElementById("tkList").textContent.includes("sin anotar el trabajo"));
ok(await pg.locator(`#tkList .tk-card:has-text("Lubricacion mensual") >> text=Completar el cierre`).count() === 1, "una OT cerrada desde Telegram no ofrece completar el cierre");

// ---------------------------------------------------------------- celular
await pg.setViewportSize({ width: 390, height: 844 });
ok(await pg.evaluate(() => document.documentElement.scrollWidth) <= 390, "Ordenes se sale de la pantalla del celular");
await pg.evaluate(() => window.goIndicadores());
ok(await pg.evaluate(() => document.documentElement.scrollWidth) <= 390, "Indicadores se sale de la pantalla del celular");
await pg.evaluate(() => window.goTasks ? window.goTasks() : document.querySelector("[data-nav-tasks]").click());
await pg.click(`#tkList .tk-card:has-text("Lubricacion mensual") >> text=Completar el cierre`);
ok(await pg.evaluate(() => document.documentElement.scrollWidth) <= 390, "el panel de cierre se sale de la pantalla del celular");
await pg.screenshot({ path: "salida/cierre-cel.png" });

ok(!errores.length, "errores en la consola: " + errores.join(" | "));
await nav.close();
console.log(fallos.length ? "FALLOS:\n- " + fallos.join("\n- ") : "Todo correcto (ordenes de trabajo e indicadores).");
process.exit(fallos.length ? 1 : 0);
