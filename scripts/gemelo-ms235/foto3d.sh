#!/bin/sh
# foto3d.sh <ruta-y-query> <salida.png> [ancho alto]  — captura con WebGL por software
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
W=${3:-1600}; H=${4:-1000}
mkdir -p salida/fotos
OUT=$(cygpath -w "$(pwd)/salida/fotos/$2")
"$CH" --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --virtual-time-budget=60000 --window-size=$W,$H --screenshot="$OUT" "http://localhost:8766/$1" 2>/dev/null
echo "$OUT"
