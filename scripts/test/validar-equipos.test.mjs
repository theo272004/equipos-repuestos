import test from "node:test";
import assert from "node:assert/strict";
import { validar, codigosDeListado } from "../validar-equipos.mjs";

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

test("una evaluación no cuenta como equipo ni da avisos de formato", () => {
  const r = validar({ equipos: [eq({}), eq({ c: "1", id: "eq-1", tipo: "URGENCIA", evaluacion: true })] });
  assert.equal(r.resumen.equipos, 1);
  assert.deepEqual(r.resumen.evaluacionesAparte, ["X"]);
  assert.equal(r.avisos.length, 0);
});

test("un equipo retirado no cuenta en los totales, pero se lista aparte", () => {
  const r = validar({ equipos: [eq({}), eq({ c: "17334008", id: "eq-17334008", retirado: true })] });
  assert.equal(r.resumen.equipos, 1);
  assert.equal(r.resumen.retiradosAparte.length, 1);
  assert.equal(r.errores.length + r.avisos.length, 0);
});

test("un retirado sin copia en el archivo de retirados es error", () => {
  const plan = { equipos: [eq({ c: "17334008", id: "eq-17334008", retirado: true })] };
  assert.equal(validar(plan, null, new Set()).errores[0].regla, "retirado-sin-respaldo");
  assert.equal(validar(plan, null, new Set(["eq-17334008"])).errores.length, 0);
});

test("noEnListado sigue activo: cuenta en los totales y se lista", () => {
  const r = validar({ equipos: [eq({}), eq({ c: "17334007", id: "eq-17334007", noEnListado: true })] });
  assert.equal(r.resumen.equipos, 2);
  assert.equal(r.noEnListado.length, 1);
  assert.equal(r.errores.length, 0);
});

test("«revision» deja el equipo por confirmar sin error", () => {
  const r = validar({ equipos: [eq({ revision: "posible duplicado" })] });
  assert.equal(r.porConfirmar.length, 1);
  assert.equal(r.errores.length, 0);
});

test("listado oficial: solo lista lo que falta y compara sin ceros a la izquierda", () => {
  const listado = codigosDeListado("codigo,nombre\n04307001,Chiller\n\"17332002\";x\n");
  const r = validar({ equipos: [eq({ c: "4307001", id: "a" }), eq({}), eq({ c: "99999999", id: "b" })] }, listado);
  assert.deepEqual(r.fueraDeListado.map((x) => x.id), ["b"]);
  assert.equal(validar({ equipos: [eq({})] }).fueraDeListado, null);
});
