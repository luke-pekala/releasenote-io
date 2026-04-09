import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import SiteHeader from '../components/SiteHeader.jsx'
import { getPublishedEntries } from '../lib/supabase.js'

export default function PublicChangelog() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getPublishedEntries()
      .then(setEntries)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="changelog-page">
      <SiteHeader />

      <div className="changelog-hero">
        <div className="container changelog-hero-inner">
          <div>
            <h1>What's new</h1>
            <p>Every update, improvement, and fix — documented for you.</p>
          </div>
          <div className="changelog-hero-meta">
            <a
              href="/rss"
              className="rss-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RSS feed"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 11a9 9 0 0 1 9 9"/>
                <path d="M4 4a16 16 0 0 1 16 16"/>
                <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none"/>
              </svg>
              RSS Feed
            </a>
          </div>
        </div>
      </div>

      <div className="changelog-feed">
        <div className="container--narrow">
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <span className="spinner" />
            </div>
          )}

          {error && (
            <div className="changelog-empty">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>Couldn't load entries. {error}</p>
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="changelog-empty">
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p>No releases published yet. Check back soon.</p>
            </div>
          )}

          {!loading && !error && entries.map((entry, i) => (
            <article
              key={entry.id}
              className="entry-block"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="entry-meta">
                <div className="entry-version">{entry.version}</div>
                <div className="entry-date">
                  {entry.published_at
                    ? format(new Date(entry.published_at), 'MMM d, yyyy')
                    : ''}
                </div>
              </div>

              <div className="entry-body">
                <h2 className="entry-title">{entry.title}</h2>
                <div
                  className="rich-content"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '1rem 0',
          fontSize: '0.6875rem',
          color: 'var(--muted-foreground)',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}>
          <span>Powered by ReleaseNote.io</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
