import { useEffect, useState } from 'react'
import { Download, ListFilter, LogOut, RefreshCw, Upload } from 'lucide-react'
import adBlissLogo from '../assets/AdBliss Digita logo cov.jpg'
import embassyLogo from '../assets/embassy-logo.png'
import CampaignDetailsForm from './CampaignDetailsForm'
import AdOpsReportInput from './AdOpsReportInput'
import AdOpsBulkUpload from './AdOpsBulkUpload'

const csvColumns = [
  ['reportType', 'Report type'],
  ['campaignName', 'Campaign name'],
  ['campaignTime', 'Campaign time'],
  ['startDate', 'Report start date'],
  ['endDate', 'End date'],
  ['date', 'Date'],
  ['gender', 'Gender'],
  ['ageGroup', 'Age group'],
  ['publisher', 'Publisher'],
  ['campaign', 'Campaign'],
  ['creator', 'Creator'],
  ['impressionTarget', 'Impression target'],
  ['impressionDelivered', 'Impression delivered'],
  ['impressions', 'Impressions'],
  ['clicksTarget', 'Clicks target'],
  ['clicksDelivered', 'Clicks delivered'],
  ['clicks', 'Clicks'],
  ['ctr', 'CTR (%)'],
  ['actualCtr', 'Actual CTR'],
  ['deliveredCtr', 'Delivered CTR'],
  ['reachTarget', 'Reach target'],
  ['reachDelivered', 'Reach delivered'],
  ['reach', 'Reach'],
  ['viewsTarget', 'Views target'],
  ['views', 'Views'],
  ['viewsDelivered', 'Views delivered'],
  ['spend', 'Spend'],
  ['totalBudget', 'Total budget'],
  ['totalSpend', 'Total spend'],
]

const reportTypes = [
  ['all', 'Summary'],
  ['video-ott', 'Video-wise'],
  ['day', 'Day-wise'],
  ['gender', 'Gender-wise'],
  ['age', 'Age-wise'],
  ['publisher', 'Publisher-wise'],
  ['creator', 'Creator-wise'],
]

function escapeCsvValue(value) {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export default function AdOpsDashboard({ currentUser, onLogout }) {
  const [campaigns, setCampaigns] = useState([])
  const [reportType, setReportType] = useState('all')
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/ad-ops/campaigns', {
      headers: currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error?.message || data.message || 'Could not load Ad-ops campaigns.')
        return data
      })
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message || 'Could not load Ad-ops campaigns.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [currentUser?.token, refreshIndex])

  function exportCampaigns() {
    const csv = [
      csvColumns.map(([, label]) => escapeCsvValue(label)).join(','),
      ...campaigns.map((campaign) => csvColumns
        .map(([key]) => escapeCsvValue(campaign[key]))
        .join(',')),
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'ad-ops-campaigns.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function refreshCampaigns() {
    setLoading(true)
    setError('')
    setRefreshIndex((value) => value + 1)
  }

  return (
    <div className="app-shell">
      <header className="topbar admin-topbar">
        <div className="adops-brand">
          <img src={embassyLogo} alt="Embassy" />
          <span className="client-name">Embassy</span>
        </div>
        <div className="user-profile">
          <img className="avatar-logo" src={adBlissLogo} alt="AdBliss Digital" />
          <span className="user-copy">
            <strong>{currentUser?.email ? currentUser.email.split('@')[0] : 'Adbliss Digital'}</strong>
            <small>Ad-ops</small>
          </span>
          <button className="logout-button" type="button" onClick={onLogout} aria-label="Log out" title="Log out">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <main className="dashboard admin-dashboard adops-dashboard">
        <section className="page-heading">
          <div>
            <h1>Adbliss Reporting Dashboard</h1>
            <p className="page-description">Select a report type to enter and submit its data.</p>
          </div>
          <div className="heading-actions">
            <button
              type="button"
              className="upload-images-btn"
              onClick={() => window.open('/embassy-dashboard/upload-images', '_blank', 'noopener,noreferrer')}
            >
              <Upload size={18} aria-hidden="true" />
              Upload Screenshots
            </button>
            <button
              className={`icon-button${loading ? ' is-refreshing' : ''}`}
              type="button"
              onClick={refreshCampaigns}
              aria-label="Refresh campaigns"
              title="Refresh campaigns"
              disabled={loading}
            >
              <RefreshCw size={22} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button className="export-button" type="button" onClick={exportCampaigns} disabled={loading || campaigns.length === 0}>
              <Download size={21} strokeWidth={2} aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </section>
        <p className="adops-campaign-status" aria-live="polite">
          {loading
            ? 'Loading your campaigns…'
            : `${campaigns.length} ${campaigns.length === 1 ? 'campaign' : 'campaigns'} available for editing and export.`}
        </p>
       
        <AdOpsBulkUpload currentUser={currentUser} onUploaded={refreshCampaigns} />
        <section className="adops-report-type-panel" aria-label="Select report type for data entry">
          <label className="select-control adops-report-type-select">
            <ListFilter size={19} aria-hidden="true" />
            <span className="visually-hidden">Select report type for input fields</span>
            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
            >
              {reportTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        </section>
        {reportType === 'all' ? (
          <CampaignDetailsForm
            currentUser={currentUser}
            apiEndpoint="/api/ad-ops/campaigns"
            allowEditing
            sectionTitle="Summary details"
            savedCampaigns={campaigns.filter((campaign) => !campaign.reportType)}
            onCampaignSaved={refreshCampaigns}
          />
        ) : (
          <AdOpsReportInput
            reportType={reportType}
            currentUser={currentUser}
            onSaved={refreshCampaigns}
          />
        )}
      </main>
    </div>
  )
}
