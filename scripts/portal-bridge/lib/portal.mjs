// Entra a MiPortal y baja el Excel de inventario, usando un navegador de verdad
// (Playwright + Chromium).
//
// Por que un navegador y no fetch(): MiPortal es JSF (.faces) e Integra es
// Infor/Inabler. Los dos mandan formularios con un javax.faces.ViewState que
// cambia en cada carga y con nombres de campo generados (j_id_...). Reproducir
// ese baile a mano con fetch se rompe en cuanto el portal cambia una pantalla.
// Un navegador hace login, cookies, sesion y JavaScript igual que una persona,
// que es justo lo que estos portales esperan.
//
// Cuando algo falla se guarda captura + HTML de la pagina en salida/, porque
// este script corre solo en un PC de planta y esa es toda la evidencia que va
// a quedar para saber que paso.

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Si en la config no pusiste selector, se prueban estos por orden. Cubren la
// mayoria de formularios de login, JSF incluido.
const CANDIDATOS = {
  usuario: ['input[name*="user" i]', 'input[name*="usuario" i]', 'input[id*="user" i]', 'input[id*="usuario" i]', 'input[name="j_username"]', 'input[type="text"]:visible'],
  clave: ['input[type="password"]'],
  entrar: ['input[type="submit"]', 'button[type="submit"]', 'button:has-text("Ingresar")', 'button:has-text("Entrar")', 'input[value*="ngresar" i]', 'input[value*="ntrar" i]', 'a:has-text("Ingresar")'],
};

async function primero(pagina, selectorConfig, candidatos, que) {
  const lista = selectorConfig ? [selectorConfig] : candidatos;
  for (const sel of lista) {
    const loc = pagina.locator(sel).first();
    if (await loc.count().catch(() => 0)) {
      if (await loc.isVisible().catch(() => false)) return loc;
    }
  }
  throw new Error(
    `No encontre ${que} en la pagina de login.` +
    (selectorConfig
      ? ` El selector de la config es "${selectorConfig}" y no aparecio.`
      : ` Probe los selectores habituales sin suerte; ponlo a mano en portal.config.json -> portal.selectores.`) +
    ` Corre con --explorar para ver la pagina y ajustarlo.`
  );
}

export async function abrirNavegador({ visible = false, descargas }) {
  const navegador = await chromium.launch({ headless: !visible, args: ["--ignore-certificate-errors"] });
  const contexto = await navegador.newContext({
    acceptDownloads: true,
    ignoreHTTPSErrors: true,   // los portales internos suelen ir con certificado propio
    viewport: { width: 1440, height: 900 },
  });
  contexto.setDefaultTimeout(descargas?.timeoutMs ?? 45000);
  return { navegador, contexto };
}

export async function evidencia(pagina, dirSalida, etiqueta) {
  try {
    await mkdir(dirSalida, { recursive: true });
    const png = join(dirSalida, `${etiqueta}.png`);
    const html = join(dirSalida, `${etiqueta}.html`);
    await pagina.screenshot({ path: png, fullPage: true }).catch(() => {});
    await writeFile(html, await pagina.content().catch(() => ""), "utf8").catch(() => {});
    return { png, html };
  } catch { return null; }
}

export async function login(pagina, cfg, dirSalida) {
  const { loginUrl, usuario, clave, selectores = {}, selectorLogueado } = cfg;
  if (!loginUrl) throw new Error("Falta portal.loginUrl en portal.config.json.");
  if (!usuario || !clave) throw new Error("Faltan las credenciales. Ponlas en el archivo .env (PORTAL_USUARIO y PORTAL_CLAVE), nunca en portal.config.json.");

  console.log(`   entrando a ${loginUrl}`);
  await pagina.goto(loginUrl, { waitUntil: "domcontentloaded" });

  const campoUsuario = await primero(pagina, selectores.usuario, CANDIDATOS.usuario, "el campo de usuario");
  const campoClave = await primero(pagina, selectores.clave, CANDIDATOS.clave, "el campo de contrasena");
  await campoUsuario.fill(usuario);
  await campoClave.fill(clave);

  const boton = await primero(pagina, selectores.entrar, CANDIDATOS.entrar, "el boton de entrar").catch(() => null);
  const urlLogin = pagina.url();
  if (boton) await Promise.all([pagina.waitForLoadState("networkidle").catch(() => {}), boton.click()]);
  else await Promise.all([pagina.waitForLoadState("networkidle").catch(() => {}), campoClave.press("Enter")]);

  // Saber si entro o no: si la config dice que espere algo concreto, se espera.
  // Si no, basta con que la pagina ya no sea la del login y no siga habiendo un
  // campo de contrasena delante.
  if (selectorLogueado) {
    try {
      await pagina.waitForSelector(selectorLogueado, { timeout: 20000 });
    } catch {
      const ev = await evidencia(pagina, dirSalida, "login-fallido");
      throw new Error(`Entre a ${loginUrl} pero nunca aparecio "${selectorLogueado}", asi que doy el login por fallido.` + (ev ? ` Mira ${ev.png}` : ""));
    }
  } else {
    await pagina.waitForTimeout(1500);
    const sigueLogin = pagina.url().split("?")[0] === urlLogin.split("?")[0];
    const hayClave = await pagina.locator('input[type="password"]').first().isVisible().catch(() => false);
    if (sigueLogin && hayClave) {
      const ev = await evidencia(pagina, dirSalida, "login-fallido");
      throw new Error(
        `Se quedo en la pagina de login: lo mas probable es que usuario o contrasena esten mal, o que el portal pida algo mas (captcha, segundo factor, aviso de clave vencida).` +
        (ev ? ` Mira ${ev.png} para ver que mostro.` : "")
      );
    }
  }
  console.log(`   dentro (${pagina.url()})`);
}

