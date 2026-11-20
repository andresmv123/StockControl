
# Plan de pruebas funcionales - StockControl

## Objetivo

Establecer las verificaciones necesarias para comprobar
el funcionamiento de StockControl antes de su despliegue.

## Entorno de pruebas

- Aplicación: StockControl
- Framework: Ionic y Angular
- Lenguaje: TypeScript
- Base de datos: Supabase
- Entorno: Navegador web

## Casos de prueba

| ID | Funcionalidad | Resultado esperado |
|---|---|---|
| CP-01 | Registro | Permite registrar un usuario válido |
| CP-02 | Inicio de sesión | Permite acceder con credenciales correctas |
| CP-03 | Dashboard | Muestra estadísticas del inventario |
| CP-04 | Productos | Permite consultar los productos registrados |
| CP-05 | Agregar producto | Guarda correctamente un nuevo producto |
| CP-06 | Editar producto | Actualiza la información del producto |
| CP-07 | Eliminar producto | Elimina el producto seleccionado |
| CP-08 | Entradas | Registra un incremento de existencias |
| CP-09 | Salidas | Registra una disminución de existencias |
| CP-10 | Perfil | Muestra la información del usuario |
| CP-11 | Cerrar sesión | Finaliza la sesión correctamente |
| CP-12 | Recarga | Mantiene el estado de autenticación válido |

## Procedimiento

1. Iniciar la aplicación.
2. Acceder con un usuario de pruebas.
3. Ejecutar cada caso de prueba.
4. Comparar el resultado real con el esperado.
5. Registrar los errores encontrados.
6. Corregir los problemas detectados.
7. Repetir las pruebas afectadas.

## Criterios de aceptación

- La aplicación compila correctamente.
- Las validaciones automáticas terminan sin errores.
- Las funciones principales cumplen los resultados esperados.
- No existen errores críticos conocidos que impidan su uso.

## Estado

Plan preparado para su ejecución.

Los resultados reales de las pruebas deberán documentarse
cuando se realicen las verificaciones manuales.
