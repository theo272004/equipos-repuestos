// Comprueba, en un navegador de verdad, que la app muestra el inventario del
// portal y respeta el orden de mando (mano > portal > excel).
// No toca el portal ni Firestore: simula lo que dejaria el puente escribiendo
// directamente en el localStorage que lee assets/js/inventario.js.
//
//   cd /ruta/al/repo && python3 -m http.server 8777 &
//   node test/ui.test.mjs
//
// CHROME_PATH permite apuntar a un Chromium ya instalado en vez del de Playwright.

import { chromium } from "playwright";

const COD = "724001008";      // pieza del plan que el Excel da por 0
const errores = [];
const nav = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
const ctx = await nav.newContext({ viewport: { width: 1500, height: 1000 } });
const pg = await ctx.newPage();
pg.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
pg.on("pageerror", (e) => errores.push("PAGEERROR: " + e.message));

// 1) Carga limpia, sin inventario del portal.
await pg.goto("http://localhost:8777/index.html", { waitUntil: "networkidle" });
await pg.waitForTimeout(1500);

const sinPortal = await pg.evaluate(() => ({
  hayInventario: typeof window.INVENTARIO === "object",
  frescura: window.INVENTARIO?.frescura(),
  existencia: window.existenciaEfectiva?.(
    window.EQUIPOS_PLAN.equipos.find((e) => e.c === "17332002"),
    window.EQUIPOS_PLAN.equipos.find((e) => e.c === "17332002").r.find((r) => r.cod === "724001008")
  ),
}));
console.log("SIN PORTAL:", JSON.stringify(sinPortal));

// 2) Simula lo que dejaria el puente: 7 unidades en almacen, de hoy.
await pg.evaluate(([cod]) => {
  localStorage.setItem("equipos-inventario-v1", JSON.stringify({
    porCodigo: { [cod]: { cod, desc: "ARANDELA DE PRESION", exist: 7, ub: "R07/M0301", pu: 12500, alm: "ALM01", actualizado: new Date().toISOString() } },
    estado: { actualizado: new Date().toISOString(), articulos: 1, conectado: false, error: "" },
  }));
}, [COD]);
await pg.reload({ waitUntil: "networkidle" });
await pg.waitForTimeout(1500);

const conPortal = await pg.evaluate(() => ({
  frescura: window.INVENTARIO.frescura(),
  existencia: window.existenciaEfectiva(
    window.EQUIPOS_PLAN.equipos.find((e) => e.c === "17332002"),
    window.EQUIPOS_PLAN.equipos.find((e) => e.c === "17332002").r.find((r) => r.cod === "724001008")
  ),
}));
console.log("CON PORTAL:", JSON.stringify(conPortal));

// 3) La vista del plan tiene que pintarse y mostrar el aviso de frescura.
await pg.evaluate(() => { window.setView("plan"); window.renderPlan(); });
await pg.waitForTimeout(800);
const aviso = await pg.locator(".pl-inv").first().textContent().catch(() => null);
console.log("AVISO EN PANTALLA:", JSON.stringify(aviso));
await pg.screenshot({ path: new URL("../salida/plan.png", import.meta.url).pathname });

// 4) La ficha del equipo: la casilla de existencia con su marca de procedencia.
const marcas = await pg.evaluate(() => {
  const m = machines.find((x) => x.id === "eq-17332002");
  if (!m) return { error: "no encontre la maquina" };
  const html = window.renderSparesPanel(m);
  const cont = document.createElement("div");
  cont.innerHTML = html;
  document.body.appendChild(cont);
  const out = {};
  cont.querySelectorAll(".pl-exist-src").forEach((s) => { out[s.textContent] = (out[s.textContent] || 0) + 1; });
  // el valor del portal debe salir de fondo en el placeholder de esa pieza
  // el codigo va en el value de un input, no en el texto de la fila
  const fila = [...cont.querySelectorAll("tr")].find((tr) => [...tr.querySelectorAll("input")].some((i) => i.getAttribute("value") === "724001008"));
  out._placeholderDeLaPieza = fila?.querySelector(".pl-edit--num")?.getAttribute("placeholder");
  out._marcaDeLaPieza = fila?.querySelector(".pl-exist-src")?.textContent;
  return out;
});
console.log("MARCAS DE PROCEDENCIA:", JSON.stringify(marcas));

// 5) Lo contado a mano tiene que ganarle al portal. Es la propiedad critica:
//     si el puente pudiera pisar una correccion de planta, el tecnico que conto
//     las piezas en el estante perderia su trabajo en la siguiente pasada.
const manoGana = await pg.evaluate(() => {
  const eq = window.EQUIPOS_PLAN.equipos.find((e) => e.c === "17332002");
  const r = eq.r.find((x) => x.cod === "724001008");
  window.guardarDato(window.datoClave(eq, r), "exist", "2");
  return window.existenciaEfectiva(eq, r);
});
console.log("MANO vs PORTAL:", JSON.stringify(manoGana));

await pg.screenshot({ path: new URL("../salida/ficha.png", import.meta.url).pathname });

console.log("\nERRORES DE CONSOLA:", errores.length ? "\n - " + errores.join("\n - ") : "ninguno");
await nav.close();

// --- veredicto ---
const fallos = [];
if (manoGana?.fuente !== "mano") fallos.push(`lo escrito a mano deberia mandar, mando ${manoGana?.fuente}`);
if (manoGana?.v !== 2) fallos.push(`a mano se puso 2, salio ${manoGana?.v}`);
if (!sinPortal.hayInventario) fallos.push("INVENTARIO no se cargo");
if (sinPortal.existencia?.fuente !== "excel") fallos.push(`sin portal deberia decir excel, dijo ${sinPortal.existencia?.fuente}`);
if (sinPortal.existencia?.v !== 0) fallos.push(`sin portal deberia dar 0, dio ${sinPortal.existencia?.v}`);
if (conPortal.existencia?.fuente !== "portal") fallos.push(`con portal deberia decir portal, dijo ${conPortal.existencia?.fuente}`);
if (conPortal.existencia?.v !== 7) fallos.push(`con portal deberia dar 7, dio ${conPortal.existencia?.v}`);
if (!aviso || !/art/.test(aviso)) fallos.push(`el aviso de frescura no aparecio: ${aviso}`);
if (!marcas.portal) fallos.push("ninguna casilla quedo marcada como 'portal'");
if (marcas._marcaDeLaPieza !== "portal") fallos.push(`la pieza ${COD} quedo marcada como ${marcas._marcaDeLaPieza}`);
if (marcas._placeholderDeLaPieza !== "7") fallos.push(`el placeholder deberia mostrar 7, muestra ${marcas._placeholderDeLaPieza}`);
// gstatic/fonts los bloquea el sandbox de este contenedor, no son del codigo
const propios = errores.filter((e) => !/ERR_TUNNEL|ERR_CERT|gstatic|fonts\.googleapis/.test(e));
if (propios.length) fallos.push(`errores de consola propios: ${propios.join(" | ")}`);
console.log(fallos.length ? "\nFALLOS:\n- " + fallos.join("\n- ") : "\nTodo correcto.");
process.exit(fallos.length ? 1 : 0);
