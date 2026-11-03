---
tags: [feature, klassen]
---
# Vier Klassen (Krieger, Jägerin, Magier, Alchemist)

Wunsch des Nutzers (2026-11-02): Die Klassen sollen sich deutlich unterscheiden und das Spiel jeweils anders anfühlen lassen. Der **Wanderer fällt weg**, der **Alchemist** kommt als Klasse dazu (vorher nur Talentzweig). Viel wiederverwenden, nichts neu programmieren, was es schon gibt.

| Klasse | Waffen | Fertigkeiten (Reihenfolge = Tasten 1–6) | Grundwerte | Bonus |
|---|---|---|---|---|
| Krieger | Schwert, Axt, Keule/Hammer, Großwaffe, Speer (keine Doppelklingen) | `whirl, slam, charge, cry, atem, schwur`; mit Langklinge/Hammer/Speer die Waffensätze (`WSETS`) | Str 24 · Ges 12 · Vit 24 · Ene 5 | +25% Leben, −30% Mana |
| Jägerin | Dolch, Doppelklingen | `d_flurry, d_dash, d_cross, dash, d_dance, d_exec` (der frühere Doppelklingen-Satz, Banditin-Stil) | 14 · 26 · 15 · 10 | +15% Angriffstempo, +10% Lauftempo, +5% Krit |
| Magier | Stäbe inkl. Holzzauberstab | unverändert: `m_bolt, m_ring, m_jump, m_storm, ward, m_fuse` | 10 · 12 · 12 · 30 | +30% Mana, −15% Leben |
| Alchemist | Bogen, Armbrust, Holzzauberstab | `multi, a_fire, a_frost, a_heal, a_plague, a_oil` | 12 · 20 · 16 · 16 | +40% Trankwirkung (auch Phiolen), +15% Flakon-Heilung |

## Regeln
- **Fremde Waffen** darf jeder tragen, aber: halber Waffenschaden (`P.d.offW`), keine Waffenfertigkeiten. Tooltip zeigt „Waffe für: …“ bzw. rot „Nicht für …“.
- **Waffensätze** (`wSetKey`) greifen nur noch beim Krieger (und nicht für `dual`).
- **Beute** würfelt eine fremde Waffe mit 55 % Chance einmal neu (`makeItem`-Wrapper, `o.keepCls` umgeht das).
- Wurftränke kosten nur Mana wie jede Fertigkeit, keine Gegenstände (Nutzer: „sollen nichts kosten“).

## Alchemist
- Phiolen fliegen als Projektil `kind:'flask'` im Bogen (`alLob`), platzen am ersten Feind oder am Ziel (Ablauf im `update`-Wrapper ruft `explode`). Gezeichnet im `drawProj`-Wrapper.
- Wiederverwendet: `mRing` (Frostphiole), `mStorm('poison')` (Seuchenkolben), `burn`-Zone (Brandphiole), `eHit`/`jumpOn` (Öl-Pfeile), `pArrow` (Pfeile).
- Schaden der Phiolen: `alD(m)=pDmg(m)*(1+potPow/200)` – Bogenschaden und Trankstärke zählen.
- Heilnebel: `G.aheal`, heilt im Umkreis 2,6; im Multiplayer Paket `{t:'aheal'}` an Mitspieler.
- Alchemistenöl: `P.oilT`, Pfeile reihum Feuer/Frost/Blitz/Gift (`G.oilI`).
- Grundangriff mit Bogen/Armbrust schießt einen Pfeil, der Holzzauberstab einen Funken seines Elements (`resolveSwing`-Wrapper); Reichweite 7,5 / 7 / 6.

## Neue Waffen
- Nach `expandItems` angehängt, damit die 240 generierten Unikate ihre Namen behalten: 6 Bögen, 4 Armbrüste, Holzzauberstab, jeweils mit allen `MATS`-Stufen, dazu 11 handgemachte Unikate.
- In der Hand: `vBow`, `vXbow`, `vWand` (Wrapper um `vWeapon`). Boden-/Shop-Sprites: `pxBow`, `pxXbow`, Stab über `wStaff`.
- Der Magier startet weiter mit dem Eichenstab (`startWeapon`-Wrapper).

