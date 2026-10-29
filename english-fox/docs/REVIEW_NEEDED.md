# Answer keys: please review

I wrote all the answer keys in `content/solutions/*.json` myself, from the 17 scanned worksheets (scan dated 27.10.2026). I ignored the blue handwritten answers on the scan. A teacher should check the items below, because more than one answer is possible or the worksheet itself is ambiguous.

How to change a key: edit `content/solutions/<lesson>.json`. Field `a` is the list of accepted answers. Patterns are allowed: `(a|b)`, optional parts `(x )?`, slots such as `{adv}` (frequency adverb) and `{time}` (time expression). The full list is in `shared/match.ts`. Afterwards run `npm test`. It checks that every model answer matches its own pattern.

## Ambiguous items

| Item | Question | Current decision |
|---|---|---|
| L01-E1-1 | "___ Sandra ___ (go) to the park?" on the simple present sheet | Does / go (the example in the spec, "Is … going", is the pupil's wrong answer) |
| L01-E3-1 | Original says "elefant" | Changed to "elephant" (multiple choice, not an error-finding task) |
| L01-E4-7 | "I don't the homework." | "I don't do the homework." and "I do the homework." both accepted |
| L02-E2-4 | "Grandma is in the kitchen." in present progressive | Sentence stays the same (be has no progressive form here) |
| L03-E4-13 | "garten" (typo in the original) | Kept, gap: are / are having |
| L03-E4-16 | "they ___ (eat) fruits" with no signal word | "eat" and "are eating" accepted |
| L03-E4-5/12/15/16 | Sentences without a signal word | Correct only if nothing is highlighted |
| L04-E2-1/7/8/11 | "if possible": sentences without a mistake | Button "Kein Fehler" is correct |
| L04-E2-6 | "She won't worry about the weather yesterday." | Both "… tomorrow" and "She didn't worry … yesterday" accepted |
| L04-E3-1 | Question for "I will buy …" | "Will I/you buy …?", "What will …", "When will …" accepted |
| L05-E1 | Worksheet has 6 lines for 8 plans | Modelled as 4 people × (✓ and ✗) = 8 sentences |
| L06-E2 | 18 cards instead of the 15 in the spec | All 18 included. Cards 3, 4, 5, 9, 10, 15, 18 accept both will and going to |
| L07-E2-5 | "Paula ___ in the kitchen." | "was" and "wasn't" are both correct |
| L07-E3-3/7 | Word box: wash / sell | Both accepted in each sentence; L07-E3-4: phoned / invited |
| L07-E4-4 | "ssiblings" (typo in the original) | Kept |
| L08-E2 | 16 rows instead of 15 | All 16 included |
| L09-E2-8 | "castel" (typo in the original) | Kept |
| L10-E1 | Item 4 "just – finished" | Changed to "finish" so the task stays consistent |
| L10-E2-6 | "Peter ___ me some chocolate ___ (buy)": signal word free choice | recently / so far / already / today |
| L11-E4-1 | "My family lived/has lived … for 2 years" | Only "has lived" (lived would also be possible if it is over) |
| L11-E4-7 | "This car has just crashed / crashed …" | Both accepted |
| L12-E4 | Numbering on the sheet has two "3." | Made into 9 separate sentences |
| L12-E4-6 | "Mum were cleaning my room." | "has been cleaning" and "was cleaning" accepted |
| L13-E2-7/15 | police chase / Dad sleep | Progressive and simple both accepted |
| L13-E3-5 | "The mechanic has repaired 3 cars." → progressive | Progressive with a quantity is unusual. Accepted with and without "3" |
| L13-E4-3/4/5 | work / take cards | Several forms accepted (see key) |
| L14-E3-2/3/8 | Error search, past perfect: sentences that are grammatically correct | "Kein Fehler" and the past perfect version both accepted |
| L14-E4-1 | "They allowed to play …" (grammatically odd in the original) | Kept, only the gap is graded |
| L15-E2 | Josh's day: free lines ("Before …", "After …", "When …") | Open: checked locally for the past perfect form, otherwise self-check |
| L15-E3-1 | "The car ___ (be) working because Dad had lost his keys" | "wasn't" and "was" accepted |
| L15-E4-5 | "aswer" (typo in the original) | Kept, relative clause with "which" |
| MX1/MX2 | Grid: column order of the empty headers | MX1: present perfect, past progressive, simple past, present progressive, simple present, will, going to. MX2: column 6 and column 8 can be present progressive or will (the learner chooses) |
| MX*-R last row | Signal words per tense | Free answer, checked by keyword |

## Open questions to the client
- Pictures: the park picture is my own SVG illustration (no crop from the PDF). Should I make more of my own illustrations (spec 13.5)?
