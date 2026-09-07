# Saca del manual de Calibrado de la MT-1100 (4-S3240005-001) las fichas de
# mantenimiento preventivo y las deja en assets/js/mt1100-procedimientos.js.
#
# Cada ficha del manual sale dos veces, primero en italiano y despues en
# espaniol, con la misma figura. De cada par nos quedamos con el titulo y los
# pasos del lado espaniol, pero el intervalo -H (300) - OIL (U)- solo esta
# impreso en el lado italiano, asi que los dos lados se fusionan por seccion.
#
# La figura importa: los pasos citan llamadas numeradas -"el pomo (1)"- que
# solo se entienden mirandola. Por eso cada ficha guarda su pagina como imagen,
# igual que se hizo con la Integra-320.
#
# A diferencia de aquella, aqui el intervalo se lee del manual y no se deduce,
# porque este manual tiene dos ejes: horas de funcionamiento (tabla 4.5) y
# meses de calendario para las sustituciones preventivas (tabla 4.6).
#
# Se ejecuta con poppler-utils (pdftotext/pdftoppm) y Pillow.
import io, json, os, re, subprocess, sys, tempfile
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CALIB = os.path.join(R, "manuales", "mt1100",
                     "MT1100-4-Calibrado-Regulaciones-S3240005-ITA-SPA.pdf")
OUT = os.path.join(R, "assets", "js", "mt1100-procedimientos.js")
IMG = os.path.join(R, "assets", "mt1100", "mec")

# Los tres caracteres que van tras "S3" identifican el grupo de la maquina. El
# manual no trae una lista de zonas, asi que el nombre sale de las operaciones
# que cada grupo agrupa, leidas de sus propias fichas.
ZONAS = {
    "S3M01100320": "Bancada y guias generales",
    "S3M11100110": "Grupo de corte (lamas y juntas esfericas)",
    "S3M12200610": "Husillo de recirculacion de bolas",
    "S3M14100320": "Grupo de soldadura vertical",
    "S3M14200320": "Grupo de sellado horizontal",
    "S3M16100120": "Rodillos de arrastre de pelicula",
    "S3A14100320": "Cuchilla y rodillo de corte",
    "S3A19100330": "Orugas de arrastre y juntas toricas",
    "S3A19101410": "Transmision por correa del arrastre",
    "S3A26100420": "Rodillos y muelles de la estacion de corte",
    "S3A26101910": "Cuchilla de corte de stick",
    "S3A85101310": "Transmision por correa de la cinta",
    "S3A92300310": "Tubos de enfriamiento de stick (linea 1)",
    "S3A92300810": "Tubos de enfriamiento de stick (linea 2)",
    "S3A92301220": "Cabezales de silicona",
    "S3A92400910": "Cilindro neumatico de sensores de presencia",
    "S3A95100310": "Juntas de estanqueidad y PC de control",
    "S3A96100320": "Instalacion electrica",
}

# El manual numera sus paginas del 1 al 118, pero el PDF trae 6 hojas mas al
# principio (portada, hoja en blanco y el indice). Se comprueba mas abajo.
OFFSET = 6

ITW = re.compile(r"(zione\b|zioni\b|Verificare|Controllare|Pulire|Sostituire|"
                 r"Lubrificare|Asciugare|Attendere|dell'|della|delle|degli|"
                 r"mediante le|necessario|idoneo|PULIZIA|VERIFICA|SOSTITUZIONE|"
                 r"LUBRIFICAZIONE|GIUNTI|CINGHIA|RULLI|LAME|MOLLE|SMONTAGGIO|"
                 r"TUBI|TAGLIO)")
ESW = re.compile(r"(ción\b|ciones\b|Comprobar|Verificar|Verifique|Limpiar|"
                 r"Limpie|Sustituir|Lubricar|Seque|Espere|Utilizando|LIMPIEZA|"
                 r"COMPROBACI|CONTROL|SUSTITUCI|LUBRICACI|LUBRIFICACI|JUNTAS|"
                 r"CORREA|RODILLOS|MUELLES|CUCHILLA|GUÍAS|DESMONTAJE|TUBOS|CORTE)")
