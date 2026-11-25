import Foundation
import Observation
import QuartzCore

/// Gesamter Zustand der App und der Sequencer. Entspricht S und den Funktionen der Web-Fassung.
@Observable @MainActor
final class Taktwerk {
    // Stile
    var styles: [String: Style] = BUILTIN_STYLES
    var customOrder: [String] = []
    var styleOrder: [String] { BUILTIN_ORDER + customOrder }

    // Zustand wie S im Web
    var style = "house"
    var bpm = 124
    var playing = false
    var rows: [Track] = []
    var kit = "synth"
    var soundSet = "chords"
    var userKit = false
    var half = false
    var hold = false
    var parts: Parts = [:]
    var chain: [PartKey] = []
    var locked = [Bool](repeating: false, count: 16)
    var phrase = 1
    var bar = 0
    var step = 0
    var view: PartKey = .intro
    var mutes: Set<String> = []
    var macros: [String: Double] = Dictionary(uniqueKeysWithValues: MACROS.map { ($0.id, $0.initial) })
    var queued: PartKey? = nil
    private var lastOfPhrase: PartKey? = nil
    private var pendingDrop = false

    // Editor
    struct Draft { var id: String?; var name: String; var bpm: Int; var swing: Double; var rows: [Track]; var parts: Parts }
    var editing = false
    var draft = Draft(id: nil, name: "", bpm: 120, swing: 0, rows: [], parts: [:])
    var editPart: PartKey = .a
    var selTrack = "kick"

    // Library
    var library: SampleLibrary? = nil
    var importMeta: ImportMeta? = nil
    var kits: [(id: String, name: String)] = []
    var kitInfo = "Lade Samples …"
    private var bank: [String: [SampleEntry]] = [:]

    // Anzeige
    struct Vis { var step = -1; var bar = 0; var part: PartKey = .intro; var phrase = 1; var editing = false; var hits: [Bool] = [] }
    var vis = Vis()
    var meter = [Double](repeating: 0, count: 14)
    var toast: String? = nil
    private var toastTask: Task<Void, Never>? = nil

    private let core = AudioCore.shared
    private var nextTime = 0.0
    private var timer: Timer? = nil
    private var frameTimer: Timer? = nil
    private var curBar: Pattern = [:]
    private var visQ: [(time: Double, vis: Vis)] = []

    init() {
        loadGrooves()
        let d = UserDefaults.standard
        if let s = d.string(forKey: "style"), styles[s] != nil { style = s }
        if let s = d.string(forKey: "soundSet") { soundSet = s }
        applyStyle(style)
        frameTimer = Timer(timeInterval: 1 / 60, repeats: true) { [weak self] _ in MainActor.assumeIsolated { self?.frame() } }
        RunLoop.main.add(frameTimer!, forMode: .common)
        Task { await loadSamples() }
    }

    // MARK: - Hilfen

    var curStyle: Style { styles[style] ?? BUILTIN_STYLES["house"]! }
    var allTracks: [Track] { TRACKS + (editing ? draft.rows : rows) }
    func has(_ k: PartKey) -> Bool { parts[k].map { $0.values.contains { $0.contains { $0 > 0 } } } ?? false }

    func say(_ msg: String) {
        toast = msg
        toastTask?.cancel()
        toastTask = Task { try? await Task.sleep(for: .seconds(2.6)); if !Task.isCancelled { toast = nil } }
    }

    // MARK: - Arrangement

