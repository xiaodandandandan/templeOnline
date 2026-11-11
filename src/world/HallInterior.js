import * as THREE from 'three';
import { M, muralMaterial } from './Materials.js';
import { box, plane } from './Props.js';

function seedOf(id) {
  let seed = 1;
  for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) % 997;
  return seed;
}

/**
 * 给“室外大场景里的殿堂”补一层轻量室内陈设。
 * 不复制完整 Room 壳，只补壁画、墙裙、顶棚和梁，成本低且能被 mergeStatic 合并。
 */
export function dressHallInterior(world, cfg, { floorY, wallH, hasBackdrop }) {
  const halfW = cfg.w / 2;
  const halfD = cfg.d / 2;
  const mural = muralMaterial(seedOf(cfg.id));
  const g = new THREE.Group();
  g.position.set(cfg.x, floorY, cfg.z);
  g.rotation.y = cfg.ry || 0;
  world.add(g);

  for (const side of [-1, 1]) {
    plane(
      g,
      cfg.d * 0.64,
      wallH * 0.42,
      side * (halfW - 0.27),
      wallH * 0.52,
      0,
      mural,
      [0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0],
    );
    box(
      g,
      0.12,
      0.9,
      cfg.d * 0.62,
      side * (halfW - 0.2),
      0.45,
      0,
      M.woodDark,
      { cast: false },
    );
  }

  if (!hasBackdrop) {
    plane(
      g,
      cfg.w * 0.56,
      wallH * 0.3,
      0,
      wallH * 0.62,
      -halfD + 0.26,
      mural,
    );
  }

  // 木顶棚 + 三根横向梁，遮住屋顶内侧的杂乱面。
  plane(
    g,
    cfg.w - 0.8,
    cfg.d - 0.8,
    0,
    wallH - 0.08,
    0,
    M.woodDark,
    [Math.PI / 2, 0, 0],
  );
  for (let i = -1; i <= 1; i++) {
    box(
      g,
      cfg.w - 1.0,
      0.22,
      0.28,
      0,
      wallH - 0.28,
      i * (cfg.d * 0.22),
      M.wood,
      { cast: false },
    );
  }
}
