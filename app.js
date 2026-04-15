// ─────────────────────────────────────────────────────────────
// COMPONENTE WEB PERSONALIZADO: <cb-badge>
// Muestra una etiqueta de color según el estado de un elemento
// ─────────────────────────────────────────────────────────────

class CbBadge extends HTMLElement { // Define la clase CbBadge que extiende HTMLElement para crear un componente web personalizado

  static get observedAttributes() { return ['estado']; } // Le dice al navegador que observe cambios en el atributo "estado"

  connectedCallback() { this._render(); } // Se ejecuta automáticamente cuando el componente es insertado en el DOM; llama a _render()

  attributeChangedCallback() { this._render(); } // Se ejecuta automáticamente cuando el atributo "estado" cambia; vuelve a llamar a _render()

  _render() { // Método privado que construye el HTML interno del componente

    const e = this.getAttribute('estado') || ''; // Obtiene el valor del atributo "estado"; si no existe, usa cadena vacía

    const map = { // Objeto que mapea cada estado posible a su clase CSS y etiqueta de texto
      'Pendiente':  { cls: 'badge-pendiente', lbl: 'Pendiente' },   // Estado "Pendiente" → clase CSS badge-pendiente, texto "Pendiente"
      'En Proceso': { cls: 'badge-proceso',   lbl: 'En Proceso' },  // Estado "En Proceso" → clase CSS badge-proceso, texto "En Proceso"
      'Terminada':  { cls: 'badge-terminada', lbl: 'Terminada' },   // Estado "Terminada" → clase CSS badge-terminada, texto "Terminada"
      'Cumplido':   { cls: 'badge-cumplido',  lbl: 'Cumplido' },    // Estado "Cumplido" → clase CSS badge-cumplido, texto "Cumplido"
      'Pendiente-h':{ cls: 'badge-pendiente-h',lbl: 'Pendiente' },  // Estado interno de hito pendiente → clase badge-pendiente-h, texto "Pendiente"
    };

    const d = map[e] || { cls: '', lbl: e }; // Busca el estado en el mapa; si no lo encuentra, usa clase vacía y el valor tal cual

    this.innerHTML = `<span class="badge ${d.cls}">${d.lbl}</span>`;
  }
}

customElements.define('cb-badge', CbBadge); // Registra el componente personalizado con la etiqueta <cb-badge> en el navegador



// ─────────────────────────────────────────────────────────────
// COMPONENTE WEB PERSONALIZADO: <cb-progress>
// Muestra una barra de progreso con porcentaje
// ─────────────────────────────────────────────────────────────

class CbProgress extends HTMLElement { // Define la clase CbProgress que extiende HTMLElement para crear un componente de barra de progreso

  static get observedAttributes() { return ['value']; } // Le dice al navegador que observe cambios en el atributo "value"

  connectedCallback() { this._render(); } // Se ejecuta cuando el componente es insertado en el DOM; llama a _render()

  attributeChangedCallback() { this._render(); } // Se ejecuta cuando el atributo "value" cambia; vuelve a renderizar

