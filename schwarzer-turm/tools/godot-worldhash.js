// Godot check, sky: prints the same numbers as `godot ... -- --worldhash` (tower.gd) for seed 4242. Runs like
// tools/godot-export.js (test build, through __ev). Uses the plain functions of 300-endless-sky.js, without what later
// modules add to the islands' content (chests, sights, living isles, dead lands), because Godot has not got those yet.
(() => {
  const S = 4242, keep = G.seed; G.seed = S; WBC = null; RG.seed = null;
  const sh = s => { let h = 0; for (const c of new TextEncoder().encode(s)) h = (h * 31 + c) % 1000000007; return h };
  const out = [];
  try {
    let kinds = '', list = [];
    for (let cy = 30; cy < 50; cy++) for (let cx = 30; cx < 50; cx++) { const I = islandOf(cx, cy); kinds += I ? I.kind.slice(0, 2) : '.' }
    out.push('Inseln ' + sh(kinds));
    for (let cy = 30; cy < 50; cy++) for (let cx = 30; cx < 50; cx++) { const I = islandOf(cx, cy); if (I) list.push(cx + ',' + cy + ':' + I.kind + '@' + I.x.toFixed(2) + ',' + I.y.toFixed(2) + ' r' + I.r.toFixed(3)) }
    out.push('Inselliste ' + sh(list.join(' ')));
    const m = genWorld(), cx = Math.floor(m.start.x / CH), cy = Math.floor(m.start.y / CH);
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) _owIslandR(m, cx + dx, cy + dy);
    const want = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const a = cx + dx, b = cy + dy; owBridge(m, a, b, a + 1, b); owBridge(m, a, b, a, b + 1); owBridge(m, a - 1, b, a, b); owBridge(m, a, b - 1, a, b); want.push([a, b]) }
    const cd = want.map(([a, b]) => [a + ',' + b, _owContentR(m, a, b)]);
    let h = 0;
    for (let j = 35 * 32; j < 44 * 32; j++) for (let i = 35 * 32; i < 44 * 32; i++) { const k = j * m.w + i; h = (h * 31 + m.t[k] * 7 + m.under[k]) % 1000000007 }
    out.push('Kacheln ' + h);
    for (const [key, c] of cd) {
      let dh = 0; for (const d of c.deco) dh = (dh * 31 + Math.round(d.x * 1000) + Math.round(d.y * 1000) * 7 + d.v) % 1000000007;
      let bh = 0; for (const b of c.blocks) bh = (bh * 31 + b.i * 3 + b.j * 5 + b.v) % 1000000007;
      let sp = 0; for (const q of c.spawn) sp = (sp * 31 + Math.round(q.x * 10) + Math.round(q.y * 10) * 3) % 1000000007;
      out.push(key + ': Deko ' + c.deco.length + '/' + dh + ' Blöcke ' + c.blocks.length + '/' + bh + ' Requisiten ' + c.props.length + ' Objekte ' + c.objs.map(o => o.type + '@' + o.x.toFixed(1) + ',' + o.y.toFixed(1) + (o.name ? ' ' + o.name : '')).join(',') + ' Gegner ' + c.spawn.length + '/' + sp);
    }
    let bb = 0; for (const L of m.bblocks.values()) for (const b of L) bb = (bb * 31 + b.i * 3 + b.j * 5 + b.v) % 1000000007;
    out.push('Geländer ' + bb);
    out.push('Heimat: Deko ' + m.home.deco.length + ' Blöcke ' + m.home.blocks.length + ' Objekte ' + m.home.objs.length);
    out.push('Inselherren ' + WB.map(b => b.cx + ',' + b.cy).join(' '));
    // the whole sky, and the ground around four far places
    const all = [];
    for (let cy = 0; cy < 80; cy++) for (let cx = 0; cx < 80; cx++) { const I = islandOf(cx, cy); if (I) all.push(cx + ',' + cy + ':' + I.kind + '@' + I.x.toFixed(2) + ',' + I.y.toFixed(2) + ' r' + I.r.toFixed(3)) }
    const far = [];
    for (const [x, y] of [[50, 45], [30, 30], [60, 60], [20, 50]]) {
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) _owIslandR(m, x + dx, y + dy);
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const a = x + dx, b = y + dy; owBridge(m, a, b, a + 1, b); owBridge(m, a, b, a, b + 1); owBridge(m, a - 1, b, a, b); owBridge(m, a, b - 1, a, b) }
      let fh = 0; for (let j = (y - 3) * 32; j < (y + 4) * 32; j++) for (let i = (x - 3) * 32; i < (x + 4) * 32; i++) { const k = j * m.w + i; fh = (fh * 31 + m.t[k] * 7 + m.under[k]) % 1000000007 }
      far.push(fh);
    }
    out.push('Alle ' + all.length + ' ' + sh(all.join(' ')) + ' Felder ' + far.join(' '));
  } finally { G.seed = keep; WBC = null; RG.seed = null }
  return out.join('\n');
})()
