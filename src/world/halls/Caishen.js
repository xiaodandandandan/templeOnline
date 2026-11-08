import { createStatue } from '../Statue.js';
import { plaque } from '../Props.js';
import { createHallBase } from './HallBase.js';

export function create() {
  const hall = createHallBase({
    id: 'caishen', name: '财神殿', subtitle: '福德财神',
    w: 22, d: 16, h: 10, wallSeed: 10,
  });
  const { scene, addAltar, addCushions, addDais, addPoint, addSpot, finish } = hall;

  addDais({ z: -5.6, width: 9, depth: 5.4, height: 0.3 });
  plaque(scene, '财神殿', { x: 0, y: 8.45, z: -7.72, w: 3.4, h: 1.25 });

  const caishen = createStatue({ scale: 1.52, scheme: 'gold', variant: 'caishen', pose: 'seated' });
  caishen.position.set(0, 0.3, -5.6);
  scene.add(caishen);

  for (const side of [-1, 1]) {
    const page = createStatue({
      scale: 0.95, scheme: 'painted', variant: 'buddha',
      pose: 'standing', haloRing: false, lotus: false,
    });
    page.position.set(side * 3.1, 0.3, -5.1);
    scene.add(page);
  }

  addAltar({ x: 0, z: -2.6, width: 3.8 });
  addCushions({ x: 0, z: -0.4, count: 1 });
  addPoint({ id: 'caishen', name: '福德财神', x: 0, z: -0.4, statueX: 0, statueZ: -5.6 });

  addSpot({ x: 0, y: 8.5, z: 2, tx: 0, ty: 2.4, tz: -5.6, intensity: 105, angle: 0.32, shadow: true, color: 0xffd08a });

  return finish();
}
