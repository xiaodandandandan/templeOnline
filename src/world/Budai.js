import * as THREE from 'three';
import { box } from './Props.js';
import { batchStatue } from './BatchStatue.js';

const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.18});
const copper=mat(0xb96b30),light=mat(0xd68b46),robe=mat(0x683c2d),gold=mat(0xdca244),dark=mat(0x35251f);
// Copper laughing Buddha, based on the reference in this chat.
export function createBudai(scale=1.6){
 const g=new THREE.Group();
 const b=(w,h,d,x,y,z,m)=>box(g,w,h,d,x,y,z,m,{cast:true});
 b(3.1,.22,1.9,0,.11,0,dark);b(2.95,.12,1.75,0,.28,0,robe);
 // Stepped circular backplate and gold rim.
 const cy=2.35,R=1.65;
 for(let i=0;i<24;i++){const yy=-R+(i+.5)*R*2/24;const hw=Math.sqrt(R*R-yy*yy);b(hw*2,R*2/24,.16,0,cy+yy,-.65,robe);for(const sd of [-1,1])b(.09,R*2/24,.22,sd*(hw-.045),cy+yy,-.63,gold);}
 for(let i=0;i<16;i++){const a=i*Math.PI*2/16;for(let k=0;k<5;k++){const r=.85+k*.14;b(.13,.13,.08,Math.sin(a)*r,cy+Math.cos(a)*r,-.51,i%2?gold:copper);}}
 // Broad knees and open robe surround the stepped belly.
 b(2.65,.65,1.4,0,.72,.05,robe);
 for(const sd of [-1,1]){b(.9,.8,1.2,sd*.98,.88,.12,robe);b(.83,.1,1.24,sd*.98,1.25,.12,gold);b(.48,.16,.6,sd*.6,.43,.69,copper);b(.38,1.05,.8,sd*.82,1.68,0,robe);b(.1,1.05,.1,sd*.63,1.68,.44,gold);b(.48,.25,.4,sd*1.05,1.4,.49,copper);}
 b(1.6,.8,.9,0,1.82,0,copper);
 b(1.72,.6,1.14,0,1.22,.23,copper);b(1.5,.86,1.2,0,1.29,.25,copper);b(1.22,.66,.12,0,1.3,.88,light);b(.12,.1,.025,0,1.12,.95,dark);
 b(.5,.2,.5,0,2.32,0,copper);
 b(1.0,.78,.82,0,2.8,.03,copper);b(.84,.14,.72,0,3.25,.01,light);b(.62,.08,.56,0,3.36,0,copper);
 for(const sd of [-1,1]){b(.19,.56,.23,sd*.57,2.67,.02,copper);b(.26,.05,.035,sd*.23,2.91,.46,dark);b(.05,.07,.035,sd*.35,2.87,.46,dark);b(.23,.16,.13,sd*.35,2.7,.43,light);}
 b(.17,.14,.14,0,2.78,.49,light);b(.43,.18,.04,0,2.59,.46,dark);b(.32,.055,.045,0,2.66,.49,gold);b(.28,.06,.055,0,2.49,.47,light);
 // Prayer beads drape from the right hand (viewer left).
 for(let i=0;i<12;i++){const a=i*Math.PI*2/12;b(.1,.1,.1,-1.1+Math.sin(a)*.18,1.05+Math.cos(a)*.34,.78,light);}
 batchStatue(g);g.userData.isStatue=true;g.userData.statue={kind:'budai',opts:{scale}};g.scale.setScalar(scale);return g;
}
