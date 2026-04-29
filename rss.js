import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function escXml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;')
}

function generateRSS(entries, meta = {}) {
  const {
    title       = process.env.APP_TITLE       || 'Product Changelog',
    link        = process.env.APP_URL         || 'https://releasenote-io.vercel.app',
    description = process.env.APP_DESCRIPTION || 'The latest updates and improvements.',
  } = meta

  const buildDate = new Date().toUTCString()

  const items = entries.map(entry => {
    const pubDate   = entry.published_at ? new Date(entry.published_at).toUTCString() : buildDate
    const entryLink = `${link}#${entry.version || entry.id}`
    return `
    <item>
      <title>${escXml(entry.title)}</title>
      <link>${escXml(entryLink)}</link>
      <guid isPermaLink="false">${escXml(entry.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${entry.content || ''}]]></description>
    </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(title)}</title>
    <link>${escXml(link)}</link>
    <description>${escXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escXml(link)}/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`
}

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('id, title, version, content, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const xml = generateRSS(data)

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.send(xml)
  } catch (err) {
    console.error('[RSS]', err.message)
    res.status(500).send('<?xml version="1.0"?><error>RSS generation failed</error>')
  }
}
