import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AgentRouter,
  MaxxAgentAdapter,
  PolicyEngine,
  SessionStore,
  createReceiptSigner,
  getDeviceProfile,
} from '../../packages/ax022-core/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.AX022_PORT ?? 8790);
const BIND = process.env.AX022_BIND ?? '127.0.0.1';
const pairingSecret = process.env.AX022_PAIRING_SECRET ?? '';
const receiptSecret = process.env.AX022_RECEIPT_SECRET ?? pairingSecret;
if (!pairingSecret) throw new Error('AX022_PAIRING_SECRET is required');
if (!receiptSecret) throw new Error('AX022_RECEIPT_SECRET is required');

const tenantsPath = process.env.AX022_TENANTS_FILE ?? path.resolve(__dirname, '../../config/tenants.json');
const tenants = fs.existsSync(tenantsPath) ? JSON.parse(fs.readFileSync(tenantsPath, 'utf8')).tenants ?? {} : {};

const sessions = new SessionStore({ pairingSecret });
const policy = new PolicyEngine();
const signReceipt = createReceiptSigner(receiptSecret);
const router = new AgentRouter();

if (process.env.MAXX_BASE_URL && process.env.MAXX_API_KEY) {
  router.registerAdapter('agent-maxx', new MaxxAgentAdapter({
    baseUrl: process.env.MAXX_BASE_URL,
    machineApiKey: process.env.MAXX_API_KEY,
  }));
}
for (const [tenantId, cfg] of Object.entries(tenants)) router.registerTenant(tenantId, cfg);

function json(res, status, body) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': data.length });
  res.end(data);
}

async function readJson(req, limit = 1024 * 1024) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length; if (size > limit) throw new Error('request_too_large');
    chunks.push(chunk);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

function bearer(req) {
  const h = req.headers.authorization ?? '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

function requireSession(req) {
  const session = sessions.get(bearer(req));
  if (!session) throw Object.assign(new Error('unauthorized'), { status: 401 });
  return session;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, { ok: true, service: 'ax022-gateway', bind: BIND, tenants: Object.keys(tenants) });
    }

    if (req.method === 'POST' && url.pathname === '/v1/sessions') {
      const body = await readJson(req);
      const tenant = tenants[body.tenantId];
      if (!tenant) return json(res, 404, { ok:false, error:'unknown_tenant' });
      const deviceProfile = body.deviceProfile ?? tenant.deviceProfiles?.[0];
      getDeviceProfile(deviceProfile);
      const created = sessions.create({
        pairingSecret: body.pairingSecret,
        identity: {
          wearableId: body.wearableId,
          userId: body.userId,
          tenantId: body.tenantId,
          agentId: tenant.defaultAgentId ?? tenant.agentAdapter,
          deviceProfile,
          policyId: tenant.policyId ?? 'default',
        },
      });
      return json(res, 201, { ok:true, ...created, device: getDeviceProfile(deviceProfile) });
    }

    if (req.method === 'GET' && url.pathname === '/v1/capabilities') {
      const { identity } = requireSession(req);
      const { adapter } = router.resolve(identity);
      return json(res, 200, { ok:true, identity, device:getDeviceProfile(identity.deviceProfile), agent:adapter.capabilities() });
    }

    if (req.method === 'POST' && url.pathname === '/v1/intent') {
      const { identity } = requireSession(req);
      const body = await readJson(req);
      const message = String(body.message ?? '').trim();
      if (!message) return json(res, 400, { ok:false, error:'message_required' });
      const result = await router.chat(identity, message, { mode: body.mode ?? 'normal' });
      const receipt = signReceipt({
        type: 'ax022.intent', tenantId: identity.tenantId, userId: identity.userId,
        wearableId: identity.wearableId, agentId: identity.agentId, outcome: 'completed',
      });
      return json(res, 200, { ok:true, result, receipt });
    }

    if (req.method === 'POST' && url.pathname === '/v1/missions') {
      const { identity } = requireSession(req);
      const body = await readJson(req);
      const { adapter } = router.resolve(identity);
      const decision = policy.evaluate({ name:'create_mission', riskTier:1 });
      if (!decision.allowed) return json(res, 403, { ok:false, decision });
      const result = await adapter.createMission({ objective:String(body.objective ?? '') });
      return json(res, 200, { ok:true, result, receipt:signReceipt({ type:'ax022.mission', tenantId:identity.tenantId, userId:identity.userId, outcome:'created' }) });
    }

    return json(res, 404, { ok:false, error:'not_found' });
  } catch (error) {
    const status = error.status ?? (error.message === 'request_too_large' ? 413 : 500);
    return json(res, status, { ok:false, error: status === 500 ? 'internal_error' : error.message });
  }
});

server.listen(PORT, BIND, () => {
  console.log(`[ax022] listening on http://${BIND}:${PORT}`);
});
