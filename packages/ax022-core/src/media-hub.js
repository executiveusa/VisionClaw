import { EventEmitter } from 'node:events';

// Participant-scoped hub inspired by NVIDIA XR AI's one-hub/many-clients model.
// It deliberately routes return traffic only to the originating participant.
export class ParticipantMediaHub {
  constructor() {
    this.events = new EventEmitter();
    this.participants = new Map();
  }

  join(identity) {
    this.participants.set(identity.wearableId, identity);
    this.events.emit('participant', { joined: true, participantId: identity.wearableId, identity });
  }

  leave(participantId) {
    const identity = this.participants.get(participantId);
    this.participants.delete(participantId);
    this.events.emit('participant', { joined: false, participantId, identity });
  }

  onInbound(kind, handler) {
    this.events.on(`inbound:${kind}`, handler);
    return () => this.events.off(`inbound:${kind}`, handler);
  }

  publishInbound(participantId, kind, payload) {
    const identity = this.participants.get(participantId);
    if (!identity) throw new Error(`Unknown participant ${participantId}`);
    this.events.emit(`inbound:${kind}`, { participantId, identity, payload });
  }

  onReturn(participantId, handler) {
    const topic = `return:${participantId}`;
    this.events.on(topic, handler);
    return () => this.events.off(topic, handler);
  }

  returnToOrigin(participantId, payload) {
    if (!this.participants.has(participantId)) throw new Error(`Unknown participant ${participantId}`);
    this.events.emit(`return:${participantId}`, payload);
  }
}
