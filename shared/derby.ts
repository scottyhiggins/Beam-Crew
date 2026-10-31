import {arena,step,loadPose,type Arena} from './crane.js';
export type TargetKind='wall'|'scaffold'|'pallet'|'barrier';
export type Target={id:number,kind:TargetKind,x:number,y:number,w:number,h:number,hp:number,maxHp:number,points:number,destroyed:boolean,touching:boolean};
export type Chunk={id:number,x:number,y:number,z:number,vx:number,vy:number,vz:number,spin:number,age:number,life:number,size:number,kind:TargetKind};
export type Impact={serial:number,x:number,y:number,strength:number,points:number};
export type DerbyArena={crane:Arena,targets:Target[],debris:Chunk[],score:number,destroyed:number,cooldown:number,nextChunk:number,impact:Impact};
export const BALL_RADIUS=1.05,MAX_DEBRIS=72;
export function derbyArena():DerbyArena{
 const crane=arena();crane.x=-10;crane.held=true;crane.pivotY=6;
 const targets:Target[]=[];
 const add=(kind:TargetKind,x:number,y:number,w:number,h:number,hp:number,points:number)=>{targets.push({id:targets.length,kind,x,y,w,h,hp,maxHp:hp,points,destroyed:false,touching:false});};
 for(let row=0;row<3;row++)for(let col=0;col<4;col++)add('wall',-7.8+col*2.6,.85+row*1.7,2.4,1.5,6,30+row*10);
 for(let row=0;row<3;row++)for(let col=0;col<3;col++)add('scaffold',3.3+col*3,1+row*2,2.6,1.8,5,50);
 for(const x of [-10.8,-6,-1,4,9])add('pallet',x,.6,1.8,1.1,3,20);
 for(const x of [-10.5,-3,1,7,11])add('barrier',x,2.2,1.8,.9,4,35);
 return {crane,targets,debris:[],score:0,destroyed:0,cooldown:0,nextChunk:0,impact:{serial:0,x:0,y:0,strength:0,points:0}};
}
/** Reuse Tower Rush's deterministic trolley/pendulum, with a bounded power-swing impulse. */
export function derbyAction(d:DerbyArena,dir:number){if(d.cooldown>0)return false;const sign=Math.sign(dir)||Math.sign(d.crane.omega)||Math.sign(d.crane.v)||1;d.crane.omega=Math.max(-1.8,Math.min(1.8,d.crane.omega+sign*.85));d.cooldown=.7;return true;}
function circleBox(x:number,y:number,t:Target){const dx=Math.max(0,Math.abs(x-t.x)-t.w/2),dy=Math.max(0,Math.abs(y-t.y)-t.h/2);return dx*dx+dy*dy<=BALL_RADIUS*BALL_RADIUS;}
/** Subsample the swept sphere path, not just the end position, to avoid tunnelling. */
export function hitsTarget(from:{x:number,y:number},to:{x:number,y:number},t:Target){const samples=Math.min(64,Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/.3)));for(let i=0;i<=samples;i++){const f=i/samples;if(circleBox(from.x+(to.x-from.x)*f,from.y+(to.y-from.y)*f,t))return true;}return false;}
function chunks(d:DerbyArena,t:Target,vx:number){for(let i=0;i<5;i++){const seed=(t.id*37+i*17)%101;d.debris.push({id:d.nextChunk++,x:t.x+(i-2)*.24,y:t.y,z:(i%3-1)*.35,vx:vx*.35+(i-2)*.8,vy:2+seed%4,vz:(seed%9-4)*.65,spin:(seed%7-3)*2,age:0,life:1.6+(seed%9)*.13,size:.23+(seed%4)*.09,kind:t.kind});}if(d.debris.length>MAX_DEBRIS)d.debris.splice(0,d.debris.length-MAX_DEBRIS);}
export function stepDerby(d:DerbyArena,dir:number,dt:number){
 const before=loadPose(d.crane);step(d.crane,dir,dt);d.cooldown=Math.max(0,d.cooldown-dt);
 if(Math.abs(d.crane.swing)>1.45){d.crane.swing=Math.sign(d.crane.swing)*1.45;d.crane.omega*=-.2;}
 const after=loadPose(d.crane),speed=Math.hypot(after.vx,after.vy);let contacted=false;
 for(const target of d.targets){if(target.destroyed)continue;const hit=hitsTarget(before,after,target);let struck=false;
  if(hit&&!target.touching&&speed>=2.2){struck=true;const damage=Math.max(1,Math.floor(speed*.75));target.hp=Math.max(0,target.hp-damage);let points=0;
   if(target.hp===0){target.destroyed=true;d.score+=target.points;points=target.points;d.destroyed++;chunks(d,target,after.vx);}
   d.impact={serial:d.impact.serial+1,x:target.x,y:target.y,strength:Math.min(1,speed/10),points};contacted=true;
  }
  target.touching=circleBox(after.x,after.y,target)&&(target.touching||struck);
 }
 if(contacted){d.crane.omega*=.84;d.crane.v*=.93;}
 for(const b of d.debris){b.age+=dt;b.vy-=14*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;if(b.y<b.size/2){b.y=b.size/2;b.vy=Math.abs(b.vy)*.2;b.vx*=.85;b.vz*=.85;}}
 d.debris=d.debris.filter(b=>b.age<b.life&&Math.abs(b.x)<25&&Math.abs(b.z)<12);
}

