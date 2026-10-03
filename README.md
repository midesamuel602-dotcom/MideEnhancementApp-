# MEA model directory

v0.6 deliberately does **not** bundle large neural-network weights.

The `ai/engine.js` adapter is the integration point for future local
ONNX/WebGPU/WebAssembly models for:

- neural image inpainting
- super-resolution
- face/detail restoration
- video frame restoration
- watermark/object tracking

Keeping model weights separate prevents the PWA itself from becoming
massive and allows a future build to use freely licensed models without
introducing subscriptions or usage credits.

Do not label the current fallback as AI: it is a browser algorithm.
