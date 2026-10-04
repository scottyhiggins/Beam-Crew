import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, movement, type Motion } from '../shared/movement.js';
const fresh=():Motion=>({x:0,z:0,vx:0,vz:0,rotation:0});
test('diagonal input does not exceed movement speed',()=>{const p=fresh();for(let i=0;i<120;i++)movement(p,1,1,1/30);assert.ok(Math.hypot(p.vx,p.vz)<=CONFIG.speed+.00001);});
test('floor boundaries contain players even with sustained input',()=>{const p=fresh();for(let i=0;i<900;i++)movement(p,1,-1,1/30);const edge=CONFIG.halfSize-CONFIG.playerRadius;assert.equal(p.x,edge);assert.equal(p.z,-edge);});
test('releasing input brings a worker to rest',()=>{const p=fresh();for(let i=0;i<30;i++)movement(p,1,0,1/30);for(let i=0;i<30;i++)movement(p,0,0,1/30);assert.equal(p.vx,0);assert.equal(p.vz,0);assert.equal(p.rotation,Math.PI/2);});
test('identical input streams produce identical movement',()=>{const a=fresh(),b=fresh();for(let i=0;i<300;i++){const x=Math.sin(i*.3),z=Math.cos(i*.7);movement(a,x,z,1/30);movement(b,x,z,1/30);}assert.deepEqual(a,b);});
