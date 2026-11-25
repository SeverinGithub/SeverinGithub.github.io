import SwiftUI

struct MainView: View {
    @Environment(Taktwerk.self) private var tw
    @State private var showImport = false

    var body: some View {
        ZStack(alignment: .top) {
            Color.body.ignoresSafeArea()
            RadialGradient(colors: [.white.opacity(0.05), .clear], center: UnitPoint(x: 0.7, y: -0.1), startRadius: 0, endRadius: 900)
                .ignoresSafeArea().allowsHitTesting(false)
            VStack(spacing: 0) {
                TopBar()
                    .frame(height: 72)
                Divider().overlay(Color.line)
                HStack(spacing: 0) {
                    KitColumn(showImport: $showImport).frame(width: 250)
                    Divider().overlay(Color.line)
                    ArrangeColumn()
                    Divider().overlay(Color.line)
                    MacroColumn().frame(width: 224)
                }
                .frame(maxHeight: .infinity)
                PadRow().frame(height: 128)
            }
            if tw.editing {
                EditorView().transition(.opacity)
            }
            if showImport {
                ImportSheet { showImport = false }.transition(.opacity)
            }
            if let msg = tw.toast {
                Text(msg).font(.ui(13, .regular)).foregroundStyle(Color.ink)
                    .padding(.horizontal, 14).padding(.vertical, 10)
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.lcdBg))
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
                    .frame(maxWidth: 520)
                    .padding(.top, 84)
                    .transition(.opacity)
                    .allowsHitTesting(false)
            }
        }
        .ignoresSafeArea(.keyboard)
        .animation(.easeOut(duration: 0.2), value: tw.toast)
        .animation(.easeOut(duration: 0.15), value: tw.editing)
        .animation(.easeOut(duration: 0.15), value: showImport)
        .onKeyPress(.space) { tw.toggle(); return .handled }
        #if DEBUG
        .task {
            // Nur zum Testen im Simulator: -autoplay, -editor, -import
            let a = ProcessInfo.processInfo.arguments
            try? await Task.sleep(for: .seconds(1.5))
            if a.contains("-autoplay") { tw.start() }
            if a.contains("-editor") { tw.openEditor(nil); tw.addRow() }
            if a.contains("-import") { showImport = true }
            if let i = a.firstIndex(of: "-importPath"), i + 1 < a.count {
                let url = URL(fileURLWithPath: a[i + 1])
                do {
                    let r = try await ImportedLibrary.run(folder: url) { _, _ in }
                    tw.adoptImport(r)
                    print("TAKTWERK-IMPORT ok \(r.meta.count) Sounds, \(r.kits) Kits, \(r.meta.failed) Fehler, gespeichert \(r.saved) \(r.counts)")
                } catch { print("TAKTWERK-IMPORT Fehler \(error)") }
            }
        }
        #endif
    }
}

// MARK: - Transport

struct TopBar: View {
    @Environment(Taktwerk.self) private var tw
    var body: some View {
        HStack(spacing: 14) {
            HStack(spacing: 0) {
                Text("TAKT").foregroundStyle(Color.ink)
                Text("WERK").foregroundStyle(Color.pA)
            }
            .font(.display(17)).tracking(0.4)
            .padding(.trailing, 6)
            PlayButton(playing: tw.playing) { tw.toggle() }
            TempoLCD(bpm: tw.bpm) { tw.setBpm($0) }
            StyleStrip()
            if tw.curStyle.custom {
                Button { tw.openEditor(tw.style) } label: {
                    Image(systemName: "pencil").font(.system(size: 15, weight: .semibold)).frame(width: 40, height: 40)
                }
                .buttonStyle(PanelButtonStyle()).padding(.leading, -8)
                .accessibilityLabel("Eigenen Groove bearbeiten")
            }
            Button { tw.openEditor(nil) } label: {
                Text("+").font(.ui(20)).foregroundStyle(Color.pV).frame(width: 40, height: 40)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line, style: StrokeStyle(lineWidth: 1, dash: [4, 3])))
            }
            .buttonStyle(.plain).padding(.leading, -8)
            .accessibilityLabel("Eigenen Groove bauen")
            Spacer(minLength: 0)
            LCD {
                LCDField(label: "Phrase", value: String(format: "%02d", tw.playing ? tw.vis.phrase : tw.phrase))
                LCDField(label: "Takt", value: String(format: "%02d/16", (tw.playing ? tw.vis.bar : 0) + 1))
                let k = tw.playing ? tw.vis.part : tw.view
                LCDField(label: "Teil", value: k.name, color: k.color, minWidth: 86)
            }
        }
        .padding(.horizontal, 18)
    }
}

