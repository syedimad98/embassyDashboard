import { useState } from 'react'
import { LogOut } from 'lucide-react'
import adBlissLogo from './assets/AdBliss Digita logo cov.jpg'
import embassyLogo from './assets/embassy-logo.png'
import './App.css'
import { AdminCampaignReports, ReportsDashboard } from './pages/CampaignReports'
import CampaignDetailsForm from './pages/CampaignDetailsForm'
import ClientDetailsForm from './pages/ClientDetailsForm'
import ScreenshotUploadPage from './pages/ScreenshotUploadPage'

function AdminDashboard({ currentUser, onLogout }) {
  const [campaignRefreshIndex, setCampaignRefreshIndex] = useState(0)

  return (
    <div className="app-shell">
      <header className="topbar admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img style={{ width: '60px', height: '60px' }} src={embassyLogo} alt="Embassy" />
          <span className="client-name">Embassy</span>
        </div>
        <div className="user-profile">
          <img className="avatar-logo" src={adBlissLogo} alt="AdBliss Digital" />
          <span className="user-copy">
            <strong>{currentUser?.email ? currentUser.email.split('@')[0] : 'Adbliss Digital'}</strong>
            <small>Admin</small>
          </span>
          <button className="logout-button" type="button" onClick={onLogout} aria-label="Log out" title="Log out">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <main id="admin-home" className="dashboard admin-dashboard">
        <section className="page-heading">
          <div>
            <h1>Adbliss Reporting Dashboard</h1>
            <p className="page-description">Enter campaign details and targets.</p>
          </div>
        </section>
        <CampaignDetailsForm
          currentUser={currentUser}
          onCampaignSaved={() => setCampaignRefreshIndex((value) => value + 1)}
        />
        <ClientDetailsForm currentUser={currentUser} />
        <AdminCampaignReports currentUser={currentUser} refreshIndex={campaignRefreshIndex} />
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

  if (window.location.pathname.endsWith('/upload-images')) {
    return <ScreenshotUploadPage />
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
