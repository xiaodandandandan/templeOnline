import { createBudai } from './Budai.js';
import { batchStatue } from './BatchStatue.js';
import * as THREE from 'three';
import { M } from './Materials.js';
import { box, beamBetween } from './Props.js';

/**
 * 体素 / 我的世界风佛像：
 * 金身 + 紫红袈裟（金边）、螺发肉髻、结跏趺坐、禅定印，
 * 身后为带金色放射光的大背光与头光，座下为多层莲台。
 * 参考：金身坐佛体素造像。
 */

const SCHEMES = {
  gold: {
    skin: M.voxGold, light: M.voxGoldLight, deep: M.voxGoldDeep,
    robe: M.voxPlum, robeDark: M.voxPlumDark,
    hair: M.voxHair, trim: M.voxGoldDeep,
  },
  bronze: {
    skin: M.bronze, light: M.bronze, deep: M.bronze,
    robe: M.voxPlumDark, robeDark: M.voxPlumDark,
    hair: M.voxHair, trim: M.goldDim,
  },
  jade: {
    skin: M.jade, light: M.jade, deep: M.jade,
    robe: M.voxPlum, robeDark: M.voxPlumDark,
    hair: M.voxHair, trim: M.goldDim,
  },
  painted: {
    skin: M.voxGold, light: M.voxGoldLight, deep: M.voxGoldDeep,
    robe: M.robeRed, robeDark: M.lacquerDark,
    hair: M.voxHair, trim: M.gold,
  },
};

const flat = { cast: false };

/* ------------------------------- 莲台 ------------------------------- */
function lotusBase(g, s) {
  // 须弥座
  box(g, 3.5 * s, 0.24 * s, 1.62 * s, 0, 0.12 * s, 0, M.stoneDark, flat);
  box(g, 3.56 * s, 0.07 * s, 1.68 * s, 0, 0.26 * s, 0, M.voxGoldDeep, flat);
  // 束腰与金饰
  box(g, 3.12 * s, 0.2 * s, 1.42 * s, 0, 0.4 * s, 0, M.voxPlumDark, flat);
  for (let i = -3; i <= 3; i++) {
    box(g, 0.16 * s, 0.12 * s, 0.06 * s, i * 0.42 * s, 0.4 * s, 0.73 * s, M.voxGoldDeep, flat);
  }
  box(g, 3.24 * s, 0.08 * s, 1.48 * s, 0, 0.55 * s, 0, M.voxGoldDeep, flat);

  // 两排莲瓣：方块花瓣 + 金色瓣尖
  const petals = (count, rx, rz, y, w, h, d) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const pg = new THREE.Group();
      pg.position.set(Math.cos(a) * rx, y, Math.sin(a) * rz);
      pg.rotation.y = -a + Math.PI / 2;
      g.add(pg);
      box(pg, w, h, d, 0, 0, 0, M.voxPlum, flat);
      box(pg, w * 0.7, h * 0.32, d * 0.46, 0, -h * 0.32, d * 0.4, M.voxGoldDeep, flat);
    }
  };
  petals(14, 1.54 * s, 0.8 * s, 0.76 * s, 0.46 * s, 0.34 * s, 0.34 * s);
  petals(12, 1.28 * s, 0.66 * s, 0.98 * s, 0.4 * s, 0.3 * s, 0.3 * s);

  // 莲台面
  box(g, 2.62 * s, 0.16 * s, 1.32 * s, 0, 1.1 * s, 0, M.voxGoldDeep, flat);
  box(g, 2.42 * s, 0.1 * s, 1.18 * s, 0, 1.2 * s, 0, M.voxPlum, flat);
}

/* ------------------------------- 背光 ------------------------------- */
function mandorla(g, s, sc) {
  const y0 = 0.62 * s;
  const y1 = 4.9 * s;
  const halfW = 1.44 * s;
  const back = -0.64 * s;
  const rows = 22;
  const dy = (y1 - y0) / rows;
  const prof = (t) => halfW * Math.pow(Math.sin(Math.PI * t), 0.75);

  for (let i = 0; i < rows; i++) {
    const t = (i + 0.5) / rows;
    const hw = prof(t);
    if (hw < 0.1 * s) continue;
    const y = y0 + dy * (i + 0.5);
    // 紫红背光主体
    box(g, hw * 2, dy * 1.02, 0.26 * s, 0, y, back, sc.robeDark, flat);
    // 金色叶缘
    box(g, 0.16 * s, dy * 1.02, 0.34 * s, -hw + 0.08 * s, y, back, sc.trim, flat);
    box(g, 0.16 * s, dy * 1.02, 0.34 * s, hw - 0.08 * s, y, back, sc.trim, flat);
  }

  // 金色放射光：从头部向外呈阶梯方块，一直铺到背光边缘
  const cy = 2.9 * s;
  const rays = [];
  for (let i = 0; i < 11; i++) rays.push(-1.44 + (i / 10) * 2.88);
  for (const a of rays) {
    for (let k = 0; k < 8; k++) {
      const r = (1.24 + k * 0.2) * s;
      const x = Math.sin(a) * r;
      const y = cy + Math.cos(a) * r;
      if (y < y0 + 0.1 * s || y > y1 - 0.12 * s) break;
      const t = (y - y0) / (y1 - y0);
      if (Math.abs(x) > prof(t) - 0.16 * s) break;
      const sz = (0.15 + k * 0.008) * s;
      box(g, sz, sz, 0.28 * s, x, y, back + 0.13 * s, sc.trim, flat);
    }
  }
  // 背光中轴金线
  box(g, 0.13 * s, 0.72 * s, 0.28 * s, 0, 4.42 * s, back + 0.13 * s, sc.trim, flat);

  // 头光：头部后方的金色圆盘（半径略大于头部，露出上缘与两侧）
  const discRows = 10;
  const discR = 1.12 * s;
  const discSpan = discR * 2;
  for (let i = 0; i < discRows; i++) {
    const t = (i + 0.5) / discRows;
    const yy = cy - discR + t * discSpan;
    const half = Math.sqrt(Math.max(0, discR * discR - Math.pow((t - 0.5) * discSpan, 2)));
    if (half < 0.04 * s) continue;
    box(g, half * 2, (discSpan / discRows) * 1.02, 0.1 * s, 0, yy, back + 0.3 * s, sc.light, flat);
  }
}

/* ------------------------------- 头部 ------------------------------- */
function head(g, s, sc, { crown = false, fierce = false, beard = false, hat = false } = {}) {
  const hy = 2.9 * s;             // 头心
  const HW = 0.86 * s;            // 头宽
  const HH = 0.9 * s;             // 头高
  const HD = 0.8 * s;             // 头厚
  const FZ = HD / 2 + 0.03 * s;   // 五官所在平面

  // 颈
  box(g, 0.42 * s, 0.2 * s, 0.42 * s, 0, 2.5 * s, 0.04 * s, sc.skin, flat);
  // 头
  box(g, HW, HH, HD, 0, hy, 0.02 * s, sc.skin);

  // 长耳与耳垂
  for (const sd of [-1, 1]) {
    box(g, 0.12 * s, 0.54 * s, 0.16 * s, sd * (HW / 2 + 0.06 * s), hy - 0.1 * s, 0.02 * s, sc.skin, flat);
    box(g, 0.14 * s, 0.14 * s, 0.18 * s, sd * (HW / 2 + 0.06 * s), hy - 0.4 * s, 0.02 * s, sc.light, flat);
  }

  // 螺发：顶盖 + 后脑 + 两鬓
  box(g, HW + 0.04 * s, 0.16 * s, HD + 0.04 * s, 0, hy + HH / 2 + 0.06 * s, 0.02 * s, sc.hair, flat);
  box(g, HW + 0.02 * s, 0.56 * s, 0.12 * s, 0, hy + 0.08 * s, -HD / 2 - 0.03 * s, sc.hair, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.1 * s, 0.44 * s, HD - 0.16 * s, sd * (HW / 2 + 0.03 * s), hy + 0.12 * s, 0.02 * s, sc.hair, flat);
  }
  // 前额发片 + 两排螺发小卷
  box(g, HW + 0.02 * s, 0.22 * s, 0.1 * s, 0, hy + 0.31 * s, FZ - 0.045 * s, sc.hair, flat);
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 9; i++) {
      box(g, 0.085 * s, 0.085 * s, 0.08 * s,
        (i - 4) * 0.095 * s, hy + (0.27 + row * 0.09) * s, FZ + 0.01 * s, sc.hair, flat);
    }
  }

  // 肉髻：层层收分的方块
  box(g, 0.48 * s, 0.14 * s, 0.46 * s, 0, hy + 0.6 * s, 0.02 * s, sc.hair, flat);
  box(g, 0.36 * s, 0.13 * s, 0.36 * s, 0, hy + 0.73 * s, 0.02 * s, sc.hair, flat);
  box(g, 0.24 * s, 0.12 * s, 0.24 * s, 0, hy + 0.85 * s, 0.02 * s, sc.hair, flat);

  // 五官（像素方块）
  const eye = fierce ? sc.deep : M.lacquerDark;
  if (fierce) {
    // 怒目：外眦上挑
    for (const sd of [-1, 1]) {
      const e = box(g, 0.24 * s, 0.11 * s, 0.04 * s, sd * 0.18 * s, hy + 0.07 * s, FZ, M.black, flat);
      e.rotation.z = sd * 0.22;
      const b = box(g, 0.26 * s, 0.07 * s, 0.04 * s, sd * 0.18 * s, hy + 0.21 * s, FZ, sc.hair, flat);
      b.rotation.z = sd * -0.3;
    }
  } else {
    // 垂目：细线 + 眉
    for (const sd of [-1, 1]) {
      box(g, 0.22 * s, 0.04 * s, 0.04 * s, sd * 0.18 * s, hy + 0.03 * s, FZ, eye, flat);
      box(g, 0.18 * s, 0.025 * s, 0.03 * s, sd * 0.2 * s, hy + 0.15 * s, FZ, sc.deep, flat);
    }
  }

  // 鼻
  box(g, 0.1 * s, 0.22 * s, 0.09 * s, 0, hy - 0.05 * s, FZ + 0.03 * s, sc.light, flat);
  box(g, 0.14 * s, 0.05 * s, 0.05 * s, 0, hy - 0.15 * s, FZ + 0.01 * s, sc.skin, flat);

  // 口与微笑
  box(g, 0.22 * s, 0.045 * s, 0.04 * s, 0, hy - 0.24 * s, FZ, M.lacquerDark, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.05 * s, 0.04 * s, 0.035 * s, sd * 0.13 * s, hy - 0.22 * s, FZ, M.lacquerDark, flat);
  }

  // 白毫
  box(g, 0.055 * s, 0.055 * s, 0.05 * s, 0, hy + 0.17 * s, FZ + 0.03 * s, sc.light, flat);

  if (beard) {
    box(g, 0.44 * s, 0.24 * s, 0.18 * s, 0, hy - 0.46 * s, 0.3 * s, sc.hair, flat);
    box(g, 0.3 * s, 0.22 * s, 0.16 * s, 0, hy - 0.64 * s, 0.28 * s, sc.hair, flat);
  }

  if (crown) {
    box(g, HW + 0.08 * s, 0.12 * s, HD + 0.06 * s, 0, hy + HH / 2 + 0.02 * s, 0.02 * s, sc.trim, flat);
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.21 * s;
      box(g, 0.12 * s, 0.12 * s + Math.abs(i - 2) * -0.02 * s, 0.1 * s,
        x, hy + HH / 2 + 0.15 * s, FZ - 0.02 * s, sc.trim, flat);
      box(g, 0.06 * s, 0.16 * s, 0.08 * s, x, hy + HH / 2 + 0.29 * s, FZ - 0.02 * s, sc.trim, flat);
    }
  }
  if (hat) {
    box(g, 0.92 * s, 0.12 * s, 0.86 * s, 0, hy + HH / 2 + 0.16 * s, 0.02 * s, sc.trim, flat);
    box(g, 0.62 * s, 0.26 * s, 0.58 * s, 0, hy + HH / 2 + 0.34 * s, 0.02 * s, M.black, flat);
  }
  return hy;
}

