import Foundation

/// A single flagged issue captured during a walkthrough.
struct FlaggedIssue: Codable, Identifiable {
    let id: UUID
    let timestamp: Date
    let description: String
    let frameJPEG: Data?
    let userTranscript: String
    var location: String?
    var priority: String?

    init(
        description: String,
        frameJPEG: Data?,
        userTranscript: String,
        location: String? = nil,
        priority: String? = nil
    ) {
        self.id = UUID()
        self.timestamp = Date()
        self.description = description
        self.frameJPEG = frameJPEG
        self.userTranscript = userTranscript
        self.location = location
        self.priority = priority
    }
}

/// A transcript segment captured during a walkthrough.
struct TranscriptSegment: Codable {
    let timestamp: Date
    let speaker: String  // "user" or "ai"
    let text: String
}

/// A complete walkthrough session with all captured data.
struct WalkthroughSession: Codable, Identifiable {
    let id: UUID
    let startTime: Date
    var endTime: Date?
    let verticalId: String
    var flags: [FlaggedIssue]
    var transcriptSegments: [TranscriptSegment]
    var metadata: [String: String]

    init(verticalId: String) {
        self.id = UUID()
        self.startTime = Date()
        self.endTime = nil
        self.verticalId = verticalId
        self.flags = []
        self.transcriptSegments = []
        self.metadata = [:]
    }
}

/// Output format for generated reports.
enum ReportOutput {
    case csv(Data, filename: String)
    case json(Data, filename: String)

    var data: Data {
        switch self {
        case .csv(let data, _): return data
        case .json(let data, _): return data
        }
    }

    var filename: String {
        switch self {
        case .csv(_, let name): return name
        case .json(_, let name): return name
        }
    }
}
