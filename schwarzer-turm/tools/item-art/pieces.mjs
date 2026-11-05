// The pieces: one function per drawn form, in design units (24 per inventory cell). Materials are slots: p main, s second, t third, g gem.
import {Art, S, H} from './engine.mjs';

export const PIECES = {};
const def = (name, w, h, fn) => { PIECES[name] = {w, h, fn} };

// ---------- body armour ----------
// a full plate cuirass: domed breastplate with a keel, gorget, layered pauldrons, three fauld lames
def('plate', 48, 72, (A, o = {}) => {
  // tassets: two hanging guards of three lames each over the thighs, the lowest drawn first
  for (const side of [-1, 1]) for (let j = 2; j >= 0; j--) {
    const cx = 24 + side * 7.8, y0 = 54 + j * 4.6, w = 6.6 + j * .3;
    A.part({shape: S.poly([[cx - w, y0], [cx + w, y0], [cx + w + side * .8, y0 + 5], [cx - w + side * .8, y0 + 5.6]].map(([x, y]) => [x, y + (x - 24) * side * .06])), mat: 'p', z: 4 - j, bevel: 1.4, h: H.cylX(cx, 9, 3), bias: -.05 * j, contact: 'soft'});
    if (j === 0) A.rivet(cx - side * 4.5, y0 + 2.3 + (cx - side * 4.5 - 24) * side * .06, 's');
  }
  // the fauld: two lames under the waist
  for (let j = 1; j >= 0; j--) { const y0 = 46 + j * 4.5, x0 = 14 - j, x1 = 34 + j;
    A.part({shape: S.poly([[x0, y0], [x1, y0], [x1 + 1, y0 + 5], [24, y0 + 6.2], [x0 - 1, y0 + 5]]), mat: 'p', z: 8 - j, bevel: 1.4, h: H.cylX(24, 13, 4), bias: -.04 * j, contact: 'soft'}) }
  A.part({shape: S.ell(24, 9.5, 6.2, 2.6), mat: 't', z: 5, bias: -.7, bevel: 1, glint: 0, metal: false});        // the dark inside of the collar
  const neck = S.ell(24, 10.5, 7, 3.8);
  A.part({shape: S.not(S.poly([[13, 12], [35, 12], [38, 20], [37, 31], [33.5, 44], [32, 48], [16, 48], [14.5, 44], [11, 31], [10, 20]]), neck), mat: 'p', z: 20, bevel: 2, spec: .985,
    h: H.sum(H.cylX(24, 14.5, 11), H.cylY(26, 28, 4), H.ridgeX(24, 1.6, 1.1))});
  if (!o.fluted) A.streak(18.5, 16, 19.5, 40);
  A.part({shape: S.and(S.rrect(15.5, 45.5, 32.5, 48.6, 1.5), S.rect(0, 46.6, 48, 50)), mat: 's', z: 21, bevel: 1, h: H.cylX(24, 9, 2), bias: -.12});         // waist edge
  A.part({shape: S.not(S.ell(24, 10, 9, 5.2), S.ell(24, 8, 6.2, 2.8)), mat: 'p', z: 22, bevel: 1.4, h: H.dome(24, 10, 9, 5.2, 4)});           // gorget
  A.part({shape: S.and(S.not(S.ell(24, 10, 9, 5.2), S.ell(24, 9.6, 9, 4.2)), S.rect(0, 11, 48, 20)), mat: 's', z: 23, bevel: .8, soft: 1, h: H.dome(24, 10, 9, 5.2, 4)});
  for (const side of [-1, 1]) {
    const cx = 24 + side * 14;
    for (let i = 1; i >= 0; i--) { const lx = cx + side * (2.4 + i * 1.6), ly = 24 + i * 4.4;
      A.part({shape: S.ell(lx, ly, 7.4 - i * .9, 4), mat: 'p', z: 30 + (1 - i), bevel: 1.3, h: H.dome(lx - side, ly - 1, 7.4, 4, 2.5), bias: -.04 * i});
      A.rivet(lx + side * 2.5, ly + 1, 's') }
    A.part({shape: S.ell(cx, 17, 9, 8), mat: 'p', z: 40, bevel: 2, h: H.dome(cx - side * 2, 15.5, 9, 8, 7)});               // the cop
    A.part({shape: S.and(S.not(S.ell(cx, 17, 9, 8), S.ell(cx - side * .4, 16.5, 7.6, 6.8)), S.rect(0, 17, 48, 40)), mat: 's', z: 41, bevel: 1, h: H.dome(cx - side * 2, 15.5, 9, 8, 7)});
    A.rivet(cx - side * 3, 12, 's');
  }
  A.rivet(16.5, 47, 's').rivet(30.5, 47, 's');
  if (o.fluted) for (const d of [-5, -2.5, 2.5, 5]) A.line(24 + d * .8, 15, 24 + d, 40, 'p', d < 0 ? 4 : 1);
  if (o.haute) for (const sd of [-1, 1]) A.part({shape: S.poly([[24 + sd * 9, 13], [24 + sd * 12, 3], [24 + sd * 17, 6], [24 + sd * 15, 13]]), mat: 's', z: 45, bevel: 1.2, h: H.cylX(24 + sd * 13, 4, 2)});
  if (o.spikes) for (const sd of [-1, 1]) for (const [dx, dy] of [[-3, -6], [2, -7.5], [7, -4]]) A.part({shape: S.poly([[24 + sd * (14 + dx) - 2, 14 + dy + 4], [24 + sd * (14 + dx + 1.5), 14 + dy - 4], [24 + sd * (14 + dx) + 2, 14 + dy + 4]]), mat: 's', z: 46, bevel: 1, h: H.cylX(24 + sd * (14 + dx), 2, 1.5)});
  if (o.gem) A.gem(24, 27, 2.8);
});

