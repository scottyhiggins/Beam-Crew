import type {Block} from './crane.js';
type V={x:number,y:number};
type Body={x:number,y:number,angle:number,vx:number,vy:number,spin:number,w:number,h:number,inv:number,c?:number,s?:number,block?:Block};
const cross=(a:V,b:V)=>a.x*b.y-a.y*b.x;
function vertices(b:Body):V[]{const c=b.c??Math.cos(b.angle),s=b.s??Math.sin(b.angle),wx=b.w*c,wy=b.w*s,hx=-b.h*s,hy=b.h*c;return [{x:b.x-wx-hx,y:b.y-wy-hy},{x:b.x+wx-hx,y:b.y+wy-hy},{x:b.x+wx+hx,y:b.y+wy+hy},{x:b.x-wx+hx,y:b.y-wy+hy}];}
function contact(a:Body,b:Body){
 if(Math.abs(a.x-b.x)>a.w+a.h+b.w+b.h||Math.abs(a.y-b.y)>a.w+a.h+b.w+b.h)return;
 const av=vertices(a),bv=vertices(b);let depth=Infinity,n={x:0,y:0};
 for(const body of [a,b]){const cs=body.c??Math.cos(body.angle),sn=body.s??Math.sin(body.angle);for(const axis of [{x:cs,y:sn},{x:-sn,y:cs}]){
  let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;
  for(let i=0;i<4;i++){const ap=av[i].x*axis.x+av[i].y*axis.y,bp=bv[i].x*axis.x+bv[i].y*axis.y;amin=Math.min(amin,ap);amax=Math.max(amax,ap);bmin=Math.min(bmin,bp);bmax=Math.max(bmax,bp);}
  const overlap=Math.min(amax,bmax)-Math.max(amin,bmin);if(overlap<0)return;
  if(overlap<depth){depth=overlap;const sign=(a.x-b.x)*axis.x+(a.y-b.y)*axis.y>=0?1:-1;n={x:axis.x*sign,y:axis.y*sign};}
 }
 }
 // Clip the intersecting polygons; the two extremes form a contact manifold.
 let polygon=av;
 for(let i=0;i<4&&polygon.length;i++){const p=bv[i],q=bv[(i+1)%4],edge={x:q.x-p.x,y:q.y-p.y};const input=polygon;polygon=[];
  for(let j=0;j<input.length;j++){const u=input[j],v=input[(j+1)%input.length],du=cross(edge,{x:u.x-p.x,y:u.y-p.y}),dv=cross(edge,{x:v.x-p.x,y:v.y-p.y});if(du>=-1e-8)polygon.push(u);if((du>=0)!==(dv>=0)){const f=du/(du-dv);polygon.push({x:u.x+(v.x-u.x)*f,y:u.y+(v.y-u.y)*f});}}
 }
 if(!polygon.length)return;const t={x:-n.y,y:n.x};polygon.sort((p,q)=>(p.x-q.x)*t.x+(p.y-q.y)*t.y);
 const first=polygon[0],last=polygon[polygon.length-1];return {n,depth,points:Math.hypot(first.x-last.x,first.y-last.y)>.05?[first,last]:[first]};
}
// Only quiet yard contacts sleep; any moving-body impact wakes them.
const resting=new WeakMap<Block,number>();
const inertia=.6; // inverse inertia of a unit-mass 4 x 2 rectangle
function resolve(a:Body,b:Body,c:NonNullable<ReturnType<typeof contact>>,position=false){
 const total=a.inv+b.inv,correction=position?Math.max(0,c.depth-.001)*.8/total:0;
 a.x+=c.n.x*correction*a.inv;a.y+=c.n.y*correction*a.inv;b.x-=c.n.x*correction*b.inv;b.y-=c.n.y*correction*b.inv;
 for(const p of c.points){const ra={x:p.x-a.x,y:p.y-a.y},rb={x:p.x-b.x,y:p.y-b.y};
  const velocity=()=>({x:a.vx-a.spin*ra.y-b.vx+b.spin*rb.y,y:a.vy+a.spin*ra.x-b.vy-b.spin*rb.x});
  const impulse=(axis:V,j:number)=>{a.vx+=axis.x*j*a.inv;a.vy+=axis.y*j*a.inv;a.spin+=cross(ra,axis)*j*inertia*a.inv;b.vx-=axis.x*j*b.inv;b.vy-=axis.y*j*b.inv;b.spin-=cross(rb,axis)*j*inertia*b.inv;};
  let rv=velocity();const vn=rv.x*c.n.x+rv.y*c.n.y;if(vn>=0)continue;
  const denom=total+inertia*(cross(ra,c.n)**2*a.inv+cross(rb,c.n)**2*b.inv),j=-vn/denom;impulse(c.n,j);
  const tangent={x:-c.n.y,y:c.n.x};rv=velocity();const jt=-(rv.x*tangent.x+rv.y*tangent.y)/(total+inertia*(cross(ra,tangent)**2*a.inv+cross(rb,tangent)**2*b.inv));impulse(tangent,Math.max(-j*.85,Math.min(j*.85,jt)));
 }
}
/** Bounded 2D rigid rectangles: substeps, oriented contacts, Coulomb friction.
 * No angle interpolation, placement snap, or permanent constraints. */
