#!/usr/bin/env python3
"""Importa los programas anuales de mantenimiento preventivo 2026 (DMM-173 Planta 2 y DMM-173B Sede 4)
a assets/data/cronograma-2026.json: por equipo (clave = id del registro), las SEMANAS del año programadas
en cada mes y cuántas actividades tiene al año.

  python3 scripts/importar-cronograma.py "DMM-173B ... Sede 4 ....xlsx" "DMM-173 ... Planta 2 ....xlsx" [--probar]

Formato de los Excel (hoja «2026» en Sede 4 y «ED 4  V01-2026» en Planta 2): encabezado en la fila 4, datos desde
la 6. Bloque izquierdo ene–jun (columnas F,H,J,L,N,P = «fecha programado»; G,I,K,M,O,Q = «ejecutado») y bloque
derecho jul–dic (W,Y,AA,AC,AE,AG programado). Cada número es la SEMANA del año. Las columnas «ejecutado» NO se
leen ni se guardan; tampoco los nombres de quien elaboró/revisó el programa.

Cruce con el registro: sede + código sin ceros. NO agrega equipos nuevos (scripts/cronograma-reglas.json):
 - «excluir»: códigos que se dejan fuera y se listan (NJP 3500, chillers 4307007/8).
 - «codigosViejos»: el cronograma trae un código antiguo; se enlaza con el vigente y se anota el antiguo.
 - «porDescripcion»: se busca por descripción (≥ umbral, único) y se marca para revisión; si no hay una coincidencia
   clara NO se enlaza y queda en «paraRevisar».
Además CRUZA (solo reporta, no corrige) la frecuencia anual con xls.f del plan de repuestos y con las letras FREC
de las hojas de vida. El reporte va a assets/data/cronograma-2026-reporte.json.
"""
import argparse
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

import openpyxl
from openpyxl.utils import column_index_from_string as ci

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
REGISTRO = RAIZ / "assets" / "equipos.js"
REGLAS = AQUI / "cronograma-reglas.json"
SALIDA = RAIZ / "assets" / "data" / "cronograma-2026.json"
REPORTE = RAIZ / "assets" / "data" / "cronograma-2026-reporte.json"
HOJAS = RAIZ / "assets" / "data" / "hojas-de-vida.json"

PROG = [("F", 1), ("H", 2), ("J", 3), ("L", 4), ("N", 5), ("P", 6), ("W", 7), ("Y", 8), ("AA", 9), ("AC", 10), ("AE", 11), ("AG", 12)]
EJEC = ["G", "I", "K", "M", "O", "Q", "X", "Z", "AB", "AD", "AF", "AH"]
FILA_ENCABEZADO, FILA_INICIO = 4, 6
# veces al año de cada columna FREC de las hojas de vida (la «D» y la «S» no son de un programa anual)
FREC_COLUMNA = {"M": 12, "2M": 6, "3M": 4, "6M": 2, "A": 1, "2A": 0.5}
# años por ciclo de xls.f del plan de repuestos. «1B» (= cada 2 años) se INFIERE de las fechas ej→px del plan.
XLS_ANIOS = {"3M": 0.25, "6M": 0.5, "9M": 0.75, "1A": 1, "1B": 2, "1,5A": 1.5, "3A": 3, "4A": 4}


def sin_ceros(c):
    return re.sub(r"^0+(?=\d)", "", str(c or "").strip())


def plano(t):
    t = unicodedata.normalize("NFD", str(t or "").lower()).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def parecido(a, b):
    """0..1: palabras de a que están en b (sin artículos)."""
    w = lambda t: {x for x in plano(t).split() if x not in {"de", "del", "la", "el", "no", "n"}}
    A, B = w(a), w(b)
    return len(A & B) / len(A) if A else 0.0


def leer_registro(ruta):
    s = Path(ruta).read_text(encoding="utf-8")
    m = re.search(r"window\.EQUIPOS_PLAN = ", s)
    cu = s[m.end():]
    return json.loads(cu[: cu.rstrip().rfind(";")])["equipos"]


