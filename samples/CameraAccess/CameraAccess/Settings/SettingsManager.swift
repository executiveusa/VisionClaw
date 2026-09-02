import Foundation

final class SettingsManager {
  static let shared = SettingsManager()

  private let defaults = UserDefaults.standard

  private enum Key: String {
    case geminiAPIKey
    case ax022GatewayURL
    case ax022SessionToken
    case openClawHost
    case openClawPort
    case openClawHookToken
    case openClawGatewayToken
    case geminiSystemPrompt
    case webrtcSignalingURL
    case speakerOutputEnabled
    case videoStreamingEnabled
    case proactiveNotificationsEnabled
  }

  private init() {}

  var geminiAPIKey: String {
    get { defaults.string(forKey: Key.geminiAPIKey.rawValue) ?? Secrets.geminiAPIKey }
    set { defaults.set(newValue, forKey: Key.geminiAPIKey.rawValue) }
  }

  var geminiSystemPrompt: String {
    get { defaults.string(forKey: Key.geminiSystemPrompt.rawValue) ?? GeminiConfig.defaultSystemInstruction }
    set { defaults.set(newValue, forKey: Key.geminiSystemPrompt.rawValue) }
  }

  // MARK: - AX-022

  var ax022GatewayURL: String {
    get { defaults.string(forKey: Key.ax022GatewayURL.rawValue) ?? "" }
    set { defaults.set(newValue, forKey: Key.ax022GatewayURL.rawValue) }
  }

  var ax022SessionToken: String {
    get { defaults.string(forKey: Key.ax022SessionToken.rawValue) ?? "" }
    set { defaults.set(newValue, forKey: Key.ax022SessionToken.rawValue) }
  }

  var isAx022Configured: Bool {
    !ax022GatewayURL.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
    !ax022SessionToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }

  // MARK: - OpenClaw

  var openClawHost: String {
    get { defaults.string(forKey: Key.openClawHost.rawValue) ?? Secrets.openClawHost }
    set { defaults.set(newValue, forKey: Key.openClawHost.rawValue) }
  }

  var openClawPort: Int {
    get {
      let stored = defaults.integer(forKey: Key.openClawPort.rawValue)
      return stored != 0 ? stored : Secrets.openClawPort
    }
    set { defaults.set(newValue, forKey: Key.openClawPort.rawValue) }
  }

  var openClawHookToken: String {
    get { defaults.string(forKey: Key.openClawHookToken.rawValue) ?? Secrets.openClawHookToken }
    set { defaults.set(newValue, forKey: Key.openClawHookToken.rawValue) }
  }

  var openClawGatewayToken: String {
    get { defaults.string(forKey: Key.openClawGatewayToken.rawValue) ?? Secrets.openClawGatewayToken }
    set { defaults.set(newValue, forKey: Key.openClawGatewayToken.rawValue) }
  }

  var webrtcSignalingURL: String {
    get { defaults.string(forKey: Key.webrtcSignalingURL.rawValue) ?? Secrets.webrtcSignalingURL }
    set { defaults.set(newValue, forKey: Key.webrtcSignalingURL.rawValue) }
  }

  var speakerOutputEnabled: Bool {
    get { defaults.bool(forKey: Key.speakerOutputEnabled.rawValue) }
    set { defaults.set(newValue, forKey: Key.speakerOutputEnabled.rawValue) }
  }

  var videoStreamingEnabled: Bool {
    get { defaults.object(forKey: Key.videoStreamingEnabled.rawValue) as? Bool ?? true }
    set { defaults.set(newValue, forKey: Key.videoStreamingEnabled.rawValue) }
  }

  var proactiveNotificationsEnabled: Bool {
    get { defaults.object(forKey: Key.proactiveNotificationsEnabled.rawValue) as? Bool ?? true }
    set { defaults.set(newValue, forKey: Key.proactiveNotificationsEnabled.rawValue) }
  }

  func resetAll() {
    for key in [Key.geminiAPIKey, .geminiSystemPrompt, .ax022GatewayURL, .ax022SessionToken,
                .openClawHost, .openClawPort, .openClawHookToken, .openClawGatewayToken,
                .webrtcSignalingURL, .speakerOutputEnabled, .videoStreamingEnabled,
                .proactiveNotificationsEnabled] {
      defaults.removeObject(forKey: key.rawValue)
    }
  }
}