    private func nextPart(_ prev: PartKey, _ barIdx: Int, _ c: [PartKey]) -> PartKey {
        let vr = macros["variation"]! / 100, fl = macros["fills"]! / 100, hf = has(.fill)
        if barIdx == 0 && phrase == 1 && has(.intro) { return .intro }
        if hf && barIdx == 15 && rnd() < 0.25 + 0.75 * fl { return .fill }
        if hf && barIdx == 7 && rnd() < fl * 0.8 { return .fill }
        if hf && (barIdx == 3 || barIdx == 11) && rnd() < fl * 0.35 { return .fill }
        let breaks = c.filter { $0 == .brk }.count
        let tr = TRANS[prev] ?? TRANS[.a]!
        let keys: [PartKey] = [.a, .b, .v, .brk]
        let w = keys.map { k -> Double in
            var x = tr[k] ?? 0
            x = x * (1 - vr) + 0.25 * vr // Variation macht die Verteilung flacher
            if k == .brk && (breaks >= 1 || prev == .brk || barIdx < 4 || barIdx >= 14) { x = 0 }
            if !has(k) { x = 0 }
            if k == prev {
                var run = 0
                for p in c.reversed() { if p == k { run += 1 } else { break } }
                if run >= 4 - Int((vr * 2).rounded()) { x *= 0.2 }
            }
            return x
        }
        let sum = w.reduce(0, +)
        var r = rnd() * sum
        if sum > 0 { for (i, k) in keys.enumerated() { r -= w[i]; if r <= 0 && w[i] > 0 { return k } } }
        return PartKey.allCases.first { $0 != .fill && $0 != .brk && has($0) } ?? .a
    }

    func buildChain(from: Int = 0) {
        var c = Array(chain.prefix(from))
        for i in from..<16 {
            if locked[i] && i < chain.count { c.append(chain[i]); continue }
            let prev = i > 0 ? c[i - 1] : (lastOfPhrase ?? .a)
            c.append(nextPart(prev, i, c))
        }
        chain = c
    }

    // MARK: - Stile

    private func applyStyle(_ k: String) {
        let k = styles[k] != nil ? k : "house"
        style = k
        let st = styles[k]!
        bpm = st.bpm
        macros["swing"] = st.swing
        if st.custom, let g = st.groove {
            rows = sanitizeRows(g.rows)
            parts = decodeParts(g.parts, rows: rows)
        } else {
            rows = []
            parts = makeParts(st, variation: macros["variation"]!)
        }
        if !playing { phrase = 1; bar = 0; locked = .init(repeating: false, count: 16); buildChain(); view = .intro }
        else { buildChain(from: min(bar + 1, 16)) }
    }

    func setStyle(_ k: String) {
        applyStyle(k)
        UserDefaults.standard.set(style, forKey: "style")
    }

    func setBpm(_ v: Int) { bpm = clamp(v, 60, 190) }

    // MARK: - Klang

    private static let GAIN: [String: Float] = ["kick": 1, "snare": 0.8, "clap": 0.75, "hat": 0.5, "open": 0.45, "perc": 0.55, "cymbal": 0.4, "sound": 0.55, "row": 0.7]

    private static func hash(_ s: String) -> Int {
        var h: Int32 = 0
        for c in s.utf16 { h = h &* 31 &+ Int32(c) }
        return Int(h.magnitude)
    }

    private func buildBank() {
        bank = [:]
        guard let lib = library, kit != "synth" else { return }
        for id in DRUM_GROUPS {
            let all = lib.entries(id)
            if all.isEmpty { continue }
            var m = all.filter { $0.song == kit }
            if m.isEmpty { m = [all[Self.hash(kit + id) % all.count]] }
            bank[id] = m
        }
    }

    private func soundPool() -> [SampleEntry]? {
        guard let lib = library, soundSet != "off" else { return nil }
        let all = lib.entries(soundSet)
        if all.isEmpty { return nil }
        var m = kit == "synth" ? [] : all.filter { $0.song == kit }
        if m.isEmpty { let h = Self.hash(kit + soundSet); m = [0, 1, 2].map { all[(h + $0 * 7) % all.count] } }
        return m
    }

    @discardableResult
    private func playEntry(_ e: SampleEntry, _ id: String, _ t: Double, _ v: Double) -> Bool {
        let group = id == "open" ? AudioCore.Group.open : id == "sound" ? AudioCore.Group.sound : AudioCore.Group.none
        let voice = SampleVoice(e.data, from: e.start, count: e.count, gain: Float(v) * (Self.GAIN[id] ?? 0.7), group: group)
        core.schedule(voice, at: t, chokes: group, tau: 0.03)
        return true
    }

