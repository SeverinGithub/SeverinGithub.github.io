// Item art engine: every piece is built from parts (shapes in design units, 24 per inventory cell), each with its material,
// a height profile and a bevel; the engine lights them from the upper left, bands the light into a short hand-picked ramp,
// lays contact lines where one part sits on another, a pattern (mail, scales, lames, quilting), decals (rivets, grooves, gems)
// and a dark outline. The same piece renders at the inventory size and smaller for the ground.
import zlib from 'node:zlib';

const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
// the game's material ramps (PXM in 240-pixel-art.js, diamond and dscale from 970/992) and gem ramps (PXG)
export const PXM = {
  steel: ['#3a4252', '#6b7587', '#a7b1c2', '#eef2f8'], iron: ['#2a2c33', '#4b4f59', '#787d88', '#acb1ba'], dark: ['#101016', '#24242e', '#3e3e50', '#7a7aa0'],
  bronze: ['#4a2c12', '#8a5624', '#c88a3e', '#f4cf86'], gold: ['#5c3c06', '#a87418', '#e2b23c', '#fff2a6'], bone: ['#544a3a', '#958a6e', '#cfc5a5', '#f6f0de'],
  wood: ['#2c1a0c', '#4f3017', '#774a24', '#a2703c'], leather: ['#26140a', '#482612', '#714020', '#9c6236'], blood: ['#2c0606', '#651010', '#a3201a', '#e85a40'],
  venom: ['#0f2410', '#24502a', '#4a8a46', '#a6e08a'], moss: ['#1a2a14', '#35532a', '#5e8a46', '#a9cf7e'], sky: ['#1a2a52', '#3a5ea6', '#7aa6e8', '#e2f0ff'],
  moon: ['#4a4e5e', '#8a90a6', '#c8cee0', '#ffffff'], void: ['#0c0816', '#22163a', '#43306a', '#8a6ad0'], stone: ['#25272b', '#45484e', '#6c7078', '#9da2aa'],
  ember: ['#3a1204', '#8a2c08', '#e0661a', '#ffc070'], cloth: ['#1a1030', '#2e2058', '#4a3a8a', '#7a6ac0'], grass: ['#1c3a0c', '#2f6a14', '#4fa020', '#9ae050'],
  diamond: ['#050409', '#121020', '#2a2744', '#d8e4ff'], dscale: ['#1c0605', '#4a120c', '#8a2c16', '#e2884a']};
export const PXG = {ruby: ['#5a0808', '#d0261c', '#ff9c88'], sapphire: ['#0c1c5c', '#2a60e0', '#a8d0ff'], emerald: ['#0a3a1a', '#2aa04a', '#a6f0a0'], ember: ['#6a1a04', '#ff7a1a', '#ffe0a0'],
  frost: ['#1a4a6a', '#6ad0ff', '#e8fbff'], amethyst: ['#2a0c4a', '#9a40e0', '#e0b0ff'], soul: ['#0c3a3a', '#40e0d0', '#e0fff8'], topaz: ['#5a3a00', '#ffc020', '#fff4b0'], life: ['#4a0404', '#c41c14', '#ff7a5a'], mana: ['#040c4a', '#1c4ad0', '#7ab0ff']};
// dark metals get a little more light so their form still reads
export const LIFT = {dark: .1, void: .07, diamond: .12, cloth: .04, leather: .03};
export const METAL = new Set(['steel', 'iron', 'dark', 'gold', 'bronze', 'moon', 'sky', 'blood', 'void', 'venom', 'diamond']);
const SHADOW = hx('#140c24'), WARM = hx('#fff6e0'), INK = hx('#0a0806');
// six tones: a cool deep shadow under the darkest step, the four steps, a warm glint over the brightest
export function ramp(name) {
  if (PXG[name]) { const g = PXG[name].map(hx); return [mix(g[0], SHADOW, .45), g[0], mix(g[0], g[1], .5), g[1], g[2], mix(g[2], WARM, .7)] }
  const c = (PXM[name] || PXM.steel).map(hx);
  return [mix(c[0], SHADOW, .4), c[0], c[1], c[2], c[3], mix(c[3], WARM, METAL.has(name) ? .65 : .3)];
}

