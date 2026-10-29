import { createContext, useContext } from 'react'
import type { Answers, FieldAnswer, FieldResult, Results } from '../../shared/types'
import { InkField } from './ink/InkField'

export interface LessonCtx {
  answers: Answers
  setAnswer: (fieldId: string, patch: Partial<FieldAnswer>) => void
  results?: Results // set once the exercise was submitted
  rate: (fieldId: string, score: number) => void
  input: 'pen' | 'keyboard'
  fingerDraw: boolean
}

export const Ctx = createContext<LessonCtx>(null!)
export const useLesson = () => useContext(Ctx)

const ICON: Record<string, string> = { correct: '✓', partially_correct: '≈', incorrect: '✗', empty: '✗', illegible: '?', self_check: '?' }

export function verdictClass(r?: FieldResult) {
  if (!r) return ''
  if (r.verdict === 'correct') return 'v-ok'
  if (r.verdict === 'partially_correct') return 'v-part'
  if (r.verdict === 'self_check' || r.verdict === 'illegible') return 'v-open'
  return 'v-bad'
}

interface FieldProps {
  id: string
  inline?: boolean
  chars?: number // expected length, sets the width of inline gaps
  label?: string
  placeholder?: string
}

// One answer spot: pencil canvas or text input, plus its feedback after submitting.
export function AnswerField({ id, inline, chars = 10, label, placeholder }: FieldProps) {
  const { answers, setAnswer, results, input, fingerDraw } = useLesson()
  const a = answers[id] ?? {}
  const r = results?.[id]
  const locked = !!results
  const width = inline ? Math.max(70, chars * 13) : undefined
  const usePen = input === 'pen' && !a.text

  const field = usePen ? (
    <InkField value={a.strokes} onChange={(strokes) => setAnswer(id, { strokes })} fingerDraw={fingerDraw} inline={inline} minWidth={width} label={label} disabled={locked} />
  ) : (
    <input
      className={`txt ${inline ? 'txt-inline' : 'txt-line'}`}
      style={inline ? { width } : undefined}
      value={a.text ?? ''}
      disabled={locked}
      aria-label={label ?? 'Antwort'}
      placeholder={placeholder}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
      onChange={(e) => setAnswer(id, { text: e.target.value })}
    />
  )

  if (inline) {
    return (
      <span className={`field-inline ${verdictClass(r)}`}>
        {field}
        {r && <InlineFeedback id={id} r={r} />}
      </span>
    )
  }
  return (
    <div className={`field-line ${verdictClass(r)}`}>
      {label && <span className="field-label">{label}</span>}
      <div className="field-body">
        {field}
        {r && <LineFeedback id={id} r={r} />}
      </div>
    </div>
  )
}

function InlineFeedback({ id, r }: { id: string; r: FieldResult }) {
  return (
    <>
      <span className="v-icon" aria-label={r.verdict}>{ICON[r.verdict]}</span>
      {r.verdict !== 'correct' && r.corrected && <span className="fix-inline">{r.corrected}</span>}
      {r.verdict === 'self_check' && <SelfCheck id={id} />}
    </>
  )
}

export function LineFeedback({ id, r }: { id: string; r: FieldResult }) {
  const { input } = useLesson()
  // typed answers need no "read as" echo when they are right
  if (r.verdict === 'correct' && (input === 'keyboard' || !r.transcription)) return <div className="fb"><span className="v-icon">✓</span></div>
  return (
    <div className="fb">
      <span className="v-icon">{ICON[r.verdict]}</span>
      <div>
        {r.transcription && r.verdict !== 'correct' && r.transcription !== '—' && <div className="fb-yours">Du: „{r.transcription}“</div>}
        {r.verdict === 'correct' && r.transcription !== '—' && <div className="fb-yours">Gelesen: „{r.transcription}“</div>}
        {r.verdict !== 'correct' && r.corrected && <div className="fb-fix">{r.verdict === 'self_check' ? 'Beispiel: ' : 'Richtig: '}{r.corrected}</div>}
        {r.verdict === 'illegible' && <div className="fb-tip">Konnte ich nicht lesen – schreib es beim nächsten Mal etwas deutlicher. Keine Punkte abgezogen.</div>}
        {r.feedback && r.verdict !== 'illegible' && <div className="fb-tip">{r.feedback}</div>}
        {r.verdict === 'self_check' && <SelfCheck id={id} />}
      </div>
    </div>
  )
}

function SelfCheck({ id }: { id: string }) {
  const { rate } = useLesson()
  return (
    <span className="selfcheck">
      <span>Selbst prüfen:</span>
      <button type="button" onClick={() => rate(id, 1)}>✓ passt</button>
      <button type="button" onClick={() => rate(id, 0.5)}>≈ fast</button>
      <button type="button" onClick={() => rate(id, 0)}>✗ falsch</button>
    </span>
  )
}

// Printed prompt text: [[underlined]] parts.
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[\[.*?\]\])/g)
  return (
    <>
      {parts.map((p, i) => (p.startsWith('[[') ? <u key={i}>{p.slice(2, -2)}</u> : <span key={i}>{p}</span>))}
    </>
  )
}
