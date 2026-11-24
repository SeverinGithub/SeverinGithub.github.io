/* Severin Organizer – drei Seiten: Jobs (links), Übersicht (Mitte), To-dos (rechts).
   Alle Daten liegen im localStorage unter STORE_KEY. Oberfläche nach Apple-Vorbild. */
'use strict';

const STORE_KEY = 'severin-organizer-v1';
const MAX_JOBS = 3;
const COLORS = ['blue', 'green', 'orange', 'red', 'purple', 'teal', 'pink', 'indigo'];
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const HOUR_CHIPS = [2, 3, 4, 5, 6, 8];

/* Stundenplan der Schule (Stand 30.11.2026), wiederholt sich wöchentlich. day: 1 = Montag … 5 = Freitag */
const SCHOOL_SEED = [
  [1, '09:55', '11:25', 'D', 'rad', 'F108'],
  [1, '11:45', '13:15', 'M+T', 'bru', 'F108'],
  [1, '13:15', '14:00', 'Ph', 'her', 'F108'],
  [1, '14:45', '16:15', 'E', 'sue', 'F108'],
  [2, '08:05', '09:35', 'IBS2', 'doe', 'G108', 'bg12a, bt12a, bw12a, fg12a … +11'],
  [2, '09:55', '11:25', 'M', 'kar', 'F108'],
  [2, '11:45', '13:15', 'E', 'sue', 'F108'],
  [2, '13:15', '14:00', 'Te', 'her', 'F108'],
  [2, '14:45', '16:15', 'Smw', 'heb', 'Sport 3'],
  [3, '09:55', '11:25', 'D', 'rad', 'F108'],
  [3, '11:45', '13:15', 'Te', 'her', 'F108'],
  [3, '14:00', '15:30', 'PuG', 'wae', 'F108'],
  [4, '08:05', '09:35', 'K', 'lod', 'F112'],
  [4, '09:55', '11:25', 'Ph', 'her', 'F108'],
  [4, '11:45', '13:15', 'C', 'khl', 'F112'],
  [5, '08:05', '09:35', 'M', 'kar', 'F108'],
  [5, '09:55', '11:25', 'Ph', 'her', 'F108'],
  [5, '11:45', '13:15', 'Inf1', 'mos', 'F009', 'bt12a, ft12a, ft12c'],
].map(([day, start, end, subject, teacher, room, note = ''], i) => ({ id: 'l' + (i + 1), day, start, end, subject, teacher, room, note }));

/* Stundenraster als Schnellwahl im Formular */
const SLOTS = [['1.–2.', '08:05', '09:35'], ['3.–4.', '09:55', '11:25'], ['5.–6.', '11:45', '13:15'], ['7.', '13:15', '14:00'],
  ['8.', '14:00', '14:45'], ['8.–9.', '14:00', '15:30'], ['9.–10.', '14:45', '16:15']];

/* ---------- Daten ---------- */

const defaults = () => ({
  school: { lessons: SCHOOL_SEED.map(l => ({ ...l })), holidays: [], validFrom: '', validTo: '' },
  jobs: [],      // {id, name, color, rate}
  shifts: [],    // {id, jobId, date:'YYYY-MM-DD', hours, rate, note}
  accounts: [],  // {id, name, balance, updated}
  todos: [],     // {id, text, done, date|null, created}
  notes: [],     // {id, text, created, updated}
  settings: { minijobLimit: 603 },
});

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaults();
    return Object.assign(defaults(), JSON.parse(raw));
  } catch (e) {
    return defaults();
  }
}
let db = load();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch (e) { /* voll oder gesperrt */ }
}

/* ---------- Hilfen ---------- */

const $ = (s, r = document) => r.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = parseFloat(String(v ?? '').replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const eur = n => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
const eur0 = n => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const deNum = n => String(n).replace('.', ',');
const hrs = n => (Math.round(n * 100) / 100).toLocaleString('de-DE') + ' Std.';
const hShort = n => (Math.round(n * 100) / 100).toLocaleString('de-DE') + 'h';
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const todayStr = () => ymd(new Date());
const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const firstOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const monthName = d => d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
const monthOnly = d => d.toLocaleDateString('de-DE', { month: 'long' });
const monthShort = d => d.toLocaleDateString('de-DE', { month: 'short' }).replace('.', '');
const dayLong = s => parseYmd(s).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const dayMed = s => parseYmd(s).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
const jobById = id => db.jobs.find(j => j.id === id);
const shiftEarn = s => s.hours * s.rate;
const colorOf = c => (!c ? 'var(--c-gray)' : c.startsWith('#') ? c : `var(--c-${c})`);
const jobColor = id => colorOf(jobById(id)?.color);
const icon = (name, cls = '') => `<svg class="${cls}"><use href="#i-${name}"/></svg>`;
const chev = icon('chev', 'chev');

function relDay(date) {
  const t = parseYmd(todayStr());
  const diff = Math.round((parseYmd(date) - t) / 86400000);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Morgen';
  if (diff === -1) return 'Gestern';
  return dayMed(date);
}
function dueLine(date, done = false) {
  if (!date) return '';
  const t = todayStr();
  const cls = done ? '' : date < t ? 'late' : date === t ? 'today' : '';
  return `<div class="due ${cls}">${esc(relDay(date))}</div>`;
}

/* Kennzahlen eines Monats: gesamt und pro Job */
function monthStats(mk) {
  const shifts = db.shifts.filter(s => s.date.startsWith(mk));
  const per = {};
  db.jobs.forEach(j => { per[j.id] = { hours: 0, earn: 0, days: new Set() }; });
  let hours = 0, earn = 0;
  const days = new Set();
  shifts.forEach(s => {
    hours += s.hours; earn += shiftEarn(s); days.add(s.date);
    const p = per[s.jobId];
    if (p) { p.hours += s.hours; p.earn += shiftEarn(s); p.days.add(s.date); }
  });
  return { shifts, hours, earn, days: days.size, per };
}

/* Schule: Unterricht an einem Tag (ohne Ferien, innerhalb der Gültigkeit) */
const weekdayOf = ds => ((parseYmd(ds).getDay() + 6) % 7) + 1; // 1 = Montag
const holidayOn = ds => db.school.holidays.find(h => h.from <= ds && ds <= (h.to || h.from));
function lessonsOn(ds) {
  const sc = db.school;
  if ((sc.validFrom && ds < sc.validFrom) || (sc.validTo && ds > sc.validTo) || holidayOn(ds)) return [];
  const wd = weekdayOf(ds);
  return sc.lessons.filter(l => l.day === wd).sort((a, b) => a.start.localeCompare(b.start));
}
/* Nächster Schultag ab heute (heute nur, solange noch Unterricht kommt) */
function nextSchoolDay() {
  const now = new Date();
  const hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  for (let i = 0; i < 21; i++) {
    const ds = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
    const ls = lessonsOn(ds);
    if (ls.length && (i > 0 || ls[ls.length - 1].end > hm)) return { ds, ls, hm: i === 0 ? hm : null };
  }
  return null;
}
function lessonCell(l, hm = null, action = 'edit-lesson') {
  const past = hm && l.end <= hm;
  const now = hm && l.start <= hm && hm < l.end;
  return `<button class="cell lesson ${past ? 'past' : ''}" data-action="${action}" data-id="${l.id}">
    <span class="time num"><span>${l.start}</span><span>${l.end}</span></span>
    <span class="stripe"></span>
    <span class="main"><span class="title">${esc(l.subject)}${now ? ' <span class="now">Jetzt</span>' : ''}</span>
      <span class="sub" style="display:block">${[l.room, l.teacher].filter(Boolean).map(esc).join(' · ')}${l.note ? ' · ' + esc(l.note) : ''}</span></span>
    ${chev}</button>`;
}

/* Durchschnittlicher Verdienst der letzten drei abgeschlossenen Monate (nur Monate mit Einträgen) */
function avgMonthlyEarn() {
  const now = firstOfMonth(new Date());
  const vals = [1, 2, 3].map(i => monthStats(monthKey(addMonths(now, -i))).earn).filter(v => v > 0);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/* ---------- Zustand der Oberfläche ---------- */

const ui = {
  page: 'home',
  jobMonth: firstOfMonth(new Date()),
  homeMonth: firstOfMonth(new Date()),
  showDone: false,
  calView: 'month',
  calDate: new Date(),
  tlScroll: null,
};
try { const v = localStorage.getItem(STORE_KEY + ':calview'); if (['day', 'week', 'month'].includes(v)) ui.calView = v; } catch (e) { /* egal */ }
try { ui.page = localStorage.getItem(STORE_KEY + ':page') || 'home'; } catch (e) { /* egal */ }

function go(page) {
  if (ui.page === page) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  ui.page = page;
  try { localStorage.setItem(STORE_KEY + ':page', page); } catch (e) { /* egal */ }
  render();
  window.scrollTo(0, 0);
  onScroll();
}

function render() {
  document.querySelectorAll('.page, .navbar').forEach(p => p.classList.toggle('active', p.dataset.page === ui.page));
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.nav === ui.page));
  if (ui.page === 'jobs') renderJobs();
  if (ui.page === 'home') { renderHome(); placeTimeline(); }
  if (ui.page === 'todos') renderTodos();
  if (ui.page === 'school') renderSchool();
}

function onScroll() { document.body.classList.toggle('compact', window.scrollY > 34); }
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Bausteine ---------- */

function section(head, body, foot = '', headCls = '') {
  return `<div class="section">${head ? `<div class="section-head ${headCls}">${head}</div>` : ''}${body}${foot ? `<div class="section-foot">${foot}</div>` : ''}</div>`;
}

function calendar(month, cellFn, action, navAction) {
  const start = firstOfMonth(month);
  const offset = (start.getDay() + 6) % 7; // Montag zuerst
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const t = todayStr();
  let html = WEEKDAYS.map(w => `<div class="wd">${w}</div>`).join('');
  for (let i = 0; i < cells; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), 1 - offset + i);
    const ds = ymd(d);
    const out = d.getMonth() !== start.getMonth();
    const we = i % 7 >= 5;
    html += out ? `<div class="day out"></div>` : `<button class="day ${ds === t ? 'today' : ''} ${we ? 'we' : ''}" data-action="${action}" data-date="${ds}">
      <span class="n">${d.getDate()}</span>${cellFn(ds)}</button>`;
  }
  const isCur = monthKey(month) === monthKey(new Date());
  return `<div class="cal-card">
    <div class="cal-head">
      <strong>${esc(monthName(month))}</strong>
      ${isCur ? '' : `<button class="today-btn" data-action="${navAction}" data-step="0">Heute</button>`}
      <button data-action="${navAction}" data-step="-1" aria-label="Vormonat">${icon('left')}</button>
      <button data-action="${navAction}" data-step="1" aria-label="Nächster Monat">${icon('right')}</button>
    </div>
    <div class="cal">${html}</div>
  </div>`;
}

/* ---------- Tages- und Wochenansicht (wie Apple Kalender) ---------- */

const HOUR_H = 48; // Pixel pro Stunde
const toMin = hm => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + (m || 0); };
const fmtMin = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const shiftRange = s => s.start ? `${s.start}–${fmtMin(Math.min(1440, toMin(s.start) + Math.round(s.hours * 60)))}` : '';
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const weekStart = d => addDays(d, -((d.getDay() + 6) % 7));
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
}

/* Alles an einem Tag: Blöcke mit Uhrzeit und ganztägige Einträge */
function dayEvents(ds) {
  const timed = [], allDay = [];
  lessonsOn(ds).forEach(l => timed.push({ s: toMin(l.start), e: toMin(l.end), title: l.subject, sub: l.room, color: 'var(--school)', action: 'edit-lesson', id: l.id }));
  db.shifts.filter(s => s.date === ds).forEach(s => {
    const j = jobById(s.jobId);
    const name = j ? j.name : 'Job';
    if (s.start) {
      const st = toMin(s.start);
      timed.push({ s: st, e: Math.min(1440, st + Math.max(15, Math.round(s.hours * 60))), title: name, sub: hShort(s.hours), color: jobColor(s.jobId), action: 'job-day', date: ds });
    } else allDay.push({ title: `${name} · ${hShort(s.hours)}`, color: jobColor(s.jobId), action: 'job-day', date: ds });
  });
  examsOn(ds).forEach(g => allDay.push({ title: examTitle(g), color: 'var(--exam)', action: 'edit-grade', id: g.id, exam: true }));
  const hol = holidayOn(ds);
  if (hol) allDay.push({ title: hol.name || 'Frei', color: 'var(--c-gray)', action: 'home-day', date: ds });
  db.todos.filter(x => x.date === ds).forEach(x => allDay.push({ title: x.text, todo: true, done: x.done, color: 'var(--c-blue)', action: 'home-day', date: ds }));
  return { timed, allDay };
}

/* Überlappende Blöcke nebeneinander legen */
function layoutTimed(list) {
  list.sort((a, b) => a.s - b.s || b.e - a.e);
  let cluster = [], cols = [], maxEnd = -1;
  const flush = () => { cluster.forEach(ev => { ev.n = cols.length; }); cluster = []; cols = []; };
  list.forEach(ev => {
    if (ev.s >= maxEnd) { flush(); maxEnd = -1; }
    let c = cols.findIndex(end => end <= ev.s);
    if (c < 0) { c = cols.length; cols.push(0); }
    cols[c] = ev.e; ev.c = c; cluster.push(ev);
    maxEnd = Math.max(maxEnd, ev.e);
  });
  flush();
  return list;
}

const evAttrs = ev => `data-action="${ev.action}"${ev.id ? ` data-id="${ev.id}"` : ''}${ev.date ? ` data-date="${ev.date}"` : ''}`;

function timeline(days) {
  const t = todayStr();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const evs = days.map(dayEvents);
  const week = days.length > 1;

  const hours = Array.from({ length: 25 }, (_, h) => `<div class="tl-h" style="top:${h * HOUR_H}px"><span>${pad(h)}:00</span></div>`).join('');
  const cols = days.map((ds, i) => {
    const blocks = layoutTimed(evs[i].timed).map(ev => {
      const top = ev.s / 60 * HOUR_H, h = Math.max(18, (ev.e - ev.s) / 60 * HOUR_H - 2);
      const short = h < 34;
      return `<div class="ev ${short ? 'short' : ''}" style="--c:${ev.color};top:${top}px;height:${h}px;left:calc(${ev.c} * 100% / ${ev.n});width:calc(100% / ${ev.n} - 2px)" ${evAttrs(ev)}>
        <span class="ev-t">${esc(ev.title)}</span>${!short || !week ? `<span class="ev-s num">${week ? '' : fmtMin(ev.s) + '–' + fmtMin(ev.e)}${ev.sub ? (week ? '' : ' · ') + esc(ev.sub) : ''}</span>` : ''}</div>`;
    }).join('');
    const nowLine = ds === t ? `<div class="tl-now" style="top:${nowMin / 60 * HOUR_H}px"></div>` : '';
    return `<div class="tl-col ${ds === t ? 'today' : ''}" data-action="tl-slot" data-date="${ds}">${blocks}${nowLine}</div>`;
  }).join('');
  const nowPill = days.includes(t) ? `<div class="tl-pill num" style="top:${nowMin / 60 * HOUR_H}px">${pad(now.getHours())}:${pad(now.getMinutes())}</div>` : '';

  const anyAllDay = evs.some(e => e.allDay.length);
  const allDay = anyAllDay ? `<div class="tl-allday" style="--n:${days.length}"><span class="tl-ad-l">ganztägig</span>${evs.map(e => `<div class="tl-ad-c">${e.allDay.map(a =>
    `<div class="ad ${a.todo ? 'todo' : ''} ${a.exam ? 'exam' : ''} ${a.done ? 'done' : ''}" style="--c:${a.color}" ${evAttrs(a)}>${a.todo ? '<span class="ad-ring"></span>' : ''}<span>${esc(a.title)}</span></div>`).join('')}</div>`).join('')}</div>` : '';

  return `${allDay}<div class="tl" id="tl"><div class="tl-grid" style="height:${24 * HOUR_H}px">${hours}${nowPill}
    <div class="tl-cols" style="--n:${days.length}">${cols}</div></div></div>`;
}

