import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resetCart,stepCart,finishCarts,rampHeight,FINISH_RAMP,WHEEL_FINISH_CHECKPOINT,collideStagingCarts,WHEEL_FENCES,type Cart} from '../shared/wheelbarrow.js';
import {fenceContact} from '../shared/fences.js';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
function cart(){const p={} as Cart;resetCart(p,0,2);return p;}
test('finish records a continuous pose and velocity, then drives over the wedge into the connected yard',()=>{
 const p=cart();Object.assign(p,{x:-3,z:-16.24,speed:2,rotation:Math.PI,checkpoint:4});let crossed=false,maxRise=0;
 for(let i=0;i<150;i++){const before={x:p.x,z:p.z,speed:p.speed};stepCart(p,0,-.35,1/30);const pose={x:p.x,z:p.z,speed:p.speed};finishCarts([p],10+i/30);assert.deepEqual({x:p.x,z:p.z,speed:p.speed},pose);assert.ok(Math.hypot(p.x-before.x,p.z-before.z)<.2);crossed ||= p.finishOrder===1;maxRise=Math.max(maxRise,rampHeight(p.x,p.z));}
 assert.ok(crossed);assert.ok(p.z<-23);assert.ok(maxRise>.18);assert.equal(rampHeight(-3,FINISH_RAMP.edgeZ-.001),0);
 const z=p.z;for(let i=0;i<400;i++)stepCart(p,0,.4,1/30);assert.ok(p.z>z);assert.ok(p.z+1.75< -18);assert.equal(p.finishOrder,1);
});
test('post-finish spills use the normal reload and bounded persistent hazards without changing official scores or time',()=>{
 const room=new CrewRoom();room.setState(new CrewState());Object.assign(room.state,{phase:'test',mode:'wheel',racePhase:'racing',elapsed:20});
 for(let i=0;i<2;i++){const p=new Player();resetCart(p,i,2);Object.assign(p,{name:'P'+i,x:-5+i*4,z:-25,checkpoint:WHEEL_FINISH_CHECKPOINT,finishCrossed:true});room.state.players.set(''+i,p);}
 room.tick(1/30);assert.equal(room.state.racePhase,'results');const scores=JSON.stringify(room.state.results),elapsed=room.state.elapsed,p=room.state.players.get('0')!;
 Object.assign(p,{speed:5.5,instability:.999,inputX:1,inputZ:0,lastInput:Date.now()});room.tick(1/30);assert.equal(p.spills,1);assert.ok(p.reload>0);assert.equal(room.state.material.length,6);
 for(let i=0;i<100;i++)room.tick(1/30);assert.equal(p.reload,0);assert.equal(JSON.stringify(room.state.results),scores);assert.equal(room.state.elapsed,elapsed);assert.equal(room.state.finishCount,2);
});
test('staging carts bump and yield to an unfinished arrival instead of forming an immovable finish wall',()=>{
 const a=cart(),b=cart();Object.assign(a,{x:-3,z:-21,finishOrder:1});Object.assign(b,{x:-3,z:-21,finishOrder:2});collideStagingCarts([a,b]);assert.ok(Math.abs(a.x-b.x)>1.29);
 Object.assign(a,{x:-3,z:-20,finishOrder:1});Object.assign(b,{x:-3,z:-19.6,finishOrder:0,checkpoint:4});const before=b.z;collideStagingCarts([a,b]);assert.equal(b.z,before);assert.ok(a.z<-20.5);
});

test('connected yard opens the old end cap while preserving both finish-approach ropes',()=>{for(const z of [-14,-15,-17.5])for(const x of [-5.8,-.2])assert.ok(fenceContact({x,z},.65,WHEEL_FENCES));for(const z of [-18,-19,-20,-21,-23])assert.equal(fenceContact({x:-3,z},.65,WHEEL_FENCES),undefined);});
