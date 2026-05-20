import {
  STYLE_DIRECTION_ALIASES,
  STYLE_DIRECTION_TAG_CATALOG,
  detectDirectionFromKeys,
  getSubTagKeysForDirection,
} from './styleDirections.js'

/** Canonical tag keys → German labels for display & fit scoring */
export const TAG_CATALOG = {
  ...STYLE_DIRECTION_TAG_CATALOG,
  // Farben
  'color:black': { label: 'Schwarz', group: 'color' },
  'color:white': { label: 'Weiß', group: 'color' },
  'color:gray': { label: 'Grau', group: 'color' },
  'color:beige': { label: 'Beige', group: 'color' },
  'color:brown': { label: 'Braun', group: 'color' },
  'color:blue': { label: 'Blau', group: 'color' },
  'color:navy': { label: 'Navy', group: 'color' },
  'color:green': { label: 'Grün', group: 'color' },
  'color:red': { label: 'Rot', group: 'color' },
  'color:orange': { label: 'Orange', group: 'color' },
  'color:yellow': { label: 'Gelb', group: 'color' },
  'color:pink': { label: 'Rosa', group: 'color' },
  'color:purple': { label: 'Lila', group: 'color' },
  // Stil
  'style:casual': { label: 'Casual', group: 'style' },
  'style:street': { label: 'Streetwear', group: 'style' },
  'style:formal': { label: 'Formal', group: 'style' },
  'style:sport': { label: 'Sport', group: 'style' },
  'style:minimal': { label: 'Minimal', group: 'style' },
  'style:vintage': { label: 'Vintage', group: 'style' },
  'semantic:outdoor': { label: 'Outdoor', group: 'semantic' },
  'semantic:neon': { label: 'Neon / Knallig', group: 'semantic' },
  'semantic:party': { label: 'Party', group: 'semantic' },
  // Passform / Schnitt
  'fit:baggy': { label: 'Baggy', group: 'fit' },
  'fit:slim': { label: 'Slim', group: 'fit' },
  'fit:oversized': { label: 'Oversized', group: 'fit' },
  'fit:regular': { label: 'Regular', group: 'fit' },
  // Material
  'material:denim': { label: 'Denim', group: 'material' },
  'material:cotton': { label: 'Baumwolle', group: 'material' },
  'material:leather': { label: 'Leder', group: 'material' },
  'material:wool': { label: 'Wolle', group: 'material' },
  'material:linen': { label: 'Leinen', group: 'material' },
  'material:knit': { label: 'Strick', group: 'material' },
  // Typ (kategorie-nah)
  'type:jeans': { label: 'Jeans', group: 'type' },
  'type:hoodie': { label: 'Hoodie', group: 'type' },
  'type:tshirt': { label: 'T-Shirt', group: 'type' },
  'type:shirt': { label: 'Hemd', group: 'type' },
  'type:polo': { label: 'Polo', group: 'type' },
  'type:shorts': { label: 'Shorts', group: 'type' },
  'type:chino': { label: 'Chino', group: 'type' },
  'type:sneaker': { label: 'Sneaker', group: 'type' },
  'type:boots': { label: 'Stiefel', group: 'type' },
  'type:jacket': { label: 'Jacke', group: 'type' },
  'type:coat': { label: 'Mantel', group: 'type' },
}

