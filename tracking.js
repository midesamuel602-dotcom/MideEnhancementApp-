/*
 MEA Video Tracker v1.2
 Lightweight local template tracking. This is NOT neural optical flow.
 It tracks a user-selected rectangle by searching nearby regions for
 similar surrounding luminance structure.
*/
window.MEATracker = (() => {
  function gray(data,i){ return data[i]*.299+data[i+1]*.587+data[i+2]*.114; }

  function sample(ctx, box, size=24){
    const sx=Math.max(0,Math.floor(box.x)), sy=Math.max(0,Math.floor(box.y));
    const sw=Math.max(2,Math.min(ctx.canvas.width-sx,Math.floor(box.w)));
    const sh=Math.max(2,Math.min(ctx.canvas.height-sy,Math.floor(box.h)));
    const c=ctx.getImageData(sx,sy,sw,sh), out=[];
    const nx=Math.min(size,sw), ny=Math.min(size,sh);
    for(let y=0;y<ny;y++) for(let x=0;x<nx;x++){
      const px=Math.min(sw-1,Math.floor(x*sw/nx));
      const py=Math.min(sh-1,Math.floor(y*sh/ny));
      out.push(gray(c.data,(py*sw+px)*4));
    }
    return {out,nx,ny};
  }

  function score(a,b){
    if(a.out.length!==b.out.length)return Infinity;
    let s=0;
    for(let i=0;i<a.out.length;i++) s+=Math.abs(a.out[i]-b.out[i]);
    return s/a.out.length;
  }

  function track(prevCtx,nextCtx,box,search=80){
    const pw=prevCtx.canvas.width, ph=prevCtx.canvas.height;
    const bw=Math.max(4,Math.min(box.w,pw)), bh=Math.max(4,Math.min(box.h,ph));
    const ref=sample(prevCtx,box,24);
    let best={x:box.x,y:box.y,score:Infinity};
    const step=Math.max(2,Math.round(Math.min(bw,bh)/18));
    const x0=Math.max(0,Math.floor(box.x-search)), x1=Math.min(pw-bw,Math.ceil(box.x+search));
    const y0=Math.max(0,Math.floor(box.y-search)), y1=Math.min(ph-bh,Math.ceil(box.y+search));
    for(let y=y0;y<=y1;y+=step){
      for(let x=x0;x<=x1;x+=step){
        const sc=score(ref,sample(nextCtx,{x,y,w:bw,h:bh},24));
        if(sc<best.score)best={x,y,w:bw,h:bh,score:sc};
      }
    }
    return best;
  }
  return {track};
})();
