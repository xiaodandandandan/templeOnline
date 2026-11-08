import { createRoyalGuanyin, createAttendant } from '../Statue.js';
import { plaque } from '../Props.js';
import { createHallBase } from './HallBase.js';

export function create() {
  const hall = createHallBase({
    id: 'guanyin', name: '观音堂', subtitle: '水月慈容 · 龙女善财',
    w: 34, d: 26, h: 14, wallSeed: 6,
  });
  const { scene, addAltar, addCushions, addDais, addPoint, addSpot, finish } = hall;

  addDais({ z: -9.0, width: 18, depth: 8, height: 0.38 });
  plaque(scene, '观音堂', { x: 0, y: 9.8, z: -12.7, w: 4.6, h: 1.6 });

  // 观音堂仅奉一尊水月观音：游戏坐于崖座，龙女、善财侍立两侧
  const shui = createRoyalGuanyin({ scale: 1.85 });
  shui.position.set(0, 0.38, -8.9);
  scene.add(shui);

  const longnv = createAttendant({ variant: 'longnv', scale: 0.95 });
  longnv.position.set(-4.2, 0.38, -7.05);
  longnv.rotation.y = 0.3;
  scene.add(longnv);

  const shancai = createAttendant({ variant: 'shancai', scale: 0.95 });
  shancai.position.set(4.2, 0.38, -7.05);
  shancai.rotation.y = -0.3;
  scene.add(shancai);

  addAltar({ x: 0, z: -4.6, width: 3.4 });
  addCushions({ x: 0, z: -1.9, count: 1 });
  addPoint({ id: 'shuiyue', name: '水月观音', x: 0, z: -1.9, statueX: 0, statueZ: -8.9 });

  addSpot({ x: 0, y: 11.5, z: 1, tx: 0, ty: 3.8, tz: -8.9, intensity: 120, angle: 0.38, shadow: true });

  return finish();
}
