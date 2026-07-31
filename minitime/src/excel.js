import ExcelJS from 'exceljs'
import { secondToLastDayISO, monthEntries, computeHours } from './utils'

// ExcelJS converts JS Date objects using UTC; a local-midnight date can slip
// to the previous calendar day. Use UTC noon so any TZ conversion keeps the day.
function utcNoonFromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

const TEMPLATE_URL = `${import.meta.env.BASE_URL}vorlage.xlsx`
const MAX_ROWS = 15 // rows 10..24
const START_ROW = 10

async function loadTemplate() {
  const res = await fetch(TEMPLATE_URL)
  if (!res.ok) throw new Error('Vorlage konnte nicht geladen werden')
  const buf = await res.arrayBuffer()
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buf)
  return wb
}

function fillSheet(ws, entries, signatureDateISO) {
  entries.forEach((entry, i) => {
    const row = START_ROW + i
    ws.getCell(`B${row}`).value = utcNoonFromISO(entry.date)
    ws.getCell(`B${row}`).numFmt = 'mm-dd-yy'

    if (entry.mode === 'duration') {
      // No start/end recorded; leave C/D blank, write hours directly into F would break formula.
      // Instead, put 0 as start and duration+pause as end so formula gives correct hours.
      const pause = entry.pause || 0
      const dur = computeHours(entry)
      ws.getCell(`C${row}`).value = 0
      ws.getCell(`D${row}`).value = dur + pause
      ws.getCell(`E${row}`).value = pause
    } else {
      ws.getCell(`C${row}`).value = entry.start ?? 0
      ws.getCell(`D${row}`).value = entry.end ?? 0
      ws.getCell(`E${row}`).value = entry.pause ?? 0
    }
    ws.getCell(`C${row}`).numFmt = '0.00'
    ws.getCell(`D${row}`).numFmt = '0.00'
    ws.getCell(`E${row}`).numFmt = '#,##0.00'
  })

  // Signature dates
  const sigDate = utcNoonFromISO(signatureDateISO)
  ws.getCell('B27').value = sigDate
  ws.getCell('B27').numFmt = 'mm-dd-yy'
  ws.getCell('G27').value = sigDate
  ws.getCell('G27').numFmt = 'mm-dd-yy'
}

function buildFilename(pattern, mk, part) {
  const [y, m] = mk.split('-')
  const yy = y.slice(-2)
  let name = pattern.replace('{MM}', m).replace('{JJ}', yy).replace('{YYYY}', y)
  if (part) {
    const dot = name.lastIndexOf('.')
    name = name.slice(0, dot) + `_Teil${part}` + name.slice(dot)
  }
  return name
}

function download(buffer, filename) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function exportMonth({ entries, settings, monthKey: mk, signatureDate }) {
  const monthEntriesSorted = monthEntries(entries, mk)
  if (monthEntriesSorted.length === 0) {
    throw new Error('Keine Einträge in diesem Monat')
  }
  const sigISO = signatureDate || secondToLastDayISO(mk)

  // Chunk into groups of MAX_ROWS
  const chunks = []
  for (let i = 0; i < monthEntriesSorted.length; i += MAX_ROWS) {
    chunks.push(monthEntriesSorted.slice(i, i + MAX_ROWS))
  }

  const files = []
  for (let idx = 0; idx < chunks.length; idx++) {
    const wb = await loadTemplate()
    const ws = wb.worksheets[0]
    fillSheet(ws, chunks[idx], sigISO)
    const buffer = await wb.xlsx.writeBuffer()
    const filename = buildFilename(
      settings.templateFilename,
      mk,
      chunks.length > 1 ? idx + 1 : null
    )
    files.push({ buffer, filename })
  }

  for (const f of files) download(f.buffer, f.filename)
  return files.map((f) => f.filename)
}
