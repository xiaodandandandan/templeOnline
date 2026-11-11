import * as THREE from 'three';
import { T, P } from '../core/Textures.js';

const std = (opts) => new THREE.MeshStandardMaterial(opts);

export const M = {
  floorStone: std({ map: P.stoneFloor([11, 13]), roughness: 0.92, metalness: 0.02 }),
  floorWood: std({ map: P.woodLight([6, 6]), roughness: 0.56, metalness: 0.02 }),
  path: std({ map: P.path([8, 12]), roughness: 0.9 }),
  earth: std({ map: P.grass([14, 14]), roughness: 1 }),
  plaster: std({ map: P.plaster([4, 3]), color: 0xf2eee5, roughness: 0.94 }),
  wallWhite: std({ color: 0xf7f4ec, roughness: 0.96 }),
  plasterWhite: std({ color: 0xf3efe6, roughness: 0.95 }),
  railingTeal: std({ color: 0x2d7f78, roughness: 0.5, metalness: 0.08 }),
  railingTealDark: std({ color: 0x23645f, roughness: 0.55, metalness: 0.08 }),
  wood: std({ map: P.woodWarm([2, 2]), roughness: 0.62 }),
  woodDark: std({ map: P.woodDark([2, 2]), roughness: 0.66 }),
  woodLight: std({ map: P.woodLight([3, 3]), roughness: 0.58 }),
  lacquer: std({ map: P.woodWarm([2, 2]), color: 0xb94d38, roughness: 0.42, metalness: 0.05 }),
  gateRed: std({ map: P.woodWarm([2, 2]), color: 0xd25b44, roughness: 0.4, metalness: 0.05 }),
  lacquerDark: std({ map: P.woodDark([2, 2]), color: 0x8e3a2b, roughness: 0.44 }),
  stone: std({ map: P.stoneBrick([4, 3]), roughness: 0.92 }),
  stoneDark: std({ map: P.stoneBrick([4, 3]), color: 0x8d887b, roughness: 0.95 }),
  stoneStep: std({ map: P.stoneStep([4, 2]), roughness: 0.9 }),
  roof: std({ map: P.roof([8, 4]), color: 0xffffff, roughness: 0.82, metalness: 0.05 }),
  roofEdge: std({ color: 0x343a3e, roughness: 0.8 }),
  ridge: std({ color: 0x2e3336, roughness: 0.75 }),
  gold: std({ map: P.gold([1, 1]), color: 0xffffff, metalness: 0.55, roughness: 0.34, emissive: 0x2a1a08, emissiveIntensity: 0.18 }),
  goldDim: std({ map: P.gold([1, 1]), color: 0xcbb282, metalness: 0.4, roughness: 0.46 }),
  bronze: std({ map: P.bronze([1, 1]), metalness: 0.6, roughness: 0.44 }),
  jade: std({ map: P.jade([1, 1]), metalness: 0.08, roughness: 0.5 }),
  skinGold: std({ map: P.gold([1, 1]), color: 0xf4e3c0, metalness: 0.25, roughness: 0.42 }),
  hair: std({ color: 0x2b2b35, roughness: 0.62, metalness: 0.14 }),
  robeRed: std({ map: P.brocade([1, 1]), color: 0xd8a08c, roughness: 0.58 }),
  robeGreen: std({ map: P.brocade([1, 1]), color: 0x9fb39a, roughness: 0.6 }),
  armor: std({ color: 0x6d5a45, metalness: 0.35, roughness: 0.55 }),
  cushion: std({ map: P.brocade([1, 1]), roughness: 0.82 }),
  cloth: std({ map: P.cloth([1, 1]), roughness: 0.87 }),
  carpet: std({ map: P.carpet([4, 4]), roughness: 0.94 }),
  door: std({ map: P.door(), roughness: 0.6, metalness: 0.06 }),
  lantern: std({ color: 0xd44f2a, emissive: 0xff7326, emissiveIntensity: 0.55, roughness: 0.78 }),
  black: std({ color: 0x171210, roughness: 0.7 }),
  slate: std({ color: 0x4a4d4a, roughness: 0.9 }),
  pine: std({ color: 0x41513e, roughness: 0.95 }),
  pineDark: std({ color: 0x34422f, roughness: 0.95 }),
  trunk: std({ color: 0x4a3626, roughness: 0.92 }),
  flame: new THREE.MeshBasicMaterial({ color: 0xffb545, transparent: true, opacity: 0.95 }),
  flameCore: new THREE.MeshBasicMaterial({ color: 0xfff3cf, transparent: true, opacity: 0.9 }),
  halo: new THREE.SpriteMaterial({
    map: T.halo(),
    color: 0xffd98f,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
  smoke: new THREE.SpriteMaterial({
    map: T.smoke(),
    color: 0xe6ddca,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  }),
  touristSkin: std({ color: 0xefd8b4, roughness: 0.97 }),
  touristShirt: std({ color: 0x7195a0, roughness: 0.96 }),
  touristShorts: std({ color: 0x9a8461, roughness: 0.96 }),
  touristShoe: std({ color: 0xd9d2c5, roughness: 0.96 }),
  touristSole: std({ color: 0x44403c, roughness: 0.97 }),
  touristHair: std({ color: 0x5a4636, roughness: 0.94 }),
  touristPack: std({ color: 0xb07a3e, roughness: 0.95 }),
  // 佛像（体素风：金身 + 紫红袈裟）
  voxGold: std({ color: 0xe4ac42, metalness: 0.22, roughness: 0.55 }),
  voxGoldLight: std({ color: 0xf2c86c, metalness: 0.18, roughness: 0.55 }),
  voxGoldDeep: std({ color: 0xb5792e, metalness: 0.24, roughness: 0.6 }),
  voxPlum: std({ color: 0x995f70, roughness: 0.9 }),
  voxPlumDark: std({ color: 0x633e4c, roughness: 0.9 }),
  voxHair: std({ map: P.plum([1, 1]), color: 0x9a8890, roughness: 0.9 }),
  hairBrown: std({ color: 0x6a4a2e, roughness: 0.62, metalness: 0.08 }),
  gemRed: std({ color: 0xc0392b, metalness: 0.35, roughness: 0.3, emissive: 0x3a0a06, emissiveIntensity: 0.4 }),
  gemTeal: std({ color: 0x2f9e8f, metalness: 0.35, roughness: 0.3, emissive: 0x07231f, emissiveIntensity: 0.4 }),
  gemBlue: std({ color: 0x2b5fbf, metalness: 0.35, roughness: 0.3, emissive: 0x061532, emissiveIntensity: 0.4 }),
  // 水月观音组像（参考径山寺实景）：朱红裙、青绿披帛、崖壁与海浪、莲座
  skinFair: std({ color: 0xe6c7a2, roughness: 0.56 }),
  skinFairLight: std({ color: 0xf3ddbd, roughness: 0.5 }),
  skinFairDeep: std({ color: 0xc8a47d, roughness: 0.62 }),
  robeCoral: std({ color: 0xc25a43, roughness: 0.64 }),
  robeCoralLight: std({ color: 0xd97a5d, roughness: 0.6 }),
  robeCoralDark: std({ color: 0x9d4030, roughness: 0.68 }),
  sashTeal: std({ color: 0x4b8b80, roughness: 0.64 }),
  sashTealDark: std({ color: 0x35665e, roughness: 0.68 }),
  rockTeal: std({ color: 0x507b71, roughness: 0.96 }),
  rockTealDark: std({ color: 0x3a5d55, roughness: 0.97 }),
  rockTealLight: std({ color: 0x6b9589, roughness: 0.94 }),
  waveBlue: std({ color: 0x5d7fa0, roughness: 0.82 }),
  waveBlueLight: std({ color: 0x86a7c2, roughness: 0.78 }),
  foam: std({ color: 0xe7eeea, roughness: 0.86 }),
  lotusPink: std({ color: 0xe6a0a2, roughness: 0.72 }),
  lotusPinkLight: std({ color: 0xf2c1c1, roughness: 0.66 }),
  lotusPinkDark: std({ color: 0xcf8589, roughness: 0.74 }),
  lotusLeaf: std({ color: 0x6f9970, roughness: 0.86 }),
  clothWhite: std({ color: 0xeee6d6, roughness: 0.88 }),
  ribbonRed: std({ color: 0xc0433a, roughness: 0.72 }),
  flameOrange: std({ color: 0xe07a3f, roughness: 0.7, emissive: 0x3a1204, emissiveIntensity: 0.12 }),
  flameRed: std({ color: 0xb8452e, roughness: 0.72 }),
  interiorShell: std({ color: 0x241a12, roughness: 0.98, side: THREE.BackSide }),
};

export function plaqueMaterial(name) {
  const map = P.plaque(name);
  return new THREE.MeshStandardMaterial({ map, roughness: 0.52, metalness: 0.15 });
}

export function verticalPlaqueMaterial(name) {
  const map = P.plaqueVertical(name);
  return new THREE.MeshStandardMaterial({ map, roughness: 0.52, metalness: 0.15 });
}

export function muralMaterial(seed) {
  const map = P.mural(seed);
  return new THREE.MeshStandardMaterial({
    map,
    roughness: 0.9,
    emissive: 0xffffff,
    emissiveMap: map,
    emissiveIntensity: 0.16,
  });
}
