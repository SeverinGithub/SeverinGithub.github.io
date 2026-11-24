# Severin Organizer

Eigenständiges Projekt im Repo `SeverinGithub.github.io` – hat nichts mit `schwarzer-turm/` zu tun, dessen Regeln gelten hier nicht. Zweck, Funktionen und Dateien: siehe `README.md`.

## Leitlinie Design
Die App soll aussehen und sich bedienen lassen wie eine native Apple-App (iOS/macOS). Neue Oberflächen aus den vorhandenen Bausteinen bauen und Apple-Muster nehmen, keine eigenen Erfindungen:
- Farben nur über die Tokens in `style.css` (`--label`, `--label2`, `--card`, `--sep`, `--c-blue` …), die im Dunkelmodus umgeschaltet werden. Keine festen Farben im Markup; Jobfarben sind Namen (`blue`, `green` …) und werden über `colorOf()` zu `var(--c-…)`.
- Bausteine: `section()` + `.group` + `.cell` (gruppierte Liste), `.field` (Formularzeile), `.switch`, `.segmented`, `.ring` (Erledigt-Kreis), `.tile`/`.hero`/`.stats` (Kennzahlen), `calendar()` (Monat), `homeCalendar()`/`timeline()` (Tag/Woche mit Zeitachse, Ereignisse aus `dayEvents()`), `openSheet()` für Bearbeiten, `confirmAction()` statt `confirm()`/`prompt()`/`alert()`.
- Schrift 17 px als Grundgröße (Eingabefelder nie unter 16 px, sonst zoomt iOS), Safe-Area-Ränder beachten, Symbole als `<symbol>` in `index.html`.

## Technik
- Reines HTML/CSS/JS ohne Build und ohne Abhängigkeiten.
- Ereignisse laufen über Delegation: Klicks über `data-action`, Formulare über `data-form`. Neue Aktionen dort im `switch` ergänzen.
- Datenmodell im localStorage (`severin-organizer-v1`): `jobs` (max. 3, `{id,name,color,rate}`), `shifts` (`{id,jobId,date,hours,start?,rate,note}`, `start` „HH:MM“ oder leer → ganztägig in Tag/Woche), `accounts`, `todos` (`date` optional → Kalender der Übersicht), `notes`, `settings.minijobLimit`, `school` (`lessons` `{id,day 1–5,start,end,subject,teacher,room,note}`, `holidays` `{id,name,from,to}`, `validFrom`, `validTo`, `subjects` `{id,short,name,color}` – `short` verbindet mit `lessons[].subject`, `grades` `{id,subjectId,points 0–15 (bei geplanten null = offen),weight,kind ('ap' = Abschlussprüfung),date,title,term '11-1'|'11-2'|'12-1'|'12-2',planned?,created}`, `subjects[].abi`, `year11` (Startjahr der 11. Klasse; die 12. ist das aktuelle Schuljahr), `forecast` `{target,exact,fpa:[11/1,11/2]}`, `v` (Datenstand Schule). Fachabi-Rechnung nach FOBOSO in `faModel()`/`faTotal()`/`faNeed()`; Startwert `SCHOOL_SEED` in app.js, `normalizeSchool()` ergänzt fehlende Felder beim Start und Import). Die Sperre speichert nur die Passkey-ID unter `severin-organizer-v1:lock` (Sichtschutz, keine Verschlüsselung). Änderungen rückwärtskompatibel halten (`Object.assign(defaults(), …)`), sonst Schlüssel hochzählen und migrieren.
- **Nach jeder Änderung an index.html/style.css/app.js/Icons `VERSION` in `sw.js` hochzählen**, sonst sehen installierte Apps die Änderung erst einen Start später.
- Icons neu erzeugen: `icons/icon.svg` bearbeiten, dann `qlmanage -t -s 1024 -o icons icons/icon.svg` und mit `sips -z` auf 512/192/180/32 verkleinern.

## Arbeitsweise
- Sprache der Oberfläche und der Commits: Deutsch, Commit-Präfix `Severin Organizer: `.
- Testen: `python3 -m http.server 8080` im Ordner, im Browser auf Handybreite (375 px) in Hell **und** Dunkel prüfen. Beim Testen den Service Worker abmelden oder „Update on reload“ nutzen, sonst kommt die alte Fassung aus dem Cache.
- Committen oder Pushen nur nach ausdrücklicher Freigabe des Nutzers. Ein Push nach `main` geht über GitHub Pages sofort live.
- Fremde Änderungen anderer Unterprojekte im Arbeitsbaum nicht anfassen.
