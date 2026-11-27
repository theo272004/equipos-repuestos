import importlib.util, io, json, contextlib, tempfile, unittest
from pathlib import Path
import openpyxl

RAIZ = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("icr", RAIZ / "scripts" / "importar-cronograma.py")
icr = importlib.util.module_from_spec(spec); spec.loader.exec_module(icr)

REG = [
    {"c": "100", "id": "eq-100", "n": "Agitador Heidolph", "nOriginal": "AGITADOR HEIDOLPH", "u": "SEDE 4", "r": [{"xls": {"f": "3M"}}]},
    {"c": "200", "id": "eq-200", "n": "Cabina Flujo Laminar Dispensación 1", "u": "SEDE 4", "r": []},
    {"c": "300", "id": "eq-300-p2", "n": "Bomba", "u": "PLANTA 2", "r": []},
    {"c": "300", "id": "eq-300", "n": "Bomba", "u": "SEDE 4", "r": []},
    {"c": "400", "id": "eq-400", "n": "Chequeadora CS100", "u": "SEDE 4", "r": []},
    {"c": "999", "id": "eq-999", "n": "Retirada", "u": "SEDE 4", "retirado": True, "r": []},
]
REGLAS = {"excluir": {"4307007": "chiller", "17333010": "NJP"}, "codigosViejos": {"SEDE 4": {"135351002": "200"}},
          "porDescripcion": {"400": "revisar CS100", "500": "Insight"}, "umbralDescripcion": 0.8}


def libro(ruta, hoja, filas, firma=True, ejecutado=False):
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = hoja
    ws["A4"] = "ITEM"; ws["B4"] = "CÓDIGO"; ws["F4"] = "ENERO"
    for i, (cod, desc, ubic, semanas, cod_der) in enumerate(filas):
        r = 6 + i
        ws[f"A{r}"] = i + 1; ws[f"B{r}"] = cod; ws[f"C{r}"] = "AUXILIAR"; ws[f"D{r}"] = desc; ws[f"E{r}"] = ubic
        ws[f"S{r}"] = cod_der if cod_der is not None else cod
        for col, sem in semanas.items():
            ws[f"{col}{r}"] = sem
        if ejecutado:
            ws[f"G{r}"] = "2026-01-20"
    if firma:
        ws[f"A{6 + len(filas) + 3}"] = "ELABORADO POR:"; ws[f"D{6 + len(filas) + 3}"] = "Nombre Apellido"
    wb.save(ruta)


