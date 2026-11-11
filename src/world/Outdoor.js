import { installHall } from './OpenHalls.js';
import { mergeStatic } from '../core/MergeStatic.js';
import * as THREE from 'three';
import { OUTDOOR } from '../config/halls.js';
import { M, plaqueMaterial } from './Materials.js';
import {
  box, cylinder, sphere, plane, plaque, plaqueVertical, doorSet, column, latticeWindow,
  hippedRoof, stairs, balustrade, stoneLantern, pineTree, rock, Smoke, dustMotes,
} from './Props.js';
import { createStatue, createMaitreya, createHeavenlyKing } from './Statue.js';
import { createAltar } from './Altar.js';
import { createCushion } from './Cushion.js';
import { addLocalBlocker, addLocalSurface, inFootprint } from './Orientation.js';

function heightAt(z) {
  for (const b of OUTDOOR.bands) {
    if (z >= b.z0 && z <= b.z1) {
      const t = (z - b.z0) / (b.z1 - b.z0 || 1);
      return b.y0 + (b.y1 - b.y0) * t;
    }
  }
  return z > OUTDOOR.bands[0].z0 ? 0 : 3.35;
}

const STAIR_HALF = OUTDOOR.axisHalf;
const STAIR_STEPS = 9;

/** 地面高度：台阶按真实踏面离散取样，台阶两侧取平台高度 */
function terrainHeight(z, x = 0) {
  for (const b of OUTDOOR.bands) {
    const z0 = Math.min(b.z0, b.z1);
    const z1 = Math.max(b.z0, b.z1);
    if (z < z0 || z > z1) continue;
    if (Math.abs(b.y0 - b.y1) < 0.01) return b.y0;
    const southZ = z1;
    const southY = b.y1;
    const northY = b.y0;
    if (Math.abs(x) > STAIR_HALF) return Math.min(southY, northY);
    const stepD = (southZ - z0) / STAIR_STEPS;
    const i = Math.min(STAIR_STEPS - 1, Math.max(0, Math.floor((southZ - z) / stepD)));
    return Math.max(0.1, southY + (northY - southY) * (i + 1) / STAIR_STEPS + 0.012);
  }
  return z > OUTDOOR.bands[0].z0 ? 0 : 3.35;
}

function buildTerraces(g, blockers, surfaces) {
  const sideW = OUTDOOR.terraceHalf - STAIR_HALF;
  const sideX = STAIR_HALF + sideW / 2;
  for (const b of OUTDOOR.bands) {
    const z0 = Math.min(b.z0, b.z1);
    const z1 = Math.max(b.z0, b.z1);
    const depth = z1 - z0;
    const cz = (z0 + z1) / 2;
    const low = Math.min(b.y0, b.y1);
    const isStair = Math.abs(b.y0 - b.y1) > 0.01;
    if (isStair) {
      // 台阶两侧补平台，中央留给阶梯
      if (low > 0.01) {
        for (const side of [-1, 1]) {
          box(g, sideW, low, depth, side * sideX, low / 2, cz, M.stone, { cast: false });
        }
      }
      const southZ = Math.max(b.z0, b.z1);
      const northZ = Math.min(b.z0, b.z1);
      const southY = b.z1 === southZ ? b.y1 : b.y0;
      const northY = b.z0 === northZ ? b.y0 : b.y1;
      stairs(g, { z0: southZ, z1: northZ, y0: southY, y1: northY, width: STAIR_HALF * 2, steps: STAIR_STEPS });
      balustrade(g, { x0: -4.95, x1: -4.95, z0: southZ, z1: northZ, y0: southY, y1: northY });
      balustrade(g, { x0: 4.95, x1: 4.95, z0: southZ, z1: northZ, y0: southY, y1: northY });
      // 两侧石栏杆碰撞：防止人物从台阶侧面穿出 / 卡进栏板
      for (const bx of [-4.95, 4.95]) {
        blockers.push({
          minX: bx - 0.2, maxX: bx + 0.2,
          minZ: northZ - 0.05, maxZ: southZ + 0.05,
        });
      }
      // 台沿加一级半步石阶：把高差拆成两级，侧院不必绕回中轴也能上台地
      const rise = Math.abs(northY - southY);
      if (rise > 0.2 && rise <= 0.8) {
        const midY = low + rise / 2;
        for (const side of [-1, 1]) {
          box(g, sideW, rise / 2, 0.6, side * sideX, low + rise / 4, northZ + 0.3, M.stoneStep, { cast: false });
          surfaces.push({
            minX: side < 0 ? -OUTDOOR.terraceHalf : STAIR_HALF,
            maxX: side < 0 ? -STAIR_HALF : OUTDOOR.terraceHalf,
            minZ: northZ,
            maxZ: northZ + 0.6,
            y: midY,
          });
        }
      }
    } else {
      if (low > 0.01) {
        box(g, OUTDOOR.terraceHalf * 2, low, depth, 0, low / 2, cz, M.stone, { cast: false });
      }
      // paved axis
      plane(g, STAIR_HALF * 2, depth - 0.05, 0, b.y0 + 0.015, cz, M.path, [-Math.PI / 2, 0, 0]);
      plane(g, sideW, depth - 0.05, -sideX, b.y0 + 0.012, cz, M.earth, [-Math.PI / 2, 0, 0]);
      plane(g, sideW, depth - 0.05, sideX, b.y0 + 0.012, cz, M.earth, [-Math.PI / 2, 0, 0]);
    }
  }
}

function buildPreview(g2, cfg, { baseY, plinth, wallH, doorW }) {
  const pv = cfg.preview;
  if (!pv) return;
  const floorY = baseY + plinth;
  const innerW = Math.min(cfg.w - 1.4, doorW + 3.2);
  const innerH = Math.max(3.4, wallH - 0.2);
  const innerD = cfg.d + 0.4;
  const statueZ = cfg.d / 2 - 3.0;

  const shell = new THREE.Mesh(new THREE.BoxGeometry(innerW, innerH, innerD), M.interiorShell);
  shell.position.set(0, floorY + innerH / 2, 0);
  g2.add(shell);

  const floorPlane = new THREE.Mesh(new THREE.PlaneGeometry(innerW - 0.25, innerD - 0.2), M.floorWood);
  floorPlane.rotation.x = -Math.PI / 2;
  floorPlane.position.set(0, floorY + 0.012, 0);
  floorPlane.receiveShadow = true;
  g2.add(floorPlane);

  const daisW = Math.min(innerW * 0.66, 3.6);
  box(g2, daisW, 0.26, 1.9, 0, floorY + 0.13, statueZ, M.stoneDark, { cast: false });
  const statue = createStatue({ ...pv });
  statue.position.set(0, floorY + 0.26, statueZ);
  g2.add(statue);

  const light = new THREE.PointLight(0xffb463, 12, 11, 2);
  light.position.set(0, floorY + Math.min(innerH * 0.55, 3.2), cfg.d / 2 - 1.0);
  g2.add(light);
}

