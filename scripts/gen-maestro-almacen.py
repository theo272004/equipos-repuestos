# Pasa a datos el MAESTRO DE ARTICULOS de almacen (reporte RE356R de MiPortal)
# y lo deja en assets/data/maestro-almacen.json.
#
#   python3 scripts/gen-maestro-almacen.py ~/Descargas/Datos_49.xls --fecha 2026-09-28
#
# Que es y en que se diferencia del RE356 que ya usa Almacen:
#   - El RE356 (el del puente y el de "Cargar reporte") trae lo que HAY en el
#     estante: una fila por almacen y ubicacion, y no lista lo que esta en cero.
#   - El RE356R trae TODOS los codigos que existen en la empresa (13.651 en el
#     de septiembre de 2026), tengan existencia o no, pero sin estantes.
#   Con el maestro la app puede encontrar el codigo de cualquier pieza, aunque
#   no la tenga el plan ni este en el estante, y avisar cuando un codigo del
#   plan no existe.
#
# Lo que NO se guarda, a proposito: el precio, la existencia y el consumo.
# El repositorio es publico, y la lista de precios de toda la empresa no debe
# quedar en internet (por lo mismo el puente no sube precios por defecto). La
# existencia, ademas, caduca en dias: la buena es la del RE356 que se carga en
# Almacen. Si hace falta valorizar con los precios del RE356R, se carga el
# archivo en Almacen ("Cargar reporte RE356...") y se queda en ese equipo.
# Por eso el .xls tampoco se sube (manuales/_almacen/ esta en .gitignore).
#
# Un mismo codigo puede venir dos veces (CODIGO_MRP "M" y "N", con distinto
# minimo y existencia): se junta en una sola fila con el mayor minimo y el
# mayor plazo, y queda marcado como MRP si alguna de las dos lo era.
#
# Las familias salen de los digitos del codigo, que en esta casa si significan
# algo (7419 rodamientos, 7412 correas, 7422 material electrico...). Los
# nombres salen de leer lo que hay dentro de cada una, no de inventarlos.
#
# Se ejecuta con xlrd (pip install xlrd) o directamente con un .csv exportado de MiPortal.
import argparse, csv, datetime, io, json, os, re, subprocess, sys
try:
    import xlrd
except ImportError:
    xlrd = None

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(R, "assets", "data", "maestro-almacen.json")

