#!/usr/bin/env python3
"""Lee una hoja de vida de equipos (Excel) y deja sus datos en assets/data/hojas-de-vida.json.

Pensado para 'BD SEDE 4 DMM-199 Hoja de Vidas.xlsm' y 'BASE DE PLANTA 2 DMM-199 Hoja de
Vidas (version 1).xlsb'. Este repositorio NO tiene esos archivos, así que el script no
adivina columnas: se las dices tú en un archivo de mapeo (ver abajo).

Paso 1 · Ver qué trae el Excel (no escribe nada):
  python3 scripts/importar-hoja-vida.py --columnas "ruta/BD SEDE 4 DMM-199 Hoja de Vidas.xlsm"

Paso 2 · Copia scripts/hoja-vida.mapeo.ejemplo.json como scripts/hoja-vida.mapeo.json y
  escribe, para cada campo, el nombre EXACTO del encabezado del Excel (puede haber varios
  alias). Los campos sin encabezado se dejan vacíos. "extras" copia columnas que no tienen
  campo propio, para que no se pierda nada.

Paso 3 · Probar y escribir:
  python3 scripts/importar-hoja-vida.py ARCHIVO --ubicacion "SEDE 4" --probar
  python3 scripts/importar-hoja-vida.py ARCHIVO --ubicacion "SEDE 4"

Reglas:
  - Cruza con assets/equipos.js por código de equipo + ubicación (el código solo NO es
    único: hay códigos repetidos entre Sede 4 y Planta 2). Los códigos que no existen en
    el registro se listan y NO se agregan.
  - No modifica assets/equipos.js ni borra nada: suma/actualiza en el JSON de salida, por
    equipo; lo que el Excel nuevo no trae se conserva.
  - Solo lee valores guardados: no ejecuta macros. .xlsx/.xlsm con openpyxl; .xlsb necesita
    `pip install pyxlsb` (o guárdalo como .xlsx desde Excel).
  - El repositorio es público: no pongas en el mapeo columnas con precios o datos personales.
"""
import argparse
import json
import re
import sys
import unicodedata
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
RAIZ = Path(__file__).resolve().parent.parent
EQUIPOS = RAIZ / "assets" / "equipos.js"
SALIDA = RAIZ / "assets" / "data" / "hojas-de-vida.json"
MAPEO = Path(__file__).resolve().parent / "hoja-vida.mapeo.json"


def norm(t):
    t = unicodedata.normalize("NFD", str(t or "")).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", t).strip().lower()


def limpio(v):
    if v is None:
        return ""
    if hasattr(v, "date"):
        return v.date().isoformat()
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    t = str(v).strip()
    return "" if t.startswith("#") else t


def hojas(ruta):
    """Devuelve {nombre_hoja: iterador de filas (listas)}; no ejecuta macros."""
    ext = Path(ruta).suffix.lower()
    if ext == ".xlsb":
        try:
            from pyxlsb import open_workbook
        except ImportError:
            sys.exit("Para .xlsb instala pyxlsb (pip install pyxlsb) o guarda el archivo como .xlsx desde Excel.")
        wb = open_workbook(str(ruta))
        return {n: (lambda n=n: ([c.v for c in fila] for fila in wb.get_sheet(n).rows())) for n in wb.sheets}
    import openpyxl
    wb = openpyxl.load_workbook(ruta, data_only=True, read_only=True)
    return {ws.title: (lambda ws=ws: (list(f) for f in ws.iter_rows(values_only=True))) for ws in wb.worksheets}


def listar_columnas(ruta, muestra=3):
    for nombre, filas in hojas(ruta).items():
        print(f"\nHoja «{nombre}»")
        for i, fila in enumerate(filas(), 1):
            celdas = [limpio(c) for c in fila]
            if any(celdas):
                print(f"  fila {i}: " + " | ".join(f"{j}:{c[:28]}" for j, c in enumerate(celdas) if c))
                muestra -= 1
            if muestra == 0 or i >= 15:
                break
        muestra = 3


def leer_registro():
    s = EQUIPOS.read_text(encoding="utf-8")
    m = re.search(r"window\.EQUIPOS_PLAN = ", s)
    cuerpo = s[m.end():]
    return json.loads(cuerpo[: cuerpo.rstrip().rfind(";")])["equipos"]


