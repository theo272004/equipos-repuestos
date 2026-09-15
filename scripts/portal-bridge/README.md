# Puente MiPortal → app de equipos y repuestos

Trae las **existencias reales de almacén** desde MiPortal hasta la app, para que
la tabla de repuestos deje de mostrar la foto vieja del Excel.

## Por qué existe este puente

La app no puede preguntarle al portal directamente. Dos motivos, y ninguno tiene
arreglo desde el código de la página:

1. La app se sirve por **HTTPS** (GitHub Pages) y el portal es **HTTP**
   (`http://miportal:9010`). El navegador bloquea esa llamada por contenido
   mixto, sin excepción posible.
2. Aunque fuera HTTPS, el portal **no envía cabeceras CORS**, así que el
   navegador tampoco dejaría leer la respuesta.

Y GitHub Actions tampoco sirve: corre en la nube de GitHub, donde `miportal` no
existe. La única máquina que ve el portal **y** puede salir a internet es un PC
de la planta. Ahí vive este puente: entra al portal, baja el Excel y **empuja**
los datos a Firestore. La app lee de Firestore, como ya hace con las tareas.

```
PC de planta                     nube                    cualquier navegador
┌──────────────┐          ┌───────────────┐            ┌──────────────────┐
│ MiPortal ────┼── baja ──│  este puente  │── sube ───▶│    Firestore     │
│  (intranet)  │  el xlsx └───────────────┘            │   "inventario"   │
└──────────────┘                                       └────────┬─────────┘
                                                                │ lee
                                                       ┌────────▼─────────┐
                                                       │  la app (Pages)  │
                                                       └──────────────────┘
```

## Instalación (una sola vez, en el PC de planta)

Hace falta [Node.js 18 o superior](https://nodejs.org).

```bash
cd scripts/portal-bridge
npm install
npx playwright install chromium

cp .env.example .env                              # credenciales del portal
cp portal.config.example.json portal.config.json  # URLs del portal
```

Edita `.env` con el usuario y la contraseña. **Pide a sistemas un usuario de
solo lectura**: este puente únicamente consulta y descarga, nunca escribe en
MiPortal. `.env` está en `.gitignore` y no se sube al repositorio.

## Ponerlo en marcha

El orden recomendado es de menos a más automático. Cada paso deja el siguiente
más fácil.

### Paso 1 — comprobar que el Excel se entiende

Baja el reporte de inventario a mano, como haces siempre, y pásaselo:

```bash
node bridge.mjs --archivo ~/Descargas/inventario.xlsx --columnas
```

No sube nada. Solo dice qué hoja eligió, en qué fila encontró la cabecera y qué
columna entendió como cada cosa. Si algo no cuadra, se corrige en
`portal.config.json → excel.columnas`.

### Paso 2 — subir de verdad

```bash
node bridge.mjs --archivo ~/Descargas/inventario.xlsx --dry-run   # ensayo
node bridge.mjs --archivo ~/Descargas/inventario.xlsx             # va en serio
```

Con esto la app ya muestra existencias frescas. **Aquí ya es útil**, aunque el
portal todavía no esté automatizado.

### Paso 3 — que entre solo al portal

```bash
node bridge.mjs --explorar
```

Abre un navegador visible. Entras tú, vas al reporte y lo exportas; el puente
captura el archivo y sigue solo. Al terminar deja en `salida/urls-visitadas.txt`
las direcciones por las que pasaste: la del login va en `portal.loginUrl` y la
del reporte en `portal.reporteUrl`.

Con esas dos puestas, prueba el ciclo entero sin tocar nada:

```bash
node bridge.mjs
```

### Paso 4 — dejarlo solo

Cuando el paso 3 funcione, programa `node bridge.mjs` una vez al día.

**Windows** (Programador de tareas): acción `node`, argumentos `bridge.mjs`,
iniciar en la carpeta de `portal-bridge`.

**Linux** (`crontab -e`), todos los días a las 6:00:

```
0 6 * * * cd /ruta/a/scripts/portal-bridge && /usr/bin/node bridge.mjs >> salida/cron.log 2>&1
```

## Modos

| Comando | Qué hace |
|---|---|
| `node bridge.mjs` | Ciclo completo y automático. El del cron. |
| `node bridge.mjs --explorar` | Navegador visible: entras tú y bajas el reporte. |
| `node bridge.mjs --archivo x.xlsx` | Salta el portal y usa un Excel que ya tienes. |
| `node bridge.mjs --columnas` | Dice qué columnas entendió y no sube nada. |
| `node bridge.mjs --dry-run` | Hace todo menos escribir en Firestore. |
| `npm test` | Comprueba el lector de Excel sin tocar el portal. |

## Cómo adivina las columnas

No se fía de los títulos. Cada reporte los escribe a su manera (`EXISTENCIA`,
`SALDO`, `CANT. DISPONIBLE`...), la cabecera no siempre está en la primera fila
y a veces el reporte viene en la segunda hoja.

Lo que hace es mirar **el contenido**: la columna del código interno es la que
más valores tiene en común con los códigos que el plan ya conoce
(`assets/equipos.js`). Eso no se puede falsear con un título raro, y es lo que
hace que el puente aguante si mañana el portal renombra una columna.

También entiende los números en formato colombiano (`1.234,50`), suma las
existencias cuando un mismo código aparece repetido en varios almacenes, e
ignora las filas de subtotal que no llevan código.

Si aun así se equivoca, en `portal.config.json → excel.columnas` se fija a mano
y lo escrito ahí manda.

## De dónde sale cada existencia

En la app manda este orden:

1. **Lo escrito a mano** en la tabla → colección `datos`. **Gana siempre.**
2. **Lo que dice el portal** → colección `inventario`, que llena este puente.
3. **Lo que traía el Excel** del plan → `assets/equipos.js`.

El puente **nunca escribe en `datos`**. Si un técnico cuenta las piezas en el
estante y corrige el número, esa corrección sobrevive a todas las pasadas
siguientes. Cada casilla de la app muestra de dónde salió su número
(`mano` / `portal` / `excel`), porque una cifra de almacén sin saber de cuándo
es no sirve para decidir si hay que pedir una pieza.

## Cuando algo falla

El puente corre solo, así que cuando falla guarda en `salida/` una captura y el
HTML de la página donde se quedó. Eso suele bastar para ver qué pasó: una clave
vencida, un aviso nuevo del portal, una pantalla que cambió de sitio.

También deja `salida/ultimo-informe.json` con las columnas que entendió y qué
existencias se movieron respecto a la pasada anterior.

| Mensaje | Qué suele ser |
|---|---|
| `Se quedó en la página de login` | Usuario o clave mal, o el portal pide algo más (clave vencida, segundo factor). Mira la captura. |
| `No encontré el campo de usuario` | El login cambió. Saca el selector con `--explorar` y ponlo en `portal.selectores`. |
| `no la columna de existencias` | El reporte no trae existencias, o se llama de forma nueva. Mira `--columnas`. |
| `ni uno solo coincide con los códigos` | Casi siempre es otro reporte del portal, no el de inventario. |

## Lo que este puente NO hace

- **No escribe en MiPortal.** Solo lee y descarga. No crea requisiciones.
- **No toca Integra/Inabler.** Ese es el sistema donde se registran las cosas y
  es harina de otro costal; si algún día hace falta, se añade aparte.
- **No guarda credenciales en el repositorio.** Viven en `.env`, en ese PC.
