import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initSettings } from './lib/appSettings.js'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function showBootError(message) {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `
    <div class="boot-error" role="alert">
      <h1>Closet – Fehler</h1>
      <p>${message}</p>
      <p><strong>Lokal starten:</strong> Im Ordner <code>closet</code> → <code>npm run dev</code> → dann
      <a href="/">http://localhost:5173/</a> öffnen (nicht nur eine leere/schwarze Seite).</p>
      <button type="button" class="btn btn--primary" onclick="location.reload()">Neu laden</button>
    </div>
  `
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister())
  })
}

if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker.register(swUrl).catch(() => {})
  })
}

try {
  initSettings()
} catch (err) {
  console.error('initSettings', err)
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<p style="padding:24px">#root fehlt in index.html</p>'
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
  } catch (err) {
    console.error('createRoot', err)
    showBootError(err?.message ?? 'Unbekannter Startfehler')
  }
}