/* Kalender der Übersicht: Tag · Woche · Monat */
function homeCalendar(cell, legend) {
  const view = ui.calView;
  const seg = `<div class="segmented cal-seg">${[['day', 'Tag'], ['week', 'Woche'], ['month', 'Monat']].map(([k, l]) =>
    `<label><input type="radio" name="cal-view" value="${k}" ${view === k ? 'checked' : ''}><span class="txt">${l}</span></label>`).join('')}</div>`;
  if (view === 'month') return `<div class="section">${seg}${calendar(ui.homeMonth, cell, 'home-day', 'home-month')}<div class="legend">${legend}</div></div>`;

  const sel = ui.calDate;
  const ws = weekStart(sel);
  const week = Array.from({ length: 7 }, (_, i) => ymd(addDays(ws, i)));
  const t = todayStr();
  const selDs = ymd(sel);
  const showsToday = view === 'day' ? selDs === t : week.includes(t);
  const strip = `<div class="tl-days ${view}" style="--n:7">${week.map((ds, i) => {
    const d = parseYmd(ds);
    const on = view === 'day' && ds === selDs;
    return `<button class="tl-day ${ds === t ? 'today' : ''} ${on ? 'on' : ''} ${i >= 5 ? 'we' : ''}" data-action="cal-pick" data-date="${ds}"><span class="w">${WEEKDAYS[i]}</span><span class="n">${d.getDate()}</span></button>`;
  }).join('')}</div>`;
  const title = view === 'day' ? dayLong(selDs) : `${monthName(sel)}`;
  const sub = view === 'day' ? (relDay(selDs) === dayMed(selDs) ? sel.getFullYear() : relDay(selDs)) : `KW ${isoWeek(sel)}`;
  return `<div class="section">${seg}<div class="cal-card tl-card">
    <div class="cal-head">
      <strong>${esc(title)}<small>${esc(String(sub))}</small></strong>
      ${showsToday ? '' : `<button class="today-btn" data-action="cal-step" data-step="0">Heute</button>`}
      <button data-action="cal-step" data-step="-1" aria-label="Zurück">${icon('left')}</button>
      <button data-action="cal-step" data-step="1" aria-label="Weiter">${icon('right')}</button>
    </div>
    ${strip}
    ${timeline(view === 'day' ? [selDs] : week)}
  </div><div class="legend">${legend}</div></div>`;
}

/* Zeitachse beim Öffnen auf die aktuelle Uhrzeit bzw. 7 Uhr stellen, sonst Position halten */
function placeTimeline() {
  const tl = $('#tl');
  if (!tl) return;
  if (ui.tlScroll == null) {
    const n = new Date();
    const showsNow = !!tl.querySelector('.tl-now');
    ui.tlScroll = Math.max(0, ((showsNow ? n.getHours() + n.getMinutes() / 60 : 8) - 1.5) * HOUR_H);
  }
  tl.scrollTop = ui.tlScroll;
}
document.addEventListener('scroll', e => { if (e.target.id === 'tl') ui.tlScroll = e.target.scrollTop; }, true);

/* ---------- Seite 1: Jobs ---------- */

function renderJobs() {
  $('#nav-jobs').innerHTML = db.jobs.length < MAX_JOBS ? `<button class="nav-btn" data-action="new-job" aria-label="Job hinzufügen">${icon('plus')}</button>` : '';

  const mk = monthKey(ui.jobMonth);
  const st = monthStats(mk);
  const limit = num(db.settings.minijobLimit);

  const jobRows = db.jobs.map(j => `<button class="cell" data-action="edit-job" data-id="${j.id}">
      <span class="ico" style="background:${colorOf(j.color)}">${icon('jobs')}</span>
      <span class="main"><span class="title">${esc(j.name)}</span></span>
      <span class="detail num">${eur(j.rate)}/Std.</span>${chev}</button>`).join('')
    || `<button class="cell link" data-action="new-job"><span class="ico" style="background:var(--tint)">${icon('plus')}</span><span class="main"><span class="title">Ersten Job hinzufügen</span></span></button>`;

  const cell = ds => st.shifts.filter(s => s.date === ds)
    .map(s => `<span class="bar" style="background:${jobColor(s.jobId)}">${hShort(s.hours)}</span>`).join('');

  const perJob = db.jobs.map(j => {
    const p = st.per[j.id];
    const pct = limit > 0 ? Math.min(100, (p.earn / limit) * 100) : 0;
    const over = limit > 0 && p.earn > limit;
    const rest = limit > 0 ? (over ? `<span class="neg">${eur(p.earn - limit)} über der Grenze</span>` : `noch ${eur(limit - p.earn)} bis zur Grenze`) : '';
    return `<div class="cell"><span class="dot" style="background:${colorOf(j.color)}"></span>
      <div class="main">
        <div class="row" style="display:flex;justify-content:space-between;gap:8px"><span class="title">${esc(j.name)}</span><span class="value">${eur(p.earn)}</span></div>
        <div class="sub num">${hrs(p.hours)} · ${p.days.size} ${p.days.size === 1 ? 'Tag' : 'Tage'}</div>
        ${limit > 0 ? `<div class="progress ${over ? 'over' : ''}"><i style="width:${pct}%;background:${colorOf(j.color)}"></i></div><div class="sub" style="font-size:13px;margin-top:4px">${rest}</div>` : ''}
      </div></div>`;
  }).join('');

  // Verlauf: sechs Monate bis zum angezeigten Monat
  const months = [-5, -4, -3, -2, -1, 0].map(i => addMonths(ui.jobMonth, i));
  const mstats = months.map(m => monthStats(monthKey(m)));
  const maxEarn = Math.max(1, ...mstats.map(s => s.earn));
  const chart = months.map((m, i) => {
    const s = mstats[i];
    const parts = db.jobs.map(j => {
      const e = s.per[j.id] ? s.per[j.id].earn : 0;
      return e > 0 ? `<i style="height:${(e / maxEarn) * 100}%;background:${colorOf(j.color)}"></i>` : '';
    }).join('');
    return `<div class="col"><span class="val">${s.earn ? eur0(s.earn) : ''}</span>
      <div class="stack">${parts}</div><span class="lbl ${i === 5 ? 'cur' : ''}">${esc(monthShort(m))}</span></div>`;
  }).join('');

  const log = [...st.shifts].sort((a, b) => b.date.localeCompare(a.date)).map(s => {
    const j = jobById(s.jobId);
    return `<button class="cell" data-action="job-day" data-date="${s.date}">
      <span class="dot" style="background:${jobColor(s.jobId)}"></span>
      <span class="main"><span class="title">${esc(dayLong(s.date))}</span>
        <span class="sub" style="display:block">${esc(j ? j.name : 'Gelöschter Job')} · ${hrs(s.hours)}${s.note ? ' · ' + esc(s.note) : ''}</span></span>
      <span class="value">${eur(shiftEarn(s))}</span>${chev}</button>`;
  }).join('');

  $('#page-jobs').innerHTML = `
    <div class="large-title"><h1>Jobs</h1></div>
    ${section('Meine Jobs', `<div class="group icons">${jobRows}</div>`, `Bis zu ${MAX_JOBS} Jobs, auch ein Praktikum. Tippe auf einen Tag, um Stunden einzutragen.`)}
    <div class="section">${calendar(ui.jobMonth, cell, 'job-day', 'job-month')}</div>
    ${section(esc(monthOnly(ui.jobMonth)), `
      <div class="stats">
        <div><div class="k">Verdienst</div><div class="v">${eur0(st.earn)}</div></div>
        <div><div class="k">Stunden</div><div class="v">${(Math.round(st.hours * 10) / 10).toLocaleString('de-DE')}</div></div>
        <div><div class="k">Tage</div><div class="v">${st.days}</div></div>
      </div>
      ${db.jobs.length ? `<div class="group" style="margin-top:12px">${perJob}
        <button class="cell" data-action="edit-limit"><span class="main"><span class="title">Minijob-Grenze</span></span><span class="detail">${limit > 0 ? eur(limit) : 'Aus'}</span>${chev}</button></div>` : ''}
    `)}
    ${section('Verlauf', `<div class="group"><div class="chart">${chart}</div></div>`)}
    ${section(`Einträge im ${esc(monthOnly(ui.jobMonth))}`, `<div class="group">${log || '<div class="empty">Noch keine Stunden in diesem Monat.</div>'}</div>`)}
  `;
}

function jobSheet(job) {
  const isNew = !job;
  const j = job || { name: '', color: COLORS[db.jobs.length % COLORS.length], rate: '' };
  openSheet({
    title: isNew ? 'Neuer Job' : 'Job bearbeiten',
    right: { label: isNew ? 'Hinzufügen' : 'Sichern' },
    body: `<form id="sheet-form" data-form="job" data-id="${isNew ? '' : j.id}">
      ${section('', `<div class="group">
        <label class="cell field"><input class="left" type="text" name="name" value="${esc(j.name)}" placeholder="Name, z. B. Café oder Praktikum" required autocomplete="off"></label>
        <label class="cell field"><span>Stundenlohn</span><input type="text" inputmode="decimal" name="rate" value="${j.rate === '' ? '' : deNum(j.rate)}" placeholder="13,90 €" required></label>
      </div>`)}
      ${section('Farbe', `<div class="group"><div class="swatches">
        ${COLORS.map(c => `<button type="button" class="swatch ${c === j.color ? 'on' : ''}" style="background:${colorOf(c)}" data-action="pick-color" data-color="${c}" aria-label="${c}"></button>`).join('')}
      </div></div><input type="hidden" name="color" value="${esc(j.color)}">`)}
      ${isNew ? '' : section('', `<div class="group"><label class="cell"><span class="main"><span class="title">Auch für bisherige Einträge</span></span><span class="switch"><input type="checkbox" name="retro"><i></i></span></label></div>`,
        'Ein geänderter Stundenlohn gilt sonst nur für neue Einträge.')}
      ${isNew ? '' : section('', `<div class="group"><button type="button" class="cell danger center" data-action="delete-job" data-id="${j.id}"><span class="title">Job löschen</span></button></div>`)}
    </form>`,
  });
}

function limitSheet() {
  openSheet({
    title: 'Minijob-Grenze',
    right: { label: 'Sichern' },
    body: `<form id="sheet-form" data-form="limit">
      ${section('', `<div class="group"><label class="cell field"><span>Pro Monat</span><input type="text" inputmode="decimal" name="limit" value="${deNum(db.settings.minijobLimit)}" placeholder="603 €"></label></div>`,
        'Seit 2026 liegt die Grenze bei 603 € im Monat. 0 blendet die Anzeige aus.')}
    </form>`,
  });
}

function jobDaySheet(date) {
  if (!db.jobs.length) { jobSheet(null); return; }
  const list = db.shifts.filter(s => s.date === date);
  const existing = list.map(s => {
    const j = jobById(s.jobId);
    return `<div class="cell"><span class="dot" style="background:${jobColor(s.jobId)}"></span>
      <span class="main"><span class="title">${esc(j ? j.name : 'Gelöschter Job')} · ${hrs(s.hours)}</span>
      <span class="sub" style="display:block">${s.start ? shiftRange(s) + ' · ' : ''}${eur(shiftEarn(s))} · ${eur(s.rate)}/Std.${s.note ? ' · ' + esc(s.note) : ''}</span></span>
      <button type="button" class="btn-tint" style="color:var(--c-red)" data-action="delete-shift" data-id="${s.id}" data-date="${date}">Löschen</button></div>`;
  }).join('');
  const total = list.reduce((a, s) => a + shiftEarn(s), 0);
  const lastJob = list.length ? list[list.length - 1].jobId : db.jobs[0].id;
  const start = ui.prefillStart || '';
  ui.prefillStart = null;

  openSheet({
    title: relDay(date) === dayMed(date) ? dayLong(date) : `${relDay(date)}, ${parseYmd(date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}`,
    left: null,
    right: { label: 'Fertig', action: 'close' },
    body: `
      ${existing ? section('Eingetragen', `<div class="group">${existing}</div>`, list.length > 1 ? `Zusammen ${eur(total)}` : '') : ''}
      <form data-form="shift" data-date="${date}">
        ${section('Neuer Eintrag', `
          ${db.jobs.length > 1 ? `<div class="segmented" style="margin-bottom:12px">${db.jobs.map(j => `<label><input type="radio" name="jobId" value="${j.id}" ${j.id === lastJob ? 'checked' : ''}><span class="dot" style="background:${colorOf(j.color)}"></span><span class="txt">${esc(j.name)}</span></label>`).join('')}</div>`
            : `<input type="hidden" name="jobId" value="${db.jobs[0].id}">`}
          <div class="group">
            <label class="cell field"><span>Stunden</span><input type="text" inputmode="decimal" name="hours" placeholder="0" required autocomplete="off"></label>
            <div class="cell" style="padding-top:4px;padding-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">${HOUR_CHIPS.map(h => `<button type="button" class="chip" data-action="hour-chip" data-h="${h}">${h} Std.</button>`).join('')}</div></div>
            <label class="cell field"><span>Beginn</span><input type="time" name="start" value="${start}"></label>
            <label class="cell field"><span>Notiz</span><input type="text" name="note" placeholder="optional" autocomplete="off"></label>
          </div>
          <div class="group" style="margin-top:12px"><button class="cell link center"><span class="title" style="font-weight:600">Stunden eintragen</span></button></div>
        `)}
      </form>`,
  });
}

/* ---------- Seite 2: Übersicht ---------- */

