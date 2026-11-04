// Godot check, hill village: prints the same lines as `godot ... -- --hillhash[=g]` (tower.gd) for seed 4242. Runs like
// tools/godot-export.js (test build, through __ev): a fresh world from genWorld, then hvBuild with growth step window.__hvG (0).
(() => {
  const S = 4242, keep = {seed: G.seed, map: G.map, bd: G.bossDead, ot: owTick, gr: localStorage.getItem(HVGK)};
  const sh = s => { let h = 0; for (const c of new TextEncoder().encode(s)) h = (h * 31 + c) % 1000000007; return h };
  const out = [], f2 = v => v.toFixed(2);
  try {
    G.seed = S; WBC = null; RG.seed = null; localStorage.removeItem(HVGK);
    const g = window.__hvG || 0; G.bossDead = {}; for (let k = 0; k < g; k++) G.bossDead['b' + k] = true;
    owTick = () => {};
    const m = genWorld(); hvBuild(m); const H = m.home;
    out.push('Kacheln ' + H.hvU.length + ' ' + sh(H.hvU.map(([k]) => k + ':' + m.t[k] + '/' + m.under[k]).join(' ')));
    const b = H.blocks.filter(x => x.hv).map(x => x.k + x.v + '@' + x.i + ',' + x.j + (x.big ? 'B' : ''));
    out.push('Blöcke ' + b.length + ' ' + sh(b.join(' ')) + ' ' + b.slice(0, 4).join(' '));
    const p = H.props.filter(x => x.hv).map(x => x.k + '@' + f2(x.x) + ',' + f2(x.y));
    out.push('Requisiten ' + p.length + ' ' + sh(p.join(' ')) + ' ' + p.slice(0, 4).join(' '));
    const o = H.objs.filter(x => x.hv).map(x => x.type + '@' + f2(x.x) + ',' + f2(x.y) + '>' + x.to.map(t => t[0]).join(','));
    out.push('Wegweiser ' + o.length + ' ' + sh(o.join(' ')));
    out.push('Ziele ' + H.hvDest.map(d => d[0] + '@' + f2(d[1]) + ',' + f2(d[2])).join(' '));
    out.push('Start ' + f2(m.start.x) + ',' + f2(m.start.y) + ' Deko ' + H.deco.length);
    if (window.__hvP) out.push(p.join('\n'), b.join('\n'));
  } finally { G.seed = keep.seed; G.map = keep.map; G.bossDead = keep.bd; owTick = keep.ot; if (keep.gr != null) localStorage.setItem(HVGK, keep.gr); WBC = null; RG.seed = null }
  return out.join('\n');
})()
