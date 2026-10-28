import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Browser-side Supabase client for real-time subscriptions
// Uses the anon key which is safe to expose to the browser
export const supabaseBrowser = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'sentinel',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
