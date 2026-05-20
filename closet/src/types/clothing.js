import { normalizeTags } from '../lib/tags.js'

export const CATEGORIES = [
  { id: 'tops', label: 'Oberteile' },
  { id: 'pants', label: 'Hosen' },
  { id: 'shoes', label: 'Schuhe' },
  { id: 'jackets', label: 'Jacken' },
  { id: 'accessories', label: 'Accessoires' },
]

export const SEASONS = [
  { id: 'spring', label: 'Frühling' },
  { id: 'summer', label: 'Sommer' },
  { id: 'autumn', label: 'Herbst' },
  { id: 'winter', label: 'Winter' },
  { id: 'allYear', label: 'Ganzjährig' },
]

export const STORAGE_KEY = 'closet-wardrobe-v1'

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export function seasonLabels(ids) {
  return ids.map((id) => SEASONS.find((s) => s.id === id)?.label ?? id)
}

export function nextDisplayNumber(items) {
  if (!items.length) return 1
  const nums = items.map((i) => Number(i.displayNumber)).filter((n) => Number.isFinite(n))
  if (!nums.length) return 1
  return Math.max(...nums) + 1
}

export function createClothingItem({ category, seasons, tags, imageDataUrl }, existingItems) {
  const now = new Date().toISOString()
  const { tags: normalizedTags, tagKeys } = normalizeTags(tags ?? [])
  return {
    id: crypto.randomUUID(),
    displayNumber: nextDisplayNumber(existingItems),
    imageDataUrl,
    category,
    seasons,
    tags: normalizedTags,
    tagKeys,
    createdAt: now,
    updatedAt: now,
  }
}

export function updateClothingItem(existing, { category, seasons, tags, imageDataUrl }) {
  const { tags: normalizedTags, tagKeys } = normalizeTags(tags ?? [])
  return {
    ...existing,
    imageDataUrl: imageDataUrl ?? existing.imageDataUrl,
    category,
    seasons,
    tags: normalizedTags,
    tagKeys,
    updatedAt: new Date().toISOString(),
  }
}
