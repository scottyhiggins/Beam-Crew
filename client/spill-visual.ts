import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createLoadVisual,MATERIAL_PIECE_COUNTS} from './load-visual.js';
import {MATERIAL_COLORS} from '../shared/materials.js';
import type {SpillPlan} from './spill-plan.js';
const pieceCache=new Map<string,THREE.BufferGeometry>();
const clusterCache=new Map<string,THREE.BufferGeometry>();
const material=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const footprintGeometry=[.25,.65].map(r=>new THREE.RingGeometry(r*.68,r,16));
const footprintMaterials=MATERIAL_COLORS.map((color,id)=>new THREE.MeshBasicMaterial({color:id===0?0x647c78:color,transparent:true,opacity:.38,depthWrite:false}));

function pieceGeometry(id:number,index:number){
 const key=id+':'+index;let geometry=pieceCache.get(key);if(geometry)return geometry;
 const source=new THREE.Group();createLoadVisual(source,id,index);source.updateMatrixWorld(true);
 const parts:THREE.BufferGeometry[]=[];
 source.traverse(o=>{if(!(o instanceof THREE.Mesh))return;
  let part=o.geometry.clone().applyMatrix4(o.matrixWorld);
  if(part.index){const indexed=part;part=indexed.toNonIndexed();indexed.dispose();}
  const color=(o.material as THREE.MeshLambertMaterial).color;
  const values=new Float32Array(part.getAttribute('position').count*3);
  for(let i=0;i<values.length;i+=3){values[i]=color.r;values[i+1]=color.g;values[i+2]=color.b;}
  part.setAttribute('color',new THREE.BufferAttribute(values,3));parts.push(part);
  o.geometry.dispose();(o.material as THREE.Material).dispose();
 });
 geometry=mergeGeometries(parts)!;for(const part of parts)part.dispose();
 geometry.computeBoundingBox();const bounds=geometry.boundingBox!;
 geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
 pieceCache.set(key,geometry);return geometry;
}

export function spillSignature(p:SpillPlan){return p.id+':'+Math.min(12,p.pieces)+':'+p.offset;}

export function createSpillVisual(plan:SpillPlan){
 const root=new THREE.Group();root.userData.signature=spillSignature(plan);
 // Mark all six effect/collision locations even for a load with only two objects.
 const visible=Math.min(12,plan.pieces);root.userData.visiblePieces=visible;
 if(!visible){
  const large=plan.id<2||plan.id>=10;
  const footprint=new THREE.Mesh(footprintGeometry[large?1:0],footprintMaterials[plan.id]);
  footprint.rotation.x=-Math.PI/2;footprint.position.y=.002;root.add(footprint);return root;
 }
 const key=spillSignature(plan);let geometry=clusterCache.get(key);
 if(!geometry){const parts:THREE.BufferGeometry[]=[];
  for(let i=0;i<visible;i++){
   const part=pieceGeometry(plan.id,(plan.offset+i)%MATERIAL_PIECE_COUNTS[plan.id]).clone();
   if(visible>1){part.rotateY(i*1.7);part.translate((i%3-(Math.min(visible,3)-1)/2)*.23,Math.floor(i/6)*.08,Math.floor(i%6/3)*.26);}
   parts.push(part);
  }
  geometry=mergeGeometries(parts)!;for(const part of parts)part.dispose();clusterCache.set(key,geometry);
 }
 const pieces=new THREE.Mesh(geometry,material);pieces.name='pieces';root.add(pieces);return root;
}

export function updateSpillVisual(root:THREE.Group,plan:SpillPlan,age:number){
 root.userData.representedPieces=plan.pieces;root.userData.loadVolume=plan.volume;
 const pieces=root.getObjectByName('pieces');if(!pieces)return;
 // Loose material shares one load's volume across six smaller patches.
 // Extreme server aggregation retains the previous bounded-pile convention.
 const size=plan.id<2?Math.min(1.6,Math.cbrt(plan.volume)):Math.min(1.6,Math.cbrt(Math.max(1,plan.pieces/12)));
 pieces.scale.setScalar(size);pieces.position.y=age<.55?Math.sin(age/.55*Math.PI)*.35:0;
 pieces.rotation.z=age<.55?Math.sin(age*12)*.2:0;
}
