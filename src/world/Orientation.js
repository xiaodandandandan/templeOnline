/**
 * 寺院建筑朝向工具。
 *
 * 建筑在本地坐标里始终“门朝 +Z”。左右两侧的殿堂通过 ry 旋转 ±90°，
 * 让门转向中轴。所有碰撞/可行走面都必须经过同一套 local -> world 变换，
 * 否则视觉旋转了而碰撞还停在旧方向。
 */

export function rotationOf(cfg) {
  return cfg.ry || 0;
}

export function localToWorld(cfg, lx, lz) {
  const ry = rotationOf(cfg);
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  return {
    x: cfg.x + lx * c + lz * s,
    z: cfg.z - lx * s + lz * c,
  };
}

export function worldToLocal(cfg, x, z) {
  const ry = rotationOf(cfg);
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  const dx = x - cfg.x;
  const dz = z - cfg.z;
  return {
    x: dx * c - dz * s,
    z: dx * s + dz * c,
  };
}

export function inFootprint(cfg, x, z, margin = 0) {
  const p = worldToLocal(cfg, x, z);
  return (
    Math.abs(p.x) <= cfg.w / 2 + margin &&
    Math.abs(p.z) <= cfg.d / 2 + margin
  );
}

/** 把一个本地 AABB 旋转后变成世界 AABB（只支持 0/±90°，与建筑配置一致）。 */
export function addLocalBlocker(blockers, cfg, minX, maxX, minZ, maxZ) {
  const corners = [
    localToWorld(cfg, minX, minZ),
    localToWorld(cfg, maxX, minZ),
    localToWorld(cfg, maxX, maxZ),
    localToWorld(cfg, minX, maxZ),
  ];
  blockers.push({
    minX: Math.min(...corners.map((p) => p.x)),
    maxX: Math.max(...corners.map((p) => p.x)),
    minZ: Math.min(...corners.map((p) => p.z)),
    maxZ: Math.max(...corners.map((p) => p.z)),
  });
}

/** 本地矩形可行走面 -> 世界 AABB。 */
export function addLocalSurface(surfaces, cfg, { minX, maxX, minZ, maxZ, y }) {
  const corners = [
    localToWorld(cfg, minX, minZ),
    localToWorld(cfg, maxX, minZ),
    localToWorld(cfg, maxX, maxZ),
    localToWorld(cfg, minX, maxZ),
  ];
  surfaces.push({
    minX: Math.min(...corners.map((p) => p.x)),
    maxX: Math.max(...corners.map((p) => p.x)),
    minZ: Math.min(...corners.map((p) => p.z)),
    maxZ: Math.max(...corners.map((p) => p.z)),
    y,
  });
}
