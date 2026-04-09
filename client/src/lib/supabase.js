import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Auth ──────────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ── Entries ───────────────────────────────────────────────────────

/** Fetch all published entries (public) */
export async function getPublishedEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

/** Fetch ALL entries (admin dashboard — requires auth) */
export async function getAllEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Fetch a single entry by id */
export async function getEntry(id) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

/** Insert a new entry */
export async function createEntry(entry) {
  const { data, error } = await supabase
    .from('entries')
    .insert([entry])
    .select()
    .single()
  if (error) throw error
  return data
}

/** Patch an existing entry */
export async function updateEntry(id, updates) {
  const { data, error } = await supabase
    .from('entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Delete an entry */
export async function deleteEntry(id) {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}