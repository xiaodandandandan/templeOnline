import { M } from '../Materials.js';
import { createStatue } from '../Statue.js';
import { plaque, box } from '../Props.js';
import { createHallBase } from './HallBase.js';

export function create() {
  const hall = createHallBase({
    id: 'lingxiao', name: '凌霄阁', subtitle: '三世佛 · 四大菩萨',
    w: 46, d: 32, h: 18, wallSeed: 7,
  });
  const { scene, addAltar, addCushions, addDais, addPoint, addSpot, finish } = hall;

  addDais({ z: -12.0, width: 36, depth: 8, height: 0.42 });
  plaque(scene, '凌霄阁', { x: 0, y: 12.4, z: -15.7, w: 6.0, h: 2.0 });

  const buddhas = [
    { id: 'ling_b1', name: '燃灯佛', x: -7, scheme: 'gold' },
    { id: 'ling_b2', name: '释迦牟尼佛', x: 0, scheme: 'bronze' },
    { id: 'ling_b3', name: '弥勒佛', x: 7, scheme: 'gold' },
  ];
  for (const [i, b] of buddhas.entries()) {
    const statue = createStatue({ scale: 1.9, scheme: b.scheme, variant: 'buddha', pose: 'seated' });
    statue.position.set(b.x, 0.42, -11.8);
    scene.add(statue);
    addAltar({ x: b.x, z: -6.2, width: 3.4, lightOn: i === 1 });
    addCushions({ x: b.x, z: -3.2, count: 1 });
    addPoint({ id: b.id, name: b.name, x: b.x, z: -3.2, statueX: b.x, statueZ: -11.8 });
  }

  const bodhisattvas = [
    { id: 'ling_p1', name: '文殊菩萨', x: -16, scheme: 'painted' },
    { id: 'ling_p2', name: '普贤菩萨', x: -10.5, scheme: 'bronze' },
    { id: 'ling_p3', name: '观世音菩萨', x: 10.5, scheme: 'jade' },
    { id: 'ling_p4', name: '地藏菩萨', x: 16, scheme: 'painted' },
  ];
  for (const p of bodhisattvas) {
    box(scene, 3.2, 0.32, 3.2, p.x, 0.16, -4.0, M.stoneDark, { cast: false });
    const statue = createStatue({ scale: 1.5, scheme: p.scheme, variant: 'bodhisattva', pose: 'seated' });
    statue.position.set(p.x, 0.32, -4.0);
    scene.add(statue);
    addAltar({ x: p.x, z: -0.9, width: 2.9, scale: 0.94, lightOn: false });
    addCushions({ x: p.x, z: 1.6, count: 1 });
    addPoint({ id: p.id, name: p.name, x: p.x, z: 1.6, statueX: p.x, statueZ: -4.0 });
  }

  addSpot({ x: 0, y: 15.5, z: 4, tx: 0, ty: 3.0, tz: -11.8, intensity: 150, angle: 0.3, shadow: true });
  addSpot({ x: -12, y: 14, z: 4, tx: -7, ty: 2.8, tz: -11.8, intensity: 60, angle: 0.32 });
  addSpot({ x: 12, y: 14, z: 4, tx: 7, ty: 2.8, tz: -11.8, intensity: 60, angle: 0.32 });
  addSpot({ x: -18, y: 12, z: 7, tx: -13, ty: 2.2, tz: -4.0, intensity: 40, angle: 0.36 });
  addSpot({ x: 18, y: 12, z: 7, tx: 13, ty: 2.2, tz: -4.0, intensity: 40, angle: 0.36 });

  return finish();
}
