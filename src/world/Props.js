import * as THREE from 'three';
import { M, plaqueMaterial, verticalPlaqueMaterial } from './Materials.js';

const geoCache = new Map();

function cached(key, make) {
  if (!geoCache.has(key)) {
    const g = make();
    g.userData.shared = true;
    geoCache.set(key, g);
  }
  return geoCache.get(key);
}

const boxGeo = (w, h, d) => cached(`box:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d));

export function box(parent, w, h, d, x, y, z, mat, opts = {}) {
  const m = new THREE.Mesh(boxGeo(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = opts.cast !== false;
  m.receiveShadow = opts.receive !== false;
  parent.add(m);
  return m;
}

/** 圆柱体 → 方块柱（Minecraft 风） */
export function cylinder(parent, rt, rb, h, x, y, z, mat, seg = 12, opts = {}) {
  const w = Math.max(rt, rb) * 2;
  return box(parent, w, h, w, x, y, z, mat, opts);
}

/** 球体 → 方块（按 scale 拉伸成方盒） */
export function sphere(parent, r, x, y, z, mat, scale = [1, 1, 1], opts = {}) {
  return box(parent, r * 2 * scale[0], r * 2 * scale[1], r * 2 * scale[2], x, y, z, mat, opts);
}

/** 圆环 → 四根方条围成的方框 */
export function torus(parent, r, tube, x, y, z, mat, rot = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.set(rot[0], rot[1], rot[2]);
  const t = Math.max(tube * 2, 0.02);
  const o = { cast: false, receive: false };
  box(g, r * 2 + t, t, t, 0, r, 0, mat, o);
  box(g, r * 2 + t, t, t, 0, -r, 0, mat, o);
  box(g, t, r * 2, t, r, 0, 0, mat, o);
  box(g, t, r * 2, t, -r, 0, 0, mat, o);
  parent.add(g);
  return g;
}

export function plane(parent, w, h, x, y, z, mat, rot = [0, 0, 0]) {
  const geo = cached(`plane:${w}:${h}`, () => new THREE.PlaneGeometry(w, h));
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function beamBetween(parent, a, b, radius, mat, seg = 6) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = boxGeo(radius * 2, len, radius * 2);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  parent.add(m);
  return m;
}

/* ------------------------------- roofs ------------------------------ */
/** 阶梯式方块屋顶：逐层内缩的方块堆叠 + 屋脊（Minecraft 风） */
export function hippedRoof(parent, { x = 0, y = 0, z = 0, width, depth, rise, mat = M.roof, edge = M.roofEdge }) {
  const w = width;
  const d = depth;
  const layers = 5;
  const stepH = Math.max(0.16, rise / layers);
  for (let i = 0; i < layers; i++) {
    const k = 1 - (i / layers) * 0.66;
    box(parent, w * k, stepH, d * k, x, y + stepH * (i + 0.5), z, mat, { cast: false });
  }
  const rl = Math.max(width * 0.2, 1.0);
  box(parent, rl, Math.max(0.24, stepH * 0.8), 0.4, x, y + rise + stepH * 0.2, z, edge, { cast: false });
  // 檐口方块
  box(parent, w + 0.16, 0.2, 0.3, x, y + 0.1, z + d / 2, edge, { cast: false });
  box(parent, w + 0.16, 0.2, 0.3, x, y + 0.1, z - d / 2, edge, { cast: false });
  box(parent, 0.3, 0.2, d + 0.16, x - w / 2, y + 0.1, z, edge, { cast: false });
  box(parent, 0.3, 0.2, d + 0.16, x + w / 2, y + 0.1, z, edge, { cast: false });
  return null;
}

export function doubleRoof(parent, { x, y, z, width, depth, rise, gap = 1.1 }) {
  hippedRoof(parent, { x, y, z, width, depth, rise });
  hippedRoof(parent, {
    x, y: y + gap, z, width: width * 0.78, depth: depth * 0.72, rise: rise * 0.8,
  });
}

/* ------------------------------- stairs ----------------------------- */
export function stairs(parent, { x = 0, z0, z1, y0, y1, width = 8, steps = 5, mat = M.stoneStep }) {
  const dz = (z1 - z0) / steps;
  const rise = y1 - y0;
  for (let i = 0; i < steps; i++) {
    const h = Math.max(0.1, y0 + rise * (i + 1) / steps + 0.012);
    box(parent, width, h, Math.abs(dz) + 0.04, x, h / 2, z0 + dz * (i + 0.5), mat, { cast: false });
  }
}

export function balustrade(parent, { x0, x1, z0, z1, y0, y1, mat = M.railingTeal }) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz);
  const n = Math.max(2, Math.round(len / 1.35));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const px = x0 + dx * t;
    const pz = z0 + dz * t;
    const py = y0 + (y1 - y0) * t;
    box(parent, 0.22, 0.96, 0.22, px, py + 0.48, pz, mat, { cast: false });
    box(parent, 0.3, 0.1, 0.3, px, py + 0.98, pz, M.railingTealDark, { cast: false });
  }
  const a = new THREE.Vector3(x0, y0 + 0.92, z0);
  const b = new THREE.Vector3(x1, y1 + 0.92, z1);
  beamBetween(parent, a, b, 0.07, mat, 6);
  const a2 = new THREE.Vector3(x0, y0 + 0.55, z0);
  const b2 = new THREE.Vector3(x1, y1 + 0.55, z1);
  beamBetween(parent, a2, b2, 0.055, mat, 6);
}

/* ------------------------------- facade ----------------------------- */
export function column(parent, { x, y = 0, z, h = 6, radius = 0.36, mat = M.lacquer }) {
  box(parent, radius * 2.6, 0.24, radius * 2.6, x, y + 0.12, z, M.stone, { cast: false });
  box(parent, radius * 2, h, radius * 2, x, y + 0.24 + h / 2, z, mat, { cast: true });
  box(parent, radius * 3.0, 0.22, radius * 3.0, x, y + 0.24 + h + 0.11, z, M.woodDark, { cast: false });
}

export function plaque(parent, name, { x = 0, y = 4.2, z = 0, w = 3.4, h = 1.4, ry = 0 }) {
  const normal = Math.cos(ry) >= 0 ? 1 : -1;
  const frame = box(parent, w + 0.32, h + 0.32, 0.12, x, y, z - 0.06 * normal, M.black, { cast: false });
  frame.userData.isPlaque = true;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), plaqueMaterial(name));
  board.position.set(x, y, z + 0.01 * normal);
  board.rotation.y = ry;
  board.userData.isPlaque = true;
  parent.add(board);
  frame.rotation.y = ry;
  return board;
}

export function plaqueVertical(parent, name, { x = 0, y = 0, z = 0, w = 1.1, h = 2.8, ry = 0 }) {
  const normal = Math.cos(ry) >= 0 ? 1 : -1;
  const frame = box(parent, w + 0.34, h + 0.34, 0.16, x, y, z - 0.07 * normal, M.lacquerDark, { cast: false });
  const gold = box(parent, w + 0.12, h + 0.12, 0.06, x, y, z, M.goldDim, { cast: false });
  frame.userData.isPlaque = true;
  gold.userData.isPlaque = true;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), verticalPlaqueMaterial(name));
  board.position.set(x, y, z + 0.06 * normal);
  board.userData.isPlaque = true;
  board.rotation.y = ry;
  parent.add(board);
  frame.rotation.y = ry;
  gold.rotation.y = ry;
  return board;
}

export function doorSet(parent, { x = 0, y = 0, z, width = 3.2, height = 4.6, open = false }) {
  const k = width / 2;
  const jambT = 0.34;

  if (open) {
    // 敞开的门洞：只留门框与门楣，门扇向外张开
    box(parent, jambT, height + 0.5, 0.34, x - k - jambT / 2, y + (height + 0.5) / 2, z - 0.08, M.woodDark, { cast: false });
    box(parent, jambT, height + 0.5, 0.34, x + k + jambT / 2, y + (height + 0.5) / 2, z - 0.08, M.woodDark, { cast: false });
    box(parent, width + jambT * 2, 0.34, 0.34, x, y + height + 0.33, z - 0.08, M.woodDark, { cast: false });

    const leafGeo = new THREE.BoxGeometry(k - 0.05, height - 0.04, 0.1);
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(x + side * k, y + height / 2, z + 0.06);
      pivot.rotation.y = side * 1.34;
      const leaf = new THREE.Mesh(leafGeo, M.door);
      leaf.position.set(-side * (k / 2 - 0.02), 0, 0);
      leaf.castShadow = false;
      pivot.add(leaf);
      parent.add(pivot);
    }
  } else {
    box(parent, width + 0.6, height + 0.5, 0.32, x, y + (height + 0.5) / 2, z - 0.12, M.woodDark, { cast: false });
    const leafGeo = new THREE.BoxGeometry(k - 0.06, height, 0.12);
    for (const side of [-1, 1]) {
      const leaf = new THREE.Mesh(leafGeo, M.door);
      leaf.position.set(x + side * k / 2, y + height / 2, z + 0.08);
      leaf.castShadow = false;
      parent.add(leaf);
    }
  }

  box(parent, width + 0.9, 0.26, 1.2, x, y + 0.1, z + 0.35, M.stone, { cast: false });
  box(parent, width + 0.9, 0.24, 0.4, x, y + height + 0.28, z + 0.1, M.woodDark, { cast: false });
}

export function latticeWindow(parent, { x, y, z, w = 2.4, h = 3.2, ry = 0 }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  box(g, w + 0.3, h + 0.3, 0.14, 0, h / 2, 0, M.woodDark, { cast: false });
  box(g, w, h, 0.06, 0, h / 2, 0.08, M.wood, { cast: false });
  for (let i = 1; i < 4; i++) {
    box(g, 0.055, h, 0.05, -w / 2 + (w / 4) * i, h / 2, 0.12, M.woodDark, { cast: false });
  }
  for (let i = 1; i < 5; i++) {
    box(g, w, 0.055, 0.05, 0, (h / 5) * i, 0.12, M.woodDark, { cast: false });
  }
  parent.add(g);
  return g;
}

/* ------------------------------- props ------------------------------ */
export function stoneLantern(parent, { x, y, z, scale = 1, light = false }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  box(g, 1.0, 0.3, 1.0, 0, 0.15, 0, M.stoneDark, { cast: false });
  box(g, 0.44, 1.0, 0.44, 0, 0.8, 0, M.stone, { cast: false });
  box(g, 0.72, 0.62, 0.72, 0, 1.36, 0, M.stone, { cast: false });
  box(g, 0.44, 0.4, 0.44, 0, 1.36, 0, M.flame, { cast: false });
  box(g, 0.86, 0.16, 0.86, 0, 1.72, 0, M.roofEdge, { cast: false });
  box(g, 0.62, 0.18, 0.62, 0, 1.88, 0, M.roofEdge, { cast: false });
  box(g, 0.34, 0.18, 0.34, 0, 2.04, 0, M.roofEdge, { cast: false });
  box(g, 0.22, 0.18, 0.22, 0, 2.2, 0, M.stone, { cast: false });
  if (light) {
    const l = new THREE.PointLight(0xffbf72, 5, 9, 2);
    l.position.set(0, 1.45, 0);
    g.add(l);
  }
  parent.add(g);
  return g;
}

export function pineTree(parent, { x, y = 0, z, scale = 1, seed = 1 }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  const r = (n) => {
    const v = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  box(g, 0.5, 2.2, 0.5, 0, 1.1, 0, M.trunk, { cast: false });
  for (let i = 0; i < 4; i++) {
    const rad = 2.9 - i * 0.62;
    const layerMat = i % 2 ? M.pineDark : M.pine;
    box(g, rad, 0.7, rad, r(i) * 0.2, 1.75 + i * 0.8, r(i + 1) * 0.2, layerMat, { cast: false });
  }
  box(g, 0.7, 0.7, 0.7, 0, 5.05, 0, M.pineDark, { cast: false });
  parent.add(g);
  return g;
}

export function rock(parent, { x, y = 0, z, scale = 1, seed = 1 }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 2;
  const s = scale;
  box(g, 1.4 * s, 0.5 * s, 1.1 * s, 0, 0.25 * s, 0, M.slate, { cast: false });
  box(g, 0.9 * s, 0.4 * s, 0.8 * s, 0.2 * s, 0.6 * s, 0.1 * s, M.slate, { cast: false });
  parent.add(g);
  return g;
}

/* ------------------------------- smoke ------------------------------ */
export class Smoke {
  constructor(parent, { x, y, z, count = 7, height = 3.4, spread = 0.55, size = 0.8 }) {
    this.sprites = [];
    this.base = { x, y, z };
    this.height = height;
    this.speed = 0.42;
    for (let i = 0; i < count; i++) {
      const s = new THREE.Sprite(M.smoke);
      s.position.set(x, y, z);
      s.scale.setScalar(size * (0.5 + Math.random() * 0.5));
      s.userData.phase = i / count;
      s.userData.drift = (Math.random() - 0.5) * spread;
      parent.add(s);
      this.sprites.push(s);
    }
  }
  update(dt, t) {
    for (const s of this.sprites) {
      s.userData.phase = (s.userData.phase + dt * this.speed / this.height) % 1;
      const p = s.userData.phase;
      s.position.set(
        this.base.x + s.userData.drift * p,
        this.base.y + p * this.height,
        this.base.z + Math.sin(t * 0.7 + s.userData.drift * 10) * 0.12,
      );
      s.scale.setScalar(0.5 + p * 1.5);
    }
  }
}

export function dustMotes(parent, { w, h, d, count = 140 }) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * w;
    positions[i * 3 + 1] = Math.random() * h;
    positions[i * 3 + 2] = (Math.random() - 0.5) * d;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffe7bc, size: 0.05, transparent: true, opacity: 0.32,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.shared = true;
  parent.add(pts);
  return pts;
}
