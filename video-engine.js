/*
 MEA Video AI adapter contract v1.2.
 The built-in tracker is algorithmic. A future neural adapter may implement
 temporal inpainting/restoration here without changing the UI contract.
*/
window.MEAVideoAI = {
  capabilities(){
    return {tracking:"local-template",temporalInpainting:false,neuralRestoration:false,status:"fallback"};
  },
  async processFrame(frame,mask,state){
    return {ok:false,reason:"No neural video adapter installed",state};
  }
};
