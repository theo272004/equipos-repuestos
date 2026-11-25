import test from "node:test";
import assert from "node:assert/strict";
import { validar } from "../validar-equipos.mjs";

const eq = (o) => ({ c: "17332002", id: "eq-17332002", n: "X", u: "SEDE 4", cc: "K9", tipo: "PROCESO", r: [], ...o });

test("registro limpio: sin errores", () => {
  const r = validar({ equipos: [eq({}), eq({ c: "17332003", id: "eq-17332003" })] });
  assert.equal(r.errores.length, 0);
});

test("mismo código en dos plantas es aviso, no error", () => {
  const r = validar({ equipos: [eq({}), eq({ id: "eq-17332002-p2", u: "PLANTA 2" })] });
  assert.equal(r.errores.length, 0);
  assert.equal(r.avisos.filter((a) => a.regla === "codigo-en-varias-plantas").length, 1);
});

test("mismo código en la misma planta y ubicación rara son errores", () => {
  const r = validar({ equipos: [eq({}), eq({ id: "eq-b" }), eq({ id: "eq-c", c: "99999999", u: "SE" })] });
  const reglas = r.errores.map((e) => e.regla).sort();
  assert.deepEqual(reglas, ["codigo-repetido-misma-planta", "ubicacion-desconocida"]);
});

test("comodín y código corto son avisos", () => {
  const r = validar({ equipos: [eq({ c: "1", id: "eq-1", tipo: "URGENCIA", cc: "0" })] });
  assert.ok(r.avisos.some((a) => a.regla === "comodin"));
  assert.ok(r.avisos.some((a) => a.regla === "codigo-fuera-de-formato"));
});
