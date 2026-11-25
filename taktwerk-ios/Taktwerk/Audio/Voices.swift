import Foundation

// Die Synth-Klänge der Demo – Parameter identisch mit VOICES in der Web-Fassung.

enum Synth {
    private static func sweep(_ a: Float, _ b: Float, _ t: Double) -> Curve {
        var c = Curve(a); c.set(a, 0); c.exp(b, t); return c
    }

    /// style beeinflusst Hat (Jazz spielt Ride) und Perc (Tonhöhe)
    static func make(_ id: String, v: Double, style: String) -> SynthVoice? {
        let v = Float(v)
        switch id {
        case "kick":
            return SynthVoice([
                Layer(oscs: [Osc(.sine, sweep(150, 46, 0.12))], gain: envCurve(v * 1.1, 0.42), stop: 0.45),
                Layer(oscs: [Osc(.sine, hz: 1200)], gain: envCurve(v * 0.15, 0.012), stop: 0.02),
            ])
        case "snare":
            return SynthVoice([
                Layer(noise: true, filter: Biquad(.highpass), freq: Curve(1400), gain: envCurve(v * 0.55, 0.18), stop: 0.22),
                Layer(oscs: [Osc(.triangle, sweep(230, 160, 0.08))], gain: envCurve(v * 0.45, 0.1), stop: 0.12),
            ])
        case "clap":
            var g = Curve(0)
            g.set(0.0001, 0)
            for d in [0, 0.01, 0.022] { g.set(v * 0.7, d); g.exp(v * 0.12, d + 0.009) }
            g.set(v * 0.55, 0.032); g.exp(0.0001, 0.2)
            return SynthVoice([Layer(noise: true, filter: Biquad(.bandpass, q: 0.8), freq: Curve(1500), gain: g, stop: 0.22)])
        case "hat":
            let ride = style == "jazz"
            var l = [Layer(noise: true, filter: Biquad(.highpass), freq: Curve(ride ? 5200 : 7500),
                           gain: envCurve(v * (ride ? 0.24 : 0.32), ride ? 0.35 : 0.045), stop: ride ? 0.4 : 0.06)]
            if ride { l.append(Layer(oscs: [Osc(.square, hz: 3150)], gain: envCurve(v * 0.03, 0.3), stop: 0.32)) }
            return SynthVoice(l)
        case "open":
            return SynthVoice([Layer(noise: true, filter: Biquad(.highpass), freq: Curve(6500), gain: envCurve(v * 0.28, 0.3), stop: 0.35)])
        case "perc":
            let p: Float = style == "afro" ? 520 : style == "techno" ? 780 : 640
            return SynthVoice([Layer(oscs: [Osc(.sine, sweep(p, p * 0.7, 0.06))], gain: envCurve(v * 0.38, 0.09), stop: 0.1)])
        case "sound":
            var f = Curve(2400); f.set(2400, 0); f.exp(500, 0.3)
            return SynthVoice([Layer(oscs: [220, 261.6, 329.6].map { Osc(.saw, hz: $0) }, filter: Biquad(.lowpass), freq: f,
                                     gain: envCurve(v * 0.16, 0.5), stop: 0.55)])
        case "tom":
            return SynthVoice([Layer(oscs: [Osc(.sine, sweep(170, 90, 0.25))], gain: envCurve(v * 0.7, 0.32), stop: 0.35)])
        case "rim":
            return SynthVoice([
                Layer(oscs: [Osc(.triangle, hz: 1700)], gain: envCurve(v * 0.35, 0.03), stop: 0.05),
                Layer(noise: true, filter: Biquad(.highpass), freq: Curve(3000), gain: envCurve(v * 0.25, 0.02), stop: 0.03),
            ])
        case "cowbell":
            return SynthVoice([Layer(oscs: [Osc(.square, hz: 540), Osc(.square, hz: 800)], filter: Biquad(.bandpass, q: 2), freq: Curve(800),
                                     gain: envCurve(v * 0.35, 0.25), stop: 0.28)])
        case "shaker":
            var g = Curve(0); g.set(0.0001, 0); g.exp(v * 0.3, 0.025); g.exp(0.0001, 0.1)
            return SynthVoice([Layer(noise: true, filter: Biquad(.bandpass, q: 0.9), freq: Curve(6500), gain: g, stop: 0.12)])
        case "bass":
            var f = Curve(700); f.set(700, 0); f.exp(180, 0.3)
            return SynthVoice([Layer(oscs: [Osc(.saw, hz: 55)], filter: Biquad(.lowpass), freq: f, gain: envCurve(v * 0.45, 0.45), stop: 0.5)])
        default:
            return nil
        }
    }
}
