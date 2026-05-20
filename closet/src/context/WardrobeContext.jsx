import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { canGenerateFits, generateFits, getCurrentSeason } from '../lib/generateFits.js'
import { createClothingItem, updateClothingItem } from '../types/clothing.js'
import {
  loadWardrobeItems,
  mergeWardrobeItems,
  parseWardrobeImportFile,
  saveWardrobeItems,
} from '../lib/wardrobeStorage.js'

const WardrobeContext = createContext(null)

const ACTIVITY_STORAGE_KEY = 'closet-activity-v1'

function loadActivity() {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    return raw || 'casual'
  } catch {
    return 'casual'
  }
}

export function WardrobeProvider({ children }) {
  const [items, setItems] = useState([])
  const [storageReady, setStorageReady] = useState(false)
  const [storageError, setStorageError] = useState(null)
  const [fitNonce, setFitNonce] = useState(0)
  const [activity, setActivityState] = useState(loadActivity)
  const saveTimer = useRef(null)

  useEffect(() => {
    let cancelled = false
    loadWardrobeItems()
      .then((loaded) => {
        if (!cancelled) {
          setItems(loaded)
          setStorageReady(true)
        }
      })
      .catch((err) => {
        console.error('Wardrobe load', err)
        if (!cancelled) {
          setStorageError('Schrank konnte nicht geladen werden.')
          setStorageReady(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!storageReady) return undefined
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveWardrobeItems(items).catch((err) => {
        console.warn('Wardrobe save', err)
        setStorageError('Speichern fehlgeschlagen – bitte exportieren als Backup.')
      })
    }, 400)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [items, storageReady])

  const addItem = useCallback((draft) => {
    setItems((prev) => [...prev, createClothingItem(draft, prev)])
  }, [])

  const updateItem = useCallback((id, draft) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? updateClothingItem(item, draft) : item)),
    )
    setFitNonce((n) => n + 1)
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      saveWardrobeItems(next)
      return next
    })
    setFitNonce((n) => n + 1)
  }, [])

  const refreshFits = useCallback(() => {
    setFitNonce((n) => n + 1)
  }, [])

  const clearAllItems = useCallback(() => {
    setItems([])
    setFitNonce((n) => n + 1)
    saveWardrobeItems([])
  }, [])

  const exportWardrobe = useCallback(() => {
    const json = JSON.stringify(items, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `closet-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [items])

  const importWardrobe = useCallback(
    async (file, { mode = 'replace' } = {}) => {
      const text = await file.text()
      const { items: imported, skipped, total } = parseWardrobeImportFile(text)
      if (!imported.length) {
        const hint =
          total > 0
            ? `${total} Einträge gefunden, aber keiner hat Foto + Kategorie.`
            : 'Keine Kleidungsliste in der Datei (erwartet: JSON-Array).'
        throw new Error(hint)
      }

      const next =
        mode === 'merge' ? mergeWardrobeItems(items, imported) : imported

      setItems(next)
      setFitNonce((n) => n + 1)
      await saveWardrobeItems(next)
      setStorageError(null)
      return { imported: imported.length, skipped, total, totalAfter: next.length, mode }
    },
    [items],
  )

  const setActivity = useCallback((id) => {
    setActivityState(id)
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, id)
    } catch {
      /* ignore */
    }
    setFitNonce((n) => n + 1)
  }, [])

  const value = useMemo(() => {
    const season = getCurrentSeason()
    const fits = generateFits(items, { season, activity })
    const fitReady = canGenerateFits(items)
    return {
      items,
      storageReady,
      storageError,
      addItem,
      updateItem,
      removeItem,
      itemCount: items.length,
      fits,
      fitCount: fits.length,
      fitReady,
      currentSeason: season,
      activity,
      setActivity,
      refreshFits,
      clearAllItems,
      exportWardrobe,
      importWardrobe,
    }
  }, [
    items,
    storageReady,
    storageError,
    addItem,
    updateItem,
    removeItem,
    fitNonce,
    refreshFits,
    activity,
    clearAllItems,
    exportWardrobe,
    importWardrobe,
  ])

  return <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext)
  if (!ctx) throw new Error('useWardrobe must be used within WardrobeProvider')
  return ctx
}
