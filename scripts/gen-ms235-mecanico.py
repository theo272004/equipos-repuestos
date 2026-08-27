# Genera assets/js/ms235-mecanico.js a partir de los manuales de Schmucker:
#   · las 3 vistas MAG del catalogo de piezas, con la posicion real de cada
#     llamada (se saca de las lineas guia azules del PDF vectorial)
#   · las tavole de despiece de cada grupo, con sus numeros de pieza
#   · las paginas de procedimiento del manual de Calibrado, en espanol
import fitz, re, json, io, os
from PIL import Image

R = r"C:\Users\NICOLAS\Desktop\equipos y repuestos"
D = R + r"\manuales\ms235"
OUT = r"C:\Users\NICOLAS\Desktop\equipos y repuestos\assets\js\ms235-mecanico.js"
PIEZAS = D + r"\MS235-5-Piezas-de-Recambio-S4220003-ITA-SPA.pdf"
CALIB = D + r"\MS235-4-Calibrado-Regulaciones-S4220003-ITA-SPA.pdf"
W, H = 595.2755737304688, 841.8897705078125

# Nombre oficial del grupo. Los que llevan nombre salen de la "Lista de recambios
# recomendada por 2 anos" (lista n.36) y del manual de Calibrado; los que no
# aparecen en ningun manual se dejan marcados para completarlos en planta.
NOMBRES = {
    "S4M01100110": ("Bastidor y estructura de la máquina", "Grupo base sobre el que van montados el resto de grupos.", "por confirmar"),
    "S4M02100110": ("Motor principal y cadena en baño de aceite", "Motorización principal. Lleva la cadena, el tensor, la bomba y el filtro DROPSA y el baño de aceite.", "lista 2 anos"),
    "S4M12100110": ("Mando de arrastre del papel", "Arrastra el papel y lleva la lámina de corte vertical y los rodillos de arrastre.", "lista 2 anos"),
    "S4M14100110": ("Soldadura del papel (placas y mordazas)", "Placas soldantes, mordazas, membrana y tirantes con muelle. Es el grupo que calienta KM44.4.", "lista 2 anos"),
    "S4M15100110": ("Placa de anclaje", "Guías de la placa de anclaje del grupo de soldadura.", "calibrado"),
    "S4M16100110": ("Portabobina y empalme (cadena)", "Cadena del portabobina, con su lubricación y su tensión.", "lista 2 anos"),
    "S4M17100110": ("Guías de desviación del papel", "Guías por las que pasa el papel antes del formato.", "calibrado"),
    "S4M95100110": ("Fotocélula de lectura de muesca", "Lee la muesca impresa y corrige el centrado y la fase.", "calibrado"),
    "S3A95100310": ("PC de la máquina y juntas", "Ordenador de la instalación; se revisan sus juntas y su documentación.", "calibrado"),
    "S4A11100110": ("Grupo A11 · alimentación", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S4A11100420": ("Grupo A11.04", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S4A11100610": ("Grupo A11.06", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S4A11100720": ("Grupo A11.07", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S4A12100110": ("Toma de sobres y correa de motorización", "Regula la fase de toma de sobres; se controla el desgaste de su correa.", "calibrado + cambio de formato"),
    "S4A19100110": ("Arrastre de 6 sobres (3 puestos)", "Arrastra la banda de 6 sobres; lleva rodillos de arrastre y lámina de corte vertical.", "lista 2 anos"),
    "S4A19100720": ("Mando de la cuchilla horizontal", "Cuchilla fija y cuchilla giratoria, con la regulación de la distancia entre ambas.", "lista 2 anos"),
    "S4A21100230": ("Soldadura >118 (carro UL ATEX)", "Placas aislantes, bloques guía de mordaza y membrana larga L=149.", "lista 2 anos"),
    "S4A26100110": ("Desbobinado y cuchilla de corte", "Correas de desbobinado y cuchilla de corte del film.", "calibrado"),
    "S4A26100410": ("Portabobinas neumático D500 (eje D=74)", "Ejes neumáticos portabobinas y dispositivo de frenado.", "lista 2 anos"),
    "S4A26100920": ("Correa del portabobinas", "Correa de motorización del portabobinas.", "calibrado"),
    "S4A27100110": ("Guías de desviación del papel (2.ª línea)", "Guías de desviación del papel del segundo recorrido.", "calibrado"),
    "S4A71100310": ("Juntas esféricas de mando", "Juntas esféricas del mando; se revisa su juego.", "calibrado"),
    "S4A75100610": ("Rodillos de reenvío y desviación", "Rodillos por los que pasa el papel; se limpian y se mira su deslizamiento.", "calibrado"),
    "S4A90100110": ("Grupo A90", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S4A92100510": ("Grupo A92.05", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S4A92100720": ("Grupo A92.07", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S4A95100110": ("Grupo A95 · control", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S4A95101310": ("Grupo A95.13", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"),
    "S7A96100120": ("Instalación eléctrica de la máquina", "Armario y cableado; el manual de Calibrado trae su sustitución preventiva.", "calibrado"),
    "S4G71500310": ("Dosificador de cassette desmontable A+B", "Dosificación volumétrica: movimientos, ejes, muelles, rasador y aspiradores de polvo.", "lista 2 anos"),
    "S4G71500410": ("Dosificador de cassette desmontable largo", "Segundo dosificador, mismo mantenimiento que el A+B.", "lista 2 anos"),
    "S4A08100610": ("Mando de pinzas (juntas esféricas y cilindro)", "Juntas esféricas del mando de pinzas y limpieza del cilindro.", "calibrado"),
    "S4A26100220": ("Cojinetes de soporte de bobina", "Fijación y deslizamiento de los cojinetes que sujetan la bobina.", "calibrado"),
    "S4A70200210": ("Cinta transportadora de salida", "Cinta de salida: desgaste, tensión, centrado y limpieza.", "calibrado"),
    "S4A96100120": ("Instalación eléctrica (mantenimiento)", "Revisión y sustitución preventiva de la instalación eléctrica.", "calibrado"),
    "S4G72200210": ("Válvula estrella doble de dosificación", "Estrella de alimentación del producto: correa, guarniciones y motorreductor.", "lista 2 anos"),
}

MAPAS = [
    (19, "Vista 1 · grupos mecánicos principales"),
    (20, "Vista 2 · grupos de arrastre, corte y control"),
    (21, "Vista 3 · dosificación"),
]


def hotspots(doc, pi):
    """Posicion real de cada llamada: el extremo de su linea guia azul."""
    p = doc[pi]
    labels = []
    for w in p.get_text("words"):
        t = w[4]
        if len(t) == 11 and t[0] == "S" and t[2] in "AMG" and t[3:].isdigit():
            labels.append({"cod": t, "r": fitz.Rect(w[0], w[1], w[2], w[3])})
    leaders = []
    for g in p.get_drawings():
        f = g.get("fill")
        if not (f and abs(f[0]) < 0.01 and abs(f[1]) < 0.01 and f[2] > 0.99):
            continue
        pts = [(e.x, e.y) for it in g["items"] for e in it[1:] if isinstance(e, fitz.Point)]
        if len(pts) >= 2:
            leaders.append(pts)
    out = []
    pendientes = []
    for L in labels:
        cy = (L["r"].y0 + L["r"].y1) / 2
        best = None
        for pts in leaders:
            for a in pts:
                dist = min(abs(a[0] - L["r"].x0), abs(a[0] - L["r"].x1)) + abs(a[1] - cy)
                if best is None or dist < best[0]:
                    best = (dist, pts, a)
        if best and best[0] < 45:
            _, pts, near = best
            far = max(pts, key=lambda q: (q[0] - near[0]) ** 2 + (q[1] - near[1]) ** 2)
            out.append({"cod": L["cod"], "x": round(far[0] / W * 100, 2), "y": round(far[1] / H * 100, 2),
                        "_lx": L["r"].x0, "_ly": cy})
        else:
            pendientes.append({"cod": L["cod"], "lx": L["r"].x0, "ly": cy})
    # Cuando varias llamadas van apiladas comparten una sola linea guia: la que no
    # encuentra la suya se queda con la del vecino de su misma columna.
    for p in pendientes:
        cerca = [o for o in out if abs(o["_lx"] - p["lx"]) < 6 and abs(o["_ly"] - p["ly"]) < 60]
        if cerca:
            v = min(cerca, key=lambda o: abs(o["_ly"] - p["ly"]))
            out.append({"cod": p["cod"], "x": v["x"], "y": v["y"], "_lx": p["lx"], "_ly": p["ly"]})
    for o in out:
        o.pop("_lx", None); o.pop("_ly", None)
    return out


COD = re.compile(r"^[A-Z0-9][A-Z0-9._\-]{4,}$")
RUIDO = {"DIRITTI", "RISERVATI", "RESERVED", "RIGHTS"}


def tavole(doc):
    """Cada pagina de despiece: su numero de tavola y los numeros de pieza que lleva."""
    res = []
    for i in range(22, doc.page_count):
        lines = [l.strip() for l in doc[i].get_text().split("\n") if l.strip()]
        own = None
        for k, l in enumerate(lines):
            if re.fullmatch(r"\d\.\d", l) and k + 1 < len(lines) and re.fullmatch(r"\d{2}/\d{2}/\d{4}", lines[k + 1]):
                own = lines[k - 1] if k else None
                break
        parts = []
        for l in lines:
            if l == own or l in RUIDO or not COD.match(l):
                continue
            if re.fullmatch(r"\d{2}/\d{2}/\d{4}", l):
                continue
            if l not in parts:
                parts.append(l)
        res.append({"pg": i + 1, "own": own, "parts": parts})
    return res


def procedimientos(doc):
    """Paginas del manual de Calibrado, con el titulo en espanol de cada operacion."""
    res = {}
    actual = None
    for i in range(doc.page_count):
        lines = [l.strip() for l in doc[i].get_text().split("\n") if l.strip()]
        for k, l in enumerate(lines):
            m = re.fullmatch(r"\d+\.\d+\.\s+(S[0-9][A-Z]\d{8})-\d\.\d", l)
            if m:
                actual = m.group(1)
        # los titulos van numerados; el segundo del mismo numero es el espanol
        tits = [l for l in lines if re.match(r"^\d+\.\d+\.\d+\.", l)]
        titulo = ""
        if len(tits) >= 2:
            titulo = re.sub(r"^[\d.]+\s*", "", tits[-1]).strip()
        elif tits:
            titulo = re.sub(r"^[\d.]+\s*", "", tits[0]).strip()
        if actual and titulo:
            res.setdefault(actual, [])
            if not any(r["pg"] == i + 1 for r in res[actual]):
                res[actual].append({"pg": i + 1, "t": titulo.capitalize()})
    return res


pz = fitz.open(PIEZAS)
cal = fitz.open(CALIB)

# Las tres vistas MAG son el mismo dibujo en la misma posicion (se comprueba
# porque llamadas de paginas distintas caen en las mismas coordenadas), asi que
# las llamadas de las tres van sobre una sola imagen: un unico mapa de la maquina.
mapas = []
todas = []
for pg, titulo in MAPAS:
    for h in hotspots(pz, pg - 1):
        h["pg"] = pg
        todas.append(h)
vistos = {}
for h in todas:
    if h["cod"] in vistos:
        continue
    vistos[h["cod"]] = h
    # Varios grupos comparten el mismo punto; se separan un poco para poder tocarlos.
    k = sum(1 for o in vistos.values() if o is not h and abs(o["x"] - h["x"]) < 0.6 and abs(o["y"] - h["y"]) < 0.6)
    if k:
        h["x"] = round(h["x"] + 1.7 * k, 2)
        h["y"] = round(h["y"] + 1.1 * ((k % 2) * 2 - 1), 2)
# La pagina del catalogo es un A4 con mucho blanco alrededor. Se recorta al
# dibujo para que la maquina se vea grande, y las llamadas se recolocan igual.
CROP = (0.03, 0.10, 0.97, 0.74)
_im = Image.open(R + r"\assets\ms235\desp\mag20.jpg")
_w, _h = _im.size
_im.crop((int(CROP[0] * _w), int(CROP[1] * _h), int(CROP[2] * _w), int(CROP[3] * _h))).save(
    R + r"\assets\ms235\desp\mapa.jpg", "JPEG", quality=80, optimize=True, progressive=True)
for h in vistos.values():
    h["x"] = round((h["x"] / 100 - CROP[0]) / (CROP[2] - CROP[0]) * 100, 2)
    h["y"] = round((h["y"] / 100 - CROP[1]) / (CROP[3] - CROP[1]) * 100, 2)
mapas.append({"pg": 20, "t": "Vista general de la máquina", "img": "assets/ms235/desp/mapa.jpg",
              "hs": sorted(vistos.values(), key=lambda h: h["cod"])})

tav = tavole(pz)
proc = procedimientos(cal)

# Cada grupo se queda con sus tavole: desde la suya hasta la del siguiente grupo raiz.
raices = [t for t in tav if t["own"] and len(t["own"]) == 11 and t["own"][0] == "S"]
codigos_mapa = {h["cod"] for m in mapas for h in m["hs"]}
grupos = {}
for k, r in enumerate(raices):
    cod = r["own"]
    if cod not in NOMBRES and cod not in codigos_mapa:
        continue  # sub-tavola, no un grupo del mapa
    desde = tav.index(r)
    hasta = len(tav)
    for r2 in raices[k + 1:]:
        if r2["own"] in NOMBRES or r2["own"] in codigos_mapa:
            hasta = tav.index(r2)
            break
    n, d, fuente = NOMBRES.get(cod, (f"Grupo {cod}", "Sin nombre en los manuales cargados; se reconoce por su despiece.", "por confirmar"))
    piezas = []
    hojas = []
    for t in tav[desde:hasta]:
        hojas.append({"pg": t["pg"], "img": f"assets/ms235/desp/t{t['pg']:03d}.jpg", "tav": t["own"] or "", "p": t["parts"]})
        for p in t["parts"]:
            if p not in piezas:
                piezas.append(p)
    grupos[cod] = {
        "n": n, "d": d, "fuente": fuente,
        "hojas": hojas, "piezas": piezas,
        "proc": proc.get(cod, []) or proc.get(cod.replace("S7A", "S4A"), []),
    }

# Los grupos que solo salen en el manual de Calibrado (sin tavola propia) tambien cuentan.
for cod, ps in proc.items():
    if cod in grupos or cod not in NOMBRES:
        continue
    n, d, fuente = NOMBRES[cod]
    grupos[cod] = {"n": n, "d": d, "fuente": fuente, "hojas": [], "piezas": [], "proc": ps}

for g in grupos.values():
    for p in g["proc"]:
        p["img"] = f"assets/ms235/mec/c{p['pg']:03d}.jpg"
    g["proc"] = [p for p in g["proc"] if os.path.exists(
        r"C:\Users\NICOLAS\Desktop\equipos y repuestos\\" + p["img"].replace("/", "\\"))]

data = {"ref": "S4220003 · Schmucker S.r.l. (Marchesini Group)", "mapas": mapas, "grupos": grupos}

js = (
    "// Despiece mecanico y procedimientos de la MS235, sacados de los manuales de\n"
    "// Schmucker S4220003: las 3 vistas del catalogo de piezas con la posicion real\n"
    "// de cada llamada, las tavole de despiece de cada grupo con sus numeros de\n"
    "// pieza, y las paginas del manual de Calibrado en espanol.\n"
    "// Generado con scripts/gen-ms235-mecanico.py - no editar a mano.\n"
    "window.MS235_MEC = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(js)

print("mapas:", [(m["pg"], len(m["hs"])) for m in mapas])
print("grupos:", len(grupos))
for c, g in grupos.items():
    print(f"  {c} {g['n'][:46]:48} hojas={len(g['hojas']):3} piezas={len(g['piezas']):3} proc={len(g['proc'])}")
print("bytes:", len(js))
