export function createWearableIdentity(input) {
  const required = ['wearableId', 'userId', 'tenantId', 'agentId', 'deviceProfile'];
  for (const field of required) {
    if (!input?.[field] || typeof input[field] !== 'string') throw new TypeError(`${field} is required`);
  }
  return Object.freeze({
    wearableId: input.wearableId,
    userId: input.userId,
    tenantId: input.tenantId,
    agentId: input.agentId,
    deviceProfile: input.deviceProfile,
    policyId: input.policyId ?? 'default',
    roles: Object.freeze([...(input.roles ?? [])]),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
