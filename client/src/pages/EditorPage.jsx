import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import RichEditor from '../components/RichEditor.jsx'
import { useToast } from '../components/Toast.jsx'
import { createEntry, updateEntry, getEntry } from '../lib/supabase.js'

function EditorInner() {
  const { id }       = useParams()
  const isEdit       = Boolean(id)
  const navigate     = useNavigate()
  const toast        = useToast()

  const [title,    setTitle]    = useState('')
  const [version,  setVersion]  = useState('')
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0])
  const [content,  setContent]  = useState('')
  const [published, setPublished] = useState(false)
  const [loading,  setLoading]  = useState(isEdit)
  const [saving,   setSaving]   = useState(false)
  const [errors,   setErrors]   = useState({})

  // Load existing entry for editing
  useEffect(() => {
    if (!isEdit) return
    getEntry(id)
      .then(entry => {
        setTitle(entry.title)
        setVersion(entry.version)
        setDate(entry.published_at
          ? new Date(entry.published_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0])
        setContent(entry.content)
        setPublished(entry.is_published)
      })
      .catch(err => {
        toast(`Failed to load entry: ${err.message}`)
        navigate('/dashboard')
      })
      .finally(() => setLoading(false))
  }, [id])

  function validate() {
    const e = {}
    if (!title.trim())   e.title   = 'Title is required.'
    if (!version.trim()) e.version = 'Version is required.'
    if (!content || content === '<p></p>') e.content = 'Content is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave(publish = null) {
    if (!validate()) return

    setSaving(true)
    const shouldPublish = publish !== null ? publish : published

    const payload = {
      title:        title.trim(),
      version:      version.trim(),
      content,
      is_published: shouldPublish,
      published_at: shouldPublish ? new Date(date + 'T12:00:00').toISOString() : null,
    }

    try {
      if (isEdit) {
        await updateEntry(id, payload)
        toast(shouldPublish ? 'Updated and published!' : 'Draft saved.')
      } else {
        await createEntry(payload)
        toast(shouldPublish ? 'Published to your changelog!' : 'Saved as draft.')
      }
      navigate('/dashboard')
    } catch (err) {
      toast(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <SiteHeader />
        <div className="loading-screen"><span className="spinner" /></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />

      <div className="editor-page">
        <div className="container--narrow">

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back
            </Link>
            <div>
              <h2 style={{ marginBottom: '0.1rem' }}>{isEdit ? 'Edit entry' : 'New entry'}</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                {isEdit ? 'Update your release note.' : 'Write a new changelog entry.'}
              </p>
            </div>
          </div>

          <div className="editor-form">

            {/* Meta row */}
            <div className="editor-row">
              <div className="form-group">
                <label className="form-label" htmlFor="e-title">Title</label>
                <input
                  id="e-title"
                  className={`form-input${errors.title ? ' form-input--error' : ''}`}
                  style={errors.title ? { borderColor: 'var(--danger-fg)' } : {}}
                  type="text"
                  placeholder="What shipped in this release?"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })) }}
                  autoFocus={!isEdit}
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="e-version">Version</label>
                <input
                  id="e-version"
                  className={`form-input${errors.version ? ' form-input--error' : ''}`}
                  style={errors.version ? { borderColor: 'var(--danger-fg)' } : {}}
                  type="text"
                  placeholder="v1.2.3"
                  value={version}
                  onChange={e => { setVersion(e.target.value); setErrors(p => ({ ...p, version: '' })) }}
                  autoComplete="off"
                />
                {errors.version && <span className="form-error">{errors.version}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="e-date">Date</label>
                <input
                  id="e-date"
                  className="form-input"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Rich text editor */}
            <div className="form-group">
              <label className="form-label">Content</label>
              <RichEditor
                content={content}
                onChange={html => { setContent(html); setErrors(p => ({ ...p, content: '' })) }}
                placeholder="Describe what changed, what was fixed, and what was added…"
              />
              {errors.content && <span className="form-error">{errors.content}</span>}
            </div>

            {/* Actions */}
            <div className="editor-actions">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${published ? 'badge-published' : 'badge-draft'}`}>
                  {published ? 'Published' : 'Draft'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  {published
                    ? 'Visible on your public changelog'
                    : 'Not yet visible to the public'}
                </span>
              </div>

              <div className="editor-actions-right">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  {saving && !published
                    ? <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
                    : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                  }
                  Save draft
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  {saving && published
                    ? <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px', borderTopColor: 'var(--primary-foreground)' }} />
                    : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                  }
                  {published ? 'Update & publish' : 'Publish'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditorPage() {
  return <EditorInner />
}