struct StyleStrip: View {
    @Environment(Taktwerk.self) private var tw
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 4) {
                    ForEach(tw.styleOrder, id: \.self) { k in
                        let st = tw.styles[k]!
                        let on = k == tw.style
                        Button { tw.setStyle(k) } label: {
                            Text(st.name).font(.ui(12)).lineLimit(1)
                                .foregroundStyle(on ? Color.ink : st.custom ? Color.pV : Color.muted)
                                .padding(.horizontal, 8).frame(height: 34)
                                .background(RoundedRectangle(cornerRadius: 8).fill(on ? Color.line : .clear))
                                .overlay(alignment: .bottom) {
                                    if on && st.custom { Rectangle().fill(Color.pV).frame(height: 2).padding(.horizontal, 2) }
                                }
                        }
                        .buttonStyle(.plain).id(k)
                        .accessibilityAddTraits(on ? .isSelected : [])
                    }
                }
                .padding(4)
            }
            .frame(maxWidth: 404)
            .fixedSize(horizontal: false, vertical: true)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.panel))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.line))
            .onChange(of: tw.style) { _, k in withAnimation { proxy.scrollTo(k) } }
        }
    }
}

// MARK: - Linke Spalte: Kit und Teile

struct KitColumn: View {
    @Environment(Taktwerk.self) private var tw
    @Binding var showImport: Bool
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Kit") { MiniButton(title: "Importieren") { showImport = true } }
            Menu {
                Picker("Kit", selection: Binding(get: { tw.kit }, set: { tw.setKit($0) })) {
                    Text("Synth (Demo)").tag("synth")
                    ForEach(tw.kits, id: \.id) { k in Text(k.name).tag(k.id) }
                }
            } label: { SelectLabel(text: tw.kit == "synth" ? "Synth (Demo)" : tw.kits.first { $0.id == tw.kit }?.name ?? tw.kit) }
            Text(tw.kitInfo).font(.ui(11, .regular)).foregroundStyle(Color.muted).lineLimit(2).fixedSize(horizontal: false, vertical: true).frame(minHeight: 16, alignment: .top).padding(.top, -4).padding(.bottom, 2)
            SectionLabel("Sounds")
            Menu {
                Picker("Sounds", selection: Binding(get: { tw.soundSet }, set: { tw.setSoundSet($0) })) {
                    ForEach(SOUND_SETS, id: \.id) { s in Text(s.label).tag(s.id) }
                }
            } label: { SelectLabel(text: SOUND_SETS.first { $0.id == tw.soundSet }?.label ?? "") }
            SectionLabel("Teile") { MiniButton(title: "Neu erzeugen") { tw.regenParts() } }.padding(.top, 4)
            VStack(spacing: 6) {
                ForEach(PartKey.allCases) { k in PartButton(k: k) }
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
    }
}

