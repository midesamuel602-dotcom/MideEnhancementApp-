# MEA v1.0 video AI plan

The browser Video Studio now has a real local frame pipeline and a fixed
mask workflow. The next neural layer should not simply process every frame
independently.

Required temporal pipeline:

1. Detect or accept the watermark mask.
2. Track the region between frames.
3. Warp/refine the mask using motion information.
4. Inpaint each frame with a neural image/video model.
5. Use previous-frame information to reduce flicker and texture changes.
6. Encode video and preserve audio where supported.

The `ai/video-engine.js` contract is intentionally small so a neural
implementation can be swapped in later.

Current fallback removal is deliberately limited and should not be described
as AI.