export function render(name, mats, scale = 1, opt) { const P = PIECES[name], A = new Art(P.w, P.h, scale); P.fn(A, opt); return A.render(mats) }

// ---------- helms (48×48) ----------
const DARK = 'dark';   // the shadow inside a helm
const hole = (A, shape, z = 1) => A.part({shape, mat: DARK, z, bias: -.9, bevel: 1, metal: false, glint: 0});
const brimRivets = (A, y, x0, x1, n, mat = 's', dy = 0) => { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : .5, x = x0 + (x1 - x0) * t; A.rivet(x, y + dy * Math.sin(t * Math.PI), mat) } };

// leather cap: four sewn panels, a bronze band, ear flaps
def('cap', 48, 48, (A) => {
  for (const sd of [-1, 1]) A.part({shape: S.rrect(24 + sd * 15 - 5, 26, 24 + sd * 15 + 5, 42, 4), mat: 'p', z: 2, bevel: 2, h: H.cylX(24 + sd * 15, 5, 2), bias: -.05});
  A.part({shape: S.and(S.ell(24, 27, 17, 21), S.rect(0, 0, 48, 30)), mat: 'p', z: 10, bevel: 2.5, h: H.dome(22, 22, 17, 18, 9), pat: 'grain'});
  A.part({shape: S.rrect(6.5, 26, 41.5, 32, 2.5), mat: 's', z: 12, bevel: 1.5, h: H.cylX(24, 18, 4)});
  for (const x of [17, 31]) A.line(x + (x < 24 ? -1 : 1) * 0, 9, x + (x < 24 ? -3 : 3), 25, 'p', 1);
  A.line(24, 6, 24, 25, 'p', 1);
  for (let y = 10; y < 25; y += 3) A.dot(25, y, 'p', 3);
  A.part({shape: S.ell(24, 5.5, 3, 2), mat: 's', z: 13, bevel: 1, h: H.dome(23, 5, 3, 2, 2)});
  brimRivets(A, 28.5, 10, 38, 6);
});
// mail coif: a hood of rings over head and shoulders, the face open
def('coif', 48, 48, (A) => {
  hole(A, S.ell(24, 25, 8, 9.5));
  A.part({shape: S.not(S.or(S.ell(24, 21, 16, 17), S.poly([[8, 26], [40, 26], [45, 44], [3, 44]])), S.ell(24, 25, 7.5, 9)), mat: 'p', z: 10, bevel: 2.5,
    h: H.sum(H.dome(22, 20, 17, 18, 8), H.cylX(24, 22, 4)), pat: 'mail', bias: .05});
  A.part({shape: S.and(S.not(S.ell(24, 25, 9.6, 11), S.ell(24, 25, 7.5, 9)), S.rect(0, 0, 48, 30)), mat: 's', z: 11, bevel: 1, h: H.dome(24, 25, 9.6, 11, 2)});
  A.part({shape: S.rrect(4, 41, 44, 45, 2), mat: 's', z: 12, bevel: 1, h: H.cylX(24, 21, 3), bias: -.1});
});
// spangenhelm: a pointed bowl of plates, a brow band, cheek guards
def('spangen', 48, 48, (A, o = {}) => {
  hole(A, S.rrect(13, 24, 35, 44, 5));
  for (const sd of [-1, 1]) A.part({shape: S.poly([[24 + sd * 10, 27], [24 + sd * 16, 27], [24 + sd * 15, 42], [24 + sd * 10, 44], [24 + sd * 8.5, 36]]), mat: 'p', z: 5, bevel: 1.5, h: H.cylX(24 + sd * 12, 5, 2), bias: -.03});
  A.part({shape: S.and(S.poly([[24, 2], [33, 10], [39, 20], [40, 28], [8, 28], [9, 20], [15, 10]]), S.ell(24, 30, 17, 28)), mat: 'p', z: 10, bevel: 2.5, h: H.sum(H.cylX(24, 16.5, 10), H.ridgeX(24, 1.5, 1)), spec: .985});
  A.part({shape: S.rrect(7, 23, 41, 29, 2), mat: 's', z: 12, bevel: 1.4, h: H.cylX(24, 18, 5)});
  for (const x of [16, 32]) A.line(24 + (x - 24) * .2, 5, x, 22, 's', 2);
  A.streak(18, 9, 15, 20);
  if (o.nasal) { A.part({shape: S.rrect(22, 27, 26, 41, 1.5), mat: 's', z: 13, bevel: 1, h: H.cylX(24, 2, 1.5)}); A.rivet(23.5, 26, 's') }
  brimRivets(A, 25.5, 10, 37, 5);
});
// great helm: a flat-topped pot with an eye slit and breaths, a bronze cross over the face
def('greathelm', 48, 48, (A, o = {}) => {
  A.part({shape: S.poly([[11, 6], [37, 6], [40, 12], [40, 42], [36, 45], [12, 45], [8, 42], [8, 12]]), mat: 'p', z: 10, bevel: 2.5, h: H.sum(H.cylX(24, 16.5, 11), H.cylY(10, 6, 1.5)), spec: .985});
  A.part({shape: S.rrect(9, 5, 39, 10, 2.5), mat: 'p', z: 11, bevel: 1.5, h: H.dome(23, 6, 15, 4, 3), bias: .06});
  hole(A, S.rrect(10, 19, 38, 22.5, 1), 20);
  A.part({shape: S.or(S.rrect(22, 10, 26, 44, 1), S.rrect(9, 16, 39, 19, 1)), mat: 's', z: 15, bevel: 1, h: H.cylX(24, 17, 4)});
  for (const sd of [-1, 1]) for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) hole(A, S.rect(24 + sd * (8 + c * 4) - 1, 27 + r * 4, 24 + sd * (8 + c * 4) + 1, 29 + r * 4), 21);
  A.streak(13, 11, 13, 40);
  A.rivet(24, 13, 's').rivet(24, 41, 's').rivet(11.5, 17.5, 's').rivet(36.5, 17.5, 's');
});
// sallet: a round skull sweeping into a tail, a visor slit, a bevor over the chin
def('sallet', 48, 48, (A) => {
  A.part({shape: S.poly([[4, 30], [10, 34], [16, 32], [14, 24]]), mat: 'p', z: 5, bevel: 1.5, h: H.cylY(30, 5, 2), bias: -.08});
  A.part({shape: S.and(S.ell(25, 24, 17, 19), S.rect(0, 0, 48, 31)), mat: 'p', z: 10, bevel: 2.5, h: H.dome(22, 18, 17, 17, 10), spec: .985});
  hole(A, S.and(S.rect(12, 21, 42, 24), S.ell(25, 24, 16, 18)), 20);
  A.part({shape: S.and(S.ell(26, 30, 15, 15), S.rect(0, 30.5, 48, 48)), mat: 'p', z: 12, bevel: 2, h: H.dome(25, 32, 15, 13, 6), bias: -.03});
  A.part({shape: S.and(S.not(S.ell(26, 30, 15, 15), S.ell(26, 29.2, 13.5, 13.7)), S.rect(0, 30.5, 48, 48)), mat: 's', z: 13, bevel: 1, soft: 1, h: H.dome(25, 32, 15, 13, 6)});
  A.line(25, 7, 25, 20, 'p', 4);
  A.streak(17, 9, 14, 19);
  brimRivets(A, 33, 16, 36, 3);
});
// barbuta: a deep round bowl down over the cheeks, a T opening for eyes and mouth
def('barbuta', 48, 48, (A) => {
  hole(A, S.or(S.rrect(14, 20, 34, 25, 2), S.rrect(20.5, 20, 27.5, 43, 2)));
  A.part({shape: S.not(S.poly([[24, 3], [34, 6], [40, 14], [41, 30], [38, 43], [31, 45], [17, 45], [10, 43], [7, 30], [8, 14], [14, 6]]),
    S.or(S.rrect(14, 20, 34, 25, 2), S.rrect(20.5, 20, 27.5, 46, 2))), mat: 'p', z: 10, bevel: 2.5, h: H.sum(H.cylX(24, 17, 11), H.cylY(16, 22, 4), H.ridgeX(24, 1.4, 1)), spec: .985});
  A.part({shape: S.and(S.not(S.rrect(12.5, 18.5, 35.5, 26.5, 3), S.rrect(14, 20, 34, 25, 2)), S.rect(0, 0, 48, 22)), mat: 's', z: 12, bevel: 1, soft: 1, h: H.cylX(24, 17, 6)});
  A.streak(14, 9, 12, 32);
  brimRivets(A, 43, 12, 36, 6, 's', 1.4);
});
// horned helm: a round dark helm with two bone horns sweeping up
def('horned', 48, 48, (A, o = {}) => {
  for (const sd of [-1, 1]) {
    const pts = o.ram ? [[24 + sd * 12, 20], [24 + sd * 19, 16], [24 + sd * 22.5, 22], [24 + sd * 20, 30], [24 + sd * 15, 29], [24 + sd * 15.5, 24.5]]
                      : [[24 + sd * 12, 22], [24 + sd * 18, 19], [24 + sd * 21, 12], [24 + sd * 21.5, 3]];
    A.part({shape: S.tube(pts, o.ram ? 4 : 3.8, o.ram ? 1.6 : .6), mat: 's', z: o.ram ? 20 : 4, bevel: 1.6, h: H.sum(), pat: 'grain', round: 1.4});
  }
  hole(A, S.rrect(15, 26, 33, 43, 4));
  A.part({shape: S.not(S.and(S.ell(24, 24, 16, 20), S.rect(0, 0, 48, 44)), S.rrect(15, 27, 33, 46, 4)), mat: 'p', z: 10, bevel: 2.5, h: H.sum(H.dome(22, 20, 16, 18, 10), H.ridgeX(24, 1.4, 1)), spec: .985});
  A.part({shape: S.rrect(8, 23, 40, 28, 2), mat: 'p', z: 12, bevel: 1.3, h: H.cylX(24, 16, 5), bias: .04});
  A.part({shape: S.rrect(22.5, 26, 25.5, 38, 1.2), mat: 'p', z: 13, bevel: 1, h: H.cylX(24, 1.5, 1.5)});
  A.streak(15, 11, 13, 21);
  brimRivets(A, 25, 11, 37, 5, 'p');
});
// crown: a dark band with tall gold points and gems; the war crown sits on a helm
def('crown', 48, 48, (A, o = {}) => {
  if (o.helm) { hole(A, S.rrect(18, 36, 30, 46, 2.5)); A.part({shape: S.not(S.and(S.ell(24, 30, 16, 17), S.rect(0, 14, 48, 46)), S.rrect(18, 36, 30, 47, 2.5)), mat: 'p', z: 5, bevel: 2.5, h: H.dome(22, 28, 16, 17, 9), spec: .985}) }
  const top = o.helm ? 6 : 8, base = o.helm ? 24 : 30;
  for (let i = 0; i < 5; i++) { const x = 9 + i * 7.5, ht = i === 2 ? 0 : i % 2 ? 6 : 3;
    A.part({shape: S.poly([[x - 3.6, base], [x - 1.2, top + ht + 4], [x, top + ht], [x + 1.2, top + ht + 4], [x + 3.6, base]]), mat: 's', z: 8, bevel: 1.2, h: H.cylX(x, 3.6, 2)});
    A.part({shape: S.ell(x, top + ht - .5, 1.8, 1.8), mat: 's', z: 9, bevel: 1, h: H.dome(x - .5, top + ht - 1, 1.8, 1.8, 1.5)}) }
  A.part({shape: S.rrect(5, base - 2, 43, base + 9, 2), mat: o.helm ? 's' : 'p', z: 12, bevel: 1.5, h: H.cylX(24, 20, 7), pat: o.helm ? null : 'grain'});
  A.part({shape: S.rrect(5, base - 3, 43, base, 1.5), mat: 's', z: 13, bevel: 1, h: H.cylX(24, 20, 6)});
  A.part({shape: S.rrect(5, base + 8, 43, base + 11, 1.5), mat: 's', z: 13, bevel: 1, h: H.cylX(24, 20, 6), bias: -.08});
  A.gem(24, base + 4, 3.2); A.gem(13, base + 4, 2); A.gem(35, base + 4, 2);
});

