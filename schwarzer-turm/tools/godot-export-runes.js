// Godot export, runes and the forge (350-runes.js, 450-smith.js, 460-smithy-mesh.js, 850-names-arena-grindstone.js):
// the fourteen rune stones and the two slates as ground pictures (pxCanvas), inventory icons (invIcon) and small stones for
// sockets; Brannoc's smithy baked over his whole twelve-second round (15 frames a second, one sheet), and the grindstone's
// wheel turning (one sheet, no glow: Godot adds that). Runs like tools/godot-export.js (test build, through __ev) on the hill.
(async () => {
  const LOG = [], put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const slug = s => String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const get = async rel => (await fetch('/schwarzer-turm/godot/data/' + rel + '?' + Date.now())).json();
  const icons = await get('icons.json'), ground = await get('ground.json'), meta = await get('sprites.json');

  // ---------- stones ----------
  const stones = RUNES.map(r => ['Rune:' + r.k, _makeRuneL(r.k)]).concat(['g', 'e'].map(k => ['Slate:' + k, makeSlate(k)]));
  for (const [key, it] of stones) {
    const c = pxCanvas(key, ''), f = slug(key) + '.png';
    await put('assets/ground/' + f, await png(c)); ground[key] = {file: f, w: c.width, h: c.height};
    const blob = await (await fetch(invIcon(it))).blob(); await put('assets/icons/' + f, blob); icons[key] = {file: f, size: isz(it)};
    const s = pxCanvas(key, '', false, 14); await put('assets/icons/sock_' + f, await png(s));
  }
  LOG.push('Steine: ' + stones.length);

  // ---------- a baked animation: draw fn(t) for every frame, crop all to the union of what was drawn ----------
  const bake = async (name, n, W0, H0, ax, ay, draw) => {
    const frames = [];let x0 = W0, y0 = H0, x1 = 0, y1 = 0;
    for (let k = 0; k < n; k++) {
      const c = document.createElement('canvas'); c.width = W0; c.height = H0; const g = c.getContext('2d', {willReadFrequently: true});
      const c0 = ctx; ctx = g; try { draw(k, g) } finally { ctx = c0 }
      const d = g.getImageData(0, 0, W0, H0).data;
      for (let y = 0; y < H0; y++) for (let x = 0; x < W0; x++) if (d[(y * W0 + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
      frames.push(c);
    }
    x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); const w = x1 - x0 + 2, h = y1 - y0 + 2, cols = Math.min(n, 16), rows = Math.ceil(n / cols);
    const sh = document.createElement('canvas'); sh.width = w * cols; sh.height = h * rows; const sg = sh.getContext('2d');
    frames.forEach((c, k) => sg.drawImage(c, x0, y0, w, h, (k % cols) * w, Math.floor(k / cols) * h, w, h));
    await put('assets/sprites/' + name + '.png', await png(sh));
    meta[name] = {w: sh.width, h: sh.height, ax: ax - x0, ay: ay - y0, fw: w, fh: h, cols, n};
    LOG.push(name + ': ' + n + ' Bilder zu ' + w + '×' + h);
  };
  const at = (o, W0, H0, ax, ay, g) => { const [sx, sy] = iso(o.x, o.y); g.translate(ax - sx, ay - sy) };
  const st0 = G.state, t0 = G.t; G.state = 'export';
  try {
    smithTick(0); const sm = G.map.objs.find(o => o.type === 'smith'); if (!sm) throw new Error('keine Schmiede – auf dem Hügel starten');
    const off = sm.off; sm.off = 0;
    // the flames flicker on G.t too; one round of SMC seconds loops on the round, the flicker jumps once
    await bake('smithy', SMC * 15, 260, 220, 130, 170, (k, g) => { G.t = k / 15; G.smithHit = 0; at(sm, 260, 220, 130, 170, g); drawSmith(sm) });
    sm.off = off;
    // the stone only stands once the glyph table does; for the picture a stand-in beside the hero will do
    const gr = G.map.objs.find(o => o.type === 'grind') || {type: 'grind', x: P.x, y: P.y};
    { G.grindFx = 0; const N = 96, P2 = Math.PI * 10 / 3;   // marks repeat every 2π/3, the crank every 2π/1.2: both after 10π/3
      await bake('grind', N, 90, 90, 45, 70, (k, g) => { gr.rot = k / N * P2 - .4 / 60; at(gr, 90, 90, 45, 70, g); drawGrind(gr) }) }
  } finally { G.state = st0; G.t = t0 }

  await put('data/icons.json', JSON.stringify(icons, null, 1));
  await put('data/ground.json', JSON.stringify(ground, null, 1));
  await put('data/sprites.json', JSON.stringify(meta, null, 1));
  return LOG.join(' · ');
})()
