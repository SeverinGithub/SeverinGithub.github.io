import { useMemo, useState } from 'react'
import { useStore } from './store'
import {
  currentMonthKey,
  monthEntries,
  monthKeyToLabel,
  shiftMonth,
  daysInMonth,
  fmtHours,
  fmtEuro,
  todayISO,
  dateFromISO,
  WEEKDAYS_MON_FIRST,
  weekdayMonFirstIndex,
} from './utils'

export default function StatsScreen() {
  const state = useStore()
  const [mk, setMk] = useState(currentMonthKey())
  const entries = useMemo(() => monthEntries(state.entries, mk), [state.entries, mk])

  const rate = state.settings.hourlyRate
  const limit = state.settings.minijobLimit

  const total = entries.reduce((s, e) => s + (e.hours || 0), 0)
  const totalEuro = total * rate
  const daysWorked = new Set(entries.map((e) => e.date)).size

  const isCurrent = mk === currentMonthKey()
  const dim = daysInMonth(mk)
  const dayOfMonth = isCurrent ? dateFromISO(todayISO()).getDate() : dim
  const forecastHours = dayOfMonth > 0 ? (total / dayOfMonth) * dim : total
  const forecastEuro = forecastHours * rate

  // Per weekday
  const perWeekday = Array(7).fill(0)
  const countWeekday = Array(7).fill(0)
  for (const e of entries) {
    const wd = weekdayMonFirstIndex(dateFromISO(e.date))
    perWeekday[wd] += e.hours || 0
    countWeekday[wd] += 1
  }
  const maxWd = Math.max(...perWeekday, 0.1)

  // Top activities
  const activityMap = new Map()
  for (const e of entries) {
    const key = (e.description || 'Ohne Beschreibung').trim() || 'Ohne Beschreibung'
    activityMap.set(key, (activityMap.get(key) || 0) + (e.hours || 0))
  }
  const topActivities = [...activityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const avgPerDayWorked = daysWorked > 0 ? total / daysWorked : 0
  const avgEntry = entries.length > 0 ? total / entries.length : 0

  const pct = Math.min(1, totalEuro / limit)
  const level = pct < 0.75 ? 'good' : pct < 0.95 ? 'warn' : 'bad'
  const forecastPct = Math.min(1, forecastEuro / limit)
  const remainingHoursToLimit = Math.max(0, (limit - totalEuro) / rate)

  return (
    <>
      <div className="header">
        <h1>Statistik</h1>
      </div>

      <div className="content">
        <div className="card">
          <div className="month-switch">
            <button onClick={() => setMk(shiftMonth(mk, -1))}>‹</button>
            <div className="name">{monthKeyToLabel(mk)}</div>
            <button onClick={() => setMk(shiftMonth(mk, 1))}>›</button>
          </div>
        </div>

        <div className="card">
          <h2>Ist-Stand</h2>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="big-stat">
              <div className="value mono">{fmtHours(total)}</div>
              <div className="label">Stunden</div>
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
              <span className="small muted">Grenze {fmtEuro(limit)}</span>
              <span className="small mono">
                noch {fmtHours(remainingHoursToLimit)} möglich
              </span>
            </div>
          </div>
        </div>

        {isCurrent && (
          <div className="card">
            <h2>Prognose Monatsende</h2>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600 }}>
                  {fmtHours(forecastHours)}
                </div>
                <div className="small muted">Hochrechnung</div>
              </div>
              <div className="right">
                <div className="mono" style={{ fontSize: 22, fontWeight: 600 }}>
                  {fmtEuro(forecastEuro)}
                </div>
                <div className="small muted">≈ Verdienst</div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className={`progress ${forecastPct < 0.95 ? 'good' : 'bad'}`}>
                <div style={{ width: `${forecastPct * 100}%` }} />
              </div>
              <div className="small muted" style={{ marginTop: 6 }}>
                {forecastEuro > limit
                  ? `⚠ Bei aktuellem Schnitt wird die Grenze um ${fmtEuro(forecastEuro - limit)} überschritten.`
                  : `Grenze wird voraussichtlich eingehalten.`}
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2>Kennzahlen</h2>
          <div className="stack tight">
            <StatRow label="Arbeitstage" value={`${daysWorked}`} />
            <StatRow label="Einträge" value={`${entries.length}`} />
            <StatRow label="Ø pro Arbeitstag" value={fmtHours(avgPerDayWorked)} />
            <StatRow label="Ø pro Eintrag" value={fmtHours(avgEntry)} />
            <StatRow label="Stundenlohn" value={fmtEuro(rate)} />
          </div>
        </div>

        <div className="card">
          <h2>Wochentage</h2>
          <div className="stack tight">
            {WEEKDAYS_MON_FIRST.map((wd, i) => (
              <div key={wd} className="row" style={{ gap: 10 }}>
                <span className="small muted" style={{ width: 26 }}>{wd}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(perWeekday[i] / maxWd) * 100}%`,
                    height: '100%',
                    background: 'var(--accent)',
                  }} />
                </div>
                <span className="small mono" style={{ width: 60, textAlign: 'right' }}>{fmtHours(perWeekday[i])}</span>
              </div>
            ))}
          </div>
        </div>

        {topActivities.length > 0 && (
          <div className="card">
            <h2>Top Tätigkeiten</h2>
            <div className="stack tight">
              {topActivities.map(([name, h]) => (
                <div key={name} className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span className="mono small" style={{ fontWeight: 600 }}>{fmtHours(h)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <span className="small muted">{label}</span>
      <span className="mono" style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}
