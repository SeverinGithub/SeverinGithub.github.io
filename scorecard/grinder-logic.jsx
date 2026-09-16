// grinder-logic.jsx — pure data + scoring helpers (no UI)
// Exposed on window for the other babel scripts.

/* ════════════════════════════════════════════════════════════
   SUPABASE SCHEMA (suggested) — the JS objects below map 1:1
   so wiring this up later is a thin layer.

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
     mode_track   text default 'simple'         -- 'simple' | 'advanced'
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

   table clubs            -- user's bag inventory
     id                 uuid pk default gen_random_uuid()
     user_id            uuid references auth.users
     name               text not null            -- '7-Eisen', 'Stealth Driver'
     category           text not null            -- 'driver'|'wood'|'hybrid'|'iron'|'wedge'|'putter'
     loft               numeric                  -- degrees, optional
     seat               int                      -- display order in bag
     seeded_distance_m  numeric                  -- onboarding estimate, m
     seeded_dispersion  text                     -- 'tight'|'medium'|'wide'
     created_at         timestamptz default now()
     retired_at         timestamptz              -- null = still in bag

   table shots           -- per-shot data for advanced tracking
     id                 uuid pk default gen_random_uuid()
     round_id           uuid references rounds(id) on delete cascade
     player_id          uuid references players(id) on delete cascade
     club_id            uuid references clubs(id)
     hole               int not null             -- 1..N
     seq                int not null             -- shot index within the hole, 0..k
     lie                text                     -- 'tee'|'fairway'|'rough'|'bunker'|'green'|'hazard'
     start_lat          numeric                  -- ball position before this shot
     start_lng          numeric
     end_lat            numeric                  -- ball position after this shot
     end_lng            numeric
     target_lat         numeric                  -- intended target (optional)
     target_lng         numeric
     distance_m         numeric                  -- measured from map, or entered
     lateral_offset_m   numeric                  -- signed L(-)/R(+) offset vs start→target line
     penalty            int  default 0
     holed              bool default false
     created_at         timestamptz default now()
     unique (player_id, hole, seq)

   RLS: every table filtered on user_id = auth.uid()
        (shots + scores via join to rounds/players).
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

// ── Storage abstraction (swap this for Supabase later) ───────
// Every persistence call goes through `storage` so the Supabase
// migration is scoped to one file: replace these three methods
// with `supabase.from(...).select/insert/upsert/delete`.
const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  },
  remove(key) { try { localStorage.removeItem(key); } catch (e) {} },
};

// ── Storage keys (versioned) ─────────────────────────────────
const LS_HISTORY = 'gg_history_v1';
const LS_LIVE    = 'gg_live_v1';
const LS_CLUBS   = 'gg_clubs_v1';
const LS_MODE    = 'gg_mode_v1';   // default track mode: 'simple' | 'advanced'

// ── Rounds: history + live ───────────────────────────────────
function loadHistory()      { return storage.get(LS_HISTORY, []); }
function saveHistory(arr)   { storage.set(LS_HISTORY, arr); }
function pushHistory(round) { saveHistory([round, ...loadHistory()].slice(0, 50)); }
function loadLive()         { return storage.get(LS_LIVE, null); }
function saveLive(round)    { round ? storage.set(LS_LIVE, round) : storage.remove(LS_LIVE); }

// ── Track mode (default for new rounds) ──────────────────────
// Individual rounds carry their own `modeTrack`; this is only the
// user-preferred default surfaced in Setup.
function loadTrackMode()  { return storage.get(LS_MODE, 'simple'); }
function saveTrackMode(m) { storage.set(LS_MODE, m === 'advanced' ? 'advanced' : 'simple'); }

// ── Clubs (bag inventory) ────────────────────────────────────
// Categories drive grouping in the inventory + analytics.
const CLUB_CATEGORIES = [
  { id: 'driver', label: 'Driver' },
  { id: 'wood',   label: 'Fairwayholz' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'iron',   label: 'Eisen' },
  { id: 'wedge',  label: 'Wedge' },
  { id: 'putter', label: 'Putter' },
];

// Rough dispersion presets — mapped to lateral metres one-sigma-ish.
// User picks one at onboarding; refined once we have real shot data.
const DISPERSION_PRESETS = {
  tight:  { label: 'Eng',    lateralM:  8 },
  medium: { label: 'Mittel', lateralM: 15 },
  wide:   { label: 'Weit',   lateralM: 25 },
};

// Sensible starter bag for a mid-handicap right-hander.
// Distances are CARRY metres — the user adjusts each at onboarding.
const DEFAULT_BAG = [
  { name: 'Driver',   category: 'driver', loft: 10.5, seededDistance: 210, seededDispersion: 'wide'   },
  { name: '3-Holz',   category: 'wood',   loft: 15,   seededDistance: 190, seededDispersion: 'medium' },
  { name: '5-Holz',   category: 'wood',   loft: 18,   seededDistance: 175, seededDispersion: 'medium' },
  { name: '4-Hybrid', category: 'hybrid', loft: 22,   seededDistance: 165, seededDispersion: 'medium' },
  { name: '5-Eisen',  category: 'iron',   loft: 25,   seededDistance: 155, seededDispersion: 'medium' },
  { name: '6-Eisen',  category: 'iron',   loft: 28,   seededDistance: 145, seededDispersion: 'medium' },
  { name: '7-Eisen',  category: 'iron',   loft: 32,   seededDistance: 135, seededDispersion: 'medium' },
  { name: '8-Eisen',  category: 'iron',   loft: 36,   seededDistance: 125, seededDispersion: 'medium' },
  { name: '9-Eisen',  category: 'iron',   loft: 40,   seededDistance: 115, seededDispersion: 'tight'  },
  { name: 'PW',       category: 'wedge',  loft: 44,   seededDistance: 100, seededDispersion: 'tight'  },
  { name: 'GW',       category: 'wedge',  loft: 50,   seededDistance:  85, seededDispersion: 'tight'  },
  { name: 'SW',       category: 'wedge',  loft: 56,   seededDistance:  70, seededDispersion: 'tight'  },
  { name: 'LW',       category: 'wedge',  loft: 60,   seededDistance:  55, seededDispersion: 'tight'  },
  { name: 'Putter',   category: 'putter', loft:  3,   seededDistance: null, seededDispersion: null    },
];

// loadClubs() returns null when the user has not onboarded yet
// (so callers can distinguish "empty bag on purpose" from "never set up").
function loadClubs()      { return storage.get(LS_CLUBS, null); }
function saveClubs(clubs) { storage.set(LS_CLUBS, clubs); }
function buildDefaultBag() {
  return DEFAULT_BAG.map((c, i) => ({
    id: uid(), seat: i, createdAt: Date.now(), retiredAt: null, ...c,
  }));
}
function findClub(clubs, id) {
  return (clubs || []).find(c => c.id === id) || null;
}
function activeClubs(clubs) {
  return (clubs || []).filter(c => !c.retiredAt)
    .sort((a, b) => (a.seat ?? 0) - (b.seat ?? 0));
}

// ── Shots (per round) ────────────────────────────────────────
// Shot shape:
//   { id, playerId, hole (1..N), seq (0..k), clubId,
//     lie: 'tee'|'fairway'|'rough'|'bunker'|'green'|'hazard',
//     start:  {lat,lng}|null,        // ball position before this shot
//     end:    {lat,lng}|null,        // ball position after this shot
//     target: {lat,lng}|null,        // intended target (optional)
//     distanceM,                     // measured (map) or entered
//     lateralOffsetM,                // signed L(-)/R(+) vs start→target
//     penalty: 0|1|2,
//     holed: bool,
//     ts }
// Rounds without a `shots` array behave exactly like today (Simple mode).
function ensureShotsArray(round) {
  if (round && !round.shots) round.shots = [];
  return round;
}
function shotsFor(round, playerId, hole /* optional 1..N */) {
  if (!round || !round.shots) return [];
  return round.shots.filter(s =>
    s.playerId === playerId && (hole == null || s.hole === hole)
  );
}
function nextShotSeq(round, playerId, hole) {
  return shotsFor(round, playerId, hole).length;
}
function addShot(round, shot) {
  ensureShotsArray(round);
  const seq = shot.seq ?? nextShotSeq(round, shot.playerId, shot.hole);
  round.shots.push({ id: uid(), ts: Date.now(), seq, ...shot });
  return round;
}
function updateShot(round, shotId, patch) {
  if (!round || !round.shots) return round;
  round.shots = round.shots.map(s => s.id === shotId ? { ...s, ...patch } : s);
  return round;
}
function removeShot(round, shotId) {
  if (!round || !round.shots) return round;
  round.shots = round.shots.filter(s => s.id !== shotId);
  return round;
}

