import * as THREE from 'three';
import { createAvatar } from '../world/Avatar.js';

const RADIUS = 0.36;
const MAX_STEP = 0.42;
const CAM_DIST = 4.6;
const CAM_MIN = 0.25;
const TARGET_H = 1.2;
const PITCH_MIN = -0.86;
const PITCH_MAX = 0.58;
// 跪坐时整体抬高，让腿落在蒲团面之上而不是陷入蒲团
const KNEEL_LIFT = 0.14;

function blocked(map, x, z) {
  const b = map.bounds;
  if (x < b.minX + RADIUS || x > b.maxX - RADIUS) return true;
  if (z < b.minZ + RADIUS || z > b.maxZ - RADIUS) return true;
  for (const o of map.blockers) {
    if (
      x > o.minX - RADIUS && x < o.maxX + RADIUS &&
      z > o.minZ - RADIUS && z < o.maxZ + RADIUS
    ) return true;
  }
  return false;
}

/** 台阶立面阻挡：用身体前缘采样行走高度，抬升超过 MAX_STEP 则不能再前进 */
function stepBlocked(map, x, z, y, dirX, dirZ) {
  if (!map.floorHeight) return false;
  const len = Math.hypot(dirX, dirZ);
  if (len < 1e-5) return false;
  const fx = x + (dirX / len) * RADIUS;
  const fz = z + (dirZ / len) * RADIUS;
  return map.floorHeight(fz, fx) - y > MAX_STEP;
}

function cameraBlocked(map, x, z) {
  const pad = 0.12;
  const b = map.bounds;
  if (x < b.minX + pad || x > b.maxX - pad) return true;
  if (z < b.minZ + pad || z > b.maxZ - pad) return true;
  for (const o of map.blockers) {
    if (
      x > o.minX - pad && x < o.maxX + pad &&
      z > o.minZ - pad && z < o.maxZ + pad
    ) return true;
  }
  return false;
}

export class Player {
  constructor(camera) {
    this.camera = camera;
    this.map = null;
    this.position = new THREE.Vector3();
    this.yaw = 0;      // 相机环绕角，只由鼠标控制
    this.facing = Math.PI; // 人物朝向，只在移动时更新
    this.pitch = 0.05;
    this.kneeling = false;
    this.kneelK = 0;
    this.palms = false;
    this.palmsK = 0;
    this.bowing = false;
    this.bowT = 0;
    this._peak = false;
    this._onPeak = null;
    this.walkPhase = 0;

    this.avatar = createAvatar();
    this.avatarAnim = this.avatar;
  }

  attach(map, spawn) {
    this.map = map;
    const s = spawn || map.spawn;
    this.yaw = s.yaw ?? 0;
    this.facing = this.yaw + Math.PI;
    this.pitch = 0.05;
    this.kneeling = false;
    this.kneelK = 0;
    this.palms = false;
    this.palmsK = 0;
    this.bowing = false;
    this.bowT = 0;
    this._peak = false;
    this.walkPhase = 0;
    const floor = map.floorHeight(s.z, s.x);
    this.position.set(s.x, floor, s.z);
    this.avatar.animate(0, false, false, 0);
    this.sync();
  }

  sync() {
    const x = this.position.x;
    const y = this.position.y;
    const z = this.position.z;

    this.avatar.root.position.set(x, y, z);
    this.avatar.root.rotation.y = this.facing;

    // 第三人称环绕相机：位于小人斜后方，遇墙自动收近
    const side = 0.55;
    const maxDist = this.map?.cameraMaxAt?.(x, z) ?? CAM_DIST;
    let dist = CAM_MIN;
    let camX = x;
    let camZ = z;
    for (let candidate = 0.08; candidate <= maxDist; candidate += 0.08) {
      const horiz = candidate * Math.cos(this.pitch);
      const shoulder = side * Math.min(1, candidate / CAM_DIST);
      const cx = x + Math.sin(this.yaw) * horiz + Math.cos(this.yaw) * shoulder;
      const cz = z + Math.cos(this.yaw) * horiz - Math.sin(this.yaw) * shoulder;
      if (this.map && cameraBlocked(this.map, cx, cz)) break;
      dist = candidate;
      camX = cx;
      camZ = cz;
    }
    // 小殿堂里相机会被墙拉得很近；此时隐藏小人，避免整个屏幕被后脑勺占满。
    this.avatar.root.visible = dist > 2.2;
    const targetH = this.map?.cameraTargetAt?.(x, z) ?? TARGET_H;
    const ty = y + targetH;
    const floor = this.map ? this.map.floorHeight(camZ, camX) : 0;
    const camY = Math.max(y + 0.4, floor + 0.24, ty + 0.95 - Math.sin(this.pitch) * dist);

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(x, ty, z);
  }