def extraer(filas, mapeo):
    """filas: lista de listas. Busca la fila de encabezados y devuelve [{campo: valor}]."""
    campos = mapeo["campos"]
    alias = {c: [norm(a) for a in v] for c, v in campos.items() if v}
    extras = {n: norm(h) for n, h in (mapeo.get("extras") or {}).items()}
    fe = mapeo.get("fila_encabezado")
    enc = None
    for i, fila in enumerate(filas):
        if (fe and i + 1 == fe) or (not fe and any(norm(c) in alias.get("codigo", []) for c in fila)):
            enc = (i, [norm(c) for c in fila])
            break
    if not enc:
        sys.exit("No encontré la fila de encabezados: revisa los alias de «codigo» o pon «fila_encabezado» en el mapeo.")
    pos = {c: next((j for j, h in enumerate(enc[1]) if h in al), None) for c, al in alias.items()}
    pos_ex = {n: enc[1].index(h) for n, h in extras.items() if h in enc[1]}
    faltan = [c for c, p in pos.items() if p is None]
    if pos.get("codigo") is None:
        sys.exit("El encabezado de «codigo» no aparece en la hoja.")
    out = []
    for fila in filas[enc[0] + 1:]:
        cod = limpio(fila[pos["codigo"]]) if pos["codigo"] < len(fila) else ""
        if not cod:
            continue
        reg = {c: limpio(fila[p]) if p < len(fila) else "" for c, p in pos.items() if p is not None}
        ex = {n: limpio(fila[p]) for n, p in pos_ex.items() if p < len(fila) and limpio(fila[p])}
        if ex:
            reg["extras"] = ex
        out.append(reg)
    return out, faltan


def main(argv=None):
    ap = argparse.ArgumentParser(description="Importa hojas de vida de equipos desde Excel.")
    ap.add_argument("archivo")
    ap.add_argument("--columnas", action="store_true", help="solo muestra hojas y encabezados")
    ap.add_argument("--ubicacion", choices=["SEDE 4", "PLANTA 2"], help="a qué planta pertenece el archivo")
    ap.add_argument("--hoja", help="nombre de la hoja (por defecto la del mapeo)")
    ap.add_argument("--mapeo", default=str(MAPEO))
    ap.add_argument("--salida", default=str(SALIDA))
    ap.add_argument("--probar", action="store_true", help="cuenta, no escribe")
    a = ap.parse_args(argv)

    if a.columnas:
        return listar_columnas(a.archivo)
    if not a.ubicacion:
        sys.exit("Falta --ubicacion (\"SEDE 4\" o \"PLANTA 2\").")
    if not Path(a.mapeo).exists():
        sys.exit(f"No existe {a.mapeo}. Copia scripts/hoja-vida.mapeo.ejemplo.json y complétalo (ver --columnas).")
    mapeo = json.loads(Path(a.mapeo).read_text(encoding="utf-8"))
    libro = hojas(a.archivo)
    nombre = a.hoja or mapeo.get("hoja")
    if nombre not in libro:
        sys.exit(f"Hoja «{nombre}» no encontrada. Hojas: {', '.join(libro)}")
    regs, faltan = extraer(list(libro[nombre]()), mapeo)

    registro = [e for e in leer_registro() if e["u"] == a.ubicacion]
    por_cod = {}
    for e in registro:
        por_cod.setdefault(str(e["c"]), []).append(e)

    salida = Path(a.salida)
    previo = json.loads(salida.read_text(encoding="utf-8")) if salida.exists() else {"equipos": {}}
    nuevos = cambiados = 0
    sin_registro, ambiguos = [], []
    for r in regs:
        cand = por_cod.get(r["codigo"], [])
        if not cand:
            sin_registro.append(r["codigo"])
            continue
        if len(cand) > 1:
            ambiguos.append(r["codigo"])
            continue
        eid = cand[0]["id"]
        dato = {k: v for k, v in r.items() if k != "codigo" and (v or k == "extras")}
        dato["codigoEquipo"] = r["codigo"]
        dato["ubicacion"] = a.ubicacion
        antes = previo["equipos"].get(eid)
        if antes is None:
            nuevos += 1
        elif {**antes, **dato} != antes:
            cambiados += 1
        previo["equipos"][eid] = {**(antes or {}), **dato}

    print(f"Filas con código: {len(regs)} · equipos nuevos en el JSON: {nuevos} · actualizados: {cambiados}")
    print(f"Campos del mapeo sin encabezado en el Excel: {', '.join(faltan) or 'ninguno'}")
    if sin_registro:
        print(f"Códigos que NO están en assets/equipos.js para {a.ubicacion} ({len(sin_registro)}): {', '.join(sorted(set(sin_registro))[:25])}")
    if ambiguos:
        print(f"Códigos repetidos dentro de {a.ubicacion}, no se importaron: {', '.join(ambiguos)}")
    if a.probar:
        return print("(--probar: no se escribió nada)")
    previo["fuente"] = f"Hoja de vida DMM-199 ({a.ubicacion}) · {Path(a.archivo).name}"
    previo.setdefault("fuentes", {})[a.ubicacion] = Path(a.archivo).name
    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_text(json.dumps(previo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escrito: {salida}")


if __name__ == "__main__":
    main()
