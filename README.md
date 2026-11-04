# StockControl

Aplicación móvil de gestión de inventario desarrollada como proyecto académico de **Desarrollo Móvil Integral**.

StockControl permite administrar productos, controlar las existencias de un inventario y registrar movimientos de entrada y salida. Utiliza servicios remotos para almacenar y consultar información, además de autenticación de usuarios y permisos según su rol.

## Tecnologías

- **Ionic:** desarrollo de la interfaz de usuario.
- **Angular:** estructura y funcionamiento de la aplicación.
- **TypeScript:** lenguaje de programación.
- **Supabase:** autenticación, base de datos PostgreSQL y almacenamiento remoto.
- **Capacitor:** integración y ejecución en dispositivos Android.
- **Android Studio:** compilación y generación de la aplicación Android.
- **Git y GitHub:** control de versiones.

## Funcionalidades

- Registro e inicio de sesión.
- Roles de administrador y empleado.
- Gestión de productos.
- Registro de entradas y salidas de inventario.
- Dashboard con estadísticas.
- Perfil de usuario.
- Conversión aproximada de MXN a USD mediante una API externa.
- Almacenamiento y consulta de información en una base de datos remota.
- Ejecución como aplicación web y aplicación Android.

## Requisitos previos

Para instalar y ejecutar el proyecto se requiere:

- Node.js y npm.
- Git.
- Un editor de código, como Visual Studio Code.
- Conexión a Internet para utilizar los servicios remotos.
- Android Studio y Android SDK para ejecutar o compilar la versión Android.
- Un proyecto de Supabase configurado con las tablas, políticas y servicios necesarios.

## Instalación del proyecto

**1. Clonar el repositorio**

```bash
git clone https://github.com/andresmv123/StockControl.git
```

**2. Acceder a la carpeta del proyecto**

```bash
cd StockControl
```

**3. Instalar las dependencias**

```bash
npm install
```

## Configuración de Supabase

La aplicación utiliza Supabase como servicio remoto para la autenticación, gestión de datos y almacenamiento.

Los archivos de configuración de Angular se encuentran en:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Estos archivos contienen la configuración correspondiente al entorno de desarrollo y producción.

Para utilizar una instancia propia de Supabase, es necesario configurar la URL del proyecto y su clave pública, además de preparar la estructura de la base de datos y las políticas de seguridad correspondientes.

**Importante:** no deben incluirse contraseñas, claves privadas ni claves `service_role` en el código del cliente o en el repositorio.

El acceso a los datos debe controlarse mediante las políticas de seguridad de Supabase, incluyendo Row Level Security (RLS).

## Ejecución de la aplicación web

Desde la carpeta principal del proyecto, ejecutar:

```bash
npx ionic serve
```

La aplicación se iniciará en un servidor local de desarrollo.

Para generar una compilación de producción:

```bash
npx ionic build
```

Los archivos generados se almacenarán en la carpeta `www`.

## Ejecución en Android

StockControl utiliza Capacitor para integrar la aplicación web con Android.

**1. Compilar la aplicación**

```bash
npx ionic build
```

**2. Sincronizar los archivos con el proyecto Android**

```bash
npx cap sync android
```

**3. Abrir el proyecto en Android Studio**

```bash
npx cap open android
```

**4. Generar el APK**

En Android Studio, esperar a que finalice la sincronización de Gradle y seleccionar la opción para generar un APK desde el menú Build.

En una compilación de depuración, el archivo normalmente se genera en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

**5. Instalar la aplicación**

Transferir el APK a un dispositivo Android compatible e instalarlo, autorizando la instalación desde esa fuente cuando el sistema lo solicite.

El dispositivo necesita conexión a Internet para comunicarse con Supabase y la API externa.

## Servicios remotos y API externa

### Supabase

La aplicación utiliza Supabase para:

- Autenticación y registro de usuarios.
- Consulta y almacenamiento de productos.
- Registro de movimientos de inventario.
- Gestión de información relacionada con los usuarios.
- Aplicación de permisos mediante roles y políticas de seguridad.

### API de conversión de divisas

StockControl integra un servicio externo de consulta de tipos de cambio para realizar conversiones aproximadas de pesos mexicanos (MXN) a dólares estadounidenses (USD).

El resultado depende de la información proporcionada por la API externa y de la disponibilidad de la conexión.

## Control de versiones

El proyecto utiliza Git y GitHub con las ramas:

- `main`: versión estable.
- `develop`: integración de funcionalidades.
- `feature/*`: desarrollo de cambios específicos.

Los cambios se integran en la rama de desarrollo y posteriormente pueden fusionarse con la rama principal.

**Repositorio:**

https://github.com/andresmv123/StockControl

## Estado del proyecto

StockControl cuenta con una implementación funcional de sus módulos principales y una versión Android compilada e instalada en un dispositivo físico.

La validación completa de las funcionalidades, los permisos y los casos de error se documenta como parte de las pruebas del proyecto académico.

## Derechos de autor

Copyright © 2026 Pedro Andrés Morales Vázquez.

Todos los derechos reservados.

Proyecto académico. No se concede una licencia general de uso, modificación o distribución del código fuente.

Las dependencias de terceros conservan sus respectivas licencias.