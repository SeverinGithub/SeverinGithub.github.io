import AVFoundation
import Foundation

/// Ein One-Shot aus der Library
struct SampleEntry: Identifiable {
    var id: String { group + "|" + name }
    let name: String
    let song: String
    let songName: String
    let key: String?
    let group: String
    let data: SampleData
    let start: Int
    let count: Int
}

struct SampleLibrary {
    enum Source { case bundled, imported }
    var source: Source
    var groups: [String: [SampleEntry]]

    func entries(_ g: String) -> [SampleEntry] { groups[g] ?? [] }
    func find(_ g: String, _ name: String) -> SampleEntry? { groups[g]?.first { $0.name == name } }

    /// Songs, die mindestens ein Drum-Sample haben – jeder ist ein Kit
    var kits: [(id: String, name: String)] {
        var names: [String: String] = [:]
        for list in groups.values { for e in list where !e.song.isEmpty && names[e.song] == nil { names[e.song] = e.songName.isEmpty ? e.song : e.songName } }
        let ids = names.keys.filter { s in DRUM_GROUPS.contains { g in entries(g).contains { $0.song == s } } }
        return ids.map { ($0, prettify(names[$0]!)) }.sorted { $0.name.localizedCompare($1.name) == .orderedAscending }
    }
}

/// "HigherPlace" -> "Higher Place"
func prettify(_ s: String) -> String {
    s.replacingOccurrences(of: "([a-z])([A-Z0-9])", with: "$1 $2", options: .regularExpression)
}

// MARK: - Zuordnung (wie classify() im Web)

private var reCache: [String: NSRegularExpression] = [:]
private let reLock = NSLock()
func matches(_ pattern: String, _ s: String) -> Bool {
    reLock.lock(); defer { reLock.unlock() }
    let re: NSRegularExpression
    if let c = reCache[pattern] { re = c } else { re = try! NSRegularExpression(pattern: pattern); reCache[pattern] = re }
    return re.firstMatch(in: s, range: NSRange(s.startIndex..., in: s)) != nil
}

enum Classifier {
    static let audioExt = "\\.(wav|wave|aif|aiff|mp3|m4a|aac|flac|caf)$"
    static let keyRe = "^[A-G][#b]?(m|m7|m9|7|9|maj7)?$"
    static let maxLen: [String: Double] = ["kick": 0.9, "snare": 0.8, "clap": 0.8, "hat": 0.45, "open": 1, "perc": 0.8, "cymbal": 2.5, "bass": 1.6]

    /// Drum-Sample: Dateiname schlägt Ordnername
    static func drumGroup(_ folder: String, _ file: String) -> String {
        let f = file.lowercased(), d = folder.lowercased()
        if matches("open", f) && matches("hh|hat|open", f + d) { return "open" }
        if matches("\\brim", f) { return "perc" }
        let rules: [(String, String)] = [
            ("open", "open ?h|\\bohh?\\b"), ("hat", "hh|hi-?hat|hat\\b|hats\\b|closed"), ("kick", "kick|\\bbd\\b|bass ?drum"),
            ("snare", "snare|\\bsd\\b"), ("clap", "clap|snap"), ("cymbal", "crash|ride|cymbal|splash|china"),
            ("perc", "tom|conga|bongo|perc|shaker|tamb|cowbell|cabasa|wood|clave|vibra|block|triangle|rim"),
        ]
        for txt in [d, f] { for (g, re) in rules where matches(re, txt) { return g } }
        return "perc"
    }

    static func oneShotGroup(_ folder: String, _ file: String) -> String {
        let rules: [(String, String)] = [
            ("pads", "pad"), ("bass", "bass|\\bsub\\b"), ("vocals", "vocal|\\bvoc\\b|vox|chop"), ("fx", "effect|\\bfx\\b|sfx|zap|riser|impact|noise"),
            ("brass", "brass|horn|trumpet|trombone|sax"), ("strings", "string|bowed|violin|viola|cello"),
            ("keys", "organ|mallet|guitar|lead|keys?\\b|piano|rhodes|bell|pluck|marimba"), ("chords", "chord|stab|synth|misc"),
        ]
        for txt in [folder.lowercased(), file.lowercased()] { for (g, re) in rules where matches(re, txt) { return g } }
        return "chords"
    }

