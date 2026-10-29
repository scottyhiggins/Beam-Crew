import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createLoadVisual} from './load-visual.js';
import {debrisParts,debrisScale} from '../shared/debris.js';
import type {SpillPlan} from './spill-plan.js';
const pieceCache=new Map<string,THREE.BufferGeometry>();
const clusterCache=new Map<string,THREE.BufferGeometry>();
const material=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});

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
 const visible=Math.min(12,plan.pieces);root.userData.visiblePieces=visible;
 if(!visible)return root;
 const key=spillSignature(plan);let geometry=clusterCache.get(key);
 if(!geometry){const parts:THREE.BufferGeometry[]=[];
  for(const p of debrisParts(plan)){
   const part=pieceGeometry(plan.id,p.index).clone();
   part.rotateY(p.rotation);part.translate(p.x,p.y,p.z);
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
 pieces.scale.setScalar(debrisScale(plan));
 // Keep geometry grounded and aligned from its first authoritative patch.
 // Cart tipping still animates the spill; persistent hazards never float away.
 pieces.position.y=0;pieces.rotation.z=0;
}