/* ------------------------------- 坐像 ------------------------------- */
function seatedBody(g, s, sc) {
  // 结跏趺坐：髋部、双膝、交叠小腿
  box(g, 2.12 * s, 0.5 * s, 1.24 * s, 0, 1.32 * s, 0.04 * s, sc.robe);
  for (const sd of [-1, 1]) {
    box(g, 1.0 * s, 0.44 * s, 1.1 * s, sd * 0.98 * s, 1.52 * s, 0.04 * s, sc.robe);
    box(g, 1.04 * s, 0.1 * s, 1.14 * s, sd * 0.98 * s, 1.74 * s, 0.04 * s, sc.trim, flat);
    box(g, 0.66 * s, 0.07 * s, 0.06 * s, sd * 1.0 * s, 1.6 * s, 0.6 * s, sc.trim, flat);
  }
  box(g, 1.86 * s, 0.3 * s, 0.5 * s, 0, 1.62 * s, 0.52 * s, sc.robe);
  box(g, 1.5 * s, 0.22 * s, 0.44 * s, 0.06 * s, 1.76 * s, 0.5 * s, sc.robe, flat);
  box(g, 0.42 * s, 0.22 * s, 0.3 * s, 0.3 * s, 1.66 * s, 0.68 * s, sc.skin, flat);
  for (let i = 0; i < 3; i++) {
    box(g, (2.2 - i * 0.24) * s, 0.06 * s, 0.05 * s, 0, (1.3 + i * 0.15) * s, 0.72 * s, sc.trim, flat);
  }

  // 躯干金身（窄胸，露出胸前 V 形）
  box(g, 0.96 * s, 1.06 * s, 0.86 * s, 0, 1.98 * s, 0, sc.skin);
  box(g, 0.8 * s, 0.3 * s, 0.84 * s, 0, 1.52 * s, 0.04 * s, sc.skin, flat);

  // 袈裟：肩头披覆
  box(g, 1.98 * s, 0.32 * s, 0.94 * s, 0, 2.46 * s, -0.08 * s, sc.robe);
  box(g, 1.9 * s, 0.1 * s, 0.96 * s, 0, 2.64 * s, -0.08 * s, sc.robeDark, flat);
  // 两侧垂布
  for (const sd of [-1, 1]) {
    box(g, 0.5 * s, 1.26 * s, 0.98 * s, sd * 0.68 * s, 1.9 * s, 0.02 * s, sc.robe);
    box(g, 0.08 * s, 1.26 * s, 1.0 * s, sd * 0.96 * s, 1.9 * s, 0.02 * s, sc.trim, flat);
    box(g, 0.08 * s, 1.16 * s, 1.0 * s, sd * 0.46 * s, 1.9 * s, 0.03 * s, sc.trim, flat);
  }
  // V 领金边
  for (let i = 0; i < 6; i++) {
    for (const sd of [-1, 1]) {
      box(g, 0.13 * s, 0.12 * s, 0.06 * s,
        sd * (0.42 - i * 0.062) * s, (2.34 - i * 0.085) * s, 0.5 * s, sc.trim, flat);
    }
  }
  // 腰间金色织纹
  box(g, 1.1 * s, 0.14 * s, 0.88 * s, 0, 1.56 * s, 0.02 * s, sc.trim, flat);

  // 胸前「卍」
  const zc = 0.47 * s;
  const w = 0.12 * s, L = 0.58 * s, hk = 0.22 * s;
  box(g, w, L, 0.06 * s, 0, 2.18 * s, zc, sc.trim, flat);
  box(g, L, w, 0.06 * s, 0, 2.18 * s, zc, sc.trim, flat);
  box(g, hk, w, 0.06 * s, -hk / 2, 2.18 * s + L / 2, zc, sc.trim, flat);
  box(g, w, hk, 0.06 * s, -L / 2, 2.18 * s - hk / 2, zc, sc.trim, flat);
  box(g, hk, w, 0.06 * s, hk / 2, 2.18 * s - L / 2, zc, sc.trim, flat);
  box(g, w, hk, 0.06 * s, L / 2, 2.18 * s + hk / 2, zc, sc.trim, flat);

  // 双臂：袈裟覆肩，前臂收向腹前
  for (const sd of [-1, 1]) {
    box(g, 0.4 * s, 0.5 * s, 0.92 * s, sd * 0.88 * s, 2.26 * s, -0.02 * s, sc.robe, flat);
    box(g, 0.34 * s, 0.52 * s, 0.56 * s, sd * 1.0 * s, 1.88 * s, 0.12 * s, sc.skin);
    box(g, 0.32 * s, 0.4 * s, 0.44 * s, sd * 0.82 * s, 1.66 * s, 0.36 * s, sc.skin);
    box(g, 0.3 * s, 0.28 * s, 0.4 * s, sd * 0.58 * s, 1.5 * s, 0.46 * s, sc.skin);
    box(g, 0.38 * s, 0.08 * s, 0.52 * s, sd * 0.88 * s, 2.48 * s, -0.02 * s, sc.trim, flat);
  }

  // 禅定印：双手叠放腹前
  box(g, 0.88 * s, 0.18 * s, 0.5 * s, 0, 1.42 * s, 0.58 * s, sc.skin);
  box(g, 0.72 * s, 0.16 * s, 0.46 * s, -0.03 * s, 1.56 * s, 0.6 * s, sc.light);
  box(g, 0.5 * s, 0.14 * s, 0.4 * s, 0.04 * s, 1.7 * s, 0.6 * s, sc.skin, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.16 * s, 0.1 * s, 0.14 * s, sd * 0.24 * s, 1.75 * s, 0.72 * s, sc.light, flat);
  }
  for (let i = -1; i <= 1; i++) {
    box(g, 0.05 * s, 0.05 * s, 0.05 * s, i * 0.17 * s, 1.72 * s, 0.84 * s, sc.deep, flat);
  }
}

/* ------------------------------- 立像 ------------------------------- */
function standingBody(g, s, sc) {
  // 双足
  for (const sd of [-1, 1]) {
    box(g, 0.34 * s, 0.16 * s, 0.5 * s, sd * 0.24 * s, 0.08 * s, 0.08 * s, sc.skin, flat);
  }
  // 长袍
  box(g, 1.46 * s, 2.14 * s, 0.96 * s, 0, 1.22 * s, 0.02 * s, sc.robe);
  box(g, 1.5 * s, 0.1 * s, 1.0 * s, 0, 0.16 * s, 0.02 * s, sc.trim, flat);
  box(g, 1.24 * s, 0.08 * s, 0.06 * s, 0, 0.62 * s, 0.52 * s, sc.trim, flat);
  // 前襟 V
  for (let i = 0; i < 6; i++) {
    for (const sd of [-1, 1]) {
      box(g, 0.11 * s, 0.14 * s, 0.06 * s,
        sd * (0.5 - i * 0.072) * s, (2.34 - i * 0.13) * s, 0.5 * s, sc.trim, flat);
    }
  }
  // 胸
  box(g, 1.02 * s, 0.66 * s, 0.96 * s, 0, 2.06 * s, 0.04 * s, sc.skin);
  // 肩
  box(g, 1.7 * s, 0.46 * s, 0.96 * s, 0, 2.44 * s, 0.02 * s, sc.robe);
  // 颈
  box(g, 0.42 * s, 0.2 * s, 0.42 * s, 0, 2.6 * s, 0.04 * s, sc.skin, flat);

  // 垂臂
  for (const sd of [-1, 1]) {
    box(g, 0.4 * s, 0.42 * s, 0.46 * s, sd * 0.84 * s, 2.4 * s, 0.02 * s, sc.robe, flat);
    box(g, 0.32 * s, 0.9 * s, 0.4 * s, sd * 0.9 * s, 1.86 * s, 0.08 * s, sc.skin);
    box(g, 0.22 * s, 0.34 * s, 0.32 * s, sd * 0.86 * s, 1.24 * s, 0.16 * s, sc.skin);
    box(g, 0.26 * s, 0.08 * s, 0.34 * s, sd * 0.86 * s, 1.44 * s, 0.18 * s, sc.trim, flat);
  }
  // 腰带
  box(g, 1.3 * s, 0.1 * s, 0.98 * s, 0, 1.5 * s, 0.03 * s, sc.trim, flat);
}

/* ------------------------------- 多臂 ------------------------------- */
function extraArms(g, s, sc, count) {
  const n = Math.max(1, Math.floor(count / 2));
  for (const side of [-1, 1]) {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1);
      const a = 0.15 + t * 0.85;
      const sx = side * 0.46 * s;
      const sy = 2.35 * s;
      const len = 1.2 * s;
      const ex = sx + side * Math.cos(a) * len;
      const ey = sy + Math.sin(a) * len;
      beamBetween(g, new THREE.Vector3(sx, sy, 0), new THREE.Vector3(ex, ey, 0.05 * s), 0.075 * s, sc.skin, 4);
      box(g, 0.16 * s, 0.16 * s, 0.18 * s, ex, ey, 0.08 * s, sc.skin, flat);
      box(g, 0.2 * s, 0.08 * s, 0.12 * s, ex, ey + 0.1 * s, 0.08 * s, sc.trim, flat);
    }
  }
}

