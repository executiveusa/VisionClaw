import Foundation

@MainActor
protocol ToolBridge: AnyObject {
  var lastToolCallStatus: ToolCallStatus { get set }
  var connectionState: OpenClawConnectionState { get }

  func checkConnection() async
  func resetSession()
  func delegateTask(task: String, toolName: String) async -> ToolResult
}

enum OpenClawConnectionState: Equatable {
  case notConfigured
  case checking
  case connected
  case unreachable(String)
}

@MainActor
class OpenClawBridge: ObservableObject, ToolBridge {
  @Published var lastToolCallStatus: ToolCallStatus = .idle
  @Published var connectionState: OpenClawConnectionState = .notConfigured

  private let session: URLSession
  private let pingSession: URLSession
  private var sessionKey: String
  private var conversationHistory: [[String: String]] = []
  private let maxHistoryTurns = 10

  private static let stableSessionKey = "agent:main:glass"

  init() {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 120
    self.session = URLSession(configuration: config)

    let pingConfig = URLSessionConfiguration.default
    pingConfig.timeoutIntervalForRequest = 5
    self.pingSession = URLSession(configuration: pingConfig)

    self.sessionKey = OpenClawBridge.stableSessionKey
  }

  func checkConnection() async {
    guard GeminiConfig.isOpenClawConfigured else {
      connectionState = .notConfigured
      return
    }
    connectionState = .checking
    guard let url = URL(string: "\(GeminiConfig.openClawHost):\(GeminiConfig.openClawPort)/v1/chat/completions") else {
      connectionState = .unreachable("Invalid URL")
      return
    }
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("Bearer \(GeminiConfig.openClawGatewayToken)", forHTTPHeaderField: "Authorization")
    request.setValue("glass", forHTTPHeaderField: "x-openclaw-message-channel")
    do {
      let (_, response) = try await pingSession.data(for: request)
      if let http = response as? HTTPURLResponse, (200...499).contains(http.statusCode) {
        connectionState = .connected
        NSLog("[OpenClaw] Gateway reachable (HTTP %d)", http.statusCode)
      } else {
        connectionState = .unreachable("Unexpected response")
      }
    } catch {
      connectionState = .unreachable(error.localizedDescription)
      NSLog("[OpenClaw] Gateway unreachable: %@", error.localizedDescription)
    }
  }

  func resetSession() {
    conversationHistory = []
    NSLog("[OpenClaw] Session reset (key retained: %@)", sessionKey)
  }

  func delegateTask(
    task: String,
    toolName: String = "execute"
  ) async -> ToolResult {
    lastToolCallStatus = .executing(toolName)

    guard let url = URL(string: "\(GeminiConfig.openClawHost):\(GeminiConfig.openClawPort)/v1/chat/completions") else {
      lastToolCallStatus = .failed(toolName, "Invalid URL")
      return .failure("Invalid gateway URL")
    }

    conversationHistory.append(["role": "user", "content": task])
    if conversationHistory.count > maxHistoryTurns * 2 {
      conversationHistory = Array(conversationHistory.suffix(maxHistoryTurns * 2))
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(GeminiConfig.openClawGatewayToken)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue(sessionKey, forHTTPHeaderField: "x-openclaw-session-key")
    request.setValue("glass", forHTTPHeaderField: "x-openclaw-message-channel")

    let body: [String: Any] = [
      "model": "openclaw",
      "messages": conversationHistory,
      "stream": false
    ]

    do {
      request.httpBody = try JSONSerialization.data(withJSONObject: body)
      let (data, response) = try await session.data(for: request)
      let httpResponse = response as? HTTPURLResponse

      guard let statusCode = httpResponse?.statusCode, (200...299).contains(statusCode) else {
        let code = httpResponse?.statusCode ?? 0
        lastToolCallStatus = .failed(toolName, "HTTP \(code)")
        return .failure("Agent returned HTTP \(code)")
      }

      if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
         let choices = json["choices"] as? [[String: Any]],
         let first = choices.first,
         let message = first["message"] as? [String: Any],
         let content = message["content"] as? String {
        conversationHistory.append(["role": "assistant", "content": content])
        lastToolCallStatus = .completed(toolName)
        return .success(content)
      }

      let raw = String(data: data, encoding: .utf8) ?? "OK"
      conversationHistory.append(["role": "assistant", "content": raw])
      lastToolCallStatus = .completed(toolName)
      return .success(raw)
    } catch {
      lastToolCallStatus = .failed(toolName, error.localizedDescription)
      return .failure("Agent error: \(error.localizedDescription)")
    }
  }
}

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

  private var baseURL: String {
    SettingsManager.shared.ax022GatewayURL.trimmingCharacters(in: .whitespacesAndNewlines)
      .trimmingCharacters(in: CharacterSet(charactersIn: "/"))
  }

  func checkConnection() async {
    guard SettingsManager.shared.isAx022Configured else {
      connectionState = .notConfigured
      return
    }
    connectionState = .checking
    guard let url = URL(string: baseURL + "/v1/capabilities") else {
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

  func resetSession() {}

  func delegateTask(task: String, toolName: String) async -> ToolResult {
    lastToolCallStatus = .executing(toolName)
    guard let url = URL(string: baseURL + "/v1/intent") else {
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