function renderHome() {
  $('#nav-home').innerHTML = (lockCred() ? `<button class="nav-btn" data-action="lock-now" aria-label="Jetzt sperren">${icon('lock')}</button>` : '')
    + `<button class="nav-btn" data-action="new-account" aria-label="Konto hinzufügen">${icon('plus')}</button>`;

  const now = new Date();
  const t = todayStr();
  const total = db.accounts.reduce((a, c) => a + num(c.balance), 0);
  const st = monthStats(monthKey(now));
  const avg = avgMonthlyEarn();
  const open = db.todos.filter(x => !x.done);
  const overdue = open.filter(x => x.date && x.date < t).length;
  const todayShifts = db.shifts.filter(s => s.date === t);
  const todayTodos = open.filter(x => x.date === t);
  const lastUpdate = db.accounts.map(a => a.updated).filter(Boolean).sort().pop();

  const accounts = db.accounts.map((a, i) => `<button class="cell" data-action="edit-account" data-id="${a.id}">
      <span class="ico" style="background:${colorOf(COLORS[(i + 5) % COLORS.length])}">${icon('bank')}</span>
      <span class="main"><span class="title">${esc(a.name)}</span></span>
      <span class="value ${num(a.balance) < 0 ? 'neg' : ''}">${eur(num(a.balance))}</span>${chev}</button>`).join('')
    + `<button class="cell link" data-action="new-account"><span class="ico" style="background:var(--tint)">${icon('plus')}</span><span class="main"><span class="title">Konto hinzufügen</span></span></button>`;

  const cell = ds => {
    const marks = examsOn(ds).map(() => '<span class="mark exam"></span>').join('') + (lessonsOn(ds).length ? '<span class="mark school"></span>' : '')
      + db.shifts.filter(s => s.date === ds).map(s => `<span class="mark" style="background:${jobColor(s.jobId)}"></span>`).join('')
      + db.todos.filter(x => x.date === ds).map(x => `<span class="mark todo ${x.done ? 'done' : ''}"></span>`).join('');
    return marks ? `<span class="marks">${marks}</span>` : '';
  };
  const legend = `<span><span class="dot" style="background:var(--exam);width:8px;height:8px"></span>Prüfung</span><span><span class="dot" style="background:var(--school);width:8px;height:8px;border-radius:2px"></span>Schule</span>` + db.jobs.map(j => `<span><span class="dot" style="background:${colorOf(j.color)};width:8px;height:8px"></span>${esc(j.name)}</span>`).join('')
    + `<span><span class="dot" style="width:8px;height:8px;box-shadow:inset 0 0 0 1.5px var(--label2)"></span>To-do</span>`;

  // Nächste sieben Tage
  const up = [];
  for (let i = 0; i < 7; i++) {
    const ds = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
    db.shifts.filter(s => s.date === ds).forEach(s => {
      const j = jobById(s.jobId);
      up.push(`<button class="cell" data-action="home-day" data-date="${ds}"><span class="dot" style="background:${jobColor(s.jobId)}"></span>
        <span class="main"><span class="title">${esc(j ? j.name : 'Job')} · ${hrs(s.hours)}</span><span class="sub" style="display:block">${esc(relDay(ds))}${s.start ? ', ' + shiftRange(s) : ''}</span></span>${chev}</button>`);
    });
    examsOn(ds).filter(g => g.planned).forEach(g => up.push(`<button class="cell" data-action="edit-grade" data-id="${g.id}"><span class="dot" style="background:var(--exam)"></span>
        <span class="main"><span class="title">${esc(examTitle(g))}</span><span class="sub" style="display:block">${esc(relDay(ds))}</span></span>${chev}</button>`));
    db.todos.filter(x => x.date === ds && !x.done).forEach(x => up.push(todoCell(x)));
  }
  const overdueCells = open.filter(x => x.date && x.date < t).map(todoCell).join('');

  const todayLessons = lessonsOn(t);
  const todayBits = [todayLessons.length && `Schule bis ${todayLessons[todayLessons.length - 1].end}`, todayShifts.length && `${todayShifts.length} ${todayShifts.length === 1 ? 'Schicht' : 'Schichten'}`, todayTodos.length && `${todayTodos.length} To-do${todayTodos.length === 1 ? '' : 's'}`].filter(Boolean);

  $('#page-home').innerHTML = `
    <div class="large-title"><div class="eyebrow">${esc(now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }))}</div><h1>Übersicht</h1></div>

    <div class="section" style="margin-top:12px">
      <div class="hero">
        <div class="k">Gesamtvermögen</div>
        <div class="v ${total < 0 ? 'neg' : ''}">${eur(total)}</div>
        <div class="s">${db.accounts.length ? `${db.accounts.length} ${db.accounts.length === 1 ? 'Konto' : 'Konten'}${lastUpdate ? ` · zuletzt aktualisiert ${esc(relDay(lastUpdate))}` : ''}` : 'Füge unten deine Konten hinzu.'}</div>
      </div>
      <div class="tiles">
        <button class="tile" data-action="nav" data-page="jobs"><span class="k" style="color:var(--c-green)">${icon('euro')}Verdienst</span>
          <span class="v">${eur0(st.earn)}</span><span class="s">${hrs(st.hours)} im ${esc(monthOnly(now))}</span></button>
        <button class="tile" data-action="nav" data-page="jobs"><span class="k" style="color:var(--c-purple)">${icon('trend')}Ø pro Monat</span>
          <span class="v">${avg !== null ? eur0(avg) : '–'}</span><span class="s">aus den letzten 3 Monaten</span></button>
        <button class="tile" data-action="nav" data-page="todos"><span class="k" style="color:var(--c-blue)">${icon('check')}To-dos</span>
          <span class="v">${open.length}</span><span class="s">${overdue ? `<span class="neg">${overdue} überfällig</span>` : 'offen'}</span></button>
        <button class="tile" data-action="home-day" data-date="${t}"><span class="k" style="color:var(--c-red)">${icon('cal')}Heute</span>
          <span class="v">${todayLessons.length + todayShifts.length + todayTodos.length}</span><span class="s">${todayBits.length ? todayBits.join(' · ') : 'nichts geplant'}</span></button>
      </div>
    </div>

    ${schoolSection()}

    ${section('Konten', `<div class="group icons">${accounts}</div>`, 'Kontostände trägst du von Hand ein. Tippe ein Konto an, um es zu aktualisieren.')}

    ${homeCalendar(cell, legend)}

    ${overdueCells ? section('Überfällig', `<div class="group">${overdueCells}</div>`) : ''}
    ${section('Nächste 7 Tage', `<div class="group">${up.join('') || '<div class="empty">Nichts geplant.</div>'}</div>`)}

    ${securitySection()}

    ${section('Daten', `<div class="group icons">
      <button class="cell" data-action="export"><span class="ico" style="background:var(--c-gray)">${icon('up')}</span><span class="main"><span class="title">Backup sichern</span></span>${chev}</button>
      <button class="cell" data-action="import"><span class="ico" style="background:var(--c-gray)">${icon('down')}</span><span class="main"><span class="title">Backup wiederherstellen</span></span>${chev}</button>
    </div>`, 'Deine Daten bleiben auf diesem Gerät. Ein Backup ist eine JSON-Datei.')}
  `;
}

function accountSheet(acc) {
  const isNew = !acc;
  const a = acc || { name: '', balance: '' };
  openSheet({
    title: isNew ? 'Neues Konto' : 'Konto',
    right: { label: isNew ? 'Hinzufügen' : 'Sichern' },
    body: `<form id="sheet-form" data-form="account" data-id="${isNew ? '' : a.id}">
      ${section('', `<div class="group">
        <label class="cell field"><input class="left" type="text" name="name" value="${esc(a.name)}" placeholder="Name, z. B. Girokonto" required autocomplete="off"></label>
        <label class="cell field"><span>Kontostand</span><input type="text" inputmode="decimal" name="balance" value="${a.balance === '' ? '' : deNum(a.balance)}" placeholder="0,00 €" required></label>
      </div>`, isNew ? '' : `Zuletzt aktualisiert: ${esc(a.updated ? dayLong(a.updated) : '–')}`)}
      ${isNew ? '' : section('', `<div class="group"><button type="button" class="cell danger center" data-action="delete-account" data-id="${a.id}"><span class="title">Konto löschen</span></button></div>`)}
    </form>`,
  });
}

function homeDaySheet(date) {
  const shifts = db.shifts.filter(s => s.date === date).map(s => {
    const j = jobById(s.jobId);
    return `<div class="cell"><span class="dot" style="background:${jobColor(s.jobId)}"></span>
      <span class="main"><span class="title">${esc(j ? j.name : 'Job')} · ${hrs(s.hours)}</span><span class="sub" style="display:block">${s.start ? shiftRange(s) + ' · ' : ''}${eur(shiftEarn(s))}${s.note ? ' · ' + esc(s.note) : ''}</span></span></div>`;
  }).join('');
  const todos = db.todos.filter(x => x.date === date).map(x => todoCell(x, true)).join('');
  const lessons = lessonsOn(date);
  const hol = holidayOn(date);
  const hm = date === todayStr() ? `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}` : null;
  openSheet({
    title: dayLong(date),
    left: null,
    right: { label: 'Fertig', action: 'close' },
    body: `
      ${lessons.length ? section('Schule', `<div class="group">${lessons.map(l => lessonCell(l, hm)).join('')}</div>`)
        : hol ? section('Schule', `<div class="group"><div class="empty">${esc(hol.name || 'Frei')} – kein Unterricht</div></div>`) : ''}
      ${examsOn(date).length ? section('Prüfungen', `<div class="group icons">${examsOn(date).map(g => examRow(g)).join('')}</div>`) : ''}
      ${section('Arbeit', `<div class="group">${shifts || '<div class="empty">Keine Stunden eingetragen.</div>'}
        <button class="cell link" data-action="job-day" data-date="${date}"><span class="main"><span class="title">Stunden eintragen</span></span>${chev}</button></div>`)}
      ${section('To-dos', `<div class="group">${todos}
        <form class="cell add-row" data-form="todo" data-date="${date}" data-reopen="home-day">
          <span class="ring" style="opacity:.5"></span><input type="text" name="text" placeholder="Neues To-do" autocomplete="off" enterkeyhint="done">
          <button class="btn-tint" style="padding:4px">${icon('plus', '')}</button></form></div>`)}
    `,
  });
  const svg = $('#sheet .add-row .btn-tint svg'); if (svg) { svg.style.width = '22px'; svg.style.height = '22px'; }
}

/* ---------- Schule ---------- */

const WEEKDAY_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

/* Heutiger bzw. nächster Schultag als Liste */
function nextDayGroup() {
  const nx = nextSchoolDay();
  if (!nx) return '<div class="group"><div class="empty">In den nächsten drei Wochen kein Unterricht.</div></div>';
  const rel = relDay(nx.ds);
  const head = rel === dayMed(nx.ds) ? dayLong(nx.ds) : `${rel}, ${WEEKDAY_LONG[weekdayOf(nx.ds) - 1]}`;
  return `<div class="group"><div class="cell"><span class="main"><span class="title" style="font-weight:600">${esc(head)}</span>
      <span class="sub" style="display:block">${nx.ls[0].start}–${nx.ls[nx.ls.length - 1].end} Uhr · ${nx.ls.length} ${nx.ls.length === 1 ? 'Block' : 'Blöcke'}</span></span></div>`
    + nx.ls.map(l => lessonCell(l, nx.hm)).join('') + '</div>';
}

/* Übersicht: nächster Schultag und Notenschnitt, Details im Schul-Tab */
function schoolSection() {
  const avg = overallAvg(null, viewOf('12').terms);
  const m = faModel();
  const E = faTotal(m, faReal(m)).E;
  const nx = upcomingExams()[0];
  return section('Schule', `${nextDayGroup()}
    <div class="group icons" style="margin-top:12px">
      ${nx ? `<button class="cell" data-action="edit-grade" data-id="${nx.id}"><span class="ico" style="background:var(--exam)">${icon('cal')}</span>
        <span class="main"><span class="title">Nächste Prüfung</span><span class="sub" style="display:block">${esc(examTitle(nx))}</span></span>
        <span class="detail">${esc(relDay(nx.date))}</span>${chev}</button>` : ''}
      <button class="cell" data-action="school-view" data-view="12"><span class="ico" style="background:var(--school)">${icon('school')}</span>
        <span class="main"><span class="title">Notenschnitt 12. Klasse</span></span>
        <span class="detail num">${avg === null ? 'noch keine Noten' : `${fmtP(avg)} P · ${fmtNote(avg)}`}</span>${chev}</button>
      <button class="cell" data-action="school-view" data-view="prog"><span class="ico" style="background:var(--c-green)">${icon('trend')}</span>
        <span class="main"><span class="title">Fachabi-Prognose</span></span>
        <span class="detail num">${fmt1(faNote(E))}</span>${chev}</button>
    </div>`);
}

function scheduleRows() {
  const nHol = db.school.holidays.length;
  return `<div class="group icons" style="margin-top:12px">
      <button class="cell" data-action="schedule"><span class="ico" style="background:var(--school)">${icon('school')}</span><span class="main"><span class="title">Stundenplan</span></span><span class="detail">${db.school.lessons.length} Blöcke</span>${chev}</button>
      <button class="cell" data-action="holidays"><span class="ico" style="background:var(--c-orange)">${icon('sun')}</span><span class="main"><span class="title">Ferien und freie Tage</span></span><span class="detail">${nHol || ''}</span>${chev}</button>
      <button class="cell" data-action="export-ics"><span class="ico" style="background:var(--c-red)">${icon('cal')}</span><span class="main"><span class="title">In Apple Kalender übernehmen</span></span>${chev}</button>
    </div>`;
}

/* ---------- Noten ---------- */

const SUBJECT_NAMES = { D: 'Deutsch', M: 'Mathematik', E: 'Englisch', Ph: 'Physik', C: 'Chemie', Inf1: 'Informatik', PuG: 'Politik und Gesellschaft', Te: 'Technologie', Smw: 'Sport' };
const GRADE_KINDS = [['sa', 'Schulaufgabe', 2], ['ka', 'Kurzarbeit', 1], ['ex', 'Stegreifaufgabe', 1], ['m', 'Mündlich', 1], ['r', 'Referat', 1], ['ap', 'Abschlussprüfung', 2], ['s', 'Sonstiges', 1]];
const POINT_NOTES = ['6', '5-', '5', '5+', '4-', '4', '4+', '3-', '3', '3+', '2-', '2', '2+', '1-', '1', '1+']; // Index = Punkte
const kindOf = k => GRADE_KINDS.find(x => x[0] === k) || GRADE_KINDS[GRADE_KINDS.length - 1];
const kindLabel = k => kindOf(k)[1];
const kindWeight = k => kindOf(k)[2];
const subjById = id => db.school.subjects.find(f => f.id === id);
const subjectsSorted = () => [...db.school.subjects].sort((a, b) => a.name.localeCompare(b.name, 'de'));
const byDate = (a, b) => (a.date || '9999').localeCompare(b.date || '9999') || (a.created || 0) - (b.created || 0);
/* Halbjahre 11/1 … 12/2 */
const TERMS = [['11-1', '11/1', '11. Klasse · 1. Halbjahr'], ['11-2', '11/2', '11. Klasse · 2. Halbjahr'], ['12-1', '12/1', '12. Klasse · 1. Halbjahr'], ['12-2', '12/2', '12. Klasse · 2. Halbjahr']];
const ALL_TERMS = TERMS.map(t => t[0]);
const ABI_TERMS = ['11-2', '12-1', '12-2']; // zählen fürs Fachabi
const termLabel = t => (TERMS.find(x => x[0] === t) || TERMS[2])[1];
const termLong = t => (TERMS.find(x => x[0] === t) || TERMS[2])[2];
/* Ansichten im Auswahlmenü des Schul-Tabs */
const SCHOOL_VIEWS = [
  ['12. Klasse', [['12', 'Ganzes Schuljahr', ['12-1', '12-2']], ['12-1', '1. Halbjahr', ['12-1']], ['12-2', '2. Halbjahr', ['12-2']]]],
  ['11. Klasse', [['11', 'Ganzes Schuljahr', ['11-1', '11-2']], ['11-1', '1. Halbjahr', ['11-1']], ['11-2', '2. Halbjahr', ['11-2']]]],
  ['Fachabi', [['prog', 'Vorhersage', ABI_TERMS]]],
];
const viewOf = v => SCHOOL_VIEWS.flatMap(([grp, vs]) => vs.map(x => ({ id: x[0], label: x[1], terms: x[2], grp }))).find(x => x.id === v) || viewOf('12');
const viewName = v => { const x = viewOf(v); return x.id === 'prog' ? 'Fachabi-Vorhersage' : x.terms.length > 1 ? x.grp : termLong(x.terms[0]); };
/* Halbjahr aus dem Datum: Wechsel am 15. Februar, Schuljahr ab September */
function termOf(ds) {
  const y = +db.school.year11 || new Date().getFullYear() - 1;
  if (!ds || ds < `${y + 1}-02-15`) return '11-1';
  if (ds < `${y + 1}-09-01`) return '11-2';
  if (ds < `${y + 2}-02-15`) return '12-1';
  return '12-2';
}
/* Echte Noten eines Fachs (ohne geplante), optional nur bestimmte Halbjahre */
const gradesOf = (sid, terms = null) => db.school.grades.filter(g => g.subjectId === sid && !g.planned && (!terms || terms.includes(g.term))).sort(byDate);
const plannedOf = sid => db.school.grades.filter(g => g.subjectId === sid && g.planned).sort(byDate);
const wavg = gs => { let s = 0, w = 0; gs.forEach(g => { s += g.points * g.weight; w += g.weight; }); return w > 0 ? s / w : null; };
/* Gesamtschnitt: Mittel der Fachschnitte (jedes Fach zählt gleich), optional nur Noten bis zu einem Datum bzw. aus bestimmten Halbjahren */
function overallAvg(upTo = null, terms = null) {
  const avgs = db.school.subjects.map(f => wavg(gradesOf(f.id, terms).filter(g => !upTo || g.date <= upTo))).filter(v => v !== null);
  return avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;
}
const isOpen = g => g.points === null || g.points === undefined || g.points === '';
const WRITTEN = ['sa', 'ka', 'ex', 'ap'];
/* Prüfungstermine für den Kalender: geplante mit Datum und geschriebene Leistungsnachweise */
const examsOn = ds => db.school.grades.filter(g => g.date === ds && (g.planned || WRITTEN.includes(g.kind)));
const examTitle = g => { const f = subjById(g.subjectId); return `${f ? f.short : '?'} · ${g.title || kindLabel(g.kind)}`; };
const upcomingExams = (days = 400) => {
  const t = todayStr(), end = ymd(addDays(new Date(), days));
  return db.school.grades.filter(g => g.planned && g.date && g.date >= t && g.date <= end).sort(byDate);
};