struct PartButton: View {
    @Environment(Taktwerk.self) private var tw
    let k: PartKey
    var body: some View {
        let active = tw.playing ? tw.vis.part == k : tw.view == k
        Button { tw.tapPart(k) } label: {
            HStack(spacing: 10) {
                Text(k.tag).font(.display(11)).foregroundStyle(Color.dark)
                    .frame(width: 30, height: 30).background(RoundedRectangle(cornerRadius: 7).fill(k.color))
                VStack(alignment: .leading, spacing: 4) {
                    Text(k.name).font(.ui(13)).foregroundStyle(Color.ink)
                    MiniPattern(pattern: tw.parts[k] ?? [:], tracks: TRACKS + tw.rows, hex: k.hex)
                }
            }
            .padding(.horizontal, 9).padding(.vertical, 7)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 10).fill(Color.panel))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(active ? k.color : Color.line, lineWidth: active ? 2 : 1))
            .overlay(alignment: .topTrailing) {
                if tw.queued == k { Text("NÄCHSTER").font(.mono(8, .semibold)).tracking(1.2).foregroundStyle(k.color).padding(.top, 7).padding(.trailing, 8) }
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Mitte: Kette und Raster

struct ArrangeColumn: View {
    @Environment(Taktwerk.self) private var tw
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Arrangement · 16 Takte") {
                HStack(spacing: 6) {
                    MiniButton(title: "Kette würfeln") { tw.reroll() }
                    MiniButton(title: "Sperren lösen") { tw.unlock() }
                }
            }
            ChainView()
            HStack(spacing: 4) { ForEach(0..<4, id: \.self) { _ in Rectangle().fill(Color.line).frame(height: 2) } }.padding(.top, -4)
            NextLine()
            StepGrid(part: tw.playing ? tw.vis.part : tw.view)
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
    }
}

struct ChainView: View {
    @Environment(Taktwerk.self) private var tw
    var body: some View {
        let nowBar = tw.playing ? tw.vis.bar : -1
        HStack(spacing: 4) {
            ForEach(Array(tw.chain.enumerated()), id: \.offset) { i, k in
                let now = i == nowBar
                Button { tw.tapChain(i) } label: {
                    VStack(spacing: 2) {
                        Text(k.tag).font(.display(11))
                        Text(String(format: "%02d", i + 1)).font(.mono(9)).foregroundStyle(now ? Color.dark : Color.muted)
                    }
                    .foregroundStyle(now ? Color.dark : Color.ink)
                    .frame(maxWidth: .infinity).frame(height: 46)
                    .background(RoundedRectangle(cornerRadius: 7).fill(now ? k.color : mix(k.hex, 0x11141a, 0.22)))
                    .overlay(RoundedRectangle(cornerRadius: 7).stroke(now ? k.color : k.color.opacity(0.45)))
                    .overlay(alignment: .topTrailing) {
                        if tw.locked[i] { Circle().fill(Color.ink).frame(width: 5, height: 5).padding(4) }
                    }
                    .overlay(alignment: .bottomLeading) {
                        if now {
                            GeometryReader { g in
                                Rectangle().fill(Color.dark.opacity(0.5)).frame(width: g.size.width * CGFloat(tw.vis.step + 1) / 16, height: 3)
                                    .frame(maxHeight: .infinity, alignment: .bottom)
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 7))
                        }
                    }
                    .opacity(i < nowBar ? 0.38 : 1)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Takt \(i + 1): \(k.name)\(tw.locked[i] ? ", festgelegt" : "")")
            }
        }
    }
}

struct NextLine: View {
    @Environment(Taktwerk.self) private var tw
    var body: some View {
        let n: PartKey? = tw.playing ? (tw.queued ?? (tw.vis.bar + 1 < tw.chain.count ? tw.chain[tw.vis.bar + 1] : tw.chain.first)) : tw.chain.first
        let why = !tw.playing ? "Startet mit" : tw.queued != nil ? "Von Hand gesetzt:" : (tw.vis.bar == 15 ? "Neue Phrase, als Nächstes" : "Als Nächstes")
        HStack(spacing: 4) {
            if let n {
                Text(why).foregroundStyle(Color.muted)
                Text(n.name).fontWeight(.semibold).foregroundStyle(n.color)
                if tw.hold { Text("· Halten aktiv").fontWeight(.semibold).foregroundStyle(Color.ink) }
            }
        }
        .font(.ui(12, .regular)).frame(minHeight: 18)
    }
}

