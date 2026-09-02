# System Map — VisionClaw / AX-022

One job: help a cold agent answer "where is this behavior implemented and what else moves if I change it?"

The code remains source of truth. This map points; it does not duplicate implementation.

## Live universes

- `samples/CameraAccess/` — iOS app and WebRTC/signaling assets.
- `samples/CameraAccessAndroid/` — Android app.
- root docs/assets — upstream project documentation and media.

## Known live clusters

See `objects/_index.md`.

## Walk rule

1. Identify the behavior in `objects/_index.md`.
2. Open only the owning source files/directories.
3. Read `../effects/CONTEXT.md` before changing a load-bearing boundary.
4. Run the relevant stage pipeline starting with `../stages/01_inspect/CONTEXT.md`.

Do not infer Brilliant Halo support from AX-022 product intent. It is planned until code and proof exist.
