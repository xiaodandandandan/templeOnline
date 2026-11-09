import { OUTDOOR } from '../config/halls.js';

const W = 170;
const H = 300;
const PAD = 6;
const X0 = OUTDOOR.bounds.minX - 1;
const X1 = OUTDOOR.bounds.maxX + 1;
const Z0 = OUTDOOR.bounds.minZ - 1;
const Z1 = OUTDOOR.bounds.maxZ + 3;

const SHORT = {
  tianwang: '山门',
  shijia: '释迦',
  chaoyin: '潮音',
  guanyin: '观音',
  lingxiao: '凌霄',
  yaoshi: '药师',
  longwang: '龙王',
  caishen: '财神',
  zutang: '祖堂',
  wuguan: '五观',
  lutan: '莲池',
};

/** 左上角缩略导览图：北向上，标出殿宇与当前位置朝向 */
export class Minimap {
  constructor() {
    this.toggle = document.getElementById('mapToggle');
    this.panel = document.getElementById('mapPanel');
    this.toggle?.addEventListener('click', () => {
      const expanded = this.toggle.getAttribute('aria-expanded') !== 'true';
      this.toggle.setAttribute('aria-expanded', String(expanded));
      this.toggle.setAttribute('aria-label', expanded ? '收起地图' : '展开地图');
      this.toggle.title = expanded ? '收起地图' : '展开地图';
      this.toggle.textContent = expanded ? '×' : '图';
      this.panel.hidden = !expanded;
      this._last = -1;
    });
    this.canvas = document.getElementById('minimapCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    if (this.ctx) this.ctx.setTransform(2, 0, 0, 2, 0, 0);

    this.halls = [
      ...OUTDOOR.entrances.map((e) => ({ id: e.id, name: e.name, x: e.x, z: e.z, w: e.w, d: e.d, pond: false })),
      ...(OUTDOOR.scenery || []).map((e) => ({ id: e.id, name: e.name, x: e.x, z: e.z, w: e.w, d: e.d, pond: false })),
      { id: OUTDOOR.garden.id, name: '莲池', ...OUTDOOR.garden, w: 5, d: 5, pond: true },
    ];

    this.s = Math.min((W - PAD * 2) / (X1 - X0), (H - PAD * 2) / (Z1 - Z0));
    this.ox = (W - (X1 - X0) * this.s) / 2;
    this.oy = (H - (Z1 - Z0) * this.s) / 2;

    this._last = -1;
    this._mapId = '';
  }

  x(v) { return this.ox + (v - X0) * this.s; }
  y(v) { return this.oy + (v - Z0) * this.s; }

  update(map, player, t) {
    if (!this.ctx || this.panel?.hidden) return;
    if (map.id === this._mapId && t - this._last < 0.1) return;
    this._last = t;
    this._mapId = map.id;
    this.draw(map, player);
  }

  draw(map, player) {
    const ctx = this.ctx;
    const s = this.s;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#f2ead9');
    bg.addColorStop(1, '#e4d8c1');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 寺院范围（草地底色）
    ctx.fillStyle = 'rgba(147,166,129,0.16)';
    ctx.fillRect(this.x(X0), this.y(Z0), (X1 - X0) * s, (Z1 - Z0) * s);

    // 台地阴影与中轴台阶
    for (const b of OUTDOOR.bands) {
      const z0 = Math.min(b.z0, b.z1);
      const z1 = Math.max(b.z0, b.z1);
      const low = Math.min(b.y0, b.y1);
      if (Math.abs(b.y0 - b.y1) > 0.01) {
        ctx.strokeStyle = 'rgba(120,108,86,0.26)';
        ctx.lineWidth = 0.6;
        for (let i = 0; i < 4; i++) {
          const zz = z0 + ((z1 - z0) * (i + 0.5)) / 4;
          ctx.beginPath();
          ctx.moveTo(this.x(-4.5), this.y(zz));
          ctx.lineTo(this.x(4.5), this.y(zz));
          ctx.stroke();
        }
      } else if (low > 0.01) {
        ctx.fillStyle = 'rgba(120,108,86,0.06)';
        ctx.fillRect(this.x(-23), this.y(z0), 46 * s, (z1 - z0) * s);
      }
    }

    ctx.fillStyle = 'rgba(203,190,164,0.7)';
    ctx.fillRect(this.x(-4.5), this.y(-53.5), 9 * s, (60 + 53.5) * s);

    // 山门围墙
    ctx.strokeStyle = 'rgba(78,68,55,0.6)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(this.x(-24), this.y(60));
    ctx.lineTo(this.x(-3), this.y(60));
    ctx.moveTo(this.x(3), this.y(60));
    ctx.lineTo(this.x(24), this.y(60));
    ctx.stroke();

    // 殿宇
    for (const h of this.halls) {
      const cur = map.id === h.id;
      const x = this.x(h.x - h.w / 2);
      const y = this.y(h.z - h.d / 2);
      const w = h.w * s;
      const d = h.d * s;
      ctx.fillStyle = h.pond
        ? 'rgba(96,124,118,0.9)'
        : cur
          ? 'rgba(158,51,38,0.94)'
          : 'rgba(62,55,47,0.86)';
      ctx.fillRect(x, y, w, d);
      ctx.strokeStyle = 'rgba(244,235,218,0.48)';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(x + 0.4, y + 0.4, w - 0.8, d - 0.8);

      ctx.fillStyle = 'rgba(247,240,226,0.96)';
      ctx.font = `${h.w >= 12 ? 8 : h.w >= 6 ? 7 : 6}px "Songti SC","Noto Serif SC",serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(SHORT[h.id] || h.name, x + w / 2, y + d / 2 + 0.4);
    }

    // 当前位置与朝向
    if (map.id === 'outdoor') {
      const px = this.x(player.position.x);
      const py = this.y(player.position.z);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.PI - player.facing);
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4.2, 4.8);
      ctx.lineTo(0, 2.8);
      ctx.lineTo(-4.2, 4.8);
      ctx.closePath();
      ctx.fillStyle = '#9e3326';
      ctx.fill();
      ctx.strokeStyle = 'rgba(247,240,226,0.95)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // 指北
    ctx.strokeStyle = 'rgba(23,19,16,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W - 21, 10);
    ctx.lineTo(W - 18, 6.5);
    ctx.lineTo(W - 15, 10);
    ctx.stroke();
    ctx.fillStyle = 'rgba(23,19,16,0.5)';
    ctx.font = '500 7px "Songti SC","Noto Serif SC",serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('北', W - 8, 5);
  }
}
