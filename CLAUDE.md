# AI GLASSES AX-022 — Agent Router

This repository is the current implementation base for **AI GLASSES AX-022**. It preserves the existing VisionClaw Meta smart-glasses implementation while adding an ICM layer so any capable agent can orient, change, verify, and report without loading the whole repository.

## Route by task

| Task | Read first |
|---|---|
| Understand the product | `icm/context/PRODUCT.md` |
| Understand architecture | `icm/context/ARCHITECTURE.md` |
| Check what is actually implemented | `icm/context/CURRENT_STATE.md` |
| Change device support | `icm/_templates/DEVICE_ADAPTER.md` then `icm/effects/CONTEXT.md` |
| Start implementation work | `icm/stages/01_inspect/CONTEXT.md` |
| Security/permissions | `icm/context/SECURITY.md` |
| Understand decisions | `icm/context/DECISIONS.md` |
| Change existing code safely | `icm/map/CONTEXT.md` |

## Operating rules

- Inspect before changing.
- Reuse the working VisionClaw pathways before adding parallel implementations.
- Do not claim Halo, Mentra, Rokid, Jarvis, Hermes, STARNET, Pauli's Place, MAXX, MCP, or CLI support unless runtime evidence proves it.
- Existing Meta Ray-Ban iOS/Android code remains live source until replaced by a verified adapter.
- Builders do not approve their own work.
- L3/L4 consequential actions require the existing ICM approval policy.
- Every release needs rollback and proof.

The ICM workspace begins at `icm/CONTEXT.md`.
