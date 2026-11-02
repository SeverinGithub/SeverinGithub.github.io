---
tags: [feature, grafik]
---
# Magierrobe (Aschemagier)

Wunsch: „Magier-Kleidung soll am Charakter cooler aussehen, nimm dir Inspiration am Screenshot (Pixel-Art-Zauberer in lila Robe), gern ein bisschen Details, natürlich im custom Poly-Style.“ Umgesetzt in `5eed86c`, nachgeschärft in `2c25947`. Danach wollte der Nutzer ein Bild eines ganzen Magier-Builds von früh bis spät sehen (wurde gezeigt).

## Technik
- `heroLook`-Wrapper setzt für Klasse `magier`: `R.mage=1`, `R.mageFl` (Weiß-Blitz beim Treffer), `R.mageHelm` (trägt erfüllten Helm).
- `humanoid`-Wrapper: wenn `R.mage`, wird mit `o2={…o, robe:true, robeDone:1}` gezeichnet und drei Hooks gesetzt:
  - `torsoFx(shX,shY,hipX,hipY)`: Robe aus 3 Punktreihen (Schultern, eingezogene Taille, ausgestellter, gezackter Saum, der im Schritt schwingt), Facetten mit Licht von links, Faltenlinien, Stiefelspitzen unter dem Saum, Goldborte am Saum mit dunklem Muster (`mageBorder`), zwei Runen am Saum (`mageGlyph`, glühen in der Farbe des Stabelements `EL[e].c[1]`), vorne offene Front mit dunklem Futter zwischen zwei Goldborten (glatt, `plain`), zwei Goldschließen, Gürtelkordel mit schwingender Quaste; Rückseite: große Rune zwischen den Schulterblättern.
  - `armFx(a)`: Glockenärmel ab dem Ellbogen, dunkle Öffnung, goldener Manschettenring (Ellipse) – ersetzte in `2c25947` einen Querstab.
  - `head(hx,hy)`: ohne Helm aufgesetzte Kapuze mit Goldkante ums Gesicht und Schatten; mit Helm liegt sie als Kragen auf den Schultern.
- `humanoid`s `drawArm` bekam `if(o.armFx)o.armFx(a);` vor der Hand.
- Farben aus `R.torso` (Rüstungsfarbe), Gold `RP.gold`.

Zurück zu [[Start]].
