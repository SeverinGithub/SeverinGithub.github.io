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
- Seit 2026-11-03 der große Baum mit 8 Zweigen, siehe [[Talentbaum]].

## Aussehen
- `heroLook` setzt `R.hunt` bzw. `R.alch`, `humanoid`-Wrapper hängt `torsoFx/armFx/head` ein (Muster wie die Magierrobe).
- Jägerin: Kapuze mit Gesichtstuch, kurzer Schulterumhang vorne, langer Umhang hinten, Messergurt, Armschienen; Umhangfarbe = Rüstungsfarbe halb Richtung Dämmerviolett (`mixR`), Hose `robeV`.
- Alchemist: helle Lederschürze mit Tasche, Gurt mit vier leuchtenden Phiolen, Schutzbrille, hochgekrempelte Ärmel, Kolben auf dem Rücken; Hemd/Ärmel tragen die Rüstungsfarbe.
- Mit Helm: Kapuze als Kragen bzw. keine Brille.

## Schuss-Animation für Bogen und Armbrust (2026-11-03)
- `drawPlayer` (`220-figures.js`): mit Bogen/Armbrust kein Hieb mehr. `rgW` = Waffenklasse beim Angriff; die Figur zielt (`atk=wang=th`), spannt bis `sp=.45` (dann löst `resolveSwing` den Schuss aus), danach Rückstoß (Körper weicht leicht zurück, Waffe kippt kurz hoch). Keine Klingenspur.
- `880-bows.js`: `BOWK` (wie weit die Sehne gezogen ist), `BOWHAND` (Hautfarbe der Zughand), `XBOLT` (Bolzen eingelegt). `vBow` zieht die Sehne mit, legt einen Pfeil mit Federn und Spitze auf und zeichnet die Zughand; `vXbow` zeigt nach dem Schuss eine entspannte Sehne ohne Bolzen, ab `sp=.88` wieder geladen. Inventar und Boden zeichnen weiter mit den Grundwerten.
- Klang: beim Spannen `sfx('draw')` statt Schwert-Wusch, beim Schuss `sfx('twang')` bzw. `sfx('bolt')` (Synth in `120-audio.js`).
- **Beide Arme** (zweite Fassung, 2026-11-03): `archRig(o,{th,wang,k,fo,xb,rl})` in `880-bows.js` dreht den Schützen seitlich (`tw` schmaler je nach Blickrichtung) und setzt über `o.handsAt` (neu in `humanoid`) beide Hände per IK: der Bogenarm drückt nach vorn, die Zughand liegt auf der Sehne und zieht sie bis ans Kinn (`BOWK` 0–1, Sehne 11 px). Ablauf aus `bowDraw(p,q)`: Pfeil auflegen, langer Zug, der langsamer wird, volles Halten mit leichtem Zittern, dann loslassen.
- Aufladen: ab halbem Zug sammelt die Pfeilspitze Licht (`bowGlint`), bei vollem Zug pulsiert sie mit Stern. Nach dem Schuss summt die Sehne nach (`bowVib`), die Zughand fliegt am Ohr vorbei zurück und kommt zum nächsten Pfeil wieder. Die Bogenarme biegen sich mit.
- Armbrust: liegt auf der zweiten Hand; nach dem Schuss zieht diese Hand die Sehne wieder zurück (`XRL`), bis der Bolzen bei `sp=.88` wieder liegt.
- **Gegner mit Bogen** (`archEnemy`): Knochenschützen (alle Elementvarianten) und die ausgerüsteten Schützen der Totenlande (Langbogen, Armbrust) benutzen dieselbe Haltung während ihrer Ausholzeit `e.charge` (`bowDraw(1-charge/wind,1)`), danach 0,6 s Nachschwingen (`e.relT` aus einem `fireProj`-Wrapper). Das Leuchten hat die Farbe ihres Elements (Feuer, Frost, Gift). In Ruhe hängt der Bogen in der Hand. Spannen und Schuss hört man nur in der Nähe (`bowSfx`, bis 12 Schritte, leiser mit der Entfernung).

## Jägerin: Schatten nach dem Schattenschritt (2026-11-03)
- `dash` setzt zusätzlich `P.veilT=min(3, 2+0,1·Stufe)`. Solange er läuft, verlieren normale Gegner weiter als 1,4 Schritte das Ziel (`updEnemy` in `200-update.js`: `aggro=false`, Schuss-Aufladung abgebrochen, „?“ über dem Kopf). Bosse lassen sich nicht täuschen.
- Grundangriff (`startAttack`) und jede andere Fertigkeit (`castSkill`) beenden den Schatten – der erste Schlag aus dem Schatten trifft mit dem Krit-Bonus.
- Die Figur ist dabei durchscheinend und flackert leicht; Mitspieler sehen das über das Feld `vl` im Bewegungspaket.

