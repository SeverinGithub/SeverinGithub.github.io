---
tags: [regeln]
---
# Arbeitsweise und feste Regeln

Diese Regeln hat der Nutzer im Lauf der Sessions festgelegt. Sie gelten weiter.

## Veröffentlichen
- **Push nach `main` nur mit Freigabe.** Nach jedem Commit fragen; gepusht wird erst, wenn der Nutzer „Ja, live schalten“ antwortet (oder es in derselben Anfrage vorab erlaubt). Eine Freigabe gilt nur für diesen einen Push.
- Die Memory-Regel „kleine Änderungen direkt deployen“ gilt **nur für e-reading**, nicht für den Schwarzen Turm.
- **Artefakt** (Stand 2026-11-02: alte URL nicht mehr erreichbar, neues nur nach Rückfrage) – früher: **immer mit aktualisieren:** nach jeder Änderung `schwarzer-turm/index.html` mit dem Artifact-Tool auf dieselbe URL veröffentlichen: https://claude.ai/artifact/RyXp68BqnpmdkzTHnvAd8z (gleicher `file_path`). Stand: v65.

## Commits
- Commit-Nachricht auf **Deutsch**, Präfix `Schwarzer Turm: `, beschreibt alle Änderungen ausführlich in einem Satzgefüge (siehe [[Changelog]]).
- Abschluss-Zeile: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Committet werden `src/`, `tools/`, die gebaute `index.html` (GitHub Pages liefert sie aus) und die Notizen in `docs/`. Vor dem Commit `node tools/build.mjs --check`: `index.html` muss zum Stand von `src/` passen. **Nie** `_t.html` oder `_d.html` committen (stehen in `.gitignore`).
- Im Repo liegen ungetrackte fremde Dateien (`.DS_Store`, `judas-unter-uns.html`, `music/`, `sfx/`, `turm-schmiede.html`, …) – nicht anfassen, nicht mitcommitten.

## Qualität und Stil
- Der Nutzer will **beste Qualität**; Optik im eigenen „custom poly“-Stil des Spiels (flach schattierte Low-Poly-Formen, Pixel-Look, keine glatten Vektor-Icons).
- Kommunikation mit dem Nutzer auf Deutsch, kurz und konkret. Der Nutzer schreibt oft knapp und mit Tippfehlern; Absicht wörtlich nehmen, bei echten Konflikten (z. B. Taste schon belegt) nachfragen.
- Code-Stil: dicht, eine Zeile pro Gedanke, englische Kommentare im Erzählton („the statue only calls what you have already beaten …“), Spieltexte auf Deutsch.
- Nach jeder Änderung im Browser testen (siehe [[Test-Workflow]]) und am Ende den Viewport wieder auf Desktop zurücksetzen.

## Ablauf einer typischen Anfrage
1. Code finden: `src/INDEX.md` lesen oder `grep -n name src/js/*.js`, dann nur die betroffene Moduldatei lesen (siehe [[Code-Landkarte]]).
2. Ändern: bestehendes Verhalten direkt in der Moduldatei, neues System als neue Datei `NNN-name.js` vor 999 (siehe [[Architektur]]).
3. `node tools/build.mjs --test` baut `index.html` und `_t.html` und prüft dabei die Syntax.
4. Im Browser-Pane testen, Screenshots prüfen, bei Leistungsfragen `?perf` anhängen (siehe [[Performance]]).
5. `_t.html` löschen, `node tools/build.mjs --check`, committen, dann fragen „Push it live?“ mit dem Antwort-Knopf „Ja, live schalten“.

Zurück zu [[Start]].
