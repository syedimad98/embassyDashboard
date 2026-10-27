import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Save, Users } from 'lucide-react'

export default function UserAuthorizationAccess({ currentUser }) {
  const [users, setUsers] = useState([])
  const [clients, setClients] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedClients, setSelectedClients] = useState([])
  const [allClients, setAllClients] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadAccess = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/user-access', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error?.message || data.message || 'Could not load user access settings.')
      setUsers(Array.isArray(data.users) ? data.users : [])
      setClients(Array.isArray(data.clients) ? data.clients : [])
      setSelectedUsers([])
      setSelectedClients([])
      setAllClients(false)
    } catch (requestError) {
      setError(requestError.message || 'Could not load user access settings.')
    } finally {
      setLoading(false)
    }
  }, [currentUser.token])

  useEffect(() => {
    void Promise.resolve().then(loadAccess)
  }, [loadAccess])

  function refreshAccess() {
    setLoading(true)
    setError('')
    setMessage('')
    void loadAccess()
  }

  function toggleUser(user) {
    const alreadySelected = selectedUsers.includes(user.id)
    const nextUsers = alreadySelected
      ? selectedUsers.filter((id) => id !== user.id)
      : [...selectedUsers, user.id]

    setSelectedUsers(nextUsers)
    setMessage('')
    if (nextUsers.length === 1 && !alreadySelected) {
      setAllClients(user.allClients)
      setSelectedClients(user.clientIds)
    }
  }

  function toggleAllUsers() {
    const nextUsers = selectedUsers.length === users.length ? [] : users.map((user) => user.id)
    setSelectedUsers(nextUsers)
    setMessage('')
    if (nextUsers.length > 1 || nextUsers.length === 0) {
      setAllClients(false)
      setSelectedClients([])
    } else {
      const user = users.find((item) => item.id === nextUsers[0])
      setAllClients(user?.allClients === true)
      setSelectedClients(user?.clientIds || [])
    }
  }

  function toggleClient(clientId) {
    setSelectedClients((selected) => selected.includes(clientId)
      ? selected.filter((id) => id !== clientId)
      : [...selected, clientId])
    setAllClients(false)
    setMessage('')
  }

  function toggleAllClients() {
    const shouldSelectAll = !allClients
    setAllClients(shouldSelectAll)
    setSelectedClients(shouldSelectAll ? clients.map((client) => client.id) : [])
    setMessage('')
  }

  async function saveAccess() {
    if (!selectedUsers.length) {
      setError('Select at least one Ad-ops user.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const results = await Promise.all(selectedUsers.map(async (userId) => {
        const response = await fetch(`/api/admin/user-access/${encodeURIComponent(userId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ allClients, clientIds: allClients ? [] : selectedClients }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error?.message || data.message || 'Could not save an access assignment.')
        return data
      }))
      const updates = new Map(results.map(({ userId, clientAccess }) => [userId, clientAccess]))
      setUsers((existing) => existing.map((user) => {
        const access = updates.get(user.id)
        return access ? { ...user, ...access } : user
      }))
      setMessage(`Client access saved for ${selectedUsers.length} Ad-ops user${selectedUsers.length === 1 ? '' : 's'}.`)
    } catch (saveError) {
      setError(saveError.message || 'Could not save user access settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-entry-panel authorization-panel" aria-labelledby="authorization-heading">
      <div className="admin-panel-heading">
        <div>
          <h2 id="authorization-heading">User authorization access</h2>
          <p className="authorization-intro">Choose which clients each Ad-ops account is allowed to access.</p>
        </div>
        <button className="authorization-refresh" type="button" onClick={refreshAccess} disabled={loading || saving} aria-label="Refresh access list">
          <RefreshCw size={17} aria-hidden="true" />
          Refresh
        </button>
      </div>
      {error && <p className="authorization-message is-error" role="alert">{error}</p>}
      {message && <p className="authorization-message" role="status">{message}</p>}
      {loading ? (
        <p className="authorization-empty">Loading users and clients…</p>
      ) : users.length === 0 ? (
        <p className="authorization-empty">No Ad-ops accounts are registered yet.</p>
      ) : (
        <div className="authorization-content">
          <section className="authorization-user-list" aria-labelledby="authorization-users-heading">
            <div className="authorization-section-heading">
              <h3 id="authorization-users-heading">Ad-ops users</h3>
              <label className="authorization-select-all">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={toggleAllUsers}
                  aria-label="Select all Ad-ops users"
                />
                Select all
              </label>
            </div>
            {users.map((user) => (
              <label className={`authorization-user${selectedUsers.includes(user.id) ? ' is-selected' : ''}`} key={user.id}>
                <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUser(user)} />
                <span className="authorization-user-copy">
                  <strong>{user.email}</strong>
                  <small>{user.allClients ? 'All clients' : `${user.clientIds.length} client${user.clientIds.length === 1 ? '' : 's'} assigned`}</small>
                </span>
              </label>
            ))}
          </section>

          <section className="authorization-client-list" aria-labelledby="authorization-clients-heading">
            <div className="authorization-section-heading">
              <div>
                <h3 id="authorization-clients-heading">Client access</h3>
                <p>{selectedUsers.length ? `Applying to ${selectedUsers.length} selected user${selectedUsers.length === 1 ? '' : 's'}.` : 'Select one or more users first.'}</p>
              </div>
              <label className="authorization-all-clients">
                <input
                  type="checkbox"
                  checked={allClients}
                  disabled={!selectedUsers.length}
                  onChange={toggleAllClients}
                />
                All clients
              </label>
            </div>
            {clients.length === 0 ? (
              <p className="authorization-empty">No clients have been added yet.</p>
            ) : (
              <div className="authorization-client-options">
                {clients.map((client) => (
                  <label className="authorization-client-option" key={client.id}>
                    <input
                      type="checkbox"
                      checked={allClients || selectedClients.includes(client.id)}
                      disabled={!selectedUsers.length || allClients}
                      onChange={() => toggleClient(client.id)}
                    />
                    <span><strong>{client.name}</strong><small>{client.email}</small></span>
                  </label>
                ))}
              </div>
            )}
            <button className="admin-submit-button authorization-save" type="button" onClick={saveAccess} disabled={!selectedUsers.length || saving || loading}>
              {saving ? <><RefreshCw size={16} className="authorization-spinner" /> Saving…</> : <><Save size={16} /> Save access</>}
            </button>
          </section>
        </div>
      )}
      {!loading && users.length > 0 && (
        <p className="authorization-footnote"><Users size={15} aria-hidden="true" /> Assigning access updates permissions for selected Ad-ops accounts.</p>
      )}
    </section>
  )
}
