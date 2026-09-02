import Foundation

@MainActor
protocol ToolBridge: AnyObject {
  var lastToolCallStatus: ToolCallStatus { get set }
  var connectionState: OpenClawConnectionState { get }

  func checkConnection() async
  func resetSession()
  func delegateTask(task: String, toolName: String) async -> ToolResult
}
