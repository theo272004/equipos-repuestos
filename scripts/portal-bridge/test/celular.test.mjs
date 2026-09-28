// Recorre todas las vistas con la pantalla de un celular (390 y 360 px de
// ancho, táctil) y comprueba lo que hace usable la app en planta:
//   1. Nada más ancho que la pantalla (si algo empuja, el celular aleja toda
//      la página y se lee en miniatura).
//   2. Ningún campo de texto con letra de menos de 16 px (el iPhone agranda la
//      página al tocarlo).
//   3. Los botones de uso frecuente miden al menos 40 px de alto.
//   4. Las tablas de repuestos (ficha) y de resultados (Almacén) se ven como
//      tarjetas, con el nombre de la pieza a la vista.
//
//   cd /ruta/al/repo && python3 -m http.server 8777 &
//   node test/celular.test.mjs
import { chromium } from "playwright";

const BASE = (process.env.APP_URL || "http://localhost:8777/index.html").replace(/index\.html$/, "");
const VISTAS = [
  ["Inicio", "index.html?v=hoy"], ["Pendientes", "index.html?v=pendientes"], ["Registro diario", "index.html?v=registro"],
  ["Reportes", "index.html?v=reportes"], ["Tareas", "index.html?v=tareas"], ["Inspecciones", "index.html?v=inspecciones"],
  ["Turnos", "index.html?v=turnos"], ["Equipos", "index.html?v=equipos"], ["Plan", "index.html?v=plan"],
  ["Almacén", "index.html?v=almacen&q=rodamiento%206204"], ["Presupuesto", "index.html?v=presupuesto"],
  ["Indicadores", "index.html?v=indicadores"], ["Diario", "index.html?v=diario"], ["Ajustes", "index.html?v=ajustes"],
  ["Ficha del equipo", "index.html?v=equipo&id=gkf2600"], ["Formulario de turno", "reporte.html"],
];
// Botones que se tocan a diario: al menos 40 px de alto en pantalla táctil
const TOCABLES = ".ux-btn--sm, .ux-chip, .ux-seg button, .alm-chip, .pl-reg, .spf-rapido, .mx-seg button, .tn-seg button, .alm-stepper button, .sp-sug";

const fallos = [];
const ok = (c, m) => { if (!c) fallos.push(m); };
const nav = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});

for (const ancho of [390, 360]) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/gstatic|googleapis|firebase/, (r) => r.abort());
  const pg = await ctx.newPage();
  const errores = [];
  pg.on("pageerror", (e) => errores.push(e.message));
  await pg.goto(BASE + "index.html", { waitUntil: "load" });
  await pg.evaluate(() => { localStorage.clear(); localStorage.setItem("equipos-usuario", "Prueba"); });

  for (const [nombre, url] of VISTAS) {
    await pg.goto(BASE + url, { waitUntil: "load" });
    await pg.waitForTimeout(700);
    if (nombre === "Ficha del equipo") {
      await pg.click('[data-profile-tab="spares"]');
      await pg.waitForSelector(".sp-sug", { timeout: 10000 }).catch(() => {});
    }
    if (nombre === "Almacén") {
      await pg.waitForFunction(() => window.MAESTRO && window.MAESTRO.listo, null, { timeout: 15000 });
      await pg.click('.alm-table button[data-alm="agregar"] >> nth=0');
    }
    const r = await pg.evaluate(({ ancho, TOCABLES }) => {
      const visible = (e) => { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
      const nombre = (e) => `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${[...e.classList].slice(0, 2).map((c) => "." + c).join("")}`;
      const sale = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > ancho + 1; };
      const culpables = [...document.querySelectorAll("body *")]
        .filter((e) => !e.closest("#sideNav") && visible(e) && sale(e) && ![...e.children].some(sale))
        .filter((e) => { for (let q = e.parentElement; q; q = q.parentElement) { if (getComputedStyle(q).overflowX !== "visible" && q.getBoundingClientRect().right <= ancho + 1) return false; } return true; })
        .slice(0, 3).map(nombre);
      const campos = [...document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]), select, textarea")]
        .filter(visible).filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16).slice(0, 3).map(nombre);
      const chicos = [...document.querySelectorAll(TOCABLES)].filter(visible)
        .filter((e) => e.getBoundingClientRect().height < 39.5).slice(0, 3).map((e) => `${nombre(e)} (${Math.round(e.getBoundingClientRect().height)} px)`);
      return { ancho: document.documentElement.scrollWidth, culpables, campos, chicos };
    }, { ancho, TOCABLES });
    const donde = `${nombre} a ${ancho} px`;
    ok(r.ancho <= ancho, `${donde}: la página mide ${r.ancho} px, se sale de la pantalla (${r.culpables.join(", ") || "?"})`);
    ok(!r.campos.length, `${donde}: campos con letra de menos de 16 px (el iPhone hace zoom): ${r.campos.join(", ")}`);
    ok(!r.chicos.length, `${donde}: botones de menos de 40 px: ${r.chicos.join(", ")}`);

    if (nombre === "Ficha del equipo") {
      const tarjeta = await pg.evaluate(() => {
        const fila = document.querySelector(".sp-table tr.sp-row");
        const nombreP = fila && fila.querySelector(".sp-name");
        return fila ? { display: getComputedStyle(fila).display, visible: nombreP ? nombreP.getBoundingClientRect().right <= innerWidth : false } : null;
      });
      ok(tarjeta && tarjeta.display === "grid" && tarjeta.visible, `${donde}: los repuestos no salen como tarjetas con el nombre a la vista`);
    }
    if (nombre === "Almacén") {
      const t = await pg.evaluate(() => { const f = document.querySelector(".alm-table tbody tr"); return f ? getComputedStyle(f).display : ""; });
      ok(t === "grid", `${donde}: los resultados no salen como tarjetas`);
      ok(await pg.locator("#almSolicitud .alm-linea").count() === 1, `${donde}: "Pedir" no sumo la pieza a la solicitud`);
      ok(await pg.locator("#almIrSol:not([hidden])").count() === 1, `${donde}: no aparece el boton flotante que lleva a la solicitud`);
    }
  }
  ok(!errores.length, `errores en la consola a ${ancho} px: ${errores.join(" | ")}`);
  await ctx.close();
}

await nav.close();
console.log(fallos.length ? "FALLOS:\n- " + fallos.join("\n- ") : `Todo correcto en celular (${VISTAS.length} vistas a 390 y 360 px).`);
process.exit(fallos.length ? 1 : 0);