// ---------- body armour without plates ----------
// a tunic silhouette: shoulders, short sleeves, a body down to the hem; tall (48×72) or short (48×48)
const tunic = (tall, sleeve = 1) => { const b = tall ? 66 : 44, w = tall ? 1 : .9;
  return S.or(S.poly([[17, 6], [31, 6], [36, 8], [41, 11], [44, 16], [45, 22 + sleeve * 6], [37, 24 + sleeve * 6], [36, b - 4], [37, b], [11, b], [12, b - 4], [11, 24 + sleeve * 6], [3, 22 + sleeve * 6], [4, 16], [7, 11], [12, 8]])) };
const collarHole = S.ell(24, 6, 6, 3.4);
// mail shirt: rings everywhere, a leather belt, a collar
def('mail', 48, 72, (A, o = {}) => {
  hole(A, S.ell(24, 6.5, 5.5, 3));
  A.part({shape: S.not(tunic(true), collarHole), mat: 'p', z: 10, bevel: 2.5, h: H.sum(H.cylX(24, 22, 10), H.cylY(36, 34, 3)), pat: o.fine ? 'mailfine' : 'mail', bias: .04});
  for (const sd of [-1, 1]) A.line(24 + sd * 12, 24, 24 + sd * 12.5, 64, 'p', 1);
  A.part({shape: S.not(S.ell(24, 6.5, 8.5, 5), collarHole), mat: o.collar || 'p', z: 12, bevel: 1.2, h: H.dome(24, 6, 8.5, 5, 2), pat: o.collar ? null : 'mailfine'});
  if (o.trim) for (const sd of [-1, 1]) A.part({shape: S.poly([[24 + sd * 20.5, 22 + 6], [24 + sd * 21, 24], [24 + sd * 13, 26.5 + 4], [24 + sd * 13, 30.5 + 2]]), mat: 's', z: 13, bevel: 1, h: H.cylX(24 + sd * 17, 5, 2)});
  A.part({shape: S.rrect(11.5, 40, 36.5, 45, 1.5), mat: 's', z: 14, bevel: 1.2, h: H.cylX(24, 13, 4), metal: false});
  A.part({shape: S.rrect(21, 39, 27, 46, 1.2), mat: o.buckle || 'gold', z: 15, bevel: 1, h: H.dome(23, 41, 4, 4, 2)});
  hole(A, S.rect(23, 41, 25, 44), 16);
  A.part({shape: S.rrect(11, 62, 37, 66, 1.4), mat: 'p', z: 13, bevel: 1, h: H.cylX(24, 13, 3), pat: 'mailfine', bias: -.12});
});
// scale or lamellar coat: rows of plates over a leather body
def('scale', 48, 72, (A, o = {}) => {
  hole(A, S.ell(24, 6.5, 5.5, 3));
  A.part({shape: S.not(tunic(true, .7), collarHole), mat: 'p', z: 10, bevel: 2.5, h: H.sum(H.cylX(24, 22, 10), H.cylY(36, 34, 3)), pat: o.lam ? 'lamel' : 'scale', patX: 1, bias: .06});
  A.part({shape: S.not(S.ell(24, 6.5, 8.5, 5), collarHole), mat: 's', z: 12, bevel: 1.2, h: H.dome(24, 6, 8.5, 5, 2), pat: 'grain'});
  if (o.lam) for (const sd of [-1, 1]) for (let i = 2; i >= 0; i--) A.part({shape: S.rrect(24 + sd * 16 - 7, 12 + i * 4.5, 24 + sd * 16 + 7, 18 + i * 4.5, 2), mat: 'p', z: 20 + (2 - i), bevel: 1.2, h: H.cylX(24 + sd * 16, 7, 2), pat: 'lamel', bias: -.03 * i});
  if (o.lam) for (let y = 22; y < 62; y += 10) A.line(12, y, 36, y, 's', 2);
  A.part({shape: S.rrect(11.5, 40, 36.5, 45, 1.5), mat: 's', z: 14, bevel: 1.2, h: H.cylX(24, 13, 4), metal: false});
  A.part({shape: S.rrect(21, 39, 27, 46, 1.2), mat: 'gold', z: 15, bevel: 1, h: H.dome(23, 41, 4, 4, 2)});
  hole(A, S.rect(23, 41, 25, 44), 16);
  A.part({shape: S.rrect(11, 62, 37, 66.5, 1.4), mat: 's', z: 13, bevel: 1, h: H.cylX(24, 13, 3), metal: false, bias: -.1});
});
// brigantine: a riveted coat of leather over hidden plates, straps at the front
def('brigantine', 48, 72, (A) => {
  hole(A, S.ell(24, 6.5, 5.5, 3));
  A.part({shape: S.not(tunic(true, .5), collarHole), mat: 's', z: 10, bevel: 2.5, h: H.sum(H.cylX(24, 22, 10), H.cylY(36, 34, 3)), pat: 'grain', metal: false});
  for (const sd of [-1, 1]) A.part({shape: S.poly([[24 + sd * 1, 10], [24 + sd * 11, 10], [24 + sd * 13, 38], [24 + sd * 12.5, 62], [24 + sd * 1, 62]]), mat: 's', z: 11, bevel: 1.5, h: H.cylX(24 + sd * 6, 9, 3), metal: false, bias: sd > 0 ? -.05 : 0});
  for (let y = 14; y < 61; y += 5) for (const x of [15.5, 19.5, 28.5, 32.5]) if ((y - 18) % 12 > 3.5) A.rivet(x, y, 'p');
  for (let y = 18; y < 60; y += 12) { A.part({shape: S.rrect(17, y, 31, y + 3, 1), mat: 's', z: 14, bevel: 1, bias: -.15, metal: false}); A.part({shape: S.rrect(22, y - .5, 26, y + 3.5, .8), mat: 'p', z: 15, bevel: 1, h: H.dome(23, y, 3, 3, 1)}) }
  A.part({shape: S.not(S.ell(24, 6.5, 8.5, 5), collarHole), mat: 'p', z: 12, bevel: 1.2, h: H.dome(24, 6, 8.5, 5, 2)});
});
// leather jerkin (48×48): stitched panels, laced front, a collar
def('jerkin', 48, 48, (A, o = {}) => {
  hole(A, S.ell(24, 6.5, 5.5, 3));
  A.part({shape: S.not(tunic(false, .8), collarHole), mat: 'p', z: 10, bevel: 2.5, h: H.sum(H.cylX(24, 22, 9), H.cylY(26, 24, 2)), pat: o.quilt ? 'quilt' : 'grain', bias: .03, metal: o.quilt ? false : undefined});
  if (!o.quilt) for (const sd of [-1, 1]) { A.line(24 + sd * 9, 12, 24 + sd * 10, 42, 'p', 1); for (let y = 14; y < 42; y += 3) A.dot(24 + sd * 8, y, 'p', 3) }
  A.line(24, 9, 24, 42, 'p', 0);
  for (let y = 11; y < 30; y += 4) { A.line(22.5, y, 25.5, y + 2, 's', 3); A.line(25.5, y, 22.5, y + 2, 's', 2) }
  A.part({shape: S.not(S.ell(24, 6.5, 8.5, 5), collarHole), mat: 's', z: 12, bevel: 1.2, h: H.dome(24, 6, 8.5, 5, 2)});
  A.part({shape: S.rrect(11.5, 32, 36.5, 36, 1.5), mat: 's', z: 14, bevel: 1.2, h: H.cylX(24, 13, 4), metal: false, bias: -.08});
  A.part({shape: S.rrect(21.5, 31, 26.5, 37, 1), mat: 'gold', z: 15, bevel: 1, h: H.dome(23, 32, 3, 3, 2)});
});