    /// Pfad → Gruppe und Name, oder nil, wenn die Datei nicht unter Drums/One Shots liegt
    static func classify(_ path: String) -> (g: String, name: String)? {
        let segs = path.split(separator: "/").map(String.init)
        guard let file = segs.last else { return nil }
        let lowFile = file.lowercased()
        if !matches(audioExt, lowFile) || file.hasPrefix("._") || segs.contains("__MACOSX") { return nil }
        let name = file.replacingOccurrences(of: audioExt, with: "", options: [.regularExpression, .caseInsensitive])
        let low = segs.map { $0.lowercased() }
        let di = low.firstIndex { $0 == "drums" || $0 == "drum" || $0 == "drum one shots" }
        let oi = low.firstIndex { matches("^one[ _-]?shots?$", $0) }
        if let di, di < segs.count - 1 { return (drumGroup(segs[(di + 1)..<(segs.count - 1)].joined(separator: " "), name), name) }
        if let oi, oi < segs.count - 1 { return (oneShotGroup(segs[(oi + 1)..<(segs.count - 1)].joined(separator: " "), name), name) }
        return nil
    }

    /// "Kick Tomo 3" → song "tomo"; "Bass Am Tomo" → Tonart Am
    static func songOf(_ name: String) -> (song: String, songName: String, key: String?) {
        var toks = name.split(whereSeparator: \.isWhitespace).map(String.init).dropFirst().map { $0 }
        var key: String? = nil
        if let f = toks.first, matches(keyRe, f) { key = f; toks.removeFirst() }
        let rest = toks.filter { !matches("^\\d+$", $0) && !["ds", "ps", "mnrk"].contains($0.lowercased()) }
        let songName = rest.first ?? ""
        let song = songName.lowercased().replacingOccurrences(of: "[^a-z0-9]", with: "", options: .regularExpression)
        return (song, songName, key)
    }
}

// MARK: - Dateien lesen

enum AudioDecode {
    /// Datei → Kanäle als Float, mit Abtastrate
    static func read(_ url: URL) throws -> (channels: [[Float]], sr: Double) {
        let file = try AVAudioFile(forReading: url)
        let fmt = file.processingFormat
        let n = AVAudioFrameCount(file.length)
        guard n > 0, let buf = AVAudioPCMBuffer(pcmFormat: fmt, frameCapacity: n) else { return ([], fmt.sampleRate) }
        try file.read(into: buf)
        guard let ch = buf.floatChannelData else { return ([], fmt.sampleRate) }
        let len = Int(buf.frameLength)
        let chans = (0..<Int(fmt.channelCount)).map { Array(UnsafeBufferPointer(start: ch[$0], count: len)) }
        return (chans, fmt.sampleRate)
    }

    /// Mono, Stille vorne weg, auf Maximallänge kürzen, ausblenden, normalisieren (wie shapeSample im Web)
    static func shape(_ chans: [[Float]], sr: Double, group: String) -> [Float]? {
        guard let n0 = chans.first?.count, n0 > 0 else { return nil }
        var mono = [Float](repeating: 0, count: n0)
        let k = Float(chans.count)
        for c in chans { for i in 0..<n0 { mono[i] += c[i] / k } }
        var peak: Float = 0
        for x in mono { peak = max(peak, abs(x)) }
        if peak < 1e-5 { return nil }
        var s = 0
        let thr = peak * 0.02
        while s < n0 && abs(mono[s]) < thr { s += 1 }
        s = max(0, s - Int(sr * 0.001))
        let mx = Classifier.maxLen[group] ?? 3
        let n = min(n0 - s, Int(sr * mx))
        let fade = min(n, Int(sr * (mx < 1 ? 0.03 : 0.25)))
        let gain = 0.89 / peak
        var out = [Float](repeating: 0, count: n)
        for i in 0..<n {
            let f: Float = i < n - fade ? 1 : Float(n - i) / Float(fade)
            out[i] = max(-1, min(1, mono[s + i] * gain * f))
        }
        return out
    }
}

// MARK: - Mitgelieferte Sprites (lokal gebaut, nicht im Repo)

