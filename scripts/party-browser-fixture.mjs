// TEST ONLY: exercises real rooms, clients, rendering and timeout transitions.
// No scoring/finish injection. Unfinished modes correctly award zero points.
// Run after build: node scripts/party-browser-fixture.mjs (port 2600).
import express from 'express';
import {createServer} from 'node:http';
import {Server} from '@colyseus/core';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {fileURLToPath} from 'node:url';
import {PartyRoom,partyRooms} from '../build/server/party-room.js';
import {PROTOCOL_VERSION} from '../build/shared/version.js';
class BrowserPartyFixture extends PartyRoom {
 next(now){super.next(now);if(this.partyPhase==='intermission'){this.earliest=now+1000;this.deadline=now+5000;}}
 startMode(now){super.startMode(now);if(this.partyPhase==='playing'){this.deadline=now+8000;this.notice='Browser QA fixture: eight-second mode timeout; unfinished objectives earn zero.';}}
}
const app=express(),http=createServer(app),server=new Server({transport:new WebSocketTransport({server:http})});
server.define('party',BrowserPartyFixture);
const startedAt=new Date().toISOString();
app.get('/health',(_req,res)=>res.json({ok:true,startedAt,protocol:PROTOCOL_VERSION,build:'BREAK TIME Party Night BROWSER FIXTURE'}));
app.get('/api/party/:code',(req,res)=>{const room=partyRooms.get(req.params.code.toUpperCase());if(!room){res.status(404).json({error:'Room not found'});return;}res.json({roomId:room.roomId});});
app.use(express.static(fileURLToPath(new URL('../dist/',import.meta.url)),{setHeaders(res,path){if(path.endsWith('.html'))res.setHeader('Cache-Control','no-store');}}));
await server.listen(2600,'127.0.0.1');console.log('Party Night browser QA fixture only: http://127.0.0.1:2600/party.html');
