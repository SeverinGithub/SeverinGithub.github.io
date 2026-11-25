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

## Bereiche

- **Home:** Einstieg mit den Kacheln Taktwerk und Sounds, dazu die Einstellungen: mit Musik aus anderen Apps spielen, im Hintergrund weiterspielen, Bildschirm bleibt an, Hall passt sich dem Stil an, Zurücksetzen.
- **Taktwerk:** das Instrument. Oben links geht es zurück zu Home, neben dem Tempo liegt TAP fürs Tap-Tempo. Die rechte Spalte hat drei Reiter:
  - **Makros:** die sechs Regler wie bisher.
  - **Mixer:** Master, Lautstärke pro Spur (Doppeltipp setzt auf 0 dB), Stumm und Solo.
  - **FX:** Hall, Raumgröße, Dämpfung und Kompressor.
- **Sounds:** Quellen verwalten und jeden Sound anhören, nach Instrument, Kit oder Name gefiltert.

## Samples

- Liegen die Higher-Place-Sprites lokal unter `../taktwerk/samples/` (erzeugt mit `../taktwerk/tools/build_sprites.py`), kopiert der Build-Schritt „Samples kopieren“ sie ins App-Bundle. Im Repo liegen sie nicht.
- Ohne sie startet die App mit Synth-Klängen.
- **Eigene Libraries:** Im Bereich Sounds „Quelle hinzufügen“ antippen und einen Ordner mit „Drums“ und „One Shots“ aus der Dateien-App wählen (iPad, iCloud Drive oder USB-Stick). Jede Library wird eine eigene Quelle neben den vorhandenen. Quellen lassen sich an- und abschalten oder entfernen. Steckt derselbe Sound in mehreren Quellen, zählt er nur einmal. Die Zuordnung zu den Instrumenten ist dieselbe wie im Web.
- Gespeichert wird unter `Application Support/Libraries/<id>/`, die Liste der Quellen in `sources.json`. Ein Import aus der ersten Fassung wird beim Start automatisch zur ersten Quelle.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `Taktwerk/Model/Data.swift` | Stile, Teile, Übergangstabelle, Makros (1:1 aus der Web-Fassung) |
| `Taktwerk/Model/Generator.swift` | Teile erzeugen, euklidische Rhythmen, Format eigener Grooves |
| `Taktwerk/Model/Taktwerk.swift` | Zustand, Arrangement-Kette, Sequencer, alle Aktionen, Groove-Editor |
| `Taktwerk/Audio/AudioCore.swift` | AVAudioEngine mit eigenem Render-Callback, sample-genaues Einplanen, Choke-Gruppen, Hall-Bus, Master, Kompressor (Stereo) |
| `Taktwerk/Audio/DSP.swift` | Hüllkurven nach Web-Audio-Art, Biquad, Oszillatoren, Sample-Stimme, Hall (Freeverb) |
| `Taktwerk/Audio/Voices.swift` | Die zwölf Synth-Klänge |
| `Taktwerk/Audio/Library.swift` | Sprites laden, Sound-Quellen, Import aus Ordner, Zuordnung, Gerätespeicher |
| `Taktwerk/UI/HomeView.swift` | Startbildschirm und Einstellungen |
| `Taktwerk/UI/MainView.swift` | Navigation, Taktwerk-Bildschirm, Mixer, FX |
| `Taktwerk/UI/SoundsView.swift` | Quellen und Sound-Browser |
| `Taktwerk/UI/EditorView.swift`, `Theme.swift` | Groove-Editor, gemeinsame Bausteine |

## Unterschiede zur Web-Fassung

- Spielt auch bei stummgeschaltetem iPad und im Hintergrund weiter, auch zusammen mit Musik aus anderen Apps.
- Der Import liest einen Ordner direkt, eine Zip-Datei ist nicht nötig.
- Eigene Grooves liegen in `Documents/grooves.json`, im selben Format wie im Web.
- Die Pegelanzeige ist eine kleine Spektralanzeige wie der Analyser im Web.

## Zum Testen (nur Debug-Builds)

Start-Argumente: `-play` oder `-sounds` (Bereich öffnen), `-autoplay` (Wiedergabe startet), `-editor` (Editor mit neuer Reihe), `-mixer` oder `-fx` (Reiter rechts), `-importPath <Ordner>` (fügt eine Quelle hinzu, im Simulator auch von einem Mac-Pfad).
