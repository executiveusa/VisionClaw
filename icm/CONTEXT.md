# AX-022 ICM Workspace

One job: make this smart-glasses system walkable, verifiable, hardware-extensible, and commercially usable without turning documentation into a second source of truth.

## Shape

- `context/` — stable product, architecture, security, dependencies, decisions, and current-state contracts.
- `_shared/` — rules that apply across every mission.
- `_templates/` — copyable starters for missions and device adapters.
- `stages/` — the change pipeline in execution order.
- `map/` — how to inspect the existing codebase and reason about change impact.
- `effects/` — first-order change-impact routing.

## Source of truth

Runtime/code beats prose. The current VisionClaw implementation under `samples/` is the live implementation source. ICM files route agents to that source and record verified state; they must not invent capabilities.

## Status rule

A capability is one of:
- `VERIFIED` — runtime/build/test evidence exists.
- `IMPLEMENTED_UNVERIFIED` — code exists, proof missing.
- `PLANNED` — intended, not implemented.
- `BLOCKED` — a named dependency prevents verification.

## Human gates

Stop for human approval before L3/L4 actions, production release, meaningful spend, external publishing, credential/admin changes, destructive migration, or changing the commercial offer.
