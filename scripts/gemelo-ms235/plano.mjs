// Posiciones de la planta del esquema electrico ES4220003 (hojas B01-B03) en el
// mundo del modelo. El cableado lo saco un agente del PDF (cableado-ms235.json).
//
// La planta esta dibujada con el frente arriba, vista desde encima: la izquierda del
// operador queda a la derecha de la hoja. El modelo usa la x de la hoja tal cual, asi
// que es el ESPEJO de la maquina real; las vistas lo espejan al mostrarlo.
// Calibrado con las planchas (B40.1 / B40.2), los resguardos (S08.3 / S08.4) y la bobina:
// 1 pt de la hoja = 1,275 unidades (5,1 mm); x = 0 en la soldadura, y = 0 en la pared.
import { readFileSync } from "node:fs";

export const CABLEADO = JSON.parse(readFileSync(new URL("./cableado-ms235.json", import.meta.url), "utf8"));
const K = 1.275;
export const desdePlano = (px, py) => [+((px - 363) * K).toFixed(1), +((288 - py) * K).toFixed(1)];
export const POS = {};
for (const p of CABLEADO.posiciones) {
  if (p.pagina === 47 || POS[p.tag]) continue;
  const d = p.pagina === 44 ? 0.36 : 0; // la hoja B01 esta corrida -0,36 pt respecto a B02/B03
  POS[p.tag] = desdePlano(p.x + d, p.y + d);
}
// En planta: [x, y] del modelo; con z, el punto 3D.
export const en = (tag, z) => (POS[tag] ? [POS[tag][0], POS[tag][1], z] : null);
