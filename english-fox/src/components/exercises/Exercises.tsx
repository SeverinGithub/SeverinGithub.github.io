import { useState, type ReactNode } from 'react'
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
function GapSentence({ ex, item }: { ex: Exercise; item: Item }) {
  const { answers, setAnswer, results } = useLesson()
  const tokens = tokenize(item.text ?? '')
  const sigId = `${item.id}.sig`
  const picked = answers[sigId]?.tokens ?? []
  const sigResult = results?.[sigId]
  let gap = 0
  const toggle = (i: number) => {
    if (results) return
    setAnswer(sigId, { tokens: picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i] })
  }
  return (
    <span className="sentence">
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
              <button type="button" className={`word ${on ? 'word-hl' : ''}`} onClick={() => toggle(i)} aria-pressed={on}>{t}</button>{' '}
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
      {ex.signal && <p className="hint">Tippe die Signalwörter an, um sie zu markieren.</p>}
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
function WordOrder({ ex }: Props) {
  const { answers, setAnswer, results } = useLesson()
  return (
    <ol className="items">
      {ex.items.map((item, n) => {
        const id = `${item.id}.wo`
        const order = answers[id]?.order ?? []
        const r = results?.[id]
        const words = item.words ?? []
        return (
          <li key={item.id} className="item item-col">
            <div className="row">
              <Num n={n + 1} />
              <div className="chips">
                {words.map((w, i) => (
                  <button key={i} type="button" className={`chip ${order.includes(i) ? 'chip-used' : ''}`} disabled={!!results || order.includes(i)} onClick={() => setAnswer(id, { order: [...order, i] })}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div className={`wo-line ${verdictClass(r)}`}>
              {order.length === 0 && <span className="muted">Tippe die Wörter in der richtigen Reihenfolge an …</span>}
              {order.map((i, k) => (
                <button key={k} type="button" className="chip chip-on" disabled={!!results} onClick={() => setAnswer(id, { order: order.filter((_, j) => j !== k) })}>
                  {words[i]}
                </button>
              ))}
            </div>
            {r && <LineFeedback id={id} r={r} />}
          </li>
        )
      })}
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
