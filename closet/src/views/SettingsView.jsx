import { useState } from 'react'
import FitsCategoryPicker from '../components/FitsCategoryPicker.jsx'
import WardrobeImport from '../components/WardrobeImport.jsx'
import { COLOR_MODES, THEME_COLORS } from '../lib/appSettings.js'
import { useSettings } from '../context/SettingsContext.jsx'
import { useWardrobe } from '../context/WardrobeContext.jsx'

function SettingsSection({ title, children }) {
  return (
    <section className="settings-section">
      <h2 className="settings-section-title">{title}</h2>
      {children}
    </section>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="settings-toggle">
      <span className="settings-toggle-text">
        <span className="settings-toggle-label">{label}</span>
        {description && <span className="settings-toggle-desc">{description}</span>}
      </span>
      <input
        type="checkbox"
        className="settings-toggle-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="settings-toggle-track" aria-hidden />
    </label>
  )
}

export default function SettingsView({ onBack }) {
  const { settings, setSettings } = useSettings()
  const { items, clearAllItems, exportWardrobe, storageError } = useWardrobe()
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearAllItems()
    setConfirmClear(false)
  }

  return (
    <div className="view view--settings">
      <header className="view-header view-header--row">
        <button
          type="button"
          className="btn-icon btn-icon--back"
          onClick={onBack}
          aria-label="Zurück"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 18l-6-6 6-6"
            />
          </svg>
        </button>
        <div className="view-header-text">
          <h1 className="view-title">Einstellungen</h1>
          <p className="view-subtitle">App &amp; Kleiderschrank anpassen.</p>
        </div>
      </header>

      <SettingsSection title="Theme">
        <p className="settings-hint">Akzentfarbe der App</p>
        <div className="settings-theme-grid" role="list">
          {THEME_COLORS.map((theme) => (
            <button
              key={theme.id}
              type="button"
              role="listitem"
              className={`settings-theme-swatch${settings.themeColor === theme.id ? ' settings-theme-swatch--active' : ''}`}
              style={{ '--swatch': theme.swatch }}
              onClick={() => setSettings({ themeColor: theme.id })}
              aria-pressed={settings.themeColor === theme.id}
              aria-label={theme.label}
            >
              <span className="settings-theme-swatch-dot" />
              <span className="settings-theme-swatch-label">{theme.label}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Erscheinungsbild">
        <p className="settings-hint">Tag- und Nachtmodus</p>
        <div className="settings-segmented" role="group" aria-label="Farbmodus">
          {COLOR_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`settings-segmented-btn${settings.colorMode === mode.id ? ' settings-segmented-btn--active' : ''}`}
              onClick={() => setSettings({ colorMode: mode.id })}
              aria-pressed={settings.colorMode === mode.id}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Fits &amp; Wetter">
        <ToggleRow
          label="Standort fürs Wetter"
          description="GPS nutzen, sonst Berlin als Standard"
          checked={settings.useLocationForWeather}
          onChange={(useLocationForWeather) => setSettings({ useLocationForWeather })}
        />
        <ToggleRow
          label="Match-Score anzeigen"
          description="Prozentzahl bei Outfit-Vorschlägen"
          checked={settings.showMatchScores}
          onChange={(showMatchScores) => setSettings({ showMatchScores })}
        />
      </SettingsSection>

      <SettingsSection title="Fits – Schnellkategorien">
        <FitsCategoryPicker
          selectedIds={settings.fitsTabCategories}
          onChange={(fitsTabCategories) => setSettings({ fitsTabCategories })}
        />
      </SettingsSection>

      <SettingsSection title="Bedienung">
        <ToggleRow
          label="Weniger Animationen"
          description="Übergänge und Effekte reduzieren"
          checked={settings.reducedMotion}
          onChange={(reducedMotion) => setSettings({ reducedMotion })}
        />
      </SettingsSection>

      <SettingsSection title="Daten">
        <p className="settings-hint">
          {items.length} {items.length === 1 ? 'Teil' : 'Teile'} auf diesem Gerät (IndexedDB + Backup).
          Bleibt erhalten, solange du dieselbe URL nutzt (z.&nbsp;B. immer{' '}
          <code className="settings-code">localhost:5173</code>).
        </p>
        {storageError && <p className="ootd-error">{storageError}</p>}
        <div className="settings-actions">
          <button type="button" className="btn btn--secondary" onClick={exportWardrobe}>
            Kleidung exportieren (Backup)
          </button>
        </div>
        <WardrobeImport variant="settings" />
        <div className="settings-actions settings-actions--danger">
          <button
            type="button"
            className={`btn btn--danger${confirmClear ? ' btn--danger-confirm' : ''}`}
            onClick={handleClear}
            onBlur={() => setConfirmClear(false)}
          >
            {confirmClear ? 'Wirklich alles löschen?' : 'Schrank leeren'}
          </button>
        </div>
      </SettingsSection>

      <p className="settings-version">Closet · lokal auf diesem Gerät</p>
    </div>
  )
}
