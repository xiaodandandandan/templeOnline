import * as THREE from 'three';
import { M, muralMaterial, plaqueMaterial } from './Materials.js';
import { box, plane, plaque, doorSet, column, latticeWindow, dustMotes } from './Props.js';

export function buildRoomShell({
  w,
  d,
  h,
  name,
  wallSeed = 1,
  floorMat = M.floorStone,
  mural = true,
  door = true,
}) {
  const g = new THREE.Group();
  const blockers = [];
  const halfW = w / 2;
  const halfD = d / 2;

  const floorGeo = new THREE.PlaneGeometry(w, d);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  box(g, w + 0.6, h, 0.4, 0, h / 2, -halfD - 0.2, M.plaster, { cast: false });
  box(g, 0.4, h, d + 0.4, -halfW - 0.2, h / 2, 0, M.plaster, { cast: false });
  box(g, 0.4, h, d + 0.4, halfW + 0.2, h / 2, 0, M.plaster, { cast: false });
  box(g, w + 0.6, h, 0.4, 0, h / 2, halfD + 0.2, M.plaster, { cast: false });

  // wainscot and cornice
  for (const side of [-1, 1]) {
    box(g, 0.16, 1.0, d - 0.6, side * (halfW - 0.1), 0.5, 0, M.woodDark, { cast: false });
    box(g, 0.22, 0.18, d - 0.5, side * (halfW - 0.12), 2.0, 0, M.wood, { cast: false });
  }
  box(g, w - 0.6, 1.0, 0.16, 0, 0.5, -halfD + 0.1, M.woodDark, { cast: false });
  box(g, w - 0.6, 1.0, 0.16, 0, 0.5, halfD - 0.1, M.woodDark, { cast: false });

  // interior murals
  if (mural) {
    for (const side of [-1, 1]) {
      plane(g, d * 0.62, h * 0.42, side * (halfW - 0.18), h * 0.5, 0, muralMaterial(wallSeed + (side > 0 ? 1 : 0)), [0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]);
    }
    plane(g, w * 0.5, h * 0.3, 0, h * 0.62, -halfD + 0.19, muralMaterial(wallSeed + 5));
  }

  // ceiling
  const ceilGeo = new THREE.PlaneGeometry(w, d);
  const ceil = new THREE.Mesh(ceilGeo, M.woodDark);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = h;
  g.add(ceil);
  // coffer beams
  for (let i = 0; i <= 4; i++) {
    box(g, w, 0.34, 0.3, 0, h - 0.2, -halfD + (d / 4) * i, M.wood, { cast: false });
  }
  for (let i = 0; i <= 6; i++) {
    box(g, 0.28, 0.3, d, -halfW + (w / 6) * i, h - 0.16, 0, M.wood, { cast: false });
  }
  box(g, w, 0.6, 0.6, 0, h - 0.5, -halfD + 0.35, M.woodDark, { cast: false });
  box(g, w, 0.6, 0.6, 0, h - 0.5, halfD - 0.35, M.woodDark, { cast: false });

  // columns
  const cols = Math.max(2, Math.round(d / 5));
  for (let i = 0; i <= cols; i++) {
    const z = -halfD + 2.2 + ((d - 4.4) / cols) * i;
    for (const x of [-halfW + 1.5, halfW - 1.5]) blockers.push({minX:x-.5,maxX:x+.5,minZ:z-.5,maxZ:z+.5});
    column(g, { x: -halfW + 1.5, z, h: h - 0.6, radius: 0.42 });
    column(g, { x: halfW - 1.5, z, h: h - 0.6, radius: 0.42 });
  }
  // rear columns
  column(g, { x: -halfW + 3.0, z: -halfD + 2.2, h: h - 0.6, radius: 0.44 });
  column(g, { x: halfW - 3.0, z: -halfD + 2.2, h: h - 0.6, radius: 0.44 });

  for (const x of [-halfW + 3, halfW - 3]) blockers.push({minX:x-.52,maxX:x+.52,minZ:-halfD+1.68,maxZ:-halfD+2.72});
  // front doors (seen from inside when turning around)
  if (door) {
    doorSet(g, { x: 0, y: 0, z: halfD - 0.28, width: Math.min(4.2, w * 0.18), height: Math.min(5.2, h * 0.5) });
    plaque(g, name, { x: 0, y: h * 0.68, z: halfD - 0.3, w: Math.min(4.6, w * 0.26), h: 1.5, ry: Math.PI });
  }

  latticeWindow(g, { x: -halfW + 0.22, y: 2.2, z: -halfD + d * 0.28, w: 2.0, h: 2.8, ry: Math.PI / 2 });
  latticeWindow(g, { x: halfW - 0.22, y: 2.2, z: -halfD + d * 0.28, w: 2.0, h: 2.8, ry: -Math.PI / 2 });

  dustMotes(g, { w: w * 0.9, h: h * 0.8, d: d * 0.9, count: 120 });

  const ambient = new THREE.AmbientLight(0xffefd8, 0.32);
  g.add(ambient);
  const hemi = new THREE.HemisphereLight(0xfff1da, 0x241a12, 0.5);
  g.add(hemi);

  const exitPos = { x: 0, z: halfD - 2.1 };
  return { group: g, exitPos, blockers };
}
