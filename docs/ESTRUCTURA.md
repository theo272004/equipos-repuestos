# Estructura del repositorio (resumen)

Programa de mantenimiento de Farmacápsulas (Barranquilla). Resumen de lo que hay, cómo se
guardan los datos y cómo entran. Está escrito mirando el código; donde dependa de las hojas
de vida reales (que este repositorio no tiene) queda marcado como **¿Por confirmar?**.

## 1. Tecnologías

| Capa | Qué se usa |
|---|---|
| App web | HTML + JavaScript puro (sin framework ni compilador). `index.html` carga ~38 scripts de `assets/js/` con `?v=` para romper la caché. Funciona como página instalable en el celular (PWA). Se publica en GitHub Pages. |
| Datos que viajan con el repositorio | Archivos `assets/**/*-data.js`, `assets/equipos.js`, `assets/data/*.json`: son datos *generados* (no se editan a mano) y se leen como `window.ALGO`. |
| Datos vivos | Firestore (Firebase, proyecto `mantenimiento-f405b`) con respaldo en `localStorage`. Reglas en `firestore.rules`. |
| Automatización | GitHub Actions (`.github/workflows/`): recordatorios y avisos por Telegram (`scripts/send-reminders.mjs`, `bot-updates.mjs`, `enviar-aviso.mjs`). |
| Importadores | Python (`openpyxl`, `xlrd`) y Node en `scripts/`: leen los Excel/reportes del ERP y reescriben los archivos de datos. |
| Puente MiPortal | `scripts/portal-bridge/`: sube existencias del almacén (reporte RE356) a Firestore. |
| MCP | `mcp/`: servidor MCP (Node 20) para preguntarle a Claude sobre la planta y anotar pendientes, cambios, OT para Fracttal, etc. Usa las mismas reglas que la app. |
| Gemelos digitales | `gemelo-*.html` + `scripts/gemelo-*/`: visores 3D/láminas de MS235 y NJP-3500. |

## 2. Carpetas principales

```
index.html                 App única (menú: Inicio, Equipos, Turno, Mantenimiento, Almacén, Indicadores, Ajustes)
assets/equipos.js          REGISTRO de equipos (346) + su plan de repuestos (856 filas)
assets/js/machines-data.js FICHAS TÉCNICAS ricas (13 máquinas) + lógica que une ficha y registro
assets/js/mtto-data.js     Catálogos del registro diario, metas y reglas del lector de reportes
assets/js/reportes-data.js Reportes de turno importados del chat de WhatsApp
assets/js/compras-data.js  Compras (RE355 + órdenes de compra de MiPortal)
assets/js/centros-costo.js Centros de costo (DMM-229) y mapa activo → centro de costo
assets/data/maestro-almacen.json  13.671 códigos de artículos (RE356R), sin precios ni existencias
assets/js/componentes-registro.js / inspecciones-registro.js  Cambios y mantenimientos documentados
manuales/<equipo>/         PDF oficiales (manual, esquemas, piezas de recambio) de 11 equipos
scripts/                   Importadores y utilidades
mcp/                       Servidor MCP
docs/                      Documentación (esta carpeta)
```

## 3. Modelo de datos

### 3.1 Equipo (`assets/equipos.js` → `window.EQUIPOS_PLAN`)

Fuente declarada: listados oficiales DMM-179B (Sede 4) y DMM-179 (Planta 2) + el Excel
«MANTENIMIENTO POR SISTEMAS». Tiene `fuente`, `corte` (fecha del Excel) y `equipos[]`.

| Campo | Qué es | Ejemplo / nota |
|---|---|---|
| `c` | Código de equipo (activo) | `"17332002"`. Hay códigos de 7, 8 y 9 dígitos y uno de 1 dígito (`"1"`, «Invima»). **No es único entre plantas**: `17303002` y `17303018` están en Sede 4 y en Planta 2. |
| `id` | Clave interna única | `eq-17332002`; en Planta 2 con repetido: `eq-17303002-p2` |
| `mid` | Id de una ficha rica cuando difiere de `id` | Solo 4 equipos: `integra320`, `gkf2600`, `ms235`, `blister3` |
| `n` / `nOriginal` | Nombre limpio / nombre tal como sale en el listado | |
| `u` | Ubicación | `SEDE 4` (195), `PLANTA 2` (150), y un `SE` (probable error de digitación) |
| `cc` | **Dos cosas mezcladas**: un código corto de centro de costo (`K9`, `R7`… 80 equipos) o un nombre de área + zona (`MICROG · ÁREA BLANCA`… 266 equipos) | |
| `tipo` | `PROCESO` (105), `AUXILIAR` (240), `URGENCIA` (1) | |
| `r[]` | Repuestos del plan (solo 80 equipos tienen) | ver abajo |

