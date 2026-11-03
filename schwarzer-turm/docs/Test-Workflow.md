---
tags: [technik, test]
---
# Test-Workflow

## Lokaler Server
```bash
cd /Users/severinschwarz/Documents/GitHub/SeverinGithub.github.io && python3 -m http.server 8770
```
Im Hintergrund starten (lief zuletzt als Hintergrund-Task). Aufruf: `http://localhost:8770/schwarzer-turm/_t.html`.

## Bauen, Testkopie und Syntax-Check
```bash
node tools/build.mjs --test
```
- Schreibt `index.html` und `_t.html`. Die Testkopie hat vor dem letzten `})();` die Eval-Brücke `window.__ev=s=>eval(s)`.
- Die Syntax wird automatisch geprüft; bei einem Fehler nennt der Build die Quelldatei und die Zeile.
- Im Browser-Pane per JavaScript: `__ev("P.x")`, Mehrzeiliges als `` __ev(`(()=>{ … return x })()`) ``.
- Ins Spiel: `document.getElementById('btnCont').click()` („Fortsetzen“), dann ~2,5 s warten.
- Messanzeige: `_t.html?perf` (oder Shift+F3), siehe [[Performance]].
- `_t.html` steht in `.gitignore`. Trotzdem vor dem Commit löschen.

## Tricks
- **Touch erzwingen** (iPad-Steuerung testen): `sed "s/const TOUCH=matchMedia/const TOUCH=true||matchMedia/"` auf die fertige `_t.html` (nicht auf `src/`); Berührungen mit `new Touch(...)` + `TouchEvent` simulieren.
- **Viewport:** Browser-Pane ist schmal; für Desktop-Ansicht `resize_window` 1280×800, danach immer wieder auf `desktop` zurücksetzen.
- **Screenshots hinken** oft einen Frame hinterher (Animationen) – zweiten Screenshot machen.
- **Nahaufnahme eines Objekts:** WebGL-Canvas und `cv` sind nicht auslesbar. Stattdessen Objekt in eigenen Canvas zeichnen, indem man `ctx` kurz tauscht:
  ```js
  __ev(`(()=>{const o=G.map.objs.find(q=>q.type==='grind');const[sx,sy]=iso(o.x,o.y);const c=document.createElement('canvas'),s=6,w=90,h=75;c.width=w*s;c.height=h*s;const g=c.getContext('2d');g.fillStyle='#3e7a2a';g.fillRect(0,0,c.width,c.height);g.scale(s,s);g.translate(-(sx-w/2),-(sy-58));const c0=ctx;ctx=g;try{drawObj(o)}finally{ctx=c0}return c.toDataURL()})()`)
  ```
  und das Ergebnis als `<img>` oben links einblenden.
- **Tasten simulieren:** `dispatchEvent(new KeyboardEvent('keydown',{key:'Tab'}))`.
- **Multiplayer ohne zweiten Spieler:** `mpSend` kurz durch eine Sammelfunktion ersetzen, `NET.role` auf 'host'/'guest' setzen, `mpRecv({t:'ar',…},{})` direkt aufrufen. Ein Fake-Mitspieler: `r=mpRemote('t1');NET.others.set('t1',r);r.floor=G.floor;r.x=…`. Danach alles zurücksetzen (am besten in `try/finally`) oder Seite neu laden. `mpOn` ist `const` und nicht ersetzbar.
- **Runen testen:** `makeRune` liefert vor 3 besiegten Bossen „Zeichenloser Stein“ – direkt `_makeRuneL(k)` nehmen.
- Fehler in Frames fangen: `console.error` umhüllen und sammeln; alte Konsolenmeldungen stammen oft von früheren Ladevorgängen (Zeilennummern vergleichen).
- Tests verändern den Spielstand in localStorage von `localhost:8770` – das ist nicht der Spielstand des Nutzers auf GitHub Pages.

Zurück zu [[Start]].
