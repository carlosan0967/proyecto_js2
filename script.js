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
  