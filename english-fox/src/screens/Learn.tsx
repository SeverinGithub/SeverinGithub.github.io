import { useEffect, useState } from 'react'
import { lessons, units } from '../content'
import { isUnlocked, useStore } from '../store'
import { Stars } from '../components/Stars'
import { Mascot } from '../components/Mascot'
import { theme } from '../config/theme'
import { scoring } from '../config/scoring'
import { brand } from '../config/brand'
import { go } from '../router'
import type { Lesson } from '../../shared/types'

const ROW = 156
const SWING = 70

export function Learn({ anchor }: { anchor?: string }) {
  const progress = useStore((s) => s.progress)
  const chests = useStore((s) => s.chests)
  const openChest = useStore((s) => s.openChest)
  const [sheet, setSheet] = useState<Lesson | null>(null)
  const order = lessons.map((l) => l.id)
  const current = order.find((id) => isUnlocked(order, id, progress) && (progress[id]?.bestStars ?? 0) < scoring.unlockStars) ?? order[order.length - 1]

  useEffect(() => {
    const target = document.getElementById(`node-${anchor ?? current}`)
    target?.scrollIntoView({ block: 'center' })
  }, [anchor, current])

  let n = 0
  return (
    <div className="learn">
      {units.map((u) => {
        const list = lessons.filter((l) => l.unit === u.id)
        if (!list.length) return null
        const done = list.every((l) => (progress[l.id]?.bestStars ?? 0) >= scoring.unlockStars)
        const rows = list.length + 1 // + pit stop
        const points = Array.from({ length: rows }, (_, i) => ({ x: Math.sin((n + i) * 0.95) * SWING, y: i * ROW + ROW / 2 }))
        const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')
        const start = n
        n += rows
        return (
          <section key={u.id} className="unit" style={{ ['--unit' as string]: u.color }}>
            <div className="unit-banner">
              <div>
                <p className="eyebrow">{theme.unit} {u.id}</p>
                <h2>{u.title}</h2>
              </div>
              <span className="unit-flag" aria-hidden>🏁</span>
            </div>
            <div className="track" style={{ height: rows * ROW }}>
              <svg className="track-svg" width={400} height={rows * ROW} viewBox={`-200 0 400 ${rows * ROW}`} aria-hidden>
                <path d={d} className="asphalt" />
                <path d={d} className="asphalt-line" />
              </svg>
              {list.map((l, i) => {
                const p = points[i]
                const unlocked = isUnlocked(order, l.id, progress)
                const stars = progress[l.id]?.bestStars ?? 0
                const isCurrent = l.id === current
                return (
                  <div key={l.id} id={`node-${l.id}`} className="node-wrap" style={{ top: p.y, transform: `translateX(${p.x}px)` }}>
                    {isCurrent && <span className="start-bubble">{theme.start}</span>}
                    <button
                      className={`node ${!unlocked ? 'node-locked' : stars ? 'node-done' : ''} ${isCurrent ? 'node-current' : ''} ${l.kind === 'mixed' ? 'node-mixed' : ''}`}
                      onClick={() => setSheet(l)}
                      aria-label={`${l.title}${unlocked ? '' : ' (gesperrt)'}`}
                    >
                      {!unlocked ? '🔒' : l.kind === 'mixed' ? '🏆' : stars ? '★' : '▶'}
                    </button>
                    <Stars n={stars} size={16} />
                    <span className="node-label">{l.title}</span>
                    {isCurrent && (start + i) % 2 === 0 && <Mascot mood="motivated" size={56} className="node-fox" />}
                  </div>
                )
              })}
              <div className="node-wrap" style={{ top: points[rows - 1].y, transform: `translateX(${points[rows - 1].x}px)` }}>
                <button
                  className={`chest ${done ? (chests.includes(u.id) ? 'chest-open' : 'chest-ready') : ''}`}
                  disabled={!done || chests.includes(u.id)}
                  onClick={() => openChest(u.id)}
                  aria-label={theme.chest}
                >
                  {chests.includes(u.id) ? '🧰' : '🔧'}
                </button>
                <span className="node-label">{chests.includes(u.id) ? `${theme.chest} ✓` : done ? `${theme.chest}: +${scoring.chestGems} ${theme.gems}` : theme.chest}</span>
              </div>
            </div>
          </section>
        )
      })}

      {sheet && <LessonSheet lesson={sheet} unlocked={isUnlocked(order, sheet.id, progress)} onClose={() => setSheet(null)} />}
    </div>
  )
}

function LessonSheet({ lesson, unlocked, onClose }: { lesson: Lesson; unlocked: boolean; onClose: () => void }) {
  const p = useStore((s) => s.progress[lesson.id])
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow">{theme.unit} {lesson.unit} · {lesson.exercises.length} Übungen</p>
        <h2>{lesson.title}</h2>
        <Stars n={p?.bestStars ?? 0} size={30} />
        {p ? <p className="muted">Bestwert {Math.round(p.bestScore * 100)} % · {p.attempts} Versuch{p.attempts === 1 ? '' : 'e'}</p> : <p className="muted">Noch nicht gespielt</p>}
        {unlocked ? (
          <button className="btn btn-primary" onClick={() => go(`/lesson/${lesson.id}`)}>{p ? 'Wiederholen' : 'Starten'}</button>
        ) : (
          <p className="locked-note">
            <Mascot mood="think" size={44} /> Hol dir in der vorherigen Lektion mindestens {scoring.unlockStars} Sterne, dann fährt {brand.foxName} hier weiter.
          </p>
        )}
      </div>
    </div>
  )
}
