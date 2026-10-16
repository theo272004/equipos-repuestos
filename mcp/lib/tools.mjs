// Las herramientas del MCP. Lectura: libre. Escritura: sin `confirmar: true` solo muestra
// lo que guardaría; con él, guarda a nombre de quien se conectó (su token).
import { z } from "zod";
import * as D from "./dominio.mjs";
import { cliente, escribir, uid, invalidar } from "./nube.mjs";
import { config } from "./config.mjs";

const salida = (titulo, datos) => ({ content: [{ type: "text", text: `${titulo}\n\n${JSON.stringify(datos, null, 1)}` }] });
const falla = (msg) => ({ isError: true, content: [{ type: "text", text: msg }] });
const L = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const E = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };

const sedeSchema = z.enum(["Sede 4", "Sede 2"]);
const confirmar = z.boolean().default(false).describe("false (por defecto): solo muestra lo que se guardaría. true: lo guarda de verdad. Pídelo en true únicamente cuando la persona ya vio el resumen y dijo que sí.");
const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "AAAA-MM-DD");

// Un equipo inequívoco o, si hay duda, las opciones para que se elija
function equipoUnico(W, texto) {
  const c = D.resolverEquipo(W, texto, 6);
  if (!c.length) return { error: `No encontré ningún equipo que se parezca a «${texto}». Prueba con el código interno (8 dígitos) o el nombre como sale en el plan.` };
  const q = texto.trim().toLowerCase();
  const exacto = c.filter((e) => e.cod === q || [e.nombre, ...e.nombresRegistro].some((n) => n.toLowerCase() === q));
  if (exacto.length === 1) return { eq: exacto[0] };
  if (c.length === 1) return { eq: c[0] };
  return { error: `«${texto}» puede ser varios equipos. Pregunta cuál y vuelve a llamar con el código interno:\n${c.map((e) => `- ${e.cod} · ${e.nombre} (${e.sede})`).join("\n")}` };
}