// ---------- shapes in design units ----------
export const S = {
  rect: (x0, y0, x1, y1) => (x, y) => x >= x0 && x < x1 && y >= y0 && y < y1,
  rrect: (x0, y0, x1, y1, r) => (x, y) => { if (x < x0 || x >= x1 || y < y0 || y >= y1) return false; const dx = Math.max(x0 + r - x, 0, x - (x1 - r)), dy = Math.max(y0 + r - y, 0, y - (y1 - r)); return dx * dx + dy * dy <= r * r },
  ell: (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
  poly: pts => (x, y) => { let inside = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside } return inside },
  or: (...f) => (x, y) => f.some(g => g(x, y)),
  and: (...f) => (x, y) => f.every(g => g(x, y)),
  not: (a, b) => (x, y) => a(x, y) && !b(x, y),
  // a tube along a polyline, its radius running from r0 to r1
  tube: (pts, r0, r1 = r0) => { const segs = [], L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push([pts[i - 1], pts[i], tot, l]); tot += l }
    return (x, y) => segs.some(([a, b, t0, l]) => { const dx = b[0] - a[0], dy = b[1] - a[1], u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (l * l || 1))), d = Math.hypot(x - a[0] - dx * u, y - a[1] - dy * u); return d <= r0 + (r1 - r0) * (t0 + u * l) / (tot || 1) }) },
  mirror: (f, cx) => (x, y) => f(x, y) || f(2 * cx - x, y),
};
// height profiles in design units
export const H = {
  dome: (cx, cy, rx, ry, a) => (x, y) => a * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2 - ((y - cy) / ry) ** 2)),
  cylX: (cx, rx, a) => (x) => a * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)),
  cylY: (cy, ry, a) => (x, y) => a * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)),
  ridgeX: (cx, w, a) => (x) => a * Math.max(0, 1 - Math.abs(x - cx) / w),
  sum: (...f) => (x, y) => f.reduce((t, g) => t + g(x, y), 0),
};

// pattern tiles in output pixels: + lighter, - darker, = darker by two, . unchanged
const TILES = {
  mail: {w: 4, h: 3, off: 2, rows: ['=++=', '+..-', '.--.']},
  mailfine: {w: 3, h: 2, off: 1, rows: ['+.-', '-=.']},
  // scales: each a rounded plate hanging over the top of the row below, lit at its upper left, its rim dark
  scale: {w: 60, h: 60, off: 0, fn: (x, y) => { for (const rr of [Math.floor(y / 4) - 1, Math.floor(y / 4)]) {
    const off = (rr & 1) * 3, c = Math.floor((x - off) / 6), dx = x - (c * 6 + off) - 2.5, dy = y - rr * 4, adx = Math.abs(dx), bot = adx < 1 ? 5 : adx < 2 ? 4 : 3;
    if (dy < 0 || dy > bot) continue; if (dy === bot) return '='; if (dx > 2) return '-'; return dx < 0 && dy < 2 ? '+' : dy === bot - 1 && dx > 0 ? '-' : '.' } return '=' }},
  lame: {w: 5, h: 6, off: 0, rows: ['++++=', '+...-', '....-', '....-', '.+..-', '----=']},
  lamel: {w: 4, h: 5, off: 2, rows: ['+++=', '+..-', '+..-', '.+.-', '---=']},
  quilt: {w: 6, h: 6, off: 0, fn: (x, y) => ((x + y) % 6 === 0 || (x - y + 60) % 6 === 0) ? '-' : ((x + y) % 6 === 1 || (x - y + 60) % 6 === 1) ? '+' : '.'},
  weave: {w: 2, h: 2, off: 0, rows: ['+.', '.-']},
  grain: {w: 7, h: 3, off: 3, rows: ['.......', '..----.', '.......']},
};

