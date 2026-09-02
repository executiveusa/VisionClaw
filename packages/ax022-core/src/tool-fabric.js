import { RiskTier } from './policy-engine.js';

export class ToolFabric {
  constructor({ policyEngine }) {
    this.policyEngine = policyEngine;
    this.providers = new Map();
  }

  register(name, provider) { this.providers.set(name, provider); }

  async search({ provider = 'aci', intent, identity, limit = 8 }) {
    const target = this.providers.get(provider);
    if (!target?.search) throw new Error(`Tool provider ${provider} does not support search`);
    return target.search({ intent, identity, limit });
  }

  async execute({ provider, tool, args = {}, identity, riskTier = RiskTier.L2, approvalEnvelope = null }) {
    const target = this.providers.get(provider);
    if (!target?.execute) throw new Error(`Tool provider ${provider} does not support execute`);
    const decision = this.policyEngine.evaluate({ name: `${provider}:${tool}`, riskTier });
    if (!decision.allowed) {
      const verifiedApproval =
        decision.requiresApproval &&
        approvalEnvelope?.approved === true &&
        approvalEnvelope?.verified === true &&
        typeof approvalEnvelope?.approvalId === 'string' &&
        approvalEnvelope.approvalId.length > 0;

      if (verifiedApproval) {
        return target.execute({ tool, args, identity, approvalEnvelope });
      }
      return { ok: false, blocked: true, decision };
    }
    return target.execute({ tool, args, identity });
  }
}
