---
tags: [feature]
---
# Talentbaum (groß, 8 Zweige)

Wunsch (2026-11-03): „mach den skill tree 15x so groß und er soll mehr sinn machen und man soll meilensteine im skill tree haben und es soll neben der 4 charakter skills noch 4 weitere skill überbegriffe geben“.

## Aufbau (`920-talent-tree-eight.js`)
- **8 Zweige** im Uhrzeigersinn: Krieger, Blutpfad, Jägerin, Wanderer, Alchemist, Elemente, Magier, Wächter. Klassen und allgemeine Zweige wechseln sich ab, so liegt jede Klasse neben zwei passenden Überbegriffen.
- Jeder Zweig: **Wurzel** (`krs0`, `jas0`, `als0`, `mas0` = Startknoten der Klasse, kostenlos; die anderen kosten einen Punkt) → **4 Ringe** (`TRING`: Grundlagen, Fortgeschritten, Meisterschaft, Legende) → 2 **Schlusssteine**.
- Ein Ring: 5 Bahnen × 9 Schritte als Netz (Querverbindungen, wo `(s+l)%3===1`). Linke Bahnen = Thema A, Mitte = Kern, rechte Bahnen = Thema B. Kleine Knoten wiederholen das Thema, Werte × `TMUL=[1,1.4,1.8,2.3]` je Ring.
- **Große Knoten**: je Thema zwei pro Ring (Schritt 3 außen, Schritt 7 innen und stärker), mit eigenen Namen (`names`, 8 je Thema).
- **Meilensteine** (`k:'mile'`, goldenes Sechseck): Alle 5 Bahnen münden in ihn, erst danach öffnet sich der nächste Ring. In Klassen-Zweigen gibt jeder Meilenstein +1 auf eine Klassenfertigkeit (`CLS[cls].skills[0..3]`), die Schlusssteine +1 auf Fertigkeit 5 und 6. Bei den allgemeinen Zweigen liegen dort Inventarreihen, Flakons, Trankstapel, Rabatte.
- **Brücken**: in jedem Ring auf Schritt 4 ein Pfad mit 2 Knoten von der äußeren Bahn eines Zweigs zur inneren des nächsten.
- Insgesamt **1.561 Knoten** (früher ≈ 105): 1.376 klein, 128 groß, 32 Meilensteine, 16 Schlusssteine, 8 Wurzeln, Ursprung. Alles vom Ursprung erreichbar (geprüft).
- IDs: `<zweig>t<ring>l<bahn>s<schritt>`, Meilenstein `<zweig>M<ring>`, Schlussstein `<zweig>K<0|1>`, Brücke `br<zweig>t<ring>n<1|2>`.

## Anzeige (`340-talent-tree.js`)
- SVG wird nur beim Erlernen/Zurücksetzen neu gebaut (`TKEY`), Verschieben und Zoomen ändern nur die `viewBox` (`tSetVB`). Neuaufbau ≈ 15 ms.
- Zoom: Mausrad zum Mauszeiger, zwei Finger (Pinch) auf dem iPad, Knöpfe +/−/Mitte. Start auf der Wurzel der eigenen Klasse (`tCenter`).
- Namen der großen Knoten, Meilensteine und Schlusssteine stehen unter den Knoten; beim Herauszoomen verschwinden erst die kleinen, dann alle Namen (`#tsvg.mid`/`.far`).
- Kopfzeile: freie Punkte, vergebene Punkte, Meilensteine x/32. Meilenstein erlernen → großes Banner.

## Alte Spielstände
- `P.tv` (Baum-Version) = 2. Ältere Stände: `treeClear()` (Tränke entstapeln, Gegenstände aus wegfallenden Inventarreihen umpacken oder fallen lassen, Flakons kappen), Meldung mit Anzahl der zurückgegebenen Punkte. Neue Helden starten mit `tv=2`.

## Offen
- Balance der Werte im echten Spiel; bei ≈ 100 Punkten erreicht man über eine Bahn etwa die Schlusssteine eines Zweigs (≈ 40 Punkte) plus Abstecher.

Zurück zu [[Start]].
