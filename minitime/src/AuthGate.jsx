import { useEffect, useState } from 'react'

const PIN = '7209'
const KEY = 'minijob-tracker-unlocked'

export function isUnlocked() {
  return localStorage.getItem(KEY) === '1'
}
export function lock() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('minijob-lock'))
}

export default function AuthGate({ children }) {
  const [unlocked, setUnlocked] = useState(isUnlocked())
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const onLock = () => setUnlocked(false)
    window.addEventListener('minijob-lock', onLock)
    return () => window.removeEventListener('minijob-lock', onLock)
  }, [])

  useEffect(() => {
    if (pin.length === PIN.length) {
      if (pin === PIN) {
        setSuccess(true)
        // Celebratory burst from center of dots
        setTimeout(() => {
          const el = document.querySelector('.pin-dots')
          if (el) {
            const r = el.getBoundingClientRect()
            import('./fx.jsx').then(({ burst }) => {
              burst(r.left + r.width / 2, r.top + r.height / 2, {
                emojis: ['✨', '⭐', '💫', '🌟', '💖', '🔓'],
                count: 32,
              })
            })
          }
        }, 100)
        setTimeout(() => {
          localStorage.setItem(KEY, '1')
          setUnlocked(true)
          setPin('')
          setError(false)
          setSuccess(false)
        }, 600)
      } else {
        setError(true)
        setTimeout(() => { setPin(''); setError(false) }, 500)
      }
    }
  }, [pin])

  if (unlocked) return children

  return (
    <div className="lock">
      <div className="lock-inner">
        <div className="lock-title">Minijob Tracker</div>
        <div className="lock-sub">PIN eingeben</div>

        <div className={`pin-dots${error ? ' shake' : ''}${success ? ' success' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`dot${pin.length > i ? ' on' : ''}${error ? ' err' : ''}`} />
          ))}
        </div>

        <div className="keypad">
          {['1','2','3','4','5','6','7','8','9'].map((n) => (
            <button key={n} className="key" onClick={() => setPin((p) => (p.length < 4 ? p + n : p))}>
              {n}
            </button>
          ))}
          <div />
          <button className="key" onClick={() => setPin((p) => (p.length < 4 ? p + '0' : p))}>0</button>
          <button className="key key-del" onClick={() => setPin((p) => p.slice(0, -1))} aria-label="Löschen">
            ⌫
          </button>
        </div>
      </div>
    </div>
  )
}