/* ---------- Fachabi-Vorhersage (FOS Bayern, FOBOSO § 35 und Anlage 4) ----------
   4 Abschlussprüfungen je dreifach (max. 180) + 25 Halbjahresergebnisse aus 11/2, 12/1, 12/2 (max. 375)
   + fachpraktische Ausbildung (2 Halbjahre, max. 30) = höchstens 585 Punkte.
   Note = 17/3 − 5 · E / 585, auf eine Stelle abgeschnitten (unter 1 → 1,0).
   Halbjahresergebnis = gewichteter Schnitt, ab ,50 aufgerundet. Je Fach darf höchstens ein Halbjahr wegfallen;
   die App bringt automatisch die besten 25 ein. Sport zählt nicht. */
const FA_MAX = 585, FA_HJ = 25;
const fc = () => db.school.forecast;
const roundHJ = v => Math.floor(v + 0.5 + 1e-9);
const isSport = f => /^sport$/i.test(f.name) || f.short === 'Smw';
const faNoteRaw = E => 17 / 3 - (5 * E) / FA_MAX;
const faNote = E => Math.max(1, Math.floor(faNoteRaw(E) * 10 + 1e-9) / 10);
const faTarget = () => Math.min(4, Math.max(1, num(fc().target) || 2.1));
const faReached = E => (fc().exact ? faNoteRaw(E) <= faTarget() + 1e-9 : faNote(E) <= faTarget() + 1e-9);
function faMinE() { for (let E = 0; E <= FA_MAX; E++) if (faReached(E)) return E; return null; }

/* Alle Bausteine der Gesamtpunktzahl; offene Teile bekommen später einen Wert */
function faModel() {
  const sc = db.school;
  const taught12 = new Set(sc.lessons.map(l => l.subject));
  const subs = sc.subjects.filter(f => !isSport(f));
  const counted = new Set(subs.map(f => f.id));
  const allReal = sc.grades.filter(g => !g.planned && ABI_TERMS.includes(g.term) && counted.has(g.subjectId));
  const base = wavg(allReal) ?? wavg(sc.grades.filter(g => !g.planned)) ?? 10;
  const level = {};
  subs.forEach(f => { level[f.id] = wavg(gradesOf(f.id, ABI_TERMS)) ?? base; });
  const exams = [], hjs = [];
  subs.forEach(f => {
    if (f.abi) {
      const written = sc.grades.find(g => g.subjectId === f.id && !g.planned && g.kind === 'ap');
      const plan = sc.grades.find(g => g.subjectId === f.id && g.planned && g.kind === 'ap');
      exams.push({ sid: f.id, g: written || plan || null, fixed: written ? written.points : plan && !isOpen(plan) ? plan.points : null });
    }
    ABI_TERMS.forEach(t => {
      const real = gradesOf(f.id, [t]);
      const plan = plannedOf(f.id).filter(g => g.kind !== 'ap' && g.term === t);
      if (!real.length && !plan.length && !(t !== '11-2' && taught12.has(f.short))) return; // Fach in dem Halbjahr nicht belegt
      hjs.push({ sid: f.id, term: t, real, pred: plan.filter(g => !isOpen(g)), open: plan.filter(isOpen) });
    });
  });
  hjs.forEach(h => { h.isOpen = h.open.length > 0 || (!h.real.length && !h.pred.length); });
  const fpa = (fc().fpa || [null, null]).map(v => (v === null || v === '' || v === undefined ? null : +v));
  return { subs, exams, hjs, fpa, level, base };
}
/* Halbjahresergebnis; x = Punkte für offene Teile */
function hjValue(h, x) {
  if (!h.real.length && !h.pred.length && !h.open.length) return roundHJ(x);
  return roundHJ(wavg([...h.real, ...h.pred, ...h.open.map(g => ({ points: x, weight: g.weight }))]));
}
/* Gesamtpunktzahl. val(item) liefert die Punkte für offene Teile (Prüfung bzw. Halbjahr) */
function faTotal(m, val) {
  const ex = m.exams.reduce((a, e) => a + 3 * (e.fixed ?? roundHJ(val(e))), 0);
  const fpa = m.fpa.reduce((a, v) => a + (v ?? roundHJ(m.base)), 0);
  const vals = m.hjs.map(h => ({ sid: h.sid, h, v: h.isOpen ? hjValue(h, val(h)) : hjValue(h, 0) }));
  // beste 25 einbringen, je Fach höchstens ein Halbjahr streichen
  let used = vals;
  if (vals.length > FA_HJ) {
    const mins = {};
    vals.forEach(x => { if (!mins[x.sid] || x.v < mins[x.sid].v) mins[x.sid] = x; });
    const drop = new Set(Object.values(mins).sort((a, b) => a.v - b.v).slice(0, vals.length - FA_HJ));
    used = vals.filter(x => !drop.has(x));
    if (used.length > FA_HJ) used = [...used].sort((a, b) => b.v - a.v).slice(0, FA_HJ);
  }
  const missing = Math.max(0, FA_HJ - used.length);
  const hj = used.reduce((a, x) => a + x.v, 0) + missing * roundHJ(m.base);
  return { E: ex + fpa + hj, ex, fpa, hj, used: new Set(used.map(x => x.h)), missing };
}
/* realistisch: offene Teile so gut wie der bisherige Fachschnitt */
const faReal = m => it => m.level[it.sid] ?? m.base;
/* kleinste ganze Punktzahl in den variierten Teilen, mit der das Ziel erreicht wird (null = unmöglich) */
function faNeed(m, vary) {
  const real = faReal(m);
  for (let x = 0; x <= 15; x++) if (faReached(faTotal(m, it => (vary(it) ? x : real(it))).E)) return x;
  return null;
}
const toNote = p => Math.min(6, Math.max(1, (17 - p) / 3));
const fmt1 = n => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtP = p => (p === null ? '–' : fmt1(Math.round(p * 10) / 10));
const fmtNote = p => (p === null ? '–' : fmt1(Math.round(toNote(p) * 10) / 10)); // laufende Schnitte gerundet; die Fachabi-Note schneidet ab (faNote)
const pointColor = p => (p === null ? 'var(--c-gray)' : p >= 13 ? 'var(--c-green)' : p >= 10 ? 'var(--c-teal)' : p >= 5 ? 'var(--c-orange)' : 'var(--c-red)');
const pBadge = p => `<span class="pbadge num" style="background:${pointColor(p)}">${p === null ? '–' : (Number.isInteger(p) ? p : fmtP(p))}</span>`;

/* Fächer einmalig aus dem Stundenplan anlegen, fehlende Felder ergänzen */
function normalizeSchool() {
  const sc = db.school;
  if (!Array.isArray(sc.holidays)) sc.holidays = [];
  if (!Array.isArray(sc.subjects)) {
    const seen = [];
    sc.lessons.forEach(l => { if (l.subject && !seen.includes(l.subject)) seen.push(l.subject); });
    sc.subjects = seen.map((s, i) => ({ id: 'f' + (i + 1), short: s, name: SUBJECT_NAMES[s] || s, color: COLORS[i % COLORS.length] }));
  }
  if (!Array.isArray(sc.grades)) sc.grades = [];
  if (!sc.forecast) {
    sc.forecast = { target: 2.1, exact: false };
    sc.subjects.forEach(f => { if (ABI_SHORTS.includes(f.short)) { f.abi = true; addAbiExam(f.id); } });
  }
  if (!Array.isArray(sc.forecast.fpa)) sc.forecast.fpa = [null, null];
  delete sc.forecast.terms;
  // v2: aktuelles Schuljahr ist die 12. Klasse; Halbjahre 11/1, 11/2, 12/1, 12/2
  if ((sc.v || 1) < 2) {
    const n = new Date();
    sc.year11 = (n.getMonth() >= 7 ? n.getFullYear() : n.getFullYear() - 1) - 1;
    sc.grades.forEach(g => { g.term = g.kind === 'ap' ? '12-2' : g.date ? termOf(g.date) : '12-1'; });
    sc.v = 2;
  }
  sc.grades.forEach(g => { if (!ALL_TERMS.includes(g.term)) g.term = g.date ? termOf(g.date) : '12-1'; });
}
/* Fachabi: Abschlussprüfungen in Deutsch, Englisch, Mathematik, Physik */
const ABI_SHORTS = ['D', 'E', 'M', 'Ph'];
function addAbiExam(sid) {
  if (db.school.grades.some(g => g.subjectId === sid && g.planned && g.kind === 'ap')) return;
  db.school.grades.push({ id: uid(), subjectId: sid, planned: true, points: null, weight: 2, kind: 'ap', date: '', title: 'Fachabi', term: '12-2', created: Date.now() });
}

/* Liniendiagramm für Punkte 0–15. series: [{pts:[{x:'YYYY-MM-DD', y, r}], color, dashed, dots}] */
function lineChart(series) {
  const all = series.flatMap(s => s.pts);
  if (!all.length) return '<div class="empty">Noch keine Noten.</div>';
  const W = 340, H = 170, L = 26, R = 12, T = 12, B = 24;
  const day = 86400000;
  const ts = all.map(p => parseYmd(p.x).getTime());
  let x0 = Math.min(...ts), x1 = Math.max(...ts);
  if (x1 - x0 < day * 14) { const m = (x0 + x1) / 2; x0 = m - day * 7; x1 = m + day * 7; }
  const X = t => L + ((t - x0) / (x1 - x0)) * (W - L - R);
  const Y = v => T + ((15 - v) / 15) * (H - T - B);
  const lbl = t => new Date(t).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }).replace('.', '');
  let svg = [0, 5, 10, 15].map(v => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="${v === 5 ? 'gl warn' : 'gl'}"/><text x="${L - 6}" y="${Y(v) + 4}" class="ax" text-anchor="end">${v}</text>`).join('');
  svg += [x0, (x0 + x1) / 2, x1].map((t, i) => `<text x="${X(t)}" y="${H - 6}" class="ax" text-anchor="${['start', 'middle', 'end'][i]}">${lbl(t)}</text>`).join('');
  series.forEach(s => {
    if (!s.pts.length) return;
    const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${X(parseYmd(p.x).getTime()).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
    if (s.pts.length > 1 || !s.dots) svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.dashed ? 2 : 2.5}" ${s.dashed ? 'stroke-dasharray="5 4"' : ''} stroke-linecap="round" stroke-linejoin="round" opacity="${s.dashed ? .7 : 1}"/>`;
    if (s.dots) svg += s.pts.map(p => `<circle cx="${X(parseYmd(p.x).getTime()).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${p.r || 4}" fill="${s.color}" stroke="var(--card)" stroke-width="2"/>`).join('');
  });
  return `<svg class="linechart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Notenverlauf">${svg}</svg>`;
}

/* ---------- Seite: Schule ---------- */

/* Auswahlmenü (wie ein Pull-down-Button in iOS) */
function schoolPicker() {
  const v = ui.schoolView;
  return `<label class="view-pick"><span class="txt">${esc(viewName(v))}</span><svg class="dd"><use href="#i-chev"/></svg>
    <select name="school-view" aria-label="Ansicht">${SCHOOL_VIEWS.map(([grp, vs]) => `<optgroup label="${grp}">${vs.map(([id, label]) =>
      `<option value="${id}" ${id === v ? 'selected' : ''}>${grp === 'Fachabi' ? label : `${grp} – ${label}`}</option>`).join('')}</optgroup>`).join('')}</select></label>`;
}
const isOpenItem = it => ('term' in it ? it.isOpen : it.fixed === null);
const needBadge = x => (x === null ? '<span class="need bad">unmöglich</span>' : x === 0 ? '<span class="need ok">sicher</span>' : `<span class="need num">≥ ${x}</span>`);

/* Zeile für eine Prüfung (geplant oder geschrieben) */
function examRow(g, showSubject = true) {
  const f = subjById(g.subjectId);
  const days = g.date ? Math.round((parseYmd(g.date) - parseYmd(todayStr())) / 86400000) : null;
  const when = g.date ? (days >= 0 && days <= 1 ? relDay(g.date) : days > 1 && days < 14 ? `in ${days} Tagen · ${dayMed(g.date)}` : dayMed(g.date)) : 'ohne Datum';
  return `<button class="cell exam-row" data-action="edit-grade" data-id="${g.id}">
    <span class="ico txt" style="background:${f ? colorOf(f.color) : 'var(--c-gray)'}">${esc(f ? f.short : '?')}</span>
    <span class="main"><span class="title">${esc(showSubject ? examTitle(g) : g.title || kindLabel(g.kind))}</span>
      <span class="sub" style="display:block">${esc(when)}${g.kind === 'ap' ? ' · zählt dreifach' : ` · ${termLabel(g.term)} · ×${deNum(g.weight)}`}</span></span>
    ${g.planned ? (isOpen(g) ? '<span class="pbadge num open">?</span>' : pBadge(g.points)) : pBadge(g.points)}${chev}</button>`;
}
const planLink = (sid = '') => `<button class="cell link" data-action="new-planned" data-id="${sid}"><span class="ico" style="background:var(--exam)">${icon('plus')}</span><span class="main"><span class="title">Prüfung planen</span></span></button>`;