export function createStatue(opts = {}) {
  const {
    scale = 1,
    scheme: schemeName = 'gold',
    variant = 'buddha',
    pose = 'seated',
    arms = 0,
    haloRing = true,
    lotus = true,
  } = opts;
  const s = scale;
  const sc = SCHEMES[schemeName] || SCHEMES.gold;
  const g = new THREE.Group();

  if (lotus) lotusBase(g, s);
  if (haloRing && variant !== 'king' && variant !== 'caishen') mandorla(g, s, sc);

  const seated = pose !== 'standing';
  if (seated) seatedBody(g, s, sc);
  else standingBody(g, s, sc);

  head(g, s, sc, {
    crown: variant === 'bodhisattva' || variant === 'guanyin' || variant === 'dragon',
    fierce: variant === 'king',
    beard: variant === 'caishen' || variant === 'dragon',
    hat: variant === 'caishen',
  });

  if (variant === 'bodhisattva' || variant === 'guanyin') {
    box(g, 0.12 * s, 0.9 * s, 0.06 * s, -0.5 * s, 1.86 * s, 0.5 * s, sc.robe, flat);
    box(g, 0.12 * s, 0.9 * s, 0.06 * s, 0.5 * s, 1.86 * s, 0.5 * s, sc.robe, flat);
  }
  if (variant === 'guanyin' && arms > 0) extraArms(g, s, sc, arms);
  if (variant === 'king') {
    box(g, 0.66 * s, 0.8 * s, 0.44 * s, 0, 2.0 * s, 0.24 * s, M.armor);
    box(g, 0.5 * s, 0.18 * s, 0.46 * s, 0, 2.44 * s, 0.24 * s, M.armor, flat);
    box(g, 0.9 * s, 0.16 * s, 0.5 * s, 0, 2.52 * s, 0.2 * s, sc.trim, flat);
  }
  if (variant === 'caishen') {
    box(g, 0.5 * s, 0.2 * s, 0.3 * s, 0, 1.5 * s, 0.64 * s, M.voxGold, flat);
    box(g, 0.22 * s, 0.16 * s, 0.16 * s, 0, 1.64 * s, 0.64 * s, M.voxGold, flat);
  }
  if (variant === 'dragon') {
    for (const sd of [-1, 1]) {
      beamBetween(g,
        new THREE.Vector3(sd * 0.2 * s, 3.4 * s, 0),
        new THREE.Vector3(sd * 0.42 * s, 3.95 * s, -0.12 * s), 0.07 * s, sc.trim, 4);
    }
  }
  const root = batchStatue(g);
  root.userData.isStatue = true;
  root.userData.statue = { kind: 'statue', opts: { ...opts } };
  return root;
}

/* ======================= 水月观音组像（实景参考） ======================= */
/**
 * 参考径山寺水月观音：
 * 游戏坐于崖座，一足下垂踏莲，朱红裙、青绿披帛、圆形金背光；
 * 两侧莲座立像为龙女与善财童子。
 * 全部以方块/方梁堆叠，保持体素风。
 */

/* 胁侍的小莲座 */
function attendantLotus(g, s) {
  box(g, 1.24 * s, 0.08 * s, 1.1 * s, 0, 0.04 * s, 0, M.stoneDark, flat);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const pg = new THREE.Group();
    pg.position.set(Math.cos(a) * 0.5 * s, 0.07 * s, Math.sin(a) * 0.44 * s);
    pg.rotation.y = -a + Math.PI / 2;
    g.add(pg);
    box(pg, 0.48 * s, 0.05 * s, 0.32 * s, 0, 0, 0, M.lotusLeaf, flat);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const pg = new THREE.Group();
    pg.position.set(Math.cos(a) * 0.4 * s, 0.14 * s, Math.sin(a) * 0.36 * s);
    pg.rotation.y = -a + Math.PI / 2;
    g.add(pg);
    box(pg, 0.28 * s, 0.16 * s, 0.3 * s, 0, 0.04 * s, 0.02 * s, M.lotusPink, flat);
    box(pg, 0.18 * s, 0.1 * s, 0.18 * s, 0, 0.17 * s, 0.06 * s, M.lotusPinkLight, flat);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const pg = new THREE.Group();
    pg.position.set(Math.cos(a) * 0.26 * s, 0.24 * s, Math.sin(a) * 0.23 * s);
    pg.rotation.y = -a + Math.PI / 2;
    g.add(pg);
    box(pg, 0.2 * s, 0.18 * s, 0.2 * s, 0, 0.05 * s, 0.03 * s, M.lotusPinkLight, flat);
  }
  box(g, 0.72 * s, 0.08 * s, 0.62 * s, 0, 0.34 * s, 0, M.lotusPinkDark, flat);
  box(g, 0.56 * s, 0.05 * s, 0.48 * s, 0, 0.39 * s, 0, M.lotusPink, flat);
}

/* 垂足下的大莲花 */
function footLotus(g, x, y, z, s) {
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const pg = new THREE.Group();
    pg.position.set(x + Math.cos(a) * 0.36 * s, y + 0.1 * s, z + Math.sin(a) * 0.32 * s);
    pg.rotation.y = -a + Math.PI / 2;
    g.add(pg);
    box(pg, 0.3 * s, 0.16 * s, 0.32 * s, 0, 0.02 * s, 0.03 * s, M.lotusPink, flat);
    box(pg, 0.2 * s, 0.12 * s, 0.2 * s, 0, 0.14 * s, 0.08 * s, M.lotusPinkLight, flat);
  }
  box(g, 0.68 * s, 0.1 * s, 0.6 * s, x, y + 0.24 * s, z, M.lotusPinkDark, flat);
  box(g, 0.52 * s, 0.06 * s, 0.46 * s, x, y + 0.31 * s, z, M.lotusPink, flat);
}

/* 崖座与海浪 */
function rockThrone(g, s) {
  box(g, 3.1 * s, 1.02 * s, 1.5 * s, 0, 0.51 * s, -0.22 * s, M.rockTeal);
  box(g, 2.5 * s, 0.32 * s, 1.18 * s, 0, 1.18 * s, -0.3 * s, M.rockTealDark, flat);
  box(g, 0.82 * s, 0.92 * s, 1.34 * s, -1.44 * s, 0.46 * s, -0.1 * s, M.rockTealDark);
  box(g, 0.7 * s, 1.28 * s, 1.18 * s, 1.42 * s, 0.64 * s, -0.12 * s, M.rockTeal);
  box(g, 0.48 * s, 0.86 * s, 0.9 * s, -1.62 * s, 1.14 * s, 0.04 * s, M.rockTealLight);
  box(g, 0.4 * s, 0.72 * s, 0.8 * s, 1.64 * s, 1.42 * s, 0.02 * s, M.rockTealLight);
  // 岩面碎块
  const chips = [
    [-1.1, 0.72, 0.55, 0.5, 0.26, 0.4, M.rockTealLight],
    [1.02, 0.86, 0.48, 0.42, 0.28, 0.46, M.rockTealDark],
    [-0.3, 0.38, 0.84, 0.52, 0.2, 0.3, M.rockTealLight],
    [0.56, 1.08, 0.44, 0.44, 0.2, 0.34, M.rockTealDark],
    [-1.5, 0.3, 0.68, 0.34, 0.24, 0.48, M.rockTeal],
  ];
  for (const [x, y, z, w, h, d, mat] of chips) {
    box(g, w * s, h * s, d * s, x * s, y * s, z * s, mat, flat);
  }
  // 前方海浪
  for (let i = 0; i < 11; i++) {
    const x = (i - 5) * 0.36 * s;
    const h = (0.16 + (i % 3) * 0.07) * s;
    box(g, 0.42 * s, h, 0.46 * s, x, h / 2, 0.82 * s, i % 2 ? M.waveBlue : M.waveBlueLight, flat);
    if (i % 2 === 0) {
      box(g, 0.28 * s, 0.06 * s, 0.3 * s, x, h + 0.03 * s, 0.82 * s, M.foam, flat);
    }
  }
  // 两翼浪花
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = (-0.42 + i * 0.42) * s;
      const h = (0.18 + (i % 2) * 0.08) * s;
      box(g, 0.5 * s, h, 0.42 * s, sd * 1.78 * s, h / 2, z, i % 2 ? M.waveBlueLight : M.waveBlue, flat);
    }
  }
  // 莲叶
  const leaves = [
    [-1.48, 0.98, 0.7, 0.5],
    [1.46, 0.94, 0.62, 0.46],
    [-0.96, 1.18, 0.5, 0.36],
    [0.94, 1.14, 0.46, 0.34],
  ];
  for (const [x, z, w, d] of leaves) {
    box(g, w * s, 0.06 * s, d * s, x * s, 0.03 * s, z * s, M.lotusLeaf, flat);
  }
}

/* 圆形金背光 + 火焰边 */
function royalHalo(g, s) {
  const cy = 3.05 * s;
  const z = -0.62 * s;
  const R = 1.16 * s;
  const rows = 24;
  const R2 = R + 0.14 * s;
  for (let i = 0; i < rows; i++) {
    const t = (i + 0.5) / rows;
    const yy = cy - R2 + t * R2 * 2;
    const half = Math.sqrt(Math.max(0, R2 * R2 - Math.pow((t - 0.5) * 2 * R2, 2)));
    if (half < 0.05 * s) continue;
    box(g, half * 2, (2 * R2 / rows) * 1.04, 0.1 * s, 0, yy, z - 0.05 * s, M.flameRed, flat);
  }
  for (let i = 0; i < rows; i++) {
    const t = (i + 0.5) / rows;
    const yy = cy - R + t * R * 2;
    const half = Math.sqrt(Math.max(0, R * R - Math.pow((t - 0.5) * 2 * R, 2)));
    if (half < 0.05 * s) continue;
    box(g, half * 2, (2 * R / rows) * 1.04, 0.1 * s, 0, yy, z, M.voxGold, flat);
  }
  const R3 = R * 0.7;
  for (let i = 0; i < 16; i++) {
    const t = (i + 0.5) / 16;
    const yy = cy - R3 + t * R3 * 2;
    const half = Math.sqrt(Math.max(0, R3 * R3 - Math.pow((t - 0.5) * 2 * R3, 2)));
    if (half < 0.05 * s) continue;
    box(g, half * 2, (2 * R3 / 16) * 1.04, 0.06 * s, 0, yy, z + 0.06 * s, M.voxGoldLight, flat);
  }
  // 火焰尖
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.1;
    const len = (0.2 + (i % 3) * 0.06) * s;
    const fx = Math.sin(a) * (R2 + 0.04 * s);
    const fy = cy + Math.cos(a) * (R2 + 0.04 * s);
    const spike = box(g, 0.12 * s, len, 0.1 * s, fx, fy, z - 0.08 * s,
      i % 2 ? M.flameOrange : M.flameRed, flat);
    spike.rotation.z = -a;
  }
}