function buildHall(g, cfg, blockers, surfaces) {
  const { x, z, w, d, h, platform } = cfg;
  const ry = cfg.ry || 0;
  const baseY = platform;
  // 三层石台基：外沿—主台—压边，让每座建筑都有明显“地基”。
  const plinth = cfg.plinth ?? 0.7;
  const fp = baseY + plinth;
  const g2 = new THREE.Group();
  g2.position.set(x, 0, z);
  g2.rotation.y = ry;
  g.add(g2);

  box(g2, w + 2.4, plinth * 0.26, d + 2.4, 0, baseY + plinth * 0.13, 0, M.stone);
  box(g2, w + 1.5, plinth * 0.52, d + 1.5, 0, baseY + plinth * 0.39, 0, M.stone, { cast: false });
  box(g2, w + 0.8, plinth * 0.3, d + 0.8, 0, baseY + plinth * 0.85, 0, M.stoneDark, { cast: false });
  // 埋入式地基：坡地/台沿处不露缝
  box(g2, w + 2.4, 1.4, d + 2.4, 0, baseY - 0.7, 0, M.stone, { cast: false });

  const wallH = h * 0.72;
  const wallY = fp + wallH / 2;
  const doorH = Math.min(4.6, wallH * 0.78);
  const doorW = Math.min(4.4, w * 0.32);
  const openW = doorW + 0.52;
  box(g2, w, wallH, 0.5, 0, wallY, -d / 2, M.plaster, { cast: true });
  box(g2, 0.5, wallH, d, -w / 2, wallY, 0, M.plaster, { cast: true });
  box(g2, 0.5, wallH, d, w / 2, wallY, 0, M.plaster, { cast: true });
  // 前墙留出门洞：左右两段 + 门楣
  box(g2, (w - openW) / 2, wallH, 0.5, -(w + openW) / 4, wallY, d / 2, M.plaster, { cast: true });
  box(g2, (w - openW) / 2, wallH, 0.5, (w + openW) / 4, wallY, d / 2, M.plaster, { cast: true });
  const lintelH = wallH - doorH;
  if (lintelH > 0.03) {
    box(g2, openW, lintelH, 0.5, 0, fp + doorH + lintelH / 2, d / 2, M.plaster, { cast: true });
  }

  // red columns across the front
  const colH = wallH * 0.92;
  for (const cx of [-w / 2 + 0.55, -w / 2 * 0.44, 0, w / 2 * 0.44, w / 2 - 0.55]) {
    if (Math.abs(cx) < 0.3) continue;
    column(g2, { x: cx, y: fp, z: d / 2 + 0.25, h: colH, radius: 0.36 });
  }
  column(g2, { x: -w / 2 + 0.55, y: fp, z: -d / 2 + 0.3, h: colH, radius: 0.36 });
  column(g2, { x: w / 2 - 0.55, y: fp, z: -d / 2 + 0.3, h: colH, radius: 0.36 });

  doorSet(g2, {
    x: 0, y: fp, z: d / 2 + 0.26,
    width: doorW, height: doorH, open: true,
  });

  // 门前石阶：紧贴门槛铺设，高层用两级、低台基用一级，踏面 0.5m
  const stepCount = plinth > 0.8 ? 3 : plinth > 0.5 ? 2 : 1;
  const stepH = plinth / stepCount;
  const stepHalf = (doorW + 1.4) / 2;
  for (let i = 0; i < stepCount; i++) {
    const sh = stepH * (i + 1);
    box(g2, doorW + 1.4, sh + 0.3, 0.5, 0, baseY + (sh - 0.3) / 2,
      d / 2 + 0.25 + 0.5 * (stepCount - i - 0.5), M.stoneStep, { cast: false });
    addLocalSurface(surfaces, cfg, {
      minX: -stepHalf, maxX: stepHalf,
      minZ: d / 2 + 0.25 + 0.5 * (stepCount - i - 1),
      maxZ: d / 2 + 0.25 + 0.5 * (stepCount - i),
      y: baseY + sh,
    });
  }

  plane(g2,w-.5,d-.5,0,fp+.005,0,M.floorWood,[-Math.PI/2,0,0]);

  const plaqueH = Math.min(1.1, wallH * 0.2);
  plaque(g2, cfg.name, {
    x: 0, y: fp + doorH + 0.32 + plaqueH / 2, z: d / 2 + 0.34,
    w: Math.min(4.4, w * 0.34), h: plaqueH,
  });
  latticeWindow(g2, { x: -w * 0.3, y: fp + 0.2, z: d / 2 + 0.28, w: 2.2, h: 2.8 });
  latticeWindow(g2, { x: w * 0.3, y: fp + 0.2, z: d / 2 + 0.28, w: 2.2, h: 2.8 });

  const eaveY = fp + wallH + 0.35;
  // 檐枋：封住墙顶与屋檐之间的缝隙，避免屋面看起来悬空/镂空
  const friezeH = 0.42;
  const friezeY = fp + wallH + friezeH / 2 - 0.03;
  box(g2, w + 0.1, friezeH, 0.56, 0, friezeY, -d / 2 - 0.03, M.woodDark, { cast: false });
  box(g2, w + 0.1, friezeH, 0.56, 0, friezeY, d / 2 + 0.03, M.woodDark, { cast: false });
  box(g2, 0.56, friezeH, d + 0.1, -w / 2 - 0.03, friezeY, 0, M.woodDark, { cast: false });
  box(g2, 0.56, friezeH, d + 0.1, w / 2 + 0.03, friezeY, 0, M.woodDark, { cast: false });
  hippedRoof(g2, { y: eaveY, width: w + 2.0, depth: d + 2.0, rise: h * 0.52 });
  if (cfg.tiers > 1) {
    // 楼层必须落在下层屋顶之上，否则会被大屋顶吞掉。
    const tier2Base = eaveY + h * 0.52 + 0.12;
    box(g2, w * 0.7, 0.16, d * 0.6, 0, tier2Base + 0.08, 0, M.stoneDark, { cast: false });
    box(g2, w * 0.66, h * 0.24, d * 0.55, 0, tier2Base + 0.16 + h * 0.12, 0, M.lacquer, { cast: false });
    hippedRoof(g2, {
      y: tier2Base + 0.16 + h * 0.24,
      width: w * 0.82 + 1.4,
      depth: d * 0.7 + 1.4,
      rise: h * 0.38,
    });
    if (cfg.tiers > 2) {
      const tier3Base = tier2Base + 0.16 + h * 0.24 + h * 0.38 + 0.1;
      box(g2, w * 0.46, 0.14, d * 0.4, 0, tier3Base + 0.07, 0, M.stoneDark, { cast: false });
      box(g2, w * 0.42, h * 0.18, d * 0.36, 0, tier3Base + 0.14 + h * 0.09, 0, M.lacquer, { cast: false });
      hippedRoof(g2, {
        y: tier3Base + 0.14 + h * 0.18,
        width: w * 0.56 + 0.8,
        depth: d * 0.5 + 0.8,
        rise: h * 0.28,
      });
    }
  }

  // dougong bracket sets
  for (let i = -4; i <= 4; i++) {
    box(g2, 0.6, 0.24, 0.7, i * (w / 9), eaveY - 0.18, d / 2 + 0.55, M.wood, { cast: false });
    box(g2, 0.36, 0.2, 0.9, i * (w / 9), eaveY - 0.4, d / 2 + 0.55, M.woodDark, { cast: false });
  }

  // door lanterns
  const ly = fp - 0.7;
  for (const side of [-1, 1]) {
    const lx = side * Math.min(2.9, w * 0.24);
    const lz = d / 2 + 0.66;
    cylinder(g2, 0.026, 0.026, 0.5, lx, ly + 3.44, lz, M.woodDark, 6, { cast: false });
    sphere(g2, 0.3, lx, ly + 2.94, lz, M.lantern, [0.9, 1.18, 0.9], { cast: false });
    cylinder(g2, 0.1, 0.15, 0.1, lx, ly + 3.3, lz, M.goldDim, 8, { cast: false });
    cylinder(g2, 0.1, 0.15, 0.09, lx, ly + 2.58, lz, M.goldDim, 8, { cast: false });
    cylinder(g2, 0.045, 0.03, 0.34, lx, ly + 2.36, lz, M.lacquerDark, 6, { cast: false });
  }

  // Separate walls leave the actual doorway walkable.
  const wall = (minX, maxX, minZ, maxZ) =>
    addLocalBlocker(blockers, cfg, minX, maxX, minZ, maxZ);
  wall(-w/2-.25,-w/2+.25,-d/2,d/2);
  wall(w/2-.25,w/2+.25,-d/2,d/2);
  wall(-w/2,w/2,-d/2-.25,-d/2+.25);
  wall(-w/2,-openW/2,d/2-.25,d/2+.25);
  wall(openW/2,w/2,d/2-.25,d/2+.25);
  for(const cx of [-w/2+.55,-w/2*.44,w/2*.44,w/2-.55]) wall(cx-.36,cx+.36,d/2-.11,d/2+.61);

  // 台基比墙体宽 0.85m；不补碰撞时玩家会直接走进石台里。
  // 只封侧、后和门前两侧，中央门洞/石阶保持可通行。
  const foundHalfW = (w + 2.4) / 2;
  const foundHalfD = (d + 2.4) / 2;
  for (const side of [-1, 1]) {
    const inner = side < 0 ? -w / 2 + .05 : w / 2 - .05;
    const outer = side * foundHalfW;
    addLocalBlocker(blockers, cfg,
      Math.min(inner, outer), Math.max(inner, outer),
      -foundHalfD, foundHalfD);
  }
  addLocalBlocker(blockers, cfg,
    -foundHalfW, foundHalfW,
    -foundHalfD, -d / 2 + .05);
  const frontStepHalf = (doorW + 1.4) / 2;
  for (const side of [-1, 1]) {
    addLocalBlocker(blockers, cfg,
      side < 0 ? -foundHalfW : frontStepHalf,
      side < 0 ? -frontStepHalf : foundHalfW,
      d / 2 - .05, foundHalfD);
  }
}

