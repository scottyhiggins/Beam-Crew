import {simulateContainers} from './container-physics.js';
export type Block={id:number,x:number,y:number,vx:number,vy:number,angle:number,spin:number,stable:number,support:number};
export type Arena={x:number,v:number,swing:number,omega:number,pivotY:number,held:boolean,blocks:Block[],score:number,next:number};
export const CABLE=4;
export const arena=():Arena=>({x:-8,v:0,swing:0,omega:0,pivotY:12,held:false,blocks:[],score:0,next:0});
export function loadPose(a:Arena){return {x:a.x+Math.sin(a.swing)*CABLE,y:a.pivotY-Math.cos(a.swing)*CABLE,vx:a.v+Math.cos(a.swing)*CABLE*a.omega,vy:Math.sin(a.swing)*CABLE*a.omega};}
export function action(a:Arena){
 if(!a.held){if(Math.abs(a.x+8)<1.5){a.held=true;a.swing=0;a.omega=0;a.pivotY=Math.max(12,...a.blocks.filter(b=>b.stable>.7).map(b=>b.y+8));}}
 else{const pose=loadPose(a);a.held=false;a.blocks.push({id:a.next++,...pose,angle:a.swing*.25,spin:a.omega*.25,stable:0,support:-2});}
}
export function step(a:Arena,dir:number,dt:number){
 dt=Math.max(0,Math.min(1/15,dt));if(!dt)return;
 const oldV=a.v;const desired=dir*6;a.v+=Math.max(-16*dt,Math.min(16*dt,desired-a.v));a.x+=a.v*dt;
 if(a.x<-10||a.x>10){a.x=Math.max(-10,Math.min(10,a.x));a.v=0;}
 {const acceleration=(a.v-oldV)/dt;a.omega+=(-14/CABLE*Math.sin(a.swing)-acceleration/CABLE*Math.cos(a.swing)-1.05*a.omega)*dt;a.swing+=a.omega*dt;}
 simulateContainers(a.blocks,dt);
 a.blocks=a.blocks.filter(b=>b.y>-16&&Math.abs(b.x)<35).slice(-60);
 const valid=new Map<number,number>();let levels=0;
 for(const b of [...a.blocks].sort((a,b)=>a.y-b.y)){if(b.stable>=.7&&Math.abs(Math.sin(b.angle))<.12&&Math.abs(b.vx)<.2&&(b.support===-1||valid.has(b.support))){const level=b.support===-1?1:valid.get(b.support)!+1;valid.set(b.id,level);levels=Math.max(levels,level);}}
 a.score=levels*10;
}
export function ranking<T extends {score:number,order:number}>(players:T[]){return [...players].sort((a,b)=>b.score-a.score||a.order-b.order);}
