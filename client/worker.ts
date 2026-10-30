import * as THREE from 'three';

// Decorative meshes only. Nothing here participates in the simulation.
function block(g:THREE.Object3D,w:number,h:number,d:number,c:number,x:number,y:number,z:number){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);g.add(m);return m;}
export type WorkerLook={hat:number;vest:number;expression:"happy"|"serious"|"goofy"};
export function makeWorker(color:number,look?:WorkerLook){
 color=look?.vest??color;
 const g=new THREE.Group();
 block(g,.68,.78,.48,0x273e55,0,.89,0);
 block(g,.73,.57,.51,color,0,1,0);
 for(const x of [-.22,.22])block(g,.09,.52,.025,0xf6f3c3,x,1,.27);
 block(g,.74,.085,.53,0xf6f3c3,0,.86,0);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshLambertMaterial({color:0xe8b48b}));head.scale.set(1,1.12,.9);head.position.y=1.57;g.add(head);
 const hat=new THREE.Mesh(new THREE.SphereGeometry(.39,12,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:look?.hat??0xffce36}));hat.position.y=1.78;g.add(hat);
 const brim=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.065,12),new THREE.MeshLambertMaterial({color:look?.hat??0xffbb24}));brim.position.y=1.8;g.add(brim);
 block(g,.07,.12,.59,look?.hat??0xffe074,0,1.98,0);
 for(const x of [-.12,.12])block(g,.065,.075,.035,0x203543,x,1.6,.28);
 if(!look||look.expression==='serious')block(g,.15,.035,.03,0x9d573f,0,1.46,.29);
 else {
 const smile=new THREE.Mesh(new THREE.TorusGeometry(.105,.022,6,16,Math.PI),new THREE.MeshLambertMaterial({color:0x9d573f}));smile.rotation.z=Math.PI;smile.position.set(0,1.49,.29);g.add(smile);
 if(look.expression==='goofy'){block(g,.07,.09,.035,0xf07883,.04,1.39,.31);block(g,.09,.025,.04,0x203543,-.12,1.6,.305);}
 }
 const limbs:THREE.Group[]=[],knees:THREE.Group[]=[];
 for(const x of [-.22,.22]){const leg=new THREE.Group();leg.position.set(x,.59,0);block(leg,.23,.22,.28,0x344e65,0,-.1,0);const knee=new THREE.Group();knee.position.y=-.22;leg.add(knee);block(knee,.22,.19,.27,0x344e65,0,-.09,0);block(knee,.28,.17,.42,0x293641,0,-.26,.055);knees.push(knee);g.add(leg);limbs.push(leg);}
 for(const x of [-.47,.47]){const arm=new THREE.Group();arm.position.set(x,1.27,0);block(arm,.21,.43,.26,color,0,-.2,0);block(arm,.22,.17,.26,0xe8b48b,0,-.48,0);g.add(arm);limbs.push(arm);}
 g.userData.limbs=limbs;g.userData.knees=knees;
 // Flat contact shadow avoids expensive dynamic shadow maps on phones.
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.57,12),new THREE.MeshBasicMaterial({color:0x233a40,transparent:true,opacity:.2,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;g.add(shadow);
 return g;
}
export function animateWorker(g:THREE.Group,moving:number,carrying:boolean,now:number,stumble=0,wheelGrip=false){
 const limbs=g.userData.limbs as THREE.Group[],knees=g.userData.knees as THREE.Group[];
 const reaction=Math.max(0,Math.min(1,stumble)),phase=now*.018;
 const swing=Math.sin(now*.012)*Math.min(1,moving)*.45;
 for(let i=0;i<2;i++){
  const step=Math.sin(phase+i*Math.PI);
  limbs[i].rotation.x=(i?-swing:swing)*(1-reaction)+step*.65*reaction;
  limbs[i].position.y=.59+Math.max(0,step)*.08*reaction;
  knees[i].rotation.x=reaction?-Math.max(0,step)*.85*reaction:0;
 }
 g.rotation.z=reaction?Math.sin(phase*.5)*.07*reaction:0;
 // Keep the grip pose while the feet recover under the worker.
 limbs[2].position.y=limbs[3].position.y=wheelGrip?1.17:1.27;
 limbs[2].rotation.x=carrying?-.65:-swing*.65;limbs[3].rotation.x=carrying?-.65:swing*.65;
}
