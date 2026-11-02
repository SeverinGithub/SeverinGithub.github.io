---
tags: [feature, ui]
---
# Titelbildschirm (Hauptmenü)

Wunsch: „Mach einen komplett neuen Hauptscreen – inhaltlich alles gleich lassen, aber darf viel cooler aussehen.“ Umgesetzt in `9a7e14e` (zusammen mit dem Entfernen der Umhänge).

## Aufbau
- HTML `#title`: `.tsky` (Himmel), `.tglow` (Torlicht), `.tfog` (Nebel), `canvas#tEmb` (aufsteigende Glut-Funken), `.tshade` (Abdunklung links), `.tpanel` mit SVG-Turmwappen `.tcrest`, `h1` mit `.tder` („Der“) und `.tname` (goldene Titelschrift), Zierlinie `.trule`, Einleitungstext, `nav#tmenu` mit **denselben Buttons und IDs** wie vorher (`#btnCont` „Fortsetzen“ usw.).
- Menüeinträge wie graviert; beim Darüberfahren glühen sie auf und rücken ein; „Fortsetzen“ als hervorgehobene Tafel.
- Desktop: Turm in der Abenddämmerung rechts im Bild, dunkles Band links mit Menü. Handy und iPad hochkant (`(max-width:760px),(orientation:portrait) and (max-width:1100px)`): zentriert unter dem Turm.
- Musik im Hauptmenü ist aus (`1a72221`).

## JS
- `titleCam()`: Kamera fest auf 15.9/20.3 (Desktop) bzw. 20.6/20.6 (schmal), leichtes Schwanken. Ein `render`-Wrapper erzwingt sie im Titelzustand (vorher driftete die Kamera zum Helden).
- `titleBackdrop`-Wrapper: zeigt den Helden des **letzten Spielstands** (Klasse aus dem Save) bei 23.2/26.8, Blick zur Tür.
- Glut-Partikel-Animation auf `#tEmb`.
- Behobene Probleme beim Bau: matschiger Farbton (Verlauf/Deckkraft angepasst), Turm im iPad-Hochformat abgeschnitten (jetzt zentrierter Modus), Menü auf ersten Screenshots unsichtbar (nur Einblend-Animation).

Zurück zu [[Start]].
