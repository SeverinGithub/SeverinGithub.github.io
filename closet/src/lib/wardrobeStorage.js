import { normalizeTags } from './tags.js'
import { STORAGE_KEY } from '../types/clothing.js'

const DB_NAME = 'closet-wardrobe-db'
const DB_VERSION = 1
const STORE_NAME = 'wardrobe'
const IDB_KEY = 'items'

const WRAPPER_KEYS = ['items', 'wardrobe', 'data', 'clothes', 'kleidung', 'schrank']

function extractItemList(raw) {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== 'object') return null

  for (const key of WRAPPER_KEYS) {
    if (Array.isArray(raw[key])) return raw[key]
  }

  const firstArray = Object.values(raw).find((v) => Array.isArray(v))
  return firstArray ?? null
}

function normalizeItem(item, fallbackIndex = 0) {
  if (!item || typeof item !== 'object') return null

  const imageDataUrl =
    item.imageDataUrl ?? item.image ?? item.photo ?? item.imageUrl ?? item.bild
  if (!imageDataUrl || typeof imageDataUrl !== 'string') return null

  const category = item.category ?? item.cat ?? item.type
  if (!category || typeof category !== 'string') return null

  let tagSource = item.tags
  if (!Array.isArray(tagSource) && Array.isArray(item.tagKeys)) {
    tagSource = item.tagKeys
  }
  const { tags, tagKeys } = normalizeTags(Array.isArray(tagSource) ? tagSource : [])

  let seasons = item.seasons ?? item.season ?? item.jahreszeit
  if (!Array.isArray(seasons)) {
    seasons = seasons ? [seasons] : ['allYear']
  }
  if (!seasons.length) seasons = ['allYear']

  const now = new Date().toISOString()
  return {
    ...item,
    id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
    displayNumber:
      typeof item.displayNumber === 'number' ? item.displayNumber : fallbackIndex + 1,
    imageDataUrl,
    category,
    tags,
    tagKeys,
    seasons,
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? now,
  }
}

export function normalizeWardrobeArray(raw) {
  const list = extractItemList(raw)
  if (!Array.isArray(list)) return []
  return list.map((item, index) => normalizeItem(item, index)).filter(Boolean)
}

export function parseWardrobeImportFile(text) {
  const trimmed = text.trim()
  if (!trimmed) return { items: [], skipped: 0, total: 0 }

  let parsed
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error('Datei ist kein gültiges JSON.')
  }

  const list = extractItemList(parsed)
  const total = Array.isArray(list) ? list.length : 0
  const items = normalizeWardrobeArray(parsed)
  return { items, skipped: total - items.length, total }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB nicht verfügbar'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

function idbGet(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(IDB_KEY)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result ?? null)
  })
}

function idbPut(db, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(value, IDB_KEY)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return normalizeWardrobeArray(JSON.parse(raw))
  } catch {
    return []
  }
}

function saveToLocalStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

/**
 * Lädt Items: zuerst IndexedDB, sonst Migration aus localStorage.
 */
export async function loadWardrobeItems() {
  try {
    const db = await openDatabase()
    const stored = await idbGet(db)
    db.close()
    if (Array.isArray(stored) && stored.length > 0) {
      return normalizeWardrobeArray(stored)
    }
  } catch (err) {
    console.warn('IndexedDB load', err)
  }

  const legacy = loadFromLocalStorage()
  if (legacy.length > 0) {
    await saveWardrobeItems(legacy)
  }
  return legacy
}

/**
 * Speichert in IndexedDB (Haupt) + localStorage (Backup, falls Platz).
 */
export async function saveWardrobeItems(items) {
  const normalized = normalizeWardrobeArray(items)

  try {
    const db = await openDatabase()
    await idbPut(db, normalized)
    db.close()
  } catch (err) {
    console.warn('IndexedDB save', err)
  }

  saveToLocalStorage(normalized)
}

/** Importierte Teile anhängen; bei ID-Kollision neue ID + Nummer. */
export function mergeWardrobeItems(existing, imported) {
  const usedIds = new Set(existing.map((i) => i.id))
  const merged = [...existing]
  let nextNum =
    merged.length > 0 ? Math.max(...merged.map((i) => i.displayNumber)) + 1 : 1

  for (const item of imported) {
    let entry = { ...item }
    if (usedIds.has(entry.id)) {
      entry.id = crypto.randomUUID()
      entry.displayNumber = nextNum++
    } else {
      usedIds.add(entry.id)
    }
    merged.push(entry)
  }

  return merged
}

export async function clearWardrobeStorage() {
  await saveWardrobeItems([])
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
