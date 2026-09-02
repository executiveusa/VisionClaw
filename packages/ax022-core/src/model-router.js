export const ModelCapability = Object.freeze({
  LLM: 'llm',
  VLM: 'vlm',
  STT: 'stt',
  TTS: 'tts',
  TRANSLATION: 'translation',
  EMBEDDING: 'embedding',
});

export class ModelRouter {
  constructor() { this.providers = new Map(); }
  register(capability, factory) {
    if (typeof factory !== 'function') throw new TypeError('factory must be a function');
    this.providers.set(capability, factory);
  }
  make(capability, context = {}) {
    const factory = this.providers.get(capability);
    if (!factory) throw new Error(`No model provider registered for ${capability}`);
    return factory(context);
  }
}
