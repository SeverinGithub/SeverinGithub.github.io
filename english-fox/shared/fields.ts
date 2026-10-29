import type { Answers, Exercise, GridColumn, Item, Solution, SolutionMap } from './types.ts'

export type FieldKind = 'text' | 'choice' | 'tokens' | 'order' | 'header'

export interface FieldInfo {
  id: string
  kind: FieldKind
  label?: string
  solution?: Solution
  tense?: string // grid cells: target tense name
}

// Picture tasks have no items in the content file; grids get an extra pseudo item for the
// column headers the learner has to choose.
export function itemsOf(ex: Exercise): Item[] {
  if (ex.type === 'picture') return [{ id: ex.id }]
  if (ex.type === 'grid' && gridColumns(ex).some((c) => !c.label)) return [...ex.items, { id: ex.id }]
  return ex.items
}

export function gridColumns(ex: Exercise): GridColumn[] {
  return (ex.columns ?? []) as GridColumn[]
}

export function gapCount(text = ''): number {
  return (text.match(/\{\}/g) ?? []).length
}

// Tense a grid column stands for: fixed, or the one the learner picked among the options.
export function columnTense(ex: Exercise, col: number, answers?: Answers): number {
  const c = gridColumns(ex)[col]
  if (c.tense !== undefined && !c.options) return c.tense
  const picked = answers?.[`${ex.id}.h${col}`]?.choice
  const opts = c.options ?? [c.tense!]
  return picked !== undefined && opts.includes(picked) ? picked : opts[0]
}

export function fieldIds(ex: Exercise, item: Item, sol: SolutionMap, answers?: Answers): FieldInfo[] {
  const f = (id: string, kind: FieldKind, key = id, extra: Partial<FieldInfo> = {}): FieldInfo => ({ id, kind, solution: sol[key], ...extra })
  switch (ex.type) {
    case 'gap_fill': {
      const out = Array.from({ length: gapCount(item.text) }, (_, i) => f(`${item.id}.g${i}`, 'text'))
      if (ex.signal) out.push(f(`${item.id}.sig`, 'tokens'))
      return out
    }
    case 'multiple_choice':
      return [f(`${item.id}.mc`, 'choice')]
    case 'error_correction':
      return [f(`${item.id}.w`, 'tokens'), f(`${item.id}.s`, 'text')]
    case 'write': {
      const labels = item.fields ?? ex.fields ?? ['']
      return labels.map((label, i) => f(`${item.id}.f${i}`, 'text', undefined, { label }))
    }
    case 'table': {
      const cols = (ex.columns ?? ['']) as string[]
      return cols.map((label, i) => f(`${item.id}.c${i}`, 'text', undefined, { label }))
    }
    case 'word_order':
      return [f(`${item.id}.wo`, 'order')]
    case 'picture':
      return Array.from({ length: ex.lines ?? 5 }, (_, i) => f(`${ex.id}.l${i}`, 'text', `${ex.id}.l`))
    case 'grid': {
      const cols = gridColumns(ex)
      if (item.id === ex.id) {
        return cols.flatMap((c, i) => (c.label ? [] : [f(`${ex.id}.h${i}`, 'header')]))
      }
      return cols.flatMap((_, i) => {
        if (item.given?.[String(i)]) return []
        const t = columnTense(ex, i, answers)
        return [f(`${item.id}.c${i}`, 'text', `${item.id}.t${t}`, { tense: ex.tenses?.[t] })]
      })
    }
  }
}
