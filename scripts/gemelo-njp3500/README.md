# Gemelo 3D de la NJP-3500

La encapsuladora NJP-3500 (Canaan Kaixinlong, equipo 17333009) por conjuntos, en
`gemelo-njp3500.html`: visor 3D (three.js) con navegación tipo CAD, selección por conjunto y
por pieza, desarme paso a paso, vista por dentro y, en cada conjunto, sus páginas del manual
del fabricante. La pestaña **Gemelo 3D** de la ficha lo muestra en un iframe
(`assets/js/gemelo-3d.js`, registro `GEMELOS`).

Usa el mismo pipeline que la MS235: las formas del kit de Anatomy
(`../gemelo-ms235/kit/`: `audit.mjs`, `lathe.mjs`, `iso-kit.mjs`), la misma escena JSON y
la misma auditoría de montaje, más una prueba de contacto real.

## Archivos

| Archivo | Qué hace |
|---|---|
| `piezas.mjs` | Los 15 conjuntos: nombre, descripción, páginas del manual y hacia dónde salen al desarmar. `DESARME` es el orden de salida. |
| `modelo.mjs` | La geometría, en milímetros (x a la derecha del operador, y hacia el operador, z arriba). Cada pieza lleva su material real. |
| `contactos.mjs` | Auditoría de montaje (ver abajo). |
| `build.mjs` | `assets/gemelo/njp3500/escena.json`, con el resultado de la auditoría dentro. |
| `paginas.py` | Pasa a JPG las páginas del PDF que cita cada conjunto (`assets/gemelo/njp3500/manual/`). |
| `pagina.mjs` | Arma `gemelo-njp3500.html` con `web/visor.css` y `web/visor.js`. |
| `foto3d.sh` | Captura con Chrome sin ventana (WebGL por software) para revisar. |

## Reconstruir

Desde esta carpeta:

```
python -I paginas.py
node build.mjs
node pagina.mjs
```

`node contactos.mjs` debe dar 0 en todo: flotantes, tornillos sin asiento, sueltas, fuera del
montaje, tornillos separados de su cara y choques entre conjuntos. Hoy: 364 piezas, 196
tornillos, todo en 0.

## La auditoría

1. **Como la MS235**: piezas cuya caja no toca la de ninguna otra y tornillos que no caen en
   la pieza que los lleva.
2. **Contacto real**: se muestrea la superficie de cada pieza y se mide la distancia a las
   vecinas con el sdf del kit. Sin un punto a menos de 1,5 mm de otra pieza, está suelta. Desde
   el suelo, por contactos reales, se tiene que llegar a todas las piezas.
3. **Choques entre conjuntos**: ninguna pieza puede meterse más de 2 mm en una de otro
   conjunto. Por eso las chapas y vidrios entre columnas siguen el arco de la columna, y las
   columnas del llenado y las mangueras que cruzan la mesa están cortadas en la mesa con
   casquillo o pasamuros.

## Enlaces directos

`?pieza=dosificacion`, `?paso=14` (desarmada), `?dentro=1` (carcasa transparente),
`?vista=frente|derecha|izquierda|atras|arriba|iso`, `?panel=0`, `?embed=1`,
`?cam=x,y,z,tx,ty,tz` (mm del modelo). El servidor local (`npx serve`) quita el `.html` y con
él la consulta: en local se usa `gemelo-njp3500?…`. Desde la ficha, los atajos llegan al visor
por `postMessage` y no dependen de la URL.

## De dónde sale cada cota

Fuentes, todas de esta máquina: foto `njp3500.png`, manual del fabricante
`manuales/njp3500/NJP3500-manual-fabricante.pdf` (las páginas citadas son las del PDF; la
impresa es 4 menos) y la ficha comercial que resume la app.

- **Cuerpo 1435 × 1248 × 1960 mm**: ficha comercial (sin el brazo del HMI). El manual (p.24)
  da 1555 × 1165 × 2040 mm para la máquina completa. La foto, medida a 6,5 mm/px, confirma el
  alto con el ancho de 1435.
