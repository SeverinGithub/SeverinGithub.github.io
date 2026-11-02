---
tags: [feature, balance, karte, multiplayer]
---
# Anpassung an den Spieler, Karten-Zoom, feste Objekte

Wunsch des Nutzers (2026-11-02): Bosse sollen sich am Spieler messen und **immer sehr schwer** sein, „wie das Elden-Ring-Boss-System“. Normale Gegner passen sich **sanft** an. Im Multiplayer zählt der **stärkste Spieler**, dazu kommt ein Faktor für die Spielerzahl. Die Karte soll auf dem iPad gut zoombar sein. Händler, Leuchtfeuer, Riss-Stein usw. dürfen nicht mehr begehbar sein.

Alles steht im Modul „the tower measures you“ direkt vor der Init-Zeile.

## Spieler-Analyse
- `hitEnemy`-Wrapper sammelt den Schaden pro Ziel. `pwTick` (über `update`) bildet jede Sekunde den höchsten Schaden auf **ein** Ziel und mittelt ihn (`PW.dps`, gleitend 12 %). Sekunden ohne Treffer zählen nicht, Flächenschaden bläht den Wert also nicht auf.
- `pwEst()` schätzt den Wert aus dem Charakterbogen: `pDmg(1)·aspd·(1+Krit)`. Das gilt, solange es weniger als 4 Messungen gibt, danach mindestens als Untergrenze (halber Wert).
- `pwMit(ml)` nimmt dieselbe Rüstungsformel wie `hurtPlayer`. Leben, Rüstung, `dmgred`, Runen und Verzauberungen fließen über `P.d` ein.
- `myPow()` liefert `{dps, life, mit, red}`.

## Bosse („Sehr schwer“)
- Die Anpassung läuft **beim ersten Aggro** (`updEnemy`-Wrapper, `e.adapt`). Das gilt für jeden Gegner mit `e.boss`: Turm-, Insel-, Kloster-, Riss- und Arena-Bosse. Spiegel-Gegner bei Gästen (`e.mir`) werden nicht angepasst, das erledigt der Host.
- Ziel: Kampfdauer `BTTK=68` s bei gemessenem DPS, `BHITS=7` volle Treffer bis zum Tod. `BMOVE=1.35` ist der mittlere Angriffsmultiplikator der Boss-Moves. Pro Schwierigkeitsstufe dauert der Kampf 15 % länger, und es braucht 12 % weniger Treffer.
- Grenzen: Leben 0,6–15×, Schaden 0,6–8× des Grundwerts.
- Elden-Ring-Gefühl (`bossUpdate`-Wrapper):
  - **Kombos**: Nach einem Angriff folgt mit 38 % Chance sofort der nächste, in Phase 2 mit 55 % (bis zu 2 bzw. 3 in Folge).
  - **Verzögerte Angriffe**: 20 % der Angriffe halten 0,3 s länger, in Phase 2 30 %.
  - **Phase 2** (unter 50 % Leben, bestehende Raserei und `bossRage`): zusätzlich +15 % Schaden und +12 % Tempo.
  - **Trank-Bestrafung**: Wer im Umkreis von 9 Feldern eines aktiven Bosses den Flakon trinkt, wird sofort angegriffen (`drinkFlask`-Wrapper).
- Gemessen auf Stufe 1 (Krieger, ~8 DPS, 176 Leben): 553 Leben (≈ 68 s), Schaden 16–28 (≈ 7 Treffer).

## Normale Gegner („Sanft“)
- `adaptFoe` beim ersten Aggro, höchstens ±35 % auf Leben und Schaden. Beschworene Diener sind ausgenommen.
- Zielwerte pro Rang, so kalibriert, dass ein frischer Held auf Stufe 1 ungefähr neutral spielt:

| Rang | Kampfdauer (`ETTK`) | Treffer bis zum Tod (`EHITS`) |
|---|---|---|
| normal | 2 s | 42 |
| Gefolge | 2,8 s | 42 |
| Champion | 5,2 s | 28 |
| Einzigartig | 8,5 s | 24 |

## Multiplayer
- Gäste schicken alle 4 s `{t:'pw',dps,life,mit,red}`. Der Host legt das als `r.pow` ab (`mpRecv`-Wrapper).
- `teamPow()` auf dem Host: Der stärkste Spieler auf derselben Ebene ist der mit dem höchsten `dps·life/mit`. Dazu kommt `n` = Anzahl der Spieler auf der Ebene.
- Bosse: Leben ×n, Schaden ×(1+0,25·(n−1)), beides **nach** den Grenzen. Getestet: 3 Spieler ergeben genau 3× Leben und 1,5× Schaden.

## Karte (iPad)
- Zwei Finger zoomen um ihren Mittelpunkt und verschieben dabei. Ein Finger verschiebt wie bisher. Die Listener laufen in der Capture-Phase und stoppen den alten Ziehen-Handler, solange zwei Finger aufliegen bzw. bis alle losgelassen sind. Dadurch springt die Karte nicht.
- Neue Tasten `−`/`+` (`[data-mapz]`) im Kartenkopf. Zoom 1–18 wie beim Mausrad. Der Hinweistext wird unter 1000 px Breite ausgeblendet.

## Feste Kartenobjekte
- `SOLID` legt einen Radius pro Objekttyp fest: Händler (Odalinde), Leuchtfeuer (`shrine`), Riss-Stein, Schmied, Chronist, Truhe/Lager, Verzauberer, Amboss, Schleifstein, Koloss, Ei, Hort, Truhen. Türen, Treppen und Tore bleiben begehbar.
- Der `moveEnt`-Wrapper gilt für Spieler und Gegner und schiebt aus dem Kreis heraus. Bei einem frontalen Zusammenstoß gleitet man seitlich vorbei. Liegt der Ausweichpunkt in einer Wand, bleibt man stehen.
- Die Objekte liegen in einem 4×4-Raster-Cache pro Karte (`m._so`), der neu aufgebaut wird, wenn sich `m.objs` ändert.
- Interagieren geht weiter, weil die Radien unter der Interaktionsweite (1,4 bzw. 2,2 beim Koloss) liegen.

Zurück zu [[Start]].
