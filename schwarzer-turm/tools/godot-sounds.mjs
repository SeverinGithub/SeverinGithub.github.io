// Sounds for Godot: copies the recordings (sfx/, music/) into godot/assets/audio/ and renders every sound the
// browser synthesised with WebAudio (sfx() in 120-audio.js, SYN in 690-sounds-4.js) into WAV files, a few
// variants each, because the noise and the scattered delays come out different every time.
// node tools/godot-sounds.mjs   → godot/assets/audio/{sfx,music,syn}/ and godot/data/sounds.json
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'godot/assets/audio');
const SR = 32000;

// mulberry32, so the files do not change on every run
let seed = 4242;
const R = () => {seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296};
const rnd = (a, b) => a + R() * (b - a);

// WebAudio automation: setValueAtTime, then exponential ramps; holds the last value afterwards
const env = pts => t => {
  if (t < pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {const [t0, v0] = pts[i - 1], [t1, v1] = pts[i];
    if (t < t1) return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0))}
  return pts[pts.length - 1][1]};

// the biquad of the WebAudio spec (lowpass/highpass Q in dB, bandpass Q plain)
function coef(type, f, q) {
  const w = 2 * Math.PI * Math.min(f, SR * .49) / SR, c = Math.cos(w), s = Math.sin(w);
  const al = type === 'bandpass' ? s / (2 * q) : s / (2 * Math.pow(10, q / 20));
  let b0, b1, b2;
  if (type === 'lowpass') {b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0}
  else if (type === 'highpass') {b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0}
  else {b0 = al; b1 = 0; b2 = -al}
  const a0 = 1 + al;
  return [b0 / a0, b1 / a0, b2 / a0, -2 * c / a0, (1 - al) / a0]}
function filt(type, freq, q) {let x1 = 0, x2 = 0, y1 = 0, y2 = 0, k = null, n = 0;
  return (x, t) => {if (!k || (n++ & 15) === 0) k = coef(type, freq(t), q);
    const y = k[0] * x + k[1] * x1 + k[2] * x2 - k[3] * y1 - k[4] * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y}}

// band-limited edges for square and saw, like the browser's oscillators
const blep = (p, dt) => p < dt ? (p /= dt, p + p - p * p - 1) : p > 1 - dt ? (p = (p - 1) / dt, p * p + p + p + 1) : 0;
function wave(type, p, dt) {
  if (type === 'sine') return Math.sin(2 * Math.PI * p);
  if (type === 'triangle') return p < .25 ? 4 * p : p < .75 ? 2 - 4 * p : 4 * p - 4;
  if (type === 'sawtooth') return 2 * p - 1 - blep(p, dt);
  return (p < .5 ? 1 : -1) + blep(p, dt) - blep((p + .5) % 1, dt)}

// one sound is a list of voices summed into one buffer
function render(voices) {
  const len = Math.ceil(SR * (Math.max(...voices.map(v => v.T + v.len)) + .05)), buf = new Float32Array(len);
  for (const v of voices) {
    const i0 = Math.floor(v.T * SR), i1 = Math.min(len, Math.ceil((v.T + v.len) * SR));
    let ph = R();
    for (let i = i0; i < i1; i++) {const t = i / SR;
      let x;
      if (v.osc) {const f = Math.max(1, v.freq(t) + (v.vib ? v.vib * Math.sin(2 * Math.PI * v.vr * (t - v.T)) : 0)), dt = f / SR;
        x = wave(v.osc, ph, dt); ph = (ph + dt) % 1}
      else x = R() * 2 - 1;
      if (v.f) x = v.f(x, t);
      buf[i] += x * v.gain(t)}}
  return buf}

// tone() and noise() of the old sfx(): one gain node set to vol, falling to nothing over dur
const tone = (f1, f2, dur, w = 'square', vol = .06) => ({osc: w, T: 0, len: dur, freq: env([[0, f1], [dur, f2]]), gain: env([[0, vol], [dur, .0001]])});
const noise = (dur, vol = .08, freq = 1200) => ({T: 0, len: Math.min(dur, .3), f: filt('lowpass', () => freq, 1), gain: env([[0, vol], [dur, .0001]])});
// syO and syN of 690
function syO(t, {type = 'sine', f0, f1 = f0, dur, vol, at = .006, del = 0, vib = 0, vr = 6, filt: fl = null, fq = 1}) {const T = t + del;
  return {osc: type, T, len: dur + .05, vib, vr, freq: env([[T, f0], [T + dur, Math.max(20, f1)]]), gain: env([[T, .0001], [T + at, vol], [T + dur, .0001]]),
    f: fl ? filt(fl[0], () => fl[1], fq) : null}}
