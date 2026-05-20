import {
  DEFAULT_FITS_TAB_IDS,
  FITS_CATEGORY_POOL,
  MAX_FITS_TAB_CATEGORIES,
  normalizeFitsTabCategories,
} from '../lib/fitsCategories.js'

export default function FitsCategoryPicker({ selectedIds, onChange }) {
  const selected = normalizeFitsTabCategories(selectedIds)
  const atMax = selected.length >= MAX_FITS_TAB_CATEGORIES

  function toggle(id) {
    if (selected.includes(id)) {
      if (selected.length <= 1) return
      onChange(selected.filter((x) => x !== id))
      return
    }
    if (atMax) return
    onChange([...selected, id])
  }

  function resetDefaults() {
    onChange([...DEFAULT_FITS_TAB_IDS])
  }

  return (
    <div className="fits-category-picker">
      <p className="settings-hint">
        Wähle bis zu {MAX_FITS_TAB_CATEGORIES} Kategorien für die Schnellwahl im Fits-Tab (
        <strong>{selected.length}/{MAX_FITS_TAB_CATEGORIES}</strong>).
      </p>
      <div className="pill-row pill-row--wrap fits-category-grid" role="list">
        {FITS_CATEGORY_POOL.map((cat) => {
          const isOn = selected.includes(cat.id)
          const disabled = !isOn && atMax
          return (
            <button
              key={cat.id}
              type="button"
              role="listitem"
              className={`pill pill--selectable${isOn ? ' pill--selected' : ''}${disabled ? ' pill--disabled' : ''}`}
              onClick={() => toggle(cat.id)}
              disabled={disabled}
              aria-pressed={isOn}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
      <div className="settings-actions settings-actions--inline">
        <button type="button" className="btn btn--ghost btn--small" onClick={resetDefaults}>
          Standard wiederherstellen
        </button>
      </div>
    </div>
  )
}
