# MEA v0.7 deployment

## Free static hosting
MEA is a static PWA. It can be hosted on any HTTPS static host that supports
HTML/CSS/JS files. The app itself contains no subscription, credit counter,
or required paid API.

## iPhone installation
1. Open the HTTPS address in Safari.
2. Tap Share.
3. Choose Add to Home Screen.
4. Open MEA from the Home Screen.

## Important for AI
v0.7 contains the model registry and local-model loading interface, but it
does not bundle a neural inference runtime or model weights. Selecting an
ONNX/BIN file therefore does not magically execute it.

For the next neural stage, a compatible runtime and properly licensed model
weights must be added. The app's UI does not need to be rewritten.

## Privacy
In local fallback mode, selected images are processed in the browser.
No automatic upload endpoint is present in this build.
