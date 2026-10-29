// Star thresholds and XP rules (spec 5.3 / 5.5).
export const scoring = {
  stars: [
    { min: 0.9, stars: 3 },
    { min: 0.7, stars: 2 },
    { min: 0.5, stars: 1 },
  ],
  unlockStars: 2,
  retryWrongItems: false,
  xpPerLesson: 10,
  xpStarBonus: [0, 5, 10, 20],
  xpPerCorrectItem: 1,
  gemsPerStar: 2,
  chestGems: 20,
  practiceIntervalsDays: [1, 3, 7],
}

export function starsFor(score: number): number {
  return scoring.stars.find((s) => score >= s.min)?.stars ?? 0
}
