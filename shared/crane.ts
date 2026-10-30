export type Block={id:number,x:number,y:number,vx:number,vy:number,angle:number,spin:number,stable:number,support:number};
export type Arena={x:number,held:boolean,blocks:Block[],score:number,next:number};
export const arena=():Arena=>({x:-8,held:false,blocks:[],score:0,next:0});
export function action(a:Arena){if(!a.held){if(Math.abs(a.x+8)<1.8)a.held=true;}else{a.held=false;a.blocks.push({id:a.next++,x:a.x,y:Math.max(8,...a.blocks.map(b=>b.y+4)),vx:0,vy:0,angle:0,spin:0,stable:0,support:-2});}}
// Fixed-step side-view rigid supports. Overhanging centres produce torque and sliding,
// and support chains are revalidated every tick; no airborne bodies contribute height.
export function step(a:Arena,dir:number,dt:number){
 a.x=Math.max(-10,Math.min(10,a.x+dir*6*dt));
 for(const b of a.blocks){
  b.vy-=14*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.angle+=b.spin*dt;
  let top=0,support=-1,center=0,width=5;
  for(const p of a.blocks){if(p===b||p.y>=b.y||p.stable<.25||Math.abs(p.angle)>.12)continue;if(Math.abs(b.x-p.x)<3.8&&p.y+1>top){top=p.y+1;support=p.id;center=p.x;width=Math.max(.75,1.8-p.y*.045);}}
  const bottom=b.y-1;
  if(bottom<=top&&b.vy<=0&&b.y>=top-.8&&Math.abs(b.x)<12){
   const offset=b.x-center;
   if(Math.abs(offset)<=width&&Math.abs(b.angle)<.18){b.y=top+1;b.vy=0;b.vx*=.65;b.spin*=.6;b.angle*=.7;b.support=support;b.stable+=dt;}
   else{b.vx+=Math.sign(offset||1)*5*dt;b.spin+=Math.sign(offset||1)*2*dt;b.stable=0;b.support=-2;}
  }else{b.stable=0;b.support=-2;}
 }
 a.blocks=a.blocks.filter(b=>b.y>-12&&Math.abs(b.x)<24).slice(-60);
 const valid=new Set<number>();let height=0;
 for(const b of [...a.blocks].sort((a,b)=>a.y-b.y)){if(b.stable>=.7&&(b.support===-1||valid.has(b.support))){valid.add(b.id);height=Math.max(height,Math.round((b.y+1)/2)*10);}}
 a.score=height;
}
export function ranking<T extends {score:number,order:number}>(players:T[]){return [...players].sort((a,b)=>b.score-a.score||a.order-b.order);}

