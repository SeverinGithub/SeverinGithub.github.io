import Foundation

// Pattern-Erzeugung: aus der Vorlage eines Stils entstehen die sechs Teile.

typealias Parts = [PartKey: Pattern]

func rnd() -> Double { Double.random(in: 0..<1) }
func pick<T>(_ a: [T]) -> T { a[Int(rnd() * Double(a.count)) % a.count] }
func clamp<T: Comparable>(_ v: T, _ a: T, _ b: T) -> T { max(a, min(b, v)) }
func zeros() -> Steps { Array(repeating: 0, count: 16) }

/// "x" betont, "o" an, "g" Ghost, "." aus
func parse(_ s: String) -> Steps {
    var out = s.map { c -> Double in c == "x" ? 1 : c == "o" ? 0.75 : c == "g" ? 0.38 : 0 }
    if out.count < 16 { out += Array(repeating: 0, count: 16 - out.count) }
    return Array(out.prefix(16))
}
func encodeStep(_ v: Double) -> Character { v >= 0.9 ? "x" : v >= 0.6 ? "o" : v > 0 ? "g" : "." }

func euclid(_ k: Int, _ n: Int, _ rot: Int) -> Steps {
    var out = Array(repeating: 0.0, count: n)
    for i in 0..<n where (i * k) % n < k { out[(i + rot) % n] = 1 }
    return out
}

/// Fehlende Spuren eigener Reihen ergänzen (optional aus einem älteren Stand übernehmen)
func fillRows(_ parts: inout Parts, _ rows: [Track], keepFrom: Parts? = nil) {
    for k in PartKey.allCases {
        var p = parts[k] ?? [:]
        for r in rows where p[r.id] == nil { p[r.id] = keepFrom?[k]?[r.id] ?? zeros() }
        parts[k] = p
    }
}

func basePattern(_ st: Style) -> Pattern {
    var o: Pattern = [:]
    for t in TRACKS { o[t.id] = parse(st.lanes[t.id] ?? "................") }
    return o
}

private let SOUND_POS: [PartKey: [[Int]]] = [
    .intro: [[0], [0, 8]], .a: [[0], [0, 10], [6, 14], [0, 7]], .b: [[3, 10], [0, 11], [2, 8, 14]],
    .v: [[0, 3, 6, 10], [4, 12], [2, 6, 10, 14]], .fill: [[0]], .brk: [[0], [0, 8]],
]

