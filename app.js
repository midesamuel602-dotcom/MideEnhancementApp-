const $=s=>document.querySelector(s);
let mode="remove", file=null, image=null, resultCanvas=null, scale=2;
const originalImg=$("#originalImg"), resultImg=$("#resultImg"), mask=$("#maskCanvas"), compare=$("#compare");
const ctx=mask.getContext("2d");
let drawing=false;

function setMode(m){
  mode=m;
  document.querySelectorAll(".tool").forEach(x=>x.classList.toggle("active",x.dataset.mode===m));
  $("#drawHelp").classList.toggle("hidden",m!=="remove");
  $(".removePanel").classList.toggle("hidden",m!=="remove");
  $("#enhancePanel").classList.toggle("hidden",m!=="enhance");
  $("#upscalePanel").classList.toggle("hidden",m!=="upscale");
  $("#videoPanel").classList.toggle("hidden",m!=="video");
  mask.style.pointerEvents=m==="remove"?"auto":"none";
}
document.querySelectorAll(".tool").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));

$("#fileInput").onchange=e=>{
  const f=e.target.files[0]; if(!f)return;
  file=f; $("#workspace").classList.remove("hidden"); $("#fileName").textContent=f.name;
  $("#fileMeta").textContent=`${(f.size/1024/1024).toFixed(2)} MB • ${f.type||"media"}`;
  $("#exportBox").classList.add("hidden"); $("#compareControl").classList.add("hidden");
  if(f.type.startsWith("image/")) loadImage(f); else {
    originalImg.src=""; resultImg.src="";
    $("#drawHelp").textContent="Video selected. Open Video Studio to preview and process it.";
    setupVideo(f);
    setMode("video");
  }
};

function loadImage(f){
  const url=URL.createObjectURL(f);
  image=new Image();
  image.onload=()=>{
    originalImg.src=url; resultImg.src=url;
    mask.width=image.naturalWidth; mask.height=image.naturalHeight; ctx.clearRect(0,0,mask.width,mask.height);
    $("#drawHelp").textContent="Paint over the unwanted area. The fallback removes marked regions; AI model adapters can replace it later.";
    setMode(mode);
  };
  image.src=url;
}

function pointerPos(e){
  const r=mask.getBoundingClientRect();
  return {x:(e.clientX-r.left)*mask.width/r.width,y:(e.clientY-r.top)*mask.height/r.height};
}
function draw(e){
  if(!drawing||!image)return;
  const p=pointerPos(e), s=+$("#brushSize").value;
  ctx.fillStyle="rgba(255,255,255,.85)"; ctx.beginPath(); ctx.arc(p.x,p.y,s/2,0,Math.PI*2); ctx.fill();
}
mask.onpointerdown=e=>{if(mode!=="remove")return; drawing=true; mask.setPointerCapture(e.pointerId); draw(e)};
mask.onpointermove=draw; mask.onpointerup=()=>drawing=false; mask.onpointercancel=()=>drawing=false;
$("#brushSize").oninput=e=>$("#brushVal").textContent=e.target.value+"px";
$("#eraseMask").onclick=()=>ctx.clearRect(0,0,mask.width,mask.height);
$("#clearBtn").onclick=()=>location.reload();

function progress(done,text){
  $("#progressWrap").classList.remove("hidden"); $("#progressBar").style.width=done+"%"; $("#progressPct").textContent=Math.round(done)+"%"; $("#progressText").textContent=text;
}
function finish(canvas){
  resultCanvas=canvas; resultImg.src=canvas.toDataURL("image/png");
  $("#progressWrap").classList.add("hidden"); $("#exportBox").classList.remove("hidden"); $("#compareControl").classList.remove("hidden");
  updateCompare(); updateDownload();
  $("#resultMeta").textContent=`${canvas.width} × ${canvas.height}px`;
}
function baseCanvas(){
  const c=document.createElement("canvas"); c.width=image.naturalWidth;c.height=image.naturalHeight;
  c.getContext("2d").drawImage(image,0,0); return c;
}

/* Lightweight multi-pass fallback: edge-aware-ish neighborhood diffusion.
   This is deliberately labeled fallback, not neural inpainting. */
