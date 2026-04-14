class CbBadge extends HTMLElement {
    static get observedAttributes() { return ['estado']; }
    connectedCallback() { this._render(); }
    attributeChangedCallback() { this._render(); }
    _render() {
      const e = this.getAttribute('estado') || '';
      const map = {
        'Pendiente':  { cls: 'badge-pendiente', lbl: 'Pendiente' },
        'En Proceso': { cls: 'badge-proceso',   lbl: 'En Proceso' },
        'Terminada':  { cls: 'badge-terminada', lbl: 'Terminada' },
        'Cumplido':   { cls: 'badge-cumplido',  lbl: 'Cumplido' },
        'Pendiente-h':{ cls: 'badge-pendiente-h',lbl: 'Pendiente' },
      };
      const d = map[e] || { cls: '', lbl: e };
      this.innerHTML = `<span class="badge ${d.cls}">${d.lbl}</span>`;
    }
  }
  customElements.define('cb-badge', CbBadge);
  
  class CbProgress extends HTMLElement {
    static get observedAttributes() { return ['value']; }
    connectedCallback() { this._render(); }
    attributeChangedCallback() { this._render(); }
    _render() {
      const v = Math.min(100, Math.max(0, parseInt(this.getAttribute('value')) || 0));
      this.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px">
          <div class="progress-bar" style="flex:1">
            <div class="progress-fill" style="width:${v}%"></div>
          </div>
          <span style="font-size:.78rem;color:var(--text2);width:32px;text-align:right">${v}%</span>
        </div>`;
    }
  }
  customElements.define('cb-progress', CbProgress);
  
  const KEY = 'campusbuild_data';

function loadData() {
  try { return JSON.parse(localStorage.getItem(KEY)) || defaultData(); }
  catch { return defaultData(); }
}
function saveData(d) {
  localStorage.setItem(KEY, JSON.stringify(d));
}
function defaultData() {
  return { proyectos: [], actividades: [], hitos: [], recursos: [] };
}

let DB = loadData();

function persist() { saveData(DB); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function toast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast show ${type}`;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.className = 'toast', 2800);
  }
  
  const titles = {
    dashboard: 'Dashboard', proyectos: 'Proyectos',
    actividades: 'Actividades', hitos: 'Hitos',
    recursos: 'Recursos Humanos', calendario: 'Calendario'
  };
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
      document.getElementById('view-' + v).classList.add('active');
      document.getElementById('pageTitle').textContent = titles[v];
      if (v === 'dashboard') renderDashboard();
      if (v === 'proyectos') renderProyectos();
      if (v === 'actividades') renderActividades();
      if (v === 'hitos') renderHitos();
      if (v === 'recursos') renderRecursos();
      if (v === 'calendario') renderCalendario();
      // close sidebar on mobile
      if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    });
  });
  
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  
  // Date badge
  document.getElementById('dateBadge').textContent =
    new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    let modalSaveCallback = null;

function openModal(title, bodyHTML, onSave) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  modalSaveCallback = onSave;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  modalSaveCallback = null;
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
document.getElementById('modalSave').addEventListener('click', () => {
  if (modalSaveCallback) modalSaveCallback();
});

