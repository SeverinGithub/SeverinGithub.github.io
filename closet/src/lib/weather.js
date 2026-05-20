const FALLBACK = { lat: 52.52, lon: 13.41, placeName: 'Berlin' }

function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ...FALLBACK, usedFallback: true })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          usedFallback: false,
        }),
      () => resolve({ ...FALLBACK, usedFallback: true }),
      { timeout: 8000, maximumAge: 300_000 },
    )
  })
}

async function fetchTemperature(lat, lon) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', 'temperature_2m')
  url.searchParams.set('timezone', 'auto')
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const temp = data?.current?.temperature_2m
  return typeof temp === 'number' ? Math.round(temp) : null
}

async function fetchPlaceName(lat, lon) {
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse')
    url.searchParams.set('latitude', String(lat))
    url.searchParams.set('longitude', String(lon))
    url.searchParams.set('language', 'de')
    url.searchParams.set('count', '1')
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const place = data?.results?.[0]
    if (!place) return null
    return place.name || place.admin1 || null
  } catch {
    return null
  }
}

/**
 * @param {{ useLocation?: boolean }} [options]
 * @returns {Promise<{ lat: number, lon: number, temp: number | null, placeName: string, usedFallback: boolean }>}
 */
export async function fetchWeatherContext({ useLocation = true } = {}) {
  try {
    const pos = useLocation ? await getPosition() : { ...FALLBACK, usedFallback: true }
    const [temp, placeName] = await Promise.all([
      fetchTemperature(pos.lat, pos.lon),
      fetchPlaceName(pos.lat, pos.lon),
    ])
    return {
      lat: pos.lat,
      lon: pos.lon,
      temp,
      placeName: placeName ?? FALLBACK.placeName,
      usedFallback: pos.usedFallback ?? !useLocation,
    }
  } catch {
    return { ...FALLBACK, temp: null, usedFallback: true }
  }
}

/**
 * @param {{ useLocation?: boolean }} [options]
 * @returns {Promise<number | null>} Current temperature in °C, rounded
 */
export async function fetchCurrentTemperature({ useLocation = true } = {}) {
  const ctx = await fetchWeatherContext({ useLocation })
  return ctx.temp
}