DOTS = re.compile(r"\.{3,}")
SKIP = re.compile(r"^\s*(Marchesini|4-S3240005|\d+ */ *118|Manutenzione preventiva|"
                  r"Mantenimiento Preventivo|[\d\s]+$|H \(\d+\)|OIL|\(\d+\)\s*$)", re.I)


def texto(*args):
    return subprocess.run(["pdftotext", *args, CALIB, "-"],
                          capture_output=True, text=True, check=True).stdout


def es(t):
    return len(ESW.findall(t)) - len(ITW.findall(t))


def fichas():
    """Lee las fichas del capitulo 4, fusionando el lado italiano y el espaniol."""
    crudas, grupo = [], None
    for pn, pag in enumerate(texto().split("\f"), 1):
        lineas = pag.splitlines()
        for i, l in enumerate(lineas):
            if DOTS.search(l):                       # linea del indice
                continue
            g = re.match(r"\s*4\.\d+\.\s+(S3[A-Z]\d{8})-[\d.]+\s*$", l)
            if g:
                grupo = g.group(1)
                continue
            m = re.match(r"\s*(4\.\d+\.\d+)\.\s+"
                         r"([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ0-9 ,'\-/()]{4,})\s*$", l)
            if not m or grupo is None:
                continue
            cuerpo = re.split(r"\n\s*4\.\d+\.\d+\.\s", "\n".join(lineas[i + 1:]))[0]
            h = re.search(r"H\s*\((\d+)\)", cuerpo)
            oil = re.search(r"OIL\s*\(([A-Z])\)", cuerpo)
            pasos = []
            for s in cuerpo.splitlines():
                s = s.strip().lstrip("•·").strip()
                if s and not SKIP.match(s) and len(s) >= 12:
                    pasos.append(re.sub(r"\s+", " ", s))
            crudas.append(dict(sec=m.group(1), grupo=grupo, t=m.group(2).strip(),
                               h=int(h.group(1)) if h else None,
                               oil=oil.group(1) if oil else None,
                               pg=pn, pasos=pasos,
                               lg=es(m.group(2) + " " + " ".join(pasos))))
    fus = {}
    for c in crudas:
        f = fus.setdefault(c["sec"], dict(sec=c["sec"], grupo=c["grupo"], h=None,
                                          oil=None, pg=c["pg"], t=None,
                                          pasos=[], lg=-99))
        if c["h"] is not None:
            f["h"] = c["h"]
        if c["oil"]:
            f["oil"] = c["oil"]
        if c["pasos"] and c["lg"] > f["lg"]:
            f.update(t=c["t"], pasos=c["pasos"], lg=c["lg"], pg=c["pg"])
        elif f["t"] is None:
            f.update(t=c["t"], pasos=c["pasos"], lg=c["lg"])
    for f in fus.values():
        f.pop("lg")
    return sorted(fus.values(), key=lambda f: [int(x) for x in f["sec"].split(".")])


def plan():
    """Tablas 4.5 (horas) y 4.6 (meses), solo el lado espaniol."""
    L = texto("-layout").splitlines()
    hdr = re.compile(r"^\s*([HM])\s*(\d+)\s+(?:OIL\s+)?Tipo (de intervenci|intervento)")
    filas, cur = [], None
    for l in L:
        h = hdr.match(l)
        if h:
            cur = (h.group(1), int(h.group(2))) if h.group(3).startswith("de") else None
            continue
        if cur is None:
            continue
        if re.match(r"\s*(Fecha:|Data:|4\.\d\.)", l):
            cur = None
            continue
        if re.match(r"\s*(Marchesini|4-S3240005|\d+ */ *118|Manutenzione|Mantenimiento)", l):
            continue
        m = re.match(r"\s*(?:S3[A-Z]\d{8})?\s*(?:([A-Z]) )?"
                     r"([A-ZÁÉÍÓÚÑÜ][^.]*?)\s{2,}(\d{2,3})\s*$", l)
        if m and len(m.group(2).strip()) > 4:
            filas.append(dict(u=cur[0], cada=cur[1], oil=m.group(1),
                              d=m.group(2).strip(), pg=int(m.group(3)) + OFFSET))
    return filas


