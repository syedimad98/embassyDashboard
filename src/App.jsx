import { useEffect, useState } from 'react'
import { Download, Filter, RefreshCw, Search } from 'lucide-react'
import './App.css'

const numberFormat = new Intl.NumberFormat('en-IN')

const columns = [
  { key: 'campaign', label: 'Campaign / Status', className: 'campaign-column' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'reach', label: 'Reach' },
  { key: 'ctr', label: 'CTR%' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'totalBudget', label: 'Total Budget' },
  { key: 'totalSpend', label: 'Total Spend' },
]

function App() {
  const [reports, setReports] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [search, setSearch] = useState('')
  const [campaign, setCampaign] = useState('all')
  const [status, setStatus] = useState('all')
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filterParams = new URLSearchParams({ campaign, status, search })
  const filterKey = filterParams.toString()

  useEffect(() => {
    const controller = new AbortController()

    async function loadReport() {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`/api/reports?${filterKey}`, { signal: controller.signal })
        if (!response.ok) throw new Error('The report could not be loaded.')
        const data = await response.json()
        setReports(data.reports)
        setCampaigns(data.campaigns)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('Report data is unavailable. Check that the API server is running, then refresh.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadReport()
    return () => controller.abort()
  }, [filterKey, refreshIndex])

  function exportReport() {
    window.location.assign(`/api/reports/export.csv?${filterKey}`)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Media report home">MEDIA REPORT</a>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span></span>
          <span className="breadcrumb-divider"></span>

        </nav>
        <div className="user-profile">
          <span className="avatar">AG</span>
          <span className="user-copy"><strong>Ashish Gupta</strong><small>Admin</small></span>
        </div>
      </header>

      <main id="top" className="dashboard">
        <section className="page-heading">
          <div>
            <p className="eyebrow"></p>
            <h1>Embassy Reporting dashboard</h1>
            <p className="page-description">Compare your planned audience delivery with actual performance.</p>
          </div>
          <div className="heading-actions">
            <button
              className={`icon-button${loading ? ' is-refreshing' : ''}`}
              type="button"
              onClick={() => setRefreshIndex((value) => value + 1)}
              aria-label="Refresh report"
              title="Refresh report"
              disabled={loading}
            >
              <RefreshCw size={22} strokeWidth={1.8} />
            </button>
            <button className="export-button" type="button" onClick={exportReport}>
              <Download size={21} strokeWidth={2} />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* <section className="metric-strip" aria-label="Report summary">
          {metrics.map((metric) => (
            <div className="metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </section> */}

        <section className="report-panel" aria-labelledby="report-heading">
          <div className="report-toolbar">
            <div className="report-title">
              <p className="eyebrow muted-eyebrow">DELIVERY BREAKDOWN</p>
              <h2 id="report-heading">Target vs delivered</h2>
            </div>
            <div className="filters" aria-label="Report filters">
              <label className="search-control">
                <Search size={21} aria-hidden="true" />
                <span className="visually-hidden">Search report</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search report"
                />
              </label>
              <label className="select-control campaign-select">
                <Filter size={19} aria-hidden="true" />
                <span className="visually-hidden">Filter by campaign</span>
                <select value={campaign} onChange={(event) => setCampaign(event.target.value)}>
                  <option value="all">All campaigns</option>
                  {campaigns.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="select-control status-select">
                <span className="visually-hidden">Filter by status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="target">Target</option>
                  <option value="delivered">Delivered</option>
                </select>
              </label>
            </div>
          </div>

          <p className="table-note">All figures are shown in Indian numbering format. Target and delivered values are shown on separate rows.</p>

          {error && <div className="error-banner" role="alert">{error}</div>}

          <div className="table-scroll">
            <table className="report-table">
              <thead>
                <tr>{columns.map((column) => <th className={column.className ?? ''} key={column.key} scope="col">{column.label}</th>)}</tr>
              </thead>
              <tbody>
                {reports.map((row) => (
                  <tr className={row.status === 'Target' ? 'target-row' : 'delivered-row'} key={row.id}>
                    <th scope="row" className="campaign-cell">
                      <strong>{row.campaign}</strong>
                      <span className={`status-tag ${row.status.toLowerCase()}`}>{row.status}</span>
                    </th>
                    <td>{numberFormat.format(row.impressions)}</td>
                    <td>{numberFormat.format(row.reach)}</td>
                    <td>{row.ctr.toFixed(2)}%</td>
                    <td>{numberFormat.format(row.clicks)}</td>
                    <td>{row.totalBudget == null ? '—' : `₹${numberFormat.format(row.totalBudget)}`}</td>
                    <td className="cost-cell">{row.totalSpend == null ? '—' : `₹${numberFormat.format(row.totalSpend)}`}</td>
                  </tr>
                ))}
                {!loading && !error && reports.length === 0 && (
                  <tr><td className="empty-state" colSpan={columns.length}>No matching report rows.</td></tr>
                )}
                {loading && reports.length === 0 && (
                  <tr><td className="empty-state" colSpan={columns.length}>Loading report…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
