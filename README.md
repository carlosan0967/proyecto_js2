# CampusBuild

## Funcionamiento General

CampusBuild es una aplicación de gestión de proyectos y recursos humanos que opera completamente en el navegador. Los datos se almacenan localmente mediante `localStorage` y se cargan en memoria al iniciar la sesión. La interfaz funciona como una aplicación de página única (`SPA`), donde la navegación lateral alterna la visibilidad de las vistas sin recargar el documento. Cada módulo permite la creación, edición y eliminación de registros mediante formularios modales que validan la información antes de persistirla. El estado de los datos se sincroniza automáticamente tras cada acción y se refleja en tiempo real en las tablas y componentes visuales.

---

## Funcionalidad

### Gestión de Proyectos
- Creación, actualización y eliminación de proyectos con nombre, descripción, fecha de inicio y fecha de fin.
- Registro de actividades vinculadas a un proyecto, incluyendo responsable, fecha de inicio, duración estimada y estado (`Pendiente`, `En Proceso`, `Terminada`). Las actividades pueden ser actualizadas o eliminadas.
- Definición de hitos asociados a actividades específicas. Los hitos pueden actualizarse o eliminarse. El sistema marca automáticamente un hito como `"Cumplido"` cuando todas sus actividades asignadas alcanzan el estado `"Terminada"`.

### Gestión de Recursos Humanos
- Registro de recursos humanos con identificación, nombre, fecha de nacimiento, tipo de sangre, ARL, género (opcional), salario y rol (`Ingeniero`, `Supervisor`, `Arquitecto`, `Técnico`, `Obrero`, `Administrador`, `Otro`).
- Asignación de recursos humanos como responsables de actividades específicas.

### Cronograma
- Visualización de un calendario mensual que muestra las actividades programadas por proyecto, destacando su estado y período de ejecución según la fecha de inicio y la duración estimada.

### Consideraciones Adicionales
- Interfaz fluida e intuitiva desarrollada con HTML, CSS y JavaScript.
- Implementación de `Web Components` para encapsular elementos reutilizables (indicadores de estado y barras de progreso).
- Persistencia de datos implementada mediante `localStorage`.

---

## Arquitectura y Tecnología

- **HTML/CSS/JavaScript:** Construcción estándar sin frameworks externos. CSS utiliza variables para mantener consistencia visual y diseño responsivo.
- **Web Components:** Se definen dos componentes nativos: `cb-badge` para la visualización de estados (`Pendiente`, `En Proceso`, `Terminada`, `Cumplido`) y `cb-progress` para indicar el porcentaje de avance de cada proyecto.
- **Persistencia:** Los datos se serializan a JSON y se almacenan en `localStorage`. La función de carga maneja errores de parseo y genera datos vacíos por defecto si no existe información previa.
- **Enrutamiento de Vistas:** La navegación se resuelve mediante la alternancia de clases CSS (`active`) en contenedores de vista, disparando las funciones de renderizado correspondientes.
- **Modales:** Los formularios de creación y edición se inyectan dinámicamente en un contenedor modal superpuesto, con `callbacks` asignados para guardar o descartar cambios.

---

## Funcionalidades Adicionales (Implementación en JavaScript)

A partir del análisis del código en `app.js`, se han integrado los siguientes elementos para ampliar la funcionalidad y la experiencia de uso:

- Sistema de notificaciones tipo `toast` para retroalimentación inmediata de operaciones exitosas o errores de validación.
- Filtros dinámicos por proyecto en las vistas de Actividades y Calendario, permitiendo visualizar datos segmentados.
- Cálculo automático del porcentaje de avance por proyecto, basado en la proporción de actividades finalizadas respecto al total.
- Sincronización automática del estado de los hitos: se recalcula y actualiza a `"Cumplido"` o `"Pendiente"` cada vez que se modifica una actividad asociada.
- Navegación responsiva con menú lateral colapsable que se cierra automáticamente en resoluciones inferiores a `768px`.
- Panel de `Dashboard` con listados de actividades recientes y hitos pendientes para seguimiento rápido.
- Validación de campos obligatorios en todos los formularios y diálogos de confirmación nativos para operaciones de eliminación.
- Generación automática de identificadores únicos alfanuméricos para cada registro creado.
- Calendario interactivo con navegación mensual, resaltado visual del día actual y truncamiento inteligente de eventos (muestra un máximo de tres por celda con indicador de cantidad restante).
- Manejo seguro de carga de datos con bloque `try/catch` que restaura la estructura base en caso de corrupción o ausencia de datos en `localStorage`.

---

## Uso de la Aplicación

1. Abrir el archivo `index.html` en un navegador moderno con soporte para JavaScript y `Web Components`.
2. Utilizar el menú lateral para acceder a la sección requerida.
3. Crear un proyecto inicial desde la vista `"Proyectos"` para habilitar el registro de actividades y la asignación de recursos.
