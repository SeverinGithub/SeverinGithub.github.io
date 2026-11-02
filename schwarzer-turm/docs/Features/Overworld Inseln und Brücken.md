---
tags: [feature, welt]
---
# Overworld: Inseln und Brücken

Umgesetzt in `386bf34` (2026-11-02): abwechslungsreichere Himmelsinseln.

## Inselgrößen
- `bigIsland(cx,cy)`: Chunks werden in 2×2-Blöcke gruppiert (`bx=cx>>1`). Ausgeschlossen: Rand, Startinsel (`isHomeC`), Weltboss-Chunks (`wbChunks()`), Nähe zur Mitte (Abstand < 3,4 zu 40/39.5).
- Hash `h=hsh(bx,by,31)`:
  - `h<.13` → **Rieseninsel** (`big:'mega'`) über alle 4 Chunks, Radius 15–19,6.
  - `h<.36` → **Langinsel** (`big:'long'`) über 2 Chunks (waagerecht `sx:1.75` oder senkrecht `sy:1.75`), Radius 8–10.
  - sonst normale Insel.
- Art per Gewichtung `BIGK`: wild 26, forest 20, village 18, ruins 14, grave 10, camp 12. Der erste Chunk ist „Anführer“ und bekommt Feuer und Händler. `sameIsl(A,B)` erkennt zwei Chunks derselben großen Insel (keine Brücke dazwischen).
- Inselkanten: `cliffVariants()` – 6 Varianten je Seite (Grasrand, Erdband mit Kieseln, facettierter Fels, Schichtlinien, Steine, Moos, Wurzeln, Efeu, Pilze, seltene Kristalle, Spalten), Auswahl per Tile-Hash (`CLV`).

## Brücken
- `bridgeKind(...)`: zur Startinsel immer Stein; sonst per Hash 40 % Stein, 32 % Holz, 28 % Landbrücke.
- **Holz:** schmale Plankenbrücke (Sprites `SPR.bridgeW`, Unterseite `SPR.bridgeSideW` mit Balken und hängenden Seilen), Seilpfosten `SPR.prop.ropepost` mit durchhängendem Seil. Fix: Brüstungs-Tiles bei Holz nur jedes zweite Feld (`if(bk==='wood'&&q%2)return`), sonst sah der Rand kammartig aus.
- **Land:** gewundene Brücke aus Erde und Gras.

## Ebenfalls in `386bf34`
- Umhänge (später wieder entfernt, siehe [[Ausrüstung und Kleinigkeiten]]).
- Bosstod: Musik verstummt sofort, Sieg-Sound, dann setzt die Musik wieder ein.

Zurück zu [[Start]].
