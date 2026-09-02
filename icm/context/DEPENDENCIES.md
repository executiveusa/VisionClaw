# Dependencies

## Current source dependencies

- Meta Wearables DAT SDK pathways for current glasses support.
- Gemini Live API for current real-time multimodal sessions.
- OpenClaw optional gateway for tool execution.
- WebRTC + signaling/TURN components for live POV streaming.
- iOS/Xcode toolchain.
- Android/Gradle toolchain.

## Planned platform dependencies

- Brilliant Labs Halo SDK/runtime for Halo adapter.
- Jarvis authenticated wearable gateway endpoint.
- Hermes/fleet routing API.
- Pauli's Place mission/evidence/approval APIs.
- STARNET/Heisenberg status and mission contracts.
- MAXX tenant-scoped gateway.

## Dependency rule

A provider-specific SDK belongs behind an adapter. No provider SDK may become the canonical business orchestration interface.
