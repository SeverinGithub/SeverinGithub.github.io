# Handoff: Grinder — Golf Scorecard App

## Overview
**Grinder** ist eine mobile Golf-Scorecard-App (Smartphone, Hochformat). Sie ist bewusst „easy access": man stellt am Platz schnell Spieler + Platz + Lochzahl + Zählweise ein, trägt dann Loch für Loch die Schläge über große +/- Tap-Buttons ein und bekommt am Ende eine Zusammenfassung mit Endstand, Loch-für-Loch-Übersicht und Teilen-Funktion. Gespielte Runden landen im Verlauf.

Zielplattform: zunächst **iOS/Smartphone, Hochformat** (im Prototyp im iPhone-Rahmen dargestellt). Datenhaltung soll später über **Supabase** laufen.

## About the Design Files
Die Dateien in diesem Paket sind **Design-Referenzen, in HTML/React (Babel-in-Browser) gebaut** — Prototypen, die Aussehen und Verhalten zeigen. Sie sind **nicht** als Produktionscode zum 1:1-Kopieren gedacht.

Aufgabe für Claude Code: **diese Designs in der Zielumgebung neu umsetzen** (z. B. React Native / Expo, Flutter, SwiftUI oder eine PWA mit React/Vue) anhand der dort etablierten Patterns und Libraries. Falls noch keine Codebasis existiert, das am besten passende Framework wählen — für „eine App am Golfplatz + Supabase" bietet sich **React Native (Expo) + Supabase** oder eine **React-PWA + Supabase** an.

