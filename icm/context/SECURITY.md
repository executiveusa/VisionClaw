# Security Contract

## Trust boundary

The glasses and mobile client are untrusted edge devices relative to business infrastructure.

## Must remain server-side

- GitHub tokens
- deployment credentials
- database service keys
- model/provider master keys where proxying is possible
- DNS/admin credentials
- customer secrets
- fleet service credentials

## Risk tiers

- L0 observe/read/search/summarize: automatic.
- L1 reversible internal drafts/tests: automatic with receipt.
- L2 bounded reversible external action: only under explicit standing policy.
- L3 send/publish/prod deploy/schema migration/meaningful spend: human approval.
- L4 destructive/secrets/admin/legal/high-stakes finance/identity permissions: hard gate.

## Wearable-specific controls

- Short-lived scoped device session tokens.
- Explicit tenant/context indicator before MAXX or other client access.
- Audio/vision capture indicator and user-controlled stop.
- No passive facial identity system by default.
- No consequential tool execution from unconfirmed wake-word ambiguity.
- Red actions require an explicit confirmation surface and server-side approval envelope.
