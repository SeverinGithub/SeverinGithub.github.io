import { useMemo, useState } from 'react'
import { lessons, lessonById, solutionsFor } from '../content'
import { today, useStore } from '../store'
import { Mascot } from '../components/Mascot'
import { MerkboxCard } from '../components/MerkboxCard'
import { Stars } from '../components/Stars'
import { irregularVerbs } from '../lib/irregular'
import { tagLabel } from '../../shared/errorTags'
import { levelFor, theme } from '../config/theme'
import { brand } from '../config/brand'
import { go } from '../router'
import type { Exercise, Lesson, SolutionMap } from '../../shared/types'
import { itemsOf } from '../../shared/fields'
import { LessonRunner } from './LessonRunner'

// ---------- practice (Tab "Üben") ----------
export function buildPracticeLesson(keys: string[]): { lesson: Lesson; sol: SolutionMap } | null {
  const byEx = new Map<string, Set<string>>()
  for (const k of keys) {
    const lessonId = k.split('-')[0]
    const l = lessonById[lessonId]
    const ex = l?.exercises.find((e) => e.id === k || itemsOf(e).some((i) => i.id === k))
    if (!ex) continue
    if (!byEx.has(ex.id)) byEx.set(ex.id, new Set())
    byEx.get(ex.id)!.add(k)
  }
  const exercises: Exercise[] = []
  let sol: SolutionMap = {}
  for (const [exId, items] of byEx) {
    const l = lessonById[exId.split('-')[0]]
    const ex = l.exercises.find((e) => e.id === exId)!
    sol = { ...sol, ...solutionsFor(l.id) }
    if (ex.type === 'picture') exercises.push(ex)
    else exercises.push({ ...ex, title: `${l.title}: ${ex.title}`, items: ex.items.filter((i) => items.has(i.id)) })
  }
  if (!exercises.length) return null
  return {
    lesson: { id: 'PRACTICE', slug: 'practice', title: 'Fehlertraining', unit: 0, order: 0, merkbox: lessons[0].merkbox, exercises },
    sol,
  }
}

export function Practice({ run }: { run?: boolean }) {
  const mistakes = useStore((s) => s.mistakes)
  const open = Object.values(mistakes).filter((m) => !m.resolved)
  const due = open.filter((m) => m.dueAt <= today())
  const pool = (due.length ? due : open).sort((a, b) => a.stage - b.stage || a.dueAt.localeCompare(b.dueAt)).slice(0, 10)
  // freeze the selection for the running session
  const session = useMemo(() => (run ? buildPracticeLesson(pool.map((m) => m.key)) : null), [run]) // eslint-disable-line react-hooks/exhaustive-deps

  if (run && session) return <LessonRunner lesson={session.lesson} sol={session.sol} practice />

  return (
    <div className="page">
      <div className="page-hero">
        <Mascot mood={open.length ? 'motivated' : 'happy'} size={100} />
        <div>
          <h1>Fehlertraining</h1>
          <p className="muted">{open.length ? `${open.length} offene Fehler · ${due.length} heute fällig` : 'Keine offenen Fehler – stark!'}</p>
        </div>
      </div>
      {open.length > 0 && (
        <button className="btn btn-primary btn-block" onClick={() => go('/practice/run')}>
          {Math.min(10, pool.length)} Aufgaben üben
        </button>
      )}
      <p className="hint">Falsche Aufgaben kommen nach 1, 3 und 7 Tagen wieder. Dreimal richtig = erledigt.</p>
      <section className="panel">
        <h3>Häufigste Fehler</h3>
        <TagBars mistakes={open.map((m) => m.tags)} />
      </section>
    </div>
  )
}

function TagBars({ mistakes }: { mistakes: string[][] }) {
  const counts: Record<string, number> = {}
  mistakes.flat().forEach((t) => (counts[t] = (counts[t] ?? 0) + 1))
  const list = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const max = list[0]?.[1] ?? 1
  if (!list.length) return <p className="muted">Noch keine Daten.</p>
  return (
    <>
      {list.map(([t, c]) => (
        <div key={t} className="bar-row">
          <span className="bar-label">{tagLabel(t)}</span>
          <span className="bar"><span className="meh" style={{ width: `${(c / max) * 100}%` }} /></span>
          <span className="bar-val">{c}</span>
        </div>
      ))}
    </>
  )
}

