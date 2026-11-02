---
tags: [feature, items]
---
# Runen und Runenwörter

## Daten
- `RUNES` (Liste, Index `r.i` = Seltenheit), `RBY[k]` = Rune nach Schlüssel: `{k,n,l,g (Glyphe),gem,weapon:{…},armor:{…},…}` – Mods je Slotgruppe `sgrp(it)`.
- `RW` = 15 Runenwörter `{n,r:[Runenfolge],s:[Slots],l,m:{mods}}`: Erster Funke, Steinhaut, Zornsturm, Dornenwall, Stille, Goldene Ernte, Glutherz, Frostbiss, Seelenfeuer, Rabenschwinge, Grabesruh, Blutschwur, Aschenkrone, Wächterherz, Turmbrecher.

## Regeln
- Sockel würfeln bei normal (28 %), magisch (14 %), selten (7 %); nie bei Unique (`rollSockets`). Odalinde kann Sockel schlagen.
- `insertRune(rn,it)`: Rune anhängen, Rune-Mods addieren, `req.lvl=max(req.lvl, r.l)`. Sind alle Sockel voll, das Item **normal** und die Folge passt → Runenwort: `w.m` addieren, `rw=w.n`, `rar='runeword'`, `name=w.n`, `req.lvl=max(…,w.l)`. In magischen/seltenen Items entsteht kein Runenwort (Meldung „Die Runen flackern …“).
- Runen droppen erst, wenn **3 Bosse** besiegt sind (`runeOK()`); vorher liefert das umhüllte `makeRune` Ramsch („Zeichenloser Stein“). `_makeRuneL` = echtes `makeRune`.
- Arena-Gegner droppen keine Runen.

## Prüfung 2026-11-02
Frage „funktionieren Runenwörter?“ → alle 15 im Browser geprüft: funktionieren. Keine Code-Änderung. Angebot, Odalindes Sockelanzahl wählbar zu machen (damit man gezielt 2/3/4-Runenwörter bauen kann) – **unbeantwortet**, siehe [[Offene Punkte]].

## Wieder herauslösen
Siehe [[Schleifstein]]. Dafür merkt sich `insertRune` (Wrapper) beim **ersten** Einsetzen `it.req0` und `it.name0`.

Zurück zu [[Start]].