  _render() { // Método privado que construye el HTML de la barra de progreso

    const v = Math.min(100, Math.max(0, parseInt(this.getAttribute('value')) || 0)); // Lee el atributo "value", lo convierte a entero y lo limita entre 0 y 100

    this.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div class="progress-bar" style="flex:1">
          <div class="progress-fill" style="width:${v}%"></div>
        </div>
        <span style="font-size:.78rem;color:var(--text2);width:32px;text-align:right">${v}%</span>
      </div>`;
  }
}

customElements.define('cb-progress', CbProgress); // Registra el componente personalizado con la etiqueta <cb-progress> en el navegador


// ─────────────────────────────────────────────────────────────
// GESTIÓN DE DATOS EN localStorage
// Carga, guarda y define la estructura inicial de la base de datos
// ─────────────────────────────────────────────────────────────

const KEY = 'campusbuild_data'; // Constante con la clave usada para guardar y leer datos en localStorage

function loadData() { // Función que carga los datos guardados en localStorage
  try { return JSON.parse(localStorage.getItem(KEY)) || defaultData(); } // Intenta leer y parsear los datos; si no existen devuelve la estructura por defecto
  catch { return defaultData(); } // Si hay un error al parsear (datos corruptos), devuelve la estructura por defecto
}

function saveData(d) { // Función que guarda el objeto de datos en localStorage
  localStorage.setItem(KEY, JSON.stringify(d)); // Convierte el objeto a JSON y lo almacena con la clave KEY
}

function defaultData() { // Función que retorna la estructura vacía inicial de la base de datos
  return { proyectos: [], actividades: [], hitos: [], recursos: [] }; // Retorna un objeto con cuatro arreglos vacíos: proyectos, actividades, hitos y recursos
}

let DB = loadData(); // Carga los datos al iniciar la app y los guarda en la variable global DB

function persist() { saveData(DB); } // Función auxiliar que guarda el estado actual de DB en localStorage

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); } // Genera un ID único combinando la hora actual y un número aleatorio en base 36

// ─────────────────────────────────────────────────────────────
// SISTEMA DE NOTIFICACIONES (TOAST)
// ─────────────────────────────────────────────────────────────

function toast(msg, type = 'success') { // Función que muestra una notificación temporal; recibe el mensaje y el tipo (por defecto "success")
  const el = document.getElementById('toast'); // Obtiene el elemento HTML del toast por su ID
  el.textContent = msg; // Establece el texto del toast con el mensaje recibido
  el.className = `toast show ${type}`;
  clearTimeout(el._t); // Cancela cualquier temporizador previo para evitar que se oculte antes de tiempo
  el._t = setTimeout(() => el.className = 'toast', 2800); // Programa que el toast se oculte automáticamente después de 2.8 segundos
}

// ─────────────────────────────────────────────────────────────
// NAVEGACIÓN ENTRE VISTAS
// ─────────────────────────────────────────────────────────────

const titles = { // Objeto que mapea cada ID de vista con su título a mostrar en la barra superior
  dashboard: 'Dashboard', proyectos: 'Proyectos',          // Títulos para dashboard y proyectos
  actividades: 'Actividades', hitos: 'Hitos',               // Títulos para actividades e hitos
  recursos: 'Recursos Humanos', calendario: 'Calendario'    // Títulos para recursos y calendario
};

document.querySelectorAll('.nav-btn').forEach(btn => { // Selecciona todos los botones de navegación del sidebar y les agrega un evento
  btn.addEventListener('click', () => { // Agrega un listener de clic a cada botón de navegación
    const v = btn.dataset.view; // Obtiene el nombre de la vista desde el atributo data-view del botón
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); // Quita la clase "active" de todos los botones de navegación
    btn.classList.add('active'); // Agrega la clase "active" solo al botón que fue clickeado
    document.querySelectorAll('.view').forEach(s => s.classList.remove('active')); // Oculta todas las vistas quitando la clase "active"
    document.getElementById('view-' + v).classList.add('active'); // Muestra solo la vista correspondiente al botón clickeado
    document.getElementById('pageTitle').textContent = titles[v]; // Actualiza el título de la página con el nombre de la vista activa
    if (v === 'dashboard') renderDashboard();       // Si la vista es dashboard, renderiza el dashboard
    if (v === 'proyectos') renderProyectos();       // Si la vista es proyectos, renderiza la tabla de proyectos
    if (v === 'actividades') renderActividades();   // Si la vista es actividades, renderiza la tabla de actividades
    if (v === 'hitos') renderHitos();               // Si la vista es hitos, renderiza la tabla de hitos
    if (v === 'recursos') renderRecursos();         // Si la vista es recursos, renderiza la tabla de recursos humanos
    if (v === 'calendario') renderCalendario();     // Si la vista es calendario, renderiza el calendario
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open'); // En pantallas móviles, cierra el sidebar automáticamente al navegar
  });
});

document.getElementById('menuToggle').addEventListener('click', () => { // Agrega un listener al botón de menú hamburguesa para móviles
  document.getElementById('sidebar').classList.toggle('open'); // Alterna la clase "open" del sidebar para mostrarlo u ocultarlo
});

document.getElementById('dateBadge').textContent = // Establece el texto del badge de fecha en la barra superior
  new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); // Formatea la fecha actual en español colombiano mostrando día, mes y año

// ─────────────────────────────────────────────────────────────
// SISTEMA DE MODAL GENÉRICO
// Abre y cierra un diálogo reutilizable para formularios
// ─────────────────────────────────────────────────────────────

let modalSaveCallback = null; // Variable global que almacena la función a ejecutar cuando se presiona "Guardar" en el modal

function openModal(title, bodyHTML, onSave) { // Función que abre el modal con un título, contenido HTML y una función de guardado
  document.getElementById('modalTitle').textContent = title; // Establece el título del modal
  document.getElementById('modalBody').innerHTML = bodyHTML; // Inserta el contenido HTML (formulario) dentro del modal
  modalSaveCallback = onSave; // Guarda la función de guardado en la variable global para usarla después
  document.getElementById('modalOverlay').classList.add('open'); // Muestra el modal agregando la clase "open" al overlay
}

function closeModal() { // Función que cierra el modal y limpia el callback
  document.getElementById('modalOverlay').classList.remove('open'); // Oculta el modal quitando la clase "open"
  modalSaveCallback = null; // Limpia la función de guardado para evitar ejecuciones accidentales
}

document.getElementById('modalClose').addEventListener('click', closeModal); // Al hacer clic en el botón X del modal, lo cierra
document.getElementById('modalCancel').addEventListener('click', closeModal); // Al hacer clic en "Cancelar", cierra el modal

document.getElementById('modalOverlay').addEventListener('click', e => { // Agrega un listener al overlay del modal
  if (e.target === document.getElementById('modalOverlay')) closeModal(); // Si el clic fue en el fondo oscuro (no en el modal en sí), lo cierra
});

document.getElementById('modalSave').addEventListener('click', () => { // Al hacer clic en "Guardar" del modal
  if (modalSaveCallback) modalSaveCallback(); // Ejecuta la función de guardado si está definida
});


// ─────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES DE BÚSQUEDA Y SELECTS
// ─────────────────────────────────────────────────────────────

function getProyectoNombre(id) { // Función que devuelve el nombre de un proyecto dado su ID
  const p = DB.proyectos.find(x => x.id === id); // Busca el proyecto en el arreglo DB.proyectos por su ID
  return p ? p.nombre : '—'; // Si lo encuentra retorna el nombre; si no, retorna un guión
}

function getActividadNombre(id) { // Función que devuelve el nombre de una actividad dado su ID
  const a = DB.actividades.find(x => x.id === id); // Busca la actividad en DB.actividades por su ID
  return a ? a.nombre : '—'; // Si la encuentra retorna el nombre; si no, retorna un guión
}

function getRecursoNombre(id) { // Función que devuelve el nombre de un recurso humano dado su ID
  const r = DB.recursos.find(x => x.id === id); // Busca el recurso en DB.recursos por su ID
  return r ? r.nombre : '—'; // Si lo encuentra retorna el nombre; si no, retorna un guión
}

function proyectosOptions(selected = '') { // Función que genera las opciones HTML <option> de todos los proyectos para un <select>
  return DB.proyectos.map(p => // Itera sobre cada proyecto en la base de datos
    `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${p.nombre}</option>`
  ).join(''); // Une todos los <option> en una sola cadena HTML
}

function recursosOptions(selected = '') { // Función que genera las opciones HTML <option> de todos los recursos para un <select>
  return [{ id: '', nombre: '— Sin asignar —' }, ...DB.recursos].map(r => // Agrega la opción "Sin asignar" al inicio y luego itera los recursos
    `<option value="${r.id}" ${r.id === selected ? 'selected' : ''}>${r.nombre}</option>`
  ).join(''); // Une todas las opciones en una cadena HTML
}

function proyectoProgress(pId) { // Función que calcula el porcentaje de progreso de un proyecto basado en sus actividades terminadas
  const acts = DB.actividades.filter(a => a.proyectoId === pId); // Filtra todas las actividades que pertenecen al proyecto indicado
  if (!acts.length) return 0; // Si no hay actividades, el progreso es 0%
  const done = acts.filter(a => a.estado === 'Terminada').length; // Cuenta cuántas actividades tienen estado "Terminada"
  return Math.round((done / acts.length) * 100); // Calcula y redondea el porcentaje de actividades terminadas
}

function actualizarHitosEstado() { // Función que recalcula automáticamente el estado de todos los hitos
  DB.hitos.forEach(h => { // Itera sobre cada hito en la base de datos
    if (!h.actividadesIds || !h.actividadesIds.length) return; // Si el hito no tiene actividades asociadas, lo omite
    const todas = h.actividadesIds.every(aId => { // Verifica si TODAS las actividades del hito están terminadas
      const a = DB.actividades.find(x => x.id === aId); // Busca cada actividad asociada al hito por su ID
      return a && a.estado === 'Terminada'; // Retorna true solo si la actividad existe y está terminada
    });
    h.estado = todas ? 'Cumplido' : 'Pendiente-h'; // Si todas las actividades están terminadas el hito es "Cumplido"; si no, "Pendiente-h"
  });
  persist(); // Guarda los cambios de estado de los hitos en localStorage
}

  
// ─────────────────────────────────────────────────────────────
// VISTA: DASHBOARD
// Muestra resumen de conteos y elementos recientes
// ─────────────────────────────────────────────────────────────

function renderDashboard() { // Función que actualiza todos los elementos visuales del dashboard
  document.getElementById('cnt-proyectos').textContent = DB.proyectos.length;     // Muestra el total de proyectos en el contador del dashboard
  document.getElementById('cnt-actividades').textContent = DB.actividades.length; // Muestra el total de actividades en el contador del dashboard
  document.getElementById('cnt-hitos').textContent = DB.hitos.length;             // Muestra el total de hitos en el contador del dashboard
  document.getElementById('cnt-recursos').textContent = DB.recursos.length;       // Muestra el total de recursos humanos en el contador del dashboard

  const raEl = document.getElementById('recent-actividades'); // Obtiene el contenedor HTML de las actividades recientes
  const recent = [...DB.actividades].slice(-5).reverse(); // Copia el arreglo de actividades, toma las últimas 5 y las invierte para mostrar las más recientes primero
  if (recent.length) { // Si hay actividades recientes para mostrar
    raEl.innerHTML = recent.map(a => `
      <div class="recent-item">
        <span>${a.nombre}</span>
        <cb-badge estado="${a.estado}"></cb-badge>
      </div>`).join('');
  } else { // Si no hay actividades registradas
    raEl.innerHTML = `<p style="color:var(--text2);font-size:.85rem">Sin actividades registradas.</p>`;
  }

  const rhEl = document.getElementById('recent-hitos'); // Obtiene el contenedor HTML de los hitos pendientes
  const hpend = DB.hitos.filter(h => h.estado !== 'Cumplido').slice(0, 5); // Filtra los hitos que no están cumplidos y toma máximo 5
  if (hpend.length) { // Si hay hitos pendientes para mostrar
    rhEl.innerHTML = hpend.map(h => `
      <div class="recent-item">
        <span>${h.nombre}</span>
        <cb-badge estado="${h.estado}"></cb-badge>
      </div>`).join('');
  } else { // Si no hay hitos pendientes
    rhEl.innerHTML = `<p style="color:var(--text2);font-size:.85rem">No hay hitos pendientes.</p>`;
  }
}


// ─────────────────────────────────────────────────────────────
// VISTA: PROYECTOS
// CRUD completo para gestionar proyectos
// ─────────────────────────────────────────────────────────────

function renderProyectos() { // Función que renderiza la tabla de proyectos
  const tbody = document.getElementById('tbody-proyectos'); // Obtiene el cuerpo de la tabla de proyectos
  if (!DB.proyectos.length) { // Si no hay proyectos en la base de datos
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No hay proyectos. ¡Crea el primero!</td></tr>`;
    return; // Sale de la función sin continuar
  }
  tbody.innerHTML = DB.proyectos.map(p => { // Genera una fila HTML por cada proyecto
    const prog = proyectoProgress(p.id); // Calcula el porcentaje de progreso del proyecto
    return `<tr>
      <td><strong>${p.nombre}</strong></td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.descripcion || '—'}</td>
      <td>${p.fechaInicio || '—'}</td>
      <td>${p.fechaFin || '—'}</td>
      <td style="min-width:130px"><cb-progress value="${prog}"></cb-progress></td>
      <td>
        <div class="action-group">
          <button class="btn-edit" onclick="editarProyecto('${p.id}')">Editar</button>
          <button class="btn-danger" onclick="eliminarProyecto('${p.id}')">Eliminar</button>
        </div>
      </td>
    </tr>`;
  }).join(''); // Une todas las filas en una cadena HTML y la inserta en el tbody
}