// In advanced mode, shots.length is the source of truth for that
// player+hole. Call this after every shot mutation so the existing
// scorecard/summary continue to work unchanged.
function syncScoreFromShots(round, playerId, hole /* 1..N */) {
  if (!round || !round.scores || !round.scores[playerId]) return round;
  const holeIdx = hole - 1;
  const n = shotsFor(round, playerId, hole).length;
  const nextScores = round.scores[playerId].slice();
  nextScores[holeIdx] = n > 0 ? n : null;
  round.scores = { ...round.scores, [playerId]: nextScores };
  return round;
}

// ── Club stats — Bayesian-ish blend of seed + measurements ───
// The seed acts like SEED_WEIGHT prior shots. After ~20 real shots
// the measured average dominates; before that the seed still speaks.
const SEED_WEIGHT = 5;

// clubStats(club, allRounds) → { distanceM, sampleN, confidence, measuredAvg }
// - distanceM: blended estimate to display in the inventory
// - sampleN:   count of real shots with a numeric distance
// - confidence: 0..1 (how much the measured data drives the estimate)
function clubStats(club, allRounds) {
  if (!club) return { distanceM: null, sampleN: 0, confidence: 0, measuredAvg: null };
  const distances = [];
  for (const r of allRounds || []) {
    if (!r || !r.shots) continue;
    for (const s of r.shots) {
      if (s.clubId === club.id && typeof s.distanceM === 'number' && s.distanceM > 0) {
        distances.push(s.distanceM);
      }
    }
  }
  const n = distances.length;
  const measuredAvg = n > 0 ? distances.reduce((a, b) => a + b, 0) / n : null;
  const seed = typeof club.seededDistance === 'number' ? club.seededDistance : null;
  if (seed == null && n === 0) return { distanceM: null, sampleN: 0, confidence: 0, measuredAvg: null };
  if (seed == null)            return { distanceM: measuredAvg, sampleN: n, confidence: Math.min(1, n / 20), measuredAvg };
  if (n === 0)                 return { distanceM: seed, sampleN: 0, confidence: 0, measuredAvg: null };
  const blended = (SEED_WEIGHT * seed + n * measuredAvg) / (SEED_WEIGHT + n);
  return { distanceM: blended, sampleN: n, confidence: n / (SEED_WEIGHT + n), measuredAvg };
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
  // scoring + course
  COURSES, PAR_TEMPLATE, buildPars, stableford, totals,
  fmtToPar, scoreName, scoreTone,
  // storage layer + rounds
  storage,
  loadHistory, saveHistory, pushHistory, loadLive, saveLive,
  loadTrackMode, saveTrackMode,
  // clubs
  CLUB_CATEGORIES, DISPERSION_PRESETS, DEFAULT_BAG,
  loadClubs, saveClubs, buildDefaultBag, findClub, activeClubs,
  // shots
  ensureShotsArray, shotsFor, nextShotSeq, addShot, updateShot, removeShot, syncScoreFromShots,
  // stats
  clubStats, SEED_WEIGHT,
  // misc
  uid, relTime,
});