def leer_programa(ruta, hoja, ubicacion):
    """-> (filas, avisos). fila = {fila, codigo, codigoDerecho, tipo, equipo, ubicacionHoja, semanas{mes:[semanas]}}."""
    wb = openpyxl.load_workbook(ruta, data_only=True)
    if hoja not in wb.sheetnames:
        sys.exit(f"{Path(ruta).name}: no existe la hoja «{hoja}». Hojas: {wb.sheetnames}")
    ws = wb[hoja]
    filas, avisos = [], []
    ejecutado = 0
    for r in range(FILA_INICIO, ws.max_row + 1):
        cod = ws.cell(r, 2).value
        if cod in (None, ""):
            continue                       # firmas y pie de página: no se leen
        semanas = {}
        for col, mes in PROG:
            v = ws[f"{col}{r}"].value
            if v in (None, ""):
                continue
            if isinstance(v, float) and v.is_integer():
                v = int(v)
            if not isinstance(v, int) or not 1 <= v <= 53:
                avisos.append(f"{ubicacion} fila {r}: valor no válido «{v}» en {col}{r} (se esperaba una semana 1–53)")
                continue
            semanas.setdefault(mes, []).append(v)
        ejecutado += sum(1 for c in EJEC if ws[f"{c}{r}"].value not in (None, ""))
        der = ws.cell(r, ci("S")).value
        filas.append({
            "fila": r, "codigo": sin_ceros(cod), "codigoDerecho": sin_ceros(der) if der not in (None, "") else "",
            "tipo": str(ws.cell(r, 3).value or "").strip(), "equipo": str(ws.cell(r, 4).value or "").strip(),
            "ubicacionHoja": str(ws.cell(r, 5).value or "").strip().upper(), "semanas": semanas,
        })
    if ejecutado:
        avisos.append(f"{ubicacion}: había {ejecutado} celdas «ejecutado» con datos; NO se guardaron")
    return filas, avisos


def enlazar(fila, ubicacion, registro, reglas):
    """-> (equipo | None, modo, motivo). modo: codigo | codigo-vigente | descripcion | None."""
    cod = fila["codigo"]
    if cod in reglas["excluir"] or fila["codigoDerecho"] in reglas["excluir"]:
        return None, "excluido", reglas["excluir"].get(cod) or reglas["excluir"][fila["codigoDerecho"]]
    por_cod = {(sin_ceros(e["c"]), e["u"]): e for e in registro}
    viejo = reglas["codigosViejos"].get(ubicacion, {}).get(cod)
    if viejo:
        e = por_cod.get((sin_ceros(viejo), ubicacion))
        if e:
            return e, "codigo-vigente", f"el cronograma trae el código antiguo {cod}; el vigente es {viejo}"
    if cod in reglas["porDescripcion"]:
        e = por_cod.get((cod, ubicacion))                      # 125334007: el código sí enlaza; se marca para revisión
        if e:
            return e, "codigo", reglas["porDescripcion"][cod]
        cand = sorted(((parecido(fila["equipo"], e["n"] + " " + e.get("nOriginal", "")), e) for e in registro if e["u"] == ubicacion and not e.get("retirado") and not e.get("evaluacion")), key=lambda t: -t[0])
        if cand and cand[0][0] >= reglas["umbralDescripcion"] and (len(cand) == 1 or cand[0][0] - cand[1][0] > 0.15):
            return cand[0][1], "descripcion", reglas["porDescripcion"][cod]
        top = [f"{e['c']} {e['n']}" for _, e in cand[:3]]
        return None, "sin-enlace-claro", f"{reglas['porDescripcion'][cod]}; sin coincidencia clara por descripción (más parecidos: {'; '.join(top)})"
    e = por_cod.get((cod, ubicacion))
    if e:
        if e.get("retirado") or e.get("evaluacion"):
            return None, "retirado", "el equipo está retirado/evaluación en el registro"
        return e, "codigo", ""
    return None, "no-registro", "no está en el registro (no se agregan equipos nuevos)"