function renderSchool() {
  const view = ui.schoolView;
  $('#nav-school').innerHTML = `<button class="nav-btn" data-action="new-planned" aria-label="Prüfung planen">${icon('plus')}</button>`;
  if (view === 'prog') { renderForecast(); return; }
  const sc = db.school;
  const terms = viewOf(view).terms;
  const avg = overallAvg(null, terms);
  const withGrades = sc.subjects.filter(f => gradesOf(f.id, terms).length);
  const nGrades = sc.grades.filter(g => !g.planned && terms.includes(g.term)).length;
  const dates = [...new Set(sc.grades.filter(g => !g.planned && terms.includes(g.term)).map(g => g.date))].sort();
  const overall = dates.map(d => ({ x: d, y: overallAvg(d, terms) }));
  const next = upcomingExams().slice(0, 4);

  const rows = subjectsSorted().map(f => {
    const gs = gradesOf(f.id, terms);
    const a = wavg(gs);
    const nx = plannedOf(f.id).find(g => g.date && g.date >= todayStr());
    return `<button class="cell" data-action="subject" data-id="${f.id}">
      <span class="ico txt" style="background:${colorOf(f.color)}">${esc(f.short)}</span>
      <span class="main"><span class="title">${esc(f.name)}</span><span class="sub" style="display:block">${gs.length ? `${gs.length} ${gs.length === 1 ? 'Note' : 'Noten'} · Note ${fmtNote(a)}` : 'noch keine Noten'}${nx ? ` · <span class="exam-txt">${esc(relDay(nx.date))}: ${esc(nx.title || kindLabel(nx.kind))}</span>` : ''}</span></span>
      ${a === null ? '' : pBadge(a)}${chev}</button>`;
  }).join('');

  $('#page-school').innerHTML = `
    <div class="large-title"><h1>Schule</h1></div>
    ${schoolPicker()}

    <div class="section" style="margin-top:12px"><div class="hero">
      <div class="k">Notenschnitt</div>
      <div class="v" ${avg !== null ? `style="color:${pointColor(avg)}"` : ''}>${fmtP(avg)}<span class="unit"> Punkte</span></div>
      <div class="s">${avg === null ? 'Noch keine Noten in diesem Zeitraum. Tippe ein Fach an, um eine einzutragen.' : `Note ${fmtNote(avg)} · ${nGrades} ${nGrades === 1 ? 'Note' : 'Noten'} in ${withGrades.length} ${withGrades.length === 1 ? 'Fach' : 'Fächern'}`}</div>
    </div></div>

    ${section('Nächste Prüfungen', `<div class="group icons">${next.map(g => examRow(g)).join('')}${planLink()}</div>`, next.length ? 'Geplante Prüfungen stehen auch im Kalender der Übersicht.' : 'Geplante Prüfungen erscheinen hier und im Kalender der Übersicht.')}

    ${section('Fächer', `<div class="group icons">${rows}
      <button class="cell link" data-action="new-subject"><span class="ico" style="background:var(--tint)">${icon('plus')}</span><span class="main"><span class="title">Fach hinzufügen</span></span></button></div>`,
      'Punkte 15–0, Note = (17 − Punkte) ÷ 3. Schulaufgaben zählen standardmäßig doppelt; die Gewichtung ist bei jeder Note änderbar.')}

    ${overall.length > 1 ? section('Verlauf', `<div class="group chart-wrap">${lineChart([{ pts: overall, color: 'var(--tint)', dots: true }])}</div>`, 'Gesamtschnitt nach jeder eingetragenen Note; jedes Fach zählt gleich.') : ''}

    ${section('Stundenplan', nextDayGroup() + scheduleRows())}
  `;
}

function renderForecast() {
  const m = faModel();
  const realFn = faReal(m);
  const now = faTotal(m, realFn);
  const minE = faMinE();
  const T = faTarget();
  const nOpen = m.exams.filter(isOpenItem).length + m.hjs.filter(h => h.isOpen).length;
  const needAll = nOpen ? faNeed(m, isOpenItem) : null;
  const ok = faReached(now.E);
  const note = faNote(now.E);

  const examRows = m.exams.map(e => {
    const f = subjById(e.sid);
    const written = e.g && !e.g.planned;
    const need = e.fixed === null ? faNeed(m, it => it === e) : null;
    return `<button class="cell" ${e.g ? `data-action="edit-grade" data-id="${e.g.id}"` : `data-action="subject" data-id="${f.id}"`}>
      <span class="ico txt" style="background:${colorOf(f.color)}">${esc(f.short)}</span>
      <span class="main"><span class="title">${esc(f.name)}</span>
        <span class="sub" style="display:block">${e.fixed !== null ? `${written ? 'Geschrieben' : 'Prognose'}: ${e.fixed} P (${POINT_NOTES[e.fixed]})` : `offen · bisher ${fmtP(m.level[e.sid])} P im Fach`}${e.g && e.g.date ? ' · ' + esc(dayMed(e.g.date)) : ''}</span></span>
      ${e.fixed !== null ? pBadge(e.fixed) : needBadge(need)}${chev}</button>`;
  }).join('');

  const hjRows = m.subs.filter(f => m.hjs.some(h => h.sid === f.id)).sort((a, b) => a.name.localeCompare(b.name, 'de')).map(f => {
    const hs = m.hjs.filter(h => h.sid === f.id);
    const anyOpen = hs.some(h => h.isOpen);
    const need = anyOpen ? faNeed(m, it => 'term' in it && it.sid === f.id && it.isOpen) : null;
    const chips = ABI_TERMS.map(t => {
      const h = hs.find(x => x.term === t);
      if (!h) return `<span class="hj none">${termLabel(t)} –</span>`;
      const v = h.isOpen ? null : hjValue(h, 0);
      return `<span class="hj ${now.used.has(h) ? '' : 'drop'} ${h.isOpen ? 'open' : ''}">${termLabel(t)} <b>${v === null ? '?' : v}</b></span>`;
    }).join('');
    return `<button class="cell" data-action="subject" data-id="${f.id}">
      <span class="ico txt" style="background:${colorOf(f.color)}">${esc(f.short)}</span>
      <span class="main"><span class="title">${esc(f.name)}${f.abi ? ' <span class="abi-tag">Prüfung</span>' : ''}</span><span class="hjs">${chips}</span></span>
      ${anyOpen ? needBadge(need) : ''}${chev}</button>`;
  }).join('');

  const upcoming = db.school.grades.filter(g => g.planned && g.kind !== 'ap').sort(byDate);
  const fpa = fc().fpa || [null, null];
  const y12 = +db.school.year11 + 1;
  const pts = (v, max) => `<span class="detail num">${v} / ${max}</span>`;

  $('#page-school').innerHTML = `
    <div class="large-title"><h1>Schule</h1></div>
    ${schoolPicker()}

    <div class="section" style="margin-top:12px"><div class="hero">
      <div class="k">Fachabi-Prognose</div>
      <div class="v" style="color:${ok ? 'var(--c-green)' : 'var(--c-orange)'}">${fmt1(note)}<span class="unit"> · ${now.E} von ${FA_MAX} P</span></div>
      <div class="s">${ok ? `Ziel ${fmt1(T)} erreicht` : `Für ${fmt1(T)} fehlen ${minE === null ? '–' : minE - now.E} Punkte`} (nötig: ${minE ?? '–'} P), wenn alles so weiterläuft wie bisher.
        ${nOpen ? `<br><b>${needAll === null ? `${fmt1(T)} ist nicht mehr erreichbar.` : needAll === 0 ? `${fmt1(T)} ist schon sicher.` : `Für ${fmt1(T)} brauchst du in allen offenen Prüfungen und Halbjahren mindestens ${needAll} P (${POINT_NOTES[needAll]}).`}</b>` : ''}</div>
    </div></div>

    ${section('Punkte', `<div class="group">
      <div class="cell"><span class="main"><span class="title">Abschlussprüfungen</span><span class="sub" style="display:block">${m.exams.length} Fächer, je dreifach</span></span>${pts(now.ex, 180)}</div>
      <div class="cell"><span class="main"><span class="title">Halbjahresleistungen</span><span class="sub" style="display:block">die besten 25 aus 11/2, 12/1, 12/2${now.missing ? ` · ${now.missing} fehlen, geschätzt` : ''}</span></span>${pts(now.hj, 375)}</div>
      <div class="cell"><span class="main"><span class="title">Fachpraktische Ausbildung</span><span class="sub" style="display:block">${fpa.some(v => v === null || v === '') ? 'noch nicht eingetragen, geschätzt' : '2 Halbjahre'}</span></span>${pts(now.fpa, 30)}</div>
      <div class="cell"><span class="main"><span class="title" style="font-weight:600">Gesamt</span></span>${pts(now.E, FA_MAX)}</div>
    </div>`, `Note = 17/3 − 5 · Punkte / 585, auf eine Stelle abgeschnitten. Für ${fmt1(T)} reichen ${minE ?? '–'} Punkte (Schnitt über ${fmt1(17 - 3 * (T + 0.1))} P je Einheit; genau ${fmt1(T)} = ${fmt1(17 - 3 * T)} P).`)}

    ${m.exams.length ? section('Abschlussprüfungen', `<div class="group icons">${examRows}</div>`, 'Rechts: Mindestpunkte in der Prüfung für dein Ziel, wenn alles andere so weiterläuft wie bisher. Tippe eine Prüfung an, um eine Prognose oder das Ergebnis einzutragen.') : ''}

    ${section('Halbjahresleistungen', `<div class="group icons">${hjRows}</div>`, 'Halbjahresergebnis = Schnitt im Halbjahr, ab ,5 aufgerundet. ? = noch offen. Durchgestrichen = wird nicht eingebracht (je Fach fällt höchstens ein Halbjahr weg, die besten 25 zählen). Rechts: Mindestpunkte in den offenen Halbjahren des Fachs. Sport zählt nicht.')}

    ${section('Geplante Prüfungen', `<div class="group icons">${upcoming.map(g => examRow(g)).join('')}${planLink()}</div>`, 'Ohne Prognose sind sie offen; dann rechnet die App aus, was du brauchst.')}

    ${section('Rechnung', `<div class="group">
      <label class="cell field"><span>Zielnote</span><input type="text" inputmode="decimal" data-fc="target" value="${fmt1(T)}" autocomplete="off"></label>
      <label class="cell"><span class="main"><span class="title">Ohne Abschneiden rechnen</span><span class="sub" style="display:block">genau ${fmt1(T)} statt „alles unter ${fmt1(T + 0.1)}“</span></span><span class="switch"><input type="checkbox" data-fc="exact" ${fc().exact ? 'checked' : ''}><i></i></span></label>
      <label class="cell field"><span>fpA 11/1</span><input type="text" inputmode="numeric" data-fc="fpa0" value="${fpa[0] ?? ''}" placeholder="Punkte" autocomplete="off"></label>
      <label class="cell field"><span>fpA 11/2</span><input type="text" inputmode="numeric" data-fc="fpa1" value="${fpa[1] ?? ''}" placeholder="Punkte" autocomplete="off"></label>
      <label class="cell field"><span>12. Klasse</span><select data-fc="year12">${[y12 - 1, y12, y12 + 1].map(v => `<option value="${v}" ${v === y12 ? 'selected' : ''}>Schuljahr ${v}/${String(v + 1).slice(2)}</option>`).join('')}</select></label>
    </div>`, 'Nach FOBOSO § 35 und Anlage 4: 4 Prüfungen je dreifach, 25 Halbjahresergebnisse und die fachpraktische Ausbildung (fpA), zusammen höchstens 585 Punkte. Die mündliche Prüfung ist nicht eingerechnet. Ohne fpA-Punkte rechnet die App mit deinem bisherigen Schnitt.')}
  `;
}

function subjectSheet(id) {
  const f = subjById(id);
  if (!f) { closeSheet(); return; }
  const prog = ui.schoolView === 'prog';
  const terms = viewOf(ui.schoolView).terms;
  const gs = gradesOf(id, terms);
  const a = wavg(gs);
  const running = gs.map((g, i) => ({ x: g.date, y: wavg(gs.slice(0, i + 1)) }));
  const plan = plannedOf(id);
  const gradeRow = g => `<button class="cell" data-action="edit-grade" data-id="${g.id}">
      ${pBadge(g.points)}
      <span class="main"><span class="title">${esc(g.title || kindLabel(g.kind))}</span>
      <span class="sub" style="display:block">${g.date ? esc(dayMed(g.date)) + ' · ' : ''}${terms.length > 1 ? esc(termLabel(g.term)) + ' · ' : ''}${g.title ? esc(kindLabel(g.kind)) + ' · ' : ''}×${deNum(g.weight)} · Note ${POINT_NOTES[g.points]}</span></span>${chev}</button>`;

  let fa = '';
  if (prog && !isSport(f)) {
    const m = faModel();
    const now = faTotal(m, faReal(m));
    const hs = m.hjs.filter(h => h.sid === id);
    const e = m.exams.find(x => x.sid === id);
    const needHJ = hs.some(h => h.isOpen) ? faNeed(m, it => 'term' in it && it.sid === id && it.isOpen) : undefined;
    const needEx = e && e.fixed === null ? faNeed(m, it => it === e) : undefined;
    fa = section('Fürs Fachabi', `<div class="group">
      ${hs.map(h => `<div class="cell"><span class="main"><span class="title">${termLong(h.term)}</span><span class="sub" style="display:block">${h.isOpen ? 'noch offen' : now.used.has(h) ? 'wird eingebracht' : 'wird gestrichen'}</span></span>${h.isOpen ? '<span class="pbadge num open">?</span>' : pBadge(hjValue(h, 0))}</div>`).join('')}
      ${e ? `<div class="cell"><span class="main"><span class="title">Abschlussprüfung</span><span class="sub" style="display:block">zählt dreifach</span></span>${e.fixed === null ? '<span class="pbadge num open">?</span>' : pBadge(e.fixed)}</div>` : ''}
    </div>`, [needEx !== undefined ? `Für ${fmt1(faTarget())} brauchst du in der Prüfung ${needEx === null ? 'mehr als 15 P – nicht erreichbar' : needEx === 0 ? 'nichts mehr, das Ziel ist sicher' : `mindestens ${needEx} P (${POINT_NOTES[needEx]})`}.` : '',
      needHJ !== undefined ? `In den offenen Halbjahren brauchst du ${needHJ === null ? 'mehr als 15 P' : needHJ === 0 ? 'nichts mehr' : `mindestens ${needHJ} P`}.` : '', 'Annahme: alles andere läuft so weiter wie bisher.'].filter(Boolean).join(' '));
  }

  openSheet({
    title: f.name,
    left: null,
    right: { label: 'Fertig', action: 'close' },
    ctx: 'subject:' + id,
    body: `
      <div class="section" style="margin-top:8px"><div class="stats sheet-stats">
        <div><div class="k">Schnitt</div><div class="v" style="color:${pointColor(a)}">${fmtP(a)}</div></div>
        <div><div class="k">Note</div><div class="v">${fmtNote(a)}</div></div>
        <div><div class="k">Noten</div><div class="v">${gs.length}</div></div>
      </div><div class="section-foot">${esc(prog ? 'Fachabi-Halbjahre 11/2, 12/1, 12/2' : viewName(ui.schoolView))}</div></div>
      ${fa}
      ${section('Prüfungen', `<div class="group icons">${plan.map(g => examRow(g, false)).join('')}${planLink(id)}</div>`)}
      ${gs.length > 1 ? section('Verlauf', `<div class="group chart-wrap">${lineChart([
        { pts: running, color: 'var(--label2)', dashed: true },
        { pts: gs.map(g => ({ x: g.date, y: g.points, r: 3 + Math.min(3, g.weight) })), color: colorOf(f.color), dots: true },
      ])}</div>`, 'Punkte: einzelne Noten (größer = stärker gewichtet); gestrichelt der gewichtete Schnitt.') : ''}
      ${section('Noten', `<div class="group">${[...gs].reverse().map(gradeRow).join('')}
        <button class="cell link" data-action="new-grade" data-id="${id}"><span class="main"><span class="title">Note hinzufügen</span></span></button></div>`)}
      ${section('', `<div class="group"><button class="cell" data-action="edit-subject" data-id="${id}"><span class="main"><span class="title">Fach bearbeiten</span></span><span class="detail">${esc(f.short)}</span>${chev}</button></div>`)}
    `,
  });
}

