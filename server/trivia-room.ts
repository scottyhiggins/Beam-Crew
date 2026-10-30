import {validateWorkerLook,type WorkerLook} from '../shared/cosmetics.js';
import {Room,Client,ServerError} from '@colyseus/core';
import {randomInt} from 'node:crypto';
import {TriviaGame} from './trivia-game.js';
export const triviaRooms=new Map<string,TriviaRoom>();
export class TriviaRoom extends Room {
 maxClients=8;game=new TriviaGame();
 onCreate(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';do{this.game.code=Array.from({length:5},()=>alphabet[randomInt(alphabet.length)]).join('');}while(triviaRooms.has(this.game.code));triviaRooms.set(this.game.code,this);
 this.onMessage('sync',c=>this.sendView(c));
 this.onMessage('count',(c,n)=>{this.game.configure(c.sessionId,n);this.publish();});
 this.onMessage('start',c=>{if(this.game.start(c.sessionId,Date.now()))void this.lock();this.publish();});
 this.onMessage('answer',(c,a)=>{this.game.answer(c.sessionId,a,Date.now());this.publish();});
 this.onMessage('lobby',c=>{if(this.game.lobby(c.sessionId))void this.unlock();this.publish();});
 this.setSimulationInterval(()=>{this.game.tick(Date.now());this.publish();},250);
 }
 private looks=new Map<string,WorkerLook>();
 sendView(c:Client){const view=this.game.view(c.sessionId,Date.now());view.players=view.players.map(p=>({...p,look:this.looks.get(p.id)}));c.send('view',view);}
 publish(){for(const c of this.clients)this.sendView(c);}
 onJoin(c:Client,options:{name?:unknown;look?:unknown}){const name=typeof options.name==='string'?options.name.replace(/[\u0000-\u001f]/g,'').trim().slice(0,18)||'Worker':'Worker';if(!this.game.add(c.sessionId,name))throw new ServerError(409,'Trivia needs an open lobby and at most eight workers');this.looks.set(c.sessionId,validateWorkerLook(options.look));this.publish();}
 async onLeave(c:Client,consented:boolean){this.game.disconnect(c.sessionId);this.publish();try{if(consented)throw Error('left');await this.allowReconnection(c,60);this.game.reconnect(c.sessionId);}catch{this.game.disconnect(c.sessionId,true);this.looks.delete(c.sessionId);}this.publish();}
 onDispose(){triviaRooms.delete(this.game.code);}
}
