export class DeviceAdapter {
  constructor({ id, capabilities }) {
    if (new.target === DeviceAdapter) throw new TypeError('DeviceAdapter is abstract');
    this.id = id;
    this.capabilities = capabilities;
  }

  async connect() { throw new Error('connect() not implemented'); }
  async disconnect() { throw new Error('disconnect() not implemented'); }
  async capturePhoto() { throw new Error('capturePhoto() not implemented'); }
  async renderHud(_payload) { throw new Error('renderHud() not implemented'); }
  async playAudio(_audio) { throw new Error('playAudio() not implemented'); }
  onAudio(_handler) { throw new Error('onAudio() not implemented'); }
  onGesture(_handler) { throw new Error('onGesture() not implemented'); }
}
