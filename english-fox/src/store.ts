import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { scoring } from './config/scoring'

export interface LessonProgress {
  bestStars: number
  bestScore: number
  attempts: number
  completedAt?: string
}

export interface AttemptLog {
  id: string
  lessonId: string
  practice?: boolean
  startedAt: string
  finishedAt: string
  score: number
  stars: number
  xp: number
  exercises: { id: string; score: number }[]
  tags: string[]
}

export interface Mistake {
  key: string // field id
  lessonId: string
  exerciseId: string
  itemId: string
  tags: string[]
  yours: string
  correct: string
  lastSeen: string
  dueAt: string
  stage: number
  resolved: boolean
}

export interface Settings {
  inputMode: 'auto' | 'keyboard' | 'pen'
  fingerDraw: boolean
  evalUrl: string
  familyCode: string
  dailyGoal: number
  sound: boolean
  name: string
}

interface State {
  progress: Record<string, LessonProgress>
  attempts: AttemptLog[]
  mistakes: Record<string, Mistake>
  xp: number
  gems: number
  streak: { current: number; longest: number; lastActive?: string }
  daily: { date: string; xp: number }
  chests: number[]
  settings: Settings
  onboarded: boolean
  finishAttempt: (a: AttemptLog, mistakes: Omit<Mistake, 'dueAt' | 'stage' | 'resolved' | 'lastSeen'>[], solved: string[]) => { newBest: boolean }
  openChest: (unit: number) => void
  updateSettings: (s: Partial<Settings>) => void
  setOnboarded: () => void
  reset: () => void
}

export const today = () => new Date().toISOString().slice(0, 10)
const addDays = (days: number) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10)

const initial = {
  progress: {},
  attempts: [],
  mistakes: {},
  xp: 0,
  gems: 0,
  streak: { current: 0, longest: 0 },
  daily: { date: today(), xp: 0 },
  chests: [],
  onboarded: false,
  settings: {
    inputMode: 'auto',
    fingerDraw: false,
    evalUrl: (import.meta.env.VITE_EVAL_URL as string | undefined) ?? '',
    familyCode: '',
    dailyGoal: 20,
    sound: true,
    name: '',
  } as Settings,
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      finishAttempt: (a, newMistakes, solved) => {
        const s = get()
        const prev = s.progress[a.lessonId]
        const newBest = !a.practice && (!prev || a.stars > prev.bestStars)
        const progress = a.practice
          ? s.progress
          : {
              ...s.progress,
              [a.lessonId]: {
                bestStars: Math.max(prev?.bestStars ?? 0, a.stars),
                bestScore: Math.max(prev?.bestScore ?? 0, a.score),
                attempts: (prev?.attempts ?? 0) + 1,
                completedAt: a.finishedAt,
              },
            }
        // streak: one active day in a row
        const d = today()
        let streak = s.streak
        if (streak.lastActive !== d) {
          const yesterday = addDays(-1)
          const current = streak.lastActive === yesterday ? streak.current + 1 : 1
          streak = { current, longest: Math.max(streak.longest, current), lastActive: d }
        }
        const daily = s.daily.date === d ? { date: d, xp: s.daily.xp + a.xp } : { date: d, xp: a.xp }
        const gainedStars = a.practice ? 0 : Math.max(0, a.stars - (prev?.bestStars ?? 0))
        // mistakes: wrong fields come in, fields answered right in practice move up a stage
        const mistakes = { ...s.mistakes }
        for (const m of newMistakes) {
          mistakes[m.key] = { ...m, lastSeen: a.finishedAt, dueAt: addDays(scoring.practiceIntervalsDays[0]), stage: 0, resolved: false }
        }
        for (const key of solved) {
          const m = mistakes[key]
          if (!m) continue
          const stage = m.stage + 1
          mistakes[key] = { ...m, stage, lastSeen: a.finishedAt, resolved: stage >= scoring.practiceIntervalsDays.length, dueAt: addDays(scoring.practiceIntervalsDays[Math.min(stage, scoring.practiceIntervalsDays.length - 1)]) }
        }
        set({
          progress,
          attempts: [a, ...s.attempts].slice(0, 300),
          mistakes,
          xp: s.xp + a.xp,
          gems: s.gems + gainedStars * scoring.gemsPerStar,
          streak,
          daily,
        })
        return { newBest }
      },
      openChest: (unit) => set((s) => (s.chests.includes(unit) ? s : { chests: [...s.chests, unit], gems: s.gems + scoring.chestGems, xp: s.xp + 10 })),
      updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      setOnboarded: () => set({ onboarded: true }),
      reset: () => set({ ...initial, settings: get().settings, onboarded: true }),
    }),
    { name: 'english-fox', version: 1 },
  ),
)

export function isUnlocked(order: string[], lessonId: string, progress: Record<string, LessonProgress>): boolean {
  const i = order.indexOf(lessonId)
  if (i <= 0) return true
  return (progress[order[i - 1]]?.bestStars ?? 0) >= scoring.unlockStars
}

export function streakAlive(lastActive?: string) {
  return lastActive === today() || lastActive === addDays(-1)
}