/* ------------------------- 山门（按径山寺实景重建） ------------------------- */

const GATE_OPENINGS = [
  { x: 0, w: 3.1, h: 2.9 },
  { x: -3.7, w: 2.0, h: 2.65 },
  { x: 3.7, w: 2.0, h: 2.65 },
];

/** 阶梯拱门：白墙补角 + 黑色门洞 + 朱红门框 + 下部格栅 */
function buildArch(parent, { x, y, z, width, height, wallTop, wallT = 0.5, dir = 1, open = false }) {
  const rowH = 0.32;
  const steps = [1, 0.74, 0.42];
  for (let i = 1; i < steps.length; i++) {
    const sw = width * steps[i];
    const side = (width - sw) / 2;
    const ry = y + height + rowH * i + rowH / 2;
    box(parent, side, rowH, wallT, x - sw / 2 - side / 2, ry, z, M.plaster, { cast: true });
    box(parent, side, rowH, wallT, x + sw / 2 + side / 2, ry, z, M.plaster, { cast: true });
  }
  const crown = y + height + rowH * steps.length;
  if (wallTop - crown > 0.02) {
    box(parent, width, wallTop - crown, wallT, x, crown + (wallTop - crown) / 2, z, M.plaster, { cast: true });
  }

  const darkZ = z - dir * 0.62;
  if (!open) {
    box(parent, width, height, 0.16, x, y + height / 2, darkZ, M.black, { cast: false });
    for (let i = 0; i < steps.length; i++) {
      box(parent, width * steps[i], rowH, 0.16, x, y + height + rowH * i + rowH / 2, darkZ, M.black, { cast: false });
    }
  }

  const fz = z + dir * 0.26;
  for (const s of [-1, 1]) {
    box(parent, 0.3, height, 0.42, x + s * (width / 2 + 0.15), y + height / 2, fz, M.gateRed, { cast: false });
  }
  // 阶梯拱券朱红描边：让门洞暗部呈现真实的拱形
  for (let i = 0; i < steps.length; i++) {
    const sw = width * steps[i];
    const ry = y + height + rowH * i + rowH / 2;
    box(parent, 0.18, rowH, 0.42, x - sw / 2 - 0.09, ry, fz, M.gateRed, { cast: false });
    box(parent, 0.18, rowH, 0.42, x + sw / 2 + 0.09, ry, fz, M.gateRed, { cast: false });
    box(parent, sw + 0.36, 0.14, 0.42, x, y + height + rowH * (i + 1) - 0.07, fz, M.gateRed, { cast: false });
  }

  box(parent, width + 0.7, 0.08, 0.6, x, y + 0.04, z + dir * 0.28, M.stoneDark, { cast: false });
  const railH = Math.min(1.65, height * 0.5);
  const dz = fz + dir * 0.02;
  if (!open) {
    for (let i = 0; i < 5; i++) {
      box(parent, 0.07, railH, 0.07, x - width * 0.36 + (width * 0.72 / 4) * i, y + 0.28 + railH / 2, dz, M.lacquerDark, { cast: false });
    }
    box(parent, width * 0.8, 0.08, 0.1, x, y + 0.28 + railH, dz, M.lacquerDark, { cast: false });
    box(parent, width * 0.8, 0.08, 0.1, x, y + 0.95, dz, M.lacquerDark, { cast: false });
  }
}

function coupletBoard(parent, { x, y, z, w = 0.66, h = 2.35 }) {
  box(parent, w, h, 0.08, x, y, z + 0.28, M.black, { cast: false });
  box(parent, w - 0.1, h - 0.1, 0.02, x, y, z + 0.33, M.goldDim, { cast: false });
  for (let i = 0; i < 9; i++) {
    box(parent, 0.2, 0.035, 0.02, x, y - h / 2 + 0.2 + i * ((h - 0.4) / 8), z + 0.36, M.black, { cast: false });
  }
}