    private func synth(_ id: String, _ t: Double, _ v: Double) {
        if let s = Synth.make(id, v: v, style: style) { core.schedule(s, at: t) }
    }

    private func trig(_ id: String, _ t: Double, _ v: Double, _ step: Int, _ part: PartKey) {
        if id == "hat" { core.choke(AudioCore.Group.open, at: t, tau: 0.01) }
        if id == "sound" {
            if soundSet == "off" { return }
            if let pool = soundPool() { playEntry(pool[(PartKey.allCases.firstIndex(of: part) ?? 0) % pool.count], id, t, v); return }
            return synth("sound", t, v)
        }
        if let pool = bank[id], !pool.isEmpty {
            let e = id == "hat" ? pick(pool) : id == "perc" ? pool[step % pool.count] : pool[0]
            playEntry(e, id, t, v); return
        }
        synth(id, t, v)
    }

    private func trigRow(_ row: Track, _ t: Double, _ v: Double) {
        let p = (row.src ?? "").split(separator: "|", maxSplits: 2).map(String.init)
        guard p.count >= 2 else { return }
        if p[0] == "sample" {
            if p.count == 3, let e = library?.find(p[1], p[2]) { playEntry(e, "row", t, v); return }
            if let f = SYNTH_FOR_GROUP[p[1]] { synth(f, t, v) } // ohne Samples: ähnlicher Synth-Klang
            return
        }
        synth(p[1], t, v)
    }

    // MARK: - Library

    func loadSamples() async {
        if let (lib, meta) = await Task.detached(priority: .userInitiated, operation: { ImportedLibrary.load() }).value {
            library = lib; importMeta = meta; applyLibrary(); return
        }
        guard BundledLibrary.url != nil else { library = nil; updateKitInfo(); return }
        kitInfo = "Lade Samples …"
        let lib = await BundledLibrary.load { [weak self] d, n in self?.kitInfo = "Lade Samples … \(d)/\(n)" }
        if library?.source == .imported { return } // inzwischen eigene Library importiert
        library = lib
        if lib != nil { applyLibrary() } else { updateKitInfo() }
    }

    func applyLibrary() {
        guard let lib = library else { return }
        kits = lib.kits
        let ids = kits.map(\.id)
        let saved = UserDefaults.standard.string(forKey: "kit")
        if let saved, saved == "synth" || ids.contains(saved) { kit = saved; userKit = true }
        else if !userKit || !ids.contains(kit) { kit = ids.contains("tomo") ? "tomo" : (ids.first ?? "synth") }
        buildBank(); updateKitInfo()
    }

    func setKit(_ k: String) {
        kit = k; userKit = true
        UserDefaults.standard.set(k, forKey: "kit")
        buildBank(); updateKitInfo()
    }

    func setSoundSet(_ s: String) { soundSet = s; UserDefaults.standard.set(s, forKey: "soundSet") }

    private func updateKitInfo() {
        guard let lib = library else { kitInfo = "Ohne Library-Samples: Drums und Sounds als Synth-Klänge."; return }
        let src = lib.source == .imported ? "Eigene Library" : "Higher Place"
        if kit == "synth" { kitInfo = "Synth-Drums · Sounds aus \(src)"; return }
        let mine = DRUM_GROUPS.filter { bank[$0]?.first?.song == kit }
        let n = mine.reduce(0) { $0 + (bank[$1]?.count ?? 0) }
        kitInfo = "\(src) · \(n) Drum-Samples · \(mine.count) von 7 Spuren aus dem Kit"
    }

    func adoptImport(_ r: ImportedLibrary.Result) {
        if playing { stop() }
        library = r.library; importMeta = r.meta; userKit = false
        UserDefaults.standard.removeObject(forKey: "kit")
        applyLibrary()
    }

    func removeImport() async {
        ImportedLibrary.clear()
        importMeta = nil; library = nil; userKit = false; bank = [:]; kits = []
        UserDefaults.standard.removeObject(forKey: "kit")
        await loadSamples()
        if library == nil { kit = "synth"; updateKitInfo() }
    }

