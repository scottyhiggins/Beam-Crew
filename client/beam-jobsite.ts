import * as THREE from 'three';
import {beamTerrainHeight} from '../shared/beam-chaos';

// Decorative batches share one cube and one material per colour. They never enter
// the collision world; deck edges and machinery remain authoritative server data.
export function createBeamJobsite(){
 const root=new THREE.Group(),geometry=new THREE.BoxGeometry(1,1,1),materials=new Map<number,THREE.MeshLambertMaterial>();
 const groups=Array.from({length:5},()=>new THREE.Group());groups.forEach(g=>root.add(g));
 type Part={x:number;y:number;z:number;w:number;h:number;d:number;angle:number};
 function build(g:THREE.Group,design:(box:(w:number,h:number,d:number,c:number,x:number,y:number,z:number,a?:number)=>void)=>void){
  const batches=new Map<number,Part[]>();
  design((w,h,d,c,x,y,z,angle=0)=>{if(!batches.has(c))batches.set(c,[]);batches.get(c)!.push({w,h,d,x,y,z,angle});});
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3(),position=new THREE.Vector3();
  for(const [color,parts]of batches){if(!materials.has(color))materials.set(color,new THREE.MeshLambertMaterial({color}));const mesh=new THREE.InstancedMesh(geometry,materials.get(color)!,parts.length);
   parts.forEach((p,i)=>{rotation.setFromAxisAngle(new THREE.Vector3(0,1,0),p.angle);matrix.compose(position.set(p.x,p.y,p.z),rotation,scale.set(p.w,p.h,p.d));mesh.setMatrixAt(i,matrix);});mesh.computeBoundingSphere();g.add(mesh);
  }
 }
 groups.forEach((g,id)=>build(g,b=>{
  // Fill the formerly empty lower-right yard without narrowing the player route.
  if(id===0||id===4){
  b(8,.18,6,0x69736d,25,-.1,5);b(5,2.8,2.5,0x397b83,27,1.4,6);
  for(let x=25;x<30;x+=.5)b(.08,2.5,2.56,0x53979a,x,1.4,6);
  b(2.4,.65,3,0xe8b536,20,.75,5);b(1.3,1.4,1.4,0x367982,20,1.7,5.5);
  for(const x of [18.9,21.1])b(.45,.5,3.2,0x27383d,x,.3,5);
  b(.35,2.6,.35,0xe8b536,20,1.8,3.5);b(1.4,.4,1,0x37464d,20,.4,2.5);
  for(let n=0;n<5;n++)b(3,.13,.45,0xc49761,24,.15+n*.15,2.5);
  for(let n=0;n<3;n++){b(1.8,.16,1.5,0x9e784b,29,.12+n*.2,2.5);}
  for(let n=0;n<6;n++){b(.1,1.3,.1,0x9caaab,17+n*2,.65,8.5);if(n<5)b(2,.7,.06,0x9caaab,18+n*2,.8,8.5);}
  }
  if(id===3){
   // Unfinished skyscraper below the playable deck; open sides signal fall risk.
   for(const x of [-7,0,7,28])for(const z of [-9,8]){b(.5,11,.5,0x657582,x,-5.5,z);b(.22,.22,16,0x82949d,x,-4,z===-9?-1:0);}
   for(const y of [-3,-7,-10])b(41,.25,18,0x526574,11,y,0);
   for(let n=0;n<12;n++)b(1.2,.03,4.5,0xb6a17e,9.5+n*1.3,.015,-7.5);
   // Scaffolding and partial guardrails remain outside the beam sweep.
   for(const x of [-9.6,31.6]){for(let z=-9;z<10;z+=3){b(.12,2,.12,0x9cabb2,x,1,z);b(.12,.12,3,0xe8ba42,x,1.2,z+1.5);}b(1.3,.15,16,0xaa987d,x,-1,0);}
   for(let n=0;n<5;n++)b(5,.14,.2,0x385b70,28,.2+n*.16,5);
  }
  if(id===4){
   b(43,.025,19,0x685644,11,-.045,0);
   for(const [x,z,w,d]of [[-5,5,5,2],[3,-6,4,3],[13,-7.5,3,3],[27,-7,6,3],[6,5,6,3]]){b(w,.018,d,0x6d9195,x,.016,z,.12);b(w*.65,.021,d*.2,0xa5bec0,x,.025,z+.2,.12);}
   // Shallow bridge and approach ramps preserve the planar collision footprint.
   for(let n=0;n<12;n++)b(.45,.05,4.7,0xb08b5d,11+n*.46,.03+beamTerrainHeight(4,11+n*.46,-7.5),-7.5);
   for(const x of [10.5,16.5]){
    // Small stair-like approach plates form a low-poly ramp without a snag lip.
    for(let n=0;n<10;n++){const px=x-.45+n*.1;b(.1,.04,4.7,0x6a7b80,px,.02+beamTerrainHeight(4,px,-7.5),-7.5);}
   }
   for(let n=0;n<5;n++)b(.45,.06,1.2,0x493e34,-7+n*1.3,.035,7);
   b(3,1.8,2,0xe9c473,4,.9,7);b(3.5,.2,2.5,0x8e795b,4,1.9,7);
  }
 }));
 return {root,update(id:number){groups.forEach((g,i)=>g.visible=i===id);}};
}
