import { useCallback, useEffect, useMemo, useState } from 'react'
import { activityLabel } from '../lib/activities.js'
import { getFitsTabActivities, getFitsTabCategoryIds } from '../lib/fitsCategories.js'
import { loadFavoriteFitIds, toggleFavoriteFitId } from '../lib/favoriteFits.js'
import FitPreviewCard from '../components/FitPreviewCard.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { useWardrobe } from '../context/WardrobeContext.jsx'
import { fetchCurrentTemperature } from '../lib/weather.js'
import { SEASONS } from '../types/clothing.js'

export default function FitsView() {
  const { items, fits, fitReady, fitCount, currentSeason, activity, setActivity, refreshFits } =
    useWardrobe()
  const { settings } = useSettings()

  const fitsTabActivities = useMemo(
    () => getFitsTabActivities(settings.fitsTabCategories),
    [settings.fitsTabCategories],
  )
  const fitsTabIds = useMemo(
    () => getFitsTabCategoryIds(settings),
    [settings.fitsTabCategories],
  )
  const activeActivityLabel =
    fitsTabActivities.find((a) => a.id === activity)?.label ?? activityLabel(activity)

  useEffect(() => {
    if (!fitsTabIds.includes(activity) && fitsTabIds[0]) {
      setActivity(fitsTabIds[0])
    }
  }, [activity, fitsTabIds, setActivity])

  const [weatherTemp, setWeatherTemp] = useState(null)
  const [favoriteIds, setFavoriteIds] = useState(loadFavoriteFitIds)

  useEffect(() => {
    let cancelled = false
    fetchCurrentTemperature({ useLocation: settings.useLocationForWeather }).then((temp) => {
      if (!cancelled) setWeatherTemp(temp)
    })
    return () => {
      cancelled = true
    }
  }, [settings.useLocationForWeather])

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const handleToggleFavorite = useCallback((fitId) => {
    setFavoriteIds(toggleFavoriteFitId(fitId))
  }, [])

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const seasonLabel = SEASONS.find((s) => s.id === currentSeason)?.label ?? currentSeason

  const { favoriteFits, aiFits } = useMemo(() => {
    const favorites = []
    const ai = []
    for (const fit of fits) {
      if (favoriteIdSet.has(fit.id)) favorites.push(fit)
      else ai.push(fit)
    }
    return { favoriteFits: favorites, aiFits: ai }
  }, [fits, favoriteIdSet])

  const cardProps = {
    itemsById,
    seasonLabel,
    activityLabel: activeActivityLabel,
    weatherTemp,
    showMatchScore: settings.showMatchScores,
    onToggleFavorite: handleToggleFavorite,
  }

  return (
    <div className="view view--fits">
      <header className="view-header view-header--row">
        <div className="view-header-text">
          <h1 className="view-title">Fits</h1>
          <p className="view-subtitle">
            {fitReady
              ? `${fitCount} Vorschläge · ${activeActivityLabel} · ${seasonLabel}`
              : 'Outfit-Vorschläge aus deinem eigenen Schrank.'}
          </p>
        </div>
        {fitReady && (
          <button
            type="button"
            className="btn-refresh"
            onClick={refreshFits}
            aria-label="Neue Vorschläge"
            title="Neue Vorschläge"
          >
            <svg className="btn-refresh-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"
              />
            </svg>
          </button>
        )}
      </header>

      {fitReady ? (
        <div className="fits-layout">
          <section className="fits-section fits-section--categories">
            <h2 className="section-label">Kategorien</h2>
            <div className="fits-section-rule" aria-hidden />
            <div className="pill-row pill-row--wrap fits-categories" role="list">
              {fitsTabActivities.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  role="listitem"
                  className={`pill pill--selectable${activity === act.id ? ' pill--selected' : ''}`}
                  onClick={() => setActivity(act.id)}
                  aria-pressed={activity === act.id}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </section>

          {fits.length > 0 ? (
            <>
              <section className="fits-section fits-section--favorites" aria-labelledby="fits-favorites-heading">
                <h2 id="fits-favorites-heading" className="section-label">
                  Favoriten
                </h2>
                <div className="fits-section-rule" aria-hidden />
                <div className="fits-favorites-scroll">
                  {favoriteFits.length > 0 ? (
                    favoriteFits.map((fit, index) => (
                      <FitPreviewCard
                        key={`fav-${fit.id}-${activity}`}
                        fit={fit}
                        rank={index + 1}
                        compact
                        isFavorite
                        {...cardProps}
                      />
                    ))
                  ) : (
                    <p className="fits-favorites-empty">
                      Tippe auf den Stern bei einem KI-Fit – er erscheint hier in der Leiste.
                    </p>
                  )}
                </div>
              </section>

              <section
                className="fits-section fits-section--ai"
                aria-labelledby="fits-ai-heading"
              >
                <h2 id="fits-ai-heading" className="section-label">
                  KI-generierte Fits
                </h2>
                <div className="fits-section-rule" aria-hidden />
                {aiFits.length > 0 ? (
                  <div className="fits-ai-list">
                    {aiFits.map((fit, index) => (
                      <FitPreviewCard
                        key={`ai-${fit.id}-${activity}-${index}`}
                        fit={fit}
                        rank={favoriteFits.length + index + 1}
                        isFavorite={favoriteIdSet.has(fit.id)}
                        {...cardProps}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="fits-ai-empty">
                    Alle aktuellen Vorschläge sind in deinen Favoriten – wähle eine andere Kategorie
                    oder entferne einen Stern.
                  </p>
                )}
              </section>
            </>
          ) : (
            <div className="empty-state empty-state--compact">
              <h2 className="empty-state-title">Keine passenden Fits</h2>
              <p className="empty-state-text">
                Für {activeActivityLabel} fehlen passende Kombinationen oder Tags. Tagge Teile z. B.
                mit Shorts, Formal, Farben oder „Wanderjacke“ – unpassende Stücke werden ausgeschlossen.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-art" aria-hidden>
            <div className="empty-hanger" />
            <div className="empty-shirt" />
            <div className="empty-pants" />
          </div>
          <h2 className="empty-state-title">Noch keine Fits</h2>
          <p className="empty-state-text">
            Füge mindestens ein Oberteil, eine Hose und Schuhe mit passender Saison im Editor hinzu.
            Tags wie Farbe und Stil verbessern die Vorschläge.
          </p>
          <span className="pill pill--accent">Editor öffnen</span>
        </div>
      )}
    </div>
  )
}
