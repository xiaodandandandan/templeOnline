import * as THREE from 'three';

const cache = new Map();

function tex(key, w, h, draw, { repeat = [1, 1], srgb = true } = {}) {
  const id = `${key}|${repeat[0]}x${repeat[1]}|${srgb ? 's' : 'l'}`;
  if (cache.has(id)) return cache.get(id);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  cache.set(id, t);
  return t;
}

const rng = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

function grain(ctx, w, h, amount, seed, alpha = 0.08) {
  const r = rng(seed);
  const n = Math.floor(w * h * amount);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const v = Math.floor(r() * 255);
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(r() * w, r() * h, 1.6, 1.6);
  }
  ctx.restore();
}

function streaks(ctx, w, h, color, count, seed) {
  const r = rng(seed);
  ctx.strokeStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.lineWidth = 0.6 + r() * 1.8;
    ctx.globalAlpha = 0.08 + r() * 0.2;
    ctx.beginPath();
    let x = r() * w;
    let y = r() * h;
    ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (r() - 0.5) * 34;
      y += h / 5;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ------------------------------- wood ------------------------------- */
function wood(ctx, w, h, base, dark, seed) {
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, base);
  grad.addColorStop(0.5, dark);
  grad.addColorStop(1, base);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 130; i++) {
    const y = r() * h;
    ctx.strokeStyle = `rgba(35,18,10,${0.05 + r() * 0.18})`;
    ctx.lineWidth = 0.5 + r() * 2.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 32) {
      ctx.lineTo(x, y + Math.sin((x / w) * Math.PI * 3 + i) * (2 + r() * 3));
    }
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const x = r() * w;
    const y = r() * h;
    ctx.strokeStyle = 'rgba(28,14,8,0.25)';
    for (let k = 1; k < 4; k++) {
      ctx.beginPath();
      ctx.ellipse(x, y, k * 5, k * 2.6, 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  grain(ctx, w, h, 0.35, seed + 7, 0.05);
}

/* ------------------------------ stone ------------------------------- */
function stoneTile(ctx, w, h, seed) {
  ctx.fillStyle = '#b3ada0';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  const cols = 4;
  const rows = 6;
  const cw = w / cols;
  const ch = h / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = 168 + Math.floor(r() * 26);
      ctx.fillStyle = `rgb(${v},${v - 6},${v - 18})`;
      ctx.fillRect(x * cw + 2, y * ch + 2, cw - 4, ch - 4);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeRect(x * cw + 3, y * ch + 3, cw - 6, ch - 6);
    }
  }
  ctx.strokeStyle = 'rgba(54,48,40,0.55)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cw, 0);
    ctx.lineTo(x * cw, h);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * ch);
    ctx.lineTo(w, y * ch);
    ctx.stroke();
  }
  grain(ctx, w, h, 0.4, seed + 3, 0.06);
  streaks(ctx, w, h, 'rgba(90,86,76,0.6)', 20, seed + 5);
}

function stoneBlock(ctx, w, h, seed) {
  ctx.fillStyle = '#a49d90';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  const rows = 8;
  const ch = h / rows;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 ? w / 6 : 0;
    for (let x = -1; x < 4; x++) {
      const bw = w / 3;
      const v = 150 + Math.floor(r() * 26);
      ctx.fillStyle = `rgb(${v},${v - 6},${v - 16})`;
      ctx.fillRect(offset + x * bw + 2, row * ch + 2, bw - 4, ch - 4);
    }
  }
  ctx.strokeStyle = 'rgba(58,52,44,0.5)';
  ctx.lineWidth = 2;
  for (let row = 0; row <= rows; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * ch);
    ctx.lineTo(w, row * ch);
    ctx.stroke();
  }
  grain(ctx, w, h, 0.35, seed + 11, 0.06);
}