# (nombre, grupo). "mtto" = lo que usa o puede usar mantenimiento; "otro" = de
# otras areas (laboratorio, sistemas, oficina, aseo...). Sirve para que al
# buscar salga primero lo nuestro y para el filtro "Solo mantenimiento".
FAM4 = {
    "7240": ("Repuestos de máquinas de proceso y empaque", "mtto"),
    "7419": ("Rodamientos, retenedores y chumaceras", "mtto"),
    "7422": ("Material eléctrico", "mtto"),
    "7412": ("Correas, bandas y cadenas", "mtto"),
    "7413": ("Válvulas", "mtto"),
    "7415": ("Sellos, O-rings, cintas y adhesivos", "mtto"),
    "7416": ("Perfiles, láminas y barras", "mtto"),
    "7417": ("Manómetros, controladores e instrumentos", "mtto"),
    "7420": ("Ejes, bujes y bronces", "mtto"),
    "7421": ("Mangueras, abrazaderas y boquillas", "mtto"),
    "7423": ("Resortes", "mtto"),
    "7425": ("Cerrajería, puertas y herrajes", "mtto"),
    "7426": ("Materiales de obra", "mtto"),
    "7427": ("Baterías y pilas", "mtto"),
    "7429": ("Tornillería", "mtto"),
    "7411": ("Soldadura", "mtto"),
    "7414": ("Plásticos técnicos", "mtto"),
    "7418": ("Pinturas y acabados", "mtto"),
    "7430": ("Tubería y accesorios", "mtto"),
    "7432": ("Brocas, fresas, machos y rimas", "mtto"),
    "7440": ("Lubricantes y grasas", "mtto"),
    "7311": ("Filtros de aire, lubricación y piezas de máquinas de cápsulas", "mtto"),
    "7319": ("Piñones, cremalleras y reductores", "mtto"),
    "7323": ("Ventiladores y manejadoras de aire", "mtto"),
    "7324": ("Variadores, molinos y mallas", "mtto"),
    "7325": ("Balanzas, impresoras y codificadoras", "mtto"),
    "7328": ("Bombas y sus repuestos", "mtto"),
    "7329": ("Tornillería", "mtto"),
    "7330": ("Tratamiento de agua", "mtto"),
    "7331": ("Intercambiadores de calor", "mtto"),
    "7337": ("Torno, fresadora y CNC", "mtto"),
    "7342": ("PLC y automatización", "mtto"),
    "7350": ("Máquinas MIA y VIM", "mtto"),
    "7370": ("Vapor y trampas", "mtto"),
    "7380": ("Detector de metales", "mtto"),
    "7300": ("Repuestos de máquinas de proceso y empaque", "mtto"),
    "7211": ("Equipos de laboratorio y análisis de agua", "otro"),
    "7212": ("Sensores, transmisores e instrumentos de medición", "mtto"),
    "7214": ("Aire acondicionado y refrigeración", "mtto"),
    "7215": ("Motores, servomotores y motorreductores", "mtto"),
    "7216": ("Aire comprimido y compresores", "mtto"),
    "7217": ("Calderas y quemadores", "mtto"),
    "7218": ("Tanques", "mtto"),
    "7220": ("Aspiradoras y equipos de aseo", "mtto"),
    "7280": ("Montacargas y apiladores", "mtto"),
    "7110": ("Papelería, oficina y mobiliario", "otro"),
    "7111": ("Sensores, transmisores e instrumentos de medición", "mtto"),
    "7112": ("Sensores, transmisores e instrumentos de medición", "mtto"),
    "7113": ("Herramienta manual", "mtto"),
    "7121": ("Instrumentos eléctricos y temporizadores", "mtto"),
    "7122": ("Alicates y pinzas", "mtto"),
    "7123": ("Herramienta eléctrica", "mtto"),
    "7131": ("Herramienta manual", "mtto"),
    "7132": ("Brocas, fresas, machos y rimas", "mtto"),
    "7133": ("Cilindros hidráulicos y neumáticos", "mtto"),
    "7000": ("Equipos y dotación de planta", "mtto"),
    "7500": ("Equipos y dotación de planta", "mtto"),
    "1701": ("Protección personal", "otro"),
    "1700": ("Protección personal", "otro"),
    "1810": ("Protección personal", "otro"),
    "1502": ("Químicos para calderas y agua", "mtto"),
    "2300": ("Químicos para calderas y agua", "mtto"),
    "1506": ("Tratamiento de agua", "mtto"),
    "8801": ("Balanzas, impresoras y codificadoras", "mtto"),
}
# Si los cuatro digitos no dicen nada, se mira por los dos primeros.
FAM2 = {
    "10": ("Papelería, oficina y mobiliario", "otro"),
    "35": ("Papelería, oficina y mobiliario", "otro"),
    "04": ("Aseo y cafetería", "otro"),
    "14": ("Aseo y cafetería", "otro"),
    "09": ("Empaque y embalaje", "otro"),
    "15": ("Químicos e insumos", "otro"),
    "88": ("Químicos e insumos", "otro"),
    "21": ("Cómputo y sistemas", "otro"),
    "24": ("Cómputo, redes y detección de incendio", "otro"),
    "26": ("Laboratorio · reactivos", "otro"),
    "27": ("Laboratorio · HPLC, columnas y repuestos", "otro"),
    "28": ("Laboratorio · vidriería y utensilios", "otro"),
    "29": ("Laboratorio · HPLC, columnas y repuestos", "otro"),
    "30": ("Laboratorio · reactivos", "otro"),
    "70": ("Equipos y dotación de planta", "mtto"),
    "71": ("Herramienta manual", "mtto"),
    "72": ("Equipos de planta", "mtto"),
    "73": ("Repuestos de maquinaria", "mtto"),
    "74": ("Materiales de mantenimiento", "mtto"),
}
# Codigos con letras: piezas de las maquinas de la casa. Se nombran por lo que
# hay dentro de cada prefijo.
FAMM = {
    "MFP": ("Piezas de máquinas de cápsulas (MFP)", "mtto"),
    "MKP": ("Piezas de máquinas de cápsulas K-Caps (MKP)", "mtto"),
    "MEP": ("Piezas de máquinas de gel y automáticos (MEP)", "mtto"),
    "MNP": ("Piezas de blisteadoras y encapsuladoras (MNP)", "mtto"),
    "MFI": ("Piezas de impresoras de cápsulas (MFI)", "mtto"),
    "MFA": ("Galgas y calibradores (MFA, MKC, MFM)", "mtto"),
    "MKC": ("Galgas y calibradores (MFA, MKC, MFM)", "mtto"),
    "MFM": ("Galgas y calibradores (MFA, MKC, MFM)", "mtto"),
    "MFS": ("Galgas y calibradores (MFA, MKC, MFM)", "mtto"),
    "MFC": ("Vibradores y tamices (MFC)", "mtto"),
    "MSE": ("Servicios de taller (MSE)", "mtto"),
    "MSP": ("Servicios de taller (MSE)", "mtto"),
}
OTRAS_M = ("Otras piezas con código M", "mtto")
SIN = ("Sin clasificar", "otro")