export class Art {
  constructor(W, H, scale = 1) { this.W = W; this.H = H; this.s = scale; this.pw = Math.round(W * scale); this.ph = Math.round(H * scale); this.parts = []; this.decals = [] }
  part(p) { p.z ??= this.parts.length; p.bevel ??= 2; p.bias ??= 0; this.parts.push(p); return this }
  // decals in design units, after the shading: kind 'px' (one pixel of a tone), 'rivet', 'line', 'gem'
  dot(x, y, mat, t) { this.decals.push({k: 'px', x, y, mat, t}); return this }
  rivet(x, y, mat, small = false) { this.decals.push({k: 'rivet', x, y, mat, small}); return this }
  line(x0, y0, x1, y1, mat, t, hi) { this.decals.push({k: 'line', x0, y0, x1, y1, mat, t, hi}); return this }
  // a polished streak: a bright core line with a softer glow either side (metal only reads as metal with one)
  streak(x0, y0, x1, y1, mat = 'p') { this.decals.push({k: 'line', x0: x0 - 1, y0, x1: x1 - 1, y1, mat, t: 4}, {k: 'line', x0: x0 + 1, y0: y0 + 1, x1: x1 + 1, y1: y1 - 1, mat, t: 4}, {k: 'line', x0, y0, x1, y1, mat, t: 5}); return this }
  gem(x, y, r, mat = 'g') { this.decals.push({k: 'gem', x, y, r, mat}); return this }

