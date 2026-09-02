export const DeviceCapability = Object.freeze({
  CAMERA: 'camera',
  MICROPHONE: 'microphone',
  SPEAKER: 'speaker',
  DISPLAY: 'display',
  IMU: 'imu',
  BUTTON: 'button',
  TOUCH: 'touch',
  WIFI: 'wifi',
  AUDIO_ACTIVITY: 'audio_activity',
  PHOTO: 'photo',
  VIDEO_STREAM: 'video_stream',
});

export function normalizeCapabilities(input = {}) {
  const camera = input.camera ?? null;
  const display = input.display ?? null;
  const microphone = input.microphone ?? null;
  const speaker = input.speaker ?? null;
  const imu = input.imu ?? null;
  const button = input.button ?? null;

  return Object.freeze({
    modelName: input.modelName ?? 'Unknown',
    hasCamera: Boolean(input.hasCamera ?? camera),
    camera,
    hasDisplay: Boolean(input.hasDisplay ?? display),
    display,
    hasMicrophone: Boolean(input.hasMicrophone ?? microphone),
    microphone,
    hasSpeaker: Boolean(input.hasSpeaker ?? speaker),
    speaker,
    hasIMU: Boolean(input.hasIMU ?? imu),
    imu,
    hasButton: Boolean(input.hasButton ?? button),
    button,
    hasTouch: Boolean(input.hasTouch),
    hasWifi: Boolean(input.hasWifi),
    hasAudioActivityDetection: Boolean(input.hasAudioActivityDetection ?? microphone?.hasVAD),
    hasPhoto: Boolean(input.hasPhoto ?? input.hasCamera ?? camera),
    hasVideoStream: Boolean(input.hasVideoStream ?? camera?.video?.canStream),
    raw: input.raw ?? {},
  });
}

export function supports(capabilities, capability) {
  switch (capability) {
    case DeviceCapability.CAMERA: return capabilities.hasCamera;
    case DeviceCapability.MICROPHONE: return capabilities.hasMicrophone;
    case DeviceCapability.SPEAKER: return capabilities.hasSpeaker;
    case DeviceCapability.DISPLAY: return capabilities.hasDisplay;
    case DeviceCapability.IMU: return capabilities.hasIMU;
    case DeviceCapability.BUTTON: return capabilities.hasButton;
    case DeviceCapability.TOUCH: return capabilities.hasTouch;
    case DeviceCapability.WIFI: return capabilities.hasWifi;
    case DeviceCapability.AUDIO_ACTIVITY: return capabilities.hasAudioActivityDetection;
    case DeviceCapability.PHOTO: return capabilities.hasPhoto;
    case DeviceCapability.VIDEO_STREAM: return capabilities.hasVideoStream;
    default: return false;
  }
}
