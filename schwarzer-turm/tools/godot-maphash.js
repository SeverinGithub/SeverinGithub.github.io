// Godot check, tower: prints the same lines as `godot ... -- --maphash` (tower.gd) for seed 4242, floors 1–4 (or set window.__mhF = [7, 10, …] first, like --maphash=7,10,…). Runs like
// tools/godot-export.js (test build, through __ev). genDungeon with all its wrappers (themes 982, rooms 984), then the seeded
// parts of populate: the chests of 770 and the secret, boulders and small things of 760; the unseeded traps of 390 stay out.
(() => {
  const S = 4242, keep = G.seed, R0 = R; G.seed = S;
  const sh = s => { let h = 0; for (const c of new TextEncoder().encode(s)) h = (h * 31 + c) % 1000000007; return h };
  const f2 = v => v.toFixed(2), out = [];
  try {
    for (const f of (window.__mhF || [1, 2, 3, 4])) {
      const m = genDungeon(f), np = m.props.length, nd = m.deco.length;
      // populate runs 760 (secret, boulders, small things) inside 770 (chests), so the small things come first
      R = mulberry(G.seed * 6151 + f * 92821);
      m.secret = null; if (f >= 2 && R() < .5) { const s = secretSpot(m); if (s) m.secret = Object.assign(s, { open: false }) }
      if (m.secret) secretWall(m, m.secret);
      m.boulders = []; if (f >= 3) for (const r of m.rooms) { if (r === m.startRoom || (m.boss && r === m.endRoom) || R() > .2) continue; const b = boulderSpot(m, r); if (b) { m.boulders.push(b); m.traps = m.traps || []; m.traps.push(b); m.props.push({ k: 'dcboulder', x: b.x, y: b.y, v: 0, ph: 0, trap: b }) } }
      dungeonDecor(m);
      R = mulberry(G.seed * 4409 + f * 55331); m.chx = 1; dungeonChests(m);
      let h = 0; for (const v of m.t) h = (h * 31 + v) % 1000000007;
      out.push(`Ebene ${f}: Karte ${h} · ${nd} Stücke Deko · ${np} Requisiten · Objekte ` + JSON.stringify(m.objs.map(o => (o.ct || o.type) + '@' + f2(o.x) + ',' + f2(o.y))).replace(/","/g, '", "'));
      const fl = (a, g) => a.map(g).join(' ');
      out.push(`  Thema ${m.fth ? m.fth.id : '-'} · Fluch ${m.curse || '-'} · Lava ${fl(m.lava || [], L => f2(L.x) + ',' + f2(L.y) + '/' + f2(L.r))} · Wasser ${fl(m.water || [], L => f2(L.x) + ',' + f2(L.y) + '/' + f2(L.r))} · Dampf ${fl(m.vents || [], v => f2(v.x) + ',' + f2(v.y))} · Schacht ${m.well ? f2(m.well.x) + ',' + f2(m.well.y) : '-'}`);
      const ft = m.props.filter(p => p.k && (p.k.startsWith('ft') || p.k === 'twL') && !p.trap).map(p => p.k + '@' + f2(p.x) + ',' + f2(p.y) + (p.face || '') + (p.v != null ? ':' + p.v : ''));
      out.push(`  Raum ${m.sroom ? m.sroom.k + '@' + f2(m.sroom.cx) + ',' + f2(m.sroom.cy) + (m.sroom.order ? ' ' + m.sroom.order.join('') : '') : '-'} · Fässer ${fl(m.hz || [], z => z.k + '@' + f2(z.x) + ',' + f2(z.y))} · Platten ${fl(m.plates || [], p => f2(p.x) + ',' + f2(p.y) + '/' + f2(p.len))} · Risse ${fl(m.cracks || [], c => f2(c.x) + ',' + f2(c.y) + '/' + c.seed)} · Bilder ${ft.length} ${sh(ft.join(' '))}`);
      const sec = m.secret ? `${m.secret.fi},${m.secret.fj} ${m.secret.dir[0]},${m.secret.dir[1]}` : '-';
      const dc = m.props.filter(p => p.k && p.k.startsWith('dc')).map(p => p.k + '@' + f2(p.x) + ',' + f2(p.y) + (p.f ? 'f' : ''));
      if (window.__mhK) out.push('  KRAM ' + dc.join(' '));
      out.push(`  Geheim ${sec} · Felsen ${m.boulders.map(b => b.x0.toFixed(1) + ',' + b.y0.toFixed(1) + '/' + f2(b.ang) + '/' + b.len.toFixed(1) + '/' + b.cd.toFixed(3)).join(' ')} · Kram ${dc.length} ${sh(dc.join(' '))} ${dc.slice(0, 3).join(' ')}`);
    }
  } finally { G.seed = keep; R = R0 }
  return out.join('\n');
})()
