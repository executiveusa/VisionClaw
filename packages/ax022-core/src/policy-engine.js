export const RiskTier = Object.freeze({ L0: 0, L1: 1, L2: 2, L3: 3, L4: 4 });

export class PolicyDecision {
  constructor({ allowed, requiresApproval = false, reason, tier }) {
    this.allowed = allowed;
    this.requiresApproval = requiresApproval;
    this.reason = reason;
    this.tier = tier;
  }
}

export class PolicyEngine {
  constructor({ standingL2 = new Set(), denyActions = new Set(), approvalTiers = new Set([RiskTier.L3, RiskTier.L4]) } = {}) {
    this.standingL2 = standingL2;
    this.denyActions = denyActions;
    this.approvalTiers = approvalTiers;
  }

  evaluate(action) {
    const tier = Number(action?.riskTier ?? RiskTier.L1);
    const name = action?.name ?? 'unknown';
    if (this.denyActions.has(name)) {
      return new PolicyDecision({ allowed: false, reason: `Action ${name} is denied`, tier });
    }
    if (tier >= RiskTier.L4) {
      return new PolicyDecision({ allowed: false, requiresApproval: true, reason: 'L4 action requires hard gate', tier });
    }
    if (this.approvalTiers.has(tier)) {
      return new PolicyDecision({ allowed: false, requiresApproval: true, reason: `L${tier} action requires human approval`, tier });
    }
    if (tier === RiskTier.L2 && !this.standingL2.has(name)) {
      return new PolicyDecision({ allowed: false, requiresApproval: true, reason: 'L2 action lacks standing policy', tier });
    }
    return new PolicyDecision({ allowed: true, reason: 'Allowed by AX-022 policy', tier });
  }
}
