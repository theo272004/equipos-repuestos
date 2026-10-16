#!/usr/bin/env python3
"""Importa las compras de repuestos desde los reportes del ERP (MiPortal).

Lee uno o dos archivos, en cualquier orden y en cualquier formato (.xls, .xlsx o la
tabla HTML con extensión .xls que entrega MiPortal):

  - RE355  «SEGUIMIENTO A REQUISICIONES»: qué se pidió, quién, cuándo y en qué va.
  - Órdenes de compra (columnas ORDEN, LINEA, PROVEEDOR, VENCE, RECIBIDO_…): a qué
    proveedor se pidió, cuándo vence y cuánto ha llegado.

y deja assets/js/compras-data.js (window.COMPRAS_DATA) para la pantalla «Por llegar», el
estado de compra de cada pieza y el cálculo de cuándo pedir.

Los reportes son de TODA la empresa. Aquí solo se queda lo que piden los usuarios de
mantenimiento (SOLICITANTES: FNEGRETE, SFUENTES y MCASTRO) y, de eso:
  - las líneas del RE355 que van a las bodegas de repuestos (R01, R02, R04) o cuyo código
    está en el plan de mantenimiento;
  - su orden de compra (se cruzan por número de orden + línea);
  Las órdenes de compra sueltas (sin requisición) no dicen quién las pidió: entran solo si su
  centro de costo es de un equipo o área que esos usuarios ya piden (p. ej. «GU. ENVASADO
  SOBRES 8 MARCHESINI»). Lo que otro usuario pidió (NGALVIS, BDOMINGUEZ…) no entra aunque
  el centro de costo sea el mismo.

Qué dicen las fechas (importa para no engañarse): «FEC ENTREGA» del RE355 y «VENCE» de la
orden son la fecha PROMETIDA de entrega, no cuándo llegó. Los reportes no traen fecha de
recepción: solo la cantidad recibida y si la línea ya está cerrada.

Cada vez que se corre se suma a lo que ya había: una línea que el reporte nuevo trae
reemplaza a la vieja (misma orden y línea) y las que no trae se conservan.

Uso:
  python3 scripts/importar-compras.py "Datos_64.xls" "Datos_63.xls"
  python3 scripts/importar-compras.py "Datos_64.xls" --probar        (no escribe, solo cuenta)
  python3 scripts/importar-compras.py --filtrar                      (re-aplica el filtro de solicitantes a lo ya guardado)

Para leer un .xls binario hace falta `xlrd` (pip install xlrd) o LibreOffice; si no hay
ninguno, guárdalo como .xlsx desde Excel. No ejecuta macros ni abre enlaces del archivo.
"""
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "assets" / "js" / "compras-data.js"
BODEGAS = {"R01", "R02", "R04"}


# ------------------------------------------------------------------ lectura
class _Tabla(HTMLParser):
    def __init__(self):
        super().__init__()
        self.filas, self.fila, self.celda = [], None, None

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.fila = []
        elif tag in ("td", "th") and self.fila is not None:
            self.celda = []

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.celda is not None and self.fila is not None:
            self.fila.append(html.unescape("".join(self.celda)).strip())
            self.celda = None
        elif tag == "tr" and self.fila is not None:
            self.filas.append(self.fila)
            self.fila = None

    def handle_data(self, data):
        if self.celda is not None:
            self.celda.append(data)


def _de_openpyxl(ruta):
    import openpyxl
    wb = openpyxl.load_workbook(ruta, data_only=True, read_only=True)
    ws = wb.worksheets[0]
    return [[("" if v is None else (v.strftime("%Y%m%d") if hasattr(v, "strftime") else str(v))) for v in r] for r in ws.iter_rows(values_only=True)]


