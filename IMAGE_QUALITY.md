# MEA v1.4 image quality

The image enhancer and upscale tools now use a dedicated quality engine.

### Enhance
Uses controlled browser-side tone/contrast/saturation adjustment followed by
a subtle sharpening stage.

### Upscale
Uses progressive 1.5× browser resampling until the requested size is reached,
then applies a conservative sharpening pass.

### Important
These are high-quality browser fallbacks, not neural super-resolution.
True AI upscaling requires compatible neural model weights and an inference
runtime. The existing neural adapter boundary remains available for that
future integration.
