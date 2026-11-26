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
  - Celdas de relleno («N/A», «N/A.», «NA», «-», «--», «—», «No aplica», «S/N»…) cuentan como vacías:
    no generan repuestos, marcas ni modelos.
  - La sede se reconoce también en «PLANTA #2», «PLANTA#2», «PALANTA #2», «PLANTA 2/ÁREA», «PLANTA N°2».
    Si trae otra planta o sede («PLANTA #4») la sede queda la del archivo, se quita del área y se avisa.
  - Un código que sale en más de una fila del MISMO archivo no se mezcla: se omiten todas sus filas y se listan.
  - Con --listado listado-DMM-179-vigente.csv solo se importan los equipos que figuran en el listado vigente.
  - IMAGEN: solo el nombre del archivo, nunca la ruta (puede traer carpetas del servidor).
  - SERIAL: NO se guarda. Solo con --incluir-serial (el repositorio es público).
  - COD-REPn / REPn / CANT-REPn -> lista `repuestos` (los códigos también sin ceros).
  - FREC-D/S/M/2M/3M/6M/A/2A -> `frecuencias` con las letras de la celda
    (M, I, F, IE, M/S, MT, MT/R, X…): solo se limpian espacios y mayúsculas, NO se interpretan.
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
LEYENDA = AQUI / "hoja-vida.leyenda-frecuencia.json"


def sin_tildes(t):
    return unicodedata.normalize("NFD", str(t or "")).encode("ascii", "ignore").decode()


def clave(t):
    """Para comparar encabezados: sin tildes, mayúsculas, espacios ni símbolos."""
    return re.sub(r"[^a-z0-9]", "", sin_tildes(t).lower())


RELLENOS = {"n/a", "na", "n.a", "n/d", "nd", "s/d", "s/n", "no aplica", "noaplica", "ninguno", "ninguna", "sin dato", "sin datos", "sindato", "sindatos"}


def es_relleno(t):
    """«N/A», «N/A.», «NA», «-», «--», «—», «No aplica»… son celdas de relleno, no datos."""
    k = re.sub(r"\s+", "", str(t).lower()).rstrip(".") if t is not None else ""
    return k == "" or re.fullmatch(r"[-–—_.*/\\]+", k) is not None or k in {r.replace(" ", "") for r in RELLENOS}


def limpio(v, crudo=False):
    """Texto de una celda. Los valores de relleno (N/A, -, …) cuentan como vacíos, salvo crudo=True."""
    if v is None:
        return ""
    if hasattr(v, "date"):
        return v.date().isoformat()
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    t = str(v).strip()
    if t.startswith("#"):
        return ""
    return t if crudo or not es_relleno(t) else ""


def codigo(v):
    """04307001 -> 4307001 (también 4307001.0 -> 4307001)."""
    t = limpio(v)
    return re.sub(r"^0+(?=\d)", "", t) if re.fullmatch(r"\d+", t) else t


def letra_frecuencia(v):
    """Solo limpia el formato de una celda FREC-* (« mt / r » y «MT/R» quedan «MT/R»).
    NO la interpreta: qué significa cada letra (M, I, F, IE, M/S, MT, MT/R, X…) no está decidido."""
    t = re.sub(r"\s*/\s*", "/", re.sub(r"\s+", " ", limpio(v))).strip().upper()
    return t


def letras_sin_leyenda(frecuencias, leyenda):
    """Letras de FREC-* que no están en la leyenda de la hoja DMM-199 (MT, R, X, M/S…): se avisan, no se traducen."""
    return sorted({v for v in frecuencias.values() if v not in leyenda})


def nombre_archivo(v):
    """Solo el nombre del archivo de IMAGEN, venga con ruta de Windows, de red o de Linux."""
    t = limpio(v)
    return re.split(r"[\\/]", t)[-1].strip() if t else ""


def _ubicacion(texto):
    """-> (texto normalizado, coincidencia). Acepta «PLANTA #2», «PLANTA#2», «PALANTA #2», «Planta 2/Área», «Planta N°2», «SEDE 4»…"""
    t = sin_tildes(texto).lower()
    t = re.sub(r"[#°ºª]", " ", t)                    # «#2», «N°2»
    t = re.sub(r"\bn\s*o?\.?\s*(?=\d)", " ", t)       # «No. 2», «N 2»
    t = re.sub(r"\s+", " ", t)
    m = re.search(r"\b(sede|s|planta|palanta|plana|p)\s*-?\s*(\d)\b", t)
    return t, m


def separar_ubicacion(texto, por_defecto=""):
    """'Sede 4 - Encapsulado / Cuarto 2' -> ('SEDE 4', 'encapsulado cuarto 2' limpio).
    «Planta #4» y similares (número que no es Sede 4 ni Planta 2): se quita del área y la sede queda la del archivo."""
    t, m = _ubicacion(texto)
    sede = por_defecto
    if m:
        tipo, n = m.group(1), m.group(2)
        if tipo in ("sede", "s") and n == "4":
            sede = "SEDE 4"
        elif tipo in ("planta", "palanta", "plana", "p") and n == "2":
            sede = "PLANTA 2"
        t = t[: m.start()] + " " + t[m.end():]
    t = re.sub(r"[-·/|:;,_]+", " ", t)
    area = re.sub(r"\s+", " ", t).strip()
    return sede, area


def sede_sin_reconocer(texto):
    """«PLANTA #4», «SEDE 2»…: el texto trae planta o sede, pero no es ni Sede 4 ni Planta 2. -> el token o ''."""
    t, m = _ubicacion(texto)
    if not m:
        return ""
    ok = (m.group(1) in ("sede", "s") and m.group(2) == "4") or (m.group(1) in ("planta", "palanta", "plana", "p") and m.group(2) == "2")
    return "" if ok else f"{m.group(1)} {m.group(2)}".upper()


def normalizar_area(area, areas):
    """area (ya limpia: minúsculas, sin tildes) -> (área, detalle, normalizada?).
    1) coincidencia exacta en areas["areas"]; 2) el prefijo más largo en areas["prefijos"] (el resto queda
    como detalle: «microg lado a» -> MICROG + «lado a»); 3) sin coincidencia: texto limpio, sin normalizar."""
    exactas = areas.get("areas", {})
    if area in exactas:
        return exactas[area], "", True
    for pref in sorted(areas.get("prefijos", {}), key=len, reverse=True):
        if area == pref or area.startswith(pref + " "):
            return areas["prefijos"][pref], area[len(pref):].strip(), True
    return area, "", False


def cargar_listado(ruta):
    """CSV del listado oficial (cod, desc, ubi, area) -> {codigo sin ceros: {ubicaciones}}."""
    import csv
    out = {}
    with open(ruta, encoding="utf-8-sig", newline="") as f:
        for fila in csv.DictReader(f):
            f = {k.strip().lower(): v for k, v in fila.items() if k}
            c = codigo(f.get("cod") or f.get("codigo"))
            if c:
                out.setdefault(c, set()).add((f.get("ubi") or f.get("ubicacion") or "").strip().upper())
    return out


def en_listado(cod, ubicacion, listado):
    """-> (está?, aviso). Está si (código, planta del archivo) figura en el listado vigente; si el código figura
    solo en la OTRA planta se acepta con aviso (el registro o el listado tienen la planta cruzada)."""
    ubis = listado.get(cod)
    if not ubis:
        return False, ""
    if ubicacion in ubis:
        return True, ""
    return True, f"listado dice {', '.join(sorted(u for u in ubis if u)) or 'sin ubicación'}"


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
            celdas = [limpio(c, crudo=True) for c in fila]
            if any(celdas):
                print(f"  fila {i}: " + " | ".join(f"{j}:{c[:28]}" for j, c in enumerate(celdas) if c))
                n += 1
            if n == muestra or i >= 15:
                break


def separar_repetidos(regs):
    """Un código que sale en más de una fila del mismo archivo no se mezcla: se omiten todas sus filas.
    -> (registros únicos, {código: número de filas})."""
    n = Counter(r["codigo"] for r in regs)
    rep_ = {c: k for c, k in n.items() if k > 1}
    return [r for r in regs if r["codigo"] not in rep_], rep_


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
            canon, detalle, normalizada = normalizar_area(area, areas)
            reg["sede"] = sede
            raro = sede_sin_reconocer(orig)
            if raro:
                reg["sede_sin_reconocer"] = raro
            reg["area"] = canon
            if detalle:
                reg["areaDetalle"] = detalle
            if area and not normalizada:
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
        frec = {k: letra_frecuencia(celda(fila, p)) for k, p in pos_frec.items() if p is not None and letra_frecuencia(celda(fila, p))}
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
    ap.add_argument("--leyenda", default=str(LEYENDA))
    ap.add_argument("--listado", help="CSV del listado oficial vigente (DMM-179/179B): solo se importan los equipos que figuran en él")
    ap.add_argument("--salida", default=str(SALIDA))
    ap.add_argument("--incluir-serial", action="store_true", help="también guarda SERIAL (el repositorio es público: no recomendado)")
    ap.add_argument("--probar", action="store_true", help="cuenta, no escribe")
    a = ap.parse_args(argv)

    if a.columnas:
        return listar_columnas(a.archivo)
    if not a.ubicacion:
        sys.exit('Falta --ubicacion ("SEDE 4" o "PLANTA 2").')
    mapeo = json.loads(Path(a.mapeo).read_text(encoding="utf-8"))
    areas = json.loads(Path(a.areas).read_text(encoding="utf-8")) if Path(a.areas).exists() else {}
    listado = cargar_listado(a.listado) if a.listado else None
    leyenda = json.loads(Path(a.leyenda).read_text(encoding="utf-8")).get("letras", {}) if Path(a.leyenda).exists() else {}
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

    regs, repetidos = separar_repetidos(regs)
    fuera_listado, aviso_listado = [], []
    if listado is not None:
        dentro = []
        for r in regs:
            ok, aviso = en_listado(r["codigo"], a.ubicacion, listado)
            if not ok:
                fuera_listado.append(r["codigo"]); continue
            if aviso:
                aviso_listado.append(f"{r['codigo']} ({aviso})")
            dentro.append(r)
        regs = dentro
    registro = [e for e in leer_registro() if e["u"] == a.ubicacion]
    por_cod = {}
    for e in registro:
        por_cod.setdefault(codigo(e["c"]), []).append(e)

    salida = Path(a.salida)
    previo = json.loads(salida.read_text(encoding="utf-8")) if salida.exists() else {"equipos": {}}
    nuevos = cambiados = 0
    sin_registro, ambiguos = [], []
    sin_leyenda = set()
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
        if leyenda and r.get("frecuencias"):
            raras = letras_sin_leyenda(r["frecuencias"], leyenda)
            if raras:
                dato["frecuenciasSinLeyenda"] = raras
                sin_leyenda.update(raras)
            else:
                dato.pop("frecuenciasSinLeyenda", None)
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
    if sin_leyenda:
        print(f"Letras de FREC-* que NO están en la leyenda (no se traducen): {', '.join(sorted(sin_leyenda))}")
    if a.incluir_serial:
        print("AVISO: se está guardando SERIAL; no subas ese JSON al repositorio público.")
    if sin_registro:
        print(f"Códigos que NO están en assets/equipos.js para {a.ubicacion} ({len(sin_registro)}): {', '.join(sorted(set(sin_registro))[:25])}")
    if listado is not None:
        print(f"Fuera del listado vigente, NO se importaron ({len(fuera_listado)}): {', '.join(sorted(set(fuera_listado))[:40])}")
        if aviso_listado:
            print(f"Planta distinta en el listado, se importaron igual ({len(aviso_listado)}): {', '.join(aviso_listado)}")
    if repetidos:
        print(f"Códigos REPETIDOS dentro del archivo, omitidos sin mezclar ({len(repetidos)}): " + ", ".join(f"{c} (x{k})" for c, k in sorted(repetidos.items())))
    raras = [r for r in regs if r.get("sede_sin_reconocer")]
    if raras:
        print(f"Filas cuya ubicación trae otra planta/sede ({len(raras)}): " + ", ".join(sorted({r["sede_sin_reconocer"] for r in raras})) + " (la sede se dejó como la del archivo)")
    if ambiguos:
        print(f"Códigos repetidos dentro de {a.ubicacion}, no se importaron: {', '.join(ambiguos)}")
    if a.probar:
        return print("(--probar: no se escribió nada)")
    if leyenda:
        previo["leyendaFrecuencia"] = leyenda
    previo["fuente"] = "Hojas de vida DMM-199 (hoja BASE DE DATOS)"
    previo.setdefault("fuentes", {})[a.ubicacion] = Path(a.archivo).name
    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_text(json.dumps(previo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escrito: {salida}")


if __name__ == "__main__":
    main()