function syN(t, {dur, vol, ft = 'lowpass', f0, f1 = f0, q = 1, at = .004, del = 0}) {const T = t + del, fr = env([[T, f0], [T + dur, Math.max(20, f1)]]);
  return {T, len: dur + .05, f: filt(ft, fr, q), gain: env([[T, .0001], [T + at, vol], [T + dur, .0001]])}}

const OLD = {hit: () => [noise(.12, .12, 900)], swing: () => [noise(.09, .05, 2600)], hurt: () => [tone(180, 60, .25, 'sawtooth', .07)], cast: () => [tone(300, 900, .18, 'triangle', .06)],
  boom: () => [noise(.35, .16, 500)], pick: () => [tone(700, 1100, .08, 'square', .04)], gold: () => [tone(1200, 1500, .06, 'triangle', .04)], lvl: () => [tone(400, 1200, .5, 'triangle', .08)],
  roll: () => [noise(.18, .05, 700)], unique: () => [tone(500, 1600, .6, 'sine', .08)], zap: () => [noise(.15, .08, 4000)], draw: () => [noise(.22, .03, 450)],
  twang: () => [tone(240, 110, .17, 'triangle', .09)], bolt: () => [tone(150, 60, .13, 'square', .06)], death: () => [tone(200, 40, 1.2, 'sawtooth', .08)]};
const SYN = {
  thud: t => [syO(t, {f0: 150, f1: 38, dur: .5, vol: .55}), syO(t, {type: 'triangle', f0: 75, f1: 30, dur: .35, vol: .3}), syN(t, {dur: .25, vol: .4, f0: 1100, f1: 180})],
  quake: t => [...SYN.thud(t), syN(t, {dur: .07, vol: .35, ft: 'highpass', f0: 2400}), syN(t, {dur: 1.2, vol: .3, f0: 320, f1: 90, at: .08, del: .05}), syO(t, {f0: 55, f1: 28, dur: 1.1, vol: .35, del: .04})],
  whoosh: t => [syN(t, {dur: .32, vol: .4, ft: 'bandpass', f0: 380, f1: 2600, q: 2.2, at: .13})],
  spin: t => [0, 1, 2].map(k => syN(t, {dur: .18, vol: .3, ft: 'bandpass', f0: 500, f1: 2200, q: 2.5, at: .07, del: k * .13})),
  twang: t => [syO(t, {type: 'triangle', f0: 230, f1: 185, dur: .28, vol: .28}), syO(t, {f0: 460, f1: 410, dur: .16, vol: .1}), syN(t, {dur: .05, vol: .18, ft: 'highpass', f0: 3200}), ...SYN.whoosh(t + .02)],
  volley: t => {const v = []; for (let k = 0; k < 6; k++) v.push(syN(t, {dur: .16, vol: .2, ft: 'bandpass', f0: 1400, f1: 4200, q: 3, at: .05, del: k * rnd(.05, .11)}));
    for (let k = 0; k < 10; k++) v.push(syN(t, {dur: .035, vol: .22, ft: 'highpass', f0: rnd(1800, 3600), del: rnd(.55, 1.15)})); return v},
  bones: t => {const v = []; for (let k = 0; k < 11; k++) v.push(syN(t, {dur: .04, vol: .3, ft: 'bandpass', f0: rnd(1400, 2600), q: 9, del: rnd(0, .38)})); v.push(syO(t, {f0: 110, f1: 60, dur: .4, vol: .25})); return v},
  clang: t => [...[[523, .12, .9], [1307, .09, .7], [2093, .07, .5], [2951, .05, .35]].map(([f, v, d]) => syO(t, {f0: f * rnd(.98, 1.02), f1: f * .99, dur: d, vol: v, at: .002})), syN(t, {dur: .06, vol: .25, ft: 'highpass', f0: 3000})],
  bubble: t => {const v = []; for (let k = 0; k < 7; k++) {const f = rnd(280, 720); v.push(syO(t, {f0: f, f1: f * 1.9, dur: .07, vol: .14, del: rnd(0, .42)}))} v.push(syN(t, {dur: .32, vol: .08, ft: 'bandpass', f0: 1300, q: 1.5, at: .05})); return v},
  snap: t => [syN(t, {dur: .05, vol: .4, ft: 'highpass', f0: 2800}), syO(t, {type: 'square', f0: 900, f1: 200, dur: .08, vol: .07}), syO(t, {f0: 1780, f1: 1760, dur: .3, vol: .06, del: .01})],
  equip: t => [syN(t, {dur: .05, vol: .22, ft: 'bandpass', f0: 900, q: 3}), syO(t, {f0: 1568, f1: 1550, dur: .18, vol: .06, del: .05, at: .002}), syO(t, {f0: 2350, f1: 2330, dur: .12, vol: .04, del: .07, at: .002})],
  ghoul: t => [syO(t, {type: 'sawtooth', f0: 170, f1: 55, dur: .75, vol: .16, vib: 28, vr: 17, filt: ['lowpass', 700]}), syN(t, {dur: .4, vol: .3, f0: 700, f1: 150, del: .08})],
  cult: t => [syO(t, {type: 'sawtooth', f0: 230, f1: 85, dur: .85, vol: .16, vib: 9, vr: 6, filt: ['bandpass', 850], fq: 3}), syN(t, {dur: .25, vol: .12, ft: 'bandpass', f0: 1500, f1: 600, q: 2})],
  wraith: t => [syO(t, {f0: 950, f1: 280, dur: 1.3, vol: .14, vib: 32, vr: 7, at: .08}), syO(t, {f0: 1420, f1: 430, dur: 1.1, vol: .07, vib: 40, vr: 5.5, at: .1}), syN(t, {dur: 1, vol: .06, ft: 'highpass', f0: 2200, f1: 900, at: .1})],
  golem: t => {const v = []; for (let k = 0; k < 9; k++) v.push(syN(t, {dur: rnd(.1, .2), vol: .3, f0: rnd(400, 1000), f1: 150, del: rnd(0, .8)})); v.push(syO(t, {f0: 62, f1: 28, dur: .9, vol: .45})); return v},
  // Brannoc's forge out in the world (460): a breath of the bellows, the hiss of the quench (vol × nearness in the game)
  bellows: t => [syN(t, {dur: .55, vol: .05, f0: 220, f1: 640, at: .18})],
  quench: t => [syN(t, {dur: 1.3, vol: .07, ft: 'highpass', f0: 5200, f1: 1600, at: .02}), syN(t, {dur: .5, vol: .05, ft: 'bandpass', f0: 2400, f1: 900, q: 2})],
  dragon: t => [syO(t, {type: 'sawtooth', f0: 120, f1: 48, dur: 1.5, vol: .22, vib: 14, vr: 9, filt: ['lowpass', 750], at: .05}), syN(t, {dur: 1.3, vol: .22, ft: 'bandpass', f0: 700, f1: 250, q: 1.2, at: .05}), syO(t, {f0: 60, f1: 30, dur: 1.4, vol: .3})]};