/// Step-Raster des laufenden (oder gewählten) Teils
struct StepGrid: View {
    @Environment(Taktwerk.self) private var tw
    let part: PartKey
    var body: some View {
        let tracks = TRACKS + tw.rows
        let pat = tw.parts[part] ?? [:]
        let head = tw.playing && !tw.vis.editing ? tw.vis.step : -1
        VStack(spacing: 4) {
            HStack(spacing: 4) {
                Color.clear.frame(width: 78, height: 12)
                ForEach(0..<16, id: \.self) { i in
                    Text(i % 4 == 0 ? "\(i / 4 + 1)" : "·").font(.mono(9)).foregroundStyle(i % 4 == 0 ? Color.muted : Color.dim).frame(maxWidth: .infinity)
                }
            }
            ForEach(Array(tracks.enumerated()), id: \.element.id) { ri, t in
                HStack(spacing: 4) {
                    TrackLabel(track: t, muted: tw.mutes.contains(t.id), selected: false, width: 78) { tw.toggleMute(t.id) }
                    ForEach(0..<16, id: \.self) { i in
                        let v = pat[t.id]?[i] ?? 0
                        StepCell(v: v, hex: part.hex, quarter: (i / 4) % 2 == 1, head: head == i,
                                 hit: head == i && ri < tw.vis.hits.count && tw.vis.hits[ri])
                            .onTapGesture { tw.toggleCell(part, t.id, i) }
                            .accessibilityLabel("\(t.name), Schritt \(i + 1)\(v > 0 ? ", an" : "")")
                            .accessibilityAddTraits(.isButton)
                    }
                }
                .frame(maxHeight: .infinity)
            }
        }
        .frame(maxHeight: .infinity)
    }
}

struct TrackLabel: View {
    let track: Track
    let muted: Bool
    let selected: Bool
    var color: Color = .ink
    let width: CGFloat
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Circle().fill(muted ? Color.clear : selected ? color : track.src != nil ? Color.pV : Color.muted)
                    .overlay(Circle().stroke(muted ? Color.dim : .clear))
                    .frame(width: 7, height: 7)
                    .shadow(color: selected ? color : .clear, radius: 4)
                Text(track.name).font(.ui(11)).lineLimit(1).truncationMode(.tail)
                    .foregroundStyle(muted ? Color.dim : selected ? Color.ink : Color.muted)
                    .strikethrough(muted)
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 4)
            .frame(width: width).frame(maxHeight: .infinity)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(track.name + (muted ? ", stumm" : ""))
    }
}

struct StepCell: View, Equatable {
    let v: Double
    let hex: UInt32
    let quarter: Bool
    let head: Bool
    let hit: Bool
    var body: some View {
        let base: UInt32 = 0x1c2029
        let fill: Color = v > 0 ? mix(hex, base, 0.3 + 0.7 * min(v, 1)) : (quarter ? Color(hex: 0x1c2029) : Color(hex: 0x171b22))
        RoundedRectangle(cornerRadius: 5)
            .fill(fill)
            .overlay(RoundedRectangle(cornerRadius: 5).stroke(v > 0 ? Color(hex: hex, 0.6) : Color(hex: 0x20252e)))
            .overlay(RoundedRectangle(cornerRadius: 5).inset(by: 1.5).stroke(v > 0 && v < 0.45 ? Color(hex: hex, 0.7) : .clear))
            .overlay(alignment: .bottom) { if head { Rectangle().fill(Color.ink).frame(height: 3).clipShape(RoundedRectangle(cornerRadius: 1.5)).padding(.horizontal, 1) } }
            .brightness(hit ? 0.25 : 0)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .contentShape(Rectangle())
    }
}

// MARK: - Rechts: Makros und Ausgang

