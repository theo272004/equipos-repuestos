# MCP de la app de mantenimiento

Servidor [MCP](https://modelcontextprotocol.io) para consultar y anotar en la app de mantenimiento desde Claude (o cualquier cliente MCP) conversando: *«¿qué equipo falla más este mes?»*, *«¿qué repuestos toca pedir?»*, *«anota que a la Blister 5 hay que cambiarle la banda del troquel»*.

Es un servicio en línea (HTTP) que lee lo mismo que la app: los datos del repositorio (plan, compras, reportes del chat) y Firestore (registros, tareas, pendientes, inventario, cambios). Las reglas (estado de compra, cuándo pedir, próximo cambio de cada pieza) son **las mismas de la app**: se ejecuta su propio `compras.js` y `cambios-piezas.js`.

## Herramientas

**Lectura**

| Herramienta | Para qué |
|---|---|
| `resumen_planta` | Panorama: estados, paradas, pendientes, personal en turno, compras |
| `equipos_a_atacar` | Ranking de fallas del periodo (el del Inicio de la app) |
| `buscar_equipo`, `plan_mantenimiento` | Ficha y plan de un equipo |
| `cambios_de_piezas` | Último cambio y próximo de cada familia de piezas |
| `historial_equipo`, `novedades` | Novedades del registro |
| `pendientes` | Pendientes abiertos |
| `buscar_repuesto` | Almacén: existencias, ubicación, compra, dónde se usa |
| `estado_compra`, `repuestos_por_llegar`, `por_pedir` | Compras |
| `personal_en_turno` | Quién está de turno |
| `mantenimientos` | Mantenimientos e inspecciones detalladas (qué se hizo, pendientes, fotos) |
| `reportes_turno` | Reportes de turno completos del chat y de la app |
| `centro_costo_equipo` | Centro de costo oficial (DMM-229 / RE355) por equipo o máquina |

**Escritura** (todas piden `confirmar: true`; sin eso solo devuelven una vista previa y no guardan nada)

| Herramienta | Escribe en |
|---|---|
| `anotar_pendiente` | `seguimiento` |
| `actualizar_pendiente` | `seguimiento` (+ `tareas` si es una tarea) |
| `anotar_novedad` | `mtto_registros` |
| `registrar_cambio_pieza` | `cambios` |
| `anotar_mantenimiento` | `inspecciones` (mantenimiento detallado + pendientes + fotos) |
| `actualizar_mantenimiento` | `inspecciones` (cerrar, anexar notas, hallazgos o fotos) |
| `anotar_tarea` | `tareas` |
| `preparar_ot_mecanizado` | `seguimiento` + `tareas` (arma OT lista para Fracttal con centro de costo) |

Cada escritura queda a nombre de la persona dueña de la llave (`por`, `creadoPor`, `quien`, `src: "mcp"`).

## Seguridad

- **Una llave por persona**: `MCP_TOKENS="ana:<llave>,luis:<llave>"` (llaves de 16+ caracteres al azar: `openssl rand -hex 24`). El servicio **no arranca sin llaves**. Para quitarle el acceso a alguien se borra su llave y se reinicia.
- La llave va en el encabezado `Authorization: Bearer <llave>` o, para clientes que no permiten encabezados, en la ruta `/t/<llave>/mcp`. Con la ruta, la llave puede quedar en registros de acceso del hosting: úsalo solo si no hay otra opción.
- Límite de 60 consultas por minuto por persona (`MCP_LIMITE_MINUTO`), cuerpo máximo de 1 MB.
- Las reglas de Firestore de la app están abiertas (sin sesión), así que **quien tenga la llave del MCP puede escribir lo mismo que cualquiera con la página**. Si activan la «clave del taller» (`docs/firestore-con-clave.rules`), definan también `FIREBASE_EMAIL` y `FIREBASE_PASSWORD` en el servicio.
- Las herramientas de escritura solo agregan o actualizan; **no hay ninguna que borre**.

## Variables de entorno

| Variable | Qué es |
|---|---|
| `MCP_TOKENS` | `nombre:llave,…` (obligatoria) |
| `PORT` | Puerto (por defecto 8787; la imagen usa 8080) |
| `DATA_BASE_URL` | De dónde leer los datos del repositorio (por defecto el sitio de GitHub Pages) |
| `FIREBASE_EMAIL`, `FIREBASE_PASSWORD` | Solo si Firestore exige la clave del taller |
| `FIREBASE_PROJECT`, `FIREBASE_API_KEY` | Por defecto, los de la app |
| `TTL_COLECCION_S` (120), `TTL_INVENTARIO_S` (43200), `TTL_CODIGO_S` (60), `TTL_REPO_S` (600) | Cuánto se guardan las lecturas para cuidar la cuota diaria de Firebase |
| `MCP_SIN_AUTENTICACION=1` | Solo para probar en local |

**Cuota de Firebase:** el inventario completo (~5.500 documentos) se lee como mucho cada 12 horas; lo demás se guarda 2 minutos. Con uso normal queda muy por debajo del límite gratuito (50.000 lecturas al día).

**Datos del repositorio:** salen del sitio publicado, así que lo que se sube a GitHub Pages (plan, compras, reportes) llega al MCP en unos 10 minutos sin volver a desplegarlo.

## Probarlo en local

```bash
cd mcp && npm install
npm test                                  # Firestore falso: no toca el de verdad
MCP_TOKENS="yo:una-llave-larga-de-prueba" node server.mjs
# otra terminal
npx @modelcontextprotocol/inspector       # URL: http://localhost:8787/mcp  ·  Header Authorization: Bearer una-llave-larga-de-prueba
```

## Desplegarlo

Cualquier hosting que corra un contenedor o Node 20+. La imagen se construye desde la **raíz** del repositorio:

```bash
docker build -f mcp/Dockerfile -t mantenimiento-mcp .
docker run -p 8080:8080 -e MCP_TOKENS="ana:...,luis:..." mantenimiento-mcp
```

**Google Cloud Run** (el plan gratuito alcanza): construir la imagen desde la raíz y desplegarla.

```bash
gcloud builds submit --tag REGION-docker.pkg.dev/PROYECTO/REPO/mantenimiento-mcp -f mcp/Dockerfile .   # o: docker build + docker push
gcloud run deploy mantenimiento-mcp --image REGION-docker.pkg.dev/PROYECTO/REPO/mantenimiento-mcp \
  --region us-east1 --allow-unauthenticated --set-env-vars "MCP_TOKENS=ana:...,luis:..."
```

(`--allow-unauthenticated` es para que Claude pueda llamarlo; la protección son las llaves.)

**Render / Railway / Fly.io:** servicio Docker apuntando a `mcp/Dockerfile` con contexto en la raíz, variable `MCP_TOKENS`, y `/health` como chequeo de salud.

## Conectarlo en local (sin subirlo a la nube)

### 1. Claude Desktop (recomendado en tu PC — cero servidores)
Usa el transporte local `mcp/stdio.mjs`. En `~/.config/Claude/claude_desktop_config.json` (Linux) o `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "mantenimiento": {
      "command": "node",
      "args": ["/home/mateocastro/Documentos/equipos-repuestos/mcp/stdio.mjs"],
      "env": {
        "MCP_USUARIO": "Mateo Castro",
        "DATA_LOCAL_DIR": "/home/mateocastro/Documentos/equipos-repuestos"
      }
    }
  }
}
```
Reinicia Claude Desktop y ya aparecen las 24 herramientas (lectura + escritura directa en Firestore).

### 2. Claude Code (terminal)
```bash
claude mcp add mantenimiento -- node /home/mateocastro/Documentos/equipos-repuestos/mcp/stdio.mjs
```

### 3. ChatGPT (Web / Móvil) o Claude Web sin subir a ningún hosting
ChatGPT solo acepta conectores MCP por **URL HTTPS** (no ejecuta archivos locales). Si no quieres desplegarlo en un servidor externo, puedes arrancarlo en tu propio PC y abrir un túnel temporal gratis cuando lo vayas a usar:

```bash
# Terminal 1 (servidor local)
cd mcp && MCP_TOKENS="mateo:tu-llave-secreta-larga" DATA_LOCAL_DIR=".." node server.mjs

# Terminal 2 (túnel HTTPS temporal hacia tu PC, sin cuentas ni hosting)
cloudflared tunnel --url http://localhost:8787
```
Luego en **ChatGPT → Configuración → Conectores (Apps / Developer Mode) → Nuevo MCP** pegas `https://<url-del-tunel>.trycloudflare.com/t/tu-llave-secreta-larga/mcp`.

## Cómo está hecho

`stdio.mjs` (local para Claude Desktop / Claude Code) o `server.mjs` (HTTP con llaves y límite) → `lib/tools.mjs` (24 herramientas con vista previa y confirmación) → `lib/dominio.mjs` (consultas, mantenimientos, reportes y centros de costo) → `lib/repo.mjs` (datos del repositorio ejecutados en un contexto aislado, con `compras.js` y `cambios-piezas.js` de la app) y `lib/nube.mjs` (Firestore con caché; reutiliza `scripts/lib/firestore-rest.mjs` del bot).
