
# Preparación del despliegue de StockControl

## Objetivo

Preparar la aplicación StockControl para su futura
publicación en un entorno web accesible.

## Tecnologías

- Ionic y Angular
- TypeScript
- Supabase
- GitHub
- Node.js y npm

## Compilación de producción

Para generar los archivos de la aplicación:

npm ci
npm run build

La compilación genera los archivos web en la
carpeta www.

## Plataforma propuesta

Se propone utilizar Vercel para publicar la
versión web de StockControl.

La configuración definitiva del despliegue
se realizará durante la segunda semana.

## Configuración pendiente

Antes de publicar se deberá:

1. Verificar la compilación de producción.
2. Configurar el proyecto en Vercel.
3. Revisar las variables de entorno necesarias.
4. Comprobar las URL de autenticación de Supabase.
5. Validar las rutas de Angular al recargar páginas.
6. Comprobar las funciones principales.
7. Configurar el despliegue automático.

## Seguridad

No se deben publicar contraseñas, claves privadas
ni credenciales de servicio en el repositorio.

La aplicación debe utilizar únicamente las
credenciales públicas necesarias para conectarse
con Supabase, manteniendo las políticas RLS.

## Estado

Documento de preparación. El despliegue todavía
no se ha realizado.
