# AX-022 Gateway

Server-side trust boundary between wearable clients and tenant agents.

## Current implemented routes
- `GET /health`
- `POST /v1/sessions` — exchange a pairing secret for a short-lived wearable session token.
- `GET /v1/capabilities` — device + agent capabilities for the authenticated wearable.
- `POST /v1/intent` — route a text/action intent to the tenant agent.
- `POST /v1/missions` — create a bounded mission through the tenant agent.

## MAXX
Set `MAXX_BASE_URL` and `MAXX_API_KEY` on the gateway host. The machine key never goes to the glasses/phone. The adapter uses MAXX's constrained `x-maxx-api-key` path for chat/missions. Human approvals intentionally remain outside this machine path.

## Security defaults
- binds to `127.0.0.1` unless explicitly overridden;
- no agent/vendor credentials are returned to clients;
- signed receipts are emitted for completed intents/missions;
- pairing secret is required;
- tenant and device profiles are server-side configuration;
- production publishing should use authenticated TLS/reverse proxy;
- mobile clients should move the scoped AX-022 token into Keychain/Android Keystore-backed storage before production. The current VisionClaw settings wiring is development/proof storage, not the final device-secret vault.
