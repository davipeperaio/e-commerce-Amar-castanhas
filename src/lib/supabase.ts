import { createClient } from '@supabase/supabase-js'

let rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const normalizedUrl = rawUrl && !/^https?:\/\//i.test(rawUrl) ? `https://${rawUrl}` : rawUrl
export const SUPABASE_URL = normalizedUrl
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = isSupabaseEnabled
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null
