import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function SiteHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container inner">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <span className="brand-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9"  x2="8" y2="9"/>
            </svg>
          </span>
          <div>
            <div className="brand-name">ReleaseNote.io</div>
            <div className="brand-tagline">Beautiful public changelogs</div>
          </div>
        </Link>

        <div className="header-right">
          <ThemeToggle />

          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}
