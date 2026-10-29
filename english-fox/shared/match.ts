// Answer matching shared by the app (local checking) and the evaluate Edge Function
// (server-side re-check of the AI transcription).
//
// Pattern syntax in solution "a" lists:
//   plain text                 compared after normalize()
//   (a|b)  x?  (x )?           regex groups / optional parts
//   {adv} {time} {now} ...     slots, see SLOTS
//   re:<regex>                 searched (not anchored) in the normalized answer

const DAYS = 'monday|tuesday|wednesday|thursday|friday|saturday|sunday'
const NUM = '(a|an|one|two|three|four|five|six|seven|eight|nine|ten|\\d+)'

const SLOTS: Record<string, string> = {
  adv: '(always|often|usually|regularly|sometimes|seldom|never|normally|rarely|frequently)',
  time: `(every (day|week|month|year|morning|afternoon|evening|night|weekend|summer|winter|${DAYS})|on (${DAYS})s|on the weekend|at the weekend|at weekends|once a (day|week|month|year)|twice a (day|week|month|year)|${NUM} times a (day|week|month|year)|in the (morning|afternoon|evening)s?)`,
  now: '(now|right now|at the moment|at present)',
  lookf: '(look|listen|now|right now|at the moment)',
  nowmid: '(now)',
  past: `(yesterday( (morning|afternoon|evening))?|last (night|week|month|year|summer|winter|weekend|${DAYS})|${NUM} (second|minute|hour|day|week|month|year)s? ago|in \\d{4})`,
  pastf: `(yesterday|last (night|week|month|year|summer|winter|weekend|${DAYS})|${NUM} (minute|hour|day|week|month|year)s? ago|in \\d{4})`,
  ppadv: '(just|already|never|recently|ever)',
  pptime: '(yet|so far|recently|already|since [a-z0-9]+( [a-z0-9]+)?|for [a-z0-9]+( [a-z0-9]+)?)',
  pre: "([a-z0-9' ]+ )?",
  rest: "( [a-z0-9' ]+)?",
}

// Sample text for each slot, used to show a model answer.
const SLOT_SAMPLE: Record<string, string> = {
  adv: 'often', time: 'every day', now: 'now', lookf: 'Look!', nowmid: 'now', past: 'yesterday',
  pastf: 'Yesterday', ppadv: 'already', pptime: 'so far', pre: '', rest: '',
}

const SIGNAL_WORDS = new Set(['always', 'often', 'usually', 'regularly', 'sometimes', 'seldom', 'never', 'every', 'now', 'moment', 'look', 'listen', 'tomorrow', 'next', 'soon', 'probably', 'yesterday', 'last', 'ago', 'while', 'since', 'for', 'just', 'already', 'ever', 'yet', 'recently', 'far', 'after', 'before', 'when'])

const NEG = ['do', 'does', 'did', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'could', 'would', 'should', 'must']

