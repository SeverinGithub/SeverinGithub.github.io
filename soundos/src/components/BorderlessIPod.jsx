import Screen from './Screen'
import ClickWheel from './ClickWheel'
import { useEffect } from 'react'
import './BorderlessIPod.css'

export default function BorderlessIPod(props) {
  const { onScroll, onSelect, onMenu, onPlayPause, onNext, onPrev } = props

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); onScroll(-1); break
        case 'ArrowDown': e.preventDefault(); onScroll(1); break
        case 'Enter': e.preventDefault(); onSelect(); break
        case 'Escape': e.preventDefault(); onMenu(); break
        case ' ': e.preventDefault(); onPlayPause(); break
        case 'ArrowLeft': e.preventDefault(); onPrev(); break
        case 'ArrowRight': e.preventDefault(); onNext(); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onScroll, onSelect, onMenu, onPlayPause, onNext, onPrev])

  return (
    <div className="bl-ipod-root">
      <div className="bl-ipod-screen-wrap">
        <Screen {...props} />
      </div>
      <div className="bl-ipod-wheel-wrap">
        <ClickWheel
          onScroll={onScroll}
          onSelect={onSelect}
          onMenu={onMenu}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrev={onPrev}
        />
      </div>
    </div>
  )
}