  update(dt, input, map) {
    const look = input.takeLook();
    if (!this.bowing) {
      this.yaw += look.x;
      this.pitch = THREE.MathUtils.clamp(this.pitch + look.y, PITCH_MIN, PITCH_MAX);
    }

    const ease = Math.min(1, dt * 9);
    this.kneelK += ((this.kneeling ? 1 : 0) - this.kneelK) * ease;
    this.palmsK += ((this.palms ? 1 : 0) - this.palmsK) * ease;

    if (this.bowing) {
      this.bowT += dt / 1.65;
      const p = Math.min(1, this.bowT);
      const k = Math.sin(Math.PI * p);
      if (!this._peak && p >= 0.52) {
        this._peak = true;
        if (this._onPeak) this._onPeak();
      }
      this.position.y = map.floorHeight(this.position.z, this.position.x) + KNEEL_LIFT * this.kneelK;
      this.avatar.animate(0, false, false, k, this.kneelK, this.palmsK);
      this.sync();
      if (p >= 1) {
        this.bowing = false;
        this.bowT = 0;
        this._onPeak = null;
        this.avatar.animate(0, false, false, 0, this.kneelK, this.palmsK);
        this.position.y = map.floorHeight(this.position.z, this.position.x) + KNEEL_LIFT * this.kneelK;
        this.sync();
      }
      return;
    }

    const axis = input.axis();
    const moving = Math.hypot(axis.x, axis.y) > 0.02;

    // 跪坐时不动则保持跪姿；一旦移动便自动起身
    if (this.kneeling && !moving) {
      this.position.y = map.floorHeight(this.position.z, this.position.x) + KNEEL_LIFT * this.kneelK;
      this.avatar.animate(0, false, false, 0, this.kneelK, this.palmsK);
      this.sync();
      return;
    }
    if (this.kneeling) {
      this.kneeling = false;
      this.palms = false;
    }

    const speed = input.isRunning() ? 5.4 : 3.2;

    if (moving) {
      this.palms = false;
      const fwdX = -Math.sin(this.yaw);
      const fwdZ = -Math.cos(this.yaw);
      const rightX = Math.cos(this.yaw);
      const rightZ = -Math.sin(this.yaw);

      // 人物只朝行进方向转身；相机可任意环绕，始终能看到各个视图
      const dirX = fwdX * axis.y + rightX * axis.x;
      const dirZ = fwdZ * axis.y + rightZ * axis.x;
      const target = Math.atan2(dirX, dirZ);
      const turn = Math.atan2(
        Math.sin(target - this.facing),
        Math.cos(target - this.facing),
      );
      this.facing += turn * Math.min(1, dt * 12);

      const dx = dirX * speed * dt;
      const dz = dirZ * speed * dt;

      const nx = this.position.x + dx;
      const nz = this.position.z + dz;
      if (!blocked(map, nx, this.position.z) &&
          !stepBlocked(map, nx, this.position.z, this.position.y, dx, dz)) this.position.x = nx;
      if (!blocked(map, this.position.x, nz) &&
          !stepBlocked(map, this.position.x, nz, this.position.y, dx, dz)) this.position.z = nz;

      this.walkPhase += dt * (input.isRunning() ? 10.5 : 7.6);
    }

    const floor = map.floorHeight(this.position.z, this.position.x);
    if (floor > this.position.y) {
      // 上行踩实台阶，避免脚部陷入踏面
      this.position.y = floor;
    } else {
      this.position.y += (floor - this.position.y) * Math.min(1, dt * 16);
      if (Math.abs(floor - this.position.y) < 0.004) this.position.y = floor;
    }

    this.avatar.animate(this.walkPhase, moving, input.isRunning(), 0, this.kneelK, this.palmsK);
    this.sync();
  }

  nearest(interactives) {
    let best = null;
    let bestD = Infinity;
    for (const it of interactives) {
      const d = Math.hypot(it.x - this.position.x, it.z - this.position.z);
      if (d <= it.radius && d < bestD) {
        bestD = d;
        best = it;
      }
    }
    return best;
  }

  // 跪坐于蒲团上，面朝佛像
  startKneel(x, z, facing) {
    this.bowing = false;
    this.bowT = 0;
    this._onPeak = null;
    this.kneeling = true;
    this.palms = false;
    this.position.x = x;
    this.position.z = z;
    if (facing != null) {
      this.facing = facing;
      this.yaw = facing - Math.PI;
    }
    if (this.map) this.position.y = this.map.floorHeight(z, x) + KNEEL_LIFT * this.kneelK;
    this.sync();
  }

  standUp() {
    if (this.bowing) return false;
    this.kneeling = false;
    this.palms = false;
    this.sync();
    return true;
  }

  // 合十拜拜：跪姿或站姿均可
  startPray(onPeak) {
    if (this.bowing) return false;
    this.bowing = true;
    this.palms = true;
    this.bowT = 0;
    this._peak = false;
    this._onPeak = onPeak;
    return true;
  }

  teleport(x, z, yaw = this.yaw) {
    this.position.x = x;
    this.position.z = z;
    if (yaw != null) {
      this.yaw = yaw;
      this.facing = yaw + Math.PI;
    }
    if (this.map) this.position.y = this.map.floorHeight(z, x);
    this.sync();
  }
}
