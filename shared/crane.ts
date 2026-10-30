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
 const oldV=a.v;const desired=dir*6;a.v+=Math.max(-16*dt,Math.min(16*dt,desired-a.v));a.x+=a.v*dt;
 if(a.x<-10||a.x>10){a.x=Math.max(-10,Math.min(10,a.x));a.v=0;}
 if(a.held){const acceleration=(a.v-oldV)/dt;a.omega+=(-14/CABLE*Math.sin(a.swing)-acceleration/CABLE*Math.cos(a.swing)-1.05*a.omega)*dt;a.swing+=a.omega*dt;}
 const sorted=[...a.blocks].sort((a,b)=>a.y-b.y||a.id-b.id);
 for(const b of sorted){
  const previousBottom=b.y-1;b.vy-=14*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.angle+=b.spin*dt;
  let top=-2,support=-1,center=b.x,width=100;
  // Stacking pad top is zero; the surrounding yard lies two units lower and never scores.
  if(Math.abs(b.x)<=5){top=0;center=0;width=5;}
  for(const p of sorted){if(p===b||p.y>=b.y+1||p.stable<.15||Math.abs(p.angle)>.15)continue;
   if(Math.abs(b.x-p.x)<3.8&&p.y+1>top&&previousBottom>=p.y+.85){top=p.y+1;support=p.id;center=p.x;width=1.8;}}
  if(b.y-1<=top&&previousBottom>=top-.08&&b.vy<=0){
   const offset=b.x-center;
   if(Math.abs(offset)<width&&Math.abs(b.angle)<.2&&Math.abs(b.vx)<3.5){b.y=top+1;b.vy=0;b.vx*=.72;b.spin*=.65;b.angle*=.82;b.support=top<0?-2:support;b.stable+=dt;}
   else{b.y=top+1;b.vy=0;b.vx+=Math.sign(offset||b.vx||1)*2.5*dt;b.spin+=Math.sign(offset||b.vx||1)*3*dt;b.stable=0;b.support=-2;}
  }else{b.stable=0;b.support=-2;}
 }
 // A tower's centre of mass must remain within every supporting footprint.
 // Top-heavy overhang invalidates the whole branch and transfers a tipping impulse.
 for(const base of sorted){if(base.stable<.15)continue;const branch=[base];for(const b of sorted)if(b!==base&&branch.some(p=>p.id===b.support))branch.push(b);
  const support=sorted.find(b=>b.id===base.support);const center=support?.x??0;const edge=support?1.8:5;const com=branch.reduce((n,b)=>n+b.x,0)/branch.length;
  if(base.support!==-2&&Math.abs(com-center)>edge){const direction=Math.sign(com-center);for(const b of branch){b.stable=0;b.support=-2;b.vx+=direction*1.2;b.spin+=direction*.65;}}
 }
 a.blocks=a.blocks.filter(b=>b.y>-16&&Math.abs(b.x)<35).slice(-60);
 const valid=new Map<number,number>();let levels=0;
 for(const b of [...a.blocks].sort((a,b)=>a.y-b.y)){if(b.stable>=.7&&Math.abs(b.angle)<.12&&Math.abs(b.vx)<.2&&(b.support===-1||valid.has(b.support))){const level=b.support===-1?1:valid.get(b.support)!+1;valid.set(b.id,level);levels=Math.max(levels,level);}}
 a.score=levels*10;
}
export function ranking<T extends {score:number,order:number}>(players:T[]){return [...players].sort((a,b)=>b.score-a.score||a.order-b.order);}
