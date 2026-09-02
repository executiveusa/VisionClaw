const DEFAULT_DENY = new Set(['exec','spawn','shell','fs_write','fs_delete','fs_move','apply_patch','sessions_spawn','sessions_send','cron','gateway','nodes']);

export class OpenClawToolProvider {
  constructor({ baseUrl, token, fetchImpl = fetch, allowTools = [] }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
    this.fetchImpl = fetchImpl;
    this.allowTools = new Set(allowTools);
  }

  async execute({ tool, args = {}, identity }) {
    if (DEFAULT_DENY.has(tool) && !this.allowTools.has(tool)) {
      return { ok: false, blocked: true, reason: `OpenClaw tool ${tool} is blocked by AX-022 default policy` };
    }
    const response = await this.fetchImpl(`${this.baseUrl}/tools/invoke`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${this.token}`,
        'x-openclaw-message-channel': 'ax022',
        'x-openclaw-account-id': identity.tenantId,
      },
      body: JSON.stringify({ tool, args, sessionKey: `ax022:${identity.tenantId}:${identity.userId}` }),
    });
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok && body.ok !== false, status: response.status, result: body };
  }
}
