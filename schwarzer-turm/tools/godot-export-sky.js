// Godot export, sky: the meadow (820-meadow.js: six richer grass tiles, 40 standing grass tufts, 8 kinds × 5, with their
// foot point and stiffness, 12 small ground patches), the chests closed and open (CHS, 770-chests.js) and the small
// things lying about on islands and in the tower (DCS, 760-tower-2.js). Runs like tools/godot-export.js (test build,
// through __ev); adds the pictures to data/sprites.json.
(async () => {
  const put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const meta = await (await fetch('/schwarzer-turm/godot/data/sprites.json?' + Date.now())).json();
  grassSprites(); GDK.length = 0; groundSprites();
  const save = async (key, c, extra = {}) => { await put('assets/sprites/' + key + '.png', await png(c)); meta[key] = Object.assign({w: c.width, h: c.height, ax: c.ax ?? null, ay: c.ay ?? null}, extra) };
  for (let v = 0; v < SPR.grass.length; v++) await save('grass/' + v, SPR.grass[v]);
  for (let n = 0; n < GTS.length; n++) await save('gt/' + n, GTS[n], {k: GTS[n].k});
  for (let n = 0; n < GDK.length; n++) await save('gdk/' + n, GDK[n]);
  if (!CHS.wood) chestSprites();
  for (const [k, S] of Object.entries(CHS)) { await save('chest/' + k + '/0', S.c); await save('chest/' + k + '/1', S.o) }
  if (!DCS.dcbones) dcSprites();
  for (const [k, c] of Object.entries(DCS)) if (c instanceof HTMLCanvasElement) await save('dc/' + k, c);
  await put('data/sprites.json', JSON.stringify(meta, null, 1));
  return 'Wiese: ' + SPR.grass.length + ' Grasfelder, ' + GTS.length + ' Büschel, ' + GDK.length + ' Bodenflecken; Truhen: ' + Object.keys(CHS).length + '; Kleinkram: ' + Object.keys(DCS).length;
})()