function buildDougong(parent, { y, z, width, dir = 1 }) {
  const n = 12;
  const step = width / n;
  box(parent, width + 0.2, 0.18, 0.5, 0, y + 0.09, z + dir * 0.02, M.gateRed, { cast: false });
  for (let i = 0; i < n; i++) {
    const bx = -width / 2 + step * (i + 0.5);
    box(parent, step * 0.5, 0.3, 0.44, bx, y + 0.15, z, M.gateRed, { cast: false });
    box(parent, step * 0.68, 0.14, 0.56, bx, y + 0.37, z + dir * 0.04, M.lacquerDark, { cast: false });
    box(parent, step * 0.28, 0.22, 0.3, bx, y + 0.5, z - dir * 0.03, M.plasterWhite, { cast: false });
  }
  box(parent, width, 0.12, 0.46, 0, y + 0.57, z + dir * 0.02, M.woodDark, { cast: false });
}

function buildEave(parent, { y, width, depth, rise }) {
  const fz = depth / 2;
  box(parent, width + 0.2, 0.26, 0.3, 0, y - 0.1, fz + 0.05, M.gateRed, { cast: false });
  const n = Math.max(8, Math.floor(width / 0.62));
  for (let i = 0; i <= n; i++) {
    const rx = -width / 2 + (width / n) * i;
    box(parent, 0.14, 0.18, 0.34, rx, y - 0.22, fz + 0.03, M.plasterWhite, { cast: false });
  }
  hippedRoof(parent, { y, width, depth, rise });
}

function buildChiwen(parent, { y, width }) {
  const half = width * 0.236;
  for (const s of [-1, 1]) {
    box(parent, 0.5, 0.58, 0.4, s * half, y + 0.29, 0, M.roofEdge, { cast: false });
    box(parent, 0.24, 0.32, 0.24, s * (half - 0.12), y + 0.72, 0, M.roofEdge, { cast: false });
  }
}

function stoneLion(parent, { x, y, z, dir = 1 }) {
  box(parent, 1.15, 0.32, 1.0, x, y + 0.16, z, M.stoneDark, { cast: false });
  box(parent, 0.95, 0.55, 0.82, x, y + 0.59, z, M.stone);
  box(parent, 1.05, 0.1, 0.92, x, y + 0.91, z, M.stoneDark, { cast: false });
  box(parent, 0.6, 0.62, 0.56, x, y + 1.28, z, M.stone);
  for (const s of [-1, 1]) {
    box(parent, 0.16, 0.42, 0.2, x + s * 0.19, y + 1.06, z + dir * 0.24, M.stone);
    box(parent, 0.14, 0.16, 0.12, x + s * 0.22, y + 2.02, z, M.stoneDark, { cast: false });
    box(parent, 0.08, 0.06, 0.04, x + s * 0.13, y + 1.84, z + dir * 0.31, M.black, { cast: false });
  }
  box(parent, 0.56, 0.44, 0.5, x, y + 1.78, z + dir * 0.06, M.stone);
  box(parent, 0.68, 0.14, 0.6, x, y + 1.62, z, M.stoneDark, { cast: false });
  box(parent, 0.5, 0.1, 0.14, x, y + 0.96, z + dir * 0.34, M.stoneDark, { cast: false });
  box(parent, 0.14, 0.5, 0.16, x, y + 1.2, z - dir * 0.34, M.stone);
}

function cypressTree(parent, { x, y = 0, z, scale = 1 }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  box(g, 0.46, 4.4, 0.46, 0, 2.2, 0, M.trunk, { cast: false });
  const layers = [
    [1.9, 1.1, 3.0], [1.7, 1.2, 3.9], [1.45, 1.2, 4.8],
    [1.15, 1.1, 5.7], [0.85, 0.9, 6.5], [0.5, 0.7, 7.2],
  ];
  for (let i = 0; i < layers.length; i++) {
    const [lw, lh, ly] = layers[i];
    box(g, lw, lh, lw * 0.9, i % 2 ? 0.18 : -0.12, ly, i % 2 ? -0.1 : 0.14, i % 2 ? M.pineDark : M.pine, { cast: false });
  }
  parent.add(g);
  return g;
}

