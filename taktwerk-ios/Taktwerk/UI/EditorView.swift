import SwiftUI

/// Eigener Groove: alle sechs Teile selbst bauen, eigene Reihen mit Namen und Sound
struct EditorView: View {
    @Environment(Taktwerk.self) private var tw
    @State private var base = "house"
    @State private var copyFrom: PartKey = .intro
    @State private var deleteArmed = false
    @FocusState private var rowNameFocus: Bool

    var body: some View {
        @Bindable var tw = tw
        VStack(spacing: 0) {
            // Kopfzeile
            HStack(spacing: 14) {
                Button("← Zurück") { tw.closeEditor() }.buttonStyle(PanelButtonStyle())
                TextField("Name", text: $tw.draft.name)
                    .font(.ui(15)).foregroundStyle(Color.ink).padding(.horizontal, 12).frame(width: 210, height: 40)
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.panel))
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
                    .autocorrectionDisabled().textInputAutocapitalization(.never)
                    .onChange(of: tw.draft.name) { _, v in if v.count > 24 { tw.draft.name = String(v.prefix(24)) } }
                    .accessibilityLabel("Name des Grooves")
                TempoLCD(bpm: tw.draft.bpm) { tw.draft.bpm = clamp($0, 60, 190) }
                TapButton { tw.tap() }.padding(.leading, -6)
                LCD {
                    LCDField(label: "Swing", value: "\(Int(tw.draft.swing.rounded()))", minWidth: 28)
                    Slider(value: $tw.draft.swing, in: 0...100).tint(Color.amber).frame(width: 110).accessibilityLabel("Swing")
                }
                Spacer(minLength: 0)
                PlayButton(playing: tw.playing) { tw.toggle() }.accessibilityLabel(tw.playing ? "Stoppen" : "Teil vorhören")
                if tw.draft.id != nil {
                    Button(deleteArmed ? "Wirklich löschen?" : "Löschen") {
                        if deleteArmed { tw.edDelete() } else {
                            deleteArmed = true
                            Task { try? await Task.sleep(for: .seconds(3)); deleteArmed = false }
                        }
                    }
                    .buttonStyle(PanelButtonStyle(kind: deleteArmed ? .armed : .danger))
                }
                Button("Speichern") { tw.edSave() }.buttonStyle(PanelButtonStyle(kind: .primary))
            }
            .padding(.horizontal, 18).frame(height: 72)
            Divider().overlay(Color.line)

