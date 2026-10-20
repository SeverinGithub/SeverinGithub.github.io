# Sino — Website

## Fotos hinzufügen
1. Bilder (JPG/PNG/WebP) in den Ordner `photos/` legen. Am besten vorher auf ca. 2000 px Breite verkleinern.
2. Im Terminal im Ordner `sino` ausführen:
   ```
   node update-photos.mjs
   ```
3. Optional in `photos.js` pro Bild eine `caption` und eine `size` (`wide`, `tall`, `big`) eintragen.

## Texte, Sets und Links
Alles steht in `content.js`: Name, E-Mail, Social-Links, Laufband, Sets und die Texte (DE/EN).
`heroPhoto` und `aboutPhoto` legen fest, welches Foto oben bzw. neben „Über“ erscheint.

## Lokal ansehen
```
python3 -m http.server 8000
```
Danach http://localhost:8000/sino/ öffnen.