function buildGate(g, cfg, blockers, surfaces, interactives, updaters) {
  const { x, z, w, d, platform } = cfg;
  const baseY = platform;
  const plinth = 0.95;
  const fp = baseY + plinth;
  const frontZ = d / 2;
  const lowerWallH = cfg.h * 0.72;
  const wallTop = fp + lowerWallH;

  const g2 = new THREE.Group();
  g2.position.set(x, 0, z);
  g.add(g2);

  // 两级石台基 + 埋入式地基
  box(g2, w + 1.7, plinth * 0.64, d + 1.7, 0, baseY + plinth * 0.32, 0, M.stone);
  box(g2, w + 0.8, plinth * 0.43, d + 0.8, 0, baseY + plinth * 0.785, 0, M.stoneDark, { cast: false });
  box(g2, w + 1.7, 1.4, d + 1.7, 0, baseY - 0.7, 0, M.stone, { cast: false });
  plane(g2, w - 0.6, d - 0.6, 0, fp + 0.01, 0, M.floorStone, [-Math.PI / 2, 0, 0]);

  // 侧墙
  box(g2, 0.5, lowerWallH, d, -w / 2, fp + lowerWallH / 2, 0, M.plaster, { cast: true });
  box(g2, 0.5, lowerWallH, d, w / 2, fp + lowerWallH / 2, 0, M.plaster, { cast: true });

  // 正面与背面白墙墙垛，留出三座拱门
  const piers = [
    [-w / 2, -4.7],
    [-2.7, -1.55],
    [1.55, 2.7],
    [4.7, w / 2],
  ];
  for (const wz of [-frontZ, frontZ]) {
    for (const [a, b] of piers) {
      box(g2, b - a, lowerWallH, 0.5, (a + b) / 2, fp + lowerWallH / 2, wz, M.plaster, { cast: true });
    }
  }
  for (const o of GATE_OPENINGS) {
    // 正面中门敞开，可直接步入殿内；其余门扇与背面保持闭合
    buildArch(g2, { x: o.x, y: fp, z: frontZ, width: o.w, height: o.h, wallTop, wallT: 0.5, dir: 1, open: true });
    buildArch(g2, { x: o.x, y: fp, z: -frontZ, width: o.w, height: o.h, wallTop, wallT: 0.5, dir: -1, open: false });
  }

  /* ---------------- 山门即天王殿：殿内直接连通室外 ---------------- */

  // 封顶，围合出完整殿内空间（参与投影，挡住直射阳光，殿内靠灯光）
  box(g2, w - 0.3, 0.16, d - 0.3, 0, wallTop - 0.1, 0, M.woodDark);

  // 正中弥勒：高须弥座（抬高佛身，避免被香案遮挡）+ 金边
  box(g2, 4.2, 0.2, 2.5, 0, fp + 0.1, -2.55, M.stoneDark);
  box(g2, 3.6, 0.36, 2.1, 0, fp + 0.38, -2.55, M.woodDark);
  box(g2, 4.0, 0.16, 2.5, 0, fp + 0.64, -2.55, M.stoneDark);
  box(g2, 4.16, 0.06, 2.66, 0, fp + 0.71, -2.55, M.voxGoldDeep, { cast: false });
  box(g2, 3.66, 0.06, 2.16, 0, fp + 0.39, -2.55, M.voxGoldDeep, { cast: false });
  const maitreya = createMaitreya({ scale: 0.84 });
  maitreya.position.set(0, fp + 0.74, -2.55);
  g2.add(maitreya);
  blockers.push({ minX: x - 2.15, maxX: x + 2.15, minZ: z - 3.9, maxZ: z - 1.5 });

  // 香案、香烟与蒲团
  const altar = createAltar({ x: 0, z: -0.55, width: 2.9, scale: 0.86, y: fp });
  g2.add(altar.group);
  updaters.push((dt, t) => altar.update(dt, t));
  const smoke = new Smoke(g2, { ...altar.smokeOrigin, count: 4, height: 3.0, spread: 0.4 });
  updaters.push((dt, t) => smoke.update(dt, t));
  for (const dx of [-0.98, 0, 0.98]) {
    g2.add(createCushion({ x: dx, z: 1.05, y: fp + 0.02, scale: 0.92 }));
  }
  blockers.push({ minX: x - 1.85, maxX: x + 1.85, minZ: z - 1.45, maxZ: z + 0.3 });

  // 四天王：分列东西两壁，坐于岩座，面向殿内
  const KINGS = [
    { variant: 'pipa', x: -w / 2 + 1.35, z: -2.25, rot: 0.95 },
    { variant: 'snake', x: -w / 2 + 1.35, z: 1.55, rot: 0.95 },
    { variant: 'sword', x: w / 2 - 1.35, z: -2.25, rot: -0.95 },
    { variant: 'umbrella', x: w / 2 - 1.35, z: 1.55, rot: -0.95 },
  ];
  for (const spot of KINGS) {
    const sx = Math.sign(spot.x);
    // 暗木白底佛龛
    box(g2, 0.2, 4.3, 3.3, sx * (w / 2 - 0.3), fp + 2.15, spot.z, M.woodDark, { cast: false });
    box(g2, 0.06, 3.9, 2.9, sx * (w / 2 - 0.44), fp + 2.12, spot.z, M.plasterWhite, { cast: false });
    box(g2, 0.1, 0.14, 3.1, sx * (w / 2 - 0.36), fp + 4.06, spot.z, M.voxGoldDeep, { cast: false });
    box(g2, 0.1, 0.14, 3.1, sx * (w / 2 - 0.36), fp + 0.22, spot.z, M.voxGoldDeep, { cast: false });

    const king = createHeavenlyKing({ variant: spot.variant, scale: 0.72 });
    king.position.set(spot.x, fp + 0.02, spot.z);
    king.rotation.y = spot.rot;
    g2.add(king);
    blockers.push({
      minX: x + spot.x - 0.95, maxX: x + spot.x + 0.95,
      minZ: z + spot.z - 0.95, maxZ: z + spot.z + 0.95,
    });
  }

  // 殿内照明：中央主光 + 两侧补光
  const mainLight = new THREE.SpotLight(0xffc98d, 40, 22, 0.52, 0.55, 1.6);
  mainLight.position.set(0, fp + 4.7, 1.4);
  mainLight.target.position.set(0, fp + 2.4, -2.55);
  g2.add(mainLight);
  g2.add(mainLight.target);
  for (const sx of [-1, 1]) {
    const fill = new THREE.PointLight(0xffc78f, 15, 13, 2);
    fill.position.set(sx * 3.6, fp + 3.9, 0.4);
    g2.add(fill);
  }

  for(const dx of [-.98,0,.98]) interactives.push({
    id: 'mile:'+dx, type: 'cushion', name: '弥勒菩萨', hall: '天王殿',
    label: '跪拜 · 弥勒菩萨',
    x:x+dx, z: z + 1.05,
    statueX: x, statueZ: z - 2.55,
    radius: 1.1,
  });

  // 朱红立柱
  const colH = lowerWallH - 0.5;
  for (const cx of [-7, -5.85, -2.125, 2.125, 5.85, 7]) {
    column(g2, { x: cx, y: fp, z: frontZ + 0.34, h: colH, radius: 0.33, mat: M.gateRed });
  }
  for (const side of [-1, 1]) {
    for (const cz of [-3.0, 0, 3.0]) {
      column(g2, { x: side * (w / 2 + 0.3), y: fp, z: cz, h: colH, radius: 0.3, mat: M.gateRed });
    }
  }

  // 正面额枋、横匾「萬年正續」与楹联
  box(g2, w + 0.4, 0.34, 0.5, 0, wallTop - 0.28, frontZ + 0.34, M.gateRed, { cast: false });
  box(g2, 3.3, 0.82, 0.16, 0, fp + 4.11, frontZ + 0.32, M.lacquerDark, { cast: false });
  plaque(g2, '萬年正續', { x: 0, y: fp + 4.11, z: frontZ + 0.46, w: 2.8, h: 0.48 });
  for (const side of [-1, 1]) {
    coupletBoard(g2, { x: side * 6.3, y: fp + 1.9, z: frontZ });
  }

  // 下层斗拱与重檐
  buildDougong(g2, { y: wallTop, z: frontZ + 0.42, width: w + 0.4, dir: 1 });
  buildDougong(g2, { y: wallTop, z: -frontZ - 0.42, width: w + 0.4, dir: -1 });
  buildEave(g2, { y: wallTop + 0.6, width: w + 2.2, depth: d + 2.2, rise: 1.05 });

  // 两侧门洞上方的小亭连廊
  for (const side of [-1, 1]) {
    for (const cx of [3.2, 7.2]) {
      column(g2, { x: side * cx, y: fp, z: frontZ + 0.38, h: 4.0, radius: 0.22, mat: M.lacquer });
    }
    hippedRoof(g2, {
      x: side * 5.2, y: fp + 4.15, z: frontZ + 0.28,
      width: 4.8, depth: 2.9, rise: 0.9,
    });
  }

  // 二层楼身
  const upperBase = wallTop + 1.1;
  const upperW = 8.4;
  const upperD = 5.2;
  const upperH = 2.35;
  const upperTop = upperBase + upperH;
  box(g2, upperW, upperH, 0.5, 0, upperBase + upperH / 2, upperD / 2, M.plaster, { cast: true });
  box(g2, upperW, upperH, 0.5, 0, upperBase + upperH / 2, -upperD / 2, M.plaster, { cast: true });
  box(g2, 0.5, upperH, upperD, -upperW / 2, upperBase + upperH / 2, 0, M.plaster, { cast: true });
  box(g2, 0.5, upperH, upperD, upperW / 2, upperBase + upperH / 2, 0, M.plaster, { cast: true });
  box(g2, upperW, 0.3, upperD, 0, upperBase + 0.15, 0, M.woodDark, { cast: false });

  for (const cx of [-4.2, -1.4, 1.4, 4.2]) {
    column(g2, { x: cx, y: upperBase - 0.1, z: upperD / 2 + 0.34, h: upperH - 0.25, radius: 0.28, mat: M.gateRed });
  }
  for (const side of [-1, 1]) {
    column(g2, { x: side * upperW / 2, y: upperBase - 0.1, z: -upperD / 2 - 0.3, h: upperH - 0.25, radius: 0.28, mat: M.gateRed });
  }
  box(g2, upperW + 0.3, 0.3, 0.42, 0, upperTop - 0.18, upperD / 2 + 0.34, M.gateRed, { cast: false });
  box(g2, upperW + 0.3, 0.22, 0.38, 0, upperBase + 0.2, upperD / 2 + 0.34, M.gateRed, { cast: false });

  // 竖匾「徑山萬壽禪寺」
  plaqueVertical(g2, '徑山萬壽禪寺', {
    x: 0, y: upperBase + upperH * 0.58, z: upperD / 2 + 0.42,
    w: 1.15, h: upperH - 0.5,
  });

  // 上层斗拱与屋顶
  buildDougong(g2, { y: upperTop, z: upperD / 2 + 0.42, width: upperW + 0.3, dir: 1 });
  buildDougong(g2, { y: upperTop, z: -upperD / 2 - 0.42, width: upperW + 0.3, dir: -1 });
  buildEave(g2, { y: upperTop + 0.6, width: upperW + 1.5, depth: upperD + 1.5, rise: 1.15 });
  buildChiwen(g2, { y: upperTop + 0.6 + 1.18, width: upperW + 1.5 });

  // 门前石阶
  const stepCount = 3;
  const stepH = plinth / stepCount;
  const stepHalf = 3.2;
  for (let i = 0; i < stepCount; i++) {
    const sh = stepH * (i + 1);
    box(g2, stepHalf * 2, sh + 0.3, 0.5, 0, baseY + (sh - 0.3) / 2,
      frontZ + 0.25 + 0.5 * (stepCount - i - 0.5), M.stoneStep, { cast: false });
    surfaces.push({
      minX: x - stepHalf, maxX: x + stepHalf,
      minZ: z + frontZ + 0.25 + 0.5 * (stepCount - i - 1),
      maxZ: z + frontZ + 0.25 + 0.5 * (stepCount - i),
      y: baseY + sh,
    });
  }
  // 两侧门洞也补门前踏面。
  for (const sx of [-3.7, 3.7]) {
    const sideHalf = 1.2;
    for (let i = 0; i < stepCount; i++) {
      const sh = stepH * (i + 1);
      box(g2, sideHalf * 2, sh + 0.3, 0.5, sx, baseY + (sh - 0.3) / 2,
        frontZ + 0.25 + 0.5 * (stepCount - i - 0.5), M.stoneStep, { cast: false });
      surfaces.push({
        minX: x + sx - sideHalf, maxX: x + sx + sideHalf,
        minZ: z + frontZ + 0.25 + 0.5 * (stepCount - i - 1),
        maxZ: z + frontZ + 0.25 + 0.5 * (stepCount - i),
        y: baseY + sh,
      });
    }
  }
  for (const side of [-1, 1]) {
    balustrade(g2, {
      x0: side * (stepHalf + 0.16), x1: side * (stepHalf + 0.16),
      z0: frontZ + 1.25, z1: frontZ + 0.25,
      y0: baseY, y1: baseY + plinth,
    });
  }

  // 石狮一对
  for (const side of [-1, 1]) {
    stoneLion(g2, { x: side * 4.55, y: baseY, z: frontZ + 1.35, dir: 1 });
    blockers.push({
      minX: x + side * 4.55 - 0.62, maxX: x + side * 4.55 + 0.62,
      minZ: z + frontZ + 0.8, maxZ: z + frontZ + 1.9,
    });
  }

  // 门前古柏一对
  cypressTree(g2, { x: -6.0, y: baseY, z: frontZ + 2.1, scale: 1.2 });
  cypressTree(g2, { x: 6.0, y: baseY, z: frontZ + 2.1, scale: 1.15 });

  // ---- 碰撞：只挡围墙与台基外沿，正门中门留出通行口 ----
  // 两侧台基与侧墙
  for (const s of [-1, 1]) {
    blockers.push({
      minX: s < 0 ? x - w / 2 - 0.9 : x + w / 2 - 0.25,
      maxX: s < 0 ? x - w / 2 + 0.25 : x + w / 2 + 0.9,
      minZ: z - d / 2 - 0.85, maxZ: z + d / 2 + 0.85,
    });
  }
  // 背面（北）整面封闭
  blockers.push({
    minX: x - w / 2 - 0.9, maxX: x + w / 2 + 0.9,
    minZ: z - d / 2 - 0.85, maxZ: z - d / 2 + 0.25,
  });
  // 正面前墙：中央门洞 + 两侧小门洞都放行。
  const frontSegments = [
    [x - w / 2 - 0.9, x - 4.7],
    [x - 2.7, x - 1.55],
    [x + 1.55, x + 2.7],
    [x + 4.7, x + w / 2 + 0.9],
  ];
  for (const [minX, maxX] of frontSegments) {
    blockers.push({ minX, maxX, minZ: z + d / 2 - 0.25, maxZ: z + d / 2 + 0.85 });
  }
  // 殿内可走地面（抬升至台基高度）
  addLocalSurface(surfaces, cfg, {
    minX: -w / 2 + 0.6, maxX: w / 2 - 0.6,
    minZ: -d / 2 + 0.15, maxZ: d / 2 + 0.3,
    y: fp,
  });
}

