import { disposeMap } from './SceneResources.js';
import { T } from './Textures.js';

const LOADERS = {
  wuguan: () => import('../world/halls/Wuguan.js'),
  outdoor: () => import('../world/Outdoor.js'),
  shijia: () => import('../world/halls/Shijia.js'),
  chaoyin: () => import('../world/halls/Chaoyin.js'),
  guanyin: () => import('../world/halls/Guanyin.js'),
  lingxiao: () => import('../world/halls/Lingxiao.js'),
  yaoshi: () => import('../world/halls/Yaoshi.js'),
  longwang: () => import('../world/halls/Longwang.js'),
  caishen: () => import('../world/halls/Caishen.js'),
};

export class MapManager {
  constructor() {
    this.maps = new Map();
    this.ctx = { textures: T };
  }

  async get(id) {
    if (this.maps.has(id)) return this.maps.get(id);
    const loader = LOADERS[id];
    if (!loader) throw new Error(`Unknown map: ${id}`);
    const mod = await loader();
    const map = mod.create(this.ctx);
    this.maps.set(id, map);
    return map;
  }

  trim(activeId, avatar) {
    while(this.maps.size>3) {
      const id=[...this.maps.keys()].find(k=>k!==activeId && k!=='outdoor');
      if(!id) break;
      const map=this.maps.get(id);
      if(avatar.parent===map.scene) map.scene.remove(avatar);
      disposeMap(map);
      this.maps.delete(id);
    }
  }

  has(id) {
    return this.maps.has(id);
  }
}