// ---------- gloves (48×48): a pair, the left one a step behind ----------
function glove(A, ox, oy, sd, o, zb, dim) {
  const X = x => ox + sd * x, Y = y => oy + y, bias = dim ? -.1 : 0, plate = o.kind === 'plate' || o.kind === 'mitten', hand = o.kind === 'mail' ? 'mail' : o.kind === 'scale' ? 'scale' : null;
  // cuff, flaring to the wrist
  A.part({shape: S.poly([[X(-7.5), Y(44)], [X(7.5), Y(44)], [X(6.2), Y(31)], [X(-6.2), Y(31)]]), mat: o.cuff || 's', z: zb + 1, bevel: 1.5, h: H.cylX(ox, 8, 4), bias, metal: o.kind === 'leather' || o.kind === 'claw' ? false : undefined, pat: o.kind === 'leather' ? 'grain' : null});
  A.part({shape: S.rrect(ox - 8, Y(40.5), ox + 8, Y(44.5), 1.5), mat: o.cuff || 's', z: zb + 2, bevel: 1, h: H.cylX(ox, 9, 3), bias: bias - .08, metal: o.kind === 'leather' || o.kind === 'claw' ? false : undefined});
  // back of the hand
  A.part({shape: S.rrect(ox - 6.5, Y(15), ox + 6.5, Y(33), 4), mat: 'p', z: zb + 3, bevel: 2, h: H.sum(H.cylX(ox, 7, 4), H.cylY(Y(22), 12, 2)), bias, pat: hand});
  if (plate) for (let i = 0; i < 3; i++) A.part({shape: S.rrect(ox - 6.5, Y(21 + i * 3.6), ox + 6.5, Y(25.5 + i * 3.6), 2), mat: 'p', z: zb + 4 + (3 - i), bevel: 1.2, h: H.cylX(ox, 7, 3), bias: bias - i * .03});
  // thumb, from the inner side
  A.part({shape: S.tube([[X(-4), Y(29)], [X(-8.5), Y(24)], [X(-10), Y(18.5)]], 2.5, 2), mat: 'p', z: zb + 8, bevel: 1.3, h: H.sum(), bias: bias - .04, pat: hand});
  // fingers: four, or one plate for a mitten
  if (o.kind === 'mitten') A.part({shape: S.rrect(ox - 6.5, Y(5), ox + 6.5, Y(18), 4), mat: 'p', z: zb + 2, bevel: 1.5, h: H.cylX(ox, 7, 4), bias, pat: 'lame'});
  else for (let f = 0; f < 4; f++) { const fx = X(-4.6 + f * 3.1), top = Y([10, 5, 6, 8][f]), lean = (f - 1.5) * .7 * sd;
    A.part({shape: S.tube([[fx, Y(18)], [fx + lean, top]], 1.6, 1.4), mat: 'p', z: zb + 2, bevel: 1.1, h: H.sum(), bias: bias - (f % 2) * .03, pat: hand === 'mail' ? 'mailfine' : null});
    if (plate) for (let y = top + 3; y < Y(17); y += 3.5) A.line(fx + lean * .5 - 1, y, fx + lean * .5 + 1, y, 'p', 1);
    if (o.claw) A.part({shape: S.poly([[fx + lean - 1.4, top + 1], [fx + lean + 1.4, top + 1], [fx + lean * 2 + sd * .5, top - 4]]), mat: 's', z: zb + 2.5, bevel: .8, h: H.sum(), metal: false});
  }
  if (o.knuckle) for (let f = 0; f < 4; f++) A.part({shape: S.ell(X(-4.6 + f * 3.1), Y(17), 1.7, 1.6), mat: 's', z: zb + 9, bevel: 1, h: H.dome(X(-4.6 + f * 3.1) - .5, Y(16.5), 1.7, 1.6, 1.5)});
  if (o.kind === 'leather') A.line(ox - 5, Y(30.5), ox + 5, Y(30.5), 'p', 1);
  if (plate) A.rivet(X(4.5), Y(23), 's');
}
def('gloves', 48, 48, (A, o = {}) => { o = {...o, kind: o.kind || ['mail', 'plate', 'mitten', 'scale', 'claw'].find(k => o[k]) || 'leather'}; glove(A, 16, 0, 1, o, 0, true); glove(A, 31, 3, 1, o, 20, false) });

