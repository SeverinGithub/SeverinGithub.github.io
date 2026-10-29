// Content model. One lesson = one worksheet, one exercise = one block on the sheet.
// Every answerable spot has a field id: `${itemId}.${suffix}` (g0.. gaps, f0.. lines,
// c0.. table/grid cells, mc, w + s for error correction, sig, wo, l0.. picture lines).

export type ExerciseType =
  | 'gap_fill'
  | 'multiple_choice'
  | 'error_correction'
  | 'write'
  | 'table'
  | 'word_order'
  | 'picture'
  | 'grid'

export interface Merkbox {
  usage: string
  be?: string
  positive: string
  negative: string
  question: string
  signal_words: string[]
  notes?: string[]
}

export interface Item {
  id: string
  text?: string // gap_fill / multiple_choice / error_correction, "{}" marks a gap, "___" a choice
  prompt?: string // write / table, [[...]] = underlined
  options?: string[]
  fields?: string[] // per-item field labels for write
  lines?: number
  words?: string[] // word_order chips
  context?: string // gap_fill cards: verb shown as card header
  given?: Record<string, string> // grid: column index -> fixed sentence
  signal?: boolean // grid: signal word row
}

export interface GridColumn {
  tense?: number
  options?: number[]
  label?: string
}

export interface Exercise {
  id: string
  type: ExerciseType
  title: string
  hint?: string
  items: Item[]
  fields?: string[] // write: column labels for all items (sentence pairs)
  columns?: string[] | GridColumn[]
  wordbox?: string[]
  signal?: boolean
  cards?: boolean
  inline?: boolean
  noError?: boolean
  image?: string
  lines?: number
  timeline?: string[]
  tenses?: string[]
  irregularLink?: boolean
}

export interface Lesson {
  id: string
  slug: string
  title: string
  unit: number
  order: number
  kind?: 'lesson' | 'mixed'
  merkbox: Merkbox
  exercises: Exercise[]
}

export interface Unit {
  id: number
  title: string
  color: string
}

// Answer key entry for one field.
export interface Solution {
  a?: string[] // accepted patterns, see shared/match.ts
  r?: string // rubric (German)
  open?: boolean // free answer: patterns only check grammar
  c?: number | number[] // multiple choice / grid header: correct option index(es)
  w?: string[] // error correction / signal words: wrong (or signal) tokens; "-" = "no error" accepted
  scene?: string
  examples?: string[]
}
export type SolutionMap = Record<string, Solution>

// What the learner gave for one field.
export interface Stroke {
  points: [number, number, number][]
  erase?: boolean
}
export interface FieldAnswer {
  text?: string
  strokes?: Stroke[]
  image?: string // data URL, only while evaluating
  choice?: number
  tokens?: number[] // selected token indexes
  order?: number[] // word order chip indexes
  noError?: boolean
}
export type Answers = Record<string, FieldAnswer>

export type Verdict = 'correct' | 'partially_correct' | 'incorrect' | 'illegible' | 'self_check' | 'empty'

export interface FieldResult {
  verdict: Verdict
  score: number
  transcription?: string
  corrected?: string
  feedback?: string
  tags: string[]
  aiOverride?: boolean
}
export type Results = Record<string, FieldResult>
