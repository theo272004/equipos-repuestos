# Revisión de la ficha `eq-17334008` («Stick Pack Líquidos Schmucker MT1100»)

**Solo revisión: no se cambió ni se movió nada.** Ficha en `assets/js/machines-data.js` (id `eq-17334008`), creada el 2026-10-17 (commit `e80c7a0`, luego `51d8940` «auditoría de los cambios de Gemini»).

## 1. Qué dicen los documentos (evidencia del repositorio)

| Archivo (`manuales/stickpack/`) | Portada | Serie |
|---|---|---|
| `StickPack-S3240005-calibrado-regulaciones.pdf` (12,6 MB) | «**MT1100 STICKPACKER** · Calibrazione, aggiustamento / Calibrado, regulaciones» | `S3240005` |
| `StickPack-S3240005-piezas-de-recambio.pdf` (9,0 MB) | «**MT1100 STICKPACKER** · Parti di ricambio / Piezas de recambio» | `S3240005` |
| `StickPack-S3240005-esquema-electrico-ES3240005.pdf` (20,0 MB) | «Macchina: **MT1100** · Matricola: **S3240005**» | `S3240005` |

- Los tres son idénticos byte a byte (md5) a los PDF sueltos de la raíz `4-Calibrado regulaciones_001_90_01M04…`, `5-Piezas de recambio_001_90_01M05…` e `Instalación Eléctrica_001_90_01023…`.
- Los manuales de la **MS235** son otro juego, con md5 distinto: `manuales/ms235/MS235-*-S4220003-*.pdf`, portada «MS235 · MACCHINA BUSTINATRICE», serie **`S4220003`** (esquema `ES4220003`). Es lo que usa la ficha `ms235` (17334017).
- La ficha `eq-17334008` menciona `S3240005` 19 veces y `MT1100` 4 veces; **`MS235` y `S4220003` 0 veces**. Los códigos de pieza que cita empiezan por `S3…` (los de la MS235 por `S4…`).

> ⚠️ **Esto contradice lo que se creía** («el manual S3240005 es de la MS235»): según las portadas, los 3 PDF son de un **MT1100 con serie S3240005**, no de la MS235. Según el repositorio, la ficha mezcla **dos** máquinas (la identidad de 17334008 y el contenido de un MT1100), no tres. Si el usuario sabe que la placa dice otra cosa, hay que mirar la placa: el repositorio no puede decidirlo. Ver preguntas.

La propia ficha lo admite en `notes`: «Confirmar en la placa que S3240005 es esta unidad (17334008) y no la Stick Pack II o III».

## 2. Cada campo y a qué máquina parece pertenecer

