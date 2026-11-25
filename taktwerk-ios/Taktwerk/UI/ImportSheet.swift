import SwiftUI
import UniformTypeIdentifiers

/// Library importieren: Ordner mit „Drums“ und „One Shots“ aus der Dateien-App
struct ImportSheet: View {
    @Environment(Taktwerk.self) private var tw
    let close: () -> Void
    @State private var picking = false
    @State private var busy = false
    @State private var progress: Double? = nil
    @State private var status = ""
    @State private var error = false
    @State private var counts: [String: Int]? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Library importieren").font(.display(22)).foregroundStyle(Color.ink)
            Text("Wähl den Ordner deiner Library, in dem die Ordner „Drums“ und „One Shots“ liegen. Taktwerk ordnet jeden Sound dem passenden Instrument zu und macht aus jedem Song ein Kit. Die Dateien bleiben auf diesem iPad, nichts wird hochgeladen.")
                .font(.ui(14, .regular)).foregroundStyle(Color.muted).fixedSize(horizontal: false, vertical: true)
            Text("Meine Library/\n├─ Drums/       Kick, Snare, Clap, HiHat, Percussion, Tom, Cymbal …\n└─ One Shots/   Bass, Vocal, Synth Pad, Synth Misc, Organ …")
                .font(.mono(12)).foregroundStyle(Color.ink).lineSpacing(3)
                .padding(.horizontal, 14).padding(.vertical, 10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.panel))
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.line))
            Text("Der Ordner kann auf dem iPad, in iCloud Drive oder auf einem USB-Stick liegen.")
                .font(.ui(13, .regular)).foregroundStyle(Color.muted)
            Button("Ordner wählen") { picking = true }.buttonStyle(PanelButtonStyle(kind: .primary)).disabled(busy)
            if let p = progress {
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4).fill(Color.panel)
                        RoundedRectangle(cornerRadius: 4).fill(Color.pV).frame(width: g.size.width * p)
                    }
                }
                .frame(height: 8).overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.line))
            }
            Text(status).font(.ui(13, .regular)).foregroundStyle(error ? Color.pBrk : Color.ink).frame(minHeight: 20, alignment: .topLeading)
                .fixedSize(horizontal: false, vertical: true)
            if let counts {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 5), spacing: 6) {
                    ForEach(ALL_GROUPS.filter { counts[$0] != nil }, id: \.self) { g in
                        VStack(alignment: .leading, spacing: 1) {
                            Text("\(counts[g]!)").font(.mono(15, .semibold)).foregroundStyle(Color.ink)
                            Text(GROUP_LABEL[g] ?? g).font(.mono(11)).foregroundStyle(Color.muted).lineLimit(1).minimumScaleFactor(0.8)
                        }
                        .padding(.horizontal, 8).padding(.vertical, 6).frame(maxWidth: .infinity, alignment: .leading)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.panel))
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.line))
                    }
                }
            }
            HStack {
                if tw.importMeta != nil && !busy {
                    Button("Import entfernen") {
                        Task {
                            counts = nil; status = "Import entfernt."; error = false
                            await tw.removeImport()
                        }
                    }.buttonStyle(PanelButtonStyle(kind: .danger))
                }
                Spacer()
                Button("Schließen") { close() }.disabled(busy).buttonStyle(PanelButtonStyle())
            }
        }
        .padding(.horizontal, 28).padding(.vertical, 26)
        .frame(width: 640)
        .background(RoundedRectangle(cornerRadius: 18).fill(Color.body))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.line))
        .shadow(color: .black.opacity(0.5), radius: 40, y: 30)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(hex: 0x080a0e, 0.72).ignoresSafeArea().onTapGesture { if !busy { close() } })
        .onAppear {
            if let m = tw.importMeta, !busy { status = "Aktiv: \(m.label) · \(m.count) Sounds" }
        }
        .fileImporter(isPresented: $picking, allowedContentTypes: [.folder]) { result in
            guard case let .success(url) = result else { return }
            run(url)
        }
    }

    private func run(_ url: URL) {
        busy = true; error = false; counts = nil; progress = 0
        status = "Ordner lesen …"
        Task {
            do {
                let r = try await Task.detached(priority: .userInitiated) {
                    try await ImportedLibrary.run(folder: url) { f, msg in progress = f; status = msg }
                }.value
                tw.adoptImport(r)
                progress = nil
                status = "\(r.meta.count) Sounds übernommen, \(r.kits) Kits erkannt" + (r.meta.failed > 0 ? ", \(r.meta.failed) Dateien nicht lesbar" : "") + "." +
                    (r.saved ? " Beim nächsten Öffnen ist die Library sofort da." : " Speichern im Gerät ging nicht, nach dem Neustart ist der Import weg.")
                counts = r.counts
            } catch {
                progress = nil
                self.error = true
                status = "Import fehlgeschlagen: " + error.localizedDescription
            }
            busy = false
        }
    }
}