private struct Manifest: Decodable {
    struct Entry: Decodable { let name: String; let song: String?; let songName: String?; let key: String?; let start: Double; let dur: Double }
    struct Group: Decodable { let file: String?; let entries: [Entry] }
    let groups: [String: Group]
}

enum BundledLibrary {
    static var url: URL? { Bundle.main.url(forResource: "manifest", withExtension: "json", subdirectory: "Samples") }

    static func load(progress: @escaping (Int, Int) -> Void) async -> SampleLibrary? {
        guard let murl = url, let data = try? Data(contentsOf: murl),
              let man = try? JSONDecoder().decode(Manifest.self, from: data) else { return nil }
        let dir = murl.deletingLastPathComponent()
        var groups: [String: [SampleEntry]] = [:]
        var done = 0
        let total = man.groups.count
        await withTaskGroup(of: (String, [SampleEntry]).self) { tg in
            for (g, grp) in man.groups {
                tg.addTask {
                    guard let file = grp.file, let (chans, sr) = try? AudioDecode.read(dir.appendingPathComponent(file)), let d = chans.first else { return (g, []) }
                    let sd = SampleData(d, sr: sr)
                    // AAC verschiebt den Anfang leicht: echten Einsatz jedes Samples im Sprite suchen
                    let entries = grp.entries.map { e -> SampleEntry in
                        let a = max(0, Int((e.start - 0.06) * sr)), b = min(d.count, Int((e.start + 0.15) * sr))
                        var pk: Float = 0
                        for i in a..<min(d.count, b + Int(0.05 * sr)) { pk = max(pk, abs(d[i])) }
                        let thr = pk * 0.08
                        var i = a
                        while i < b && abs(d[i]) < thr { i += 1 }
                        let s = max(0, Int((Double(i) / sr - 0.002) * sr))
                        return SampleEntry(name: e.name, song: e.song ?? "", songName: e.songName ?? "", key: e.key, group: g,
                                           data: sd, start: s, count: Int(e.dur * sr))
                    }
                    return (g, entries)
                }
            }
            for await (g, list) in tg {
                groups[g] = list
                done += 1
                let d = done
                await MainActor.run { progress(d, total) }
            }
        }
        for g in ALL_GROUPS where groups[g] == nil { groups[g] = [] }
        return SampleLibrary(source: .bundled, groups: groups)
    }
}

// MARK: - Eigener Import (Ordner mit „Drums“ und „One Shots“), im Gerät gespeichert

struct ImportMeta: Codable { var label: String; var count: Int; var failed: Int; var date: Double }

private struct StoredRecord: Codable {
    let g: String, name: String, song: String, songName: String, key: String?
    let sr: Double, offset: Int, count: Int
}
private struct StoredIndex: Codable { let meta: ImportMeta; let records: [StoredRecord] }

enum ImportedLibrary {
    private static var dir: URL {
        let d = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("Library", isDirectory: true)
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }
    private static var indexURL: URL { dir.appendingPathComponent("index.json") }
    private static var pcmURL: URL { dir.appendingPathComponent("samples.pcm") }

    static func load() -> (SampleLibrary, ImportMeta)? {
        guard let idata = try? Data(contentsOf: indexURL), let idx = try? JSONDecoder().decode(StoredIndex.self, from: idata),
              let pcm = try? Data(contentsOf: pcmURL), !idx.records.isEmpty else { return nil }
        var groups: [String: [SampleEntry]] = [:]
        for g in ALL_GROUPS { groups[g] = [] }
        pcm.withUnsafeBytes { raw in
            let p = raw.bindMemory(to: Int16.self)
            for r in idx.records where r.offset + r.count <= p.count {
                let f = (0..<r.count).map { Float(p[r.offset + $0]) / 32767 }
                let e = SampleEntry(name: r.name, song: r.song, songName: r.songName, key: r.key, group: r.g, data: SampleData(f, sr: r.sr), start: 0, count: r.count)
                groups[r.g, default: []].append(e)
            }
        }
        return (SampleLibrary(source: .imported, groups: groups), idx.meta)
    }

    static func clear() {
        try? FileManager.default.removeItem(at: indexURL)
        try? FileManager.default.removeItem(at: pcmURL)
    }