Leyenda: **A** = 17334008 (Stick Pack #1, Empacando DXDL60 II, Planta 2, retirado) · **B** = MT-1100 (17334018, Marchesini, Sede 4) · **C** = MS235 (17334017).

| Campo | Contenido | Parece de | Por qué |
|---|---|---|---|
| `id` | `eq-17334008` | A | id del registro |
| `equipoCod` | `17334008` | A | código |
| `name` | «Encelofanadora Stick Pack Líquidos Schmucker MT1100» | **mezcla A+B** | «Stick Pack Líquidos» ≈ nombre de 17334008 en el registro; «Schmucker MT1100» sale del manual |
| `model` | «Schmucker MT1100 (S3240005)» | B (por los PDF) | portada |
| `current` | «Código 17334008 · matrícula S3240005» | **mezcla A+B** | código de A, matrícula del manual |
| `area` | «Líquidos · Envasado en stick pack» | A | 17334008 es «para Líquidos en Sobre». El registro pone el MT-1100 en «ENCELOFANADO SÓLIDOS · ÁREA BLANCA»: ¿el MT-1100 de Sede 4 es de sólidos o de líquidos? |
| `location` | «Planta 2» | A | registro |
| `status`, `criticality` | «Operativo», «Alta» | A (administrativo) | «Operativo» ya no vale: está retirado |
| `completion` | 65 | ficha | avance de la ficha, no de la máquina |
| `causaCod`, `causaDesc` | `DI`, «Encelofanadora para Líquidos en Sobre Stick Pack» | A | centro de costo del registro (`cc: "DI"`) |
| `manual`, `maintenance` | «Calibrado 01M04 + Piezas 01M05 + esquema ES3240005»; «Plan por horas H100–H3600…» | B (por los PDF) | texto de los 3 PDF |
| `image` | vacío | — | |
| `notes` | «Ficha hecha solo con los manuales de la matrícula S3240005… confirmar en la placa» | meta | la propia duda |
| `description` | «Envasadora vertical de stick pack para líquidos Schmucker MT1100… matrícula S3240005…» | B | solo manual |
| `searchAliases` (14) | `stick pack`, `stickpack` | A y B | genéricos |
| | `mt1100`, `s3240005`, `schmucker`, `marchesini`, `orugas`, `tubos formadores` | B | manual |
| | `encelofanadora`, `17334008`, `DI`, `724001185`, `724001187`, `724001184` | A | código, cc y las 3 piezas de su plan |
| `technicalData.function`, `.dosingSystem`, `.capsuleSizes` (8 pistas) | formar/llenar/soldar/cortar; jeringas, tanque pulmón; pistas | B | manual (p. citadas) |
| `technicalData.manufacturer`, `.brand`, `.serialNumber`, `.year`, `.voltage`, `.power` | Schmucker (Marchesini Group); S3240005; «2025»; 3×220 V 60 Hz; 14 kW/35 A | B | portada y p. 1 del esquema |
| `technicalData.capacity`, `.weight`, `.dimensions` | «No indicada/o» | neutro | vacíos |
| `summarySpecs` (6) | modelo/matrícula, alimentación, potencia, PLC Beckhoff, jeringas, plan por horas | B | manual |
| `systems` (9) | película y corte; soldadura vertical/horizontal; orugas; enfriamiento; corte del stick; pastillas de silicona; dosificación de líquido; cuadro eléctrico | B | todos con códigos `S3…` y páginas del manual |
| `maintenanceTasks` (12) | H100…H3600 y M12–M24 | B | «Calibrado p.58–105» |
| `failureModes` | vacío | — | |
| `documents` (3) | los 3 PDF de `manuales/stickpack/` | B (por las portadas) | ver sección 1 |

Resumen: **identidad (A)** = id, código, ubicación, centro de costo, parte del nombre, aliases de código/cc/piezas. **Contenido técnico (B)** = todo lo que sale de los manuales. **De la MS235 (C): nada**, según el contenido. La ficha `ms235` ya tiene su propio juego de manuales (`S4220003`).

## 3. Propuesta de reparto (NO ejecutada; espera confirmación)

**Si se confirma que la serie `S3240005` es del MT-1100 de Sede 4 (lo que dicen los PDF):**
1. **MT-1100 → `17334018`:** crear la ficha rica con id `eq-17334018` (hoy solo tiene la ficha básica automática, sin documentos) y pasarle: `model`, `manual`, `maintenance`, `description`, `technicalData` (marca, serie, potencia…), `summarySpecs`, `systems`, `maintenanceTasks`, `documents` y los aliases `mt1100`, `s3240005`, `schmucker`, `marchesini`, `orugas`, `tubos formadores`. Los PDF pasan de `manuales/stickpack/` a `manuales/mt1100/` (renombrar rutas en `documents`).
2. **17334008 queda para el Stick Pack #1 retirado:** conserva `id`, `equipoCod`, `location`, `causaCod/causaDesc` y los aliases `17334008`, `DI`, `724001185/187/184`; pierde el contenido del MT1100, queda con ficha mínima y **oculta** (hoy #67 oculta solo las fichas generadas del registro; esta es una ficha escrita a mano y seguiría visible: haría falta filtrarla por `retirado`). `status` pasa a «Fuera del listado».
3. **MS235 (`ms235`):** no se le agrega nada (la ficha no contiene datos suyos).
4. **Antes de pasar los datos:** el campo `area` («Líquidos») y el `cc` del MT-1100 («sólidos») chocan; hay que decidir cuál es cierto.

**Si el usuario confirma lo contrario (que `S3240005` es la MS235):** los PDF tendrían portadas equivocadas y la ficha `ms235` ya tiene serie `S4220003`; antes de mover nada habría que leer la placa de la MS235 y comparar los dos juegos de manuales. No lo propongo sin esa evidencia.

**Orden sugerido, un PR por paso y todos en borrador:** (a) verificar placas; (b) crear ficha `eq-17334018` copiando (no moviendo); (c) vaciar y ocultar `eq-17334008`; (d) mover PDF y rutas. Ningún dato se borra: el paso (c) deja el historial en git.

## 4. Preguntas para el usuario
1. ¿Qué dice la placa del MT-1100 de Sede 4? ¿Trae `S3240005`?
2. ¿Qué serie dice la placa de la MS235? (el repositorio la tiene como `S4220003`)
3. ¿El MT-1100 de Sede 4 envasa sólidos o líquidos? El registro dice «sólidos», la ficha y los manuales hablan de dosificación de líquidos con jeringa.
4. ¿Confirmas el reparto de la sección 3 (MT-1100 → `17334018`; `17334008` queda mínima y oculta)?
5. ¿Los PDF de la raíz del repositorio (copias idénticas, ignoradas por `.gitignore` pero ya versionadas) se quedan, o se retiran en otro PR?