  render(mats) {
    const {pw, ph, s} = this, N = pw * ph, P = this.parts, rampOf = m => ramp(mats[m] ?? m), metalOf = m => m === 'g' ? true : METAL.has(mats[m] ?? m);
    const owner = new Int16Array(N).fill(-1), masks = P.map(() => new Uint8Array(N));
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
      const u = (x + .5) / s, v = (y + .5) / s;
      P.forEach((p, i) => { if (p.shape(u, v)) { masks[i][y * pw + x] = 1; if (owner[y * pw + x] < 0 || P[owner[y * pw + x]].z <= p.z) owner[y * pw + x] = i } });
    }
    const L = (() => { const l = [-.55, -.72, .78], n = Math.hypot(...l); return l.map(v => v / n) })();
    const tone = new Int8Array(N).fill(-1);
    P.forEach((p, i) => {
      const m = masks[i], dist = new Float32Array(N).fill(0);
      // chamfer distance to the outside of the part's own shape (in pixels)
      for (let k = 0; k < N; k++) dist[k] = m[k] ? 1e9 : 0;
      const at = (x, y) => x < 0 || y < 0 || x >= pw || y >= ph ? 0 : dist[y * pw + x];
      for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) { const k = y * pw + x; if (m[k]) dist[k] = Math.min(dist[k], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414) }
      for (let y = ph - 1; y >= 0; y--) for (let x = pw - 1; x >= 0; x--) { const k = y * pw + x; if (m[k]) dist[k] = Math.min(dist[k], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414) }
      const bw = Math.max(1, p.bevel * s), hgt = new Float32Array(N);
      for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) { const k = y * pw + x; if (!m[k]) continue; const t = Math.min(1, (dist[k] - .5) / bw);
        hgt[k] = (p.h ? p.h((x + .5) / s, (y + .5) / s) * s : 0) + bw * (p.round ?? 1) * (1 - (1 - t) * (1 - t)) }
      const hh = (x, y, k0) => { if (x < 0 || y < 0 || x >= pw || y >= ph) return 0; const k = y * pw + x; return m[k] ? hgt[k] : 0 };
      const ramp6 = rampOf(p.mat), metal = p.metal ?? metalOf(p.mat), tile = p.pat && TILES[p.pat];
      const ox = Math.round((p.patX ?? 0) * s), oy = Math.round((p.patY ?? 0) * s);
      for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
        const k = y * pw + x; if (owner[k] !== i) continue;
        const nx = -(hh(x + 1, y) - hh(x - 1, y)) / 2, ny = -(hh(x, y + 1) - hh(x, y - 1)) / 2, nl = Math.hypot(nx, ny, 1);
        const lam = (nx * L[0] + ny * L[1] + L[2]) / nl + p.bias + (LIFT[mats[p.mat] ?? p.mat] || 0);
        let t = metal ? (lam > .97 ? 5 : lam > .86 ? 4 : lam > .66 ? 3 : lam > .42 ? 2 : lam > .2 ? 1 : 0) : (lam > .93 ? 4 : lam > .72 ? 3 : lam > .48 ? 2 : lam > .24 ? 1 : 0);
        // polished metal: a glint where the surface turns to the light, a soft bounce on the far rim
        if (metal) { const hz = [L[0], L[1], L[2] + 1], hn = Math.hypot(...hz), sp = (nx * hz[0] + ny * hz[1] + hz[2]) / nl / hn; if (sp > (p.spec ?? .993) && (p.glint ?? 1)) t = 5;
          if (dist[k] <= 1.5 && nx > .25 && ny > -.2 && t < 2) t = 2 }
        if (tile) { const px = x - ox, py = y - oy, row = Math.floor(py / tile.h), lx = ((px + (row & 1) * tile.off) % tile.w + tile.w) % tile.w, ly = ((py % tile.h) + tile.h) % tile.h;
          const c = tile.fn ? tile.fn(((px % 60) + 60) % 60, ((py % 60) + 60) % 60) : tile.rows[ly][lx]; t += c === '+' ? 1 : c === '-' ? -1 : c === '=' ? -2 : 0 }
        if (p.tones) t = p.tones(t, (x + .5) / s, (y + .5) / s);
        tone[k] = Math.max(0, Math.min(metal ? 5 : (p.top ?? 4), t));
      }
    });
    // contact lines: where a part lies on another, the lower one darkens to its deepest tone, and below the upper one a short cast shadow
    const out = new Array(N).fill(null);
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
      const k = y * pw + x, o = owner[k]; if (o < 0) continue; let t = tone[k];
      const hi = (dx, dy) => { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= pw || Y >= ph) return false; const q = owner[Y * pw + X]; return q >= 0 && q !== o && P[q].z > P[o].z && !P[q].soft };
      if (!P[o].noContact) { if (hi(-1, 0) || hi(1, 0) || hi(0, -1) || hi(0, 1)) t = P[o].contact === 'soft' ? Math.max(1, t - 2) : 0; else if (hi(0, -2) || hi(-1, -1)) t = Math.max(0, t - 1) }
      out[k] = rampOf(P[o].mat)[t];
    }
    const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < pw && y < ph && owner[y * pw + x] >= 0) out[y * pw + x] = c };
    for (const d of this.decals) {
      if (d.k === 'px') put(d.x * s - .5, d.y * s - .5, rampOf(d.mat)[d.t]);
      else if (d.k === 'rivet') { const r = rampOf(d.mat), x = Math.round(d.x * s - .5), y = Math.round(d.y * s - .5);
        if (s >= .9) { put(x, y, r[5]); put(x + 1, y, r[3]); put(x, y + 1, r[3]); put(x + 1, y + 1, r[1]) } else if (d.small) put(x, y, r[4]) }
      else if (d.k === 'line') { const r = rampOf(d.mat), X0 = d.x0 * s - .5, Y0 = d.y0 * s - .5, X1 = d.x1 * s - .5, Y1 = d.y1 * s - .5, n = Math.max(1, Math.round(Math.max(Math.abs(X1 - X0), Math.abs(Y1 - Y0))));
        for (let i = 0; i <= n; i++) { const x = Math.round(X0 + (X1 - X0) * i / n), y = Math.round(Y0 + (Y1 - Y0) * i / n); put(x, y, r[d.t]); if (d.hi != null && s >= .9) put(x + (d.hiX ?? 0), y + 1, r[d.hi]) } }
      else if (d.k === 'gem') { const r = rampOf(d.mat), R = Math.max(.8, d.r * s), cx = d.x * s - .5, cy = d.y * s - .5;
        for (let y = Math.floor(cy - R - 1); y <= cy + R + 1; y++) for (let x = Math.floor(cx - R - 1); x <= cx + R + 1; x++) {
          const dx = x - cx, dy = y - cy, dd = Math.hypot(dx, dy); if (dd > R + .35) continue;
          if (dd > R - .65 && R >= 1.6) { put(x, y, ramp('dark')[1]); continue }
          const l = -(dx + dy) / (R * 1.6); put(x, y, r[l > .35 ? 4 : l > -.1 ? 3 : l > -.45 ? 2 : 1]) }
        put(cx - R * .35, cy - R * .35, r[5]) }
    }
    // outline: every empty pixel beside the piece, a near-black tinted by what it borders
    const img = Buffer.alloc(N * 4);
    for (let k = 0; k < N; k++) if (out[k]) { img[k * 4] = out[k][0]; img[k * 4 + 1] = out[k][1]; img[k * 4 + 2] = out[k][2]; img[k * 4 + 3] = 255 }
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
      const k = y * pw + x; if (owner[k] >= 0) continue; let nb = -1;
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < pw && Y < ph && owner[Y * pw + X] >= 0) { nb = owner[Y * pw + X]; break } }
      if (nb < 0) continue; const c = mix(rampOf(P[nb].mat)[0], INK, .62); img[k * 4] = c[0]; img[k * 4 + 1] = c[1]; img[k * 4 + 2] = c[2]; img[k * 4 + 3] = 255;
    }
    return {w: pw, h: ph, data: img};
  }
}

