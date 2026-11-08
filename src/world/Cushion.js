import * as THREE from 'three';
import { M } from './Materials.js';
import { box, torus, sphere } from './Props.js';

export function createCushion({ x = 0, z = 0, y = 0, scale = 1, rot = 0 }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  g.rotation.y = rot;
  box(g, 0.94, 0.2, 0.94, 0, 0.1, 0, M.cushion);
  box(g, 0.8, 0.1, 0.8, 0, 0.25, 0, M.cushion, { cast: false });
  box(g, 0.3, 0.06, 0.3, 0, 0.32, 0, M.goldDim, { cast: false });
  torus(g, 0.44, 0.035, 0, 0.22, 0, M.goldDim, [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    sphere(g, 0.045, Math.cos(a) * 0.46, 0.14, Math.sin(a) * 0.46, M.goldDim, [1, 1.4, 1], { cast: false });
  }
  return g;
}

export function createCushionSet(parent, { x = 0, z = 0, count = 3, spacing = 0.98, y = 0, scale = 1 }) {
  if (count === 1) {
    parent.add(createCushion({ x, z, y, scale }));
    return [{ x, z }];
  }
  const offsets = count === 3 ? [-spacing, 0, spacing] : [0];
  const out = [];
  for (const dx of offsets) {
    parent.add(createCushion({ x: x + dx, z, y, scale }));
    out.push({ x: x + dx, z });
  }
  return out;
}