    // MARK: - Wiedergabe

    /// Takt mit Mikrovariation (Dichte, Ghosts)
    private func renderBar(_ key: PartKey) -> Pattern {
        var p = parts[key] ?? [:]
        let dn = macros["density"]! / 100, gh = macros["ghost"]! / 100
        for tr in ["hat", "perc", "open"] {
            guard let lane = p[tr] else { continue }
            p[tr] = lane.map { x in
                if x > 0 && x < 0.8 && dn < 0.5 && rnd() < (0.5 - dn) * 1.4 { return 0 }
                if x == 0 && tr == "hat" && dn > 0.5 && rnd() < (dn - 0.5) * 0.6 { return 0.25 + rnd() * 0.2 }
                return x
            }
        }
        if key != .intro && key != .fill, var sn = p["snare"] {
            let cl = p["clap"] ?? zeros()
            for i in 0..<16 where sn[i] == 0 && cl[i] == 0 && i % 4 != 0 && rnd() < gh * 0.14 { sn[i] = 0.16 + rnd() * 0.12 }
            p["snare"] = sn
        }
        return p
    }

    private var stepDur: Double { 60 / Double(editing ? draft.bpm : bpm) / 4 * (half && !editing ? 2 : 1) }

    private func advanceBar() {
        if hold || editing { return } // Teil halten, im Editor immer
        bar += 1
        if bar >= 16 {
            lastOfPhrase = chain[15]; phrase += 1; bar = 0; locked = .init(repeating: false, count: 16)
            buildChain()
            if pendingDrop { chain[0] = .a; pendingDrop = false }
        }
    }

    private func scheduler() {
        let ahead = 0.15
        while nextTime < core.currentTime + ahead {
            var crash = false
            let curPart = editing ? editPart : chain[bar]
            if editing {
                curBar = draft.parts[editPart] ?? [:] // jede Änderung sofort hörbar
            } else if step == 0 {
                if let q = queued { chain[bar] = q; locked[bar] = true; queued = nil }
                curBar = renderBar(chain[bar])
                let prev: PartKey? = bar > 0 ? chain[bar - 1] : (phrase > 1 ? .fill : nil)
                crash = prev == .fill && chain[bar] != .brk
            }
            let sd = stepDur
            // Swing auf den 16teln, im Jazz auf den Achteln (bis zur Triole)
            let st8 = !editing && curStyle.swing8
            let sw = ((editing ? draft.swing : macros["swing"]!) / 100) * (st8 ? 0.67 : 0.33) * sd
            let hum = macros["human"]! / 100
            let t0 = nextTime + ((st8 ? step % 4 == 2 : step % 2 == 1) ? sw : 0)
            let TL = allTracks
            for tr in TL {
                let v = curBar[tr.id]?[step] ?? 0
                if v == 0 || (mutes.contains(tr.id) && !editing) { continue }
                if half && !editing && tr.id == "kick" && step == 8 { continue }
                let jt = hum * (rnd() * 2 - 1) * 0.009
                let vv = clamp(v * (1 - hum * 0.25 * rnd()), 0.05, 1.1)
                let tt = max(core.currentTime, t0 + jt)
                if tr.src != nil { trigRow(tr, tt, vv) } else { trig(tr.id, tt, vv, step, curPart) }
            }
            if crash, let cy = bank["cymbal"], !cy.isEmpty { playEntry(cy[0], "cymbal", t0, 0.85) }
            let hits = TL.map { t in (curBar[t.id]?[step] ?? 0) > 0 && (editing || !mutes.contains(t.id)) }
            visQ.append((t0, Vis(step: step, bar: bar, part: curPart, phrase: phrase, editing: editing, hits: hits)))
            nextTime += sd
            step += 1
            if step >= 16 { step = 0; advanceBar() }
        }
    }