document.getElementById('btnNuevoProyecto').addEventListener('click', () => { // Agrega listener al botón "Nuevo Proyecto"
  openModal('Nuevo Proyecto', formProyecto(), () => guardarProyecto(null)); // Abre el modal con el formulario vacío y pasa la función de guardado (null = nuevo)
});

function formProyecto(p = {}) { // Función que genera el HTML del formulario de proyecto; recibe un objeto con datos para edición
  return `
    <div class="form-group"><label>Nombre *</label>
      <input id="f-nombre" value="${p.nombre || ''}" placeholder="Nombre del proyecto"/></div>
    <div class="form-group"><label>Descripción</label>
      <textarea id="f-desc">${p.descripcion || ''}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Fecha Inicio *</label>
        <input id="f-inicio" type="date" value="${p.fechaInicio || ''}"/></div>
      <div class="form-group"><label>Fecha Fin *</label>
        <input id="f-fin" type="date" value="${p.fechaFin || ''}"/></div>
    </div>`;
}

function guardarProyecto(id) { // Función que guarda un proyecto nuevo o actualiza uno existente según si se pasa un ID
  const nombre = document.getElementById('f-nombre').value.trim(); // Lee y limpia el valor del campo nombre
  const desc   = document.getElementById('f-desc').value.trim(); // Lee y limpia el valor del campo descripción
  const inicio = document.getElementById('f-inicio').value; // Lee el valor de la fecha de inicio
  const fin    = document.getElementById('f-fin').value; // Lee el valor de la fecha de fin
  if (!nombre || !inicio || !fin) { toast('Completa los campos obligatorios', 'error'); return; } // Valida que los campos obligatorios no estén vacíos; si lo están muestra error
  if (id) { // Si se pasó un ID, se trata de una edición
    const p = DB.proyectos.find(x => x.id === id); // Busca el proyecto existente en la base de datos
    Object.assign(p, { nombre, descripcion: desc, fechaInicio: inicio, fechaFin: fin }); // Actualiza las propiedades del proyecto con los nuevos valores
    toast('Proyecto actualizado'); // Muestra notificación de éxito
  } else { // Si no se pasó ID, es un proyecto nuevo
    DB.proyectos.push({ id: uid(), nombre, descripcion: desc, fechaInicio: inicio, fechaFin: fin }); // Crea un nuevo objeto proyecto con ID único y lo agrega al arreglo
    toast('Proyecto creado'); // Muestra notificación de éxito
  }
  persist(); // Guarda los cambios en localStorage
  closeModal(); // Cierra el modal
  renderProyectos(); // Vuelve a renderizar la tabla de proyectos con los datos actualizados
  actualizarFiltros(); // Actualiza los selectores de filtro que usan la lista de proyectos
}

