// Lee el Excel de inventario desde disco. La deteccion de columnas NO vive aqui:
// esta en assets/js/lector-inventario.mjs, compartida con la app, para que el
// puente y la vista Almacen entiendan el reporte exactamente igual.

import xlsx from "xlsx";
import { analizarLibro } from "../../../assets/js/lector-inventario.mjs";

export { numero, normCod } from "../../../assets/js/lector-inventario.mjs";

export async function leerInventario(rutaXlsx, codigosPlan, opciones = {}) {
  const libro = xlsx.readFile(rutaXlsx, { cellDates: false, raw: true });
  return analizarLibro(libro, xlsx.utils, codigosPlan, { ...opciones, nombre: rutaXlsx });
}
