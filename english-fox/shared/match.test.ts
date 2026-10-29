import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { canonical, judgeText, matches, normalize } from './match'
import type { Lesson, SolutionMap } from './types'
import { fieldIds, itemsOf } from './fields'

const dir = new URL('../content/', import.meta.url)
const ids = readdirSync(new URL('lessons/', dir)).map((f) => f.replace('.json', ''))
const load = <T,>(p: string): T => JSON.parse(readFileSync(new URL(p, dir), 'utf8'))

describe('normalize', () => {
  it('unifies apostrophes and negations', () => {
    expect(normalize('I do not like it.')).toBe("i don't like it")
    expect(normalize('I don`t like it')).toBe("i don't like it")
    expect(normalize("I'm going")).toBe('i am going')
  })
})

describe('matches', () => {
  it('handles slots and groups', () => {
    expect(matches('Lucy always wears trousers.', ['Lucy {adv} wears trousers'])).toBe(true)
    expect(matches('Lucy wears trousers every day', ['Lucy wears trousers {time}'])).toBe(true)
    expect(matches('Lucy wear trousers every day', ['Lucy wears trousers {time}'])).toBe(false)
    expect(matches('Yesterday he did his homework', ['{pre}He did his homework{rest}'])).toBe(true)
    expect(matches('The guests are going to come at 8 p.m.', ['(The guests|They) are going to come at 8 p ?m'])).toBe(true)
  })
  it('marks spelling slips as partially correct', () => {
    expect(judgeText('dont like', ["don't like"]).verdict).toBe('partially_correct')
    expect(judgeText('brushs', ['brushes']).verdict).toBe('partially_correct')
    expect(judgeText('swim', ['swims']).tags).toContain('missing_s_3rd_person')
    expect(judgeText('is going', ['goes']).verdict).toBe('incorrect')
  })
})

describe('content', () => {
  for (const id of ids) {
    const lesson = load<Lesson>(`lessons/${id}.json`)
    const sol = load<SolutionMap>(`solutions/${id}.json`)
    it(`${id}: every field has a solution and model answers match their own pattern`, () => {
      for (const ex of lesson.exercises) {
        for (const item of itemsOf(ex)) {
          for (const f of fieldIds(ex, item, sol)) {
            const s = f.solution
            expect(s, `${f.id} missing`).toBeTruthy()
            for (const p of s!.a ?? []) {
              if (p.startsWith('re:') || s!.open) continue
              const c = canonical(p)
              expect(matches(c, [p]), `${f.id}: "${c}" vs ${p}`).toBe(true)
            }
          }
        }
      }
    })
  }
})
