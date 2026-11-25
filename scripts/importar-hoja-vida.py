#!/usr/bin/env python3
"""Lee la hoja BASE DE DATOS de las hojas de vida (DMM-199) y deja los datos en
assets/data/hojas-de-vida.json, por equipo.

Archivos: 'BD SEDE 4 DMM-199 Hoja de Vidas.xlsm' y 'BASE DE PLANTA 2 DMM-199 Hoja de
Vidas (version 1).xlsb'. Este repositorio no los tiene.

  1. Ver encabezados (no escribe):   python3 scripts/importar-hoja-vida.py ARCHIVO --columnas
  2. Ver variantes de ubicación:      python3 scripts/importar-hoja-vida.py ARCHIVO --ubicacion "SEDE 4" --variantes
  3. Probar / escribir:               python3 scripts/importar-hoja-vida.py ARCHIVO --ubicacion "SEDE 4" [--probar]

Qué hace con cada dato
  - CODIGO: se normaliza sin ceros a la izquierda (04307001 = 4307001) y se cruza con
    assets/equipos.js por código + planta (el código solo no es único). Los que no están
    en el registro se listan y NO se agregan.
  - UBICACIÓN (más de 100 variantes): se separa en sede + área. La sede sale del texto
    ("sede 4", "planta 2") o, si no la trae, de --ubicacion. El área se limpia y, si está en
    scripts/hoja-vida.areas.json (variante -> área oficial, DMM-211B), se unifica.
  - IMAGEN: solo el nombre del archivo, nunca la ruta (puede traer carpetas del servidor).
  - SERIAL: NO se guarda. Solo con --incluir-serial (el repositorio es público).
  - COD-REPn / REPn / CANT-REPn -> lista `repuestos` (los códigos también sin ceros).
  - FREC-D/S/M/2M/3M/6M/A/2A -> `frecuencias` con lo que tenga la celda (sin interpretar).
  - No modifica assets/equipos.js ni borra nada: suma/actualiza el JSON; lo que el Excel
    nuevo no trae se conserva. No ejecuta macros. .xlsb necesita `pip install pyxlsb`.
"""
import argparse
import json
import re
import sys
import unicodedata
import warnings
from collections import Counter
from pathlib import Path

warnings.filterwarnings("ignore")
AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
EQUIPOS = RAIZ / "assets" / "equipos.js"
SALIDA = RAIZ / "assets" / "data" / "hojas-de-vida.json"
MAPEO = AQUI / "hoja-vida.mapeo.json"
AREAS = AQUI / "hoja-vida.areas.json"


def sin_tildes(t):
    return unicodedata.normalize("NFD", str(t or "")).encode("ascii", "ignore").decode()


def clave(t):
    """Para comparar encabezados: sin tildes, mayúsculas, espacios ni símbolos."""
    return re.sub(r"[^a-z0-9]", "", sin_tildes(t).lower())


def limpio(v):
    if v is None:
        return ""
    if hasattr(v, "date"):
        return v.date().isoformat()
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    t = str(v).strip()
    return "" if t.startswith("#") else t


def codigo(v):
    """04307001 -> 4307001 (también 4307001.0 -> 4307001)."""
    t = limpio(v)
    return re.sub(r"^0+(?=\d)", "", t) if re.fullmatch(r"\d+", t) else t


def nombre_archivo(v):
    """Solo el nombre del archivo de IMAGEN, venga con ruta de Windows, de red o de Linux."""
    t = limpio(v)
    return re.split(r"[\\/]", t)[-1].strip() if t else ""


def separar_ubicacion(texto, por_defecto=""):
    """'Sede 4 - Encapsulado / Cuarto 2' -> ('SEDE 4', 'encapsulado cuarto 2' limpio)."""
    t = sin_tildes(texto).lower()
    sede = por_defecto
    m = re.search(r"\b(?:sede|s)\s*-?\s*4\b", t)
    if m:
        sede = "SEDE 4"
    else:
        m = re.search(r"\b(?:planta|p)\s*-?\s*2\b", t)
        if m:
            sede = "PLANTA 2"
    if m:
        t = (t[: m.start()] + " " + t[m.end():])
    t = re.sub(r"[-·/|:;,_]+", " ", t)
    area = re.sub(r"\s+", " ", t).strip()
    return sede, area