- **Alturas** (foto): mesa a 880 mm (el filo claro entre cuerpo y ventana), ventana hasta
  1845, techo de ~95 mm, zócalo y patas niveladoras abajo. Baliza de tres colores en la
  esquina delantera izquierda del techo. HMI de unos 440 × 460 mm, a ~130 mm del costado
  derecho, entre 1380 y 1840 mm, en un brazo blanco que sale del cuerpo.
- **Esquinas redondeadas** (foto): columnas de Ø150 mm en las esquinas; la ventana llega casi
  al canto.
- **Planta** (p.33, plano de la línea): plato de estaciones a la izquierda del centro y disco
  dosificador a la derecha, con el disco pasando bajo el plato (centros a 500 mm). Carga de
  cápsulas al frente izquierda, bajo la tolva de cápsulas; el canal de salida sale por el
  lateral izquierdo (la repisa de la foto).
- **Plato** (p.55): 12 estaciones, molde superior e inferior de dos filas de alojamientos,
  holgura entre moldes 0,2-0,3 mm. **25 alojamientos por segmento** (p.24).
- **Carga** (p.44, p.120): caja con tubos de carga, corredera orientadora, peine, balancín
  superior y tirantes hasta las levas; dos grupos de carga que trabajan a la vez (p.120).
- **Vacío** (p.52, p.50): asiento de succión bajo el molde con 1,8-2,5 mm de holgura en reposo.
- **Llenado** (p.59, p.64, p.116): base con tres bloques de ajuste, plato de cobre, disco
  dosificador con seis grupos de alojamientos, tapa de presión con 3 M12 (p.115), rascadores,
  bloqueador de polvo, placa de posicionado con muesca para el plato, cinco módulos con sus
  pomos encima y los punzones debajo, y dos columnas guía.
- **Tolva de polvo y caja del motor** (p.92, p.67): motor y reductor en la caja de arriba,
  agitador, sinfín, columna de elevación con resorte y detector capacitivo a 18-28 mm del disco.
- **Rechazo, cierre, descarga y limpieza** (p.72, p.75, p.78, p.90): cámara de aire arriba y
  agujas abajo; placa superior y punzones de cierre; agujas de expulsión y canal de salida;
  soplado arriba y aspiración abajo, con su manguera al colector.
- **Transmisión** (p.81-83, p.115, p.127-128): motorreductor SEW R57DRS112M4 (verde como en la
  lámina), cadena con tensor, árbol de cinco levas, dos divisores de levas (RU180DF bajo el
  plato y RU140DF bajo el disco) y volante en el eje trasero del motor.
- **HMI** (p.30, p.127): Siemens SMART 1000 IE V3 de 10"; los botones de la pantalla son los de
  la foto del manual.

## Lo que no se sabe (está puesto a criterio y se dice aquí)

- Las cotas internas: el manual no trae planos acotados. Las posiciones salen de la planta
  (p.33) y de las láminas, que no están a escala.
- La forma real de los segmentos, de la caja de carga y de los dispositivos de cada estación:
  son bloques con las piezas que nombra cada lámina, no la pieza mecanizada.
- Qué estación queda en cada ángulo del plato fuera de la carga, el llenado y la descarga: se
  repartieron en el sentido de giro de la planta (carga → llenado → rechazo → cierre →
  descarga → limpieza).
- **Las bielas bajo la mesa son esquemáticas**: el manual nombra cinco levas (alimentación,
  succión, dosificación, descarga y cierre, p.81-82) pero no cómo llega cada una a su estación.
  El balancín del rechazo se dibujó desde la leva de dosificación porque ninguna se llama de
  rechazo.
- El enlace del divisor del disco (RU140DF) con el árbol no está en el manual: el divisor está
  dibujado pero sin su transmisión.
- La caja del motor de la tolva de polvo: en la vista general (p.27) asoma sobre el techo, pero
  en la foto el techo está limpio; se dibujó por dentro, detrás de la tolva.
- Los tiradores negros de las puertas salen de la vista general (p.27); en la foto no se ven.
- El armario eléctrico, la bomba de vacío SK y el colector de polvo van fuera de la máquina
  (p.33): solo están las tomas en la pared trasera.
- La placa "NJP-3500" del techo: en la foto hay una placa ahí, pero no se lee qué dice.
