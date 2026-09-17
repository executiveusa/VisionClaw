import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GestureCapability,
  GestureEngine,
  GESTURE_EVENTS,
  ParticipantMediaHub,
  createWearableIdentity,
  getDeviceProfile,
  handMetrics,
} from '../src/index.js';

// Synthetic 21-landmark hand builder. Wrist at (x, y), span = wrist->lm[9]
// distance. Finger curls and pinch distance are ratios, exactly how
// handMetrics measures them.
function makeHand({ x = 0.5, y = 0.5, span = 0.1, pinch = 0.6, curls = [1.6, 1.6, 1.6, 1.6] } = {}) {
  const lm = Array.from({ length: 21 }, () => ({ x, y }));
  lm[0] = { x, y };                                   // wrist
  lm[9] = { x, y: y - span };                         // middle MCP (span anchor)
  const tips = [8, 12, 16, 20];
  tips.forEach((tip, i) => { lm[tip] = { x, y: y - curls[i] * span }; });
  lm[4] = { x: lm[8].x + pinch * span, y: lm[8].y };  // thumb tip at pinch ratio from index tip
  return lm;
}

function collect(engine) {
  const events = [];
  const orig = engine.onEvent;
  engine.onEvent = (e) => { events.push(e); orig(e); };
  return events;
}

test('handMetrics classifies open, fist, point, peace, and pinch ratio', () => {
  const open = handMetrics(makeHand());
  assert.equal(open.open, true);
  assert.equal(open.fist, false);
  const fist = handMetrics(makeHand({ curls: [0.5, 0.5, 0.5, 0.5] }));
  assert.equal(fist.fist, true);
  assert.equal(fist.open, false);
  const point = handMetrics(makeHand({ curls: [1.6, 0.5, 0.5, 0.5] }));
  assert.equal(point.point, true);
  assert.equal(point.peace, false);
  const peace = handMetrics(makeHand({ curls: [1.6, 1.6, 0.5, 0.5] }));
  assert.equal(peace.peace, true);
  assert.equal(peace.point, false);
  const pinched = handMetrics(makeHand({ pinch: 0.2 }));
  assert.ok(pinched.pinch < 0.30);
});

test('pinch must be earned over consecutive frames and releases as a tap', () => {
  const engine = new GestureEngine();
  const events = collect(engine);
  const far = makeHand({ pinch: 0.6 });
  const near = makeHand({ pinch: 0.2 });
  engine.ingest([far], 1000);
  engine.ingest([near], 1016);                        // 1st earned frame: nothing yet
  assert.equal(events.filter(e => e.type === GESTURE_EVENTS.PINCH_START).length, 0);
  engine.ingest([near], 1032);                        // 2nd earned frame: pinch starts
  assert.equal(events.filter(e => e.type === GESTURE_EVENTS.PINCH_START).length, 1);
  engine.ingest([far], 1048);                         // released quickly -> tap
  const types = events.map(e => e.type);
  assert.ok(types.includes(GESTURE_EVENTS.PINCH_END));
  assert.ok(types.includes(GESTURE_EVENTS.TAP));
  assert.ok(!types.includes(GESTURE_EVENTS.FLICK));
});

test('near-pinch above the threshold never registers (field-tuned ghost guard)', () => {
  const engine = new GestureEngine();
  const events = collect(engine);
  const almost = makeHand({ pinch: 0.35 });           // between PINCH_IN and PINCH_OUT
  for (let t = 0; t < 10; t++) engine.ingest([almost], 1000 + t * 16);
  assert.equal(events.filter(e => e.type === GESTURE_EVENTS.PINCH_START).length, 0);
});

test('hand identity survives MediaPipe output-order swaps', () => {
  const engine = new GestureEngine();
  const handA = makeHand({ x: 0.3, y: 0.5 });
  const handB = makeHand({ x: 0.7, y: 0.5 });
  engine.ingest([handA, handB], 1000);
  engine.ingest([handB, handA], 1016);                // swapped order
  const snap = engine.snapshot();
  assert.equal(snap[0].present, true);
  assert.equal(snap[1].present, true);
  assert.ok(snap[0].seen >= 2);                       // slot 0 kept its state across the swap
  assert.ok(snap[0].cursor.x < 0.45);                 // slot 0 still tracks the LEFT hand
  assert.ok(snap[1].cursor.x > 0.55);
});

test('stale hands are reaped so a frozen cursor never persists', () => {
  const engine = new GestureEngine();
  const events = collect(engine);
  engine.ingest([makeHand()], 1000);
  assert.equal(engine.snapshot()[0].present, true);
  engine.ingest([], 1000 + 300);                      // nothing fed for > 280ms
  assert.equal(engine.snapshot()[0].present, false);
  assert.ok(events.some(e => e.type === GESTURE_EVENTS.HAND_LOST));
});

test('two-hand stretch emits span deltas while both hands are pinched', () => {
  const engine = new GestureEngine();
  const events = collect(engine);
  const pinchL = makeHand({ x: 0.4, pinch: 0.2 });
  const pinchR = makeHand({ x: 0.6, pinch: 0.2 });
  engine.ingest([pinchL, pinchR], 1000);
  engine.ingest([pinchL, pinchR], 1016);              // both pinches earned
  assert.equal(engine.snapshot()[0].pinch, true);
  assert.equal(engine.snapshot()[1].pinch, true);
  const wider = makeHand({ x: 0.75, pinch: 0.2 });
  engine.ingest([pinchL, wider], 1032);               // right hand pulls away
  const stretch = events.find(e => e.type === GESTURE_EVENTS.STRETCH);
  assert.ok(stretch);
  assert.ok(stretch.delta > 0);                       // growing span = zoom/apart
});

test('gesture capability publishes into the media hub scoped to its participant', () => {
  const hub = new ParticipantMediaHub();
  const identity = createWearableIdentity({ wearableId: 'glasses-1', userId: 'bambu', tenantId: 'personal', agentId: 'hermes', deviceProfile: 'brilliant-halo' });
  hub.join(identity);
  const cap = new GestureCapability({ hub, identity });
  const seen = [];
  hub.onInbound('gesture', ({ participantId, payload }) => seen.push({ participantId, payload }));
  cap.ingestFrame({ hands: [makeHand({ pinch: 0.2 })], ts: 1000 });
  cap.ingestFrame({ hands: [makeHand({ pinch: 0.2 })], ts: 1016 });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].participantId, 'glasses-1');
  assert.equal(seen[0].payload.type, GESTURE_EVENTS.PINCH_START);
  assert.throws(() => new GestureCapability({ hub }), /wearable_identity_required/);
});

test('camera-bearing device profiles report the gesture capability', () => {
  const halo = getDeviceProfile('brilliant-halo');
  assert.equal(halo.hasCamera, true);
});
