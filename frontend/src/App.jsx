import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Download, ListFilter, RefreshCw, Search } from 'lucide-react'
import adBlissLogo from './assets/AdBliss Digita logo cov.jpg'
import './App.css'

const numberFormat = new Intl.NumberFormat('en-IN')
const moneyFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const allColumns = [
  { key: 'platform', label: 'Platform', className: 'campaign-column' },
  { key: 'reportTill', label: 'Report till', className: 'date-column' },
  { key: 'impressionTarget', label: 'Impression target' },
  { key: 'impressionDelivered', label: 'Impression delivered' },
  { key: 'clicksTarget', label: 'Clicks target' },
  { key: 'clicksDelivered', label: 'Clicks delivered' },
  { key: 'actualCtr', label: 'Actual CTR' },
  { key: 'deliveredCtr', label: 'Delivered CTR' },
  { key: 'reachTarget', label: 'Reach target' },
  { key: 'reachDelivered', label: 'Reach delivered' },
  { key: 'viewsTarget', label: 'Views target' },
  { key: 'viewsDelivered', label: 'Views delivered' },
  { key: 'totalBudget', label: 'Total Budget' },
  { key: 'totalSpend', label: 'Total Spend' },
]

const dayColumns = [
  { key: 'date', label: 'Date', className: 'date-column' },
  { key: 'impressions', label: 'Impression' },
  { key: 'clicks', label: 'Click' },
  { key: 'ctr', label: 'CTR' },
  { key: 'reach', label: 'Reach' },
  { key: 'spend', label: 'Spend' },
]

const videoColumns = [
  { key: 'date', label: 'Date', className: 'date-column' },
  { key: 'impressions', label: 'Impression' },
  { key: 'clicks', label: 'Click' },
  { key: 'ctr', label: 'CTR' },
  { key: 'reach', label: 'Reach' },
  { key: 'views', label: 'Views' },
  { key: 'spend', label: 'Spend' },
]

const genderColumns = [
  { key: 'gender', label: 'Gender', className: 'date-column' },
  { key: 'impressions', label: 'Impression' },
  { key: 'clicks', label: 'Click' },
  { key: 'ctr', label: 'CTR' },
  { key: 'reach', label: 'Reach' },
]

const ageColumns = [
  { key: 'ageGroup', label: 'Age group', className: 'date-column' },
  { key: 'impressions', label: 'Impression' },
  { key: 'clicks', label: 'Click' },
  { key: 'ctr', label: 'CTR' },
  { key: 'reach', label: 'Reach' },
]

const publisherColumns = [
  { key: 'publisher', label: 'Publisher', className: 'publisher-column' },
  { key: 'impressions', label: 'Impression' },
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
  all: { eyebrow: 'CAMPAIGN SUMMARY', title: 'Platform performance' },
  'video-ott': { eyebrow: 'VIDEO OTT SUMMARY', title: 'Video OTT platform performance' },
  day: { eyebrow: 'DELIVERY BREAKDOWN', title: 'Day-wise performance' },
  gender: { eyebrow: 'AUDIENCE BREAKDOWN', title: 'Gender-wise performance' },
  age: { eyebrow: 'AUDIENCE BREAKDOWN', title: 'Age-wise performance' },
  publisher: { eyebrow: 'REPORT TILL 30 SEPT', title: 'Publisher-wise performance' },
  creator: { eyebrow: 'CREATOR BREAKDOWN', title: 'Creator-wise performance' },
}

function formatNumber(value) {
  return value == null ? '—' : numberFormat.format(value)
}

function ReportValues({ row, view }) {
  if (view === 'all') {
    return (
      <>
        <th scope="row" className="campaign-cell">{row.platform}</th>
        <td>{row.reportTill}</td>
        <td>{formatNumber(row.impressionTarget)}</td>
        <td>{formatNumber(row.impressionDelivered)}</td>
        <td>{formatNumber(row.clicksTarget)}</td>
        <td>{formatNumber(row.clicksDelivered)}</td>
        <td>{row.actualCtr.toFixed(2)}%</td>
        <td>{row.deliveredCtr.toFixed(2)}%</td>
        <td>{formatNumber(row.reachTarget)}</td>
        <td>{formatNumber(row.reachDelivered)}</td>
        <td>{row.viewsTarget == null ? '—' : formatNumber(row.viewsTarget)}</td>
        <td>{row.viewsDelivered == null ? '—' : formatNumber(row.viewsDelivered)}</td>
        <td>₹{formatNumber(row.totalBudget)}</td>
        <td className="cost-cell">₹{formatNumber(row.totalSpend)}</td>
      </>
    )
  }

  if (view === 'video-ott') {
    return (
      <>
        <th scope="row" className="label-cell">{row.date}</th>
        <td>{formatNumber(row.impressions)}</td>
        <td>{formatNumber(row.clicks)}</td>
        <td>{row.ctr == null ? '—' : `${row.ctr.toFixed(2)}%`}</td>
        <td>{formatNumber(row.reach)}</td>
        <td>{formatNumber(row.views)}</td>
        <td className="cost-cell">{row.spend == null ? '—' : `₹${moneyFormat.format(row.spend)}`}</td>
      </>
    )
  }

  if (view === 'day') {
    return (
      <>
        <th scope="row" className="label-cell">{row.date}</th>
        <td>{formatNumber(row.impressions)}</td>
        <td>{formatNumber(row.clicks)}</td>
        <td>{row.ctr == null ? '—' : `${row.ctr.toFixed(2)}%`}</td>
        <td>{formatNumber(row.reach)}</td>
        <td className="cost-cell">{row.spend == null ? '—' : `₹${numberFormat.format(row.spend)}`}</td>
      </>
    )
  }

  if (view === 'gender' || view === 'age') {
    return (
      <>
        <th scope="row" className="label-cell">{view === 'gender' ? row.gender : row.ageGroup}</th>
        <td>{formatNumber(row.impressions)}</td>
        <td>{formatNumber(row.clicks)}</td>
        <td>{row.ctr == null ? '—' : `${row.ctr.toFixed(2)}%`}</td>
        <td>{formatNumber(row.reach)}</td>
      </>
    )
  }

  if (view === 'publisher') {
    return (
      <>
        <th scope="row" className="label-cell">{row.publisher}</th>
        <td>{formatNumber(row.impressions)}</td>
        <td>{formatNumber(row.clicks)}</td>
        <td>{row.ctr == null ? '—' : `${row.ctr.toFixed(2)}%`}</td>
        <td>{formatNumber(row.reach)}</td>
      </>
    )
  }

  return (
    <>
      <th scope="row" className="campaign-cell">{row.campaign}</th>
      <td className="label-cell">{row.creator}</td>
      <td>{formatNumber(row.impressions)}</td>
      <td>{formatNumber(row.clicks)}</td>
      <td>{row.ctr == null ? '—' : `${row.ctr.toFixed(2)}%`}</td>
      <td>{formatNumber(row.reach)}</td>
    </>
  )
}

