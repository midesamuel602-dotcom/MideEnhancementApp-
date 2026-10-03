/*
 MEA Engine Registry v0.8
 Stable interface for browser fallback and future neural adapters.
*/
window.MEAEngine = (() => {
  const state={adapter:null,model:null,worker:null,pending:new Map(),seq:0};
  const adapters=[];

  function caps(){
    return {
      webgpu:!!navigator.gpu,
      wasm:typeof WebAssembly!=="undefined",
      workers:typeof Worker!=="undefined",
      offscreenCanvas:typeof OffscreenCanvas!=="undefined",
      sharedArrayBuffer:typeof SharedArrayBuffer!=="undefined"
    };
  }
  function register(adapter){if(adapter&&adapter.name)adapters.push(adapter)}
  function list(){return adapters.map(a=>a.name)}

  function ensureWorker(){
    if(state.worker || !caps().workers)return;
    state.worker=new Worker("./ai/processor-worker.js");
    state.worker.onmessage=e=>{
      const {id}=e.data||{}, p=state.pending.get(id);
      if(!p)return;
      state.pending.delete(id);
      e.data.ok?p.resolve(e.data.result):p.reject(new Error(e.data.error||"Worker error"));
    };
  }
  function workerRun(task,payload){
    ensureWorker();
    if(!state.worker)return Promise.reject(new Error("Workers unavailable"));
    const id=++state.seq;
    return new Promise((resolve,reject)=>{
      state.pending.set(id,{resolve,reject});
      state.worker.postMessage({id,task,payload});
    });
  }

  async function init(){
    ensureWorker();
    return {...caps(),mode:state.adapter?.name||"browser-fallback",modelLoaded:!!state.model,adapters:list()};
  }

  async function loadLocalModel(file){
    if(!file)return {ok:false,reason:"No model selected"};
    const lower=file.name.toLowerCase();
    const supported=lower.endsWith(".onnx")||lower.endsWith(".ort")||lower.endsWith(".bin");
    if(!supported)return {ok:false,reason:"Unsupported model file type"};
    state.model={name:file.name,size:file.size,type:file.type||"unknown"};
    return {ok:false,reason:"Model metadata accepted; neural runtime is not bundled in v0.8"};
  }

  async function run(task,payload){
    if(state.adapter?.run)return state.adapter.run(task,payload);
    return workerRun(task,payload);
  }

  return {init,caps,register,list,loadLocalModel,run};
})();
