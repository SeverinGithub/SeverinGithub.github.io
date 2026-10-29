// Tiny synthesized sound effects (no audio files).
let ctx: AudioContext | null = null
export function playSound(kind: 'good' | 'meh' | 'win') {
  try {
    ctx ??= new AudioContext()
    const notes = kind === 'win' ? [523, 659, 784, 1047] : kind === 'good' ? [660, 880] : [440, 392]
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator(), g = ctx!.createGain()
      o.type = 'triangle'
      o.frequency.value = f
      const t = ctx!.currentTime + i * 0.11
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
      o.connect(g).connect(ctx!.destination)
      o.start(t)
      o.stop(t + 0.2)
    })
  } catch { /* no audio available */ }
}