/* Note (Punkte zuerst) oder geplante Prüfung (Fach, Art, Datum zuerst, Prognose optional am Ende) */
function gradeSheet(g, sid, planned = false) {
  const isNew = !g;
  const vTerms = viewOf(ui.schoolView).terms;
  const cur = termOf(todayStr());
  const defTerm = vTerms.includes(cur) ? cur : vTerms[vTerms.length - 1];
  const x = g || { subjectId: sid || null, points: null, kind: 'sa', weight: kindWeight('sa'), date: planned ? '' : todayStr(), title: '', term: planned ? cur : defTerm, planned };
  const isPlan = !!x.planned;
  const isAbi = x.kind === 'ap';
  const f = subjById(x.subjectId);
  const pts = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  const what = isPlan ? 'Prüfung' : 'Note';
  const pointsGrid = `<div class="points-grid">${isPlan ? `<label class="open" style="--pc:var(--c-gray)"><input type="radio" name="points" value="" ${isOpen(x) ? 'checked' : ''}><b>?</b><small>offen</small></label>` : ''}${pts.map(p => `<label style="--pc:${pointColor(p)}"><input type="radio" name="points" value="${p}" ${p === x.points ? 'checked' : ''} ${isPlan ? '' : 'required'}><b>${p}</b><small>${POINT_NOTES[p]}</small></label>`).join('')}</div>`;
  const kinds = `<div class="kind-grid">${GRADE_KINDS.filter(([k]) => !isPlan || k !== 'm').map(([k, label]) => `<label><input type="radio" name="kind" value="${k}" ${k === x.kind ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div>`;
  const weightCtl = isPlan
    ? `<div class="cell field"><span>Gewichtung</span><div class="segmented w-seg">${[0.5, 1, 1.5, 2].map(w => `<label><input type="radio" name="weight" value="${w}" ${Math.abs(w - Math.min(2, Math.max(0.5, x.weight))) < 1e-9 ? 'checked' : ''}><span class="txt">×${deNum(w)}</span></label>`).join('')}</div></div>`
    : `<label class="cell field"><span>Gewichtung</span><input type="text" inputmode="decimal" name="weight" value="${deNum(x.weight)}" required></label>
       <div class="cell" style="padding-top:4px;padding-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">${[0.5, 1, 2, 3].map(w => `<button type="button" class="chip" data-action="weight-chip" data-w="${w}">×${deNum(w)}</button>`).join('')}</div></div>`;
  const details = `<div class="group">
      ${f ? '' : `<label class="cell field"><span>Fach</span><select name="subjectId" required>${subjectsSorted().map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>`}
      <label class="cell field"><span>Datum</span><input type="date" name="date" value="${x.date || ''}" ${isPlan ? '' : 'required'}></label>
      <label class="cell field ${isAbi ? 'hide' : ''}"><span>Halbjahr</span><select name="term">${TERMS.map(([k, , l]) => `<option value="${k}" ${k === x.term ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      ${isAbi ? '<input type="hidden" name="weight" value="2">' : weightCtl}
      <label class="cell field"><span>Bezeichnung</span><input type="text" name="title" value="${esc(x.title)}" placeholder="optional, z. B. 2. SA" autocomplete="off"></label>
    </div>`;
  openSheet({
    title: `${isNew ? (isPlan ? 'Prüfung planen' : 'Neue Note') : what}${f ? ' · ' + f.short : ''}`,
    right: { label: isNew ? 'Hinzufügen' : 'Sichern' },
    ctx: f ? 'subject:' + f.id : null,
    body: `<form id="sheet-form" data-form="grade" data-id="${isNew ? '' : x.id}" data-subject="${f ? f.id : ''}" data-planned="${isPlan ? 1 : ''}">
      ${isPlan
        ? `${section('Art', kinds)}
           ${section('', details, isAbi ? 'Die Abschlussprüfung zählt im Fachabi dreifach.' : 'Das Halbjahr richtet sich nach dem Datum. Gewichtung 0,5 bis 2,0. Mit Datum steht die Prüfung im Kalender.')}
           ${section('Prognose', pointsGrid, 'Offen lassen, wenn die App ausrechnen soll, was du brauchst. Mit Punkten rechnet sie mit deiner Schätzung.')}`
        : `${section('Punkte', pointsGrid)}
           ${section('Art', kinds)}
           ${section('', details, 'Die Gewichtung ist der Faktor im Fachschnitt: Eine Note mit ×2 zählt doppelt so viel wie eine mit ×1.')}`}
      ${isPlan && !isNew ? section('', `<div class="group"><button type="button" class="cell link center" data-action="plan-to-grade" data-id="${x.id}"><span class="title">Geschrieben – Ergebnis eintragen</span></button></div>`) : ''}
      ${isNew ? '' : section('', `<div class="group"><button type="button" class="cell danger center" data-action="delete-grade" data-id="${x.id}"><span class="title">${what} löschen</span></button></div>`)}
    </form>`,
  });
}

function subjectEditSheet(f) {
  const isNew = !f;
  const x = f || { short: '', name: '', color: COLORS[db.school.subjects.length % COLORS.length] };
  const back = ui.sheetCtx && ui.sheetCtx.startsWith('subject:') ? ui.sheetCtx : null;
  openSheet({
    title: isNew ? 'Neues Fach' : 'Fach bearbeiten',
    right: { label: isNew ? 'Hinzufügen' : 'Sichern' },
    ctx: back,
    body: `<form id="sheet-form" data-form="subject" data-id="${isNew ? '' : x.id}">
      ${section('', `<div class="group">
        <label class="cell field"><input class="left" type="text" name="name" value="${esc(x.name)}" placeholder="Name, z. B. Mathematik" required autocomplete="off"></label>
        <label class="cell field"><span>Kürzel</span><input type="text" name="short" value="${esc(x.short)}" placeholder="M" maxlength="6" required autocomplete="off"></label>
      </div>`, isNew ? '' : 'Das Kürzel verbindet das Fach mit dem Stundenplan; eine Änderung gilt auch dort.')}
      ${section('', `<div class="group"><label class="cell"><span class="main"><span class="title">Fachabi-Prüfungsfach</span></span><span class="switch"><input type="checkbox" name="abi" ${x.abi ? 'checked' : ''}><i></i></span></label></div>`, 'Legt in der Vorhersage eine offene Abschlussprüfung (×2) an.')}
      ${section('Farbe', `<div class="group"><div class="swatches">
        ${COLORS.map(c => `<button type="button" class="swatch ${c === x.color ? 'on' : ''}" style="background:${colorOf(c)}" data-action="pick-color" data-color="${c}" aria-label="${c}"></button>`).join('')}
      </div></div><input type="hidden" name="color" value="${esc(x.color)}">`)}
      ${isNew ? '' : section('', `<div class="group"><button type="button" class="cell danger center" data-action="delete-subject" data-id="${x.id}"><span class="title">Fach löschen</span></button></div>`)}
    </form>`,
  });
}

function scheduleSheet(day = ui.schedDay || 1) {
  ui.schedDay = day;
  const lessons = db.school.lessons.filter(l => l.day === day).sort((a, b) => a.start.localeCompare(b.start));
  openSheet({
    title: 'Stundenplan',
    left: null,
    right: { label: 'Fertig', action: 'close' },
    ctx: 'schedule',
    body: `
      <div class="segmented" style="margin-top:8px">${[1, 2, 3, 4, 5].map(d => `<label><input type="radio" name="sched-day" value="${d}" ${d === day ? 'checked' : ''}><span class="txt">${WEEKDAYS[d - 1]}</span></label>`).join('')}</div>
      ${section(WEEKDAY_LONG[day - 1], `<div class="group">${lessons.map(l => lessonCell(l)).join('') || '<div class="empty">Kein Unterricht.</div>'}
        <button class="cell link" data-action="new-lesson" data-day="${day}"><span class="main"><span class="title">Stunde hinzufügen</span></span></button></div>`)}
      ${section('Gültigkeit', `<div class="group">
        <label class="cell field"><span>Gilt ab</span><input type="date" data-school="validFrom" value="${db.school.validFrom || ''}"></label>
        <label class="cell field"><span>Gilt bis</span><input type="date" data-school="validTo" value="${db.school.validTo || ''}"></label>
      </div>`, 'Der Plan wiederholt sich jede Woche. Leer lassen, wenn er unbegrenzt gilt; Ferien trägst du in der Übersicht unter „Ferien und freie Tage“ ein.')}
    `,
  });
}

function lessonSheet(l, day) {
  const isNew = !l;
  const x = l || { subject: '', teacher: '', room: '', note: '', start: '', end: '', day };
  openSheet({
    title: isNew ? 'Neue Stunde' : 'Stunde',
    right: { label: isNew ? 'Hinzufügen' : 'Sichern' },
    ctx: ui.sheetCtx === 'schedule' ? 'schedule' : null,
    body: `<form id="sheet-form" data-form="lesson" data-id="${isNew ? '' : x.id}">
      ${section('', `<div class="group"><label class="cell field"><input class="left" type="text" name="subject" value="${esc(x.subject)}" placeholder="Fach, z. B. M" required autocomplete="off"></label></div>`)}
      <div class="segmented" style="margin-top:16px">${[1, 2, 3, 4, 5].map(d => `<label><input type="radio" name="day" value="${d}" ${d === x.day ? 'checked' : ''}><span class="txt">${WEEKDAYS[d - 1]}</span></label>`).join('')}</div>
      ${section('Zeit', `<div class="group">
        <div class="cell" style="padding-top:12px;padding-bottom:12px"><div style="display:flex;gap:8px;flex-wrap:wrap">${SLOTS.map(([n, s, e]) => `<button type="button" class="chip" data-action="slot" data-s="${s}" data-e="${e}">${n}</button>`).join('')}</div></div>
        <label class="cell field"><span>Beginn</span><input type="time" name="start" value="${x.start}" required></label>
        <label class="cell field"><span>Ende</span><input type="time" name="end" value="${x.end}" required></label>
      </div>`)}
      ${section('', `<div class="group">
        <label class="cell field"><span>Raum</span><input type="text" name="room" value="${esc(x.room)}" placeholder="F108" autocomplete="off"></label>
        <label class="cell field"><span>Lehrkraft</span><input type="text" name="teacher" value="${esc(x.teacher)}" placeholder="Kürzel" autocomplete="off"></label>
        <label class="cell field"><span>Notiz</span><input type="text" name="note" value="${esc(x.note)}" placeholder="optional" autocomplete="off"></label>
      </div>`)}
      ${isNew ? '' : section('', `<div class="group"><button type="button" class="cell danger center" data-action="delete-lesson" data-id="${x.id}"><span class="title">Stunde löschen</span></button></div>`)}
    </form>`,
  });
}

function holidaysSheet() {
  const rows = [...db.school.holidays].sort((a, b) => a.from.localeCompare(b.from)).map(h => `<button class="cell" data-action="edit-holiday" data-id="${h.id}">
      <span class="main"><span class="title">${esc(h.name || 'Frei')}</span>
      <span class="sub" style="display:block">${esc(dayMed(h.from))}${h.to && h.to !== h.from ? ' – ' + esc(dayMed(h.to)) : ''}</span></span>${chev}</button>`).join('');
  openSheet({
    title: 'Ferien und freie Tage',
    left: null,
    right: { label: 'Fertig', action: 'close' },
    ctx: 'holidays',
    body: section('', `<div class="group">${rows}
      <button class="cell link" data-action="new-holiday"><span class="main"><span class="title">Freie Tage hinzufügen</span></span></button></div>`,
      'An diesen Tagen erscheint kein Unterricht im Kalender und im Export.'),
  });
}

function holidaySheet(h) {
  const isNew = !h;
  const x = h || { name: '', from: '', to: '' };
  openSheet({
    title: isNew ? 'Freie Tage' : (x.name || 'Freie Tage'),
    right: { label: isNew ? 'Hinzufügen' : 'Sichern' },
    ctx: 'holidays',
    body: `<form id="sheet-form" data-form="holiday" data-id="${isNew ? '' : x.id}">
      ${section('', `<div class="group">
        <label class="cell field"><input class="left" type="text" name="name" value="${esc(x.name)}" placeholder="z. B. Weihnachtsferien" autocomplete="off"></label>
        <label class="cell field"><span>Von</span><input type="date" name="from" value="${x.from}" required></label>
        <label class="cell field"><span>Bis</span><input type="date" name="to" value="${x.to}"></label>
      </div>`, 'Für einen einzelnen Tag „Bis“ leer lassen.')}
      ${isNew ? '' : section('', `<div class="group"><button type="button" class="cell danger center" data-action="delete-holiday" data-id="${x.id}"><span class="title">Löschen</span></button></div>`)}
    </form>`,
  });
}

/* Stundenplan als .ics (wöchentliche Serien, Ferien als Ausnahmen) für Apple Kalender */
function exportIcs() {
  const sc = db.school;
  const now = new Date();
  const monday = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weekdayOf(todayStr()) - 1)));
  const base = sc.validFrom || monday;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const txt = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const fold = line => { const out = []; let s = line; while (s.length > 60) { out.push(s.slice(0, 60)); s = ' ' + s.slice(60); } out.push(s); return out.join('\r\n'); };
  const dt = (ds, t) => `${ds.replace(/-/g, '')}T${t.replace(':', '')}00`;
  const addDays = (ds, n) => { const d = parseYmd(ds); d.setDate(d.getDate() + n); return ymd(d); };

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Severin Organizer//Stundenplan//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Schule', 'X-WR-TIMEZONE:Europe/Berlin',
    'BEGIN:VTIMEZONE', 'TZID:Europe/Berlin',
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
    'END:VTIMEZONE'];

  sc.lessons.forEach(l => {
    let first = base;
    while (weekdayOf(first) !== l.day) first = addDays(first, 1);
    if (sc.validTo && first > sc.validTo) return;
    const ex = [];
    sc.holidays.forEach(h => {
      for (let d = h.from, i = 0; d <= (h.to || h.from) && i < 400; d = addDays(d, 1), i++) {
        if (d >= first && weekdayOf(d) === l.day) ex.push(dt(d, l.start));
      }
    });
    lines.push('BEGIN:VEVENT', `UID:${l.id}@severin-organizer`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Berlin:${dt(first, l.start)}`, `DTEND;TZID=Europe/Berlin:${dt(first, l.end)}`,
      `RRULE:FREQ=WEEKLY${sc.validTo ? ';UNTIL=' + sc.validTo.replace(/-/g, '') + 'T225959Z' : ''}`,
      ...(ex.length ? [`EXDATE;TZID=Europe/Berlin:${ex.join(',')}`] : []),
      `SUMMARY:${txt(l.subject)}`, ...(l.room ? [`LOCATION:${txt(l.room)}`] : []),
      `DESCRIPTION:${txt([l.teacher && 'Lehrkraft: ' + l.teacher, l.note].filter(Boolean).join('\n'))}`,
      'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  const file = new File([lines.map(fold).join('\r\n') + '\r\n'], 'stundenplan.ics', { type: 'text/calendar' });
  shareOrDownload(file, 'Stundenplan');
}

/* ---------- Sperre per Face ID / Touch ID (WebAuthn-Passkey) ----------
   Sichtschutz: Die Daten bleiben unverschlüsselt im localStorage. */

const LOCK_KEY = STORE_KEY + ':lock';
const lockState = { locked: false, busy: false, hiddenAt: 0 };
function lockCred() { try { return localStorage.getItem(LOCK_KEY); } catch (e) { return null; } }
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => { const b = s.replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(b + '='.repeat((4 - b.length % 4) % 4)), c => c.charCodeAt(0)); };
function bioName() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'Face ID';
  if (/Macintosh/.test(ua)) return 'Touch ID';
  return 'Gerätesperre';
}

async function checkLockAvail() {
  try { ui.lockAvail = !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); }
  catch (e) { ui.lockAvail = false; }
  if (ui.page === 'home' && !lockState.locked) render();
}

async function enableLock() {
  const cred = await navigator.credentials.create({ publicKey: {
    rp: { name: 'Severin Organizer' },
    user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'Severin Organizer', displayName: 'Severin Organizer' },
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
    attestation: 'none',
    timeout: 60000,
  } });
  localStorage.setItem(LOCK_KEY, b64u(cred.rawId));
}

async function verifyUser() {
  const id = lockCred();
  if (!id) return true;
  try {
    await navigator.credentials.get({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type: 'public-key', id: unb64u(id), transports: ['internal'] }],
      userVerification: 'required',
      timeout: 60000,
    } });
    return true;
  } catch (e) {
    return false;
  }
}

function showLock() {
  lockState.locked = true;
  $('#sheet-overlay').hidden = true; $('#sheet').innerHTML = ''; document.body.style.overflow = '';
  $('#lock .lock-msg').textContent = '';
  $('#lock .lock-btn').textContent = `Mit ${bioName()} entsperren`;
  $('#lock').hidden = false;
  document.body.classList.add('locked');
}

async function unlockFlow(auto = false) {
  if (lockState.busy) return;
  lockState.busy = true;
  const ok = await verifyUser();
  lockState.busy = false;
  if (ok) {
    lockState.locked = false;
    $('#lock').hidden = true;
    document.body.classList.remove('locked');
    render(); onScroll();
  } else if (!auto) {
    $('#lock .lock-msg').textContent = 'Nicht erkannt. Versuch es noch einmal.';
  }
}

document.addEventListener('visibilitychange', () => {
  if (!lockCred()) return;
  if (document.hidden) { lockState.hiddenAt = Date.now(); document.body.classList.add('privacy'); }
  else {
    document.body.classList.remove('privacy');
    if (!lockState.locked && Date.now() - lockState.hiddenAt > 60000) showLock();
  }
});

function securitySection() {
  const cred = lockCred();
  const name = bioName();
  if (ui.lockAvail === false && !cred) {
    return section('Sicherheit', `<div class="group icons"><div class="cell"><span class="ico" style="background:var(--c-gray)">${icon('lock')}</span>
      <span class="main"><span class="title">Sperre</span><span class="sub" style="display:block">In diesem Browser nicht verfügbar.</span></span></div></div>`);
  }
  return section('Sicherheit', `<div class="group icons"><label class="cell"><span class="ico" style="background:var(--c-green)">${icon('lock')}</span>
      <span class="main"><span class="title">Mit ${name} sperren</span></span>
      <span class="switch"><input type="checkbox" data-action="toggle-lock" ${cred ? 'checked' : ''}><i></i></span></label></div>`,
    `Beim Öffnen und nach einer Minute im Hintergrund fragt die App nach ${name}. Das ist ein Sichtschutz – die Daten selbst liegen weiterhin unverschlüsselt auf diesem Gerät.`);
}

/* ---------- Seite 3: To-dos & Notizen ---------- */

function todoCell(x, inSheet = false) {
  return `<div class="cell ${x.done ? 'done' : ''}">
    <button class="ring ${x.done ? 'on' : ''}" data-action="toggle-todo" data-id="${x.id}" aria-label="${x.done ? 'Wieder öffnen' : 'Erledigt'}"></button>
    <button class="main" style="text-align:left" data-action="edit-todo" data-id="${x.id}" ${inSheet ? 'data-from="sheet"' : ''}>
      <div class="title">${esc(x.text)}</div>${dueLine(x.date, x.done)}</button></div>`;
}

function renderTodos() {
  $('#nav-todos').innerHTML = '';
  const open = db.todos.filter(x => !x.done).sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date) || a.created - b.created;
    if (a.date) return -1;
    if (b.date) return 1;
    return a.created - b.created;
  });
  const done = db.todos.filter(x => x.done).sort((a, b) => b.created - a.created);
  const notes = [...db.notes].sort((a, b) => (b.updated || b.created) - (a.updated || a.created)).map(n => {
    const [first, ...rest] = n.text.split('\n');
    const when = new Date(n.updated || n.created);
    const isToday = ymd(when) === todayStr();
    const stamp = isToday ? when.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : when.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `<button class="cell note-cell" data-action="edit-note" data-id="${n.id}"><span class="main">
      <span class="title" style="display:block">${esc(first)}</span>
      <span class="sub" style="display:block">${esc(stamp)}  ${esc(rest.join(' ').trim() || 'Kein weiterer Text')}</span></span>${chev}</button>`;
  }).join('');

  $('#page-todos').innerHTML = `
    <div class="large-title"><h1>To-dos</h1></div>

    <div class="section" style="margin-top:12px"><form class="group" data-form="todo">
      <div class="cell add-row">
        <span class="ring" style="opacity:.5"></span>
        <input type="text" name="text" placeholder="Neues To-do" autocomplete="off" enterkeyhint="done">
        <label class="date-pill">${icon('cal')}<span class="txt">Datum</span><input type="date" name="date" aria-label="Datum"></label>
      </div>
    </form><div class="section-foot">Mit Datum erscheint das To-do im Kalender der Übersicht.</div></div>

    ${section(`<span>Offen</span><span>${open.length}</span>`, `<div class="group">${open.map(x => todoCell(x)).join('') || '<div class="empty">Alles erledigt.</div>'}</div>`)}

    ${done.length ? section(`<span>Erledigt · ${done.length}</span><button data-action="toggle-done">${ui.showDone ? 'Ausblenden' : 'Einblenden'}</button>`,
      ui.showDone ? `<div class="group">${done.map(x => todoCell(x)).join('')}
        <button class="cell danger center" data-action="clear-done"><span class="title">Erledigte löschen</span></button></div>` : '') : ''}

    ${section('Schnellnotizen', `<form class="group note-compose" data-form="note">
        <textarea name="text" placeholder="Gedanke, Idee, Nummer …" rows="3"></textarea>
        <div class="bar"><button class="btn-fill">Sichern</button></div>
      </form>
      ${notes ? `<div class="group" style="margin-top:12px">${notes}</div>` : ''}`)}
  `;
}

function todoSheet(x, fromSheet) {
  openSheet({
    title: 'Details',
    right: { label: 'Sichern' },
    body: `<form id="sheet-form" data-form="todo-edit" data-id="${x.id}" ${fromSheet ? 'data-back="1"' : ''}>
      ${section('', `<div class="group"><label class="cell field"><input class="left" type="text" name="text" value="${esc(x.text)}" required autocomplete="off"></label></div>`)}
      ${section('', `<div class="group icons">
        <label class="cell field"><span class="ico" style="background:var(--c-red)">${icon('cal')}</span><span class="main">Datum</span><input type="date" name="date" value="${x.date || ''}" style="max-width:170px"></label>
      </div>`, 'Leer lassen für ein To-do ohne Datum.')}
      ${section('', `<div class="group"><button type="button" class="cell danger center" data-action="delete-todo" data-id="${x.id}"><span class="title">To-do löschen</span></button></div>`)}
    </form>`,
  });
}

function noteSheet(n) {
  openSheet({
    title: 'Notiz',
    right: { label: 'Fertig' },
    body: `<form id="sheet-form" data-form="note-edit" data-id="${n.id}">
      ${section('', `<div class="group"><textarea class="full" name="text">${esc(n.text)}</textarea></div>`)}
      ${section('', `<div class="group">
        <button type="button" class="cell link center" data-action="note-to-todo" data-id="${n.id}"><span class="title">Als To-do übernehmen</span></button>
        <button type="button" class="cell danger center" data-action="delete-note" data-id="${n.id}"><span class="title">Notiz löschen</span></button></div>`)}
    </form>`,
  });
}

/* ---------- Sheets und Bestätigungen ---------- */

function openSheet({ title, left = 'Abbrechen', right = null, body, ctx = null }) {
  ui.sheetCtx = ctx;
  const ov = $('#sheet-overlay');
  const wasOpen = !ov.hidden && !ov.classList.contains('closing');
  const rightBtn = !right ? '<span></span>'
    : right.action ? `<button class="btn-tint r" data-action="${right.action}">${esc(right.label)}</button>`
    : `<button class="btn-tint r" type="submit" form="sheet-form">${esc(right.label)}</button>`;
  $('#sheet').innerHTML = `<div class="grabber"></div>
    <div class="sheet-head">${left ? `<button class="btn-tint l" data-action="close">${esc(left)}</button>` : '<span></span>'}<strong>${esc(title)}</strong>${rightBtn}</div>
    <div class="sheet-body">${body}</div>`;
  ov.classList.remove('closing');
  ov.hidden = false;
  $('#sheet').style.transform = '';
  if (!wasOpen) {
    document.body.style.overflow = 'hidden';
    const first = $('#sheet input[type=text]:not([value]), #sheet input[type=text][value=""]');
    if (first && window.matchMedia('(pointer: fine)').matches) setTimeout(() => first.focus(), 50);
  }
}

function closeSheet() {
  const ov = $('#sheet-overlay');
  ui.prefillStart = null;
  if (ov.hidden) return;
  ov.classList.add('closing');
  setTimeout(() => {
    if (!ov.classList.contains('closing')) return;
    ov.hidden = true; ov.classList.remove('closing'); $('#sheet').innerHTML = '';
    document.body.style.overflow = '';
  }, 210);
}

/* Aktionsblatt wie unter iOS; liefert true, wenn bestätigt */
function confirmAction({ title, message = '', label, destructive = true }) {
  return new Promise(resolve => {
    const ov = $('#alert-overlay');
    $('#alert').innerHTML = `<div class="grp"><div class="msg"><b>${esc(title)}</b>${esc(message)}</div>
      <button class="${destructive ? 'destructive' : ''}" data-r="1">${esc(label)}</button></div>
      <button class="cancel" data-r="0">Abbrechen</button>`;
    ov.classList.remove('closing');
    ov.hidden = false;
    const done = val => {
      ov.classList.add('closing');
      setTimeout(() => { ov.hidden = true; ov.classList.remove('closing'); }, 190);
      ov.onclick = null;
      resolve(val);
    };
    ov.onclick = e => {
      const b = e.target.closest('[data-r]');
      if (b) done(b.dataset.r === '1');
      else if (e.target === ov) done(false);
    };
  });
}

/* Sheet nach unten wegziehen */
(function sheetDrag() {
  let y0 = null, dy = 0;
  const sheet = $('#sheet');
  sheet.addEventListener('touchstart', e => {
    if (!e.target.closest('.grabber, .sheet-head') || e.target.closest('button')) return;
    y0 = e.touches[0].clientY; dy = 0; sheet.style.transition = 'none';
  }, { passive: true });
  sheet.addEventListener('touchmove', e => {
    if (y0 === null) return;
    dy = Math.max(0, e.touches[0].clientY - y0);
    sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener('touchend', () => {
    if (y0 === null) return;
    sheet.style.transition = 'transform .2s ease';
    if (dy > 110) closeSheet(); else sheet.style.transform = '';
    y0 = null;
  });
})();

/* ---------- Ereignisse ---------- */

document.addEventListener('click', async e => {
  if (e.target.id === 'sheet-overlay') { closeSheet(); return; }
  const nav = e.target.closest('[data-nav]');
  if (nav) { go(nav.dataset.nav); return; }
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, id, date } = el.dataset;

  switch (action) {
    case 'nav': go(el.dataset.page); break;
    case 'school-view': ui.schoolView = el.dataset.view; if (ui.page === 'school') { render(); window.scrollTo(0, 0); } else go('school'); break;
    case 'close': closeSheet(); break;

    case 'job-month': ui.jobMonth = +el.dataset.step === 0 ? firstOfMonth(new Date()) : addMonths(ui.jobMonth, +el.dataset.step); render(); break;
    case 'home-month': ui.homeMonth = +el.dataset.step === 0 ? firstOfMonth(new Date()) : addMonths(ui.homeMonth, +el.dataset.step); render(); break;

    case 'new-job': if (db.jobs.length < MAX_JOBS) jobSheet(null); break;
    case 'edit-job': jobSheet(jobById(id)); break;
    case 'pick-color':
      el.parentElement.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s === el));
      $('#sheet input[name=color]').value = el.dataset.color;
      break;
    case 'delete-job': {
      const j = jobById(id);
      const n = db.shifts.filter(s => s.jobId === id).length;
      if (!await confirmAction({ title: `„${j.name}“ löschen?`, message: n ? `Auch ${n} eingetragene ${n === 1 ? 'Schicht wird' : 'Schichten werden'} gelöscht.` : '', label: 'Job löschen' })) break;
      db.jobs = db.jobs.filter(x => x.id !== id);
      db.shifts = db.shifts.filter(s => s.jobId !== id);
      save(); closeSheet(); render(); break;
    }
    case 'edit-limit': limitSheet(); break;
    case 'job-day': jobDaySheet(date); break;
    case 'hour-chip': $('#sheet input[name=hours]').value = el.dataset.h; break;
    case 'delete-shift':
      db.shifts = db.shifts.filter(s => s.id !== id);
      save(); render(); jobDaySheet(date); break;

    case 'new-account': accountSheet(null); break;
    case 'edit-account': accountSheet(db.accounts.find(a => a.id === id)); break;
    case 'delete-account': {
      const a = db.accounts.find(x => x.id === id);
      if (!await confirmAction({ title: `„${a.name}“ löschen?`, label: 'Konto löschen' })) break;
      db.accounts = db.accounts.filter(x => x.id !== id);
      save(); closeSheet(); render(); break;
    }
    case 'home-day': homeDaySheet(date); break;
    case 'cal-step': {
      const st = +el.dataset.step;
      ui.calDate = st === 0 ? new Date() : addDays(ui.calDate, st * (ui.calView === 'week' ? 7 : 1));
      ui.tlScroll = null; render(); break;
    }
    case 'cal-pick':
      if (ui.calView === 'week') { ui.calView = 'day'; try { localStorage.setItem(STORE_KEY + ':calview', 'day'); } catch (er) { /* egal */ } }
      ui.calDate = parseYmd(date); render(); break;
    case 'tl-slot': {
      const r = el.getBoundingClientRect();
      const h = Math.max(0, Math.min(23, Math.floor((e.clientY - r.top) / HOUR_H)));
      ui.prefillStart = `${pad(h)}:00`;
      homeDaySheet(date); break;
    }

    case 'toggle-todo': {
      const x = db.todos.find(t => t.id === id);
      if (!x) break;
      x.done = !x.done;
      el.classList.toggle('on', x.done);
      save();
      const sheetOpen = !$('#sheet-overlay').hidden;
      setTimeout(() => { render(); if (sheetOpen && x.date) homeDaySheet(x.date); }, sheetOpen ? 0 : 280);
      break;
    }
    case 'edit-todo': todoSheet(db.todos.find(t => t.id === id), el.dataset.from === 'sheet'); break;
    case 'delete-todo':
      db.todos = db.todos.filter(t => t.id !== id);
      save(); closeSheet(); render(); break;
    case 'toggle-done': ui.showDone = !ui.showDone; render(); break;
    case 'clear-done': {
      const n = db.todos.filter(t => t.done).length;
      if (!await confirmAction({ title: n === 1 ? 'Erledigtes To-do löschen?' : `${n} erledigte To-dos löschen?`, label: 'Löschen' })) break;
      db.todos = db.todos.filter(t => !t.done);
      save(); render(); break;
    }

    case 'edit-note': noteSheet(db.notes.find(n => n.id === id)); break;
    case 'delete-note':
      if (!await confirmAction({ title: 'Notiz löschen?', label: 'Notiz löschen' })) break;
      db.notes = db.notes.filter(n => n.id !== id);
      save(); closeSheet(); render(); break;
    case 'note-to-todo': {
      const n = db.notes.find(x => x.id === id);
      db.todos.push({ id: uid(), text: n.text.split('\n')[0].slice(0, 200), done: false, date: null, created: Date.now() });
      save(); closeSheet(); go('todos'); break;
    }

    case 'schedule': scheduleSheet(); break;
    case 'new-lesson': lessonSheet(null, +el.dataset.day); break;
    case 'edit-lesson': lessonSheet(db.school.lessons.find(l => l.id === id)); break;
    case 'slot':
      $('#sheet input[name=start]').value = el.dataset.s;
      $('#sheet input[name=end]').value = el.dataset.e;
      break;
    case 'delete-lesson': {
      const l = db.school.lessons.find(x => x.id === id);
      if (!await confirmAction({ title: `${l.subject} am ${WEEKDAY_LONG[l.day - 1]} löschen?`, label: 'Stunde löschen' })) break;
      db.school.lessons = db.school.lessons.filter(x => x.id !== id);
      save(); render();
      if (ui.sheetCtx === 'schedule') scheduleSheet(l.day); else closeSheet();
      break;
    }
    case 'holidays': holidaysSheet(); break;
    case 'new-holiday': holidaySheet(null); break;
    case 'edit-holiday': holidaySheet(db.school.holidays.find(h => h.id === id)); break;
    case 'delete-holiday':
      db.school.holidays = db.school.holidays.filter(h => h.id !== id);
      save(); render(); holidaysSheet(); break;
    case 'export-ics': exportIcs(); break;

    case 'toggle-lock': {
      e.preventDefault();
      if (lockCred()) {
        if (!await confirmAction({ title: `${bioName()}-Sperre ausschalten?`, label: 'Ausschalten' })) break;
        if (!await verifyUser()) break;
        try { localStorage.removeItem(LOCK_KEY); } catch (err) { /* egal */ }
      } else {
        try { await enableLock(); }
        catch (err) {
          if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
            await confirmAction({ title: 'Sperre konnte nicht eingerichtet werden', message: err.message, label: 'OK', destructive: false });
          }
        }
      }
      render(); break;
    }
    case 'lock-now': showLock(); break;
    case 'unlock': unlockFlow(); break;

    case 'subject': subjectSheet(id); break;
    case 'new-subject': subjectEditSheet(null); break;
    case 'edit-subject': subjectEditSheet(subjById(id)); break;
    case 'delete-subject': {
      const f = subjById(id);
      const n = gradesOf(id).length;
      if (!await confirmAction({ title: `„${f.name}“ löschen?`, message: n ? `Auch ${n} ${n === 1 ? 'Note wird' : 'Noten werden'} gelöscht. Der Stundenplan bleibt.` : 'Der Stundenplan bleibt.', label: 'Fach löschen' })) break;
      db.school.subjects = db.school.subjects.filter(x => x.id !== id);
      db.school.grades = db.school.grades.filter(g => g.subjectId !== id);
      save(); closeSheet(); render(); break;
    }
    case 'new-grade': gradeSheet(null, id); break;
    case 'new-planned':
      if (!db.school.subjects.length) { subjectEditSheet(null); break; }
      gradeSheet(null, id || null, true); break;
    case 'plan-to-grade': {
      const g = db.school.grades.find(x => x.id === id);
      if (g) gradeSheet({ ...g, planned: false, date: g.date || todayStr(), term: termOf(g.date || todayStr()), points: isOpen(g) ? null : g.points });
      break;
    }
    case 'edit-grade': gradeSheet(db.school.grades.find(g => g.id === id)); break;
    case 'weight-chip': $('#sheet input[name=weight]').value = deNum(el.dataset.w); break;
    case 'delete-grade': {
      const g = db.school.grades.find(x => x.id === id);
      if (!await confirmAction({ title: 'Note löschen?', label: 'Note löschen' })) break;
      db.school.grades = db.school.grades.filter(x => x.id !== id);
      save(); render(); subjectSheet(g.subjectId); break;
    }

    case 'export': exportData(); break;
    case 'import': importData(); break;
  }
});

document.addEventListener('change', e => {
  if (e.target.name === 'sched-day') { scheduleSheet(+e.target.value); return; }
  if (e.target.name === 'school-view') { ui.schoolView = e.target.value; render(); window.scrollTo(0, 0); return; }
  if (e.target.dataset.fc) {
    const k = e.target.dataset.fc, fcv = db.school.forecast, val = e.target.value.trim();
    if (k === 'target') { const T = num(val); if (T >= 1 && T <= 4) fcv.target = Math.round(T * 10) / 10; }
    if (k === 'exact') fcv.exact = e.target.checked;
    if (k === 'year12') db.school.year11 = +val - 1;
    if (k === 'fpa0' || k === 'fpa1') { const n = parseInt(val, 10); fcv.fpa[+k.slice(3)] = val === '' || !(n >= 0 && n <= 15) ? null : n; }
    save(); render(); return;
  }
  if (e.target.name === 'date' && e.target.closest('form[data-form=grade]')) {
    const t = $('#sheet select[name=term]'); if (t && e.target.value) t.value = termOf(e.target.value);
  }
  if (e.target.name === 'cal-view') {
    ui.calView = e.target.value;
    try { localStorage.setItem(STORE_KEY + ':calview', ui.calView); } catch (er) { /* egal */ }
    if (ui.calView === 'month') ui.homeMonth = firstOfMonth(ui.calDate);
    else if (monthKey(ui.homeMonth) !== monthKey(ui.calDate)) ui.calDate = monthKey(ui.homeMonth) === monthKey(new Date()) ? new Date() : new Date(ui.homeMonth);
    ui.tlScroll = null; render(); return;
  }
  if (e.target.name === 'kind' && e.target.closest('form[data-form=grade]')) {
    const w = kindWeight(e.target.value);
    const txt = $('#sheet input[type=text][name=weight]');
    if (txt) txt.value = deNum(w);
    else { const r = $(`#sheet input[type=radio][name=weight][value="${Math.min(2, w)}"]`); if (r) r.checked = true; }
    return;
  }
  if (e.target.dataset.school) { db.school[e.target.dataset.school] = e.target.value; save(); render(); return; }
  const pill = e.target.closest('.date-pill');
  if (pill) $('.txt', pill).textContent = e.target.value ? relDay(e.target.value) : 'Datum';
});

