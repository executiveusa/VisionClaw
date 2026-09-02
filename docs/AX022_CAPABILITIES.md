# AI GLASSES AX-022 — Capability Ledger

Status meanings:
- **VERIFIED** — automated proof exists in this repo/slice.
- **IMPLEMENTED / NEEDS TARGET PROOF** — code is wired, but the real target service/device was not exercised in this slice.
- **PLANNED** — contract/roadmap only.

## Wearable and device layer

| Capability | Status | Notes |
|---|---|---|
| Vendor-neutral device capability registry | VERIFIED | Halo, Meta DAT path, Mentra Live, Rokid profiles |
| Brilliant Halo transport adapter | VERIFIED at contract/mock level | Wraps upstream `brilliant-ble`; physical/emulator proof still required |
| Mentra capability normalization | VERIFIED | Accepts MentraOS-style capabilities |
| Meta Ray-Ban camera/mic path | IMPLEMENTED / NEEDS TARGET PROOF | Existing VisionClaw iOS/Android code retained |
| Rokid capability profile | VERIFIED as profile | Runtime adapter not yet implemented |
| Camera/vision context | IMPLEMENTED / NEEDS TARGET PROOF | Existing VisionClaw Gemini Live pipeline |
| Duplex voice/audio | IMPLEMENTED / NEEDS TARGET PROOF | Existing VisionClaw audio path; Halo private audio still needs hardware proof |
| HUD/display abstraction | PARTIAL | Capability model exists; Halo/Rokid rendering implementation still required |
| Gesture/button abstraction | PARTIAL | Capability model exists; vendor event implementations still required |
| Phone-camera fallback | IMPLEMENTED / NEEDS TARGET PROOF | Existing VisionClaw path |
| WebRTC live POV sharing | IMPLEMENTED / NEEDS TARGET PROOF | Existing VisionClaw path |

## Identity, routing, and tenancy

| Capability | Status | Notes |
|---|---|---|
| Wearable identity | VERIFIED | wearable + user + tenant + agent + device + policy |
| Pairing-secret session issuance | VERIFIED | random scoped bearer token |
| Session expiry/revocation | VERIFIED | in-memory v0 session store |
| Multi-tenant agent routing | VERIFIED | tenant maps to agent adapter |
| Participant-isolated return routing | VERIFIED | responses return only to origin participant |
| MACS / Agent MAXX tenant | VERIFIED at contract/test level | gateway routes to MAXX adapter |
| Personal Jarvis/Hermes tenant | PLANNED | config placeholder only; no HTTP adapter yet |

## Agent MAXX

| Capability | Status | Notes |
|---|---|---|
| MAXX chat through AX-022 | VERIFIED at gateway contract level | uses existing `/v1/chat` + `x-maxx-api-key` |
| MAXX mission creation | IMPLEMENTED | uses existing `/v1/missions` machine route |
| MAXX Power mode routing | IMPLEMENTED | adapter prefixes existing MAXX mode contract |
| MAXX approval protection | VERIFIED | machine adapter refuses approval without human token provider |
| MAXX key hidden from wearable | VERIFIED by gateway test | only AX-022 session token reaches client |
| Android live `execute` -> AX-022 | IMPLEMENTED / NEEDS APP BUILD + LIVE PROOF | AX-022 preferred; OpenClaw fallback |
| iOS live `execute` -> AX-022 | IMPLEMENTED / NEEDS APP BUILD + LIVE PROOF | AX-022 preferred; OpenClaw fallback |

## Governance and security

| Capability | Status | Notes |
|---|---|---|
| ICM L0-L4 policy engine | VERIFIED | L2 standing policy, L3 approval, L4 hard gate |
| Verified approval-envelope enforcement | VERIFIED | caller-supplied `approved:true` alone cannot bypass L3; verified server envelope + approval ID required |
| Signed action receipts | VERIFIED | HMAC-SHA256 receipts |
| Server-side credential boundary | VERIFIED by architecture/test | MAXX key remains gateway-side |
| Loopback gateway default | VERIFIED | `127.0.0.1` unless explicitly changed |
| Dangerous OpenClaw hard-deny | VERIFIED | blocks exec/shell/fs mutation/spawn/admin classes before network call |
| Tenant isolation contract | VERIFIED in core tests | identity + participant routing |
| Production TLS/reverse proxy | PLANNED deployment gate | gateway itself is private HTTP service |
| Persistent session store | PLANNED | current v0 store is memory-only |
| Mobile Keychain/Keystore session-token storage | PLANNED production gate | current proof uses existing UserDefaults/SharedPreferences settings stores |

## Models and multimodal services

| Capability | Status | Notes |
|---|---|---|
| Logical model routing | VERIFIED | LLM/VLM/STT/TTS/translation/embedding capability names |
| Gemini Live voice/vision | IMPLEMENTED / NEEDS TARGET PROOF | current VisionClaw runtime |
| Provider-independent STT/TTS/VLM | PARTIAL | interface exists; provider registry must be populated at deployment |
| Translation | PLANNED live wiring | logical capability exists, UX/provider not yet bound |

## Tool fabric

| Capability | Status | Notes |
|---|---|---|
| Dynamic ACI function search | VERIFIED at SDK-contract test level | searches only allowed apps by default |
| Tenant-linked ACI execution | VERIFIED at SDK-contract test level | linked owner id = `tenant:user` |
| Live ACI cloud calls | IMPLEMENTED / NEEDS LIVE PROOF | requires `@aci-sdk/aci` + API credentials |
| OpenClaw optional provider | VERIFIED safety behavior | `/tools/invoke` client exists; live call still needs proof |
| Tool-level ICM policy gate | VERIFIED | provider/tool request evaluated before execution |
| MCP packaging | PLANNED | ACI/OpenClaw may expose MCP externally; AX-022 native MCP surface not yet shipped |

## Commercial/product layer

| Capability | Status | Notes |
|---|---|---|
| Customer-specific tenant configuration | VERIFIED as config contract | `config/tenants.example.json` |
| Agent + glasses bundle architecture | VERIFIED as code structure | device and agent independently replaceable |
| Customer-zero: MACS / Agent MAXX | IMPLEMENTED / NEEDS LIVE DEPLOYMENT PROOF | first commercial reference path |
| Automated device enrollment UI | PLANNED |
| Tenant admin/fleet dashboard | PLANNED |
| Billing/subscription/provisioning | PLANNED |
| Managed offer/playbook | PLANNED commercial layer |

## Current proof commands

```bash
cd packages/ax022-core
npm test
npm run check

cd ../../services/ax022-gateway
npm test
npm run check
```

Current automated result: **11 core tests + 1 gateway integration test pass; syntax checks pass**.
