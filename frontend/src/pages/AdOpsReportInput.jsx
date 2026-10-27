import { useState } from 'react'
import { Save } from 'lucide-react'

const reportInputFields = {
  'video-ott': [
    { key: 'date', label: 'Date', type: 'date', required: true },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'ctr', label: 'CTR (%)', type: 'number', step: 'any' },
    { key: 'reach', label: 'Reach', type: 'number' },
    { key: 'views', label: 'Views', type: 'number' },
    { key: 'spend', label: 'Spend', type: 'number', step: 'any' },
  ],
  day: [
    { key: 'date', label: 'Date', type: 'date', required: true },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'ctr', label: 'CTR (%)', type: 'number', step: 'any' },
    { key: 'reach', label: 'Reach', type: 'number' },
    { key: 'spend', label: 'Spend', type: 'number', step: 'any' },
  ],
  gender: [
    { key: 'gender', label: 'Gender', type: 'text', required: true, placeholder: 'e.g. Female' },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'ctr', label: 'CTR (%)', type: 'number', step: 'any' },
    { key: 'reach', label: 'Reach', type: 'number' },
  ],
  age: [
    { key: 'ageGroup', label: 'Age group', type: 'text', required: true, placeholder: 'e.g. 25-34' },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'ctr', label: 'CTR (%)', type: 'number', step: 'any' },
    { key: 'reach', label: 'Reach', type: 'number' },
  ],
  publisher: [
    { key: 'publisher', label: 'Publisher', type: 'text', required: true, placeholder: 'Enter publisher name' },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'ctr', label: 'CTR (%)', type: 'number', step: 'any' },
    { key: 'reach', label: 'Reach', type: 'number' },
  ],
  creator: [
    { key: 'campaign', label: 'Campaign', type: 'text', required: true, placeholder: 'Enter campaign name' },
    { key: 'creator', label: 'Creator', type: 'text', required: true, placeholder: 'Enter creator name' },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'ctr', label: 'CTR (%)', type: 'number', step: 'any' },
    { key: 'reach', label: 'Reach', type: 'number' },
  ],
}

const reportTitles = {
  'video-ott': 'Video-wise report details',
  day: 'Day-wise report details',
  gender: 'Gender-wise report details',
  age: 'Age-wise report details',
  publisher: 'Publisher-wise report details',
  creator: 'Creator-wise report details',
}

export default function AdOpsReportInput({ reportType, currentUser, onSaved }) {
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fields = reportInputFields[reportType] || []

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/ad-ops/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
        },
        body: JSON.stringify({ reportType, ...values }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error?.message || result.message || 'Report details could not be submitted.')
      }
      setValues({})
      setMessage('Report details submitted successfully.')
      onSaved()
    } catch (submitError) {
      setMessage(submitError.message || 'Report details could not be submitted.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-entry-panel adops-report-input" aria-labelledby="adops-report-input-heading">
      <div className="admin-panel-heading">
        <h2 id="adops-report-input-heading">{reportTitles[reportType]}</h2>
      </div>
      <form className="admin-campaign-form" onSubmit={submit}>
        <div className="admin-detail-fields">
          {fields.map((field) => (
            <label className="admin-inline-field" key={field.key}>
              <span>{field.label}</span>
              <input
                type={field.type}
                min={field.type === 'number' ? '0' : undefined}
                step={field.step}
                name={field.key}
                value={values[field.key] || ''}
                onChange={(event) => {
                  setValues((current) => ({ ...current, [field.key]: event.target.value }))
                  setMessage('')
                }}
                placeholder={field.placeholder}
                required={field.required}
              />
            </label>
          ))}
        </div>
        {message && (
          <p className={`admin-form-message${message.includes('could not') ? ' is-error' : ''}`} role="status">
            {message}
          </p>
        )}
        <div className="admin-form-actions">
          <button className="admin-submit-button" type="submit" disabled={saving}>
            <Save size={16} aria-hidden="true" />
            {saving ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </section>
  )
}
