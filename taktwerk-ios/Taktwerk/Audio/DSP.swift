import Foundation

// Bausteine der Klangerzeugung. Die Synth-Stimmen sind so gebaut wie in der Web-Fassung
// (Web Audio): Oszillatoren oder Rauschen, ein Biquad-Filter, eine Hüllkurve. Damit klingen beide Fassungen gleich.

/// Automationskurve mit der Semantik von Web Audio (setValueAtTime, exponential- und linearRamp).
struct Curve {
    enum Kind { case set, exp, lin }
    struct Event { let k: Kind; let v: Float; let t: Double }
    private(set) var ev: [Event] = []
    let def: Float
    private var i = 0

    init(_ def: Float) { self.def = def }
    mutating func set(_ v: Float, _ t: Double) { ev.append(Event(k: .set, v: v, t: t)) }
    mutating func exp(_ v: Float, _ t: Double) { ev.append(Event(k: .exp, v: max(v, 1e-6), t: t)) }
    mutating func lin(_ v: Float, _ t: Double) { ev.append(Event(k: .lin, v: v, t: t)) }

    /// Wert zur Zeit t (t steigt monoton – der Index läuft nur vorwärts)
    mutating func value(_ t: Double) -> Float {
        if ev.isEmpty { return def }
        while i < ev.count && ev[i].t <= t { i += 1 }
        if i == ev.count { return ev[ev.count - 1].v }
        let n = ev[i]
        let p = i > 0 ? ev[i - 1] : Event(k: .set, v: def, t: 0)
        switch n.k {
        case .set: return i > 0 ? p.v : def
        case .lin:
            let f = Float((t - p.t) / max(1e-9, n.t - p.t))
            return p.v + (n.v - p.v) * f
        case .exp:
            let f = (t - p.t) / max(1e-9, n.t - p.t)
            let a = max(p.v, 1e-6)
            return a * Float(pow(Double(n.v / a), f))
        }
    }
    var end: Double { ev.last?.t ?? 0 }
}

/// Hüllkurve wie env() im Web: 0.0001 → Spitze in 2 ms → 0.0001 nach dec
func envCurve(_ peak: Float, _ dec: Double) -> Curve {
    var c = Curve(0)
    c.set(0.0001, 0); c.exp(peak, 0.002); c.exp(0.0001, dec)
    return c
}

/// Biquad-Filter mit den Formeln der Web-Audio-Spezifikation
struct Biquad {
    enum Kind { case lowpass, highpass, bandpass }
    let kind: Kind
    var q: Double
    private var b0 = 1.0, b1 = 0.0, b2 = 0.0, a1 = 0.0, a2 = 0.0
    private var x1 = 0.0, x2 = 0.0, y1 = 0.0, y2 = 0.0
    private var lastF = -1.0

    init(_ kind: Kind, q: Double? = nil) {
        self.kind = kind
        // Web Audio: Q bei Tief-/Hochpass in dB (Standard 1), beim Bandpass linear (Standard 1)
        self.q = q ?? 1
    }

    mutating func setFreq(_ f: Double, sr: Double) {
        if abs(f - lastF) < 0.5 { return }
        lastF = f
        let w0 = 2 * Double.pi * min(f, sr * 0.49) / sr
        let cw = cos(w0), sw = sin(w0)
        let alpha: Double
        switch kind {
        case .lowpass, .highpass: alpha = sw / (2 * pow(10, q / 20))
        case .bandpass: alpha = sw / (2 * q)
        }
        let a0 = 1 + alpha
        switch kind {
        case .lowpass: b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2
        case .highpass: b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2
        case .bandpass: b0 = alpha; b1 = 0; b2 = -alpha
        }
        a1 = -2 * cw; a2 = 1 - alpha
        b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0
    }

    mutating func process(_ x: Double) -> Double {
        let y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2 = x1; x1 = x; y2 = y1; y1 = y
        return y
    }
}

enum Wave { case sine, triangle, square, saw }

