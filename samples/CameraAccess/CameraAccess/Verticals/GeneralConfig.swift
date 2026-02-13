import Foundation

/// General-purpose vertical configuration.
/// This is the VisionClaw-compatible default: same system prompt, same single
/// "execute" tool, all calls routed to OpenClaw. No local tool handling.
struct GeneralConfig: VerticalConfiguration {
    let id = "general"
    let displayName = "General Assistant"
    let description = "General-purpose AI assistant with full OpenClaw capabilities."
    let sessionKeyPrefix = "oversite:general"

    var systemPrompt: String {
        GeminiConfig.systemInstruction
    }

    var toolDeclarations: [[String: Any]] {
        ToolDeclarations.allDeclarations()
    }

    func handleToolCall(
        _ call: GeminiFunctionCall,
        sessionManager: SessionManager
    ) async -> ToolResult? {
        // No local handlers -- everything goes to OpenClaw
        return nil
    }
}
