import { Fragment, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { Exercise, Item } from '../../../shared/types'
import { gridColumns } from '../../../shared/fields'
import { tokenize } from '../../../shared/match'
import { AnswerField, LineFeedback, Rich, useLesson, verdictClass } from '../LessonContext'
import { ParkScene } from '../ParkScene'

type Props = { ex: Exercise }

const timelineIcons: Record<string, { icon: string; label: string }> = {
  shower: { icon: '🚿', label: 'Dusche' },
  school: { icon: '🏫', label: 'Schule' },
  guitar: { icon: '🎸', label: 'Gitarre' },
  pizza: { icon: '🍕', label: 'Pizza' },
  tv: { icon: '📺', label: 'Fernsehen' },
}

function Num({ n }: { n: number }) {
  return <span className="num">{n}.</span>
}

// ---------- gap fill (+ signal words, word box, cards, timeline) ----------
// Signal words: tap them, or (pen / mouse) draw across several words to mark them in one stroke.
function GapSentence({ ex, item }: { ex: Exercise; item: Item }) {
  const { answers, setAnswer, results, input, fingerDraw } = useLesson()
  const tokens = tokenize(item.text ?? '')
  const sigId = `${item.id}.sig`
  const picked = answers[sigId]?.tokens ?? []
  const sigResult = results?.[sigId]
  const paint = useRef<{ value: boolean; set: Set<number> } | null>(null)
  const tapStart = useRef<number | null>(null)
  const paintTouch = input === 'pen' && fingerDraw
  let gap = 0
  const toggle = (i: number) => {
    if (results) return
    setAnswer(sigId, { tokens: picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i] })
  }
  const mark = (i: number) => {
    const p = paint.current
    if (!p || p.set.has(i) === p.value) return
    if (p.value) p.set.add(i); else p.set.delete(i)
    setAnswer(sigId, { tokens: [...p.set] })
  }
  const down = (e: ReactPointerEvent, i: number) => {
    if (results || e.button > 0) return
    if (e.pointerType === 'touch' && !paintTouch) { tapStart.current = i; return } // fingers scroll; a tap toggles on release
    paint.current = { value: !picked.includes(i), set: new Set(picked) }
    mark(i)
  }
  const move = (e: ReactPointerEvent) => {
    if (!paint.current) return
    const el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-sig]')
    if (el && el.dataset.item === item.id) mark(Number(el.dataset.sig))
  }
  const up = (i?: number) => {
    if (tapStart.current !== null && tapStart.current === i) toggle(i)
    tapStart.current = null
    paint.current = null
  }
  return (
    <span className="sentence" onPointerMove={move} onPointerUp={() => up()} onPointerCancel={() => up()}>
      {tokens.map((t, i) => {
        if (t.includes('{}')) {
          const [pre, post] = t.split('{}')
          const g = gap++
          return (
            <span key={i} className="tok">
              {pre}
              <AnswerField id={`${item.id}.g${g}`} inline chars={11} />
              {post}{' '}
            </span>
          )
        }
        if (ex.signal && !/^\(.*\)?$/.test(t)) {
          const on = picked.includes(i)
          return (
            <span key={i}>
              <button
                type="button"
                data-sig={i}
                data-item={item.id}
                className={`word ${on ? 'word-hl' : ''} ${input === 'pen' ? 'word-paint' : ''}`}
                onPointerDown={(e) => down(e, i)}
                onPointerUp={(e) => { e.stopPropagation(); up(i) }}
                onClick={(e) => { if (e.detail === 0) toggle(i) }}
                aria-pressed={on}
              >
                {t}
              </button>{' '}
            </span>
          )
        }
        return <span key={i} className="tok">{t} </span>
      })}
      {sigResult && sigResult.verdict !== 'correct' && <span className="fix-inline">Signalwort: {sigResult.corrected}</span>}
    </span>
  )
}