// ---------- reference (Tab "Nachschlagen") ----------
export function Reference({ section }: { section?: string }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const verbs = irregularVerbs.filter((v) => v.join(' ').toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="page">
      <div className="segmented">
        <button className={section !== 'irregular' ? 'on' : ''} onClick={() => go('/reference')}>Merkboxen</button>
        <button className={section === 'irregular' ? 'on' : ''} onClick={() => go('/reference/irregular')}>Unregelmäßige Verben</button>
      </div>
      {section === 'irregular' ? (
        <>
          <input className="search" placeholder="Verb suchen …" value={q} onChange={(e) => setQ(e.target.value)} />
          <table className="verbs">
            <thead><tr><th>Infinitiv</th><th>2nd form</th><th>3rd form</th><th>Deutsch</th></tr></thead>
            <tbody>{verbs.map((v) => <tr key={v[0]}>{v.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </>
      ) : (
        lessons.filter((l) => l.kind !== 'mixed').map((l) => (
          <section key={l.id} className="panel">
            <button className="accordion" onClick={() => setOpen(open === l.id ? null : l.id)} aria-expanded={open === l.id}>
              <span>{l.title}</span><span>{open === l.id ? '−' : '+'}</span>
            </button>
            {open === l.id && <MerkboxCard m={l.merkbox} />}
          </section>
        ))
      )}
    </div>
  )
}

// ---------- profile + settings ----------
export function Profile({ section }: { section?: string }) {
  const s = useStore()
  const lvl = levelFor(s.xp)
  const [tagFilter, setTagFilter] = useState('')
  const [lessonFilter, setLessonFilter] = useState('')
  if (section === 'settings') return <SettingsPage />

  const accuracy = lessons.map((l) => {
    const att = s.attempts.filter((a) => a.lessonId === l.id)
    return { l, avg: att.length ? att.reduce((x, a) => x + a.score, 0) / att.length : null }
  })
  const log = Object.values(s.mistakes)
    .filter((m) => (!tagFilter || m.tags.includes(tagFilter)) && (!lessonFilter || m.lessonId === lessonFilter))
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
  const allTags = [...new Set(Object.values(s.mistakes).flatMap((m) => m.tags))]

  return (
    <div className="page">
      <div className="page-hero">
        <Mascot mood="happy" size={100} />
        <div>
          <h1>{s.settings.name || 'Mein Profil'}</h1>
          <p className="level">{lvl.name}{lvl.next && <span className="muted"> · noch {lvl.next.min - s.xp} {theme.xp} bis {lvl.next.name}</span>}</p>
          <div className="xpbar"><span style={{ width: `${lvl.progress * 100}%` }} /></div>
        </div>
      </div>
      <div className="stat-row">
        <div className="stat"><strong>{s.xp}</strong><span>{theme.xp}</span></div>
        <div className="stat"><strong>🔥 {s.streak.current}</strong><span>{theme.streak} (best {s.streak.longest})</span></div>
        <div className="stat"><strong>🏆 {s.gems}</strong><span>{theme.gems}</span></div>
        <div className="stat"><strong>{Object.values(s.progress).reduce((a, p) => a + p.bestStars, 0)}</strong><span>Sterne</span></div>
      </div>
      <button className="btn btn-ghost btn-block" onClick={() => go('/profile/settings')}>⚙️ Einstellungen</button>

      <section className="panel">
        <h3>Genauigkeit pro Zeitform</h3>
        {accuracy.map(({ l, avg }) => (
          <div key={l.id} className="bar-row">
            <span className="bar-label">{l.title}</span>
            <span className="bar"><span className={avg !== null && avg >= 0.7 ? 'good' : 'meh'} style={{ width: `${(avg ?? 0) * 100}%` }} /></span>
            <span className="bar-val">{avg === null ? '–' : `${Math.round(avg * 100)} %`}</span>
          </div>
        ))}
      </section>

      <section className="panel">
        <h3>Verlauf</h3>
        {s.attempts.length === 0 && <p className="muted">Noch keine Lektion gespielt.</p>}
        <ul className="history">
          {s.attempts.slice(0, 30).map((a) => (
            <li key={a.id}>
              <span>{a.practice ? 'Fehlertraining' : lessonById[a.lessonId]?.title}</span>
              {!a.practice && <Stars n={a.stars} size={14} />}
              <span className="muted">{Math.round(a.score * 100)} % · {new Date(a.finishedAt).toLocaleDateString('de-DE')}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h3>Fehlerprotokoll</h3>
        <div className="filters">
          <select value={lessonFilter} onChange={(e) => setLessonFilter(e.target.value)} aria-label="Thema">
            <option value="">Alle Themen</option>
            {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} aria-label="Fehlerkategorie">
            <option value="">Alle Fehlerarten</option>
            {allTags.map((t) => <option key={t} value={t}>{tagLabel(t)}</option>)}
          </select>
        </div>
        {log.length === 0 && <p className="muted">Keine Einträge.</p>}
        <ul className="mistakes">
          {log.slice(0, 50).map((m) => (
            <li key={m.key} className={m.resolved ? 'resolved' : ''}>
              <span className="muted">{lessonById[m.lessonId]?.title}</span>
              {m.yours && <span className="m-yours">{m.yours}</span>}
              {m.correct && <span className="m-correct">→ {m.correct}</span>}
              {m.tags.map((t) => <span key={t} className="tag">{tagLabel(t)}</span>)}
              {m.resolved && <span className="tag tag-ok">erledigt</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const reset = useStore((s) => s.reset)
  return (
    <div className="page">
      <button className="link" onClick={() => go('/profile')}>← Profil</button>
      <h1>Einstellungen</h1>
      <section className="panel form">
        <label>Dein Name<input value={settings.name} onChange={(e) => update({ name: e.target.value })} /></label>
        <label>
          Eingabe
          <select value={settings.inputMode} onChange={(e) => update({ inputMode: e.target.value as typeof settings.inputMode })}>
            <option value="auto">Automatisch (Stift, wenn KI verbunden)</option>
            <option value="pen">Apple Pencil (KI liest die Handschrift)</option>
            <option value="keyboard">Textfelder (Tastatur oder iPad-Handschrift)</option>
          </select>
        </label>
        <label className="check"><input type="checkbox" checked={settings.fingerDraw} onChange={(e) => update({ fingerDraw: e.target.checked })} /> Auch mit dem Finger schreiben</label>
        <label className="check"><input type="checkbox" checked={settings.sound} onChange={(e) => update({ sound: e.target.checked })} /> Töne</label>
        <label>Tagesziel ({theme.xp})<input type="number" min={5} max={200} value={settings.dailyGoal} onChange={(e) => update({ dailyGoal: Number(e.target.value) || 20 })} /></label>
      </section>
      <section className="panel form">
        <h3>KI-Auswertung (Handschrift)</h3>
        <p className="muted">Adresse der Supabase-Funktion „evaluate“ und euer Familien-Code. Ohne diese Angaben prüft {brand.appName} auf dem Gerät (Textfelder).</p>
        <label>KI-Adresse<input placeholder="https://xyz.supabase.co/functions/v1/evaluate" value={settings.evalUrl} onChange={(e) => update({ evalUrl: e.target.value.trim() })} /></label>
        <label>Familien-Code<input type="password" value={settings.familyCode} onChange={(e) => update({ familyCode: e.target.value })} /></label>
        {settings.inputMode === 'pen' && !settings.evalUrl && <p className="error">Stift-Modus braucht die KI-Adresse.</p>}
      </section>
      <section className="panel">
        <button className="btn btn-danger" onClick={() => window.confirm('Wirklich allen Fortschritt löschen?') && reset()}>Fortschritt zurücksetzen</button>
      </section>
    </div>
  )
}
