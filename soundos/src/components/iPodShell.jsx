import { useEffect } from 'react'
import Screen from './Screen'
import ClickWheel from './ClickWheel'
import './iPodShell.css'

export default function IPodShell(props) {
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
    <div className="ipod-body">
      <div className="ipod-top-notch">
        <div className="ipod-jack" />
      </div>
      <div className="ipod-screen-bezel">
        <Screen {...props} />
      </div>
      <div className="ipod-wheel-area">
        <ClickWheel
          onScroll={onScroll}
          onSelect={onSelect}
          onMenu={onMenu}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrev={onPrev}
        />
      </div>
      <div className="ipod-bottom-bar" />
    </div>
  )
}
