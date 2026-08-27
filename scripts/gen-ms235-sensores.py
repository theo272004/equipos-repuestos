# Genera assets/js/ms235-sensores.js con los sensores de la MS235 tal como estan
# en el esquema electrico ES4220003: la sigla del esquema, el hilo que llega al
# PLC, que hace cada uno (en espaniol, de las listas de entradas) y la marca, el
# tipo y el codigo Schmucker de la lista de materiales.
#
# Sirve para dos cosas que se preguntan en planta: "que sensor va aqui" cuando
# falta uno, y "que pido" cuando hay que cambiarlo.
import fitz, re, json, io

R = r"C:\Users\NICOLAS\Desktop\equipos y repuestos"
PDF = R + r"\manuales\ms235\MS235-esquema-electrico-ES4220003.pdf"
OUT = R + r"\assets\js\ms235-sensores.js"

# En que parte de la maquina esta cada uno. La pagina del esquema dice el circuito,
# no el sitio fisico, asi que esto se agrupa por el circuito al que pertenece.
ZONA = {
    "18": "Planchas soldantes", "25": "Motor principal", "29": "Bobina y desbobinado",
    "30": "Arrastre de papel", "31": "Portabobinas y centrado", "32": "Corte de papel",
    "35": "Dosificacion", "35A": "Dosificacion (2.o cassette)", "40": "Cierre de planchas",
    "41": "Temperatura de planchas", "42": "Soldadura y dosis", "52": "Expulsion / rechazo",
}
# Los dos del segundo cassette no salen en la lista de entradas: en el esquema
# repiten la nomenclatura del primero con la letra A.
ESPEJO = {"B35A.1": "B35.1", "B35A.4": "B35.4"}


def filas(p, tol=3.0):
    rows = {}
    for w in p.get_text("words"):
        y = round(w[3], 1)
        k = next((kk for kk in rows if abs(kk - y) < tol), None)
        if k is None:
            rows[y] = []
            k = y
        rows[k].append((w[0], w[4]))
    return [(y, [t for x, t in sorted(rows[y])]) for y in sorted(rows)]


def limpia(resto):
    # El PDF repite el texto letra a letra al lado de la palabra entera.
    pal = []
    for w in resto.split():
        if len(w) > 2 and w.isalpha() and (not pal or pal[-1] != w):
            pal.append(w)
    return " ".join(pal)


d = fitz.open(PDF)
func, bom = {}, {}
for i in range(d.page_count):
    for _, ws in filas(d[i]):
        line = " ".join(ws)
        m = re.search(r"\b(B\d+[A-Z]?\.\d+)\s+(\d{4})\s+(.*)", line)
        if m:
            txt = limpia(m.group(3))
            if m.group(1) not in func or len(txt) > len(func[m.group(1)]["f"]):
                func[m.group(1)] = {"hilo": m.group(2), "f": txt, "pdf": i + 1}
        if i >= 84:
            m2 = re.match(r"^(B\d+[A-Z]?\.\d+)\s+(.*)", line)
            if m2:
                cod = re.search(r"\b([A-Z]\d[0-9A-Z]{9,11})\b", line)
                pal = []
                for w in m2.group(2).split():
                    if not pal or pal[-1] != w:
                        pal.append(w)
                resto = " ".join(pal)
                # marca y tipo van entre la denominacion y el codigo
                mm = re.search(r"\b(SELET|WENGLOR|SICK|DATALOGIC|RECHNER|TAKEX|CREI|OMRON|EUCHNER|BASLER)\b", resto)
                marca = mm.group(1) if mm else ""
                tipo = ""
                if mm:
                    tipo = resto[mm.end():]
                    tipo = re.sub(r"\b[A-Z]\d[0-9A-Z]{9,11}\b.*$", "", tipo).strip(" 1")
                bom[m2.group(1)] = {"cod": cod.group(1) if cod else "", "marca": marca,
                                    "tipo": tipo.strip(), "pdf": i + 1,
                                    "den": limpia(m2.group(2).split(marca)[0]) if marca else ""}
d.close()

sensores = []
for s in sorted(set(list(func) + list(bom)), key=lambda x: (int(re.match(r"B(\d+)", x).group(1)), x)):
    fn = func.get(s, {})
    bm = bom.get(s, {})
    espejo = ESPEJO.get(s)
    texto = fn.get("f", "")
    nota = ""
    if not texto and espejo and espejo in func:
        texto = func[espejo]["f"]
        nota = "El esquema no lo lista aparte: repite el circuito de " + espejo + " para el segundo cassette."
    grupo = re.match(r"B(\d+[A-Z]?)\.", s).group(1)
    sensores.append({
        "sigla": s,
        "zona": ZONA.get(grupo, "Por confirmar"),
        "f": (texto or "Por confirmar en el esquema").capitalize(),
        "marca": bm.get("marca", ""),
        "tipo": bm.get("tipo", ""),
        "cod": bm.get("cod", ""),
        "hilo": fn.get("hilo", ""),
        "den": bm.get("den", ""),
        "nota": nota,
    })

js = ("// Sensores de la MS235 segun el esquema electrico ES4220003 (Schmucker,\n"
      "// 30/03/2023): sigla, que hace, marca y tipo, codigo Schmucker e hilo al PLC.\n"
      "// Generado con scripts/gen-ms235-sensores.py - no editar a mano.\n"
      "window.MS235_SENSORES = " + json.dumps(sensores, ensure_ascii=False, separators=(",", ":")) + ";\n")
io.open(OUT, "w", encoding="utf-8", newline="\n").write(js)
print("sensores:", len(sensores), "· con codigo:", sum(1 for s in sensores if s["cod"]),
      "· con funcion:", sum(1 for s in sensores if not s["f"].startswith("Por confirmar")))
for s in sensores:
    print(f"  {s['sigla']:<8} {s['zona'][:26]:<28} {s['f'][:40]:<42} {s['marca']:<10} {s['tipo'][:24]:<26} {s['cod']}")
