import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Stroke } from '../../../shared/types'
import { strokePath } from './strokes'

const LINE = 44 // px per writing line
let lastPenAt = 0 // palm rejection: ignore touches shortly after the pencil was used

interface Props {
  value?: Stroke[]
  onChange: (strokes: Stroke[]) => void
  fingerDraw: boolean
  inline?: boolean // gap inside a sentence
  minWidth?: number
  maxLines?: number
  label?: string
  disabled?: boolean
}

export function InkField({ value = [], onChange, fingerDraw, inline, minWidth = 120, maxLines = 3, label, disabled }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const current = useRef<Stroke | null>(null)
  const strokesRef = useRef(value)
  const [lines, setLines] = useState(1)
  const [erasing, setErasing] = useState(false)
  const [active, setActive] = useState(false)
  const raf = useRef(0)
  strokesRef.current = value

  const height = (inline ? 40 : LINE) * lines

  const draw = () => {
    const c = canvas.current, w = wrap.current
    if (!c || !w) return
    const dpr = window.devicePixelRatio || 1
    const width = w.clientWidth
    if (c.width !== Math.round(width * dpr) || c.height !== Math.round(height * dpr)) {
      c.width = Math.round(width * dpr)
      c.height = Math.round(height * dpr)
      c.style.width = width + 'px'
      c.style.height = height + 'px'
    }
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = getComputedStyle(c).getPropertyValue('--ink').trim() || '#1b2a6b'
    for (const s of strokesRef.current) ctx.fill(strokePath(s))
    if (current.current) ctx.fill(strokePath(current.current))
  }
  const schedule = () => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(draw)
  }

  useLayoutEffect(draw)
  useEffect(() => {
    const ro = new ResizeObserver(schedule)
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  })

  // iPad: stop the page from scrolling while the pencil (or a drawing finger) touches the field
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const block = (e: TouchEvent) => {
      const stylus = Array.from(e.touches).some((t) => (t as Touch & { touchType?: string }).touchType === 'stylus')
      if (stylus || fingerDraw) e.preventDefault()
    }
    c.addEventListener('touchstart', block, { passive: false })
    c.addEventListener('touchmove', block, { passive: false })
    return () => {
      c.removeEventListener('touchstart', block)
      c.removeEventListener('touchmove', block)
    }
  }, [fingerDraw])

  const canDraw = (e: React.PointerEvent) => {
    if (disabled) return false
    if (e.pointerType === 'pen') { lastPenAt = Date.now(); return true }
    if (e.pointerType === 'mouse') return true
    if (Date.now() - lastPenAt < 1000) return false
    return fingerDraw
  }
  const point = (e: PointerEvent | React.PointerEvent): [number, number, number] => {
    const rect = canvas.current!.getBoundingClientRect()
    const p = e.pointerType === 'pen' ? e.pressure || 0.5 : 0.5
    return [e.clientX - rect.left, e.clientY - rect.top, p]
  }
  const eraseAt = (x: number, y: number) => {
    const keep = strokesRef.current.filter((s) => !s.points.some(([px, py]) => Math.hypot(px - x, py - y) < 12))
    if (keep.length !== strokesRef.current.length) onChange(keep)
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw(e)) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setActive(true)
    const [x, y, p] = point(e)
    if (erasing || (e.buttons & 32) === 32) { current.current = { points: [], erase: true }; eraseAt(x, y); return }
    current.current = { points: [[x, y, p]] }
    schedule()
  }
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = current.current
    if (!cur) return
    if (e.pointerType === 'pen') lastPenAt = Date.now()
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
    for (const ev of events) {
      const [x, y, p] = point(ev)
      if (cur.erase) { eraseAt(x, y); continue }
      cur.points.push([x, y, p])
      if (y > height - 10 && lines < maxLines && !inline) setLines((l) => Math.min(maxLines, l + 1))
    }
    schedule()
  }
  const onUp = () => {
    const cur = current.current
    current.current = null
    if (cur && !cur.erase && cur.points.length) {
      if (cur.points.length === 1) cur.points.push([cur.points[0][0] + 0.5, cur.points[0][1] + 0.5, cur.points[0][2]])
      onChange([...strokesRef.current, cur])
    }
  }

  return (
    <span
      ref={wrap}
      className={`ink ${inline ? 'ink-inline' : 'ink-line'} ${active ? 'ink-active' : ''} ${erasing ? 'ink-erasing' : ''}`}
      style={{ minWidth, height }}
      aria-label={label ?? 'Schreibfeld'}
    >
      <span className="ink-guide" style={{ backgroundSize: `100% ${inline ? 40 : LINE}px` }} />
      <canvas ref={canvas} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
      {!disabled && value.length > 0 && (
        <span className="ink-tools">
          <button type="button" title="Radierer" aria-pressed={erasing} onClick={() => setErasing((v) => !v)}>⌫</button>
          <button type="button" title="Rückgängig" onClick={() => onChange(value.slice(0, -1))}>↶</button>
          <button type="button" title="Löschen" onClick={() => { onChange([]); setErasing(false); setLines(1) }}>✕</button>
        </span>
      )}
    </span>
  )
}
