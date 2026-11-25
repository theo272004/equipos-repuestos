import importlib.util, json, tempfile, unittest
from pathlib import Path
import openpyxl

RAIZ = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("ihv", RAIZ / "scripts" / "importar-hoja-vida.py")
ihv = importlib.util.module_from_spec(spec); spec.loader.exec_module(ihv)

CAB = ["TIPO DE EQUIPO", "CODIGO", "DESCRIPCION", "UBICACIÓN", "SERVICIO", "MARCA", "MODELO", "SERIAL", "AÑO DE FABRICACION",
       "PROCEDENCIA", "AÑO DE INSTALACION", "PROCESO", "COD-REP1", "REP1", "CANT-REP-1", "FREC-3M", "FREC-A", "REGISTRO/PROCEDIMIENTOS", "IMAGEN"]
FILA = ["CHILLER", "04307002", "Chiller #2", "Sede 4 - Chillers / Cuarto 2", "Frío", "Trane", "X1", "SER-SECRETO-99", 2015, "USA", 2016,
        "Servicios", "0741903002", "Rodamiento", 2, " mt / r ", "X", "PRO-01", "\\\\servidor\\FOTOS EQUIPOS\\chiller2.jpg"]


def libro(d):
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = "BASE DE DATOS"
    ws.append(["Hoja de vida DMM-199"]); ws.append(CAB); ws.append(FILA); ws.append(["X"] + ["99999999"] + [None] * 17)
    wb.save(d / "hv.xlsx")


class Importar(unittest.TestCase):
    def correr(self, extra=()):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d); libro(d)
            (d / "areas.json").write_text(json.dumps({"areas": {"chillers cuarto 2": "Cuarto de chillers"}}))
            ihv.main([str(d / "hv.xlsx"), "--ubicacion", "SEDE 4", "--salida", str(d / "o.json"), "--areas", str(d / "areas.json"), *extra])
            return (d / "o.json").read_text(encoding="utf-8")

    def test_normaliza_codigo_ubicacion_imagen_y_repuestos(self):
        out = json.loads(self.correr())
        e = out["equipos"]["eq-4307002"]  # 04307002 -> 4307002
        self.assertEqual((e["sede"], e["area"]), ("SEDE 4", "Cuarto de chillers"))
        self.assertEqual(e["imagen"], "chiller2.jpg")
        self.assertEqual(e["repuestos"], [{"cod": "741903002", "desc": "Rodamiento", "cant": "2"}])
        self.assertEqual(e["frecuencias"], {"3M": "MT/R", "A": "X"})  # solo se limpia el formato; no se interpreta
        self.assertEqual(e["marca"], "Trane")
        self.assertNotIn("eq-99999999", out["equipos"])

    def test_serial_y_rutas_no_salen_por_defecto(self):
        txt = self.correr()
        self.assertNotIn("SER-SECRETO-99", txt)
        self.assertNotIn("servidor", txt)
        self.assertIn("SER-SECRETO-99", self.correr(["--incluir-serial"]))

    def test_helpers(self):
        self.assertEqual(ihv.codigo("04307001"), "4307001")
        self.assertEqual(ihv.codigo(4307001.0), "4307001")
        self.assertEqual(ihv.codigo("0"), "0")
        self.assertEqual(ihv.nombre_archivo("C:\\a\\b\\foto 1.png"), "foto 1.png")
        self.assertEqual(ihv.nombre_archivo("/a/b/foto.png"), "foto.png")
        self.assertEqual(ihv.separar_ubicacion("PLANTA 2 · Líquidos", "SEDE 4"), ("PLANTA 2", "liquidos"))
        self.assertEqual(ihv.separar_ubicacion("Bodega", "SEDE 4"), ("SEDE 4", "bodega"))

    def test_no_toca_equipos_js(self):
        antes = (RAIZ / "assets" / "equipos.js").read_bytes()
        self.correr()
        self.assertEqual(antes, (RAIZ / "assets" / "equipos.js").read_bytes())


if __name__ == "__main__":
    unittest.main()
