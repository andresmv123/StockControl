
# Integración continua de StockControl

## Objetivo

Automatizar las validaciones del proyecto StockControl
mediante GitHub Actions para detectar errores durante
el desarrollo y comprobar que la aplicación compile.

## Tecnologías utilizadas

- Git y GitHub: control de versiones.
- GitHub Actions: integración continua.
- Node.js 24: entorno de ejecución.
- npm: administración de dependencias.
- ESLint: análisis estático del código.
- TypeScript: comprobación de tipos.
- Angular CLI: compilación de la aplicación.

## Configuración

El flujo se encuentra en:

.github/workflows/ci-stockcontrol.yml

Se ejecuta automáticamente cuando se realizan cambios
en la rama entrega/semana1-ci.

También permite la ejecución manual desde GitHub Actions.

## Validaciones automáticas

1. Descargar el código del repositorio.
2. Configurar Node.js.
3. Instalar dependencias mediante npm ci.
4. Analizar el código mediante npm run lint.
5. Verificar los tipos mediante npx tsc --noEmit -p tsconfig.app.json.
6. Compilar la aplicación mediante npm run build.

## Prueba de error controlado

Se modificó temporalmente el comando de compilación
para ejecutar npm run build-error.

GitHub Actions detectó el error y marcó la ejecución
como fallida.

Posteriormente, se restauró npm run build y se
comprobó que la integración continua terminara
correctamente.

## Resultados

La integración continua permite detectar errores
antes de continuar con la liberación del software.

Las validaciones automáticas ayudan a mantener
la calidad y estabilidad de StockControl.
