# Pasa a datos el extracto del catalogo de almacen del portal de la empresa
# (informe RE356) y lo deja en assets/js/almacen.js.
#
# Que aporta que no tuvieramos: para cada codigo, su DESCRIPCION oficial, la
# unidad de medida, el precio, la existencia, el stock minimo, los dias de
# aprovisionamiento, el consumo mensual y -lo mas util en planta- EN QUE
# ALMACEN Y EN QUE ESTANTE esta. El plan de mantenimiento solo sabia si habia
# o no habia.
#
# Dos avisos que van tambien a la interfaz, porque cambian como hay que leerlo:
#
# - Es un EXTRACTO, no el catalogo entero: de los 423 codigos internos que usa
#   nuestro plan, aqui aparecen 159. Que un codigo no este no significa que no
#   exista, solo que no venia en este archivo.
# - No trae fecha de corte por ningun lado, ni en las celdas ni en el nombre.
#   La existencia de un almacen cambia a diario, asi que se muestra como "lo
#   que decia el portal", no como la verdad de hoy.
#
# El mismo codigo puede estar en varios almacenes: la existencia se suma y las
# ubicaciones se guardan todas.
#
# Las familias salen de los digitos del codigo, que en esta casa si significan
# algo: 7419 son rodamientos, 7412 bandas y correas, 7422 cable... Se nombran
# leyendo lo que hay dentro de cada una, no inventando.
#
# Se ejecuta con xlrd (pip install xlrd).
import io, json, os, re, sys
import xlrd

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLS = os.path.join(R, "manuales", "_almacen", "RE356-extracto-catalogo-almacen.xls")
EQ = os.path.join(R, "assets", "equipos.js")
OUT = os.path.join(R, "assets", "js", "almacen.js")

# Familias por prefijo de codigo. Las de 4 digitos mandan sobre las de 3.
FAM4 = {
    "7411": "Soldadura",
    "7412": "Bandas y correas",
    "7413": "Neumática, válvulas y fluidos",
    "7414": "Plásticos técnicos",
    "7415": "Cintas, adhesivos y sellantes",
    "7416": "Perfilería y estructura",
    "7417": "Control e instrumentación",
    "7418": "Pinturas y acabados",
    "7419": "Rodamientos",
    "7420": "Bronce, ejes y bujes",
    "7421": "Mangueras y acoples",
    "7422": "Cable y material eléctrico",
    "7423": "Resortes",
    "7425": "Cerrajería y herrajes",
    "7426": "Varios de obra",
    "7427": "Baterías",
    "7429": "Tornillería",
}
FAM3 = {
    "150": "Rodillos y caucho",
    "170": "Protección personal",
    "240": "Cómputo y detección de incendio",
    "514": "Otros",
    "711": "Instrumentos de medición",
    "712": "Instrumentos eléctricos",
    "713": "Herramienta manual",
    "721": "Laboratorio y reactivos",
    "722": "Aspiradoras y su filtración",
    "724": "Repuestos de máquinas de empaque",
    "731": "Encapsulado y transmisión",
    "732": "Ventilación y blowers",
    "733": "Filtración y lámparas UV",
    "734": "Automatización y PLC",
    "735": "Repuestos MIA",
    "743": "Tubería y accesorios PVC",
    "744": "Lubricantes y engrase",
}


def familia(cod):
    if not re.fullmatch(r"\d{9}", cod):
        return "Código de fabricante"
    return FAM4.get(cod[:4]) or FAM3.get(cod[:3]) or "Sin clasificar"


def codigos_del_plan():
    src = io.open(EQ, encoding="utf-8").read()
    m = re.search(r"(\[\s*\{.*\}\s*\])", src, re.S)
    data = json.loads(m.group(1))
    eq = []

    def walk(o):
        if isinstance(o, dict):
            if "mid" in o:
                eq.append(o)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)

    walk(data)
    usados = {}
    for e in eq:
        if str(e["c"]) == "1":          # la fila que no es un equipo
            continue
        for r in e["r"]:
            c = (r.get("cod") or "").strip()
            if c:
                usados.setdefault(c, []).append((str(e["c"]), r.get("e")))
    return usados


