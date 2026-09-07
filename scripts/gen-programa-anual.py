# Pasa a datos el programa anual de mantenimiento preventivo DMM-173B y la
# rutina en papel DMM-160L, y deja los dos en assets/js/programa-anual.js.
#
# El DMM-173B es una hoja de Excel impresa a seis paginas: las tres primeras
# llevan de enero a junio y las tres siguientes, de julio a diciembre, con las
# mismas filas de equipo. Cada mes tiene dos columnas, FECHA PROGRAMADO y FECHA
# EJECUTADO; en el formato en blanco la segunda esta siempre vacia.
#
# El numero de la casilla NO es un dia del mes: es la SEMANA ISO del anio. Se ve
# en que llegan hasta 52 y en que un mantenimiento trimestral cae en 3, 16, 29 y
# 42, que son trece semanas justas de separacion. Leerlos como dias daria fechas
# imposibles -"42 de octubre"- y programaciones equivocadas, asi que el script
# comprueba una por una que la semana caiga de verdad dentro de su mes y se para
# si alguna no cuadra.
#
# El texto sale con -layout, que respeta las columnas. Para saber a que mes
# pertenece cada numero se mide su posicion horizontal contra la de los nombres
# de mes de la cabecera: es lo unico fiable cuando hay doce pares de columnas
# estrechas y muchas casillas vacias.
#
# Se ejecuta con poppler-utils (pdftotext).
import datetime, io, json, os, re, subprocess, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROG = os.path.join(R, "manuales", "_programa",
                    "DMM-173B-programa-anual-2026-Sede4-ed2.pdf")
RUT = os.path.join(R, "manuales", "_programa",
                   "DMM-160L-rutina-secadora-de-aire-ed1.pdf")
OUT = os.path.join(R, "assets", "js", "programa-anual.js")

ANIO = 2026
SEM1 = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO"]
SEM2 = ["JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]
MESES = SEM1 + SEM2
NUM = {m: i + 1 for i, m in enumerate(MESES)}

FILA = re.compile(r"\s*(\d+)\s+(\d{6,9})\s+(AUXILIAR|PROCESO)\s+(.+?)\s{2,}"
                  r"(SEDE 4|PLANTA 2)\s*(.*)$")


def meses_de_la_semana(w):
    """Los meses que toca la semana ISO w, de lunes a viernes."""
    lun = datetime.date.fromisocalendar(ANIO, w, 1)
    vie = datetime.date.fromisocalendar(ANIO, w, 5)
    return {lun.month, vie.month}


def programa():
    txt = subprocess.run(["pdftotext", "-layout", PROG, "-"],
                         capture_output=True, text=True, check=True).stdout
    eq = {}
    for pagina in txt.split("\f"):
        L = pagina.splitlines()
        if not any("PROGRAMA ANUAL" in l for l in L):
            continue
        bloque = SEM1 if any("ENERO" in l for l in L[:8]) else SEM2
        cab = next(l for l in L if all(m in l for m in bloque[:3]))
        pos = [(m, cab.index(m)) for m in bloque]
        for l in L:
            m = FILA.match(l)
            if not m:
                continue
            cod = m.group(2)
            e = eq.setdefault(cod, {"c": cod, "n": m.group(4).strip(),
                                    "tipo": m.group(3).title(), "u": m.group(5),
                                    "sem": {}})
            resto = m.group(6)
            off = len(l) - len(resto)
            for n in re.finditer(r"\d{1,2}", resto):
                x = off + n.start()
                # el mes cuya cabecera queda mas cerca por la izquierda
                mes = min(pos, key=lambda p: abs(p[1] - x) if x >= p[1] - 14 else 10 ** 6)[0]
                e["sem"][mes] = int(n.group())
    return eq


def rutina():
    """La lista de actividades del formato en papel DMM-160L."""
    txt = subprocess.run(["pdftotext", "-layout", RUT, "-"],
                         capture_output=True, text=True, check=True).stdout
    acts, dentro = [], False
    for l in txt.splitlines():
        s = l.strip()
        if s.startswith("ACTIVIDAD"):
            dentro = True
            continue
        if not dentro or not s:
            continue
        if s.startswith(("TOTAL", "COMENTARIOS", "Hr M", "TRABAJOS", "Código:", "Edición")):
            break
        if re.match(r"^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ,/()Á-]{8,}$", s):
            acts.append(s.capitalize())
    return acts


def main():
    for f in (PROG, RUT):
        if not os.path.exists(f):
            sys.exit("falta " + f)

    eq = programa()
    if not eq:
        sys.exit("no se leyo el programa: revisa que pdftotext este instalado")

    # La comprobacion que justifica leer los numeros como semanas y no como dias.
    malas = [(c, m, w) for c, e in eq.items() for m, w in e["sem"].items()
             if NUM[m] not in meses_de_la_semana(w)]
    if malas:
        sys.exit(f"{len(malas)} casillas caen fuera de su mes, p.ej. {malas[:3]}. "
                 "O no son semanas ISO o el reparto por columnas fallo.")

    acts = rutina()
    if len(acts) < 10:
        sys.exit(f"solo se leyeron {len(acts)} actividades del DMM-160L")

    equipos = sorted(eq.values(), key=lambda e: e["n"])
    data = {
        "anio": ANIO,
        "doc": "DMM-173B · Programa anual de mantenimiento preventivo · "
               "Equipos de proceso y auxiliares · Sede 4 · Edición 2",
        "archivo": "manuales/_programa/DMM-173B-programa-anual-2026-Sede4-ed2.pdf",
        "meses": MESES,
        "equipos": equipos,
        "rutinas": [{
            "id": "dmm160l",
            "doc": "DMM-160L · Mantenimiento preventivo · Secadora de aire · Edición 1",
            "archivo": "manuales/_programa/DMM-160L-rutina-secadora-de-aire-ed1.pdf",
            "desde": "11 de noviembre de 2025",
            "grupo": "B",
            "tipo": "Proceso",
            "equipos": ["130317002", "130317001", "130317003"],
            "actividades": acts,
        }],
    }
    js = ("// Programa anual de mantenimiento preventivo (DMM-173B) y la rutina en\n"
          "// papel DMM-160L, pasados a datos.\n"
          "//\n"
          "// Ojo con las casillas del programa: el numero NO es un dia del mes, es la\n"
          "// SEMANA ISO del anio. Un trimestral cae en 3, 16, 29 y 42 -trece semanas\n"
          "// justas- y llegan hasta 52. El generador comprueba que cada semana caiga\n"
          "// dentro de su mes antes de escribir este archivo.\n"
          "// Generado con scripts/gen-programa-anual.py - no editar a mano.\n"
          "window.PROGRAMA_ANUAL = "
          + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(js)

    total = sum(len(e["sem"]) for e in equipos)
    porm = {m: sum(1 for e in equipos if m in e["sem"]) for m in MESES}
    print(f"equipos: {len(equipos)} · programaciones: {total} · "
          f"todas dentro de su mes · rutina DMM-160L: {len(acts)} actividades · "
          f"js: {len(js)} bytes")
    print("  " + " · ".join(f"{m[:3].lower()} {porm[m]}" for m in MESES))


if __name__ == "__main__":
    main()
