# Images and assets

| Asset | Where | Status |
|---|---|---|
| Park scene (L02 "What are the people doing?", L08 "What were the people doing yesterday?") | `src/components/ParkScene.tsx` | Own SVG illustration, not taken from the PDF. The scene content is in `parkFacts` and in the AI prompt (`supabase/functions/evaluate/index.ts`) |
| Josh's day (L15) | Emoji pictograms 🚿 🏫 🎸 🍕 📺 in `Exercises.tsx` | Placeholder, could be replaced with own icons |
| Mascot Rufus | `src/components/Mascot.tsx` | Own SVG, moods: neutral, motivated, think, read, happy, celebrate, sad, sleep |
| App icon | `public/icons/fox.svg` (+ PNGs) | Own SVG |

No images were cropped from the worksheets, so there is no `asset_license: "placeholder"`.
Before release: ask the client whether to draw more illustrations (spec 13.5).
