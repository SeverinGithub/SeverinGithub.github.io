---
tags: [feature]
---
# Turm-Ebenen und Inseln: Kartendesign

Seit 2026-11-03. Zwölf Ideen für abwechslungsreichere Karten, verteilt auf drei Module:
- `982-floor-themes.js`: Themen, Flüche, Fenster, Lichtschacht, Lava, Wasser, Dampf, Feuerbecken
- `984-tower-rooms.js`: Sonderräume, Fässer und Kronleuchter, Druckplatten, Bodenrisse, Aufzug
- `986-island-sights.js`: Landmarken, Grüfte, Brückensteine, treibende Inseln, Klima, Turm-Lichter

Alles wird pro `G.seed` und Ebene ausgewürfelt (eigene `mulberry`-Seeds). So sehen alle Mitspieler dieselbe Karte.

## Themen-Stockwerke (`FTH`, `fthOf`)
Alle drei Ebenen wechselt das Thema, nach Ebene 18 beginnt die Reihe von vorn:

| Ebenen | Thema | Was es ausmacht |
|---|---|---|
| 1–3 | Kerker | Zellengitter an den Wänden (`ftbars`), manchmal glühende Augen oder eine Knochenhand |
| 4–6 | Bibliothek | Bücherregale an allen Wänden (`ftshelf`), schwebende Kerzen (`ftcandle`), Staub in der Luft |
| 7–9 | Gießerei | Lava-Becken (`m.lava`), die Held und Gegner verbrennen, Schmelztiegel (`ftcruc`), Funken |
| 10–12 | Zisterne | Wasserbecken (`m.water`), die bremsen (Held 72 %, Gegner verlangsamt), Tropfen |
| 13–15 | Uhrwerk | Zahnräder und Pendel in den Wänden (`ftgear`), Dampfdüsen im Boden (`m.vents`), die alle treffen |
| 16–18 | Kathedrale | Buntglasfenster mit farbigem Licht auf dem Boden (`ftglass`), Bankreihen (`ftpew`) |

- Jedes Thema hat einen eigenen Farbton über dem Boden (`soft-light`) und eine eigene Dunkelheit (`dungDark`).
- Der Ebenenname zeigt das Thema („Ebene 5 · Bibliothek“), das Banner beim Betreten seine Beschreibung.
- Risse (`m.isRift`) bekommen das Thema auch, aber keinen Fluch und keine Sonderräume.

## Der Turm als Turm
- **Turmfenster** (`ftwin`): 3–5 pro Ebene. Durch sie sieht man Abendhimmel, Sterne, Wolken und eine treibende Insel; sie geben kühles Licht.
- **Lichtschacht** (`ftWell`, `m.well`): In etwa 45 % der Ebenen hat ein großer Saal in der Mitte ein rundes Loch mit Pfosten am Rand. Licht fällt von oben hinein, und tief unten drehen sich die Fackeln der unteren Ebenen.

## Ebenen-Flüche (`CURSE`)
Ab Ebene 3 ist etwa jede dritte Ebene verflucht. Dafür bringen ihre Gegner +30 % Erfahrung und lassen mit 12 % Chance zusätzlich einen Gegenstand fallen.

| Fluch | Wirkung |
|---|---|
| Blutmond | Gegner +30 % Schaden, +15 % Tempo, roter Himmel |
| Nebel | graue Dunkelheit, eigenes Licht 62 % |
| Frost | Held 85 % Tempo, blauer Ton |
| Finsternis | eigenes Licht 50 %, alle Feuerbecken sind kalt (`ftcold`) |
| Raserei | Gegner +15 % Tempo, greifen deutlich schneller an |

**Finsternis:** Ein kaltes Feuerbecken entzündet sich, sobald man herangeht. Mit jedem entzündeten Becken wird das eigene Licht größer. Brennen alle, ist die ganze Karte aufgedeckt, und es gibt Glut.

## Sonderräume (`m.sroom`, ab Ebene 2, einer pro Ebene)
- **Schatzkammer:** Drei Hebel tragen farbige Steine. Eine Inschrift nennt die Reihenfolge („Erst das Gift, dann das Blut, zuletzt der Himmel“). Die falsche Reihenfolge löst Pfeile aus den Wänden aus, und die Hebel springen zurück. Die richtige öffnet eine goldene Truhe (3 Gegenstände, oft selten, 30 % Unikat).
- **Prüfung:** Berührt man den Prüfstein, schließt sich ein roter Ring; man kommt nicht hinaus. Es folgen drei Wellen, in der dritten mit einem Einzigartigen. Danach gibt es Erfahrung und eine Schatztruhe.
- **Blutaltar:** Zweimal berühren opfert ein Drittel des Lebens. Dafür gibt es 2 Minuten lang +30 % Schaden (`P.blessT`, in `hitEnemy`).
- **Gefangener:** Ein Käfig mit einem Namen. Wer ihn befreit, bekommt die ganze Karte aufgedeckt, einen Heiltrank und Glut.
- Gelöste Räume merkt sich der Held in `G.tw.done`. Nach dem Laden sind sie schon offen.

