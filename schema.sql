-- ═══════════════════════════════════════════════════════════
--  ReleaseNote.io — Supabase SQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- ── 1. ENTRIES TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS entries (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT        NOT NULL,
  content      TEXT        NOT NULL,
  version      TEXT        NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NULL,
  is_published BOOLEAN     DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for common query pattern
CREATE INDEX IF NOT EXISTS entries_is_published_published_at
  ON entries (is_published, published_at DESC);


-- ── 2. ROW LEVEL SECURITY ─────────────────────────────────
--  Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

--  Public can READ published entries only
CREATE POLICY "Public can view published entries"
  ON entries
  FOR SELECT
  USING (is_published = true);

--  Authenticated users can READ all entries (drafts + published)
CREATE POLICY "Authenticated users can view all entries"
  ON entries
  FOR SELECT
  TO authenticated
  USING (true);

--  Authenticated users can INSERT
CREATE POLICY "Authenticated users can insert entries"
  ON entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

--  Authenticated users can UPDATE
CREATE POLICY "Authenticated users can update entries"
  ON entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

--  Authenticated users can DELETE
CREATE POLICY "Authenticated users can delete entries"
  ON entries
  FOR DELETE
  TO authenticated
  USING (true);


-- ── 3. SEED DATA (optional — remove before production) ────
INSERT INTO entries (title, content, version, is_published, published_at)
VALUES
(
  'Initial release',
  '<h2>🚀 We''re live!</h2><p>Welcome to our first public release. Here''s what''s included:</p><ul><li>Full changelog editor with rich text support</li><li>Public-facing changelog page</li><li>RSS feed for subscribers</li></ul>',
  'v1.0.0',
  true,
  NOW() - INTERVAL '7 days'
),
(
  'Performance improvements and bug fixes',
  '<h2>Improvements</h2><ul><li>Faster page load times across the board</li><li>Fixed an issue where published entries could appear out of order</li></ul><h2>Bug fixes</h2><ul><li>Resolved editor crash on empty content save</li><li>Fixed date formatting on public page</li></ul>',
  'v1.0.1',
  true,
  NOW() - INTERVAL '2 days'
);
