# AX-022 third-party architecture and dependency notices

AX-022 integrates or interoperates with the following upstream projects. Source is not copied wholesale unless explicitly stated.

- **Brilliant Labs `brilliant_sdk` / `brilliant-ble`** — BSD-3-Clause. AX-022's `BrilliantHaloAdapter` loads the upstream `brilliant-ble` package and uses its `BrilliantBle` connection/message transport rather than reimplementing BLE.
- **ACI TypeScript SDK (`@aci-sdk/aci`)** — MIT, Copyright 2025 Aipotheosis Labs. AX-022 uses the upstream SDK interface for dynamic function discovery and execution.
- **MentraOS** — MIT, Copyright 2026 Mentra Labs, Inc. AX-022's capability shape is adapted from MentraOS hardware capability modeling; the adapter accepts a MentraOS-style capability object.
- **NVIDIA XR AI** — Apache-2.0. AX-022's participant-scoped media hub follows the one-hub/many-clients routing boundary and its model router uses logical capabilities; no NVIDIA runtime code is vendored in this package.
- **CAMEL HALO** — Apache-2.0, Copyright 2026 CAMEL-AI.org. AX-022 adopts the separate glasses/agent adapter boundary and streaming-session lessons, but does not copy HALO's `bypassPermissions` default or public bind behavior.
- **GlassKit** — MIT. AX-022 incorporates smart-glasses development and evaluation patterns into its own ICM skill; no GlassKit runtime is required by core.
- **OpenClaw** — MIT, Copyright 2026 OpenClaw Foundation. AX-022 includes an optional provider for the authenticated `/tools/invoke` API with an additional hard deny list.
- **JSOS** — AGPL-3.0. No JSOS implementation code is copied into AX-022 commercial core; only general architectural ideas were studied.

Keep upstream license files/attribution with any future vendored source. Re-check licenses and notices before redistributing third-party code or binaries.
