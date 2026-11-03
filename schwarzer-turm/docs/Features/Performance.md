---
tags: [technik, performance]
---
# Performance und Renderer

Wunsch des Nutzers (2026-11-03): Das Spiel soll flüssiger laufen, auch mit mehr Spielern und mehr Inhalt. Das iPad ist das Gerät, auf dem es eng wird.

## Messanzeige
- Einschalten mit `?perf` in der Adresse (z. B. `…/schwarzer-turm/?perf`) oder Shift+F3. Modul `960-perf-overlay.js`.
- Zeigt einmal pro Sekunde:
  - FPS, Frame-Zeit (Mittel, p95, Maximum)
  - Logik (`update`), Zeichnen (`render`), HUD, GPU-Upload (`present`)
  - die teuersten Zeichenteile
  - Anzahl von Gegnern, Effekten, Geschossen und Objekten
  - interne Bildgröße, DPR, Zoom und Netzwerkpakete pro Sekunde
- Die Messwrapper entstehen erst beim Einschalten. Ohne `?perf` kostet das Modul nichts.

## Messung 2026-11-03 (Mac, 137 aktive Gegner, ~800 Partikel, Oberwelt)
| | vorher | nachher |
|---|---|---|
| Logik | 0,6–0,7 ms | unverändert |
| Zeichnen gesamt | 4,24 ms | **3,50 ms** |
| `drawObj` | 0,65 ms | 0,39 ms |
| `drawFxGlow` | 0,35 ms | 0,23 ms |

Fazit: Das Zeichnen kostet etwa 6× so viel wie die Logik. Engpass ist der Canvas-2D-Renderer, nicht die Sprache. Auf dem iPad (grob 3–5× langsamer) muss noch gemessen werden.

## Bisherige Optimierungen
- `hoverObj()`/`hoverEnemy()` rechnen nur einmal pro Frame bzw. Mausbewegung (`HOV`, Frame-Zähler `RF` in `render`). Vorher fragte jedes gezeichnete Objekt alle Objekte ab, der Aufwand wuchs also quadratisch.
- Licht in der Dunkelheit: eine vorgerenderte weiche Scheibe (`lightSpr`) statt eines neuen Radialverlaufs pro Licht und Frame. Lichter außerhalb des Bildes werden übersprungen.
- Vignette als zwischengespeichertes Bild (`vignette(w,h)`) statt eines Vollbild-Verlaufs pro Frame.
- Leuchteffekte (`drawFxGlow`) außerhalb des Bildes werden übersprungen. Schockwellen und Hiebe bleiben wegen ihrer Größe ausgenommen.

## Messung 2026-11-03 abends (Mac, iPad-Fenstergröße 1366×1024)
| Lage | Zeit pro Bild (CPU) |
|---|---|
| Dorf auf dem Hügel, stehen | 2,6 ms |
| Über die Inseln laufen (Chunks laden) | 1,9 ms, Spitze 9,5 ms |
| Ebene 8, 105–138 Gegner, 600–850 Effekte, Kampf | 2,3–4,7 ms |

Teuerste Teile im Kampf: `drawEnemy` (~1,2 ms, mit Impostor-Cache ab 30 Gegnern), GPU-Upload `present` (~0,6 ms), `update` (~0,6 ms), `drawFxGlow` (~0,4 ms). Selbst der große Kampf nutzt also nur gut die Hälfte eines 120-Hz-Bildes. Lange Aufgaben (über 50 ms) gab es keine.

**Ursache für das Ruckeln:** Die Kamera folgte dem Helden pro Bild um 15 % des Abstands, egal wie lange das Bild dauerte. Schwankte die Bildzeit (120-Hz-Bildschirm, ein ausgefallenes Bild), sprang der Held gegen den Hintergrund: gerechnet um 5,4 Bildschirmpixel bei einem ausgefallenen Bild. Jetzt folgt die Kamera nach Zeit (`1-0.85^(dt·60)`, `camT` in `render`). Der Sprung liegt bei 0,8 px.

**Lebens- und Manakugel:** `paintOrb` liest die Kugel zurück und rastert sie (`quantize`). Das geschah bisher zweimal pro Bild. Jetzt passiert es höchstens 30-mal pro Sekunde, und sofort, wenn sich der Stand ändert (`ORBT`).

## Nächster großer Schritt: GPU-Renderer
- Alle Sprites (Boden, Wände, Props, Figuren nach `quantize`) kommen in Texturatlanten und werden in WebGL als Instanzen gezeichnet: ein Aufruf pro Ebene statt Tausender `drawImage`.
- Licht und Dunkelheit als Shader statt `destination-out`-Maske. Partikel als Punkt-Sprites auf der GPU.
- Der Boden in Chunks vorgerendert (Cache pro 16×16 Kacheln, ungültig bei Änderung von `m.t`).
- Vorgehen: zuerst mit `?perf` auf dem iPad messen, dann den neuen Renderer als eigenes Modul neben dem alten bauen, umschaltbar in den Einstellungen, bis er alles kann.

Zurück zu [[Start]].
