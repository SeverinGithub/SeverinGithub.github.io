// Godot check, the dead lands: prints the same lines as `godot ... -- --rghash` (DeadLands.hash_text in dead_lands.gd) for
// seed 4242: where the land lies, its tiles, every building, block, scrap on the ground, skeleton and object of the plan
// (rgPlan in 520-dead-lands-plan.js), the witch huts, the tiles of four chunks after rgFill and their content.
// Runs like tools/godot-export.js (test build, through __ev).
(() => {
  const S = 4242, keep = G.seed, keepB = G.owBoss; G.seed = S; G.owBoss = {}; WBC = null; RG.seed = null;
  const sh = s => { let h = 0; for (const c of new TextEncoder().encode(s)) h = (h * 31 + c) % 1000000007; return h };
  const c2 = x => String(Math.round(x * 100));
  const out = [];
  try {
    const R = rgInit(), pl = rgPlan();
    out.push('Lage ' + R.ax + ' ' + R.c + ' · Tor ' + R.gcx + ',' + R.gcy);
    let fh = 0; for (let k = 0; k < pl.T.length; k++) fh = (fh * 31 + pl.T[k] * 7 + pl.U[k]) % 1000000007;
    out.push('Felder ' + fh + ' · Tor ' + R.gate.join(' '));
    const L = {props: [], blocks: [], deco: [], spawn: [], objs: []};
    for (const [key, b] of R.bk) {
      for (const p of b.props) L.props.push(key + ' ' + p.k + '@' + c2(p.x) + ',' + c2(p.y) + ' v' + p.v + ' f' + (p.fw || 0) + 'x' + (p.fh || 0) + ' p' + c2(p.ph));
      for (const q of b.blocks) L.blocks.push(key + ' ' + q.k + '@' + q.i + ',' + q.j + ' v' + q.v);
      for (const d of b.deco) L.deco.push(key + ' ' + d.k + '@' + c2(d.x) + ',' + c2(d.y) + ' v' + d.v);
      for (const s of b.spawn) L.spawn.push(key + ' ' + s.vid + '@' + c2(s.x) + ',' + c2(s.y) + ' ' + s.rank + ' ' + s.rgz);
      for (const o of b.objs) L.objs.push(key + ' ' + o.type + '@' + c2(o.x) + ',' + c2(o.y));
      if (b.rgBoss) L.objs.push(key + ' boss@' + c2(b.rgBoss.x) + ',' + c2(b.rgBoss.y));
    }
    for (const k of ['props', 'blocks', 'deco', 'spawn', 'objs']) out.push(k + ' ' + L[k].length + ' ' + sh(L[k].join(' ')));
    out.push('Hütten ' + R.huts.map(([x, y]) => c2(x) + ',' + c2(y)).join(' '));
    out.push('Chunks ' + R.bk.size);
    const m = genWorld(), at = [[R.gcx, R.gcy]];
    for (const [p, q] of [[60, 8], [200, 0], [330, 0]]) { const [x, y] = rgW(p, q); at.push([Math.trunc(x / CH), Math.trunc(y / CH)]) }
    for (const [a, b] of at) owIsland(m, a, b);
    let wh = 0;
    for (const [a, b] of at) for (let j = b * CH - 4; j < b * CH + CH + 4; j++) for (let i = a * CH - 4; i < a * CH + CH + 4; i++) { const k = j * m.w + i; wh = (wh * 31 + m.t[k] * 7 + m.under[k]) % 1000000007 }
    out.push('Welt ' + wh);
    for (const [a, b] of at.slice(1)) { const c = owContent(m, a, b); out.push(a + ',' + b + ': lvl ' + c.lvl + ' Deko ' + c.deco.length + ' Blöcke ' + c.blocks.length + ' Requisiten ' + c.props.length + ' Objekte ' + c.objs.length + ' Gegner ' + c.spawn.length + ' Büschel ' + c.lv.tuft.length) }
    const gc = owContent(m, R.gcx, R.gcy);
    out.push('Tor: lvl ' + gc.lvl + ' Objekte ' + gc.objs.map(o => o.type + '@' + c2(o.x) + ',' + c2(o.y)).join(' ') + ' Blöcke ' + gc.blocks.length);
  } finally { G.seed = keep; G.owBoss = keepB; WBC = null; RG.seed = null }
  return out.join('\n');
})()