    func start() {
        core.start()
        playing = true; step = 0; nextTime = core.currentTime + 0.06
        let t = Timer(timeInterval: 0.025, repeats: true) { [weak self] _ in MainActor.assumeIsolated { self?.scheduler() } }
        RunLoop.main.add(t, forMode: .common)
        timer = t
        scheduler()
    }

    func stop() {
        playing = false
        timer?.invalidate(); timer = nil
        visQ.removeAll()
        vis.step = -1
        core.stopAll()
    }

    func toggle() { playing ? stop() : start() }

    /// 60 Hz: Playhead an der Audio-Uhr, Pegelanzeige
    private func frame() {
        guard playing else {
            if meter.contains(where: { $0 > 0.001 }) { meter = meter.map { $0 * 0.8 } }
            return
        }
        let now = core.hearTime
        var ev: Vis? = nil
        while let f = visQ.first, f.time <= now { ev = f.vis; visQ.removeFirst() }
        if let ev { vis = ev }
        updateMeter()
    }

    private func updateMeter() {
        let x = core.meterSnapshot()
        let n = 256, base = x.count - n
        var out = meter
        for b in 0..<14 {
            let k = Double(b * 8)
            var re = 0.0, im = 0.0
            for i in 0..<n {
                let w = 0.5 - 0.5 * cos(2 * .pi * Double(i) / Double(n - 1))
                let s = Double(x[base + i]) * w
                let a = 2 * .pi * k * Double(i) / Double(n)
                re += s * cos(a); im -= s * sin(a)
            }
            let mag = sqrt(re * re + im * im) / Double(n)
            let db = 20 * log10(max(mag, 1e-9))
            let v = clamp((db + 100) / 70, 0, 1) // wie getByteFrequencyData: −100 … −30 dB
            out[b] = 0.8 * out[b] + 0.2 * v
        }
        meter = out
    }

    // MARK: - Eingriffe

    func padFill() { guard playing else { return say("Erst Play drücken.") }; queued = .fill }
    func padBreak() { guard playing else { return say("Erst Play drücken.") }; queued = .brk }
    func padDrop() {
        guard playing else { return say("Erst Play drücken.") }
        // Groove A im nächsten Takt, der Rest der Phrase wird neu geplant
        queued = .a; locked = .init(repeating: false, count: 16); buildChain(from: min(bar + 1, 15)); say("Drop: Groove A im nächsten Takt.")
    }
    func padHalf() { half.toggle() }
    func padMutate() {
        if curStyle.custom { return say("Eigene Grooves bleiben, wie du sie gebaut hast. Ändern über den Stift.") }
        let np = makeParts(curStyle, variation: macros["variation"]!)
        parts[.b] = np[.b]; parts[.v] = np[.v]
        say("Groove B und Variation sind neu.")
    }
    func padHold() { hold.toggle() }
    func reroll() { buildChain(from: playing ? min(bar + 1, 16) : 0) }
    func unlock() { locked = .init(repeating: false, count: 16) }
    func regenParts() {
        if curStyle.custom { return say("Eigene Grooves bleiben, wie du sie gebaut hast. Ändern über den Stift.") }
        parts = makeParts(curStyle, variation: macros["variation"]!)
        say("Alle Teile neu erzeugt.")
    }
    func tapPart(_ k: PartKey) {
        if playing { queued = k; say("\(k.name) kommt im nächsten Takt.") } else { view = k }
    }
    func tapChain(_ i: Int) {
        let nowBar = playing ? vis.bar : -1
        if i <= nowBar { return }
        let order: [PartKey] = [.a, .b, .v, .fill, .brk, .intro]
        chain[i] = order[((order.firstIndex(of: chain[i]) ?? 0) + 1) % order.count]
        locked[i] = true
        buildChain(from: i + 1)
    }
    func macroReleased(_ id: String) { if id == "variation" || id == "fills" { reroll() } }
    func toggleMute(_ id: String) { if mutes.contains(id) { mutes.remove(id) } else { mutes.insert(id) } }
    func toggleCell(_ key: PartKey, _ track: String, _ i: Int) {
        var lane = parts[key]?[track] ?? zeros()
        lane[i] = lane[i] > 0 ? 0 : 0.85
        parts[key, default: [:]][track] = lane
    }

