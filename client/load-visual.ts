import * as THREE from 'three';
import {MATERIAL_COLORS} from '../shared/materials.js';
function box(w:number,h:number,d:number,color:number,x:number,y:number,z:number,parent:THREE.Object3D){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
// Logical objects, not mesh parts: a barricade includes its legs; rebar includes ribs.
export const MATERIAL_PIECE_COUNTS=[1,1,5,5,2,2,6,6,4,4,12,12] as const;
export function createLoadVisual(load:THREE.Group,id:number,onlyPiece?:number){
  const color=id===0?0x899796:MATERIAL_COLORS[id],category=Math.floor(id/2);
  if(category===0){const heap=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),new THREE.MeshLambertMaterial({color}));heap.scale.set(.52,id===0?.13:.27,.6);heap.position.set(0,id===0?1.02:1.1,1.15);load.add(heap);return;}
  if(category===1){for(let i=0;i<5;i++){if(onlyPiece!==undefined&&onlyPiece!==i)continue;
    const rod=new THREE.Mesh(new THREE.CylinderGeometry(id===2?.09:.035,id===2?.09:.035,1.2,10,id===2?1:3,id===2),new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide}));rod.rotation.x=Math.PI/2;rod.position.set((i%3-1)*.27,1.03+Math.floor(i/3)*.15,1.15);load.add(rod);
    if(id===2)for(const z of [.55,1.75]){const rim=new THREE.Mesh(new THREE.RingGeometry(.065,.09,10),new THREE.MeshLambertMaterial({color:0xf0eee0,side:THREE.DoubleSide}));rim.position.set(rod.position.x,rod.position.y,z);load.add(rim);}
    else for(let j=0;j<5;j++){const rib=new THREE.Mesh(new THREE.TorusGeometry(.039,.009,3,6),new THREE.MeshLambertMaterial({color:0x505a65}));rib.position.set(rod.position.x,rod.position.y,.67+j*.23);load.add(rib);}
  }return;}
  if(id===4){for(const [i,z] of [.9,1.4].entries()){if(onlyPiece!==undefined&&onlyPiece!==i)continue;box(.95,.13,.12,color,0,1.18,z,load);for(const x of [-.35,.35]){const leg=box(.08,.4,.12,0x384956,x,1.05,z,load);leg.rotation.z=x>0?-.25:.25;}}return;}
  if(id===5){for(let i=0;i<2;i++){if(onlyPiece!==undefined&&onlyPiece!==i)continue;const hose=new THREE.Mesh(new THREE.TorusGeometry(.28,.09,6,12),new THREE.MeshLambertMaterial({color}));hose.rotation.x=Math.PI/2;hose.position.set(0,1.02+i*.17,1.15);load.add(hose);}return;}
  if(category===3){for(let i=0;i<6;i++){if(onlyPiece!==undefined&&onlyPiece!==i)continue;const x=(i%2-.5)*.5,y=1.05+Math.floor(i/2)*.2;if(id===6)box(.42,.18,.5,color,x,y,1.15,load);else{for(const side of [-1,1])box(.07,.18,.48,color,x+side*.17,y,1.15,load);for(const dz of [-.21,0,.21])box(.35,.18,.06,color,x,y,1.15+dz,load);}}return;}
  if(category===4){for(let i=0;i<4;i++){if(onlyPiece!==undefined&&onlyPiece!==i)continue;const board=box(id===8?.18:.8,.065,id===8?1.15:.55,color,(i%2-.5)*.35,1.02+i*.09,1.15,load);board.rotation.y=(i%2-.5)*.35;}return;}
  for(let i=0;i<12;i++){if(onlyPiece!==undefined&&onlyPiece!==i)continue;const stone=new THREE.Mesh(new THREE.IcosahedronGeometry(id===10?.11:.18,0),new THREE.MeshLambertMaterial({color}));stone.scale.y=id===10?.65:1;stone.position.set((i%3-1)*.3,1.1+Math.floor(i/6)*.15,.8+Math.floor(i%6/3)*.55);stone.rotation.set(i*.3,i*.7,0);load.add(stone);}
}
