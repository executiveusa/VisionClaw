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

test('Brilliant Halo adapter wraps upstream transport without owning BLE internals', async () => {
  const calls = [];
  const fakeBle = {
    type: 'halo',
    connect: async (options) => { calls.push(['connect', options]); return 'Halo'; },
    disconnect: async () => calls.push(['disconnect']),
    sendLua: async (lua, options) => { calls.push(['lua', lua, options]); return 'ok'; },
    setDataResponseHandler: (handler) => calls.push(['data-handler', typeof handler]),
    setPrintResponseHandler: (handler) => calls.push(['print-handler', typeof handler]),
  };
  const { BrilliantHaloAdapter } = await import('../src/devices/brilliant-halo-adapter.js');
  const adapter = new BrilliantHaloAdapter({ ble: fakeBle });
  const connected = await adapter.connect({ timeout: 1 });
  assert.equal(connected.type, 'halo');
  await adapter.sendLua("frame.display.text('MAXX',1,1)");
  adapter.onRawData(() => {});
  adapter.onPrint(() => {});
  await adapter.disconnect();
  assert.equal(calls[0][0], 'connect');
  assert.equal(calls[1][0], 'lua');
});

test('MentraOS-style hardware capabilities normalize into AX-022', async () => {
  const { fromMentraCapabilities } = await import('../src/devices/mentra-capability-adapter.js');
  const caps = fromMentraCapabilities({
    modelName: 'Mentra Test', hasCamera: true, camera: { video: { canStream: true } },
    hasMicrophone: true, microphone: { count: 3 }, hasSpeaker: true, speaker: { count: 2 },
    hasDisplay: false, hasWifi: true,
  });
  assert.equal(caps.hasCamera, true);
  assert.equal(caps.hasMicrophone, true);
  assert.equal(caps.hasSpeaker, true);
  assert.equal(caps.hasWifi, true);
});

test('OpenClaw provider hard-blocks dangerous tools before network execution', async () => {
  const { OpenClawToolProvider } = await import('../src/providers/openclaw-tool-provider.js');
  let networkCalls = 0;
  const provider = new OpenClawToolProvider({
    baseUrl: 'http://127.0.0.1:18789', token: 'operator',
    fetchImpl: async () => { networkCalls++; throw new Error('should not execute'); },
  });
  const result = await provider.execute({
    tool: 'exec', args: { command: 'whoami' },
    identity: createWearableIdentity({ wearableId:'w', userId:'u', tenantId:'t', agentId:'a', deviceProfile:'brilliant-halo' }),
  });
  assert.equal(result.blocked, true);
  assert.equal(networkCalls, 0);
});

test('model router chooses providers by capability instead of vendor name', async () => {
  const { ModelRouter, ModelCapability } = await import('../src/model-router.js');
  const router = new ModelRouter();
  router.register(ModelCapability.STT, (context) => ({ kind: 'stt', context }));
  router.register(ModelCapability.VLM, (context) => ({ kind: 'vlm', context }));
  assert.equal(router.make(ModelCapability.STT, { tenant: 'macs' }).kind, 'stt');
  assert.equal(router.make(ModelCapability.VLM, { tenant: 'macs' }).kind, 'vlm');
});

test('tool fabric rejects unverified approval claims and accepts verified envelopes', async () => {
  const { ToolFabric } = await import('../src/tool-fabric.js');
  let executions = 0;
  const fabric = new ToolFabric({ policyEngine: new PolicyEngine() });
  fabric.register('demo', { execute: async () => { executions++; return { ok:true }; } });
  const identity = createWearableIdentity({ wearableId:'w', userId:'u', tenantId:'t', agentId:'a', deviceProfile:'brilliant-halo' });
  const fake = await fabric.execute({ provider:'demo', tool:'publish', identity, riskTier:RiskTier.L3, approvalEnvelope:{ approved:true } });
  assert.equal(fake.blocked, true);
  assert.equal(executions, 0);
  const verified = await fabric.execute({ provider:'demo', tool:'publish', identity, riskTier:RiskTier.L3, approvalEnvelope:{ approved:true, verified:true, approvalId:'approval-1' } });
  assert.equal(verified.ok, true);
  assert.equal(executions, 1);
});