/// Schnelles Rauschen (xorshift), auf dem Audio-Thread ohne Systemaufrufe
struct Noise {
    private var s: UInt32
    init() { s = UInt32.random(in: 1...UInt32.max) }
    mutating func next() -> Double {
        s ^= s << 13; s ^= s >> 17; s ^= s << 5
        return Double(s) / Double(UInt32.max) * 2 - 1
    }
}

@inline(__always) private func polyBlep(_ t: Double, _ dt: Double) -> Double {
    if t < dt { let x = t / dt; return x + x - x * x - 1 }
    if t > 1 - dt { let x = (t - 1) / dt; return x * x + x + x + 1 }
    return 0
}

struct Osc {
    let wave: Wave
    var freq: Curve
    var phase = 0.0
    init(_ wave: Wave, _ freq: Curve) { self.wave = wave; self.freq = freq }
    init(_ wave: Wave, hz: Float) { self.wave = wave; self.freq = Curve(hz) }

    mutating func next(_ t: Double, sr: Double) -> Double {
        let dt = min(0.5, Double(freq.value(t)) / sr)
        let p = phase
        var y: Double
        switch wave {
        case .sine: y = sin(2 * .pi * p)
        case .triangle: y = p < 0.25 ? 4 * p : p < 0.75 ? 2 - 4 * p : 4 * p - 4
        case .saw: y = 2 * p - 1 - polyBlep(p, dt)
        case .square:
            y = (p < 0.5 ? 1 : -1) + polyBlep(p, dt)
            let q = p + 0.5 >= 1 ? p - 0.5 : p + 0.5
            y -= polyBlep(q, dt)
        }
        phase += dt
        if phase >= 1 { phase -= 1 }
        return y
    }
}

/// Eine Schicht: Oszillatoren und/oder Rauschen → optional Filter → Hüllkurve
struct Layer {
    var oscs: [Osc] = []
    var noise = false
    var filter: Biquad? = nil
    var filterFreq = Curve(1000)
    var gain: Curve
    var start = 0.0
    var stop: Double
    private var rng = Noise()
    private var n = 0

    init(oscs: [Osc] = [], noise: Bool = false, filter: Biquad? = nil, freq: Curve = Curve(1000), gain: Curve, stop: Double) {
        self.oscs = oscs; self.noise = noise; self.filter = filter; self.filterFreq = freq; self.gain = gain; self.stop = stop
    }

    mutating func next(_ t: Double, sr: Double) -> Double {
        if t < start || t >= stop { return 0 }
        var s = 0.0
        for j in oscs.indices { s += oscs[j].next(t, sr: sr) }
        if noise { s += rng.next() }
        if filter != nil {
            if n & 15 == 0 { filter!.setFreq(Double(filterFreq.value(t)), sr: sr) }
            n &+= 1
            s = filter!.process(s)
        }
        return s * Double(gain.value(t))
    }
}

/// Alles, was der Audio-Thread abspielen kann
protocol Voice: AnyObject {
    var startFrame: Int64 { get set }
    var group: Int { get }
    /// Anteil, der in den Hall geht (0 … 1)
    var send: Float { get set }
    /// addiert in out (Länge frames, beginnend bei Frame bufStart); false = fertig, darf weg
    func render(_ out: UnsafeMutablePointer<Float>, frames: Int, bufStart: Int64, sr: Double) -> Bool
    func choke(at frame: Int64, tau: Double)
}

final class SynthVoice: Voice {
    var startFrame: Int64 = 0
    let group = 0
    var send: Float = 0
    private var layers: [Layer]
    private let end: Double

    init(_ layers: [Layer]) {
        self.layers = layers
        end = layers.map(\.stop).max() ?? 0
    }

    func render(_ out: UnsafeMutablePointer<Float>, frames: Int, bufStart: Int64, sr: Double) -> Bool {
        let first = max(0, Int(startFrame - bufStart))
        if first >= frames { return true }
        for f in first..<frames {
            let t = Double(bufStart + Int64(f) - startFrame) / sr
            if t >= end { return false }
            var s = 0.0
            for j in layers.indices { s += layers[j].next(t, sr: sr) }
            out[f] += Float(s)
        }
        return Double(bufStart + Int64(frames) - startFrame) / sr < end
    }

