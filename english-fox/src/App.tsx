import { useEffect, useState } from 'react'
import { lessonById, lessons, solutionsFor } from './content'
import { isUnlocked, streakAlive, today, useStore } from './store'
import { useRoute, go } from './router'
import { Learn } from './screens/Learn'
import { LessonRunner } from './screens/LessonRunner'
import { Practice, Profile, Reference } from './screens/Other'
import { Mascot } from './components/Mascot'
import { brand } from './config/brand'
import { theme } from './config/theme'

const tabs = [
  { path: '/learn', icon: '🏁', label: 'Lernen' },
  { path: '/practice', icon: '🔧', label: 'Üben' },
  { path: '/reference', icon: '📖', label: 'Nachschlagen' },
  { path: '/profile', icon: '🦊', label: 'Profil' },
]

export function App() {
  const route = useRoute()
  const [first] = route.parts
  const progress = useStore((s) => s.progress)

  if (first === 'lesson') {
    const lesson = lessonById[route.parts[1]]
    if (!lesson || !isUnlocked(lessons.map((l) => l.id), lesson.id, progress)) { go('/learn'); return null }
    const i = lessons.indexOf(lesson)
    return <LessonRunner key={lesson.id + (route.query.get('again') ?? '')} lesson={lesson} sol={solutionsFor(lesson.id)} nextLessonId={lessons[i + 1]?.id} />
  }
  if (first === 'practice' && route.parts[1] === 'run') return <Practice run />

  return (
    <div className="shell">
      <TopBar />
      <main className="content">
        {first === 'practice' ? <Practice /> : first === 'reference' ? <Reference section={route.parts[1]} /> : first === 'profile' ? <Profile section={route.parts[1]} /> : <Learn anchor={route.anchor} />}
      </main>
      <nav className="tabs">
        {tabs.map((t) => (
          <a key={t.path} href={`#${t.path}`} className={route.path.startsWith(t.path) || (t.path === '/learn' && !first) ? 'on' : ''}>
            <span aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </a>
        ))}
      </nav>
      <InstallHint />
    </div>
  )
}

function TopBar() {
  const { streak, xp, gems, daily, settings } = useStore()
  const todayXp = daily.date === today() ? daily.xp : 0
  const alive = streakAlive(streak.lastActive)
  const goal = Math.min(1, todayXp / settings.dailyGoal)
  return (
    <header className="topbar">
      <span className="brand">
        <img src={`${import.meta.env.BASE_URL}icons/fox.svg`} alt="" width={30} height={30} />
        <span>{brand.shortName}<sup>GT</sup></span>
      </span>
      <span className="pills">
        <span className={`pill ${alive && streak.current ? '' : 'pill-dim'}`} title={theme.streak}>🔥 {alive ? streak.current : 0}</span>
        <span className="pill" title={`Tagesziel: ${todayXp}/${settings.dailyGoal} ${theme.xp}`}>
          <span className="ring" style={{ ['--p' as string]: goal }} />
          {xp} <small>{theme.xpShort}</small>
        </span>
        <span className="pill" title={theme.gems}>🏆 {gems}</span>
      </span>
    </header>
  )
}

// Safari: explain "Teilen → Zum Home-Bildschirm" once, only when not installed.
function InstallHint() {
  const onboarded = useStore((s) => s.onboarded)
  const setOnboarded = useStore((s) => s.setOnboarded)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone
    const ios = /iPad|iPhone|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document
    setShow(!onboarded && !standalone && ios)
  }, [onboarded])
  if (!show) return null
  return (
    <div className="install">
      <Mascot mood="motivated" size={56} />
      <p>Tipp: Tippe auf <strong>Teilen</strong> und dann <strong>„Zum Home-Bildschirm“</strong> – dann startet {brand.appName} wie eine App.</p>
      <button className="icon-btn" onClick={setOnboarded} aria-label="Schließen">✕</button>
    </div>
  )
}
