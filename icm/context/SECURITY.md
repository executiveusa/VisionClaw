# Security Contract

## Trust boundary

Glasses and mobile clients are untrusted edge devices relative to business infrastructure. The AX-022 Gateway is the first server-side trust boundary.

## Must remain server-side

- MAXX `MAXX_API_KEY` and internal Hermes credentials
- GitHub tokens
- deployment credentials
- database service keys
- ACI/OpenClaw master/operator credentials
- model/provider master keys where proxying is possible
- DNS/admin credentials
- customer secrets
- fleet service credentials

The phone/glasses receive only a scoped AX-022 wearable session token. That token identifies wearable, user, tenant, agent, device profile, and policy and can expire/revoke independently of business credentials.

## Risk tiers

- L0 observe/read/search/summarize: automatic.
- L1 reversible internal drafts/tests: automatic with receipt.
- L2 bounded reversible external action: only under explicit standing policy.
- L3 send/publish/prod deploy/schema migration/meaningful spend: human approval.
- L4 destructive/secrets/admin/legal/high-stakes finance/identity permissions: hard gate.

## MAXX boundary

- AX-022 may use MAXX's constrained `x-maxx-api-key` machine route for chat/mission work.
- The MAXX machine credential never travels to the wearable.
- The machine route is not an approval credential.
- Approval/rejection of consequential MAXX actions requires a human-authenticated approval path.
- Stacy/MACS tenant context must never be merged with the owner's personal Hermes/Pi context.

## Tool providers

### ACI
- linked account owner id is tenant/user scoped (`tenantId:userId`).
- function discovery can be L0/read-style work.
- external execution still passes AX-022/tenant policy; discovery is not permission.

### OpenClaw
AX-022 adds a default hard-deny list before network execution for high-risk generic tools including shell/exec, filesystem mutation, patching, agent/session spawning, cron, gateway, and node administration unless a server-side policy explicitly allows them.

Do not reproduce CAMEL HALO's reference `bypassPermissions` behavior in production.

## Wearable-specific controls

- short-lived scoped device session tokens;
- explicit tenant/context indicator before client access;
- audio/vision capture indicator and user-controlled stop;
- no passive facial identity system by default;
- no consequential tool execution from unconfirmed wake-word ambiguity;
- L3/L4 actions require a server-side approval envelope and explicit confirmation surface;
- signed receipts for completed intents/missions;
- gateway binds to loopback by default and should be published only behind authenticated TLS/reverse proxy;
- recording retention is opt-in tenant policy, not a device default.
