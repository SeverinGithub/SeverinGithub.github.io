// GT racing theme: wording only, mechanics stay the same. Swap this file to change the theme.
export const theme = {
  xp: 'Speed',
  xpShort: 'km/h',
  unit: 'Sektor',
  chest: 'Boxenstopp',
  gems: 'Pokale',
  streak: 'Rennserie',
  start: 'START',
  path: 'Rennstrecke',
  levels: [
    { name: 'Rookie', min: 0 },
    { name: 'Racer', min: 250 },
    { name: 'Pro', min: 700 },
    { name: 'Champion', min: 1600 },
  ],
}

export function levelFor(xp: number) {
  let idx = 0
  theme.levels.forEach((l, i) => { if (xp >= l.min) idx = i })
  const next = theme.levels[idx + 1]
  return { ...theme.levels[idx], index: idx, next, progress: next ? (xp - theme.levels[idx].min) / (next.min - theme.levels[idx].min) : 1 }
}
