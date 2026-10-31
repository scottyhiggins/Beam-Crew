/** Test-only feasibility spike. NOT registered in PartyRoom or PARTY_PLAYLIST.
 * The native simulation fits the server interface, but the current Party client
 * has no Tower snapshot/input/scene path; shipping it would require another
 * full lifecycle integration. Keep the stable three-mode playlist for M22. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {arena,action,step,ranking,type Arena} from '../shared/crane.js';
import type {TowerRushPartyAdapter,PartyPerson,PartyModeResult} from '../shared/party.js';
import {DEFAULT_WORKER_LOOK} from '../shared/cosmetics.js';
class TowerSpike implements TowerRushPartyAdapter {
 players=new Map<string,{id:string;order:number;score:number;arena:Arena;dir:number;last:number}>();epoch=0;startAt=0;ticks=0;finished=false;
 start(players:readonly Pick<PartyPerson,'id'|'name'|'look'>[],options:{durationSeconds:60;epoch:number;now:number}){this.reset();this.epoch=options.epoch;this.startAt=options.now;players.forEach((p,order)=>this.players.set(p.id,{id:p.id,order,score:0,arena:arena(),dir:0,last:0}));}
 input(id:string,data:unknown,epoch:number){if(epoch!==this.epoch||this.finished||!data||typeof data!=='object')return;const p=this.players.get(id),d=data as {dir?:unknown;action?:unknown;now?:unknown};if(!p)return;if(typeof d.dir==='number'&&Number.isFinite(d.dir)){p.dir=Math.max(-1,Math.min(1,d.dir));p.last=this.ticks;}if(d.action===true)action(p.arena);}
 tick(now:number){const target=Math.min(1800,Math.max(0,Math.floor((now-this.startAt)*.03)));while(this.ticks<target&&!this.finished){this.ticks++;for(const p of this.players.values()){step(p.arena,this.ticks-p.last<15?p.dir:0,1/30);p.score=p.arena.score;}this.finished=this.ticks===1800||[...this.players.values()].some(p=>p.score>=100);}}
 view(id:string){const p=this.players.get(id);return {epoch:this.epoch,elapsed:this.ticks/30,arena:p?.arena,leaders:ranking([...this.players.values()]).map(p=>({id:p.id,score:p.score}))};}
 result():PartyModeResult|null{return this.finished?{mode:'tower',entries:ranking([...this.players.values()]).map((p,i)=>({members:[p.id],eligible:true,rank:i+1,native:p.score+' ft',stats:{towerHeight:p.score}}))}:null;}
 reset(){this.players.clear();this.epoch++;this.startAt=this.ticks=0;this.finished=false;}
 dispose(){this.reset();}
}
const people=Array.from({length:8},(_,i)=>({id:'p'+i,name:'Worker '+i,look:DEFAULT_WORKER_LOOK}));
test('M22 optional Tower adapter spike: eight private arenas, epoch guard, deterministic 60-second native result',()=>{const a:TowerRushPartyAdapter=new TowerSpike();a.start(people,{durationSeconds:60,epoch:4,now:1000});a.input('p0',{action:true},3);assert.equal((a.view('p0') as any).arena.held,false);a.input('p0',{action:true},4);assert.equal((a.view('p0') as any).arena.held,true);assert.equal((a.view('p1') as any).arena.held,false);a.tick(60999);assert.equal(a.result(),null);a.tick(61000);assert.equal(a.result()!.entries.length,8);assert.deepEqual(a.result()!.entries[0].members,['p0']);assert.equal((a.view('p0') as any).elapsed,60);a.dispose();assert.equal((a as TowerSpike).players.size,0);});
test('M22 optional Tower adapter spike: reset isolates the next playlist epoch and clears all arena state',()=>{const a=new TowerSpike();a.start(people,{durationSeconds:60,epoch:7,now:0});a.input('p0',{action:true,dir:1},7);a.tick(1000);a.reset();a.start(people,{durationSeconds:60,epoch:9,now:5000});a.input('p0',{action:true,dir:1},7);a.tick(6000);assert.equal((a.view('p0') as any).arena.held,false);assert.equal((a.view('p0') as any).arena.x,-8);assert.equal(a.result(),null);a.dispose();});
