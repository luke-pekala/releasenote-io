import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { method, query, body } = req
  const id = query.id

  try {
    // GET /api/entries — public published entries
    if (method === 'GET' && !id) {
      const { data, error } = await supabase
        .from('entries')
        .select('id, title, version, content, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
      if (error) throw error
      return res.json(data)
    }

    // GET /api/entries?id=xxx — single entry
    if (method === 'GET' && id) {
      const { data, error } = await supabase
        .from('entries').select('*').eq('id', id).single()
      if (error) throw error
      return res.json(data)
    }

    // POST /api/entries — create
    if (method === 'POST') {
      const { title, content, version, is_published, published_at } = body
      if (!title || !content || !version)
        return res.status(400).json({ error: 'title, content, and version are required.' })
      const { data, error } = await supabase
        .from('entries')
        .insert([{ title, content, version, is_published: !!is_published, published_at }])
        .select().single()
      if (error) throw error
      return res.status(201).json(data)
    }

    // PATCH /api/entries?id=xxx — update
    if (method === 'PATCH' && id) {
      const { data, error } = await supabase
        .from('entries').update(body).eq('id', id).select().single()
      if (error) throw error
      return res.json(data)
    }

    // DELETE /api/entries?id=xxx — delete
    if (method === 'DELETE' && id) {
      const { error } = await supabase.from('entries').delete().eq('id', id)
      if (error) throw error
      return res.status(204).end()
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/entries]', err.message)
    res.status(500).json({ error: err.message })
  }
}