// 山门外南侧：请香处（导览图 10 号点）
function buildIncenseStand(g, blockers, updaters) {
  const x = -6.4;
  const z = 44.5;
  const y = heightAt(z);
  box(g, 3.6, 0.16, 1.8, x, y + 0.08, z, M.stoneDark, { cast: false });
  box(g, 1.1, 0.78, 1.1, x, y + 0.47, z, M.woodDark);
  box(g, 1.4, 0.12, 1.4, x, y + 0.92, z, M.lacquerDark, { cast: false });
  cylinder(g, 0.46, 0.55, 0.6, x, y + 1.28, z, M.bronze, 10);
  cylinder(g, 0.5, 0.46, 0.12, x, y + 1.64, z, M.bronze, 10, { cast: false });
  for (const dx of [-0.14, 0, 0.14]) {
    cylinder(g, 0.025, 0.025, 0.9, x + dx, y + 2.05, z + dx * 0.8, M.woodDark, 4, { cast: false });
  }
  const smoke = new Smoke(g, { x, y: y + 2.5, z, count: 4, height: 3.8 });
  updaters.push((dt, t) => smoke.update(dt, t));
  blockers.push({ minX: x - 1.2, maxX: x + 1.2, minZ: z - 0.9, maxZ: z + 0.9 });
}

