import express from 'express';
import { createServer } from 'node:http';
import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { CrewRoom, roomsByCode } from './room.js';
const app=express();const http=createServer(app);
const server=new Server({transport:new WebSocketTransport({server:http})});
server.define('crew',CrewRoom);
app.get('/api/rooms/:code',(req,res)=>{
  const room=roomsByCode.get(req.params.code.toUpperCase());
  if(!room){res.status(404).json({error:'Room not found'});return;}
  if(room.state.phase!=='lobby'){res.status(409).json({error:'This test is already running. Ask the host to return to the lobby.'});return;}
  res.json({roomId:room.roomId});
});
app.get('/health',(_req,res)=>res.json({ok:true}));
if(process.env.NODE_ENV==='production')app.use(express.static('dist'));
else {const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true,allowedHosts:true}});app.use(vite.middlewares);}
const port=Number(process.env.PORT)||2567;await server.listen(port,'0.0.0.0');console.log(`Beam Crew ready on http://localhost:${port}`);
