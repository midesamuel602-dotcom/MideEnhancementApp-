# Developer notes — v0.7

### Engine boundary
`ai/engine.js` exposes:
- `MEAEngine.init()`
- `MEAEngine.caps()`
- `MEAEngine.register(adapter)`
- `MEAEngine.loadLocalModel(file)`
- `MEAEngine.run(task,payload)`

### Intended tasks
- `inpaint`
- `superres`
- `enhance`
- `video_inpaint`
- `video_restore`

### Design goal
A future adapter can use ONNX Runtime Web, WebGPU, WebAssembly, or another
browser-compatible runtime without coupling the UI to one vendor.

### Honest status
The browser fallback remains the default. Do not label it "AI" until a
neural adapter is actually executing model inference.