def leer_tabla(ruta):
    ruta = Path(ruta)
    cab = ruta.read_bytes()[:8]
    if cab.lstrip()[:5].lower() in (b"<html", b"<!doc", b"<tabl"):
        t = _Tabla()
        try:
            t.feed(ruta.read_bytes().decode("utf-8"))
        except UnicodeDecodeError:
            t.feed(ruta.read_bytes().decode("latin-1"))
        return t.filas
    if zipfile.is_zipfile(ruta):
        return _de_openpyxl(ruta)
    # .xls binario (OLE): xlrd, y si no hay, LibreOffice lo convierte a .xlsx en una carpeta temporal
    try:
        import xlrd
        hoja = xlrd.open_workbook(str(ruta)).sheet_by_index(0)
        return [[("" if c.value in (None, "") else (str(int(c.value)) if c.ctype == 2 and float(c.value).is_integer() else str(c.value))) for c in hoja.row(i)] for i in range(hoja.nrows)]
    except ImportError:
        pass
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        sys.exit(f"No pude leer {ruta.name}: es un .xls binario y no hay xlrd ni LibreOffice. Instala xlrd (pip install xlrd) o guárdalo como .xlsx desde Excel.")
    with tempfile.TemporaryDirectory() as tmp:
        copia = Path(tmp) / "entrada.xls"
        shutil.copy(ruta, copia)
        subprocess.run([soffice, "--headless", "--convert-to", "xlsx", "--outdir", tmp, str(copia)], capture_output=True, timeout=180, check=False)
        salida = Path(tmp) / "entrada.xlsx"
        if not salida.exists():
            sys.exit(f"LibreOffice no pudo convertir {ruta.name}. Guárdalo como .xlsx desde Excel y vuelve a intentar.")
        return _de_openpyxl(salida)


def plano(t):
    return re.sub(r"[^A-Z0-9]+", " ", re.sub(r"[̀-ͯ]", "", __import__("unicodedata").normalize("NFD", str(t or ""))).upper()).strip()


def como_dict(filas, requeridas):
    """Busca la fila de títulos (la que trae todas las columnas pedidas) y devuelve las filas como dicts."""
    for i, f in enumerate(filas[:15]):
        t = [plano(x) for x in f]
        if all(r in t for r in requeridas):
            return [dict(zip(t, fila)) for fila in filas[i + 1:] if any(fila)]
    return None


# ------------------------------------------------------------------- campos
def fecha(v):
    s = str(v or "").strip().replace(".0", "")
    m = re.fullmatch(r"(\d{4})(\d{2})(\d{2})", s) or re.fullmatch(r"(\d{4})-(\d{2})-(\d{2}).*", s)
    return f"{m.group(1)}-{m.group(2)}-{m.group(3)}" if m else ""


def num(v):
    s = str(v or "").strip().replace(" ", "")
    if not s:
        return 0
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        x = float(s)
    except ValueError:
        return 0
    return int(x) if x.is_integer() else round(x, 3)


# Quién pide por mantenimiento: lo de los demás usuarios de la empresa no entra
SOLICITANTES = {"FNEGRETE", "SFUENTES", "MCASTRO"}


def cc_codigo(cc):
    """«GU - ENVASADO SOBRES 8 MARCHESINI» y «GU. ENVASADO…» (así lo escribe la orden) → «GU»."""
    return re.split(r"\s*[-.]\s", str(cc or "").strip(), maxsplit=1)[0].strip().upper()


def cod(v):
    s = str(v or "").strip().upper().replace("\t", "").replace(" ", "")
    return re.sub(r"\.0+$", "", s)


def limpio(d):
    return {k: v for k, v in d.items() if v not in ("", None, 0)}


def codigos_conocidos():
    plan, maestro = set(), set()
    try:
        s = (RAIZ / "assets" / "equipos.js").read_text(encoding="utf-8")
        m = re.search(r"window\.EQUIPOS_PLAN = ", s)
        cuerpo = s[m.end():]
        datos = json.loads(cuerpo[:cuerpo.rstrip().rfind(";")])
        plan = {r["cod"] for e in datos["equipos"] for r in e["r"] if r.get("cod")}
    except Exception as e:  # el plan es un extra: sin él solo cuentan las bodegas
        print("  (no pude leer el plan:", e, ")")
    try:
        maestro = {x[0] for x in json.loads((RAIZ / "assets" / "data" / "maestro-almacen.json").read_text(encoding="utf-8"))["items"]}
    except Exception as e:
        print("  (no pude leer el maestro:", e, ")")
    return plan, maestro


