# Decisions

## D-001 — VisionClaw is the provisional AX-022 implementation base
Reason: it already has mobile, voice, vision, tool-routing, and Meta-glasses pathways. Reuse beats starting another repo.

## D-002 — Preserve existing Meta implementation during ICM restructuring
Reason: brownfield rule. Add orientation/contracts first; move code only after a verified migration map.

## D-003 — Hardware must be adapter-based
Reason: the commercial product cannot depend on one vendor. Brilliant Halo is preferred for sovereignty, but Meta/Mentra/Rokid remain viable surfaces.

## D-004 — Jarvis owns wearable presence
Reason: current fleet contract assigns voice/phone/glasses/chat presence to Jarvis. Jarvis routes business work to Hermes rather than replacing Hermes.

## D-005 — Business authority remains server-side
Reason: credentials, policy, approvals, evidence, tenant isolation, and rollback must not depend on a consumer wearable.

## D-006 — Sell outcomes, not glasses
Reason: the offer is a configured AI workforce/owner interface with integrations and operations; hardware is the delivery surface.
