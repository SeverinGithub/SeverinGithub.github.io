// Fixed error taxonomy (spec 6.4) with German labels and a short rule used as feedback.
export const errorTags = {
  spelling: { de: 'Rechtschreibung', tip: 'Fast! Achte genau auf die Schreibweise.' },
  capitalization: { de: 'Groß-/Kleinschreibung', tip: 'Satzanfänge und Namen schreibt man groß.' },
  punctuation: { de: 'Satzzeichen', tip: 'Denk an Punkt, Fragezeichen und Apostroph.' },
  wrong_tense: { de: 'Falsche Zeitform', tip: 'Schau dir die Signalwörter an – sie verraten die Zeitform.' },
  missing_s_3rd_person: { de: 'he/she/it -s vergessen', tip: 'he, she, it – das S muss mit!' },
  wrong_auxiliary: { de: 'Falsches Hilfsverb', tip: 'Prüfe das Hilfsverb: do/does/did, have/has/had, am/is/are, was/were.' },
  wrong_verb_form: { de: 'Falsche Verbform', tip: 'Prüfe die Verbform (Grundform, 2. oder 3. Form).' },
  irregular_verb: { de: 'Unregelmäßiges Verb', tip: 'Dieses Verb ist unregelmäßig – schau in die Liste.' },
  missing_ing: { de: '-ing vergessen', tip: 'Progressive-Formen brauchen verb + ing.' },
  ing_spelling: { de: '-ing Schreibweise', tip: 'Bei -ing: stummes e fällt weg (take → taking), Konsonant verdoppeln (swim → swimming).' },
  word_order: { de: 'Wortstellung', tip: 'Achte auf die Reihenfolge: Subjekt – (Signalwort) – Verb – Objekt.' },
  missing_signal_word: { de: 'Signalwort fehlt', tip: 'Hier gehört ein passendes Signalwort dazu.' },
  wrong_signal_word: { de: 'Falsches Signalwort', tip: 'Dieses Signalwort passt nicht zur Zeitform.' },
  negation: { de: 'Verneinung', tip: 'Verneinung mit Hilfsverb + not (don’t, isn’t, didn’t, won’t …).' },
  question_formation: { de: 'Fragebildung', tip: 'Fragen: (Fragewort +) Hilfsverb + Subjekt + Verb.' },
  wrong_will_vs_going_to: { de: 'will / going to verwechselt', tip: 'will = Vermutung/Vorhersage, going to = Plan/sicher.' },
  stative_verb_progressive: { de: 'Verb ohne progressive', tip: 'like, love, know, want, understand … haben keine -ing-Form.' },
  missing_word: { de: 'Wort fehlt', tip: 'Da fehlt noch ein Wort.' },
  extra_word: { de: 'Wort zu viel', tip: 'Da ist ein Wort zu viel.' },
  vocabulary: { de: 'Wortschatz', tip: 'Prüfe die Wortwahl.' },
  off_topic: { de: 'Passt nicht zur Aufgabe', tip: 'Lies die Aufgabe noch einmal genau.' },
  illegible: { de: 'Unleserlich', tip: 'Schreib bitte etwas deutlicher.' },
} as const

export type ErrorTag = keyof typeof errorTags
export const errorTagList = Object.keys(errorTags) as ErrorTag[]

export function tagLabel(tag: string): string {
  return (errorTags as Record<string, { de: string }>)[tag]?.de ?? tag
}
export function tagTip(tag: string): string {
  return (errorTags as Record<string, { tip: string }>)[tag]?.tip ?? ''
}
