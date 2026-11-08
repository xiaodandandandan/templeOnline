import { createStatue } from '../Statue.js';
import { plaque } from '../Props.js';
import { createHallBase } from './HallBase.js';

export function create() {
  const hall = createHallBase({
    id: 'yaoshi', name: '药师殿', subtitle: '东方净琉璃世界',
    w: 24, d: 18, h: 11, wallSeed: 8,
  });
  const { scene, addAltar, addCushions, addDais, addPoint, addSpot, finish } = hall;

  addDais({ z: -6.4, width: 10, depth: 6, height: 0.34 });
  plaque(scene, '药师殿', { x: 0, y: 9.0, z: -8.72, w: 3.8, h: 1.35 });

  const yaoshi = createStatue({ scale: 1.62, scheme: 'jade', variant: 'buddha', pose: 'seated' });
  yaoshi.position.set(0, 0.34, -6.4);
  scene.add(yaoshi);

  // 日光、月光二菩萨侍立
  for (const side of [-1, 1]) {
    const attendant = createStatue({
      scale: 1.12, scheme: side < 0 ? 'painted' : 'jade',
      variant: 'bodhisattva', pose: 'standing', haloRing: false, lotus: false,
    });
    attendant.position.set(side * 3.4, 0.34, -5.8);
    scene.add(attendant);
  }

  addAltar({ x: 0, z: -2.9, width: 4.0 });
  addCushions({ x: 0, z: -0.5, count: 3, spacing: 1.0 });
  addPoint({ id: 'yaoshi', name: '药师琉璃光如来', x: 0, z: -0.5, statueX: 0, statueZ: -6.4 });

  addSpot({ x: 0, y: 9.4, z: 2, tx: 0, ty: 2.6, tz: -6.4, intensity: 110, angle: 0.32, shadow: true, color: 0xd8f0e6 });

  return finish();
}
