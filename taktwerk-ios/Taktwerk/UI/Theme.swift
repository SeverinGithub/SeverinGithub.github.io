import SwiftUI

// Look der Web-Fassung: eloxiertes Schiefer-Gehäuse, jede Kit-Sektion in ihrer Farbe.

extension Color {
    init(hex: UInt32, _ a: Double = 1) {
        self.init(.sRGB, red: Double((hex >> 16) & 255) / 255, green: Double((hex >> 8) & 255) / 255, blue: Double(hex & 255) / 255, opacity: a)
    }
    static let ground = Color(hex: 0x0b0d12)
    static let body = Color(hex: 0x1a1e26)
    static let panel = Color(hex: 0x11141a)
    static let line = Color(hex: 0x2a303b)
    static let ink = Color(hex: 0xe8ebf1)
    static let muted = Color(hex: 0x8b93a5)
    static let dim = Color(hex: 0x555d6e)
    static let lcdBg = Color(hex: 0x0a0c10)
    static let amber = Color(hex: 0xffd6a8)
    static let dark = Color(hex: 0x14161c)
    static let pA = Color(hex: 0xff7a59), pB = Color(hex: 0xffb547), pV = Color(hex: 0x4fd1a5), pFill = Color(hex: 0xc58cff), pBrk = Color(hex: 0xf472b6), pIntro = Color(hex: 0x7aa2ff)
}

extension PartKey { var color: Color { Color(hex: hex) } }

extension Font {
    static func display(_ s: CGFloat) -> Font { .system(size: s, weight: .heavy, design: .rounded) }
    static func ui(_ s: CGFloat, _ w: Font.Weight = .semibold) -> Font { .system(size: s, weight: w) }
    static func mono(_ s: CGFloat, _ w: Font.Weight = .regular) -> Font { .system(size: s, weight: w, design: .monospaced) }
}

/// Mischung wie color-mix() im CSS
func mix(_ a: UInt32, _ b: UInt32, _ t: Double) -> Color {
    func c(_ h: UInt32, _ s: UInt32) -> Double { Double((h >> s) & 255) / 255 }
    let t = max(0, min(1, t))
    return Color(.sRGB, red: c(a, 16) * t + c(b, 16) * (1 - t), green: c(a, 8) * t + c(b, 8) * (1 - t), blue: c(a, 0) * t + c(b, 0) * (1 - t))
}

/// Kleine Überschrift in Versalien, optional mit Knopf rechts
struct SectionLabel<Trailing: View>: View {
    let text: String
    @ViewBuilder var trailing: () -> Trailing
    init(_ text: String, @ViewBuilder trailing: @escaping () -> Trailing = { EmptyView() }) { self.text = text; self.trailing = trailing }
    var body: some View {
        HStack {
            Text(text.uppercased()).font(.mono(10)).tracking(1.6).foregroundStyle(Color.dim)
            Spacer(minLength: 4)
            trailing()
        }
    }
}

struct MiniButton: View {
    let title: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title.uppercased()).font(.mono(10, .semibold)).tracking(1).foregroundStyle(Color.muted)
                .padding(.horizontal, 7).padding(.vertical, 4)
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.line))
        }.buttonStyle(.plain)
    }
}

enum BtnKind { case normal, primary, danger, armed }
struct PanelButtonStyle: ButtonStyle {
    var kind: BtnKind = .normal
    var height: CGFloat = 40
    var wide = false
    func makeBody(configuration: Configuration) -> some View {
        let fg: Color = kind == .primary ? Color(hex: 0x10241c) : kind == .danger ? .pBrk : kind == .armed ? Color(hex: 0x2a0f1d) : .ink
        let bg: Color = kind == .primary ? .pV : kind == .armed ? .pBrk : .panel
        configuration.label
            .font(.ui(13)).foregroundStyle(fg)
            .padding(.horizontal, 12).frame(maxWidth: wide ? .infinity : nil).frame(height: height)
            .background(RoundedRectangle(cornerRadius: 10).fill(bg))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(kind == .primary ? Color.pV : kind == .armed ? Color.pBrk : Color.line))
            .opacity(configuration.isPressed ? 0.75 : 1)
    }
}

