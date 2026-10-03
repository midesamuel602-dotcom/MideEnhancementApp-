/*
 MEA Mask Tools v1.3
 Dependency-free canvas mask utilities.
*/
window.MEAMaskTools = {
  normalize(box,w,h){
    const x=Math.max(0,Math.min(w-1,Math.round(box.x)));
    const y=Math.max(0,Math.min(h-1,Math.round(box.y)));
    const x2=Math.max(x+1,Math.min(w,Math.round(box.x+box.w)));
    const y2=Math.max(y+1,Math.min(h,Math.round(box.y+box.h)));
    return {x,y,w:x2-x,h:y2-y};
  },
  expand(box,pixels,w,h){
    return this.normalize({x:box.x-pixels,y:box.y-pixels,w:box.w+pixels*2,h:box.h+pixels*2},w,h);
  },
  feather(ctx,box,radius){
    const c=ctx.canvas, tmp=document.createElement("canvas");
    tmp.width=c.width;tmp.height=c.height;
    const t=tmp.getContext("2d");
    t.filter=`blur(${Math.max(0,radius)}px)`;
    t.drawImage(c,0,0);
    ctx.clearRect(0,0,c.width,c.height);
    ctx.drawImage(tmp,0,0);
  }
};
