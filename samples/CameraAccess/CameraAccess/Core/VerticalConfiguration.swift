import Foundation

/// Protocol defining a pluggable vertical configuration.
/// Each vertical (construction, electrical, plumbing, etc.) implements this
/// to provide domain-specific behavior on the shared platform.
protocol VerticalConfiguration {
    /// Unique identifier for this vertical (e.g. "construction", "electrical")
    var id: String { get }

    /// Display name shown in the UI (e.g. "Construction Site Manager")
    var displayName: String { get }

    /// Short description for the vertical picker
    var description: String { get }

    /// Full Gemini system instruction for this vertical.
    /// This defines the AI's personality, knowledge domain, and behavior.
    var systemPrompt: String { get }

    /// Gemini tool declarations (function schemas) for this vertical.
    /// Includes both local tools and the OpenClaw "execute" fallback.
    var toolDeclarations: [[String: Any]] { get }

    /// Session key prefix for OpenClaw sessions (e.g. "oversite:construction")
    var sessionKeyPrefix: String { get }

    /// Handle a tool call locally. Return nil to fall through to OpenClaw.
    /// This is where vertical-specific actions (flag_issue, end_walkthrough) are handled.
    @MainActor
    func handleToolCall(
        _ call: GeminiFunctionCall,
        sessionManager: SessionManager
    ) async -> ToolResult?

    /// Context block injected into the system prompt before a session starts.
    /// Contains project data, schedules, previous walkthrough summaries, etc.
    @MainActor
    func contextBlock(sessionManager: SessionManager) async -> String?

    /// Generate a report from the completed walkthrough session.
    func generateReport(from session: WalkthroughSession) async -> ReportOutput?
}

/// Default implementations for optional methods
extension VerticalConfiguration {
    @MainActor
    func contextBlock(sessionManager: SessionManager) async -> String? {
        return nil
    }

    func generateReport(from session: WalkthroughSession) async -> ReportOutput? {
        return nil
    }
}