Repuesto / actividad del plan (`r[]`, 856 filas):

| Campo | Qué es |
|---|---|
| `s` | Sistema o pieza (`TENSOR FOIL`, `BANDA TRANSPORTADORA`) |
| `a` | Actividad: `MECANICA`, `ELECTRICA`, `CAMBIO DE FILTRO`, `INSTRUMENTACION Y CONTROL`, `LOCATIVO`, `FILTRACION`, `LUBRICACION`, `SEGURIDAD` |
| `cod`, `d` | Código interno de almacén y descripción (16 filas sin código) |
| `q` | Cantidad que lleva la máquina |
| `e` | Existencia total; `w` = existencia por bodega, en este orden: **R01, R02, R04, T51** (columnas 12–15 de la hoja PLAN MTTO; confirmado por el usuario) |
| `o` | Observaciones |
| `ub` | Ubicación en bodega (`R02/M0202 · R04/E0104`) |
| `pu` | Precio unitario |
| `xls` | `f` frecuencia (`1A`, `1B`, `3M`, `6M`, `9M`, `1,5A`, `3A`, `4A`; vacía en 218 filas), `ej` última ejecución, `px` próxima, `st` estado (`RETRASADO`, `EN TIEMPO`, `ALERTA`, vacío) |

### 3.2 Ficha técnica (`machines-data.js` → `initialMachines`)

13 fichas ricas hechas a mano (NJP-3500, MS235, GKF 2600, Integra 320, Blister 3 Uhlmann,
NJP-1200C ×2, FX30 PRO STEP ×2, Stick Pack MT1100, ML642, Hüttlin HDGC 400, puerta Controlsa).
Campos: `id`, `equipoCod`, `causaCod/causaDesc`, `name`, `model`, `area`, `location`,
`status`, `criticality`, `manual` (**texto libre**), `technicalData` {marca, fabricante,
serie, año, voltaje, potencia, peso, dimensiones…}, `systems`, `spareParts`,
`maintenanceTasks`, `failureModes`, `documents[]`, `summarySpecs`, etc.

Para los otros ~330 equipos del registro, `equipoAMachine()` crea una **ficha básica al
arrancar** (no se guarda): `manual: "Pendiente de cargar"`, datos técnicos «Por registrar»,
`documents: []`. Además crea fichas básicas para equipos del registro diario sin código DMM
(`equipoCod: "Sin código DMM"`).

### 3.3 Vínculo equipo ↔ manual

Hoy **no hay un campo estructurado**. El vínculo es:

1. `documents[] = { name, status: "Disponible" | "Pendiente", file }` dentro de cada ficha rica,
   donde `file` es una ruta bajo `manuales/` (ej. `manuales/ms235/...pdf`).
2. `manual` es un texto descriptivo sin enlace.
3. La unión ficha ↔ registro es por `id` (`eq-<código>`), o por `mid` en 4 equipos.
4. Los manuales sueltos de la raíz (`*.pdf`) están ignorados por `.gitignore`; los oficiales
   van en `manuales/<equipo>/`.

### 3.4 Datos vivos (Firestore)

Colecciones permitidas por `firestore.rules`: `tareas`, `inspecciones`, `cambios`, `datos`,
`mtto_registros`, `bitacora`, `inventario` (con borrado) y `inventario_meta`, `mtto_estados`,
`solicitudes`, `seguimiento`, `presupuesto`, `movimientos`, `inventario_cargas`,
`reportes_turno`, `bot` (sin borrado). Las reglas **no piden inicio de sesión** (ver
`docs/firestore-con-clave.rules`). El repositorio es público: por eso no se suben precios del
maestro de artículos.

### 3.5 Otros datos

- **Registro diario** (`mtto-data.js`): `catalogo.equipos[]` = `{ s: sede, eq: nombre, ar: área de proceso, proc, fi: id de ficha }` (88 equipos, 48 enlazados a ficha).
- **Compras** (`compras-data.js`): líneas del RE355 + orden de compra (`c` código, `d`, `rq` requisición, `es` estado, `q/o/r` pedido/ordenado/recibido, `oc`, `pv` proveedor, `fe/fo/ve/fa` fechas prometidas, `cc`).
- **Turnos** (`turnos-data.js`): grupos y rotación de 6 días (2 día, 2 noche, 2 descanso).
- **Centros de costo** (`centros-costo.js`): lista DMM-229 y `equipos: { activo → centro }`.

## 4. Cómo se cargan los datos

