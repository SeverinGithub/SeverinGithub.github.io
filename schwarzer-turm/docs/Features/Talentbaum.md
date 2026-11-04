---
tags: [feature]
---
# Talentbaum (ein Pfad nach oben je Klasse)

Wunsch (2026-11-04): „nur die Klasse im Skilltree der Spielerklasse anzeigen und nur ein Pfad in eine Himmelsrichtung … nur nach oben … bisschen zur Seite und darf noch Nebenskills beinhalten … groß, aber nicht zu groß. Je weiter man voranschreitet, desto mehr Talentpunkte … Performance soll besser sein.“
Vorher (2026-11-03): ein Rundbaum mit 8 Zweigen, 4 Ringen und 1.561 Knoten. Der wurde abgelöst.

## Aufbau (`920-talent-tree-path.js`)
- **Jede Klasse hat einen eigenen Baum** mit 83 Talenten. Angezeigt wird nur der Baum der eigenen Klasse. Die Daten der Klassen (Themen, Namen, Meilensteine, Schlusssteine) stehen weiter in `TB8`. Die vier allgemeinen Zweige liefern nur noch die kleinen Schritte der Gaben-Gabel.
- **Wurzel** unten (`krs0`, `jas0`, `als0`, `mas0`, kostenlos). Darüber ein **Stamm**, der sich leicht hin und her windet, in **4 Stufen** (`TRING`: Grundlagen, Fortgeschritten, Meisterschaft, Legende) mit je 5 Stammschritten und einem **Meilenstein** als Tor zur nächsten Stufe (+1 auf eine Klassenfertigkeit). Ganz oben 2 **Schlusssteine** (+1 auf Fertigkeit 5 bzw. 6).
- **Nebenskills**: Auf Stammschritt 2 und 4 jeder Stufe gehen links (Thema A) und rechts (Thema B) kurze Zweige ab: 2 kleine Talente und ein großes Talent am Ende. Das obere ist stärker.
- **Gaben-Gabel**: einmal pro Stufe, abwechselnd links und rechts, vom oberen Zweig aus: Tiefe Taschen (Inventarreihe), Trankgürtel (Flakon), Trankstapel, Weltentasche (Inventarreihe).
- **Steigende Kosten** (`TCOST=[1,2,3,4]`, Schlusssteine `TKEYC=5`), Feld `c` am Knoten. Die Werte wachsen mit `TMUL=[1,1.8,2.6,3.4]`. Freie Punkte: `tPts()` = Stufe − 1 + Bonus − `tSpent()`.
- Summen pro Klasse: der ganze Baum kostet 210 Punkte, der Stamm bis zu einem Schlussstein 65. Bei Stufe 60 mit Boss-, Leuchtfeuer- und Questpunkten (etwa 100–120) reicht das für den Stamm und etwa die Hälfte der Nebenskills.
- IDs: Stamm `<kl>t<stufe>c<schritt>`, Zweig `<kl>t<stufe><L|R><0|1>n<0-2>`, Gabe `<kl>t<stufe>u<0|1>`, Meilenstein `<kl>M<stufe>`, Schlussstein `<kl>K<0|1>`.

## Anzeige (`340-talent-tree.js`)
- Nur die rund 80 Knoten der eigenen Klasse, ohne Verläufe. Neuaufbau ≈ 0,5 ms (vorher ≈ 15 ms). Verschieben und Zoomen ändern nur die `viewBox`.
- Hinter dem offenen Baum wird die Welt nicht mehr gezeichnet (`999-boot-loop.js`).
- Bänder pro Stufe mit Name und Preis („2 Punkte je Talent“). Die Ansicht startet über dem höchsten erlernten Talent und bleibt zwischen Wurzel und Schlusssteinen (`tSetVB`).
- Tooltip: Stufe, Thema, Kosten bzw. „Kostet N Talentpunkte, frei: M“.

## Alte Spielstände
- `P.tv` = 3. Ältere Stände: `treeClear()` mit Meldung, alle Talente kommen zurück. Neue Helden starten mit `tv=3`.

Zurück zu [[Start]].
