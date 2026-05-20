import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  applySettings,
  getSystemColorMode,
  loadSettings,
  saveSettings,
} from '../lib/appSettings.js'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(() => loadSettings())
  const [resolvedMode, setResolvedMode] = useState(() =>
    settings.colorMode === 'system' ? getSystemColorMode() : settings.colorMode,
  )

  const setSettings = useCallback((patch) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  useEffect(() => {
    applySettings(settings)
    const mode =
      settings.colorMode === 'system' ? getSystemColorMode() : settings.colorMode
    setResolvedMode(mode)
  }, [settings])

  useEffect(() => {
    if (settings.colorMode !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      applySettings(settings)
      setResolvedMode(getSystemColorMode())
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [settings])

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      resolvedMode,
      isDark: resolvedMode === 'dark',
    }),
    [settings, setSettings, resolvedMode],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export { DEFAULT_SETTINGS }
