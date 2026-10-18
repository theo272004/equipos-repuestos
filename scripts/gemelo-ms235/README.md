# Gemelo virtual de la MS235

La ensobradora Schmucker MS235 (S4220003) pieza por pieza, en dos páginas:

- `gemelo-ms235.html`: visor 3D (three.js) con navegación tipo CAD, simulación del
  ciclo con física (cannon-es), desarme por conjuntos, corte de sección, medida,
  seguimiento de cableado y el armario eléctrico por dentro.
- `gemelo-ms235-lamina.html`: lámina isométrica ligera hecha con el kit
  [Anatomy](https://github.com/wheresryan22/anatomy) (MIT, copiado en `kit/`), con 8 vistas.

Las dos comparten el panel con los datos de la app: láminas del catálogo,
procedimientos, sensores, repuestos, fallas, tareas, historial del chat y el
cableado del esquema ES4220003.

## Archivos

| Archivo | Qué hace |
|---|---|
| `piezas.mjs` | Los 17 conjuntos: nombre, códigos del catálogo, descripción y hacia dónde salen al desarmar. `DESARME` es el orden de salida. |
| `modelo.mjs` | La geometría, en unidades de 4 mm. Usa las coordenadas de la planta del esquema (x a la derecha de la hoja, y hacia el frente, z arriba; la pared en y = 0). Cada pieza lleva su material real (`mat`) para el 3D. |
| `plano.mjs` | Pasa las posiciones de la planta del esquema (hojas B01–B03) a coordenadas del modelo. |
| `cableado-ms235.json` | Lo leído del esquema ES4220003: dispositivos, hilos, bornes X06, módulos del PLC, conectores y posiciones. Ver `cableado-LEEME.md`. |
| `clasificar.mjs` | A qué conjunto va cada intervención del chat. La página usa la misma función para leer `mtto-data.js` en vivo. |
| `datos.mjs` | Saca de la app los grupos, sensores, repuestos, fallas, tareas, historial y el resumen de cableado (`salida/datos-ms235.json`). |
| `build.mjs` | `salida/escena.json` para el 3D y una vista SVG por ángulo para la lámina, con el orden de pintado de `kit/audit.mjs`. |
| `pagina.mjs` | Arma las dos páginas con `web/comun.js` (panel), `web/visor3d.js` o `web/lamina.js`, y sus CSS. |
| `ciclos.mjs` | Lista las piezas que se cruzan en una vista (armada, desarmando o con los resortes del desarme). |
| `contactos.mjs` | Auditoría de montaje: piezas que no tocan a ninguna otra y tornillos que no asientan en su pieza. |
| `foto.sh`, `foto3d.sh` | Capturas con Chrome sin ventana (la 3D con WebGL por software) para revisar y para la portada. |

## Reconstruir

Desde la raíz del repo:

```
node scripts/gemelo-ms235/datos.mjs .
node scripts/gemelo-ms235/build.mjs
node scripts/gemelo-ms235/pagina.mjs --repo .
```

Antes de publicar: `node contactos.mjs` debe dar 0 flotantes y 0 tornillos sin
asiento, y `node ciclos.mjs <azimut> --desarme` 0 ciclos.

## Cómo está hecho el 3D

- **Espejo.** La planta del esquema se pasa a three.js cambiando y por z, y eso invierte la
  mano. La raíz de la escena va con `scale.x = -1` y la máquina queda como la real: cinta, HMI
  y armario a la izquierda del operador.
- **Simulación.** Ángulo de máquina con dos anclas reales: cierre de planchas a 30° (Calibrado
  p.20) y cuchilla rotativa de una vuelta por ciclo (p.23). Las demás ventanas son
  aproximadas. La presión de las planchas la dan los tirantes con resorte del bastidor de levas
  (detrás de la pared, Calibrado p.70-73), que mueven las cuñas sobre cada mordaza. El cilindro con
  fuelle de cada lado (Y40.6/Y40.7) las habilita y separa.
  Las pinzas bajan la fila, la sueltan sobre el deslizadero (S52.9) y la cinta, que corre por
  debajo del corte, la saca bajo los láser B52. Cada tornillo se mueve con su pieza.
- **Cableado.** Del dispositivo a sus conectores, por la canaleta de la caja de transmisión y
  la bandeja al armario, a la regleta y al módulo. Los extremos son los del esquema; el camino
  entre ellos es orientativo.

## Enlaces directos

`gemelo-ms235.html?pieza=soldadura&pestana=historial`, `?sensor=B40.1`,
`?disp=M30.1` (sigue el cable y abre el armario), `?armario=1`, `?cables=1`,
`?vista=atras`, `?paso=16` (desarmada), `?calor=1`, `?angulo=200`, `?sim=1`.

## Lo que salió de las fotos del 2026-10-15

- Cabezal del dosificador: cubierta de inox escalonada que asoma por encima del techo del
  resguardo, con cuatro Harting delante (dos con clavija y cable, dos tapados) y la placa
  Schmucker. Encima, la tolva rectangular con mirilla, tapa con cierres, sensores de nivel B35 y la
  manga de tela de la carga de polvo. Antes era una tolva cónica dentro del resguardo.
- Columna luminosa H16.2 / H16.3 / H16.4 con el avisador H16.6 (hoja B04) sobre el brazo del
  panel; pulsadores negro, blanco y azul.
- Capota de la mordaza con dos columnas de cinco lamas y tirador en T verde; tiradores verdes en
  las puertas del resguardo.
- Lateral izquierdo: gabinete gris con ventanas sobre la isla de válvulas y el regulador, y la
  ventanilla de los tres manómetros. El interruptor general Q01.3 es una maneta negra en la cara
  delantera del armario, con la etiqueta de la máquina.
- Lateral derecho: puerta de inox con asa, juntas negras y porta-documentos.
- La cinta de salida es lisa (sin guías de carril) y el resguardo lleva franja amarilla y negra
  sobre la salida.
- Al desarmar, los resguardos salen hacia el operador (por debajo de la tolva).

Dudas que dejan las fotos: el tambor de inox con la etiqueta "horario / antihorario" en lo alto
del lado izquierdo (probable soporte del dosificador S4A71100310), la rueda negra de radios bajo
la soldadura, la toma de aire con dos válvulas rojas junto al portabobinas, y si el portabobinas
de abajo es solo una cuna en V. Las fotos se guardan fuera del repo (`fotos-reales/`).

## Incorporado tras la auditoría contra el catálogo (2026-10-17)

Solo se citan códigos que están en `ms235-mecanico.js`.

- **Correa del motor principal (`S4A12100110`)**: brida `07920036`, polea inferior `07910121`, correa dentada `C262360100` y polea superior `09319R053`, coaxial con el volante.
- **Estrella doble de dosificación (`S4G72200210`)**: cuerpo `S4G72200211`, dos árboles `M2G72200264` con poleas y correas `C26Q050700` / `C26Q051270` desde los motorreductores `M34.1` / `M34A.1`.
- **Soporte y mando mecánico del dosificador (`S4A71100310`)**: columna, brazo, excéntrica `2A71100141` y bielas con rótulas `M2A71102712` (`0703R003`). **La posición en la máquina no se conoce: está puesta a ojo.**
- **Cajón del corte horizontal (`S4A19100720`)**: bloques `03520R037` / `03520R038`, puente frontal `07P00029` y colectores `09321R077` / `03521R077`. Las excéntricas de regulación entre cuchillas están dibujadas, pero su código no está confirmado en el catálogo.
- **Marcos de rodillos color crema (`S4A27100110`: `2M17100212` / `2M17100213`)** y escuadra graduada de la fotocélula (`M2M95100511`: disco `035050315`, escuadra `32940121`).
- `node contactos.mjs`: 1.846 piezas, 0 flotantes, 841 tornillos, 0 sin asiento.

## Pendiente

- Esquema neumático (el usuario lo va a conseguir): las mangueras dibujadas son las de los cilindros de cierre (`Y40.6`/`Y40.7`), y el resto de válvulas solo lleva su señal eléctrica.

## Lo que es y lo que no

El modelo sale del catálogo de piezas, de la planta y la disposición del armario del
esquema eléctrico y de fotos de la máquina. Es fiel a los conjuntos, a su posición y a su
función, pero no a la cota exacta. Falta el esquema neumático: las mangueras dibujadas son
las de los cilindros de cierre, y el resto de válvulas solo tiene su señal. La asignación de
los grupos A11, A90 y A92 está por confirmar en el catálogo.