/* 主尊头部：黑发高冠、垂目、长耳 */
function royalHead(g, s) {
  const hy = 2.9 * s;
  const HW = 0.8 * s;
  const HH = 0.92 * s;
  const HD = 0.76 * s;
  const FZ = HD / 2 + 0.03 * s;

  box(g, 0.36 * s, 0.24 * s, 0.38 * s, 0, 2.68 * s, 0.04 * s, M.skinFair, flat);
  box(g, HW, HH, HD, 0, hy, 0.02 * s, M.skinFair);

  // 长耳与金耳饰
  for (const sd of [-1, 1]) {
    box(g, 0.1 * s, 0.5 * s, 0.14 * s, sd * (HW / 2 + 0.05 * s), hy - 0.08 * s, 0.02 * s, M.skinFair, flat);
    box(g, 0.1 * s, 0.1 * s, 0.06 * s, sd * (HW / 2 + 0.05 * s), hy - 0.36 * s, 0.06 * s, M.gold, flat);
  }

  // 黑发：顶盖、后脑、两鬓、额前发际
  box(g, HW + 0.06 * s, 0.18 * s, HD + 0.06 * s, 0, hy + HH / 2 + 0.03 * s, 0, M.hair, flat);
  box(g, HW + 0.02 * s, 0.68 * s, 0.1 * s, 0, hy + 0.02 * s, -HD / 2 - 0.04 * s, M.hair, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.1 * s, 0.6 * s, HD - 0.1 * s, sd * (HW / 2 + 0.02 * s), hy + 0.06 * s, 0.02 * s, M.hair, flat);
  }
  box(g, HW + 0.04 * s, 0.12 * s, 0.08 * s, 0, hy + 0.36 * s, FZ - 0.03 * s, M.hair, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.2 * s, 0.26 * s, 0.22 * s, sd * (HW / 2 - 0.02 * s), hy + 0.3 * s, -0.02 * s, M.hair, flat);
  }

  // 发髻
  box(g, 0.46 * s, 0.2 * s, 0.4 * s, 0, hy + HH / 2 + 0.18 * s, 0, M.hair, flat);
  box(g, 0.3 * s, 0.16 * s, 0.28 * s, 0, hy + HH / 2 + 0.34 * s, 0, M.hair, flat);

  // 五官
  for (const sd of [-1, 1]) {
    box(g, 0.2 * s, 0.035 * s, 0.04 * s, sd * 0.17 * s, hy + 0.04 * s, FZ, M.lacquerDark, flat);
    box(g, 0.17 * s, 0.03 * s, 0.03 * s, sd * 0.19 * s, hy + 0.17 * s, FZ, M.hair, flat);
  }
  box(g, 0.09 * s, 0.2 * s, 0.08 * s, 0, hy - 0.05 * s, FZ + 0.03 * s, M.skinFairLight, flat);
  box(g, 0.13 * s, 0.045 * s, 0.05 * s, 0, hy - 0.15 * s, FZ + 0.01 * s, M.skinFair, flat);
  box(g, 0.2 * s, 0.05 * s, 0.04 * s, 0, hy - 0.24 * s, FZ, M.ribbonRed, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.05 * s, 0.04 * s, 0.035 * s, sd * 0.12 * s, hy - 0.215 * s, FZ, M.ribbonRed, flat);
  }
  box(g, 0.05 * s, 0.05 * s, 0.05 * s, 0, hy + 0.18 * s, FZ + 0.03 * s, M.gold, flat);

  // 高冠：金箍 + 五片冠叶 + 珠饰
  const crownY = hy + HH / 2 - 0.02 * s;
  box(g, HW + 0.1 * s, 0.13 * s, HD + 0.08 * s, 0, crownY, 0.02 * s, M.voxGoldDeep, flat);
  const leafH = [0.42, 0.34, 0.26];
  for (let i = -2; i <= 2; i++) {
    const k = Math.abs(i);
    const hgt = leafH[k] * s;
    const lx = i * 0.17 * s;
    box(g, 0.13 * s, hgt, 0.09 * s, lx, crownY + 0.1 * s + hgt / 2, FZ - 0.02 * s, M.gold, flat);
    box(g, 0.07 * s, 0.1 * s, 0.07 * s, lx, crownY + 0.13 * s, FZ + 0.02 * s,
      k === 0 ? M.ribbonRed : M.sashTeal, flat);
  }
  box(g, 0.12 * s, 0.16 * s, 0.12 * s, 0, crownY + 0.56 * s, 0, M.gold, flat);
}

/* 主尊身体：游戏坐 */
function royalBody(g, s) {
  // 裙裾与坐垫
  box(g, 1.96 * s, 0.46 * s, 1.12 * s, 0, 1.36 * s, 0.06 * s, M.robeCoral);
  box(g, 1.72 * s, 0.26 * s, 0.86 * s, 0.04 * s, 1.6 * s, 0.26 * s, M.robeCoralLight, flat);
  box(g, 1.46 * s, 0.12 * s, 0.96 * s, 0, 1.62 * s, 0.06 * s, M.voxGoldDeep, flat);
  // 垂落裙裾
  box(g, 0.86 * s, 1.15 * s, 0.2 * s, -0.36 * s, 1.0 * s, 0.62 * s, M.robeCoral);
  box(g, 0.52 * s, 0.95 * s, 0.18 * s, 0.42 * s, 0.94 * s, 0.6 * s, M.robeCoralDark);
  for (let i = 0; i < 3; i++) {
    box(g, 0.08 * s, 1.0 * s, 0.22 * s, (-0.55 + i * 0.28) * s, 1.02 * s, 0.63 * s,
      i === 1 ? M.robeCoralLight : M.robeCoralDark, flat);
  }
  box(g, 0.9 * s, 0.06 * s, 0.22 * s, -0.36 * s, 0.46 * s, 0.63 * s, M.gold, flat);
  // 裙面花纹
  for (let i = 0; i < 4; i++) {
    box(g, 0.1 * s, 0.1 * s, 0.03 * s, (-0.6 + i * 0.2) * s, (0.75 + (i % 2) * 0.22) * s, 0.73 * s,
      i % 2 ? M.sashTeal : M.gold, flat);
  }

  // 躯干
  box(g, 0.94 * s, 0.98 * s, 0.7 * s, 0, 2.06 * s, 0.02 * s, M.skinFair);
  box(g, 1.28 * s, 0.28 * s, 0.76 * s, 0, 2.54 * s, 0.02 * s, M.skinFair);
  // 白色披帛
  for (const sd of [-1, 1]) {
    box(g, 0.24 * s, 0.92 * s, 0.76 * s, sd * 0.62 * s, 2.08 * s, -0.04 * s, M.clothWhite, flat);
    box(g, 0.06 * s, 0.94 * s, 0.78 * s, sd * 0.74 * s, 2.08 * s, -0.04 * s, M.goldDim, flat);
  }
  // 项链
  for (let i = 0; i < 5; i++) {
    for (const sd of [-1, 1]) {
      box(g, 0.1 * s, 0.1 * s, 0.06 * s, sd * (0.34 - i * 0.05) * s, (2.52 - i * 0.1) * s, 0.39 * s, M.gold, flat);
    }
  }
  box(g, 0.12 * s, 0.14 * s, 0.06 * s, 0, 2.05 * s, 0.4 * s, M.gold, flat);
  // 腰带与青绿披带
  box(g, 1.5 * s, 0.12 * s, 0.9 * s, 0, 1.74 * s, 0.05 * s, M.sashTeal, flat);
  box(g, 0.5 * s, 0.1 * s, 0.04 * s, -0.4 * s, 1.74 * s, 0.51 * s, M.goldDim, flat);

  // 右腿（下垂踏莲）
  beamBetween(g, new THREE.Vector3(-0.18 * s, 1.5 * s, 0.12 * s),
    new THREE.Vector3(-0.56 * s, 1.1 * s, 0.44 * s), 0.26 * s, M.robeCoral, 4);
  box(g, 0.5 * s, 0.34 * s, 0.5 * s, -0.46 * s, 1.2 * s, 0.42 * s, M.robeCoralLight, flat);
  beamBetween(g, new THREE.Vector3(-0.56 * s, 1.04 * s, 0.44 * s),
    new THREE.Vector3(-0.62 * s, 0.56 * s, 0.66 * s), 0.16 * s, M.skinFair, 4);
  box(g, 0.3 * s, 0.08 * s, 0.32 * s, -0.62 * s, 0.58 * s, 0.66 * s, M.gold, flat);
  box(g, 0.28 * s, 0.16 * s, 0.42 * s, -0.64 * s, 0.42 * s, 0.82 * s, M.skinFairLight, flat);
  for (let i = 0; i < 3; i++) {
    box(g, 0.06 * s, 0.08 * s, 0.1 * s, (-0.74 + i * 0.08) * s, 0.36 * s, 1.04 * s, M.skinFairLight, flat);
  }

  // 左腿（屈膝抬起，左手搭膝）
  beamBetween(g, new THREE.Vector3(0.14 * s, 1.5 * s, 0.1 * s),
    new THREE.Vector3(0.76 * s, 1.78 * s, 0.32 * s), 0.27 * s, M.robeCoral, 4);
  box(g, 0.42 * s, 0.4 * s, 0.52 * s, 0.82 * s, 1.82 * s, 0.38 * s, M.robeCoralLight, flat);
  box(g, 0.12 * s, 0.14 * s, 0.12 * s, 0.82 * s, 1.86 * s, 0.64 * s, M.gold, flat);
  beamBetween(g, new THREE.Vector3(0.82 * s, 1.74 * s, 0.34 * s),
    new THREE.Vector3(0.7 * s, 1.02 * s, 0.16 * s), 0.2 * s, M.robeCoralDark, 4);
  box(g, 0.3 * s, 0.08 * s, 0.32 * s, 0.7 * s, 1.0 * s, 0.2 * s, M.gold, flat);
  box(g, 0.28 * s, 0.14 * s, 0.38 * s, 0.7 * s, 0.92 * s, 0.32 * s, M.skinFairLight, flat);

  // 右臂：向外下垂，掌心舒展
  const rSh = new THREE.Vector3(-0.55 * s, 2.46 * s, 0.02 * s);
  const rEl = new THREE.Vector3(-0.96 * s, 2.08 * s, 0.2 * s);
  const rWr = new THREE.Vector3(-1.3 * s, 1.72 * s, 0.36 * s);
  beamBetween(g, rSh, rEl, 0.15 * s, M.skinFair, 4);
  beamBetween(g, rEl, rWr, 0.13 * s, M.skinFair, 4);
  box(g, 0.2 * s, 0.28 * s, 0.2 * s, rEl.x, rEl.y, rEl.z, M.skinFair, flat);
  box(g, 0.26 * s, 0.14 * s, 0.3 * s, rWr.x - 0.04 * s, rWr.y - 0.06 * s, rWr.z, M.skinFairLight, flat);
  for (let i = 0; i < 3; i++) {
    box(g, 0.06 * s, 0.18 * s, 0.07 * s, (-1.44 + i * 0.06) * s, 1.55 * s, (0.36 + i * 0.04) * s, M.skinFairLight, flat);
  }
  box(g, 0.24 * s, 0.08 * s, 0.24 * s, rEl.x, rEl.y, rEl.z, M.gold, flat);
  box(g, 0.22 * s, 0.08 * s, 0.22 * s, rWr.x, rWr.y, rWr.z, M.gold, flat);

  // 左臂：搭在抬起的膝上
  const lSh = new THREE.Vector3(0.55 * s, 2.46 * s, 0.02 * s);
  const lEl = new THREE.Vector3(0.86 * s, 2.22 * s, 0.2 * s);
  const lWr = new THREE.Vector3(0.86 * s, 2.08 * s, 0.46 * s);
  beamBetween(g, lSh, lEl, 0.15 * s, M.skinFair, 4);
  beamBetween(g, lEl, lWr, 0.13 * s, M.skinFair, 4);
  box(g, 0.2 * s, 0.24 * s, 0.2 * s, lEl.x, lEl.y, lEl.z, M.skinFair, flat);
  box(g, 0.28 * s, 0.12 * s, 0.32 * s, 0.86 * s, 2.04 * s, 0.56 * s, M.skinFairLight, flat);
  box(g, 0.24 * s, 0.08 * s, 0.24 * s, lEl.x, lEl.y, lEl.z, M.gold, flat);
  box(g, 0.24 * s, 0.08 * s, 0.24 * s, lWr.x, lWr.y, lWr.z, M.gold, flat);
}

