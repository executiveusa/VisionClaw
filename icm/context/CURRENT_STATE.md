# Current State

Baseline before AX-022 work: repository `main` at commit `1d6ca07768f7ea7428c099289cf1f98ca8ab5266`.

## VERIFIED IN THIS AX-022 SLICE

### Source baseline
- Repository contains iOS and Android smart-glasses companion implementations.
- Meta Ray-Ban/phone camera pathways exist.
- Gemini Live real-time voice/vision pathway exists in source.
- OpenClaw tool-routing integration exists in source.
- WebRTC live POV streaming implementation exists in source.

### AX-022 core
- `packages/ax022-core` exists as a vendor-neutral package boundary.
- Device capability catalog covers Brilliant Halo, current Meta DAT path, Mentra Live, and Rokid profiles.
- Participant-scoped media routing returns responses only to the originating wearable participant.
- Wearable identity includes wearable, user, tenant, agent, device profile, and policy.
- Short-lived session tokens are generated from a pairing secret and are tenant/device scoped.
- ICM L0-L4 policy decisions gate L2/L3/L4 actions.
- Gated tool execution requires a server-verified approval envelope; a caller-supplied `approved:true` flag alone cannot bypass an L3 gate.
- Signed HMAC evidence receipts are emitted by the gateway.
- Model routing is capability-based (`llm`, `vlm`, `stt`, `tts`, translation, embeddings), not provider-name based.
- ACI provider supports dynamic function discovery and tenant-linked execution contracts.
- OpenClaw provider has a hard deny boundary for dangerous execution/admin tools unless explicitly allowlisted.
- Brilliant Halo adapter wraps the upstream `brilliant-ble` transport rather than reimplementing BLE.
- MentraOS-style hardware capability objects normalize into AX-022 capability contracts.

Local proof: `packages/ax022-core` passes 11/11 Node tests plus syntax checks.

### AX-022 gateway / MAXX customer-zero path
- `services/ax022-gateway` implements health, wearable session issuance, capability lookup, intent routing, and mission creation.
- The gateway defaults to `127.0.0.1` and keeps tenant agent credentials server-side.
- Agent MAXX uses the existing MACS control-plane contract: `/v1/chat` and `/v1/missions` with the constrained `x-maxx-api-key` machine credential.
- The machine path cannot approve consequential MAXX actions; human approval remains a separate human-authenticated path.
- Gateway integration test proves a simulated MACS/Halo wearable can receive a scoped AX-022 token, send `What needs me?`, route through the MAXX adapter, and receive a signed receipt without the MAXX key reaching the wearable.

Local proof: `services/ax022-gateway` passes 1/1 end-to-end gateway test plus syntax check.

## IMPLEMENTED_UNVERIFIED

These paths now exist in source but were not built/run against their real target hardware or production service during this slice:

- Android VisionClaw can prefer AX-022 Gateway for Gemini tool calls and fall back to OpenClaw.
- iOS VisionClaw can prefer AX-022 Gateway for Gemini tool calls and fall back to OpenClaw.
- Android/iOS settings expose AX-022 gateway URL + scoped wearable session token.
- Real Brilliant Halo connection through upstream `brilliant-ble`.
- Brilliant Halo Lua/display/audio/camera behavior on physical hardware or Halo emulator.
- Live AX-022 Gateway -> deployed Agent MAXX using real production credentials.
- Live ACI cloud function discovery/execution.
- Live OpenClaw `/tools/invoke` execution through the AX-022 provider.
- Real MentraOS device/session connection.
- Full iOS runtime behavior, full Android runtime behavior, end-to-end Meta hardware execution, and WebRTC production reliability.

## PRODUCTION GATES

- Move AX-022 session token storage from current proof-level `UserDefaults` / `SharedPreferences` into iOS Keychain / Android Keystore-backed encrypted storage.
- Publish gateway only behind authenticated TLS/reverse proxy.
- Replace in-memory session storage with durable/revocable production session state if multi-instance or restart persistence is required.
- Prove the real deployed MAXX path and physical/emulated Halo path before claiming customer production readiness.

## PLANNED

- Jarvis authenticated wearable gateway adapter for the owner's personal/fleet path.
- Hermes business routing behind Jarvis.
- Pauli's Place approvals/status projection.
- STARNET/Heisenberg mission/status routing.
- Physical Brilliant Halo HUD/audio/gesture implementation and emulator fixtures.
- Full Mentra and Rokid device adapters.
- Translation provider abstraction wired to live wearable UX.
- MCP/API/CLI packaging beyond the current HTTP gateway/core package.
- Commercial provisioning/onboarding, device enrollment, billing, fleet management, and tenant admin UI.

## Next proof

Deploy `services/ax022-gateway` beside the private MAXX control plane, issue one MACS wearable session, then prove the complete phone-mode or glasses-mode round trip:

`voice/vision -> Gemini Live -> execute -> AX-022 scoped token -> MAXX control plane -> Agent MAXX -> tool response -> spoken response`.

After that, run the same contract against the Brilliant Halo emulator before physical Halo verification.
