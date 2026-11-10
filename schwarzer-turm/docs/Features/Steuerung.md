---
tags: [feature, steuerung]
---
# Steuerung

## Tastatur (Desktop)
Haupt-Handler: `addEventListener('keydown',…)` bei Zeile ~1500, weitere kleine Handler verstreut (G, E, H, O, Alt). Übersicht für Spieler in `KEYS_HTML` (Esc-Menü).

| Taste | Funktion | Ort |
|---|---|---|
| Linksklick / Rechtsklick | laufen/angreifen / gewählte Fertigkeit | |
| 1–6 | Fertigkeit wirken + auswählen | |
| Leertaste | Ausweichrolle | |
| F | Heilflakon | |
| Q/Y · X | Heiltrank · Manatrank | |
| C · I/B · K/T · J · P | Charakter · Inventar · Fertigkeiten · Sammlung · Talentbaum | |
| L · M | Quest-Chronik · große Karte | |
| **Tab** | **Namen der Gegenstände am Boden ein/aus** (seit `2aec3eb`) | Handler Z. ~1500, `CFG.lblOff` |
| **V** | **Minikarte ein/aus** (früher Tab) | `G.showMap` |
| Alt (halten) | alle Bodennamen zeigen, auch wenn per Tab aus | `altDown` |
| E | nächsten Gegenstand aufheben (`quickLoot`) | |
| G | Aschebeschwörung (`summonAsh`) | |
| H | Reittier (`toggleRide`) | |
| O | Statistik-Panel (`pStat`) | |
| N · R · Esc | Ton · Grafik neu laden · Menü | |

**Belegt-Prüfung:** Vor dem Vergeben neuer Tasten alle Handler durchsuchen: `grep -n "addEventListener('keydown'" index.html` und `grep -n "==='x'"`. Freie Buchstaben (Stand 2aec3eb) u. a.: A, D, S, U, W, Z.

### Tab – Bodennamen (Entscheidung 2026-11-02)
- Wunsch: „mit Tab soll man Item-Namen die am Boden liegen ein- und ausblenden können“. Tab war die Minikarte → Nutzer gefragt; Antwort: Tab für Namen, Minikarte auf andere Taste. Angeboten war O, aber O ist schon Statistik → **V** genommen.
- Umsetzung: `drawLabels` umhüllt – bei `CFG.lblOff && !altDown` werden `G.labels` geleert und nichts gezeichnet. `lootShown` bleibt unangetastet (es steuert auch das Abdunkeln und `quickLoot`).
- Zustand wird mit `saveCfg()` gespeichert; Log-Zeile beim Umschalten.
- Folge: Ohne Namen kann man Gegenstände nicht über das Namensschild anklicken → Aufheben per E oder Alt halten.

## iPad / Touch
- Layout (`bf4b7be`): Leben oben links, Mana oben rechts, Einstellungen/Tab-Leiste über „>“ oben Mitte, Stick links, Fertigkeiten F1–F6 im Kreis um den großen Knopf rechts.
- **Großer Knopf rechts = Ausweichen** (Rolle in Stick-Richtung, `data-t="dash"`, ⟲). **Kleiner Knopf links neben dem Stick = Angriff** (`#tvdash` trägt jetzt `data-t="atk"`, ⚔ „Angriff“, gebunden mit `bindPad`; gedrückt halten greift weiter an).
- Achtung, Regressionsgefahr: Diese Belegung wurde schon zweimal vertauscht (`bf4b7be` → `07af7f4` → Nutzer meldete „hat sich wieder vertauscht“ → `79220d1`). Bei Änderungen an `tvCluster`/`bindPad` immer prüfen. `bindPad`-`up` entfernt `.on` auch vom Element selbst.

## Mittlere Maustaste als zweiter Grundangriff (2026-11-10, HTML-Fassung)
Wunsch: „mittlere Mausrad soll die Standardattacke zusätzlich sein, Linksklick bleibt.“
- `190-input.js`: Taste 1 setzt `mouse.mid`. Sie läuft nie zu einem Punkt: ohne Gegner unter dem Zeiger schlägt der Held auf der Stelle zum Mauszeiger (wie Shift+Klick), mit Gegner unter dem Zeiger wird der zum Ziel (hingehen und schlagen). Gehalten wird weiter geschlagen; fällt das Ziel, geht es auf der Stelle weiter.
- `200-update.js`: Bedingung `(P.standAtk!=null&&mouse.down)||(mouse.mid&&!P.target)`; das Ziel bleibt, solange die Taste gehalten wird.
- `preventDefault` verhindert das Auto-Scrollen des Browsers; `blur` und der Zustand „am Boden“ im Multiplayer lösen die Taste.
- Steht in der Steuerungsübersicht (`440-menus.js`). Linksklick und Touch unverändert.

Zurück zu [[Start]].
