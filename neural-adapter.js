/*
 MEA Neural Adapter Contract v1.3
 Implementations may be supplied locally by a deployment.
 No model is bundled here, and no network request is made automatically.
*/
window.MEANeuralAdapter = {
  name:"none",
  version:"0",
  capabilities:{
    imageInpaint:false,
    imageSuperResolution:false,
    videoTracking:false,
    videoTemporalInpaint:false
  },
  async initialize(){ return {ok:false,reason:"No neural adapter installed"}; },
  async imageInpaint(){ return {ok:false,reason:"No neural adapter installed"}; },
  async superResolve(){ return {ok:false,reason:"No neural adapter installed"}; },
  async videoFrame(){ return {ok:false,reason:"No neural adapter installed"}; }
};
