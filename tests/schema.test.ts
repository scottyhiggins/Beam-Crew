import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Encoder } from '@colyseus/schema';
import { CrewState, Player } from '../server/state.js';
test('room schema encodes eight workers and subsequent changes',()=>{const state=new CrewState();state.code='ABCDE';for(let i=0;i<8;i++){const p=new Player();p.color=i;state.players.set(String(i),p);}const encoder=new Encoder(state);assert.ok(encoder.encodeAll().length>0);state.players.get('0')!.x=5;assert.ok(encoder.encode().length>0);});