export function createRoyalGuanyin({ scale = 1.55 } = {}) {
  const s = scale;
  const g = new THREE.Group();
  rockThrone(g, s);
  footLotus(g, -0.64 * s, 0.0, 0.9 * s, s);
  royalHalo(g, s);
  royalBody(g, s);
  royalHead(g, s);
  const root = batchStatue(g);
  root.userData.isStatue = true;
  root.userData.statue = { kind: 'royal', opts: { scale } };
  return root;
}

/* 龙女头部：高髻、金饰、红飘带 */
function longnvHead(g, s, cy) {
  const HW = 0.62 * s;
  const HH = 0.72 * s;
  const HD = 0.58 * s;
  const FZ = HD / 2 + 0.03 * s;

  box(g, HW, HH, HD, 0, cy, 0.02 * s, M.skinFair);
  for (const sd of [-1, 1]) {
    box(g, 0.08 * s, 0.4 * s, 0.1 * s, sd * (HW / 2 + 0.04 * s), cy - 0.04 * s, 0.02 * s, M.skinFair, flat);
    box(g, 0.08 * s, 0.12 * s, 0.06 * s, sd * (HW / 2 + 0.04 * s), cy - 0.26 * s, 0.08 * s, M.gold, flat);
  }
  // 黑发
  box(g, HW + 0.04 * s, 0.5 * s, 0.1 * s, 0, cy + 0.05 * s, -HD / 2 - 0.03 * s, M.hair, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.08 * s, 0.5 * s, HD - 0.06 * s, sd * (HW / 2 + 0.02 * s), cy + 0.06 * s, 0.02 * s, M.hair, flat);
  }
  box(g, HW + 0.02 * s, 0.14 * s, 0.08 * s, 0, cy + 0.26 * s, FZ - 0.02 * s, M.hair, flat);
  // 五官
  for (const sd of [-1, 1]) {
    box(g, 0.16 * s, 0.03 * s, 0.03 * s, sd * 0.13 * s, cy + 0.03 * s, FZ, M.lacquerDark, flat);
    box(g, 0.13 * s, 0.025 * s, 0.03 * s, sd * 0.14 * s, cy + 0.13 * s, FZ, M.hair, flat);
  }
  box(g, 0.07 * s, 0.16 * s, 0.06 * s, 0, cy - 0.04 * s, FZ + 0.02 * s, M.skinFairLight, flat);
  box(g, 0.16 * s, 0.05 * s, 0.035 * s, 0, cy - 0.16 * s, FZ, M.ribbonRed, flat);
  // 高髻与金冠
  box(g, 0.66 * s, 0.14 * s, 0.6 * s, 0, cy + HH / 2 + 0.03 * s, 0.02 * s, M.voxGoldDeep, flat);
  box(g, 0.5 * s, 0.42 * s, 0.44 * s, 0, cy + HH / 2 + 0.26 * s, -0.02 * s, M.hair, flat);
  box(g, 0.34 * s, 0.3 * s, 0.3 * s, 0, cy + HH / 2 + 0.48 * s, -0.02 * s, M.hair, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.1 * s, 0.34 * s, 0.1 * s, sd * 0.2 * s, cy + HH / 2 + 0.36 * s, 0.14 * s, M.gold, flat);
    box(g, 0.07 * s, 0.9 * s, 0.05 * s, sd * 0.36 * s, cy - 0.2 * s, -0.1 * s, M.ribbonRed, flat);
  }
  box(g, 0.12 * s, 0.12 * s, 0.12 * s, 0, cy + HH / 2 + 0.68 * s, 0.02 * s, M.gold, flat);
}

/* 龙女：立姿，双手合十，彩色衣裙 */
function longnvBody(g, s) {
  const y0 = 0.42 * s;
  for (const sd of [-1, 1]) {
    box(g, 0.24 * s, 0.12 * s, 0.34 * s, sd * 0.17 * s, y0 + 0.06 * s, 0.08 * s, M.skinFairLight, flat);
  }
  // 长裙
  box(g, 0.9 * s, 1.72 * s, 0.54 * s, 0, y0 + 0.9 * s, 0.02 * s, M.robeCoralLight);
  box(g, 0.94 * s, 0.09 * s, 0.58 * s, 0, y0 + 0.08 * s, 0.02 * s, M.gold, flat);
  for (let i = -2; i <= 2; i++) {
    box(g, 0.06 * s, 1.5 * s, 0.56 * s, i * 0.17 * s, y0 + 0.92 * s, 0.03 * s,
      i % 2 ? M.robeCoral : M.robeCoralDark, flat);
  }
  // 腰带与披帛
  box(g, 0.96 * s, 0.14 * s, 0.58 * s, 0, y0 + 1.62 * s, 0.03 * s, M.sashTeal, flat);
  box(g, 0.3 * s, 0.6 * s, 0.06 * s, -0.34 * s, y0 + 1.28 * s, 0.3 * s, M.sashTealDark, flat);
  box(g, 0.22 * s, 0.5 * s, 0.06 * s, 0.38 * s, y0 + 1.32 * s, 0.3 * s, M.sashTeal, flat);
  // 上身
  box(g, 0.66 * s, 0.78 * s, 0.4 * s, 0, y0 + 2.12 * s, 0.02 * s, M.clothWhite);
  box(g, 0.8 * s, 0.5 * s, 0.46 * s, 0, y0 + 1.98 * s, 0.02 * s, M.robeCoralLight);
  for (const sd of [-1, 1]) {
    box(g, 0.22 * s, 1.0 * s, 0.48 * s, sd * 0.3 * s, y0 + 1.9 * s, 0.03 * s, M.robeCoral);
    box(g, 0.05 * s, 0.96 * s, 0.5 * s, sd * 0.42 * s, y0 + 1.9 * s, 0.03 * s, M.gold, flat);
    box(g, 0.18 * s, 0.9 * s, 0.44 * s, sd * 0.55 * s, y0 + 2.18 * s, 0.01 * s, M.sashTeal, flat);
  }
  box(g, 1.0 * s, 0.2 * s, 0.46 * s, 0, y0 + 2.5 * s, 0.02 * s, M.robeCoral);
  box(g, 0.24 * s, 0.16 * s, 0.24 * s, 0, y0 + 2.65 * s, 0.04 * s, M.skinFair, flat);
  // 手臂合十
  for (const sd of [-1, 1]) {
    beamBetween(g, new THREE.Vector3(sd * 0.5 * s, y0 + 2.5 * s, 0.02 * s),
      new THREE.Vector3(sd * 0.55 * s, y0 + 2.12 * s, 0.12 * s), 0.1 * s, M.skinFair, 4);
    beamBetween(g, new THREE.Vector3(sd * 0.55 * s, y0 + 2.12 * s, 0.12 * s),
      new THREE.Vector3(sd * 0.1 * s, y0 + 2.05 * s, 0.3 * s), 0.09 * s, M.skinFair, 4);
    box(g, 0.16 * s, 0.1 * s, 0.16 * s, sd * 0.5 * s, y0 + 2.36 * s, 0.1 * s, M.gold, flat);
    box(g, 0.14 * s, 0.08 * s, 0.14 * s, sd * 0.22 * s, y0 + 2.06 * s, 0.28 * s, M.gold, flat);
  }
  box(g, 0.14 * s, 0.28 * s, 0.12 * s, -0.055 * s, y0 + 2.08 * s, 0.33 * s, M.skinFairLight, flat);
  box(g, 0.14 * s, 0.28 * s, 0.12 * s, 0.055 * s, y0 + 2.08 * s, 0.33 * s, M.skinFairLight, flat);
  box(g, 0.1 * s, 0.1 * s, 0.08 * s, 0, y0 + 2.14 * s, 0.4 * s, M.clothWhite, flat);
  longnvHead(g, s, y0 + 2.86 * s);
}

/* 善财头部：童子光头、小髻、红飘带 */
function shancaiHead(g, s, cy) {
  const HW = 0.62 * s;
  const HH = 0.7 * s;
  const HD = 0.58 * s;
  const FZ = HD / 2 + 0.03 * s;

  box(g, HW, HH, HD, 0, cy, 0.02 * s, M.skinFair);
  box(g, HW + 0.02 * s, 0.12 * s, HD - 0.06 * s, 0, cy + 0.22 * s, 0, M.skinFairLight, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.1 * s, 0.18 * s, 0.12 * s, sd * (HW / 2 + 0.02 * s), cy + 0.02 * s, -0.02 * s, M.hair, flat);
    box(g, 0.08 * s, 0.16 * s, 0.08 * s, sd * (HW / 2 + 0.04 * s), cy - 0.08 * s, 0.02 * s, M.gold, flat);
  }
  for (const sd of [-1, 1]) {
    box(g, 0.16 * s, 0.035 * s, 0.03 * s, sd * 0.13 * s, cy + 0.03 * s, FZ, M.lacquerDark, flat);
    box(g, 0.14 * s, 0.025 * s, 0.03 * s, sd * 0.14 * s, cy + 0.14 * s, FZ, M.hair, flat);
  }
  box(g, 0.07 * s, 0.15 * s, 0.06 * s, 0, cy - 0.04 * s, FZ + 0.02 * s, M.skinFairLight, flat);
  box(g, 0.16 * s, 0.05 * s, 0.035 * s, 0, cy - 0.15 * s, FZ, M.ribbonRed, flat);
  // 小髻与红飘带
  box(g, 0.12 * s, 0.16 * s, 0.12 * s, 0, cy + HH / 2 + 0.08 * s, -0.02 * s, M.hair, flat);
  box(g, 0.08 * s, 0.1 * s, 0.08 * s, 0, cy + HH / 2 + 0.2 * s, -0.02 * s, M.gold, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.06 * s, 0.7 * s, 0.04 * s, sd * 0.16 * s, cy + 0.1 * s, -0.22 * s, M.ribbonRed, flat);
  }
}

