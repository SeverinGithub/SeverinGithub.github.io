import { useSyncExternalStore } from 'react'

const KEY = 'minijob-tracker-v1'

const defaultState = {
  entries: [],
  settings: {
    name: 'Severin Schwarz',
    hourlyRate: 14.6,
    minijobLimit: 556,
    templateFilename: 'Stundenliste_{MM}.{JJ}_LunaticNet_S-Schwarz.xlsx',
  },
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(defaultState)
    const parsed = JSON.parse(raw)
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
    }
  } catch {
    return structuredClone(defaultState)
  }
}

let state = load()
const listeners = new Set()

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state))
}
function emit() {
  for (const l of listeners) l()
}
function set(next) {
  state = next
  persist()
  emit()
}

export function getState() { return state }
export function subscribe(l) { listeners.add(l); return () => listeners.delete(l) }
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// Entry shape:
// { id, date: 'YYYY-MM-DD', mode: 'range'|'duration', start?: number, end?: number, pause: number, hours: number, description: string }

export function addEntry(entry) {
  const e = { ...entry, id: newId() }
  set({ ...state, entries: [...state.entries, e] })
  return e
}

export function updateEntry(id, patch) {
  set({
    ...state,
    entries: state.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  })
}

export function deleteEntry(id) {
  set({ ...state, entries: state.entries.filter((e) => e.id !== id) })
}

export function updateSettings(patch) {
  set({ ...state, settings: { ...state.settings, ...patch } })
}

export function replaceAll(next) {
  const clean = {
    entries: Array.isArray(next.entries) ? next.entries : [],
    settings: { ...defaultState.settings, ...(next.settings || {}) },
  }
  set(clean)
}

export function exportJson() {
  return JSON.stringify(state, null, 2)
}
