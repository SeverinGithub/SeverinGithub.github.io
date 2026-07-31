export const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
export const WEEKDAYS_MON_FIRST = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
export const MONTHS_DE = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
]

export function todayISO() {
  const d = new Date()
  return isoFromDate(d)
}
export function isoFromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export function dateFromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function monthKey(iso) {
  return iso.slice(0, 7) // 'YYYY-MM'
}
export function currentMonthKey() {
  return todayISO().slice(0, 7)
}
export function monthKeyToLabel(mk) {
  const [y, m] = mk.split('-').map(Number)
  return `${MONTHS_DE[m - 1]} ${y}`
}
export function shiftMonth(mk, delta) {
  const [y, m] = mk.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
export function monthEntries(entries, mk) {
  return entries
    .filter((e) => e.date.startsWith(mk))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? 0) - (b.start ?? 0))
}

// Format hours as "4,50 h" or "4,5 h"
export function fmtHours(h) {
  return `${(h ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`
}
export function fmtEuro(v) {
  return `${(v ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}
export function fmtDateShort(iso) {
  const d = dateFromISO(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`
}
export function fmtWeekdayShort(iso) {
  return WEEKDAYS_SHORT[dateFromISO(iso).getDay()]
}

// Parse "9:30" or "9.5" or "9,5" or "09:00" → decimal hours (60/100)
export function parseTimeToDecimal(str) {
  if (str == null || str === '') return null
  const s = String(str).trim().replace(',', '.')
  if (s.includes(':')) {
    const [h, m] = s.split(':').map((x) => parseInt(x, 10))
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return h + m / 60
  }
  const n = parseFloat(s)
  return Number.isNaN(n) ? null : n
}

// Format decimal hours as HH:MM for display
export function decimalToHM(dec) {
  if (dec == null) return ''
  const h = Math.floor(dec)
  const m = Math.round((dec - h) * 60)
  if (m === 60) return `${String(h + 1).padStart(2, '0')}:00`
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function computeHours(entry) {
  if (entry.mode === 'duration') {
    return Math.max(0, entry.hours || 0)
  }
  const s = entry.start ?? 0
  const e = entry.end ?? 0
  const p = entry.pause ?? 0
  return Math.max(0, e - s - p)
}

// Second-to-last day of the month
export function secondToLastDayISO(mk) {
  const [y, m] = mk.split('-').map(Number)
  const last = new Date(y, m, 0) // day 0 of next month = last day of this month
  const d = new Date(y, m - 1, last.getDate() - 1)
  return isoFromDate(d)
}

export function daysInMonth(mk) {
  const [y, m] = mk.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function weekdayMonFirstIndex(date) {
  // Monday = 0 ... Sunday = 6
  return (date.getDay() + 6) % 7
}
