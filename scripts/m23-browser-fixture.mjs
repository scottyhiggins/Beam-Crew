// Local visual QA only. Never imported by the production server.
import express from 'express';
import {createServer} from 'node:http';
import {Server} from '@colyseus/core';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=path.resolve(process.env.QA_ROOT||'.');
const {CrewRoom,roomsByCode}=await import(pathToFileURL(path.join(root,'build/server/room.js')));
const {PROTOCOL_VERSION}=await import(pathToFileURL(path.join(root,'build/shared/version.js')));
const app=express(),http=createServer(app),server=new Server({transport:new WebSocketTransport({server:http})});server.define('crew',CrewRoom);
const startedAt=new Date().toISOString();app.get('/health',(_,res)=>res.json({protocol:PROTOCOL_VERSION,startedAt}));
app.get('/api/rooms/:code',(req,res)=>{const r=roomsByCode.get(req.params.code.toUpperCase());res.json({roomId:r?.roomId});});
app.post('/qa/:code/:action',(req,res)=>{const r=roomsByCode.get(req.params.code);if(!r)return res.sendStatus(404);const t=r.currentTrack();if(req.params.action==='finish'){const ps=[...r.state.players.values()];for(const [i,p]of ps.entries()){if(req.query.one&&i>0)continue;Object.assign(p,{x:(t.staging.minX+t.staging.maxX)/2+(i%4-1.5)*1.5,z:t.finishZ-5-Math.floor(i/4)*2,checkpoint:t.gates.length+1,finishCrossed:true,legSpills:i%3});}r.tick(1/30);}if(req.params.action==='next')for(let i=0;i<151;i++)r.tick(1/30);res.json({leg:r.state.leg,phase:r.state.racePhase});});
app.use(express.static(path.join(root,'dist')));await server.listen(Number(process.env.PORT)||2824,'127.0.0.1');console.log('QA fixture '+root);
