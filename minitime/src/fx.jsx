import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// ============= Toast =============
const ToastCtx = createContext(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside <FxProvider>')
  return ctx
}

let bursterRef = { current: null }

export function burst(x, y, opts = {}) {
  bursterRef.current?.(x, y, opts)
}

export function FxProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [particles, setParticles] = useState([])

  const showToast = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2)
    const t = { id, message, tone: opts.tone || 'brand', icon: opts.icon }
    setToasts((cur) => [...cur, t])
    setTimeout(() => {
      setToasts((cur) => cur.filter((x) => x.id !== id))
    }, opts.duration ?? 2200)
  }, [])

  const doBurst = useCallback((x, y, opts = {}) => {
    const count = opts.count ?? 24
    const emojis = opts.emojis || ['✨', '⭐', '💫', '🌟', '💖', '🔥', '⚡']
    const newParticles = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3
      const speed = 60 + Math.random() * 120
      const dx = Math.cos(angle) * speed
      const dy = Math.sin(angle) * speed - 40
      newParticles.push({
        id: `${Date.now()}_${i}_${Math.random()}`,
        x,
        y,
        dx,
        dy,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        rot: (Math.random() - 0.5) * 720,
        scale: 0.7 + Math.random() * 0.8,
      })
    }
    setParticles((cur) => [...cur, ...newParticles])
    setTimeout(() => {
      const ids = new Set(newParticles.map((p) => p.id))
      setParticles((cur) => cur.filter((p) => !ids.has(p.id)))
    }, 1400)
  }, [])

  useEffect(() => {
    bursterRef.current = doBurst
    return () => { bursterRef.current = null }
  }, [doBurst])

  return (
    <ToastCtx.Provider value={{ showToast, burst: doBurst }}>
      {children}
      <div className="toast-layer">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            {t.icon && <span className="toast-icon">{t.icon}</span>}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      <div className="burst-layer">
        {particles.map((p) => (
          <span
            key={p.id}
            className="burst-particle"
            style={{
              left: p.x,
              top: p.y,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              '--scale': p.scale,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// ============= CountUp =============
export function CountUp({ value, decimals = 2, duration = 600, suffix = '' }) {
  const [display, setDisplay] = useState(value)
  const rafRef = useRef()
  const fromRef = useRef(value)
  const startRef = useRef(0)

  useEffect(() => {
    if (value === display) return
    fromRef.current = display
    startRef.current = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const cur = fromRef.current + (value - fromRef.current) * eased
      setDisplay(cur)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const shown = display.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return <span className="countup">{shown}{suffix}</span>
}

// ============= Ripple helper =============
export function withRipple(handler) {
  return (e) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const rip = document.createElement('span')
    rip.className = 'ripple'
    const size = Math.max(rect.width, rect.height)
    rip.style.width = rip.style.height = size + 'px'
    rip.style.left = (e.clientX - rect.left - size / 2) + 'px'
    rip.style.top = (e.clientY - rect.top - size / 2) + 'px'
    btn.appendChild(rip)
    setTimeout(() => rip.remove(), 600)
    handler?.(e)
  }
}
