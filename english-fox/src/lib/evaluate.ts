import type { Answers, Exercise, FieldResult, Item, Lesson, Results, Solution, SolutionMap } from '../../shared/types'
import { fieldIds, itemsOf, type FieldInfo } from '../../shared/fields'
import { judgeText, matches, normalize, tokenize, tokenKey, canonical } from '../../shared/match'
import { tagTip } from '../../shared/errorTags'
import { exportInk } from '../components/ink/exportInk'

export interface EvalSettings {
  evalUrl: string
  familyCode: string
}

const r = (verdict: FieldResult['verdict'], score: number, extra: Partial<FieldResult> = {}): FieldResult => ({ verdict, score, tags: [], ...extra })

function model(sol?: Solution): string {
  const first = sol?.a?.find((p) => !p.startsWith('re:'))
  if (first) return canonical(first)
  return sol?.examples?.[0] ?? ''
}

function choiceOk(sol: Solution | undefined, choice: number | undefined) {
  if (choice === undefined || !sol || sol.c === undefined) return false
  return Array.isArray(sol.c) ? sol.c.includes(choice) : sol.c === choice
}

export function judgeTextField(text: string | undefined, sol: Solution | undefined): FieldResult {
  const t = (text ?? '').trim()
  if (!t) return r('empty', 0, { corrected: model(sol) })
  if (!sol?.a?.length) return r('self_check', 0, { transcription: t, corrected: model(sol) })
  if (sol.open) {
    if (matches(t, sol.a)) return r('correct', 1, { transcription: t, feedback: 'Grammatik passt!' })
    return r('self_check', 0, { transcription: t, corrected: model(sol), feedback: sol.r })
  }
  const v = judgeText(t, sol.a)
  if (v.verdict === 'correct') return r('correct', 1, { transcription: t })
  const tip = v.tags.map(tagTip).find(Boolean)
  return r(v.verdict, v.verdict === 'partially_correct' ? 0.5 : 0, {
    transcription: t,
    corrected: v.closest || model(sol),
    tags: v.tags,
    feedback: [tip, sol.r].filter(Boolean).join(' '),
  })
}

function judgeTokens(ex: Exercise, item: Item, f: FieldInfo, answers: Answers): FieldResult {
  const ans = answers[f.id] ?? {}
  const sol = f.solution
  const wanted = (sol?.w ?? []).filter((w) => w !== '-')
  const allowNone = !sol?.w?.length || sol.w.includes('-')
  const tokens = tokenize(item.text ?? '')
  const picked = (ans.tokens ?? []).map((i) => tokenKey(tokens[i] ?? ''))
  const wantedText = wanted.length ? wanted.join(', ') : ex.type === 'error_correction' ? 'kein Fehler' : 'kein Signalwort'
  if (ex.type === 'error_correction' && ans.noError) {
    return allowNone ? r('correct', 1, { transcription: 'kein Fehler' }) : r('incorrect', 0, { transcription: 'kein Fehler', corrected: wantedText, feedback: 'Hier steckt ein Fehler im Satz.' })
  }
  if (!picked.length) {
    if (ex.type !== 'error_correction' && allowNone) return r('correct', 1)
    return r('incorrect', 0, { corrected: wantedText })
  }
  const ok = picked.every((p) => wanted.includes(p))
  return ok ? r('correct', 1, { transcription: picked.join(', ') }) : r('incorrect', 0, { transcription: picked.join(', '), corrected: wantedText })
}

