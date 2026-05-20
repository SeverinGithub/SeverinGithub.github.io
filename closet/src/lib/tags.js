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

export function normalizeTag(raw) {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return null
  const lookup = trimmed.toLowerCase()
  const key = TAG_ALIASES[lookup] ?? (TAG_CATALOG[lookup] ? lookup : null)
  if (key && TAG_CATALOG[key]) {
    return { key, label: TAG_CATALOG[key].label }
  }
  const freeSlug = slugify(trimmed)
  return { key: `free:${freeSlug}`, label: trimmed.charAt(0).toUpperCase() + trimmed.slice(1) }
}

/** @returns {{ tags: string[], tagKeys: string[] }} */
export function normalizeTags(rawTags) {
  const tags = []
  const tagKeys = []
  const seen = new Set()

  for (const raw of rawTags) {
    const entry = normalizeTag(typeof raw === 'string' ? raw : raw?.label ?? '')
    if (!entry || seen.has(entry.key)) continue
    seen.add(entry.key)
    tagKeys.push(entry.key)
    tags.push(entry.label)
  }

  return { tags, tagKeys }
}

export function getItemTagKeys(item) {
  if (Array.isArray(item.tagKeys) && item.tagKeys.length) return item.tagKeys
  return normalizeTags(item.tags ?? []).tagKeys
}

export function tagKeyToLabel(key) {
  return TAG_CATALOG[key]?.label ?? key
}

export function tagsFromKeys(keys) {
  return normalizeTags(keys.map((k) => tagKeyToLabel(k))).tags
}

/** Unter-Tags für gewählte Stil-Richtung (dynamisch nach Kategorie) */
export function getStyleSubTagSuggestions(directionId, selectedTagKeys = [], categoryId = null) {
  if (!directionId) return []
  const selected = new Set(selectedTagKeys)
  return getSubTagKeysForDirection(directionId, categoryId)
    .filter((key) => TAG_CATALOG[key] && !selected.has(key))
    .slice(0, 14)
    .map((key) => ({ key, label: TAG_CATALOG[key].label }))
}

/** Farben & Typ (ohne Stil – Stil läuft über Richtungen) */
export function getTagSuggestions(categoryId, selectedTagKeys = [], { directionId } = {}) {
  const selected = new Set(selectedTagKeys)
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
  for (const [a, b] of STYLE_CONFLICTS) {
    const hasA = keysA.includes(a) || keysB.includes(a)
    const hasB = keysA.includes(b) || keysB.includes(b)
    if (hasA && hasB) return true
  }
  return false
}

export function sharedTagKeys(keysA, keysB) {
  const setB = new Set(keysB)
  return keysA.filter((k) => setB.has(k) && !k.startsWith('free:'))
}

const SEMANTIC_PATTERNS = [
  { key: 'semantic:outdoor', pattern: /wander|outdoor|trek|regen|ski|berg|camping|hiking|gore/i },
  { key: 'semantic:neon', pattern: /neon|knall|bunt|fluo|leucht/i },
  { key: 'semantic:party', pattern: /party|fest|glitzer/i },
]

function inferSemanticKeys(item) {
  const inferred = []
  const labels = [...(item.tags ?? []), ...(item.tagKeys ?? [])]
  const text = labels.join(' ')
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