def imagen(pg):
    dest = os.path.join(IMG, f"c{pg:03d}.jpg")
    if os.path.exists(dest):
        return os.path.getsize(dest)
    # pdftoppm no escribe a stdout: se le da un prefijo y deja <prefijo>.png
    with tempfile.TemporaryDirectory() as tmp:
        pre = os.path.join(tmp, "p")
        subprocess.run(["pdftoppm", "-r", "150", "-f", str(pg), "-l", str(pg),
                        "-png", "-singlefile", CALIB, pre], check=True)
        im = Image.open(pre + ".png").convert("RGB")
        im.thumbnail((1000, 1000), Image.LANCZOS)
        im.save(dest, "JPEG", quality=68, optimize=True, progressive=True)
    return os.path.getsize(dest)


def main():
    os.makedirs(IMG, exist_ok=True)
    fs, pl = fichas(), plan()
    if not fs or not pl:
        sys.exit("no se leyo el manual: revisa que pdftotext este instalado")

    # El offset de paginado se comprueba contra las fichas, que se localizan por
    # su pagina real del PDF: si no cuadra, el plan apuntaria a paginas erroneas.
    reales = {f["pg"] for f in fs}
    huerfanas = sorted({f["pg"] for f in pl} - reales)
    if huerfanas:
        sys.exit(f"el plan apunta a paginas sin ficha {huerfanas}: revisa OFFSET")

    tot = sum(imagen(f["pg"]) for f in fs)
    usadas = {f"c{f['pg']:03d}.jpg" for f in fs}
    for f in os.listdir(IMG):
        if f not in usadas:
            os.remove(os.path.join(IMG, f))

    grupos = []
    for cod in sorted({f["grupo"] for f in fs}, key=lambda c: (c[2:5], c)):
        grupos.append({
            "cod": cod,
            "zona": ZONAS.get(cod, "Por confirmar"),
            "proc": [{"pg": f["pg"], "t": f["t"].capitalize(),
                      "h": f["h"], "oil": f["oil"], "pasos": f["pasos"],
                      "img": f"assets/mt1100/mec/c{f['pg']:03d}.jpg"}
                     for f in fs if f["grupo"] == cod],
        })

    data = {"ref": "4-S3240005-001-1.0 · Marchesini Group — Calibrado, regulaciones "
                   "y mantenimiento preventivo",
            "grupos": grupos, "plan": pl}
    js = ("// Fichas de mantenimiento preventivo de la MT-1100 Stickpacker, del\n"
          "// manual de Calibrado Marchesini 4-S3240005-001. Cada ficha lleva sus\n"
          "// pasos en espaniol, su intervalo y la figura de la pagina, porque los\n"
          "// pasos citan llamadas numeradas que sin la figura no se entienden.\n"
          "// Generado con scripts/gen-mt1100-procedimientos.py - no editar a mano.\n"
          "window.PROC_DATA = window.PROC_DATA || {};\n"
          "window.PROC_DATA.mt1100 = "
          + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(js)
    print(f"grupos: {len(grupos)} · fichas: {len(fs)} · "
          f"pasos: {sum(len(f['pasos']) for f in fs)} · "
          f"plan: {len(pl)} operaciones en "
          f"{len({(r['u'], r['cada']) for r in pl})} intervalos · "
          f"imagenes: {round(tot / 1048576, 2)} MB · js: {len(js)} bytes")


if __name__ == "__main__":
    main()