def hojas(ruta):
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
        n = 0
        for i, fila in enumerate(filas(), 1):
            celdas = [limpio(c) for c in fila]
            if any(celdas):
                print(f"  fila {i}: " + " | ".join(f"{j}:{c[:28]}" for j, c in enumerate(celdas) if c))
                n += 1
            if n == muestra or i >= 15:
                break


def leer_registro():
    s = EQUIPOS.read_text(encoding="utf-8")
    m = re.search(r"window\.EQUIPOS_PLAN = ", s)
    cuerpo = s[m.end():]
    return json.loads(cuerpo[: cuerpo.rstrip().rfind(";")])["equipos"]


def extraer(filas, mapeo, ubicacion="", areas=None, incluir_serial=False):
    """filas: lista de listas -> (registros, faltan). Cada registro lleva 'codigo' normalizado."""
    areas = areas or {}
    campos = {c: [clave(a) for a in v] for c, v in mapeo["campos"].items() if v}
    if incluir_serial:
        campos.update({c: [clave(a) for a in v] for c, v in (mapeo.get("opcionales") or {}).items() if c != "_nota" and v})
    fe = mapeo.get("fila_encabezado")
    enc = None
    for i, fila in enumerate(filas):
        if (fe and i + 1 == fe) or (not fe and any(clave(c) in campos.get("codigo", []) for c in fila)):
            enc = (i, [clave(c) for c in fila])
            break
    if not enc:
        sys.exit("No encontré la fila de encabezados (columna CODIGO). Pon «fila_encabezado» en el mapeo.")
    cab = enc[1]
    pos = {c: next((j for j, h in enumerate(cab) if h in al), None) for c, al in campos.items()}
    if pos.get("codigo") is None:
        sys.exit("El encabezado CODIGO no aparece en la hoja.")
    faltan = [c for c, p in pos.items() if p is None]

    def col(nombre):
        return cab.index(clave(nombre)) if clave(nombre) in cab else None

    rep = mapeo.get("repuestos") or {}
    pos_rep = []
    for n in range(1, int(rep.get("max", 0)) + 1):
        c = {k: col(rep[k].format(n=n)) for k in ("cod", "desc", "cant") if rep.get(k)}
        if any(v is not None for v in c.values()):
            pos_rep.append(c)
    pos_frec = {k: col(h) for k, h in (mapeo.get("frecuencias") or {}).items()}

    def celda(fila, p):
        return fila[p] if p is not None and p < len(fila) else None

    out = []
    for fila in filas[enc[0] + 1:]:
        cod = codigo(celda(fila, pos["codigo"]))
        if not cod:
            continue
        reg = {"codigo": cod}
        for c, p in pos.items():
            if c in ("codigo", "ubicacion", "imagen") or p is None:
                continue
            v = limpio(celda(fila, p))
            if v:
                reg[c] = v
        if pos.get("ubicacion") is not None:
            orig = limpio(celda(fila, pos["ubicacion"]))
            sede, area = separar_ubicacion(orig, ubicacion)
            canon = areas.get(area)
            reg["sede"] = sede
            reg["area"] = canon or area
            if area and not canon:
                reg["area_sin_normalizar"] = True
            if orig:
                reg["ubicacionOriginal"] = orig
        if pos.get("imagen") is not None:
            v = nombre_archivo(celda(fila, pos["imagen"]))
            if v:
                reg["imagen"] = v
        reps = []
        for c in pos_rep:
            cd, ds, ct = (limpio(celda(fila, c.get(k))) for k in ("cod", "desc", "cant"))
            if cd or ds:
                reps.append({k: v for k, v in (("cod", codigo(cd) if cd else ""), ("desc", ds), ("cant", ct)) if v})
        if reps:
            reg["repuestos"] = reps
        frec = {k: limpio(celda(fila, p)) for k, p in pos_frec.items() if p is not None and limpio(celda(fila, p))}
        if frec:
            reg["frecuencias"] = frec
        out.append(reg)
    return out, faltan


