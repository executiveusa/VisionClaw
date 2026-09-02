# Dependencies

## Existing VisionClaw runtime

- Meta Wearables DAT SDK pathways for current glasses support.
- Gemini Live API for current real-time multimodal sessions.
- OpenClaw legacy/fallback gateway for tool execution.
- WebRTC + signaling/TURN components for live POV streaming.
- iOS/Xcode toolchain.
- Android/Gradle toolchain.

## AX-022 core integrations

- `brilliant-ble >=1.1.0` — Brilliant Labs BSD-3-Clause WebBluetooth transport used by `BrilliantHaloAdapter`.
- `@aci-sdk/aci >=0.1.8-beta` — MIT TypeScript SDK used by `AciToolProvider` for dynamic function discovery/execution.
- MentraOS capability contract — MIT architectural/type adaptation; no Mentra runtime vendored.
- NVIDIA XR AI — Apache-2.0 architectural reference for participant-scoped media routing/model abstraction; no NVIDIA runtime vendored.
- CAMEL HALO — Apache-2.0 architectural reference for device/agent adapter separation; no unsafe permission defaults copied.
- GlassKit — MIT wearable development/evaluation patterns adapted into ICM skill guidance.
- OpenClaw — MIT optional provider/fallback; additional AX-022 deny policy applied.
- JSOS — AGPL-3.0 architecture studied only; no implementation code copied into commercial core.

See `packages/ax022-core/THIRD_PARTY_NOTICES.md` before vendoring or redistributing third-party source.

## Internal system dependencies

### Implemented contract
- MACS Agent MAXX control plane `/v1/chat` and `/v1/missions` with constrained `x-maxx-api-key` credential.

### Planned adapters
- Jarvis authenticated wearable/presence endpoint.
- Hermes/fleet routing API.
- Pauli's Place mission/evidence/approval APIs.
- STARNET/Heisenberg status and mission contracts.

## Dependency rule

Provider-specific SDKs belong behind adapters. No hardware SDK, model provider, tool provider, or agent runtime may become the canonical AX-022 business orchestration interface.