function editarProyecto(id) { // Función que abre el modal de edición para un proyecto existente
  const p = DB.proyectos.find(x => x.id === id); // Busca el proyecto por ID para precargar sus datos en el formulario
  openModal('Editar Proyecto', formProyecto(p), () => guardarProyecto(id)); // Abre el modal con los datos del proyecto y pasa el ID para la actualización
}

function eliminarProyecto(id) { // Función que elimina un proyecto y todos sus datos relacionados
  if (!confirm('¿Eliminar este proyecto? También se eliminarán sus actividades e hitos asociados.')) return; // Pide confirmación al usuario antes de eliminar
  DB.actividades = DB.actividades.filter(a => a.proyectoId !== id); // Elimina todas las actividades que pertenecen a este proyecto
  DB.hitos = DB.hitos.filter(h => h.proyectoId !== id); // Elimina todos los hitos que pertenecen a este proyecto
  DB.proyectos = DB.proyectos.filter(x => x.id !== id); // Elimina el proyecto del arreglo de proyectos
  persist(); // Guarda los cambios en localStorage
  renderProyectos(); // Vuelve a renderizar la tabla de proyectos
  actualizarFiltros(); // Actualiza los selectores de filtro
  toast('Proyecto eliminado', 'error'); // Muestra notificación de eliminación en rojo
}
  
// ─────────────────────────────────────────────────────────────
// VISTA: ACTIVIDADES
// CRUD completo para gestionar actividades de proyectos
// ─────────────────────────────────────────────────────────────