| Dato | Entrada | Script | Salida |
|---|---|---|---|
| Plan de mantenimiento por pieza | Excel «MANTENIMIENTO POR SISTEMAS» (hoja «PLAN MTTO») | `scripts/actualizar-plan-mtto.py` | `assets/equipos.js` (no borra nada; cruza por equipo + código + sistema) |
| Compras | Reportes RE355 y órdenes de compra (`.xls` de MiPortal) | `scripts/importar-compras.py` | `assets/js/compras-data.js` |
| Maestro de artículos | RE356R | `scripts/gen-maestro-almacen.py` | `assets/data/maestro-almacen.json` |
| Existencias | RE356 | Puente `scripts/portal-bridge/` o botón «Cargar reporte» en Almacén | Firestore `inventario` |
| Reportes de turno | Chat de WhatsApp «Mtto Medicamentos» | `scripts/importar-reportes-whatsapp.mjs` | `reportes-data.js` / `mtto-data.js` |
| Pendientes, tareas, cambios, inspecciones | Formularios de la app, bot de Telegram, MCP | — | Firestore |

**Lo que no está cargado hoy:** las hojas de vida (`BD SEDE 4 DMM-199 Hoja de Vidas.xlsm`,
`BASE DE PLANTA 2 DMM-199 …xlsb`), el listado de áreas DMM-211B, el cronograma DAC-011, los
indicadores de cumplimiento/disponibilidad ni las fotos y respaldos por equipo. La app solo
menciona DMM-179/179B, DMM-229 y RE355/RE356.

## 5. Puntos débiles detectados (resumen)

1. `c` no es único entre plantas; la clave real es `id`.
2. `cc` mezcla códigos de centro de costo con nombres de área.
3. `u` tiene un valor `SE` (equipo `125334007`, Chequeadora CS100).
4. Equipo `"1"` («Invima», `URGENCIA`, `cc: "0"`) es un comodín, no una máquina.
5. Solo 80 de 346 equipos tienen plan de repuestos; 218 filas sin frecuencia.
6. El vínculo equipo ↔ manual es texto libre y solo existe para 13 fichas.
7. Nada del contenido de las hojas de vida (ubicación exacta, fabricante, serie, fecha de instalación, fotos) está en el modelo del registro.

Los PR de esta tanda atacan 3, 4 y 6 y preparan el 7 sin inventar columnas. Ver sus descripciones.

## 6. Decisiones del usuario (noviembre 2026)

- `125334007` (Chequeadora CS100) es **SEDE 4** (confirmado con DMM-179B).
- «Invima» (código `1`) es una **evaluación**, no una máquina: se marca `evaluacion: true`, no se borra ni cuenta como equipo.
- `17303002` y `17303018` son equipos distintos por planta: la clave es **planta + código** (también en `actualizar-plan-mtto.py`).
- `17334008` (Stick Pack sin número) queda **por confirmar** como posible duplicado de `17334018` (MT-1100); no se elimina.
- Los equipos del repositorio que no estén en el listado DMM-179 vigente **no se quitan**; solo se listan.
- **No se agregan por ahora**: Blisteadoras #8 y #9 UPS 300, Codificadora Hitachi #7, Mezclador horizontal #4 (casi no aparecen en los reportes).
- Hojas de vida: no se sube el serial al repositorio público; de IMAGEN solo el nombre del archivo.
- Manuales: no se suben al repositorio; solo ruta relativa y tipo.
- `FREC-*` en las hojas de vida traen letras (`M`, `I`, `F`, `IE`, `M/S`, `MT`, `MT/R`, `X`), no fechas ni números. **Su significado no está definido**: el importador las guarda tal cual (solo limpia espacios) y no las interpreta.
- En `PLAN MTTO` la columna C es `UBICACIÓN` (`SEDE 4` / `PLANTA 2`): el cruce por planta + código es automático.
- `17334008` **NO** es duplicado de `17334018` (MT-1100): es otra máquina (Empacando DXDL60 II, 2016). No está en el listado DMM-179 vigente ni en el anterior, así que queda **retirado** (`retirado: true`, fuera de los totales) y su plan (3 filas) se guarda también en `assets/data/equipos-retirados.json`. No se borra ni se mueven repuestos ni ficha entre ambos.
- **Equipos fuera del listado DMM-179/179B vigente (20)**: se sacan de la lista activa con `retirado: true`, no cuentan en los totales ni en Equipos y su copia completa (datos y filas de plan) queda en `assets/data/equipos-retirados.json` para poder reactivarlos. No se borra nada. Son: Mezclador #2 300KG (17303001); Bombos 350 Kg de Planta 2 (16328028, 029, 030, 031, 032, 036, 040, 041); Codificadoras láser VJ3020 (17366001-003); Encelofanadoras Marzio R-120 (17334007, 011, 012, 013); Stick Pack 17334008; Granulador #2 (17303005); Horno de Secado #1 (17329001); Selladora Secadora Qcaps3 (17304008). Para reactivar uno basta quitar `retirado`, `retiradoMotivo` y `retiradoEn` de su registro en `assets/equipos.js`.
