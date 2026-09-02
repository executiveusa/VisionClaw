export class AciToolProvider {
  constructor({ apiKey, client = null, allowedAppsOnly = true }) {
    this.apiKey = apiKey;
    this.client = client;
    this.allowedAppsOnly = allowedAppsOnly;
  }

  async _client() {
    if (this.client) return this.client;
    const { ACI } = await import('@aci-sdk/aci');
    this.client = new ACI({ apiKey: this.apiKey });
    return this.client;
  }

  async search({ intent, limit = 8 }) {
    const client = await this._client();
    return client.functions.search({
      intent,
      allowed_apps_only: this.allowedAppsOnly,
      format: 'basic',
      limit,
      offset: 0,
    });
  }

  async execute({ tool, args, identity }) {
    const client = await this._client();
    const result = await client.functions.execute({
      function_name: tool,
      function_parameters: args,
      linked_account_owner_id: `${identity.tenantId}:${identity.userId}`,
    });
    return { ok: Boolean(result.success), result };
  }
}
