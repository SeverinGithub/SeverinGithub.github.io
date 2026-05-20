/**
 * Outfit-Zusammenstellung auf den 6 Stil-Richtungen (dir:* + vibe:*).
 */
import {
  STANDARD_STYLE_DIRECTIONS,
  detectDirectionFromKeys,
  getDirectionById,
  getDirectionFamilyKeys,
  resolveDirectionId,
} from './styleDirections.js'
import { getAllItemKeys } from './tags.js'

/** Fits-Aktivität / Anlass → Ziel-Richtung */
export const ACTIVITY_TO_STYLE_DIRECTION = {
  sport: 'sport',
  gym: 'sport',
  running: 'sport',
  bike: 'sport',
  hiking: 'sport',
  outdoor: 'sport',
  rain: 'sport',
  work: 'business',
  office: 'business',
  meeting: 'business',
  interview: 'business',
  wedding: 'business',
  dinner: 'business',
  restaurant: 'business',
  casual: 'casual',
  school: 'casual',
  university: 'casual',
  shopping: 'casual',
  travel: 'casual',
  vacation: 'casual',
  airport: 'casual',
  home: 'casual',
  gaming: 'casual',
  chill: 'casual',
  brunch: 'casual',
  coffee: 'casual',
  walk: 'casual',
  family: 'casual',
  beach: 'casual',
  hot: 'casual',
  date: 'minimal',
  museum: 'minimal',
  city: 'streetwear',
  party: 'fashion',
  club: 'fashion',
  festival: 'fashion',
  concert: 'fashion',
  photoshoot: 'fashion',
  fashion: 'fashion',
  cold: 'minimal',
}

/** Richtungen die nicht in einem Outfit gemischt werden sollten */
const DIRECTION_CONFLICTS = new Set(
  [
    ['sport', 'business'],
    ['sport', 'minimal'],
    ['sport', 'fashion'],
    ['business', 'streetwear'],
    ['business', 'sport'],
    ['minimal', 'streetwear'],
    ['minimal', 'sport'],
  ].map(([a, b]) => `${a}|${b}`),
)

const LEGACY_DIR_KEYS = ['dir:trendy', 'dir:party', 'dir:home']

export function getTargetStyleDirection(activityId) {
  return ACTIVITY_TO_STYLE_DIRECTION[activityId] ?? 'casual'
}

export function getStyleDirectionLabel(directionId) {
  return getDirectionById(directionId)?.label ?? directionId
}

export function directionsConflict(dirA, dirB) {
  if (!dirA || !dirB || dirA === dirB) return false
  return DIRECTION_CONFLICTS.has(`${dirA}|${dirB}`) || DIRECTION_CONFLICTS.has(`${dirB}|${dirA}`)
}

export function getItemStyleDirection(item) {
  const keys = getAllItemKeys(item)
  return detectDirectionFromKeys(keys)
}

function hasDirectionMarker(keys) {
  return keys.some(
    (k) =>
      k.startsWith('dir:') ||
      LEGACY_DIR_KEYS.includes(k) ||
      k.startsWith('style:') ||
      k.startsWith('vibe:'),
  )
}

/** Passt ein Teil zur Ziel-Richtung (oder ist stil-neutral)? */
export function itemMatchesTargetDirection(item, targetDirectionId) {
  const target = resolveDirectionId(targetDirectionId) ?? targetDirectionId
  const keys = getAllItemKeys(item)
  const itemDir = getItemStyleDirection(item)
  const family = new Set(getDirectionFamilyKeys(target))

  if (itemDir) {
    if (itemDir === target) return true
    if (directionsConflict(itemDir, target)) return false
    return keys.some((k) => family.has(k))
  }

  if (keys.includes(`dir:${target}`) || keys.some((k) => family.has(k))) return true

  if (!hasDirectionMarker(keys)) return true

  return false
}

/** Harte Avoid-Keys pro Ziel-Richtung */
export function getDirectionHardAvoid(targetDirectionId) {
  const t = resolveDirectionId(targetDirectionId) ?? targetDirectionId
  const avoid = {
    sport: ['style:formal', 'type:coat', 'type:shirt', 'type:polo', 'material:leather', 'vibe:office'],
    casual: ['style:formal'],
    business: [
      'dir:sport',
      'style:sport',
      'style:street',
      'type:hoodie',
      'type:shorts',
      'type:sneaker',
      'fit:baggy',
      'fit:oversized',
      'semantic:party',
      'semantic:neon',
    ],
    streetwear: ['style:formal', 'style:sport', 'type:polo', 'type:shirt', 'vibe:office'],
    minimal: ['style:sport', 'style:street', 'fit:baggy', 'fit:oversized', 'type:hoodie', 'semantic:neon'],
    fashion: ['style:formal', 'style:sport', 'semantic:outdoor'],
  }
  return new Set(avoid[t] ?? [])
}

export function getExpandedPreferForDirection(targetDirectionId) {
  const t = resolveDirectionId(targetDirectionId) ?? targetDirectionId
  const dir = getDirectionById(t)
  if (!dir) return getDirectionFamilyKeys('casual')
  return getDirectionFamilyKeys(t)
}

/**
 * Kern-Score: wie gut passen alle Teile zur Ziel-Richtung?
 */
export function scoreDirectionCohesion(parts, targetDirectionId) {
  const target = resolveDirectionId(targetDirectionId) ?? targetDirectionId
  const family = new Set(getDirectionFamilyKeys(target))
  let score = 0
  let coreHits = 0
  let familyHits = 0
  let neutral = 0
  let wrongDir = 0

  for (const part of parts) {
    const keys = getAllItemKeys(part)
    const itemDir = getItemStyleDirection(item)

    if (keys.includes(`dir:${target}`) || itemDir === target) {
      score += 24
      coreHits += 1
    } else if (keys.some((k) => family.has(k))) {
      score += 16
      familyHits += 1
    } else if (!itemDir && !hasDirectionMarker(keys)) {
      score += 5
      neutral += 1
    } else if (itemDir && directionsConflict(itemDir, target)) {
      score -= 28
      wrongDir += 1
    } else if (itemDir && itemDir !== target) {
      score -= 12
      wrongDir += 1
    }
  }

  if (coreHits >= 2) score += 22
  else if (coreHits + familyHits >= 2) score += 14
  if (wrongDir === 0 && coreHits + familyHits >= parts.length - 1) score += 10
  if (wrongDir >= 2) score -= 20

  const dirsInOutfit = parts.map((p) => getItemStyleDirection(p)).filter(Boolean)
  const uniqueDirs = [...new Set(dirsInOutfit)]
  if (uniqueDirs.length === 1 && uniqueDirs[0] === target) score += 18
  if (uniqueDirs.some((d) => directionsConflict(d, target))) score -= 35

  return score
}

export function getDirectionViolations(parts, targetDirectionId) {
  const target = resolveDirectionId(targetDirectionId) ?? targetDirectionId
  const hardAvoid = getDirectionHardAvoid(target)
  const violations = []

  for (const part of parts) {
    const keys = getAllItemKeys(part)
    const itemDir = getItemStyleDirection(part)
    for (const key of keys) {
      if (hardAvoid.has(key)) {
        violations.push(`Unpassend für ${getStyleDirectionLabel(target)} (${key})`)
      }
    }
    if (itemDir && directionsConflict(itemDir, target)) {
      violations.push(
        `${getStyleDirectionLabel(itemDir)} passt nicht zu ${getStyleDirectionLabel(target)}`,
      )
    }
  }

  return [...new Set(violations)]
}
