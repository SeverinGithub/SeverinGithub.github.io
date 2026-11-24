# Taktwerk

Konzept und spielbarer Frontend-Prototyp einer Drum Machine fürs iPad. Tempo und Stil wählen, Play drücken, und die Engine hängt die Teile eines Kits (Intro, Groove A/B, Variation, Fill, Break) zu variierenden 16-Takt-Phrasen aneinander. Mit Groove-Editor für eigene Grooves.

- `index.html` – die ganze App (HTML, CSS, JS, Web Audio), ohne Build-Schritt.
- `samples/` – One Shots aus der Native-Instruments-Library „Higher Place“, gebündelt als AAC-Sprites (eine Datei pro Instrumentgruppe) plus `manifest.json`. Der Ordner ist per `.gitignore` ausgeschlossen, weil die Samples lizenziert sind und nicht öffentlich ins Repo gehören. Ohne ihn spielt die Seite mit Synth-Klängen.
- `tools/build_sprites.py` – erzeugt `samples/` aus dem Library-Ordner (braucht macOS `afconvert`):

```bash
python3 tools/build_sprites.py "/Pfad/zu/NI Higher Place bib" samples
```

Eigene Grooves speichert die Seite auf GitHub Pages im Browser (localStorage), in der claude.ai-Fassung im Konto.

## Eigene Library importieren

In der App links beim Kit auf „Importieren“ tippen und den Library-Ordner wählen, in dem die Ordner `Drums` und `One Shots` liegen (auf iPad/iPhone vorher in der Dateien-App komprimieren und die Zip-Datei wählen). Die App ordnet jeden Sound über Ordner- und Dateinamen einem Instrument zu (Kick, Snare, Clap, Hats, Percussion, Becken; Akkorde, Pads, Bass, Vocals, Effekte, Keys, Brass, Streicher) und macht aus jedem Songnamen ein Kit. Die Sounds werden im Browser verarbeitet und im Gerät gespeichert (IndexedDB), hochgeladen wird nichts.
