# Krash-Out

Krash-Out es una plataforma de productividad, gestión del tiempo y formación de hábitos conceptualizada para mitigar los síntomas de la disfunción ejecutiva a través de una gamificación profunda. Diseñada bajo una temática inmersiva oceánica y abisal, la aplicación transforma las obligaciones rutinarias en misiones cuantificables que otorgan recompensas virtuales.

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 21.2.7 y empaquetado como aplicación móvil nativa utilizando Capacitor.

## Filosofía y Arquitectura: Soberanía del Dispositivo

A diferencia de las alternativas comerciales actuales, Krash-Out se construye sobre el paradigma arquitectónico innegociable de la "Soberanía del Dispositivo". 

* 100% Local-First: La plataforma opera de manera completamente autónoma sin dependencias de servidores externos, latencia de red o bases de datos en la nube.
* Privacidad Absoluta: Toda la información del usuario, el progreso y las configuraciones residen cifrados exclusivamente en el almacenamiento local del terminal.
* Latencia Cero: La eliminación de comunicaciones asíncronas garantiza tiempos de respuesta visuales y táctiles instantáneos, evitando puntos de fuga de atención críticos.

## Características Principales

* Gestor Atómico de Tareas: Un entorno para resoluciones singulares equipado con un motor de físicas Swipe-to-Action. Deslizar la tarjeta hacia la derecha completa la tarea y procesa recompensas de inmediato, mientras que deslizarla a la izquierda la elimina de la base de datos.
* Motor de Rutinas y Hábitos: Un algoritmo diario que audita pasivamente el tiempo y regenera el tablero de hábitos automáticamente. Incluye un filtro cronológico que divide la gestión en vistas de "Para Hoy" y "Tus Rutinas", reduciendo la carga mental.
* Gamificación Matemática: Progresión de nivel mediante una curva de retardo exponencial, requiriendo mayor experiencia en estadios avanzados. Cuenta con un "Vigilante de Inactividad" que evalúa las rachas productivas numéricamente aislando saltos de zona horaria.
* Economía Circular y Tienda Abisal: Recompensas ponderadas según la dificultad subjetiva. El capital obtenido se invierte en un catálogo de activos gráficos con rarezas progresivas (Común, Raro, Épico, Legendario, Mítico).
* Identidad Digital (Avatar): Un sistema de renderizado de revestimiento múltiple (Z-Index Engine) que ensambla las piezas de indumentaria adquiridas sobre el lienzo del jugador.
* Sistema de Migración Nativo: Protocolos de exportación e importación de la base de datos completa en formato JSON puro, utilizando los conectores y Intents nativos del sistema operativo.

## Stack Tecnológico

El ecosistema tecnológico ha sido seleccionado para proporcionar el máximo rendimiento web encapsulado en un contenedor nativo:

* Core: Angular v21 (Arquitectura Standalone estricta).
* Estado y Reactividad: API nativa de Signals (reemplazando a RxJS para operaciones síncronas), computed y effect.
* Estilos: Tailwind CSS v4 para maquetación utilitaria y Angular Material (reescrito gráficamente) para calendarios y utilidades de capa base.
* Entorno Nativo: Capacitor (Intermediario de sistema de archivos, Intents de Android y empaquetado final).

## Development server

Para inicializar el entorno de desarrollo híbrido localmente, clona el repositorio e instala las dependencias:

```Bash
npm install
```

Para iniciar un servidor de desarrollo local, ejecuta:

```Bash
ng serve
```

Una vez que el servidor arranque, abre tu navegador y navega a http://localhost:4200/. La aplicación se recargará automáticamente siempre que modifiques cualquiera de los archivos fuente.

## Code scaffolding

Angular CLI incluye potentes herramientas de generación de código. Para generar un nuevo componente, ejecuta:

```Bash
ng generate component component-name
```

## Building

Para compilar el proyecto, ejecuta:

```Bash
ng build
```

Esto compilará tu proyecto y almacenará los artefactos de compilación en el directorio dist/. Por defecto, la compilación de producción optimiza tu aplicación para mayor rendimiento y velocidad.

## Sincronización Nativa (Capacitor)

Para inyectar la compilación web recién generada y los plugins nativos en el contenedor de Android:

```Bash
ng cap sync android
```

Tras esto, puedes abrir el proyecto en Android Studio, sincronizar los archivos de Gradle y ejecutar el proyecto en un dispositivo físico o emulador.

## Additional Resources

Para más información sobre el uso de Angular CLI, incluyendo referencias detalladas de comandos, visita la página Angular CLI Overview and Command Reference.