import { createHallBase } from './HallBase.js';
import { box } from '../Props.js';
import { M } from '../Materials.js';

export function create() {
  const hall = createHallBase({
    id: 'wenchuang', name: '文创用品', subtitle: '售卖 · 手作',
    w: 18, d: 14, h: 8, wallSeed: 12,
  });
  const { scene, blockers, finish } = hall;

  // 正面柜台
  box(scene, 7.5, 0.95, 1.2, 0, 0.48, -3.6, M.wood);
  box(scene, 7.8, 0.12, 1.35, 0, 1.0, -3.6, M.woodLight, { cast: false });
  box(scene, 0.5, 0.08, 0.7, -2.5, 1.08, -3.6, M.plasterWhite, { cast: false });
  box(scene, 0.45, 0.12, 0.5, 2.2, 1.08, -3.6, M.lacquer, { cast: false });
  blockers.push({ minX: -3.9, maxX: 3.9, minZ: -4.3, maxZ: -2.9 });

  // 两侧货架与挂件
  for (const side of [-1, 1]) {
    const x = side * 6.3;
    box(scene, 1.0, 3.0, 5.4, x, 1.5, -4.0, M.woodDark);
    for (let i = 0; i < 4; i++) {
      box(scene, 1.1, 0.1, 5.0, x, 0.55 + i * 0.65, -4.0, M.wood, { cast: false });
      for (let k = 0; k < 6; k++) {
        box(scene, 0.5, 0.22, 0.22, x, 0.7 + i * 0.65, -6.1 + k * 0.75,
          (k + i) % 2 ? M.lacquer : M.goldDim, { cast: false });
      }
    }
    blockers.push({ minX: x - 0.6, maxX: x + 0.6, minZ: -6.7, maxZ: -1.3 });
  }

  // 中央展示台
  box(scene, 2.4, 0.9, 2.4, 1.0, 0.45, 2.2, M.wood);
  box(scene, 2.6, 0.1, 2.6, 1.0, 0.95, 2.2, M.goldDim, { cast: false });
  blockers.push({ minX: -0.3, maxX: 2.3, minZ: 0.9, maxZ: 3.5 });

  return finish();
}
