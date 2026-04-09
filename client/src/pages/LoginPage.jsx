import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function LoginPage() {
  const [mode, setMode]       = useState('login')  // 'login' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { login, register }   = useAuth()
  const navigate              = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        navigate('/dashboard')
      } else {
        await register(email, password)
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Top-right theme toggle */}
      <div style={{ position: 'fixed', top: '1rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>

      <div className="card login-card" style={{ animationDelay: '0.05s', animation: 'fade-up 0.35s var(--ease-out) both' }}>
        <div className="login-header">
          <Link to="/" className="brand" style={{ marginBottom: '1.25rem', display: 'flex', textDecoration: 'none' }}>
            <span className="brand-icon" style={{ marginRight: '0.5rem' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </span>
            <span className="brand-name">ReleaseNote.io</span>
          </Link>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p>{mode === 'login' ? 'Sign in to your dashboard.' : 'Start publishing your changelog.'}</p>
        </div>

        <form className="login-body" onSubmit={handleSubmit} noValidate>
          {message && (
            <div style={{
              padding: '0.625rem 0.875rem',
              background: 'var(--stat-score-bg)',
              color: 'var(--stat-score-fg)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              padding: '0.625rem 0.875rem',
              background: 'var(--danger-bg)',
              color: 'var(--danger-fg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'signup' ? 8 : undefined}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '2.25rem', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '1.5px' }} /> : null}
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <p className="login-footer">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}
