# Decisions

## D-001 — VisionClaw is the provisional AX-022 implementation base
Reason: it already has mobile, voice, vision, tool-routing, and Meta-glasses pathways. Reuse beats starting another repo.

## D-002 — Preserve existing Meta implementation during restructuring
Reason: brownfield rule. Keep the current voice/vision path while introducing replaceable boundaries around it.

## D-003 — Hardware is adapter-based
Reason: the commercial product cannot depend on one vendor. Brilliant Halo is the preferred open target, while Meta/Mentra/Rokid remain supported architecture surfaces.

## D-004 — Jarvis owns personal wearable presence
Reason: the fleet contract assigns voice/phone/glasses/chat presence to Jarvis. Jarvis routes business work to Hermes rather than replacing Hermes.

## D-005 — Business authority remains server-side
Reason: credentials, policy, approvals, evidence, tenant isolation, and rollback must not depend on a consumer wearable.

## D-006 — Sell outcomes, not glasses
Reason: the offer is a configured AI employee/workforce interface with integrations and operations; hardware is the delivery surface.

## D-007 — Agent MAXX is AX-022 customer-zero
Reason: MACS already has isolated Agent MAXX/Hermes, ICM, approvals, machine credentials, mobile remote capability, Pups, and business workflows. AX-022 must integrate with that existing control plane instead of cloning MAXX into the glasses project.

## D-008 — Mobile keeps live VisionClaw media; AX-022 replaces only the action boundary first
Reason: camera/audio/Gemini Live already exist. Both iOS and Android now route Gemini `execute` tool calls through a generic ToolBridge, preferring AX-022 when configured and falling back to OpenClaw.

## D-009 — MAXX credentials never live on the glasses/phone
Reason: the AX-022 Gateway holds the constrained `MAXX_API_KEY`; the wearable receives a short-lived AX-022 session token only. MAXX human approvals remain a separate human-authenticated path.

## D-010 — Adopt upstream patterns selectively, not by repo merge
Reason: NVIDIA, CAMEL HALO, MentraOS, GlassKit, OpenClaw, Brilliant SDK, ACI, and JSOS have useful pieces but different security/license assumptions. AX-022 owns the integration contract; upstreams remain replaceable dependencies/references.

## D-011 — Do not copy AGPL JSOS implementation into the commercial core
Reason: JSOS is useful as an architectural reference, but its AGPL obligations are not being adopted implicitly. No JSOS implementation code is copied in this slice.

## D-012 — Tool discovery does not equal authority
Reason: ACI/OpenClaw can expose broad capability catalogs. AX-022/tenant policy still decides whether a discovered action may execute and whether human approval is required.
