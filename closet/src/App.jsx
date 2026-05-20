import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import BlobDecor from './components/BlobDecor.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { WardrobeProvider } from './context/WardrobeContext.jsx'
import EditorView from './views/EditorView.jsx'
import FitsView from './views/FitsView.jsx'
import HomeView from './views/HomeView.jsx'
import SettingsView from './views/SettingsView.jsx'

const VIEWS = {
  fits: FitsView,
  home: HomeView,
  editor: EditorView,
}

export default function App() {
  const [activeView, setActiveView] = useState('home')
  const navActive = activeView === 'settings' ? 'home' : activeView

  function renderMain() {
    if (activeView === 'settings') {
      return <SettingsView onBack={() => setActiveView('home')} />
    }
    if (activeView === 'home') {
      return <HomeView onOpenSettings={() => setActiveView('settings')} />
    }
    const View = VIEWS[activeView]
    return <View />
  }

  return (
    <SettingsProvider>
      <WardrobeProvider>
        <div className="app">
          <BlobDecor />
          <main className="app-main">
            {renderMain()}
          </main>
          <BottomNav active={navActive} onChange={setActiveView} />
        </div>
      </WardrobeProvider>
    </SettingsProvider>
  )
}
