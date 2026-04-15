# CampusBuild

## Funcionamiento General

CampusBuild es una aplicación de cliente único que gestiona información de proyectos, actividades, hitos y recursos humanos directamente en el navegador. Al iniciar, la aplicación lee los datos almacenados en la clave campusbuild_data de localStorage y los carga en memoria.
La navegación se controla mediante un menú lateral que alterna la visibilidad de las vistas principales (Dashboard, Proyectos, Actividades, Hitos, Recursos Humanos y Calendario).
Cada vista renderiza tablas o componentes actualizados dinámicamente. Las operaciones de creación y edición se ejecutan a través de modales que validan los campos obligatorios antes de persistir los cambios.
El estado de los hitos se recalcula automáticamente cuando se modifican las actividades asociadas.
La información se guarda de forma persistente en el almacenamiento local del navegador sin requerir conexión a servidor ni base de datos externa.

# Requerimientos

## Gestión de Proyectos

Creación, actualización y eliminación de proyectos con nombre, descripción, fecha de inicio y fecha de fin.
Registro de actividades vinculadas a un proyecto, incluyendo responsable, fecha de inicio, duración estimada y estado (Pendiente, En Proceso, Terminada). Las actividades pueden ser actualizadas o eliminadas.
Definición de hitos asociados a actividades específicas. Los hitos pueden actualizarse o eliminarse. El sistema marca automáticamente un hito como "Cumplido" cuando todas sus actividades asignadas alcanzan el estado "Terminada".

## Gestión de Recursos Humanos

Registro de recursos humanos con identificación, nombre, fecha de nacimiento, tipo de sangre, ARL, género (opcional), salario y rol (Ingeniero, Supervisor, Arquitecto, Técnico, Obrero, Administrador, Otro).
Asignación de recursos humanos como responsables de actividades específicas.


