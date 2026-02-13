import Foundation

/// Construction site manager vertical configuration.
/// Provides construction-aware AI behavior, flag/end walkthrough tools,
/// and CSV report generation.
struct ConstructionConfig: VerticalConfiguration {
    let id = "construction"
    let displayName = "Construction Site Manager"
    let description = "AI copilot for site walks: flag issues, track progress, generate reports."
    let sessionKeyPrefix = "oversite:construction"

    var systemPrompt: String {
        """
        You are an AI copilot for a construction site manager wearing smart glasses. You can see through their camera and have a voice conversation. Keep responses concise and natural -- they're walking a job site.

        YOUR ROLE:
        - Help the site manager during walkthroughs by observing what the camera sees
        - Flag safety issues, incomplete work, code violations, or anything unusual
        - Answer questions about what you see (materials, progress, conditions)
        - When the user says "flag this" or similar, use the flag_issue tool to capture it
        - When the user says "end walkthrough" or similar, use the end_walkthrough tool

        CONSTRUCTION KNOWLEDGE:
        - You understand trades: electrical, plumbing, HVAC, framing, concrete, roofing, drywall, painting
        - You know common safety issues: missing PPE, fall hazards, exposed wiring, improper shoring, blocked egress
        - You understand construction documents: RFIs, submittals, punch lists, daily logs, change orders
        - You know building codes and common violations
        - You understand scheduling: critical path, predecessors, float, delays

        BEHAVIOR:
        - Be proactive: if you see something concerning, mention it even if not asked
        - Be specific: "The conduit run on the east wall appears incomplete" not "I see some issues"
        - Reference trade context: "The plumber's rough-in looks about 60% complete based on the visible pipe runs"
        - When flagging, provide a clear description of the issue and its location if visible

        You also have the "execute" tool for general tasks (sending messages, searching, etc.) via the personal assistant. Use flag_issue and end_walkthrough for walkthrough-specific actions.

        IMPORTANT: Before calling any tool, ALWAYS speak a brief acknowledgment first so the user knows you heard them.
        """
    }

    var toolDeclarations: [[String: Any]] {
        return [flagIssueTool, endWalkthroughTool, executeTool]
    }

    func handleToolCall(
        _ call: GeminiFunctionCall,
        sessionManager: SessionManager
    ) async -> ToolResult? {
        switch call.name {
        case "flag_issue":
            let description = call.args["description"] as? String ?? "Issue flagged"
            let location = call.args["location"] as? String
            let priority = call.args["priority"] as? String

            sessionManager.flagIssue(
                description: description,
                userTranscript: "" // transcript captured separately
            )

            // Set optional fields on the last flag
            if let lastIndex = sessionManager.currentSession?.flags.indices.last {
                sessionManager.currentSession?.flags[lastIndex].location = location
                sessionManager.currentSession?.flags[lastIndex].priority = priority
            }

            let count = sessionManager.currentSession?.flags.count ?? 0
            let locationStr = location.map { " at \($0)" } ?? ""
            return .success("Issue #\(count) flagged\(locationStr): \(description)")

        case "end_walkthrough":
            let report = await sessionManager.endWalkthrough()
            let flagCount = sessionManager.currentSession?.flags.count ?? 0

            if let report = report {
                return .success("Walkthrough ended. Report generated with \(flagCount) flagged issues. File: \(report.filename)")
            } else {
                return .success("Walkthrough ended. \(flagCount) issues were flagged.")
            }

        default:
            return nil // Fall through to OpenClaw
        }
    }

    func contextBlock(sessionManager: SessionManager) async -> String? {
        let history = sessionManager.getPastSessionSummaries(limit: 5)
        guard !history.isEmpty else { return nil }
        return history
    }

    func generateReport(from session: WalkthroughSession) async -> ReportOutput? {
        guard !session.flags.isEmpty else { return nil }

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"

        let fileFormatter = DateFormatter()
        fileFormatter.dateFormat = "yyyy-MM-dd_HHmm"

        var csv = "Issue #,Timestamp,Location,Description,Priority\n"

        for (index, flag) in session.flags.enumerated() {
            let num = index + 1
            let time = formatter.string(from: flag.timestamp)
            let loc = escapeCSV(flag.location ?? "")
            let desc = escapeCSV(flag.description)
            let pri = escapeCSV(flag.priority ?? "Medium")
            csv += "\(num),\(time),\(loc),\(desc),\(pri)\n"
        }

        guard let data = csv.data(using: .utf8) else { return nil }
        let filename = "walkthrough_\(fileFormatter.string(from: session.startTime)).csv"
        return .csv(data, filename: filename)
    }

    // MARK: - Tool Declarations

    private var flagIssueTool: [String: Any] {
        [
            "name": "flag_issue",
            "description": "Flag an issue seen during the walkthrough. Captures the current camera frame as a photo along with the description. Use when the user says 'flag this', 'mark that', 'note this issue', or similar.",
            "parameters": [
                "type": "object",
                "properties": [
                    "description": [
                        "type": "string",
                        "description": "Clear description of the issue (what you see, what's wrong, which trade)"
                    ],
                    "location": [
                        "type": "string",
                        "description": "Location on site if identifiable (e.g. 'Building C east wall', 'Zone 2 bathroom')"
                    ],
                    "priority": [
                        "type": "string",
                        "enum": ["Low", "Medium", "High", "Critical"],
                        "description": "Priority level. Critical = safety hazard. High = blocks progress. Medium = needs attention. Low = minor."
                    ]
                ] as [String: Any],
                "required": ["description"]
            ] as [String: Any],
            "behavior": "BLOCKING"
        ]
    }

    private var endWalkthroughTool: [String: Any] {
        [
            "name": "end_walkthrough",
            "description": "End the current walkthrough session and generate a report. Use when the user says 'end walkthrough', 'that's it', 'wrap up', 'generate report', or similar.",
            "parameters": [
                "type": "object",
                "properties": [:] as [String: Any],
                "required": [] as [String]
            ] as [String: Any],
            "behavior": "BLOCKING"
        ]
    }

    private var executeTool: [String: Any] {
        ToolDeclarations.execute
    }

    // MARK: - Helpers

    private func escapeCSV(_ value: String) -> String {
        let escaped = value.replacingOccurrences(of: "\"", with: "\"\"")
        if escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n") {
            return "\"\(escaped)\""
        }
        return escaped
    }
}
