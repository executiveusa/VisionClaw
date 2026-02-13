import Foundation
import UIKit

/// Manages walkthrough session lifecycle: start, flag issues, end, persist history.
@MainActor
class SessionManager: ObservableObject {
    @Published var currentSession: WalkthroughSession?
    @Published var isWalkthroughActive: Bool = false
    @Published var lastReport: ReportOutput?

    private let verticalConfig: VerticalConfiguration
    private let storageKey = "oversite_session_history"

    /// The most recent JPEG frame from the glasses camera.
    /// Updated continuously by the video pipeline for snapshot capture.
    var latestFrame: Data?

    init(config: VerticalConfiguration) {
        self.verticalConfig = config
    }

    // MARK: - Walkthrough Lifecycle

    func startWalkthrough() {
        let session = WalkthroughSession(verticalId: verticalConfig.id)
        currentSession = session
        isWalkthroughActive = true
        NSLog("[SessionManager] Started walkthrough: %@", session.id.uuidString)
    }

    func flagIssue(description: String, userTranscript: String) {
        guard isWalkthroughActive else { return }
        let flag = FlaggedIssue(
            description: description,
            frameJPEG: latestFrame,
            userTranscript: userTranscript
        )
        currentSession?.flags.append(flag)
        NSLog("[SessionManager] Flagged issue #%d: %@",
              currentSession?.flags.count ?? 0,
              String(description.prefix(100)))
    }

    func addTranscript(speaker: String, text: String) {
        guard isWalkthroughActive else { return }
        let segment = TranscriptSegment(
            timestamp: Date(),
            speaker: speaker,
            text: text
        )
        currentSession?.transcriptSegments.append(segment)
    }

    func endWalkthrough() async -> ReportOutput? {
        guard isWalkthroughActive, var session = currentSession else { return nil }
        session.endTime = Date()
        currentSession = session
        isWalkthroughActive = false

        NSLog("[SessionManager] Ended walkthrough: %@ (%d flags)",
              session.id.uuidString, session.flags.count)

        // Save to history
        saveSession(session)

        // Generate report
        let report = await verticalConfig.generateReport(from: session)
        lastReport = report
        return report
    }

    // MARK: - Session History

    func getSessionHistory() -> [WalkthroughSession] {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let sessions = try? JSONDecoder().decode([WalkthroughSession].self, from: data) else {
            return []
        }
        return sessions
    }

    func getPastSessionSummaries(limit: Int = 5) -> String {
        let history = getSessionHistory()
            .sorted { $0.startTime > $1.startTime }
            .prefix(limit)

        guard !history.isEmpty else { return "" }

        var summary = "PREVIOUS WALKTHROUGHS:\n"
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short

        for session in history {
            summary += "- \(formatter.string(from: session.startTime)): "
            summary += "\(session.flags.count) issues flagged"
            if !session.flags.isEmpty {
                let descriptions = session.flags.prefix(3).map { $0.description }
                summary += " (\(descriptions.joined(separator: "; ")))"
            }
            summary += "\n"
        }
        return summary
    }

    // MARK: - Private

    private func saveSession(_ session: WalkthroughSession) {
        var history = getSessionHistory()
        history.append(session)
        // Keep last 50 sessions
        if history.count > 50 {
            history = Array(history.suffix(50))
        }
        if let data = try? JSONEncoder().encode(history) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}
