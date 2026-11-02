---
tags: [feature, multiplayer]
---
# Multiplayer

## Grundlagen
- Online per PeerJS, Hosten/Beitreten per Code (`0ea686a`), später geteilte Monster, Fähigkeiten, Leuchtfeuer, Wiederbeleben (`854bc0e`), Host-Monster auf der ganzen Ebene (`c45d4c5`), gemeinsame Truhe (`46b9b8d`), Boss-Sieg zählt für alle (`3a2d55c`).
- `NET.role` 'host'/'guest', `NET.me` (Host hat id `'h'`), `NET.others` = Map der Remote-Spieler `r` (`x,y,floor,face,eq,look,nm,whirl,stale,…`).
- `mpSend(obj)` sendet; Pakete laufen über den Host (Relay-Typen in `MPRELAY`). `mpRecv(d,c)` wird von vielen Modulen umhüllt, jedes behandelt seine `d.t`.
- Paket-Typen u. a.: `s` (Zustand), `k` (Fertigkeit gewirkt), `l` (Aussehen + Questindex `qi`), `rv` (Wiederbeleben), neu `ar`/`arx` (Statue, siehe [[Arena]]).
- Gegner gehören dem Host; Gäste bekommen Spiegel (`mpDesc` kopiert primitive Felder) und töten diese lokal (`mpMirrorDies` → `killEnemy`).
- `mpHostHere()` = Gast und Host sind auf derselben Ebene. `mpOn` ist `const` (nicht umhüllbar).
- `MPSEE` = Sichtweite für Effekte/Sounds anderer Spieler.

## Chronik-Angleich (`c8be723`, 2026-11-02)
Wunsch: Alle Spieler werden auf den Quest-Stand des besten Spielers gehoben (Beispiel: Quest 33 vs. 19 → der mit 19 hat alle bis 33 erledigt), **ohne** Glut-Belohnung, damit niemand plötzlich zu stark wird.
- `mpLook` schickt `qi`; der Look-Hash enthält `'|'+L.qi`, sodass ein Questabschluss sofort neu gesendet wird.
- Im `l`-Handler: `if(d.qi>P.qi) mpQuestSync(d.qi, d.nm||r.nm)`.
- `mpQuestSync`: setzt `P.qi=to`, `qStart()`, Banner „CHRONIK ANGEGLICHEN“, Log-Zeile, `qHtml=''` (Tracker neu), `save()`. Keine Glut, keine XP, keine Talentpunkte.
- Gilt beim Beitreten und laufend.

## Statue für Gäste (`2aec3eb`)
Siehe [[Arena]] – Pakete `ar`/`arx`, Host ruft Gegner mit Stufe und Gegnerliste des Gastes.

## Fähigkeiten anderer Spieler sichtbar (`2aec3eb`)
Wunsch: „Animation, Farben und Auswirkungen bei Fähigkeiten-Nutzung eines anderen Spielers im Multiplayer auch sehen.“

### Vorher
`mpCastFx(r,d)` hatte handgeschriebene Effekte nur für die alten 17 Fertigkeiten (`MPOLD`: whirl, fire, nova, charge, ward, chain, slam, cry, leap, multi, pierce, trap, dash, rain, venom, meteor, blink). Alle neueren fehlten: Magier `m_bolt, m_ring, m_jump, m_storm, m_fuse`, Krieger `atem, schwur`, alle 24 Waffenfertigkeiten (`d_*` Dolche, `g_*` Großschwert, `h_*` Hammer, `sp_*` Speer).

### Lösung: echte Fertigkeit in einer Sandbox abspielen
Statt alles nachzubauen, läuft die **echte** Fertigkeit (`castExt(id,l,ang,tx,ty)`) auf einem Stellvertreter des Mitspielers, mit allen Schadenswegen abgeschnitten (`visRun(r,fn)`):
- **Stellvertreter** `visProxy(r)`: `Object.create(P)` mit eigenen `x,y,face,fuseT,dead,leap,path,…`; `eq.weapon` = Stab im Element des Mitspielers, `d=Object.create(P.d)` mit eigenem `okS`, damit `mElem()` das richtige Element liefert. Für die Dauer wird die globale `P` getauscht.
- **Abgeschaltet:** `hitEnemy, weaponHit, wHit, eHit, killEnemy, hitstop, kick` → leere Funktionen. `sample` wird nach Entfernung leiser. `G.shake` wird nur abgeschwächt übernommen.
- **Sprünge:** `leapTo` ersetzt – berechnet das Ziel und spielt die Landung zeitversetzt am Ziel ab (sonst würde der echte `WL.land`-Mechanismus den eigenen Helden bewegen/Schaden machen).
- **Verzögerte Teile:** `window.setTimeout`/`setInterval` werden während der Sandbox umhüllt, sodass auch spätere Schritte (`later(…)`, Klingentanz, Lanzenwall, Hammerwurf) wieder in der Sandbox laufen. Verschachtelte Aufrufe erkennen das über `VIS`.
- **Was in der Welt bleibt** wird umgeleitet: neue `G.proj` → `G.vproj` (ohne `onHit/onBoom`, `dmg 0`), neue `G.zones` → `G.vzones` (`dmg 0`, `vis:1`), neue `G.rings` → `dmg 0`, kein `onHit`, kein `slow`.
- **Resonanzen** der Magier (`G.mLast`, `G.mImpact`, `G.mJumpFrom`) werden pro Mitspieler in `r._mL/_mI/_mJ` geführt und danach wiederhergestellt – die eigenen Resonanzen bleiben unberührt, die des Mitspielers funktionieren.
- **Buffs**: `px.whirl` → `r.whirl` (bestehende Wirbel-Darstellung), `fuseT/atemT/oathT` → `r.fuseU/atemU/oathU` (Ablaufzeitpunkte); `mpFxTick` zeichnet dafür Partikel um den Mitspieler (rot für Zweiter Atem, gold für Schwur, Elementfarben für Verschmelzung).
- **Element im Paket:** `mpSend` umhüllt – bei `t:'k'` und `m_*` wird `e:mElem()` angehängt. Empfänger: `r._el = d.e || r.eq.weapon.elem || 'fire'`. (Bug beim Test: Element kam einen Zauber zu spät, weil `visProxy` das Element vor dem Setzen las – behoben.)
- `mpFxTick` umhüllt: Endeffekte der Element-Geschosse (Funken/Gift-Rauch), Spuren, und die Optik von `hail`/`thunder`/`mcloud`-Zonen (normalerweise in `updForge` zusammen mit Schaden – dort laufen vzones nicht durch).
- Getestet: alle 31 Fertigkeiten × 4 Elemente – eigener Held (Position, Leben, Mana, Buffs, Sprung/Dash-Zustand) und ein Testgegner mit 1e6 Leben blieben unverändert, keine Konsolenfehler.
- Bekannte Grenzen: Schild-Optik von `g_parry` und Dash-Bewegung erscheinen nicht am Mitspieler (dessen Position kommt ohnehin per Netz); `sfx()` (ohne Lautstärkeparameter) spielt in voller Lautstärke.

Zurück zu [[Start]].