function GapFill({ ex }: Props) {
  const [used, setUsed] = useState<number[]>([])
  return (
    <div>
      {ex.signal && <p className="hint">Markiere die Signalwörter: antippen oder mit dem Stift darüberstreichen.</p>}
      {ex.timeline && (
        <div className="timeline" aria-label="Zeitleiste">
          {ex.timeline.map((k, i) => (
            <div key={k} className="tl-step">
              <span className="tl-icon">{timelineIcons[k]?.icon}</span>
              <span className="tl-label">{timelineIcons[k]?.label}</span>
              {i < ex.timeline!.length - 1 && <span className="tl-arrow">→</span>}
            </div>
          ))}
        </div>
      )}
      {ex.wordbox && (
        <div className="wordbox">
          {ex.wordbox.map((w, i) => (
            <button key={i} type="button" className={`chip ${used.includes(i) ? 'chip-used' : ''}`} onClick={() => setUsed((u) => (u.includes(i) ? u.filter((x) => x !== i) : [...u, i]))}>
              {w}
            </button>
          ))}
        </div>
      )}
      <ol className={ex.cards ? 'cards' : 'items'}>
        {ex.items.map((item, n) => (
          <li key={item.id} className={ex.cards ? 'card' : 'item'}>
            {ex.cards ? item.context && <span className="card-verb">{item.context}</span> : <Num n={n + 1} />}
            <GapSentence ex={ex} item={item} />
          </li>
        ))}
      </ol>
    </div>
  )
}

