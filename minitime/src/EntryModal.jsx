import { useEffect, useState } from 'react'
import { addEntry, updateEntry, deleteEntry } from './store'
import {
  parseTimeToDecimal,
  decimalToHM,
  computeHours,
  todayISO,
  fmtHours,
} from './utils'
import { useToast, burst } from './fx.jsx'

export default function EntryModal({ initial, onClose }) {
  const isEdit = !!initial?.id
  const { showToast } = useToast()
  const [date, setDate] = useState(initial?.date || todayISO())
  const [mode, setMode] = useState(initial?.mode || 'range')
  const [startStr, setStartStr] = useState(
    initial?.start != null ? decimalToHM(initial.start) : ''
  )
  const [endStr, setEndStr] = useState(
    initial?.end != null ? decimalToHM(initial.end) : ''
  )
  const [pauseStr, setPauseStr] = useState(
    initial?.pause != null ? String(initial.pause).replace('.', ',') : '0'
  )
  const [durationStr, setDurationStr] = useState(
    initial?.mode === 'duration' && initial?.hours != null
      ? String(initial.hours).replace('.', ',')
      : ''
  )
  const [description, setDescription] = useState(initial?.description || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const start = parseTimeToDecimal(startStr)
  const end = parseTimeToDecimal(endStr)
  const pause = parseTimeToDecimal(pauseStr) || 0
  const duration = parseTimeToDecimal(durationStr)

  const computed =
    mode === 'range'
      ? computeHours({ mode, start, end, pause })
      : Math.max(0, duration || 0)

  const canSave =
    !!date &&
    (mode === 'range'
      ? start != null && end != null && end > start
      : duration != null && duration > 0)

  function save(e) {
    const base = { date, mode, pause, description: description.trim() }
    const entry =
      mode === 'range'
        ? { ...base, start, end, hours: computed }
        : { ...base, start: null, end: null, hours: duration, pause: 0 }
    if (isEdit) {
      updateEntry(initial.id, entry)
      showToast('Gespeichert', { icon: '✅', tone: 'good' })
    } else {
      addEntry(entry)
      // Burst near the button
      const rect = e.currentTarget.getBoundingClientRect()
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, {
        emojis: ['✨', '⭐', '💫', '🎉', '🔥', '💖'],
        count: 30,
      })
      showToast(`+${computed.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`, {
        icon: '⚡', tone: 'brand',
      })
    }
    onClose()
  }

  function del() {
    deleteEntry(initial.id)
    showToast('Gelöscht', { icon: '🗑️', tone: 'bad' })
    onClose()
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h2>
        <div className="stack">
          <label className="field">
            Datum
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <div className="mode-toggle">
            <button
              className={mode === 'range' ? 'active' : ''}
              onClick={() => setMode('range')}
            >
              Von – Bis
            </button>
            <button
              className={mode === 'duration' ? 'active' : ''}
              onClick={() => setMode('duration')}
            >
              Nur Dauer
            </button>
          </div>

          {mode === 'range' ? (
            <>
              <div className="time-inputs">
                <label className="field">
                  Von
                  <input
                    type="time"
                    value={startStr}
                    onChange={(e) => setStartStr(e.target.value)}
                    step="900"
                  />
                </label>
                <label className="field">
                  Bis
                  <input
                    type="time"
                    value={endStr}
                    onChange={(e) => setEndStr(e.target.value)}
                    step="900"
                  />
                </label>
              </div>
              <label className="field">
                Pause (Stunden, z.B. 0,5 = 30 min)
                <input
                  type="text"
                  inputMode="decimal"
                  value={pauseStr}
                  onChange={(e) => setPauseStr(e.target.value)}
                  placeholder="0"
                />
              </label>
            </>
          ) : (
            <label className="field">
              Dauer (Stunden, z.B. 4,5)
              <input
                type="text"
                inputMode="decimal"
                value={durationStr}
                onChange={(e) => setDurationStr(e.target.value)}
                placeholder="0,00"
              />
            </label>
          )}

          <label className="field">
            Tätigkeit
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was hast du gemacht?"
            />
          </label>

          <div className="row" style={{ justifyContent: 'space-between', padding: '4px 2px' }}>
            <span className="muted small">Berechnet</span>
            <span className="mono" style={{ fontWeight: 600 }}>{fmtHours(computed)}</span>
          </div>

          <div className="row" style={{ marginTop: 8 }}>
            {isEdit && !confirmDelete && (
              <button className="btn danger" onClick={() => setConfirmDelete(true)}>Löschen</button>
            )}
            {isEdit && confirmDelete && (
              <>
                <button className="btn danger" onClick={del} style={{ background: 'var(--bad)', color: '#fff', border: 'none' }}>
                  Endgültig löschen
                </button>
                <button className="btn ghost" onClick={() => setConfirmDelete(false)}>Doch nicht</button>
              </>
            )}
            <div className="grow" />
            {!confirmDelete && (
              <>
                <button className="btn secondary" onClick={onClose}>Abbrechen</button>
                <button className="btn" onClick={save} disabled={!canSave}>
                  {isEdit ? 'Speichern' : 'Hinzufügen'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
