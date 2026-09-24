import { supabaseServiceRoleKey, supabaseUrl } from '@/constants'
import { Database } from '@/lib/database.types'
import { createClient } from '@supabase/supabase-js'

export const supabaseServiceClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  db: {
    schema: 'sentinel',
  },
})
