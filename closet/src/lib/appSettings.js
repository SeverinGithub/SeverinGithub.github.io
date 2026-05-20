export const SETTINGS_STORAGE_KEY = 'closet-app-settings-v1'

export const THEME_COLORS = [
  { id: 'orange', label: 'Orange', swatch: '#ff7a00' },
  { id: 'blue', label: 'Blau', swatch: '#3b82f6' },
  { id: 'purple', label: 'Lila', swatch: '#8b5cf6' },
  { id: 'green', label: 'Grün', swatch: '#22c55e' },
  { id: 'pink', label: 'Pink', swatch: '#ec4899' },
]

export const COLOR_MODES = [
  { id: 'light', label: 'Tag' },
  { id: 'dark', label: 'Nacht' },
  { id: 'system', label: 'System' },
]

import { DEFAULT_FITS_TAB_IDS, normalizeFitsTabCategories } from './fitsCategories.js'

export const DEFAULT_SETTINGS = {
  themeColor: 'orange',
  colorMode: 'light',
  useLocationForWeather: true,
  showMatchScores: true,
  reducedMotion: false,
  fitsTabCategories: [...DEFAULT_FITS_TAB_IDS],
}

const PALETTES = {
  orange: {
    primary: '#ff7a00',
    primarySoft: '#ffe8d4',
    primaryDark: '#e56a00',
    bgLight: '#fff9f5',
    blobA: '#ffb347',
    blobB: '#ffd4b8',
    blobC: '#ff9f5a',
  },
  blue: {
    primary: '#3b82f6',
    primarySoft: '#dbeafe',
    primaryDark: '#2563eb',
    bgLight: '#f0f7ff',
    blobA: '#93c5fd',
    blobB: '#bfdbfe',
    blobC: '#60a5fa',
  },
  purple: {
    primary: '#8b5cf6',
    primarySoft: '#ede9fe',
    primaryDark: '#7c3aed',
    bgLight: '#f5f3ff',
    blobA: '#c4b5fd',
    blobB: '#ddd6fe',
    blobC: '#a78bfa',
  },
  green: {
    primary: '#22c55e',
    primarySoft: '#dcfce7',
    primaryDark: '#16a34a',
    bgLight: '#f0fdf4',
    blobA: '#86efac',
    blobB: '#bbf7d0',
    blobC: '#4ade80',
  },
  pink: {
    primary: '#ec4899',
    primarySoft: '#fce7f3',
    primaryDark: '#db2777',
    bgLight: '#fdf2f8',
    blobA: '#f9a8d4',
    blobB: '#fbcfe8',
    blobC: '#f472b6',
  },
}

const DARK = {
  bg: '#121218',
  surface: '#1c1c24',
  text: '#f4f4f5',
  textMuted: '#a1a1aa',
  shadowCard: '0 4px 24px rgba(0, 0, 0, 0.35)',
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    const merged = { ...DEFAULT_SETTINGS, ...parsed }
    merged.fitsTabCategories = normalizeFitsTabCategories(merged.fitsTabCategories)
    return merged
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

export function getSystemColorMode() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveColorMode(colorMode) {
  return colorMode === 'system' ? getSystemColorMode() : colorMode
}

export function applySettings(settings) {
  const root = document.documentElement
  const palette = PALETTES[settings.themeColor] ?? PALETTES.orange
  const mode = resolveColorMode(settings.colorMode)
  const { r, g, b } = hexToRgb(palette.primary)

  root.dataset.themeColor = settings.themeColor
  root.dataset.colorMode = mode
  root.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false'

  root.style.setProperty('--primary', palette.primary)
  root.style.setProperty('--primary-soft-tint', palette.primarySoft)
  root.style.setProperty('--primary-soft', mode === 'dark' ? `${palette.primary}22` : palette.primarySoft)
  root.style.setProperty('--primary-dark', palette.primaryDark)
  root.style.setProperty('--blob-a', palette.blobA)
  root.style.setProperty('--blob-b', palette.blobB)
  root.style.setProperty('--blob-c', palette.blobC)
  root.style.setProperty('--shadow', `0 8px 32px rgba(${r}, ${g}, ${b}, 0.1)`)

  if (mode === 'dark') {
    root.style.colorScheme = 'dark'
    root.style.setProperty('--bg', DARK.bg)
    root.style.setProperty('--surface', DARK.surface)
    root.style.setProperty('--text', DARK.text)
    root.style.setProperty('--text-muted', DARK.textMuted)
    root.style.setProperty('--shadow-card', DARK.shadowCard)
  } else {
    root.style.colorScheme = 'light'
    root.style.setProperty('--bg', palette.bgLight)
    root.style.setProperty('--surface', '#ffffff')
    root.style.setProperty('--text', '#1a1a1a')
    root.style.setProperty('--text-muted', '#6b7280')
    root.style.setProperty('--shadow-card', '0 4px 24px rgba(26, 26, 26, 0.06)')
  }

  const body = document.body
  if (body) {
    body.style.background = mode === 'dark' ? DARK.bg : palette.bgLight
    body.style.color = mode === 'dark' ? DARK.text : '#1a1a1a'
  }

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', palette.primary)
}

/** Apply saved settings before React mounts (avoids flash). */
export function initSettings() {
  applySettings(loadSettings())
}