/* 善财：赤膊童子，双手合十，向观音方向前倾 */
function shancaiBody(g, s) {
  const y0 = 0.42 * s;
  for (const sd of [-1, 1]) {
    box(g, 0.26 * s, 0.68 * s, 0.3 * s, sd * 0.18 * s, y0 + 0.36 * s, sd * 0.02 * s, M.skinFair, flat);
    box(g, 0.28 * s, 0.08 * s, 0.32 * s, sd * 0.18 * s, y0 + 0.72 * s, sd * 0.02 * s, M.gold, flat);
    box(g, 0.28 * s, 0.12 * s, 0.4 * s, sd * 0.18 * s, y0 + 0.06 * s, 0.08 * s, M.skinFairLight, flat);
  }
  // 短裙
  box(g, 0.8 * s, 0.76 * s, 0.5 * s, 0, y0 + 1.05 * s, 0.02 * s, M.robeCoral);
  box(g, 0.86 * s, 0.1 * s, 0.54 * s, 0, y0 + 0.72 * s, 0.02 * s, M.gold, flat);
  box(g, 0.3 * s, 0.62 * s, 0.1 * s, 0, y0 + 0.9 * s, 0.28 * s, M.robeCoralLight, flat);
  box(g, 0.1 * s, 0.56 * s, 0.06 * s, 0, y0 + 0.9 * s, 0.34 * s, M.gold, flat);
  box(g, 0.84 * s, 0.14 * s, 0.52 * s, 0, y0 + 1.44 * s, 0.02 * s, M.sashTeal, flat);
  box(g, 0.16 * s, 0.6 * s, 0.08 * s, 0.36 * s, y0 + 1.1 * s, 0.2 * s, M.sashTealDark, flat);

  // 上身：前倾
  const upper = new THREE.Group();
  upper.position.set(0, y0 + 1.5 * s, 0);
  upper.rotation.x = 0.2;
  g.add(upper);
  box(upper, 0.72 * s, 0.82 * s, 0.46 * s, 0, 0.45 * s, 0, M.skinFair);
  box(upper, 0.78 * s, 0.16 * s, 0.5 * s, 0, 0.8 * s, 0, M.skinFairLight, flat);
  // 斜挎帛带
  const strap = box(upper, 0.16 * s, 1.0 * s, 0.08 * s, -0.12 * s, 0.5 * s, 0.24 * s, M.sashTeal, flat);
  strap.rotation.z = -0.38;
  // 项链
  for (let i = 0; i < 3; i++) {
    box(upper, 0.08 * s, 0.08 * s, 0.05 * s, -0.12 * s, 0.72 * s - i * 0.06 * s, 0.24 * s, M.gold, flat);
    box(upper, 0.08 * s, 0.08 * s, 0.05 * s, 0.12 * s, 0.72 * s - i * 0.06 * s, 0.24 * s, M.gold, flat);
  }
  box(upper, 0.1 * s, 0.1 * s, 0.05 * s, 0, 0.5 * s, 0.25 * s, M.gold, flat);
  // 合十双臂
  for (const sd of [-1, 1]) {
    const sh = new THREE.Vector3(sd * 0.38 * s, 0.9 * s, 0);
    const el = new THREE.Vector3(sd * 0.52 * s, 0.62 * s, 0.2 * s);
    const wr = new THREE.Vector3(sd * 0.08 * s, 0.66 * s, 0.36 * s);
    beamBetween(upper, sh, el, 0.09 * s, M.skinFair, 4);
    beamBetween(upper, el, wr, 0.08 * s, M.skinFair, 4);
    box(upper, 0.14 * s, 0.08 * s, 0.14 * s, sd * 0.48 * s, 0.68 * s, 0.2 * s, M.gold, flat);
  }
  box(upper, 0.12 * s, 0.3 * s, 0.12 * s, -0.05 * s, 0.72 * s, 0.4 * s, M.skinFairLight, flat);
  box(upper, 0.12 * s, 0.3 * s, 0.12 * s, 0.05 * s, 0.72 * s, 0.4 * s, M.skinFairLight, flat);
  box(upper, 0.22 * s, 0.16 * s, 0.22 * s, 0, 0.98 * s, 0.02 * s, M.skinFair, flat);
  shancaiHead(upper, s, 1.12 * s);
}

export function createAttendant({ variant = 'longnv', scale = 1 } = {}) {
  const s = scale;
  const g = new THREE.Group();
  attendantLotus(g, s);
  if (variant === 'shancai') shancaiBody(g, s);
  else longnvBody(g, s);
  const root = batchStatue(g);
  root.userData.isStatue = true;
  root.userData.statue = { kind: 'attendant', opts: { variant, scale } };
  return root;
}

/* ======================= 天王殿：弥勒佛与四大天王 ======================= */
/**
 * 参考径山寺天王殿实景：中奉弥勒佛，东西两侧各两尊天王，
 * 天王坐于岩座之上，全身金铜甲胄，各持琵琶、宝剑、龙蛇、宝伞。
 * 继续以方块与方梁堆叠，保持体素风。
 */

/* 弥勒佛头部：螺发高肉髻、红色白毫、垂目含笑 */
function maitreyaHead(g, s) {
  const hy = 3.06 * s;
  const HW = 0.9 * s;
  const HH = 0.88 * s;
  const HD = 0.8 * s;
  const FZ = HD / 2 + 0.03 * s;

  // 颈
  box(g, 0.44 * s, 0.24 * s, 0.42 * s, 0, 2.68 * s, 0.02 * s, M.voxGold, flat);
  // 头
  box(g, HW, HH, HD, 0, hy, 0.02 * s, M.voxGold);

  // 耳与耳垂
  for (const sd of [-1, 1]) {
    box(g, 0.13 * s, 0.46 * s, 0.18 * s, sd * (HW / 2 + 0.05 * s), hy - 0.02 * s, 0.02 * s, M.voxGold, flat);
    box(g, 0.16 * s, 0.16 * s, 0.2 * s, sd * (HW / 2 + 0.05 * s), hy - 0.3 * s, 0.02 * s, M.voxGoldLight, flat);
  }

  // 螺发：贴着头骨层层收分的圆顶（不前出檐，避免像帽子）
  const cap = [
    // 头骨上的螺发，向上收分
    [0.98, 0.11, 0.84, 0.27],
    [0.94, 0.11, 0.8, 0.36],
    [0.86, 0.1, 0.72, 0.44],
    [0.72, 0.09, 0.6, 0.5],
    // 高肉髻：收腰后再圆隆，形成髻而非尖帽
    [0.4, 0.1, 0.36, 0.57],
    [0.48, 0.1, 0.42, 0.66],
    [0.52, 0.1, 0.44, 0.75],
    [0.5, 0.1, 0.42, 0.84],
    [0.42, 0.09, 0.36, 0.92],
    [0.3, 0.09, 0.26, 1.0],
    [0.18, 0.08, 0.16, 1.07],
  ];
  for (const [w, h, d, yy] of cap) {
    box(g, w * s, h * s, d * s, 0, hy + yy * s, -0.01 * s, M.hairBrown, flat);
  }
  // 额前发际与两鬓
  box(g, HW + 0.02 * s, 0.16 * s, 0.06 * s, 0, hy + 0.31 * s, FZ - 0.03 * s, M.hairBrown, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.1 * s, 0.34 * s, 0.5 * s, sd * (HW / 2 + 0.02 * s), hy + 0.14 * s, -0.08 * s, M.hairBrown, flat);
  }
  // 螺发小卷：沿发际排两排，做出卷发质感
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 7; i++) {
      box(g, 0.075 * s, 0.075 * s, 0.07 * s,
        (i - 3) * 0.125 * s, hy + (0.255 + row * 0.085) * s, FZ + 0.01 * s, M.hairBrown, flat);
    }
  }

  // 白毫（宝石）
  box(g, 0.1 * s, 0.1 * s, 0.05 * s, 0, hy + 0.19 * s, FZ + 0.03 * s, M.gemRed, flat);

  // 眉与垂目
  for (const sd of [-1, 1]) {
    const b = box(g, 0.26 * s, 0.05 * s, 0.05 * s, sd * 0.2 * s, hy + 0.08 * s, FZ, M.hairBrown, flat);
    b.rotation.z = -sd * 0.12;
    const e = box(g, 0.22 * s, 0.035 * s, 0.05 * s, sd * 0.19 * s, hy - 0.05 * s, FZ, M.lacquerDark, flat);
    e.rotation.z = -sd * 0.06;
    box(g, 0.14 * s, 0.11 * s, 0.05 * s, sd * 0.29 * s, hy - 0.01 * s, FZ, M.voxGoldLight, flat);
  }

  // 鼻
  box(g, 0.12 * s, 0.18 * s, 0.09 * s, 0, hy - 0.13 * s, FZ + 0.03 * s, M.voxGoldLight, flat);
  box(g, 0.16 * s, 0.05 * s, 0.06 * s, 0, hy - 0.23 * s, FZ + 0.02 * s, M.voxGold, flat);

  // 含笑：嘴角上扬
  box(g, 0.22 * s, 0.045 * s, 0.05 * s, 0, hy - 0.32 * s, FZ, M.lacquerDark, flat);
  for (const sd of [-1, 1]) {
    const c = box(g, 0.09 * s, 0.04 * s, 0.05 * s, sd * 0.13 * s, hy - 0.3 * s, FZ, M.lacquerDark, flat);
    c.rotation.z = -sd * 0.5;
  }
  // 双下巴
  box(g, 0.5 * s, 0.12 * s, 0.3 * s, 0, hy - 0.45 * s, 0.17 * s, M.voxGoldLight, flat);
}

