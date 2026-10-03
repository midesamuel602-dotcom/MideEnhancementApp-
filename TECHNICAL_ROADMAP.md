# MEA technical roadmap — v0.6

## Completed in v0.6
- Engine adapter boundary (`ai/engine.js`)
- WebGPU/WebAssembly capability detection
- Stronger multi-pass image-mask fallback
- Before/after comparison slider
- PNG/WebP/JPEG export
- Export quality control
- Honest engine status in UI
- Separate model directory and integration documentation
- No subscriptions, credits, or hidden model/API calls

## Next engine milestone
The UI is now separated from the processing implementation. The next
real quality jump requires licensed neural model weights and an
inference runtime.

Target adapters:
1. Neural image inpainting
2. Neural super-resolution
3. Face/detail restoration
4. Video frame restoration with temporal consistency
5. Watermark/object tracking across video frames
6. High-quality video encoding with audio preservation

Important:
The current build does not claim neural AI is installed. It uses local
browser fallbacks until model weights/runtime are supplied.


## v0.9 completed
- Browser video decode/process loop
- Canvas frame processing
- WebM recording
- Audio-track preservation attempt
- Video save workflow
