import { useMemo, useState } from 'react'
import { useStore } from './store'
import {
  currentMonthKey,
  monthEntries,
  monthKeyToLabel,
  shiftMonth,
  daysInMonth,
  fmtHours,
  todayISO,
  isoFromDate,
  WEEKDAYS_MON_FIRST,
  weekdayMonFirstIndex,
} from './utils'
import EntryModal from './EntryModal'

export default function CalendarScreen() {
  const state = useStore()
  const [mk, setMk] = useState(currentMonthKey())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const entries = useMemo(() => monthEntries(state.entries, mk), [state.entries, mk])
  const byDay = useMemo(() => {
    const m = new Map()
    for (const e of entries) {
      const list = m.get(e.date) || []
      list.push(e)
      m.set(e.date, list)
    }
    return m
  }, [entries])

  const [y, mo] = mk.split('-').map(Number)
  const firstOfMonth = new Date(y, mo - 1, 1)
  const leading = weekdayMonFirstIndex(firstOfMonth)
  const dim = daysInMonth(mk)
  const cells = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const today = todayISO()
  const selectedEntries = selectedDate ? byDay.get(selectedDate) || [] : []

  return (
    <>
      <div className="header">
        <h1>Kalender</h1>
      </div>

      <div className="content">
        <div className="card">
          <div className="month-switch">
            <button onClick={() => setMk(shiftMonth(mk, -1))}>‹</button>
            <div className="name">{monthKeyToLabel(mk)}</div>
            <button onClick={() => setMk(shiftMonth(mk, 1))}>›</button>
          </div>

          <div className="calendar" style={{ marginTop: 8 }}>
            {WEEKDAYS_MON_FIRST.map((w) => (
              <div key={w} className="head">{w}</div>
            ))}
            {cells.map((d, i) => {
              if (d == null) return <div key={i} className="cell empty" />
              const iso = isoFromDate(new Date(y, mo - 1, d))
              const dayEntries = byDay.get(iso) || []
              const hrs = dayEntries.reduce((s, e) => s + (e.hours || 0), 0)
              const has = dayEntries.length > 0
              const isToday = iso === today
              return (
                <div
                  key={i}
                  className={`cell${has ? ' has' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => setSelectedDate(iso)}
                >
                  <span>{d}</span>
                  {has && <span className="hrs mono">{hrs.toLocaleString('de-DE', { maximumFractionDigits: 1 })}h</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{formatFullDate(selectedDate)}</h2>
            <div className="stack">
              {selectedEntries.length === 0 ? (
                <div className="muted small">Keine Einträge an diesem Tag.</div>
              ) : (
                selectedEntries.map((e) => (
                  <div
                    key={e.id}
                    className="row"
                    style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {e.description || <span className="muted">Ohne Beschreibung</span>}
                      </div>
                      <div className="small muted">
                        {e.mode === 'range' && e.start != null
                          ? `${formatT(e.start)} – ${formatT(e.end)}`
                          : 'Nur Dauer'}
                      </div>
                    </div>
                    <div className="mono" style={{ fontWeight: 600 }}>{fmtHours(e.hours)}</div>
                  </div>
                ))
              )}
              <div className="row" style={{ marginTop: 8 }}>
                <div className="grow" />
                <button className="btn secondary" onClick={() => setSelectedDate(null)}>
                  Schließen
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setShowAdd(true)
                  }}
                >
                  + Eintrag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <EntryModal
          initial={{ date: selectedDate }}
          onClose={() => {
            setShowAdd(false)
            setSelectedDate(null)
          }}
        />
      )}
    </>
  )
}

function formatT(dec) {
  const h = Math.floor(dec)
  const m = Math.round((dec - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function formatFullDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
