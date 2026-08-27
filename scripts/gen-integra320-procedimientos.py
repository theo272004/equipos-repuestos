# Saca del manual de Calibrado de la Integra-320 (M4160012) las paginas de
# procedimiento de mantenimiento, que son bilingues y llevan la figura, y las
# deja agrupadas por grupo de maquina en assets/js/integra320-procedimientos.js.
#
# El despiece de esta maquina ya estaba cargado (399 tablas indexadas por codigo
# de pieza), asi que aqui NO se toca: lo que faltaba eran los procedimientos.
import fitz, re, json, io, os
from PIL import Image

R = r"C:\Users\NICOLAS\Desktop\equipos y repuestos"
CALIB = R + r"\manuales\integra320\Integra320-calibrado-y-regulaciones.pdf"
OUT = R + r"\assets\js\integra320-procedimientos.js"
IMG = R + r"\assets\integra320\mec"

# Los dos digitos que van tras "M4x" identifican la zona de la maquina. Se deduce
# de los grupos que si llevan procedimiento con nombre y sirve para agrupar.
ZONAS = {
    "12": "Cabeza de alimentación de producto",
    "15": "Pre-punción",
    "18": "Tambor cicloide (alveolado)",
    "22": "Empalme de película de cobertura",
    "25": "Desenrollado y reenvío de películas",
    "30": "Estación de precalentamiento",
    "35": "Estación de formación",
    "50": "Alimentación y enrasador",
    "52": "Control de visión (telecámara)",
    "55": "Reenvío de película de cobertura",
    "60": "Estación de soldadura",
    "62": "Transporte embragado",
    "65": "Cortador",
    "75": "Cinta de salida",
    "90": "Refrigeración y filtros",
}

os.makedirs(IMG, exist_ok=True)
d = fitz.open(CALIB)

proc, actual = {}, None
for i in range(d.page_count):
    lines = [l.strip() for l in d[i].get_text().split("\n") if l.strip()]
    for l in lines:
        m = re.fullmatch(r"\d+\.\d+\.\s+([MS][0-9A-Z][A-Z]\d{8})-\d\.\d", l)
        if m:
            actual = m.group(1)
    tits = [l for l in lines if re.match(r"^\d+\.\d+\.\d+\.", l)]
    if actual and tits:
        t = re.sub(r"^[\d.]+\s*", "", tits[-1]).strip()
        if t and not t.startswith("("):
            proc.setdefault(actual, [])
            if not any(p["pg"] == i + 1 for p in proc[actual]):
                proc[actual].append({"pg": i + 1, "t": t.capitalize()})

tot = 0
grupos = []
for cod in sorted(proc, key=lambda c: (c[3:5], c)):
    ps = proc[cod]
    for p in ps:
        dest = os.path.join(IMG, f"c{p['pg']:03d}.jpg")
        if not os.path.exists(dest):
            pix = d[p["pg"] - 1].get_pixmap(dpi=150)
            im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            im.thumbnail((1000, 1000), Image.LANCZOS)
            im.save(dest, "JPEG", quality=68, optimize=True, progressive=True)
        tot += os.path.getsize(dest)
        p["img"] = f"assets/integra320/mec/c{p['pg']:03d}.jpg"
    grupos.append({"cod": cod, "zona": ZONAS.get(cod[3:5], "Por confirmar"), "proc": ps})
d.close()

# Sobran las imagenes de una version anterior de este script.
usadas = {os.path.basename(p["img"]) for g in grupos for p in g["proc"]}
for f in os.listdir(IMG):
    if f not in usadas:
        os.remove(os.path.join(IMG, f))

data = {"ref": "4-M4160012-001 · Marchesini Group — Calibrado y regulaciones", "grupos": grupos}
js = ("// Procedimientos de mantenimiento de la Integra-320, del manual de Calibrado\n"
      "// Marchesini M4160012. Cada pagina trae el texto en italiano y espaniol y la\n"
      "// figura de la operacion. El despiece de esta maquina va aparte (399 tablas).\n"
      "// Generado con scripts/gen-integra320-procedimientos.py - no editar a mano.\n"
      "window.PROC_DATA = window.PROC_DATA || {};\n"
      "window.PROC_DATA.integra320 = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
io.open(OUT, "w", encoding="utf-8", newline="\n").write(js)
print(f"grupos: {len(grupos)} · paginas: {sum(len(g['proc']) for g in grupos)} · "
      f"imagenes: {round(tot / 1048576, 2)} MB · js: {len(js)} bytes")