struct MacroColumn: View {
    @Environment(Taktwerk.self) private var tw
    var body: some View {
        @Bindable var tw = tw
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel("Makros")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(MACROS) { m in
                    Knob(name: m.name, value: Binding(get: { tw.macros[m.id] ?? 0 }, set: { tw.macros[m.id] = $0 })) { tw.macroReleased(m.id) }
                }
            }
            SectionLabel("Ausgang").padding(.top, 6)
            HStack(alignment: .bottom, spacing: 3) {
                ForEach(0..<14, id: \.self) { i in
                    let v = tw.meter[i]
                    RoundedRectangle(cornerRadius: 2)
                        .fill(v > 0.8 ? Color.pA : v > 0.5 ? Color.amber : Color.dim)
                        .frame(maxWidth: .infinity).frame(height: max(2, 22 * (0.08 + 0.92 * v)))
                }
            }
            .frame(height: 22, alignment: .bottom)
            .padding(.horizontal, 8).padding(.vertical, 6)
            .background(RoundedRectangle(cornerRadius: 10).fill(Color.panel))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
    }
}

// MARK: - Performance-Pads

struct PadRow: View {
    @Environment(Taktwerk.self) private var tw
    var body: some View {
        HStack(spacing: 12) {
            Pad(title: "Fill", sub: "im nächsten Takt", color: .pFill) { tw.padFill() }
            Pad(title: "Break", sub: "nächster Takt ohne Kick", color: .pBrk) { tw.padBreak() }
            Pad(title: "Drop", sub: "zurück auf Groove A, neue Phrase", color: .pA) { tw.padDrop() }
            Pad(title: "Halftime", sub: "halbe Geschwindigkeit", color: nil, on: tw.half) { tw.padHalf() }
            Pad(title: "Mutieren", sub: "Groove B und Variation neu", color: .pV) { tw.padMutate() }
            Pad(title: "Halten", sub: "aktuellen Teil loopen", color: nil, on: tw.hold) { tw.padHold() }
        }
        .padding(.horizontal, 18).padding(.vertical, 16)
        .background(LinearGradient(colors: [Color(hex: 0x1d212a), Color(hex: 0x171a21)], startPoint: .top, endPoint: .bottom))
        .overlay(alignment: .top) { Rectangle().fill(Color.line).frame(height: 1) }
    }
}

struct Pad: View {
    let title: String
    let sub: String
    let color: Color?
    var on = false
    let action: () -> Void
    @State private var lit = false
    var body: some View {
        Button {
            action()
            lit = true
            Task { try? await Task.sleep(for: .milliseconds(180)); lit = false }
        } label: {
            VStack(alignment: .leading, spacing: 0) {
                RoundedRectangle(cornerRadius: 2).fill(color ?? (on || lit ? Color.ink : Color.dim)).frame(width: 22, height: 4)
                    .shadow(color: (on || lit) ? (color ?? .ink) : .clear, radius: 5)
                Spacer(minLength: 0)
                Text(title).font(.display(14)).foregroundStyle(Color.ink).padding(.bottom, 2)
                Text(sub).font(.ui(11, .regular)).foregroundStyle(Color.muted).lineLimit(2).multilineTextAlignment(.leading)
            }
            .padding(.horizontal, 14).padding(.vertical, 12)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
        .buttonStyle(PadStyle(lit: lit))
        .accessibilityAddTraits(on ? .isSelected : [])
    }
}

struct PadStyle: ButtonStyle {
    let lit: Bool
    func makeBody(configuration: Configuration) -> some View {
        let down = configuration.isPressed || lit
        configuration.label
            .background(RoundedRectangle(cornerRadius: 14).fill(LinearGradient(colors: [Color(hex: 0x262b35), Color(hex: 0x1e222b)], startPoint: .top, endPoint: .bottom)))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: 0x303744)))
            .background(RoundedRectangle(cornerRadius: 14).fill(Color(hex: 0x0e1015)).offset(y: down ? 1 : 3))
            .offset(y: down ? 2 : 0)
    }
}
