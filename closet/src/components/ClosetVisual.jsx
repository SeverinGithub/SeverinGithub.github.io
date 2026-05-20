import { useMemo } from 'react'
import { CATEGORIES } from '../types/clothing.js'

export default function ClosetVisual({ items }) {
  const byCategory = useMemo(() => {
    const map = Object.fromEntries(CATEGORIES.map((c) => [c.id, []]))
    for (const item of items) {
      if (map[item.category]) map[item.category].push(item)
    }
    for (const id of Object.keys(map)) {
      map[id].sort((a, b) => a.displayNumber - b.displayNumber)
    }
    return map
  }, [items])

  return (
    <div className="closet-visual" aria-label="Schrankansicht">
      <div className="closet-visual-frame">
        <div className="closet-visual-rod" aria-hidden />
        {CATEGORIES.map((cat, index) => {
          const sectionItems = byCategory[cat.id] ?? []
          return (
            <section
              key={cat.id}
              className={`closet-section${index === 0 ? ' closet-section--first' : ''}`}
              aria-labelledby={`closet-${cat.id}`}
            >
              <h3 id={`closet-${cat.id}`} className="closet-section-label">
                {cat.label}
              </h3>
              <div className="closet-shelf">
                {sectionItems.length === 0 ? (
                  <div className="closet-shelf-empty">
                    <span className="closet-shelf-empty-line" aria-hidden />
                    <span className="closet-shelf-empty-text">Leer</span>
                  </div>
                ) : (
                  <div className="closet-shelf-scroll" role="list">
                    {sectionItems.map((item) => (
                      <div key={item.id} className="closet-shelf-item" role="listitem">
                        <img src={item.imageDataUrl} alt="" className="closet-shelf-img" />
                        <span className="closet-shelf-nr">Nr. {item.displayNumber}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )
        })}
        <div className="closet-visual-base" aria-hidden />
      </div>
    </div>
  )
}
