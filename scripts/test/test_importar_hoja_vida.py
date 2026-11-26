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

    def test_letras_fuera_de_la_leyenda_se_avisan_sin_traducir(self):
        leyenda = json.loads((RAIZ / "scripts" / "hoja-vida.leyenda-frecuencia.json").read_text(encoding="utf-8"))["letras"]
        self.assertEqual(ihv.letras_sin_leyenda({"3M": "M", "A": "IE", "6M": "MT/R", "M": "X", "S": "M/S"}, leyenda), ["M/S", "MT/R", "X"])
        out = json.loads(self.correr())  # FREC-3M = «MT/R» en el ejemplo
        self.assertEqual(out["equipos"]["eq-4307002"]["frecuenciasSinLeyenda"], ["MT/R", "X"])
        self.assertEqual(out["leyendaFrecuencia"]["IE"]["texto"], "Inspección exhaustiva")
        self.assertNotIn("MT", out["leyendaFrecuencia"])

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

    def test_rellenos_na_cuentan_como_vacios(self):
        for v in ["N/A", "N/A.", "NA", "n.a.", "-", "--", "—", " n/a ", "No aplica", "S/N", "", None]:
            self.assertTrue(ihv.es_relleno(v), v)
        for v in ["Trane", "MT/R", "M/S", "0", "NASA 2"]:
            self.assertFalse(ihv.es_relleno(v), v)
        fila = ["CHILLER", "04307002", "Chiller #2", "Sede 4", "N/A", "N/A.", "NA", "-", None, "", None, "", "N/A", "N/A", "N/A", "N/A", "-", "", ""]
        mapeo = json.loads((RAIZ / "scripts" / "hoja-vida.mapeo.json").read_text(encoding="utf-8"))
        regs, _ = ihv.extraer([CAB, fila], mapeo, "SEDE 4")
        self.assertEqual(len(regs), 1)
        self.assertNotIn("marca", regs[0]); self.assertNotIn("modelo", regs[0]); self.assertNotIn("servicio", regs[0])
        self.assertNotIn("repuestos", regs[0]); self.assertNotIn("frecuencias", regs[0])
        self.assertEqual(regs[0]["descripcion"], "Chiller #2")

    def test_ubicaciones_de_planta_con_numeral_y_errores_de_digitacion(self):
        casos = {
            "PLANTA #2": ("PLANTA 2", ""), "PLANTA#2": ("PLANTA 2", ""), "PALANTA #2": ("PLANTA 2", ""),
            "PLANTA 2/ÁREA": ("PLANTA 2", "area"), "Planta N°2 - Granulación": ("PLANTA 2", "granulacion"),
            "PLANTA 2": ("PLANTA 2", ""), "Bodega Planta 2": ("PLANTA 2", "bodega"),
            "SEDE 4": ("SEDE 4", ""), "Sede #4 / Líquidos": ("SEDE 4", "liquidos"),
        }
        for texto, esperado in casos.items():
            self.assertEqual(ihv.separar_ubicacion(texto, "OTRA"), esperado, texto)
        # «PLANTA #4» no es Sede 4 ni Planta 2: se quita del área, la sede queda la del archivo y se avisa
        self.assertEqual(ihv.separar_ubicacion("PLANTA #4", "PLANTA 2"), ("PLANTA 2", ""))
        self.assertEqual(ihv.sede_sin_reconocer("PLANTA #4"), "PLANTA 4")
        self.assertEqual(ihv.sede_sin_reconocer("PLANTA #2"), "")

    def test_codigos_repetidos_en_el_archivo_no_se_mezclan(self):
        regs = [{"codigo": "17303019", "marca": "A"}, {"codigo": "17303019", "marca": "B"}, {"codigo": "5", "marca": "C"}]
        unicos, rep = ihv.separar_repetidos(regs)
        self.assertEqual(unicos, [{"codigo": "5", "marca": "C"}])
        self.assertEqual(rep, {"17303019": 2})
        with tempfile.TemporaryDirectory() as d:
            import io, contextlib
            d = Path(d)
            wb = openpyxl.Workbook(); ws = wb.active; ws.title = "BASE DE DATOS"
            ws.append(CAB); ws.append(FILA); ws.append(FILA)   # mismo código dos veces
            otra = list(FILA); otra[1] = "04307001"; ws.append(otra)  # este no se repite (4307001 existe en el registro)
            wb.save(d / "hv.xlsx")
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                ihv.main([str(d / "hv.xlsx"), "--ubicacion", "SEDE 4", "--salida", str(d / "o.json"), "--areas", str(d / "nada.json")])
            out = buf.getvalue()
            self.assertIn("REPETIDOS", out); self.assertIn("4307002 (x2)", out)
            datos = json.loads((d / "o.json").read_text(encoding="utf-8"))["equipos"]
            self.assertNotIn("eq-4307002", datos)  # no se mezcló ninguna de las dos filas

    def test_areas_por_prefijo_dejan_el_resto_como_detalle(self):
        areas = json.loads((RAIZ / "scripts" / "hoja-vida.areas.json").read_text(encoding="utf-8"))
        sede, area = ihv.separar_ubicacion("PLANTA #2 MICROG LADO A/ LADO C", "PLANTA 2")
        self.assertEqual(ihv.normalizar_area(area, areas), ("MICROG", "lado a lado c", True))
        self.assertEqual(ihv.normalizar_area("piso tecnico principal", areas), ("PISO TÉCNICO", "principal", True))
        self.assertEqual(ihv.normalizar_area("liquidos", areas), ("LÍQUIDOS", "", True))
        self.assertEqual(ihv.normalizar_area("microgrande", areas)[2], False)   # no es palabra completa
        self.assertEqual(ihv.normalizar_area("cuarto 522", areas), ("cuarto 522", "", False))
        self.assertEqual(ihv.normalizar_area("x", {"areas": {"x": "EXACTA"}, "prefijos": {"x": "OTRA"}}), ("EXACTA", "", True))

    def test_listado_vigente_filtra_equipos(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            (d / "l.csv").write_text('"cod","desc","ubi","area"\n"04307002","CHILLER","SEDE 4","BLISTEADO"\n"17303002","M","PLANTA 2","S"\n', encoding="utf-8")
            lis = ihv.cargar_listado(d / "l.csv")
            self.assertEqual(ihv.en_listado("4307002", "SEDE 4", lis), (True, ""))
            self.assertEqual(ihv.en_listado("17303002", "SEDE 4", lis)[0], True)   # solo figura en la otra planta: se acepta con aviso
            self.assertIn("PLANTA 2", ihv.en_listado("17303002", "SEDE 4", lis)[1])
            self.assertEqual(ihv.en_listado("999", "SEDE 4", lis), (False, ""))
            libro(d)
            import io, contextlib
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                ihv.main([str(d / "hv.xlsx"), "--ubicacion", "SEDE 4", "--listado", str(d / "l.csv"), "--salida", str(d / "o.json")])
            self.assertIn("Fuera del listado vigente, NO se importaron (1): 99999999", buf.getvalue())
            self.assertIn("eq-4307002", json.loads((d / "o.json").read_text(encoding="utf-8"))["equipos"])

    def test_no_toca_equipos_js(self):
        antes = (RAIZ / "assets" / "equipos.js").read_bytes()
        self.correr()
        self.assertEqual(antes, (RAIZ / "assets" / "equipos.js").read_bytes())


if __name__ == "__main__":
    unittest.main()