function renderActividades(filtroId = document.getElementById('filtro-proyecto-act').value) { // Función que renderiza la tabla de actividades; acepta un filtro de proyecto opcional
  const tbody = document.getElementById('tbody-actividades'); // Obtiene el cuerpo de la tabla de actividades
  let acts = DB.actividades; // Inicia con todas las actividades
  if (filtroId) acts = acts.filter(a => a.proyectoId === filtroId); // Si hay filtro de proyecto, muestra solo las actividades de ese proyecto
  if (!acts.length) { // Si no hay actividades para mostrar
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No hay actividades registradas.</td></tr>`;
    return; // Sale de la función
  }
  tbody.innerHTML = acts.map(a => `<tr>
    <td><strong>${a.nombre}</strong></td>
    <td>${getProyectoNombre(a.proyectoId)}</td>
    <td>${getRecursoNombre(a.responsableId)}</td>
    <td>${a.fechaInicio || '—'}</td>
    <td>${a.duracion ? a.duracion + ' días' : '—'}</td>
    <td><cb-badge estado="${a.estado}"></cb-badge></td>
    <td>
      <div class="action-group">
        <button class="btn-edit" onclick="editarActividad('${a.id}')">Editar</button>
        <button class="btn-danger" onclick="eliminarActividad('${a.id}')">Eliminar</button>
      </div>
    </td>
  </tr>`).join('');
}

document.getElementById('filtro-proyecto-act').addEventListener('change', function() { // Listener para el selector de filtro de actividades
  renderActividades(this.value); // Al cambiar el filtro, vuelve a renderizar las actividades con el proyecto seleccionado
});

document.getElementById('btnNuevaActividad').addEventListener('click', () => { // Listener para el botón "Nueva Actividad"
  if (!DB.recursos.length) { // Verifica que haya al menos un recurso humano registrado
    toast('Debes registrar al menos un recurso antes de crear una actividad', 'error'); // Muestra error si no hay recursos
    return; // No abre el modal si no hay recursos
  }
  openModal('Nueva Actividad', formActividad(), () => guardarActividad(null)); // Abre el modal con el formulario vacío para crear una nueva actividad
});

function formActividad(a = {}) { // Función que genera el HTML del formulario de actividad; recibe un objeto con datos para edición
  return `
    <div class="form-group"><label>Nombre *</label>
      <input id="f-nombre" value="${a.nombre || ''}" placeholder="Nombre de la actividad"/></div>
    <div class="form-group"><label>Proyecto *</label>
      <select id="f-proyecto"><option value="">Seleccionar...</option>${proyectosOptions(a.proyectoId)}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Fecha Inicio</label>
        <input id="f-inicio" type="date" value="${a.fechaInicio || ''}"/></div>
      <div class="form-group"><label>Duración estimada (días)</label>
        <input id="f-duracion" type="number" min="1" value="${a.duracion || ''}"/></div>
    </div>
    <div class="form-group"><label>Responsable *</label>
      <select id="f-responsable">${recursosOptions(a.responsableId)}</select></div>
    <div class="form-group"><label>Estado</label>
      <select id="f-estado">
        <option value="Pendiente" ${a.estado==='Pendiente'?'selected':''}>Pendiente</option>
        <option value="En Proceso" ${a.estado==='En Proceso'?'selected':''}>En Proceso</option>
        <option value="Terminada" ${a.estado==='Terminada'?'selected':''}>Terminada</option>
      </select></div>`;
}

function guardarActividad(id) { // Función que guarda una actividad nueva o actualiza una existente
  const nombre      = document.getElementById('f-nombre').value.trim(); // Lee el nombre de la actividad
  const proyectoId  = document.getElementById('f-proyecto').value; // Lee el ID del proyecto seleccionado
  const fechaInicio = document.getElementById('f-inicio').value; // Lee la fecha de inicio
  const duracion    = document.getElementById('f-duracion').value; // Lee la duración en días
  const responsableId = document.getElementById('f-responsable').value; // Lee el ID del responsable seleccionado
  const estado      = document.getElementById('f-estado').value; // Lee el estado seleccionado
  if (!nombre || !proyectoId) { toast('Nombre y proyecto son obligatorios', 'error'); return; } // Valida que nombre y proyecto no estén vacíos
  if (!responsableId) { toast('Debes asignar un responsable a la actividad', 'error'); return; } // Valida que se haya asignado un responsable
  if (id) { // Si hay ID, es una edición
    const a = DB.actividades.find(x => x.id === id); // Busca la actividad existente
    Object.assign(a, { nombre, proyectoId, fechaInicio, duracion: parseInt(duracion)||null, responsableId, estado }); // Actualiza sus propiedades con los nuevos valores
    toast('Actividad actualizada'); // Muestra notificación de éxito
  } else { // Si no hay ID, es una nueva actividad
    DB.actividades.push({ id: uid(), nombre, proyectoId, fechaInicio, duracion: parseInt(duracion)||null, responsableId, estado }); // Crea y agrega la nueva actividad al arreglo
    toast('Actividad creada'); // Muestra notificación de éxito
  }
  actualizarHitosEstado(); // Recalcula el estado de los hitos ya que una actividad puede afectarlos
  persist(); // Guarda los cambios en localStorage
  closeModal(); // Cierra el modal
  renderActividades(); // Vuelve a renderizar la tabla de actividades
}

function editarActividad(id) { // Función que abre el modal de edición para una actividad existente
  const a = DB.actividades.find(x => x.id === id); // Busca la actividad por su ID
  openModal('Editar Actividad', formActividad(a), () => guardarActividad(id)); // Abre el modal con los datos de la actividad y el ID para actualización
}

function eliminarActividad(id) { // Función que elimina una actividad y la desvincula de los hitos
  if (!confirm('¿Eliminar esta actividad?')) return; // Pide confirmación al usuario
  DB.actividades = DB.actividades.filter(x => x.id !== id); // Elimina la actividad del arreglo
  DB.hitos.forEach(h => { // Itera sobre todos los hitos para limpiar la referencia a esta actividad
    h.actividadesIds = (h.actividadesIds || []).filter(aId => aId !== id); // Quita el ID de la actividad eliminada de cada hito que la contenía
  });
  actualizarHitosEstado(); // Recalcula el estado de los hitos afectados
  persist(); // Guarda los cambios en localStorage
  renderActividades(); // Vuelve a renderizar la tabla de actividades
  toast('Actividad eliminada', 'error'); // Muestra notificación de eliminación
}

  
// ─────────────────────────────────────────────────────────────
// VISTA: HITOS
// CRUD para gestionar hitos de proyectos
// ─────────────────────────────────────────────────────────────

function renderHitos() { // Función que renderiza la tabla de hitos
  const tbody = document.getElementById('tbody-hitos'); // Obtiene el cuerpo de la tabla de hitos
  if (!DB.hitos.length) { // Si no hay hitos registrados
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No hay hitos registrados.</td></tr>`;
    return; // Sale de la función
  }
  tbody.innerHTML = DB.hitos.map(h => { // Genera una fila HTML por cada hito
    const acts = (h.actividadesIds || []).map(aId => getActividadNombre(aId)).join(', ') || '—'; // Obtiene los nombres de todas las actividades del hito y los une con coma
    return `<tr>
      <td><strong>${h.nombre}</strong></td>
      <td>${getProyectoNombre(h.proyectoId)}</td>
      <td style="max-width:200px;font-size:.82rem;color:var(--text2)">${acts}</td>
      <td><cb-badge estado="${h.estado}"></cb-badge></td>
      <td>
        <div class="action-group">
          <button class="btn-edit" onclick="editarHito('${h.id}')">Editar</button>
        </div>
      </td>
    </tr>`;
  }).join(''); // Une todas las filas y las inserta en el tbody
}

