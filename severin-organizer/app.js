/* Severin Organizer – drei Seiten: Jobs (links), Übersicht (Mitte), To-dos (rechts).
   Alle Daten liegen im localStorage unter STORE_KEY. Oberfläche nach Apple-Vorbild. */
'use strict';

const STORE_KEY = 'severin-organizer-v1';
const MAX_JOBS = 3;
const COLORS = ['blue', 'green', 'orange', 'red', 'purple', 'teal', 'pink', 'indigo'];
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const HOUR_CHIPS = [2, 3, 4, 5, 6, 8];

/* ---------- Daten ---------- */

const defaults = () => ({
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
};
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
  if (ui.page === 'home') renderHome();
  if (ui.page === 'todos') renderTodos();
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
      <span class="sub" style="display:block">${eur(shiftEarn(s))} · ${eur(s.rate)}/Std.${s.note ? ' · ' + esc(s.note) : ''}</span></span>
      <button type="button" class="btn-tint" style="color:var(--c-red)" data-action="delete-shift" data-id="${s.id}" data-date="${date}">Löschen</button></div>`;
  }).join('');
  const total = list.reduce((a, s) => a + shiftEarn(s), 0);
  const lastJob = list.length ? list[list.length - 1].jobId : db.jobs[0].id;

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
            <label class="cell field"><span>Notiz</span><input type="text" name="note" placeholder="optional, z. B. 14–18 Uhr" autocomplete="off"></label>
          </div>
          <div class="group" style="margin-top:12px"><button class="cell link center"><span class="title" style="font-weight:600">Stunden eintragen</span></button></div>
        `)}
      </form>`,
  });
}

/* ---------- Seite 2: Übersicht ---------- */

function renderHome() {
  $('#nav-home').innerHTML = `<button class="nav-btn" data-action="new-account" aria-label="Konto hinzufügen">${icon('plus')}</button>`;

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
    const marks = db.shifts.filter(s => s.date === ds).map(s => `<span class="mark" style="background:${jobColor(s.jobId)}"></span>`).join('')
      + db.todos.filter(x => x.date === ds).map(x => `<span class="mark todo ${x.done ? 'done' : ''}"></span>`).join('');
    return marks ? `<span class="marks">${marks}</span>` : '';
  };
  const legend = db.jobs.map(j => `<span><span class="dot" style="background:${colorOf(j.color)};width:8px;height:8px"></span>${esc(j.name)}</span>`).join('')
    + `<span><span class="dot" style="width:8px;height:8px;box-shadow:inset 0 0 0 1.5px var(--label2)"></span>To-do</span>`;

  // Nächste sieben Tage
  const up = [];
  for (let i = 0; i < 7; i++) {
    const ds = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
    db.shifts.filter(s => s.date === ds).forEach(s => {
      const j = jobById(s.jobId);
      up.push(`<button class="cell" data-action="home-day" data-date="${ds}"><span class="dot" style="background:${jobColor(s.jobId)}"></span>
        <span class="main"><span class="title">${esc(j ? j.name : 'Job')} · ${hrs(s.hours)}</span><span class="sub" style="display:block">${esc(relDay(ds))}</span></span>${chev}</button>`);
    });
    db.todos.filter(x => x.date === ds && !x.done).forEach(x => up.push(todoCell(x)));
  }
  const overdueCells = open.filter(x => x.date && x.date < t).map(todoCell).join('');

  const todayBits = [todayShifts.length && `${todayShifts.length} ${todayShifts.length === 1 ? 'Schicht' : 'Schichten'}`, todayTodos.length && `${todayTodos.length} To-do${todayTodos.length === 1 ? '' : 's'}`].filter(Boolean);

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
          <span class="v">${todayShifts.length + todayTodos.length}</span><span class="s">${todayBits.length ? todayBits.join(' · ') : 'nichts geplant'}</span></button>
      </div>
    </div>

    ${section('Konten', `<div class="group icons">${accounts}</div>`, 'Kontostände trägst du von Hand ein. Tippe ein Konto an, um es zu aktualisieren.')}

    <div class="section">${calendar(ui.homeMonth, cell, 'home-day', 'home-month')}<div class="legend">${legend}</div></div>

    ${overdueCells ? section('Überfällig', `<div class="group">${overdueCells}</div>`) : ''}
    ${section('Nächste 7 Tage', `<div class="group">${up.join('') || '<div class="empty">Nichts geplant.</div>'}</div>`)}

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
      <span class="main"><span class="title">${esc(j ? j.name : 'Job')} · ${hrs(s.hours)}</span><span class="sub" style="display:block">${eur(shiftEarn(s))}${s.note ? ' · ' + esc(s.note) : ''}</span></span></div>`;
  }).join('');
  const todos = db.todos.filter(x => x.date === date).map(x => todoCell(x, true)).join('');
  openSheet({
    title: dayLong(date),
    left: null,
    right: { label: 'Fertig', action: 'close' },
    body: `
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

function openSheet({ title, left = 'Abbrechen', right = null, body }) {
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

    case 'export': exportData(); break;
    case 'import': importData(); break;
  }
});

document.addEventListener('change', e => {
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
      db.shifts.push({ id: uid(), jobId: j.id, date: f.dataset.date, hours, rate: j.rate, note: (v.note || '').trim() });
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
  const file = new File([json], name, { type: 'application/json' });
  // Auf iPhone/iPad über das Teilen-Menü (in Dateien sichern), sonst als Download
  if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ files: [file], title: 'Organizer-Backup' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = name;
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
    save(); render();
  };
  inp.click();
}

render();
onScroll();
