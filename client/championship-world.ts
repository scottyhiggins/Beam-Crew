import * as THREE from 'three';
import {COURSE_TWO,COURSE_TWO_PATH,SHARED_EXIT} from '../shared/championship.js';
// Shared box geometry, palette and instanced batches; a finite corridor with actual culling.
export function createChampionshipWorld(){
 const root=new THREE.Group(),gate=new THREE.Group();root.add(gate);
 const geometry=new THREE.BoxGeometry(1,1,1),materials=new Map<number,THREE.MeshLambertMaterial>();
 const material=(color:number)=>{let m=materials.get(color);if(!m){m=new THREE.MeshLambertMaterial({color});materials.set(color,m);}return m;};
 const box=(parent:THREE.Group,w:number,h:number,d:number,c:number,x:number,y:number,z:number,rotation=0)=>{const m=new THREE.Mesh(geometry,material(c));m.scale.set(w,h,d);m.position.set(x,y,z);m.rotation.y=rotation;parent.add(m);return m;};
 const ground=box(root,96,.22,136,0xa4a38b,0,-.48,-47);
 const roads=new THREE.Group();root.add(roads);
 COURSE_TWO_PATH.slice(1).forEach((b,i)=>{const a=COURSE_TWO_PATH[i],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);box(roads,5.6,.05,length+5.6,0xbfa780,(a.x+b.x)/2,.01,(a.z+b.z)/2,angle);
  for(let t=1;t<length;t+=3){const x=a.x+dx*t/length,z=a.z+dz*t/length;box(roads,.15,.025,1,0xf4e1a3,x,.075,z,angle);for(const side of [-1,1])box(roads,.12,.025,.5,0xf4e1a3,x+Math.sin(angle)*.3+Math.cos(angle)*side*.16,.075,z+Math.cos(angle)*.3-Math.sin(angle)*side*.16,angle-side*.7);}
 });
 box(roads,16,.04,16,0xbfa780,-5,.015,-82);
 const ropes=COURSE_TWO.fences.flatMap(f=>[new THREE.Vector3(f.a.x,.5,f.a.z),new THREE.Vector3(f.b.x,.5,f.b.z)]);
 root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ropes),new THREE.LineBasicMaterial({color:0xf0d397})));
 // Visible closed gate is exactly the original yard cap in the server's leg-one track.
 for(let i=0;i<7;i++)box(gate,.78,.75,.14,i%2?0xffc137:0x27343d,-5.4+i*.8,.6,SHARED_EXIT.z);
 for(const x of [-5.8,-.2])box(root,.22,1.5,.22,0xffc137,x,.75,-36);
 for(let x=2.5;x<7.6;x+=.65)box(roads,.16,.13,1.5,0x7f705d,x,.1,-54.25);
 // Same spike strip dimensions/profile as Course 1, translated to the second socket.
 const spikeShape=new THREE.Shape();spikeShape.moveTo(-.11,0);spikeShape.lineTo(.11,0);spikeShape.lineTo(.04,.28);spikeShape.closePath();
 const spikes=new THREE.ExtrudeGeometry(spikeShape,{depth:.08,bevelEnabled:false});
 for(let section=0;section<7;section++){const x=-7.8+section*.8+.4;box(roads,.77,.07,1.4,0x283039,x,.06,-71.5);for(let i=0;i<3;i++){const spike=new THREE.Mesh(spikes,material(0xf5cb32));spike.position.set(x-.26+i*.26,.11,-72.02);roads.add(spike);}}
 for(let row=0;row<3;row++)for(let i=0;i<14;i++)box(roads,.4,.025,.13,(i+row)%2?0xffffff:row===1?0x45be7b:0x182323,-7.6+i*.4,.13,-71.85+row*.14);
 const chunks:THREE.Group[]=[];
 for(let k=0;k<6;k++){
  const chunk=new THREE.Group();chunk.userData.z=3-k*22;root.add(chunk);chunks.push(chunk);
  const batches=new Map<number,THREE.Matrix4[]>(),transform=new THREE.Object3D();
  const block=(w:number,h:number,d:number,c:number,x:number,y:number,z:number,ry=0)=>{transform.position.set(x,y,z);transform.rotation.set(0,ry,0);transform.scale.set(w,h,d);transform.updateMatrix();const list=batches.get(c)??[];list.push(transform.matrix.clone());batches.set(c,list);};
  const z=chunk.userData.z;
  for(const side of [-1,1]){
   const x=side*23,h=12+(k%3)*5;
   block(8,h,10,0x789da6,x,h/2,z-6);
   for(let row=0;row<4;row++)for(let col=0;col<3;col++)block(.04,.8,1.1,0xaac6c8,x-side*4.05,3+row*2,z-9+col*2.5);
   // Exposed concrete skeleton and lightweight scaffold floors on both roadsides.
   for(const dx of [-2,2])for(const dz of [-2,2])block(.22,8,.22,0x7b9398,side*14+dx,4,z+dz);
   for(const y of [2,4,6,8])block(4.5,.12,4.5,0xb9a47d,side*14,y,z);
  }
  // Tower cranes sit clear of the route. The boom is overhead with ample clearance.
  if(k===2||k===4){for(const x of [12,12.7])for(const dz of [-.35,.35])block(.12,14,.12,0xe8b942,x,7,z+dz);block(19,.3,.5,0xe8b942,8,14,z);block(.8,1.8,1.8,0x557784,13,12.5,z);for(let i=0;i<6;i++)block(.1,.9,.1,0x566b70,12.35,1+i*2,z);}
  // Lumber stack, equipment and pipe racks outside the rope boundary.
  for(let i=0;i<5;i++)block(3,.16,.4,0xc59156,11,.2+i*.2,z+5);
  block(2.4,.6,3,0xeeb832,-14,.6,z+6);block(1.4,1.5,1.7,0x286b78,-14,1.65,z+6);
  for(const x of [-15.3,-12.7])block(.5,.45,3.4,0x344653,x,.3,z+6);
  for(const [color,matrices]of batches){const mesh=new THREE.InstancedMesh(geometry,material(color),matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();chunk.add(mesh);}
 }
 const pipes=new THREE.Group();pipes.userData.z=-43;root.add(pipes);chunks.push(pipes);
 const pipeGeo=new THREE.CylinderGeometry(.35,.35,5,10,1,true),pipeMat=material(0x7199a1);
 for(let i=0;i<6;i++){const pipe=new THREE.Mesh(pipeGeo,pipeMat);pipe.rotation.x=Math.PI/2;pipe.position.set(-8+(i%3)*.75,.4+Math.floor(i/3)*.75,-43);pipes.add(pipe);}
 // Batch all static meshes by shared geometry and material, including ground markings.
 for(const group of [root,roads,gate]){
  const batches=new Map<THREE.BufferGeometry,Map<THREE.Material,THREE.Mesh[]>>();
  for(const object of [...group.children])if(object instanceof THREE.Mesh&&!(object instanceof THREE.InstancedMesh)&&!Array.isArray(object.material)){
   const byMaterial=batches.get(object.geometry)??new Map<THREE.Material,THREE.Mesh[]>(),list=byMaterial.get(object.material)??[];list.push(object);byMaterial.set(object.material,list);batches.set(object.geometry,byMaterial);
  }
  for(const [geo,byMaterial]of batches)for(const [mat,meshes]of byMaterial){if(meshes.length<2)continue;const batch=new THREE.InstancedMesh(geo,mat,meshes.length);meshes.forEach((m,i)=>{m.updateMatrix();batch.setMatrixAt(i,m.matrix);group.remove(m);});batch.computeBoundingSphere();group.add(batch);}
 }
 return {root,gate,update(z:number,leg:number,active:boolean){root.visible=active;gate.visible=leg===0;for(const c of chunks)c.visible=Math.abs(c.userData.z-z)<48;roads.visible=active;ground.visible=active;}};
}