            // Teile als Reiter
            HStack(spacing: 8) {
                ForEach(PartKey.allCases) { k in
                    let on = k == tw.editPart
                    Button { tw.editPart = k } label: {
                        VStack(alignment: .leading, spacing: 5) {
                            HStack(spacing: 8) {
                                Text(k.tag).font(.display(9)).foregroundStyle(Color.dark)
                                    .frame(width: 22, height: 22).background(RoundedRectangle(cornerRadius: 6).fill(k.color))
                                Text(k.name).font(.ui(13)).foregroundStyle(Color.ink)
                            }
                            MiniPattern(pattern: tw.draft.parts[k] ?? [:], tracks: TRACKS + tw.draft.rows, hex: k.hex)
                        }
                        .padding(.horizontal, 9).padding(.vertical, 8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(RoundedRectangle(cornerRadius: 10).fill(on ? mix(k.hex, 0x11141a, 0.14) : Color.panel))
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(on ? k.color : Color.line))
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(on ? .isSelected : [])
                }
            }
            .padding(.horizontal, 18).padding(.vertical, 12)
            Divider().overlay(Color.line)

            HStack(spacing: 0) {
                ScrollView { EditorGrid().padding(.horizontal, 16).padding(.vertical, 14) }
                Divider().overlay(Color.line)
                ScrollView { tools.padding(.horizontal, 16).padding(.vertical, 14) }.frame(width: 260)
            }
        }
        .background(Color.body.ignoresSafeArea())
        .ignoresSafeArea(.keyboard)
        .onAppear { base = tw.curStyle.custom ? "house" : tw.style; copyFrom = tw.editPart == .intro ? .a : .intro }
        .onChange(of: tw.editPart) { _, p in if copyFrom == p { copyFrom = PartKey.allCases.first { $0 != p }! } }
    }

    @ViewBuilder private var tools: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let r = tw.selRow { rowPanel(r) }
            SectionLabel("Teil")
            HStack(spacing: 6) {
                Button("Würfeln") { tw.edDice(base: base) }.buttonStyle(PanelButtonStyle(height: 36, wide: true))
                Button("Leeren") { tw.edClear() }.buttonStyle(PanelButtonStyle(height: 36, wide: true))
            }
            HStack(spacing: 6) {
                Menu {
                    Picker("Kopieren von", selection: $copyFrom) {
                        ForEach(PartKey.allCases.filter { $0 != tw.editPart }) { k in Text("von " + k.name).tag(k) }
                    }
                } label: { SelectLabel(text: "von " + copyFrom.name, height: 36) }
                Button("Kopieren") { tw.edCopy(from: copyFrom) }.buttonStyle(PanelButtonStyle(height: 36))
            }
            HStack(spacing: 4) {
                SectionLabel("Spur")
                Text(tw.selTrackName).font(.mono(10)).foregroundStyle(Color.ink).lineLimit(1)
            }.padding(.top, 6)
            HStack(spacing: 6) {
                Button("◀") { tw.edRotate(-1) }.buttonStyle(PanelButtonStyle(height: 36, wide: true)).accessibilityLabel("Spur nach links schieben")
                Button("▶") { tw.edRotate(1) }.buttonStyle(PanelButtonStyle(height: 36, wide: true)).accessibilityLabel("Spur nach rechts schieben")
                Button("Leeren") { tw.edTrackClear() }.buttonStyle(PanelButtonStyle(height: 36, wide: true))
            }
            SectionLabel("Euklidisch verteilen")
            HStack(spacing: 6) {
                ForEach([2, 3, 4, 5, 7], id: \.self) { k in
                    Button("\(k)") { tw.edEuclid(k) }.buttonStyle(PanelButtonStyle(height: 36, wide: true))
                        .accessibilityLabel("\(k) Schläge gleichmäßig verteilen")
                }
            }
            SectionLabel("Vorlage").padding(.top, 6)
            Menu {
                Picker("Vorlage", selection: $base) {
                    ForEach(BUILTIN_ORDER, id: \.self) { k in Text(BUILTIN_STYLES[k]!.name).tag(k) }
                    Text("Leer").tag("empty")
                }
            } label: { SelectLabel(text: base == "empty" ? "Leer" : BUILTIN_STYLES[base]?.name ?? base, height: 36) }
            Button("Alle Teile daraus erzeugen") { tw.edLoadBase(base) }.buttonStyle(PanelButtonStyle(height: 36, wide: true))
            Text("Step antippen: an, betont, leise, aus. Würfeln erzeugt den gewählten Teil im Stil der Vorlage. Play spielt nur den Teil, den du gerade baust.")
                .font(.ui(12, .regular)).foregroundStyle(Color.muted).padding(.top, 4)
        }
    }

    @ViewBuilder private func rowPanel(_ r: Track) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionLabel("Eigene Reihe")
            TextField("Name", text: Binding(get: { tw.selRow?.name ?? "" }, set: { tw.renameRow($0) }))
                .focused($rowNameFocus)
                .onSubmit { tw.finishRename() }
                .onChange(of: rowNameFocus) { _, f in if !f { tw.finishRename() } }
                .font(.ui(14)).foregroundStyle(Color.ink).padding(.horizontal, 12).frame(height: 36)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.panel))
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
                .autocorrectionDisabled()
                .accessibilityLabel("Name der Reihe")
            SoundMenu(current: r.src ?? "synth|tom") { tw.setRowSound($0) }
            HStack(spacing: 6) {
                Button("Anhören") { tw.previewRow() }.buttonStyle(PanelButtonStyle(height: 36, wide: true))
                Button("Entfernen") { tw.deleteRow() }.buttonStyle(PanelButtonStyle(kind: .danger, height: 36, wide: true))
            }
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 12).fill(mix(0x4fd1a5, 0x11141a, 0.06)))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(mix(0x4fd1a5, 0x2a303b, 0.45)))
        .onAppear { if r.name == "Neue Reihe" { rowNameFocus = true } }
    }
}

