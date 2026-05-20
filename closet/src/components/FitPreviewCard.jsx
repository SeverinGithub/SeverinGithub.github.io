import { useMemo, useState } from 'react'
import { TAG_CATALOG, getItemTagKeys } from '../lib/tags.js'

const CORE_SLOTS = [
  { category: 'jackets', label: 'Jacke' },
  { category: 'tops', label: 'Oberteil' },
  { category: 'pants', label: 'Hose' },
  { category: 'shoes', label: 'Schuhe' },
]

function collectStyleTags(parts) {
  const seen = new Set()
  const labels = []
  for (const part of parts) {
    for (const key of getItemTagKeys(part)) {
      if (!key.startsWith('style:') || seen.has(key)) continue
      seen.add(key)
      const label = TAG_CATALOG[key]?.label
      if (label) labels.push(label)
    }
  }
  return labels
}

function FitSlot({ label, item }) {
  return (
    <div className="fit-preview-slot">
      <img src={item.imageDataUrl} alt="" className="fit-preview-img" />
      <span className="fit-preview-slot-label">{label}</span>
    </div>
  )
}

export default function FitPreviewCard({
  fit,
  itemsById,
  rank,
  seasonLabel,
  activityLabel,
  weatherTemp,
  showMatchScore = true,
  compact = false,
  isFavorite = false,
  onToggleFavorite,
}) {
  const [accessoriesOpen, setAccessoriesOpen] = useState(false)

  const parts = useMemo(() => {
    const ids = fit?.itemIds ?? []
    return ids.map((id) => itemsById.get(id)).filter(Boolean)
  }, [fit?.itemIds, itemsById])

  const accessories = useMemo(
    () => parts.filter((p) => p.category === 'accessories'),
    [parts],
  )

  const partsByCategory = useMemo(() => {
    const map = new Map()
    for (const part of parts) {
      if (part.category !== 'accessories' && !map.has(part.category)) {
        map.set(part.category, part)
      }
    }
    return map
  }, [parts])

  const styleTags = useMemo(() => collectStyleTags(parts), [parts])
  const headerTags = [activityLabel, ...styleTags].filter(Boolean)

  const hasAccessories = accessories.length > 0

  const filledSlots = useMemo(
    () =>
      CORE_SLOTS.map((slot) => ({
        ...slot,
        item: partsByCategory.get(slot.category),
      })).filter((slot) => slot.item),
    [partsByCategory],
  )

  return (
    <article className={`fit-preview-card${compact ? ' fit-preview-card--compact' : ''}`}>
      <header className="fit-preview-meta">
        <div className="fit-preview-meta-left">
          <h3 className="fit-preview-title">
            {seasonLabel} Fit
            {!compact && <span className="fit-preview-rank">#{rank}</span>}
          </h3>
          <p className="fit-preview-weather">
            {weatherTemp != null ? `${weatherTemp}°C` : '—°C'}
          </p>
        </div>
        <div className="fit-preview-meta-right">
          {!compact && <p className="fit-preview-tags">{headerTags.join(' · ')}</p>}
          <div className="fit-preview-meta-actions">
            {showMatchScore && typeof fit.score === 'number' && (
              <span className="fit-preview-score">{fit.score}%</span>
            )}
            {onToggleFavorite && (
              <button
                type="button"
                className={`fit-preview-fav-btn${isFavorite ? ' fit-preview-fav-btn--on' : ''}`}
                onClick={() => onToggleFavorite(fit.id)}
                aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                aria-pressed={isFavorite}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="fit-preview-grid" aria-label={`Outfit ${rank}`}>
        {filledSlots.map((slot) => (
          <FitSlot key={slot.category} label={slot.label} item={slot.item} />
        ))}
      </div>

      {hasAccessories && (
        <section className="fit-preview-accessories">
          <button
            type="button"
            className="fit-preview-accessories-toggle"
            onClick={() => setAccessoriesOpen((o) => !o)}
            aria-expanded={accessoriesOpen}
          >
            <span>Accessoires</span>
            <span className="fit-preview-accessories-count">{accessories.length}</span>
            <svg
              className={`fit-preview-chevron${accessoriesOpen ? ' fit-preview-chevron--open' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M6 9l6 6 6-6"
              />
            </svg>
          </button>

          {accessoriesOpen && (
            <div className="fit-preview-accessories-grid">
              {accessories.map((item) => (
                <div key={item.id} className="fit-preview-slot">
                  <img src={item.imageDataUrl} alt="" className="fit-preview-img" />
                  <span className="fit-preview-slot-label">
                    {item.tags?.[0] ?? `Nr. ${item.displayNumber}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </article>
  )
}