export function normalize(input: string, keepRegex = false): string {
  let s = input.toLowerCase()
  s = s.replace(/[’‘`´]/g, "'")
  s = s.replace(/\s+/g, ' ')
  if (!keepRegex) s = s.replace(/[.,!?;:"“”]/g, ' ')
  else s = s.replace(/[.!;:"“”]/g, ' ').replace(/,\??/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  // contractions: negations contracted, pronoun + verb expanded
  s = s.replace(new RegExp(`\\b(${NEG.join('|')}) not\\b`, 'g'), "$1n't")
  s = s.replace(/\bwill not\b/g, "won't").replace(/\b(can not|cannot)\b/g, "can't")
  s = s.replace(/\bi'm\b/g, 'i am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will')
  s = s.replace(/\b(he|she|it|that|there|what|who|where) is\b/g, '$1 is')
  return s.replace(/\s+/g, ' ').trim()
}

const cache = new Map<string, RegExp>()
function compile(pattern: string): RegExp {
  const hit = cache.get(pattern)
  if (hit) return hit
  let re: RegExp
  if (pattern.startsWith('re:')) {
    re = new RegExp(pattern.slice(3), 'i')
  } else {
    const p = normalize(pattern, true)
    let out = ''
    for (let i = 0; i < p.length; i++) {
      const ch = p[i]
      if (ch === '{') {
        const end = p.indexOf('}', i)
        const name = p.slice(i + 1, end)
        out += SLOTS[name] ?? ''
        i = end
      } else if ('()|?'.includes(ch)) out += ch
      else if (/[\\^$*+[\]{}.]/.test(ch)) out += '\\' + ch
      else out += ch
    }
    re = new RegExp('^' + out.trim() + '$')
  }
  cache.set(pattern, re)
  return re
}

export function matches(answer: string, patterns: string[]): boolean {
  const n = normalize(answer)
  if (!n) return false
  return patterns.some((p) => {
    try {
      return compile(p).test(n)
    } catch {
      return false
    }
  })
}

// A readable model answer from a pattern: first alternative, slots filled.
export function canonical(pattern: string): string {
  if (pattern.startsWith('re:')) return ''
  let s = pattern
  s = s.replace(/\{(\w+)\}/g, (_, n: string) => SLOT_SAMPLE[n] ?? '')
  // (a|b)? optional group -> drop; (a|b) -> a
  for (let k = 0; k < 10 && /\(/.test(s); k++) {
    s = s.replace(/\(([^()]*)\)\?/g, '').replace(/\(([^()|]*)(\|[^()]*)?\)/g, '$1')
  }
  s = s.replace(/[^\s()]\?/g, '').replace(/,\?/g, ',').replace(/\s+/g, ' ').trim()
  return s
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[n]
}

export type TextVerdict = { verdict: 'correct' | 'partially_correct' | 'incorrect'; closest: string; tags: string[] }

// Compare a written answer with the accepted patterns.
// Exact (normalized) match = correct; a small spelling slip in the closest model answer = partially correct.
export function judgeText(answer: string, patterns: string[]): TextVerdict {
  const concrete = patterns.filter((p) => !p.startsWith('re:')).map(canonical).filter(Boolean)
  const closestOf = () => {
    const n = normalize(answer)
    let best = concrete[0] ?? '', bestD = Infinity
    for (const c of concrete) {
      const d = levenshtein(n, normalize(c))
      if (d < bestD) { bestD = d; best = c }
    }
    return { best, bestD }
  }
  if (matches(answer, patterns)) return { verdict: 'correct', closest: concrete[0] ?? '', tags: [] }
  // missing apostrophe ("dont") only = spelling
  const fixed = answer.replace(/\b(do|does|did|is|are|was|were|have|has|had|wo|ca)nt\b/gi, "$1n't")
  const { best, bestD } = closestOf()
  if (fixed !== answer && matches(fixed, patterns)) return { verdict: 'partially_correct', closest: best, tags: ['spelling'] }
  if (!best) return { verdict: 'incorrect', closest: '', tags: [] }
  const n = normalize(answer), target = normalize(best)
  const tags = guessTags(n, target)
  const limit = Math.max(2, Math.floor(target.length / 10))
  if (bestD <= limit && target.length > 3 && tags.includes('spelling')) return { verdict: 'partially_correct', closest: best, tags }
  return { verdict: 'incorrect', closest: best, tags }
}

// Rough error categories for the local checker (the AI picks its own).
export function guessTags(answer: string, target: string): string[] {
  if (!answer) return []
  const aw = answer.split(' '), tw = target.split(' ')
  const sameBag = aw.length === tw.length && [...aw].sort().join(' ') === [...tw].sort().join(' ')
  if (sameBag) return ['word_order']
  const tags: string[] = []
  const d = levenshtein(answer, target)
  const missingWord = tw.filter((w) => !aw.includes(w))
  const extraWord = aw.filter((w) => !tw.includes(w))
  if (missingWord.length === 1 && extraWord.length === 1) {
    const [m] = missingWord, [e] = extraWord
    if (e === m + 's' || e === m + 'es' || e === m.replace(/y$/, 'ies')) return ['wrong_verb_form'] // -s where none belongs
    if (levenshtein(m, e) <= 2 && m.length > 3) {
      if (/(s|es|ies)$/.test(m) && !/(s|es|ies)$/.test(e)) tags.push('missing_s_3rd_person')
      else if (m.endsWith('ing') && !e.endsWith('ing')) tags.push('missing_ing')
      else if (m.endsWith('ing') && e.endsWith('ing')) tags.push('ing_spelling')
      else tags.push('spelling')
      return tags
    }
    if (/^(do|does|did|have|has|had|am|is|are|was|were|will|won't|don't|doesn't|didn't|haven't|hasn't|hadn't|isn't|aren't|wasn't|weren't)$/.test(m)) return ['wrong_auxiliary']
    return ['wrong_verb_form']
  }
  if (missingWord.length && !extraWord.length) return missingWord.some((w) => SIGNAL_WORDS.has(w)) ? ['missing_signal_word'] : ['missing_word']
  if (extraWord.length && !missingWord.length) return ['extra_word']
  if (d <= 2) return ['spelling']
  return ['wrong_tense']
}

// Tokens of a printed sentence for tap / highlight tasks.
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}
export function tokenKey(token: string): string {
  return token.toLowerCase().replace(/[’‘`´]/g, "'").replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '')
}
