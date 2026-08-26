// Pone una versión nueva a los archivos de estilos y de código que carga index.html.
//
// Por qué hace falta: GitHub Pages sirve todo con Cache-Control: max-age=600, así
// que durante diez minutos el navegador sigue usando la copia vieja. Eso tiene dos
// consecuencias molestas: los cambios no se ven al momento, y —lo peor— puede
// mezclarse el index.html nuevo con un JavaScript viejo, que fue justo lo que dejó
// el sitio en blanco cuando se partió el archivo en módulos.
//
// Añadiendo ?v=<marca> a cada archivo, un index.html nuevo pide direcciones nuevas
// y arrastra consigo sus estilos y su código. Van siempre en el mismo juego.
//
// Uso:  node scripts/bump-assets.mjs        (antes de confirmar cambios en assets/)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const archivo = join(raiz, "index.html");

const ahora = new Date();
const p = (n, d = 2) => String(n).padStart(d, "0");
const version = `${ahora.getUTCFullYear()}${p(ahora.getUTCMonth() + 1)}${p(ahora.getUTCDate())}${p(ahora.getUTCHours())}${p(ahora.getUTCMinutes())}`;

let html = readFileSync(archivo, "utf8");
let tocados = 0;

// Solo los archivos propios: lo de fuera (Firebase) no se toca.
html = html.replace(
  /((?:src|href)=")(assets\/[^"?]+)(?:\?v=\d+)?(")/g,
  (_, antes, ruta, despues) => {
    tocados++;
    return `${antes}${ruta}?v=${version}${despues}`;
  }
);

writeFileSync(archivo, html);
console.log(`Versión ${version} aplicada a ${tocados} archivos de assets/`);