## Talentbaum
- 4 statt 6 Zweige: Krieger (+ Wächter-Cluster), Jägerin (+ „Schattentanz“), Alchemist (+ Wanderer-Cluster), Magier (Cluster-Mods auf `sk_m_*`). Neu aufgebaut nach `TREE`-Leerung, Geometrie über `N=TB.length`, Cluster-Plätze `SLOT`. Beschriftung im Baum-SVG über `TB.length`.

## Aussehen
- `heroLook` setzt `R.hunt` bzw. `R.alch`, `humanoid`-Wrapper hängt `torsoFx/armFx/head` ein (Muster wie die Magierrobe).
- Jägerin: Kapuze mit Gesichtstuch, kurzer Schulterumhang vorne, langer Umhang hinten, Messergurt, Armschienen; Umhangfarbe = Rüstungsfarbe halb Richtung Dämmerviolett (`mixR`), Hose `robeV`.
- Alchemist: helle Lederschürze mit Tasche, Gurt mit vier leuchtenden Phiolen, Schutzbrille, hochgekrempelte Ärmel, Kolben auf dem Rücken; Hemd/Ärmel tragen die Rüstungsfarbe.
- Mit Helm: Kapuze als Kragen bzw. keine Brille.

## Schuss-Animation für Bogen und Armbrust (2026-11-03)
- `drawPlayer` (`220-figures.js`): mit Bogen/Armbrust kein Hieb mehr. `rgW` = Waffenklasse beim Angriff; die Figur zielt (`atk=wang=th`), spannt bis `sp=.45` (dann löst `resolveSwing` den Schuss aus), danach Rückstoß (Körper weicht leicht zurück, Waffe kippt kurz hoch). Keine Klingenspur.
- `880-bows.js`: `BOWK` (wie weit die Sehne gezogen ist), `BOWHAND` (Hautfarbe der Zughand), `XBOLT` (Bolzen eingelegt). `vBow` zieht die Sehne mit, legt einen Pfeil mit Federn und Spitze auf und zeichnet die Zughand; `vXbow` zeigt nach dem Schuss eine entspannte Sehne ohne Bolzen, ab `sp=.88` wieder geladen. Inventar und Boden zeichnen weiter mit den Grundwerten.
- Klang: beim Spannen `sfx('draw')` statt Schwert-Wusch, beim Schuss `sfx('twang')` bzw. `sfx('bolt')` (Synth in `120-audio.js`).

## Jägerin: Schatten nach dem Schattenschritt (2026-11-03)
- `dash` setzt zusätzlich `P.veilT=min(3, 2+0,1·Stufe)`. Solange er läuft, verlieren normale Gegner weiter als 1,4 Schritte das Ziel (`updEnemy` in `200-update.js`: `aggro=false`, Schuss-Aufladung abgebrochen, „?“ über dem Kopf). Bosse lassen sich nicht täuschen.
- Grundangriff (`startAttack`) und jede andere Fertigkeit (`castSkill`) beenden den Schatten – der erste Schlag aus dem Schatten trifft mit dem Krit-Bonus.
- Die Figur ist dabei durchscheinend und flackert leicht; Mitspieler sehen das über das Feld `vl` im Bewegungspaket.

## Alte Spielstände (`P.clv`)
- Wanderer: Dialog „Der Wanderer geht“ (`clsPick`) beim ersten Laden; Stufe, Erfahrung, Glut, Gegenstände bleiben; Eigenschaftspunkte über den alten Grundwerten, alle Fertigkeitspunkte und alle Talentpunkte kommen zurück; fremde Waffe wandert ins Inventar, Startwaffe der neuen Klasse wird angelegt.
- Alle anderen: Talentbaum zurückgesetzt (Punkte zurück). Jägerin zusätzlich Fertigkeitspunkte zurück.

Zurück zu [[Start]].
