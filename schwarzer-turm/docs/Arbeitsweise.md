---
tags: [regeln]
---
# Arbeitsweise und feste Regeln

Diese Regeln hat der Nutzer im Lauf der Sessions festgelegt. Sie gelten weiter.

## Veröffentlichen
- **Push nach `main` nur mit Freigabe.** Nach jedem Commit fragen; gepusht wird erst, wenn der Nutzer „Ja, live schalten“ antwortet (oder es in derselben Anfrage vorab erlaubt). Eine Freigabe gilt nur für diesen einen Push.
- Die Memory-Regel „kleine Änderungen direkt deployen“ gilt **nur für e-reading**, nicht für den Schwarzen Turm.
- **Artefakt immer mit aktualisieren:** nach jeder Änderung `schwarzer-turm/index.html` mit dem Artifact-Tool auf dieselbe URL veröffentlichen: https://claude.ai/artifact/RyXp68BqnpmdkzTHnvAd8z (gleicher `file_path`). Stand: v65.

## Commits
- Commit-Nachricht auf **Deutsch**, Präfix `Schwarzer Turm: `, beschreibt alle Änderungen ausführlich in einem Satzgefüge (siehe [[Changelog]]).
- Abschluss-Zeile: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Nur `schwarzer-turm/index.html` committen. **Nie** `_t.html` oder `_d.html` committen; `_t.html` vor dem Commit löschen.
- Im Repo liegen ungetrackte fremde Dateien (`.DS_Store`, `judas-unter-uns.html`, `music/`, `sfx/`, `turm-schmiede.html`, …) – nicht anfassen, nicht mitcommitten.

## Qualität und Stil
- Der Nutzer will **beste Qualität**; Optik im eigenen „custom poly“-Stil des Spiels (flach schattierte Low-Poly-Formen, Pixel-Look, keine glatten Vektor-Icons).
- Kommunikation mit dem Nutzer auf Deutsch, kurz und konkret. Der Nutzer schreibt oft knapp und mit Tippfehlern; Absicht wörtlich nehmen, bei echten Konflikten (z. B. Taste schon belegt) nachfragen.
- Code-Stil: dicht, eine Zeile pro Gedanke, englische Kommentare im Erzählton („the statue only calls what you have already beaten …“), Spieltexte auf Deutsch.
- Nach jeder Änderung im Browser testen (siehe [[Test-Workflow]]) und am Ende den Viewport wieder auf Desktop zurücksetzen.

## Ablauf einer typischen Anfrage
1. Code lesen (grep nach Funktionsnamen, siehe [[Code-Landkarte]]).
2. Neues Modul in einer Scratch-Datei schreiben, per Python vor der Init-Zeile einfügen (siehe [[Architektur]]).
3. Syntax-Check mit `node --check`.
4. `_t.html` bauen, im Browser-Pane testen, Screenshots prüfen.
5. `_t.html` löschen → Artefakt veröffentlichen → committen → fragen „Push it live?“ mit Antwort-Knopf „Ja, live schalten“.

Zurück zu [[Start]].
