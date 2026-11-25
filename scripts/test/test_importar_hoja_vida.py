import importlib.util, json, tempfile, unittest
from pathlib import Path
import openpyxl

RAIZ = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("ihv", RAIZ / "scripts" / "importar-hoja-vida.py")
ihv = importlib.util.module_from_spec(spec); spec.loader.exec_module(ihv)


class Importar(unittest.TestCase):
    def test_extraer_mapea_por_encabezado_y_guarda_extras(self):
        filas = [["Título"], ["Código ", "Descripción", "Marca", "Obs"], ["17332002", "Blister 2", "Uhlmann", "ok"], [None, "x", "y", "z"]]
        mapeo = {"campos": {"codigo": ["codigo"], "nombre": ["descripcion"], "marca": ["marca"], "serie": ["serie"]}, "extras": {"nota": "Obs"}}
        regs, faltan = ihv.extraer(filas, mapeo)
        self.assertEqual(regs, [{"codigo": "17332002", "nombre": "Blister 2", "marca": "Uhlmann", "extras": {"nota": "ok"}}])
        self.assertEqual(faltan, ["serie"])

    def test_importacion_completa_sin_tocar_equipos_js(self):
        antes = (RAIZ / "assets" / "equipos.js").read_bytes()
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            wb = openpyxl.Workbook(); ws = wb.active; ws.title = "BD"
            ws.append(["COD", "MARCA"]); ws.append(["17332002", "Uhlmann"]); ws.append(["99999999", "X"]); ws.append(["17303002", "Repetido"])
            wb.save(d / "hv.xlsx")
            (d / "m.json").write_text(json.dumps({"hoja": "BD", "campos": {"codigo": ["cod"], "marca": ["marca"]}}))
            ihv.main([str(d / "hv.xlsx"), "--ubicacion", "SEDE 4", "--mapeo", str(d / "m.json"), "--salida", str(d / "o.json")])
            out = json.loads((d / "o.json").read_text())
            self.assertEqual(out["equipos"]["eq-17332002"]["marca"], "Uhlmann")
            self.assertNotIn("eq-99999999", out["equipos"])
            self.assertIn("eq-17303002", out["equipos"])  # en Sede 4 el código 17303002 es único
        self.assertEqual(antes, (RAIZ / "assets" / "equipos.js").read_bytes())


if __name__ == "__main__":
    unittest.main()
