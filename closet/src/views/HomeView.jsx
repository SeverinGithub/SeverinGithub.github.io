import { useMemo, useState } from 'react'
import ClosetVisual from '../components/ClosetVisual.jsx'
import OutfitOfDayModal from '../components/OutfitOfDayModal.jsx'
import { loadOutfitOfDay } from '../lib/ootd.js'
import { useWardrobe } from '../context/WardrobeContext.jsx'
import { SEASONS } from '../types/clothing.js'
import { activityLabels } from '../lib/activities.js'

export default function HomeView({ onOpenSettings }) {
  const { items, itemCount, fitCount, fitReady, currentSeason } = useWardrobe()
  const [ootdOpen, setOotdOpen] = useState(false)
  const [ootdSaved, setOotdSaved] = useState(() => loadOutfitOfDay())

  const seasonLabel = SEASONS.find((s) => s.id === currentSeason)?.label ?? currentSeason

  const ootdSummary = useMemo(() => {
    if (!ootdSaved) return null
    const acts = ootdSaved.activityIds?.length
      ? activityLabels(ootdSaved.activityIds)
      : null
    const place = ootdSaved.placeName
    const temp = ootdSaved.weatherTemp
    const bits = [acts, temp != null ? `${temp}°C` : null, place].filter(Boolean)
    return bits.join(' · ')
  }, [ootdSaved])

  function handleOotdClose(didAccept) {
    setOotdOpen(false)
    if (didAccept) setOotdSaved(loadOutfitOfDay())
  }

  return (
    <div className="view">
      <header className="view-header view-header--row">
        <div className="view-header-text">
          <p className="view-greeting">Willkommen!</p>
          <h1 className="view-title">Dein Closet</h1>
          <p className="view-subtitle">Dein digitaler Kleiderschrank – Schritt für Schritt.</p>
        </div>
        <button
          type="button"
          className="btn-icon btn-icon--settings"
          onClick={onOpenSettings}
          aria-label="Einstellungen"
          title="Einstellungen"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            />
          </svg>
        </button>
      </header>

      <section className="section">
        <article className="card card--featured">
          <div className="card-featured-art" aria-hidden>
            <div className="card-featured-circle" />
            <div className="card-featured-shirt" />
          </div>
          <div className="card-body">
            <span className={`card-badge${ootdSaved ? ' card-badge--success' : ''}`}>
              {ootdSaved ? 'Heute geplant' : 'Neu'}
            </span>
            <h2 className="card-title">Outfit des Tages</h2>
            <p className="card-text">
              {ootdSaved
                ? ootdSummary || 'Dein Look für heute ist gespeichert.'
                : 'Standort, Wetter und Pläne – dann dein perfektes Outfit aus dem Schrank.'}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setOotdOpen(true)}
            >
              {ootdSaved ? 'Nochmal entdecken' : 'Entdecken'}
            </button>
          </div>
        </article>
      </section>

      <OutfitOfDayModal
        open={ootdOpen}
        onClose={handleOotdClose}
        items={items}
        fitReady={fitReady}
        seasonLabel={seasonLabel}
      />

      <section className="section">
        <h2 className="section-label">Überblick</h2>
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-ring" aria-hidden>
              <svg viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" className="stat-ring-bg" />
                <circle cx="32" cy="32" r="26" className="stat-ring-fill" />
              </svg>
              <span className="stat-ring-value">{itemCount}</span>
            </div>
            <p className="stat-label">Teile</p>
          </div>
          <div className="stat-card">
            <div className="stat-ring stat-ring--secondary" aria-hidden>
              <svg viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" className="stat-ring-bg" />
                <circle cx="32" cy="32" r="26" className="stat-ring-fill" />
              </svg>
              <span className="stat-ring-value">{fitCount}</span>
            </div>
            <p className="stat-label">Outfits</p>
          </div>
        </div>
      </section>

      <section className="section section--closet">
        <h2 className="section-label">Dein Schrank</h2>
        <p className="closet-visual-hint">Nach unten scrollen – Oberteile, Hosen, Schuhe …</p>
        <ClosetVisual items={items} />
      </section>
    </div>
  )
}