document.getElementById('btnNuevoHito').addEventListener('click', () => { // Listener para el botón "Nuevo Hito"
  openModal('Nuevo Hito', formHito(), () => guardarHito(null)); // Abre el modal con el formulario vacío para crear un nuevo hito
});

function formHito(h = {}) { // Función que genera el HTML del formulario de hito; recibe datos del hito para edición
  const actsDelProyecto = h.proyectoId // Si el hito ya tiene proyecto asignado
    ? DB.actividades.filter(a => a.proyectoId === h.proyectoId) // Filtra las actividades del proyecto del hito
    : []; // Si no tiene proyecto, el arreglo está vacío

  const actsChecks = actsDelProyecto.map(a => // Genera un checkbox HTML por cada actividad del proyecto
    `<label><input type="checkbox" value="${a.id}" ${(h.actividadesIds||[]).includes(a.id)?'checked':''}> ${a.nombre}</label>`
  ).join(''); // Une todos los checkboxes en una cadena HTML

  return `
    <div class="form-group"><label>Nombre *</label>
      <input id="f-nombre" value="${h.nombre || ''}" placeholder="Nombre del hito"/></div>
    <div class="form-group"><label>Proyecto *</label>
      <select id="f-proyecto" onchange="actualizarActsHito(this.value, ${JSON.stringify((h.actividadesIds||[]))})">
        <option value="">Seleccionar...</option>${proyectosOptions(h.proyectoId)}</select></div>
    <div class="form-group"><label>Actividades asociadas</label>
      <div class="check-list" id="checklist-acts">
        ${actsChecks || '<span style="color:var(--text2);font-size:.82rem">Selecciona un proyecto primero</span>'}
      </div>
    </div>`;
}

window.actualizarActsHito = function(proyId, selIds = []) { // Función global que actualiza los checkboxes de actividades al cambiar el proyecto en el formulario de hito
  const acts = DB.actividades.filter(a => a.proyectoId === proyId); // Obtiene las actividades del proyecto seleccionado
  const el = document.getElementById('checklist-acts'); // Obtiene el contenedor de checkboxes
  if (!el) return; // Si el elemento no existe, sale de la función
  if (!acts.length) { // Si el proyecto no tiene actividades
    el.innerHTML = '<span style="color:var(--text2);font-size:.82rem">No hay actividades en este proyecto</span>'; // Muestra mensaje informativo
    return; // Sale de la función
  }
  el.innerHTML = acts.map(a => // Genera un checkbox por cada actividad del proyecto
    `<label><input type="checkbox" value="${a.id}" ${selIds.includes(a.id)?'checked':''}> ${a.nombre}</label>`
  ).join(''); // Inserta los checkboxes en el contenedor
};

function guardarHito(id) { // Función que guarda un hito nuevo o actualiza uno existente
  const nombre     = document.getElementById('f-nombre').value.trim(); // Lee el nombre del hito
  const proyectoId = document.getElementById('f-proyecto').value; // Lee el ID del proyecto seleccionado
  if (!nombre || !proyectoId) { toast('Nombre y proyecto son obligatorios', 'error'); return; } // Valida campos obligatorios
  const checks = document.querySelectorAll('#checklist-acts input[type="checkbox"]:checked'); // Obtiene todos los checkboxes marcados en la lista de actividades
  const actividadesIds = Array.from(checks).map(c => c.value); // Convierte los checkboxes marcados en un arreglo de IDs de actividades

  if (id) { // Si hay ID, es una edición
    const h = DB.hitos.find(x => x.id === id); // Busca el hito existente
    Object.assign(h, { nombre, proyectoId, actividadesIds }); // Actualiza las propiedades del hito
    toast('Hito actualizado'); // Muestra notificación de éxito
  } else { // Si no hay ID, es un hito nuevo
    DB.hitos.push({ id: uid(), nombre, proyectoId, actividadesIds, estado: 'Pendiente-h' }); // Crea y agrega el nuevo hito con estado inicial "Pendiente-h"
    toast('Hito creado'); // Muestra notificación de éxito
  }
  actualizarHitosEstado(); // Recalcula el estado del hito según sus actividades
  persist(); // Guarda los cambios en localStorage
  closeModal(); // Cierra el modal
  renderHitos(); // Vuelve a renderizar la tabla de hitos
}

function editarHito(id) { // Función que abre el modal de edición para un hito existente
  const h = DB.hitos.find(x => x.id === id); // Busca el hito por su ID
  openModal('Editar Hito', formHito(h), () => guardarHito(id)); // Abre el modal con los datos del hito y el ID para actualización
}

 
// ─────────────────────────────────────────────────────────────
// VISTA: RECURSOS HUMANOS
// CRUD completo para gestionar el personal del proyecto
// ─────────────────────────────────────────────────────────────

