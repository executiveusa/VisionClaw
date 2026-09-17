# AX-022 gesture capability (holo-gestures input layer)

One shared input layer for every camera feed in the fleet: Meta Ray-Ban glasses
through the VisionClaw pipeline, a phone camera, or a laptop webcam. Hand
landmarks go in, semantic gesture events come out — pinch (grab), tap (select),
drag, flick (throw), two-hand stretch (zoom), peace (reset), point, fist,
open palm.

## Source and license

The landmark→gesture rules are ported from
[zubair-trabzada/holo-gestures](https://github.com/zubair-trabzada/holo-gestures)
(MIT License, (c) 2026 Zubair Trabzada / AI Workshop Studio LLC) at commit
`55626ff`. Only the gesture layer is ported. The paywalled "Jarvis brain" and
the notes/3D app shell are intentionally excluded. Hand *landmark extraction*
stays with Google MediaPipe (Apache-2.0) on the device; this engine consumes
the landmarks.

## Layers

| Layer | File | Runs where |
|---|---|---|
| Gesture engine (pure, dependency-free) | `gesture-engine.js` | Node + browser |
| AX-022 capability adapter (hub-wired) | `gesture-capability.js` | gateway / agent host |
| HTTP surface for fleet agents | `services/ax022-gateway` `POST /v1/gestures` | gateway |

## How fleet agents call it

- **Hermes (primary orchestrator)** and any agent it routes to: call
  `POST /v1/gestures` on the AX-022 gateway with a session bearer token and a
  batch of frames (`{ frames: [{ ts, hands }] }`). Response: classified
  `events` plus a signed receipt. The Hermes-side client lives in
  `executiveusa/pauli-hermes-agent` under `skills/holo-gestures/`.
- **Max agent portal** (`executiveusa/macs-agent-portal`) and **Pi agent**
  (`executiveusa/pauli-pi-agent`): same HTTP contract; each repo carries the
  client and a vendored copy of the engine under its skills directory for
  offline classification. Vendored copies carry a provenance header — edit the
  canonical engine here, then re-vendor.
- **Glasses companion apps**: import `gesture-engine.js` directly (it is a
  plain ES module with no Node APIs) and feed it MediaPipe landmarks from the
  DAT camera stream, next to the existing Gemini Live video path.

## Gesture → action safety

Classification is L0 (read-tier). A gesture that *does* something (send, buy,
publish, delete) must still pass the ICM policy engine at the consuming agent.
