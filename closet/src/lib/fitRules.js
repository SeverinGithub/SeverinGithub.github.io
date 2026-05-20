import { getActivity } from './activities.js'
import {
  getDirectionHardAvoid,
  getDirectionViolations,
  getExpandedPreferForDirection,
  getTargetStyleDirection,
  itemMatchesTargetDirection,
  scoreDirectionCohesion,
} from './fitDirections.js'
import { getAllItemKeys, getItemTagKeys, sharedTagKeys, tagsConflict } from './tags.js'

export { getAllItemKeys } from './tags.js'

/** Sehr auffällige Farben */
export const LOUD_COLORS = new Set([
  'color:yellow',
  'color:orange',
  'color:pink',
  'color:purple',
  'color:red',
])

export const MIN_FIT_SCORE = 38

const LENIENT_STYLE_DIRECTIONS = new Set([
  'sport',
  'casual',
  'streetwear',
  'fashion',
])

export function minFitScoreForActivity(activityId) {
  const dir = getTargetStyleDirection(activityId)
  return LENIENT_STYLE_DIRECTIONS.has(dir) ? 30 : MIN_FIT_SCORE
}

export function isLenientActivity(activityId) {
  return LENIENT_STYLE_DIRECTIONS.has(getTargetStyleDirection(activityId))
}

export function getKeysForParts(parts) {
  return parts.map((p) => getAllItemKeys(p))
}

export function hasKey(keys, key) {
  return keys.includes(key)
}

export function countLoudColors(keysList) {
  let n = 0
  for (const keys of keysList) {
    for (const k of keys) {
      if (LOUD_COLORS.has(k)) n += 1
    }
  }
  return n
}

export function getHardViolations(parts, activityId) {
  const targetDir = getTargetStyleDirection(activityId)
  const activity = getActivity(activityId)
  const violations = [...getDirectionViolations(parts, targetDir)]
  const hardAvoid = getDirectionHardAvoid(targetDir)
  const keysList = getKeysForParts(parts)

  for (const part of parts) {
    for (const key of getAllItemKeys(part)) {
      if (activity.avoid.includes(key) && !hardAvoid.has(key)) {
        violations.push(`${activity.label}: ${key}`)
      }
    }
  }

  if (targetDir === 'business' || activityId === 'date') {
    if (countLoudColors(keysList) >= 2) {
      violations.push('Zu viele grelle Farben')
    }
  }

  if (targetDir === 'business') {
    const pants = parts.find((p) => p.category === 'pants')
    if (pants && hasKey(getAllItemKeys(pants), 'type:shorts')) {
      violations.push('Business: keine Shorts')
    }
  }

  for (let i = 0; i < keysList.length; i++) {
    for (let j = i + 1; j < keysList.length; j++) {
      if (tagsConflict(keysList[i], keysList[j])) {
        violations.push('Stil-Konflikt zwischen Teilen')
      }
    }
  }

  return [...new Set(violations)]
}

export function isValidCombination(parts, activityId) {
  return getHardViolations(parts, activityId).length === 0
}

export function filterPoolForActivity(items, activityId) {
  const targetDir = getTargetStyleDirection(activityId)
  const matched = items.filter((item) => itemMatchesTargetDirection(item, targetDir))
  if (matched.length > 0) return matched
  return items
}

function scoreTagOverlap(parts, targetDirectionId) {
  const prefer = new Set(getExpandedPreferForDirection(targetDirectionId))
  let score = 0

  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const keysA = getAllItemKeys(parts[i])
      const keysB = getAllItemKeys(parts[j])
      const shared = keysA.filter((k) => prefer.has(k) && keysB.includes(k) && !k.startsWith('free:'))
      score += shared.length * 14

      const colorsA = keysA.filter((k) => k.startsWith('color:'))
      const colorsB = keysB.filter((k) => k.startsWith('color:'))
      if (colorsA.length && colorsB.length && colorsA.some((c) => colorsB.includes(c))) {
        score += 12
      }

      const sharedAny = sharedTagKeys(keysA, keysB)
      score += sharedAny.length * 8
    }
  }

  const allStyles = getKeysForParts(parts).flatMap((k) => k.filter((x) => x.startsWith('style:')))
  const styleSet = new Set(allStyles)
  if (styleSet.size === 1) score += 12

  return score
}

function scoreLegacyActivityAvoid(parts, activityId) {
  const activity = getActivity(activityId)
  let penalty = 0
  for (const part of parts) {
    const keys = getAllItemKeys(part)
    for (const key of keys) {
      if (activity.avoid.includes(key)) {
        penalty += isLenientActivity(activityId) ? 8 : 18
      }
    }
  }
  return -penalty
}

export function scoreCombination(parts, season, activityId, { itemMatchesSeason }) {
  const targetDir = getTargetStyleDirection(activityId)
  const keysList = getKeysForParts(parts)
  let score = 30

  for (const part of parts) {
    if (itemMatchesSeason(part, season)) score += 10
  }

  score += scoreDirectionCohesion(parts, targetDir)
  score += scoreTagOverlap(parts, targetDir)
  score += scoreLegacyActivityAvoid(parts, activityId)

  const loud = countLoudColors(keysList)
  if (targetDir === 'business' || targetDir === 'minimal') {
    score -= loud * 35
  } else if (loud >= 3) {
    score -= 12
  }

  const violations = getHardViolations(parts, activityId)
  score -= violations.length * 45

  return Math.round(Math.max(0, Math.min(100, score)))
}
