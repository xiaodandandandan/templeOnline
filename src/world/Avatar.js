import * as THREE from 'three';
import { M } from './Materials.js';
import { box } from './Props.js';

/**
 * Minecraft 风游客：方头方身、像素五官、短袖短裤、运动鞋。
 * 1 格当 1 米，总高约 1.8m；局部 +Z 为正面，Player 按 facing 旋转。
 * 支持行走、奔跑、跪坐、合十与拜拜。
 */
export function createAvatar() {
  const root = new THREE.Group();
  const bob = new THREE.Group();
  root.add(bob);

  const HIP = 0.66;
  const HEAD_Y = 0.91; // 头部中心（相对躯干组）

  // ---------------- 双腿（大腿 + 小腿两段，便于跪坐） ----------------
  const legL = new THREE.Group();
  legL.position.set(-0.12, HIP, 0);
  bob.add(legL);
  const legR = new THREE.Group();
  legR.position.set(0.12, HIP, 0);
  bob.add(legR);
  const shinL = new THREE.Group();
  shinL.position.set(0, -0.30, 0);
  legL.add(shinL);
  const shinR = new THREE.Group();
  shinR.position.set(0, -0.30, 0);
  legR.add(shinR);
  for (const leg of [legL, legR]) {
    box(leg, 0.24, 0.30, 0.24, 0, -0.15, 0, M.touristShorts, { cast: false });
  }
  for (const shin of [shinL, shinR]) {
    box(shin, 0.22, 0.24, 0.22, 0, -0.12, 0, M.touristSkin, { cast: false });
    box(shin, 0.24, 0.13, 0.28, 0, -0.27, 0.02, M.touristShoe);
    box(shin, 0.25, 0.03, 0.29, 0, -0.325, 0.02, M.touristSole, { cast: false });
  }

  // ---------------- 上身（拜拜时以腰为轴前俯） ----------------
  const torso = new THREE.Group();
  torso.position.set(0, HIP, 0);
  bob.add(torso);

  box(torso, 0.46, 0.62, 0.24, 0, 0.31, 0, M.touristShirt);
  box(torso, 0.14, 0.07, 0.14, 0, 0.645, 0, M.touristSkin, { cast: false });

  // 短袖手臂
  const armL = new THREE.Group();
  armL.position.set(-0.35, 0.53, 0);
  torso.add(armL);
  const armR = new THREE.Group();
  armR.position.set(0.35, 0.53, 0);
  torso.add(armR);
  for (const arm of [armL, armR]) {
    box(arm, 0.24, 0.20, 0.24, 0, -0.10, 0, M.touristShirt);
    box(arm, 0.22, 0.40, 0.22, 0, -0.42, 0, M.touristSkin, { cast: false });
    box(arm, 0.22, 0.10, 0.22, 0, -0.66, 0, M.touristSkin, { cast: false });
  }

  // ---------------- 方块头 ----------------
  box(torso, 0.46, 0.46, 0.46, 0, HEAD_Y, 0, M.touristSkin);
  // 头发：顶盖 + 侧鬓 + 后脑（下方留肤色，避免背面一团黑）
  box(torso, 0.48, 0.10, 0.48, 0, HEAD_Y + 0.21, 0, M.touristHair, { cast: false });
  box(torso, 0.48, 0.32, 0.06, 0, HEAD_Y + 0.12, -0.235, M.touristHair, { cast: false });
  box(torso, 0.06, 0.30, 0.44, -0.235, HEAD_Y + 0.13, 0.0, M.touristHair, { cast: false });
  box(torso, 0.06, 0.30, 0.44, 0.235, HEAD_Y + 0.13, 0.0, M.touristHair, { cast: false });
  // 鬓角
  box(torso, 0.06, 0.12, 0.10, -0.24, HEAD_Y + 0.06, 0.17, M.touristHair, { cast: false });
  box(torso, 0.06, 0.12, 0.10, 0.24, HEAD_Y + 0.06, 0.17, M.touristHair, { cast: false });

  // 像素五官
  const F = 0.236;
  box(torso, 0.08, 0.08, 0.02, -0.10, HEAD_Y + 0.04, F, M.black, { cast: false });
  box(torso, 0.08, 0.08, 0.02, 0.10, HEAD_Y + 0.04, F, M.black, { cast: false });
  box(torso, 0.06, 0.06, 0.03, 0, HEAD_Y - 0.02, F, M.touristSkin, { cast: false });
  box(torso, 0.14, 0.035, 0.02, 0, HEAD_Y - 0.10, F, M.touristHair, { cast: false });
  // 方耳
  box(torso, 0.06, 0.12, 0.09, -0.27, HEAD_Y + 0.01, 0, M.touristSkin, { cast: false });
  box(torso, 0.06, 0.12, 0.09, 0.27, HEAD_Y + 0.01, 0, M.touristSkin, { cast: false });

  return {
    root,
    animate(walkPhase = 0, moving = false, running = false, bowK = 0, kneelK = 0, palmsK = 0) {
      const swing = moving ? Math.sin(walkPhase) : 0;
      const amp = running ? 0.62 : 0.46;
      // 跪坐：大腿前折平放于蒲团，小腿回折收于臀下
      legL.rotation.x = swing * amp * (1 - kneelK) - 1.45 * kneelK;
      legR.rotation.x = -swing * amp * (1 - kneelK) - 1.45 * kneelK;
      shinL.rotation.x = 2.9 * kneelK;
      shinR.rotation.x = 2.9 * kneelK;

      // 跪坐时双手轻搭膝上；合十后双臂向胸前收拢、双掌合于胸前
      const armDownL = -swing * amp * 0.9 * (1 - palmsK);
      const armDownR = swing * amp * 0.9 * (1 - palmsK);
      const restK = kneelK * (1 - palmsK);
      armL.rotation.x = armDownL - 1.25 * palmsK - 0.32 * restK;
      armR.rotation.x = armDownR - 1.25 * palmsK - 0.32 * restK;
      armL.rotation.z = 0.5 * palmsK;
      armR.rotation.z = -0.5 * palmsK;

      torso.rotation.z = moving ? Math.sin(walkPhase) * 0.05 : 0;
      // 跪姿时前俯幅度收窄，呈躬身合十而非伏地
      torso.rotation.x = bowK * (1 - 0.45 * kneelK);
      const stepBob = moving ? Math.abs(Math.sin(walkPhase)) * 0.05 : 0;
      bob.position.y = stepBob - 0.30 * kneelK - 0.13 * bowK * (1 - kneelK);
    },
  };
}
