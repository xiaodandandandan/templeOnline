const MOVE_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space',
]);

export class Input {
  constructor({ onInteract, onPray } = {}) {
    this.onInteract = onInteract || (() => {});
    this.onPray = onPray || (() => {});
    this.keys = new Set();
    this.lookX = 0;
    this.lookY = 0;
    this.touchMove = { x: 0, y: 0 };
    this.locked = false;
    this.started = false;
    this.canvas = null;
    this.lookPointer = null;
    this._stick = null;
    this._knob = null;
    this._bind();
  }

  attach(canvas) {
    this.canvas = canvas;
    canvas.addEventListener('dblclick', () => { if(this.started) this.requestLock(); });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('pointerdown', (e) => {
      if (!this.started) return;
      if (!this.locked) {
        this.lookPointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
        canvas.setPointerCapture?.(e.pointerId);
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (this.locked) return;
      if (!this.lookPointer || e.pointerId !== this.lookPointer.id) return;
      this.lookX -= (e.clientX - this.lookPointer.x) * 0.0042;
      this.lookY -= (e.clientY - this.lookPointer.y) * 0.0038;
      this.lookPointer.x = e.clientX;
      this.lookPointer.y = e.clientY;
    });
    const end = (e) => {
      if (this.lookPointer && e.pointerId === this.lookPointer.id) this.lookPointer = null;
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);
  }

  requestLock() {
    if (!this.canvas || !this.canvas.requestPointerLock) return;
    try {
      const p = this.canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch {
      /* pointer lock unavailable */
    }
  }

  takeLook() {
    const out = { x: this.lookX, y: this.lookY };
    this.lookX = 0;
    this.lookY = 0;
    return out;
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    x += this.touchMove.x;
    y += this.touchMove.y;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  isRunning() {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  _bind() {
    window.addEventListener('keydown', (e) => {
      if (MOVE_KEYS.has(e.code)) e.preventDefault();
      this.keys.add(e.code);
      if (e.code === 'KeyE' && !e.repeat) this.onInteract();
      if (e.code === 'Space' && !e.repeat) this.onPray();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    window.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.lookX -= e.movementX * 0.0022;
      this.lookY -= e.movementY * 0.0020;
    });

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.canvas;
    });

    // mobile joystick
    this._stick = document.getElementById('stick');
    this._knob = document.getElementById('knob');
    if (this._stick && this._knob) {
      const R = 46;
      let active = null;
      const reset = () => {
        active = null;
        this.touchMove.x = 0;
        this.touchMove.y = 0;
        this._knob.style.transform = 'translate(0,0)';
      };
      this._stick.addEventListener('pointerdown', (e) => {
        active = e.pointerId;
        this._stick.setPointerCapture(e.pointerId);
      });
      this._stick.addEventListener('pointermove', (e) => {
        if (e.pointerId !== active) return;
        const rect = this._stick.getBoundingClientRect();
        let dx = e.clientX - (rect.left + rect.width / 2);
        let dy = e.clientY - (rect.top + rect.height / 2);
        const len = Math.hypot(dx, dy);
        if (len > R) {
          dx = dx / len * R;
          dy = dy / len * R;
        }
        this.touchMove.x = dx / R;
        this.touchMove.y = -dy / R;
        this._knob.style.transform = `translate(${dx}px,${dy}px)`;
      });
      this._stick.addEventListener('pointerup', reset);
      this._stick.addEventListener('pointercancel', reset);
    }

    const act = document.getElementById('actBtn');
    if (act) act.addEventListener('click', () => this.onInteract());
    const bow = document.getElementById('bowBtn');
    if (bow) bow.addEventListener('click', () => this.onPray());
  }
}