// ---------- boots (48×48): a pair from the side, toes to the left ----------
function boot(A, ox, oy, o, zb, dim) {
  const bias = dim ? -.1 : 0, X = x => ox + x, Y = y => oy + y, lea = !o.kind || o.kind === 'leather';
  A.part({shape: S.poly([[X(0), Y(0)], [X(12), Y(0)], [X(12.5), Y(26)], [X(14), Y(31)], [X(13.5), Y(34)], [X(-12), Y(34)], [X(-13), Y(31)], [X(-11), Y(27)], [X(-3), Y(24)], [X(-.5), Y(20)]]),
    mat: 'p', z: zb + 1, bevel: 2, h: H.sum(H.cylX(X(6), 9, 5), H.cylY(Y(28), 6, 1)), bias, pat: o.kind === 'mail' ? 'mail' : lea ? 'grain' : null, metal: lea ? false : undefined});
  // sole and heel
  A.part({shape: S.rrect(X(-13), Y(32), X(14), Y(35.5), 1.2), mat: o.sole || 's', z: zb + 3, bevel: 1, bias: bias - .15, metal: false});
  // cuff at the top
  A.part({shape: S.rrect(X(-1.5), Y(-1), X(13.5), Y(5), 2), mat: o.top || 's', z: zb + 4, bevel: 1.3, h: H.cylX(X(6), 8, 3), bias, metal: o.top ? undefined : false});
  if (o.kind === 'plate') {   // sabaton lames over the foot, a greave up the shin, a cop at the knee
    for (let i = 0; i < 4; i++) A.part({shape: S.poly([[X(-12 + i * 2.6), Y(33)], [X(-9 + i * 2.6), Y(26 - i * .5)], [X(-5.5 + i * 2.6), Y(25 - i * .5)], [X(-5.8 + i * 2.6), Y(33)]]), mat: 'p', z: zb + 6 + i, bevel: 1, h: H.cylY(Y(29), 5, 2), bias: bias - i * .02});
    A.part({shape: S.rrect(X(.5), Y(4), X(11.5), Y(26), 3), mat: 'p', z: zb + 5, bevel: 1.6, h: H.cylX(X(5), 7, 5), bias});
    A.line(X(3), Y(7), X(3), Y(23), 'p', 4); A.dot(X(3), Y(9), 'p', 5);
  }
  if (o.splint) for (let i = 0; i < 3; i++) A.part({shape: S.rrect(X(1.5 + i * 3.4), Y(5), X(4.2 + i * 3.4), Y(24), 1), mat: 's', z: zb + 5, bevel: 1, h: H.cylX(X(2.8 + i * 3.4), 1.5, 1), bias: bias - i * .04});
  if (o.knee) { A.part({shape: S.ell(X(6), Y(5), 5.5, 4.2), mat: 'p', z: zb + 7, bevel: 1.4, h: H.dome(X(5), Y(4), 5.5, 4.2, 3), bias}); A.part({shape: S.poly([[X(1), Y(4)], [X(-2), Y(8)], [X(2), Y(7)]]), mat: 'p', z: zb + 6.5, bevel: .8, bias: bias - .05}); A.rivet(X(6), Y(5), 's') }
  if (o.toe) A.part({shape: S.poly([[X(-13), Y(33)], [X(-11), Y(27)], [X(-5), Y(25.5)], [X(-5), Y(33)]]), mat: 's', z: zb + 6, bevel: 1, h: H.cylY(Y(29), 5, 2), bias});
  if (lea) { for (let y = 8; y < 22; y += 3) A.line(X(1.5), Y(y), X(4), Y(y + 1), 's', 3); A.line(X(-10), Y(30.5), X(12), Y(30.5), 'p', 1) }
  if (o.gem) A.gem(X(6), Y(12), 2.2);
}
def('boots', 48, 48, (A, o = {}) => { o = {...o, kind: o.kind || ['mail', 'plate'].find(k => o[k]) || 'leather'}; boot(A, 26, 6, o, 0, true); boot(A, 20, 11, o, 20, false) });

