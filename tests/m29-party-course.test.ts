import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PartyRoom} from '../server/party-room.js';
import {CrewState,Player} from '../server/state.js';

test('Party Night clears stale Random intent and keeps its fixed Beam course through replay',()=>{
 const r=new PartyRoom();r.setState(new CrewState());r.lock=async()=>{};r.unlock=async()=>{};
 r.state.host='0';for(let i=0;i<4;i++)r.state.players.set(String(i),new Player());
 for(let session=0;session<2;session++){
  r.state.beamRandom=true;r.state.beamMap=4;
  r.continueParty();r.earliest=0;r.continueParty();
  r.partyTick(r.deadline+1);r.earliest=0;r.continueParty();
  assert.equal(r.index,1);assert.equal(r.partyPhase,'playing');
  assert.equal(r.state.beamMap,2);assert.equal(r.state.beamRandom,false);
  assert.equal(r.state.teams.length,2);assert.equal(r.state.players.size,4);
  r.newSession();
 }
});