document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f).entries());
  const id = f.dataset.id;

  switch (f.dataset.form) {
    case 'job': {
      const rate = num(v.rate);
      const name = (v.name || '').trim();
      if (!name) break;
      if (id) {
        Object.assign(jobById(id), { name, color: v.color, rate });
        if (v.retro) db.shifts.forEach(s => { if (s.jobId === id) s.rate = rate; });
      } else if (db.jobs.length < MAX_JOBS) {
        db.jobs.push({ id: uid(), name, color: v.color, rate });
      }
      save(); closeSheet(); render(); break;
    }
    case 'limit':
      db.settings.minijobLimit = Math.max(0, num(v.limit));
      save(); closeSheet(); render(); break;
    case 'shift': {
      const hours = num(v.hours);
      const j = jobById(v.jobId);
      if (!j || hours <= 0) break;
      db.shifts.push({ id: uid(), jobId: j.id, date: f.dataset.date, hours, start: /^\d\d:\d\d$/.test(v.start || '') ? v.start : '', rate: j.rate, note: (v.note || '').trim() });
      save(); render(); jobDaySheet(f.dataset.date); break;
    }
    case 'account': {
      const data = { name: v.name.trim(), balance: num(v.balance), updated: todayStr() };
      if (id) Object.assign(db.accounts.find(a => a.id === id), data);
      else db.accounts.push({ id: uid(), ...data });
      save(); closeSheet(); render(); break;
    }
    case 'todo': {
      const text = (v.text || '').trim();
      if (!text) break;
      const date = f.dataset.date || v.date || null;
      db.todos.push({ id: uid(), text, done: false, date, created: Date.now() });
      save(); render();
      if (f.dataset.reopen === 'home-day') { homeDaySheet(date); const i = $('#sheet .add-row input'); if (i) i.focus(); }
      else { const inp = $('#page-todos input[name=text]'); if (inp) inp.focus(); }
      break;
    }
    case 'todo-edit': {
      const x = db.todos.find(t => t.id === id);
      Object.assign(x, { text: v.text.trim() || x.text, date: v.date || null });
      save(); render();
      if (f.dataset.back && x.date) homeDaySheet(x.date); else closeSheet();
      break;
    }
    case 'note': {
      const text = (v.text || '').trim();
      if (!text) break;
      db.notes.push({ id: uid(), text, created: Date.now() });
      save(); render(); break;
    }
    case 'lesson': {
      const data = { subject: v.subject.trim(), day: +v.day || 1, start: v.start, end: v.end, room: (v.room || '').trim(), teacher: (v.teacher || '').trim(), note: (v.note || '').trim() };
      if (!data.subject || !data.start || !data.end) break;
      if (data.end <= data.start) { $('#sheet input[name=end]').setCustomValidity('Ende muss nach dem Beginn liegen'); $('#sheet input[name=end]').reportValidity(); $('#sheet input[name=end]').setCustomValidity(''); break; }
      if (id) Object.assign(db.school.lessons.find(l => l.id === id), data);
      else db.school.lessons.push({ id: uid(), ...data });
      if (!db.school.subjects.some(x => x.short === data.subject)) db.school.subjects.push({ id: uid(), short: data.subject, name: SUBJECT_NAMES[data.subject] || data.subject, color: COLORS[db.school.subjects.length % COLORS.length] });
      save(); render();
      if (ui.sheetCtx === 'schedule') scheduleSheet(data.day); else closeSheet();
      break;
    }
    case 'subject': {
      const name = (v.name || '').trim(), short = (v.short || '').trim();
      if (!name || !short) break;
      if (db.school.subjects.some(f => f.short === short && f.id !== id)) {
        const inp = $('#sheet input[name=short]'); inp.setCustomValidity('Dieses Kürzel gibt es schon'); inp.reportValidity(); inp.setCustomValidity(''); break;
      }
      if (id) {
        const f = subjById(id);
        if (f.short !== short) db.school.lessons.forEach(l => { if (l.subject === f.short) l.subject = short; });
        Object.assign(f, { name, short, color: v.color, abi: v.abi === 'on' });
        if (f.abi) addAbiExam(id);
        save(); render(); subjectSheet(id);
      } else {
        const nid = uid();
        db.school.subjects.push({ id: nid, name, short, color: v.color, abi: v.abi === 'on' });
        if (v.abi === 'on') addAbiExam(nid);
        save(); render(); subjectSheet(nid);
      }
      break;
    }
    case 'grade': {
      const planned = !!f.dataset.planned;
      const sid = f.dataset.subject || v.subjectId;
      const points = v.points === undefined || v.points === '' ? null : parseInt(v.points, 10);
      let weight = num(v.weight);
      if (planned) weight = Math.min(2, Math.max(0.5, weight));
      if (!subjById(sid) || !(weight > 0)) break;
      if (points !== null && !(points >= 0 && points <= 15)) break;
      if (!planned && (points === null || !v.date)) break;
      const data = { subjectId: sid, points, weight, kind: v.kind || 's', date: v.date || '', title: (v.title || '').trim(), term: (v.kind === 'ap' ? '12-2' : v.term) || termOf(v.date), planned };
      if (id) Object.assign(db.school.grades.find(g => g.id === id), data);
      else db.school.grades.push({ id: uid(), created: Date.now(), ...data });
      save(); render();
      if (f.dataset.subject) subjectSheet(sid); else closeSheet();
      break;
    }
    case 'holiday': {
      const from = v.from, to = v.to && v.to > v.from ? v.to : '';
      if (!from) break;
      const data = { name: (v.name || '').trim(), from, to };
      if (id) Object.assign(db.school.holidays.find(h => h.id === id), data);
      else db.school.holidays.push({ id: uid(), ...data });
      save(); render(); holidaysSheet(); break;
    }
    case 'note-edit': {
      const n = db.notes.find(x => x.id === id);
      const text = (v.text || '').trim();
      if (!text) db.notes = db.notes.filter(x => x.id !== id);
      else if (text !== n.text) Object.assign(n, { text, updated: Date.now() });
      save(); closeSheet(); render(); break;
    }
  }
});