// ---------- belts (48×24) ----------
def('belt', 48, 24, (A, o = {}) => {
  const strap = S.poly([[2, 7], [24, 9.5], [46, 7], [46, 15], [24, 17.5], [2, 15]]);
  if (o.hang) for (const sd of [-1, 1]) A.part({shape: S.rrect(24 + sd * 11 - 5, 14, 24 + sd * 11 + 5, 23, 2), mat: o.hang, z: 2, bevel: 1.4, h: H.cylX(24 + sd * 11, 5, 2), bias: -.05, pat: o.hangPat});
  if (o.sword) A.part({shape: S.tube([[34, 13], [42, 22]], 2, 1.6), mat: 's', z: 3, bevel: 1, h: H.sum()});
  A.part({shape: strap, mat: 'p', z: 10, bevel: 1.5, h: H.cylY(12, 5, 2), pat: o.chain ? 'mail' : o.plates ? null : 'grain', metal: o.chain || o.plates ? undefined : false});
  if (o.plates) for (let i = 0; i < 6; i++) { const x = 3 + i * 7.3 + (i > 2 ? 4 : 0); if (x > 40) break; A.part({shape: S.rrect(x, 7.5 + Math.abs(x + 3 - 24) * -.1 + 1, x + 6.4, 16.5 - Math.abs(x + 3 - 24) * .1 + .5, 1.3), mat: 'p', z: 11, bevel: 1.2, h: H.dome(x + 2.5, 10, 4, 5, 2)}); A.rivet(x + 3.2, 12, 's') }
  if (!o.plates && !o.chain) { A.line(3, 8.6, 21, 10.6, 'p', 3); A.line(27, 10.6, 45, 8.6, 'p', 3); A.line(3, 13.6, 21, 15.6, 'p', 1); A.line(27, 15.6, 45, 13.6, 'p', 1) }
  // buckle
  A.part({shape: S.rrect(18.5, 6, 29.5, 20, 2.5), mat: 's', z: 20, bevel: 1.2, h: H.dome(23, 11, 7, 8, 3)});
  hole(A, S.rrect(21, 9, 27, 17, 1.2), 21);
  A.part({shape: S.rect(23.5, 9, 25, 17), mat: 's', z: 22, bevel: .6});
  if (o.gem) A.gem(24, 13, 2.2);
  if (o.studs) for (const x of [8, 14, 34, 40]) A.rivet(x, 12, 's');
});
def('sash', 48, 24, (A) => {
  A.part({shape: S.poly([[2, 6], [24, 9], [46, 6], [46, 15], [24, 18], [2, 15]]), mat: 'p', z: 10, bevel: 2, h: H.cylY(12, 6, 3), pat: 'weave', metal: false});
  for (const [x0, x1] of [[23, 15], [25, 31]]) A.part({shape: S.tube([[24, 14], [(x0 + x1) / 2, 18.5], [x1, 23]], 2.4, 1.8), mat: 'p', z: 12, bevel: 1.2, h: H.sum(), metal: false, bias: x1 > 24 ? -.08 : 0});
  A.part({shape: S.ell(24, 12.5, 4.5, 4), mat: 's', z: 14, bevel: 1.4, h: H.dome(23, 11.5, 4.5, 4, 3)});
  for (const x of [8, 40]) A.line(x, 7.5, x, 14.5, 's', 3);
});

