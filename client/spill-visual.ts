import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createLoadVisual} from './load-visual.js';
// Reuse the loaded silhouettes, then bake each material into one draw call.
const cache=new Map<number,THREE.BufferGeometry>();
const material=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
export function createSpillVisual(id:number){
 let geometry=cache.get(id);
 if(!geometry){const source=new THREE.Group();createLoadVisual(source,id);source.updateMatrixWorld(true);const parts:THREE.BufferGeometry[]=[];
 source.traverse(o=>{if(!(o instanceof THREE.Mesh))return;let part=o.geometry.clone().applyMatrix4(o.matrixWorld);if(part.index){const indexed=part;part=indexed.toNonIndexed();indexed.dispose();}const color=(o.material as THREE.MeshLambertMaterial).color;const values=new Float32Array(part.getAttribute('position').count*3);for(let i=0;i<values.length;i+=3){values[i]=color.r;values[i+1]=color.g;values[i+2]=color.b;}part.setAttribute('color',new THREE.BufferAttribute(values,3));parts.push(part);o.geometry.dispose();(o.material as THREE.Material).dispose();});
 geometry=mergeGeometries(parts)!;for(const p of parts)p.dispose();geometry.translate(0,-.9,-1.15);geometry.scale(.55,.55,.55);cache.set(id,geometry);}
 return new THREE.Mesh(geometry,material);
}
