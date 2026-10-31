import * as THREE from 'three';
import {createDerbyVisual} from './derby-visual';
import type {DerbyArena} from '../shared/derby';
import {arena,loadPose,type Arena} from '../shared/crane';
const palette=[0xe46842,0x239caa,0xeebc3b,0x6476c4,0x61a476];
/** A full 3D jobsite. Gameplay stays on a single travel axis so three controls suffice. */
export function createCraneWorld(view:HTMLElement){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xb2dfeb);scene.fog=new THREE.Fog(0xb2dfeb,75,180);
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;view.append(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(46,1,.1,220);scene.add(new THREE.HemisphereLight(0xe8f8ff,0x6b7560,2.5));const sun=new THREE.DirectionalLight(0xffefd5,3.2);sun.position.set(-18,42,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-27;sun.shadow.camera.right=27;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-24;sun.shadow.camera.far=110;sun.shadow.normalBias=.04;scene.add(sun);
 const geometries=new Map<string,THREE.BoxGeometry>(),materials=new Map<number,THREE.MeshStandardMaterial>();
 function geo(w:number,h:number,d:number){const key=`${w}/${h}/${d}`;if(!geometries.has(key))geometries.set(key,new THREE.BoxGeometry(w,h,d));return geometries.get(key)!;}
 function mat(c:number){if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.82}));return materials.get(c)!;}
 function box(parent:THREE.Object3D,w:number,h:number,d:number,c:number,x=0,y=0,z=0,shadow=true){const m=new THREE.Mesh(geo(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m;}
 function beam(parent:THREE.Object3D,a:THREE.Vector3,b:THREE.Vector3,r:number,c:number){const m=box(parent,r,a.distanceTo(b),r,c);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m;}
 const v=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
 function label(text:string,w:number,h:number,bg:string,fg='#ffffff'){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=fg;ctx.font='900 46px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,67);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));return m;}
 function container(color:number){const g=new THREE.Group();box(g,4,2,2.5,color);const ribs=new THREE.InstancedMesh(geo(.055,1.8,.065),mat(color),20);const matrix=new THREE.Matrix4();for(let i=0;i<10;i++){matrix.makeTranslation(-1.8+i*.4,0,1.28);ribs.setMatrixAt(i,matrix);matrix.makeTranslation(-1.8+i*.4,0,-1.28);ribs.setMatrixAt(i+10,matrix);}g.add(ribs);box(g,4.05,.09,2.55,0x344653,0,.96);box(g,4.05,.09,2.55,0x344653,0,-.96);for(const x of [-1.95,1.95])box(g,.08,1.9,2.56,0x344653,x);box(g,.06,1.8,2.6,0xc7ced0,1.94);return g;}
 box(scene,100,1,90,0x8c9b79,0,-2.6,0,false);box(scene,32,.15,19,0xb4ab8b,-1,-2.02,0,false);
 const towerZone=new THREE.Group();scene.add(towerZone);
 box(towerZone,10,2,6,0x596e78,0,-1,0);box(towerZone,10.3,.1,6.3,0xaab9b8,0,.02,0);
 for(const z of [-3.2,3.2])for(let i=0;i<10;i++)box(towerZone,.66,.06,.22,i%2?0x283c46:0xffcb3d,-4.5+i,.1,z,false);
 box(towerZone,4.8,.12,3.5,0xe9b83b,-8,-1.9,0);const sign=label('STACK ZONE',5,.9,'#213e4d','#ffd14b');sign.position.set(0,.25,3.3);sign.rotation.x=-Math.PI/2;towerZone.add(sign);
 const pickupSign=label('PICKUP',3,.75,'#e9b83b','#213e4d');pickupSign.position.set(-8,-1.79,2.4);pickupSign.rotation.x=-Math.PI/2;towerZone.add(pickupSign);
 // Tower crane: four posts, alternating lattice bracing, counterjib, ballast and cab.
 for(const x of [-13.8,-12.2])for(const z of [-5.8,-4.2])box(scene,.22,38,.22,0xf1b52c,x,17,z);
 box(scene,4,.6,4,0x5d6b70,-13,-1.6,-5);
 for(let y=0;y<36;y+=3){for(const z of [-5.8,-4.2]){beam(scene,v(-13.8,y,z),v(-12.2,y+3,z),.11,0xd89921);beam(scene,v(-12.2,y,z),v(-13.8,y+3,z),.11,0xd89921);}for(const x of [-13.8,-12.2])beam(scene,v(x,y,-5.8),v(x,y+3,-4.2),.12,0xffce4d);}
 for(const z of [-5.7,-4.3]){box(scene,33,.16,.18,0xf2b62f,-3.5,33,z);box(scene,33,.16,.18,0xf2b62f,-3.5,34.6,z);for(let x=-20;x<12;x+=2)beam(scene,v(x,33,z),v(x+2,34.6,z),.1,0xe8a922);}
 for(let x=-20;x<13;x+=2)box(scene,.13,.13,1.6,0xd6921e,x,33,-5);
 box(scene,4,1.2,2.2,0x65747b,-18,32.5,-5);box(scene,2.1,2,2.5,0xefb32d,-11.3,31.2,-4.5);box(scene,1.85,1.3,.06,0x579aaa,-11.3,31.4,-3.22);
 beam(scene,v(-13,38,-5),v(12,34.6,-5),.07,0x536471);beam(scene,v(-13,38,-5),v(-20,34.6,-5),.07,0x536471);
 const brand=label('BREAK TIME',5,1.2,'#16394a','#ffcd46');brand.position.set(-2,34,-4.15);scene.add(brand);
 const trolley=new THREE.Group();box(trolley,1.5,.5,1.6,0x263d4a);scene.add(trolley);
 const hoist=box(scene,.045,1,.045,0x31464f);const rope=box(scene,.06,1,.06,0x243c48);const hook=box(scene,.3,.5,.3,0xffc641);
 const carried=container(palette[0]);scene.add(carried);const waiting=container(palette[0]);waiting.position.set(-8,-.9,0);scene.add(waiting);
 // Perimeter props stay outside the playable pad and are decorative, not destructible.
 for(let i=0;i<7;i++){const x=9+i*2.5;box(scene,1.9,.75,1,0xea8b35,x,-1.6,9);box(scene,1.8,.12,1.05,0xf6e5ba,x,-1.45,9);}
 for(let i=0;i<5;i++){const x=-20+i*2;box(scene,.14,7,.14,0x73828a,x,1.3,-12);box(scene,.14,7,.14,0x73828a,x,1.3,-15);for(let y=0;y<6;y+=2){box(scene,2,.1,3.2,0xc3ad7a,x+1,y,-13.5);beam(scene,v(x,y,-12),v(x+2,y+2,-12),.07,0x8d9da2);}}
 for(let i=0;i<3;i++){const g=container(palette[i+1]);g.position.set(12+i*4.3,-.9,-13);scene.add(g);}
 for(let i=0;i<8;i++){box(scene,1.5,.16,1.2,0xa77e4e,-18+i*.1,-1.7+i*.18,4);}
 for(let i=0;i<14;i++){const x=-34+i*5;const height=5+(i*7%15);box(scene,3.5,height,4,0x829da3,x,height/2-2,-36,false);for(let y=1;y<height-1;y+=2)box(scene,2.5,.5,.04,0xc1d5d3,x,y,-33.97,false);}
 for(const z of [-23,16]){for(let x=-27;x<=28;x+=5)box(scene,.12,2,.12,0x657a7c,x,-1,z,false);box(scene,55,.09,.09,0x657a7c,0,0,z,false);box(scene,55,.09,.09,0x657a7c,0,-1,z,false);}
 const marker=new THREE.LineSegments(new THREE.EdgesGeometry(geo(4,.04,2.5)),new THREE.LineBasicMaterial({color:0xffcf43}));scene.add(marker);
 const derbyVisual=createDerbyVisual(scene);let currentDerby:DerbyArena|undefined;
 const meshMap=new Map<number,THREE.Group>();let current=arena();let active=false;const target=new THREE.Vector3(-1,9,0);let last=performance.now(),cameraHeight=20;
 function line(m:THREE.Mesh,a:THREE.Vector3,b:THREE.Vector3){m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=a.distanceTo(b);m.quaternion.setFromUnitVectors(v(0,1,0),b.clone().sub(a).normalize());}
 function render(){requestAnimationFrame(render);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;const a=currentDerby?.crane??current;const isDerby=!!currentDerby;const pose=loadPose(a);towerZone.visible=!isDerby;derbyVisual.setVisible(isDerby);if(currentDerby)derbyVisual.update(currentDerby,dt);
  trolley.position.set(a.x,32.7,-5);line(hoist,v(a.x,32.5,-5),v(a.x,a.pivotY,-5));
  // The trolley's forward rail arm carries the suspension into the stacking lane.
  arm.position.set(a.x,a.pivotY,-2.5);hook.position.set(a.held?pose.x:a.x,a.held?pose.y+1.25:a.pivotY-.25,0);hook.rotation.z=a.swing*.25;
  carried.visible=!isDerby&&a.held;carried.position.set(pose.x,pose.y,0);carried.rotation.z=a.swing*.25;waiting.visible=!isDerby&&!a.held;
  marker.visible=!isDerby&&a.held;marker.position.set(pose.x,Math.abs(pose.x)<5?.15:-1.85,0);rope.visible=a.held;line(rope,v(a.x,a.pivotY,0),v(pose.x,pose.y+(isDerby?1.2:1),0));
  for(const [id,m] of meshMap)if(!a.blocks.some(b=>b.id===id)){scene.remove(m);m.traverse(o=>{if(o instanceof THREE.InstancedMesh)o.dispose();});meshMap.delete(id);}
  for(const b of a.blocks){let m=meshMap.get(b.id);if(!m){m=container(palette[b.id%palette.length]);scene.add(m);meshMap.set(b.id,m);}m.position.set(b.x,b.y,0);m.rotation.z=b.angle;}
  const highest=isDerby?11:Math.max(9,...a.blocks.filter(b=>Math.abs(b.x)<15&&b.y>0).map(b=>b.y+3),a.held?pose.y+3:9);const wanted=active?Math.max(20,highest+5):32;cameraHeight=THREE.MathUtils.damp(cameraHeight,wanted,2,dt);
  const w=view.clientWidth,h=view.clientHeight;if(renderer.domElement.width!==Math.round(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);
  target.y=THREE.MathUtils.damp(target.y,active?Math.max(4,highest*.42):Math.max(13,highest*.46),2,dt);target.x=-2;target.z=-1;const distance=Math.max(active?32:52,cameraHeight*(active?1.3:1.5),(active?(isDerby?32:24):28)/camera.aspect);camera.position.set(target.x+distance*.48,target.y+distance*.57,distance*.85);camera.lookAt(target);camera.updateProjectionMatrix();renderer.render(scene,camera);
 }
 const arm=box(scene,.18,.18,5.2,0xe4a925);render();return {update(a:Arena,playing=false,derby?:DerbyArena){current=a;active=playing;currentDerby=derby;}};
}


