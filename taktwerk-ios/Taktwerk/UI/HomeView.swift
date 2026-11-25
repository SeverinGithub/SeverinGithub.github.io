import SwiftUI

/// Startbildschirm: Taktwerk, Sounds und Einstellungen
struct HomeView: View {
    @Environment(Taktwerk.self) private var tw
    @State private var armDelete = false

    var body: some View {
        @Bindable var tw = tw
        HStack(spacing: 0) {
            // Links: Logo und die zwei Bereiche
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .firstTextBaseline, spacing: 10) {
                        HStack(spacing: 0) {
                            Text("TAKT").foregroundStyle(Color.ink)
                            Text("WERK").foregroundStyle(Color.pA)
                        }
                        .font(.display(54))
                        Text("ALPHA").font(.mono(10, .semibold)).tracking(1.4).foregroundStyle(Color.dark)
                            .padding(.horizontal, 6).padding(.vertical, 3).background(RoundedRectangle(cornerRadius: 5).fill(Color.pB))
                    }
                    Text("Ein Drummer, kein Loop. Du gibst Tempo und Stil vor, Taktwerk spielt Phrasen mit Fills und Breaks.")
                        .font(.ui(16, .regular)).foregroundStyle(Color.muted)
                }
                HStack(spacing: 16) {
                    HomeTile(title: "Taktwerk", icon: "square.grid.3x3.fill", color: .pA,
                             lines: [tw.curStyle.name + " · \(tw.bpm) BPM", kitName, tw.playing ? "Läuft gerade" : "Bereit"]) { tw.screen = .play }
                    HomeTile(title: "Sounds", icon: "waveform", color: .pV,
                             lines: [sourcesLine, "\(tw.library?.count ?? 0) Sounds · \(tw.kits.count) Kits", "Quellen hinzufügen und anhören"]) { tw.screen = .sounds }
                }
                .frame(height: 230)
                HStack(spacing: 12) {
                    Button { tw.screen = .play; tw.openEditor(nil) } label: {
                        Label("Eigenen Groove bauen", systemImage: "plus")
                    }.buttonStyle(PanelButtonStyle())
                    if tw.playing {
                        Button { tw.stop() } label: { Label("Stopp", systemImage: "stop.fill") }.buttonStyle(PanelButtonStyle(kind: .danger))
                    }
                }
                Spacer(minLength: 0)
            }
            .padding(36)
            .frame(maxWidth: .infinity, alignment: .leading)

            Divider().overlay(Color.line)

            // Rechts: Einstellungen
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Einstellungen").font(.display(20)).foregroundStyle(Color.ink).padding(.bottom, 4)
                    SectionLabel("Wiedergabe")
                    SettingToggle(title: "Mit Musik aus anderen Apps", detail: "Taktwerk spielt zu Spotify, Apple Music oder einem Video dazu.", on: $tw.mixWithOthers)
                    SettingToggle(title: "Im Hintergrund weiterspielen", detail: "Läuft weiter, wenn das iPad gesperrt wird oder du die App wechselst.", on: $tw.backgroundPlay)
                    SettingToggle(title: "Bildschirm bleibt an", detail: "Das iPad sperrt sich nicht, solange Taktwerk offen ist.", on: $tw.keepAwake)
                    SettingToggle(title: "Hall passt sich dem Stil an", detail: "Beim Stilwechsel setzt Taktwerk den Hall passend, zum Beispiel mehr Raum bei Jazz und RnB.", on: $tw.autoReverb)
                    SectionLabel("Zurücksetzen").padding(.top, 10)
                    Button("Mixer und Effekte zurücksetzen") { tw.resetMixer() }.buttonStyle(PanelButtonStyle(wide: true))
                    Button(armDelete ? "Wirklich alle \(tw.customCount) löschen?" : "Alle eigenen Grooves löschen (\(tw.customCount))") {
                        if armDelete { tw.deleteAllGrooves(); armDelete = false } else {
                            armDelete = true
                            Task { try? await Task.sleep(for: .seconds(3)); armDelete = false }
                        }
                    }
                    .buttonStyle(PanelButtonStyle(kind: armDelete ? .armed : .danger, wide: true))
                    .disabled(tw.customCount == 0)
                    Text("Version \(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "") · Alpha")
                        .font(.mono(10)).foregroundStyle(Color.dim).padding(.top, 12)
                }
                .padding(.horizontal, 24).padding(.vertical, 30)
            }
            .frame(width: 400)
            .background(Color.panel.opacity(0.4))
        }
        .background(Color.body.ignoresSafeArea())
    }

    private var kitName: String {
        tw.kit == "synth" ? "Kit: Synth" : "Kit: " + (tw.kits.first { $0.id == tw.kit }?.name ?? tw.kit)
    }
    private var sourcesLine: String {
        let a = tw.sources.filter(\.enabled).count, n = tw.sources.count
        if n == 0 { return tw.loadingSources ? "Lade …" : "Noch keine Quelle" }
        return a == n ? "\(n) \(n == 1 ? "Quelle" : "Quellen")" : "\(a) von \(n) Quellen aktiv"
    }
}

struct HomeTile: View {
    let title: String
    let icon: String
    let color: Color
    let lines: [String]
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 0) {
                Image(systemName: icon).font(.system(size: 26, weight: .semibold)).foregroundStyle(Color.dark)
                    .frame(width: 56, height: 56).background(RoundedRectangle(cornerRadius: 14).fill(color))
                Spacer(minLength: 0)
                Text(title).font(.display(26)).foregroundStyle(Color.ink).padding(.bottom, 6)
                ForEach(lines, id: \.self) { l in Text(l).font(.ui(13, .regular)).foregroundStyle(Color.muted).lineLimit(1) }
            }
            .padding(22)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
        .buttonStyle(PadStyle(lit: false))
    }
}

struct SettingToggle: View {
    let title: String
    let detail: String
    @Binding var on: Bool
    var body: some View {
        Toggle(isOn: $on) {
            VStack(alignment: .leading, spacing: 3) {
                Text(title).font(.ui(14)).foregroundStyle(Color.ink)
                Text(detail).font(.ui(12, .regular)).foregroundStyle(Color.muted).fixedSize(horizontal: false, vertical: true)
            }
        }
        .tint(Color.pV)
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.panel))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.line))
    }
}
