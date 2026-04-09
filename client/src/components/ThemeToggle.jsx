import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('rn-theme') || 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('rn-theme', theme)
  }, [theme])

  return (
    <button
      className="btn-icon"
      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {/* Sun */}
      <svg className="icon-sun" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
      {/* Moon */}
      <svg className="icon-moon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <span>
        <span className="label-dark">Dark</span>
        <span className="label-light">Light</span>
      </span>
    </button>
  )
}
