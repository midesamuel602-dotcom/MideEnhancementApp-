# MEA v0.9 video engine

## What is real in this build
The Video Studio now:
- accepts a local video
- decodes frames in the browser
- processes frames through a canvas
- optionally applies a lightweight local contrast enhancement
- records processed frames to WebM
- attempts to carry the original audio track
- provides a save link for the resulting video

## What it is not
This is not neural video inpainting or neural super-resolution.
The actual AI video milestone still requires a compatible model/runtime,
plus temporal tracking so a watermark can be followed across frames.

## Browser differences
Audio preservation and MediaRecorder codec support vary by browser.
WebM is the current browser-oriented output format.