function buildGarden(g, blockers) {
  const { x, z, w, d } = OUTDOOR.garden;
  const y = heightAt(z);
  const halfW = w / 2;
  const halfD = d / 2;

  // 大鲤鱼池：石质池沿、下沉水面、锦鲤和左右树木。
  box(g, w + 1.2, 0.32, d + 1.2, x, y + 0.16, z, M.stone);
  box(g, w + 0.5, 0.18, d + 0.5, x, y + 0.38, z, M.stoneDark, { cast: false });
  plane(g, w - 0.15, d - 0.15, x, y + 0.47, z, M.waveBlue, [-Math.PI / 2, 0, 0]);
  plane(g, w - 0.8, d - 0.8, x, y + 0.475, z, M.waveBlueLight, [-Math.PI / 2, 0, 0]);

  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const fx = x + Math.cos(a) * (halfW * 0.62);
    const fz = z + Math.sin(a) * (halfD * 0.55);
    box(g, 0.32, 0.08, 0.18, fx, y + 0.54, fz, i % 2 ? M.lantern : M.goldDim, { cast: false });
  }

  // 左右树列，和池子一起围出观音—凌霄之间的小院。
  for (const side of [-1, 1]) {
    const tx = x + side * (halfW + 1.7);
    pineTree(g, { x: tx, y, z: z - 1.8, scale: 1.05, seed: 20 + side });
    pineTree(g, { x: tx, y, z: z + 1.8, scale: 1.0, seed: 24 + side });
    blockers.push({
      minX: tx - 0.65, maxX: tx + 0.65,
      minZ: z - 2.9, maxZ: z + 2.9,
    });
  }

  // 池子本身不可行走，玩家从两侧绕行后上台阶到凌霄阁。
  blockers.push({
    minX: x - halfW - 0.7, maxX: x + halfW + 0.7,
    minZ: z - halfD - 0.7, maxZ: z + halfD + 0.7,
  });
}

function buildCorridor(g, { x, z, length, axis = 'z', y = 0, width = 2.6, height = 3.2 }) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = axis === 'x' ? Math.PI / 2 : 0;
  g.add(group);

  const half = length / 2;
  for (let t = -half; t <= half + 0.01; t += 2.0) {
    for (const side of [-1, 1]) {
      column(group, {
        x: side * (width / 2 - 0.28), y, z: t,
        h: height, radius: 0.18, mat: M.lacquer,
      });
    }
    box(group, width, 0.16, 0.22, 0, y + height - 0.08, t, M.woodDark, { cast: false });
  }

  // 连廊主体是窄长屋顶，两端加小亭子屋顶。
  hippedRoof(group, {
    y: y + height + 0.08, width, depth: length + 0.5, rise: 0.72,
  });
  for (const end of [-1, 1]) {
    hippedRoof(group, {
      x: 0, y: y + height + 0.35, z: end * (half + 0.1),
      width: width + 1.0, depth: 3.2, rise: 0.95,
    });
  }
  for (const side of [-1, 1]) {
    box(group, 0.1, 0.72, length, side * (width / 2 - 0.2), y + 0.48, 0, M.woodDark, { cast: false });
  }
}

function buildFrontPlatform(g, surfaces) {
  const cfg = OUTDOOR.entrances.find((e) => e.id === 'shijia');
  if (!cfg) return;
  const x = cfg.x;
  const z = cfg.z + cfg.d / 2 + 2.1;
  const y = cfg.platform;
  box(g, 11.5, 0.24, 2.2, x, y + 0.12, z, M.stoneStep);
  box(g, 12.0, 0.08, 2.5, x, y + 0.26, z, M.stoneDark, { cast: false });
  surfaces.push({
    minX: x - 5.75, maxX: x + 5.75,
    minZ: z - 1.1, maxZ: z + 1.1,
    y: y + 0.28,
  });
}

function buildSideStair(g, surfaces) {
  // 释迦宝殿右侧上到潮音堂前院子的侧向石阶。
  const x0 = 8.4;
  const x1 = 13.2;
  const z0 = -13.6;
  const z1 = -20.0;
  const y0 = 1.25;
  const y1 = 1.95;
  const steps = 7;
  for (let i = 0; i < steps; i++) {
    const a = i / steps;
    const b = (i + 1) / steps;
    const za = z0 + (z1 - z0) * a;
    const zb = z0 + (z1 - z0) * b;
    const yy = y0 + (y1 - y0) * b;
    box(g, x1 - x0, yy - y0 + 0.12, Math.abs(zb - za) + 0.03,
      (x0 + x1) / 2, y0 + (yy - y0) / 2, (za + zb) / 2, M.stoneStep, { cast: false });
    surfaces.push({
      minX: x0, maxX: x1,
      minZ: Math.min(za, zb), maxZ: Math.max(za, zb),
      y: yy,
    });
  }
  for (const x of [x0 - 0.22, x1 + 0.22]) {
    balustrade(g, { x0: x, x1: x, z0, z1, y0, y1 });
  }
}

function buildSiteDetails(g, blockers, surfaces) {
  // 四合院式横向连廊：每条廊沿东西向，分成中轴两侧两段，
  // 中间留出通道，两端接左右厢房。
  const corridorPair = (z, y, leftStart, leftEnd, rightStart, rightEnd, width = 2.2) => {
    buildCorridor(g, {
      x: (leftStart + leftEnd) / 2, z, length: leftEnd - leftStart,
      axis: 'x', y, width,
    });
    buildCorridor(g, {
      x: (rightStart + rightEnd) / 2, z, length: rightEnd - rightStart,
      axis: 'x', y, width,
    });
  };

  // 天王殿—释迦宝殿院子：南、北两条横廊
  corridorPair(11.0, 0.55, -19, -7.5, 7.5, 19);
  corridorPair(-2.0, 1.25, -19, -8.5, 8.5, 19);

  // 释迦宝殿—潮音堂院子
  corridorPair(-13.0, 1.95, -19, -8.5, 8.5, 21.5);
  corridorPair(-25.0, 1.95, -19, -7.5, 7.5, 21.5);

  // 潮音堂—观音堂院子
  corridorPair(-35.0, 2.65, -19, -7.5, 7.5, 19.5);
  corridorPair(-48.0, 2.65, -19, -6.5, 6.5, 19.5);

  buildFrontPlatform(g, surfaces);
  buildSideStair(g, surfaces);
}

function buildPavilion(g, blockers) {
  const { x, z, w, d, h, platform } = OUTDOOR.pavilion;
  const y = platform;
  box(g, w + 1.2, 0.32, d + 1.2, x, y + 0.16, z, M.stone);
  box(g, w, 0.22, d, x, y + 0.4, z, M.woodDark, { cast: false });

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cx = x + sx * (w / 2 - 0.35);
      const cz = z + sz * (d / 2 - 0.35);
      column(g, { x: cx, y: y + 0.4, z: cz, h: h * 0.48, radius: 0.26, mat: M.gateRed });
      blockers.push({ minX: cx - 0.35, maxX: cx + 0.35, minZ: cz - 0.35, maxZ: cz + 0.35 });
    }
  }

  // 两层亭子：下层檐 + 上层小楼身和檐。
  hippedRoof(g, { y: y + h * 0.52, width: w + 1.8, depth: d + 1.8, rise: 1.15 });
  box(g, w * 0.62, h * 0.2, d * 0.62, x, y + h * 0.62, z, M.lacquer, { cast: false });
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      column(g, {
        x: x + sx * (w * 0.28), y: y + h * 0.7, z: z + sz * (d * 0.28),
        h: h * 0.2, radius: 0.18, mat: M.gateRed,
      });
    }
  }
  hippedRoof(g, { y: y + h * 0.82, width: w * 0.95, depth: d * 0.95, rise: 1.0 });

  for (const sx of [-1, 1]) {
    box(g, 0.12, 0.62, d * 0.72, x + sx * (w / 2 - 0.3), y + h * 0.3, z, M.woodDark, { cast: false });
  }
}

