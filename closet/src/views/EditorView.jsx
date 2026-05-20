import { useState } from 'react'
import AddItemModal from '../components/AddItemModal.jsx'
import WardrobeImport from '../components/WardrobeImport.jsx'
import { useWardrobe } from '../context/WardrobeContext.jsx'
import { categoryLabel, seasonLabels } from '../types/clothing.js'

export default function EditorView() {
  const { items, addItem, updateItem, removeItem } = useWardrobe()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  function openAdd() {
    setEditingItem(null)
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditingItem(item)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="view">
      <header className="view-header">
        <h1 className="view-title">Editor</h1>
        <p className="view-subtitle">
          {items.length === 0
            ? 'Verwalte deinen digitalen Kleiderschrank.'
            : `${items.length} ${items.length === 1 ? 'Teil' : 'Teile'} im Schrank`}
        </p>
      </header>

      <div className="editor-action-row">
        <button
          type="button"
          className="add-card add-card--active"
          onClick={openAdd}
          aria-label="Kleidungsstück hinzufügen"
        >
          <span className="add-card-icon">+</span>
          <span className="add-card-label">Teil hinzufügen</span>
          <span className="add-card-hint">Foto & Tags – Kategorie & Saison</span>
        </button>
        <WardrobeImport variant="editor" />
      </div>

      <AddItemModal
        open={modalOpen}
        item={editingItem}
        onClose={closeModal}
        onSave={addItem}
        onUpdate={updateItem}
        onRemove={removeItem}
      />

      <section className="section">
        <h2 className="section-label">Dein Schrank</h2>
        {items.length === 0 ? (
          <p className="grid-empty-hint">Noch leer – füge dein erstes Teil hinzu.</p>
        ) : (
          <>
            <p className="grid-empty-hint grid-empty-hint--compact">Tippe auf ein Teil zum Bearbeiten</p>
            <div className="wardrobe-grid">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="wardrobe-item wardrobe-item--clickable"
                  onClick={() => openEdit(item)}
                  aria-label={`Nr. ${item.displayNumber} bearbeiten, ${categoryLabel(item.category)}`}
                >
                  <img src={item.imageDataUrl} alt="" className="wardrobe-item-img" />
                  <span className="wardrobe-item-nr">Nr. {item.displayNumber}</span>
                  <div className="wardrobe-item-meta">
                    <span className="wardrobe-item-cat">{categoryLabel(item.category)}</span>
                    {Array.isArray(item.tags) && item.tags.length > 0 && (
                      <span className="wardrobe-item-tags">{item.tags.slice(0, 2).join(' · ')}</span>
                    )}
                    <span className="wardrobe-item-seasons">{seasonLabels(item.seasons).join(', ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
