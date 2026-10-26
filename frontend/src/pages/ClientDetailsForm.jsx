import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const emptyClientForm = {
  name: '',
  address: '',
  email: '',
  phoneNo: '',
}

export default function ClientDetailsForm({ currentUser }) {
  const [clientForm, setClientForm] = useState(emptyClientForm)
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)

  function updateField(event) {
    const { name, value } = event.target
    setClientForm((current) => ({ ...current, [name]: value }))
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const clientData = {
      name: clientForm.name.trim(),
      address: clientForm.address.trim(),
      email: clientForm.email.trim().toLowerCase(),
      phoneNo: clientForm.phoneNo.trim(),
    }

    if (!clientData.name || !clientData.address || !clientData.email || !clientData.phoneNo) {
      setMessage('Please fill in all client details.')
      return
    }

    try {
      setMessage('Saving client details...')
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
        },
        body: JSON.stringify(clientData),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Failed to save client details.')

      setMessage(result.message || 'Client details saved successfully.')
      setClientForm(emptyClientForm)
    } catch (error) {
      console.error('Error saving client details:', error)
      setMessage(error.message || 'Unable to save client details. Please check the backend connection.')
    }
  }

  return (
    <section className="admin-entry-panel" aria-labelledby="admin-client-heading">
      <div className="admin-panel-heading">
        <button
          type="button"
          className="admin-section-toggle"
          onClick={() => setIsExpanded((visible) => !visible)}
          aria-expanded={isExpanded}
          aria-controls="admin-client-form"
        >
          <h2 id="admin-client-heading">Client details</h2>
          {isExpanded ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
        </button>
      </div>
      {isExpanded && (
        <form id="admin-client-form" className="admin-campaign-form" onSubmit={handleSubmit}>
          <div className="admin-detail-fields admin-client-fields">
            <label className="admin-inline-field">
              <span>Name</span>
              <input type="text" name="name" value={clientForm.name} onChange={updateField} placeholder="Enter client name" required />
            </label>
            <label className="admin-inline-field">
              <span>Address</span>
              <input type="text" name="address" value={clientForm.address} onChange={updateField} placeholder="Enter address" required />
            </label>
            <label className="admin-inline-field">
              <span>Email</span>
              <input type="email" name="email" value={clientForm.email} onChange={updateField} placeholder="Enter email address" required />
            </label>
            <label className="admin-inline-field">
              <span>PhoneNo</span>
              <input type="tel" name="phoneNo" value={clientForm.phoneNo} onChange={updateField} placeholder="Enter phone number" required />
            </label>
          </div>
          {message && <p className="admin-form-message" role="status">{message}</p>}
          <div className="admin-form-actions">
            <button className="admin-submit-button" type="submit">Submit</button>
            <button className="admin-reset-button" type="button" onClick={() => { setClientForm(emptyClientForm); setMessage('') }}>Reset</button>
          </div>
        </form>
      )}
    </section>
  )
}