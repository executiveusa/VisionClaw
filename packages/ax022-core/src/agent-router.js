export class AgentRouter {
  constructor() { this.adapters = new Map(); this.tenants = new Map(); }
  registerAdapter(id, adapter) { this.adapters.set(id, adapter); }
  registerTenant(tenantId, config) { this.tenants.set(tenantId, { ...config }); }
  resolve(identity) {
    const tenant = this.tenants.get(identity.tenantId);
    if (!tenant) throw new Error(`Unknown tenant ${identity.tenantId}`);
    const adapter = this.adapters.get(tenant.agentAdapter);
    if (!adapter) throw new Error(`Unknown agent adapter ${tenant.agentAdapter}`);
    return { tenant, adapter };
  }
  async chat(identity, message, options = {}) {
    const { adapter } = this.resolve(identity);
    return adapter.chat({ message, identity, ...options });
  }
}