def familia(cod):
    if re.match(r"^M[A-Z]{2}", cod):
        return FAMM.get(cod[:3], OTRAS_M)
    if re.match(r"^\d{4}", cod):
        return FAM4.get(cod[:4]) or FAM2.get(cod[:2]) or SIN
    return SIN


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("xls", nargs="?", default=os.path.join(R, "manuales", "_almacen", "RE356R-maestro-articulos.xls"))
    ap.add_argument("--fecha", default="", help="Fecha del reporte (AAAA-MM-DD). El archivo no la trae.")
    ap.add_argument("--limpiar", action="store_true", help="Reemplazar el archivo maestro sin combinar con el existente.")
    a = ap.parse_args()
    if not os.path.exists(a.xls):
        sys.exit("falta el archivo " + a.xls)
    fecha = a.fecha or datetime.date.fromtimestamp(os.path.getmtime(a.xls)).isoformat()

    cat = {}
    if os.path.exists(OUT) and not a.limpiar:
        try:
            with open(OUT, "r", encoding="utf-8") as f:
                prev = json.load(f)
            for it in prev.get("items", []):
                # cols: ["cod", "desc", "um", "fam", "dias", "min", "mrp"]
                c, d, um, f_idx, dias, mn, mrp = it
                cat[c] = {"c": c, "d": d, "um": um, "min": mn, "dias": dias, "mrp": mrp}
        except Exception as e:
            print("Aviso: no se pudo leer maestro previo para combinar:", e)

    need = ("CODIGO", "DESCRIPCION", "U/M", "CODIGO_MRP", "STOCK_MINIMO", "DIAS_APROV")
    rows_data = []

    if a.xls.lower().endswith(".csv"):
        with open(a.xls, "r", encoding="utf-8-sig", errors="replace") as f:
            reader = list(csv.reader(f))
        if not reader:
            sys.exit("El archivo CSV está vacío")
        hdr = [str(c).strip().upper() for c in reader[0]]
        idx = {h: i for i, h in enumerate(hdr)}
        falta = [n for n in need if n not in idx]
        if falta:
            sys.exit(f"el reporte CSV no trae {falta}. Columnas: {hdr}")
        for r in reader[1:]:
            rows_data.append({h: r[idx[h]] if idx[h] < len(r) else "" for h in need})
    else:
        if xlrd is None:
            csv_alt = a.xls.rsplit(".", 1)[0] + ".csv"
            if os.path.exists(csv_alt):
                print(f"xlrd no instalado; usando CSV correspondiente: {csv_alt}")
                with open(csv_alt, "r", encoding="utf-8-sig", errors="replace") as f:
                    reader = list(csv.reader(f))
                hdr = [str(c).strip().upper() for c in reader[0]]
                idx = {h: i for i, h in enumerate(hdr)}
                for r in reader[1:]:
                    rows_data.append({h: r[idx[h]] if idx[h] < len(r) else "" for h in need})
            else:
                sys.exit("xlrd no está instalado y no se encontró archivo CSV alternativo. Instale xlrd o pase un .csv")
        else:
            sh = xlrd.open_workbook(a.xls).sheet_by_index(0)
            hdr = [str(sh.cell_value(0, c)).strip().upper() for c in range(sh.ncols)]
            idx = {h: i for i, h in enumerate(hdr)}
            falta = [n for n in need if n not in idx]
            if falta:
                sys.exit(f"el reporte no trae {falta}. Columnas: {hdr}")
            for r in range(1, sh.nrows):
                rows_data.append({h: sh.cell_value(r, idx[h]) for h in need})

    filas = 0
    for r_vals in rows_data:
        v = lambda h: r_vals.get(h, "")
        cod = re.sub(r"\s+", "", str(v("CODIGO")).strip().upper())
        cod = re.sub(r"\.0+$", "", cod)
        if not cod:
            continue
        filas += 1
        num = lambda h: float(v(h) or 0) if str(v(h)).strip() else 0.0
        it = cat.setdefault(cod, {"c": cod, "d": "", "um": "", "min": 0, "dias": 0, "mrp": 0})
        d = " ".join(str(v("DESCRIPCION")).split())
        if d and not it["d"]:
            it["d"] = d
        um = str(v("U/M")).strip()
        if um and not it["um"]:
            it["um"] = um
        it["min"] = max(it["min"], num("STOCK_MINIMO"))
        it["dias"] = max(it["dias"], num("DIAS_APROV"))
        if str(v("CODIGO_MRP")).strip().upper() == "M":
            it["mrp"] = 1

    items = sorted(cat.values(), key=lambda x: x["c"])
    fams = []
    fidx = {}
    for it in items:
        f = familia(it["c"])
        if f not in fidx:
            fidx[f] = len(fams)
            fams.append(f)
        it["f"] = fidx[f]

    entero = lambda n: int(n) if float(n).is_integer() else round(n, 3)
    data = {
        "doc": "Maestro de artículos de almacén · MiPortal, reporte RE356R",
        "fecha": fecha,
        "filasLeidas": filas,
        "total": len(items),
        "nota": "Sin precios ni existencias: el repositorio es público. Ver scripts/gen-maestro-almacen.py",
        "cols": ["cod", "desc", "um", "fam", "dias", "min", "mrp"],
        "familias": [[n, g] for n, g in fams],
        "items": [[it["c"], it["d"], it["um"], it["f"], entero(it["dias"]), entero(it["min"]), it["mrp"]] for it in items],
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    # Una fila por articulo: el diff de la proxima carga dice que codigos
    # entraron o cambiaron, en vez de una sola linea de un mega.
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    filasJs = data.pop("items")
    cabeza = dump(data)[:-1]
    txt = cabeza + ',"items":[\n' + ",\n".join(dump(f) for f in filasJs) + "\n]}\n"
    json.loads(txt)  # que siga siendo JSON valido
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(txt)

    porFam = {}
    for it in items:
        n, g = fams[it["f"]]
        porFam[n] = porFam.get(n, 0) + 1
    print(f"{filas} filas -> {len(items)} codigos, {len(fams)} familias, {os.path.getsize(OUT) // 1024} KB en {os.path.relpath(OUT, R)}")
    for n, c in sorted(porFam.items(), key=lambda x: -x[1])[:15]:
        print(f"  {c:5}  {n}")
    sinc = porFam.get(SIN[0], 0)
    if sinc:
        print(f"  ({sinc} sin clasificar: revisa FAM4/FAM2)")


if __name__ == "__main__":
    main()
