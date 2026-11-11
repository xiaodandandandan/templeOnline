import { createHallBase } from './HallBase.js';
import { box } from '../Props.js';
import { M } from '../Materials.js';

export function create() {
  const hall = createHallBase({
    id: 'zutang', name: '祖堂', subtitle: '抄经 · 静心',
    w: 18, d: 14, h: 8, wallSeed: 11,
  });
  const { scene, blockers, finish } = hall;

  // 抄经长桌（两排），桌面上的纸、砚台和书册都用体素方块表示。
  for (const z of [-2.8, 2.4]) {
    for (const x of [-3.4, 3.4]) {
      box(scene, 3.0, 0.16, 1.3, x, 0.86, z, M.wood);
      for (const dx of [-1.2, 1.2]) {
        for (const dz of [-0.42, 0.42]) {
          box(scene, 0.16, 0.8, 0.16, x + dx, 0.4, z + dz, M.woodDark, { cast: false });
        }
      }
      box(scene, 0.7, 0.03, 0.9, x - 0.45, 0.96, z, M.plasterWhite, { cast: false });
      box(scene, 0.16, 0.1, 0.16, x + 0.65, 0.95, z + 0.2, M.black, { cast: false });
      box(scene, 0.5, 0.12, 0.5, x + 0.2, 1.0, z - 0.3, M.lacquer, { cast: false });
      blockers.push({
        minX: x - 1.55, maxX: x + 1.55,
        minZ: z - 0.7, maxZ: z + 0.7,
      });
    }
  }

  // 两侧书架
  for (const side of [-1, 1]) {
    const x = side * 6.6;
    box(scene, 0.8, 3.2, 5.2, x, 1.6, -3.2, M.woodDark);
    for (let i = 0; i < 4; i++) {
      box(scene, 0.9, 0.12, 4.8, x, 0.6 + i * 0.7, -3.2, M.wood, { cast: false });
      for (let k = 0; k < 5; k++) {
        box(scene, 0.55, 0.26, 0.26, x, 0.78 + i * 0.7, -5.1 + k * 0.8, i % 2 ? M.lacquer : M.woodLight, { cast: false });
      }
    }
    blockers.push({ minX: x - 0.5, maxX: x + 0.5, minZ: -5.8, maxZ: -0.6 });
  }

  return finish();
}
