// Godot export, the living isles (989-living-isles.js): the worn grass of trodden paths, the patches of moss, clover, leaves,
// gravel and mud, the standing stones with runes and their glow in three colours, as the browser paints them once (lvSpr).
// Runs like tools/godot-export.js (test build, through __ev).
(async () => {
  const put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const meta = await (await fetch('/schwarzer-turm/godot/data/sprites.json?' + Date.now())).json();
  lvSpr();
  const out = [];
  const save = async (key, c, ax, ay) => {
    await put('assets/sprites/' + key + '.png', await png(c));
    meta[key] = {w: c.width, h: c.height, ax: ax ?? c.width / 2, ay: ay ?? c.height / 2};
  };
  for (const k of ['path', 'moss', 'clover', 'leaves', 'gravel', 'mud']) {
    for (let v = 0; v < LVS[k].length; v++) await save('lv/' + k + '/' + v, LVS[k][v]);
    out.push(k + ' ' + LVS[k].length);
  }
  for (let v = 0; v < SPR.prop.lvrune.length; v++) await save('prop/lvrune/' + v, SPR.prop.lvrune[v], SPR.prop.lvrune[v].ax, SPR.prop.lvrune[v].ay);
  for (const c of ['c', 'g', 'v']) for (let v = 0; v < LVS.glow[c].length; v++) await save('lv/glow/' + c + '/' + v, LVS.glow[c][v], 15, 49);
  out.push('Runensteine ' + SPR.prop.lvrune.length);
  await put('data/sprites.json', JSON.stringify(meta, null, 1));
  return out.join(' · ');
})()
