export class HUD {
  constructor() {
    const $ = (id) => document.getElementById(id);
    this.el = {
      zone: $('zone'),
      zoneSub: $('zoneSub'),
      prompt: $('prompt'),
      toast: $('toast'),
      fade: $('fade'),
      start: $('start'),
      nogl: $('nogl'),
    };
    this._prompt = '';
    this._zoneTimer = 0;
    this._toastTimer = 0;
  }

  setZone(name, sub) {
    this.el.zone.innerHTML = `<strong>${name}</strong><small>${sub || ''}</small>`;
    this.el.zoneSub.textContent = sub || '';
    this.el.zone.classList.add('show');
    clearTimeout(this._zoneTimer);
    this._zoneTimer = setTimeout(() => this.el.zone.classList.remove('show'), 2400);
  }

  prompt(label, altLabel) {
    if (!label) {
      if (this._prompt !== '') {
        this._prompt = '';
        this.el.prompt.classList.remove('show');
      }
      return;
    }
    const key = `${label}|${altLabel || ''}`;
    if (key === this._prompt) return;
    this._prompt = key;
    this.el.prompt.innerHTML = altLabel
      ? `<em>E</em><span>${label}</span><em>空格</em><span>${altLabel}</span>`
      : `<em>E</em><span>${label}</span>`;
    this.el.prompt.classList.add('show');
  }

  toast(text, small = '') {
    this.el.toast.innerHTML = `${text}${small ? `<small>${small}</small>` : ''}`;
    this.el.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.el.toast.classList.remove('show'), 1750);
  }

  fadeOut() {
    this.el.fade.classList.add('show');
    return new Promise((r) => setTimeout(r, 460));
  }

  fadeIn() {
    this.el.fade.classList.remove('show');
    return new Promise((r) => setTimeout(r, 140));
  }

  hideStart() {
    this.el.start.classList.add('hidden');
  }

  showStart() {
    this.el.start.classList.remove('hidden');
  }

  showNoGL() {
    this.el.start.classList.add('hidden');
    this.el.nogl.classList.remove('hidden');
  }
}
