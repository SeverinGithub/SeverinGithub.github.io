import { useMemo, useState } from 'react'
import { useStore } from './store'
import {
  currentMonthKey,
  monthEntries,
  monthKeyToLabel,
  shiftMonth,
  fmtHours,
  fmtEuro,
  fmtDateShort,
  fmtWeekdayShort,
  secondToLastDayISO,
  dateFromISO,
  isoFromDate,
} from './utils'
import EntryModal from './EntryModal'
import { exportMonth } from './excel'
import { useToast, burst } from './fx.jsx'

export default function ListScreen() {
  const state = useStore()
  const { showToast } = useToast()
  const [mk, setMk] = useState(currentMonthKey())
  const [editing, setEditing] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [sigDate, setSigDate] = useState(secondToLastDayISO(mk))

  const entries = useMemo(() => monthEntries(state.entries, mk), [state.entries, mk])
  const total = entries.reduce((s, e) => s + (e.hours || 0), 0)
  const totalEuro = total * state.settings.hourlyRate

  function openExport() {
    setSigDate(secondToLastDayISO(mk))
    setShowExport(true)
  }

  async function doExport() {
    setExporting(true)
    try {
      const files = await exportMonth({
        entries: state.entries,
        settings: state.settings,
        monthKey: mk,
        signatureDate: sigDate,
      })
      setShowExport(false)
      // Big celebration
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      burst(cx, cy, { emojis: ['📊', '📁', '✨', '⭐', '🎉', '💫', '🔥'], count: 40 })
      showToast(files.length > 1 ? `${files.length} Dateien exportiert!` : 'Excel bereit!', {
        icon: '📥', tone: 'good', duration: 3000,
      })
    } catch (err) {
      showToast('Fehler: ' + err.message, { icon: '⚠️', tone: 'bad', duration: 3500 })
    } finally {
      setExporting(false)
    }
  }

  function switchMonth(delta) {
    const next = shiftMonth(mk, delta)
    setMk(next)
    setSigDate(secondToLastDayISO(next))
  }

  return (
    <>
      <div className="header">
        <h1>Einträge</h1>
      </div>

      <div className="content">
        <div className="card">
          <div className="month-switch">
            <button onClick={() => switchMonth(-1)}>‹</button>
            <div className="name">{monthKeyToLabel(mk)}</div>
            <button onClick={() => switchMonth(1)}>›</button>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', paddingTop: 4 }}>
            <span className="small muted">
              {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
            </span>
            <span className="mono" style={{ fontWeight: 600 }}>
              {fmtHours(total)} · {fmtEuro(totalEuro)}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="list-header">
            <span>Tage</span>
            <span>Stunden</span>
          </div>
          {entries.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🗓️</div>
              <div>Keine Einträge in diesem Monat</div>
            </div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="entry-row" onClick={() => setEditing(e)}>
                <div>
                  <div className="weekday">{fmtWeekdayShort(e.date)}</div>
                  <div className="date">{fmtDateShort(e.date)}</div>
                </div>
                <div>
                  <div className="desc">
                    {e.description || <span className="muted">Ohne Beschreibung</span>}
                  </div>
                  <div className="small muted">
                    {e.mode === 'range' && e.start != null
                      ? `${formatT(e.start)} – ${formatT(e.end)}${e.pause ? ` · Pause ${e.pause.toString().replace('.', ',')} h` : ''}`
                      : 'Nur Dauer'}
                  </div>
                </div>
                <div className="hours">{fmtHours(e.hours)}</div>
              </div>
            ))
          )}
        </div>

        <button
          className="btn large block"
          onClick={openExport}
          disabled={entries.length === 0}
        >
          Excel-Export {entries.length > 15 && `(${Math.ceil(entries.length / 15)} Dateien)`}
        </button>
      </div>

      {editing && <EntryModal initial={editing} onClose={() => setEditing(null)} />}

      {showExport && (
        <div className="modal-overlay" onClick={() => setShowExport(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Excel-Export · {monthKeyToLabel(mk)}</h2>
            <div className="stack">
              <div className="small muted">
                {entries.length} Einträge · {fmtHours(total)} · {fmtEuro(totalEuro)}
              </div>
              {entries.length > 15 && (
                <div className="hint" style={{ background: 'var(--surface-2)', padding: 10, borderRadius: 8 }}>
                  Die Vorlage fasst nur 15 Zeilen pro Datei. Es werden
                  {' '}{Math.ceil(entries.length / 15)} Dateien erzeugt.
                </div>
              )}
              <label className="field">
                Datum Unterschrift (in Feld B27 & G27)
                <input
                  type="date"
                  value={sigDate}
                  onChange={(e) => setSigDate(e.target.value)}
                />
              </label>
              <div className="hint">
                Vorschlag: vorletzter Tag des Monats.
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <div className="grow" />
                <button className="btn secondary" onClick={() => setShowExport(false)}>
                  Abbrechen
                </button>
                <button className="btn" onClick={doExport} disabled={exporting}>
                  {exporting ? 'Erstelle…' : 'Herunterladen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function formatT(dec) {
  if (dec == null) return ''
  const h = Math.floor(dec)
  const m = Math.round((dec - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
