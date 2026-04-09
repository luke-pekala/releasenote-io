import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import SiteHeader from '../components/SiteHeader.jsx'
import { useToast } from '../components/Toast.jsx'
import { getAllEntries, deleteEntry, updateEntry } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'

function DashboardInner() {
  const [entries, setEntries]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const toast    = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await getAllEntries()
      setEntries(data)
    } catch (err) {
      toast(`Failed to load entries: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await deleteEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))
      toast('Entry deleted.')
    } catch (err) {
      toast(`Delete failed: ${err.message}`)
    } finally {
      setDeleting(null)
    }
  }

  async function handleTogglePublish(entry) {
    const next = !entry.is_published
    try {
      const updated = await updateEntry(entry.id, {
        is_published: next,
        published_at: next ? new Date().toISOString() : entry.published_at,
      })
      setEntries(prev => prev.map(e => e.id === entry.id ? updated : e))
      toast(next ? 'Published! Now visible on the public page.' : 'Unpublished.')
    } catch (err) {
      toast(`Failed: ${err.message}`)
    }
  }

  const published = entries.filter(e => e.is_published).length
  const drafts    = entries.length - published

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />

      <div className="dashboard-layout">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-section-label">Navigation</div>

          <Link to="/dashboard" className="sidebar-item active">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            All Entries
          </Link>

          <Link to="/editor" className="sidebar-item">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Entry
          </Link>

          <Link to="/" className="sidebar-item" target="_blank">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Public Page
          </Link>

          <a href="/rss" className="sidebar-item" target="_blank">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/>
              <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none"/>
            </svg>
            RSS Feed
          </a>

          <div className="sidebar-spacer" />

          <div className="sidebar-section-label">Account</div>
          <div className="sidebar-item" style={{ cursor: 'default', opacity: 0.6 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </span>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="main-content">
          <div className="main-content-header">
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>Changelog Entries</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>
                {entries.length} total · {published} published · {drafts} draft{drafts !== 1 ? 's' : ''}
              </p>
            </div>
            <Link to="/editor" className="btn btn-primary">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Entry
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: entries.length, style: {} },
              { label: 'Published', value: published, style: { color: 'var(--stat-score-fg)', background: 'var(--stat-score-bg)' } },
              { label: 'Drafts',    value: drafts,     style: { color: 'var(--stat-warn-fg)',  background: 'var(--stat-warn-bg)' } },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '0.875rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: '90px', ...s.style }}>
                <span style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.65 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <span className="spinner" />
              </div>
            ) : entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--muted-foreground)', opacity: 0.5 }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ marginBottom: '0.75rem' }}>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p style={{ fontSize: '0.8125rem' }}>No entries yet.</p>
                <Link to="/editor" className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }}>
                  Create your first entry
                </Link>
              </div>
            ) : (
              <table className="entries-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id}>
                      <td>
                        <span className="table-title">{entry.title}</span>
                      </td>
                      <td>
                        <span className="table-version">{entry.version}</span>
                      </td>
                      <td>
                        <span className={`badge ${entry.is_published ? 'badge-published' : 'badge-draft'}`}>
                          {entry.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
                        {entry.published_at
                          ? format(new Date(entry.published_at), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className={`btn btn-sm ${entry.is_published ? 'btn-ghost' : 'btn-ghost'}`}
                            style={entry.is_published
                              ? { color: 'var(--stat-warn-fg)', borderColor: 'var(--stat-warn-bg)' }
                              : { color: 'var(--stat-score-fg)', borderColor: 'var(--stat-score-bg)' }
                            }
                            onClick={() => handleTogglePublish(entry)}
                            title={entry.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {entry.is_published ? 'Unpublish' : 'Publish'}
                          </button>

                          <Link
                            to={`/editor/${entry.id}`}
                            className="btn btn-ghost btn-sm"
                          >
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </Link>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(entry.id, entry.title)}
                            disabled={deleting === entry.id}
                          >
                            {deleting === entry.id
                              ? <span className="spinner" style={{ width: '11px', height: '11px', borderWidth: '1.5px' }} />
                              : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-.867 13.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
                                  <path d="M10 11v6M14 11v6"/>
                                </svg>
                            }
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return <DashboardInner />
}
