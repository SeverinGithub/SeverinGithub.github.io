import AVFoundation
import os

/// Echtzeit-Teil: ein AVAudioSourceNode mischt alle Stimmen sample-genau.
/// Der Sequencer (Hauptthread) plant Schläge mit Vorlauf ein, wie der Lookahead-Scheduler im Web.
final class AudioCore: @unchecked Sendable {
    static let shared = AudioCore()

    /// Choke-Gruppen: neue Open Hat oder Sound-Spur würgt die vorige ab, Closed Hat würgt die Open Hat
    enum Group { static let none = 0, open = 1, sound = 2 }

    private let engine = AVAudioEngine()
    private var node: AVAudioSourceNode!
    private(set) var sr: Double = 48000
    private var started = false

    private struct Event { let voice: Voice; let chokes: Int; let tau: Double }
    private let lock = OSAllocatedUnfairLock()
    private var pending: [Event] = []          // nach Startframe sortiert
    private var active: [Voice] = []
    private var frame: Int64 = 0
    // Pegel
    private var ring = [Float](repeating: 0, count: 512)
    private var ringPos = 0
    // Kompressor (Schwelle −14 dB, Ratio 4, Attack 3 ms, Release 120 ms wie im Web)
    private var envDb = -120.0

    private init() {
        pending.reserveCapacity(512)
        active.reserveCapacity(256)
    }

    // MARK: Start

    func start() {
        if started { if !engine.isRunning { try? engine.start() }; return }
        started = true
        let s = AVAudioSession.sharedInstance()
        // .playback: klingt auch bei stummgeschaltetem iPad; mixWithOthers: zu Musik aus anderen Apps spielen
        try? s.setCategory(.playback, mode: .default, options: [.mixWithOthers])
        try? s.setPreferredIOBufferDuration(0.005)
        try? s.setActive(true)
        sr = engine.outputNode.outputFormat(forBus: 0).sampleRate
        if sr <= 0 { sr = s.sampleRate > 0 ? s.sampleRate : 48000 }
        let fmt = AVAudioFormat(standardFormatWithSampleRate: sr, channels: 1)!
        node = AVAudioSourceNode(format: fmt) { [unowned self] _, _, frames, abl -> OSStatus in
            let buf = UnsafeMutableAudioBufferListPointer(abl)
            guard let out = buf[0].mData?.assumingMemoryBound(to: Float.self) else { return noErr }
            self.render(out, Int(frames))
            for i in 1..<buf.count { if let d = buf[i].mData { memcpy(d, out, Int(frames) * 4) } }
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
    private var stopFlag = false

    /// Letzte 512 Ausgangssamples für die Pegelanzeige
    func meterSnapshot() -> [Float] {
        lock.withLock { Array(ring[ringPos...] + ring[..<ringPos]) }
    }

    // MARK: Audio-Thread

    private func render(_ out: UnsafeMutablePointer<Float>, _ n: Int) {
        lock.lock()
        let start = frame
        let end = start + Int64(n)
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

        out.initialize(repeating: 0, count: n)
        var i = 0
        while i < active.count {
            if active[i].render(out, frames: n, bufStart: start, sr: sr) { i += 1 } else { active.swapAt(i, active.count - 1); active.removeLast() }
        }

        // Master: Gain 0.8 → Kompressor → weiche Begrenzung
        let atk = Foundation.exp(-1 / (0.003 * sr)), rel = Foundation.exp(-1 / (0.12 * sr))
        let thr = -14.0, ratio = 4.0, knee = 6.0, makeup = 1.5
        for f in 0..<n {
            let x = Double(out[f]) * 0.8
            let db = 20 * log10(max(abs(x), 1e-6))
            envDb = db > envDb ? atk * envDb + (1 - atk) * db : rel * envDb + (1 - rel) * db
            let over = envDb - thr
            var red = 0.0
            if over > knee / 2 { red = over * (1 - 1 / ratio) }
            else if over > -knee / 2 { let y = over + knee / 2; red = (1 - 1 / ratio) * y * y / (2 * knee) }
            let y = x * pow(10, -red / 20) * makeup
            out[f] = Float(y / (1 + abs(y) * 0.25)) // sanft sättigen statt hart clippen
        }

        lock.lock()
        for f in 0..<n { ring[ringPos] = out[f]; ringPos = (ringPos + 1) & 511 }
        frame = end
        lock.unlock()
    }
}

/// Platzhalter, der nur andere Stimmen würgt
private final class ChokeOnly: Voice {
    var startFrame: Int64 = 0
    let group = 0
    func render(_ out: UnsafeMutablePointer<Float>, frames: Int, bufStart: Int64, sr: Double) -> Bool { false }
    func choke(at frame: Int64, tau: Double) {}
}
