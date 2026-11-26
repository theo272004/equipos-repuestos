#!/usr/bin/env python3
"""Arma assets/data/manuales-indice.json: por equipo, la lista de sus manuales como METADATOS
({nombre, tipo, ext, mb, ruta}). NO sube ningún PDF: la ruta es relativa a la carpeta «Respaldos».

  python3 scripts/generar-indice-manuales.py indice-manuales-respaldos.csv \\
      [--propuesta carpeta-equipo-propuesta.csv] [--listado listado-DMM-179-vigente.csv] [--probar]

Entradas
  - indice-manuales-respaldos.csv: Carpeta, Archivo, Tipo, Ext, MB, Ruta (una fila por archivo).
  - scripts/manuales-carpeta-equipo.json: a qué equipo(s) va cada carpeta (revisable; lo que no esté
    ahí o no se pueda resolver queda SIN ASIGNAR, no se adivina).
  - assets/equipos.js: para convertir el código en id del registro (código + planta).

Salida: equipos{id: {codigo, ubicacion, carpetas, manuales[]}}, sinAsignar[] (por carpeta, con motivo,
cantidad de archivos por tipo y candidatos de la propuesta; sin nombres de archivo), enRepo (vínculos que
ya existen en el repositorio y no se tocan) y un resumen. No modifica assets/equipos.js ni las fichas.
"""
import argparse
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
MAPEO = AQUI / "manuales-carpeta-equipo.json"
EQUIPOS = RAIZ / "assets" / "equipos.js"
SALIDA = RAIZ / "assets" / "data" / "manuales-indice.json"


# Certificados y similares: en el repositorio PÚBLICO sus nombres de archivo pueden traer nombres de personas
# (p. ej. soldadores). Por defecto no se publican; solo se cuenta cuántos son (--incluir-certificados los deja).
PRIVADOS = re.compile(r"certificad|c[eé]dula|licencia|hoja de vida|firma", re.I)


def sin_ceros(c):
    return re.sub(r"^0+(?=\d)", "", str(c or "").strip())


def leer_registro():
    s = EQUIPOS.read_text(encoding="utf-8")
    m = re.search(r"window\.EQUIPOS_PLAN = ", s)
    cu = s[m.end():]
    return json.loads(cu[: cu.rstrip().rfind(";")])["equipos"]


def leer_csv(ruta):
    with open(ruta, encoding="utf-8-sig", newline="") as f:
        return [{(k or "").strip(): (v or "").strip() for k, v in fila.items()} for fila in csv.DictReader(f)]


def resolver(codigo, registro, listado):
    """codigo -> (equipo del registro | None, motivo si no se pudo)."""
    cands = [e for e in registro if sin_ceros(e["c"]) == sin_ceros(codigo)]
    if not cands:
        return None, f"el equipo {codigo} no está en el registro (no se agregan equipos nuevos por ahora)"
    if len(cands) == 1:
        return cands[0], ""
    ubis = listado.get(sin_ceros(codigo), set()) if listado else set()
    por_ubi = [e for e in cands if e["u"] in ubis]
    if len(por_ubi) == 1:
        return por_ubi[0], ""
    return None, f"el código {codigo} está en varias plantas y no se puede elegir"


def candidatos_de(propuesta, carpeta):
    for fila in propuesta:
        if fila.get("Carpeta") == carpeta:
            txt = fila.get("Candidatos", "")
            return [c.strip() for c in txt.split(";") if c.strip()]
    return []


