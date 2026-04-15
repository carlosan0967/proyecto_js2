# CampusBuild

## Funcionamiento General

CampusBuild es una aplicación de cliente único que gestiona información de proyectos, actividades, hitos y recursos humanos directamente en el navegador. Al iniciar, la aplicación lee los datos almacenados en la clave campusbuild_data de localStorage y los carga en memoria.
La navegación se controla mediante un menú lateral que alterna la visibilidad de las vistas principales (Dashboard, Proyectos, Actividades, Hitos, Recursos Humanos y Calendario).
Cada vista renderiza tablas o componentes actualizados dinámicamente. Las operaciones de creación y edición se ejecutan a través de modales que validan los campos obligatorios antes de persistir los cambios.
El estado de los hitos se recalcula automáticamente cuando se modifican las actividades asociadas.
La información se guarda de forma persistente en el almacenamiento local del navegador sin requerir conexión a servidor ni base de datos externa.

# Funcionalidad

## Gestión de Proyectos

Creación, actualización y eliminación de proyectos con nombre, descripción, fecha de inicio y fecha de fin.
Registro de actividades vinculadas a un proyecto, incluyendo responsable, fecha de inicio, duración estimada y estado (Pendiente, En Proceso, Terminada). Las actividades pueden ser actualizadas o eliminadas.
Definición de hitos asociados a actividades específicas. Los hitos pueden actualizarse o eliminarse. El sistema marca automáticamente un hito como "Cumplido" cuando todas sus actividades asignadas alcanzan el estado "Terminada".

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
