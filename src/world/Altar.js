import * as THREE from 'three';
import { M } from './Materials.js';
import { box, cylinder, sphere, torus } from './Props.js';

function candle(parent, x, y, z, flames, scale) {
  cylinder(parent, 0.16 * scale, 0.2 * scale, 0.08 * scale, x, y + 0.04 * scale, z, M.bronze, 10, { cast: false });
  cylinder(parent, 0.045 * scale, 0.06 * scale, 0.5 * scale, x, y + 0.32 * scale, z, M.goldDim, 8, { cast: false });
  cylinder(parent, 0.2 * scale, 0.24 * scale, 0.07 * scale, x, y + 0.6 * scale, z, M.bronze, 12, { cast: false });
  cylinder(parent, 0.075 * scale, 0.085 * scale, 0.34 * scale, x, y + 0.8 * scale, z, M.cloth, 10, { cast: false });
  const fl = box(parent, 0.09 * scale, 0.22 * scale, 0.09 * scale, x, y + 1.06 * scale, z, M.flame, { cast: false, receive: false });
  const core = sphere(parent, 0.045 * scale, x, y + 1.0 * scale, z, M.flameCore, [1, 1.5, 1], { cast: false });
  flames.push({ mesh: fl, core, phase: Math.random() * Math.PI * 2, baseY: y + 1.06 * scale });
}

export function createAltar({ x = 0, z = 0, width = 4.2, scale = 1, y = 0, lightOn = true }) {
  const g = new THREE.Group();
  g.userData.isAltar = true;
  g.position.set(x, y, z);
  const w = width;

  // table
  box(g, w, 0.16, 1.35, 0, 1.16, 0, M.woodDark);
  for (const side of [-1, 1]) {
    box(g, 0.22, 1.1, 0.22, side * (w / 2 - 0.25), 0.55, 0.48, M.woodDark);
    box(g, 0.22, 1.1, 0.22, side * (w / 2 - 0.25), 0.55, -0.48, M.woodDark);
  }
  // carved apron
  box(g, w - 0.18, 0.62, 0.14, 0, 0.72, 0.6, M.wood);
  box(g, w - 0.18, 0.62, 0.14, 0, 0.72, -0.6, M.wood);
  // embroidered cloth
  const cloth = box(g, w * 0.82, 0.5, 0.06, 0, 0.7, 0.685, M.cloth, { cast: false });
  cloth.receiveShadow = false;
  // incense burner
  cylinder(g, 0.3, 0.34, 0.34, 0, 1.42, 0.12, M.bronze, 16);
  cylinder(g, 0.36, 0.3, 0.1, 0, 1.62, 0.12, M.bronze, 16);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    cylinder(g, 0.045, 0.045, 0.26, Math.cos(a) * 0.21, 1.26, 0.12 + Math.sin(a) * 0.21, M.bronze, 6, { cast: false });
  }
  torus(g, 0.12, 0.025, 0, 1.72, 0.12, M.bronze, [Math.PI / 2, 0, 0]);
  torus(g, 0.3, 0.03, 0, 1.56, 0.12, M.bronze, [Math.PI / 2, 0, 0]);

  const flames = [];
  candle(g, -w * 0.3, 1.24, 0.05, flames, scale);
  candle(g, w * 0.3, 1.24, 0.05, flames, scale);

  // fruit plate
  cylinder(g, 0.42, 0.46, 0.09, w * 0.19, 1.31, 0.7, M.goldDim, 18, { cast: false });
  const fruitMat = new THREE.MeshStandardMaterial({ color: 0xb8563a, roughness: 0.6 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    sphere(g, 0.1, w * 0.19 + Math.cos(a) * 0.16, 1.48 + (i % 2 ? 0.06 : 0), 0.7 + Math.sin(a) * 0.16, fruitMat, [1, 0.85, 1], { cast: false });
  }
  // vase
  cylinder(g, 0.14, 0.1, 0.42, -w * 0.2, 1.45, 0.62, M.bronze, 12, { cast: false });
  cylinder(g, 0.08, 0.14, 0.1, -w * 0.2, 1.68, 0.62, M.bronze, 12, { cast: false });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    cylinder(g, 0.014, 0.014, 0.5, -w * 0.2 + Math.cos(a) * 0.05, 1.95, 0.62 + Math.sin(a) * 0.05, M.pine, 4, { cast: false });
    sphere(g, 0.06, -w * 0.2 + Math.cos(a) * 0.12, 2.2, 0.62 + Math.sin(a) * 0.12, M.robeRed, [1, 1, 0.6], { cast: false });
  }

  const light = lightOn ? new THREE.PointLight(0xffb15c, 14, 9, 2) : null;
  if (light) {
    light.position.set(0, 2.3, 0.3);
    g.add(light);
  }

  const smokeOrigin = { x, y: y + 1.72, z: z + 0.12 };

  return {
    group: g,
    smokeOrigin,
    update(dt, t) {
      for (const f of flames) {
        const k = 0.85 + Math.sin(t * 7 + f.phase) * 0.12 + Math.sin(t * 13 + f.phase * 2) * 0.06;
        f.mesh.scale.set(1, k, 1);
        f.mesh.position.y = f.baseY + (k - 1) * 0.06;
        f.core.material.opacity = 0.7 + k * 0.2;
      }
      if (light) light.intensity = 13 + Math.sin(t * 6.5) * 1.6 + Math.sin(t * 11.3) * 0.8;
    },
  };
}
