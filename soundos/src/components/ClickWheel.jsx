import { useRef, useCallback, useEffect } from 'react'
import './ClickWheel.css'

export default function ClickWheel({ onScroll, onSelect, onMenu, onPlayPause, onNext, onPrev }) {
  const wheelRef = useRef(null)
  const lastAngleRef = useRef(null)
  const accumulatedRef = useRef(0)
  const isDraggingRef = useRef(false)
  const startAngleRef = useRef(null)

  const getAngle = useCallback((e, rect) => {
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const { clientX, clientY } = e.touches ? e.touches[0] : e
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI)
  }, [])

  const handleStart = useCallback((e) => {
    const rect = wheelRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const { clientX, clientY } = e.touches ? e.touches[0] : e
    const dx = clientX - cx
    const dy = clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const outerR = rect.width / 2
    const innerR = outerR * 0.35

    // Ignore center button area
    if (dist < innerR) return

    isDraggingRef.current = true
    lastAngleRef.current = getAngle(e, rect)
    startAngleRef.current = lastAngleRef.current
    accumulatedRef.current = 0
    e.preventDefault()
  }, [getAngle])

  const handleMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const angle = getAngle(e, rect)
    let delta = angle - lastAngleRef.current

    // Handle wraparound
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360

    accumulatedRef.current += delta
    lastAngleRef.current = angle

    // Every ~15 degrees triggers a scroll tick
    const threshold = 15
    if (Math.abs(accumulatedRef.current) >= threshold) {
      const ticks = Math.floor(Math.abs(accumulatedRef.current) / threshold)
      const dir = accumulatedRef.current > 0 ? 1 : -1
      for (let i = 0; i < ticks; i++) onScroll(dir)
      accumulatedRef.current = accumulatedRef.current % threshold
    }
    e.preventDefault()
  }, [getAngle, onScroll])

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false
    lastAngleRef.current = null
  }, [])

  useEffect(() => {
    const el = wheelRef.current
    el.addEventListener('touchstart', handleStart, { passive: false })
    el.addEventListener('touchmove', handleMove, { passive: false })
    el.addEventListener('touchend', handleEnd)
    el.addEventListener('mousedown', handleStart)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    return () => {
      el.removeEventListener('touchstart', handleStart)
      el.removeEventListener('touchmove', handleMove)
      el.removeEventListener('touchend', handleEnd)
      el.removeEventListener('mousedown', handleStart)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
    }
  }, [handleStart, handleMove, handleEnd])

  const handleZoneClick = (e) => {
    if (isDraggingRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const { clientX, clientY } = e
    const dx = clientX - cx
    const dy = clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const outerR = rect.width / 2
    const innerR = outerR * 0.35

    if (dist < innerR) {
      onSelect()
      return
    }
    if (dist > outerR) return

    // Determine zone by angle
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    if (angle > -45 && angle <= 45) onNext()
    else if (angle > 45 && angle <= 135) onPlayPause()
    else if (angle > 135 || angle <= -135) onPrev()
    else onMenu()
  }

  return (
    <div className="clickwheel-container">
      <div className="clickwheel" ref={wheelRef} onClick={handleZoneClick}>
        <div className="wheel-label wheel-menu">MENU</div>
        <div className="wheel-label wheel-prev">⏮</div>
        <div className="wheel-label wheel-next">⏭</div>
        <div className="wheel-label wheel-play">▶︎ ❙❙</div>
        <div className="wheel-center" onClick={(e) => { e.stopPropagation(); onSelect() }} />
      </div>
    </div>
  )
}