class Cronograma(unittest.TestCase):
    def test_lee_semanas_por_mes_ignora_ejecutado_y_firmas(self):
        with tempfile.TemporaryDirectory() as d:
            libro(Path(d) / "a.xlsx", "2026", [("0100", "AGITADOR", "SEDE 4", {"F": 3, "L": 16, "W": 29, "AC": 42}, None)], ejecutado=True)
            filas, avisos = icr.leer_programa(Path(d) / "a.xlsx", "2026", "SEDE 4")
        self.assertEqual(len(filas), 1)                                           # la fila de firma no cuenta
        self.assertEqual(filas[0]["codigo"], "100")                               # sin ceros
        self.assertEqual(filas[0]["semanas"], {1: [3], 4: [16], 7: [29], 10: [42]})
        self.assertTrue(any("ejecutado" in a and "NO se guardaron" in a for a in avisos))

    def test_semana_fuera_de_rango_se_avisa(self):
        with tempfile.TemporaryDirectory() as d:
            libro(Path(d) / "a.xlsx", "2026", [("100", "X", "SEDE 4", {"F": 60, "H": "x"}, None)])
            filas, avisos = icr.leer_programa(Path(d) / "a.xlsx", "2026", "SEDE 4")
        self.assertEqual(filas[0]["semanas"], {})
        self.assertEqual(len(avisos), 2)

    def test_enlaces_y_reglas(self):
        f = lambda cod, desc="X", der="": {"codigo": cod, "codigoDerecho": der, "equipo": desc, "semanas": {}}
        eq, modo, _ = icr.enlazar(f("100"), "SEDE 4", REG, REGLAS); self.assertEqual((eq["id"], modo), ("eq-100", "codigo"))
        eq, modo, mot = icr.enlazar(f("135351002"), "SEDE 4", REG, REGLAS)       # código viejo -> el vigente
        self.assertEqual((eq["id"], modo), ("eq-200", "codigo-vigente")); self.assertIn("135351002", mot)
        self.assertEqual(icr.enlazar(f("300"), "PLANTA 2", REG, REGLAS)[0]["id"], "eq-300-p2")   # sede + código
        self.assertEqual(icr.enlazar(f("4307007"), "SEDE 4", REG, REGLAS)[1], "excluido")
        self.assertEqual(icr.enlazar(f("17333008", der="17333010"), "SEDE 4", REG, REGLAS)[1], "excluido")  # por el código derecho
        self.assertEqual(icr.enlazar(f("777"), "SEDE 4", REG, REGLAS)[1], "no-registro")          # no se agregan equipos
        self.assertEqual(icr.enlazar(f("999"), "SEDE 4", REG, REGLAS)[1], "retirado")
        eq, modo, mot = icr.enlazar(f("400"), "SEDE 4", REG, REGLAS); self.assertEqual((eq["id"], modo), ("eq-400", "codigo")); self.assertIn("revisar", mot)
        eq, modo, mot = icr.enlazar(f("500", "CHEQUEADORA DE PESO INSIGHT"), "SEDE 4", REG, REGLAS)  # sin coincidencia clara: no se adivina
        self.assertEqual((eq, modo), (None, "sin-enlace-claro"))

    def test_por_descripcion_enlaza_si_hay_una_coincidencia_unica(self):
        reglas = dict(REGLAS, porDescripcion={"88": "Hitachi #4 sale como SEDE 5"})
        reg = REG + [{"c": "301", "id": "eq-301", "n": "Codificadora Hitachi #4", "u": "SEDE 4", "r": []}]
        eq, modo, _ = icr.enlazar({"codigo": "88", "codigoDerecho": "", "equipo": "CODIFICADORA HITACHI #4", "semanas": {}}, "SEDE 4", reg, reglas)
        self.assertEqual((eq["id"], modo), ("eq-301", "descripcion"))

    def test_extremo_a_extremo_sin_equipos_nuevos(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            libro(d / "s4.xlsx", "2026", [("100", "AGITADOR", "SEDE 4", {"F": 3, "H": 8, "J": 12, "L": 16, "W": 29}, None),
                                        ("777", "NUEVO", "SEDE 4", {"F": 1}, None), ("4307007", "CHILLER", "SEDE 4", {"F": 2}, None)])
            libro(d / "p2.xlsx", "ED 4  V01-2026", [("300", "BOMBA", "PLANTA 2", {"F": 5, "N": 20}, None)])
            (d / "reg.js").write_text("window.EQUIPOS_PLAN = " + json.dumps({"equipos": REG}) + ";\n", encoding="utf-8")
            (d / "reglas.json").write_text(json.dumps(REGLAS), encoding="utf-8")
            with contextlib.redirect_stdout(io.StringIO()):
                icr.main([str(d / "s4.xlsx"), str(d / "p2.xlsx"), "--registro", str(d / "reg.js"), "--reglas", str(d / "reglas.json"),
                          "--hojas", str(d / "nada.json"), "--salida", str(d / "c.json"), "--reporte", str(d / "r.json")])
            c = json.loads((d / "c.json").read_text(encoding="utf-8")); r = json.loads((d / "r.json").read_text(encoding="utf-8"))
        self.assertEqual(set(c["equipos"]), {"eq-100", "eq-300-p2"})              # 777 no se agregó; el chiller quedó fuera
        e = c["equipos"]["eq-100"]
        self.assertEqual(e["frecuenciaAnual"], 5); self.assertEqual(e["semanasProgramadas"]["1"], [3])
        self.assertEqual(r["resumen"]["excluidos"], 1); self.assertEqual(r["resumen"]["noEstanEnElRegistro"], 1)
        # Plan de repuestos con xls.f = 3M (4 al año): el cronograma de eq-100 tiene 5, no hay discrepancia
        self.assertEqual(r["discrepancias"]["conPlanDeRepuestos"], [])
        txt = json.dumps(c) + json.dumps(r)
        self.assertNotIn("Nombre Apellido", txt); self.assertNotIn("ejecutad", json.dumps(c["equipos"]).lower())

    def test_discrepancia_con_el_plan_solo_se_reporta(self):
        anios = icr.anios_xls
        self.assertEqual((anios("3M"), anios("1B"), anios("1,5A"), anios(""), anios("x")), (0.25, 2, 1.5, None, None))


if __name__ == "__main__":
    unittest.main()
