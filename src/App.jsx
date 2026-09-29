import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Download, ListFilter, RefreshCw, Search } from 'lucide-react'
import './App.css'

const numberFormat = new Intl.NumberFormat('en-IN')

const allColumns = [
  { key: 'campaign', label: 'Campaign', className: 'campaign-column' },
  { key: 'status', label: 'Status' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'reach', label: 'Reach' },
  { key: 'ctr', label: 'CTR' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'totalBudget', label: 'Total Budget' },
  { key: 'totalSpend', label: 'Total Spend' },
]

const dayColumns = [
  { key: 'campaign', label: 'Campaign', className: 'campaign-column' },
  { key: 'date', label: 'Date', className: 'date-column' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'ctr', label: 'CTR' },
  { key: 'reach', label: 'Reach' },
  { key: 'spend', label: 'Spend' },
]

const publisherColumns = [
  { key: 'campaign', label: 'Campaign', className: 'campaign-column' },
  { key: 'publisher', label: 'Publisher', className: 'publisher-column' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'ctr', label: 'CTR' },
  { key: 'reach', label: 'Reach' },
]

const creatorColumns = [
  { key: 'campaign', label: 'Campaign', className: 'campaign-column' },
  { key: 'creator', label: 'Creator', className: 'publisher-column' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'ctr', label: 'CTR' },
  { key: 'reach', label: 'Reach' },
]

const viewDetails = {
  all: { eyebrow: 'CAMPAIGN SUMMARY', title: 'Targeted vs delivered' },
  day: { eyebrow: 'DELIVERY BREAKDOWN', title: 'Day-wise performance' },
  publisher: { eyebrow: 'REPORT TILL 27 SEPT', title: 'Publisher-wise performance' },
  creator: { eyebrow: 'CREATOR BREAKDOWN', title: 'Creator-wise performance' },
}

function formatNumber(value) {
  return value == null ? '—' : numberFormat.format(value)
}

function ReportValues({ row, view }) {
  if (view === 'all') {
    return (
      <>
        <th scope="row" className="campaign-cell">{row.campaign}</th>
        <td><span className={`status-tag ${row.status.toLowerCase()}`}>{row.status}</span></td>
        <td>{formatNumber(row.impressions)}</td>
        <td>{formatNumber(row.reach)}</td>
        <td>{row.ctr.toFixed(2)}%</td>
        <td>{formatNumber(row.clicks)}</td>
        <td>{row.totalBudget == null ? '—' : `₹${numberFormat.format(row.totalBudget)}`}</td>
        <td className="cost-cell">{row.totalSpend == null ? '—' : `₹${numberFormat.format(row.totalSpend)}`}</td>
      </>
    )
  }

  return (
    <>
      <th scope="row" className="campaign-cell">{row.campaign}</th>
      <td className="label-cell">{view === 'publisher' ? row.publisher : view === 'creator' ? row.creator : row.date}</td>
      <td>{formatNumber(row.impressions)}</td>
      <td>{formatNumber(row.clicks)}</td>
      <td>{row.ctr == null ? '—' : `${row.ctr.toFixed(2)}%`}</td>
      <td>{formatNumber(row.reach)}</td>
      {view === 'day' && <td className="cost-cell">{row.spend == null ? '—' : `₹${numberFormat.format(row.spend)}`}</td>}
    </>
  )
}

function App() {
  const [reports, setReports] = useState([])
  const [dates, setDates] = useState([])
  const [view, setView] = useState('all')
  const [date, setDate] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filterParams = new URLSearchParams({ view, date, search, page: String(page), pageSize: '5' })
  const filterKey = filterParams.toString()
  const columns = {
    all: allColumns,
    creator: creatorColumns,
    day: dayColumns,
    publisher: publisherColumns,
  }[view]

  useEffect(() => {
    const controller = new AbortController()

    async function loadReport() {
      setLoading(true)
      setError('')
      setReports([])
      setPagination(null)
      try {
        const response = await fetch(`/api/reports?${filterKey}`, { signal: controller.signal })
        if (!response.ok) throw new Error('The report could not be loaded.')
        const data = await response.json()
        setReports(data.reports)
        setDates(data.dates)
        setPagination(data.pagination)
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
    const exportParams = new URLSearchParams({ view, date, search })
    window.location.assign(`/api/reports/export.csv?${exportParams}`)
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
              <p className="eyebrow muted-eyebrow">{viewDetails[view].eyebrow}</p>
              <h2 id="report-heading">{viewDetails[view].title}</h2>
            </div>
            <div className="filters" aria-label="Report filters">
              <label className="search-control">
                <Search size={19} aria-hidden="true" />
                <span className="visually-hidden">Search report</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder={view === 'publisher'
                    ? 'Search publisher or campaign'
                    : view === 'day' ? 'Search date or campaign' : 'Search report'}
                />
              </label>
              <label className="select-control view-select">
                <ListFilter size={19} aria-hidden="true" />
                <span className="visually-hidden">Select report view</span>
                <select value={view} onChange={(event) => {
                  setReports([])
                  setPagination(null)
                  setView(event.target.value)
                  setSearch('')
                  setPage(1)
                }}>
                  <option value="all">All</option>
                  <option value="day">Day-wise</option>
                  <option value="publisher">Publisher-wise</option>
                  <option value="creator">Creator-wise</option>
                </select>
              </label>
              {view === 'day' && (
                <label className="select-control date-select">
                  <CalendarDays size={19} aria-hidden="true" />
                  <span className="visually-hidden">Filter by date</span>
                  <select value={date} onChange={(event) => {
                    setDate(event.target.value)
                    setPage(1)
                  }}>
                    <option value="all">All dates</option>
                    {dates.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
              )}
            </div>
          </div>

         
          {error && <div className="error-banner" role="alert">{error}</div>}

          <div className="table-scroll">
            <table className={`report-table ${view}-table`}>
              <thead>
                <tr>{columns.map((column) => <th className={column.className ?? ''} key={column.key} scope="col">{column.label}</th>)}</tr>
              </thead>
              <tbody>
                {reports.map((row) => (
                  <tr className={view === 'all' ? `${row.status.toLowerCase()}-row` : ''} key={row.id}>
                    <ReportValues row={row} view={view} />
                  </tr>
                ))}
                {!loading && !error && reports.length === 0 && (
                  <tr><td className="empty-state" colSpan={columns.length}>{view === 'creator' ? 'No creator data found.' : 'No matching report rows.'}</td></tr>
                )}
                {loading && reports.length === 0 && (
                  <tr><td className="empty-state" colSpan={columns.length}>Loading report…</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <nav className="pagination" aria-label="Report pagination">
              <span className="pagination-range">
                {((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}
              </span>
              <span className="pagination-page">Page {pagination.page} of {pagination.totalPages}</span>
              <div className="pagination-actions">
                <button
                  type="button"
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  disabled={loading || pagination.page === 1}
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  disabled={loading || pagination.page === pagination.totalPages}
                  aria-label="Next page"
                  title="Next page"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