# --------------------------------------------------------------------- main
def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args and "--filtrar" not in sys.argv:
        sys.exit(__doc__)
    probar = "--probar" in sys.argv

    re355, oc, nombres = None, None, {}
    for a in args:
        filas = leer_tabla(a)
        r = como_dict(filas, ["CODIGO", "FEC PEDIDO", "ESTADO LINEA"])
        o = None if r else como_dict(filas, ["ORDEN", "LINEA", "PROVEEDOR", "VENCE"])
        if r:
            re355, nombres["re355"] = r, re.sub(r"^[0-9a-f]{8}-", "", Path(a).name)
        elif o:
            oc, nombres["oc"] = o, re.sub(r"^[0-9a-f]{8}-", "", Path(a).name)
        else:
            sys.exit(f"{Path(a).name}: no reconozco el reporte (no es el RE355 ni órdenes de compra).")
    print("Leído:", ", ".join(f"{k} = {v}" for k, v in nombres.items()))

    plan, maestro = codigos_conocidos()
    oc_idx = {}
    for r in oc or []:
        oc_idx[(str(r.get("ORDEN", "")).strip(), str(r.get("LINEA", "")).strip())] = r

    lineas, usadas = [], set()
    for r in re355 or []:
        c = cod(r.get("CODIGO"))
        alm = str(r.get("ALMAC", "")).strip()
        if not c or not (alm in BODEGAS or c in plan):
            continue
        if str(r.get("USUARIO", "")).strip().upper() not in SOLICITANTES:
            continue
        # «PLANEADA EN FIRME» y similares no son una orden de compra: solo cuentan los números
        ocn = str(r.get("ORD COMPRA", "")).strip()
        ocn = ocn if re.fullmatch(r"\d+", ocn) else ""
        ln = str(r.get("LINEA", "")).strip() if ocn else ""
        o = oc_idx.get((ocn, ln)) if ocn else None
        if o:
            usadas.add((ocn, ln))
        lineas.append(limpio({
            "c": c, "d": str(r.get("DESCRIPCION", "")).strip(), "fp": fecha(r.get("FEC PEDIDO")),
            "rq": str(r.get("NO REQUISICION", "")).strip(), "es": str(r.get("ESTADO", "")).strip(),
            "el": str(r.get("ESTADO LINEA", "")).strip().replace("None", ""),
            "q": num(r.get("REQUERIDO")), "o": num(o["ORDENADO"]) if o else num(r.get("ORDENADO")),
            "r": num(o["RECIBIDO"]) if o else num(r.get("RECIBIDO")), "u": str(r.get("U M", "")).strip(),
            "us": str(r.get("USUARIO", "")).strip(), "a": alm, "oc": ocn, "ln": ln, "fe": fecha(r.get("FEC ENTREGA")),
            "cc": str(r.get("CENTRO DE COSTO", "")).strip(), "mrp": str(r.get("MRP MPS", "")).strip(),
            "pv": o.get("PROVEEDOR", "").strip() if o else "", "fo": fecha(o.get("FECHA")) if o else "",
            "ve": fecha(o.get("VENCE")) if o else "", "fa": fecha(o.get("FEC APROBAC")) if o else "",
            "eo": o.get("ESTADO LINEA", "").strip() if o else "", "s": "r",
        }))
    previo = {}
    if DESTINO.exists():
        try:
            t = DESTINO.read_text(encoding="utf-8")
            previo = json.loads(t[t.index("window.COMPRAS_DATA = ") + len("window.COMPRAS_DATA = "):].rstrip().rstrip(";"))
        except Exception:
            previo = {}
    es_mio = lambda l: str(l.get("us", "")).upper() in SOLICITANTES
    ccs_mios = {cc_codigo(l.get("cc")) for l in [*lineas, *previo.get("lineas", [])] if es_mio(l) and l.get("cc")}
    cod_cc = lambda o: cc_codigo(o.get("CENTRO COSTO"))
    sueltas = 0
    for (ocn, ln), o in oc_idx.items() if oc else []:
        c = cod(o.get("CODIGO"))
        if cod_cc(o) not in ccs_mios:  # sin requisición no hay solicitante: vale el centro de costo
            continue
        if (ocn, ln) in usadas or o.get("BOD", "").strip() not in BODEGAS or o.get("ESTADO LINEA") != "ACTIVA":
            continue
        if not (c in maestro or c in plan):
            continue
        sueltas += 1
        lineas.append(limpio({
            "c": c, "d": str(o.get("DESCRIPCION", "")).strip(), "fp": fecha(o.get("FECHA")), "o": num(o.get("ORDENADO")),
            "r": num(o.get("RECIBIDO")), "u": str(o.get("UM", "")).strip(), "a": o.get("BOD", "").strip(), "oc": ocn, "ln": ln,
            "cc": str(o.get("CENTRO COSTO", "")).strip(), "pv": o.get("PROVEEDOR", "").strip(), "fo": fecha(o.get("FECHA")),
            "ve": fecha(o.get("VENCE")), "fa": fecha(o.get("FEC APROBAC")), "eo": "ACTIVA", "s": "o",
        }))

    def clave(l):
        # Una orden puede juntar varias requisiciones: la clave lleva también la requisición
        if l.get("oc"):
            return f"{l['oc']}-{l.get('ln', '')}-{l.get('rq', '')}"
        return f"rq:{l.get('rq', '')}:{l['c']}:{l.get('fp', '')}:{l.get('q', 0)}:{l.get('us', '')}:{l.get('a', '')}"

    # Lo ya guardado: de los tres usuarios, o una orden suelta de un centro de costo que ellos piden
    por_clave = {clave(l): l for l in previo.get("lineas", []) if es_mio(l) or (not l.get("us") and cc_codigo(l.get("cc")) in ccs_mios)}
    quitadas = len(previo.get("lineas", [])) - len(por_clave)
    nuevas = sum(1 for l in lineas if clave(l) not in por_clave)
    for l in lineas:
        por_clave[clave(l)] = l
    todas = sorted(por_clave.values(), key=lambda l: (l.get("fp", ""), l["c"]))
    fps = [l["fp"] for l in todas if l.get("fp")]
    hoy = (datetime.now(timezone.utc) - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M")
    datos = {
        "generado": hoy, "desde": min(fps) if fps else "", "hasta": max(fps) if fps else "",
        "fuentes": {**previo.get("fuentes", {}), **nombres},
        "alcance": "Pedidos de FNEGRETE, SFUENTES y MCASTRO a las bodegas de repuestos R01, R02 y R04 o con código del plan, y su orden de compra.",
        "lineas": todas,
    }
    print(f"Líneas de mantenimiento en este import: {len(lineas)} (de las cuales {sueltas} son órdenes sin requisición) · nuevas: {nuevas} · quitadas por no ser de ustedes: {quitadas} · total guardado: {len(todas)}")
    if probar:
        print("(--probar: no se escribió nada)")
        return
    DESTINO.write_text(
        "// Generado por scripts/importar-compras.py — no editar a mano.\n"
        "// Compras de repuestos (RE355 + órdenes de compra de MiPortal), solo lo de mantenimiento.\n"
        "// Ojo: FEC ENTREGA y VENCE son fechas PROMETIDAS; los reportes no traen la fecha real de recepción.\n"
        f"window.COMPRAS_DATA = {json.dumps(datos, ensure_ascii=False, separators=(',', ':'))};\n", encoding="utf-8")
    print("Escrito:", DESTINO.relative_to(RAIZ), f"({DESTINO.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