// ---------- multiple choice ----------
function Circle() {
  return (
    <svg className="circle" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
      <path d="M8 22 C 6 6, 70 2, 92 14 C 102 24, 80 38, 46 37 C 16 36, 4 28, 14 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function MultipleChoice({ ex }: Props) {
  const { answers, setAnswer, results } = useLesson()
  return (
    <ol className="items">
      {ex.items.map((item, n) => {
        const id = `${item.id}.mc`
        const choice = answers[id]?.choice
        const r = results?.[id]
        const [before, after] = (item.text ?? '').split(/_{3,}(.*)/s)
        return (
          <li key={item.id} className={`item ${verdictClass(r)}`}>
            <Num n={n + 1} />
            <div>
              <div className="sentence">
                {before}<span className="blank">{choice !== undefined ? item.options![choice] : '_____'}</span>{after}
              </div>
              <div className="options">
                {item.options!.map((o, i) => (
                  <button key={i} type="button" disabled={!!results} className={`opt ${choice === i ? 'opt-on' : ''}`} onClick={() => setAnswer(id, { choice: i })}>
                    {o}
                    {choice === i && <Circle />}
                  </button>
                ))}
              </div>
              {r && r.verdict !== 'correct' && <div className="fb-fix">Richtig: {r.corrected}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ---------- error correction ----------
function ErrorCorrection({ ex }: Props) {
  const { answers, setAnswer, results } = useLesson()
  return (
    <>
      <p className="hint">1. Tippe das falsche Wort an{ex.noError ? ' – oder „Kein Fehler“' : ''}. 2. Schreib den ganzen Satz richtig.</p>
      <ol className="items">
        {ex.items.map((item, n) => {
          const wid = `${item.id}.w`
          const a = answers[wid] ?? {}
          const picked = a.tokens ?? []
          const rw = results?.[wid]
          return (
            <li key={item.id} className="item item-col">
              <div className="row">
                <Num n={n + 1} />
                <span className={`sentence ${verdictClass(rw)}`}>
                  {tokenize(item.text ?? '').map((t, i) => (
                    <span key={i}>
                      <button type="button" disabled={!!results} className={`word ${picked.includes(i) ? 'word-x' : ''}`} onClick={() => setAnswer(wid, { noError: false, tokens: picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i] })}>
                        {t}
                      </button>{' '}
                    </span>
                  ))}
                </span>
                {ex.noError && (
                  <button type="button" disabled={!!results} className={`chip ${a.noError ? 'chip-on' : ''}`} onClick={() => setAnswer(wid, { noError: !a.noError, tokens: [] })}>
                    Kein Fehler
                  </button>
                )}
              </div>
              {rw && rw.verdict !== 'correct' && <div className="fb-fix">Fehler: {rw.corrected}</div>}
              {!a.noError && <AnswerField id={`${item.id}.s`} label="✎" placeholder="Satz richtig schreiben" />}
            </li>
          )
        })}
      </ol>
    </>
  )
}

// ---------- write (rewrite, questions, translate, pairs, finish sentences) ----------
function Write({ ex }: Props) {
  const pair = (ex.fields?.length ?? 0) > 1
  return (
    <>
      {ex.hint && <p className="hint">{ex.hint}</p>}
      {pair && (
        <div className="pair-head">
          {ex.fields!.map((f) => <span key={f}>{f}</span>)}
        </div>
      )}
      <ol className="items">
        {ex.items.map((item, n) => {
          const labels = item.fields ?? ex.fields ?? ['']
          if (ex.inline) {
            return (
              <li key={item.id} className="item item-inline">
                <span className="prompt"><Rich text={item.prompt ?? ''} /></span>
                <AnswerField id={`${item.id}.f0`} />
              </li>
            )
          }
          return (
            <li key={item.id} className="item item-col">
              <div className={pair ? 'prompt prompt-center' : 'prompt'}>
                {!pair && <Num n={n + 1} />}
                <Rich text={item.prompt ?? ''} />
              </div>
              <div className={pair ? 'pair' : ''}>
                {labels.map((l, i) => (
                  <AnswerField key={i} id={`${item.id}.f${i}`} label={pair ? undefined : l || undefined} />
                ))}
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}

// ---------- table ----------
function Table({ ex }: Props) {
  const cols = (ex.columns ?? ['']) as string[]
  const headed = cols.some(Boolean)
  return (
    <>
      {ex.irregularLink && (
        <p className="hint">
          Unregelmäßige Verben findest du unter <a href="#/reference/irregular">Nachschlagen → Unregelmäßige Verben</a>.
        </p>
      )}
      <div className={`table ${cols.length > 1 ? 'table-wide' : ''}`}>
        {headed && (
          <div className="trow thead" style={{ gridTemplateColumns: `minmax(90px, 0.6fr) repeat(${cols.length}, 1fr)` }}>
            <span />
            {cols.map((c) => <span key={c}>{c}</span>)}
          </div>
        )}
        {ex.items.map((item) => (
          <div key={item.id} className="trow" style={{ gridTemplateColumns: `minmax(90px, 0.6fr) repeat(${cols.length}, 1fr)` }}>
            <span className="tcell-prompt">{item.prompt}</span>
            {cols.map((_, i) => <AnswerField key={i} id={`${item.id}.c${i}`} />)}
          </div>
        ))}
      </div>
    </>
  )
}

// ---------- word order ----------
// Tap a chip to add/remove it, or drag it: from the pool into the line, or within the line to reorder.
interface Drag { src: 'pool' | 'line'; k: number; word: number; sx: number; sy: number; x: number; y: number; on: boolean; at: number | null }

function WordOrderItem({ item, n }: { item: Item; n: number }) {
  const { answers, setAnswer, results } = useLesson()
  const id = `${item.id}.wo`
  const order = answers[id]?.order ?? []
  const r = results?.[id]
  const words = item.words ?? []
  const lineRef = useRef<HTMLDivElement>(null)
  // the drag lives in a ref so fast pointer events never see a stale value; state only re-renders
  const dragRef = useRef<Drag | null>(null)
  const [drag, setDragState] = useState<Drag | null>(null)
  const setDrag = (d: Drag | null) => { dragRef.current = d; setDragState(d) }
  const locked = !!results

  const rest = (d: Drag) => (d.src === 'line' ? order.filter((_, j) => j !== d.k) : order)
  // where in the line (without the dragged chip) the pointer would drop
  const dropIndex = (d: Drag, x: number, y: number): number | null => {
    const line = lineRef.current
    if (!line) return null
    const box = line.getBoundingClientRect()
    if (x < box.left - 24 || x > box.right + 24 || y < box.top - 28 || y > box.bottom + 28) return null
    let j = 0
    for (const el of Array.from(line.querySelectorAll<HTMLElement>('[data-k]'))) {
      if (d.src === 'line' && Number(el.dataset.k) === d.k) continue
      const c = el.getBoundingClientRect()
      if (y < c.top || (y <= c.bottom && x < c.left + c.width / 2)) return j
      j++
    }
    return j
  }

  const down = (e: ReactPointerEvent, src: Drag['src'], k: number, word: number) => {
    if (locked || e.button > 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ src, k, word, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, on: false, at: null })
  }
  const move = (e: ReactPointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const on = drag.on || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8
    setDrag({ ...drag, x: e.clientX, y: e.clientY, on, at: on ? dropIndex(drag, e.clientX, e.clientY) : null })
  }
  const up = () => {
    const d = dragRef.current
    setDrag(null)
    if (!d) return
    if (!d.on) return tap(d.src, d.k, d.word) // a plain tap
    const list = rest(d)
    if (d.at === null) { if (d.src === 'line') setAnswer(id, { order: list }); return }
    setAnswer(id, { order: [...list.slice(0, d.at), d.word, ...list.slice(d.at)] })
  }
  const tap = (src: Drag['src'], k: number, word: number) => {
    if (locked) return
    if (src === 'pool') { if (!order.includes(word)) setAnswer(id, { order: [...order, word] }) }
    else setAnswer(id, { order: order.filter((_, j) => j !== k) })
  }
  const handlers = (src: Drag['src'], k: number, word: number) => ({
    onPointerDown: (e: ReactPointerEvent) => down(e, src, k, word),
    onPointerMove: move,
    onPointerUp: up,
    onPointerCancel: () => setDrag(null),
    onClick: (e: ReactMouseEvent) => { if (e.detail === 0) tap(src, k, word) }, // keyboard
  })

  const lifted = drag?.on && drag.src === 'line' ? drag.k : -1
  const caretAt = drag?.on ? drag.at : null
  let j = 0 // position among the chips that stay in the line
  return (
    <li className="item item-col">
      <div className="row">
        <Num n={n + 1} />
        <div className="chips">
          {words.map((w, i) => (
            <button key={i} type="button" className={`chip chip-drag ${order.includes(i) ? 'chip-used' : ''}`} disabled={locked || order.includes(i)} {...handlers('pool', i, i)}>
              {w}
            </button>
          ))}
        </div>
      </div>
      <div ref={lineRef} className={`wo-line ${verdictClass(r)} ${caretAt !== null ? 'wo-target' : ''}`}>
        {order.length === 0 && caretAt === null && <span className="muted">Tippe die Wörter an oder zieh sie hierher …</span>}
        {order.map((wi, k) => {
          const caret = k !== lifted && caretAt === j
          if (k !== lifted) j++
          return (
            <Fragment key={k}>
              {caret && <span className="wo-caret" aria-hidden />}
              <button type="button" data-k={k} className={`chip chip-on chip-drag ${k === lifted ? 'chip-lifted' : ''}`} disabled={locked} {...handlers('line', k, wi)}>
                {words[wi]}
              </button>
            </Fragment>
          )
        })}
        {caretAt !== null && caretAt >= j && <span className="wo-caret" aria-hidden />}
      </div>
      {drag?.on && <span className="chip chip-on chip-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden>{words[drag.word]}</span>}
      {r && <LineFeedback id={id} r={r} />}
    </li>
  )
}

function WordOrder({ ex }: Props) {
  return (
    <ol className="items">
      {ex.items.map((item, n) => <WordOrderItem key={item.id} item={item} n={n} />)}
    </ol>
  )
}

// ---------- picture description ----------
function Picture({ ex }: Props) {
  return (
    <div className="picture">
      <figure>
        <ParkScene />
        {ex.hint && <figcaption>{ex.hint}</figcaption>}
      </figure>
      <ol className="items">
        {Array.from({ length: ex.lines ?? 5 }, (_, i) => (
          <li key={i} className="item">
            <Num n={i + 1} />
            <AnswerField id={`${ex.id}.l${i}`} />
          </li>
        ))}
      </ol>
      <p className="hint">Schreib so viele Sätze, wie du kannst. Gewertet werden die Zeilen, die du ausfüllst.</p>
    </div>
  )
}

// ---------- mixed tenses grid ----------
function Grid({ ex }: Props) {
  const { answers, setAnswer, results } = useLesson()
  const cols = gridColumns(ex)
  const tenses = ex.tenses ?? []
  return (
    <>
      <p className="hint">Erkenne die Zeitform des Satzes und schreibe ihn in alle anderen Zeitformen. Leere Spaltenköpfe: Zeitform auswählen. Letzte Zeile: Signalwörter.</p>
      <div className="grid-scroll">
        <table className="mgrid">
          <thead>
            <tr>
              {cols.map((c, i) => {
                const id = `${ex.id}.h${i}`
                const r = results?.[id]
                return (
                  <th key={i} className={verdictClass(r)}>
                    {c.label ?? (
                      <select value={answers[id]?.choice ?? ''} disabled={!!results} onChange={(e) => setAnswer(id, { choice: e.target.value === '' ? undefined : Number(e.target.value) })} aria-label={`Zeitform Spalte ${i + 1}`}>
                        <option value="">Zeitform?</option>
                        {tenses.map((t, k) => <option key={k} value={k}>{t}</option>)}
                      </select>
                    )}
                    {r && r.verdict !== 'correct' && <div className="fix-inline">{r.corrected}</div>}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {ex.items.map((item) => (
              <tr key={item.id} className={item.signal ? 'signal-row' : ''}>
                {cols.map((_, i) => {
                  const given = item.given?.[String(i)]
                  return <td key={i}>{given ? <span className="given">{given}</span> : <AnswerField id={`${item.id}.c${i}`} placeholder={item.signal ? 'Signalwörter' : ''} />}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export const exerciseRegistry: Record<Exercise['type'], (p: Props) => ReactNode> = {
  gap_fill: GapFill,
  multiple_choice: MultipleChoice,
  error_correction: ErrorCorrection,
  write: Write,
  table: Table,
  word_order: WordOrder,
  picture: Picture,
  grid: Grid,
}
