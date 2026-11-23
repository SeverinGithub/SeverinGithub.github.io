# English Fox GT – Grammar Trainer (PWA)

Learning path through the 17 grammar worksheets (simple present → past perfect + 2× mixed tenses),
with stars, Speed points, a streak, mistake practice and handwriting via Apple Pencil.

Live: https://severingithub.github.io/english-fox/

## Development

```
npm install
npm run dev        # http://localhost:5173
npm test           # matcher, answer keys, streak/freeze/badges
npm run build      # -> dist/ (built automatically by GitHub Actions on push)
```

## How answers are checked

| Mode | Input | Checking |
|---|---|---|
| **Text fields** (default) | Keyboard, or Apple Pencil via iPad "Scribble" directly into the field | On the device against `content/solutions` (patterns, spelling tolerance, self-check for free answers) |
| **Apple Pencil (AI)** | Canvas per gap/line, palm rejection, eraser, undo | Supabase Edge Function `evaluate` → Claude reads the handwriting, the server re-checks against the answer key |

Switch in the app: Profil → Einstellungen.

## Setting up AI handwriting checking (once)

1. Create a project at https://supabase.com, install the Supabase CLI, `supabase link`.
2. `supabase db push` (table `eval_usage` for the daily limit).
3. Set the secrets:
   ```
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-... FAMILY_CODE=<choose your own code> EVAL_DAILY_LIMIT=300
   ```
   Optional: `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`).
4. `npm run sync:functions && supabase functions deploy evaluate --no-verify-jwt`
5. In the app: Profil → Einstellungen → KI-Adresse `https://<project>.supabase.co/functions/v1/evaluate` + Familien-Code.

The API key exists only in Supabase. The function uses server-side refusal fallback (`fallbacks: "default"`).

## Content

- `content/lessons/*.json` – worksheets (one exercise = one screen), `content/units.json` – sectors.
- `content/solutions/*.json` – answer keys. **Please review:** `docs/REVIEW_NEEDED.md`.
- New lesson = new JSON file + answer key, no code needed. New exercise type = component + entry in `exerciseRegistry`.
- Name/mascot: `src/config/brand.ts`, racing wording: `src/config/theme.ts`, stars/XP: `src/config/scoring.ts`.

## iPad test checklist (Ink)
- [ ] Pencil writes, finger scrolls the page
- [ ] Palm on the screen while writing leaves no strokes
- [ ] Eraser / undo / clear work, Pencil eraser (if available)
- [ ] Field grows when you write down to the bottom edge
- [ ] Standalone mode after "Zum Home-Bildschirm", app starts offline

## Gamification
- **Stars, Speed (XP), trophies, streak** – rules in `src/config/scoring.ts`.
- **Safety Car (streak freeze):** costs 25 trophies in Profil, max. 2 in stock. Missed days are bridged automatically if there are enough.
- **Badges:** `src/config/achievements.ts`, derived from progress (each new badge +10 trophies). Shown in Profil and on the result screen.

## Offline queue (AI checking)
If a handwritten exercise cannot reach the AI (offline, timeout, server error), it waits in a queue and the lesson goes on.
The app retries when the device is online again (plus every 30 s, or "Nochmal versuchen"); the feedback for those exercises is shown before the result screen.
The queue lives only in the running lesson: leaving the lesson drops it (the quit dialog warns).

## Not built yet (compared with the spec)
- Supabase Auth with invite codes, admin area (/admin/codes, /users, /progress, /review). Access to the AI is currently protected only by the family code. Progress is stored per device (localStorage).
- Leaderboard (phase 2), Playwright E2E.
