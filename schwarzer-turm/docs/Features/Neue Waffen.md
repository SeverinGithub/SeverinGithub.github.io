---
tags: [feature, inhalt]
---
# Neue Waffen (erste Runde)

Seit 2026-11-03. Die Nummern 1–25 aus den [[Waffen-Ideen]], ohne das Wurfbeil (Nr. 18, kommt mit dem Fernkampf). Alles steckt in `991-weapons-two.js`. Das Krieger-Set aus derselben Runde steht in [[Klassen]].

## Was jede Waffe hat
- **Grundwerte** in `NW`: Stufe, Schaden, Tempo, Stärke/Geschick, ein- oder zweihändig, Art (`cls`) und Größe im Beutel.
- **Materialstufen** wie alle Waffen (`MATS`, Obsidian bis Drachenglas). Stufen über 75 fallen weg.
- **Eingebaute Werte** (`NWIMP`), die mit der Stufe des Teils steigen.
- **Treffer-Effekt** (`NWS`), im Tooltip als lila Zeile (`NWT`).
- **Eigenes Bild in der Hand** (`NWD`), das auch das Symbol im Beutel ist. Die Symbolgröße steht pro Form in `WEXT[Name]`.

## Die Waffen
| Waffe | Art / Klasse | Besonders |
|---|---|---|
| Knotenstab | Stab · Magier | Glut im Astloch flackert beim Zaubern auf, +5 Zauberschaden |
| Kampfstab | Stab · Magier | Angriffstempo, stößt zurück, dafür 15 % weniger Zauberschaden |
| Zauberrute | Stab, einhändig · Magier | zweite Hand frei für Schild oder Buch |
| Kristallstab | Stab · Magier | immer Frost, Verlangsamung hält 60 % länger |
| Knochenstab | Stab · Magier | Zauber heilen um 4 % ihres Schadens, Kiefer klappert beim Angriff |
| Runenstab | Stab · Magier | +1 auf alle Fertigkeiten, Runen glühen nacheinander |
| Weltenast | Stab · Magier | immer Gift, Blätter wiegen sich |
| Gladius | Schwert · Krieger | mehr Krit |
| Falchion | Schwert · Krieger | +25 % gegen Ungepanzerte |
| Rapier | Dolch · Jägerin | durchbohrt: trifft den Feind dahinter mit 50 % |
| Bastardschwert | Schwert · Krieger | ohne Nebenhand +25 % Schaden |
| Estoc | Großwaffe · Krieger | trifft in einer Linie, +30 % gegen Knochen und Stein |
| Katana | Schwert · Krieger | Blutung; nach 2,5 s Ruhe trifft der erste Hieb immer kritisch |
| Flamberge | Großwaffe · Krieger | starke Blutung |
| Claymore | Großwaffe · Krieger | trifft Feinde neben dem Ziel (40 %) und stößt zurück |
| Bartaxt | Axt · Krieger | hakt den Schild aus: Schildträger immer, andere zu 25 % kurz betäubt |
| Doppelaxt | Axt · Krieger | jeder zweite Hieb trifft auch hinter dir (60 %) |
| Breitaxt | Axt · Krieger | spaltet Rüstung: +8 % pro Treffer auf dasselbe Ziel, bis 3-mal, 5 s |
| Flanschkolben | Keule · Krieger | +50 % gegen Skelette, Bogenschützen, Golems, Wächter und Schildträger |
| Zepter | Keule · Krieger | Blitzschaden und Zauberbonus |
| Kettenflegel | Keule · Krieger | +60 % gegen Schildträger, betäubt manchmal, die Kugel pendelt |
| Kriegspicke | Keule · Krieger | +35 % gegen Gepanzerte |
| Großhammer | Keule, zweihändig · Krieger | Schockwelle um das Ziel (45 %) |
| Riesenkeule | Keule, zweihändig · Krieger | betäubt immer und schleudert weg |

Zehn Unikate dazu, z. B. Glimmwurz, Eisherz des Winters, Morgentau, Zorn des Feuerbergs und Erdbrecher.

## Technik
- Jede Waffe gehört zu genau einer Klasse, weil `CLSW` über die Art geht. Wo die Ideen-Liste zwei Klassen nennt (Kampfstab, Falchion, Katana, Zepter), gilt die erste passende Art.
- Die Effekte greifen nur, wenn die Waffe nutzbar ist (`nwW`: angelegt, Anforderungen erfüllt, eigene Klasse).
- **Betäubung** (`nwStun`, `e.nwSt`): Der Gegner steht still, nur Rückstoß bewegt ihn. Bosse nur 30 % so lange.
- **Blutung** (`e.bleedT`/`bleedD`): 3 s Schaden mit Blutstropfen, getrennt vom Gift (`dotT`).
- `weaponHit`-Wrapper für die Nahkampf-Effekte, `hitEnemy`-Wrapper für den Kristallstab, `eHit`-Wrapper für den Knochenstab, `recalc`-Wrapper für Bastardschwert und Kampfstab.

## Noch offen
- Eigene Bewegungen je Waffe (Stich beim Gladius, Pendel über dem Kopf beim Flegel …). Bisher nutzen alle die Bewegung ihrer Art.
- Den Schnitt aus der Scheide des Katana gibt es nur als passiven Effekt, nicht als eigene Fertigkeit.
- Balance im echten Spiel prüfen.

Zurück zu [[Start]].