def main():
    if not os.path.exists(XLS):
        sys.exit("falta " + XLS)
    sh = xlrd.open_workbook(XLS).sheet_by_index(0)
    hdr = [str(sh.cell_value(0, c)).strip() for c in range(sh.ncols)]
    idx = {h: i for i, h in enumerate(hdr)}
    for need in ("CODIGO", "DESCRIPCION", "EXISTENCIA", "ALMACEN", "UBICACION"):
        if need not in idx:
            sys.exit(f"el extracto no trae la columna {need}: {hdr}")

    cat = {}
    for r in range(1, sh.nrows):
        v = lambda h: sh.cell_value(r, idx[h])
        cod = str(v("CODIGO")).strip()
        if not cod:
            continue
        it = cat.setdefault(cod, {
            "c": cod, "d": " ".join(str(v("DESCRIPCION")).split()),
            "um": str(v("U/M")).strip(), "pr": 0, "ex": 0, "min": 0,
            "dias": 0, "cons": 0, "ubi": [], "f": familia(cod),
        })
        it["pr"] = int(v("PRECIO UNIT") or 0)
        it["min"] = int(v("STOCK_MINIMO") or 0)
        it["dias"] = int(v("DIAS_APROV") or 0)
        it["cons"] = int(v("CONSUMO_MES") or 0)
        it["ex"] += int(v("EXISTENCIA") or 0)
        alm, ub = str(v("ALMACEN")).strip(), str(v("UBICACION")).strip()
        etiqueta = f"{alm}/{ub}" if ub else alm
        if etiqueta and etiqueta not in it["ubi"]:
            it["ubi"].append(etiqueta)

    usados = codigos_del_plan()
    enPlan = [c for c in cat if c in usados]
    # Descuadres de existencia: el plan dice una cosa y el portal otra.
    desc = []
    for c in enPlan:
        for eqc, e in usados[c]:
            if e is not None and int(e) != cat[c]["ex"]:
                desc.append(c)
                break

    items = sorted(cat.values(), key=lambda x: x["d"])

    # Se guarda como filas, no como objetos: repetir once nombres de campo en
    # 5.145 items costaba 200 KB de mas en un archivo que se baja al telefono
    # en planta. El orden de las columnas va documentado en "cols".
    familias = sorted({it["f"] for it in items})
    fidx = {f: i for i, f in enumerate(familias)}
    filas = [[it["c"], it["d"], it["um"], it["ex"], it["ubi"], fidx[it["f"]],
              it["pr"], it["min"], it["dias"], it["cons"],
              1 if it["c"] in usados else 0] for it in items]

    data = {
        "doc": "RE356 · Extracto del catálogo de almacén del portal de la empresa",
        "archivo": "manuales/_almacen/RE356-extracto-catalogo-almacen.xls",
        "corte": "",                     # el archivo no trae fecha por ningun lado
        "cols": ["c", "d", "um", "ex", "ubi", "f", "pr", "min", "dias", "cons", "p"],
        "familias": familias,
        "items": filas,
        "enPlan": len(enPlan),
        "delPlan": len(usados),
        "descuadres": sorted(set(desc)),
    }
    js = ("// Extracto del catalogo de almacen del portal de la empresa (informe RE356).\n"
          "//\n"
          "// OJO al leerlo: es un EXTRACTO y NO trae fecha de corte.\n"
          "//  - De los %d codigos internos que usa nuestro plan, aqui vienen %d. Que un\n"
          "//    codigo no este NO significa que no exista.\n"
          "//  - La existencia de un almacen cambia a diario y el archivo no dice de\n"
          "//    cuando es, asi que se muestra como \"lo que decia el portal\", no como\n"
          "//    la verdad de hoy.\n"
          "//\n"
          "// Lo que si aporta y no teniamos: descripcion oficial, unidad, precio, stock\n"
          "// minimo, dias de aprovisionamiento, consumo mensual y en que almacen y\n"
          "// estante esta cada cosa.\n"
          "// Generado con scripts/gen-almacen.py - no editar a mano.\n"
          "window.ALMACEN = " % (len(usados), len(enPlan))
          + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(js)

    porFam = {}
    for it in items:
        porFam[it["f"]] = porFam.get(it["f"], 0) + 1
    print(f"codigos: {len(items)} · en nuestro plan: {len(enPlan)} de {len(usados)} · "
          f"con descuadre de existencia: {len(set(desc))} · "
          f"familias: {len(porFam)} · js: {round(len(js)/1024)} KB")
    for f, n in sorted(porFam.items(), key=lambda x: -x[1])[:8]:
        print(f"    {n:>5}  {f}")


if __name__ == "__main__":
    main()