function plaster(ctx, w, h, seed) {
  ctx.fillStyle = '#e8e0cf';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 40; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 20 + r() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(168,154,128,${0.03 + r() * 0.05})`);
    g.addColorStop(1, 'rgba(168,154,128,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  grain(ctx, w, h, 0.5, seed + 2, 0.05);
  streaks(ctx, w, h, 'rgba(120,110,90,0.5)', 12, seed + 4);
}

/* ------------------------------- roof ------------------------------- */
function roofTile(ctx, w, h, seed) {
  ctx.fillStyle = '#4b5054';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  const cols = 9;
  const rows = 10;
  const cw = w / cols;
  const ch = h / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const off = y % 2 ? cw / 2 : 0;
      const g = ctx.createLinearGradient(x * cw + off, 0, x * cw + off + cw, 0);
      g.addColorStop(0, '#3c4145');
      g.addColorStop(0.4, '#676d72');
      g.addColorStop(0.6, '#767c81');
      g.addColorStop(1, '#343a3e');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x * cw + off + 1, y * ch + 1, cw - 2, ch + 2, [cw / 2, cw / 2, 2, 2]);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x * cw + off + cw * 0.42, y * ch + 2, 2, ch - 2);
    }
  }
  grain(ctx, w, h, 0.3, seed + 9, 0.06);
}

/* ------------------------------ metals ------------------------------ */
function goldLeaf(ctx, w, h, seed) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#d3ae63');
  g.addColorStop(0.35, '#f0d493');
  g.addColorStop(0.6, '#c89a4e');
  g.addColorStop(1, '#e8c179');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 110; i++) {
    const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, 8 + r() * 30);
    g2.addColorStop(0, `rgba(255,240,190,${0.08 + r() * 0.12})`);
    g2.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.save();
    ctx.translate(r() * w, r() * h);
    ctx.fillStyle = g2;
    ctx.fillRect(-40, -40, 80, 80);
    ctx.restore();
  }
  grain(ctx, w, h, 0.25, seed + 13, 0.04);
}

function bronzePatina(ctx, w, h, seed) {
  ctx.fillStyle = '#7d5c34';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 90; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 8 + r() * 50;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const green = r() > 0.45;
    g.addColorStop(0, green ? 'rgba(104,136,104,0.34)' : 'rgba(52,34,18,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  grain(ctx, w, h, 0.3, seed + 6, 0.06);
}

function jadeStone(ctx, w, h, seed) {
  ctx.fillStyle = '#87957e';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 60; i++) {
    const g = ctx.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, 40);
    g.addColorStop(0, `rgba(210,222,200,${0.05 + r() * 0.08})`);
    g.addColorStop(1, 'rgba(210,222,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  streaks(ctx, w, h, 'rgba(60,72,58,0.6)', 18, seed + 8);
  grain(ctx, w, h, 0.25, seed + 12, 0.05);
}

/* ------------------------------ fabrics ----------------------------- */
function brocade(ctx, w, h, base, accent, seed) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  const step = 64;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const cx = x + step / 2;
      const cy = y + step / 2;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(cx, cy, 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        ctx.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (r() > 0.5) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
  grain(ctx, w, h, 0.2, seed + 2, 0.05);
}

function altarCloth(ctx, w, h, seed) {
  ctx.fillStyle = '#7d241c';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  ctx.strokeStyle = 'rgba(218,176,96,0.7)';
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, w - 40, h - 40);
  for (let i = 0; i < 9; i++) {
    const x = 40 + r() * (w - 80);
    const y = 40 + r() * (h - 80);
    ctx.strokeStyle = 'rgba(226,186,108,0.5)';
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      ctx.arc(x + k * 18, y, 7 + k * 2, Math.PI * 0.1, Math.PI * 1.1);
    }
    ctx.stroke();
  }
  grain(ctx, w, h, 0.2, seed + 4, 0.05);
}

function carpet(ctx, w, h, seed) {
  ctx.fillStyle = '#5c2a22';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  ctx.strokeStyle = 'rgba(196,154,88,0.55)';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, w - 36, h - 36);
  ctx.lineWidth = 1.4;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  for (let i = 0; i < 14; i++) {
    const x = 44 + r() * (w - 88);
    const y = 44 + r() * (h - 88);
    ctx.beginPath();
    ctx.arc(x, y, 5 + r() * 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  grain(ctx, w, h, 0.25, seed + 3, 0.06);
}

/* ------------------------------ surfaces ---------------------------- */
function earth(ctx, w, h, seed) {
  ctx.fillStyle = '#6f775f';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 260; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 4 + r() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const c = r() > 0.5 ? '104,112,88' : '62,68,50';
    g.addColorStop(0, `rgba(${c},0.28)`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  grain(ctx, w, h, 0.6, seed + 1, 0.08);
}

function pathStone(ctx, w, h, seed) {
  ctx.fillStyle = '#9f988a';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  const rows = 5;
  const ch = h / rows;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 ? w / 4 : 0;
    for (let x = -1; x < 3; x++) {
      const bw = w / 2;
      const v = 156 + Math.floor(r() * 22);
      ctx.fillStyle = `rgb(${v},${v - 7},${v - 16})`;
      ctx.fillRect(offset + x * bw + 2, row * ch + 2, bw - 4, ch - 4);
    }
  }
  ctx.strokeStyle = 'rgba(60,54,44,0.45)';
  ctx.lineWidth = 2;
  for (let row = 0; row <= rows; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * ch);
    ctx.lineTo(w, row * ch);
    ctx.stroke();
  }
  grain(ctx, w, h, 0.4, seed + 2, 0.06);
}

/* ------------------------------- paper ------------------------------ */
function doorLeaf(ctx, w, h, seed) {
  wood(ctx, w, h, '#5a3423', '#3d2015', seed);
  ctx.fillStyle = 'rgba(222,182,112,0.75)';
  for (let y = 40; y < h - 30; y += 46) {
    for (let x = 26; x < w - 20; x += 46) {
      ctx.beginPath();
      ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(24,12,7,0.6)';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.strokeStyle = 'rgba(222,182,112,0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.fillStyle = '#c9a45f';
  ctx.beginPath();
  ctx.arc(w - 42, h / 2, 9, 0, Math.PI * 2);
  ctx.fill();
}

function plaqueTexture(name, w, h) {
  return tex(`plaque:${name}`, w, h, (ctx, cw, ch) => {
    ctx.fillStyle = '#171210';
    ctx.fillRect(0, 0, cw, ch);
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, 'rgba(120,92,48,0.35)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(120,92,48,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = '#b58a45';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, cw - 20, ch - 20);
    ctx.strokeStyle = 'rgba(218,182,110,0.65)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, cw - 40, ch - 40);
    ctx.fillStyle = '#e1c07b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fs = Math.min(ch * 0.58, cw / (name.length + 0.4));
    ctx.font = `${fs}px "Songti SC", "STSong", "Noto Serif SC", serif`;
    ctx.fillText(name, cw / 2, ch / 2 + fs * 0.02);
    grain(ctx, cw, ch, 0.25, 3, 0.05);
  }, { repeat: [1, 1] });
}

function muralTexture(seed) {
  return tex(`mural:${seed}`, 768, 448, (ctx, w, h) => {
    const r = rng(seed);
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#d5cab3');
    base.addColorStop(0.55, '#c8bda6');
    base.addColorStop(1, '#a99d86');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 34; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 40 + r() * 140;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(150,134,104,${0.03 + r() * 0.07})`);
      g.addColorStop(1, 'rgba(150,134,104,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }

    // 三层水墨远山
    const layers = [
      { y: 0.72, amp: 0.2, alpha: 0.2, color: '86,96,84' },
      { y: 0.8, amp: 0.14, alpha: 0.28, color: '64,74,64' },
      { y: 0.88, amp: 0.09, alpha: 0.34, color: '46,54,46' },
    ];
    for (const L of layers) {
      ctx.fillStyle = `rgba(${L.color},${L.alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, h);
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const px = (i / n) * w;
        const py = h * L.y - Math.sin((i / n) * Math.PI * 2 + seed) * h * L.amp * 0.5
          - r() * h * L.amp;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }

    // 云气
    ctx.strokeStyle = 'rgba(236,229,210,0.5)';
    for (let i = 0; i < 9; i++) {
      const cx = r() * w;
      const cy = h * (0.32 + r() * 0.2);
      const rr = 30 + r() * 70;
      ctx.lineWidth = 2 + r() * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, Math.PI * 0.15, Math.PI * 0.92);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + rr * 0.7, cy + 6, rr * 0.55, Math.PI * 0.2, Math.PI * 0.95);
      ctx.stroke();
    }

    // 中央佛光与莲台
    const cx = w * 0.5;
    const cy = h * 0.54;
    const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, h * 0.3);
    halo.addColorStop(0, 'rgba(196,158,92,0.28)');
    halo.addColorStop(0.55, 'rgba(196,158,92,0.1)');
    halo.addColorStop(1, 'rgba(196,158,92,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(cx - h * 0.3, cy - h * 0.3, h * 0.6, h * 0.6);
    ctx.strokeStyle = 'rgba(150,112,56,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, h * 0.21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, h * 0.17, 0, Math.PI * 2);
    ctx.stroke();

    // 佛影
    const ink = 'rgba(92,70,44,0.42)';
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(cx, cy - h * 0.1, h * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - h * 0.1, cy + h * 0.12);
    ctx.quadraticCurveTo(cx - h * 0.07, cy - h * 0.05, cx, cy - h * 0.07);
    ctx.quadraticCurveTo(cx + h * 0.07, cy - h * 0.05, cx + h * 0.1, cy + h * 0.12);
    ctx.closePath();
    ctx.fill();
    // 莲台
    ctx.fillStyle = 'rgba(158,118,62,0.34)';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * h * 0.085, cy + h * 0.14 + Math.sin(a) * h * 0.018,
        h * 0.035, h * 0.016, a, 0, Math.PI * 2);
      ctx.fill();
    }

    // 两侧胁侍剪影
    for (const sx of [0.2, 0.8]) {
      const px = w * sx;
      const py = h * 0.68;
      ctx.fillStyle = 'rgba(96,74,48,0.26)';
      ctx.beginPath();
      ctx.arc(px, py - h * 0.09, h * 0.028, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px - h * 0.06, py + h * 0.09);
      ctx.lineTo(px - h * 0.03, py - h * 0.065);
      ctx.lineTo(px + h * 0.03, py - h * 0.065);
      ctx.lineTo(px + h * 0.06, py + h * 0.09);
      ctx.closePath();
      ctx.fill();
    }

    // 边饰与印章
    ctx.strokeStyle = 'rgba(176,142,82,0.36)';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.strokeStyle = 'rgba(70,60,44,0.24)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(22, 22, w - 44, h - 44);
    ctx.fillStyle = 'rgba(142,52,38,0.42)';
    ctx.fillRect(w - 58, h - 66, 30, 30);

    grain(ctx, w, h, 0.32, seed + 1, 0.05);
  });
}

function skyTexture() {
  return tex('sky', 512, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#6a93cc');
    g.addColorStop(0.42, '#9cbbe0');
    g.addColorStop(0.7, '#cddcE8');
    g.addColorStop(1, '#b6c3b8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // 方块云（对齐 16px 网格，Minecraft 风）
    const r = rng(9);
    const cell = 16;
    for (let i = 0; i < 12; i++) {
      const gx = Math.floor((r() * w) / cell) * cell;
      const gy = Math.floor((h * (0.1 + r() * 0.3)) / cell) * cell;
      const cw = cell * (3 + Math.floor(r() * 4));
      const ch = cell * (1 + Math.floor(r() * 2));
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.fillRect(gx, gy, cw, ch);
      ctx.fillRect(gx + cell, gy - cell, cw - cell * 2, cell);
      ctx.fillStyle = 'rgba(226,236,246,0.85)';
      ctx.fillRect(gx, gy + ch - cell, cw, cell);
    }
  }, { repeat: [1, 1] });
}

/* ------------------------------ sprites ----------------------------- */
function haloTexture() {
  return tex('halo', 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, w / 2);
    g.addColorStop(0, 'rgba(255,222,150,0.55)');
    g.addColorStop(0.4, 'rgba(255,205,110,0.2)');
    g.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,226,164,0.5)';
    ctx.lineWidth = 3;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, 20 + i * 22, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function smokeTexture() {
  return tex('smoke', 128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(238,230,214,0.55)');
    g.addColorStop(0.55, 'rgba(226,220,206,0.18)');
    g.addColorStop(1, 'rgba(226,220,206,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/* --------------------------- pixel art (MC) ------------------------- */
function clamp255(v) {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

function ptex(key, w, h, draw, { repeat = [1, 1] } = {}) {
  const id = `px:${key}|${repeat[0]}x${repeat[1]}`;
  if (cache.has(id)) return cache.get(id);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapNearestFilter;
  t.anisotropy = 1;
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set(id, t);
  return t;
}

function pixelField(ctx, w, h, base, seed, variance) {
  const r = rng(seed);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = (r() - 0.5) * 2 * variance;
      ctx.fillStyle = `rgb(${clamp255(base[0] + d)},${clamp255(base[1] + d)},${clamp255(base[2] + d)})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function pxStoneFloor(ctx, w, h) {
  pixelField(ctx, w, h, [170, 166, 156], 701, 9);
  ctx.fillStyle = 'rgb(118,114,106)';
  ctx.fillRect(0, 0, w, 1);
  ctx.fillRect(0, 0, 1, h);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(1, 1, w - 1, 1);
  ctx.fillRect(1, 1, 1, h - 1);
  const r = rng(702);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = 'rgba(118,114,106,0.5)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 2, 1);
  }
}

function pxStoneStep(ctx, w, h) {
  pixelField(ctx, w, h, [190, 186, 176], 703, 5);
  ctx.fillStyle = 'rgb(150,146,136)';
  ctx.fillRect(0, h - 1, w, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, 0, w, 1);
}

function pxStoneBrick(ctx, w, h) {
  pixelField(ctx, w, h, [142, 138, 130], 711, 8);
  const r = rng(712);
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    ctx.fillStyle = 'rgb(96,92,86)';
    ctx.fillRect(0, y, w, 1);
    const off = row % 2 ? 4 : 0;
    for (let x = off; x < w; x += 8) ctx.fillRect(x, y, 1, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    ctx.fillRect(0, y + 1, w, 1);
    for (let x = off; x < w; x += 8) {
      ctx.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.05})`;
      ctx.fillRect(x + 1, y + 1, 7, 3);
    }
  }
}

function pxCobble(ctx, w, h, base, seed) {
  pixelField(ctx, w, h, base, seed, 7);
  const r = rng(seed + 1);
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(r() * w);
    const y = Math.floor(r() * h);
    const s = 2 + Math.floor(r() * 3);
    const d = (r() - 0.5) * 46;
    ctx.fillStyle = `rgb(${clamp255(base[0] + d)},${clamp255(base[1] + d)},${clamp255(base[2] + d)})`;
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = 'rgba(58,56,50,0.35)';
    ctx.fillRect(x, y, s, 1);
    ctx.fillRect(x, y, 1, s);
  }
}

function pxGrass(ctx, w, h) {
  pixelField(ctx, w, h, [100, 134, 70], 731, 12);
  const r = rng(732);
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = r() > 0.35 ? 'rgba(76,112,54,0.6)' : 'rgba(126,148,86,0.6)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1);
  }
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = 'rgba(112,86,58,0.55)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 2, 1);
  }
}

function pxPlaster(ctx, w, h) {
  pixelField(ctx, w, h, [228, 220, 202], 741, 3);
  const r = rng(742);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = 'rgba(160,150,128,0.18)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1);
  }
}

function pxPlanks(ctx, w, h, base, dark, seed) {
  pixelField(ctx, w, h, base, seed, 6);
  const r = rng(seed + 1);
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = dark;
    ctx.fillRect(0, y, w, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(0, y + 1, w, 1);
    const joint = Math.floor(r() * w);
    ctx.fillStyle = dark;
    ctx.fillRect(joint, y + 1, 1, 3);
    ctx.fillStyle = 'rgba(30,18,10,0.18)';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(Math.floor(r() * w), y + 1 + Math.floor(r() * 3), 1, 1);
    }
  }
}

function pxRoof(ctx, w, h) {
  pixelField(ctx, w, h, [66, 72, 76], 751, 6);
  const r = rng(752);
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = 'rgb(44,48,52)';
    ctx.fillRect(0, y, w, 1);
    ctx.fillStyle = 'rgba(190,200,205,0.16)';
    ctx.fillRect(0, y + 3, w, 1);
    const off = y % 8 ? 2 : 0;
    for (let x = off; x < w; x += 4) {
      ctx.fillStyle = 'rgba(32,36,40,0.5)';
      ctx.fillRect(x, y, 1, 4);
    }
  }
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = 'rgba(150,160,166,0.12)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 2);
  }
}

function pxGold(ctx, w, h) {
  pixelField(ctx, w, h, [232, 196, 92], 761, 10);
  const r = rng(762);
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,240,170,0.55)' : 'rgba(176,132,40,0.4)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1 + Math.floor(r() * 2), 1);
  }
}

function pxBronze(ctx, w, h) {
  pixelField(ctx, w, h, [122, 92, 58], 771, 8);
  const r = rng(772);
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = r() > 0.45 ? 'rgba(96,132,100,0.6)' : 'rgba(56,38,20,0.45)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1);
  }
}

function pxJade(ctx, w, h) {
  pixelField(ctx, w, h, [116, 142, 116], 781, 7);
  const r = rng(782);
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = r() > 0.4 ? 'rgba(200,220,196,0.5)' : 'rgba(70,94,72,0.5)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1 + Math.floor(r() * 2), 1);
  }
}

function pxBrocade(ctx, w, h) {
  pixelField(ctx, w, h, [106, 32, 28], 791, 7);
  ctx.fillStyle = 'rgba(214,174,102,0.8)';
  for (let cy = 4; cy < h; cy += 8) {
    for (let cx = 4; cx < w; cx += 8) {
      ctx.fillRect(cx, cy - 2, 1, 1);
      ctx.fillRect(cx - 2, cy, 1, 1);
      ctx.fillRect(cx + 2, cy, 1, 1);
      ctx.fillRect(cx, cy + 2, 1, 1);
      ctx.fillRect(cx, cy, 1, 1);
    }
  }
}

function pxPlum(ctx, w, h) {
  pixelField(ctx, w, h, [150, 88, 106], 803, 9);
  const r = rng(804);
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(186,116,136,0.5)' : 'rgba(104,52,72,0.5)';
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1 + Math.floor(r() * 2), 1);
  }
}

function pxCloth(ctx, w, h) {
  pixelField(ctx, w, h, [118, 32, 26], 795, 5);
  ctx.fillStyle = 'rgba(220,178,100,0.85)';
  ctx.fillRect(1, 1, w - 2, 1);
  ctx.fillRect(1, h - 2, w - 2, 1);
  ctx.fillRect(1, 1, 1, h - 2);
  ctx.fillRect(w - 2, 1, 1, h - 2);
  ctx.fillStyle = 'rgba(220,178,100,0.45)';
  for (let x = 3; x < w - 2; x += 3) {
    ctx.fillRect(x, h / 2, 1, 1);
  }
}

function pxCarpet(ctx, w, h) {
  pixelField(ctx, w, h, [88, 42, 34], 797, 5);
  ctx.fillStyle = 'rgba(196,154,88,0.75)';
  ctx.fillRect(0, 0, w, 1);
  ctx.fillRect(0, h - 1, w, 1);
  ctx.fillRect(0, 0, 1, h);
  ctx.fillRect(w - 1, 0, 1, h);
  const r = rng(798);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = 'rgba(210,168,96,0.45)';
    ctx.fillRect(2 + Math.floor(r() * (w - 4)), 2 + Math.floor(r() * (h - 4)), 1, 1);
  }
}

function pxDoor(ctx, w, h) {
  pixelField(ctx, w, h, [94, 58, 38], 801, 7);
  for (let x = 0; x < w; x += 4) {
    ctx.fillStyle = 'rgba(52,30,20,0.85)';
    ctx.fillRect(x, 0, 1, h);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(x + 1, 0, 1, h);
  }
  ctx.fillStyle = 'rgb(48,28,18)';
  ctx.fillRect(0, 0, w, 1);
  ctx.fillRect(0, h - 1, w, 1);
  ctx.fillRect(0, 0, 1, h);
  ctx.fillRect(w - 1, 0, 1, h);
  ctx.fillStyle = 'rgba(220,178,92,0.9)';
  for (const sy of [7, 16, 25]) {
    ctx.fillRect(3, sy, 2, 2);
    ctx.fillRect(11, sy, 2, 2);
  }
}

function pxPlaque(ctx, w, h, name) {
  ctx.fillStyle = '#171210';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#b58a45';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  ctx.strokeStyle = 'rgba(218,182,110,0.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(9, 9, w - 18, h - 18);
  ctx.fillStyle = '#e1c07b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = Math.min(h * 0.52, w / (name.length + 0.6));
  ctx.font = `${Math.round(fs)}px "Songti SC", "STSong", "Noto Serif SC", serif`;
  ctx.fillText(name, w / 2, h / 2);
}

function pxPlaqueVertical(ctx, w, h, name) {
  ctx.fillStyle = '#171210';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#b58a45';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  ctx.strokeStyle = 'rgba(218,182,110,0.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(9, 9, w - 18, h - 18);
  ctx.fillStyle = '#e1c07b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = [...name];
  const step = (h - 36) / chars.length;
  const fs = Math.min(w * 0.62, step * 0.82);
  ctx.font = `${Math.round(fs)}px "Songti SC", "STSong", "Noto Serif SC", serif`;
  chars.forEach((ch, i) => ctx.fillText(ch, w / 2, 18 + step * (i + 0.5)));
}

function pxMural(ctx, w, h, seed) {
  pixelField(ctx, w, h, [214, 205, 186], 760 + seed, 4);
  const r = rng(770 + seed);
  const layers = [
    [96, 108, 96, 0.45, 0.62],
    [74, 88, 74, 0.55, 0.72],
    [54, 66, 54, 0.65, 0.82],
  ];
  for (const [cr, cg, cb, alpha, ly] of layers) {
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
    for (let x = 0; x < w; x++) {
      const n = Math.sin((x / w) * Math.PI * 4 + seed) * 2 + (r() - 0.5) * 2;
      const top = Math.floor(h * ly + n);
      ctx.fillRect(x, top, 1, h - top);
    }
  }
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h * 0.5);
  ctx.fillStyle = 'rgba(168,132,64,0.5)';
  for (let a = 0; a < 64; a++) {
    const ang = (a / 64) * Math.PI * 2;
    ctx.fillRect(cx + Math.round(Math.cos(ang) * 8), cy + Math.round(Math.sin(ang) * 8), 1, 1);
  }
  ctx.fillStyle = 'rgba(92,68,42,0.55)';
  ctx.fillRect(cx - 2, cy - 6, 5, 4);
  ctx.fillRect(cx - 4, cy - 2, 9, 6);
  ctx.fillRect(cx - 6, cy + 4, 13, 2);
  ctx.fillStyle = 'rgba(246,240,224,0.55)';
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(r() * w);
    const y = Math.floor(h * (0.3 + r() * 0.12));
    ctx.fillRect(x, y, 4, 1);
    ctx.fillRect(x + 1, y + 1, 2, 1);
  }
}

/* ------------------------------- export ----------------------------- */
export const T = {
  woodWarm: (rep = [1, 1]) => tex('wood:warm', 512, 512, (c, w, h) => wood(c, w, h, '#6a3e2a', '#4f2a1d', 1), { repeat: rep }),
  woodDark: (rep = [1, 1]) => tex('wood:dark', 512, 512, (c, w, h) => wood(c, w, h, '#40241a', '#2b160f', 2), { repeat: rep }),
  woodLight: (rep = [1, 1]) => tex('wood:light', 512, 512, (c, w, h) => wood(c, w, h, '#8a5a3b', '#6c4229', 3), { repeat: rep }),
  stoneTile: (rep = [1, 1]) => tex('stone:tile', 512, 512, (c, w, h) => stoneTile(c, w, h, 4), { repeat: rep }),
  stoneBlock: (rep = [1, 1]) => tex('stone:block', 512, 512, (c, w, h) => stoneBlock(c, w, h, 5), { repeat: rep }),
  plaster: (rep = [1, 1]) => tex('plaster', 512, 512, (c, w, h) => plaster(c, w, h, 6), { repeat: rep }),
  roof: (rep = [1, 1]) => tex('roof', 512, 512, (c, w, h) => roofTile(c, w, h, 7), { repeat: rep }),
  gold: (rep = [1, 1]) => tex('gold', 512, 512, (c, w, h) => goldLeaf(c, w, h, 8), { repeat: rep }),
  bronze: (rep = [1, 1]) => tex('bronze', 512, 512, (c, w, h) => bronzePatina(c, w, h, 10), { repeat: rep }),
  jade: (rep = [1, 1]) => tex('jade', 512, 512, (c, w, h) => jadeStone(c, w, h, 11), { repeat: rep }),
  brocade: (rep = [1, 1]) => tex('brocade', 512, 512, (c, w, h) => brocade(c, w, h, '#6d1f1b', '#c9a25c', 12), { repeat: rep }),
  cloth: (rep = [1, 1]) => tex('cloth', 512, 512, (c, w, h) => altarCloth(c, w, h, 13), { repeat: rep }),
  carpet: (rep = [1, 1]) => tex('carpet', 512, 512, (c, w, h) => carpet(c, w, h, 14), { repeat: rep }),
  earth: (rep = [1, 1]) => tex('earth', 512, 512, (c, w, h) => earth(c, w, h, 15), { repeat: rep }),
  path: (rep = [1, 1]) => tex('path', 512, 512, (c, w, h) => pathStone(c, w, h, 16), { repeat: rep }),
  door: () => tex('door', 256, 512, (c, w, h) => doorLeaf(c, w, h, 17), { repeat: [1, 1] }),
  plaque: (name) => plaqueTexture(name, 512, 220),
  mural: (seed = 1) => muralTexture(seed),
  sky: () => skyTexture(),
  halo: () => haloTexture(),
  smoke: () => smokeTexture(),
};

/** Minecraft 风像素贴图：16×16、最近邻采样、硬边像素。 */
export const P = {
  stoneFloor: (rep = [1, 1]) => ptex('stoneFloor', 16, 16, pxStoneFloor, { repeat: rep }),
  stoneBrick: (rep = [1, 1]) => ptex('stoneBrick', 16, 16, pxStoneBrick, { repeat: rep }),
  stoneStep: (rep = [1, 1]) => ptex('stoneStep', 16, 16, pxStoneStep, { repeat: rep }),
  path: (rep = [1, 1]) => ptex('path', 16, 16, (c, w, h) => pxCobble(c, w, h, [156, 150, 138], 703), { repeat: rep }),
  grass: (rep = [1, 1]) => ptex('grass', 16, 16, pxGrass, { repeat: rep }),
  plaster: (rep = [1, 1]) => ptex('plaster', 16, 16, pxPlaster, { repeat: rep }),
  woodWarm: (rep = [1, 1]) => ptex('woodWarm', 16, 16, (c, w, h) => pxPlanks(c, w, h, [124, 76, 50], 'rgb(72,42,28)', 1), { repeat: rep }),
  woodDark: (rep = [1, 1]) => ptex('woodDark', 16, 16, (c, w, h) => pxPlanks(c, w, h, [76, 46, 32], 'rgb(44,26,18)', 2), { repeat: rep }),
  woodLight: (rep = [1, 1]) => ptex('woodLight', 16, 16, (c, w, h) => pxPlanks(c, w, h, [164, 110, 74], 'rgb(104,64,42)', 3), { repeat: rep }),
  roof: (rep = [1, 1]) => ptex('roof', 16, 16, pxRoof, { repeat: rep }),
  gold: (rep = [1, 1]) => ptex('gold', 16, 16, pxGold, { repeat: rep }),
  bronze: (rep = [1, 1]) => ptex('bronze', 16, 16, pxBronze, { repeat: rep }),
  jade: (rep = [1, 1]) => ptex('jade', 16, 16, pxJade, { repeat: rep }),
  brocade: (rep = [1, 1]) => ptex('brocade', 16, 16, pxBrocade, { repeat: rep }),
  plum: (rep = [1, 1]) => ptex('plum', 16, 16, pxPlum, { repeat: rep }),
  cloth: (rep = [1, 1]) => ptex('cloth', 16, 16, pxCloth, { repeat: rep }),
  carpet: (rep = [1, 1]) => ptex('carpet', 16, 16, pxCarpet, { repeat: rep }),
  door: () => ptex('door', 16, 32, pxDoor),
  plaque: (name) => ptex(`plaque:${name}`, 256, 110, (c, w, h) => pxPlaque(c, w, h, name)),
  plaqueVertical: (name) => ptex(`plaqueV:${name}`, 128, 512, (c, w, h) => pxPlaqueVertical(c, w, h, name)),
  mural: (seed = 1) => ptex(`mural:${seed}`, 48, 28, (c, w, h) => pxMural(c, w, h, seed)),
};
