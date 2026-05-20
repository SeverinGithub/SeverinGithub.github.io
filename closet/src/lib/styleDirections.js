/**
 * 6 Stil-Richtungen → dynamische Unter-Tags (basis + kategorie-spezifisch).
 */

export const STANDARD_STYLE_DIRECTIONS = [
  { id: 'sport', label: 'Sport', tagKey: 'dir:sport' },
  { id: 'casual', label: 'Casual', tagKey: 'dir:casual' },
  { id: 'business', label: 'Business', tagKey: 'dir:business' },
  { id: 'streetwear', label: 'Streetwear', tagKey: 'dir:streetwear' },
  { id: 'minimal', label: 'Minimal', tagKey: 'dir:minimal' },
  { id: 'fashion', label: 'Fashion', tagKey: 'dir:fashion' },
]

/** Alte Richtungen → neue (bestehende Teile) */
const LEGACY_DIRECTION_KEYS = {
  'dir:trendy': 'fashion',
  'dir:party': 'fashion',
  'dir:home': 'casual',
}

export const STYLE_DIRECTION_TAG_CATALOG = {
  'dir:sport': { label: 'Sport', group: 'direction' },
  'dir:casual': { label: 'Casual', group: 'direction' },
  'dir:business': { label: 'Business', group: 'direction' },
  'dir:streetwear': { label: 'Streetwear', group: 'direction' },
  'dir:minimal': { label: 'Minimal', group: 'direction' },
  'dir:fashion': { label: 'Fashion', group: 'direction' },
  'vibe:smart-casual': { label: 'Smart Casual', group: 'vibe' },
  'vibe:elegant': { label: 'Elegant', group: 'vibe' },
  'vibe:clean': { label: 'Clean', group: 'vibe' },
  'vibe:office': { label: 'Office', group: 'vibe' },
  'vibe:professional': { label: 'Professional', group: 'vibe' },
  'vibe:athletic': { label: 'Athletic', group: 'vibe' },
  'vibe:gym': { label: 'Gym', group: 'vibe' },
  'vibe:running': { label: 'Running', group: 'vibe' },
  'vibe:performance': { label: 'Performance', group: 'vibe' },
  'vibe:breathable': { label: 'Breathable', group: 'vibe' },
  'vibe:activewear': { label: 'Activewear', group: 'vibe' },
  'vibe:comfortable': { label: 'Comfortable', group: 'vibe' },
  'vibe:urban': { label: 'Urban', group: 'vibe' },
  'vibe:relaxed': { label: 'Relaxed', group: 'vibe' },
  'vibe:everyday': { label: 'Everyday', group: 'vibe' },
  'vibe:trendy': { label: 'Trendy', group: 'vibe' },
  'vibe:night-out': { label: 'Night Out', group: 'vibe' },
  'vibe:stylish': { label: 'Stylish', group: 'vibe' },
  'vibe:statement': { label: 'Statement', group: 'vibe' },
  'vibe:darkwear': { label: 'Darkwear', group: 'vibe' },
  'vibe:modern': { label: 'Modern', group: 'vibe' },
  'vibe:fashion-forward': { label: 'Fashion Forward', group: 'vibe' },
  'vibe:cozy': { label: 'Cozy', group: 'vibe' },
  'vibe:lounge': { label: 'Lounge', group: 'vibe' },
  'vibe:soft': { label: 'Soft', group: 'vibe' },
  'vibe:basic': { label: 'Basic', group: 'vibe' },
  'vibe:warm': { label: 'Warm', group: 'vibe' },
  'vibe:versatile': { label: 'Versatile', group: 'vibe' },
  'vibe:layering': { label: 'Layering', group: 'vibe' },
  'vibe:tailored': { label: 'Tailored', group: 'vibe' },
  'vibe:chunky': { label: 'Chunky', group: 'vibe' },
  'vibe:retro': { label: 'Retro', group: 'vibe' },
}

