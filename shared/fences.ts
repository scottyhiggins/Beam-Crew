export type Point={x:number;z:number};
export type Fence={a:Point;b:Point};
export function nearestPoint(p:Point,a:Point,b:Point):Point{
 const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));
 return {x:a.x+t*dx,z:a.z+t*dz};
}
export function corridorFences(course:Point[],radius:number):Fence[]{
 const pieces:Fence[]=[];
 const inside=(p:Point)=>course.slice(1).some((b,i)=>{const q=nearestPoint(p,course[i],b);return Math.hypot(p.x-q.x,p.z-q.z)<radius-.015;});
 const add=(a:Point,b:Point)=>{
  const count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.2));
  for(let i=0;i<count;i++){const point=(t:number)=>({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});const start=point(i/count),end=point((i+1)/count);if(!inside(point((i+.5)/count)))pieces.push({a:start,b:end});}
 };
 course.slice(1).forEach((b,i)=>{const a=course[i],dx=b.x-a.x,dz=b.z-a.z,n=Math.hypot(dx,dz);for(const side of [-1,1])add({x:a.x+side*dz/n*radius,z:a.z-side*dx/n*radius},{x:b.x+side*dz/n*radius,z:b.z-side*dx/n*radius});});
 // Circular joins/caps close the gaps between adjacent straight runs.
 course.forEach(p=>{for(let i=0;i<64;i++){const q=(t:number)=>({x:p.x+Math.cos(t)*radius,z:p.z+Math.sin(t)*radius});add(q(i*Math.PI/32),q((i+1)*Math.PI/32));}});
 // Merge collinear adjacent pieces to minimize render and collision work.
 return pieces.reduce<Fence[]>((out,f)=>{const last=out[out.length-1];if(last&&Math.hypot(last.b.x-f.a.x,last.b.z-f.a.z)<.001&&Math.abs((last.b.x-last.a.x)*(f.b.z-f.a.z)-(last.b.z-last.a.z)*(f.b.x-f.a.x))<1e-6)last.b=f.b;else out.push(f);return out;},[]);
}
export function fenceContact(p:Point,radius:number,fences:Fence[],inside?:(x:number,z:number)=>boolean):{x:number;z:number}|undefined{
 for(const f of fences){const q=nearestPoint(p,f.a,f.b),dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);if(d<radius){const length=Math.hypot(f.b.x-f.a.x,f.b.z-f.a.z)||1;
 const nx=d>1e-8?dx/d:-(f.b.z-f.a.z)/length,nz=d>1e-8?dz/d:(f.b.x-f.a.x)/length;
 const sign=inside&&!inside(q.x+nx*.05,q.z+nz*.05)?-1:1;
 return {x:nx*sign*(radius-sign*d+.001),z:nz*sign*(radius-sign*d+.001)};}}
}