function renderRecursos() { // Función que renderiza la tabla de recursos humanos
  const tbody = document.getElementById('tbody-recursos'); // Obtiene el cuerpo de la tabla de recursos
  if (!DB.recursos.length) { // Si no hay recursos registrados
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No hay recursos registrados.</td></tr>`;
    return; // Sale de la función
  }
  tbody.innerHTML = DB.recursos.map(r => `<tr>
    <td>${r.identificacion}</td>
    <td><strong>${r.nombre}</strong></td>
    <td>${r.rol || '—'}</td>
    <td>${r.arl || '—'}</td>
    <td>${r.salario ? '$' + Number(r.salario).toLocaleString('es-CO') : '—'}</td>
    <td>${r.tipoSangre || '—'}</td>
    <td>
      <div class="action-group">
        <button class="btn-edit" onclick="editarRecurso('${r.id}')">Editar</button>
        <button class="btn-danger" onclick="eliminarRecurso('${r.id}')">Eliminar</button>
      </div>
    </td>
  </tr>`).join('');
}

document.getElementById('btnNuevoRecurso').addEventListener('click', () => { // Listener para el botón "Nuevo Recurso Humano"
  openModal('Nuevo Recurso Humano', formRecurso(), () => guardarRecurso(null)); // Abre el modal con el formulario vacío para crear un nuevo recurso
});

function formRecurso(r = {}) { // Función que genera el HTML del formulario de recurso humano
  const sangres = ['A+','A-','B+','B-','AB+','AB-','O+','O-']; // Arreglo con los tipos de sangre disponibles
  const roles   = ['Ingeniero','Supervisor','Arquitecto','Técnico','Obrero','Administrador','Otro']; // Arreglo con los roles disponibles
  const generos = ['Masculino','Femenino','No binario','Prefiero no decir']; // Arreglo con las opciones de género
  return `
    <div class="form-row">
      <div class="form-group"><label>Identificación *</label>
        <input id="f-id" value="${r.identificacion || ''}" placeholder="CC / NIT"/></div>
      <div class="form-group"><label>Nombre completo *</label>
        <input id="f-nombre" value="${r.nombre || ''}" placeholder="Nombre"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Fecha de Nacimiento</label>
        <input id="f-fnac" type="date" value="${r.fechaNacimiento || ''}"/></div>
      <div class="form-group"><label>Tipo de Sangre</label>
        <select id="f-sangre">
          <option value="">—</option>
          ${sangres.map(s=>`<option value="${s}" ${r.tipoSangre===s?'selected':''}>${s}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>ARL</label>
        <input id="f-arl" value="${r.arl || ''}" placeholder="Nombre ARL"/></div>
      <div class="form-group"><label>Rol *</label>
        <select id="f-rol">
          <option value="">Seleccionar...</option>
          ${roles.map(ro=>`<option value="${ro}" ${r.rol===ro?'selected':''}>${ro}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Salario (COP) *</label>
        <input id="f-salario" type="number" min="0" value="${r.salario || ''}" placeholder="1300000"/></div>
      <div class="form-group"><label>Género (opcional)</label>
        <select id="f-genero">
          <option value="">—</option>
          ${generos.map(g=>`<option value="${g}" ${r.genero===g?'selected':''}>${g}</option>`).join('')}
        </select></div>
    </div>`;
}

function guardarRecurso(id) { // Función que guarda un recurso nuevo o actualiza uno existente
  const identificacion  = document.getElementById('f-id').value.trim(); // Lee el número de identificación
  const nombre          = document.getElementById('f-nombre').value.trim(); // Lee el nombre completo
  const fechaNacimiento = document.getElementById('f-fnac').value; // Lee la fecha de nacimiento
  const tipoSangre      = document.getElementById('f-sangre').value; // Lee el tipo de sangre seleccionado
  const arl             = document.getElementById('f-arl').value.trim(); // Lee el nombre de la ARL
  const rol             = document.getElementById('f-rol').value; // Lee el rol seleccionado
  const salario         = document.getElementById('f-salario').value; // Lee el salario ingresado
  const genero          = document.getElementById('f-genero').value; // Lee el género seleccionado
  if (!identificacion || !nombre || !rol || !salario) { // Valida que los campos obligatorios no estén vacíos
    toast('Completa los campos obligatorios', 'error'); return; // Muestra error y sale si falta algún campo obligatorio
  }
  if (id) { // Si hay ID, es una edición
    const r = DB.recursos.find(x => x.id === id); // Busca el recurso existente por ID
    Object.assign(r, { identificacion, nombre, fechaNacimiento, tipoSangre, arl, rol, salario, genero }); // Actualiza todas las propiedades del recurso
    toast('Recurso actualizado'); // Muestra notificación de éxito
  } else { // Si no hay ID, es un recurso nuevo
    DB.recursos.push({ id: uid(), identificacion, nombre, fechaNacimiento, tipoSangre, arl, rol, salario, genero }); // Crea y agrega el nuevo recurso al arreglo
    toast('Recurso creado'); // Muestra notificación de éxito
  }
  persist(); // Guarda los cambios en localStorage
  closeModal(); // Cierra el modal
  renderRecursos(); // Vuelve a renderizar la tabla de recursos
  actualizarFiltros(); // Actualiza los selectores de filtro
}

function editarRecurso(id) { // Función que abre el modal de edición para un recurso existente
  const r = DB.recursos.find(x => x.id === id); // Busca el recurso por su ID
  openModal('Editar Recurso', formRecurso(r), () => guardarRecurso(id)); // Abre el modal con los datos del recurso y el ID para actualización
}

function eliminarRecurso(id) { // Función que elimina un recurso humano de la base de datos
  if (!confirm('¿Eliminar este recurso?')) return; // Pide confirmación al usuario antes de eliminar
  DB.recursos = DB.recursos.filter(x => x.id !== id); // Elimina el recurso del arreglo filtrando los que no tienen ese ID
  persist(); // Guarda los cambios en localStorage
  renderRecursos(); // Vuelve a renderizar la tabla de recursos
  toast('Recurso eliminado', 'error'); // Muestra notificación de eliminación
}
 
// ─────────────────────────────────────────────────────────────
// VISTA: CALENDARIO
// Muestra un calendario mensual con las actividades
// ─────────────────────────────────────────────────────────────

let calYear  = new Date().getFullYear(); // Inicializa el año del calendario con el año actual
let calMonth = new Date().getMonth(); // Inicializa el mes del calendario con el mes actual (0 = enero)

function renderCalendario() { // Función que renderiza el calendario mensual completo
  const filtroId = document.getElementById('filtro-proyecto-cal').value; // Lee el filtro de proyecto seleccionado para el calendario
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio', // Arreglo con los nombres de los meses en español
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('calMonthLabel').textContent = `${meses[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay(); // Obtiene el día de la semana del primer día del mes (0=Domingo)
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate(); // Calcula la cantidad total de días en el mes actual
  const today = new Date(); // Obtiene la fecha actual para marcar el día de hoy en el calendario

  let acts = DB.actividades.filter(a => a.fechaInicio); // Filtra las actividades que tienen fecha de inicio definida
  if (filtroId) acts = acts.filter(a => a.proyectoId === filtroId); // Si hay filtro de proyecto, muestra solo las actividades de ese proyecto

  let html = `<div class="cal-header">
    <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span>
    <span>Jue</span><span>Vie</span><span>Sáb</span>
  </div><div class="cal-grid">`;

  const prevDays = new Date(calYear, calMonth, 0).getDate(); // Obtiene la cantidad de días del mes anterior para rellenar el inicio de la cuadrícula
  for (let i = firstDay - 1; i >= 0; i--) { // Itera para rellenar los días del mes anterior en la cuadrícula (antes del día 1)
    html += `<div class="cal-day other-month"><div class="cal-day-num">${prevDays - i}</div></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) { // Itera sobre cada día del mes actual
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d; // Verifica si este día es el día actual
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const dayActs = acts.filter(a => { // Filtra las actividades que están activas en este día del calendario
      if (!a.fechaInicio) return false; // Si la actividad no tiene fecha de inicio, la omite
      const start = new Date(a.fechaInicio); // Convierte la fecha de inicio de la actividad a objeto Date
      const end   = a.duracion ? new Date(start.getTime() + a.duracion * 86400000) : start; // Calcula la fecha de fin sumando la duración en milisegundos; si no hay duración, fin = inicio
      const cur   = new Date(dateStr); // Convierte la fecha del día actual a objeto Date
      return cur >= start && cur <= end; // Retorna true si el día actual está dentro del rango de la actividad
    });

    const eventsHtml = dayActs.slice(0, 3).map(a => { // Toma máximo 3 actividades por día para mostrar en la celda
      const cls = a.estado === 'Terminada' ? 'terminada' : a.estado === 'En Proceso' ? 'en-proceso' : 'pendiente'; // Asigna clase CSS según el estado de la actividad
      return `<div class="cal-event ${cls}" title="${a.nombre}">${a.nombre}</div>`;
    }).join(''); // Une todos los eventos en una cadena HTML

    const more = dayActs.length > 3 ? `<div style="font-size:.68rem;color:var(--text2)">+${dayActs.length-3} más</div>` : '';

    html += `<div class="cal-day${isToday?' today':''}">
      <div class="cal-day-num">${d}</div>
      ${eventsHtml}${more}
    </div>`;
  }

  const total = firstDay + daysInMonth; // Calcula el total de celdas usadas (días previos + días del mes)
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7); // Calcula cuántas celdas de relleno se necesitan al final para completar la última fila
  for (let i = 1; i <= rem; i++) { // Itera para agregar los días del mes siguiente que completan la cuadrícula
    html += `<div class="cal-day other-month"><div class="cal-day-num">${i}</div></div>`;
  }
  html += '</div>'; // Cierra el div de la cuadrícula del calendario
  document.getElementById('calendario-grid').innerHTML = html; // Inserta todo el HTML generado en el contenedor del calendario
}

document.getElementById('calPrev').addEventListener('click', () => { // Listener para el botón de mes anterior en el calendario
  calMonth--; // Decrementa el mes en 1
  if (calMonth < 0) { calMonth = 11; calYear--; } // Si el mes cae por debajo de 0 (enero), retrocede al mes 11 (diciembre) del año anterior
  renderCalendario(); // Vuelve a renderizar el calendario con el mes actualizado
});

document.getElementById('calNext').addEventListener('click', () => { // Listener para el botón de mes siguiente en el calendario
  calMonth++; // Incrementa el mes en 1
  if (calMonth > 11) { calMonth = 0; calYear++; } // Si el mes supera el 11 (diciembre), avanza al mes 0 (enero) del año siguiente
  renderCalendario(); // Vuelve a renderizar el calendario con el mes actualizado
});

document.getElementById('filtro-proyecto-cal').addEventListener('change', renderCalendario); // Al cambiar el filtro de proyecto del calendario, lo vuelve a renderizar


// ─────────────────────────────────────────────────────────────
// ACTUALIZACIÓN DE SELECTORES DE FILTRO
// ─────────────────────────────────────────────────────────────

function actualizarFiltros() { // Función que actualiza las opciones de los selectores de filtro de proyectos
  ['filtro-proyecto-act', 'filtro-proyecto-cal'].forEach(id => { // Itera sobre los IDs de los dos selectores de filtro
    const sel = document.getElementById(id); // Obtiene el elemento select por su ID
    const cur = sel.value; // Guarda el valor actualmente seleccionado para restaurarlo después de actualizar
    sel.innerHTML = `<option value="">Todos los proyectos</option>` +
      DB.proyectos.map(p => `<option value="${p.id}" ${p.id===cur?'selected':''}>${p.nombre}</option>`).join('');
  });
}

  
  /* ─── EXPOSE GLOBALS FOR INLINE HANDLERS ─────────────────── */
  window.editarProyecto   = editarProyecto;
  window.eliminarProyecto = eliminarProyecto;
  window.editarActividad  = editarActividad;
  window.eliminarActividad= eliminarActividad;
  window.editarHito       = editarHito;
  window.editarRecurso    = editarRecurso;
  window.eliminarRecurso  = eliminarRecurso;
  
  /* ─── INIT ────────────────────────────────────────────────── */
  actualizarFiltros();
  actualizarHitosEstado();
  renderDashboard();
  