// grinder-logic.jsx — pure data + scoring helpers (no UI)
// Exposed on window for the other babel scripts.

/* ════════════════════════════════════════════════════════════
   SUPABASE SCHEMA (suggested) — the JS round object below maps
   1:1 so wiring this up later is a thin layer.

   table courses
     id           uuid pk default gen_random_uuid()
     name         text not null
     location     text
     pars         int[]            -- 18 entries, hole 1..18
     created_at   timestamptz default now()

   table rounds
     id           uuid pk default gen_random_uuid()
     user_id      uuid references auth.users
     course_id    uuid references courses(id)   -- null if custom
     course_name  text not null                 -- denormalised label
     holes        int  not null                 -- 3 | 6 | 9 | 18
     pars         int[] not null
     mode_par     bool default false            -- show vs-par
     mode_stbl    bool default false            -- stableford on
     status       text default 'live'           -- 'live' | 'done'
     started_at   timestamptz default now()
     finished_at  timestamptz

   table players          -- players within a round
     id           uuid pk default gen_random_uuid()
     round_id     uuid references rounds(id) on delete cascade
     name         text not null
     seat         int                            -- order 0..n

   table scores
     id           uuid pk default gen_random_uuid()
     round_id     uuid references rounds(id) on delete cascade
     player_id    uuid references players(id) on delete cascade
     hole         int not null                   -- 1..18
     strokes      int                            -- null = not played
     unique (player_id, hole)

   RLS: every table filtered on user_id = auth.uid().
   ════════════════════════════════════════════════════════════ */

// ── Course presets ───────────────────────────────────────────
const PAR_TEMPLATE = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5];

const COURSES = [
  { id: 'eichenhof', name: 'Eichenhof GC',     location: 'Hügelland',   pars: [4,4,3,5,4,3,4,5,4, 4,3,5,4,4,3,4,5,4] },
  { id: 'seeblick',  name: 'Seeblick Links',   location: 'am See',      pars: [4,5,4,3,4,4,5,3,4, 5,4,3,4,5,4,3,4,4] },
  { id: 'tannenpark',name: 'Tannenpark',       location: 'Waldrand',    pars: [3,4,4,5,4,3,4,4,5, 4,4,3,5,4,3,4,4,5] },
  { id: 'heidehof',  name: 'Heidehof Resort',  location: 'Heide',       pars: [5,4,4,3,5,4,3,4,4, 4,5,3,4,4,4,3,5,4] },
];

// ── Build the par list for the chosen number of holes ────────
function buildPars(course, holes) {
  const base = (course && course.pars) ? course.pars : PAR_TEMPLATE;
  const out = [];
  for (let i = 0; i < holes; i++) out.push(base[i % base.length]);
  return out;
}

// ── Stableford (gross, no handicap) ──────────────────────────
// 2 pts at par, +1 per stroke under, -1 per stroke over, floored at 0.
function stableford(strokes, par) {
  if (strokes == null) return 0;
  return Math.max(0, 2 - (strokes - par));
}

// ── Per-player totals across played holes ────────────────────
function totals(scores, pars) {
  let strokes = 0, parPlayed = 0, stbl = 0, played = 0;
  for (let h = 0; h < pars.length; h++) {
    const s = scores[h];
    if (s == null) continue;
    strokes += s;
    parPlayed += pars[h];
    stbl += stableford(s, pars[h]);
    played += 1;
  }
  return { strokes, parPlayed, stbl, played, toPar: strokes - parPlayed };
}

// ── Formatting ───────────────────────────────────────────────
function fmtToPar(n) {
  if (n === 0) return 'E';
  return n > 0 ? `+${n}` : `${n}`;
}

// name of a score relative to par (for the live chip)
function scoreName(strokes, par) {
  if (strokes == null) return null;
  const d = strokes - par;
  if (strokes === 1) return 'Hole-in-One';
  if (d <= -3) return 'Albatross';
  if (d === -2) return 'Eagle';
  if (d === -1) return 'Birdie';
  if (d === 0) return 'Par';
  if (d === 1) return 'Bogey';
  if (d === 2) return 'Double';
  return `+${d}`;
}

// colour token for a score pill
function scoreTone(strokes, par) {
  if (strokes == null) return 'none';
  const d = strokes - par;
  if (d < 0) return 'under';
  if (d === 0) return 'par';
  return 'over';
}

// ── Local persistence (stand-in for Supabase) ────────────────
const LS_HISTORY = 'gg_history_v1';
const LS_LIVE = 'gg_live_v1';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); }
  catch (e) { return []; }
}
function saveHistory(arr) {
  try { localStorage.setItem(LS_HISTORY, JSON.stringify(arr)); } catch (e) {}
}
function pushHistory(round) {
  const arr = loadHistory();
  arr.unshift(round);
  saveHistory(arr.slice(0, 50));
}
function loadLive() {
  try { return JSON.parse(localStorage.getItem(LS_LIVE) || 'null'); }
  catch (e) { return null; }
}
function saveLive(round) {
  try {
    if (round) localStorage.setItem(LS_LIVE, JSON.stringify(round));
    else localStorage.removeItem(LS_LIVE);
  } catch (e) {}
}

function uid() { return Math.random().toString(36).slice(2, 10); }

function relTime(ts) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return 'gerade eben';
  if (d < 3600) return `vor ${Math.floor(d/60)} Min`;
  if (d < 86400) return `vor ${Math.floor(d/3600)} Std`;
  const days = Math.floor(d / 86400);
  if (days === 1) return 'gestern';
  if (days < 7) return `vor ${days} Tagen`;
  return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
}

Object.assign(window, {
  COURSES, PAR_TEMPLATE, buildPars, stableford, totals,
  fmtToPar, scoreName, scoreTone,
  loadHistory, saveHistory, pushHistory, loadLive, saveLive, uid, relTime,
});
