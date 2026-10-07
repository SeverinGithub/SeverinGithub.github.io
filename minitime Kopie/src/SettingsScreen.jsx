import { useState } from 'react'
import { useStore, updateSettings, exportJson, replaceAll } from './store'
import { fmtEuro } from './utils'
import { lock } from './AuthGate'

export default function SettingsScreen() {
  const state = useStore()
  const s = state.settings
  const [name, setName] = useState(s.name)
  const [rate, setRate] = useState(String(s.hourlyRate).replace('.', ','))
  const [limit, setLimit] = useState(String(s.minijobLimit).replace('.', ','))
  const [pattern, setPattern] = useState(s.templateFilename)

  function save() {
    const parsedRate = parseFloat(rate.replace(',', '.'))
    const parsedLimit = parseFloat(limit.replace(',', '.'))
    updateSettings({
      name,
      hourlyRate: Number.isFinite(parsedRate) ? parsedRate : s.hourlyRate,
      minijobLimit: Number.isFinite(parsedLimit) ? parsedLimit : s.minijobLimit,
      templateFilename: pattern,
    })
    alert('Gespeichert')
  }

  function download() {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `minijob-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function importFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!confirm('Backup einspielen? Aktuelle Daten werden überschrieben.')) return
        replaceAll(data)
        alert('Backup wiederhergestellt.')
      } catch (err) {
        alert('Ungültige Datei: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <div className="header">
        <h1>Einstellungen</h1>
      </div>

      <div className="content">
        <div className="card">
          <h2>Person</h2>
          <div className="stack">
            <label className="field">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="card">
          <h2>Vergütung</h2>
          <div className="stack">
            <label className="field">
              Stundenlohn (€)
              <input
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </label>
            <label className="field">
              Minijob-Grenze pro Monat (€)
              <input
                inputMode="decimal"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </label>
            <div className="hint">Aktuell (2026): {fmtEuro(556)}</div>
          </div>
        </div>

        <div className="card">
          <h2>Export</h2>
          <label className="field">
            Dateiname-Muster
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
          </label>
          <div className="hint">
            Platzhalter: <code>{'{MM}'}</code> (Monat 2-stellig), <code>{'{JJ}'}</code> (Jahr 2-stellig), <code>{'{YYYY}'}</code>
          </div>
        </div>

        <button className="btn block" onClick={save}>Speichern</button>

        <div className="card">
          <h2>Backup</h2>
          <div className="stack">
            <button className="btn secondary block" onClick={download}>
              Daten als JSON herunterladen
            </button>
            <label className="btn secondary block" style={{ display: 'inline-block', textAlign: 'center' }}>
              Backup einspielen…
              <input type="file" accept="application/json" onChange={importFile} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <button className="btn secondary block" onClick={lock}>
          🔒 App sperren
        </button>

        <div className="hint" style={{ textAlign: 'center', paddingBottom: 20 }}>
          Daten werden lokal in diesem Browser gespeichert.
        </div>
      </div>
    </>
  )
}
