# Cableado MS235: datos para el gemelo 3D

`cableado-ms235.json` sale del esquema eléctrico Schmucker **ES4220003 v1.0 (30/03/2023, 97 páginas)**. Para cada dispositivo de campo da el recorrido completo: dispositivo → conector en la máquina (si lo hay) → regleta del armario → tarjeta del PLC o accionamiento. También da la posición del dispositivo en los planos de disposición B01, B02, B03 y B04.

## Cómo se obtuvo

1. **Texto con coordenadas** de las 97 páginas con PyMuPDF (`dump.py`, `index.py`). El PDF repite cada palabra letra por letra; esas letras sueltas se filtran.
2. **Hojas de circuito** (páginas 8 a 42): se leyeron columna por columna. Unas 25 páginas se revisaron además sobre la imagen renderizada: seguridad, motores, resistencias, conectores y todos los casos dudosos. El resultado está en la tabla curada `datos_curados.py`.
3. **Cruces automáticos** (`build.py`):
   - Lista de E/S P01-001 a P08-001 (páginas 48 a 55, `iolist.py`). Las 91 conexiones a tarjetas digitales coinciden hilo por hilo.
   - Hojas de conectores X31 a X53 (páginas 66 a 80), con el pin y el hilo de cada conexión.
   - Lista de materiales Z-ZDIST (páginas 86 a 97, `bom3.py`), de donde salen marca, tipo, código y cables.
4. **Posiciones** (`layout.py`, `bbox.py`):
   - Los puntos de los planos están dibujados como pilas de unas 30 líneas horizontales. Se detectan como tales y se asignan a su etiqueta: siguiendo la línea de referencia cuando existe, o por cercanía cuando no.
   - Cuando varias etiquetas apiladas comparten una sola línea de referencia, el punto aparece dibujado tantas veces como etiquetas tiene. Pasa con R41.1 a R41.1.4, con R41.6 a R41.6.4, con S08.1/S08.5/X51, con B35.1/B35.4 y con B35A.1/B35A.4.
   - El contorno de la máquina se calcula con todos los trazos de cada página, quitando marco, cajetín, etiquetas, líneas de referencia y la nota "componenti pneumatici".
   - Las imágenes de comprobación están en `img/ov44.png`, `img/ov45.png` y `img/ov46.png`. En rojo, la unión etiqueta→punto; en verde, el contorno.

## Cobertura

| tipo | n | con conector en máquina (`caja`) | con tarjeta/accionamiento (`modulo`) | con posición |
|---|---|---|---|---|
| sensor (B y S18.1, S18.5, S42.0, S52.9) | 33 | 9 | 33 | 28 |
| válvula (Y) | 10 | 0 | 10 | 0 |
| motor (M) | 11 | 4 | 9 | 9 |
| seguridad (S07.1, S08.x) | 7 | 0 | 7 | 7 |
| resistencia (R41.x) | 10 | 10 | 10 | 10 |
| otro (H16.x, H40.3, S13.x, A15.4, T22.8, KM44.4) | 12 | 2 | 10 | 10 |
| **total** | **83** | **25** | **79** | **64** |

- **80 de 83** tienen trazado el recorrido hasta la tarjeta del PLC o hasta su accionamiento. Los otros 3 no llevan señal al PLC según el esquema: M02.4 y M02.5 son los ventiladores del armario, y A15.4 es el PC del panel, que se comunica por Ethernet.
- **63** tienen además posición en el plano.
- Confianza del recorrido: 82 alta y 1 media (H40.3, ver lagunas).
- Confianza de la posición: 72 alta y 9 media. Las 4 de B35.x/B35A.x son medias porque hay dos puntos dobles entre cuatro etiquetas. Las 5 de A15.4 y H16.x son medias porque en B04 se da el centro de la etiqueta, no un punto.

## Lagunas conocidas

- **No hay cajas de bornes en la máquina.** X31 y X40 a X53 son conectores enchufables (ILME, Harting, M8/M12, XLR). La mayoría de sensores y todas las válvulas van con cable directo al armario. Por eso `caja = null` es lo que dibuja el esquema, no un dato que falte.
- **X06 no tiene números de borne.** Sus bornes se nombran por potencial:
  - 3 = +24 V entradas
  - 2 = 0 V
  - 1, 4, 6 y 8 = otros +24 V
  
  La señal de cada sensor va directa a la tarjeta A12.x sin pasar por X06. No se puede señalar "el borne" físico concreto de un sensor en X06.
- **Válvulas y componentes neumáticos sin posición.** Son las 10 Y, más B42.1, S18.1, S18.5, S42.0 y S52.9. Los planos B02/B03 remiten al esquema neumático, que no está en este PDF.
- **H40.3 / X51: el esquema se contradice.** La hoja 40 dibuja 0 V en el pin 2 y el hilo 4003 en el pin 1. La hoja X51-001 pone 4003 en el pin 2 y 0 V en el pin 3. Hay que comprobarlo en la máquina.
- **Resistencias:** la lista de materiales no da modelo ni potencia. Qué resistencia corresponde a qué control de corriente K19.x se deduce de los pines de X41/X42.
- **Plano B04:** es la vista frontal del panel de operador, no la planta de la máquina. Los planos de planta no identifican el panel.
- **S13.5:** es la botonera portátil que se enchufa en X40. Su posición queda en null.
- **Armario:** el plano B00 (página 43) solo tiene etiquetas. `posiciones_armario` da el centro de cada etiqueta, no un punto.
- **Números distintos a los esperados:** hay 11 motores M, no 12 (2 son ventiladores del armario), y no existe S08.6.
- **Desplazamiento de B01:** la página 44 está desplazada −0,36 pt respecto de las páginas 45 y 46. `u` y `v` ya están normalizados dentro del contorno de cada página.

## Archivos

- `cableado-ms235.json`: el entregable.
- `datos_curados.py`: tabla revisada a mano.
- `build.py`: arma el JSON y hace los cruces. Se ejecuta con `python -I build.py <pdf> <carpeta>` y necesita antes `iolist.json`, `bom.json`, `layout.json` y `bbox.json`.
- Los demás `.py` sirven para extraer y depurar. `img/` tiene las imágenes de comprobación.
