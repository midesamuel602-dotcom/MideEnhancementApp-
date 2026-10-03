# MEA v1.2 video tracking

The Video Studio now has two modes:

- **Fixed area:** uses the original marked rectangle for every frame.
- **Track area:** performs local grayscale template matching around the previous
  rectangle and moves the removal region when confidence is acceptable.

This is deliberately a lightweight, dependency-free browser algorithm. It is
not optical flow, neural object tracking, or neural video inpainting.

### Why this matters
A watermark that drifts or moves slightly can remain covered instead of
leaving the fixed mask behind.

### Known limitations
- Large/rapid motion can exceed the search window.
- Similar-looking background regions can confuse the tracker.
- A watermark that changes appearance may not track reliably.
- The built-in remover is still a fallback pixel reconstruction method.

A future neural adapter can replace tracking and inpainting without changing
the surrounding app architecture.
