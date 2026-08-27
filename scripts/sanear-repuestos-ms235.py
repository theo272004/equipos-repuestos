# Sanea los repuestos de la MS235 que entraron de la lista de recambios de 2 anos:
#
#  1. Quita los duplicados: la misma referencia habia entrado dos veces, una a
#     mano (con criticidad y funcion escritas) y otra de la lista.
#  2. Les pone nombre util. La lista trae "RELE", "MODULO", "CONECTOR" a secas,
#     que en una tabla de 100 filas no distingue nada; se les anade la marca y
#     el modelo que si trae la descripcion italiana.
#  3. Cruza los sensores con el esquema ES4220003: se anade la sigla (B29.8...)
#     y cuantas posiciones cubre ese modelo, que es lo que decide si hay que
#     tener uno en almacen.
#  4. Ajusta la criticidad con ese dato: un modelo que cubre varias posiciones
#     es critico; los cables y conectores no.
import io, re, json
from collections import Counter

R = r"C:\Users\NICOLAS\Desktop\equipos y repuestos"
P = R + r"\assets\js\machines-data.js"

sen = json.loads(io.open(R + r"\assets\js\ms235-sensores.js", encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))
porCod = {}
for s in sen:
    if s["cod"]:
        porCod.setdefault(s["cod"], []).append(s)

s = io.open(P, encoding="utf-8").read()
ini = s.index("          spareParts: [", s.index('id: "ms235"'))
fin = s.index("\n          ],", ini)
cabecera = "          spareParts: [\n"
cuerpo = s[ini + len(cabecera):fin]
lineas = [l for l in cuerpo.split("\n") if l.strip().startswith("{ name:")]
print("entradas:", len(lineas))

RX = re.compile(r'\{ name: "(?P<n>.*?)", system: "(?P<sy>.*?)", type: "(?P<t>.*?)", '
                r'criticality: "(?P<c>.*?)", reference: "(?P<r>.*?)"(?:, qty: (?P<q>\d+))?, function: "(?P<f>.*?)" \}')


def cod_de(ref):
    m = re.match(r"([A-Z0-9][A-Z0-9.]{5,})", ref)
    return m.group(1) if m else ""


ent = []
for l in lineas:
    m = RX.search(l)
    assert m, l[:120]
    d = m.groupdict()
    d["cod"] = cod_de(d["r"])
    d["lista"] = "lista n.36" in d["f"]
    ent.append(d)

# 1. duplicados: gana la entrada escrita a mano, pero se le pega la cantidad
#    recomendada que solo trae la lista.
vistos = {}
salida = []
for e in ent:
    k = e["cod"]
    if k and k in vistos:
        prev = vistos[k]
        nueva, vieja = (e, prev) if e["lista"] else (prev, e)
        if nueva is e:                      # la de la lista es la que sobra
            if e.get("q") and not vieja.get("q"):
                vieja["q"] = e["q"]
            print("  duplicado quitado:", k, "·", e["n"][:38])
            continue
        # la de la lista habia entrado antes: se sustituye por la escrita a mano
        salida[salida.index(prev)] = e
        vistos[k] = e
        print("  duplicado quitado:", k, "·", prev["n"][:38])
        continue
    if k:
        vistos[k] = e
    salida.append(e)

# 2. nombre util para las entradas genericas de la lista
GENERICOS = {"modulo", "rele", "interruptor", "interruptor automatico", "conector", "cable",
             "fotocelula", "sensor de proximidad", "detector de proximidad", "electrovalvula",
             "inverter", "tarjeta acionamiento", "tarjeta accionamiento", "bloque diferencial",
             "polo neutro", "abrazadera", "zocalo pyf 08a omron", "zocalo para rele'", "filtro",
             "diodo", "contactor", "fuente de alimentacion", "proteccion electronica",
             "proteciion electronica", "microfiltro", "transformador", "teclado", "tope",
             "actuador para micro", "interruptor de seguridad", "tarjeta de red", "tarjeta safety",
             "modulo de contacto", "led fl amarillo 24v", "fotocelula fibra optica",
             "fotocelula amplificador"}
MARCAS = ("SIEMENS", "OMRON", "WEIDMULLER", "BECKHOFF", "LENZE", "PHOENIX", "SMC", "SELET",
          "WENGLOR", "SICK", "DATALOGIC", "RECHNER", "EUCHNER", "BASLER", "TAKEX", "SEEKA",
          "FINMOTOR", "CREI", "DROPSA", "NACHI", "EZO", "INA", "VARVEL")


def modelo(desc):
    """El modelo util de la descripcion italiana: la marca y la referencia comercial."""
    marca = next((m for m in MARCAS if m in desc.upper()), "")
    txt = re.sub(r"^[A-Z0-9]{6,}\s*·\s*", "", desc)
    txt = re.sub(r"\b(" + "|".join(MARCAS) + r")\b", "", txt, flags=re.I).strip(" .-")
    # la referencia comercial suele ser el token mas largo con letras y numeros
    cand = [t for t in re.split(r"[ ,]", txt) if len(t) >= 5 and re.search(r"\d", t) and re.search(r"[A-Za-z]", t)]
    ref = max(cand, key=len) if cand else ""
    return marca.title() if marca else "", ref


n_ren = 0
for e in salida:
    if not e["lista"]:
        continue
    base = e["n"].strip()
    if base.lower().rstrip(".") not in GENERICOS:
        continue
    marca, ref = modelo(e["r"])
    extra = " ".join(x for x in (marca, ref) if x)
    if extra:
        e["n"] = f"{base} {extra}".strip()
        n_ren += 1
print("  renombradas:", n_ren)

# 3 y 4. sensores: sigla del esquema, cuantas posiciones y criticidad acorde
BAJA = re.compile(r"^(Cable|Conector|Abrazadera|Led|Zocalo|Tope)", re.I)
n_sen = 0
for e in salida:
    ss = porCod.get(e["cod"])
    if ss:
        siglas = ", ".join(x["sigla"] for x in ss)
        zonas = sorted({x["zona"] for x in ss})
        e["f"] = (f"Va en {len(ss)} posici{'ón' if len(ss) == 1 else 'ones'} de la máquina — "
                  f"{siglas} ({', '.join(zonas)}), según el esquema ES4220003. " + e["f"])
        e["c"] = "Alta" if len(ss) >= 3 else e["c"]
        if not e.get("q") or int(e["q"]) < len(ss):
            e["q"] = str(len(ss))
        n_sen += 1
    elif e["lista"] and BAJA.match(e["n"]):
        e["c"] = "Baja"
print("  sensores cruzados con el esquema:", n_sen)


def esc(v):
    return v


nuevas = []
for e in salida:
    q = f', qty: {e["q"]}' if e.get("q") else ""
    nuevas.append(f'            {{ name: "{e["n"]}", system: "{e["sy"]}", type: "{e["t"]}", '
                  f'criticality: "{e["c"]}", reference: "{e["r"]}"{q}, function: "{e["f"]}" }}')

s = s[:ini] + cabecera + ",\n".join(nuevas) + s[fin:]
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("resultado:", len(salida), "repuestos")
