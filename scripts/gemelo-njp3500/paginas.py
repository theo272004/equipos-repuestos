# Pasa a JPG las páginas del manual del fabricante que cita cada conjunto (piezas.mjs).
#   python -I scripts/gemelo-njp3500/paginas.py
# Necesita PyMuPDF (fitz) y Pillow. Deja assets/gemelo/njp3500/manual/pNNN.jpg.
import io
import pathlib
import re

import fitz
from PIL import Image

AQUI = pathlib.Path(__file__).resolve().parent
REPO = AQUI.parent.parent
PDF = REPO / "manuales" / "njp3500" / "NJP3500-manual-fabricante.pdf"
SALIDA = REPO / "assets" / "gemelo" / "njp3500" / "manual"
SALIDA.mkdir(parents=True, exist_ok=True)

piezas = (AQUI / "piezas.mjs").read_text(encoding="utf-8")
paginas = sorted({int(n) for lista in re.findall(r"paginas: \[([^\]]*)\]", piezas) for n in re.findall(r"\d+", lista)})
doc = fitz.open(PDF)
for p in paginas:
    pix = doc[p - 1].get_pixmap(dpi=110)
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    img.save(SALIDA / f"p{p:03d}.jpg", quality=74, optimize=True)
print(len(paginas), "páginas:", paginas)
