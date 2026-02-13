import SwiftUI

/// Vertical selection cards shown before starting a session.
/// User picks which AI mode to use for the walkthrough.
struct VerticalPickerView: View {
    @Binding var selectedConfig: any VerticalConfiguration

    private let configs: [any VerticalConfiguration] = [
        ConstructionConfig(),
        GeneralConfig()
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Mode")
                .font(.system(size: 13))
                .foregroundColor(.white.opacity(0.6))

            ForEach(configs.indices, id: \.self) { index in
                let config = configs[index]
                let isSelected = config.id == selectedConfig.id

                Button {
                    selectedConfig = config
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: iconName(for: config.id))
                            .font(.system(size: 18))
                            .foregroundColor(isSelected ? .black : .white)
                            .frame(width: 32, height: 32)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(config.displayName)
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(isSelected ? .black : .white)

                            Text(config.description)
                                .font(.system(size: 12))
                                .foregroundColor(isSelected ? .black.opacity(0.7) : .white.opacity(0.5))
                                .lineLimit(1)
                        }

                        Spacer()

                        if isSelected {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.black.opacity(0.7))
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(isSelected ? Color.white : Color.white.opacity(0.08))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(isSelected ? Color.clear : Color.white.opacity(0.15), lineWidth: 1)
                    )
                }
            }
        }
    }

    private func iconName(for id: String) -> String {
        switch id {
        case "construction": return "hammer.fill"
        case "general": return "sparkles"
        default: return "circle.fill"
        }
    }
}
