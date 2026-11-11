import * as THREE from 'three';
import { Engine } from './Engine.js';
import { Input } from './Input.js';
import { Player } from './Player.js';
import { MapManager } from './MapManager.js';
import { HUD } from '../ui/HUD.js';
import { Minimap } from '../ui/Minimap.js';
import { OUTDOOR } from '../config/halls.js';

export class Game {
  constructor(container) {
    this.engine = new Engine(container);
    this.hud = new HUD();
    this.minimap = new Minimap();
    this.maps = new MapManager();
    this.player = new Player(this.engine.camera);
    this.input = new Input({
      onInteract: () => this.interact(),
      onPray: () => this.pray(),
    });
    this.input.attach(this.engine.renderer.domElement);

    this.started = false;
    this.transitioning = false;
    this.map = null;
    this._zoneId = '';

    this.engine.start((dt, t) => this.update(dt, t));
  }

  async init() {
    await this.goTo('outdoor', OUTDOOR.spawn, { instant: true });
    this._zoneId = 'outdoor';
    this.hud.setZone(this.map.name, this.map.subtitle);
    this.loadEnvironment();
    if (this._pendingBegin) this.begin();
  }

  // Blender 烘焙的等距环境贴图，作为场景 IBL
  async loadEnvironment() {
    try {
      const tex = await new THREE.TextureLoader().loadAsync('./assets/env/sky_env.png');
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      const pmrem = new THREE.PMREMGenerator(this.engine.renderer);
      this.envMap = pmrem.fromEquirectangular(tex).texture;
      pmrem.dispose();
      tex.dispose();
      this._applyEnvironment();
    } catch (err) {
      console.warn('[径山寺] 环境贴图未加载', err);
    }
  }

  _applyEnvironment() {
    if (!this.envMap || !this.map) return;
    this.map.scene.environment = this.envMap;
    // 室外用弱 IBL 补天光；室内有独立灯光，保持原有暖调，不受环境贴图冲淡
    this.map.scene.environmentIntensity = this.map.id === 'outdoor' ? 0.12 : 0.0;
  }

  begin() {
    if (this.started) return;
    if (!this.map) {
      this._pendingBegin = true;
      return;
    }
    this.started = true;
    this.input.started = true;
    this.hud.hideStart();
    this.hud.setZone(this.map.name, this.map.subtitle);
    // Drag-to-look works in embedded browsers without pointer lock.
  }

  async goTo(id, spawn, { instant = false } = {}) {
    if (this.transitioning) return;
    this.transitioning = true;
    const previous = this.map;
    const previousSpawn = {x:this.player.position.x,z:this.player.position.z,yaw:this.player.yaw};
    try {
    if (!instant) await this.hud.fadeOut();

    const map = await this.maps.get(id);
    this.map = map;
    this.player.attach(map, spawn || map.spawn);
    this.engine.setScene(map.scene);
    this._applyEnvironment();
    map.scene.add(this.player.avatar.root);
    this.hud.prompt(null);

    if (this.started) this.hud.setZone(map.name, map.subtitle);
    if (!instant) await this.hud.fadeIn();
    this.maps.trim(id, this.player.avatar.root);
    } catch (err) {
      // 初次加载失败时 previous 为 null，也必须把 map 置空并重新抛出；
      // 否则 init() 会继续执行，留下一个半初始化的场景。
      this.map = previous || null;
      this.player.avatar.root.removeFromParent();
      if (previous) {
        this.player.attach(previous, previousSpawn);
        this.engine.setScene(previous.scene);
        previous.scene.add(this.player.avatar.root);
        this._applyEnvironment();
      } else {
        this.engine.setScene(null);
      }
      console.error('[径山寺] 切换失败', err);
      this.hud.toast('进入失败，请重试');
      await this.hud.fadeIn();
      if (!previous) throw err;
    } finally {
      this.transitioning = false;
    }
  }

  update(dt, t) {
    if (!this.map) return;
    this.map.update(dt, t);
    this.minimap.update(this.map, this.player, t);
    if (!this.started || this.transitioning) return;

    this.player.update(dt, this.input, this.map);
    this.updateZone();
    if (this.transitioning || this.player.bowing) {
      this.hud.prompt(null);
      return;
    }
    if (this.player.kneeling) {
      this.hud.prompt('起身', '合十拜拜');
      return;
    }
    const target = this.player.nearest(this.map.interactives);
    if (!target) {
      this.hud.prompt(null);
    } else if (target.type === 'cushion') {
      this.hud.prompt('跪拜', '合十拜拜');
    } else {
      this.hud.prompt(target.label);
    }
  }

  updateZone() {
    if (!this.map?.zoneAt) return;
    const zone = this.map.zoneAt(this.player.position.x, this.player.position.z);
    if (!zone || zone.id === this._zoneId) return;
    this._zoneId = zone.id;
    this.hud.setZone(zone.name, zone.subtitle);
  }

  interact() {
    if (!this.started || this.transitioning || this.player.bowing || !this.map) return;
    if (this.player.kneeling) {
      this.player.standUp();
      return;
    }

    const target = this.player.nearest(this.map.interactives);
    if (!target || target.type !== 'cushion') return;

    const facing = Math.atan2(target.statueX - target.x, target.statueZ - target.z);
    this.player.startKneel(target.x, target.z, facing);
  }

  // 合十拜拜：站着或跪着都可以
  pray() {
    if (!this.started || this.transitioning || this.player.bowing || !this.map) return;
    this.player.startPray();
  }

  warpTo(pointId) {
    if (!this.map) return false;
    const point = this.map.interactives.find((i) => i.id === pointId);
    if (!point) return false;
    this.player.teleport(point.x, point.z, 0);
    return true;
  }
}
