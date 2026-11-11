const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');const root=path.resolve(__dirname,'..');const cache=new Map();
function load(p){p=path.resolve(p);if(cache.has(p))return cache.get(p);let s=fs.readFileSync(p,'utf8');if(p.endsWith('Materials.js'))s=`import * as THREE from 'three'; const mat=new THREE.MeshStandardMaterial();export const M=new Proxy({smoke:new THREE.SpriteMaterial()},{get:(o,k)=>o[k]||mat});export const plaqueMaterial=()=>mat;export const verticalPlaqueMaterial=()=>mat;export const muralMaterial=()=>mat;`;const m=new vm.SourceTextModule(s,{identifier:p});cache.set(p,m);return m;}
(async()=>{const m=load(root+'/src/world/Outdoor.js');await m.link((id,ref)=>load(id==='three'?root+'/vendor/three.module.js':path.resolve(path.dirname(ref.identifier),id)));await m.evaluate();const map=m.namespace.create({textures:{sky:()=>null}});let cushions=0;map.scene.traverse(o=>{if(o.userData.isCushion)cushions++});assert(!map.interactives.some(i=>i.type==='enter'||i.type==='exit'));assert.equal(cushions,map.interactives.filter(i=>i.type==='cushion').length);const conflicts=[];for(const i of map.interactives){if(map.blockers.some(b=>i.x>b.minX-.36&&i.x<b.maxX+.36&&i.z>b.minZ-.36&&i.z<b.maxZ+.36))conflicts.push(i.id)}for(const id of ['shijia','chaoyin','guanyin','lingxiao','yaoshi','longwang','caishen']){assert(fs.existsSync(root+'/assets/backdrops/'+id+'.jpg'),'missing backdrop '+id)}assert.equal(map.zoneAt(0,map.interactives.find(i=>i.id==='shijia:sakyamuni:1').z).id,'shijia');assert.equal(map.zoneAt(0,55).id,'outdoor');assert(map.cameraMaxAt(21,-2.6)<4.6,'small hall camera must stay inside');console.log({cushions,interactions:map.interactives.length,conflicts});
const pm=load(root+'/src/core/Player.js');await pm.link((id,ref)=>load(id==='three'?root+'/vendor/three.module.js':path.resolve(path.dirname(ref.identifier),id)));await pm.evaluate();
const three=cache.get(root+'/vendor/three.module.js')||cache.get(path.resolve(root+'/vendor/three.module.js'));
const cfg=cache.get(path.resolve(root+'/src/config/halls.js')).namespace.OUTDOOR;
assert(cfg.entrances.find(h=>h.id==='guanyin').ry>0,'left hall must face central axis');
assert(cfg.entrances.find(h=>h.id==='longwang').ry<0,'right hall must face central axis');
assert.equal(map.zoneAt(-25.5,-7.76).id,'yaoshi');
for(const hall of [...cfg.entrances.filter(h=>h.id!=='tianwang'),...cfg.scenery]){
 const ry=hall.ry||0;
 const fx=Math.sin(ry),fz=Math.cos(ry);
 const player=new pm.namespace.Player(new three.namespace.PerspectiveCamera());
 player.attach(map,{x:hall.x+fx*(hall.d/2+2),z:hall.z+fz*(hall.d/2+2),yaw:ry});
 const input={takeLook:()=>({x:0,y:0}),axis:()=>({x:0,y:1}),isRunning:()=>false};
 for(let i=0;i<100;i++)player.update(.016,input,map);
 const dx=player.position.x-hall.x,dz=player.position.z-hall.z;
 const localZ=dx*Math.sin(ry)+dz*Math.cos(ry);
 assert(localZ<hall.d/2-.5,'Cannot walk through '+hall.id+' door, localZ='+localZ);
 console.log('PASS walk-through '+hall.id+' (ry='+ry.toFixed(2)+')');
}
assert.equal(conflicts.length,0,'cushions must not overlap collision');})().catch(e=>{console.error(e);process.exitCode=1});

