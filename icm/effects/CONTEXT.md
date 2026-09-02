# Change-Impact Router

Open this before changing a load-bearing boundary.

| Changing | Inspect first | Expected first-order hits |
|---|---|---|
| Device camera/mic capture | Meta DAT integration + phone fallback | session input, permissions, lifecycle |
| Audio playback | AudioManager + session config | interruption, echo cancellation, response UX |
| Gemini Live transport | Gemini service + session view model | audio, vision, tool calls, transcript state |
| Tool execution | ToolCallRouter + OpenClawBridge | auth, task contract, confirmations, receipts |
| WebRTC | WebRTC client + signaling server | audio device conflicts, NAT/TURN, background lifecycle |
| New glasses vendor | device SDK + `DEVICE_ADAPTER` contract | capture, output, permissions, capability matrix |
| Jarvis gateway | IntentGateway boundary | auth, tenant context, risk tier, receipts |
| Approval UX | risk policy + device output capabilities | L3/L4 gating, display/audio confirmation |

## Does not hit by default

A new device adapter should not require rewriting business agents, Hermes logic, STARNET crew logic, or Pauli's Place canonical mission state. If it does, the abstraction is leaking.
