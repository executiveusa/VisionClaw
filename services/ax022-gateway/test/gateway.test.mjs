import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const MAXX_PORT = 19877;
const GATEWAY_PORT = 19878;

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
}

async function waitFor(url, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

test('gateway pairs wearable and routes intent to constrained MAXX machine path', async (t) => {
  const seen = [];
  const maxx = http.createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    seen.push({ url:req.url, key:req.headers['x-maxx-api-key'], body:Buffer.concat(chunks).toString('utf8') });
    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify({ response:'Agent MAXX 006 online' }));
  });
  await listen(maxx, MAXX_PORT);
  t.after(() => maxx.close());

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ax022-'));
  const tenants = path.join(tmp, 'tenants.json');
  fs.writeFileSync(tenants, JSON.stringify({ tenants:{ macs:{ agentAdapter:'agent-maxx', defaultAgentId:'agent-maxx', policyId:'macs-owner', deviceProfiles:['brilliant-halo'] } } }));

  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: path.resolve(import.meta.dirname, '..'),
    env: {
      ...process.env,
      AX022_PORT:String(GATEWAY_PORT),
      AX022_BIND:'127.0.0.1',
      AX022_PAIRING_SECRET:'pair-secret',
      AX022_RECEIPT_SECRET:'receipt-secret',
      AX022_TENANTS_FILE:tenants,
      MAXX_BASE_URL:`http://127.0.0.1:${MAXX_PORT}`,
      MAXX_API_KEY:'maxx-machine-key',
    },
    stdio:['ignore','pipe','pipe'],
  });
  t.after(() => child.kill('SIGTERM'));
  await waitFor(`http://127.0.0.1:${GATEWAY_PORT}/health`);

  const pair = await fetch(`http://127.0.0.1:${GATEWAY_PORT}/v1/sessions`, {
    method:'POST', headers:{'content-type':'application/json'},
    body:JSON.stringify({ pairingSecret:'pair-secret', wearableId:'halo-001', userId:'stacy', tenantId:'macs', deviceProfile:'brilliant-halo' }),
  });
  assert.equal(pair.status, 201);
  const session = await pair.json();
  assert.ok(session.token);

  const intent = await fetch(`http://127.0.0.1:${GATEWAY_PORT}/v1/intent`, {
    method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${session.token}`},
    body:JSON.stringify({ message:'What needs me?' }),
  });
  assert.equal(intent.status, 200);
  const body = await intent.json();
  assert.equal(body.result.response, 'Agent MAXX 006 online');
  assert.ok(body.receipt.signature);
  assert.equal(seen[0].url, '/v1/chat');
  assert.equal(seen[0].key, 'maxx-machine-key');
});

// Synthetic 21-landmark hand for the /v1/gestures route (same builder as the
// core gesture tests): wrist at (x,y), span = wrist->lm[9], pinch as ratio.
function makeHand({ x = 0.5, y = 0.5, span = 0.1, pinch = 0.6, curls = [1.6, 1.6, 1.6, 1.6] } = {}) {
  const lm = Array.from({ length: 21 }, () => ({ x, y }));
  lm[0] = { x, y };
  lm[9] = { x, y: y - span };
  [8, 12, 16, 20].forEach((tip, i) => { lm[tip] = { x, y: y - curls[i] * span }; });
  lm[4] = { x: lm[8].x + pinch * span, y: lm[8].y };
  return lm;
}

test('gateway classifies holo-gestures frames for a session and signs a receipt', async (t) => {
  const G_PORT = 19880;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ax022-gestures-'));
  const tenants = path.join(tmp, 'tenants.json');
  fs.writeFileSync(tenants, JSON.stringify({ tenants:{ personal:{ agentAdapter:'agent-maxx', defaultAgentId:'agent-maxx', policyId:'personal', deviceProfiles:['brilliant-halo'] } } }));

  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: path.resolve(import.meta.dirname, '..'),
    env: {
      ...process.env,
      AX022_PORT:String(G_PORT),
      AX022_BIND:'127.0.0.1',
      AX022_PAIRING_SECRET:'pair-secret',
      AX022_RECEIPT_SECRET:'receipt-secret',
      AX022_TENANTS_FILE:tenants,
    },
    stdio:['ignore','pipe','pipe'],
  });
  t.after(() => child.kill('SIGTERM'));
  await waitFor(`http://127.0.0.1:${G_PORT}/health`);

  const pair = await fetch(`http://127.0.0.1:${G_PORT}/v1/sessions`, {
    method:'POST', headers:{'content-type':'application/json'},
    body:JSON.stringify({ pairingSecret:'pair-secret', wearableId:'rayban-001', userId:'bambu', tenantId:'personal', deviceProfile:'brilliant-halo' }),
  });
  assert.equal(pair.status, 201);
  const session = await pair.json();

  // a full pinch lifecycle across three frames: hover, touch, touch (earned)
  const res = await fetch(`http://127.0.0.1:${G_PORT}/v1/gestures`, {
    method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${session.token}`},
    body:JSON.stringify({ frames:[
      { ts: 1000, hands:[makeHand({ pinch: 0.6 })] },
      { ts: 1016, hands:[makeHand({ pinch: 0.2 })] },
      { ts: 1032, hands:[makeHand({ pinch: 0.2 })] },
    ] }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.events.some(e => e.type === 'pinch_start'));
  assert.equal(body.hands[0].present, true);
  assert.ok(body.receipt.signature);

  // engine state persists per session: release on the next call closes the pinch
  const res2 = await fetch(`http://127.0.0.1:${G_PORT}/v1/gestures`, {
    method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${session.token}`},
    body:JSON.stringify({ ts: 1048, hands:[makeHand({ pinch: 0.6 })] }),
  });
  const body2 = await res2.json();
  assert.ok(body2.events.some(e => e.type === 'pinch_end'));
  assert.ok(body2.events.some(e => e.type === 'tap'));

  // no session token -> 401
  const anon = await fetch(`http://127.0.0.1:${G_PORT}/v1/gestures`, {
    method:'POST', headers:{'content-type':'application/json'},
    body:JSON.stringify({ hands:[] }),
  });
  assert.equal(anon.status, 401);
});
