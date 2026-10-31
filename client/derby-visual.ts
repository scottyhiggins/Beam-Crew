import * as THREE from 'three';
import {loadPose} from '../shared/crane';
import {BALL_RADIUS,MAX_DEBRIS,type DerbyArena,type Target,type TargetKind} from '../shared/derby';
const colors:Record<TargetKind,number>={wall:0xc87b55,scaffold:0xe9b93e,pallet:0xa78152,barrier:0xef8842};
/** A visual layer inside the existing Crane Challenge renderer/camera. No client scoring. */
export function createDerbyVisual(scene:THREE.Scene){
 const root=new THREE.Group();root.visible=false;scene.add(root);const targets=new Map<number,THREE.Group>();
 const geometries=new Map<string,THREE.BoxGeometry>(),materials=new Map<number,THREE.MeshStandardMaterial>();
 function geo(w:number,h:number,d:number){const key=`${w}/${h}/${d}`;if(!geometries.has(key))geometries.set(key,new THREE.BoxGeometry(w,h,d));return geometries.get(key)!;}
 function mat(c:number){if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.8}));return materials.get(c)!;}
 function box(parent:THREE.Object3D,w:number,h:number,d:number,c:number,x=0,y=0,z=0){const m=new THREE.Mesh(geo(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function brace(parent:THREE.Object3D,x1:number,y1:number,x2:number,y2:number,z:number){const m=box(parent,.08,Math.hypot(x2-x1,y2-y1),.08,0x748c94);m.position.set((x1+x2)/2,(y1+y2)/2,z);m.rotation.z=-Math.atan2(x2-x1,y2-y1);}
 box(root,27,2,8,0x596973,0,-1,0);box(root,27,.08,8,0x929e94,0,.01,0);
 for(const z of [-4.1,4.1])for(let i=0;i<27;i++)box(root,.7,.07,.25,i%2?0x293e48:0xffcc43,-13+i,.12,z);
 const ball=new THREE.Group();const sphere=new THREE.Mesh(new THREE.IcosahedronGeometry(BALL_RADIUS,1),new THREE.MeshStandardMaterial({color:0x344955,metalness:.72,roughness:.45,flatShading:true}));sphere.castShadow=true;ball.add(sphere);const band=new THREE.Mesh(new THREE.CylinderGeometry(1.035,1.035,.14,16),mat(0xa3b1b3));ball.add(band);box(ball,.27,.4,.27,0x253b46,0,1.1,0);root.add(ball);
 const chunks=new THREE.InstancedMesh(geo(1,1,1),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),MAX_DEBRIS);chunks.count=0;chunks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(chunks);
 const dustMaterial=new THREE.MeshBasicMaterial({color:0xe5c89b,transparent:true,opacity:.2,depthWrite:false});const dust=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),dustMaterial,18);dust.count=0;root.add(dust);
 const burstMaterial=new THREE.MeshBasicMaterial({color:0xffcf52,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide});const burst=new THREE.Mesh(new THREE.RingGeometry(.8,1,20),burstMaterial);burst.visible=false;root.add(burst);
 const matrix=new THREE.Matrix4(),quat=new THREE.Quaternion(),scale=new THREE.Vector3(),position=new THREE.Vector3(),color=new THREE.Color();let lastImpact=0,effect=0,impactX=0,impactY=0,visible=false;
 function targetMesh(t:Target){const g=new THREE.Group();g.position.set(t.x,t.y,0);root.add(g);
  if(t.kind==='wall'){box(g,t.w,t.h,1.95,0x7c7970);const bricks=new THREE.InstancedMesh(geo(t.w/3-.06,t.h/2-.055,2),mat(colors.wall),6);for(let row=0;row<2;row++)for(let col=0;col<3;col++){matrix.makeTranslation(-t.w/3+col*t.w/3,-t.h/4+row*t.h/2,0);bricks.setMatrixAt(row*3+col,matrix);}bricks.castShadow=true;g.add(bricks);}
  if(t.kind==='scaffold'){for(const x of [-t.w/2+.08,t.w/2-.08])for(const z of [-1.25,1.25])box(g,.12,t.h,.12,0xaab9bc,x,0,z);box(g,t.w,.14,2.65,colors.scaffold,0,t.h/2-.1,0);for(const z of [-1.25,1.25]){brace(g,-t.w/2,-t.h/2,t.w/2,t.h/2,z);brace(g,t.w/2,-t.h/2,-t.w/2,t.h/2,z);}}
  if(t.kind==='pallet'){for(let i=0;i<4;i++)box(g,t.w,.15,1.5,colors.pallet,0,-.42+i*.27,0);for(const x of [-.6,.6])box(g,.2,1.05,1.4,0x785c3e,x,0,0);}
  if(t.kind==='barrier'){box(g,t.w,.55,.7,colors.barrier);box(g,t.w+.05,.18,1.2,0x344c53,0,-.36);for(let i=0;i<4;i++){const stripe=box(g,.13,.52,.03,0xffe6aa,-.65+i*.43,0,.37);stripe.rotation.z=-.35;}}
  const health=box(g,t.w,.08,.06,0xffd052,0,t.h/2+.18,1.5);health.name='health';health.visible=false;targets.set(t.id,g);return g;
 }
 return {setVisible(value:boolean){root.visible=value;visible=value;if(!value){effect=0;lastImpact=0;}},update(d:DerbyArena,dt:number){if(!visible)return;const pose=loadPose(d.crane);ball.position.set(pose.x,pose.y,0);ball.rotation.z=-d.crane.swing;
  // Replay reuses IDs; the authoritative destroyed flags restore all target meshes.
  for(const t of d.targets){const g=targets.get(t.id)??targetMesh(t);g.visible=!t.destroyed;const health=g.getObjectByName('health')!;health.visible=t.hp<t.maxHp&&!t.destroyed;health.scale.x=Math.max(.01,t.hp/t.maxHp);health.position.x=-(t.w*(1-t.hp/t.maxHp))/2;}
  chunks.count=d.debris.length;for(let i=0;i<d.debris.length;i++){const b=d.debris[i];const fade=Math.min(1,(b.life-b.age)/.4);position.set(b.x,b.y,b.z);quat.setFromEuler(new THREE.Euler(b.age*b.spin,b.age*.8,0));scale.setScalar(b.size*Math.max(0,fade));matrix.compose(position,quat,scale);chunks.setMatrixAt(i,matrix);color.setHex(colors[b.kind]);chunks.setColorAt(i,color);}chunks.instanceMatrix.needsUpdate=true;if(chunks.instanceColor)chunks.instanceColor.needsUpdate=true;
  if(d.impact.serial<lastImpact)effect=0;
  if(d.impact.serial!==lastImpact){if(d.impact.serial>lastImpact){effect=.45;impactX=d.impact.x;impactY=d.impact.y;}lastImpact=d.impact.serial;}
  effect=Math.max(0,effect-dt);dust.count=effect>0?18:0;burst.visible=effect>0;const age=.45-effect;dustMaterial.opacity=effect*.55;for(let i=0;i<dust.count;i++){const angle=i*2.4;position.set(impactX+Math.sin(angle)*age*5,impactY+age*(1+i%3),Math.cos(angle)*age*4);quat.identity();scale.setScalar(.12+age*(1+i%4)*.45);matrix.compose(position,quat,scale);dust.setMatrixAt(i,matrix);}dust.instanceMatrix.needsUpdate=true;burst.position.set(impactX,impactY,1.8);burst.scale.setScalar(1+age*5);burstMaterial.opacity=effect*1.5;
  return effect;
 }};
}
