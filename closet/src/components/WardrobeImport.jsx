import { useRef, useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext.jsx'

/**
 * @param {'editor' | 'settings'} variant
 */
export default function WardrobeImport({ variant = 'editor', onSuccess }) {
  const { items, importWardrobe } = useWardrobe()
  const fileRef = useRef(null)
  const [pendingMode, setPendingMode] = useState(null)
  const [message, setMessage] = useState(null)

  async function runImport(mode, file) {
    if (!file) return
    setMessage(null)
    try {
      const result = await importWardrobe(file, { mode })
      const skipNote =
        result.skipped > 0 ? ` (${result.skipped} übersprungen)` : ''
      const text =
        mode === 'merge'
          ? `${result.imported} Teile hinzugefügt${skipNote} – ${result.totalAfter} gesamt.`
          : `${result.imported} Teile importiert${skipNote} (Schrank ersetzt).`
      setMessage(text)
      onSuccess?.(result)
    } catch (err) {
      setMessage(err.message ?? 'Import fehlgeschlagen.')
    }
  }

  function openPicker(mode) {
    setPendingMode(mode)
    setMessage(null)
    fileRef.current?.click()
  }

  function handleFileChange(e) {
    const mode = pendingMode
    const file = e.target.files?.[0]
    e.target.value = ''
    setPendingMode(null)
    if (!mode || !file) return
    runImport(mode, file)
  }

  if (variant === 'settings') {
    return (
      <div className="wardrobe-import wardrobe-import--settings">
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileChange}
        />
        {message && <p className="settings-import-msg">{message}</p>}
        <div className="settings-actions">
          <button type="button" className="btn btn--secondary" onClick={() => openPicker('merge')}>
            Kleidung hinzufügen (JSON)
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => openPicker('replace')}>
            Schrank ersetzen (JSON)
          </button>
        </div>
        <p className="settings-hint settings-hint--tight">
          JSON von „Schrank exportieren“ oder älterem Backup. Pflicht: Foto, Kategorie, Saison.
        </p>
      </div>
    )
  }

  return (
    <div className="wardrobe-import wardrobe-import--editor">
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleFileChange}
      />
      <div className="editor-import-row">
        <button
          type="button"
          className="add-card add-card--import"
          onClick={() => openPicker(items.length ? 'merge' : 'replace')}
          aria-label="Kleidung aus JSON importieren"
        >
          <span className="add-card-icon">↓</span>
          <span className="add-card-label">Kleidung importieren</span>
          <span className="add-card-hint">Backup-JSON · {items.length ? 'wird angehängt' : 'neuer Schrank'}</span>
        </button>
        {items.length > 0 && (
          <button
            type="button"
            className="editor-import-replace"
            onClick={() => openPicker('replace')}
          >
            Schrank ersetzen
          </button>
        )}
      </div>
      {message && <p className="editor-import-msg">{message}</p>}
    </div>
  )
}
