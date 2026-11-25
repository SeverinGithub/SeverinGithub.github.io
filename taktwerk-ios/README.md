# Taktwerk für iPad (Swift)

Native iPad-App von Taktwerk in SwiftUI mit eigener Audio-Engine. Die Web-Alpha unter `../taktwerk/` (live unter `/taktwerk/play/`) bleibt unverändert und läuft weiter.

## Starten

1. `Taktwerk.xcodeproj` in Xcode öffnen (Xcode 16 oder neuer, iPadOS 17 oder neuer).
2. Für ein echtes iPad: Target „Taktwerk“ → *Signing & Capabilities* → dein Team wählen. Ist die Bundle-ID vergeben, eine eigene eintragen.
3. iPad per Kabel anschließen (beim ersten Mal den Entwicklermodus auf dem iPad einschalten) und auf Run drücken.

Bauen für den Simulator geht auch ohne Xcode-Oberfläche:

```bash
tools/build.sh
```

## Samples

- Liegen die Higher-Place-Sprites lokal unter `../taktwerk/samples/` (erzeugt mit `../taktwerk/tools/build_sprites.py`), kopiert der Build-Schritt „Samples kopieren“ sie ins App-Bundle. Im Repo liegen sie nicht.
- Ohne sie startet die App mit Synth-Klängen.
- **Eigene Library:** „Importieren“ → „Ordner wählen“ → den Ordner mit „Drums“ und „One Shots“ aus der Dateien-App wählen (iPad, iCloud Drive oder USB-Stick). Die Zuordnung zu den Instrumenten ist dieselbe wie im Web. Der Import liegt danach in der App (`Application Support/Library`) und ist beim nächsten Start sofort da.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `Taktwerk/Model/Data.swift` | Stile, Teile, Übergangstabelle, Makros (1:1 aus der Web-Fassung) |
| `Taktwerk/Model/Generator.swift` | Teile erzeugen, euklidische Rhythmen, Format eigener Grooves |
| `Taktwerk/Model/Taktwerk.swift` | Zustand, Arrangement-Kette, Sequencer, alle Aktionen, Groove-Editor |
| `Taktwerk/Audio/AudioCore.swift` | AVAudioEngine mit eigenem Render-Callback, sample-genaues Einplanen, Choke-Gruppen, Kompressor |
| `Taktwerk/Audio/DSP.swift` | Hüllkurven nach Web-Audio-Art, Biquad, Oszillatoren, Sample-Stimme |
| `Taktwerk/Audio/Voices.swift` | Die zwölf Synth-Klänge |
| `Taktwerk/Audio/Library.swift` | Sprites laden, Import aus Ordner, Zuordnung, Gerätespeicher |
| `Taktwerk/UI/*` | Hauptbildschirm, Editor, Import, Theme |

## Unterschiede zur Web-Fassung

- Spielt auch bei stummgeschaltetem iPad und im Hintergrund weiter, auch zusammen mit Musik aus anderen Apps.
- Der Import liest einen Ordner direkt, eine Zip-Datei ist nicht nötig.
- Eigene Grooves liegen in `Documents/grooves.json`, im selben Format wie im Web.
- Die Pegelanzeige ist eine kleine Spektralanzeige wie der Analyser im Web.

## Zum Testen (nur Debug-Builds)

Start-Argumente: `-autoplay` (Wiedergabe startet), `-editor` (Editor mit neuer Reihe), `-import` (Import-Fenster), `-importPath <Ordner>` (importiert direkt, im Simulator auch einen Mac-Pfad).