// Baja el reporte. Dos caminos:
//  - directo: el reporte tiene URL propia que ya devuelve el archivo.
//  - por clic: se abre la pantalla del reporte y se pulsa el boton de exportar.
export async function descargarReporte(pagina, cfg, dirSalida) {
  const { reporteUrl, selectorExportar, pasosPrevios = [], archivoEsperado } = cfg;
  if (!reporteUrl) throw new Error("Falta portal.reporteUrl en portal.config.json.");

  console.log(`   abriendo el reporte: ${reporteUrl}`);

  if (!selectorExportar) {
    // Descarga directa: la URL misma entrega el Excel.
    const [descarga] = await Promise.all([
      pagina.waitForEvent("download"),
      pagina.goto(reporteUrl, { waitUntil: "commit" }).catch(() => {}),
    ]);
    return descarga;
  }

  await pagina.goto(reporteUrl, { waitUntil: "domcontentloaded" });
  await pagina.waitForLoadState("networkidle").catch(() => {});

  // Filtros previos: fechas, almacen, tipo de reporte... lo que haya que dejar
  // puesto antes de exportar.
  for (const paso of pasosPrevios) {
    const loc = pagina.locator(paso.selector).first();
    await loc.waitFor({ state: "visible" });
    if (paso.accion === "escribir") await loc.fill(String(paso.valor ?? ""));
    else if (paso.accion === "elegir") await loc.selectOption(String(paso.valor ?? ""));
    else await loc.click();
    await pagina.waitForLoadState("networkidle").catch(() => {});
  }

  const boton = pagina.locator(selectorExportar).first();
  try {
    await boton.waitFor({ state: "visible", timeout: 20000 });
  } catch {
    const ev = await evidencia(pagina, dirSalida, "reporte-sin-boton");
    throw new Error(`Abri el reporte pero no encontre el boton de exportar ("${selectorExportar}").` + (ev ? ` Mira ${ev.png}` : ""));
  }

  const [descarga] = await Promise.all([
    pagina.waitForEvent("download").catch(async () => {
      const ev = await evidencia(pagina, dirSalida, "reporte-sin-descarga");
      throw new Error(`Pulse el boton de exportar pero el portal nunca mando ningun archivo.` + (ev ? ` Mira ${ev.png}` : ""));
    }),
    boton.click(),
  ]);

  if (archivoEsperado && !descarga.suggestedFilename().toLowerCase().includes(archivoEsperado.toLowerCase())) {
    console.log(`   ojo: esperaba un archivo con "${archivoEsperado}" en el nombre y bajo "${descarga.suggestedFilename()}"`);
  }
  return descarga;
}

// Modo --explorar: navegador visible, tu haces el recorrido a mano y el script
// se queda mirando. Sirve para dos cosas a la vez: para sacar el inventario hoy
// aunque la automatizacion todavia no este afinada, y para ir apuntando las URL
// por las que pasas, que son las que hay que poner en la config.
export async function explorar(contexto, cfg, dirSalida) {
  const pagina = await contexto.newPage();
  const visitadas = [];
  pagina.on("framenavigated", (f) => {
    if (f === pagina.mainFrame()) {
      const u = f.url();
      if (u && u !== "about:blank" && visitadas[visitadas.length - 1] !== u) visitadas.push(u);
    }
  });

  await pagina.goto(cfg.loginUrl, { waitUntil: "domcontentloaded" }).catch(() => {});

  console.log("");
  console.log("   >> El navegador esta abierto. Haz esto ahi:");
  console.log("      1. Entra con tu usuario.");
  console.log("      2. Ve a la pantalla del reporte de inventario / repuestos.");
  console.log("      3. Exportalo a Excel como lo haces siempre.");
  console.log("   En cuanto el portal suelte el archivo, sigo yo solo.");
  console.log("");

  const descarga = await pagina.waitForEvent("download", { timeout: cfg.timeoutExplorarMs ?? 900000 });
  console.log(`   archivo capturado: ${descarga.suggestedFilename()}`);

  await writeFile(
    join(dirSalida, "urls-visitadas.txt"),
    ["Por aqui pasaste. La del login va en portal.loginUrl y la del reporte en portal.reporteUrl:", "", ...visitadas].join("\n"),
    "utf8"
  ).catch(() => {});

  return { pagina, descarga, visitadas };
}
