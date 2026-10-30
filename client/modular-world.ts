import * as THREE from 'three';
import {createChampionshipWorld as legacyWorld} from './championship-world.js';
import {assembleRoute,courseSurfacePolygons,courseVisibleFences,type CourseInstance} from '../shared/course-modules.js';
type Batch={geometry:THREE.BufferGeometry;material:THREE.Material;matrices:THREE.Matrix4[]};
export function createModularWorld(){
 const root=new THREE.Group(),geometries=new Map<string,THREE.BufferGeometry>(),materials=new Map<number,THREE.MeshLambertMaterial>();
 let legacy:ReturnType<typeof legacyWorld>|undefined,key='',groups:{root:THREE.Group;gate:THREE.Group;course:CourseInstance}[]=[];
 const geometry=(kind:string)=>{let g=geometries.get(kind);if(!g){g=kind==='tank'?new THREE.CylinderGeometry(1,1,3,10):kind==='road-disc'?new THREE.CylinderGeometry(2.8,2.8,.05,24):kind==='link'?new THREE.TorusGeometry(.06,.015,3,6):kind==='cone'?new THREE.ConeGeometry(.22,.65,8):kind==='gravel'?new THREE.ConeGeometry(1.2,.65,12):kind==='pipe'?new THREE.CylinderGeometry(.3,.3,4,10,1,true):kind==='tire'?new THREE.CylinderGeometry(.4,.4,.22,10):kind==='stone'?new THREE.IcosahedronGeometry(.12,0):new THREE.BoxGeometry(1,1,1);geometries.set(kind,g);}return g;};
 const material=(color:number)=>{let m=materials.get(color);if(!m){m=new THREE.MeshLambertMaterial({color});materials.set(color,m);}return m;};
 function build(course:CourseInstance,index:number,total:number){
  const group=new THREE.Group(),gate=new THREE.Group();root.add(group);group.add(gate);const batches=new Map<string,Batch>(),dummy=new THREE.Object3D();
  const add=(kind:string,color:number,x:number,y:number,z:number,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{const id=kind+color,b=batches.get(id)??{geometry:geometry(kind),material:material(color),matrices:[]};dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();b.matrices.push(dummy.matrix.clone());batches.set(id,b);};
  const box=(w:number,h:number,d:number,c:number,x:number,y:number,z:number,ry=0,rx=0)=>add('box',c,x,y,z,w,h,d,rx,ry);
  const {track:t,module:m,origin:o}=course,cx=(t.staging.minX+t.staging.maxX)/2;
  const xs=t.path.map(p=>p.x),minX=Math.min(...xs),maxX=Math.max(...xs);
  box(maxX-minX+80,.22,course.entry.z-course.exit.z+(index===0?40:0)+(index===total-1?40:0),0xa4a38b,(minX+maxX)/2,-.48,(course.entry.z+course.exit.z+(index===0?40:0)-(index===total-1?40:0))/2);
  const vertices:number[]=[];
  for(const polygon of courseSurfacePolygons(course)){
   const points=polygon.map(p=>new THREE.Vector2(p.x,p.z));
   for(const triangle of THREE.ShapeUtils.triangulateShape(points,[]))for(const i of triangle){const p=polygon[i];vertices.push(p.x,.035,p.z);}
  }
  const ground=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  ground.computeVertexNormals();const groundMaterial=material(m.surface);groundMaterial.side=THREE.DoubleSide;
  const surface=new THREE.Mesh(ground,groundMaterial);surface.userData.ownedGeometry=true;surface.name='course-surface';group.add(surface);
  // Painted detour arrows lead around the gravel instead of through its collision footprint.
  for(let i=1;i<course.drivePath.length;i++){const a=course.drivePath[i-1],b=course.drivePath[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);for(let d=1;d<len;d+=3){const x=a.x+dx*d/len,z=a.z+dz*d/len;box(.12,.025,.8,0xfff0b3,x,.075,z,angle);for(const side of [-1,1])box(.12,.025,.45,0xfff0b3,x+Math.sin(angle)*.25+Math.cos(angle)*side*.14,.075,z+Math.cos(angle)*.25-Math.sin(angle)*side*.14,angle-side*.7);}}
  const positions:number[]=[],colors:number[]=[],postPositions:{x:number;z:number}[]=[];
  const line=(ax:number,az:number,bx:number,bz:number,color:number,height:number)=>{positions.push(ax,height,az,bx,height,bz);const c=new THREE.Color(color);for(let n=0;n<2;n++)colors.push(c.r,c.g,c.b);};
  // Template fences belong to this module; entrance-yard geometry belongs to the prior module.
  const fences=courseVisibleFences(course,index,total);
  for(const f of fences){
   const pieces=[f];
   for(const piece of pieces){const dx=piece.b.x-piece.a.x,dz=piece.b.z-piece.a.z,len=Math.hypot(dx,dz),steps=Math.max(1,Math.ceil(len/.45));
    for(let n=0;n<steps;n++){const a=n/steps,b=(n+1)/steps;line(piece.a.x+dx*a,piece.a.z+dz*a,piece.a.x+dx*b,piece.a.z+dz*b,m.barrier==='tape'?(n%2?0xf5eee1:0xda3937):m.barrier==='chain'?0xf3e4d0:0xf0d397,m.barrier==='tape'?1:.5);}
    if(m.barrier==='chain')for(let d=.14;d<len;d+=.28)add('link',0xf3e4d0,piece.a.x+dx*d/len,.5,piece.a.z+dz*d/len,1,1,1,0,Math.atan2(dx,dz)+Math.PI/2);
    if(m.barrier==='tape')for(let n=0;n<steps;n++){const a=n/steps,b=(n+1)/steps;box(.035,.08,len/steps,n%2?0xf5eee1:0xda3937,piece.a.x+dx*(a+b)/2,1,piece.a.z+dz*(a+b)/2,Math.atan2(dx,dz));}
    if(m.barrier!=='rope')for(let d=0;d<=len;d+=2.3){const x=piece.a.x+dx*d/(len||1),z=piece.a.z+dz*d/(len||1);if(!postPositions.some(p=>Math.hypot(x-p.x,z-p.z)<1.8)){postPositions.push({x,z});if(m.barrier==='chain'){add('cone',0xf57425,x,.325,z);box(.32,.12,.32,0xfff1da,x,.34,z);}else{box(.42,.1,.42,0x28353a,x,.05,z);box(.12,1.15,.12,0xf47c29,x,.625,z);for(const y of [.65,.95])box(.14,.12,.14,0xf6f3db,x,y,z);}}}
   }
  }
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(positions,3)).setAttribute('color',new THREE.Float32BufferAttribute(colors,3)),new THREE.LineBasicMaterial({vertexColors:true})));
  if(m.barrier==='rope')for(const p of t.obstacles){box(.3,.65,.3,0xffc137,p.x,.32,p.z);box(.32,.12,.32,0x27343d,p.x,.48,p.z);}
  const rough=t.rough;for(let x=rough.minX;x<rough.maxX;x+=.65)box(.16,.13,rough.maxZ-rough.minZ,0x776b58,x,.1,(rough.minZ+rough.maxZ)/2);
  // A closed next-course gate exactly spans the authoritative yard end cap.
  if(index<total-1){for(let n=0;n<7;n++){const mesh=new THREE.Mesh(geometry('box'),material(n%2?0xffc137:0x28353a));mesh.scale.set(.78,.75,.14);mesh.position.set(cx-2.4+n*.8,.6,course.exit.z);gate.add(mesh);}}
  for(let n=0;n<7;n++){const x=cx-2.4+n*.8;box(.77,.07,1.4,0x283039,x,.06,t.finishZ+.5);for(let j=0;j<3;j++)box(.08,.26,.12,0xf5cb32,x-.26+j*.26,.2,t.ramp.edgeZ+.18,0,-.3);}
  for(let row=0;row<3;row++)for(let n=0;n<14;n++)box(.4,.025,.13,(n+row)%2?0xffffff:row===1?0x45be7b:0x182323,cx-2.6+n*.4,.13,t.finishZ+.15+row*.14);
  // Both skyline sides lie outside every driveable lane and use only cached box instances.
  for(const side of [-1,1])for(let n=0;n<2;n++){const x=side<0?minX-16-n*8:maxX+16+n*8,z=course.entry.z-12-n*20,h=12+index%3*4+n*5;box(6,h,8,0x789da6,x,h/2,z);for(let y=3;y<h;y+=3)for(let k=0;k<3;k++)box(.03,.7,1,0xaac6c8,x-side*3.02,y,z-2.5+k*2.5);}
  const sx=maxX+8,sz=course.entry.z-15;
  for(const dx of [-2,2])for(const dz of [-2,2])box(.18,8,.18,0x80969b,sx+dx,4,sz+dz);
  for(const y of [2,4,6,8])box(4.4,.12,4.4,0xb7a27b,sx,y,sz);
  for(const x of [sx+5,sx+5.7])for(const dz of [-.35,.35])box(.12,14,.12,0xe8b942,x,7,sz+dz);box(18,.3,.5,0xe8b942,sx+1,14,sz);
  if(m.landmark==='dump'){
   const x=o.x+4.1,z=o.z-11.5;box(2.2,.65,4.6,0xe9a436,x,.85,z);box(2,1.4,1.4,0xebae35,x,1.65,z+1.5);box(1.8,.65,.05,0x367c89,x,1.8,z+2.22);
   for(const dx of [-1.15,1.15])for(const dz of [-1.5,1.5])add('tire',0x29343b,x+dx,.42,z+dz,1,1,1,0,0,Math.PI/2);
   const angle=.67,bed=(lx:number,ly:number,lz:number,w:number,h:number,d:number,c:number)=>box(w,h,d,c,x+lx,2.6+ly*Math.cos(angle)-lz*Math.sin(angle),z-.7+ly*Math.sin(angle)+lz*Math.cos(angle),0,angle);
   bed(0,0,0,2.1,.22,3.2,0xbd7b32);for(const side of [-1,1])bed(side*1.02,.4,0,.12,.8,3.2,0xe4a340);bed(0,.4,1.55,2.1,.8,.12,0xe4a340);
   add('gravel',0x969284,o.x+1.45,.4,o.z-15);for(let n=0;n<10;n++){const a=n*2.4;add('stone',0x777c77,o.x+1.45+Math.sin(a)*.8,.18,o.z-15+Math.cos(a)*.8);}
  }else if(m.landmark==='excavator'){
   const x=minX-7,z=course.entry.z-14;for(const dx of [-1.2,1.2])box(.6,.5,3.5,0x344653,x+dx,.3,z);box(2.7,.7,3,0xe8b536,x,.95,z);box(1.5,1.6,1.7,0x287784,x,2,z);box(.35,3.6,.4,0xf2bf38,x,2.5,z-2,0,.55);box(1.2,.5,1,0x45535a,x,.5,z-4);
  }else if(m.landmark==='bricks'){
   for(let pallet=0;pallet<3;pallet++){const x=minX-6-pallet*2.2,z=course.entry.z-16;box(1.8,.16,2.1,0xb98d57,x,.12,z);for(let row=0;row<4;row++)for(let col=0;col<3;col++)for(let depth=0;depth<2;depth++)box(.48,.22,.8,row%2?0xb76a49:0xcf805b,x-.55+col*.55,.32+row*.25,z-.5+depth*.9);}
  }else if(m.landmark==='roller'){
   const x=maxX+6,z=course.entry.z-17;box(2.4,.7,3.1,0xeab43a,x,1,z);add('tire',0x75848a,x,.72,z-1.2,1.8,10,1.8,0,0,Math.PI/2);for(const dx of [-1.15,1.15])add('tire',0x28353a,x+dx,.55,z+1,1.3,1.5,1.3,0,0,Math.PI/2);box(1.5,1.7,1.5,0x347d86,x,2,z+.7);box(2,.13,2,0xefca57,x,2.9,z+.7);
  }else if(m.landmark==='tanks'){
   for(let n=0;n<3;n++){const x=minX-6-n*2.6,z=course.entry.z-17;add('tank',0xa0b5b0,x,1.6,z);box(.1,2.5,.1,0xe8be4f,x+1.05,1.25,z);for(let row=0;row<5;row++)box(.65,.08,.08,0xe8be4f,x+1.1,.4+row*.45,z);}
  }else if(m.landmark==='pipes'||m.landmark==='scaffold'){
   if(m.id==='steel-deck')for(let n=1;n<7;n++)box(5.2,.025,.08,0x344f5f,o.x,.055,o.z-n*1.1);
   const x=minX-6,z=course.entry.z-12;for(let n=0;n<6;n++)add('pipe',m.landmark==='pipes'?0x5e858e:0xbac7c5,x+n%3*.65,.35+Math.floor(n/3)*.65,z,1,1,1,Math.PI/2);
  }
  for(let n=0;n<6;n++)box(3,.16,.4,0xc59156,maxX+6,.2+n*.18,course.entry.z-26);
  for(const b of batches.values()){const mesh=new THREE.InstancedMesh(b.geometry,b.material,b.matrices.length);b.matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.computeBoundingSphere();group.add(mesh);}
  return {root:group,gate,course};
 }
 return {root,update(z:number,leg:number,active:boolean,ids:readonly string[]=[]){
  root.visible=active;if(!active)return;
  if(!ids.length){if(!legacy){legacy=legacyWorld();root.add(legacy.root);}legacy.update(z,leg,true);for(const g of groups)g.root.visible=false;return;}
  if(legacy)legacy.root.visible=false;
  const nextKey=ids.join(',');if(nextKey!==key){for(const g of groups){root.remove(g.root);g.root.traverse(object=>{if(object instanceof THREE.InstancedMesh)object.dispose();if(object instanceof THREE.Mesh&&object.userData.ownedGeometry)object.geometry.dispose();if(object instanceof THREE.LineSegments){object.geometry.dispose();(object.material as THREE.Material).dispose();}});}groups=assembleRoute(ids).map((c,i)=>build(c,i,ids.length));key=nextKey;}
  for(let i=0;i<groups.length;i++){const g=groups[i],distance=Math.max(0,g.course.exit.z-z,z-g.course.entry.z);g.root.visible=Math.abs(i-leg)<=1&&distance<60;g.gate.visible=leg<=i;}
 }};
}