function App() {
  const [reports, setReports] = useState([])
  const [reportTotal, setReportTotal] = useState(null)
  const [dates, setDates] = useState([])
  const [view, setView] = useState('all')
  const [videoView, setVideoView] = useState('video-ott')
  const [date, setDate] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reportView = view === 'videowise' ? videoView : view
  const filterParams = new URLSearchParams({ view: reportView, date, search, page: String(page), pageSize: '5' })
  const filterKey = filterParams.toString()
  const columns = {
    all: allColumns,
    'video-ott': videoColumns,
    creator: creatorColumns,
    day: dayColumns,
    gender: genderColumns,
    age: ageColumns,
    publisher: publisherColumns,
  }[reportView]

  useEffect(() => {
    const controller = new AbortController()

    async function loadReport() {
      setLoading(true)
      setError('')
      setReports([])
      setReportTotal(null)
      setPagination(null)
      try {
        const response = await fetch(`/api/reports?${filterKey}`, { signal: controller.signal })
        if (!response.ok) throw new Error('The report could not be loaded.')
        const data = await response.json()
        setReports(data.reports)
        setReportTotal(data.total ?? null)
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
    const exportParams = new URLSearchParams({ view: reportView, date, search })
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
          <img className="avatar-logo" src={adBlissLogo} alt="AdBliss Digital" />
          <span className="user-copy"><strong>Adbliss Digital</strong><small>Admin</small></span>
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
              <p className="eyebrow muted-eyebrow">{viewDetails[reportView].eyebrow}</p>
              <h2 id="report-heading">{viewDetails[reportView].title}</h2>
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
                  placeholder={reportView === 'publisher'
                    ? 'Search publisher or campaign'
                    : reportView === 'day' || reportView === 'video-ott'
                      ? 'Search date'
                      : reportView === 'gender'
                        ? 'Search gender or campaign'
                        : reportView === 'age'
                          ? 'Search age group or campaign'
                          : 'Search report'}
                />
              </label>
              <label className="select-control view-select">
                <ListFilter size={19} aria-hidden="true" />
                <span className="visually-hidden">Select report view</span>
                <select value={view} onChange={(event) => {
                  setReports([])
                  setReportTotal(null)
                  setPagination(null)
                  setView(event.target.value)
                  if (event.target.value === 'videowise') setVideoView('video-ott')
                  setDate('all')
                  setSearch('')
                  setPage(1)
                }}>
                  <option value="all">All</option>
                  <option value="videowise">Video-wise</option>
                  <option value="day">Day-wise</option>
                  <option value="gender">Gender-wise</option>
                  <option value="age">Age-wise</option>
                  <option value="publisher">Publisher-wise</option>
                  <option value="creator">Creator-wise</option>
                </select>
              </label>
              {view === 'videowise' && (
                <label className="select-control view-select">
                  <ListFilter size={19} aria-hidden="true" />
                  <span className="visually-hidden">Select Video-wise report</span>
                  <select value={videoView} onChange={(event) => {
                    setVideoView(event.target.value)
                    setDate('all')
                    setSearch('')
                    setPage(1)
                  }}>
                    <option value="video-ott">Video OTT</option>
                    <option value="day">Daywise</option>
                    <option value="publisher">Sitewise</option>
                    <option value="gender">Genderwise</option>
                    <option value="age">Agewise</option>
                  </select>
                </label>
              )}
              {(reportView === 'day' || reportView === 'video-ott') && (
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
            <table className={`report-table ${reportView}-table`}>
              <thead>
                <tr>{columns.map((column) => <th className={column.className ?? ''} key={column.key} scope="col">{column.label}</th>)}</tr>
              </thead>
              <tbody>
                {reports.map((row) => (
                  <tr className={reportView === 'all' && row.status ? `${row.status.toLowerCase()}-row` : ''} key={row.id}>
                  <ReportValues row={row} view={reportView} />
                  </tr>
                ))}
                {reportTotal && (reportView === 'day' || reportView === 'video-ott' || reportView === 'gender' || reportView === 'age') && (
                  <tr className="total-row" key={reportTotal.id}>
                    <ReportValues row={reportTotal} view={reportView} />
                  </tr>
                )}
                {!loading && !error && reports.length === 0 && (
                  <tr><td className="empty-state" colSpan={columns.length}>{reportView === 'creator' ? 'No creator data found.' : 'No matching report rows.'}</td></tr>
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
