import SwiftUI

struct SettingsView: View {
  @Environment(\.dismiss) private var dismiss
  private let settings = SettingsManager.shared

  @State private var geminiAPIKey: String = ""
  @State private var ax022GatewayURL: String = ""
  @State private var ax022SessionToken: String = ""
  @State private var openClawHost: String = ""
  @State private var openClawPort: String = ""
  @State private var openClawHookToken: String = ""
  @State private var openClawGatewayToken: String = ""
  @State private var geminiSystemPrompt: String = ""
  @State private var webrtcSignalingURL: String = ""
  @State private var speakerOutputEnabled: Bool = false
  @State private var videoStreamingEnabled: Bool = true
  @State private var proactiveNotificationsEnabled: Bool = true
  @State private var showResetConfirmation = false

  var body: some View {
    NavigationView {
      Form {
        Section(header: Text("Gemini API")) {
          VStack(alignment: .leading, spacing: 4) {
            Text("API Key").font(.caption).foregroundColor(.secondary)
            TextField("Enter Gemini API key", text: $geminiAPIKey)
              .autocapitalization(.none)
              .disableAutocorrection(true)
              .font(.system(.body, design: .monospaced))
          }
        }

        Section(header: Text("System Prompt"), footer: Text("Changes take effect on the next Gemini session.")) {
          TextEditor(text: $geminiSystemPrompt)
            .font(.system(.body, design: .monospaced))
            .frame(minHeight: 200)
        }

        Section(header: Text("AX-022 Agent Gateway"), footer: Text("When configured, tool calls route through AX-022 to the tenant agent. The phone stores only the scoped wearable session token; Agent MAXX/Hermes credentials remain server-side.")) {
          VStack(alignment: .leading, spacing: 4) {
            Text("Gateway URL").font(.caption).foregroundColor(.secondary)
            TextField("https://ax022.example.com", text: $ax022GatewayURL)
              .autocapitalization(.none)
              .disableAutocorrection(true)
              .keyboardType(.URL)
              .font(.system(.body, design: .monospaced))
          }
          VStack(alignment: .leading, spacing: 4) {
            Text("Wearable Session Token").font(.caption).foregroundColor(.secondary)
            SecureField("Short-lived AX-022 token", text: $ax022SessionToken)
              .font(.system(.body, design: .monospaced))
          }
        }

        Section(header: Text("OpenClaw (legacy/fallback)"), footer: Text("Used when AX-022 is not configured.")) {
          VStack(alignment: .leading, spacing: 4) {
            Text("Host").font(.caption).foregroundColor(.secondary)
            TextField("http://your-mac.local", text: $openClawHost)
              .autocapitalization(.none)
              .disableAutocorrection(true)
              .keyboardType(.URL)
              .font(.system(.body, design: .monospaced))
          }
          VStack(alignment: .leading, spacing: 4) {
            Text("Port").font(.caption).foregroundColor(.secondary)
            TextField("18789", text: $openClawPort)
              .keyboardType(.numberPad)
              .font(.system(.body, design: .monospaced))
          }
          VStack(alignment: .leading, spacing: 4) {
            Text("Hook Token").font(.caption).foregroundColor(.secondary)
            TextField("Hook token", text: $openClawHookToken)
              .autocapitalization(.none)
              .disableAutocorrection(true)
              .font(.system(.body, design: .monospaced))
          }
          VStack(alignment: .leading, spacing: 4) {
            Text("Gateway Token").font(.caption).foregroundColor(.secondary)
            SecureField("Gateway auth token", text: $openClawGatewayToken)
              .font(.system(.body, design: .monospaced))
          }
        }

        Section(header: Text("WebRTC")) {
          VStack(alignment: .leading, spacing: 4) {
            Text("Signaling URL").font(.caption).foregroundColor(.secondary)
            TextField("wss://your-server.example.com", text: $webrtcSignalingURL)
              .autocapitalization(.none)
              .disableAutocorrection(true)
              .keyboardType(.URL)
              .font(.system(.body, design: .monospaced))
          }
        }

        Section(header: Text("Audio"), footer: Text("Route output to the iPhone speaker instead of glasses for demos.")) {
          Toggle("Speaker Output", isOn: $speakerOutputEnabled)
        }

        Section(header: Text("Video"), footer: Text("Disable video streaming to save battery. Audio remains active.")) {
          Toggle("Video Streaming", isOn: $videoStreamingEnabled)
        }

        Section(header: Text("Notifications"), footer: Text("OpenClaw proactive notifications are active only when the legacy provider is selected.")) {
          Toggle("Proactive Notifications", isOn: $proactiveNotificationsEnabled)
        }

        Section {
          Button("Reset to Defaults") { showResetConfirmation = true }
            .foregroundColor(.red)
        }
      }
      .navigationTitle("Settings")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button("Cancel") { dismiss() }
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          Button("Save") {
            save()
            dismiss()
          }
          .fontWeight(.semibold)
        }
      }
      .alert("Reset Settings", isPresented: $showResetConfirmation) {
        Button("Reset", role: .destructive) {
          settings.resetAll()
          loadCurrentValues()
        }
        Button("Cancel", role: .cancel) {}
      } message: {
        Text("This will reset all settings to the values built into the app.")
      }
      .onAppear { loadCurrentValues() }
    }
  }

  private func loadCurrentValues() {
    geminiAPIKey = settings.geminiAPIKey
    geminiSystemPrompt = settings.geminiSystemPrompt
    ax022GatewayURL = settings.ax022GatewayURL
    ax022SessionToken = settings.ax022SessionToken
    openClawHost = settings.openClawHost
    openClawPort = String(settings.openClawPort)
    openClawHookToken = settings.openClawHookToken
    openClawGatewayToken = settings.openClawGatewayToken
    webrtcSignalingURL = settings.webrtcSignalingURL
    speakerOutputEnabled = settings.speakerOutputEnabled
    videoStreamingEnabled = settings.videoStreamingEnabled
    proactiveNotificationsEnabled = settings.proactiveNotificationsEnabled
  }

  private func save() {
    geminiAPIKey = geminiAPIKey.trimmingCharacters(in: .whitespacesAndNewlines)
    settings.geminiAPIKey = geminiAPIKey
    settings.geminiSystemPrompt = geminiSystemPrompt.trimmingCharacters(in: .whitespacesAndNewlines)
    settings.ax022GatewayURL = ax022GatewayURL.trimmingCharacters(in: .whitespacesAndNewlines).trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    settings.ax022SessionToken = ax022SessionToken.trimmingCharacters(in: .whitespacesAndNewlines)
    settings.openClawHost = openClawHost.trimmingCharacters(in: .whitespacesAndNewlines)
    if let port = Int(openClawPort.trimmingCharacters(in: .whitespacesAndNewlines)) {
      settings.openClawPort = port
    }
    settings.openClawHookToken = openClawHookToken.trimmingCharacters(in: .whitespacesAndNewlines)
    settings.openClawGatewayToken = openClawGatewayToken.trimmingCharacters(in: .whitespacesAndNewlines)
    settings.webrtcSignalingURL = webrtcSignalingURL.trimmingCharacters(in: .whitespacesAndNewlines)
    settings.speakerOutputEnabled = speakerOutputEnabled
    settings.videoStreamingEnabled = videoStreamingEnabled
    settings.proactiveNotificationsEnabled = proactiveNotificationsEnabled
  }
}
