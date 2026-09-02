# Architecture — AX-022

## Implemented logical path

```text
Smart glasses / phone camera
        |
        v
Vendor device surface
Meta DAT today / Halo adapter / future Mentra-Rokid adapters
        |
        v
Mobile companion (iOS or Android)
Gemini Live voice + vision session retained from VisionClaw
        |
        | execute tool call
        v
ToolBridge
  |-- AX-022 Gateway (preferred when configured)
  `-- OpenClaw (legacy/fallback)
        |
        v
AX-022 Gateway :8790
wearable session + identity + tenant + policy + signed receipts
        |
        v
AgentRouter
        |
        +--> MACS tenant -> Agent MAXX adapter -> MAXX control plane
        |
        `--> future personal tenant -> Jarvis -> Hermes/fleet
        |
        v
Tenant agent / business systems / tools
        |
        v
response -> Gemini toolResponse -> private audio / UI / future HUD
```

## Core packages

### `packages/ax022-core`
Owns portable contracts, not business-specific intelligence:
- `DeviceAdapter`
- device capability registry
- wearable identity
- participant-scoped media routing
- logical model capability routing
- ICM policy engine
- tenant agent routing
- tool fabric/providers
- session tokens
- signed receipts

### `services/ax022-gateway`
Owns the server-side wearable trust boundary:
- device/session enrollment
- tenant resolution
- agent routing
- credentials kept server-side
- capability/status API
- intent and mission API
- evidence receipts

## Agent routing

AX-022 must not create another permanent brain.

### MACS / Agent MAXX
```text
Stacy wearable -> AX-022 -> tenant=macs -> Agent MAXX -> isolated MAXX Hermes/Pups/control plane
```
MAXX remains isolated from the owner's personal Hermes and personal memory.

### Personal/fleet target
```text
Owner wearable -> AX-022 -> Jarvis presence -> Pi or Hermes -> Pauli's Place / STARNET / Orca / tools
```
Jarvis is the intended voice/phone/glasses presence layer. Hermes remains business orchestrator.

## Upstream architecture absorbed

- NVIDIA XR AI: participant-scoped one-hub/many-clients media routing and logical model services.
- CAMEL HALO: separate glasses adapter and agent adapter boundary; unsafe permission bypass/public-bind defaults rejected.
- Brilliant SDK: upstream `brilliant-ble` transport used behind `BrilliantHaloAdapter`.
- MentraOS: normalized hardware capability model.
- VisionClaw: existing live voice/vision, Meta DAT, phone fallback, tool-call, and WebRTC paths retained.
- ACI: dynamic tool discovery/execution provider contract.
- OpenClaw: optional tool provider/fallback with an additional AX-022 hard deny list.
- GlassKit: wearable-development/evaluation patterns moved into an ICM skill.
- JSOS: phone-core/HUD concepts studied only; AGPL implementation code is not copied.

## Invariants

1. Hardware vendors are replaceable.
2. Model providers are replaceable.
3. Agent/business authority stays server-side.
4. Every wearable request carries tenant/user/device/agent identity.
5. Participant return traffic is isolated to the originating wearable.
6. L3/L4 authority cannot be granted by a machine credential or voice ambiguity.
7. Existing Meta voice/vision must remain usable while new adapters are introduced.
8. Runtime evidence beats architecture prose.