function wav(file, buf, peak) {
  const n = buf.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i] / peak)) * 32767), 44 + i * 2);
  fs.writeFileSync(file, b)}

const info = {syn: {}, sfx: {}, music: []};
fs.mkdirSync(path.join(OUT, 'syn'), {recursive: true});
for (const f of fs.readdirSync(path.join(OUT, 'syn'))) fs.unlinkSync(path.join(OUT, 'syn', f));
const jobs = [...Object.entries(OLD).map(([k, f]) => ['s_' + k, f, 2]), ...Object.entries(SYN).map(([k, f]) => ['y_' + k, () => f(0), 3])];
for (const [k, f, n] of jobs) {
  // every variant of one sound is written with the same scale, so they stay equally loud; quiet ones are lifted
  // into the file and the player turns them down again by g
  const bufs = []; for (let v = 0; v < n; v++) bufs.push(render(f()));
  const pk = Math.max(...bufs.map(b => b.reduce((m, x) => Math.max(m, Math.abs(x)), 0))) / .95;
  bufs.forEach((b, v) => wav(path.join(OUT, 'syn', `${k}_${v}.wav`), b, pk));
  info.syn[k] = {n, g: +pk.toFixed(5)}}

// recordings: sfx/<name><n>.mp3 and the playlists of music/
for (const [dir, key] of [['sfx', 'sfx'], ['music', 'music']]) {
  const src = path.join(ROOT, dir), dst = path.join(OUT, dir); fs.mkdirSync(dst, {recursive: true});
  for (const f of fs.readdirSync(src).filter(f => f.endsWith('.mp3')).sort()) {
    const d = path.join(dst, f); if (!fs.existsSync(d) || fs.statSync(d).size !== fs.statSync(path.join(src, f)).size) fs.copyFileSync(path.join(src, f), d);
    if (key === 'music') info.music.push(f);
    else {const m = f.match(/^(.*?)(\d)\.mp3$/); info.sfx[m[1]] = Math.max(info.sfx[m[1]] || 0, +m[2])}}}
fs.writeFileSync(path.join(ROOT, 'godot/data/sounds.json'), JSON.stringify(info, null, 1));
console.log(`syn ${jobs.length} Klänge, sfx ${Object.keys(info.sfx).length} Arten, Musik ${info.music.length} Stücke`);
