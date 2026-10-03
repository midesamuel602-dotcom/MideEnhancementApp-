# Model integration contract

MEA v0.8 deliberately separates model weights from application code.

Before adding any model:
1. Confirm the model license permits the intended use and redistribution.
2. Record its SHA-256 checksum.
3. Document its input/output tensor format.
4. Identify the browser runtime required.
5. Test memory use on an iPhone-class device.
6. Add a fallback when WebGPU/model execution is unavailable.

Recommended future adapters:
- ONNX Runtime Web + WebGPU
- ONNX Runtime Web + WASM fallback

The app should never claim "AI" merely because a model file was selected.
The adapter must successfully initialize and execute inference.
