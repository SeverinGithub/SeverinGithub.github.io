import { useMemo, useState } from 'react'
import { useStore } from './store'
import {
  currentMonthKey,
  monthEntries,
  daysInMonth,
  fmtHours,
  fmtEuro,
  todayISO,
  monthKeyToLabel,
  dateFromISO,
} from './utils'
import EntryModal from './EntryModal'

export default function HomeScreen({ goTo }) {
  const state = useStore()
  const [showModal, setShowModal] = useState(false)
  const mk = currentMonthKey()
  const entries = useMemo(() => monthEntries(state.entries, mk), [state.entries, mk])

  const totalHours = entries.reduce((s, e) => s + (e.hours || 0), 0)
  const totalEuro = totalHours * state.settings.hourlyRate
  const limit = state.settings.minijobLimit
  const pct = Math.min(1, totalEuro / limit)
  const level = pct < 0.75 ? 'good' : pct < 0.95 ? 'warn' : 'bad'

  // Forecast: linear extrapolation based on elapsed days
  const today = dateFromISO(todayISO())
  const dayOfMonth = today.getDate()
  const dim = daysInMonth(mk)
  const forecastHours = dayOfMonth > 0 ? (totalHours / dayOfMonth) * dim : 0
  const forecastEuro = forecastHours * state.settings.hourlyRate

  const todayEntries = entries.filter((e) => e.date === todayISO())
  const todayHours = todayEntries.reduce((s, e) => s + (e.hours || 0), 0)

  return (
    <>
      <div className="header">
        <div>
          <h1>{monthKeyToLabel(mk)}</h1>
          <div className="sub">{state.settings.name}</div>
        </div>
      </div>

      <div className="content">
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="big-stat">
              <div className="value mono">{fmtHours(totalHours)}</div>
              <div className="label">Stunden im Monat</div>
            </div>
            <div className="big-stat" style={{ alignItems: 'flex-end' }}>
              <div className="value mono">{fmtEuro(totalEuro)}</div>
              <div className="label">Verdient</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div className={`progress ${level}`}>
              <div style={{ width: `${pct * 100}%` }} />
            </div>
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
              <span className="small muted">Minijob-Grenze {fmtEuro(limit)}</span>
              <span className={`pill ${level}`}>
                {level === 'good' && 'Alles gut'}
                {level === 'warn' && 'Achtung'}
                {level === 'bad' && 'Grenze fast erreicht'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Prognose Monatsende</h2>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>
                {fmtHours(forecastHours)}
              </div>
              <div className="small muted">bei aktuellem Schnitt</div>
            </div>
            <div className="right">
              <div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>
                {fmtEuro(forecastEuro)}
              </div>
              <div className="small muted">≈ Verdienst</div>
            </div>
          </div>
        </div>

        <button className="btn large block" onClick={() => setShowModal(true)}>
          + Zeit eintragen
        </button>

        <div className="card">
          <h2>Heute</h2>
          {todayEntries.length === 0 ? (
            <div className="muted small">Noch keine Einträge heute.</div>
          ) : (
            <>
              {todayEntries.map((e) => (
                <div key={e.id} className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
                  <span className="small">{e.description || <span className="muted">Ohne Beschreibung</span>}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{fmtHours(e.hours)}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="row" style={{ justifyContent: 'space-between', paddingTop: 6 }}>
                <span className="small muted">Summe heute</span>
                <span className="mono" style={{ fontWeight: 600 }}>{fmtHours(todayHours)}</span>
              </div>
            </>
          )}
        </div>

        <button className="btn secondary block" onClick={() => goTo('list')}>
          Alle Einträge des Monats
        </button>
      </div>

      {showModal && <EntryModal onClose={() => setShowModal(false)} />}
    </>
  )
}
