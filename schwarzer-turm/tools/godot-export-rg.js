// Godot export, the dead lands (530-art-dead-lands.js): every building the plan of 520 can place, painted once over its
// footprint as the browser does (rgSprite), in both directions the land can lie (along x or along y), so any seed finds
// its pictures. Written as assets/sprites/rg/<kind>/<v>/<fw>x<fh>.png with the anchor in data/sprites.json.
// Runs like tools/godot-export.js (test build, through __ev).
(async () => {
  const put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const meta = await (await fetch('/schwarzer-turm/godot/data/sprites.json?' + Date.now())).json();
  rgBuildSprites();
  // kind, variants, local footprints [w, h] as bld() is called in 520 (the world footprint swaps them when the land runs along y)
  const L = [
    ['rghouse', [0, 1, 2, 3, 4, 5], [[3, 3], [3, 4], [4, 3], [4, 4], [5, 3], [5, 4]]],
    ['rgchurch', [0], [[20, 16]]], ['rgfount', [0], [[4, 4]]], ['rgstall', [0, 1, 2], [[2, 2]]], ['rgwt', [0, 1], [[3, 3]]],
    ['rgpillar', [0, 1], [[1, 1]]], ['rgbanner', [0], [[1, 1]]], ['rgthrone', [0], [[2, 5]]], ['rgbell', [0], [[5, 5]]], ['rgbell', [1], [[4, 4]]],
    ['rghut', [0, 1, 2], [[4, 4]]], ['rgtower', [0, 1, 2], [[4, 4]]], ['rgcastle', [0], [[16, 16]]]];
  const done = new Set(), out = {};
  for (const [k, vs, fs] of L) for (const v of vs) for (const [a, b] of fs) for (const [fw, fh] of [[a, b], [b, a]]) {
    const key = 'rg/' + k + '/' + v + '/' + fw + 'x' + fh;
    if (done.has(key)) continue;
    done.add(key);
    const c = rgSprite(k, v, fw, fh);
    if (!c) continue;
    await put('assets/sprites/' + key + '.png', await png(c));
    meta[key] = {w: c.width, h: c.height, ax: c.ax, ay: c.ay};
    out[k] = (out[k] || 0) + 1;
  }
  await put('data/sprites.json', JSON.stringify(meta, null, 1));
  return Object.entries(out).map(([k, n]) => k + ' ' + n).join(' · ');
})()
