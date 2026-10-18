#!/bin/sh
# foto3d.sh "<query>" <salida.png> [ancho alto] — captura del visor con WebGL por software.
# Necesita el servidor del repo en el puerto 4337 (npx serve -l 4337 .).
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
W=${3:-1600}; H=${4:-1100}
AQUI=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$AQUI/salida"
OUT=$(cygpath -w "$AQUI/salida/$2")
"$CH" --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --virtual-time-budget=30000 --window-size=$W,$H --screenshot="$OUT" "http://localhost:4337/gemelo-njp3500?$1" 2>/dev/null
echo "$OUT"
