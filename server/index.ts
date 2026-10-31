import {PartyRoom,partyRooms} from './party-room.js';
import {PublicWheelRoom} from './public-room.js';
import {TriviaRoom,triviaRooms} from './trivia-room.js';
import express from 'express';
import {CraneRoom,craneRooms} from './crane-room.js';
import { createServer } from 'node:http';
import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { CrewRoom, roomsByCode } from './room.js';
import { fileURLToPath } from 'node:url';
import { BUILD_LABEL, PROTOCOL_VERSION } from '../shared/version.js';
// Resolve assets from this compiled server's repository, never an unrelated cwd.
const repository=fileURLToPath(new URL('../../',import.meta.url));
const startedAt=new Date().toISOString();
const app=express();const http=createServer(app);
const server=new Server({transport:new WebSocketTransport({server:http})});
server.define('crew',CrewRoom);
server.define('party',PartyRoom);
app.get('/api/party/:code',(req,res)=>{const room=partyRooms.get(req.params.code.toUpperCase());if(!room){res.status(404).json({error:'Party room not found'});return;}if(room.partyPhase!=='lobby'){res.status(409).json({error:'Party already started. Use your reconnect reservation.'});return;}res.json({roomId:room.roomId});});
server.define('wheel_public',PublicWheelRoom);
server.define('trivia',TriviaRoom);
app.get('/api/trivia/:code',(req,res)=>{const room=triviaRooms.get(req.params.code.toUpperCase());if(!room){res.status(404).json({error:'Trivia room not found'});return;}if(room.game.phase!=='lobby'){res.status(409).json({error:'Round in progress. Reconnect or wait for the lobby.'});return;}res.json({roomId:room.roomId});});
server.define('crane',CraneRoom);
app.get('/api/crane/:code',(req,res)=>{const r=craneRooms.get(req.params.code.toUpperCase());if(!r){res.status(404).json({error:'Room not found'});return;}if(r.phase!=='lobby'){res.status(409).json({error:'Round in progress'});return;}res.json({roomId:r.roomId});});
app.get('/api/rooms/:code',(req,res)=>{
  const room=roomsByCode.get(req.params.code.toUpperCase());
  if(!room){res.status(404).json({error:'Room not found'});return;}
  if(room.state.phase!=='lobby'){res.status(409).json({error:'This test is already running. Ask the host to return to the lobby.'});return;}
  res.json({roomId:room.roomId});
});
app.get('/health',(_req,res)=>res.set('Cache-Control','no-store').json({ok:true,build:BUILD_LABEL,protocol:PROTOCOL_VERSION,repository,startedAt}));
if(process.env.NODE_ENV==='production')app.use(express.static(fileURLToPath(new URL('../../dist/',import.meta.url)),{setHeaders(res,path){if(path.endsWith('.html'))res.setHeader('Cache-Control','no-store');}}));
else {const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true,allowedHosts:true}});app.use(vite.middlewares);}
const port=Number(process.env.PORT)||2567;await server.listen(port,'0.0.0.0');console.log(`${BUILD_LABEL} — ${repository}\nBREAK TIME ready on http://localhost:${port}`);

