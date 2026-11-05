// Godot export, the small things lying about on islands: the low-poly meshes from 810-low-poly-props.js (DCB, baked by
// dcLP) instead of the old flat pictures of 760 (DCS) – the browser has drawn these since 810, the first sky export took the
// wrong ones. The candles keep where each wick stands (fl). Runs like tools/godot-export.js (test build, through __ev);
// writes assets/sprites/dc/<art>.png and updates data/sprites.json.
(async () => {
  const put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const meta = await (await fetch('/schwarzer-turm/godot/data/sprites.json?' + Date.now())).json();
  const out = [];
  for (const k of Object.keys(DCB)) {
    const c = dcLP(k);
    await put('assets/sprites/dc/' + k + '.png', await png(c));
    meta['dc/' + k] = Object.assign({w: c.width, h: c.height, ax: c.ax, ay: c.ay}, c.fl ? {fl: c.fl} : {});
    out.push(k + ' ' + c.width + '×' + c.height);
  }
  await put('data/sprites.json', JSON.stringify(meta, null, 1));
  return 'Kleinkram (Low-Poly): ' + out.join(', ');
})()