Wichtig: Im Prototyp läuft alles clientseitig (State in React, Persistenz in `localStorage`). Die Datenstruktur wurde aber bereits **Supabase-ready** modelliert (siehe „Datenmodell & Supabase-Schema").

## Fidelity
**High-fidelity (hifi).** Finale Farben, Typografie, Spacing, Radien, Schatten und Interaktionen sind ausgearbeitet. Die UI soll möglichst pixelnah mit den Libraries/Patterns der Zielcodebasis nachgebaut werden. Es gibt **3 Theme-Varianten** (Fairway / Midnight / Links) — der Nutzer entscheidet sich für eine; bis dahin alle drei als Theme-Tokens anlegen.

---

## Design-System

### Schrift
- **Archivo** (Google Fonts), inkl. Width-Achse. Display/große Zahlen nutzen `font-stretch: 125%` (Klasse `.expanded`) + Weight 800–900.
- Alle Zahlen mit `font-variant-numeric: tabular-nums` (Score-Ausrichtung).
- Gewichte im Einsatz: 600 (Labels/Sekundär), 700 (Buttons/Werte), 800–900 (Headlines/Scores).

### Farb-Themes (CSS Custom Properties, gesetzt über `[data-theme="…"]`)

**Theme A — `fairway` (hell, clean, Empfehlung)**
| Token | Wert |
|---|---|
| `--bg` | `#E9EFE8` |
| `--bg-2` | `#DFE7DD` |
| `--surface` | `#FFFFFF` |
| `--surface-2` | `#F0F4EF` |
| `--ink` | `#112019` |
| `--ink-soft` | `#586a60` |
| `--ink-faint` | `#93a199` |
| `--line` | `rgba(17,32,25,.09)` |
| `--line-strong` | `rgba(17,32,25,.16)` |
| `--primary` | `#11824A` |
| `--primary-strong` | `#0C6038` |
| `--on-primary` | `#FFFFFF` |
| `--accent` | `#B7ED3C` |
| `--accent-ink` | `#1d2b07` |
| `--under` (unter Par/gut) | `#11824A` |
| `--over` (über Par) | `#C9603A` |
| `--shadow-sm` | `0 1px 2px rgba(17,32,25,.06), 0 4px 12px rgba(17,32,25,.05)` |
| `--shadow-md` | `0 2px 6px rgba(17,32,25,.07), 0 16px 36px rgba(17,32,25,.09)` |

**Theme B — `midnight` (dark sport)**
| Token | Wert |
|---|---|
| `--bg` | `#0A120E` · `--bg-2` `#0E1813` |
| `--surface` | `#15211B` · `--surface-2` `#1D2C24` |
| `--ink` | `#ECF4EE` · `--ink-soft` `#9cb0a5` · `--ink-faint` `#647a6e` |
| `--line` | `rgba(255,255,255,.08)` · `--line-strong` `rgba(255,255,255,.16)` |
| `--primary` | `#2ECC71` · `--primary-strong` `#25A85E` · `--on-primary` `#04130A` |
| `--accent` | `#C7F24B` · `--accent-ink` `#10200a` |
| `--under` | `#2ECC71` · `--over` `#F0875A` |

**Theme C — `links` (tiefes Turf-Grün, edle Screenshot-Variante)**
| Token | Wert |
|---|---|
| `--bg` | `#0E3D2A` · `--bg-2` `#0B3323` |
| `--surface` | `#134A33` · `--surface-2` `#0C3A28` |
| `--ink` | `#F5F1E2` · `--ink-soft` `#b9caba` · `--ink-faint` `#82997f` |
| `--line` | `rgba(245,241,226,.13)` · `--line-strong` `rgba(245,241,226,.24)` |
| `--primary` | `#DCEB4E` · `--primary-strong` `#C8D63C` · `--on-primary` `#143524` |
| `--accent` | `#F5F1E2` · `--accent-ink` `#143524` |
| `--under` | `#DCEB4E` · `--over` `#F0A95D` |

### Radien / Spacing / Motion
- Radien: `--r-sm 12px`, `--r-md 18px`, `--r-lg 26px`, `--r-xl 34px`; runde Buttons/Avatare = `50%`.
- Screen-Padding horizontal meist `18px`; Karten-Padding `12–18px`; Gaps `8–12px`.
- Easing: `cubic-bezier(.22,1,.36,1)`. Screen-Einblendung: 0.34s (opacity 0→1, translateY 8px→0). Score-Button-Pop: 0.26s. **Wichtig:** Sichtbarer End-Zustand = Basis-Style; nur die Einblendung *von* versteckt animieren (sonst Inhalt unsichtbar, wenn Animation nicht läuft). `prefers-reduced-motion` respektieren.
- Tap-Targets: +/- Score-Buttons sind 60×60 px (groß, für draußen/mit Handschuh). Min. überall ≥ 44 px.

---

## Screens / Views

### 1. Setup (`SetupScreen`)
**Zweck:** Runde in wenigen Taps aufsetzen.
**Layout:** Vertikal scrollbar, Sektionen mit Uppercase-Label (`--ink-faint`, letter-spacing .1em).
- **Wordmark** oben links: grünes Flag-Icon (34×34, Radius 10) + „GRINDER" (expanded, 900, 30px). Rechts ein runder Icon-Button (Uhr) → Verlauf, nur wenn Historie existiert.
- **Spieler:** Liste von Karten (`--surface`, Radius 16, shadow-sm). Jede Zeile: Avatar (Initiale, Farbe rotierend aus Palette) + Texteingabe (Name) + X-Button zum Entfernen (ab >1 Spieler). Darunter gestrichelter „+ Spieler hinzufügen"-Button. Default: 1 Spieler „Spieler 1". Max = `maxPlayers` (default 8).
- **Platz:** Auswahlkarten (4 Presets: Eichenhof GC, Seeblick Links, Tannenpark, Heidehof Resort — je Name, Location, „Par XX"). Aktiver = `inset 0 0 0 2px var(--primary)` + grüner Check-Kreis. Plus „Eigener Platz" → klappt Texteingabe für Platznamen auf.
- **Löcher:** Segmented Control (4 Optionen: 3 / 6 / 9 / 18), Default 9.
- **Zählweise:** Karte mit 3 Zeilen + Toggles: „Schläge zählen" (immer aktiv, gesperrt), „Par-Vergleich" (Default an), „Stableford" (Default aus). Hinweistext: Zählweise nur vor Start wählbar.
- **Sticky-Footer:** Großer Primär-Button „Runde starten · N Löcher" (disabled bis ≥1 gültiger Name). Footer mit Gradient-Fade zum Hintergrund.

### 2. Spiel — Loch-Ansicht (`PlayScreen` → `HoleView`)
**Zweck:** Schläge schnell Loch für Loch eintragen.
**Header (TopBar):** links X (Runde verwerfen, mit Confirm), Mitte Platzname + „N Löcher · Location", rechts Icon-Button zum Umschalten auf die Scorecard-Tabelle.
**Inhalt:**
- Großer Loch-Indikator: „LOCH" Label + riesige Zahl `h+1` (expanded, 900, 60px) mit `/N` in `--ink-faint`. Rechts kleine Par-Karte mit eigenem -/+ Stepper (Par 3–6).
- Fortschrittsleiste: N kleine Segmente (aktuelles Loch = `--primary`, gespielte = abgeschwächt, offene = `--surface-2`), klickbar zum Springen.
- Pro Spieler eine Karte: Avatar + Name + Lauf-Stand („Ges. X", vs-Par farbig wenn `modePar`, „· Y Pkt" wenn `modeStbl`) + (wenn `modePar`) Score-Pill (Birdie/Par/Bogey…). Darunter zentriert der **große Stepper** (−  Zahl  +), Buttons 60×60.
**Footer:** Zurück-Pfeil (disabled auf Loch 1) + Primär-Button „Weiter zu Loch X" (bzw. „Weiter"); auf dem letzten Loch stattdessen Accent-Button „Runde beenden".

### 3. Spiel — Scorecard-Tabelle (`PlayScreen` → `CardView`)
Klassische Scorecard (wie Referenz-Screenshot, aber cleaner): Header-Zeile (LOCH / PAR / Avatare). Pro Loch eine klickbare Zeile (Loch-Nr, Par, je Spieler die Schläge; Unter-Par = `--under`, Über-Par = `--over`). Aktuelles Loch leicht eingefärbt. Total-Zeile unten (GES, Summe Par, Summe Schläge). Tippen auf eine Zeile → zurück in die Loch-Ansicht bei diesem Loch. Spaltenbreite passt sich an Spielerzahl an.

### 4. Zusammenfassung (`SummaryScreen`)
**Header:** „Geschafft!" + Platzname; rechts Teilen-Icon.
- **Sieger-Hero:** `--primary`-Karte, „SIEGER"/„Deine Runde", großer Name (expanded), Stat-Reihe: Schläge, (wenn modePar) zum Par, (wenn modeStbl) Stableford. Dezentes Trophy-Wasserzeichen.
- **Endstand-Leaderboard** (ab 2 Spielern): Rang-Badge (1. Platz = Accent), Avatar, Name, rechts Punkte (Stableford) oder Schläge + vs-Par.
- **Loch für Loch:** pro Spieler ein Strip aus 30×30-Zellen, farbcodiert nach Score-Differenz.
**Footer:** „Verwerfen" (ghost) + „Speichern" (primär, → Verlauf). Im Read-only-Modus (aus Verlauf geöffnet): nur „Scorecard teilen".
**Ranking-Logik:** mit Stableford → höhere Punkte besser; sonst → weniger Schläge besser. Gleichstände teilen sich den Rang.

### 5. Teilen (`ShareSheet`)
Bottom-Sheet (überlagert, abgedunkelter Hintergrund). Vorschaukarte (`--primary`) mit Platzname, Lochzahl und Ergebnisliste. Buttons „Schließen" + „Text kopieren" (nutzt `navigator.clipboard`, Feedback „Kopiert!"). Kopierter Text z. B.: `⛳ Eichenhof GC · 9 Löcher` + Zeilen je Spieler + `— via Grinder`.

### 6. Verlauf (`HistoryScreen`)
Header mit Zurück + (wenn vorhanden) Löschen. Liste vergangener Runden: Flag-Icon, Platzname, „N Löcher · relative Zeit · Spielerzahl", Sieger-Zeile. Tippen → Zusammenfassung read-only. Leerzustand mit Uhr-Icon.

---

## Interactions & Behavior
- **Navigation:** zustandsbasiert: `setup → play → summary`; `setup ⇄ history`; `history → view (read-only summary)`.
- **Score-Eingabe:** +/- am Stepper, Clamp 1–15. Par-Stepper Clamp 3–6.
- **Lebende Runde:** wird bei jeder Änderung persistiert; beim App-Start automatisch fortgesetzt, falls vorhanden.
- **Runde beenden:** wechselt zur Zusammenfassung (Runde bleibt „live" bis Speichern/Verwerfen). „Speichern" schreibt in den Verlauf und räumt die Live-Runde auf; „Verwerfen" löscht ohne Speichern (beides → Setup).
- **Theme-Wechsel:** über externe „Variante"-Leiste (Fairway/Midnight/Links) und im Tweaks-Panel. In der echten App als App-Einstellung umsetzen; Theme persistieren.
- **Animationen:** Screen-Einblendung 0.34s; Score-Pop 0.26s; Bottom-Sheet fade/slide. Reduced-motion beachten.

## State Management
Zentraler App-State:
- `themeId` ('fairway' | 'midnight' | 'links') — persistiert.
- `view` ('setup' | 'play' | 'summary' | 'history' | 'view').
- `round` — aktive Runde (siehe Datenmodell), persistiert als „live round".
- `viewRound` — read-only Runde aus Verlauf.
- `share` — welche Runde gerade im Teilen-Sheet liegt (oder null).
- `history` — Array gespeicherter Runden.

## Datenmodell & Supabase-Schema
Das Runden-Objekt im Prototyp:
```js
{
  id, courseId, courseName, location,
  holes,            // 3 | 6 | 9 | 18
  pars: [int],      // Länge = holes
  modePar: bool, modeStbl: bool,
  players: [{ id, name }],
  scores: { [playerId]: [int|null]  },  // Index = Loch, null = nicht gespielt
  currentHole, startedAt, status, finishedAt
}
```
**Scoring-Regeln:**
- Stableford (gross, ohne Handicap): `points = max(0, 2 - (strokes - par))` → Par=2, je Schlag drunter +1, drüber −1, min 0.
- vs-Par in Summen immer über **gespielte** Löcher rechnen (nicht über das gesamte Platz-Par), damit Teilrunden korrekt sind.

**Vorgeschlagenes Supabase-Schema** (steht auch als Kommentar in `grinder-logic.jsx`):
```sql
courses (id uuid pk, name text, location text, pars int[], created_at timestamptz)
rounds  (id uuid pk, user_id uuid → auth.users, course_id uuid → courses, course_name text,
         holes int, pars int[], mode_par bool, mode_stbl bool,
         status text ['live'|'done'], started_at timestamptz, finished_at timestamptz)
players (id uuid pk, round_id uuid → rounds on delete cascade, name text, seat int)
scores  (id uuid pk, round_id uuid → rounds on delete cascade,
         player_id uuid → players on delete cascade, hole int, strokes int,
         unique(player_id, hole))
-- RLS überall auf user_id = auth.uid()
```
Migrationspfad: `localStorage`-Persistenz im Prototyp 1:1 gegen Supabase-Queries tauschen; Live-Runde = `rounds.status='live'`, Verlauf = `status='done'`.

## Assets
- **Schrift:** Archivo (Google Fonts). Keine Bild-Assets nötig.
- **Icons:** alle inline als SVG (stroke, currentColor) im Prototyp (`Icon`-Komponente: flag, plus, minus, left/right, x, check, share, trophy, clock, user, grid/list/cards, settings). In der echten App durch ein Icon-Set der Codebasis ersetzen (z. B. Lucide/SF Symbols).
- **iPhone-Rahmen** im Prototyp ist nur Darstellung (Starter-Komponente) — in der echten App nicht nachbauen.

## Files (in diesem Paket)
- `Golf Grinder.html` — lauffähiger Gesamt-Prototyp (alle Module inline; öffnen im Browser).
- `grinder-theme-source.css` — Design-Tokens / Themes (Referenz; im HTML inline).
- `grinder-logic.jsx` — Datenmodell, Scoring (Stableford/vs-Par), Persistenz, **Supabase-Schema-Kommentar**.
- `grinder-ui.jsx` — UI-Primitive (Icon, Btn, Seg, Card, BigStepper, ScorePill, Label, Avatar).
- `grinder-setup.jsx` — Setup-Screen + TopBar.
- `grinder-play.jsx` — Loch-Ansicht + Scorecard-Tabelle.
- `grinder-summary.jsx` — Zusammenfassung, Teilen-Sheet, Verlauf.
- `grinder-app.jsx` — App-Routing, Theme-Store, Mounting.

> Hinweis: Der Prototyp lädt React über CDN und kompiliert JSX im Browser (Babel) — nur fürs Prototyping. In Produktion mit echtem Build/Toolchain der Zielplattform umsetzen.