    // MARK: - Eigene Grooves: Speicher

    private var groovesURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("grooves.json")
    }

    private func loadGrooves() {
        guard let d = try? Data(contentsOf: groovesURL), let list = try? JSONDecoder().decode([GrooveDoc].self, from: d) else { return }
        for g in list.sorted(by: { $0.updated < $1.updated }) { addCustom(g) }
    }

    private func saveGrooves() -> Bool {
        let list = customOrder.compactMap { styles[$0]?.groove }
        do { try JSONEncoder().encode(list).write(to: groovesURL, options: .atomic); return true } catch { return false }
    }

    private func addCustom(_ d: GrooveDoc) {
        guard matches("^g[a-z0-9]+$", d.id) else { return }
        styles[d.id] = Style(name: String((d.name.isEmpty ? "Mein Groove" : d.name).prefix(24)), bpm: clamp(d.bpm, 60, 190),
                             swing: clamp(d.swing, 0, 100), custom: true, groove: d)
        if !customOrder.contains(d.id) { customOrder.append(d.id) }
    }

    // MARK: - Groove-Editor

    func openEditor(_ id: String?) {
        if playing { stop() }
        let st = id.flatMap { styles[$0] }.flatMap { $0.custom ? $0 : nil }
        let n = customOrder.count + 1
        if let st, let g = st.groove {
            let r = sanitizeRows(g.rows)
            draft = Draft(id: id, name: st.name, bpm: st.bpm, swing: st.swing, rows: r, parts: decodeParts(g.parts, rows: r))
        } else {
            draft = Draft(id: nil, name: "Mein Groove \(n)", bpm: bpm, swing: macros["swing"]!.rounded(), rows: rows, parts: parts)
        }
        fillRows(&draft.parts, draft.rows)
        editPart = .a; selTrack = "kick"
        editing = true
    }

    func closeEditor() { if playing { stop() }; editing = false }

    var selRow: Track? { draft.rows.first { $0.id == selTrack } }
    var selTrackName: String { (TRACKS + draft.rows).first { $0.id == selTrack }?.name ?? "Kick" }

    func edCell(_ track: String, _ i: Int) {
        var lane = draft.parts[editPart]?[track] ?? zeros()
        let v = lane[i]
        lane[i] = v == 0 ? 0.75 : v >= 0.9 ? 0.38 : v >= 0.6 ? 1 : 0 // an → betont → leise → aus
        draft.parts[editPart, default: [:]][track] = lane
        selTrack = track
    }

    private func edLane(_ f: (inout Steps) -> Void) {
        var lane = draft.parts[editPart]?[selTrack] ?? zeros()
        f(&lane)
        draft.parts[editPart, default: [:]][selTrack] = lane
    }
    func edRotate(_ dir: Int) { edLane { l in if dir < 0 { l.append(l.removeFirst()) } else { l.insert(l.removeLast(), at: 0) } } }
    func edTrackClear() { edLane { $0 = zeros() } }
    func edEuclid(_ k: Int) { edLane { $0 = euclid(k, 16, 0).map { $0 > 0 ? 0.75 : 0 } } }
    func edClear() { draft.parts[editPart] = emptyPart(); fillRows(&draft.parts, draft.rows) }
    func edDice(base: String) {
        // würfelt die festen Spuren neu, eigene Reihen bleiben stehen
        let keep: Parts = [editPart: draft.parts[editPart] ?? [:]]
        draft.parts[editPart] = base == "empty" ? emptyPart() : makeParts(styles[base]!, variation: macros["variation"]!)[editPart]
        fillRows(&draft.parts, draft.rows, keepFrom: keep)
    }
    func edCopy(from: PartKey) {
        draft.parts[editPart] = draft.parts[from]
        say("\(from.name) nach \(editPart.name) kopiert.")
    }
    func edLoadBase(_ base: String) {
        let keep = draft.parts
        if base == "empty" {
            draft.parts = Dictionary(uniqueKeysWithValues: PartKey.allCases.map { ($0, emptyPart()) })
            fillRows(&draft.parts, draft.rows)
            say("Alle Teile geleert.")
        } else {
            let st = styles[base]!
            draft.parts = makeParts(st, variation: macros["variation"]!)
            fillRows(&draft.parts, draft.rows, keepFrom: keep)
            draft.bpm = st.bpm; draft.swing = st.swing
            say("Alle Teile im Stil \(st.name) erzeugt.")
        }
    }

    func addRow() {
        guard draft.rows.count < 8 else { return }
        let r = Track(id: "r" + String(Int(Date().timeIntervalSince1970 * 1000), radix: 36), name: "Neue Reihe", src: "synth|tom")
        draft.rows.append(r); fillRows(&draft.parts, [r])
        selTrack = r.id
    }
    func renameRow(_ name: String) {
        guard let i = draft.rows.firstIndex(where: { $0.id == selTrack }) else { return }
        draft.rows[i].name = String(name.prefix(16))
    }
    func finishRename() {
        guard let i = draft.rows.firstIndex(where: { $0.id == selTrack }) else { return }
        if draft.rows[i].name.trimmingCharacters(in: .whitespaces).isEmpty { draft.rows[i].name = "Reihe" }
    }
    static func soundLabel(_ src: String) -> String {
        let p = src.split(separator: "|", maxSplits: 2).map(String.init)
        if p.first == "sample", p.count == 3 { return String(p[2].prefix(16)) }
        return SYNTH_OPTS.first { "synth|" + $0.id == src }?.label ?? src
    }
    func setRowSound(_ src: String) {
        guard let i = draft.rows.firstIndex(where: { $0.id == selTrack }) else { return }
        let old = draft.rows[i].src ?? ""
        draft.rows[i].src = src
        // Standardname durch den Sound ersetzen
        if draft.rows[i].name == "Neue Reihe" || draft.rows[i].name == Self.soundLabel(old) { draft.rows[i].name = Self.soundLabel(src) }
        previewRow()
    }
    func previewRow() {
        guard let r = selRow else { return }
        core.start()
        trigRow(r, core.currentTime + 0.03, 0.9)
    }
    func deleteRow() {
        guard let r = selRow else { return }
        draft.rows.removeAll { $0.id == r.id }
        for k in PartKey.allCases { draft.parts[k]?[r.id] = nil }
        selTrack = "kick"
        say("Reihe „\(r.name)“ entfernt.")
    }

    func edSave() {
        let d = draft
        if !PartKey.allCases.contains(where: { k in d.parts[k]?.values.contains { $0.contains { $0 > 0 } } ?? false }) {
            return say("Der Groove ist noch leer. Setz mindestens einen Schlag.")
        }
        let name = String((d.name.trimmingCharacters(in: .whitespaces).isEmpty ? "Mein Groove" : d.name.trimmingCharacters(in: .whitespaces)).prefix(24))
        let id = d.id ?? ("g" + String(Int(Date().timeIntervalSince1970 * 1000), radix: 36))
        let rowDocs = d.rows.map { RowDoc(id: $0.id, name: $0.name, src: $0.src ?? "synth|tom") }
        let doc = GrooveDoc(id: id, name: name, bpm: d.bpm, swing: d.swing, rows: rowDocs, parts: encodeParts(d.parts, rows: d.rows),
                            updated: Date().timeIntervalSince1970 * 1000)
        addCustom(doc)
        let ok = saveGrooves()
        closeEditor(); setStyle(id)
        say(ok ? "„\(name)“ gespeichert." : "„\(name)“ läuft jetzt, konnte aber nicht dauerhaft gespeichert werden.")
    }

    func edDelete() {
        guard let id = draft.id else { return }
        let name = draft.name
        styles[id] = nil; customOrder.removeAll { $0 == id }
        _ = saveGrooves()
        closeEditor()
        if style == id { setStyle("house") }
        say("„\(name)“ gelöscht.")
    }
}
