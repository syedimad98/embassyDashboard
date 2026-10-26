import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

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

export default function CampaignDetailsForm({ currentUser, onCampaignSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)

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
      await saveCampaign({
        campaignName,
        campaignTime: form.campaignTime.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        impressionTarget: Number(form.impressionTarget) || 0,
        clicksTarget: Number(form.clicksTarget) || 0,
        reachTarget: Number(form.reachTarget) || 0,
        viewsTarget: Number(form.viewsTarget) || 0,
      })
      setForm(emptyForm)
      setMessage('Campaign details submitted successfully.')
      onCampaignSaved()
    } catch (submitError) {
      setMessage(submitError.message || 'Campaign could not be saved. Check the backend and database connection.')
    }
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
      for (const campaign of campaignsFromFile) await saveCampaign(campaign)
      setMessage(`${campaignsFromFile.length} campaign${campaignsFromFile.length === 1 ? '' : 's'} imported successfully from CSV.`)
      onCampaignSaved()
    } catch (uploadError) {
      setMessage(uploadError.message || 'Could not import the CSV file.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="admin-entry-panel" aria-labelledby="admin-form-heading">
      <div className="admin-panel-heading">
        <button
          type="button"
          className="admin-section-toggle"
          onClick={() => setIsExpanded((visible) => !visible)}
          aria-expanded={isExpanded}
          aria-controls="admin-campaign-form"
        >
          <h2 id="admin-form-heading">Campaign details</h2>
          {isExpanded ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
        </button>
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
      {isExpanded && (
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
            <button className="admin-reset-button" type="button" onClick={() => { setForm(emptyForm); setMessage('') }}>Reset</button>
          </div>
        </form>
      )}
    </section>
  )
}