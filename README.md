# CampusBuild

## Funcionamiento General

CampusBuild es una aplicación de gestión de proyectos y recursos humanos que opera completamente en el navegador. Los datos se almacenan localmente mediante localStorage y se cargan en memoria al iniciar la sesión. La interfaz funciona como una aplicación de página única (SPA), donde la navegación lateral alterna la visibilidad de las vistas sin recargar el documento. Cada módulo permite la creación, edición y eliminación de registros mediante formularios modales que validan la información antes de persistirla. El estado de los datos se sincroniza automáticamente tras cada acción y se refleja en tiempo real en las tablas y componentes visuales.

# Funcionalidad

## Gestión de Proyectos

El sistema permite crear un proyecto con nombre, descripción, fechas de inicio y fin. También debe permitir actualizarlo y eliminarlo.
El sistema permite registrar actividades con responsable, fecha de inicio, duración estimada y estado (Pendiente, en proceso, terminada). También debe permitir actualizarlas y eliminarlas.
El sistema permite definir hitos clave, asociarlos a actividades específicas, actualizarlos y eliminarlos. Los hitos se dan por cumplidos cuando todas las actividades asignadas a este se completan.


## Gestión de Recursos Humanos

Registro de recursos humanos con identificación, nombre, fecha de nacimiento, tipo de sangre, ARL, género (opcional), salario y rol (Ingeniero, Supervisor, Arquitecto, Técnico, Obrero, Administrador, Otro).
Asignación de recursos humanos como responsables de actividades específicas.

## Cronograma

Visualización de un calendario mensual que muestra las actividades programadas por proyecto, destacando su estado y período de ejecución según la fecha de inicio y la duración estimada.
Consideraciones Adicionales
Interfaz fluida e intuitiva desarrollada con HTML, CSS y JavaScript.
Implementación de Web Components para encapsular elementos reutilizables (indicadores de estado y barras de progreso).
Persistencia de datos implementada mediante localStorage.

## Consideraciones Adicionales

Interfaz fluida e intuitiva desarrollada con HTML, CSS y JavaScript.
Implementación de Web Components para encapsular elementos reutilizables (indicadores de estado y barras de progreso).
Persistencia de datos implementada mediante localStorage.


## Arquitectura y Tecnología

HTML/CSS/JavaScript: Construcción estándar sin frameworks externos. CSS utiliza variables para mantener consistencia visual y diseño responsivo.
Web Components: Se definen dos componentes nativos: cb-badge para la visualización de estados (Pendiente, En Proceso, Terminada, Cumplido) y cb-progress para indicar el porcentaje de avance de cada proyecto.
Persistencia: Los datos se serializan a JSON y se almacenan en localStorage. La función de carga maneja errores de parseo y genera datos vacíos por defecto si no existe información previa.
Enrutamiento de Vistas: La navegación se resuelve mediante la alternancia de clases CSS (active) en contenedores de vista, disparando las funciones de renderizado correspondientes.
Modales: Los formularios de creación y edición se inyectan dinámicamente en un contenedor modal superpuesto, con callbacks asignados para guardar o descartar cambios.

## Uso de la Aplicación

Abrir el archivo index.html en un navegador moderno con soporte para JavaScript y Web Components.
Utilizar el menú lateral para acceder a la sección requerida.
Crear un proyecto inicial desde la vista "Proyectos" para habilitar el registro de actividades y la asignación de recursos.

