/**
 * generateRSS(entries, meta)
 * Returns a valid RSS 2.0 XML string from an array of changelog entries.
 *
 * @param {Array}  entries - Array of entry objects from Supabase
 * @param {Object} meta    - { title, link, description }
 * @returns {string} RSS 2.0 XML
 */
export function generateRSS(entries, meta = {}) {
  const {
    title       = 'Product Changelog',
    link        = 'https://example.com',
    description = 'Latest updates, fixes, and new features.',
  } = meta

  const buildDate = new Date().toUTCString()

  function escXml(str) {
    if (!str) return ''
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&apos;')
  }

  function wrapCdata(str) {
    // CDATA lets us include raw HTML without escaping
    return `<![CDATA[${str || ''}]]>`
  }

  const items = entries.map(entry => {
    const pubDate = entry.published_at
      ? new Date(entry.published_at).toUTCString()
      : buildDate

    const entryLink = `${link}#${entry.version || entry.id}`

    return `
    <item>
      <title>${escXml(entry.title)}</title>
      <link>${escXml(entryLink)}</link>
      <guid isPermaLink="false">${escXml(entry.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${wrapCdata(entry.content)}</description>
      <version>${escXml(entry.version)}</version>
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