/** Aliase (lowercase) → canonical key */
const TAG_ALIASES = {
  ...STYLE_DIRECTION_ALIASES,
  schwarz: 'color:black',
  black: 'color:black',
  weiß: 'color:white',
  weiss: 'color:white',
  white: 'color:white',
  grau: 'color:gray',
  grey: 'color:gray',
  gray: 'color:gray',
  beige: 'color:beige',
  braun: 'color:brown',
  brown: 'color:brown',
  blau: 'color:blue',
  blue: 'color:blue',
  navy: 'color:navy',
  dunkelblau: 'color:navy',
  grün: 'color:green',
  gruen: 'color:green',
  green: 'color:green',
  rot: 'color:red',
  red: 'color:red',
  orange: 'color:orange',
  gelb: 'color:yellow',
  yellow: 'color:yellow',
  wander: 'semantic:outdoor',
  outdoor: 'semantic:outdoor',
  trekking: 'semantic:outdoor',
  regenjacke: 'semantic:outdoor',
  neon: 'semantic:neon',
  knall: 'semantic:neon',
  party: 'semantic:party',
  rosa: 'color:pink',
  pink: 'color:pink',
  lila: 'color:purple',
  purple: 'color:purple',
  violett: 'color:purple',
  casual: 'style:casual',
  street: 'style:street',
  streetwear: 'style:street',
  formal: 'style:formal',
  elegant: 'style:formal',
  sport: 'style:sport',
  sporty: 'style:sport',
  sportlich: 'style:sport',
  arbeit: 'style:formal',
  work: 'style:formal',
  büro: 'style:formal',
  buero: 'style:formal',
  office: 'style:formal',
  date: 'style:minimal',
  dating: 'style:minimal',
  modisch: 'dir:fashion',
  fashion: 'dir:fashion',
  minimal: 'style:minimal',
  minimalistisch: 'style:minimal',
  vintage: 'style:vintage',
  baggy: 'fit:baggy',
  weit: 'fit:baggy',
  slim: 'fit:slim',
  eng: 'fit:slim',
  skinny: 'fit:slim',
  oversized: 'fit:oversized',
  loose: 'fit:oversized',
  regular: 'fit:regular',
  normal: 'fit:regular',
  denim: 'material:denim',
  jeans: 'type:jeans',
  baumwolle: 'material:cotton',
  cotton: 'material:cotton',
  leder: 'material:leather',
  leather: 'material:leather',
  wolle: 'material:wool',
  wool: 'material:wool',
  leinen: 'material:linen',
  linen: 'material:linen',
  strick: 'material:knit',
  knit: 'material:knit',
  hoodie: 'type:hoodie',
  't-shirt': 'type:tshirt',
  tshirt: 'type:tshirt',
  shirt: 'type:shirt',
  hemd: 'type:shirt',
  polo: 'type:polo',
  shorts: 'type:shorts',
  kurze: 'type:shorts',
  chino: 'type:chino',
  sneaker: 'type:sneaker',
  sneakers: 'type:sneaker',
  stiefel: 'type:boots',
  boots: 'type:boots',
  jacke: 'type:jacket',
  jacket: 'type:jacket',
  mantel: 'type:coat',
  coat: 'type:coat',
  hose: 'type:chino',
  hosen: 'type:chino',
}

const STYLE_CONFLICTS = [
  ['dir:sport', 'dir:business'],
  ['dir:business', 'dir:streetwear'],
  ['dir:sport', 'dir:minimal'],
  ['dir:sport', 'dir:fashion'],
  ['style:formal', 'style:sport'],
  ['style:formal', 'style:street'],
  ['style:formal', 'fit:baggy'],
  ['style:formal', 'fit:oversized'],
  ['style:formal', 'type:hoodie'],
  ['style:formal', 'type:shorts'],
  ['style:formal', 'type:sneaker'],
  ['style:minimal', 'style:street'],
  ['style:minimal', 'fit:baggy'],
  ['style:sport', 'type:shirt'],
  ['style:sport', 'type:polo'],
  ['vibe:office', 'vibe:gym'],
  ['vibe:professional', 'vibe:activewear'],
]

const COLOR_SUGGESTIONS = ['color:black', 'color:white', 'color:gray', 'color:blue', 'color:beige', 'color:navy']

