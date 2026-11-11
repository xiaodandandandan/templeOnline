import * as THREE from 'three';
import { M } from '../Materials.js';
import { box } from '../Props.js';
import { buildRoomShell } from '../Room.js';
import { createAltar } from '../Altar.js';
import { createCushionSet } from '../Cushion.js';
import { Smoke } from '../Props.js';

export function createHallBase({
  id, name, subtitle, w, d, h,
  wallSeed = 1,
  floorMat = M.floorStone,
  fogDensity = 0.006,
  spawnZ,
}) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x211a13, fogDensity);
  const shell = buildRoomShell({ w, d, h, name, wallSeed, floorMat });
  scene.add(shell.group);

  const interactives = [];
  const blockers = [...shell.blockers];
  const updaters = [];
  const cushionSets = [];
  const spawn = { x: 0, z: spawnZ ?? d / 2 - 3.2, yaw: 0 };

  interactives.push({
    id: `exit:${id}`,
    type: 'exit',
    name: '出殿',
    hall: name,
    label: '出殿 · 返回庭院',
    x: 0, z: d / 2 - 1.55,
    radius: 2.4,
  });

  function addAltar({ x, z, width = 4.2, scale = 1, lightOn = true }) {
    const altar = createAltar({ x, z, width, scale, y: 0, lightOn });
    scene.add(altar.group);
    updaters.push((dt, t) => altar.update(dt, t));
    const smoke = new Smoke(scene, { ...altar.smokeOrigin, count: 4, height: 3.4, spread: 0.5 });
    updaters.push((dt, t) => smoke.update(dt, t));
    blockers.push({
      minX: x - width / 2 - 0.35, maxX: x + width / 2 + 0.35,
      minZ: z - 0.95, maxZ: z + 0.95,
    });
    return altar;
  }

  function addCushions({ x = 0, z, count = 3, spacing = 1.0, y = 0.02 }) {
    cushionSets.push({x,z,points:createCushionSet(scene, { x, z, count, spacing, y })});
  }

  function addDais({ x = 0, z, width, depth = 7, height = 0.35 }) {
    box(scene, width, height, depth, x, height / 2, z, M.stone);
    box(scene, width + 0.4, 0.08, depth + 0.4, x, height + 0.04, z, M.stoneDark, { cast: false });
    blockers.push({
      minX: x - width / 2 - 0.2, maxX: x + width / 2 + 0.2,
      minZ: z - depth / 2 - 0.2, maxZ: z + depth / 2 + 0.2,
    });
  }

  function addPoint({ id: pid, name: pname, x, z, statueX, statueZ, hall = name }) {
    const set=cushionSets.find(c=>c.x===x && c.z===z);
    for(const [i,p] of (set?.points||[{x,z}]).entries()) interactives.push({
      id:pid+':'+i,type:'cushion',name:pname,hall,label:'跪拜 · '+pname,
      x:p.x,z:p.z,statueX,statueZ,radius:1.1,
      setX:x,seatIndex:i,seatCount:set?.points.length||1,
    });
  }

  function addSpot({ x, y, z, tx, ty = 2.4, tz, intensity = 60, angle = 0.4, shadow = false, color = 0xffd8a2 }) {
    const s = new THREE.SpotLight(color, intensity, 34, angle, 0.55, 1.5);
    s.position.set(x, y, z);
    s.target.position.set(tx, ty, tz);
    s.castShadow = shadow;
    if (shadow) {
      s.shadow.mapSize.set(1024, 1024);
      s.shadow.bias = -0.0004;
    }
    scene.add(s);
    scene.add(s.target);
    return s;
  }

  // 厅内两侧补光，避免死黑
  addSpot({ x: -w * 0.28, y: h - 1.2, z: d * 0.18, tx: -w * 0.1, tz: -d * 0.1, intensity: 26, angle: 0.8, color: 0xffe0b8 });
  addSpot({ x: w * 0.28, y: h - 1.2, z: d * 0.18, tx: w * 0.1, tz: -d * 0.1, intensity: 26, angle: 0.8, color: 0xffe0b8 });

  function finish() {
    return {
      id,
      name,
      subtitle,
      scene,
      shell:shell.group,shellBlockers:shell.blockers,dimensions:{w,d,h},
      spawn,
      bounds: {
        minX: -w / 2 + 1.7, maxX: w / 2 - 1.7,
        minZ: -d / 2 + 2.3, maxZ: d / 2 - 0.9,
      },
      blockers,
      interactives,
      floorHeight: () => 0,
      update(dt, t) {
        for (const u of updaters) u(dt, t);
      },
      dispose() {},
    };
  }

  return { scene, shell, interactives, blockers, addAltar, addCushions, addDais, addPoint, addSpot, finish };
}
