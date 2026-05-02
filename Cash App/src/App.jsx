import { useEffect, useMemo, useState } from 'react'

const STORAGE_TRANSACTIONS = 'cash-app-transactions-v1'
const STORAGE_FORECASTS = 'cash-app-forecasts-v1'
const STORAGE_ACCOUNTS = 'cash-app-accounts-v1'
const STORAGE_SETTINGS = 'cash-app-settings-v1'

const shortDate = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function formatDateSafe(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--.--.----' : shortDate.format(date)
}

function getDefaultSettings() {
  return {
    currency: 'EUR',
    theme: 'mono',
  }
}

function readSettings() {
  const raw = readStorage(STORAGE_SETTINGS)
  const defaults = getDefaultSettings()
  return {
    currency: typeof raw?.currency === 'string' ? raw.currency : defaults.currency,
    theme: typeof raw?.theme === 'string' ? raw.theme : defaults.theme,
  }
}

function getAccountTotalsFromTransactions(transactions) {
  return transactions.reduce(
    (acc, tx) => {
      const account = tx.account || 'cash'
      const delta = tx.type === 'income' ? tx.amount : -tx.amount
      acc[account] = (acc[account] || 0) + delta
      return acc
    },
    { cash: 0, ing: 0, sparkasse: 0 },
  )
}