/* 弥勒佛：金身、宝珠莲台、大背光，右手施无畏印、左手禅定 */
function maitreyaBody(g, s) {
  /* ---------- 宝珠莲台 ---------- */
  box(g, 2.6 * s, 0.3 * s, 1.8 * s, 0, 0.15 * s, 0, M.voxGoldDeep);
  box(g, 2.72 * s, 0.06 * s, 1.92 * s, 0, 0.33 * s, 0, M.voxGoldLight, flat);
  // 方座正面宝珠
  const baseGems = [M.gemRed, M.gemBlue, M.gemTeal, M.gemBlue, M.gemRed];
  for (let i = 0; i < baseGems.length; i++) {
    box(g, 0.12 * s, 0.12 * s, 0.06 * s, (i - 2) * 0.42 * s, 0.16 * s, 0.91 * s, baseGems[i], flat);
  }

  // 两重莲瓣，部分莲瓣嵌宝珠
  const petalRing = (count, rx, rz, y, w, h, d) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const pg = new THREE.Group();
      pg.position.set(Math.cos(a) * rx, y, Math.sin(a) * rz);
      pg.rotation.y = -a + Math.PI / 2;
      g.add(pg);
      box(pg, w * s, h * s, d * s, 0, 0, 0, M.voxGold, flat);
      box(pg, w * 0.7 * s, h * 0.28 * s, d * 0.5 * s, 0, h * 0.3 * s, d * 0.28 * s, M.voxGoldLight, flat);
      if (i % 3 === 0) {
        box(pg, 0.1 * s, 0.1 * s, 0.06 * s, 0, 0, (d * 0.5 + 0.02) * s,
          [M.gemTeal, M.gemBlue, M.gemRed][i % 3], flat);
      }
    }
  };
  petalRing(12, 1.16 * s, 0.8 * s, 0.56 * s, 0.48, 0.3, 0.32);
  petalRing(10, 0.94 * s, 0.64 * s, 0.72 * s, 0.42, 0.26, 0.28);

  // 莲台面
  box(g, 1.94 * s, 0.2 * s, 1.24 * s, 0, 0.88 * s, 0, M.voxGoldDeep, flat);
  box(g, 1.74 * s, 0.08 * s, 1.06 * s, 0, 0.99 * s, 0, M.voxGold, flat);

  /* ---------- 结跏趺坐 ---------- */
  box(g, 1.8 * s, 0.42 * s, 1.1 * s, 0, 1.2 * s, 0.02 * s, M.voxGold);
  for (const sd of [-1, 1]) {
    box(g, 0.9 * s, 0.44 * s, 1.08 * s, sd * 0.66 * s, 1.32 * s, 0.04 * s, M.voxGold);
    box(g, 0.66 * s, 0.3 * s, 0.66 * s, sd * 0.84 * s, 1.48 * s, 0.14 * s, M.voxGoldLight, flat);
  }
  // 交叠的小腿与足
  box(g, 1.5 * s, 0.26 * s, 0.46 * s, 0, 1.4 * s, 0.48 * s, M.voxGold);
  box(g, 1.15 * s, 0.18 * s, 0.4 * s, 0, 1.56 * s, 0.5 * s, M.voxGoldLight, flat);
  box(g, 0.3 * s, 0.16 * s, 0.26 * s, -0.1 * s, 1.5 * s, 0.66 * s, M.voxGoldLight, flat);

  /* ---------- 躯干与袈裟 ---------- */
  box(g, 1.3 * s, 1.05 * s, 0.9 * s, 0, 2.0 * s, 0.02 * s, M.voxGold);
  box(g, 1.8 * s, 0.3 * s, 0.96 * s, 0, 2.3 * s, 0.0 * s, M.voxGold);
  // 双肩与两肋的深金袈裟
  for (const sd of [-1, 1]) {
    box(g, 0.46 * s, 1.4 * s, 0.92 * s, sd * 0.64 * s, 2.0 * s, 0.0 * s, M.voxGoldDeep);
    box(g, 0.09 * s, 1.4 * s, 0.94 * s, sd * 0.88 * s, 2.0 * s, 0.0 * s, M.voxGoldLight, flat);
    box(g, 0.4 * s, 0.16 * s, 0.98 * s, sd * 0.62 * s, 2.38 * s, 0.0 * s, M.voxGoldLight, flat);
  }
  // V 领
  for (let i = 0; i < 7; i++) {
    for (const sd of [-1, 1]) {
      box(g, 0.13 * s, 0.11 * s, 0.06 * s,
        sd * (0.5 - i * 0.062) * s, (2.32 - i * 0.1) * s, 0.47 * s, M.voxGoldLight, flat);
    }
  }
  // 胸前宝珠
  box(g, 0.11 * s, 0.11 * s, 0.05 * s, 0, 2.16 * s, 0.47 * s, M.gemBlue, flat);
  box(g, 0.09 * s, 0.09 * s, 0.05 * s, 0, 1.99 * s, 0.47 * s, M.gemTeal, flat);
  // 腰带与结
  box(g, 1.55 * s, 0.16 * s, 0.94 * s, 0, 1.66 * s, 0.02 * s, M.voxGoldDeep, flat);
  box(g, 0.26 * s, 0.18 * s, 0.08 * s, 0, 1.66 * s, 0.51 * s, M.voxGoldLight, flat);

  /* ---------- 右手：施无畏印 ---------- */
  const rSh = new THREE.Vector3(-0.86 * s, 2.3 * s, 0.1 * s);
  const rEl = new THREE.Vector3(-1.12 * s, 1.88 * s, 0.3 * s);
  const rWr = new THREE.Vector3(-0.98 * s, 2.36 * s, 0.48 * s);
  beamBetween(g, rSh, rEl, 0.15 * s, M.voxGold, 4);
  beamBetween(g, rEl, rWr, 0.12 * s, M.voxGold, 4);
  box(g, 0.3 * s, 0.4 * s, 0.12 * s, -0.98 * s, 2.56 * s, 0.56 * s, M.voxGoldLight, flat);
  for (let i = 0; i < 4; i++) {
    box(g, 0.055 * s, 0.24 * s, 0.1 * s, (-0.98 + (i - 1.5) * 0.07) * s, 2.86 * s, 0.57 * s, M.voxGoldLight, flat);
  }
  box(g, 0.08 * s, 0.12 * s, 0.1 * s, -0.78 * s, 2.5 * s, 0.58 * s, M.voxGoldLight, flat);

  /* ---------- 左手：禅定仰掌 ---------- */
  const lSh = new THREE.Vector3(0.86 * s, 2.3 * s, 0.1 * s);
  const lEl = new THREE.Vector3(1.08 * s, 1.9 * s, 0.28 * s);
  const lWr = new THREE.Vector3(0.64 * s, 1.62 * s, 0.5 * s);
  beamBetween(g, lSh, lEl, 0.15 * s, M.voxGold, 4);
  beamBetween(g, lEl, lWr, 0.12 * s, M.voxGold, 4);
  box(g, 0.34 * s, 0.1 * s, 0.32 * s, 0.5 * s, 1.56 * s, 0.58 * s, M.voxGoldLight, flat);
  for (let i = 0; i < 4; i++) {
    box(g, 0.06 * s, 0.06 * s, 0.2 * s, (0.5 + (i - 1.5) * 0.078) * s, 1.57 * s, 0.78 * s, M.voxGoldLight, flat);
  }

  /* ---------- 大背光：金色拱形，缘饰宝珠 ---------- */
  const back = -0.64 * s;
  const y0 = 0.92 * s;
  const y1 = 4.3 * s;
  const halfW = 1.7 * s;
  const rows = 24;
  const dy = (y1 - y0) / rows;
  const prof = (t) => halfW * Math.pow(Math.sin(Math.PI * t), 0.68);
  for (let i = 0; i < rows; i++) {
    const t = (i + 0.5) / rows;
    const hw = prof(t);
    if (hw < 0.22 * s) continue;
    const y = y0 + dy * (i + 0.5);
    box(g, hw * 2, dy * 1.02, 0.2 * s, 0, y, back, M.voxGoldDeep, flat);
    // 内圈细金线，压住深金底，避免整片过亮
    box(g, 0.08 * s, dy * 1.02, 0.07 * s, -hw + 0.28 * s, y, back + 0.12 * s, M.voxGoldLight, flat);
    box(g, 0.08 * s, dy * 1.02, 0.07 * s, hw - 0.28 * s, y, back + 0.12 * s, M.voxGoldLight, flat);
    box(g, 0.13 * s, dy * 1.02, 0.26 * s, -hw + 0.065 * s, y, back + 0.02 * s, M.voxGoldLight, flat);
    box(g, 0.13 * s, dy * 1.02, 0.26 * s, hw - 0.065 * s, y, back + 0.02 * s, M.voxGoldLight, flat);
  }
  const gemSeq = [M.gemTeal, M.gemRed, M.gemBlue, M.gemTeal, M.gemRed, M.gemBlue, M.gemRed, M.gemTeal];
  let gi = 0;
  for (let i = 2; i < rows - 2; i += 2) {
    const t = (i + 0.5) / rows;
    const hw = prof(t);
    if (hw < 0.5 * s) continue;
    const y = y0 + dy * (i + 0.5);
    for (const sd of [-1, 1]) {
      box(g, 0.14 * s, 0.14 * s, 0.07 * s, sd * (hw - 0.12 * s), y, back + 0.2 * s,
        gemSeq[gi++ % gemSeq.length], flat);
    }
  }
  // 头光：头部后方的金色圆盘，把视线聚到头面部
  const haloC = 3.06 * s;
  const haloR = 0.98 * s;
  const haloRows = 12;
  for (let i = 0; i < haloRows; i++) {
    const tt = (i + 0.5) / haloRows;
    const yy = haloC - haloR + tt * haloR * 2;
    const half = Math.sqrt(Math.max(0, haloR * haloR - Math.pow((tt - 0.5) * haloR * 2, 2)));
    if (half < 0.06 * s) continue;
    box(g, half * 2, (haloR * 2 / haloRows) * 1.04, 0.1 * s, 0, yy, back + 0.11 * s, M.voxGold, flat);
  }
  // 顶部宝珠
  box(g, 0.3 * s, 0.16 * s, 0.24 * s, 0, y1 + 0.08 * s, back, M.voxGoldLight, flat);
  box(g, 0.18 * s, 0.16 * s, 0.18 * s, 0, y1 + 0.24 * s, back, M.voxGold, flat);
  box(g, 0.12 * s, 0.12 * s, 0.12 * s, 0, y1 + 0.38 * s, back, M.gemRed, flat);

  maitreyaHead(g, s);
}

export function createMaitreya({ scale = 1.6 } = {}) { return createBudai(scale); }

/* 天王岩座 */
function kingRockBase(g, s) {
  box(g, 1.9 * s, 0.26 * s, 1.6 * s, 0, 0.13 * s, 0, M.stoneDark, flat);
  box(g, 1.5 * s, 0.24 * s, 1.24 * s, 0, 0.38 * s, -0.05 * s, M.woodDark, flat);
  const rocks = [
    [-0.86, 0.22, 0.36, 0.44, 0.4, 0.5],
    [0.88, 0.24, 0.3, 0.5, 0.44, 0.46],
    [-0.6, 0.4, 0.62, 0.4, 0.24, 0.36],
    [0.62, 0.46, 0.6, 0.36, 0.2, 0.34],
    [0, 0.3, 0.7, 0.5, 0.22, 0.3],
  ];
  for (const [x, y, z, w, h, d] of rocks) {
    box(g, w * s, h * s, d * s, x * s, y * s, z * s, M.stoneDark, flat);
  }
  box(g, 1.46 * s, 0.08 * s, 1.2 * s, 0, 0.55 * s, 0, M.lacquerDark, flat);
  box(g, 1.2 * s, 0.06 * s, 0.96 * s, 0, 0.61 * s, 0.04 * s, M.voxGoldDeep, flat);
}

/* 天王头部：怒目、短须、宝冠头盔 */
function kingHead(g, s, hy) {
  const HW = 0.66 * s;
  const HH = 0.7 * s;
  const HD = 0.64 * s;
  const FZ = HD / 2 + 0.03 * s;

  box(g, 0.4 * s, 0.2 * s, 0.4 * s, 0, hy - HH / 2 - 0.16 * s, 0.02 * s, M.voxGoldLight, flat);
  box(g, HW, HH, HD, 0, hy, 0.02 * s, M.voxGoldLight);
  for (const sd of [-1, 1]) {
    box(g, 0.1 * s, 0.34 * s, 0.14 * s, sd * (HW / 2 + 0.04 * s), hy - 0.04 * s, 0.02 * s, M.voxGoldLight, flat);
    box(g, 0.12 * s, 0.1 * s, 0.06 * s, sd * (HW / 2 + 0.04 * s), hy - 0.22 * s, 0.06 * s, M.gold, flat);
  }
  // 怒眉与圆眼
  for (const sd of [-1, 1]) {
    const b = box(g, 0.28 * s, 0.1 * s, 0.06 * s, sd * 0.17 * s, hy + 0.18 * s, FZ, M.hair, flat);
    b.rotation.z = sd * 0.34;
    box(g, 0.18 * s, 0.13 * s, 0.05 * s, sd * 0.16 * s, hy + 0.03 * s, FZ, M.clothWhite, flat);
    box(g, 0.08 * s, 0.09 * s, 0.05 * s, sd * 0.12 * s, hy + 0.02 * s, FZ + 0.02 * s, M.black, flat);
  }
  box(g, 0.13 * s, 0.2 * s, 0.1 * s, 0, hy - 0.07 * s, FZ + 0.03 * s, M.skinFair, flat);
  // 张口露齿
  box(g, 0.36 * s, 0.14 * s, 0.06 * s, 0, hy - 0.3 * s, FZ, M.lacquerDark, flat);
  box(g, 0.3 * s, 0.04 * s, 0.05 * s, 0, hy - 0.26 * s, FZ + 0.02 * s, M.clothWhite, flat);
  // 八字胡与短须
  for (const sd of [-1, 1]) {
    const m = box(g, 0.16 * s, 0.06 * s, 0.05 * s, sd * 0.16 * s, hy - 0.2 * s, FZ + 0.01 * s, M.hair, flat);
    m.rotation.z = sd * -0.3;
  }
  box(g, 0.3 * s, 0.26 * s, 0.1 * s, 0, hy - 0.5 * s, 0.24 * s, M.hair, flat);

  // 头盔：金箍、冠叶、护耳
  const crownY = hy + HH / 2 + 0.02 * s;
  box(g, HW + 0.12 * s, 0.14 * s, HD + 0.1 * s, 0, crownY, 0.02 * s, M.voxGoldDeep, flat);
  box(g, HW + 0.02 * s, 0.3 * s, HD - 0.02 * s, 0, crownY + 0.2 * s, 0.02 * s, M.voxGold, flat);
  box(g, 0.24 * s, 0.2 * s, 0.08 * s, 0, crownY + 0.17 * s, FZ + 0.01 * s, M.gold, flat);
  for (const sd of [-1, 1]) {
    box(g, 0.1 * s, 0.34 * s, 0.08 * s, sd * 0.2 * s, crownY + 0.42 * s, FZ - 0.02 * s, M.gold, flat);
    box(g, 0.26 * s, 0.4 * s, 0.12 * s, sd * (HW / 2 + 0.1 * s), crownY - 0.12 * s, 0.02 * s, M.voxGoldDeep, flat);
  }
  box(g, 0.12 * s, 0.3 * s, 0.1 * s, 0, crownY + 0.58 * s, FZ - 0.02 * s, M.ribbonRed, flat);
}