function fallbackInpaint(){
  const src=baseCanvas(), sctx=src.getContext("2d"), w=src.width,h=src.height;
  const mctx=mask.getContext("2d"), md=mctx.getImageData(0,0,w,h).data, pix=sctx.getImageData(0,0,w,h), d=pix.data;
  const marked=new Uint8Array(w*h);
  for(let i=0;i<w*h;i++) marked[i]=md[i*4+3]>30?1:0;
  const bounds=window.MEAImage?.maskBounds(mask);
  if(!bounds){ $("#resultMeta").textContent="Paint an area first."; return; }
  progress(12,"Preparing mask…");
  const dil=new Uint8Array(marked);
  const radius=Math.max(1,Math.round(Math.min(w,h)/850));
  for(let y=Math.max(0,bounds.y-radius);y<Math.min(h,bounds.y+bounds.h+radius);y++)
    for(let x=Math.max(0,bounds.x-radius);x<Math.min(w,bounds.x+bounds.w+radius);x++)
      if(marked[y*w+x])
        for(let yy=Math.max(0,y-radius);yy<=Math.min(h-1,y+radius);yy++)
          for(let xx=Math.max(0,x-radius);xx<=Math.min(w-1,x+radius);xx++) dil[yy*w+xx]=1;

  // Several directional diffusion passes. This is intentionally a fallback,
  // not a neural inpainting model.
  for(let pass=0;pass<24;pass++){
    const old=new Uint8ClampedArray(d);
    for(let y=Math.max(1,bounds.y-2);y<Math.min(h-1,bounds.y+bounds.h+2);y++){
      for(let x=Math.max(1,bounds.x-2);x<Math.min(w-1,bounds.x+bounds.w+2);x++){
        const idx=y*w+x;if(!dil[idx])continue;
        let rr=0,gg=0,bb=0,n=0;
        const nb=[idx-1,idx+1,idx-w,idx+w,idx-w-1,idx-w+1,idx+w-1,idx+w+1];
        for(const q of nb)if(!dil[q]){rr+=old[q*4];gg+=old[q*4+1];bb+=old[q*4+2];n++}
        if(n){d[idx*4]=rr/n;d[idx*4+1]=gg/n;d[idx*4+2]=bb/n;d[idx*4+3]=255}
      }
    }
    if(pass%4===0)progress(30+pass*2.1,"Reconstructing pixels…");
  }
  progress(88,"Finalizing result…");
  const out=document.createElement("canvas");out.width=w;out.height=h;out.getContext("2d").putImageData(pix,0,0);
  progress(100,"Complete"); finish(out);
}
$("#processBtn").onclick=()=>{if(!image)return; fallbackInpaint()};

