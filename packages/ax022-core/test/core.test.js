import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AciToolProvider,
  MaxxAgentAdapter,
  ParticipantMediaHub,
  PolicyEngine,
  RiskTier,
  SessionStore,
  createWearableIdentity,
  getDeviceProfile,
} from '../src/index.js';

test('device catalog exposes Halo multimodal capabilities', () => {
  const halo = getDeviceProfile('brilliant-halo');
  assert.equal(halo.hasCamera, true);
  assert.equal(halo.hasMicrophone, true);
  assert.equal(halo.hasSpeaker, true);
  assert.equal(halo.hasDisplay, true);
});

test('media hub returns only to originating participant', () => {
  const hub = new ParticipantMediaHub();
  const a = createWearableIdentity({ wearableId:'a', userId:'u1', tenantId:'t1', agentId:'maxx', deviceProfile:'brilliant-halo' });
  const b = createWearableIdentity({ wearableId:'b', userId:'u2', tenantId:'t2', agentId:'hermes', deviceProfile:'brilliant-halo' });
  hub.join(a); hub.join(b);
  let gotA = 0; let gotB = 0;
  hub.onReturn('a', () => gotA++);
  hub.onReturn('b', () => gotB++);
  hub.returnToOrigin('a', { text: 'private' });
  assert.equal(gotA, 1);
  assert.equal(gotB, 0);
});

test('ICM policy gates L3 and L4', () => {
  const p = new PolicyEngine();
  assert.equal(p.evaluate({ name:'read', riskTier:RiskTier.L0 }).allowed, true);
  assert.equal(p.evaluate({ name:'draft', riskTier:RiskTier.L1 }).allowed, true);
  assert.equal(p.evaluate({ name:'publish', riskTier:RiskTier.L3 }).requiresApproval, true);
  assert.equal(p.evaluate({ name:'delete', riskTier:RiskTier.L4 }).allowed, false);
});

test('sessions are tenant/device scoped and require pairing secret', () => {
  const store = new SessionStore({ pairingSecret:'pair-me', ttlMs:10000 });
  assert.throws(() => store.create({ pairingSecret:'wrong', identity:{} }));
  const created = store.create({ pairingSecret:'pair-me', identity:{ wearableId:'w', userId:'stacy', tenantId:'macs', agentId:'agent-maxx', deviceProfile:'brilliant-halo' } });
  assert.equal(store.get(created.token).identity.tenantId, 'macs');
  store.revoke(created.token);
  assert.equal(store.get(created.token), null);
});

test('MAXX adapter uses constrained machine header and real v1/chat route', async () => {
  let seen;
  const fetchImpl = async (url, init) => {
    seen = { url, init };
    return new Response(JSON.stringify({ response:'MAXX online' }), { status:200, headers:{'content-type':'application/json'} });
  };
  const maxx = new MaxxAgentAdapter({ baseUrl:'https://maxx.local/', machineApiKey:'k', fetchImpl });
  const result = await maxx.chat({ message:'status' });
  assert.equal(result.response, 'MAXX online');
  assert.equal(seen.url, 'https://maxx.local/v1/chat');
  assert.equal(seen.init.headers['x-maxx-api-key'], 'k');
  assert.equal((await maxx.approve({ approvalId:'a', decision:'approve' })).blocked, true);
});

test('ACI provider performs dynamic function discovery and tenant-linked execution', async () => {
  const calls = [];
  const client = {
    functions: {
      search: async (input) => { calls.push(['search', input]); return [{ name:'GMAIL__SEND_EMAIL' }]; },
      execute: async (input) => { calls.push(['execute', input]); return { success:true, data:{ id:'x' } }; },
    },
  };
  const aci = new AciToolProvider({ client });
  const found = await aci.search({ intent:'send an email', limit:3 });
  assert.equal(found[0].name, 'GMAIL__SEND_EMAIL');
  const identity = createWearableIdentity({ wearableId:'w', userId:'stacy', tenantId:'macs', agentId:'agent-maxx', deviceProfile:'brilliant-halo' });
  const result = await aci.execute({ tool:'GMAIL__SEND_EMAIL', args:{ to:'x' }, identity });
  assert.equal(result.ok, true);
  assert.equal(calls[1][1].linked_account_owner_id, 'macs:stacy');
});
