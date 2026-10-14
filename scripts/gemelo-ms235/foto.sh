#!/bin/sh
# foto.sh <ruta-y-query> <salida.png> [ancho alto]   (ej: "preview-0.html#d=1" o "index.html?pieza=soldadura")
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
W=${3:-1600}; H=${4:-1000}
mkdir -p salida/fotos
OUT=$(cygpath -w "$(pwd)/salida/fotos/$2")
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=6000 --window-size=$W,$H --screenshot="$OUT" "http://localhost:8766/$1" 2>/dev/null
echo "$OUT"
