import * as THREE from 'three';
import { createCushion } from './Cushion.js';
import { addBackdrop, BACKDROP_HALLS, removeBakedProps } from './Backdrop.js';
import { dressHallInterior } from './HallInterior.js';
import { addLocalBlocker, addLocalSurface, inFootprint, localToWorld } from './Orientation.js';
import { create as shijia } from './halls/Shijia.js';
import { create as chaoyin } from './halls/Chaoyin.js';
import { create as guanyin } from './halls/Guanyin.js';
import { create as lingxiao } from './halls/Lingxiao.js';
import { create as yaoshi } from './halls/Yaoshi.js';
import { create as longwang } from './halls/Longwang.js';
import { create as caishen } from './halls/Caishen.js';
import { create as wuguan } from './halls/Wuguan.js';
import { create as zutang } from './halls/Zutang.js';
import { create as wenchuang } from './halls/Wenchuang.js';
const factories={shijia,chaoyin,guanyin,lingxiao,yaoshi,longwang,caishen,wuguan,zutang,wenchuang};

export function installHall(world,cfg,blockers,surfaces,interactives,updaters){
 const factory=factories[cfg.id];if(!factory)return;
 const occupied=[];
 const hall=factory();
 const s=Math.min((cfg.w-1.2)/hall.dimensions.w,(cfg.d-1)/hall.dimensions.d,(cfg.h*.72-.3)/hall.dimensions.h);
 const y=cfg.platform+(cfg.plinth??.7);
 const ry=cfg.ry||0;
 const group=new THREE.Group();group.position.set(cfg.x,y,cfg.z);group.rotation.y=ry;group.scale.setScalar(s);
 const useBackdrop=BACKDROP_HALLS.has(cfg.id);
 if(useBackdrop)removeBakedProps(hall.scene);
 hall.scene.remove(hall.shell);
 // Recreate cushions at a usable size, independent of the compressed interior.
 const cushions=[];hall.scene.traverse(o=>{if(o.userData.isCushion)cushions.push(o)});
 for(const c of cushions)c.removeFromParent();
 // One local warm fill per hall; avoid dozens of whole-scene dynamic lights.
 const lights=[];hall.scene.traverse(o=>{if(o.isLight)lights.push(o)});
 for(const light of lights)light.removeFromParent();
 group.add(...[...hall.scene.children]);world.add(group);
 dressHallInterior(world,cfg,{floorY:y,wallH:cfg.h*.72,hasBackdrop:useBackdrop});
 if(useBackdrop)addBackdrop(world,cfg,{floorY:y,wallH:cfg.h*.72});
 const fill=new THREE.PointLight(0xffd6a0,14,Math.max(cfg.w,cfg.d),2);
 const fillPos=localToWorld(cfg,0,cfg.d*.15);
 fill.position.set(fillPos.x,y+Math.min(3,cfg.h*.4),fillPos.z);world.add(fill);
 for(const b of hall.blockers){
  if(hall.shellBlockers.includes(b))continue;
  addLocalBlocker(blockers,cfg,b.minX*s,b.maxX*s,b.minZ*s,b.maxZ*s);
 }
 for(const it of hall.interactives){if(it.type!=='cushion')continue;
  let lx=(it.setX??it.x)*s+((it.seatIndex??0)-((it.seatCount??1)-1)/2)*.8;
  let lz=it.z*s;
  const start=localToWorld(cfg,lx,lz);
  let x=start.x,z=start.z;
  const candidates=[];
  for(let dz=-2;dz<=2;dz+=.1) for(let dx=-2;dx<=2;dx+=.1) candidates.push({x:x+dx,z:z+dz,cost:dx*dx+dz*dz});
  candidates.sort((a,b)=>a.cost-b.cost);
  const free=candidates.find(p=>inFootprint(cfg,p.x,p.z,-.7)&&!blockers.some(b=>p.x>b.minX-.4&&p.x<b.maxX+.4&&p.z>b.minZ-.4&&p.z<b.maxZ+.4)&&!occupied.some(q=>Math.hypot(p.x-q.x,p.z-q.z)<.75));
  if(!free)throw new Error('No reachable cushion space: '+cfg.id+':'+it.id);
  x=free.x;z=free.z;occupied.push({x,z});
  const statue=localToWorld(cfg,it.statueX*s,it.statueZ*s);
  world.add(createCushion({x,z,y:y+.02,scale:Math.max(.65,s)}));
  interactives.push({...it,id:`${cfg.id}:${it.id}`,x,z,statueX:statue.x,statueZ:statue.z,radius:.95});
 }
 addLocalSurface(surfaces,cfg,{minX:-cfg.w/2,maxX:cfg.w/2,minZ:-cfg.d/2,maxZ:cfg.d/2+.26,y});
 updaters.push((dt,t)=>hall.update(dt,t));
}
