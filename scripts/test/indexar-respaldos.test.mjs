import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { indexar, tipoDeArchivo, candidatos, estadoDe } from "../indexar-respaldos.mjs";

const eq = (c, n, u = "SEDE 4") => ({ c, id: "eq-" + c, n, nOriginal: n.toUpperCase(), u });
const EQ = [eq("17332003", "Blisteadora#3 B1240 Uhlmann"), eq("17333009", "Encapsuladora NJP-3500"), eq("17333006", "Encapsuladora NJP-1200C")];

test("clasifica por nombre de archivo", () => {
  assert.equal(tipoDeArchivo("5-Piezas de recambio.pdf"), "repuestos");
  assert.equal(tipoDeArchivo("esquema electrico.pdf"), "plano");
  assert.equal(tipoDeArchivo("Manual de usuario.pdf"), "manual");
  assert.equal(tipoDeArchivo("IMG_001.jpg"), "foto");
});

test("propone equipo por nombre de carpeta y marca ambiguos", () => {
  assert.equal(candidatos("Uhlmann B1240 blisteadora 3", EQ)[0].codigo, "17332003");
  assert.equal(estadoDe(candidatos("Uhlmann B1240 blisteadora 3", EQ)), "sugerido");
  assert.equal(estadoDe(candidatos("Carpeta rara", EQ)), "sin-candidato");
  assert.equal(candidatos("Encapsuladora 17333009", EQ)[0].codigo, "17333009");
});

test("recorre carpetas y cuenta archivos sin modificar nada", () => {
  const raiz = mkdtempSync(join(tmpdir(), "resp-"));
  mkdirSync(join(raiz, "Uhlmann B1240", "sub"), { recursive: true });
  writeFileSync(join(raiz, "Uhlmann B1240", "Manual de manejo.pdf"), "x");
  writeFileSync(join(raiz, "Uhlmann B1240", "sub", "foto.jpg"), "x");
  const r = indexar(raiz, EQ);
  assert.equal(r.length, 1);
  assert.equal(r[0].archivos, 2);
  assert.deepEqual(r[0].porTipo, { manual: 1, foto: 1 });
  // solo ruta relativa y tipo: nada de rutas absolutas del PC
  assert.deepEqual(r[0].lista, [
    { ruta: "Uhlmann B1240/Manual de manejo.pdf", tipo: "manual" },
    { ruta: "Uhlmann B1240/sub/foto.jpg", tipo: "foto" },
  ]);
  assert.ok(!JSON.stringify(r).includes(raiz));
});

test("un código corto como «1» no empareja cualquier carpeta; Integra320 = Integra 320", () => {
  const eqs = [...EQ, eq("1", "Invima"), eq("17332004", "Blisteadora#4 Integra320 Marchesini")];
  assert.ok(!candidatos("Uhlmann B1240 blisteadora 3", eqs).some((c) => c.codigo === "1"));
  assert.equal(candidatos("Integra 320", eqs)[0].codigo, "17332004");
});
