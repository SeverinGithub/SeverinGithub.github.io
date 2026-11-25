import AVFoundation
import os

/// Echtzeit-Teil: ein AVAudioSourceNode mischt alle Stimmen sample-genau.
/// Der Sequencer (Hauptthread) plant Schläge mit Vorlauf ein, wie der Lookahead-Scheduler im Web.
/// Signalweg: Stimmen → trocken + Hall-Send → Hall (Stereo) → Master → Kompressor → Ausgang.
final class AudioCore: @unchecked Sendable {
    static let shared = AudioCore()

    /// Choke-Gruppen: neue Open Hat oder Sound-Spur würgt die vorige ab, Closed Hat würgt die Open Hat
    enum Group { static let none = 0, open = 1, sound = 2 }

    /// Werte, die die Oberfläche setzt und der Audio-Thread liest
    struct Params {
        var master: Float = 1        // linear
        var reverb: Float = 0.2      // Rückweg des Halls 0 … 1
        var size: Float = 0.6        // Raumgröße 0 … 1
        var damp: Float = 0.5        // Höhendämpfung 0 … 1
        var comp: Double = 0.5       // Kompressor 0 (aus) … 1
    }

    private let engine = AVAudioEngine()
    private var node: AVAudioSourceNode!
    private(set) var sr: Double = 48000
    private var started = false
    private var mixWithOthers = true

    private struct Event { let voice: Voice; let chokes: Int; let tau: Double }
    private let lock = OSAllocatedUnfairLock()
    private var pending: [Event] = []          // nach Startframe sortiert
    private var active: [Voice] = []
    private var frame: Int64 = 0
    private var params = Params()
    private var stopFlag = false
    // Puffer des Audio-Threads
    private var scratch = [Float](repeating: 0, count: 4096)
    private var dry = [Float](repeating: 0, count: 4096)
    private var wet = [Float](repeating: 0, count: 4096)
    private var reverb = Reverb(sr: 48000)
    // Pegel
    private var ring = [Float](repeating: 0, count: 512)
    private var ringPos = 0
    private var envDb = -120.0

    private init() {
        pending.reserveCapacity(512)
        active.reserveCapacity(256)
    }

    // MARK: Start

