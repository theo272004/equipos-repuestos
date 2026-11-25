import importlib.util, json, sys, tempfile, unittest
from pathlib import Path
import openpyxl

RAIZ = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("apm", RAIZ / "scripts" / "actualizar-plan-mtto.py")
apm = importlib.util.module_from_spec(spec); spec.loader.exec_module(apm)


def pieza(cod):
    return {"s": "S", "a": "MECANICA", "cod": cod, "d": "", "q": 1, "e": 1, "w": [0, 0, 0, 0], "o": "", "ub": "", "pu": 0,
            "xls": {"f": "1A", "ej": "2025-01-01", "px": "2026-01-01", "st": "RETRASADO"}}


class CruceConPlanta(unittest.TestCase):
    def correr(self, extra, filas_u=""):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            datos = {"fuente": "x", "corte": "2026-01-01", "equipos": [
                {"c": "17303002", "id": "eq-17303002", "u": "SEDE 4", "n": "A", "r": [pieza("111")]},
                {"c": "17303002", "id": "eq-17303002-p2", "u": "PLANTA 2", "n": "B", "r": [pieza("111")]},
                {"c": "5", "id": "eq-5", "u": "SEDE 4", "n": "C", "r": [pieza("222")]}]}
            dest = d / "equipos.js"
            dest.write_text("window.EQUIPOS_PLAN = " + json.dumps(datos) + ";\n", encoding="utf-8")
            wb = openpyxl.Workbook(); ws = wb.active; ws.title = "PLAN MTTO"; ws["X1"] = "2026-11-01"
            ws.append([]); ws.append([])
            for eq, cod, u in (("17303002", "111", filas_u), ("5", "222", "SEDE 4")):
                fila = [eq, "", u, "S", "MECANICA", cod, "", "", "", 1, 1, 0, 0, 0, 0, "", "", "3M", "2026-10-01", "2027-01-01", "", "EN TIEMPO", ""]
                ws.append(fila)
            wb.save(d / "p.xlsx")
            apm.DESTINO = dest; apm.RAIZ = d
            sys.argv = ["x", str(d / "p.xlsx")] + extra
            apm.main()
            out = dest.read_text(encoding="utf-8")
            return {e["id"]: e["r"][0]["xls"]["f"] for e in json.loads(out[out.index("{"):out.rindex(";")])["equipos"]}

    def test_planta_de_la_columna_C_resuelve_el_repetido(self):
        f = self.correr([], filas_u="PLANTA 2")
        self.assertEqual(f["eq-17303002-p2"], "3M"); self.assertEqual(f["eq-17303002"], "1A")

    def test_codigo_en_dos_plantas_se_omite_sin_ubicacion(self):
        f = self.correr([])
        self.assertEqual(f["eq-17303002"], "1A"); self.assertEqual(f["eq-17303002-p2"], "1A")  # no se tocaron
        self.assertEqual(f["eq-5"], "3M")  # el código único sí se actualiza

    def test_con_ubicacion_solo_esa_planta(self):
        f = self.correr(["--ubicacion", "PLANTA 2"])
        self.assertEqual(f["eq-17303002-p2"], "3M"); self.assertEqual(f["eq-17303002"], "1A")


if __name__ == "__main__":
    unittest.main()
