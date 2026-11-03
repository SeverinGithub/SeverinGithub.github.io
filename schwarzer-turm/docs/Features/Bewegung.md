---
tags: [feature]
---
# Bewegung: Stehen, Gehen, Laufen, Sprinten, Dash

Seit 2026-11-03 bewegen sich alle Figuren mit dem neuen Gang aus `humanoid` (`220-figures.js`): Helden aller Klassen, Mitspieler, Söldner, NPCs und menschliche Gegner.

## Gang (`humanoid`)
- `o.dir` ist die Richtung auf dem Bildschirm. Von der Seite sieht man, wie Knie und Ellbogen sich beugen; von vorn nur ein wenig davon (`kb`).
- Jeder Fuß steht eine Weile auf dem Boden und wird unter dem Körper nach hinten geschoben. Dann hebt er sich und schwingt im Bogen nach vorn. Die Stand-Anteile sind 62 % beim Gehen und 40 % beim Laufen.
- Knie per IK (`rgIK`, Oberschenkel 11,3, Schienbein 10,7). Je schneller die Figur ist, desto höher hebt sich der Fuß, und das Knie klappt weiter zusammen.
- Das entfernte Bein wird zuerst und etwas dunkler gezeichnet. Der Fuß zeigt in die Laufrichtung.
- Die Arme schwingen gegen das Bein derselben Seite, beim Laufen weiter und stärker gebeugt (Ellbogen per IK).
- Parameter: `run` (0 Gehen, 1 Laufen, bis 1,6 Sprinten), `amp` (Schrittgröße 0–1, für weiches Anlaufen und Anhalten), `stride`, `lift`, `tuck` (Beine angezogen: Sprung, Salto), `seed` (versetzt das Atmen).
- **Stehen:** Brust und Schultern heben sich beim Atmen (`G.t*1.7`), das Gewicht wandert langsam von Fuß zu Fuß, die Arme pendeln leicht.

## Held (`drawPlayer`)
- Das Gangtempo kommt aus der echten Geschwindigkeit `P.gV`:
  - `run=clamp((gV-1.2)/4)`: Grundtempo 4,2 ist ein Lauf mit etwa 0,75.
  - `spr=clamp((gV-5.6)/1.6)`: Sprinten mit Lauftempo-Boni, beim Ansturm voll.
- Beim Sprinten lehnt sich der Held stark vor, macht längere Schritte, wirbelt mehr Staub auf und hebt die Fersen hoch.
- Gehen gibt es, wenn er langsamer ist: beim Anlaufen, beim Trinken, wenn er unterkühlt ist.
- `P.gA` blendet die Schritte beim Anlaufen und Anhalten weich ein und aus.

## Gegner (`drawEnemy`, `rgDrawGear`)
- Aus der Zunahme von `e.anim` pro Sekunde (`e._ar`) wird erkannt, ob ein Gegner wirklich läuft.
- Stehende Gegner atmen, statt in Zeitlupe auf der Stelle zu treten. Schnelle Gegner laufen statt zu gehen (`run` bis 0,8).
- Gegner bekommen ihre Laufrichtung (`dir`) wie der Held.

## Dash und Salto (Leertaste)
- `doRoll` zählt mit (`P.rollN`). Der Salto (`P.rollFlip`) kommt etwa jedes fünfte Mal: ab dem 4. Mal mit 40 % Chance, spätestens beim 6. Mal. Sonst kommt der Dash.
- `heroDash`: ein flacher Sprint nach vorn.
  - Der Körper lehnt sich vor und streckt sich, die Arme fliegen nach hinten, Waffe und Schild bleiben in der Hand.
  - Drei Nachbilder und Tempolinien ziehen hinterher.
  - Zum Schluss rutscht er mit nach hinten gelehnter Haltung und Bremsstaub aus.
- `heroRoll` (Salto): wie bisher, die Beine werden über `tuck` angezogen.
- Multiplayer: `rf` im Paket, damit Mitspieler denselben Dash oder Salto sehen.

Zurück zu [[Start]].
