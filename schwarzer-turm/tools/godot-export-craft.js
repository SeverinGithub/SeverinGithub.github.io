// Godot export, the workshop (600-workshop.js with the meshes of 810-low-poly-props.js): the anvil of joining on its
// stump and the glyph table as the baked pictures the browser draws (LPA.anv, LPA.tab), without the glow, the rune line
// and the circling gems, which Godot paints on top. Runs like tools/godot-export.js (test build, through __ev) on the hill.
(async () => {
  const put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const meta = await (await fetch('/schwarzer-turm/godot/data/sprites.json?' + Date.now())).json();
  // both are baked on their first draw; draw them once beside the hero into a scratch canvas
  const st0 = G.state, c0 = ctx, sc = document.createElement('canvas'); sc.width = W; sc.height = H;
  G.state = 'export'; ctx = sc.getContext('2d');
  try { drawAnvilJ({type: 'anvil', x: P.x, y: P.y}); drawEnchT({type: 'enchant', x: P.x, y: P.y}) } finally { ctx = c0; G.state = st0 }
  if (!LPA.anv || !LPA.tab) throw new Error('nicht gebacken – auf dem Hügel starten');
  const out = [];
  for (const [k, c] of [['anvil', LPA.anv], ['enchant', LPA.tab]]) {
    await put('assets/sprites/craft/' + k + '.png', await png(c));
    meta['craft/' + k] = {w: c.width, h: c.height, ax: c.ax, ay: c.ay};
    out.push(k + ' ' + c.width + '×' + c.height);
  }
  await put('data/sprites.json', JSON.stringify(meta, null, 1));
  return out.join(' · ');
})()