/// Klangauswahl einer Reihe: Synth-Klänge oder jedes Sample der Library
struct SoundMenu: View {
    @Environment(Taktwerk.self) private var tw
    let current: String
    let pick: (String) -> Void
    var body: some View {
        Menu {
            Section("Synth") {
                ForEach(SYNTH_OPTS, id: \.id) { o in
                    Button { pick("synth|" + o.id) } label: { label(o.label, "synth|" + o.id) }
                }
            }
            if let lib = tw.library {
                Section("Library") {
                    ForEach(ALL_GROUPS, id: \.self) { g in
                        let list = lib.entries(g)
                        if !list.isEmpty {
                            Menu("\(GROUP_LABEL[g] ?? g) (\(list.count))") {
                                ForEach(list) { e in
                                    Button { pick("sample|\(g)|\(e.name)") } label: { label(e.name, "sample|\(g)|\(e.name)") }
                                }
                            }
                        }
                    }
                }
            }
        } label: {
            SelectLabel(text: text, height: 36)
        }
        .accessibilityLabel("Sound der Reihe")
    }
    @ViewBuilder func label(_ t: String, _ v: String) -> some View {
        if v == current { Label(t, systemImage: "checkmark") } else { Text(t) }
    }
    var text: String {
        let p = current.split(separator: "|", maxSplits: 2).map(String.init)
        if p.first == "sample", p.count == 3 {
            return p[2] + (tw.library?.find(p[1], p[2]) == nil ? " (hier ohne Sample)" : "")
        }
        return SYNTH_OPTS.first { "synth|" + $0.id == current }?.label ?? current
    }
}

struct EditorGrid: View {
    @Environment(Taktwerk.self) private var tw
    var body: some View {
        let part = tw.editPart
        let pat = tw.draft.parts[part] ?? [:]
        let tracks = TRACKS + tw.draft.rows
        let head = tw.playing && tw.vis.editing ? tw.vis.step : -1
        VStack(spacing: 5) {
            HStack(spacing: 5) {
                Color.clear.frame(width: 110, height: 18)
                ForEach(0..<16, id: \.self) { i in
                    Text(i % 4 == 0 ? "\(i / 4 + 1)" : "·").font(.mono(9)).foregroundStyle(i % 4 == 0 ? Color.muted : Color.dim).frame(maxWidth: .infinity)
                }
            }
            ForEach(Array(tracks.enumerated()), id: \.element.id) { ri, t in
                HStack(spacing: 5) {
                    TrackLabel(track: t, muted: false, selected: t.id == tw.selTrack, color: part.color, width: 110) { tw.selTrack = t.id }
                    ForEach(0..<16, id: \.self) { i in
                        let v = pat[t.id]?[i] ?? 0
                        StepCell(v: v, hex: part.hex, quarter: (i / 4) % 2 == 1, head: head == i,
                                 hit: head == i && ri < tw.vis.hits.count && tw.vis.hits[ri])
                            .onTapGesture { tw.edCell(t.id, i) }
                            .accessibilityLabel("\(t.name), Schritt \(i + 1): \(v == 0 ? "aus" : v >= 0.9 ? "betont" : v >= 0.6 ? "an" : "leise")")
                            .accessibilityAddTraits(.isButton)
                    }
                }
                .frame(height: 36)
            }
            let full = tw.draft.rows.count >= 8
            Button { tw.addRow() } label: {
                Text(full ? "Höchstens 8 eigene Reihen" : "+ Reihe hinzufügen").font(.ui(12))
                    .foregroundStyle(full ? Color.dim : Color.pV)
                    .frame(maxWidth: .infinity).frame(height: 34)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.line, style: StrokeStyle(lineWidth: 1, dash: [4, 3])))
            }
            .buttonStyle(.plain).disabled(full).padding(.top, 2)
        }
    }
}
