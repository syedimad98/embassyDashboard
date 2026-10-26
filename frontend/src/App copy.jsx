import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Download, ListFilter, RefreshCw, Search } from 'lucide-react'
import adBlissLogo from './assets/AdBliss Digita logo cov.jpg'
import embassyLogo from './assets/embassy-logo.png'
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
  all: { eyebrow: 'CAMPAIGN SUMMARY', title: '' },
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

function formatCampaignDate(value) {
  if (!value) return '—'

  const cleaned = String(value).trim()
  // Format ISO dates such as 2025-05-07 without timezone shifting.
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  let date
  if (isoMatch) {
    date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
  } else {
    date = new Date(cleaned)
  }

  if (Number.isNaN(date.getTime())) return value

  const day = date.getDate()
  const suffix = day % 10 === 1 && day !== 11 ? 'st'
    : day % 10 === 2 && day !== 12 ? 'nd'
      : day % 10 === 3 && day !== 13 ? 'rd' : 'th'
  const month = date.toLocaleString('en-GB', { month: 'long' })
  return `${day}${suffix} ${month}`
}

function ReportValues({ row, view, clientView = false }) {
  if (view === 'all' && clientView) {
    return (
      <>
        <th scope="row" className="campaign-cell">{row.platform}</th>
        <td>{row.reportTill}</td>
        <td>{formatNumber(row.impressionTarget)}</td>
        <td>{formatNumber(row.clicksTarget)}</td>
        <td>{formatNumber(row.reachTarget)}</td>
        <td>{row.viewsTarget == null ? '—' : formatNumber(row.viewsTarget)}</td>
      </>
    )
  }
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

function ReportsDashboard({ currentUser, onLogout }) {
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
  const [clientCampaigns, setClientCampaigns] = useState([])
  const [clientCampaignsLoading, setClientCampaignsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('all')

  const reportView = view === 'videowise' ? videoView : view
  const filterParams = new URLSearchParams({ view: reportView, date, search, page: String(page), pageSize: '5' })
  const filterKey = filterParams.toString()
  const isClient = currentUser?.role === 'user' || currentUser?.role === 'client'

  useEffect(() => {
    if (!isClient) return undefined
    const controller = new AbortController()
    async function loadClientCampaigns() {
      setClientCampaignsLoading(true)
      try {
        const response = await fetch('/api/campaigns', { signal: controller.signal })
        const data = await response.json().catch(() => [])
        if (!response.ok) throw new Error(data.message || 'Could not load campaign data.')
        if (Array.isArray(data)) setClientCampaigns(data)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError('Campaign data is unavailable. Check that the API server is running.')
      } finally {
        if (!controller.signal.aborted) setClientCampaignsLoading(false)
      }
    }
    loadClientCampaigns()
    return () => controller.abort()
  }, [isClient, refreshIndex])

  const clientColumns = [
    { key: 'platform', label: 'Campaign name', className: 'campaign-column' },
    { key: 'campaignType', label: 'Campaign type' },
    { key: 'reportTill', label: 'Report time' },
    { key: 'startDate', label: 'Start date' },
    { key: 'endDate', label: 'End date' },
    { key: 'impressionTarget', label: 'Impression target' },
    { key: 'clicksTarget', label: 'Clicks target' },
    { key: 'reachTarget', label: 'Reach target' },
    { key: 'totalBudget', label: 'Budget' },
    { key: 'viewsTarget', label: 'Views target' },
  ]
  const columns = {
    all: isClient ? clientColumns : allColumns,
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

  function parseCampaignDate(value) {
    if (!value) return null
    const cleaned = String(value).replace(/(\d+)(st|nd|rd|th)/i, '$1').trim()
    const monthDay = cleaned.match(/^(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?$/)
    let parsed
    if (monthDay) {
      const year = Number(monthDay[3] || new Date().getFullYear())
      parsed = new Date(`${monthDay[2]} ${monthDay[1]}, ${year}`)
    } else {
      parsed = new Date(cleaned)
    }
    return Number.isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  }

  function matchesDateRange(campaign) {
    if (dateRange === 'all') return true
    const sourceDate = parseCampaignDate(campaign.reportTill || campaign.reportTime || campaign.startDate || campaign.createdAt)
    if (!sourceDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (dateRange === 'today') return sourceDate.getTime() === today.getTime()
    if (dateRange === 'yesterday') return sourceDate.getTime() === yesterday.getTime()
    if (dateRange === 'last7') {
      const start = new Date(today)
      start.setDate(today.getDate() - 6)
      return sourceDate >= start && sourceDate <= today
    }
    if (dateRange === 'last15') {
      const start = new Date(today)
      start.setDate(today.getDate() - 14)
      return sourceDate >= start && sourceDate <= today
    }
    if (dateRange === 'lastMonth') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return sourceDate >= start && sourceDate <= end
    }
    return true
  }

  const filteredClientCampaigns = clientCampaigns.filter((campaign) => {
    const searchable = `${campaign.platform || campaign.campaignName || ''} ${campaign.campaignType || ''} ${campaign.reportTill || campaign.campaignTime || ''}`.toLowerCase()
    return searchable.includes(search.toLowerCase())
  })
  const deliveredClientCampaigns = filteredClientCampaigns.filter(matchesDateRange)

  function exportReport() {
    const exportParams = new URLSearchParams({ view: reportView, date, search })
    window.location.assign(`/api/reports/export.csv?${exportParams}`)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="client-brand" href="#top" aria-label="Embassy home"><img src={embassyLogo} alt="Embassy" /></a>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span></span>
          <span className="breadcrumb-divider"></span>

        </nav>
        <div className="user-profile">
          <img className="avatar-logo" src={adBlissLogo} alt="AdBliss Digital" />
          <span className="user-copy"><strong>{currentUser?.email ? currentUser.email.split('@')[0] : 'Adbliss Digital'}</strong><small>{currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'ad-ops' ? 'Ad-ops' : 'Client'}</small></span>
          <button className="logout-button" type="button" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main id="top" className="dashboard">
        <section className="page-heading">
          <div>
            <p className="eyebrow"></p>
            <h1>Adbliss Reporting Dashboard</h1>
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

        <section className={`report-panel${isClient ? ' client-report-panel' : ''}`} aria-labelledby="report-heading">
          <div className="report-toolbar">
            <div className="report-title">
              <p className={`eyebrow muted-eyebrow${isClient && reportView === 'all' ? ' campaign-book-eyebrow' : ''}`}>{isClient && reportView === 'all' ? 'CAMPAIGN BOOK' : viewDetails[reportView].eyebrow}</p>
              {viewDetails[reportView].title && <h2 id="report-heading">{viewDetails[reportView].title}</h2>}
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
                  <option value="all">{isClient ? 'All types' : 'All'}</option>
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
                    <option value="today">Today</option>
                    <option value="yesterday">Last day</option>
                    <option value="last7">Last week</option>
                    <option value="last15">Last 15 days</option>
                    <option value="last20">Last 20 days</option>
                    <option value="lastMonth">Last month</option>
                  </select>
                </label>
              )}
            </div>
          </div>


          {error && <div className="error-banner" role="alert">{error}</div>}

          {isClient && reportView === 'all' ? (
            <div className="client-campaign-tables">
              <section className="client-data-section" aria-labelledby="campaign-book-heading">
                <h2 id="campaign-book-heading" className="visually-hidden">Campaign book</h2>
                <div className="client-book-count">{clientCampaignsLoading ? 'Loading campaigns…' : `${filteredClientCampaigns.length} campaigns`}</div>
                <div className="table-scroll">
                  <table className="report-table client-report-table client-book-table">
                    <thead><tr>{clientColumns.map((column) => <th className={column.className ?? ''} key={column.key}>{column.label}</th>)}</tr></thead>
                    <tbody>
                      {filteredClientCampaigns.map((row, index) => (
                        <tr key={row.id || row._id || `${row.platform || row.campaignName}-${index}`}>
                          <th scope="row" className="campaign-cell">{row.platform || row.campaignName || '—'}</th>
                          <td>{row.campaignType || '—'}</td>
                          <td>{row.reportTill || row.reportTime || (row.startDate ? formatCampaignDate(row.startDate) : '—')}</td>
                          <td></td>
                          <td></td>
                          <td>{row.impressionTarget == null ? '—' : formatNumber(row.impressionTarget)}</td>
                          <td>{row.clicksTarget == null ? '—' : formatNumber(row.clicksTarget)}</td>
                          <td>{row.reachTarget == null ? '—' : formatNumber(row.reachTarget)}</td>
                          <td>{row.totalBudget == null ? '—' : `₹${moneyFormat.format(Number(row.totalBudget))}`}</td>
                          <td>{row.viewsTarget == null ? '—' : formatNumber(row.viewsTarget)}</td>
                        </tr>
                      ))}
                      {!clientCampaignsLoading && filteredClientCampaigns.length === 0 && <tr><td className="empty-state" colSpan={clientColumns.length}>No campaign book entries found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="client-data-section" aria-labelledby="campaign-delivered-heading">
                <div className="client-data-heading client-delivered-heading">
                  <h2 id="campaign-delivered-heading">CAMPAIGN DELIVERED</h2>
                </div>
                <div className="table-scroll">
                  <table className="report-table client-report-table client-delivered-table">
                    <thead><tr>
                      <th className="campaign-column">Campaign name</th><th>Campaign type</th><th>Report time</th><th>Start date</th><th>End date</th>
                      <th>Impression delivered</th><th>Clicks delivered</th><th>Actual CTR</th><th>Delivered CTR</th><th>Reach delivered</th><th>Budget</th><th>Views delivered</th>
                    </tr></thead>
                    <tbody>
                      {deliveredClientCampaigns.map((row, index) => (
                        <tr key={row.id || row._id || `${row.platform || row.campaignName}-delivered-${index}`}>
                          <th scope="row" className="campaign-cell">{row.platform || row.campaignName || '—'}</th>
                          <td>{row.campaignType || '—'}</td>
                          <td>{row.reportTill || row.reportTime || (row.startDate ? formatCampaignDate(row.startDate) : '—')}</td>
                          <td></td><td></td>
                          <td>{row.impressionDelivered == null ? '—' : formatNumber(row.impressionDelivered)}</td>
                          <td>{row.clicksDelivered == null ? '—' : formatNumber(row.clicksDelivered)}</td>
                          <td>{row.actualCtr == null ? '—' : `${Number(row.actualCtr).toFixed(2)}%`}</td>
                          <td>{row.deliveredCtr == null ? '—' : `${Number(row.deliveredCtr).toFixed(2)}%`}</td>
                          <td>{row.reachDelivered == null ? '—' : formatNumber(row.reachDelivered)}</td>
                          <td>{row.totalBudget == null ? '—' : `₹${moneyFormat.format(Number(row.totalBudget))}`}</td>
                          <td>{row.viewsDelivered == null ? '—' : formatNumber(row.viewsDelivered)}</td>
                        </tr>
                      ))}
                      {!clientCampaignsLoading && deliveredClientCampaigns.length === 0 && <tr><td className="empty-state" colSpan={12}>No delivered campaign data is available for this date range.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : (
            <>
              <div className="table-scroll">
                <table className={`report-table ${reportView}-table${isClient ? ' client-report-table' : ''}`}>
                  <thead><tr>{columns.map((column) => <th className={column.className ?? ''} key={column.key} scope="col">{column.label}</th>)}</tr></thead>
                  <tbody>
                    {reports.map((row) => <tr className={reportView === 'all' && row.status ? `${row.status.toLowerCase()}-row` : ''} key={row.id}><ReportValues row={row} view={reportView} clientView={isClient} /></tr>)}
                    {reportTotal && (reportView === 'day' || reportView === 'video-ott' || reportView === 'gender' || reportView === 'age') && <tr className="total-row" key={reportTotal.id}><ReportValues row={reportTotal} view={reportView} clientView={isClient} /></tr>}
                    {!loading && !error && reports.length === 0 && <tr><td className="empty-state" colSpan={columns.length}>{reportView === 'creator' ? 'No creator data found.' : 'No matching report rows.'}</td></tr>}
                    {loading && reports.length === 0 && <tr><td className="empty-state" colSpan={columns.length}>Loading report…</td></tr>}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <nav className="pagination" aria-label="Report pagination">
                  <span className="pagination-range">{((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}</span>
                  <span className="pagination-page">Page {pagination.page} of {pagination.totalPages}</span>
                  <div className="pagination-actions">
                    <button type="button" onClick={() => setPage((currentPage) => currentPage - 1)} disabled={loading || pagination.page === 1} aria-label="Previous page" title="Previous page"><ChevronLeft size={18} aria-hidden="true" /></button>
                    <button type="button" onClick={() => setPage((currentPage) => currentPage + 1)} disabled={loading || pagination.page === pagination.totalPages} aria-label="Next page" title="Next page"><ChevronRight size={18} aria-hidden="true" /></button>
                  </div>
                </nav>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}



function AdminDashboard({ currentUser, onLogout }) {
  const emptyForm = {
    campaignName: '',
    campaignTime: '',
    startDate: '',
    endDate: '',
    impressionTarget: '',
    clicksTarget: '',
    reachTarget: '',
    viewsTarget: '',
  }
  const [form, setForm] = useState(emptyForm)
  const [campaigns, setCampaigns] = useState([])
  const [message, setMessage] = useState('')
  const [showData, setShowData] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [reportView, setReportView] = useState('all')
  const [reportPage, setReportPage] = useState(1)
  const [reportSearch, setReportSearch] = useState('')
  const [reportDate, setReportDate] = useState('all')
  const [reportRows, setReportRows] = useState([])
  const [reportTotal, setReportTotal] = useState(null)
  const [reportColumns, setReportColumns] = useState([])
  const [loadingReport, setLoadingReport] = useState(false)
  const adminPageSize = 5
  const activeReportView = reportView === 'videowise' ? 'video-ott' : reportView
  const adminViewDetails = viewDetails[activeReportView] || viewDetails.all
  const adminColumns = {
    'video-ott': videoColumns,
    day: dayColumns,
    gender: genderColumns,
    age: ageColumns,
    publisher: publisherColumns,
    creator: creatorColumns,
  }[activeReportView] || []
  const searchedCampaigns = campaigns.filter((campaign) => {
    const text = `${campaign.campaignName || campaign.platform || ''} ${campaign.campaignTime || campaign.reportTill || ''}`.toLowerCase()
    return text.includes(reportSearch.toLowerCase())
  })
  const searchedReportRows = reportRows.filter((row) => {
    const values = Object.values(row).join(' ').toLowerCase()
    const matchesSearch = values.includes(reportSearch.toLowerCase())
    const rowDate = row.date == null ? '' : String(row.date)
    const matchesDate = reportDate === 'all' || rowDate === reportDate
    return matchesSearch && matchesDate
  })
  const adminTotalRows = activeReportView === 'all' ? searchedCampaigns.length : searchedReportRows.length
  const adminTotalPages = Math.max(1, Math.ceil(adminTotalRows / adminPageSize))
  const adminPageRows = (activeReportView === 'all' ? searchedCampaigns : searchedReportRows).slice((reportPage - 1) * adminPageSize, reportPage * adminPageSize)
  const adminDates = [...new Set(reportRows.map((row) => row.date).filter(Boolean))]

  useEffect(() => {
    let active = true
    fetch('/api/campaigns')
      .then(async (response) => {
        const data = await response.json().catch(() => [])
        if (!response.ok) throw new Error(data.message || 'Could not load campaigns.')
        return data
      })
      .then((data) => {
        if (active) setCampaigns(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) setMessage('Could not load saved campaigns. Check the backend and database connection.')
      })
      .finally(() => {
        if (active) setLoadingCampaigns(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    const apiView = reportView === 'videowise' ? 'video-ott' : reportView
    setLoadingReport(true)
    fetch(`/api/reports?${new URLSearchParams({ view: apiView, date: 'all', search: '', page: '1', pageSize: '100' })}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Report could not be loaded.')
        return data
      })
      .then((data) => {
        if (!active) return
        const rows = Array.isArray(data.reports) ? data.reports : []
        setReportRows(rows)
        setReportTotal(data.total ?? null)
        setReportColumns(rows.length ? Object.keys(rows[0]).filter((key) => !['id', 'status'].includes(key)) : [])
      })
      .catch(() => {
        if (active) {
          setReportRows([])
          setReportTotal(null)
          setReportColumns([])
        }
      })
      .finally(() => { if (active) setLoadingReport(false) })
    return () => { active = false }
  }, [reportView])

  useEffect(() => {
    if (reportPage > adminTotalPages) setReportPage(adminTotalPages)
  }, [reportPage, adminTotalPages])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setMessage('')
  }

  async function saveCampaign(campaign) {
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
      },
      body: JSON.stringify(campaign),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.message || 'Campaign could not be saved.')
    return result
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const campaignName = form.campaignName.trim()
    if (!campaignName) {
      setMessage('Please enter a campaign name.')
      return
    }

    setMessage('')
    try {
      const result = await saveCampaign({
        campaignName,
        campaignTime: form.campaignTime.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        impressionTarget: Number(form.impressionTarget) || 0,
        clicksTarget: Number(form.clicksTarget) || 0,
        reachTarget: Number(form.reachTarget) || 0,
        viewsTarget: Number(form.viewsTarget) || 0,
      })
      setCampaigns((current) => [...current, result])
      setForm(emptyForm)
      setMessage('Campaign details submitted successfully.')
      setShowData(false)
    } catch (submitError) {
      setMessage(submitError.message || 'Campaign could not be saved. Check the backend and database connection.')
    }
  }

  function parseCsv(text) {
    const rows = []
    let row = []
    let cell = ''
    let quoted = false
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]
      if (char === '"' && quoted && text[i + 1] === '"') {
        cell += '"'
        i += 1
      } else if (char === '"') {
        quoted = !quoted
      } else if (char === ',' && !quoted) {
        row.push(cell.trim())
        cell = ''
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[i + 1] === '\n') i += 1
        row.push(cell.trim())
        if (row.some((value) => value !== '')) rows.push(row)
        row = []
        cell = ''
      } else {
        cell += char
      }
    }
    if (cell.length || row.length) {
      row.push(cell.trim())
      if (row.some((value) => value !== '')) rows.push(row)
    }
    if (rows.length < 2) throw new Error('The CSV file is empty or has no data rows.')
    const headers = rows[0].map((header) => header.trim().toLowerCase().replace(/[\s_-]+/g, ''))
    const getValue = (record, ...names) => {
      const index = headers.findIndex((header) => names.includes(header))
      return index >= 0 ? record[index] || '' : ''
    }
    return rows.slice(1).map((record) => ({
      campaignName: getValue(record, 'campaignname', 'campaign', 'platform', 'name'),
      campaignTime: getValue(record, 'campaigntime', 'reporttime', 'reporttill', 'time'),
      startDate: getValue(record, 'startdate', 'reportstartdate'),
      endDate: getValue(record, 'enddate'),
      impressionTarget: Number(getValue(record, 'impressiontarget', 'impressions')) || 0,
      clicksTarget: Number(getValue(record, 'clickstarget', 'clicks')) || 0,
      reachTarget: Number(getValue(record, 'reachtarget', 'reach')) || 0,
      viewsTarget: Number(getValue(record, 'viewstarget', 'views')) || 0,
    })).filter((campaign) => campaign.campaignName.trim())
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setMessage('')
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage('Please select a CSV file. Excel and other file formats are not supported yet.')
      return
    }
    try {
      const campaignsFromFile = parseCsv(await file.text())
      if (!campaignsFromFile.length) throw new Error('No campaign rows found. Check the CSV column headings.')
      const savedCampaigns = []
      for (const campaign of campaignsFromFile) {
        savedCampaigns.push(await saveCampaign(campaign))
      }
      setCampaigns((current) => [...current, ...savedCampaigns])
      setMessage(`${savedCampaigns.length} campaign${savedCampaigns.length === 1 ? '' : 's'} imported successfully from CSV.`)
      setShowData(false)
    } catch (uploadError) {
      setMessage(uploadError.message || 'Could not import the CSV file.')
    } finally {
      event.target.value = ''
    }
  }

  function handleReset() {
    setForm(emptyForm)
    setMessage('')
  }

  function formatCell(value) {
    if (value == null || value === '') return '—'
    if (typeof value === 'number') return Number(value).toLocaleString('en-IN')
    return String(value)
  }

  return (
    <div className="app-shell">
      <header className="topbar admin-topbar">
        <a className="wordmark" href="#admin-home" aria-label="Adbliss home">ADBLISS REPORT</a>
        <div className="user-profile">
          <img className="avatar-logo" src={adBlissLogo} alt="AdBliss Digital" />
          <span className="user-copy">
            <strong>{currentUser?.email ? currentUser.email.split('@')[0] : 'Adbliss Digital'}</strong>
            <small>Admin</small>
          </span>
          <button className="logout-button" type="button" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main id="admin-home" className="dashboard admin-dashboard">
        <section className="page-heading">
          <div>
            <h1>Adbliss Reporting Dashboard</h1>
            <p className="page-description">Enter campaign details and targets.</p>
          </div>
        </section>

        <section className="admin-entry-panel" aria-labelledby="admin-form-heading">
          <div className="admin-panel-heading">
            <h2 id="admin-form-heading">Campaign details</h2>
            <input
              id="admin-csv-upload"
              className="visually-hidden"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
            />
            <button className="admin-upload-button" type="button" onClick={() => document.getElementById('admin-csv-upload')?.click()}>
              Upload
            </button>
          </div>
          <form id="admin-campaign-form" className="admin-campaign-form" onSubmit={handleSubmit}>
            <div className="admin-detail-fields">
              <label className="admin-inline-field">
                <span>Campaign name</span>
                <input name="campaignName" value={form.campaignName} onChange={updateField} placeholder="Enter campaign name" required />
              </label>
              <label className="admin-inline-field">
                <span>Campaign time</span>
                <input name="campaignTime" value={form.campaignTime} onChange={updateField} placeholder="e.g. Monthly" />
              </label>
              <label className="admin-inline-field">
                <span>Report start date</span>
                <input type="date" name="startDate" value={form.startDate} onChange={updateField} />
              </label>
              <label className="admin-inline-field">
                <span>End date</span>
                <input type="date" name="endDate" value={form.endDate} onChange={updateField} />
              </label>
            </div>
            <div className="admin-target-fields">
              <label className="admin-inline-field">
                <span>Impression target</span>
                <input type="number" min="0" name="impressionTarget" value={form.impressionTarget} onChange={updateField} placeholder="0" />
              </label>
              <label className="admin-inline-field">
                <span>Clicks target</span>
                <input type="number" min="0" name="clicksTarget" value={form.clicksTarget} onChange={updateField} placeholder="0" />
              </label>
              <label className="admin-inline-field">
                <span>Reach target</span>
                <input type="number" min="0" name="reachTarget" value={form.reachTarget} onChange={updateField} placeholder="0" />
              </label>
              <label className="admin-inline-field">
                <span>Views target</span>
                <input type="number" min="0" name="viewsTarget" value={form.viewsTarget} onChange={updateField} placeholder="0" />
              </label>
            </div>
            {message && <p className={`admin-form-message${message.startsWith('Please') || message.startsWith('Could not') || message.startsWith('No ') ? ' is-error' : ''}`} role="status">{message}</p>}
            {selectedFile && <p className="admin-selected-file">Selected file: {selectedFile.name}</p>}
            <div className="admin-form-actions">
              <button className="admin-submit-button" type="submit">Submit</button>
              <button className="admin-reset-button" type="button" onClick={handleReset}>Reset</button>
            </div>
          </form>
        </section>

        <section className="admin-entry-panel admin-data-panel" aria-labelledby="admin-data-heading">
          <div className="admin-panel-heading admin-report-heading">
            <h2 id="admin-data-heading">Campaign report</h2>
            <div className="admin-report-controls">
              <span>{loadingCampaigns ? 'Loading campaigns…' : `${campaigns.length} ${campaigns.length === 1 ? 'campaign' : 'campaigns'}`}</span>
              <button
                className="admin-view-button"
                type="button"
                onClick={() => setShowData((visible) => !visible)}
                aria-expanded={showData}
              >
                {showData ? 'Hide' : 'View'}
              </button>
            </div>
          </div>
          {showData && (
            <>
              <div className="report-toolbar admin-client-toolbar">
                <div className="report-title">
                  <p className="eyebrow muted-eyebrow">{adminViewDetails.eyebrow}</p>
                  {adminViewDetails.title && <h2>{adminViewDetails.title}</h2>}
                </div>
                <div className="filters" aria-label="Campaign report filters">
                  <label className="search-control">
                    <Search size={19} aria-hidden="true" />
                    <span className="visually-hidden">Search report</span>
                    <input
                      type="search"
                      value={reportSearch}
                      onChange={(event) => { setReportSearch(event.target.value); setReportPage(1) }}
                      placeholder={activeReportView === 'publisher' ? 'Search publisher or campaign' : activeReportView === 'day' || activeReportView === 'video-ott' ? 'Search date' : 'Search report'}
                    />
                  </label>
                  <label className="select-control admin-report-select">
                    <ListFilter size={19} aria-hidden="true" />
                    <span className="visually-hidden">Select report view</span>
                    <select value={reportView} onChange={(event) => { setReportView(event.target.value); setReportPage(1); setReportDate('all'); setReportSearch('') }}>
                      <option value="all">All</option>
                      <option value="videowise">Video-wise</option>
                      <option value="day">Day-wise</option>
                      <option value="gender">Gender-wise</option>
                      <option value="age">Age-wise</option>
                      <option value="publisher">Publisher-wise</option>
                      <option value="creator">Creator-wise</option>
                    </select>
                  </label>
                  {(activeReportView === 'day' || activeReportView === 'video-ott') && (
                    <label className="select-control date-select">
                      <CalendarDays size={19} aria-hidden="true" />
                      <span className="visually-hidden">Filter by date</span>
                      <select value={reportDate} onChange={(event) => { setReportDate(event.target.value); setReportPage(1) }}>
                        <option value="all">All dates</option>
                        {adminDates.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              </div>
              {activeReportView === 'all' && searchedCampaigns.length === 0 ? (
                <p className="admin-empty-state">{loadingCampaigns ? 'Loading saved campaigns…' : 'No campaign data yet. Fill in the form and select Submit.'}</p>
              ) : activeReportView !== 'all' && !loadingReport && searchedReportRows.length === 0 ? (
                <p className="admin-empty-state">No report data available for this view.</p>
              ) : (
                <>
                  <div className="table-scroll">
                    <table className={`report-table ${activeReportView}-table admin-campaign-table`}>
                      <thead><tr>{(activeReportView === 'all'
                        ? [
                            { key: 'campaignName', label: 'Campaign name', className: 'campaign-column' },
                            { key: 'campaignTime', label: 'Report time', className: 'date-column' },
                            { key: 'impressionTarget', label: 'Impression target' },
                            { key: 'clicksTarget', label: 'Clicks target' },
                            { key: 'reachTarget', label: 'Reach target' },
                            { key: 'viewsTarget', label: 'Views target' },
                          ]
                        : adminColumns
                      ).map((column) => <th className={column.className ?? ''} key={column.key} scope="col">{column.label}</th>)}</tr></thead>
                      <tbody>
                        {loadingReport && activeReportView !== 'all' ? (
                          <tr><td className="empty-state" colSpan={Math.max(adminColumns.length, 1)}>Loading report…</td></tr>
                        ) : adminPageRows.map((row, index) => activeReportView === 'all' ? (
                          <tr key={row.id || row._id || row.campaignName || `campaign-${index}`}>
                            <th scope="row" className="campaign-cell">{row.campaignName || row.platform || '—'}</th>
                            <td>{row.campaignTime || row.reportTill || '—'}</td>
                            <td>{row.impressionTarget == null ? '—' : Number(row.impressionTarget).toLocaleString('en-IN')}</td>
                            <td>{row.clicksTarget == null ? '—' : Number(row.clicksTarget).toLocaleString('en-IN')}</td>
                            <td>{row.reachTarget == null ? '—' : Number(row.reachTarget).toLocaleString('en-IN')}</td>
                            <td>{row.viewsTarget == null ? '—' : Number(row.viewsTarget).toLocaleString('en-IN')}</td>
                          </tr>
                        ) : (
                          <tr key={row.id || `${activeReportView}-${index}`}>
                            <ReportValues row={row} view={activeReportView} />
                          </tr>
                        ))}
                        {reportTotal && ['day', 'video-ott', 'gender', 'age'].includes(activeReportView) && (
                          <tr className="total-row" key={reportTotal.id || `${activeReportView}-total`}>
                            <ReportValues row={reportTotal} view={activeReportView} />
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {adminTotalPages > 1 && !(loadingReport && reportView !== 'all') && (
                    <nav className="pagination" aria-label="Campaign report pagination">
                      <span className="pagination-range">
                        {((reportPage - 1) * adminPageSize) + 1}–{Math.min(reportPage * adminPageSize, adminTotalRows)} of {adminTotalRows}
                      </span>
                      <span className="pagination-page">Page {reportPage} of {adminTotalPages}</span>
                      <div className="pagination-actions">
                        <button type="button" onClick={() => setReportPage((current) => Math.max(1, current - 1))} disabled={reportPage === 1} aria-label="Previous page" title="Previous page">
                          <ChevronLeft size={18} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setReportPage((current) => Math.min(adminTotalPages, current + 1))} disabled={reportPage === adminTotalPages} aria-label="Next page" title="Next page">
                          <ChevronRight size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </nav>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}

function AuthScreen({ mode, onModeChange, onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const endpoint = mode === 'register' ? '/api/auth/signup' : '/api/auth/login'
      const payload = mode === 'register'
        ? { email: email.trim(), password, registerAs: role }
        : { email: email.trim(), password }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.message || result.error?.message || 'Authentication failed. Please try again.')
      }

      if (mode === 'register') {
        setSuccess('Registration successful. Please log in with the same email address and password.')
        setPassword('')
        setError('')
        onModeChange('login')
        return
      }

      if (!result.token || !result.user) {
        throw new Error('The server response was incomplete. Please check the backend.')
      }

      onAuthenticated({ ...result.user, token: result.token })
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-eyebrow">ADBLISS REPORT</p>
        <h1>{mode === 'register' ? 'Sign up' : 'Login'}</h1>
        <p className="auth-description">
          {mode === 'register' ? 'Create your AdBliss reporting account' : 'Welcome back to AdBliss reporting dashboard'}
        </p>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <fieldset className="auth-role-group">
              <legend>Register as</legend>
              <label><input type="radio" name="auth-role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} /> <span>Admin</span></label>
              <label><input type="radio" name="auth-role" value="ad-ops" checked={role === 'ad-ops'} onChange={() => setRole('ad-ops')} /> <span>Ad-ops</span></label>
              <label><input type="radio" name="auth-role" value="user" checked={role === 'user'} onChange={() => setRole('user')} /> <span>Client</span></label>
            </fieldset>
          )}
          <label htmlFor="auth-email">Email address</label>
          <input id="auth-email" type="email" autoComplete="email" required value={email}
            onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            minLength={mode === 'register' ? 8 : undefined} required value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === 'register' ? 'Create a strong password' : 'Enter your password'} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          {success && <p className="auth-success" role="status">{success}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Log in'}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'register' ? 'Already registered?' : 'New here?'}{' '}
          <button type="button" onClick={() => { setError(''); setSuccess(''); onModeChange(mode === 'register' ? 'login' : 'register') }}>
            {mode === 'register' ? 'Login' : 'Sign up'}
          </button>
        </p>
        <p className="auth-footnote">Choose the role linked to your account. Admin access must be authorized by an administrator.</p>
      </section>
    </main>
  )
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('embassyDashboardSession')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [authMode, setAuthMode] = useState('register')

  function handleAuthenticated(user) {
    localStorage.setItem('embassyDashboardSession', JSON.stringify(user))
    setCurrentUser(user)
  }

  function handleLogout() {
    localStorage.removeItem('embassyDashboardSession')
    setCurrentUser(null)
    setAuthMode('login')
  }

  if (!currentUser) {
    return <AuthScreen mode={authMode} onModeChange={setAuthMode} onAuthenticated={handleAuthenticated} />
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
  }

  return <ReportsDashboard currentUser={currentUser} onLogout={handleLogout} />
}

export default App
