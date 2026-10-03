/*
 MEA Quality Engine v1.4
 Dependency-free browser enhancement/upscale helpers.
 These use browser canvas primitives; they are not neural super-resolution.
*/
window.MEAQuality = {
  progressiveUpscale(image, targetW, targetH, onProgress){
    let current=document.createElement("canvas");
    current.width=image.naturalWidth; current.height=image.naturalHeight;
    current.getContext("2d").drawImage(image,0,0);
    let step=0;
    while(current.width<targetW || current.height<targetH){
      const nw=Math.min(targetW,Math.max(current.width+1,Math.round(current.width*1.5)));
      const nh=Math.min(targetH,Math.max(current.height+1,Math.round(current.height*1.5)));
      const next=document.createElement("canvas"); next.width=nw; next.height=nh;
      const g=next.getContext("2d",{alpha:false});
      g.imageSmoothingEnabled=true; g.imageSmoothingQuality="high";
      g.drawImage(current,0,0,nw,nh);
      current=next; step++;
      onProgress?.(Math.min(82,20+step*12));
    }
    return current;
  },

  sharpen(canvas, amount=.22){
    const w=canvas.width,h=canvas.height;
    const c=document.createElement("canvas");c.width=w;c.height=h;
    const g=c.getContext("2d");
    // A subtle unsharp-style effect using a blurred layer and screen/overlay blend.
    g.drawImage(canvas,0,0);
    const blur=document.createElement("canvas");blur.width=w;blur.height=h;
    const b=blur.getContext("2d");
    b.filter="blur(0.65px)";b.drawImage(canvas,0,0);
    g.save();
    g.globalAlpha=Math.max(0,Math.min(.5,amount));
    g.globalCompositeOperation="overlay";
    g.drawImage(canvas,0,0);
    g.globalCompositeOperation="source-over";
    g.restore();
    return c;
  },

  enhance(image,strength,onProgress){
    const c=document.createElement("canvas");c.width=image.naturalWidth;c.height=image.naturalHeight;
    const g=c.getContext("2d",{alpha:false});
    const a=Math.max(0,Math.min(1,strength));
    onProgress?.(20);
    g.filter=`contrast(${1+a*.16}) saturate(${1+a*.10}) brightness(${1+a*.025})`;
    g.drawImage(image,0,0);
    g.filter="none";
    onProgress?.(72);
    const s=this.sharpen(c,.10+a*.22);
    onProgress?.(94);
    return s;
  }
};
