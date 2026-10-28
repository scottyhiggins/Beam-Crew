export function renderRatio(width:number,height:number,dpr:number,mobile:boolean,scale=1){
 const budget=mobile?2_000_000:5_000_000;
 const base=Math.min(Math.max(1,dpr),2,Math.sqrt(budget/(Math.max(1,width)*Math.max(1,height))));
 return Math.max(Math.min(1,base),base*scale);
}

// Two slow 3s windows lower resolution; 30s of headroom raises it.
export class ResolutionGovernor {
 scale=1;private elapsed=0;private frames=0;private slow=0;private fast=0;
 reset(){this.elapsed=this.frames=this.slow=this.fast=0;}
 sample(ms:number,visible:boolean){
  if(!visible||ms>250||ms<=0){this.reset();return false;}
  this.elapsed+=ms;this.frames++;if(this.elapsed<3000)return false;
  const mean=this.elapsed/this.frames;this.elapsed=this.frames=0;
  this.slow=mean>23?this.slow+1:0;this.fast=mean<17.8?this.fast+1:0;
  const before=this.scale;
  if(this.slow>=2){this.scale=Math.max(.65,this.scale-.1);this.slow=this.fast=0;}
  else if(this.fast>=10){this.scale=Math.min(1,this.scale+.05);this.fast=this.slow=0;}
  return this.scale!==before;
 }
}
