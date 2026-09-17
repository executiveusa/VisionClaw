// AX-022 gesture capability adapter: owns a GestureEngine per wearable session
// and publishes classified gestures into the ParticipantMediaHub as
// `inbound:gesture`, so any agent adapter subscribed to the hub sees hand
// gestures as first-class input next to voice and camera frames.
//
// Classification is an L0 (read-tier) operation under the ICM policy engine:
// it only labels what a hand did. Mapping a gesture to a consequential action
// stays behind the existing policy gate (L2 standing policy / L3 approval /
// L4 hard deny) wherever the consuming agent executes it.

import { GestureEngine } from './gesture-engine.js';

export class GestureCapability {
  constructor({ hub, identity, onEvent } = {}) {
    if (!hub) throw new Error('hub_required');
    if (!identity?.wearableId) throw new Error('wearable_identity_required');
    this.hub = hub;
    this.identity = identity;
    this.engine = new GestureEngine({
      onEvent: (event) => {
        this.hub.publishInbound(identity.wearableId, 'gesture', event);
        if (typeof onEvent === 'function') onEvent(event);
      },
    });
  }

  // Ingest one camera frame. hands = array of 0..2 MediaPipe 21-landmark sets.
  // Returns the gesture events produced for this frame.
  ingestFrame({ hands, ts } = {}) {
    return this.engine.ingest(hands ?? [], ts);
  }

  snapshot() { return this.engine.snapshot(); }
}
