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
  