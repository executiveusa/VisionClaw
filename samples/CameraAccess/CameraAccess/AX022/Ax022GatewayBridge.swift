import Foundation

@MainActor
final class Ax022GatewayBridge: ObservableObject, ToolBridge {
  @Published var lastToolCallStatus: ToolCallStatus = .idle
  @Published var connectionState: OpenClawConnectionState = .notConfigured

  private let session: URLSession

  init() {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 120
    self.session = URLSession(configuration: config)
  }

  func checkConnection() async {
    guard SettingsManager.shared.isAx022Configured else {
      connectionState = .notConfigured
      return
    }
    connectionState = .checking
    guard let url = URL(string: SettingsManager.shared.ax022GatewayURL.trimmingCharacters(in: CharacterSet(charactersIn: "/")) + "/v1/capabilities") else {
      connectionState = .unreachable("Invalid AX-022 URL")
      return
    }
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("Bearer \(SettingsManager.shared.ax022SessionToken)", forHTTPHeaderField: "Authorization")
    do {
      let (_, response) = try await session.data(for: request)
      if let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) {
        connectionState = .connected
      } else {
        let code = (response as? HTTPURLResponse)?.statusCode ?? 0
        connectionState = .unreachable("AX-022 HTTP \(code)")
      }
    } catch {
      connectionState = .unreachable(error.localizedDescription)
    }
  }

  func resetSession() {
    // The scoped AX-022 bearer token identifies the wearable session server-side.
  }

  func delegateTask(task: String, toolName: String) async -> ToolResult {
    lastToolCallStatus = .executing(toolName)
    let base = SettingsManager.shared.ax022GatewayURL.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    guard let url = URL(string: base + "/v1/intent") else {
      lastToolCallStatus = .failed(toolName, "Invalid AX-022 URL")
      return .failure("Invalid AX-022 gateway URL")
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(SettingsManager.shared.ax022SessionToken)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    do {
      request.httpBody = try JSONSerialization.data(withJSONObject: ["message": task])
      let (data, response) = try await session.data(for: request)
      let code = (response as? HTTPURLResponse)?.statusCode ?? 0
      guard (200...299).contains(code) else {
        lastToolCallStatus = .failed(toolName, "HTTP \(code)")
        return .failure("AX-022 returned HTTP \(code)")
      }

      if let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
         let result = payload["result"] {
        let spoken: String
        if let resultDict = result as? [String: Any] {
          spoken = (resultDict["response"] as? String)
            ?? (resultDict["text"] as? String)
            ?? String(data: try JSONSerialization.data(withJSONObject: resultDict), encoding: .utf8)
            ?? "Done"
        } else if let resultString = result as? String {
          spoken = resultString
        } else {
          spoken = String(describing: result)
        }
        lastToolCallStatus = .completed(toolName)
        return .success(spoken)
      }

      let raw = String(data: data, encoding: .utf8) ?? "Done"
      lastToolCallStatus = .completed(toolName)
      return .success(raw)
    } catch {
      lastToolCallStatus = .failed(toolName, error.localizedDescription)
      return .failure("AX-022 agent error: \(error.localizedDescription)")
    }
  }
}