    struct Result { let library: SampleLibrary; let meta: ImportMeta; let counts: [String: Int]; let kits: Int; let saved: Bool }
    enum Failure: Error, LocalizedError {
        case nothingFound, nothingReadable
        var errorDescription: String? {
            switch self {
            case .nothingFound: "Keine Sounds gefunden. Der gewählte Ordner muss die Unterordner „Drums“ oder „One Shots“ enthalten."
            case .nothingReadable: "Keine Datei ließ sich lesen. Unterstützt werden WAV, AIFF, MP3, M4A und FLAC."
            }
        }
    }

    /// Alle Audiodateien unter Drums/One Shots, mit Gruppe und Name
    private static func scan(_ folder: URL) -> [(url: URL, g: String, name: String)] {
        let root = folder.lastPathComponent
        let rootPath = folder.standardizedFileURL.path
        var todo: [(url: URL, g: String, name: String)] = []
        if let en = FileManager.default.enumerator(at: folder, includingPropertiesForKeys: [.isRegularFileKey], options: [.skipsHiddenFiles]) {
            while let u = en.nextObject() as? URL {
                let rel = String(u.standardizedFileURL.path.dropFirst(rootPath.count))
                if let c = Classifier.classify(root + rel) { todo.append((u, c.g, c.name)) }
            }
        }
        return todo.sorted { $0.url.path < $1.url.path }
    }

    /// Läuft im Hintergrund; progress(Anteil, Text) kommt auf dem Hauptthread an
    static func run(folder: URL, progress: @escaping @MainActor (Double, String) -> Void) async throws -> Result {
        let access = folder.startAccessingSecurityScopedResource()
        defer { if access { folder.stopAccessingSecurityScopedResource() } }
        let root = folder.lastPathComponent
        let todo = scan(folder)
        if todo.isEmpty { throw Failure.nothingFound }

        var records: [StoredRecord] = []
        var pcm = Data()
        var entries: [String: [SampleEntry]] = [:]
        for g in ALL_GROUPS { entries[g] = [] }
        var failed = 0
        for (i, it) in todo.enumerated() {
            if let (chans, sr) = try? AudioDecode.read(it.url), let shaped = AudioDecode.shape(chans, sr: sr, group: it.g) {
                let so = Classifier.songOf(it.name)
                let offset = pcm.count / 2
                var ints = shaped.map { Int16(max(-32767, min(32767, ($0 * 32767).rounded()))) }
                pcm.append(Data(bytes: &ints, count: ints.count * 2))
                records.append(StoredRecord(g: it.g, name: it.name, song: so.song, songName: so.songName, key: so.key, sr: sr, offset: offset, count: shaped.count))
                entries[it.g, default: []].append(SampleEntry(name: it.name, song: so.song, songName: so.songName, key: so.key, group: it.g,
                                                               data: SampleData(shaped, sr: sr), start: 0, count: shaped.count))
            } else { failed += 1 }
            if i % 5 == 0 || i == todo.count - 1 {
                let f = Double(i + 1) / Double(todo.count), msg = "Sounds verarbeiten … \(i + 1) von \(todo.count)"
                await progress(f, msg)
            }
        }
        if records.isEmpty { throw Failure.nothingReadable }
        for g in ALL_GROUPS { entries[g]!.sort { $0.name.localizedStandardCompare($1.name) == .orderedAscending } }
        let meta = ImportMeta(label: root, count: records.count, failed: failed, date: Date().timeIntervalSince1970)
        await progress(1, "Im Gerät speichern …")
        var saved = true
        do {
            try pcm.write(to: pcmURL, options: .atomic)
            try JSONEncoder().encode(StoredIndex(meta: meta, records: records)).write(to: indexURL, options: .atomic)
        } catch { saved = false }
        var counts: [String: Int] = [:]
        for r in records { counts[r.g, default: 0] += 1 }
        let kits = Set(records.filter { DRUM_GROUPS.contains($0.g) && !$0.song.isEmpty }.map(\.song)).count
        return Result(library: SampleLibrary(source: .imported, groups: entries), meta: meta, counts: counts, kits: kits, saved: saved)
    }
}