def anios_xls(f):
    return XLS_ANIOS.get(str(f or "").strip().upper())


def main(argv=None):
    ap = argparse.ArgumentParser(description="Importa el cronograma anual 2026 (DMM-173 / DMM-173B).")
    ap.add_argument("sede4", help="DMM-173B Sede 4 (hoja «2026»)")
    ap.add_argument("planta2", help="DMM-173 Planta 2 (hoja «ED 4  V01-2026»)")
    ap.add_argument("--hoja-sede4", default="2026")
    ap.add_argument("--hoja-planta2", default="ED 4  V01-2026")
    ap.add_argument("--registro", default=str(REGISTRO))
    ap.add_argument("--hojas", default=str(HOJAS), help="hojas-de-vida.json (para cruzar letras FREC; opcional)")
    ap.add_argument("--reglas", default=str(REGLAS))
    ap.add_argument("--salida", default=str(SALIDA))
    ap.add_argument("--reporte", default=str(REPORTE))
    ap.add_argument("--probar", action="store_true")
    a = ap.parse_args(argv)

    reglas = json.loads(Path(a.reglas).read_text(encoding="utf-8"))
    registro = leer_registro(a.registro)
    hojas = json.loads(Path(a.hojas).read_text(encoding="utf-8")).get("equipos", {}) if Path(a.hojas).exists() else {}
    fuentes = {"SEDE 4": (a.sede4, a.hoja_sede4), "PLANTA 2": (a.planta2, a.hoja_planta2)}

    equipos, excluidos, para_revisar, no_registro, avisos = {}, [], [], [], []
    leidas = Counter()
    for ubic, (ruta, hoja) in fuentes.items():
        filas, av = leer_programa(ruta, hoja, ubic)
        avisos += av
        leidas[ubic] = len(filas)
        for f in filas:
            if f["ubicacionHoja"] and f["ubicacionHoja"] != ubic:
                avisos.append(f"{ubic} fila {f['fila']} ({f['codigo']}): la hoja dice ubicación «{f['ubicacionHoja']}»")
            if f["codigoDerecho"] and f["codigoDerecho"] != f["codigo"]:
                avisos.append(f"{ubic} fila {f['fila']}: el código del bloque izquierdo ({f['codigo']}) y el del derecho ({f['codigoDerecho']}) no coinciden")
            eq, modo, motivo = enlazar(f, ubic, registro, reglas)
            ref = {"ubicacion": ubic, "fila": f["fila"], "codigo": f["codigo"], "equipo": f["equipo"], "motivo": motivo}
            if eq is None:
                (excluidos if modo in ("excluido", "retirado") else para_revisar if modo == "sin-enlace-claro" else no_registro).append({**ref, "modo": modo})
                continue
            n = sum(len(v) for v in f["semanas"].values())
            d = {"codigo": eq["c"], "ubicacion": eq["u"], "nombre": eq["n"], "tipo": f["tipo"], "enlace": modo,
                 "semanasProgramadas": {str(m): sorted(v) for m, v in sorted(f["semanas"].items())}, "frecuenciaAnual": n}
            if f["codigo"] != eq["c"]:
                d["codigoCronograma"] = f["codigo"]
            if modo != "codigo" or motivo:
                d["revision"] = motivo or f"enlazado por {modo}"
            if modo == "descripcion":
                d["descripcionCronograma"] = f["equipo"]
            if eq["id"] in equipos:
                avisos.append(f"{ubic} fila {f['fila']}: el equipo {eq['id']} ya tenía cronograma; se conserva el primero")
                continue
            equipos[eq["id"]] = d
            if d.get("revision"):
                para_revisar.append({**ref, "modo": modo, "enlazadoCon": eq["id"]})

    # ---- cruces (solo reporte) ----
    por_id = {e["id"]: e for e in registro}
    disc_xls, disc_hoja, sin_plan, plan_sin_crono = [], [], 0, []
    for eid, d in equipos.items():
        e = por_id[eid]
        anios = [anios_xls(r.get("xls", {}).get("f")) for r in e.get("r", [])]
        anios = [x for x in anios if x]
        if anios:
            max_plan = max(1 / x for x in anios)
            if d["frecuenciaAnual"] < max_plan:
                disc_xls.append({"id": eid, "codigo": e["c"], "nombre": e["n"], "cronograma": d["frecuenciaAnual"],
                                 "planDeRepuestos": f"{max_plan:g} al año (pieza más frecuente: {min(anios):g} años por ciclo)"})
        else:
            sin_plan += 1
        h = hojas.get(eid)
        if h and h.get("frecuencias"):
            em = [c for c, v in h["frecuencias"].items() if v == "M" and c in FREC_COLUMNA]
            if em:
                implicado = max(FREC_COLUMNA[c] for c in em)
                if d["frecuenciaAnual"] != implicado:
                    disc_hoja.append({"id": eid, "codigo": e["c"], "nombre": e["n"], "cronograma": d["frecuenciaAnual"],
                                      "hojaDeVida": f"letra M en FREC-{', FREC-'.join(em)} ({implicado:g} al año)"})
    for e in registro:
        if e["id"] not in equipos and not e.get("retirado") and not e.get("evaluacion") and any(anios_xls(r.get("xls", {}).get("f")) for r in e.get("r", [])):
            plan_sin_crono.append({"codigo": e["c"], "ubicacion": e["u"], "nombre": e["n"]})

    por_modo = Counter(d["enlace"] for d in equipos.values())
    resumen = {"filasLeidas": dict(leidas), "equiposConCronograma": len(equipos),
               "porSede": dict(Counter(d["ubicacion"] for d in equipos.values())), "porEnlace": dict(por_modo),
               "excluidos": len(excluidos), "noEstanEnElRegistro": len(no_registro), "paraRevisar": len(para_revisar),
               "actividadesAlAnio": sum(d["frecuenciaAnual"] for d in equipos.values()),
               "discrepanciasConPlanDeRepuestos": len(disc_xls), "discrepanciasConHojasDeVida": len(disc_hoja)}
    salida = {
        "nota": "Cronograma anual de mantenimiento preventivo 2026: por equipo, las SEMANAS del año programadas en cada mes y la cantidad de actividades al año. Solo lo programado: no incluye ejecutado. Generado por scripts/importar-cronograma.py.",
        "anio": 2026, "generado": date.today().isoformat(),
        "programas": {"SEDE 4": "DMM-173B Programa anual de mantenimiento preventivo, equipos de proceso y auxiliares, Sede 4 (ED 2 V03-2026, 2026-06-17), hoja «2026»",
                      "PLANTA 2": "DMM-173 Programa anual de mantenimiento preventivo, equipos de proceso y auxiliares, Planta 2 (V01-2026), hoja «ED 4  V01-2026»"},
        "equipos": dict(sorted(equipos.items())),
    }
    reporte = {"generado": date.today().isoformat(), "resumen": resumen, "excluidos": excluidos, "noEstanEnElRegistro": no_registro,
               "paraRevisar": para_revisar, "avisos": avisos, "discrepancias": {
                   "nota": "Solo se reportan; no se corrigió nada. Plan de repuestos: el cronograma tiene MENOS actividades al año que la pieza más frecuente del plan (xls.f; «1B» = cada 2 años, inferido). Hojas de vida: la letra M (Mantenimiento) en una columna FREC implica otra cantidad al año (D y S no cuentan).",
                   "conPlanDeRepuestos": disc_xls, "conHojasDeVida": disc_hoja,
                   "equiposConPlanSinCronograma": plan_sin_crono, "equiposConCronogramaSinFrecuenciaEnElPlan": sin_plan}}
    print(json.dumps(resumen, ensure_ascii=False, indent=1))
    for av in avisos:
        print("AVISO:", av)
    if a.probar:
        return print("(--probar: no se escribió nada)")
    Path(a.salida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.salida).write_text(json.dumps(salida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    Path(a.reporte).write_text(json.dumps(reporte, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Escrito: {a.salida} y {a.reporte}")


if __name__ == "__main__":
    main()
