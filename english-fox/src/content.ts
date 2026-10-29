import type { Lesson, SolutionMap, Unit } from '../shared/types'
import unitsJson from '../content/units.json'

// Lessons and answer keys are picked up from /content automatically:
// a new lesson = a new JSON file there, no code change.
const lessonFiles = import.meta.glob<Lesson>('../content/lessons/*.json', { eager: true, import: 'default' })
const solutionFiles = import.meta.glob<SolutionMap>('../content/solutions/*.json', { eager: true, import: 'default' })

export const units: Unit[] = unitsJson
export const lessons: Lesson[] = Object.values(lessonFiles).sort((a, b) => a.order - b.order)
export const lessonById = Object.fromEntries(lessons.map((l) => [l.id, l])) as Record<string, Lesson>

export function solutionsFor(lessonId: string): SolutionMap {
  return solutionFiles[`../content/solutions/${lessonId}.json`] ?? {}
}
