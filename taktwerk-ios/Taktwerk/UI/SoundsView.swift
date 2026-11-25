import SwiftUI
import UniformTypeIdentifiers

/// Sounds verwalten: Quellen hinzufügen, an- und abschalten, entfernen, und jeden Sound anhören
struct SoundsView: View {
    @Environment(Taktwerk.self) private var tw
    @State private var picking = false
    @State private var busy = false
    @State private var progress = 0.0
    @State private var status = ""
    @State private var error = false
    @State private var group = "kick"
    @State private var kitFilter = "all"
    @State private var search = ""
    @State private var lastPlayed: String? = nil

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 14) {
                Button { tw.screen = .home } label: { Label("Home", systemImage: "chevron.left") }.buttonStyle(PanelButtonStyle())
                Text("Sounds").font(.display(20)).foregroundStyle(Color.ink)
                Spacer()
                Button { picking = true } label: { Label("Quelle hinzufügen", systemImage: "plus") }
                    .buttonStyle(PanelButtonStyle(kind: .primary)).disabled(busy)
                Button { tw.screen = .play } label: { Label("Zum Taktwerk", systemImage: "square.grid.3x3.fill") }.buttonStyle(PanelButtonStyle())
            }
            .padding(.horizontal, 18).frame(height: 72)
            Divider().overlay(Color.line)
            HStack(spacing: 0) {
                sourcesColumn.frame(width: 380)
                Divider().overlay(Color.line)
                browser
            }
        }
        .background(Color.body.ignoresSafeArea())
        .fileImporter(isPresented: $picking, allowedContentTypes: [.folder]) { result in
            guard case let .success(url) = result else { return }
            run(url)
        }
    }

    // MARK: Quellen

    private var sourcesColumn: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                SectionLabel("Quellen")
                if tw.sources.isEmpty && !tw.loadingSources {
                    Text("Noch keine Sounds. Füg eine Library hinzu – bis dahin spielt Taktwerk mit Synth-Klängen.")
                        .font(.ui(13, .regular)).foregroundStyle(Color.muted)
                }
                ForEach(tw.sources) { s in SourceCard(source: s) }
                if busy || !status.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        if busy {
                            GeometryReader { g in
                                ZStack(alignment: .leading) {
                                    RoundedRectangle(cornerRadius: 4).fill(Color.panel)
                                    RoundedRectangle(cornerRadius: 4).fill(Color.pV).frame(width: g.size.width * progress)
                                }
                            }
                            .frame(height: 8).overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.line))
                        }
                        Text(status).font(.ui(13, .regular)).foregroundStyle(error ? Color.pBrk : Color.ink).fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(12)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.panel))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.line))
                }
                SectionLabel("Neue Quelle").padding(.top, 8)
                Text("Wähl einen Ordner, in dem „Drums“ und „One Shots“ liegen – auf dem iPad, in iCloud Drive oder auf einem USB-Stick. Jede Library kommt als eigene Quelle dazu, vorhandene bleiben. Jeder Song wird ein Kit, die Dateien bleiben auf diesem iPad.")
                    .font(.ui(13, .regular)).foregroundStyle(Color.muted).fixedSize(horizontal: false, vertical: true)
                Text("Meine Library/\n├─ Drums/      Kick, Snare, HiHat …\n└─ One Shots/  Bass, Vocal, Synth …")
                    .font(.mono(11)).foregroundStyle(Color.ink).lineSpacing(3)
                    .padding(.horizontal, 12).padding(.vertical, 9)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.panel))
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
            }
            .padding(.horizontal, 16).padding(.vertical, 14)
        }
    }

    private func run(_ url: URL) {
        busy = true; error = false; progress = 0
        status = "Ordner lesen …"
        let existing = tw.sources.map(\.label)
        Task {
            do {
                let r = try await Task.detached(priority: .userInitiated) {
                    try await SourceStore.importFolder(url, existing: existing) { f, msg in progress = f; status = msg }
                }.value
                tw.addSource(r)
                status = "„\(r.source.label)“ hinzugefügt: \(r.source.count) Sounds, \(r.source.kits) Kits" +
                    (r.source.failed > 0 ? ", \(r.source.failed) Dateien nicht lesbar" : "") + "." +
                    (r.saved ? "" : " Speichern im Gerät ging nicht, nach dem Neustart ist die Quelle weg.")
            } catch {
                self.error = true
                status = "Import fehlgeschlagen: " + error.localizedDescription
            }
            busy = false
        }
    }

    // MARK: Sound-Browser

    private var browser: some View {
        let lib = tw.library
        let all = lib?.entries(group) ?? []
        let q = search.trimmingCharacters(in: .whitespaces).lowercased()
        let list = all.filter { (kitFilter == "all" || $0.song == kitFilter) && (q.isEmpty || $0.name.lowercased().contains(q)) }
        let labels = Dictionary(uniqueKeysWithValues: tw.sources.map { ($0.id, $0.label) })
        return VStack(alignment: .leading, spacing: 12) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(ALL_GROUPS, id: \.self) { g in
                        let n = lib?.entries(g).count ?? 0
                        let on = g == group
                        Button { group = g } label: {
                            HStack(spacing: 6) {
                                Text(GROUP_LABEL[g] ?? g)
                                Text("\(n)").font(.mono(10)).foregroundStyle(on ? Color.ink : Color.dim)
                            }
                            .font(.ui(12)).foregroundStyle(on ? Color.ink : n == 0 ? Color.dim : Color.muted)
                            .padding(.horizontal, 10).frame(height: 32)
                            .background(RoundedRectangle(cornerRadius: 8).fill(on ? Color.line : Color.panel))
                            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.line))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            HStack(spacing: 10) {
                HStack {
                    Image(systemName: "magnifyingglass").foregroundStyle(Color.muted)
                    TextField("Sound suchen", text: $search).foregroundStyle(Color.ink).autocorrectionDisabled().textInputAutocapitalization(.never)
                }
                .font(.ui(13, .regular)).padding(.horizontal, 12).frame(height: 38)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.panel))
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
                Menu {
                    Picker("Kit", selection: $kitFilter) {
                        Text("Alle Kits").tag("all")
                        ForEach(tw.kits, id: \.id) { k in Text(k.name).tag(k.id) }
                    }
                } label: { SelectLabel(text: kitFilter == "all" ? "Alle Kits" : tw.kits.first { $0.id == kitFilter }?.name ?? kitFilter) }
                .frame(width: 220)
            }
            if lib == nil {
                Spacer()
                Text(tw.loadingSources ? "Lade Sounds …" : "Keine aktive Quelle.").font(.ui(14, .regular)).foregroundStyle(Color.muted).frame(maxWidth: .infinity)
                Spacer()
            } else {
                Text("\(list.count) Sounds · antippen zum Anhören").font(.mono(10)).tracking(1).foregroundStyle(Color.dim)
                ScrollView {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                        ForEach(list) { e in
                            let on = lastPlayed == e.id
                            Button {
                                tw.preview(e); lastPlayed = e.id
                            } label: {
                                HStack(spacing: 10) {
                                    Image(systemName: on ? "speaker.wave.2.fill" : "play.fill").font(.system(size: 11))
                                        .foregroundStyle(on ? Color.pV : Color.muted).frame(width: 16)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(e.name).font(.ui(12)).foregroundStyle(Color.ink).lineLimit(1)
                                        Text([prettify(e.songName), e.key, labels[e.source]].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · "))
                                            .font(.ui(10, .regular)).foregroundStyle(Color.muted).lineLimit(1)
                                    }
                                    Spacer(minLength: 0)
                                }
                                .padding(.horizontal, 10).frame(height: 46)
                                .background(RoundedRectangle(cornerRadius: 9).fill(on ? mix(0x4fd1a5, 0x11141a, 0.1) : Color.panel))
                                .overlay(RoundedRectangle(cornerRadius: 9).stroke(on ? Color.pV.opacity(0.6) : Color.line))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
    }
}

struct SourceCard: View {
    @Environment(Taktwerk.self) private var tw
    let source: SoundSource
    @State private var armed = false
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(source.label).font(.ui(15)).foregroundStyle(Color.ink).lineLimit(1)
                    Text(subtitle).font(.ui(11, .regular)).foregroundStyle(Color.muted)
                }
                Spacer()
                Toggle("Aktiv", isOn: Binding(get: { source.enabled }, set: { tw.setSourceEnabled(source.id, $0) }))
                    .labelsHidden().tint(Color.pV)
            }
            Text("\(source.count) Sounds · \(source.kits) Kits" + (source.failed > 0 ? " · \(source.failed) nicht lesbar" : ""))
                .font(.mono(11)).foregroundStyle(Color.ink)
            if !source.bundled {
                Button(armed ? "Wirklich entfernen?" : "Entfernen") {
                    if armed { tw.removeSource(source.id) } else {
                        armed = true
                        Task { try? await Task.sleep(for: .seconds(3)); armed = false }
                    }
                }
                .buttonStyle(PanelButtonStyle(kind: armed ? .armed : .danger, height: 32))
            }
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.panel))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(source.enabled ? Color.pV.opacity(0.45) : Color.line))
        .opacity(source.enabled ? 1 : 0.6)
    }
    private var subtitle: String {
        if source.bundled { return "Mitgeliefert" }
        return "Importiert am " + Date(timeIntervalSince1970: source.date).formatted(date: .numeric, time: .omitted)
    }
}
