import { AgentAdapter } from './agent-adapter.js';

export class MaxxAgentAdapter extends AgentAdapter {
  constructor({ baseUrl, machineApiKey, fetchImpl = fetch, humanTokenProvider = null }) {
    super('agent-maxx');
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.machineApiKey = machineApiKey;
    this.fetchImpl = fetchImpl;
    this.humanTokenProvider = humanTokenProvider;
  }

  async _machine(path, body) {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-maxx-api-key': this.machineApiKey },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(payload.error ?? `MAXX request failed: ${response.status}`);
    return payload;
  }

  async chat({ message, mode = 'normal' }) {
    const prefix = mode === 'power' ? '[[MAXX_MODE:POWER]]\n' : '';
    return this._machine('/v1/chat', { message: `${prefix}${message}` });
  }

  async createMission({ objective }) {
    return this._machine('/v1/missions', { objective });
  }

  async approve({ approvalId, decision }) {
    if (!this.humanTokenProvider) {
      return { ok: false, blocked: true, reason: 'MAXX machine credentials cannot approve; human session required' };
    }
    const token = await this.humanTokenProvider();
    const action = decision === 'approve' ? 'approve' : 'reject';
    const response = await this.fetchImpl(`${this.baseUrl}/v1/approvals/${encodeURIComponent(approvalId)}/${action}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    });
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, result: body };
  }

  capabilities() {
    return { chat: true, createMission: true, approvalsRequireHumanSession: true };
  }
}
