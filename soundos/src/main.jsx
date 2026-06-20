import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// When a new SW takes control, reload immediately to load fresh assets
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

// Register SW — onNeedRefresh fires when a new version is waiting
const updateSW = registerSW({
  onNeedRefresh() {
    // Skip the waiting phase and activate the new SW right away
    updateSW(true)
  },
  onOfflineReady() {},
})

// iOS doesn't push update checks — trigger one every time the app comes to foreground
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    navigator.serviceWorker?.getRegistration?.().then(reg => reg?.update?.())
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
