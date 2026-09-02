import { normalizeCapabilities } from './capabilities.js';

const PROFILES = new Map([
  ['brilliant-halo', normalizeCapabilities({
    modelName: 'Brilliant Labs Halo',
    hasCamera: true,
    camera: { video: { canRecord: false, canStream: false }, captureMode: 'photo/optical-sensor' },
    hasDisplay: true,
    display: { isColor: true, canDisplayBitmap: true, resolution: { width: 256, height: 256 } },
    hasMicrophone: true,
    microphone: { count: 2, hasVAD: true },
    hasSpeaker: true,
    speaker: { count: 2, isPrivate: true, route: 'bone-conduction' },
    hasIMU: true,
    imu: { axisCount: 6, hasAccelerometer: true },
    hasButton: true,
    button: { events: ['single_click', 'double_click', 'long_click', 'tap'] },
    hasAudioActivityDetection: true,
    hasPhoto: true,
    hasWifi: false,
  })],
  ['meta-rayban-dat', normalizeCapabilities({
    modelName: 'Meta Ray-Ban (DAT path)',
    hasCamera: true,
    camera: { video: { canRecord: true, canStream: true } },
    hasDisplay: false,
    hasMicrophone: true,
    microphone: { count: 1, hasVAD: true },
    hasSpeaker: false,
    speaker: { route: 'phone-current-visionclaw-path' },
    hasButton: true,
    hasPhoto: true,
    hasVideoStream: true,
  })],
  ['mentra-live', normalizeCapabilities({
    modelName: 'Mentra Live',
    hasCamera: true,
    camera: { video: { canRecord: true, canStream: true } },
    hasDisplay: false,
    hasMicrophone: true,
    microphone: { count: 3, hasVAD: true },
    hasSpeaker: true,
    speaker: { count: 2, isPrivate: false },
    hasButton: true,
    hasWifi: true,
    hasPhoto: true,
    hasVideoStream: true,
  })],
  ['rokid-glasses', normalizeCapabilities({
    modelName: 'Rokid Glasses',
    hasCamera: true,
    camera: { video: { canRecord: true, canStream: true } },
    hasDisplay: true,
    display: { isColor: false, color: 'green', canDisplayBitmap: true, resolution: { width: 480, height: 640 } },
    hasMicrophone: true,
    microphone: { count: 1, hasVAD: true },
    hasSpeaker: true,
    speaker: { count: 2 },
    hasButton: true,
    button: { events: ['tap', 'double_tap', 'swipe_forward', 'swipe_backward'] },
    hasTouch: true,
    hasWifi: true,
    hasPhoto: true,
    hasVideoStream: true,
  })],
]);

export function registerDeviceProfile(id, capabilities) {
  if (!id || typeof id !== 'string') throw new TypeError('device profile id required');
  PROFILES.set(id, normalizeCapabilities(capabilities));
}

export function getDeviceProfile(id) {
  const profile = PROFILES.get(id);
  if (!profile) throw new Error(`Unknown AX-022 device profile: ${id}`);
  return profile;
}

export function listDeviceProfiles() {
  return [...PROFILES.entries()].map(([id, capabilities]) => ({ id, capabilities }));
}