## Eigene Ausrüstung für Jägerin und Alchemist (2026-11-03, `970-class-gear.js`)
Wunsch: „viel Content … von early game bis late game immer besser … Jägerin im late game eine Art Schwarzdiamant-Schattenumhang mit Kapuze … Alchemist eine Pestmaske aus Drachenschuppenleder“.
- **Jägerin (`HUNT`, Flag `b.hunt`):** 6 Kopfteile (Stoffmaske → Nachtschleier), 6 Rüstungen (Lederweste → Nachtumhang, ab Pirschmantel als Umhang), je 4 Handschuhe, Stiefel, Gürtel. Stufen `HUNTT`: Nachtleder (+12), Dämmerseiden (+24), **Schwarzdiamant** (+36, Material `diamond`). Geschick-Anforderung ≈ 1,1 × Stufe.
- **Alchemist (`ALCH`, Flag `b.alch`):** Schutzbrille, Laborkappe, Rauchmaske, Schnabelmaske, Pestmaske, Alchemistenhaube; Lederschürze, Laborkittel, Wachsmantel, Säureschürze, Pestmantel, Elixierkutte; je 4 Handschuhe, Stiefel, Gürtel. Stufen `ALCHT`: Wachsleder, Basiliskenleder, **Drachenschuppen** (Material `dscale`). Keine Anforderung außer Stufe.
- Zusammen 192 Teile (48 Grundformen × 4), Stufe 1 bis 69. Spitzenstücke: `Schwarzdiamant-Nachtumhang` (69), `Schwarzdiamant-Schattenmantel` (55), `Drachenschuppen-Pestmaske` (61).
- **Eingebaute Werte** wie bei der Magier-Ausrüstung (`HUIMP`/`ALIMP`, steigen mit der Stufe des Teils): Jägerin Geschick, Krit, Angriffs- und Lauftempo, Leben; Alchemist `potPow` (Tränke **und** Phiolenschaden über `alD`), Widerstände, Gift, `flaskH`, Mana. `MODTXT`/`MODORDER` kennen jetzt `potPow, flaskH, cdr, mcost`.
- **4 neue Dolche** (`ALDG`): Stilett 5, Kris 9, Rabenschnabel 20, Giftzahn 26, jeweils mit allen `MATS`-Stufen (28 Waffen).
- **18 Unikate**: 7 Jägerin-Rüstung, 4 Dolche, 7 Alchemist (z. B. Schleier der Mondlosen Nacht, Atem der Seuche, Mantel des Steins der Weisen).
- **Beute:** Ein Teil aus dem Set einer fremden Klasse (Magier, Jägerin, Alchemist) wird zu 55 % neu gewürfelt (`gSetOf`). Tooltip zeigt „Ausrüstung: <Klasse>“.
- **Am Charakter** (`heroLook`-Wrapper setzt Flags, gezeichnet in `940-huntress.js`): Kapuzen-Helm färbt die Jägerinnen-Kapuze (`R.hoodR`, `HOODOFF` unterdrückt die doppelte Kapuze aus `vHelm`), Umhänge hängen hinten bis zu den Knien (`R.cape`), Schwarzdiamant funkelt (`gGlint`, `R.glint` Bit 1 Kopf, Bit 2 Umhang). Alchemisten-Schürze nimmt die Farbe der Rüstung (`R.apR`), Mäntel sind länger (`R.coat`), Drachenschuppen zeigen Schuppen (`R.scales`). Masken in `vHelm`: `mask, hood, goggle, labcap, smoke, beak, plague` (mit Kapuze und breitem Hut), `ahood`. Andere Klassen tragen die Teile mit allgemeiner Kapuze bzw. Maske.
- Pixelbilder: `PXA.hood, cmask, cloak, vest, apron, coat, goggle, beak`.
- Wiki: zeigt die Schilder „Jägerin“/„Alchemist“ (Feld `kit` in `turm-wiki/index.html`).
- Hinweis: Die oberste Stufe braucht Gegenstandsstufe ≈ 80 (Auswahlgrenze `ilvl·0,75+1`), wie die übrigen Endstufen.

## Alte Spielstände (`P.clv`)
- Wanderer: Dialog „Der Wanderer geht“ (`clsPick`) beim ersten Laden; Stufe, Erfahrung, Glut, Gegenstände bleiben; Eigenschaftspunkte über den alten Grundwerten, alle Fertigkeitspunkte und alle Talentpunkte kommen zurück; fremde Waffe wandert ins Inventar, Startwaffe der neuen Klasse wird angelegt.
- Alle anderen: Talentbaum zurückgesetzt (Punkte zurück). Jägerin zusätzlich Fertigkeitspunkte zurück.

Zurück zu [[Start]].