func makeParts(_ st: Style, variation: Double) -> Parts {
    let vr = variation / 100
    let A = basePattern(st)
    // Groove B: Kick verschieben/ergänzen, Percussion euklidisch neu
    var B = A
    if st.four {
        B["kick"]![14] = rnd() < 0.6 ? 0.55 : 0
        B["kick"]![7] = rnd() < 0.3 ? 0.45 : 0
    } else {
        let mv = pick([3, 6, 7, 11, 13, 14]); B["kick"]![mv] = 0.8
        if rnd() < 0.5 { B["kick"]![10] = 0; B["kick"]![pick([9, 11])] = 0.9 }
    }
    let k = 3 + Int(rnd() * (3 + vr * 3))
    B["perc"] = euclid(k, 16, Int(rnd() * 16)).enumerated().map { i, x in x > 0 ? (i % 4 == 0 ? 0.8 : 0.55) : 0 }
    if rnd() < 0.5 { B["open"]![14] = 0.8 }
    // Variation: Hats in 16teln, Clap verschoben, dichte Perc
    var V = A
    V["hat"] = V["hat"]!.enumerated().map { i, x in x > 0 ? x : (rnd() < 0.55 ? (i % 2 == 1 ? 0.3 : 0.5) : 0) }
    V["perc"] = euclid(pick([5, 7]), 16, Int(rnd() * 4)).map { $0 > 0 ? 0.45 + 0.4 * rnd() : 0 }
    if V["clap"]!.contains(where: { $0 > 0 }) { V["clap"]![15] = 0.5 } else { V["snare"]![15] = 0.4 }
    if rnd() < 0.5 { V["open"] = zeros(); V["open"]![6] = 0.7; V["open"]![14] = 0.7 }
    // Intro: Kick und dünne Hats
    var I: Pattern = ["kick": A["kick"]!, "snare": zeros(), "clap": zeros(),
                      "hat": A["hat"]!.enumerated().map { i, x in i % 4 == 2 ? max(x, 0.5) : 0 },
                      "open": zeros(), "perc": A["perc"]!.map { $0 * 0.5 }]
    if !st.four { I["snare"] = A["snare"]!.map { $0 >= 0.75 ? 0.6 : 0 } }
    // Fill: erste Hälfte Groove, zweite Hälfte Wirbel
    var F = A
    for t in ["hat", "open", "perc", "clap"] { for i in 8..<16 { F[t]![i] = 0 } }
    let tpl = pick([[8, 10, 12, 13, 14, 15], [9, 11, 12, 13, 14, 15], [8, 11, 12, 14, 15]])
    for i in 8..<16 { F["snare"]![i] = 0 }
    for (j, s) in tpl.enumerated() { F["snare"]![s] = 0.45 + 0.55 * Double(j) / Double(tpl.count - 1) }
    F["perc"]![10] = 0.6; F["perc"]![13] = 0.7; F["kick"]![8] = 1
    if st.four { F["kick"]![12] = 0 }
    F["open"]![15] = 0; F["hat"]![8] = 0.5
    // Break: ohne Kick, Hats halbiert, Perc betont
    var R: Pattern = ["kick": zeros(), "snare": A["snare"]!.map { $0 * 0.7 }, "clap": A["clap"]!.map { $0 * 0.8 },
                      "hat": A["hat"]!.enumerated().map { i, _ in i % 4 == 0 ? 0.6 : 0 },
                      "open": A["open"]!.map { $0 * 0.6 }, "perc": euclid(5, 16, 2).map { $0 > 0 ? 0.7 : 0 }]
    R["open"]![14] = 0.9
    var out: Parts = [.intro: I, .a: A, .b: B, .v: V, .fill: F, .brk: R]
    for key in PartKey.allCases {
        var arr = zeros()
        for s in pick(SOUND_POS[key]!) { arr[s] = 0.8 }
        out[key]!["sound"] = arr
    }
    return out
}

func emptyPart() -> Pattern {
    var o: Pattern = [:]
    for t in TRACKS { o[t.id] = zeros() }
    return o
}

// MARK: - Eigene Grooves (gleiches Format wie die Web-Fassung, damit sie austauschbar bleiben)

struct RowDoc: Codable, Hashable { var id: String; var name: String; var src: String }

struct GrooveDoc: Codable, Identifiable {
    var id: String
    var name: String
    var bpm: Int
    var swing: Double
    var rows: [RowDoc]
    /// Teil -> Spur -> 16 Zeichen ("x", "o", "g", ".")
    var parts: [String: [String: String]]
    var updated: Double
}

func encodeParts(_ P: Parts, rows: [Track]) -> [String: [String: String]] {
    var o: [String: [String: String]] = [:]
    for k in PartKey.allCases {
        var lanes: [String: String] = [:]
        for t in TRACKS + rows { lanes[t.id] = String((P[k]?[t.id] ?? zeros()).map(encodeStep)) }
        o[k.rawValue] = lanes
    }
    return o
}

func decodeParts(_ E: [String: [String: String]], rows: [Track]) -> Parts {
    var o: Parts = [:]
    for k in PartKey.allCases {
        var p: Pattern = [:]
        for t in TRACKS + rows { p[t.id] = parse(E[k.rawValue]?[t.id] ?? "") }
        o[k] = p
    }
    return o
}

func sanitizeRows(_ rows: [RowDoc]) -> [Track] {
    let idOK = try! NSRegularExpression(pattern: "^r[a-z0-9]{1,16}$")
    let srcOK = try! NSRegularExpression(pattern: "^(synth\\|[a-z]+|sample\\|[a-z]+\\|[^|]{1,80})$")
    func m(_ re: NSRegularExpression, _ s: String) -> Bool { re.firstMatch(in: s, range: NSRange(s.startIndex..., in: s)) != nil }
    return rows.filter { m(idOK, $0.id) && m(srcOK, $0.src) }.prefix(8)
        .map { Track(id: $0.id, name: String(($0.name.isEmpty ? "Reihe" : $0.name).prefix(16)), src: $0.src) }
}
