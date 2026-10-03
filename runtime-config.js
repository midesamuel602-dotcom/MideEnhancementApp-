/*
 Optional runtime configuration.
 No external runtime is downloaded automatically.
 A deployment can point this at a locally hosted, properly licensed
 inference runtime bundle in a future build.
*/
window.MEARuntimeConfig={
  neural:{
    enabled:false,
    runtime:"none",
    modelManifest:"./models/MODEL_MANIFEST.example.json"
  },
  privacy:{
    uploadByDefault:false,
    localFirst:true
  }
};