/* 天王身体：甲胄坐姿 */
function kingBody(g, s) {
  // 双腿：右腿下垂、左膝抬起
  box(g, 1.0 * s, 0.5 * s, 1.0 * s, 0.52 * s, 0.92 * s, 0.12 * s, M.voxGold);
  box(g, 0.46 * s, 0.14 * s, 0.5 * s, 0.52 * s, 1.2 * s, 0.3 * s, M.voxGoldDeep, flat);
  beamBetween(g, new THREE.Vector3(0.5 * s, 0.9 * s, 0.24 * s),
    new THREE.Vector3(0.58 * s, 0.56 * s, 0.5 * s), 0.2 * s, M.voxGold, 4);
  box(g, 0.32 * s, 0.2 * s, 0.42 * s, 0.58 * s, 0.42 * s, 0.62 * s, M.voxGoldDeep, flat);
  beamBetween(g, new THREE.Vector3(-0.16 * s, 1.02 * s, 0.08 * s),
    new THREE.Vector3(-0.6 * s, 0.72 * s, 0.42 * s), 0.22 * s, M.voxGold, 4);
  box(g, 0.36 * s, 0.28 * s, 0.44 * s, -0.64 * s, 0.52 * s, 0.55 * s, M.voxGoldDeep, flat);

  // 裙甲与护腹
  box(g, 1.0 * s, 0.62 * s, 0.92 * s, 0, 1.06 * s, 0.04 * s, M.voxGold);
  for (let i = -2; i <= 2; i++) {
    box(g, 0.14 * s, 0.5 * s, 0.06 * s, i * 0.2 * s, 1.06 * s, 0.5 * s, M.voxGoldDeep, flat);
  }
  box(g, 1.12 * s, 0.16 * s, 0.98 * s, 0, 1.36 * s, 0.03 * s, M.voxGoldDeep, flat);
  // 胸甲
  box(g, 1.06 * s, 0.94 * s, 0.72 * s, 0, 1.92 * s, 0.02 * s, M.voxGold);
  box(g, 0.46 * s, 0.46 * s, 0.12 * s, 0, 1.98 * s, 0.4 * s, M.voxGoldDeep, flat);
  box(g, 0.26 * s, 0.26 * s, 0.08 * s, 0, 1.98 * s, 0.47 * s, M.voxGoldDeep, flat);
  // 肩甲
  for (const sd of [-1, 1]) {
    box(g, 0.52 * s, 0.32 * s, 0.94 * s, sd * 0.78 * s, 2.34 * s, 0, M.voxGold);
    box(g, 0.56 * s, 0.1 * s, 0.98 * s, sd * 0.78 * s, 2.5 * s, 0, M.voxGoldDeep, flat);
    box(g, 0.16 * s, 0.16 * s, 0.16 * s, sd * 0.78 * s, 2.56 * s, 0.3 * s, M.gold, flat);
  }
  // 披膊与飘带
  for (const sd of [-1, 1]) {
    box(g, 0.06 * s, 1.5 * s, 0.3 * s, sd * 0.66 * s, 1.6 * s, -0.5 * s, M.sashTealDark, flat);
  }
  box(g, 0.5 * s, 0.3 * s, 0.5 * s, 0, 2.56 * s, 0.02 * s, M.voxGoldLight, flat);

  // 右臂持法器
  beamBetween(g, new THREE.Vector3(-0.8 * s, 2.3 * s, 0.02 * s),
    new THREE.Vector3(-1.02 * s, 1.8 * s, 0.24 * s), 0.15 * s, M.voxGold, 4);
  beamBetween(g, new THREE.Vector3(-1.02 * s, 1.8 * s, 0.24 * s),
    new THREE.Vector3(-0.92 * s, 1.42 * s, 0.44 * s), 0.12 * s, M.voxGoldDeep, 4);
  box(g, 0.24 * s, 0.16 * s, 0.26 * s, -0.92 * s, 1.34 * s, 0.5 * s, M.voxGoldLight, flat);
  box(g, 0.2 * s, 0.08 * s, 0.22 * s, -0.98 * s, 1.52 * s, 0.4 * s, M.gold, flat);
  // 左臂扶膝
  beamBetween(g, new THREE.Vector3(0.8 * s, 2.3 * s, 0.02 * s),
    new THREE.Vector3(1.0 * s, 1.82 * s, 0.22 * s), 0.15 * s, M.voxGold, 4);
  beamBetween(g, new THREE.Vector3(1.0 * s, 1.82 * s, 0.22 * s),
    new THREE.Vector3(0.84 * s, 1.3 * s, 0.42 * s), 0.12 * s, M.voxGoldDeep, 4);
  box(g, 0.24 * s, 0.16 * s, 0.26 * s, 0.8 * s, 1.24 * s, 0.46 * s, M.voxGoldLight, flat);

  kingHead(g, s, 2.92 * s);
}

/* 法器：琵琶 */
function weaponPipa(g, s) {
  const wg = new THREE.Group();
  wg.position.set(0, 1.9 * s, 0.62 * s);
  wg.rotation.z = -0.5;
  g.add(wg);
  box(wg, 0.52 * s, 0.64 * s, 0.16 * s, 0, -0.24 * s, 0, M.lacquerDark);
  box(wg, 0.44 * s, 0.2 * s, 0.14 * s, 0, 0.12 * s, 0, M.lacquerDark, flat);
  box(wg, 0.16 * s, 0.16 * s, 0.04 * s, 0, -0.24 * s, 0.1 * s, M.voxGoldDeep, flat);
  box(wg, 0.09 * s, 0.86 * s, 0.09 * s, 0, 0.6 * s, 0, M.woodDark);
  box(wg, 0.16 * s, 0.2 * s, 0.1 * s, 0, 1.06 * s, 0, M.voxGoldDeep, flat);
  for (let i = 0; i < 4; i++) {
    box(wg, 0.015 * s, 1.3 * s, 0.02 * s, (-0.15 + i * 0.1) * s, 0.26 * s, 0.09 * s, M.gold, flat);
  }
  box(wg, 0.3 * s, 0.08 * s, 0.08 * s, 0, -0.02 * s, 0.1 * s, M.gold, flat);
}

/* 法器：宝剑 */
function weaponSword(g, s) {
  const wg = new THREE.Group();
  wg.position.set(-0.92 * s, 1.38 * s, 0.5 * s);
  wg.rotation.z = 0.1;
  g.add(wg);
  box(wg, 0.2 * s, 0.2 * s, 0.2 * s, 0, 0, 0, M.gold, flat);
  box(wg, 0.1 * s, 0.34 * s, 0.1 * s, 0, 0.26 * s, 0, M.lacquerDark);
  box(wg, 0.42 * s, 0.09 * s, 0.14 * s, 0, 0.47 * s, 0, M.gold, flat);
  box(wg, 0.14 * s, 1.5 * s, 0.06 * s, 0, 1.26 * s, 0, M.voxGoldLight);
  box(wg, 0.08 * s, 0.2 * s, 0.06 * s, 0, 2.06 * s, 0, M.voxGoldLight, flat);
}

/* 法器：龙蛇 */
function weaponSnake(g, s) {
  const pts = [
    [-0.86, 1.24, 0.52], [-1.0, 1.5, 0.46], [-0.9, 1.76, 0.38],
    [-0.66, 1.98, 0.36], [-0.48, 2.2, 0.44], [-0.4, 2.4, 0.58],
  ];
  for (let i = 0; i < pts.length; i++) {
    const [x, y, z] = pts[i];
    box(g, 0.16 * s, 0.16 * s, 0.16 * s, x * s, y * s, z * s,
      i % 2 ? M.sashTeal : M.waveBlue, flat);
  }
  box(g, 0.22 * s, 0.14 * s, 0.26 * s, -0.38 * s, 2.48 * s, 0.66 * s, M.sashTeal, flat);
  box(g, 0.05 * s, 0.06 * s, 0.05 * s, -0.44 * s, 2.52 * s, 0.8 * s, M.ribbonRed, flat);
  box(g, 0.05 * s, 0.05 * s, 0.05 * s, -0.32 * s, 2.52 * s, 0.8 * s, M.ribbonRed, flat);
}

/* 法器：宝伞 */
function weaponUmbrella(g, s) {
  const wg = new THREE.Group();
  wg.position.set(0.92 * s, 0, 0.16 * s);
  wg.rotation.z = -0.06;
  g.add(wg);
  box(wg, 0.08 * s, 2.55 * s, 0.08 * s, 0, 1.72 * s, 0, M.woodDark);
  for (let i = 0; i < 4; i++) {
    const w = (1.16 - i * 0.26) * s;
    box(wg, w, 0.1 * s, w, 0, (2.7 + i * 0.14) * s, 0,
      i % 2 ? M.robeCoralDark : M.lacquerDark, flat);
  }
  box(wg, 0.16 * s, 0.2 * s, 0.16 * s, 0, 3.24 * s, 0, M.gold, flat);
  box(wg, 0.34 * s, 0.06 * s, 0.34 * s, 0, 1.34 * s, 0, M.gold, flat);
}

const WEAPONS = {
  pipa: weaponPipa,
  sword: weaponSword,
  snake: weaponSnake,
  umbrella: weaponUmbrella,
};

export function createHeavenlyKing({ variant = 'pipa', scale = 1.2 } = {}) {
  const s = scale;
  const g = new THREE.Group();
  kingRockBase(g, s);
  kingBody(g, s);
  (WEAPONS[variant] || weaponPipa)(g, s);
  const root = batchStatue(g);
  root.userData.isStatue = true;
  root.userData.statue = { kind: 'king', opts: { variant, scale } };
  return root;
}
