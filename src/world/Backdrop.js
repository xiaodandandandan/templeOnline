import * as THREE from 'three';
import { localToWorld } from './Orientation.js';

// 这些是用原 3D 殿堂预渲染的 2.5D 背景，包含佛像、背光、壁画和室内透视。
// 运行时不加载这些佛像的方块几何，只保留一张贴图。
export const BACKDROP_HALLS = new Set([
  'shijia', 'chaoyin', 'guanyin', 'lingxiao', 'yaoshi', 'longwang', 'caishen',
]);

const loader = new THREE.TextureLoader();

/** 背景图已经包含佛像和匾额，运行时移除这些重复的 3D 对象。 */
export function removeBakedProps(root) {
  const props = [];
  root.traverse((object) => {
    if (object.userData.isStatue || object.userData.isPlaque) props.push(object);
  });
  for (const prop of props) prop.removeFromParent();
  return props.length;
}

export function addBackdrop(world, cfg, { floorY, wallH }) {
  const material = new THREE.MeshBasicMaterial({
    color: 0x2b2118,
    toneMapped: false,
    fog: false,
  });
  // 预渲染图的宽高比就是目标后墙的宽高比，运行时直接铺满。
  const width = cfg.w * 0.99;
  const height = wallH * 0.99;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  const back = localToWorld(cfg, 0, -cfg.d / 2 + 0.26);
  mesh.position.set(back.x, floorY + height / 2, back.z);
  mesh.rotation.y = cfg.ry || 0;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.noMerge = true;
  world.add(mesh);

  // Node 回归测试没有 DOM；只验证几何/交互，不加载图片。
  if (typeof document === 'undefined') return mesh;

  loader.load(`./assets/backdrops/${cfg.id}.jpg`, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    material.map = texture;
    material.color.set(0xffffff);
    material.needsUpdate = true;
  }, undefined, () => {
    console.warn(`[径山寺] 背景图加载失败: ${cfg.id}`);
  });

  return mesh;
}
