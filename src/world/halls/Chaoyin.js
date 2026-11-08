import * as THREE from 'three';
import { M } from '../Materials.js';
import { createStatue } from '../Statue.js';
import { plaque, box, cylinder } from '../Props.js';
import { createHallBase } from './HallBase.js';

export function create() {
  const hall = createHallBase({
    id: 'chaoyin', name: '潮音堂', subtitle: '文殊法席',
    w: 30, d: 22, h: 12, wallSeed: 4,
  });
  const { scene, addAltar, addCushions, addDais, addPoint, addSpot, finish } = hall;

  addDais({ z: -7.6, width: 10, depth: 6, height: 0.32 });
  plaque(scene, '潮音堂', { x: 0, y: 9.45, z: -10.7, w: 4.2, h: 1.5 });

  const wenshu = createStatue({ scale: 1.7, scheme: 'painted', variant: 'bodhisattva', pose: 'seated' });
  wenshu.position.set(0, 0.32, -7.6);
  scene.add(wenshu);

  addAltar({ x: 0, z: -3.2, width: 4.4 });
  addCushions({ x: 0, z: -0.7, count: 3, spacing: 1.0 });
  addPoint({ id: 'wenshu', name: '文殊菩萨', x: 0, z: -0.7, statueX: 0, statueZ: -7.6 });

  // 藏经阁佛龛
  const nx = 8;
  const nz = -7.2;
  box(scene, 3.6, 0.65, 2.0, nx, 0.33, nz, M.stoneDark);
  box(scene, 0.28, 3.6, 0.28, nx - 1.62, 2.1, nz, M.lacquer);
  box(scene, 0.28, 3.6, 0.28, nx + 1.62, 2.1, nz, M.lacquer);
  box(scene, 3.9, 0.4, 1.7, nx, 3.9, nz, M.woodDark);
  box(scene, 3.3, 3.4, 0.22, nx, 2.0, nz - 0.62, M.woodDark, { cast: false });
  box(scene, 3.3, 0.2, 1.5, nx, 0.72, nz, M.goldDim, { cast: false });
  cylinder(scene, 0.2, 0.26, 0.5, nx - 1.2, 4.2, nz, M.gold, 10, { cast: false });
  const nicheBuddha = createStatue({ scale: 0.62, scheme: 'gold', variant: 'buddha', pose: 'seated' });
  nicheBuddha.position.set(nx, 0.82, nz);
  scene.add(nicheBuddha);
  const nl = new THREE.PointLight(0xffc076, 12, 7, 2);
  nl.position.set(nx, 3.2, nz + 0.6);
  scene.add(nl);

  addAltar({ x: nx, z: -4.4, width: 2.6, scale: 0.9, lightOn: false });
  addCushions({ x: nx, z: -1.9, count: 1 });
  addPoint({ id: 'sutra', name: '藏经阁佛龛', x: nx, z: -1.9, statueX: nx, statueZ: nz, hall: '藏经阁' });

  addSpot({ x: 0, y: 10.4, z: 2, tx: 0, ty: 2.2, tz: -7.6, intensity: 105, angle: 0.32, shadow: true });
  addSpot({ x: nx, y: 9.5, z: 0, tx: nx, ty: 2.0, tz: nz, intensity: 45, angle: 0.36, color: 0xffc985 });

  return finish();
}
