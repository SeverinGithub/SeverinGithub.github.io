const TABS = [
  { id: 'editor', label: 'Editor' },
  { id: 'home', label: 'Home' },
  { id: 'fits', label: 'Fits' },
]

function NavIcon({ id, active }) {
  const stroke = active ? 'var(--primary)' : 'var(--text-muted)'
  const common = { stroke, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }

  if (id === 'fits') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M4 7h6l2 3h8v7H4V7z" />
        <path {...common} d="M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
      </svg>
    )
  }

  if (id === 'home') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <path {...common} d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5z" />
        <path {...common} d="M9 20v-6h6v6" />
      </svg>
    )
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <rect {...common} x="4" y="4" width="7" height="7" rx="1.5" />
      <rect {...common} x="13" y="4" width="7" height="7" rx="1.5" />
      <rect {...common} x="4" y="13" width="7" height="7" rx="1.5" />
      <path {...common} d="M13 16.5h7M16.5 13v7" />
    </svg>
  )
}

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Hauptnavigation">
      <div className="bottom-nav-inner">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          const isCenter = tab.id === 'home'
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab${isActive ? ' nav-tab--active' : ''}${isCenter ? ' nav-tab--center' : ''}`}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <NavIcon id={tab.id} active={isActive} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
