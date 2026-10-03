/*
 MEA Image Engine v1.1
 Browser fallback utilities. Neural adapters can replace these functions.
*/
window.MEAImage = {
  featherMask(maskCanvas, radius=3){
    const c=document.createElement("canvas"); c.width=maskCanvas.width;c.height=maskCanvas.height;
    const x=c.getContext("2d"); x.filter=`blur(${radius}px)`; x.drawImage(maskCanvas,0,0); x.filter="none";
    return c;
  },
  maskBounds(maskCanvas){
    const d=maskCanvas.getContext("2d").getImageData(0,0,maskCanvas.width,maskCanvas.height).data;
    let x0=maskCanvas.width,y0=maskCanvas.height,x1=-1,y1=-1;
    for(let y=0;y<maskCanvas.height;y++)for(let x=0;x<maskCanvas.width;x++){
      if(d[(y*maskCanvas.width+x)*4+3]>20){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
    }
    return x1<0?null:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};
  }
};