    func start() {
        if started { if !engine.isRunning { try? engine.start() }; return }
        started = true
        configureSession()
        let s = AVAudioSession.sharedInstance()
        sr = engine.outputNode.outputFormat(forBus: 0).sampleRate
        if sr <= 0 { sr = s.sampleRate > 0 ? s.sampleRate : 48000 }
        reverb = Reverb(sr: sr)
        let fmt = AVAudioFormat(standardFormatWithSampleRate: sr, channels: 2)!
        node = AVAudioSourceNode(format: fmt) { [unowned self] _, _, frames, abl -> OSStatus in
            let buf = UnsafeMutableAudioBufferListPointer(abl)
            guard buf.count >= 2, let l = buf[0].mData?.assumingMemoryBound(to: Float.self),
                  let r = buf[1].mData?.assumingMemoryBound(to: Float.self) else { return noErr }
            var done = 0
            let n = Int(frames)
            while done < n { // in Stücken von höchstens 4096 Frames
                let k = min(4096, n - done)
                self.render(l + done, r + done, k)
                done += k
            }
            return noErr
        }
        engine.attach(node)
        engine.connect(node, to: engine.mainMixerNode, format: fmt)
        engine.mainMixerNode.outputVolume = 1
        try? engine.start()

        let nc = NotificationCenter.default
        nc.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] n in
            guard let self, let raw = n.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                  AVAudioSession.InterruptionType(rawValue: raw) == .ended else { return }
            try? AVAudioSession.sharedInstance().setActive(true)
            try? self.engine.start()
        }
        nc.addObserver(forName: .AVAudioEngineConfigurationChange, object: engine, queue: .main) { [weak self] _ in
            try? self?.engine.start()
        }
    }

    private func configureSession() {
        let s = AVAudioSession.sharedInstance()
        // .playback: klingt auch bei stummgeschaltetem iPad; mixWithOthers: zu Musik aus anderen Apps spielen
        try? s.setCategory(.playback, mode: .default, options: mixWithOthers ? [.mixWithOthers] : [])
        try? s.setPreferredIOBufferDuration(0.005)
        try? s.setActive(true)
    }

    /// Einstellung: zusammen mit Musik aus anderen Apps spielen
    func setMixWithOthers(_ on: Bool) {
        mixWithOthers = on
        if started { configureSession() }
    }

    func setParams(_ p: Params) { lock.withLock { params = p } }

    // MARK: Uhr

    /// Zeit des nächsten zu rechnenden Samples (wie AudioContext.currentTime)
    var currentTime: Double { lock.withLock { Double(frame) } / sr }
    /// Was gerade aus dem Lautsprecher kommt – für Playhead und Anzeige
    var hearTime: Double {
        let s = AVAudioSession.sharedInstance()
        return currentTime - s.outputLatency - s.ioBufferDuration
    }

    // MARK: Einplanen (Hauptthread)

    func schedule(_ v: Voice, at t: Double, chokes: Int = Group.none, tau: Double = 0.03) {
        v.startFrame = Int64((t * sr).rounded())
        let e = Event(voice: v, chokes: chokes, tau: tau)
        lock.withLock {
            var i = pending.count
            while i > 0 && pending[i - 1].voice.startFrame > v.startFrame { i -= 1 }
            pending.insert(e, at: i)
        }
    }

    /// Nur ein Würgen ohne neuen Klang (Closed Hat auf Open Hat)
    func choke(_ group: Int, at t: Double, tau: Double) {
        schedule(ChokeOnly(), at: t, chokes: group, tau: tau)
    }

    func stopAll() {
        lock.withLock {
            pending.removeAll(keepingCapacity: true)
            stopFlag = true // die laufenden Stimmen blendet der Audio-Thread selbst aus
        }
    }

    /// Letzte 512 Ausgangssamples für die Pegelanzeige
    func meterSnapshot() -> [Float] {
        lock.withLock { Array(ring[ringPos...] + ring[..<ringPos]) }
    }

    // MARK: Audio-Thread

    private func render(_ outL: UnsafeMutablePointer<Float>, _ outR: UnsafeMutablePointer<Float>, _ n: Int) {
        lock.lock()
        let start = frame
        let end = start + Int64(n)
        let p = params
        if stopFlag { stopFlag = false; for v in active { v.choke(at: start, tau: 0.01) } }
        var k = 0
        while k < pending.count && pending[k].voice.startFrame < end {
            let e = pending[k]
            if e.chokes != Group.none {
                for v in active where v.group == e.chokes { v.choke(at: e.voice.startFrame, tau: e.tau) }
            }
            if !(e.voice is ChokeOnly) { active.append(e.voice) }
            k += 1
        }
        if k > 0 { pending.removeFirst(k) }
        lock.unlock()

        scratch.withUnsafeMutableBufferPointer { sc in
            dry.withUnsafeMutableBufferPointer { d in
                wet.withUnsafeMutableBufferPointer { w in
                    let s = sc.baseAddress!, dp = d.baseAddress!, wp = w.baseAddress!
                    dp.initialize(repeating: 0, count: n)
                    wp.initialize(repeating: 0, count: n)
                    var i = 0
                    while i < active.count {
                        let v = active[i]
                        s.initialize(repeating: 0, count: n)
                        let alive = v.render(s, frames: n, bufStart: start, sr: sr)
                        let send = v.send
                        for f in 0..<n { dp[f] += s[f]; wp[f] += s[f] * send }
                        if alive { i += 1 } else { active.swapAt(i, active.count - 1); active.removeLast() }
                    }
                    // Hall, Master, Kompressor
                    let atk = Foundation.exp(-1 / (0.003 * sr)), rel = Foundation.exp(-1 / (0.12 * sr))
                    let amt = p.comp
                    let thr = -6.0 - 14 * amt, ratio = 1 + 5 * amt, knee = 6.0, makeup = pow(10, (amt * 5) / 20)
                    for f in 0..<n {
                        let (rl, rr) = reverb.process(wp[f], size: p.size, damp: p.damp)
                        var l = Double((dp[f] + rl * p.reverb) * 0.8 * p.master)
                        var r = Double((dp[f] + rr * p.reverb) * 0.8 * p.master)
                        if amt > 0.001 {
                            let x = max(abs(l), abs(r))
                            let db = 20 * log10(max(x, 1e-6))
                            envDb = db > envDb ? atk * envDb + (1 - atk) * db : rel * envDb + (1 - rel) * db
                            let over = envDb - thr
                            var red = 0.0
                            if over > knee / 2 { red = over * (1 - 1 / ratio) }
                            else if over > -knee / 2 { let y = over + knee / 2; red = (1 - 1 / ratio) * y * y / (2 * knee) }
                            let g = pow(10, -red / 20) * makeup
                            l *= g; r *= g
                        }
                        // sanft sättigen statt hart clippen
                        outL[f] = Float(l / (1 + abs(l) * 0.25))
                        outR[f] = Float(r / (1 + abs(r) * 0.25))
                    }
                }
            }
        }

        lock.lock()
        for f in 0..<n { ring[ringPos] = (outL[f] + outR[f]) * 0.5; ringPos = (ringPos + 1) & 511 }
        frame = end
        lock.unlock()
    }
}

/// Platzhalter, der nur andere Stimmen würgt
private final class ChokeOnly: Voice {
    var startFrame: Int64 = 0
    let group = 0
    var send: Float = 0
    func render(_ out: UnsafeMutablePointer<Float>, frames: Int, bufStart: Int64, sr: Double) -> Bool { false }
    func choke(at frame: Int64, tau: Double) {}
}