// ---------- shields ----------
// round: planks under an iron rim, a domed boss
def('round', 48, 48, (A) => {
  const disc = S.ell(24, 24, 22, 22);
  A.part({shape: disc, mat: 'p', z: 10, bevel: 2, h: H.dome(24, 24, 22, 22, 6), pat: 'grain', metal: false});
  for (const x of [13, 19.5, 28.5, 35]) A.line(x, 3, x, 45, 'p', 0);
  A.part({shape: S.not(disc, S.ell(24, 24, 19.5, 19.5)), mat: 's', z: 12, bevel: 1.3, h: H.dome(24, 24, 22, 22, 6)});
  A.part({shape: S.ell(24, 24, 6.5, 6.5), mat: 's', z: 14, bevel: 2, h: H.dome(22.5, 22.5, 6.5, 6.5, 5)});
  for (let k = 0; k < 8; k++) A.rivet(24 + Math.cos(k * Math.PI / 4) * 20.6, 24 + Math.sin(k * Math.PI / 4) * 20.6, 's');
});
// tower shield (48×72): tall, curved, iron with a raised cross
def('tower', 48, 72, (A) => {
  A.part({shape: S.rrect(6, 3, 42, 69, 4), mat: 'p', z: 10, bevel: 2, h: H.cylX(24, 18, 9), spec: .985});
  A.part({shape: S.not(S.rrect(6, 3, 42, 69, 4), S.rrect(9, 6, 39, 66, 2.5)), mat: 's', z: 11, bevel: 1.3, h: H.cylX(24, 18, 9)});
  A.part({shape: S.or(S.rrect(21, 10, 27, 61, 1.5), S.rrect(12, 25, 36, 31, 1.5)), mat: 's', z: 13, bevel: 1.5, h: H.cylX(24, 18, 9)});
  A.streak(14, 8, 14, 64);
  for (let y = 8; y < 68; y += 8) { A.rivet(7.5, y, 's'); A.rivet(40.5, y, 's') }
  A.gem(24, 28, 2.4);
});
// heater (48×72): a painted field split in quarters inside a gold rim
def('heater', 48, 72, (A) => {
  const sh = S.poly([[5, 4], [43, 4], [43, 30], [39, 46], [32, 58], [24, 68], [16, 58], [9, 46], [5, 30]]), inner = S.poly([[8, 7], [40, 7], [40, 30], [36.5, 45], [30, 56], [24, 64], [18, 56], [11.5, 45], [8, 30]]);
  A.part({shape: S.and(inner, S.or(S.and(S.rect(0, 0, 24, 32)), S.and(S.rect(24, 32, 48, 72)))), mat: 'p', z: 10, bevel: 1, h: H.cylX(24, 20, 7), metal: false, pat: 'weave'});
  A.part({shape: S.and(inner, S.or(S.rect(24, 0, 48, 32), S.rect(0, 32, 24, 72))), mat: 't', z: 10, bevel: 1, h: H.cylX(24, 20, 7), pat: 'grain', metal: false});
  A.part({shape: S.not(sh, inner), mat: 's', z: 12, bevel: 1.4, h: H.cylX(24, 20, 7)});
  A.part({shape: S.or(S.rrect(22.5, 6, 25.5, 62, 1), S.rrect(7, 30.5, 41, 33.5, 1)), mat: 's', z: 12, bevel: 1, h: H.cylX(24, 20, 7), bias: -.05});
  A.gem(24, 32, 3.2);
});
// gravestone (48×96): a slab of stone with a carved cross and a crack, moss at its foot
def('grave', 48, 96, (A, o = {}) => {
  const slab = S.or(S.rect(6, 22, 42, 92), S.ell(24, 22, 18, 18));
  A.part({shape: slab, mat: 'p', z: 10, bevel: 2.5, h: H.cylX(24, 18, 5), metal: o.dragon ? undefined : false, pat: o.dragon ? 'scale' : 'grain'});
  A.part({shape: S.not(slab, S.or(S.rect(9, 22, 39, 89), S.ell(24, 22, 15, 15))), mat: 's', z: 11, bevel: 1.2, h: H.cylX(24, 18, 5), metal: o.dragon ? undefined : false});
  if (o.dragon) { A.part({shape: S.poly([[24, 24], [33, 44], [24, 70], [15, 44]]), mat: 't', z: 13, bevel: 1.5, h: H.sum(H.ridgeX(24, 9, 4), H.cylY(46, 24, 2))}); A.gem(24, 44, 4) }
  else { hole(A, S.or(S.rect(22.5, 20, 25.5, 60), S.rect(14, 29, 34, 32)), 13); A.line(31, 62, 34, 70, 'p', 0); A.line(34, 70, 32, 78, 'p', 0);
    A.part({shape: S.and(slab, S.poly([[6, 92], [6, 84], [12, 86], [18, 82], [24, 87], [30, 84], [36, 86], [42, 83], [42, 92]])), mat: 'moss', z: 14, bevel: 1, metal: false, pat: 'weave'}) }
});