// put an image into a larger transparent one (centred, or at the bottom)
export function frame(im, W, H, bottom = false) {
  const o = Buffer.alloc(W * H * 4), ox = Math.floor((W - im.w) / 2), oy = bottom ? H - im.h - 1 : Math.floor((H - im.h) / 2);
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const X = x + ox, Y = y + oy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; im.data.copy(o, (Y * W + X) * 4, (y * im.w + x) * 4, (y * im.w + x) * 4 + 4) }
  return {w: W, h: H, data: o};
}

// a plain PNG: one IHDR, one IDAT, no filters
const crcT = Array.from({length: 256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 };
const chunk = (type, data) => { const l = Buffer.alloc(4), t = Buffer.from(type), c = Buffer.alloc(4); l.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([l, t, data, c]) };
export function png(im) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(im.w, 0); ihdr.writeUInt32BE(im.h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((im.w * 4 + 1) * im.h); for (let y = 0; y < im.h; y++) im.data.copy(raw, y * (im.w * 4 + 1) + 1, y * im.w * 4, (y + 1) * im.w * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
// a contact sheet for looking at pieces: each scaled up, side by side on the bag's leather
export function sheet(ims, k = 4, bg = '#2a2420') {
  const gap = 6, W = ims.reduce((t, im) => t + im.w * k + gap, gap), Hh = Math.max(...ims.map(im => im.h * k)) + gap * 2, o = Buffer.alloc(W * Hh * 4), b = hx(bg);
  for (let i = 0; i < W * Hh; i++) { o[i * 4] = b[0]; o[i * 4 + 1] = b[1]; o[i * 4 + 2] = b[2]; o[i * 4 + 3] = 255 }
  let X = gap; for (const im of ims) { for (let y = 0; y < im.h * k; y++) for (let x = 0; x < im.w * k; x++) { const s = ((y / k | 0) * im.w + (x / k | 0)) * 4; if (im.data[s + 3] < 128) continue; im.data.copy(o, ((y + gap) * W + X + x) * 4, s, s + 4) } X += im.w * k + gap }
  return {w: W, h: Hh, data: o};
}