def main(argv=None):
    ap = argparse.ArgumentParser(description="Importa hojas de vida de equipos desde Excel.")
    ap.add_argument("archivo")
    ap.add_argument("--columnas", action="store_true", help="solo muestra hojas y encabezados")
    ap.add_argument("--variantes", action="store_true", help="lista las variantes de UBICACIÓN y cuántas veces salen")
    ap.add_argument("--ubicacion", choices=["SEDE 4", "PLANTA 2"], help="planta a la que pertenece el archivo")
    ap.add_argument("--hoja")
    ap.add_argument("--mapeo", default=str(MAPEO))
    ap.add_argument("--areas", default=str(AREAS))
    ap.add_argument("--salida", default=str(SALIDA))
    ap.add_argument("--incluir-serial", action="store_true", help="también guarda SERIAL (el repositorio es público: no recomendado)")
    ap.add_argument("--probar", action="store_true", help="cuenta, no escribe")
    a = ap.parse_args(argv)

    if a.columnas:
        return listar_columnas(a.archivo)
    if not a.ubicacion:
        sys.exit('Falta --ubicacion ("SEDE 4" o "PLANTA 2").')
    mapeo = json.loads(Path(a.mapeo).read_text(encoding="utf-8"))
    areas = json.loads(Path(a.areas).read_text(encoding="utf-8")).get("areas", {}) if Path(a.areas).exists() else {}
    libro = hojas(a.archivo)
    nombre = a.hoja or mapeo.get("hoja")
    if nombre not in libro:
        sys.exit(f"Hoja «{nombre}» no encontrada. Hojas: {', '.join(libro)}")
    regs, faltan = extraer(list(libro[nombre]()), mapeo, a.ubicacion, areas, a.incluir_serial)

    if a.variantes:
        cuenta = Counter(r.get("area", "") for r in regs)
        print(f"{len(cuenta)} variantes de área:")
        for v, n in cuenta.most_common():
            print(f"  {n:4d}  {v or '(vacía)'}")
        return

    registro = [e for e in leer_registro() if e["u"] == a.ubicacion]
    por_cod = {}
    for e in registro:
        por_cod.setdefault(codigo(e["c"]), []).append(e)

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
        dato = {k: v for k, v in r.items() if k != "codigo"}
        dato["codigoEquipo"] = cand[0]["c"]
        antes = previo["equipos"].get(eid)
        if antes is None:
            nuevos += 1
        elif {**antes, **dato} != antes:
            cambiados += 1
        previo["equipos"][eid] = {**(antes or {}), **dato}

    sin_norm = sum(1 for r in regs if r.get("area_sin_normalizar"))
    print(f"Filas con código: {len(regs)} · equipos nuevos en el JSON: {nuevos} · actualizados: {cambiados}")
    print(f"Campos del mapeo sin encabezado en el Excel: {', '.join(faltan) or 'ninguno'}")
    print(f"Filas con área sin unificar (falta en hoja-vida.areas.json): {sin_norm}")
    if a.incluir_serial:
        print("AVISO: se está guardando SERIAL; no subas ese JSON al repositorio público.")
    if sin_registro:
        print(f"Códigos que NO están en assets/equipos.js para {a.ubicacion} ({len(sin_registro)}): {', '.join(sorted(set(sin_registro))[:25])}")
    if ambiguos:
        print(f"Códigos repetidos dentro de {a.ubicacion}, no se importaron: {', '.join(ambiguos)}")
    if a.probar:
        return print("(--probar: no se escribió nada)")
    previo["fuente"] = "Hojas de vida DMM-199 (hoja BASE DE DATOS)"
    previo.setdefault("fuentes", {})[a.ubicacion] = Path(a.archivo).name
    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_text(json.dumps(previo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escrito: {salida}")


if __name__ == "__main__":
    main()