// Everything that can be decided on the device. Handwritten fields without text are returned in `ink`.
export function evaluateLocal(lesson: Lesson, ex: Exercise, answers: Answers, sol: SolutionMap) {
  const results: Results = {}
  const ink: FieldInfo[] = []
  for (const item of itemsOf(ex)) {
    for (const f of fieldIds(ex, item, sol, answers)) {
      const ans = answers[f.id] ?? {}
      switch (f.kind) {
        case 'text': {
          if (ex.type === 'error_correction' && answers[`${item.id}.w`]?.noError) {
            results[f.id] = r('correct', 1, { transcription: '—' })
            break
          }
          if (!ans.text?.trim() && ans.strokes?.length) { ink.push(f); break }
          if (ex.type === 'picture' && !ans.text?.trim()) break // unused lines are fine
          results[f.id] = judgeTextField(ans.text, f.solution)
          break
        }
        case 'choice':
        case 'header': {
          const ok = choiceOk(f.solution, ans.choice)
          const labels = ex.type === 'grid' ? ex.tenses ?? [] : item.options ?? []
          const c = f.solution?.c
          const correctLabel = Array.isArray(c) ? c.map((i) => labels[i]).join(' / ') : labels[c ?? 0]
          results[f.id] = ans.choice === undefined ? r('empty', 0, { corrected: correctLabel }) : ok ? r('correct', 1) : r('incorrect', 0, { corrected: correctLabel, transcription: labels[ans.choice] })
          break
        }
        case 'tokens':
          results[f.id] = judgeTokens(ex, item, f, answers)
          break
        case 'order': {
          const words = item.words ?? []
          const text = (ans.order ?? []).map((i) => words[i]).join(' ')
          const full = (ans.order ?? []).length === words.length
          results[f.id] = !full ? r('empty', 0, { transcription: text, corrected: model(f.solution) }) : matches(text, f.solution?.a ?? []) ? r('correct', 1, { transcription: text }) : r('incorrect', 0, { transcription: text, corrected: model(f.solution), tags: ['word_order'], feedback: tagTip('word_order') })
          break
        }
      }
    }
  }
  return { results, ink }
}

// Handwriting goes to the Edge Function (Claude vision). It returns transcription + verdict;
// the transcription is re-checked here against the key as well (spec 6.3).
export async function evaluateInk(lesson: Lesson, ex: Exercise, fields: FieldInfo[], answers: Answers, settings: EvalSettings): Promise<Results> {
  const items = await Promise.all(
    fields.map(async (f) => ({ fieldId: f.id, image: await exportInk(answers[f.id]?.strokes ?? []) })),
  )
  const res = await fetch(settings.evalUrl.replace(/\/$/, ''), {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-family-code': settings.familyCode },
    body: JSON.stringify({ lessonId: lesson.id, exerciseId: ex.id, items }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new Error(res.status === 401 ? 'Familien-Code stimmt nicht.' : res.status === 429 ? 'Tageslimit erreicht.' : 'Gerade nicht erreichbar.')
  const data = (await res.json()) as { results: Results }
  return data.results
}

export function itemScore(ex: Exercise, item: Item, results: Results, sol: SolutionMap, answers: Answers): number | null {
  const fields = fieldIds(ex, item, sol, answers)
  if (ex.type === 'error_correction') {
    const w = results[`${item.id}.w`], s = results[`${item.id}.s`]
    if (!w || !s) return 0
    if (s.verdict === 'self_check' || s.verdict === 'illegible') return null
    const wOk = w.score >= 1, sOk = s.score >= 1
    if (wOk && sOk) return 1
    if (wOk || sOk || s.score > 0) return 0.5
    return 0
  }
  if (ex.type === 'picture') {
    // only lines the learner actually wrote count
    const all = fields.map((f) => results[f.id]).filter((x) => x && x.verdict !== 'empty' && x.verdict !== 'illegible')
    if (all.some((x) => x.verdict === 'self_check')) return null
    const written = all
    if (!written.length) return 0
    return written.reduce((a, b) => a + b.score, 0) / written.length
  }
  const scored = fields.map((f) => results[f.id]).filter((x) => x && x.verdict !== 'self_check' && x.verdict !== 'illegible')
  if (scored.length < fields.length) return null
  return scored.reduce((a, b) => a + b.score, 0) / fields.length
}

export function exerciseScore(ex: Exercise, results: Results, sol: SolutionMap, answers: Answers) {
  const items = itemsOf(ex)
  const scores = items.map((it) => itemScore(ex, it, results, sol, answers))
  return { scores, total: scores.reduce<number>((a, b) => a + (b ?? 0), 0), count: items.length, pending: scores.some((s) => s === null) }
}

export function isAnswered(ex: Exercise, item: Item, f: FieldInfo, answers: Answers): boolean {
  const a = answers[f.id]
  if (f.kind === 'text') {
    if (ex.type === 'error_correction' && answers[`${item.id}.w`]?.noError) return true
    return !!(a?.text?.trim() || a?.strokes?.length)
  }
  if (f.kind === 'choice' || f.kind === 'header') return a?.choice !== undefined
  if (f.kind === 'order') return (a?.order?.length ?? 0) === (item.words?.length ?? 0)
  if (f.kind === 'tokens') return ex.type === 'error_correction' ? !!(a?.noError || a?.tokens?.length) : true
  return true
}

export { normalize }
