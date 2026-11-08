import { createStatue } from '../Statue.js';
import { plaque } from '../Props.js';
import { createHallBase } from './HallBase.js';

export function create() {
  const hall = createHallBase({
    id: 'longwang', name: '龙王殿', subtitle: '灵泽龙王 · 护法',
    w: 24, d: 18, h: 11, wallSeed: 9,
  });
  const { scene, addAltar, addCushions, addDais, addPoint, addSpot, finish } = hall;

  addDais({ z: -6.5, width: 10, depth: 6, height: 0.34 });
  plaque(scene, '龙王殿', { x: 0, y: 9.0, z: -8.72, w: 4.6, h: 1.35 });

  const dragon = createStatue({ scale: 1.62, scheme: 'painted', variant: 'dragon', pose: 'seated' });
  dragon.position.set(0, 0.34, -6.5);
  scene.add(dragon);

  for (const side of [-1, 1]) {
    const guard = createStatue({
      scale: 1.1, scheme: 'bronze', variant: 'king',
      pose: 'standing', haloRing: false, lotus: false,
    });
    guard.position.set(side * 3.4, 0.02, -5.9);
    scene.add(guard);
  }

  addAltar({ x: 0, z: -2.9, width: 4.0 });
  addCushions({ x: 0, z: -0.6, count: 3, spacing: 1.0 });
  addPoint({ id: 'longwang', name: '灵泽龙王', x: 0, z: -0.6, statueX: 0, statueZ: -6.5 });

  addSpot({ x: 0, y: 9.4, z: 2, tx: 0, ty: 2.6, tz: -6.5, intensity: 100, angle: 0.32, shadow: true, color: 0xcfe4ff });

  return finish();
}