function buildScenery(g, blockers) {
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1;
    const px = side * (49 + (i % 4) * 4.2);
    const pz = 42 - Math.floor(i / 2) * 13.5;
    pineTree(g, { x: px, y: -0.06, z: pz, scale: 0.9 + (i % 3) * 0.25, seed: i + 3 });
  }
  const lanternZ = [34, 13, -3, -21, -40];
  for (let i = 0; i < lanternZ.length; i++) {
    const pz = lanternZ[i];
    const px = i % 2 ? 10.6 : -10.6;
    const scale = 1.15;
    stoneLantern(g, { x: px, y: heightAt(pz), z: pz, scale, light: false });
    blockers.push({
      minX: px - 0.62 * scale, maxX: px + 0.62 * scale,
      minZ: pz - 0.62 * scale, maxZ: pz + 0.62 * scale,
    });
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const scale = 0.7 + Math.random() * 0.8;
    const rx = Math.cos(a) * 27;
    const rz = 44 + Math.sin(a) * 6;
    rock(g, { x: rx, y: -0.05, z: rz, scale, seed: i + 1 });
    blockers.push({
      minX: rx - 0.85 * scale, maxX: rx + 0.85 * scale,
      minZ: rz - 0.7 * scale, maxZ: rz + 0.7 * scale,
    });
  }
  // distant ridges（方块阶梯山，Minecraft 风）
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 95 + Math.random() * 45;
    const mat = new THREE.MeshStandardMaterial({ color: 0x78867c, roughness: 1, flatShading: true });
    const mnt = new THREE.Group();
    const base = 30 + Math.random() * 26;
    for (let k = 0; k < 3; k++) {
      const s = 1 - k * 0.28;
      const m = new THREE.Mesh(new THREE.BoxGeometry(base * s, 9, base * 0.82 * s), mat);
      m.position.y = k * 8.6;
      m.castShadow = false;
      m.receiveShadow = false;
      mnt.add(m);
    }
    mnt.position.set(Math.cos(a) * r, -6, Math.sin(a) * r - 4);
    mnt.rotation.y = Math.random() * Math.PI;
    g.add(mnt);
  }
}

function buildWall(g, blockers) {
  const { half, z } = OUTDOOR.wall;
  box(g, half * 2, 0.7, 5.0, 0, 0.35, z, M.stone);
  box(g, half * 2 - 1.6, 4.2, 0.5, 0, 2.1, z, M.stoneDark);
  box(g, half * 2 - 0.6, 0.3, 1.6, 0, 4.35, z, M.stone, { cast: false });
  plaque(g, '天下径山', { x: 0, y: 2.7, z: z - 0.32, w: 5.2, h: 1.9, ry: Math.PI });
  blockers.push({ minX: -half, maxX: half, minZ: z - 0.8, maxZ: z + 0.8 });
}

export function create(ctx) {
  const scene = new THREE.Scene();
  const fogColor = 0xc9d2cf;
  scene.fog = new THREE.Fog(fogColor, 55, 180);

  const skyMat = new THREE.MeshBasicMaterial({ map: ctx.textures.sky(), side: THREE.BackSide, fog: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(190, 32, 20), skyMat);
  scene.add(sky);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), M.earth);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);

  const world = new THREE.Group();
  scene.add(world);

  const blockers = [];
  const interactives = [];
  const updaters = [];
  const surfaces = [];
  // 行走高度：地形（含真实踏面）与门前石阶平台取较高者
  function walkHeight(z, x = 0) {
    let h = terrainHeight(z, x);
    for (const s of surfaces) {
      if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) h = Math.max(h, s.y);
    }
    return h;
  }

  buildTerraces(world, blockers, surfaces);

  for (const cfg of OUTDOOR.entrances) {
    if (cfg.id === 'tianwang') {
      // 山门即天王殿：殿内直接连通室外，不再单开地图，也无需「入殿」交互
      buildGate(world, cfg, blockers, surfaces, interactives, updaters);
      continue;
    }
    buildHall(world, cfg, blockers, surfaces);
    installHall(world,cfg,blockers,surfaces,interactives,updaters);
  }

  // 祖堂、五观堂等纯景观建筑（不设拜位），配置与小地图共用
  for (const cfg of OUTDOOR.scenery) {
    buildHall(world, cfg, blockers, surfaces);
    installHall(world,cfg,blockers,surfaces,interactives,updaters);
  }

  buildWall(world, blockers);
  buildSiteDetails(world, blockers, surfaces);
  buildIncenseStand(world, blockers, updaters);
  buildGarden(world, blockers);
  buildPavilion(world, blockers);
  buildScenery(world, blockers);
  mergeStatic(world);

  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);
  sun.position.set(38, 62, 28);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -90;
  sun.shadow.camera.right = 90;
  sun.shadow.camera.top = 100;
  sun.shadow.camera.bottom = -100;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 160;
  sun.shadow.bias = -0.0002;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xdfe9ee, 0x5b5342, 0.72));
  scene.add(new THREE.AmbientLight(0xfff2dd, 0.2));

  const bounds = OUTDOOR.bounds;

  return {
    id: 'outdoor',
    name: OUTDOOR.name,
    subtitle: OUTDOOR.subtitle,
    scene, bounds, blockers, interactives,
    spawn: OUTDOOR.spawn,
    floorHeight: walkHeight,
    zoneAt(x, z) {
      for (const cfg of [...OUTDOOR.entrances, ...OUTDOOR.scenery]) {
        if (inFootprint(cfg, x, z)) {
          return { id: cfg.id, name: cfg.name, subtitle: cfg.sub };
        }
      }
      const g = OUTDOOR.garden;
      if (Math.abs(x - g.x) < g.w / 2 + 1 && Math.abs(z - g.z) < g.d / 2 + 1) {
        return { id: g.id, name: '鲤池', subtitle: '锦鲤 · 树影' };
      }
      return { id: 'outdoor', name: OUTDOOR.name, subtitle: OUTDOOR.subtitle };
    },
    cameraTargetAt(x, z) {
      for (const cfg of [...OUTDOOR.entrances, ...OUTDOOR.scenery]) {
        if (inFootprint(cfg, x, z)) {
          return 2.1;
        }
      }
      return 1.2;
    },
    cameraMaxAt(x, z) {
      for (const cfg of [...OUTDOOR.entrances, ...OUTDOOR.scenery]) {
        if (inFootprint(cfg, x, z, 1.0)) {
          return Math.max(1.1, Math.min(4.6, cfg.d / 2 - 0.9));
        }
      }
      return 4.6;
    },
    update(dt, t) {
      for (const u of updaters) u(dt, t);
    },
    dispose() {},
  };
}