export function simulateContainers(blocks:Block[],dt:number){
 const bodies:Body[]=blocks.map(block=>{const onYard=Math.abs(block.y-2*Math.abs(Math.sin(block.angle))-Math.abs(Math.cos(block.angle))+2)<.025;
  const quiet=onYard&&Math.hypot(block.vx,block.vy)<.04&&Math.abs(block.spin)<.03;
  const age=quiet?(resting.get(block)??0)+dt:0;resting.set(block,age);return {...block,w:2,h:1,inv:age>.7?0:1,block};});
 const terrain:Body[]=[{x:0,y:-12,angle:0,vx:0,vy:0,spin:0,w:100,h:10,inv:0},{x:0,y:-1,angle:0,vx:0,vy:0,spin:0,w:5,h:1,inv:0}];
 const speed=Math.max(0,...bodies.map(b=>Math.hypot(b.vx,b.vy)+Math.abs(b.spin)*2.24));const count=Math.min(64,Math.max(4,Math.ceil(speed*dt/.12))),h=dt/count;
 const supports=new Map<number,number>();
 for(let sub=0;sub<count;sub++){
  for(const b of bodies){if(!b.inv){b.vx=b.vy=b.spin=0;continue;}b.vy-=14*h;b.vx*=Math.exp(-.06*h);b.spin*=Math.exp(-.12*h);b.x+=b.vx*h;b.y+=b.vy*h;b.angle+=b.spin*h;b.c=Math.cos(b.angle);b.s=Math.sin(b.angle);}
  const contacts:{a:Body,b:Body,c:NonNullable<ReturnType<typeof contact>>}[]=[];
  for(let i=0;i<bodies.length;i++){const a=bodies[i];for(let j=-2;j<i;j++){const b=j<0?terrain[j+2]:bodies[j],c=contact(a,b);if(c&&(a.inv||b.inv)){if(a.block&&b.block&&Math.hypot(a.vx-b.vx,a.vy-b.vy)>.2){for(const body of [a,b]){body.inv=1;resting.set(body.block!,0);}}contacts.push({a,b,c});}}}
  for(const {a,b,c} of contacts)resolve(a,b,c,true);
  // Keep full accuracy for normal stacks while bounding work in dense debris piles.
  const passes=Math.max(12,Math.min(40,Math.floor(600/Math.max(1,contacts.length))));
  for(let pass=0;pass<passes;pass++)for(const entry of contacts){const {a,b}=entry;let c=entry.c;
   if(pass%4===0){const fresh=contact(a,b);if(!fresh)continue;entry.c=c=fresh;}
   const ax=a.x,ay=a.y,bx=b.x,by=b.y;resolve(a,b,c,true);
   c.depth=Math.max(0,c.depth-((a.x-ax-b.x+bx)*c.n.x+(a.y-ay-b.y+by)*c.n.y));
   for(const p of c.points){p.x+=(a.x-ax+b.x-bx)*.5;p.y+=(a.y-ay+b.y-by)*.5;}
  }

 }
 // Reconstruct support from final geometry, independently of solver iteration order.
 for(const a of bodies){for(const b of [...terrain,...bodies]){if(a===b||b.y>=a.y)continue;const saved=a.y;a.y-=.025;const c=contact(a,b);a.y=saved;if(c&&c.n.y>.9){supports.set(a.block!.id,b.block?.id??(b===terrain[1]?-1:-2));break;}}}
 for(const b of bodies){const out=b.block!;Object.assign(out,{x:b.x,y:b.y,vx:b.vx,vy:b.vy,spin:b.spin,angle:b.angle});out.support=supports.get(out.id)??-2;
  const upright=Math.abs(Math.sin(b.angle))<.12;out.stable=out.support!==-2&&upright&&Math.hypot(b.vx,b.vy)<.3&&Math.abs(b.spin)<.15?out.stable+dt:0;
 }
}
