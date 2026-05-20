import { ACTIVITIES, getActivity } from './activities.js'

/** Alle wählbaren Schnellkategorien im Fits-Tab (max. 8 aktiv) */
export const FITS_CATEGORY_POOL = [
  { id: 'school', label: 'Schule' },
  { id: 'work', label: 'Arbeit' },
  { id: 'office', label: 'Büro' },
  { id: 'sport', label: 'Sport' },
  { id: 'gym', label: 'Gym' },
  { id: 'running', label: 'Laufen' },
  { id: 'casual', label: 'Freizeit' },
  { id: 'home', label: 'Zuhause' },
  { id: 'date', label: 'Date' },
  { id: 'party', label: 'Party' },
  { id: 'club', label: 'Club' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'travel', label: 'Reisen' },
  { id: 'vacation', label: 'Urlaub' },
  { id: 'beach', label: 'Strand' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'hiking', label: 'Wandern' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'concert', label: 'Konzert' },
  { id: 'festival', label: 'Festival' },
  { id: 'wedding', label: 'Hochzeit' },
  { id: 'family', label: 'Familienfeier' },
  { id: 'meeting', label: 'Business Meeting' },
  { id: 'interview', label: 'Bewerbungsgespräch' },
  { id: 'dinner', label: 'Abendessen' },
  { id: 'university', label: 'Uni' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'chill', label: 'Chillen' },
  { id: 'cold', label: 'Winteraktivitäten' },
  { id: 'hot', label: 'Sommeraktivitäten' },
]

export const MAX_FITS_TAB_CATEGORIES = 8

export const DEFAULT_FITS_TAB_IDS = ['casual', 'work', 'sport', 'date', 'party', 'gym', 'university', 'home']

const POOL_IDS = new Set(FITS_CATEGORY_POOL.map((p) => p.id))

export function normalizeFitsTabCategories(raw) {
  if (!Array.isArray(raw)) return [...DEFAULT_FITS_TAB_IDS]
  const valid = [...new Set(raw.filter((id) => POOL_IDS.has(id)))].slice(0, MAX_FITS_TAB_CATEGORIES)
  return valid.length ? valid : [...DEFAULT_FITS_TAB_IDS]
}

/** Aktivitäten für Fits-Schnellwahl (Label aus Pool, Regeln aus activities.js) */
export function getFitsTabActivities(selectedIds) {
  const ids = normalizeFitsTabCategories(selectedIds)
  return ids
    .map((id) => {
      const activity = getActivity(id)
      const pool = FITS_CATEGORY_POOL.find((p) => p.id === id)
      if (!activity) return null
      return { ...activity, label: pool?.label ?? activity.label }
    })
    .filter(Boolean)
}

export function getFitsTabCategoryIds(settings) {
  return normalizeFitsTabCategories(settings?.fitsTabCategories)
}
