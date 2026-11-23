import { beforeEach, describe, expect, it, vi } from 'vitest'
import { streakAlive, useStore, type AttemptLog } from './store'
import { scoring } from './config/scoring'

const day = (d: string) => vi.setSystemTime(new Date(`${d}T12:00:00Z`))
const attempt = (lessonId = 'L01', stars = 2, score = 0.8): AttemptLog => ({
  id: crypto.randomUUID(), lessonId, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(), score, stars, xp: 10, exercises: [], tags: [],
})

describe('streak + freeze', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useStore.setState({ streak: { current: 0, longest: 0 }, freezes: 0, gems: 0, badges: [], progress: {}, attempts: [], mistakes: {}, xp: 0 })
  })

  it('counts days in a row and resets after a gap', () => {
    day('2026-11-01'); useStore.getState().finishAttempt(attempt(), [], [])
    day('2026-11-02'); useStore.getState().finishAttempt(attempt(), [], [])
    expect(useStore.getState().streak.current).toBe(2)
    day('2026-11-05'); useStore.getState().finishAttempt(attempt(), [], [])
    expect(useStore.getState().streak.current).toBe(1)
    expect(useStore.getState().streak.longest).toBe(2)
  })

  it('a freeze bridges one missed day and is used up', () => {
    day('2026-11-01'); useStore.getState().finishAttempt(attempt(), [], [])
    useStore.setState({ freezes: 1 })
    expect(streakAlive('2026-11-01', 1)).toBe(true)
    day('2026-11-03')
    expect(streakAlive('2026-11-01', 0)).toBe(false)
    expect(streakAlive('2026-11-01', 1)).toBe(true)
    const info = useStore.getState().finishAttempt(attempt(), [], [])
    expect(info.freezesUsed).toBe(1)
    expect(useStore.getState().streak.current).toBe(2)
    expect(useStore.getState().freezes).toBe(0)
  })

  it('two missed days need two freezes', () => {
    day('2026-11-01'); useStore.getState().finishAttempt(attempt(), [], [])
    useStore.setState({ freezes: 1 })
    day('2026-11-04'); useStore.getState().finishAttempt(attempt(), [], [])
    expect(useStore.getState().streak.current).toBe(1)
    expect(useStore.getState().freezes).toBe(1) // not wasted
  })

  it('buying respects price and limit', () => {
    useStore.setState({ gems: scoring.freezeCost * 5 })
    for (let i = 0; i < 4; i++) useStore.getState().buyFreeze()
    expect(useStore.getState().freezes).toBe(scoring.maxFreezes)
    expect(useStore.getState().gems).toBe(scoring.freezeCost * (5 - scoring.maxFreezes))
  })

  it('awards badges once, with trophies', () => {
    day('2026-11-01')
    const info = useStore.getState().finishAttempt(attempt('L01', 3, 1), [], [])
    expect(info.newBadges).toEqual(expect.arrayContaining(['first', 'perfect', 'flawless']))
    const again = useStore.getState().finishAttempt(attempt('L01', 3, 1), [], [])
    expect(again.newBadges).toEqual([])
    expect(useStore.getState().gems).toBe(3 * scoring.gemsPerStar + info.newBadges.length * scoring.badgeGems)
  })
})
