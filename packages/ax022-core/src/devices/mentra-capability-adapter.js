import { normalizeCapabilities } from '../capabilities.js';

// Accepts a MentraOS-style Capabilities object and normalizes it into AX-022.
export function fromMentraCapabilities(capabilities) {
  return normalizeCapabilities({
    modelName: capabilities.modelName,
    hasCamera: capabilities.hasCamera,
    camera: capabilities.camera,
    hasDisplay: capabilities.hasDisplay,
    display: capabilities.display,
    hasMicrophone: capabilities.hasMicrophone,
    microphone: capabilities.microphone,
    hasSpeaker: capabilities.hasSpeaker,
    speaker: capabilities.speaker,
    hasIMU: capabilities.hasIMU,
    imu: capabilities.imu,
    hasButton: capabilities.hasButton,
    button: capabilities.button,
    hasWifi: capabilities.hasWifi,
    raw: capabilities,
  });
}