$("#enhanceStrength").oninput=e=>$("#enhanceVal").textContent=e.target.value+"%";
$("#enhanceBtn").onclick=async()=>{
  if(!image)return;
  progress(8,"Preparing image…");
  setTimeout(()=>{
    try{
      const c=window.MEAQuality.enhance(image,+$("#enhanceStrength").value/100,p=>progress(p,"Enhancing detail and tone…"));
      progress(100,"Complete"); finish(c);
    }catch(err){
      progress(100,"Enhancement failed");
      $("#resultMeta").textContent="The image is too large for this browser operation.";
    }
  },30);
};
document.querySelectorAll(".scaleBtns button").forEach(b=>b.onclick=()=>{scale=+b.dataset.scale;document.querySelectorAll(".scaleBtns button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
$("#upscaleBtn").onclick=async()=>{
  if(!image)return;
  const targetW=Math.round(image.naturalWidth*scale), targetH=Math.round(image.naturalHeight*scale);
  progress(8,"Preparing upscale…");
  setTimeout(()=>{
    try{
      const c=window.MEAQuality.progressiveUpscale(image,targetW,targetH,p=>progress(p,"Progressive upscale…"));
      const s=window.MEAQuality.sharpen(c,.16);
      progress(100,"Complete"); finish(s);
    }catch(err){
      progress(100,"Upscale failed");
      $("#resultMeta").textContent="The image is too large for this browser operation.";
    }
  },30);
};

$("#compareSlider").oninput=e=>updateCompare();
function updateCompare(){
  const v=+$("#compareSlider").value; $(".preview.result").style.clipPath=`inset(0 ${100-v}% 0 0)`; $("#splitLine").style.left=v+"%";
}
$("#formatSelect").onchange=updateDownload; $("#quality").oninput=updateDownload;
function updateDownload(){
  if(!resultCanvas)return;
  const type=$("#formatSelect").value,q=+$("#quality").value/100;
  const ext=type==="image/png"?"png":type==="image/webp"?"webp":"jpg";
  $("#saveBtn").href=resultCanvas.toDataURL(type,q); $("#saveBtn").download=`MEA-${mode}-result.${ext}`;
}


let videoFile=null, videoUrl=null, videoRecorder=null, videoChunks=[], videoRunning=false;
let videoMask={x:0,y:0,w:0,h:0,active:false};

function setupVideo(f){
  videoFile=f;
  if(videoUrl)URL.revokeObjectURL(videoUrl);
  videoUrl=URL.createObjectURL(f);
  const v=$("#videoPreview"); v.src=videoUrl; v.style.display="block";
  const vm=$("#videoMaskCanvas"); vm.width=640; vm.height=360; $("#videoMaskCanvas").getContext("2d").clearRect(0,0,640,360);
  $("#videoMaskBox").style.display="block";
  $("#videoSave").classList.add("hidden");
  $("#videoStatus").textContent="Video loaded";
}

$("#videoEnhance").oninput=e=>$("#videoEnhanceVal").textContent=e.target.value+"%";


function resizeVideoMaskCanvas(){
  const v=$("#videoPreview"), c=$("#videoMaskCanvas"), box=$("#videoMaskBox");
  if(!v.videoWidth)return;
  c.width=v.videoWidth;c.height=v.videoHeight;
  box.style.display="block";
}
$("#videoPreview").addEventListener("loadedmetadata",resizeVideoMaskCanvas);
let vmDown=false, vmStart=null;
$("#videoMaskCanvas").addEventListener("pointerdown",e=>{
  const c=e.currentTarget,r=c.getBoundingClientRect();
  vmStart={x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height};
  vmDown=true;c.setPointerCapture(e.pointerId);
});
$("#videoMaskCanvas").addEventListener("pointermove",e=>{
  if(!vmDown||!vmStart)return;
  const c=e.currentTarget,r=c.getBoundingClientRect();
  const x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;
  videoMask={x:Math.min(vmStart.x,x),y:Math.min(vmStart.y,y),w:Math.abs(x-vmStart.x),h:Math.abs(y-vmStart.y),active:true};
  const rr=$("#videoMaskRect"); rr.style.display="block";
  rr.style.left=(videoMask.x/c.width*100)+"%";rr.style.top=(videoMask.y/c.height*100)+"%";
  rr.style.width=(videoMask.w/c.width*100)+"%";rr.style.height=(videoMask.h/c.height*100)+"%";
});
$("#videoMaskCanvas").addEventListener("pointerup",()=>vmDown=false);

function fallbackVideoFill(g,w,h){
  if(!videoMask.active||videoMask.w<2||videoMask.h<2)return;
  const x=Math.max(0,Math.floor(videoMask.x)),y=Math.max(0,Math.floor(videoMask.y));
  const rw=Math.min(w-x,Math.floor(videoMask.w)),rh=Math.min(h-y,Math.floor(videoMask.h));
  if(rw<2||rh<2)return;
  // Fast local fallback: extend pixels from the closest unmarked border.
  const left=g.getImageData(Math.max(0,x-2),y,Math.min(2,w-x),rh);
  const right=g.getImageData(Math.max(0,x+rw-2),y,Math.min(2,w-x-rw+2),rh);
  if(left.width>0)g.putImageData(left,x,y);
  if(right.width>0 && x+rw< w)g.putImageData(right,Math.max(x,x+rw-right.width),y);
}

async function processVideo(){
  if(!videoFile){ $("#videoStatus").textContent="Choose a video first."; return; }
  videoRunning=true; videoTrackState=null;
  if($("#processVideoBtn")) $("#processVideoBtn").disabled=true;
  const v=document.createElement("video"); v.src=URL.createObjectURL(videoFile);
  v.muted=true; v.playsInline=true; await v.play().catch(()=>{});
  const c=document.createElement("canvas"); c.width=v.videoWidth; c.height=v.videoHeight;
  const ctx=c.getContext("2d",{willReadFrequently:true});
  const stream=c.captureStream(30);
  try{
    const original=document.createElement("video");
    original.src=v.src; original.muted=false; original.playsInline=true;
    await original.play().catch(()=>{});
    const os=original.captureStream();
    os.getAudioTracks().forEach(t=>stream.addTrack(t));
  }catch(e){}
  const rec=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp9,opus"});
  const chunks=[]; rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  rec.start(250);
  const duration=v.duration;
  let lastTime=-1, idle=0, prevCanvas=null;
  const mode=$("#videoTrackingMode")?.value||"fixed";
  const baseBox=window.videoMaskRect || {x:0,y:0,w:0,h:0};
  if(!baseBox.w||!baseBox.h){ videoRunning=false; $("#videoStatus").textContent="Mark an area on the video first."; v.pause(); return; }

  while(videoRunning && !v.ended){
    if(Math.abs(v.currentTime-lastTime)<0.0001){ idle++; if(idle>120)break; await new Promise(r=>setTimeout(r,16)); continue; }
    idle=0; lastTime=v.currentTime;
    ctx.drawImage(v,0,0,c.width,c.height);

    let box={...baseBox};
    if(mode==="track" && prevCanvas){
      const pctx=prevCanvas.getContext("2d",{willReadFrequently:true});
      const tracked=window.MEATracker.track(pctx,ctx,videoTrackState?.box||baseBox,Math.max(30,Math.round(Math.min(c.width,c.height)*.08)));
      if(tracked.score<42){
        box=tracked;
        videoTrackState={box,score:tracked.score};
        if($("#videoTrackingStatus")) $("#videoTrackingStatus").textContent=`Tracking: ${(100-Math.min(100,tracked.score*2)).toFixed(0)}% confidence`;
      }else{
        videoTrackState={box:videoTrackState?.box||baseBox,score:tracked.score};
        if($("#videoTrackingStatus")) $("#videoTrackingStatus").textContent="Tracking: low confidence — holding position";
      }
    }else{
      videoTrackState={box,score:0};
    }

    if($("#videoTool")?.value==="remove") fallbackVideoFill(ctx,box);
    else enhanceVideoFrame(ctx,Math.max(0,Math.min(100,Number($("#videoEnhance")?.value||20))));

    if(prevCanvas) prevCanvas.width=0;
    prevCanvas=document.createElement("canvas"); prevCanvas.width=c.width; prevCanvas.height=c.height;
    prevCanvas.getContext("2d").drawImage(c,0,0);

    const pct=Math.min(99,Math.round((v.currentTime/duration)*100));
    if($("#videoProgress")) $("#videoProgress").style.width=pct+"%";
    if($("#videoStatus")) $("#videoStatus").textContent=`Processing ${pct}%`;
    await new Promise(r=>setTimeout(r,0));
    v.currentTime=Math.min(duration,v.currentTime+1/30);
    await new Promise(r=>setTimeout(r,0));
  }
  rec.stop();
  await new Promise(r=>rec.onstop=r);
  videoRunning=false;
  if($("#processVideoBtn")) $("#processVideoBtn").disabled=false;
  if($("#videoProgress")) $("#videoProgress").style.width="100%";
  if($("#videoStatus")) $("#videoStatus").textContent=chunks.length?"Complete":"No frames processed";
  videoOutput=new Blob(chunks,{type:"video/webm"});
  if(videoOutput) $("#saveVideoBtn").disabled=false;
  URL.revokeObjectURL(v.src);
}
function resetVideoWorkspace(){
  videoRunning=false;
  videoTrackState=null;
  if(window.videoPreviewURL){ URL.revokeObjectURL(window.videoPreviewURL); window.videoPreviewURL=null; }
  if($("#videoStatus")) $("#videoStatus").textContent="Ready";
  if($("#videoProgress")) $("#videoProgress").style.width="0%";
}
