export function presentationFor(width:number,height:number,touch:boolean){
 const compact=touch&&width>height*1.35&&height<=540;
 return {compact,fov:50,cameraY:compact?12.8:15,cameraZ:compact?15.3:18,lookAhead:compact?2.7:0,labelScale:compact?.7:1};
}
