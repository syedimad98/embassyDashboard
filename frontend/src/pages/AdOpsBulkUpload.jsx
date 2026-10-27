import { useState } from 'react'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'

const workbookMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export default function AdOpsBulkUpload({ currentUser, onUploaded }) {
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function authHeaders() {
    return currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}
  }

  async function downloadTemplate() {
    setBusy('download')
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/ad-ops/campaigns/template.xlsx', {
        headers: authHeaders(),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error?.message || data.message || 'Could not download the Excel template.')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'adops-template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setMessage('Excel template downloaded.')
    } catch (requestError) {
      setError(requestError.message || 'Could not download the Excel template.')
    } finally {
      setBusy('')
    }
  }

  async function uploadTemplate(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('Select the downloaded Embassy Ad-ops .xlsx template. Other file formats are not supported.')
      setMessage('')
      return
    }

    setBusy('upload')
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/ad-ops/campaigns/bulk-upload', {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': workbookMimeType,
        },
        body: await file.arrayBuffer(),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error?.message || data.message || 'Could not upload the Excel template.')
      }
      setMessage(data.message || 'Excel data uploaded successfully.')
      onUploaded()
    } catch (requestError) {
      setError(requestError.message || 'Could not upload the Excel template.')
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="admin-entry-panel adops-bulk-upload" aria-labelledby="adops-bulk-upload-heading">
      <div className="admin-panel-heading">
        <div>
          <h2 id="adops-bulk-upload-heading">Bulk upload</h2>
          <p>Download the Excel template, fill in the report rows, then upload that template.</p>
        </div>
        <FileSpreadsheet size={22} aria-hidden="true" />
      </div>
      <div className="adops-bulk-upload-actions">
        <div className="adops-bulk-upload-action">
          <div>
            <strong>Download Excel template</strong>
            <span>Includes Summary and all report-type columns with field instructions.</span>
          </div>
          <button type="button" className="admin-submit-button" onClick={downloadTemplate} disabled={Boolean(busy)}>
            <Download size={16} aria-hidden="true" />
            {busy === 'download' ? 'Preparing…' : 'Download template'}
          </button>
        </div>
        <div className="adops-bulk-upload-action">
          <div>
            <strong>Upload completed template</strong>
            <span>Only the original Embassy .xlsx template with unchanged headers is accepted.</span>
          </div>
          <label className={`admin-submit-button adops-upload-label${busy ? ' is-disabled' : ''}`}>
            <Upload size={16} aria-hidden="true" />
            {busy === 'upload' ? 'Uploading…' : 'Choose template'}
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={uploadTemplate}
              disabled={Boolean(busy)}
            />
          </label>
        </div>
      </div>
      {error && <p className="authorization-message is-error" role="alert">{error}</p>}
      {message && <p className="authorization-message" role="status">{message}</p>}
    </section>
  )
}