## Umgebung als Waffe
- **Pulverfässer:** 1–3 in etwa 40 % der Räume. Jeder Treffer zündet die Lunte. Die Explosion (Radius 2,5) trifft Gegner und den Helden und zündet benachbarte Fässer.
- **Kronleuchter:** in großen Räumen. Ein Treffer reißt die Kette, ein roter Kreis warnt. Er fällt, trifft und betäubt alles darunter, und sein Licht geht aus.
- Beide sind Feinde mit `e.wall` und `e.obj`. Sie nehmen keinen Schaden, geben keine Erfahrung und zählen nicht als Kill.
- **Druckplatten** (`m.plates`, ab Ebene 2): Tritt der Held oder ein Gegner darauf, schießt eine Pfeilsalve quer durch den Raum, von Wand zu Wand.
- Die alten Stachel-, Feuer- und Felsfallen (390, 760) bleiben.

## Abkürzungen
- **Bodenrisse** (`m.cracks`, ab Ebene 2, nicht auf Boss-Ebenen): Wer darauf steht, hört den Boden knacken. Nach 0,8 s bricht er ein, und der Held fällt eine Ebene tiefer (−15 % Leben). Steht er nicht mehr darauf, bleibt ein Loch (`twhole`), durch das man später springen kann.
- **Aufzug** (`twlift`): Er steht neben der Treppe und neben dem Leuchtfeuer. Von unten löst man einmal den Riegel, oben ist er bis dahin „von unten verriegelt“ (wie eine Einbahntür). Danach fährt er hin und her (`G.tw.lift[f]`).

## Die Turmtür
Die Tür auf dem Hügel führt zur tiefsten Ebene mit entzündetem Leuchtfeuer (`topFloor` in `180-interaction.js`, Schlüssel aus `G.lit`, Risse und Grüfte zählen nicht). Man steht dann neben dem Feuer. Ohne Feuer geht es nach Ebene 1. Das Schild über der Tür nennt die Ebene.

## Geheimgänge
Aus einer rissigen Wand (760) treibt Staub in den Raum, sobald man näher als 10 Felder ist. Daran erkennt man sie.

## Inseln
- **Landmarken** auf etwa jeder fünften Insel: alter Leuchtturm mit kreisenden Lichtstrahlen (nachts stärker), gestürzter Riese (Kopf, Torso, Arm), Wasserfall ins Nichts am Inselrand. Die erste Begegnung zeigt „Entdeckt“ und gibt Erfahrung (`G.tw.seen`).
  - Dafür müssen die Wege zur Mitte frei bleiben (keine Achse). Deko auf dem Platz wird entfernt.
- **Grüfte** (`iscrypt`) auf Gräber- und Ruineninseln (45 %), selten auf wilden. Darin liegen 3 Räume (`genCrypt`) eine Stufe über der Insel und am Ende eine grüne Schatztruhe. Danach ist die Gruft leer (`G.tw.crypt`). Wer in der Gruft stirbt, behält seine Glut.
- **Brückensteine** (`isbstone`): Haben zwei Nachbarinseln keine Brücke, steht oft ein Runenstein am Rand. Berührt man ihn, wächst Feld für Feld eine Steinbrücke hinüber (`G.tw.br`, bleibt gespeichert).
- **Treibende Inseln:** Kleine Inseln ziehen weit hinten durch den Himmel (Parallaxe, nachts blasser).
- **Klima nach Region** (5×5 Chunks, `CLIM`): Regenmoor, Schneefelder und Aschenebene lenken das bestehende Wetter (`G.wx`, 370). Schneetreiben ist neu. Beim Betreten heißt es „Du betrittst die Schneefelder“.
- **Turm-Lichter:** Für jeden besiegten Hüter der Tiefe (`G.bossDead`) brennt ein blasses blaues Fenster im Turm auf dem Hügel. Nach acht leuchtet die Spitze.

## Speichern
`G.tw` (`done`, `lift`, `crypt`, `seen`, `br`) wird in `saveData` mitgeschrieben. Ein neuer Held beginnt leer.

## Noch offen
- Im Multiplayer werden Hebel, Prüfung, Fässer, Kronleuchter, Risse und Brückensteine nicht übertragen. Jeder sieht nur seine eigene Version. Das braucht eigene Pakete.
- Werte (Schaden der Fässer, Fluch-Stärken, Häufigkeiten) im echten Spiel prüfen.

Zurück zu [[Start]].
