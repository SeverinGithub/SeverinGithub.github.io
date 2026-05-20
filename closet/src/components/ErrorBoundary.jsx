import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boot-error" role="alert">
          <h1>Closet – Fehler</h1>
          <p>Die App konnte nicht starten. Oft hilft ein Cache-Leeren (siehe unten).</p>
          <pre>{this.state.error.message}</pre>
          <button
            type="button"
            className="btn btn--primary"
            onClick={async () => {
              try {
                localStorage.removeItem('closet-app-settings-v1')
                localStorage.removeItem('closet-wardrobe-v1')
                const { clearWardrobeStorage } = await import('../lib/wardrobeStorage.js')
                await clearWardrobeStorage()
              } catch {
                /* ignore */
              }
              window.location.reload()
            }}
          >
            Daten zurücksetzen &amp; neu laden
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