export function registrarHerramientas(server, quien) {
  const reg = (nombre, def, fn) => server.registerTool(nombre, def, async (args) => {
    try { return await fn(args); } catch (e) { console.error(`[${nombre}]`, e); return falla(`No pude completar la consulta: ${e.message}`); }
  });

  // ======================================================================= LECTURA
  reg("resumen_planta", {
    title: "Cómo va la planta",
    description: "Panorama del día: equipos de proceso por estado (producción, mantenimiento…), equipos parados o con falla abierta, pendientes abiertos, personal en turno, y cuántas compras de repuestos están atrasadas. Empieza por aquí si la pregunta es general.",
    inputSchema: {}, annotations: L,
  }, async () => {
    const c = await D.contexto();
    const turno = D.turnoEnCurso();
    const sedes = ["Sede 4", "Sede 2"];
    const pend = D.pendientes(c, { limite: 5 });
    return salida(`Panorama al ${c.hoy}`, {
      fecha: c.hoy, turnoEnCurso: `${turno.turno} (${turno.fecha})`,
      estadoEquipos: Object.fromEntries(sedes.map((s) => { const e = D.estadosActuales(c.W, c.nube, s); return [s, { enProduccion: e.produccion.length, enMantenimiento: e.mantenimiento, enMontaje: e.montaje.length, otros: e.otros.length }]; })),
      paradasOConFallaAbierta: D.paradasPorFalla(c.regs, c.hoy).map((r) => ({ equipo: r.eq, sede: r.s, desde: r.f, novedad: String(r.de || "").slice(0, 200) })),
      pendientesAbiertos: pend.total, pendientesMasUrgentes: pend.pendientes,
      personalEnTurno: D.personalEnTurno(c.W).personal,
      compras: (({ abiertas, atrasadas, sinAvance, cumple }) => ({ abiertas, atrasadas, sinAvanzar: sinAvance, cumplimientoPct: cumple }))(c.W.COMPRAS.resumen()),
      datosDelPlanHasta: c.W.EQUIPOS_PLAN.corte,
    });
  });

  reg("equipos_a_atacar", {
    title: "Equipos a atacar",
    description: "Ranking de los equipos que más requieren atención en un periodo: fallas, horas de paro, estado actual (parada, pendiente…), falla más común y la última novedad. Es la misma lista del Inicio de la app. Sirve para '¿qué equipo falla más?' y '¿cuál atacamos primero?'.",
    inputSchema: { periodo: z.enum(["7", "30", "mes", "mes_pasado"]).default("mes").describe("'7' últimos 7 días, '30' últimos 30, 'mes' lo que va del mes, 'mes_pasado'"), sede: sedeSchema.optional(), limite: z.number().int().min(1).max(30).default(8) },
    annotations: L,
  }, async ({ periodo, sede, limite }) => {
    const c = await D.contexto({ inv: false });
    const a = D.analisis(c.regs, { ...D.rangoPeriodo(periodo, c.hoy), hoy: c.hoy, sede });
    return salida(`Fallas del ${a.desde} al ${a.hasta}${sede ? " · " + sede : ""}`, { ...a, equipos: a.equipos.slice(0, limite) });
  });

  reg("buscar_equipo", {
    title: "Buscar equipo",
    description: "Encuentra un equipo por nombre o código interno (p. ej. 'blister 3', 'NJP', '17332003') y trae su ficha: código, sede, nombre en los reportes y las piezas del plan de mantenimiento con su frecuencia y último cambio.",
    inputSchema: { texto: z.string().min(1) }, annotations: L,
  }, async ({ texto }) => {
    const { W } = await D.contexto({ inv: false });
    const c = D.resolverEquipo(W, texto, 5);
    if (!c.length) return salida("Sin resultados", { buscado: texto });
    return salida(`${c.length} equipo(s)`, c.map((e) => ({ ...D.resumenEquipo(e), piezasEnPlan: e.plan.r.length })));
  });

  reg("plan_mantenimiento", {
    title: "Plan de mantenimiento de un equipo",
    description: "Las piezas del plan (Excel de mantenimiento por sistemas) de un equipo: sistema, código, descripción, cantidad por cambio, existencia, frecuencia, última ejecución y próxima. Ojo: el Excel suele quedar desactualizado.",
    inputSchema: { equipo: z.string().min(1), limite: z.number().int().min(1).max(100).default(40) }, annotations: L,
  }, async ({ equipo, limite }) => {
    const { W } = await D.contexto({ inv: false });
    const r = equipoUnico(W, equipo);
    if (r.error) return falla(r.error);
    const piezas = r.eq.plan.r.map((p) => ({ sistema: p.s || null, actividad: p.a || null, codigo: p.cod || null, descripcion: p.d, cantidad: p.q, enAlmacenSegunPlan: p.e, ubicacion: p.ub || null, frecuencia: (p.xls || {}).f || null, ultimaEjecucion: (p.xls || {}).ej || null, proxima: (p.xls || {}).px || null, estadoExcel: (p.xls || {}).st || null, observaciones: p.o || null }));
    return salida(`${r.eq.nombre} · plan con corte ${W.EQUIPOS_PLAN.corte}`, { equipo: D.resumenEquipo(r.eq), total: piezas.length, piezas: piezas.slice(0, limite) });
  });

  reg("cambios_de_piezas", {
    title: "Cambios de piezas de un equipo",
    description: "Historial de cambios de repuestos por familia de pieza (rodamientos, correas, sellos…) con la fecha del último cambio y el próximo calculado, las piezas del plan, su existencia y su estado de compra. Es la ficha 'Cambios de piezas' de la app.",
    inputSchema: { equipo: z.string().min(1), solo_pendientes: z.boolean().default(false).describe("true: solo familias vencidas o por vencer") }, annotations: L,
  }, async ({ equipo, solo_pendientes }) => {
    const c = await D.contexto();
    const r = equipoUnico(c.W, equipo);
    if (r.error) return falla(r.error);
    let p = D.cambiosDePiezas(c.W, r.eq);
    if (solo_pendientes) p = p.filter((x) => x.estado === "vencida" || x.estado === "pronto");
    return salida(`Cambios de piezas · ${r.eq.nombre}`, { equipo: D.resumenEquipo(r.eq), familias: p });
  });

  reg("historial_equipo", {
    title: "Historial de un equipo",
    description: "Novedades registradas de un equipo (reportes de turno y registro diario) de los últimos días, de la más reciente a la más antigua.",
    inputSchema: { equipo: z.string().min(1), dias: z.number().int().min(1).max(365).default(30), limite: z.number().int().min(1).max(60).default(15) }, annotations: L,
  }, async ({ equipo, dias, limite }) => {
    const c = await D.contexto({ inv: false });
    const r = equipoUnico(c.W, equipo);
    if (r.error) return falla(r.error);
    const nombres = new Set(r.eq.nombresRegistro);
    if (!nombres.size) return salida(`${r.eq.nombre}`, { aviso: "Este equipo no aparece en los reportes de turno (no es de proceso o se llama distinto).", equipo: D.resumenEquipo(r.eq) });
    const desde = D.sumaDias(c.hoy, -dias);
    const lista = c.regs.filter((x) => nombres.has(x.eq) && x.f >= desde).sort((a, b) => (b.f + (b.hr || "")).localeCompare(a.f + (a.hr || "")));
    return salida(`${r.eq.nombre} · ${lista.length} novedades desde ${desde}`, { equipo: D.resumenEquipo(r.eq), novedades: lista.slice(0, limite).map((x) => ({ id: x.id, fecha: x.f, hora: x.hr || null, turno: x.t, tipo: x.tp, falla: x.fa || null, estadoAlCierre: x.ef || null, minutosParo: x.min || null, repuesto: x.rep || null, detalle: String(x.de || "").slice(0, 400) })) });
  });

  reg("novedades", {
    title: "Novedades recientes",
    description: "Novedades del registro de mantenimiento en un rango de fechas, para toda la planta o filtradas por sede, tipo o texto.",
    inputSchema: { desde: fechaSchema.optional(), hasta: fechaSchema.optional(), sede: sedeSchema.optional(), tipo: z.enum(["Correctivo", "Preventivo", "Apoyo a producción", "Mejora / fabricación", "Otro"]).optional(), texto: z.string().optional(), limite: z.number().int().min(1).max(60).default(20) },
    annotations: L,
  }, async ({ desde, hasta, sede, tipo, texto, limite }) => {
    const c = await D.contexto({ inv: false });
    const d = desde || D.sumaDias(c.hoy, -2), h = hasta || c.hoy;
    const q = String(texto || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).filter(Boolean);
    const lista = c.regs.filter((x) => x.f >= d && x.f <= h && (!sede || x.s === sede) && (!tipo || x.tp === tipo)
      && q.every((t) => `${x.eq} ${x.de}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(t))).sort((a, b) => (b.f + (b.hr || "")).localeCompare(a.f + (a.hr || "")));
    return salida(`${lista.length} novedades del ${d} al ${h}`, lista.slice(0, limite).map((x) => ({ id: x.id, fecha: x.f, turno: x.t, sede: x.s, equipo: x.eq, tipo: x.tp, estadoAlCierre: x.ef || null, minutosParo: x.min || null, detalle: String(x.de || "").slice(0, 300) })));
  });

  reg("pendientes", {
    title: "Pendientes abiertos",
    description: "Pendientes abiertos de mantenimiento (de novedades, tareas, solicitudes de almacén y anotados a mano), con prioridad, estado y antigüedad. Mismas reglas que la pantalla Pendientes de la app.",
    inputSchema: { equipo: z.string().optional().describe("texto para filtrar por equipo o título"), sede: sedeSchema.optional(), limite: z.number().int().min(1).max(60).default(25) }, annotations: L,
  }, async ({ equipo, sede, limite }) => {
    const c = await D.contexto({ inv: false });
    const r = D.pendientes(c, { eq: equipo, sede, limite });
    return salida(`${r.total} pendientes abiertos`, r);
  });

  reg("buscar_repuesto", {
    title: "Buscar repuesto en almacén",
    description: "Busca un artículo del almacén por código o palabras ('empaque', 'rodamiento 6206', 'correa T20'). Trae existencias por bodega y ubicación (leídas al momento para los primeros resultados), el estado de su compra y qué equipos del plan lo usan.",
    inputSchema: { texto: z.string().min(2), limite: z.number().int().min(1).max(15).default(8) }, annotations: L,
  }, async ({ texto, limite }) => {
    const c = await D.contexto();
    const hallados = await D.buscarRepuestos(texto, limite);
    const usos = new Map();
    D.listaEquipos(c.W).forEach((e) => e.plan.r.forEach((r) => { if (r.cod) { if (!usos.has(r.cod)) usos.set(r.cod, new Set()); usos.get(r.cod).add(e.nombre); } }));
    const out = [];
    for (const [i, a] of hallados.entries()) {
      const v = i < 5 && !a.maestro ? await D.existenciaVigente(a) : a;
      out.push({
        codigo: a.cod, descripcion: a.desc, unidad: a.um || null,
        existencia: a.maestro ? null : Number(v.exist) || 0, agotado: a.maestro ? null : !(Number(v.exist) > 0),
        ubicaciones: a.maestro ? [] : D.sitiosDe(v), precioUnitario: v.pu || null, minimo: v.min || null,
        soloEnMaestro: !!a.maestro ? "Existe en el maestro de la empresa pero no sale en el inventario (probablemente en cero)" : undefined,
        compra: D.compraResumen(c.W.COMPRAS.estadoDe(a.cod)),
        usadoEn: [...(usos.get(a.cod) || [])].slice(0, 6),
      });
    }
    return salida(`${out.length} resultado(s) para «${texto}»`, out);
  });

  reg("estado_compra", {
    title: "Estado de compra de un repuesto",
    description: "En qué va la compra de un código de almacén: sin aprobar, sin orden de compra, en camino, atrasada o recibida, con proveedor, fecha prometida y plazo típico de entrega. Las fechas son las PROMETIDAS por el proveedor; los reportes no traen la fecha real de llegada.",
    inputSchema: { codigo: z.string().min(6) }, annotations: L,
  }, async ({ codigo }) => {
    const { W } = await D.contexto({ inv: false });
    const e = W.COMPRAS.estadoDe(codigo);
    const lineas = W.COMPRAS.lineas().filter((l) => l.c === codigo.trim().toUpperCase()).slice(0, 10);
    return salida(`Compra de ${codigo}`, { estado: D.compraResumen(e), plazoEntrega: W.COMPRAS.plazo(codigo.trim().toUpperCase()), lineas, datosHasta: W.COMPRAS.datos.hasta });
  });

  reg("repuestos_por_llegar", {
    title: "Repuestos por llegar",
    description: "Compras de repuestos de mantenimiento abiertas: atrasadas, en camino o sin avanzar (sin aprobar / sin orden de compra), más las cifras generales y el cumplimiento de los proveedores.",
    inputSchema: { filtro: z.enum(["todo", "atrasada", "camino", "sin_avanzar"]).default("atrasada"), texto: z.string().optional().describe("filtra por código, descripción, proveedor u OC"), limite: z.number().int().min(1).max(60).default(20) },
    annotations: L,
  }, async ({ filtro, texto, limite }) => {
    const { W } = await D.contexto({ inv: false });
    const r = D.repuestosPorLlegar(W, { filtro, q: texto, limite });
    const res = W.COMPRAS.resumen();
    return salida(`${r.total} líneas (${filtro})`, { cifras: { abiertas: res.abiertas, atrasadas: res.atrasadas, atrasoMedianoDias: res.atrasoMed, atrasoMaxDias: res.atrasoMax, sinAvanzar: res.sinAvance, cumplimientoPct: res.cumple, proveedoresConMasRetrasos: res.proveedores.slice(0, 4) }, datosHasta: W.COMPRAS.datos.hasta, ...r });
  });

  reg("por_pedir", {
    title: "Repuestos que toca pedir",
    description: "Piezas del plan de mantenimiento cuyo próximo cambio se acerca, que no hay en almacén y que nadie ha pedido, con la fecha límite para pedir (próximo cambio menos el plazo de entrega y una semana). Las vencidas hace más de 90 días se separan porque casi siempre es el Excel sin actualizar.",
    inputSchema: { incluir_viejas: z.boolean().default(false), limite: z.number().int().min(1).max(60).default(20) }, annotations: L,
  }, async ({ incluir_viejas, limite }) => {
    const { W } = await D.contexto();
    const r = D.porPedir(W, { incluirViejas: incluir_viejas, limite });
    return salida(`${r.vigentes} por pedir (+${r.viejasSinActualizar} del Excel sin actualizar)`, r);
  });

  reg("personal_en_turno", {
    title: "Personal en turno",
    description: "Quién trabaja en mantenimiento en un turno de cada sede. Sin parámetros: el turno en curso. Día 8:00–20:00, Noche 20:00–8:00.",
    inputSchema: { fecha: fechaSchema.optional(), turno: z.enum(["dia", "noche"]).optional() }, annotations: L,
  }, async ({ fecha, turno }) => {
    const { W } = await D.contexto({ inv: false });
    return salida("Personal en turno", D.personalEnTurno(W, fecha, turno));
  });

  // ======================================================================= ESCRITURA
  const vistaPrevia = (accion, doc) => salida(`VISTA PREVIA: ${accion}. Todavía NO se guardó nada. Muéstrale esto a la persona y, si dice que sí, repite la llamada con confirmar: true.`, doc);
  const guardado = (accion, doc) => salida(`GUARDADO: ${accion} (a nombre de ${quien}).`, doc);

  reg("anotar_pendiente", {
    title: "Anotar un pendiente",
    description: "Crea un pendiente manual en la lista de Pendientes de la app (aparece para todo el equipo). Sin confirmar:true solo muestra la vista previa.",
    inputSchema: { titulo: z.string().min(5).max(160), detalle: z.string().max(1000).optional(), equipo: z.string().max(120).optional().describe("nombre del equipo, tal como lo quieres ver en la lista"), sede: sedeSchema.optional(), prioridad: z.enum(["alta", "media", "baja"]).default("media"), confirmar },
    annotations: E,
  }, async ({ titulo, detalle, equipo, sede, prioridad, confirmar }) => {
    const c = await D.contexto({ inv: false });
    let eq = equipo || "", s = sede || "";
    if (equipo) { const r = D.resolverEquipo(c.W, equipo, 2); if (r.length === 1 || (r[0] && [r[0].nombre, ...r[0].nombresRegistro].some((n) => n.toLowerCase() === equipo.toLowerCase()))) { eq = r[0].nombresRegistro[0] || r[0].nombre; s = s || (r[0].sedesRegistro[0] || ""); } }
    const ahora = new Date().toISOString();
    const id = uid("s");
    const doc = { id, origen: "manual", titulo: titulo.trim(), detalle: (detalle || "").trim(), eq, sede: s, prioridad, estado: "abierto", fecha: c.hoy, creadoPor: quien, createdAt: ahora, updatedAt: ahora, por: quien, historial: [{ t: ahora, estado: "abierto", por: quien, nota: "Anotado desde el asistente (MCP)" }] };
    if (!confirmar) return vistaPrevia("nuevo pendiente", doc);
    await escribir("seguimiento", id, doc);
    return guardado("pendiente creado", doc);
  });

  reg("actualizar_pendiente", {
    title: "Cambiar el estado de un pendiente",
    description: "Cambia el estado de un pendiente (abierto, en curso, en espera, cerrado) y deja una nota en su historial. Usa el id que devuelve la herramienta 'pendientes'. Si el pendiente es una tarea, también actualiza la tarea. Sin confirmar:true solo muestra la vista previa.",
    inputSchema: { id: z.string().min(3), estado: z.enum(["abierto", "curso", "espera", "cerrado"]), nota: z.string().max(500).optional(), confirmar },
    annotations: E,
  }, async ({ id, estado, nota, confirmar }) => {
    const c = await D.contexto({ inv: false });
    const p = D.pendientes(c, { limite: 500 }).pendientes.find((x) => x.id === id);
    if (!p) return falla(`No encontré un pendiente abierto con id «${id}». Búscalo con la herramienta 'pendientes'.`);
    const previo = c.nube.seguimiento.find((d) => d.id === id) || { id, origen: p.origen === "manual" ? "manual" : p.origen };
    const ahora = new Date().toISOString();
    const historial = [...(previo.historial || []), { t: ahora, estado, por: quien, nota: nota || "Cambiado desde el asistente (MCP)" }].slice(-30);
    const { _doc, ...base } = previo;
    const doc = { ...base, id, estado, historial, cerradoEn: estado === "cerrado" ? ahora : "", titulo: previo.titulo || p.titulo, eq: previo.eq || p.equipo || "", sede: previo.sede || p.sede || "", updatedAt: ahora };
    const efectos = [`seguimiento/${id}: ${p.estado} → ${estado}`];
    const esTarea = id.startsWith("tar:");
    if (esTarea) efectos.push(`tareas/${id.slice(4)}: estado de la tarea → ${{ abierto: "pendiente", curso: "en-progreso", espera: "en-progreso", cerrado: "hecha" }[estado]}`);
    if (!confirmar) return vistaPrevia(`pendiente «${p.titulo}»`, { efectos, doc });
    await escribir("seguimiento", id, doc);
    if (esTarea) {
      const st = { abierto: "pendiente", curso: "en-progreso", espera: "en-progreso", cerrado: "hecha" }[estado];
      const ok = await cliente().actualizar("tareas", id.slice(4), { status: st, ...(st === "hecha" ? { doneAt: ahora } : {}), updatedAt: ahora });
      if (!ok) return falla("Se guardó el seguimiento pero no pude actualizar la tarea en Firestore.");
      invalidar("tareas");
    }
    return guardado("pendiente actualizado", { efectos });
  });

  reg("anotar_novedad", {
    title: "Anotar una novedad de mantenimiento",
    description: "Agrega una novedad al registro de mantenimiento (lo que se hizo o encontró en un equipo de proceso). Aparece en el Inicio, los indicadores y los pendientes. El equipo debe ser uno de los del registro diario. Sin confirmar:true solo muestra la vista previa.",
    inputSchema: {
      equipo: z.string().min(2).describe("nombre del equipo como en el registro diario ('Blister 3', 'NJP 2'…) o su código interno"),
      detalle: z.string().min(10).max(1500).describe("qué pasó y qué se hizo, con el pendiente si quedó alguno"),
      turno: z.enum(["Día", "Noche"]), tipo: z.enum(["Correctivo", "Preventivo", "Apoyo a producción", "Mejora / fabricación", "Otro"]).default("Correctivo"),
      estado_al_cierre: z.enum(["Operativo", "Operativo con pendiente", "Pendiente"]).describe("cómo quedó el equipo"),
      sede: sedeSchema.optional().describe("obligatoria si el equipo existe en las dos sedes (p. ej. 'Blister 3')"),
      minutos_paro: z.number().int().min(0).max(1440).optional(), fecha: fechaSchema.optional().describe("por defecto, hoy"), repuesto: z.string().max(200).optional(), confirmar,
    },
    annotations: E,
  }, async (a) => {
    const c = await D.contexto({ inv: false });
    const r = equipoUnico(c.W, a.equipo);
    if (r.error) return falla(r.error);
    let catalogo = ((c.W.MTTO && c.W.MTTO.catalogo.equipos) || []).filter((e) => e.fi === r.eq.plan.id);
    if (!catalogo.length) return falla(`«${r.eq.nombre}» no está en el registro diario (solo se anotan novedades de los equipos de proceso).`);
    if (a.sede) catalogo = catalogo.filter((e) => e.s === a.sede);
    if (!catalogo.length) return falla(`«${r.eq.nombre}» no está en el registro de ${a.sede}.`);
    if (new Set(catalogo.map((e) => e.s)).size > 1) return falla(`«${r.eq.nombre}» está en las dos sedes del registro. Pregunta en cuál fue y vuelve a llamar con sede: ${[...new Set(catalogo.map((e) => e.s))].join(" o ")}.`);
    const cat = catalogo[0];
    const ahora = new Date().toISOString();
    const id = uid("m");
    const doc = { id, f: a.fecha || c.hoy, hr: new Date(Date.now() - 5 * 3600e3).toISOString().slice(11, 16), t: a.turno, s: cat.s, eq: cat.eq, ar: cat.ar, cat: "Máquina", tp: a.tipo, de: a.detalle.trim(), min: a.minutos_paro ?? null, ef: a.estado_al_cierre, frep: a.estado_al_cierre === "Pendiente" && /falta|repuesto|pieza/i.test(a.detalle) ? 1 : 0, ...(a.repuesto ? { rep: a.repuesto } : {}), tec: quien, por: quien, src: "mcp", createdAt: ahora, updatedAt: ahora };
    if (!a.confirmar) return vistaPrevia(`novedad en ${cat.eq} (${cat.s})`, doc);
    await escribir("mtto_registros", id, doc);
    return guardado("novedad registrada", doc);
  });

  reg("registrar_cambio_pieza", {
    title: "Registrar un cambio de pieza",
    description: "Anota que se cambió una pieza en un equipo (queda en 'Cambios de piezas' y recalcula el próximo cambio). Necesita el código interno de la pieza. Sin confirmar:true solo muestra la vista previa.",
    inputSchema: { equipo: z.string().min(2), codigo: z.string().min(6).describe("código interno de almacén de la pieza"), fecha: fechaSchema.optional().describe("por defecto, hoy"), cantidad: z.number().int().min(1).max(500).default(1), quien: z.string().max(80).optional().describe("quién hizo el cambio, si no es quien conversa"), nota: z.string().max(300).optional().describe("dónde va la pieza y cualquier detalle"), confirmar },
    annotations: E,
  }, async (a) => {
    const c = await D.contexto({ inv: false });
    const r = equipoUnico(c.W, a.equipo);
    if (r.error) return falla(r.error);
    const fecha = a.fecha || c.hoy;
    if (fecha > c.hoy) return falla("La fecha del cambio no puede ser futura.");
    const fila = r.eq.plan.r.find((x) => x.cod === a.codigo);
    const maestro = fila ? null : (await D.buscarRepuestos(a.codigo, 1))[0];
    if (!fila && !maestro) return falla(`El código ${a.codigo} no está en el plan de ${r.eq.nombre} ni en el almacén. Verifica el código con 'buscar_repuesto'.`);
    const id = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const doc = { id, eq: r.eq.cod, cod: a.codigo, d: (fila && fila.d) || maestro.desc || "", fecha, q: a.cantidad, quien: a.quien || quien, nota: [a.nota || "", "Anotado desde el asistente (MCP)"].filter(Boolean).join(" · "), createdAt: new Date().toISOString() };
    const aviso = fila ? undefined : "Esta pieza no está en el plan de ese equipo: se registrará igual, como pieza suelta.";
    if (!a.confirmar) return vistaPrevia(`cambio de ${doc.d} en ${r.eq.nombre}`, { doc, aviso });
    await escribir("cambios", id, doc);
    return guardado("cambio de pieza registrado", { doc, aviso });
  });
}
