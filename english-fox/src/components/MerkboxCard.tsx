import type { Merkbox } from '../../shared/types'

// Head of the worksheet: arrow = usage, smileys = form, key = signal words.
export function MerkboxCard({ m }: { m: Merkbox }) {
  return (
    <div className="merkbox">
      <div className="mb-usage">
        <span className="mb-icon" aria-hidden>➜</span>
        <span>{m.usage}</span>
        {m.be && <span className="mb-be">be: <strong>{m.be}</strong></span>}
      </div>
      <div className="mb-forms">
        <div><span className="mb-sym">☺</span><strong>{m.positive}</strong></div>
        <div><span className="mb-sym">☹</span><strong>{m.negative}</strong></div>
        <div><span className="mb-sym">?</span><strong>{m.question}</strong></div>
      </div>
      <div className="mb-signal">
        <span className="mb-icon" aria-hidden>🗝</span>
        <span>{m.signal_words.join(', ')}</span>
      </div>
      {m.notes?.map((n) => <p key={n} className="mb-note">{n}</p>)}
    </div>
  )
}
