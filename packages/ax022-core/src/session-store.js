import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createWearableIdentity } from './identity.js';

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export class SessionStore {
  constructor({ pairingSecret, ttlMs = 8 * 60 * 60 * 1000 }) {
    this.pairingSecret = pairingSecret;
    this.ttlMs = ttlMs;
    this.sessions = new Map();
  }

  create({ pairingSecret, identity }) {
    if (!safeEqual(pairingSecret, this.pairingSecret)) throw new Error('Invalid pairing secret');
    const token = randomBytes(32).toString('base64url');
    const now = Date.now();
    this.sessions.set(token, { identity: createWearableIdentity(identity), createdAt: now, expiresAt: now + this.ttlMs });
    return { token, expiresAt: now + this.ttlMs };
  }

  get(token) {
    const session = this.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt <= Date.now()) { this.sessions.delete(token); return null; }
    return session;
  }

  revoke(token) { return this.sessions.delete(token); }
}
