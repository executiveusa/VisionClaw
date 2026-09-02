export class AgentAdapter {
  constructor(id) { this.id = id; }
  async chat(_input) { throw new Error('chat() not implemented'); }
  async createMission(_input) { throw new Error('createMission() not implemented'); }
  async approve(_input) { throw new Error('approve() not implemented'); }
  capabilities() { return {}; }
}
