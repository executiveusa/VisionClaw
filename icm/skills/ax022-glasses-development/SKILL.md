---
name: ax022-glasses-development
description: Use for AI GLASSES AX-022 device, voice, HUD, camera, agent-routing, tool, privacy, and wearable UX work.
---

# AX-022 Glasses Development

## Load first
1. `icm/context/CURRENT_STATE.md`
2. `icm/context/SECURITY.md`
3. `packages/ax022-core/THIRD_PARTY_NOTICES.md`
4. nearest device/app README.

## Rules
- Treat glasses as an I/O surface, not a permanent fleet brain.
- Keep credentials and tenant authority on the phone/gateway/server; never embed full operator credentials on glasses.
- Require explicit wearable identity: wearable, user, tenant, agent, device profile, policy.
- Use capability checks instead of vendor-name conditionals.
- Preserve barge-in/cancel during voice sessions.
- Keep HUD output glanceable; one decision or status cluster at a time.
- Separate continuous frame signaling from expensive frame acquisition/inference.
- L3/L4 actions stop for human approval; builders and agents never self-approve.
- Do not enable always-on recording by default. Recording, retention, and consent are tenant policy.
- Verify vision behavior with repeatable fixtures before field deployment.

## Device extension contract
Implement a `DeviceAdapter`, register a capability profile, add emulator/phone fallback where possible, prove audio/vision/control behavior, then update `CURRENT_STATE.md`.
