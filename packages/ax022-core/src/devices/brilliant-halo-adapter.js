import { DeviceAdapter } from '../device-adapter.js';
import { getDeviceProfile } from '../device-catalog.js';

export class BrilliantHaloAdapter extends DeviceAdapter {
  constructor({ ble = null } = {}) {
    super({ id: 'brilliant-halo', capabilities: getDeviceProfile('brilliant-halo') });
    this.ble = ble;
    this.connected = false;
  }

  async _ble() {
    if (this.ble) return this.ble;
    const { BrilliantBle } = await import('brilliant-ble');
    this.ble = new BrilliantBle();
    return this.ble;
  }

  async connect(options = {}) {
    const ble = await this._ble();
    const name = await ble.connect(options);
    this.connected = true;
    return { connected: true, name, type: ble.type };
  }

  async disconnect() {
    if (this.ble?.disconnect) await this.ble.disconnect();
    this.connected = false;
  }

  async sendLua(lua, options = {}) {
    const ble = await this._ble();
    return ble.sendLua(lua, options);
  }

  onRawData(handler) {
    if (!this.ble) throw new Error('Halo not connected');
    this.ble.setDataResponseHandler(handler);
  }

  onPrint(handler) {
    if (!this.ble) throw new Error('Halo not connected');
    this.ble.setPrintResponseHandler(handler);
  }
}