    func choke(at frame: Int64, tau: Double) {}
}

/// Rohdaten eines Samples (mono, 16 Bit, eigene Abtastrate) – halb so viel Speicher wie Float
final class SampleData {
    let samples: [Int16]
    let sr: Double
    init(_ samples: [Int16], sr: Double) { self.samples = samples; self.sr = sr }
    convenience init(floats: [Float], sr: Double) {
        self.init(floats.map { Int16(max(-32767, min(32767, ($0 * 32767).rounded()))) }, sr: sr)
    }
}

final class SampleVoice: Voice {
    var startFrame: Int64 = 0
    let group: Int
    var send: Float = 0
    private let data: SampleData
    private let from: Int, count: Int
    private let gain: Float
    private var pos = 0.0
    private var chokeFrame = Int64.max
    private var chokeTau = 0.03

    init(_ data: SampleData, from: Int, count: Int, gain: Float, group: Int) {
        self.data = data; self.from = from; self.count = max(0, min(count, data.samples.count - from)); self.gain = gain; self.group = group
    }

    func choke(at frame: Int64, tau: Double) {
        if frame < chokeFrame { chokeFrame = frame; chokeTau = tau }
    }

    func render(_ out: UnsafeMutablePointer<Float>, frames: Int, bufStart: Int64, sr: Double) -> Bool {
        let first = max(0, Int(startFrame - bufStart))
        if first >= frames { return true }
        let step = data.sr / sr
        return data.samples.withUnsafeBufferPointer { p -> Bool in
            for f in first..<frames {
                let i = Int(pos)
                if i + 1 >= count { return false }
                let fr = Float(pos - Double(i))
                var s = (Float(p[from + i]) * (1 - fr) + Float(p[from + i + 1]) * fr) * (1 / 32767)
                let abs = bufStart + Int64(f)
                if abs >= chokeFrame {
                    let k = Float(Foundation.exp(-Double(abs - chokeFrame) / sr / chokeTau))
                    if k < 1e-4 { return false }
                    s *= k
                }
                out[f] += s * gain
                pos += step
            }
            return true
        }
    }
}

// MARK: - Hall (Freeverb nach Jezar, Stereo)

private struct Comb {
    var buf: [Float]; var i = 0; var store: Float = 0
    init(_ n: Int) { buf = [Float](repeating: 0, count: max(1, n)) }
    mutating func run(_ x: Float, fb: Float, damp: Float) -> Float {
        let y = buf[i]
        store = y * (1 - damp) + store * damp
        buf[i] = x + store * fb
        i += 1; if i == buf.count { i = 0 }
        return y
    }
}
private struct Allpass {
    var buf: [Float]; var i = 0
    init(_ n: Int) { buf = [Float](repeating: 0, count: max(1, n)) }
    mutating func run(_ x: Float) -> Float {
        let b = buf[i]
        buf[i] = x + b * 0.5
        i += 1; if i == buf.count { i = 0 }
        return b - x
    }
}

struct Reverb {
    private var cl: [Comb], cr: [Comb], al: [Allpass], ar: [Allpass]
    init(sr: Double) {
        let k = sr / 44100
        let combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], aps = [556, 441, 341, 225], spread = 23
        cl = combs.map { Comb(Int(Double($0) * k)) }
        cr = combs.map { Comb(Int(Double($0 + spread) * k)) }
        al = aps.map { Allpass(Int(Double($0) * k)) }
        ar = aps.map { Allpass(Int(Double($0 + spread) * k)) }
    }
    /// size, damp 0 … 1
    mutating func process(_ x: Float, size: Float, damp: Float) -> (Float, Float) {
        let input = x * 0.015, fb = size * 0.28 + 0.7, d = damp * 0.4
        var l: Float = 0, r: Float = 0
        for j in 0..<8 { l += cl[j].run(input, fb: fb, damp: d); r += cr[j].run(input, fb: fb, damp: d) }
        for j in 0..<4 { l = al[j].run(l); r = ar[j].run(r) }
        return (l * 3, r * 3)
    }
}
