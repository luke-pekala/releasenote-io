import 'dotenv/config'
import express    from 'express'
import cors       from 'cors'
import { createClient } from '@supabase/supabase-js'
import { generateRSS }  from './generateRSS.js'

// ── Supabase admin client (service role — server only) ────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const app     = express()
const PORT    = process.env.PORT || 4000
const APP_URL = process.env.APP_URL || 'http://localhost:5173'

// ── Middleware ────────────────────────────────────────────────────
// Allow localhost dev, vite preview, and the production APP_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  APP_URL,
].filter((v, i, a) => v && a.indexOf(v) === i) // deduplicate

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))
app.use(express.json())

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

// ── GET /api/entries — all published entries (public) ─────────────
app.get('/api/entries', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('id, title, version, content, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[GET /api/entries]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/admin/entries — all entries (authenticated users only) ─
app.get('/api/admin/entries', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[GET /api/admin/entries]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/entries — create new entry ──────────────────────────
app.post('/api/entries', async (req, res) => {
  const { title, content, version, is_published, published_at } = req.body

  if (!title || !content || !version) {
    return res.status(400).json({ error: 'title, content, and version are required.' })
  }

  try {
    const { data, error } = await supabase
      .from('entries')
      .insert([{ title, content, version, is_published: !!is_published, published_at }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('[POST /api/entries]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── PATCH /api/entries/:id — update entry ─────────────────────────
app.patch('/api/entries/:id', async (req, res) => {
  const { id } = req.params
  const updates = req.body

  try {
    const { data, error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[PATCH /api/entries/:id]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/entries/:id ───────────────────────────────────────
app.delete('/api/entries/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.status(204).end()
  } catch (err) {
    console.error('[DELETE /api/entries/:id]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /rss — RSS 2.0 feed of published entries ──────────────────
app.get('/rss', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('id, title, version, content, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const xml = generateRSS(data, {
      title:       process.env.APP_TITLE       || 'Product Changelog',
      link:        APP_URL,
      description: process.env.APP_DESCRIPTION || 'The latest updates and improvements.',
    })

    res.set('Content-Type', 'application/rss+xml; charset=utf-8')
    res.set('Cache-Control', 'public, max-age=300')
    res.send(xml)
  } catch (err) {
    console.error('[GET /rss]', err.message)
    res.status(500).send('<?xml version="1.0"?><error>RSS generation failed</error>')
  }
})

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🚀  ReleaseNote.io server`)
  console.log(`  ➜  Local:   http://localhost:${PORT}`)
  console.log(`  ➜  RSS:     http://localhost:${PORT}/rss`)
  console.log(`  ➜  Health:  http://localhost:${PORT}/api/health\n`)
})

export default app
