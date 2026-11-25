import Foundation

// Feste Daten der Engine – entsprechen 1:1 der Web-Fassung (taktwerk/index.html).

/// Ein Pattern: 16 Steps pro Spur, Wert = Anschlagstärke (0 = aus).
typealias Steps = [Double]
typealias Pattern = [String: Steps]

enum PartKey: String, CaseIterable, Codable, Identifiable {
    case intro, a, b, v, fill, brk
    var id: String { rawValue }
    var name: String {
        switch self {
        case .intro: "Intro"; case .a: "Groove A"; case .b: "Groove B"
        case .v: "Variation"; case .fill: "Fill"; case .brk: "Break"
        }
    }
    var tag: String {
        switch self {
        case .intro: "IN"; case .a: "A"; case .b: "B"; case .v: "V"; case .fill: "F"; case .brk: "BR"
        }
    }
    var hex: UInt32 {
        switch self {
        case .intro: 0x7aa2ff; case .a: 0xff7a59; case .b: 0xffb547
        case .v: 0x4fd1a5; case .fill: 0xc58cff; case .brk: 0xf472b6
        }
    }
}

struct Track: Identifiable, Hashable {
    let id: String
    var name: String
    /// nil = feste Spur, sonst Klangquelle einer eigenen Reihe: "synth|tom" oder "sample|gruppe|name"
    var src: String? = nil
}

let TRACKS: [Track] = [
    Track(id: "kick", name: "Kick"), Track(id: "snare", name: "Snare"), Track(id: "clap", name: "Clap"),
    Track(id: "hat", name: "Hat"), Track(id: "open", name: "Open Hat"), Track(id: "perc", name: "Perc"),
    Track(id: "sound", name: "Sounds"),
]

struct Style {
    var name: String
    var bpm: Int
    var swing: Double
    var four = false
    var swing8 = false
    var lanes: [String: String] = [:]
    // eigene Grooves
    var custom = false
    var groove: GrooveDoc? = nil
}

let BUILTIN_ORDER = ["house", "techno", "breaks", "hiphop", "afro", "dnb", "jazz", "rnb", "funk"]

let BUILTIN_STYLES: [String: Style] = [
    "house": Style(name: "House", bpm: 124, swing: 18, four: true, lanes: [
        "kick": "x...x...x...x...", "snare": "................", "clap": "....x.......x...",
        "hat": "g.g.g.g.g.g.g.gg", "open": "..x...x...x...x.", "perc": "...o.....o..o..."]),
    "techno": Style(name: "Techno", bpm: 132, swing: 0, four: true, lanes: [
        "kick": "x...x...x...x...", "snare": "................", "clap": "....o.......o...",
        "hat": "gogogogogogogogo", "open": "..o...o...o...o.", "perc": "x..o..x...o..x.."]),
    "breaks": Style(name: "Breaks", bpm: 130, swing: 10, lanes: [
        "kick": "x.........x.....", "snare": "....x..g.g..x...", "clap": "................",
        "hat": "o.o.o.o.o.o.o.o.", "open": ".......g......o.", "perc": "..g.....g......."]),
    "hiphop": Style(name: "Hip-Hop", bpm: 90, swing: 55, lanes: [
        "kick": "x......o..x.....", "snare": "....x.......x...", "clap": "............g...",
        "hat": "o.o.o.o.o.o.o.o.", "open": "..............g.", "perc": ".......g.....g.."]),
    "afro": Style(name: "Afro", bpm: 112, swing: 30, four: true, lanes: [
        "kick": "x...x...x...x...", "snare": "................", "clap": "....o.......o...",
        "hat": "o.go.go.o.go.go.", "open": "..g.....g.......", "perc": "x..x..x...x..x.."]),
    "dnb": Style(name: "DnB", bpm: 172, swing: 0, lanes: [
        "kick": "x.........x.....", "snare": "....x.......x...", "clap": ".......g........",
        "hat": "o.o.o.o.o.o.o.o.", "open": "..........g.....", "perc": "..g...g......g.."]),
    // Jazz: Ride „ding ding-da“, gefederte Kick, Hi-Hat-Fuß auf 2 und 4, Swing auf den Achteln
    "jazz": Style(name: "Jazz", bpm: 140, swing: 85, swing8: true, lanes: [
        "kick": "g.......g.......", "snare": "......g...g....g", "clap": "....o.......o...",
        "hat": "x...x.o.x...x.o.", "open": "................", "perc": "..........g....."]),
    "rnb": Style(name: "RnB", bpm: 88, swing: 40, lanes: [
        "kick": "x.....o..x.o....", "snare": "....x.......x...", "clap": "....o.......x..g",
        "hat": "o.g.o.ggo.g.o.g.", "open": "..............o.", "perc": "...g......g....."]),
    "funk": Style(name: "Funk", bpm: 104, swing: 15, lanes: [
        "kick": "x.x.......x..x..", "snare": "....x..g.g..x..g", "clap": "................",
        "hat": "xgogxgogxgogxgog", "open": ".......o........", "perc": "..g....g....g..."]),
]

