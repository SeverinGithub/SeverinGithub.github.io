import type { AttemptLog, LessonProgress, Mistake } from '../store'
import { lessons, units } from '../content'
import { theme } from './theme'

// Badges are derived from the saved progress, so they also appear for learners who reached them
// before badges existed. Each new badge gives `scoring.badgeGems` trophies.
export interface BadgeState {
  progress: Record<string, LessonProgress>
  attempts: AttemptLog[]
  mistakes: Record<string, Mistake>
  streak: { current: number; longest: number }
  xp: number
}

export interface Badge {
  id: string
  icon: string
  title: string
  desc: string
  done: (s: BadgeState) => boolean
}

const stars = (s: BadgeState, min: number) => lessons.filter((l) => (s.progress[l.id]?.bestStars ?? 0) >= min)
const unitDone = (s: BadgeState, unit: number) => {
  const ls = lessons.filter((l) => l.unit === unit)
  return ls.length > 0 && ls.every((l) => (s.progress[l.id]?.bestStars ?? 0) >= 2)
}

export const badges: Badge[] = [
  { id: 'first', icon: '🏁', title: 'Erste Runde', desc: 'Die erste Lektion beendet', done: (s) => s.attempts.some((a) => !a.practice) },
  { id: 'perfect', icon: '⭐', title: 'Perfekte Runde', desc: 'Eine Lektion mit 3 Sternen', done: (s) => stars(s, 3).length >= 1 },
  { id: 'flawless', icon: '💯', title: 'Fehlerfrei', desc: 'Eine Lektion mit 100 %', done: (s) => s.attempts.some((a) => !a.practice && a.score >= 0.999) },
  { id: 'streak3', icon: '🔥', title: 'Warmgefahren', desc: '3 Tage in Folge geübt', done: (s) => s.streak.longest >= 3 },
  { id: 'streak7', icon: '🚀', title: 'Eine Woche Vollgas', desc: '7 Tage in Folge geübt', done: (s) => s.streak.longest >= 7 },
  { id: 'streak30', icon: '🏆', title: 'Dauerläufer', desc: '30 Tage in Folge geübt', done: (s) => s.streak.longest >= 30 },
  { id: 'practice5', icon: '🔧', title: 'Mechaniker', desc: '5 Fehlertrainings gemacht', done: (s) => s.attempts.filter((a) => a.practice).length >= 5 },
  { id: 'fixed10', icon: '🛠️', title: 'Alles repariert', desc: '10 Fehler endgültig erledigt', done: (s) => Object.values(s.mistakes).filter((m) => m.resolved).length >= 10 },
  ...units.map((u): Badge => ({ id: `unit${u.id}`, icon: '🚩', title: `${theme.unit} ${u.title}`, desc: `Alle Lektionen im ${theme.unit} ${u.title} mit 2 Sternen`, done: (s) => unitDone(s, u.id) })),
  { id: 'all', icon: '🏎️', title: 'Ziellinie', desc: 'Alle Lektionen mit 2 Sternen', done: (s) => stars(s, 2).length === lessons.length },
  { id: 'all3', icon: '👑', title: 'Weltmeister', desc: 'Alle Lektionen mit 3 Sternen', done: (s) => stars(s, 3).length === lessons.length },
]

export const badgeById = Object.fromEntries(badges.map((b) => [b.id, b])) as Record<string, Badge>
