---
tags: [feature]
---
# Eldriks Schreibstube

Seit 2026-11-03 steht der Chronist Eldrik (Questgeber) nicht mehr als flache Pixelfigur am Pult, sondern hat eine eigene Ecke vor dem Turm, gebaut wie Odalindes Stand (Low-Poly + `humanoid`).

- **Stube** (`eldMesh`, zweimal gebacken): hinten Teppich, Bücherregal mit vier Brettern voller Bücher, Schädel und Schriftrollen obendrauf (`LPA.elB`); vorn Schreibpult mit aufgeschlagener Chronik, Tintenfass, Kerze, Bücherstapel auf dem Pult und am Boden (`LPA.elF`).
- **Eldrik**: indigoblaue Robe mit Goldsaum und Strickgürtel, Kapuze auf den Schultern, Glatze mit weißem Haarkranz, buschige Brauen, Brille (blitzt ab und zu), langer Bart bis zur Brust.
- **Runde** (`eldPose`, 15 s): schreiben (Zeilen erscheinen auf der Seite), Feder eintauchen, umblättern (Seite klappt über), Bart streichen und nachdenken, ein Buch zurück ins Regal stellen (von hinten), weiterschreiben. Ohne Feder in der Hand steht sie im Tintenfass.
- **Spieler nah** (< 3,6): er dreht sich zu ihm, hebt die Feder zum Gruß und hört dann zu (Hand am Bart).
- Kerze: Flamme, Schein und ein echtes Licht (`addLight`) in der Dunkelheit. Kollisionsradius `SOLID.chronist=.8`, damit man nicht durch das Pult läuft.
- Code: `src/js/980-eldrik-study.js` (ersetzt `drawChron` aus `500-odalinde-stall.js`; Platzierung, Gespräch und Questlogik bleiben dort). Das Porträt im Dialog trägt jetzt dieselben Farben.

Zurück zu [[Start]].
