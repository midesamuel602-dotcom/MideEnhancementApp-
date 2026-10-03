# MEA v1.1 quality notes

## Image
The fallback inpainting path now:
- checks that a mask exists
- computes mask bounds
- limits expensive work to the marked region
- uses additional reconstruction passes
- keeps the original image dimensions
- remains explicitly a non-neural fallback

## Video
The processing loop now guards against stalled playback so a problematic
video cannot leave the app in an endless processing state.

## Neural model path
`ai/runtime-config.js` is the configuration boundary. It deliberately does
not download or activate third-party model runtimes automatically.

For a real AI release, a compatible runtime and properly licensed weights
must be verified and bundled/served by the deployment.
