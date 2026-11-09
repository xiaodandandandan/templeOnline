import { createHallBase } from './HallBase.js';
import { box } from '../Props.js';
import { M } from '../Materials.js';

export function create() {
  const hall = createHallBase({id:'wuguan',name:'五观堂',subtitle:'素面用餐区',w:18,d:16,h:7});
  const seats=[];
  for(const x of [-5,5]) for(const z of [-3,2]) {
    box(hall.scene,2.6,.15,1.5,x,1,z,M.wood);
    for(const dx of [-1,1]) for(const dz of [-.5,.5]) box(hall.scene,.15,.9,.15,x+dx,.45,z+dz,M.woodDark);
    hall.blockers.push({minX:x-1.3,maxX:x+1.3,minZ:z-.75,maxZ:z+.75});
    for(const side of [-1,1]) {
      const sz=z+side*1.25;
      box(hall.scene,2.5,.5,.45,x,.25,sz,M.wood);
      hall.blockers.push({minX:x-1.25,maxX:x+1.25,minZ:sz-.225,maxZ:sz+.225});
      seats.push({id:`seat:${x}:${z}:${side}`,x,z:sz,facing:side>0?Math.PI:0});
    }
  }
  box(hall.scene,8,1.1,1.2,0,.55,-6,M.wood);
  hall.blockers.push({minX:-4,maxX:4,minZ:-6.6,maxZ:-5.4});
  return {...hall.finish(),dining:{counter:{x:0,z:-4.5},seats}};
}
