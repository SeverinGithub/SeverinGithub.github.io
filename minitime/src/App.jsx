import { useState } from 'react'
import AuthGate from './AuthGate'
import { FxProvider } from './fx.jsx'
import HomeScreen from './HomeScreen'
import ListScreen from './ListScreen'
import CalendarScreen from './CalendarScreen'
import StatsScreen from './StatsScreen'
import SettingsScreen from './SettingsScreen'

const TABS = [
  { key: 'home', label: 'Heute', icon: '⌂' },
  { key: 'list', label: 'Liste', icon: '≡' },
  { key: 'calendar', label: 'Kalender', icon: '▦' },
  { key: 'stats', label: 'Statistik', icon: '◔' },
  { key: 'settings', label: 'Einstellungen', icon: '⚙' },
]

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <FxProvider>
    <AuthGate>
    <div className="app">
      {tab === 'home' && <HomeScreen goTo={setTab} />}
      {tab === 'list' && <ListScreen />}
      {tab === 'calendar' && <CalendarScreen />}
      {tab === 'stats' && <StatsScreen />}
      {tab === 'settings' && <SettingsScreen />}

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            <span className="icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
    </AuthGate>
    </FxProvider>
  )
}