/// Großer Play-Knopf mit Kante wie ein Hardware-Taster
struct PlayButton: View {
    let playing: Bool
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Image(systemName: playing ? "stop.fill" : "play.fill").font(.system(size: 19, weight: .bold)).foregroundStyle(Color.body)
                .frame(width: 56, height: 48)
        }
        .buttonStyle(HardKeyStyle())
        .accessibilityLabel(playing ? "Stoppen" : "Abspielen")
    }
}
struct HardKeyStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.pA))
            .background(RoundedRectangle(cornerRadius: 12).fill(Color(hex: 0xb8452b)).offset(y: configuration.isPressed ? 2 : 4))
            .offset(y: configuration.isPressed ? 2 : 0)
    }
}

/// Display-Kasten (LCD)
struct LCD<Content: View>: View {
    @ViewBuilder var content: () -> Content
    var body: some View {
        HStack(spacing: 10) { content() }
            .padding(.horizontal, 12).frame(height: 48)
            .background(RoundedRectangle(cornerRadius: 10).fill(Color.lcdBg))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
    }
}
struct LCDField: View {
    let label: String
    let value: String
    var color: Color = .ink
    var minWidth: CGFloat = 0
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label.uppercased()).font(.mono(9)).tracking(1.4).foregroundStyle(Color.dim)
            Text(value).font(.mono(15, .semibold)).foregroundStyle(color).monospacedDigit().frame(minWidth: minWidth, alignment: .leading)
        }
    }
}

/// Tempo: vertikal ziehen oder ±
struct TempoLCD: View {
    let bpm: Int
    let set: (Int) -> Void
    @State private var dragStart: Int? = nil
    var body: some View {
        LCD {
            VStack(alignment: .leading, spacing: 1) {
                Text("TEMPO").font(.mono(9)).tracking(1.4).foregroundStyle(Color.dim)
                Text("\(bpm)").font(.mono(24, .semibold)).foregroundStyle(Color.amber).monospacedDigit().frame(minWidth: 46, alignment: .leading)
            }
            .contentShape(Rectangle())
            .gesture(DragGesture(minimumDistance: 2).onChanged { g in
                if dragStart == nil { dragStart = bpm }
                set(dragStart! + Int((-g.translation.height * 0.4).rounded()))
            }.onEnded { _ in dragStart = nil })
            .accessibilityElement().accessibilityLabel("Tempo").accessibilityValue("\(bpm)")
            .accessibilityAdjustableAction { d in set(bpm + (d == .increment ? 1 : -1)) }
            VStack(spacing: 3) {
                NudgeButton(label: "+") { set(bpm + 1) }.accessibilityLabel("Tempo erhöhen")
                NudgeButton(label: "−") { set(bpm - 1) }.accessibilityLabel("Tempo senken")
            }
        }
    }
}
struct NudgeButton: View {
    let label: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(label).font(.mono(12, .semibold)).foregroundStyle(Color.muted).frame(width: 26, height: 20)
                .background(RoundedRectangle(cornerRadius: 5).fill(Color.panel))
                .overlay(RoundedRectangle(cornerRadius: 5).stroke(Color.line))
        }.buttonStyle(.plain).buttonRepeatBehavior(.enabled)
    }
}

/// Mini-Ansicht eines Teils (wie drawMini im Web)
struct MiniPattern: View {
    let pattern: Pattern
    let tracks: [Track]
    let hex: UInt32
    var body: some View {
        Canvas { ctx, size in
            let rows = tracks.filter { pattern[$0.id] != nil }
            guard !rows.isEmpty else { return }
            let rh = size.height / CGFloat(rows.count)
            let cw = size.width / 16
            for (ri, t) in rows.enumerated() {
                for (i, v) in (pattern[t.id] ?? []).enumerated() where i < 16 {
                    let r = CGRect(x: CGFloat(i) * cw, y: CGFloat(ri) * rh, width: cw * 0.81, height: max(1, rh - 1))
                    ctx.fill(Path(r), with: .color(v > 0 ? Color(hex: hex, 0.35 + 0.65 * min(v, 1)) : Color(hex: 0x262b34)))
                }
            }
        }
        .frame(height: 21)
    }
}

