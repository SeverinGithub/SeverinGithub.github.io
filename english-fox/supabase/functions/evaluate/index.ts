// Supabase Edge Function "evaluate": reads handwritten answers with Claude (vision) and grades them.
// The answer key never leaves the server side of this call; the score is computed here, not by the model.
//
// Secrets: ANTHROPIC_API_KEY, FAMILY_CODE, optional ANTHROPIC_MODEL, EVAL_DAILY_LIMIT
// Deploy:  npm run sync:functions && supabase functions deploy evaluate --no-verify-jwt
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { lessons, solutions } from '../_shared/content/index.ts'
import { fieldIds, itemsOf, type FieldInfo } from '../_shared/fields.ts'
import { canonical, matches } from '../_shared/match.ts'
import { errorTagList } from '../_shared/errorTags.ts'
import type { Exercise, FieldResult, Item, Lesson, SolutionMap } from '../_shared/types.ts'
import { SYSTEM_PROMPT } from './prompt.ts'

const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-5-5'
const DAILY_LIMIT = Number(Deno.env.get('EVAL_DAILY_LIMIT') ?? 300)
const MAX_ITEMS = 40
const MAX_IMAGE_CHARS = 400_000 // ~300 KB base64

const client = new Anthropic()
const cache = new Map<string, FieldResult>() // (field + image hash) -> result, per function instance

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type, x-family-code, authorization, apikey',
  'access-control-allow-methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } })

// JSON schema for the model's answer (spec 6.5)
const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['item_id', 'transcription', 'confidence', 'verdict', 'alt_answer_valid', 'error_tags', 'corrected_answer', 'feedback_de'],
        properties: {
          item_id: { type: 'string' },
          transcription: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          verdict: { type: 'string', enum: ['correct', 'partially_correct', 'incorrect', 'illegible'] },
          alt_answer_valid: { type: 'boolean' },
          error_tags: { type: 'array', items: { type: 'string', enum: errorTagList } },
          corrected_answer: { type: 'string' },
          feedback_de: { type: 'string' },
        },
      },
    },
  },
}

interface ModelItem {
  item_id: string
  transcription: string
  confidence: 'high' | 'medium' | 'low'
  verdict: 'correct' | 'partially_correct' | 'incorrect' | 'illegible'
  alt_answer_valid: boolean
  error_tags: string[]
  corrected_answer: string
  feedback_de: string
}

async function sha(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24)
}

// Task context for one field, as the learner sees it on the worksheet. No names, no personal data.
function describe(ex: Exercise, item: Item, f: FieldInfo): string {
  const lines = [`Aufgabe: ${ex.title}`]
  if (item.text) {
    const gap = f.id.match(/\.g(\d+)$/)?.[1]
    let k = 0
    const marked = item.text.replace(/\{\}/g, () => (String(k++) === gap ? '[LÜCKE]' : '___'))
    lines.push(gap !== undefined ? `Satz mit Lücke: ${marked}` : `Satz: ${item.text}`)
    if (f.id.endsWith('.s')) lines.push('Gesucht: der ganze Satz, korrigiert.')
  }
  if (item.prompt) lines.push(`Vorgabe: ${item.prompt.replace(/\[\[(.*?)\]\]/g, '<unterstrichen>$1</unterstrichen>')}`)
  if (f.label) lines.push(`Feld: ${f.label}`)
  if (f.tense) lines.push(`Zielzeitform: ${f.tense}`)
  if (ex.type === 'picture') lines.push(`Bildinhalt: a woman is walking her dog; a man is riding a bike; two children are playing with a ball; a girl is reading a book on a bench; ducks are swimming in the pond; a man is jogging; a family is having a picnic; a boy is flying a kite; an old man is feeding the birds`)
  const s = f.solution
  const concrete = (s?.a ?? []).filter((p) => !p.startsWith('re:')).map(canonical).filter(Boolean)
  if (s?.open) lines.push('Offene Aufgabe: Inhalt ist frei, bewerte nur Grammatik/Zeitform' + (ex.type === 'picture' ? ' und ob der Satz zum Bild passt.' : '.'))
  if (concrete.length) lines.push(`accepted_answers: ${JSON.stringify(concrete)}`)
  if (s?.examples?.length) lines.push(`Beispiele: ${JSON.stringify(s.examples)}`)
  if (s?.r) lines.push(`rubric: ${s.r}`)
  return lines.join('\n')
}