export const STYLE_DIRECTION_ALIASES = {
  business: 'dir:business',
  busniess: 'dir:business',
  sport: 'dir:sport',
  casual: 'dir:casual',
  streetwear: 'dir:streetwear',
  street: 'dir:streetwear',
  minimal: 'dir:minimal',
  minimalistisch: 'dir:minimal',
  fashion: 'dir:fashion',
  modisch: 'dir:fashion',
  trendy: 'dir:fashion',
  party: 'dir:fashion',
  arbeit: 'dir:business',
  freizeit: 'dir:casual',
  zuhause: 'dir:casual',
  home: 'dir:casual',
  'smart casual': 'vibe:smart-casual',
  'smart-casual': 'vibe:smart-casual',
  elegant: 'vibe:elegant',
  clean: 'vibe:clean',
  office: 'vibe:office',
  professional: 'vibe:professional',
  athletic: 'vibe:athletic',
  gym: 'vibe:gym',
  running: 'vibe:running',
  performance: 'vibe:performance',
  breathable: 'vibe:breathable',
  activewear: 'vibe:activewear',
  comfortable: 'vibe:comfortable',
  urban: 'vibe:urban',
  relaxed: 'vibe:relaxed',
  everyday: 'vibe:everyday',
  'night out': 'vibe:night-out',
  stylish: 'vibe:stylish',
  statement: 'vibe:statement',
  darkwear: 'vibe:darkwear',
  modern: 'vibe:modern',
  'fashion forward': 'vibe:fashion-forward',
  cozy: 'vibe:cozy',
  lounge: 'vibe:lounge',
  soft: 'vibe:soft',
  basic: 'vibe:basic',
  warm: 'vibe:warm',
  versatile: 'vibe:versatile',
  layering: 'vibe:layering',
  tailored: 'vibe:tailored',
  chunky: 'vibe:chunky',
  retro: 'vibe:retro',
}

/** Basis-Unter-Tags pro Richtung (immer relevant) */
const STYLE_SUB_TAGS_BASE = {
  sport: ['style:sport', 'vibe:athletic', 'vibe:performance', 'vibe:breathable', 'vibe:comfortable'],
  casual: ['style:casual', 'vibe:relaxed', 'vibe:everyday', 'vibe:versatile', 'vibe:comfortable'],
  business: ['style:formal', 'vibe:professional', 'vibe:office', 'vibe:smart-casual', 'vibe:tailored'],
  streetwear: ['style:street', 'vibe:urban', 'vibe:statement', 'fit:oversized', 'vibe:chunky'],
  minimal: ['style:minimal', 'vibe:clean', 'vibe:basic', 'fit:slim', 'fit:regular'],
  fashion: [
    'vibe:fashion-forward',
    'vibe:stylish',
    'vibe:modern',
    'vibe:trendy',
    'vibe:statement',
    'vibe:night-out',
    'vibe:darkwear',
  ],
}

/** Zusätzliche Tags wenn Kategorie gewählt ist (dynamische Vorschläge) */
const STYLE_SUB_TAGS_BY_CATEGORY = {
  sport: {
    tops: ['type:hoodie', 'type:tshirt', 'vibe:activewear', 'vibe:gym', 'material:cotton', 'material:knit'],
    pants: ['type:shorts', 'vibe:running', 'vibe:gym', 'fit:regular', 'material:cotton'],
    shoes: ['type:sneaker', 'vibe:performance', 'vibe:athletic', 'vibe:breathable'],
    jackets: ['type:jacket', 'vibe:breathable', 'vibe:layering', 'semantic:outdoor'],
    accessories: ['vibe:performance', 'vibe:activewear'],
  },
  casual: {
    tops: ['type:tshirt', 'type:hoodie', 'type:polo', 'fit:regular', 'material:cotton'],
    pants: ['type:jeans', 'type:chino', 'type:shorts', 'fit:regular', 'material:denim'],
    shoes: ['type:sneaker', 'vibe:everyday', 'vibe:comfortable'],
    jackets: ['type:jacket', 'style:casual', 'vibe:layering'],
    accessories: ['vibe:relaxed', 'vibe:versatile'],
  },
  business: {
    tops: ['type:shirt', 'type:polo', 'vibe:elegant', 'vibe:clean', 'fit:slim'],
    pants: ['type:chino', 'fit:slim', 'fit:regular', 'color:navy', 'color:black'],
    shoes: ['type:boots', 'material:leather', 'color:black', 'color:brown'],
    jackets: ['type:jacket', 'type:coat', 'material:wool', 'color:navy'],
    accessories: ['vibe:professional', 'vibe:minimal'],
  },
  streetwear: {
    tops: ['type:hoodie', 'type:tshirt', 'fit:oversized', 'fit:baggy', 'vibe:retro'],
    pants: ['type:jeans', 'fit:baggy', 'material:denim', 'vibe:urban'],
    shoes: ['type:sneaker', 'vibe:statement', 'vibe:chunky'],
    jackets: ['type:jacket', 'fit:oversized', 'style:street'],
    accessories: ['vibe:statement', 'vibe:urban'],
  },
  minimal: {
    tops: ['type:shirt', 'type:tshirt', 'type:polo', 'fit:slim', 'color:white', 'color:black'],
    pants: ['type:chino', 'fit:slim', 'color:black', 'color:gray', 'color:beige'],
    shoes: ['type:sneaker', 'color:white', 'color:black', 'vibe:clean'],
    jackets: ['type:jacket', 'color:black', 'color:gray', 'vibe:clean'],
    accessories: ['vibe:basic', 'color:black'],
  },
  fashion: {
    tops: ['type:hoodie', 'type:shirt', 'fit:oversized', 'fit:slim', 'vibe:darkwear', 'color:black'],
    pants: ['type:jeans', 'fit:baggy', 'fit:slim', 'vibe:night-out', 'color:black'],
    shoes: ['type:sneaker', 'type:boots', 'material:leather', 'vibe:stylish'],
    jackets: ['type:jacket', 'type:coat', 'vibe:layering', 'vibe:statement'],
    accessories: ['vibe:fashion-forward', 'semantic:party', 'vibe:modern'],
  },
}

