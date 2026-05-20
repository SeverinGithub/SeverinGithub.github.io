export const FAVORITE_FITS_STORAGE_KEY = 'closet-favorite-fits-v1'

export function loadFavoriteFitIds() {
  try {
    const raw = localStorage.getItem(FAVORITE_FITS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function saveFavoriteFitIds(ids) {
  try {
    localStorage.setItem(FAVORITE_FITS_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

export function toggleFavoriteFitId(id) {
  const set = new Set(loadFavoriteFitIds())
  if (set.has(id)) set.delete(id)
  else set.add(id)
  const next = [...set]
  saveFavoriteFitIds(next)
  return next
}