/// Drehregler: vertikal ziehen
struct Knob: View {
    let name: String
    @Binding var value: Double
    var onRelease: () -> Void = {}
    @State private var start: Double? = nil

    var body: some View {
        VStack(spacing: 3) {
            Canvas { ctx, size in
                let c = CGPoint(x: size.width / 2, y: size.height / 2), r = size.width * 0.4
                func pt(_ a: Double, _ rad: CGFloat) -> CGPoint {
                    let t = CGFloat((a - 90) * .pi / 180)
                    return CGPoint(x: c.x + rad * cos(t), y: c.y + rad * sin(t))
                }
                func arc(_ from: Double, _ to: Double) -> Path {
                    var p = Path()
                    p.addArc(center: c, radius: r, startAngle: .degrees(from - 90), endAngle: .degrees(to - 90), clockwise: false)
                    return p
                }
                let a1 = -135 + 270 * value / 100
                ctx.stroke(arc(-135, 135), with: .color(Color(hex: 0x262b34)), style: StrokeStyle(lineWidth: 5, lineCap: .round))
                if value > 0.5 { ctx.stroke(arc(-135, a1), with: .color(.amber), style: StrokeStyle(lineWidth: 5, lineCap: .round)) }
                let inner = Path(ellipseIn: CGRect(x: c.x - r * 0.71, y: c.y - r * 0.71, width: r * 1.42, height: r * 1.42))
                ctx.fill(inner, with: .color(Color(hex: 0x232831)))
                ctx.stroke(inner, with: .color(Color(hex: 0x353c48)), lineWidth: 1)
                var line = Path(); line.move(to: pt(a1, r * 0.5)); line.addLine(to: pt(a1, r * 0.68))
                ctx.stroke(line, with: .color(.ink), style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
            }
            .frame(width: 70, height: 70)
            Text(name).font(.ui(11)).foregroundStyle(Color.ink)
            Text("\(Int(value.rounded()))").font(.mono(10)).foregroundStyle(Color.muted).monospacedDigit()
        }
        .contentShape(Rectangle())
        .gesture(DragGesture(minimumDistance: 1).onChanged { g in
            if start == nil { start = value }
            value = clamp(start! - g.translation.height * 0.6, 0, 100)
        }.onEnded { _ in start = nil; onRelease() })
        .accessibilityElement().accessibilityLabel(name).accessibilityValue("\(Int(value.rounded()))")
        .accessibilityAdjustableAction { d in value = clamp(value + (d == .increment ? 5 : -5), 0, 100); onRelease() }
    }
}

/// Auswahlfeld im Stil der Web-Selects
struct SelectLabel: View {
    let text: String
    var height: CGFloat = 38
    var body: some View {
        HStack {
            Text(text).font(.ui(13)).foregroundStyle(Color.ink).lineLimit(1)
            Spacer(minLength: 4)
            Image(systemName: "chevron.down").font(.system(size: 10, weight: .semibold)).foregroundStyle(Color.muted)
        }
        .padding(.horizontal, 12).frame(height: height)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.panel))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
    }
}

/// Tap-Tempo: im Takt antippen
struct TapButton: View {
    let action: () -> Void
    @State private var lit = false
    var body: some View {
        Button {
            action(); lit = true
            Task { try? await Task.sleep(for: .milliseconds(90)); lit = false }
        } label: {
            Text("TAP").font(.mono(11, .bold)).tracking(1).foregroundStyle(lit ? Color.dark : Color.amber)
                .frame(width: 46, height: 48)
                .background(RoundedRectangle(cornerRadius: 10).fill(lit ? Color.amber : Color.lcdBg))
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Tempo antippen")
    }
}
