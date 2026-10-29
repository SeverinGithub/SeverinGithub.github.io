import { useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { Answers, FieldAnswer, Lesson, Results, SolutionMap } from '../../shared/types'
import { fieldIds, itemsOf } from '../../shared/fields'
import { tagLabel, tagTip } from '../../shared/errorTags'
import { Ctx } from '../components/LessonContext'
import { exerciseRegistry } from '../components/exercises/Exercises'
import { Mascot } from '../components/Mascot'
import { MerkboxCard } from '../components/MerkboxCard'
import { Stars } from '../components/Stars'
import { evaluateInk, evaluateLocal, exerciseScore, isAnswered } from '../lib/evaluate'
import { playSound } from '../lib/sound'
import { scoring, starsFor } from '../config/scoring'
import { theme } from '../config/theme'
import { brand, foxGenitive } from '../config/brand'
import { useStore, type Mistake } from '../store'
import { go } from '../router'

type Phase = 'intro' | 'exercise' | 'checking' | 'feedback' | 'result'

interface Props {
  lesson: Lesson
  sol: SolutionMap
  practice?: boolean
  nextLessonId?: string
}

export function LessonRunner({ lesson, sol, practice, nextLessonId }: Props) {
  const settings = useStore((s) => s.settings)
  const finishAttempt = useStore((s) => s.finishAttempt)
  const streak = useStore((s) => s.streak)
  const [phase, setPhase] = useState<Phase>(practice ? 'exercise' : 'intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [results, setResults] = useState<Results>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [showMerkbox, setShowMerkbox] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const startedAt = useRef(new Date().toISOString())
  const scrollRef = useRef<HTMLDivElement>(null)

  const ex = lesson.exercises[idx]
  const input: 'pen' | 'keyboard' = settings.inputMode === 'keyboard' ? 'keyboard' : settings.inputMode === 'pen' ? 'pen' : settings.evalUrl ? 'pen' : 'keyboard'

  const ctx = useMemo(
    () => ({
      answers,
      setAnswer: (id: string, patch: Partial<FieldAnswer>) => setAnswers((a) => ({ ...a, [id]: { ...a[id], ...patch } })),
      results: checked[ex?.id] ? results : undefined,
      rate: (id: string, score: number) =>
        setResults((r) => ({ ...r, [id]: { ...r[id], verdict: score === 1 ? 'correct' : score > 0 ? 'partially_correct' : 'incorrect', score } })),
      input,
      fingerDraw: settings.fingerDraw,
    }),
    [answers, results, checked, ex?.id, input, settings.fingerDraw],
  )

  const allFields = ex ? itemsOf(ex).flatMap((item) => fieldIds(ex, item, sol, answers).map((f) => ({ item, f }))) : []
  const complete = ex?.type === 'picture' ? allFields.some(({ item, f }) => isAnswered(ex, item, f, answers)) : allFields.every(({ item, f }) => isAnswered(ex, item, f, answers))
  const openRatings = checked[ex?.id] && allFields.some(({ f }) => results[f.id]?.verdict === 'self_check')

  const submit = async (skip = false) => {
    setError('')
    if (skip) {
      const r: Results = {}
      for (const { f } of allFields) r[f.id] = { verdict: 'empty', score: 0, tags: [] }
      setResults((x) => ({ ...x, ...r }))
      setChecked((c) => ({ ...c, [ex.id]: true }))
      setPhase('feedback')
      return
    }
    const { results: local, ink } = evaluateLocal(lesson, ex, answers, sol)
    let merged = local
    if (ink.length) {
      if (!settings.evalUrl) {
        setError('Für Handschrift-Auswertung fehlt die Verbindung zur KI. Stell im Profil auf Tastatur um oder trag die KI-Adresse ein.')
        return
      }
      setPhase('checking')
      try {
        merged = { ...local, ...(await evaluateInk(lesson, ex, ink, answers, settings)) }
      } catch (e) {
        setPhase('exercise')
        setError(`${(e as Error).message} Deine Antworten sind gespeichert – versuch es gleich nochmal.`)
        return
      }
    }
    setResults((x) => ({ ...x, ...merged }))
    setChecked((c) => ({ ...c, [ex.id]: true }))
    const sc = exerciseScore(ex, { ...results, ...merged }, sol, answers)
    if (settings.sound) playSound(sc.total / sc.count >= 0.7 ? 'good' : 'meh')
    setPhase('feedback')
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => {
    if (idx < lesson.exercises.length - 1) {
      setIdx(idx + 1)
      setPhase('exercise')
      scrollRef.current?.scrollTo({ top: 0 })
      return
    }
    finish()
  }

  const finish = () => {
    let total = 0, count = 0, correctItems = 0
    const perEx: { id: string; title: string; score: number }[] = []
    const mistakes: Omit<Mistake, 'dueAt' | 'stage' | 'resolved' | 'lastSeen'>[] = []
    const solved: string[] = []
    const tagCount: Record<string, number> = {}
    for (const e of lesson.exercises) {
      const sc = exerciseScore(e, results, sol, answers)
      total += sc.total
      count += sc.count
      perEx.push({ id: e.id, title: e.title, score: sc.count ? sc.total / sc.count : 0 })
      itemsOf(e).forEach((item, i) => {
        const s = sc.scores[i] ?? 0
        if (s >= 1) { correctItems++; solved.push(item.id); return }
        const fields = fieldIds(e, item, sol, answers)
        const wrong = fields.map((f) => results[f.id]).filter((r) => r && r.score < 1)
        const tags = [...new Set(wrong.flatMap((r) => r!.tags))]
        tags.forEach((t) => (tagCount[t] = (tagCount[t] ?? 0) + 1))
        const w = wrong.find((r) => r?.corrected) ?? wrong[0]
        mistakes.push({ key: item.id, lessonId: item.id.split('-')[0], exerciseId: e.id, itemId: item.id, tags, yours: w?.transcription ?? '', correct: w?.corrected ?? '' })
      })
    }
    const score = count ? total / count : 0
    const stars = practice ? 0 : starsFor(score)
    const xp = practice ? 5 + correctItems : scoring.xpPerLesson + scoring.xpStarBonus[stars] + correctItems * scoring.xpPerCorrectItem
    const finishedAt = new Date().toISOString()
    const topTag = Object.entries(tagCount).sort((a, b) => b[1] - a[1])[0]?.[0]
    finishAttempt(
      { id: crypto.randomUUID(), lessonId: lesson.id, practice, startedAt: startedAt.current, finishedAt, score, stars, xp, exercises: perEx.map(({ id, score }) => ({ id, score })), tags: Object.keys(tagCount) },
      mistakes,
      practice ? solved : [],
    )
    setSummary({ score, stars, xp, perEx, mistakes, topTag, minutes: Math.max(1, Math.round((Date.parse(finishedAt) - Date.parse(startedAt.current)) / 60000)) })
    setPhase('result')
    if (stars === 3) setTimeout(() => confetti({ particleCount: 140, spread: 80, origin: { y: 0.4 }, disableForReducedMotion: true }), 900)
    if (settings.sound) playSound(stars >= 2 || practice ? 'win' : 'meh')
  }

  const quit = () => {
    if (phase === 'result' || window.confirm('Lektion wirklich beenden? Dein Fortschritt in dieser Lektion geht verloren.')) go(practice ? '/practice' : '/learn')
  }

  if (phase === 'result' && summary) {
    return <ResultScreen lesson={lesson} s={summary} practice={practice} nextLessonId={nextLessonId} streak={streak.current} />
  }

  const Comp = ex && exerciseRegistry[ex.type]
  const sc = checked[ex?.id] ? exerciseScore(ex, results, sol, answers) : null

  return (
    <div className="runner">
      <header className="runner-top">
        <button className="icon-btn" onClick={quit} aria-label="Beenden">✕</button>
        <div className="progress" aria-label={`Übung ${idx + 1} von ${lesson.exercises.length}`}>
          <div style={{ width: `${((idx + (checked[ex?.id] ? 1 : 0)) / lesson.exercises.length) * 100}%` }} />
        </div>
        <span className="runner-count">{idx + 1}/{lesson.exercises.length}</span>
        {!practice && <button className="icon-btn" onClick={() => setShowMerkbox(true)} aria-label="Merkbox">💡</button>}
      </header>

      <div className="runner-body" ref={scrollRef}>
        {phase === 'intro' ? (
          <div className="intro">
            <div className="intro-head">
              <Mascot mood="motivated" size={110} />
              <div>
                <p className="eyebrow">{practice ? 'Fehlertraining' : `${theme.unit} ${lesson.unit}`}</p>
                <h1 className="sheet-title">{lesson.title}</h1>
                <p className="muted">{lesson.exercises.length} Übungen · ein Arbeitsblatt</p>
              </div>
            </div>
            <MerkboxCard m={lesson.merkbox} />
            <InputHint input={input} />
          </div>
        ) : (
          <Ctx.Provider value={ctx}>
            <section className={`sheet ${phase === 'checking' ? 'sheet-busy' : ''}`}>
              <h2 className="task-title">{ex.title}</h2>
              {sc && (
                <div className={`ex-score ${sc.total / sc.count >= 0.7 ? 'good' : 'meh'}`}>
                  <Mascot mood={sc.total / sc.count >= 0.9 ? 'happy' : sc.total / sc.count >= 0.5 ? 'neutral' : 'sad'} size={54} />
                  <span>
                    <strong>{Math.round((sc.total / sc.count) * 100)} %</strong> richtig
                    {sc.pending && ' – prüf die offenen Antworten selbst'}
                  </span>
                </div>
              )}
              <Comp ex={ex} />
            </section>
          </Ctx.Provider>
        )}
        {phase === 'checking' && (
          <div className="checking" role="status">
            <Mascot mood="read" size={120} />
            <p>{brand.foxName} liest deine Handschrift …</p>
          </div>
        )}
      </div>

      <footer className="runner-bottom">
        {error && <p className="error">{error}</p>}
        {phase === 'intro' && <button className="btn btn-primary" onClick={() => setPhase('exercise')}>Los geht's</button>}
        {phase === 'exercise' && (
          <>
            <button className="btn btn-ghost" onClick={() => submit(true)}>Überspringen</button>
            <button className="btn btn-primary" disabled={!complete} onClick={() => submit()}>Abgeben</button>
          </>
        )}
        {phase === 'feedback' && (
          <>
            {openRatings && <span className="muted">Bitte bewerte die offenen Antworten selbst.</span>}
            <button className="btn btn-primary" disabled={!!openRatings} onClick={next}>
              {idx < lesson.exercises.length - 1 ? 'Weiter' : 'Auswertung'}
            </button>
          </>
        )}
      </footer>

      {showMerkbox && (
        <div className="sheet-overlay" onClick={() => setShowMerkbox(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <MerkboxCard m={lesson.merkbox} />
            <button className="btn btn-primary" onClick={() => setShowMerkbox(false)}>Schließen</button>
          </div>
        </div>
      )}
    </div>
  )
}

function InputHint({ input }: { input: 'pen' | 'keyboard' }) {
  return input === 'pen' ? (
    <p className="hint">✍️ Schreib mit dem Apple Pencil direkt in die Lücken und Zeilen. Mit dem Finger scrollst du.</p>
  ) : (
    <p className="hint">✍️ Tipp in ein Feld und schreib mit dem Apple Pencil hinein (iPad „Handschrift“/Scribble) – oder nutze die Tastatur.</p>
  )
}

interface Summary {
  score: number
  stars: number
  xp: number
  minutes: number
  perEx: { id: string; title: string; score: number }[]
  mistakes: { itemId: string; tags: string[]; yours: string; correct: string }[]
  topTag?: string
}

function ResultScreen({ lesson, s, practice, nextLessonId, streak }: { lesson: Lesson; s: Summary; practice?: boolean; nextLessonId?: string; streak: number }) {
  const passed = s.stars >= scoring.unlockStars
  const mood = practice ? 'happy' : s.stars === 3 ? 'celebrate' : passed ? 'happy' : 'sad'
  return (
    <div className="result">
      <div className="result-hero">
        <Mascot mood={mood} size={130} />
        <h1>{practice ? 'Training geschafft!' : passed ? 'Lektion geschafft!' : 'Fast geschafft!'}</h1>
        {!practice && <Stars n={s.stars} size={56} animate />}
        {!practice && !passed && <p className="muted">Mit 2 Sternen schaltest du die nächste Lektion frei. Du schaffst das!</p>}
      </div>
      <div className="stat-row">
        <div className="stat"><strong>{Math.round(s.score * 100)} %</strong><span>Genauigkeit</span></div>
        <div className="stat"><strong>+{s.xp}</strong><span>{theme.xp}</span></div>
        <div className="stat"><strong>🔥 {streak}</strong><span>{theme.streak}</span></div>
        <div className="stat"><strong>{s.minutes} min</strong><span>Zeit</span></div>
      </div>
      <section className="panel">
        <h3>Pro Übung</h3>
        {s.perEx.map((e) => (
          <div key={e.id} className="bar-row">
            <span className="bar-label">{e.title}</span>
            <span className="bar"><span style={{ width: `${e.score * 100}%` }} className={e.score >= 0.7 ? 'good' : 'meh'} /></span>
            <span className="bar-val">{Math.round(e.score * 100)} %</span>
          </div>
        ))}
      </section>
      {s.mistakes.length > 0 && (
        <section className="panel">
          <h3>Meine Fehler</h3>
          {s.topTag && (
            <div className="tip">
              <Mascot mood="think" size={48} />
              <p><strong>{foxGenitive} Tipp:</strong> {tagTip(s.topTag)}</p>
            </div>
          )}
          <ul className="mistakes">
            {s.mistakes.slice(0, 12).map((m) => (
              <li key={m.itemId}>
                {m.yours && <span className="m-yours">{m.yours}</span>}
                {m.correct && <span className="m-correct">→ {m.correct}</span>}
                {m.tags.map((t) => <span key={t} className="tag">{tagLabel(t)}</span>)}
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="result-actions">
        {!practice && <button className="btn btn-ghost" onClick={() => go(`/lesson/${lesson.id}?again=${Date.now()}`)}>Wiederholen</button>}
        {s.mistakes.length > 0 && <button className="btn btn-ghost" onClick={() => go('/practice')}>Fehler üben</button>}
        {practice || !passed ? (
          <button className="btn btn-primary" onClick={() => go(practice ? '/practice' : '/learn')}>Fertig</button>
        ) : (
          <button className="btn btn-primary" onClick={() => go(nextLessonId ? `/learn#${nextLessonId}` : '/learn')}>Weiter</button>
        )}
      </div>
    </div>
  )
}