// Server-side re-check (spec 6.3): key match beats the model; scores come from the verdict.
function finalize(f: FieldInfo, m: ModelItem | undefined): FieldResult {
  if (!m) return { verdict: 'illegible', score: 0, tags: ['illegible'] }
  const patterns = f.solution?.a ?? []
  const model = canonical(patterns.find((p) => !p.startsWith('re:')) ?? '') || m.corrected_answer
  if (m.verdict === 'illegible' || m.confidence === 'low') {
    return { verdict: 'illegible', score: 0, transcription: m.transcription, tags: ['illegible'], feedback: 'Bitte schreib das Feld noch einmal deutlicher.' }
  }
  if (m.transcription && matches(m.transcription, patterns) && !f.solution?.open) {
    return { verdict: 'correct', score: 1, transcription: m.transcription, tags: [] }
  }
  if (m.verdict === 'correct') {
    // open tasks are judged by the model; anything else that is not in the key goes to review
    return { verdict: 'correct', score: 1, transcription: m.transcription, tags: [], aiOverride: !f.solution?.open, feedback: m.feedback_de }
  }
  return {
    verdict: m.verdict,
    score: m.verdict === 'partially_correct' ? 0.5 : 0,
    transcription: m.transcription,
    corrected: m.corrected_answer || model,
    tags: m.error_tags,
    feedback: m.feedback_de,
  }
}

async function countUsage(code: string, n: number): Promise<boolean> {
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return true
  const db = createClient(url, key)
  const date = new Date().toISOString().slice(0, 10)
  const user = await sha(code)
  const { data } = await db.from('eval_usage').select('calls').eq('user_key', user).eq('date', date).maybeSingle()
  const calls = (data?.calls ?? 0) + n
  if (calls > DAILY_LIMIT) return false
  await db.from('eval_usage').upsert({ user_key: user, date, calls })
  return true
}

async function callModel(content: Anthropic.Beta.BetaContentBlockParam[]) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await client.beta.messages.create(
        {
          model: MODEL,
          max_tokens: 16000,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: { effort: 'low', format: { type: 'json_schema', schema } },
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content }],
        },
        { timeout: 30_000, maxRetries: 0 },
      )
    } catch (e) {
      const retryable = e instanceof Anthropic.RateLimitError || e instanceof Anthropic.InternalServerError || e instanceof Anthropic.APIConnectionError
      if (!retryable || attempt >= 1) throw e
      await new Promise((r) => setTimeout(r, 1500))
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  const code = req.headers.get('x-family-code') ?? ''
  if (!Deno.env.get('FAMILY_CODE') || code !== Deno.env.get('FAMILY_CODE')) return json({ error: 'unauthorized' }, 401)

  const body = (await req.json().catch(() => null)) as { lessonId: string; exerciseId: string; items: { fieldId: string; image: string }[] } | null
  const lesson = body && (lessons[body.lessonId] as Lesson | undefined)
  const ex = lesson?.exercises.find((e) => e.id === body!.exerciseId)
  if (!body || !lesson || !ex || !Array.isArray(body.items) || body.items.length > MAX_ITEMS) return json({ error: 'bad request' }, 400)
  const sol = solutions[lesson.id] as SolutionMap

  // all fields of this exercise; only the ones sent with an image are graded
  const all = new Map<string, { item: Item; f: FieldInfo }>()
  for (const item of itemsOf(ex)) for (const f of fieldIds(ex, item, sol)) all.set(f.id, { item, f })

  const results: Record<string, FieldResult> = {}
  const todo: { n: number; fieldId: string; image: string; key: string }[] = []
  for (const it of body.items) {
    const known = all.get(it.fieldId)
    if (!known || typeof it.image !== 'string' || !it.image.startsWith('data:image/') || it.image.length > MAX_IMAGE_CHARS) continue
    const key = `${it.fieldId}:${await sha(it.image)}`
    const hit = cache.get(key)
    if (hit) results[it.fieldId] = hit
    else todo.push({ n: todo.length + 1, fieldId: it.fieldId, image: it.image, key })
  }

  if (todo.length) {
    if (!(await countUsage(code, 1))) return json({ error: 'limit' }, 429)
    const content: Anthropic.Beta.BetaContentBlockParam[] = []
    for (const t of todo) {
      const { item, f } = all.get(t.fieldId)!
      const [, mediaType, data] = t.image.match(/^data:(image\/\w+);base64,(.*)$/s) ?? []
      content.push({ type: 'text', text: `### Bild ${t.n} – item_id: ${t.fieldId}\n${describe(ex, item, f)}` })
      content.push({ type: 'image', source: { type: 'base64', media_type: mediaType as 'image/jpeg', data } })
    }
    content.push({ type: 'text', text: `Bewerte alle ${todo.length} Bilder. Gib für jedes genau einen Eintrag mit seiner item_id zurück.` })

    let parsed: ModelItem[] = []
    try {
      const res = await callModel(content)
      if (res.stop_reason === 'refusal') return json({ error: 'refusal' }, 502)
      const text = res.content.find((b) => b.type === 'text')
      parsed = text && text.type === 'text' ? (JSON.parse(text.text) as { items: ModelItem[] }).items : []
    } catch (e) {
      console.error('evaluate failed', e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e)
      return json({ error: 'unavailable' }, 503)
    }
    const byId = new Map(parsed.map((p) => [p.item_id, p]))
    for (const t of todo) {
      const r = finalize(all.get(t.fieldId)!.f, byId.get(t.fieldId))
      results[t.fieldId] = r
      if (r.verdict !== 'illegible') cache.set(t.key, r)
    }
  }

  return json({ results })
})