def construir(archivos, mapeo, registro, propuesta=None, listado=None, incluir_certificados=False):
    por_carpeta = defaultdict(list)
    for a in archivos:
        por_carpeta[a["Carpeta"]].append(a)
    equipos = {}
    sin_asignar = []
    for carpeta in sorted(por_carpeta):
        lista = por_carpeta[carpeta]
        regla = mapeo["carpetas"].get(carpeta)
        motivo = ""
        destinos = []
        if not regla:
            motivo = "la carpeta no está en el mapeo (scripts/manuales-carpeta-equipo.json)"
        elif regla["estado"] != "asignada":
            motivo = regla["motivo"]
        else:
            for cod in regla["equipos"]:
                eq, mot = resolver(cod, registro, listado)
                if eq:
                    destinos.append(eq)
                else:
                    motivo = mot
                    destinos = []
                    break
        if not destinos:
            sin_asignar.append({
                "carpeta": carpeta, "archivos": len(lista),
                "porTipo": dict(sorted(Counter(a["Tipo"] for a in lista).items())),
                "motivo": motivo, "candidatos": candidatos_de(propuesta or [], carpeta),
            })
            continue
        omitidos = [a for a in lista if not incluir_certificados and PRIVADOS.search(a["Archivo"])]
        lista = [a for a in lista if a not in omitidos]
        manuales = [{
            "nombre": a["Archivo"], "tipo": a["Tipo"], "ext": a["Ext"].lower(),
            "mb": float(a["MB"]) if a.get("MB") else None,
            "ruta": a["Ruta"].replace("\\", "/"),
        } for a in sorted(lista, key=lambda a: (a["Tipo"], a["Archivo"].lower()))]
        for eq in destinos:
            d = equipos.setdefault(eq["id"], {"codigo": eq["c"], "ubicacion": eq["u"], "nombre": eq["n"], "carpetas": [], "confianza": regla["confianza"], "manuales": []})
            if eq.get("mid"):
                d["mid"] = eq["mid"]
            if omitidos:
                d["certificadosOmitidos"] = d.get("certificadosOmitidos", 0) + len(omitidos)
            d["carpetas"].append(carpeta)
            if regla["confianza"] != "alta":
                d["confianza"] = regla["confianza"]
            d["manuales"].extend(manuales)
    return equipos, sin_asignar


def main(argv=None):
    ap = argparse.ArgumentParser(description="Índice de manuales por equipo (solo metadatos).")
    ap.add_argument("indice")
    ap.add_argument("--propuesta")
    ap.add_argument("--listado")
    ap.add_argument("--mapeo", default=str(MAPEO))
    ap.add_argument("--salida", default=str(SALIDA))
    ap.add_argument("--incluir-certificados", action="store_true", help="publica también los nombres de archivos de certificados (pueden traer nombres de personas)")
    ap.add_argument("--probar", action="store_true")
    a = ap.parse_args(argv)

    archivos = leer_csv(a.indice)
    mapeo = json.loads(Path(a.mapeo).read_text(encoding="utf-8"))
    registro = leer_registro()
    propuesta = leer_csv(a.propuesta) if a.propuesta else []
    listado = None
    if a.listado:
        listado = defaultdict(set)
        for f in leer_csv(a.listado):
            listado[sin_ceros(f.get("cod"))].add(f.get("ubi", "").upper())
    equipos, sin_asignar = construir(archivos, mapeo, registro, propuesta, listado, a.incluir_certificados)

    n_man = sum(len(e["manuales"]) for e in equipos.values())
    n_sin = sum(s["archivos"] for s in sin_asignar)
    n_omit = sum(e.get("certificadosOmitidos", 0) for e in equipos.values())
    en_repo = {k: v for k, v in mapeo.get("enRepo", {}).items() if not k.startswith("_")}
    salida = {
        "nota": "Índice de manuales por equipo: solo METADATOS (nombre, tipo, extensión, MB y ruta relativa a la carpeta Respaldos). No contiene ni sube los archivos. Lo que no tiene equipo claro está en sinAsignar para revisión. Generado por scripts/generar-indice-manuales.py.",
        "generado": date.today().isoformat(), "rutasRelativasA": "Respaldos",
        "resumen": {"carpetas": len({x["Carpeta"] for x in archivos}), "archivos": len(archivos),
                    "equiposConManuales": len(equipos), "manualesEnlazados": n_man, "certificadosOmitidos": n_omit,
                    "carpetasSinAsignar": len(sin_asignar), "archivosSinAsignar": n_sin},
        "enRepo": en_repo,
        "equipos": dict(sorted(equipos.items())),
        "sinAsignar": sin_asignar,
    }
    print(f"{salida['resumen']['archivos']} archivos en {salida['resumen']['carpetas']} carpetas")
    print(f"Equipos con manuales: {len(equipos)} · manuales enlazados: {n_man} · certificados omitidos por privacidad: {n_omit}")
    print(f"Carpetas sin asignar: {len(sin_asignar)} ({n_sin} archivos)")
    for s in sin_asignar:
        print(f"  - {s['carpeta']} ({s['archivos']}): {s['motivo']}")
    if a.probar:
        return print("(--probar: no se escribió nada)")
    Path(a.salida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.salida).write_text(json.dumps(salida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Escrito: {a.salida}")


if __name__ == "__main__":
    main()