/// Übergangstabelle der Phrase (bei Variation 0)
let TRANS: [PartKey: [PartKey: Double]] = [
    .intro: [.a: 0.70, .b: 0.20, .v: 0.10, .brk: 0],
    .a: [.a: 0.55, .b: 0.30, .v: 0.12, .brk: 0.03],
    .b: [.a: 0.35, .b: 0.45, .v: 0.15, .brk: 0.05],
    .v: [.a: 0.45, .b: 0.35, .v: 0.15, .brk: 0.05],
    .fill: [.a: 0.60, .b: 0.25, .v: 0.10, .brk: 0.05],
    .brk: [.a: 0.80, .b: 0.20, .v: 0, .brk: 0],
]

struct Macro: Identifiable { let id: String; let name: String; let initial: Double }
let MACROS: [Macro] = [
    Macro(id: "variation", name: "Variation", initial: 40),
    Macro(id: "density", name: "Dichte", initial: 50),
    Macro(id: "swing", name: "Swing", initial: 18),
    Macro(id: "ghost", name: "Ghosts", initial: 35),
    Macro(id: "fills", name: "Fills", initial: 60),
    Macro(id: "human", name: "Humanize", initial: 30),
]

/// Synth-Klänge für eigene Reihen
let SYNTH_OPTS: [(id: String, label: String)] = [
    ("kick", "Kick"), ("snare", "Snare"), ("clap", "Clap"), ("hat", "Closed Hat"), ("open", "Open Hat"), ("perc", "Perc"),
    ("tom", "Tom"), ("rim", "Rimshot"), ("cowbell", "Cowbell"), ("shaker", "Shaker"), ("bass", "Bass"), ("sound", "Akkord"),
]

let ALL_GROUPS = ["kick", "snare", "clap", "hat", "open", "perc", "cymbal", "chords", "pads", "bass", "vocals", "fx", "keys", "brass", "strings"]
let DRUM_GROUPS = ["kick", "snare", "clap", "hat", "open", "perc", "cymbal"]
let GROUP_LABEL: [String: String] = [
    "kick": "Kick", "snare": "Snare", "clap": "Clap", "hat": "Closed Hat", "open": "Open Hat", "perc": "Percussion und Toms",
    "cymbal": "Becken", "chords": "Akkorde und Stabs", "pads": "Pads", "bass": "Bass", "vocals": "Vocals", "fx": "Effekte",
    "keys": "Keys", "brass": "Brass", "strings": "Streicher",
]
/// Ohne Sample: ähnlicher Synth-Klang
let SYNTH_FOR_GROUP: [String: String] = [
    "kick": "kick", "snare": "snare", "clap": "clap", "hat": "hat", "open": "open", "perc": "perc", "cymbal": "open",
    "chords": "sound", "pads": "sound", "bass": "bass", "vocals": "sound", "fx": "sound", "keys": "sound", "brass": "sound", "strings": "sound",
]
let SOUND_SETS: [(id: String, label: String)] = [
    ("chords", "Akkorde und Stabs"), ("vocals", "Vocals"), ("bass", "Bass"), ("pads", "Pads"), ("keys", "Keys"),
    ("brass", "Brass"), ("strings", "Streicher"), ("fx", "Effekte"), ("off", "Aus"),
]