/* Notizfeld: Cmd/Strg+Enter sichert */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!$('#alert-overlay').hidden) return; closeSheet(); }
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && e.target.matches('textarea')) e.target.form?.requestSubmit();
});

/* ---------- Sichern / Wiederherstellen ---------- */

async function exportData() {
  const json = JSON.stringify(db, null, 2);
  const name = `severin-organizer-${todayStr()}.json`;
  shareOrDownload(new File([json], name, { type: 'application/json' }), 'Organizer-Backup');
}

/* Auf iPhone/iPad über das Teilen-Menü (in Dateien sichern, Kalender …), sonst als Download */
async function shareOrDownload(file, title) {
  if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ files: [file], title }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importData() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json,.json';
  inp.onchange = async () => {
    const file = inp.files[0];
    if (!file) return;
    let data;
    try {
      data = JSON.parse(await file.text());
      if (!data || !Array.isArray(data.jobs)) throw new Error('Das ist kein Organizer-Backup.');
    } catch (err) {
      await confirmAction({ title: 'Backup konnte nicht gelesen werden', message: err.message, label: 'OK', destructive: false });
      return;
    }
    if (!await confirmAction({ title: 'Backup wiederherstellen?', message: 'Alle aktuellen Daten werden durch das Backup ersetzt.', label: 'Ersetzen' })) return;
    db = Object.assign(defaults(), data);
    normalizeSchool();
    save(); render();
  };
  inp.click();
}

normalizeSchool();
ui.schoolView = '12'; // Schul-Tab startet immer in der 12. Klasse
try { localStorage.removeItem(STORE_KEY + ':schoolview'); } catch (e) { /* egal */ }
if (lockCred()) { showLock(); unlockFlow(true); } else render();
onScroll();
checkLockAvail();
