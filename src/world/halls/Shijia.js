import { createStatue } from '../Statue.js';
import { plaque } from '../Props.js';
import { createHallBase } from './HallBase.js';

export function create() {
  const hall = createHallBase({
    id: 'shijia', name: '释迦宝殿', subtitle: '大雄宝殿',
    w: 34, d: 26, h: 14, wallSeed: 3,
  });
  const { scene, addAltar, addCushions, addDais, addPoint, addSpot, finish } = hall;

  addDais({ z: -9.2, width: 20, depth: 8, height: 0.4 });
  plaque(scene, '大雄宝殿', { x: 0, y: 11.0, z: -12.7, w: 5.4, h: 1.8 });

  const buddha = createStatue({ scale: 1.95, scheme: 'gold', variant: 'buddha', pose: 'seated' });
  buddha.position.set(0, 0.4, -9.2);
  scene.add(buddha);

  for (const side of [-1, 1]) {
    const disciple = createStatue({ scale: 1.18, scheme: 'bronze', variant: 'buddha', pose: 'standing', haloRing: false, lotus: false });
    disciple.position.set(side * 2.8, 0.4, -8.6);
    scene.add(disciple);

    const bodhisattva = createStatue({ scale: 1.4, scheme: side < 0 ? 'painted' : 'jade', variant: 'bodhisattva', pose: 'seated' });
    bodhisattva.position.set(side * 6.4, 0.4, -8.4);
    scene.add(bodhisattva);
  }

  addAltar({ x: 0, z: -4.4, width: 5.4 });
  addCushions({ x: 0, z: -1.5, count: 3, spacing: 1.1 });
  addPoint({ id: 'sakyamuni', name: '释迦牟尼佛', x: 0, z: -1.5, statueX: 0, statueZ: -9.2, hall: '释迦宝殿' });

  addSpot({ x: 0, y: 11.5, z: 3, tx: 0, ty: 2.8, tz: -9.2, intensity: 130, angle: 0.3, shadow: true });
  addSpot({ x: -10, y: 10.5, z: 1, tx: -8, ty: 2.2, tz: -8, intensity: 50, angle: 0.42 });
  addSpot({ x: 10, y: 10.5, z: 1, tx: 8, ty: 2.2, tz: -8, intensity: 50, angle: 0.42 });

  return finish();
}