function getStoredAccountsOrFallback(transactions) {
  const stored = readStorage(STORAGE_ACCOUNTS)
  if (stored && typeof stored === 'object') {
    return {
      cash: Number(stored.cash) || 0,
      ing: Number(stored.ing) || 0,
      sparkasse: Number(stored.sparkasse) || 0,
    }
  }
  return getAccountTotalsFromTransactions(transactions)
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [fullscreenChart, setFullscreenChart] = useState(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetArmed, setResetArmed] = useState(false)
  const [selectedForecastPointId, setSelectedForecastPointId] = useState(null)
  const [transactions, setTransactions] = useState(() => readStorage(STORAGE_TRANSACTIONS))
  const [accounts, setAccounts] = useState(() => getStoredAccountsOrFallback(readStorage(STORAGE_TRANSACTIONS)))
  const [forecasts, setForecasts] = useState(() => readStorage(STORAGE_FORECASTS))
  const [settings, setSettings] = useState(() => readSettings())
  const [txForm, setTxForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: '',
    type: 'income',
    account: 'cash',
  })
  const [forecastForm, setForecastForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'income',
  })
  const [transferForm, setTransferForm] = useState({
    from: 'cash',
    to: 'ing',
    amount: '',
  })

  const currency = useMemo(
    () =>
      new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: settings.currency,
      }),
    [settings.currency],
  )

  const currencyAxis = useMemo(
    () =>
      new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: settings.currency,
        maximumFractionDigits: 0,
      }),
    [settings.currency],
  )

  const orderedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  )

  const orderedForecasts = useMemo(
    () =>
      [...forecasts].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [forecasts],
  )

  const balance = useMemo(
    () =>
      transactions.reduce(
        (sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount),
        0,
      ),
    [transactions],
  )

  const forecastBalance = useMemo(
    () =>
      orderedForecasts.reduce(
        (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
        balance,
      ),
    [orderedForecasts, balance],
  )

  const forecastBalanceDate = useMemo(() => {
    if (!orderedForecasts.length) return new Date().toISOString().slice(0, 10)
    return orderedForecasts[orderedForecasts.length - 1].date
  }, [orderedForecasts])

  const trendData = useMemo(() => {
    const points = [...orderedTransactions].reverse()
    const result = []

    points.reduce((running, tx) => {
      const next = running + (tx.type === 'income' ? tx.amount : -tx.amount)
      result.push({ id: tx.id, value: next, date: tx.date })
      return next
    }, 0)

    return result
  }, [orderedTransactions])

  const forecastTrend = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const result = []

    result.push({
      id: 'current-balance-baseline',
      value: balance,
      date: today,
    })

    orderedForecasts.reduce((running, item) => {
      const next = running + (item.type === 'income' ? item.amount : -item.amount)
      result.push({ id: item.id, value: next, date: item.date })
      return next
    }, balance)

    return result
  }, [orderedForecasts, balance])

  const effectiveSelectedForecastPointId = forecastTrend.some(
    (point) => point.id === selectedForecastPointId,
  )
    ? selectedForecastPointId
    : null

  const selectedForecastPoint = useMemo(
    () => forecastTrend.find((point) => point.id === effectiveSelectedForecastPointId) || null,
    [forecastTrend, effectiveSelectedForecastPointId],
  )

  const displayForecastBalance = selectedForecastPoint
    ? selectedForecastPoint.value
    : forecastBalance
  const displayForecastDate = selectedForecastPoint ? selectedForecastPoint.date : forecastBalanceDate

  const persistTransactions = (next) => {
    setTransactions(next)
    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(next))
  }

  const persistForecasts = (next) => {
    setForecasts(next)
    localStorage.setItem(STORAGE_FORECASTS, JSON.stringify(next))
  }

  const persistAccounts = (next) => {
    setAccounts(next)
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(next))
  }

  const persistSettings = (next) => {
    setSettings(next)
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(next))
  }

  const addTransaction = (event) => {
    event.preventDefault()
    const amount = Number(txForm.amount)
    if (!txForm.title.trim() || !amount || amount <= 0 || !txForm.date) return

    persistTransactions([
      ...transactions,
      {
        id: crypto.randomUUID(),
        title: txForm.title.trim(),
        amount,
        date: txForm.date,
        category: txForm.category.trim(),
        type: txForm.type,
        account: txForm.account,
      },
    ])

    const delta = txForm.type === 'income' ? amount : -amount
    persistAccounts({
      ...accounts,
      [txForm.account]: (accounts[txForm.account] || 0) + delta,
    })

    setTxForm((prev) => ({ ...prev, title: '', amount: '', category: '' }))
  }

  const addForecast = (event) => {
    event.preventDefault()
    const amount = Number(forecastForm.amount)
    if (!forecastForm.title.trim() || !amount || amount <= 0 || !forecastForm.date) return

    persistForecasts([
      ...forecasts,
      {
        id: crypto.randomUUID(),
        title: forecastForm.title.trim(),
        amount,
        date: forecastForm.date,
        type: forecastForm.type,
      },
    ])

    setForecastForm((prev) => ({ ...prev, title: '', amount: '' }))
  }

  const removeTransaction = (id) => {
    const tx = transactions.find((entry) => entry.id === id)
    if (!tx) return

    persistTransactions(transactions.filter((entry) => entry.id !== id))

    const account = tx.account || 'cash'
    const delta = tx.type === 'income' ? -tx.amount : tx.amount
    persistAccounts({
      ...accounts,
      [account]: (accounts[account] || 0) + delta,
    })
  }

  const removeForecast = (id) => {
    persistForecasts(forecasts.filter((entry) => entry.id !== id))
  }

  const moveBetweenAccounts = (event) => {
    event.preventDefault()
    const amount = Number(transferForm.amount)
    if (!amount || amount <= 0 || transferForm.from === transferForm.to) return
    if ((accounts[transferForm.from] || 0) < amount) return

    persistAccounts({
      ...accounts,
      [transferForm.from]: (accounts[transferForm.from] || 0) - amount,
      [transferForm.to]: (accounts[transferForm.to] || 0) + amount,
    })

    setTransferForm((prev) => ({ ...prev, amount: '' }))
  }

  const positiveShares = {
    cash: Math.max(0, accounts.cash || 0),
    ing: Math.max(0, accounts.ing || 0),
    sparkasse: Math.max(0, accounts.sparkasse || 0),
  }
  const shareTotal = positiveShares.cash + positiveShares.ing + positiveShares.sparkasse
  const accountBarWidths =
    shareTotal > 0
      ? {
          cash: (positiveShares.cash / shareTotal) * 100,
          ing: (positiveShares.ing / shareTotal) * 100,
          sparkasse: (positiveShares.sparkasse / shareTotal) * 100,
        }
      : { cash: 34, ing: 33, sparkasse: 33 }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFullscreenChart(null)
        setAccountModalOpen(false)
        setSettingsOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.body.dataset.theme = settings.theme
  }, [settings.theme])

  const resetAllData = () => {
    const defaults = getDefaultSettings()
    setTransactions([])
    setForecasts([])
    setAccounts({ cash: 0, ing: 0, sparkasse: 0 })
    setSelectedForecastPointId(null)
    setTxForm({
      title: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      category: '',
      type: 'income',
      account: 'cash',
    })
    setForecastForm({
      title: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      type: 'income',
    })
    setTransferForm({ from: 'cash', to: 'ing', amount: '' })
    setSettings(defaults)
    localStorage.removeItem(STORAGE_TRANSACTIONS)
    localStorage.removeItem(STORAGE_FORECASTS)
    localStorage.removeItem(STORAGE_ACCOUNTS)
    localStorage.removeItem(STORAGE_SETTINGS)
    setResetArmed(false)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Cashflow</h1>
          <p>Persoenliches Finanz-Tracking</p>
        </div>
        <button className="ghost top-settings" type="button" onClick={() => setSettingsOpen(true)}>
          Settings
        </button>
      </header>

      <nav className="tabs" aria-label="Bereiche">
        <button
          className={activeTab === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('dashboard')}
          type="button"
        >
          Kontostand
        </button>
        <button
          className={activeTab === 'forecast' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('forecast')}
          type="button"
        >
          Forecast
        </button>
      </nav>

      <section className="panels">
        <article className={activeTab === 'dashboard' ? 'panel visible' : 'panel hidden'}>
          <section className="card balance-card">
            <p>Aktueller Kontostand</p>
            <div className="balance-line">
              <h2>{currency.format(balance)}</h2>
              <button className="ghost clear-point" type="button" onClick={() => setAccountModalOpen(true)}>
                Konten
              </button>
            </div>
            <div className="account-share-line" aria-label="Kontenanteile">
              <span className="seg cash" style={{ width: `${accountBarWidths.cash}%` }} />
              <span className="seg ing" style={{ width: `${accountBarWidths.ing}%` }} />
              <span className="seg sparkasse" style={{ width: `${accountBarWidths.sparkasse}%` }} />
            </div>
          </section>

          <section className="card chart-card">
            <header className="card-head">
              <h3>Verlauf</h3>
              <button
                className="ghost chart-expand"
                type="button"
                onClick={() => setFullscreenChart('history')}
              >
                Vollbild
              </button>
            </header>
            <MiniChart points={trendData} currencyAxis={currencyAxis} />
          </section>

          <section className="card">
            <header className="card-head">
              <h3>Neue Transaktion</h3>
            </header>
            <form className="form-grid" onSubmit={addTransaction}>
              <input
                placeholder="Titel"
                value={txForm.title}
                onChange={(event) => setTxForm({ ...txForm, title: event.target.value })}
                required
              />
              <input
                placeholder="Kategorie (optional)"
                value={txForm.category}
                onChange={(event) => setTxForm({ ...txForm, category: event.target.value })}
              />
              <input
                type="number"
                placeholder="Betrag"
                min="0.01"
                step="0.01"
                value={txForm.amount}
                onChange={(event) => setTxForm({ ...txForm, amount: event.target.value })}
                required
              />
              <input
                type="date"
                value={txForm.date}
                onChange={(event) => setTxForm({ ...txForm, date: event.target.value })}
                required
              />
              <select
                value={txForm.type}
                onChange={(event) => setTxForm({ ...txForm, type: event.target.value })}
              >
                <option value="income">Einnahme (+)</option>
                <option value="expense">Ausgabe (-)</option>
              </select>
              <select
                value={txForm.account}
                onChange={(event) => setTxForm({ ...txForm, account: event.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="ing">ING</option>
                <option value="sparkasse">Sparkasse</option>
              </select>
              <button type="submit">Speichern</button>
            </form>
          </section>

          <section className="card">
            <header className="card-head">
              <h3>Transaktionen</h3>
            </header>
            <ul className="list">
              {orderedTransactions.length === 0 && <li className="empty">Noch keine Eintraege</li>}
              {orderedTransactions.map((entry) => (
                <li key={entry.id} className="list-item">
                  <div>
                    <strong>{entry.title}</strong>
                    <span>
                      {formatDateSafe(entry.date)}
                      {entry.category ? ` · ${entry.category}` : ''}
                      {` · ${(entry.account || 'cash').toUpperCase()}`}
                    </span>
                  </div>
                  <div className="row-end">
                    <b className={entry.type === 'income' ? 'plus' : 'minus'}>
                      {entry.type === 'income' ? '+' : '-'}
                      {currency.format(entry.amount)}
                    </b>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => removeTransaction(entry.id)}
                    >
                      Loeschen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <article className={activeTab === 'forecast' ? 'panel visible' : 'panel hidden'}>
          <section className="card balance-card">
            <p>Zukuenftiger Kontostand</p>
            <div className="balance-line">
              <h2>{currency.format(displayForecastBalance)}</h2>
              <span className="balance-date">
                Stand: {formatDateSafe(displayForecastDate)}
              </span>
            </div>
            <small>Ausgehend vom aktuellen Kontostand</small>
            {selectedForecastPoint && (
              <button
                className="ghost clear-point"
                type="button"
                onClick={() => setSelectedForecastPointId(null)}
              >
                Auswahl zuruecksetzen
              </button>
            )}
          </section>

          <section className="card chart-card">
            <header className="card-head">
              <h3>Prognose-Timeline</h3>
              <button
                className="ghost chart-expand"
                type="button"
                onClick={() => setFullscreenChart('forecast')}
              >
                Vollbild
              </button>
            </header>
            <MiniChart
              points={forecastTrend}
              currencyAxis={currencyAxis}
              clickablePoints
              selectedPointId={effectiveSelectedForecastPointId}
              onPointSelect={setSelectedForecastPointId}
            />
          </section>

          <section className="card">
            <header className="card-head">
              <h3>Neuer Forecast-Eintrag</h3>
            </header>
            <form className="form-grid" onSubmit={addForecast}>
              <input
                placeholder="Titel"
                value={forecastForm.title}
                onChange={(event) =>
                  setForecastForm({ ...forecastForm, title: event.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Betrag"
                min="0.01"
                step="0.01"
                value={forecastForm.amount}
                onChange={(event) =>
                  setForecastForm({ ...forecastForm, amount: event.target.value })
                }
                required
              />
              <select
                value={forecastForm.type}
                onChange={(event) =>
                  setForecastForm({ ...forecastForm, type: event.target.value })
                }
              >
                <option value="income">Zukuenftige Einnahme (+)</option>
                <option value="expense">Zukuenftige Ausgabe (-)</option>
              </select>
              <input
                type="date"
                value={forecastForm.date}
                onChange={(event) =>
                  setForecastForm({ ...forecastForm, date: event.target.value })
                }
                required
              />
              <button type="submit">Forecast speichern</button>
            </form>
          </section>

          <section className="card">
            <header className="card-head">
              <h3>Geplante Eintraege</h3>
            </header>
            <ul className="list">
              {orderedForecasts.length === 0 && <li className="empty">Noch keine Planung</li>}
              {orderedForecasts.map((entry) => (
                <li key={entry.id} className="list-item">
                  <div>
                    <strong>{entry.title}</strong>
                    <span>{formatDateSafe(entry.date)}</span>
                  </div>
                  <div className="row-end">
                    <b className={entry.type === 'income' ? 'plus' : 'minus'}>
                      {entry.type === 'income' ? '+' : '-'}
                      {currency.format(Math.abs(entry.amount))}
                    </b>
                    <button className="ghost" type="button" onClick={() => removeForecast(entry.id)}>
                      Loeschen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </section>

      {fullscreenChart && (
        <section className="chart-overlay" role="dialog" aria-modal="true">
          <div className="chart-overlay-card">
            <header className="card-head">
              <h3>{fullscreenChart === 'history' ? 'Verlauf (Vollbild)' : 'Forecast (Vollbild)'}</h3>
              <button className="ghost chart-expand" type="button" onClick={() => setFullscreenChart(null)}>
                Schliessen
              </button>
            </header>
            <div className="chart-overlay-inner">
              <MiniChart
                points={fullscreenChart === 'history' ? trendData : forecastTrend}
                currencyAxis={currencyAxis}
                clickablePoints={fullscreenChart === 'forecast'}
                selectedPointId={
                  fullscreenChart === 'forecast' ? effectiveSelectedForecastPointId : null
                }
                onPointSelect={
                  fullscreenChart === 'forecast' ? setSelectedForecastPointId : undefined
                }
              />
            </div>
          </div>
        </section>
      )}

      {accountModalOpen && (
        <section className="chart-overlay" role="dialog" aria-modal="true">
          <div className="chart-overlay-card">
            <header className="card-head">
              <h3>Konten</h3>
              <button className="ghost chart-expand" type="button" onClick={() => setAccountModalOpen(false)}>
                Schliessen
              </button>
            </header>

            <div className="accounts-grid">
              <article className="account-card cash">
                <h4>Cash</h4>
                <p>{currency.format(accounts.cash || 0)}</p>
              </article>
              <article className="account-card ing">
                <h4>ING</h4>
                <p>{currency.format(accounts.ing || 0)}</p>
              </article>
              <article className="account-card sparkasse">
                <h4>Sparkasse</h4>
                <p>{currency.format(accounts.sparkasse || 0)}</p>
              </article>
            </div>

            <section className="card transfer-card">
              <header className="card-head">
                <h3>Zwischen Konten verschieben</h3>
              </header>
              <form className="form-grid" onSubmit={moveBetweenAccounts}>
                <select
                  value={transferForm.from}
                  onChange={(event) => setTransferForm({ ...transferForm, from: event.target.value })}
                >
                  <option value="cash">Von Cash</option>
                  <option value="ing">Von ING</option>
                  <option value="sparkasse">Von Sparkasse</option>
                </select>
                <select
                  value={transferForm.to}
                  onChange={(event) => setTransferForm({ ...transferForm, to: event.target.value })}
                >
                  <option value="cash">Nach Cash</option>
                  <option value="ing">Nach ING</option>
                  <option value="sparkasse">Nach Sparkasse</option>
                </select>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Betrag"
                  value={transferForm.amount}
                  onChange={(event) => setTransferForm({ ...transferForm, amount: event.target.value })}
                />
                <button type="submit">Verschieben</button>
              </form>
            </section>
          </div>
        </section>
      )}

      {settingsOpen && (
        <section className="chart-overlay" role="dialog" aria-modal="true">
          <div className="chart-overlay-card">
            <header className="card-head">
              <h3>Settings</h3>
              <button className="ghost chart-expand" type="button" onClick={() => setSettingsOpen(false)}>
                Schliessen
              </button>
            </header>

            <section className="card transfer-card">
              <header className="card-head">
                <h3>Waehrung</h3>
              </header>
              <div className="form-grid">
                <select
                  value={settings.currency}
                  onChange={(event) =>
                    persistSettings({ ...settings, currency: event.target.value })
                  }
                >
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="CHF">Schweizer Franken (CHF)</option>
                  <option value="GBP">Pfund (GBP)</option>
                </select>
              </div>
            </section>

            <section className="card transfer-card">
              <header className="card-head">
                <h3>App-Farbe</h3>
              </header>
              <div className="form-grid">
                <select
                  value={settings.theme}
                  onChange={(event) =>
                    persistSettings({ ...settings, theme: event.target.value })
                  }
                >
                  <option value="mono">Mono Dark</option>
                  <option value="ocean">Ocean Blue</option>
                  <option value="forest">Forest Green</option>
                </select>
              </div>
            </section>

            <section className="card transfer-card">
              <header className="card-head">
                <h3>Daten</h3>
              </header>
              <label className="confirm-row">
                <input
                  type="checkbox"
                  checked={resetArmed}
                  onChange={(event) => setResetArmed(event.target.checked)}
                />
                <span>Ich bestaetige das vollstaendige Loeschen aller Daten</span>
              </label>
              <button type="button" disabled={!resetArmed} onClick={resetAllData}>
                Alle Daten endgueltig loeschen
              </button>
            </section>
          </div>
        </section>
      )}
    </main>
  )
}

function MiniChart({
  points,
  currencyAxis,
  clickablePoints = false,
  selectedPointId = null,
  onPointSelect,
}) {
  if (!points.length) return <p className="empty">Keine Daten fuer eine Grafik</p>
  const viewBoxWidth = 160
  const viewBoxHeight = 100

  const values = points.map((item) => item.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = max - min || 1
  const yTicks = 4
  const xTicks = Math.min(4, points.length)

  const chart = {
    left: 24,
    right: 156,
    top: 10,
    bottom: 80,
  }

  const scaleX = (index) => {
    const ratio = index / Math.max(points.length - 1, 1)
    return chart.left + ratio * (chart.right - chart.left)
  }

  const scaleY = (value) => {
    const ratio = (value - min) / spread
    return chart.bottom - ratio * (chart.bottom - chart.top)
  }

  const path = points
    .map((item, index) => {
      const x = scaleX(index)
      const y = scaleY(item.value)
      return `${index === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')

  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => {
    const ratio = i / yTicks
    const value = max - ratio * spread
    return {
      y: chart.top + ratio * (chart.bottom - chart.top),
      value,
    }
  })

  const xTickValues = Array.from({ length: xTicks }, (_, i) => {
    const index = Math.round((i / Math.max(xTicks - 1, 1)) * (points.length - 1))
    return {
      x: scaleX(index),
      date: points[index].date,
    }
  })

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="mini-chart">
      <line x1={chart.left} y1={chart.top} x2={chart.left} y2={chart.bottom} className="axis" />
      <line
        x1={chart.left}
        y1={chart.bottom}
        x2={chart.right}
        y2={chart.bottom}
        className="axis"
      />

      {yTickValues.map((tick, idx) => (
        <g key={`y-${idx}`}>
          <line
            x1={chart.left}
            y1={tick.y}
            x2={chart.right}
            y2={tick.y}
            className="grid-line"
          />
          <text x={2} y={tick.y + 1.3} className="tick-label y-label">
            {currencyAxis.format(tick.value)}
          </text>
        </g>
      ))}

      {xTickValues.map((tick, idx) => (
        <text key={`x-${idx}`} x={tick.x} y={95} textAnchor="middle" className="tick-label">
          {formatDateSafe(tick.date)}
        </text>
      ))}

      <path d={path} className="chart-path" />

      {clickablePoints &&
        points.map((point, index) => {
          const x = scaleX(index)
          const y = scaleY(point.value)
          const selected = point.id === selectedPointId
          return (
            <g key={point.id}>
              <circle
                cx={x}
                cy={y}
                r={selected ? 2.2 : 1.5}
                className={selected ? 'chart-point selected' : 'chart-point'}
              />
              <circle
                cx={x}
                cy={y}
                r={4}
                className="chart-point-hit"
                onClick={() => onPointSelect?.(point.id)}
              />
            </g>
          )
        })}
    </svg>
  )
}

export default App
