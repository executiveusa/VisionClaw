# Architecture — AX-022

## Target logical path

```text
Smart glasses
  -> device adapter
  -> phone/edge companion
  -> Jarvis wearable presence gateway
  -> fleet routing / authenticated control plane
  -> Pi or Hermes depending on scope
  -> Pauli's Place / STARNET / MAXX / Orca / tools
  -> result
  -> audio and optional HUD response
```

## Current live implementation

VisionClaw currently centers on Meta Ray-Ban/phone capture, a mobile companion, Gemini Live WebSocket sessions, audio playback, optional OpenClaw tool routing, and WebRTC POV streaming. The iOS and Android implementations live under `samples/`.

## Required abstraction boundaries

1. `DeviceAdapter` — camera, mic, audio output, display/HUD, buttons/taps, connection state.
2. `RealtimeSession` — duplex audio + vision context + interruption lifecycle.
3. `IntentGateway` — sends authenticated intent to Jarvis/fleet services; never embeds fleet secrets.
4. `ApprovalSurface` — renders/voices risk, proof, confirm/cancel.
5. `TranslationService` — language detection/translation independent of device vendor.
6. `EvidenceReceipt` — records what was requested, what executed, proof, risk tier, and result.

## Rule

Adapters may differ by hardware capability. The orchestration contract must not.