const CATEGORY_SUGGESTIONS = {
  tops: ['type:tshirt', 'type:hoodie', 'type:shirt', 'type:polo', 'fit:oversized', 'material:cotton', 'material:knit'],
  pants: ['type:jeans', 'type:chino', 'type:shorts', 'fit:baggy', 'fit:slim', 'material:denim'],
  shoes: ['type:sneaker', 'type:boots', 'style:sport', 'style:street'],
  jackets: [
    'type:jacket',
    'type:coat',
    'material:wool',
    'material:leather',
    'color:navy',
    'color:black',
    'color:gray',
    'style:minimal',
    'style:casual',
  ],
  accessories: ['style:minimal', 'style:street'],
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Pro Gruppe nur ein Tag (z. B. eine Farbe, eine Richtung). */
const EXCLUSIVE_TAG_GROUPS = new Set(['color', 'type', 'fit', 'style', 'material', 'direction', 'vibe', 'semantic'])

const LEGACY_DIRECTION_KEYS = new Set(['dir:trendy', 'dir:party', 'dir:home'])

/** @param {unknown} tagKeys */
export function coerceTagKeys(tagKeys) {
  if (Array.isArray(tagKeys)) {
    return tagKeys.filter((k) => typeof k === 'string' && k.length > 0)
  }
  if (typeof tagKeys === 'string' && tagKeys.length > 0) {
    return [tagKeys]
  }
  return []
}

/** @param {unknown} rawTags */
export function coerceRawTags(rawTags) {
  if (rawTags == null) return []
  if (Array.isArray(rawTags)) {
    return rawTags
      .map((raw) => {
        if (typeof raw === 'string') return raw
        if (raw && typeof raw === 'object') {
          if (typeof raw.label === 'string') return raw.label
          if (typeof raw.key === 'string') return tagKeyToLabel(raw.key)
        }
        return ''
      })
      .filter(Boolean)
  }
  if (typeof rawTags === 'string') {
    return rawTags
      .split(/[,;]+/)
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return []
}

export function getTagGroup(key) {
  if (typeof key !== 'string' || !key) return null
  if (key.startsWith('dir:') || LEGACY_DIRECTION_KEYS.has(key)) return 'direction'
  if (key.startsWith('free:')) return null
  return TAG_CATALOG[key]?.group ?? null
}

function isDirectionKey(key) {
  return typeof key === 'string' && (key.startsWith('dir:') || LEGACY_DIRECTION_KEYS.has(key))
}

/** Ersetzt andere Tags derselben exklusiven Gruppe (z. B. Schwarz → Weiß). */
export function applyExclusiveTagKeys(keys, newKey) {
  const group = getTagGroup(newKey)
  if (!group || !EXCLUSIVE_TAG_GROUPS.has(group)) {
    return [...keys.filter((k) => k !== newKey), newKey]
  }

  const filtered = keys.filter((k) => {
    if (k === newKey) return false
    if (group === 'direction') return !isDirectionKey(k) && getTagGroup(k) !== 'direction'
    return getTagGroup(k) !== group
  })
  return [...filtered, newKey]
}

export function normalizeTag(raw) {
  if (raw == null) return null
  const trimmed = String(raw).trim().replace(/\s+/g, ' ')
  if (!trimmed) return null
  const lookup = trimmed.toLowerCase()
  const key = TAG_ALIASES[lookup] ?? (TAG_CATALOG[lookup] ? lookup : null)
  if (key && TAG_CATALOG[key]) {
    return { key, label: TAG_CATALOG[key].label }
  }
  const freeSlug = slugify(trimmed) || `custom-${lookup.replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`
  return { key: `free:${freeSlug}`, label: trimmed.charAt(0).toUpperCase() + trimmed.slice(1) }
}

/** @returns {{ tags: string[], tagKeys: string[] }} */
export function normalizeTags(rawTags) {
  const raws = coerceRawTags(rawTags)
  const labelByKey = new Map()
  let keys = []

  for (const raw of raws) {
    const entry = normalizeTag(raw)
    if (!entry) continue
    keys = applyExclusiveTagKeys(keys, entry.key)
    labelByKey.set(entry.key, entry.label)
    const keySet = new Set(keys)
    for (const k of [...labelByKey.keys()]) {
      if (!keySet.has(k)) labelByKey.delete(k)
    }
  }

  const tagKeys = [...new Set(keys)]
  const tags = tagKeys.map((k) => labelByKey.get(k) ?? tagKeyToLabel(k))
  return { tags, tagKeys }
}

export function getItemTagKeys(item) {
  const stored = coerceTagKeys(item?.tagKeys)
  if (stored.length) return stored
  return normalizeTags(item?.tags).tagKeys
}

export function tagKeyToLabel(key) {
  if (typeof key !== 'string') return ''
  if (key.startsWith('free:')) {
    const slug = key.slice(5)
    if (!slug) return 'Eigenes Tag'
    return slug
      .split('-')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }
  return TAG_CATALOG[key]?.label ?? key
}

export function tagsFromKeys(keys) {
  return normalizeTags(keys.map((k) => tagKeyToLabel(k))).tags
}

/** Unter-Tags für gewählte Stil-Richtung (dynamisch nach Kategorie) */
export function getStyleSubTagSuggestions(directionId, selectedTagKeys = [], categoryId = null) {
  if (!directionId) return []
  const selected = new Set(coerceTagKeys(selectedTagKeys))
  return getSubTagKeysForDirection(directionId, categoryId)
    .filter((key) => TAG_CATALOG[key] && !selected.has(key))
    .slice(0, 14)
    .map((key) => ({ key, label: TAG_CATALOG[key].label }))
}

/** Farben & Typ (ohne Stil – Stil läuft über Richtungen) */
export function getTagSuggestions(categoryId, selectedTagKeys = [], { directionId } = {}) {
  const selected = new Set(coerceTagKeys(selectedTagKeys))
  const styleGroups = new Set(['style', 'direction', 'vibe'])
  const keys = [
    ...COLOR_SUGGESTIONS,
    ...(CATEGORY_SUGGESTIONS[categoryId] ?? []).filter((k) => {
      const g = TAG_CATALOG[k]?.group
      return g && !styleGroups.has(g)
    }),
  ]
  return keys
    .filter((key) => TAG_CATALOG[key] && !selected.has(key))
    .map((key) => ({ key, label: TAG_CATALOG[key].label }))
}

export { detectDirectionFromKeys }

export function tagsConflict(keysA, keysB) {
  const a = coerceTagKeys(keysA)
  const b = coerceTagKeys(keysB)
  for (const [x, y] of STYLE_CONFLICTS) {
    const hasA = a.includes(x) || b.includes(x)
    const hasB = a.includes(y) || b.includes(y)
    if (hasA && hasB) return true
  }
  return false
}

export function sharedTagKeys(keysA, keysB) {
  const setB = new Set(coerceTagKeys(keysB))
  return coerceTagKeys(keysA).filter((k) => setB.has(k) && !k.startsWith('free:'))
}

const SEMANTIC_PATTERNS = [
  { key: 'semantic:outdoor', pattern: /wander|outdoor|trek|regen|ski|berg|camping|hiking|gore/i },
  { key: 'semantic:neon', pattern: /neon|knall|bunt|fluo|leucht/i },
  { key: 'semantic:party', pattern: /party|fest|glitzer/i },
]

function inferSemanticKeys(item) {
  const inferred = []
  const tagLabels = coerceRawTags(item?.tags)
  const keyLabels = coerceTagKeys(item?.tagKeys).map((k) => tagKeyToLabel(k))
  const text = [...tagLabels, ...keyLabels].join(' ')
  for (const { key, pattern } of SEMANTIC_PATTERNS) {
    if (pattern.test(text)) inferred.push(key)
  }
  return inferred
}

/** Alle Tag-Keys inkl. Semantik (für Fits) */
export function getAllItemKeys(item) {
  const base = getItemTagKeys(item)
  const semantic = inferSemanticKeys(item)
  return [...new Set([...base, ...semantic])]
}
