import { useEffect, useMemo, useRef, useState } from 'react'
import {
  STANDARD_STYLE_DIRECTIONS,
  getDirectionAnchorTag,
  getDirectionById,
} from '../lib/styleDirections.js'
import {
  applyExclusiveTagKeys,
  coerceRawTags,
  detectDirectionFromKeys,
  getStyleSubTagSuggestions,
  getTagSuggestions,
  normalizeTag,
  normalizeTags,
  tagKeyToLabel,
  tagsFromKeys,
} from '../lib/tags.js'
import { CATEGORIES, SEASONS } from '../types/clothing.js'

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function parseTagsInput(value) {
  return coerceRawTags(
    value
      .split(/[,;]+/)
      .map((t) => t.trim())
      .filter(Boolean),
  )
    .map((t) => normalizeTag(t)?.label)
    .filter(Boolean)
}

function mergeTagLabels(prevLabels, additions) {
  return normalizeTags([...coerceRawTags(prevLabels), ...coerceRawTags(additions)]).tags
}

const EMPTY_FORM = {
  imageDataUrl: null,
  category: '',
  seasons: [],
  tagInput: '',
  tags: [],
  error: '',
}

export default function AddItemModal({ open, item = null, onClose, onSave, onUpdate, onRemove }) {
  const fileRef = useRef(null)
  const isEdit = Boolean(item)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [category, setCategory] = useState('')
  const [seasons, setSeasons] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [activeDirection, setActiveDirection] = useState(null)
  const [error, setError] = useState('')

  const selectedKeys = useMemo(() => normalizeTags(tags).tagKeys, [tags])
  const resolvedDirection = activeDirection ?? detectDirectionFromKeys(selectedKeys)
  const subTagSuggestions = useMemo(
    () => getStyleSubTagSuggestions(resolvedDirection, selectedKeys, category || null),
    [resolvedDirection, selectedKeys, category],
  )
  const extraSuggestions = useMemo(
    () => (category ? getTagSuggestions(category, selectedKeys, { directionId: resolvedDirection }) : []),
    [category, selectedKeys, resolvedDirection],
  )

  useEffect(() => {
    if (!open) return
    if (item) {
      setImageDataUrl(item.imageDataUrl)
      setCategory(item.category)
      setSeasons(Array.isArray(item.seasons) ? [...item.seasons] : [])
      const normalized = normalizeTags(item.tags ?? item.tagKeys ?? [])
      setTags(normalized.tags)
      setActiveDirection(detectDirectionFromKeys(normalized.tagKeys))
      setTagInput('')
      setError('')
      setConfirmRemove(false)
    } else {
      setImageDataUrl(EMPTY_FORM.imageDataUrl)
      setCategory(EMPTY_FORM.category)
      setSeasons(EMPTY_FORM.seasons)
      setTagInput(EMPTY_FORM.tagInput)
      setTags(EMPTY_FORM.tags)
      setActiveDirection(null)
      setError(EMPTY_FORM.error)
      setConfirmRemove(false)
    }
  }, [open, item])

  if (!open) return null

  function reset() {
    setImageDataUrl(EMPTY_FORM.imageDataUrl)
    setCategory(EMPTY_FORM.category)
    setSeasons(EMPTY_FORM.seasons)
    setTagInput(EMPTY_FORM.tagInput)
    setTags(EMPTY_FORM.tags)
    setActiveDirection(null)
    setError(EMPTY_FORM.error)
    setConfirmRemove(false)
  }

  function handleRemove() {
    if (!item || !onRemove) return
    if (!confirmRemove) {
      setConfirmRemove(true)
      return
    }
    onRemove(item.id)
    reset()
    onClose()
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Bitte ein Bild wählen.')
      return
    }
    setError('')
    const dataUrl = await readImageFile(file)
    setImageDataUrl(dataUrl)
  }

  function toggleSeason(id) {
    setSeasons((prev) => {
      if (id === 'allYear') return prev.includes('allYear') ? [] : ['allYear']
      const withoutAllYear = prev.filter((s) => s !== 'allYear')
      return withoutAllYear.includes(id)
        ? withoutAllYear.filter((s) => s !== id)
        : [...withoutAllYear, id]
    })
  }

  function addTagsFromInput() {
    const parsed = parseTagsInput(tagInput)
    if (!parsed.length) return
    setTags((prev) => mergeTagLabels(prev, parsed))
    setTagInput('')
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTagsFromInput()
    }
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function addSuggestion(label) {
    setTags((prev) => mergeTagLabels(prev, [label]))
  }

  function selectDirection(directionId) {
    const dir = getDirectionById(directionId)
    if (!dir) return
    setActiveDirection(directionId)
    const anchor = getDirectionAnchorTag(directionId)
    const { tagKeys } = normalizeTags(tags)
    const withoutDir = tagKeys.filter(
      (k) => !k.startsWith('dir:') && k !== 'dir:trendy' && k !== 'dir:party' && k !== 'dir:home',
    )
    let nextKeys = applyExclusiveTagKeys(withoutDir, dir.tagKey)
    if (anchor) nextKeys = applyExclusiveTagKeys(nextKeys, anchor)
    setTags(tagsFromKeys(nextKeys))
  }

  function addSubTag(key) {
    addSuggestion(tagKeyToLabel(key))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!imageDataUrl) {
      setError('Bitte ein Foto hinzufügen.')
      return
    }
    if (!category) {
      setError('Bitte eine Kategorie wählen.')
      return
    }
    if (!seasons.length) {
      setError('Bitte mindestens eine Saison wählen.')
      return
    }
    const pending = parseTagsInput(tagInput)
    const allTags = mergeTagLabels(tags, pending)
    const draft = { imageDataUrl, category, seasons, tags: allTags }

    if (isEdit) {
      onUpdate(item.id, draft)
    } else {
      onSave(draft)
    }
    reset()
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={handleClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="item-form-title" className="modal-title">
            {isEdit ? `Teil bearbeiten · Nr. ${item.displayNumber}` : 'Teil hinzufügen'}
          </h2>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Schließen">
            ×
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`photo-picker${imageDataUrl ? ' photo-picker--has-image' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Vorschau" className="photo-picker-img" />
            ) : (
              <>
                <span className="photo-picker-icon">📷</span>
                <span className="photo-picker-label">Foto wählen</span>
              </>
            )}
          </button>
          {isEdit && (
            <p className="photo-picker-hint">Tippe auf das Bild, um das Foto zu ersetzen</p>
          )}

          <fieldset className="modal-field">
            <legend className="section-label">Kategorie</legend>
            <div className="pill-row pill-row--wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`pill pill--selectable${category === cat.id ? ' pill--selected' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="modal-field">
            <legend className="section-label">Saison</legend>
            <div className="pill-row pill-row--wrap">
              {SEASONS.map((season) => (
                <button
                  key={season.id}
                  type="button"
                  className={`pill pill--selectable${seasons.includes(season.id) ? ' pill--selected' : ''}`}
                  onClick={() => toggleSeason(season.id)}
                >
                  {season.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="modal-field">
            <legend className="section-label">Stil-Richtung</legend>
            <p className="tag-direction-hint">
              {category
                ? 'Richtung wählen – Vorschläge passen zu deiner Kategorie.'
                : 'Richtung wählen, danach Kategorie – für passendere Tags.'}
            </p>
            <div className="pill-row pill-row--wrap">
              {STANDARD_STYLE_DIRECTIONS.map((dir) => (
                <button
                  key={dir.id}
                  type="button"
                  className={`pill pill--direction${resolvedDirection === dir.id ? ' pill--selected' : ''}`}
                  onClick={() => selectDirection(dir.id)}
                  aria-pressed={resolvedDirection === dir.id}
                >
                  {dir.label}
                </button>
              ))}
            </div>
            {resolvedDirection && subTagSuggestions.length > 0 && (
              <div className="tag-subsection">
                <span className="tag-subsection-label">
                  {category ? `Passend zu ${CATEGORIES.find((c) => c.id === category)?.label}` : 'Konkreter'}
                </span>
                <div className="pill-row pill-row--wrap tag-suggestions">
                  {subTagSuggestions.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className="pill pill--suggestion"
                      onClick={() => addSubTag(s.key)}
                    >
                      + {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </fieldset>

          <div className="modal-field">
            <label className="section-label" htmlFor="tags-input">
              Farbe &amp; Typ {isEdit ? '(optional)' : ''}
            </label>
            {extraSuggestions.length > 0 && (
              <div className="pill-row pill-row--wrap tag-suggestions">
                {extraSuggestions.slice(0, 10).map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className="pill pill--suggestion"
                    onClick={() => addSuggestion(s.label)}
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
            )}
            <div className="tag-input-row">
              <input
                id="tags-input"
                type="text"
                className="text-input"
                placeholder="z.B. Jeans, Schwarz, Baggy"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTagsFromInput}
              />
            </div>
            {tags.length > 0 && (
              <div className="pill-row pill-row--wrap tag-chips">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="pill pill--tag"
                    onClick={() => removeTag(tag)}
                    aria-label={`Tag ${tag} entfernen`}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            {isEdit && onRemove && (
              <button
                type="button"
                className={`btn btn--remove${confirmRemove ? ' btn--remove-confirm' : ''}`}
                onClick={handleRemove}
                onBlur={() => setConfirmRemove(false)}
              >
                {confirmRemove ? 'Wirklich auslagern?' : 'Auslagern'}
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn btn--ghost" onClick={handleClose}>
                Abbrechen
              </button>
              <button type="submit" className="btn btn--primary">
                {isEdit ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
