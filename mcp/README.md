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

**Escritura** (todas piden `confirmar: true`; sin eso solo devuelven una vista previa y no guardan nada)

| Herramienta | Escribe en |
|---|---|
| `anotar_pendiente` | `seguimiento` |
| `actualizar_pendiente` | `seguimiento` (+ `tareas` si es una tarea) |
| `anotar_novedad` | `mtto_registros` |
| `registrar_cambio_pieza` | `cambios` |

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

## Conectarlo

- **Claude (web/escritorio)** → Configuración → Conectores → *Agregar conector personalizado* → URL `https://TU-SERVICIO/mcp`. Si el cliente no deja poner encabezados, usa `https://TU-SERVICIO/t/<llave>/mcp`.
- **Claude Code:** `claude mcp add --transport http mantenimiento https://TU-SERVICIO/mcp --header "Authorization: Bearer <llave>"`

## Cómo está hecho

`server.mjs` (HTTP, llaves, límite) → `lib/tools.mjs` (herramientas y confirmación) → `lib/dominio.mjs` (consultas) → `lib/repo.mjs` (datos del repositorio ejecutados en un contexto aislado, con `compras.js` y `cambios-piezas.js` de la app) y `lib/nube.mjs` (Firestore con caché; reutiliza `scripts/lib/firestore-rest.mjs` del bot). Sin sesiones: cada petición se atiende sola, así que reiniciar el servicio no pierde nada.