function getProyectoNombre(id) {
    const p = DB.proyectos.find(x => x.id === id);
    return p ? p.nombre : '—';
  }
  function getActividadNombre(id) {
    const a = DB.actividades.find(x => x.id === id);
    return a ? a.nombre : '—';
  }
  function getRecursoNombre(id) {
    const r = DB.recursos.find(x => x.id === id);
    return r ? r.nombre : '—';
  }
  
  function proyectosOptions(selected = '') {
    return DB.proyectos.map(p =>
      `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${p.nombre}</option>`
    ).join('');
  }
  function recursosOptions(selected = '') {
    return [{ id: '', nombre: '— Sin asignar —' }, ...DB.recursos].map(r =>
      `<option value="${r.id}" ${r.id === selected ? 'selected' : ''}>${r.nombre}</option>`
    ).join('');
  }
  
  function proyectoProgress(pId) {
    const acts = DB.actividades.filter(a => a.proyectoId === pId);
    if (!acts.length) return 0;
    const done = acts.filter(a => a.estado === 'Terminada').length;
    return Math.round((done / acts.length) * 100);
  }
  
  function actualizarHitosEstado() {
    DB.hitos.forEach(h => {
      if (!h.actividadesIds || !h.actividadesIds.length) return;
      const todas = h.actividadesIds.every(aId => {
        const a = DB.actividades.find(x => x.id === aId);
        return a && a.estado === 'Terminada';
      });
      h.estado = todas ? 'Cumplido' : 'Pendiente-h';
    });
    persist();
  }
  
  function renderDashboard() {
    document.getElementById('cnt-proyectos').textContent = DB.proyectos.length;
    document.getElementById('cnt-actividades').textContent = DB.actividades.length;
    document.getElementById('cnt-hitos').textContent = DB.hitos.length;
    document.getElementById('cnt-recursos').textContent = DB.recursos.length;
  
    const raEl = document.getElementById('recent-actividades');
    const recent = [...DB.actividades].slice(-5).reverse();
    if (recent.length) {
      raEl.innerHTML = recent.map(a => `
        <div class="recent-item">
          <span>${a.nombre}</span>
          <cb-badge estado="${a.estado}"></cb-badge>
        </div>`).join('');
    } else {
      raEl.innerHTML = `<p style="color:var(--text2);font-size:.85rem">Sin actividades registradas.</p>`;
    }
  
    const rhEl = document.getElementById('recent-hitos');
    const hpend = DB.hitos.filter(h => h.estado !== 'Cumplido').slice(0, 5);
    if (hpend.length) {
      rhEl.innerHTML = hpend.map(h => `
        <div class="recent-item">
          <span>${h.nombre}</span>
          <cb-badge estado="${h.estado}"></cb-badge>
        </div>`).join('');
    } else {
      rhEl.innerHTML = `<p style="color:var(--text2);font-size:.85rem">No hay hitos pendientes.</p>`;
    }
  }

  function renderProyectos() {
    const tbody = document.getElementById('tbody-proyectos');
    if (!DB.proyectos.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No hay proyectos. ¡Crea el primero!</td></tr>`;
      return;
    }
    tbody.innerHTML = DB.proyectos.map(p => {
      const prog = proyectoProgress(p.id);
      return `<tr>
        <td><strong>${p.nombre}</strong></td>
        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.descripcion || '—'}</td>
        <td>${p.fechaInicio || '—'}</td>
        <td>${p.fechaFin || '—'}</td>
        <td style="min-width:130px"><cb-progress value="${prog}"></cb-progress></td>
        <td>
          <div class="action-group">
            <button class="btn-edit" onclick="editarProyecto('${p.id}')">Editar</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }
  
  document.getElementById('btnNuevoProyecto').addEventListener('click', () => {
    openModal('Nuevo Proyecto', formProyecto(), () => guardarProyecto(null));
  });
  
  function formProyecto(p = {}) {
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
  
  function guardarProyecto(id) {
    const nombre = document.getElementById('f-nombre').value.trim();
    const desc   = document.getElementById('f-desc').value.trim();
    const inicio = document.getElementById('f-inicio').value;
    const fin    = document.getElementById('f-fin').value;
    if (!nombre || !inicio || !fin) { toast('Completa los campos obligatorios', 'error'); return; }
    if (id) {
      const p = DB.proyectos.find(x => x.id === id);
      Object.assign(p, { nombre, descripcion: desc, fechaInicio: inicio, fechaFin: fin });
      toast('Proyecto actualizado');
    } else {
      DB.proyectos.push({ id: uid(), nombre, descripcion: desc, fechaInicio: inicio, fechaFin: fin });
      toast('Proyecto creado');
    }
    persist();
    closeModal();
    renderProyectos();
    actualizarFiltros();
  }
  
  function editarProyecto(id) {
    const p = DB.proyectos.find(x => x.id === id);
    openModal('Editar Proyecto', formProyecto(p), () => guardarProyecto(id));
  }
  
  function renderActividades(filtroId = document.getElementById('filtro-proyecto-act').value) {
    const tbody = document.getElementById('tbody-actividades');
    let acts = DB.actividades;
    if (filtroId) acts = acts.filter(a => a.proyectoId === filtroId);
    if (!acts.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No hay actividades registradas.</td></tr>`;
      return;
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
  
  document.getElementById('filtro-proyecto-act').addEventListener('change', function() {
    renderActividades(this.value);
  });
  
  document.getElementById('btnNuevaActividad').addEventListener('click', () => {
    openModal('Nueva Actividad', formActividad(), () => guardarActividad(null));
  });
  
  function formActividad(a = {}) {
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
      <div class="form-group"><label>Responsable</label>
        <select id="f-responsable">${recursosOptions(a.responsableId)}</select></div>
      <div class="form-group"><label>Estado</label>
        <select id="f-estado">
          <option value="Pendiente" ${a.estado==='Pendiente'?'selected':''}>Pendiente</option>
          <option value="En Proceso" ${a.estado==='En Proceso'?'selected':''}>En Proceso</option>
          <option value="Terminada" ${a.estado==='Terminada'?'selected':''}>Terminada</option>
        </select></div>`;
  }
  
  function guardarActividad(id) {
    const nombre     = document.getElementById('f-nombre').value.trim();
    const proyectoId = document.getElementById('f-proyecto').value;
    const fechaInicio= document.getElementById('f-inicio').value;
    const duracion   = document.getElementById('f-duracion').value;
    const responsableId = document.getElementById('f-responsable').value;
    const estado     = document.getElementById('f-estado').value;
    if (!nombre || !proyectoId) { toast('Nombre y proyecto son obligatorios', 'error'); return; }
    if (id) {
      const a = DB.actividades.find(x => x.id === id);
      Object.assign(a, { nombre, proyectoId, fechaInicio, duracion: parseInt(duracion)||null, responsableId, estado });
      toast('Actividad actualizada');
    } else {
      DB.actividades.push({ id: uid(), nombre, proyectoId, fechaInicio, duracion: parseInt(duracion)||null, responsableId, estado });
      toast('Actividad creada');
    }
    actualizarHitosEstado();
    persist();
    closeModal();
    renderActividades();
  }
  
  function editarActividad(id) {
    const a = DB.actividades.find(x => x.id === id);
    openModal('Editar Actividad', formActividad(a), () => guardarActividad(id));
  }
  
  function eliminarActividad(id) {
    if (!confirm('¿Eliminar esta actividad?')) return;
    DB.actividades = DB.actividades.filter(x => x.id !== id);
    // limpiar de hitos
    DB.hitos.forEach(h => {
      h.actividadesIds = (h.actividadesIds || []).filter(aId => aId !== id);
    });
    actualizarHitosEstado();
    persist();
    renderActividades();
    toast('Actividad eliminada', 'error');
  }
  
  function renderHitos() {
    const tbody = document.getElementById('tbody-hitos');
    if (!DB.hitos.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No hay hitos registrados.</td></tr>`;
      return;
    }
    tbody.innerHTML = DB.hitos.map(h => {
      const acts = (h.actividadesIds || []).map(aId => getActividadNombre(aId)).join(', ') || '—';
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
    }).join('');
  }
  
  document.getElementById('btnNuevoHito').addEventListener('click', () => {
    openModal('Nuevo Hito', formHito(), () => guardarHito(null));
  });
  
  function formHito(h = {}) {
    const actsDelProyecto = h.proyectoId
      ? DB.actividades.filter(a => a.proyectoId === h.proyectoId)
      : [];
    const actsChecks = actsDelProyecto.map(a =>
      `<label><input type="checkbox" value="${a.id}" ${(h.actividadesIds||[]).includes(a.id)?'checked':''}> ${a.nombre}</label>`
    ).join('');
  
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
  
  window.actualizarActsHito = function(proyId, selIds = []) {
    const acts = DB.actividades.filter(a => a.proyectoId === proyId);
    const el = document.getElementById('checklist-acts');
    if (!el) return;
    if (!acts.length) {
      el.innerHTML = '<span style="color:var(--text2);font-size:.82rem">No hay actividades en este proyecto</span>';
      return;
    }
    el.innerHTML = acts.map(a =>
      `<label><input type="checkbox" value="${a.id}" ${selIds.includes(a.id)?'checked':''}> ${a.nombre}</label>`
    ).join('');
  };
  
  function guardarHito(id) {
    const nombre     = document.getElementById('f-nombre').value.trim();
    const proyectoId = document.getElementById('f-proyecto').value;
    if (!nombre || !proyectoId) { toast('Nombre y proyecto son obligatorios', 'error'); return; }
    const checks = document.querySelectorAll('#checklist-acts input[type="checkbox"]:checked');
    const actividadesIds = Array.from(checks).map(c => c.value);
  
    if (id) {
      const h = DB.hitos.find(x => x.id === id);
      Object.assign(h, { nombre, proyectoId, actividadesIds });
      toast('Hito actualizado');
    } else {
      DB.hitos.push({ id: uid(), nombre, proyectoId, actividadesIds, estado: 'Pendiente-h' });
      toast('Hito creado');
    }
    actualizarHitosEstado();
    persist();
    closeModal();
    renderHitos();
  }
  
  function editarHito(id) {
    const h = DB.hitos.find(x => x.id === id);
    openModal('Editar Hito', formHito(h), () => guardarHito(id));
  }
 
  function renderRecursos() {
    const tbody = document.getElementById('tbody-recursos');
    if (!DB.recursos.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No hay recursos registrados.</td></tr>`;
      return;
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
  
  document.getElementById('btnNuevoRecurso').addEventListener('click', () => {
    openModal('Nuevo Recurso Humano', formRecurso(), () => guardarRecurso(null));
  });
  
  function formRecurso(r = {}) {
    const sangres = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
    const roles   = ['Ingeniero','Supervisor','Arquitecto','Técnico','Obrero','Administrador','Otro'];
    const generos = ['Masculino','Femenino','No binario','Prefiero no decir'];
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
  
  function guardarRecurso(id) {
    const identificacion  = document.getElementById('f-id').value.trim();
    const nombre          = document.getElementById('f-nombre').value.trim();
    const fechaNacimiento = document.getElementById('f-fnac').value;
    const tipoSangre      = document.getElementById('f-sangre').value;
    const arl             = document.getElementById('f-arl').value.trim();
    const rol             = document.getElementById('f-rol').value;
    const salario         = document.getElementById('f-salario').value;
    const genero          = document.getElementById('f-genero').value;
    if (!identificacion || !nombre || !rol || !salario) {
      toast('Completa los campos obligatorios', 'error'); return;
    }
    if (id) {
      const r = DB.recursos.find(x => x.id === id);
      Object.assign(r, { identificacion, nombre, fechaNacimiento, tipoSangre, arl, rol, salario, genero });
      toast('Recurso actualizado');
    } else {
      DB.recursos.push({ id: uid(), identificacion, nombre, fechaNacimiento, tipoSangre, arl, rol, salario, genero });
      toast('Recurso creado');
    }
    persist();
    closeModal();
    renderRecursos();
    actualizarFiltros();
  }
  
  function editarRecurso(id) {
    const r = DB.recursos.find(x => x.id === id);
    openModal('Editar Recurso', formRecurso(r), () => guardarRecurso(id));
  }
  
  function eliminarRecurso(id) {
    if (!confirm('¿Eliminar este recurso?')) return;
    DB.recursos = DB.recursos.filter(x => x.id !== id);
    persist();
    renderRecursos();
    toast('Recurso eliminado', 'error');
  }
 
  let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();

function renderCalendario() {
  const filtroId = document.getElementById('filtro-proyecto-cal').value;
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('calMonthLabel').textContent = `${meses[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  let acts = DB.actividades.filter(a => a.fechaInicio);
  if (filtroId) acts = acts.filter(a => a.proyectoId === filtroId);

  // Build calendar grid
  let html = `<div class="cal-header">
    <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span>
    <span>Jue</span><span>Vie</span><span>Sáb</span>
  </div><div class="cal-grid">`;

  // Prev month days
  const prevDays = new Date(calYear, calMonth, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="cal-day other-month"><div class="cal-day-num">${prevDays - i}</div></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const dayActs = acts.filter(a => {
      if (!a.fechaInicio) return false;
      const start = new Date(a.fechaInicio);
      const end   = a.duracion ? new Date(start.getTime() + a.duracion * 86400000) : start;
      const cur   = new Date(dateStr);
      return cur >= start && cur <= end;
    });

    const eventsHtml = dayActs.slice(0, 3).map(a => {
      const cls = a.estado === 'Terminada' ? 'terminada' : a.estado === 'En Proceso' ? 'en-proceso' : 'pendiente';
      return `<div class="cal-event ${cls}" title="${a.nombre}">${a.nombre}</div>`;
    }).join('');
    const more = dayActs.length > 3 ? `<div style="font-size:.68rem;color:var(--text2)">+${dayActs.length-3} más</div>` : '';

    html += `<div class="cal-day${isToday?' today':''}">
      <div class="cal-day-num">${d}</div>
      ${eventsHtml}${more}
    </div>`;
  }

  // Fill remaining
  const total = firstDay + daysInMonth;
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= rem; i++) {
    html += `<div class="cal-day other-month"><div class="cal-day-num">${i}</div></div>`;
  }
  html += '</div>';
  document.getElementById('calendario-grid').innerHTML = html;
}

document.getElementById('calPrev').addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendario();
});
document.getElementById('calNext').addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendario();
});
document.getElementById('filtro-proyecto-cal').addEventListener('change', renderCalendario);

function actualizarFiltros() {
    ['filtro-proyecto-act', 'filtro-proyecto-cal'].forEach(id => {
      const sel = document.getElementById(id);
      const cur = sel.value;
      sel.innerHTML = `<option value="">Todos los proyectos</option>` +
        DB.proyectos.map(p => `<option value="${p.id}" ${p.id===cur?'selected':''}>${p.nombre}</option>`).join('');
    });
  }
  
  /* ─── EXPOSE GLOBALS FOR INLINE HANDLERS ─────────────────── */
  window.editarProyecto   = editarProyecto;
  window.editarActividad  = editarActividad;
  window.eliminarActividad= eliminarActividad;
  window.editarHito       = editarHito;
  window.editarRecurso    = editarRecurso;
  window.eliminarRecurso  = eliminarRecurso;
  
  /* ─── INIT ────────────────────────────────────────────────── */
  actualizarFiltros();
  actualizarHitosEstado();
  renderDashboard();
  