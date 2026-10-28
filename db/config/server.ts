import { supabaseUrl } from '@/constants'
import { supabaseServiceRoleKey } from '@/lib/server/credentials'
import { Database } from '@/lib/database.types'
import { createClient } from '@supabase/supabase-js'

export const supabaseServiceClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  db: {
    schema: 'sentinel',
  },
})
