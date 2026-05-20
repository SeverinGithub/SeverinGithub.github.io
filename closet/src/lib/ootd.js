const OOTD_STORAGE_KEY = 'closet-ootd-v1'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function loadOutfitOfDay() {
  try {
    const raw = localStorage.getItem(OOTD_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data?.date !== todayKey()) return null
    return data
  } catch {
    return null
  }
}

export function saveOutfitOfDay(entry) {
  try {
    localStorage.setItem(
      OOTD_STORAGE_KEY,
      JSON.stringify({ ...entry, date: todayKey(), savedAt: new Date().toISOString() }),
    )
  } catch {
    /* ignore */
  }
}

export function clearOutfitOfDay() {
  try {
    localStorage.removeItem(OOTD_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
