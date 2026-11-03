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

## Nächster großer Schritt: GPU-Renderer
- Alle Sprites (Boden, Wände, Props, Figuren nach `quantize`) kommen in Texturatlanten und werden in WebGL als Instanzen gezeichnet: ein Aufruf pro Ebene statt Tausender `drawImage`.
- Licht und Dunkelheit als Shader statt `destination-out`-Maske. Partikel als Punkt-Sprites auf der GPU.
- Der Boden in Chunks vorgerendert (Cache pro 16×16 Kacheln, ungültig bei Änderung von `m.t`).
- Vorgehen: zuerst mit `?perf` auf dem iPad messen, dann den neuen Renderer als eigenes Modul neben dem alten bauen, umschaltbar in den Einstellungen, bis er alles kann.

Zurück zu [[Start]].
