import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ACTIVITIES, activityLabels } from '../lib/activities.js'
import { generateBestFitForActivities } from '../lib/generateFits.js'
import { saveOutfitOfDay } from '../lib/ootd.js'
import { fetchWeatherContext } from '../lib/weather.js'
import { useSettings } from '../context/SettingsContext.jsx'
import FitPreviewCard from './FitPreviewCard.jsx'

const STEP_DURATION_MS = 2400
const REVEAL_DURATION_MS = 2000
const TOTAL_STEPS = 4

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitAtLeast(start, minMs) {
  const elapsed = Date.now() - start
  if (elapsed < minMs) await wait(minMs - elapsed)
}

export default function OutfitOfDayModal({ open, onClose, items, fitReady, seasonLabel }) {
  const { settings } = useSettings()
  const [step, setStep] = useState(1)
  const [statusText, setStatusText] = useState('')
  const [placeName, setPlaceName] = useState(null)
  const [weatherTemp, setWeatherTemp] = useState(null)
  const [selectedActivities, setSelectedActivities] = useState([])
  const [currentFit, setCurrentFit] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState(null)
  const runId = useRef(0)
  const mounted = useRef(true)

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const progressPct = accepted ? 100 : (step / TOTAL_STEPS) * 100

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const safeSet = useCallback((fn) => {
    if (mounted.current) fn()
  }, [])

  const reset = useCallback(() => {
    setStep(1)
    setStatusText('')
    setPlaceName(null)
    setWeatherTemp(null)
    setSelectedActivities([])
    setCurrentFit(null)
    setGenerating(false)
    setAccepted(false)
    setError(null)
  }, [])

  const runLocationStep = useCallback(
    async (id) => {
      try {
        safeSet(() => {
          setStep(1)
          setStatusText('Standort wird ermittelt …')
          setError(null)
        })
        const start = Date.now()
        const ctx = await fetchWeatherContext({ useLocation: settings.useLocationForWeather })
        if (runId.current !== id || !mounted.current) return
        safeSet(() => {
          setPlaceName(ctx?.placeName ?? 'Unbekannt')
          setWeatherTemp(ctx?.temp ?? null)
        })
        await waitAtLeast(start, STEP_DURATION_MS)
        if (runId.current !== id || !mounted.current) return
        safeSet(() => {
          setStep(2)
          setStatusText('Wetter wird geladen …')
        })
        await wait(STEP_DURATION_MS)
        if (runId.current !== id || !mounted.current) return
        safeSet(() => {
          setStep(3)
          setStatusText('Wähle deine Pläne für heute')
        })
      } catch (err) {
        console.error('OOTD location/weather', err)
        if (runId.current !== id || !mounted.current) return
        safeSet(() => {
          setError('Standort/Wetter fehlgeschlagen – du kannst trotzdem weitermachen.')
          setPlaceName('Standard')
          setStep(3)
          setStatusText('Wähle deine Pläne für heute')
        })
      }
    },
    [settings.useLocationForWeather, safeSet],
  )

  const generateOutfit = useCallback(
    async (activityIds) => {
      try {
        safeSet(() => {
          setGenerating(true)
          setError(null)
          setStatusText('Dein perfektes Outfit wird zusammengestellt …')
        })
        const start = Date.now()
        await wait(REVEAL_DURATION_MS)

        let fit = null
        try {
          fit = await new Promise((resolve, reject) => {
            window.setTimeout(() => {
              try {
                resolve(
                  generateBestFitForActivities(items, activityIds, { limit: 10, maxActivities: 8 }),
                )
              } catch (e) {
                reject(e)
              }
            }, 0)
          })
        } catch (err) {
          console.error('OOTD generate', err)
          throw err
        }

        await waitAtLeast(start, REVEAL_DURATION_MS)
        if (!mounted.current) return

        safeSet(() => {
          setCurrentFit(fit)
          setGenerating(false)
          setStep(4)
          setStatusText(fit ? 'Passt das?' : 'Kein passendes Outfit gefunden')
        })
      } catch (err) {
        console.error('OOTD outfit step', err)
        if (!mounted.current) return
        safeSet(() => {
          setGenerating(false)
          setStep(4)
          setCurrentFit(null)
          setError('Outfit konnte nicht erstellt werden. Bitte erneut versuchen.')
          setStatusText('Fehler')
        })
      }
    },
    [items, safeSet],
  )

  useEffect(() => {
    if (!open) return undefined
    reset()
    const id = ++runId.current
    if (fitReady) {
      runLocationStep(id)
    }
    return () => {
      runId.current += 1
    }
  }, [open, fitReady, reset, runLocationStep])

  if (!open) return null

  function toggleActivity(id) {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleWeiter() {
    if (selectedActivities.length === 0) return
    generateOutfit(selectedActivities)
  }

  function handleMeh() {
    if (selectedActivities.length === 0) return
    setStep(3)
    setCurrentFit(null)
    setAccepted(false)
    generateOutfit(selectedActivities)
  }

  function handleAnziehen() {
    if (!currentFit?.itemIds?.length) return
    try {
      saveOutfitOfDay({
        itemIds: currentFit.itemIds,
        activityIds: selectedActivities,
        placeName,
        weatherTemp,
        score: currentFit.score,
        primaryActivity: currentFit.primaryActivity,
      })
      setAccepted(true)
      setTimeout(() => {
        if (mounted.current) onClose(true)
      }, 600)
    } catch (err) {
      console.error('OOTD save', err)
      setError('Speichern fehlgeschlagen.')
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose(false)
  }

  const activitySummary =
    selectedActivities.length > 0 ? activityLabels(selectedActivities) : ''

  return (
    <div className="ootd-backdrop" role="presentation" onClick={handleBackdrop}>
      <div
        className="ootd-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ootd-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ootd-header">
          <div>
            <h2 id="ootd-title" className="ootd-title">
              Outfit des Tages
            </h2>
            <p className="ootd-progress-label">
              Schritt {accepted ? 4 : step} / {TOTAL_STEPS}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={() => onClose(false)} aria-label="Schließen">
            ×
          </button>
        </header>

        <div className="ootd-progress-track" aria-hidden>
          <div
            className={`ootd-progress-fill${accepted ? ' ootd-progress-fill--done' : ''}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="ootd-body">
          {error && <p className="ootd-error">{error}</p>}

          {!fitReady ? (
            <p className="ootd-message">
              Füge im Editor mindestens Oberteil, Hose und Schuhe hinzu – dann kann dein Outfit des Tages
              entstehen.
            </p>
          ) : (
            <>
              {(step <= 2 || generating) && (
                <div className="ootd-loading">
                  <div className="ootd-spinner" aria-hidden />
                  <p className="ootd-status">{statusText}</p>
                  {step >= 1 && placeName && step < 3 && !generating && (
                    <p className="ootd-detail">
                      <span className="ootd-detail-icon">📍</span> {placeName}
                    </p>
                  )}
                  {step >= 2 && weatherTemp != null && step < 3 && !generating && (
                    <p className="ootd-detail">
                      <span className="ootd-detail-icon">🌡</span> {weatherTemp}°C
                    </p>
                  )}
                </div>
              )}

              {step === 3 && !generating && (
                <div className="ootd-activities">
                  <p className="ootd-status">{statusText}</p>
                  <p className="ootd-hint">Mehrere möglich – z. B. Schule + Stadt</p>
                  <div className="ootd-activity-grid">
                    {ACTIVITIES.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        className={`pill pill--selectable ootd-activity-pill${
                          selectedActivities.includes(act.id) ? ' pill--selected' : ''
                        }`}
                        onClick={() => toggleActivity(act.id)}
                        aria-pressed={selectedActivities.includes(act.id)}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && !generating && currentFit?.itemIds?.length > 0 && (
                <div className="ootd-result ootd-result--reveal">
                  <FitPreviewCard
                    fit={currentFit}
                    itemsById={itemsById}
                    rank={1}
                    seasonLabel={seasonLabel ?? 'Outfit'}
                    activityLabel={activitySummary || 'Outfit'}
                    weatherTemp={weatherTemp}
                    showMatchScore={settings.showMatchScores}
                  />
                </div>
              )}

              {step === 4 && !generating && !currentFit?.itemIds?.length && (
                <p className="ootd-message">
                  {activitySummary
                    ? `Kein passendes Outfit für ${activitySummary}. Tags prüfen oder andere Aktivitäten wählen.`
                    : 'Kein passendes Outfit gefunden.'}
                </p>
              )}
            </>
          )}
        </div>

        {fitReady && (
          <footer className="ootd-footer">
            {step === 4 && currentFit?.itemIds?.length > 0 && !accepted && (
              <button type="button" className="ootd-btn ootd-btn--meh" onClick={handleMeh}>
                Meh
              </button>
            )}
            <div className="ootd-footer-spacer" />
            {step === 3 && !generating && (
              <button
                type="button"
                className="btn btn--primary ootd-btn--primary"
                disabled={selectedActivities.length === 0}
                onClick={handleWeiter}
              >
                Weiter
              </button>
            )}
            {step === 4 && currentFit?.itemIds?.length > 0 && !accepted && (
              <button type="button" className="btn btn--primary ootd-btn--primary" onClick={handleAnziehen}>
                Anziehen
              </button>
            )}
            {accepted && <span className="ootd-done">✓ Heutiges Outfit gespeichert</span>}
          </footer>
        )}
      </div>
    </div>
  )
}
