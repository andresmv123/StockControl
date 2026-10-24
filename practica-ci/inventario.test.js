
const assert = require('node:assert/strict');
const { test } = require('node:test');

const { calcularStockRestante } = require('./inventario');

test('Calcula correctamente una salida de inventario', () => {
  assert.equal(calcularStockRestante(10, 3), 7);
});

test('Rechaza una salida mayor que el stock disponible', () => {
  assert.throws(
    () => calcularStockRestante(5, 8),
    /Stock insuficiente/
  );
});

test('Rechaza cantidades de salida negativas', () => {
  assert.throws(
    () => calcularStockRestante(10, -2),
    /entero positivo/
  );
});

test('Rechaza un stock inicial inválido', () => {
  assert.throws(
    () => calcularStockRestante(-1, 2),
    /entero no negativo/
  );
});


test('Prueba controlada de deteccion de errores', () => {
  assert.equal(calcularStockRestante(10, 3), 8);
});
