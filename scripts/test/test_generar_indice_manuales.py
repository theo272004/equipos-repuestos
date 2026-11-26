import importlib.util, json, tempfile, unittest
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("gim", RAIZ / "scripts" / "generar-indice-manuales.py")
gim = importlib.util.module_from_spec(spec); spec.loader.exec_module(gim)

REG = [
    {"c": "17332004", "id": "eq-17332004", "mid": "integra320", "n": "Integra", "u": "SEDE 4"},
    {"c": "17303002", "id": "eq-17303002", "n": "Mezclador A", "u": "SEDE 4"},
    {"c": "17303002", "id": "eq-17303002-p2", "n": "Mezclador B", "u": "PLANTA 2"},
]
F = lambda carpeta, archivo, tipo="manual": {"Carpeta": carpeta, "Archivo": archivo, "Tipo": tipo, "Ext": "PDF", "MB": "1.5", "Ruta": f"{carpeta}\\{archivo}"}
MAPEO = {"carpetas": {
    "Integra": {"estado": "asignada", "equipos": ["0017332004"], "confianza": "alta", "motivo": ""},
    "Mezcla": {"estado": "asignada", "equipos": ["17303002"], "confianza": "media", "motivo": ""},
    "Fantasma": {"estado": "asignada", "equipos": ["99999999"], "confianza": "alta", "motivo": ""},
    "Varios": {"estado": "sin-asignar", "motivo": "no dice de cuál"},
}}


class Indice(unittest.TestCase):
    def test_asigna_por_codigo_sin_ceros_y_deja_ruta_relativa(self):
        eq, sin = gim.construir([F("Integra", "Manual.pdf"), F("Integra", "Plano.pdf", "planos")], MAPEO, REG)
        d = eq["eq-17332004"]
        self.assertEqual(d["mid"], "integra320")
        self.assertEqual(sorted(m["ruta"] for m in d["manuales"]), ["Integra/Manual.pdf", "Integra/Plano.pdf"])
        self.assertTrue(all("\\" not in m["ruta"] and ":" not in m["ruta"] for m in d["manuales"]))
        self.assertEqual({m["ext"] for m in d["manuales"]}, {"pdf"})

    def test_sin_asignar_no_se_adivina(self):
        eq, sin = gim.construir([F("Varios", "a.pdf"), F("Nueva", "b.pdf"), F("Fantasma", "c.pdf")], MAPEO, REG)
        self.assertEqual(eq, {})
        por = {s["carpeta"]: s["motivo"] for s in sin}
        self.assertEqual(por["Varios"], "no dice de cuál")
        self.assertIn("no está en el mapeo", por["Nueva"])
        self.assertIn("no está en el registro", por["Fantasma"])
        self.assertNotIn("Archivo", json.dumps(sin))  # solo cantidades por tipo, sin nombres de archivo

    def test_codigo_en_dos_plantas_necesita_el_listado(self):
        self.assertIsNone(gim.resolver("17303002", REG, None)[0])
        self.assertEqual(gim.resolver("17303002", REG, {"17303002": {"PLANTA 2"}})[0]["id"], "eq-17303002-p2")

    def test_certificados_no_se_publican_por_defecto(self):
        arch = [F("Integra", "Manual.pdf"), F("Integra", "1.7 Certificado Juan Perez - Orbital.pdf")]
        eq, _ = gim.construir(arch, MAPEO, REG)
        self.assertEqual([m["nombre"] for m in eq["eq-17332004"]["manuales"]], ["Manual.pdf"])
        self.assertEqual(eq["eq-17332004"]["certificadosOmitidos"], 1)
        eq2, _ = gim.construir(arch, MAPEO, REG, incluir_certificados=True)
        self.assertEqual(len(eq2["eq-17332004"]["manuales"]), 2)

    def test_mapeo_real_solo_apunta_a_carpetas_conocidas(self):
        mapeo = json.loads((RAIZ / "scripts" / "manuales-carpeta-equipo.json").read_text(encoding="utf-8"))
        for nombre, regla in mapeo["carpetas"].items():
            self.assertIn(regla["estado"], ("asignada", "sin-asignar"), nombre)
            if regla["estado"] == "asignada":
                self.assertTrue(regla["equipos"] and regla["confianza"] in ("alta", "media"), nombre)

    def test_salida_publicada_no_trae_rutas_del_pc(self):
        d = json.loads((RAIZ / "assets" / "data" / "manuales-indice.json").read_text(encoding="utf-8"))
        t = json.dumps(d, ensure_ascii=False)
        for malo in ("C:\\\\", "Users", "Downloads", "mcastrov", "\\\\\\\\"):
            self.assertNotIn(malo, t)
        self.assertEqual(d["rutasRelativasA"], "Respaldos")


if __name__ == "__main__":
    unittest.main()
