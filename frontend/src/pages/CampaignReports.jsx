import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  ListFilter,
  LogOut,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react'
import adBlissLogo from '../assets/AdBliss Digita logo cov.jpg'
import embassyLogo from '../assets/embassy-logo.png'
import '../App.css'

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

function parseRangeDate(value, fallbackYear = new Date().getFullYear()) {
  if (!value) return null
  const text = String(value).trim()
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  const cleaned = text.replace(/(\d+)(st|nd|rd|th)/i, '$1').trim()
  const monthDay = cleaned.match(/^(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?$/)
  let parsed
  if (monthDay) {
    const year = Number(monthDay[3] || fallbackYear)
    parsed = new Date(`${monthDay[2]} ${monthDay[1]}, ${year}`)
  } else {
    parsed = new Date(cleaned)
  }
  return Number.isNaN(parsed.getTime())
    ? null
    : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function isWithinDateRange(value, fromDate, toDate) {
  if (!fromDate && !toDate) return true
  const dateValue = parseRangeDate(value)
  if (!dateValue) return false
  const from = fromDate ? parseRangeDate(fromDate) : null
  const to = toDate ? parseRangeDate(toDate) : null
  if (from && dateValue < from) return false
  if (to && dateValue > to) return false
  return true
}

export function ReportsDashboard({
  currentUser,
  onLogout,
  embedded = false,
  clientCampaignsEndpoint = '/api/campaigns',
}) {
  const [reports, setReports] = useState([])
  const [reportTotal, setReportTotal] = useState(null)
  const [dates, setDates] = useState([])
  const [view, setView] = useState('all')
  const [videoView, setVideoView] = useState('video-ott')
  const [date, setDate] = useState('all')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clientCampaigns, setClientCampaigns] = useState([])
  const [clientCampaignsLoading, setClientCampaignsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('all')

  const reportView = view === 'videowise' ? videoView : view
  const hasDateRange = Boolean(fromDate || toDate)
  const filterParams = new URLSearchParams({ view: reportView, date, search, from: fromDate, to: toDate, page: String(hasDateRange ? 1 : page), pageSize: hasDateRange ? '50' : '5' })
  const filterKey = filterParams.toString()
  const isClient = currentUser?.role === 'user' || currentUser?.role === 'client'
  const isCampaignBookView = isClient || (embedded && currentUser?.role === 'ad-ops')

  useEffect(() => {
    if (!isCampaignBookView) return undefined
    const controller = new AbortController()
    async function loadClientCampaigns() {
      setClientCampaignsLoading(true)
      try {
        const response = await fetch(clientCampaignsEndpoint, {
          headers: currentUser?.token ? { Authorization: 'Bearer ' + currentUser.token } : {},
          signal: controller.signal,
        })
        const data = await response.json().catch(() => [])
        if (!response.ok) throw new Error(data?.error?.message || data.message || 'Could not load campaign data.')
        if (Array.isArray(data)) setClientCampaigns(data)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') setError('Campaign data is unavailable. Check that the API server is running.')
      } finally {
        if (!controller.signal.aborted) setClientCampaignsLoading(false)
      }
    }
    loadClientCampaigns()
    return () => controller.abort()
  }, [clientCampaignsEndpoint, currentUser?.token, isCampaignBookView, refreshIndex])

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
        setReportTotal(hasDateRange ? null : (data.total ?? null))
        setDates(data.dates)
        setPagination(hasDateRange ? null : data.pagination)
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
  }, [filterKey, refreshIndex, hasDateRange])

  function matchesCampaignDateRange(campaign) {
    if (campaign.startDate || campaign.endDate) {
      if (fromDate && (campaign.endDate || campaign.startDate) < fromDate) return false
      if (toDate && (campaign.startDate || campaign.endDate) > toDate) return false
      return true
    }
    const reportDate = campaign.reportTill || campaign.reportTime || campaign.campaignTime || campaign.startDate || campaign.createdAt
    return isWithinDateRange(reportDate, fromDate, toDate)
  }

  const filteredClientCampaigns = clientCampaigns.filter((campaign) => {
    const searchable = `${campaign.platform || campaign.campaignName || ''} ${campaign.campaignType || ''} ${campaign.reportTill || campaign.campaignTime || ''}`.toLowerCase()
    return searchable.includes(search.toLowerCase()) && matchesCampaignDateRange(campaign)
  })
  const deliveredClientCampaigns = filteredClientCampaigns
  const displayedReports = hasDateRange
    ? reports.filter((row) => isWithinDateRange(row.date || row.reportTill || row.reportTime || row.campaignTime, fromDate, toDate))
    : reports

  function exportReport() {
    const exportParams = new URLSearchParams({ view: reportView, date, search, from: fromDate, to: toDate })
    window.location.assign(`/api/reports/export.csv?${exportParams}`)
  }

  return (
    <div className={`app-shell${embedded ? ' embedded-report-shell' : ''}`}>
      {!embedded && (
        <header className="topbar">
          <a className="client-brand" href="#top" aria-label="Embassy home"><img src={embassyLogo} alt="Embassy" /></a>
          <span className="client-name">Embassy</span>
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <span></span>
            <span className="breadcrumb-divider"></span>
          </nav>
          <div className="user-profile">
            <img className="avatar-logo" src={adBlissLogo} alt="AdBliss Digital" />
            <span className="user-copy"><strong>{currentUser?.clientName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Adbliss Digital')}</strong><small>{currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'ad-ops' ? 'Ad-ops' : 'Client'}</small></span>
            <button
              className="logout-button"
              type="button"
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>
      )}

      <main id={embedded ? undefined : 'top'} className={`dashboard${embedded ? ' embedded-report-dashboard' : ''}`}>
        <section className="page-heading">
          <div>
            <p className="eyebrow"></p>
            <h1>{embedded ? 'Campaign reporting' : 'Adbliss Reporting Dashboard'}</h1>
            <p className="page-description">Compare your planned audience delivery with actual performance.</p>
          </div>
          <div className="heading-actions">
            {!embedded && (
              <button
                type="button"
                className="upload-images-btn"
                onClick={() => window.open('/embassy-dashboard/upload-images', '_blank', 'noopener,noreferrer')}
              >
                <Upload size={18} />
                Upload Screenshots
              </button>
            )}
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
              <p className="eyebrow muted-eyebrow">{isCampaignBookView && reportView === 'all' ? 'CAMPAIGN BOOK' : viewDetails[reportView].eyebrow}</p>
              {viewDetails[reportView].title && <h2 id="report-heading">{viewDetails[reportView].title}</h2>}
            </div>
            <div className="filters" aria-label="Report filters">
              {(isCampaignBookView && reportView === 'all' || reportView === 'day' || reportView === 'video-ott') && (
                <div className="date-range-fields" aria-label="Filter by date range">
                  <label className="date-input-control">
                    <span>From</span>
                    <input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); setDate('all'); setPage(1) }} />
                  </label>
                  <label className="date-input-control">
                    <span>To</span>
                    <input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); setDate('all'); setPage(1) }} />
                  </label>
                </div>
              )}
              {reportView !== 'day' && reportView !== 'video-ott' && (
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
                      : reportView === 'gender'
                        ? 'Search gender or campaign'
                        : reportView === 'age'
                          ? 'Search age group or campaign'
                          : 'Search report'}
                  />
                </label>
              )}
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
                  <option value="all">{isClient ? 'Summary' : 'All'}</option>
                  <option value="videowise">Video-wise</option>
                  <option value="day">Day-wise</option>
                  <option value="gender">Gender-wise</option>
                  <option value="age">Age-wise</option>
                  <option value="publisher">Publisher-wise</option>
                  <option value="creator">Creator-wise</option>
                </select>
              </label>
              {(reportView === 'day' || reportView === 'video-ott') && (
                <label className="select-control date-select">
                  <CalendarDays size={19} aria-hidden="true" />
                  <span className="visually-hidden">Filter by date</span>
                  <select value={date} onChange={(event) => {
                    setDate(event.target.value)
                    setFromDate('')
                    setToDate('')
                    setPage(1)
                  }}>
                    <option value="all">All dates</option>
                    {dates.filter((item) => item.value !== "all").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
              )}
            </div>
          </div>


          {error && <div className="error-banner" role="alert">{error}</div>}

          {isCampaignBookView && reportView === 'all' ? (
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
                          <td>{row.startDate ? formatCampaignDate(row.startDate) : '—'}</td>
                          <td>{row.endDate ? formatCampaignDate(row.endDate) : '—'}</td>
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
                          <td>{row.startDate ? formatCampaignDate(row.startDate) : '—'}</td>
                          <td>{row.endDate ? formatCampaignDate(row.endDate) : '—'}</td>
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
                    {displayedReports.map((row) => <tr className={reportView === 'all' && row.status ? `${row.status.toLowerCase()}-row` : ''} key={row.id}><ReportValues row={row} view={reportView} clientView={isClient} /></tr>)}
                    {reportTotal && !hasDateRange && (reportView === 'day' || reportView === 'video-ott' || reportView === 'gender' || reportView === 'age') && <tr className="total-row" key={reportTotal.id}><ReportValues row={reportTotal} view={reportView} clientView={isClient} /></tr>}
                    {!loading && !error && displayedReports.length === 0 && <tr><td className="empty-state" colSpan={columns.length}>{reportView === 'creator' ? 'No creator data found.' : 'No matching report rows.'}</td></tr>}
                    {loading && displayedReports.length === 0 && <tr><td className="empty-state" colSpan={columns.length}>Loading report…</td></tr>}
                  </tbody>
                </table>
              </div>
              {pagination && !hasDateRange && pagination.totalPages > 1 && (
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





export function AdminCampaignReports({ currentUser, refreshIndex }) {
  const [campaigns, setCampaigns] = useState([])
  const [adOpsCampaigns, setAdOpsCampaigns] = useState([])
  const [reportView, setReportView] = useState('all')
  const [reportPage, setReportPage] = useState(1)
  const [reportSearch, setReportSearch] = useState('')
  const [reportDate, setReportDate] = useState('all')
  const [reportRows, setReportRows] = useState([])
  const [reportTotal, setReportTotal] = useState(null)
  const [reportDateOptions, setReportDateOptions] = useState([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingAdOpsCampaigns, setLoadingAdOpsCampaigns] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)
  const [showData, setShowData] = useState(false)
  const [error, setError] = useState('')
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

  const summaryCampaigns = reportRows.map((row) => ({
    ...row,
    campaignName: row.campaignName || row.platform || row.campaign || '',
    campaignTime: row.campaignTime || row.reportTill || row.date || '',
  }))
  const summaryCampaignNames = new Set(summaryCampaigns.map((campaign) =>
    String(campaign.campaignName || '').trim().toLowerCase()
  ))
  const combinedCampaigns = [
    ...summaryCampaigns,
    ...campaigns.filter((campaign) =>
      !summaryCampaignNames.has(String(campaign.campaignName || campaign.platform || '').trim().toLowerCase())
    ),
    ...adOpsCampaigns,
  ]
  const searchedCampaigns = combinedCampaigns.filter((campaign) => {
    const text = `${campaign.campaignName || campaign.platform || ''} ${campaign.campaignTime || campaign.reportTill || ''}`.toLowerCase()
    return text.includes(reportSearch.toLowerCase())
  })
  const searchedReportRows = reportRows.filter((row) => {
    const values = Object.values(row).join(' ').toLowerCase()
    const matchesSearch = values.includes(reportSearch.toLowerCase())
    const rowDate = String(row.id ?? row.date ?? '')
    return matchesSearch && (reportDate === 'all' || rowDate === reportDate)
  })
  const adminTotalRows = activeReportView === 'all' ? searchedCampaigns.length : searchedReportRows.length
  const adminTotalPages = Math.max(1, Math.ceil(adminTotalRows / adminPageSize))
  const adminPageRows = (activeReportView === 'all' ? searchedCampaigns : searchedReportRows)
    .slice((reportPage - 1) * adminPageSize, reportPage * adminPageSize)
  const adminDates = reportDateOptions.length
    ? reportDateOptions
    : [...new Map(reportRows.filter((row) => row.date || row.id).map((row) => [
      row.id ?? row.date,
      { value: row.id ?? row.date, label: row.date ?? row.id },
    ])).values()]

  useEffect(() => {
    const controller = new AbortController()
    setLoadingCampaigns(true)
    fetch('/api/campaigns', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => [])
        if (!response.ok) throw new Error(data.message || 'Could not load campaigns.')
        return data
      })
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError('Could not load saved campaigns. Check the backend and database connection.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCampaigns(false)
      })
    return () => controller.abort()
  }, [refreshIndex])

  useEffect(() => {
    const controller = new AbortController()
    setLoadingAdOpsCampaigns(true)
    fetch('/api/ad-ops/campaigns', {
      headers: currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error?.message || data.message || 'Could not load Ad-ops campaigns.')
        return data
      })
      .then((data) => setAdOpsCampaigns(Array.isArray(data) ? data : []))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message || 'Could not load Ad-ops campaigns.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingAdOpsCampaigns(false)
      })
    return () => controller.abort()
  }, [currentUser?.token, refreshIndex])

  useEffect(() => {
    const controller = new AbortController()
    const apiView = activeReportView
    const adminEndpointByView = {
      all: '/api/admin/campaign-summary',
      'video-ott': '/api/admin/reports/video-ott',
      day: '/api/admin/reports/daywise',
      publisher: '/api/admin/reports/sitewise',
      gender: '/api/admin/reports/genderwise',
      age: '/api/admin/reports/agewise',
    }
    const params = new URLSearchParams({ date: reportDate, search: reportSearch, page: '1', pageSize: '50' })
    const headers = currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}
    setLoadingReport(true)
    setError('')

    async function loadReport() {
      let response
      let data
      const endpoint = adminEndpointByView[apiView]

      if (endpoint) {
        response = await fetch(`${endpoint}?${params}`, { headers, signal: controller.signal })
        data = await response.json().catch(() => ({}))
      }
      if (!endpoint || !response?.ok) {
        const fallbackParams = new URLSearchParams({ view: apiView, date: reportDate, search: reportSearch, page: '1', pageSize: '50' })
        response = await fetch(`/api/reports?${fallbackParams}`, { signal: controller.signal })
        data = await response.json().catch(() => ({}))
      }
      if (!response.ok) throw new Error(data?.error?.message || data?.message || 'Report could not be loaded.')
      if (controller.signal.aborted) return
      setReportRows(Array.isArray(data.reports) ? data.reports : [])
      setReportTotal(data.total ?? null)
      setReportDateOptions(Array.isArray(data.dates) ? data.dates.map((item) =>
        typeof item === 'string' ? { value: item, label: item } : item
      ) : [])
    }

    loadReport()
          .catch((requestError) => {
            if (requestError.name !== 'AbortError') {
              setReportRows([])
              setReportTotal(null)
              setReportDateOptions([])
              setError(requestError.message || 'Report could not be loaded.')
            }
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoadingReport(false)
          })

        return () => controller.abort()
      }, [activeReportView, reportDate, reportSearch, currentUser?.token])

      useEffect(() => {
        if (reportPage > adminTotalPages) setReportPage(adminTotalPages)
      }, [reportPage, adminTotalPages])

      async function exportAdminReport() {
        const exportTypeByView = {
          all: 'summary',
          'video-ott': 'video-ott',
          day: 'daywise',
          publisher: 'sitewise',
          gender: 'genderwise',
          age: 'agewise',
        }
        const exportType = exportTypeByView[activeReportView]
        if (!exportType) {
          window.location.assign(`/api/reports/export.csv?${new URLSearchParams({ view: activeReportView, date: reportDate, search: reportSearch })}`)
          return
        }

        const params = new URLSearchParams({ date: reportDate, search: reportSearch })
        const response = await fetch(`/api/admin/reports/${exportType}/export.csv?${params}`, {
          headers: currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          setError(errorData?.error?.message || 'CSV export failed. Please check your access and try again.')
          return
        }

        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = 'audience-delivery-report.csv'
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(objectUrl)
      }

      return (
        <section className="admin-entry-panel admin-data-panel" aria-labelledby="admin-data-heading">
          <div className="admin-panel-heading admin-report-heading">
            <h2 id="admin-data-heading">Campaign report</h2>
            <div className="admin-report-controls">
              <span>{loadingCampaigns || loadingAdOpsCampaigns ? 'Loading campaigns…' : `${combinedCampaigns.length} ${combinedCampaigns.length === 1 ? 'campaign' : 'campaigns'}`}</span>
              <button className="admin-view-button" type="button" onClick={() => setShowData((visible) => !visible)} aria-expanded={showData}>
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
                  <button className="export-button" type="button" onClick={exportAdminReport}>
                    <Download size={18} strokeWidth={2} />
                    <span>Export CSV</span>
                  </button>
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
                        {adminDates.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              </div>
              {error && <div className="error-banner" role="alert">{error}</div>}
              {activeReportView === 'all' && searchedCampaigns.length === 0 ? (
                <p className="admin-empty-state">{loadingCampaigns || loadingAdOpsCampaigns ? 'Loading saved campaigns…' : 'No campaign data yet. Fill in the form and select Submit.'}</p>
              ) : activeReportView !== 'all' && !loadingReport && searchedReportRows.length === 0 ? (
                <p className="admin-empty-state">No report data available for this view.</p>
              ) : (
                <>
                  <div className="table-scroll">
                    <table className={`report-table ${activeReportView}-table admin-campaign-table`}>
                      <thead>
                        <tr>{(activeReportView === 'all'
                          ? [
                            { key: 'campaignName', label: 'Campaign name', className: 'campaign-column' },
                            { key: 'campaignTime', label: 'Report time', className: 'date-column' },
                            { key: 'impressionTarget', label: 'Impression target' },
                            { key: 'clicksTarget', label: 'Clicks target' },
                            { key: 'reachTarget', label: 'Reach target' },
                            { key: 'viewsTarget', label: 'Views target' },
                          ]
                          : adminColumns
                        ).map((column) => <th className={column.className ?? ''} key={column.key} scope="col">{column.label}</th>)}</tr>
                      </thead>
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
                        <button type="button" onClick={() => setReportPage((page) => page - 1)} disabled={loadingReport || reportPage === 1} aria-label="Previous page" title="Previous page"><ChevronLeft size={18} aria-hidden="true" /></button>
                        <button type="button" onClick={() => setReportPage((page) => page + 1)} disabled={loadingReport || reportPage === adminTotalPages} aria-label="Next page" title="Next page"><ChevronRight size={18} aria-hidden="true" /></button>
                      </div>
                    </nav>
                  )}
                </>
              )}
            </>
          )}
        </section>
      )
    }