function uniqueKeys(keys) {
  return [...new Set(keys)]
}

export function resolveDirectionId(idOrLegacyKey) {
  if (LEGACY_DIRECTION_KEYS[idOrLegacyKey]) return LEGACY_DIRECTION_KEYS[idOrLegacyKey]
  if (STANDARD_STYLE_DIRECTIONS.some((d) => d.id === idOrLegacyKey)) return idOrLegacyKey
  return null
}

export function getDirectionById(id) {
  const resolved = resolveDirectionId(id) ?? id
  return STANDARD_STYLE_DIRECTIONS.find((d) => d.id === resolved)
}

export function detectDirectionFromKeys(tagKeys) {
  const keys = Array.isArray(tagKeys)
    ? tagKeys.filter((k) => typeof k === 'string' && k.length > 0)
    : typeof tagKeys === 'string' && tagKeys.length > 0
      ? [tagKeys]
      : []

  for (const key of keys) {
    if (LEGACY_DIRECTION_KEYS[key]) return LEGACY_DIRECTION_KEYS[key]
  }
  for (const dir of STANDARD_STYLE_DIRECTIONS) {
    if (keys.includes(dir.tagKey)) return dir.id
  }
  for (const directionId of Object.keys(STYLE_SUB_TAGS_BASE)) {
    const pool = getSubTagKeysForDirection(directionId)
    if (pool.some((k) => keys.includes(k))) return directionId
  }
  return null
}

/** Dynamisch: Basis + kategorie-spezifische Tags zuerst */
export function getSubTagKeysForDirection(directionId, categoryId = null) {
  const id = resolveDirectionId(directionId) ?? directionId
  const base = STYLE_SUB_TAGS_BASE[id] ?? []
  if (!categoryId) return uniqueKeys(base)
  const extra = STYLE_SUB_TAGS_BY_CATEGORY[id]?.[categoryId] ?? []
  return uniqueKeys([...extra, ...base])
}

export function getDirectionAnchorTag(directionId) {
  const id = resolveDirectionId(directionId) ?? directionId
  const anchors = {
    sport: 'style:sport',
    casual: 'style:casual',
    business: 'style:formal',
    streetwear: 'style:street',
    minimal: 'style:minimal',
    fashion: 'dir:fashion',
  }
  return anchors[id] ?? null
}

export function getDirectionFamilyKeys(directionId) {
  const id = resolveDirectionId(directionId) ?? directionId
  const dir = getDirectionById(id)
  if (!dir) return []
  const allCategories = Object.keys(STYLE_SUB_TAGS_BY_CATEGORY[id] ?? {})
  const fromCategories = allCategories.flatMap((cat) => STYLE_SUB_TAGS_BY_CATEGORY[id][cat] ?? [])
  return uniqueKeys([dir.tagKey, ...STYLE_SUB_TAGS_BASE[id], ...fromCategories])
}

export function itemMatchesDirection(item, directionId) {
  const family = new Set(getDirectionFamilyKeys(directionId))
  const keys = Array.isArray(item?.tagKeys)
    ? item.tagKeys.filter((k) => typeof k === 'string')
    : []
  return keys.some((k) => family.has(k) || LEGACY_DIRECTION_KEYS[k] === directionId)
}
