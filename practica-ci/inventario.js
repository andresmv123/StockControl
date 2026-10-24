
function calcularStockRestante(stockActual, cantidadSalida) {
  if (!Number.isInteger(stockActual) || stockActual < 0) {
    throw new Error('El stock actual debe ser un entero no negativo');
  }

  if (!Number.isInteger(cantidadSalida) || cantidadSalida <= 0) {
    throw new Error('La cantidad de salida debe ser un entero positivo');
  }

  if (cantidadSalida > stockActual) {
    throw new Error('Stock insuficiente');
  }

  return stockActual - cantidadSalida;
}

module.exports = { calcularStockRestante };
