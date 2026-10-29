import * as THREE from 'three';

// Decorative meshes only. Nothing here participates in the simulation.
function block(g:THREE.Object3D,w:number,h:number,d:number,c:number,x:number,y:number,z:number){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);g.add(m);return m;}
export {makeWorker,animateWorker} from './worker';
export function scenery(scene:THREE.Scene){
 const g=new THREE.Group();scene.add(g);
 block(g,96,.25,110,0xa4a38b,0,-.48,-12);
 for(const [x,z,s]of [[-17,-8,5],[14,-7,4],[13.5,5,3]] as const){const shadow=new THREE.Mesh(new THREE.CircleGeometry(s,16),new THREE.MeshBasicMaterial({color:0x344943,transparent:true,opacity:.13,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.z=.7;shadow.position.set(x,-.345,z);g.add(shadow);}
 // Landmarks sit outside both playable areas and the staging yard.
 block(g,7,2.6,3.5,0x378b91,-17,1.3,-8);block(g,7.4,.18,3.8,0xf0dfb4,-17,2.7,-8);
 for(const x of [-19,-16]){block(g,1.6,1,.05,0x9edce0,x,1.65,-6.22);block(g,1.7,.08,.08,0xf4e8ce,x,1.1,-6.15);}
 block(g,.85,2,.06,0x224e5b,-14.4,1,-6.2);
 for(let i=0;i<6;i++)block(g,3,.17,.3,i%2?0xbc8a50:0xd6a568,13,.15+i*.18,-17);
 for(const x of [12,16])for(const z of [-5,-9]){block(g,.1,6,.1,0x7798a3,x,3,z);}
 for(const y of [1.5,3.2,4.9]){block(g,4.4,.12,4.4,0xd3a369,14,y,-7);for(const z of [-5,-9])block(g,4,.08,.08,0x91b1ba,14,y+.8,z);}
 // Parked compact excavator with tracks, cab and articulated-looking boom.
 for(const x of [12.3,14.7])block(g,.7,.55,3.4,0x344653,x,.35,5);
 block(g,2.8,.8,2.8,0xf2b833,13.5,.95,5);block(g,1.5,1.6,1.8,0x267b88,13.5,2.05,5.2);block(g,1.8,.15,2,0xffd257,13.5,2.9,5.2);
 const boom=block(g,.42,3.5,.45,0xf2b833,13.5,2.5,3);boom.rotation.x=-.55;const stick=block(g,.36,2.6,.4,0xffcf43,13.5,2.6,1.3);stick.rotation.x=.65;block(g,1.3,.55,.9,0x45535a,13.5,1.25,.55);
 // Distant skyline and trees establish depth without textures or post-processing.
 for(let i=0;i<9;i++){const x=-30+i*8;block(g,5,5+i%3*3,4,0x85aeb4,x,1,-48);}
 for(const x of [-23,23])for(const z of [10,-22,-37]){block(g,.35,2,.35,0x8a7051,x,1,z);const tree=new THREE.Mesh(new THREE.IcosahedronGeometry(1.6,0),new THREE.MeshLambertMaterial({color:0x579e79}));tree.position.set(x,3,z);g.add(tree);}
 return g;
}
export function paintArrow(){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=192;const c=canvas.getContext('2d')!;c.fillStyle='#fff0b3';c.beginPath();c.moveTo(64,179);c.lineTo(14,108);c.lineTo(44,108);c.lineTo(44,15);c.lineTo(84,15);c.lineTo(84,108);c.lineTo(114,108);c.closePath();c.fill();c.globalCompositeOperation='destination-out';for(let i=0;i<420;i++){const x=(i*73%127),y=(i*43%191);c.fillRect(x,y,1+i%3,1+i%2);}const texture=new THREE.CanvasTexture(canvas);const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.82,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});return new THREE.Mesh(new THREE.PlaneGeometry(.9,1.35),m);}
