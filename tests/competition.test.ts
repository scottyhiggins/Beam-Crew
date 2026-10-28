import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createLoadVisual} from '../client/load-visual.js';
import {WHEEL_FENCES,WHEEL_COURSE,WHEEL_CONFIG,WHEEL_FINISH_CHECKPOINT,resetCart,stepCart,finishCarts,FINISH_STAGING,type Cart} from '../shared/wheelbarrow.js';
import {fenceContact} from '../shared/fences.js';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
test('loads have real material shapes, fit trays, and every selection creates bounded geometry',()=>{
 const types:string[][]=[];for(let id=0;id<12;id++){const g=new THREE.Group();createLoadVisual(g,id);const meshes=g.children as THREE.Mesh[];assert.ok(meshes.length>0&&meshes.length<=30);types.push(meshes.map(m=>m.geometry.type));const bounds=new THREE.Box3().setFromObject(g);assert.ok(bounds.min.x>=-.7&&bounds.max.x<=.7);assert.ok(bounds.min.y>=.8&&bounds.max.y<=1.7);}
 assert.ok(types[0].includes('SphereGeometry'));assert.ok(types[2].includes('CylinderGeometry'));assert.ok(types[5].includes('TorusGeometry'));assert.ok(types[10].includes('IcosahedronGeometry'));assert.notDeepEqual(types[6],types[7]);
});
test('continuous shared fence closes gaps between posts and blocks full-speed lateral shortcut attempts',()=>{
 assert.ok(WHEEL_FENCES.length>0&&WHEEL_FENCES.length<500);
 // Midway between original yellow posts on the first straight.
 assert.ok(fenceContact({x:-8.8,z:4},.65,WHEEL_FENCES));
 const p={} as Cart;resetCart(p,0,2);Object.assign(p,{x:-7.9,z:4,rotation:-Math.PI/2,speed:5.5});for(let i=0;i<180;i++)stepCart(p,-1,0,1/30);assert.ok(p.x>=-8.16);assert.equal(p.finishOrder,0);
});
test('all staging directions remain strictly beyond the finish and preserve immutable results',()=>{
 for(const input of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){const p={} as Cart;resetCart(p,0,2);Object.assign(p,{x:-3,z:-19,checkpoint:WHEEL_FINISH_CHECKPOINT,finishCrossed:true,instability:.8,lean:2});finishCarts([p],31);for(let i=0;i<1000;i++)stepCart(p,input[0],input[1],1/30);finishCarts([p],999);assert.ok(p.x>=FINISH_STAGING.minX&&p.x<=FINISH_STAGING.maxX);assert.ok(p.z>=FINISH_STAGING.minZ&&p.z<=FINISH_STAGING.maxZ);assert.ok(p.z+WHEEL_CONFIG.cartOffset+WHEEL_CONFIG.cartRadius<-18);assert.equal(p.finishTime,31);assert.equal(p.finishOrder,1);assert.equal(p.instability,0);}
});
function racing(){const r=new CrewRoom();r.setState(new CrewState());r.state.mode='wheel';r.state.phase='test';r.state.racePhase='racing';for(let i=0;i<2;i++){const p=new Player();resetCart(p,i,2);r.state.players.set(String(i),p);}return r;}
test('last finisher freezes timer and atomically publishes ranked results; staging still moves',()=>{
 const r=racing();for(const p of r.state.players.values())Object.assign(p,{x:-3,z:-19,checkpoint:WHEEL_FINISH_CHECKPOINT,finishCrossed:true});r.state.players.get('0')!.spills=2;r.tick(1/30);assert.equal(r.state.racePhase,'results');assert.equal(r.state.results.length,2);assert.equal(r.state.results.find(p=>p.finishOrder===2)!.place,1);const elapsed=r.state.elapsed,p=r.state.players.get('0')!,x=p.x;p.lastInput=Date.now();p.inputX=1;for(let i=0;i<20;i++)r.tick(1/30);assert.equal(r.state.elapsed,elapsed);assert.ok(p.x>x);assert.equal(r.state.results.length,2);
});
test('a reserved disconnect waits for reconnect; permanent last-racer departure resolves results without another racing tick',()=>{
 const r=racing(),p=r.state.players.get('0')!;Object.assign(p,{x:-3,z:-19,checkpoint:WHEEL_FINISH_CHECKPOINT,finishCrossed:true});r.tick(1/30);r.state.players.get('1')!.connected=false;r.tick(1/30);assert.equal(r.state.racePhase,'racing');const elapsed=r.state.elapsed;r.state.players.delete('1');r.reconcileWheelResults();assert.equal(r.state.racePhase,'results');r.tick(1/30);assert.equal(r.state.elapsed,elapsed);assert.equal(r.state.results.length,1);
});
