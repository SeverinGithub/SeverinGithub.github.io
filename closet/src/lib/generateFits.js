import { activityLabel } from './activities.js'
import {
  getStyleDirectionLabel,
  getTargetStyleDirection,
  itemMatchesTargetDirection,
} from './fitDirections.js'
import {
  filterPoolForActivity,
  isValidCombination,
  minFitScoreForActivity,
  scoreCombination,
} from './fitRules.js'
import { getAllItemKeys, tagKeyToLabel } from './tags.js'

const CORE_CATEGORIES = ['tops', 'pants', 'shoes']

export function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function itemMatchesSeason(item, season) {
  const seasons = item.seasons ?? []
  return seasons.includes('allYear') || seasons.includes(season)
}

export function canGenerateFits(items) {
  const season = getCurrentSeason()
  const pool = items.filter((i) => itemMatchesSeason(i, season))
  return CORE_CATEGORIES.every((cat) => pool.some((i) => i.category === cat))
}

function pickRandom(arr) {
  if (!arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickAccessories(parts, accPool, activity, maxCount) {
  if (!accPool.length || maxCount < 1) return []
  const shuffled = [...accPool].sort(() => Math.random() - 0.5)
  const picked = []
  for (const acc of shuffled) {
    if (picked.length >= maxCount) break
    const trial = [...parts, ...picked, acc]
    if (!isValidCombination(trial, activity)) continue
    picked.push(acc)
  }
  return picked
}

function buildReasons(parts, season, activity) {
  const reasons = []
  const targetDir = getTargetStyleDirection(activity)
  reasons.push(`Stil: ${getStyleDirectionLabel(targetDir)}`)
  reasons.push(`Anlass: ${activityLabel(activity)}`)

  const seasonLabel =
    { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', winter: 'Winter' }[season] ?? season
  reasons.push(`Saison: ${seasonLabel}`)

  const allKeys = parts.flatMap((p) => getAllItemKeys(p))
  const vibeLabels = [
    ...new Set(
      allKeys
        .filter((k) => k.startsWith('vibe:') || k.startsWith('style:') || k.startsWith('dir:'))
        .map((k) => tagKeyToLabel(k)),
    ),
  ].slice(0, 4)
  if (vibeLabels.length) reasons.push(`Tags: ${vibeLabels.join(', ')}`)

  const colors = [...new Set(allKeys.filter((k) => k.startsWith('color:')).map((k) => tagKeyToLabel(k)))]
  if (colors.length) reasons.push(`Farben: ${colors.join(', ')}`)

  const nums = parts.map((p) => `Nr. ${p.displayNumber}`).join(' · ')
  reasons.push(nums)

  return reasons
}

function pickCompatibleJacket(jackets, parts, activity) {
  const pool = filterPoolForActivity(jackets, activity)
  const usePool = pool.length ? pool : jackets
  let best = null
  let bestScore = -Infinity

  for (const jacket of usePool) {
    const trial = [...parts, jacket]
    if (!isValidCombination(trial, activity)) continue
    const s = scoreCombination(trial, getCurrentSeason(), activity, { itemMatchesSeason })
    if (s > bestScore) {
      bestScore = s
      best = jacket
    }
  }

  return best
}

/**
 * @returns {{ id: string, itemIds: string[], score: number, reasons: string[], activity: string }[]}
 */
export function generateFits(
  items,
  { season = getCurrentSeason(), activity = 'casual', limit = 8 } = {},
) {
  if (!canGenerateFits(items)) return []

  const seasonPool = items.filter((i) => itemMatchesSeason(i, season))
  const tops = filterPoolForActivity(
    seasonPool.filter((i) => i.category === 'tops'),
    activity,
  )
  const pants = filterPoolForActivity(
    seasonPool.filter((i) => i.category === 'pants'),
    activity,
  )
  const shoes = filterPoolForActivity(
    seasonPool.filter((i) => i.category === 'shoes'),
    activity,
  )
  const jackets = filterPoolForActivity(
    seasonPool.filter((i) => i.category === 'jackets'),
    activity,
  )
  const accessories = filterPoolForActivity(
    seasonPool.filter((i) => i.category === 'accessories'),
    activity,
  )

  if (!tops.length || !pants.length || !shoes.length) return []

  const targetDir = getTargetStyleDirection(activity)
  const pickPool = (arr) => {
    const matched = arr.filter((i) => itemMatchesTargetDirection(i, targetDir))
    return matched.length ? matched : arr
  }
  const topsPool = pickPool(tops)
  const pantsPool = pickPool(pants)
  const shoesPool = pickPool(shoes)

  const minScore = minFitScoreForActivity(activity)
  const combos = []
  const seen = new Set()
  const maxAttempts = Math.min(500, topsPool.length * pantsPool.length * shoesPool.length * 6)

  for (let n = 0; n < maxAttempts && combos.length < limit * 8; n++) {
    const top = pickRandom(topsPool)
    const pant = pickRandom(pantsPool)
    const shoe = pickRandom(shoesPool)
    if (!top || !pant || !shoe) continue
    const parts = [top, pant, shoe]

    if (!isValidCombination(parts, activity)) continue

    if (jackets.length && Math.random() > 0.45) {
      const jacket = pickCompatibleJacket(jackets, parts, activity)
      if (jacket) parts.push(jacket)
    }

    if (accessories.length && Math.random() > 0.7) {
      const accPool = filterPoolForActivity(accessories, activity)
      const pool = accPool.length ? accPool : accessories
      const maxAcc = Math.min(pool.length >= 2 && Math.random() > 0.5 ? 2 : 1, pool.length)
      parts.push(...pickAccessories(parts, pool, activity, maxAcc))
    }

    const itemIds = parts.map((p) => p.id).sort().join('|')
    if (seen.has(itemIds)) continue
    seen.add(itemIds)

    const score = scoreCombination(parts, season, activity, { itemMatchesSeason })
    if (score < minScore) continue

    combos.push({
      id: itemIds,
      itemIds: parts.map((p) => p.id),
      score,
      activity,
      reasons: buildReasons(parts, season, activity),
    })
  }

  const ranked = combos.sort((a, b) => b.score - a.score)

  const unique = []
  const usedSignatures = new Set()
  for (const combo of ranked) {
    const sig = combo.itemIds.slice().sort().join('|')
    if (usedSignatures.has(sig)) continue
    usedSignatures.add(sig)
    unique.push(combo)
    if (unique.length >= limit) break
  }

  if (unique.length > 0) return unique

  const relaxed = []
  const relaxedMin = 18
  for (let n = 0; n < maxAttempts && relaxed.length < limit; n++) {
    const top = pickRandom(topsPool)
    const pant = pickRandom(pantsPool)
    const shoe = pickRandom(shoesPool)
    if (!top || !pant || !shoe) continue
    const parts = [top, pant, shoe]
    const itemIds = parts.map((p) => p.id).sort().join('|')
    if (seen.has(itemIds)) continue
    seen.add(itemIds)
    const score = scoreCombination(parts, season, activity, { itemMatchesSeason })
    if (score < relaxedMin) continue
    relaxed.push({
      id: itemIds,
      itemIds: parts.map((p) => p.id),
      score,
      activity,
      reasons: buildReasons(parts, season, activity),
    })
  }

  return relaxed.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Bestes Outfit über eine oder mehrere Aktivitäten.
 * @param {string[]} activityIds
 */
export function generateBestFitForActivities(
  items,
  activityIds,
  { season = getCurrentSeason(), limit = 12, maxActivities = 8 } = {},
) {
  if (!activityIds?.length || !canGenerateFits(items)) return null

  const toTry = activityIds.slice(0, maxActivities)
  let best = null

  for (const activityId of toTry) {
    const fits = generateFits(items, { season, activity: activityId, limit: Math.min(limit, 10) })
    for (const fit of fits) {
      if (!best || fit.score > best.score) {
        best = { ...fit, primaryActivity: activityId }
      }
    }
  }

  return best
}
